import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trophy,
  Terminal,
  ArrowRight,
  Zap,
  Settings,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  ShieldAlert,
} from "lucide-react";
import { CHAOS_MESSAGES, MYSTICAL_CARDS, TOAST_MESSAGES, UI_TEXT, TERMINAL_MESSAGES } from "@/config/messages";
import { useGame } from "@/hooks/useGameSession";
import { ApiPlayground } from "@/components/ApiPlayground";
import { NAV_GROUPS, NAV_ICONS, GROUP_COLORS, ACTIVE_COLORS, type Clue, type Quest } from "@/config/adminNav";

import { ActivityLogPanel } from "@/pages/admin/ActivityLogPanel";
import { QuickAccessSection } from "@/pages/admin/QuickAccessSection";
import { SitemapPanel } from "@/pages/admin/SitemapPanel";
import { SessionsPanel } from "@/pages/admin/SessionsPanel";
import { BehaviorAnalyticsPanel } from "@/pages/admin/BehaviorAnalyticsPanel";
import { AgentConfigPanel } from "@/pages/admin/AgentConfigPanel";
import { CampaignDesignerPanel } from "@/pages/admin/CampaignDesignerPanel";
import { ModmailPanel } from "@/pages/admin/ModmailPanel";
import { AtroposScannerPanel } from "@/pages/admin/AtroposScannerPanel";
import { MessagesPanel, TerminalPanel, ConfigPanel, CampaignsPanel, GraphPanel } from "@/pages/admin/AdminUtilityPanels";
import { CollectiblesSection } from "@/pages/admin/CollectiblesSection";
import { QuestsSection } from "@/pages/admin/QuestsSection";
import { QuickPushSection } from "@/pages/admin/QuickPushSection";
import { EffectsPlaygroundSection } from "@/pages/admin/EffectsPlaygroundSection";
import AgentConfigSection from "@/pages/admin/AgentConfigSection";
import { AgentModulesSection } from "@/pages/admin/AgentModulesSection";
import { GameplaySection } from "@/pages/admin/GameplaySection";
import { FeedbackSection } from "@/pages/admin/FeedbackSection";
import { CurriculumSection } from "@/pages/admin/CurriculumSection";
import { ContextManagerPanel } from "@/pages/admin/ContextManagerPanel";
import { ContentManagerPanel } from "@/pages/admin/ContentManagerPanel";

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const { gameState, toggleDevMode } = useGame();
  const [apiPlaygroundOpen, setApiPlaygroundOpen] = useState(false);
  const [, navigate] = useLocation();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'root': true });
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const [clueTrail, setClueTrail] = useState<string[]>([]);
  const [showGraphView, setShowGraphView] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    try { return localStorage.getItem('admin_section') || 'contentmgr'; } catch { return 'contentmgr'; }
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 768;
    } catch { return window.innerWidth >= 768; }
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('admin_collapsed_groups') || '{}'); } catch { return {}; }
  });
  const [chaosEnabled, setChaosEnabled] = useState(CHAOS_MESSAGES.enabled);
  const [subliminalMessages, setSubliminalMessages] = useState(CHAOS_MESSAGES.subliminal);
  const [newSubliminal, setNewSubliminal] = useState('');

  const { data: clues = [] } = useQuery<Clue[]>({
    queryKey: ['/api/clues'],
    queryFn: () => fetch('/api/clues').then(r => r.json())
  });

  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: ['/api/quests'],
    queryFn: () => fetch('/api/quests').then(r => r.json())
  });

  useEffect(() => {
    try { localStorage.setItem('admin_sidebar', String(sidebarOpen)); } catch {}
  }, [sidebarOpen]);

  useEffect(() => {
    try { localStorage.setItem('admin_section', activeSection); } catch {}
  }, [activeSection]);

  useEffect(() => {
    try { localStorage.setItem('admin_collapsed_groups', JSON.stringify(collapsedGroups)); } catch {}
  }, [collapsedGroups]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--card))] flex items-center justify-center">
        <div className="text-amber-600 font-mono text-sm animate-pulse">Authenticating...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[hsl(var(--card))] flex items-center justify-center" data-testid="admin-login-gate">
        <div className="max-w-lg w-full mx-4 text-center space-y-8">
          <div className="space-y-3">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-900/20 border-2 border-amber-700/50 flex items-center justify-center mb-6">
              <ShieldAlert className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="text-3xl font-orbitron text-amber-500 tracking-tight">Admin Access</h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              This area is restricted. Sign in with your Replit account to continue.
            </p>
          </div>

          <Button
            size="lg"
            className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-12 py-6 text-lg rounded-xl shadow-lg shadow-amber-900/30 transition-all hover:shadow-amber-800/40 hover:scale-[1.02]"
            onClick={() => { window.location.href = "/api/login"; }}
            data-testid="admin-login-btn"
          >
            Sign In to Admin Panel
          </Button>

          <div className="pt-4">
            <Link href="/">
              <span className="text-xs text-muted-foreground hover:text-muted-foreground cursor-pointer transition-colors">
                &larr; Back to platform
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (data: any, path: string = 'root') => {
    if (typeof data !== 'object' || data === null) {
      return (
        <div className="flex items-center gap-2 py-1 pl-6">
          <File className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground text-xs">{String(data)}</span>
        </div>
      );
    }

    return Object.entries(data).map(([key, value]) => {
      const currentPath = `${path}.${key}`;
      const isExpanded = expandedNodes[currentPath];
      const hasChildren = typeof value === 'object' && value !== null;

      return (
        <div key={currentPath} className="pl-4">
          <div 
            className="flex items-center gap-2 py-1 cursor-pointer hover:bg-amber-900/10 rounded px-1 transition-colors"
            onClick={() => hasChildren && toggleNode(currentPath)}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-3 h-3 text-amber-600" /> : <ChevronRight className="w-3 h-3 text-amber-600" />
            ) : (
              <File className="w-3 h-3 text-muted-foreground" />
            )}
            {hasChildren ? <Folder className="w-3 h-3 text-amber-700" /> : null}
            <span className={`text-xs font-mono ${hasChildren ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
              {key}
            </span>
            {!hasChildren && (
              <span className="text-[10px] text-muted-foreground italic truncate ml-2">
                {String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}
              </span>
            )}
          </div>
          {hasChildren && isExpanded && (
            <div className="border-l border-amber-900/20 ml-1.5">
              {renderTree(value, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  const addSubliminalMessage = () => {
    if (newSubliminal.trim()) {
      setSubliminalMessages([...subliminalMessages, newSubliminal.trim()]);
      setNewSubliminal('');
    }
  };

  const removeSubliminalMessage = (index: number) => {
    setSubliminalMessages(subliminalMessages.filter((_: any, i: number) => i !== index));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'activity': return <ActivityLogPanel />;
      case 'sitemap': return <SitemapPanel />;
      case 'sessions': return <SessionsPanel />;
      case 'behavior': return <BehaviorAnalyticsPanel />;
      case 'contentmgr': return <ContentManagerPanel onOpenBuilder={(campaignId?: string) => navigate(campaignId ? `/builder?campaign=${campaignId}` : '/builder')} />;
      case 'designer': return <CampaignDesignerPanel onOpenBuilder={() => navigate('/builder')} />;
      case 'gameplay': return <GameplaySection />;
      case 'collectibles': return <CollectiblesSection />;
      case 'quests': return <QuestsSection quests={quests} />;
      case 'graph': return <GraphPanel clues={clues} selectedClueId={selectedClueId} setSelectedClueId={setSelectedClueId} clueTrail={clueTrail} setClueTrail={setClueTrail} showGraphView={showGraphView} setShowGraphView={setShowGraphView} gameState={gameState} />;
      case 'agent': return <AgentConfigPanel />;
      case 'agentconfig': return <AgentConfigSection />;
      case 'agentmodules': return <AgentModulesSection />;
      case 'atropos': return <AtroposScannerPanel />;
      case 'effects': return <EffectsPlaygroundSection />;
      case 'quickpush': return <QuickPushSection />;
      case 'modmail': return <ModmailPanel />;
      case 'feedback': return <FeedbackSection />;
      case 'messages': return <MessagesPanel chaosEnabled={chaosEnabled} setChaosEnabled={setChaosEnabled} subliminalMessages={subliminalMessages} newSubliminal={newSubliminal} setNewSubliminal={setNewSubliminal} addSubliminalMessage={addSubliminalMessage} removeSubliminalMessage={removeSubliminalMessage} renderTree={renderTree} />;
      case 'terminal': return <TerminalPanel />;
      case 'config': return <ConfigPanel gameState={gameState} clues={clues} quests={quests} />;
      case 'campaigns': return <CampaignsPanel onOpenBuilder={(campaignId?: string) => navigate(campaignId ? `/builder?campaign=${campaignId}` : '/builder')} />;
      case 'curriculum': return <CurriculumSection />;
      case 'contextmgr': return <ContextManagerPanel />;
      default: return <ActivityLogPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--card))] text-foreground font-mono flex flex-col md:flex-row overflow-hidden">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[hsl(var(--card))] border-r border-amber-900/30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-amber-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h1 className="text-sm font-orbitron text-amber-500 tracking-tighter uppercase">Admin Hub</h1>
            </div>
            <Button variant="ghost" size="sm" className="md:hidden text-amber-500" onClick={() => setSidebarOpen(false)}>
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div 
                    className="flex items-center justify-between px-2 mb-1 cursor-pointer group"
                    onClick={() => setCollapsedGroups(prev => ({ ...prev, [group.label]: !prev[group.label] }))}
                  >
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${GROUP_COLORS[group.color]}`}>
                      {group.label}
                    </span>
                    <ChevronDown className={`w-2.5 h-2.5 text-muted-foreground transition-transform ${collapsedGroups[group.label] ? '-rotate-90' : ''}`} />
                  </div>
                  
                  {!collapsedGroups[group.label] && (
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = NAV_ICONS[item.icon] || Settings;
                        const isLink = item.id.startsWith('link:');
                        const isActive = !isLink && activeSection === item.id;

                        if (isLink) {
                          const linkPath = item.id.replace('link:', '');
                          return (
                            <Link key={item.id} href={linkPath}>
                              <button
                                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-[11px] transition-all duration-200 group text-muted-foreground hover:text-amber-400 hover:bg-amber-900/10"
                              >
                                <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-500" />
                                <span className="font-medium truncate">{item.label}</span>
                                <ExternalLink className="w-2.5 h-2.5 ml-auto text-muted-foreground group-hover:text-amber-600" />
                              </button>
                            </Link>
                          );
                        }

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveSection(item.id);
                              if (window.innerWidth < 768) setSidebarOpen(false);
                            }}
                            className={`
                              w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-[11px] transition-all duration-200 group
                              ${isActive 
                                ? ACTIVE_COLORS[group.color] 
                                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                              }
                            `}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isActive ? '' : 'text-muted-foreground group-hover:text-muted-foreground'}`} />
                            <span className="font-medium truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-amber-900/20 space-y-2">
            {user && (
              <div className="flex items-center gap-2 px-2 py-1.5" data-testid="admin-user-info">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-5 h-5 rounded-full border border-amber-900/40" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-900/30 border border-amber-900/40 flex items-center justify-center text-[8px] text-amber-500">
                    {(user.firstName || user.email || "A")[0].toUpperCase()}
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground truncate flex-1">{user.firstName || user.email || "Admin"}</span>
                <button
                  onClick={() => logout()}
                  className="text-[9px] text-muted-foreground hover:text-red-400 transition-colors"
                  data-testid="admin-logout-btn"
                >
                  Logout
                </button>
              </div>
            )}
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-amber-500 text-[10px] h-8">
                <ArrowRight className="w-3 h-3 mr-2 rotate-180" /> Exit to Platform
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-14 border-b border-amber-900/30 bg-[hsl(var(--card))]/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="md:hidden text-amber-500 p-2" onClick={() => setSidebarOpen(true)}>
              <Terminal className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xs font-bold text-foreground capitalize tracking-wide">
                {activeSection.replace(/-/g, ' ')}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-muted-foreground font-mono tracking-tight uppercase">System Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={`h-7 px-2 border-amber-900/30 text-[9px] font-bold ${gameState?.devMode ? 'text-teal-400 border-teal-500/50 bg-teal-950/20' : 'text-muted-foreground'}`}
              onClick={toggleDevMode}
            >
              DEV: {gameState?.devMode ? 'ON' : 'OFF'}
            </Button>
            <div className="w-px h-3 bg-border mx-1" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-muted-foreground hover:text-amber-500"
              onClick={() => setApiPlaygroundOpen(true)}
            >
              <Zap className="w-3.5 h-3.5" />
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
            {activeSection === 'activity' && <QuickAccessSection />}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {renderContent()}
            </div>
          </div>
        </ScrollArea>
      </main>

      <ApiPlayground open={apiPlaygroundOpen} onOpenChange={setApiPlaygroundOpen} />
    </div>
  );
}
