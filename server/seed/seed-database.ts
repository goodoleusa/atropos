import { db } from "../db";
import { 
  clues, 
  quests, 
  achievements,
  dailyChallenges,
  mysticalCards,
  artifacts
} from "../../shared/schema";

async function seedClues() {
  console.log("🔍 Seeding clues...");
  
  const clueData = [
    {
      id: "welcome_clue",
      name: "Welcome Message",
      description: "Your first discovery in the system",
      content: "Welcome to Atropos. The investigation begins now.",
      location: "terminal",
      difficulty: 1,
      isActive: true
    },
    {
      id: "hidden_route",
      name: "Hidden Route Discovery",
      description: "Found a secret path in the system",
      content: "Not all routes are visible in the navigation. Some must be discovered.",
      location: "source_code",
      difficulty: 2,
      isActive: true
    },
    {
      id: "admin_access",
      name: "Admin Portal Access",
      description: "Located the administrative interface",
      content: "The admin dashboard holds the keys to the system.",
      location: "/admin",
      difficulty: 3,
      isActive: true
    }
  ];

  for (const clue of clueData) {
    try {
      await db.insert(clues).values(clue).onConflictDoNothing();
    } catch (error) {
      console.log(`  ⚠️  Clue ${clue.id} may already exist`);
    }
  }
  
  console.log(`  ✅ Seeded ${clueData.length} clues`);
}

async function seedQuests() {
  console.log("🎯 Seeding quests...");
  
  const questData = [
    {
      id: "first_steps",
      name: "First Steps",
      description: "Complete your first investigation campaign",
      requiredClues: [],
      reward: "100 XP",
      unlocks: "/campaigns",
      isActive: true
    },
    {
      id: "clue_collector",
      name: "Clue Collector",
      description: "Collect 5 clues from various sources",
      requiredClues: ["welcome_clue", "hidden_route"],
      reward: "250 XP + Intermediate Campaigns",
      unlocks: "/investigate",
      isActive: true
    }
  ];

  for (const quest of questData) {
    try {
      await db.insert(quests).values(quest).onConflictDoNothing();
    } catch (error) {
      console.log(`  ⚠️  Quest ${quest.id} may already exist`);
    }
  }
  
  console.log(`  ✅ Seeded ${questData.length} quests`);
}

async function seedAchievements() {
  console.log("🏆 Seeding achievements...");
  
  const achievementData = [
    {
      achievementId: "first_investigation",
      name: "First Investigation",
      description: "Complete your first campaign",
      category: "discovery",
      icon: "🎯",
      requirements: { type: "stat" as const, condition: { stat: "campaignsCompleted", value: 1 } },
      xpReward: 100,
      currencyReward: 50,
      unlocks: [],
      rarity: "common",
      isHidden: false,
      sortOrder: 1,
      isActive: true
    },
    {
      achievementId: "clue_finder",
      name: "Clue Finder",
      description: "Find 10 clues across investigations",
      category: "discovery",
      icon: "🔍",
      requirements: { type: "stat" as const, condition: { stat: "cluesFound", value: 10 } },
      xpReward: 150,
      currencyReward: 75,
      unlocks: [],
      rarity: "common",
      isHidden: false,
      sortOrder: 2,
      isActive: true
    },
    {
      achievementId: "speed_runner",
      name: "Speed Runner",
      description: "Complete a campaign in under 15 minutes",
      category: "speed",
      icon: "⚡",
      requirements: { type: "action" as const, condition: { action: "complete_fast", timeLimit: 900 } },
      xpReward: 250,
      currencyReward: 150,
      unlocks: [],
      rarity: "rare",
      isHidden: false,
      sortOrder: 10,
      isActive: true
    },
    {
      achievementId: "level_10",
      name: "Rising Star",
      description: "Reach level 10",
      category: "mastery",
      icon: "⭐",
      requirements: { type: "stat" as const, condition: { stat: "level", value: 10 } },
      xpReward: 500,
      currencyReward: 250,
      unlocks: ["tool:advanced_scanner"],
      rarity: "epic",
      isHidden: false,
      sortOrder: 20,
      isActive: true
    },
    {
      achievementId: "hidden_master",
      name: "Hidden Master",
      description: "Find 25 hidden clues",
      category: "discovery",
      icon: "🕵️",
      requirements: { type: "stat" as const, condition: { stat: "hiddenCluesFound", value: 25 } },
      xpReward: 750,
      currencyReward: 500,
      unlocks: ["campaign:expert_investigations"],
      rarity: "epic",
      isHidden: false,
      sortOrder: 30,
      isActive: true
    },
    {
      achievementId: "campaign_master",
      name: "Campaign Master",
      description: "Complete all 23 campaigns",
      category: "mastery",
      icon: "👑",
      requirements: { type: "stat" as const, condition: { stat: "campaignsCompleted", value: 23 } },
      xpReward: 2000,
      currencyReward: 1000,
      unlocks: ["title:Master_Investigator"],
      rarity: "legendary",
      isHidden: false,
      sortOrder: 100,
      isActive: true
    }
  ];

  for (const achievement of achievementData) {
    try {
      await db.insert(achievements).values(achievement).onConflictDoNothing();
    } catch (error) {
      console.log(`  ⚠️  Achievement ${achievement.achievementId} may already exist`);
    }
  }
  
  console.log(`  ✅ Seeded ${achievementData.length} achievements`);
}

