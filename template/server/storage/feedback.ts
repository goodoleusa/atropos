// TEMPLATE: Feedback Storage — agent-reported items, behavioral profiles
// Handles the auto-feedback collection pipeline.

import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import {
  feedbackItems, behavioralProfiles,
  type FeedbackItem, type InsertFeedbackItem,
  type BehavioralProfile, type InsertBehavioralProfile,
} from "../../shared/schema";

export class FeedbackStorage {
  // --- Feedback Items ---
  async getAll(): Promise<FeedbackItem[]> {
    return db.select().from(feedbackItems).orderBy(desc(feedbackItems.createdAt)).limit(200);
  }

  async getById(id: number): Promise<FeedbackItem | undefined> {
    const [item] = await db.select().from(feedbackItems).where(eq(feedbackItems.id, id)).limit(1);
    return item;
  }

  async create(data: InsertFeedbackItem): Promise<FeedbackItem> {
    const [created] = await db.insert(feedbackItems).values(data).returning();
    return created;
  }

  async update(id: number, updates: Partial<FeedbackItem>): Promise<FeedbackItem | undefined> {
    const [updated] = await db.update(feedbackItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(feedbackItems.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(feedbackItems).where(eq(feedbackItems.id, id)).returning();
    return result.length > 0;
  }

  async vote(id: number): Promise<FeedbackItem | undefined> {
    const [updated] = await db.update(feedbackItems)
      .set({ votes: sql`${feedbackItems.votes} + 1`, updatedAt: new Date() })
      .where(eq(feedbackItems.id, id))
      .returning();
    return updated;
  }

  // --- Behavioral Profiles ---
  async logBehavior(data: InsertBehavioralProfile): Promise<BehavioralProfile> {
    const [created] = await db.insert(behavioralProfiles).values(data).returning();
    return created;
  }

  async getBehaviors(sessionToken: string): Promise<BehavioralProfile[]> {
    return db.select().from(behavioralProfiles)
      .where(eq(behavioralProfiles.sessionToken, sessionToken))
      .orderBy(desc(behavioralProfiles.timestamp))
      .limit(100);
  }
}
