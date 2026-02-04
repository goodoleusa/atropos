import { db } from "./db";
import { 
  gameSessions, 
  campaignRuns,
  clues, 
  quests, 
  commandLogs,
  behavioralProfiles,
  adminPrompts,
  promptGallery,
  campaignTemplates,
  flowNodes,
  designerCampaigns,
  sharedClues,
  artifacts,
  mysticalCards,
  quantumEvents,
  quantumMessages,
  campaignLinks,
  learningPaths,
  osintTools,
  osintToolCalls,
  investigationContexts,
  interactionLogs,
  stateCapsules,
  type GameSession, 
  type InsertGameSession,
  type CampaignRun,
  type InsertCampaignRun,
  type Clue,
  type InsertClue,
  type Quest,
  type InsertQuest,
  type CommandLog,
  type InsertCommandLog,
  type BehavioralProfile,
  type InsertBehavioralProfile,
  type AdminPrompt,
  type InsertAdminPrompt,
  type PromptGalleryEntry,
  type InsertPromptGallery,
  type CampaignTemplate,
  type InsertCampaignTemplate,
  type FlowNode,
  type InsertFlowNode,
  type DesignerCampaign,
  type InsertDesignerCampaign,
  type SharedClue,
  type InsertSharedClue,
  type Artifact,
  type InsertArtifact,
  type MysticalCard,
  type InsertMysticalCard,
  type QuantumEvent,
  type InsertQuantumEvent,
  type QuantumMessage,
  type InsertQuantumMessage,
  type CampaignLink,
  type InsertCampaignLink,
  type LearningPath,
  type InsertLearningPath,
  type OsintTool,
  type InsertOsintTool,
  type OsintToolCall,
  type InsertOsintToolCall,
  type InvestigationContext,
  type InsertInvestigationContext,
  type InteractionLog,
  type InsertInteractionLog,
  type StateCapsule,
  type InsertStateCapsule
} from "@shared/schema";
import { eq, desc, sql, count, gte, and, between, or } from "drizzle-orm";

export interface IStorage {
  // Game Sessions
  getSessionByToken(token: string): Promise<GameSession | undefined>;
  getAllSessions(): Promise<GameSession[]>;
  createSession(session: InsertGameSession): Promise<GameSession>;
  updateSession(token: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;

  // Campaign Runs
  createCampaignRun(run: InsertCampaignRun): Promise<CampaignRun>;
  getCampaignRunById(runId: string): Promise<CampaignRun | undefined>;
  getCampaignRunsBySession(sessionToken: string): Promise<CampaignRun[]>;
  getActiveCampaignRun(sessionToken: string, campaignId?: string): Promise<CampaignRun | undefined>;
  updateCampaignRun(runId: string, updates: Partial<CampaignRun>): Promise<CampaignRun | undefined>;
  
  // Clues
  getAllClues(): Promise<Clue[]>;
  getClueById(id: string): Promise<Clue | undefined>;
  createClue(clue: InsertClue): Promise<Clue>;
  updateClue(id: string, updates: Partial<Clue>): Promise<Clue | undefined>;
  deleteClue(id: string): Promise<boolean>;
  
  // Quests
  getAllQuests(): Promise<Quest[]>;
  getQuestById(id: string): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: string, updates: Partial<Quest>): Promise<Quest | undefined>;
  deleteQuest(id: string): Promise<boolean>;
  
  // Command Logs
  logCommand(log: InsertCommandLog): Promise<CommandLog>;
  getCommandHistory(sessionToken: string, limit?: number): Promise<CommandLog[]>;
  
  // Behavioral Profiles
  logBehavior(profile: InsertBehavioralProfile): Promise<BehavioralProfile>;
  getBehaviorsBySession(sessionToken: string): Promise<BehavioralProfile[]>;
  getBehavioralTrends(days?: number): Promise<any>;
  getAllBehaviors(limit?: number): Promise<BehavioralProfile[]>;
  
  // Admin Prompts
  getAdminPromptByKey(key: string): Promise<AdminPrompt | undefined>;
  getAllAdminPrompts(): Promise<AdminPrompt[]>;
  upsertAdminPrompt(key: string, data: Partial<InsertAdminPrompt>): Promise<AdminPrompt>;

  // Prompt Gallery
  getPromptGallery(status?: string): Promise<PromptGalleryEntry[]>;
  getPromptGalleryBySession(sessionToken: string): Promise<PromptGalleryEntry[]>;
  createPromptGalleryEntry(entry: InsertPromptGallery): Promise<PromptGalleryEntry>;
  
  // Campaign Templates
  getCampaignByKey(key: string): Promise<CampaignTemplate | undefined>;
  getAllCampaigns(): Promise<CampaignTemplate[]>;
  createCampaign(campaign: InsertCampaignTemplate): Promise<CampaignTemplate>;
  updateCampaign(key: string, updates: Partial<CampaignTemplate>): Promise<CampaignTemplate | undefined>;
  deleteCampaign(key: string): Promise<boolean>;
  
