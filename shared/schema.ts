import { pgTable, text, integer, timestamp, boolean, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Game Sessions - tracks player progress
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  username: text("username").notNull().default("Guest"),
  collectedClues: jsonb("collected_clues").$type<string[]>().notNull().default([]),
  completedQuests: jsonb("completed_quests").$type<string[]>().notNull().default([]),
  discoveries: jsonb("discoveries").$type<Record<string, any>>().notNull().default({}),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Clues - available clues in the game
export const clues = pgTable("clues", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  location: text("location").notNull(), // where it's found
  difficulty: integer("difficulty").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
});

// Quests - available quests/achievements
export const quests = pgTable("quests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  requiredClues: jsonb("required_clues").$type<string[]>().notNull().default([]),
  reward: text("reward"),
  unlocks: text("unlocks"), // What route/feature this unlocks
  isActive: boolean("is_active").notNull().default(true),
});

// Terminal Commands Log - track what users try
export const commandLogs = pgTable("command_logs", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  command: text("command").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Insert Schemas
export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export const insertClueSchema = createInsertSchema(clues);
export const insertQuestSchema = createInsertSchema(quests);
export const insertCommandLogSchema = createInsertSchema(commandLogs).omit({
  id: true,
  timestamp: true,
});

// Select Types
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type Clue = typeof clues.$inferSelect;
export type InsertClue = z.infer<typeof insertClueSchema>;
export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type CommandLog = typeof commandLogs.$inferSelect;
export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;
