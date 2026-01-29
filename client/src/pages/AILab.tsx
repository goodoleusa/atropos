import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Zap, Cpu, Copy, Check, Brain, Target,
  Play, DollarSign, BarChart3, Clock, TrendingUp, Download, RefreshCw,
  AlertTriangle, Lightbulb, Eye, Send, Loader2, Shield, Bug, ChevronDown
} from 'lucide-react';
import { CAPABILITY_MODULES, buildSystemPrompt } from '@/config/agentPrompts';

type ModuleKey = keyof typeof CAPABILITY_MODULES;

interface ModelRun {
  id: string;
  timestamp: string;
  model: string;
  prompt: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
  taskCompletion: number;
  coherence: number;
  contextAwareness: number;
  modules: ModuleKey[];
}

interface SessionSummary {
  totalRuns: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  avgTaskCompletion: number;
  avgCoherence: number;
  avgContextAwareness: number;
  bestModel: string;
  worstModel: string;
  recommendations: string[];
  bugReports: string[];
}

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'openai/gpt-4o': { input: 0.0025, output: 0.01 },
  'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'anthropic/claude-sonnet-4': { input: 0.003, output: 0.015 },
  'moonshotai/kimi-k2.5': { input: 0.0, output: 0.0 },
  'nvidia/nemotron-3-nano-30b-a3b:free': { input: 0.0, output: 0.0 },
  'meta-llama/llama-3.3-70b-instruct:free': { input: 0.0, output: 0.0 },
  'google/gemini-2.0-flash-exp:free': { input: 0.0, output: 0.0 },
  'mistralai/codestral:free': { input: 0.0, output: 0.0 },
};

