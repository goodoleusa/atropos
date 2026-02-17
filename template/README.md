# Modular Platform Template

A clean, modular architecture template extracted from SysAdmin Corp. Use this as a starting point for building interactive platforms with AI agents, gamification, campaigns, and admin dashboards.

## Important

These template files are **reference architecture**, not runnable code. When copying to a new project, you'll need to:
- Set up your own `server/db.ts` database connection (Drizzle + PostgreSQL)
- Install dependencies (`drizzle-orm`, `drizzle-zod`, `express`, `@tanstack/react-query`, etc.)
- Configure your `tsconfig.json` path aliases (`@shared/`, `@/components/`, etc.)

## Quick Start

1. Copy this `/template` folder to a new project
2. Search for `TEMPLATE:` comments — these mark every customization point
3. Rename domain concepts to match your project
4. Remove modules you don't need (progression, campaigns, etc.)
5. Set up your database connection and run schema push

## Architecture Overview

```
template/
  shared/
    schema/            # Database schemas split by domain
      index.ts         # Barrel export — add new domains here
      core.ts          # Sessions, clues/items, quests, command logs
      campaigns.ts     # Multi-step workflows, templates, agent modules
      progression.ts   # XP, achievements, daily challenges (optional)
      feedback.ts      # Auto-collected agent feedback, behavioral profiles
      content.ts       # Admin prompts, prompt gallery, flow editor nodes

  server/
    routes/            # API routes split by domain
      index.ts         # Route registration — mount new routes here
      core.ts          # Sessions, clues, quests, commands
      campaigns.ts     # Campaign runs, templates, modules
      feedback.ts      # Feedback CRUD with rate limiting + dedup
      content.ts       # Admin prompts, gallery, flow nodes

    storage/           # Database operations split by domain
      index.ts         # Composed storage instance — add new modules here
      core.ts          # CoreStorage class
      campaigns.ts     # CampaignStorage class
      progression.ts   # ProgressionStorage class
      feedback.ts      # FeedbackStorage class
      content.ts       # ContentStorage class

  client/src/
    pages/
      AdminDashboard.tsx  # Thin shell (~100 lines) — delegates to sections
      admin/
        index.ts          # Section barrel export
        FeedbackSection.tsx # Self-contained admin panel example

    config/
      agentPrompts.ts  # Modular AI prompt system with composable modules

    hooks/
      useFeedbackParser.ts  # Agent feedback detection with safety guards
```

## How to Add a New Feature Domain

### 1. Schema (shared/schema/)

Create `shared/schema/yourFeature.ts`:
```typescript
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const yourItems = pgTable("your_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertYourItemSchema = createInsertSchema(yourItems).omit({
  id: true, createdAt: true,
});

export type YourItem = typeof yourItems.$inferSelect;
export type InsertYourItem = z.infer<typeof insertYourItemSchema>;
```

Add to `shared/schema/index.ts`:
```typescript
export * from "./yourFeature";
```

### 2. Storage (server/storage/)

Create `server/storage/yourFeature.ts`:
```typescript
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { yourItems, type YourItem, type InsertYourItem } from "../../shared/schema";

export class YourFeatureStorage {
  async getAll(): Promise<YourItem[]> {
    return db.select().from(yourItems).orderBy(desc(yourItems.createdAt));
  }

  async create(data: InsertYourItem): Promise<YourItem> {
    const [created] = await db.insert(yourItems).values(data).returning();
    return created;
  }
}
```

Add to `server/storage/index.ts`:
```typescript
import { YourFeatureStorage } from "./yourFeature";

export class DatabaseStorage {
  // ... existing modules
  yourFeature = new YourFeatureStorage();
}
```

### 3. Routes (server/routes/)

Create `server/routes/yourFeature.ts`:
```typescript
import { Router } from "express";
import { storage } from "../storage";

const router = Router();

router.get("/", async (_req, res) => {
  const items = await storage.yourFeature.getAll();
  res.json(items);
});

router.post("/", async (req, res) => {
  const item = await storage.yourFeature.create(req.body);
  res.json(item);
});

export default router;
```

Mount in `server/routes/index.ts`:
```typescript
import yourFeatureRoutes from "./yourFeature";
app.use("/api/your-feature", yourFeatureRoutes);
```

### 4. Admin Section (client/src/pages/admin/)

Create `client/src/pages/admin/YourFeatureSection.tsx` — copy the FeedbackSection pattern.

Add to `AdminDashboard.tsx`:
```typescript
import { YourFeatureSection } from "./admin/YourFeatureSection";

// In NAV_GROUPS:
{ id: "yourFeature", label: "Your Feature" }

// In renderContent():
case 'yourFeature': return <YourFeatureSection />;
```

## Key Patterns

### Agent Prompt Modules
Prompts are composable. Define modules in `agentPrompts.ts` and include only what's needed:
```typescript
const prompt = buildSystemPrompt({
  modules: ['general', 'scanning', 'feedback_reporting'],
  task_focus: 'Investigate the target domain'
});
```

### Agent Auto-Feedback
All agents have `feedback_reporting` module in their prompt. When they observe issues, they emit:
```
[FEEDBACK:bug:high:Scanner timeout:Large scans time out after 30s]
```
The `useFeedbackParser` hook detects these and auto-submits to `/api/feedback` with safety guards:
- Max 20 submissions per session
- Max 3 per message
- 5-second cooldown
- Title-based dedup
- Fire-and-forget (errors never break chat)

Server-side also has: rate limiting, duplicate detection, storage cap, field truncation.

### Admin Dashboard Pattern
The dashboard is a thin shell (~100 lines) that delegates to section components:
- Each section is a standalone file with its own data fetching
- Navigation is defined as a simple array of `{ id, label }` objects
- Adding a section = create file + add nav item + add switch case

## What to Remove

| Module | Remove if you don't need... |
|--------|---------------------------|
| `progression.ts` | XP, achievements, leaderboards |
| `campaigns.ts` | Multi-step guided workflows |
| `content.ts` > flowNodes | Visual flow editor |
| `content.ts` > promptGallery | Community prompt sharing |
| `feedback.ts` > behavioralProfiles | User behavior tracking |

## File Size Guidelines

To prevent the mega-file problem:
- **Schema files**: ~100-200 lines each (one domain per file)
- **Storage files**: ~50-150 lines each (CRUD operations only)
- **Route files**: ~50-150 lines each (thin handlers, delegate to storage)
- **Admin sections**: ~100-200 lines each (self-contained panels)
- **AdminDashboard.tsx**: ~100 lines (nav + switch statement only)
- **Components**: If over 500 lines, split into sub-components

## Comparison: Before vs After

### Before (monolithic)
```
shared/schema.ts          — 1,615 lines (all tables in one file)
server/routes.ts          — 2,610 lines (all routes in one file)
server/storage.ts         — 2,302 lines (all CRUD in one file)
AdminDashboard.tsx        — 2,065 lines (all panels inline)
CampaignDesigner.tsx      — 4,023 lines (entire editor in one file)
```

### After (modular)
```
shared/schema/            — 5 files, ~100-250 lines each
server/routes/            — 5 files, ~50-150 lines each
server/storage/           — 5 files, ~50-150 lines each
pages/admin/              — 1 file per section, ~100-200 lines each
AdminDashboard.tsx        — ~100 lines (thin shell)
```
