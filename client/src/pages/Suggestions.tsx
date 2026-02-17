import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Bug, Lightbulb, Zap, AlertTriangle, ThumbsUp,
  Clock, CheckCircle, XCircle, ArrowUpCircle, Search,
  Sparkles, Bot, Activity, BarChart3, TrendingUp,
  Filter, Eye, Code, FileCode, Settings, Puzzle, Wrench,
  Copy, Terminal, FileJson, GitBranch, Download,
  RefreshCw, ExternalLink, Clipboard, FileText
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid
} from "recharts";

interface FeedbackItem {
  id: number;
  type: string;
  source: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  context: string | null;
  tags: string[];
  votes: number;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Recommendation {
  id: number;
  category: string;
  source: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  targetFiles: string[];
  codeSnippet: string | null;
  codeLanguage: string | null;
  painPointsAddressed: string[];
  estimatedImpact: string | null;
  tags: string[];
  votes: number;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  bySource: Record<string, number>;
  topVoted: FeedbackItem[];
}

interface RecStats {
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  topVoted: Recommendation[];
  painPointsCovered: string[];
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string; chartColor: string }> = {
  bug: { icon: Bug, color: "text-red-400 bg-red-900/30 border-red-800/50", label: "Bug", chartColor: "#f87171" },
  feature: { icon: Zap, color: "text-cyan-400 bg-cyan-900/30 border-cyan-800/50", label: "Feature", chartColor: "#22d3ee" },
  idea: { icon: Lightbulb, color: "text-amber-400 bg-amber-900/30 border-amber-800/50", label: "Idea", chartColor: "#fbbf24" },
  pain_point: { icon: AlertTriangle, color: "text-orange-400 bg-orange-900/30 border-orange-800/50", label: "Pain Point", chartColor: "#fb923c" },
};

const CAT_CONFIG: Record<string, { icon: any; color: string; label: string; chartColor: string }> = {
  code_snippet: { icon: Code, color: "text-cyan-400 bg-cyan-900/30 border-cyan-800/50", label: "Code Snippet", chartColor: "#22d3ee" },
  file_edit: { icon: FileCode, color: "text-purple-400 bg-purple-900/30 border-purple-800/50", label: "File Edit", chartColor: "#c084fc" },
  systemic: { icon: Settings, color: "text-amber-400 bg-amber-900/30 border-amber-800/50", label: "Systemic", chartColor: "#fbbf24" },
  integration: { icon: Puzzle, color: "text-teal-400 bg-teal-900/30 border-teal-800/50", label: "Integration", chartColor: "#2dd4bf" },
  new_tool: { icon: Wrench, color: "text-orange-400 bg-orange-900/30 border-orange-800/50", label: "New Tool", chartColor: "#fb923c" },
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string; chartColor: string }> = {
  open: { icon: Clock, color: "text-stone-400", label: "Open", chartColor: "#a8a29e" },
  proposed: { icon: Lightbulb, color: "text-amber-400", label: "Proposed", chartColor: "#fbbf24" },
  accepted: { icon: CheckCircle, color: "text-teal-400", label: "Accepted", chartColor: "#2dd4bf" },
  in_progress: { icon: ArrowUpCircle, color: "text-amber-400", label: "In Progress", chartColor: "#fbbf24" },
  implemented: { icon: CheckCircle, color: "text-green-400", label: "Implemented", chartColor: "#4ade80" },
  resolved: { icon: CheckCircle, color: "text-green-400", label: "Resolved", chartColor: "#4ade80" },
  shipped: { icon: CheckCircle, color: "text-cyan-400", label: "Shipped", chartColor: "#22d3ee" },
  rejected: { icon: XCircle, color: "text-stone-600", label: "Rejected", chartColor: "#57534e" },
  dismissed: { icon: XCircle, color: "text-stone-600", label: "Dismissed", chartColor: "#57534e" },
};

const PRIORITY_CONFIG: Record<string, { color: string; chartColor: string }> = {
  critical: { color: "bg-red-600 text-white", chartColor: "#dc2626" },
  high: { color: "bg-orange-600 text-white", chartColor: "#ea580c" },
  medium: { color: "bg-amber-700 text-white", chartColor: "#b45309" },
  low: { color: "bg-stone-700 text-stone-300", chartColor: "#78716c" },
};

const CustomTooltipStyle = {
  backgroundColor: '#1c1917',
  border: '1px solid #44403c',
  borderRadius: '8px',
  color: '#e7e5e4',
  fontSize: '12px',
  padding: '8px 12px',
};

function copyToClipboard(text: string, toast: any, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast({ title: `Copied ${label}`, description: "Ready to paste", duration: 2000 });
  }).catch(() => {
    toast({ title: "Copy failed", description: "Try selecting manually", variant: "destructive", duration: 2000 });
  });
}

