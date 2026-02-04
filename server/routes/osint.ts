import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { 
  executeOsintTool, 
  executeMultiToolQuery, 
  generateStateCapsule,
  initializeDefaultTools,
  logSessionInteraction
} from "../services/osint";
import { nanoid } from "nanoid";

const router = Router();

// Initialize default tools on startup
initializeDefaultTools().catch(console.error);

// ============ ADMIN: OSINT Tool Management ============

// Get all OSINT tools
router.get("/tools", async (req: Request, res: Response) => {
  try {
    const tools = await storage.getAllOsintTools();
    res.json(tools);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get active tools only
router.get("/tools/active", async (req: Request, res: Response) => {
  try {
    const tools = await storage.getActiveOsintTools();
    res.json(tools);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single tool
router.get("/tools/:key", async (req: Request, res: Response) => {
  try {
    const key = req.params.key as string as string;
    const tool = await storage.getOsintToolByKey(key);
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }
    res.json(tool);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/update tool
router.post("/tools", async (req: Request, res: Response) => {
  try {
    const { key, ...data } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Tool key is required" });
    }
    const tool = await storage.upsertOsintTool(key, data);
    res.json(tool);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete tool
router.delete("/tools/:key", async (req: Request, res: Response) => {
  try {
    await storage.deleteOsintTool(req.params.key as string);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle tool active status
router.patch("/tools/:key/toggle", async (req: Request, res: Response) => {
  try {
    const tool = await storage.getOsintToolByKey(req.params.key as string);
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }
    const updated = await storage.upsertOsintTool(req.params.key as string, {
      isActive: !tool.isActive
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ OSINT Execution ============

// Execute single tool
router.post("/execute", async (req: Request, res: Response) => {
  try {
    const { toolKey, target, targetType, sessionToken, investigationId, source } = req.body;
    
    if (!toolKey || !target || !targetType) {
      return res.status(400).json({ error: "toolKey, target, and targetType are required" });
    }
    
    const result = await executeOsintTool({
      toolKey,
      target,
      targetType,
      sessionToken,
      investigationId,
      source
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Execute multiple tools
router.post("/execute/multi", async (req: Request, res: Response) => {
  try {
    const { target, targetType, toolKeys, sessionToken, investigationId, source } = req.body;
    
    if (!target || !targetType) {
      return res.status(400).json({ error: "target and targetType are required" });
    }
    
    const result = await executeMultiToolQuery({
      target,
      targetType,
      toolKeys,
      sessionToken,
      investigationId,
      source
    });
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Investigation Management ============

// Create new investigation
router.post("/investigations", async (req: Request, res: Response) => {
  try {
    const { sessionToken, name, targetType, targetValue, learningProfile } = req.body;
    
    if (!sessionToken || !name || !targetType || !targetValue) {
      return res.status(400).json({ error: "sessionToken, name, targetType, and targetValue are required" });
    }
    
    const investigation = await storage.createInvestigation({
      sessionToken,
      investigationId: `inv_${nanoid(12)}`,
      name,
      targetType,
      targetValue,
      learningProfile
    });
    
    // Log session interaction
    await logSessionInteraction({
      sessionToken,
      investigationId: investigation.investigationId,
      actionType: 'campaign_action',
      source: 'game',
      input: { action: 'create_investigation', name, targetType, targetValue }
    });
    
    res.json(investigation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get investigation by ID
router.get("/investigations/:id", async (req: Request, res: Response) => {
  try {
    const investigation = await storage.getInvestigationById(req.params.id as string);
    if (!investigation) {
      return res.status(404).json({ error: "Investigation not found" });
    }
    res.json(investigation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get investigations by session
router.get("/investigations/session/:sessionToken", async (req: Request, res: Response) => {
  try {
    const investigations = await storage.getInvestigationsBySession(req.params.sessionToken as string);
    res.json(investigations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get active investigation for session
router.get("/investigations/active/:sessionToken", async (req: Request, res: Response) => {
  try {
    const investigation = await storage.getActiveInvestigation(req.params.sessionToken as string);
    res.json(investigation || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update investigation
router.patch("/investigations/:id", async (req: Request, res: Response) => {
  try {
    const updated = await storage.updateInvestigation(req.params.id as string, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Investigation not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add finding to investigation
router.post("/investigations/:id/findings", async (req: Request, res: Response) => {
  try {
    const { toolKey, category, severity, title, data, sessionToken } = req.body;
    
    const investigation = await storage.getInvestigationById(req.params.id as string);
    if (!investigation) {
      return res.status(404).json({ error: "Investigation not found" });
    }
    
    const finding = {
      id: `finding_${nanoid(8)}`,
      toolKey,
      category,
      severity: severity || 'info',
      title,
      data,
      timestamp: new Date().toISOString()
    };
    
    const updatedFindings = [...(investigation.findings || []), finding];
    const updated = await storage.updateInvestigation(req.params.id as string, {
      findings: updatedFindings
    });
    
    // Log interaction
    if (sessionToken) {
      await logSessionInteraction({
        sessionToken,
        investigationId: req.params.id as string,
        actionType: 'campaign_action',
        source: 'game',
        input: { action: 'add_finding', finding }
      });
    }
    
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ State Capsules ============

// Generate state capsule
router.post("/capsules/generate", async (req: Request, res: Response) => {
  try {
    const { sessionToken, investigationId, capsuleType } = req.body;
    
    if (!sessionToken) {
      return res.status(400).json({ error: "sessionToken is required" });
    }
    
    const capsule = await generateStateCapsule({
      sessionToken,
      investigationId,
      capsuleType
    });
    
    res.json({ content: capsule });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get capsules for session
router.get("/capsules/:sessionToken", async (req: Request, res: Response) => {
  try {
    const capsules = await storage.getStateCapsulesBySession(req.params.sessionToken as string);
    res.json(capsules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get latest capsule
router.get("/capsules/:sessionToken/latest", async (req: Request, res: Response) => {
  try {
    const { investigationId } = req.query;
    const capsule = await storage.getLatestCapsule(
      req.params.sessionToken as string, 
      investigationId as string | undefined
    );
    res.json(capsule || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Interaction Logging ============

// Log interaction
router.post("/interactions", async (req: Request, res: Response) => {
  try {
    await logSessionInteraction(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get interactions for session
router.get("/interactions/:sessionToken", async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const interactions = await storage.getInteractionsBySession(
      req.params.sessionToken as string,
      limit ? parseInt(limit as string) : undefined
    );
    res.json(interactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN: Evaluation & Analytics ============

// Get interactions for evaluation (admin)
router.get("/admin/interactions", async (req: Request, res: Response) => {
  try {
    const { source, actionType, adminFlag } = req.query;
    const interactions = await storage.getInteractionsForEvaluation({
      source: source as string,
      actionType: actionType as string,
      adminFlag: adminFlag as string
    });
    res.json(interactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Flag interaction for training
router.post("/admin/interactions/:id/flag", async (req: Request, res: Response) => {
  try {
    const { flag } = req.body;
    if (!['good', 'bad', 'review'].includes(flag)) {
      return res.status(400).json({ error: "Flag must be 'good', 'bad', or 'review'" });
    }
    
    const updated = await storage.flagInteraction(parseInt(req.params.id as string), flag);
    if (!updated) {
      return res.status(404).json({ error: "Interaction not found" });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Detect abuse clusters
router.get("/admin/abuse-detection", async (req: Request, res: Response) => {
  try {
    const { timeWindowMinutes, threshold } = req.query;
    const clusters = await storage.detectAbuseCluster(
      timeWindowMinutes ? parseInt(timeWindowMinutes as string) : undefined,
      threshold ? parseInt(threshold as string) : undefined
    );
    res.json(clusters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get tool call history (admin)
router.get("/admin/tool-calls", async (req: Request, res: Response) => {
  try {
    const { sessionToken, investigationId, limit } = req.query;
    
    if (investigationId) {
      const calls = await storage.getToolCallsByInvestigation(investigationId as string);
      return res.json(calls);
    }
    
    if (sessionToken) {
      const calls = await storage.getToolCallsBySession(
        sessionToken as string,
        limit ? parseInt(limit as string) : undefined
      );
      return res.json(calls);
    }
    
    res.status(400).json({ error: "sessionToken or investigationId required" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
