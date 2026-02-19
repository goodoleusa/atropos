import { Router } from "express";
import { storage } from "../storage";
import { isAdmin } from "../adminAuth";
import { getOpenRouterClient, withCache, logCacheStatus } from "../lib/openrouterClient";

const router = Router();

let lastGenTime = 0;

router.get("/api/curriculum", async (_req, res) => {
  try {
    const tracks = await storage.getAllCurriculumTracks();
    res.json(tracks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/curriculum/:trackId", async (req, res) => {
  try {
    const track = await storage.getCurriculumTrackByTrackId(req.params.trackId);
    if (!track) return res.status(404).json({ error: "Track not found" });
    res.json(track);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/api/curriculum/:trackId", isAdmin, async (req, res) => {
  try {
    const updated = await storage.updateCurriculumTrack(req.params.trackId as string, req.body);
    if (!updated) return res.status(404).json({ error: "Track not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/curriculum", isAdmin, async (req, res) => {
  try {
    const { trackId, ...data } = req.body;
    if (!trackId) return res.status(400).json({ error: "trackId required" });
    const track = await storage.upsertCurriculumTrack(trackId, data);
    res.json(track);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/curriculum/:trackId", isAdmin, async (req, res) => {
  try {
    const deleted = await storage.deleteCurriculumTrack(req.params.trackId as string);
    res.json({ success: deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/curriculum/seed", isAdmin, async (_req, res) => {
  try {
    const { AI_CURRICULUM_TRACKS, OSINT_CURRICULUM_TRACKS } = await import("../../client/src/config/aiCurriculum");
    
    const aiTracks = AI_CURRICULUM_TRACKS.map((t: any) => ({
      trackId: t.id,
      category: "ai",
      name: t.name,
      icon: t.icon,
      description: t.description,
      color: t.color,
      order: t.order,
      prerequisiteTrackIds: t.prerequisiteTrackIds,
      missions: t.missions,
      isActive: true,
    }));

    const osintTracks = OSINT_CURRICULUM_TRACKS.map((t: any) => ({
      trackId: t.id,
      category: "osint",
      name: t.name,
      icon: t.icon,
      description: t.description,
      color: t.color,
      order: t.order,
      prerequisiteTrackIds: t.prerequisiteTrackIds,
      missions: t.missions,
      isActive: true,
    }));

    const results = await storage.seedCurriculumFromStatic([...aiTracks, ...osintTracks]);
    res.json({ seeded: results.length, tracks: results.map(t => ({ trackId: t.trackId, name: t.name, category: t.category })) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/curriculum/stats/overview", async (_req, res) => {
  try {
    const tracks = await storage.getAllCurriculumTracks();
    const aiTracks = tracks.filter(t => t.category === "ai");
    const osintTracks = tracks.filter(t => t.category === "osint");
    
    const countMissions = (t: any) => (t.missions || []).length;
    const countExercises = (t: any) => (t.missions || []).reduce((s: number, m: any) => s + (m.exercises || []).length, 0);
    const countObjectives = (t: any) => (t.missions || []).reduce((s: number, m: any) => s + (m.objectives || []).length, 0);

    res.json({
      totalTracks: tracks.length,
      aiTracks: aiTracks.length,
      osintTracks: osintTracks.length,
      totalMissions: tracks.reduce((s, t) => s + countMissions(t), 0),
      totalExercises: tracks.reduce((s, t) => s + countExercises(t), 0),
      totalObjectives: tracks.reduce((s, t) => s + countObjectives(t), 0),
      tracks: tracks.map(t => ({
        trackId: t.trackId,
        name: t.name,
        category: t.category,
        icon: t.icon,
        color: t.color,
        order: t.order,
        isActive: t.isActive,
        missionCount: countMissions(t),
        exerciseCount: countExercises(t),
        objectiveCount: countObjectives(t),
        updatedAt: t.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/curriculum/generate-draft", isAdmin, async (req, res) => {
  try {
    const now = Date.now();
    if (now - lastGenTime < 5000) {
      return res.status(429).json({ error: "Please wait a few seconds between generation requests" });
    }
    lastGenTime = now;

    const { recIds, painPoints, targetTrackId, targetCategory, difficulty, contentType } = req.body;
    if (!targetTrackId && !targetCategory) {
      return res.status(400).json({ error: "targetTrackId or targetCategory required" });
    }
    if (!contentType || !["mission", "lab", "campaign_flow"].includes(contentType)) {
      return res.status(400).json({ error: "contentType must be mission, lab, or campaign_flow" });
    }

    let recContext = "";
    if (recIds && Array.isArray(recIds) && recIds.length > 0) {
      const allRecs = await storage.getAllRecommendations();
      const selected = allRecs.filter(r => recIds.includes(r.id));
      recContext = selected.map(r =>
        `- [${r.priority}] ${r.title}: ${r.description}${r.painPointsAddressed?.length ? `\n  Pain points: ${r.painPointsAddressed.join(", ")}` : ""}`
      ).join("\n");
    }
    if (painPoints && typeof painPoints === "string" && painPoints.trim()) {
      recContext += (recContext ? "\n" : "") + `- Additional context: ${painPoints.trim()}`;
    }
    if (!recContext) {
      return res.status(400).json({ error: "Provide recIds or painPoints to generate from" });
    }

    let existingTrack = null;
    if (targetTrackId) {
      existingTrack = await storage.getCurriculumTrackByTrackId(targetTrackId);
    }

    const existingMissionNames = existingTrack?.missions?.map((m: any) => m.name).join(", ") || "none yet";

    const systemPrompt = `You are an instructional designer for Atropos, a cybersecurity & AI literacy training platform. You create evidence-based curriculum content following these strict pedagogy rules:

PEDAGOGY FRAMEWORK (non-negotiable):
- 80/20 model: 80% hands-on practice, 20% theory. Every mission must have MORE exercises than lecture content.
- Experiential learning (Kolb's cycle): concrete experience → reflective observation → abstract conceptualization → active experimentation
- Scientific method for AI: null hypothesis framing, no leading questions, demand confidence levels, require counter-evidence, test reproducibility
- Bloom's taxonomy progression: Remember → Understand → Apply → Analyze → Evaluate → Create
- 5 learning style adaptations REQUIRED for every mission: experiential, visual, analytical, social, pragmatic

EXERCISE TYPES (use these exactly):
- prompt_craft: Designing/refining prompts
- comparison: Side-by-side model/approach comparison
- crew_build: Building multi-agent teams
- eval_run: Running evaluations/benchmarks
- observation: Passive data collection and pattern recognition
- debate: Structured argumentation about findings
- failure_analysis: Studying what went wrong and why
- reflection: Meta-cognitive journaling about learning

CONTENT RULES:
- Every objective must be measurable (use action verbs: "identify", "compare", "build", "evaluate")
- Every exercise must have 2-4 specific hints and 2-4 success criteria
- Platform tools must reference actual Atropos tools: AI Lab, Battleground, Agent Chat, Terminal, Scanner, Campaign Designer, Report Builder, SpiderFoot, QR C2 Lab
- Difficulty must be: beginner, intermediate, advanced, or expert
- XP rewards: beginner=100, intermediate=150, advanced=200, expert=300
- Estimated time format: "X-Y min" (e.g., "15-20 min")
- IDs must be snake_case, descriptive, prefixed with track abbreviation

ANTI-SLOP RULES:
- NO generic filler ("in today's digital landscape", "as we all know")
- NO vague objectives ("understand security" — say exactly WHAT they will be able to DO)
- NO exercises without concrete deliverables
- Every hint must be actionable, not motivational
- Success criteria must be verifiable by another person
- teachingAdaptations must be genuinely different approaches, not just reworded versions of the same thing`;

    const userPrompt = contentType === "mission"
      ? `Generate a NEW curriculum mission based on these pain points / recommendations:

${recContext}

TARGET: ${existingTrack ? `Add to track "${existingTrack.name}" (${existingTrack.category} category). Existing missions: ${existingMissionNames}` : `New ${targetCategory} track content`}
DIFFICULTY: ${difficulty || "intermediate"}

Return EXACTLY this JSON structure (no markdown wrapper, pure JSON):
{
  "id": "string (snake_case, track-prefix)",
  "trackId": "${targetTrackId || 'new_track'}",
  "name": "string",
  "icon": "single emoji",
  "description": "1-2 sentences, specific, no fluff",
  "difficulty": "${difficulty || 'intermediate'}",
  "estimatedTime": "X-Y min",
  "xpReward": number,
  "objectives": ["measurable action verb statements"],
  "exercises": [
    {
      "id": "string (snake_case)",
      "title": "string",
      "type": "one of: prompt_craft|comparison|crew_build|eval_run|observation|debate|failure_analysis|reflection",
      "instructions": "detailed step-by-step (3+ sentences)",
      "hints": ["actionable hint 1", "actionable hint 2"],
      "successCriteria": ["verifiable criterion 1", "verifiable criterion 2"]
    }
  ],
  "keyTakeaways": ["concrete lesson learned"],
  "teachingAdaptations": {
    "experiential": "hands-on approach for this specific content",
    "visual": "diagram/chart/visual approach for this specific content",
    "analytical": "theory-first deep-dive for this specific content",
    "social": "collaborative approach for this specific content",
    "pragmatic": "shortcut/cheatsheet approach for this specific content"
  },
  "platformTools": ["actual Atropos tool names"],
  "furtherReading": ["real sources only — books, RFCs, papers, official docs"]
}`
      : contentType === "lab"
      ? `Generate a NEW hands-on lab exercise set based on these pain points / recommendations:

${recContext}

TARGET: ${existingTrack ? `For track "${existingTrack.name}" (${existingTrack.category})` : `New ${targetCategory} content`}
DIFFICULTY: ${difficulty || "intermediate"}

Return EXACTLY this JSON structure (no markdown, pure JSON) — a mission structured as a lab with 3-5 exercises that build on each other sequentially:
{
  "id": "string (snake_case, lab_ prefix)",
  "trackId": "${targetTrackId || 'new_track'}",
  "name": "Lab: [descriptive name]",
  "icon": "🧪",
  "description": "1-2 sentences describing what students will build/investigate",
  "difficulty": "${difficulty || 'intermediate'}",
  "estimatedTime": "30-45 min",
  "xpReward": number,
  "objectives": ["measurable outcomes"],
  "exercises": [
    {
      "id": "string",
      "title": "Step N: [action]",
      "type": "exercise_type",
      "instructions": "detailed walkthrough (5+ sentences for labs)",
      "hints": ["specific technical hints"],
      "successCriteria": ["verifiable deliverable"]
    }
  ],
  "keyTakeaways": ["concrete lessons"],
  "teachingAdaptations": {
    "experiential": "...",
    "visual": "...",
    "analytical": "...",
    "social": "...",
    "pragmatic": "..."
  },
  "platformTools": ["actual Atropos tool names"],
  "furtherReading": ["real sources"]
}`
      : `Generate a campaign investigation flow based on these pain points / recommendations:

${recContext}

TARGET: ${existingTrack ? `For track "${existingTrack.name}" (${existingTrack.category})` : `New ${targetCategory} content`}
DIFFICULTY: ${difficulty || "intermediate"}

Return EXACTLY this JSON structure (no markdown, pure JSON) — a multi-step investigation campaign with branching clue discovery:
{
  "id": "string (snake_case, campaign_ prefix)",
  "trackId": "${targetTrackId || 'new_track'}",
  "name": "Campaign: [investigation name]",
  "icon": "🔍",
  "description": "1-2 sentence scenario setup (who, what, why investigating)",
  "difficulty": "${difficulty || 'intermediate'}",
  "estimatedTime": "45-60 min",
  "xpReward": number,
  "objectives": ["measurable investigation outcomes"],
  "exercises": [
    {
      "id": "string",
      "title": "Phase N: [investigation step]",
      "type": "exercise_type",
      "instructions": "scenario narrative + specific tasks (5+ sentences)",
      "hints": ["investigative leads"],
      "successCriteria": ["evidence found / conclusion reached"]
    }
  ],
  "keyTakeaways": ["tradecraft lessons"],
  "teachingAdaptations": {
    "experiential": "...",
    "visual": "...",
    "analytical": "...",
    "social": "...",
    "pragmatic": "..."
  },
  "platformTools": ["actual Atropos tool names"],
  "furtherReading": ["real case studies, tools, techniques"]
}`;

    const openrouter = getOpenRouterClient();
    const completion = await openrouter.chat.completions.create(withCache({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }, 'curriculum-gen'));

    logCacheStatus(completion, 'curriculum');
    const raw = completion.choices?.[0]?.message?.content || "";
    let draft;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      draft = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      return res.status(422).json({
        error: "AI returned malformed content. Try again or adjust the prompt.",
        raw: raw.slice(0, 2000),
      });
    }

    const requiredFields = ["id", "name", "description", "objectives", "exercises", "keyTakeaways", "teachingAdaptations"];
    const missing = requiredFields.filter(f => !draft[f]);
    if (missing.length > 0) {
      return res.status(422).json({
        error: `Draft missing required fields: ${missing.join(", ")}`,
        draft,
      });
    }

    if (!draft.trackId) draft.trackId = targetTrackId || "new_track";
    if (!draft.difficulty) draft.difficulty = difficulty || "intermediate";
    if (!draft.xpReward) {
      const xpMap: Record<string, number> = { beginner: 100, intermediate: 150, advanced: 200, expert: 300 };
      draft.xpReward = xpMap[draft.difficulty as string] || 150;
    }
    if (!draft.estimatedTime) draft.estimatedTime = "20-30 min";
    if (!draft.platformTools) draft.platformTools = [];
    if (!draft.furtherReading) draft.furtherReading = [];

    const styles = ["experiential", "visual", "analytical", "social", "pragmatic"];
    if (typeof draft.teachingAdaptations !== "object") draft.teachingAdaptations = {};
    for (const s of styles) {
      if (!draft.teachingAdaptations[s]) draft.teachingAdaptations[s] = `[NEEDS ${s.toUpperCase()} ADAPTATION — please fill in]`;
    }

    for (const ex of draft.exercises || []) {
      if (!ex.hints) ex.hints = [];
      if (!ex.successCriteria) ex.successCriteria = [];
      if (!ex.type) ex.type = "observation";
    }

    res.json({
      status: "draft",
      message: "Review this draft carefully. Edit any fields before approving. Nothing is saved until you explicitly approve.",
      contentType,
      targetTrackId: targetTrackId || null,
      draft,
      sourceRecs: recIds || [],
      model: "google/gemini-2.5-flash",
    });
  } catch (error: any) {
    console.error("Curriculum draft generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate draft" });
  }
});

router.post("/api/curriculum/approve-draft", isAdmin, async (req, res) => {
  try {
    const { trackId, mission } = req.body;
    if (!trackId) return res.status(400).json({ error: "trackId required" });
    if (!mission || !mission.id || !mission.name) return res.status(400).json({ error: "mission with id and name required" });

    const track = await storage.getCurriculumTrackByTrackId(trackId);
    if (!track) return res.status(404).json({ error: "Track not found" });

    const existing = track.missions || [];
    if (existing.some((m: any) => m.id === mission.id)) {
      return res.status(409).json({ error: `Mission ID "${mission.id}" already exists in this track. Change the ID.` });
    }

    const updatedMissions = [...existing, mission];
    const updated = await storage.updateCurriculumTrack(trackId, { missions: updatedMissions });
    res.json({
      status: "published",
      message: `Mission "${mission.name}" added to track "${track.name}". It is now live.`,
      track: updated,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
