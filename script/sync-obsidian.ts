import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const OBSIDIAN_VAULT = path.join(process.cwd(), 'obsidian-vault');
const APP_CONFIG = path.join(process.cwd(), 'client/src/config');

// Helper to extract exported arrays from TS files using regex (safer than imports for script context)
async function extractArray(filePath: string, variableName: string): Promise<any[]> {
  const content = await readFile(filePath, 'utf-8');
  const regex = new RegExp(`export const ${variableName}:.*?=\\s*\\[([\\s\\S]*?)\\];`, 'm');
  const match = content.match(regex);
  if (!match) return [];
  
  try {
    // Basic attempt to parse JSON-like array. In a real app, we'd use a better parser or proper TS compilation
    // For this prototype, we'll try to use a simplified version of the data
    return JSON.parse(`[${match[1]}]`);
  } catch (e) {
    console.error(`Failed to parse ${variableName} from ${filePath}`);
    return [];
  }
}

async function exportToObsidian() {
  console.log('📤 Exporting everything to Obsidian vault...');
  
  // For the purpose of this script, we'll use the files directly since standard imports are failing in tsx context
  const { AGENT_CAMPAIGNS } = await import('../client/src/config/agentCampaigns.ts');
  const { SPY_MISSIONS } = await import('../client/src/config/spyMissions.ts');
  const { MYSTICAL_MESSAGES } = await import('../client/src/config/messages.ts');

  // 1. Export Campaigns
  const campaignsDir = path.join(OBSIDIAN_VAULT, 'Campaigns');
  await mkdir(campaignsDir, { recursive: true });

  for (const campaign of AGENT_CAMPAIGNS) {
    const frontmatter = {
      id: campaign.id,
      name: campaign.name,
      icon: campaign.icon,
      difficulty: campaign.difficulty,
      estimatedTime: campaign.estimatedTime,
      tags: campaign.tags,
      color: campaign.color,
      targetFields: campaign.targetFields,
      dummyTargets: campaign.dummyTargets,
      learningObjectives: campaign.learningObjectives,
      skillsRequired: campaign.skillsRequired,
      skillsTaught: campaign.skillsTaught,
      learningOutcomes: campaign.learningOutcomes,
      industryContext: campaign.industryContext,
      realWorldExamples: campaign.realWorldExamples,
      careerPaths: campaign.careerPaths,
      teachingAdaptations: campaign.teachingAdaptations
    };

    const content = `---
${JSON.stringify(frontmatter, null, 2)}
---

# ${campaign.name}

## Overview
${campaign.description}

## Objectives
${campaign.objectives?.map((o: string, i: number) => `${i + 1}. ${o}`).join('\n') || ''}

## Tools Required
${campaign.tools?.map((t: string) => `- ${t}`).join('\n') || ''}

## Starter Prompt
\`\`\`
${campaign.starterPrompt}
\`\`\`
`;
    await writeFile(path.join(campaignsDir, `${campaign.name.replace(/\//g, '-')}.md`), content);
    console.log(`  ✅ Exported Campaign: ${campaign.name}`);
  }

  // 2. Export Missions
  const missionsDir = path.join(OBSIDIAN_VAULT, 'Missions');
  await mkdir(missionsDir, { recursive: true });

  for (const mission of SPY_MISSIONS) {
    const content = `---
id: ${mission.id}
codename: ${mission.codename}
classification: ${mission.classification}
phase: ${mission.phase}
difficulty: ${mission.difficulty}
handler: ${mission.handler}
---

# Mission: ${mission.codename}

## Briefing
${mission.briefing}

## Objectives
${mission.objectives.map(o => `### ${o.description}\n- **Hint**: ${o.hint}\n- **Points**: ${o.points}`).join('\n\n')}

## Intel
${mission.intel.map(i => `- ${i}`).join('\n')}

## Success Criteria
${mission.successCriteria.map(s => `- ${s}`).join('\n')}
`;
    await writeFile(path.join(missionsDir, `${mission.codename.replace(/\//g, '-')}.md`), content);
    console.log(`  ✅ Exported Mission: ${mission.codename}`);
  }

  // 3. Export Mystical Messages
  const messagesDir = path.join(OBSIDIAN_VAULT, 'MysticalMessages');
  await mkdir(messagesDir, { recursive: true });

  for (const msg of MYSTICAL_MESSAGES) {
    const content = `---
id: ${msg.id}
type: ${msg.type}
category: ${msg.category}
---

# Message: ${msg.id}

## Content
${msg.content}
`;
    await writeFile(path.join(messagesDir, `${msg.id}.md`), content);
    console.log(`  ✅ Exported Message: ${msg.id}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--to-obsidian')) {
    await exportToObsidian();
  }
}

main().catch(console.error);
