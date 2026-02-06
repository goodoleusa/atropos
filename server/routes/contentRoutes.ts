import { Router } from "express";
import { storage } from "../storage";
import { 
  rateLimit, 
  sanitizeInput, 
  validateSessionToken
} from "../security";

const router = Router();

const PROMPT_RISK_PATTERNS = [
  { id: "shell-exec", regex: /\b(?:bash|sh|zsh|fish|cmd|powershell)\s+-c\b/i },
  { id: "script-exec", regex: /\b(?:python|node|perl|ruby)\s+-c\b/i },
  { id: "download-exec", regex: /\b(?:curl|wget)\b.*\|\s*(?:sh|bash|zsh|powershell|cmd)\b/i },
  { id: "destructive", regex: /\brm\s+-rf\b|\bmkfs\b|\bdd\s+if=|\bchmod\s+777\b/i },
  { id: "privileged", regex: /\bsudo\b|\bsu\s+-/i },
  { id: "process-spawn", regex: /\b(?:os\.system|subprocess\.|child_process|exec\(|spawn\(|popen\()/i },
  { id: "reverse-shell", regex: /\b(?:nc|netcat|socat)\b.*\b(?:-e|\/bin\/sh|\/bin\/bash)\b/i },
  { id: "shutdown-reboot", regex: /\b(?:shutdown|reboot)\b/i }
];

const sanitizePromptContent = (input: string) => {
  const cleaned = sanitizeInput(input, 50000);
  if (!cleaned) return '';
  const lines = cleaned.split('\n');
  const redacted = lines.map((line) => {
    const shouldRedact = PROMPT_RISK_PATTERNS.some((pattern) => pattern.regex.test(line));
    return shouldRedact ? '[REDACTED COMMAND]' : line;
  });
  return redacted.join('\n').trim();
};

const detectPromptRisks = (input: string) => {
  const flags: string[] = [];
  for (const pattern of PROMPT_RISK_PATTERNS) {
    if (pattern.regex.test(input)) {
      flags.push(pattern.id);
    }
  }
  return flags;
};

const THREAT_INTEL_FEEDS: Record<string, { url: string; method: 'GET' | 'POST'; body?: string }> = {
  'abuse_ch_urlhaus': { url: 'https://urlhaus-api.abuse.ch/v1/', method: 'POST', body: 'query=get_recent&limit=25' },
  'abuse_ch_threatfox': { url: 'https://threatfox-api.abuse.ch/api/v1/', method: 'POST', body: 'query=get_iocs&days=1' },
  'abuse_ch_malwarebazaar': { url: 'https://mb-api.abuse.ch/api/v1/', method: 'POST', body: 'query=get_recent&selector=100' },
  'cisa_kev': { url: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', method: 'GET' },
  'ransomware_live': { url: 'https://api.ransomware.live/recentvictims', method: 'GET' },
};

// ==================== Prompt Gallery ====================

router.get("/api/prompts/gallery", async (req, res) => {
  try {
    const statusParam = typeof req.query.status === "string" ? req.query.status : "published";
    const normalizedStatus = statusParam === "all" ? "" : statusParam;
    if (normalizedStatus && normalizedStatus !== "published") {
      const accessToken = req.headers['x-access-token'] as string;
      if (!accessToken || accessToken !== process.env.APP_ACCESS_TOKEN) {
        return res.status(403).json({ error: "Admin access required" });
      }
    }
    const prompts = await storage.getPromptGallery(normalizedStatus || undefined);
    res.json(prompts);
  } catch (error) {
    console.error("Get prompt gallery error:", error);
    res.status(500).json({ error: "Failed to fetch prompt gallery" });
  }
});

router.get("/api/prompts/gallery/mine/:token", async (req, res) => {
  try {
    const { token } = req.params;
    if (!validateSessionToken(token)) {
      return res.status(400).json({ error: "Invalid session token format" });
    }
    const prompts = await storage.getPromptGalleryBySession(token);
    res.json(prompts);
  } catch (error) {
    console.error("Get prompt submissions error:", error);
    res.status(500).json({ error: "Failed to fetch prompt submissions" });
  }
});

router.post("/api/prompts/gallery", rateLimit(20, 60000), async (req, res) => {
  try {
    const rawPrompt = typeof req.body.prompt === "string" ? req.body.prompt : "";
    const prompt = sanitizePromptContent(rawPrompt);
    const title = sanitizeInput(req.body.title || "", 200);
    const description = sanitizeInput(req.body.description || "", 1000);
    const category = sanitizeInput(req.body.category || "general", 50) || "general";
    const tool = sanitizeInput(req.body.tool || "atropos", 50) || "atropos";
    const username = sanitizeInput(req.body.username || "", 100);
    const sessionToken = typeof req.body.sessionToken === "string" ? req.body.sessionToken : undefined;

    if (sessionToken && !validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Invalid session token format" });
    }
    if (!title || !prompt) {
      return res.status(400).json({ error: "Title and prompt are required" });
    }

    const tags = Array.isArray(req.body.tags)
      ? req.body.tags
          .map((tag: string) => sanitizeInput(String(tag || ""), 50))
          .filter(Boolean)
          .slice(0, 12)
      : [];

    const riskFlags = detectPromptRisks(rawPrompt);
    const status = riskFlags.length > 0 ? "pending" : "published";

    const created = await storage.createPromptGalleryEntry({
      title,
      description,
      prompt,
      category,
      tool,
      tags,
      sessionToken,
      username,
      status,
      riskFlags
    });

    res.json(created);
  } catch (error) {
    console.error("Create prompt gallery entry error:", error);
    res.status(500).json({ error: "Failed to submit prompt" });
  }
});

// ==================== Agent Modules ====================

router.get("/api/agent-modules", async (req, res) => {
  try {
    const modules = await storage.getAllAgentModules();
    res.json(modules);
  } catch (error) {
    console.error("Get agent modules error:", error);
    res.status(500).json({ error: "Failed to get agent modules" });
  }
});

router.get("/api/agent-modules/active", async (req, res) => {
  try {
    const modules = await storage.getActiveAgentModules();
    res.json(modules);
  } catch (error) {
    console.error("Get active agent modules error:", error);
    res.status(500).json({ error: "Failed to get active agent modules" });
  }
});

router.get("/api/agent-modules/:moduleId", async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await storage.getAgentModuleById(moduleId);
    if (!module) {
      return res.status(404).json({ error: "Agent module not found" });
    }
    res.json(module);
  } catch (error) {
    console.error("Get agent module error:", error);
    res.status(500).json({ error: "Failed to get agent module" });
  }
});

router.put("/api/agent-modules/:moduleId", async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await storage.upsertAgentModule(moduleId, req.body);
    res.json(module);
  } catch (error) {
    console.error("Upsert agent module error:", error);
    res.status(500).json({ error: "Failed to save agent module" });
  }
});

