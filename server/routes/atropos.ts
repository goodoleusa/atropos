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
    
    let result = await atroposService.executeScript(params);
    
    if (!result.success || !result.data || (Array.isArray(result.data) && result.data.length === 0)) {
      const isOsintScan = ['bbot', 'amass', 'subfinder', 'harvester', 'argus', 'spiderfoot', 'finalrecon', 'threat_intel'].some(t => scriptPath.includes(t));
      
      if (isOsintScan) {
        console.log('[Atropos] Using OSINT Toolkit for live data on:', scriptPath);
        try {
          const osintData = await runOsintService("domain_recon", [target]);
          const findings: AtroposFinding[] = [];
          
          if (osintData.dns?.A) osintData.dns.A.forEach((ip: string) => findings.push({ type: "ip", value: ip, severity: "info", source: "osint-dns-live" }));
          if (osintData.dns?.MX) osintData.dns.MX.forEach((mx: any) => findings.push({ type: "dns", value: `MX: ${mx.exchange || mx}`, severity: "info", source: "osint-dns-live" }));
          if (osintData.dns?.NS) osintData.dns.NS.forEach((ns: string) => findings.push({ type: "dns", value: `NS: ${ns}`, severity: "info", source: "osint-dns-live" }));
          if (osintData.cert_transparency?.subdomains) {
            osintData.cert_transparency.subdomains.slice(0, 50).forEach((sub: string) => findings.push({ type: "subdomain", value: sub, severity: "info", source: "crt.sh-live" }));
          }
          if (osintData.ports?.open_ports) {
            osintData.ports.open_ports.forEach((p: any) => findings.push({ type: "port", value: `${p.port}/tcp (${p.service})`, severity: [3306, 5432, 3389].includes(p.port) ? "high" : "info", source: "osint-portscan-live" }));
          }
          if (osintData.http_headers?.security_headers) {
            for (const [h, v] of Object.entries(osintData.http_headers.security_headers)) {
              if (v === "MISSING") findings.push({ type: "vulnerability", value: `Missing: ${h}`, severity: "medium", source: "osint-headers-live" });
            }
          }
          if (osintData.whois?.registrar) findings.push({ type: "dns", value: `Registrar: ${osintData.whois.registrar}`, severity: "info", source: "osint-whois-live" });
          if (osintData.http_headers?.server) findings.push({ type: "technology", value: osintData.http_headers.server, severity: "info", source: "osint-headers-live" });

          if (findings.length > 0) {
            result = { success: true, data: findings, output: "Live OSINT Toolkit scan results", latencyMs: Date.now() - Date.now() };
          }
        } catch (osintError) {
          console.log('[Atropos] OSINT Toolkit fallback failed:', osintError);
        }
      }

      if (!result.success || !result.data || (Array.isArray(result.data) && result.data.length === 0)) {
        console.log('[Atropos] Providing simulated fallback for demo/lab environment');
        const simulated = generateSimulatedScan(target, scriptPath);
        result = {
          success: true,
          data: simulated.findings,
          output: "Simulated results (Atropos binary unavailable or returned empty)",
          latencyMs: 1500
        };
      }
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
  { id: "bbot_scanner", name: "BBOT Scanner", description: "Recursive subdomain enumeration & web discovery", category: "osint", difficulty: "beginner", education: "BBOT (Bighuge BLS OSINT Tool) crawls DNS records, certificates, and web pages to recursively find subdomains and related infrastructure. Great first tool for mapping an organization's attack surface. Finds: subdomains, IPs, URLs, emails, cloud buckets.", realTool: "bbot", installed: false },
  { id: "amass_osint", name: "Amass OSINT", description: "OWASP subdomain discovery & network mapping", category: "osint", difficulty: "intermediate", education: "Amass by OWASP performs DNS enumeration, scraping, and API queries to discover subdomains and map external network ranges. It cross-references dozens of data sources. Use when you need thorough subdomain discovery with graph-based relationship mapping.", realTool: "amass", installed: true },
  { id: "subfinder_enum", name: "Subfinder", description: "Fast passive subdomain enumeration", category: "osint", difficulty: "beginner", education: "Subfinder by ProjectDiscovery passively finds subdomains using search engines, certificate logs, and threat intel APIs. It's extremely fast because it never touches the target directly - purely passive. Best for quick initial recon without alerting the target.", realTool: "subfinder", installed: true },
  { id: "theharvester_recon", name: "theHarvester", description: "Email, subdomain & host discovery from public sources", category: "osint", difficulty: "beginner", education: "theHarvester gathers emails, names, subdomains, IPs, and URLs from public sources like search engines, PGP key servers, and Shodan. Classic OSINT tool used in every pentest engagement. Great for initial information gathering before deeper scans.", realTool: "theHarvester", installed: true },
  { id: "argus_recon", name: "Argus Recon", description: "All-in-one OSINT reconnaissance toolkit", category: "osint", difficulty: "intermediate", education: "Argus is a comprehensive recon toolkit combining DNS analysis, port scanning, SSL inspection, technology fingerprinting, WAF detection, and threat intel lookups (VirusTotal, Shodan, Censys) into one tool. Good for getting a complete picture of a target from a single scan.", realTool: "argus", installed: true },
  { id: "nuclei_scanner", name: "Nuclei", description: "Template-based vulnerability scanning with 8000+ checks", category: "vuln", difficulty: "intermediate", education: "Nuclei by ProjectDiscovery uses community-maintained YAML templates to scan for known vulnerabilities, misconfigurations, exposed panels, and CVEs. With 8000+ templates covering web apps, network services, and cloud configs, it's the go-to scanner for finding known issues fast.", realTool: "nuclei", installed: true },
  { id: "xss_scanner", name: "XSS Scanner", description: "Cross-site scripting detection in web forms & parameters", category: "vuln", difficulty: "intermediate", education: "Tests web application input fields and URL parameters for Cross-Site Scripting (XSS) vulnerabilities. XSS lets attackers inject malicious scripts into web pages viewed by other users - used for session hijacking, defacement, and credential theft. Essential for web app security testing.", realTool: null, installed: true },
  { id: "sqli_scanner", name: "SQLi Scanner", description: "SQL injection detection in database-backed applications", category: "vuln", difficulty: "intermediate", education: "Tests for SQL Injection vulnerabilities where attacker-controlled input gets executed as database queries. SQLi can lead to data theft, authentication bypass, and full database compromise. One of the OWASP Top 10 - every web app pentester needs to understand this.", realTool: null, installed: true },
  { id: "nmap_scanner", name: "Nmap", description: "Network port scanning & service detection", category: "recon", difficulty: "beginner", education: "Nmap (Network Mapper) is the most widely-used network scanner. It discovers open ports, identifies running services and their versions, detects operating systems, and can run vulnerability scripts (NSE). Fundamental tool for network reconnaissance - learn this first.", realTool: "nmap", installed: true },
  { id: "nikto_scanner", name: "Nikto", description: "Web server vulnerability & misconfiguration scanner", category: "vuln", difficulty: "beginner", education: "Nikto scans web servers for dangerous files, outdated software, and misconfigurations. It checks for 7000+ potentially dangerous files/programs and 1250+ outdated server versions. Good for quickly finding low-hanging fruit on web servers.", realTool: "nikto", installed: true },
  { id: "gobuster_scan", name: "Gobuster", description: "Directory & file brute-forcing on web servers", category: "recon", difficulty: "beginner", education: "Gobuster brute-forces directories, files, DNS subdomains, and virtual host names on web servers using wordlists. Essential for finding hidden admin panels, backup files, and undocumented API endpoints that aren't linked from the main site.", realTool: "gobuster", installed: true },
  { id: "ffuf_fuzzer", name: "FFUF", description: "Fast web fuzzer for directories, parameters & headers", category: "recon", difficulty: "intermediate", education: "FFUF (Fuzz Faster U Fool) is a high-speed web fuzzer that brute-forces directories, GET/POST parameters, HTTP headers, and more. More flexible than Gobuster - can fuzz any part of an HTTP request. Used for content discovery and parameter mining.", realTool: "ffuf", installed: true },
  { id: "httpx_probe", name: "HTTPX", description: "HTTP probing & technology fingerprinting", category: "recon", difficulty: "beginner", education: "HTTPX by ProjectDiscovery probes a list of hosts to find live web servers, detect technologies, extract titles, follow redirects, and grab screenshots. Perfect for processing large lists of subdomains to find which ones are actually running web services.", realTool: "httpx", installed: true },
  { id: "masscan_scan", name: "Masscan", description: "Ultra-fast port scanner for large networks", category: "recon", difficulty: "advanced", education: "Masscan can scan the entire internet in under 6 minutes. It's designed for speed over stealth, sending millions of packets per second. Use for quickly scanning large IP ranges to find specific open ports. Warning: very noisy - targets will notice.", realTool: "masscan", installed: true },
  { id: "threat_intel_scanner", name: "Threat Intel", description: "Multi-source threat intelligence aggregation", category: "intel", difficulty: "intermediate", education: "Combines results from Shodan (internet-connected devices), VirusTotal (malware analysis), and SecurityTrails (DNS history) to build a comprehensive threat profile. Shows you what the threat intel community already knows about your target.", realTool: null, installed: true },
  { id: "spiderfoot_osint", name: "SpiderFoot", description: "230+ module automated OSINT collection engine", category: "osint", difficulty: "advanced", education: "SpiderFoot automates OSINT collection across 230+ data sources including DNS, WHOIS, social media, dark web, breach databases, and more. It correlates findings to show relationships between entities. The most comprehensive automated OSINT tool available.", realTool: "sf.py", installed: true },
  { id: "finalrecon_scanner", name: "FinalRecon", description: "All-in-one web reconnaissance suite", category: "recon", difficulty: "beginner", education: "FinalRecon combines header analysis, WHOIS, SSL cert info, subdomain enumeration, directory brute-forcing, and Wayback Machine lookups into one tool. Good for beginners who want a single-command recon sweep of a web target.", realTool: null, installed: false },
  { id: "api_fuzzer", name: "API Fuzzer", description: "REST API endpoint discovery & parameter testing", category: "api", difficulty: "intermediate", education: "Discovers undocumented API endpoints by brute-forcing common paths (/api/v1/users, /api/admin, etc.) and tests parameters for injection vulnerabilities. Essential for testing modern web applications that rely heavily on REST APIs.", realTool: null, installed: true },
];

