import { useState, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, Bot, Shield, Eye, Lock, Bug, Network, Brain, Zap, Play, Download, Copy,
  Check, Loader2, Plus, Minus, Settings2, BarChart3, Clock, DollarSign, FileText,
  AlertTriangle, TrendingUp, Layers, RotateCcw, ChevronRight, Sparkles, Target,
  X, Code, Flame, Search, Star, Cpu, Globe,
} from 'lucide-react';

const AVAILABLE_AGENTS = [
  { id: 'vuln_analyst', name: 'VulnAnalyst', role: 'Vulnerability Analysis', icon: Bug, color: 'red', description: 'CVE research, exploit assessment, remediation guidance' },
  { id: 'osint_analyst', name: 'OSINTAnalyst', role: 'OSINT & Recon', icon: Eye, color: 'blue', description: 'Attack surface mapping, domain reconnaissance' },
  { id: 'threat_intel', name: 'ThreatIntel', role: 'Threat Intelligence', icon: Shield, color: 'purple', description: 'TTPs, MITRE ATT&CK, campaign tracking' },
  { id: 'secret_hunter', name: 'SecretHunter', role: 'Credential Analysis', icon: Lock, color: 'amber', description: 'Exposed credentials, API keys, secret rotation' },
  { id: 'network_recon', name: 'NetworkRecon', role: 'Network Analysis', icon: Network, color: 'teal', description: 'Service enumeration, topology mapping' },
  { id: 'synthesis', name: 'Synthesis', role: 'Executive Synthesis', icon: Brain, color: 'indigo', description: 'Combines all outputs into unified report' },
];

type CostTier = 'free' | 'budget' | 'mid' | 'premium';
type ModelCategory = 'free' | 'coding' | 'reasoning' | 'speed' | 'trending' | 'security' | 'all';

interface ModelEntry {
  id: string;
  name: string;
  provider: string;
  costTier: CostTier;
  categories: ModelCategory[];
  strength: string;
  inputPer1M: number;
  outputPer1M: number;
  speed: string;
  contextWindow: string;
  note: string;
}

