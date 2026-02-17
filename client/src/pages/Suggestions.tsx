import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Bug, Lightbulb, Zap, AlertTriangle, ThumbsUp, 
  Clock, CheckCircle, XCircle, ArrowUpCircle, Search,
  Plus, Sparkles, MessageSquare
} from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  bug: { icon: Bug, color: "text-red-400 bg-red-900/30 border-red-800/50", label: "Bug" },
  feature: { icon: Zap, color: "text-cyan-400 bg-cyan-900/30 border-cyan-800/50", label: "Feature" },
  idea: { icon: Lightbulb, color: "text-amber-400 bg-amber-900/30 border-amber-800/50", label: "Idea" },
  pain_point: { icon: AlertTriangle, color: "text-orange-400 bg-orange-900/30 border-orange-800/50", label: "Pain Point" },
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  open: { icon: Clock, color: "text-stone-400", label: "Open" },
  in_progress: { icon: ArrowUpCircle, color: "text-amber-400", label: "In Progress" },
  resolved: { icon: CheckCircle, color: "text-green-400", label: "Resolved" },
  shipped: { icon: CheckCircle, color: "text-cyan-400", label: "Shipped" },
  dismissed: { icon: XCircle, color: "text-stone-600", label: "Dismissed" },
};

export default function SuggestionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("idea");

  const { data: items = [], isLoading } = useQuery<FeedbackItem[]>({
    queryKey: ["/api/feedback"],
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
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Creation failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      setIsAdding(false);
      setNewTitle("");
      setNewDesc("");
      toast({ title: "Success", description: "Suggestion submitted. Thank you!" });
    },
  });

  const filtered = items.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => b.votes - a.votes);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/30 pb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-500 mb-1 font-orbitron tracking-tighter">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">AGENTIC SUGGESTIONS</span>
            </div>
            <h1 className="text-4xl font-bold molten-text">Platform Improvements</h1>
            <p className="text-stone-400 mt-2 text-sm max-w-2xl">
              Help shape the future of Atropos. Submit bugs, request features, or propose new investigation mechanics. 
              Our agents monitor this board to prioritize platform updates.
            </p>
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-500 text-black font-bold">
                <Plus className="w-4 h-4 mr-2" /> New Suggestion
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-stone-900 border-stone-800 text-stone-200">
              <DialogHeader>
                <DialogTitle className="text-amber-500 font-orbitron">Submit Suggestion</DialogTitle>
                <DialogDescription className="text-stone-400">
                  What would make Atropos better for you?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs text-stone-500 uppercase">Type</label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger className="bg-stone-950 border-stone-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-stone-800">
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="pain_point">Pain Point</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-stone-500 uppercase">Title</label>
                  <Input 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Brief summary of the improvement"
                    className="bg-stone-950 border-stone-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-stone-500 uppercase">Description</label>
                  <Textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide details, use cases, or steps to reproduce if a bug..."
                    className="bg-stone-950 border-stone-800 min-h-[120px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  disabled={!newTitle || !newDesc || createMutation.isPending}
                  onClick={() => createMutation.mutate({
                    title: newTitle,
                    description: newDesc,
                    type: newType,
                    source: "user-portal",
                    priority: "medium",
                    status: "open",
                    tags: ["community"]
                  })}
                  className="bg-amber-600 hover:bg-amber-500 text-black w-full"
                >
                  Submit Suggestion
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <div className="flex items-center gap-4 bg-stone-900/50 p-4 rounded-lg border border-stone-800/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search existing suggestions..."
              className="pl-10 bg-stone-950 border-stone-800"
            />
          </div>
          <div className="text-sm text-stone-500 whitespace-nowrap hidden md:block">
            {filtered.length} items found
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-350px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-stone-500">
              <div className="animate-pulse">Analyzing improvement requests...</div>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map(item => {
                const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.idea;
                const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
                const TypeIcon = typeCfg.icon;
                const StatusIcon = statusCfg.icon;

                return (
                  <Card key={item.id} className="bg-stone-900/20 border-stone-800/50 hover:border-amber-900/30 transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 mt-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-12 w-12 flex-col gap-1 border border-stone-800 hover:border-amber-500/50 hover:bg-amber-500/10 ${item.votes > 0 ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 'text-stone-500'}`}
                            onClick={() => voteMutation.mutate(item.id)}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-xs font-bold font-orbitron tracking-tighter">{item.votes}</span>
                          </Button>
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`uppercase text-[9px] font-orbitron tracking-widest ${typeCfg.color}`}>
                              <TypeIcon className="w-2.5 h-2.5 mr-1" />
                              {typeCfg.label}
                            </Badge>
                            <h3 className="text-lg font-semibold text-stone-200 truncate">{item.title}</h3>
                            <div className={`ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-stone-800 text-[10px] font-medium uppercase tracking-tight ${statusCfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusCfg.label}
                            </div>
                          </div>
                          <p className="text-sm text-stone-400 leading-relaxed whitespace-pre-wrap">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] text-stone-600 pt-2 border-t border-stone-800/30">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              Git-Style Tracking ID: #{item.id}
                            </span>
                            {item.resolution && (
                              <span className="text-teal-500 font-bold italic">
                                Resolution: {item.resolution}
                              </span>
                            )}
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
    </div>
  );
}
