#!/usr/bin/env npx tsx
/**
 * Pushes architecture review feature recommendations to /api/recs.
 * Run with server up: npx tsx script/push-architecture-recs.ts
 * Requires: APP_ACCESS_TOKEN in URL or cookie if appAccessGate is enabled.
 */
const BASE = process.env.APP_URL || "http://127.0.0.1:5000";

const RECS: Array<{
  title: string;
  description: string;
  category: string;
  priority: string;
  painPointsAddressed: string[];
  targetFiles?: string[];
  estimatedImpact?: string;
  codeSnippet?: string;
  codeLanguage?: string;
  tags?: string[];
}> = [
  {
    title: "Remove duplicate route registration in server/routes.ts",
    description: "routes.ts registers the same route groups twice (lines 85-125 and 250-287). Remove the duplicate block. Also app.use('/api/atropos', atroposRoutes) is registered twice.",
    category: "systemic",
    priority: "medium",
    painPointsAddressed: ["Code bloat", "Maintenance confusion", "Accidental double middleware"],
    targetFiles: ["server/routes.ts"],
    estimatedImpact: "Cleaner route registration, single source of truth.",
    tags: ["architecture", "cleanup"],
  },
  {
    title: "Add pagination to GET /api/recs",
    description: "GET /api/recs returns all items (up to 300). Add optional ?limit=50&offset=0 query params for large deployments. Default to full list for backward compatibility.",
    category: "integration",
    priority: "low",
    painPointsAddressed: ["Large payload on recs page", "Slower initial load when many recs"],
    targetFiles: ["server/routes/recs.ts"],
    estimatedImpact: "Faster Recs page load when 100+ recommendations exist.",
    codeSnippet: `const limit = Math.min(parseInt(req.query.limit as string) || 500, 100);
const offset = parseInt(req.query.offset as string) || 0;
const items = await storage.getAllRecommendations();
res.json(items.slice(offset, offset + limit));`,
    codeLanguage: "typescript",
    tags: ["api", "performance"],
  },
  {
    title: "Protect POST /api/recs with optional rate limit per session",
    description: "Recs POST has global 2s cooldown but no per-session or per-IP rate limit. Add rateLimit(20, 60000) middleware like other write endpoints to prevent abuse.",
    category: "systemic",
    priority: "medium",
    painPointsAddressed: ["Unbounded rec creation", "Spam from unauthenticated clients"],
    targetFiles: ["server/routes/recs.ts"],
    estimatedImpact: "Reduces rec spam; aligns with other API patterns.",
    tags: ["security", "rate-limiting"],
  },
  {
    title: "Add GET /api/recs/:id for single rec fetch",
    description: "Currently only export/:id exists. Add GET /api/recs/:id to return a single recommendation as JSON for direct linking and embeds.",
    category: "integration",
    priority: "low",
    painPointsAddressed: ["No direct rec link", "Must export to get single item"],
    targetFiles: ["server/routes/recs.ts"],
    estimatedImpact: "Enables /recs/123 deep links and rec cards in other views.",
    codeSnippet: `router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  const rec = await storage.getRecommendationById(id);
  if (!rec) return res.status(404).json({ error: "Not found" });
  res.json(rec);
});`,
    codeLanguage: "typescript",
    tags: ["api", "routing"],
  },
  {
    title: "Connect Recs to Curriculum Dashboard",
    description: "CurriculumSection fetches recs but only displays them. Add 'Apply rec' action that opens AgentChat with the rec as starter prompt or copies to clipboard with toast.",
    category: "integration",
    priority: "medium",
    painPointsAddressed: ["Recs isolated from curriculum flow", "Manual copy-paste to implement"],
    targetFiles: ["client/src/pages/admin/CurriculumSection.tsx", "client/src/pages/Recs.tsx"],
    estimatedImpact: "Faster iteration: curriculum editors can apply recs in one click.",
    tags: ["ux", "curriculum", "recs"],
  },
  {
    title: "Add rec dependency/blockedBy field",
    description: "Allow recs to declare blockedBy: [recId1, recId2] so prioritization and batch prompts respect ordering. Useful for systemic changes that depend on earlier recs.",
    category: "systemic",
    priority: "low",
    painPointsAddressed: ["No rec ordering", "Batch prompts may implement in wrong order"],
    targetFiles: ["shared/schema.ts", "server/routes/recs.ts", "client/src/pages/Recs.tsx"],
    estimatedImpact: "Smarter agent batches; dependency-aware export.",
    tags: ["schema", "recs", "agent-prompt"],
  },
  {
    title: "WebSocket or SSE for real-time recs updates on /recs page",
    description: "Recs page uses TanStack Query with manual invalidateQueries. Add optional SSE endpoint GET /api/recs/stream that pushes { type: 'new', id } when recs change. Client subscribes when tab visible.",
    category: "integration",
    priority: "low",
    painPointsAddressed: ["Stale recs until refresh", "Multi-user collaboration not reflected"],
    targetFiles: ["server/routes/recs.ts", "client/src/pages/Recs.tsx"],
    estimatedImpact: "Live updates when agents or teammates add recs.",
    tags: ["realtime", "sse", "recs"],
  },
];

async function pushRec(rec: (typeof RECS)[0]): Promise<{ ok: boolean; id?: number; error?: string }> {
  const body = {
    title: rec.title,
    description: rec.description,
    category: rec.category,
    priority: rec.priority,
    source: "architect_review",
    painPointsAddressed: rec.painPointsAddressed,
    targetFiles: rec.targetFiles || [],
    estimatedImpact: rec.estimatedImpact || null,
    codeSnippet: rec.codeSnippet || null,
    codeLanguage: rec.codeLanguage || "typescript",
    tags: rec.tags || ["architecture"],
  };
  const res = await fetch(`${BASE}/api/recs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.error || res.statusText };
  }
  const created = await res.json();
  return { ok: true, id: created.id };
}

async function main() {
  console.log(`Pushing ${RECS.length} architecture recs to ${BASE}/api/recs\n`);
  let pushed = 0;
  for (const rec of RECS) {
    const result = await pushRec(rec);
    if (result.ok) {
      console.log(`  OK  #${result.id} ${rec.title.slice(0, 55)}...`);
      pushed++;
    } else {
      console.log(`  FAIL ${rec.title.slice(0, 50)}... — ${result.error}`);
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  console.log(`\nDone. Pushed ${pushed}/${RECS.length} recs.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
