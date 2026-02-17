import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Eye, Users, TrendingUp, Activity, Target, Map, ArrowRight,
  Clock, BarChart3, Filter, Download, RefreshCw, Loader2,
  User, Zap, ChevronRight, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useReportContext } from '@/hooks/useReportContext';

interface BehaviorTrends {
  totalEvents: number;
  uniqueUsers: number;
  categoryDistribution: { category: string; count: number }[];
  actionTypeDistribution: { actionType: string; count: number }[];
  flaggedSessions: any[];
}

interface BehaviorEvent {
  id: number;
  sessionToken: string;
  actionType: string;
  category: string;
  intensity: number;
  metadata: any;
  createdAt: string;
}

interface UserJourney {
  sessionToken: string;
  events: BehaviorEvent[];
  firstSeen: string;
  lastSeen: string;
  totalActions: number;
  topCategories: string[];
  persona: string;
  engagement: 'low' | 'medium' | 'high';
}

const PERSONA_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  explorer: { bg: 'bg-teal-900/30', text: 'text-teal-400', label: 'Explorer' },
  power_user: { bg: 'bg-amber-900/30', text: 'text-amber-400', label: 'Power User' },
  learner: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'Learner' },
  casual: { bg: 'bg-stone-800/50', text: 'text-stone-400', label: 'Casual' },
  analyst: { bg: 'bg-purple-900/30', text: 'text-purple-400', label: 'Analyst' },
  builder: { bg: 'bg-orange-900/30', text: 'text-orange-400', label: 'Builder' },
};

const ENGAGEMENT_COLORS = {
  low: 'bg-stone-700/30 text-stone-400 border-stone-600/30',
  medium: 'bg-amber-900/30 text-amber-400 border-amber-700/30',
  high: 'bg-teal-900/30 text-teal-400 border-teal-700/30',
};

function classifyPersona(events: BehaviorEvent[]): string {
  const categories = events.map(e => e.category);
  const freq: Record<string, number> = {};
  categories.forEach(c => { freq[c] = (freq[c] || 0) + 1; });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  if (!top.length) return 'casual';
  const topCat = top[0][0];
  if (topCat === 'agent' || topCat === 'terminal') return 'power_user';
  if (topCat === 'navigation' && events.length > 20) return 'explorer';
  if (topCat === 'content') return 'builder';
  if (topCat === 'quest' || topCat === 'clue') return 'learner';
  if (events.length > 30) return 'analyst';
  return 'casual';
}

function classifyEngagement(count: number): 'low' | 'medium' | 'high' {
  if (count >= 20) return 'high';
  if (count >= 8) return 'medium';
  return 'low';
}

function buildJourneys(events: BehaviorEvent[]): UserJourney[] {
  const bySession: Record<string, BehaviorEvent[]> = {};
  events.forEach(e => {
    const key = e.sessionToken || 'unknown';
    if (!bySession[key]) bySession[key] = [];
    bySession[key].push(e);
  });

  return Object.entries(bySession).map(([token, evts]) => {
    const sorted = evts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const catFreq: Record<string, number> = {};
    evts.forEach(e => { catFreq[e.category] = (catFreq[e.category] || 0) + 1; });
    const topCats = Object.entries(catFreq).sort((a, b) => b[1] - a[1]).slice(0, 3).map(c => c[0]);

    return {
      sessionToken: token,
      events: sorted,
      firstSeen: sorted[0]?.createdAt || '',
      lastSeen: sorted[sorted.length - 1]?.createdAt || '',
      totalActions: evts.length,
      topCategories: topCats,
      persona: classifyPersona(evts),
      engagement: classifyEngagement(evts.length),
    };
  }).sort((a, b) => b.totalActions - a.totalActions);
}