router.delete("/api/agent-modules/:moduleId", async (req, res) => {
  try {
    const { moduleId } = req.params;
    await storage.deleteAgentModule(moduleId);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete agent module error:", error);
    res.status(500).json({ error: "Failed to delete agent module" });
  }
});

router.post("/api/agent-modules/seed", async (req, res) => {
  try {
    const { AGENT_CAMPAIGNS } = await import("../../client/src/config/agentCampaigns");
    let seeded = 0;
    for (const campaign of AGENT_CAMPAIGNS) {
      const existing = await storage.getAgentModuleById(campaign.id);
      if (!existing) {
        await storage.upsertAgentModule(campaign.id, {
          moduleId: campaign.id,
          name: campaign.name,
          icon: campaign.icon,
          description: campaign.description,
          difficulty: campaign.difficulty,
          estimatedTime: campaign.estimatedTime,
          tags: campaign.tags,
          color: campaign.color,
          starterPrompt: campaign.starterPrompt,
          objectives: campaign.objectives,
          tools: campaign.tools,
          targetFields: campaign.targetFields || [],
          dummyTargets: campaign.dummyTargets || {},
          steps: campaign.steps || [],
          adaptivePrompts: campaign.adaptivePrompts || [],
          isActive: true,
          sortOrder: seeded
        });
        seeded++;
      }
    }
    res.json({ success: true, seeded, total: AGENT_CAMPAIGNS.length });
  } catch (error) {
    console.error("Seed agent modules error:", error);
    res.status(500).json({ error: "Failed to seed agent modules" });
  }
});

// ==================== Designer Campaigns ====================

router.get("/api/designer/campaigns", async (req, res) => {
  try {
    const campaigns = await storage.getAllDesignerCampaigns();
    res.json(campaigns);
  } catch (error) {
    console.error("Get designer campaigns error:", error);
    res.status(500).json({ error: "Failed to fetch designer campaigns" });
  }
});

router.get("/api/designer/campaigns/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await storage.getDesignerCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error) {
    console.error("Get designer campaign error:", error);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

router.put("/api/designer/campaigns/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await storage.upsertDesignerCampaign(campaignId, req.body);
    res.json(campaign);
  } catch (error) {
    console.error("Save designer campaign error:", error);
    res.status(500).json({ error: "Failed to save campaign" });
  }
});

router.delete("/api/designer/campaigns/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;
    await storage.deleteDesignerCampaign(campaignId);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete designer campaign error:", error);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

router.post("/api/designer/campaigns/:campaignId/publish", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await storage.upsertDesignerCampaign(campaignId, { isPublished: true });
    res.json({ success: true, campaign });
  } catch (error) {
    console.error("Publish campaign error:", error);
    res.status(500).json({ error: "Failed to publish campaign" });
  }
});

router.post("/api/designer/campaigns/:campaignId/unpublish", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await storage.upsertDesignerCampaign(campaignId, { isPublished: false });
    res.json({ success: true, campaign });
  } catch (error) {
    console.error("Unpublish campaign error:", error);
    res.status(500).json({ error: "Failed to unpublish campaign" });
  }
});

// ==================== Published Campaigns (Player-facing) ====================

router.get("/api/campaigns/published", async (req, res) => {
  try {
    const campaigns = await storage.getPublishedDesignerCampaigns();
    const safe = campaigns.map(c => ({
      campaignId: c.campaignId,
      name: c.name,
      description: c.description,
      category: (c as any).category || "recon",
      difficulty: (c as any).difficulty || "beginner",
      estimatedTime: (c as any).estimatedTime || "15 min",
      nodeCount: (c.nodes as any[])?.length || 0,
      tags: c.tags || [],
    }));
    res.json(safe);
  } catch (error) {
    console.error("Get published campaigns error:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

router.get("/api/campaigns/:campaignId/play", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await storage.getDesignerCampaignById(campaignId);
    if (!campaign || !campaign.isPublished) {
      return res.status(404).json({ error: "Campaign not found or not published" });
    }
    res.json(campaign);
  } catch (error) {
    console.error("Get campaign for play error:", error);
    res.status(500).json({ error: "Failed to load campaign" });
  }
});

router.get("/api/campaigns/:campaignId/clue-check", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await storage.getDesignerCampaignById(campaignId);
    if (!campaign) return res.status(404).json({ error: "Not found" });
    const hiddenClues = (campaign as any).hiddenClues || [];
    const nodeId = req.query.nodeId as string;
    const answer = req.query.answer as string;
    if (!nodeId || !answer) return res.status(400).json({ error: "nodeId and answer required" });
    const clue = hiddenClues.find((c: any) => c.nodeId === nodeId && c.value.toLowerCase() === answer.toLowerCase());
    if (clue) {
      res.set("X-NEXUS-Clue-Found", clue.id);
      res.set("X-NEXUS-Hidden-Flag", `FLAG{${clue.id.toUpperCase().replace(/-/g, '_')}}`);
      return res.json({ found: true, clueId: clue.id, hint: clue.hint, flag: `FLAG{${clue.id.toUpperCase().replace(/-/g, '_')}}` });
    }
    res.json({ found: false });
  } catch (error) {
    res.status(500).json({ error: "Check failed" });
  }
});

