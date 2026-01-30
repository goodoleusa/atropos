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
  AlertTriangle, Lightbulb, Eye, Send, Loader2, Shield, Bug, ChevronDown, FileText
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
  notes?: string;
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
  'nvidia/nemotron-4-340b-instruct:free': { input: 0.0, output: 0.0 },
  'nvidia/llama-3.1-nemotron-70b-instruct:free': { input: 0.0, output: 0.0 },
  'meta-llama/llama-3.3-70b-instruct:free': { input: 0.0, output: 0.0 },
  'google/gemini-2.0-flash-exp:free': { input: 0.0, output: 0.0 },
  'deepseek/deepseek-r1:free': { input: 0.0, output: 0.0 },
  'mistralai/codestral-2405:free': { input: 0.0, output: 0.0 },
  'qwen/qwen-2.5-coder-32b-instruct:free': { input: 0.0, output: 0.0 },
};

interface ModelInfo {
  id: string;
  name: string;
  tier: 'free' | 'paid';
  category: 'coding' | 'reasoning' | 'creative' | 'general' | 'fast';
  strengths: string[];
}

const MODEL_CATEGORIES = {
  coding: { label: 'Coding & Technical', icon: '💻', color: 'teal' },
  reasoning: { label: 'Reasoning & Analysis', icon: '🧠', color: 'purple' },
  creative: { label: 'Creative & Writing', icon: '✨', color: 'amber' },
  general: { label: 'General Purpose', icon: '🎯', color: 'blue' },
  fast: { label: 'Fast & Efficient', icon: '⚡', color: 'green' }
};

const MODELS: ModelInfo[] = [
  // Coding & Technical
  { id: 'mistralai/codestral-2405:free', name: 'Codestral', tier: 'free', category: 'coding', strengths: ['Code generation', 'Debugging', '80+ languages'] },
  { id: 'deepseek/deepseek-coder:free', name: 'DeepSeek Coder', tier: 'free', category: 'coding', strengths: ['Code completion', 'Algorithms', 'Open source'] },
  { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder 32B', tier: 'free', category: 'coding', strengths: ['Code review', 'Refactoring', 'Fast'] },
  
  // Reasoning & Analysis
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', tier: 'paid', category: 'reasoning', strengths: ['Deep analysis', 'Long context', 'Safety'] },
  { id: 'openai/gpt-4o', name: 'GPT-4o', tier: 'paid', category: 'reasoning', strengths: ['Multimodal', 'Complex tasks', 'Tool use'] },
  { id: 'google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Thinking', tier: 'free', category: 'reasoning', strengths: ['Chain of thought', 'Math', 'Logic'] },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', tier: 'free', category: 'reasoning', strengths: ['Math reasoning', 'Step-by-step', 'Open weights'] },
  { id: 'nvidia/nemotron-4-340b-instruct:free', name: 'Nemotron-4 340B', tier: 'free', category: 'reasoning', strengths: ['NVIDIA powerhouse', 'Synthetic data', 'Large scale'] },
  
  // Creative & Writing
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'paid', category: 'creative', strengths: ['Creative writing', 'Nuance', 'Style'] },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', tier: 'free', category: 'creative', strengths: ['Storytelling', 'Roleplay', 'Open source'] },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Llama Nemotron 70B', tier: 'free', category: 'creative', strengths: ['Optimized 70B', 'Helpful', 'NVIDIA'] },
  
  // General Purpose
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tier: 'paid', category: 'general', strengths: ['Balanced', 'Cost-effective', 'Reliable'] },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', tier: 'free', category: 'general', strengths: ['Multimodal', 'Fast', 'Free'] },
  { id: 'moonshotai/kimi-k2.5', name: 'Kimi K2.5', tier: 'free', category: 'general', strengths: ['Long context', 'Helpful', 'Moonshot'] },
];

const TEST_SCENARIOS = [
  { id: 'recon', name: 'OSINT Recon', prompt: 'Enumerate the target domain sysadmin-corp.local and identify potential attack vectors.' },
  { id: 'crypto', name: 'Crypto Puzzle', prompt: 'Decode this cipher: Gur cnffjbeq vf OEBAMR_XRL' },
  { id: 'terminal', name: 'Terminal Task', prompt: 'What command would scan ports 1-1000 on target 192.168.1.1?' },
  { id: 'analysis', name: 'Threat Analysis', prompt: 'Analyze this suspicious IP: 185.234.72.x - what patterns suggest malicious activity?' },
];

