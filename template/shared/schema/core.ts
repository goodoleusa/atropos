// TEMPLATE: Core Schema — sessions, commands, clues, quests
// These are the foundational tables every project needs.
// Customize fields to match your domain (e.g., rename "clues" to "items").

import { pgTable, text, integer, timestamp, boolean, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// TEMPLATE: User sessions — tracks player/user progress
// Rename fields to match your domain. Keep sessionToken for anonymous usage.
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  username: text("username").notNull().default("Guest"),
  // TEMPLATE: Add your own session-scoped collections here
  collectedClues: jsonb("collected_clues").$type<string[]>().notNull().default([]),
  completedQuests: jsonb("completed_quests").$type<string[]>().notNull().default([]),
  discoveries: jsonb("discoveries").$type<Record<string, any>>().notNull().default({}),
  settings: jsonb("settings").$type<Record<string, any>>().notNull().default({}),
  progress: jsonb("progress").$type<Record<string, any>>().notNull().default({}),
  // TEMPLATE: Progression fields — remove if not using gamification
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  achievements: jsonb("achievements").$type<string[]>().notNull().default([]),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// TEMPLATE: Collectible items — rename to match your domain
export const clues = pgTable("clues", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  location: text("location").notNull(),
  difficulty: integer("difficulty").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
});

// TEMPLATE: Objectives/quests — rename to match your domain
export const quests = pgTable("quests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  requiredClues: jsonb("required_clues").$type<string[]>().notNull().default([]),
  reward: text("reward"),
  unlocks: text("unlocks"),
  isActive: boolean("is_active").notNull().default(true),
});

// TEMPLATE: Action/command logs — tracks user actions for analytics
export const commandLogs = pgTable("command_logs", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  command: text("command").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// --- Insert Schemas ---
export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true, createdAt: true, lastActive: true,
});
export const insertClueSchema = createInsertSchema(clues);
export const insertQuestSchema = createInsertSchema(quests);
export const insertCommandLogSchema = createInsertSchema(commandLogs).omit({
  id: true, timestamp: true,
});

// --- Types ---
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type Clue = typeof clues.$inferSelect;
export type InsertClue = z.infer<typeof insertClueSchema>;
export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type CommandLog = typeof commandLogs.$inferSelect;
export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;
