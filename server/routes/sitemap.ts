import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertSitemapEntrySchema } from "@shared/schema";

const router = Router();

const BUILTIN_SITEMAP = [
  { name: "Home", path: "/", icon: "Globe", description: "Landing page with platform overview and quick links", category: "Core Platform", color: "amber", sortOrder: 0 },
  { name: "Profile & Portfolio", path: "/profile", icon: "Users", description: "Player stats, achievements, XP, skill trees, and shareable portfolio", category: "Core Platform", color: "amber", sortOrder: 1 },
  { name: "Portfolio Share", path: "/portfolio/:shareId", icon: "ExternalLink", description: "Public shareable portfolio entry pages with embed support", category: "Core Platform", color: "amber", sortOrder: 2 },
  { name: "Leaderboards", path: "/leaderboards", icon: "Trophy", description: "Global rankings, XP competition, and player comparisons", category: "Core Platform", color: "amber", sortOrder: 3 },
  { name: "Mission Briefing", path: "/mission", icon: "Target", description: "Onboarding and mission-critical philosophy", category: "Core Platform", color: "amber", sortOrder: 4 },
  { name: "Terminal", path: "/terminal", icon: "Terminal", description: "Interactive command terminal with secret discovery", category: "Core Platform", color: "amber", sortOrder: 5 },

  { name: "Investigation Hub", path: "/investigate", icon: "Bot", description: "All-in-one workspace with agent, scanner, SpiderFoot, AI Lab", category: "Investigation Hub", color: "teal", sortOrder: 10 },
  { name: "NEXUS Agents", path: "/agents", icon: "Bot", description: "Multi-agent orchestration with 6 specialized security agents", category: "Investigation Hub", color: "teal", sortOrder: 11 },
  { name: "Scanner Dashboard", path: "/scanner", icon: "ShieldAlert", description: "Atropos OSINT & vulnerability scanner with Lua scripts", category: "Investigation Hub", color: "teal", sortOrder: 12 },
  { name: "AI Lab", path: "/ai-lab", icon: "Beaker", description: "Model battleground, prompt testing, cost tracking", category: "Investigation Hub", color: "teal", sortOrder: 13 },
  { name: "Prompt Builder", path: "/prompt-builder", icon: "Brain", description: "Agent prompt engineering & module configuration", category: "Investigation Hub", color: "teal", sortOrder: 14 },

  { name: "Campaigns Hub", path: "/campaigns", icon: "Rocket", description: "Browse and launch 23 investigation campaigns", category: "Campaigns & Learning", color: "purple", sortOrder: 20 },
  { name: "Campaign Player", path: "/play/:campaignId", icon: "Play", description: "Interactive campaign runner with node navigation", category: "Campaigns & Learning", color: "purple", sortOrder: 21 },
  { name: "Campaign Builder", path: "/builder", icon: "Layers", description: "Twine-inspired visual campaign editor with flow design", category: "Campaigns & Learning", color: "purple", sortOrder: 22 },
  { name: "Report Builder", path: "/report", icon: "FileText", description: "Structure findings, export dossiers, track vulnerabilities", category: "Campaigns & Learning", color: "purple", sortOrder: 23 },
  { name: "Wiki", path: "/wiki", icon: "BookOpen", description: "Knowledge base with linked articles and research", category: "Campaigns & Learning", color: "purple", sortOrder: 24 },

  { name: "AI Gallery", path: "/videos", icon: "Play", description: "AI-generated content gallery and training videos", category: "Media & Content", color: "orange", sortOrder: 30 },
  { name: "The Void", path: "/void", icon: "Eye", description: "Hidden experimental area with chaos effects", category: "Media & Content", color: "orange", sortOrder: 31 },
  { name: "Archive", path: "/archive", icon: "Database", description: "Historical data and archived content", category: "Media & Content", color: "orange", sortOrder: 32 },

  { name: "Admin Dashboard", path: "/admin", icon: "Settings", description: "Full admin panel with all platform controls", category: "Administration", color: "red", sortOrder: 40 },
  { name: "Debug Console", path: "/debug", icon: "Bug", description: "System diagnostics and debugging tools", category: "Administration", color: "red", sortOrder: 41 },
  { name: "Business HQ", path: "/business", icon: "Activity", description: "Business metrics, analytics, and strategy", category: "Administration", color: "red", sortOrder: 42 },
  { name: "Investor Dashboard", path: "/investors", icon: "ExternalLink", description: "Investor-facing metrics and reports", category: "Administration", color: "red", sortOrder: 43 },
];

router.get("/api/sitemap", async (_req: Request, res: Response) => {
  try {
    let entries = await storage.getAllSitemapEntries();
    if (entries.length === 0) {
      const seeded = await storage.bulkUpsertSitemapEntries(
        BUILTIN_SITEMAP.map(e => ({ ...e, isCustom: false, isPublished: true, pageLayout: "card" }))
      );
      entries = seeded;
    }
    res.json({ success: true, entries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/sitemap", async (req: Request, res: Response) => {
  try {
    const parsed = insertSitemapEntrySchema.parse(req.body);
    const entry = await storage.createSitemapEntry(parsed);
    res.json({ success: true, entry });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/api/sitemap/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const entry = await storage.updateSitemapEntry(id, req.body);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json({ success: true, entry });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/sitemap/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const deleted = await storage.deleteSitemapEntry(id);
    if (!deleted) return res.status(404).json({ error: "Entry not found" });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/sitemap/sync", async (_req: Request, res: Response) => {
  try {
    const synced = await storage.bulkUpsertSitemapEntries(
      BUILTIN_SITEMAP.map(e => ({ ...e, isCustom: false, isPublished: true, pageLayout: "card" }))
    );
    res.json({ success: true, synced: synced.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
