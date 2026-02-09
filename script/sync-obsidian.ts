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
          const s = String(item);
          if (!s.includes(':') && !s.includes('\n') && !s.startsWith('-')) {
            lines.push(`  - ${s}`);
          } else {
            lines.push(`  - "${s.replace(/"/g, '\\"')}"`);
          }
        });
      }
    } else {
      const s = String(value);
      if (!s.includes(':') && !s.includes('\n') && !s.includes('"')) {
        lines.push(`${key}: ${s}`);
      } else {
        lines.push(`${key}: "${s.replace(/"/g, '\\"')}"`);
      }
    }
  }
  return lines.join('\n');
}

async function exportToObsidian() {
  console.log('📤 Exporting everything to Obsidian vault (Twine-style)...');
  
  // Using direct paths with .ts extension for tsx
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
      difficulty: campaign.difficulty,
      tags: campaign.tags,
      icon: campaign.icon
    });

    const content = `---
${yaml}
---

# ${campaign.name}

## Overview
${campaign.description}

## Investigation Mesh (Twine-style)
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
${campaign.objectives?.[0] || 'Start the investigation.'}

### Knowledge Graph
${campaign.objectives?.map((o: string) => `- [[${o}]]`).join('\n') || ''}
${campaign.tools?.map((t: string) => `- [[Tool: ${t}]]`).join('\n') || ''}

## Starter Prompt
\`\`\`
${campaign.starterPrompt}
\`\`\`

## Clues & Discovery
- [[Clue: ${campaign.id}_source]]
- [[Evidence: ${campaign.id}_intel]]
`;
    await writeFile(path.join(campaignsDir, `${campaign.name.replace(/\//g, '-')}.md`), content);
  }

  // 2. Export Missions
  for (const mission of SPY_MISSIONS) {
    const yaml = formatYAML({
      id: mission.id,
      codename: mission.codename,
      phase: mission.phase,
      difficulty: mission.difficulty,
      handler: mission.handler
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
${mission.objectives.map(o => `- [[${o.description}]]`).join('\n')}

## Intel Stream
${mission.intel.map(i => `- [[Intel: ${i.slice(0, 30)}...]]`).join('\n')}
`;
    await writeFile(path.join(missionsDir, `${mission.codename.replace(/\//g, '-')}.md`), content);
  }

  // 3. Export Mystical Messages
  for (const msg of MYSTICAL_MESSAGES) {
    const yaml = formatYAML({
      id: msg.id,
      type: msg.type,
      category: msg.category
    });

    const content = `---
${yaml}
---

# ${msg.id}

## Revelation
${msg.content}

## Connections
- [[Category: ${msg.category}]]
- [[Type: ${msg.type}]]
`;
    await writeFile(path.join(messagesDir, `${msg.id}.md`), content);
  }

  console.log('✅ Export complete. Clean frontmatter and Twine-style wikilinks implemented.');
}

exportToObsidian().catch(console.error);
