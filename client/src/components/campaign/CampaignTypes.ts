import { ReactNode } from 'react';

export const FEATURE_TYPES = ['terminal', 'api', 'qr', 'crypto', 'agent', 'web', 'osint', 'steganography'] as const;
export const CAMPAIGN_TYPES = ['recon', 'exploit', 'defense', 'osint', 'forensics', 'social', 'crypto', 'puzzle'] as const;
export const CATEGORIES = ['recon', 'exploit', 'defense', 'osint', 'forensics', 'social'] as const;
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export const PAGE_LAYOUTS = ['card', 'full-page', 'terminal', 'dossier', 'split'] as const;
export const SKILL_CATEGORIES = {
  'network': ['dns', 'tcp/ip', 'routing', 'firewall', 'vpn', 'bgp'],
  'web': ['http', 'cookies', 'xss', 'sqli', 'csrf', 'auth'],
  'crypto': ['encoding', 'hashing', 'encryption', 'pki', 'steganography'],
  'osint': ['dorking', 'social', 'metadata', 'geolocation', 'archives'],
  'system': ['linux', 'windows', 'permissions', 'processes', 'logs'],
  'programming': ['scripting', 'regex', 'api', 'parsing', 'automation']
} as const;

export type ClueType = 'source-code' | 'network-request' | 'http-header' | 'console-log' | 'css-comment' | 'data-attribute' | 'meta-tag' | 'base64' | 'hex-encoded' | 'steganography';

export interface HiddenClue {
  id: string;
  type: ClueType;
  nodeId: string;
  hint: string;
  value: string;
}

export interface CampaignNode {
  id: string;
  type: 'step' | 'decision' | 'tool' | 'output' | 'folder';
  title: string;
  content: string;
  htmlContent?: string;
  pageLayout?: typeof PAGE_LAYOUTS[number];
  customCss?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  children?: string[];
  metadata?: {
    toolsForStep?: string[];
    questions?: string[];
    successIndicators?: string[];
    redFlags?: string[];
    learningGoals?: string[];
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    teachingNotes?: string;
    featureType?: typeof FEATURE_TYPES[number];
    campaignType?: typeof CAMPAIGN_TYPES[number];
    skills?: string[];
    linkedClues?: string[];
    condition?: string;
    parentOutcome?: string;
    nextStepId?: string;
  };
}

export type RelationType = 'parent' | 'child' | 'sibling' | 'related' | 'next' | 'prev';

export interface CampaignLink {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  color: string;
  relation?: RelationType;
}

export interface SharedClue {
  id: string;
  name: string;
  description: string;
  tags: string[];
  usedIn: string[];
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  nodes: CampaignNode[];
  links: CampaignLink[];
  rootNodes: string[];
  isChunk: boolean;
  entryPoints: string[];
  exitPoints: string[];
  clueRefs: string[];
  hiddenClues: HiddenClue[];
  tags: string[];
  isPublished: boolean;
}

export interface ArcTemplate {
  name: string;
  desc: string;
  category: string;
  nodes: CampaignNode[];
  links: CampaignLink[];
  clues: HiddenClue[];
}

export interface NodeTypeInfo {
  type: string;
  label: string;
  icon: ReactNode;
  color: string;
}

export const COLORS = ['amber', 'purple', 'teal', 'blue', 'red', 'green', 'stone'] as const;

export const COLOR_MAP: Record<string, string> = {
  amber: 'border-amber-600 bg-amber-950/30',
  purple: 'border-purple-600 bg-purple-950/30',
  teal: 'border-teal-600 bg-teal-950/30',
  blue: 'border-blue-600 bg-blue-950/30',
  red: 'border-red-600 bg-red-950/30',
  green: 'border-green-600 bg-green-950/30',
  stone: 'border-stone-600 bg-stone-900/30',
};

export const RELATION_TYPES: { type: RelationType; label: string; icon: string; color: string }[] = [
  { type: 'parent', label: 'Parent', icon: '↑', color: 'text-purple-400' },
  { type: 'child', label: 'Child', icon: '↓', color: 'text-teal-400' },
  { type: 'sibling', label: 'Sibling', icon: '↔', color: 'text-amber-400' },
  { type: 'next', label: 'Next', icon: '→', color: 'text-teal-400' },
  { type: 'prev', label: 'Previous', icon: '←', color: 'text-purple-400' },
  { type: 'related', label: 'Related', icon: '◇', color: 'text-stone-400' },
];

export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
export const mkNode = (id: string, type: CampaignNode['type'], title: string, content: string, x: number, y: number, color = 'amber'): CampaignNode => ({
  id, type, title, content, x, y, width: 200, height: 100, color, metadata: {}
});
export const mkLink = (src: string, tgt: string, label = ''): CampaignLink => ({ id: `link-${uid()}`, source: src, target: tgt, label, color: 'stone' });
export const mkClue = (type: ClueType, nodeId: string, hint: string, value: string): HiddenClue => ({ id: `clue-${uid()}`, type, nodeId, hint, value });

export const emptyCampaign = (): Campaign => ({
  id: `campaign-${Date.now()}`, name: 'Untitled Campaign', description: '', category: 'recon',
  difficulty: 'beginner', estimatedTime: '30 min', nodes: [], links: [], rootNodes: [],
  isChunk: false, entryPoints: [], exitPoints: [], clueRefs: [], hiddenClues: [], tags: [], isPublished: false,
});
