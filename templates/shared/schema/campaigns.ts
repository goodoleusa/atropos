// TEMPLATE: Campaign/Workflow Schema
// Use this for multi-step user journeys, investigation flows, or learning paths.
// Rename "campaign" to match your domain (e.g., "workflow", "course", "project").

import { pgTable, text, integer, timestamp, boolean, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// TEMPLATE: Active runs/sessions for campaigns
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
});

// TEMPLATE: Reusable campaign/workflow templates
export const campaignTemplates = pgTable("campaign_templates", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  // TEMPLATE: Customize phases structure for your workflow steps
  phases: jsonb("phases").$type<{id: string; name: string; prompts: string[]; triggers: string[]}[]>().notNull().default([]),
  variables: jsonb("variables").$type<{key: string; label: string; default: string}[]>().notNull().default([]),
  difficulty: text("difficulty").notNull().default("intermediate"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// TEMPLATE: Agent/AI investigation modules
export const agentModules = pgTable("agent_modules", {
  id: serial("id").primaryKey(),
  moduleId: text("module_id").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default(""),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull().default("intermediate"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  starterPrompt: text("starter_prompt").notNull(),
  objectives: jsonb("objectives").$type<string[]>().notNull().default([]),
  tools: jsonb("tools").$type<string[]>().notNull().default([]),
  // TEMPLATE: Customize step structure for your guided workflows
  steps: jsonb("steps").$type<{
    id: string;
    title: string;
    guidance: string;
    questions: string[];
  }[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Insert Schemas ---
export const insertCampaignRunSchema = createInsertSchema(campaignRuns).omit({
  id: true, startedAt: true, updatedAt: true,
});
export const insertCampaignTemplateSchema = createInsertSchema(campaignTemplates).omit({
  id: true, createdAt: true, updatedAt: true,
});
export const insertAgentModuleSchema = createInsertSchema(agentModules).omit({
  id: true, createdAt: true, updatedAt: true,
});

// --- Types ---
export type CampaignRun = typeof campaignRuns.$inferSelect;
export type InsertCampaignRun = z.infer<typeof insertCampaignRunSchema>;
export type CampaignTemplate = typeof campaignTemplates.$inferSelect;
export type InsertCampaignTemplate = z.infer<typeof insertCampaignTemplateSchema>;
export type AgentModule = typeof agentModules.$inferSelect;
export type InsertAgentModule = z.infer<typeof insertAgentModuleSchema>;
