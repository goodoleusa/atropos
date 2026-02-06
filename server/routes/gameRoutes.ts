import { Router } from "express";
import { storage } from "../storage";
import { insertGameSessionSchema, insertCommandLogSchema, insertCampaignRunSchema } from "../../shared/schema";
import { generateSessionExportCode, generateSecretCode, decodeQRPayload } from "../qrcode";
import { 
  rateLimit, 
  sanitizeInput, 
  validateSessionToken,
  clueSchema,
  questSchema,
  logSecurityEvent
} from "../security";

const router = Router();

// Get or create game session (rate limited: 30/min)
router.post("/api/session", rateLimit(30, 60000), async (req, res) => {
  try {
    const { sessionToken, username } = req.body;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    let session = await storage.getSessionByToken(sessionToken);
    
    if (!session) {
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
router.patch("/api/session/:token", rateLimit(60, 60000), async (req, res) => {
  try {
    const { token } = req.params;
    
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
router.get("/api/session/:token", async (req, res) => {
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
router.get("/api/sessions", async (req, res) => {
  try {
    const expectedToken = process.env.APP_ACCESS_TOKEN;
    const headerToken = req.headers['x-access-token'] as string;
    const cookieToken = req.cookies?.access_token;
    const isDevMode = !expectedToken;
    const isAuthed = isDevMode || headerToken === expectedToken || cookieToken === expectedToken;
    if (!isAuthed) {
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

router.post("/api/campaign-runs", rateLimit(30, 60000), async (req, res) => {
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

router.get("/api/campaign-runs/active/:sessionToken", async (req, res) => {
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

router.get("/api/campaign-runs/session/:sessionToken", async (req, res) => {
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

router.get("/api/campaign-runs/:runId", async (req, res) => {
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

router.patch("/api/campaign-runs/:runId", rateLimit(60, 60000), async (req, res) => {
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

// ==================== Clues CRUD ====================

router.get("/api/clues", async (_req, res) => {
  try {
    const allClues = await storage.getAllClues();
    res.json(allClues);
  } catch (error) {
    console.error("Get clues error:", error);
    res.status(500).json({ error: "Failed to fetch clues" });
  }
});

router.post("/api/clues", rateLimit(30, 60000), async (req, res) => {
  try {
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

router.patch("/api/clues/:id", rateLimit(30, 60000), async (req, res) => {
  try {
    const id = req.params.id as string;
    
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

router.delete("/api/clues/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteClue(id);
    res.json({ success: deleted });
  } catch (error) {
    console.error("Delete clue error:", error);
    res.status(500).json({ error: "Failed to delete clue" });
  }
});

// ==================== Quests CRUD ====================

router.get("/api/quests", async (_req, res) => {
  try {
    const allQuests = await storage.getAllQuests();
    res.json(allQuests);
  } catch (error) {
    console.error("Get quests error:", error);
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

router.post("/api/quests", rateLimit(30, 60000), async (req, res) => {
  try {
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

router.patch("/api/quests/:id", rateLimit(30, 60000), async (req, res) => {
  try {
    const id = req.params.id as string;
    
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

router.delete("/api/quests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteQuest(id);
    res.json({ success: deleted });
  } catch (error) {
    console.error("Delete quest error:", error);
    res.status(500).json({ error: "Failed to delete quest" });
  }
});

// ==================== Command Logging ====================

router.post("/api/commands/log", async (req, res) => {
  try {
    const validatedLog = insertCommandLogSchema.parse(req.body);
    const log = await storage.logCommand(validatedLog);
    res.json(log);
  } catch (error) {
    console.error("Log command error:", error);
    res.status(500).json({ error: "Failed to log command" });
  }
});

router.get("/api/commands/history/:token", async (req, res) => {
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

// ==================== QR Code Routes ====================

router.post("/api/qr/export", rateLimit(10, 60000), async (req, res) => {
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

router.post("/api/qr/secret", rateLimit(10, 60000), async (req, res) => {
  try {
    const { secretId, hint } = req.body;
    
    const qrCode = await generateSecretCode(secretId, hint);
    res.json({ qrCode, secretId });
  } catch (error) {
    console.error("QR secret error:", error);
    res.status(500).json({ error: "Failed to generate secret QR code" });
  }
});

router.post("/api/qr/import", rateLimit(20, 60000), async (req, res) => {
  try {
    const { encoded, targetSessionToken } = req.body;
    
    const payload = decodeQRPayload(encoded);
    if (!payload || payload.type !== 'session') {
      return res.status(400).json({ error: "Invalid or expired QR code" });
    }
    
    const importData = JSON.parse(payload.data);
    
    const currentSession = await storage.getSessionByToken(targetSessionToken);
    if (!currentSession) {
      return res.status(404).json({ error: "Target session not found" });
    }
    
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

router.post("/api/qr/decode", async (req, res) => {
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

// ==================== Agent Execute + Schema ====================

router.post("/api/agent/execute", rateLimit(30, 60000), async (req, res) => {
  try {
    const { payload, sessionToken, agentId } = req.body;
    
    if (sessionToken && !validateSessionToken(sessionToken)) {
      logSecurityEvent('INVALID_SESSION_TOKEN', { ip: req.ip, agentId });
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    const action = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const actionType = action.type;
    
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
    
    const result: Record<string, any> = {
      executed: true,
      actionType,
      timestamp: new Date().toISOString(),
      agentId: agentId || 'anonymous'
    };
    
    switch (actionType) {
      case 'raw':
        result.data = action.data;
        result.encoding = action.encoding || 'utf8';
        break;
        
      case 'beacon':
        result.callback = action.callback;
        result.agentRegistered = true;
        result.nextCheckIn = action.interval || 60;
        break;
        
      case 'exfil':
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
        result.payload = action.payload;
        result.shell = action.shell || 'bash';
        result.sandboxed = action.sandbox !== false;
        result.terminalCommand = action.payload;
        break;
        
      case 'phish':
        result.redirect = action.redirect;
        result.spoofType = action.spoof;
        result.captureFields = action.capture;
        break;
        
      case 'dropper':
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
        result.from = action.from;
        result.to = action.to;
        result.tunnel = action.tunnel;
        result.port = action.port;
        result.redirectUrl = action.to;
        break;
        
      case 'recon':
        result.scan = action.scan;
        result.targets = action.targets;
        result.findings = {
          routes: ['/terminal', '/admin', '/void', '/archive', '/debug'],
          cluesAvailable: 5,
          questsAvailable: 3
        };
        break;
        
      case 'persist':
        result.method = action.method;
        result.key = action.key;
        result.installed = true;
        result.ttl = action.ttl || 86400;
        break;
        
      case 'crypto':
        result.cipher = action.cipher;
        result.data = action.data;
        result.hint = action.hint;
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

router.get("/api/agent/schema", (req, res) => {
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

// ==================== Multiplayer Lobbies ====================

router.get("/api/lobbies", async (req, res) => {
  try {
    const lobbies = await storage.getActiveLobbies();
    res.json(lobbies);
  } catch (error) {
    console.error("Get lobbies error:", error);
    res.status(500).json({ error: "Failed to retrieve lobbies" });
  }
});

router.get("/api/lobbies/:lobbyId", async (req, res) => {
  try {
    const lobby = await storage.getLobbyById(req.params.lobbyId);
    if (!lobby) {
      return res.status(404).json({ error: "Lobby not found" });
    }
    res.json(lobby);
  } catch (error) {
    console.error("Get lobby error:", error);
    res.status(500).json({ error: "Failed to retrieve lobby" });
  }
});

router.post("/api/lobbies", rateLimit(10, 60000), async (req, res) => {
  try {
    const { name, mode, maxPlayers, campaignId, sessionToken, alias } = req.body;
    
    if (!name || !sessionToken) {
      return res.status(400).json({ error: "Name and session required" });
    }
    
    const lobbyId = `lobby-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const lobby = await storage.createLobby({
      lobbyId,
      name: sanitizeInput(name, 100) || 'New Lobby',
      mode: mode || 'coop',
      maxPlayers: Math.min(maxPlayers || 4, 8),
      campaignId: campaignId || null,
      currentPlayers: [{ sessionToken, alias: alias || 'Host', score: 0 }],
      status: 'waiting',
      settings: {},
      expiresAt: new Date(Date.now() + 3600000)
    });
    
    res.json({ success: true, lobby });
  } catch (error) {
    console.error("Create lobby error:", error);
    res.status(500).json({ error: "Failed to create lobby" });
  }
});

router.post("/api/lobbies/:lobbyId/join", rateLimit(20, 60000), async (req, res) => {
  try {
    const lobbyId = req.params.lobbyId as string;
    const { sessionToken, alias } = req.body;
    
    if (!sessionToken || typeof sessionToken !== 'string') {
      return res.status(400).json({ error: "Session required" });
    }
    
    const lobby = await storage.joinLobby(lobbyId, {
      sessionToken,
      alias: alias || `Agent-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    });
    
    if (!lobby) {
      return res.status(400).json({ error: "Could not join lobby (full or not found)" });
    }
    
    res.json({ success: true, lobby });
  } catch (error) {
    console.error("Join lobby error:", error);
    res.status(500).json({ error: "Failed to join lobby" });
  }
});

router.post("/api/lobbies/:lobbyId/leave", async (req, res) => {
  try {
    const { lobbyId } = req.params;
    const { sessionToken } = req.body;
    
    const lobby = await storage.leaveLobby(lobbyId, sessionToken);
    res.json({ success: true, lobby });
  } catch (error) {
    console.error("Leave lobby error:", error);
    res.status(500).json({ error: "Failed to leave lobby" });
  }
});

router.put("/api/lobbies/:lobbyId", async (req, res) => {
  try {
    const { lobbyId } = req.params;
    const { status, settings } = req.body;
    
    const lobby = await storage.updateLobby(lobbyId, { status, settings });
    if (!lobby) {
      return res.status(404).json({ error: "Lobby not found" });
    }
    
    res.json(lobby);
  } catch (error) {
    console.error("Update lobby error:", error);
    res.status(500).json({ error: "Failed to update lobby" });
  }
});

export default router;
