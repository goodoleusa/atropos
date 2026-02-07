import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Terminal, 
  Plus, 
  Map,
  QrCode,
  Server,
  Database,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  MessageSquare,
  Settings,
  Edit,
  Trash2,
  Save,
  Bug,
  BookOpen,
  Eye,
  EyeOff,
  Rocket,
  Target,
  ExternalLink,
  Play,
  FileText,
  Bot,
  ChevronRight,
  ChevronDown,
  Folder,
  File
} from "lucide-react";
import { CHAOS_MESSAGES, MYSTICAL_CARDS, TOAST_MESSAGES, UI_TEXT, TERMINAL_MESSAGES } from "@/config/messages";
import { AGENT_CAMPAIGNS, CAMPAIGN_CATEGORIES, getDifficultyColor, type Campaign } from "@/config/agentCampaigns";
import { useGame } from "@/hooks/useGameSession";
import { ContentSearch, type SearchableItem, type ContentType } from "@/components/ContentSearch";
import { WikiLinkInput, extractLinkIds } from "@/components/WikiLinkInput";
import { ClueGraph } from "@/components/ClueGraph";
import { ClueBreadcrumbs } from "@/components/ClueBreadcrumbs";
import { ApiPlayground } from "@/components/ApiPlayground";
import CampaignDesigner from "@/components/CampaignDesigner";
import { CollectiblesSection } from "@/pages/admin/CollectiblesSection";
import { QuestsSection } from "@/pages/admin/QuestsSection";
import { QuickPushSection } from "@/pages/admin/QuickPushSection";
import { EffectsPlaygroundSection } from "@/pages/admin/EffectsPlaygroundSection";
import AgentConfigSection from "@/pages/admin/AgentConfigSection";
import { AgentModulesSection } from "@/pages/admin/AgentModulesSection";
import { ShieldAlert, Activity, Clock, Users, AlertTriangle, BarChart3, Star, Award } from "lucide-react";

