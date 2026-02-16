import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Bot, Zap, Target, 
  MessageSquare, Beaker, GraduationCap, Radar, Brain, Bug,
  Activity, ChevronDown, ChevronUp, Trash2, FileText
} from 'lucide-react';
import { AgentChat } from '@/components/AgentChat';
import { ScannerContent } from '@/pages/ScannerDashboard';
import { AILabContent } from '@/pages/AILab';
import { PromptBuilderContent } from '@/pages/PromptBuilder';
import { SpiderFootTab } from '@/components/SpiderFootTab';
import { useLearningStore } from '@/stores/useLearningStore';
import { useReportContext } from '@/hooks/useReportContext';
import { LEARNING_STYLES, LEARNING_GOALS, SKILL_LEVELS, CATEGORY_COLORS } from '@/config/learningConfig';

export default function InvestigationWorkspace() {
  const [activeTab, setActiveTab] = useState('chat');
  const [agentChatOpen, setAgentChatOpen] = useState(false);
  const [atroposPayload, setAtroposPayload] = useState<string | undefined>(undefined);
  const [showOutputs, setShowOutputs] = useState(false);
  
  const { 
    style, 
    goals, 
    skillLevel, 
    setStyle, 
    toggleGoal, 
    setSkillLevel,
    getRecommendedTools
  } = useLearningStore();
  
  const { 
    toolOutputs,
    pendingFindings, 
    currentSession,
    clearToolOutputs
  } = useReportContext();

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
                <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 min-h-[44px]" data-testid="back-btn">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-teal-400" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-teal-400 bg-clip-text text-transparent" data-testid="hub-title">
                  Investigation Hub
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOutputs(!showOutputs)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all min-h-[36px] ${
                  toolOutputs.length > 0
                    ? 'bg-teal-900/30 border-teal-700 text-teal-400 hover:bg-teal-900/50'
                    : 'bg-stone-900/30 border-stone-700 text-stone-500 hover:border-stone-600'
                }`}
                data-testid="toggle-outputs-btn"
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{toolOutputs.length}</span>
                {showOutputs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {pendingFindings.length > 0 && (
                <Link href="/report">
                  <Badge className="bg-amber-900/50 text-amber-400 border-amber-700 cursor-pointer hover:bg-amber-900/70" data-testid="findings-badge">
                    <FileText className="w-3 h-3 mr-1" />
                    {pendingFindings.length} Findings
                  </Badge>
                </Link>
              )}
              {currentSession && (
                <Badge className="bg-teal-900/50 text-teal-400 border-teal-700" data-testid="session-badge">
                  {currentSession.name}
                </Badge>
              )}
            </div>
          </div>

          {showOutputs && (
            <div className="mt-3 bg-stone-950/80 rounded-lg border border-stone-800 overflow-hidden" data-testid="outputs-panel">
              <div className="flex items-center justify-between px-3 py-2 border-b border-stone-800">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Tool Outputs Feed</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500">{toolOutputs.length} total</span>
                  {toolOutputs.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { clearToolOutputs(); toast({ title: "Cleared", description: "All tool outputs cleared" }); }}
                      className="h-6 text-xs text-stone-500 hover:text-red-400"
                      data-testid="clear-outputs-btn"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className="max-h-[200px]">
                {toolOutputs.length > 0 ? (
                  <div className="divide-y divide-stone-800/50">
                    {toolOutputs.slice().reverse().slice(0, 20).map(output => (
                      <div key={output.id} className="px-3 py-2 hover:bg-stone-900/30 transition-colors">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="outline" className={`text-[9px] py-0 ${
                            output.type === 'scan' ? 'border-orange-700 text-orange-400' :
                            output.type === 'recon' ? 'border-teal-700 text-teal-400' :
                            output.type === 'finding' ? 'border-red-700 text-red-400' :
                            output.type === 'analysis' ? 'border-purple-700 text-purple-400' :
                            'border-stone-700 text-stone-400'
                          }`}>
                            {output.type}
                          </Badge>
                          <span className="text-[10px] text-stone-600">{output.source}</span>
                          <span className="text-[10px] text-stone-700 ml-auto">
                            {new Date(output.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 line-clamp-2">{output.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center text-stone-600 text-xs">
                    No tool outputs yet. Run scans or use the agent to generate findings.
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-stone-900/50 border border-stone-800 p-1 flex-wrap min-h-[52px]" data-testid="hub-tabs">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-teal-900/50 data-[state=active]:text-teal-400 min-h-[44px] gap-2"
              data-testid="tab-chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Agent Chat</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="scanner" 
              className="data-[state=active]:bg-orange-900/50 data-[state=active]:text-orange-400 min-h-[44px] gap-2"
              data-testid="tab-scanner"
            >
              <Radar className="w-4 h-4" />
              <span className="hidden sm:inline">Scanner</span>
              <span className="sm:hidden">Scan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="spiderfoot" 
              className="data-[state=active]:bg-red-900/50 data-[state=active]:text-red-400 min-h-[44px] gap-2"
              data-testid="tab-spiderfoot"
            >
              <Bug className="w-4 h-4" />
              <span className="hidden sm:inline">SpiderFoot</span>
              <span className="sm:hidden">SF</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai-lab" 
              className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-purple-400 min-h-[44px] gap-2"
              data-testid="tab-ai-lab"
            >
              <Beaker className="w-4 h-4" />
              <span className="hidden sm:inline">AI Lab</span>
              <span className="sm:hidden">Lab</span>
            </TabsTrigger>
            <TabsTrigger 
              value="prompt" 
              className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[44px] gap-2"
              data-testid="tab-prompt"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Prompt Builder</span>
              <span className="sm:hidden">Prompt</span>
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[44px] gap-2"
              data-testid="tab-learning"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Learning Profile</span>
              <span className="sm:hidden">Learn</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4" data-testid="content-chat">
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
                    <p className="text-sm text-stone-400">{currentSession.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

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
                    <p className="text-xs text-stone-500">No goals selected. Configure in Learning Profile tab.</p>
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

          <TabsContent value="scanner" data-testid="content-scanner">
            <ScannerContent />
          </TabsContent>

          <TabsContent value="spiderfoot" data-testid="content-spiderfoot">
            <SpiderFootTab />
          </TabsContent>

          <TabsContent value="ai-lab" data-testid="content-ai-lab">
            <AILabContent />
          </TabsContent>

          <TabsContent value="prompt" data-testid="content-prompt">
            <PromptBuilderContent />
          </TabsContent>

          <TabsContent value="learning" className="space-y-4" data-testid="content-learning">
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
