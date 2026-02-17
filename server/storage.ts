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
  agentModules,
  osintTools,
  osintToolCalls,
  investigationContexts,
  interactionLogs,
  stateCapsules,
  playerProgression,
  achievements,
  playerAchievements,
  leaderboardEntries,
  dailyChallenges,
  challengeCompletions,
  campaignStats,
  modmail,
  multiplayerLobbies,
  achievementDefinitions,
  gameEvents,
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
  type AgentModule,
  type InsertAgentModule,
  type OsintTool,
  type InsertOsintTool,
  type OsintToolCall,
  type InsertOsintToolCall,
  type InvestigationContext,
  type InsertInvestigationContext,
  type InteractionLog,
  type InsertInteractionLog,
  type StateCapsule,
  type InsertStateCapsule,
  type PlayerProgression,
  type InsertPlayerProgression,
  type Achievement,
  type InsertAchievement,
  type PlayerAchievement,
  type InsertPlayerAchievement,
  type LeaderboardEntry,
  type InsertLeaderboardEntry,
  type DailyChallenge,
  type InsertDailyChallenge,
  type ChallengeCompletion,
  type InsertChallengeCompletion,
  type CampaignStats,
  type InsertCampaignStats,
  type Modmail,
  type InsertModmail,
  type MultiplayerLobby,
  type InsertMultiplayerLobby,
  type AchievementDefinition,
  type InsertAchievementDefinition,
  type GameEvent,
  type InsertGameEvent,
  businessProjects,
  type BusinessProject,
  type InsertBusinessProject,
  feedbackItems,
  type FeedbackItem,
  type InsertFeedbackItem,
  portfolioEntries,
  type PortfolioEntry,
  type InsertPortfolioEntry
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
  getAdminPromptsByCategory(category: string): Promise<AdminPrompt[]>;

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
  getPublishedDesignerCampaigns(): Promise<DesignerCampaign[]>;
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
  
  // Agent Modules (editable investigation campaigns)
  getAllAgentModules(): Promise<AgentModule[]>;
  getAgentModuleById(moduleId: string): Promise<AgentModule | undefined>;
  getActiveAgentModules(): Promise<AgentModule[]>;
  upsertAgentModule(moduleId: string, data: Partial<InsertAgentModule>): Promise<AgentModule>;
  deleteAgentModule(moduleId: string): Promise<boolean>;

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
  
  // Modmail
  getAllModmail(): Promise<Modmail[]>;
  getModmailBySession(sessionToken: string): Promise<Modmail[]>;
  getModmailByTicket(ticketId: string): Promise<Modmail | undefined>;
  createModmail(mail: InsertModmail): Promise<Modmail>;
  updateModmail(ticketId: string, updates: Partial<Modmail>): Promise<Modmail | undefined>;
  
  // Multiplayer Lobbies
  getAllLobbies(): Promise<MultiplayerLobby[]>;
  getActiveLobbies(): Promise<MultiplayerLobby[]>;
  getLobbyById(lobbyId: string): Promise<MultiplayerLobby | undefined>;
  createLobby(lobby: InsertMultiplayerLobby): Promise<MultiplayerLobby>;
  updateLobby(lobbyId: string, updates: Partial<MultiplayerLobby>): Promise<MultiplayerLobby | undefined>;
  joinLobby(lobbyId: string, player: { sessionToken: string; alias: string }): Promise<MultiplayerLobby | undefined>;
  leaveLobby(lobbyId: string, sessionToken: string): Promise<MultiplayerLobby | undefined>;
  deleteLobby(lobbyId: string): Promise<boolean>;
  
  // Achievement Definitions
  getAllAchievementDefinitions(): Promise<AchievementDefinition[]>;
  getActiveAchievementDefinitions(): Promise<AchievementDefinition[]>;
  getAchievementDefinitionById(achievementId: string): Promise<AchievementDefinition | undefined>;
  upsertAchievementDefinition(achievementId: string, data: Partial<InsertAchievementDefinition>): Promise<AchievementDefinition>;
  deleteAchievementDefinition(achievementId: string): Promise<boolean>;

  // Game Events
  logGameEvent(event: InsertGameEvent): Promise<GameEvent>;
  getGameEventsBySession(sessionToken: string, limit?: number): Promise<GameEvent[]>;
  getRecentGameEvents(limit?: number): Promise<GameEvent[]>;

  // XP and Leveling
  awardXP(sessionToken: string, amount: number, reason: string): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }>;

  // Leaderboard (Legacy from gameEvents system)
  getGameSessionLeaderboard(limit?: number): Promise<{ sessionToken: string; username: string; xp: number; level: number; clueCount: number; questCount: number }[]>;

  // Gameplay Analytics (Admin)
  getGameplayAnalytics(): Promise<{
    totalPlayers: number;
    activePlayers24h: number;
    activePlayers7d: number;
    avgCluesPerPlayer: number;
    avgQuestsPerPlayer: number;
    totalCampaignRuns: number;
    campaignCompletionRate: number;
    topCampaigns: { campaignId: string; runCount: number }[];
    recentEvents: GameEvent[];
  }>;

  // Quest Auto-Completion Check
  checkAndCompleteQuests(sessionToken: string): Promise<{ newlyCompleted: string[]; xpAwarded: number }>;

  // Admin Configuration
  getAdminConfig(): Promise<AdminConfig | undefined>;
  updateAdminConfig(updates: Partial<AdminConfig>): Promise<AdminConfig>;
  
  // Player Progression
  getPlayerProgression(sessionToken: string): Promise<PlayerProgression | undefined>;
  createPlayerProgression(progression: InsertPlayerProgression): Promise<PlayerProgression>;
  updatePlayerProgression(sessionToken: string, updates: Partial<PlayerProgression>): Promise<PlayerProgression | undefined>;
  addXP(sessionToken: string, xp: number, source?: string): Promise<{ progression: PlayerProgression; leveledUp: boolean; newLevel?: number }>;
  addCurrency(sessionToken: string, amount: number): Promise<PlayerProgression | undefined>;
  updateSkill(sessionToken: string, skill: 'osint' | 'network' | 'malware' | 'social', points: number): Promise<PlayerProgression | undefined>;
  
  // Achievements
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementById(achievementId: string): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(achievementId: string, updates: Partial<Achievement>): Promise<Achievement | undefined>;
  deleteAchievement(achievementId: string): Promise<boolean>;
  
  // Player Achievements
  getPlayerAchievements(sessionToken: string): Promise<PlayerAchievement[]>;
  unlockAchievement(sessionToken: string, achievementId: string, metadata?: any): Promise<{ achievement: PlayerAchievement; rewards: { xp: number; currency: number; unlocks: string[] } }>;
  checkAchievementProgress(sessionToken: string, achievementId: string): Promise<{ unlocked: boolean; progress: number }>;
  
  // Leaderboards
  getLeaderboard(type: string, limit?: number): Promise<LeaderboardEntry[]>;
  updateLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  getPlayerRank(sessionToken: string, type: string): Promise<{ rank: number; entry: LeaderboardEntry } | null>;
  recalculateLeaderboard(type: string): Promise<void>;
  
  // Daily Challenges
  getDailyChallenges(includeExpired?: boolean): Promise<DailyChallenge[]>;
  getTodayChallenge(): Promise<DailyChallenge | undefined>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  getChallengeCompletions(sessionToken: string): Promise<ChallengeCompletion[]>;
  completeChallenge(completion: InsertChallengeCompletion): Promise<{ completion: ChallengeCompletion; rewards: { xp: number; currency: number } }>;
  hasChallengeCompleted(sessionToken: string, challengeId: string): Promise<boolean>;
  
  // Campaign Stats
  getCampaignStats(campaignId: string): Promise<CampaignStats | undefined>;
  updateCampaignStats(campaignId: string, updates: Partial<CampaignStats>): Promise<CampaignStats>;
  recordCampaignAttempt(campaignId: string, sessionToken: string): Promise<void>;
  recordCampaignCompletion(campaignId: string, sessionToken: string, timeMinutes: number, rating?: number): Promise<void>;
  
  // Modmail
  getAllModmail(): Promise<Modmail[]>;
  getModmailBySession(sessionToken: string): Promise<Modmail[]>;
  getModmailByTicket(ticketId: string): Promise<Modmail | undefined>;
  createModmail(mail: InsertModmail): Promise<Modmail>;
  updateModmail(ticketId: string, updates: Partial<Modmail>): Promise<Modmail | undefined>;
  
  // Multiplayer Lobbies
  getAllLobbies(): Promise<MultiplayerLobby[]>;
  getActiveLobbies(): Promise<MultiplayerLobby[]>;
  getLobbyById(lobbyId: string): Promise<MultiplayerLobby | undefined>;
  createLobby(lobby: InsertMultiplayerLobby): Promise<MultiplayerLobby>;
  updateLobby(lobbyId: string, updates: Partial<MultiplayerLobby>): Promise<MultiplayerLobby | undefined>;
  joinLobby(lobbyId: string, player: { sessionToken: string; alias: string }): Promise<MultiplayerLobby | undefined>;
  leaveLobby(lobbyId: string, sessionToken: string): Promise<MultiplayerLobby | undefined>;
  deleteLobby(lobbyId: string): Promise<boolean>;

  // Business Projects
  getAllBusinessProjects(): Promise<BusinessProject[]>;
  getBusinessProjectById(id: number): Promise<BusinessProject | undefined>;
  createBusinessProject(project: InsertBusinessProject): Promise<BusinessProject>;
  updateBusinessProject(id: number, updates: Partial<BusinessProject>): Promise<BusinessProject | undefined>;
  deleteBusinessProject(id: number): Promise<boolean>;

  // Feedback Items
  getAllFeedbackItems(): Promise<FeedbackItem[]>;
  getFeedbackItemById(id: number): Promise<FeedbackItem | undefined>;
  createFeedbackItem(item: InsertFeedbackItem): Promise<FeedbackItem>;
  updateFeedbackItem(id: number, updates: Partial<FeedbackItem>): Promise<FeedbackItem | undefined>;
  deleteFeedbackItem(id: number): Promise<boolean>;
  voteFeedbackItem(id: number): Promise<FeedbackItem | undefined>;

  // Portfolio Entries
  getPortfolioEntriesBySession(sessionToken: string): Promise<PortfolioEntry[]>;
  getPortfolioEntryById(id: number): Promise<PortfolioEntry | undefined>;
  getPortfolioEntryByShareId(shareId: string): Promise<PortfolioEntry | undefined>;
  createPortfolioEntry(entry: InsertPortfolioEntry): Promise<PortfolioEntry>;
  updatePortfolioEntry(id: number, updates: Partial<PortfolioEntry>): Promise<PortfolioEntry | undefined>;
  deletePortfolioEntry(id: number): Promise<boolean>;
  getPublicPortfolioEntries(sessionToken: string): Promise<PortfolioEntry[]>;
}

