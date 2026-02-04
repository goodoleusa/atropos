import { Router, Request, Response } from "express";
import { db } from "../db";
import { 
  consentRecords, 
  dsarRequests, 
  gameSessions, 
  exportedReports,
  campaignRuns,
  commandLogs,
  dossiers,
  investigationContexts,
  interactionLogs,
  stateCapsules,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { rateLimit } from "../security";

const router = Router();

const consentTypes = ['model_training', 'research_use', 'email_contact', 'analytics'] as const;
type ConsentType = typeof consentTypes[number];

function anonymizeIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    parts[3] = '0';
    return parts.join('.');
  }
  return ip.replace(/:[\da-f]+$/i, ':0');
}

router.get("/preferences/:sessionToken", async (req: Request, res: Response) => {
  try {
    const sessionToken = req.params.sessionToken as string;
    
    const records = await db.select()
      .from(consentRecords)
      .where(eq(consentRecords.sessionToken, sessionToken))
      .orderBy(desc(consentRecords.updatedAt));
    
    const preferences: Record<ConsentType, boolean> = {
      model_training: false,
      research_use: false,
      email_contact: false,
      analytics: false,
    };
    
    const latestByType: Record<string, typeof records[0]> = {};
    for (const record of records) {
      if (!latestByType[record.consentType]) {
        latestByType[record.consentType] = record;
      }
    }
    
    for (const type of Object.keys(latestByType)) {
      const record = latestByType[type];
      if (type in preferences) {
        preferences[type as ConsentType] = record.granted && !record.revokedAt;
      }
    }
    
    res.json({
      sessionToken,
      preferences,
      lastUpdated: records[0]?.updatedAt || null,
      version: records[0]?.version || "1.0",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/preferences", rateLimit(20, 60000), async (req: Request, res: Response) => {
  try {
    const { sessionToken, preferences, source = 'settings' } = req.body;
    
    if (!sessionToken || !preferences) {
      return res.status(400).json({ error: "Missing sessionToken or preferences" });
    }
    
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || '';
    const userAgent = req.headers['user-agent'] || '';
    
    const results = [];
    const now = new Date();
    
    for (const type of consentTypes) {
      if (type in preferences) {
        const granted = Boolean(preferences[type]);
        
        const [existing] = await db.select()
          .from(consentRecords)
          .where(and(
            eq(consentRecords.sessionToken, sessionToken),
            eq(consentRecords.consentType, type)
          ))
          .orderBy(desc(consentRecords.updatedAt))
          .limit(1);
        
        if (existing && existing.granted === granted && !existing.revokedAt) {
          results.push(existing);
          continue;
        }
        
        const [record] = await db.insert(consentRecords)
          .values({
            sessionToken,
            consentType: type,
            granted,
            grantedAt: granted ? now : null,
            revokedAt: !granted && existing?.granted ? now : null,
            ipAddress: anonymizeIp(clientIp),
            userAgent: userAgent.substring(0, 500),
            version: "1.0",
            metadata: { source: source as 'banner' | 'settings' | 'api' },
          })
          .returning();
        
        results.push(record);
      }
    }
    
    res.json({
      success: true,
      updatedPreferences: results.length,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/revoke/:consentType", rateLimit(10, 60000), async (req: Request, res: Response) => {
  try {
    const { sessionToken } = req.body;
    const consentType = req.params.consentType as string;
    
    if (!sessionToken || !consentTypes.includes(consentType as ConsentType)) {
      return res.status(400).json({ error: "Invalid request" });
    }
    
    const now = new Date();
    const clientIp = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || '';
    
    const [record] = await db.insert(consentRecords)
      .values({
        sessionToken,
        consentType,
        granted: false,
        revokedAt: now,
        ipAddress: anonymizeIp(clientIp),
        userAgent: req.headers['user-agent']?.substring(0, 500) || '',
        version: "1.0",
        metadata: { source: 'api' },
      })
      .returning();
    
    res.json({
      success: true,
      consentType,
      revoked: true,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/dsar/request", rateLimit(3, 3600000), async (req: Request, res: Response) => {
  try {
    const { sessionToken, requestType, email } = req.body;
    
    const validTypes = ['access', 'erasure', 'portability', 'rectification', 'objection'];
    if (!sessionToken || !requestType || !validTypes.includes(requestType)) {
      return res.status(400).json({ error: "Invalid request type or missing session token" });
    }
    
    const [session] = await db.select()
      .from(gameSessions)
      .where(eq(gameSessions.sessionToken, sessionToken));
    
    if (!session) {
      return res.status(400).json({ error: "Invalid session token" });
    }
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    
    const [request] = await db.insert(dsarRequests)
      .values({
        requestId: nanoid(12),
        sessionToken,
        requestType,
        email: email || null,
        verificationStatus: 'pending',
        status: 'pending',
        dueDate,
      })
      .returning();
    
    res.json({
      success: true,
      requestId: request.requestId,
      requestType,
      status: 'pending',
      dueDate: dueDate.toISOString(),
      message: `Your ${requestType} request has been received. We will process it within 30 days.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/dsar/verify", rateLimit(5, 3600000), async (req: Request, res: Response) => {
  try {
    const { requestId, sessionToken, email } = req.body;
    
    if (!requestId) {
      return res.status(400).json({ error: "Request ID required" });
    }
    
    const [request] = await db.select()
      .from(dsarRequests)
      .where(eq(dsarRequests.requestId, requestId));
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    let verified = false;
    let method = '';
    
    if (sessionToken && request.sessionToken === sessionToken) {
      verified = true;
      method = 'session_token';
    } else if (email && request.email === email) {
      verified = true;
      method = 'email';
    }
    
    if (!verified) {
      return res.status(403).json({ error: "Verification failed" });
    }
    
    const [updated] = await db.update(dsarRequests)
      .set({
        verificationStatus: 'verified',
        verificationMethod: method,
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(dsarRequests.requestId, requestId))
      .returning();
    
    res.json({
      success: true,
      requestId,
      status: 'processing',
      message: 'Request verified and now being processed.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/dsar/status/:requestId", async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId as string;
    
    const [request] = await db.select()
      .from(dsarRequests)
      .where(eq(dsarRequests.requestId, requestId));
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    res.json({
      requestId: request.requestId,
      requestType: request.requestType,
      status: request.status,
      verificationStatus: request.verificationStatus,
      dueDate: request.dueDate,
      completedAt: request.completedAt,
      createdAt: request.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/dsar/execute/:requestId", rateLimit(2, 3600000), async (req: Request, res: Response) => {
  try {
    const requestId = req.params.requestId as string;
    const { sessionToken } = req.body;
    
    const [request] = await db.select()
      .from(dsarRequests)
      .where(eq(dsarRequests.requestId, requestId));
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    
    if (request.verificationStatus !== 'verified') {
      return res.status(403).json({ error: "Request must be verified first" });
    }
    
    if (sessionToken !== request.sessionToken) {
      return res.status(403).json({ error: "Session token mismatch" });
    }
    
    let responseData: any = {};
    
    switch (request.requestType) {
      case 'access':
      case 'portability': {
        const token = request.sessionToken;
        
        const [session] = await db.select()
          .from(gameSessions)
          .where(eq(gameSessions.sessionToken, token));
        
        const reports = await db.select()
          .from(exportedReports)
          .where(eq(exportedReports.sessionToken, token));
        
        const consents = await db.select()
          .from(consentRecords)
          .where(eq(consentRecords.sessionToken, token));
        
        const commands = await db.select()
          .from(commandLogs)
          .where(eq(commandLogs.sessionToken, token));
        
        const campaigns = await db.select()
          .from(campaignRuns)
          .where(eq(campaignRuns.sessionToken, token));
        
        const userDossiers = await db.select()
          .from(dossiers)
          .where(eq(dossiers.sessionToken, token));
        
        const investigations = await db.select()
          .from(investigationContexts)
          .where(eq(investigationContexts.sessionToken, token));
        
        const capsules = await db.select()
          .from(stateCapsules)
          .where(eq(stateCapsules.sessionToken, token));
        
        responseData = {
          dataExported: true,
          exportedData: {
            session: session ? {
              username: session.username,
              createdAt: session.createdAt,
              lastActive: session.lastActive,
              collectedClues: session.collectedClues,
              completedQuests: session.completedQuests,
              discoveries: session.discoveries,
              settings: session.settings,
            } : null,
            commandLogs: commands.map(c => ({
              command: c.command,
              timestamp: c.timestamp,
            })),
            campaignRuns: campaigns.map(c => ({
              campaignId: c.campaignId,
              status: c.status,
              nodeHistory: c.nodeHistory,
              startedAt: c.startedAt,
            })),
            dossiers: userDossiers.map(d => ({
              title: d.title,
              severity: d.severity,
              status: d.status,
              createdAt: d.createdAt,
            })),
            investigations: investigations.map(i => ({
              investigationId: i.investigationId,
              name: i.name,
              phase: i.phase,
              createdAt: i.createdAt,
            })),
            stateCapsules: capsules.map(c => ({
              capsuleType: c.capsuleType,
              createdAt: c.createdAt,
            })),
            exportedReports: reports.map(r => ({
              reportId: r.reportId,
              title: r.title,
              status: r.status,
              createdAt: r.createdAt,
            })),
            consentHistory: consents.map(c => ({
              consentType: c.consentType,
              granted: c.granted,
              grantedAt: c.grantedAt,
              revokedAt: c.revokedAt,
            })),
          },
        };
        break;
      }
      
      case 'erasure': {
        const token = request.sessionToken;
        let itemsDeleted = 0;
        
        const deletions = await Promise.all([
          db.delete(commandLogs).where(eq(commandLogs.sessionToken, token)),
          db.delete(campaignRuns).where(eq(campaignRuns.sessionToken, token)),
          db.delete(dossiers).where(eq(dossiers.sessionToken, token)),
          db.delete(investigationContexts).where(eq(investigationContexts.sessionToken, token)),
          db.delete(stateCapsules).where(eq(stateCapsules.sessionToken, token)),
          db.delete(exportedReports).where(eq(exportedReports.sessionToken, token)),
          db.delete(consentRecords).where(eq(consentRecords.sessionToken, token)),
        ]);
        
        await db.delete(gameSessions).where(eq(gameSessions.sessionToken, token));
        
        responseData = {
          dataDeleted: true,
          itemsAffected: deletions.length + 1,
          notes: 'All personal data associated with your session has been permanently deleted, including: game session, command history, campaign progress, dossiers, investigation contexts, state capsules, exported reports, and consent records.',
        };
        break;
      }
      
      case 'objection': {
        for (const type of consentTypes) {
          await db.insert(consentRecords)
            .values({
              sessionToken: request.sessionToken,
              consentType: type,
              granted: false,
              revokedAt: new Date(),
              version: "1.0",
              metadata: { source: 'api', legalBasis: 'objection' },
            });
        }
        
        responseData = {
          notes: 'Objection recorded. All optional data processing has been stopped.',
        };
        break;
      }
      
      default:
        responseData = { notes: 'Request type requires manual processing.' };
    }
    
    const [updated] = await db.update(dsarRequests)
      .set({
        status: 'completed',
        completedAt: new Date(),
        responseData,
        updatedAt: new Date(),
      })
      .where(eq(dsarRequests.requestId, requestId))
      .returning();
    
    res.json({
      success: true,
      requestId,
      status: 'completed',
      responseData,
      completedAt: updated.completedAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/audit/:sessionToken", async (req: Request, res: Response) => {
  try {
    const sessionToken = req.params.sessionToken as string;
    
    const records = await db.select()
      .from(consentRecords)
      .where(eq(consentRecords.sessionToken, sessionToken))
      .orderBy(desc(consentRecords.createdAt));
    
    const requests = await db.select()
      .from(dsarRequests)
      .where(eq(dsarRequests.sessionToken, sessionToken))
      .orderBy(desc(dsarRequests.createdAt));
    
    res.json({
      consentHistory: records.map(r => ({
        consentType: r.consentType,
        granted: r.granted,
        grantedAt: r.grantedAt,
        revokedAt: r.revokedAt,
        source: (r.metadata as any)?.source,
        version: r.version,
        timestamp: r.createdAt,
      })),
      dsarRequests: requests.map(r => ({
        requestId: r.requestId,
        requestType: r.requestType,
        status: r.status,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
