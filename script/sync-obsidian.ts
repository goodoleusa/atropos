#!/usr/bin/env tsx
import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

const VAULT_PATH = 'obsidian-vault';
const CAMPAIGNS_PATH = join(VAULT_PATH, 'Campaigns');
const LEARNING_PATHS_PATH = join(VAULT_PATH, 'Learning-Paths');
const ACHIEVEMENTS_PATH = join(VAULT_PATH, 'Achievements');

interface CampaignFrontmatter {
  id: string;
  name: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: string;
  tags: string[];
  color: string;
  targetFields?: any[];
  dummyTargets?: Record<string, string>;
  learningObjectives?: { goal: string; weight: number; description: string }[];
  skillsRequired?: string[];
  skillsTaught?: string[];
  learningOutcomes?: string[];
  industryContext?: string;
  realWorldExamples?: string[];
  careerPaths?: string[];
}

interface LearningPathFrontmatter {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  estimatedHours: number;
  tools: string[];
  targetRoles: string[];
  salaryRange: string;
  contains: string[];
}

interface AchievementFrontmatter {
  id: string;
  name: string;
  category: string;
  rarity: string;
  icon: string;
  isHidden: boolean;
  sortOrder: number;
  requirementType: string;
  requirementCondition: any;
  xpReward: number;
  currencyReward: number;
  unlocks: string[];
}

function extractStarterPrompt(content: string): string {
  const match = content.match(/## Starter Prompt\s*```\s*([\s\S]*?)```/);
  return match ? match[1].trim() : '';
}

function extractObjectives(content: string): string[] {
  const match = content.match(/## Objectives\s*((?:\d+\.\s+.+\n?)+)/);
  if (!match) return [];
  return match[1].split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^\d+\.\s+/, '').trim());
}

function extractTools(content: string): string[] {
  const match = content.match(/## Tools Required\s*((?:-\s+.+\n?)+)/);
  if (!match) return [];
  return match[1].split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^-\s+/, '').trim());
}

function extractTeachingAdaptations(content: string): Record<string, string> {
  const adaptations: Record<string, string> = {};
  
  const styles = [
    { key: 'experiential', emoji: '🔧' },
    { key: 'visual', emoji: '📊' },
    { key: 'analytical', emoji: '🔬' },
    { key: 'social', emoji: '👥' },
    { key: 'pragmatic', emoji: '⚡' }
  ];
  
  for (const style of styles) {
    const regex = new RegExp(`### ${style.emoji} ${style.key.charAt(0).toUpperCase() + style.key.slice(1)} Learner\\s*([\\s\\S]*?)(?=###|##|$)`, 'i');
    const match = content.match(regex);
    if (match) {
      adaptations[style.key] = match[1].trim().replace(/<!--[\s\S]*?-->/g, '').trim();
    }
  }
  
  return adaptations;
}

