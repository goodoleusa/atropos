import { Router } from "express";
import { storage } from "../storage";

const router = Router();

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

router.put("/api/curriculum/:trackId", async (req, res) => {
  try {
    const updated = await storage.updateCurriculumTrack(req.params.trackId, req.body);
    if (!updated) return res.status(404).json({ error: "Track not found" });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/curriculum", async (req, res) => {
  try {
    const { trackId, ...data } = req.body;
    if (!trackId) return res.status(400).json({ error: "trackId required" });
    const track = await storage.upsertCurriculumTrack(trackId, data);
    res.json(track);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/curriculum/:trackId", async (req, res) => {
  try {
    const deleted = await storage.deleteCurriculumTrack(req.params.trackId);
    res.json({ success: deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/curriculum/seed", async (_req, res) => {
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

export default router;