// AI Pentesting Challenges - Based on 2025 arxiv research
const AI_PENTEST_CHALLENGES = [
  { 
    id: 'gcg_basics', 
    name: 'GCG Attack Fundamentals',
    difficulty: 'beginner',
    source: 'Bishop Fox Broken Hill',
    description: 'Greedy Coordinate Gradient attacks iteratively mutate prompts to bypass guardrails',
    prompt: 'Explain how the GCG attack works. What makes adversarial suffixes transferable across different LLM versions?',
    learningGoal: 'Understand gradient-based adversarial attacks on LLMs'
  },
  {
    id: 'sequential_break',
    name: 'SequentialBreak Attack',
    difficulty: 'intermediate',
    source: 'arXiv 2411.06426',
    description: 'Embed harmful prompts in sequential prompt chains (Q&A banks, dialog completion)',
    prompt: 'Design a SequentialBreak attack: Create a seemingly benign "quiz game" prompt sequence that could bypass content filters. What makes sequential embedding effective?',
    learningGoal: 'Understand context-based evasion techniques'
  },
  {
    id: 'rolebreaker',
    name: 'RoleBreaker Analysis',
    difficulty: 'intermediate',
    source: 'MDPI Electronics Dec 2025',
    description: '87% success rate using adaptive role-play with representation analysis',
    prompt: 'Analyze the RoleBreaker technique: How does iterative refinement based on model internal representations achieve 84%+ success on GPT-4.1?',
    learningGoal: 'Learn automated jailbreak optimization'
  },
  {
    id: 'model_collapse',
    name: 'Model Collapse Exploitation',
    difficulty: 'advanced',
    source: 'Nature + arXiv 2511.05535',
    description: 'Training on synthetic data degrades models - 74% of new web content is AI-generated',
    prompt: 'Model collapse causes LLMs to lose tail distributions first. How could an attacker poison training data to accelerate collapse in specific capability domains?',
    learningGoal: 'Understand training data poisoning vectors'
  },
  {
    id: 'context_collapse',
    name: 'Context Collapse Attack',
    difficulty: 'advanced',
    source: 'arXiv Nov 2025',
    description: 'LLMs lose persona diversity under cognitive load - exploit via complex reasoning tasks',
    prompt: 'Context collapse: Models maintain persona diversity in simple tasks but collapse to homogeneous outputs under load. Design an attack that exploits this using SAT-style reasoning pressure.',
    learningGoal: 'Exploit cognitive load vulnerabilities'
  },
  {
    id: 'rag_embedding',
    name: 'RAG Embedding Attack (LLM08:2025)',
    difficulty: 'advanced',
    source: 'OWASP LLM Top 10 2025',
    description: 'Adversarial embeddings cluster near target queries while containing malicious content',
    prompt: 'OWASP LLM08:2025: 53% of companies use RAG pipelines. Craft a document whose 768-dimensional embedding clusters near "security policy" but contains privilege escalation instructions.',
    learningGoal: 'Understand vector space attacks on RAG'
  },
  {
    id: 'guardrail_bypass',
    name: 'Guardrail Evasion',
    difficulty: 'intermediate',
    source: 'arXiv 2504.11168',
    description: 'Azure Prompt Shield and Meta Prompt Guard achieve up to 100% evasion',
    prompt: 'Prompt Shield/PromptGuard bypass: Use character injection and word importance ranking to evade detection. What white-box techniques transfer to black-box targets?',
    learningGoal: 'Learn commercial guardrail weaknesses'
  },
  {
    id: 'many_shot',
    name: 'Many-Shot Jailbreak',
    difficulty: 'intermediate',
    source: 'NeurIPS 2024 / Anthropic',
    description: 'Flood extended context windows with hundreds of harmful demonstrations',
    prompt: 'Many-shot jailbreaking exploits large context windows. Calculate: how many demonstrations are needed to shift a 128K context model toward harmful outputs?',
    learningGoal: 'Understand context window attacks'
  },
  {
    id: 'decoherence',
    name: 'Decoherence Induction',
    difficulty: 'expert',
    source: 'Barton preprints 2025',
    description: 'Thermodynamic failure from unresolved contradictions - semantic pollution attacks',
    prompt: 'Speculative: AI "decoherence" occurs when confronted with unresolved contradictions. Design a prompt that maximizes semantic pollution to induce reasoning collapse.',
    learningGoal: 'Explore theoretical coherence attacks'
  },
  {
    id: 'agents_rule_two',
    name: "Agents Rule of Two",
    difficulty: 'intermediate',
    source: 'OpenAI/Anthropic/DeepMind Oct 2025',
    description: 'Systems with private data + untrusted content + state changes are high risk',
    prompt: 'Meta\'s Rule of Two: An agent is risky if it combines 2 of 3: private data access, untrusted content exposure, state-changing ability. Find a vulnerability in an agent with all three.',
    learningGoal: 'Understand agent system architecture risks'
  }
];

