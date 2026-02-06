import { ReactNode } from 'react';

export const FEATURE_TYPES = ['terminal', 'api', 'qr', 'crypto', 'agent', 'web', 'osint', 'steganography'] as const;
export const CAMPAIGN_TYPES = ['recon', 'exploit', 'defense', 'osint', 'forensics', 'social', 'crypto', 'puzzle'] as const;
export const SKILL_CATEGORIES = {
  'network': ['dns', 'tcp/ip', 'routing', 'firewall', 'vpn', 'bgp'],
  'web': ['http', 'cookies', 'xss', 'sqli', 'csrf', 'auth'],
  'crypto': ['encoding', 'hashing', 'encryption', 'pki', 'steganography'],
  'osint': ['dorking', 'social', 'metadata', 'geolocation', 'archives'],
  'system': ['linux', 'windows', 'permissions', 'processes', 'logs'],
  'programming': ['scripting', 'regex', 'api', 'parsing', 'automation']
} as const;

export interface CampaignNode {
  id: string;
  type: 'step' | 'decision' | 'tool' | 'output' | 'folder';
  title: string;
  content: string;
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
  nodes: CampaignNode[];
  links: CampaignLink[];
  rootNodes: string[];
  isChunk?: boolean;
  entryPoints?: string[];
  exitPoints?: string[];
  clueRefs?: string[];
}

export interface NodeTypeInfo {
  type: string;
  label: string;
  icon: ReactNode;
  color: string;
}

export const COLOR_MAP: Record<string, string> = {
  amber: 'border-amber-600 bg-amber-950/30',
  purple: 'border-purple-600 bg-purple-950/30',
  teal: 'border-teal-600 bg-teal-950/30',
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
