import { Router } from "express";
import { storage } from "../storage";
import { insertPlayerProgressionSchema, insertAchievementSchema, insertDailyChallengeSchema, insertChallengeCompletionSchema } from "../../shared/schema";
import { rateLimit, validateSessionToken, sanitizeInput, adminAuth } from "../security";

const router = Router();

// ==================== Player Progression ====================

// Get player progression
router.get("/api/progression/:sessionToken", async (req, res) => {
  try {
    const { sessionToken } = req.params;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    let progression = await storage.getPlayerProgression(sessionToken);
    
    // Create if doesn't exist
    if (!progression) {
      progression = await storage.createPlayerProgression({
        sessionToken,
        level: 1,
        xp: 0,
        totalXp: 0
      });
    }
    
    res.json(progression);
  } catch (error) {
    console.error("Get progression error:", error);
    res.status(500).json({ error: "Failed to get progression" });
  }
});

// Award XP (should only be called server-side, admin endpoint for testing)
router.post("/api/progression/:sessionToken/xp", adminAuth, rateLimit(60, 60000), async (req, res) => {
  try {
    const { sessionToken } = req.params;
    const { xp, source } = req.body;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    if (!xp || typeof xp !== 'number' || xp <= 0) {
      return res.status(400).json({ error: 'Valid XP amount required' });
    }
    
    const result = await storage.addXP(sessionToken, xp, source);
    
    res.json(result);
  } catch (error) {
    console.error("Award XP error:", error);
    res.status(500).json({ error: "Failed to award XP" });
  }
});

// Update skill (admin only for manual adjustments)
router.post("/api/progression/:sessionToken/skill", adminAuth, rateLimit(60, 60000), async (req, res) => {
  try {
    const { sessionToken } = req.params;
    const { skill, points } = req.body;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    if (!['osint', 'network', 'malware', 'social'].includes(skill)) {
      return res.status(400).json({ error: 'Invalid skill type' });
    }
    
    const result = await storage.updateSkill(sessionToken, skill, points || 1);
    
    res.json(result);
  } catch (error) {
    console.error("Update skill error:", error);
    res.status(500).json({ error: "Failed to update skill" });
  }
});

// Add currency (admin only)
router.post("/api/progression/:sessionToken/currency", adminAuth, rateLimit(60, 60000), async (req, res) => {
  try {
    const { sessionToken } = req.params;
    const { amount } = req.body;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Valid amount required' });
    }
    
    const result = await storage.addCurrency(sessionToken, amount);
    
    res.json(result);
  } catch (error) {
    console.error("Add currency error:", error);
    res.status(500).json({ error: "Failed to add currency" });
  }
});

// ==================== Achievements ====================

// Get all achievements
router.get("/api/achievements", async (_req, res) => {
  try {
    const achievements = await storage.getAllAchievements();
    res.json(achievements);
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({ error: "Failed to get achievements" });
  }
});

// Get player achievements
router.get("/api/achievements/player/:sessionToken", async (req, res) => {
  try {
    const { sessionToken } = req.params;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    const achievements = await storage.getPlayerAchievements(sessionToken);
    res.json(achievements);
  } catch (error) {
    console.error("Get player achievements error:", error);
    res.status(500).json({ error: "Failed to get player achievements" });
  }
});

// Unlock achievement
router.post("/api/achievements/unlock", rateLimit(30, 60000), async (req, res) => {
  try {
    const { sessionToken, achievementId, metadata } = req.body;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    if (!achievementId) {
      return res.status(400).json({ error: 'Achievement ID required' });
    }
    
    const result = await storage.unlockAchievement(sessionToken, achievementId, metadata);
    
    res.json(result);
  } catch (error) {
    console.error("Unlock achievement error:", error);
    res.status(500).json({ error: "Failed to unlock achievement" });
  }
});

// Check achievement progress
router.get("/api/achievements/check/:sessionToken/:achievementId", async (req, res) => {
  try {
    const { sessionToken, achievementId } = req.params;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    const progress = await storage.checkAchievementProgress(sessionToken, achievementId);
    
    res.json(progress);
  } catch (error) {
    console.error("Check achievement progress error:", error);
    res.status(500).json({ error: "Failed to check achievement progress" });
  }
});

// Create achievement (admin only)
router.post("/api/achievements", adminAuth, rateLimit(10, 60000), async (req, res) => {
  try {
    const validated = insertAchievementSchema.parse(req.body);
    const achievement = await storage.createAchievement(validated);
    res.json(achievement);
  } catch (error) {
    console.error("Create achievement error:", error);
    res.status(500).json({ error: "Failed to create achievement" });
  }
});

// ==================== Leaderboards ====================