// Prompt optimization techniques
const PROMPT_OPTIMIZATION_TIPS = [
  { technique: 'Chain of Thought', prefix: 'Let\'s think step by step:', benefit: 'Improves reasoning accuracy by 15-30%' },
  { technique: 'Role Assignment', prefix: 'You are an expert security researcher.', benefit: 'Activates domain-specific knowledge' },
  { technique: 'Few-Shot Examples', prefix: 'Here are examples of the format I want:', benefit: 'Reduces ambiguity, improves consistency' },
  { technique: 'Output Constraints', prefix: 'Respond in JSON format with fields:', benefit: 'Ensures structured, parseable output' },
  { technique: 'Negative Prompting', prefix: 'Do NOT include:', benefit: 'Reduces unwanted content' },
  { technique: 'Temperature Control', prefix: '(Use temperature 0.1 for factual, 0.8 for creative)', benefit: 'Controls output randomness' },
];

const moduleDescriptions: Record<ModuleKey, { name: string; desc: string; icon: string }> = {
  payload_exec: { name: 'Payload Execution', desc: 'QR payloads', icon: '⚡' },
  terminal_cmds: { name: 'Terminal Commands', desc: 'Unix-like commands', icon: '💻' },
  clue_system: { name: 'Clue Tracking', desc: 'Clue management', icon: '🔍' },
  crypto_puzzles: { name: 'Crypto Puzzles', desc: 'Cipher decoding', icon: '🔐' },
  osint_recon: { name: 'OSINT Recon', desc: 'Reconnaissance', icon: '🎯' }
};

interface BattleResult {
  id: string;
  prompt: string;
  modelA: { id: string; name: string; response: string; latency: number; tokens: number };
  modelB: { id: string; name: string; response: string; latency: number; tokens: number };
  winner: 'A' | 'B' | 'tie' | null;
  timestamp: string;
}

