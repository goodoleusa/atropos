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

  const files: { name: string; content: string }[] = [];

  campaign.nodes.forEach(node => {
    const nodeLinks = campaign.links.filter(l => l.source === node.id || l.target === node.id);
    const outgoing = nodeLinks.filter(l => l.source === node.id);
    const incoming = nodeLinks.filter(l => l.target === node.id);
    const clues = nodeClues(node.id);

    const fm: Record<string, unknown> = {
      id: node.id,
      type: node.type,
      color: node.color,
      'page-layout': node.pageLayout || 'card',
      tags: [campaignTag, node.type],
      created: today,
      modified: today,
      campaign: campaign.name,
      'campaign-id': campaign.id,
    };

    if (node.metadata?.skillLevel) fm['skill-level'] = node.metadata.skillLevel;
    if (node.metadata?.featureType) fm['feature-type'] = node.metadata.featureType;
    if (node.metadata?.campaignType) fm['campaign-type'] = node.metadata.campaignType;
    if (isEntry(node.id)) fm['entry-point'] = true;
    if (isExit(node.id)) fm['exit-point'] = true;

    if (incoming.length > 0) {
      fm['up'] = incoming.map(l => {
        const src = campaign.nodes.find(n => n.id === l.source);
        return `[[${sanitizeFilename(src?.title || l.source)}]]`;
      });
    }
    if (outgoing.length > 0) {
      fm['down'] = outgoing.map(l => {
        const tgt = campaign.nodes.find(n => n.id === l.target);
        return `[[${sanitizeFilename(tgt?.title || l.target)}]]`;
      });
    }

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

    let md = buildYaml(fm);
    md += `\n# ${node.title}\n\n`;
    md += `> [!info] ${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node\n`;
    md += `> Layout: ${node.pageLayout || 'card'} | Color: ${node.color}`;
    if (isEntry(node.id)) md += ` | ENTRY POINT`;
    if (isExit(node.id)) md += ` | EXIT POINT`;
    md += '\n\n';

    if (node.content) md += `## Content\n\n${node.content}\n\n`;

    md += `## Relations\n\n`;
    if (incoming.length > 0) {
      md += `### Parents (up::)\n`;
      incoming.forEach(l => {
        const src = campaign.nodes.find(n => n.id === l.source);
        md += `- up:: [[${sanitizeFilename(src?.title || l.source)}]] (${l.relation || 'parent'}${l.condition ? `, condition: ${l.condition}` : ''})\n`;
      });
      md += '\n';
    }
    if (outgoing.length > 0) {
      md += `### Children (down::)\n`;
      outgoing.forEach(l => {
        const tgt = campaign.nodes.find(n => n.id === l.target);
        md += `- down:: [[${sanitizeFilename(tgt?.title || l.target)}]] (${l.relation || 'child'}${l.label ? `, label: ${l.label}` : ''}${l.condition ? `, condition: ${l.condition}` : ''})\n`;
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

    files.push({ name: `${sanitizeFilename(node.title)}.md`, content: md });
  });

  let indexMd = buildYaml({
    title: campaign.name,
    description: campaign.description,
    type: 'campaign-index',
    category: campaign.category,
    difficulty: campaign.difficulty,
    'estimated-time': campaign.estimatedTime,
    'is-chunk': campaign.isChunk || false,
    'node-count': campaign.nodes.length,
    'link-count': campaign.links.length,
    'clue-count': (campaign.hiddenClues || []).length,
    'entry-points': (campaign.entryPoints || []).map(id => {
      const n = campaign.nodes.find(nd => nd.id === id);
      return n ? `[[${sanitizeFilename(n.title)}]]` : id;
    }),
    'exit-points': (campaign.exitPoints || []).map(id => {
      const n = campaign.nodes.find(nd => nd.id === id);
      return n ? `[[${sanitizeFilename(n.title)}]]` : id;
    }),
    'clue-refs': campaign.clueRefs,
    tags: [campaignTag, 'campaign-index', ...(campaign.tags || [])],
    created: new Date().toISOString().split('T')[0],
    modified: new Date().toISOString().split('T')[0],
  });

  indexMd += `\n# ${campaign.name}\n\n`;
  indexMd += `${campaign.description}\n\n`;
  if (campaign.isChunk) {
    indexMd += `> [!tip] Modular Chunk\n`;
    indexMd += `> This campaign is a reusable chunk that can be embedded in other campaigns.\n\n`;
  }
  if ((campaign.entryPoints || []).length > 0) {
    indexMd += `## Entry Points\n\n`;
    campaign.entryPoints.forEach(id => {
      const n = campaign.nodes.find(nd => nd.id === id);
      indexMd += `- [[${sanitizeFilename(n?.title || id)}]]\n`;
    });
    indexMd += '\n';
  }
  if ((campaign.exitPoints || []).length > 0) {
    indexMd += `## Exit Points\n\n`;
    campaign.exitPoints.forEach(id => {
      const n = campaign.nodes.find(nd => nd.id === id);
      indexMd += `- [[${sanitizeFilename(n?.title || id)}]]\n`;
    });
    indexMd += '\n';
  }
  indexMd += `## Campaign Nodes\n\n`;
  indexMd += '```dataview\n';
  indexMd += `TABLE type, page-layout, tools, skill-level, hidden-clue-count\n`;
  indexMd += `FROM #${campaignTag}\n`;
  indexMd += `SORT type ASC\n`;
  indexMd += '```\n\n';
  indexMd += `## Node List\n\n`;
  campaign.nodes.forEach(node => {
    const markers: string[] = [node.type];
    if (isEntry(node.id)) markers.push('ENTRY');
    if (isExit(node.id)) markers.push('EXIT');
    indexMd += `- [[${sanitizeFilename(node.title)}]] (${markers.join(' | ')})\n`;
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
  indexMd += `## Queries\n\n`;
  indexMd += '```dataview\n';
  indexMd += `TABLE hidden-clue-count as Clues, entry-point, exit-point\n`;
  indexMd += `FROM #${campaignTag}\n`;
  indexMd += `WHERE hidden-clue-count > 0\n`;
  indexMd += '```\n';

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
