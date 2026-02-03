import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Bot, Zap, BarChart3, FileText, Target, 
  MessageSquare, Beaker, GraduationCap, Settings, Send, Loader2, ExternalLink, Copy, Radar
} from 'lucide-react';
import { AgentChat } from '@/components/AgentChat';
import { AtroposScanner } from '@/components/AtroposScanner';
import { useLearningStore } from '@/stores/useLearningStore';
import { useReportContext } from '@/hooks/useReportContext';
import { LEARNING_STYLES, LEARNING_GOALS, SKILL_LEVELS, CATEGORY_COLORS } from '@/config/learningConfig';

const QUICK_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', tier: 'free' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', tier: 'free' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', tier: 'free' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder', tier: 'free' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron 70B', tier: 'free' },
];

export default function InvestigationWorkspace() {
  const [activeTab, setActiveTab] = useState('chat');
  const [agentChatOpen, setAgentChatOpen] = useState(false);
  const [atroposPayload, setAtroposPayload] = useState<string | undefined>(undefined);
  
  // Quick Lab state
  const [quickModel, setQuickModel] = useState(QUICK_MODELS[0].id);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [quickResponse, setQuickResponse] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  
  const { 
    style, 
    goals, 
    skillLevel, 
    setStyle, 
    toggleGoal, 
    setSkillLevel,
    getRecommendedTools,
    getFullPromptModifier
  } = useLearningStore();
  
  const { 
    pendingFindings, 
    toolOutputs, 
    currentSession
  } = useReportContext();
  
  const runQuickTest = async () => {
    if (!quickPrompt.trim()) {
      toast({ title: "Enter a prompt", description: "Please enter a prompt to test." });
      return;
    }
    
    setQuickLoading(true);
    setQuickResponse('');
    
    try {
      const learningContext = getFullPromptModifier();
      const systemPrompt = `You are a helpful security research assistant.

${learningContext}

Be concise but thorough. Focus on practical, actionable information.`;

      const response = await fetch('/api/chat/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: quickModel,
          prompt: quickPrompt,
          systemPrompt
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }
      
      const data = await response.json();
      setQuickResponse(data.content || 'No response received');
      
      toast({ 
        title: "Response received", 
        description: `Model: ${QUICK_MODELS.find(m => m.id === quickModel)?.name} (${data.latency}ms)` 
      });
    } catch (error: any) {
      console.error('Quick test error:', error);
      setQuickResponse(`Error: ${error.message || 'Failed to get response. Check that the API is configured.'}`);
      toast({ title: "Error", description: error.message || "Failed to get response from model.", variant: "destructive" });
    } finally {
      setQuickLoading(false);
    }
  };

  const recommendedTools = getRecommendedTools();
  const currentStyle = LEARNING_STYLES.find(s => s.id === style);
  const selectedGoalDetails = goals.map(g => LEARNING_GOALS.find(lg => lg.id === g)).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0500] text-stone-300">
      <header className="sticky top-0 z-50 bg-[#0a0500]/95 backdrop-blur border-b border-amber-900/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 min-h-[44px]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-teal-400" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent">
                  Investigation Workspace
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {pendingFindings.length > 0 && (
                <Badge className="bg-amber-900/50 text-amber-400 border-amber-700">
                  {pendingFindings.length} Findings
                </Badge>
              )}
              {currentSession && (
                <Badge className="bg-teal-900/50 text-teal-400 border-teal-700">
                  {currentSession.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-stone-900/50 border border-stone-800 p-1 flex-wrap min-h-[52px]">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-teal-900/50 data-[state=active]:text-teal-400 min-h-[44px] gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Agent Chat</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lab" 
              className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-purple-400 min-h-[44px] gap-2"
            >
              <Beaker className="w-4 h-4" />
              <span className="hidden sm:inline">AI Lab</span>
              <span className="sm:hidden">Lab</span>
            </TabsTrigger>
            <TabsTrigger 
              value="atropos" 
              className="data-[state=active]:bg-orange-900/50 data-[state=active]:text-orange-400 min-h-[44px] gap-2"
            >
              <Radar className="w-4 h-4" />
              <span className="hidden sm:inline">Atropos Scanner</span>
              <span className="sm:hidden">Scan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[44px] gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Learning Profile</span>
              <span className="sm:hidden">Learn</span>
            </TabsTrigger>
          </TabsList>

          {/* Agent Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <Card className="bg-gradient-to-br from-stone-900/80 to-stone-950/80 border-teal-900/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-teal-400">
                  <Bot className="w-5 h-5" />
                  NEXUS Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-stone-400 mb-4">
                  Start an investigation with the AI agent. Your learning profile will be applied automatically.
                </p>
                <Button 
                  onClick={() => setAgentChatOpen(true)}
                  className="w-full sm:w-auto bg-teal-700 hover:bg-teal-600 min-h-[50px] text-lg font-bold"
                  data-testid="open-agent-chat-btn"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Open Agent Chat
                </Button>
                
                {currentSession && (
                  <div className="mt-4 p-3 bg-stone-900/50 rounded-lg border border-stone-800">
                    <p className="text-xs text-stone-500 mb-2">Active Session</p>
                    <p className="text-sm text-stone-400">
                      {currentSession.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Context Display */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-stone-900/50 border-stone-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Active Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedGoalDetails.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedGoalDetails.map(goal => goal && (
                        <Badge 
                          key={goal.id}
                          className={CATEGORY_COLORS[goal.category] || 'bg-purple-900/50 text-purple-400'}
                        >
                          {goal.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500">No goals selected. Configure in Learning Profile.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-stone-900/50 border-stone-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-teal-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Recommended Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recommendedTools.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {recommendedTools.slice(0, 6).map(tool => (
                        <Badge key={tool} variant="outline" className="text-teal-400 border-teal-800">
                          {tool}
                        </Badge>
                      ))}
                      {recommendedTools.length > 6 && (
                        <Badge variant="outline" className="text-stone-500 border-stone-700">
                          +{recommendedTools.length - 6} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500">Select learning goals to see tool recommendations.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Lab Tab */}
          <TabsContent value="lab" className="space-y-4">
            {/* Quick Model Test - Embedded */}
            <Card className="bg-gradient-to-br from-stone-900/80 to-stone-950/80 border-purple-900/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Beaker className="w-5 h-5" />
                    Quick Model Test
                  </div>
                  <Link href="/ai-lab">
                    <Button variant="ghost" size="sm" className="text-stone-400 hover:text-purple-400 min-h-[44px] gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Full AI Lab
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={quickModel} onValueChange={setQuickModel}>
                    <SelectTrigger className="bg-black/50 border-stone-700 min-h-[44px] sm:w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-stone-700">
                      {QUICK_MODELS.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          <span className="flex items-center gap-2">
                            {model.name}
                            <Badge variant="outline" className="text-[10px] text-teal-400 border-teal-800">
                              {model.tier}
                            </Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="text-xs text-stone-500 flex items-center gap-2">
                    <span className="text-purple-400">Profile:</span>
                    {currentStyle?.name}, {SKILL_LEVELS.find(l => l.id === skillLevel)?.name}
                  </div>
                </div>
                
                <Textarea
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="Enter a prompt to test... Your learning profile will be applied automatically."
                  className="bg-black/50 border-stone-700 min-h-[80px]"
                  data-testid="quick-prompt-input"
                />
                
                <Button
                  onClick={runQuickTest}
                  disabled={quickLoading || !quickPrompt.trim()}
                  className="w-full sm:w-auto bg-purple-700 hover:bg-purple-600 min-h-[50px]"
                  data-testid="run-quick-test-btn"
                >
                  {quickLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>
                
                {quickResponse && (
                  <div className="mt-4 p-4 bg-black/30 rounded-lg border border-purple-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-purple-400 font-bold">Response</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(quickResponse);
                          toast({ title: "Copied!", description: "Response copied to clipboard." });
                        }}
                        className="text-stone-400 hover:text-purple-400 h-8"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <pre className="text-sm text-stone-300 whitespace-pre-wrap font-mono">{quickResponse}</pre>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lab Stats Preview */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-stone-900/50 border-stone-800">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-purple-400">{toolOutputs.length}</div>
                  <div className="text-xs text-stone-500">Tool Outputs</div>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/50 border-stone-800">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-teal-400">{pendingFindings.length}</div>
                  <div className="text-xs text-stone-500">Findings</div>
                </CardContent>
              </Card>
              <Card className="bg-stone-900/50 border-stone-800">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-amber-400">
                    {SKILL_LEVELS.find(l => l.id === skillLevel)?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-stone-500">Skill Level</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <Card className="bg-stone-900/50 border-stone-800">
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-3">
                  <Link href="/ai-lab">
                    <Button variant="outline" className="border-purple-800 text-purple-400 hover:bg-purple-900/30 min-h-[44px]">
                      <Beaker className="w-4 h-4 mr-2" />
                      Model Battleground
                    </Button>
                  </Link>
                  <Link href="/prompt-builder">
                    <Button variant="outline" className="border-amber-800 text-amber-400 hover:bg-amber-900/30 min-h-[44px]">
                      <Zap className="w-4 h-4 mr-2" />
                      Prompt Builder
                    </Button>
                  </Link>
                  <Link href="/report">
                    <Button variant="outline" className="border-teal-800 text-teal-400 hover:bg-teal-900/30 min-h-[44px]">
                      <FileText className="w-4 h-4 mr-2" />
                      Report Builder
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atropos Scanner Tab */}
          <TabsContent value="atropos" className="space-y-4">
            <Card className="bg-gradient-to-br from-stone-900/80 to-stone-950/80 border-orange-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <Radar className="w-5 h-5" />
                  Atropos Scanner
                </CardTitle>
                <p className="text-sm text-stone-400">
                  Run OSINT scans, import results, and hand off to NEXUS for analysis.
                </p>
              </CardHeader>
              <CardContent>
                <AtroposScanner 
                  onAnalyzeWithNexus={(prompt, data) => {
                    setAtroposPayload(prompt);
                    setActiveTab('chat');
                    setAgentChatOpen(true);
                    toast({ 
                      title: "Scan Data Ready", 
                      description: "Opening NEXUS Agent to analyze findings" 
                    });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Profile Tab */}
          <TabsContent value="learning" className="space-y-4">
            <Card className="bg-gradient-to-br from-stone-900/80 to-stone-950/80 border-amber-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-400">
                  <GraduationCap className="w-5 h-5" />
                  Learning Profile
                </CardTitle>
                <p className="text-sm text-stone-400">
                  Configure how the AI adapts its teaching style and content to match your learning preferences.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Learning Style */}
                <div>
                  <h3 className="text-sm font-bold text-stone-300 mb-3">Learning Style</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {LEARNING_STYLES.map(styleOption => (
                      <button
                        key={styleOption.id}
                        onClick={() => setStyle(styleOption.id)}
                        className={`p-3 text-left rounded-lg border min-h-[80px] transition-all ${
                          style === styleOption.id
                            ? 'bg-amber-900/30 border-amber-700 text-amber-400'
                            : 'bg-stone-900/50 border-stone-700 text-stone-400 hover:border-amber-700/50'
                        }`}
                        data-testid={`style-${styleOption.id}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{styleOption.icon}</span>
                          <span className="font-bold text-sm">{styleOption.name}</span>
                        </div>
                        <p className="text-xs text-stone-500">{styleOption.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skill Level */}
                <div>
                  <h3 className="text-sm font-bold text-stone-300 mb-3">Skill Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_LEVELS.map(level => (
                      <button
                        key={level.id}
                        onClick={() => setSkillLevel(level.id as any)}
                        className={`px-4 py-2 rounded-lg border min-h-[44px] transition-all ${
                          skillLevel === level.id
                            ? 'bg-teal-900/30 border-teal-700 text-teal-400'
                            : 'bg-stone-900/50 border-stone-700 text-stone-400 hover:border-teal-700/50'
                        }`}
                        data-testid={`skill-${level.id}`}
                      >
                        <span className="font-bold">{level.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Goals */}
                <div>
                  <h3 className="text-sm font-bold text-stone-300 mb-3">Learning Goals</h3>
                  <p className="text-xs text-stone-500 mb-3">Select the security domains you want to focus on:</p>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="grid sm:grid-cols-2 gap-2">
                      {LEARNING_GOALS.map(goal => {
                        const isSelected = goals.includes(goal.id);
                        return (
                          <button
                            key={goal.id}
                            onClick={() => toggleGoal(goal.id)}
                            className={`p-3 text-left rounded-lg border min-h-[70px] transition-all ${
                              isSelected
                                ? CATEGORY_COLORS[goal.category] || 'bg-purple-900/30 border-purple-700'
                                : 'bg-stone-900/50 border-stone-700 text-stone-400 hover:border-purple-700/50'
                            }`}
                            data-testid={`goal-${goal.id}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm">{goal.name}</span>
                              <Badge variant="outline" className="text-[10px] py-0">
                                {goal.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-stone-500">{goal.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Summary */}
                {goals.length > 0 && (
                  <div className="p-4 bg-stone-900/50 rounded-lg border border-stone-800">
                    <h4 className="text-sm font-bold text-stone-300 mb-2">Profile Summary</h4>
                    <div className="space-y-1 text-xs text-stone-400">
                      <p><span className="text-amber-400">Style:</span> {currentStyle?.name}</p>
                      <p><span className="text-teal-400">Level:</span> {SKILL_LEVELS.find(l => l.id === skillLevel)?.name}</p>
                      <p><span className="text-purple-400">Goals:</span> {goals.length} selected</p>
                      <p><span className="text-stone-300">Tools:</span> {recommendedTools.slice(0, 5).join(', ')}{recommendedTools.length > 5 ? '...' : ''}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Agent Chat Dialog */}
      <AgentChat 
        open={agentChatOpen} 
        onOpenChange={(open) => {
          setAgentChatOpen(open);
          if (!open) setAtroposPayload(undefined);
        }}
        initialPayload={atroposPayload}
      />
    </div>
  );
}