// Get leaderboard
router.get("/api/leaderboard/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    
    const leaderboard = await storage.getLeaderboard(type, limit);
    
    res.json(leaderboard);
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

// Get player rank
router.get("/api/leaderboard/:type/rank/:sessionToken", async (req, res) => {
  try {
    const { type, sessionToken } = req.params;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    const rank = await storage.getPlayerRank(sessionToken, type);
    
    res.json(rank);
  } catch (error) {
    console.error("Get player rank error:", error);
    res.status(500).json({ error: "Failed to get player rank" });
  }
});

// Update leaderboard entry
router.post("/api/leaderboard", rateLimit(30, 60000), async (req, res) => {
  try {
    const { sessionToken, leaderboardType, score, username, metadata } = req.body;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    const entry = await storage.updateLeaderboardEntry({
      sessionToken,
      username: username || 'Player',
      leaderboardType,
      score,
      metadata: metadata || {}
    });
    
    res.json(entry);
  } catch (error) {
    console.error("Update leaderboard error:", error);
    res.status(500).json({ error: "Failed to update leaderboard" });
  }
});

// ==================== Daily Challenges ====================

// Get today's challenge
router.get("/api/challenges/today", async (_req, res) => {
  try {
    const challenge = await storage.getTodayChallenge();
    
    if (!challenge) {
      return res.status(404).json({ error: "No challenge available today" });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error("Get today challenge error:", error);
    res.status(500).json({ error: "Failed to get today's challenge" });
  }
});

// Get all challenges
router.get("/api/challenges", async (req, res) => {
  try {
    const includeExpired = req.query.includeExpired === 'true';
    const challenges = await storage.getDailyChallenges(includeExpired);
    
    res.json(challenges);
  } catch (error) {
    console.error("Get challenges error:", error);
    res.status(500).json({ error: "Failed to get challenges" });
  }
});

// Get player completions
router.get("/api/challenges/completions/:sessionToken", async (req, res) => {
  try {
    const { sessionToken } = req.params;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    const completions = await storage.getChallengeCompletions(sessionToken);
    
    res.json(completions);
  } catch (error) {
    console.error("Get challenge completions error:", error);
    res.status(500).json({ error: "Failed to get challenge completions" });
  }
});

// Complete challenge
router.post("/api/challenges/complete", rateLimit(20, 60000), async (req, res) => {
  try {
    const { sessionToken, challengeId, score, timeSpent, metrics } = req.body;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    if (!challengeId) {
      return res.status(400).json({ error: 'Challenge ID required' });
    }
    
    // Check if already completed
    const alreadyCompleted = await storage.hasChallengeCompleted(sessionToken, challengeId);
    if (alreadyCompleted) {
      return res.status(400).json({ error: 'Challenge already completed' });
    }
    
    const result = await storage.completeChallenge({
      sessionToken,
      challengeId,
      score: score || 0,
      timeSpent: timeSpent || 0,
      metrics: metrics || {}
    });
    
    res.json(result);
  } catch (error) {
    console.error("Complete challenge error:", error);
    res.status(500).json({ error: "Failed to complete challenge" });
  }
});

// Create challenge (admin only)
router.post("/api/challenges", adminAuth, rateLimit(10, 60000), async (req, res) => {
  try {
    const validated = insertDailyChallengeSchema.parse(req.body);
    const challenge = await storage.createDailyChallenge(validated);
    res.json(challenge);
  } catch (error) {
    console.error("Create challenge error:", error);
    res.status(500).json({ error: "Failed to create challenge" });
  }
});

// ==================== Campaign Stats ====================

// Get campaign stats
router.get("/api/campaigns/:campaignId/stats", async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const stats = await storage.getCampaignStats(campaignId);
    
    if (!stats) {
      return res.status(404).json({ error: "Campaign stats not found" });
    }
    
    res.json(stats);
  } catch (error) {
    console.error("Get campaign stats error:", error);
    res.status(500).json({ error: "Failed to get campaign stats" });
  }
});

// Record campaign attempt
router.post("/api/campaigns/:campaignId/attempt", rateLimit(30, 60000), async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { sessionToken } = req.body;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    await storage.recordCampaignAttempt(campaignId, sessionToken);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Record campaign attempt error:", error);
    res.status(500).json({ error: "Failed to record campaign attempt" });
  }
});

// Record campaign completion
router.post("/api/campaigns/:campaignId/complete", rateLimit(30, 60000), async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { sessionToken, timeMinutes, rating } = req.body;
    
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: 'Invalid session token format' });
    }
    
    if (!timeMinutes || typeof timeMinutes !== 'number') {
      return res.status(400).json({ error: 'Valid time in minutes required' });
    }
    
    await storage.recordCampaignCompletion(campaignId, sessionToken, timeMinutes, rating);
    
    // Award XP for completion
    await storage.addXP(sessionToken, 100, `campaign:${campaignId}`);
    
    // Update stats
    const prog = await storage.getPlayerProgression(sessionToken);
    if (prog) {
      const stats = prog.stats || {
        campaignsCompleted: 0,
        cluesFound: 0,
        hiddenCluesFound: 0,
        questsCompleted: 0,
        toolsUsed: 0,
        totalPlayTimeMinutes: 0,
        longestStreak: 0,
        currentStreak: 0
      };
      
      stats.campaignsCompleted = (stats.campaignsCompleted || 0) + 1;
      stats.totalPlayTimeMinutes = (stats.totalPlayTimeMinutes || 0) + timeMinutes;
      
      if (!stats.fastestCampaignTime || timeMinutes < stats.fastestCampaignTime) {
        stats.fastestCampaignTime = timeMinutes;
      }
      
      await storage.updatePlayerProgression(sessionToken, { stats });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Record campaign completion error:", error);
    res.status(500).json({ error: "Failed to record campaign completion" });
  }
});

export default router;
