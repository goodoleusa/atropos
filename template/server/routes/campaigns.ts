// TEMPLATE: Campaign Routes — runs, templates, modules
// Thin route handlers delegating to storage.campaigns

import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// --- Campaign Runs ---
router.get("/runs/:runId", async (req, res) => {
  try {
    const run = await storage.campaigns.getRun(req.params.runId);
    if (!run) return res.status(404).json({ error: "Run not found" });
    res.json(run);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/runs", async (req, res) => {
  try {
    const run = await storage.campaigns.createRun(req.body);
    res.json(run);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Templates ---
router.get("/templates", async (_req, res) => {
  try {
    const templates = await storage.campaigns.getAllTemplates();
    res.json(templates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Agent Modules ---
router.get("/modules", async (_req, res) => {
  try {
    const modules = await storage.campaigns.getAllModules();
    res.json(modules);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/modules/:moduleId", async (req, res) => {
  try {
    const updated = await storage.campaigns.updateModule(req.params.moduleId, req.body);
    if (!updated) return res.status(404).json({ error: "Module not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
