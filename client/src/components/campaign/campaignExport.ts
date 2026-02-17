import { Campaign, CampaignNode } from './CampaignTypes';

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '_');

const yamlVal = (v: unknown): string => {
  if (Array.isArray(v)) return `\n${v.map(i => `  - ${i}`).join('\n')}`;
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  const s = String(v);
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
    `const difficulty = "${campaign.difficulty}";`,
    `const category = "${campaign.category}";`,
    `const estimatedTime = "${campaign.estimatedTime}";`,
    `const isPublished = ${campaign.isPublished};`,
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

  campaign.nodes.forEach(node => {
    const nodeLinks = campaign.links.filter(l => l.source === node.id || l.target === node.id);
    const outgoing = nodeLinks.filter(l => l.source === node.id);
    const incoming = nodeLinks.filter(l => l.target === node.id);
    const clues = nodeClues(node.id);
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
    fm['position-x'] = node.x;
    fm['position-y'] = node.y;
    fm['width'] = node.width;
    fm['height'] = node.height;

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
    child: campaign.nodes.map(n => `[[${sanitizeFilename(n.title)}]]`),
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

  let indexMd = buildIndexTemplaterBlock(campaign);
  indexMd += buildYaml(indexFm);

  indexMd += `\n# ${campaign.name}\n\n`;
  indexMd += `${campaign.description}\n\n`;

  indexMd += `> [!abstract] Campaign Overview\n`;
  indexMd += `> **Category**: ${campaign.category} | **Difficulty**: ${campaign.difficulty} | **Time**: ${campaign.estimatedTime}\n`;
  indexMd += `> **Nodes**: ${campaign.nodes.length} | **Links**: ${campaign.links.length} | **Clues**: ${(campaign.hiddenClues || []).length}\n`;
  indexMd += `> **Published**: ${campaign.isPublished ? 'Yes' : 'No'} | **Sitemap**: \`/play/${campaign.id}\`\n\n`;

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

  indexMd += `## Breadcrumb Trail\n\n`;
  indexMd += '```breadcrumbs\n';
  indexMd += `type: tree\n`;
  indexMd += `dir: down\n`;
  indexMd += `depth: 4\n`;
  indexMd += `fields: [child, parent, sibling]\n`;
  indexMd += '```\n\n';

  indexMd += `## Queries\n\n`;
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
  indexMd += '```\n\n';

  indexMd += `## Sitemap Integration\n\n`;
  indexMd += `> [!note] Platform Route\n`;
  indexMd += `> This campaign is registered at \`/play/${campaign.id}\` on the Atropos platform sitemap.\n`;
  indexMd += `> Published: ${campaign.isPublished ? '**Yes** - visible to players' : '**No** - draft mode'}\n\n`;

  const today2 = new Date().toISOString().split('T')[0];
  indexMd += `---\n*Exported from Atropos Campaign Builder on ${today2}*\n`;

  files.push({ name: `_${sanitizeFilename(campaign.name)}_Index.md`, content: indexMd });

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