const COST_TIER_META: Record<CostTier, { label: string; color: string; bg: string; border: string; description: string }> = {
  free:    { label: 'FREE',    color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-800/40', description: '$0 — no cost at all' },
  budget:  { label: 'BUDGET',  color: 'text-sky-400',     bg: 'bg-sky-900/20',     border: 'border-sky-800/40',     description: 'Under $1/M output — cheap even with heavy output' },
  mid:     { label: 'MID',     color: 'text-amber-800',   bg: 'bg-amber-900/20',   border: 'border-amber-800/40',   description: '$1-10/M output — solid quality, watch output volume' },
  premium: { label: 'PREMIUM', color: 'text-rose-400',    bg: 'bg-rose-900/20',     border: 'border-rose-800/40',    description: '$10+/M output — top quality, burns fast on long outputs' },
};

const CATEGORY_META: Record<ModelCategory, { label: string; icon: any; color: string }> = {
  all:       { label: 'All Models',   icon: Globe,    color: 'text-muted-foreground' },
  free:      { label: 'Free',         icon: Zap,      color: 'text-emerald-700' },
  coding:    { label: 'Coding',       icon: Code,     color: 'text-sky-700' },
  reasoning: { label: 'Reasoning',    icon: Brain,    color: 'text-purple-700' },
  speed:     { label: 'Speed',        icon: Zap,      color: 'text-yellow-800' },
  trending:  { label: 'Trending',     icon: Flame,    color: 'text-orange-800' },
  security:  { label: 'Security',     icon: Shield,   color: 'text-red-700' },
};

const OPENROUTER_MODELS: ModelEntry[] = [
  // ── FREE ──
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'Meta', costTier: 'free', categories: ['free', 'security'], strength: 'Strong all-rounder, great for security analysis', inputPer1M: 0, outputPer1M: 0, speed: 'fast', contextWindow: '128K', note: 'Best free general-purpose model' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', provider: 'DeepSeek', costTier: 'free', categories: ['free', 'reasoning'], strength: 'Chain-of-thought reasoning, thinks step by step', inputPer1M: 0, outputPer1M: 0, speed: 'slow', contextWindow: '64K', note: 'Exceptional reasoning but slower — shows its work' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder 32B', provider: 'Alibaba', costTier: 'free', categories: ['free', 'coding'], strength: 'Code analysis, exploit review, script generation', inputPer1M: 0, outputPer1M: 0, speed: 'fast', contextWindow: '32K', note: 'Top free coding model — great for vuln code review' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', provider: 'Google', costTier: 'free', categories: ['free', 'speed'], strength: 'Fastest responses, good for quick triage', inputPer1M: 0, outputPer1M: 0, speed: 'fastest', contextWindow: '1M', note: 'Lightning fast with massive context window' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron 70B', provider: 'NVIDIA', costTier: 'free', categories: ['free', 'security'], strength: 'Technical depth, NVIDIA-tuned for structured tasks', inputPer1M: 0, outputPer1M: 0, speed: 'fast', contextWindow: '128K', note: 'NVIDIA-tuned Llama — strong on structured analysis' },
  { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek V3', provider: 'DeepSeek', costTier: 'free', categories: ['free', 'trending'], strength: 'Latest DeepSeek, strong general + code ability', inputPer1M: 0, outputPer1M: 0, speed: 'fast', contextWindow: '64K', note: 'Hot new model — rivals paid models on many benchmarks' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', provider: 'Google', costTier: 'free', categories: ['free', 'speed'], strength: 'Compact and fast, good secondary agent', inputPer1M: 0, outputPer1M: 0, speed: 'fastest', contextWindow: '128K', note: 'Small but punchy — good for lightweight agent roles' },

  // ── BUDGET (under $1/M output) ──
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', costTier: 'budget', categories: ['speed', 'coding'], strength: 'Fast, cheap, surprisingly capable', inputPer1M: 0.15, outputPer1M: 0.60, speed: 'fast', contextWindow: '128K', note: '$0.60/M output — cheap enough to run 10+ agents' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (Paid)', provider: 'Google', costTier: 'budget', categories: ['speed'], strength: 'Paid tier = higher rate limits, same speed', inputPer1M: 0.10, outputPer1M: 0.40, speed: 'fastest', contextWindow: '1M', note: '$0.40/M output — fastest paid option, huge context' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3 (Paid)', provider: 'DeepSeek', costTier: 'budget', categories: ['coding', 'trending'], strength: 'Full DeepSeek V3 with guaranteed uptime', inputPer1M: 0.14, outputPer1M: 0.28, speed: 'fast', contextWindow: '64K', note: '$0.28/M output — insanely cheap for its quality' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', costTier: 'budget', categories: ['speed', 'coding'], strength: 'Fast Claude — great balance of speed and smarts', inputPer1M: 0.80, outputPer1M: 4.00, speed: 'fast', contextWindow: '200K', note: '$0.80/M input is cheap — but watch output at $4/M' },

  // ── MID ($1-10/M output) ──
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', costTier: 'mid', categories: ['security', 'reasoning'], strength: 'OpenAI flagship — strong all-around', inputPer1M: 2.50, outputPer1M: 10.00, speed: 'medium', contextWindow: '128K', note: '$10/M output — quality jump over mini, but 16x the cost' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', costTier: 'mid', categories: ['security', 'reasoning', 'coding', 'trending'], strength: 'Best for deep analysis, security reasoning, code', inputPer1M: 3.00, outputPer1M: 15.00, speed: 'medium', contextWindow: '200K', note: '$15/M output — expensive on long reports but exceptional quality' },
  { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro', provider: 'Google', costTier: 'mid', categories: ['reasoning', 'trending'], strength: 'Google frontier — huge context, strong reasoning', inputPer1M: 1.25, outputPer1M: 10.00, speed: 'medium', contextWindow: '1M', note: '$10/M output — 1M context lets you feed massive scan data' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Paid)', provider: 'DeepSeek', costTier: 'mid', categories: ['reasoning'], strength: 'Paid R1 — guaranteed uptime, full reasoning', inputPer1M: 0.55, outputPer1M: 2.19, speed: 'slow', contextWindow: '64K', note: '$2.19/M output — cheapest reasoning model at this quality' },
  { id: 'moonshotai/kimi-k2.5', name: 'Kimi K2.5', provider: 'Moonshot', costTier: 'mid', categories: ['trending'], strength: 'New frontier model, strong on complex tasks', inputPer1M: 0.50, outputPer1M: 2.00, speed: 'fast', contextWindow: '128K', note: '$2/M output — rising star, watch this one' },

  // ── PREMIUM ($10+/M output) ──
  { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', costTier: 'premium', categories: ['security', 'reasoning'], strength: 'Most capable model available — peak analysis', inputPer1M: 15.00, outputPer1M: 75.00, speed: 'slow', contextWindow: '200K', note: '$75/M output — use sparingly for Synthesis agent only' },
  { id: 'openai/o3', name: 'OpenAI o3', provider: 'OpenAI', costTier: 'premium', categories: ['reasoning', 'trending'], strength: 'Extended reasoning, complex multi-step analysis', inputPer1M: 10.00, outputPer1M: 40.00, speed: 'slow', contextWindow: '200K', note: '$40/M output — powerful reasoner but expensive thinking tokens' },
  { id: 'openai/o4-mini', name: 'OpenAI o4-mini', provider: 'OpenAI', costTier: 'premium', categories: ['reasoning', 'trending', 'coding'], strength: 'Latest OpenAI reasoning, more efficient than o3', inputPer1M: 1.10, outputPer1M: 4.40, speed: 'medium', contextWindow: '200K', note: '$4.40/M output + hidden thinking tokens can 3-5x actual cost' },
];

function costFor1kOutput(model: ModelEntry): number {
  return model.outputPer1M / 1000;
}

function estimateRunCost(model: ModelEntry, estInputTokens = 2000, estOutputTokens = 2000): number {
  return (model.inputPer1M * estInputTokens / 1_000_000) + (model.outputPer1M * estOutputTokens / 1_000_000);
}

