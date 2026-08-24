// TEMPLATE: Progression & Gamification Schema
// Handles XP, achievements, leaderboards, daily challenges.
// Remove this file entirely if your project doesn't use gamification.

import { pgTable, text, integer, timestamp, boolean, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// TEMPLATE: Achievement definitions
export const achievementDefinitions = pgTable("achievement_definitions", {
  id: serial("id").primaryKey(),
  achievementId: text("achievement_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default(""),
  category: text("category").notNull().default("general"),
  tier: text("tier").notNull().default("common"), // common, rare, epic, legendary
  // TEMPLATE: Customize unlock conditions for your domain
  condition: jsonb("condition").$type<{
    type: string;
    target: number;
    field?: string;
  }>().notNull().default({ type: "manual", target: 1 }),
  xpReward: integer("xp_reward").notNull().default(50),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// TEMPLATE: Daily/recurring challenges
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  challengeId: text("challenge_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // daily, weekly, special
  condition: jsonb("condition").$type<Record<string, any>>().notNull().default({}),
  xpReward: integer("xp_reward").notNull().default(100),
  activeFrom: timestamp("active_from").notNull().defaultNow(),
  activeUntil: timestamp("active_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// TEMPLATE: Event log for all progression-relevant actions
export const gameEvents = pgTable("game_events", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data").$type<Record<string, any>>().notNull().default({}),
  xpAwarded: integer("xp_awarded").notNull().default(0),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// --- Insert Schemas ---
export const insertAchievementDefinitionSchema = createInsertSchema(achievementDefinitions).omit({
  id: true, createdAt: true,
});
export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true, createdAt: true,
});
export const insertGameEventSchema = createInsertSchema(gameEvents).omit({
  id: true, timestamp: true,
});

// --- Types ---
export type AchievementDefinition = typeof achievementDefinitions.$inferSelect;
export type InsertAchievementDefinition = z.infer<typeof insertAchievementDefinitionSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type GameEvent = typeof gameEvents.$inferSelect;
export type InsertGameEvent = z.infer<typeof insertGameEventSchema>;