  // Flow Nodes
  getFlowNodesByKey(key: string): Promise<FlowNode[]>;
  getAllFlowNodes(): Promise<FlowNode[]>;
  upsertFlowNode(nodeId: string, data: Partial<InsertFlowNode>): Promise<FlowNode>;
  deleteFlowNode(nodeId: string): Promise<boolean>;
  
  // Designer Campaigns
  getAllDesignerCampaigns(): Promise<DesignerCampaign[]>;
  getDesignerCampaignById(campaignId: string): Promise<DesignerCampaign | undefined>;
  upsertDesignerCampaign(campaignId: string, data: Partial<InsertDesignerCampaign>): Promise<DesignerCampaign>;
  deleteDesignerCampaign(campaignId: string): Promise<boolean>;
  
  // Shared Clues
  getAllSharedClues(): Promise<SharedClue[]>;
  getSharedClueById(clueId: string): Promise<SharedClue | undefined>;
  upsertSharedClue(clueId: string, data: Partial<InsertSharedClue>): Promise<SharedClue>;
  deleteSharedClue(clueId: string): Promise<boolean>;

  // Artifacts
  getAllArtifacts(): Promise<Artifact[]>;
  getArtifactById(id: string): Promise<Artifact | undefined>;
  createArtifact(artifact: InsertArtifact): Promise<Artifact>;
  updateArtifact(id: string, updates: Partial<Artifact>): Promise<Artifact | undefined>;
  deleteArtifact(id: string): Promise<boolean>;

  // Mystical Cards
  getMysticalCards(): Promise<MysticalCard[]>;
  upsertMysticalCard(cardId: string, data: Partial<InsertMysticalCard>): Promise<MysticalCard>;
  deleteMysticalCard(cardId: string): Promise<boolean>;

  // Quantum Popups
  getQuantumEvents(): Promise<QuantumEvent[]>;
  upsertQuantumEvent(eventId: string, data: Partial<InsertQuantumEvent>): Promise<QuantumEvent>;
  getQuantumMessages(): Promise<QuantumMessage[]>;
  createQuantumMessage(message: InsertQuantumMessage): Promise<QuantumMessage>;
  updateQuantumMessage(id: number, updates: Partial<QuantumMessage>): Promise<QuantumMessage | undefined>;
  deleteQuantumMessage(id: number): Promise<boolean>;
  
  // Campaign Links
  getCampaignLinks(campaignId: string): Promise<CampaignLink[]>;
  createCampaignLink(link: InsertCampaignLink): Promise<CampaignLink>;
  deleteCampaignLink(id: number): Promise<boolean>;
  
  // Learning Paths
  getAllLearningPaths(): Promise<LearningPath[]>;
  getLearningPathsByCategory(category: string): Promise<LearningPath[]>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  updateLearningPath(id: number, updates: Partial<LearningPath>): Promise<LearningPath | undefined>;
  deleteLearningPath(id: number): Promise<boolean>;
  
  // OSINT Tools
  getAllOsintTools(): Promise<OsintTool[]>;
  getOsintToolByKey(key: string): Promise<OsintTool | undefined>;
  getActiveOsintTools(): Promise<OsintTool[]>;
  upsertOsintTool(key: string, data: Partial<InsertOsintTool>): Promise<OsintTool>;
  deleteOsintTool(key: string): Promise<boolean>;
  
  // OSINT Tool Calls
  logToolCall(call: InsertOsintToolCall): Promise<OsintToolCall>;
  getToolCallsBySession(sessionToken: string, limit?: number): Promise<OsintToolCall[]>;
  getToolCallsByInvestigation(investigationId: string): Promise<OsintToolCall[]>;
  updateToolCallStatus(id: number, status: string, response?: any, errorMessage?: string, latencyMs?: number): Promise<OsintToolCall | undefined>;
  
  // Investigation Context
  createInvestigation(context: InsertInvestigationContext): Promise<InvestigationContext>;
  getInvestigationById(investigationId: string): Promise<InvestigationContext | undefined>;
  getInvestigationsBySession(sessionToken: string): Promise<InvestigationContext[]>;
  updateInvestigation(investigationId: string, updates: Partial<InvestigationContext>): Promise<InvestigationContext | undefined>;
  getActiveInvestigation(sessionToken: string): Promise<InvestigationContext | undefined>;
  
  // Interaction Logs
  logInteraction(log: InsertInteractionLog): Promise<InteractionLog>;
  getInteractionsBySession(sessionToken: string, limit?: number): Promise<InteractionLog[]>;
  getInteractionsForEvaluation(filters?: { source?: string; actionType?: string; adminFlag?: string }): Promise<InteractionLog[]>;
  flagInteraction(id: number, flag: 'good' | 'bad' | 'review'): Promise<InteractionLog | undefined>;
  
