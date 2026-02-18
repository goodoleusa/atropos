import { useState, useEffect } from 'react';
import { Link, useSearch } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, ArrowRight, Bot, Shield, Eye, Lock, Bug, Network, Brain, Zap,
  Play, Download, Copy, Check, Loader2, RefreshCw, FileText, AlertTriangle,
  Globe, Skull, Radio, Database, ExternalLink, Settings, Radar, ShieldAlert,
  ChevronRight, RotateCcw
} from 'lucide-react';
import { CrewStatusPanel } from '@/components/CrewStatusPanel';

interface SecurityAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  temperature: number;
  maxTokens: number;
  scanCategories: string[];
  systemPrompt: string;
  crewai?: {
    goal: string;
    backstory: string;
    allowDelegation: boolean;
    verbose: boolean;
  };
  langchain?: {
    agentType: string;
    memoryType: string;
  };
}

interface AgentRun {
  id: string;
  agentId: string;
  output: string;
  status: string;
  latencyMs?: number;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

interface ThreatIntelFeed {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  category: 'malware' | 'ioc' | 'cve' | 'ransomware' | 'darkweb';
  free: boolean;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
  vuln_analyst: <Bug className="w-5 h-5" />,
  osint_analyst: <Eye className="w-5 h-5" />,
  threat_intel: <Radar className="w-5 h-5" />,
  secret_hunter: <Lock className="w-5 h-5" />,
  network_recon: <Network className="w-5 h-5" />,
  synthesis: <Brain className="w-5 h-5" />,
};

const AGENT_COLORS: Record<string, string> = {
  vuln_analyst: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  osint_analyst: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  threat_intel: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  secret_hunter: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
  network_recon: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30',
  synthesis: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30',
};

const THREAT_INTEL_FEEDS: ThreatIntelFeed[] = [
  {
    id: 'abuse_ch_urlhaus',
    name: 'URLhaus',
    description: 'Malicious URLs database from abuse.ch',
    url: 'https://urlhaus-api.abuse.ch/v1/',
    icon: <Globe className="w-4 h-4" />,
    category: 'malware',
    free: true,
  },
  {
    id: 'abuse_ch_threatfox',
    name: 'ThreatFox',
    description: 'IOCs from malware and botnets',
    url: 'https://threatfox-api.abuse.ch/api/v1/',
    icon: <Skull className="w-4 h-4" />,
    category: 'ioc',
    free: true,
  },
  {
    id: 'abuse_ch_malwarebazaar',
    name: 'MalwareBazaar',
    description: 'Malware sample sharing platform',
    url: 'https://mb-api.abuse.ch/api/v1/',
    icon: <Bug className="w-4 h-4" />,
    category: 'malware',
    free: true,
  },
  {
    id: 'cisa_kev',
    name: 'CISA KEV',
    description: 'Known Exploited Vulnerabilities catalog',
    url: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    icon: <AlertTriangle className="w-4 h-4" />,
    category: 'cve',
    free: true,
  },
  {
    id: 'nvd_cve',
    name: 'NVD CVE Feed',
    description: 'National Vulnerability Database',
    url: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
    icon: <Database className="w-4 h-4" />,
    category: 'cve',
    free: true,
  },
  {
    id: 'ransomware_live',
    name: 'Ransomware.live',
    description: 'Ransomware group activity tracker',
    url: 'https://api.ransomware.live/recentvictims',
    icon: <Lock className="w-4 h-4" />,
    category: 'ransomware',
    free: true,
  },
  {
    id: 'openphish',
    name: 'OpenPhish',
    description: 'Real-time phishing detection feed',
    url: 'https://openphish.com/feed.txt',
    icon: <Globe className="w-4 h-4" />,
    category: 'malware',
    free: true,
  },
  {
    id: 'spamhaus_drop',
    name: 'Spamhaus DROP',
    description: "Don't Route Or Peer list",
    url: 'https://www.spamhaus.org/drop/drop.txt',
    icon: <ShieldAlert className="w-4 h-4" />,
    category: 'ioc',
    free: true,
  },
  {
    id: 'emerging_threats_ips',
    name: 'Emerging Threats',
    description: 'Known malicious IP addresses',
    url: 'https://rules.emergingthreats.net/fwrules/emerging-Block-IPs.txt',
    icon: <Zap className="w-4 h-4" />,
    category: 'ioc',
    free: true,
  },
];

const FREE_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', strength: 'Balanced' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', strength: 'Reasoning' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder', strength: 'Code Analysis' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', strength: 'Speed' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron 70B', strength: 'Technical' },
];

