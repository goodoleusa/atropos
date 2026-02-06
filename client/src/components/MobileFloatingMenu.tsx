import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/hooks/useGameSession';
import { useReportContext } from '@/hooks/useReportContext';
import { QRCodeModal } from '@/components/QRCodeModal';
import { AgentChat } from '@/components/AgentChat';
import { 
  Menu, 
  X, 
  Home, 
  Terminal, 
  Brain, 
  FileText, 
  Settings, 
  QrCode,
  Search,
  Bug,
  Sparkles,
  Bot,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  color: string;
  badge?: number;
  devOnly?: boolean;
}

export default function MobileFloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [agentChatOpen, setAgentChatOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { gameState, toggleDevMode } = useGame();
  const { pendingFindings } = useReportContext();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const navItems: NavItem[] = [
    { path: '/', icon: Home, label: 'Home', color: 'amber' },
    { path: '/terminal', icon: Terminal, label: 'Terminal', color: 'amber' },
    { path: '/agents', icon: Bot, label: 'Agents', color: 'teal' },
    { path: '/investigate', icon: Search, label: 'Investigate', color: 'teal' },
    { path: '/ai-lab', icon: Brain, label: 'AI Lab', color: 'teal' },
    { path: '/report', icon: FileText, label: 'Report', color: 'purple', badge: pendingFindings.length || undefined },
    { path: '/campaigns', icon: Shield, label: 'Campaigns', color: 'teal' },
    ...(gameState.devMode ? [
      { path: '/admin', icon: Settings, label: 'Admin', color: 'amber', devOnly: true },
      { path: '/debug', icon: Bug, label: 'Debug', color: 'red', devOnly: true },
      { path: '/void', icon: Sparkles, label: 'Void', color: 'purple', devOnly: true },
    ] : []),
  ];

  const handleNavigation = useCallback((path: string) => {
    setLocation(path);
    setIsOpen(false);
  }, [setLocation]);

  if (location === '/admin' || location === '/login') return null;
  if (!isMobile) return null;

  const colorMap: Record<string, string> = {
    amber: 'bg-amber-900/80 text-amber-400 border-amber-700',
    teal: 'bg-teal-900/80 text-teal-400 border-teal-700',
    purple: 'bg-purple-900/80 text-purple-400 border-purple-700',
    red: 'bg-red-900/80 text-red-400 border-red-700',
  };

  const totalBadge = pendingFindings.length + (gameState.inventory?.length || 0);

  return (
    <div className="fixed bottom-4 right-4 z-[100]" data-testid="mobile-floating-menu">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              role="presentation"
              aria-hidden="true"
            />
            
            <motion.nav
              className="absolute bottom-16 right-0 w-56 bg-black/95 backdrop-blur border border-amber-900/50 rounded-xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              role="navigation"
              aria-label="Mobile navigation menu"
            >
              <div className="p-2 border-b border-stone-800">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs text-stone-500 uppercase font-display">Navigation</span>
                  {gameState.devMode && (
                    <Badge className="bg-amber-700 text-black text-[10px]">DEV</Badge>
                  )}
                </div>
              </div>
              
              <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto" role="list">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                        min-h-[48px] touch-manipulation
                        ${isActive 
                          ? colorMap[item.color] 
                          : 'text-stone-400 hover:bg-stone-800/50 active:bg-stone-700/50'
                        }
                      `}
                      role="listitem"
                      aria-current={isActive ? 'page' : undefined}
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                      <span className="flex-1 text-left font-display">{item.label}</span>
                      {item.badge && (
                        <Badge className="bg-purple-600 text-white text-[10px] min-w-[20px]">
                          {item.badge}
                        </Badge>
                      )}
                      {item.devOnly && (
                        <Badge variant="outline" className="border-amber-700 text-amber-600 text-[9px]">
                          DEV
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="p-2 border-t border-stone-800 bg-black/50">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-amber-500 font-mono font-bold">Lv.{gameState.level || 1}</span>
                      <span className="text-amber-400 font-mono text-[10px]">{(gameState.xp || 0).toLocaleString()} XP</span>
                    </div>
                    <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, ((gameState.xp || 0) % 250) / 250 * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 py-1 text-xs">
                  <span className="text-stone-500">Clues:</span>
                  <span className="text-amber-500 font-mono">{gameState.inventory?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 text-xs">
                  <span className="text-stone-500">Session:</span>
                  <span className="text-stone-600 font-mono text-[10px]">
                    {gameState.sessionToken?.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-2 mt-1 border-t border-stone-800">
                  <div className="flex items-center gap-2">
                    {gameState.devMode ? (
                      <Eye className="w-4 h-4 text-teal-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-stone-500" />
                    )}
                    <span className="text-xs text-stone-400">Dev Mode</span>
                  </div>
                  <Switch
                    checked={gameState.devMode}
                    onCheckedChange={toggleDevMode}
                    className="data-[state=checked]:bg-teal-600"
                    data-testid="mobile-dev-mode-toggle"
                  />
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Quick Action Buttons - always visible */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => setAgentChatOpen(true)}
          className="w-12 h-12 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-500 shadow-lg border-2 border-amber-900/50 touch-manipulation"
          size="icon"
          aria-label="Open AI Agent"
          data-testid="mobile-agent-button"
        >
          <Bot className="w-5 h-5" />
        </Button>
        
        <Button
          onClick={() => setQrModalOpen(true)}
          className="w-12 h-12 rounded-full bg-amber-700 hover:bg-amber-600 text-black shadow-lg border-2 border-amber-500/30 touch-manipulation"
          size="icon"
          aria-label="QR Scanner"
          data-testid="mobile-qr-button"
        >
          <QrCode className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-full shadow-lg 
            transition-all duration-200
            ${isOpen 
              ? 'bg-stone-800 border-stone-600' 
              : 'bg-gradient-to-br from-amber-600 to-amber-800 border-amber-500'
            }
            border-2 touch-manipulation
          `}
          size="icon"
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          data-testid="mobile-menu-toggle"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6 text-white" aria-hidden="true" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative"
              >
                <Menu className="w-6 h-6 text-white" aria-hidden="true" />
                {totalBadge > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold"
                    aria-label={`${totalBadge} notifications`}
                  >
                    {totalBadge > 9 ? '9+' : totalBadge}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
      
      {/* Modals */}
      <QRCodeModal open={qrModalOpen} onOpenChange={setQrModalOpen} />
      <AgentChat open={agentChatOpen} onOpenChange={setAgentChatOpen} />
    </div>
  );
}