  // State Capsules
  createStateCapsule(capsule: InsertStateCapsule): Promise<StateCapsule>;
  getStateCapsulesBySession(sessionToken: string): Promise<StateCapsule[]>;
  getLatestCapsule(sessionToken: string, investigationId?: string): Promise<StateCapsule | undefined>;
  
  // Abuse Detection
  detectAbuseCluster(timeWindowMinutes?: number, threshold?: number): Promise<{
    clusterId: string;
    sessionTokens: string[];
    actionCount: number;
    timeRange: { start: Date; end: Date };
    suspiciousPatterns: string[];
  }[]>;
  getSessionsByIpPattern(ipPrefix: string): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  // Game Sessions
  async getSessionByToken(token: string): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.sessionToken, token))
      .limit(1);
    return session;
  }

  async getAllSessions(): Promise<GameSession[]> {
    return await db.select().from(gameSessions).orderBy(desc(gameSessions.lastActive)).limit(100);
  }

  async createSession(session: InsertGameSession): Promise<GameSession> {
    const [newSession] = await db.insert(gameSessions).values(session).returning();
    return newSession;
  }

  async updateSession(token: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const [updated] = await db
      .update(gameSessions)
      .set({ ...updates, lastActive: new Date() })
      .where(eq(gameSessions.sessionToken, token))
      .returning();
    return updated;
  }

  // Campaign Runs
  async createCampaignRun(run: InsertCampaignRun): Promise<CampaignRun> {
    const [newRun] = await db.insert(campaignRuns).values(run).returning();
    return newRun;
  }

  async getCampaignRunById(runId: string): Promise<CampaignRun | undefined> {
    const [run] = await db
      .select()
      .from(campaignRuns)
      .where(eq(campaignRuns.runId, runId))
      .limit(1);
    return run;
  }

  async getCampaignRunsBySession(sessionToken: string): Promise<CampaignRun[]> {
    return await db
      .select()
      .from(campaignRuns)
      .where(eq(campaignRuns.sessionToken, sessionToken))
      .orderBy(desc(campaignRuns.updatedAt));
  }

  async getActiveCampaignRun(sessionToken: string, campaignId?: string): Promise<CampaignRun | undefined> {
    const filters = [
      eq(campaignRuns.sessionToken, sessionToken),
      eq(campaignRuns.status, "active")
    ];

    if (campaignId) {
      filters.push(eq(campaignRuns.campaignId, campaignId));
    }

    const [run] = await db
      .select()
      .from(campaignRuns)
      .where(and(...filters))
      .orderBy(desc(campaignRuns.updatedAt))
      .limit(1);
    return run;
  }

  async updateCampaignRun(runId: string, updates: Partial<CampaignRun>): Promise<CampaignRun | undefined> {
    const [updated] = await db
      .update(campaignRuns)
      .set({ ...updates, updatedAt: new Date(), lastActionAt: new Date() })
      .where(eq(campaignRuns.runId, runId))
      .returning();
    return updated;
  }

  // Clues
  async getAllClues(): Promise<Clue[]> {
    return await db.select().from(clues).where(eq(clues.isActive, true));
  }

  async getClueById(id: string): Promise<Clue | undefined> {
    const [clue] = await db.select().from(clues).where(eq(clues.id, id)).limit(1);
    return clue;
  }

  async createClue(clue: InsertClue): Promise<Clue> {
    const [newClue] = await db.insert(clues).values(clue).returning();
    return newClue;
  }

  async updateClue(id: string, updates: Partial<Clue>): Promise<Clue | undefined> {
    const [updated] = await db
      .update(clues)
      .set(updates)
      .where(eq(clues.id, id))
      .returning();
    return updated;
  }

  async deleteClue(id: string): Promise<boolean> {
    const [deleted] = await db
      .update(clues)
      .set({ isActive: false })
      .where(eq(clues.id, id))
      .returning();
    return !!deleted;
  }

  // Quests
  async getAllQuests(): Promise<Quest[]> {
    return await db.select().from(quests).where(eq(quests.isActive, true));
  }

  async getQuestById(id: string): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.id, id)).limit(1);
    return quest;
  }

  async createQuest(quest: InsertQuest): Promise<Quest> {
    const [newQuest] = await db.insert(quests).values(quest).returning();
    return newQuest;
  }

  async updateQuest(id: string, updates: Partial<Quest>): Promise<Quest | undefined> {
    const [updated] = await db
      .update(quests)
      .set(updates)
      .where(eq(quests.id, id))
      .returning();
    return updated;
  }

  async deleteQuest(id: string): Promise<boolean> {
    const [deleted] = await db
      .update(quests)
      .set({ isActive: false })
      .where(eq(quests.id, id))
      .returning();
    return !!deleted;
  }

  // Command Logs
  async logCommand(log: InsertCommandLog): Promise<CommandLog> {
    const [newLog] = await db.insert(commandLogs).values(log).returning();
    return newLog;
  }

  async getCommandHistory(sessionToken: string, limit: number = 50): Promise<CommandLog[]> {
    return await db
      .select()
      .from(commandLogs)
      .where(eq(commandLogs.sessionToken, sessionToken))
      .orderBy(desc(commandLogs.timestamp))
      .limit(limit);
  }

  // Behavioral Profiles
  async logBehavior(profile: InsertBehavioralProfile): Promise<BehavioralProfile> {
    const [newProfile] = await db.insert(behavioralProfiles).values(profile).returning();
    return newProfile;
  }

  async getBehaviorsBySession(sessionToken: string): Promise<BehavioralProfile[]> {
    return await db
      .select()
      .from(behavioralProfiles)
      .where(eq(behavioralProfiles.sessionToken, sessionToken))
      .orderBy(desc(behavioralProfiles.timestamp));
  }

  async getAllBehaviors(limit: number = 100): Promise<BehavioralProfile[]> {
    return await db
      .select()
      .from(behavioralProfiles)
      .orderBy(desc(behavioralProfiles.timestamp))
      .limit(limit);
  }

  async getBehavioralTrends(days: number = 7): Promise<any> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Get category distribution
    const categoryStats = await db
      .select({
        category: behavioralProfiles.category,
        count: count()
      })
      .from(behavioralProfiles)
      .where(gte(behavioralProfiles.timestamp, cutoff))
      .groupBy(behavioralProfiles.category);

    // Get action type distribution
    const actionStats = await db
      .select({
        actionType: behavioralProfiles.actionType,
        count: count()
      })
      .from(behavioralProfiles)
      .where(gte(behavioralProfiles.timestamp, cutoff))
      .groupBy(behavioralProfiles.actionType);

    // Get daily activity
    const dailyActivity = await db
      .select({
        date: sql<string>`DATE(${behavioralProfiles.timestamp})`,
        count: count()
      })
      .from(behavioralProfiles)
      .where(gte(behavioralProfiles.timestamp, cutoff))
      .groupBy(sql`DATE(${behavioralProfiles.timestamp})`)
      .orderBy(sql`DATE(${behavioralProfiles.timestamp})`);

    // Get unique sessions
    const uniqueSessions = await db
      .selectDistinct({ sessionToken: behavioralProfiles.sessionToken })
      .from(behavioralProfiles)
      .where(gte(behavioralProfiles.timestamp, cutoff));

    return {
      categoryDistribution: categoryStats,
      actionTypeDistribution: actionStats,
      dailyActivity,
      uniqueUsers: uniqueSessions.length,
      totalEvents: categoryStats.reduce((sum, c) => sum + Number(c.count), 0)
    };
  }

  // Admin Prompts
  async getAdminPromptByKey(key: string): Promise<AdminPrompt | undefined> {
    const [prompt] = await db
      .select()
      .from(adminPrompts)
      .where(eq(adminPrompts.key, key))
      .limit(1);
    return prompt;
  }

  async getAllAdminPrompts(): Promise<AdminPrompt[]> {
    return await db.select().from(adminPrompts).orderBy(adminPrompts.category);
  }

  async upsertAdminPrompt(key: string, data: Partial<InsertAdminPrompt>): Promise<AdminPrompt> {
    const existing = await this.getAdminPromptByKey(key);
    if (existing) {
      const [updated] = await db
        .update(adminPrompts)
        .set({ ...data, version: existing.version + 1, updatedAt: new Date() })
        .where(eq(adminPrompts.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(adminPrompts)
        .values({ key, name: data.name || key, content: data.content || '', ...data })
        .returning();
      return created;
    }
  }

  // Prompt Gallery
  async getPromptGallery(status?: string): Promise<PromptGalleryEntry[]> {
    if (status) {
      return await db
        .select()
        .from(promptGallery)
        .where(eq(promptGallery.status, status))
        .orderBy(desc(promptGallery.createdAt));
    }
    return await db.select().from(promptGallery).orderBy(desc(promptGallery.createdAt));
  }

  async getPromptGalleryBySession(sessionToken: string): Promise<PromptGalleryEntry[]> {
    return await db
      .select()
      .from(promptGallery)
      .where(eq(promptGallery.sessionToken, sessionToken))
      .orderBy(desc(promptGallery.createdAt));
  }

  async createPromptGalleryEntry(entry: InsertPromptGallery): Promise<PromptGalleryEntry> {
    const [created] = await db.insert(promptGallery).values(entry).returning();
    return created;
  }

  // Campaign Templates
  async getCampaignByKey(key: string): Promise<CampaignTemplate | undefined> {
    const [campaign] = await db
      .select()
      .from(campaignTemplates)
      .where(eq(campaignTemplates.key, key))
      .limit(1);
    return campaign;
  }

  async getAllCampaigns(): Promise<CampaignTemplate[]> {
    return await db.select().from(campaignTemplates).orderBy(campaignTemplates.category);
  }

  async createCampaign(campaign: InsertCampaignTemplate): Promise<CampaignTemplate> {
    const [created] = await db.insert(campaignTemplates).values(campaign).returning();
    return created;
  }

  async updateCampaign(key: string, updates: Partial<CampaignTemplate>): Promise<CampaignTemplate | undefined> {
    const [updated] = await db
      .update(campaignTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaignTemplates.key, key))
      .returning();
    return updated;
  }

  async deleteCampaign(key: string): Promise<boolean> {
    const result = await db.delete(campaignTemplates).where(eq(campaignTemplates.key, key));
    return true;
  }

  // Flow Nodes
  async getFlowNodesByKey(campaignKey: string): Promise<FlowNode[]> {
    return await db
      .select()
      .from(flowNodes)
      .where(eq(flowNodes.campaignKey, campaignKey));
  }

  async getAllFlowNodes(): Promise<FlowNode[]> {
    return await db.select().from(flowNodes);
  }

  async upsertFlowNode(nodeId: string, data: Partial<InsertFlowNode>): Promise<FlowNode> {
    const [existing] = await db
      .select()
      .from(flowNodes)
      .where(eq(flowNodes.nodeId, nodeId))
      .limit(1);
    
    if (existing) {
      const [updated] = await db
        .update(flowNodes)
        .set(data)
        .where(eq(flowNodes.nodeId, nodeId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(flowNodes)
        .values({ nodeId, title: data.title || 'Untitled', type: data.type || 'clue', ...data })
        .returning();
      return created;
    }
  }

  async deleteFlowNode(nodeId: string): Promise<boolean> {
    await db.delete(flowNodes).where(eq(flowNodes.nodeId, nodeId));
    return true;
  }

  // Designer Campaigns
  async getAllDesignerCampaigns(): Promise<DesignerCampaign[]> {
    return await db.select().from(designerCampaigns).orderBy(desc(designerCampaigns.updatedAt));
  }

  async getDesignerCampaignById(campaignId: string): Promise<DesignerCampaign | undefined> {
    const [campaign] = await db
      .select()
      .from(designerCampaigns)
      .where(eq(designerCampaigns.campaignId, campaignId))
      .limit(1);
    return campaign;
  }

  async upsertDesignerCampaign(campaignId: string, data: Partial<InsertDesignerCampaign>): Promise<DesignerCampaign> {
    const [existing] = await db
      .select()
      .from(designerCampaigns)
      .where(eq(designerCampaigns.campaignId, campaignId))
      .limit(1);
    
    if (existing) {
      const [updated] = await db
        .update(designerCampaigns)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(designerCampaigns.campaignId, campaignId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(designerCampaigns)
        .values({ campaignId, name: data.name || 'Untitled Campaign', ...data })
        .returning();
      return created;
    }
  }

  async deleteDesignerCampaign(campaignId: string): Promise<boolean> {
    await db.delete(designerCampaigns).where(eq(designerCampaigns.campaignId, campaignId));
    return true;
  }

  // Shared Clues
  async getAllSharedClues(): Promise<SharedClue[]> {
    return await db.select().from(sharedClues).orderBy(desc(sharedClues.updatedAt));
  }

  async getSharedClueById(clueId: string): Promise<SharedClue | undefined> {
    const [clue] = await db
      .select()
      .from(sharedClues)
      .where(eq(sharedClues.clueId, clueId))
      .limit(1);
    return clue;
  }

  async upsertSharedClue(clueId: string, data: Partial<InsertSharedClue>): Promise<SharedClue> {
    const [existing] = await db
      .select()
      .from(sharedClues)
      .where(eq(sharedClues.clueId, clueId))
      .limit(1);
    
    if (existing) {
      const [updated] = await db
        .update(sharedClues)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(sharedClues.clueId, clueId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(sharedClues)
        .values({ clueId, name: data.name || 'Untitled Clue', description: data.description || '', ...data })
        .returning();
      return created;
    }
  }

  async deleteSharedClue(clueId: string): Promise<boolean> {
    await db.delete(sharedClues).where(eq(sharedClues.clueId, clueId));
    return true;
  }

  // Artifacts
  async getAllArtifacts(): Promise<Artifact[]> {
    return await db.select().from(artifacts).where(eq(artifacts.isActive, true));
  }

  async getArtifactById(id: string): Promise<Artifact | undefined> {
    const [artifact] = await db.select().from(artifacts).where(eq(artifacts.id, id)).limit(1);
    return artifact;
  }

  async createArtifact(artifact: InsertArtifact): Promise<Artifact> {
    const [created] = await db.insert(artifacts).values(artifact).returning();
    return created;
  }

  async updateArtifact(id: string, updates: Partial<Artifact>): Promise<Artifact | undefined> {
    const [updated] = await db
      .update(artifacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(artifacts.id, id))
      .returning();
    return updated;
  }

  async deleteArtifact(id: string): Promise<boolean> {
    const [deleted] = await db
      .update(artifacts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(artifacts.id, id))
      .returning();
    return !!deleted;
  }

  // Mystical Cards
  async getMysticalCards(): Promise<MysticalCard[]> {
    return await db.select().from(mysticalCards).orderBy(desc(mysticalCards.updatedAt));
  }

  async upsertMysticalCard(cardId: string, data: Partial<InsertMysticalCard>): Promise<MysticalCard> {
    const [existing] = await db
      .select()
      .from(mysticalCards)
      .where(eq(mysticalCards.cardId, cardId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(mysticalCards)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(mysticalCards.cardId, cardId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(mysticalCards)
      .values({ ...data, cardId } as InsertMysticalCard)
      .returning();
    return created;
  }

  async deleteMysticalCard(cardId: string): Promise<boolean> {
    const [deleted] = await db
      .update(mysticalCards)
      .set({ enabled: false, updatedAt: new Date() })
      .where(eq(mysticalCards.cardId, cardId))
      .returning();
    return !!deleted;
  }

  // Quantum Popups
  async getQuantumEvents(): Promise<QuantumEvent[]> {
    return await db.select().from(quantumEvents).orderBy(desc(quantumEvents.updatedAt));
  }

  async upsertQuantumEvent(eventId: string, data: Partial<InsertQuantumEvent>): Promise<QuantumEvent> {
    const [existing] = await db
      .select()
      .from(quantumEvents)
      .where(eq(quantumEvents.id, eventId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(quantumEvents)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(quantumEvents.id, eventId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(quantumEvents)
      .values({ ...data, id: eventId } as InsertQuantumEvent)
      .returning();
    return created;
  }

  async getQuantumMessages(): Promise<QuantumMessage[]> {
    return await db.select().from(quantumMessages).orderBy(desc(quantumMessages.updatedAt));
  }

  async createQuantumMessage(message: InsertQuantumMessage): Promise<QuantumMessage> {
    const [created] = await db.insert(quantumMessages).values(message).returning();
    return created;
  }

  async updateQuantumMessage(id: number, updates: Partial<QuantumMessage>): Promise<QuantumMessage | undefined> {
    const [updated] = await db
      .update(quantumMessages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quantumMessages.id, id))
      .returning();
    return updated;
  }

  async deleteQuantumMessage(id: number): Promise<boolean> {
    const [deleted] = await db
      .update(quantumMessages)
      .set({ enabled: false, updatedAt: new Date() })
      .where(eq(quantumMessages.id, id))
      .returning();
    return !!deleted;
  }

  // Campaign Links
  async getCampaignLinks(campaignId: string): Promise<CampaignLink[]> {
    return await db
      .select()
      .from(campaignLinks)
      .where(eq(campaignLinks.sourceCampaignId, campaignId));
  }

  async createCampaignLink(link: InsertCampaignLink): Promise<CampaignLink> {
    const [created] = await db.insert(campaignLinks).values(link).returning();
    return created;
  }

  async deleteCampaignLink(id: number): Promise<boolean> {
    await db.delete(campaignLinks).where(eq(campaignLinks.id, id));
    return true;
  }

  // Learning Paths
  async getAllLearningPaths(): Promise<LearningPath[]> {
    return await db.select().from(learningPaths).where(eq(learningPaths.isActive, true));
  }

  async getLearningPathsByCategory(category: string): Promise<LearningPath[]> {
    return await db
      .select()
      .from(learningPaths)
      .where(eq(learningPaths.category, category));
  }

  async createLearningPath(path: InsertLearningPath): Promise<LearningPath> {
    const [created] = await db.insert(learningPaths).values(path).returning();
    return created;
  }

  async updateLearningPath(id: number, updates: Partial<LearningPath>): Promise<LearningPath | undefined> {
    const [updated] = await db
      .update(learningPaths)
      .set(updates)
      .where(eq(learningPaths.id, id))
      .returning();
    return updated;
  }

  async deleteLearningPath(id: number): Promise<boolean> {
    await db.delete(learningPaths).where(eq(learningPaths.id, id));
    return true;
  }

  // OSINT Tools
  async getAllOsintTools(): Promise<OsintTool[]> {
    return await db.select().from(osintTools).orderBy(osintTools.name);
  }

  async getOsintToolByKey(key: string): Promise<OsintTool | undefined> {
    const [tool] = await db.select().from(osintTools).where(eq(osintTools.key, key)).limit(1);
    return tool;
  }

  async getActiveOsintTools(): Promise<OsintTool[]> {
    return await db.select().from(osintTools).where(eq(osintTools.isActive, true)).orderBy(osintTools.name);
  }

  async upsertOsintTool(key: string, data: Partial<InsertOsintTool>): Promise<OsintTool> {
    const existing = await this.getOsintToolByKey(key);
    if (existing) {
      const [updated] = await db
        .update(osintTools)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(osintTools.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(osintTools).values({ key, ...data } as any).returning();
    return created;
  }

  async deleteOsintTool(key: string): Promise<boolean> {
    await db.delete(osintTools).where(eq(osintTools.key, key));
    return true;
  }

  // OSINT Tool Calls
  async logToolCall(call: InsertOsintToolCall): Promise<OsintToolCall> {
    const [created] = await db.insert(osintToolCalls).values(call).returning();
    return created;
  }

  async getToolCallsBySession(sessionToken: string, limit = 50): Promise<OsintToolCall[]> {
    return await db
      .select()
      .from(osintToolCalls)
      .where(eq(osintToolCalls.sessionToken, sessionToken))
      .orderBy(desc(osintToolCalls.timestamp))
      .limit(limit);
  }

  async getToolCallsByInvestigation(investigationId: string): Promise<OsintToolCall[]> {
    return await db
      .select()
      .from(osintToolCalls)
      .where(eq(osintToolCalls.investigationId, investigationId))
      .orderBy(desc(osintToolCalls.timestamp));
  }

  async updateToolCallStatus(
    id: number, 
    status: string, 
    response?: any, 
    errorMessage?: string, 
    latencyMs?: number
  ): Promise<OsintToolCall | undefined> {
    const [updated] = await db
      .update(osintToolCalls)
      .set({ status, response, errorMessage, latencyMs })
      .where(eq(osintToolCalls.id, id))
      .returning();
    return updated;
  }

  // Investigation Context
  async createInvestigation(context: InsertInvestigationContext): Promise<InvestigationContext> {
    const [created] = await db.insert(investigationContexts).values(context).returning();
    return created;
  }

  async getInvestigationById(investigationId: string): Promise<InvestigationContext | undefined> {
    const [investigation] = await db
      .select()
      .from(investigationContexts)
      .where(eq(investigationContexts.investigationId, investigationId))
      .limit(1);
    return investigation;
  }

  async getInvestigationsBySession(sessionToken: string): Promise<InvestigationContext[]> {
    return await db
      .select()
      .from(investigationContexts)
      .where(eq(investigationContexts.sessionToken, sessionToken))
      .orderBy(desc(investigationContexts.updatedAt));
  }

  async updateInvestigation(
    investigationId: string, 
    updates: Partial<InvestigationContext>
  ): Promise<InvestigationContext | undefined> {
    const [updated] = await db
      .update(investigationContexts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(investigationContexts.investigationId, investigationId))
      .returning();
    return updated;
  }

  async getActiveInvestigation(sessionToken: string): Promise<InvestigationContext | undefined> {
    const [active] = await db
      .select()
      .from(investigationContexts)
      .where(and(
        eq(investigationContexts.sessionToken, sessionToken),
        eq(investigationContexts.status, 'active')
      ))
      .orderBy(desc(investigationContexts.updatedAt))
      .limit(1);
    return active;
  }

  // Interaction Logs
  async logInteraction(log: InsertInteractionLog): Promise<InteractionLog> {
    const [created] = await db.insert(interactionLogs).values(log).returning();
    return created;
  }

  async getInteractionsBySession(sessionToken: string, limit = 100): Promise<InteractionLog[]> {
    return await db
      .select()
      .from(interactionLogs)
      .where(eq(interactionLogs.sessionToken, sessionToken))
      .orderBy(desc(interactionLogs.timestamp))
      .limit(limit);
  }

  async getInteractionsForEvaluation(filters?: { 
    source?: string; 
    actionType?: string; 
    adminFlag?: string 
  }): Promise<InteractionLog[]> {
    let query = db.select().from(interactionLogs);
    
    const conditions = [];
    if (filters?.source) {
      conditions.push(eq(interactionLogs.source, filters.source));
    }
    if (filters?.actionType) {
      conditions.push(eq(interactionLogs.actionType, filters.actionType));
    }
    if (filters?.adminFlag) {
      conditions.push(sql`${interactionLogs.metadata}->>'adminFlag' = ${filters.adminFlag}`);
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(interactionLogs)
        .where(and(...conditions))
        .orderBy(desc(interactionLogs.timestamp))
        .limit(500);
    }
    
    return await db
      .select()
      .from(interactionLogs)
      .orderBy(desc(interactionLogs.timestamp))
      .limit(500);
  }

  async flagInteraction(id: number, flag: 'good' | 'bad' | 'review'): Promise<InteractionLog | undefined> {
    const [existing] = await db.select().from(interactionLogs).where(eq(interactionLogs.id, id)).limit(1);
    if (!existing) return undefined;
    
    const updatedMetadata = { ...existing.metadata, adminFlag: flag };
    const [updated] = await db
      .update(interactionLogs)
      .set({ metadata: updatedMetadata })
      .where(eq(interactionLogs.id, id))
      .returning();
    return updated;
  }

  // State Capsules
  async createStateCapsule(capsule: InsertStateCapsule): Promise<StateCapsule> {
    const [created] = await db.insert(stateCapsules).values(capsule).returning();
    return created;
  }

  async getStateCapsulesBySession(sessionToken: string): Promise<StateCapsule[]> {
    return await db
      .select()
      .from(stateCapsules)
      .where(eq(stateCapsules.sessionToken, sessionToken))
      .orderBy(desc(stateCapsules.createdAt));
  }

  async getLatestCapsule(sessionToken: string, investigationId?: string): Promise<StateCapsule | undefined> {
    const conditions = [eq(stateCapsules.sessionToken, sessionToken)];
    if (investigationId) {
      conditions.push(eq(stateCapsules.investigationId, investigationId));
    }
    
    const [latest] = await db
      .select()
      .from(stateCapsules)
      .where(and(...conditions))
      .orderBy(desc(stateCapsules.createdAt))
      .limit(1);
    return latest;
  }

  // Abuse Detection - clusters suspicious activity across sessions
  async detectAbuseCluster(timeWindowMinutes = 5, threshold = 50): Promise<{
    clusterId: string;
    sessionTokens: string[];
    actionCount: number;
    timeRange: { start: Date; end: Date };
    suspiciousPatterns: string[];
  }[]> {
    const windowStart = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    // Get high-frequency sessions in time window
    const sessionActivity = await db
      .select({
        sessionToken: interactionLogs.sessionToken,
        actionCount: count(interactionLogs.id),
        firstAction: sql<Date>`MIN(${interactionLogs.timestamp})`,
        lastAction: sql<Date>`MAX(${interactionLogs.timestamp})`,
      })
      .from(interactionLogs)
      .where(gte(interactionLogs.timestamp, windowStart))
      .groupBy(interactionLogs.sessionToken);

    // Find sessions exceeding threshold
    const suspiciousSessions = sessionActivity.filter(s => 
      s.actionCount && Number(s.actionCount) >= threshold
    );

    if (suspiciousSessions.length === 0) return [];

    // Cluster sessions by overlapping time ranges
    const clusters: {
      clusterId: string;
      sessionTokens: string[];
      actionCount: number;
      timeRange: { start: Date; end: Date };
      suspiciousPatterns: string[];
    }[] = [];

    // Simple clustering: group sessions with overlapping activity windows
    let clusterIndex = 0;
    const processed = new Set<string>();

    for (const session of suspiciousSessions) {
      if (processed.has(session.sessionToken || '')) continue;
      
      const cluster = {
        clusterId: `abuse_cluster_${Date.now()}_${clusterIndex++}`,
        sessionTokens: [session.sessionToken || ''],
        actionCount: Number(session.actionCount) || 0,
        timeRange: {
          start: session.firstAction || new Date(),
          end: session.lastAction || new Date()
        },
        suspiciousPatterns: [] as string[]
      };
      
      processed.add(session.sessionToken || '');

      // Find overlapping sessions
      for (const other of suspiciousSessions) {
        if (processed.has(other.sessionToken || '')) continue;
        
        const otherStart = other.firstAction || new Date();
        const otherEnd = other.lastAction || new Date();
        
        // Check overlap
        if (otherStart <= cluster.timeRange.end && otherEnd >= cluster.timeRange.start) {
          cluster.sessionTokens.push(other.sessionToken || '');
          cluster.actionCount += Number(other.actionCount) || 0;
          cluster.timeRange.start = new Date(Math.min(cluster.timeRange.start.getTime(), otherStart.getTime()));
          cluster.timeRange.end = new Date(Math.max(cluster.timeRange.end.getTime(), otherEnd.getTime()));
          processed.add(other.sessionToken || '');
        }
      }

      // Detect patterns
      if (cluster.sessionTokens.length > 1) {
        cluster.suspiciousPatterns.push('multiple_sessions_same_timeframe');
      }
      if (cluster.actionCount > threshold * 2) {
        cluster.suspiciousPatterns.push('excessive_request_volume');
      }
      
      // Only report clusters with multiple sessions or very high volume
      if (cluster.sessionTokens.length > 1 || cluster.actionCount > threshold * 3) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  async getSessionsByIpPattern(ipPrefix: string): Promise<string[]> {
    // This would require storing IP in session data - return placeholder for now
    // In real implementation, would query sessions with matching IP patterns
    return [];
  }
}

export const storage = new DatabaseStorage();
