import { Campaign, CampaignNode } from './CampaignTypes';

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '_');

const NATION_STATE_TAGS = ['Russia', 'China', 'DPRK', 'Iran'];
const APT_INDICATOR_TAGS = ['APT', ...NATION_STATE_TAGS];
const MITRE_TECHNIQUE_PATTERN = /^T\d{4}(\.\d{3})?$/;
const CISA_REFERENCE_PATTERN = /(?:CISA|AA\d{2}-\d{3}[A-Z]?|advisory|CVE-\d{4}-\d+)/gi;

const hasAptTags = (tags: string[]): boolean =>
  tags.some(t => APT_INDICATOR_TAGS.some(apt => t.toUpperCase().includes(apt.toUpperCase())) || /^APT\d+$/i.test(t));

const extractNationState = (tags: string[]): string | undefined =>
  tags.find(t => NATION_STATE_TAGS.some(ns => t.toUpperCase() === ns.toUpperCase()));

const extractThreatGroup = (tags: string[]): string | undefined =>
  tags.find(t => /^APT\d+$/i.test(t)) || tags.find(t => t.toUpperCase().includes('APT'));

const extractMitreTechniques = (tags: string[]): string[] =>
  tags.filter(t => MITRE_TECHNIQUE_PATTERN.test(t));

const extractSourceReferences = (description: string): string[] => {
  const matches = description.match(CISA_REFERENCE_PATTERN);
  return matches ? Array.from(new Set(matches)) : [];
};

export function mergeFrontmatter(
  existing: Record<string, unknown>,
  newFields: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...existing };
  for (const [key, newVal] of Object.entries(newFields)) {
    const existingVal = merged[key];
    if (existingVal === undefined || existingVal === null) {
      merged[key] = newVal;
    } else if (Array.isArray(existingVal) && Array.isArray(newVal)) {
      merged[key] = Array.from(new Set([...existingVal, ...newVal]));
    }
  }
  return merged;
}

