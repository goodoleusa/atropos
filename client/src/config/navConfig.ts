import {
  Home, Terminal, Search, Bot, Shield, User, TrendingUp, Activity,
  BookOpen, Sparkles, Settings, FileText, Bug, Eye, QrCode, Briefcase,
  Brain, Zap, Target, Users, Map, FlaskConical, Megaphone
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  color: 'amber' | 'teal';
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export const USER_NAV: NavSection = {
  id: 'user',
  title: 'User Tools',
  items: [
    { path: '/', icon: Home, label: 'Homebase', color: 'amber' },
    { path: '/campaigns', icon: Shield, label: 'Campaigns', color: 'teal' },
    { path: '/agents', icon: Bot, label: 'NEXUS Agents', color: 'teal' },
    { path: '/investigate', icon: Search, label: 'Investigation Hub', color: 'teal' },
    { path: '/terminal', icon: Terminal, label: 'Terminal', color: 'amber' },
    { path: '/ai-lab', icon: FlaskConical, label: 'AI Lab', color: 'teal' },
    { path: '/profile', icon: Target, label: 'Mission Control', color: 'amber' },
    { path: '/mission', icon: Map, label: 'Our Mission', color: 'amber' },
    { path: '/void', icon: Sparkles, label: 'The Void', color: 'teal' },
    { path: '/leaderboards', icon: TrendingUp, label: 'Rankings', color: 'teal' },
    { path: '/videos', icon: Activity, label: 'AI Gallery', color: 'teal' },
    { path: '/wiki', icon: BookOpen, label: 'Wiki', color: 'teal' },
    { path: '/recs', icon: Sparkles, label: 'RECS', color: 'amber' },
  ],
};

export const ADMIN_NAV: NavSection = {
  id: 'admin',
  title: 'Admin Nexus',
  items: [
    { path: '/builder', icon: Settings, label: 'Campaign Builder', color: 'amber' },
    { path: '/scanner', icon: Shield, label: 'Atropos Admin', color: 'amber' },
    { path: '/behavior', icon: Eye, label: 'Behavior Analysis', color: 'amber' },
    { path: '/admin', icon: Settings, label: 'Admin Panel', color: 'amber' },
    { path: '/crew-builder', icon: Users, label: 'Crew Builder', color: 'amber' },
    { path: '/archive', icon: FileText, label: 'Archive', color: 'amber' },
    { path: '/marketing', icon: Megaphone, label: 'Marketing HQ', color: 'amber' },
    { path: '/debug', icon: Bug, label: 'Debug Tools', color: 'amber' },
  ],
};

export const ALL_SECTIONS: NavSection[] = [USER_NAV, ADMIN_NAV];
