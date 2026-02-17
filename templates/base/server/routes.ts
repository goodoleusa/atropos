import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSessionSchema, insertCommandLogSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/session", async (req, res) => {
    try {
      const parsed = insertGameSessionSchema.parse(req.body);
      const existing = await storage.getSession(parsed.sessionToken);
      if (existing) return res.json(existing);
      const session = await storage.createSession(parsed);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/session/:token", async (req, res) => {
    const session = await storage.getSession(req.params.token);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  });

  app.patch("/api/session/:token", async (req, res) => {
    try {
      const session = await storage.updateSession(req.params.token, req.body);
      if (!session) return res.status(404).json({ error: "Session not found" });
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/clues", async (_req, res) => {
    const clueList = await storage.getClues();
    res.json(clueList);
  });

  app.get("/api/quests", async (_req, res) => {
    const questList = await storage.getQuests();
    res.json(questList);
  });

  app.post("/api/commands", async (req, res) => {
    try {
      const parsed = insertCommandLogSchema.parse(req.body);
      const log = await storage.logCommand(parsed);
      res.json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}
