import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/hooks/useGameSession';
import { useReportContext } from '@/hooks/useReportContext';
import { useAgentChat } from '@/hooks/useAgentChat';
import {
  Terminal, Brain, FileText, Home, Search, Bot, QrCode,
  Settings, User, TrendingUp, Trophy, Bug, Sparkles, Shield,
  Server, Briefcase, ChevronDown, MessageSquare,
  Plus, Activity, BookOpen, Eye, EyeOff,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { InteractiveHover } from './InteractiveHover';
import { PlayerStatsPanel } from './PlayerStatsPanel';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Homebase', color: 'amber' as const },
  { path: '/profile', icon: User, label: 'Profile & Portfolio', color: 'teal' as const },
  { path: '/leaderboards', icon: TrendingUp, label: 'Rankings', color: 'teal' as const },
  { path: '/campaigns', icon: Shield, label: 'AI Academy', color: 'teal' as const },
  { path: '/agents', icon: Bot, label: 'NEXUS Agents', color: 'teal' as const },
  { path: '/builder', icon: Settings, label: 'Campaign Builder', color: 'amber' as const },
  { path: '/business', icon: Briefcase, label: 'Business HQ', color: 'teal' as const },
  { path: '/investigate', icon: Search, label: 'Investigation Hub', color: 'teal' as const },
  { path: '/terminal', icon: Terminal, label: 'Terminal', color: 'amber' as const },
  { path: '/videos', icon: Activity, label: 'AI Gallery', color: 'teal' as const },
  { path: '/wiki', icon: BookOpen, label: 'Wiki', color: 'teal' as const },
  { path: '/suggestions', icon: Sparkles, label: 'Suggestions', color: 'amber' as const },
  { path: '/admin', icon: Settings, label: 'Admin', color: 'amber' as const },
  { path: '/debug', icon: Bug, label: 'Debug', color: 'amber' as const },
  { path: '/void', icon: Sparkles, label: 'Void', color: 'purple' as const },
  { path: '/archive', icon: FileText, label: 'Archive', color: 'amber' as const },
];

const NAV_STYLES = {
  amber: { active: 'bg-amber-900/30 text-amber-400', icon: 'text-amber-500' },
  teal: { active: 'bg-teal-900/30 text-teal-400', icon: 'text-teal-500' },
  purple: { active: 'bg-purple-900/30 text-purple-400', icon: 'text-purple-500' },
} as const;

export default function GlobalNav() {
  const [expanded, setExpanded] = useState(false);
  const [location] = useLocation();
  const { gameState, toggleDevMode } = useGame();
  const { pendingFindings, currentSession, targets } = useReportContext();
  const { state: chatState, loadSession, createNewSession, setIsOpen: setChatOpen } = useAgentChat();

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setExpanded(prev => !prev);
  };

  useEffect(() => {
    const handleGlobalToggle = () => setExpanded(prev => !prev);
    window.addEventListener('toggle-quicknav', handleGlobalToggle);
    return () => window.removeEventListener('toggle-quicknav', handleGlobalToggle);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-testid="global-nav"]')) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  useEffect(() => {
    setExpanded(false);
  }, [location]);

  if (location === '/admin' || location === '/login') return null;

  return (
    <div
      className="flex fixed bottom-6 left-6 z-[10000] flex-col items-start gap-2"
      data-testid="global-nav"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {expanded && (
        <div className="bg-black/95 backdrop-blur border border-amber-900/50 rounded-lg p-2 space-y-1 animate-in slide-in-from-bottom-2 max-h-[80vh] overflow-y-auto no-scrollbar molten-edge w-64">
          {gameState.xp > 0 && (
            <div className="px-3 py-2 border-b border-stone-800 mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-bold text-amber-400">Level {gameState.level || 1}</span>
                </div>
                <Badge variant="outline" className="text-[9px] border-teal-600 text-teal-400">
                  {(gameState.xp || 0)} / {(gameState.level || 1) * 100} XP
                </Badge>
              </div>
              <Progress
                value={((gameState.xp || 0) / ((gameState.level || 1) * 100)) * 100}
                className="h-1.5 bg-stone-900"
              />
            </div>
          )}

          {currentSession && (
            <div className="px-3 py-2 border-b border-stone-800 mb-2">
              <p className="text-[10px] text-stone-500 uppercase">Active Session</p>
              <p className="text-xs text-amber-400 font-bold truncate max-w-[200px]">{currentSession.name}</p>
              <div className="flex gap-2 mt-1 text-[10px]">
                <span className="text-teal-400">{targets.length} targets</span>
                <span className="text-purple-400">{pendingFindings.length} findings</span>
              </div>
            </div>
          )}

          {NAV_ITEMS.map(item => {
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
          })}

          <div className="px-1 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start bg-amber-900/20 text-amber-400 hover:bg-amber-900/40 min-h-[44px]"
              onClick={() => window.dispatchEvent(new CustomEvent('open-qr-modal'))}
              data-testid="nav-qr-tool"
            >
              <QrCode className="w-4 h-4 mr-2" />
              <span className="uppercase font-orbitron text-[10px] tracking-widest">QR Tool</span>
            </Button>
          </div>

          <div className="border-t border-stone-800 pt-2 mt-2">
            <p className="text-[9px] text-stone-600 uppercase px-3 mb-1 font-orbitron tracking-wider">Chat History</p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-xs text-teal-400 hover:bg-teal-900/20 mb-0.5"
              onClick={async () => {
                await createNewSession();
                setChatOpen(true);
              }}
              data-testid="nav-new-chat"
            >
              <Plus className="w-3 h-3 mr-2" />
              <span className="text-[10px] uppercase font-orbitron tracking-wider">New Chat</span>
            </Button>
            <div className="space-y-0.5 max-h-28 overflow-y-auto">
              {chatState.sessions.slice(0, 6).map((session) => (
                <Button
                  key={session.id}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start h-7 text-xs ${
                    chatState.conversationId === session.id
                      ? 'text-amber-400 bg-amber-900/10'
                      : 'text-stone-500 hover:text-stone-300'
                  }`}
                  onClick={() => loadSession(session.id)}
                  data-testid={`nav-session-${session.id}`}
                  title={session.title}
                >
                  <MessageSquare className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span className="truncate text-[10px]">
                    {session.title.replace(/^(Agent Session |Session )\d+/i, '').trim() || `#${session.id}`}
                  </span>
                </Button>
              ))}
              {chatState.sessions.length === 0 && (
                <p className="text-[10px] text-stone-600 px-3 py-1">No sessions yet</p>
              )}
            </div>
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
        <Button
          onClick={handleToggle}
          className={`rounded-full w-14 h-14 shadow-lg transition-all duration-300 ${
            expanded
              ? 'bg-amber-700 hover:bg-amber-600 rotate-180'
              : 'bg-gradient-to-br from-amber-700 to-teal-700 hover:from-amber-600 hover:to-teal-600'
          }`}
          data-testid="global-nav-toggle"
        >
          {expanded ? (
            <ChevronDown className="w-6 h-6 text-black" />
          ) : (
            <div className="flex flex-col items-center">
              <Server className="w-6 h-6 text-black" />
              {pendingFindings.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-black">
                  {pendingFindings.length}
                </span>
              )}
            </div>
          )}
        </Button>
      </InteractiveHover>
    </div>
  );
}