// Admin configuration type (stored in memory/file, not DB)
export interface AdminConfig {
  agentConfig?: Record<string, {
    baseInstructions?: string;
    model?: string;
    temperature?: number;
    updatedAt?: string;
  }>;
  wandbConfig?: {
    enabled?: boolean;
    project?: string;
    entity?: string;
    apiKeySet?: boolean;
  };
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

  async getAdminPromptsByCategory(category: string): Promise<AdminPrompt[]> {
    return await db
      .select()
      .from(adminPrompts)
      .where(eq(adminPrompts.category, category));
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
        .values({ ...data, key } as InsertAdminPrompt)
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

  async getPublishedDesignerCampaigns(): Promise<DesignerCampaign[]> {
    return await db.select().from(designerCampaigns)
      .where(eq(designerCampaigns.isPublished, true))
      .orderBy(desc(designerCampaigns.updatedAt));
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

  // Agent Modules
  async getAllAgentModules(): Promise<AgentModule[]> {
    return await db.select().from(agentModules).orderBy(agentModules.sortOrder);
  }

  async getAgentModuleById(moduleId: string): Promise<AgentModule | undefined> {
    const [module] = await db.select().from(agentModules).where(eq(agentModules.moduleId, moduleId)).limit(1);
    return module;
  }

  async getActiveAgentModules(): Promise<AgentModule[]> {
    return await db.select().from(agentModules).where(eq(agentModules.isActive, true)).orderBy(agentModules.sortOrder);
  }

  async upsertAgentModule(moduleId: string, data: Partial<InsertAgentModule>): Promise<AgentModule> {
    const existing = await this.getAgentModuleById(moduleId);
    if (existing) {
      const [updated] = await db
        .update(agentModules)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(agentModules.moduleId, moduleId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(agentModules).values({ moduleId, ...data } as any).returning();
    return created;
  }

  async deleteAgentModule(moduleId: string): Promise<boolean> {
    await db.delete(agentModules).where(eq(agentModules.moduleId, moduleId));
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

  // Modmail Methods
  async getAllModmail(): Promise<Modmail[]> {
    return await db.select().from(modmail).orderBy(desc(modmail.createdAt)).limit(100);
  }

  async getModmailBySession(sessionToken: string): Promise<Modmail[]> {
    return await db
      .select()
      .from(modmail)
      .where(eq(modmail.sessionToken, sessionToken))
      .orderBy(desc(modmail.createdAt));
  }

  async getModmailByTicket(ticketId: string): Promise<Modmail | undefined> {
    const [mail] = await db
      .select()
      .from(modmail)
      .where(eq(modmail.ticketId, ticketId))
      .limit(1);
    return mail;
  }

  async createModmail(mail: InsertModmail): Promise<Modmail> {
    const [created] = await db.insert(modmail).values(mail).returning();
    return created;
  }

  async updateModmail(ticketId: string, updates: Partial<Modmail>): Promise<Modmail | undefined> {
    const [updated] = await db
      .update(modmail)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(modmail.ticketId, ticketId))
      .returning();
    return updated;
  }

  // Multiplayer Lobby Methods
  async getAllLobbies(): Promise<MultiplayerLobby[]> {
    return await db.select().from(multiplayerLobbies).orderBy(desc(multiplayerLobbies.createdAt));
  }

  async getActiveLobbies(): Promise<MultiplayerLobby[]> {
    return await db
      .select()
      .from(multiplayerLobbies)
      .where(or(
        eq(multiplayerLobbies.status, 'waiting'),
        eq(multiplayerLobbies.status, 'active')
      ))
      .orderBy(desc(multiplayerLobbies.createdAt));
  }

  async getLobbyById(lobbyId: string): Promise<MultiplayerLobby | undefined> {
    const [lobby] = await db
      .select()
      .from(multiplayerLobbies)
      .where(eq(multiplayerLobbies.lobbyId, lobbyId))
      .limit(1);
    return lobby;
  }

  async createLobby(lobby: InsertMultiplayerLobby): Promise<MultiplayerLobby> {
    const [created] = await db.insert(multiplayerLobbies).values(lobby).returning();
    return created;
  }

  async updateLobby(lobbyId: string, updates: Partial<MultiplayerLobby>): Promise<MultiplayerLobby | undefined> {
    const [updated] = await db
      .update(multiplayerLobbies)
      .set(updates)
      .where(eq(multiplayerLobbies.lobbyId, lobbyId))
      .returning();
    return updated;
  }

  async joinLobby(lobbyId: string, player: { sessionToken: string; alias: string }): Promise<MultiplayerLobby | undefined> {
    const lobby = await this.getLobbyById(lobbyId);
    if (!lobby) return undefined;
    
    const currentPlayers = (lobby.currentPlayers || []) as { sessionToken: string; alias: string; score: number }[];
    
    // Check if already in lobby
    if (currentPlayers.some(p => p.sessionToken === player.sessionToken)) {
      return lobby;
    }
    
    // Check max players
    if (currentPlayers.length >= lobby.maxPlayers) {
      return undefined;
    }
    
    const newPlayers = [...currentPlayers, { ...player, score: 0 }];
    return this.updateLobby(lobbyId, { currentPlayers: newPlayers });
  }

  async leaveLobby(lobbyId: string, sessionToken: string): Promise<MultiplayerLobby | undefined> {
    const lobby = await this.getLobbyById(lobbyId);
    if (!lobby) return undefined;
    
    const currentPlayers = (lobby.currentPlayers || []) as { sessionToken: string; alias: string; score: number }[];
    const newPlayers = currentPlayers.filter(p => p.sessionToken !== sessionToken);
    
    return this.updateLobby(lobbyId, { currentPlayers: newPlayers });
  }

  async deleteLobby(lobbyId: string): Promise<boolean> {
    const result = await db
      .delete(multiplayerLobbies)
      .where(eq(multiplayerLobbies.lobbyId, lobbyId));
    return true;
  }

  // Admin Configuration (in-memory with file persistence)
  private adminConfig: AdminConfig = {};
  private adminConfigLoaded = false;

  private async loadAdminConfig(): Promise<void> {
    if (this.adminConfigLoaded) return;
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile('.admin-config.json', 'utf-8');
      this.adminConfig = JSON.parse(data);
    } catch {
      this.adminConfig = {};
    }
    this.adminConfigLoaded = true;
  }

  private async saveAdminConfig(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      await fs.writeFile('.admin-config.json', JSON.stringify(this.adminConfig, null, 2));
    } catch (e) {
      console.error('Failed to save admin config:', e);
    }
  }

  async getAdminConfig(): Promise<AdminConfig | undefined> {
    await this.loadAdminConfig();
    return this.adminConfig;
  }

  async updateAdminConfig(updates: Partial<AdminConfig>): Promise<AdminConfig> {
    await this.loadAdminConfig();
    this.adminConfig = {
      ...this.adminConfig,
      ...updates,
      agentConfig: {
        ...this.adminConfig.agentConfig,
        ...updates.agentConfig,
      },
      wandbConfig: {
        ...this.adminConfig.wandbConfig,
        ...updates.wandbConfig,
      },
    };
    await this.saveAdminConfig();
    return this.adminConfig;
  }

  // Achievement Definitions
  async getAllAchievementDefinitions(): Promise<AchievementDefinition[]> {
    return await db.select().from(achievementDefinitions).orderBy(achievementDefinitions.sortOrder);
  }

  async getActiveAchievementDefinitions(): Promise<AchievementDefinition[]> {
    return await db.select().from(achievementDefinitions)
      .where(eq(achievementDefinitions.isActive, true))
      .orderBy(achievementDefinitions.sortOrder);
  }

  async getAchievementDefinitionById(achievementId: string): Promise<AchievementDefinition | undefined> {
    const [result] = await db.select().from(achievementDefinitions)
      .where(eq(achievementDefinitions.achievementId, achievementId))
      .limit(1);
    return result;
  }

  async upsertAchievementDefinition(achievementId: string, data: Partial<InsertAchievementDefinition>): Promise<AchievementDefinition> {
    const existing = await this.getAchievementDefinitionById(achievementId);
    if (existing) {
      const [updated] = await db.update(achievementDefinitions)
        .set(data)
        .where(eq(achievementDefinitions.achievementId, achievementId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(achievementDefinitions)
      .values({ ...data, achievementId } as any)
      .returning();
    return created;
  }

  async deleteAchievementDefinition(achievementId: string): Promise<boolean> {
    const result = await db.delete(achievementDefinitions)
      .where(eq(achievementDefinitions.achievementId, achievementId));
    return true;
  }

  // Game Events
  async logGameEvent(event: InsertGameEvent): Promise<GameEvent> {
    const [created] = await db.insert(gameEvents).values(event).returning();
    return created;
  }

  async getGameEventsBySession(sessionToken: string, limit = 50): Promise<GameEvent[]> {
    return await db.select().from(gameEvents)
      .where(eq(gameEvents.sessionToken, sessionToken))
      .orderBy(desc(gameEvents.timestamp))
      .limit(limit);
  }

  async getRecentGameEvents(limit = 100): Promise<GameEvent[]> {
    return await db.select().from(gameEvents)
      .orderBy(desc(gameEvents.timestamp))
      .limit(limit);
  }

  // XP and Leveling
  async awardXP(sessionToken: string, amount: number, reason: string): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
    const session = await this.getSessionByToken(sessionToken);
    if (!session) throw new Error('Session not found');

    const { getLevelForXP } = await import("@shared/schema");
    const oldLevel = session.level;
    const newXP = (session.xp || 0) + amount;
    const levelInfo = getLevelForXP(newXP);
    const leveledUp = levelInfo.level > oldLevel;

    await db.update(gameSessions)
      .set({ xp: newXP, level: levelInfo.level, lastActive: new Date() })
      .where(eq(gameSessions.sessionToken, sessionToken));

    await this.logGameEvent({
      sessionToken,
      eventType: 'xp_gained',
      eventData: { amount, reason, newTotal: newXP },
      xpAwarded: amount,
    });

    if (leveledUp) {
      await this.logGameEvent({
        sessionToken,
        eventType: 'level_up',
        eventData: { oldLevel, newLevel: levelInfo.level, title: levelInfo.title },
        xpAwarded: 0,
      });
    }

    return { newXP, newLevel: levelInfo.level, leveledUp };
  }

  // Leaderboard (Legacy - from gameEvents system)
  async getGameSessionLeaderboard(limit = 20): Promise<{ sessionToken: string; username: string; xp: number; level: number; clueCount: number; questCount: number }[]> {
    const sessions = await db.select().from(gameSessions)
      .orderBy(desc(gameSessions.xp))
      .limit(limit);

    return sessions.map(s => ({
      sessionToken: s.sessionToken,
      username: s.username,
      xp: s.xp || 0,
      level: s.level || 1,
      clueCount: s.collectedClues?.length || 0,
      questCount: s.completedQuests?.length || 0,
    }));
  }

  // Gameplay Analytics
  async getGameplayAnalytics(): Promise<{
    totalPlayers: number;
    activePlayers24h: number;
    activePlayers7d: number;
    avgCluesPerPlayer: number;
    avgQuestsPerPlayer: number;
    totalCampaignRuns: number;
    campaignCompletionRate: number;
    topCampaigns: { campaignId: string; runCount: number }[];
    recentEvents: GameEvent[];
  }> {
    const now = new Date();
    const h24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const d7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const allSessions = await db.select().from(gameSessions);
    const totalPlayers = allSessions.length;
    const activePlayers24h = allSessions.filter(s => s.lastActive >= h24Ago).length;
    const activePlayers7d = allSessions.filter(s => s.lastActive >= d7Ago).length;

    const totalClues = allSessions.reduce((sum, s) => sum + (s.collectedClues?.length || 0), 0);
    const totalQuests = allSessions.reduce((sum, s) => sum + (s.completedQuests?.length || 0), 0);
    const avgCluesPerPlayer = totalPlayers > 0 ? totalClues / totalPlayers : 0;
    const avgQuestsPerPlayer = totalPlayers > 0 ? totalQuests / totalPlayers : 0;

    const allRuns = await db.select().from(campaignRuns);
    const totalCampaignRuns = allRuns.length;
    const completedRuns = allRuns.filter(r => r.status === 'completed').length;
    const campaignCompletionRate = totalCampaignRuns > 0 ? completedRuns / totalCampaignRuns : 0;

    const campaignCounts: Record<string, number> = {};
    allRuns.forEach(r => {
      campaignCounts[r.campaignId] = (campaignCounts[r.campaignId] || 0) + 1;
    });
    const topCampaigns = Object.entries(campaignCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([campaignId, runCount]) => ({ campaignId, runCount }));

    const recentEvents = await this.getRecentGameEvents(20);

    return {
      totalPlayers,
      activePlayers24h,
      activePlayers7d,
      avgCluesPerPlayer: Math.round(avgCluesPerPlayer * 100) / 100,
      avgQuestsPerPlayer: Math.round(avgQuestsPerPlayer * 100) / 100,
      totalCampaignRuns,
      campaignCompletionRate: Math.round(campaignCompletionRate * 100) / 100,
      topCampaigns,
      recentEvents,
    };
  }

  // Quest Auto-Completion Check
  async checkAndCompleteQuests(sessionToken: string): Promise<{ newlyCompleted: string[]; xpAwarded: number }> {
    const session = await this.getSessionByToken(sessionToken);
    if (!session) return { newlyCompleted: [], xpAwarded: 0 };

    const allQuests = await this.getAllQuests();
    const playerClues = new Set(session.collectedClues || []);
    const alreadyCompleted = new Set(session.completedQuests || []);
    const newlyCompleted: string[] = [];
    let totalXP = 0;

    for (const quest of allQuests) {
      if (!quest.isActive) continue;
      if (alreadyCompleted.has(quest.id)) continue;

      const required = quest.requiredClues || [];
      if (required.length === 0) continue;

      const allCollected = required.every(clueId => playerClues.has(clueId));
      if (allCollected) {
        newlyCompleted.push(quest.id);
        totalXP += 200;

        await this.logGameEvent({
          sessionToken,
          eventType: 'quest_completed',
          eventData: { questId: quest.id, questName: quest.name },
          xpAwarded: 200,
        });
      }
    }

    if (newlyCompleted.length > 0) {
      const updatedQuests = [...(session.completedQuests || []), ...newlyCompleted];
      const updatedStats = {
        ...(session.stats || {}),
        missionsCompleted: ((session.stats as any)?.missionsCompleted || 0) + newlyCompleted.length,
      };

      await db.update(gameSessions)
        .set({
          completedQuests: updatedQuests,
          stats: updatedStats,
          lastActive: new Date()
        })
        .where(eq(gameSessions.sessionToken, sessionToken));

      if (totalXP > 0) {
        await this.awardXP(sessionToken, totalXP, `Completed ${newlyCompleted.length} quest(s)`);
      }
    }

    return { newlyCompleted, xpAwarded: totalXP };
  }

  // Player Progression
  async getPlayerProgression(sessionToken: string): Promise<PlayerProgression | undefined> {
    const [progression] = await db
      .select()
      .from(playerProgression)
      .where(eq(playerProgression.sessionToken, sessionToken))
      .limit(1);
    return progression;
  }

  async createPlayerProgression(progression: InsertPlayerProgression): Promise<PlayerProgression> {
    const [created] = await db.insert(playerProgression).values(progression).returning();
    return created;
  }

  async updatePlayerProgression(sessionToken: string, updates: Partial<PlayerProgression>): Promise<PlayerProgression | undefined> {
    const [updated] = await db
      .update(playerProgression)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(playerProgression.sessionToken, sessionToken))
      .returning();
    return updated;
  }

  async addXP(sessionToken: string, xp: number, source?: string): Promise<{ progression: PlayerProgression; leveledUp: boolean; newLevel?: number }> {
    // Get or create progression
    let prog = await this.getPlayerProgression(sessionToken);
    if (!prog) {
      prog = await this.createPlayerProgression({ sessionToken, xp: 0, totalXp: 0, level: 1 });
    }

    const newXP = (prog.xp || 0) + xp;
    const newTotalXP = (prog.totalXp || 0) + xp;
    const currentLevel = prog.level || 1;
    
    // Calculate level: 100 XP for level 1->2, then +100 per level (level 2->3 = 200, etc.)
    const xpForNextLevel = currentLevel * 100;
    let leveledUp = false;
    let newLevel = currentLevel;
    let remainingXP = newXP;

    if (remainingXP >= xpForNextLevel) {
      newLevel++;
      remainingXP -= xpForNextLevel;
      leveledUp = true;
    }

    const updated = await this.updatePlayerProgression(sessionToken, {
      xp: remainingXP,
      totalXp: newTotalXP,
      level: newLevel
    });

    return {
      progression: updated!,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined
    };
  }

  async addCurrency(sessionToken: string, amount: number): Promise<PlayerProgression | undefined> {
    const prog = await this.getPlayerProgression(sessionToken);
    if (!prog) return undefined;

    return await this.updatePlayerProgression(sessionToken, {
      currency: (prog.currency || 0) + amount
    });
  }

  async updateSkill(sessionToken: string, skill: 'osint' | 'network' | 'malware' | 'social', points: number): Promise<PlayerProgression | undefined> {
    const prog = await this.getPlayerProgression(sessionToken);
    if (!prog) return undefined;

    const skills = prog.skills || { osint: 0, network: 0, malware: 0, social: 0 };
    skills[skill] = (skills[skill] || 0) + points;

    return await this.updatePlayerProgression(sessionToken, { skills });
  }

  // Achievements
  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.isActive, true)).orderBy(achievements.sortOrder);
  }

