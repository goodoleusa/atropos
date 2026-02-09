import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { AGENT_CAMPAIGNS } from './client/src/config/agentCampaigns';
import { SPY_MISSIONS } from './client/src/config/spyMissions';

const OBSIDIAN_VAULT = path.join(process.cwd(), 'obsidian-vault');
const APP_CONFIG = path.join(process.cwd(), 'client/src/config');

async function syncCampaignsFromObsidian() {
  console.log('🔄 Syncing campaigns from Obsidian vault...');
  
  const campaignsDir = path.join(OBSIDIAN_VAULT, 'Campaigns');
  const files = await readdir(campaignsDir);
  const mdFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('.'));
  
  const campaigns: any[] = [];
  
  for (const file of mdFiles) {
    try {
      const filePath = path.join(campaignsDir, file);
      const fileContent = await readFile(filePath, 'utf-8');
      const { data: frontmatter, content } = matter(fileContent);
      
      const campaign = {
        id: frontmatter.id || file.replace('.md', '').toLowerCase(),
        name: frontmatter.name || file.replace('.md', ''),
        icon: frontmatter.icon || '🎯',
        description: content.match(/## Overview\s*([\s\S]*?)(?=##|$)/)?.[1]?.trim() || '',
        difficulty: frontmatter.difficulty || 'intermediate',
        estimatedTime: frontmatter.estimatedTime || '30-45 min',
        tags: frontmatter.tags || [],
        color: frontmatter.color || 'amber',
        targetFields: frontmatter.targetFields || [],
        dummyTargets: frontmatter.dummyTargets || {},
        starterPrompt: content.match(/## Starter Prompt\s*```\s*([\s\S]*?)```/)?.[1]?.trim() || '',
        objectives: frontmatter.objectives || [],
        tools: frontmatter.tools || [],
        learningObjectives: frontmatter.learningObjectives || [],
        skillsRequired: frontmatter.skillsRequired || [],
        skillsTaught: frontmatter.skillsTaught || [],
        learningOutcomes: frontmatter.learningOutcomes || [],
        industryContext: frontmatter.industryContext || '',
        realWorldExamples: frontmatter.realWorldExamples || [],
        careerPaths: frontmatter.careerPaths || [],
        teachingAdaptations: frontmatter.teachingAdaptations || {}
      };
      
      campaigns.push(campaign);
      console.log(`  ✅ Loaded: ${campaign.name}`);
    } catch (error) {
      console.error(`  ❌ Error loading ${file}:`, error);
    }
  }
  
  const outputPath = path.join(APP_CONFIG, 'obsidianCampaigns.ts');
  const tsContent = `// Auto-generated from Obsidian vault
export const OBSIDIAN_CAMPAIGNS = ${JSON.stringify(campaigns, null, 2)};
`;
  
  await writeFile(outputPath, tsContent);
  console.log(`\n✅ Exported ${campaigns.length} campaigns to ${outputPath}`);
}

async function exportToObsidian() {
  console.log('📤 Exporting everything to Obsidian vault...');
  
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
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--to-obsidian')) {
    await exportToObsidian();
  } else {
    await syncCampaignsFromObsidian();
  }
}

main().catch(console.error);
