import { useState, useCallback } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, ArrowRight, Map, Layers, AlertTriangle, Lightbulb,
  CheckCircle, Send, Loader2, Bot, Terminal, Shield, Zap,
  Target, Globe, Brain, FileText, Trophy, Radar, Bug,
  Settings, Eye, Users, ChevronRight, Sparkles, BookOpen,
  Layout, Copy, ExternalLink, Wrench
} from 'lucide-react';

interface ToolEntry {
  id: string;
  name: string;
  route: string;
  icon: any;
  color: string;
  purpose: string;
  features: string[];
  category: 'core' | 'ai' | 'tools' | 'learning' | 'meta' | 'hidden';
}

interface OverlapFinding {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'code_snippet' | 'file_edit' | 'systemic' | 'integration' | 'new_tool';
  description: string;
  involvedTools: string[];
  painPoints: string[];
  suggestion: string;
  targetFiles: string[];
  submitted: boolean;
}

const TOOLS: ToolEntry[] = [
  {
    id: 'home', name: 'Home / Landing', route: '/', icon: Globe, color: 'amber',
    purpose: 'Entry point with video hero, feature cards, and navigation to all areas',
    features: ['Hero video', 'Feature showcase', 'Quick nav cards', 'Floating Agent Chat + QR buttons'],
    category: 'core'
  },
  {
    id: 'terminal', name: 'Terminal', route: '/terminal', icon: Terminal, color: 'amber',
    purpose: 'Interactive hacker-themed terminal with custom commands and secret discovery',
    features: ['Custom command parser', 'Command history', 'Secret commands', 'Floating Agent Chat + QR buttons'],
    category: 'core'
  },
  {
    id: 'investigate', name: 'Investigation Hub', route: '/investigate', icon: Bot, color: 'teal',
    purpose: 'Unified workspace combining Agent Chat, Scanner, SpiderFoot, AI Lab, Prompt Builder, and Learning Profile in tabs',
    features: ['Agent Chat tab', 'Scanner tab (embeds ScannerContent)', 'SpiderFoot tab', 'AI Lab tab (embeds AILabContent)', 'Prompt Builder tab (embeds PromptBuilderContent)', 'Learning Profile tab', 'Tool Outputs feed', 'Findings counter'],
    category: 'core'
  },
  {
    id: 'agents', name: 'NEXUS Agents', route: '/agents', icon: Shield, color: 'purple',
    purpose: '6 specialized security agents with category-based routing, CrewAI/LangChain export, and threat intel feeds',
    features: ['VulnAnalyst, OSINTAnalyst, ThreatIntel, SecretHunter, NetworkRecon, Synthesis', 'Agent orchestration', 'CrewAI/LangChain export', 'Threat intel feeds'],
    category: 'ai'
  },
  {
    id: 'ai-lab', name: 'AI Lab (Standalone)', route: '/ai-lab', icon: Brain, color: 'purple',
    purpose: 'Prompt engineering playground with model comparison, cost tracking, and performance benchmarks',
    features: ['Model selector', 'Token/cost calculator', 'Response comparison', 'Session summaries', 'Prompt Engineering Guide (6 techniques)', 'CrewAI Exporter'],
    category: 'ai'
  },
  {
    id: 'prompt-builder', name: 'Prompt Builder (Standalone)', route: '/prompt-builder', icon: Zap, color: 'amber',
    purpose: 'Build system prompts from modular capability blocks with learning profile integration',
    features: ['Capability modules', 'Context compression', 'Task handoff templates', 'Memory triggers', 'Learning style adaptation'],
    category: 'ai'
  },
  {
    id: 'scanner', name: 'Scanner Dashboard (Standalone)', route: '/scanner', icon: Radar, color: 'orange',
    purpose: 'Atropos Scanner interface for OSINT scanning, Lua script management, and finding analysis',
    features: ['Scan execution', 'Lua script editor', 'Finding categorization', 'Scan history', 'Report integration'],
    category: 'tools'
  },
  {
    id: 'campaigns-hub', name: 'Campaigns Hub', route: '/campaigns', icon: Target, color: 'teal',
    purpose: 'Browse and play published investigation campaigns with filtering and AI generation',
    features: ['Campaign browser', 'Category/difficulty filters', 'AI campaign generator', 'Play button routing'],
    category: 'learning'
  },
  {
    id: 'builder', name: 'Campaign Builder', route: '/builder', icon: Layout, color: 'teal',
    purpose: 'Twine-inspired visual editor for creating investigation campaigns with nodes, links, clues, missions',
    features: ['Visual node editor', 'Arc templates', 'Clue management', 'Terminal missions CRUD', '6 quick-start templates', 'Obsidian export', 'Sitemap sync'],
    category: 'learning'
  },
  {
    id: 'profile', name: 'Player Profile', route: '/profile', icon: Trophy, color: 'amber',
    purpose: 'Player dashboard showing XP, level, skills, achievements, portfolio, and mission control',
    features: ['XP/level tracking', 'Skill radar chart', 'Achievements (500+)', 'Portfolio tab', 'Mission Control tab', 'Stats overview'],
    category: 'core'
  },
  {
    id: 'leaderboards', name: 'Leaderboards', route: '/leaderboards', icon: Trophy, color: 'amber',
    purpose: 'Global rankings across XP, campaigns, clues, and speed categories',
    features: ['Multiple board types', 'Real-time updates', 'Player scores'],
    category: 'core'
  },
  {
    id: 'report', name: 'Report Builder', route: '/report', icon: FileText, color: 'amber',
    purpose: 'Structure bug bounty findings with CVSS scoring, evidence, and markdown export',
    features: ['Sections editor', 'Finding form', 'Severity scoring', 'Evidence tracking', 'AI analysis', 'Markdown export'],
    category: 'tools'
  },
  {
    id: 'recs', name: 'RECS', route: '/recs', icon: Lightbulb, color: 'cyan',
    purpose: 'View and manage agent-generated recs with charts, voting, and 6+ export formats',
    features: ['RECS + Reports tabs', 'Category charts', 'Voting', 'AI prompt / code / git patch / curl / JSON / markdown export', 'Repository sync'],
    category: 'meta'
  },
  {
    id: 'wiki', name: 'Wiki / Documentation', route: '/wiki', icon: BookOpen, color: 'stone',
    purpose: 'Platform documentation covering all features, tools, and workflows',
    features: ['AI Ecosystem guide', 'Tool references', 'Campaign Builder docs', 'Obsidian export docs', 'QR C2 docs'],
    category: 'meta'
  },
  {
    id: 'void', name: 'The Void', route: '/void', icon: Eye, color: 'purple',
    purpose: 'Hidden/mystical area with scrying visions, terminal missions, and quantum-themed clue discovery',
    features: ['Scrying mechanic', 'Hardcoded terminal missions', 'Void clues', 'Tips system'],
    category: 'hidden'
  },
  {
    id: 'archive', name: 'Archive', route: '/archive', icon: FileText, color: 'stone',
    purpose: 'Classified documents that unlock based on clue count, building the lore narrative',
    features: ['Progressive document unlocking', 'Classification levels', 'Clue-gated content'],
    category: 'hidden'
  },
  {
    id: 'mission-landing', name: 'Mission Landing', route: '/mission', icon: Shield, color: 'red',
    purpose: 'Anti-trafficking awareness page with mission framing and social impact stats',
    features: ['Impact statistics', 'Mission framing', 'CTA to investigations'],
    category: 'core'
  },
  {
    id: 'admin', name: 'Admin Dashboard', route: '/admin', icon: Settings, color: 'stone',
    purpose: 'Administrative tools for platform management, sitemap, and content control',
    features: ['Sitemap editor', 'Content management', 'User management'],
    category: 'meta'
  },
];

