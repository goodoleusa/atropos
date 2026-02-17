import { Router } from "express";
import { storage } from "../storage";
import { insertFeedbackItemSchema } from "@shared/schema";

const router = Router();

const VALID_TYPES = new Set(["bug", "feature", "idea", "pain_point"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high", "critical"]);
const VALID_STATUSES = new Set(["open", "in_progress", "resolved", "shipped", "dismissed"]);

const recentSubmissions = new Map<string, number>();
const SERVER_RATE_LIMIT_MS = 2000;
const MAX_STORED_ITEMS = 500;

function isDuplicateSubmission(title: string): boolean {
  const key = title.trim().toLowerCase().slice(0, 60);
  const now = Date.now();
  const last = recentSubmissions.get(key);
  if (last && now - last < 60000) return true;
  recentSubmissions.set(key, now);
  if (recentSubmissions.size > 200) {
    const oldest = [...recentSubmissions.entries()]
      .sort((a, b) => a[1] - b[1])
      .slice(0, 100)
      .map(([k]) => k);
    oldest.forEach(k => recentSubmissions.delete(k));
  }
  return false;
}

let lastSubmitTime = 0;

router.get("/", async (_req, res) => {
  try {
    const items = await storage.getAllFeedbackItems();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const items = await storage.getAllFeedbackItems();
    const stats = {
      total: items.length,
      byType: { bug: 0, feature: 0, idea: 0, pain_point: 0 } as Record<string, number>,
      byStatus: { open: 0, in_progress: 0, resolved: 0, shipped: 0, dismissed: 0 } as Record<string, number>,
      byPriority: { critical: 0, high: 0, medium: 0, low: 0 } as Record<string, number>,
      bySource: {} as Record<string, number>,
      topVoted: items.sort((a, b) => b.votes - a.votes).slice(0, 5),
    };
    items.forEach(item => {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
      stats.bySource[item.source] = (stats.bySource[item.source] || 0) + 1;
    });
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const now = Date.now();
    if (now - lastSubmitTime < SERVER_RATE_LIMIT_MS) {
      return res.status(429).json({ error: "Too many submissions, slow down" });
    }
    lastSubmitTime = now;

    const body = req.body;
    if (!body.title || typeof body.title !== "string" || body.title.trim().length < 3) {
      return res.status(400).json({ error: "Title must be at least 3 characters" });
    }
    if (!body.description || typeof body.description !== "string" || body.description.trim().length < 5) {
      return res.status(400).json({ error: "Description must be at least 5 characters" });
    }
    if (body.type && !VALID_TYPES.has(body.type)) {
      return res.status(400).json({ error: "Invalid type" });
    }
    if (body.priority && !VALID_PRIORITIES.has(body.priority)) {
      return res.status(400).json({ error: "Invalid priority" });
    }

    body.title = body.title.trim().slice(0, 200);
    body.description = body.description.trim().slice(0, 2000);
    if (body.source) body.source = String(body.source).slice(0, 100);
    if (body.context) body.context = String(body.context).slice(0, 5000);
    if (body.tags && Array.isArray(body.tags)) {
      body.tags = body.tags.slice(0, 10).map((t: any) => String(t).slice(0, 50));
    }

    if (isDuplicateSubmission(body.title)) {
      return res.status(409).json({ error: "Duplicate feedback recently submitted" });
    }

    const existing = await storage.getAllFeedbackItems();
    if (existing.length >= MAX_STORED_ITEMS) {
      return res.status(507).json({ error: "Feedback storage limit reached, review existing items first" });
    }

    const parsed = insertFeedbackItemSchema.parse(body);
    const item = await storage.createFeedbackItem(parsed);
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
    if (req.body.resolution && typeof req.body.resolution === "string") updates.resolution = req.body.resolution.slice(0, 2000);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid updates provided" });
    }

    const updated = await storage.updateFeedbackItem(id, updates);
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
    const updated = await storage.voteFeedbackItem(id);
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
    const deleted = await storage.deleteFeedbackItem(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
