
import { db } from "./server/db.js";
import { agentModules } from "./shared/schema.js";
import { AGENT_CAMPAIGNS } from "./client/src/config/agentCampaigns.js";

async function seed() {
  console.log("Seeding...");
  for (const c of AGENT_CAMPAIGNS) {
    await db.insert(agentModules).values({
      moduleId: c.id,
      name: c.name,
      icon: c.icon,
      description: c.description,
      difficulty: c.difficulty,
      estimatedTime: c.estimatedTime,
      tags: c.tags,
      color: c.color,
      starterPrompt: c.starterPrompt,
      objectives: c.objectives,
      tools: c.tools,
      targetFields: c.targetFields || [],
      dummyTargets: c.dummyTargets || {},
      steps: c.steps || [],
      adaptivePrompts: c.adaptivePrompts || [],
      isActive: true
    }).onConflictDoUpdate({
      target: agentModules.moduleId,
      set: { isActive: true }
    });
  }
  process.exit(0);
}
seed();
