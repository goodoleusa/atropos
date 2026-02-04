import { Router, Request, Response } from "express";
import { atroposService, type AtroposScanParams, type AtroposScanResult } from "../services/atropos";
import { storage } from "../storage";
import { logSessionInteraction } from "../services/osint";
import { nanoid } from "nanoid";

const router = Router();

// ============ Health Check ============

router.get("/health", async (req: Request, res: Response) => {
  try {
    const binaryCheck = await atroposService.checkBinary();
    res.json({
      status: binaryCheck.available ? "ok" : "error",
      binary: {
        available: binaryCheck.available,
        path: binaryCheck.path,
        error: binaryCheck.error
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Scripts Management ============

// List available scripts
router.get("/scripts", async (req: Request, res: Response) => {
  try {
    const scripts = await atroposService.listScripts();
    res.json(scripts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get script content
router.get("/scripts/:scriptId", async (req: Request, res: Response) => {
  try {
    const scriptId = req.params.scriptId as string;
    const result = await atroposService.getScript(scriptId);
    
    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Scan Execution ============

// Execute scan
router.post("/scan", async (req: Request, res: Response) => {
  try {
    const { scriptPath, target, outputPath, sessionToken, investigationId, source } = req.body;
    
    if (!scriptPath || !target) {
      return res.status(400).json({ 
        error: "scriptPath and target are required" 
      });
    }
    
    const params: AtroposScanParams = {
      scriptPath,
      target,
      outputPath,
      sessionToken,
      investigationId,
      source: source || 'manual'
    };
    
    // Log interaction if session provided
    if (sessionToken) {
      await logSessionInteraction({
        sessionToken,
        investigationId,
        actionType: 'tool_call',
        source: source === 'terminal' ? 'terminal' : 
                source === 'chat' ? 'agent_chat' : 
                source === 'campaign' ? 'campaign' : 'ai_lab',
        input: { toolKey: 'atropos', scriptPath, target },
        metadata: { scanType: 'atropos' }
      });
    }
    
    const result = await atroposService.executeScript(params);
    
    // Update investigation with findings if successful
    if (result.success && investigationId && result.data) {
      try {
        const investigation = await storage.getInvestigationById(investigationId);
        if (investigation) {
          // Extract findings from scan results
          const findings = extractFindingsFromScan(result.data, scriptPath);
          
          if (findings.length > 0) {
            const updatedFindings = [...(investigation.findings || []), ...findings];
            const toolsUsedSet = new Set([...(investigation.toolsUsed || []), 'atropos']);
            await storage.updateInvestigation(investigationId, {
              findings: updatedFindings,
              toolsUsed: Array.from(toolsUsedSet)
            });
          }
        }
      } catch (investigationError) {
        console.error('[Atropos] Failed to update investigation:', investigationError);
        // Don't fail the request if investigation update fails
      }
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Scan History ============

// Get scan history for session
router.get("/scans/:sessionToken", async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const toolCalls = await storage.getToolCallsBySession(
      req.params.sessionToken as string,
      limit ? parseInt(limit as string) : undefined
    );
    
    // Filter to only atropos scans
    const atroposScans = toolCalls.filter(tc => tc.toolKey === 'atropos');
    
    res.json(atroposScans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get scan by investigation
router.get("/scans/investigation/:investigationId", async (req: Request, res: Response) => {
  try {
    const toolCalls = await storage.getToolCallsByInvestigation(req.params.investigationId as string);
    const atroposScans = toolCalls.filter(tc => tc.toolKey === 'atropos');
    res.json(atroposScans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Helper Functions ============

/**
 * Extract findings from Atropos scan results
 */
function extractFindingsFromScan(data: any, scriptPath: string): Array<{
  id: string;
  toolKey: string;
  category: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  data: any;
  timestamp: string;
}> {
  const findings: Array<{
    id: string;
    toolKey: string;
    category: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    title: string;
    data: any;
    timestamp: string;
  }> = [];
  
  // Determine category from script path
  let category = 'general';
  if (scriptPath.includes('osint') || scriptPath.includes('bbot') || scriptPath.includes('amass')) {
    category = 'osint';
  } else if (scriptPath.includes('vuln') || scriptPath.includes('sqli') || scriptPath.includes('xss') || scriptPath.includes('nuclei')) {
    category = 'vulnerability';
  } else if (scriptPath.includes('secret')) {
    category = 'secret_detection';
  }
  
  // Try to extract structured findings from data
  if (Array.isArray(data)) {
    data.forEach((item: any, index: number) => {
      findings.push({
        id: `finding_${Date.now()}_${index}`,
        toolKey: 'atropos',
        category,
        severity: item.severity || 'info',
        title: item.title || item.name || `Finding ${index + 1}`,
        data: item,
        timestamp: new Date().toISOString()
      });
    });
  } else if (data && typeof data === 'object') {
    // Single finding or structured result
    findings.push({
      id: `finding_${Date.now()}`,
      toolKey: 'atropos',
      category,
      severity: data.severity || 'info',
      title: data.title || data.name || 'Atropos Scan Result',
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  return findings;
}

// ---- Remote's AtroposScanner-compatible endpoints ----
interface AtroposFinding {
  type: "subdomain" | "ip" | "url" | "email" | "port" | "technology" | "vulnerability" | "secret" | "bucket" | "dns";
  value: string;
  severity?: "critical" | "high" | "medium" | "low" | "info";
  source?: string;
  metadata?: Record<string, any>;
}

interface AtroposSummary {
  subdomains: number;
  ipAddresses: number;
  urls: number;
  emails: number;
  openPorts: number;
  technologies: number;
  vulnerabilities: number;
  secrets: number;
  riskScore: number;
  riskLevel: "critical" | "high" | "medium" | "low";
}

const AVAILABLE_SCRIPTS = [
  { id: "bbot_scanner", name: "BBOT Scanner", description: "Recursive subdomain enumeration", category: "osint" },
  { id: "amass_osint", name: "Amass OSINT", description: "OWASP subdomain discovery", category: "osint" },
  { id: "nuclei_scanner", name: "Nuclei", description: "Template-based vulnerability scanning", category: "vuln" },
  { id: "xss_scanner", name: "XSS Scanner", description: "Cross-site scripting detection", category: "vuln" },
  { id: "sqli_scanner", name: "SQLi Scanner", description: "SQL injection detection", category: "vuln" },
  { id: "threat_intel_scanner", name: "Threat Intel", description: "Shodan, VirusTotal, SecurityTrails", category: "intel" },
  { id: "spiderfoot_osint", name: "SpiderFoot", description: "Automated OSINT collection", category: "osint" },
  { id: "finalrecon_scanner", name: "FinalRecon", description: "Full web reconnaissance", category: "recon" },
  { id: "api_fuzzer", name: "API Fuzzer", description: "API endpoint discovery and testing", category: "api" },
];

const scanResults: Map<string, AtroposScanResult> = new Map();

function generateSimulatedScan(target: string, scriptId: string): AtroposScanResult {
  const now = new Date().toISOString();
  const vulnCount = Math.floor(Math.random() * 5);
  const subdomainCount = Math.floor(Math.random() * 20) + 5;
  
  const findings: AtroposFinding[] = [];
  
  for (let i = 0; i < subdomainCount; i++) {
    const prefixes = ["dev", "staging", "api", "admin", "portal", "test", "internal", "mail", "cdn", "app"];
    findings.push({
      type: "subdomain",
      value: `${prefixes[i % prefixes.length]}${i > 9 ? i : ""}.${target}`,
      severity: "info",
      source: "bbot"
    });
  }
  
  findings.push(
    { type: "ip", value: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, source: "dns" },
    { type: "ip", value: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, source: "dns" }
  );
  
  const ports = [22, 80, 443, 3306, 5432, 8080, 8443];
  ports.slice(0, Math.floor(Math.random() * 4) + 2).forEach(port => {
    findings.push({ type: "port", value: `${port}`, severity: port === 22 ? "medium" : "info", source: "nmap" });
  });
  
  const techs = ["nginx/1.18", "React 18", "Node.js", "PostgreSQL", "Redis", "Cloudflare"];
  techs.slice(0, Math.floor(Math.random() * 4) + 2).forEach(tech => {
    findings.push({ type: "technology", value: tech, severity: "info", source: "wappalyzer" });
  });
  
  if (vulnCount > 0) {
    const vulns = [
      { value: "Outdated TLS 1.0 enabled", severity: "high" as const },
      { value: "Missing X-Frame-Options header", severity: "medium" as const },
      { value: "Directory listing enabled", severity: "medium" as const },
      { value: "Exposed .git directory", severity: "critical" as const },
      { value: "CORS misconfiguration", severity: "medium" as const },
    ];
    vulns.slice(0, vulnCount).forEach(v => {
      findings.push({ type: "vulnerability", ...v, source: "nuclei" });
    });
  }
  
  const criticalCount = findings.filter(f => f.severity === "critical").length;
  const highCount = findings.filter(f => f.severity === "high").length;
  const riskScore = criticalCount * 25 + highCount * 15 + vulnCount * 5;
  
  return {
    id: nanoid(),
    scanType: scriptId,
    target,
    timestamp: now,
    status: "completed",
    findings,
    summary: {
      subdomains: findings.filter(f => f.type === "subdomain").length,
      ipAddresses: findings.filter(f => f.type === "ip").length,
      urls: findings.filter(f => f.type === "url").length,
      emails: findings.filter(f => f.type === "email").length,
      openPorts: findings.filter(f => f.type === "port").length,
      technologies: findings.filter(f => f.type === "technology").length,
      vulnerabilities: findings.filter(f => f.type === "vulnerability").length,
      secrets: findings.filter(f => f.type === "secret").length,
      riskScore: Math.min(100, riskScore),
      riskLevel: riskScore >= 50 ? "critical" : riskScore >= 30 ? "high" : riskScore >= 15 ? "medium" : "low"
    },
    scriptUsed: scriptId
  };
}

router.get("/scripts", async (req: Request, res: Response) => {
  res.json(AVAILABLE_SCRIPTS);
});

router.get("/scripts/:category", async (req: Request, res: Response) => {
  const { category } = req.params;
  const filtered = AVAILABLE_SCRIPTS.filter(s => s.category === category);
  res.json(filtered);
});

router.post("/scan/simulate", async (req: Request, res: Response) => {
  try {
    const { target, scriptId = "bbot_scanner" } = req.body;
    
    if (!target) {
      return res.status(400).json({ error: "Target is required" });
    }
    
    const result = generateSimulatedScan(target, scriptId);
    scanResults.set(result.id, result);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/results/import", async (req: Request, res: Response) => {
  try {
    const { results, format = "atropos" } = req.body;
    
    if (!results) {
      return res.status(400).json({ error: "Results data is required" });
    }
    
    let parsed: AtroposScanResult;
    
    if (format === "atropos") {
      parsed = results as AtroposScanResult;
      parsed.id = parsed.id || nanoid();
      parsed.timestamp = parsed.timestamp || new Date().toISOString();
    } else if (format === "bbot") {
      const findings: AtroposFinding[] = [];
      if (Array.isArray(results.events)) {
        results.events.forEach((event: any) => {
          const type = event.type?.toLowerCase();
          if (type === "dns_name") {
            findings.push({ type: "subdomain", value: event.data, source: "bbot" });
          } else if (type === "ip_address") {
            findings.push({ type: "ip", value: event.data, source: "bbot" });
          } else if (type === "url") {
            findings.push({ type: "url", value: event.data, source: "bbot" });
          } else if (type === "vulnerability") {
            findings.push({ 
              type: "vulnerability", 
              value: event.data, 
              severity: event.severity || "medium",
              source: "bbot" 
            });
          }
        });
      }
      
      parsed = {
        id: nanoid(),
        scanType: "bbot_import",
        target: results.target || "unknown",
        timestamp: new Date().toISOString(),
        status: "completed",
        findings,
        summary: {
          subdomains: findings.filter(f => f.type === "subdomain").length,
          ipAddresses: findings.filter(f => f.type === "ip").length,
          urls: findings.filter(f => f.type === "url").length,
          emails: 0,
          openPorts: 0,
          technologies: 0,
          vulnerabilities: findings.filter(f => f.type === "vulnerability").length,
          secrets: 0,
          riskScore: 0,
          riskLevel: "low"
        }
      };
    } else if (format === "nuclei") {
      const findings: AtroposFinding[] = [];
      const vulns = Array.isArray(results) ? results : [results];
      vulns.forEach((v: any) => {
        findings.push({
          type: "vulnerability",
          value: v.info?.name || v["template-id"] || "Unknown",
          severity: v.info?.severity || "medium",
          source: "nuclei",
          metadata: { 
            matched: v.matched || v["matched-at"],
            template: v["template-id"]
          }
        });
      });
      
      parsed = {
        id: nanoid(),
        scanType: "nuclei_import",
        target: results[0]?.host || "unknown",
        timestamp: new Date().toISOString(),
        status: "completed",
        findings,
        summary: {
          subdomains: 0,
          ipAddresses: 0,
          urls: 0,
          emails: 0,
          openPorts: 0,
          technologies: 0,
          vulnerabilities: findings.length,
          secrets: 0,
          riskScore: findings.filter(f => f.severity === "critical").length * 25 + 
                     findings.filter(f => f.severity === "high").length * 15,
          riskLevel: findings.some(f => f.severity === "critical") ? "critical" : 
                     findings.some(f => f.severity === "high") ? "high" : "medium"
        }
      };
    } else {
      return res.status(400).json({ error: "Unsupported format. Use: atropos, bbot, or nuclei" });
    }
    
    scanResults.set(parsed.id, parsed);
    res.json({ success: true, scanId: parsed.id, result: parsed });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/results", async (req: Request, res: Response) => {
  const results = Array.from(scanResults.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(results);
});

router.get("/results/:id", async (req: Request, res: Response) => {
  const result = scanResults.get(req.params.id as string);
  if (!result) {
    return res.status(404).json({ error: "Scan result not found" });
  }
  res.json(result);
});

router.delete("/results/:id", async (req: Request, res: Response) => {
  const deleted = scanResults.delete(req.params.id as string);
  res.json({ success: deleted });
});

router.post("/results/:id/analyze", async (req: Request, res: Response) => {
  try {
    const result = scanResults.get(req.params.id as string);
    if (!result) {
      return res.status(404).json({ error: "Scan result not found" });
    }
    
    const criticalFindings = result.findings.filter(f => f.severity === "critical");
    const highFindings = result.findings.filter(f => f.severity === "high");
    const vulnFindings = result.findings.filter(f => f.type === "vulnerability");
    
    const analysisPrompt = `## Atropos Scan Results for ${result.target}

**Scan Type:** ${result.scanType}
**Timestamp:** ${result.timestamp}
**Risk Level:** ${result.summary.riskLevel.toUpperCase()} (Score: ${result.summary.riskScore}/100)

### Summary
- Subdomains: ${result.summary.subdomains}
- IP Addresses: ${result.summary.ipAddresses}
- Open Ports: ${result.summary.openPorts}
- Technologies: ${result.summary.technologies}
- Vulnerabilities: ${result.summary.vulnerabilities}

${criticalFindings.length > 0 ? `### Critical Findings
${criticalFindings.map(f => `- **${f.value}** (${f.source})`).join('\n')}` : ''}

${highFindings.length > 0 ? `### High-Severity Findings
${highFindings.map(f => `- **${f.value}** (${f.source})`).join('\n')}` : ''}

${vulnFindings.length > 0 ? `### Vulnerabilities Detected
${vulnFindings.map(f => `- [${f.severity?.toUpperCase()}] ${f.value}`).join('\n')}` : ''}

### All Findings by Type
${Object.entries(
  result.findings.reduce((acc, f) => {
    acc[f.type] = acc[f.type] || [];
    acc[f.type].push(f.value);
    return acc;
  }, {} as Record<string, string[]>)
).map(([type, values]) => `**${type}:** ${(values as string[]).slice(0, 10).join(', ')}${(values as string[]).length > 10 ? ` (+${(values as string[]).length - 10} more)` : ''}`).join('\n')}

---
*Analyze these findings and recommend next steps for the investigation.*`;
    
    res.json({
      scanId: result.id,
      analysisPrompt,
      reportData: {
        target: result.target,
        scanType: result.scanType,
        timestamp: result.timestamp,
        summary: result.summary,
        criticalFindings: criticalFindings.length,
        highFindings: highFindings.length,
        findings: result.findings
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/remote/scan", async (req: Request, res: Response) => {
  try {
    const { atroposUrl, target, scriptId, apiKey } = req.body;
    
    if (!atroposUrl || !target) {
      return res.status(400).json({ error: "atroposUrl and target are required" });
    }
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }
    
    const response = await fetch(`${atroposUrl}/api/scan`, {
      method: "POST",
      headers,
      body: JSON.stringify({ target, script: scriptId })
    });
    
    if (!response.ok) {
      throw new Error(`Atropos API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    res.status(502).json({ 
      error: "Failed to connect to Atropos server",
      details: error.message 
    });
  }
});

router.get("/remote/status", async (req: Request, res: Response) => {
  try {
    const atroposUrl = req.query.url as string;
    
    if (!atroposUrl) {
      return res.status(400).json({ error: "url query parameter is required" });
    }
    
    const response = await fetch(`${atroposUrl}/api/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000)
    });
    
    res.json({ 
      connected: response.ok,
      status: response.ok ? "online" : "error"
    });
  } catch (error: any) {
    res.json({ 
      connected: false,
      status: "offline",
      error: error.message
    });
  }
});

export default router;
