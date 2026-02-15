import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, insertCommandLogSchema, insertCampaignRunSchema } from "../shared/schema";
import { generateSessionExportCode, generateSecretCode, decodeQRPayload } from "./qrcode";
import { registerChatRoutes } from "./replit_integrations/chat";
import osintRoutes from "./routes/osint";
import behaviorRoutes from "./routes/behavior";
import atroposRoutes from "./routes/atropos";
import progressionRoutes from "./routes/progressionRoutes";
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
  
  // Register Atropos routes
  app.use("/api/atropos", atroposRoutes);
  
  // Register Behavior Analysis routes
  app.use("/api/behavior", behaviorRoutes);
  
  // Register Atropos Scanner routes
  app.use("/api/atropos", atroposRoutes);
  
  // Register Progression routes (XP, achievements, leaderboards, challenges)
  app.use(progressionRoutes);
  
  // ==================== Client Agent API ====================
  // For CrewAI security agents deployed on client networks
  
  // Report security finding from agent
  app.post("/api/client-agents/findings", rateLimit(120, 60000), async (req, res) => {
    try {
      const { client_id, agent_id, finding, timestamp } = req.body;
      
      if (!client_id || !finding) {
        return res.status(400).json({ error: "client_id and finding required" });
      }
      
      // Create threat alert for client
      const alert = {
        client_id,
        agent_id: agent_id || 'unknown',
        severity: finding.severity || 'medium',
        category: finding.category || 'security_finding',
        title: finding.title || 'Security Finding',
        description: finding.description || '',
        evidence: finding,
        timestamp: timestamp || new Date().toISOString()
      };
      
      // In production, save to database
      // For now, log it
      console.log('[CLIENT AGENT FINDING]', alert);
      
      res.json({
        success: true,
        alert_id: `alert_${Date.now()}`,
        message: 'Finding logged successfully'
      });
    } catch (error) {
      console.error("Client agent finding error:", error);
      res.status(500).json({ error: "Failed to log finding" });
    }
  });
  
  // Request human approval for sensitive action
  app.post("/api/client-agents/approval-request", rateLimit(30, 60000), async (req, res) => {
    try {
      const { client_id, action, severity } = req.body;
      
      if (!client_id || !action) {
        return res.status(400).json({ error: "client_id and action required" });
      }
      
      // Create approval request
      const approval_id = `approval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      
      // In production:
      // 1. Save to database
      // 2. Send notification to client
      // 3. Wait for client response
      
      console.log('[APPROVAL REQUEST]', { approval_id, client_id, action, severity });
      
      res.json({
        success: true,
        approval_id,
        message: 'Approval request created. Client will be notified.',
        status: 'pending'
      });
    } catch (error) {
      console.error("Approval request error:", error);
      res.status(500).json({ error: "Failed to create approval request" });
    }
  });
  
  app.get("/api/admin/agent-config", async (req, res) => {
    try {
      const accessToken = req.headers['x-access-token'] as string || req.cookies.APP_ACCESS_TOKEN;
      if (!accessToken || accessToken !== process.env.APP_ACCESS_TOKEN) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const prompts = await storage.getAdminPromptsByCategory('system');
      const config: Record<string, any> = {};
      prompts.forEach(p => {
        try {
          config[p.key] = JSON.parse(p.content);
        } catch (e) {
          config[p.key] = { baseInstructions: p.content };
        }
      });
      res.json(config);
    } catch (error) {
      console.error("Get agent config error:", error);
      res.status(500).json({ error: "Failed to fetch agent config" });
    }
  });

  app.put("/api/admin/agent-config", async (req, res) => {
    try {
      const accessToken = req.headers['x-access-token'] as string || req.cookies.APP_ACCESS_TOKEN;
      if (!accessToken || accessToken !== process.env.APP_ACCESS_TOKEN) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { agentId, ...config } = req.body;
      if (!agentId) return res.status(400).json({ error: "agentId required" });
      
      await storage.upsertAdminPrompt({
        key: agentId,
        name: agentId,
        content: JSON.stringify({ ...config, updatedAt: new Date().toISOString() }),
        category: 'system',
        isActive: true,
        version: 1
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Save agent config error:", error);
      res.status(500).json({ error: "Failed to save agent config" });
    }
  });

  app.get("/api/admin/wandb-config", async (req, res) => {
    try {
      const accessToken = req.headers['x-access-token'] as string || req.cookies.APP_ACCESS_TOKEN;
      if (!accessToken || accessToken !== process.env.APP_ACCESS_TOKEN) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const prompt = await storage.getAdminPromptByKey('wandb_config');
      if (!prompt) return res.json({ enabled: false, project: 'nexus-agents', entity: '' });
      const config = JSON.parse(prompt.content);
      res.json({ ...config, apiKeySet: !!config.apiKey });
    } catch (error) {
      console.error("Get wandb config error:", error);
      res.status(500).json({ error: "Failed to fetch wandb config" });
    }
  });

  app.put("/api/admin/wandb-config", async (req, res) => {
    try {
      const accessToken = req.headers['x-access-token'] as string || req.cookies.APP_ACCESS_TOKEN;
      if (!accessToken || accessToken !== process.env.APP_ACCESS_TOKEN) {
        return res.status(403).json({ error: "Admin access required" });
      }
      const config = req.body;
      await storage.upsertAdminPrompt({
        key: 'wandb_config',
        name: 'W&B Configuration',
        content: JSON.stringify(config),
        category: 'monitoring',
        isActive: true,
        version: 1
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Save wandb config error:", error);
      res.status(500).json({ error: "Failed to save wandb config" });
    }
  });

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

      const updated = await storage.updateCampaignRun(runId as string, updates);
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

  // ===== PROMPT GALLERY =====

  app.get("/api/prompts/gallery", async (req, res) => {
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

  app.get("/api/prompts/gallery/mine/:token", async (req, res) => {
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

  app.post("/api/prompts/gallery", rateLimit(20, 60000), async (req, res) => {
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

  // ==================== Collectibles API ====================

  // Artifacts
  app.get("/api/artifacts", async (_req, res) => {
    try {
      const artifacts = await storage.getAllArtifacts();
      res.json(artifacts);
    } catch (error) {
      console.error("Get artifacts error:", error);
      res.status(500).json({ error: "Failed to fetch artifacts" });
    }
  });

  app.post("/api/artifacts", rateLimit(30, 60000), async (req, res) => {
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

  app.patch("/api/artifacts/:id", rateLimit(30, 60000), async (req, res) => {
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

  app.delete("/api/artifacts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteArtifact(id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Delete artifact error:", error);
      res.status(500).json({ error: "Failed to delete artifact" });
    }
  });

  // Mystical Cards
  app.get("/api/mystical-cards", async (_req, res) => {
    try {
      const cards = await storage.getMysticalCards();
      res.json(cards);
    } catch (error) {
      console.error("Get mystical cards error:", error);
      res.status(500).json({ error: "Failed to fetch mystical cards" });
    }
  });

  app.put("/api/mystical-cards/:cardId", rateLimit(30, 60000), async (req, res) => {
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

  app.delete("/api/mystical-cards/:cardId", async (req, res) => {
    try {
      const { cardId } = req.params;
      const deleted = await storage.deleteMysticalCard(cardId);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Delete mystical card error:", error);
      res.status(500).json({ error: "Failed to delete mystical card" });
    }
  });

  // Quantum Popups
  app.get("/api/quantum/events", async (_req, res) => {
    try {
      const events = await storage.getQuantumEvents();
      res.json(events);
    } catch (error) {
      console.error("Get quantum events error:", error);
      res.status(500).json({ error: "Failed to fetch quantum events" });
    }
  });

  app.put("/api/quantum/events/:eventId", rateLimit(30, 60000), async (req, res) => {
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

  app.get("/api/quantum/messages", async (_req, res) => {
    try {
      const messages = await storage.getQuantumMessages();
      res.json(messages);
    } catch (error) {
      console.error("Get quantum messages error:", error);
      res.status(500).json({ error: "Failed to fetch quantum messages" });
    }
  });

  app.post("/api/quantum/messages", rateLimit(30, 60000), async (req, res) => {
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

  app.patch("/api/quantum/messages/:id", rateLimit(30, 60000), async (req, res) => {
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

  app.delete("/api/quantum/messages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteQuantumMessage(parseInt(id, 10));
      res.json({ success: deleted });
    } catch (error) {
      console.error("Delete quantum message error:", error);
      res.status(500).json({ error: "Failed to delete quantum message" });
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

  // ============== MODMAIL ROUTES ==============
  
  app.get("/api/admin/modmail", async (req, res) => {
    try {
      const mail = await storage.getAllModmail();
      res.json(mail);
    } catch (error) {
      console.error("Get modmail error:", error);
      res.status(500).json({ error: "Failed to retrieve modmail" });
    }
  });

  app.get("/api/modmail/my-tickets", async (req, res) => {
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

  app.post("/api/modmail", rateLimit(5, 60000), async (req, res) => {
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

  app.put("/api/admin/modmail/:ticketId", async (req, res) => {
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

  // ============================================
  // THREAT INTELLIGENCE FEEDS
  // ============================================
  
  // Allowlist of approved threat intel feed URLs (security: prevents SSRF)
  const THREAT_INTEL_FEEDS: Record<string, { url: string; method: 'GET' | 'POST'; body?: string }> = {
    'abuse_ch_urlhaus': { url: 'https://urlhaus-api.abuse.ch/v1/', method: 'POST', body: 'query=get_recent&limit=25' },
    'abuse_ch_threatfox': { url: 'https://threatfox-api.abuse.ch/api/v1/', method: 'POST', body: 'query=get_iocs&days=1' },
    'abuse_ch_malwarebazaar': { url: 'https://mb-api.abuse.ch/api/v1/', method: 'POST', body: 'query=get_recent&selector=100' },
    'cisa_kev': { url: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', method: 'GET' },
    'ransomware_live': { url: 'https://api.ransomware.live/recentvictims', method: 'GET' },
  };
  
  app.post("/api/threat-intel/fetch", rateLimit(10, 60000), async (req, res) => {
    try {
      const { feedId } = req.body;
      
      if (!feedId) {
        return res.status(400).json({ error: "feedId required" });
      }
      
      // Security: Only allow approved feeds from allowlist
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
      
      // Return trimmed data to avoid huge payloads
      const trimmed = Array.isArray(data) 
        ? data.slice(0, 50) 
        : (data.data ? { ...data, data: data.data.slice?.(0, 50) || data.data } : data);
      
      res.json(trimmed);
    } catch (error: any) {
      console.error("Threat intel fetch error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch threat intel" });
    }
  });

  // ============================================
  // SECURITY AGENTS ANALYSIS
  // ============================================
  
  app.post("/api/agents/analyze", rateLimit(20, 60000), async (req, res) => {
    try {
      const { agentId, prompt, sessionToken } = req.body;
      
      if (!agentId || !prompt) {
        return res.status(400).json({ error: "agentId and prompt required" });
      }
      
      // Import agent definitions
      const { SECURITY_AGENTS, getAgentById } = await import("@shared/agents");
      const agent = getAgentById(agentId);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      // Get admin config for any overrides
      const adminConfig = await storage.getAdminConfig();
      const agentOverrides = adminConfig?.agentConfig?.[agentId] || {};
      
      // Combine base instructions (admin protected) with user prompt
      const baseInstructions = agentOverrides.baseInstructions || (agent as any).baseInstructions;
      const model = agentOverrides.model || (agent as any).defaultModel;
      const temperature = agentOverrides.temperature ?? (agent as any).defaultTemperature;
      
      const fullPrompt = `${baseInstructions}\n\n---\nUser Request:\n${prompt}`;
      
      // Call OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nexus-security.replit.app",
          "X-Title": "NEXUS Security Platform"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: baseInstructions },
            { role: "user", content: prompt }
          ],
          temperature,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${errorText}`);
      }
      
      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content || "No response generated";
      
      res.json({
        agentId,
        agentName: agent.name,
        analysis,
        model,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Agent analysis error:", error);
      res.status(500).json({ error: error.message || "Analysis failed" });
    }
  });

  // ============================================
  // ADMIN AGENT CONFIGURATION (Admin Auth Required)
  // ============================================
  
  // Helper: Check if session has admin (devMode) enabled
  async function checkAdminAuth(req: any, res: any): Promise<boolean> {
    const sessionToken = req.headers['x-session-token'] || req.query.sessionToken;
    if (!sessionToken || !validateSessionToken(sessionToken)) {
      res.status(401).json({ error: "Session token required" });
      return false;
    }
    
    const session = await storage.getSessionByToken(sessionToken);
    if (!session) {
      res.status(401).json({ error: "Invalid session" });
      return false;
    }
    
    // Check if devMode is enabled in session settings
    const settings = session.settings as Record<string, any> || {};
    if (!settings.devMode) {
      res.status(403).json({ error: "Admin access required (devMode must be enabled)" });
      return false;
    }
    
    return true;
  }
  
  // Get admin agent configs (base instructions) - admin only
  app.get("/api/admin/agent-config", async (req, res) => {
    try {
      if (!await checkAdminAuth(req, res)) return;
      
      const config = await storage.getAdminConfig();
      res.json(config?.agentConfig || {});
    } catch (error) {
      console.error("Get agent config error:", error);
      res.status(500).json({ error: "Failed to get agent config" });
    }
  });
  
  // Update admin agent configs (protected base instructions) - admin only
  app.put("/api/admin/agent-config", async (req, res) => {
    try {
      if (!await checkAdminAuth(req, res)) return;
      
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
  
  // Get W&B configuration (admin only)
  app.get("/api/admin/wandb-config", async (req, res) => {
    try {
      if (!await checkAdminAuth(req, res)) return;
      
      const config = await storage.getAdminConfig();
      // Only return non-sensitive info
      res.json({
        enabled: !!config?.wandbConfig?.enabled,
        project: config?.wandbConfig?.project || 'nexus-agents',
        entity: config?.wandbConfig?.entity || ''
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get W&B config" });
    }
  });
  
  // Update W&B configuration (admin only)
  app.put("/api/admin/wandb-config", async (req, res) => {
    try {
      if (!await checkAdminAuth(req, res)) return;
      
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
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update W&B config" });
    }
  });

  // === LIVE BOUNTY FEED ===
  
  const BOUNTY_FEED_ALLOWLIST = [
    // Bug Bounty Platforms
    'hackerone.com',
    'bugcrowd.com',
    'immunefi.com',
    // Vulnerability Feeds
    'nvd.nist.gov',
    'cisa.gov',
    'exploit-db.com',
    // Threat Intelligence
    'abuse.ch',
    'threatfox.abuse.ch',
    'malwarebazaar.abuse.ch',
    'urlhaus.abuse.ch',
    'ransomware.live',
    // Security News
    'bleepingcomputer.com',
    'krebsonsecurity.com',
    'therecord.media',
    'darkreading.com',
    'securityweek.com',
    'threatpost.com',
    // Law Enforcement & Cybercrime Bounties
    'fbi.gov',
    'europol.europa.eu',
    'interpol.int',
    'rewardsforjustice.net',
    'treasury.gov',
    'ofac.treasury.gov',
    'sec.gov',
    'justice.gov',
    'dea.gov',
    'ice.gov',
    'secretservice.gov',
    // International
    'ncsc.gov.uk',
    'cyber.gc.ca',
    'asd.gov.au',
    'bsi.bund.de',
    // Financial Crime
    'fincen.gov',
    'fatf-gafi.org',
    'chainalysis.com',
    'elliptic.co'
  ];
  
  app.get("/api/bounty-feeds", rateLimit(30, 60000), async (req, res) => {
    try {
      const feedUrl = req.query.url as string;
      
      if (!feedUrl) {
        return res.status(400).json({ error: "Feed URL required" });
      }
      
      // Validate URL is in allowlist
      const url = new URL(feedUrl);
      const isAllowed = BOUNTY_FEED_ALLOWLIST.some(domain => url.hostname.endsWith(domain));
      
      if (!isAllowed) {
        logSecurityEvent('BOUNTY_FEED_BLOCKED', { url: feedUrl, hostname: url.hostname });
        return res.status(403).json({ error: "Feed source not in allowlist" });
      }
      
      const response = await fetch(feedUrl, {
        headers: { 'User-Agent': 'NEXUS Security Platform/1.0' },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        return res.status(502).json({ error: "Failed to fetch feed" });
      }
      
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      
      // Parse RSS/XML to JSON
      const items: any[] = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;
      
      while ((match = itemRegex.exec(text)) !== null && items.length < 20) {
        const itemXml = match[1];
        const getTag = (tag: string) => {
          const tagMatch = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
          return tagMatch ? tagMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : null;
        };
        
        items.push({
          title: getTag('title'),
          link: getTag('link'),
          description: getTag('description')?.substring(0, 300),
          pubDate: getTag('pubDate'),
          category: getTag('category')
        });
      }
      
      res.json({ 
        items,
        source: url.hostname,
        fetchedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Bounty feed error:", error.message);
      res.status(500).json({ error: "Failed to fetch bounty feed" });
    }
  });

  return httpServer;
}