async function syncCampaignsFromObsidian() {
  console.log('📥 Syncing campaigns from Obsidian to app...\n');
  
  try {
    const files = await readdir(CAMPAIGNS_PATH);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const campaigns: any[] = [];
    
    for (const file of mdFiles) {
      const filePath = join(CAMPAIGNS_PATH, file);
      const fileContent = await readFile(filePath, 'utf-8');
      const { data: frontmatter, content } = matter(fileContent);
      
      const fm = frontmatter as CampaignFrontmatter;
      
      if (fm.status === 'draft') {
        console.log(`⏭️  Skipping draft: ${fm.name}`);
        continue;
      }
      
      const campaign = {
        id: fm.id,
        name: fm.name,
        icon: fm.icon || '🎯',
        description: content.split('\n')[0].replace(/^#+ /, '').trim(),
        difficulty: fm.difficulty,
        estimatedTime: fm.estimatedTime,
        tags: fm.tags || [],
        color: fm.color || 'amber',
        targetFields: fm.targetFields || [],
        dummyTargets: fm.dummyTargets || {},
        starterPrompt: extractStarterPrompt(content),
        objectives: extractObjectives(content),
        tools: extractTools(content),
        learningObjectives: fm.learningObjectives || [],
        skillsRequired: fm.skillsRequired || [],
        skillsTaught: fm.skillsTaught || [],
        learningOutcomes: fm.learningOutcomes || [],
        industryContext: fm.industryContext || '',
        realWorldExamples: fm.realWorldExamples || [],
        careerPaths: fm.careerPaths || [],
        teachingAdaptations: extractTeachingAdaptations(content)
      };
      
      campaigns.push(campaign);
      console.log(`✅ Processed: ${campaign.name} (${campaign.difficulty})`);
    }
    
    // Generate TypeScript code
    const tsCode = `// AUTO-GENERATED from Obsidian vault
// Last sync: ${new Date().toISOString()}
// DO NOT EDIT DIRECTLY - Edit in obsidian-vault/Campaigns/ and run: npm run sync:campaigns

import type { Campaign, LearningObjective, CampaignTargetField, TargetFieldType } from './agentCampaigns';

export const OBSIDIAN_CAMPAIGNS: Campaign[] = ${JSON.stringify(campaigns, null, 2)
  .replace(/"([a-z]+)":/g, '$1:')  // Remove quotes from keys
  .replace(/: "([^"]+)"/g, ": '$1'")  // Single quotes for strings
};

// To use: Import and merge with AGENT_CAMPAIGNS
// Example: export const AGENT_CAMPAIGNS = [...AGENT_CAMPAIGNS, ...OBSIDIAN_CAMPAIGNS];
`;
    
    await writeFile('client/src/config/obsidianCampaigns.ts', tsCode);
    
    console.log(`\n✅ Synced ${campaigns.length} campaigns to client/src/config/obsidianCampaigns.ts`);
    console.log(`\n💡 To integrate: Import OBSIDIAN_CAMPAIGNS in agentCampaigns.ts`);
    
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

async function syncCampaignsToObsidian() {
  console.log('📤 Syncing campaigns from app to Obsidian...\n');
  
  try {
    // Import campaigns from app
    const { AGENT_CAMPAIGNS } = await import('../client/src/config/agentCampaigns.js');
    
    for (const campaign of AGENT_CAMPAIGNS) {
      const fileName = `${campaign.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ')}.md`;
      const filePath = join(CAMPAIGNS_PATH, fileName);
      
      // Build frontmatter
      const frontmatter: any = {
        id: campaign.id,
        name: campaign.name,
        type: 'campaign',
        status: 'published',
        created: new Date().toISOString().split('T')[0],
        modified: new Date().toISOString().split('T')[0],
        icon: campaign.icon,
        difficulty: campaign.difficulty,
        estimatedTime: campaign.estimatedTime,
        tags: campaign.tags,
        color: campaign.color
      };
      
      if (campaign.targetFields) frontmatter.targetFields = campaign.targetFields;
      if (campaign.dummyTargets) frontmatter.dummyTargets = campaign.dummyTargets;
      if (campaign.learningObjectives) frontmatter.learningObjectives = campaign.learningObjectives;
      if (campaign.skillsRequired) frontmatter.skillsRequired = campaign.skillsRequired;
      if (campaign.skillsTaught) frontmatter.skillsTaught = campaign.skillsTaught;
      if (campaign.learningOutcomes) frontmatter.learningOutcomes = campaign.learningOutcomes;
      if (campaign.industryContext) frontmatter.industryContext = campaign.industryContext;
      if (campaign.realWorldExamples) frontmatter.realWorldExamples = campaign.realWorldExamples;
      if (campaign.careerPaths) frontmatter.careerPaths = campaign.careerPaths;
      
      // Build markdown content
      let markdown = '---\n';
      markdown += Object.entries(frontmatter)
        .map(([key, value]) => {
          if (Array.isArray(value) || typeof value === 'object') {
            return `${key}:\n${JSON.stringify(value, null, 2).split('\n').map(l => '  ' + l).join('\n')}`;
          }
          return `${key}: ${JSON.stringify(value)}`;
        })
        .join('\n');
      markdown += '\n---\n\n';
      
      markdown += `# ${campaign.name}\n\n`;
      markdown += `${campaign.description}\n\n`;
      
      markdown += `## Objectives\n`;
      campaign.objectives?.forEach((obj: string, i: number) => {
        markdown += `${i + 1}. ${obj}\n`;
      });
      markdown += '\n';
      
      markdown += `## Tools Required\n`;
      campaign.tools?.forEach((tool: string) => {
        markdown += `- ${tool}\n`;
      });
      markdown += '\n';
      
      markdown += `## Starter Prompt\n\`\`\`\n${campaign.starterPrompt}\n\`\`\`\n\n`;
      
      if (campaign.teachingAdaptations) {
        markdown += `## Teaching Adaptations\n\n`;
        const styles = [
          { key: 'experiential', emoji: '🔧', name: 'Experiential' },
          { key: 'visual', emoji: '📊', name: 'Visual' },
          { key: 'analytical', emoji: '🔬', name: 'Analytical' },
          { key: 'social', emoji: '👥', name: 'Social' },
          { key: 'pragmatic', emoji: '⚡', name: 'Pragmatic' }
        ];
        
        for (const style of styles) {
          const adaptation = (campaign.teachingAdaptations as any)[style.key];
          if (adaptation) {
            markdown += `### ${style.emoji} ${style.name} Learner\n${adaptation}\n\n`;
          }
        }
      }
      
      await writeFile(filePath, markdown);
      console.log(`✅ Exported: ${campaign.name}`);
    }
    
    console.log(`\n✅ Synced ${AGENT_CAMPAIGNS.length} campaigns to Obsidian vault`);
    
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

async function syncAchievementsFromObsidian() {
  console.log('📥 Syncing achievements from Obsidian to app...\n');
  
  try {
    const files = await readdir(ACHIEVEMENTS_PATH);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const achievements: any[] = [];
    
    for (const file of mdFiles) {
      const filePath = join(ACHIEVEMENTS_PATH, file);
      const fileContent = await readFile(filePath, 'utf-8');
      const { data: frontmatter } = matter(fileContent);
      
      const fm = frontmatter as AchievementFrontmatter;
      
      if (fm.status === 'draft') {
        console.log(`⏭️  Skipping draft: ${fm.name}`);
        continue;
      }
      
      const achievement = {
        achievementId: fm.id,
        name: fm.name,
        description: extractDescription(fileContent),
        category: fm.category,
        icon: fm.icon,
        requirements: {
          type: fm.requirementType,
          condition: fm.requirementCondition
        },
        xpReward: fm.xpReward,
        currencyReward: fm.currencyReward,
        unlocks: fm.unlocks || [],
        rarity: fm.rarity,
        isHidden: fm.isHidden,
        sortOrder: fm.sortOrder,
        isActive: true
      };
      
      achievements.push(achievement);
      console.log(`✅ Processed: ${achievement.name} (${achievement.rarity})`);
    }
    
    // Generate TypeScript code
    const tsCode = `// AUTO-GENERATED from Obsidian vault
// Last sync: ${new Date().toISOString()}
// DO NOT EDIT DIRECTLY - Edit in obsidian-vault/Achievements/ and run: npm run sync:achievements

import type { InsertAchievement } from '../../shared/schema';

export const OBSIDIAN_ACHIEVEMENTS: InsertAchievement[] = ${JSON.stringify(achievements, null, 2)};

// To load into database:
// import { storage } from './server/storage';
// for (const achievement of OBSIDIAN_ACHIEVEMENTS) {
//   await storage.createAchievement(achievement);
// }
`;
    
    await writeFile('server/seed/obsidianAchievements.ts', tsCode);
    
    console.log(`\n✅ Synced ${achievements.length} achievements to server/seed/obsidianAchievements.ts`);
    
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

function extractDescription(content: string): string {
  const match = content.match(/## Description\s*(?:<!--[\s\S]*?-->\s*)?([\s\S]*?)(?=\n##|$)/);
  return match ? match[1].trim() : '';
}

async function syncLearningPathsFromObsidian() {
  console.log('📥 Syncing learning paths from Obsidian to app...\n');
  
  try {
    const files = await readdir(LEARNING_PATHS_PATH);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    const paths: any[] = [];
    
    for (const file of mdFiles) {
      const filePath = join(LEARNING_PATHS_PATH, file);
      const fileContent = await readFile(filePath, 'utf-8');
      const { data: frontmatter, content } = matter(fileContent);
      
      const fm = frontmatter as LearningPathFrontmatter;
      
      const path = {
        id: fm.id,
        name: fm.name,
        category: fm.category,
        difficulty: fm.difficulty,
        estimatedHours: fm.estimatedHours,
        tools: fm.tools || [],
        targetRoles: fm.targetRoles || [],
        salaryRange: fm.salaryRange,
        modules: extractModules(content),
        careerOutcomes: extractCareerOutcomes(content)
      };
      
      paths.push(path);
      console.log(`✅ Processed: ${path.name}`);
    }
    
    // Generate TypeScript code
    const tsCode = `// AUTO-GENERATED from Obsidian vault
// Last sync: ${new Date().toISOString()}

export const OBSIDIAN_LEARNING_PATHS = ${JSON.stringify(paths, null, 2)};
`;
    
    await writeFile('client/src/config/obsidianLearningPaths.ts', tsCode);
    
    console.log(`\n✅ Synced ${paths.length} learning paths to client/src/config/obsidianLearningPaths.ts`);
    
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

function extractModules(content: string): any[] {
  const modules: any[] = [];
  const moduleRegex = /#### Module (\d+\.\d+):\s+(.*?)\n[\s\S]*?- \*\*Campaign\*\*:\s+\[\[(.*?)\]\][\s\S]*?- \*\*Skills\*\*:\s+(.*?)\n[\s\S]*?- \*\*Deliverable\*\*:\s+(.*?)(?=\n\n|####|$)/g;
  
  let match;
  while ((match = moduleRegex.exec(content)) !== null) {
    modules.push({
      id: match[1],
      name: match[2],
      campaign: match[3],
      skills: match[4],
      deliverable: match[5]
    });
  }
  
  return modules;
}

function extractCareerOutcomes(content: string): any {
  const match = content.match(/### Job Roles\s*([\s\S]*?)(?=\n##|$)/);
  if (!match) return {};
  
  return {
    roles: match[1].trim()
  };
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  console.log('🔄 Atropos ↔️ Obsidian Sync Tool\n');
  
  if (!command || command === '--help') {
    console.log(`Usage:
  tsx script/sync-obsidian.ts <command>

Commands:
  campaigns:from-obsidian    Sync campaigns FROM Obsidian TO app
  campaigns:to-obsidian      Sync campaigns FROM app TO Obsidian
  achievements:from-obsidian Sync achievements FROM Obsidian TO app
  learning-paths:from-obsidian Sync learning paths FROM Obsidian TO app
  all:from-obsidian          Sync everything FROM Obsidian
  all:to-obsidian            Sync everything TO Obsidian

Examples:
  npm run sync:campaigns -- campaigns:from-obsidian
  npm run sync:all -- all:to-obsidian
`);
    process.exit(0);
  }
  
  switch (command) {
    case 'campaigns:from-obsidian':
      await syncCampaignsFromObsidian();
      break;
    case 'campaigns:to-obsidian':
      await syncCampaignsToObsidian();
      break;
    case 'achievements:from-obsidian':
      await syncAchievementsFromObsidian();
      break;
    case 'learning-paths:from-obsidian':
      await syncLearningPathsFromObsidian();
      break;
    case 'all:from-obsidian':
      await syncCampaignsFromObsidian();
      await syncAchievementsFromObsidian();
      await syncLearningPathsFromObsidian();
      break;
    case 'all:to-obsidian':
      await syncCampaignsToObsidian();
      console.log('\n💡 Achievements and learning paths are created in Obsidian manually');
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run with --help to see available commands');
      process.exit(1);
  }
  
  console.log('\n✨ Sync complete!');
}

main();