const MODELS = [
  { id: 'openai/gpt-4o', name: 'GPT-4o', tier: 'paid' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tier: 'paid' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', tier: 'paid' },
  { id: 'moonshotai/kimi-k2.5', name: 'Kimi K2.5', tier: 'free' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 30B', tier: 'free' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', tier: 'free' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', tier: 'free' },
  { id: 'mistralai/codestral:free', name: 'Codestral', tier: 'free' },
];

const TEST_SCENARIOS = [
  { id: 'recon', name: 'OSINT Recon', prompt: 'Enumerate the target domain sysadmin-corp.local and identify potential attack vectors.' },
  { id: 'crypto', name: 'Crypto Puzzle', prompt: 'Decode this cipher: Gur cnffjbeq vf OEBAMR_XRL' },
  { id: 'terminal', name: 'Terminal Task', prompt: 'What command would scan ports 1-1000 on target 192.168.1.1?' },
  { id: 'analysis', name: 'Threat Analysis', prompt: 'Analyze this suspicious IP: 185.234.72.x - what patterns suggest malicious activity?' },
];

const moduleDescriptions: Record<ModuleKey, { name: string; desc: string; icon: string }> = {
  payload_exec: { name: 'Payload Execution', desc: 'QR payloads', icon: '⚡' },
  terminal_cmds: { name: 'Terminal Commands', desc: 'Unix-like commands', icon: '💻' },
  clue_system: { name: 'Clue Tracking', desc: 'Clue management', icon: '🔍' },
  crypto_puzzles: { name: 'Crypto Puzzles', desc: 'Cipher decoding', icon: '🔐' },
  osint_recon: { name: 'OSINT Recon', desc: 'Reconnaissance', icon: '🎯' }
};

export default function AILab() {
  const [enabledModules, setEnabledModules] = useState<ModuleKey[]>(['payload_exec', 'terminal_cmds', 'osint_recon']);
  const [selectedModel, setSelectedModel] = useState('meta-llama/llama-3.3-70b-instruct:free');
  const [testPrompt, setTestPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<ModelRun[]>([]);
  const [copied, setCopied] = useState(false);
  const [taskCompletionRating, setTaskCompletionRating] = useState(50);
  const [coherenceRating, setCoherenceRating] = useState(50);
  const [contextRating, setContextRating] = useState(50);
  const [bugReport, setBugReport] = useState('');
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  const generatedPrompt = useMemo(() => {
    return buildSystemPrompt({ modules: enabledModules });
  }, [enabledModules]);

  const estimatedTokens = useMemo(() => {
    const systemTokens = Math.ceil(generatedPrompt.length / 4);
    const promptTokens = Math.ceil(testPrompt.length / 4);
    return { system: systemTokens, prompt: promptTokens, total: systemTokens + promptTokens };
  }, [generatedPrompt, testPrompt]);

  const calculateCost = (inputTokens: number, outputTokens: number, model: string) => {
    const pricing = MODEL_PRICING[model] || { input: 0, output: 0 };
    return (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;
  };

  const sessionSummary: SessionSummary = useMemo(() => {
    if (runs.length === 0) {
      return {
        totalRuns: 0, totalTokens: 0, totalCost: 0, avgLatency: 0,
        avgTaskCompletion: 0, avgCoherence: 0, avgContextAwareness: 0,
        bestModel: 'N/A', worstModel: 'N/A', recommendations: [], bugReports: []
      };
    }

    const totalTokens = runs.reduce((acc, r) => acc + r.totalTokens, 0);
    const totalCost = runs.reduce((acc, r) => acc + r.costUsd, 0);
    const avgLatency = runs.reduce((acc, r) => acc + r.latencyMs, 0) / runs.length;
    const avgTaskCompletion = runs.reduce((acc, r) => acc + r.taskCompletion, 0) / runs.length;
    const avgCoherence = runs.reduce((acc, r) => acc + r.coherence, 0) / runs.length;
    const avgContextAwareness = runs.reduce((acc, r) => acc + r.contextAwareness, 0) / runs.length;

    const modelPerformance: Record<string, number[]> = {};
    runs.forEach(r => {
      if (!modelPerformance[r.model]) modelPerformance[r.model] = [];
      modelPerformance[r.model].push((r.taskCompletion + r.coherence + r.contextAwareness) / 3);
    });

    const modelAvgs = Object.entries(modelPerformance).map(([model, scores]) => ({
      model, avg: scores.reduce((a, b) => a + b, 0) / scores.length
    })).sort((a, b) => b.avg - a.avg);

    const recommendations: string[] = [];
    if (avgTaskCompletion < 50) recommendations.push('Consider enabling more relevant modules for task completion');
    if (avgLatency > 5000) recommendations.push('Try faster models for better responsiveness');
    if (totalCost > 0.10) recommendations.push('Switch to free models for routine tasks');

    return {
      totalRuns: runs.length,
      totalTokens,
      totalCost,
      avgLatency,
      avgTaskCompletion,
      avgCoherence,
      avgContextAwareness,
      bestModel: modelAvgs[0]?.model || 'N/A',
      worstModel: modelAvgs[modelAvgs.length - 1]?.model || 'N/A',
      recommendations,
      bugReports: runs.filter(r => r.taskCompletion < 30).map(r => `Low completion on ${r.model}: "${r.prompt.substring(0, 50)}..."`)
    };
  }, [runs]);

  const toggleModule = (mod: ModuleKey) => {
    setEnabledModules(prev => 
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const runTest = async () => {
    if (!testPrompt.trim()) {
      toast({ title: 'Enter a test prompt', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: generatedPrompt },
            { role: 'user', content: testPrompt }
          ]
        })
      });

      const data = await res.json();
      const latencyMs = Date.now() - startTime;
      const responseText = data.content || data.message || JSON.stringify(data);
      setResponse(responseText);

      const inputTokens = estimatedTokens.total;
      const outputTokens = Math.ceil(responseText.length / 4);
      const costUsd = calculateCost(inputTokens, outputTokens, selectedModel);

      const newRun: ModelRun = {
        id: `run-${Date.now()}`,
        timestamp: new Date().toISOString(),
        model: selectedModel,
        prompt: testPrompt,
        response: responseText,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        costUsd,
        latencyMs,
        taskCompletion: taskCompletionRating,
        coherence: coherenceRating,
        contextAwareness: contextRating,
        modules: [...enabledModules]
      };

      setRuns(prev => [...prev, newRun]);
      toast({ title: 'Test completed', description: `Cost: $${costUsd.toFixed(4)} | Latency: ${latencyMs}ms` });
    } catch (err) {
      setResponse(`Error: ${err}`);
      toast({ title: 'Test failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const exportSessionReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: sessionSummary,
      runs: runs,
      recommendations: sessionSummary.recommendations,
      bugReports: sessionSummary.bugReports
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-lab-session-${Date.now()}.json`;
    a.click();
    toast({ title: 'Report exported' });
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0500] via-[#1a0a00] to-[#0a0500] text-stone-300">
      <div className="sticky top-0 z-40 bg-[#0a0500]/95 backdrop-blur border-b border-amber-900/30 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="text-amber-600 hover:text-amber-500 min-h-[44px]" data-testid="back-button">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-orbitron text-amber-500 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Lab
          </h1>
          <Button onClick={exportSessionReport} variant="outline" className="border-amber-800 text-amber-400 min-h-[44px]">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 pb-24">
        
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-black/50 border-amber-900/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{sessionSummary.totalRuns}</div>
              <div className="text-xs text-stone-500">Runs</div>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-teal-900/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-400">{sessionSummary.totalTokens.toLocaleString()}</div>
              <div className="text-xs text-stone-500">Tokens</div>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-green-900/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">${sessionSummary.totalCost.toFixed(4)}</div>
              <div className="text-xs text-stone-500">Cost</div>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-purple-900/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{sessionSummary.avgLatency.toFixed(0)}ms</div>
              <div className="text-xs text-stone-500">Avg Latency</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/50 border-amber-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-500 text-base flex items-center gap-2">
              <Cpu className="w-5 h-5" /> Module Selection
            </CardTitle>
            <CardDescription className="text-stone-500 text-sm">
              Tap to enable/disable capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(CAPABILITY_MODULES) as ModuleKey[]).map((mod) => (
                <button
                  key={mod}
                  onClick={() => toggleModule(mod)}
                  className={`p-4 rounded-lg border-2 transition-all text-left min-h-[60px] active:scale-[0.98] ${
                    enabledModules.includes(mod) 
                      ? 'border-amber-600 bg-amber-900/20' 
                      : 'border-stone-800 bg-stone-900/20'
                  }`}
                  data-testid={`module-${mod}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{moduleDescriptions[mod].icon}</span>
                    <div className="flex-1">
                      <p className={`font-bold ${enabledModules.includes(mod) ? 'text-amber-400' : 'text-stone-400'}`}>
                        {moduleDescriptions[mod].name}
                      </p>
                      <p className="text-xs text-stone-600">{moduleDescriptions[mod].desc}</p>
                    </div>
                    {enabledModules.includes(mod) && (
                      <Badge className="bg-amber-700 text-black">ON</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowPromptPreview(!showPromptPreview)}
              className="w-full p-3 rounded border border-stone-700 text-stone-400 text-sm flex items-center justify-between min-h-[48px]"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview System Prompt (~{estimatedTokens.system} tokens)
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPromptPreview ? 'rotate-180' : ''}`} />
            </button>

            {showPromptPreview && (
              <div className="relative">
                <pre className="text-xs text-stone-400 whitespace-pre-wrap font-mono bg-black/50 p-4 rounded border border-stone-800 max-h-64 overflow-y-auto">
                  {generatedPrompt}
                </pre>
                <Button size="sm" variant="ghost" onClick={copyPrompt} className="absolute top-2 right-2 min-h-[44px] min-w-[44px]">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-amber-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-500 text-base flex items-center gap-2">
              <Play className="w-5 h-5" /> Test Arena
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-stone-400 mb-2 block">Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-black/50 border-stone-700 min-h-[48px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-700">
                  {MODELS.map(m => (
                    <SelectItem key={m.id} value={m.id} className="min-h-[44px]">
                      <span className="flex items-center gap-2">
                        {m.name}
                        <Badge variant="outline" className={`text-[10px] ${m.tier === 'free' ? 'border-green-600 text-green-400' : 'border-amber-600 text-amber-400'}`}>
                          {m.tier.toUpperCase()}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-stone-400 mb-2 block">Quick Scenarios</label>
              <div className="flex flex-wrap gap-2">
                {TEST_SCENARIOS.map(s => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant="outline"
                    onClick={() => setTestPrompt(s.prompt)}
                    className="text-xs min-h-[44px] border-stone-700 text-stone-400"
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-stone-400 mb-2 block">Test Prompt</label>
              <Textarea
                value={testPrompt}
                onChange={e => setTestPrompt(e.target.value)}
                className="min-h-[100px] text-base bg-black/50 border-stone-700"
                placeholder="Enter your test prompt..."
              />
              <div className="text-xs text-stone-600 mt-1">
                ~{estimatedTokens.prompt} prompt + {estimatedTokens.system} system = {estimatedTokens.total} total
              </div>
            </div>

            <Button
              onClick={runTest}
              disabled={loading}
              className="w-full min-h-[52px] bg-amber-700 hover:bg-amber-600 text-black text-base font-bold"
              data-testid="run-test"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Running...</>
              ) : (
                <><Send className="w-5 h-5 mr-2" /> Run Test</>
              )}
            </Button>
          </CardContent>
        </Card>

        {response && (
          <Card className="bg-black/50 border-teal-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-teal-500 text-base">Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="text-sm text-stone-300 whitespace-pre-wrap font-mono bg-black/50 p-4 rounded border border-stone-800 max-h-64 overflow-y-auto">
                {response}
              </pre>

              <div className="space-y-4 pt-4 border-t border-stone-800">
                <p className="text-sm text-stone-400 font-bold">Rate this response:</p>
                <div>
                  <div className="flex justify-between text-sm text-stone-400 mb-2">
                    <span>Task Completion</span>
                    <span className="text-amber-400">{taskCompletionRating}%</span>
                  </div>
                  <Slider
                    value={[taskCompletionRating]}
                    onValueChange={v => setTaskCompletionRating(v[0])}
                    max={100}
                    className="[&_[role=slider]]:bg-amber-500 [&_[role=slider]]:w-6 [&_[role=slider]]:h-6"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-stone-400 mb-2">
                    <span>Coherence</span>
                    <span className="text-teal-400">{coherenceRating}%</span>
                  </div>
                  <Slider
                    value={[coherenceRating]}
                    onValueChange={v => setCoherenceRating(v[0])}
                    max={100}
                    className="[&_[role=slider]]:bg-teal-500 [&_[role=slider]]:w-6 [&_[role=slider]]:h-6"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-stone-400 mb-2">
                    <span>Context Awareness</span>
                    <span className="text-purple-400">{contextRating}%</span>
                  </div>
                  <Slider
                    value={[contextRating]}
                    onValueChange={v => setContextRating(v[0])}
                    max={100}
                    className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:w-6 [&_[role=slider]]:h-6"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {runs.length > 0 && (
          <Card className="bg-black/50 border-amber-900/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-500 text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" /> Run History ({runs.length})
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setRuns([])} className="text-red-400 min-h-[44px]">
                  <RefreshCw className="w-4 h-4 mr-1" /> Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {runs.slice(-5).reverse().map((run, i) => (
                  <div key={run.id} className="p-4 bg-stone-900/30 rounded-lg border border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="border-amber-600 text-amber-400">
                        #{runs.length - i}
                      </Badge>
                      <span className="text-xs text-stone-400">{run.model.split('/')[1]}</span>
                    </div>
                    <p className="text-sm text-stone-500 mb-2 line-clamp-2">{run.prompt}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="text-green-400">${run.costUsd.toFixed(4)}</span>
                      <span className="text-purple-400">{run.latencyMs}ms</span>
                      <span className="text-teal-400">{run.totalTokens} tok</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge className={`text-[10px] ${run.taskCompletion > 70 ? 'bg-green-900' : run.taskCompletion > 40 ? 'bg-amber-900' : 'bg-red-900'}`}>
                        Task: {run.taskCompletion}%
                      </Badge>
                      <Badge className={`text-[10px] ${run.coherence > 70 ? 'bg-green-900' : run.coherence > 40 ? 'bg-amber-900' : 'bg-red-900'}`}>
                        Coherence: {run.coherence}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {sessionSummary.recommendations.length > 0 && (
          <Card className="bg-black/50 border-amber-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-500 text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5" /> Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {sessionSummary.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-stone-300 p-3 bg-stone-900/30 rounded">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="bg-black/50 border-red-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-500 text-base flex items-center gap-2">
              <Bug className="w-5 h-5" /> Report Issue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={bugReport}
              onChange={e => setBugReport(e.target.value)}
              className="min-h-[80px] text-base bg-black/50 border-stone-700"
              placeholder="Describe any bugs or issues..."
            />
            <Button
              onClick={() => {
                if (bugReport.trim()) {
                  toast({ title: 'Bug reported', description: 'Thank you for your feedback!' });
                  setBugReport('');
                }
              }}
              className="w-full min-h-[48px] bg-red-700 hover:bg-red-600"
            >
              <Bug className="w-4 h-4 mr-2" /> Submit Report
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
