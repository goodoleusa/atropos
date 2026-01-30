import { db } from "./db";
import { 
  gameSessions, 
  clues, 
  quests, 
  commandLogs,
  behavioralProfiles,
  adminPrompts,
  campaignTemplates,
  flowNodes,
  designerCampaigns,
  sharedClues,
  campaignLinks,
  learningPaths,
  type GameSession, 
  type InsertGameSession,
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
  type CampaignTemplate,
  type InsertCampaignTemplate,
  type FlowNode,
  type InsertFlowNode,
  type DesignerCampaign,
  type InsertDesignerCampaign,
  type SharedClue,
  type InsertSharedClue,
  type CampaignLink,
  type InsertCampaignLink,
  type LearningPath,
  type InsertLearningPath
} from "@shared/schema";
import { eq, desc, sql, count, gte } from "drizzle-orm";

export interface IStorage {
  // Game Sessions
  getSessionByToken(token: string): Promise<GameSession | undefined>;
  getAllSessions(): Promise<GameSession[]>;
  createSession(session: InsertGameSession): Promise<GameSession>;
  updateSession(token: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;
  
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
}

export const storage = new DatabaseStorage();
