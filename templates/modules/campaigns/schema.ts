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
  status: text("status").notNull().default("active"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastActionAt: timestamp("last_action_at").notNull().defaultNow(),
});

export const campaignTemplates = pgTable("campaign_templates", {
  id: serial("id").primaryKey(),
  templateId: text("template_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("investigation"),
  difficulty: integer("difficulty").notNull().default(1),
  nodes: jsonb("nodes").$type<any[]>().notNull().default([]),
  edges: jsonb("edges").$type<any[]>().notNull().default([]),
  metadata: jsonb("metadata").$type<Record<string, any>>().notNull().default({}),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const designerCampaigns = pgTable("designer_campaigns", {
  id: serial("id").primaryKey(),
  campaignId: text("campaign_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  flowData: jsonb("flow_data").$type<Record<string, any>>().notNull().default({}),
  metadata: jsonb("metadata").$type<Record<string, any>>().notNull().default({}),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const campaignStats = pgTable("campaign_stats", {
  id: serial("id").primaryKey(),
  campaignId: text("campaign_id").notNull(),
  sessionToken: text("session_token").notNull(),
  completedAt: timestamp("completed_at"),
  rating: integer("rating"),
  feedback: text("feedback"),
  timeSpentMinutes: integer("time_spent_minutes"),
});
