import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { insertPortfolioEntrySchema, atroposScans } from "@shared/schema";
import { rateLimit } from "../security";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

const getToken = (req: Request): string | null => {
  const t = req.headers["x-session-token"];
  return typeof t === "string" ? t : null;
};

router.get("/api/portfolio", rateLimit(30, 60000), async (req: Request, res: Response) => {
  try {
    const sessionToken = getToken(req);
    if (!sessionToken) return res.status(401).json({ error: "No session token" });
    const entries = await storage.getPortfolioEntriesBySession(sessionToken);
    res.json({ success: true, entries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/portfolio/share/:shareId", rateLimit(60, 60000), async (req: Request, res: Response) => {
  try {
    const entry = await storage.getPortfolioEntryByShareId(req.params.shareId);
    if (!entry) return res.status(404).json({ error: "Portfolio entry not found" });
    if (entry.visibility === "private") {
      const sessionToken = getToken(req);
      if (sessionToken !== entry.sessionToken) {
        return res.status(403).json({ error: "This portfolio entry is private" });
      }
    }
    res.json({ success: true, entry });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/portfolio/public/:sessionToken", rateLimit(30, 60000), async (req: Request, res: Response) => {
  try {
    const entries = await storage.getPublicPortfolioEntries(req.params.sessionToken);
    res.json({ success: true, entries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/portfolio", rateLimit(10, 60000), async (req: Request, res: Response) => {
  try {
    const sessionToken = getToken(req);
    if (!sessionToken) return res.status(401).json({ error: "No session token" });

    const shareId = crypto.randomBytes(12).toString("base64url");
    const data = {
      ...req.body,
      sessionToken,
      shareId,
    };

    const parsed = insertPortfolioEntrySchema.safeParse(data);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid portfolio data", details: parsed.error.flatten() });
    }

    const entry = await storage.createPortfolioEntry(parsed.data);
    res.json({ success: true, entry });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/portfolio/:id", rateLimit(20, 60000), async (req: Request, res: Response) => {
  try {
    const sessionToken = getToken(req);
    if (!sessionToken) return res.status(401).json({ error: "No session token" });

    const id = parseInt(req.params.id);
    const existing = await storage.getPortfolioEntryById(id);
    if (!existing) return res.status(404).json({ error: "Entry not found" });
    if (existing.sessionToken !== sessionToken) return res.status(403).json({ error: "Not authorized" });

    const updated = await storage.updatePortfolioEntry(id, req.body);
    res.json({ success: true, entry: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/portfolio/:id", rateLimit(10, 60000), async (req: Request, res: Response) => {
  try {
    const sessionToken = getToken(req);
    if (!sessionToken) return res.status(401).json({ error: "No session token" });

    const id = parseInt(req.params.id);
    const existing = await storage.getPortfolioEntryById(id);
    if (!existing) return res.status(404).json({ error: "Entry not found" });
    if (existing.sessionToken !== sessionToken) return res.status(403).json({ error: "Not authorized" });

    await storage.deletePortfolioEntry(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/portfolio/sources", rateLimit(15, 60000), async (req: Request, res: Response) => {
  try {
    const sessionToken = getToken(req);
    if (!sessionToken) return res.status(401).json({ error: "No session token" });

    const [investigations, campaignRuns, scans, dossiers] = await Promise.all([
      storage.getInvestigationsBySession(sessionToken),
      storage.getCampaignRunsBySession(sessionToken),
      db.select().from(atroposScans)
        .where(eq(atroposScans.sessionToken, sessionToken))
        .orderBy(desc(atroposScans.startedAt))
        .catch(() => []),
      storage.getDossiersBySession(sessionToken).catch(() => [])
    ]);

    res.json({
      success: true,
      sources: { investigations, campaignRuns, scans, dossiers }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
