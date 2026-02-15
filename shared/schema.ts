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

// Campaign Runs - tracks session-based campaign progress (no signup required)
export const campaignRuns = pgTable("campaign_runs", {
  id: serial("id").primaryKey(),
  runId: text("run_id").notNull().unique(),
  sessionToken: text("session_token").notNull(),
  campaignId: text("campaign_id").notNull(),
  currentNodeId: text("current_node_id"),
  nodeHistory: jsonb("node_history").$type<string[]>().notNull().default([]),
  visitedNodes: jsonb("visited_nodes").$type<string[]>().notNull().default([]),
  inventory: jsonb("inventory").$type<string[]>().notNull().default([]),
  flags: jsonb("flags").$type<string[]>().notNull().default([]),
  variables: jsonb("variables").$type<Record<string, any>>().notNull().default({}),
  status: text("status").notNull().default("active"), // active, completed, abandoned
  startedAt: timestamp("started_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastActionAt: timestamp("last_action_at").notNull().defaultNow(),
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

export const insertCampaignRunSchema = createInsertSchema(campaignRuns).omit({
  id: true,
  startedAt: true,
  updatedAt: true,
  lastActionAt: true,
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
export type CampaignRun = typeof campaignRuns.$inferSelect;
export type InsertCampaignRun = z.infer<typeof insertCampaignRunSchema>;
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

// User Analytical Summaries - periodic AI-generated user profiles
export const userAnalyses = pgTable("user_analyses", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  analysisType: text("analysis_type").notNull().default("periodic"), // 'periodic', 'threshold', 'manual'
  interactionCount: integer("interaction_count").notNull().default(0),
  timeSpentMinutes: integer("time_spent_minutes").notNull().default(0),
  
  // Personality insights
  personalityTraits: jsonb("personality_traits").$type<{
    curiosity: number; // 0-100
    patience: number;
    technicalAptitude: number;
    riskTolerance: number;
    persistence: number;
    creativity: number;
  }>().notNull().default({
    curiosity: 50, patience: 50, technicalAptitude: 50,
    riskTolerance: 50, persistence: 50, creativity: 50
  }),
  
  // Behavioral patterns
  behaviorPatterns: jsonb("behavior_patterns").$type<{
    preferredFeatures: string[];
    avoidedFeatures: string[];
    peakActivityTimes: string[];
    averageSessionLength: number;
    commandPatterns: string[];
    learningStyle: string;
  }>().notNull().default({
    preferredFeatures: [], avoidedFeatures: [],
    peakActivityTimes: [], averageSessionLength: 0,
    commandPatterns: [], learningStyle: 'unknown'
  }),
  
  // Risk assessment
  riskAssessment: jsonb("risk_assessment").$type<{
    maliciousLikelihood: number; // 0-100
    riskFactors: string[];
    suspiciousPatterns: string[];
    trustScore: number; // 0-100
    flaggedBehaviors: { behavior: string; timestamp: string; severity: string }[];
  }>().notNull().default({
    maliciousLikelihood: 0, riskFactors: [],
    suspiciousPatterns: [], trustScore: 100, flaggedBehaviors: []
  }),
  
  // Pain points and friction
  painPoints: jsonb("pain_points").$type<{
    frustrationIndicators: string[];
    abandonedFeatures: string[];
    repeatedErrors: string[];
    helpSeekingBehavior: string[];
    suggestedImprovements: string[];
  }>().notNull().default({
    frustrationIndicators: [], abandonedFeatures: [],
    repeatedErrors: [], helpSeekingBehavior: [], suggestedImprovements: []
  }),
  
  // Engagement metrics
  engagementMetrics: jsonb("engagement_metrics").$type<{
    overallEngagement: number; // 0-100
    featureAdoption: Record<string, number>;
    progressionSpeed: string; // 'fast', 'moderate', 'slow', 'stalled'
    returnRate: number;
    completionRate: number;
  }>().notNull().default({
    overallEngagement: 50, featureAdoption: {},
    progressionSpeed: 'moderate', returnRate: 0, completionRate: 0
  }),
  
  // AI-generated summary
  narrativeSummary: text("narrative_summary"),
  keyInsights: jsonb("key_insights").$type<string[]>().notNull().default([]),
  recommendedActions: jsonb("recommended_actions").$type<string[]>().notNull().default([]),
  
  // Meta
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
  dataWindowStart: timestamp("data_window_start"),
  dataWindowEnd: timestamp("data_window_end"),
});

export const insertUserAnalysisSchema = createInsertSchema(userAnalyses).omit({
  id: true,
  analyzedAt: true,
});

export type UserAnalysis = typeof userAnalyses.$inferSelect;
export type InsertUserAnalysis = z.infer<typeof insertUserAnalysisSchema>;

// User Feedback - direct feedback on features, quests, campaigns
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  feedbackType: text("feedback_type").notNull(), // 'feature', 'quest', 'campaign', 'bug', 'suggestion', 'pain_point'
  targetId: text("target_id"), // ID of the feature/quest/campaign being rated
  targetName: text("target_name"),
  
  // Ratings
  rating: integer("rating"), // 1-5 stars
  difficulty: integer("difficulty"), // 1-5 (too easy to too hard)
  usefulness: integer("usefulness"), // 1-5
  clarity: integer("clarity"), // 1-5 (how clear were instructions)
  
  // Open feedback
  comment: text("comment"),
  suggestions: text("suggestions"),
  
  // Context at time of feedback
  context: jsonb("context").$type<{
    currentPhase?: string;
    toolsUsed?: string[];
    timeSpentMinutes?: number;
    completionStatus?: string;
    errorEncountered?: string;
  }>().notNull().default({}),
  
  // Agent handoff data
  agentHandoffSummary: text("agent_handoff_summary"), // Compressed context for next agent
  
  // Admin processing
  status: text("status").notNull().default("new"), // 'new', 'reviewed', 'actioned', 'deferred'
  adminNotes: text("admin_notes"),
  actionTaken: text("action_taken"),
  priority: text("priority").default("normal"), // 'low', 'normal', 'high', 'critical'
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// Improvement Queue - aggregated improvements from user data
export const improvementQueue = pgTable("improvement_queue", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 'ui', 'ux', 'content', 'feature', 'bug', 'performance'
  source: text("source").notNull(), // 'feedback', 'behavior_analysis', 'agent_insight', 'manual'
  
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Evidence
  evidence: jsonb("evidence").$type<{
    feedbackIds?: number[];
    analysisIds?: number[];
    sessionTokens?: string[];
    occurrenceCount?: number;
    impactScore?: number;
  }>().notNull().default({}),
  
  // Prioritization
  priority: integer("priority").notNull().default(50), // 0-100
  effort: text("effort").default("medium"), // 'low', 'medium', 'high'
  impact: text("impact").default("medium"), // 'low', 'medium', 'high'
  
  // Tracking
  status: text("status").notNull().default("proposed"), // 'proposed', 'approved', 'in_progress', 'completed', 'rejected'
  assignedTo: text("assigned_to"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertImprovementQueueSchema = createInsertSchema(improvementQueue).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type ImprovementQueue = typeof improvementQueue.$inferSelect;
export type InsertImprovementQueue = z.infer<typeof insertImprovementQueueSchema>;

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

// Community Prompt Gallery - user-submitted prompts for sharing
export const promptGallery = pgTable("prompt_gallery", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  prompt: text("prompt").notNull(),
  category: text("category").notNull().default("general"),
  tool: text("tool").notNull().default("atropos"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  sessionToken: text("session_token"),
  username: text("username"),
  status: text("status").notNull().default("published"), // 'published', 'pending', 'rejected'
  riskFlags: jsonb("risk_flags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPromptGallerySchema = createInsertSchema(promptGallery).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PromptGalleryEntry = typeof promptGallery.$inferSelect;
export type InsertPromptGallery = z.infer<typeof insertPromptGallerySchema>;

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

// Agent Modules - editable investigation campaigns for NEXUS agent
export const agentModules = pgTable("agent_modules", {
  id: serial("id").primaryKey(),
  moduleId: text("module_id").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("🎯"),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull().default("intermediate"), // beginner, intermediate, advanced, expert
  estimatedTime: text("estimated_time").notNull().default("30-60 min"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  color: text("color").notNull().default("amber"),
  starterPrompt: text("starter_prompt").notNull(),
  objectives: jsonb("objectives").$type<string[]>().notNull().default([]),
  tools: jsonb("tools").$type<string[]>().notNull().default([]),
  targetFields: jsonb("target_fields").$type<{
    key: string;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
  }[]>().notNull().default([]),
  dummyTargets: jsonb("dummy_targets").$type<Record<string, string>>().notNull().default({}),
  steps: jsonb("steps").$type<{
    id: string;
    title: string;
    guidance: string;
    toolsForStep: string[];
    questions: string[];
    redFlags: string[];
    successIndicators: string[];
    nextStepConditions: { condition: string; nextStep: string; rationale: string }[];
    linkedClues?: string[]; // Clues associated with this step
    nextStepId?: string;    // Direct link to the next logical step
  }[]>().notNull().default([]),
  adaptivePrompts: jsonb("adaptive_prompts").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAgentModuleSchema = createInsertSchema(agentModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AgentModule = typeof agentModules.$inferSelect;
export type InsertAgentModule = z.infer<typeof insertAgentModuleSchema>;

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

// Designer Campaigns - full user-created investigation campaigns (modular/branching)
export const designerCampaigns = pgTable("designer_campaigns", {
  id: serial("id").primaryKey(),
  campaignId: text("campaign_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("recon"),
  difficulty: text("difficulty").notNull().default("beginner"),
  estimatedTime: text("estimated_time").notNull().default("15 min"),
  nodes: jsonb("nodes").$type<any[]>().notNull().default([]),
  links: jsonb("links").$type<any[]>().notNull().default([]),
  rootNodes: jsonb("root_nodes").$type<string[]>().notNull().default([]),
  isChunk: boolean("is_chunk").notNull().default(false),
  entryPoints: jsonb("entry_points").$type<string[]>().notNull().default([]),
  exitPoints: jsonb("exit_points").$type<string[]>().notNull().default([]),
  clueRefs: jsonb("clue_refs").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  hiddenClues: jsonb("hidden_clues").$type<{
    id: string;
    type: 'source-code' | 'network-request' | 'http-header' | 'console-log' | 'css-comment' | 'data-attribute' | 'meta-tag' | 'base64' | 'hex-encoded' | 'steganography';
    nodeId: string;
    hint: string;
    value: string;
    found?: boolean;
  }[]>().notNull().default([]),
  sessionToken: text("session_token"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Shared Clues Library - cross-campaign clue references
export const sharedClues = pgTable("shared_clues", {
  id: serial("id").primaryKey(),
  clueId: text("clue_id").notNull().unique(), // Client-generated UUID
  name: text("name").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull().default(""),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  usedInCampaigns: jsonb("used_in_campaigns").$type<string[]>().notNull().default([]),
  linkedClues: jsonb("linked_clues").$type<string[]>().notNull().default([]), // Related clue IDs
  difficulty: integer("difficulty").notNull().default(1),
  category: text("category").notNull().default("general"), // 'osint', 'crypto', 'network', 'social'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Artifacts - collectible data items used in campaigns
export const artifacts = pgTable("artifacts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  content: text("content").notNull().default(""),
  category: text("category").notNull().default("general"), // 'file', 'log', 'intel', 'credential'
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Mystical Cards - tarot/zodiac popup collectibles
export const mysticalCards = pgTable("mystical_cards", {
  id: serial("id").primaryKey(),
  cardId: text("card_id").notNull().unique(), // e.g., tarot-the-fool
  type: text("type").notNull(), // 'tarot' | 'zodiac'
  name: text("name").notNull(),
  symbol: text("symbol"),
  hint: text("hint").notNull(),
  icon: text("icon"),
  element: text("element"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Quantum Events - probability popups and collectible events
export const quantumEvents = pgTable("quantum_events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  baseProb: integer("base_prob").notNull().default(10), // 0-100 percent
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Quantum Messages - flavor strings used in quantum popups
export const quantumMessages = pgTable("quantum_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Campaign Links - cross-campaign connections
export const campaignLinks = pgTable("campaign_links", {
  id: serial("id").primaryKey(),
  sourceCampaignId: text("source_campaign_id").notNull(),
  sourceNodeId: text("source_node_id").notNull(),
  targetCampaignId: text("target_campaign_id").notNull(),
  targetNodeId: text("target_node_id").notNull(),
  linkType: text("link_type").notNull().default("continues"), // 'continues', 'branches', 'references'
  condition: text("condition"), // Optional condition for branching
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDesignerCampaignSchema = createInsertSchema(designerCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSharedClueSchema = createInsertSchema(sharedClues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArtifactSchema = createInsertSchema(artifacts).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertMysticalCardSchema = createInsertSchema(mysticalCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuantumEventSchema = createInsertSchema(quantumEvents).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertQuantumMessageSchema = createInsertSchema(quantumMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignLinkSchema = createInsertSchema(campaignLinks).omit({
  id: true,
  createdAt: true,
});

export type DesignerCampaign = typeof designerCampaigns.$inferSelect;
export type InsertDesignerCampaign = z.infer<typeof insertDesignerCampaignSchema>;
export type SharedClue = typeof sharedClues.$inferSelect;
export type InsertSharedClue = z.infer<typeof insertSharedClueSchema>;
export type Artifact = typeof artifacts.$inferSelect;
export type InsertArtifact = z.infer<typeof insertArtifactSchema>;
export type MysticalCard = typeof mysticalCards.$inferSelect;
export type InsertMysticalCard = z.infer<typeof insertMysticalCardSchema>;
export type QuantumEvent = typeof quantumEvents.$inferSelect;
export type InsertQuantumEvent = z.infer<typeof insertQuantumEventSchema>;
export type QuantumMessage = typeof quantumMessages.$inferSelect;
export type InsertQuantumMessage = z.infer<typeof insertQuantumMessageSchema>;
export type CampaignLink = typeof campaignLinks.$inferSelect;
export type InsertCampaignLink = z.infer<typeof insertCampaignLinkSchema>;

// OSINT Tool Registry - configurable external tools
export const osintTools = pgTable("osint_tools", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // 'urlscan', 'virustotal', 'whois', etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'domain', 'ip', 'hash', 'url', 'email', 'general'
  baseUrl: text("base_url").notNull(),
  apiKeyEnvVar: text("api_key_env_var"), // Environment variable name for API key
  requiresAuth: boolean("requires_auth").notNull().default(false),
  rateLimit: integer("rate_limit").notNull().default(60), // Requests per minute
  rateLimitWindow: integer("rate_limit_window").notNull().default(60000), // Window in ms
  requestSchema: jsonb("request_schema").$type<{
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    bodyTemplate?: string;
    pathTemplate?: string; // URL path template with {{target}} placeholder
  }>().notNull(),
  responseMapping: jsonb("response_mapping").$type<{
    dataPath?: string; // JSONPath to data in response
    fields: { key: string; path: string; label: string }[];
  }>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// OSINT Tool Calls - log all tool executions
export const osintToolCalls = pgTable("osint_tool_calls", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token"),
  toolKey: text("tool_key").notNull(),
  targetType: text("target_type").notNull(), // 'domain', 'ip', 'hash', 'url', 'email'
  targetValue: text("target_value").notNull(),
  request: jsonb("request").$type<Record<string, any>>().notNull(),
  response: jsonb("response").$type<Record<string, any>>(),
  status: text("status").notNull().default("pending"), // 'pending', 'success', 'error', 'rate_limited'
  errorMessage: text("error_message"),
  latencyMs: integer("latency_ms"),
  source: text("source").notNull().default("manual"), // 'manual', 'terminal', 'chat', 'campaign', 'report'
  investigationId: text("investigation_id"), // Link to active investigation
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Investigation Context - shared state across features
export const investigationContexts = pgTable("investigation_contexts", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  investigationId: text("investigation_id").notNull().unique(),
  name: text("name").notNull(),
  targetType: text("target_type").notNull(), // 'domain', 'ip', 'organization', 'person', 'infrastructure'
  targetValue: text("target_value").notNull(),
  phase: text("phase").notNull().default("reconnaissance"), // 'reconnaissance', 'enumeration', 'analysis', 'reporting'
  findings: jsonb("findings").$type<{
    id: string;
    toolKey: string;
    category: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    title: string;
    data: any;
    timestamp: string;
  }[]>().notNull().default([]),
  hypotheses: jsonb("hypotheses").$type<{
    id: string;
    text: string;
    status: 'active' | 'confirmed' | 'rejected';
    evidence: string[];
  }[]>().notNull().default([]),
  toolsUsed: jsonb("tools_used").$type<string[]>().notNull().default([]),
  campaignId: text("campaign_id"), // Active campaign if running
  campaignNodeId: text("campaign_node_id"), // Current position in campaign
  learningProfile: jsonb("learning_profile").$type<{
    style: string;
    goals: string[];
    skillLevel: string;
    pace: string;
  }>(),
  compressedHistory: text("compressed_history"), // Summarized conversation history
  status: text("status").notNull().default("active"), // 'active', 'paused', 'completed', 'archived'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Interaction Logs - comprehensive user action tracking for model evaluation
export const interactionLogs = pgTable("interaction_logs", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token"),
  investigationId: text("investigation_id"),
  actionType: text("action_type").notNull(), // 'chat', 'tool_call', 'navigation', 'campaign_action', 'report_edit'
  source: text("source").notNull(), // 'terminal', 'agent_chat', 'campaign', 'report', 'ai_lab'
  input: jsonb("input").$type<{
    prompt?: string;
    command?: string;
    action?: string;
    context?: Record<string, any>;
  }>().notNull(),
  output: jsonb("output").$type<{
    response?: string;
    result?: any;
    toolCalls?: string[];
    tokensUsed?: number;
    model?: string;
  }>(),
  metadata: jsonb("metadata").$type<{
    latencyMs?: number;
    learningStyle?: string;
    skillLevel?: string;
    campaignId?: string;
    nodeId?: string;
    userRating?: number; // 1-5 rating if user provides feedback
    adminFlag?: 'good' | 'bad' | 'review'; // Admin flagging for training
  }>().notNull().default({}),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// State Capsules - compressed handoff states for agent chaining
export const stateCapsules = pgTable("state_capsules", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  investigationId: text("investigation_id"),
  capsuleType: text("capsule_type").notNull(), // 'handoff', 'checkpoint', 'milestone'
  content: text("content").notNull(), // The compressed prompt/state
  metadata: jsonb("metadata").$type<{
    phase: string;
    findingsCount: number;
    toolsUsed: string[];
    tokensEstimate: number;
    createdBy: 'auto' | 'manual';
  }>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertOsintToolSchema = createInsertSchema(osintTools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOsintToolCallSchema = createInsertSchema(osintToolCalls).omit({
  id: true,
  timestamp: true,
});
export const insertInvestigationContextSchema = createInsertSchema(investigationContexts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertInteractionLogSchema = createInsertSchema(interactionLogs).omit({
  id: true,
  timestamp: true,
});
export const insertStateCapsuleSchema = createInsertSchema(stateCapsules).omit({
  id: true,
  createdAt: true,
});

// Types
export type OsintTool = typeof osintTools.$inferSelect;
export type InsertOsintTool = z.infer<typeof insertOsintToolSchema>;
export type OsintToolCall = typeof osintToolCalls.$inferSelect;
export type InsertOsintToolCall = z.infer<typeof insertOsintToolCallSchema>;
export type InvestigationContext = typeof investigationContexts.$inferSelect;
export type InsertInvestigationContext = z.infer<typeof insertInvestigationContextSchema>;
export type InteractionLog = typeof interactionLogs.$inferSelect;
export type InsertInteractionLog = z.infer<typeof insertInteractionLogSchema>;
export type StateCapsule = typeof stateCapsules.$inferSelect;
export type InsertStateCapsule = z.infer<typeof insertStateCapsuleSchema>;

// Atropos Scans - track scan executions
export const atroposScans = pgTable("atropos_scans", {
  id: serial("id").primaryKey(),
  scanId: text("scan_id").notNull().unique(),
  sessionToken: text("session_token").notNull(),
  investigationId: text("investigation_id"),
  scriptPath: text("script_path").notNull(),
  target: text("target").notNull(),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  results: jsonb("results").$type<any>(),
  error: text("error"),
  outputPath: text("output_path"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Atropos Scripts - registered Lua scripts
export const atroposScripts = pgTable("atropos_scripts", {
  id: serial("id").primaryKey(),
  scriptId: text("script_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // 'osint', 'vulnerability', 'secret_detection', 'general'
  scriptPath: text("script_path").notNull(), // Path to .lua file
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertAtroposScanSchema = createInsertSchema(atroposScans).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});
export const insertAtroposScriptSchema = createInsertSchema(atroposScripts).omit({
  id: true,
  createdAt: true,
});

// Types
export type AtroposScan = typeof atroposScans.$inferSelect;
export type InsertAtroposScan = z.infer<typeof insertAtroposScanSchema>;
export type AtroposScript = typeof atroposScripts.$inferSelect;
export type InsertAtroposScript = z.infer<typeof insertAtroposScriptSchema>;

// Modmail - user questions and admin responses
export const modmail = pgTable("modmail", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(),
  sessionToken: text("session_token").notNull(),
  username: text("username").notNull().default("Anonymous"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  category: text("category").notNull().default("general"), // general, bug, feature, question, help
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  adminResponse: text("admin_response"),
  respondedBy: text("responded_by"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Multiplayer Lobbies - anonymous real-time sessions
export const multiplayerLobbies = pgTable("multiplayer_lobbies", {
  id: serial("id").primaryKey(),
  lobbyId: text("lobby_id").notNull().unique(),
  name: text("name").notNull(),
  mode: text("mode").notNull().default("coop"), // coop, versus, race
  maxPlayers: integer("max_players").notNull().default(4),
  currentPlayers: jsonb("current_players").$type<{ sessionToken: string; alias: string; score: number }[]>().notNull().default([]),
  campaignId: text("campaign_id"),
  status: text("status").notNull().default("waiting"), // waiting, active, finished
  settings: jsonb("settings").$type<Record<string, any>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Player Progression - XP, levels, and statistics
export const playerProgression = pgTable("player_progression", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  totalXp: integer("total_xp").notNull().default(0), // Cumulative XP (never resets)
  prestigeLevel: integer("prestige_level").notNull().default(0),
  
  // Skill specialization (OSINT, Network, Malware, Social Engineering)
  skills: jsonb("skills").$type<{
    osint: number;
    network: number;
    malware: number;
    social: number;
  }>().notNull().default({
    osint: 0, network: 0, malware: 0, social: 0
  }),
  
  // Statistics
  stats: jsonb("stats").$type<{
    campaignsCompleted: number;
    cluesFound: number;
    hiddenCluesFound: number;
    questsCompleted: number;
    toolsUsed: number;
    totalPlayTimeMinutes: number;
    fastestCampaignTime?: number;
    longestStreak: number;
    currentStreak: number;
    lastLoginDate?: string;
  }>().notNull().default({
    campaignsCompleted: 0,
    cluesFound: 0,
    hiddenCluesFound: 0,
    questsCompleted: 0,
    toolsUsed: 0,
    totalPlayTimeMinutes: 0,
    longestStreak: 0,
    currentStreak: 0
  }),
  
  // Unlocks and rewards
  unlockedTools: jsonb("unlocked_tools").$type<string[]>().notNull().default([]),
  unlockedCampaigns: jsonb("unlocked_campaigns").$type<string[]>().notNull().default([]),
  currency: integer("currency").notNull().default(0), // In-game credits
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Achievements - definitions
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  achievementId: text("achievement_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // discovery, speed, mastery, social, special
  icon: text("icon").notNull().default("🏆"),
  
  // Requirements
  requirements: jsonb("requirements").$type<{
    type: 'stat' | 'action' | 'campaign' | 'special';
    condition: Record<string, any>;
  }>().notNull(),
  
  // Rewards
  xpReward: integer("xp_reward").notNull().default(0),
  currencyReward: integer("currency_reward").notNull().default(0),
  unlocks: jsonb("unlocks").$type<string[]>().notNull().default([]),
  
  rarity: text("rarity").notNull().default("common"), // common, rare, epic, legendary
  isHidden: boolean("is_hidden").notNull().default(false), // Hidden until unlocked
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Player Achievements - tracking unlocks
export const playerAchievements = pgTable("player_achievements", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  achievementId: text("achievement_id").notNull(),
  
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  progress: integer("progress").notNull().default(100), // For multi-step achievements
  
  // Context when unlocked
  metadata: jsonb("metadata").$type<{
    campaignId?: string;
    trigger?: string;
    value?: any;
  }>().notNull().default({}),
});

// Leaderboard Entries - denormalized for fast queries
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  username: text("username").notNull(),
  
  leaderboardType: text("leaderboard_type").notNull(), // global_xp, campaign_speed, weekly_challenge, etc.
  score: integer("score").notNull(),
  rank: integer("rank"),
  
  // Additional data for specific leaderboards
  metadata: jsonb("metadata").$type<{
    campaignId?: string;
    completionTime?: number;
    weekNumber?: number;
    year?: number;
  }>().notNull().default({}),
  
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Daily Challenges - definitions
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  challengeId: text("challenge_id").notNull().unique(),
  challengeDate: timestamp("challenge_date").notNull(),
  
  type: text("type").notNull(), // mini_investigation, speed_run, collection, skill_test
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  
  // Challenge configuration
  config: jsonb("config").$type<{
    campaignId?: string;
    targetTime?: number;
    requiredClues?: string[];
    skillFocus?: string;
    customRules?: Record<string, any>;
  }>().notNull().default({}),
  
  // Rewards
  xpReward: integer("xp_reward").notNull().default(100),
  currencyReward: integer("currency_reward").notNull().default(50),
  bonusRewards: jsonb("bonus_rewards").$type<string[]>().notNull().default([]),
  
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Daily Challenge Completions - tracking
export const challengeCompletions = pgTable("challenge_completions", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  challengeId: text("challenge_id").notNull(),
  
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  score: integer("score").notNull().default(0),
  timeSpent: integer("time_spent").notNull().default(0), // seconds
  
  // Performance metrics
  metrics: jsonb("metrics").$type<{
    cluesFound?: number;
    toolsUsed?: number;
    hintsUsed?: number;
    perfectRun?: boolean;
  }>().notNull().default({}),
});

// Campaign Stats - aggregated analytics
export const campaignStats = pgTable("campaign_stats", {
  id: serial("id").primaryKey(),
  campaignId: text("campaign_id").notNull().unique(),
  
  // Participation
  totalAttempts: integer("total_attempts").notNull().default(0),
  totalCompletions: integer("total_completions").notNull().default(0),
  uniquePlayers: integer("unique_players").notNull().default(0),
  
  // Performance
  averageCompletionTime: integer("average_completion_time").notNull().default(0), // minutes
  fastestCompletionTime: integer("fastest_completion_time"),
  averageRating: integer("average_rating").notNull().default(0), // 1-5 stars
  totalRatings: integer("total_ratings").notNull().default(0),
  
  // Drop-off analysis
  dropOffPoints: jsonb("drop_off_points").$type<{
    nodeId: string;
    dropCount: number;
    percentage: number;
  }[]>().notNull().default([]),
  
  completionRate: integer("completion_rate").notNull().default(0), // Percentage
  
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertPlayerProgressionSchema = createInsertSchema(playerProgression).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerAchievementSchema = createInsertSchema(playerAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  updatedAt: true,
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeCompletionSchema = createInsertSchema(challengeCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertCampaignStatsSchema = createInsertSchema(campaignStats).omit({
  id: true,
  updatedAt: true,
});

// Select Types
export type PlayerProgression = typeof playerProgression.$inferSelect;
export type InsertPlayerProgression = z.infer<typeof insertPlayerProgressionSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type PlayerAchievement = typeof playerAchievements.$inferSelect;
export type InsertPlayerAchievement = z.infer<typeof insertPlayerAchievementSchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type ChallengeCompletion = typeof challengeCompletions.$inferSelect;
export type InsertChallengeCompletion = z.infer<typeof insertChallengeCompletionSchema>;
export type CampaignStats = typeof campaignStats.$inferSelect;
export type InsertCampaignStats = z.infer<typeof insertCampaignStatsSchema>;

// Insert schemas for modmail and multiplayer
export const insertModmailSchema = createInsertSchema(modmail).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  respondedAt: true,
});
export const insertMultiplayerLobbySchema = createInsertSchema(multiplayerLobbies).omit({
  id: true,
  createdAt: true,
});

// Types
export type Modmail = typeof modmail.$inferSelect;
export type InsertModmail = z.infer<typeof insertModmailSchema>;
export type MultiplayerLobby = typeof multiplayerLobbies.$inferSelect;
export type InsertMultiplayerLobby = z.infer<typeof insertMultiplayerLobbySchema>;

// NOTE: Two progression systems exist (need consolidation):
// 1. achievementDefinitions + gameEvents (from main) - uses XP_LEVELS with title-based progression
// 2. playerProgression + achievements (from cursor2) - uses linear 100 XP/level system
// Both are functional. Recommend: Choose one system and migrate data post-merge.

// Achievements - definable achievement templates (from main branch)
export const achievementDefinitions = pgTable("achievement_definitions", {
  id: serial("id").primaryKey(),
  achievementId: text("achievement_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("🏆"),
  category: text("category").notNull().default("general"), // general, combat, exploration, social, mastery
  rarity: text("rarity").notNull().default("common"), // common, uncommon, rare, epic, legendary
  xpReward: integer("xp_reward").notNull().default(100),
  condition: jsonb("condition").$type<{
    type: 'clue_count' | 'quest_count' | 'campaign_count' | 'command_count' | 'xp_threshold' | 'level_threshold' | 'streak' | 'specific_clue' | 'specific_quest' | 'time_played' | 'custom';
    value: number | string;
    comparison?: 'gte' | 'eq' | 'includes';
  }>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isHidden: boolean("is_hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Game Events - audit trail of significant gameplay events
export const gameEvents = pgTable("game_events", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  eventType: text("event_type").notNull(), // clue_found, quest_completed, achievement_unlocked, level_up, campaign_started, campaign_completed, xp_gained
  eventData: jsonb("event_data").$type<Record<string, any>>().notNull().default({}),
  xpAwarded: integer("xp_awarded").notNull().default(0),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// XP Level Thresholds configuration
export const XP_LEVELS = [
  { level: 1, xpRequired: 0, title: 'Recruit' },
  { level: 2, xpRequired: 250, title: 'Initiate' },
  { level: 3, xpRequired: 600, title: 'Operative' },
  { level: 4, xpRequired: 1200, title: 'Agent' },
  { level: 5, xpRequired: 2000, title: 'Specialist' },
  { level: 6, xpRequired: 3200, title: 'Veteran' },
  { level: 7, xpRequired: 5000, title: 'Elite' },
  { level: 8, xpRequired: 7500, title: 'Shadow' },
  { level: 9, xpRequired: 11000, title: 'Phantom' },
  { level: 10, xpRequired: 15000, title: 'Ghost' },
] as const;

export function getLevelForXP(xp: number): { level: number; title: string; xpForNext: number; xpProgress: number } {
  let currentLevel = XP_LEVELS[0] as typeof XP_LEVELS[number];
  for (const lvl of XP_LEVELS) {
    if (xp >= lvl.xpRequired) {
      currentLevel = lvl;
    } else {
      break;
    }
  }
  const nextLevel = XP_LEVELS.find(l => l.level === currentLevel.level + 1);
  const xpForNext = nextLevel ? nextLevel.xpRequired - currentLevel.xpRequired : 0;
  const xpProgress = nextLevel ? xp - currentLevel.xpRequired : 0;
  return { level: currentLevel.level, title: currentLevel.title, xpForNext, xpProgress };
}

export const insertAchievementDefinitionSchema = createInsertSchema(achievementDefinitions).omit({
  id: true,
  createdAt: true,
});
export const insertGameEventSchema = createInsertSchema(gameEvents).omit({
  id: true,
  timestamp: true,
});

export type AchievementDefinition = typeof achievementDefinitions.$inferSelect;
export type InsertAchievementDefinition = z.infer<typeof insertAchievementDefinitionSchema>;
export type GameEvent = typeof gameEvents.$inferSelect;
export type InsertGameEvent = z.infer<typeof insertGameEventSchema>;

// Client Security Services - Offensive security agent deployment
export const clientOrganizations = pgTable("client_organizations", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  organizationName: text("organization_name").notNull(),
  serviceTier: text("service_tier").notNull(), // 'small_business', 'mid_market', 'enterprise', 'ngo', 'government'
  monthlyFee: integer("monthly_fee").notNull().default(0),
  
  // Service Configuration
  slaResponseMinutes: integer("sla_response_minutes").notNull().default(240), // 4 hours default
  hasDedicatedAnalyst: boolean("has_dedicated_analyst").notNull().default(false),
  agentDeploymentType: text("agent_deployment_type").notNull().default("cloud"), // 'cloud', 'edge', 'hybrid'
  
  // Monitored Assets
  monitoredDomains: jsonb("monitored_domains").$type<string[]>().notNull().default([]),
  monitoredIpRanges: jsonb("monitored_ip_ranges").$type<string[]>().notNull().default([]),
  monitoredPersonnel: jsonb("monitored_personnel").$type<{name: string; email: string; role: string}[]>().notNull().default([]),
  
  // Alert Configuration
  alertEmails: jsonb("alert_emails").$type<string[]>().notNull().default([]),
  alertSlackWebhook: text("alert_slack_webhook"),
  alertPhones: jsonb("alert_phones").$type<string[]>().notNull().default([]),
  
  // Status
  subscriptionStatus: text("subscription_status").notNull().default("active"), // 'active', 'past_due', 'cancelled', 'trial'
  trialEndsAt: timestamp("trial_ends_at"),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  
  // Contact
  primaryContactName: text("primary_contact_name").notNull(),
  primaryContactEmail: text("primary_contact_email").notNull(),
  primaryContactPhone: text("primary_contact_phone"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Security Findings from deployed agents
export const agentFindings = pgTable("agent_findings", {
  id: serial("id").primaryKey(),
  findingId: text("finding_id").notNull().unique(),
  clientId: text("client_id").notNull(),
  
  // Agent Info
  agentId: text("agent_id").notNull(), // 'recon', 'scanner', 'hunter', 'responder'
  agentType: text("agent_type").notNull(), // Type of agent that found this
  
  // Finding Details
  severity: text("severity").notNull(), // 'critical', 'high', 'medium', 'low', 'info'
  category: text("category").notNull(), // 'vulnerability', 'threat', 'misconfiguration', 'exposure'
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Technical Details
  affectedAsset: text("affected_asset"), // IP, domain, service
  cve: text("cve"), // CVE identifier if applicable
  cvss: integer("cvss"), // CVSS score 0-10
  exploitability: text("exploitability"), // 'high', 'medium', 'low', 'none'
  
  // Evidence
  evidence: jsonb("evidence").$type<Record<string, any>>().notNull().default({}),
  proofOfConcept: text("proof_of_concept"),
  
  // Remediation
  remediationSteps: jsonb("remediation_steps").$type<string[]>().notNull().default([]),
  estimatedEffort: text("estimated_effort"), // 'quick', 'moderate', 'complex'
  priority: integer("priority").notNull().default(50), // 0-100
  
  // Status
  status: text("status").notNull().default("new"), // 'new', 'investigating', 'remediated', 'accepted_risk', 'false_positive'
  assignedTo: text("assigned_to"),
  remediatedAt: timestamp("remediated_at"),
  
  // Client Notification
  clientNotified: boolean("client_notified").notNull().default(false),
  notifiedAt: timestamp("notified_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Agent Deployment Records
export const agentDeployments = pgTable("agent_deployments", {
  id: serial("id").primaryKey(),
  deploymentId: text("deployment_id").notNull().unique(),
  clientId: text("client_id").notNull(),
  
  // Deployment Config
  deploymentType: text("deployment_type").notNull(), // 'cloud', 'edge', 'hybrid'
  crewConfiguration: jsonb("crew_configuration").$type<{
    agents: string[];
    models: Record<string, string>;
    scanFrequency: number;
  }>().notNull(),
  
  // Edge Device Info (if applicable)
  edgeDeviceId: text("edge_device_id"),
  edgeDeviceIp: text("edge_device_ip"),
  edgeDeviceStatus: text("edge_device_status"), // 'online', 'offline', 'error'
  
  // Status
  status: text("status").notNull().default("active"), // 'active', 'paused', 'error', 'decommissioned'
  lastHealthCheck: timestamp("last_health_check"),
  lastScanCompleted: timestamp("last_scan_completed"),
  
  // Metrics
  totalScansRun: integer("total_scans_run").notNull().default(0),
  totalFindingsReported: integer("total_findings_reported").notNull().default(0),
  totalIncidentsContained: integer("total_incidents_contained").notNull().default(0),
  
  deployedAt: timestamp("deployed_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert Schemas
export const insertClientOrganizationSchema = createInsertSchema(clientOrganizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentFindingSchema = createInsertSchema(agentFindings).omit({
  id: true,
  createdAt: true,
});

export const insertAgentDeploymentSchema = createInsertSchema(agentDeployments).omit({
  id: true,
  deployedAt: true,
  updatedAt: true,
});

// Types
export type ClientOrganization = typeof clientOrganizations.$inferSelect;
export type InsertClientOrganization = z.infer<typeof insertClientOrganizationSchema>;
export type AgentFinding = typeof agentFindings.$inferSelect;
export type InsertAgentFinding = z.infer<typeof insertAgentFindingSchema>;
export type AgentDeployment = typeof agentDeployments.$inferSelect;
export type InsertAgentDeployment = z.infer<typeof insertAgentDeploymentSchema>;

// Export auth and chat models
export * from "./models/auth";
export * from "./models/chat";
