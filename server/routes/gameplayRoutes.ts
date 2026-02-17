import { Router } from "express";
import { storage } from "../storage";
import { getLevelForXP, XP_LEVELS } from "../../shared/schema";
import { rateLimit, validateSessionToken } from "../security";
import { isAdmin } from "../adminAuth";

const router = Router();

// ==================== XP & Leveling ====================

router.post("/api/gameplay/award-xp", rateLimit(60, 60000), async (req, res) => {
  try {
    const { sessionToken, amount, reason } = req.body;
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Invalid session token" });
    }
    if (!amount || typeof amount !== "number" || amount <= 0 || amount > 5000) {
      return res.status(400).json({ error: "Invalid XP amount (1-5000)" });
    }

    const result = await storage.awardXP(sessionToken, amount, reason || "manual");
    const levelInfo = getLevelForXP(result.newXP);

    res.json({
      ...result,
      title: levelInfo.title,
      xpForNext: levelInfo.xpForNext,
      xpProgress: levelInfo.xpProgress,
    });
  } catch (error) {
    console.error("Award XP error:", error);
    res.status(500).json({ error: "Failed to award XP" });
  }
});

router.get("/api/gameplay/player-stats/:sessionToken", async (req, res) => {
  try {
    const { sessionToken } = req.params;
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Invalid session token" });
    }

    const session = await storage.getSessionByToken(sessionToken);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const levelInfo = getLevelForXP(session.xp || 0);
    const events = await storage.getGameEventsBySession(sessionToken, 20);
    const runs = await storage.getCampaignRunsBySession(sessionToken);

    res.json({
      username: session.username,
      xp: session.xp || 0,
      level: session.level || 1,
      title: levelInfo.title,
      xpForNext: levelInfo.xpForNext,
      xpProgress: levelInfo.xpProgress,
      achievements: session.achievements || [],
      stats: session.stats || {},
      clueCount: session.collectedClues?.length || 0,
      questCount: session.completedQuests?.length || 0,
      campaignRuns: runs.length,
      completedCampaigns: runs.filter(r => r.status === "completed").length,
      recentEvents: events,
      createdAt: session.createdAt,
      lastActive: session.lastActive,
    });
  } catch (error) {
    console.error("Get player stats error:", error);
    res.status(500).json({ error: "Failed to fetch player stats" });
  }
});

router.get("/api/gameplay/xp-levels", (_req, res) => {
  res.json(XP_LEVELS);
});

// ==================== Leaderboard ====================

router.get("/api/gameplay/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const leaderboard = await storage.getLeaderboard(limit);

    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      xp: entry.xp,
      level: entry.level,
      title: getLevelForXP(entry.xp).title,
      clueCount: entry.clueCount,
      questCount: entry.questCount,
    }));

    res.json(ranked);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// ==================== Achievements ====================

