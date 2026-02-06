import { storage } from "../storage";
import type { InsertAchievement } from "../../shared/schema";

// Achievement seed data for the gameplay progression system
export const ACHIEVEMENTS: InsertAchievement[] = [
  // Discovery Achievements
  {
    achievementId: "first_clue",
    name: "First Discovery",
    description: "Find your first clue",
    category: "discovery",
    icon: "🔍",
    requirements: {
      type: "stat",
      condition: { stat: "cluesFound", value: 1 }
    },
    xpReward: 50,
    currencyReward: 10,
    unlocks: [],
    rarity: "common",
    isHidden: false,
    sortOrder: 1,
    isActive: true
  },
  {
    achievementId: "clue_collector",
    name: "Clue Collector",
    description: "Collect 10 clues",
    category: "discovery",
    icon: "📚",
    requirements: {
      type: "stat",
      condition: { stat: "cluesFound", value: 10 }
    },
    xpReward: 100,
    currencyReward: 25,
    unlocks: [],
    rarity: "common",
    isHidden: false,
    sortOrder: 2,
    isActive: true
  },
  {
    achievementId: "master_detective",
    name: "Master Detective",
    description: "Collect 50 clues",
    category: "discovery",
    icon: "🕵️",
    requirements: {
      type: "stat",
      condition: { stat: "cluesFound", value: 50 }
    },
    xpReward: 500,
    currencyReward: 100,
    unlocks: ["tool:advanced_scanner"],
    rarity: "rare",
    isHidden: false,
    sortOrder: 3,
    isActive: true
  },
  {
    achievementId: "hidden_treasure",
    name: "Hidden Treasure",
    description: "Find 5 hidden clues",
    category: "discovery",
    icon: "💎",
    requirements: {
      type: "stat",
      condition: { stat: "hiddenCluesFound", value: 5 }
    },
    xpReward: 300,
    currencyReward: 75,
    unlocks: [],
    rarity: "epic",
    isHidden: false,
    sortOrder: 4,
    isActive: true
  },
  
  // Speed Achievements
  {
    achievementId: "speed_runner",
    name: "Speed Runner",
    description: "Complete a campaign in under 15 minutes",
    category: "speed",
    icon: "⚡",
    requirements: {
      type: "action",
      condition: { action: "campaign_complete", time_under: 15 }
    },
    xpReward: 200,
    currencyReward: 50,
    unlocks: [],
    rarity: "rare",
    isHidden: false,
    sortOrder: 10,
    isActive: true
  },
  {
    achievementId: "lightning_fast",
    name: "Lightning Fast",
    description: "Complete a campaign in under 5 minutes",
    category: "speed",
    icon: "⚡⚡",
    requirements: {
      type: "action",
      condition: { action: "campaign_complete", time_under: 5 }
    },
    xpReward: 500,
    currencyReward: 150,
    unlocks: ["campaign:advanced_speed_run"],
    rarity: "legendary",
    isHidden: false,
    sortOrder: 11,
    isActive: true
  },
  
  // Mastery Achievements
  {
    achievementId: "campaign_complete",
    name: "First Mission",
    description: "Complete your first campaign",
    category: "mastery",
    icon: "🎯",
    requirements: {
      type: "stat",
      condition: { stat: "campaignsCompleted", value: 1 }
    },
    xpReward: 100,
    currencyReward: 20,
    unlocks: [],
    rarity: "common",
    isHidden: false,
    sortOrder: 20,
    isActive: true
  },
  {
    achievementId: "veteran_investigator",
    name: "Veteran Investigator",
    description: "Complete 10 campaigns",
    category: "mastery",
    icon: "🎖️",
    requirements: {
      type: "stat",
      condition: { stat: "campaignsCompleted", value: 10 }
    },
    xpReward: 500,
    currencyReward: 100,
    unlocks: ["campaign:expert_investigations"],
    rarity: "rare",
    isHidden: false,
    sortOrder: 21,
    isActive: true
  },
  {
    achievementId: "legendary_operative",
    name: "Legendary Operative",
    description: "Complete 50 campaigns",
    category: "mastery",
    icon: "👑",
    requirements: {
      type: "stat",
      condition: { stat: "campaignsCompleted", value: 50 }
    },
    xpReward: 2000,
    currencyReward: 500,
    unlocks: ["campaign:legendary_operations"],
    rarity: "legendary",
    isHidden: false,
    sortOrder: 22,
    isActive: true
  },
  
  // Quest Achievements
  {
    achievementId: "quest_starter",
    name: "Quest Starter",
    description: "Complete your first quest",
    category: "mastery",
    icon: "📜",
    requirements: {
      type: "stat",
      condition: { stat: "questsCompleted", value: 1 }
    },
    xpReward: 75,
    currencyReward: 15,
    unlocks: [],
    rarity: "common",
    isHidden: false,
    sortOrder: 30,
    isActive: true
  },
  {
    achievementId: "quest_master",
    name: "Quest Master",
    description: "Complete 20 quests",
    category: "mastery",
    icon: "🏆",
    requirements: {
      type: "stat",
      condition: { stat: "questsCompleted", value: 20 }
    },
    xpReward: 800,
    currencyReward: 200,
    unlocks: [],
    rarity: "epic",
    isHidden: false,
    sortOrder: 31,
    isActive: true
  },
  
  // Level Achievements
  {
    achievementId: "level_10",
    name: "Rising Star",
    description: "Reach level 10",
    category: "mastery",
    icon: "⭐",
    requirements: {
      type: "stat",
      condition: { stat: "level", value: 10 }
    },
    xpReward: 200,
    currencyReward: 50,
    unlocks: [],
    rarity: "common",
    isHidden: false,
    sortOrder: 40,
    isActive: true
  },
  {
    achievementId: "level_25",
    name: "Seasoned Professional",
    description: "Reach level 25",
    category: "mastery",
    icon: "⭐⭐",
    requirements: {
      type: "stat",
      condition: { stat: "level", value: 25 }
    },
    xpReward: 500,
    currencyReward: 150,
    unlocks: ["tool:professional_toolkit"],
    rarity: "rare",
    isHidden: false,
    sortOrder: 41,
    isActive: true
  },
  {
    achievementId: "level_50",
    name: "Elite Operative",
    description: "Reach level 50",
    category: "mastery",
    icon: "⭐⭐⭐",
    requirements: {
      type: "stat",
      condition: { stat: "level", value: 50 }
    },
    xpReward: 1000,
    currencyReward: 300,
    unlocks: ["tool:elite_equipment", "campaign:elite_missions"],
    rarity: "epic",
    isHidden: false,
    sortOrder: 42,
    isActive: true
  },
  {
    achievementId: "level_100",
    name: "Legendary Agent",
    description: "Reach level 100",
    category: "mastery",
    icon: "🌟",
    requirements: {
      type: "stat",
      condition: { stat: "level", value: 100 }
    },
    xpReward: 5000,
    currencyReward: 1000,
    unlocks: ["tool:legendary_arsenal", "campaign:legendary_operations"],
    rarity: "legendary",
    isHidden: false,
    sortOrder: 43,
    isActive: true
  },
  
  // Skill Specialization
  {
    achievementId: "osint_specialist",
    name: "OSINT Specialist",
    description: "Reach 50 OSINT skill points",
    category: "mastery",
    icon: "🔎",
    requirements: {
      type: "stat",
      condition: { stat: "skills.osint", value: 50 }
    },
    xpReward: 300,
    currencyReward: 75,
    unlocks: ["tool:advanced_osint_suite"],
    rarity: "rare",
    isHidden: false,
    sortOrder: 50,
    isActive: true
  },
  {
    achievementId: "network_ninja",
    name: "Network Ninja",
    description: "Reach 50 Network skill points",
    category: "mastery",
    icon: "🌐",
    requirements: {
      type: "stat",
      condition: { stat: "skills.network", value: 50 }
    },
    xpReward: 300,
    currencyReward: 75,
    unlocks: ["tool:advanced_network_tools"],
    rarity: "rare",
    isHidden: false,
    sortOrder: 51,
    isActive: true
  },
  {
    achievementId: "malware_analyst",
    name: "Malware Analyst",
    description: "Reach 50 Malware Analysis skill points",
    category: "mastery",
    icon: "🦠",
    requirements: {
      type: "stat",
      condition: { stat: "skills.malware", value: 50 }
    },
    xpReward: 300,
    currencyReward: 75,
    unlocks: ["tool:malware_sandbox"],
    rarity: "rare",
    isHidden: false,
    sortOrder: 52,
    isActive: true
  },
  {
    achievementId: "social_engineer",
    name: "Social Engineer",
    description: "Reach 50 Social Engineering skill points",
    category: "mastery",
    icon: "🎭",
    requirements: {
      type: "stat",
      condition: { stat: "skills.social", value: 50 }
    },
    xpReward: 300,
    currencyReward: 75,
    unlocks: ["tool:social_engineering_kit"],
    rarity: "rare",
    isHidden: false,
    sortOrder: 53,
    isActive: true
  },
  
  // Special/Hidden Achievements
  {
    achievementId: "early_bird",
    name: "Early Bird",
    description: "Complete a daily challenge before 9 AM",
    category: "special",
    icon: "🌅",
    requirements: {
      type: "special",
      condition: { type: "time_based", check: "early_morning" }
    },
    xpReward: 150,
    currencyReward: 40,
    unlocks: [],
    rarity: "rare",
    isHidden: true,
    sortOrder: 100,
    isActive: true
  },
  {
    achievementId: "night_owl",
    name: "Night Owl",
    description: "Complete a campaign after midnight",
    category: "special",
    icon: "🦉",
    requirements: {
      type: "special",
      condition: { type: "time_based", check: "late_night" }
    },
    xpReward: 150,
    currencyReward: 40,
    unlocks: [],
    rarity: "rare",
    isHidden: true,
    sortOrder: 101,
    isActive: true
  },
  {
    achievementId: "perfect_week",
    name: "Perfect Week",
    description: "Complete all daily challenges for 7 days straight",
    category: "special",
    icon: "📅",
    requirements: {
      type: "special",
      condition: { type: "streak", days: 7 }
    },
    xpReward: 500,
    currencyReward: 150,
    unlocks: [],
    rarity: "epic",
    isHidden: false,
    sortOrder: 102,
    isActive: true
  },
  {
    achievementId: "the_void",
    name: "Into The Void",
    description: "Discover the hidden void",
    category: "special",
    icon: "🕳️",
    requirements: {
      type: "special",
      condition: { type: "location", path: "/void" }
    },
    xpReward: 250,
    currencyReward: 100,
    unlocks: ["campaign:void_investigations"],
    rarity: "epic",
    isHidden: true,
    sortOrder: 103,
    isActive: true
  },
  {
    achievementId: "tool_master",
    name: "Tool Master",
    description: "Use 20 different OSINT tools",
    category: "mastery",
    icon: "🛠️",
    requirements: {
      type: "stat",
      condition: { stat: "toolsUsed", value: 20 }
    },
    xpReward: 400,
    currencyReward: 100,
    unlocks: [],
    rarity: "rare",
    isHidden: false,
    sortOrder: 60,
    isActive: true
  },
  
  // Social Achievements
  {
    achievementId: "helpful_agent",
    name: "Helpful Agent",
    description: "Submit 5 prompts to the gallery",
    category: "social",
    icon: "🤝",
    requirements: {
      type: "action",
      condition: { action: "gallery_submit", count: 5 }
    },
    xpReward: 200,
    currencyReward: 50,
    unlocks: [],
    rarity: "common",
    isHidden: false,
    sortOrder: 70,
    isActive: true
  },
  {
    achievementId: "campaign_creator",
    name: "Campaign Creator",
    description: "Create your first custom campaign",
    category: "social",
    icon: "✨",
    requirements: {
      type: "action",
      condition: { action: "campaign_create", count: 1 }
    },
    xpReward: 300,
    currencyReward: 75,
    unlocks: [],
    rarity: "rare",
    isHidden: false,
    sortOrder: 71,
    isActive: true
  }
];

// Helper function to seed achievements
export async function seedAchievements() {
  console.log("Seeding achievements...");
  
  let created = 0;
  let skipped = 0;
  
  for (const achievement of ACHIEVEMENTS) {
    try {
      // Check if already exists
      const existing = await storage.getAchievementById(achievement.achievementId);
      if (existing) {
        skipped++;
        continue;
      }
      
      await storage.createAchievement(achievement);
      created++;
    } catch (error) {
      console.error(`Failed to seed achievement ${achievement.achievementId}:`, error);
    }
  }
  
  console.log(`Achievements seeded: ${created} created, ${skipped} skipped, ${ACHIEVEMENTS.length} total`);
}
