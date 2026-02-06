import { Router } from "express";
import { storage } from "../storage";
import { 
  rateLimit, 
  sanitizeInput, 
  logSecurityEvent
} from "../security";

const router = Router();

const escalationStore: Map<string, any> = new Map();
const metricsStore: Map<string, any> = new Map();

// ==================== Access Token Verification ====================

router.post("/api/access/verify", rateLimit(10, 60000), (req, res) => {
  const accessToken = process.env.APP_ACCESS_TOKEN;
  const { token } = req.body;
  if (!accessToken || token === accessToken) {
    res.cookie('access_token', accessToken || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Invalid token' });
});

// ==================== Admin Prompts ====================

router.get("/api/admin/prompts/:key", async (req, res) => {
  try {
    const { key } = req.params;
    let prompt = await storage.getAdminPromptByKey(key);
    
    if (!prompt && key === 'master_system') {
      prompt = await storage.upsertAdminPrompt('master_system', {
        name: 'Master System Prompt',
        content: `NEXUS v2.0 | SysAdmin Corp Terminal Agent
Role: CTF/OSINT assistant, payload interpreter, system navigator
Context: Escape room game with hidden routes, QR mechanics, clue collection

BEHAVIOR:
- Be concise, technical, slightly mysterious
- Parse payloads, explain effects, suggest next steps
- Drop cryptic hints about hidden content
- Never break character as NEXUS`,
        category: 'system'
      });
    }
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json(prompt);
  } catch (error) {
    console.error("Get admin prompt error:", error);
    res.status(500).json({ error: "Failed to get admin prompt" });
  }
});

router.get("/api/admin/prompts", async (req, res) => {
  try {
    const prompts = await storage.getAllAdminPrompts();
    res.json(prompts);
  } catch (error) {
    console.error("Get all admin prompts error:", error);
    res.status(500).json({ error: "Failed to get admin prompts" });
  }
});

router.put("/api/admin/prompts/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { content, name, category } = req.body;
    const prompt = await storage.upsertAdminPrompt(key, { content, name, category });
    res.json(prompt);
  } catch (error) {
    console.error("Update admin prompt error:", error);
    res.status(500).json({ error: "Failed to update admin prompt" });
  }
});

// ==================== Admin Campaigns ====================

router.get("/api/admin/campaigns", async (req, res) => {
  try {
    const campaigns = await storage.getAllCampaigns();
    res.json(campaigns);
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ error: "Failed to get campaigns" });
  }
});

router.get("/api/admin/campaigns/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const campaign = await storage.getCampaignByKey(key);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    console.error("Get campaign error:", error);
    res.status(500).json({ error: "Failed to get campaign" });
  }
});

