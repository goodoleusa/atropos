import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/hooks/useGameSession';
import { useReportContext } from '@/hooks/useReportContext';
import { Terminal, Brain, FileText, ChevronDown, Zap, Home, Search, Bot, QrCode, MessageSquare, Settings, Activity, User, TrendingUp, Trophy, Bug, Sparkles, Eye, EyeOff, Shield, Server, Briefcase } from 'lucide-react';
import { ModmailDialog } from './ModmailDialog';
import { MultiplayerLobby } from './MultiplayerLobby';
import { PlayerStatsPanel } from './PlayerStatsPanel';
import { Switch } from '@/components/ui/switch';
import { InteractiveHover } from './InteractiveHover';

const NAV_STYLES = {
  amber: { active: 'bg-amber-900/30 text-amber-400', icon: 'text-amber-500' },
  teal: { active: 'bg-teal-900/30 text-teal-400', icon: 'text-teal-500' },
  purple: { active: 'bg-amber-900/30 text-amber-400', icon: 'text-amber-500' },
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

  const baseNavItems = [
    // Home & Profile
    { path: '/', icon: Home, label: 'Homebase', color: 'amber' as const },
    { path: '/profile', icon: User, label: 'Profile & Portfolio', color: 'teal' as const },
    { path: '/leaderboards', icon: TrendingUp, label: 'Rankings', color: 'teal' as const },

    // Foundation & Training
    { path: '/campaigns', icon: Shield, label: 'AI Academy', color: 'teal' as const },
    { path: '/agents', icon: Bot, label: 'NEXUS Agents', color: 'teal' as const },
    { path: '/builder', icon: Settings, label: 'Campaign Builder', color: 'amber' as const },
    { path: '/business', icon: Briefcase, label: 'Business HQ', color: 'teal' as const },
    
    // Active Investigation
    { path: '/investigate', icon: Search, label: 'Investigation Hub', color: 'teal' as const },
    { path: '/terminal', icon: Terminal, label: 'Terminal', color: 'amber' as const },
    { path: '/videos', icon: Activity, label: 'AI Gallery', color: 'teal' as const },
    
    { path: '/admin', icon: Settings, label: 'Admin', color: 'amber' as const },
    { path: '/debug', icon: Bug, label: 'Debug', color: 'amber' as const },
    { path: '/void', icon: Sparkles, label: 'Void', color: 'amber' as const },
    { path: '/archive', icon: FileText, label: 'Archive', color: 'amber' as const },
    { path: '/suggestions', icon: Sparkles, label: 'Suggestions', color: 'amber' as const },
  ];

  const navItems = baseNavItems;

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
      className="flex fixed bottom-6 right-6 sm:bottom-6 sm:left-6 z-[10000] flex-col items-end sm:items-start gap-2 max-w-[calc(100vw-3rem)]" 
      data-testid="quick-nav"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {expanded && (
        <div className="bg-black/95 backdrop-blur border border-amber-900/50 rounded-lg p-2 space-y-1 animate-in slide-in-from-bottom-2 max-h-[70vh] w-[260px] sm:w-auto overflow-y-auto no-scrollbar molten-edge shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          {progression && (
            <div className="px-3 py-2 border-b border-stone-800 mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-bold text-amber-400">Level {progression.level}</span>
                </div>
                <Badge variant="outline" className="text-[9px] border-teal-600 text-teal-400">
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
                <span className="text-teal-400">{targets.length} targets</span>
                <span className="text-amber-400">{pendingFindings.length} findings</span>
              </div>
            </div>
          )}
          
          {navItems.map(item => {
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
                  data-testid={`nav-${item.label.toLowerCase()}`}
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
                  {(item as any).badge && (
                    <Badge className="ml-auto bg-amber-700 text-white text-[10px] px-1.5 relative z-10">
                      {(item as any).badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}

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
                    className="h-full bg-gradient-to-r from-amber-600 to-teal-500 rounded-full transition-all"
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
        <div className="relative w-20 h-20 flex items-center justify-center">
          {!expanded && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #b45309 0%, #f59e0b 20%, #fbbf24 30%, #d97706 45%, #78350f 60%, #f59e0b 75%, #b45309 100%)',
                filter: 'blur(4px)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {!expanded && (
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.8)]"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <Button
            onClick={handleToggle}
            className={`rounded-full w-14 h-14 transition-all duration-500 border-0 relative z-10 ${
              expanded 
                ? 'bg-stone-900 hover:bg-stone-800 rotate-180 shadow-2xl' 
                : 'bg-stone-950 hover:bg-stone-900 ring-2 ring-amber-600/50 shadow-[0_0_30px_rgba(180,83,9,0.5)]'
            }`}
            data-testid="quick-nav-toggle"
          >
            <div className="flex items-center justify-center w-full h-full relative overflow-hidden rounded-full">
              {!expanded && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(circle at center, #fbbf24 0%, #d97706 50%, transparent 100%)',
                  }}
                  animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            <div className="relative z-20 flex items-center justify-center">
                <motion.div
                  className="flex flex-col items-center"
                  animate={expanded ? { rotate: 0 } : { 
                    filter: ['brightness(1) contrast(1)', 'brightness(1.8) contrast(1.2)', 'brightness(1) contrast(1)'],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Server className="w-6 h-6 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,1)]" />
                </motion.div>
              </div>
            </div>
            {!expanded && pendingFindings.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 rounded-full text-[10px] text-black font-bold flex items-center justify-center border-2 border-stone-950 z-20">
                {pendingFindings.length}
              </span>
            )}
          </Button>
        </div>
      </InteractiveHover>
    </div>
  );
}
