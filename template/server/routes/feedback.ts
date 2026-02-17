// TEMPLATE: Feedback Routes — with rate limiting and input validation
// This handles both manual and agent-auto-reported feedback.
// Includes server-side protections against abuse and infinite loops.

import { Router } from "express";
import { storage } from "../storage";
import { insertFeedbackItemSchema } from "../../shared/schema";

const router = Router();

// TEMPLATE: Server-side rate limiting and dedup
const VALID_TYPES = new Set(["bug", "feature", "idea", "pain_point"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high", "critical"]);
const VALID_STATUSES = new Set(["open", "in_progress", "resolved", "shipped", "dismissed"]);
const recentSubmissions = new Map<string, number>();
const SERVER_RATE_LIMIT_MS = 2000;
const MAX_STORED_ITEMS = 500;
let lastSubmitTime = 0;

function isDuplicate(title: string): boolean {
  const key = title.trim().toLowerCase().slice(0, 60);
  const now = Date.now();
  const last = recentSubmissions.get(key);
  if (last && now - last < 60000) return true;
  recentSubmissions.set(key, now);
  // TEMPLATE: Prevent memory leak in dedup map
  if (recentSubmissions.size > 200) {
    const oldest = [...recentSubmissions.entries()]
      .sort((a, b) => a[1] - b[1]).slice(0, 100).map(([k]) => k);
    oldest.forEach(k => recentSubmissions.delete(k));
  }
  return false;
}

router.get("/", async (_req, res) => {
  try {
    const items = await storage.feedback.getAll();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const now = Date.now();
    if (now - lastSubmitTime < SERVER_RATE_LIMIT_MS) {
      return res.status(429).json({ error: "Too many submissions" });
    }
    lastSubmitTime = now;

    const body = req.body;
    if (!body.title || typeof body.title !== "string" || body.title.trim().length < 3)
      return res.status(400).json({ error: "Title too short" });
    if (!body.description || typeof body.description !== "string" || body.description.trim().length < 5)
      return res.status(400).json({ error: "Description too short" });
    if (body.type && !VALID_TYPES.has(body.type))
      return res.status(400).json({ error: "Invalid type" });
    if (body.priority && !VALID_PRIORITIES.has(body.priority))
      return res.status(400).json({ error: "Invalid priority" });

    // TEMPLATE: Truncate fields to prevent oversized payloads
    body.title = body.title.trim().slice(0, 200);
    body.description = body.description.trim().slice(0, 2000);
    if (body.source) body.source = String(body.source).slice(0, 100);
    if (body.tags && Array.isArray(body.tags))
      body.tags = body.tags.slice(0, 10).map((t: any) => String(t).slice(0, 50));

    if (isDuplicate(body.title))
      return res.status(409).json({ error: "Duplicate" });

    const existing = await storage.feedback.getAll();
    if (existing.length >= MAX_STORED_ITEMS)
      return res.status(507).json({ error: "Storage limit reached" });

    const parsed = insertFeedbackItemSchema.parse(body);
    const item = await storage.feedback.create(parsed);
    res.json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const updates: Record<string, any> = {};
    if (req.body.status && VALID_STATUSES.has(req.body.status)) updates.status = req.body.status;
    if (req.body.priority && VALID_PRIORITIES.has(req.body.priority)) updates.priority = req.body.priority;
    if (req.body.resolution) updates.resolution = String(req.body.resolution).slice(0, 2000);
    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No valid updates" });
    const updated = await storage.feedback.update(id, updates);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/vote", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const updated = await storage.feedback.vote(id);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const deleted = await storage.feedback.delete(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
