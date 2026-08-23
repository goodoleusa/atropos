import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Download, Zap, Bot, Code, FileText, Settings2 } from 'lucide-react';

interface AgentModule {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  tools: string[];
  llm?: string;
}

interface CrewTemplate {
  id: string;
  name: string;
  description: string;
  agents: AgentModule[];
  tasks: TaskTemplate[];
}

interface TaskTemplate {
  id: string;
  description: string;
  agent: string;
  expectedOutput: string;
}

const MODULAR_AGENTS: AgentModule[] = [
  {
    id: 'osint_analyst',
    name: 'OSINT Analyst',
    role: 'Open Source Intelligence Specialist',
    goal: 'Gather comprehensive intelligence from publicly available sources without touching target infrastructure',
    backstory: `You are a seasoned OSINT analyst with years of experience in threat intelligence. 
You specialize in passive reconnaissance, DNS analysis, certificate transparency logs, 
and social media intelligence gathering. You never make direct contact with targets.`,
    tools: ['search_tool', 'web_scraper', 'dns_lookup', 'whois_tool']
  },
  {
    id: 'vuln_researcher',
    name: 'Vulnerability Researcher',
    role: 'Security Vulnerability Analyst',
    goal: 'Identify, analyze, and document security vulnerabilities in target systems',
    backstory: `You are an expert vulnerability researcher who has discovered multiple CVEs.
You understand the full exploit development lifecycle from discovery to PoC.
You prioritize findings by severity and exploitability.`,
    tools: ['cve_search', 'exploit_db', 'nuclei_scanner', 'version_detector']
  },
  {
    id: 'threat_hunter',
    name: 'Threat Hunter',
    role: 'Proactive Threat Detection Specialist',
    goal: 'Proactively search for indicators of compromise and hidden threats in systems',
    backstory: `You are a blue team expert with deep knowledge of adversary TTPs.
You use MITRE ATT&CK framework to guide your hunting hypotheses.
You can analyze logs, network traffic, and endpoint telemetry.`,
    tools: ['log_analyzer', 'sigma_rules', 'yara_scanner', 'ioc_matcher']
  },
  {
    id: 'red_team_operator',
    name: 'Red Team Operator',
    role: 'Offensive Security Specialist',
    goal: 'Simulate real-world attacks to test defensive capabilities',
    backstory: `You are an experienced penetration tester and red team operator.
You think like an adversary and understand the full attack lifecycle.
You document everything for actionable remediation guidance.`,
    tools: ['nmap_scanner', 'credential_tester', 'exploit_framework', 'c2_manager']
  },
  {
    id: 'malware_analyst',
    name: 'Malware Analyst',
    role: 'Reverse Engineering Specialist',
    goal: 'Analyze suspicious files and extract indicators of compromise',
    backstory: `You are a malware reverse engineer who has analyzed thousands of samples.
You can perform static and dynamic analysis to understand malware behavior.
You extract IOCs and create detection signatures.`,
    tools: ['sandbox', 'disassembler', 'string_extractor', 'hash_analyzer']
  },
  {
    id: 'report_writer',
    name: 'Report Writer',
    role: 'Technical Documentation Specialist',
    goal: 'Create clear, actionable security reports for technical and executive audiences',
    backstory: `You are a skilled technical writer who can translate complex security findings
into actionable intelligence. You understand CVSS scoring, risk prioritization,
and how to communicate with both technical and non-technical stakeholders.`,
    tools: ['document_generator', 'template_engine', 'screenshot_tool']
  }
];

