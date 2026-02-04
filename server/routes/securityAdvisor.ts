import { Router, Request, Response } from "express";
import { securityAdvisor } from "../services/securityAdvisor";
import { db } from "../db";
import { exportedReports } from "@shared/schema";
import { eq, desc, and, gte, sql, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { rateLimit } from "../security";

const router = Router();

router.get("/dashboard/:sessionToken", rateLimit(30, 60000), async (req: Request, res: Response) => {
  try {
    const sessionToken = req.params.sessionToken as string;
    const dashboard = await securityAdvisor.getSecurityDashboard(sessionToken);
    res.json(dashboard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/recommendations/:sessionToken", rateLimit(30, 60000), async (req: Request, res: Response) => {
  try {
    const sessionToken = req.params.sessionToken as string;
    const recommendations = await securityAdvisor.getRecommendations(sessionToken);
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/context/:sessionToken", async (req: Request, res: Response) => {
  try {
    const sessionToken = req.params.sessionToken as string;
    const context = await securityAdvisor.analyzeUserContext(sessionToken);
    res.json(context);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/cve", async (req: Request, res: Response) => {
  try {
    const cveAlerts = await securityAdvisor.getCVERecommendations([]);
    res.json(cveAlerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/ioc/:sessionToken", async (req: Request, res: Response) => {
  try {
    const sessionToken = req.params.sessionToken as string;
    const iocs = await securityAdvisor.getIOCUpdates(sessionToken);
    res.json(iocs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/scan/:sessionToken", rateLimit(10, 60000), async (req: Request, res: Response) => {
  try {
    const { recommendationId, target } = req.body;
    if (!recommendationId || !target) {
      return res.status(400).json({ error: "recommendationId and target required" });
    }
    
    const sessionToken = req.params.sessionToken as string;
    const result = await securityAdvisor.runRecommendedScan(
      sessionToken,
      recommendationId,
      target
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/reports", rateLimit(20, 60000), async (req: Request, res: Response) => {
  try {
    const { sessionToken, investigationId, title, reportType, summary, content, metadata, retentionPriority } = req.body;
    
    if (!sessionToken || !title || !content) {
      return res.status(400).json({ error: "sessionToken, title, and content required" });
    }
    
    const reportId = `rpt_${nanoid(12)}`;
    
    const [report] = await db.insert(exportedReports).values({
      reportId,
      sessionToken,
      investigationId,
      title,
      reportType: reportType || 'investigation',
      summary,
      content,
      metadata: metadata || {},
      retentionPriority: retentionPriority || 'normal',
      status: 'submitted'
    }).returning();
    
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/reports/:sessionToken", async (req: Request, res: Response) => {
  try {
    const sessionToken = req.params.sessionToken as string;
    const { limit } = req.query;
    const reports = await db.select()
      .from(exportedReports)
      .where(eq(exportedReports.sessionToken, sessionToken))
      .orderBy(desc(exportedReports.createdAt))
      .limit(limit ? parseInt(limit as string) : 50);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/reports/id/:reportId", async (req: Request, res: Response) => {
  try {
    const reportId = req.params.reportId as string;
    const [report] = await db.select()
      .from(exportedReports)
      .where(eq(exportedReports.reportId, reportId));
    
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/reports/:reportId", async (req: Request, res: Response) => {
  try {
    const { status, retentionPriority, reviewedBy } = req.body;
    
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (retentionPriority) updates.retentionPriority = retentionPriority;
    if (reviewedBy) {
      updates.reviewedBy = reviewedBy;
      updates.reviewedAt = new Date();
    }
    
    const reportId = req.params.reportId as string;
    const [report] = await db.update(exportedReports)
      .set(updates)
      .where(eq(exportedReports.reportId, reportId))
      .returning();
    
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/admin/reports", async (req: Request, res: Response) => {
  try {
    const { status, priority, limit } = req.query;
    
    let query = db.select().from(exportedReports);
    
    const conditions = [];
    if (status) conditions.push(eq(exportedReports.status, status as string));
    if (priority) conditions.push(eq(exportedReports.retentionPriority, priority as string));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const reports = await query
      .orderBy(desc(exportedReports.createdAt))
      .limit(limit ? parseInt(limit as string) : 100);
    
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/admin/reports/stats", async (req: Request, res: Response) => {
  try {
    const allReports = await db.select().from(exportedReports);
    const stats = {
      total: allReports.length,
      submitted: allReports.filter(r => r.status === 'submitted').length,
      reviewed: allReports.filter(r => r.status === 'reviewed').length,
      critical: allReports.filter(r => r.retentionPriority === 'critical').length,
      high: allReports.filter(r => r.retentionPriority === 'high').length
    };
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
