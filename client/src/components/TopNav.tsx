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
      isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-amber-900/30 py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {allItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <button
                  className={`flex items-center gap-2 transition-colors whitespace-nowrap ${
                    isActive ? 'text-amber-500' : 'text-stone-400 hover:text-stone-200'
                  }`}
                  data-testid={`top-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-bold tracking-tight hidden md:inline uppercase font-orbitron">
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge className="bg-purple-600 text-[10px] h-4 px-1 min-w-[16px] flex items-center justify-center">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 ml-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] text-stone-500 uppercase font-mono">Lv.{gameState.level || 1}</span>
            <div className="w-16 h-1 bg-stone-800 rounded-full mt-0.5">
              <div 
                className="h-full bg-amber-500 rounded-full" 
                style={{ width: `${Math.min(100, ((gameState.xp || 0) % 250) / 250 * 100)}%` }}
              />
            </div>
          </div>
          
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full bg-stone-900/50 border border-stone-800 w-8 h-8">
              <User className="w-4 h-4 text-teal-400" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
