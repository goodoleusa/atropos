import {
  Activity,
  Server,
  Eye,
  Database,
  Trophy,
  MessageSquare,
  Map,
  Bot,
  Settings,
  Target,
  Rocket,
  ShieldAlert,
  Terminal,
  Sparkles,
  Zap,
  Globe,
  BookOpen,
  Megaphone,
  Users,
  Layers,
  Bug,
} from "lucide-react";

export interface Clue {
  id: string;
  name: string;
  description: string;
  content: string;
  location: string;
  difficulty: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  requiredClues: string[];
  reward: string | null;
  unlocks: string | null;
}

export const NAV_GROUPS = [
  { label: "Overview", color: "amber", items: [
    { id: "activity", label: "Activity Log", icon: "Activity" },
    { id: "sitemap", label: "Platform Sitemap", icon: "Map" },
    { id: "sessions", label: "Sessions", icon: "Server" },
    { id: "behavior", label: "Behavior Analytics", icon: "Eye" },
  ]},
  { label: "Content", color: "teal", items: [
    { id: "gameplay", label: "Gameplay Editor", icon: "Layers" },
    { id: "collectibles", label: "Collectibles", icon: "Database" },
    { id: "quests", label: "Quests", icon: "Trophy" },
    { id: "messages", label: "Messages", icon: "MessageSquare" },
    { id: "graph", label: "Knowledge Graph", icon: "Map" },
  ]},
  { label: "Campaign Design", color: "purple", items: [
    { id: "designer", label: "Campaign Designer 🎨", icon: "Layers" },
    { id: "campaigns", label: "Campaign Library", icon: "Rocket" },
    { id: "agentmodules", label: "Investigation Modules", icon: "Target" },
    { id: "curriculum", label: "Curriculum", icon: "BookOpen" },
  ]},
  { label: "AI & Agents", color: "cyan", items: [
    { id: "agent", label: "Agent Chat", icon: "Bot" },
    { id: "agentconfig", label: "Agent Config", icon: "Settings" },
    { id: "atropos", label: "Atropos Scanner", icon: "ShieldAlert" },
  ]},
  { label: "System", color: "purple", items: [
    { id: "terminal", label: "Commands", icon: "Terminal" },
    { id: "config", label: "Config", icon: "Settings" },
    { id: "effects", label: "Effects Playground", icon: "Sparkles" },
    { id: "quickpush", label: "Quick Push", icon: "Zap" },
  ]},
  { label: "Communication", color: "orange", items: [
    { id: "modmail", label: "Modmail", icon: "MessageSquare" },
    { id: "feedback", label: "Agent Feedback", icon: "Bug" },
  ]},
  { label: "Quick Links", color: "amber", items: [
    { id: "link:/marketing", label: "Marketing Dashboard", icon: "Megaphone" },
    { id: "link:/recs", label: "RECS", icon: "Sparkles" },
    { id: "link:/crew-builder", label: "Crew Builder", icon: "Users" },
    { id: "link:/builder", label: "Campaign Builder", icon: "Layers" },
    { id: "link:/scanner", label: "Scanner Dashboard", icon: "ShieldAlert" },
    { id: "link:/wiki", label: "Wiki", icon: "BookOpen" },
  ]},
];

export const NAV_ICONS: Record<string, any> = {
  Activity, Server, Eye, Database, Trophy, MessageSquare, Map, Bot, Settings,
  Target, Rocket, ShieldAlert, Terminal, Sparkles, Zap, Globe, BookOpen,
  Megaphone, Users, Layers, Bug,
};

export const GROUP_COLORS: Record<string, string> = {
  amber: 'text-amber-500 border-amber-900/40',
  teal: 'text-teal-500 border-teal-900/40',
  cyan: 'text-cyan-500 border-cyan-900/40',
  purple: 'text-purple-500 border-purple-900/40',
  orange: 'text-orange-500 border-orange-900/40',
};

export const ACTIVE_COLORS: Record<string, string> = {
  amber: 'bg-amber-900/30 text-amber-400 border-amber-700/50',
  teal: 'bg-teal-900/30 text-teal-400 border-teal-700/50',
  cyan: 'bg-cyan-900/30 text-cyan-400 border-cyan-700/50',
  purple: 'bg-purple-900/30 text-purple-400 border-purple-700/50',
  orange: 'bg-orange-900/30 text-orange-400 border-orange-700/50',
};