const INITIAL_FINDINGS: OverlapFinding[] = [
  {
    id: 'overlap-ailab',
    title: 'AI Lab duplicated: standalone /ai-lab + Investigation Hub tab',
    severity: 'high',
    category: 'systemic',
    description: 'AILabContent is rendered both as a standalone page at /ai-lab and embedded inside the Investigation Hub at /investigate (AI Lab tab). Users may not know which to use, and state is not shared between them. Consider making /ai-lab redirect to /investigate?tab=ai-lab, or making the standalone version the canonical one with a deep-link from the Hub.',
    involvedTools: ['AI Lab (Standalone)', 'Investigation Hub'],
    painPoints: ['Duplicate UI code paths', 'Confusing navigation — two ways to reach same tool', 'State not shared between standalone and embedded versions'],
    suggestion: 'Canonicalize AI Lab to one location. Use /investigate?tab=ai-lab as the primary, and redirect /ai-lab there.',
    targetFiles: ['client/src/pages/AILab.tsx', 'client/src/pages/InvestigationWorkspace.tsx'],
    submitted: false,
  },
  {
    id: 'overlap-prompt-builder',
    title: 'Prompt Builder duplicated: standalone /prompt-builder + Investigation Hub tab',
    severity: 'high',
    category: 'systemic',
    description: 'PromptBuilderContent exists at /prompt-builder standalone AND as a tab inside Investigation Hub. Same pattern as AI Lab — two paths to the same component. Learning profile state is loaded in both but not synchronized.',
    involvedTools: ['Prompt Builder (Standalone)', 'Investigation Hub'],
    painPoints: ['Duplicate navigation paths', 'Users bookmark one, find updates in the other', 'Learning store loaded redundantly'],
    suggestion: 'Make Investigation Hub the canonical home for Prompt Builder. Redirect /prompt-builder to /investigate?tab=prompt.',
    targetFiles: ['client/src/pages/PromptBuilder.tsx', 'client/src/pages/InvestigationWorkspace.tsx'],
    submitted: false,
  },
  {
    id: 'overlap-scanner',
    title: 'Scanner Dashboard duplicated: standalone /scanner + Investigation Hub tab',
    severity: 'high',
    category: 'systemic',
    description: 'ScannerContent component is exported from ScannerDashboard.tsx and embedded in both standalone /scanner route and Investigation Hub Scanner tab. Scan results and history may diverge depending on which path the user takes.',
    involvedTools: ['Scanner Dashboard (Standalone)', 'Investigation Hub'],
    painPoints: ['Three code paths for same scanner UI', 'Report context not shared between standalone and embedded'],
    suggestion: 'Consolidate to Investigation Hub as primary scanner location. Keep /scanner as a redirect or minimal launcher.',
    targetFiles: ['client/src/pages/ScannerDashboard.tsx', 'client/src/pages/InvestigationWorkspace.tsx'],
    submitted: false,
  },
  {
    id: 'overlap-agent-chat',
    title: 'Agent Chat available from 4+ locations with no shared conversation state',
    severity: 'medium',
    category: 'systemic',
    description: 'AgentChat component is triggered from: (1) Home page floating button, (2) Terminal floating button, (3) Investigation Hub Agent Chat tab, (4) possibly Campaign Player. Each instance creates a separate chat context. Users may start a conversation on one page and lose it navigating elsewhere.',
    involvedTools: ['Home', 'Terminal', 'Investigation Hub', 'Campaign Player'],
    painPoints: ['Chat history lost between pages', 'Multiple isolated chat instances', 'No global agent chat persistence'],
    suggestion: 'Create a global AgentChat provider at the app root level that persists across page navigation, or use session-based chat history from the backend.',
    targetFiles: ['client/src/components/AgentChat.tsx', 'client/src/pages/Home.tsx', 'client/src/pages/Terminal.tsx'],
    submitted: false,
  },
  {
    id: 'overlap-void-missions',
    title: 'The Void has hardcoded terminal missions separate from Campaign Builder missions',
    severity: 'medium',
    category: 'file_edit',
    description: 'TheVoid.tsx defines TERMINAL_MISSIONS as a static array (Ghost Recon, Secret Hunter, Signal Trace, Cipher Break) that duplicates the concept of terminal missions from the Campaign Builder but with no connection to the database or mission system. These should either pull from the campaign system or be marked as Void-exclusive lore missions.',
    involvedTools: ['The Void', 'Campaign Builder'],
    painPoints: ['Hardcoded mission data disconnected from campaign system', 'No XP tracking for Void missions', 'Confusion about which missions are "real"'],
    suggestion: 'Either integrate Void missions with the campaign terminal mission system (tagged as void-exclusive), or clearly differentiate them as lore/narrative-only.',
    targetFiles: ['client/src/pages/TheVoid.tsx', 'client/src/components/campaign/CampaignTypes.ts'],
    submitted: false,
  },
  {
    id: 'overlap-dashboards',
    title: 'Business Dashboard and Investor Dashboard are separate pages with overlapping metrics',
    severity: 'low',
    category: 'systemic',
    description: 'BusinessDashboard (/business) and InvestorDashboard (/investors) are two separate pages aimed at non-player audiences. They likely share similar KPIs (user counts, engagement, growth). These could be consolidated into a single Stakeholder Dashboard with role-based tabs.',
    involvedTools: ['Business Dashboard', 'Investor Dashboard'],
    painPoints: ['Two separate pages for similar audiences', 'Duplicated metric fetching logic', 'Maintenance burden for similar dashboards'],
    suggestion: 'Merge into a single /stakeholders page with Business/Investor tab views sharing a common data layer.',
    targetFiles: ['client/src/pages/BusinessDashboard.tsx', 'client/src/pages/InvestorDashboard.tsx'],
    submitted: false,
  },
  {
    id: 'naming-missions',
    title: 'Mission naming collision: Mission Landing vs Mission Control vs Terminal Missions',
    severity: 'medium',
    category: 'systemic',
    description: 'The word "mission" is overloaded: (1) Mission Landing (/mission) is the anti-trafficking awareness page, (2) Mission Control is a Profile tab showing campaign progress, (3) Terminal Missions are executable tasks in campaigns. Users searching for "missions" will find three different concepts. Consider renaming for clarity.',
    involvedTools: ['Mission Landing', 'Player Profile', 'Campaign Builder'],
    painPoints: ['Ambiguous terminology', 'Navigation confusion when searching for "missions"', 'Wiki docs need to distinguish three meanings'],
    suggestion: 'Rename: Mission Landing -> "Our Cause" or "Impact"; Mission Control -> "Campaign Progress"; keep Terminal Missions as-is since they are clearly scoped.',
    targetFiles: ['client/src/pages/MissionLanding.tsx', 'client/src/components/MissionControl.tsx'],
    submitted: false,
  },
  {
    id: 'feature-global-nav',
    title: 'No persistent global navigation — users rely on back buttons and memorized URLs',
    severity: 'high',
    category: 'new_tool',
    description: 'Most pages have a "Back" button but there is no persistent sidebar or top nav showing all available tools. Users must know URLs or navigate through the Home page each time. The QuickNav component exists but is not consistently surfaced. A persistent nav would dramatically improve discoverability.',
    involvedTools: ['All pages'],
    painPoints: ['No persistent navigation bar', 'Users get lost in deep pages', 'Feature discoverability is poor', 'QuickNav component underutilized'],
    suggestion: 'Add a collapsible sidebar or persistent top nav that appears on all pages (except Terminal for immersion). Group tools by category: Core, AI Tools, Learning, Meta.',
    targetFiles: ['client/src/App.tsx', 'client/src/components/QuickNav.tsx'],
    submitted: false,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  core: 'bg-amber-900/30 text-amber-400 border-amber-800/50',
  ai: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
  tools: 'bg-orange-900/30 text-orange-400 border-orange-800/50',
  learning: 'bg-teal-900/30 text-teal-400 border-teal-800/50',
  meta: 'bg-stone-800/50 text-stone-400 border-stone-700/50',
  hidden: 'bg-red-900/30 text-red-400 border-red-800/50',
};

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-stone-800 text-stone-400 border-stone-700',
  medium: 'bg-amber-900/40 text-amber-400 border-amber-800',
  high: 'bg-orange-900/40 text-orange-400 border-orange-800',
  critical: 'bg-red-900/40 text-red-400 border-red-800',
};

