// TEMPLATE: Core Routes — sessions, clues, quests, commands
// Keep routes thin: validate input, call storage, return result.

import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// --- Sessions ---
router.get("/sessions", async (_req, res) => {
  try {
    const sessions = await storage.core.getAllSessions();
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/session/:token", async (req, res) => {
  try {
    const session = await storage.core.getSession(req.params.token);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/session", async (req, res) => {
  try {
    // TEMPLATE: Add input validation with Zod schema here
    const session = await storage.core.createSession(req.body);
    res.json(session);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Clues ---
router.get("/clues", async (_req, res) => {
  try {
    const clues = await storage.core.getAllClues();
    res.json(clues);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Quests ---
router.get("/quests", async (_req, res) => {
  try {
    const quests = await storage.core.getAllQuests();
    res.json(quests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Commands ---
router.post("/commands", async (req, res) => {
  try {
    const log = await storage.core.logCommand(req.body);
    res.json(log);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
