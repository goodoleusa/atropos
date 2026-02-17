// TEMPLATE: Progression Storage — achievements, challenges, events
// Remove this file if not using gamification features.

import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import {
  achievementDefinitions, dailyChallenges, gameEvents,
  type AchievementDefinition, type InsertAchievementDefinition,
  type DailyChallenge, type InsertDailyChallenge,
  type GameEvent, type InsertGameEvent,
} from "../../shared/schema";

export class ProgressionStorage {
  // --- Achievements ---
  async getAllAchievements(): Promise<AchievementDefinition[]> {
    return db.select().from(achievementDefinitions);
  }

  async createAchievement(data: InsertAchievementDefinition): Promise<AchievementDefinition> {
    const [created] = await db.insert(achievementDefinitions).values(data).returning();
    return created;
  }

  // --- Daily Challenges ---
  async getActiveChallenges(): Promise<DailyChallenge[]> {
    return db.select().from(dailyChallenges).orderBy(desc(dailyChallenges.createdAt)).limit(10);
  }

  async createChallenge(data: InsertDailyChallenge): Promise<DailyChallenge> {
    const [created] = await db.insert(dailyChallenges).values(data).returning();
    return created;
  }

  // --- Game Events ---
  async logEvent(data: InsertGameEvent): Promise<GameEvent> {
    const [created] = await db.insert(gameEvents).values(data).returning();
    return created;
  }

  async getEvents(sessionToken: string, limit = 50): Promise<GameEvent[]> {
    return db.select().from(gameEvents)
      .where(eq(gameEvents.sessionToken, sessionToken))
      .orderBy(desc(gameEvents.timestamp))
      .limit(limit);
  }
}
