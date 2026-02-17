import { pgTable, text, integer, timestamp, boolean, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  username: text("username").notNull().default("Guest"),
  collectedClues: jsonb("collected_clues").$type<string[]>().notNull().default([]),
  completedQuests: jsonb("completed_quests").$type<string[]>().notNull().default([]),
  discoveries: jsonb("discoveries").$type<Record<string, any>>().notNull().default({}),
  settings: jsonb("settings").$type<Record<string, any>>().notNull().default({}),
  progress: jsonb("progress").$type<Record<string, any>>().notNull().default({}),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  achievements: jsonb("achievements").$type<string[]>().notNull().default([]),
  stats: jsonb("stats").$type<{
    commandsRun: number;
    campaignsStarted: number;
    campaignsCompleted: number;
    cluesFound: number;
    missionsCompleted: number;
    totalPlayTimeMinutes: number;
    longestStreak: number;
    currentStreak: number;
    lastPlayDate: string | null;
  }>().notNull().default({
    commandsRun: 0,
    campaignsStarted: 0,
    campaignsCompleted: 0,
    cluesFound: 0,
    missionsCompleted: 0,
    totalPlayTimeMinutes: 0,
    longestStreak: 0,
    currentStreak: 0,
    lastPlayDate: null
  }),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clues = pgTable("clues", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  location: text("location").notNull(),
  difficulty: integer("difficulty").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
});

export const quests = pgTable("quests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  requiredClues: jsonb("required_clues").$type<string[]>().notNull().default([]),
  reward: text("reward"),
  unlocks: text("unlocks"),
  isActive: boolean("is_active").notNull().default(true),
});

export const commandLogs = pgTable("command_logs", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  command: text("command").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export const insertCommandLogSchema = createInsertSchema(commandLogs).omit({
  id: true,
  timestamp: true,
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type Clue = typeof clues.$inferSelect;
export type InsertClue = z.infer<ReturnType<typeof createInsertSchema<typeof clues>>>;
export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<ReturnType<typeof createInsertSchema<typeof quests>>>;
export type CommandLog = typeof commandLogs.$inferSelect;
export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;
