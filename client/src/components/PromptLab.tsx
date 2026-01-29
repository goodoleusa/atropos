import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Settings2, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Check,
  Gauge,
  Cpu,
  Play,
  BarChart3,
  Lock,
  Plus,
  Save,
  Sparkles,
  FlaskConical,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { CAPABILITY_MODULES, buildSystemPrompt } from '@/config/agentPrompts';
import { LearningSettings } from '@/components/LearningSettings';

type ModuleKey = keyof typeof CAPABILITY_MODULES;

export interface PromptLabConfig {
  modules: ModuleKey[];
  userInstructions: string;
  temperature: number;
  maxTokens: number;
}

interface AdminPrompt {
  id: number;
  key: string;
  name: string;
  content: string;
  category: string;
  isActive: boolean;
  version: number;
}

interface PromptLabProps {
  messages?: Array<{ role: string; content: string }>;
  config: PromptLabConfig;
  onConfigChange: (config: PromptLabConfig) => void;
  isAdmin?: boolean;
  onCompare?: (models: string[], prompt: string) => Promise<Record<string, { response: string; latency: number }>>;
  availableModels?: Array<{ id: string; name: string }>;
  className?: string;
}

const moduleInfo: Record<ModuleKey, { name: string; icon: string; desc: string }> = {
  payload_exec: { name: 'Payloads', icon: '⚡', desc: 'QR payload execution' },
  terminal_cmds: { name: 'Terminal', icon: '💻', desc: 'Unix commands' },
  clue_system: { name: 'Clues', icon: '🔍', desc: 'Clue tracking' },
  crypto_puzzles: { name: 'Crypto', icon: '🔐', desc: 'Cipher decoding' },
  osint_recon: { name: 'OSINT', icon: '🎯', desc: 'Reconnaissance' }
};

const DEFAULT_MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'google/gemini-flash-1.5', name: 'Gemini Flash' },
  { id: 'mistralai/mistral-nemo', name: 'Mistral Nemo' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B' }
];

