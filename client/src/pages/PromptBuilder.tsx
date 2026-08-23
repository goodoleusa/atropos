import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Zap, 
  Cpu, 
  FileText, 
  Minimize2, 
  ArrowRight, 
  Copy, 
  Check,
  Brain,
  Target,
  History,
  AlertCircle,
  Play
} from 'lucide-react';
import { 
  AGENT_CORE, 
  CAPABILITY_MODULES, 
  CONTEXT_COMPRESSION_PROMPT,
  TASK_HANDOFF_TEMPLATE,
  MEMORY_TRIGGERS,
  buildSystemPrompt 
} from '@/config/agentPrompts';
import { 
  LEARNING_STYLES, 
  LEARNING_GOALS,
  SKILL_LEVELS,
  CATEGORY_COLORS 
} from '@/config/learningConfig';
import { useLearningStore } from '@/stores/useLearningStore';
import { PromptGallerySection } from '@/components/PromptGallerySection';

type ModuleKey = keyof typeof CAPABILITY_MODULES;

export function PromptBuilderContent() {
  const [enabledModules, setEnabledModules] = useState<ModuleKey[]>(['payload_exec', 'terminal_cmds']);
  const [compressedContext, setCompressedContext] = useState('');
  const [taskFocus, setTaskFocus] = useState('');
  const [conversationHistory, setConversationHistory] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedHandoff, setGeneratedHandoff] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  // Use unified learning store instead of local state
  const { 
    style: learningStyle, 
    goals: selectedGoals, 
    skillLevel,
    setStyle: setLearningStyle,
    toggleGoal,
    setSkillLevel,
    getFullPromptModifier,
    getRecommendedTools
  } = useLearningStore();

  // Check for prefilled data from AgentChat
  useEffect(() => {
    const prefill = localStorage.getItem('prompt_builder_prefill');
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        if (data.messages && data.messages.length > 0) {
          setConversationHistory(data.messages.join('\n\n'));
          setActiveStep(2); // Jump to compression step
        }
        // Clear it so it doesn't persist forever
        localStorage.removeItem('prompt_builder_prefill');
        toast({
          title: "Session Data Loaded",
          description: "NEXUS interaction history imported for optimization.",
        });
      } catch (e) {
        console.error("Failed to parse prefill data", e);
      }
    }
  }, []);

  const toggleModule = (mod: ModuleKey) => {
    setEnabledModules(prev => 
      prev.includes(mod) 
        ? prev.filter(m => m !== mod)
        : [...prev, mod]
    );
  };

  // Use the unified store's prompt modifier
  const getLearningStylePrompt = () => {
    if (selectedGoals.length === 0) return '';
    
    const style = LEARNING_STYLES.find(s => s.id === learningStyle);
    const goalNames = selectedGoals.map(g => LEARNING_GOALS.find(lg => lg.id === g)?.name).filter(Boolean);
    const tools = getRecommendedTools();
    
    return `
## LEARNER ADAPTATION
Adapt your teaching approach for this learner:
- **Learning Style**: ${style?.name} - ${style?.description}
- **Skill Level**: ${SKILL_LEVELS.find(l => l.id === skillLevel)?.name}
- **Learning Goals**: ${goalNames.join(', ')}
- **Relevant Tools**: ${tools.slice(0, 8).join(', ')}

${getFullPromptModifier()}
`;
  };

  const generatePrompt = () => {
    const basePrompt = buildSystemPrompt({
      modules: enabledModules,
      compressed_context: compressedContext || undefined,
      task_focus: taskFocus || undefined
    });
    const learningPrompt = getLearningStylePrompt();
    setGeneratedPrompt(basePrompt + '\n' + learningPrompt);
  };

  const generateHandoff = () => {
    let handoff = TASK_HANDOFF_TEMPLATE
      .replace('{{timestamp}}', new Date().toISOString())
      .replace('{{session_token}}', 'demo-session-' + Math.random().toString(36).substring(2, 8))
      .replace('{{compressed_context}}', compressedContext || '[No prior context]')
      .replace('{{enabled_modules}}', enabledModules.join(', ') || '[All modules]')
      .replace('{{next_task}}', taskFocus || '[Awaiting user input]');
    setGeneratedHandoff(handoff);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const moduleDescriptions: Record<ModuleKey, { name: string; desc: string; icon: string }> = {
    payload_exec: { 
      name: 'Payload Execution', 
      desc: 'Parse and execute QR payloads (beacon, exfil, inject, etc.)',
      icon: '⚡'
    },
    terminal_cmds: { 
      name: 'Terminal Commands', 
      desc: 'Unix-like commands and hidden route enumeration',
      icon: '💻'
    },
    clue_system: { 
      name: 'Clue Tracking', 
      desc: 'Track collected clues, locations, and unlock conditions',
      icon: '🔍'
    },
    crypto_puzzles: { 
      name: 'Crypto Puzzles', 
      desc: 'Cipher decoding (ROT13, Base64, Vigenere, etc.)',
      icon: '🔐'
    },
    osint_recon: { 
      name: 'OSINT Recon', 
      desc: 'Enumerate routes, analyze patterns, decode messages',
      icon: '🎯'
    },
    atropos_scans: {
      name: 'Atropos Scans',
      desc: 'Integrate and analyze Atropos scanner results',
      icon: '📡'
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Select Capabilities',
      desc: 'Choose which skill modules the agent needs for this task',
      icon: <Cpu className="w-5 h-5" />
    },
    {
      num: 2,
      title: 'Compress History',
      desc: 'Distill long conversations into dense context blobs',
      icon: <Minimize2 className="w-5 h-5" />
    },
    {
      num: 3,
      title: 'Define Task Focus',
      desc: 'Set the immediate objective for the agent',
      icon: <Target className="w-5 h-5" />
    },
    {
      num: 4,
      title: 'Generate & Handoff',
      desc: 'Build the final prompt and handoff packet',
      icon: <ArrowRight className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-6">
        <Card className="bg-black/50 border-amber-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-500 text-lg">How Iterative Agent Handoff Works</CardTitle>
            <CardDescription className="text-muted-foreground">
              Keep AI agents efficient by compressing history and passing focused context to fresh agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {steps.map((step) => (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  data-testid={`step-button-${step.num}`}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    activeStep === step.num 
                      ? 'border-amber-600 bg-amber-900/20' 
                      : 'border-amber-900/30 bg-black/30 hover:border-amber-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      activeStep === step.num ? 'bg-amber-600 text-black' : 'bg-amber-900/50 text-amber-500'
                    }`}>
                      {step.num}
                    </span>
                    <span className={activeStep === step.num ? 'text-amber-400' : 'text-muted-foreground'}>
                      {step.icon}
                    </span>
                  </div>
                  <p className={`text-xs font-bold ${activeStep === step.num ? 'text-amber-400' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{step.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs value={`step-${activeStep}`} className="space-y-4">
          <TabsList className="bg-[hsl(var(--card))] border border-amber-900/30 w-full justify-start overflow-x-auto">
            {steps.map((step) => (
              <TabsTrigger 
                key={step.num}
                value={`step-${step.num}`}
                onClick={() => setActiveStep(step.num)}
                data-testid={`tab-step-${step.num}`}
                className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500"
              >
                Step {step.num}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="step-1" className="space-y-4">
            <Card className="bg-black/50 border-amber-900/30">
              <CardHeader>
                <CardTitle className="text-amber-500 flex items-center gap-2">
                  <Cpu className="w-5 h-5" /> Step 1: Select Capability Modules
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  <span className="text-teal-400">WHY:</span> Instead of loading a massive prompt with everything, 
                  we only include the modules the agent actually needs. This saves tokens and keeps the agent focused.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-3 text-xs">
                  <p className="text-amber-400 font-bold mb-1">💡 The Problem We're Solving:</p>
                  <p className="text-muted-foreground">
                    Traditional prompts include ALL capabilities, wasting tokens on irrelevant context. 
                    If the user is doing crypto puzzles, why load terminal commands?
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {(Object.keys(CAPABILITY_MODULES) as ModuleKey[]).map((mod) => (
                    <div 
                      key={mod}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        enabledModules.includes(mod) 
                          ? 'border-teal-500 bg-teal-900/20' 
                          : 'border-amber-900/30 bg-black/30'
                      }`}
                      onClick={() => toggleModule(mod)}
                      data-testid={`module-toggle-${mod}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{(moduleDescriptions[mod] as any)?.icon || '🧩'}</span>
                          <div>
                            <p className="text-amber-500 text-sm font-bold">{(moduleDescriptions[mod] as any)?.name || mod}</p>
                            <p className="text-muted-foreground text-xs">{(moduleDescriptions[mod] as any)?.desc || 'Capability module'}</p>
                          </div>
                        </div>
                        <Switch checked={enabledModules.includes(mod)} data-testid={`switch-${mod}`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-black/50 border border-amber-900/20 rounded-lg p-3">
                  <p className="text-amber-600 text-xs font-bold mb-2">CORE PROMPT (Always Included):</p>
                  <pre className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap">{AGENT_CORE}</pre>
                </div>

                {/* Learning Style & Goals Section */}
                <div className="border-t border-amber-900/30 pt-4">
                  <p className="text-purple-400 font-bold text-sm mb-3 flex items-center gap-2">
                    🎓 Learning Adaptation
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-muted-foreground text-xs mb-2 block">Learning Style</Label>
                      <div className="space-y-2">
                        {LEARNING_STYLES.map(style => (
                          <button
                            key={style.id}
                            onClick={() => setLearningStyle(style.id)}
                            data-testid={`style-${style.id}`}
                            className={`w-full p-2 rounded-lg border text-left transition-all text-xs ${
                              learningStyle === style.id
                                ? 'border-purple-500 bg-purple-900/20 text-purple-300'
                                : 'border-border bg-black/30 text-muted-foreground hover:border-purple-700'
                            }`}
                          >
                            <span className="mr-2">{style.icon}</span>
                            <span className="font-bold">{style.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-xs mb-2 block">Skill Level</Label>
                      <div className="space-y-2">
                        {SKILL_LEVELS.map(level => (
                          <button
                            key={level.id}
                            onClick={() => setSkillLevel(level.id as any)}
                            data-testid={`level-${level.id}`}
                            className={`w-full p-2 rounded-lg border text-left transition-all text-xs ${
                              skillLevel === level.id
                                ? 'border-teal-500 bg-teal-900/20 text-teal-300'
                                : 'border-border bg-black/30 text-muted-foreground hover:border-teal-700'
                            }`}
                          >
                            <span className="font-bold">{level.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-muted-foreground text-xs mb-2 block">Learning Goals</Label>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-1 pr-2">
                          {LEARNING_GOALS.map(goal => (
                            <button
                              key={goal.id}
                              onClick={() => toggleGoal(goal.id)}
                              data-testid={`goal-${goal.id}`}
                              className={`w-full p-2 rounded-lg border text-left transition-all text-xs ${
                                selectedGoals.includes(goal.id)
                                  ? 'border-amber-500 bg-amber-900/20 text-amber-300'
                                  : 'border-border bg-black/30 text-muted-foreground hover:border-amber-700'
                              }`}
                            >
                              <span className="font-bold">{goal.name}</span>
                              <span className={`ml-2 text-[10px] px-1 py-0.5 rounded ${CATEGORY_COLORS[goal.category] || 'bg-border text-muted-foreground'}`}>
                                {goal.category}
                              </span>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                  
                  <div className="bg-purple-900/10 border border-purple-900/30 rounded-lg p-3 text-xs">
                    <p className="text-purple-400 font-bold mb-1">📚 Selected Learning Profile:</p>
                    <p className="text-muted-foreground">
                      <span className="text-purple-300">{LEARNING_STYLES.find(s => s.id === learningStyle)?.name}</span> • 
                      <span className="text-teal-300 ml-1">{skillLevel}</span> • 
                      <span className="text-amber-300 ml-1">{selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step-2" className="space-y-4">
            <Card className="bg-black/50 border-amber-900/30">
              <CardHeader>
                <CardTitle className="text-amber-500 flex items-center gap-2">
                  <Minimize2 className="w-5 h-5" /> Step 2: Compress Conversation History
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  <span className="text-teal-400">WHY:</span> Long conversations eat tokens. 
                  We compress 10+ messages into a dense "context blob" that preserves only critical information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-3 text-xs">
                  <p className="text-amber-400 font-bold mb-1">💡 The Problem We're Solving:</p>
                  <p className="text-muted-foreground">
                    After 10+ messages, context windows fill up. Instead of discarding history, 
                    we compress it into a structured summary that a new agent can understand instantly.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-amber-600 text-sm">Raw Conversation History</Label>
                    <p className="text-muted-foreground text-xs mb-2">Paste the long conversation you want to compress:</p>
                    <Textarea 
                      value={conversationHistory}
                      onChange={e => setConversationHistory(e.target.value)}
                      placeholder="User: Can you help me decode this base64?&#10;Agent: Sure! What's the encoded string?&#10;User: SGVsbG8gV29ybGQ=&#10;..."
                      className="bg-black/50 border-amber-900/30 text-foreground h-40 text-xs font-mono"
                      data-testid="textarea-conversation-history"
                    />
                  </div>
                  <div>
                    <Label className="text-amber-600 text-sm">Compressed Context Blob</Label>
                    <p className="text-muted-foreground text-xs mb-2">Dense summary for handoff (edit manually or use AI):</p>
                    <Textarea 
                      value={compressedContext}
                      onChange={e => setCompressedContext(e.target.value)}
                      placeholder="[TASK] Decode base64 message from QR&#10;[STATE] {encoded: 'SGVsbG8...', decoded: 'Hello World'}&#10;[HISTORY] • Found QR in /void • Scanned payload&#10;[NEXT] Interpret decoded message"
                      className="bg-black/50 border-teal-900/30 text-teal-400 h-40 text-xs font-mono"
                      data-testid="textarea-compressed-context"
                    />
                  </div>
                </div>

                <div className="bg-black/50 border border-amber-900/20 rounded-lg p-3">
                  <p className="text-amber-600 text-xs font-bold mb-2">COMPRESSION TEMPLATE:</p>
                  <pre className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap">{CONTEXT_COMPRESSION_PROMPT}</pre>
                </div>

                <div className="bg-purple-900/10 border border-purple-900/30 rounded-lg p-3">
                  <p className="text-purple-400 text-xs font-bold mb-1">⚡ Auto-Compression Triggers:</p>
                  <ul className="text-muted-foreground text-xs space-y-1">
                    <li>• After <span className="text-purple-400">{MEMORY_TRIGGERS.message_count} messages</span></li>
                    <li>• When context exceeds <span className="text-purple-400">{MEMORY_TRIGGERS.token_threshold} tokens</span></li>
                    <li>• On task completion: <span className="text-purple-400">{MEMORY_TRIGGERS.task_complete ? 'Yes' : 'No'}</span></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step-3" className="space-y-4">
            <Card className="bg-black/50 border-amber-900/30">
              <CardHeader>
                <CardTitle className="text-amber-500 flex items-center gap-2">
                  <Target className="w-5 h-5" /> Step 3: Define Task Focus
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  <span className="text-teal-400">WHY:</span> Tell the new agent exactly what to do next. 
                  This prevents it from going off-track or repeating completed work.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-3 text-xs">
                  <p className="text-amber-400 font-bold mb-1">💡 The Problem We're Solving:</p>
                  <p className="text-muted-foreground">
                    Without a clear directive, the new agent might ask "how can I help?" instead of 
                    continuing the work. The task focus is like handing off a relay baton.
                  </p>
                </div>

                <div>
                  <Label className="text-amber-600 text-sm">Immediate Task Directive</Label>
                  <p className="text-muted-foreground text-xs mb-2">What should the new agent do first?</p>
                  <Textarea 
                    value={taskFocus}
                    onChange={e => setTaskFocus(e.target.value)}
                    placeholder="Analyze the decoded message 'Hello World' for hidden patterns. Check if it's a hint for the /archive route."
                    className="bg-black/50 border-amber-900/30 text-amber-400 h-24 text-sm"
                    data-testid="textarea-task-focus"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTaskFocus('Continue decoding the cipher chain from prior context')}
                    className="border-amber-900/30 text-amber-600 text-xs"
                    data-testid="button-preset-cipher"
                  >
                    Continue Cipher
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTaskFocus('Enumerate hidden routes and report findings')}
                    className="border-amber-900/30 text-amber-600 text-xs"
                    data-testid="button-preset-route"
                  >
                    Route Enum
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTaskFocus('Execute the pending payload and analyze results')}
                    className="border-amber-900/30 text-amber-600 text-xs"
                    data-testid="button-preset-payload"
                  >
                    Execute Payload
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTaskFocus('Summarize all collected clues and suggest next quest')}
                    className="border-amber-900/30 text-amber-600 text-xs"
                    data-testid="button-preset-clue"
                  >
                    Clue Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step-4" className="space-y-4">
            <Card className="bg-black/50 border-amber-900/30">
              <CardHeader>
                <CardTitle className="text-amber-500 flex items-center gap-2">
                  <Play className="w-5 h-5" /> Step 4: Generate & Handoff
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  <span className="text-teal-400">RESULT:</span> A compact, focused prompt that boots a new agent 
                  with full context in minimal tokens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button 
                    onClick={generatePrompt}
                    className="bg-amber-700 hover:bg-amber-600 text-black"
                    data-testid="button-generate-prompt"
                  >
                    <Zap className="w-4 h-4 mr-2" /> Generate System Prompt
                  </Button>
                  <Button 
                    onClick={generateHandoff}
                    className="bg-teal-700 hover:bg-teal-600 text-black"
                    data-testid="button-generate-handoff"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" /> Generate Handoff Packet
                  </Button>
                </div>

                {generatedPrompt && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-amber-600 text-sm">Generated System Prompt</Label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedPrompt)}
                        className="text-muted-foreground hover:text-amber-500"
                        data-testid="button-copy-prompt"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <ScrollArea className="h-48 border border-amber-900/30 rounded-lg">
                      <pre className="p-3 text-xs text-amber-400 font-mono whitespace-pre-wrap">{generatedPrompt}</pre>
                    </ScrollArea>
                    <p className="text-muted-foreground text-xs">
                      Tokens: ~{Math.ceil(generatedPrompt.length / 4)} | Modules: {enabledModules.length}
                    </p>
                  </div>
                )}

                {generatedHandoff && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-teal-400 text-sm">Generated Handoff Packet</Label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedHandoff)}
                        className="text-muted-foreground hover:text-teal-500"
                        data-testid="button-copy-handoff"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <ScrollArea className="h-48 border border-teal-900/30 rounded-lg">
                      <pre className="p-3 text-xs text-teal-400 font-mono whitespace-pre-wrap">{generatedHandoff}</pre>
                    </ScrollArea>
                  </div>
                )}

                <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-3 text-xs">
                  <p className="text-amber-400 font-bold mb-2">🚀 How to Use:</p>
                  <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Copy the <span className="text-amber-400">System Prompt</span> into your AI's system message</li>
                    <li>Copy the <span className="text-teal-400">Handoff Packet</span> as the first user message</li>
                    <li>The new agent continues seamlessly from where the old one left off</li>
                    <li>Repeat when context fills up (every ~10 messages)</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <PromptGallerySection defaultPrompt={generatedPrompt} defaultTitle={taskFocus} />
        </div>
    </div>
  );
}

export default function PromptBuilder() {
  useEffect(() => {
    window.location.replace('/investigate?tab=prompt');
  }, []);
  return (
    <div className="min-h-screen bg-[hsl(var(--card))] flex items-center justify-center text-muted-foreground">
      <div className="text-center space-y-2">
        <Brain className="w-8 h-8 mx-auto text-amber-500 animate-pulse" />
        <p className="text-sm">Redirecting to Investigation Hub...</p>
      </div>
    </div>
  );
}
