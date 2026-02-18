import { Router, Request, Response } from "express";
import { db } from "../db";
import { missionFindings, backgroundTasks, insertMissionFindingSchema, insertBackgroundTaskSchema } from "@shared/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { validateSessionToken, sanitizeInput, rateLimit } from "../security";

const router = Router();

const hardenedFindingSchema = insertMissionFindingSchema.extend({
  title: z.string().max(300),
  content: z.string().max(50000),
  source: z.string().max(100),
  sourceAgent: z.string().max(100).optional().nullable(),
  type: z.string().max(50),
  severity: z.string().max(20).optional().nullable(),
  status: z.string().max(20),
});

const hardenedTaskSchema = insertBackgroundTaskSchema.extend({
  taskName: z.string().max(300),
  taskType: z.string().max(100),
  error: z.string().max(5000).optional().nullable(),
});

router.get("/api/mission/findings", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const source = req.query.source as string;
    const type = req.query.type as string;
    const status = req.query.status as string;

    let query = db.select().from(missionFindings).orderBy(desc(missionFindings.createdAt)).limit(limit);

    const conditions = [];
    if (source) conditions.push(eq(missionFindings.source, source));
    if (type) conditions.push(eq(missionFindings.type, type));
    if (status) conditions.push(eq(missionFindings.status, status));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query;
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/mission/findings", rateLimit(30, 60000), async (req: Request, res: Response) => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken || !validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Valid sessionToken is required" });
    }

    const validation = hardenedFindingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Validation failed", details: validation.error.issues });
    }

    const data = {
      ...validation.data,
      title: sanitizeInput(validation.data.title, 300),
      content: sanitizeInput(validation.data.content, 50000),
    };

    const [finding] = await db.insert(missionFindings).values(data).returning();
    res.json(finding);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/mission/findings/batch", rateLimit(5, 60000), async (req: Request, res: Response) => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken || !validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Valid sessionToken is required" });
    }

    const items = z.array(hardenedFindingSchema).max(20).safeParse(req.body.findings);
    if (!items.success) {
      return res.status(400).json({ error: "Validation failed", details: items.error.issues });
    }

    const sanitizedItems = items.data.map(item => ({
      ...item,
      title: sanitizeInput(item.title, 300),
      content: sanitizeInput(item.content, 50000),
    }));

    const results = await db.insert(missionFindings).values(sanitizedItems).returning();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/mission/findings/:id", rateLimit(60, 60000), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid id parameter" });
    }

    const sessionToken = req.body.sessionToken || req.query.sessionToken as string;
    if (!sessionToken || !validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Valid sessionToken is required" });
    }

    const [existing] = await db.select().from(missionFindings).where(eq(missionFindings.id, id));
    if (!existing) return res.status(404).json({ error: "Finding not found" });
    if (existing.sessionToken !== sessionToken) {
      return res.status(400).json({ error: "Session token mismatch" });
    }

    const { status, sentTo } = req.body;
    const updates: any = {};
    if (status) updates.status = status;
    if (sentTo) updates.sentTo = sentTo;

    const [updated] = await db.update(missionFindings).set(updates).where(eq(missionFindings.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Finding not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/mission/findings/:id", rateLimit(10, 60000), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid id parameter" });
    }

    const sessionToken = req.body.sessionToken || req.query.sessionToken as string;
    if (!sessionToken || !validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Valid sessionToken is required" });
    }

    const [existing] = await db.select().from(missionFindings).where(eq(missionFindings.id, id));
    if (!existing) return res.status(404).json({ error: "Finding not found" });
    if (existing.sessionToken !== sessionToken) {
      return res.status(400).json({ error: "Session token mismatch" });
    }

    await db.delete(missionFindings).where(eq(missionFindings.id, id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/mission/findings/stats", async (req: Request, res: Response) => {
  try {
    const stats = await db.select({
      source: missionFindings.source,
      count: sql<number>`count(*)::int`,
    }).from(missionFindings).groupBy(missionFindings.source);

    const byType = await db.select({
      type: missionFindings.type,
      count: sql<number>`count(*)::int`,
    }).from(missionFindings).groupBy(missionFindings.type);

    const total = stats.reduce((s, r) => s + r.count, 0);
    const newCount = await db.select({ count: sql<number>`count(*)::int` })
      .from(missionFindings).where(eq(missionFindings.status, "new"));

    res.json({ total, new: newCount[0]?.count || 0, bySource: stats, byType });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Background tasks endpoints
router.get("/api/mission/tasks", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    let query = db.select().from(backgroundTasks).orderBy(desc(backgroundTasks.startedAt)).limit(limit);
    if (status) {
      query = query.where(eq(backgroundTasks.status, status)) as any;
    }
    const results = await query;
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/mission/tasks", rateLimit(30, 60000), async (req: Request, res: Response) => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken || !validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Valid sessionToken is required" });
    }

    const validation = hardenedTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Validation failed", details: validation.error.issues });
    }
    const [task] = await db.insert(backgroundTasks).values(validation.data).returning();
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/mission/tasks/:id", rateLimit(60, 60000), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid id parameter" });
    }

    const sessionToken = req.body.sessionToken || req.query.sessionToken as string;
    if (!sessionToken || !validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Valid sessionToken is required" });
    }

    const [existing] = await db.select().from(backgroundTasks).where(eq(backgroundTasks.id, id));
    if (!existing) return res.status(404).json({ error: "Task not found" });
    if (existing.sessionToken !== sessionToken) {
      return res.status(400).json({ error: "Session token mismatch" });
    }

    const { status, progress, result, error: taskError } = req.body;
    const updates: any = {};
    if (status) updates.status = status;
    if (progress !== undefined) updates.progress = progress;
    if (result) updates.result = result;
    if (taskError) updates.error = taskError;
    if (status === "completed" || status === "failed") updates.completedAt = new Date();

    const [updated] = await db.update(backgroundTasks).set(updates).where(eq(backgroundTasks.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Task not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/mission/activity", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);

    const [findings, tasks] = await Promise.all([
      db.select().from(missionFindings).orderBy(desc(missionFindings.createdAt)).limit(limit),
      db.select().from(backgroundTasks).orderBy(desc(backgroundTasks.startedAt)).limit(10),
    ]);

    const activity = [
      ...findings.map(f => ({ kind: 'finding' as const, id: f.id, title: f.title, source: f.source, sourceAgent: f.sourceAgent, type: f.type, severity: f.severity, status: f.status, sentTo: f.sentTo, content: f.content, timestamp: f.createdAt, metadata: f.metadata })),
      ...tasks.map(t => ({ kind: 'task' as const, id: t.id, title: t.taskName, source: t.taskType, status: t.status, progress: t.progress, timestamp: t.startedAt, completedAt: t.completedAt, error: t.error })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);

    res.json(activity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
