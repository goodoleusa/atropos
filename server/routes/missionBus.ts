import { Router, Request, Response } from "express";
import { db } from "../db";
import { missionFindings, backgroundTasks, insertMissionFindingSchema, insertBackgroundTaskSchema } from "@shared/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

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

router.post("/api/mission/findings", async (req: Request, res: Response) => {
  try {
    const validation = insertMissionFindingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Validation failed", details: validation.error.issues });
    }
    const [finding] = await db.insert(missionFindings).values(validation.data).returning();
    res.json(finding);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/mission/findings/batch", async (req: Request, res: Response) => {
  try {
    const items = z.array(insertMissionFindingSchema).safeParse(req.body.findings);
    if (!items.success) {
      return res.status(400).json({ error: "Validation failed", details: items.error.issues });
    }
    const results = await db.insert(missionFindings).values(items.data).returning();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/mission/findings/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
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

router.delete("/api/mission/findings/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
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

router.post("/api/mission/tasks", async (req: Request, res: Response) => {
  try {
    const validation = insertBackgroundTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Validation failed", details: validation.error.issues });
    }
    const [task] = await db.insert(backgroundTasks).values(validation.data).returning();
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/mission/tasks/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
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