router.get("/api/campaigns/:campaignId/hidden-beacon", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await storage.getDesignerCampaignById(campaignId);
    if (!campaign) return res.status(404).json({ error: "Not found" });
    const hiddenClues = (campaign as any).hiddenClues || [];
    const networkClues = hiddenClues.filter((c: any) => c.type === 'network-request');
    const nodeId = req.query.nodeId as string;
    const clue = networkClues.find((c: any) => c.nodeId === nodeId);
    res.set("X-NEXUS-Beacon", "true");
    res.set("X-NEXUS-Trace-ID", `TRACE-${Date.now().toString(36)}`);
    if (clue) {
      res.set("X-NEXUS-Secret", Buffer.from(clue.value).toString('base64'));
      res.set("X-NEXUS-Intel", clue.hint);
    }
    res.json({ status: "beacon_acknowledged", timestamp: Date.now() });
  } catch (error) {
    res.status(500).json({ error: "Beacon failed" });
  }
});

// ==================== Campaign Template Generator ====================

const TEMPLATE_GENERATORS: Record<string, (topic: string, skill: string) => any> = {
  osint_recon: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    const clueFlags = [
      { id: `clue-src-${id}`, type: 'source-code' as const, nodeId: 'n2', hint: 'Check the page source for a hidden HTML comment', value: `NEXUS{${topic.toUpperCase().replace(/\s/g,'_')}_RECON_INITIATED}` },
      { id: `clue-net-${id}`, type: 'network-request' as const, nodeId: 'n3', hint: 'Watch the Network tab - a beacon request reveals intel in its headers', value: `${topic}_dns_record_found` },
      { id: `clue-css-${id}`, type: 'css-comment' as const, nodeId: 'n4', hint: 'Inspect the CSS - a comment contains coordinates', value: `/* lat:40.7128 lon:-74.0060 target:${topic} */` },
      { id: `clue-b64-${id}`, type: 'base64' as const, nodeId: 'n5', hint: 'A base64 string in the data attributes decodes to a passphrase', value: Buffer.from(`NEXUS_OSINT_${topic}_COMPLETE`).toString('base64') },
      { id: `clue-console-${id}`, type: 'console-log' as const, nodeId: 'n6', hint: 'Open the browser console during this step', value: `[SIGNAL INTERCEPT] Target ${topic} confirmed at sector 7G` },
    ];
    return {
      name: `OSINT Recon: ${topic}`,
      description: `Open source intelligence gathering operation targeting ${topic}. Use dev tools, source inspection, and network analysis to uncover hidden intel.`,
      category: 'osint', difficulty: skill, estimatedTime: '20 min',
      nodes: [
        { id: 'n1', type: 'step', title: 'Mission Briefing', content: `**OPERATION OVERWATCH**\n\nYour target: **${topic}**\n\nIntel suggests hidden data channels. Use all available tools - browser dev tools, network inspector, source code viewer.\n\n> "The best reconnaissance is invisible." — Field Manual`, x: 80, y: 120, width: 280, height: 140, color: 'amber', metadata: { featureType: 'osint', skillLevel: skill } },
        { id: 'n2', type: 'tool', title: 'Source Recon', content: `Investigate the page source code for ${topic}.\n\nTip: Right-click → View Page Source, or Ctrl+U.\nLook for HTML comments, hidden elements, and data attributes.`, x: 400, y: 60, width: 260, height: 120, color: 'teal', metadata: { toolsForStep: ['view-source', 'inspect-element'], featureType: 'web' } },
        { id: 'n3', type: 'tool', title: 'Network Analysis', content: `Monitor network traffic for ${topic} related beacons.\n\nOpen DevTools → Network tab → watch for XHR/Fetch requests.\nExamine response headers carefully.`, x: 400, y: 210, width: 260, height: 120, color: 'teal', metadata: { toolsForStep: ['dev-tools', 'network-tab'], featureType: 'web' } },
        { id: 'n4', type: 'step', title: 'CSS Intelligence', content: `Examine stylesheet comments and computed styles.\n\nDevTools → Elements → look at the CSS rules.\nSome intelligence is hidden in plain sight.`, x: 700, y: 60, width: 260, height: 120, color: 'amber', metadata: { featureType: 'web' } },
        { id: 'n5', type: 'decision', title: 'Decode Intel', content: `You've found encoded data. What encoding is it?\n\n- Base64 → Decode with atob()\n- Hex → Convert character by character\n- ROT13 → Shift cipher`, x: 700, y: 210, width: 260, height: 130, color: 'purple', metadata: { featureType: 'crypto' } },
        { id: 'n6', type: 'output', title: 'Intel Report', content: `Compile your findings into a report.\n\nCheck the browser console for any final intercepts.\n\nDocument: target identifiers, discovered endpoints, decoded messages.`, x: 1000, y: 140, width: 260, height: 130, color: 'stone', metadata: { featureType: 'osint' } },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber', label: 'Begin source recon' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber', label: 'Monitor network' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal', label: 'Found embedded data' },
        { id: 'l4', source: 'n3', target: 'n5', color: 'teal', label: 'Intercepted traffic' },
        { id: 'l5', source: 'n4', target: 'n6', color: 'amber' },
        { id: 'l6', source: 'n5', target: 'n6', color: 'purple' },
      ],
      rootNodes: ['n1'],
      hiddenClues: clueFlags,
      tags: ['osint', 'recon', 'dev-tools', topic.toLowerCase()],
    };
  },

  network_forensics: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    return {
      name: `Network Forensics: ${topic}`,
      description: `Analyze suspicious network activity related to ${topic}. Trace packet flows, decode protocols, and identify malicious traffic patterns.`,
      category: 'forensics', difficulty: skill, estimatedTime: '25 min',
      nodes: [
        { id: 'n1', type: 'step', title: 'Incident Alert', content: `**ALERT: Anomalous traffic detected**\n\nSOC has flagged unusual ${topic}-related network activity.\nYour task: analyze the capture, trace the source, identify the payload.\n\n> Time-sensitive - the connection may drop.`, x: 80, y: 150, width: 280, height: 140, color: 'amber', metadata: { featureType: 'osint', skillLevel: skill } },
        { id: 'n2', type: 'tool', title: 'Packet Inspection', content: `Examine the HTTP headers in your browser's Network tab.\n\nLook for:\n- Unusual User-Agent strings\n- Custom X- headers\n- Encoded payloads in query params\n- Suspicious redirect chains`, x: 400, y: 80, width: 260, height: 140, color: 'teal', metadata: { toolsForStep: ['wireshark', 'tcpdump', 'dev-tools'] } },
        { id: 'n3', type: 'decision', title: 'Traffic Classification', content: `What type of traffic is this?\n\n→ C2 Beacon (periodic check-ins)\n→ Data Exfiltration (large outbound)\n→ Lateral Movement (internal scans)\n→ Payload Delivery (encoded downloads)`, x: 400, y: 260, width: 260, height: 140, color: 'purple', metadata: { featureType: 'agent' } },
        { id: 'n4', type: 'tool', title: 'DNS Tunneling Check', content: `Inspect DNS queries for ${topic}.\n\nSuspicious patterns:\n- Unusually long subdomain labels\n- High frequency TXT record queries\n- Base32/Base64 in domain names\n\nCheck the page source for encoded DNS data.`, x: 700, y: 80, width: 260, height: 140, color: 'teal', metadata: { toolsForStep: ['dns-lookup', 'dig'] } },
        { id: 'n5', type: 'step', title: 'Decode C2 Protocol', content: `The beacon uses a custom encoding scheme.\n\nExamine data-* attributes on this page for encoded C2 commands.\nDecode the hex values to reveal the command structure.`, x: 700, y: 260, width: 260, height: 130, color: 'amber', metadata: { featureType: 'crypto' } },
        { id: 'n6', type: 'output', title: 'Incident Report', content: `Create your incident report:\n\n1. Timeline of events\n2. IOCs discovered\n3. Attack classification\n4. Recommended mitigations\n\nFlag format: FLAG{category_finding}`, x: 1000, y: 170, width: 260, height: 140, color: 'stone' },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal' },
        { id: 'l4', source: 'n3', target: 'n5', color: 'purple' },
        { id: 'l5', source: 'n4', target: 'n6', color: 'teal' },
        { id: 'l6', source: 'n5', target: 'n6', color: 'amber' },
      ],
      rootNodes: ['n1'],
      hiddenClues: [
        { id: `clue-hdr-${id}`, type: 'http-header' as const, nodeId: 'n2', hint: 'Examine the response headers from the beacon endpoint', value: `NEXUS{PACKET_ANALYSIS_${topic.toUpperCase().replace(/\s/g,'_')}}` },
        { id: `clue-hex-${id}`, type: 'hex-encoded' as const, nodeId: 'n5', hint: 'Decode the hex string found in data attributes', value: Buffer.from(`C2_CMD:${topic}_exfil_complete`).toString('hex') },
        { id: `clue-data-${id}`, type: 'data-attribute' as const, nodeId: 'n4', hint: 'Inspect element data-* attributes for hidden values', value: `dns-tunnel-key:${topic.toLowerCase().replace(/\s/g,'-')}-7f3a` },
        { id: `clue-con-${id}`, type: 'console-log' as const, nodeId: 'n6', hint: 'Check the console for the final intercept', value: `[FORENSICS] Case ${topic} closed. Evidence hash: sha256:a1b2c3d4` },
      ],
      tags: ['forensics', 'network', 'packets', topic.toLowerCase()],
    };
  },

  web_pentest: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    return {
      name: `Web Pentest: ${topic}`,
      description: `Penetration test against ${topic} web application. Discover vulnerabilities through source analysis, parameter testing, and header manipulation.`,
      category: 'exploit', difficulty: skill, estimatedTime: '30 min',
      nodes: [
        { id: 'n1', type: 'step', title: 'Engagement Rules', content: `**Web Application Pentest**\nTarget: ${topic}\n\nScope: All client-side vulnerabilities\nRules: No destructive testing\n\nStart by mapping the application surface.`, x: 80, y: 150, width: 280, height: 130, color: 'amber', metadata: { featureType: 'web', skillLevel: skill } },
        { id: 'n2', type: 'tool', title: 'Surface Mapping', content: `Enumerate the attack surface:\n\n1. View page source for hidden forms/endpoints\n2. Check robots.txt and sitemap.xml\n3. Look for JavaScript files with API routes\n4. Find admin panels or debug endpoints`, x: 400, y: 60, width: 260, height: 140, color: 'teal', metadata: { toolsForStep: ['burp-suite', 'dirb', 'view-source'] } },
        { id: 'n3', type: 'tool', title: 'Parameter Discovery', content: `Test input parameters:\n\n- URL query strings\n- Form fields (check hidden inputs)\n- Cookie values\n- Custom headers\n\nLook for reflected values and error messages.`, x: 400, y: 240, width: 260, height: 140, color: 'teal', metadata: { toolsForStep: ['burp-repeater', 'curl'] } },
        { id: 'n4', type: 'decision', title: 'Vuln Classification', content: `What did you find?\n\n→ XSS (reflected input in page)\n→ Info Disclosure (stack traces, versions)\n→ Auth Bypass (missing access controls)\n→ IDOR (predictable resource IDs)`, x: 700, y: 60, width: 260, height: 140, color: 'purple' },
        { id: 'n5', type: 'step', title: 'Exploit Development', content: `Craft your proof of concept.\n\nFor XSS: Build a payload that demonstrates impact\nFor Info Disclosure: Document sensitive data exposed\nFor Auth: Show the bypass path\n\nCheck meta tags for version hints.`, x: 700, y: 240, width: 260, height: 140, color: 'amber', metadata: { featureType: 'web' } },
        { id: 'n6', type: 'output', title: 'Pentest Report', content: `Write your findings report:\n\n- Vulnerability title & severity\n- Steps to reproduce\n- Impact assessment\n- Remediation advice\n\nSubmit findings to claim the bounty.`, x: 1000, y: 150, width: 260, height: 140, color: 'stone' },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal' },
        { id: 'l4', source: 'n3', target: 'n5', color: 'teal' },
        { id: 'l5', source: 'n4', target: 'n6', color: 'purple' },
        { id: 'l6', source: 'n5', target: 'n6', color: 'amber' },
      ],
      rootNodes: ['n1'],
      hiddenClues: [
        { id: `clue-src-${id}`, type: 'source-code' as const, nodeId: 'n2', hint: 'View the page source - a hidden form reveals an internal endpoint', value: `<!-- DEBUG: /api/internal/${topic.toLowerCase().replace(/\s/g,'-')}/admin?debug=true -->` },
        { id: `clue-meta-${id}`, type: 'meta-tag' as const, nodeId: 'n5', hint: 'Check the meta tags for server version disclosure', value: `X-Powered-By: ${topic}-Server/3.2.1-vulnerable` },
        { id: `clue-data-${id}`, type: 'data-attribute' as const, nodeId: 'n3', hint: 'Hidden form fields contain test credentials', value: `data-test-cred="admin:${topic.toLowerCase()}123"` },
        { id: `clue-net-${id}`, type: 'network-request' as const, nodeId: 'n4', hint: 'A background request leaks the API key in headers', value: `API-Key: sk_test_${Buffer.from(topic).toString('base64').slice(0,12)}` },
      ],
      tags: ['pentest', 'web', 'xss', 'recon', topic.toLowerCase()],
    };
  },

  social_engineering: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    return {
      name: `Social Engineering: ${topic}`,
      description: `Analyze and defend against social engineering attacks targeting ${topic}. Identify phishing indicators, pretexting patterns, and manipulation techniques.`,
      category: 'social', difficulty: skill, estimatedTime: '20 min',
      nodes: [
        { id: 'n1', type: 'step', title: 'Threat Briefing', content: `**Social Engineering Defense**\n\nA targeted campaign is using ${topic} as a lure.\nYour job: analyze the attack chain, identify red flags, and build defenses.\n\n> "People are the weakest link in any security chain."`, x: 80, y: 150, width: 280, height: 140, color: 'amber', metadata: { featureType: 'osint', skillLevel: skill } },
        { id: 'n2', type: 'tool', title: 'Email Analysis', content: `Examine the phishing email:\n\n- Check sender headers (look for spoofing)\n- Hover links before clicking\n- Inspect HTML source for hidden redirects\n- Look for urgency/fear tactics\n\nThe page source contains the raw email headers.`, x: 400, y: 80, width: 260, height: 140, color: 'teal' },
        { id: 'n3', type: 'decision', title: 'Attack Vector', content: `Classify the social engineering technique:\n\n→ Phishing (credential harvesting)\n→ Pretexting (fake identity/authority)\n→ Baiting (malicious file/USB)\n→ Quid Pro Quo (fake tech support)`, x: 400, y: 260, width: 260, height: 130, color: 'purple' },
        { id: 'n4', type: 'step', title: 'OSINT the Attacker', content: `Use open source intelligence to trace the attacker.\n\nCheck:\n- Domain registration (WHOIS)\n- Email header routing\n- Linked infrastructure\n- Social media profiles\n\nData attributes on this page contain the attacker's trail.`, x: 700, y: 170, width: 260, height: 140, color: 'amber', metadata: { featureType: 'osint' } },
        { id: 'n5', type: 'output', title: 'Defense Report', content: `Build your defense playbook:\n\n1. Indicators of Compromise (IOCs)\n2. Detection rules\n3. User awareness training points\n4. Technical controls\n\nThe console contains the final attribution data.`, x: 1000, y: 170, width: 260, height: 140, color: 'stone' },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal' },
        { id: 'l4', source: 'n3', target: 'n4', color: 'purple' },
        { id: 'l5', source: 'n4', target: 'n5', color: 'amber' },
      ],
      rootNodes: ['n1'],
      hiddenClues: [
        { id: `clue-src-${id}`, type: 'source-code' as const, nodeId: 'n2', hint: 'The raw email headers are hidden in the page source', value: `From: "IT Department" <admin@${topic.toLowerCase().replace(/\s/g,'')}-secure.com>\nReply-To: attacker@evil-${topic.toLowerCase().replace(/\s/g,'')}.net` },
        { id: `clue-css-${id}`, type: 'css-comment' as const, nodeId: 'n3', hint: 'A CSS comment reveals the phishing kit version', value: `/* PhishKit v3.7 - target: ${topic} - deployed: 2025-12-15 */` },
        { id: `clue-data-${id}`, type: 'data-attribute' as const, nodeId: 'n4', hint: 'Inspect elements for the attacker infrastructure data', value: `c2-server:185.234.xx.xx hosting-provider:bulletproof-${topic.toLowerCase().replace(/\s/g,'')}` },
        { id: `clue-con-${id}`, type: 'console-log' as const, nodeId: 'n5', hint: 'Console output reveals the attacker attribution', value: `[ATTRIBUTION] Threat actor "Phantom${topic.replace(/\s/g,'')}" linked to 3 prior campaigns` },
      ],
      tags: ['social-engineering', 'phishing', 'defense', topic.toLowerCase()],
    };
  },

  malware_analysis: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    return {
      name: `Malware Analysis: ${topic}`,
      description: `Analyze a suspicious sample related to ${topic}. Use static and dynamic analysis techniques to understand the malware's behavior and extract IOCs.`,
      category: 'forensics', difficulty: skill, estimatedTime: '30 min',
      nodes: [
        { id: 'n1', type: 'step', title: 'Sample Received', content: `**MALWARE TRIAGE**\n\nA suspicious binary tagged "${topic}" has been submitted.\nEnvironment: Isolated sandbox\n\nObjective: Determine capability, extract C2, identify family.\n\n⚠️ All analysis is simulated - no real malware.`, x: 80, y: 150, width: 280, height: 150, color: 'amber', metadata: { featureType: 'agent', skillLevel: skill } },
        { id: 'n2', type: 'tool', title: 'Static Analysis', content: `Examine the sample without executing it:\n\n- File hash and signature check\n- String extraction (look for URLs, IPs)\n- Import table analysis\n- Resource section inspection\n\nHidden strings are embedded in the page's data attributes.`, x: 400, y: 60, width: 260, height: 150, color: 'teal', metadata: { toolsForStep: ['strings', 'file', 'objdump'] } },
        { id: 'n3', type: 'tool', title: 'Dynamic Analysis', content: `Execute in sandbox and observe:\n\n- Network connections (check Network tab)\n- File system changes\n- Registry modifications\n- Process injection attempts\n\nThe beacon endpoint simulates the malware's C2 callback.`, x: 400, y: 260, width: 260, height: 150, color: 'teal', metadata: { toolsForStep: ['sandbox', 'procmon', 'wireshark'] } },
        { id: 'n4', type: 'decision', title: 'Malware Family', content: `Based on your analysis, classify the sample:\n\n→ Ransomware (file encryption + ransom note)\n→ RAT (remote access + keylogging)\n→ Stealer (credential/data theft)\n→ Worm (self-propagation)\n→ Dropper (downloads additional payloads)`, x: 700, y: 160, width: 260, height: 160, color: 'purple' },
        { id: 'n5', type: 'output', title: 'IOC Report', content: `Extract and document IOCs:\n\n- File hashes (MD5, SHA256)\n- C2 domains and IPs\n- Mutexes and registry keys\n- YARA rule for detection\n\nSubmit to threat intel platform.`, x: 1000, y: 160, width: 260, height: 140, color: 'stone' },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal' },
        { id: 'l4', source: 'n3', target: 'n4', color: 'teal' },
        { id: 'l5', source: 'n4', target: 'n5', color: 'purple' },
      ],
      rootNodes: ['n1'],
      hiddenClues: [
        { id: `clue-data-${id}`, type: 'data-attribute' as const, nodeId: 'n2', hint: 'Inspect elements for extracted strings from the binary', value: `strings-dump: "http://c2.${topic.toLowerCase().replace(/\s/g,'')}-malware.net/gate.php" "mutex_${topic.replace(/\s/g,'_')}_lock"` },
        { id: `clue-net-${id}`, type: 'network-request' as const, nodeId: 'n3', hint: 'The simulated C2 beacon reveals the protocol in response headers', value: `C2-Protocol: custom-xor-${topic.toLowerCase().replace(/\s/g,'-')}` },
        { id: `clue-b64-${id}`, type: 'base64' as const, nodeId: 'n4', hint: 'A base64 encoded config was extracted from the sample', value: Buffer.from(JSON.stringify({ family: topic, version: '2.1', killswitch: 'nexus-safe-word', c2: [`${topic.toLowerCase().replace(/\s/g,'')}.onion`] })).toString('base64') },
        { id: `clue-con-${id}`, type: 'console-log' as const, nodeId: 'n5', hint: 'YARA match results appear in the console', value: `[YARA] Rule "${topic}_Dropper" matched: 4/5 conditions. Confidence: HIGH` },
      ],
      tags: ['malware', 'reverse-engineering', 'forensics', topic.toLowerCase()],
    };
  },

  incident_response: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    return {
      name: `Incident Response: ${topic}`,
      description: `Respond to an active security incident involving ${topic}. Contain the threat, investigate the breach, and coordinate recovery.`,
      category: 'defense', difficulty: skill, estimatedTime: '25 min',
      nodes: [
        { id: 'n1', type: 'step', title: 'Incident Declared', content: `**INCIDENT RESPONSE ACTIVATED**\n\nSeverity: HIGH\nCategory: ${topic}\nTime: ${new Date().toISOString()}\n\nYou're the incident commander. Clock is ticking.\nFirst priority: Contain. Then investigate.`, x: 80, y: 160, width: 280, height: 150, color: 'amber', metadata: { featureType: 'agent', skillLevel: skill } },
        { id: 'n2', type: 'decision', title: 'Containment Strategy', content: `Choose your containment approach:\n\n→ Network Isolation (block at firewall)\n→ Account Lockout (disable compromised creds)\n→ System Quarantine (isolate affected hosts)\n→ DNS Sinkhole (redirect malicious domains)`, x: 400, y: 80, width: 260, height: 150, color: 'purple' },
        { id: 'n3', type: 'tool', title: 'Evidence Collection', content: `Collect volatile evidence before it's lost:\n\n- Memory dumps\n- Network connections (netstat)\n- Running processes\n- Recent file changes\n\nPage source contains simulated log entries.`, x: 400, y: 280, width: 260, height: 140, color: 'teal', metadata: { toolsForStep: ['volatility', 'dd', 'netstat'] } },
        { id: 'n4', type: 'step', title: 'Root Cause Analysis', content: `Trace the attack chain backwards:\n\n1. Initial access vector\n2. Privilege escalation method\n3. Lateral movement path\n4. Data accessed/exfiltrated\n\nHidden data in the page reveals the timeline.`, x: 700, y: 80, width: 260, height: 140, color: 'amber', metadata: { featureType: 'osint' } },
        { id: 'n5', type: 'step', title: 'Recovery Plan', content: `Plan the recovery:\n\n- Patch the vulnerability\n- Reset compromised credentials\n- Restore from clean backups\n- Monitor for re-entry\n\nVerify no persistence mechanisms remain.`, x: 700, y: 280, width: 260, height: 130, color: 'amber' },
        { id: 'n6', type: 'output', title: 'Post-Incident Report', content: `Complete the PIR:\n\n- Executive summary\n- Timeline of events\n- Impact assessment\n- Lessons learned\n- Improvement recommendations\n\nAll findings consolidated.`, x: 1000, y: 180, width: 260, height: 140, color: 'stone' },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'purple' },
        { id: 'l4', source: 'n3', target: 'n5', color: 'teal' },
        { id: 'l5', source: 'n4', target: 'n6', color: 'amber' },
        { id: 'l6', source: 'n5', target: 'n6', color: 'amber' },
      ],
      rootNodes: ['n1'],
      hiddenClues: [
        { id: `clue-src-${id}`, type: 'source-code' as const, nodeId: 'n3', hint: 'Simulated server logs are embedded in the page source', value: `[AUTH] Failed login for admin from 185.234.xx.xx at 03:42:17\n[AUTH] Successful login for admin from 185.234.xx.xx at 03:42:23 (brute force)` },
        { id: `clue-hdr-${id}`, type: 'http-header' as const, nodeId: 'n4', hint: 'Response headers contain the attack timeline', value: `X-Incident-Timeline: initial-access:T-4h, escalation:T-3h, exfil:T-1h, detection:T-0` },
        { id: `clue-data-${id}`, type: 'data-attribute' as const, nodeId: 'n2', hint: 'Element attributes reveal the compromised systems', value: `affected-systems: web-srv-01,db-srv-03,ad-dc-01 attack-vector: ${topic.toLowerCase().replace(/\s/g,'-')}` },
        { id: `clue-con-${id}`, type: 'console-log' as const, nodeId: 'n6', hint: 'Final incident metrics logged to console', value: `[IR] Incident "${topic}" resolved. MTTD: 4h, MTTR: 6h, Impact: 3 systems, Data: 0 records exfiltrated` },
      ],
      tags: ['incident-response', 'defense', 'forensics', topic.toLowerCase()],
    };
  },
};