const yamlVal = (v: unknown): string => {
  if (Array.isArray(v)) return `\n${v.map(i => `  - ${i}`).join('\n')}`;
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  const s = String(v);
  if (s.includes('<%')) return s;
  return /[:#\[\]{}&*!|>'"%@`]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s;
};

const buildYaml = (fm: Record<string, unknown>) => {
  let y = '---\n';
  Object.entries(fm).forEach(([k, v]) => {
    if (v === undefined || v === null || (Array.isArray(v) && v.length === 0)) return;
    y += `${k}: ${yamlVal(v)}\n`;
  });
  y += '---\n';
  return y;
};

const EXCALIBRAIN_COLORS: Record<string, string> = {
  step: '#d97706',
  decision: '#8b5cf6',
  tool: '#14b8a6',
  output: '#ef4444',
  folder: '#78716c',
};

const EXCALIBRAIN_SHAPES: Record<string, string> = {
  step: 'box',
  decision: 'diamond',
  tool: 'oval',
  output: 'hexagon',
  folder: 'box',
};

const buildTemplaterBlock = (node: CampaignNode, campaign: Campaign) => {
  const lines = [
    `<%*`,
    `const tp = this.app.plugins.plugins["templater-obsidian"].templater.current_functions_object;`,
    `const dv = this.app.plugins.plugins["dataview"]?.api;`,
    `const nodeType = "${node.type}";`,
    `const campaignId = "${campaign.id}";`,
    `const campaignName = "${campaign.name.replace(/"/g, '\\"')}";`,
    `const nodeId = "${node.id}";`,
    `const difficulty = "${campaign.difficulty}";`,
    `const category = "${campaign.category}";`,
    `const pageLayout = "${node.pageLayout || 'card'}";`,
  ];
  if (node.metadata?.skillLevel) {
    lines.push(`const skillLevel = "${node.metadata.skillLevel}";`);
  }
  if (node.metadata?.featureType) {
    lines.push(`const featureType = "${node.metadata.featureType}";`);
  }
  lines.push(`const createdDate = tp.date.now("YYYY-MM-DD");`);
  lines.push(`const modifiedDate = tp.date.now("YYYY-MM-DD");`);
  lines.push(`%>`);
  return lines.join('\n') + '\n';
};

const buildIndexTemplaterBlock = (campaign: Campaign) => {
  const lines = [
    `<%*`,
    `const tp = this.app.plugins.plugins["templater-obsidian"].templater.current_functions_object;`,
    `const dv = this.app.plugins.plugins["dataview"]?.api;`,
    `const campaignId = "${campaign.id}";`,
    `const campaignName = "${campaign.name.replace(/"/g, '\\"')}";`,
    `const nodeCount = ${campaign.nodes.length};`,
    `const linkCount = ${campaign.links.length};`,
    `const clueCount = ${(campaign.hiddenClues || []).length};`,
    `const missionCount = ${(campaign.terminalMissions || []).length};`,
    `const totalMissionXP = ${(campaign.terminalMissions || []).reduce((sum, m) => sum + (m.xpReward || 0), 0)};`,
    `const difficulty = "${campaign.difficulty}";`,
    `const category = "${campaign.category}";`,
    `const estimatedTime = "${campaign.estimatedTime}";`,
    `const isPublished = ${campaign.isPublished};`,
    `const createdDate = tp.date.now("YYYY-MM-DD");`,
    `%>`,
  ];
  return lines.join('\n') + '\n';
};

const buildMissionTemplaterBlock = (mission: any, campaign: Campaign) => {
  const lines = [
    `<%*`,
    `const tp = this.app.plugins.plugins["templater-obsidian"].templater.current_functions_object;`,
    `const dv = this.app.plugins.plugins["dataview"]?.api;`,
    `const missionId = "${mission.id}";`,
    `const missionName = "${(mission.name || '').replace(/"/g, '\\"')}";`,
    `const command = "${(mission.command || '').replace(/"/g, '\\"')}";`,
    `const campaignId = "${campaign.id}";`,
    `const campaignName = "${campaign.name.replace(/"/g, '\\"')}";`,
    `const xpReward = ${mission.xpReward || 0};`,
    `const createdDate = tp.date.now("YYYY-MM-DD");`,
    `%>`,
  ];
  return lines.join('\n') + '\n';
};

export function exportCampaignJSON(campaign: Campaign) {
  const json = JSON.stringify(campaign, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${campaign.name.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCampaignObsidian(campaign: Campaign) {
  const today = new Date().toISOString().split('T')[0];
  const campaignTag = `campaign/${campaign.name.replace(/\s+/g, '-')}`;
  const nodeClues = (nodeId: string) => (campaign.hiddenClues || []).filter(c => c.nodeId === nodeId);
  const isEntry = (id: string) => campaign.entryPoints?.includes(id);
  const isExit = (id: string) => campaign.exitPoints?.includes(id);

  const siblingMap: Record<string, string[]> = {};
  campaign.nodes.forEach(node => {
    const parents = campaign.links.filter(l => l.target === node.id).map(l => l.source);
    parents.forEach(parentId => {
      const siblings = campaign.links
        .filter(l => l.source === parentId && l.target !== node.id)
        .map(l => l.target);
      if (siblings.length > 0) {
        siblingMap[node.id] = [...(siblingMap[node.id] || []), ...siblings];
      }
    });
  });

  const files: { name: string; content: string }[] = [];
  const missions = campaign.terminalMissions || [];
  const nodeMissions = (nodeId: string) => missions.filter(m => m.triggerNodeId === nodeId);

  campaign.nodes.forEach(node => {
    const nodeLinks = campaign.links.filter(l => l.source === node.id || l.target === node.id);
    const outgoing = nodeLinks.filter(l => l.source === node.id);
    const incoming = nodeLinks.filter(l => l.target === node.id);
    const clues = nodeClues(node.id);
    const nodeMissionList = nodeMissions(node.id);
    const siblings = Array.from(new Set(siblingMap[node.id] || []));

    const parentRefs = incoming.map(l => {
      const src = campaign.nodes.find(n => n.id === l.source);
      return `[[${sanitizeFilename(src?.title || l.source)}]]`;
    });
    const childRefs = outgoing.map(l => {
      const tgt = campaign.nodes.find(n => n.id === l.target);
      return `[[${sanitizeFilename(tgt?.title || l.target)}]]`;
    });
    const siblingRefs = siblings.map(sid => {
      const sib = campaign.nodes.find(n => n.id === sid);
      return `[[${sanitizeFilename(sib?.title || sid)}]]`;
    });

    const fm: Record<string, unknown> = {
      id: node.id,
      type: node.type,
      color: node.color,
      'BC-folder-note-subtext': node.type,
      'excalidraw-plugin': 'parsed',
      'excalibrain-node-style-prefix': node.type,
      'excalibrain-color': EXCALIBRAIN_COLORS[node.type] || '#d97706',
      'excalibrain-shape': EXCALIBRAIN_SHAPES[node.type] || 'box',
      'page-layout': node.pageLayout || 'card',
      cssclass: `atropos-${node.type}`,
      tags: [campaignTag, node.type, `layout/${node.pageLayout || 'card'}`, campaign.category],
      aliases: [node.title],
      created: today,
      modified: today,
      campaign: campaign.name,
      'campaign-id': campaign.id,
      category: campaign.category,
      difficulty: campaign.difficulty,
      'estimated-time': campaign.estimatedTime,
      published: campaign.isPublished,
      'sitemap-path': `/play/${campaign.id}`,
      'sitemap-category': 'Campaigns & Learning',
    };

    if (parentRefs.length > 0) fm['parent'] = parentRefs;
    if (childRefs.length > 0) fm['child'] = childRefs;
    if (siblingRefs.length > 0) fm['sibling'] = siblingRefs;

    fm['BC-campaign-index'] = `[[_${sanitizeFilename(campaign.name)}_Index]]`;

    if (node.metadata?.skillLevel) fm['skill-level'] = node.metadata.skillLevel;
    if (node.metadata?.featureType) fm['feature-type'] = node.metadata.featureType;
    if (node.metadata?.campaignType) fm['campaign-type'] = node.metadata.campaignType;
    if (isEntry(node.id)) fm['entry-point'] = true;
    if (isExit(node.id)) fm['exit-point'] = true;

    if (node.metadata?.toolsForStep?.length) fm['tools'] = node.metadata.toolsForStep;
    if (node.metadata?.questions?.length) fm['questions'] = node.metadata.questions;
    if (node.metadata?.successIndicators?.length) fm['success-indicators'] = node.metadata.successIndicators;
    if (node.metadata?.redFlags?.length) fm['red-flags'] = node.metadata.redFlags;
    if (node.metadata?.learningGoals?.length) fm['learning-goals'] = node.metadata.learningGoals;
    if (node.metadata?.skills?.length) fm['skills'] = node.metadata.skills;
    if (node.metadata?.linkedClues?.length) fm['linked-clues'] = node.metadata.linkedClues;
    if (node.metadata?.condition) fm['condition'] = node.metadata.condition;
    if (node.metadata?.parentOutcome) fm['parent-outcome'] = node.metadata.parentOutcome;
    if (node.metadata?.nextStepId) fm['next-step'] = node.metadata.nextStepId;
    if (clues.length > 0) {
      fm['hidden-clue-count'] = clues.length;
      fm['hidden-clue-types'] = Array.from(new Set(clues.map(c => c.type)));
    }
    if (nodeMissionList.length > 0) {
      fm['terminal-mission-count'] = nodeMissionList.length;
      fm['terminal-missions'] = nodeMissionList.map(m => `[[Mission_${sanitizeFilename(m.name)}]]`);
      fm['terminal-xp-total'] = nodeMissionList.reduce((sum, m) => sum + (m.xpReward || 0), 0);
    }
    fm['position-x'] = node.x;
    fm['position-y'] = node.y;
    fm['width'] = node.width;
    fm['height'] = node.height;

    const allTags = [...(campaign.tags || []), ...(fm['tags'] as string[] || [])];
    if (hasAptTags(allTags)) {
      const threatGroup = extractThreatGroup(allTags);
      const nationState = extractNationState(allTags);
      const mitreTechniques = extractMitreTechniques(allTags);
      const sourceRefs = extractSourceReferences(campaign.description || '');

      if (threatGroup) fm['threat-group'] = threatGroup;
      if (nationState) {
        fm['nation-state'] = nationState;
        fm['excalibrain-color'] = '#dc2626';
      }
      if (mitreTechniques.length > 0) {
        fm['mitre-techniques'] = mitreTechniques;
        if (!nationState) fm['excalibrain-color'] = '#ea580c';
      }
      fm['case-study'] = true;
      fm['classification'] = 'PUBLIC';
      if (sourceRefs.length > 0) fm['source-references'] = sourceRefs;
    }

    let md = buildTemplaterBlock(node, campaign);
    md += buildYaml(fm);
    md += `\n# ${node.title}\n\n`;
    md += `> [!info] ${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node\n`;
    md += `> Layout: ${node.pageLayout || 'card'} | Color: ${node.color} | Category: ${campaign.category}`;
    if (isEntry(node.id)) md += ` | ENTRY POINT`;
    if (isExit(node.id)) md += ` | EXIT POINT`;
    md += '\n\n';

    if (node.content) md += `## Content\n\n${node.content}\n\n`;

    md += `## Relations\n\n`;
    if (incoming.length > 0) {
      md += `### Parents\n`;
      incoming.forEach(l => {
        const src = campaign.nodes.find(n => n.id === l.source);
        md += `- parent:: [[${sanitizeFilename(src?.title || l.source)}]]`;
        if (l.relation && l.relation !== 'parent') md += ` (${l.relation})`;
        if (l.condition) md += ` | condition: ${l.condition}`;
        md += '\n';
      });
      md += '\n';
    }
    if (outgoing.length > 0) {
      md += `### Children\n`;
      outgoing.forEach(l => {
        const tgt = campaign.nodes.find(n => n.id === l.target);
        md += `- child:: [[${sanitizeFilename(tgt?.title || l.target)}]]`;
        if (l.relation && l.relation !== 'child') md += ` (${l.relation})`;
        if (l.label) md += ` | ${l.label}`;
        if (l.condition) md += ` | condition: ${l.condition}`;
        md += '\n';
      });
      md += '\n';
    }
    if (siblingRefs.length > 0) {
      md += `### Siblings\n`;
      siblingRefs.forEach(ref => {
        md += `- sibling:: ${ref}\n`;
      });
      md += '\n';
    }

    if (node.metadata?.learningGoals?.length) {
      md += `## Learning Goals\n\n`;
      node.metadata.learningGoals.forEach(g => { md += `- ${g}\n`; });
      md += '\n';
    }
    if (node.metadata?.toolsForStep?.length) {
      md += `## Tools\n\n`;
      node.metadata.toolsForStep.forEach(t => { md += `- \`${t}\`\n`; });
      md += '\n';
    }
    if (node.metadata?.skills?.length) {
      md += `## Skills\n\n`;
      node.metadata.skills.forEach(s => { md += `- ${s}\n`; });
      md += '\n';
    }
    if (node.metadata?.questions?.length) {
      md += `## Investigation Questions\n\n`;
      node.metadata.questions.forEach(q => { md += `- [ ] ${q}\n`; });
      md += '\n';
    }
    if (node.metadata?.successIndicators?.length) {
      md += `## Success Indicators\n\n`;
      node.metadata.successIndicators.forEach(s => { md += `- ${s}\n`; });
      md += '\n';
    }
    if (node.metadata?.redFlags?.length) {
      md += `## Red Flags\n\n`;
      node.metadata.redFlags.forEach(f => { md += `- ${f}\n`; });
      md += '\n';
    }
    if (clues.length > 0) {
      md += `## Hidden Clues\n\n`;
      clues.forEach(c => {
        md += `> [!warning] Clue: ${c.type}\n`;
        md += `> **Hint**: ${c.hint}\n`;
        md += `> **Value**: \`${c.value}\`\n`;
        md += `> ID: ${c.id}\n\n`;
      });
    }
    if (nodeMissionList.length > 0) {
      md += `## Terminal Missions\n\n`;
      nodeMissionList.forEach(m => {
        md += `> [!terminal] Mission: ${m.name}\n`;
        md += `> **Command**: \`${m.command}\`\n`;
        if (m.description) md += `> **Objective**: ${m.description}\n`;
        md += `> **XP Reward**: ${m.xpReward}\n`;
        if (m.hint) md += `> **Hint**: ${m.hint}\n`;
        if (m.expectedOutput) md += `> **Expected Output**: \`${m.expectedOutput}\`\n`;
        if (m.toolsRequired?.length) md += `> **Tools**: ${m.toolsRequired.join(', ')}\n`;
        md += `> Link: [[Mission_${sanitizeFilename(m.name)}]]\n\n`;
      });
    }

    if (node.metadata?.teachingNotes) {
      md += `## Teaching Notes\n\n${node.metadata.teachingNotes}\n\n`;
    }

    md += `## Dataview Queries\n\n`;
    md += '```dataview\n';
    md += `TABLE type, skill-level, tools, hidden-clue-count as "Clues"\n`;
    md += `FROM #${campaignTag}\n`;
    md += `WHERE file.name != this.file.name\n`;
    md += `SORT type ASC\n`;
    md += '```\n\n';

    md += '```dataview\n';
    md += `LIST FROM [[${sanitizeFilename(node.title)}]]\n`;
    md += '```\n';

    files.push({ name: `${sanitizeFilename(node.title)}.md`, content: md });
  });

  const indexFm: Record<string, unknown> = {
    title: campaign.name,
    description: campaign.description,
    type: 'campaign-index',
    'BC-folder-note': true,
    'BC-folder-note-subtext': 'campaign-index',
    'excalibrain-node-style-prefix': 'campaign',
    'excalibrain-color': '#f59e0b',
    'excalibrain-shape': 'hexagon',
    cssclass: 'atropos-campaign-index',
    category: campaign.category,
    difficulty: campaign.difficulty,
    'estimated-time': campaign.estimatedTime,
    published: campaign.isPublished,
    'sitemap-path': `/play/${campaign.id}`,
    'sitemap-category': 'Campaigns & Learning',
    'sitemap-synced': true,
    'is-chunk': campaign.isChunk || false,
    'node-count': campaign.nodes.length,
    'link-count': campaign.links.length,
    'clue-count': (campaign.hiddenClues || []).length,
    'mission-count': missions.length,
    'mission-total-xp': missions.reduce((sum, m) => sum + (m.xpReward || 0), 0),
    child: [
      ...campaign.nodes.map(n => `[[${sanitizeFilename(n.title)}]]`),
      ...missions.map(m => `[[Mission_${sanitizeFilename(m.name)}]]`),
    ],
    'entry-points': (campaign.entryPoints || []).map(id => {
      const n = campaign.nodes.find(nd => nd.id === id);
      return n ? `[[${sanitizeFilename(n.title)}]]` : id;
    }),
    'exit-points': (campaign.exitPoints || []).map(id => {
      const n = campaign.nodes.find(nd => nd.id === id);
      return n ? `[[${sanitizeFilename(n.title)}]]` : id;
    }),
    'clue-refs': campaign.clueRefs,
    tags: [campaignTag, 'campaign-index', campaign.category, campaign.difficulty, ...(campaign.tags || [])],
    aliases: [campaign.name],
    created: today,
    modified: today,
  };

  const campaignAllTags = campaign.tags || [];
  const isAptCampaign = hasAptTags(campaignAllTags);
  if (isAptCampaign) {
    const threatGroup = extractThreatGroup(campaignAllTags);
    const nationState = extractNationState(campaignAllTags);
    const mitreTechniques = extractMitreTechniques(campaignAllTags);
    const sourceRefs = extractSourceReferences(campaign.description || '');

    if (threatGroup) indexFm['threat-group'] = threatGroup;
    if (nationState) indexFm['nation-state'] = nationState;
    if (mitreTechniques.length > 0) indexFm['mitre-techniques'] = mitreTechniques;
    indexFm['case-study'] = true;
    indexFm['classification'] = 'PUBLIC';
    if (sourceRefs.length > 0) indexFm['source-references'] = sourceRefs;
  }

  let indexMd = buildIndexTemplaterBlock(campaign);
  indexMd += buildYaml(indexFm);

  indexMd += `\n# ${campaign.name}\n\n`;
  indexMd += `${campaign.description}\n\n`;

  indexMd += `> [!abstract] Campaign Overview\n`;
  indexMd += `> **Category**: ${campaign.category} | **Difficulty**: ${campaign.difficulty} | **Time**: ${campaign.estimatedTime}\n`;
  indexMd += `> **Nodes**: ${campaign.nodes.length} | **Links**: ${campaign.links.length} | **Clues**: ${(campaign.hiddenClues || []).length} | **Missions**: ${missions.length}\n`;
  indexMd += `> **Published**: ${campaign.isPublished ? 'Yes' : 'No'} | **Sitemap**: \`/play/${campaign.id}\`${missions.length > 0 ? ` | **Mission XP**: ${missions.reduce((s, m) => s + (m.xpReward || 0), 0)}` : ''}\n\n`;

  if (campaign.isChunk) {
    indexMd += `> [!tip] Modular Chunk\n`;
    indexMd += `> This campaign is a reusable chunk that can be embedded in other campaigns.\n\n`;
  }

  if ((campaign.entryPoints || []).length > 0) {
    indexMd += `## Entry Points\n\n`;
    campaign.entryPoints.forEach(id => {
      const n = campaign.nodes.find(nd => nd.id === id);
      indexMd += `- child:: [[${sanitizeFilename(n?.title || id)}]] (entry)\n`;
    });
    indexMd += '\n';
  }
  if ((campaign.exitPoints || []).length > 0) {
    indexMd += `## Exit Points\n\n`;
    campaign.exitPoints.forEach(id => {
      const n = campaign.nodes.find(nd => nd.id === id);
      indexMd += `- child:: [[${sanitizeFilename(n?.title || id)}]] (exit)\n`;
    });
    indexMd += '\n';
  }

  indexMd += `## Campaign Nodes\n\n`;
  indexMd += '```dataview\n';
  indexMd += `TABLE WITHOUT ID\n`;
  indexMd += `  file.link as "Node",\n`;
  indexMd += `  type as "Type",\n`;
  indexMd += `  page-layout as "Layout",\n`;
  indexMd += `  skill-level as "Skill",\n`;
  indexMd += `  tools as "Tools",\n`;
  indexMd += `  hidden-clue-count as "Clues",\n`;
  indexMd += `  entry-point as "Entry",\n`;
  indexMd += `  exit-point as "Exit"\n`;
  indexMd += `FROM #${campaignTag} AND -#campaign-index\n`;
  indexMd += `SORT type ASC, file.name ASC\n`;
  indexMd += '```\n\n';

  indexMd += `## Node List\n\n`;
  campaign.nodes.forEach(node => {
    const markers: string[] = [node.type];
    if (isEntry(node.id)) markers.push('ENTRY');
    if (isExit(node.id)) markers.push('EXIT');
    if (node.pageLayout) markers.push(node.pageLayout);
    indexMd += `- child:: [[${sanitizeFilename(node.title)}]] (${markers.join(' | ')})\n`;
  });

  if ((campaign.hiddenClues || []).length > 0) {
    indexMd += `\n## Hidden Clues Summary\n\n`;
    indexMd += `| Node | Type | Hint |\n|------|------|------|\n`;
    campaign.hiddenClues.forEach(c => {
      const n = campaign.nodes.find(nd => nd.id === c.nodeId);
      indexMd += `| [[${sanitizeFilename(n?.title || c.nodeId)}]] | ${c.type} | ${c.hint} |\n`;
    });
    indexMd += '\n';
  }

  if (missions.length > 0) {
    indexMd += `\n## Terminal Missions\n\n`;
    indexMd += `| Mission | Command | XP | Tools | Trigger Node |\n|---------|---------|----:|-------|-------------|\n`;
    missions.forEach(m => {
      const triggerNode = m.triggerNodeId ? campaign.nodes.find(n => n.id === m.triggerNodeId) : null;
      indexMd += `| [[Mission_${sanitizeFilename(m.name)}\\|${m.name}]] | \`${m.command}\` | ${m.xpReward} | ${(m.toolsRequired || []).join(', ') || '-'} | ${triggerNode ? `[[${sanitizeFilename(triggerNode.title)}]]` : '-'} |\n`;
    });
    indexMd += `\n> [!info] Total Mission XP: **${missions.reduce((s, m) => s + (m.xpReward || 0), 0)}**\n\n`;
  }

  indexMd += `## Breadcrumb Trail\n\n`;
  indexMd += '```breadcrumbs\n';
  indexMd += `type: tree\n`;
  indexMd += `dir: down\n`;
  indexMd += `depth: 4\n`;
  indexMd += `fields: [child, parent, sibling]\n`;
  indexMd += '```\n\n';

  indexMd += `## Queries\n\n`;

  if (missions.length > 0) {
    indexMd += `### Terminal Missions\n`;
    indexMd += '```dataview\n';
    indexMd += `TABLE WITHOUT ID\n`;
    indexMd += `  file.link as "Mission",\n`;
    indexMd += `  command as "Command",\n`;
    indexMd += `  xp-reward as "XP",\n`;
    indexMd += `  tools-required as "Tools",\n`;
    indexMd += `  trigger-node as "Trigger"\n`;
    indexMd += `FROM #${campaignTag} AND #terminal-mission\n`;
    indexMd += `SORT xp-reward DESC\n`;
    indexMd += '```\n\n';
  }

  indexMd += `### Nodes with Clues\n`;
  indexMd += '```dataview\n';
  indexMd += `TABLE WITHOUT ID\n`;
  indexMd += `  file.link as "Node",\n`;
  indexMd += `  hidden-clue-count as "Clues",\n`;
  indexMd += `  hidden-clue-types as "Types",\n`;
  indexMd += `  entry-point as "Entry",\n`;
  indexMd += `  exit-point as "Exit"\n`;
  indexMd += `FROM #${campaignTag}\n`;
  indexMd += `WHERE hidden-clue-count > 0\n`;
  indexMd += `SORT hidden-clue-count DESC\n`;
  indexMd += '```\n\n';

  indexMd += `### Skills & Tools Map\n`;
  indexMd += '```dataview\n';
  indexMd += `TABLE WITHOUT ID\n`;
  indexMd += `  file.link as "Node",\n`;
  indexMd += `  skills as "Skills",\n`;
  indexMd += `  tools as "Tools",\n`;
  indexMd += `  learning-goals as "Goals"\n`;
  indexMd += `FROM #${campaignTag} AND -#campaign-index\n`;
  indexMd += `WHERE skills OR tools OR learning-goals\n`;
  indexMd += `SORT file.name ASC\n`;
  indexMd += '```\n\n';

  indexMd += `### Excalibrain Graph\n`;
  indexMd += '```excalibrain\n';
  indexMd += `folder: ${sanitizeFilename(campaign.name)}\n`;
  indexMd += `style:\n`;
  indexMd += `  step: {color: "#d97706", shape: "box"}\n`;
  indexMd += `  decision: {color: "#8b5cf6", shape: "diamond"}\n`;
  indexMd += `  tool: {color: "#14b8a6", shape: "oval"}\n`;
  indexMd += `  output: {color: "#ef4444", shape: "hexagon"}\n`;
  indexMd += `  folder: {color: "#78716c", shape: "box"}\n`;
  if (isAptCampaign) {
    indexMd += `  nation-state: {color: "#dc2626", shape: "hexagon"}\n`;
    indexMd += `  technique: {color: "#ea580c", shape: "diamond"}\n`;
  }
  indexMd += '```\n\n';

  if (isAptCampaign) {
    const aptMitreTechniques = extractMitreTechniques(campaignAllTags);
    const aptSourceRefs = extractSourceReferences(campaign.description || '');

    indexMd += `## MITRE ATT&CK Mapping\n\n`;
    indexMd += '```dataview\n';
    indexMd += `TABLE WITHOUT ID\n`;
    indexMd += `  file.link as "Node",\n`;
    indexMd += `  threat-group as "Threat Group",\n`;
    indexMd += `  nation-state as "Nation State",\n`;
    indexMd += `  mitre-techniques as "MITRE Techniques"\n`;
    indexMd += `FROM #${campaignTag}\n`;
    indexMd += `WHERE mitre-techniques OR threat-group\n`;
    indexMd += `SORT threat-group ASC\n`;
    indexMd += '```\n\n';

    if (aptMitreTechniques.length > 0) {
      indexMd += `### Technique IDs\n\n`;
      aptMitreTechniques.forEach(t => {
        indexMd += `- \`${t}\` — [MITRE ATT&CK](https://attack.mitre.org/techniques/${t.replace('.', '/')})\n`;
      });
      indexMd += '\n';
    }

    indexMd += `## Threat Intelligence Sources\n\n`;
    indexMd += `> [!warning] APT Case Study\n`;
    indexMd += `> This campaign is based on real-world threat intelligence from public sources.\n`;
    indexMd += `> Classification: **PUBLIC**\n\n`;

    if (aptSourceRefs.length > 0) {
      indexMd += `### Advisory References\n\n`;
      aptSourceRefs.forEach(ref => {
        indexMd += `- ${ref}\n`;
      });
      indexMd += '\n';
    }

    indexMd += '```dataview\n';
    indexMd += `TABLE WITHOUT ID\n`;
    indexMd += `  file.link as "Node",\n`;
    indexMd += `  source-references as "Sources",\n`;
    indexMd += `  classification as "Classification"\n`;
    indexMd += `FROM #${campaignTag}\n`;
    indexMd += `WHERE source-references\n`;
    indexMd += `SORT file.name ASC\n`;
    indexMd += '```\n\n';

    const hasIocContent = campaign.nodes.some(n =>
      (n.content || '').toLowerCase().includes('ioc') ||
      (n.content || '').toLowerCase().includes('indicator') ||
      (n.metadata?.toolsForStep || []).some(t => t.toLowerCase().includes('ioc'))
    );
    if (hasIocContent) {
      indexMd += `## IOC Summary\n\n`;
      indexMd += '```dataview\n';
      indexMd += `TABLE WITHOUT ID\n`;
      indexMd += `  file.link as "Node",\n`;
      indexMd += `  type as "Type",\n`;
      indexMd += `  tools as "Tools",\n`;
      indexMd += `  threat-group as "Threat Group"\n`;
      indexMd += `FROM #${campaignTag}\n`;
      indexMd += `WHERE contains(file.content, "IOC") OR contains(file.content, "indicator")\n`;
      indexMd += `SORT file.name ASC\n`;
      indexMd += '```\n\n';
    }
  }

  indexMd += `## Sitemap Integration\n\n`;
  indexMd += `> [!note] Platform Route\n`;
  indexMd += `> This campaign is registered at \`/play/${campaign.id}\` on the Atropos platform sitemap.\n`;
  indexMd += `> Published: ${campaign.isPublished ? '**Yes** - visible to players' : '**No** - draft mode'}\n\n`;

  const today2 = new Date().toISOString().split('T')[0];
  indexMd += `---\n*Exported from Atropos Campaign Builder on ${today2}*\n`;

  files.push({ name: `_${sanitizeFilename(campaign.name)}_Index.md`, content: indexMd });

  missions.forEach(m => {
    const triggerNode = m.triggerNodeId ? campaign.nodes.find(n => n.id === m.triggerNodeId) : null;
    const mFm: Record<string, unknown> = {
      id: m.id,
      type: 'terminal-mission',
      'BC-folder-note-subtext': 'terminal-mission',
      'excalibrain-node-style-prefix': 'terminal-mission',
      'excalibrain-color': '#14b8a6',
      'excalibrain-shape': 'oval',
      cssclass: 'atropos-terminal-mission',
      command: m.command,
      'xp-reward': m.xpReward,
      campaign: campaign.name,
      'campaign-id': campaign.id,
      category: campaign.category,
      difficulty: campaign.difficulty,
      parent: `[[_${sanitizeFilename(campaign.name)}_Index]]`,
      'BC-campaign-index': `[[_${sanitizeFilename(campaign.name)}_Index]]`,
      tags: [campaignTag, 'terminal-mission', campaign.category],
      aliases: [m.name],
      created: today,
      modified: today,
    };
    if (triggerNode) {
      mFm['trigger-node'] = `[[${sanitizeFilename(triggerNode.title)}]]`;
      mFm['sibling'] = [`[[${sanitizeFilename(triggerNode.title)}]]`];
    }
    if (m.toolsRequired?.length) mFm['tools-required'] = m.toolsRequired;
    if (m.hint) mFm['hint'] = m.hint;
    if (m.expectedOutput) mFm['expected-output'] = m.expectedOutput;
    if (m.description) mFm['description'] = m.description;

    let mMd = buildMissionTemplaterBlock(m, campaign);
    mMd += buildYaml(mFm);
    mMd += `\n# ${m.name}\n\n`;
    mMd += `> [!terminal] Terminal Mission\n`;
    mMd += `> **Campaign**: [[_${sanitizeFilename(campaign.name)}_Index|${campaign.name}]]`;
    if (triggerNode) mMd += ` | **Trigger**: [[${sanitizeFilename(triggerNode.title)}]]`;
    mMd += `\n> **XP Reward**: ${m.xpReward} | **Category**: ${campaign.category}\n\n`;

    if (m.description) mMd += `## Objective\n\n${m.description}\n\n`;

    mMd += `## Command\n\n\`\`\`bash\n${m.command}\n\`\`\`\n\n`;

    if (m.expectedOutput) {
      mMd += `## Expected Output\n\n\`\`\`\n${m.expectedOutput}\n\`\`\`\n\n`;
    }

    if (m.hint) {
      mMd += `## Hint\n\n> [!tip] Hint\n> ${m.hint}\n\n`;
    }

    if (m.toolsRequired?.length) {
      mMd += `## Required Tools\n\n`;
      m.toolsRequired.forEach(t => { mMd += `- \`${t}\`\n`; });
      mMd += '\n';
    }

    mMd += `## Completion Checklist\n\n`;
    mMd += `- [ ] Execute the command successfully\n`;
    if (m.expectedOutput) mMd += `- [ ] Verify output matches expected result\n`;
    if (m.toolsRequired?.length) mMd += `- [ ] Confirm all required tools are available\n`;
    mMd += `- [ ] Collect XP reward (${m.xpReward} XP)\n\n`;

    mMd += `## Relations\n\n`;
    mMd += `- parent:: [[_${sanitizeFilename(campaign.name)}_Index]]\n`;
    if (triggerNode) mMd += `- sibling:: [[${sanitizeFilename(triggerNode.title)}]]\n`;
    mMd += '\n';

    files.push({ name: `Mission_${sanitizeFilename(m.name)}.md`, content: mMd });
  });

  let templateMd = '';
  templateMd += `<%*\n`;
  templateMd += `const tp = this.app.plugins.plugins["templater-obsidian"].templater.current_functions_object;\n`;
  templateMd += `const missionName = await tp.system.prompt("Mission name");\n`;
  templateMd += `const command = await tp.system.prompt("Terminal command");\n`;
  templateMd += `const description = await tp.system.prompt("Mission objective (optional)", "");\n`;
  templateMd += `const xpReward = await tp.system.prompt("XP reward", "50");\n`;
  templateMd += `const hint = await tp.system.prompt("Hint for players (optional)", "");\n`;
  templateMd += `const tools = await tp.system.prompt("Required tools, comma-separated (optional)", "");\n`;
  templateMd += `const expectedOutput = await tp.system.prompt("Expected terminal output (optional)", "");\n`;
  templateMd += `const createdDate = tp.date.now("YYYY-MM-DD");\n`;
  templateMd += `await tp.file.rename("Mission_" + missionName.replace(/[^a-zA-Z0-9_-]/g, '_'));\n`;
  templateMd += `%>\n`;
  templateMd += buildYaml({
    id: '<% "mission-" + tp.date.now("YYYYMMDDHHmmss") %>',
    type: 'terminal-mission',
    'BC-folder-note-subtext': 'terminal-mission',
    'excalibrain-node-style-prefix': 'terminal-mission',
    'excalibrain-color': '#14b8a6',
    'excalibrain-shape': 'oval',
    cssclass: 'atropos-terminal-mission',
    command: '<% command %>',
    'xp-reward': '<% xpReward %>',
    campaign: campaign.name,
    'campaign-id': campaign.id,
    category: campaign.category,
    tags: [campaignTag, 'terminal-mission', campaign.category],
    aliases: ['<% missionName %>'],
    created: '<% createdDate %>',
    modified: '<% createdDate %>',
    parent: `[[_${sanitizeFilename(campaign.name)}_Index]]`,
    'BC-campaign-index': `[[_${sanitizeFilename(campaign.name)}_Index]]`,
  });
  templateMd += `\n# <% missionName %>\n\n`;
  templateMd += `> [!terminal] Terminal Mission\n`;
  templateMd += `> **Campaign**: [[_${sanitizeFilename(campaign.name)}_Index|${campaign.name}]]\n`;
  templateMd += `> **XP Reward**: <% xpReward %> | **Category**: ${campaign.category}\n\n`;
  templateMd += `<% description ? "## Objective\\n\\n" + description + "\\n\\n" : "" %>`;
  templateMd += `## Command\n\n\`\`\`bash\n<% command %>\n\`\`\`\n\n`;
  templateMd += `<% expectedOutput ? "## Expected Output\\n\\n\`\`\`\\n" + expectedOutput + "\\n\`\`\`\\n\\n" : "" %>`;
  templateMd += `<% hint ? "## Hint\\n\\n> [!tip] Hint\\n> " + hint + "\\n\\n" : "" %>`;
  templateMd += `<% tools ? "## Required Tools\\n\\n" + tools.split(",").map(t => "- \`" + t.trim() + "\`").join("\\n") + "\\n\\n" : "" %>`;
  templateMd += `## Completion Checklist\n\n`;
  templateMd += `- [ ] Execute the command successfully\n`;
  templateMd += `- [ ] Verify output matches expected result\n`;
  templateMd += `- [ ] Collect XP reward (<% xpReward %> XP)\n\n`;
  templateMd += `## Relations\n\n`;
  templateMd += `- parent:: [[_${sanitizeFilename(campaign.name)}_Index]]\n`;

  files.push({ name: `_Template_Terminal_Mission.md`, content: templateMd });

  const allContent = files.map(f => `<!-- FILE: ${f.name} -->\n${f.content}\n\n---\n\n`).join('');
  const blob = new Blob([allContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${campaign.name.replace(/\s+/g, '_')}_obsidian.md`;
  a.click();
  URL.revokeObjectURL(url);
  return files.length;
}
