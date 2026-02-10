import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/hooks/useGameSession';
import { useReportContext } from '@/hooks/useReportContext';
import { 
  Terminal, 
  Search, 
  Bot, 
  Shield, 
  FileText, 
  User, 
  Settings, 
  Brain,
  Server
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItem {
  path: string;
  icon: any;
  label: string;
  color: 'amber' | 'teal' | 'purple';
  badge?: number;
}

export default function TopNav() {
  const [location] = useLocation();
  const { gameState } = useGame();
  const { pendingFindings } = useReportContext();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { path: '/', icon: Server, label: 'NEXUS', color: 'amber' },
    { path: '/terminal', icon: Terminal, label: 'Terminal', color: 'amber' },
    { path: '/investigate', icon: Search, label: 'Investigate', color: 'teal' },
    { path: '/agents', icon: Bot, label: 'Agents', color: 'teal' },
    { path: '/campaigns', icon: Shield, label: 'Campaigns', color: 'teal' },
    { path: '/report', icon: FileText, label: 'Report', color: 'purple', badge: pendingFindings.length > 0 ? pendingFindings.length : undefined },
  ];

  const devItems: NavItem[] = gameState.devMode ? [
    { path: '/admin', icon: Settings, label: 'Admin', color: 'amber' },
    { path: '/ai-lab', icon: Brain, label: 'Lab', color: 'teal' },
  ] : [];

  const allItems = [...navItems, ...devItems];

  if (location === '/admin' || location === '/login') return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      isScrolled ? 'bg-black/95 backdrop-blur-md border-b border-amber-900/30 py-1' : 'bg-[#0a0500]/80 py-2'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between h-12">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          {allItems.map((item) => {
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={`px-3 py-1.5 text-xs font-bold tracking-wider transition-all whitespace-nowrap uppercase font-orbitron border-b-2 ${
                    isActive 
                      ? 'text-amber-500 border-amber-500 bg-amber-500/5' 
                      : 'text-stone-500 border-transparent hover:text-stone-300 hover:bg-stone-800/30'
                  }`}
                  data-testid={`top-nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-1.5 inline-flex items-center justify-center bg-purple-600 text-white text-[9px] h-3.5 px-1 rounded-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4 ml-4 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-stone-500 uppercase font-mono">Lv.{gameState.level || 1}</span>
              <span className="text-[9px] text-amber-600 font-mono">{(gameState.xp || 0).toLocaleString()} XP</span>
            </div>
            <div className="w-20 h-1 bg-stone-900 rounded-full mt-0.5 border border-stone-800/50">
              <div 
                className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full" 
                style={{ width: `${Math.min(100, ((gameState.xp || 0) % 250) / 250 * 100)}%` }}
              />
            </div>
          </div>
          
          <Link href="/profile">
            <button className={`p-1.5 rounded transition-colors ${location === '/profile' ? 'text-teal-400 bg-teal-400/5' : 'text-stone-500 hover:text-teal-400'}`}>
              <User className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
