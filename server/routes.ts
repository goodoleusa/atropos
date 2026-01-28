import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, insertCommandLogSchema } from "../shared/schema";
import { generateSessionExportCode, generateSecretCode, decodeQRPayload } from "./qrcode";
import { registerChatRoutes } from "./replit_integrations/chat";
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
      const { id } = req.params;
      
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
      const { id } = req.params;
      
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

  // ============================================
  // AGENT EXECUTION API
  // QR codes can be given to agents to execute elsewhere in system
  // ============================================
  
  // Execute QR payload via agent - supports all action types
  // Rate limited: 30 requests per minute per IP
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
  app.get("/api/agent/schema", (req, res) => {
    res.json({
      version: "1.0.0",
      description: "SysAdmin Corp Agent Execution API - QR payloads can be executed here",
      actions: [
        { type: 'raw', fields: ['data', 'encoding'], description: 'Raw data injection' },
        { type: 'beacon', fields: ['callback', 'agent_id', 'interval'], description: 'C2 beacon check-in' },
        { type: 'exfil', fields: ['target', 'fields', 'dest'], description: 'Data exfiltration' },
        { type: 'inject', fields: ['payload', 'shell', 'sandbox'], description: 'Code injection' },
        { type: 'phish', fields: ['redirect', 'spoof', 'capture'], description: 'Credential harvest' },
        { type: 'dropper', fields: ['artifact', 'autorun'], description: 'Payload dropper' },
        { type: 'pivot', fields: ['from', 'to', 'tunnel', 'port'], description: 'Network pivot' },
        { type: 'recon', fields: ['scan', 'targets', 'output'], description: 'Reconnaissance' },
        { type: 'persist', fields: ['method', 'key', 'value', 'ttl'], description: 'Persistence' },
        { type: 'crypto', fields: ['cipher', 'data', 'hint'], description: 'Crypto challenge' }
      ],
      endpoints: {
        execute: 'POST /api/agent/execute',
        schema: 'GET /api/agent/schema'
      }
    });
  });

  return httpServer;
}
