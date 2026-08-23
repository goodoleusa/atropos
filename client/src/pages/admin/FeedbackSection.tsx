import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bug, Lightbulb, Zap, AlertTriangle, ThumbsUp, Trash2, Clock, CheckCircle, XCircle, ArrowUpCircle, Filter } from "lucide-react";

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

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  bug: { icon: Bug, color: "text-red-700 bg-red-900/30 border-red-800/50", label: "Bug" },
  feature: { icon: Zap, color: "text-cyan-400 bg-cyan-900/30 border-cyan-800/50", label: "Feature" },
  idea: { icon: Lightbulb, color: "text-amber-800 bg-amber-900/30 border-amber-800/50", label: "Idea" },
  pain_point: { icon: AlertTriangle, color: "text-orange-800 bg-orange-900/30 border-orange-800/50", label: "Pain Point" },
};

const STATUS_CONFIG: Record<string, { icon: any; color: string }> = {
  open: { icon: Clock, color: "text-muted-foreground" },
  in_progress: { icon: ArrowUpCircle, color: "text-amber-800" },
  resolved: { icon: CheckCircle, color: "text-green-400" },
  shipped: { icon: CheckCircle, color: "text-cyan-400" },
  dismissed: { icon: XCircle, color: "text-muted-foreground" },
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-600 text-white",
  medium: "bg-amber-700 text-white",
  low: "bg-border text-foreground",
};

export function FeedbackSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: items = [], isLoading } = useQuery<FeedbackItem[]>({
    queryKey: ["/api/feedback"],
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery<FeedbackStats>({
    queryKey: ["/api/feedback/stats"],
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Record<string, string> }) => {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/stats"] });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/feedback/${id}/vote`, { method: "POST" });
      if (!res.ok) throw new Error("Vote failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/stats"] });
      toast({ title: "Deleted", description: "Feedback item removed" });
    },
  });

  const filtered = items.filter(item => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterPriority !== "all" && item.priority !== filterPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.source.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4" data-testid="feedback-section">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats && Object.entries(stats.byType).map(([type, count]) => {
          const cfg = TYPE_CONFIG[type];
          if (!cfg) return null;
          const Icon = cfg.icon;
          return (
            <Card key={type} className={`border ${cfg.color} cursor-pointer`} onClick={() => setFilterType(type === filterType ? "all" : type)} data-testid={`stat-${type}`}>
              <CardContent className="p-3 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <div>
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs opacity-70">{cfg.label}s</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search feedback..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-48 h-8 text-xs bg-card/50 border-border"
          data-testid="feedback-search"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 h-8 text-xs bg-card/50 border-border" data-testid="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32 h-8 text-xs bg-card/50 border-border" data-testid="filter-priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs text-muted-foreground">{filtered.length} / {items.length} items</Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-320px)]">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading feedback...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No feedback yet. Agents will auto-report issues as they interact with users.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => {
              const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.idea;
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
              const TypeIcon = typeCfg.icon;
              const StatusIcon = statusCfg.icon;
              return (
                <Card key={item.id} className="border border-border/50 bg-card/30 hover:bg-card/50 transition-colors" data-testid={`feedback-item-${item.id}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded border ${typeCfg.color}`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                          <Badge className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">{item.source}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <div className={`flex items-center gap-1 text-xs ${statusCfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{item.status.replace("_", " ")}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                          {item.tags.length > 0 && item.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 text-muted-foreground">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-center shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-amber-400" onClick={() => voteMutation.mutate(item.id)} data-testid={`vote-${item.id}`}>
                          <ThumbsUp className="w-3 h-3 mr-1" />{item.votes}
                        </Button>
                        <Select value={item.status} onValueChange={(val) => updateMutation.mutate({ id: item.id, updates: { status: val } })}>
                          <SelectTrigger className="h-6 w-24 text-[10px] bg-transparent border-border" data-testid={`status-select-${item.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="dismissed">Dismissed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="h-6 px-1 text-muted-foreground hover:text-red-400" onClick={() => deleteMutation.mutate(item.id)} data-testid={`delete-${item.id}`}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
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
  );
}