function ModelPickerPopup({ value, onChange, onClose }: { value: string; onChange: (id: string) => void; onClose: () => void }) {
  const [filterCat, setFilterCat] = useState<ModelCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return OPENROUTER_MODELS.filter(m => {
      if (filterCat !== 'all' && !m.categories.includes(filterCat)) return false;
      if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) && !m.provider.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [filterCat, searchQuery]);

  const grouped = useMemo(() => {
    const groups: Record<CostTier, ModelEntry[]> = { free: [], budget: [], mid: [], premium: [] };
    filtered.forEach(m => groups[m.costTier].push(m));
    return groups;
  }, [filtered]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-amber-900/40 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-orbitron text-amber-800 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Choose Model (OpenRouter)
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-muted-foreground hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-3 border-b border-border space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="pl-8 h-8 bg-card/50 border-border text-white text-xs"
              autoFocus
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(CATEGORY_META) as ModelCategory[]).map(cat => {
              const meta = CATEGORY_META[cat];
              const CatIcon = meta.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all border ${
                    filterCat === cat
                      ? `${meta.color} bg-border border-muted`
                      : 'text-muted-foreground border-transparent hover:border-border hover:text-foreground'
                  }`}
                >
                  <CatIcon className="w-3 h-3" /> {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="space-y-4">
            {(['free', 'budget', 'mid', 'premium'] as CostTier[]).map(tier => {
              const models = grouped[tier];
              if (models.length === 0) return null;
              const tierMeta = COST_TIER_META[tier];
              return (
                <div key={tier}>
                  <div className={`flex items-center gap-2 mb-2 px-2 py-1 rounded ${tierMeta.bg} ${tierMeta.border} border`}>
                    <Badge className={`${tierMeta.color} bg-transparent border-0 text-[10px] font-bold p-0`}>{tierMeta.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">{tierMeta.description}</span>
                  </div>
                  <div className="space-y-1">
                    {models.map(m => {
                      const isSelected = m.id === value;
                      const estRun = estimateRunCost(m);
                      return (
                        <button
                          key={m.id}
                          onClick={() => { onChange(m.id); onClose(); }}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-amber-600 bg-amber-900/20'
                              : 'border-border hover:border-muted bg-card/30 hover:bg-card/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-white">{m.name}</span>
                                <span className="text-[9px] text-muted-foreground">{m.provider}</span>
                                {isSelected && <Check className="w-3 h-3 text-amber-800" />}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{m.strength}</p>
                              <p className="text-[10px] text-muted-foreground italic mt-0.5">{m.note}</p>
                            </div>
                            <div className="text-right shrink-0 space-y-0.5">
                              {m.costTier === 'free' ? (
                                <Badge className="bg-emerald-900/30 text-emerald-400 text-[9px] border-0">FREE</Badge>
                              ) : (
                                <>
                                  <div className="text-[9px] text-muted-foreground">
                                    <span className="text-muted-foreground">in:</span> <span className={tierMeta.color}>${m.inputPer1M}</span>/M
                                  </div>
                                  <div className="text-[9px] text-muted-foreground">
                                    <span className="text-muted-foreground">out:</span> <span className={`${tierMeta.color} font-bold`}>${m.outputPer1M}</span>/M
                                  </div>
                                  <div className="text-[9px] text-muted-foreground mt-0.5">
                                    ~${estRun.toFixed(3)}/run
                                  </div>
                                </>
                              )}
                              <div className="flex items-center gap-1 justify-end text-[9px] text-muted-foreground">
                                <Clock className="w-2.5 h-2.5" /> {m.speed}
                              </div>
                              <div className="text-[9px] text-muted-foreground">{m.contextWindow} ctx</div>
                            </div>
                          </div>
                          <div className="flex gap-1 mt-1.5">
                            {m.categories.map(cat => (
                              <span key={cat} className={`text-[8px] px-1 py-0.5 rounded ${CATEGORY_META[cat]?.color || 'text-muted-foreground'} bg-border/50`}>
                                {CATEGORY_META[cat]?.label || cat}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border text-center">
          <p className="text-[10px] text-muted-foreground">
            Output tokens cost the most — a 2K-token report at $15/M output = $0.03. A 10K report = $0.15. Security analysis generates heavy output.
          </p>
        </div>
      </div>
    </div>
  );
}

const CREW_SIZE_GUIDANCE: Record<number, { label: string; quality: string; tradeoff: string }> = {
  1: { label: 'Solo Agent', quality: 'Baseline', tradeoff: 'Fast, cheap, limited perspective' },
  2: { label: 'Pair', quality: 'Good', tradeoff: 'Analyst + Critic pattern' },
  3: { label: 'Triad (Optimal)', quality: 'Best ROI', tradeoff: 'Analyst + Specialist + Synthesizer' },
  4: { label: 'Quad', quality: 'High', tradeoff: 'Diminishing returns start here' },
  5: { label: 'Squad', quality: 'Marginal gains', tradeoff: 'Role overlap risk increases' },
  6: { label: 'Full Crew', quality: 'Often worse than 4', tradeoff: 'Synthesis overload, high cost' },
};

interface CrewMember {
  agentId: string;
  model: string;
  temperature: number;
  customPromptAddition: string;
}

interface CrewRunResult {
  agentId: string;
  agentName: string;
  model: string;
  output: string;
  latencyMs: number;
  tokenUsage?: { prompt: number; completion: number; total: number };
  costEstimate: number;
}

interface CrewEvalRun {
  id: string;
  crewSize: number;
  members: CrewMember[];
  results: CrewRunResult[];
  synthesisResult?: CrewRunResult;
  totalLatencyMs: number;
  totalTokens: number;
  totalCost: number;
  timestamp: string;
}

export default function CrewBuilder() {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([
    { agentId: 'vuln_analyst', model: 'meta-llama/llama-3.3-70b-instruct:free', temperature: 0.3, customPromptAddition: '' },
    { agentId: 'osint_analyst', model: 'meta-llama/llama-3.3-70b-instruct:free', temperature: 0.5, customPromptAddition: '' },
    { agentId: 'synthesis', model: 'meta-llama/llama-3.3-70b-instruct:free', temperature: 0.5, customPromptAddition: '' },
  ]);
  const [objective, setObjective] = useState('Comprehensive security assessment of the target');
  const [taskInput, setTaskInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentResults, setCurrentResults] = useState<CrewRunResult[]>([]);
  const [synthesisResult, setSynthesisResult] = useState<CrewRunResult | null>(null);
  const [evalHistory, setEvalHistory] = useState<CrewEvalRun[]>([]);
  const [activeTab, setActiveTab] = useState('build');
  const [runProgress, setRunProgress] = useState(0);
  const [runningAgent, setRunningAgent] = useState('');
  const [includeSynthesis, setIncludeSynthesis] = useState(true);
  const [copied, setCopied] = useState(false);

  const addMember = () => {
    const usedIds = crewMembers.map(m => m.agentId);
    const available = AVAILABLE_AGENTS.find(a => !usedIds.includes(a.id));
    if (!available) {
      toast({ title: 'All agents assigned', description: 'Remove one to add a different agent', variant: 'destructive' });
      return;
    }
    setCrewMembers(prev => [...prev, {
      agentId: available.id,
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      temperature: 0.5,
      customPromptAddition: '',
    }]);
  };

  const removeMember = (index: number) => {
    if (crewMembers.length <= 1) return;
    setCrewMembers(prev => prev.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, updates: Partial<CrewMember>) => {
    setCrewMembers(prev => prev.map((m, i) => i === index ? { ...m, ...updates } : m));
  };

  const [modelPickerIdx, setModelPickerIdx] = useState<number | null>(null);

  const getAgentInfo = (agentId: string) => AVAILABLE_AGENTS.find(a => a.id === agentId);
  const getModelInfo = (modelId: string) => OPENROUTER_MODELS.find(m => m.id === modelId);

  const estimateCost = () => {
    return crewMembers.reduce((sum, m) => {
      const model = getModelInfo(m.model);
      return sum + estimateRunCost(model || OPENROUTER_MODELS[0]);
    }, 0);
  };

  const runCrew = useCallback(async () => {
    if (!taskInput.trim()) {
      toast({ title: 'Missing Input', description: 'Provide scan data or investigation context to analyze', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    setCurrentResults([]);
    setSynthesisResult(null);
    setRunProgress(0);
    setActiveTab('results');

    const analysts = crewMembers.filter(m => m.agentId !== 'synthesis');
    const synthesisMember = crewMembers.find(m => m.agentId === 'synthesis');
    const totalSteps = analysts.length + (includeSynthesis && synthesisMember ? 1 : 0);
    const results: CrewRunResult[] = [];

    try {
      for (let i = 0; i < analysts.length; i++) {
        const member = analysts[i];
        const agentInfo = getAgentInfo(member.agentId);
        const modelInfo = getModelInfo(member.model);
        setRunningAgent(agentInfo?.name || member.agentId);
        setRunProgress(((i) / totalSteps) * 100);

        const startTime = Date.now();
        const res = await fetch('/api/agents/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: member.agentId,
            prompt: taskInput.slice(0, 8000),
            scanId: `crew_${Date.now()}`,
            scanData: taskInput.slice(0, 8000),
            model: member.model,
            temperature: member.temperature,
            userPromptAddition: member.customPromptAddition || undefined,
          }),
        });

        const data = await res.json();
        const latencyMs = Date.now() - startTime;
        const tokensUsed = data.tokenUsage?.total || Math.ceil((taskInput.length + (data.analysis?.length || 0)) / 4);

        results.push({
          agentId: member.agentId,
          agentName: agentInfo?.name || member.agentId,
          model: member.model,
          output: data.analysis || data.error || 'No output',
          latencyMs,
          tokenUsage: data.tokenUsage,
          costEstimate: ((modelInfo?.inputPer1M || 0) + (modelInfo?.outputPer1M || 0)) / 2 * (tokensUsed / 1_000_000),
        });

        setCurrentResults([...results]);
      }

      if (includeSynthesis && synthesisMember) {
        setRunningAgent('Synthesis');
        setRunProgress(((analysts.length) / totalSteps) * 100);

        const combinedOutputs = results.map(r => `## ${r.agentName} Analysis\n${r.output}`).join('\n\n---\n\n');
        const synthPrompt = `You are synthesizing outputs from ${results.length} specialist security agents.\n\nObjective: ${objective}\n\n${combinedOutputs}\n\nProvide a unified executive synthesis that:\n1. Identifies the most critical findings across all reports\n2. Maps how different findings connect\n3. Creates a prioritized action plan\n4. Notes where agents agreed vs disagreed\n5. Highlights any gaps in the analysis`;

        const startTime = Date.now();
        const synthModelInfo = getModelInfo(synthesisMember.model);
        const res = await fetch('/api/agents/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: 'synthesis',
            prompt: synthPrompt.slice(0, 12000),
            scanId: `crew_synth_${Date.now()}`,
            scanData: synthPrompt.slice(0, 12000),
            model: synthesisMember.model,
            temperature: synthesisMember.temperature,
          }),
        });

        const data = await res.json();
        const latencyMs = Date.now() - startTime;
        const tokensUsed = data.tokenUsage?.total || Math.ceil((synthPrompt.length + (data.analysis?.length || 0)) / 4);

        const synthResult: CrewRunResult = {
          agentId: 'synthesis',
          agentName: 'Synthesis',
          model: synthesisMember.model,
          output: data.analysis || data.error || 'No output',
          latencyMs,
          tokenUsage: data.tokenUsage,
          costEstimate: ((synthModelInfo?.inputPer1M || 0) + (synthModelInfo?.outputPer1M || 0)) / 2 * (tokensUsed / 1_000_000),
        };
        setSynthesisResult(synthResult);
      }

      setRunProgress(100);

      const evalRun: CrewEvalRun = {
        id: `eval_${Date.now()}`,
        crewSize: crewMembers.length,
        members: [...crewMembers],
        results: [...results],
        synthesisResult: synthesisResult || undefined,
        totalLatencyMs: results.reduce((s, r) => s + r.latencyMs, 0),
        totalTokens: results.reduce((s, r) => s + (r.tokenUsage?.total || 0), 0),
        totalCost: results.reduce((s, r) => s + r.costEstimate, 0),
        timestamp: new Date().toISOString(),
      };
      setEvalHistory(prev => [evalRun, ...prev].slice(0, 20));

      toast({ title: 'Crew Run Complete', description: `${results.length} agents + synthesis finished` });
    } catch (error: any) {
      toast({ title: 'Crew Run Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsRunning(false);
      setRunningAgent('');
    }
  }, [crewMembers, taskInput, objective, includeSynthesis]);

  const exportCrewAI = () => {
    const crewConfig = {
      framework: 'crewai',
      version: '0.80.0',
      crew: {
        name: objective.slice(0, 50),
        process: 'sequential',
        verbose: true,
        agents: crewMembers.map(m => {
          const info = getAgentInfo(m.agentId);
          return {
            role: info?.name || m.agentId,
            goal: m.agentId === 'synthesis' ? `Synthesize all agent outputs into unified report. Objective: ${objective}` : `${info?.description}. Objective: ${objective}`,
            backstory: `You are ${info?.name}, a specialist in ${info?.role}. ${info?.description}.`,
            verbose: true,
            allow_delegation: m.agentId === 'synthesis',
            llm: {
              provider: 'openrouter',
              model: m.model,
              temperature: m.temperature,
              max_tokens: 4096,
              api_base: 'https://openrouter.ai/api/v1',
            },
          };
        }),
        tasks: crewMembers.filter(m => m.agentId !== 'synthesis').map(m => {
          const info = getAgentInfo(m.agentId);
          return {
            description: `Analyze the provided data as ${info?.name}. Focus on: ${info?.description}`,
            agent: info?.name || m.agentId,
            expected_output: `Structured ${info?.role} report with findings and recommendations`,
          };
        }),
      },
      python_setup: `# pip install crewai openai
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI

# Configure OpenRouter as LLM provider
${crewMembers.map(m => {
  const info = getAgentInfo(m.agentId);
  return `llm_${m.agentId} = ChatOpenAI(
    model="${m.model}",
    temperature=${m.temperature},
    openai_api_base="https://openrouter.ai/api/v1",
    openai_api_key="YOUR_OPENROUTER_KEY"
)`;
}).join('\n\n')}

# Define Agents
${crewMembers.map(m => {
  const info = getAgentInfo(m.agentId);
  return `${m.agentId} = Agent(
    role="${info?.name}",
    goal="${info?.description}",
    backstory="You are ${info?.name}, a specialist in ${info?.role}.",
    verbose=True,
    allow_delegation=${m.agentId === 'synthesis' ? 'True' : 'False'},
    llm=llm_${m.agentId}
)`;
}).join('\n\n')}

# Define Tasks
${crewMembers.filter(m => m.agentId !== 'synthesis').map(m => {
  const info = getAgentInfo(m.agentId);
  return `task_${m.agentId} = Task(
    description="Analyze the provided data. Focus on: ${info?.description}",
    agent=${m.agentId},
    expected_output="Structured ${info?.role} report"
)`;
}).join('\n\n')}

# Assemble Crew
crew = Crew(
    agents=[${crewMembers.map(m => m.agentId).join(', ')}],
    tasks=[${crewMembers.filter(m => m.agentId !== 'synthesis').map(m => `task_${m.agentId}`).join(', ')}],
    process=Process.sequential,
    verbose=True
)

# Run
result = crew.kickoff(inputs={"data": "YOUR_SCAN_DATA_HERE"})
print(result)`,
    };
    return crewConfig;
  };

  const handleExportCrewAI = () => {
    const config = exportCrewAI();
    navigator.clipboard.writeText(config.python_setup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'CrewAI Code Copied', description: 'Python setup code copied to clipboard. Also downloading JSON config.' });

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crew_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportLangChain = () => {
    const config = {
      framework: 'langchain',
      agents: crewMembers.map(m => {
        const info = getAgentInfo(m.agentId);
        return {
          name: info?.name,
          agent_type: 'react',
          memory_type: m.agentId === 'synthesis' ? 'summary' : 'buffer',
          llm_config: {
            model: m.model,
            temperature: m.temperature,
            max_tokens: 4096,
            base_url: 'https://openrouter.ai/api/v1',
          },
        };
      }),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `langchain_config_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'LangChain Config Downloaded' });
  };

  const totalEstCost = estimateCost();

  return (
    <div className="min-h-screen bg-gradient-to-br from-card via-card to-card">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-amber-500" data-testid="back-button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-amber-800 flex items-center gap-2" data-testid="crew-builder-title">
                <Layers className="w-6 h-6" /> Crew Builder
              </h1>
              <p className="text-muted-foreground text-sm">Design, test, and evaluate AI agent teams</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-border text-muted-foreground" onClick={handleExportCrewAI} data-testid="export-crewai">
              <Download className="w-4 h-4 mr-1" /> {copied ? 'Copied!' : 'CrewAI Export'}
            </Button>
            <Button variant="outline" size="sm" className="border-border text-muted-foreground" onClick={handleExportLangChain} data-testid="export-langchain">
              <Download className="w-4 h-4 mr-1" /> LangChain
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 border border-amber-900/30 mb-6">
            <TabsTrigger value="build" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400" data-testid="tab-build">
              <Settings2 className="w-4 h-4 mr-2" /> Build Crew
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-teal-900/30 data-[state=active]:text-teal-400" data-testid="tab-results">
              <FileText className="w-4 h-4 mr-2" /> Results
              {currentResults.length > 0 && (
                <Badge className="ml-2 bg-teal-600 text-xs">{currentResults.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="eval" className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-400" data-testid="tab-eval">
              <BarChart3 className="w-4 h-4 mr-2" /> Eval History
              {evalHistory.length > 0 && (
                <Badge className="ml-2 bg-purple-600 text-xs">{evalHistory.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="build" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-[hsl(var(--card))] border-amber-900/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-orbitron text-amber-800 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Crew Objective
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      placeholder="What should this crew accomplish?"
                      className="bg-card/50 border-border text-white"
                      data-testid="crew-objective-input"
                    />
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-orbitron text-white flex items-center gap-2">
                    Crew Members ({crewMembers.length}/6)
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={includeSynthesis} onCheckedChange={setIncludeSynthesis} className="data-[state=checked]:bg-amber-600" />
                      <span className="text-xs text-muted-foreground">Auto-Synthesis</span>
                    </div>
                    <Button size="sm" variant="outline" className="border-teal-700 text-teal-800" onClick={addMember} disabled={crewMembers.length >= 6} data-testid="add-agent-btn">
                      <Plus className="w-4 h-4 mr-1" /> Add Agent
                    </Button>
                  </div>
                </div>

                {crewMembers.map((member, idx) => {
                  const info = getAgentInfo(member.agentId);
                  const modelInfo = getModelInfo(member.model);
                  const Icon = info?.icon || Bot;
                  return (
                    <Card key={idx} className={`bg-[hsl(var(--card))] border-border hover:border-amber-800/40 transition-colors`} data-testid={`crew-member-${idx}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg bg-${info?.color || 'stone'}-900/30 mt-1`}>
                            <Icon className={`w-5 h-5 text-${info?.color || 'stone'}-400`} />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Select value={member.agentId} onValueChange={(v) => updateMember(idx, { agentId: v })}>
                                  <SelectTrigger className="w-48 bg-card/50 border-border text-white h-8" data-testid={`agent-select-${idx}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-card border-border">
                                    {AVAILABLE_AGENTS.map(a => (
                                      <SelectItem key={a.id} value={a.id} className="text-foreground">
                                        {a.name} — {a.role}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">
                                  Agent {idx + 1}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-400 h-6 w-6 p-0" onClick={() => removeMember(idx)} disabled={crewMembers.length <= 1}>
                                <Minus className="w-3 h-3" />
                              </Button>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-[10px] text-muted-foreground uppercase">Model (OpenRouter)</Label>
                                <button
                                  onClick={() => setModelPickerIdx(idx)}
                                  className="w-full flex items-center justify-between gap-2 bg-card/50 border border-border rounded-md px-3 h-8 text-xs text-white hover:border-amber-700 transition-colors"
                                  data-testid={`model-select-${idx}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {modelInfo && (
                                      <Badge className={`${COST_TIER_META[modelInfo.costTier].color} bg-transparent border-0 text-[8px] font-bold p-0 shrink-0`}>
                                        {COST_TIER_META[modelInfo.costTier].label}
                                      </Badge>
                                    )}
                                    <span className="truncate">{modelInfo?.name || 'Select model...'}</span>
                                  </div>
                                  <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                                </button>
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground uppercase">Temperature: {member.temperature}</Label>
                                <Slider
                                  value={[member.temperature]}
                                  onValueChange={([v]) => updateMember(idx, { temperature: v })}
                                  min={0} max={1.5} step={0.1}
                                  className="mt-2"
                                />
                                <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                                  <span>Precise</span><span>Creative</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label className="text-[10px] text-muted-foreground uppercase">Custom Instructions (optional)</Label>
                              <Input
                                value={member.customPromptAddition}
                                onChange={(e) => updateMember(idx, { customPromptAddition: e.target.value })}
                                placeholder="Additional focus instructions for this agent..."
                                className="bg-card/50 border-border text-white h-8 text-xs"
                              />
                            </div>

                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {modelInfo?.costTier === 'free' ? (
                                  <span className="text-emerald-500">Free</span>
                                ) : modelInfo ? (
                                  <span className={COST_TIER_META[modelInfo.costTier].color}>
                                    ~${estimateRunCost(modelInfo).toFixed(3)}/run · ${modelInfo.outputPer1M}/M out
                                  </span>
                                ) : 'unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {modelInfo?.speed || 'unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {modelInfo?.contextWindow || '?'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="space-y-4">
                <Card className="bg-[hsl(var(--card))] border-amber-900/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-orbitron text-amber-800">Crew Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-card/50 rounded p-2 text-center">
                        <p className="text-xl font-bold text-amber-800" data-testid="crew-size">{crewMembers.length}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">Agents</p>
                      </div>
                      <div className="bg-card/50 rounded p-2 text-center">
                        <p className="text-xl font-bold text-teal-800">${totalEstCost.toFixed(2)}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">Est. Cost</p>
                      </div>
                    </div>

                    {CREW_SIZE_GUIDANCE[crewMembers.length] && (
                      <div className="bg-card/30 rounded p-3 border border-border">
                        <p className="text-xs text-amber-800 font-medium">{CREW_SIZE_GUIDANCE[crewMembers.length].label}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{CREW_SIZE_GUIDANCE[crewMembers.length].quality}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{CREW_SIZE_GUIDANCE[crewMembers.length].tradeoff}</p>
                      </div>
                    )}

                    {crewMembers.length > 4 && (
                      <div className="flex items-start gap-2 bg-amber-900/10 border border-amber-900/30 rounded p-2">
                        <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-800">Past 4 agents, quality often decreases due to role overlap and synthesis overload. Consider removing agents unless each has a unique contribution.</p>
                      </div>
                    )}

                    <Separator className="bg-border" />

                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase">Agent Model Mix</Label>
                      <div className="space-y-1 mt-1">
                        {crewMembers.map((m, i) => {
                          const info = getAgentInfo(m.agentId);
                          const modelInfo = getModelInfo(m.model);
                          return (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground truncate max-w-[100px]">{info?.name}</span>
                              <span className="text-muted-foreground">{modelInfo?.name || 'Unknown'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[hsl(var(--card))] border-teal-900/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-orbitron text-teal-800">Task Input</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      placeholder="Paste scan results, investigation data, or describe the scenario to analyze..."
                      className="bg-card/50 border-border text-white min-h-[200px] text-xs font-mono"
                      data-testid="task-input"
                    />
                    <Button
                      className="w-full bg-gradient-to-r from-amber-700 to-teal-700 hover:from-amber-600 hover:to-teal-600 text-black font-orbitron"
                      onClick={runCrew}
                      disabled={isRunning || !taskInput.trim()}
                      data-testid="run-crew-btn"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running {runningAgent}...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Crew ({crewMembers.length} agents)
                        </>
                      )}
                    </Button>
                    {isRunning && (
                      <div>
                        <Progress value={runProgress} className="h-1.5 bg-card" />
                        <p className="text-[10px] text-muted-foreground mt-1 text-center">{runningAgent} analyzing...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {currentResults.length === 0 && !isRunning ? (
              <Card className="bg-[hsl(var(--card))] border-border">
                <CardContent className="py-12 text-center">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No results yet. Build a crew and run it.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {isRunning && (
                  <Card className="bg-[hsl(var(--card))] border-amber-900/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-800" />
                        <div className="flex-1">
                          <p className="text-sm text-amber-800">{runningAgent} analyzing...</p>
                          <Progress value={runProgress} className="h-1 bg-card mt-1" />
                        </div>
                        <span className="text-xs text-muted-foreground">{Math.round(runProgress)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="bg-[hsl(var(--card))] border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-xl font-bold text-amber-800">{currentResults.length}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">Agents Run</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[hsl(var(--card))] border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-xl font-bold text-teal-800">
                        {(currentResults.reduce((s, r) => s + r.latencyMs, 0) / 1000).toFixed(1)}s
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">Total Time</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[hsl(var(--card))] border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-xl font-bold text-purple-700">
                        {currentResults.reduce((s, r) => s + (r.tokenUsage?.total || 0), 0).toLocaleString()}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">Tokens</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[hsl(var(--card))] border-border">
                    <CardContent className="p-3 text-center">
                      <p className="text-xl font-bold text-green-400">
                        ${currentResults.reduce((s, r) => s + r.costEstimate, 0).toFixed(3)}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase">Est. Cost</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {currentResults.map((result, idx) => {
                    const info = getAgentInfo(result.agentId);
                    const modelInfo = getModelInfo(result.model);
                    const Icon = info?.icon || Bot;
                    return (
                      <Card key={idx} className="bg-[hsl(var(--card))] border-border" data-testid={`result-card-${result.agentId}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-white flex items-center gap-2">
                              <Icon className="w-4 h-4 text-amber-800" />
                              {result.agentName}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">
                                {modelInfo?.name || 'Unknown'}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />
                                {(result.latencyMs / 1000).toFixed(1)}s
                              </Badge>
                              {result.costEstimate > 0 && (
                                <Badge variant="outline" className="text-[9px] border-green-700 text-green-400">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  ${result.costEstimate.toFixed(3)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64">
                            <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">{result.output}</pre>
                          </ScrollArea>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-white text-[10px] h-6"
                              onClick={() => { navigator.clipboard.writeText(result.output); toast({ title: 'Copied' }); }}>
                              <Copy className="w-3 h-3 mr-1" /> Copy
                            </Button>
                            {result.tokenUsage && (
                              <span className="text-[10px] text-muted-foreground ml-auto flex items-center">
                                {result.tokenUsage.prompt}p + {result.tokenUsage.completion}c = {result.tokenUsage.total} tokens
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {synthesisResult && (
                  <Card className="bg-[hsl(var(--card))] border-amber-900/40" data-testid="synthesis-result">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                          <Brain className="w-4 h-4" /> Synthesis Report
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] border-amber-700 text-amber-800">
                            {getModelInfo(synthesisResult.model)?.name}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {(synthesisResult.latencyMs / 1000).toFixed(1)}s
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-80">
                        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">{synthesisResult.output}</pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="eval" className="space-y-4">
            {evalHistory.length === 0 ? (
              <Card className="bg-[hsl(var(--card))] border-border">
                <CardContent className="py-12 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No eval runs yet. Run your crew to start collecting data.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Tip: Run the same task with different crew sizes to compare performance.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-[hsl(var(--card))] border-purple-900/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-orbitron text-purple-700 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Price vs Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {evalHistory.map((run, idx) => (
                        <div key={run.id} className="flex items-center gap-3 p-3 rounded border border-border bg-card/50" data-testid={`eval-run-${idx}`}>
                          <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-700 text-xs font-bold">
                            {run.crewSize}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-foreground">
                                {run.members.map(m => getAgentInfo(m.agentId)?.name || m.agentId).join(' + ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {(run.totalLatencyMs / 1000).toFixed(1)}s
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {run.totalTokens.toLocaleString()} tokens
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${run.totalCost.toFixed(3)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">{new Date(run.timestamp).toLocaleTimeString()}</p>
                            <div className="flex gap-1 mt-1">
                              {run.members.map((m, mi) => {
                                const mInfo = getModelInfo(m.model);
                                return (
                                  <Badge key={mi} variant="outline" className="text-[8px] border-border text-muted-foreground px-1">
                                    {mInfo?.name?.split(' ')[0] || '?'}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {evalHistory.length >= 2 && (
                  <Card className="bg-[hsl(var(--card))] border-amber-900/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-orbitron text-amber-800 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-2 text-[10px] text-muted-foreground uppercase border-b border-border pb-2">
                          <span>Run</span><span>Time</span><span>Tokens</span><span>Cost</span>
                        </div>
                        {evalHistory.slice(0, 10).map((run, idx) => {
                          const bestTime = Math.min(...evalHistory.map(r => r.totalLatencyMs));
                          const bestCost = Math.min(...evalHistory.map(r => r.totalCost));
                          return (
                            <div key={run.id} className="grid grid-cols-4 gap-2 text-xs items-center">
                              <span className="text-muted-foreground">{run.crewSize} agents</span>
                              <span className={run.totalLatencyMs === bestTime ? 'text-teal-800 font-bold' : 'text-muted-foreground'}>
                                {(run.totalLatencyMs / 1000).toFixed(1)}s
                              </span>
                              <span className="text-muted-foreground">{run.totalTokens.toLocaleString()}</span>
                              <span className={run.totalCost === bestCost ? 'text-green-400 font-bold' : 'text-muted-foreground'}>
                                ${run.totalCost.toFixed(3)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {modelPickerIdx !== null && (
        <ModelPickerPopup
          value={crewMembers[modelPickerIdx]?.model || ''}
          onChange={(id) => updateMember(modelPickerIdx, { model: id })}
          onClose={() => setModelPickerIdx(null)}
        />
      )}
    </div>
  );
}
