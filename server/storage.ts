import { db } from "./db";
import { 
  gameSessions, 
  clues, 
  quests, 
  commandLogs,
  behavioralProfiles,
  type GameSession, 
  type InsertGameSession,
  type Clue,
  type InsertClue,
  type Quest,
  type InsertQuest,
  type CommandLog,
  type InsertCommandLog,
  type BehavioralProfile,
  type InsertBehavioralProfile
} from "@shared/schema";
import { eq, desc, sql, count, gte } from "drizzle-orm";

export interface IStorage {
  // Game Sessions
  getSessionByToken(token: string): Promise<GameSession | undefined>;
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
}

export const storage = new DatabaseStorage();
