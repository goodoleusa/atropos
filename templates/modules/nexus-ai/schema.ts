export const investigationContexts = pgTable("investigation_contexts", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  campaignId: text("campaign_id"),
  contextType: text("context_type").notNull().default("general"),
  data: jsonb("data").$type<Record<string, any>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const interactionLogs = pgTable("interaction_logs", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  agentId: text("agent_id"),
  messageType: text("message_type").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
