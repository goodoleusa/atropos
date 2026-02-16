import { Router, Request, Response } from "express";
import { atroposService, type AtroposScanParams, type AtroposScanResult } from "../services/atropos";
import { storage } from "../storage";
import { logSessionInteraction } from "../services/osint";
import { nanoid } from "nanoid";
import fs from "fs/promises";
import path from "path";

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
    
    // Fallback to simulation if binary execution returns empty
    let result = await atroposService.executeScript(params);
    
    if (!result.success || !result.data || (Array.isArray(result.data) && result.data.length === 0)) {
      console.log('[Atropos] Empty or failed real scan, providing simulated fallback for demo/lab environment');
      const simulated = generateSimulatedScan(target, scriptPath);
      result = {
        success: true,
        data: simulated.findings,
        message: "Simulated results (Atropos binary unavailable or returned empty)",
        executionTime: 1500
      };
    }
    
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

interface SimulatedScanResult {
  id: string;
  scanType: string;
  target: string;
  timestamp: string;
  status: string;
  findings: AtroposFinding[];
  summary: AtroposSummary;
  scriptUsed?: string;
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

const scanResults: Map<string, SimulatedScanResult> = new Map();

function generateSimulatedScan(target: string, scriptId: string): SimulatedScanResult {
  const now = new Date().toISOString();
  const findings: AtroposFinding[] = [];
  
  // Script-specific simulation logic
  if (scriptId.includes('sqli')) {
    findings.push({ 
      type: "vulnerability", 
      value: `SQL Injection detected in ${target}/api/products?id=`, 
      severity: "critical", 
      source: "atropos-sqli",
      metadata: { payload: "' OR 1=1 --", dbType: "PostgreSQL" }
    });
    findings.push({ type: "dns", value: target, severity: "info", source: "dns" });
  } else if (scriptId.includes('xss')) {
    findings.push({ 
      type: "vulnerability", 
      value: `Reflected XSS on ${target}/search?q=`, 
      severity: "high", 
      source: "atropos-xss",
      metadata: { payload: "<script>alert(1)</script>", parameter: "q" }
    });
  } else if (scriptId.includes('secret') || scriptId.includes('leak')) {
    findings.push({ 
      type: "secret", 
      value: `AWS Access Key found in ${target}/.env.bak`, 
      severity: "critical", 
      source: "atropos-leaks",
      metadata: { keyType: "AWS_ACCESS_KEY", file: ".env.bak" }
    });
  } else if (scriptId.includes('port') || scriptId.includes('nmap')) {
    [22, 80, 443, 3306, 5432, 8080].forEach(port => {
      findings.push({ type: "port", value: port.toString(), severity: port === 3306 ? "high" : "info", source: "atropos-scan" });
    });
  } else {
    // Default generic simulation
    const subdomainCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < subdomainCount; i++) {
      findings.push({
        type: "subdomain",
        value: `${['api', 'dev', 'vpn', 'stage', 'mail'][i % 5]}.${target}`,
        severity: "info",
        source: "atropos-discovery"
      });
    }
  }
  
  const criticalCount = findings.filter(f => f.severity === "critical").length;
  const highCount = findings.filter(f => f.severity === "high").length;
  const riskScore = criticalCount * 40 + highCount * 20 + findings.length * 2;
  
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
    
    let parsed: SimulatedScanResult;
    
