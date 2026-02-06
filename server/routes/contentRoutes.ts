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

router.get("/api/campaigns/:campaignId/page/:nodeId?", async (req, res) => {
  try {
    const { campaignId, nodeId } = req.params;
    const campaign = await storage.getDesignerCampaignById(campaignId);
    if (!campaign || !campaign.isPublished) {
      return res.status(404).send("<html><body><h1>Campaign not found</h1></body></html>");
    }

    const nodes = (campaign.nodes as any[]) || [];
    const links = (campaign.links as any[]) || [];
    const hiddenClues = (campaign as any).hiddenClues || [];
    const rootNode = nodeId || (campaign.rootNodes as string[])?.[0] || nodes[0]?.id;
    const currentNode = nodes.find((n: any) => n.id === rootNode);

    if (!currentNode) {
      return res.status(404).send("<html><body><h1>Node not found</h1></body></html>");
    }

    const nodeClues = hiddenClues.filter((c: any) => c.nodeId === rootNode);
    const outLinks = links.filter((l: any) => l.source === rootNode);
    const nextNodes = outLinks.map((l: any) => ({
      link: l,
      node: nodes.find((n: any) => n.id === l.target),
    })).filter((x: any) => x.node);

    const srcClues = nodeClues.filter((c: any) => c.type === 'source-code');
    const cssClues = nodeClues.filter((c: any) => c.type === 'css-comment');
    const dataClues = nodeClues.filter((c: any) => c.type === 'data-attribute');
    const metaClues = nodeClues.filter((c: any) => c.type === 'meta-tag');
    const b64Clues = nodeClues.filter((c: any) => c.type === 'base64');
    const hexClues = nodeClues.filter((c: any) => c.type === 'hex-encoded');
    const consoleClues = nodeClues.filter((c: any) => c.type === 'console-log');

    for (const clue of nodeClues.filter((c: any) => c.type === 'http-header')) {
      res.set("X-NEXUS-Intel", Buffer.from(clue.value).toString('base64'));
    }
    for (const clue of nodeClues.filter((c: any) => c.type === 'network-request')) {
      res.set("X-NEXUS-Beacon", "true");
      res.set("X-NEXUS-Secret", Buffer.from(clue.value).toString('base64'));
    }

    const hasHtml = currentNode.htmlContent && currentNode.htmlContent.trim().length > 0;
    const layout = currentNode.pageLayout || 'card';

    const navHtml = nextNodes.map(({ link, node }: any) =>
      `<a href="/api/campaigns/${campaignId}/page/${node.id}" class="nav-link" data-node-type="${node.type}">
        <span class="nav-label">${link.label || node.title}</span>
        <span class="nav-arrow">&rarr;</span>
      </a>`
    ).join('\n');

    const isComplete = currentNode.type === 'output' && nextNodes.length === 0;

    const bodyContent = hasHtml
      ? currentNode.htmlContent
      : currentNode.content.split('\n').map((line: string) => {
          if (line.startsWith('**') && line.endsWith('**')) return `<h3>${line.replace(/\*\*/g, '')}</h3>`;
          if (line.startsWith('> ')) return `<blockquote>${line.slice(2)}</blockquote>`;
          if (line.startsWith('- ') || line.startsWith('→ ')) return `<li>${line.slice(2)}</li>`;
          if (line.match(/^\d+\./)) return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
          if (line.startsWith('⚠️')) return `<p class="warning">${line}</p>`;
          if (line.trim() === '') return '<br>';
          return `<p>${line}</p>`;
        }).join('\n');

    const html = `<!DOCTYPE html>
<html lang="en" data-campaign="${campaignId}" data-node="${rootNode}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentNode.title} - ${campaign.name}</title>
  ${metaClues.map((c: any) => `<meta name="nexus-debug" content="${c.value}">`).join('\n  ')}
  <style>
    :root {
      --bg: #0a0500;
      --fg: #d6d3d1;
      --amber: #d97706;
      --teal: #14b8a6;
      --muted: #57534e;
      --surface: #1c1917;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      background: var(--bg);
      color: var(--fg);
      min-height: 100vh;
      line-height: 1.6;
    }
    .campaign-header {
      border-bottom: 1px solid rgba(217,119,6,0.2);
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0,0,0,0.5);
      gap: 0.5rem;
    }
    .campaign-header h1 { color: var(--amber); font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .campaign-header .meta { color: var(--muted); font-size: 0.65rem; }
    .page-content {
      max-width: ${layout === 'full-page' ? '100%' : '800px'};
      margin: ${layout === 'full-page' ? '0' : '1rem auto'};
      padding: ${layout === 'full-page' ? '0' : '1rem'};
    }
    @media (min-width: 640px) {
      .campaign-header { padding: 1rem 2rem; }
      .campaign-header h1 { font-size: 0.875rem; }
      .page-content { margin: ${layout === 'full-page' ? '0' : '2rem auto'}; padding: ${layout === 'full-page' ? '0' : '2rem'}; }
    }
    .page-content.layout-terminal {
      background: #000;
      border: 1px solid rgba(217,119,6,0.3);
      border-radius: 8px;
      padding: 1.5rem;
      color: var(--amber);
      white-space: pre-wrap;
    }
    .page-content.layout-dossier {
      background: var(--surface);
      border: 2px solid rgba(217,119,6,0.4);
      padding: 2rem;
      position: relative;
    }
    .page-content.layout-dossier::before {
      content: 'CLASSIFIED';
      position: absolute;
      top: 0.5rem;
      right: 1rem;
      color: rgba(217,119,6,0.3);
      font-size: 0.65rem;
      letter-spacing: 0.2em;
    }
    .node-title {
      color: var(--amber);
      font-size: 1.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(217,119,6,0.15);
    }
    .node-type-badge {
      display: inline-block;
      color: var(--muted);
      font-size: 0.65rem;
      border: 1px solid var(--muted);
      padding: 0.1rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    h3 { color: var(--amber); margin: 1rem 0 0.5rem; font-size: 1.1rem; }
    p { margin: 0.5rem 0; color: var(--fg); }
    blockquote {
      border-left: 2px solid var(--amber);
      padding-left: 0.75rem;
      color: var(--muted);
      font-style: italic;
      margin: 0.75rem 0;
    }
    li { margin: 0.25rem 0 0.25rem 1.5rem; color: var(--fg); }
    .warning {
      color: var(--amber);
      background: rgba(217,119,6,0.05);
      border: 1px solid rgba(217,119,6,0.2);
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .nav-section { margin-top: 2rem; border-top: 1px solid rgba(217,119,6,0.15); padding-top: 1.5rem; }
    .nav-section-label { color: var(--muted); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
    .nav-link {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      min-height: 56px;
      border: 1px solid rgba(217,119,6,0.2);
      border-radius: 6px;
      margin-bottom: 0.5rem;
      text-decoration: none;
      color: var(--fg);
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .nav-link:hover {
      background: rgba(217,119,6,0.08);
      border-color: var(--amber);
      color: var(--amber);
    }
    .nav-arrow { color: var(--muted); }
    .nav-link:hover .nav-arrow { color: var(--amber); }
    .complete-banner {
      text-align: center;
      padding: 3rem 2rem;
      border: 1px solid var(--amber);
      border-radius: 8px;
      margin-top: 2rem;
      background: rgba(217,119,6,0.05);
    }
    .complete-banner h2 { color: var(--amber); font-size: 1.25rem; margin-bottom: 0.5rem; }
    .complete-banner a {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1.5rem;
      background: var(--amber);
      color: #000;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
    .tools-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0;
      padding: 0.75rem;
      background: rgba(20,184,166,0.05);
      border: 1px solid rgba(20,184,166,0.2);
      border-radius: 6px;
    }
    .tool-tag {
      font-size: 0.7rem;
      color: var(--teal);
      border: 1px solid rgba(20,184,166,0.3);
      padding: 0.15rem 0.5rem;
      border-radius: 3px;
    }
    ${cssClues.map((c: any) => c.value).join('\n    ')}
    ${currentNode.customCss || ''}
  </style>
</head>
<body>
  ${srcClues.map((c: any) => `<!-- ${c.value} -->`).join('\n  ')}
  ${dataClues.map((c: any) => `<div data-nexus-intel="${c.value}" style="display:none"></div>`).join('\n  ')}
  ${b64Clues.map((c: any) => `<div data-encoded-payload="${c.value}" data-encoding="base64" style="display:none"></div>`).join('\n  ')}
  ${hexClues.map((c: any) => `<div data-hex-dump="${c.value}" data-encoding="hex" style="display:none"></div>`).join('\n  ')}

  <header class="campaign-header">
    <div>
      <h1>${campaign.name}</h1>
      <span class="meta">${(campaign as any).category || 'recon'} &middot; ${(campaign as any).difficulty || 'beginner'}</span>
    </div>
    <a href="/play/${campaignId}" style="color:var(--muted);font-size:0.7rem;text-decoration:none;">Interactive Player &rarr;</a>
  </header>

  <main class="page-content layout-${layout}" data-campaign-node="${currentNode.id}" data-page-layout="${layout}">
    <div class="node-type-badge">${currentNode.type}</div>
    <h2 class="node-title">${currentNode.title}</h2>

    ${bodyContent}

    ${currentNode.metadata?.toolsForStep?.length ? `
    <div class="tools-bar">
      ${currentNode.metadata.toolsForStep.map((t: string) => `<span class="tool-tag">${t}</span>`).join('')}
    </div>` : ''}

    ${isComplete ? `
    <div class="complete-banner">
      <h2>Campaign Complete</h2>
      <p style="color:var(--muted)">You've reached the end of this investigation.</p>
      <a href="/campaigns">Browse More Campaigns</a>
    </div>` : `
    <div class="nav-section">
      <div class="nav-section-label">${currentNode.type === 'decision' ? 'Choose your path' : 'Continue investigation'}</div>
      ${navHtml}
    </div>`}
  </main>

  ${consoleClues.length > 0 ? `<script>
    ${consoleClues.map((c: any) => `console.log('%c${c.value.replace(/'/g, "\\'")}', 'color: #d97706; font-weight: bold; font-size: 14px; background: #0a0500; padding: 4px 8px; border-left: 3px solid #d97706;');`).join('\n    ')}
  </script>` : ''}
</body>
</html>`;

    res.type('html').send(html);
  } catch (error) {
    console.error("Get campaign page error:", error);
    res.status(500).send("<html><body><h1>Error loading page</h1></body></html>");
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

  // ==================== REALISTIC WEB PAGE TEMPLATES ====================

  vulnerable_login: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    const adminHash = Buffer.from(`admin:${topic}123!`).toString('base64');
    return {
      name: `Vulnerable Login: ${topic}`,
      description: `A realistic corporate login page for ${topic} with multiple authentication vulnerabilities. Find credentials, bypass auth, and discover the admin panel.`,
      category: 'exploit', difficulty: skill, estimatedTime: '25 min',
      nodes: [
        {
          id: 'n1', type: 'step', title: 'Login Portal', x: 80, y: 150, width: 280, height: 140, color: 'amber',
          pageLayout: 'full-page',
          htmlContent: `
<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f172a,#1e293b);font-family:system-ui,sans-serif">
  <div style="width:100%;max-width:400px;padding:2rem">
    <div style="text-align:center;margin-bottom:2rem">
      <div style="width:64px;height:64px;background:#1e40af;border-radius:12px;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center">
        <span style="font-size:1.5rem;color:white">&#128274;</span>
      </div>
      <h1 style="color:white;font-size:1.5rem;margin:0">${topic} Portal</h1>
      <p style="color:#94a3b8;font-size:0.875rem;margin-top:0.5rem">Secure Employee Access</p>
    </div>
    <form onsubmit="return false" style="background:#1e293b;padding:1.5rem;border-radius:12px;border:1px solid #334155">
      <!-- TODO: Remove debug credentials before production -->
      <div style="margin-bottom:1rem">
        <label style="color:#94a3b8;font-size:0.75rem;display:block;margin-bottom:0.25rem">EMAIL</label>
        <input type="email" placeholder="employee@${topic.toLowerCase().replace(/\\s/g,'')}.com" style="width:100%;padding:0.75rem;background:#0f172a;border:1px solid #334155;border-radius:8px;color:white;font-size:1rem;box-sizing:border-box" />
      </div>
      <div style="margin-bottom:1rem">
        <label style="color:#94a3b8;font-size:0.75rem;display:block;margin-bottom:0.25rem">PASSWORD</label>
        <input type="password" placeholder="Enter password" style="width:100%;padding:0.75rem;background:#0f172a;border:1px solid #334155;border-radius:8px;color:white;font-size:1rem;box-sizing:border-box" />
      </div>
      <input type="hidden" name="debug_token" value="${adminHash}" />
      <input type="hidden" name="api_version" value="v2-legacy-NO-AUTH-CHECK" />
      <button style="width:100%;padding:0.75rem;background:#2563eb;color:white;border:none;border-radius:8px;font-size:1rem;cursor:pointer;min-height:48px">Sign In</button>
      <p style="color:#475569;font-size:0.7rem;text-align:center;margin-top:1rem">Forgot password? Contact IT: helpdesk@${topic.toLowerCase().replace(/\\s/g,'')}.com</p>
    </form>
    <p style="color:#334155;font-size:0.6rem;text-align:center;margin-top:2rem">Powered by ${topic} Auth v2.3.1-dev | Session: <span data-session-debug="true">${id}</span></p>
  </div>
</div>`,
          content: `A realistic login page. Investigate the source code, hidden form fields, and embedded credentials.`,
          metadata: { featureType: 'web', skillLevel: skill, toolsForStep: ['view-source', 'inspect-element', 'dev-tools'] }
        },
        { id: 'n2', type: 'tool', title: 'Source Code Analysis', content: `Examine the login page source code.\n\n1. View Page Source (Ctrl+U)\n2. Look for HTML comments\n3. Check hidden form fields\n4. Find hardcoded credentials\n5. Inspect meta tags for version info`, x: 420, y: 60, width: 260, height: 120, color: 'teal', metadata: { toolsForStep: ['view-source', 'inspect-element'] } },
        { id: 'n3', type: 'tool', title: 'Authentication Bypass', content: `Test the auth mechanisms:\n\n- Try default credentials (admin/admin)\n- Check for SQL injection in login form\n- Look for API endpoints with no auth\n- Test the hidden debug token\n- Examine cookies after login attempt`, x: 420, y: 220, width: 260, height: 120, color: 'teal', metadata: { toolsForStep: ['burp-suite', 'curl', 'dev-tools'] } },
        { id: 'n4', type: 'decision', title: 'What Did You Find?', content: `Select the vulnerability path:\n\n-> Hidden debug credentials in source\n-> SQL injection in login form\n-> Exposed API with no authentication\n-> Hardcoded session token`, x: 740, y: 140, width: 260, height: 130, color: 'purple' },
        { id: 'n5', type: 'output', title: 'Access Achieved', content: `Document your findings:\n\n1. Vulnerability type and severity\n2. Steps to reproduce\n3. Impact assessment\n4. Recommended fix\n\nGenerate a QR code with the exploit payload to share with your team.`, x: 1060, y: 140, width: 260, height: 130, color: 'stone', metadata: { featureType: 'web' } },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber', label: 'Inspect source' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber', label: 'Test auth' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal' },
        { id: 'l4', source: 'n3', target: 'n4', color: 'teal' },
        { id: 'l5', source: 'n4', target: 'n5', color: 'purple' },
      ],
      rootNodes: ['n1'],
      hiddenClues: [
        { id: `clue-src-${id}`, type: 'source-code' as const, nodeId: 'n1', hint: 'View the page source - developers left a TODO comment with debug credentials', value: `<!-- TODO: Remove debug credentials before production -->` },
        { id: `clue-data-${id}`, type: 'data-attribute' as const, nodeId: 'n1', hint: 'Inspect hidden form fields for auth bypass tokens', value: `debug_token:${adminHash} api_version:v2-legacy-NO-AUTH-CHECK` },
        { id: `clue-meta-${id}`, type: 'meta-tag' as const, nodeId: 'n2', hint: 'The page footer leaks the server version', value: `${topic} Auth v2.3.1-dev` },
        { id: `clue-con-${id}`, type: 'console-log' as const, nodeId: 'n5', hint: 'Check console for the session dump', value: `[AUTH-DEBUG] admin session: {user:"admin",role:"superadmin",token:"${adminHash}",mfa:false}` },
      ],
      tags: ['login', 'auth-bypass', 'web', 'credentials', topic.toLowerCase()],
    };
  },

  xss_playground: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    return {
      name: `XSS Lab: ${topic}`,
      description: `A vulnerable web application for ${topic} with multiple Cross-Site Scripting vectors. Practice reflected, stored, and DOM-based XSS.`,
      category: 'exploit', difficulty: skill, estimatedTime: '30 min',
      nodes: [
        {
          id: 'n1', type: 'step', title: 'Search Page (Reflected XSS)', x: 80, y: 100, width: 300, height: 140, color: 'amber',
          pageLayout: 'full-page',
          htmlContent: `
<div style="min-height:100vh;background:#f8fafc;font-family:system-ui,sans-serif">
  <nav style="background:white;padding:1rem 2rem;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:1rem">
    <span style="font-weight:bold;color:#1e293b;font-size:1.1rem">${topic} Search</span>
    <span style="color:#94a3b8;font-size:0.8rem">Internal Knowledge Base</span>
  </nav>
  <div style="max-width:600px;margin:3rem auto;padding:0 1rem">
    <h1 style="color:#1e293b;text-align:center;margin-bottom:2rem">Search ${topic} Docs</h1>
    <form onsubmit="return false" style="display:flex;gap:0.5rem">
      <input id="search-input" type="text" placeholder='Try: <script>alert("XSS")</script>' style="flex:1;padding:0.75rem;border:2px solid #e2e8f0;border-radius:8px;font-size:1rem;min-height:48px" />
      <button onclick="document.getElementById('results').innerHTML='Results for: '+document.getElementById('search-input').value" style="padding:0.75rem 1.5rem;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer;min-height:48px">Search</button>
    </form>
    <div id="results" style="margin-top:2rem;padding:1rem;background:white;border-radius:8px;border:1px solid #e2e8f0;color:#475569;min-height:60px">
      <p style="color:#94a3b8;font-size:0.9rem">Enter a search term above. <strong>Notice how the input is reflected directly into the page...</strong></p>
    </div>
    <div style="margin-top:2rem;padding:1rem;background:#fffbeb;border:1px solid #fbbf24;border-radius:8px">
      <p style="color:#92400e;font-size:0.8rem"><strong>Hint:</strong> The search results are rendered without sanitization. What happens if you search for HTML tags?</p>
    </div>
  </div>
  <!-- Debug: user_input is reflected without encoding in /api/search?q=USER_INPUT -->
</div>`,
          content: 'A search page that reflects user input directly into the DOM without sanitization. Classic reflected XSS.',
          metadata: { featureType: 'web', skillLevel: skill, toolsForStep: ['dev-tools', 'burp-suite'] }
        },
        {
          id: 'n2', type: 'step', title: 'Comment Form (Stored XSS)', x: 80, y: 280, width: 300, height: 140, color: 'amber',
          pageLayout: 'full-page',
          htmlContent: `
<div style="min-height:100vh;background:#f8fafc;font-family:system-ui,sans-serif;padding:2rem">
  <div style="max-width:600px;margin:0 auto">
    <h2 style="color:#1e293b">${topic} Feedback</h2>
    <p style="color:#64748b;margin-bottom:1.5rem">Leave a comment for the ${topic} team. All feedback is displayed publicly below.</p>
    <form onsubmit="return false">
      <input type="text" placeholder="Your name" style="width:100%;padding:0.75rem;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:0.5rem;font-size:1rem;box-sizing:border-box;min-height:48px" />
      <textarea placeholder='Write your feedback... Try: <img src=x onerror="alert(document.cookie)">' style="width:100%;padding:0.75rem;border:1px solid #e2e8f0;border-radius:8px;height:100px;font-size:1rem;box-sizing:border-box;resize:vertical"></textarea>
      <button style="margin-top:0.5rem;padding:0.75rem 2rem;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer;min-height:48px">Submit</button>
    </form>
    <div style="margin-top:2rem;border-top:1px solid #e2e8f0;padding-top:1rem">
      <h3 style="color:#1e293b;font-size:1rem">Recent Comments</h3>
      <div style="padding:0.75rem;background:white;border:1px solid #e2e8f0;border-radius:8px;margin-top:0.5rem">
        <strong style="color:#1e293b">Admin</strong> <span style="color:#94a3b8;font-size:0.75rem">2 hours ago</span>
        <p style="color:#475569;margin-top:0.25rem">Great product! The team worked hard on ${topic}.</p>
      </div>
      <div style="padding:0.75rem;background:white;border:1px solid #e2e8f0;border-radius:8px;margin-top:0.5rem">
        <strong style="color:#1e293b">DevOps</strong> <span style="color:#94a3b8;font-size:0.75rem">1 hour ago</span>
        <p style="color:#475569;margin-top:0.25rem">Remember to sanitize inputs before v3 release!</p>
      </div>
    </div>
  </div>
</div>`,
          content: 'A feedback form that stores and displays user input. Comments are rendered as raw HTML.',
          metadata: { featureType: 'web', skillLevel: skill }
        },
        { id: 'n3', type: 'tool', title: 'Craft XSS Payloads', content: `Build your XSS payloads:\n\n**Reflected XSS:**\n- <script>alert('XSS')</script>\n- <img src=x onerror=alert(1)>\n- <svg onload=alert(document.domain)>\n\n**Stored XSS:**\n- <img src=x onerror="fetch('/api/exfil?c='+document.cookie)">\n\n**DOM-based:**\n- Check if URL params are used in innerHTML\n\n**QR Code tie-in:** Encode your XSS payload as a QR phish action and use the Agent Execute API to test it.`, x: 440, y: 180, width: 280, height: 160, color: 'teal', metadata: { toolsForStep: ['xss-payloads', 'burp-suite', 'qr-encoder'] } },
        { id: 'n4', type: 'decision', title: 'Escalation Path', content: `What can you do with XSS?\n\n-> Session hijacking (steal cookies)\n-> Keylogging (capture credentials)\n-> Phishing (inject fake login form)\n-> Crypto mining (inject miner script)\n-> Worm (self-propagating stored XSS)\n\nUse the QR C2 system to encode an exfil payload that steals the session token.`, x: 780, y: 180, width: 260, height: 150, color: 'purple' },
        { id: 'n5', type: 'output', title: 'XSS Report', content: `Document each XSS finding:\n\n1. Type: Reflected / Stored / DOM\n2. Payload used\n3. Impact (session theft, defacement, etc.)\n4. CVSS score\n5. Remediation: output encoding, CSP headers\n\nBonus: Generate a QR dropper containing a clue artifact as proof of exploitation.`, x: 1100, y: 180, width: 260, height: 130, color: 'stone' },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n3', color: 'amber', label: 'Reflected XSS' },
        { id: 'l2', source: 'n2', target: 'n3', color: 'amber', label: 'Stored XSS' },
        { id: 'l3', source: 'n3', target: 'n4', color: 'teal' },
        { id: 'l4', source: 'n4', target: 'n5', color: 'purple' },
      ],
      rootNodes: ['n1', 'n2'],
      hiddenClues: [
        { id: `clue-src-${id}`, type: 'source-code' as const, nodeId: 'n1', hint: 'The source reveals the vulnerable API endpoint pattern', value: `<!-- Debug: user_input is reflected without encoding in /api/search?q=USER_INPUT -->` },
        { id: `clue-con-${id}`, type: 'console-log' as const, nodeId: 'n3', hint: 'Console shows the session cookie that XSS could steal', value: `[SESSION] cookie=session_${topic.replace(/\s/g,'_')}_${id}; path=/; HttpOnly=FALSE` },
        { id: `clue-net-${id}`, type: 'network-request' as const, nodeId: 'n4', hint: 'Network tab shows CSP header is missing', value: `Content-Security-Policy: NONE (vulnerable to inline script injection)` },
        { id: `clue-data-${id}`, type: 'data-attribute' as const, nodeId: 'n2', hint: 'Form data attributes reveal the server-side rendering engine', value: `render-engine:ejs-unescaped template:<%- userInput %> (no sanitization)` },
      ],
      tags: ['xss', 'web', 'injection', 'client-side', topic.toLowerCase()],
    };
  },

  sqli_database: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    const dbDump = Buffer.from(JSON.stringify({
      tables: ['users', 'secrets', 'api_keys', 'sessions'],
      users: [{id: 1, user: 'admin', pass_hash: '5f4dcc3b5aa765d61d8327deb882cf99', role: 'superadmin'}, {id: 2, user: 'guest', pass_hash: 'd41d8cd98f00b204e9800998ecf8427e', role: 'readonly'}],
      flag: `FLAG{SQL_INJECTION_${topic.toUpperCase().replace(/\s/g,'_')}_PWNED}`
    })).toString('base64');
    return {
      name: `SQL Injection: ${topic}`,
      description: `A database-backed application for ${topic} with SQL injection vulnerabilities. Extract data from the backend database using UNION, blind, and error-based SQLi.`,
      category: 'exploit', difficulty: skill, estimatedTime: '35 min',
      nodes: [
        {
          id: 'n1', type: 'step', title: 'Product Lookup', x: 80, y: 150, width: 300, height: 140, color: 'amber',
          pageLayout: 'full-page',
          htmlContent: `
<div style="min-height:100vh;background:#0f172a;font-family:'Courier New',monospace;color:#e2e8f0;padding:1rem">
  <div style="max-width:700px;margin:0 auto">
    <div style="background:#1e293b;padding:1.5rem;border-radius:8px;border:1px solid #334155;margin-bottom:1.5rem">
      <h1 style="color:#38bdf8;margin:0 0 0.5rem">${topic} Database Query</h1>
      <p style="color:#64748b;font-size:0.85rem;margin:0">Search the ${topic} inventory database</p>
    </div>
    <div style="background:#1e293b;padding:1.5rem;border-radius:8px;border:1px solid #334155">
      <label style="color:#94a3b8;font-size:0.75rem;display:block;margin-bottom:0.5rem">PRODUCT ID</label>
      <div style="display:flex;gap:0.5rem">
        <input id="sqli-input" type="text" placeholder="Enter ID (try: 1 OR 1=1)" style="flex:1;padding:0.75rem;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#38bdf8;font-family:monospace;font-size:1rem;min-height:48px;box-sizing:border-box" />
        <button onclick="document.getElementById('sqli-output').textContent='SELECT * FROM products WHERE id = '+document.getElementById('sqli-input').value" style="padding:0.75rem 1.5rem;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;min-height:48px">Query</button>
      </div>
      <div style="margin-top:1rem;padding:1rem;background:#0f172a;border-radius:6px;border:1px solid #334155">
        <p style="color:#475569;font-size:0.7rem;margin:0 0 0.5rem">GENERATED SQL:</p>
        <code id="sqli-output" style="color:#fbbf24;font-size:0.9rem;word-break:break-all">SELECT * FROM products WHERE id = _</code>
      </div>
      <div style="margin-top:1rem;padding:0.75rem;background:#7f1d1d20;border:1px solid #991b1b40;border-radius:6px">
        <p style="color:#fca5a5;font-size:0.8rem;margin:0"><strong>Vuln:</strong> User input is concatenated directly into the SQL query string. No parameterized queries.</p>
      </div>
    </div>
    <div style="margin-top:1rem;padding:1rem;background:#1e293b;border-radius:8px;border:1px solid #334155">
      <p style="color:#94a3b8;font-size:0.8rem;margin:0"><strong>Hint payloads to try:</strong></p>
      <code style="color:#38bdf8;font-size:0.75rem;display:block;margin-top:0.5rem">1 UNION SELECT username,password,role FROM users--</code>
      <code style="color:#38bdf8;font-size:0.75rem;display:block;margin-top:0.25rem">1 OR 1=1--</code>
      <code style="color:#38bdf8;font-size:0.75rem;display:block;margin-top:0.25rem">1; DROP TABLE products--</code>
    </div>
  </div>
  <!-- DB Schema: users(id,username,password_hash,role), secrets(id,key,value), api_keys(id,key,owner,scope) -->
</div>`,
          content: `A database query interface that concatenates user input directly into SQL. Classic injection point.`,
          metadata: { featureType: 'web', skillLevel: skill, toolsForStep: ['sqlmap', 'burp-suite', 'manual-testing'] }
        },
        { id: 'n2', type: 'tool', title: 'UNION-Based Extraction', content: `Use UNION SELECT to extract data:\n\n1. Find column count: ORDER BY 1,2,3...\n2. Find display columns: UNION SELECT 1,2,3...\n3. Extract tables: UNION SELECT table_name FROM information_schema.tables\n4. Extract users: UNION SELECT username,password_hash FROM users\n5. Extract secrets: UNION SELECT key,value FROM secrets\n\nEncode findings as a QR exfil payload to "extract" the data.`, x: 440, y: 60, width: 280, height: 160, color: 'teal', metadata: { toolsForStep: ['sqlmap', 'manual-sqli'] } },
        { id: 'n3', type: 'tool', title: 'Blind SQLi Techniques', content: `When output isn't visible, use blind techniques:\n\n**Boolean-based:**\n1 AND (SELECT LENGTH(password) FROM users WHERE username='admin')=32\n\n**Time-based:**\n1; WAITFOR DELAY '0:0:5'--\n1 AND IF(1=1, SLEEP(5), 0)\n\n**Error-based:**\n1 AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT password FROM users LIMIT 1)))`, x: 440, y: 260, width: 280, height: 160, color: 'teal', metadata: { toolsForStep: ['sqlmap', 'burp-intruder'] } },
        { id: 'n4', type: 'decision', title: 'Data Extracted', content: `What did you find in the database?\n\n-> Admin password hash (crack it)\n-> API keys with full scope\n-> Secret encryption keys\n-> Other users' session tokens\n\nUse the QR crypto challenge to crack the extracted hash.`, x: 780, y: 160, width: 260, height: 140, color: 'purple' },
        { id: 'n5', type: 'output', title: 'SQLi Report', content: `Complete the SQLi assessment:\n\n1. Injection point and parameter\n2. SQL query reconstructed\n3. Data extracted (tables, rows)\n4. Impact: full database compromise\n5. Fix: parameterized queries, ORM, WAF\n\nThe extracted database dump is encoded in base64 in the page data.`, x: 1100, y: 160, width: 260, height: 130, color: 'stone' },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber', label: 'UNION injection' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber', label: 'Blind injection' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal' },
        { id: 'l4', source: 'n3', target: 'n4', color: 'teal' },
        { id: 'l5', source: 'n4', target: 'n5', color: 'purple' },
      ],
      rootNodes: ['n1'],
      hiddenClues: [
        { id: `clue-src-${id}`, type: 'source-code' as const, nodeId: 'n1', hint: 'The page source reveals the full database schema', value: `<!-- DB Schema: users(id,username,password_hash,role), secrets(id,key,value), api_keys(id,key,owner,scope) -->` },
        { id: `clue-b64-${id}`, type: 'base64' as const, nodeId: 'n5', hint: 'The extracted database dump is base64 encoded in a data attribute', value: dbDump },
        { id: `clue-con-${id}`, type: 'console-log' as const, nodeId: 'n4', hint: 'Console shows the cracked admin hash', value: `[CRACK] MD5 5f4dcc3b5aa765d61d8327deb882cf99 = "password" | Admin access confirmed for ${topic}` },
        { id: `clue-hdr-${id}`, type: 'http-header' as const, nodeId: 'n2', hint: 'Response header reveals the database engine', value: `X-DB-Engine: MySQL 5.7.42 | X-ORM: none (raw query concatenation)` },
      ],
      tags: ['sqli', 'sql-injection', 'database', 'web', topic.toLowerCase()],
    };
  },

  qr_attack_chain: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    return {
      name: `QR Attack Chain: ${topic}`,
      description: `A multi-stage attack using QR codes against ${topic}. Combine phishing, code execution, and data exfiltration through the QR C2 system.`,
      category: 'exploit', difficulty: skill, estimatedTime: '40 min',
      nodes: [
        { id: 'n1', type: 'step', title: 'Reconnaissance', content: `**QR Attack: ${topic}**\n\nYou've identified QR codes in the ${topic} environment.\nYour mission: craft a multi-stage QR attack chain.\n\nPhase 1: Scan the legitimate QR to understand the expected format.\nUse the QR Signal Generator (QR button) to decode it.\n\nThe page source contains the original QR payload structure.`, x: 80, y: 200, width: 280, height: 150, color: 'amber', metadata: { featureType: 'qr', skillLevel: skill, toolsForStep: ['qr-decoder', 'view-source'] } },
        { id: 'n2', type: 'tool', title: 'Craft Phishing QR', content: `Create a credential-harvesting QR code:\n\n1. Open the QR Signal Generator\n2. Select "Credential Harvest" preset\n3. Set redirect to a fake login page\n4. Set capture fields: username, password\n5. Generate and download the QR\n\nPayload: {"type":"phish","redirect":"/login","spoof":"${topic}","capture":["username","password"]}\n\nThis simulates placing a malicious QR sticker over a legitimate one.`, x: 420, y: 80, width: 280, height: 160, color: 'teal', metadata: { toolsForStep: ['qr-generator', 'phishing-kit'] } },
        { id: 'n3', type: 'tool', title: 'Code Injection QR', content: `Craft a QR that executes commands when processed:\n\n1. Open QR Generator -> "Code Injection" preset\n2. Payload: {"type":"inject","payload":"cat /etc/passwd","shell":"bash","sandbox":true}\n3. Generate QR and use Agent Execute to test\n\nReal-world parallel: QR codes that auto-open URLs with JavaScript payloads, or configure WiFi to attacker-controlled networks.\n\nThe C2 tab shows how commands flow through QR encoding.`, x: 420, y: 280, width: 280, height: 160, color: 'teal', metadata: { toolsForStep: ['qr-generator', 'agent-execute', 'c2-panel'] } },
        { id: 'n4', type: 'step', title: 'Establish C2 via QR', content: `Set up persistent access using QR-based C2:\n\n1. Go to QR modal -> C2 tab\n2. Select target machine\n3. Encode a beacon check-in command\n4. Simulate the target scanning and executing\n5. Observe the simulated response\n\nBeacon payload: {"type":"beacon","callback":"https://c2.internal","agentId":"QR-${topic}","interval":300}\n\nAll C2 traffic disguised as QR image downloads.`, x: 760, y: 180, width: 280, height: 150, color: 'amber', metadata: { featureType: 'agent', toolsForStep: ['c2-panel', 'qr-generator'] } },
        { id: 'n5', type: 'tool', title: 'Exfiltrate via QR', content: `Extract data through the QR channel:\n\n1. QR Generator -> "Data Exfiltration" preset\n2. Select fields to exfil: token, clues, username\n3. Execute via Agent API\n4. Data is encoded and "transmitted" as QR\n\nReal-world: Attackers have used QR codes in screen flickers, printed documents, and even reflected laser patterns to exfiltrate data from air-gapped systems.`, x: 760, y: 380, width: 280, height: 150, color: 'teal', metadata: { toolsForStep: ['qr-generator', 'exfil-tools'] } },
        { id: 'n6', type: 'output', title: 'Attack Chain Report', content: `Document the full QR attack chain:\n\n1. Initial access: Phishing QR overlay\n2. Credential harvest: Fake login portal\n3. Code execution: Injected commands via QR\n4. Persistence: C2 beacon via QR polling\n5. Exfiltration: Data encoded as QR images\n\nMitigations: QR scanning policies, URL verification, device management, network monitoring.\n\nGenerate a final QR dropper artifact as proof of the complete chain.`, x: 1100, y: 280, width: 280, height: 150, color: 'stone' },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber', label: 'Craft phishing QR' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber', label: 'Craft injection QR' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal', label: 'Credentials obtained' },
        { id: 'l4', source: 'n3', target: 'n4', color: 'teal', label: 'Shell access' },
        { id: 'l5', source: 'n4', target: 'n5', color: 'amber', label: 'C2 established' },
        { id: 'l6', source: 'n5', target: 'n6', color: 'teal', label: 'Data exfiltrated' },
      ],
      rootNodes: ['n1'],
      hiddenClues: [
        { id: `clue-src-${id}`, type: 'source-code' as const, nodeId: 'n1', hint: 'Source contains the legitimate QR payload format used by the target', value: `<!-- Legitimate QR format: {"type":"session","data":{"action":"checkin","location":"lobby"},"timestamp":${Date.now()}} -->` },
        { id: `clue-net-${id}`, type: 'network-request' as const, nodeId: 'n4', hint: 'Beacon response headers reveal the C2 protocol', value: `C2-Protocol: QR-over-HTTPS | Beacon-ID: QR-${topic}-${id.slice(-6)} | Next-Checkin: 300s` },
        { id: `clue-con-${id}`, type: 'console-log' as const, nodeId: 'n5', hint: 'Console shows the exfiltrated data summary', value: `[EXFIL] QR C2 chain complete for ${topic}. Extracted: 3 credentials, 1 API key, session tokens. Total encoded in 4 QR frames.` },
        { id: `clue-data-${id}`, type: 'data-attribute' as const, nodeId: 'n6', hint: 'The attack chain timeline is in element attributes', value: `attack-chain: recon:T-0, phish:T+5m, inject:T+12m, c2:T+15m, exfil:T+25m | target:${topic}` },
      ],
      tags: ['qr-attack', 'phishing', 'c2', 'exfiltration', 'multi-stage', topic.toLowerCase()],
    };
  },

  investigation_board: (topic, skill) => {
    const id = `tpl-${Date.now()}`;
    return {
      name: `Investigation: ${topic}`,
      description: `A progressive investigation into ${topic} where each step adds to a living intelligence board. Findings accumulate across nodes and earlier analysis informs later decisions.`,
      category: 'osint', difficulty: skill, estimatedTime: '45 min',
      nodes: [
        {
          id: 'n1', type: 'step', title: 'Intel Board: Initial Briefing', x: 80, y: 200, width: 300, height: 150, color: 'amber',
          pageLayout: 'dossier',
          htmlContent: `
<div style="font-family:monospace;color:#d6d3d1">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;border-bottom:2px solid #d97706;padding-bottom:0.75rem">
    <h2 style="color:#d97706;margin:0">INVESTIGATION: ${topic.toUpperCase()}</h2>
    <span style="color:#57534e;font-size:0.7rem">STATUS: ACTIVE | CLASSIFICATION: RESTRICTED</span>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
    <div style="background:#0a0a0a;padding:1rem;border:1px solid #292524;border-radius:4px">
      <h3 style="color:#d97706;font-size:0.85rem;margin:0 0 0.5rem">KNOWN FACTS</h3>
      <ul style="color:#a8a29e;font-size:0.8rem;padding-left:1.2rem;margin:0">
        <li>Target entity: ${topic}</li>
        <li>First observed: [DATE UNKNOWN]</li>
        <li>Threat level: Under assessment</li>
      </ul>
    </div>
    <div style="background:#0a0a0a;padding:1rem;border:1px solid #292524;border-radius:4px">
      <h3 style="color:#14b8a6;font-size:0.85rem;margin:0 0 0.5rem">WORKING HYPOTHESES</h3>
      <ul style="color:#a8a29e;font-size:0.8rem;padding-left:1.2rem;margin:0">
        <li style="color:#57534e">[No hypotheses yet - begin investigation]</li>
      </ul>
    </div>
  </div>
  <div style="margin-top:1rem;background:#0a0a0a;padding:1rem;border:1px solid #292524;border-radius:4px">
    <h3 style="color:#a78bfa;font-size:0.85rem;margin:0 0 0.5rem">EVIDENCE CHAIN</h3>
    <p style="color:#57534e;font-size:0.8rem;margin:0">No evidence collected. Each investigative step below will add findings to this board.</p>
  </div>
  <div style="margin-top:1rem;padding:0.75rem;border:1px dashed #d97706;border-radius:4px;background:#d9770608">
    <p style="color:#d97706;font-size:0.8rem;margin:0"><strong>Agent Note:</strong> This board updates as you progress. Return here after each step to see accumulated intelligence. The agent will analyze your findings and suggest next moves.</p>
  </div>
</div>`,
          content: `The central intelligence board for your investigation into ${topic}. This board accumulates findings from every step.`,
          metadata: { featureType: 'osint', skillLevel: skill }
        },
        {
          id: 'n2', type: 'tool', title: 'Step 1: OSINT Collection', x: 440, y: 60, width: 260, height: 130, color: 'teal',
          pageLayout: 'dossier',
          htmlContent: `
<div style="font-family:monospace;color:#d6d3d1">
  <div style="border-bottom:1px solid #334155;padding-bottom:0.5rem;margin-bottom:1rem">
    <span style="color:#14b8a6;font-size:0.7rem">STEP 1 OF 5</span>
    <h2 style="color:#14b8a6;margin:0.25rem 0 0">OSINT Collection: ${topic}</h2>
  </div>
  <div style="background:#0a0a0a;padding:1rem;border:1px solid #292524;border-radius:4px;margin-bottom:1rem">
    <p style="color:#a8a29e;font-size:0.85rem">Gather publicly available information about ${topic}. Use search engines, social media, public records, and domain tools.</p>
    <div style="margin-top:0.75rem;padding:0.5rem;background:#14b8a610;border:1px solid #14b8a630;border-radius:4px">
      <p style="color:#14b8a6;font-size:0.75rem;margin:0"><strong>Tools:</strong> Google Dorking, Shodan, WHOIS, LinkedIn, Archive.org</p>
    </div>
  </div>
  <div style="background:#0a0a0a;padding:1rem;border:1px solid #292524;border-radius:4px">
    <h3 style="color:#d97706;font-size:0.8rem;margin:0 0 0.5rem">INTEL BOARD UPDATE</h3>
    <ul style="color:#a8a29e;font-size:0.8rem;padding-left:1.2rem;margin:0">
      <li><strong style="color:#14b8a6">+</strong> Domain registered 2019 via Namecheap</li>
      <li><strong style="color:#14b8a6">+</strong> 3 subdomains found: mail, api, staging</li>
      <li><strong style="color:#14b8a6">+</strong> CTO LinkedIn profile reveals tech stack</li>
      <li><strong style="color:#d97706">!</strong> Staging subdomain has no authentication</li>
    </ul>
  </div>
</div>`,
          content: `Gather open source intelligence about ${topic}. Your findings will be added to the investigation board.`,
          metadata: { toolsForStep: ['shodan', 'whois', 'google-dorking', 'linkedin'] }
        },
        {
          id: 'n3', type: 'tool', title: 'Step 2: Technical Recon', x: 440, y: 230, width: 260, height: 130, color: 'teal',
          pageLayout: 'dossier',
          htmlContent: `
<div style="font-family:monospace;color:#d6d3d1">
  <div style="border-bottom:1px solid #334155;padding-bottom:0.5rem;margin-bottom:1rem">
    <span style="color:#14b8a6;font-size:0.7rem">STEP 2 OF 5</span>
    <h2 style="color:#14b8a6;margin:0.25rem 0 0">Technical Reconnaissance</h2>
  </div>
  <div style="background:#0a0a0a;padding:1rem;border:1px solid #292524;border-radius:4px;margin-bottom:1rem">
    <p style="color:#a8a29e;font-size:0.85rem">Probe the infrastructure discovered in Step 1. Map ports, services, and technologies.</p>
  </div>
  <div style="background:#0a0a0a;padding:1rem;border:1px solid #292524;border-radius:4px">
    <h3 style="color:#d97706;font-size:0.8rem;margin:0 0 0.5rem">INTEL BOARD UPDATE (CUMULATIVE)</h3>
    <p style="color:#57534e;font-size:0.7rem;margin:0 0 0.5rem">Previous findings + new discoveries:</p>
    <ul style="color:#a8a29e;font-size:0.8rem;padding-left:1.2rem;margin:0">
      <li style="color:#57534e">[From Step 1] Domain, subdomains, tech stack identified</li>
      <li><strong style="color:#14b8a6">+</strong> Port scan: 22(SSH), 80(HTTP), 443(HTTPS), 3306(MySQL), 8080(staging)</li>
      <li><strong style="color:#14b8a6">+</strong> SSH banner: OpenSSH 7.6 (outdated, CVE-2018-15473)</li>
      <li><strong style="color:#14b8a6">+</strong> MySQL exposed to internet (critical misconfiguration)</li>
      <li><strong style="color:#d97706">!</strong> Staging app on :8080 running debug mode</li>
      <li><strong style="color:#ef4444">!!</strong> HYPOTHESIS: Staging server is the weakest entry point</li>
    </ul>
  </div>
</div>`,
          content: `Probe the technical infrastructure. Previous OSINT findings guide your scanning priorities.`,
          metadata: { toolsForStep: ['nmap', 'masscan', 'nuclei', 'wappalyzer'] }
        },
        { id: 'n4', type: 'decision', title: 'Step 3: Analyze & Prioritize', content: `Review the accumulated intelligence board:\n\n**From Step 1:** Domain info, subdomains, employee data\n**From Step 2:** Open ports, outdated services, misconfigs\n\nChoose your next investigative path:\n\n-> Deep dive on staging server (highest risk)\n-> Investigate employee credentials (social vector)\n-> Analyze the exposed MySQL instance\n-> Map the full attack surface before proceeding\n\nThe agent will update hypotheses based on your choice.`, x: 780, y: 145, width: 280, height: 170, color: 'purple', metadata: { featureType: 'osint' } },
        {
          id: 'n5', type: 'step', title: 'Step 4: Deep Analysis', x: 1100, y: 60, width: 260, height: 130, color: 'amber',
          pageLayout: 'dossier',
          htmlContent: `
<div style="font-family:monospace;color:#d6d3d1">
  <div style="border-bottom:1px solid #334155;padding-bottom:0.5rem;margin-bottom:1rem">
    <span style="color:#d97706;font-size:0.7rem">STEP 4 OF 5</span>
    <h2 style="color:#d97706;margin:0.25rem 0 0">Deep Analysis & Correlation</h2>
  </div>
  <div style="background:#0a0a0a;padding:1rem;border:1px solid #292524;border-radius:4px">
    <h3 style="color:#d97706;font-size:0.8rem;margin:0 0 0.5rem">FULL INTEL BOARD (ALL STEPS)</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:1rem">
      <div style="background:#14b8a608;border:1px solid #14b8a620;padding:0.5rem;border-radius:4px">
        <p style="color:#14b8a6;font-size:0.7rem;margin:0"><strong>CONFIRMED</strong></p>
        <ul style="color:#a8a29e;font-size:0.75rem;padding-left:1rem;margin:0.25rem 0 0">
          <li>3 subdomains active</li>
          <li>Outdated SSH (CVE-2018-15473)</li>
          <li>MySQL internet-exposed</li>
          <li>Staging has debug mode ON</li>
        </ul>
      </div>
      <div style="background:#d9770608;border:1px solid #d9770620;padding:0.5rem;border-radius:4px">
        <p style="color:#d97706;font-size:0.7rem;margin:0"><strong>HYPOTHESES</strong></p>
        <ul style="color:#a8a29e;font-size:0.75rem;padding-left:1rem;margin:0.25rem 0 0">
          <li>Staging server = primary entry point</li>
          <li>Debug mode leaks credentials</li>
          <li>MySQL may have default creds</li>
          <li>SSH vuln enables user enumeration</li>
        </ul>
      </div>
    </div>
    <div style="background:#ef444410;border:1px solid #ef444430;padding:0.5rem;border-radius:4px">
      <p style="color:#ef4444;font-size:0.7rem;margin:0"><strong>RISK ASSESSMENT</strong></p>
      <p style="color:#a8a29e;font-size:0.75rem;margin:0.25rem 0 0">Critical: 2 | High: 3 | Medium: 1 | Info: 4</p>
    </div>
  </div>
</div>`,
          content: `Cross-reference all findings. The intelligence board now shows the complete picture from all prior steps.`,
          metadata: { featureType: 'osint' }
        },
        {
          id: 'n6', type: 'output', title: 'Step 5: Final Intelligence Report', x: 1100, y: 240, width: 260, height: 130, color: 'stone',
          pageLayout: 'dossier',
          htmlContent: `
<div style="font-family:monospace;color:#d6d3d1">
  <div style="text-align:center;margin-bottom:1.5rem;border:2px solid #d97706;padding:1rem;background:#d9770608">
    <h2 style="color:#d97706;margin:0">INVESTIGATION COMPLETE</h2>
    <p style="color:#57534e;margin:0.25rem 0 0;font-size:0.8rem">${topic.toUpperCase()} | FINAL INTELLIGENCE ASSESSMENT</p>
  </div>
  <div style="background:#0a0a0a;padding:1rem;border:1px solid #292524;border-radius:4px">
    <h3 style="color:#14b8a6;font-size:0.85rem;margin:0 0 0.5rem">INVESTIGATION SUMMARY</h3>
    <p style="color:#a8a29e;font-size:0.8rem">Over 5 steps, this investigation accumulated ${4 + 5 + 2} discrete findings, confirmed 4 vulnerabilities, and generated 4 hypotheses. The living intelligence board tracked how each discovery informed the next step of analysis.</p>
    <p style="color:#d97706;font-size:0.8rem;margin-top:0.5rem"><strong>Key methodology:</strong> Each step read the accumulated board, added new data, and the agent refined hypotheses accordingly. This mirrors real-world threat intelligence workflows.</p>
  </div>
</div>`,
          content: `The final report synthesizes all accumulated intelligence. The board shows the complete investigation chain.`,
          metadata: { featureType: 'osint' }
        },
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber', label: 'Begin OSINT' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber', label: 'Technical recon' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal' },
        { id: 'l4', source: 'n3', target: 'n4', color: 'teal' },
        { id: 'l5', source: 'n4', target: 'n5', color: 'purple', label: 'Deep dive' },
        { id: 'l6', source: 'n4', target: 'n6', color: 'purple', label: 'Write report' },
        { id: 'l7', source: 'n5', target: 'n6', color: 'amber' },
        { id: 'l8', source: 'n1', target: 'n4', color: 'stone', label: 'Return to board' },
      ],
      rootNodes: ['n1'],
      hiddenClues: [
        { id: `clue-src-${id}`, type: 'source-code' as const, nodeId: 'n1', hint: 'The initial briefing source contains the full target dossier', value: `<!-- CLASSIFIED: ${topic} investigation opened by NEXUS-INTEL. Priority: HIGH. Handler: ORACLE. Previous intel suggests APT activity linked to infrastructure registered through ${topic.toLowerCase().replace(/\s/g,'')}-holding.com -->` },
        { id: `clue-data-${id}`, type: 'data-attribute' as const, nodeId: 'n3', hint: 'Technical recon data attributes contain the full port scan results', value: `nmap-results: 22/tcp:open:OpenSSH_7.6 80/tcp:open:nginx/1.14.0 443/tcp:open:nginx/1.14.0 3306/tcp:open:MySQL_5.7.42 8080/tcp:open:Python/3.8_debug_server` },
        { id: `clue-con-${id}`, type: 'console-log' as const, nodeId: 'n5', hint: 'Console shows the correlation engine output', value: `[INTEL-CORRELATOR] ${topic}: 11 findings across 4 steps. Attack path confidence: 94%. Recommended: staging(8080) -> debug_creds -> lateral_to_mysql -> full_compromise` },
        { id: `clue-css-${id}`, type: 'css-comment' as const, nodeId: 'n6', hint: 'CSS contains the investigation classification marking', value: `/* CLASSIFICATION: ${topic.toUpperCase()} | NEXUS-INTEL-${id.slice(-8)} | DISTRIBUTION: EYES ONLY | RETENTION: 90 DAYS */` },
      ],
      tags: ['investigation', 'intelligence', 'knowledge-graph', 'progressive', 'osint', topic.toLowerCase()],
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
