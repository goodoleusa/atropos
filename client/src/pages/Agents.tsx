import { useState, useEffect } from 'react';
import { Link } from 'wouter';
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
  ArrowLeft, Bot, Shield, Eye, Lock, Bug, Network, Brain, Zap,
  Play, Download, Copy, Check, Loader2, RefreshCw, FileText, AlertTriangle,
  Globe, Skull, Radio, Database, ExternalLink, Settings, Radar
} from 'lucide-react';

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
];

const FREE_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', strength: 'Balanced' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', strength: 'Reasoning' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder', strength: 'Code Analysis' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', strength: 'Speed' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron 70B', strength: 'Technical' },
];

export default function Agents() {
  const [activeTab, setActiveTab] = useState('agents');
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
  const [enabledFeeds, setEnabledFeeds] = useState<string[]>(['abuse_ch_threatfox', 'cisa_kev']);

  const { data: agents = [], isLoading: agentsLoading } = useQuery<(SecurityAgent & { moduleId?: string; starterPrompt?: string })[]>({
    queryKey: ['/api/agents'],
  });

  const runAgentMutation = useMutation({
    mutationFn: async (params: { agentId: string; input: string; userPrompt?: string }) => {
      const res = await fetch('/api/agents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanData: params.input,
          scanId: `test_${Date.now()}`,
          category: 'general',
          agentIds: [params.agentId],
          runSynthesis: false,
          userPromptAddition: params.userPrompt,
        }),
      });
      if (!res.ok) throw new Error('Agent analysis failed');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.agentRuns?.[0]) {
        setTestOutput(data.agentRuns[0].output || 'No output');
        setAgentRuns(prev => [data.agentRuns[0], ...prev].slice(0, 10));
        generateReport(data.agentRuns[0]);
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

  const handleRunAgent = async () => {
    if (!selectedAgent || !testInput.trim()) {
      toast({ title: 'Missing Input', description: 'Select an agent and provide test input', variant: 'destructive' });
      return;
    }
    setIsRunning(true);
    setTestOutput('');
    try {
      await runAgentMutation.mutateAsync({
        agentId: selectedAgent.id,
        input: testInput,
        userPrompt: userPrompt.trim() || undefined,
      });
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
    
    toast({ title: 'Fetching Intel', description: `Loading data from ${feed.name}...` });
    
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
    }
  };

  const toggleAgentForExport = (agentId: string) => {
    setSelectedAgentsForExport(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-stone-900/50 border border-amber-900/30">
            <TabsTrigger value="agents" className="data-[state=active]:bg-amber-600/20">
              <Shield className="w-4 h-4 mr-2" /> Agents
            </TabsTrigger>
            <TabsTrigger value="playground" className="data-[state=active]:bg-amber-600/20">
              <Zap className="w-4 h-4 mr-2" /> Playground
            </TabsTrigger>
            <TabsTrigger value="intel" className="data-[state=active]:bg-amber-600/20">
              <Radar className="w-4 h-4 mr-2" /> Threat Intel
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-amber-600/20">
              <Download className="w-4 h-4 mr-2" /> Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-4">
            {agentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <Card 
                    key={agent.id}
                    className={`bg-gradient-to-br ${AGENT_COLORS[(agent as any).moduleId] || 'from-stone-800 to-stone-900'} border cursor-pointer hover:scale-[1.02] transition-transform`}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setActiveTab('playground');
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
                        <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400">
                          FREE
                        </Badge>
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
          </TabsContent>

          <TabsContent value="playground" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="bg-stone-900/50 border-amber-900/30">
                <CardHeader>
                  <CardTitle className="text-amber-500 flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Agent Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-stone-400 mb-2 block">Select Agent</label>
                    <Select 
                      value={selectedAgent?.id?.toString() || ''} 
                      onValueChange={(id) => setSelectedAgent(agents.find(a => a.id.toString() === id) || null)}
                    >
                      <SelectTrigger className="bg-stone-800 border-stone-700" data-testid="select-agent">
                        <SelectValue placeholder="Choose an agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            <div className="flex items-center gap-2">
                              {AGENT_ICONS[(agent as any).moduleId] || <Bot className="w-4 h-4" />}
                              <span>{agent.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-stone-400 mb-2 block">Model (Free Tier)</label>
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

                  {selectedAgent && (
                    <div className="p-3 rounded-lg bg-stone-800/50 border border-stone-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-400">Admin Base Instructions</span>
                        <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">Protected</Badge>
                      </div>
                      <p className="text-xs text-stone-500 mb-2">
                        These instructions are set by the administrator and cannot be overridden.
                      </p>
                      <ScrollArea className="h-24">
                        <pre className="text-xs text-stone-400 whitespace-pre-wrap">
                          {(selectedAgent as any).systemPrompt?.slice(0, 500) || (selectedAgent as any).starterPrompt?.slice(0, 500)}...
                        </pre>
                      </ScrollArea>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-stone-400 mb-2 block flex items-center gap-2">
                      <Zap className="w-4 h-4 text-teal-400" />
                      Your Additional Instructions (Optional)
                    </label>
                    <Textarea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Add your own focus areas, specific questions, or context... These will be appended to the admin base instructions."
                      className="bg-stone-800 border-stone-700 min-h-[100px]"
                      data-testid="user-prompt-input"
                    />
                    <p className="text-xs text-stone-500 mt-1">
                      Your instructions are added on top of admin base instructions - you can enhance but not override.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-stone-900/50 border-amber-900/30">
                <CardHeader>
                  <CardTitle className="text-amber-500 flex items-center gap-2">
                    <Play className="w-5 h-5" /> Test Input
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Paste scan results, IOCs, vulnerability data, or other security data to analyze..."
                    className="bg-stone-800 border-stone-700 min-h-[200px] font-mono text-sm"
                    data-testid="test-input"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRunAgent}
                      disabled={isRunning || !selectedAgent}
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                      data-testid="run-agent-button"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Analysis
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setTestInput('')}
                      className="border-stone-700"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {testOutput && (
              <Card className="bg-stone-900/50 border-amber-900/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-amber-500 flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Analysis Report
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(testOutput)}
                        className="border-stone-700"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([testOutput], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `agent_report_${Date.now()}.md`;
                          a.click();
                        }}
                        className="border-stone-700"
                      >
                        <Download className="w-4 h-4 mr-1" /> Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <pre className="text-sm text-stone-300 whitespace-pre-wrap font-mono">
                      {testOutput}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="intel" className="space-y-4">
            <Card className="bg-stone-900/50 border-amber-900/30">
              <CardHeader>
                <CardTitle className="text-amber-500 flex items-center gap-2">
                  <Radar className="w-5 h-5" /> Threat Intelligence Feeds
                </CardTitle>
                <CardDescription>Free threat intel sources - click to load data for agent analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {THREAT_INTEL_FEEDS.map((feed) => (
                    <Card 
                      key={feed.id}
                      className={`bg-stone-800/50 border-stone-700 hover:border-amber-500/50 cursor-pointer transition-colors ${
                        enabledFeeds.includes(feed.id) ? 'border-teal-500/50' : ''
                      }`}
                      onClick={() => fetchThreatIntel(feed.id)}
                      data-testid={`feed-${feed.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded bg-stone-700/50 text-amber-400">
                              {feed.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{feed.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {feed.category}
                              </Badge>
                            </div>
                          </div>
                          {feed.free && (
                            <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">FREE</Badge>
                          )}
                        </div>
                        <p className="text-xs text-stone-400">{feed.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-stone-900/50 border-amber-900/30">
              <CardHeader>
                <CardTitle className="text-amber-500">Quick Intel Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <a href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-stone-700">
                      CISA KEV <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                  <a href="https://bazaar.abuse.ch/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-stone-700">
                      MalwareBazaar <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                  <a href="https://threatfox.abuse.ch/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-stone-700">
                      ThreatFox <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                  <a href="https://www.ransomware.live/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-stone-700">
                      Ransomware.live <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                  <a href="https://nvd.nist.gov/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-stone-700">
                      NVD <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
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
                            {AGENT_ICONS[agent.id]}
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
          </TabsContent>
        </Tabs>

        <Card className="mt-6 bg-stone-900/50 border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-500 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Recent Analysis Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentRuns.length === 0 ? (
              <p className="text-stone-500 text-center py-8">
                No recent analyses. Run an agent to see reports here.
              </p>
            ) : (
              <div className="space-y-2">
                {agentRuns.slice(0, 5).map((run, idx) => (
                  <div 
                    key={run.id || idx}
                    className="flex items-center justify-between p-3 rounded bg-stone-800/50 border border-stone-700"
                  >
                    <div className="flex items-center gap-3">
                      {AGENT_ICONS[run.agentId] || <Bot className="w-4 h-4" />}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
