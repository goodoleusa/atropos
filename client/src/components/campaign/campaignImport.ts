import { Campaign, CampaignNode, CampaignLink, HiddenClue, ClueType, uid, emptyCampaign } from './CampaignTypes';

interface ParsedFile {
  filename: string;
  frontmatter: Record<string, any>;
  body: string;
}

function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const yamlStr = match[1];
  const body = match[2];
  const fm: Record<string, any> = {};
  let currentKey = '';
  let currentArray: string[] | null = null;

  yamlStr.split('\n').forEach(line => {
    const arrayItem = line.match(/^\s+-\s+(.+)$/);
    if (arrayItem && currentKey) {
      if (!currentArray) { currentArray = []; fm[currentKey] = currentArray; }
      currentArray.push(arrayItem[1].trim().replace(/^["']|["']$/g, ''));
      return;
    }

    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (kv) {
      if (currentArray) currentArray = null;
      currentKey = kv[1];
      const val = kv[2].trim();
      if (val === '') {
        fm[currentKey] = '';
      } else if (val === 'true') {
        fm[currentKey] = true;
      } else if (val === 'false') {
        fm[currentKey] = false;
      } else if (/^\d+$/.test(val)) {
        fm[currentKey] = parseInt(val, 10);
      } else if (/^\d+\.\d+$/.test(val)) {
        fm[currentKey] = parseFloat(val);
      } else {
        fm[currentKey] = val.replace(/^["']|["']$/g, '');
      }
    }
  });

  return { frontmatter: fm, body };
}

function splitVaultContent(content: string): ParsedFile[] {
  const fileBlocks = content.split(/<!-- FILE:\s*(.+?)\s*-->\n/);
  const files: ParsedFile[] = [];

  for (let i = 1; i < fileBlocks.length; i += 2) {
    const filename = fileBlocks[i].trim();
    let fileContent = fileBlocks[i + 1] || '';
    fileContent = fileContent.replace(/\n---\s*$/, '').trim();
    const { frontmatter, body } = parseFrontmatter(fileContent);
    files.push({ filename, frontmatter, body });
  }

  return files;
}

function extractCluesFromBody(body: string, nodeId: string): HiddenClue[] {
  const clues: HiddenClue[] = [];
  const clueRegex = />\s*\[!warning\]\s*Clue:\s*(\S+)\s*\n>\s*\*\*Hint\*\*:\s*(.+)\n>\s*\*\*Value\*\*:\s*`([^`]+)`/g;
  let match;
  while ((match = clueRegex.exec(body)) !== null) {
    const clueTypes = ['source-code','network-request','http-header','console-log','css-comment','data-attribute','meta-tag','base64','hex-encoded','steganography'];
    const type = clueTypes.includes(match[1]) ? match[1] as ClueType : 'source-code';
    clues.push({ id: `clue-${uid()}`, type, nodeId, hint: match[2].trim(), value: match[3].trim() });
  }
  return clues;
}

function extractContentSection(body: string): string {
  const contentMatch = body.match(/## Content\s*\n\n([\s\S]*?)(?=\n## |$)/);
  return contentMatch ? contentMatch[1].trim() : '';
}

export function importFromObsidianVault(content: string): Campaign {
  const files = splitVaultContent(content);
  if (files.length === 0) {
    return importSingleFile(content);
  }

  const indexFile = files.find(f => f.filename.startsWith('_') && f.filename.endsWith('_Index.md'));
  const nodeFiles = files.filter(f => f !== indexFile);

  const campaign = emptyCampaign();

  if (indexFile) {
    campaign.name = indexFile.frontmatter.title || 'Imported Campaign';
    campaign.description = indexFile.frontmatter.description || '';
    campaign.category = indexFile.frontmatter.category || 'recon';
    campaign.difficulty = indexFile.frontmatter.difficulty || 'beginner';
    campaign.estimatedTime = indexFile.frontmatter['estimated-time'] || '30 min';
    campaign.isChunk = indexFile.frontmatter['is-chunk'] === true;
    if (Array.isArray(indexFile.frontmatter.tags)) {
      campaign.tags = indexFile.frontmatter.tags.filter((t: string) => !t.startsWith('campaign/') && t !== 'campaign-index');
    }
  }

  const titleToId: Record<string, string> = {};

  nodeFiles.forEach((file, i) => {
    const fm = file.frontmatter;
    const nodeId = fm.id || `node-${uid()}`;
    const title = file.filename.replace(/\.md$/, '').replace(/_/g, ' ');
    titleToId[file.filename.replace(/\.md$/, '')] = nodeId;

    const node: CampaignNode = {
      id: nodeId,
      type: fm.type || 'step',
      title,
      content: extractContentSection(file.body),
      pageLayout: fm['page-layout'] || 'card',
      x: fm['position-x'] ?? (i % 4) * 300,
      y: fm['position-y'] ?? Math.floor(i / 4) * 200,
      width: fm.width || 200,
      height: fm.height || 100,
      color: fm.color || 'amber',
      metadata: {},
    };

    if (fm['skill-level']) node.metadata!.skillLevel = fm['skill-level'];
    if (fm['feature-type']) node.metadata!.featureType = fm['feature-type'];
    if (fm['campaign-type']) node.metadata!.campaignType = fm['campaign-type'];
    if (Array.isArray(fm.tools)) node.metadata!.toolsForStep = fm.tools;
    if (Array.isArray(fm.questions)) node.metadata!.questions = fm.questions;
    if (Array.isArray(fm['success-indicators'])) node.metadata!.successIndicators = fm['success-indicators'];
    if (Array.isArray(fm['red-flags'])) node.metadata!.redFlags = fm['red-flags'];
    if (Array.isArray(fm['learning-goals'])) node.metadata!.learningGoals = fm['learning-goals'];
    if (Array.isArray(fm.skills)) node.metadata!.skills = fm.skills;
    if (Array.isArray(fm['linked-clues'])) node.metadata!.linkedClues = fm['linked-clues'];
    if (fm.condition) node.metadata!.condition = fm.condition;
    if (fm['parent-outcome']) node.metadata!.parentOutcome = fm['parent-outcome'];
    if (fm['next-step']) node.metadata!.nextStepId = fm['next-step'];
    if (fm['entry-point']) campaign.entryPoints.push(nodeId);
    if (fm['exit-point']) campaign.exitPoints.push(nodeId);

    const clues = extractCluesFromBody(file.body, nodeId);
    campaign.hiddenClues.push(...clues);

    campaign.nodes.push(node);
  });

  nodeFiles.forEach(file => {
    const fm = file.frontmatter;
    const sourceId = fm.id || titleToId[file.filename.replace(/\.md$/, '')];
    if (!sourceId) return;

    const downLinks = Array.isArray(fm.down) ? fm.down : [];
    downLinks.forEach((link: string) => {
      const titleMatch = link.match(/\[\[(.+?)\]\]/);
      if (titleMatch) {
        const targetTitle = titleMatch[1];
        const targetId = titleToId[targetTitle];
        if (targetId) {
          campaign.links.push({
            id: `link-${uid()}`,
            source: sourceId,
            target: targetId,
            color: 'stone',
          });
        }
      }
    });
  });

  if (campaign.nodes.length > 0) {
    const targetIds = new Set(campaign.links.map(l => l.target));
    campaign.rootNodes = campaign.nodes.filter(n => !targetIds.has(n.id)).map(n => n.id);
  }

  return campaign;
}

function importSingleFile(content: string): Campaign {
  const { frontmatter, body } = parseFrontmatter(content);
  const campaign = emptyCampaign();

  if (frontmatter.type === 'campaign-index') {
    campaign.name = frontmatter.title || 'Imported Campaign';
    campaign.description = frontmatter.description || '';
    campaign.category = frontmatter.category || 'recon';
    campaign.difficulty = frontmatter.difficulty || 'beginner';
    campaign.estimatedTime = frontmatter['estimated-time'] || '30 min';
    campaign.isChunk = frontmatter['is-chunk'] === true;
    return campaign;
  }

  const nodeId = frontmatter.id || `node-${uid()}`;
  const title = body.match(/^#\s+(.+)$/m)?.[1] || 'Imported Node';

  campaign.name = frontmatter.campaign || title;
  campaign.nodes.push({
    id: nodeId,
    type: frontmatter.type || 'step',
    title,
    content: extractContentSection(body),
    pageLayout: frontmatter['page-layout'] || 'card',
    x: frontmatter['position-x'] || 100,
    y: frontmatter['position-y'] || 100,
    width: frontmatter.width || 200,
    height: frontmatter.height || 100,
    color: frontmatter.color || 'amber',
    metadata: {},
  });
  campaign.rootNodes = [nodeId];

  const clues = extractCluesFromBody(body, nodeId);
  campaign.hiddenClues.push(...clues);

  return campaign;
}

export function importFromJSON(content: string): Campaign {
  const data = JSON.parse(content);
  const campaign = emptyCampaign();
  campaign.id = data.id || campaign.id;
  campaign.name = data.name || campaign.name;
  campaign.description = data.description || '';
  campaign.category = data.category || 'recon';
  campaign.difficulty = data.difficulty || 'beginner';
  campaign.estimatedTime = data.estimatedTime || '30 min';
  campaign.nodes = data.nodes || [];
  campaign.links = data.links || [];
  campaign.rootNodes = data.rootNodes || [];
  campaign.isChunk = data.isChunk || false;
  campaign.entryPoints = data.entryPoints || [];
  campaign.exitPoints = data.exitPoints || [];
  campaign.clueRefs = data.clueRefs || [];
  campaign.hiddenClues = data.hiddenClues || [];
  campaign.tags = data.tags || [];
  campaign.isPublished = data.isPublished || false;
  return campaign;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function importFiles(files: FileList): Promise<Campaign | null> {
  if (files.length === 0) return null;

  if (files.length === 1) {
    const file = files[0];
    const text = await readFileAsText(file);
    if (file.name.endsWith('.json')) {
      return importFromJSON(text);
    }
    return importFromObsidianVault(text);
  }

  let combined = '';
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.name.endsWith('.md')) continue;
    const text = await readFileAsText(file);
    combined += `<!-- FILE: ${file.name} -->\n${text}\n\n---\n\n`;
  }
  return importFromObsidianVault(combined);
}
