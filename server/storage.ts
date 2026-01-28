import { db } from "./db";
import { 
  gameSessions, 
  clues, 
  quests, 
  commandLogs,
  type GameSession, 
  type InsertGameSession,
  type Clue,
  type InsertClue,
  type Quest,
  type InsertQuest,
  type CommandLog,
  type InsertCommandLog
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Game Sessions
  getSessionByToken(token: string): Promise<GameSession | undefined>;
  createSession(session: InsertGameSession): Promise<GameSession>;
  updateSession(token: string, updates: Partial<GameSession>): Promise<GameSession | undefined>;
  
  // Clues
  getAllClues(): Promise<Clue[]>;
  getClueById(id: string): Promise<Clue | undefined>;
  createClue(clue: InsertClue): Promise<Clue>;
  
  // Quests
  getAllQuests(): Promise<Quest[]>;
  getQuestById(id: string): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  
  // Command Logs
  logCommand(log: InsertCommandLog): Promise<CommandLog>;
  getCommandHistory(sessionToken: string, limit?: number): Promise<CommandLog[]>;
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
}

export const storage = new DatabaseStorage();
