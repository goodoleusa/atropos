import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Database, Zap, Clock, TrendingDown, BarChart3,
  RefreshCw, Loader2, Eye, Settings2, Activity,
  Users, Shield, Network, Lock, Bug,
  CheckCircle2, AlertTriangle, XCircle, Search,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MEMORY_TRIGGERS } from "@/config/agentPrompts";

interface MemoryStats {
  totalCompressions: number;
  autoCompressions: number;
  manualCompressions: number;
  handoffs: number;
  totalTokensSaved: number;
  avgCompressionRatio: number;
  avgLatencyMs: number;
  byTrigger: Record<string, number>;
  byModel: Record<string, { count: number; avgRatio: number; avgLatency: number }>;
  wandb: {
    totalCompressions: number;
    avgCompressionRatio: number;
    avgLatencyMs: number;
    totalTokensSaved: number;
    enabled: boolean;
  };
  recentCapsules: { id: number; type: string; createdBy: string; tokens: number; ratio: number; model: string; createdAt: string }[];
}

interface Capsule {
  id: number;
  sessionToken: string;
  investigationId: string | null;
  conversationId: number | null;
  capsuleType: string;
  content: string;
  metadata: {
    phase: string;
    findingsCount: number;
    toolsUsed: string[];
    tokensEstimate: number;
    createdBy: string;
    compressionRatio?: number;
    originalTokens?: number;
    compressedTokens?: number;
    model?: string;
    latencyMs?: number;
    messageCount?: number;
    triggerReason?: string;
  };
  createdAt: string;
}

interface QualityResult {
  capsuleId: number;
  capsuleType?: string;
  createdAt?: string;
  compressionRatio?: number;
  quality: {
    completeness: number;
    accuracy: number;
    actionability: number;
    density: number;
    overall: number;
    critical_loss?: string[];
    verdict: 'pass' | 'warn' | 'fail';
    notes?: string;
  };
  error?: string;
}

interface BatchQualityResult {
  results: QualityResult[];
  summary: { avgOverall: number; passRate: number; total: number };
}

const CREW_AGENTS = [
  { id: 'vuln_analyst', name: 'VulnAnalyst', role: 'Vulnerability Analysis', icon: Bug, color: 'text-red-700' },
  { id: 'osint_analyst', name: 'OSINTAnalyst', role: 'OSINT & Recon', icon: Eye, color: 'text-blue-400' },
  { id: 'threat_intel', name: 'ThreatIntel', role: 'Threat Intelligence', icon: Shield, color: 'text-purple-700' },
  { id: 'secret_hunter', name: 'SecretHunter', role: 'Credential Analysis', icon: Lock, color: 'text-amber-800' },
  { id: 'network_recon', name: 'NetworkRecon', role: 'Network Analysis', icon: Network, color: 'text-teal-800' },
  { id: 'synthesis', name: 'Synthesis', role: 'Executive Synthesis', icon: Brain, color: 'text-indigo-400' },
];

const TYPE_COLORS: Record<string, string> = {
  auto_compress: 'bg-cyan-900/30 text-cyan-400 border-cyan-800/40',
  checkpoint: 'bg-amber-900/30 text-amber-800 border-amber-800/40',
  handoff: 'bg-purple-900/30 text-purple-700 border-purple-800/40',
  milestone: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40',
};

const VERDICT_CONFIG = {
  pass: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-800/30', label: 'PASS' },
  warn: { icon: AlertTriangle, color: 'text-amber-800', bg: 'bg-amber-900/20 border-amber-800/30', label: 'WARN' },
  fail: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-900/20 border-red-800/30', label: 'FAIL' },
};

