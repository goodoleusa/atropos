import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Minimize2, 
  Settings2, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Check,
  Gauge,
  Cpu,
  Play,
  Users,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { CAPABILITY_MODULES, buildSystemPrompt, CONTEXT_COMPRESSION_PROMPT } from '@/config/agentPrompts';
import { LearningSettings } from '@/components/LearningSettings';

type ModuleKey = keyof typeof CAPABILITY_MODULES;

export interface PromptConfig {
  modules: ModuleKey[];
  compressedContext: string;
  taskFocus: string;
  maxTokens: number;
  temperature: number;
}

interface PromptStudioProps {
  messages: Array<{ role: string; content: string }>;
  currentConfig: PromptConfig;
  onConfigChange: (config: PromptConfig) => void;
  onCompress: () => void;
  isCompressing?: boolean;
  className?: string;
}

const moduleInfo: Record<ModuleKey, { name: string; icon: string; desc: string }> = {
  payload_exec: { name: 'Payloads', icon: '⚡', desc: 'QR payload execution' },
  terminal_cmds: { name: 'Terminal', icon: '💻', desc: 'Unix commands' },
  clue_system: { name: 'Clues', icon: '🔍', desc: 'Clue tracking' },
  crypto_puzzles: { name: 'Crypto', icon: '🔐', desc: 'Cipher decoding' },
  osint_recon: { name: 'OSINT', icon: '🎯', desc: 'Reconnaissance' }
};

