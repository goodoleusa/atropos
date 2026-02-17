export const playerProgression = pgTable("player_progression", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  skills: jsonb("skills").$type<Record<string, number>>().notNull().default({}),
  titles: jsonb("titles").$type<string[]>().notNull().default([]),
  activeTitle: text("active_title"),
  streak: integer("streak").notNull().default(0),
  lastActivityDate: text("last_activity_date"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  achievementId: text("achievement_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tier: text("tier").notNull().default("common"),
  xpReward: integer("xp_reward").notNull().default(10),
  icon: text("icon"),
  condition: jsonb("condition").$type<Record<string, any>>().notNull().default({}),
});

export const playerAchievements = pgTable("player_achievements", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  achievementId: text("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  username: text("username").notNull(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  achievementCount: integer("achievement_count").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  challengeId: text("challenge_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").notNull().default(25),
  activeDate: text("active_date").notNull(),
  condition: jsonb("condition").$type<Record<string, any>>().notNull().default({}),
});

export const challengeCompletions = pgTable("challenge_completions", {
  id: serial("id").primaryKey(),
  sessionToken: text("session_token").notNull(),
  challengeId: text("challenge_id").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});
