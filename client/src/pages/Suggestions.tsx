import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Bug, Lightbulb, Zap, AlertTriangle, ThumbsUp,
  Clock, CheckCircle, XCircle, ArrowUpCircle, Search,
  Sparkles, Bot, Activity, BarChart3, TrendingUp,
  Filter, Eye
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

interface FeedbackStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  bySource: Record<string, number>;
  topVoted: FeedbackItem[];
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string; chartColor: string }> = {
  bug: { icon: Bug, color: "text-red-400 bg-red-900/30 border-red-800/50", label: "Bug", chartColor: "#f87171" },
  feature: { icon: Zap, color: "text-cyan-400 bg-cyan-900/30 border-cyan-800/50", label: "Feature", chartColor: "#22d3ee" },
  idea: { icon: Lightbulb, color: "text-amber-400 bg-amber-900/30 border-amber-800/50", label: "Idea", chartColor: "#fbbf24" },
  pain_point: { icon: AlertTriangle, color: "text-orange-400 bg-orange-900/30 border-orange-800/50", label: "Pain Point", chartColor: "#fb923c" },
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string; chartColor: string }> = {
  open: { icon: Clock, color: "text-stone-400", label: "Open", chartColor: "#a8a29e" },
  in_progress: { icon: ArrowUpCircle, color: "text-amber-400", label: "In Progress", chartColor: "#fbbf24" },
  resolved: { icon: CheckCircle, color: "text-green-400", label: "Resolved", chartColor: "#4ade80" },
  shipped: { icon: CheckCircle, color: "text-cyan-400", label: "Shipped", chartColor: "#22d3ee" },
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

export default function SuggestionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  const { data: items = [], isLoading } = useQuery<FeedbackItem[]>({
    queryKey: ["/api/feedback"],
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery<FeedbackStats>({
    queryKey: ["/api/feedback/stats"],
    refetchInterval: 30000,
  });

  const voteMutation = useMutation({
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

  const typeChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byType)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        name: TYPE_CONFIG[type]?.label || type,
        value: count,
        fill: TYPE_CONFIG[type]?.chartColor || "#78716c",
      }));
  }, [stats]);

  const statusChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byStatus)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: STATUS_CONFIG[status]?.label || status,
        value: count,
        fill: STATUS_CONFIG[status]?.chartColor || "#78716c",
      }));
  }, [stats]);

  const priorityChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byPriority)
      .filter(([_, count]) => count > 0)
      .map(([priority, count]) => ({
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: count,
        fill: PRIORITY_CONFIG[priority]?.chartColor || "#78716c",
      }));
  }, [stats]);

  const sourceChartData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.bySource)
      .filter(([_, count]) => count > 0)
      .map(([source, count]) => ({
        name: source.startsWith("agent:") ? source.replace("agent:", "AI: ") : source,
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  const trendData = useMemo(() => {
    if (items.length === 0) return [];
    const dayMap = new Map<string, { bugs: number; features: number; ideas: number; pain_points: number }>();
    items.forEach(item => {
      const day = new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dayMap.has(day)) dayMap.set(day, { bugs: 0, features: 0, ideas: 0, pain_points: 0 });
      const entry = dayMap.get(day)!;
      if (item.type === "bug") entry.bugs++;
      else if (item.type === "feature") entry.features++;
      else if (item.type === "idea") entry.ideas++;
      else if (item.type === "pain_point") entry.pain_points++;
    });
    return Array.from(dayMap.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .reverse()
      .slice(-14);
  }, [items]);

  const agentCount = useMemo(() => {
    return items.filter(i => i.source.startsWith("agent:")).length;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (filterType !== "all" && item.type !== filterType) return false;
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterPriority !== "all" && item.priority !== filterPriority) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.source.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => b.votes - a.votes);
  }, [items, filterType, filterStatus, filterPriority, searchQuery]);

  const openRate = stats ? ((stats.byStatus.open || 0) / Math.max(stats.total, 1) * 100).toFixed(0) : "0";
  const resolvedRate = stats ? (((stats.byStatus.resolved || 0) + (stats.byStatus.shipped || 0)) / Math.max(stats.total, 1) * 100).toFixed(0) : "0";

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
            Automated recommendations from NEXUS agents. Every AI interaction scans for bugs, improvement ideas, 
            and pain points — surfaced here for platform evolution.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="bg-stone-900/40 border-stone-800/50" data-testid="stat-total">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-amber-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400 font-orbitron">{stats?.total || 0}</div>
                <div className="text-[10px] text-stone-500 uppercase">Total Reports</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900/40 border-stone-800/50" data-testid="stat-agent">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-teal-900/30 rounded-lg">
                <Bot className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-400 font-orbitron">{agentCount}</div>
                <div className="text-[10px] text-stone-500 uppercase">Agent-Generated</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900/40 border-stone-800/50" data-testid="stat-open">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-stone-800/50 rounded-lg">
                <Clock className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-300 font-orbitron">{openRate}%</div>
                <div className="text-[10px] text-stone-500 uppercase">Open Rate</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900/40 border-stone-800/50" data-testid="stat-resolved">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 font-orbitron">{resolvedRate}%</div>
                <div className="text-[10px] text-stone-500 uppercase">Resolved</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900/40 border-stone-800/50" data-testid="stat-critical">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400 font-orbitron">{stats?.byPriority?.critical || 0}</div>
                <div className="text-[10px] text-stone-500 uppercase">Critical</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-stone-900/30 border-stone-800/50">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs text-stone-500 uppercase font-orbitron tracking-widest flex items-center gap-2">
                <BarChart3 className="w-3 h-3" /> By Type
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2" data-testid="chart-type">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {typeChartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', color: '#a8a29e' }}
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/30 border-stone-800/50">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs text-stone-500 uppercase font-orbitron tracking-widest flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2" data-testid="chart-priority">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={priorityChartData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#78716c' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a8a29e' }} width={55} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {priorityChartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/30 border-stone-800/50">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs text-stone-500 uppercase font-orbitron tracking-widest flex items-center gap-2">
                <Bot className="w-3 h-3" /> By Source
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2" data-testid="chart-source">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={sourceChartData} margin={{ left: 10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#78716c' }} height={50} />
                  <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {trendData.length > 1 && (
          <Card className="bg-stone-900/30 border-stone-800/50">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs text-stone-500 uppercase font-orbitron tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3" /> Report Trend (Last 14 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2" data-testid="chart-trend">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={trendData} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#78716c' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#78716c' }} />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Area type="monotone" dataKey="bugs" stackId="1" stroke="#f87171" fill="#f8717133" name="Bugs" />
                  <Area type="monotone" dataKey="features" stackId="1" stroke="#22d3ee" fill="#22d3ee33" name="Features" />
                  <Area type="monotone" dataKey="ideas" stackId="1" stroke="#fbbf24" fill="#fbbf2433" name="Ideas" />
                  <Area type="monotone" dataKey="pain_points" stackId="1" stroke="#fb923c" fill="#fb923c33" name="Pain Points" />
                  <Legend wrapperStyle={{ fontSize: '10px', color: '#a8a29e' }} iconSize={8} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-3 bg-stone-900/30 p-3 rounded-lg border border-stone-800/50">
          <Filter className="w-4 h-4 text-stone-500" />
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="pl-8 h-8 text-xs bg-stone-950 border-stone-800"
              data-testid="input-search"
            />
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-28 h-8 text-xs bg-stone-950 border-stone-800" data-testid="select-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-stone-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-28 h-8 text-xs bg-stone-950 border-stone-800" data-testid="select-priority">
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
            {filtered.length} / {items.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ScrollArea className="h-[calc(100vh-900px)] min-h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-48 text-stone-500">
                  <div className="animate-pulse">Scanning agent telemetry...</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-stone-500">
                  <Bot className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">No reports match your filters.</p>
                  <p className="text-xs text-stone-600 mt-1">Agents auto-report issues during conversations.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(item => {
                    const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.idea;
                    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
                    const TypeIcon = typeCfg.icon;
                    const StatusIcon = statusCfg.icon;
                    const isAgent = item.source.startsWith("agent:");

                    return (
                      <Card
                        key={item.id}
                        className={`bg-stone-900/20 border-stone-800/50 hover:border-amber-900/30 transition-all cursor-pointer ${selectedItem?.id === item.id ? 'border-amber-600/50 bg-stone-900/40' : ''}`}
                        onClick={() => setSelectedItem(item)}
                        data-testid={`feedback-item-${item.id}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-10 w-10 flex-col gap-0.5 border border-stone-800 hover:border-amber-500/50 hover:bg-amber-500/10 shrink-0 ${item.votes > 1 ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 'text-stone-500'}`}
                              onClick={(e) => { e.stopPropagation(); voteMutation.mutate(item.id); }}
                              data-testid={`vote-${item.id}`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span className="text-[10px] font-bold font-orbitron">{item.votes}</span>
                            </Button>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`text-[9px] px-1.5 py-0 uppercase font-orbitron tracking-widest ${typeCfg.color}`}>
                                  <TypeIcon className="w-2.5 h-2.5 mr-1" />
                                  {typeCfg.label}
                                </Badge>
                                {isAgent && (
                                  <Badge className="text-[9px] px-1.5 py-0 bg-teal-900/30 text-teal-400 border-teal-800/50">
                                    <Bot className="w-2.5 h-2.5 mr-1" />
                                    Auto
                                  </Badge>
                                )}
                                <Badge className={`text-[9px] px-1.5 py-0 ${PRIORITY_CONFIG[item.priority]?.color || ''}`}>
                                  {item.priority}
                                </Badge>
                              </div>
                              <h3 className="text-sm font-medium text-stone-200 truncate">{item.title}</h3>
                              <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                              <div className="flex items-center gap-3 text-[10px] text-stone-600">
                                <div className={`flex items-center gap-1 ${statusCfg.color}`}>
                                  <StatusIcon className="w-2.5 h-2.5" />
                                  {statusCfg.label}
                                </div>
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
          </div>

          <div className="space-y-4">
            {selectedItem ? (
              <Card className="bg-stone-900/40 border-amber-900/30 sticky top-4" data-testid="detail-panel">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs text-amber-500 uppercase font-orbitron tracking-widest">
                      Report #{selectedItem.id}
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-stone-500" onClick={() => setSelectedItem(null)}>
                      <XCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-[9px] uppercase font-orbitron ${TYPE_CONFIG[selectedItem.type]?.color || ''}`}>
                      {TYPE_CONFIG[selectedItem.type]?.label || selectedItem.type}
                    </Badge>
                    <Badge className={`text-[9px] ${PRIORITY_CONFIG[selectedItem.priority]?.color || ''}`}>
                      {selectedItem.priority}
                    </Badge>
                    <div className={`flex items-center gap-1 text-[10px] ${STATUS_CONFIG[selectedItem.status]?.color || ''}`}>
                      {STATUS_CONFIG[selectedItem.status]?.label || selectedItem.status}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-stone-200">{selectedItem.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed whitespace-pre-wrap">{selectedItem.description}</p>

                  {selectedItem.context && (
                    <div className="bg-stone-950 p-2 rounded border border-stone-800 text-xs text-stone-500 font-mono whitespace-pre-wrap max-h-[120px] overflow-auto">
                      {selectedItem.context}
                    </div>
                  )}

                  {selectedItem.resolution && (
                    <div className="bg-teal-950/30 p-2 rounded border border-teal-800/30">
                      <div className="text-[10px] text-teal-500 uppercase font-bold mb-1">Resolution</div>
                      <p className="text-xs text-teal-300">{selectedItem.resolution}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] text-stone-600 border-stone-800">{tag}</Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-600 pt-2 border-t border-stone-800/50">
                    <div>
                      <span className="text-stone-500 block">Source</span>
                      <span className="text-stone-300">{selectedItem.source}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Votes</span>
                      <span className="text-amber-400 font-bold">{selectedItem.votes}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Created</span>
                      <span className="text-stone-300">{new Date(selectedItem.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Updated</span>
                      <span className="text-stone-300">{new Date(selectedItem.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-stone-900/30 border-stone-800/50">
                <CardContent className="p-6 text-center">
                  <Eye className="w-8 h-8 mx-auto mb-3 text-stone-700" />
                  <p className="text-xs text-stone-500">Select a report to view details</p>
                </CardContent>
              </Card>
            )}

            {stats?.topVoted && stats.topVoted.length > 0 && (
              <Card className="bg-stone-900/30 border-stone-800/50">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs text-stone-500 uppercase font-orbitron tracking-widest flex items-center gap-2">
                    <ThumbsUp className="w-3 h-3" /> Top Voted
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2" data-testid="top-voted">
                  {stats.topVoted.slice(0, 5).map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-stone-800/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedItem(item)}
                    >
                      <span className="text-amber-500 font-bold font-orbitron text-xs w-6 text-right">{item.votes}</span>
                      <span className="text-xs text-stone-300 truncate flex-1">{item.title}</span>
                      <Badge className={`text-[8px] px-1 py-0 ${TYPE_CONFIG[item.type]?.color || ''}`}>
                        {TYPE_CONFIG[item.type]?.label?.charAt(0) || '?'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="bg-stone-900/30 border-stone-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-stone-400 font-bold uppercase">How it works</span>
                </div>
                <div className="space-y-2 text-[11px] text-stone-500">
                  <p>NEXUS agents automatically detect and report platform improvements during conversations.</p>
                  <p>Every agent response is scanned for <code className="text-amber-500/80 bg-stone-800 px-1 rounded">[FEEDBACK:...]</code> tags.</p>
                  <p>Reports are deduplicated, rate-limited, and stored for review. Vote on items you care about.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
