export const agentModules = pgTable("agent_modules", {
  id: serial("id").primaryKey(),
  moduleId: text("module_id").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  goal: text("goal").notNull(),
  backstory: text("backstory"),
  tools: jsonb("tools").$type<string[]>().notNull().default([]),
  config: jsonb("config").$type<Record<string, any>>().notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
