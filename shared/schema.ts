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

// Bug Bounty Sources - tracks bug bounty programs and feeds
export const bountyFeeds = pgTable("bounty_feeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  source: text("source").notNull(), // RSS URL or source identifier
  feedType: text("feed_type").notNull(), // 'rss', 'api', 'manual'
  category: text("category").notNull(), // 'bug_bounty', 'vulnerability', 'cybercrime', 'ioc'
  isActive: boolean("is_active").notNull().default(true),
  lastFetched: timestamp("last_fetched"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Bounty Entries - individual bounty listings
export const bountyEntries = pgTable("bounty_entries", {
  id: serial("id").primaryKey(),
  feedId: integer("feed_id"),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  reward: text("reward"), // e.g., "$500-$5000", "Up to $10,000"
  severity: text("severity"), // critical, high, medium, low
  category: text("category"), // web, mobile, api, infrastructure
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  platform: text("platform"), // hackerone, bugcrowd, immunefi, etc.
  deadline: timestamp("deadline"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// IOC Database - Indicators of Compromise
export const iocEntries = pgTable("ioc_entries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // ip, domain, hash, url, email
  value: text("value").notNull(),
  source: text("source").notNull(),
  confidence: integer("confidence").notNull().default(50), // 0-100
  threatType: text("threat_type"), // malware, phishing, c2, apt
  description: text("description"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  firstSeen: timestamp("first_seen").notNull().defaultNow(),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
});

// Dossiers - user-generated threat hunting reports
export const dossiers = pgTable("dossiers", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  targetInfo: jsonb("target_info").$type<Record<string, any>>().notNull().default({}),
  iocs: jsonb("iocs").$type<string[]>().notNull().default([]),
  findings: jsonb("findings").$type<any[]>().notNull().default([]),
  tools: jsonb("tools").$type<string[]>().notNull().default([]),
  severity: text("severity").notNull().default("medium"),
  status: text("status").notNull().default("draft"), // draft, submitted, accepted, rejected
  bountyAmount: text("bounty_amount"),
  reportTemplate: text("report_template"), // markdown template
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Learning Paths - structured learning objectives
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // threat_hunting, pentesting, osint, forensics
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  tools: jsonb("tools").$type<string[]>().notNull().default([]),
  objectives: jsonb("objectives").$type<any[]>().notNull().default([]),
  resources: jsonb("resources").$type<any[]>().notNull().default([]),
  estimatedTime: text("estimated_time"),
  isActive: boolean("is_active").notNull().default(true),
});

// Insert Schemas for new tables
export const insertBountyFeedSchema = createInsertSchema(bountyFeeds).omit({
  id: true,
  createdAt: true,
});
export const insertBountyEntrySchema = createInsertSchema(bountyEntries).omit({
  id: true,
  createdAt: true,
});
export const insertIocEntrySchema = createInsertSchema(iocEntries).omit({
  id: true,
  firstSeen: true,
  lastSeen: true,
});
export const insertDossierSchema = createInsertSchema(dossiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
});

// Select Types for new tables
export type BountyFeed = typeof bountyFeeds.$inferSelect;
export type InsertBountyFeed = z.infer<typeof insertBountyFeedSchema>;
export type BountyEntry = typeof bountyEntries.$inferSelect;
export type InsertBountyEntry = z.infer<typeof insertBountyEntrySchema>;
export type IocEntry = typeof iocEntries.$inferSelect;
export type InsertIocEntry = z.infer<typeof insertIocEntrySchema>;
export type Dossier = typeof dossiers.$inferSelect;
export type InsertDossier = z.infer<typeof insertDossierSchema>;
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;

// Export auth and chat models
export * from "./models/auth";
export * from "./models/chat";
