import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, insertCommandLogSchema, insertCampaignRunSchema } from "../shared/schema";
import { generateSessionExportCode, generateSecretCode, decodeQRPayload } from "./qrcode";
import { registerChatRoutes } from "./replit_integrations/chat";
import osintRoutes from "./routes/osint";
import behaviorRoutes from "./routes/behavior";
import { 
  securityHeaders, 
  rateLimit, 
  sanitizeInput, 
  validateSessionToken,
  clueSchema,
  questSchema,
  logSecurityEvent,
  appAccessGate
} from "./security";
import { 
  behaviorAnalyzer, 
  LEARNING_GOAL_METADATA, 
  LEARNING_STYLE_PROMPTS,
  type LearningGoal,
  type LearningStyle
} from "./behaviorAnalyzer";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Apply security headers to all responses
  app.use(securityHeaders);
  
  // Apply access gate (requires token in URL or valid cookie)
  app.use(appAccessGate);
  
  // Register chat routes for AI agent
  registerChatRoutes(app);
  
  // Register OSINT routes
  app.use("/api/osint", osintRoutes);
  
  // Register Behavior Analysis routes
  app.use("/api/behavior", behaviorRoutes);
  
  // Get or create game session (rate limited: 30/min)
  app.post("/api/session", rateLimit(30, 60000), async (req, res) => {
    try {
      const { sessionToken, username } = req.body;
      
      // Validate session token format
      if (!validateSessionToken(sessionToken)) {
        return res.status(400).json({ error: 'Invalid session token format' });
      }
      
      // Try to get existing session
      let session = await storage.getSessionByToken(sessionToken);
      
      if (!session) {
        // Create new session
        const validatedData = insertGameSessionSchema.parse({
          sessionToken,
          username: username || "Guest",
          collectedClues: [],
          completedQuests: [],
          discoveries: {}
        });
        session = await storage.createSession(validatedData);
      }
      
      res.json(session);
    } catch (error) {
      console.error("Session error:", error);
      res.status(500).json({ error: "Failed to create/retrieve session" });
    }
  });

  // Update game session (rate limited: 60/min)
  app.patch("/api/session/:token", rateLimit(60, 60000), async (req, res) => {
    try {
      const { token } = req.params;
      
      // Validate session token format
      if (!validateSessionToken(token)) {
        return res.status(400).json({ error: 'Invalid session token format' });
      }
      
      const updates = req.body;
      
      const session = await storage.updateSession(token, updates);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Update session error:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Get session by token
  app.get("/api/session/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const session = await storage.getSessionByToken(token);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Get session error:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Get all sessions (admin only)
  app.get("/api/sessions", async (req, res) => {
    try {
      const accessToken = req.headers['x-access-token'] as string;
      if (!accessToken || accessToken !== process.env.APP_ACCESS_TOKEN) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const allSessions = await storage.getAllSessions();
      const sessionsWithStats = allSessions.map(s => ({
        id: s.id,
        token: s.sessionToken,
        username: s.username,
        cluesCollected: s.collectedClues?.length || 0,
        questsCompleted: s.completedQuests?.length || 0,
        lastActiveAt: s.lastActive,
        createdAt: s.createdAt
      }));
      
      res.json(sessionsWithStats);
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // ==================== Campaign Runs API ====================

  // Create a new campaign run
  app.post("/api/campaign-runs", rateLimit(30, 60000), async (req, res) => {
    try {
      const { sessionToken, campaignId, currentNodeId, runId } = req.body;

      if (!validateSessionToken(sessionToken)) {
        return res.status(400).json({ error: "Invalid session token format" });
      }

      if (!campaignId || typeof campaignId !== "string") {
        return res.status(400).json({ error: "campaignId is required" });
      }

      const generatedRunId =
        typeof runId === "string" && runId.trim().length > 0
          ? runId
          : `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const history = Array.isArray(req.body.nodeHistory)
        ? req.body.nodeHistory
        : currentNodeId
          ? [currentNodeId]
          : [];

      const visited = Array.isArray(req.body.visitedNodes)
        ? req.body.visitedNodes
        : history;

      const validatedRun = insertCampaignRunSchema.parse({
        runId: generatedRunId,
        sessionToken,
        campaignId,
        currentNodeId,
        nodeHistory: history,
        visitedNodes: visited,
        inventory: Array.isArray(req.body.inventory) ? req.body.inventory : [],
        flags: Array.isArray(req.body.flags) ? req.body.flags : [],
        variables: typeof req.body.variables === "object" && req.body.variables ? req.body.variables : {},
        status: req.body.status || "active"
      });

      const run = await storage.createCampaignRun(validatedRun);
      res.json(run);
    } catch (error) {
      console.error("Create campaign run error:", error);
      res.status(500).json({ error: "Failed to create campaign run" });
    }
  });

  // Get active campaign run for a session
  app.get("/api/campaign-runs/active/:sessionToken", async (req, res) => {
    try {
      const { sessionToken } = req.params;
      if (!validateSessionToken(sessionToken)) {
        return res.status(400).json({ error: "Invalid session token format" });
      }

      const campaignId = typeof req.query.campaignId === "string" ? req.query.campaignId : undefined;
      const run = await storage.getActiveCampaignRun(sessionToken, campaignId);

      if (!run) {
        return res.status(404).json({ error: "No active run found" });
      }

      res.json(run);
    } catch (error) {
      console.error("Get active campaign run error:", error);
      res.status(500).json({ error: "Failed to fetch active run" });
    }
  });

  // Get all campaign runs for a session
  app.get("/api/campaign-runs/session/:sessionToken", async (req, res) => {
    try {
      const { sessionToken } = req.params;
      if (!validateSessionToken(sessionToken)) {
        return res.status(400).json({ error: "Invalid session token format" });
      }

      const runs = await storage.getCampaignRunsBySession(sessionToken);
      res.json(runs);
    } catch (error) {
      console.error("Get campaign runs by session error:", error);
      res.status(500).json({ error: "Failed to fetch campaign runs" });
    }
  });

  // Get a campaign run by ID
  app.get("/api/campaign-runs/:runId", async (req, res) => {
    try {
      const { runId } = req.params;
      const run = await storage.getCampaignRunById(runId);
      if (!run) {
        return res.status(404).json({ error: "Run not found" });
      }
      res.json(run);
    } catch (error) {
      console.error("Get campaign run error:", error);
      res.status(500).json({ error: "Failed to fetch campaign run" });
    }
  });

  // Update a campaign run
  app.patch("/api/campaign-runs/:runId", rateLimit(60, 60000), async (req, res) => {
    try {
      const { runId } = req.params;
      const updates = req.body || {};

      const updated = await storage.updateCampaignRun(runId, updates);
      if (!updated) {
        return res.status(404).json({ error: "Run not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Update campaign run error:", error);
      res.status(500).json({ error: "Failed to update campaign run" });
    }
  });

  // Get all available clues
  app.get("/api/clues", async (_req, res) => {
    try {
      const allClues = await storage.getAllClues();
      res.json(allClues);
    } catch (error) {
      console.error("Get clues error:", error);
      res.status(500).json({ error: "Failed to fetch clues" });
    }
  });

  // Create a new clue (with validation)
  app.post("/api/clues", rateLimit(30, 60000), async (req, res) => {
    try {
      // Validate input
      const validation = clueSchema.safeParse(req.body);
      if (!validation.success) {
        logSecurityEvent('INVALID_CLUE_INPUT', { errors: validation.error.issues });
        return res.status(400).json({ error: 'Invalid clue data', details: validation.error.issues });
      }
      
      const clueData = {
        id: sanitizeInput(validation.data.id),
        name: sanitizeInput(validation.data.name),
        description: sanitizeInput(validation.data.description || ''),
        content: sanitizeInput(req.body.content || ''),
        location: sanitizeInput(validation.data.location || 'unknown'),
        difficulty: req.body.difficulty || 1,
        isActive: true
      };
      const clue = await storage.createClue(clueData);
      res.json(clue);
    } catch (error) {
      console.error("Create clue error:", error);
      res.status(500).json({ error: "Failed to create clue" });
    }
  });

  // Update a clue (with validation)
  app.patch("/api/clues/:id", rateLimit(30, 60000), async (req, res) => {
    try {
      const id = req.params.id as string;
      
      // Sanitize string fields in updates
      const sanitizedUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string') {
          sanitizedUpdates[key] = sanitizeInput(value);
        } else {
          sanitizedUpdates[key] = value;
        }
      }
      
      const clue = await storage.updateClue(id, sanitizedUpdates as any);
      if (!clue) {
        return res.status(404).json({ error: "Clue not found" });
      }
      res.json(clue);
    } catch (error) {
      console.error("Update clue error:", error);
      res.status(500).json({ error: "Failed to update clue" });
    }
  });

  // Delete a clue
  app.delete("/api/clues/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteClue(id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Delete clue error:", error);
      res.status(500).json({ error: "Failed to delete clue" });
    }
  });

  // Get all available quests
  app.get("/api/quests", async (_req, res) => {
    try {
      const allQuests = await storage.getAllQuests();
      res.json(allQuests);
    } catch (error) {
      console.error("Get quests error:", error);
      res.status(500).json({ error: "Failed to fetch quests" });
    }
  });

  // Create a new quest (with validation)
  app.post("/api/quests", rateLimit(30, 60000), async (req, res) => {
    try {
      // Validate input
      const validation = questSchema.safeParse(req.body);
      if (!validation.success) {
        logSecurityEvent('INVALID_QUEST_INPUT', { errors: validation.error.issues });
        return res.status(400).json({ error: 'Invalid quest data', details: validation.error.issues });
      }
      
      const questData = {
        id: sanitizeInput(validation.data.id),
        name: sanitizeInput(validation.data.name),
        description: sanitizeInput(validation.data.description || ''),
        requiredClues: validation.data.requiredClues || [],
        reward: validation.data.reward ? sanitizeInput(validation.data.reward) : null,
        unlocks: validation.data.unlocks ? sanitizeInput(validation.data.unlocks) : null,
        isActive: true
      };
      const quest = await storage.createQuest(questData);
      res.json(quest);
    } catch (error) {
      console.error("Create quest error:", error);
      res.status(500).json({ error: "Failed to create quest" });
    }
  });

  // Update a quest (with validation)
  app.patch("/api/quests/:id", rateLimit(30, 60000), async (req, res) => {
    try {
      const id = req.params.id as string;
      
      // Sanitize string fields in updates
      const sanitizedUpdates: Record<string, any> = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string') {
          sanitizedUpdates[key] = sanitizeInput(value);
        } else {
          sanitizedUpdates[key] = value;
        }
      }
      
      const quest = await storage.updateQuest(id, sanitizedUpdates as any);
      if (!quest) {
        return res.status(404).json({ error: "Quest not found" });
      }
      res.json(quest);
    } catch (error) {
      console.error("Update quest error:", error);
      res.status(500).json({ error: "Failed to update quest" });
    }
  });

  // Delete a quest
  app.delete("/api/quests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQuest(id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Delete quest error:", error);
      res.status(500).json({ error: "Failed to delete quest" });
    }
  });

  // Log terminal command
  app.post("/api/commands/log", async (req, res) => {
    try {
      const validatedLog = insertCommandLogSchema.parse(req.body);
      const log = await storage.logCommand(validatedLog);
      res.json(log);
    } catch (error) {
      console.error("Log command error:", error);
      res.status(500).json({ error: "Failed to log command" });
    }
  });

  // Get command history
  app.get("/api/commands/history/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const history = await storage.getCommandHistory(token, limit);
      res.json(history);
    } catch (error) {
      console.error("Get command history error:", error);
      res.status(500).json({ error: "Failed to fetch command history" });
    }
  });

  // === BEHAVIORAL ANALYTICS ROUTES ===

  // Log behavioral event
  app.post("/api/behavior/log", rateLimit(60, 60000), async (req, res) => {
    try {
      const { sessionToken, actionType, category, intensity, metadata } = req.body;
      
      // Analyze the event for suspicious patterns
      if (metadata?.message) {
        const analysis = behaviorAnalyzer.analyzeMessage(sessionToken, metadata.message);
        metadata.behaviorAnalysis = analysis;
      }
      
      const profile = await storage.logBehavior({
        sessionToken,
        actionType,
        category,
        intensity: intensity || 1,
        metadata: metadata || {}
      });
      
      res.json(profile);
    } catch (error) {
      console.error("Log behavior error:", error);
      res.status(500).json({ error: "Failed to log behavior" });
    }
  });

  // Get behavioral trends (admin)
  app.get("/api/behavior/trends", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const trends = await storage.getBehavioralTrends(days);
      
      // Add flagged sessions
      trends.flaggedSessions = behaviorAnalyzer.getAllFlaggedSessions();
      
      res.json(trends);
    } catch (error) {
      console.error("Get trends error:", error);
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  });

  // Get all behavioral events (admin)
  app.get("/api/behavior/events", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const events = await storage.getAllBehaviors(limit);
      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Get learning profile for session
  app.get("/api/behavior/profile/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const profile = behaviorAnalyzer.getProfile(token);
      res.json(profile || { style: 'experiential', goals: [], interests: [], skillLevel: 'beginner', preferredPace: 'moderate' });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update learning goals
  app.post("/api/behavior/goals", async (req, res) => {
    try {
      const { sessionToken, goals } = req.body;
      behaviorAnalyzer.setLearningGoals(sessionToken, goals as LearningGoal[]);
      const profile = behaviorAnalyzer.getProfile(sessionToken);
      res.json(profile);
    } catch (error) {
      console.error("Set goals error:", error);
      res.status(500).json({ error: "Failed to set goals" });
    }
  });

  // Update learning style
  app.post("/api/behavior/style", async (req, res) => {
    try {
      const { sessionToken, style } = req.body;
      behaviorAnalyzer.setLearningStyle(sessionToken, style as LearningStyle);
      const profile = behaviorAnalyzer.getProfile(sessionToken);
      res.json(profile);
    } catch (error) {
      console.error("Set style error:", error);
      res.status(500).json({ error: "Failed to set style" });
    }
  });

  // Get learning goals metadata
  app.get("/api/behavior/goals-metadata", async (_req, res) => {
    res.json(LEARNING_GOAL_METADATA);
  });

  // Get learning styles metadata
  app.get("/api/behavior/styles-metadata", async (_req, res) => {
    res.json(LEARNING_STYLE_PROMPTS);
  });

  // Generate custom prompt addition based on profile
  app.get("/api/behavior/prompt-addition/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const addition = behaviorAnalyzer.generateCustomPromptAddition(token);
      res.json({ promptAddition: addition });
    } catch (error) {
      console.error("Get prompt addition error:", error);
      res.status(500).json({ error: "Failed to generate prompt addition" });
    }
  });

  // Check if session is flagged
  app.get("/api/behavior/flagged/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const flagged = behaviorAnalyzer.isSessionFlagged(token);
      const flags = behaviorAnalyzer.getSessionFlags(token);
      res.json({ flagged, flags });
    } catch (error) {
      console.error("Check flagged error:", error);
      res.status(500).json({ error: "Failed to check flagged status" });
    }
  });

  // ===== ADMIN PROMPTS =====
  
  // Get admin prompt by key
  app.get("/api/admin/prompts/:key", async (req, res) => {
    try {
      const { key } = req.params;
      let prompt = await storage.getAdminPromptByKey(key);
      
      // If master_system doesn't exist, create default
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

  // Get all admin prompts
  app.get("/api/admin/prompts", async (req, res) => {
    try {
      const prompts = await storage.getAllAdminPrompts();
      res.json(prompts);
    } catch (error) {
      console.error("Get all admin prompts error:", error);
      res.status(500).json({ error: "Failed to get admin prompts" });
    }
  });

  // Update admin prompt
  app.put("/api/admin/prompts/:key", async (req, res) => {
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

  // ===== CAMPAIGN TEMPLATES =====
  
  // Get all campaigns
  app.get("/api/admin/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Get campaigns error:", error);
      res.status(500).json({ error: "Failed to get campaigns" });
    }
  });

  // Get campaign by key
  app.get("/api/admin/campaigns/:key", async (req, res) => {
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

  // Create campaign
  app.post("/api/admin/campaigns", async (req, res) => {
    try {
      const campaign = await storage.createCampaign(req.body);
      res.json(campaign);
    } catch (error) {
      console.error("Create campaign error:", error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  // Update campaign
  app.put("/api/admin/campaigns/:key", async (req, res) => {
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

  // Delete campaign
  app.delete("/api/admin/campaigns/:key", async (req, res) => {
    try {
      const { key } = req.params;
      await storage.deleteCampaign(key);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete campaign error:", error);
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  // ===== FLOW NODES =====
  
  // Get all flow nodes
  app.get("/api/admin/flows", async (req, res) => {
    try {
      const nodes = await storage.getAllFlowNodes();
      res.json(nodes);
    } catch (error) {
      console.error("Get flow nodes error:", error);
      res.status(500).json({ error: "Failed to get flow nodes" });
    }
  });

  // Get flow nodes by campaign key
  app.get("/api/admin/flows/:campaignKey", async (req, res) => {
    try {
      const { campaignKey } = req.params;
      const nodes = await storage.getFlowNodesByKey(campaignKey);
      res.json(nodes);
    } catch (error) {
      console.error("Get flow nodes error:", error);
      res.status(500).json({ error: "Failed to get flow nodes" });
    }
  });

  // Upsert flow node
  app.put("/api/admin/flows/:nodeId", async (req, res) => {
    try {
      const { nodeId } = req.params;
      const node = await storage.upsertFlowNode(nodeId, req.body);
      res.json(node);
    } catch (error) {
      console.error("Upsert flow node error:", error);
      res.status(500).json({ error: "Failed to upsert flow node" });
    }
  });

  // Delete flow node
  app.delete("/api/admin/flows/:nodeId", async (req, res) => {
    try {
      const { nodeId } = req.params;
      await storage.deleteFlowNode(nodeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete flow node error:", error);
      res.status(500).json({ error: "Failed to delete flow node" });
    }
  });

  // ==================== Designer Campaigns API ====================
  
  // Get all designer campaigns
  app.get("/api/designer/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getAllDesignerCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Get designer campaigns error:", error);
      res.status(500).json({ error: "Failed to fetch designer campaigns" });
    }
  });

  // Get single designer campaign
  app.get("/api/designer/campaigns/:campaignId", async (req, res) => {
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

  // Save/update designer campaign
  app.put("/api/designer/campaigns/:campaignId", async (req, res) => {
    try {
      const { campaignId } = req.params;
      const campaign = await storage.upsertDesignerCampaign(campaignId, req.body);
      res.json(campaign);
    } catch (error) {
      console.error("Save designer campaign error:", error);
      res.status(500).json({ error: "Failed to save campaign" });
    }
  });

  // Delete designer campaign
  app.delete("/api/designer/campaigns/:campaignId", async (req, res) => {
    try {
      const { campaignId } = req.params;
      await storage.deleteDesignerCampaign(campaignId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete designer campaign error:", error);
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  // ==================== Shared Clues API ====================

  // Get all shared clues
  app.get("/api/designer/clues", async (req, res) => {
    try {
      const clues = await storage.getAllSharedClues();
      res.json(clues);
    } catch (error) {
      console.error("Get shared clues error:", error);
      res.status(500).json({ error: "Failed to fetch shared clues" });
    }
  });

  // Get single shared clue
  app.get("/api/designer/clues/:clueId", async (req, res) => {
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

  // Save/update shared clue
  app.put("/api/designer/clues/:clueId", async (req, res) => {
    try {
      const { clueId } = req.params;
      const clue = await storage.upsertSharedClue(clueId, req.body);
      res.json(clue);
    } catch (error) {
      console.error("Save shared clue error:", error);
      res.status(500).json({ error: "Failed to save clue" });
    }
  });

  // Delete shared clue
  app.delete("/api/designer/clues/:clueId", async (req, res) => {
    try {
      const { clueId } = req.params;
      await storage.deleteSharedClue(clueId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete shared clue error:", error);
      res.status(500).json({ error: "Failed to delete clue" });
    }
  });

  // ==================== Campaign Links API ====================

  // Get links for a campaign
  app.get("/api/designer/links/:campaignId", async (req, res) => {
    try {
      const { campaignId } = req.params;
      const links = await storage.getCampaignLinks(campaignId);
      res.json(links);
    } catch (error) {
      console.error("Get campaign links error:", error);
      res.status(500).json({ error: "Failed to fetch campaign links" });
    }
  });

  // Create campaign link
  app.post("/api/designer/links", async (req, res) => {
    try {
      const link = await storage.createCampaignLink(req.body);
      res.json(link);
    } catch (error) {
      console.error("Create campaign link error:", error);
      res.status(500).json({ error: "Failed to create link" });
    }
  });

  // Delete campaign link
  app.delete("/api/designer/links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCampaignLink(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete campaign link error:", error);
      res.status(500).json({ error: "Failed to delete link" });
    }
  });

  // Generate QR code for session export (rate limited: 10/min)
  app.post("/api/qr/export", rateLimit(10, 60000), async (req, res) => {
    try {
      const { sessionToken } = req.body;
      
      const session = await storage.getSessionByToken(sessionToken);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      const qrCode = await generateSessionExportCode(
        session.sessionToken,
        session.collectedClues || [],
        session.completedQuests || []
      );
      
      res.json({ qrCode, session });
    } catch (error) {
      console.error("QR export error:", error);
      res.status(500).json({ error: "Failed to generate export QR code" });
    }
  });

  // Generate secret QR code (rate limited: 10/min)
  app.post("/api/qr/secret", rateLimit(10, 60000), async (req, res) => {
    try {
      const { secretId, hint } = req.body;
      
      const qrCode = await generateSecretCode(secretId, hint);
      res.json({ qrCode, secretId });
    } catch (error) {
      console.error("QR secret error:", error);
      res.status(500).json({ error: "Failed to generate secret QR code" });
    }
  });

  // Import session from QR code (rate limited: 20/min)
  app.post("/api/qr/import", rateLimit(20, 60000), async (req, res) => {
    try {
      const { encoded, targetSessionToken } = req.body;
      
      const payload = decodeQRPayload(encoded);
      if (!payload || payload.type !== 'session') {
        return res.status(400).json({ error: "Invalid or expired QR code" });
      }
      
      const importData = JSON.parse(payload.data);
      
      // Merge imported data into current session
      const currentSession = await storage.getSessionByToken(targetSessionToken);
      if (!currentSession) {
        return res.status(404).json({ error: "Target session not found" });
      }
      
      // Merge clues (union of both)
      const mergedClues = Array.from(new Set([...(currentSession.collectedClues || []), ...(importData.clues || [])]));
      const mergedQuests = Array.from(new Set([...(currentSession.completedQuests || []), ...(importData.quests || [])]));
      
      const updatedSession = await storage.updateSession(targetSessionToken, {
        collectedClues: mergedClues,
        completedQuests: mergedQuests,
      });
      
      res.json({ 
        success: true, 
        session: updatedSession,
        imported: {
          clues: importData.clues?.length || 0,
          quests: importData.quests?.length || 0
        }
      });
    } catch (error) {
      console.error("QR import error:", error);
      res.status(500).json({ error: "Failed to import from QR code" });
    }
  });

  // Decode QR code (for scanning secrets)
  app.post("/api/qr/decode", async (req, res) => {
    try {
      const { encoded } = req.body;
      
      const payload = decodeQRPayload(encoded);
      if (!payload) {
        return res.status(400).json({ error: "Invalid QR code data" });
      }
      
      res.json(payload);
    } catch (error) {
      console.error("QR decode error:", error);
      res.status(500).json({ error: "Failed to decode QR code" });
    }
  });

  // Execute QR payload via agent - supports all action types
  // This endpoint processes the simulated security actions defined in the QR payloads.
  // Flow:
  // 1. Receive encoded payload from client scan.
  // 2. Validate session token if provided.
  // 3. Parse action type and execute corresponding game logic (clue discovery, recon, etc).
  // 4. Return execution results to be displayed in the terminal.
  app.post("/api/agent/execute", rateLimit(30, 60000), async (req, res) => {
    try {
      const { payload, sessionToken, agentId } = req.body;
      
      // Validate session token format
      if (sessionToken && !validateSessionToken(sessionToken)) {
        logSecurityEvent('INVALID_SESSION_TOKEN', { ip: req.ip, agentId });
        return res.status(400).json({ error: 'Invalid session token format' });
      }
      
      // Parse the payload (can be JSON string or object)
      const action = typeof payload === 'string' ? JSON.parse(payload) : payload;
      const actionType = action.type;
      
      // Log agent execution attempt (only if valid sessionToken provided)
      if (sessionToken && typeof sessionToken === 'string' && sessionToken.length > 0) {
        try {
          await storage.logCommand({
            sessionToken,
            command: `[AGENT:${agentId || 'unknown'}] ${actionType}`
          });
        } catch (logError) {
          console.error('Failed to log agent command:', logError);
        }
      }
      
      // Execute based on action type - mirrors real security tool intents
      const result: Record<string, any> = {
        executed: true,
        actionType,
        timestamp: new Date().toISOString(),
        agentId: agentId || 'anonymous'
      };
      
      switch (actionType) {
        case 'raw':
          // Raw data injection
          result.data = action.data;
          result.encoding = action.encoding || 'utf8';
          break;
          
        case 'beacon':
          // C2 beacon check-in (simulated)
          result.callback = action.callback;
          result.agentRegistered = true;
          result.nextCheckIn = action.interval || 60;
          break;
          
        case 'exfil':
          // Data exfiltration (returns requested session fields)
          if (sessionToken) {
            const session = await storage.getSessionByToken(sessionToken);
            if (session) {
              result.exfiltrated = {};
              for (const field of action.fields || []) {
                if (field === 'token') result.exfiltrated.token = session.sessionToken;
                if (field === 'clues') result.exfiltrated.clues = session.collectedClues;
                if (field === 'username') result.exfiltrated.username = session.username;
              }
            }
          }
          break;
          
        case 'inject':
          // Code injection (sandboxed - just returns the payload for terminal)
          result.payload = action.payload;
          result.shell = action.shell || 'bash';
          result.sandboxed = action.sandbox !== false;
          result.terminalCommand = action.payload;
          break;
          
        case 'phish':
          // Credential harvest redirect
          result.redirect = action.redirect;
          result.spoofType = action.spoof;
          result.captureFields = action.capture;
          break;
          
        case 'dropper':
          // Payload dropper - adds artifact/clue to session
          if (sessionToken && action.artifact) {
            const session = await storage.getSessionByToken(sessionToken);
            if (session) {
              const clues = [...(session.collectedClues || []), action.artifact.id];
              await storage.updateSession(sessionToken, { collectedClues: clues });
              result.dropped = action.artifact;
              result.autorun = action.autorun || false;
            }
          }
          break;
          
        case 'pivot':
          // Network pivot - returns routing info
          result.from = action.from;
          result.to = action.to;
          result.tunnel = action.tunnel;
          result.port = action.port;
          result.redirectUrl = action.to;
          break;
          
        case 'recon':
          // Reconnaissance - enumerate system state
          result.scan = action.scan;
          result.targets = action.targets;
          result.findings = {
            routes: ['/terminal', '/admin', '/void', '/archive', '/debug'],
            cluesAvailable: 5,
            questsAvailable: 3
          };
          break;
          
        case 'persist':
          // Persistence mechanism
          result.method = action.method;
          result.key = action.key;
          result.installed = true;
          result.ttl = action.ttl || 86400;
          break;
          
        case 'crypto':
          // Crypto challenge - return encrypted data for client to solve
          result.cipher = action.cipher;
          result.data = action.data;
          result.hint = action.hint;
          // Include solution for server-side validation later
          if (action.cipher === 'rot13') {
            result.solution = action.data.replace(/[a-zA-Z]/g, (c: string) => 
              String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c.charCodeAt(0) + 13) ? c.charCodeAt(0) + 13 : c.charCodeAt(0) - 13)
            );
          }
          break;
          
        default:
          result.executed = false;
          result.error = `Unknown action type: ${actionType}`;
      }
      
      res.json(result);
    } catch (error) {
      console.error("Agent execution error:", error);
      res.status(500).json({ error: "Failed to execute agent payload", details: String(error) });
    }
  });
  
  // Get agent execution schema (for documentation/validation)
  // This schema provides the structure for QR code payloads that can be scanned or executed.
  app.get("/api/agent/schema", (req, res) => {
    res.json({
      version: "1.1.0",
      description: "SysAdmin Corp Agent Execution API - QR payloads can be executed here",
      flow: {
        step1: "Generate a payload matching one of the action types below.",
        step2: "Encode the payload as a JSON string and create a QR code (or use /api/qr/secret).",
        step3: "Scan the QR code via the NEXUS terminal or send to /api/agent/execute.",
        step4: "The server validates the session and processes the simulated security intent."
      },
      actions: [
        { 
          type: 'raw', 
          fields: ['data', 'encoding'], 
          description: 'Raw data injection - used for seeding buffers or passing opaque tokens.',
          example: { type: 'raw', data: 'SGVsbG8=', encoding: 'base64' }
        },
        { 
          type: 'beacon', 
          fields: ['callback', 'agentId', 'interval'], 
          description: 'C2 beacon check-in - simulates an agent checking into a command & control server.',
          example: { type: 'beacon', callback: 'http://c2.internal', agentId: 'node-01', interval: 30 }
        },
        { 
          type: 'exfil', 
          fields: ['fields'], 
          description: 'Data exfiltration - extracts specific session fields (username, clues, token).',
          example: { type: 'exfil', fields: ['username', 'clues'] }
        },
        { 
          type: 'inject', 
          fields: ['payload', 'shell', 'sandbox'], 
          description: 'Code injection - simulates running a script in a specific environment.',
          example: { type: 'inject', payload: 'whoami', shell: 'bash', sandbox: true }
        },
        { 
          type: 'phish', 
          fields: ['redirect', 'spoof', 'capture'], 
          description: 'Credential harvest - simulates a redirect to a fake login page.',
          example: { type: 'phish', redirect: '/login', spoof: 'Active Directory', capture: ['password'] }
        },
        { 
          type: 'dropper', 
          fields: ['artifact', 'autorun'], 
          description: 'Payload dropper - adds a new discovery or clue directly to the player session.',
          example: { type: 'dropper', artifact: { id: 'secret-key-01' }, autorun: true }
        },
        { 
          type: 'pivot', 
          fields: ['from', 'to', 'tunnel', 'port'], 
          description: 'Network pivot - simulates jumping from a compromised host to an internal network.',
          example: { type: 'pivot', from: 'dmz', to: 'internal-db', port: 5432 }
        },
        { 
          type: 'recon', 
          fields: ['scan', 'targets'], 
          description: 'Reconnaissance - enumerates system endpoints, routes, and active sessions.',
          example: { type: 'recon', scan: 'full', targets: ['/api'] }
        },
        { 
          type: 'persist', 
          fields: ['method', 'key', 'ttl'], 
          description: 'Persistence - simulates installing a backdoor via scheduled tasks or registry keys.',
          example: { type: 'persist', method: 'cron', key: 'backup-task', ttl: 3600 }
        },
        { 
          type: 'crypto', 
          fields: ['cipher', 'data', 'hint'], 
          description: 'Crypto challenge - returns a challenge for the player to decode manually or via tools.',
          example: { type: 'crypto', cipher: 'rot13', data: 'uryyb', hint: 'Basic rotation' }
        }
      ],
      endpoints: {
        execute: {
          method: 'POST',
          path: '/api/agent/execute',
          body: {
            payload: "Object or JSON string matching an action type",
            sessionToken: "Valid player session identifier",
            agentId: "Optional identifier for the executing agent"
          }
        },
        schema: {
          method: 'GET',
          path: '/api/agent/schema'
        }
      }
    });
  });

  // ============================================================================
  // CLIENT INFO & ADMIN ESCALATION ENDPOINTS
  // ============================================================================

  // In-memory storage for escalations (in production, use database)
  const escalationStore: Map<string, any> = new Map();
  const metricsStore: Map<string, any> = new Map();

  // Get client info (IP, user agent) for escalation purposes
  // Note: This endpoint is only called during escalation, not routinely
  app.get("/api/client-info", (req, res) => {
    // Only allow if referred from same origin (basic protection)
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

  // Admin escalation endpoint - stores FULL context server-side
  app.post("/api/admin/escalations", rateLimit(10, 60000), async (req, res) => {
    try {
      const escalation = req.body;
      
      // Store full escalation data server-side
      const serverRecord = {
        ...escalation,
        receivedAt: Date.now(),
        serverIp: req.socket.remoteAddress,
        reviewed: false,
        feedback: null
      };
      
      escalationStore.set(escalation.id, serverRecord);
      
      // Log escalation for monitoring
      logSecurityEvent('escalation', {
        id: escalation.id,
        category: escalation.alert?.category || 'unknown',
        severity: escalation.alert?.severity || 'warning',
        ipAddress: escalation.userContext?.ipAddress || 'unknown',
        requiresImmediate: escalation.alert?.requiresImmediateReview || false
      });
      
      // Critical alerts get extra logging
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

  // Get pending escalations for admin dashboard
  // In production, add authentication middleware here
  app.get("/api/admin/escalations", async (req, res) => {
    try {
      const pending = Array.from(escalationStore.values())
        .filter(e => !e.reviewed)
        .sort((a, b) => {
          // Priority: critical first, then by time
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

  // Get specific escalation with full context
  app.get("/api/admin/escalations/:id", async (req, res) => {
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

  // Submit RLHF feedback for an escalation
  app.post("/api/admin/feedback", rateLimit(30, 60000), async (req, res) => {
    try {
      const feedback = req.body;
      
      // Update escalation with feedback
      const escalation = escalationStore.get(feedback.escalationId);
      if (escalation) {
        escalation.reviewed = true;
        escalation.feedback = feedback;
        escalation.reviewedAt = Date.now();
        escalationStore.set(feedback.escalationId, escalation);
      }
      
      // Log feedback for model improvement
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

  // Store confusion matrix metrics from client
  app.post("/api/admin/metrics", rateLimit(10, 60000), async (req, res) => {
    try {
      const { matrix, timestamp } = req.body;
      metricsStore.set('confusion_matrix', { matrix, timestamp });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to store metrics" });
    }
  });

  // Get confusion matrix metrics
  app.get("/api/admin/metrics", async (req, res) => {
    try {
      const metrics = metricsStore.get('confusion_matrix') || null;
      res.json({ metrics });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve metrics" });
    }
  });

  return httpServer;
}
