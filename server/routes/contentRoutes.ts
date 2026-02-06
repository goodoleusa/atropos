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
