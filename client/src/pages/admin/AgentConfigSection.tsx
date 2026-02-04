import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGame } from "@/hooks/useGameSession";
import { SECURITY_AGENTS, type SecurityAgent } from "@shared/agents";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, Shield, Globe, AlertTriangle, Key, Network, FileText,
  Save, Loader2, Settings, AlertCircle, Lock
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  Shield, Globe, AlertTriangle, Key, Network, FileText
};

interface AgentConfig {
  baseInstructions?: string;
  model?: string;
  temperature?: number;
  updatedAt?: string;
}

interface WandbConfig {
  enabled: boolean;
  project: string;
  entity: string;
}

const AVAILABLE_MODELS = [
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
];

export default function AgentConfigSection() {
  const { gameState } = useGame();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<Record<string, AgentConfig>>({});
  const [wandbConfig, setWandbConfig] = useState<WandbConfig>({
    enabled: false,
    project: "nexus-agents",
    entity: ""
  });
  const [wandbApiKey, setWandbApiKey] = useState("");

  const headers = { 'x-session-token': gameState.sessionToken };

  const { data: savedConfigs, isLoading, refetch } = useQuery({
    queryKey: ["admin-agent-config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/agent-config", { headers });
      if (!response.ok) throw new Error("Failed to load config");
      return response.json();
    },
    enabled: gameState.devMode
  });

  const { data: savedWandBConfig } = useQuery({
    queryKey: ["admin-wandb-config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/wandb-config", { headers });
      if (!response.ok) throw new Error("Failed to load W&B config");
      return response.json();
    },
    enabled: gameState.devMode
  });

  useEffect(() => {
    if (savedConfigs) {
      setConfigs(savedConfigs);
    }
  }, [savedConfigs]);

  useEffect(() => {
    if (savedWandBConfig) {
      setWandbConfig(savedWandBConfig);
    }
  }, [savedWandBConfig]);

  const updateAgentConfig = useMutation({
    mutationFn: async ({ agentId, config }: { agentId: string; config: AgentConfig }) => {
      const response = await apiRequest("PUT", "/api/admin/agent-config", {
        agentId,
        ...config
      }, { 'x-session-token': gameState.sessionToken });
      return response.json();
    },
    onSuccess: (_, { agentId }) => {
      toast({ title: "Config Saved", description: `${agentId} configuration updated` });
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    }
  });

  const updateWandbConfig = useMutation({
    mutationFn: async (config: WandbConfig & { apiKey?: string }) => {
      const response = await apiRequest("PUT", "/api/admin/wandb-config", config, {
        'x-session-token': gameState.sessionToken
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "W&B Config Saved", description: "Weights & Biases configuration updated" });
      setWandbApiKey("");
    },
    onError: (error: Error) => {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    }
  });

  if (!gameState.devMode) {
    return (
      <Card className="border-red-900/50 bg-red-950/20">
        <CardContent className="flex items-center gap-4 p-6">
          <Lock className="w-8 h-8 text-red-400" />
          <div>
            <h3 className="font-semibold text-red-400">Admin Access Required</h3>
            <p className="text-stone-400">Enable DevMode to access agent configuration.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const getAgentConfig = (agentId: string): AgentConfig => {
    return configs[agentId] || {};
  };

  const updateLocalConfig = (agentId: string, updates: Partial<AgentConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...updates }
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="border-amber-900/50 bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Settings className="w-5 h-5" />
            Agent Base Instructions
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Protected configuration - users can add to these but cannot override
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {SECURITY_AGENTS.map((agent) => {
              const IconComponent = iconMap[agent.icon] || Bot;
              const config = getAgentConfig(agent.id);
              
              return (
                <AccordionItem key={agent.id} value={agent.id} className="border border-stone-800 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-amber-400" />
                      <span className="font-medium">{agent.name}</span>
                      <Badge variant="outline" className="text-xs border-stone-600">
                        {agent.role}
                      </Badge>
                      {config.updatedAt && (
                        <Badge className="text-xs bg-teal-900/30 text-teal-400 border-teal-700">
                          Modified
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div>
                      <Label className="text-stone-400">Base Instructions</Label>
                      <Textarea
                        value={config.baseInstructions || agent.baseInstructions}
                        onChange={(e) => updateLocalConfig(agent.id, { baseInstructions: e.target.value })}
                        className="mt-2 min-h-[200px] bg-black/50 border-stone-700 font-mono text-sm"
                        data-testid={`config-instructions-${agent.id}`}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-stone-400">Model Override</Label>
                        <Select 
                          value={config.model || agent.defaultModel}
                          onValueChange={(v) => updateLocalConfig(agent.id, { model: v })}
                        >
                          <SelectTrigger className="mt-2 bg-black/50 border-stone-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_MODELS.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-stone-400">
                          Temperature: {(config.temperature ?? agent.defaultTemperature).toFixed(2)}
                        </Label>
                        <Slider
                          value={[config.temperature ?? agent.defaultTemperature]}
                          onValueChange={([v]) => updateLocalConfig(agent.id, { temperature: v })}
                          min={0}
                          max={1}
                          step={0.05}
                          className="mt-4"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => updateAgentConfig.mutate({ agentId: agent.id, config: config })}
                      disabled={updateAgentConfig.isPending}
                      className="bg-amber-600 hover:bg-amber-700"
                      data-testid={`save-config-${agent.id}`}
                    >
                      {updateAgentConfig.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Configuration
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-purple-900/50 bg-black/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Bot className="w-5 h-5" />
            Weights & Biases Monitoring
          </CardTitle>
          <CardDescription>Track agent performance and model metrics (admin only)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-stone-300">Enable W&B Logging</Label>
            <Switch
              checked={wandbConfig.enabled}
              onCheckedChange={(enabled) => setWandbConfig(prev => ({ ...prev, enabled }))}
              data-testid="wandb-toggle"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-stone-400">Project Name</Label>
              <Input
                value={wandbConfig.project}
                onChange={(e) => setWandbConfig(prev => ({ ...prev, project: e.target.value }))}
                className="mt-2 bg-black/50 border-stone-700"
                placeholder="nexus-agents"
                data-testid="wandb-project"
              />
            </div>
            <div>
              <Label className="text-stone-400">Entity (Team/Username)</Label>
              <Input
                value={wandbConfig.entity}
                onChange={(e) => setWandbConfig(prev => ({ ...prev, entity: e.target.value }))}
                className="mt-2 bg-black/50 border-stone-700"
                placeholder="your-wandb-username"
                data-testid="wandb-entity"
              />
            </div>
          </div>

          <div>
            <Label className="text-stone-400">API Key (leave blank to keep existing)</Label>
            <Input
              type="password"
              value={wandbApiKey}
              onChange={(e) => setWandbApiKey(e.target.value)}
              className="mt-2 bg-black/50 border-stone-700"
              placeholder="••••••••••••••••"
              data-testid="wandb-apikey"
            />
          </div>

          <Button
            onClick={() => updateWandbConfig.mutate({ 
              ...wandbConfig, 
              apiKey: wandbApiKey || undefined 
            })}
            disabled={updateWandbConfig.isPending}
            className="bg-purple-600 hover:bg-purple-700"
            data-testid="save-wandb-config"
          >
            {updateWandbConfig.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save W&B Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
