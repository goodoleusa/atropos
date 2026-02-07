import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const OBSIDIAN_VAULT = path.join(process.cwd(), 'obsidian-vault');
const APP_CONFIG = path.join(process.cwd(), 'client/src/config');

interface CampaignFrontmatter {
  id: string;
  name: string;
  icon: string;
  difficulty: string;
  estimatedTime: string;
  tags: string[];
  color: string;
  targetFields?: any[];
  dummyTargets?: Record<string, string>;
  learningObjectives?: any[];
  skillsRequired?: string[];
  skillsTaught?: string[];
  learningOutcomes?: string[];
  industryContext?: string;
  realWorldExamples?: string[];
  careerPaths?: string[];
}

async function extractTeachingAdaptations(content: string): Promise<Record<string, string>> {
  const adaptations: Record<string, string> = {};
  const styles = ['experiential', 'visual', 'analytical', 'social', 'pragmatic'];
  
  for (const style of styles) {
    const regex = new RegExp(`### [🔧📊🔬👥⚡] ${style.charAt(0).toUpperCase() + style.slice(1)} Learner\\s*([\\s\\S]*?)(?=###|$)`, 'i');
    const match = content.match(regex);
    if (match) {
      adaptations[style] = match[1].trim().replace(/^<!--.*?-->\s*/gm, '').trim();
    }
  }
  
  return adaptations;
}

async function extractObjectivesAndTools(content: string): Promise<{ objectives: string[]; tools: string[] }> {
  const objectives: string[] = [];
  const tools: string[] = [];
  
  const objectivesMatch = content.match(/## Objectives\s*([\s\S]*?)(?=##|$)/);
  if (objectivesMatch) {
    const lines = objectivesMatch[1].split('\n').filter(l => l.trim().match(/^\d+\./));
    objectives.push(...lines.map(l => l.replace(/^\d+\.\s*/, '').trim()));
  }
  
  const toolsMatch = content.match(/## Tools Required\s*([\s\S]*?)(?=##|$)/);
  if (toolsMatch) {
    const lines = toolsMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
    tools.push(...lines.map(l => l.replace(/^-\s*/, '').trim()));
  }
  
  return { objectives, tools };
}

async function extractStarterPrompt(content: string): Promise<string> {
  const match = content.match(/## Starter Prompt\s*```\s*([\s\S]*?)```/);
  return match ? match[1].trim() : '';
}

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
      
      const teachingAdaptations = await extractTeachingAdaptations(content);
      const { objectives, tools } = await extractObjectivesAndTools(content);
      const starterPrompt = await extractStarterPrompt(content);
      
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
        starterPrompt,
        objectives,
        tools,
        learningObjectives: frontmatter.learningObjectives || [],
        skillsRequired: frontmatter.skillsRequired || [],
        skillsTaught: frontmatter.skillsTaught || [],
        learningOutcomes: frontmatter.learningOutcomes || [],
        industryContext: frontmatter.industryContext || '',
        realWorldExamples: frontmatter.realWorldExamples || [],
        careerPaths: frontmatter.careerPaths || [],
        teachingAdaptations
      };
      
      campaigns.push(campaign);
      console.log(`  ✅ Loaded: ${campaign.name}`);
    } catch (error) {
      console.error(`  ❌ Error loading ${file}:`, error);
    }
  }
  
  const outputPath = path.join(APP_CONFIG, 'obsidianCampaigns.ts');
  const tsContent = `// Auto-generated from Obsidian vault
// Last synced: ${new Date().toISOString()}
// Source: obsidian-vault/Campaigns/
// DO NOT EDIT MANUALLY - Edit in Obsidian and run: npm run sync:campaigns

import type { Campaign } from './agentCampaigns';

export const OBSIDIAN_CAMPAIGNS: Campaign[] = ${JSON.stringify(campaigns, null, 2)};
`;
  
  await writeFile(outputPath, tsContent);
  console.log(`\n✅ Exported ${campaigns.length} campaigns to ${outputPath}`);
  console.log('   Import in agentCampaigns.ts: import { OBSIDIAN_CAMPAIGNS } from "./obsidianCampaigns"');
}

async function syncCampaignsToObsidian() {
  console.log('🔄 Syncing campaigns to Obsidian vault...');
  
  const campaignsPath = path.join(APP_CONFIG, 'agentCampaigns.ts');
  const campaignsContent = await readFile(campaignsPath, 'utf-8');
  
  const campaignsMatch = campaignsContent.match(/export const AGENT_CAMPAIGNS.*?=\s*\[([\s\S]*?)\];/);
  if (!campaignsMatch) {
    console.error('❌ Could not parse AGENT_CAMPAIGNS from agentCampaigns.ts');
    return;
  }
  
  console.log('⚠️  Manual conversion recommended for TypeScript → Markdown');
  console.log('   Use obsidian-vault/Templates/Campaign Template.md to create new campaigns');
  console.log('   Then sync back with: npm run sync:campaigns -- --from-obsidian');
}

async function main() {
  const args = process.argv.slice(2);
  const direction = args.includes('--from-obsidian') ? 'from' : 
                   args.includes('--to-obsidian') ? 'to' : 'from';
  
  try {
    if (direction === 'from') {
      await syncCampaignsFromObsidian();
    } else {
      await syncCampaignsToObsidian();
    }
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

main();