const CREW_TEMPLATES: CrewTemplate[] = [
  {
    id: 'recon_crew',
    name: 'Reconnaissance Crew',
    description: 'Passive and active reconnaissance for target profiling',
    agents: [MODULAR_AGENTS[0], MODULAR_AGENTS[1]],
    tasks: [
      { id: 'passive_recon', description: 'Conduct passive reconnaissance on target domain', agent: 'osint_analyst', expectedOutput: 'Comprehensive OSINT report with subdomains, emails, and infrastructure details' },
      { id: 'vuln_scan', description: 'Identify potential vulnerabilities from gathered intel', agent: 'vuln_researcher', expectedOutput: 'Vulnerability assessment with severity ratings' }
    ]
  },
  {
    id: 'threat_intel_crew',
    name: 'Threat Intelligence Crew',
    description: 'Comprehensive threat analysis and hunting',
    agents: [MODULAR_AGENTS[2], MODULAR_AGENTS[4], MODULAR_AGENTS[5]],
    tasks: [
      { id: 'threat_hunt', description: 'Hunt for IOCs and suspicious activity', agent: 'threat_hunter', expectedOutput: 'List of detected threats with MITRE mapping' },
      { id: 'malware_analysis', description: 'Analyze suspicious files', agent: 'malware_analyst', expectedOutput: 'Malware analysis report with IOCs' },
      { id: 'report_gen', description: 'Generate executive threat report', agent: 'report_writer', expectedOutput: 'Professional threat intelligence report' }
    ]
  },
  {
    id: 'pentest_crew',
    name: 'Penetration Testing Crew',
    description: 'Full offensive security assessment',
    agents: [MODULAR_AGENTS[0], MODULAR_AGENTS[1], MODULAR_AGENTS[3], MODULAR_AGENTS[5]],
    tasks: [
      { id: 'recon', description: 'Gather target intelligence', agent: 'osint_analyst', expectedOutput: 'Target profile and attack surface map' },
      { id: 'vuln_id', description: 'Identify exploitable vulnerabilities', agent: 'vuln_researcher', expectedOutput: 'Prioritized vulnerability list' },
      { id: 'exploitation', description: 'Attempt exploitation of vulnerabilities', agent: 'red_team_operator', expectedOutput: 'Proof of concept and access documentation' },
      { id: 'reporting', description: 'Document findings and remediation', agent: 'report_writer', expectedOutput: 'Comprehensive pentest report' }
    ]
  }
];

interface CrewAIExporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string;
  initialModel?: string;
}

