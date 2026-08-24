// TEMPLATE: Content Routes — admin prompts, gallery, flow nodes

import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// --- Admin Prompts ---
router.get("/prompts", async (_req, res) => {
  try {
    const prompts = await storage.content.getAllPrompts();
    res.json(prompts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/prompts/:key", async (req, res) => {
  try {
    const prompt = await storage.content.upsertPrompt({
      key: req.params.key,
      ...req.body,
    });
    res.json(prompt);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Prompt Gallery ---
router.get("/gallery", async (_req, res) => {
  try {
    const entries = await storage.content.getGalleryEntries();
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/gallery", async (req, res) => {
  try {
    const entry = await storage.content.createGalleryEntry(req.body);
    res.json(entry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Flow Nodes ---
router.get("/nodes", async (req, res) => {
  try {
    const campaignKey = req.query.campaign as string | undefined;
    const nodes = await storage.content.getFlowNodes(campaignKey);
    res.json(nodes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/nodes", async (req, res) => {
  try {
    const node = await storage.content.createFlowNode(req.body);
    res.json(node);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