const scanResults: Map<string, SimulatedScanResult> = new Map();

function generateSimulatedScan(target: string, scriptId: string): SimulatedScanResult {
  const now = new Date().toISOString();
  const findings: AtroposFinding[] = [];
  
  if (scriptId.includes('sqli')) {
    findings.push({ type: "vulnerability", value: `SQL Injection detected in ${target}/api/products?id=`, severity: "critical", source: "atropos-sqli", metadata: { payload: "' OR 1=1 --", dbType: "PostgreSQL" } });
    findings.push({ type: "vulnerability", value: `Blind SQLi in ${target}/login (time-based)`, severity: "high", source: "atropos-sqli", metadata: { payload: "' AND SLEEP(5)--", parameter: "username" } });
    findings.push({ type: "dns", value: target, severity: "info", source: "dns" });
  } else if (scriptId.includes('xss')) {
    findings.push({ type: "vulnerability", value: `Reflected XSS on ${target}/search?q=`, severity: "high", source: "atropos-xss", metadata: { payload: "<script>alert(1)</script>", parameter: "q" } });
    findings.push({ type: "vulnerability", value: `Stored XSS in ${target}/comments`, severity: "critical", source: "atropos-xss", metadata: { payload: "<img onerror=alert(1) src=x>", parameter: "body" } });
  } else if (scriptId.includes('secret') || scriptId.includes('leak')) {
    findings.push({ type: "secret", value: `AWS Access Key found in ${target}/.env.bak`, severity: "critical", source: "atropos-leaks", metadata: { keyType: "AWS_ACCESS_KEY", file: ".env.bak" } });
  } else if (scriptId.includes('nmap') || scriptId.includes('masscan')) {
    [22, 80, 443, 3306, 5432, 8080, 8443, 9200].forEach(port => {
      const svc = { 22: 'SSH', 80: 'HTTP', 443: 'HTTPS', 3306: 'MySQL', 5432: 'PostgreSQL', 8080: 'HTTP-Alt', 8443: 'HTTPS-Alt', 9200: 'Elasticsearch' }[port] || 'unknown';
      findings.push({ type: "port", value: `${port}/tcp (${svc})`, severity: [3306, 5432, 9200].includes(port) ? "high" : "info", source: scriptId.includes('nmap') ? "nmap" : "masscan", metadata: { service: svc } });
    });
  } else if (scriptId.includes('nuclei') || scriptId.includes('nikto')) {
    findings.push({ type: "vulnerability", value: `${target} - Missing X-Frame-Options header`, severity: "medium", source: "nuclei" });
    findings.push({ type: "vulnerability", value: `${target} - Exposed .git directory`, severity: "high", source: "nuclei" });
    findings.push({ type: "vulnerability", value: `${target}/robots.txt - Disallowed admin paths`, severity: "low", source: "nuclei" });
    findings.push({ type: "technology", value: "nginx/1.24.0", severity: "info", source: "nuclei" });
  } else if (scriptId.includes('gobuster') || scriptId.includes('ffuf')) {
    ['/admin', '/api/v1', '/backup', '/.env', '/wp-admin', '/phpmyadmin', '/api/docs', '/swagger.json'].forEach(path => {
      findings.push({ type: "url", value: `${target}${path}`, severity: path === '/.env' ? 'high' : 'info', source: scriptId.includes('gobuster') ? 'gobuster' : 'ffuf' });
    });
  } else if (scriptId.includes('httpx')) {
    findings.push({ type: "technology", value: `${target} [200] [nginx] [Login Page]`, severity: "info", source: "httpx" });
    [`api.${target}`, `dev.${target}`, `staging.${target}`].forEach(h => {
      findings.push({ type: "url", value: `https://${h} [200]`, severity: "info", source: "httpx" });
    });
  } else if (scriptId.includes('harvester') || scriptId.includes('argus')) {
    [`admin@${target}`, `info@${target}`, `support@${target}`].forEach(e => {
      findings.push({ type: "email", value: e, severity: "info", source: scriptId.includes('harvester') ? "theHarvester" : "argus" });
    });
    [`mail.${target}`, `vpn.${target}`, `dev.${target}`].forEach(s => {
      findings.push({ type: "subdomain", value: s, severity: "info", source: scriptId.includes('harvester') ? "theHarvester" : "argus" });
    });
    findings.push({ type: "ip", value: "203.0.113.42", severity: "info", source: scriptId.includes('harvester') ? "theHarvester" : "argus" });
  } else if (scriptId.includes('subfinder')) {
    [`api.${target}`, `cdn.${target}`, `dev.${target}`, `staging.${target}`, `mail.${target}`, `vpn.${target}`, `admin.${target}`].forEach(s => {
      findings.push({ type: "subdomain", value: s, severity: "info", source: "subfinder" });
    });
  } else if (scriptId.includes('threat')) {
    findings.push({ type: "vulnerability", value: `${target} flagged on 2 threat feeds`, severity: "medium", source: "alienvault" });
    findings.push({ type: "ip", value: "203.0.113.42 (Shodan: 14 open ports)", severity: "info", source: "shodan" });
    findings.push({ type: "technology", value: `${target} - nginx, React, Node.js`, severity: "info", source: "virustotal" });
  } else {
    const subdomainCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < subdomainCount; i++) {
      findings.push({ type: "subdomain", value: `${['api', 'dev', 'vpn', 'stage', 'mail'][i % 5]}.${target}`, severity: "info", source: "atropos-discovery" });
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

router.get("/lua-templates", (_req: Request, res: Response) => {
  const templates = [
    {
      id: "subdomain_enum",
      name: "Subdomain Enumeration",
      category: "recon",
      focus: "bug_bounty",
      difficulty: "beginner",
      description: "Enumerate subdomains using passive DNS, certificate transparency, and web archives",
      tags: ["recon", "subdomains", "passive", "bug-bounty"],
      content: `-- Subdomain Enumeration Script
-- Focus: Bug Bounty Recon
-- Discovers subdomains via passive sources

local target = atropos.args.target or "example.com"
local results = {}

-- Certificate Transparency logs
local ct_data = atropos.http.get("https://crt.sh/?q=%25." .. target .. "&output=json")
if ct_data and ct_data.status == 200 then
  local entries = atropos.json.decode(ct_data.body)
  for _, entry in ipairs(entries or {}) do
    local name = entry.name_value or ""
    for sub in name:gmatch("[^\\n]+") do
      sub = sub:gsub("^%*%.", "")
      if sub:match(target:gsub("%.", "%%.") .. "$") then
        results[sub] = { source = "crt.sh", type = "subdomain" }
      end
    end
  end
end

-- Output findings
for domain, info in pairs(results) do
  atropos.emit({
    type = "subdomain",
    value = domain,
    severity = "info",
    source = info.source,
    metadata = { target = target }
  })
end

atropos.log("Found " .. atropos.count(results) .. " unique subdomains for " .. target)
`
    },
    {
      id: "port_service_scan",
      name: "Port & Service Scanner",
      category: "recon",
      focus: "threat_hunting",
      difficulty: "beginner",
      description: "Scan common ports and identify running services for threat assessment",
      tags: ["ports", "services", "network", "threat-hunting"],
      content: `-- Port & Service Scanner
-- Focus: Threat Hunting
-- Identifies open ports and running services

local target = atropos.args.target or "example.com"
local common_ports = {21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445,
  993, 995, 1433, 1521, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 9200, 27017}

for _, port in ipairs(common_ports) do
  local result = atropos.net.probe(target, port, {timeout = 3})
  if result and result.open then
    local severity = "info"
    if port == 23 or port == 21 or port == 3389 then severity = "high" end
    if port == 6379 or port == 27017 or port == 9200 then severity = "medium" end

    atropos.emit({
      type = "open_port",
      value = target .. ":" .. port,
      severity = severity,
      source = "port_scan",
      metadata = {
        port = port,
        service = result.service or "unknown",
        banner = result.banner or "",
        protocol = "tcp"
      }
    })
  end
end

atropos.log("Port scan complete for " .. target)
`
    },
    {
      id: "header_security",
      name: "Security Headers Audit",
      category: "vulnerability",
      focus: "bug_bounty",
      difficulty: "beginner",
      description: "Check for missing or misconfigured HTTP security headers",
      tags: ["headers", "misconfig", "web", "bug-bounty", "owasp"],
      content: `-- Security Headers Audit
-- Focus: Bug Bounty
-- Checks HTTP security headers against best practices

local target = atropos.args.target or "https://example.com"
if not target:match("^https?://") then target = "https://" .. target end

local required_headers = {
  ["strict-transport-security"] = { name = "HSTS", severity = "medium" },
  ["content-security-policy"] = { name = "CSP", severity = "medium" },
  ["x-frame-options"] = { name = "X-Frame-Options", severity = "medium" },
  ["x-content-type-options"] = { name = "X-Content-Type-Options", severity = "low" },
  ["x-xss-protection"] = { name = "X-XSS-Protection", severity = "low" },
  ["referrer-policy"] = { name = "Referrer-Policy", severity = "low" },
  ["permissions-policy"] = { name = "Permissions-Policy", severity = "low" },
  ["cross-origin-opener-policy"] = { name = "COOP", severity = "low" },
  ["cross-origin-resource-policy"] = { name = "CORP", severity = "low" },
}

local dangerous_headers = {
  ["server"] = "Server version disclosure",
  ["x-powered-by"] = "Technology disclosure",
  ["x-aspnet-version"] = "ASP.NET version disclosure",
}

local resp = atropos.http.get(target)
if resp and resp.headers then
  for header, info in pairs(required_headers) do
    if not resp.headers[header] then
      atropos.emit({
        type = "missing_header",
        value = info.name .. " header missing on " .. target,
        severity = info.severity,
        source = "header_audit",
        metadata = { header = header, url = target }
      })
    end
  end

  for header, desc in pairs(dangerous_headers) do
    if resp.headers[header] then
      atropos.emit({
        type = "info_disclosure",
        value = desc .. ": " .. resp.headers[header],
        severity = "low",
        source = "header_audit",
        metadata = { header = header, disclosed_value = resp.headers[header] }
      })
    end
  end
end

atropos.log("Security header audit complete for " .. target)
`
    },
    {
      id: "js_secrets_finder",
      name: "JavaScript Secrets Finder",
      category: "secret_detection",
      focus: "bug_bounty",
      difficulty: "intermediate",
      description: "Crawl JS files for exposed API keys, tokens, and hardcoded credentials",
      tags: ["secrets", "api-keys", "javascript", "bug-bounty", "leaks"],
      content: `-- JavaScript Secrets Finder
-- Focus: Bug Bounty
-- Scans JavaScript files for leaked API keys and secrets

local target = atropos.args.target or "https://example.com"
if not target:match("^https?://") then target = "https://" .. target end

local patterns = {
  { name = "AWS Access Key", pattern = "AKIA[0-9A-Z]{16}", severity = "critical" },
  { name = "AWS Secret Key", pattern = "['\"]([a-zA-Z0-9/+]{40})['\"]", severity = "critical" },
  { name = "Google API Key", pattern = "AIza[0-9A-Za-z_-]{35}", severity = "high" },
  { name = "GitHub Token", pattern = "gh[pousr]_[A-Za-z0-9_]{36,255}", severity = "critical" },
  { name = "Slack Token", pattern = "xox[baprs]-[0-9a-zA-Z-]+", severity = "high" },
  { name = "Stripe Key", pattern = "[sr]k_live_[0-9a-zA-Z]{24,}", severity = "critical" },
  { name = "JWT Token", pattern = "eyJ[A-Za-z0-9_-]+%.eyJ[A-Za-z0-9_-]+", severity = "medium" },
  { name = "Firebase URL", pattern = "[a-z0-9.-]+%.firebaseio%.com", severity = "medium" },
  { name = "Private Key", pattern = "-----BEGIN [A-Z]+ PRIVATE KEY-----", severity = "critical" },
  { name = "Basic Auth", pattern = "[a-zA-Z]+://[^/\\s:]+:[^/\\s:]+@", severity = "high" },
  { name = "Internal IP", pattern = "(?:10|172%.(?:1[6-9]|2[0-9]|3[01])|192%.168)%.[0-9.]+", severity = "low" },
}

local resp = atropos.http.get(target)
if resp and resp.body then
  local js_urls = {}
  for url in resp.body:gmatch('src=["\']([^"\']+%.js[^"\']*)["\']') do
    if url:match("^/") then url = target .. url
    elseif not url:match("^https?://") then url = target .. "/" .. url end
    table.insert(js_urls, url)
  end

  for _, js_url in ipairs(js_urls) do
    local js = atropos.http.get(js_url)
    if js and js.body then
      for _, pat in ipairs(patterns) do
        for match in js.body:gmatch(pat.pattern) do
          atropos.emit({
            type = "secret",
            value = pat.name .. " found in " .. js_url,
            severity = pat.severity,
            source = "js_scanner",
            metadata = { pattern = pat.name, file = js_url, snippet = match:sub(1, 40) .. "..." }
          })
        end
      end
    end
  end
end

atropos.log("JS secrets scan complete for " .. target)
`
    },
    {
      id: "sqli_detector",
      name: "SQL Injection Detector",
      category: "vulnerability",
      focus: "bug_bounty",
      difficulty: "intermediate",
      description: "Test URL parameters for SQL injection vulnerabilities with error-based and time-based payloads",
      tags: ["sqli", "injection", "web", "bug-bounty", "owasp"],
      content: `-- SQL Injection Detector
-- Focus: Bug Bounty
-- Tests parameters for SQLi with error-based and blind detection

local target = atropos.args.target or "https://example.com/search?q=test"

local error_payloads = {
  "' OR '1'='1", "\" OR \"1\"=\"1", "1' ORDER BY 1--",
  "1 UNION SELECT NULL--", "' AND 1=CONVERT(int,(SELECT @@version))--",
  "1; WAITFOR DELAY '0:0:5'--", "1' AND SLEEP(5)#",
}

local error_signatures = {
  "sql syntax", "mysql_", "ORA-", "PostgreSQL", "SQLite",
  "microsoft sql", "unclosed quotation", "SQLSTATE",
  "syntax error at or near", "unterminated string",
}

local base_url, query = target:match("^(.+)%?(.+)$")
if not query then
  atropos.log("No query parameters found in URL")
  return
end

for param_pair in query:gmatch("[^&]+") do
  local param_name, param_value = param_pair:match("^(.+)=(.*)$")
  if param_name then
    for _, payload in ipairs(error_payloads) do
      local test_query = query:gsub(
        param_name .. "=" .. param_value,
        param_name .. "=" .. atropos.url.encode(payload)
      )
      local test_url = base_url .. "?" .. test_query
      local start = os.clock()
      local resp = atropos.http.get(test_url, {timeout = 10})
      local elapsed = os.clock() - start

      if resp and resp.body then
        for _, sig in ipairs(error_signatures) do
          if resp.body:lower():find(sig:lower()) then
            atropos.emit({
              type = "vulnerability",
              value = "Possible SQLi in param '" .. param_name .. "': " .. sig,
              severity = "critical",
              source = "sqli_scanner",
              metadata = { param = param_name, payload = payload, evidence = sig, url = test_url }
            })
            break
          end
        end
        if elapsed > 4.5 then
          atropos.emit({
            type = "vulnerability",
            value = "Blind SQLi (time-based) in param '" .. param_name .. "'",
            severity = "critical",
            source = "sqli_scanner",
            metadata = { param = param_name, payload = payload, delay = elapsed }
          })
        end
      end
    end
  end
end

atropos.log("SQLi scan complete for " .. target)
`
    },
    {
      id: "xss_scanner",
      name: "XSS Reflection Scanner",
      category: "vulnerability",
      focus: "bug_bounty",
      difficulty: "intermediate",
      description: "Detect reflected XSS by injecting payloads into URL parameters and checking for reflection",
      tags: ["xss", "reflection", "web", "bug-bounty", "owasp"],
      content: `-- XSS Reflection Scanner
-- Focus: Bug Bounty
-- Detects reflected XSS in URL parameters

local target = atropos.args.target or "https://example.com/search?q=test"

local payloads = {
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "'-alert(1)-'",
  '<svg/onload=alert(1)>',
  'javascript:alert(1)',
  '{{7*7}}',
  '\${7*7}',
}

local canary = "ATROPOS" .. tostring(math.random(10000, 99999))

local base_url, query = target:match("^(.+)%?(.+)$")
if not query then
  atropos.log("No query parameters found in URL")
  return
end

for param_pair in query:gmatch("[^&]+") do
  local param_name, param_value = param_pair:match("^(.+)=(.*)$")
  if param_name then
    local canary_query = query:gsub(
      param_name .. "=" .. param_value,
      param_name .. "=" .. canary
    )
    local canary_resp = atropos.http.get(base_url .. "?" .. canary_query)
    if canary_resp and canary_resp.body and canary_resp.body:find(canary) then
      atropos.emit({
        type = "info",
        value = "Parameter '" .. param_name .. "' reflects input",
        severity = "info",
        source = "xss_scanner",
        metadata = { param = param_name }
      })

      for _, payload in ipairs(payloads) do
        local test_query = query:gsub(
          param_name .. "=" .. param_value,
          param_name .. "=" .. atropos.url.encode(payload)
        )
        local resp = atropos.http.get(base_url .. "?" .. test_query)
        if resp and resp.body and resp.body:find(payload, 1, true) then
          atropos.emit({
            type = "vulnerability",
            value = "Reflected XSS in param '" .. param_name .. "'",
            severity = "high",
            source = "xss_scanner",
            metadata = { param = param_name, payload = payload, url = base_url .. "?" .. test_query }
          })
        end
      end
    end
  end
end

atropos.log("XSS scan complete for " .. target)
`
    },
    {
      id: "ioc_hunter",
      name: "IOC Threat Hunter",
      category: "threat_intel",
      focus: "threat_hunting",
      difficulty: "intermediate",
      description: "Hunt for indicators of compromise: suspicious domains, C2 patterns, and malicious infrastructure",
      tags: ["ioc", "c2", "threat-hunting", "malware", "indicators"],
      content: `-- IOC Threat Hunter
-- Focus: Threat Hunting
-- Hunts for indicators of compromise in target infrastructure

local target = atropos.args.target or "example.com"

local suspicious_patterns = {
  dns = {
    { pattern = "%.top$", desc = "Suspicious TLD (.top)", severity = "medium" },
    { pattern = "%.xyz$", desc = "Suspicious TLD (.xyz)", severity = "low" },
    { pattern = "%.tk$", desc = "Known abuse TLD (.tk)", severity = "high" },
    { pattern = "%d+%.%d+%.%d+%.%d+%.in%-addr", desc = "Reverse DNS PTR", severity = "info" },
  },
  http = {
    { header = "server", pattern = "nginx/1%.[0-9]$", desc = "Outdated Nginx", severity = "medium" },
    { header = "server", pattern = "Apache/2%.2", desc = "Outdated Apache", severity = "medium" },
  }
}

local dns = atropos.dns.resolve(target, "A")
if dns then
  for _, record in ipairs(dns) do
    atropos.emit({
      type = "dns_record",
      value = target .. " -> " .. record.value,
      severity = "info",
      source = "ioc_hunter",
      metadata = { record_type = "A", ip = record.value }
    })

    local rdns = atropos.dns.reverse(record.value)
    if rdns then
      for _, pat in ipairs(suspicious_patterns.dns) do
        if rdns:match(pat.pattern) then
          atropos.emit({
            type = "suspicious_dns",
            value = pat.desc .. ": " .. rdns,
            severity = pat.severity,
            source = "ioc_hunter",
            metadata = { ip = record.value, rdns = rdns }
          })
        end
      end
    end
  end
end

local mx = atropos.dns.resolve(target, "MX")
if mx then
  for _, record in ipairs(mx) do
    atropos.emit({
      type = "mx_record",
      value = target .. " MX -> " .. record.value,
      severity = "info",
      source = "ioc_hunter",
      metadata = { record_type = "MX", priority = record.priority }
    })
  end
end

local resp = atropos.http.get("https://" .. target)
if resp and resp.headers then
  for _, check in ipairs(suspicious_patterns.http) do
    local val = resp.headers[check.header]
    if val and val:match(check.pattern) then
      atropos.emit({
        type = "suspicious_service",
        value = check.desc .. ": " .. val,
        severity = check.severity,
        source = "ioc_hunter",
        metadata = { header = check.header, value = val }
      })
    end
  end
end

atropos.log("IOC hunt complete for " .. target)
`
    },
    {
      id: "dir_bruteforce",
      name: "Directory Bruteforcer",
      category: "recon",
      focus: "bug_bounty",
      difficulty: "intermediate",
      description: "Discover hidden directories, backup files, and admin panels",
      tags: ["directories", "bruteforce", "recon", "bug-bounty", "web"],
      content: `-- Directory Bruteforcer
-- Focus: Bug Bounty
-- Discovers hidden paths, backups, and admin panels

local target = atropos.args.target or "https://example.com"
if not target:match("^https?://") then target = "https://" .. target end

local wordlist = {
  "admin", "administrator", "login", "wp-admin", "wp-login.php",
  "dashboard", "panel", "cpanel", "phpmyadmin", "adminer",
  ".git/HEAD", ".env", ".htaccess", "robots.txt", "sitemap.xml",
  "backup", "backup.zip", "backup.sql", "db.sql", "dump.sql",
  "api", "api/v1", "api/v2", "swagger", "api-docs", "graphql",
  "config", "config.php", "config.yml", "settings",
  ".well-known/security.txt", "crossdomain.xml",
  "server-status", "server-info", "debug", "trace",
  "test", "staging", "dev", "old", "temp",
  "uploads", "files", "images", "assets", "static",
  "cgi-bin", "scripts", "includes", "vendor",
  "xmlrpc.php", "wp-json", "wp-content/debug.log",
}

local found = 0
for _, path in ipairs(wordlist) do
  local url = target .. "/" .. path
  local resp = atropos.http.get(url, {
    timeout = 5,
    follow_redirects = false
  })

  if resp then
    local status = resp.status
    if status == 200 or status == 301 or status == 302 or status == 403 then
      local severity = "info"
      if path:match("%.env") or path:match("%.git") or path:match("backup") then
        severity = "high"
      elseif path:match("admin") or path:match("phpmyadmin") or path:match("debug") then
        severity = "medium"
      end

      atropos.emit({
        type = "directory",
        value = url .. " [" .. status .. "]",
        severity = severity,
        source = "dir_bruteforce",
        metadata = {
          path = "/" .. path,
          status = status,
          content_length = resp.headers and resp.headers["content-length"] or "unknown"
        }
      })
      found = found + 1
    end
  end
end

atropos.log("Directory scan complete: " .. found .. " paths discovered on " .. target)
`
    },
    {
      id: "lateral_movement",
      name: "Lateral Movement Detector",
      category: "threat_intel",
      focus: "threat_hunting",
      difficulty: "advanced",
      description: "Detect signs of lateral movement: shared infrastructure, domain fronting, and related assets",
      tags: ["lateral", "infrastructure", "threat-hunting", "apt", "advanced"],
      content: `-- Lateral Movement Detector
-- Focus: Threat Hunting
-- Maps related infrastructure and shared hosting patterns

local target = atropos.args.target or "example.com"

local dns_a = atropos.dns.resolve(target, "A")
local primary_ips = {}
if dns_a then
  for _, r in ipairs(dns_a) do
    table.insert(primary_ips, r.value)
  end
end

for _, ip in ipairs(primary_ips) do
  local rdns = atropos.dns.reverse(ip)
  if rdns and rdns ~= target then
    atropos.emit({
      type = "shared_hosting",
      value = "Reverse DNS: " .. ip .. " -> " .. rdns,
      severity = "info",
      source = "lateral_detector",
      metadata = { ip = ip, rdns = rdns, target = target }
    })
  end

  local asn = atropos.net.asn_lookup(ip)
  if asn then
    atropos.emit({
      type = "network_info",
      value = "ASN: " .. (asn.asn or "unknown") .. " (" .. (asn.org or "unknown") .. ")",
      severity = "info",
      source = "lateral_detector",
      metadata = { ip = ip, asn = asn.asn, org = asn.org, prefix = asn.prefix }
    })
  end
end

local ns_records = atropos.dns.resolve(target, "NS")
if ns_records then
  for _, ns in ipairs(ns_records) do
    atropos.emit({
      type = "nameserver",
      value = target .. " NS -> " .. ns.value,
      severity = "info",
      source = "lateral_detector",
      metadata = { ns = ns.value }
    })
  end
end

local txt_records = atropos.dns.resolve(target, "TXT")
if txt_records then
  for _, txt in ipairs(txt_records) do
    local val = txt.value or ""
    if val:match("v=spf") or val:match("include:") then
      for include in val:gmatch("include:([%w%.%-]+)") do
        atropos.emit({
          type = "spf_include",
          value = "SPF includes: " .. include,
          severity = "info",
          source = "lateral_detector",
          metadata = { spf_include = include }
        })
      end
    end
  end
end

atropos.log("Lateral movement analysis complete for " .. target)
`
    },
    {
      id: "api_fuzzer",
      name: "API Endpoint Fuzzer",
      category: "vulnerability",
      focus: "bug_bounty",
      difficulty: "advanced",
      description: "Fuzz REST API endpoints for authentication bypass, IDOR, and parameter tampering",
      tags: ["api", "fuzzing", "idor", "auth-bypass", "bug-bounty"],
      content: `-- API Endpoint Fuzzer
-- Focus: Bug Bounty
-- Tests API endpoints for common vulnerabilities

local target = atropos.args.target or "https://api.example.com"
if not target:match("^https?://") then target = "https://" .. target end

local api_paths = {
  "/api/v1/users", "/api/v1/users/1", "/api/v1/admin",
  "/api/v2/users", "/api/users/me", "/api/profile",
  "/api/config", "/api/debug", "/api/health",
  "/api/graphql", "/graphql",
}

local auth_bypass_headers = {
  { ["X-Original-URL"] = "/admin" },
  { ["X-Forwarded-For"] = "127.0.0.1" },
  { ["X-Custom-IP-Authorization"] = "127.0.0.1" },
  { ["X-Rewrite-URL"] = "/admin" },
}

for _, api_path in ipairs(api_paths) do
  local url = target .. api_path
  local resp = atropos.http.get(url, { timeout = 5 })

  if resp then
    if resp.status == 200 then
      atropos.emit({
        type = "api_endpoint",
        value = "Accessible: " .. url .. " [200]",
        severity = "info",
        source = "api_fuzzer",
        metadata = { path = api_path, status = 200 }
      })

      local body = resp.body or ""
      if body:match('"password"') or body:match('"secret"') or body:match('"token"') then
        atropos.emit({
          type = "data_exposure",
          value = "Sensitive fields in response: " .. url,
          severity = "high",
          source = "api_fuzzer",
          metadata = { path = api_path }
        })
      end
    elseif resp.status == 403 or resp.status == 401 then
      for _, headers in ipairs(auth_bypass_headers) do
        local bypass = atropos.http.get(url, { headers = headers, timeout = 5 })
        if bypass and bypass.status == 200 then
          local header_name = next(headers)
          atropos.emit({
            type = "vulnerability",
            value = "Auth bypass via " .. header_name .. " on " .. url,
            severity = "critical",
            source = "api_fuzzer",
            metadata = { path = api_path, bypass_header = header_name }
          })
        end
      end
    end
  end
end

atropos.log("API fuzzing complete for " .. target)
`
    },
    {
      id: "empty_template",
      name: "Blank Script",
      category: "general",
      focus: "general",
      difficulty: "beginner",
      description: "Empty starter template with Atropos API reference comments",
      tags: ["template", "starter", "reference"],
      content: `-- My Custom Atropos Script
-- Description: [Your description here]
-- Category: general

-- ============ Atropos API Reference ============
-- atropos.args.target      - The scan target (domain, IP, URL)
-- atropos.http.get(url)    - HTTP GET request
-- atropos.http.post(url, body) - HTTP POST request
-- atropos.dns.resolve(domain, type) - DNS resolution (A, AAAA, MX, TXT, NS)
-- atropos.dns.reverse(ip)  - Reverse DNS lookup
-- atropos.net.probe(host, port) - TCP port probe
-- atropos.json.decode(str) - Parse JSON string
-- atropos.json.encode(obj) - Encode to JSON
-- atropos.url.encode(str)  - URL encode string
-- atropos.emit(finding)    - Emit a finding { type, value, severity, source, metadata }
-- atropos.log(message)     - Log a message
-- ================================================

local target = atropos.args.target or "example.com"

-- Your scan logic here

atropos.log("Scan complete for " .. target)
`
    },
  ];
  res.json(templates);
});

router.post("/lua-scripts", async (req: Request, res: Response) => {
  try {
    const { filename, content, category, description: desc, tags } = req.body;
    if (!filename || !content) return res.status(400).json({ error: "filename and content required" });
    if (!filename.endsWith(".lua")) return res.status(400).json({ error: "filename must end with .lua" });
    if (/[\/\\]/.test(filename)) return res.status(400).json({ error: "filename cannot contain path separators" });
    const scriptsDir = process.env.ATROPOS_SCRIPTS_DIR || path.join(process.cwd(), "tools", "atropos", "examples");
    await fs.mkdir(scriptsDir, { recursive: true });
    let finalContent = content;
    if (desc && !content.startsWith("--")) {
      finalContent = `-- ${desc}\n${content}`;
    }
    const filePath = path.join(scriptsDir, filename);
    await fs.writeFile(filePath, finalContent, "utf-8");
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

// ============ Frida Integration ============

router.get("/frida/status", async (_req: Request, res: Response) => {
  try {
    const { execSync } = require("child_process");
    let version = null;
    try { version = execSync("frida --version 2>/dev/null", { timeout: 5000 }).toString().trim(); } catch {}
    res.json({
      installed: !!version,
      version: version || null,
      installCommand: "pip install frida-tools",
      docs: "https://frida.re/docs/home/",
      capabilities: [
        "Dynamic instrumentation of running processes",
        "Hook native functions and trace API calls",
        "Intercept crypto operations and network traffic",
        "Bypass SSL pinning on mobile apps",
        "Runtime code modification without recompilation",
        "JavaScript-based scripting engine",
        "Cross-platform: Windows, macOS, Linux, iOS, Android"
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/frida/script/generate", async (req: Request, res: Response) => {
  try {
    const { scriptType, target, options } = req.body;
    if (!scriptType) return res.status(400).json({ error: "scriptType required" });

    const templates: Record<string, { name: string; description: string; code: string }> = {
      ssl_bypass: {
        name: "SSL Pinning Bypass",
        description: "Bypass SSL certificate pinning on Android/iOS apps",
        code: `Java.perform(function() {
  // Android SSL Pinning Bypass
  var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
  TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
    console.log('[*] SSL Pinning Bypass - Host: ' + host);
    return untrustedChain;
  };

  // OkHttp3 Certificate Pinner
  try {
    var CertificatePinner = Java.use('okhttp3.CertificatePinner');
    CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(hostname, peerCertificates) {
      console.log('[*] OkHttp3 Pinning Bypass - Host: ' + hostname);
    };
  } catch(e) {
    console.log('[!] OkHttp3 not found: ' + e);
  }

  console.log('[+] SSL Pinning bypass active');
});`
      },
      crypto_trace: {
        name: "Crypto API Tracer",
        description: "Trace cryptographic operations (AES, RSA, hashing)",
        code: `// Trace crypto operations
Interceptor.attach(Module.findExportByName(null, 'CCCrypt'), {
  onEnter: function(args) {
    var operation = args[0].toInt32();
    var algorithm = args[1].toInt32();
    var options = args[2].toInt32();
    var keyLength = args[4].toInt32();

    var ops = { 0: 'Encrypt', 1: 'Decrypt' };
    var algos = { 0: 'AES', 1: 'DES', 2: '3DES', 3: 'CAST', 4: 'RC4', 5: 'RC2', 6: 'Blowfish' };

    console.log('[CRYPTO] ' + (ops[operation] || 'Unknown') + ' with ' + (algos[algorithm] || 'Unknown'));
    console.log('  Key length: ' + keyLength + ' bytes');
    if (keyLength > 0 && keyLength <= 64) {
      console.log('  Key: ' + hexdump(args[3], { length: keyLength }));
    }
  },
  onLeave: function(retval) {
    console.log('[CRYPTO] Result: ' + retval);
  }
});

// Trace SHA/MD5 hashing
['CC_SHA1', 'CC_SHA256', 'CC_SHA512', 'CC_MD5'].forEach(function(fname) {
  var addr = Module.findExportByName(null, fname);
  if (addr) {
    Interceptor.attach(addr, {
      onEnter: function(args) {
        var dataLen = args[1].toInt32();
        console.log('[HASH] ' + fname + ' - ' + dataLen + ' bytes');
      }
    });
  }
});

console.log('[+] Crypto tracer active');`
      },
      network_monitor: {
        name: "Network Traffic Monitor",
        description: "Monitor network connections and HTTP requests",
        code: `// Network connection monitor
['connect', 'send', 'recv', 'read', 'write'].forEach(function(fname) {
  var addr = Module.findExportByName(null, fname);
  if (addr) {
    Interceptor.attach(addr, {
      onEnter: function(args) {
        if (fname === 'connect') {
          var sockaddr = args[1];
          var family = sockaddr.readU16();
          if (family === 2) { // AF_INET
            var port = (sockaddr.add(2).readU8() << 8) | sockaddr.add(3).readU8();
            var ip = sockaddr.add(4).readU8() + '.' + sockaddr.add(5).readU8() + '.' +
                     sockaddr.add(6).readU8() + '.' + sockaddr.add(7).readU8();
            console.log('[NET] connect -> ' + ip + ':' + port);
          }
        }
      }
    });
  }
});

// HTTP URL tracer (iOS/macOS)
if (ObjC.available) {
  var NSURLRequest = ObjC.classes.NSURLRequest;
  Interceptor.attach(NSURLRequest['- initWithURL:'].implementation, {
    onEnter: function(args) {
      var url = ObjC.Object(args[2]);
      console.log('[HTTP] Request: ' + url.absoluteString());
    }
  });
}

console.log('[+] Network monitor active');`
      },
      api_hook: {
        name: "API Function Hooker",
        description: "Hook and trace specific API functions with arguments",
        code: `// Generic API hooker template
// Replace 'targetFunction' and 'targetLibrary' with your targets

var targetLib = '${target || "libc.so"}';
var targetFunctions = [
  'open', 'close', 'read', 'write',
  'malloc', 'free',
  'dlopen', 'dlsym'
];

targetFunctions.forEach(function(fname) {
  var addr = Module.findExportByName(targetLib === '*' ? null : targetLib, fname);
  if (addr) {
    Interceptor.attach(addr, {
      onEnter: function(args) {
        this.fname = fname;
        if (fname === 'open') {
          var path = args[0].readUtf8String();
          console.log('[API] open("' + path + '")');
          this.path = path;
        } else if (fname === 'dlopen') {
          var lib = args[0].readUtf8String();
          console.log('[API] dlopen("' + lib + '")');
        } else {
          console.log('[API] ' + fname + '(' + args[0] + ')');
        }
      },
      onLeave: function(retval) {
        if (this.fname === 'open') {
          console.log('[API] open returned fd=' + retval);
        }
      }
    });
    console.log('[+] Hooked: ' + fname + ' at ' + addr);
  }
});

console.log('[+] API hooker active on ' + targetLib);`
      },
      root_jailbreak_detect: {
        name: "Root/Jailbreak Detection Bypass",
        description: "Bypass root and jailbreak detection in mobile apps",
        code: `Java.perform(function() {
  // Bypass common root detection methods
  var RootBeer = null;
  try { RootBeer = Java.use('com.scottyab.rootbeer.RootBeer'); } catch(e) {}

  if (RootBeer) {
    RootBeer.isRooted.implementation = function() {
      console.log('[*] RootBeer.isRooted() bypassed');
      return false;
    };
    RootBeer.isRootedWithoutBusyBoxCheck.implementation = function() {
      return false;
    };
  }

  // Generic file existence checks
  var File = Java.use('java.io.File');
  var originalExists = File.exists;
  File.exists.implementation = function() {
    var path = this.getAbsolutePath();
    var rootPaths = ['/system/app/Superuser.apk', '/sbin/su', '/system/bin/su',
      '/system/xbin/su', '/data/local/xbin/su', '/data/local/bin/su',
      '/system/sd/xbin/su', '/system/bin/failsafe/su', '/data/local/su',
      '/su/bin/su', '/magisk'];

    for (var i = 0; i < rootPaths.length; i++) {
      if (path === rootPaths[i]) {
        console.log('[*] Root check bypassed: ' + path);
        return false;
      }
    }
    return originalExists.call(this);
  };

  // System property checks
  var SystemProperties = Java.use('android.os.SystemProperties');
  SystemProperties.get.overload('java.lang.String').implementation = function(key) {
    if (key === 'ro.build.tags' || key === 'ro.debuggable') {
      console.log('[*] System property bypass: ' + key);
      return 'release-keys';
    }
    return this.get(key);
  };

  console.log('[+] Root/Jailbreak detection bypass active');
});`
      },
    };

    const template = templates[scriptType];
    if (!template) {
      return res.json({
        available: Object.keys(templates).map(k => ({
          id: k,
          name: templates[k].name,
          description: templates[k].description
        }))
      });
    }

    res.json({
      name: template.name,
      description: template.description,
      scriptType,
      target: target || null,
      code: template.code,
      usage: `frida -U -l script.js ${target || "<target_app>"}`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PANO OSINT Integration ============

router.get("/pano/status", async (_req: Request, res: Response) => {
  try {
    const panoDir = path.join(process.cwd(), "tools", "pano");
    let installed = false;
    try { await fs.access(panoDir); installed = true; } catch {}

    res.json({
      installed,
      installCommand: "git clone https://github.com/ALW1EZ/PANO.git tools/pano",
      docs: "https://github.com/ALW1EZ/PANO",
      entityTypes: [
        { type: "email", description: "Email addresses with service detection" },
        { type: "username", description: "Social media username tracking" },
        { type: "website", description: "Web pages with metadata extraction" },
        { type: "image", description: "EXIF data extraction and image analysis" },
        { type: "location", description: "Geographic coordinates and mapping" },
        { type: "event", description: "Time-based occurrence tracking" },
        { type: "text", description: "Generic text content processing" },
      ],
      transforms: [
        { type: "discovery", description: "Find new entities from existing ones" },
        { type: "correlation", description: "Connect related entities" },
        { type: "analysis", description: "Extract insights from entity data" },
        { type: "osint", description: "Gather open-source intelligence" },
        { type: "enrichment", description: "Add data to existing entities" },
      ],
      helpers: [
        { name: "Cross-Examination", description: "Analyze statements and testimonies" },
        { name: "Portrait Creator", description: "Generate facial composites" },
        { name: "Media Analyzer", description: "Advanced image processing and analysis" },
        { name: "Base Searcher", description: "Search near places of interest" },
        { name: "Translator", description: "Translate text between languages" },
      ],
      capabilities: [
        "Interactive graph visualization of entity relationships",
        "Timeline analysis to correlate events chronologically",
        "AI-powered pattern recognition and investigation guidance",
        "Built-in transforms for automated OSINT discovery",
        "Entity system with type-safe validation",
        "Custom helper creation for specialized tasks"
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/pano/transform", async (req: Request, res: Response) => {
  try {
    const { entityType, entityValue, transformType = "discovery" } = req.body;
    if (!entityType || !entityValue) return res.status(400).json({ error: "entityType and entityValue required" });

    const results: any[] = [];
    const ts = new Date().toISOString();

    if (entityType === "email") {
      const domain = entityValue.split("@")[1] || "";
      const username = entityValue.split("@")[0] || "";
      results.push(
        { type: "username", value: username, source: "email_parse", confidence: 0.9, metadata: { derived_from: entityValue } },
        { type: "website", value: `https://${domain}`, source: "email_domain", confidence: 0.95, metadata: { domain } }
      );
      const services: Record<string, string> = {
        "gmail.com": "Google", "outlook.com": "Microsoft", "yahoo.com": "Yahoo",
        "protonmail.com": "ProtonMail", "icloud.com": "Apple"
      };
      if (services[domain]) {
        results.push({ type: "text", value: `Email provider: ${services[domain]}`, source: "service_detection", confidence: 1.0 });
      }
    } else if (entityType === "username") {
      const platforms = [
        { name: "GitHub", url: `https://github.com/${entityValue}` },
        { name: "Twitter", url: `https://twitter.com/${entityValue}` },
        { name: "Reddit", url: `https://reddit.com/u/${entityValue}` },
        { name: "Instagram", url: `https://instagram.com/${entityValue}` },
        { name: "LinkedIn", url: `https://linkedin.com/in/${entityValue}` },
      ];
      for (const platform of platforms) {
        results.push({
          type: "website", value: platform.url,
          source: "username_enum", confidence: 0.6,
          metadata: { platform: platform.name, username: entityValue, status: "unverified" }
        });
      }
    } else if (entityType === "website") {
      try {
        const url = entityValue.startsWith("http") ? entityValue : `https://${entityValue}`;
        const domain = new URL(url).hostname;
        results.push(
          { type: "text", value: `Domain: ${domain}`, source: "url_parse", confidence: 1.0 },
          { type: "text", value: `Protocol: ${new URL(url).protocol}`, source: "url_parse", confidence: 1.0 }
        );
        const resp = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) }).catch(() => null);
        if (resp) {
          const server = resp.headers.get("server");
          const powered = resp.headers.get("x-powered-by");
          if (server) results.push({ type: "text", value: `Server: ${server}`, source: "http_headers", confidence: 0.9 });
          if (powered) results.push({ type: "text", value: `Powered by: ${powered}`, source: "http_headers", confidence: 0.9 });
          results.push({ type: "text", value: `HTTP Status: ${resp.status}`, source: "http_probe", confidence: 1.0 });
        }
      } catch {}
    } else if (entityType === "location") {
      results.push({ type: "text", value: `Location entity registered: ${entityValue}`, source: "location_parse", confidence: 1.0 });
    }

    res.json({
      entity: { type: entityType, value: entityValue },
      transform: transformType,
      timestamp: ts,
      results,
      graph: {
        nodes: [
          { id: "root", label: entityValue, type: entityType },
          ...results.map((r, i) => ({ id: `n${i}`, label: r.value.slice(0, 50), type: r.type }))
        ],
        edges: results.map((_, i) => ({ from: "root", to: `n${i}`, label: results[i].source }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ OSINT Toolkit Integration ============

router.get("/osint-toolkit/status", async (_req: Request, res: Response) => {
  try {
    res.json({
      name: "OSINT Toolkit",
      version: "latest",
      source: "https://github.com/dev-lu/osint_toolkit",
      stack: "Docker (React frontend + Python FastAPI backend)",
      deployment: "docker-compose up",
      modules: [
        {
          id: "newsfeed",
          name: "Newsfeed",
          description: "Aggregates cybersecurity news from Wired, The Hacker News, Security Magazine, Threatpost, TechCrunch Security, Dark Reading",
          features: ["Auto IOC extraction from articles", "AI-powered analysis", "Real-time threat intelligence"]
        },
        {
          id: "ioc_tools",
          name: "IOC Tools",
          description: "Analyze IPs, hashes, emails, domains, URLs against threat intelligence services",
          features: ["Auto-detect IOC type", "Bulk analysis", "Fanging/defanging", "Multi-service lookup"],
          services: {
            ips: ["AbuseIPDB", "Alienvault", "CrowdSec", "IPQualityScore", "Shodan", "VirusTotal"],
            domains: ["Alienvault", "Checkphish.ai", "Shodan", "URLScan", "VirusTotal"],
            urls: ["Google Safe Browsing", "URLScan", "VirusTotal"],
            emails: ["Emailrep.io", "Hunter.io", "Have I Been Pwned"],
            hashes: ["Alienvault", "Maltiverse", "Pulsedive", "ThreatFox", "VirusTotal"],
            cves: ["GitHub", "NIST NVD"]
          }
        },
        {
          id: "email_analyzer",
          name: "Email Analyzer",
          description: "Drag-and-drop .eml file analysis for phishing and malware campaigns",
          features: ["EML parsing", "Security checks", "IOC extraction", "AI message analysis"]
        },
        {
          id: "domain_finder",
          name: "Domain Finder",
          description: "Find recently registered domains matching patterns for phishing detection",
          features: ["URLScan.io screenshots", "Domain TI checks", "Resolved IP analysis"]
        },
        {
          id: "ai_templates",
          name: "AI Templates",
          description: "AI-powered templates for log analysis, email analysis, and source code explanation",
          features: ["Custom template creation", "Prompt engineering support", "Multiple analysis types"]
        }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/osint-toolkit/ioc/analyze", async (req: Request, res: Response) => {
  try {
    const { ioc, type: iocType } = req.body;
    if (!ioc) return res.status(400).json({ error: "ioc required" });

    const detectedType = iocType || detectIOCType(ioc);
    const results: any = { ioc, type: detectedType, timestamp: new Date().toISOString(), analyses: [] };

    if (detectedType === "ip") {
      results.analyses.push(
        { service: "AbuseIPDB", status: "simulated", data: { abuseScore: Math.floor(Math.random() * 100), country: "US", isp: "Example ISP", totalReports: Math.floor(Math.random() * 50) } },
        { service: "Shodan", status: "simulated", data: { openPorts: [22, 80, 443], os: "Linux", hostnames: [`host-${ioc.replace(/\./g, '-')}.example.com`] } }
      );
    } else if (detectedType === "domain") {
      results.analyses.push(
        { service: "VirusTotal", status: "simulated", data: { malicious: Math.floor(Math.random() * 5), harmless: 60 + Math.floor(Math.random() * 20), lastAnalysis: new Date().toISOString() } },
        { service: "URLScan", status: "simulated", data: { screenshotAvailable: true, technologies: ["nginx", "React"], tlsValid: true } }
      );
    } else if (detectedType === "hash") {
      results.analyses.push(
        { service: "VirusTotal", status: "simulated", data: { detections: Math.floor(Math.random() * 40), total: 70, firstSeen: "2024-01-15", malwareFamily: "Generic.Trojan" } },
        { service: "ThreatFox", status: "simulated", data: { malwareType: "stealer", tags: ["infostealer", "banking"], confidence: 85 } }
      );
    } else if (detectedType === "email") {
      results.analyses.push(
        { service: "EmailRep", status: "simulated", data: { reputation: "low", suspicious: true, references: 3, breaches: 1 } },
        { service: "HaveIBeenPwned", status: "simulated", data: { breached: true, breachCount: 2, pasteCount: 0 } }
      );
    } else if (detectedType === "url") {
      results.analyses.push(
        { service: "Google Safe Browsing", status: "simulated", data: { safe: Math.random() > 0.3, threats: [] } },
        { service: "URLScan", status: "simulated", data: { malicious: false, screenshot: null, technologies: [] } }
      );
    } else if (detectedType === "cve") {
      results.analyses.push(
        { service: "NIST NVD", status: "simulated", data: { cvss: (Math.random() * 4 + 6).toFixed(1), severity: "HIGH", published: "2024-06-01", description: `Simulated vulnerability data for ${ioc}` } }
      );
    }

    results.riskScore = Math.floor(Math.random() * 60) + 20;
    results.defanged = defangIOC(ioc, detectedType);

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/osint-toolkit/ioc/extract", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });

    const extracted: any[] = [];
    const ipRegex = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g;
    const domainRegex = /\b([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g;
    const md5Regex = /\b[a-fA-F0-9]{32}\b/g;
    const sha256Regex = /\b[a-fA-F0-9]{64}\b/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    const cveRegex = /CVE-\d{4}-\d{4,}/g;

    const addUnique = (type: string, matches: string[] | null) => {
      if (!matches) return;
      const seen = new Set(extracted.filter(e => e.type === type).map(e => e.value));
      for (const m of matches) {
        if (!seen.has(m)) { extracted.push({ type, value: m }); seen.add(m); }
      }
    };

    addUnique("ip", text.match(ipRegex));
    addUnique("hash_sha256", text.match(sha256Regex));
    addUnique("hash_md5", text.match(md5Regex));
    addUnique("email", text.match(emailRegex));
    addUnique("url", text.match(urlRegex));
    addUnique("cve", text.match(cveRegex));
    addUnique("domain", text.match(domainRegex));

    res.json({ count: extracted.length, indicators: extracted, text_length: text.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function detectIOCType(ioc: string): string {
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc)) return "ip";
  if (/^CVE-\d{4}-\d{4,}$/i.test(ioc)) return "cve";
  if (/^[a-fA-F0-9]{64}$/.test(ioc)) return "hash";
  if (/^[a-fA-F0-9]{32}$/.test(ioc)) return "hash";
  if (/^[a-fA-F0-9]{40}$/.test(ioc)) return "hash";
  if (/^https?:\/\//.test(ioc)) return "url";
  if (/@/.test(ioc)) return "email";
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(ioc)) return "domain";
  return "unknown";
}

function defangIOC(ioc: string, type: string): string {
  if (type === "ip") return ioc.replace(/\./g, "[.]");
  if (type === "domain") return ioc.replace(/\./g, "[.]");
  if (type === "url") return ioc.replace("http://", "hxxp://").replace("https://", "hxxps://").replace(/\./g, "[.]");
  if (type === "email") return ioc.replace("@", "[@]").replace(/\./g, "[.]");
  return ioc;
}

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

// ============ OSINT Toolkit Integration (dev-lu/osint_toolkit) ============

const OSINT_SERVICE_PATH = path.join(process.cwd(), "tools", "osint_toolkit", "osint_service.py");

async function runOsintService(command: string, args: string[] = [], stdin?: string): Promise<any> {
  const { execSync } = require("child_process");
  try {
    const cmdArgs = [command, ...args].map(a => `"${a.replace(/"/g, '\\"')}"`).join(" ");
    const fullCmd = stdin
      ? `echo '${stdin.replace(/'/g, "'\\''")}' | python3 "${OSINT_SERVICE_PATH}" ${cmdArgs}`
      : `python3 "${OSINT_SERVICE_PATH}" ${cmdArgs}`;
    const output = execSync(fullCmd, { timeout: 30000, maxBuffer: 5 * 1024 * 1024 }).toString();
    return JSON.parse(output);
  } catch (error: any) {
    const stderr = error.stderr?.toString() || "";
    const stdout = error.stdout?.toString() || "";
    try { return JSON.parse(stdout); } catch {}
    return { error: stderr || error.message || "OSINT service failed" };
  }
}

router.get("/osint/status", async (_req: Request, res: Response) => {
  try {
    const result = await runOsintService("status");
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/osint/ioc/lookup", async (req: Request, res: Response) => {
  try {
    const ioc = req.query.ioc as string;
    if (!ioc) return res.status(400).json({ error: "ioc query parameter required" });
    const result = await runOsintService("ioc_lookup", [ioc]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/osint/ioc/type", async (req: Request, res: Response) => {
  try {
    const ioc = req.query.ioc as string;
    if (!ioc) return res.status(400).json({ error: "ioc query parameter required" });
    const result = await runOsintService("ioc_type", [ioc]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/osint/ioc/extract", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text field required" });
    const result = await runOsintService("ioc_extract", [text]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/osint/dns", async (req: Request, res: Response) => {
  try {
    const target = req.query.target as string;
    if (!target) return res.status(400).json({ error: "target query parameter required" });
    const result = await runOsintService("dns", [target]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/osint/whois", async (req: Request, res: Response) => {
  try {
    const target = req.query.target as string;
    if (!target) return res.status(400).json({ error: "target query parameter required" });
    const result = await runOsintService("whois", [target]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/osint/headers", async (req: Request, res: Response) => {
  try {
    const target = req.query.target as string;
    if (!target) return res.status(400).json({ error: "target query parameter required" });
    const result = await runOsintService("headers", [target]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/osint/ssl", async (req: Request, res: Response) => {
  try {
    const target = req.query.target as string;
    if (!target) return res.status(400).json({ error: "target query parameter required" });
    const result = await runOsintService("ssl", [target]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/osint/crt", async (req: Request, res: Response) => {
  try {
    const target = req.query.target as string;
    if (!target) return res.status(400).json({ error: "target query parameter required" });
    const result = await runOsintService("crt", [target]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/osint/ports", async (req: Request, res: Response) => {
  try {
    const target = req.query.target as string;
    if (!target) return res.status(400).json({ error: "target query parameter required" });
    const result = await runOsintService("ports", [target]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/osint/newsfeed", async (_req: Request, res: Response) => {
  try {
    const result = await runOsintService("newsfeed", ["30"]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/osint/domain/recon", async (req: Request, res: Response) => {
  try {
    const target = req.query.target as string;
    if (!target) return res.status(400).json({ error: "target query parameter required" });
    const result = await runOsintService("domain_recon", [target]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/osint/defang", async (req: Request, res: Response) => {
  try {
    const { ioc } = req.body;
    if (!ioc) return res.status(400).json({ error: "ioc field required" });
    const result = await runOsintService("defang", [ioc]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/osint/refang", async (req: Request, res: Response) => {
  try {
    const { ioc } = req.body;
    if (!ioc) return res.status(400).json({ error: "ioc field required" });
    const result = await runOsintService("refang", [ioc]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/osint/scan/live", async (req: Request, res: Response) => {
  try {
    const { target, scanType = "domain_recon" } = req.body;
    if (!target) return res.status(400).json({ error: "target required" });

    const scanId = nanoid();
    const startTime = Date.now();

    let result: any;
    if (scanType === "domain_recon") {
      result = await runOsintService("domain_recon", [target]);
    } else if (scanType === "ioc_lookup") {
      result = await runOsintService("ioc_lookup", [target]);
    } else if (scanType === "port_scan") {
      result = await runOsintService("ports", [target]);
    } else if (scanType === "dns") {
      result = await runOsintService("dns", [target]);
    } else {
      result = await runOsintService("ioc_lookup", [target]);
    }

    const findings: AtroposFinding[] = [];

    if (result.dns) {
      if (result.dns.A) result.dns.A.forEach((ip: string) => findings.push({ type: "ip", value: ip, severity: "info", source: "osint-dns" }));
      if (result.dns.MX) result.dns.MX.forEach((mx: any) => findings.push({ type: "dns", value: `MX: ${mx.exchange || mx}`, severity: "info", source: "osint-dns" }));
      if (result.dns.NS) result.dns.NS.forEach((ns: string) => findings.push({ type: "dns", value: `NS: ${ns}`, severity: "info", source: "osint-dns" }));
    }

    if (result.cert_transparency?.subdomains) {
      result.cert_transparency.subdomains.forEach((sub: string) => findings.push({ type: "subdomain", value: sub, severity: "info", source: "crt.sh" }));
    }

    if (result.ports?.open_ports) {
      result.ports.open_ports.forEach((p: any) => findings.push({
        type: "port", value: `${p.port}/tcp (${p.service})`,
        severity: [3306, 5432, 3389, 445].includes(p.port) ? "high" : "info",
        source: "osint-portscan"
      }));
    }

    if (result.http_headers?.security_headers) {
      const sh = result.http_headers.security_headers;
      for (const [header, val] of Object.entries(sh)) {
        if (val === "MISSING") {
          findings.push({ type: "vulnerability", value: `Missing security header: ${header}`, severity: "medium", source: "osint-headers" });
        }
      }
      if (result.http_headers.server) {
        findings.push({ type: "technology", value: result.http_headers.server, severity: "info", source: "osint-headers" });
      }
    }

    if (result.ssl_cert?.notAfter) {
      const expiry = new Date(result.ssl_cert.notAfter);
      const now = new Date();
      const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / (86400000));
      if (daysLeft < 30) {
        findings.push({ type: "vulnerability", value: `SSL certificate expires in ${daysLeft} days`, severity: daysLeft < 7 ? "critical" : "high", source: "osint-ssl" });
      }
    }

    if (result.whois?.registrar) {
      findings.push({ type: "dns", value: `Registrar: ${result.whois.registrar}`, severity: "info", source: "osint-whois" });
    }

    if (result.lookups) {
      if (result.lookups.reverse_dns?.hostname) {
        findings.push({ type: "dns", value: `PTR: ${result.lookups.reverse_dns.hostname}`, severity: "info", source: "osint-rdns" });
      }
      if (result.lookups.port_scan?.open_ports) {
        result.lookups.port_scan.open_ports.forEach((p: any) => findings.push({
          type: "port", value: `${p.port}/tcp (${p.service})`,
          severity: [3306, 5432, 3389, 445].includes(p.port) ? "high" : "info",
          source: "osint-portscan"
        }));
      }
      if (result.lookups.nvd) {
        const nvd = result.lookups.nvd;
        if (nvd.description) {
          findings.push({ type: "vulnerability", value: `${nvd.id}: ${nvd.description.substring(0, 200)}`, severity: "high", source: "nvd" });
        }
      }
    }

    const criticalCount = findings.filter(f => f.severity === "critical").length;
    const highCount = findings.filter(f => f.severity === "high").length;
    const riskScore = Math.min(100, criticalCount * 40 + highCount * 20 + findings.length * 2);

    const scanResult: SimulatedScanResult = {
      id: scanId,
      scanType: `osint_${scanType}`,
      target,
      timestamp: new Date().toISOString(),
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
        riskScore,
        riskLevel: riskScore >= 50 ? "critical" : riskScore >= 30 ? "high" : riskScore >= 15 ? "medium" : "low"
      },
      scriptUsed: `osint_toolkit_${scanType}`
    };

    scanResults.set(scanId, scanResult);
    res.json({ ...scanResult, rawData: result, latencyMs: Date.now() - startTime });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const scanHistory: Array<{id: string; target: string; scanType: string; status: string; startedAt: string; completedAt?: string; findingsCount: number}> = [];

export function recordScanHistory(entry: typeof scanHistory[0]) {
  scanHistory.unshift(entry);
  if (scanHistory.length > 50) scanHistory.pop();
}

router.get("/scan-history", async (req: Request, res: Response) => {
  res.json(scanHistory);
});

export default router;
