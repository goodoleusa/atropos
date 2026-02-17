export const osintTools = pgTable("osint_tools", {
  id: serial("id").primaryKey(),
  toolId: text("tool_id").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  config: jsonb("config").$type<Record<string, any>>().notNull().default({}),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const osintToolCalls = pgTable("osint_tool_calls", {
  id: serial("id").primaryKey(),
  toolId: text("tool_id").notNull(),
  sessionToken: text("session_token"),
  input: jsonb("input").$type<Record<string, any>>().notNull().default({}),
  output: jsonb("output").$type<Record<string, any>>().notNull().default({}),
  status: text("status").notNull().default("pending"),
  duration: integer("duration"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
