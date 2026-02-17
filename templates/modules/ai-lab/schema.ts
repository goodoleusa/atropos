export const adminPrompts = pgTable("admin_prompts", {
  id: serial("id").primaryKey(),
  promptId: text("prompt_id").notNull().unique(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("system"),
  model: text("model"),
  metadata: jsonb("metadata").$type<Record<string, any>>().notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const promptGallery = pgTable("prompt_gallery", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  rating: integer("rating").notNull().default(0),
  usageCount: integer("usage_count").notNull().default(0),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