export function PromptLab({
  messages = [],
  config,
  onConfigChange,
  isAdmin = false,
  onCompare,
  availableModels = DEFAULT_MODELS,
  className = ''
}: PromptLabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'tune' | 'compare' | 'admin'>('tune');
  const [copied, setCopied] = useState(false);
  const [masterPrompt, setMasterPrompt] = useState<AdminPrompt | null>(null);
  const [editingMaster, setEditingMaster] = useState('');
  const [savingMaster, setSavingMaster] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  
  // Battleground state
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [testPrompt, setTestPrompt] = useState('');
  const [results, setResults] = useState<Record<string, { response: string; latency: number }>>({});
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadMasterPrompt();
    }
  }, [isAdmin]);

  const loadMasterPrompt = async () => {
    try {
      const res = await fetch('/api/admin/prompts/master_system');
      if (res.ok) {
        const data = await res.json();
        setMasterPrompt(data);
        setEditingMaster(data.content);
      }
    } catch (e) {
      console.error('Failed to load master prompt:', e);
    }
  };

  const saveMasterPrompt = async () => {
    setSavingMaster(true);
    try {
      await fetch('/api/admin/prompts/master_system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingMaster })
      });
      await loadMasterPrompt();
    } catch (e) {
      console.error('Failed to save master prompt:', e);
    }
    setSavingMaster(false);
  };

  const estimatedTokens = useMemo(() => {
    const systemPrompt = buildSystemPrompt({ modules: config.modules });
    const masterTokens = Math.ceil((masterPrompt?.content?.length || 0) / 4);
    const systemTokens = Math.ceil(systemPrompt.length / 4);
    const userTokens = Math.ceil((config.userInstructions?.length || 0) / 4);
    const messageTokens = messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0);
    return { 
      master: masterTokens,
      system: systemTokens, 
      user: userTokens, 
      messages: messageTokens, 
      total: masterTokens + systemTokens + userTokens + messageTokens 
    };
  }, [config, messages, masterPrompt]);

  const toggleModule = (mod: ModuleKey) => {
    const newModules = config.modules.includes(mod)
      ? config.modules.filter(m => m !== mod)
      : [...config.modules, mod];
    onConfigChange({ ...config, modules: newModules });
  };

  const copyFullPrompt = () => {
    const fullPrompt = buildFullPrompt();
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildFullPrompt = () => {
    let prompt = '';
    if (masterPrompt?.content) {
      prompt += `## MASTER SYSTEM\n${masterPrompt.content}\n\n`;
    }
    prompt += buildSystemPrompt({ 
      modules: config.modules
    });
    if (config.userInstructions) {
      prompt += `\n\n## USER INSTRUCTIONS\n${config.userInstructions}`;
    }
    return prompt;
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(m => m !== modelId)
        : [...prev, modelId].slice(0, 4)
    );
  };

  const runComparison = async () => {
    if (selectedModels.length < 2 || !testPrompt.trim() || !onCompare) return;
    setIsComparing(true);
    setResults({});
    
    try {
      const comparisonResults = await onCompare(selectedModels, testPrompt);
      setResults(comparisonResults);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const tokenBudgetPercent = Math.min(100, (estimatedTokens.total / config.maxTokens) * 100);

  return (
    <div className={`bg-[#0a0500] border border-amber-900/30 rounded-lg overflow-hidden ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber-900/10 transition-colors">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-purple-400">PROMPT LAB</span>
              <Badge variant="outline" className="text-[9px] border-purple-800 text-purple-500">
                {config.modules.length} modules
              </Badge>
              {isAdmin && (
                <Badge className="text-[9px] bg-red-900/30 text-red-400 border-red-800">
                  ADMIN
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-stone-600" />
                <span className={`text-[10px] ${tokenBudgetPercent > 80 ? 'text-red-500' : 'text-stone-500'}`}>
                  ~{estimatedTokens.total} tokens
                </span>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-purple-900/20">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="w-full bg-black/30 border-b border-purple-900/20 rounded-none h-9">
                <TabsTrigger value="tune" className="text-xs data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-400">
                  <Settings2 className="w-3 h-3 mr-1" /> Tune
                </TabsTrigger>
                <TabsTrigger value="compare" className="text-xs data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-400">
                  <BarChart3 className="w-3 h-3 mr-1" /> Compare
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="admin" className="text-xs data-[state=active]:bg-red-900/30 data-[state=active]:text-red-400">
                    <Lock className="w-3 h-3 mr-1" /> Admin
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Tune Tab */}
              <TabsContent value="tune" className="p-3 space-y-4 m-0">
                {/* Module Toggles */}
                <div>
                  <Label className="text-purple-700 text-[10px] uppercase mb-2 block">Active Modules</Label>
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(moduleInfo) as ModuleKey[]).map(mod => (
                      <button
                        key={mod}
                        onClick={() => toggleModule(mod)}
                        className={`px-2 py-1 rounded text-[10px] transition-all flex items-center gap-1 ${
                          config.modules.includes(mod)
                            ? 'bg-purple-700/30 border border-purple-600/50 text-purple-400'
                            : 'bg-black/30 border border-stone-800 text-stone-500 hover:border-stone-600'
                        }`}
                        title={moduleInfo[mod].desc}
                      >
                        <span>{moduleInfo[mod].icon}</span>
                        <span>{moduleInfo[mod].name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Instructions */}
                <div>
                  <Label className="text-purple-700 text-[10px] uppercase mb-2 block">
                    Your Instructions (appended to system prompt)
                  </Label>
                  <Textarea
                    value={config.userInstructions}
                    onChange={(e) => onConfigChange({ ...config, userInstructions: e.target.value })}
                    placeholder="Add custom instructions for the AI agent..."
                    className="h-20 text-xs bg-black/30 border-purple-900/30 text-stone-300 resize-none"
                  />
                </div>

                {/* Token Budget */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-purple-700 text-[10px] uppercase">Token Budget</Label>
                    <span className="text-[10px] text-stone-500">{estimatedTokens.total} / {config.maxTokens}</span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${tokenBudgetPercent > 80 ? 'bg-red-500' : tokenBudgetPercent > 50 ? 'bg-amber-500' : 'bg-purple-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${tokenBudgetPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-stone-600 mt-1">
                    {isAdmin && <span>Master: {estimatedTokens.master}</span>}
                    <span>System: {estimatedTokens.system}</span>
                    <span>User: {estimatedTokens.user}</span>
                    <span>History: {estimatedTokens.messages}</span>
                  </div>
                </div>

                {/* Learning Settings */}
                <LearningSettings compact={true} />

                {/* Temperature */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-purple-700 text-[10px] uppercase">Temperature</Label>
                    <span className="text-[10px] text-stone-500">{config.temperature.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={([v]) => onConfigChange({ ...config, temperature: v })}
                    min={0}
                    max={2}
                    step={0.1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-[9px] text-stone-600">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Copy Button */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                    className="flex-1 border-purple-800 text-purple-400 h-8 text-xs"
                  >
                    {showSystemPrompt ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {showSystemPrompt ? 'Hide' : 'Preview'} Prompt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyFullPrompt}
                    className="border-purple-800 text-purple-400 h-8"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>

                {showSystemPrompt && (
                  <div className="bg-black/50 border border-purple-900/30 rounded p-2">
                    <Label className="text-purple-600 text-[9px] uppercase mb-1 block">Full System Prompt</Label>
                    <ScrollArea className="h-32">
                      <pre className="text-[10px] text-stone-400 whitespace-pre-wrap font-mono">
                        {buildFullPrompt()}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </TabsContent>

              {/* Compare Tab - Model Battleground */}
              <TabsContent value="compare" className="p-3 space-y-4 m-0">
                <div className="flex items-center justify-between">
                  <Label className="text-purple-700 text-[10px] uppercase">Select Models (2-4)</Label>
                  <Badge variant="outline" className="border-purple-700 text-purple-400 text-[9px]">
                    {selectedModels.length}/4
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => toggleModel(model.id)}
                      className={`p-2 rounded border text-left transition-all ${
                        selectedModels.includes(model.id)
                          ? 'border-purple-500 bg-purple-950/30'
                          : 'border-stone-800 hover:border-stone-600'
                      }`}
                    >
                      <p className="text-xs text-stone-300 truncate">{model.name}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <Label className="text-purple-700 text-[10px] uppercase mb-2 block">Test Prompt</Label>
                  <Textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter a prompt to test across models..."
                    className="h-16 text-xs bg-black/30 border-purple-900/30 text-stone-300 resize-none"
                  />
                </div>

                <Button
                  onClick={runComparison}
                  disabled={selectedModels.length < 2 || !testPrompt.trim() || isComparing || !onCompare}
                  className="w-full bg-purple-700 hover:bg-purple-600 text-white"
                >
                  {isComparing ? (
                    <>
                      <Cpu className="w-4 h-4 mr-2 animate-spin" /> Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" /> Compare Models
                    </>
                  )}
                </Button>

                {Object.keys(results).length > 0 && (
                  <div className="grid gap-3">
                    {selectedModels.map(modelId => {
                      const result = results[modelId];
                      if (!result) return null;
                      
                      return (
                        <div key={modelId} className="bg-black/30 border border-stone-800 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-purple-400 font-bold">
                              {availableModels.find(m => m.id === modelId)?.name || modelId}
                            </span>
                            <Badge variant="outline" className="text-[9px] border-stone-700 text-stone-500">
                              {result.latency}ms
                            </Badge>
                          </div>
                          <ScrollArea className="h-24">
                            <p className="text-xs text-stone-400 whitespace-pre-wrap">
                              {result.response}
                            </p>
                          </ScrollArea>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Admin Tab */}
              {isAdmin && (
                <TabsContent value="admin" className="p-3 space-y-4 m-0">
                  <div className="flex items-center gap-2 p-2 bg-red-950/20 border border-red-900/30 rounded">
                    <Lock className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-400">Master System Prompt - applies to ALL agents</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-red-700 text-[10px] uppercase">Master Prompt (v{masterPrompt?.version || 1})</Label>
                      <Badge variant="outline" className="text-[9px] border-red-800 text-red-400">
                        {Math.ceil((editingMaster?.length || 0) / 4)} tokens
                      </Badge>
                    </div>
                    <Textarea
                      value={editingMaster}
                      onChange={(e) => setEditingMaster(e.target.value)}
                      placeholder="Enter the master system prompt that applies to all AI agents..."
                      className="h-48 text-xs bg-black/30 border-red-900/30 text-stone-300 font-mono resize-none"
                    />
                  </div>

                  <Button
                    onClick={saveMasterPrompt}
                    disabled={savingMaster || editingMaster === masterPrompt?.content}
                    className="w-full bg-red-700 hover:bg-red-600 text-white"
                  >
                    {savingMaster ? (
                      <>
                        <Cpu className="w-4 h-4 mr-2 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Save Master Prompt
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] text-stone-600">
                    Users can add their own instructions, but they cannot see or modify this master prompt.
                    Changes take effect immediately for all new conversations.
                  </p>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