function AtroposScannerSection() {
  const { data: health } = useQuery({
    queryKey: ["/api/atropos/health"],
    queryFn: () => fetch("/api/atropos/health").then(r => r.json())
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-orbitron text-amber-600 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Atropos Scanner
          </h3>
          <p className="text-xs text-stone-500 mt-1">Status and health of the Rust-based OSINT scanner.</p>
        </div>
        {health?.status === "ok" ? (
          <Badge className="bg-emerald-900/30 text-emerald-500 border-emerald-900/50">Scanner Online</Badge>
        ) : (
          <Badge variant="outline" className="border-red-900/50 text-red-500">Scanner Offline</Badge>
        )}
      </div>

      <Card className="bg-[#0a0500] border-amber-900/30">
        <CardHeader>
          <CardTitle className="text-amber-500 text-sm font-mono">Scanner Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500">Binary Path:</span>
            <span className="text-stone-300 font-mono">{health?.binary?.path || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Available:</span>
            <span className={health?.binary?.available ? "text-emerald-500" : "text-red-500"}>
              {health?.binary?.available ? "Yes" : "No"}
            </span>
          </div>
          {!health?.binary?.available && (
            <div className="mt-4 p-2 bg-red-900/20 border border-red-900/30 rounded text-red-400">
              Error: {health?.binary?.error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityLogPanel() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data, isLoading, refetch } = useQuery<{ activities: any[]; total: number }>({
    queryKey: ["/api/admin/activity-log"],
    queryFn: () => fetch("/api/admin/activity-log?limit=100").then(r => r.json()),
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const activities = data?.activities || [];

  const typeIcon = (type: string) => {
    switch (type) {
      case 'command': return <Terminal className="w-3.5 h-3.5 text-amber-500" />;
      case 'session': return <Users className="w-3.5 h-3.5 text-teal-500" />;
      case 'behavior': return <Activity className="w-3.5 h-3.5 text-purple-500" />;
      default: return <Clock className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'command': return 'border-amber-900/30 bg-amber-950/10';
      case 'session': return 'border-teal-900/30 bg-teal-950/10';
      case 'behavior': return 'border-purple-900/30 bg-purple-950/10';
      default: return 'border-stone-800 bg-stone-900/10';
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
        Loading activity log...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Real-Time Activity Log
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-stone-500 text-xs">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              data-testid="activity-auto-refresh"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="border-amber-900/50 text-amber-500 h-8"
            data-testid="activity-refresh-btn"
          >
            Refresh
          </Button>
          <Badge variant="outline" className="border-amber-900/50 text-amber-400">
            {activities.length} events
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <Card className="bg-amber-950/20 border-amber-900/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {activities.filter(a => a.type === 'command').length}
            </p>
            <p className="text-xs text-stone-500">Commands</p>
          </CardContent>
        </Card>
        <Card className="bg-teal-950/20 border-teal-900/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-teal-400">
              {activities.filter(a => a.type === 'session').length}
            </p>
            <p className="text-xs text-stone-500">Sessions</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-950/20 border-purple-900/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {activities.filter(a => a.type === 'behavior').length}
            </p>
            <p className="text-xs text-stone-500">Behaviors</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0a0500] border-amber-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
            <Clock className="w-4 h-4" /> Live Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-stone-600">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No activity recorded yet</p>
              </div>
            ) : activities.map((act) => (
              <div
                key={act.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${typeColor(act.type)} transition-all hover:opacity-90`}
                data-testid={`activity-row-${act.id}`}
              >
                <div className="flex-shrink-0">{typeIcon(act.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-300 truncate">{act.description}</p>
                  <p className="text-[10px] text-stone-600 truncate">{act.detail}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-500">
                    {act.type}
                  </Badge>
                  <span className="text-[10px] text-stone-600 whitespace-nowrap">{formatTime(act.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickAccessSection() {
  const { data: health } = useQuery({
    queryKey: ["/api/atropos/health"],
    queryFn: () => fetch("/api/atropos/health").then(r => r.json())
  });

  const { data: sessions } = useQuery<any[]>({
    queryKey: ['/api/sessions'],
    queryFn: () => fetch('/api/sessions', {
      headers: { 'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || '' }
    }).then(r => r.ok ? r.json() : [])
  });

  const { data: activityData } = useQuery<{ activities: any[]; total: number }>({
    queryKey: ["/api/admin/activity-log", "quick"],
    queryFn: () => fetch("/api/admin/activity-log?limit=5").then(r => r.json()),
    refetchInterval: 15000,
  });

  const activeSessions = sessions?.filter(s => {
    const lastActive = new Date(s.lastActiveAt || s.createdAt);
    return (Date.now() - lastActive.getTime()) < 5 * 60 * 1000;
  }) || [];

  return (
    <section className="mb-8">
      <h2 className="text-lg font-orbitron text-amber-600 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5" /> Quick Access
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#0a0500] border-red-900/30 hover:border-red-700/50 transition-colors" data-testid="quick-access-atropos">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-500 text-sm font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Atropos Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">Status</span>
              {health?.status === "ok" ? (
                <Badge className="bg-emerald-900/30 text-emerald-500 border-emerald-900/50 text-[10px]">Online</Badge>
              ) : (
                <Badge variant="outline" className="border-red-900/50 text-red-500 text-[10px]">Offline</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">Binary</span>
              <span className={`text-[10px] ${health?.binary?.available ? 'text-emerald-500' : 'text-red-500'}`}>
                {health?.binary?.available ? 'Available' : 'Not Found'}
              </span>
            </div>
            {health?.binary?.path && (
              <p className="text-[10px] text-stone-600 font-mono truncate">{health.binary.path}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0a0500] border-teal-900/30 hover:border-teal-700/50 transition-colors" data-testid="quick-access-sessions">
          <CardHeader className="pb-2">
            <CardTitle className="text-teal-500 text-sm font-mono flex items-center gap-2">
              <Users className="w-4 h-4" /> Active Players
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">Active Now</span>
              <span className="text-lg font-bold text-teal-400">{activeSessions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">Total Sessions</span>
              <span className="text-sm text-stone-400">{sessions?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0500] border-amber-900/30 hover:border-amber-700/50 transition-colors" data-testid="quick-access-activity">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
              <Activity className="w-4 h-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {(activityData?.activities || []).slice(0, 3).map((act, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    act.type === 'command' ? 'bg-amber-500' :
                    act.type === 'session' ? 'bg-teal-500' : 'bg-purple-500'
                  }`} />
                  <span className="text-stone-400 truncate flex-1">{act.description}</span>
                </div>
              ))}
              {(!activityData?.activities || activityData.activities.length === 0) && (
                <p className="text-[10px] text-stone-600">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

interface Clue {
  id: string;
  name: string;
  description: string;
  content: string;
  location: string;
  difficulty: number;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  requiredClues: string[];
  reward: string | null;
  unlocks: string | null;
}

const NAV_GROUPS = [
  {
    label: "Overview",
    color: "amber",
    items: [
      { id: "activity", label: "Activity Log", icon: "Activity" },
      { id: "sessions", label: "Sessions", icon: "Server" },
      { id: "gameplay", label: "Gameplay Analytics", icon: "BarChart3" },
      { id: "behavior", label: "Behavior Analytics", icon: "Eye" },
    ],
  },
  {
    label: "Content",
    color: "teal",
    items: [
      { id: "collectibles", label: "Collectibles", icon: "Database" },
      { id: "quests", label: "Quests", icon: "Trophy" },
      { id: "messages", label: "Messages", icon: "MessageSquare" },
      { id: "graph", label: "Knowledge Graph", icon: "Map" },
    ],
  },
  {
    label: "AI & Agents",
    color: "cyan",
    items: [
      { id: "agent", label: "Agent Chat", icon: "Bot" },
      { id: "agentconfig", label: "Agent Config", icon: "Settings" },
      { id: "agentmodules", label: "Investigation Modules", icon: "Target" },
      { id: "campaigns", label: "Campaign Library", icon: "Rocket" },
      { id: "atropos", label: "Atropos Scanner", icon: "ShieldAlert" },
    ],
  },
  {
    label: "System",
    color: "purple",
    items: [
      { id: "terminal", label: "Commands", icon: "Terminal" },
      { id: "config", label: "Config", icon: "Settings" },
      { id: "effects", label: "Effects Playground", icon: "Sparkles" },
      { id: "quickpush", label: "Quick Push", icon: "Zap" },
    ],
  },
  {
    label: "Communication",
    color: "orange",
    items: [
      { id: "modmail", label: "Modmail", icon: "MessageSquare" },
    ],
  },
];

const NAV_ICONS: Record<string, any> = {
  Activity, Server, Eye, Database, Trophy, MessageSquare, Map, Bot, Settings,
  Target, Rocket, ShieldAlert, Terminal, Sparkles, Zap,
};

export default function AdminDashboard() {
  const { gameState, toggleDevMode } = useGame();
  const [apiPlaygroundOpen, setApiPlaygroundOpen] = useState(false);
  const [campaignDesignerOpen, setCampaignDesignerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'root': true });
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const [clueTrail, setClueTrail] = useState<string[]>([]);
  const [showGraphView, setShowGraphView] = useState(false);
  const [activeSection, setActiveSection] = useState("activity");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (data: any, path: string = 'root') => {
    if (typeof data !== 'object' || data === null) {
      return (
        <div className="flex items-center gap-2 py-1 pl-6">
          <File className="w-3 h-3 text-stone-600" />
          <span className="text-stone-400 text-xs">{String(data)}</span>
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
              <File className="w-3 h-3 text-stone-600" />
            )}
            {hasChildren ? <Folder className="w-3 h-3 text-amber-700" /> : null}
            <span className={`text-xs font-mono ${hasChildren ? 'text-amber-500 font-bold' : 'text-stone-400'}`}>
              {key}
            </span>
            {!hasChildren && (
              <span className="text-[10px] text-stone-600 italic truncate ml-2">
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
  
  // Local state for live config editing (these would sync to server/localStorage)
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

  const addSubliminalMessage = () => {
    if (newSubliminal.trim()) {
      setSubliminalMessages([...subliminalMessages, newSubliminal.trim()]);
      setNewSubliminal('');
    }
  };

  const removeSubliminalMessage = (index: number) => {
    setSubliminalMessages(subliminalMessages.filter((_, i) => i !== index));
  };

  const groupColors: Record<string, string> = {
    amber: 'text-amber-500 border-amber-900/40',
    teal: 'text-teal-500 border-teal-900/40',
    cyan: 'text-cyan-500 border-cyan-900/40',
    purple: 'text-purple-500 border-purple-900/40',
    orange: 'text-orange-500 border-orange-900/40',
  };

  const activeColors: Record<string, string> = {
    amber: 'bg-amber-900/30 text-amber-400 border-amber-700/50',
    teal: 'bg-teal-900/30 text-teal-400 border-teal-700/50',
    cyan: 'bg-cyan-900/30 text-cyan-400 border-cyan-700/50',
    purple: 'bg-purple-900/30 text-purple-400 border-purple-700/50',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-700/50',
  };

  const getGroupForSection = (sectionId: string) =>
    NAV_GROUPS.find(g => g.items.some(i => i.id === sectionId));

  const renderContent = () => {
    switch (activeSection) {
      case 'activity': return <ActivityLogPanel />;
      case 'sessions': return <SessionsPanel />;
      case 'gameplay': return <GameplayAnalyticsPanel />;
      case 'behavior': return <BehaviorAnalyticsPanel />;
      case 'collectibles': return <CollectiblesSection />;
      case 'quests': return <QuestsSection quests={quests} />;
      case 'graph': return <GraphPanel clues={clues} selectedClueId={selectedClueId} setSelectedClueId={setSelectedClueId} clueTrail={clueTrail} setClueTrail={setClueTrail} showGraphView={showGraphView} setShowGraphView={setShowGraphView} gameState={gameState} />;
      case 'agent': return <AgentConfigPanel />;
      case 'agentconfig': return <AgentConfigSection />;
      case 'agentmodules': return <AgentModulesSection />;
      case 'atropos': return <AtroposScannerSection />;
      case 'effects': return <EffectsPlaygroundSection />;
      case 'quickpush': return <QuickPushSection />;
      case 'modmail': return <ModmailPanel />;
      case 'messages': return <MessagesPanel chaosEnabled={chaosEnabled} setChaosEnabled={setChaosEnabled} subliminalMessages={subliminalMessages} newSubliminal={newSubliminal} setNewSubliminal={setNewSubliminal} addSubliminalMessage={addSubliminalMessage} removeSubliminalMessage={removeSubliminalMessage} renderTree={renderTree} />;
      case 'terminal': return <TerminalPanel />;
      case 'config': return <ConfigPanel gameState={gameState} clues={clues} quests={quests} />;
      case 'campaigns': return <CampaignsPanel setSelectedCampaign={setSelectedCampaign} setCampaignDesignerOpen={setCampaignDesignerOpen} />;
      default: return <ActivityLogPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050200] text-stone-300 font-mono">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-[#0a0500] sticky top-0 z-50">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded hover:bg-amber-900/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
              data-testid="sidebar-toggle"
            >
              <Layers className="w-5 h-5 text-amber-600" />
            </button>
            <Server className="w-5 h-5 text-amber-600 hidden md:block" />
            <h1 className="font-orbitron text-lg font-bold">
              <span className="text-amber-600">ADMIN</span> <span className="hidden sm:inline">CONSOLE</span>
            </h1>
            <Badge 
              variant="outline" 
              className={`ml-1 text-[10px] ${gameState.devMode ? 'border-teal-500 text-teal-400 bg-teal-950/30' : 'border-amber-900/50 text-amber-600'}`}
            >
              {gameState.devMode ? 'DEV' : 'GAME'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded border border-amber-900/30 bg-black/30">
              <Label htmlFor="dev-mode-toggle" className="text-stone-400 text-[10px]">Dev</Label>
              <Switch 
                id="dev-mode-toggle"
                checked={gameState.devMode} 
                onCheckedChange={toggleDevMode}
                data-testid="dev-mode-toggle"
              />
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-stone-500 hover:text-amber-500 h-9">
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> <span className="hidden sm:inline">Site</span>
              </Button>
            </Link>
            <Link href="/terminal">
              <Button variant="outline" size="sm" className="border-amber-900/50 text-amber-600 hover:bg-amber-950/30 h-9">
                <Terminal className="w-3.5 h-3.5 mr-1" /> <span className="hidden sm:inline">Terminal</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-49px)]">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} data-testid="sidebar-overlay" />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-64 bg-[#0a0500] border-r border-amber-900/30
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col overflow-hidden
          pt-[49px] lg:pt-0
        `}>
          {/* Quick Access - hidden on mobile to save space */}
          <div className="hidden lg:block p-3 border-b border-amber-900/20">
            <QuickAccessSection />
          </div>

          {/* Nav Groups */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1" data-testid="admin-sidebar">
            {NAV_GROUPS.map((group) => {
              const isCollapsed = collapsedGroups[group.label];
              return (
                <div key={group.label}>
                  <button
                    onClick={() => setCollapsedGroups(prev => ({ ...prev, [group.label]: !prev[group.label] }))}
                    className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded hover:bg-stone-900/30 min-h-[36px] ${groupColors[group.color] || 'text-stone-500'}`}
                    data-testid={`nav-group-${group.label.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <span>{group.label}</span>
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {!isCollapsed && (
                    <div className="space-y-0.5 mt-0.5 ml-1">
                      {group.items.map((item) => {
                        const Icon = NAV_ICONS[item.icon] || Settings;
                        const isActive = activeSection === item.id;
                        const activeGroup = getGroupForSection(item.id);
                        const color = activeGroup?.color || 'amber';
                        return (
                          <button
                            key={item.id}
                            onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-all min-h-[44px] ${
                              isActive 
                                ? `${activeColors[color]} border` 
                                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/30 border border-transparent'
                            }`}
                            data-testid={`nav-item-${item.id}`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Dev Quick Links */}
            {gameState.devMode && (
              <div className="mt-3 pt-3 border-t border-amber-900/20 space-y-0.5">
                <span className="px-3 text-[10px] font-bold text-teal-600 uppercase tracking-wider">Quick Links</span>
                <Link href="/void">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-stone-400 hover:text-purple-400 hover:bg-purple-950/20 min-h-[44px]">
                    <Sparkles className="w-4 h-4" /> The Void
                  </button>
                </Link>
                <Link href="/ai-lab">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-stone-400 hover:text-blue-400 hover:bg-blue-950/20 min-h-[44px]">
                    <Bot className="w-4 h-4" /> AI Lab
                  </button>
                </Link>
                <Link href="/report">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-stone-400 hover:text-orange-400 hover:bg-orange-950/20 min-h-[44px]">
                    <FileText className="w-4 h-4" /> Report Builder
                  </button>
                </Link>
                <button
                  onClick={() => setApiPlaygroundOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-stone-400 hover:text-blue-400 hover:bg-blue-950/20 min-h-[44px]"
                  data-testid="api-playground-button"
                >
                  <Zap className="w-4 h-4" /> API Playground
                </button>
                <button
                  onClick={() => setCampaignDesignerOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-stone-400 hover:text-purple-400 hover:bg-purple-950/20 min-h-[44px]"
                  data-testid="campaign-designer-button"
                >
                  <Layers className="w-4 h-4" /> Campaign Builder
                </button>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8" data-testid="admin-main-content">
          {renderContent()}
        </main>
      </div>

      
      {/* API Playground Modal */}
      <ApiPlayground open={apiPlaygroundOpen} onOpenChange={setApiPlaygroundOpen} />
      <CampaignDesigner
        open={campaignDesignerOpen}
        onOpenChange={setCampaignDesignerOpen}
        sessionToken={gameState?.sessionToken}
      />
    </div>
  );
}

function SessionsPanel() {
  const { data: sessions, isLoading } = useQuery<any[]>({
    queryKey: ['/api/sessions'],
    queryFn: () => fetch('/api/sessions', {
      headers: { 'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || '' }
    }).then(r => r.ok ? r.json() : [])
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
        Loading sessions...
      </div>
    );
  }

  const activeSessions = sessions?.filter(s => {
    const lastActive = new Date(s.lastActiveAt || s.createdAt);
    return (Date.now() - lastActive.getTime()) < 5 * 60 * 1000;
  }) || [];

  if (!sessions || sessions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-orbitron text-amber-500">Player Sessions</h3>
          <Badge className="bg-amber-900/50 text-amber-400">Live View</Badge>
        </div>
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardContent className="p-8 text-center">
            <Server className="w-12 h-12 mx-auto text-stone-700 mb-4" />
            <p className="text-stone-500 text-lg mb-2">No Active Sessions</p>
            <p className="text-stone-600 text-sm">Session data will appear here when players interact with the terminal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-orbitron text-amber-500">Player Sessions</h3>
        <Badge className="bg-teal-900/50 text-teal-400">{activeSessions.length} Active</Badge>
      </div>
      
      <div className="grid gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-teal-950/20 border-teal-900/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-teal-400">{activeSessions.length}</p>
              <p className="text-xs text-stone-500">Active Now</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-950/20 border-amber-900/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{sessions.length}</p>
              <p className="text-xs text-stone-500">Total Sessions</p>
            </CardContent>
          </Card>
          <Card className="bg-teal-950/20 border-teal-900/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-teal-400">
                {sessions.reduce((acc, s) => acc + (s.cluesCollected || 0), 0)}
              </p>
              <p className="text-xs text-stone-500">Clues Collected</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-950/20 border-purple-900/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">
                {sessions.reduce((acc, s) => acc + (s.questsCompleted || 0), 0)}
              </p>
              <p className="text-xs text-stone-500">Quests Completed</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-500 text-sm flex items-center gap-2">
              <Server className="w-4 h-4" /> Recent Player Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {sessions.slice(0, 20).map((session, i) => {
                const lastActive = new Date(session.lastActiveAt || session.createdAt);
                const isActive = (Date.now() - lastActive.getTime()) < 5 * 60 * 1000;
                const isIdle = !isActive && (Date.now() - lastActive.getTime()) < 60 * 60 * 1000;
                
                const timeAgo = (() => {
                  const diff = Date.now() - lastActive.getTime();
                  if (diff < 60000) return 'Just now';
                  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
                  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
                  return `${Math.floor(diff / 86400000)} days ago`;
                })();

                return (
                  <div 
                    key={session.id || i} 
                    className="flex items-center justify-between p-3 bg-stone-900/30 rounded-lg border border-stone-800"
                    data-testid={`session-row-${i}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-teal-500 animate-pulse' : 
                        isIdle ? 'bg-amber-500' : 'bg-stone-600'
                      }`} />
                      <div>
                        <p className="text-sm font-bold text-stone-200">
                          {session.username || `Session ${(session.token || session.id || '').slice(0, 8)}...`}
                        </p>
                        <p className="text-xs text-stone-500">{(session.token || session.id || '').slice(0, 12)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <p className="text-amber-400">{session.cluesCollected || 0}</p>
                        <p className="text-stone-600">clues</p>
                      </div>
                      <div className="text-center">
                        <p className="text-teal-400">{session.questsCompleted || 0}</p>
                        <p className="text-stone-600">quests</p>
                      </div>
                      <Badge variant="outline" className={
                        isActive ? 'border-teal-700 text-teal-400' :
                        isIdle ? 'border-amber-700 text-amber-400' :
                        'border-stone-700 text-stone-500'
                      } data-testid={`session-status-${i}`}>
                        {timeAgo}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BehaviorAnalyticsPanel() {
  const [trends, setTrends] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    loadData();
  }, [selectedDays]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trendsRes, eventsRes] = await Promise.all([
        fetch(`/api/behavior/trends?days=${selectedDays}`).then(r => r.json()),
        fetch('/api/behavior/events?limit=50').then(r => r.json())
      ]);
      setTrends(trendsRes);
      setEvents(eventsRes);
    } catch (error) {
      console.error('Failed to load behavior data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
        Loading behavioral analytics...
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    'aggressive': 'bg-red-900/30 text-red-400',
    'cautious': 'bg-blue-900/30 text-blue-400',
    'curious': 'bg-purple-900/30 text-purple-400',
    'analytical': 'bg-teal-900/30 text-teal-400',
    'jailbreak': 'bg-red-900/50 text-red-300 border border-red-700',
    'stalking': 'bg-orange-900/50 text-orange-300 border border-orange-700',
    'illegal': 'bg-red-950/50 text-red-200 border border-red-600',
    'suspicious': 'bg-amber-900/50 text-amber-300 border border-amber-700',
    'normal': 'bg-stone-900/30 text-stone-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-red-400 flex items-center gap-2">
          <Eye className="w-5 h-5" /> Behavioral Analytics & User Profiling
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Time Range:</span>
          {[7, 14, 30].map(days => (
            <Button
              key={days}
              variant={selectedDays === days ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDays(days)}
              className={selectedDays === days ? "bg-red-800 text-white" : "border-red-900/50 text-red-400"}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a0500] border-red-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-500 text-sm font-mono">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{trends?.totalEvents || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0500] border-teal-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-teal-500 text-sm font-mono">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-400">{trends?.uniqueUsers || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 text-sm font-mono">Flagged Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{trends?.flaggedSessions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0500] border-purple-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-500 text-sm font-mono">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{trends?.categoryDistribution?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Sessions Alert */}
      {trends?.flaggedSessions?.length > 0 && (
        <Card className="bg-red-950/20 border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 font-mono flex items-center gap-2">
              <EyeOff className="w-4 h-4" /> Flagged Sessions (Sandboxed & Playing Along)
            </CardTitle>
            <CardDescription className="text-red-300/70">
              These sessions triggered behavioral flags but are still active in sandbox mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends.flaggedSessions.map((session: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-red-950/30 p-2 rounded border border-red-900/50">
                  <div className="flex items-center gap-3">
                    <code className="text-xs text-red-300 font-mono">{session.sessionToken?.substring(0, 12)}...</code>
                    <Badge className={categoryColors[session.reason] || categoryColors.normal}>
                      {session.reason}
                    </Badge>
                    <Badge variant="outline" className="text-red-400 border-red-800 text-[10px]">
                      {session.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500">
                    {session.sandboxed && <Badge className="bg-amber-900/30 text-amber-400">SANDBOXED</Badge>}
                    {session.playAlong && <Badge className="bg-teal-900/30 text-teal-400">PLAY ALONG</Badge>}
                    <span>{new Date(session.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-500 font-mono text-sm">Behavior Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends?.categoryDistribution?.map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <Badge className={categoryColors[cat.category] || categoryColors.normal}>
                    {cat.category}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-stone-800 rounded-full h-2">
                      <div 
                        className="bg-amber-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (cat.count / (trends.totalEvents || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-400 w-8 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
              {(!trends?.categoryDistribution || trends.categoryDistribution.length === 0) && (
                <p className="text-stone-600 text-sm">No behavioral data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Types */}
        <Card className="bg-[#0a0500] border-teal-900/30">
          <CardHeader>
            <CardTitle className="text-teal-500 font-mono text-sm">Action Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends?.actionTypeDistribution?.map((action: any) => (
                <div key={action.actionType} className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">{action.actionType}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-stone-800 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (action.count / (trends.totalEvents || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-400 w-8 text-right">{action.count}</span>
                  </div>
                </div>
              ))}
              {(!trends?.actionTypeDistribution || trends.actionTypeDistribution.length === 0) && (
                <p className="text-stone-600 text-sm">No action data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="bg-[#0a0500] border-stone-800">
        <CardHeader>
          <CardTitle className="text-stone-400 font-mono text-sm">Recent Behavioral Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {events.map((event: any) => (
              <div 
                key={event.id} 
                className="flex items-center justify-between py-1.5 px-2 bg-stone-900/30 rounded text-xs border border-stone-800/50"
              >
                <div className="flex items-center gap-2">
                  <code className="text-stone-600 font-mono">{event.sessionToken?.substring(0, 8)}...</code>
                  <span className="text-stone-400">{event.actionType}</span>
                  <Badge className={categoryColors[event.category] || categoryColors.normal} variant="outline">
                    {event.category}
                  </Badge>
                </div>
                <span className="text-stone-600 text-[10px]">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-stone-600 text-sm text-center py-4">No behavioral events recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interests & Learning Patterns */}
      <Card className="bg-[#0a0500] border-purple-900/30">
        <CardHeader>
          <CardTitle className="text-purple-500 font-mono text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Learning Style & Interest Analysis
          </CardTitle>
          <CardDescription className="text-stone-500">
            Detected patterns across user sessions for agent customization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs text-stone-400 mb-2">Common Interests</h4>
              <div className="flex flex-wrap gap-1">
                {['network_analysis', 'osint', 'malware', 'web_security', 'cryptography', 'forensics', 'threat_intel', 'cloud'].map(interest => (
                  <Badge key={interest} variant="outline" className="text-[10px] border-purple-900 text-purple-400">
                    {interest.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs text-stone-400 mb-2">Learning Styles Detected</h4>
              <div className="flex flex-wrap gap-1">
                {['experiential', 'visual', 'analytical', 'pragmatic', 'social'].map(style => (
                  <Badge key={style} variant="outline" className="text-[10px] border-teal-900 text-teal-400">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AgentConfigPanel() {
  const [corePrompt, setCorePrompt] = useState('');
  const [enabledModules, setEnabledModules] = useState<string[]>(['payload_exec', 'terminal_cmds', 'osint_recon']);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const MODULES = [
    { id: 'payload_exec', name: 'Payload Execution', desc: 'Parse and execute JSON payloads for CTF tasks' },
    { id: 'terminal_cmds', name: 'Terminal Commands', desc: 'nmap, ssh, crack, decode, ls, cat, find, grep' },
    { id: 'clue_system', name: 'Clue Collection', desc: 'Track clue IDs, locations, unlock conditions' },
    { id: 'crypto_puzzles', name: 'Crypto Puzzles', desc: 'rot13, base64, hex, caesar, vigenere ciphers' },
    { id: 'osint_recon', name: 'OSINT Recon', desc: 'Enumerate routes, clues, session state' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('nexus_agent_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setCorePrompt(config.corePrompt || '');
        setEnabledModules(config.enabledModules || ['payload_exec', 'terminal_cmds', 'osint_recon']);
        setCustomInstructions(config.customInstructions || '');
      } catch {}
    }
  }, []);

  const saveConfig = () => {
    setIsSaving(true);
    const config = { corePrompt, enabledModules, customInstructions };
    localStorage.setItem('nexus_agent_config', JSON.stringify(config));
    setTimeout(() => setIsSaving(false), 500);
  };

  const toggleModule = (moduleId: string) => {
    setEnabledModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-cyan-400 flex items-center gap-2">
          <Bot className="w-5 h-5" /> NEXUS Agent Configuration
        </h3>
        <Button onClick={saveConfig} disabled={isSaving} className="bg-cyan-800 hover:bg-cyan-700 text-white min-h-[48px] touch-manipulation" data-testid="save-agent-config">
          <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saved!' : 'Save Config'}
        </Button>
      </div>

      <Card className="bg-[#0a0500] border-cyan-900/30">
        <CardHeader>
          <CardTitle className="text-cyan-500 text-sm font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Core Identity (Base System Prompt)
          </CardTitle>
          <CardDescription className="text-stone-500">
            This is always included. Override the default NEXUS identity here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={corePrompt}
            onChange={(e) => setCorePrompt(e.target.value)}
            placeholder="NEXUS v2.0 | SysAdmin Corp Terminal Agent&#10;Role: CTF/OSINT assistant, payload interpreter, system navigator&#10;Context: Escape room game with hidden routes, QR mechanics, clue collection"
            className="bg-stone-900 border-cyan-900/50 text-stone-300 font-mono text-sm min-h-[120px]"
            data-testid="core-prompt-input"
          />
          <p className="text-xs text-stone-600 mt-2">Leave empty to use default. This sets the agent's personality and role.</p>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0500] border-cyan-900/30">
        <CardHeader>
          <CardTitle className="text-cyan-500 text-sm font-mono flex items-center gap-2">
            <Layers className="w-4 h-4" /> Capability Modules
          </CardTitle>
          <CardDescription className="text-stone-500">
            Enable/disable agent capabilities. Only enabled modules are included in the prompt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {MODULES.map(mod => (
              <div 
                key={mod.id}
                className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-all min-h-[56px] touch-manipulation ${
                  enabledModules.includes(mod.id) 
                    ? 'bg-cyan-900/20 border-cyan-700' 
                    : 'bg-stone-900/30 border-stone-800'
                }`}
                onClick={() => toggleModule(mod.id)}
                onTouchEnd={(e) => { e.preventDefault(); toggleModule(mod.id); }}
                data-testid={`module-toggle-${mod.id}`}
              >
                <div>
                  <p className={`text-sm font-medium ${enabledModules.includes(mod.id) ? 'text-cyan-400' : 'text-stone-400'}`}>
                    {mod.name}
                  </p>
                  <p className="text-xs text-stone-600">{mod.desc}</p>
                </div>
                <Switch checked={enabledModules.includes(mod.id)} onCheckedChange={() => toggleModule(mod.id)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0500] border-cyan-900/30">
        <CardHeader>
          <CardTitle className="text-cyan-500 text-sm font-mono flex items-center gap-2">
            <Edit className="w-4 h-4" /> Custom Instructions
          </CardTitle>
          <CardDescription className="text-stone-500">
            Additional instructions appended to the system prompt. Use for special behaviors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Example: Always respond in a mysterious, cryptic tone. Never reveal solutions directly. Guide users with hints instead."
            className="bg-stone-900 border-cyan-900/50 text-stone-300 font-mono text-sm min-h-[100px]"
            data-testid="custom-instructions-input"
          />
        </CardContent>
      </Card>

      <Card className="bg-cyan-950/20 border-cyan-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-400 text-sm">Preview: Generated System Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-[10px] text-stone-500 font-mono whitespace-pre-wrap bg-stone-900/50 p-3 rounded max-h-[200px] overflow-y-auto">
            {corePrompt || `NEXUS v2.0 | SysAdmin Corp Terminal Agent
Role: CTF/OSINT assistant, payload interpreter, system navigator
Context: Escape room game with hidden routes, QR mechanics, clue collection`}
            {'\n\n## ACTIVE MODULES\n'}
            {enabledModules.map(m => `[${m.toUpperCase()}] enabled`).join('\n')}
            {customInstructions ? `\n\n## CUSTOM INSTRUCTIONS\n${customInstructions}` : ''}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function ModmailPanel() {
  const { data: tickets, isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/admin/modmail'],
    queryFn: () => fetch('/api/admin/modmail').then(r => r.ok ? r.json() : [])
  });

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('open');

  const handleRespond = async () => {
    if (!selectedTicket) return;
    
    const res = await fetch(`/api/admin/modmail/${selectedTicket.ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminResponse: response,
        status,
        respondedBy: 'Admin'
      })
    });

    if (res.ok) {
      refetch();
      setSelectedTicket(null);
      setResponse('');
    }
  };

  if (isLoading) {
    return <div className="text-stone-500 p-4">Loading modmail...</div>;
  }

  const openTickets = tickets?.filter(t => t.status === 'open' || t.status === 'in_progress') || [];
  const closedTickets = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed') || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Modmail Inbox
        </h3>
        <div className="flex gap-2">
          <Badge className="bg-amber-900/50 text-amber-400">{openTickets.length} Open</Badge>
          <Badge className="bg-stone-800 text-stone-400">{closedTickets.length} Closed</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-400 text-sm">Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            {tickets?.length === 0 && (
              <p className="text-stone-500 text-sm text-center py-4">No tickets yet</p>
            )}
            {tickets?.map(ticket => (
              <div
                key={ticket.ticketId}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-3 rounded-md cursor-pointer border transition-colors ${
                  selectedTicket?.ticketId === ticket.ticketId
                    ? 'bg-amber-900/30 border-amber-600/50'
                    : 'bg-black/30 border-stone-800 hover:border-stone-700'
                }`}
                data-testid={`admin-ticket-${ticket.ticketId}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-stone-500">{ticket.ticketId}</span>
                  <Badge variant="outline" className={`text-[10px] ${
                    ticket.status === 'open' ? 'border-amber-600 text-amber-400' :
                    ticket.status === 'in_progress' ? 'border-blue-600 text-blue-400' :
                    'border-stone-600 text-stone-400'
                  }`}>
                    {ticket.status}
                  </Badge>
                </div>
                <h4 className="text-sm font-medium text-stone-200 truncate">{ticket.subject}</h4>
                <p className="text-xs text-stone-500">From: {ticket.username}</p>
                <p className="text-[10px] text-stone-600 mt-1">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-400 text-sm">
              {selectedTicket ? `Ticket: ${selectedTicket.ticketId}` : 'Select a ticket'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px] text-stone-500 uppercase">Subject</Label>
                  <p className="text-sm text-stone-200">{selectedTicket.subject}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-stone-500 uppercase">Message</Label>
                  <p className="text-sm text-stone-300 bg-black/30 p-2 rounded">{selectedTicket.message}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-stone-500 uppercase">Category</Label>
                  <Badge variant="outline" className="ml-2">{selectedTicket.category}</Badge>
                </div>

                <div className="border-t border-stone-800 pt-3">
                  <Label className="text-[10px] text-stone-500 uppercase">Your Response</Label>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response..."
                    className="bg-black/50 border-stone-700 min-h-[80px] mt-1"
                    data-testid="input-admin-response"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-black/50 border border-stone-700 rounded px-2 py-1 text-sm text-stone-300"
                    data-testid="select-ticket-status"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <Button
                    onClick={handleRespond}
                    className="flex-1 bg-amber-700 hover:bg-amber-600"
                    data-testid="button-send-response"
                  >
                    Send Response
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-stone-500 text-sm text-center py-8">
                Click on a ticket to view details and respond
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MessagesPanel({ chaosEnabled, setChaosEnabled, subliminalMessages, newSubliminal, setNewSubliminal, addSubliminalMessage, removeSubliminalMessage, renderTree }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-teal-400 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Game Narrative & Message Tree
        </h3>
        <Badge variant="outline" className="border-teal-600 text-teal-400">
          Read Only / Simulation
        </Badge>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#0a0500] border-amber-900/30 overflow-hidden">
          <CardHeader className="bg-amber-950/10 border-b border-amber-900/20">
            <CardTitle className="text-amber-500 font-mono text-sm flex items-center gap-2">
              <Folder className="w-4 h-4" /> root/messages/config
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto max-h-[600px]">
            {renderTree({ TERMINAL_MESSAGES, TOAST_MESSAGES, CHAOS_MESSAGES, MYSTICAL_CARDS, UI_TEXT })}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="bg-[#0a0500] border-teal-900/30">
            <CardHeader>
              <CardTitle className="text-teal-400 font-mono text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" /> Chaos Overlay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black/50 p-3 rounded border border-teal-900/20">
                <Label className="text-teal-600 text-[10px] uppercase font-bold mb-2 block">Active Strings</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {CHAOS_MESSAGES.subliminal.map((msg: string, i: number) => (
                    <div key={i} className="flex items-center justify-between group bg-teal-950/10 p-2 rounded border border-teal-900/10">
                      <span className="text-xs font-mono text-stone-300">{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0500] border-amber-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-500 font-mono text-sm">System Simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-amber-900/20 border border-amber-700/30 text-amber-500 text-xs py-6 hover:bg-amber-900/40">
                <Zap className="w-4 h-4 mr-2" /> TRIGGER CHAOS FLASH
              </Button>
              <Button className="w-full bg-teal-900/20 border border-teal-700/30 text-teal-500 text-xs py-6 hover:bg-teal-900/40">
                <Sparkles className="w-4 h-4 mr-2" /> SPAWN MYSTICAL POPUP
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TerminalPanel() {
  return (
    <Card className="bg-[#0a0500] border-amber-900/30">
      <CardHeader>
        <CardTitle className="text-amber-500 font-mono">Available Terminal Commands</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { cmd: 'help', desc: 'Show available commands', category: 'basic' },
            { cmd: 'scan', desc: 'Start network scan', category: 'recon' },
            { cmd: 'clues', desc: 'View collected clues', category: 'game' },
            { cmd: 'quests', desc: 'View active quests', category: 'game' },
            { cmd: 'nexus', desc: 'Open NEXUS AI Agent', category: 'ai' },
            { cmd: 'clear', desc: 'Clear terminal', category: 'basic' },
            { cmd: 'whoami', desc: 'Current user info', category: 'basic' },
            { cmd: 'status', desc: 'System status', category: 'recon' },
            { cmd: 'ls', desc: 'List files', category: 'basic' },
          ].map((item) => (
            <div key={item.cmd} className="p-3 rounded border border-amber-900/20 bg-black/30">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-amber-400 text-sm font-bold">{item.cmd}</code>
                <Badge variant="outline" className="text-[9px] border-stone-700 text-stone-500">{item.category}</Badge>
              </div>
              <p className="text-stone-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigPanel({ gameState, clues, quests }: { gameState: any; clues: any[]; quests: any[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2">
        <Settings className="w-5 h-5" /> System Configuration
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 text-sm">Game State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-stone-400">
            <div className="flex justify-between"><span>Dev Mode</span><span className={gameState.devMode ? 'text-teal-400' : 'text-stone-600'}>{gameState.devMode ? 'ON' : 'OFF'}</span></div>
            <div className="flex justify-between"><span>Total Clues</span><span className="text-amber-400">{clues.length}</span></div>
            <div className="flex justify-between"><span>Total Quests</span><span className="text-amber-400">{quests.length}</span></div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 text-sm">Database</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-stone-400">
            <p>PostgreSQL with Drizzle ORM</p>
            <p className="text-stone-600 mt-1">Schema: shared/schema.ts</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 text-sm">API</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-stone-400">
            <p>Express + TypeScript</p>
            <p className="text-stone-600 mt-1">Routes: server/routes.ts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CampaignsPanel({ setSelectedCampaign, setCampaignDesignerOpen }: { setSelectedCampaign: (c: any) => void; setCampaignDesignerOpen: (v: boolean) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2">
          <Rocket className="w-5 h-5" /> Investigation Campaigns
        </h3>
        <Button
          onClick={() => setCampaignDesignerOpen(true)}
          className="bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 border border-amber-700/30"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> New Campaign
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENT_CAMPAIGNS.map((campaign) => (
          <Card key={campaign.id} className="bg-[#0a0500] border-amber-900/30 hover:border-amber-700/50 transition-all cursor-pointer" onClick={() => { setSelectedCampaign(campaign); setCampaignDesignerOpen(true); }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                <Target className="w-4 h-4" /> {campaign.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-500 text-xs mb-2">{campaign.description}</p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[9px] border-stone-700">{campaign.tags?.[0] || 'general'}</Badge>
                <Badge variant="outline" className={`text-[9px] ${getDifficultyColor(campaign.difficulty)}`}>{campaign.difficulty}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GraphPanel({ clues, selectedClueId, setSelectedClueId, clueTrail, setClueTrail, showGraphView, setShowGraphView, gameState }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-blue-400 flex items-center gap-2">
          <Map className="w-5 h-5" /> Knowledge Graph
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showGraphView ? "default" : "outline"}
            onClick={() => setShowGraphView(true)}
            className={showGraphView ? "bg-blue-900/30 text-blue-400" : "border-blue-900/30 text-stone-400"}
          >
            Graph View
          </Button>
          <Button
            size="sm"
            variant={!showGraphView ? "default" : "outline"}
            onClick={() => setShowGraphView(false)}
            className={!showGraphView ? "bg-blue-900/30 text-blue-400" : "border-blue-900/30 text-stone-400"}
          >
            List View
          </Button>
        </div>
      </div>
      {showGraphView ? (
        <Card className="bg-[#0a0500] border-blue-900/30">
          <CardContent className="p-4">
            <ClueGraph
              clues={clues.map((c: any) => ({ id: c.id, name: c.name, linkedTo: [], linkedFrom: [] }))}
              selectedClueId={selectedClueId || undefined}
              onSelectClue={(id: string) => setSelectedClueId(id)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {selectedClueId && (
            <ClueBreadcrumbs
              currentClue={{ id: selectedClueId, name: clues.find((c: any) => c.id === selectedClueId)?.name || selectedClueId, linkedTo: [], linkedFrom: [] }}
              allClues={clues.map((c: any) => ({ id: c.id, name: c.name, linkedTo: [], linkedFrom: [] }))}
              trail={clueTrail}
              onTrailChange={setClueTrail}
              onNavigate={(id: string) => setSelectedClueId(id)}
            />
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {clues.map((clue: any) => (
              <Card
                key={clue.id}
                className={`bg-[#0a0500] border-blue-900/30 cursor-pointer transition-all hover:border-blue-600/50 ${selectedClueId === clue.id ? 'ring-1 ring-blue-500' : ''}`}
                onClick={() => { setSelectedClueId(clue.id); setClueTrail((prev: any[]) => [...prev.filter((t: any) => t !== clue.id), clue.id]); }}
              >
                <CardContent className="p-3">
                  <p className="text-blue-400 text-sm font-bold">{clue.title}</p>
                  <p className="text-stone-500 text-xs mt-1">{clue.description}</p>
                  <Badge variant="outline" className="mt-2 text-[9px] border-stone-700">{clue.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GameplayAnalyticsPanel() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['gameplay-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/gameplay/analytics');
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['admin-leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/gameplay/leaderboard?limit=10');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['admin-achievements'],
    queryFn: async () => {
      const res = await fetch('/api/gameplay/achievements/all');
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="text-stone-500 text-center py-12">Loading gameplay analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" /> Gameplay Analytics
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Players', value: analytics?.totalPlayers || 0, color: 'text-amber-400' },
          { label: 'Active (24h)', value: analytics?.activePlayers24h || 0, color: 'text-teal-400' },
          { label: 'Active (7d)', value: analytics?.activePlayers7d || 0, color: 'text-purple-400' },
          { label: 'Campaign Runs', value: analytics?.totalCampaignRuns || 0, color: 'text-orange-400' },
          { label: 'Avg Clues/Player', value: analytics?.avgCluesPerPlayer?.toFixed(1) || '0', color: 'text-amber-500' },
          { label: 'Avg Quests/Player', value: analytics?.avgQuestsPerPlayer?.toFixed(1) || '0', color: 'text-teal-500' },
          { label: 'Completion Rate', value: `${Math.round((analytics?.campaignCompletionRate || 0) * 100)}%`, color: 'text-purple-500' },
          { label: 'Achievements', value: achievements.length, color: 'text-amber-400' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#0a0500] border-stone-800">
            <CardContent className="p-3 text-center">
              <p className={`font-mono text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
              <Star className="w-4 h-4" /> Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-stone-600 text-xs text-center py-4">No players yet</p>
            ) : (
              <div className="space-y-1">
                {leaderboard.map((entry: any) => (
                  <div key={entry.rank} className="flex items-center gap-2 p-2 bg-stone-950/50 rounded text-xs">
                    <span className={`font-mono font-bold w-6 text-center ${
                      entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-stone-300' : entry.rank === 3 ? 'text-orange-600' : 'text-stone-600'
                    }`}>#{entry.rank}</span>
                    <span className="text-stone-300 flex-1 truncate">{entry.username}</span>
                    <span className="text-amber-400 font-mono">{entry.xp} XP</span>
                    <Badge variant="outline" className="text-[9px] border-stone-700">Lv.{entry.level}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0a0500] border-teal-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-teal-500 text-sm font-mono flex items-center gap-2">
              <Target className="w-4 h-4" /> Top Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(analytics?.topCampaigns || []).length === 0 ? (
              <p className="text-stone-600 text-xs text-center py-4">No campaign runs yet</p>
            ) : (
              <div className="space-y-1">
                {(analytics?.topCampaigns || []).map((c: any) => (
                  <div key={c.campaignId} className="flex items-center justify-between p-2 bg-stone-950/50 rounded text-xs">
                    <span className="text-stone-400 truncate flex-1">{c.campaignId}</span>
                    <Badge variant="outline" className="text-[9px] border-teal-700 text-teal-400">{c.runCount} runs</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(analytics?.recentEvents || []).length > 0 && (
        <Card className="bg-[#0a0500] border-stone-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-stone-400 text-sm font-mono flex items-center gap-2">
              <Activity className="w-4 h-4" /> Recent Game Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {(analytics?.recentEvents || []).map((event: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-stone-950/30 rounded text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-stone-500">{event.eventType?.replace(/_/g, ' ')}</span>
                    <span className="text-stone-600 truncate">{event.sessionToken?.slice(0, 8)}...</span>
                  </div>
                  {event.xpAwarded > 0 && (
                    <Badge variant="outline" className="text-[9px] border-amber-800 text-amber-500 shrink-0">+{event.xpAwarded} XP</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#0a0500] border-purple-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-500 text-sm font-mono flex items-center gap-2">
            <Award className="w-4 h-4" /> Achievement Definitions ({achievements.length})
          </CardTitle>
          <CardDescription className="text-stone-500 text-xs">
            Manage achievements via POST /api/gameplay/achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-stone-600 text-xs text-center py-4">No achievements defined. Create them via the API.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {achievements.map((ach: any) => (
                <div key={ach.achievementId} className="p-2 bg-stone-950/50 rounded border border-stone-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span>{ach.icon}</span>
                    <span className="text-stone-300 font-bold">{ach.name}</span>
                    <Badge variant="outline" className="text-[9px] capitalize">{ach.rarity}</Badge>
                  </div>
                  <p className="text-stone-500 mt-1">{ach.description}</p>
                  <p className="text-amber-500 text-[10px] mt-1">+{ach.xpReward} XP | {ach.condition?.type}: {String(ach.condition?.value)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