export function PromptStudio({
  messages,
  currentConfig,
  onConfigChange,
  onCompress,
  isCompressing = false,
  className = ''
}: PromptStudioProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const estimatedTokens = useMemo(() => {
    const systemPrompt = buildSystemPrompt({ modules: currentConfig.modules });
    const contextTokens = Math.ceil((currentConfig.compressedContext?.length || 0) / 4);
    const systemTokens = Math.ceil(systemPrompt.length / 4);
    const messageTokens = messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0);
    return { system: systemTokens, context: contextTokens, messages: messageTokens, total: systemTokens + contextTokens + messageTokens };
  }, [currentConfig, messages]);

  const toggleModule = (mod: ModuleKey) => {
    const newModules = currentConfig.modules.includes(mod)
      ? currentConfig.modules.filter(m => m !== mod)
      : [...currentConfig.modules, mod];
    onConfigChange({ ...currentConfig, modules: newModules });
  };

  const copySystemPrompt = () => {
    const prompt = buildSystemPrompt({ 
      modules: currentConfig.modules,
      compressed_context: currentConfig.compressedContext,
      task_focus: currentConfig.taskFocus
    });
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokenBudgetPercent = Math.min(100, (estimatedTokens.total / currentConfig.maxTokens) * 100);

  return (
    <div className={`bg-[hsl(var(--card))] border border-amber-900/30 rounded-lg overflow-hidden ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber-900/10 transition-colors">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-amber-800" />
              <span className="text-xs font-bold text-amber-800">PROMPT STUDIO</span>
              <Badge variant="outline" className="text-[9px] border-amber-800 text-amber-800">
                {currentConfig.modules.length} modules
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-muted-foreground" />
                <span className={`text-[10px] ${tokenBudgetPercent > 80 ? 'text-red-700' : 'text-muted-foreground'}`}>
                  ~{estimatedTokens.total} tokens
                </span>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-amber-900/20 p-3 space-y-4">
            {/* Module Toggles */}
            <div>
              <Label className="text-amber-700 text-[10px] uppercase mb-2 block">Active Modules</Label>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(moduleInfo) as ModuleKey[]).map(mod => (
                  <button
                    key={mod}
                    onClick={() => toggleModule(mod)}
                    className={`px-2 py-1 rounded text-[10px] transition-all flex items-center gap-1 ${
                      currentConfig.modules.includes(mod)
                        ? 'bg-amber-700/30 border border-amber-600/50 text-amber-800'
                        : 'bg-black/30 border border-border text-muted-foreground hover:border-muted'
                    }`}
                    title={moduleInfo[mod].desc}
                  >
                    <span>{moduleInfo[mod].icon}</span>
                    <span>{moduleInfo[mod].name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Token Budget */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-amber-700 text-[10px] uppercase">Token Budget</Label>
                <span className="text-[10px] text-muted-foreground">{estimatedTokens.total} / {currentConfig.maxTokens}</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${tokenBudgetPercent > 80 ? 'bg-red-500' : tokenBudgetPercent > 50 ? 'bg-amber-500' : 'bg-teal-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${tokenBudgetPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                <span>System: {estimatedTokens.system}</span>
                <span>Context: {estimatedTokens.context}</span>
                <span>Messages: {estimatedTokens.messages}</span>
              </div>
            </div>

            {/* Compression Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompress();
                }}
                disabled={isCompressing || messages.length < 3}
                className="flex-1 bg-teal-700 hover:bg-teal-600 text-black text-xs h-8"
              >
                {isCompressing ? (
                  <>
                    <Minimize2 className="w-3 h-3 mr-1 animate-pulse" /> Compressing...
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3 h-3 mr-1" /> Compress Context
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={copySystemPrompt}
                className="border-amber-800 text-amber-800 h-8"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>

            {/* Compressed Context Preview */}
            {currentConfig.compressedContext && (
              <div className="bg-teal-950/20 border border-teal-900/30 rounded p-2">
                <Label className="text-teal-600 text-[9px] uppercase mb-1 block">Compressed Context</Label>
                <p className="text-[10px] text-teal-800 font-mono line-clamp-3">
                  {currentConfig.compressedContext}
                </p>
              </div>
            )}

            {/* Learning Profile Settings */}
            <LearningSettings compact={true} />

            {/* Temperature Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-amber-700 text-[10px] uppercase">Temperature</Label>
                <span className="text-[10px] text-muted-foreground">{currentConfig.temperature.toFixed(1)}</span>
              </div>
              <Slider
                value={[currentConfig.temperature]}
                onValueChange={([v]) => onConfigChange({ ...currentConfig, temperature: v })}
                min={0}
                max={2}
                step={0.1}
                className="py-2"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface ModelBattlegroundProps {
  prompt: string;
  systemPrompt: string;
  availableModels: Array<{ id: string; name: string }>;
  onCompare: (models: string[]) => Promise<Record<string, { response: string; latency: number }>>;
}

export function ModelBattleground({ 
  prompt, 
  systemPrompt, 
  availableModels,
  onCompare 
}: ModelBattlegroundProps) {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, { response: string; latency: number }>>({});
  const [isComparing, setIsComparing] = useState(false);

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(m => m !== modelId)
        : [...prev, modelId].slice(0, 4)
    );
  };

  const runComparison = async () => {
    if (selectedModels.length < 2) return;
    setIsComparing(true);
    setResults({});
    
    try {
      const comparisonResults = await onCompare(selectedModels);
      setResults(comparisonResults);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="bg-[hsl(var(--card))] border border-purple-900/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-700" />
          <h3 className="text-purple-700 font-bold text-sm">Model Battleground</h3>
        </div>
        <Badge variant="outline" className="border-purple-700 text-purple-700 text-[10px]">
          {selectedModels.length}/4 selected
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {availableModels.slice(0, 8).map(model => (
          <button
            key={model.id}
            onClick={() => toggleModel(model.id)}
            className={`p-2 rounded border text-left transition-all ${
              selectedModels.includes(model.id)
                ? 'border-purple-500 bg-purple-950/30'
                : 'border-border hover:border-muted'
            }`}
          >
            <p className="text-xs text-foreground truncate">{model.name}</p>
            <p className="text-[9px] text-muted-foreground truncate">{model.id}</p>
          </button>
        ))}
      </div>

      <Button
        onClick={runComparison}
        disabled={selectedModels.length < 2 || isComparing}
        className="w-full bg-purple-700 hover:bg-purple-600 text-white"
      >
        {isComparing ? (
          <>
            <Cpu className="w-4 h-4 mr-2 animate-spin" /> Running Comparison...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" /> Compare {selectedModels.length} Models
          </>
        )}
      </Button>

      {Object.keys(results).length > 0 && (
        <div className="grid gap-3">
          {selectedModels.map(modelId => {
            const result = results[modelId];
            if (!result) return null;
            
            return (
              <div key={modelId} className="bg-black/30 border border-border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-purple-700 font-bold">{modelId}</span>
                  <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">
                    {result.latency}ms
                  </Badge>
                </div>
                <ScrollArea className="h-24">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {result.response}
                  </p>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
