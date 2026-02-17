// TEMPLATE: Content Management Schema
// Visual flow editor nodes, admin prompts, prompt gallery.
// Customize or remove sections you don't need.

import { pgTable, text, integer, timestamp, boolean, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// TEMPLATE: Admin-configurable system prompts
export const adminPrompts = pgTable("admin_prompts", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("system"),
  isActive: boolean("is_active").notNull().default(true),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// TEMPLATE: Community/user-submitted prompt gallery
export const promptGallery = pgTable("prompt_gallery", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  prompt: text("prompt").notNull(),
  category: text("category").notNull().default("general"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  sessionToken: text("session_token"),
  username: text("username"),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// TEMPLATE: Visual flow editor nodes (for campaign/workflow designers)
export const flowNodes = pgTable("flow_nodes", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull().unique(),
  campaignKey: text("campaign_key"),
  type: text("type").notNull(), // clue, quest, message, trigger, branch
  title: text("title").notNull(),
  content: jsonb("content").$type<Record<string, any>>().notNull().default({}),
  position: jsonb("position").$type<{x: number; y: number}>().notNull().default({x: 0, y: 0}),
  connections: jsonb("connections").$type<string[]>().notNull().default([]),
  metadata: jsonb("metadata").$type<Record<string, any>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Insert Schemas ---
export const insertAdminPromptSchema = createInsertSchema(adminPrompts).omit({
  id: true, updatedAt: true,
});
export const insertPromptGallerySchema = createInsertSchema(promptGallery).omit({
  id: true, createdAt: true, updatedAt: true,
});
export const insertFlowNodeSchema = createInsertSchema(flowNodes).omit({
  id: true, createdAt: true,
});

// --- Types ---
export type AdminPrompt = typeof adminPrompts.$inferSelect;
export type InsertAdminPrompt = z.infer<typeof insertAdminPromptSchema>;
export type PromptGalleryEntry = typeof promptGallery.$inferSelect;
export type InsertPromptGallery = z.infer<typeof insertPromptGallerySchema>;
export type FlowNode = typeof flowNodes.$inferSelect;
export type InsertFlowNode = z.infer<typeof insertFlowNodeSchema>;