function recToPrompt(rec: Recommendation): string {
  const parts = [
    `Implement the following change in this codebase:`,
    ``,
    `TITLE: ${rec.title}`,
    `CATEGORY: ${CAT_CONFIG[rec.category]?.label || rec.category}`,
    `PRIORITY: ${rec.priority}`,
    ``,
    `WHAT TO DO:`,
    rec.description,
  ];
  if (rec.targetFiles.length > 0) {
    parts.push(``, `FILES TO MODIFY:`);
    rec.targetFiles.forEach(f => parts.push(`  - ${f}`));
  }
  if (rec.painPointsAddressed.length > 0) {
    parts.push(``, `PAIN POINTS THIS FIXES:`);
    rec.painPointsAddressed.forEach(p => parts.push(`  - ${p}`));
  }
  if (rec.codeSnippet) {
    parts.push(``, `STARTER CODE (adapt to codebase patterns):`);
    parts.push("```" + (rec.codeLanguage || 'typescript'));
    parts.push(rec.codeSnippet);
    parts.push("```");
  }
  if (rec.estimatedImpact) {
    parts.push(``, `EXPECTED IMPACT: ${rec.estimatedImpact}`);
  }
  parts.push(``, `INSTRUCTIONS: Read target files first, understand existing patterns, then implement following project conventions (React + TypeScript + Tailwind + Drizzle ORM). Test your changes.`);
  return parts.join('\n');
}

function recToCurl(rec: Recommendation, baseUrl: string): string {
  return `curl -s "${baseUrl}/api/recommendations/export/${rec.id}?format=prompt"`;
}

function recToGitPatch(rec: Recommendation): string {
  if (!rec.codeSnippet || rec.targetFiles.length === 0) return "# No file targets or code snippet for this recommendation";
  const file = rec.targetFiles[0];
  const lines = [
    `# Agent Recommendation: ${rec.title}`,
    `# Category: ${CAT_CONFIG[rec.category]?.label || rec.category}`,
    `# Priority: ${rec.priority}`,
    `#`,
    `# Apply: Save this as a .patch file or use the code below`,
    `# Target: ${file}`,
    ``,
    `--- a/${file}`,
    `+++ b/${file}`,
    `@@ -0,0 +1,${rec.codeSnippet.split('\n').length} @@`,
    ...rec.codeSnippet.split('\n').map(l => `+${l}`),
  ];
  return lines.join('\n');
}