function ScoreBar({ label, score, max = 10 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">{score}/{max}</span>
      </div>
      <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ContextManagerPanel() {
  const queryClient = useQueryClient();
  const [expandedCapsule, setExpandedCapsule] = useState<number | null>(null);
  const [qualityResults, setQualityResults] = useState<Record<number, QualityResult>>({});
  const [checkingQuality, setCheckingQuality] = useState<number | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchQualityResult | null>(null);
  const [thresholds, setThresholds] = useState({
    messageCount: MEMORY_TRIGGERS.message_count,
    tokenEstimate: MEMORY_TRIGGERS.token_threshold,
    autoCompress: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexus_memory_thresholds');
      if (saved) setThresholds(JSON.parse(saved));
    } catch {}
  }, []);

  const { data: stats } = useQuery<MemoryStats>({
    queryKey: ['/api/chat/memory/stats'],
    refetchInterval: 15000,
  });

  const { data: capsules, isLoading: capsulesLoading } = useQuery<Capsule[]>({
    queryKey: ['/api/chat/memory/capsules'],
    refetchInterval: 30000,
  });

  const tokensSaved = stats?.totalTokensSaved || 0;
  const avgRatio = stats?.avgCompressionRatio || 0;
  const totalCompressions = stats?.totalCompressions || 0;
  const wandbEnabled = stats?.wandb?.enabled || false;

  const runQualityCheck = async (capsuleId: number) => {
    setCheckingQuality(capsuleId);
    try {
      const res = await fetch('/api/chat/memory/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capsuleId }),
      });
      if (!res.ok) throw new Error('Quality check failed');
      const data = await res.json();
      setQualityResults(prev => ({ ...prev, [capsuleId]: data }));
      const v = data.quality?.verdict || 'unknown';
      toast({ title: `Quality: ${v.toUpperCase()}`, description: `Overall score: ${data.quality?.overall || '?'}/10` });
    } catch {
      toast({ title: "Quality Check Failed", variant: "destructive" });
    } finally {
      setCheckingQuality(null);
    }
  };

  const runBatchQualityCheck = async () => {
    setBatchRunning(true);
    setBatchResult(null);
    try {
      const res = await fetch('/api/chat/memory/quality-check-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5 }),
      });
      if (!res.ok) throw new Error('Batch check failed');
      const data: BatchQualityResult = await res.json();
      setBatchResult(data);
      data.results.forEach(r => {
        if (r.quality && !r.error) {
          setQualityResults(prev => ({ ...prev, [r.capsuleId]: r }));
        }
      });
      toast({
        title: `Batch Quality Check Complete`,
        description: `${data.summary.total} capsules checked. Pass rate: ${data.summary.passRate}%. Avg score: ${data.summary.avgOverall}/10`,
      });
    } catch {
      toast({ title: "Batch Check Failed", variant: "destructive" });
    } finally {
      setBatchRunning(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="context-manager-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-amber-800" />
          <div>
            <h2 className="text-lg font-bold text-amber-800">NEXUS Context Manager</h2>
            <p className="text-xs text-muted-foreground">Auto memory compression, quality auditing & crew orchestration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {wandbEnabled && (
            <Badge className="bg-purple-900/30 text-purple-700 border-purple-800/40 text-[9px]">W&B Active</Badge>
          )}
          <Button
            size="sm" variant="outline"
            className="border-amber-900/50 text-amber-800 hover:bg-amber-900/20 text-xs"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/chat/memory/stats'] });
              queryClient.invalidateQueries({ queryKey: ['/api/chat/memory/capsules'] });
            }}
            data-testid="button-refresh-stats"
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardContent className="p-3" data-testid="stat-total-compressions">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] text-muted-foreground uppercase">Compressions</span>
            </div>
            <div className="text-xl font-bold text-amber-800">{totalCompressions}</div>
            <div className="text-[9px] text-muted-foreground">{stats?.autoCompressions || 0} auto / {stats?.manualCompressions || 0} manual</div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardContent className="p-3" data-testid="stat-tokens-saved">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-muted-foreground uppercase">Tokens Saved</span>
            </div>
            <div className="text-xl font-bold text-emerald-400">{tokensSaved.toLocaleString()}</div>
            <div className="text-[9px] text-muted-foreground">Avg savings: {avgRatio > 0 ? `${Math.round((1 - avgRatio) * 100)}%` : '—'}</div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardContent className="p-3" data-testid="stat-handoffs">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3.5 h-3.5 text-purple-700" />
              <span className="text-[10px] text-muted-foreground uppercase">Handoffs</span>
            </div>
            <div className="text-xl font-bold text-purple-700">{stats?.handoffs || 0}</div>
            <div className="text-[9px] text-muted-foreground">Seamless transitions</div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardContent className="p-3" data-testid="stat-avg-latency">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-800" />
              <span className="text-[10px] text-muted-foreground uppercase">Avg Latency</span>
            </div>
            <div className="text-xl font-bold text-amber-800">{stats?.avgLatencyMs ? `${(stats.avgLatencyMs / 1000).toFixed(1)}s` : '—'}</div>
            <div className="text-[9px] text-muted-foreground">Compression time</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="capsules" className="w-full">
        <TabsList className="bg-[hsl(var(--card))] border border-amber-900/30 w-full justify-start">
          <TabsTrigger value="capsules" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400">Capsules & Quality</TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400">Compression Metrics</TabsTrigger>
          <TabsTrigger value="config" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400">Settings</TabsTrigger>
          <TabsTrigger value="crew" className="text-xs data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400">Crew</TabsTrigger>
        </TabsList>

        <TabsContent value="capsules" className="space-y-4 mt-4">
          <Card className="bg-[hsl(var(--card))] border-amber-900/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Quality Audit
                </CardTitle>
                <Button
                  size="sm" variant="outline"
                  className="border-cyan-900/50 text-cyan-400 hover:bg-cyan-900/20 text-xs"
                  onClick={runBatchQualityCheck}
                  disabled={batchRunning || !capsules?.length}
                  data-testid="button-batch-quality"
                >
                  {batchRunning ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Search className="w-3 h-3 mr-1" />}
                  {batchRunning ? 'Checking...' : 'Run Batch Check (5 recent)'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {batchResult ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-card/30 border border-border/30 rounded">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${batchResult.summary.avgOverall >= 7 ? 'text-emerald-400' : batchResult.summary.avgOverall >= 4 ? 'text-amber-800' : 'text-red-700'}`}>
                        {batchResult.summary.avgOverall}/10
                      </div>
                      <div className="text-[9px] text-muted-foreground">Avg Quality</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${batchResult.summary.passRate >= 70 ? 'text-emerald-400' : batchResult.summary.passRate >= 40 ? 'text-amber-800' : 'text-red-700'}`}>
                        {batchResult.summary.passRate}%
                      </div>
                      <div className="text-[9px] text-muted-foreground">Pass Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{batchResult.summary.total}</div>
                      <div className="text-[9px] text-muted-foreground">Checked</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {batchResult.results.map(r => {
                      if (r.error) return (
                        <div key={r.capsuleId} className="text-[10px] text-red-700 p-2 border border-red-900/20 rounded">
                          Capsule #{r.capsuleId}: {r.error}
                        </div>
                      );
                      const vc = VERDICT_CONFIG[r.quality?.verdict || 'fail'];
                      const VIcon = vc.icon;
                      return (
                        <div key={r.capsuleId} className={`p-2 border rounded ${vc.bg}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <VIcon className={`w-3.5 h-3.5 ${vc.color}`} />
                              <span className="text-xs text-foreground">#{r.capsuleId}</span>
                              {r.capsuleType && <Badge className="text-[8px] bg-border/50 text-muted-foreground">{r.capsuleType}</Badge>}
                            </div>
                            <span className={`text-xs font-bold ${vc.color}`}>{r.quality.overall}/10</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            <ScoreBar label="Complete" score={r.quality.completeness} />
                            <ScoreBar label="Accuracy" score={r.quality.accuracy} />
                            <ScoreBar label="Actionable" score={r.quality.actionability} />
                            <ScoreBar label="Density" score={r.quality.density} />
                          </div>
                          {r.quality.notes && <div className="text-[9px] text-muted-foreground mt-1">{r.quality.notes}</div>}
                          {r.quality.critical_loss && r.quality.critical_loss.length > 0 && (
                            <div className="mt-1">
                              <span className="text-[9px] text-red-700">Missing: </span>
                              <span className="text-[9px] text-muted-foreground">{r.quality.critical_loss.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-xs py-4">
                  Run a batch quality check to audit recent capsules for information loss.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[hsl(var(--card))] border-amber-900/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  State Capsules
                </CardTitle>
                <Badge className="bg-card/50 text-muted-foreground text-[9px]">{capsules?.length || 0} stored</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {capsulesLoading ? (
                <div className="flex items-center justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-amber-800" /></div>
              ) : capsules && capsules.length > 0 ? (
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-2">
                    {capsules.map(capsule => {
                      const qr = qualityResults[capsule.id];
                      return (
                        <div
                          key={capsule.id}
                          className="border border-border/30 rounded p-3 hover:border-amber-900/30 transition-colors cursor-pointer"
                          onClick={() => setExpandedCapsule(expandedCapsule === capsule.id ? null : capsule.id)}
                          data-testid={`capsule-${capsule.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[9px] ${TYPE_COLORS[capsule.capsuleType] || 'bg-border text-muted-foreground'}`}>
                                {capsule.capsuleType}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground">
                                #{capsule.id}{capsule.conversationId && ` · Conv #${capsule.conversationId}`}
                              </span>
                              {qr?.quality && (
                                <Badge className={`text-[8px] ${VERDICT_CONFIG[qr.quality.verdict]?.bg || ''} ${VERDICT_CONFIG[qr.quality.verdict]?.color || ''}`}>
                                  {qr.quality.overall}/10
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                              {capsule.metadata.compressionRatio != null && (
                                <span className="text-emerald-400">{Math.round((1 - capsule.metadata.compressionRatio) * 100)}% saved</span>
                              )}
                              <span>{new Date(capsule.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {expandedCapsule === capsule.id && (
                            <div className="mt-3 space-y-2">
                              <div className="grid grid-cols-3 gap-2 text-[10px]">
                                <div className="text-muted-foreground">Compressed: <span className="text-amber-800">{capsule.metadata.compressedTokens || capsule.metadata.tokensEstimate} tok</span></div>
                                <div className="text-muted-foreground">Original: <span className="text-foreground">{capsule.metadata.originalTokens || '—'} tok</span></div>
                                <div className="text-muted-foreground">Messages: <span className="text-foreground">{capsule.metadata.messageCount || '—'}</span></div>
                                <div className="text-muted-foreground">Model: <span className="text-foreground">{capsule.metadata.model?.split('/').pop() || '—'}</span></div>
                                <div className="text-muted-foreground">Trigger: <span className="text-cyan-400">{capsule.metadata.triggerReason || capsule.metadata.createdBy}</span></div>
                                <div className="text-muted-foreground">Latency: <span className="text-foreground">{capsule.metadata.latencyMs ? `${(capsule.metadata.latencyMs / 1000).toFixed(1)}s` : '—'}</span></div>
                              </div>

                              {qr?.quality && !qr.error && (
                                <>
                                  <Separator className="bg-border/30" />
                                  <div className="space-y-1">
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      {(() => { const vc = VERDICT_CONFIG[qr.quality.verdict]; const V = vc.icon; return <V className={`w-3 h-3 ${vc.color}`} />; })()}
                                      Quality: <span className={VERDICT_CONFIG[qr.quality.verdict]?.color}>{qr.quality.verdict.toUpperCase()} ({qr.quality.overall}/10)</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1">
                                      <ScoreBar label="Complete" score={qr.quality.completeness} />
                                      <ScoreBar label="Accuracy" score={qr.quality.accuracy} />
                                      <ScoreBar label="Actionable" score={qr.quality.actionability} />
                                      <ScoreBar label="Density" score={qr.quality.density} />
                                    </div>
                                    {qr.quality.critical_loss && qr.quality.critical_loss.length > 0 && (
                                      <div className="text-[9px]">
                                        <span className="text-red-700">Info lost: </span>
                                        <span className="text-muted-foreground">{qr.quality.critical_loss.join(', ')}</span>
                                      </div>
                                    )}
                                    {qr.quality.notes && <div className="text-[9px] text-muted-foreground italic">{qr.quality.notes}</div>}
                                  </div>
                                </>
                              )}

                              <Separator className="bg-border/30" />
                              <div className="bg-[hsl(var(--card))] border border-border/20 rounded p-2 text-[10px] text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-wrap">
                                {capsule.content}
                              </div>

                              <Button
                                size="sm" variant="outline"
                                className="border-cyan-900/50 text-cyan-400 hover:bg-cyan-900/20 text-[10px] h-7"
                                onClick={(e) => { e.stopPropagation(); runQualityCheck(capsule.id); }}
                                disabled={checkingQuality === capsule.id}
                                data-testid={`button-quality-${capsule.id}`}
                              >
                                {checkingQuality === capsule.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Search className="w-3 h-3 mr-1" />}
                                {qr ? 'Re-check Quality' : 'Check Quality'}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center text-muted-foreground text-xs py-6">
                  No capsules yet. NEXUS will automatically create them when conversations hit thresholds.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[hsl(var(--card))] border-amber-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.byModel && Object.keys(stats.byModel).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(stats.byModel).map(([model, data]) => {
                      const savingsPct = Math.round((1 - data.avgRatio) * 100);
                      return (
                        <div key={model} className="border border-border/30 rounded p-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-foreground truncate font-medium">{model.split('/').pop()}</div>
                              <div className="text-[9px] text-muted-foreground">{data.count} runs</div>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                              <div>
                                <div className={`text-sm font-bold ${savingsPct >= 60 ? 'text-emerald-400' : savingsPct >= 30 ? 'text-amber-800' : 'text-red-700'}`}>
                                  {savingsPct}%
                                </div>
                                <div className="text-[9px] text-muted-foreground">savings</div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-amber-800">{(data.avgLatency / 1000).toFixed(1)}s</div>
                                <div className="text-[9px] text-muted-foreground">latency</div>
                              </div>
                            </div>
                          </div>
                          <Progress value={savingsPct} className="h-1" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-xs py-6">No compression data yet.</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[hsl(var(--card))] border-amber-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Trigger Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.byTrigger && Object.keys(stats.byTrigger).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(stats.byTrigger).map(([trigger, count]) => {
                      const total = totalCompressions || 1;
                      const pct = Math.round((count / total) * 100);
                      const color = trigger === 'message_threshold' ? 'bg-cyan-500' : trigger === 'token_threshold' ? 'bg-purple-500' : trigger === 'manual' ? 'bg-amber-500' : 'bg-muted';
                      return (
                        <div key={trigger} className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">{trigger.replace(/_/g, ' ')}</span>
                            <span className="text-foreground">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground text-xs py-6">No trigger data yet.</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[hsl(var(--card))] border-amber-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Compression Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentCapsules && stats.recentCapsules.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border/30">
                        <th className="text-left py-1.5 pr-3">ID</th>
                        <th className="text-left py-1.5 pr-3">Type</th>
                        <th className="text-left py-1.5 pr-3">Trigger</th>
                        <th className="text-right py-1.5 pr-3">Tokens</th>
                        <th className="text-right py-1.5 pr-3">Savings</th>
                        <th className="text-left py-1.5 pr-3">Model</th>
                        <th className="text-right py-1.5">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentCapsules.map(c => (
                        <tr key={c.id} className="border-b border-border/20 hover:bg-card/30">
                          <td className="py-1.5 pr-3 text-muted-foreground">#{c.id}</td>
                          <td className="py-1.5 pr-3">
                            <Badge className={`text-[8px] ${TYPE_COLORS[c.type] || 'bg-border text-muted-foreground'}`}>{c.type}</Badge>
                          </td>
                          <td className="py-1.5 pr-3 text-muted-foreground">{c.createdBy}</td>
                          <td className="py-1.5 pr-3 text-right text-amber-800">{c.tokens || '—'}</td>
                          <td className="py-1.5 pr-3 text-right text-emerald-400">{c.ratio ? `${Math.round((1 - c.ratio) * 100)}%` : '—'}</td>
                          <td className="py-1.5 pr-3 text-muted-foreground truncate max-w-[100px]">{c.model?.split('/').pop() || '—'}</td>
                          <td className="py-1.5 text-right text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-xs py-6">No compression runs recorded yet.</div>
              )}
            </CardContent>
          </Card>

          {wandbEnabled && (
            <Card className="bg-[hsl(var(--card))] border-purple-900/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-xs text-purple-700">
                  <BarChart3 className="w-3.5 h-3.5" />
                  W&B Dashboard syncing — compression_ratio, token_savings, latency_ms, savings_percent tracked per run.
                  Check your W&B project <span className="font-bold">nexus-context-manager</span> for trends and optimization insights.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <Card className="bg-[hsl(var(--card))] border-amber-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Auto-Compression Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Auto-Compress Enabled</Label>
                <Switch
                  checked={thresholds.autoCompress}
                  onCheckedChange={(v) => setThresholds(prev => ({ ...prev, autoCompress: v }))}
                  data-testid="switch-auto-compress"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Message Threshold</Label>
                  <span className="text-xs text-amber-800">{thresholds.messageCount} messages</span>
                </div>
                <Slider
                  value={[thresholds.messageCount]}
                  onValueChange={([v]) => setThresholds(prev => ({ ...prev, messageCount: v }))}
                  min={5} max={30} step={1} className="w-full"
                  data-testid="slider-message-threshold"
                />
                <div className="text-[9px] text-muted-foreground">Compress when conversation exceeds this many messages</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">Token Threshold</Label>
                  <span className="text-xs text-amber-800">{thresholds.tokenEstimate.toLocaleString()} tokens</span>
                </div>
                <Slider
                  value={[thresholds.tokenEstimate]}
                  onValueChange={([v]) => setThresholds(prev => ({ ...prev, tokenEstimate: v }))}
                  min={2000} max={16000} step={500} className="w-full"
                  data-testid="slider-token-threshold"
                />
                <div className="text-[9px] text-muted-foreground">Compress when estimated tokens exceed this limit. Handoff triggers at 1.5x this value.</div>
              </div>
              <Button
                size="sm"
                className="w-full bg-amber-900/30 text-amber-800 border border-amber-800/40 hover:bg-amber-900/50 text-xs"
                onClick={() => {
                  localStorage.setItem('nexus_memory_thresholds', JSON.stringify(thresholds));
                  toast({ title: "Thresholds Saved", description: `Messages: ${thresholds.messageCount}, Tokens: ${thresholds.tokenEstimate}` });
                }}
                data-testid="button-save-thresholds"
              >
                Save Thresholds
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crew" className="mt-4">
          <Card className="bg-[hsl(var(--card))] border-amber-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Specialist Crew (NEXUS Orchestrates)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CREW_AGENTS.map(agent => {
                  const Icon = agent.icon;
                  return (
                    <div key={agent.id} className="flex items-center gap-3 p-3 border border-border/30 rounded hover:border-amber-900/30 transition-colors" data-testid={`crew-agent-${agent.id}`}>
                      <div className={`w-8 h-8 rounded flex items-center justify-center bg-card/50`}>
                        <Icon className={`w-4 h-4 ${agent.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-foreground font-medium">{agent.name}</div>
                        <div className="text-[10px] text-muted-foreground">{agent.role}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-3 bg-border/30" />
              <div className="p-3 bg-card/20 border border-border/20 rounded space-y-1">
                <div className="text-xs text-amber-800 font-medium">NEXUS Architect Role</div>
                <div className="text-[10px] text-muted-foreground leading-relaxed">
                  NEXUS is the lead architect agent with a bird's-eye view of all sessions. It orchestrates specialist crews,
                  manages context memory automatically, routes tasks to the right specialist, and maintains continuity across
                  conversation handoffs. Memory compression happens invisibly — NEXUS decides when to compress and what to preserve.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