export const CrewAIExporter = ({ open, onOpenChange, initialPrompt, initialModel }: CrewAIExporterProps) => {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState(initialPrompt || '');
  const [crewName, setCrewName] = useState('my_security_crew');
  const [llmProvider, setLlmProvider] = useState('openai');

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const applyTemplate = (templateId: string) => {
    const template = CREW_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedAgents(template.agents.map(a => a.id));
      setSelectedTemplate(templateId);
    }
  };

  const generateAgentCode = (agent: AgentModule): string => {
    return `${agent.id} = Agent(
    role="${agent.role}",
    goal="${agent.goal}",
    backstory="""${agent.backstory}""",
    tools=[${agent.tools.join(', ')}],
    llm=llm,
    verbose=True
)`;
  };

  const generateTaskCode = (task: TaskTemplate): string => {
    return `${task.id}_task = Task(
    description="${task.description}",
    agent=${task.agent},
    expected_output="${task.expectedOutput}"
)`;
  };

  const generateFullCrewCode = (): string => {
    const agents = selectedAgents.map(id => MODULAR_AGENTS.find(a => a.id === id)).filter(Boolean) as AgentModule[];
    const template = CREW_TEMPLATES.find(t => t.id === selectedTemplate);
    
    const llmSetup = llmProvider === 'openai' 
      ? `from langchain_openai import ChatOpenAI
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)`
      : llmProvider === 'anthropic'
      ? `from langchain_anthropic import ChatAnthropic
llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0.7)`
      : `from langchain_community.llms import Ollama
llm = Ollama(model="llama3.1")`;

    return `"""
${crewName.toUpperCase()} - CrewAI Security Crew
================================================
Generated from SysAdmin Corp Agent Playground

This crew was exported from your customized agent configuration.
Follow the setup instructions below to run this crew.

SETUP INSTRUCTIONS:
1. Install dependencies:
   pip install crewai langchain-openai python-dotenv

2. Create a .env file with your API keys:
   OPENAI_API_KEY=your_key_here

3. Run the crew:
   python ${crewName}.py

CUSTOMIZATION:
- Modify agent backstories to match your use case
- Add custom tools by implementing the BaseTool class
- Adjust LLM parameters for cost/quality tradeoff
"""

import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Load environment variables
load_dotenv()

# LLM Configuration
${llmSetup}

# ============================================
# TOOL DEFINITIONS (Implement your own)
# ============================================
# Example tool implementation:
# from crewai_tools import BaseTool
# 
# class SearchTool(BaseTool):
#     name: str = "search_tool"
#     description: str = "Search the web for information"
#     
#     def _run(self, query: str) -> str:
#         # Your implementation here
#         return f"Results for: {query}"

# Placeholder tools - replace with real implementations
search_tool = None
web_scraper = None
dns_lookup = None
whois_tool = None
cve_search = None
exploit_db = None
nuclei_scanner = None
version_detector = None
log_analyzer = None
sigma_rules = None
yara_scanner = None
ioc_matcher = None
nmap_scanner = None
credential_tester = None
exploit_framework = None
c2_manager = None
sandbox = None
disassembler = None
string_extractor = None
hash_analyzer = None
document_generator = None
template_engine = None
screenshot_tool = None

# ============================================
# AGENT DEFINITIONS
# ============================================
${agents.map(a => generateAgentCode(a)).join('\n\n')}

# ============================================
# TASK DEFINITIONS
# ============================================
${template ? template.tasks.map(t => generateTaskCode(t)).join('\n\n') : `# Define your custom tasks here
example_task = Task(
    description="Analyze the target and report findings",
    agent=${agents[0]?.id || 'osint_analyst'},
    expected_output="Comprehensive analysis report"
)`}

# ============================================
# CREW ASSEMBLY
# ============================================
${crewName} = Crew(
    agents=[${agents.map(a => a.id).join(', ')}],
    tasks=[${template ? template.tasks.map(t => t.id + '_task').join(', ') : 'example_task'}],
    process=Process.sequential,
    verbose=True
)

# ============================================
# RUN THE CREW
# ============================================
if __name__ == "__main__":
    print("Starting ${crewName}...")
    
    # Define your target/inputs
    inputs = {
        "target": "example.com",  # Replace with your target
        ${customPrompt ? `"custom_context": """${customPrompt}"""` : '"custom_context": "Additional context here"'}
    }
    
    result = ${crewName}.kickoff(inputs=inputs)
    print("\\n" + "="*50)
    print("CREW EXECUTION COMPLETE")
    print("="*50)
    print(result)
`;
  };

  const generateRequirementsTxt = (): string => {
    return `# ${crewName} - Python Dependencies
crewai>=0.28.0
crewai-tools>=0.1.0
langchain>=0.1.0
${llmProvider === 'openai' ? 'langchain-openai>=0.0.5' : ''}
${llmProvider === 'anthropic' ? 'langchain-anthropic>=0.1.0' : ''}
python-dotenv>=1.0.0
pydantic>=2.0.0
`;
  };

  const generateEnvTemplate = (): string => {
    return `# ${crewName} - Environment Variables
# Copy this to .env and fill in your values

${llmProvider === 'openai' ? 'OPENAI_API_KEY=sk-your-key-here' : ''}
${llmProvider === 'anthropic' ? 'ANTHROPIC_API_KEY=sk-ant-your-key-here' : ''}

# Optional: Add any other API keys for tools
# SHODAN_API_KEY=
# VIRUSTOTAL_API_KEY=
`;
  };

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${name} copied to clipboard`,
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card border-amber-800/50">
        <DialogHeader>
          <DialogTitle className="text-amber-500 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Export to CrewAI
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Build modular agent crews and export to Python for CrewAI
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-border">
            <TabsTrigger value="agents" className="data-[state=active]:bg-amber-900/30">
              <Bot className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-amber-900/30">
              <Settings2 className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-amber-900/30">
              <Code className="w-4 h-4 mr-2" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-amber-900/30">
              <FileText className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-2 gap-3">
                {MODULAR_AGENTS.map(agent => (
                  <Card 
                    key={agent.id}
                    className={`cursor-pointer transition-all ${
                      selectedAgents.includes(agent.id) 
                        ? 'border-amber-500 bg-amber-950/30' 
                        : 'border-border bg-border/50 hover:border-muted'
                    }`}
                    onClick={() => toggleAgent(agent.id)}
                    data-testid={`agent-card-${agent.id}`}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={selectedAgents.includes(agent.id)}
                          onChange={() => {}}
                          className="accent-amber-500"
                        />
                        {agent.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {agent.role}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {agent.goal}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {agent.tools.slice(0, 3).map(tool => (
                          <span key={tool} className="text-xs bg-border px-1.5 py-0.5 rounded text-foreground">
                            {tool}
                          </span>
                        ))}
                        {agent.tools.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{agent.tools.length - 3}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {selectedAgents.length} agents
            </p>
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <div className="space-y-3">
              {CREW_TEMPLATES.map(template => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-amber-500 bg-amber-950/30'
                      : 'border-border bg-border/50 hover:border-muted'
                  }`}
                  onClick={() => applyTemplate(template.id)}
                  data-testid={`template-card-${template.id}`}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-amber-400 flex items-center gap-2">
                      <input 
                        type="radio" 
                        checked={selectedTemplate === template.id}
                        onChange={() => {}}
                        className="accent-amber-500"
                      />
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Agents:</span>
                      {template.agents.map(a => (
                        <span key={a.id} className="text-xs bg-amber-900/30 px-2 py-0.5 rounded text-amber-400">
                          {a.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-muted-foreground">Tasks:</span>
                      <span className="text-xs text-muted-foreground">{template.tasks.length} tasks</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="config" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crew-name" className="text-foreground">Crew Name</Label>
                <Input 
                  id="crew-name"
                  value={crewName}
                  onChange={(e) => setCrewName(e.target.value.replace(/\s+/g, '_').toLowerCase())}
                  className="bg-border border-border text-amber-400"
                  data-testid="crew-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">LLM Provider</Label>
                <Select value={llmProvider} onValueChange={setLlmProvider}>
                  <SelectTrigger className="bg-border border-border text-foreground" data-testid="llm-provider-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-border border-border">
                    <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="ollama">Ollama (Local)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Custom Context / Initial Prompt</Label>
              <Textarea 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add any custom context or instructions for your crew..."
                className="bg-border border-border text-foreground min-h-[100px]"
                data-testid="custom-prompt-textarea"
              />
            </div>
          </TabsContent>

          <TabsContent value="export" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                <Card className="border-border bg-border/50">
                  <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-amber-400 text-sm">
                      {crewName}.py
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-amber-800 text-amber-400 hover:bg-amber-950"
                        onClick={() => copyToClipboard(generateFullCrewCode(), 'Python code')}
                        data-testid="copy-python-btn"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-amber-700 hover:bg-amber-600"
                        onClick={() => downloadFile(generateFullCrewCode(), `${crewName}.py`)}
                        data-testid="download-python-btn"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <pre className="text-xs text-foreground bg-black/30 p-3 rounded overflow-x-auto max-h-[200px]">
                      {generateFullCrewCode()}
                    </pre>
                  </CardContent>
                </Card>

                <Card className="border-border bg-border/50">
                  <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-amber-400 text-sm">
                      requirements.txt
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-amber-800 text-amber-400 hover:bg-amber-950"
                      onClick={() => copyToClipboard(generateRequirementsTxt(), 'requirements.txt')}
                      data-testid="copy-requirements-btn"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <pre className="text-xs text-foreground bg-black/30 p-3 rounded">
                      {generateRequirementsTxt()}
                    </pre>
                  </CardContent>
                </Card>

                <Card className="border-border bg-border/50">
                  <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-amber-400 text-sm">
                      .env.template
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-amber-800 text-amber-400 hover:bg-amber-950"
                      onClick={() => copyToClipboard(generateEnvTemplate(), '.env template')}
                      data-testid="copy-env-btn"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <pre className="text-xs text-foreground bg-black/30 p-3 rounded">
                      {generateEnvTemplate()}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CrewAIExporter;