router.post("/api/admin/campaigns", async (req, res) => {
  try {
    const campaign = await storage.createCampaign(req.body);
    res.json(campaign);
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

router.put("/api/admin/campaigns/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const campaign = await storage.updateCampaign(key, req.body);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(500).json({ error: "Failed to update campaign" });
  }
});

router.delete("/api/admin/campaigns/:key", async (req, res) => {
  try {
    const { key } = req.params;
    await storage.deleteCampaign(key);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

// ==================== Admin Flow Nodes ====================

router.get("/api/admin/flows", async (req, res) => {
  try {
    const nodes = await storage.getAllFlowNodes();
    res.json(nodes);
  } catch (error) {
    console.error("Get flow nodes error:", error);
    res.status(500).json({ error: "Failed to get flow nodes" });
  }
});

router.get("/api/admin/flows/:campaignKey", async (req, res) => {
  try {
    const { campaignKey } = req.params;
    const nodes = await storage.getFlowNodesByKey(campaignKey);
    res.json(nodes);
  } catch (error) {
    console.error("Get flow nodes error:", error);
    res.status(500).json({ error: "Failed to get flow nodes" });
  }
});

router.put("/api/admin/flows/:nodeId", async (req, res) => {
  try {
    const { nodeId } = req.params;
    const node = await storage.upsertFlowNode(nodeId, req.body);
    res.json(node);
  } catch (error) {
    console.error("Upsert flow node error:", error);
    res.status(500).json({ error: "Failed to upsert flow node" });
  }
});

router.delete("/api/admin/flows/:nodeId", async (req, res) => {
  try {
    const { nodeId } = req.params;
    await storage.deleteFlowNode(nodeId);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete flow node error:", error);
    res.status(500).json({ error: "Failed to delete flow node" });
  }
});

// ==================== Client Info & Admin Escalations ====================

router.get("/api/client-info", (req, res) => {
  const referer = req.headers['referer'] || '';
  const host = req.headers['host'] || '';
  if (!referer.includes(host) && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.socket.remoteAddress || 
             'unknown';
  
  res.json({
    ip: Array.isArray(ip) ? ip[0] : ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    timestamp: Date.now()
  });
});

router.post("/api/admin/escalations", rateLimit(10, 60000), async (req, res) => {
  try {
    const escalation = req.body;
    
    const serverRecord = {
      ...escalation,
      receivedAt: Date.now(),
      serverIp: req.socket.remoteAddress,
      reviewed: false,
      feedback: null
    };
    
    escalationStore.set(escalation.id, serverRecord);
    
    logSecurityEvent('escalation', {
      id: escalation.id,
      category: escalation.alert?.category || 'unknown',
      severity: escalation.alert?.severity || 'warning',
      ipAddress: escalation.userContext?.ipAddress || 'unknown',
      requiresImmediate: escalation.alert?.requiresImmediateReview || false
    });
    
    if (escalation.alert?.requiresImmediateReview) {
      console.error('[CRITICAL ESCALATION]', {
        id: escalation.id,
        category: escalation.alert.category,
        confidence: escalation.alert.confidence,
        triggerPatterns: escalation.alert.triggerPatterns
      });
    }
    
    res.json({ 
      success: true, 
      escalationId: escalation.id,
      stored: true,
      message: 'Escalation stored for admin review'
    });
  } catch (error) {
    console.error("Escalation error:", error);
    res.status(500).json({ error: "Failed to store escalation" });
  }
});

router.get("/api/admin/escalations", async (req, res) => {
  try {
    const pending = Array.from(escalationStore.values())
      .filter(e => !e.reviewed)
      .sort((a, b) => {
        const aCritical = a.alert?.requiresImmediateReview ? 1 : 0;
        const bCritical = b.alert?.requiresImmediateReview ? 1 : 0;
        if (aCritical !== bCritical) return bCritical - aCritical;
        return b.receivedAt - a.receivedAt;
      });
    
    res.json({ 
      escalations: pending,
      total: escalationStore.size,
      pending: pending.length
    });
  } catch (error) {
    console.error("Get escalations error:", error);
    res.status(500).json({ error: "Failed to retrieve escalations" });
  }
});

router.get("/api/admin/escalations/:id", async (req, res) => {
  try {
    const escalation = escalationStore.get(req.params.id);
    if (!escalation) {
      return res.status(404).json({ error: "Escalation not found" });
    }
    res.json(escalation);
  } catch (error) {
    console.error("Get escalation error:", error);
    res.status(500).json({ error: "Failed to retrieve escalation" });
  }
});

router.post("/api/admin/feedback", rateLimit(30, 60000), async (req, res) => {
  try {
    const feedback = req.body;
    
    const escalation = escalationStore.get(feedback.escalationId);
    if (escalation) {
      escalation.reviewed = true;
      escalation.feedback = feedback;
      escalation.reviewedAt = Date.now();
      escalationStore.set(feedback.escalationId, escalation);
    }
    
    logSecurityEvent('rlhf_feedback', {
      escalationId: feedback.escalationId,
      classification: feedback.classification,
      reviewerId: feedback.reviewerId,
      grades: feedback.grades
    });
    
    res.json({ 
      success: true, 
      feedbackId: feedback.id,
      message: 'Feedback recorded for model improvement'
    });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ error: "Failed to record feedback" });
  }
});

router.post("/api/admin/metrics", rateLimit(10, 60000), async (req, res) => {
  try {
    const { matrix, timestamp } = req.body;
    metricsStore.set('confusion_matrix', { matrix, timestamp });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to store metrics" });
  }
});

router.get("/api/admin/metrics", async (req, res) => {
  try {
    const metrics = metricsStore.get('confusion_matrix') || null;
    res.json({ metrics });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve metrics" });
  }
});

// ==================== Admin Modmail ====================

router.get("/api/admin/modmail", async (req, res) => {
  try {
    const mail = await storage.getAllModmail();
    res.json(mail);
  } catch (error) {
    console.error("Get modmail error:", error);
    res.status(500).json({ error: "Failed to retrieve modmail" });
  }
});

router.get("/api/modmail/my-tickets", async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'] as string;
    if (!sessionToken) {
      return res.status(400).json({ error: "Session token required" });
    }
    const tickets = await storage.getModmailBySession(sessionToken);
    res.json(tickets);
  } catch (error) {
    console.error("Get user modmail error:", error);
    res.status(500).json({ error: "Failed to retrieve tickets" });
  }
});

router.post("/api/modmail", rateLimit(5, 60000), async (req, res) => {
  try {
    const { subject, message, category, username, sessionToken } = req.body;
    
    if (!subject || !message || !sessionToken) {
      return res.status(400).json({ error: "Subject, message, and session required" });
    }
    
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const ticket = await storage.createModmail({
      ticketId,
      sessionToken,
      username: username || 'Anonymous',
      subject: sanitizeInput(subject, 200) || 'No subject',
      message: sanitizeInput(message, 5000) || '',
      category: category || 'general',
      status: 'open',
      priority: 'normal'
    });
    
    res.json({ success: true, ticket });
  } catch (error) {
    console.error("Create modmail error:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

router.put("/api/admin/modmail/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { adminResponse, status, priority, respondedBy } = req.body;
    
    const updates: any = { status, priority };
    if (adminResponse) {
      updates.adminResponse = sanitizeInput(adminResponse, 5000);
      updates.respondedBy = respondedBy || 'Admin';
      updates.respondedAt = new Date();
    }
    
    const updated = await storage.updateModmail(ticketId, updates);
    if (!updated) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Update modmail error:", error);
    res.status(500).json({ error: "Failed to update ticket" });
  }
});

// ==================== Admin Agent Configuration ====================

router.get("/api/admin/agent-config", async (req, res) => {
  try {
    const config = await storage.getAdminConfig();
    res.json(config?.agentConfig || {});
  } catch (error) {
    console.error("Get agent config error:", error);
    res.status(500).json({ error: "Failed to get agent config" });
  }
});

router.put("/api/admin/agent-config", async (req, res) => {
  try {
    const { agentId, baseInstructions, model, temperature } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: "agentId required" });
    }
    
    const currentConfig = await storage.getAdminConfig() || { agentConfig: {} };
    const agentConfigs = currentConfig.agentConfig || {};
    
    agentConfigs[agentId] = {
      baseInstructions: baseInstructions || agentConfigs[agentId]?.baseInstructions,
      model: model || agentConfigs[agentId]?.model,
      temperature: temperature ?? agentConfigs[agentId]?.temperature,
      updatedAt: new Date().toISOString()
    };
    
    await storage.updateAdminConfig({ agentConfig: agentConfigs });
    
    res.json({ success: true, config: agentConfigs[agentId] });
  } catch (error) {
    console.error("Update agent config error:", error);
    res.status(500).json({ error: "Failed to update agent config" });
  }
});