async function seedDailyChallenge() {
  console.log("📅 Seeding today's challenge...");
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  
  const challengeData = {
    challengeId: `challenge_${today.toISOString().split('T')[0]}`,
    challengeDate: today,
    type: "mini_investigation",
    title: "Quick Reconnaissance",
    description: "Perform passive reconnaissance on a target domain. Find at least 5 subdomains and identify the technology stack.",
    difficulty: "medium",
    config: {
      requiredClues: [],
      targetTime: 15,
      skillFocus: "osint"
    },
    xpReward: 200,
    currencyReward: 100,
    bonusRewards: [],
    expiresAt: tomorrow,
    isActive: true
  };

  try {
    await db.insert(dailyChallenges).values(challengeData).onConflictDoNothing();
    console.log(`  ✅ Seeded today's challenge`);
  } catch (error) {
    console.log(`  ⚠️  Today's challenge may already exist`);
  }
}

async function seedMysticalCards() {
  console.log("🔮 Seeding mystical cards...");
  
  const cardData = [
    {
      cardId: "tarot_the_fool",
      type: "tarot",
      name: "The Fool",
      symbol: "0",
      hint: "New beginnings and endless possibilities",
      icon: "🃏",
      element: "air",
      enabled: true
    },
    {
      cardId: "tarot_the_magician",
      type: "tarot",
      name: "The Magician",
      symbol: "I",
      hint: "Manifestation and resourcefulness",
      icon: "🎩",
      element: "fire",
      enabled: true
    }
  ];

  for (const card of cardData) {
    try {
      await db.insert(mysticalCards).values(card).onConflictDoNothing();
    } catch (error) {
      console.log(`  ⚠️  Card ${card.cardId} may already exist`);
    }
  }
  
  console.log(`  ✅ Seeded ${cardData.length} mystical cards`);
}

async function seedArtifacts() {
  console.log("💎 Seeding artifacts...");
  
  const artifactData = [
    {
      id: "api_key_fragment",
      name: "API Key Fragment",
      description: "A piece of an API key found in the logs",
      content: "sk_test_4eC39H...",
      category: "credential",
      tags: ["secret", "api_key"],
      isActive: true
    },
    {
      id: "suspicious_ip",
      name: "Suspicious IP Address",
      description: "An IP address appearing in multiple security incidents",
      content: "185.220.101.x",
      category: "intel",
      tags: ["network", "investigation"],
      isActive: true
    }
  ];

  for (const artifact of artifactData) {
    try {
      await db.insert(artifacts).values(artifact).onConflictDoNothing();
    } catch (error) {
      console.log(`  ⚠️  Artifact ${artifact.id} may already exist`);
    }
  }
  
  console.log(`  ✅ Seeded ${artifactData.length} artifacts`);
}

export async function seedDatabase() {
  console.log("\n🌱 Starting database seeding...\n");
  
  try {
    await seedClues();
    await seedQuests();
    await seedAchievements();
    await seedDailyChallenge();
    await seedMysticalCards();
    await seedArtifacts();
    
    console.log("\n✅ Database seeding complete!\n");
    console.log("Visit the platform to start playing:");
    console.log("  - /terminal - Start investigating");
    console.log("  - /profile - Check your progress");
    console.log("  - /campaigns - Browse investigations");
    console.log("  - /leaderboards - See rankings\n");
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    throw error;
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
