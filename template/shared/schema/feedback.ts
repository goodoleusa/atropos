// TEMPLATE: Feedback & Analytics Schema
// Auto-collected feedback from AI agents + manual user feedback.
// Keep this module — it's useful in almost every project.

import { pgTable, text, integer, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// TEMPLATE: Agent-reported feedback items (auto-collected)
export const feedbackItems = pgTable("feedback_items", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default("bug"), // bug, feature, idea, pain_point
  source: text("source").notNull().default("manual"), // manual, agent:model_name, scanner, etc.
  status: text("status").notNull().default("open"), // open, in_progress, resolved, shipped, dismissed
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  title: text("title").notNull(),
  description: text("description").notNull(),
  context: text("context"), // auto-captured context
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  votes: integer("votes").notNull().default(1),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// TEMPLATE: Behavioral analytics profiles
export const behavioralProfiles = pgTable("behavioral_profiles", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  actionType: text("action_type").notNull(),
  category: text("category").notNull(),
  intensity: integer("intensity").notNull().default(1),
  metadata: jsonb("metadata").$type<Record<string, any>>().notNull().default({}),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// --- Insert Schemas ---
export const insertFeedbackItemSchema = createInsertSchema(feedbackItems).omit({
  id: true, createdAt: true, updatedAt: true,
});
export const insertBehavioralProfileSchema = createInsertSchema(behavioralProfiles).omit({
  id: true, timestamp: true,
});

// --- Types ---
export type FeedbackItem = typeof feedbackItems.$inferSelect;
export type InsertFeedbackItem = z.infer<typeof insertFeedbackItemSchema>;
export type BehavioralProfile = typeof behavioralProfiles.$inferSelect;
export type InsertBehavioralProfile = z.infer<typeof insertBehavioralProfileSchema>;
