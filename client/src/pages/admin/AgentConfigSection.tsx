import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bot, Shield, Eye, Lock, Bug, Network, Brain, Save, RefreshCw,
  Settings, Activity, BarChart3, AlertTriangle, Check, Loader2
} from 'lucide-react';

interface AgentConfig {
  baseInstructions?: string;
  model?: string;
  temperature?: number;
  updatedAt?: string;
}

interface WandBConfig {
  enabled: boolean;
  project: string;
  entity: string;
  apiKeySet?: boolean;
}

const AGENT_INFO = [
  { id: 'vuln_analyst', name: 'VulnAnalyst', icon: Bug, description: 'Vulnerability analysis and CVE research' },
  { id: 'osint_analyst', name: 'OSINTAnalyst', icon: Eye, description: 'Attack surface mapping and recon' },
  { id: 'threat_intel', name: 'ThreatIntel', icon: Shield, description: 'Threat actor TTPs and IOC correlation' },
  { id: 'secret_hunter', name: 'SecretHunter', icon: Lock, description: 'Credential and secret exposure' },
  { id: 'network_recon', name: 'NetworkRecon', icon: Network, description: 'Network infrastructure analysis' },
  { id: 'synthesis', name: 'Synthesis', icon: Brain, description: 'Executive synthesis and prioritization' },
];

const FREE_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron 70B' },
];

const EMPTY_AGENT_CONFIGS: Record<string, AgentConfig> = {};
const EMPTY_CONFIG: AgentConfig = {};

