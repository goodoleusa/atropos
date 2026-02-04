/**
 * ============================================================================
 * DEV MODE PANEL - Floating Developer Controls
 * ============================================================================
 * 
 * A persistent, easily accessible floating panel for dev mode controls.
 * Shows in bottom-right corner when dev mode is active or can be toggled.
 * 
 * FEATURES:
 * - Dev mode toggle
 * - Quick navigation to all hidden routes
 * - Session info display
 * - Behavioral system status
 * ============================================================================
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Terminal, 
  Sparkles, 
  FileText, 
  Bug, 
  Bot, 
  Map, 
  ChevronUp, 
  ChevronDown,
  Eye,
  EyeOff,
  ExternalLink,
  Home,
  LogIn,
  Database,
  Shield,
  BarChart3,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/hooks/useGameSession';

interface RouteInfo {
  path: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  hidden: boolean;
  description: string;
}

const SITEMAP: RouteInfo[] = [
  { path: '/', name: 'Home', icon: <Home className="w-3 h-3" />, color: 'amber', hidden: false, description: 'Corporate facade landing' },
  { path: '/login', name: 'Login', icon: <LogIn className="w-3 h-3" />, color: 'stone', hidden: false, description: 'Fake login portal' },
  { path: '/terminal', name: 'Terminal', icon: <Terminal className="w-3 h-3" />, color: 'teal', hidden: true, description: 'Command interface with missions' },
  { path: '/void', name: 'The Void', icon: <Sparkles className="w-3 h-3" />, color: 'purple', hidden: true, description: 'Mystical easter egg' },
  { path: '/archive', name: 'Archive', icon: <FileText className="w-3 h-3" />, color: 'amber', hidden: true, description: 'Data archive' },
  { path: '/debug', name: 'Debug', icon: <Bug className="w-3 h-3" />, color: 'red', hidden: true, description: 'Debug console' },
  { path: '/admin', name: 'Admin', icon: <Settings className="w-3 h-3" />, color: 'amber', hidden: true, description: 'Dashboard, API Playground, Behavior Analytics' },
  { path: '/ai-lab', name: 'AI Lab', icon: <Bot className="w-3 h-3" />, color: 'blue', hidden: true, description: 'Prompt battleground, cost tracking, model comparison' },
  { path: '/report', name: 'Report Builder', icon: <BarChart3 className="w-3 h-3" />, color: 'orange', hidden: true, description: 'Bug bounty reports' },
];

const colorClasses: Record<string, string> = {
  amber: 'border-amber-800 text-amber-400 hover:bg-amber-950/50',
  teal: 'border-teal-800 text-teal-400 hover:bg-teal-950/50',
  purple: 'border-purple-800 text-purple-400 hover:bg-purple-950/50',
  red: 'border-red-800 text-red-400 hover:bg-red-950/50',
  blue: 'border-blue-800 text-blue-400 hover:bg-blue-950/50',
  orange: 'border-orange-800 text-orange-400 hover:bg-orange-950/50',
  stone: 'border-stone-700 text-stone-400 hover:bg-stone-900/50',
};

export default function DevModePanel() {
  const { gameState, toggleDevMode } = useGame();
  const [expanded, setExpanded] = useState(false);
  const [showSitemap, setShowSitemap] = useState(false);

  return (
    <>
      {/* Quick Admin Access Button - Hidden on mobile, visible on desktop when Dev Mode is ON */}
      {gameState.devMode && !expanded && (
        <motion.div
          className="fixed bottom-4 right-20 z-50 hidden sm:flex gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <Link href="/admin">
            <Button
              size="sm"
              className="bg-amber-700 hover:bg-amber-600 text-black font-bold shadow-lg min-h-[44px] px-4"
              data-testid="quick-admin-button"
            >
              <Settings className="w-4 h-4 mr-1" />
              Admin
            </Button>
          </Link>
          <Link href="/terminal">
            <Button
              size="sm"
              variant="outline"
              className="border-teal-700 text-teal-400 hover:bg-teal-950/50 shadow-lg min-h-[44px]"
              data-testid="quick-terminal-button"
            >
              <Terminal className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Floating Toggle Button - Hidden on mobile, visible on desktop */}
      <motion.div
        className="fixed bottom-4 right-4 z-50 hidden sm:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence>
          {expanded ? (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-[#0a0500] border border-amber-900/50 rounded-lg shadow-2xl p-3 sm:p-4 w-[85vw] sm:w-72 max-w-72"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-500" />
                  <span className="font-mono text-sm text-amber-500 font-bold">DEV PANEL</span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setExpanded(false)}
                  className="h-6 w-6 p-0 text-stone-500"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>

              {/* Dev Mode Toggle */}
              <div className="flex items-center justify-between p-2 bg-black/50 rounded border border-amber-900/30 mb-4">
                <div className="flex items-center gap-2">
                  {gameState.devMode ? (
                    <Eye className="w-4 h-4 text-teal-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-stone-500" />
                  )}
                  <span className="text-xs text-stone-300">Dev Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${gameState.devMode ? 'border-teal-600 text-teal-400' : 'border-stone-600 text-stone-500'}`}
                  >
                    {gameState.devMode ? 'ON' : 'OFF'}
                  </Badge>
                  <Switch
                    checked={gameState.devMode}
                    onCheckedChange={toggleDevMode}
                    data-testid="dev-mode-floating-toggle"
                  />
                </div>
              </div>

              {/* Session Info */}
              <div className="text-xs text-stone-500 mb-4 p-2 bg-black/30 rounded">
                <div className="flex justify-between">
                  <span>Session:</span>
                  <span className="text-amber-600 font-mono">{gameState.sessionToken.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Clues:</span>
                  <span className="text-teal-500">{gameState.inventory.length}</span>
                </div>
              </div>

              {/* Sitemap Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSitemap(!showSitemap)}
                className="w-full mb-3 border-amber-900/50 text-amber-500 hover:bg-amber-950/30"
              >
                <Map className="w-3 h-3 mr-2" />
                {showSitemap ? 'Hide Sitemap' : 'Show Sitemap'}
              </Button>

              {/* Sitemap */}
              <AnimatePresence>
                {showSitemap && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {SITEMAP.map(route => (
                        <Link key={route.path} href={route.path}>
                          <button
                            className={`w-full flex items-center gap-2 p-2 rounded text-xs border transition-colors ${colorClasses[route.color]}`}
                          >
                            {route.icon}
                            <span className="flex-1 text-left">{route.name}</span>
                            {route.hidden && (
                              <Badge variant="outline" className="text-[8px] border-purple-800 text-purple-400">
                                HIDDEN
                              </Badge>
                            )}
                          </button>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-amber-900/30">
                <Link href="/admin">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs border-amber-800 text-amber-400">
                    <Database className="w-3 h-3 mr-1" /> Admin
                  </Button>
                </Link>
                <a href="/api/agent/schema" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-stone-700 text-stone-400">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpanded(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg transition-all ${
                gameState.devMode 
                  ? 'bg-teal-950/80 border-teal-600 text-teal-400' 
                  : 'bg-[#0a0500] border-amber-900/50 text-amber-500'
              }`}
              data-testid="dev-mode-panel-button"
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs font-mono font-bold">
                {gameState.devMode ? 'DEV' : 'DEV'}
              </span>
              <ChevronUp className="w-3 h-3" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dev Mode Indicator Bar - responsive for mobile */}
      {gameState.devMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-40 bg-teal-950/90 border-b border-teal-600 py-1 px-2 sm:px-4"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <Badge className="bg-teal-600 text-black text-[8px] sm:text-[10px] px-1.5 sm:px-2">
                <Zap className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> DEV
              </Badge>
              <span className="text-teal-400 text-[10px] sm:text-xs hidden sm:inline">All routes visible • Debug info enabled</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {SITEMAP.filter(r => r.hidden).slice(0, 3).map(route => (
                <Link key={route.path} href={route.path}>
                  <Button size="sm" variant="ghost" className="h-6 min-w-[36px] sm:min-w-0 text-[10px] text-teal-400 hover:text-teal-300 px-1 sm:px-2">
                    {route.icon}
                    <span className="ml-1 hidden sm:inline">{route.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

// Export sitemap for use elsewhere
export { SITEMAP };
export type { RouteInfo };
