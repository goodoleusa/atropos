// TEMPLATE: Core Storage — sessions, clues, quests, commands
// Handles the foundational CRUD operations.
// Each method is focused and testable independently.

import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import {
  gameSessions, clues, quests, commandLogs,
  type GameSession, type InsertGameSession,
  type Clue, type InsertClue,
  type Quest, type InsertQuest,
  type CommandLog, type InsertCommandLog,
} from "../../shared/schema";

export class CoreStorage {
  // --- Sessions ---
  async getSession(token: string): Promise<GameSession | undefined> {
    const [session] = await db.select().from(gameSessions)
      .where(eq(gameSessions.sessionToken, token)).limit(1);
    return session;
  }

  async createSession(data: InsertGameSession): Promise<GameSession> {
    const [created] = await db.insert(gameSessions).values(data).returning();
    return created;
  }

  async updateSession(token: string, updates: Partial<GameSession>): Promise<GameSession | undefined> {
    const [updated] = await db.update(gameSessions)
      .set({ ...updates, lastActive: new Date() })
      .where(eq(gameSessions.sessionToken, token))
      .returning();
    return updated;
  }

  async getAllSessions(): Promise<GameSession[]> {
    return db.select().from(gameSessions).orderBy(desc(gameSessions.lastActive)).limit(100);
  }

  // --- Clues ---
  async getAllClues(): Promise<Clue[]> {
    return db.select().from(clues);
  }

  async getClue(id: string): Promise<Clue | undefined> {
    const [clue] = await db.select().from(clues).where(eq(clues.id, id)).limit(1);
    return clue;
  }

  async createClue(data: InsertClue): Promise<Clue> {
    const [created] = await db.insert(clues).values(data).returning();
    return created;
  }

  // --- Quests ---
  async getAllQuests(): Promise<Quest[]> {
    return db.select().from(quests);
  }

  async createQuest(data: InsertQuest): Promise<Quest> {
    const [created] = await db.insert(quests).values(data).returning();
    return created;
  }

  // --- Command Logs ---
  async logCommand(data: InsertCommandLog): Promise<CommandLog> {
    const [created] = await db.insert(commandLogs).values(data).returning();
    return created;
  }

  async getCommandHistory(token: string, limit = 50): Promise<CommandLog[]> {
    return db.select().from(commandLogs)
      .where(eq(commandLogs.sessionToken, token))
      .orderBy(desc(commandLogs.timestamp))
      .limit(limit);
  }
}