router.get("/api/gameplay/achievements", async (_req, res) => {
  try {
    const achievements = await storage.getActiveAchievementDefinitions();
    res.json(achievements);
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

router.get("/api/gameplay/achievements/all", async (_req, res) => {
  try {
    const achievements = await storage.getAllAchievementDefinitions();
    res.json(achievements);
  } catch (error) {
    console.error("Get all achievements error:", error);
    res.status(500).json({ error: "Failed to fetch all achievements" });
  }
});

router.post("/api/gameplay/achievements", isAdmin, rateLimit(30, 60000), async (req, res) => {
  try {
    const { achievementId, ...data } = req.body;
    if (!achievementId || typeof achievementId !== "string") {
      return res.status(400).json({ error: "achievementId is required" });
    }
    const achievement = await storage.upsertAchievementDefinition(achievementId, data);
    res.json(achievement);
  } catch (error) {
    console.error("Create/update achievement error:", error);
    res.status(500).json({ error: "Failed to save achievement" });
  }
});

router.delete("/api/gameplay/achievements/:achievementId", isAdmin, async (req, res) => {
  try {
    const deleted = await storage.deleteAchievementDefinition(req.params.achievementId);
    res.json({ success: deleted });
  } catch (error) {
    console.error("Delete achievement error:", error);
    res.status(500).json({ error: "Failed to delete achievement" });
  }
});

router.post("/api/gameplay/check-achievements/:sessionToken", rateLimit(30, 60000), async (req, res) => {
  try {
    const { sessionToken } = req.params;
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Invalid session token" });
    }

    const session = await storage.getSessionByToken(sessionToken);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const allAchievements = await storage.getActiveAchievementDefinitions();
    const playerAchievements = new Set(session.achievements || []);
    const newUnlocks: { achievementId: string; name: string; xpReward: number }[] = [];
    let totalXP = 0;

    for (const achievement of allAchievements) {
      if (playerAchievements.has(achievement.achievementId)) continue;

      const condition = achievement.condition as any;
      let met = false;

      switch (condition.type) {
        case "clue_count":
          met = (session.collectedClues?.length || 0) >= condition.value;
          break;
        case "quest_count":
          met = (session.completedQuests?.length || 0) >= condition.value;
          break;
        case "xp_threshold":
          met = (session.xp || 0) >= condition.value;
          break;
        case "level_threshold":
          met = (session.level || 1) >= condition.value;
          break;
        case "command_count":
          met = ((session.stats as any)?.commandsRun || 0) >= condition.value;
          break;
        case "campaign_count":
          met = ((session.stats as any)?.campaignsCompleted || 0) >= condition.value;
          break;
        case "specific_clue":
          met = (session.collectedClues || []).includes(condition.value as string);
          break;
        case "specific_quest":
          met = (session.completedQuests || []).includes(condition.value as string);
          break;
        case "streak":
          met = ((session.stats as any)?.longestStreak || 0) >= condition.value;
          break;
        case "time_played":
          met = ((session.stats as any)?.totalPlayTimeMinutes || 0) >= condition.value;
          break;
      }

      if (met) {
        newUnlocks.push({
          achievementId: achievement.achievementId,
          name: achievement.name,
          xpReward: achievement.xpReward,
        });
        totalXP += achievement.xpReward;
        playerAchievements.add(achievement.achievementId);

        await storage.logGameEvent({
          sessionToken,
          eventType: "achievement_unlocked",
          eventData: {
            achievementId: achievement.achievementId,
            name: achievement.name,
            rarity: achievement.rarity,
          },
          xpAwarded: achievement.xpReward,
        });
      }
    }

    if (newUnlocks.length > 0) {
      await storage.updateSession(sessionToken, {
        achievements: Array.from(playerAchievements),
      } as any);

      if (totalXP > 0) {
        await storage.awardXP(sessionToken, totalXP, `Achievement unlocks: ${newUnlocks.map(a => a.name).join(", ")}`);
      }
    }

    res.json({
      checked: allAchievements.length,
      newUnlocks,
      totalXPAwarded: totalXP,
      totalAchievements: playerAchievements.size,
    });
  } catch (error) {
    console.error("Check achievements error:", error);
    res.status(500).json({ error: "Failed to check achievements" });
  }
});

// ==================== Quest Auto-Completion ====================

router.post("/api/gameplay/check-quests/:sessionToken", rateLimit(30, 60000), async (req, res) => {
  try {
    const { sessionToken } = req.params;
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Invalid session token" });
    }

    const result = await storage.checkAndCompleteQuests(sessionToken);
    res.json(result);
  } catch (error) {
    console.error("Check quests error:", error);
    res.status(500).json({ error: "Failed to check quest completion" });
  }
});

// ==================== Game Events ====================

router.get("/api/gameplay/events/:sessionToken", async (req, res) => {
  try {
    const { sessionToken } = req.params;
    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Invalid session token" });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const events = await storage.getGameEventsBySession(sessionToken, limit);
    res.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/api/gameplay/events", async (_req, res) => {
  try {
    const events = await storage.getRecentGameEvents(50);
    res.json(events);
  } catch (error) {
    console.error("Get recent events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ==================== Gameplay Analytics (Admin) ====================

router.get("/api/gameplay/analytics", async (req, res) => {
  try {
    const analytics = await storage.getGameplayAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ==================== Campaign Progress Sync ====================

router.post("/api/gameplay/campaign-checkpoint", rateLimit(60, 60000), async (req, res) => {
  try {
    const { sessionToken, campaignId, runId, currentNodeId, visitedNodes, foundClues, progress } = req.body;

    if (!validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Invalid session token" });
    }

    if (!campaignId) {
      return res.status(400).json({ error: "campaignId is required" });
    }

    let run = runId ? await storage.getCampaignRunById(runId) : null;

    if (!run) {
      const existingRun = await storage.getActiveCampaignRun(sessionToken, campaignId);
      if (existingRun) {
        run = existingRun;
      } else {
        const newRunId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        run = await storage.createCampaignRun({
          runId: newRunId,
          sessionToken,
          campaignId,
          currentNodeId: currentNodeId || null,
          nodeHistory: visitedNodes || [],
          visitedNodes: visitedNodes || [],
          inventory: foundClues || [],
          flags: [],
          variables: { progress: progress || 0 },
          status: "active",
        });

        const session = await storage.getSessionByToken(sessionToken);
        if (session) {
          const currentStats = (session.stats as any) || {};
          await storage.updateSession(sessionToken, {
            stats: {
              ...currentStats,
              campaignsStarted: (currentStats.campaignsStarted || 0) + 1,
            }
          } as any);
        }

        await storage.logGameEvent({
          sessionToken,
          eventType: "campaign_started",
          eventData: { campaignId, runId: newRunId },
          xpAwarded: 50,
        });
        await storage.awardXP(sessionToken, 50, `Started campaign: ${campaignId}`);
      }
    }

    const isComplete = progress >= 100 || req.body.isComplete;
    const updates: any = {
      currentNodeId,
      visitedNodes: visitedNodes || run.visitedNodes,
      nodeHistory: visitedNodes || run.nodeHistory,
      inventory: foundClues || run.inventory,
      variables: { ...run.variables, progress: progress || 0, foundClueCount: foundClues?.length || 0 },
      status: isComplete ? "completed" : "active",
    };

    const updatedRun = await storage.updateCampaignRun(run.runId, updates);

    if (isComplete && run.status !== "completed") {
      const session = await storage.getSessionByToken(sessionToken);
      if (session) {
        const currentStats = (session.stats as any) || {};
        await storage.updateSession(sessionToken, {
          stats: {
            ...currentStats,
            campaignsCompleted: (currentStats.campaignsCompleted || 0) + 1,
          }
        } as any);
      }

      await storage.logGameEvent({
        sessionToken,
        eventType: "campaign_completed",
        eventData: {
          campaignId,
          runId: run.runId,
          nodesVisited: visitedNodes?.length || 0,
          cluesFound: foundClues?.length || 0,
        },
        xpAwarded: 500,
      });
      await storage.awardXP(sessionToken, 500, `Completed campaign: ${campaignId}`);
    }

    res.json({
      run: updatedRun,
      isComplete,
      message: isComplete ? "Campaign completed!" : "Progress saved",
    });
  } catch (error) {
    console.error("Campaign checkpoint error:", error);
    res.status(500).json({ error: "Failed to save campaign progress" });
  }
});

export default router;
