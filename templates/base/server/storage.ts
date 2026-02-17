import { db } from "./db";
import { gameSessions, clues, quests, commandLogs } from "@shared/schema";
import type { GameSession, InsertGameSession, Clue, Quest, CommandLog, InsertCommandLog } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getSession(sessionToken: string): Promise<GameSession | undefined>;
  createSession(data: InsertGameSession): Promise<GameSession>;
  updateSession(sessionToken: string, data: Partial<GameSession>): Promise<GameSession | undefined>;
  getClues(): Promise<Clue[]>;
  getQuests(): Promise<Quest[]>;
  logCommand(data: InsertCommandLog): Promise<CommandLog>;
}

export const storage: IStorage = {
  async getSession(sessionToken: string) {
    const [session] = await db.select().from(gameSessions).where(eq(gameSessions.sessionToken, sessionToken));
    return session;
  },

  async createSession(data: InsertGameSession) {
    const [session] = await db.insert(gameSessions).values(data).returning();
    return session;
  },

  async updateSession(sessionToken: string, data: Partial<GameSession>) {
    const [session] = await db.update(gameSessions).set({ ...data, lastActive: new Date() }).where(eq(gameSessions.sessionToken, sessionToken)).returning();
    return session;
  },

  async getClues() {
    return db.select().from(clues).where(eq(clues.isActive, true));
  },

  async getQuests() {
    return db.select().from(quests).where(eq(quests.isActive, true));
  },

  async logCommand(data: InsertCommandLog) {
    const [log] = await db.insert(commandLogs).values(data).returning();
    return log;
  },
};
