import { Router } from "express";
import { storage } from "../storage";
import { rateLimit } from "../security";
import { 
  behaviorAnalyzer, 
  LEARNING_GOAL_METADATA, 
  LEARNING_STYLE_PROMPTS,
  type LearningGoal,
  type LearningStyle
} from "../behaviorAnalyzer";

const router = Router();

// Log behavioral event
router.post("/api/behavior/log", rateLimit(60, 60000), async (req, res) => {
  try {
    const { sessionToken, actionType, category, intensity, metadata } = req.body;
    
    if (metadata?.message) {
      const analysis = behaviorAnalyzer.analyzeMessage(sessionToken, metadata.message);
      metadata.behaviorAnalysis = analysis;
    }
    
    const profile = await storage.logBehavior({
      sessionToken,
      actionType,
      category,
      intensity: intensity || 1,
      metadata: metadata || {}
    });
    
    res.json(profile);
  } catch (error) {
    console.error("Log behavior error:", error);
    res.status(500).json({ error: "Failed to log behavior" });
  }
});

// Get behavioral trends (admin)
router.get("/api/behavior/trends", async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const trends = await storage.getBehavioralTrends(days);
    
    trends.flaggedSessions = behaviorAnalyzer.getAllFlaggedSessions();
    
    res.json(trends);
  } catch (error) {
    console.error("Get trends error:", error);
    res.status(500).json({ error: "Failed to fetch trends" });
  }
});

// Get all behavioral events (admin)
router.get("/api/behavior/events", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const events = await storage.getAllBehaviors(limit);
    res.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get learning profile for session
router.get("/api/behavior/profile/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const profile = behaviorAnalyzer.getProfile(token);
    res.json(profile || { style: 'experiential', goals: [], interests: [], skillLevel: 'beginner', preferredPace: 'moderate' });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update learning goals
router.post("/api/behavior/goals", async (req, res) => {
  try {
    const { sessionToken, goals } = req.body;
    behaviorAnalyzer.setLearningGoals(sessionToken, goals as LearningGoal[]);
    const profile = behaviorAnalyzer.getProfile(sessionToken);
    res.json(profile);
  } catch (error) {
    console.error("Set goals error:", error);
    res.status(500).json({ error: "Failed to set goals" });
  }
});

// Update learning style
router.post("/api/behavior/style", async (req, res) => {
  try {
    const { sessionToken, style } = req.body;
    behaviorAnalyzer.setLearningStyle(sessionToken, style as LearningStyle);
    const profile = behaviorAnalyzer.getProfile(sessionToken);
    res.json(profile);
  } catch (error) {
    console.error("Set style error:", error);
    res.status(500).json({ error: "Failed to set style" });
  }
});

// Get learning goals metadata
router.get("/api/behavior/goals-metadata", async (_req, res) => {
  res.json(LEARNING_GOAL_METADATA);
});

// Get learning styles metadata
router.get("/api/behavior/styles-metadata", async (_req, res) => {
  res.json(LEARNING_STYLE_PROMPTS);
});

// Generate custom prompt addition based on profile
router.get("/api/behavior/prompt-addition/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const addition = behaviorAnalyzer.generateCustomPromptAddition(token);
    res.json({ promptAddition: addition });
  } catch (error) {
    console.error("Get prompt addition error:", error);
    res.status(500).json({ error: "Failed to generate prompt addition" });
  }
});

// Check if session is flagged
router.get("/api/behavior/flagged/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const flagged = behaviorAnalyzer.isSessionFlagged(token);
    const flags = behaviorAnalyzer.getSessionFlags(token);
    res.json({ flagged, flags });
  } catch (error) {
    console.error("Check flagged error:", error);
    res.status(500).json({ error: "Failed to check flagged status" });
  }
});

export default router;