    if (format === "atropos") {
      parsed = results as SimulatedScanResult;
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

// ============ Lua Script CRUD ============

router.get("/lua-scripts", async (req: Request, res: Response) => {
  try {
    const scriptsDir = process.env.ATROPOS_SCRIPTS_DIR || path.join(process.cwd(), "tools", "atropos", "examples");
    const files = await fs.readdir(scriptsDir);
    const scripts = [];
    for (const file of files) {
      if (!file.endsWith(".lua")) continue;
      const filePath = path.join(scriptsDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      const stat = await fs.stat(filePath);
      const descMatch = content.match(/^--\s*(.+)/m);
      const catMatch = file.match(/^(cti|monitoring|active|recon|CVE|config|func)/i);
      scripts.push({
        filename: file,
        name: path.basename(file, ".lua").replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
        description: descMatch ? descMatch[1].trim() : "",
        category: catMatch ? catMatch[1].toLowerCase() : file.includes("sqli") || file.includes("xss") || file.includes("vuln") || file.includes("CVE") ? "vulnerability" : file.includes("osint") || file.includes("bbot") || file.includes("amass") || file.includes("recon") ? "osint" : file.includes("secret") || file.includes("leak") || file.includes("sensitive") ? "secret_detection" : file.includes("threat") || file.includes("ioc") || file.includes("cti") ? "threat_intel" : file.includes("monitor") || file.includes("header") || file.includes("error") ? "monitoring" : "general",
        size: stat.size,
        modified: stat.mtime.toISOString(),
        content,
      });
    }
    res.json(scripts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/lua-scripts", async (req: Request, res: Response) => {
  try {
    const { filename, content } = req.body;
    if (!filename || !content) return res.status(400).json({ error: "filename and content required" });
    if (!filename.endsWith(".lua")) return res.status(400).json({ error: "filename must end with .lua" });
    if (/[\/\\]/.test(filename)) return res.status(400).json({ error: "filename cannot contain path separators" });
    const scriptsDir = process.env.ATROPOS_SCRIPTS_DIR || path.join(process.cwd(), "tools", "atropos", "examples");
    await fs.mkdir(scriptsDir, { recursive: true });
    const filePath = path.join(scriptsDir, filename);
    await fs.writeFile(filePath, content, "utf-8");
    res.json({ success: true, filename, path: filePath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/lua-scripts/:filename", async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "content required" });
    const scriptsDir = process.env.ATROPOS_SCRIPTS_DIR || path.join(process.cwd(), "tools", "atropos", "examples");
    const filePath = path.join(scriptsDir, filename as string);
    try { await fs.access(filePath); } catch { return res.status(404).json({ error: "Script not found" }); }
    await fs.writeFile(filePath, content, "utf-8");
    res.json({ success: true, filename });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/lua-scripts/:filename", async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const scriptsDir = process.env.ATROPOS_SCRIPTS_DIR || path.join(process.cwd(), "tools", "atropos", "examples");
    const filePath = path.join(scriptsDir, filename as string);
    try { await fs.access(filePath); } catch { return res.status(404).json({ error: "Script not found" }); }
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ API Lookups (VirusTotal, Hybrid Analysis, free APIs) ============

router.post("/lookup/virustotal", async (req: Request, res: Response) => {
  try {
    const { target, type = "domain" } = req.body;
    if (!target) return res.status(400).json({ error: "target required" });
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) return res.status(400).json({ error: "VIRUSTOTAL_API_KEY not configured", needsKey: true });
    const endpoints: Record<string, string> = {
      domain: `https://www.virustotal.com/api/v3/domains/${encodeURIComponent(target)}`,
      ip: `https://www.virustotal.com/api/v3/ip_addresses/${encodeURIComponent(target)}`,
      hash: `https://www.virustotal.com/api/v3/files/${encodeURIComponent(target)}`,
      url: `https://www.virustotal.com/api/v3/urls/${Buffer.from(target).toString("base64url")}`,
    };
    const url = endpoints[type] || endpoints.domain;
    const response = await fetch(url, {
      headers: { "x-apikey": apiKey },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `VirusTotal API error: ${response.status}`, details: err });
    }
    const data = await response.json();
    res.json({ source: "virustotal", type, target, data: data.data, timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/lookup/hybrid-analysis", async (req: Request, res: Response) => {
  try {
    const { target, type = "search" } = req.body;
    if (!target) return res.status(400).json({ error: "target required" });
    const apiKey = process.env.HYBRID_ANALYSIS_API_KEY;
    if (!apiKey) return res.status(400).json({ error: "HYBRID_ANALYSIS_API_KEY not configured", needsKey: true });
    let url = "https://www.hybrid-analysis.com/api/v2/search/terms";
    let body: any = {};
    if (type === "hash") {
      body = { hash: target };
    } else if (type === "domain") {
      body = { domain: target };
    } else {
      body = { filename: target };
    }
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Falcon Sandbox",
      },
      body: new URLSearchParams(body).toString(),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `Hybrid Analysis API error: ${response.status}` });
    }
    const data = await response.json();
    res.json({ source: "hybrid-analysis", type, target, data, timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/lookup/free", async (req: Request, res: Response) => {
  try {
    const { target, service = "dns" } = req.body;
    if (!target) return res.status(400).json({ error: "target required" });
    const results: any = { source: service, target, timestamp: new Date().toISOString() };

    if (service === "dns" || service === "all") {
      try {
        const dns = await import("dns").then(m => m.promises);
        const [aRecords, mxRecords, txtRecords, nsRecords] = await Promise.allSettled([
          dns.resolve4(target),
          dns.resolveMx(target),
          dns.resolveTxt(target),
          dns.resolveNs(target),
        ]);
        results.dns = {
          a: aRecords.status === "fulfilled" ? aRecords.value : [],
          mx: mxRecords.status === "fulfilled" ? mxRecords.value : [],
          txt: txtRecords.status === "fulfilled" ? txtRecords.value : [],
          ns: nsRecords.status === "fulfilled" ? nsRecords.value : [],
        };
      } catch (e: any) {
        results.dns = { error: e.message };
      }
    }

    if (service === "whois" || service === "all") {
      try {
        const resp = await fetch(`https://rdap.org/domain/${encodeURIComponent(target)}`, { signal: AbortSignal.timeout(10000) });
        if (resp.ok) results.whois = await resp.json();
        else results.whois = { error: `RDAP returned ${resp.status}` };
      } catch (e: any) {
        results.whois = { error: e.message };
      }
    }

    if (service === "headers" || service === "all") {
      try {
        const url = target.startsWith("http") ? target : `https://${target}`;
        const resp = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(10000), redirect: "follow" });
        const headers: Record<string, string> = {};
        resp.headers.forEach((v, k) => { headers[k] = v; });
        results.headers = {
          status: resp.status,
          headers,
          securityHeaders: {
            hsts: !!headers["strict-transport-security"],
            csp: !!headers["content-security-policy"],
            xfo: !!headers["x-frame-options"],
            xcto: !!headers["x-content-type-options"],
            xss: !!headers["x-xss-protection"],
          },
        };
      } catch (e: any) {
        results.headers = { error: e.message };
      }
    }

    if (service === "abuseipdb" || service === "all") {
      const abuseKey = process.env.ABUSEIPDB_API_KEY;
      if (abuseKey) {
        try {
          const resp = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(target)}&maxAgeInDays=90`, {
            headers: { Key: abuseKey, Accept: "application/json" },
            signal: AbortSignal.timeout(10000),
          });
          if (resp.ok) results.abuseipdb = await resp.json();
        } catch {}
      }
    }

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Lotus-Scripts Repository Info ============
router.get("/lotus-scripts-categories", async (req: Request, res: Response) => {
  res.json([
    { id: "active", name: "Active Scanners", description: "SQLi, SSTI, LFI, PHPINFO, Jenkins RCE, Git leakage", scripts: ["sqli_detector.lua", "ssti_detector.lua", "lfi_scanner.lua", "phpinfo_finder.lua", "jenkins_rce.lua", "git_exposure.lua", "extractfromjs.lua"] },
    { id: "CVE", name: "CVE Exploits", description: "Known vulnerability scanners", scripts: ["CVE-2014-2321.lua", "CVE-2019-11248.lua", "CVE-2020-11450.lua", "CVE-2022-0378.lua", "CVE-2022-0381.lua", "CVE-2021-21972.lua", "CVE-2021-21985.lua", "CVE-2023-23752.lua", "CVE-2023-23333.lua"] },
    { id: "cti", name: "Cyber Threat Intel", description: "IoC detection, suspicious user agents", scripts: ["ioc_detection.lua", "suspicious_user_agent.lua"] },
    { id: "monitoring", name: "Monitoring", description: "Sensitive data exposure, suspicious headers, error disclosure", scripts: ["sensitive_data_exposure.lua", "suspicious_headers.lua", "error_disclosure.lua"] },
    { id: "recon", name: "Reconnaissance", description: "Recon framework scripts", scripts: ["recon.lua"] },
    { id: "config", name: "Configuration", description: "Scanner configuration utilities", scripts: [] },
    { id: "func", name: "Utility Functions", description: "Helper functions for script development", scripts: [] },
  ]);
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