const WIZARD_STEPS = [
  { num: 1, label: 'Select Agent', icon: <Shield className="w-4 h-4" /> },
  { num: 2, label: 'Load Data', icon: <Radar className="w-4 h-4" /> },
  { num: 3, label: 'Analysis', icon: <Brain className="w-4 h-4" /> },
];

export default function Agents() {
  const searchString = useSearch();
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<SecurityAgent | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedModel, setSelectedModel] = useState(FREE_MODELS[0].id);
  const [exportFormat, setExportFormat] = useState<'crewai' | 'langchain'>('crewai');
  const [selectedAgentsForExport, setSelectedAgentsForExport] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [enabledFeeds, setEnabledFeeds] = useState<string[]>(['abuse_ch_threatfox', 'cisa_kev', 'ransomware_live']);
  const [loadingScan, setLoadingScan] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const scanDataParam = params.get('scanData');
    if (scanDataParam) {
      try {
        const scanData = JSON.parse(decodeURIComponent(scanDataParam));
        setTestInput(JSON.stringify(scanData, null, 2).slice(0, 10000));
        setWizardStep(2);
        toast({ title: 'Scan Data Loaded', description: `Loaded scan results with ${scanData.findings?.length || 0} findings` });
        window.history.replaceState({}, '', '/agents');
      } catch {
        console.error('Failed to parse scanData param');
      }
    }
  }, [searchString]);

  const { data: agents = [], isLoading: agentsLoading } = useQuery<(SecurityAgent & { moduleId?: string; starterPrompt?: string })[]>({
    queryKey: ['/api/agents'],
  });

  const runAgentMutation = useMutation({
    mutationFn: async (params: { agentId: string; input: string; userPrompt?: string }) => {
      const res = await fetch('/api/agents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: params.agentId,
          prompt: params.input,
          sessionToken: localStorage.getItem('session_token'),
          userPromptAddition: params.userPrompt,
          scanId: params.input.includes('scan_results') ? 'latest_scan' : undefined
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Agent analysis failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.analysis) {
        setTestOutput(data.analysis || 'No output');
        const run: AgentRun = {
          id: `run_${Date.now()}`,
          agentId: data.agentId,
          output: data.analysis,
          status: 'completed',
          timestamp: data.timestamp
        } as any;
        setAgentRuns(prev => [run, ...prev].slice(0, 10));
        generateReport(run);

        fetch('/api/mission/findings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'agent',
            sourceAgent: data.agentId || 'unknown',
            type: 'finding',
            title: `${data.agentId || 'Agent'} Analysis`,
            content: data.analysis,
            severity: 'medium',
            status: 'new',
            sentTo: [],
            metadata: { latencyMs: run.latencyMs, tokenUsage: run.tokenUsage },
          }),
        }).catch(() => {});
      }
      toast({ title: 'Analysis Complete', description: 'Agent finished processing' });
    },
    onError: (error: Error) => {
      toast({ title: 'Analysis Failed', description: error.message, variant: 'destructive' });
    },
  });

  const generateReport = (run: AgentRun) => {
    const report = {
      id: run.id,
      agentId: run.agentId,
      timestamp: new Date().toISOString(),
      output: run.output,
      metrics: {
        latencyMs: run.latencyMs,
        tokens: run.tokenUsage,
      },
    };
    const existingReports = JSON.parse(localStorage.getItem('agent_reports') || '[]');
    existingReports.unshift(report);
    localStorage.setItem('agent_reports', JSON.stringify(existingReports.slice(0, 50)));
  };

  const fetchLatestScan = async () => {
    setLoadingScan(true);
    try {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) throw new Error('No active session');
      
      const res = await fetch(`/api/tool-calls?limit=5`, {
        headers: { 'x-session-token': sessionToken }
      });
      if (!res.ok) throw new Error('Failed to fetch scan results');
      
      const data = await res.json();
      if (!data || data.length === 0) {
        toast({ title: 'No Scans Found', description: 'Run a scan in the terminal first', variant: 'destructive' });
        return;
      }
      
      setTestInput(JSON.stringify(data, null, 2));
      toast({ title: 'Scan Data Loaded', description: `Loaded ${data.length} recent Atropos scanner results` });
    } catch (error: any) {
      toast({ title: 'Load Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoadingScan(false);
    }
  };

  const handleRunAgent = async () => {
    if (!selectedAgent || !testInput.trim()) {
      toast({ title: 'Missing Input', description: 'Select an agent and provide data to analyze', variant: 'destructive' });
      return;
    }
    setIsRunning(true);
    setTestOutput('');
    setWizardStep(3);
    try {
      const agentIdToUse = (selectedAgent as any).moduleId || selectedAgent.id;
      
      // Extract first 5000 chars of input if it's too large
      const inputToUse = testInput.length > 5000 ? testInput.slice(0, 5000) : testInput;
      
      await runAgentMutation.mutateAsync({
        agentId: agentIdToUse,
        input: inputToUse,
        userPrompt: userPrompt.trim() || undefined,
      });
    } catch (error: any) {
      console.error('Agent run failed:', error);
      setWizardStep(2);
      toast({ title: 'Agent Error', description: error.message || 'Analysis failed', variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = async () => {
    const agentIds = selectedAgentsForExport.length > 0 
      ? selectedAgentsForExport.join(',') 
      : agents.map(a => a.id).join(',');
    
    try {
      const res = await fetch(`/api/agents/export/${exportFormat}?agents=${agentIds}`);
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus_agents_${exportFormat}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Export Complete', description: `Exported to ${exportFormat.toUpperCase()} format` });
    } catch (error) {
      toast({ title: 'Export Failed', description: 'Could not export agents', variant: 'destructive' });
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchThreatIntel = async (feedId: string) => {
    const feed = THREAT_INTEL_FEEDS.find(f => f.id === feedId);
    if (!feed) return;
    
    setLoadingFeed(feedId);
    
    try {
      const res = await fetch('/api/threat-intel/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId, url: feed.url }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch');
      }
      
      const data = await res.json();
      setTestInput(JSON.stringify(data, null, 2).slice(0, 5000));
      toast({ title: 'Intel Loaded', description: `${feed.name} data ready for analysis` });
    } catch (error: any) {
      toast({ title: 'Feed Error', description: error.message || 'Could not fetch threat intel', variant: 'destructive' });
    } finally {
      setLoadingFeed(null);
    }
  };

  const toggleAgentForExport = (agentId: string) => {
    setSelectedAgentsForExport(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const resetWizard = () => {
    setWizardStep(1);
    setSelectedAgent(null);
    setTestInput('');
    setTestOutput('');
    setUserPrompt('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-stone-400 hover:text-amber-500" data-testid="back-button">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-amber-500 flex items-center gap-2">
                <Bot className="w-6 h-6" /> Security Agents
              </h1>
              <p className="text-stone-400 text-sm">Specialized AI agents for security analysis</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExport(!showExport)}
              className="border-stone-700 text-stone-400"
            >
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        {/* ===== WIZARD STEP INDICATOR ===== */}
        <div className="flex items-center gap-2 mb-6 bg-stone-900/50 rounded-xl p-3 border border-amber-900/20">
          {WIZARD_STEPS.map((step, idx) => (
            <div key={step.num} className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (step.num < wizardStep) setWizardStep(step.num);
                  if (step.num === 1) resetWizard();
                }}
                disabled={step.num > wizardStep}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all w-full ${
                  wizardStep === step.num
                    ? 'bg-amber-600/20 border border-amber-500/40 text-amber-400'
                    : wizardStep > step.num
                    ? 'bg-stone-800/50 border border-stone-700 text-stone-300 hover:border-amber-500/30 cursor-pointer'
                    : 'bg-stone-900/30 border border-stone-800 text-stone-600 cursor-not-allowed'
                }`}
                data-testid={`wizard-step-${step.num}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  wizardStep === step.num ? 'bg-amber-500 text-black' :
                  wizardStep > step.num ? 'bg-stone-700 text-white' : 'bg-stone-800 text-stone-600'
                }`}>
                  {wizardStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-medium">{step.label}</div>
                </div>
                {step.icon}
              </button>
              {idx < WIZARD_STEPS.length - 1 && (
                <ChevronRight className={`w-4 h-4 mx-1 shrink-0 ${wizardStep > step.num ? 'text-amber-500' : 'text-stone-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ===== CREW STATUS SIDEBAR ===== */}
        {wizardStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-3">
              <CrewStatusPanel compact />
            </div>
            <div className="hidden lg:block">
              <CrewStatusPanel />
            </div>
          </div>
        )}

        {/* ===== STEP 1: SELECT AGENT ===== */}
        {wizardStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-orbitron text-white">Choose Your Agent</h2>
              <p className="text-xs text-stone-500">Click an agent to proceed</p>
            </div>

            {agentsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <Card 
                    key={agent.id}
                    className={`bg-gradient-to-br ${AGENT_COLORS[(agent as any).moduleId] || 'from-stone-800 to-stone-900'} border cursor-pointer hover:scale-[1.02] transition-all hover:shadow-lg hover:shadow-amber-500/5`}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setWizardStep(2);
                    }}
                    data-testid={`agent-card-${agent.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-stone-900/50">
                            {AGENT_ICONS[(agent as any).moduleId] || <Bot className="w-5 h-5" />}
                          </div>
                          <CardTitle className="text-lg text-white">{agent.name}</CardTitle>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-stone-300 mb-3">
                        {agent.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1">
                        {((agent as any).scanCategories || (agent as any).tags || []).slice(0, 3).map((cat: string) => (
                          <Badge key={cat} variant="secondary" className="text-xs bg-stone-800/50">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 2: CONFIGURE + DATA ===== */}
        {wizardStep === 2 && selectedAgent && (
          <div className="space-y-4">
            {/* Selected agent summary banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-stone-900/60">
                  {AGENT_ICONS[(selectedAgent as any).moduleId] || <Bot className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">{selectedAgent.name}</h3>
                  <p className="text-sm text-stone-400">{selectedAgent.description}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setWizardStep(1)} className="text-stone-500 hover:text-white">
                <RotateCcw className="w-4 h-4 mr-1" /> Change
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Left: Config */}
              <Card className="bg-stone-900/50 border-amber-900/30">
                <CardHeader>
                  <CardTitle className="text-amber-500 flex items-center gap-2 text-base">
                    <Settings className="w-5 h-5" /> Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-stone-400 mb-2 block">Model</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="bg-stone-800 border-stone-700" data-testid="select-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREE_MODELS.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center justify-between gap-4">
                              <span>{model.name}</span>
                              <Badge variant="outline" className="text-xs">{model.strength}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-stone-400 mb-2 block flex items-center gap-2">
                      <Zap className="w-4 h-4 text-teal-400" />
                      Custom Instructions (Optional)
                    </label>
                    <Textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Add focus areas, specific questions, or additional context..."
                      className="bg-stone-800 border-stone-700 min-h-[80px]"
                      data-testid="user-prompt-input"
                    />
                  </div>

                  <Separator className="bg-stone-800" />

                  {selectedAgent && (
                    <div className="p-3 rounded-lg bg-stone-800/50 border border-stone-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-400">Base Instructions</span>
                        <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">Protected</Badge>
                      </div>
                      <ScrollArea className="h-20">
                        <pre className="text-xs text-stone-400 whitespace-pre-wrap">
                          {(selectedAgent as any).systemPrompt?.slice(0, 400) || (selectedAgent as any).starterPrompt?.slice(0, 400)}...
                        </pre>
                      </ScrollArea>
                    </div>
                  )}

                  <Separator className="bg-stone-800" />

                  <div>
                    <label className="text-sm text-stone-400 mb-3 block">Quick Data Import</label>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        onClick={fetchLatestScan}
                        disabled={loadingScan}
                        className="w-full justify-start border-stone-700 text-teal-400 hover:text-teal-300 hover:border-teal-500/40 h-11"
                        data-testid="import-atropos-scan"
                      >
                        {loadingScan ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Radar className="w-4 h-4 mr-3" />}
                        Import Latest Atropos Scan
                      </Button>

                      <ScrollArea className="h-[140px]">
                        <div className="grid grid-cols-2 gap-2 pr-3">
                          {THREAT_INTEL_FEEDS.map(feed => (
                            <Button
                              key={feed.id}
                              variant="outline"
                              size="sm"
                              onClick={() => fetchThreatIntel(feed.id)}
                              disabled={loadingFeed === feed.id}
                              className="justify-start border-stone-700 text-stone-300 hover:text-white hover:border-amber-500/30 text-xs h-9"
                              data-testid={`feed-${feed.id}`}
                            >
                              {loadingFeed === feed.id ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <span className="mr-2">{feed.icon}</span>}
                              {feed.name}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right: Data preview + run */}
              <Card className="bg-stone-900/50 border-amber-900/30">
                <CardHeader>
                  <CardTitle className="text-amber-500 flex items-center gap-2 text-base">
                    <Play className="w-5 h-5" /> Data Input
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Paste scan results, IOCs, vulnerability data, or use the import buttons on the left..."
                    className="bg-stone-800 border-stone-700 min-h-[260px] font-mono text-xs"
                    data-testid="test-input"
                  />

                  {testInput && (
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Check className="w-3 h-3 text-teal-500" />
                      <span>{testInput.length.toLocaleString()} characters loaded</span>
                      <Button variant="ghost" size="sm" onClick={() => setTestInput('')} className="text-stone-600 ml-auto h-6 px-2">
                        Clear
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleRunAgent}
                    disabled={isRunning || !testInput.trim()}
                    className="w-full bg-amber-600 hover:bg-amber-700 h-12 text-base font-orbitron tracking-wider"
                    data-testid="run-agent-button"
                  >
                    {isRunning ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Play className="mr-2 h-5 w-5" /> Run Analysis</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ===== STEP 3: RESULTS ===== */}
        {wizardStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-orbitron text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-500" />
                {selectedAgent?.name} - Analysis
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setWizardStep(2)} className="text-stone-400 border-stone-700">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Adjust Input
                </Button>
                <Button variant="outline" size="sm" onClick={resetWizard} className="text-stone-400 border-stone-700">
                  <RotateCcw className="w-4 h-4 mr-1" /> New Session
                </Button>
              </div>
            </div>

            <Card className="bg-stone-900/50 border-amber-900/30">
              <CardContent className="pt-6">
                {isRunning ? (
                  <div className="py-24 flex flex-col items-center justify-center gap-4 text-stone-400">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 animate-spin text-amber-500" />
                      <Bot className="w-6 h-6 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="font-orbitron animate-pulse tracking-widest uppercase text-xs mt-4">
                      {selectedAgent?.name} processing via {FREE_MODELS.find(m => m.id === selectedModel)?.name}...
                    </p>
                  </div>
                ) : testOutput ? (
                  <div className="relative group">
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button variant="secondary" size="sm" onClick={() => copyToClipboard(testOutput)} className="h-8">
                        {copied ? <Check className="w-4 h-4 mr-1 text-teal-500" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          const blob = new Blob([testOutput], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `agent_report_${Date.now()}.md`;
                          a.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-1" /> Save
                      </Button>
                    </div>
                    <ScrollArea className="h-[550px] w-full rounded-lg border border-stone-800 bg-stone-950 p-6">
                      <pre className="text-sm text-stone-300 whitespace-pre-wrap font-mono leading-relaxed" data-testid="analysis-output">
                        {testOutput}
                      </pre>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-500">
                    <FileText className="w-10 h-10 text-stone-700" />
                    <p>Waiting for analysis results...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== EXPORT PANEL (toggleable) ===== */}
        {showExport && (
          <div className="mt-6 space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="bg-stone-900/50 border-amber-900/30">
                <CardHeader>
                  <CardTitle className="text-amber-500 flex items-center gap-2">
                    <Download className="w-5 h-5" /> Export Configuration
                  </CardTitle>
                  <CardDescription>Export agents to CrewAI or LangChain format</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-stone-400 mb-2 block">Export Format</label>
                    <Select value={exportFormat} onValueChange={(v: 'crewai' | 'langchain') => setExportFormat(v)}>
                      <SelectTrigger className="bg-stone-800 border-stone-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crewai">CrewAI</SelectItem>
                        <SelectItem value="langchain">LangChain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-stone-400 mb-2 block">Select Agents to Export</label>
                    <div className="space-y-2">
                      {agents.map(agent => (
                        <div 
                          key={agent.id}
                          className="flex items-center justify-between p-2 rounded bg-stone-800/50 border border-stone-700"
                        >
                          <div className="flex items-center gap-2">
                            {AGENT_ICONS[(agent as any).moduleId] || <Bot className="w-4 h-4" />}
                            <span className="text-sm text-white">{agent.name}</span>
                          </div>
                          <Switch
                            checked={selectedAgentsForExport.includes(agent.id)}
                            onCheckedChange={() => toggleAgentForExport(agent.id)}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-stone-500 mt-2">
                      Leave all unchecked to export all agents
                    </p>
                  </div>

                  <Button onClick={handleExport} className="w-full bg-amber-600 hover:bg-amber-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export to {exportFormat.toUpperCase()}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-stone-900/50 border-amber-900/30">
                <CardHeader>
                  <CardTitle className="text-amber-500">Export Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <pre className="text-xs text-stone-400 font-mono">
{exportFormat === 'crewai' ? `# CrewAI Export Format
from crewai import Agent, Crew, Task

agents = [
${agents.slice(0, 2).map(a => `  Agent(
    role="${a.name}",
    goal="${a.crewai?.goal || a.description}",
    backstory="...",
    llm="${a.model}"
  )`).join(',\n')}
]

crew = Crew(
  agents=agents,
  tasks=[...],
  verbose=True
)` : `# LangChain Export Format
from langchain.agents import initialize_agent
from langchain.llms import OpenAI

agents = [
${agents.slice(0, 2).map(a => `  {
    "name": "${a.name}",
    "system_prompt": "...",
    "agent_type": "${a.langchain?.agentType || 'react'}",
    "memory_type": "${a.langchain?.memoryType || 'buffer'}"
  }`).join(',\n')}
]`}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ===== RECENT RUNS ===== */}
        {agentRuns.length > 0 && (
          <Card className="mt-6 bg-stone-900/50 border-amber-900/30">
            <CardHeader>
              <CardTitle className="text-amber-500 flex items-center gap-2 text-base">
                <FileText className="w-5 h-5" /> Recent Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agentRuns.slice(0, 5).map((run, idx) => (
                  <div 
                    key={run.id || idx}
                    className="flex items-center justify-between p-3 rounded bg-stone-800/50 border border-stone-700"
                  >
                    <div className="flex items-center gap-3">
                      {AGENT_ICONS[run.agentId] || AGENT_ICONS[agents.find(a => a.id.toString() === run.agentId)?.moduleId || ''] || <Bot className="w-4 h-4" />}
                      <div>
                        <span className="text-sm text-white">{run.agentId}</span>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          {run.latencyMs && <span>{run.latencyMs}ms</span>}
                          {run.tokenUsage && <span>{run.tokenUsage.total} tokens</span>}
                        </div>
                      </div>
                    </div>
                    <Badge variant={run.status === 'completed' ? 'default' : 'destructive'}>
                      {run.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