  async getAchievementById(achievementId: string): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.achievementId, achievementId))
      .limit(1);
    return achievement;
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [created] = await db.insert(achievements).values(achievement).returning();
    return created;
  }

  async updateAchievement(achievementId: string, updates: Partial<Achievement>): Promise<Achievement | undefined> {
    const [updated] = await db
      .update(achievements)
      .set(updates)
      .where(eq(achievements.achievementId, achievementId))
      .returning();
    return updated;
  }

  async deleteAchievement(achievementId: string): Promise<boolean> {
    const result = await db.delete(achievements).where(eq(achievements.achievementId, achievementId));
    return true;
  }

  // Player Achievements
  async getPlayerAchievements(sessionToken: string): Promise<PlayerAchievement[]> {
    return await db
      .select()
      .from(playerAchievements)
      .where(eq(playerAchievements.sessionToken, sessionToken))
      .orderBy(desc(playerAchievements.unlockedAt));
  }

  async unlockAchievement(sessionToken: string, achievementId: string, metadata?: any): Promise<{ achievement: PlayerAchievement; rewards: { xp: number; currency: number; unlocks: string[] } }> {
    // Check if already unlocked
    const [existing] = await db
      .select()
      .from(playerAchievements)
      .where(
        and(
          eq(playerAchievements.sessionToken, sessionToken),
          eq(playerAchievements.achievementId, achievementId)
        )
      )
      .limit(1);

    if (existing) {
      const achievement = await this.getAchievementById(achievementId);
      return {
        achievement: existing,
        rewards: {
          xp: 0,
          currency: 0,
          unlocks: []
        }
      };
    }

    // Get achievement details
    const achievementDef = await this.getAchievementById(achievementId);
    if (!achievementDef) {
      throw new Error(`Achievement ${achievementId} not found`);
    }

    // Create unlock record
    const [unlocked] = await db
      .insert(playerAchievements)
      .values({
        sessionToken,
        achievementId,
        progress: 100,
        metadata: metadata || {}
      })
      .returning();

    // Award rewards
    if (achievementDef.xpReward) {
      await this.addXP(sessionToken, achievementDef.xpReward, `achievement:${achievementId}`);
    }
    if (achievementDef.currencyReward) {
      await this.addCurrency(sessionToken, achievementDef.currencyReward);
    }

    // Handle unlocks
    const unlocks = achievementDef.unlocks || [];
    if (unlocks.length > 0) {
      const prog = await this.getPlayerProgression(sessionToken);
      if (prog) {
        const unlockedTools = [...(prog.unlockedTools || []), ...unlocks.filter(u => u.startsWith('tool:'))];
        const unlockedCampaigns = [...(prog.unlockedCampaigns || []), ...unlocks.filter(u => u.startsWith('campaign:'))];
        await this.updatePlayerProgression(sessionToken, { unlockedTools, unlockedCampaigns });
      }
    }

    return {
      achievement: unlocked,
      rewards: {
        xp: achievementDef.xpReward || 0,
        currency: achievementDef.currencyReward || 0,
        unlocks
      }
    };
  }

  async checkAchievementProgress(sessionToken: string, achievementId: string): Promise<{ unlocked: boolean; progress: number }> {
    const [unlocked] = await db
      .select()
      .from(playerAchievements)
      .where(
        and(
          eq(playerAchievements.sessionToken, sessionToken),
          eq(playerAchievements.achievementId, achievementId)
        )
      )
      .limit(1);

    return {
      unlocked: !!unlocked,
      progress: unlocked ? (unlocked.progress || 100) : 0
    };
  }

  // Leaderboards
  async getLeaderboard(type: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    return await db
      .select()
      .from(leaderboardEntries)
      .where(eq(leaderboardEntries.leaderboardType, type))
      .orderBy(desc(leaderboardEntries.score))
      .limit(limit);
  }

  async updateLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    // Check if entry exists
    const [existing] = await db
      .select()
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.sessionToken, entry.sessionToken),
          eq(leaderboardEntries.leaderboardType, entry.leaderboardType)
        )
      )
      .limit(1);

    if (existing) {
      // Update if new score is higher
      if (entry.score > existing.score) {
        const [updated] = await db
          .update(leaderboardEntries)
          .set({ ...entry, updatedAt: new Date() })
          .where(eq(leaderboardEntries.id, existing.id))
          .returning();
        return updated;
      }
      return existing;
    }

    // Create new entry
    const [created] = await db.insert(leaderboardEntries).values(entry).returning();
    return created;
  }

  async getPlayerRank(sessionToken: string, type: string): Promise<{ rank: number; entry: LeaderboardEntry } | null> {
    const entries = await this.getLeaderboard(type, 1000);
    const index = entries.findIndex(e => e.sessionToken === sessionToken);
    
    if (index === -1) return null;

    return {
      rank: index + 1,
      entry: entries[index]
    };
  }

  async recalculateLeaderboard(type: string): Promise<void> {
    // Recalculate ranks based on scores
    const entries = await this.getLeaderboard(type, 1000);
    
    for (let i = 0; i < entries.length; i++) {
      await db
        .update(leaderboardEntries)
        .set({ rank: i + 1 })
        .where(eq(leaderboardEntries.id, entries[i].id));
    }
  }

  // Daily Challenges
  async getDailyChallenges(includeExpired: boolean = false): Promise<DailyChallenge[]> {
    if (includeExpired) {
      return await db
        .select()
        .from(dailyChallenges)
        .where(eq(dailyChallenges.isActive, true))
        .orderBy(desc(dailyChallenges.challengeDate));
    }

    return await db
      .select()
      .from(dailyChallenges)
      .where(
        and(
          eq(dailyChallenges.isActive, true),
          gte(dailyChallenges.expiresAt, new Date())
        )
      )
      .orderBy(desc(dailyChallenges.challengeDate));
  }

  async getTodayChallenge(): Promise<DailyChallenge | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(
        and(
          eq(dailyChallenges.isActive, true),
          gte(dailyChallenges.challengeDate, today),
          between(dailyChallenges.challengeDate, today, tomorrow)
        )
      )
      .limit(1);
    return challenge;
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const [created] = await db.insert(dailyChallenges).values(challenge).returning();
    return created;
  }

  async getChallengeCompletions(sessionToken: string): Promise<ChallengeCompletion[]> {
    return await db
      .select()
      .from(challengeCompletions)
      .where(eq(challengeCompletions.sessionToken, sessionToken))
      .orderBy(desc(challengeCompletions.completedAt));
  }

  async completeChallenge(completion: InsertChallengeCompletion): Promise<{ completion: ChallengeCompletion; rewards: { xp: number; currency: number } }> {
    // Get challenge details
    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.challengeId, completion.challengeId))
      .limit(1);

    if (!challenge) {
      throw new Error(`Challenge ${completion.challengeId} not found`);
    }

    // Record completion
    const [completed] = await db.insert(challengeCompletions).values(completion).returning();

    // Award rewards
    await this.addXP(completion.sessionToken, challenge.xpReward, `challenge:${completion.challengeId}`);
    await this.addCurrency(completion.sessionToken, challenge.currencyReward);

    return {
      completion: completed,
      rewards: {
        xp: challenge.xpReward,
        currency: challenge.currencyReward
      }
    };
  }

  async hasChallengeCompleted(sessionToken: string, challengeId: string): Promise<boolean> {
    const [completion] = await db
      .select()
      .from(challengeCompletions)
      .where(
        and(
          eq(challengeCompletions.sessionToken, sessionToken),
          eq(challengeCompletions.challengeId, challengeId)
        )
      )
      .limit(1);
    return !!completion;
  }

  // Campaign Stats
  async getCampaignStats(campaignId: string): Promise<CampaignStats | undefined> {
    const [stats] = await db
      .select()
      .from(campaignStats)
      .where(eq(campaignStats.campaignId, campaignId))
      .limit(1);
    return stats;
  }

  async updateCampaignStats(campaignId: string, updates: Partial<CampaignStats>): Promise<CampaignStats> {
    // Check if stats exist
    const existing = await this.getCampaignStats(campaignId);
    
    if (existing) {
      const [updated] = await db
        .update(campaignStats)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(campaignStats.campaignId, campaignId))
        .returning();
      return updated;
    }

    // Create new stats
    const [created] = await db
      .insert(campaignStats)
      .values({ campaignId, ...updates })
      .returning();
    return created;
  }

  async recordCampaignAttempt(campaignId: string, sessionToken: string): Promise<void> {
    const stats = await this.getCampaignStats(campaignId) || {
      campaignId,
      totalAttempts: 0,
      totalCompletions: 0,
      uniquePlayers: 0,
      averageCompletionTime: 0,
      averageRating: 0,
      totalRatings: 0,
      completionRate: 0,
      dropOffPoints: []
    };

    await this.updateCampaignStats(campaignId, {
      totalAttempts: (stats.totalAttempts || 0) + 1
    });
  }

  async recordCampaignCompletion(campaignId: string, sessionToken: string, timeMinutes: number, rating?: number): Promise<void> {
    const stats = await this.getCampaignStats(campaignId) || {
      campaignId,
      totalAttempts: 0,
      totalCompletions: 0,
      uniquePlayers: 0,
      averageCompletionTime: 0,
      averageRating: 0,
      totalRatings: 0,
      completionRate: 0,
      fastestCompletionTime: undefined,
      dropOffPoints: []
    };

    const totalCompletions = (stats.totalCompletions || 0) + 1;
    const totalAttempts = stats.totalAttempts || 1;
    const avgTime = stats.averageCompletionTime || 0;
    const newAvgTime = Math.round((avgTime * (totalCompletions - 1) + timeMinutes) / totalCompletions);
    const fastestTime = stats.fastestCompletionTime ? Math.min(stats.fastestCompletionTime, timeMinutes) : timeMinutes;

    const updates: Partial<CampaignStats> = {
      totalCompletions,
      averageCompletionTime: newAvgTime,
      fastestCompletionTime: fastestTime,
      completionRate: Math.round((totalCompletions / totalAttempts) * 100)
    };

    if (rating) {
      const totalRatings = (stats.totalRatings || 0) + 1;
      const avgRating = stats.averageRating || 0;
      const newAvgRating = Math.round((avgRating * (totalRatings - 1) + rating) / totalRatings);
      updates.averageRating = newAvgRating;
      updates.totalRatings = totalRatings;
    }

    await this.updateCampaignStats(campaignId, updates);

    // Update leaderboard for campaign speed
    await this.updateLeaderboardEntry({
      sessionToken,
      username: 'Player', // Should be fetched from session
      leaderboardType: `campaign_speed_${campaignId}`,
      score: timeMinutes * -1, // Negative so faster times rank higher
      metadata: { campaignId, completionTime: timeMinutes }
    });
  }

  // Business Projects
  async getAllBusinessProjects(): Promise<BusinessProject[]> {
    return db.select().from(businessProjects).orderBy(desc(businessProjects.updatedAt));
  }

  async getBusinessProjectById(id: number): Promise<BusinessProject | undefined> {
    const [project] = await db.select().from(businessProjects).where(eq(businessProjects.id, id));
    return project;
  }

  async createBusinessProject(project: InsertBusinessProject): Promise<BusinessProject> {
    const [created] = await db.insert(businessProjects).values(project).returning();
    return created;
  }

  async updateBusinessProject(id: number, updates: Partial<BusinessProject>): Promise<BusinessProject | undefined> {
    const [updated] = await db.update(businessProjects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businessProjects.id, id))
      .returning();
    return updated;
  }

  async deleteBusinessProject(id: number): Promise<boolean> {
    const result = await db.delete(businessProjects).where(eq(businessProjects.id, id)).returning();
    return result.length > 0;
  }

  // Feedback Items
  async getAllFeedbackItems(): Promise<FeedbackItem[]> {
    return await db.select().from(feedbackItems).orderBy(desc(feedbackItems.createdAt)).limit(200);
  }

  async getFeedbackItemById(id: number): Promise<FeedbackItem | undefined> {
    const [item] = await db.select().from(feedbackItems).where(eq(feedbackItems.id, id)).limit(1);
    return item;
  }

  async createFeedbackItem(item: InsertFeedbackItem): Promise<FeedbackItem> {
    const [created] = await db.insert(feedbackItems).values(item).returning();
    return created;
  }

  async updateFeedbackItem(id: number, updates: Partial<FeedbackItem>): Promise<FeedbackItem | undefined> {
    const [updated] = await db.update(feedbackItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(feedbackItems.id, id))
      .returning();
    return updated;
  }

  async deleteFeedbackItem(id: number): Promise<boolean> {
    const result = await db.delete(feedbackItems).where(eq(feedbackItems.id, id)).returning();
    return result.length > 0;
  }

  async voteFeedbackItem(id: number): Promise<FeedbackItem | undefined> {
    const [updated] = await db.update(feedbackItems)
      .set({ votes: sql`${feedbackItems.votes} + 1`, updatedAt: new Date() })
      .where(eq(feedbackItems.id, id))
      .returning();
    return updated;
  }

  async getPortfolioEntriesBySession(sessionToken: string): Promise<PortfolioEntry[]> {
    return db.select().from(portfolioEntries)
      .where(eq(portfolioEntries.sessionToken, sessionToken))
      .orderBy(desc(portfolioEntries.updatedAt));
  }

  async getPortfolioEntryById(id: number): Promise<PortfolioEntry | undefined> {
    const [entry] = await db.select().from(portfolioEntries).where(eq(portfolioEntries.id, id));
    return entry;
  }

  async getPortfolioEntryByShareId(shareId: string): Promise<PortfolioEntry | undefined> {
    const [entry] = await db.select().from(portfolioEntries).where(eq(portfolioEntries.shareId, shareId));
    return entry;
  }

  async createPortfolioEntry(entry: InsertPortfolioEntry): Promise<PortfolioEntry> {
    const [created] = await db.insert(portfolioEntries).values(entry).returning();
    return created;
  }

  async updatePortfolioEntry(id: number, updates: Partial<PortfolioEntry>): Promise<PortfolioEntry | undefined> {
    const [updated] = await db.update(portfolioEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolioEntries.id, id))
      .returning();
    return updated;
  }

  async deletePortfolioEntry(id: number): Promise<boolean> {
    const result = await db.delete(portfolioEntries).where(eq(portfolioEntries.id, id)).returning();
    return result.length > 0;
  }

  async getPublicPortfolioEntries(sessionToken: string): Promise<PortfolioEntry[]> {
    return db.select().from(portfolioEntries)
      .where(and(
        eq(portfolioEntries.sessionToken, sessionToken),
        eq(portfolioEntries.visibility, "public")
      ))
      .orderBy(desc(portfolioEntries.featured), desc(portfolioEntries.updatedAt));
  }
}

export const storage = new DatabaseStorage();