function JourneyTimeline({ journey }: { journey: UserJourney }) {
  const [expanded, setExpanded] = useState(false);
  const persona = PERSONA_STYLES[journey.persona] || PERSONA_STYLES.casual;
  const steps = expanded ? journey.events : journey.events.slice(0, 6);

  return (
    <Card className="bg-stone-950/80 border-stone-800" data-testid={`journey-${journey.sessionToken.slice(0, 8)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            <code className="text-xs text-stone-400 font-mono">{journey.sessionToken.slice(0, 12)}...</code>
            <Badge className={persona.bg + ' ' + persona.text + ' text-[9px]'}>{persona.label}</Badge>
            <Badge variant="outline" className={ENGAGEMENT_COLORS[journey.engagement] + ' text-[9px]'}>
              {journey.engagement} engagement
            </Badge>
          </div>
          <span className="text-[10px] text-stone-500">{journey.totalActions} actions</span>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-1 flex-wrap mb-3">
          {steps.map((evt, i) => (
            <div key={evt.id || i} className="flex items-center gap-1">
              <div className="group relative">
                <div className={`px-2 py-1 rounded text-[10px] font-mono border cursor-default transition-colors
                  ${evt.category === 'agent' ? 'bg-teal-900/20 border-teal-800/40 text-teal-400' :
                    evt.category === 'terminal' ? 'bg-amber-900/20 border-amber-800/40 text-amber-400' :
                    evt.category === 'navigation' ? 'bg-blue-900/20 border-blue-800/40 text-blue-400' :
                    evt.category === 'quest' ? 'bg-purple-900/20 border-purple-800/40 text-purple-400' :
                    'bg-stone-900/40 border-stone-800 text-stone-400'}`}
                >
                  {evt.actionType}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-[9px] text-stone-300 whitespace-nowrap shadow-lg">
                  {evt.category} · {new Date(evt.createdAt).toLocaleTimeString()}
                </div>
              </div>
              {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-stone-700 shrink-0" />}
            </div>
          ))}
          {journey.events.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] text-amber-500 h-6 px-2"
              onClick={() => setExpanded(!expanded)}
              data-testid="button-expand-journey"
            >
              {expanded ? 'Show less' : `+${journey.events.length - 6} more`}
            </Button>
          )}
        </div>
        <div className="flex gap-4 text-[10px] text-stone-500">
          <span><Clock className="w-3 h-3 inline mr-1" />First: {new Date(journey.firstSeen).toLocaleString()}</span>
          <span>Last: {new Date(journey.lastSeen).toLocaleString()}</span>
          <span className="text-stone-600">Top: {journey.topCategories.join(', ')}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PersonaBreakdown({ journeys }: { journeys: UserJourney[] }) {
  const personaCounts: Record<string, number> = {};
  journeys.forEach(j => { personaCounts[j.persona] = (personaCounts[j.persona] || 0) + 1; });
  const total = journeys.length || 1;

  return (
    <Card className="bg-stone-950/80 border-stone-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-400 text-sm font-orbitron flex items-center gap-2">
          <Users className="w-4 h-4" /> User Personas
        </CardTitle>
        <CardDescription className="text-stone-500 text-xs">Auto-classified from behavior patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(PERSONA_STYLES).map(([key, style]) => {
            const count = personaCounts[key] || 0;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={key} className="flex items-center gap-3" data-testid={`persona-${key}`}>
                <Badge className={`${style.bg} ${style.text} text-[10px] w-24 justify-center`}>{style.label}</Badge>
                <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600/80 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-stone-400 w-12 text-right">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function EngagementFunnel({ journeys }: { journeys: UserJourney[] }) {
  const total = journeys.length;
  const high = journeys.filter(j => j.engagement === 'high').length;
  const medium = journeys.filter(j => j.engagement === 'medium').length;
  const low = journeys.filter(j => j.engagement === 'low').length;

  const stages = [
    { label: 'All Visitors', count: total, color: 'bg-stone-600' },
    { label: 'Low Engagement', count: low, color: 'bg-stone-500' },
    { label: 'Medium Engagement', count: medium, color: 'bg-amber-600' },
    { label: 'High Engagement', count: high, color: 'bg-teal-600' },
  ];

  return (
    <Card className="bg-stone-950/80 border-stone-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-400 text-sm font-orbitron flex items-center gap-2">
          <Target className="w-4 h-4" /> Engagement Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stages.map((stage, i) => {
            const w = total > 0 ? Math.max(15, (stage.count / total) * 100) : 0;
            return (
              <div key={stage.label} className="flex items-center gap-3" data-testid={`funnel-stage-${i}`}>
                <span className="text-[10px] text-stone-400 w-32 text-right uppercase tracking-wider">{stage.label}</span>
                <div className="flex-1 flex items-center">
                  <div className={`h-6 ${stage.color} rounded flex items-center justify-end pr-2 transition-all`}
                    style={{ width: `${w}%` }}>
                    <span className="text-[10px] text-white font-bold">{stage.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryHeatmap({ trends }: { trends: BehaviorTrends | null }) {
  if (!trends?.categoryDistribution?.length) return null;
  const maxCount = Math.max(...trends.categoryDistribution.map(c => c.count), 1);

  return (
    <Card className="bg-stone-950/80 border-stone-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-400 text-sm font-orbitron flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Behavior Heatmap
        </CardTitle>
        <CardDescription className="text-stone-500 text-xs">Category distribution across all sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {trends.categoryDistribution.map(cat => {
            const intensity = cat.count / maxCount;
            return (
              <div
                key={cat.category}
                className="rounded-lg p-3 border border-stone-800 text-center transition-colors"
                style={{ backgroundColor: `rgba(245, 158, 11, ${intensity * 0.3})` }}
                data-testid={`heatmap-${cat.category}`}
              >
                <div className="text-lg font-bold text-amber-400">{cat.count}</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">{cat.category}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionTimeline({ trends }: { trends: BehaviorTrends | null }) {
  if (!trends?.actionTypeDistribution?.length) return null;
  const max = Math.max(...trends.actionTypeDistribution.map(a => a.count), 1);

  return (
    <Card className="bg-stone-950/80 border-stone-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-400 text-sm font-orbitron flex items-center gap-2">
          <Activity className="w-4 h-4" /> Action Types
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trends.actionTypeDistribution.slice(0, 12).map(action => (
            <div key={action.actionType} className="flex items-center gap-3">
              <span className="text-[10px] text-stone-400 w-28 truncate font-mono">{action.actionType}</span>
              <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600/70 rounded-full" style={{ width: `${(action.count / max) * 100}%` }} />
              </div>
              <span className="text-xs text-stone-500 w-8 text-right">{action.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MarketingInsights({ journeys, trends }: { journeys: UserJourney[]; trends: BehaviorTrends | null }) {
  const { addToolOutput } = useReportContext();

  const highEngagement = journeys.filter(j => j.engagement === 'high');
  const retentionRate = journeys.length > 0
    ? Math.round((journeys.filter(j => j.totalActions >= 5).length / journeys.length) * 100) : 0;
  const avgActions = journeys.length > 0
    ? Math.round(journeys.reduce((s, j) => s + j.totalActions, 0) / journeys.length) : 0;

  const topPersona = Object.entries(
    journeys.reduce((acc: Record<string, number>, j) => { acc[j.persona] = (acc[j.persona] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  const insights = [
    {
      title: 'Retention Rate',
      value: `${retentionRate}%`,
      description: 'Users with 5+ actions',
      icon: TrendingUp,
      severity: retentionRate > 50 ? 'good' : retentionRate > 25 ? 'ok' : 'warn',
    },
    {
      title: 'Avg. Actions/User',
      value: `${avgActions}`,
      description: 'Mean actions per session',
      icon: Activity,
      severity: avgActions > 15 ? 'good' : avgActions > 5 ? 'ok' : 'warn',
    },
    {
      title: 'Power Users',
      value: `${highEngagement.length}`,
      description: 'High-engagement sessions',
      icon: Zap,
      severity: highEngagement.length > 5 ? 'good' : highEngagement.length > 0 ? 'ok' : 'warn',
    },
    {
      title: 'Primary Persona',
      value: topPersona ? PERSONA_STYLES[topPersona[0]]?.label || topPersona[0] : 'N/A',
      description: topPersona ? `${topPersona[1]} users` : 'No data',
      icon: Users,
      severity: 'ok' as const,
    },
  ];

  const exportReport = () => {
    const report = {
      generated: new Date().toISOString(),
      totalUsers: journeys.length,
      retentionRate,
      avgActions,
      highEngagementUsers: highEngagement.length,
      topPersona: topPersona?.[0],
      personaBreakdown: journeys.reduce((acc: Record<string, number>, j) => {
        acc[j.persona] = (acc[j.persona] || 0) + 1; return acc;
      }, {}),
      categoryBreakdown: trends?.categoryDistribution || [],
      recommendations: [
        retentionRate < 30 ? 'Low retention — consider onboarding improvements or guided tutorials' : null,
        avgActions < 5 ? 'Low engagement — add more interactive elements and rewards' : null,
        highEngagement.length === 0 ? 'No power users — review feature discoverability' : null,
      ].filter(Boolean),
    };

    addToolOutput({
      type: 'analysis',
      source: 'behavior-analysis',
      content: `Marketing insights report: ${journeys.length} users, ${retentionRate}% retention, ${avgActions} avg actions`,
      metadata: report,
    });

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `behavior-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report Exported", description: "Marketing insights exported and sent to Report Builder" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-orbitron text-amber-400 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Marketing Insights
        </h3>
        <Button
          size="sm"
          variant="outline"
          className="border-amber-700 text-amber-400 hover:bg-amber-900/30"
          onClick={exportReport}
          data-testid="button-export-insights"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {insights.map(insight => {
          const Icon = insight.icon;
          return (
            <Card key={insight.title} className="bg-stone-950/80 border-stone-800" data-testid={`insight-${insight.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-amber-500" />
                  {insight.severity === 'good' && <CheckCircle2 className="w-3 h-3 text-teal-500" />}
                  {insight.severity === 'warn' && <AlertTriangle className="w-3 h-3 text-red-400" />}
                </div>
                <div className="text-2xl font-bold text-amber-400">{insight.value}</div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wider mt-1">{insight.title}</div>
                <div className="text-[10px] text-stone-600 mt-0.5">{insight.description}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function BehaviorAnalysis() {
  const [trends, setTrends] = useState<BehaviorTrends | null>(null);
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [personaFilter, setPersonaFilter] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [trendsRes, eventsRes] = await Promise.all([
        fetch(`/api/behavior/trends?days=${selectedDays}`).then(r => r.json()),
        fetch('/api/behavior/events?limit=500').then(r => r.json())
      ]);
      setTrends(trendsRes);
      const evts = Array.isArray(eventsRes) ? eventsRes : [];
      setEvents(evts);
      setJourneys(buildJourneys(evts));
    } catch (error) {
      console.error('Failed to load behavior data:', error);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [selectedDays]);

  const filteredJourneys = personaFilter === 'all'
    ? journeys
    : journeys.filter(j => j.persona === personaFilter);

  return (
    <div className="fixed inset-0 bg-stone-950 overflow-hidden flex flex-col">
      <div className="shrink-0 px-4 md:px-8 pt-4 md:pt-6 pb-3 border-b border-stone-800 bg-stone-950/95">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-orbitron text-amber-400 flex items-center gap-2">
                <Eye className="w-5 h-5" /> Behavior Analysis
              </h1>
              <p className="text-[10px] md:text-xs text-stone-500 mt-1 uppercase tracking-widest">Customer Journeys · User Profiles · Marketing Analytics</p>
            </div>
            <div className="flex items-center gap-2">
              {[7, 14, 30].map(days => (
                <Button
                  key={days}
                  variant={selectedDays === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDays(days)}
                  className={selectedDays === days ? "bg-amber-800 text-white" : "border-amber-900/50 text-amber-400"}
                  data-testid={`button-days-${days}`}
                >
                  {days}d
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="border-stone-700 text-stone-400"
                onClick={loadData}
                disabled={loading}
                data-testid="button-refresh"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-8">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading behavioral data...
            </div>
          ) : (
            <Tabs defaultValue="journeys" className="space-y-6">
              <TabsList className="bg-transparent border-0 gap-4 h-10 p-0">
                <TabsTrigger value="journeys" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-400 rounded-none px-0 font-orbitron text-[10px] tracking-widest uppercase" data-testid="tab-journeys">
                  <Map className="w-4 h-4 mr-2" /> Journeys
                </TabsTrigger>
                <TabsTrigger value="profiles" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-400 rounded-none px-0 font-orbitron text-[10px] tracking-widest uppercase" data-testid="tab-profiles">
                  <Users className="w-4 h-4 mr-2" /> Profiles
                </TabsTrigger>
                <TabsTrigger value="marketing" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-400 rounded-none px-0 font-orbitron text-[10px] tracking-widest uppercase" data-testid="tab-marketing">
                  <TrendingUp className="w-4 h-4 mr-2" /> Marketing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="journeys" className="mt-0 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-stone-500" />
                    <Select value={personaFilter} onValueChange={setPersonaFilter}>
                      <SelectTrigger className="w-40 h-8 bg-stone-900 border-stone-800 text-stone-300 text-xs" data-testid="select-persona-filter">
                        <SelectValue placeholder="All personas" />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-stone-700">
                        <SelectItem value="all">All Personas</SelectItem>
                        {Object.entries(PERSONA_STYLES).map(([key, style]) => (
                          <SelectItem key={key} value={key}>{style.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Badge variant="outline" className="border-stone-700 text-stone-400 text-[10px]">
                    {filteredJourneys.length} journeys
                  </Badge>
                </div>

                {filteredJourneys.length === 0 ? (
                  <Card className="bg-stone-950/80 border-stone-800">
                    <CardContent className="py-12 text-center">
                      <Map className="w-8 h-8 text-stone-700 mx-auto mb-2" />
                      <p className="text-stone-500 text-sm">No customer journeys recorded yet</p>
                      <p className="text-stone-600 text-xs mt-1">Journeys are built from user behavior events</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredJourneys.slice(0, 20).map(journey => (
                      <JourneyTimeline key={journey.sessionToken} journey={journey} />
                    ))}
                    {filteredJourneys.length > 20 && (
                      <p className="text-center text-stone-600 text-xs">Showing top 20 of {filteredJourneys.length} journeys</p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="profiles" className="mt-0 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <PersonaBreakdown journeys={journeys} />
                  <EngagementFunnel journeys={journeys} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <CategoryHeatmap trends={trends} />
                  <ActionTimeline trends={trends} />
                </div>
              </TabsContent>

              <TabsContent value="marketing" className="mt-0 space-y-6">
                <MarketingInsights journeys={journeys} trends={trends} />

                {trends?.flaggedSessions?.length ? (
                  <Card className="bg-stone-950/80 border-red-900/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-red-400 text-sm font-orbitron flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Flagged Sessions
                      </CardTitle>
                      <CardDescription className="text-stone-500 text-xs">Sessions that triggered behavioral flags</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {trends.flaggedSessions.map((session: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-red-950/20 p-2 rounded border border-red-900/40">
                            <div className="flex items-center gap-2">
                              <code className="text-[10px] text-red-300 font-mono">{session.sessionToken?.substring(0, 12)}...</code>
                              <Badge className="bg-red-900/30 text-red-400 text-[9px]">{session.reason}</Badge>
                            </div>
                            <span className="text-[10px] text-stone-500">{new Date(session.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