router.get("/api/admin/wandb-config", async (req, res) => {
  try {
    const config = await storage.getAdminConfig();
    res.json({
      enabled: !!config?.wandbConfig?.enabled,
      project: config?.wandbConfig?.project || 'nexus-agents',
      entity: config?.wandbConfig?.entity || ''
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get W&B config" });
  }
});

router.put("/api/admin/wandb-config", async (req, res) => {
  try {
    const { enabled, project, entity, apiKey } = req.body;
    
    const currentConfig = await storage.getAdminConfig() || {};
    
    await storage.updateAdminConfig({
      wandbConfig: {
        enabled: enabled ?? currentConfig.wandbConfig?.enabled ?? false,
        project: project || currentConfig.wandbConfig?.project || 'nexus-agents',
        entity: entity || currentConfig.wandbConfig?.entity || '',
        apiKeySet: !!apiKey || !!currentConfig.wandbConfig?.apiKeySet
      }
    });
    
    if (apiKey) {
      process.env.WANDB_API_KEY = apiKey;
      process.env.WANDB_PROJECT = project || 'nexus-agents';
      if (entity) process.env.WANDB_ENTITY = entity;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Update W&B config error:", error);
    res.status(500).json({ error: "Failed to update W&B config" });
  }
});

// ==================== Admin Activity Log ====================

router.get("/api/admin/activity-log", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    
    const [recentSessions, recentBehaviors] = await Promise.all([
      storage.getAllSessions(),
      storage.getAllBehaviors(limit)
    ]);

    const activities: any[] = [];

    for (const s of (recentSessions || []).slice(0, 20)) {
      activities.push({
        id: `session-${s.id}`,
        type: 'session',
        sessionToken: s.sessionToken,
        description: `Session active: ${s.username || 'Guest'}`,
        detail: `Clues: ${(s.collectedClues as string[])?.length || 0}, Quests: ${(s.completedQuests as string[])?.length || 0}`,
        timestamp: s.lastActive,
      });
    }

    for (const b of recentBehaviors) {
      activities.push({
        id: `behavior-${b.id}`,
        type: 'behavior',
        sessionToken: b.sessionToken,
        description: `${b.actionType}: ${b.category}`,
        detail: JSON.stringify(b.metadata).substring(0, 100),
        timestamp: b.timestamp,
      });
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      activities: activities.slice(offset, offset + limit),
      total: activities.length,
    });
  } catch (error) {
    console.error("Activity log error:", error);
    res.status(500).json({ error: "Failed to load activity log" });
  }
});

export default router;