export default function SuggestionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("recommendations");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  const { data: feedbackItems = [], isLoading: feedbackLoading } = useQuery<FeedbackItem[]>({
    queryKey: ["/api/feedback"],
    refetchInterval: 30000,
  });
  const { data: feedbackStats } = useQuery<FeedbackStats>({
    queryKey: ["/api/feedback/stats"],
    refetchInterval: 30000,
  });
  const { data: recs = [], isLoading: recsLoading } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
    refetchInterval: 30000,
  });
  const { data: recStats } = useQuery<RecStats>({
    queryKey: ["/api/recommendations/stats"],
    refetchInterval: 30000,
  });

  const voteFeedback = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/feedback/${id}/vote`, { method: "POST" });
      if (!res.ok) throw new Error("Vote failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/stats"] });
    },
  });

  const voteRec = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/recommendations/${id}/vote`, { method: "POST" });
      if (!res.ok) throw new Error("Vote failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations/stats"] });
    },
  });

  const syncFiles = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/recommendations/sync', { method: 'POST' });
      if (!res.ok) throw new Error("Sync failed");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `Synced ${data.synced} recommendations`, description: data.files.join(', '), duration: 3000 });
    },
  });

  const filteredFeedback = useMemo(() => {
    return feedbackItems.filter(item => {
      if (filterType !== "all" && item.type !== filterType) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterPriority !== "all" && item.priority !== filterPriority) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => b.votes - a.votes);
  }, [feedbackItems, filterType, filterStatus, filterPriority, searchQuery]);

  const filteredRecs = useMemo(() => {
    return recs.filter(item => {
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterPriority !== "all" && item.priority !== filterPriority) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) ||
          item.painPointsAddressed.some(p => p.toLowerCase().includes(q));
      }
      return true;
    }).sort((a, b) => b.votes - a.votes);
  }, [recs, filterCategory, filterStatus, filterPriority, searchQuery]);

  const typeChartData = useMemo(() => {
    if (!feedbackStats) return [];
    return Object.entries(feedbackStats.byType).filter(([_, c]) => c > 0)
      .map(([type, count]) => ({ name: TYPE_CONFIG[type]?.label || type, value: count, fill: TYPE_CONFIG[type]?.chartColor || "#78716c" }));
  }, [feedbackStats]);

  const catChartData = useMemo(() => {
    if (!recStats) return [];
    return Object.entries(recStats.byCategory).filter(([_, c]) => c > 0)
      .map(([cat, count]) => ({ name: CAT_CONFIG[cat]?.label || cat, value: count, fill: CAT_CONFIG[cat]?.chartColor || "#78716c" }));
  }, [recStats]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-4 md:p-8" data-testid="suggestions-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="border-b border-amber-900/30 pb-4">
          <div className="flex items-center gap-2 text-amber-500 mb-1 font-orbitron tracking-tighter">
            <Bot className="w-5 h-5" />
            <span className="text-sm">AGENT INSIGHTS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold molten-text" data-testid="page-title">Platform Intelligence</h1>
          <p className="text-stone-400 mt-1 text-sm max-w-3xl">
            Automated recommendations from NEXUS agents. Actionable code suggestions, new tool ideas,
            and improvement reports — ready to copy, export, or pipe into any coding agent.
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="bg-stone-900/50 border border-stone-800/50">
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400" data-testid="tab-recommendations">
                <Code className="w-4 h-4 mr-2" />
                Recommendations ({recStats?.total || 0})
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400" data-testid="tab-reports">
                <Activity className="w-4 h-4 mr-2" />
                Reports ({feedbackStats?.total || 0})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-stone-700 text-stone-400 hover:text-amber-400 hover:border-amber-700"
                onClick={() => syncFiles.mutate()}
                disabled={syncFiles.isPending}
                data-testid="btn-sync-files"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${syncFiles.isPending ? 'animate-spin' : ''}`} />
                Sync to .github
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-stone-700 text-stone-400 hover:text-cyan-400 hover:border-cyan-700"
                onClick={() => window.open(`${baseUrl}/api/recommendations/export?format=json`, '_blank')}
                data-testid="btn-export-json"
              >
                <FileJson className="w-3 h-3 mr-1" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-stone-700 text-stone-400 hover:text-purple-400 hover:border-purple-700"
                onClick={() => window.open(`${baseUrl}/api/recommendations/export?format=markdown`, '_blank')}
                data-testid="btn-export-md"
              >
                <FileText className="w-3 h-3 mr-1" />
                Export MD
              </Button>
            </div>
          </div>

          {/* RECOMMENDATIONS TAB */}
          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="bg-stone-900/40 border-stone-800/50" data-testid="rec-stat-total">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-amber-900/30 rounded-lg"><Code className="w-5 h-5 text-amber-400" /></div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400 font-orbitron">{recStats?.total || 0}</div>
                    <div className="text-[10px] text-stone-500 uppercase">Recommendations</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/40 border-stone-800/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-orange-900/30 rounded-lg"><Wrench className="w-5 h-5 text-orange-400" /></div>
                  <div>
                    <div className="text-2xl font-bold text-orange-400 font-orbitron">{recStats?.byCategory?.new_tool || 0}</div>
                    <div className="text-[10px] text-stone-500 uppercase">New Tools</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/40 border-stone-800/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-teal-900/30 rounded-lg"><Puzzle className="w-5 h-5 text-teal-400" /></div>
                  <div>
                    <div className="text-2xl font-bold text-teal-400 font-orbitron">{recStats?.painPointsCovered?.length || 0}</div>
                    <div className="text-[10px] text-stone-500 uppercase">Pain Points</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/40 border-stone-800/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-green-900/30 rounded-lg"><CheckCircle className="w-5 h-5 text-green-400" /></div>
                  <div>
                    <div className="text-2xl font-bold text-green-400 font-orbitron">{recStats?.byStatus?.implemented || 0}</div>
                    <div className="text-[10px] text-stone-500 uppercase">Implemented</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/40 border-stone-800/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-cyan-900/30 rounded-lg"><FileCode className="w-5 h-5 text-cyan-400" /></div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-400 font-orbitron">{recs.filter(r => r.codeSnippet).length}</div>
                    <div className="text-[10px] text-stone-500 uppercase">With Code</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {catChartData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-stone-900/30 border-stone-800/50">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-xs text-stone-500 uppercase font-orbitron tracking-widest flex items-center gap-2">
                      <BarChart3 className="w-3 h-3" /> By Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 pb-2" data-testid="rec-chart-category">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={catChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value" stroke="none">
                          {catChartData.map((entry, idx) => (<Cell key={idx} fill={entry.fill} />))}
                        </Pie>
                        <Tooltip contentStyle={CustomTooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: '10px', color: '#a8a29e' }} iconSize={8} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {recStats?.painPointsCovered && recStats.painPointsCovered.length > 0 && (
                  <Card className="bg-stone-900/30 border-stone-800/50">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <CardTitle className="text-xs text-stone-500 uppercase font-orbitron tracking-widest flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> Pain Points Addressed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3" data-testid="rec-pain-points">
                      <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-auto">
                        {recStats.painPointsCovered.map((p, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] text-orange-400 border-orange-800/50 bg-orange-900/10">{p}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 bg-stone-900/30 p-3 rounded-lg border border-stone-800/50">
              <Filter className="w-4 h-4 text-stone-500" />
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recommendations..." className="pl-8 h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-search-recs" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32 h-8 text-xs bg-stone-950 border-stone-800" data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-800">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="code_snippet">Code Snippet</SelectItem>
                  <SelectItem value="file_edit">File Edit</SelectItem>
                  <SelectItem value="systemic">Systemic</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="new_tool">New Tool</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-28 h-8 text-xs bg-stone-950 border-stone-800" data-testid="select-rec-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-800">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-[10px] text-stone-500 border-stone-700">
                {filteredRecs.length} / {recs.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ScrollArea className="h-[calc(100vh-700px)] min-h-[350px]">
                  {recsLoading ? (
                    <div className="flex items-center justify-center h-48 text-stone-500">
                      <div className="animate-pulse">Scanning agent recommendations...</div>
                    </div>
                  ) : filteredRecs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-stone-500">
                      <Code className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-sm">No recommendations yet.</p>
                      <p className="text-xs text-stone-600 mt-1">Agents auto-generate actionable suggestions during conversations.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredRecs.map(rec => {
                        const catCfg = CAT_CONFIG[rec.category] || CAT_CONFIG.code_snippet;
                        const CatIcon = catCfg.icon;
                        return (
                          <Card key={rec.id}
                            className={`bg-stone-900/20 border-stone-800/50 hover:border-amber-900/30 transition-all cursor-pointer ${selectedRec?.id === rec.id ? 'border-amber-600/50 bg-stone-900/40' : ''}`}
                            onClick={() => setSelectedRec(rec)} data-testid={`rec-item-${rec.id}`}>
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <Button variant="ghost" size="sm"
                                  className={`h-10 w-10 flex-col gap-0.5 border border-stone-800 hover:border-amber-500/50 hover:bg-amber-500/10 shrink-0 ${rec.votes > 1 ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 'text-stone-500'}`}
                                  onClick={(e) => { e.stopPropagation(); voteRec.mutate(rec.id); }}
                                  data-testid={`vote-rec-${rec.id}`}>
                                  <ThumbsUp className="w-3 h-3" />
                                  <span className="text-[10px] font-bold font-orbitron">{rec.votes}</span>
                                </Button>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={`text-[9px] px-1.5 py-0 uppercase font-orbitron tracking-widest ${catCfg.color}`}>
                                      <CatIcon className="w-2.5 h-2.5 mr-1" />{catCfg.label}
                                    </Badge>
                                    <Badge className={`text-[9px] px-1.5 py-0 ${PRIORITY_CONFIG[rec.priority]?.color || ''}`}>{rec.priority}</Badge>
                                    {rec.codeSnippet && <Badge className="text-[9px] px-1.5 py-0 bg-cyan-900/20 text-cyan-500 border-cyan-800/50"><Code className="w-2.5 h-2.5 mr-0.5" />code</Badge>}
                                    {rec.painPointsAddressed.length >= 3 && <Badge className="text-[9px] px-1.5 py-0 bg-orange-900/20 text-orange-400 border-orange-800/50">{rec.painPointsAddressed.length} fixes</Badge>}
                                  </div>
                                  <h3 className="text-sm font-medium text-stone-200 truncate">{rec.title}</h3>
                                  <p className="text-xs text-stone-500 line-clamp-1">{rec.description}</p>
                                  <div className="flex items-center gap-3 text-[10px] text-stone-600">
                                    {rec.targetFiles.length > 0 && <span className="text-cyan-600">{rec.targetFiles.length} files</span>}
                                    <span>{rec.source}</span>
                                    <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Detail panel */}
              <div className="space-y-3">
                {selectedRec ? (
                  <Card className="bg-stone-900/40 border-amber-900/30 sticky top-4" data-testid="rec-detail-panel">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs text-amber-500 uppercase font-orbitron tracking-widest">Rec #{selectedRec.id}</CardTitle>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-stone-500" onClick={() => setSelectedRec(null)}><XCircle className="w-3 h-3" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-[9px] uppercase font-orbitron ${CAT_CONFIG[selectedRec.category]?.color || ''}`}>{CAT_CONFIG[selectedRec.category]?.label || selectedRec.category}</Badge>
                        <Badge className={`text-[9px] ${PRIORITY_CONFIG[selectedRec.priority]?.color || ''}`}>{selectedRec.priority}</Badge>
                      </div>
                      <h3 className="text-base font-semibold text-stone-200">{selectedRec.title}</h3>
                      <p className="text-sm text-stone-400 leading-relaxed whitespace-pre-wrap">{selectedRec.description}</p>

                      {selectedRec.targetFiles.length > 0 && (
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Target Files</div>
                          <div className="space-y-0.5">
                            {selectedRec.targetFiles.map((f, i) => (
                              <div key={i} className="text-xs text-cyan-400 font-mono bg-stone-950 px-2 py-0.5 rounded">{f}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedRec.codeSnippet && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-[10px] text-stone-500 uppercase font-bold">Starter Code</div>
                            <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-cyan-500 hover:text-cyan-300"
                              onClick={() => copyToClipboard(selectedRec.codeSnippet!, toast, "code snippet")} data-testid="btn-copy-code">
                              <Copy className="w-2.5 h-2.5 mr-1" />Copy
                            </Button>
                          </div>
                          <pre className="bg-stone-950 p-3 rounded border border-stone-800 text-xs text-stone-300 font-mono whitespace-pre-wrap overflow-auto max-h-[200px]">
                            <code>{selectedRec.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      {selectedRec.painPointsAddressed.length > 0 && (
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Pain Points Addressed</div>
                          <div className="space-y-1">
                            {selectedRec.painPointsAddressed.map((p, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-xs text-orange-300">
                                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-orange-500" />{p}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedRec.estimatedImpact && (
                        <div className="bg-teal-950/20 p-2 rounded border border-teal-800/20">
                          <div className="text-[10px] text-teal-500 uppercase font-bold mb-1">Impact</div>
                          <p className="text-xs text-teal-300">{selectedRec.estimatedImpact}</p>
                        </div>
                      )}

                      <div className="border-t border-stone-800/50 pt-3">
                        <div className="text-[10px] text-stone-500 uppercase font-bold mb-2">Push / Export</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Button variant="outline" size="sm" className="h-7 text-[10px] border-stone-700 text-amber-400 hover:bg-amber-900/20"
                            onClick={() => copyToClipboard(recToPrompt(selectedRec), toast, "AI prompt")} data-testid="btn-copy-prompt">
                            <Clipboard className="w-3 h-3 mr-1" />AI Prompt
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-[10px] border-stone-700 text-cyan-400 hover:bg-cyan-900/20"
                            onClick={() => copyToClipboard(selectedRec.codeSnippet || '// No code', toast, "code")} data-testid="btn-copy-code-only">
                            <Code className="w-3 h-3 mr-1" />Code Only
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-[10px] border-stone-700 text-purple-400 hover:bg-purple-900/20"
                            onClick={() => copyToClipboard(recToGitPatch(selectedRec), toast, "git patch")} data-testid="btn-copy-patch">
                            <GitBranch className="w-3 h-3 mr-1" />Git Patch
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-[10px] border-stone-700 text-teal-400 hover:bg-teal-900/20"
                            onClick={() => copyToClipboard(recToCurl(selectedRec, baseUrl), toast, "curl command")} data-testid="btn-copy-curl">
                            <Terminal className="w-3 h-3 mr-1" />curl
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-[10px] border-stone-700 text-stone-400 hover:bg-stone-800/50 col-span-2"
                            onClick={() => copyToClipboard(JSON.stringify(selectedRec, null, 2), toast, "JSON")} data-testid="btn-copy-json">
                            <FileJson className="w-3 h-3 mr-1" />Copy Full JSON
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-stone-900/30 border-stone-800/50">
                    <CardContent className="p-6 text-center">
                      <Eye className="w-8 h-8 mx-auto mb-3 text-stone-700" />
                      <p className="text-xs text-stone-500">Select a recommendation to view details and export options</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-stone-900/30 border-stone-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-4 h-4 text-amber-500" />
                      <span className="text-xs text-stone-400 font-bold uppercase">Bulk Export</span>
                    </div>
                    <div className="space-y-1.5">
                      <Button variant="outline" size="sm" className="w-full h-7 text-[10px] border-stone-700 text-stone-300 justify-start hover:border-amber-700"
                        onClick={() => syncFiles.mutate()} disabled={syncFiles.isPending} data-testid="btn-sync-github">
                        <GitBranch className="w-3 h-3 mr-2 text-amber-500" />
                        Sync to .github/RECOMMENDATIONS.md
                      </Button>
                      <Button variant="outline" size="sm" className="w-full h-7 text-[10px] border-stone-700 text-stone-300 justify-start hover:border-cyan-700"
                        onClick={() => window.open(`${baseUrl}/api/recommendations/export?format=prompt`, '_blank')} data-testid="btn-export-all-prompts">
                        <Clipboard className="w-3 h-3 mr-2 text-cyan-500" />
                        Export All as Agent Prompts
                      </Button>
                      <Button variant="outline" size="sm" className="w-full h-7 text-[10px] border-stone-700 text-stone-300 justify-start hover:border-purple-700"
                        onClick={() => copyToClipboard(`curl -s "${baseUrl}/api/recommendations/export?format=json" | jq .`, toast, "bulk curl")} data-testid="btn-bulk-curl">
                        <Terminal className="w-3 h-3 mr-2 text-purple-500" />
                        Copy Bulk curl Command
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-stone-900/30 border-stone-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-xs text-stone-400 font-bold uppercase">How it works</span>
                    </div>
                    <div className="space-y-2 text-[11px] text-stone-500">
                      <p>NEXUS agents generate actionable code recommendations during conversations using <code className="text-amber-500/80 bg-stone-800 px-1 rounded">```recommendation</code> blocks.</p>
                      <p>Each recommendation includes starter code, target files, pain points addressed, and impact estimates.</p>
                      <p>Use the export buttons to pipe recommendations into Replit Agent, Cursor, Copilot, or any coding tool.</p>
                      <p>Hit <strong className="text-amber-400">Sync to .github</strong> to write all recommendations as a markdown file any agent can discover in your repo.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* REPORTS TAB */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-stone-900/40 border-stone-800/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-amber-900/30 rounded-lg"><Activity className="w-5 h-5 text-amber-400" /></div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400 font-orbitron">{feedbackStats?.total || 0}</div>
                    <div className="text-[10px] text-stone-500 uppercase">Reports</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/40 border-stone-800/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-teal-900/30 rounded-lg"><Bot className="w-5 h-5 text-teal-400" /></div>
                  <div>
                    <div className="text-2xl font-bold text-teal-400 font-orbitron">{feedbackItems.filter(i => i.source.startsWith("agent:")).length}</div>
                    <div className="text-[10px] text-stone-500 uppercase">Agent-Found</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/40 border-stone-800/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-red-900/30 rounded-lg"><Bug className="w-5 h-5 text-red-400" /></div>
                  <div>
                    <div className="text-2xl font-bold text-red-400 font-orbitron">{feedbackStats?.byType?.bug || 0}</div>
                    <div className="text-[10px] text-stone-500 uppercase">Bugs</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/40 border-stone-800/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 bg-red-900/30 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
                  <div>
                    <div className="text-2xl font-bold text-red-400 font-orbitron">{feedbackStats?.byPriority?.critical || 0}</div>
                    <div className="text-[10px] text-stone-500 uppercase">Critical</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {typeChartData.length > 0 && (
              <Card className="bg-stone-900/30 border-stone-800/50">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs text-stone-500 uppercase font-orbitron tracking-widest flex items-center gap-2">
                    <BarChart3 className="w-3 h-3" /> Reports by Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={typeChartData} margin={{ left: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#78716c' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
                      <Tooltip contentStyle={CustomTooltipStyle} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {typeChartData.map((entry, idx) => (<Cell key={idx} fill={entry.fill} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-wrap items-center gap-3 bg-stone-900/30 p-3 rounded-lg border border-stone-800/50">
              <Filter className="w-4 h-4 text-stone-500" />
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports..." className="pl-8 h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-search-reports" />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-28 h-8 text-xs bg-stone-950 border-stone-800" data-testid="select-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-800">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="pain_point">Pain Point</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-28 h-8 text-xs bg-stone-950 border-stone-800">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-800">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[calc(100vh-700px)] min-h-[300px]">
              {feedbackLoading ? (
                <div className="flex items-center justify-center h-48 text-stone-500"><div className="animate-pulse">Scanning agent telemetry...</div></div>
              ) : filteredFeedback.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-stone-500">
                  <Bot className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">No reports match your filters.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFeedback.map(item => {
                    const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.idea;
                    const TypeIcon = typeCfg.icon;
                    return (
                      <Card key={item.id} className={`bg-stone-900/20 border-stone-800/50 hover:border-amber-900/30 transition-all cursor-pointer ${selectedFeedback?.id === item.id ? 'border-amber-600/50 bg-stone-900/40' : ''}`}
                        onClick={() => setSelectedFeedback(item)} data-testid={`feedback-item-${item.id}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <Button variant="ghost" size="sm"
                              className={`h-10 w-10 flex-col gap-0.5 border border-stone-800 hover:border-amber-500/50 shrink-0 ${item.votes > 1 ? 'text-amber-500' : 'text-stone-500'}`}
                              onClick={(e) => { e.stopPropagation(); voteFeedback.mutate(item.id); }}
                              data-testid={`vote-${item.id}`}>
                              <ThumbsUp className="w-3 h-3" />
                              <span className="text-[10px] font-bold font-orbitron">{item.votes}</span>
                            </Button>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`text-[9px] px-1.5 py-0 uppercase font-orbitron tracking-widest ${typeCfg.color}`}>
                                  <TypeIcon className="w-2.5 h-2.5 mr-1" />{typeCfg.label}
                                </Badge>
                                <Badge className={`text-[9px] px-1.5 py-0 ${PRIORITY_CONFIG[item.priority]?.color || ''}`}>{item.priority}</Badge>
                              </div>
                              <h3 className="text-sm font-medium text-stone-200 truncate">{item.title}</h3>
                              <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                              <div className="flex items-center gap-3 text-[10px] text-stone-600">
                                <span>{item.source}</span>
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
