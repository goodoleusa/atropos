import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/hooks/useGameSession';
import { useReportContext } from '@/hooks/useReportContext';
import { Terminal, Brain, FileText, ChevronDown, Zap, Home, Search } from 'lucide-react';
import { ModmailDialog } from './ModmailDialog';
import { MultiplayerLobby } from './MultiplayerLobby';

const NAV_STYLES = {
  amber: { active: 'bg-amber-900/30 text-amber-400', icon: 'text-amber-500' },
  teal: { active: 'bg-teal-900/30 text-teal-400', icon: 'text-teal-500' },
  purple: { active: 'bg-purple-900/30 text-purple-400', icon: 'text-purple-500' },
} as const;

export default function QuickNav() {
  const [expanded, setExpanded] = useState(false);
  const [location] = useLocation();
  const { gameState } = useGame();
  const { pendingFindings, currentSession, targets } = useReportContext();

  const navItems = [
    { path: '/', icon: Home, label: 'Home', color: 'amber' as const },
    { path: '/terminal', icon: Terminal, label: 'Terminal', color: 'amber' as const },
    { path: '/investigate', icon: Search, label: 'Investigate', color: 'teal' as const },
    { path: '/ai-lab', icon: Brain, label: 'AI Lab', color: 'teal' as const },
    { path: '/report', icon: FileText, label: 'Report', color: 'purple' as const, badge: pendingFindings.length > 0 ? pendingFindings.length : undefined },
  ];

  if (location === '/admin' || location === '/login') return null;

  return (
    <div className="hidden md:flex fixed bottom-4 right-4 z-50 flex-col items-end gap-2" data-testid="quick-nav">
      {expanded && (
        <div className="bg-black/90 backdrop-blur border border-amber-900/50 rounded-lg p-2 space-y-1 animate-in slide-in-from-bottom-2">
          {currentSession && (
            <div className="px-3 py-2 border-b border-stone-800 mb-2">
              <p className="text-[10px] text-stone-500 uppercase">Active Session</p>
              <p className="text-xs text-amber-400 font-bold truncate max-w-[150px]">{currentSession.name}</p>
              <div className="flex gap-2 mt-1 text-[10px]">
                <span className="text-teal-400">{targets.length} targets</span>
                <span className="text-purple-400">{pendingFindings.length} findings</span>
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
                  className={`w-full justify-start min-h-[44px] ${
                    isActive ? styles.active : 'text-stone-400 hover:text-stone-200'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? styles.icon : ''}`} />
                  {item.label}
                  {item.badge && (
                    <Badge className="ml-auto bg-purple-700 text-white text-[10px] px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}

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
            </div>
          </div>

          <div className="border-t border-stone-800 pt-2 mt-2 flex gap-1">
            <ModmailDialog />
            <MultiplayerLobby />
          </div>
        </div>
      )}

      <Button
        onClick={() => setExpanded(!expanded)}
        className={`rounded-full w-14 h-14 shadow-lg ${
          expanded 
            ? 'bg-amber-700 hover:bg-amber-600' 
            : 'bg-gradient-to-br from-amber-700 to-teal-700 hover:from-amber-600 hover:to-teal-600'
        }`}
        data-testid="quick-nav-toggle"
      >
        {expanded ? (
          <ChevronDown className="w-6 h-6 text-black" />
        ) : (
          <div className="flex flex-col items-center">
            <Zap className="w-5 h-5 text-black" />
            {pendingFindings.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full text-[10px] text-white flex items-center justify-center">
                {pendingFindings.length}
              </span>
            )}
          </div>
        )}
      </Button>
    </div>
  );
}
