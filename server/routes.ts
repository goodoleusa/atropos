import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, insertCommandLogSchema } from "../shared/schema";
import { generateSessionExportCode, generateSecretCode, decodeQRPayload } from "./qrcode";
import { registerChatRoutes } from "./replit_integrations/chat";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register chat routes for AI agent
  registerChatRoutes(app);
  
  // Get or create game session
  app.post("/api/session", async (req, res) => {
    try {
      const { sessionToken, username } = req.body;
      
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

  // Update game session
  app.patch("/api/session/:token", async (req, res) => {
    try {
      const { token } = req.params;
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

  // Create a new clue
  app.post("/api/clues", async (req, res) => {
    try {
      const clueData = {
        id: req.body.id,
        name: req.body.name,
        description: req.body.description || '',
        content: req.body.content || '',
        location: req.body.location || 'unknown',
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

  // Create a new quest
  app.post("/api/quests", async (req, res) => {
    try {
      const questData = {
        id: req.body.id,
        name: req.body.name,
        description: req.body.description || '',
        requiredClues: req.body.requiredClues || [],
        reward: req.body.reward || null,
        unlocks: req.body.unlocks || null,
        isActive: true
      };
      const quest = await storage.createQuest(questData);
      res.json(quest);
    } catch (error) {
      console.error("Create quest error:", error);
      res.status(500).json({ error: "Failed to create quest" });
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

  // Generate QR code for session export
  app.post("/api/qr/export", async (req, res) => {
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

  // Generate secret QR code (for placing around the app)
  app.post("/api/qr/secret", async (req, res) => {
    try {
      const { secretId, hint } = req.body;
      
      const qrCode = await generateSecretCode(secretId, hint);
      res.json({ qrCode, secretId });
    } catch (error) {
      console.error("QR secret error:", error);
      res.status(500).json({ error: "Failed to generate secret QR code" });
    }
  });

  // Import session from QR code
  app.post("/api/qr/import", async (req, res) => {
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
  app.post("/api/agent/execute", async (req, res) => {
    try {
      const { payload, sessionToken, agentId } = req.body;
      
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
