import { Router, Request, Response } from "express";
import { atroposService, type AtroposScanParams } from "../services/atropos";
import { storage } from "../storage";
import { logSessionInteraction } from "../services/osint";

const router = Router();

// ============ Health Check ============

router.get("/health", async (req: Request, res: Response) => {
  try {
    const binaryCheck = await atroposService.checkBinary();
    res.json({
      status: binaryCheck.available ? "ok" : "error",
      binary: {
        available: binaryCheck.available,
        path: binaryCheck.path,
        error: binaryCheck.error
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Scripts Management ============

// List available scripts
router.get("/scripts", async (req: Request, res: Response) => {
  try {
    const scripts = await atroposService.listScripts();
    res.json(scripts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get script content
router.get("/scripts/:scriptId", async (req: Request, res: Response) => {
  try {
    const scriptId = req.params.scriptId as string;
    const result = await atroposService.getScript(scriptId);
    
    if ('error' in result) {
      return res.status(404).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Scan Execution ============

// Execute scan
router.post("/scan", async (req: Request, res: Response) => {
  try {
    const { scriptPath, target, outputPath, sessionToken, investigationId, source } = req.body;
    
    if (!scriptPath || !target) {
      return res.status(400).json({ 
        error: "scriptPath and target are required" 
      });
    }
    
    const params: AtroposScanParams = {
      scriptPath,
      target,
      outputPath,
      sessionToken,
      investigationId,
      source: source || 'manual'
    };
    
    // Log interaction if session provided
    if (sessionToken) {
      await logSessionInteraction({
        sessionToken,
        investigationId,
        actionType: 'tool_call',
        source: source === 'terminal' ? 'terminal' : 
                source === 'chat' ? 'agent_chat' : 
                source === 'campaign' ? 'campaign' : 'ai_lab',
        input: { toolKey: 'atropos', scriptPath, target },
        metadata: { scanType: 'atropos' }
      });
    }
    
    const result = await atroposService.executeScript(params);
    
    // Update investigation with findings if successful
    if (result.success && investigationId && result.data) {
      try {
        const investigation = await storage.getInvestigationById(investigationId);
        if (investigation) {
          // Extract findings from scan results
          const findings = extractFindingsFromScan(result.data, scriptPath);
          
          if (findings.length > 0) {
            const updatedFindings = [...(investigation.findings || []), ...findings];
            const toolsUsedSet = new Set([...(investigation.toolsUsed || []), 'atropos']);
            await storage.updateInvestigation(investigationId, {
              findings: updatedFindings,
              toolsUsed: Array.from(toolsUsedSet)
            });
          }
        }
      } catch (investigationError) {
        console.error('[Atropos] Failed to update investigation:', investigationError);
        // Don't fail the request if investigation update fails
      }
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Scan History ============

// Get scan history for session
router.get("/scans/:sessionToken", async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const toolCalls = await storage.getToolCallsBySession(
      req.params.sessionToken as string,
      limit ? parseInt(limit as string) : undefined
    );
    
    // Filter to only atropos scans
    const atroposScans = toolCalls.filter(tc => tc.toolKey === 'atropos');
    
    res.json(atroposScans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get scan by investigation
router.get("/scans/investigation/:investigationId", async (req: Request, res: Response) => {
  try {
    const toolCalls = await storage.getToolCallsByInvestigation(req.params.investigationId as string);
    const atroposScans = toolCalls.filter(tc => tc.toolKey === 'atropos');
    res.json(atroposScans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Helper Functions ============

/**
 * Extract findings from Atropos scan results
 */
function extractFindingsFromScan(data: any, scriptPath: string): Array<{
  id: string;
  toolKey: string;
  category: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  data: any;
  timestamp: string;
}> {
  const findings: Array<{
    id: string;
    toolKey: string;
    category: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    title: string;
    data: any;
    timestamp: string;
  }> = [];
  
  // Determine category from script path
  let category = 'general';
  if (scriptPath.includes('osint') || scriptPath.includes('bbot') || scriptPath.includes('amass')) {
    category = 'osint';
  } else if (scriptPath.includes('vuln') || scriptPath.includes('sqli') || scriptPath.includes('xss') || scriptPath.includes('nuclei')) {
    category = 'vulnerability';
  } else if (scriptPath.includes('secret')) {
    category = 'secret_detection';
  }
  
  // Try to extract structured findings from data
  if (Array.isArray(data)) {
    data.forEach((item: any, index: number) => {
      findings.push({
        id: `finding_${Date.now()}_${index}`,
        toolKey: 'atropos',
        category,
        severity: item.severity || 'info',
        title: item.title || item.name || `Finding ${index + 1}`,
        data: item,
        timestamp: new Date().toISOString()
      });
    });
  } else if (data && typeof data === 'object') {
    // Single finding or structured result
    findings.push({
      id: `finding_${Date.now()}`,
      toolKey: 'atropos',
      category,
      severity: data.severity || 'info',
      title: data.title || data.name || 'Atropos Scan Result',
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  return findings;
}

export default router;
