import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/useGameSession";
import { SECURITY_AGENTS, THREAT_INTEL_FEEDS, type SecurityAgent } from "@shared/agents";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, Globe, AlertTriangle, Key, Network, FileText, 
  Bot, Send, Loader2, ChevronDown, ChevronUp, Download, 
  Rss, RefreshCw, ExternalLink, AlertCircle, Copy, Check
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  Shield, Globe, AlertTriangle, Key, Network, FileText
};

function AgentCard({ agent, isSelected, onSelect }: { 
  agent: SecurityAgent; 
  isSelected: boolean; 
  onSelect: () => void 
}) {
  const IconComponent = iconMap[agent.icon] || Bot;
  const colorMap: Record<string, string> = {
    red: "border-red-500/50 bg-red-950/20 hover:border-red-500",
    blue: "border-blue-500/50 bg-blue-950/20 hover:border-blue-500",
    orange: "border-orange-500/50 bg-orange-950/20 hover:border-orange-500",
    purple: "border-purple-500/50 bg-purple-950/20 hover:border-purple-500",
    cyan: "border-cyan-500/50 bg-cyan-950/20 hover:border-cyan-500",
    teal: "border-teal-500/50 bg-teal-950/20 hover:border-teal-500"
  };
  const textColorMap: Record<string, string> = {
    red: "text-red-400",
    blue: "text-blue-400",
    orange: "text-orange-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    teal: "text-teal-400"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-all border-2 ${colorMap[agent.color]} ${isSelected ? 'ring-2 ring-offset-2 ring-offset-black' : ''}`}
        onClick={onSelect}
        data-testid={`agent-card-${agent.id}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-black/50 ${textColorMap[agent.color]}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className={`text-lg ${textColorMap[agent.color]}`}>{agent.name}</CardTitle>
              <CardDescription className="text-stone-400">{agent.role}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-300 mb-3">{agent.description}</p>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.map((cap) => (
              <Badge key={cap} variant="outline" className="text-xs border-stone-600 text-stone-400">
                {cap}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ThreatIntelPanel() {
  const [selectedFeed, setSelectedFeed] = useState<string>("");
  const [feedData, setFeedData] = useState<any>(null);
  const { toast } = useToast();

  const fetchFeed = useMutation({
    mutationFn: async (feedId: string) => {
      const response = await apiRequest("POST", "/api/threat-intel/fetch", { feedId });
      return response.json();
    },
    onSuccess: (data) => {
      setFeedData(data);
      toast({ title: "Feed loaded", description: "Threat intelligence data retrieved" });
    },
    onError: (error: Error) => {
      toast({ title: "Feed error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Card className="border-orange-900/50 bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-400">
          <Rss className="w-5 h-5" />
          Threat Intelligence Feeds
        </CardTitle>
        <CardDescription>Real-time security intelligence from trusted sources</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedFeed} onValueChange={setSelectedFeed}>
            <SelectTrigger className="flex-1 bg-black/50 border-stone-700" data-testid="threat-feed-select">
              <SelectValue placeholder="Select a feed..." />
            </SelectTrigger>
            <SelectContent>
              {THREAT_INTEL_FEEDS.map((feed) => (
                <SelectItem key={feed.id} value={feed.id}>
                  <div className="flex items-center gap-2">
                    <span>{feed.name}</span>
                    <span className="text-xs text-stone-500">({feed.provider})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => selectedFeed && fetchFeed.mutate(selectedFeed)}
            disabled={!selectedFeed || fetchFeed.isPending}
            className="bg-orange-600 hover:bg-orange-700"
            data-testid="fetch-feed-button"
          >
            {fetchFeed.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>

        {feedData && (
          <div className="bg-black/60 rounded-lg p-4 max-h-64 overflow-auto font-mono text-xs">
            <pre className="text-stone-300 whitespace-pre-wrap">
              {JSON.stringify(feedData, null, 2).slice(0, 2000)}
              {JSON.stringify(feedData).length > 2000 && "\n... (truncated)"}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FrameworkExportPanel({ analysis }: { analysis: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const generateCrewAI = () => {
    return `from crewai import Agent, Task, Crew

# NEXUS Security Agent Export
vuln_analyst = Agent(
    role='Vulnerability Analyst',
    goal='Analyze vulnerabilities and provide risk assessment',
    backstory='Expert in CVE analysis, CVSS scoring, and remediation guidance',
    verbose=True
)

analysis_task = Task(
    description='''${analysis.slice(0, 500)}''',
    agent=vuln_analyst,
    expected_output='Detailed vulnerability report with remediation steps'
)

crew = Crew(
    agents=[vuln_analyst],
    tasks=[analysis_task],
    verbose=True
)

result = crew.kickoff()`;
  };

  const generateLangChain = () => {
    return `from langchain.agents import initialize_agent, AgentType
from langchain.chat_models import ChatOpenAI
from langchain.tools import Tool

# NEXUS Security Agent Export
llm = ChatOpenAI(temperature=0.3, model="gpt-4")

security_tools = [
    Tool(
        name="VulnerabilityAnalysis",
        func=lambda x: """${analysis.slice(0, 500)}""",
        description="Analyzes security vulnerabilities and provides assessments"
    )
]

agent = initialize_agent(
    tools=security_tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="border-purple-900/50 bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-400">
          <Download className="w-5 h-5" />
          Framework Export
        </CardTitle>
        <CardDescription>Export analysis to CrewAI or LangChain format</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-400">CrewAI</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(generateCrewAI(), 'crewai')}
                data-testid="copy-crewai-button"
              >
                {copied === 'crewai' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <pre className="bg-black/60 rounded p-2 text-xs text-stone-400 max-h-32 overflow-auto font-mono">
              {generateCrewAI().slice(0, 300)}...
            </pre>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-400">LangChain</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(generateLangChain(), 'langchain')}
                data-testid="copy-langchain-button"
              >
                {copied === 'langchain' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <pre className="bg-black/60 rounded p-2 text-xs text-stone-400 max-h-32 overflow-auto font-mono">
              {generateLangChain().slice(0, 300)}...
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Agents() {
  const { gameState } = useGame();
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<SecurityAgent | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [showBaseInstructions, setShowBaseInstructions] = useState(false);

  const runAnalysis = useMutation({
    mutationFn: async ({ agentId, prompt }: { agentId: string; prompt: string }) => {
      const response = await apiRequest("POST", "/api/agents/analyze", {
        agentId,
        prompt,
        sessionToken: gameState.sessionToken
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data.analysis || data.response || JSON.stringify(data));
      toast({ 
        title: "Analysis Complete", 
        description: `${selectedAgent?.name} has completed the analysis. Report generated.`
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Analysis Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-black to-stone-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 mb-2">
            NEXUS Security Agents
          </h1>
          <p className="text-stone-400 max-w-2xl mx-auto">
            Specialized AI agents for comprehensive security investigation and analysis.
            Select an agent and provide your investigation context.
          </p>
        </motion.div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-black/50 border border-stone-800">
            <TabsTrigger value="agents" className="data-[state=active]:bg-amber-900/30">
              <Bot className="w-4 h-4 mr-2" /> Agents
            </TabsTrigger>
            <TabsTrigger value="feeds" className="data-[state=active]:bg-orange-900/30">
              <Rss className="w-4 h-4 mr-2" /> Threat Intel
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-purple-900/30">
              <Download className="w-4 h-4 mr-2" /> Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECURITY_AGENTS.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent?.id === agent.id}
                  onSelect={() => setSelectedAgent(agent)}
                />
              ))}
            </div>

            <AnimatePresence>
              {selectedAgent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <Card className="border-amber-900/50 bg-black/40">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-400">
                        <Bot className="w-5 h-5" />
                        {selectedAgent.name} Prompt Playground
                      </CardTitle>
                      <CardDescription>
                        Your instructions are added to the agent's base configuration. 
                        <span className="text-amber-500"> Admin base instructions cannot be overridden.</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Collapsible open={showBaseInstructions} onOpenChange={setShowBaseInstructions}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between text-stone-400 hover:text-stone-200">
                            <span className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              View Base Instructions (Read Only)
                            </span>
                            {showBaseInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="bg-stone-900/50 rounded-lg p-4 mt-2 border border-stone-700">
                            <pre className="text-xs text-stone-400 whitespace-pre-wrap font-mono">
                              {selectedAgent.baseInstructions}
                            </pre>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <div>
                        <label className="text-sm text-stone-400 mb-2 block">Your Additional Instructions</label>
                        <Textarea
                          value={userPrompt}
                          onChange={(e) => setUserPrompt(e.target.value)}
                          placeholder="Add context, targets, or specific analysis requests..."
                          className="min-h-[120px] bg-black/50 border-stone-700 text-stone-200"
                          data-testid="user-prompt-input"
                        />
                      </div>

                      <Button
                        onClick={() => runAnalysis.mutate({ agentId: selectedAgent.id, prompt: userPrompt })}
                        disabled={runAnalysis.isPending || !userPrompt.trim()}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                        data-testid="run-analysis-button"
                      >
                        {runAnalysis.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Run Analysis
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {analysisResult && (
                    <Card className="border-teal-900/50 bg-black/40">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-teal-400">
                          <FileText className="w-5 h-5" />
                          Analysis Report
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-black/60 rounded-lg p-4 max-h-96 overflow-auto">
                          <pre className="text-sm text-stone-300 whitespace-pre-wrap font-mono">
                            {analysisResult}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="feeds">
            <ThreatIntelPanel />
          </TabsContent>

          <TabsContent value="export">
            <FrameworkExportPanel analysis={analysisResult || "No analysis generated yet. Run an agent analysis first."} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
