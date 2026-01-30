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

// Behavioral Profiles - tracks user patterns and trends
export const behavioralProfiles = pgTable("behavioral_profiles", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  actionType: text("action_type").notNull(), // 'command', 'navigation', 'clue_discovery', 'agent_interaction'
  category: text("category").notNull(), // 'aggressive', 'cautious', 'curious', 'analytical'
  intensity: integer("intensity").notNull().default(1),
  metadata: jsonb("metadata").$type<Record<string, any>>().notNull().default({}),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertBehavioralProfileSchema = createInsertSchema(behavioralProfiles).omit({
  id: true,
  timestamp: true,
});

export type BehavioralProfile = typeof behavioralProfiles.$inferSelect;
export type InsertBehavioralProfile = z.infer<typeof insertBehavioralProfileSchema>;

// Admin System Prompts - global AI configuration
export const adminPrompts = pgTable("admin_prompts", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // 'master_system', 'campaign_osint', etc.
  name: text("name").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("system"), // 'system', 'campaign', 'persona'
  isActive: boolean("is_active").notNull().default(true),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAdminPromptSchema = createInsertSchema(adminPrompts).omit({
  id: true,
  updatedAt: true,
});

export type AdminPrompt = typeof adminPrompts.$inferSelect;
export type InsertAdminPrompt = z.infer<typeof insertAdminPromptSchema>;

// Campaign Templates - reusable investigation flows
export const campaignTemplates = pgTable("campaign_templates", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'osint', 'bgp', 'malware', 'social_engineering'
  phases: jsonb("phases").$type<{id: string; name: string; prompts: string[]; triggers: string[]}[]>().notNull().default([]),
  variables: jsonb("variables").$type<{key: string; label: string; default: string}[]>().notNull().default([]),
  rewards: jsonb("rewards").$type<{clueId?: string; questId?: string; route?: string}[]>().notNull().default([]),
  estimatedTime: text("estimated_time"),
  difficulty: text("difficulty").notNull().default("intermediate"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCampaignTemplateSchema = createInsertSchema(campaignTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CampaignTemplate = typeof campaignTemplates.$inferSelect;
export type InsertCampaignTemplate = z.infer<typeof insertCampaignTemplateSchema>;

// Content Flow Nodes - visual editor nodes
export const flowNodes = pgTable("flow_nodes", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull().unique(),
  campaignKey: text("campaign_key"), // links to campaign template
  type: text("type").notNull(), // 'clue', 'quest', 'message', 'trigger', 'branch'
  title: text("title").notNull(),
  content: jsonb("content").$type<Record<string, any>>().notNull().default({}),
  position: jsonb("position").$type<{x: number; y: number}>().notNull().default({x: 0, y: 0}),
  connections: jsonb("connections").$type<string[]>().notNull().default([]),
  metadata: jsonb("metadata").$type<Record<string, any>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFlowNodeSchema = createInsertSchema(flowNodes).omit({
  id: true,
  createdAt: true,
});

export type FlowNode = typeof flowNodes.$inferSelect;
export type InsertFlowNode = z.infer<typeof insertFlowNodeSchema>;

// Player Feedback - captures user experience, pain points, and suggestions
export const playerFeedback = pgTable("player_feedback", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token"),
  username: text("username"),
  feedbackType: text("feedback_type").notNull(), // 'bug', 'suggestion', 'pain_point', 'praise', 'question'
  category: text("category"), // 'gameplay', 'ui', 'difficulty', 'content', 'feature_request', 'learning'
  title: text("title").notNull(),
  content: text("content").notNull(),
  context: jsonb("context").$type<{
    currentRoute?: string;
    lastCommand?: string;
    sessionDuration?: number;
    completedQuests?: string[];
    collectedClues?: string[];
  }>().notNull().default({}),
  priority: text("priority").default('medium'), // 'low', 'medium', 'high', 'critical'
  status: text("status").notNull().default('new'), // 'new', 'reviewed', 'in_progress', 'resolved', 'wont_fix'
  devNotes: text("dev_notes"), // Your notes on the feedback
  learningStyle: text("learning_style"), // 'visual', 'reading', 'hands_on', 'guided'
  rating: integer("rating"), // 1-5 satisfaction score
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// Dev Briefings - aggregated insights for the developer
export const devBriefings = pgTable("dev_briefings", {
  id: serial("id").primaryKey(),
  briefingDate: timestamp("briefing_date").notNull().defaultNow(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  summary: text("summary").notNull(),
  keyInsights: jsonb("key_insights").$type<string[]>().notNull().default([]),
  painPoints: jsonb("pain_points").$type<{issue: string; count: number; severity: string}[]>().notNull().default([]),
  topSuggestions: jsonb("top_suggestions").$type<{suggestion: string; votes: number}[]>().notNull().default([]),
  userMetrics: jsonb("user_metrics").$type<{
    activePlayers: number;
    newPlayers: number;
    avgSessionTime: number;
    completionRate: number;
    feedbackCount: number;
  }>(),
  aiAnalysis: text("ai_analysis"), // AI-generated insights
  actionItems: jsonb("action_items").$type<{item: string; priority: string; status: string}[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Dungeon Master Messages - admin/mod communication with players
export const dmMessages = pgTable("dm_messages", {
  id: serial("id").primaryKey(),
  fromAdmin: boolean("from_admin").notNull().default(true),
  adminUsername: text("admin_username"),
  targetSession: text("target_session"), // null = broadcast to all
  targetUsername: text("target_username"),
  messageType: text("message_type").notNull(), // 'hint', 'announcement', 'story', 'challenge', 'reward', 'guidance'
  title: text("title"),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<{
    expiresAt?: string;
    triggerCondition?: string;
    unlockReward?: string;
  }>().notNull().default({}),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPlayerFeedbackSchema = createInsertSchema(playerFeedback).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertDevBriefingSchema = createInsertSchema(devBriefings).omit({
  id: true,
  createdAt: true,
});

export const insertDmMessageSchema = createInsertSchema(dmMessages).omit({
  id: true,
  createdAt: true,
});

export type PlayerFeedback = typeof playerFeedback.$inferSelect;
export type InsertPlayerFeedback = z.infer<typeof insertPlayerFeedbackSchema>;
export type DevBriefing = typeof devBriefings.$inferSelect;
export type InsertDevBriefing = z.infer<typeof insertDevBriefingSchema>;
export type DmMessage = typeof dmMessages.$inferSelect;
export type InsertDmMessage = z.infer<typeof insertDmMessageSchema>;

// Export auth and chat models
export * from "./models/auth";
export * from "./models/chat";