export default function Walkthrough() {
  const [findings, setFindings] = useState<OverlapFinding[]>(INITIAL_FINDINGS);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('map');
  const [submitAllLoading, setSubmitAllLoading] = useState(false);

  const filteredTools = activeCategory === 'all'
    ? TOOLS
    : TOOLS.filter(t => t.category === activeCategory);

  const submitFinding = useCallback(async (finding: OverlapFinding) => {
    setSubmitting(finding.id);
    try {
      const res = await fetch('/api/recs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finding.title,
          description: finding.description + '\n\nSuggestion: ' + finding.suggestion,
          category: finding.category,
          priority: finding.severity,
          source: 'walkthrough-audit',
          targetFiles: finding.targetFiles,
          painPointsAddressed: finding.painPoints,
          tags: ['walkthrough', 'architecture', 'deduplication'],
        }),
      });

      if (res.status === 429) {
        toast({ title: 'Rate limited', description: 'Slow down — wait a moment and retry.', variant: 'destructive' });
        return;
      }
      if (res.status === 409) {
        toast({ title: 'Already submitted', description: 'This finding was recently submitted.' });
        setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, submitted: true } : f));
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to submit');
      }

      setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, submitted: true } : f));
      toast({ title: 'Sent to RECS', description: `"${finding.title}" submitted to the recommendation system.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(null);
    }
  }, []);

  const submitAll = useCallback(async () => {
    setSubmitAllLoading(true);
    const pending = findings.filter(f => !f.submitted);
    for (const finding of pending) {
      await submitFinding(finding);
      await new Promise(r => setTimeout(r, 2200));
    }
    setSubmitAllLoading(false);
    toast({ title: 'Batch complete', description: `Submitted ${pending.length} recs.` });
  }, [findings, submitFinding]);

  const submittedCount = findings.filter(f => f.submitted).length;

  return (
    <div className="min-h-screen bg-[#0a0500] text-stone-300">
      <header className="sticky top-0 z-50 bg-[#0a0500]/95 backdrop-blur border-b border-amber-900/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 min-h-[44px]" data-testid="back-btn">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Map className="w-6 h-6 text-amber-400" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent" data-testid="walkthrough-title">
                  Platform Walkthrough
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-900/50 text-teal-400 border-teal-700" data-testid="findings-count">
                <Lightbulb className="w-3 h-3 mr-1" />
                {submittedCount}/{findings.length} submitted
              </Badge>
              <Link href="/recs">
                <Button variant="outline" size="sm" className="border-amber-800/50 text-amber-500 hover:text-amber-400 min-h-[44px]" data-testid="view-recs-btn">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View RECS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-stone-900/50 border border-stone-800 p-1" data-testid="walkthrough-tabs">
            <TabsTrigger value="map" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[44px] gap-2" data-testid="tab-map">
              <Map className="w-4 h-4" />
              Tool Map
            </TabsTrigger>
            <TabsTrigger value="findings" className="data-[state=active]:bg-orange-900/50 data-[state=active]:text-orange-400 min-h-[44px] gap-2" data-testid="tab-findings">
              <AlertTriangle className="w-4 h-4" />
              Findings ({findings.length})
            </TabsTrigger>
            <TabsTrigger value="flow" className="data-[state=active]:bg-teal-900/50 data-[state=active]:text-teal-400 min-h-[44px] gap-2" data-testid="tab-flow">
              <Layers className="w-4 h-4" />
              User Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6" data-testid="content-map">
            <Card className="bg-stone-900/50 border-stone-800">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  All Tools & Pages ({TOOLS.length})
                </CardTitle>
                <CardDescription className="text-stone-500">
                  Every route in the platform, organized by category. Click any card to visit that page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6" data-testid="category-filters">
                  {[
                    { id: 'all', label: 'All', count: TOOLS.length },
                    { id: 'core', label: 'Core', count: TOOLS.filter(t => t.category === 'core').length },
                    { id: 'ai', label: 'AI Tools', count: TOOLS.filter(t => t.category === 'ai').length },
                    { id: 'tools', label: 'Scanners & Reports', count: TOOLS.filter(t => t.category === 'tools').length },
                    { id: 'learning', label: 'Learning', count: TOOLS.filter(t => t.category === 'learning').length },
                    { id: 'meta', label: 'Meta / Admin', count: TOOLS.filter(t => t.category === 'meta').length },
                    { id: 'hidden', label: 'Hidden / Lore', count: TOOLS.filter(t => t.category === 'hidden').length },
                  ].map(cat => (
                    <Button
                      key={cat.id}
                      variant={activeCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`min-h-[36px] ${activeCategory === cat.id ? 'bg-amber-700 text-black' : 'border-stone-700 text-stone-400'}`}
                      data-testid={`filter-${cat.id}`}
                    >
                      {cat.label} ({cat.count})
                    </Button>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTools.map(tool => {
                    const Icon = tool.icon;
                    return (
                      <Link key={tool.id} href={tool.route}>
                        <Card className="bg-stone-950/80 border-stone-800 hover:border-amber-800/50 transition-colors cursor-pointer h-full" data-testid={`tool-card-${tool.id}`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Icon className={`w-4 h-4 text-${tool.color}-400`} />
                                <span className="text-stone-200">{tool.name}</span>
                              </CardTitle>
                              <Badge className={`text-[10px] ${CATEGORY_COLORS[tool.category]}`}>
                                {tool.category}
                              </Badge>
                            </div>
                            <code className="text-[10px] text-stone-600 font-mono">{tool.route}</code>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-stone-400 mb-3">{tool.purpose}</p>
                            <div className="flex flex-wrap gap-1">
                              {tool.features.slice(0, 4).map(f => (
                                <Badge key={f} variant="outline" className="text-[9px] border-stone-700 text-stone-500 py-0">
                                  {f}
                                </Badge>
                              ))}
                              {tool.features.length > 4 && (
                                <Badge variant="outline" className="text-[9px] border-stone-700 text-stone-500 py-0">
                                  +{tool.features.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="findings" className="space-y-6" data-testid="content-findings">
            <Card className="bg-stone-900/50 border-stone-800">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-orange-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Architectural Findings ({findings.length})
                    </CardTitle>
                    <CardDescription className="text-stone-500 mt-1">
                      Feature overlaps, naming collisions, and improvement opportunities discovered during the walkthrough.
                      Each finding can be submitted to RECS to test the agentic feedback pipeline.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={submitAll}
                    disabled={submitAllLoading || submittedCount === findings.length}
                    className="bg-teal-700 hover:bg-teal-600 min-h-[44px]"
                    data-testid="submit-all-btn"
                  >
                    {submitAllLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                    ) : submittedCount === findings.length ? (
                      <><CheckCircle className="w-4 h-4 mr-2" />All Submitted</>
                    ) : (
                      <><Send className="w-4 h-4 mr-2" />Submit All ({findings.length - submittedCount} remaining)</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {findings.map(finding => (
                  <Card key={finding.id} className={`border ${finding.submitted ? 'bg-teal-950/20 border-teal-900/30' : 'bg-stone-950/80 border-stone-800'}`} data-testid={`finding-${finding.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className={SEVERITY_COLORS[finding.severity]}>
                              {finding.severity}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-500">
                              {finding.category}
                            </Badge>
                            {finding.submitted && (
                              <Badge className="bg-teal-900/50 text-teal-400 border-teal-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Submitted
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-stone-200 mb-2" data-testid={`finding-title-${finding.id}`}>
                            {finding.title}
                          </h3>
                          <p className="text-xs text-stone-400 mb-3">{finding.description}</p>

                          <div className="space-y-2">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-stone-600 font-bold">Involved Tools</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {finding.involvedTools.map(t => (
                                  <Badge key={t} variant="outline" className="text-[9px] border-amber-800/50 text-amber-500 py-0">{t}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-stone-600 font-bold">Pain Points</span>
                              <ul className="mt-1 space-y-0.5">
                                {finding.painPoints.map(p => (
                                  <li key={p} className="text-[11px] text-stone-500 flex items-start gap-1">
                                    <span className="text-orange-600 mt-0.5">-</span> {p}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-stone-600 font-bold">Target Files</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {finding.targetFiles.map(f => (
                                  <code key={f} className="text-[9px] bg-stone-900 text-stone-500 px-1.5 py-0.5 rounded font-mono">{f}</code>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={finding.submitted || submitting === finding.id}
                          onClick={() => submitFinding(finding)}
                          className={`min-h-[40px] shrink-0 ${
                            finding.submitted
                              ? 'border-teal-800 text-teal-500'
                              : 'border-amber-800/50 text-amber-500 hover:bg-amber-900/30'
                          }`}
                          data-testid={`submit-finding-${finding.id}`}
                        >
                          {submitting === finding.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : finding.submitted ? (
                            <><CheckCircle className="w-4 h-4 mr-1" />Done</>
                          ) : (
                            <><Send className="w-4 h-4 mr-1" />Submit</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flow" className="space-y-6" data-testid="content-flow">
            <Card className="bg-stone-900/50 border-stone-800">
              <CardHeader>
                <CardTitle className="text-teal-400 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Recommended User Flow
                </CardTitle>
                <CardDescription className="text-stone-500">
                  The ideal path through the platform for new users, showing how tools connect.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {[
                    { step: 1, name: 'Home Page', route: '/', desc: 'Watch the hero video, understand the platform mission, see feature cards', icon: Globe, color: 'amber' },
                    { step: 2, name: 'Mission Landing', route: '/mission', desc: 'Understand the anti-trafficking cause and why this training matters', icon: Shield, color: 'red' },
                    { step: 3, name: 'Terminal', route: '/terminal', desc: 'Get hands-on immediately — try commands, discover secrets, feel the aesthetic', icon: Terminal, color: 'amber' },
                    { step: 4, name: 'Campaigns Hub', route: '/campaigns', desc: 'Browse available investigations, pick one matching your skill level', icon: Target, color: 'teal' },
                    { step: 5, name: 'Campaign Player', route: '/play/:id', desc: 'Play through an investigation campaign with NEXUS guidance', icon: Zap, color: 'teal' },
                    { step: 6, name: 'Investigation Hub', route: '/investigate', desc: 'Use Agent Chat, Scanner, SpiderFoot, and AI Lab in a unified workspace', icon: Bot, color: 'teal' },
                    { step: 7, name: 'Report Builder', route: '/report', desc: 'Structure findings into a professional security report', icon: FileText, color: 'amber' },
                    { step: 8, name: 'Profile', route: '/profile', desc: 'Track XP progress, view achievements, build your portfolio', icon: Trophy, color: 'amber' },
                    { step: 9, name: 'Leaderboards', route: '/leaderboards', desc: 'Compare your progress with other investigators globally', icon: Trophy, color: 'amber' },
                    { step: 10, name: 'NEXUS Agents', route: '/agents', desc: 'Get specialized help from expert security agents for advanced work', icon: Shield, color: 'purple' },
                    { step: 11, name: 'Campaign Builder', route: '/builder', desc: 'Create your own investigation campaigns and share with the community', icon: Layout, color: 'teal' },
                    { step: 12, name: 'The Void', route: '/void', desc: 'Discover hidden content, collect rare clues, explore the unknown', icon: Eye, color: 'purple' },
                  ].map((item, idx, arr) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.step} data-testid={`flow-step-${item.step}`}>
                        <Link href={item.route.includes(':') ? '#' : item.route}>
                          <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-900/50 transition-colors cursor-pointer group">
                            <div className={`w-10 h-10 rounded-full bg-${item.color}-900/30 border border-${item.color}-800/50 flex items-center justify-center shrink-0`}>
                              <span className={`text-sm font-bold text-${item.color}-400`}>{item.step}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 text-${item.color}-400`} />
                                <span className="text-sm font-semibold text-stone-200">{item.name}</span>
                                <code className="text-[10px] text-stone-600 font-mono hidden sm:inline">{item.route}</code>
                              </div>
                              <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-stone-700 group-hover:text-amber-600 transition-colors" />
                          </div>
                        </Link>
                        {idx < arr.length - 1 && (
                          <div className="ml-5 h-4 border-l-2 border-stone-800 border-dashed" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-stone-900/50 border-stone-800">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4" />
                  Architecture Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-stone-950/80 rounded-lg p-4 border border-stone-800" data-testid="stat-routes">
                    <div className="text-2xl font-bold text-amber-400">{TOOLS.length}</div>
                    <div className="text-xs text-stone-500">Total Routes</div>
                  </div>
                  <div className="bg-stone-950/80 rounded-lg p-4 border border-stone-800" data-testid="stat-findings">
                    <div className="text-2xl font-bold text-orange-400">{findings.length}</div>
                    <div className="text-xs text-stone-500">Overlap Findings</div>
                  </div>
                  <div className="bg-stone-950/80 rounded-lg p-4 border border-stone-800" data-testid="stat-submitted">
                    <div className="text-2xl font-bold text-teal-400">{submittedCount}</div>
                    <div className="text-xs text-stone-500">Recommendations Sent</div>
                  </div>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  The main architectural concern is the Investigation Hub embedding standalone pages (AI Lab, Scanner, Prompt Builder) as tabs.
                  This creates parallel code paths where the same component renders in two routing contexts.
                  The recommended fix is to canonicalize each tool to one location and use deep-links or redirects for the other.
                  The Agent Chat should be elevated to a global provider for cross-page persistence.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
