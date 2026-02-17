import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/hooks/useGameSession';
import { useReportContext } from '@/hooks/useReportContext';
import { Terminal, Brain, FileText, ChevronDown, Zap, Home, Search, Bot, QrCode, MessageSquare, Settings, Activity, User, TrendingUp, Trophy, Bug, Sparkles, Eye, EyeOff, Shield, Server, Briefcase, BookOpen } from 'lucide-react';
import { ModmailDialog } from './ModmailDialog';
import { MultiplayerLobby } from './MultiplayerLobby';
import { PlayerStatsPanel } from './PlayerStatsPanel';
import { Switch } from '@/components/ui/switch';
import { InteractiveHover } from './InteractiveHover';

const NAV_STYLES = {
  amber: { active: 'bg-amber-900/30 text-amber-400', icon: 'text-amber-500' },
  teal: { active: 'bg-teal-900/30 text-teal-400', icon: 'text-teal-500' },
} as const;

export default function QuickNav() {
  const [expanded, setExpanded] = useState(false);
  const [location] = useLocation();
  const { gameState, toggleDevMode } = useGame();
  const { pendingFindings, currentSession, targets } = useReportContext();

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setExpanded(prev => !prev);
  };

  // Listen for global toggle event
  useEffect(() => {
    const handleGlobalToggle = () => setExpanded(prev => !prev);
    window.addEventListener('toggle-quicknav', handleGlobalToggle);
    return () => window.removeEventListener('toggle-quicknav', handleGlobalToggle);
  }, []);

  const { data: progression } = useQuery({
    queryKey: ['/api/progression', gameState.sessionToken],
    queryFn: () => fetch(`/api/progression/${gameState.sessionToken}`).then(r => r.json()),
    enabled: !!gameState.sessionToken && expanded,
    staleTime: 30000
  });

  const userItems = [
    { path: '/', icon: Home, label: 'Homebase', color: 'amber' as const },
    { path: '/profile', icon: User, label: 'Profile', color: 'teal' as const },
    { path: '/leaderboards', icon: TrendingUp, label: 'Rankings', color: 'teal' as const },
    { path: '/campaigns', icon: Shield, label: 'AI Academy', color: 'teal' as const },
    { path: '/agents', icon: Bot, label: 'NEXUS Agents', color: 'teal' as const },
    { path: '/business', icon: Briefcase, label: 'Business HQ', color: 'teal' as const },
    { path: '/investigate', icon: Search, label: 'Investigation Hub', color: 'teal' as const },
    { path: '/terminal', icon: Terminal, label: 'Terminal', color: 'amber' as const },
    { path: '/videos', icon: Activity, label: 'AI Gallery', color: 'teal' as const },
    { path: '/wiki', icon: BookOpen, label: 'Wiki', color: 'teal' as const },
  ];

  const adminItems = [
    { path: '/builder', icon: Settings, label: 'Campaign Builder', color: 'amber' as const },
    { path: '/admin', icon: Settings, label: 'Admin Panel', color: 'amber' as const },
    { path: '/debug', icon: Bug, label: 'Debug Tools', color: 'amber' as const },
    { path: '/void', icon: Sparkles, label: 'The Void', color: 'amber' as const },
    { path: '/archive', icon: FileText, label: 'Archive', color: 'amber' as const },
    { path: '/suggestions', icon: Sparkles, label: 'Suggestions', color: 'amber' as const },
    { path: '/scanner', icon: Search, label: 'Atropos Scanner', color: 'amber' as const },
  ];

  const renderNavItems = (items: typeof userItems) => items.map(item => {
    const Icon = item.icon;
    const isActive = location === item.path;
    const styles = NAV_STYLES[item.color];
    return (
      <Link key={item.path} href={item.path}>
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start min-h-[44px] relative group overflow-hidden ${
            isActive ? styles.active : 'text-stone-400 hover:text-stone-200'
          }`}
          data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isActive && (
            <motion.div 
              layoutId="active-nav-glow"
              className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
          <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors duration-300" />
          <Icon className={`w-4 h-4 mr-2 transition-all duration-300 ${isActive ? styles.icon + ' scale-110' : 'group-hover:text-amber-400'}`} />
          <span className="relative z-10 transition-all duration-300 group-hover:translate-x-1 uppercase font-orbitron text-[10px] tracking-widest">
            {item.label}
          </span>
        </Button>
      </Link>
    );
  });

  // Close menu when clicking outside
  useEffect(() => {
    if (!expanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-testid="quick-nav"]')) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  // Close menu on location change
  useEffect(() => {
    setExpanded(false);
  }, [location]);

  if (location === '/admin' || location === '/login') return null;

  return (
    <div 
      className="flex fixed bottom-6 left-6 md:left-6 right-6 md:right-auto z-[10000] flex-col items-end md:items-start gap-2" 
      data-testid="quick-nav"
      style={{ isolation: 'isolate' }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {expanded && (
        <div className="bg-black border border-stone-800 rounded-lg p-2 space-y-1 animate-in slide-in-from-bottom-2 max-h-[70vh] w-[260px] sm:w-auto overflow-y-auto no-scrollbar shadow-2xl">
          {progression && (
            <div className="px-3 py-2 border-b border-stone-800 mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-bold text-amber-400">Level {progression.level}</span>
                </div>
                <Badge variant="outline" className="text-[9px] border-amber-600 text-amber-400">
                  {progression.xp} / {progression.level * 100} XP
                </Badge>
              </div>
              <Progress 
                value={(progression.xp / (progression.level * 100)) * 100} 
                className="h-1.5 bg-stone-900"
              />
            </div>
          )}
          
          {currentSession && (
            <div className="px-3 py-2 border-b border-stone-800 mb-2">
              <p className="text-[10px] text-stone-500 uppercase">Active Session</p>
              <p className="text-xs text-amber-400 font-bold truncate max-w-[150px]">{currentSession.name}</p>
              <div className="flex gap-2 mt-1 text-[10px]">
                <span className="text-amber-500">{targets.length} targets</span>
                <span className="text-amber-400">{pendingFindings.length} findings</span>
              </div>
            </div>
          )}

          <div className="pb-2">
            <p className="text-[9px] text-stone-600 uppercase px-3 mb-1 font-orbitron tracking-widest">User Tools</p>
            {renderNavItems(userItems)}
          </div>

          <div className="border-t border-stone-800 pt-2 pb-2">
            <p className="text-[9px] text-stone-600 uppercase px-3 mb-1 font-orbitron tracking-widest">Admin Nexus</p>
            {renderNavItems(adminItems)}
          </div>

          <div className="px-1 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start bg-amber-900/20 text-amber-400 hover:bg-amber-900/40 min-h-[44px]"
              onClick={() => window.dispatchEvent(new CustomEvent('open-qr-modal'))}
              data-testid="quicknav-qr-tool"
            >
              <QrCode className="w-4 h-4 mr-2" />
              <span className="uppercase font-orbitron text-[10px] tracking-widest">QR Tool</span>
            </Button>
          </div>

          <div className="border-t border-stone-800 pt-2 mt-2">
            <div className="px-3 py-1">
              <p className="text-[10px] text-stone-500 uppercase">Progress</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (gameState.inventory?.length || 0) * 5)}%` }}
                  />
                </div>
                <span className="text-[10px] text-amber-400">{gameState.inventory?.length || 0} clues</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-stone-500">Lv.{gameState.level || 1}</span>
                <span className="text-[10px] text-amber-500">{(gameState.xp || 0).toLocaleString()} XP</span>
              </div>
            </div>
            <div className="px-1 mt-1">
              <PlayerStatsPanel />
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 border-t border-stone-800 mt-2">
            <span className="text-[10px] text-stone-500 uppercase font-orbitron tracking-tighter">Dev Mode</span>
            <Switch 
              checked={gameState.devMode} 
              onCheckedChange={toggleDevMode}
              className="scale-75 data-[state=checked]:bg-amber-600"
            />
          </div>
        </div>
      )}

      <InteractiveHover>
        <div className="relative w-16 h-16 flex items-center justify-center">
          {!expanded && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          )}
          <Button
            onClick={handleToggle}
            className={`rounded-full w-12 h-12 transition-all duration-500 border border-amber-900/30 relative z-10 ${
              expanded 
                ? 'bg-stone-900 hover:bg-stone-800 rotate-180 shadow-xl' 
                : 'bg-stone-950 hover:bg-stone-900 shadow-[0_0_15px_rgba(180,83,9,0.2)]'
            }`}
            data-testid="quick-nav-toggle"
          >
            <div className="flex items-center justify-center w-full h-full relative overflow-hidden rounded-full">
              <div className="relative z-20 flex items-center justify-center">
                <motion.div
                  className="flex flex-col items-center"
                  animate={expanded ? { rotate: 0 } : { 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Server className="w-5 h-5 text-amber-500/80" />
                </motion.div>
              </div>
            </div>
          </Button>
          {!expanded && pendingFindings.length > 0 && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-amber-600 rounded-full text-[9px] text-black font-bold flex items-center justify-center border border-black z-[10001] pointer-events-none">
              {pendingFindings.length}
            </div>
          )}
        </div>
      </InteractiveHover>
    </div>
  );
}
