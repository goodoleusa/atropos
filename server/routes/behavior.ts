import { Router, Request, Response } from "express";
import { db } from "../db";
import { 
  userAnalyses, 
  userFeedback, 
  improvementQueue 
} from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { 
  analyzeUserBehavior, 
  getLatestAnalysis, 
  getAllAnalyses,
  getMarketingSegments,
  runPeriodicAnalysis
} from "../services/behaviorAnalysis";

const router = Router();

// ============ User Feedback ============

// Submit feedback
router.post("/feedback", async (req: Request, res: Response) => {
  try {
    const feedback = req.body;
    if (!feedback.sessionToken || !feedback.feedbackType) {
      return res.status(400).json({ error: "sessionToken and feedbackType required" });
    }
    
    const [created] = await db.insert(userFeedback).values(feedback).returning();
    res.json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get feedback for session
router.get("/feedback/:sessionToken", async (req: Request, res: Response) => {
  try {
    const items = await db.select()
      .from(userFeedback)
      .where(eq(userFeedback.sessionToken, req.params.sessionToken as string))
      .orderBy(desc(userFeedback.createdAt));
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ User Analysis ============

// Trigger analysis for a session
router.post("/analyze/:sessionToken", async (req: Request, res: Response) => {
  try {
    const { force, analysisType } = req.body;
    const result = await analyzeUserBehavior(
      req.params.sessionToken as string,
      { force, analysisType }
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get latest analysis for session
router.get("/analysis/:sessionToken", async (req: Request, res: Response) => {
  try {
    const analysis = await getLatestAnalysis(req.params.sessionToken as string);
    res.json(analysis || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all analyses for session
router.get("/analyses/:sessionToken", async (req: Request, res: Response) => {
  try {
    const analyses = await db.select()
      .from(userAnalyses)
      .where(eq(userAnalyses.sessionToken, req.params.sessionToken as string))
      .orderBy(desc(userAnalyses.analyzedAt));
    res.json(analyses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Admin: All Analyses ============

// Get all analyses (admin)
router.get("/admin/analyses", async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const analyses = await getAllAnalyses(limit ? parseInt(limit as string) : 50);
    res.json(analyses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get marketing segments
router.get("/admin/segments", async (req: Request, res: Response) => {
  try {
    const segments = await getMarketingSegments();
    res.json(segments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Run periodic analysis batch
router.post("/admin/run-periodic", async (req: Request, res: Response) => {
  try {
    const results = await runPeriodicAnalysis();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get high-risk users
router.get("/admin/high-risk", async (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 50;
    const analyses = await db.select()
      .from(userAnalyses)
      .where(sql`(${userAnalyses.riskAssessment}->>'maliciousLikelihood')::int >= ${threshold}`)
      .orderBy(desc(userAnalyses.analyzedAt))
      .limit(50);
    res.json(analyses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get users at churn risk
router.get("/admin/churn-risk", async (req: Request, res: Response) => {
  try {
    const analyses = await db.select()
      .from(userAnalyses)
      .where(sql`(${userAnalyses.engagementMetrics}->>'overallEngagement')::int < 30`)
      .orderBy(desc(userAnalyses.analyzedAt))
      .limit(50);
    res.json(analyses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Admin: Feedback Management ============

// Get all feedback (admin)
router.get("/admin/feedback", async (req: Request, res: Response) => {
  try {
    const { status, feedbackType, limit } = req.query;
    
    let query = db.select().from(userFeedback);
    const conditions = [];
    
    if (status) {
      conditions.push(eq(userFeedback.status, status as string));
    }
    if (feedbackType) {
      conditions.push(eq(userFeedback.feedbackType, feedbackType as string));
    }
    
    if (conditions.length > 0) {
      const feedback = await db.select()
        .from(userFeedback)
        .where(and(...conditions))
        .orderBy(desc(userFeedback.createdAt))
        .limit(parseInt(limit as string) || 100);
      return res.json(feedback);
    }
    
    const feedback = await db.select()
      .from(userFeedback)
      .orderBy(desc(userFeedback.createdAt))
      .limit(parseInt(limit as string) || 100);
    res.json(feedback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update feedback status (admin)
router.patch("/admin/feedback/:id", async (req: Request, res: Response) => {
  try {
    const { status, adminNotes, actionTaken, priority } = req.body;
    const [updated] = await db.update(userFeedback)
      .set({ 
        status, 
        adminNotes, 
        actionTaken, 
        priority,
        reviewedAt: status === 'reviewed' || status === 'actioned' ? new Date() : undefined
      })
      .where(eq(userFeedback.id, parseInt(req.params.id as string)))
      .returning();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Admin: Improvement Queue ============

// Get improvement queue
router.get("/admin/improvements", async (req: Request, res: Response) => {
  try {
    const { status, category } = req.query;
    
    const conditions = [];
    if (status) {
      conditions.push(eq(improvementQueue.status, status as string));
    }
    if (category) {
      conditions.push(eq(improvementQueue.category, category as string));
    }
    
    if (conditions.length > 0) {
      const items = await db.select()
        .from(improvementQueue)
        .where(and(...conditions))
        .orderBy(desc(improvementQueue.priority), desc(improvementQueue.createdAt));
      return res.json(items);
    }
    
    const items = await db.select()
      .from(improvementQueue)
      .orderBy(desc(improvementQueue.priority), desc(improvementQueue.createdAt));
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create improvement item
router.post("/admin/improvements", async (req: Request, res: Response) => {
  try {
    const [created] = await db.insert(improvementQueue).values(req.body).returning();
    res.json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update improvement item
router.patch("/admin/improvements/:id", async (req: Request, res: Response) => {
  try {
    const [updated] = await db.update(improvementQueue)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(improvementQueue.id, parseInt(req.params.id as string)))
      .returning();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete improvement item
router.delete("/admin/improvements/:id", async (req: Request, res: Response) => {
  try {
    await db.delete(improvementQueue)
      .where(eq(improvementQueue.id, parseInt(req.params.id as string)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Dashboard Stats ============

// Get behavior dashboard stats
router.get("/admin/stats", async (req: Request, res: Response) => {
  try {
    const [analysisCount] = await db.select({ count: sql`count(*)` }).from(userAnalyses);
    const [feedbackCount] = await db.select({ count: sql`count(*)` }).from(userFeedback);
    const [improvementCount] = await db.select({ count: sql`count(*)` }).from(improvementQueue);
    
    const [newFeedback] = await db.select({ count: sql`count(*)` })
      .from(userFeedback)
      .where(eq(userFeedback.status, 'new'));
    
    const [highRisk] = await db.select({ count: sql`count(*)` })
      .from(userAnalyses)
      .where(sql`(${userAnalyses.riskAssessment}->>'maliciousLikelihood')::int >= 50`);
    
    const [pendingImprovements] = await db.select({ count: sql`count(*)` })
      .from(improvementQueue)
      .where(eq(improvementQueue.status, 'proposed'));

    res.json({
      totalAnalyses: analysisCount?.count || 0,
      totalFeedback: feedbackCount?.count || 0,
      totalImprovements: improvementCount?.count || 0,
      newFeedback: newFeedback?.count || 0,
      highRiskUsers: highRisk?.count || 0,
      pendingImprovements: pendingImprovements?.count || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
