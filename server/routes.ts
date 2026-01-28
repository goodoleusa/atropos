import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, insertCommandLogSchema } from "../shared/schema";
import { generateSessionExportCode, generateSecretCode, decodeQRPayload } from "./qrcode";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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

  return httpServer;
}