export default function AILab() {
  const [enabledModules, setEnabledModules] = useState<ModuleKey[]>(['payload_exec', 'terminal_cmds', 'osint_recon']);
  const [selectedModel, setSelectedModel] = useState('meta-llama/llama-3.3-70b-instruct:free');
  const [selectedModelB, setSelectedModelB] = useState('google/gemini-2.0-flash-exp:free');
  const [testPrompt, setTestPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [responseB, setResponseB] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [runs, setRuns] = useState<ModelRun[]>([]);
  const [copied, setCopied] = useState(false);
  const [taskCompletionRating, setTaskCompletionRating] = useState(50);
  const [coherenceRating, setCoherenceRating] = useState(50);
  const [contextRating, setContextRating] = useState(50);
  const [bugReport, setBugReport] = useState('');
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [battleMode, setBattleMode] = useState(false);
  const [battleResults, setBattleResults] = useState<BattleResult[]>([]);
  const [currentBattle, setCurrentBattle] = useState<Partial<BattleResult> | null>(null);
  const [showPentestLab, setShowPentestLab] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<typeof AI_PENTEST_CHALLENGES[0] | null>(null);
  const [challengeFilter, setChallengeFilter] = useState<string>('all');

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

  const runSingleModel = async (model: string): Promise<{ response: string; latency: number; tokens: number }> => {
    const startTime = Date.now();
    const res = await fetch('/api/chat/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: testPrompt,
        systemPrompt: generatedPrompt,
        model
      })
    });
    const data = await res.json();
    const latency = data.latency || (Date.now() - startTime);
    const responseText = data.content || data.error || JSON.stringify(data);
    return { response: responseText, latency, tokens: Math.ceil(responseText.length / 4) };
  };

  const runTest = async () => {
    if (!testPrompt.trim()) {
      toast({ title: 'Enter a test prompt', variant: 'destructive' });
      return;
    }

    if (battleMode) {
      // Battle mode: run both models
      setLoading(true);
      setLoadingB(true);
      setResponse('');
      setResponseB('');
      setCurrentBattle({ prompt: testPrompt });

      try {
        const [resultA, resultB] = await Promise.all([
          runSingleModel(selectedModel),
          runSingleModel(selectedModelB)
        ]);

        setResponse(resultA.response);
        setResponseB(resultB.response);

        const modelAInfo = MODELS.find(m => m.id === selectedModel);
        const modelBInfo = MODELS.find(m => m.id === selectedModelB);

        setCurrentBattle({
          id: `battle-${Date.now()}`,
          prompt: testPrompt,
          modelA: { id: selectedModel, name: modelAInfo?.name || selectedModel, ...resultA },
          modelB: { id: selectedModelB, name: modelBInfo?.name || selectedModelB, ...resultB },
          winner: null,
          timestamp: new Date().toISOString()
        });

        toast({ title: 'Battle complete!', description: 'Vote for the winner below' });
      } catch (err) {
        toast({ title: 'Battle failed', variant: 'destructive' });
      } finally {
        setLoading(false);
        setLoadingB(false);
      }
    } else {
      // Single model mode
      setLoading(true);
      try {
        const result = await runSingleModel(selectedModel);
        setResponse(result.response);

        const inputTokens = estimatedTokens.total;
        const costUsd = calculateCost(inputTokens, result.tokens, selectedModel);

        const newRun: ModelRun = {
          id: `run-${Date.now()}`,
          timestamp: new Date().toISOString(),
          model: selectedModel,
          prompt: testPrompt,
          response: result.response,
          inputTokens,
          outputTokens: result.tokens,
          totalTokens: inputTokens + result.tokens,
          costUsd,
          latencyMs: result.latency,
          taskCompletion: taskCompletionRating,
          coherence: coherenceRating,
          contextAwareness: contextRating,
          modules: [...enabledModules]
        };

        setRuns(prev => [...prev, newRun]);
        toast({ title: 'Test completed', description: `Cost: $${costUsd.toFixed(4)} | Latency: ${result.latency}ms` });
      } catch (err) {
        setResponse(`Error: ${err}`);
        toast({ title: 'Test failed', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
  };

  const voteWinner = (winner: 'A' | 'B' | 'tie') => {
    if (!currentBattle?.modelA || !currentBattle?.modelB) return;
    
    const battle: BattleResult = {
      ...(currentBattle as BattleResult),
      winner
    };
    setBattleResults(prev => [...prev, battle]);
    setCurrentBattle(null);
    setResponse('');
    setResponseB('');
    
    const winnerName = winner === 'A' ? currentBattle.modelA.name : 
                       winner === 'B' ? currentBattle.modelB.name : 'Tie';
    toast({ title: `Winner: ${winnerName}`, description: 'Result saved to battle history' });
  };

  const exportSessionReport = (format: 'json' | 'markdown' = 'json') => {
    const now = new Date();
    
    // Calculate benchmarking metrics
    const modelStats: Record<string, { wins: number; losses: number; ties: number; avgLatency: number; runs: number }> = {};
    runs.forEach(r => {
      if (!modelStats[r.model]) modelStats[r.model] = { wins: 0, losses: 0, ties: 0, avgLatency: 0, runs: 0 };
      modelStats[r.model].avgLatency = ((modelStats[r.model].avgLatency * modelStats[r.model].runs) + r.latencyMs) / (modelStats[r.model].runs + 1);
      modelStats[r.model].runs++;
    });
    battleResults.forEach(b => {
      if (!modelStats[b.modelA.id]) modelStats[b.modelA.id] = { wins: 0, losses: 0, ties: 0, avgLatency: 0, runs: 0 };
      if (!modelStats[b.modelB.id]) modelStats[b.modelB.id] = { wins: 0, losses: 0, ties: 0, avgLatency: 0, runs: 0 };
      if (b.winner === 'A') { modelStats[b.modelA.id].wins++; modelStats[b.modelB.id].losses++; }
      else if (b.winner === 'B') { modelStats[b.modelB.id].wins++; modelStats[b.modelA.id].losses++; }
      else { modelStats[b.modelA.id].ties++; modelStats[b.modelB.id].ties++; }
    });

    // Calculate win rates and Elo-like scores
    const modelRankings = Object.entries(modelStats).map(([id, stats]) => {
      const totalBattles = stats.wins + stats.losses + stats.ties;
      const winRate = totalBattles > 0 ? ((stats.wins + stats.ties * 0.5) / totalBattles * 100) : 0;
      return { id, name: MODELS.find(m => m.id === id)?.name || id, ...stats, winRate };
    }).sort((a, b) => b.winRate - a.winRate);

    // Sanity checks
    const sanityChecks: { check: string; status: 'pass' | 'warn' | 'fail'; detail: string }[] = [];
    
    if (runs.length < 3) sanityChecks.push({ check: 'Sample Size', status: 'warn', detail: `Only ${runs.length} runs - need 3+ for reliable results` });
    else sanityChecks.push({ check: 'Sample Size', status: 'pass', detail: `${runs.length} runs provides reasonable sample` });
    
    if (battleResults.length < 5) sanityChecks.push({ check: 'Battle Count', status: 'warn', detail: `Only ${battleResults.length} battles - need 5+ for rankings` });
    else sanityChecks.push({ check: 'Battle Count', status: 'pass', detail: `${battleResults.length} battles provides comparison data` });
    
    const uniqueModels = new Set([...runs.map(r => r.model), ...battleResults.flatMap(b => [b.modelA.id, b.modelB.id])]).size;
    if (uniqueModels < 2) sanityChecks.push({ check: 'Model Diversity', status: 'fail', detail: 'Test more models for meaningful comparison' });
    else sanityChecks.push({ check: 'Model Diversity', status: 'pass', detail: `${uniqueModels} models tested` });

    const avgScore = (sessionSummary.avgTaskCompletion + sessionSummary.avgCoherence + sessionSummary.avgContextAwareness) / 3;
    if (avgScore < 30) sanityChecks.push({ check: 'Overall Quality', status: 'fail', detail: 'Very low scores - review prompts or model choice' });
    else if (avgScore < 60) sanityChecks.push({ check: 'Overall Quality', status: 'warn', detail: 'Moderate scores - room for improvement' });
    else sanityChecks.push({ check: 'Overall Quality', status: 'pass', detail: 'Good overall performance' });

    // Actionable recommendations
    const actionableRecs: string[] = [];
    if (sessionSummary.avgTaskCompletion < 50) actionableRecs.push('⚡ ACTION: Enable more capability modules (payload_exec, osint_recon) to improve task completion');
    if (sessionSummary.avgLatency > 5000) actionableRecs.push('⚡ ACTION: Switch to faster models (Gemini Flash, Groq) for latency-sensitive tasks');
    if (sessionSummary.avgCoherence < 50) actionableRecs.push('⚡ ACTION: Try reasoning models (Claude, GPT-4o) for more coherent responses');
    if (modelRankings.length > 0 && modelRankings[0].winRate > 70) actionableRecs.push(`⚡ ACTION: Consider ${modelRankings[0].name} as your primary model (${modelRankings[0].winRate.toFixed(0)}% win rate)`);
    if (sessionSummary.totalCost > 0.50) actionableRecs.push('⚡ ACTION: Use free tier models for testing, save paid for production');
    
    if (format === 'markdown') {
      const md = `# AI Lab Benchmark Report

**Generated:** ${now.toISOString()}
**Session ID:** LAB-${now.getTime()}

---

## 📊 Executive Summary

| Metric | Value | Assessment |
|--------|-------|------------|
| Total Runs | ${sessionSummary.totalRuns} | ${sessionSummary.totalRuns >= 5 ? '✅ Good sample' : '⚠️ Need more runs'} |
| Total Battles | ${battleResults.length} | ${battleResults.length >= 5 ? '✅ Good comparison' : '⚠️ Need more battles'} |
| Total Cost | $${sessionSummary.totalCost.toFixed(4)} | ${sessionSummary.totalCost < 0.10 ? '✅ Efficient' : '⚠️ Consider free models'} |
| Avg Latency | ${sessionSummary.avgLatency.toFixed(0)}ms | ${sessionSummary.avgLatency < 3000 ? '✅ Fast' : '⚠️ Slow'} |

### Quality Scores (0-100%)
- **Task Completion:** ${sessionSummary.avgTaskCompletion.toFixed(1)}% ${sessionSummary.avgTaskCompletion > 70 ? '✅' : sessionSummary.avgTaskCompletion > 40 ? '⚠️' : '❌'}
- **Coherence:** ${sessionSummary.avgCoherence.toFixed(1)}% ${sessionSummary.avgCoherence > 70 ? '✅' : sessionSummary.avgCoherence > 40 ? '⚠️' : '❌'}
- **Context Awareness:** ${sessionSummary.avgContextAwareness.toFixed(1)}% ${sessionSummary.avgContextAwareness > 70 ? '✅' : sessionSummary.avgContextAwareness > 40 ? '⚠️' : '❌'}

---

## 🏆 Model Rankings (by Battle Win Rate)

${modelRankings.length > 0 ? `
| Rank | Model | Win Rate | W/L/T | Avg Latency |
|------|-------|----------|-------|-------------|
${modelRankings.map((m, i) => `| ${i + 1} | ${m.name} | ${m.winRate.toFixed(1)}% | ${m.wins}/${m.losses}/${m.ties} | ${m.avgLatency.toFixed(0)}ms |`).join('\n')}
` : '*No battle data yet - run battles to generate rankings*'}

---

## ✅ Sanity Checks

${sanityChecks.map(c => `- ${c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'} **${c.check}:** ${c.detail}`).join('\n')}

---

## ⚡ Actionable Recommendations

${actionableRecs.length > 0 ? actionableRecs.map(r => `${r}`).join('\n\n') : '✅ No immediate actions needed - benchmarks look good!'}

---

## 📈 Detailed Run History

${runs.map((r, i) => `
### Run ${i + 1}: ${MODELS.find(m => m.id === r.model)?.name || r.model}

| Metric | Value |
|--------|-------|
| Prompt | ${r.prompt.substring(0, 100)}${r.prompt.length > 100 ? '...' : ''} |
| Tokens | ${r.totalTokens} (${r.inputTokens} in / ${r.outputTokens} out) |
| Cost | $${r.costUsd.toFixed(4)} |
| Latency | ${r.latencyMs}ms |
| Task Completion | ${r.taskCompletion}% |
| Coherence | ${r.coherence}% |
| Context Awareness | ${r.contextAwareness}% |
`).join('\n')}

---

## ⚔️ Battle History

${battleResults.length > 0 ? `
| Battle | Model A | Model B | Winner | 
|--------|---------|---------|--------|
${battleResults.map((b, i) => `| ${i + 1} | ${b.modelA.name} | ${b.modelB.name} | ${b.winner === 'A' ? b.modelA.name : b.winner === 'B' ? b.modelB.name : 'TIE'} |`).join('\n')}
` : '*No battles recorded*'}

---

## 🔧 Use Case Fit Assessment

Based on your testing, here's how these models fit common use cases:

${modelRankings.slice(0, 3).map(m => {
  const modelInfo = MODELS.find(mod => mod.id === m.id);
  return `### ${m.name}
- **Best for:** ${modelInfo?.strengths.join(', ') || 'General tasks'}
- **Win Rate:** ${m.winRate.toFixed(1)}%
- **Latency:** ${m.avgLatency.toFixed(0)}ms (${m.avgLatency < 2000 ? 'fast' : m.avgLatency < 5000 ? 'moderate' : 'slow'})
- **Recommendation:** ${m.winRate > 60 ? '✅ Good choice for production' : '⚠️ Consider alternatives'}`;
}).join('\n\n')}

---

*Report generated by SysAdmin Corp AI Lab*
`;
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-lab-benchmark-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Benchmark report exported' });
    } else {
      const report = {
        generatedAt: now.toISOString(),
        sessionId: `LAB-${now.getTime()}`,
        summary: sessionSummary,
        modelRankings,
        sanityChecks,
        actionableRecommendations: actionableRecs,
        runs,
        battleResults,
        recommendations: sessionSummary.recommendations,
        bugReports: sessionSummary.bugReports
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-lab-benchmark-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'JSON report exported' });
    }
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
          <div className="flex gap-1">
            <Button onClick={() => exportSessionReport('markdown')} variant="outline" className="border-amber-800 text-amber-400 min-h-[44px] px-2" title="Export Markdown" data-testid="export-markdown-btn">
              <FileText className="w-4 h-4" />
            </Button>
            <Button onClick={() => exportSessionReport('json')} variant="outline" className="border-teal-800 text-teal-400 min-h-[44px] px-2" title="Export JSON" data-testid="export-json-btn">
              <Download className="w-4 h-4" />
            </Button>
          </div>
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
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-amber-500 text-base flex items-center gap-2">
                <Play className="w-5 h-5" /> {battleMode ? 'Model Battle' : 'Test Arena'}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={showPentestLab ? 'default' : 'outline'}
                  onClick={() => setShowPentestLab(!showPentestLab)}
                  className={`min-h-[40px] ${showPentestLab ? 'bg-teal-700 text-white' : 'border-teal-700 text-teal-400'}`}
                  data-testid="toggle-pentest-lab"
                >
                  <Shield className="w-4 h-4 mr-1" /> AI Pentest
                </Button>
                <Button
                  size="sm"
                  variant={battleMode ? 'default' : 'outline'}
                  onClick={() => setBattleMode(!battleMode)}
                  className={`min-h-[40px] ${battleMode ? 'bg-purple-700 text-white' : 'border-purple-700 text-purple-400'}`}
                  data-testid="toggle-battle-mode"
                >
                  ⚔️ Battle
                </Button>
              </div>
            </div>
            {battleMode && (
              <p className="text-xs text-stone-500 mt-2">Compare two models side-by-side and vote for the winner</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Pentest Lab - Collapsible challenges section */}
            {showPentestLab && (
              <div className="space-y-4 border-b border-teal-900/30 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-teal-400 font-bold text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" /> AI Pentesting Challenges (2025 Research)
                  </h3>
                  <Select value={challengeFilter} onValueChange={setChallengeFilter}>
                    <SelectTrigger className="w-[120px] bg-black/50 border-teal-800 text-teal-400 min-h-[36px] text-xs">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-stone-700">
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                  {AI_PENTEST_CHALLENGES
                    .filter(c => challengeFilter === 'all' || c.difficulty === challengeFilter)
                    .map(challenge => (
                    <button
                      key={challenge.id}
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setTestPrompt(challenge.prompt);
                        toast({ title: `Challenge loaded: ${challenge.name}` });
                      }}
                      className={`p-3 rounded-lg border text-left transition-all min-h-[60px] ${
                        selectedChallenge?.id === challenge.id
                          ? 'border-teal-500 bg-teal-900/30'
                          : 'border-stone-800 bg-stone-900/30 hover:border-teal-700'
                      }`}
                      data-testid={`challenge-${challenge.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-teal-400 font-bold text-sm">{challenge.name}</p>
                          <p className="text-stone-500 text-xs mt-1 line-clamp-2">{challenge.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`text-[9px] ${
                            challenge.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
                            challenge.difficulty === 'intermediate' ? 'bg-amber-900 text-amber-300' :
                            challenge.difficulty === 'advanced' ? 'bg-purple-900 text-purple-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {challenge.difficulty.toUpperCase()}
                          </Badge>
                          <span className="text-[9px] text-stone-600">{challenge.source}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedChallenge && (
                  <div className="p-3 bg-teal-900/20 rounded-lg border border-teal-800">
                    <p className="text-xs text-teal-300 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span className="font-bold">Learning Goal:</span> {selectedChallenge.learningGoal}
                    </p>
                  </div>
                )}
                <div className="border-t border-stone-800 pt-3">
                  <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Prompt Optimization Tips:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {PROMPT_OPTIMIZATION_TIPS.slice(0, 4).map(tip => (
                      <button
                        key={tip.technique}
                        onClick={() => {
                          setTestPrompt(prev => tip.prefix + ' ' + prev);
                          toast({ title: `Applied: ${tip.technique}`, description: tip.benefit });
                        }}
                        className="px-2 py-1 text-[10px] bg-stone-800 hover:bg-stone-700 rounded border border-stone-700 text-stone-400"
                      >
                        + {tip.technique}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Model A selector */}
            <div>
              <label className="text-sm text-stone-400 mb-2 block flex items-center gap-2">
                {battleMode && <Badge className="bg-amber-700 text-black text-[10px]">A</Badge>}
                Model {battleMode ? 'A' : ''}
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-black/50 border-stone-700 min-h-[48px]" data-testid="model-a-select">
                  <SelectValue>
                    {MODELS.find(m => m.id === selectedModel)?.name || 'Select model'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-700 max-h-[300px]">
                  {(Object.keys(MODEL_CATEGORIES) as Array<keyof typeof MODEL_CATEGORIES>).map(cat => {
                    const catInfo = MODEL_CATEGORIES[cat];
                    const catModels = MODELS.filter(m => m.category === cat);
                    return (
                      <div key={cat}>
                        <div className="px-2 py-1 text-[10px] text-stone-500 uppercase flex items-center gap-1">
                          <span>{catInfo.icon}</span> {catInfo.label}
                        </div>
                        {catModels.map(m => (
                          <SelectItem key={m.id} value={m.id} className="min-h-[40px]">
                            <span className="flex items-center gap-2">
                              {m.name}
                              <Badge variant="outline" className={`text-[9px] ${m.tier === 'free' ? 'border-green-600 text-green-400' : 'border-amber-600 text-amber-400'}`}>
                                {m.tier.toUpperCase()}
                              </Badge>
                            </span>
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Model B selector (battle mode only) */}
            {battleMode && (
              <div>
                <label className="text-sm text-stone-400 mb-2 block flex items-center gap-2">
                  <Badge className="bg-teal-700 text-black text-[10px]">B</Badge>
                  Model B
                </label>
                <Select value={selectedModelB} onValueChange={setSelectedModelB}>
                  <SelectTrigger className="bg-black/50 border-stone-700 min-h-[48px]" data-testid="model-b-select">
                    <SelectValue>
                      {MODELS.find(m => m.id === selectedModelB)?.name || 'Select model'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-700 max-h-[300px]">
                    {(Object.keys(MODEL_CATEGORIES) as Array<keyof typeof MODEL_CATEGORIES>).map(cat => {
                      const catInfo = MODEL_CATEGORIES[cat];
                      const catModels = MODELS.filter(m => m.category === cat);
                      return (
                        <div key={cat}>
                          <div className="px-2 py-1 text-[10px] text-stone-500 uppercase flex items-center gap-1">
                            <span>{catInfo.icon}</span> {catInfo.label}
                          </div>
                          {catModels.map(m => (
                            <SelectItem key={m.id} value={m.id} className="min-h-[40px]" disabled={m.id === selectedModel}>
                              <span className="flex items-center gap-2">
                                {m.name}
                                <Badge variant="outline" className={`text-[9px] ${m.tier === 'free' ? 'border-green-600 text-green-400' : 'border-amber-600 text-amber-400'}`}>
                                  {m.tier.toUpperCase()}
                                </Badge>
                                {m.id === selectedModel && <span className="text-stone-500">(Model A)</span>}
                              </span>
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

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
              disabled={loading || loadingB}
              className={`w-full min-h-[52px] text-base font-bold ${battleMode ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-amber-700 hover:bg-amber-600 text-black'}`}
              data-testid="run-test"
            >
              {loading || loadingB ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {battleMode ? 'Battling...' : 'Running...'}</>
              ) : (
                <>{battleMode ? '⚔️' : <Send className="w-5 h-5 mr-2" />} {battleMode ? 'Start Battle' : 'Run Test'}</>
              )}
            </Button>
          </CardContent>
        </Card>

        {(response || responseB) && (
          <Card className="bg-black/50 border-teal-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-teal-500 text-base">
                {battleMode && currentBattle ? 'Battle Results' : 'Response'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Unified chat view for battle mode */}
              {battleMode && currentBattle?.modelA && currentBattle?.modelB ? (
                <div className="space-y-4">
                  {/* Model A Response */}
                  <div className="rounded-lg border-2 border-amber-700 bg-amber-950/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-700 text-black">A</Badge>
                        <span className="text-sm font-bold text-amber-400">{currentBattle.modelA.name}</span>
                      </div>
                      <span className="text-xs text-stone-500">{currentBattle.modelA.latency}ms • {currentBattle.modelA.tokens} tok</span>
                    </div>
                    <pre className="text-sm text-stone-300 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                      {currentBattle.modelA.response}
                    </pre>
                  </div>

                  {/* Model B Response */}
                  <div className="rounded-lg border-2 border-teal-700 bg-teal-950/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-teal-700 text-black">B</Badge>
                        <span className="text-sm font-bold text-teal-400">{currentBattle.modelB.name}</span>
                      </div>
                      <span className="text-xs text-stone-500">{currentBattle.modelB.latency}ms • {currentBattle.modelB.tokens} tok</span>
                    </div>
                    <pre className="text-sm text-stone-300 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                      {currentBattle.modelB.response}
                    </pre>
                  </div>

                  {/* Vote buttons */}
                  <div className="pt-4 border-t border-stone-800">
                    <p className="text-sm text-stone-400 font-bold mb-3 text-center">🏆 Which response is better?</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        onClick={() => voteWinner('A')}
                        className="min-h-[52px] bg-amber-700 hover:bg-amber-600 text-black font-bold"
                        data-testid="vote-a"
                      >
                        A Wins
                      </Button>
                      <Button
                        onClick={() => voteWinner('tie')}
                        variant="outline"
                        className="min-h-[52px] border-stone-600 text-stone-400"
                        data-testid="vote-tie"
                      >
                        Tie
                      </Button>
                      <Button
                        onClick={() => voteWinner('B')}
                        className="min-h-[52px] bg-teal-700 hover:bg-teal-600 text-black font-bold"
                        data-testid="vote-b"
                      >
                        B Wins
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Battle History */}
        {battleResults.length > 0 && (
          <Card className="bg-black/50 border-purple-900/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-500 text-base flex items-center gap-2">
                  ⚔️ Battle History ({battleResults.length})
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setBattleResults([])} className="text-red-400 min-h-[44px]">
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {battleResults.slice(-5).reverse().map((battle, i) => (
                  <div key={battle.id} className="p-3 bg-stone-900/30 rounded-lg border border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={battle.winner === 'A' ? 'text-amber-400 font-bold' : 'text-stone-500'}>{battle.modelA.name}</span>
                        <span className="text-stone-600">vs</span>
                        <span className={battle.winner === 'B' ? 'text-teal-400 font-bold' : 'text-stone-500'}>{battle.modelB.name}</span>
                      </div>
                      <Badge className={
                        battle.winner === 'A' ? 'bg-amber-700 text-black' :
                        battle.winner === 'B' ? 'bg-teal-700 text-black' :
                        'bg-stone-700 text-stone-300'
                      }>
                        {battle.winner === 'tie' ? 'TIE' : `${battle.winner} WINS`}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-1">{battle.prompt}</p>
                  </div>
                ))}
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