export default function AgentConfigSection() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(AGENT_INFO[0].id);
  const [localConfig, setLocalConfig] = useState<AgentConfig>({});
  const [wandbApiKey, setWandbApiKey] = useState('');
  
  const { data: agentConfigs = EMPTY_AGENT_CONFIGS, isLoading: configLoading } = useQuery<Record<string, AgentConfig>>({
    queryKey: ['/api/admin/agent-config'],
    queryFn: async () => {
      const res = await fetch('/api/admin/agent-config', {
        headers: { 'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || '' }
      });
      if (!res.ok) return {};
      return res.json();
    },
    retry: false,
  });
  
  const { data: wandbConfig, isLoading: wandbLoading } = useQuery<WandBConfig>({
    queryKey: ['/api/admin/wandb-config'],
    queryFn: async () => {
      const res = await fetch('/api/admin/wandb-config', {
        headers: { 'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || '' }
      });
      if (!res.ok) return { enabled: false, project: 'nexus-agents', entity: '' };
      return res.json();
    },
    retry: false,
  });
  
  useEffect(() => {
    const cfg = agentConfigs[selectedAgent];
    if (cfg) {
      setLocalConfig(cfg);
    } else {
      setLocalConfig(prev => Object.keys(prev).length === 0 ? prev : EMPTY_CONFIG);
    }
  }, [selectedAgent, agentConfigs]);
  
  const saveAgentMutation = useMutation({
    mutationFn: async (config: { agentId: string } & AgentConfig) => {
      const res = await fetch('/api/admin/agent-config', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || ''
        },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/agent-config'] });
      toast({ title: 'Saved', description: 'Agent configuration updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save configuration', variant: 'destructive' });
    },
  });
  
  const saveWandBMutation = useMutation({
    mutationFn: async (config: Partial<WandBConfig> & { apiKey?: string }) => {
      const res = await fetch('/api/admin/wandb-config', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || ''
        },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wandb-config'] });
      setWandbApiKey('');
      toast({ title: 'Saved', description: 'W&B configuration updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save W&B config', variant: 'destructive' });
    },
  });
  
  const handleSaveAgent = () => {
    saveAgentMutation.mutate({
      agentId: selectedAgent,
      ...localConfig,
    });
  };
  
  const handleSaveWandB = () => {
    saveWandBMutation.mutate({
      enabled: wandbConfig?.enabled,
      project: wandbConfig?.project || 'nexus-agents',
      entity: wandbConfig?.entity || '',
      apiKey: wandbApiKey || undefined,
    });
  };
  
  const selectedAgentInfo = AGENT_INFO.find(a => a.id === selectedAgent);
  const Icon = selectedAgentInfo?.icon || Bot;

  return (
    <div className="space-y-6">
      {/* Prominent Header */}
      <div className="bg-gradient-to-r from-amber-950/50 to-teal-950/30 border border-amber-700/50 rounded-lg p-4" data-testid="agent-config-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <Brain className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-800 font-orbitron">AI Agent Configuration</h2>
            <p className="text-sm text-muted-foreground">Edit system prompts, models, and monitoring for all 6 security agents</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-amber-700/50 ring-1 ring-amber-500/20">
          <CardHeader className="bg-amber-950/20 border-b border-amber-900/30">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <Bot className="w-5 h-5" /> Agent System Prompts
              <Badge className="bg-amber-500 text-black text-xs ml-2">EDITABLE</Badge>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure protected base instructions for each agent. Users can add to these but not override.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Select Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="bg-border border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_INFO.map(agent => {
                    const AgentIcon = agent.icon;
                    return (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <AgentIcon className="w-4 h-4" />
                          <span>{agent.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-3 rounded-lg bg-border/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-amber-800" />
                <span className="font-medium text-gray-900 dark:text-white">{selectedAgentInfo?.name}</span>
                <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-800">
                  Admin Protected
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{selectedAgentInfo?.description}</p>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Model Override</label>
              <Select 
                value={localConfig.model || ''} 
                onValueChange={(v) => setLocalConfig(prev => ({ ...prev, model: v === '__default__' ? undefined : v }))}
              >
                <SelectTrigger className="bg-border border-border">
                  <SelectValue placeholder="Use default model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__default__">Use default</SelectItem>
                  {FREE_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Temperature: {localConfig.temperature?.toFixed(1) || '0.5'}
              </label>
              <Slider
                value={[localConfig.temperature || 0.5]}
                onValueChange={([v]) => setLocalConfig(prev => ({ ...prev, temperature: v }))}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-700" />
                Base Instructions (Protected)
              </label>
              <Textarea
                value={localConfig.baseInstructions || ''}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, baseInstructions: e.target.value }))}
                placeholder="Enter base instructions that users cannot override. These will be prepended to all agent prompts."
                className="bg-border border-border min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                These instructions are always included first and cannot be removed by users.
              </p>
            </div>
            
            <Button 
              onClick={handleSaveAgent}
              disabled={saveAgentMutation.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {saveAgentMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Agent Config</>
              )}
            </Button>
            
            {localConfig.updatedAt && (
              <p className="text-xs text-muted-foreground text-center">
                Last updated: {new Date(localConfig.updatedAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="bg-card/50 border-amber-900/30">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <Activity className="w-5 h-5" /> W&B Monitoring
                {wandbConfig?.enabled && wandbConfig?.apiKeySet && (
                  <Badge className="bg-teal-500 text-black text-xs animate-pulse">LIVE</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Connect Weights & Biases to monitor agent performance and run evals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wandbLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-800" />
                </div>
              ) : (
                <>
                  {/* Status Banner */}
                  <div className={`p-3 rounded-lg border ${
                    wandbConfig?.enabled && wandbConfig?.apiKeySet 
                      ? 'bg-teal-950/30 border-teal-700' 
                      : 'bg-border/30 border-border'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        wandbConfig?.enabled && wandbConfig?.apiKeySet 
                          ? 'bg-teal-500 animate-pulse' 
                          : 'bg-muted'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${
                          wandbConfig?.enabled && wandbConfig?.apiKeySet 
                            ? 'text-teal-800' 
                            : 'text-muted-foreground'
                        }`}>
                          {wandbConfig?.enabled && wandbConfig?.apiKeySet 
                            ? 'Connected to W&B' 
                            : wandbConfig?.enabled 
                              ? 'W&B Enabled - API Key Required' 
                              : 'W&B Disabled'}
                        </p>
                        {wandbConfig?.enabled && wandbConfig?.apiKeySet && wandbConfig?.project && (
                          <p className="text-xs text-muted-foreground">
                            Project: <span className="text-teal-800">{wandbConfig.project}</span>
                            {wandbConfig.entity && <> | Entity: <span className="text-teal-800">{wandbConfig.entity}</span></>}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-border/50 border border-border">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-teal-800" />
                      <span className="text-sm text-gray-900 dark:text-white">Enable W&B Logging</span>
                    </div>
                    <Switch
                      checked={wandbConfig?.enabled || false}
                      onCheckedChange={(checked) => {
                        saveWandBMutation.mutate({ ...wandbConfig, enabled: checked });
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Project Name</label>
                    <Input
                      value={wandbConfig?.project || 'nexus-agents'}
                      onChange={(e) => {
                        queryClient.setQueryData(['/api/admin/wandb-config'], {
                          ...wandbConfig,
                          project: e.target.value,
                        });
                      }}
                      placeholder="nexus-agents"
                      className="bg-border border-border"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Entity (Optional)</label>
                    <Input
                      value={wandbConfig?.entity || ''}
                      onChange={(e) => {
                        queryClient.setQueryData(['/api/admin/wandb-config'], {
                          ...wandbConfig,
                          entity: e.target.value,
                        });
                      }}
                      placeholder="Your W&B username or team"
                      className="bg-border border-border"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-800" />
                      API Key {wandbConfig?.apiKeySet && <Badge className="bg-teal-500/20 text-teal-800 text-xs">Set</Badge>}
                    </label>
                    <Input
                      type="password"
                      value={wandbApiKey}
                      onChange={(e) => setWandbApiKey(e.target.value)}
                      placeholder={wandbConfig?.apiKeySet ? '••••••••••••' : 'Enter your W&B API key'}
                      className="bg-border border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Get your key from wandb.ai/authorize
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleSaveWandB}
                    disabled={saveWandBMutation.isPending}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    {saveWandBMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save W&B Config</>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-amber-900/30">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <Settings className="w-5 h-5" /> Agent Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {AGENT_INFO.map(agent => {
                  const AgentIcon = agent.icon;
                  const hasCustomConfig = !!agentConfigs[agent.id]?.baseInstructions;
                  return (
                    <div 
                      key={agent.id}
                      className="flex items-center justify-between p-2 rounded bg-border/50 border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <AgentIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-gray-900 dark:text-white">{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasCustomConfig ? (
                          <Badge className="bg-amber-500/20 text-amber-800 text-xs">Custom</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-muted text-muted-foreground">Default</Badge>
                        )}
                        {agentConfigs[agent.id]?.model && (
                          <Badge variant="outline" className="text-xs border-teal-600 text-teal-800">
                            Model Override
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