router.get("/api/campaign-templates", (_req, res) => {
  res.json(Object.keys(TEMPLATE_GENERATORS).map(key => ({
    id: key,
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    categories: ['beginner', 'intermediate', 'advanced'],
  })));
});

router.post("/api/campaign-templates/generate", async (req, res) => {
  try {
    const { templateId, topic, skill } = req.body;
    if (!templateId || !topic) {
      return res.status(400).json({ error: "templateId and topic are required" });
    }
    const generator = TEMPLATE_GENERATORS[templateId];
    if (!generator) {
      return res.status(404).json({ error: "Template not found" });
    }
    const campaignData = generator(topic, skill || 'intermediate');
    const campaignId = `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const campaign = await storage.upsertDesignerCampaign(campaignId, {
      ...campaignData,
      campaignId,
      isPublished: true,
    });
    res.json({ success: true, campaign, campaignId });
  } catch (error) {
    console.error("Generate campaign error:", error);
    res.status(500).json({ error: "Failed to generate campaign" });
  }
});

// ==================== Shared Clues ====================

router.get("/api/designer/clues", async (req, res) => {
  try {
    const clues = await storage.getAllSharedClues();
    res.json(clues);
  } catch (error) {
    console.error("Get shared clues error:", error);
    res.status(500).json({ error: "Failed to fetch shared clues" });
  }
});

router.get("/api/designer/clues/:clueId", async (req, res) => {
  try {
    const { clueId } = req.params;
    const clue = await storage.getSharedClueById(clueId);
    if (!clue) {
      return res.status(404).json({ error: "Clue not found" });
    }
    res.json(clue);
  } catch (error) {
    console.error("Get shared clue error:", error);
    res.status(500).json({ error: "Failed to fetch clue" });
  }
});

router.put("/api/designer/clues/:clueId", async (req, res) => {
  try {
    const { clueId } = req.params;
    const clue = await storage.upsertSharedClue(clueId, req.body);
    res.json(clue);
  } catch (error) {
    console.error("Save shared clue error:", error);
    res.status(500).json({ error: "Failed to save clue" });
  }
});

router.delete("/api/designer/clues/:clueId", async (req, res) => {
  try {
    const { clueId } = req.params;
    await storage.deleteSharedClue(clueId);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete shared clue error:", error);
    res.status(500).json({ error: "Failed to delete clue" });
  }
});

// ==================== Collectibles ====================

router.get("/api/artifacts", async (_req, res) => {
  try {
    const artifacts = await storage.getAllArtifacts();
    res.json(artifacts);
  } catch (error) {
    console.error("Get artifacts error:", error);
    res.status(500).json({ error: "Failed to fetch artifacts" });
  }
});

router.post("/api/artifacts", rateLimit(30, 60000), async (req, res) => {
  try {
    const payload = {
      id: sanitizeInput(req.body.id || ''),
      name: sanitizeInput(req.body.name || ''),
      description: sanitizeInput(req.body.description || ''),
      content: sanitizeInput(req.body.content || ''),
      category: sanitizeInput(req.body.category || 'general'),
      tags: Array.isArray(req.body.tags) ? req.body.tags : []
    };

    if (!payload.id || !payload.name) {
      return res.status(400).json({ error: "Artifact id and name are required" });
    }

    const artifact = await storage.createArtifact(payload);
    res.json(artifact);
  } catch (error) {
    console.error("Create artifact error:", error);
    res.status(500).json({ error: "Failed to create artifact" });
  }
});

router.patch("/api/artifacts/:id", rateLimit(30, 60000), async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      updates[key] = typeof value === "string" ? sanitizeInput(value) : value;
    }
    const updated = await storage.updateArtifact(id as string, updates as any);
    if (!updated) {
      return res.status(404).json({ error: "Artifact not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Update artifact error:", error);
    res.status(500).json({ error: "Failed to update artifact" });
  }
});

router.delete("/api/artifacts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteArtifact(id);
    res.json({ success: deleted });
  } catch (error) {
    console.error("Delete artifact error:", error);
    res.status(500).json({ error: "Failed to delete artifact" });
  }
});

router.get("/api/mystical-cards", async (_req, res) => {
  try {
    const cards = await storage.getMysticalCards();
    res.json(cards);
  } catch (error) {
    console.error("Get mystical cards error:", error);
    res.status(500).json({ error: "Failed to fetch mystical cards" });
  }
});

router.put("/api/mystical-cards/:cardId", rateLimit(30, 60000), async (req, res) => {
  try {
    const { cardId } = req.params;
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      updates[key] = typeof value === "string" ? sanitizeInput(value) : value;
    }
    const card = await storage.upsertMysticalCard(cardId as string, updates as any);
    res.json(card);
  } catch (error) {
    console.error("Save mystical card error:", error);
    res.status(500).json({ error: "Failed to save mystical card" });
  }
});

router.delete("/api/mystical-cards/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;
    const deleted = await storage.deleteMysticalCard(cardId);
    res.json({ success: deleted });
  } catch (error) {
    console.error("Delete mystical card error:", error);
    res.status(500).json({ error: "Failed to delete mystical card" });
  }
});

router.get("/api/quantum/events", async (_req, res) => {
  try {
    const events = await storage.getQuantumEvents();
    res.json(events);
  } catch (error) {
    console.error("Get quantum events error:", error);
    res.status(500).json({ error: "Failed to fetch quantum events" });
  }
});

router.put("/api/quantum/events/:eventId", rateLimit(30, 60000), async (req, res) => {
  try {
    const { eventId } = req.params;
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      updates[key] = typeof value === "string" ? sanitizeInput(value) : value;
    }
    if (updates.baseProb !== undefined) {
      updates.baseProb = parseInt(String(updates.baseProb), 10);
    }
    const event = await storage.upsertQuantumEvent(eventId as string, updates as any);
    res.json(event);
  } catch (error) {
    console.error("Save quantum event error:", error);
    res.status(500).json({ error: "Failed to save quantum event" });
  }
});

router.get("/api/quantum/messages", async (_req, res) => {
  try {
    const messages = await storage.getQuantumMessages();
    res.json(messages);
  } catch (error) {
    console.error("Get quantum messages error:", error);
    res.status(500).json({ error: "Failed to fetch quantum messages" });
  }
});

router.post("/api/quantum/messages", rateLimit(30, 60000), async (req, res) => {
  try {
    const message = sanitizeInput(req.body.message || '');
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const created = await storage.createQuantumMessage({ message, enabled: true });
    res.json(created);
  } catch (error) {
    console.error("Create quantum message error:", error);
    res.status(500).json({ error: "Failed to create quantum message" });
  }
});

router.patch("/api/quantum/messages/:id", rateLimit(30, 60000), async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      updates[key] = typeof value === "string" ? sanitizeInput(value) : value;
    }
    const updated = await storage.updateQuantumMessage(parseInt(id as string, 10), updates as any);
    if (!updated) {
      return res.status(404).json({ error: "Quantum message not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Update quantum message error:", error);
    res.status(500).json({ error: "Failed to update quantum message" });
  }
});

router.delete("/api/quantum/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteQuantumMessage(parseInt(id, 10));
    res.json({ success: deleted });
  } catch (error) {
    console.error("Delete quantum message error:", error);
    res.status(500).json({ error: "Failed to delete quantum message" });
  }
});

// ==================== Campaign Links ====================

router.get("/api/designer/links/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const links = await storage.getCampaignLinks(campaignId);
    res.json(links);
  } catch (error) {
    console.error("Get campaign links error:", error);
    res.status(500).json({ error: "Failed to fetch campaign links" });
  }
});

router.post("/api/designer/links", async (req, res) => {
  try {
    const link = await storage.createCampaignLink(req.body);
    res.json(link);
  } catch (error) {
    console.error("Create campaign link error:", error);
    res.status(500).json({ error: "Failed to create link" });
  }
});

router.delete("/api/designer/links/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteCampaignLink(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error("Delete campaign link error:", error);
    res.status(500).json({ error: "Failed to delete link" });
  }
});

// ==================== Threat Intelligence Feeds ====================

router.post("/api/threat-intel/fetch", rateLimit(10, 60000), async (req, res) => {
  try {
    const { feedId } = req.body;
    
    if (!feedId) {
      return res.status(400).json({ error: "feedId required" });
    }
    
    const feed = THREAT_INTEL_FEEDS[feedId];
    if (!feed) {
      return res.status(400).json({ error: "Unknown feed. Allowed: " + Object.keys(THREAT_INTEL_FEEDS).join(', ') });
    }
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const headers: Record<string, string> = {
      'User-Agent': 'NEXUS-Security-Platform/1.0',
      'Accept': 'application/json'
    };
    
    let response;
    if (feed.method === 'POST') {
      response = await fetch(feed.url, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: feed.body,
        signal: controller.signal
      });
    } else {
      response = await fetch(feed.url, { headers, signal: controller.signal });
    }
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`Feed returned ${response.status}`);
    }
    
    const data = await response.json();
    
    const trimmed = Array.isArray(data) 
      ? data.slice(0, 50) 
      : (data.data ? { ...data, data: data.data.slice?.(0, 50) || data.data } : data);
    
    res.json(trimmed);
  } catch (error: any) {
    console.error("Threat intel fetch error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch threat intel" });
  }
});

export default router;
