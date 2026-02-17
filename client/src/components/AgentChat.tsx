import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGame } from '@/hooks/useGameSession';
import { useReportContext, detectFindingFromMessage } from '@/hooks/useReportContext';
import { Bot, Send, Loader2, Zap, Terminal, QrCode, Rocket, ArrowLeft, Clock, Target, Copy, Download, Save, ExternalLink as ExternalLinkIcon, Settings2, FileText, GraduationCap, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { AGENT_CAMPAIGNS, getDifficultyColor, type Campaign, type CampaignTargetField, type TargetFieldType } from '@/config/agentCampaigns';
import { toast } from "@/hooks/use-toast";
import { PromptStudio, type PromptConfig } from './PromptStudio';
import { MissionBriefing } from './MissionBriefing';
import { LearningStyleBadge } from './LearningStyleBadge';
import { type AIMission, type AICurriculumTrack } from '@/config/aiCurriculum';
import { useCurriculum } from '@/hooks/useCurriculum';
import { buildSystemPrompt, generateCompressionRequest, CAPABILITY_MODULES, MEMORY_TRIGGERS } from '@/config/agentPrompts';
import { exportAgentSessionToReport } from '@/lib/reportExporter';
import { useLearningStore } from '@/stores/useLearningStore';

// OpenRouter models - January 2026
// Organized by category with easy shortcuts
const MODELS = {
  // Premium paid models
  paid: [
    { id: 'openai/gpt-4o', short: 'gpt4o', name: 'GPT-4o', desc: 'OpenAI flagship' },
    { id: 'openai/gpt-4o-mini', short: 'gpt4m', name: 'GPT-4o Mini', desc: 'Fast & cheap' },
    { id: 'anthropic/claude-sonnet-4', short: 'claude', name: 'Claude Sonnet 4', desc: 'Anthropic best' },
  ],
  // Kimi models (user favorite)
  kimi: [
    { id: 'moonshotai/kimi-k2.5', short: 'kimi', name: 'Kimi K2.5', desc: 'Latest Moonshot' },
    { id: 'moonshotai/kimi-k2-thinking', short: 'kimiT', name: 'Kimi K2 Thinking', desc: 'With reasoning' },
  ],
  // Nemotron models (user favorite)  
  nemotron: [
    { id: 'nvidia/nemotron-4-340b-instruct:free', short: 'nemo', name: 'Nemotron-4 340B', desc: 'NVIDIA powerhouse' },
    { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', short: 'nemo70', name: 'Llama Nemotron 70B', desc: 'Optimized 70B' },
  ],
  // Coding specialists
  code: [
    { id: 'mistralai/codestral-2405:free', short: 'code', name: 'Codestral', desc: 'Mistral coder' },
    { id: 'qwen/qwen-2.5-coder-32b-instruct:free', short: 'qwen', name: 'Qwen 2.5 Coder', desc: 'State of the art coder' },
    { id: 'deepseek/deepseek-coder:free', short: 'ds', name: 'DeepSeek Coder', desc: 'Powerful open coder' },
  ],
  // General purpose free
  general: [
    { id: 'meta-llama/llama-3.3-70b-instruct:free', short: 'llama', name: 'Llama 3.3 70B', desc: 'Meta flagship' },
    { id: 'google/gemini-2.0-flash-exp:free', short: 'gem', name: 'Gemini 2.0 Flash', desc: '1M context' },
    { id: 'deepseek/deepseek-r1:free', short: 'dsr1', name: 'DeepSeek R1', desc: 'Reasoning specialist' },
  ],
};

// Flatten for dropdown with category headers
const MODEL_LIST = [
  { id: 'header-paid', name: '── PAID ($) ──', disabled: true },
  ...MODELS.paid.map(m => ({ ...m, category: 'paid' })),
  { id: 'header-kimi', name: '── KIMI ──', disabled: true },
  ...MODELS.kimi.map(m => ({ ...m, category: 'kimi' })),
  { id: 'header-nemo', name: '── NEMOTRON ──', disabled: true },
  ...MODELS.nemotron.map(m => ({ ...m, category: 'nemotron' })),
  { id: 'header-code', name: '── CODING ──', disabled: true },
  ...MODELS.code.map(m => ({ ...m, category: 'code' })),
  { id: 'header-gen', name: '── GENERAL ──', disabled: true },
  ...MODELS.general.map(m => ({ ...m, category: 'general' })),
];

// Quick lookup by shortcut
const MODEL_SHORTCUTS: Record<string, string> = {};
Object.values(MODELS).flat().forEach(m => {
  MODEL_SHORTCUTS[m.short] = m.id;
  MODEL_SHORTCUTS[m.short.toLowerCase()] = m.id;
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  scanSuggestions?: Array<{ script: string; target: string; match: string }>;
}

interface AgentChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPayload?: string;
}

type ModuleKey = keyof typeof CAPABILITY_MODULES;

const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  modules: ['terminal_cmds', 'clue_system', 'osint_recon', 'atropos_scans'] as ModuleKey[],
  compressedContext: '',
  taskFocus: '',
  maxTokens: 8000,
  temperature: 0.7
};

export const AgentChat = ({ open, onOpenChange, initialPayload }: AgentChatProps) => {
  const { gameState } = useGame();
  const { addAgentMessage, addToolOutput, currentSession, startSession, setCampaign: setContextCampaign, addTarget } = useReportContext();
  const getLearningProfile = useLearningStore((state) => state.getFullPromptModifier);
  const { allTracks: ALL_CURRICULUM_TRACKS } = useCurriculum();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('moonshotai/kimi-k2.5');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showCampaigns, setShowCampaigns] = useState(true);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [promptConfig, setPromptConfig] = useState<PromptConfig>(DEFAULT_PROMPT_CONFIG);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPromptStudio, setShowPromptStudio] = useState(false);
  const [captureEnabled, setCaptureEnabled] = useState(false);
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [pendingCampaign, setPendingCampaign] = useState<Campaign | null>(null);
  const [targetValues, setTargetValues] = useState<Record<string, string>>({});
  const [useDummyTargets, setUseDummyTargets] = useState(false);
  const [showMissionBriefing, setShowMissionBriefing] = useState(false);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>(
    () => JSON.parse(localStorage.getItem('atropos_completed_exercises') || '[]')
  );

  // Auto-start session only when capture is enabled
  useEffect(() => {
    if (captureEnabled && messages.length === 1 && !currentSession) {
      startSession(`Agent Module - ${new Date().toLocaleDateString()}`);
    }
  }, [captureEnabled, messages.length, currentSession, startSession]);

  // Initialize with payload if provided
  useEffect(() => {
    if (initialPayload && open) {
      setInput(`Execute this payload:\n${initialPayload}`);
    }
  }, [initialPayload, open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createConversation = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || 'sy-corp-dev-token'
        },
        body: JSON.stringify({ title: `Agent Session ${Date.now()}` })
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      return data.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  };

  const mapTargetType = (type: TargetFieldType) => {
    switch (type) {
      case 'domain':
        return 'domain';
      case 'ip':
        return 'ip';
      case 'url':
        return 'url';
      case 'api':
        return 'api';
      case 'system':
        return 'system';
      default:
        return 'custom';
    }
  };

  const buildTargetSummary = (fields: CampaignTargetField[], values: Record<string, string>) => {
    const lines = fields
      .map((field) => {
        const value = values[field.key]?.trim();
        if (!value) return null;
        return `- ${field.label}: ${value}`;
      })
      .filter(Boolean);
    return lines.length > 0 ? lines.join('\n') : 'None';
  };

  const startAgentModule = (campaign: Campaign, values: Record<string, string>) => {
    const targetFields = campaign.targetFields || [];
    const targetSummary = buildTargetSummary(targetFields, values);
    const learningProfile = getLearningProfile();

    startSession(`Agent Module - ${campaign.name}`);
    setContextCampaign(campaign.id);
    setCaptureEnabled(true);

    targetFields.forEach((field) => {
      const value = values[field.key]?.trim();
      if (!value) return;
      addTarget({
        type: mapTargetType(field.type),
        value,
        name: field.label,
        notes: field.helpText
      });
    });

    setActiveCampaign(campaign);
    setShowCampaigns(false);
    
    // Auto-enable capture and start session when campaign is selected
    setCaptureEnabled(true);
    if (!currentSession) {
      startSession(`${campaign.name} - ${new Date().toLocaleDateString()}`);
    }
    setContextCampaign(campaign.id);

    setPromptConfig((prev) => ({
      ...prev,
      taskFocus: `Agent Module: ${campaign.name}\n\nObjectives:\n- ${campaign.objectives.join('\n- ')}\n\nTargets:\n${targetSummary}\n\n${learningProfile}`
    }));

    setInput(`${campaign.starterPrompt}\n\nTargets:\n${targetSummary}`);
  };

  const openTargetSetup = (campaign: Campaign) => {
    setPendingCampaign(campaign);
    setTargetValues(campaign.dummyTargets || {});
    setUseDummyTargets(false);
    setTargetModalOpen(true);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    let userMessage = input.trim();
    
    // Handle model switching shortcuts like /kimi, /nemo, /gpt4o
    if (userMessage.startsWith('/')) {
      const shortcut = userMessage.slice(1).split(' ')[0].toLowerCase();
      if (MODEL_SHORTCUTS[shortcut]) {
        setSelectedModel(MODEL_SHORTCUTS[shortcut]);
        const remaining = userMessage.slice(shortcut.length + 1).trim();
        if (!remaining) {
          setInput('');
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Model switched to: ${shortcut.toUpperCase()}` 
          }]);
          return;
        }
        userMessage = remaining;
      }
    }
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    const shouldCapture = captureEnabled && !!activeCampaign;

    // Track in shared context only when capture is enabled
    if (shouldCapture) {
      addAgentMessage({ role: 'user', content: userMessage, model: selectedModel, campaign: activeCampaign?.id });
    }

    try {
      // Ensure we have a conversation
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation();
        setConversationId(convId);
      }

      if (!convId) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'ERROR: Failed to initialize conversation. Please check your access token.' 
        }]);
        setLoading(false);
        return;
      }

      // Load admin config for system prompt customization
      const adminConfig = (() => {
        try {
          const saved = localStorage.getItem('nexus_agent_config');
          return saved ? JSON.parse(saved) : null;
        } catch { return null; }
      })();
      
      // Build dynamic system prompt based on config + admin overrides
      const dynamicSystemPrompt = buildSystemPrompt({
        modules: adminConfig?.enabledModules || promptConfig.modules,
        compressed_context: promptConfig.compressedContext,
        task_focus: promptConfig.taskFocus,
        coreOverride: adminConfig?.corePrompt,
        customInstructions: adminConfig?.customInstructions
      });
      
      const contextMessages = [
        { role: 'system', content: dynamicSystemPrompt },
        { role: 'system', content: `Current session token: ${gameState?.sessionToken?.substring(0, 8) || 'unknown'}... | Clues: ${gameState?.inventory?.length || 0} | Username: ${gameState?.username || 'Guest'}` },
        ...messages,
        { role: 'user', content: userMessage }
      ];

      // Stream response
      const response = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || 'sy-corp-dev-token'
        },
        body: JSON.stringify({ 
          content: userMessage,
          model: selectedModel,
          context: contextMessages,
          temperature: promptConfig.temperature,
          maxTokens: promptConfig.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMessage += data.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { 
                    role: 'assistant', 
                    content: assistantMessage 
                  };
                  return newMessages;
                });
              }
            } catch {}
          }
        }
      }
      // Track assistant response in shared context
      if (assistantMessage) {
        if (shouldCapture) {
          addAgentMessage({ role: 'assistant', content: assistantMessage, model: selectedModel, campaign: activeCampaign?.id });

          // Detect and track any findings
          const findingResult = detectFindingFromMessage(assistantMessage);
          if (findingResult?.detected) {
            addToolOutput({
              type: findingResult.type as any,
              source: 'agent',
              content: assistantMessage,
              metadata: { severity: findingResult.severity, model: selectedModel }
            });
          }
        }
        
        // Detect Atropos scan suggestions
        const scanSuggestions = detectScanSuggestions(assistantMessage);
        if (scanSuggestions.length > 0) {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === 'assistant') {
              lastMsg.scanSuggestions = scanSuggestions;
            }
            return newMessages;
          });
        }

        try {
          detectAndSubmitFeedback(assistantMessage, selectedModel);
          detectAndSubmitRecommendations(assistantMessage, selectedModel);
        } catch (_) {}
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'TRANSMISSION ERROR: Connection to NEXUS interrupted. Retry?' 
      }]);
    }

    setLoading(false);
  };

  const copySession = () => {
    const transcript = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n');
    const header = `NEXUS AGENT SESSION LOG\nDate: ${new Date().toLocaleString()}\nModel: ${selectedModel}\nModule: ${activeCampaign?.name || 'None'}\n\n`;
    navigator.clipboard.writeText(header + transcript);
    toast({
      title: "Transcript Copied",
      description: "Session history saved to clipboard.",
    });
  };

  const exportPrompt = () => {
    const dynamicSystemPrompt = buildSystemPrompt({
      modules: promptConfig.modules,
      compressed_context: promptConfig.compressedContext,
      task_focus: promptConfig.taskFocus
    });
    const config = {
      model: selectedModel,
      campaign: activeCampaign?.id,
      systemPrompt: dynamicSystemPrompt,
      promptConfig: promptConfig,
      timestamp: Date.now(),
      lastMessages: messages.slice(-5)
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Config Exported",
      description: "Agent configuration downloaded.",
    });
  };

  const sendToOptimizer = () => {
    const dynamicSystemPrompt = buildSystemPrompt({
      modules: promptConfig.modules,
      compressed_context: promptConfig.compressedContext,
      task_focus: promptConfig.taskFocus
    });
    // Navigate to prompt builder with state
    localStorage.setItem('prompt_builder_prefill', JSON.stringify({
      messages: messages.slice(-5).map(m => m.content),
      systemPrompt: dynamicSystemPrompt,
      promptConfig: promptConfig,
      model: selectedModel
    }));
    window.location.href = '/prompt-builder';
  };

  const exportToReport = () => {
    if (messages.length < 2) {
      toast({
        title: "Not Enough Data",
        description: "Have a conversation first before exporting a report.",
        variant: "destructive"
      });
      return;
    }
    
    exportAgentSessionToReport(
      messages,
      selectedModel,
      activeCampaign ? { id: activeCampaign.id, name: activeCampaign.name } : undefined,
      promptConfig,
      gameState?.sessionToken || 'unknown'
    );
    
    toast({
      title: "Report Generated",
      description: "Investigation report exported with ~70% auto-filled. Check your downloads.",
    });
  };

  const executePayload = async (payload: string) => {
    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload,
          sessionToken: gameState?.sessionToken || 'unknown',
          agentId: 'NEXUS-CHAT'
        })
      });
      const result = await response.json();
      return JSON.stringify(result, null, 2);
    } catch {
      return 'Execution failed';
    }
  };

  const executeAtroposScan = async (scriptPath: string, target: string) => {
    try {
      const response = await fetch('/api/atropos/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptPath,
          target,
          sessionToken: gameState?.sessionToken,
          investigationId: currentSession?.id,
          source: 'chat'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add scan result as tool output
        addToolOutput({
          type: 'scan',
          source: 'atropos',
          content: JSON.stringify(result.data, null, 2),
          metadata: { 
            scanId: result.scanId,
            script: scriptPath,
            target,
            scanType: 'osint',
            latencyMs: result.latencyMs
          }
        });
        
        return `Scan completed successfully. Found ${Array.isArray(result.data) ? result.data.length : 1} result(s). Results added to investigation.`;
      } else {
        return `Scan failed: ${result.error || 'Unknown error'}`;
      }
    } catch (error: any) {
      return `Scan execution error: ${error.message || 'Failed to execute scan'}`;
    }
  };

  // Detect Atropos scan suggestions in agent messages
  const detectScanSuggestions = (message: string): Array<{ script: string; target: string; match: string }> => {
    const suggestions: Array<{ script: string; target: string; match: string }> = [];
    
    // Pattern 1: [ATROPOS_SCAN:script:target]
    const explicitPattern = /\[ATROPOS_SCAN:([^:]+):([^\]]+)\]/g;
    let match;
    while ((match = explicitPattern.exec(message)) !== null) {
      suggestions.push({
        script: match[1].trim(),
        target: match[2].trim(),
        match: match[0]
      });
    }
    
    // Pattern 2: Detect common scan suggestions
    const scanKeywords = [
      { keyword: /subdomain/i, script: 'bbot_scanner.lua' },
      { keyword: /threat intelligence|shodan|virustotal/i, script: 'threat_intel_scanner.lua' },
      { keyword: /vulnerability|vuln|nuclei/i, script: 'nuclei_scanner.lua' },
      { keyword: /secret|credential|gitleaks/i, script: 'gitleaks_scanner.lua' },
      { keyword: /amass|subdomain enum/i, script: 'amass_osint.lua' }
    ];
    
    // Try to extract target from context (domain, IP, URL patterns)
    const targetPattern = /(?:scan|check|analyze|enumerate)\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3}|https?:\/\/[^\s]+)/i;
    const targetMatch = message.match(targetPattern);
    const extractedTarget = targetMatch ? targetMatch[1] : null;
    
    for (const { keyword, script } of scanKeywords) {
      if (keyword.test(message) && extractedTarget) {
        suggestions.push({
          script,
          target: extractedTarget,
          match: message.substring(Math.max(0, message.search(keyword) - 20), message.search(keyword) + 50)
        });
      }
    }
    
    return suggestions;
  };

  const feedbackSubmittedRef = useRef<Set<string>>(new Set());
  const feedbackCooldownRef = useRef<number>(0);
  const feedbackSessionCountRef = useRef<number>(0);
  const MAX_FEEDBACK_PER_SESSION = 20;
  const MAX_FEEDBACK_PER_MESSAGE = 3;
  const FEEDBACK_COOLDOWN_MS = 5000;

  const detectAndSubmitFeedback = useCallback((message: string, source: string) => {
    if (feedbackSessionCountRef.current >= MAX_FEEDBACK_PER_SESSION) return;
    const now = Date.now();
    if (now - feedbackCooldownRef.current < FEEDBACK_COOLDOWN_MS) return;

    const pattern = /\[FEEDBACK:(bug|feature|idea|pain_point):(low|medium|high|critical):([^:]+):([^\]]+)\]/g;
    const items: Array<{ type: string; priority: string; title: string; description: string }> = [];
    let match;
    let count = 0;
    while ((match = pattern.exec(message)) !== null && count < MAX_FEEDBACK_PER_MESSAGE) {
      const dedupKey = `${match[1]}:${match[3].trim().toLowerCase().slice(0, 60)}`;
      if (feedbackSubmittedRef.current.has(dedupKey)) continue;
      items.push({
        type: match[1],
        priority: match[2],
        title: match[3].trim().slice(0, 200),
        description: match[4].trim().slice(0, 2000),
      });
      feedbackSubmittedRef.current.add(dedupKey);
      count++;
    }

    if (items.length === 0) return;
    feedbackCooldownRef.current = now;

    for (const item of items) {
      if (feedbackSessionCountRef.current >= MAX_FEEDBACK_PER_SESSION) break;
      feedbackSessionCountRef.current++;
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          source: `agent:${source}`,
          tags: ['auto-reported', source],
        }),
      }).catch(() => {});
    }
  }, []);

  const recSubmittedRef = useRef<Set<string>>(new Set());
  const recCooldownRef = useRef<number>(0);
  const recSessionCountRef = useRef<number>(0);
  const MAX_RECS_PER_SESSION = 10;
  const MAX_RECS_PER_MESSAGE = 2;
  const REC_COOLDOWN_MS = 5000;

  const detectAndSubmitRecommendations = useCallback((message: string, source: string) => {
    if (recSessionCountRef.current >= MAX_RECS_PER_SESSION) return;
    const now = Date.now();
    if (now - recCooldownRef.current < REC_COOLDOWN_MS) return;

    const recPattern = /```recommendation\s*\n([\s\S]*?)```/g;
    let match;
    let count = 0;
    while ((match = recPattern.exec(message)) !== null && count < MAX_RECS_PER_MESSAGE) {
      try {
        const raw = match[1].trim();
        const rec = JSON.parse(raw);
        if (!rec.title || !rec.description || !rec.category || !rec.codeSnippet) continue;

        const dedupKey = `rec:${rec.category}:${rec.title.trim().toLowerCase().slice(0, 60)}`;
        if (recSubmittedRef.current.has(dedupKey)) continue;
        recSubmittedRef.current.add(dedupKey);

        const validCategories = ['code_snippet', 'file_edit', 'systemic', 'integration', 'new_tool'];
        if (!validCategories.includes(rec.category)) continue;

        recSessionCountRef.current++;
        count++;
        fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: rec.category,
            priority: rec.priority || 'medium',
            title: String(rec.title).trim().slice(0, 200),
            description: String(rec.description).trim().slice(0, 3000),
            targetFiles: Array.isArray(rec.targetFiles) ? rec.targetFiles.slice(0, 10) : [],
            codeSnippet: String(rec.codeSnippet).slice(0, 10000),
            codeLanguage: rec.codeLanguage || 'typescript',
            painPointsAddressed: Array.isArray(rec.painPointsAddressed) ? rec.painPointsAddressed.slice(0, 10) : [],
            estimatedImpact: rec.estimatedImpact ? String(rec.estimatedImpact).slice(0, 500) : null,
            source: `agent:${source}`,
            tags: ['auto-generated', source, rec.category],
          }),
        }).catch(() => {});
      } catch {
        continue;
      }
    }
    if (count > 0) recCooldownRef.current = now;
  }, []);

  const getActiveMission = (): AIMission | null => {
    if (!activeMissionId) return null;
    for (const track of ALL_CURRICULUM_TRACKS) {
      const mission = track.missions.find(m => m.id === activeMissionId);
      if (mission) return mission;
    }
    return null;
  };

  const markExerciseDone = (exerciseId: string) => {
    setCompletedExerciseIds(prev => {
      if (prev.includes(exerciseId)) return prev;
      const next = [...prev, exerciseId];
      localStorage.setItem('atropos_completed_exercises', JSON.stringify(next));
      return next;
    });
  };

  const goToNextExercise = () => {
    const mission = getActiveMission();
    if (!mission) return;
    const nextIdx = currentExerciseIdx + 1;
    if (nextIdx < mission.exercises.length) {
      setCurrentExerciseIdx(nextIdx);
      const exercise = mission.exercises[nextIdx];
      const adaptation = mission.teachingAdaptations[useLearningStore.getState().style];
      setInput(`Let's move to the next exercise: "${exercise.title}". ${exercise.instructions.slice(0, 200)}`);
      toast({ title: `Exercise ${nextIdx + 1}/${mission.exercises.length}`, description: exercise.title });
    } else {
      toast({ title: 'Mission Complete!', description: `You've finished all exercises in ${mission.name}` });
    }
  };

  const startAIMission = (mission: AIMission, track: AICurriculumTrack) => {
    const learningProfile = getLearningProfile();
    const adaptation = mission.teachingAdaptations[useLearningStore.getState().style];
    setActiveMissionId(mission.id);
    setCurrentExerciseIdx(0);
    setShowCampaigns(false);
    setShowMissionBriefing(false);
    setCaptureEnabled(true);

    if (!currentSession) {
      startSession(`AI Mission: ${mission.name}`);
    }

    const missionContext = `AI MASTERY MISSION: ${mission.name}
Track: ${track.name}
Difficulty: ${mission.difficulty}
XP Reward: ${mission.xpReward}

OBJECTIVES:
${mission.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}

EXERCISES:
${mission.exercises.map(e => `- [${e.type}] ${e.title}: ${e.instructions}`).join('\n')}

LEARNING STYLE ADAPTATION (${useLearningStore.getState().style}):
${adaptation}

KEY TAKEAWAYS TO TEACH:
${mission.keyTakeaways.map(t => `- ${t}`).join('\n')}

${learningProfile}`;

    setPromptConfig(prev => ({ ...prev, taskFocus: missionContext }));

    const starterPrompt = mission.exercises[0]
      ? `I'm starting the "${mission.name}" mission. Guide me through the first exercise: "${mission.exercises[0].title}". ${adaptation}`
      : `I'm starting the "${mission.name}" mission. Walk me through the objectives and help me get started.`;

    setInput(starterPrompt);

    setMessages([{
      role: 'system',
      content: `Mission loaded: ${mission.icon} ${mission.name}\nTrack: ${track.name}\n${mission.objectives.length} objectives · ${mission.exercises.length} exercises · ${mission.xpReward} XP`,
    }]);
  };

  const quickActions = [
    { label: 'Recon', payload: '{"type":"recon","scan":"full","targets":["routes","clues"]}' },
    { label: 'Exfil', payload: '{"type":"exfil","target":"session","fields":["token","clues"]}' },
    { label: 'Help', payload: 'What commands are available in this system?' },
  ];

  const startCampaign = (campaign: Campaign) => {
    const needsTargets = (campaign.targetFields || []).length > 0;
    if (needsTargets) {
      openTargetSetup(campaign);
      return;
    }

    startAgentModule(campaign, {});
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(null);
    setActiveCampaign(null);
    setShowCampaigns(true);
    setInput('');
    setPromptConfig(DEFAULT_PROMPT_CONFIG);
    setCaptureEnabled(false);
    setContextCampaign('');
    setActiveMissionId(null);
    setShowMissionBriefing(false);
  };

  // Compress conversation context using AI
  const compressContext = useCallback(async () => {
    if (messages.length < 3) return;
    
    setIsCompressing(true);
    try {
      const compressionRequest = generateCompressionRequest(messages);
      
      const response = await fetch('/api/chat/compress', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || ''
        },
        body: JSON.stringify({
          messages: [compressionRequest],
          model: selectedModel
        })
      });

      if (!response.ok) throw new Error('Compression failed');
      
      const data = await response.json();
      const compressed = data.content || data.compressed || '';
      
      setPromptConfig(prev => ({ ...prev, compressedContext: compressed }));
      
      toast({
        title: "Context Compressed",
        description: `Reduced ${messages.length} messages to a compact summary.`,
      });
    } catch (error) {
      console.error('Compression error:', error);
      toast({
        title: "Compression Failed",
        description: "Could not compress context. Try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompressing(false);
    }
  }, [messages, selectedModel]);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 font-mono w-[95vw] max-w-2xl h-[90vh] md:h-[80vh] flex flex-col p-3 md:p-6">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-amber-600 font-orbitron flex items-center gap-2 text-sm md:text-base">
              <Bot className="w-4 h-4 md:w-5 md:h-5" />
              NEXUS AGENT
              {activeCampaign && (
                <span className="text-xs text-teal-400 ml-2 hidden md:inline">
                  [{activeCampaign.name}]
                </span>
              )}
            </DialogTitle>
            {messages.length > 0 && (
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copySession}
                  title="Copy Transcript"
                  className="text-stone-500 hover:text-amber-500 h-7 w-7 p-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={exportPrompt}
                  title="Export Config"
                  className="text-stone-500 hover:text-amber-500 h-7 w-7 p-0"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={sendToOptimizer}
                  title="Send to Prompt Optimizer"
                  className="text-stone-500 hover:text-teal-500 h-7 w-7 p-0"
                >
                  <Rocket className="w-3.5 h-3.5 text-teal-600" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={exportToReport}
                  title="Export Investigation Report (70% auto-filled)"
                  className="text-stone-500 hover:text-purple-500 h-7 px-1"
                  data-testid="export-report"
                >
                  <Save className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-[9px] ml-0.5 hidden md:inline">Report</span>
                </Button>
                <div className="w-px h-4 bg-amber-900/20 mx-1" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetChat}
                  className="text-stone-500 hover:text-amber-500 h-7 text-xs"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" /> New Session
                </Button>
              </div>
            )}
          </div>
          
          {/* Model Selector - mobile optimized */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-black/50 border-amber-900/30 text-amber-500 text-xs h-7 w-full md:w-auto md:min-w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0500] border-amber-900/50 max-h-60">
                {MODEL_LIST.map((model: any) => (
                  model.disabled ? (
                    <div key={model.id} className="text-stone-600 text-[10px] px-2 py-1 font-bold">
                      {model.name}
                    </div>
                  ) : (
                    <SelectItem 
                      key={model.id} 
                      value={model.id}
                      className="text-amber-500 focus:bg-amber-900/30 focus:text-amber-400 text-xs"
                    >
                      <span className="font-mono text-amber-400">[{model.short}]</span> {model.name}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
            <span className="text-[9px] md:text-[10px] text-stone-600 bg-amber-900/20 px-2 py-0.5 rounded hidden md:inline">
              /kimi /nemo /gpt4o
            </span>
            <LearningStyleBadge />
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowMissionBriefing(!showMissionBriefing); if (!showMissionBriefing) setShowPromptStudio(false); }}
              className={`h-7 px-2 text-xs border-amber-900/30 ${showMissionBriefing ? 'bg-teal-900/30 text-teal-400 border-teal-900/30' : 'text-stone-500'}`}
              data-testid="toggle-mission-briefing"
            >
              <GraduationCap className="w-3 h-3 mr-1" />
              Missions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowPromptStudio(!showPromptStudio); if (!showPromptStudio) setShowMissionBriefing(false); }}
              className={`h-7 px-2 text-xs border-amber-900/30 ${showPromptStudio ? 'bg-amber-900/30 text-amber-400' : 'text-stone-500'}`}
              data-testid="toggle-prompt-studio"
            >
              <Settings2 className="w-3 h-3 mr-1" />
              Studio
            </Button>
          </div>
          
          {/* Mission Briefing Panel */}
          {showMissionBriefing && (
            <div className="mt-1.5 md:mt-2 max-h-[50vh] md:max-h-[40vh] overflow-y-auto bg-stone-950/50 rounded-lg border border-teal-900/30 p-2 md:p-3">
              <MissionBriefing
                onStartMission={startAIMission}
                onSuggestionChip={(text) => { setInput(text); setShowMissionBriefing(false); }}
                onClose={() => setShowMissionBriefing(false)}
                activeMissionId={activeMissionId}
              />
            </div>
          )}
          
          {/* Prompt Studio Panel */}
          {showPromptStudio && (
            <div className="mt-2">
              <PromptStudio
                messages={messages.map(m => ({ role: m.role, content: m.content }))}
                currentConfig={promptConfig}
                onConfigChange={setPromptConfig}
                onCompress={compressContext}
                isCompressing={isCompressing}
              />
            </div>
          )}
        </DialogHeader>

        {/* Mission Status Bar — compact single-line "you are here" */}
        {(() => {
          const mission = getActiveMission();
          if (!mission) return null;
          const exercise = mission.exercises[currentExerciseIdx];
          const totalEx = mission.exercises.length;
          const doneCount = mission.exercises.filter(e => completedExerciseIds.includes(e.id)).length;
          const progress = totalEx > 0 ? Math.round((doneCount / totalEx) * 100) : 0;

          return (
            <div className="flex-shrink-0 bg-teal-950/40 border-b border-teal-900/20 px-2 py-1 md:px-3 md:py-1" data-testid="mission-status-bar">
              <div className="flex items-center gap-1.5 min-h-[24px] md:min-h-[26px]">
                <span className="text-xs">{mission.icon}</span>
                <span className="text-[9px] md:text-[10px] font-medium text-teal-400 truncate max-w-[80px] md:max-w-[160px]">{mission.name}</span>
                <span className="text-[8px] md:text-[9px] text-stone-600">·</span>
                {exercise ? (
                  <span className="text-[8px] md:text-[9px] text-stone-400 truncate max-w-[100px] md:max-w-[200px]">
                    Step {currentExerciseIdx + 1}/{totalEx}: {exercise.title}
                  </span>
                ) : (
                  <span className="text-[8px] md:text-[9px] text-stone-500">{doneCount}/{totalEx}</span>
                )}
                {progress > 0 && (
                  <div className="hidden sm:block w-12 md:w-16 h-1 bg-stone-800 rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
                <div className="ml-auto flex items-center gap-0.5 flex-shrink-0">
                  {exercise && !completedExerciseIds.includes(exercise.id) && (
                    <button
                      onClick={() => markExerciseDone(exercise.id)}
                      className="p-1 rounded text-emerald-600 hover:text-emerald-400 hover:bg-emerald-900/20 transition-colors"
                      title="Mark step done"
                      data-testid="mark-exercise-done"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                    </button>
                  )}
                  {currentExerciseIdx < totalEx - 1 && (
                    <button
                      onClick={goToNextExercise}
                      className="p-1 rounded text-teal-600 hover:text-teal-400 hover:bg-teal-900/20 transition-colors"
                      title="Next step"
                      data-testid="next-exercise-btn"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowMissionBriefing(!showMissionBriefing)}
                    className="p-1 rounded text-stone-600 hover:text-amber-400 hover:bg-amber-900/20 transition-colors"
                    title="Mission briefing"
                    data-testid="open-briefing-btn"
                  >
                    <Target className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => { setActiveMissionId(null); setCurrentExerciseIdx(0); }}
                    className="p-1 rounded text-stone-700 hover:text-stone-400 hover:bg-stone-800/40 transition-colors"
                    title="Dismiss"
                    data-testid="dismiss-mission-bar"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-2 md:pr-4" ref={scrollRef}>
          <div className="space-y-3 md:space-y-4 py-2 md:py-4">
            {messages.length === 0 && showCampaigns && (
              <div className="space-y-4">
                {/* Module Header */}
                <div className="text-center py-2">
                  <Rocket className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-teal-500 opacity-70" />
                  <p className="text-sm md:text-base text-amber-500 font-bold">Choose an Agent Module</p>
                  <p className="text-[10px] md:text-xs text-stone-500 mt-1">Select a skill module or start a freeform session</p>
                </div>

                {/* Module Grid - Mobile Optimized */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {AGENT_CAMPAIGNS.slice(0, 8).map((campaign) => (
                    <button
                      key={campaign.id}
                      onClick={() => startCampaign(campaign)}
                      className="text-left p-3 bg-black/50 border border-amber-900/20 rounded-lg hover:border-amber-600/50 hover:bg-amber-900/10 transition-all group"
                      data-testid={`campaign-${campaign.id}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl md:text-2xl">{campaign.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-amber-500 font-bold text-xs md:text-sm truncate group-hover:text-amber-400">
                            {campaign.name}
                          </p>
                          <p className="text-stone-500 text-[10px] md:text-xs line-clamp-2 mt-0.5">
                            {campaign.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={`text-[9px] md:text-[10px] ${getDifficultyColor(campaign.difficulty)}`}>
                              {campaign.difficulty.toUpperCase()}
                            </span>
                            <span className="text-[9px] md:text-[10px] text-stone-600 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {campaign.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Freeform Option */}
                <div className="pt-2 border-t border-amber-900/20">
                  <button
                    onClick={() => {
                      setShowCampaigns(false);
                      setActiveCampaign(null);
                      setCaptureEnabled(false);
                      setContextCampaign('');
                    }}
                    className="w-full p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg hover:bg-amber-900/30 transition-all text-center"
                    data-testid="freeform-session"
                  >
                    <Terminal className="w-4 h-4 md:w-5 md:h-5 mx-auto mb-1 text-amber-600" />
                    <p className="text-amber-500 font-bold text-xs md:text-sm">Freeform Session</p>
                    <p className="text-stone-500 text-[10px] md:text-xs">Start without a module template</p>
                  </button>
                </div>
              </div>
            )}

            {messages.length === 0 && !showCampaigns && (
              <div className="text-center text-stone-600 py-4 md:py-8">
                <Bot className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-30" />
                <p className="text-xs md:text-sm">NEXUS agent ready.</p>
                <p className="text-[10px] md:text-xs mt-1">Send commands, payloads, or ask questions.</p>
                
                {/* Quick Actions */}
                <div className="flex gap-2 justify-center mt-3 flex-wrap">
                  {quickActions.map((action, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(action.payload)}
                      className="border-amber-900/30 text-amber-600 text-[10px] md:text-xs h-6 md:h-7 px-2"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCampaigns(true);
                    setActiveCampaign(null);
                    setCaptureEnabled(false);
                    setContextCampaign('');
                  }}
                  className="mt-3 text-stone-500 hover:text-teal-400 text-[10px] md:text-xs"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" /> Back to Modules
                </Button>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-amber-900/30 text-amber-400'
                      : 'bg-black/50 border border-amber-900/20 text-stone-300'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 text-amber-600 text-xs mb-1">
                      <Bot className="w-3 h-3" /> NEXUS
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap text-sm font-mono">{msg.content}</pre>
                  
                  {/* Atropos Scan Suggestions */}
                  {msg.scanSuggestions && msg.scanSuggestions.length > 0 && (
                    <div className="mt-3 p-3 bg-orange-900/20 border border-orange-900/50 rounded-lg">
                      <div className="text-xs text-orange-400 mb-2 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Atropos Scan Suggestions</span>
                      </div>
                      <div className="space-y-2">
                        {msg.scanSuggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            className="w-full text-xs bg-orange-900/30 border-orange-700/50 text-orange-300 hover:bg-orange-900/50 hover:text-orange-200 h-auto py-2"
                            onClick={async () => {
                              setLoading(true);
                              const result = await executeAtroposScan(suggestion.script, suggestion.target);
                              setMessages(prev => [...prev, {
                                role: 'assistant',
                                content: `[ATROPOS_SCAN_EXECUTED]\n${result}`
                              }]);
                              setLoading(false);
                            }}
                          >
                            <Zap className="w-3 h-3 mr-2" />
                            Run {suggestion.script.replace('.lua', '')} on {suggestion.target}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-black/50 border border-amber-900/20 rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-amber-900/20 pt-2 md:pt-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Enter command, payload, or question..."
              className="bg-black/50 border-amber-900/30 text-amber-500 font-mono resize-none h-16 md:h-20 text-xs md:text-sm"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-amber-700 hover:bg-amber-600 text-black h-16 w-14 md:h-20 md:w-20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog
      open={targetModalOpen}
      onOpenChange={(open) => {
        setTargetModalOpen(open);
        if (!open) {
          setPendingCampaign(null);
          setTargetValues({});
          setUseDummyTargets(false);
        }
      }}
    >
      <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 font-mono max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-amber-500 font-orbitron text-sm">Module Target Setup</DialogTitle>
        </DialogHeader>
        {pendingCampaign ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-500">Agent Module</p>
                <p className="text-sm text-amber-400 font-bold">{pendingCampaign.name}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (pendingCampaign.dummyTargets) {
                    setTargetValues(pendingCampaign.dummyTargets);
                    setUseDummyTargets(true);
                  }
                }}
                className="border-amber-700 text-amber-400"
              >
                Use Dummy Data
              </Button>
            </div>

            <div className="space-y-3">
              {(pendingCampaign.targetFields || []).map((field) => (
                <div key={field.key}>
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-stone-500 uppercase">
                      {field.label}
                    </Label>
                    {field.required && <Badge variant="outline" className="text-[8px] border-red-700 text-red-400">Required</Badge>}
                  </div>
                  <Input
                    value={targetValues[field.key] || ''}
                    placeholder={field.placeholder || ''}
                    onChange={(e) => {
                      setUseDummyTargets(false);
                      setTargetValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                    }}
                    className="bg-black/50 border-amber-900/30 text-amber-300 text-sm"
                  />
                  {field.helpText && (
                    <p className="text-[10px] text-stone-600 mt-1">{field.helpText}</p>
                  )}
                </div>
              ))}
            </div>

            {useDummyTargets && (
              <p className="text-[10px] text-teal-400">Dummy data loaded. You can edit any field.</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="border-stone-700 text-stone-400 w-full"
                onClick={() => setTargetModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-amber-700 hover:bg-amber-600 text-black w-full"
                onClick={() => {
                  const fields = pendingCampaign.targetFields || [];
                  const missing = fields.filter((f) => f.required && !targetValues[f.key]?.trim());
                  if (missing.length > 0) {
                    toast({
                      title: "Missing required targets",
                      description: `Fill: ${missing.map((m) => m.label).join(', ')}`
                    });
                    return;
                  }
                  setTargetModalOpen(false);
                  startAgentModule(pendingCampaign, targetValues);
                }}
              >
                Start Module
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-500">No module selected.</p>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
