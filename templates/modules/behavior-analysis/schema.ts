export const behavioralProfiles = pgTable("behavioral_profiles", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  actionType: text("action_type").notNull(),
  category: text("category").notNull().default("general"),
  intensity: integer("intensity").notNull().default(1),
  metadata: jsonb("metadata").$type<Record<string, any>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
