import { Home } from 'lucide-react';
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
    /* MODULE_USER_NAV */
  ],
};

export const ADMIN_NAV: NavSection = {
  id: 'admin',
  title: 'Admin Nexus',
  items: [
    /* MODULE_ADMIN_NAV */
  ],
};

export const ALL_SECTIONS: NavSection[] = [USER_NAV, ADMIN_NAV];
