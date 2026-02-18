import { db } from "./server/db";
import { agentModules } from "./shared/schema";
import { AGENT_CAMPAIGNS } from "./client/src/config/agentCampaigns";

async function seed() {
  console.log("Seeding APT campaigns directly...");
  let seeded = 0;
  for (const campaign of AGENT_CAMPAIGNS) {
    try {
      await db.insert(agentModules).values({
        moduleId: campaign.id,
        name: campaign.name,
        icon: campaign.icon,
        description: campaign.description,
        difficulty: campaign.difficulty,
        estimatedTime: campaign.estimatedTime,
        tags: campaign.tags,
        color: campaign.color,
        starterPrompt: campaign.starterPrompt,
        objectives: campaign.objectives,
        tools: campaign.tools,
        targetFields: campaign.targetFields || [],
        dummyTargets: campaign.dummyTargets || {},
        steps: campaign.steps || [],
        adaptivePrompts: campaign.adaptivePrompts || [],
        isActive: true,
        sortOrder: seeded
      }).onConflictDoUpdate({
        target: agentModules.moduleId,
        set: {
          name: campaign.name,
          icon: campaign.icon,
          description: campaign.description,
          difficulty: campaign.difficulty,
          estimatedTime: campaign.estimatedTime,
          tags: campaign.tags,
          color: campaign.color,
          starterPrompt: campaign.starterPrompt,
          objectives: campaign.objectives,
          tools: campaign.tools,
          targetFields: campaign.targetFields || [],
          dummyTargets: campaign.dummyTargets || {},
          steps: campaign.steps || [],
          adaptivePrompts: campaign.adaptivePrompts || [],
          isActive: true
        }
      });
      seeded++;
    } catch (e) {
      console.error(`Failed to seed ${campaign.id}:`, e);
    }
  }
  console.log(`Successfully seeded ${seeded} campaigns.`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
