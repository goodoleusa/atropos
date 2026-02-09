import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const OBSIDIAN_VAULT = path.join(process.cwd(), 'obsidian-vault');

function formatYAML(data: any): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        value.forEach(item => {
          if (typeof item === 'object') {
            lines.push(`  - "${JSON.stringify(item).replace(/"/g, '\\"')}"`);
          } else {
            const s = String(item);
            // Always wrap in quotes for consistency as requested, but ensure no " in values
            lines.push(`  - "${s.replace(/"/g, '')}"`);
          }
        });
      }
    } else {
      const s = String(value);
      // Always wrap in quotes for consistency, ensure no " in values
      lines.push(`${key}: "${s.replace(/"/g, '')}"`);
    }
  }
  return lines.join('\n');
}

async function exportToObsidian() {
  console.log('📤 Exporting everything to Obsidian vault (Consistent Quotes)...');
  
  const { AGENT_CAMPAIGNS } = await import('../client/src/config/agentCampaigns.ts');
  const { SPY_MISSIONS } = await import('../client/src/config/spyMissions.ts');
  const { MYSTICAL_MESSAGES } = await import('../client/src/config/messages.ts');

  const campaignsDir = path.join(OBSIDIAN_VAULT, 'Campaigns');
  const missionsDir = path.join(OBSIDIAN_VAULT, 'Missions');
  const messagesDir = path.join(OBSIDIAN_VAULT, 'MysticalMessages');
  
  await mkdir(campaignsDir, { recursive: true });
  await mkdir(missionsDir, { recursive: true });
  await mkdir(messagesDir, { recursive: true });

  // 1. Export Campaigns
  for (const campaign of AGENT_CAMPAIGNS) {
    const yaml = formatYAML({
      id: campaign.id,
      name: campaign.name,
      type: 'campaign',
      difficulty: campaign.difficulty,
      tags: campaign.tags,
      icon: campaign.icon,
      color: campaign.color,
      estimatedTime: campaign.estimatedTime,
      up: '[[INDEX]]',
      next: campaign.objectives?.[0] ? `[[${campaign.objectives[0].replace(/"/g, '')}]]` : '',
      objectives: campaign.objectives || [],
      tools: campaign.tools || [],
      skills: campaign.skillsTaught || []
    });

    const content = `---
${yaml}
---

# ${campaign.name}

## Overview
${campaign.description}

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
${campaign.objectives?.[0] || 'Start the investigation.'}

### Knowledge Graph
${campaign.objectives?.map((o: string) => `- [[${o.replace(/"/g, '')}]]`).join('\n') || ''}
${campaign.tools?.map((t: string) => `- [[Tool: ${t.replace(/"/g, '')}]]`).join('\n') || ''}

## Starter Prompt
\`\`\`
${campaign.starterPrompt}
\`\`\`
`;
    // Ensure filename doesn't have quotes
    const safeName = campaign.name.replace(/\//g, '-').replace(/"/g, '');
    await writeFile(path.join(campaignsDir, `${safeName}.md`), content);
  }

  // 2. Export Missions
  for (const mission of SPY_MISSIONS) {
    const yaml = formatYAML({
      id: mission.id,
      codename: mission.codename,
      type: 'mission',
      phase: mission.phase,
      difficulty: mission.difficulty,
      handler: mission.handler,
      up: '[[Missions Index]]',
      status: 'available'
    });

    const content = `---
${yaml}
---

# Mission: ${mission.codename}

## Briefing
${mission.briefing}

## Mission Nodes
- [[Phase: ${mission.phase}]]
- [[Handler: ${mission.handler}]]

### Tactical Objectives
${mission.objectives.map(o => `- [[${o.description.replace(/"/g, '')}]]`).join('\n')}
`;
    const safeName = mission.codename.replace(/\//g, '-').replace(/"/g, '');
    await writeFile(path.join(missionsDir, `${safeName}.md`), content);
  }

  // 3. Export Mystical Messages
  for (const msg of MYSTICAL_MESSAGES) {
    const yaml = formatYAML({
      id: msg.id,
      type: 'mystical-message',
      category: msg.category,
      msg_type: msg.type,
      up: '[[The Void]]'
    });

    const content = `---
${yaml}
---

# ${msg.id}

## Revelation
${msg.content}
`;
    const safeName = msg.id.replace(/"/g, '');
    await writeFile(path.join(messagesDir, `${safeName}.md`), content);
  }

  console.log('✅ Export complete with consistent quoted frontmatter.');
}

exportToObsidian().catch(console.error);
