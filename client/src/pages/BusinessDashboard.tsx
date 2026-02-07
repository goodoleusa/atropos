import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Shield,
  Brain,
  Activity,
  FileText,
  Calendar,
  ChevronRight
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  stage: 'planning' | 'development' | 'testing' | 'deployed' | 'revenue';
  progress: number;
  budget: {
    allocated: number;
    spent: number;
    aiSavings: number;
  };
  timeline: {
    started: string;
    deadline: string;
    daysLeft: number;
  };
  team: {
    human: number;
    aiAgents: number;
  };
  status: 'on-track' | 'at-risk' | 'delayed' | 'complete';
  revenue?: number;
}

interface BusinessMetrics {
  mrr: number;
  arr: number;
  growthRate: number;
  clients: number;
  students: number;
  aiCostSavings: number;
  burnRate: number;
  runway: number;
}

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);

  useEffect(() => {
    // Load projects and metrics
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Mock data for now - will connect to real API
    setProjects([
      {
        id: 'anti-trafficking-campaigns',
        name: 'Anti-Trafficking Investigation Campaigns',
        stage: 'deployed',
        progress: 100,
        budget: {
          allocated: 0,
          spent: 0,
          aiSavings: 15000 // Would have cost $15k with human developers
        },
        timeline: {
          started: '2024-02-01',
          deadline: '2024-02-07',
          daysLeft: 0
        },
        team: {
          human: 1,
          aiAgents: 4 // Architect, Developer, QA, DevOps
        },
        status: 'complete',
        revenue: 0
      },
      {
        id: 'investor-demo',
        name: 'Investor Demo Video & Landing Page',
        stage: 'development',
        progress: 60,
        budget: {
          allocated: 0,
          spent: 0,
          aiSavings: 3000
        },
        timeline: {
          started: '2024-02-08',
          deadline: '2024-02-10',
          daysLeft: 2
        },
        team: {
          human: 1,
          aiAgents: 2
        },
        status: 'on-track'
      },
      {
        id: 'ngo-partnerships',
        name: 'NGO Partnership Program',
        stage: 'planning',
        progress: 30,
        budget: {
          allocated: 0,
          spent: 0,
          aiSavings: 0
        },
        timeline: {
          started: '2024-02-08',
          deadline: '2024-02-14',
          daysLeft: 6
        },
        team: {
          human: 1,
          aiAgents: 1
        },
        status: 'on-track'
      },
      {
        id: 'corporate-aml-service',
        name: 'Corporate AML/KYC Service',
        stage: 'development',
        progress: 40,
        budget: {
          allocated: 0,
          spent: 0,
          aiSavings: 25000
        },
        timeline: {
          started: '2024-02-08',
          deadline: '2024-02-28',
          daysLeft: 20
        },
        team: {
          human: 1,
          aiAgents: 5 // Security crew
        },
        status: 'on-track'
      },
      {
        id: 'crewai-deployment',
        name: 'CrewAI Agent Deployment System',
        stage: 'development',
        progress: 50,
        budget: {
          allocated: 0,
          spent: 0,
          aiSavings: 40000
        },
        timeline: {
          started: '2024-02-08',
          deadline: '2024-02-21',
          daysLeft: 13
        },
        team: {
          human: 1,
          aiAgents: 3
        },
        status: 'on-track'
      }
    ]);

    setMetrics({
      mrr: 0, // Will increase once clients sign
      arr: 0,
      growthRate: 0,
      clients: 0,
      students: 0,
      aiCostSavings: 83000, // Total saved so far
      burnRate: 0, // Still on free tier
      runway: Infinity // No burn = infinite runway
    });
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'complete': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'on-track': return 'text-teal-400 bg-teal-400/10 border-teal-400/20';
      case 'at-risk': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'delayed': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-stone-400 bg-stone-400/10 border-stone-400/20';
    }
  };

  const getStageIcon = (stage: Project['stage']) => {
    switch (stage) {
      case 'planning': return <FileText className="w-4 h-4" />;
      case 'development': return <Brain className="w-4 h-4" />;
      case 'testing': return <AlertCircle className="w-4 h-4" />;
      case 'deployed': return <Zap className="w-4 h-4" />;
      case 'revenue': return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Business Command Center
            </h1>
            <p className="text-stone-400">
              Zero-budget operations powered by AI agents | Cost savings: ${metrics?.aiCostSavings.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-500/10">
              <Calendar className="w-4 h-4 mr-2" />
              Week 1 of 12
            </Button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-stone-900/50 border-stone-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-400 text-sm">MRR</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold">${metrics?.mrr.toLocaleString() || '0'}</div>
            <p className="text-xs text-stone-500 mt-1">Target: $30k-$50k by Day 90</p>
          </Card>

          <Card className="bg-stone-900/50 border-stone-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-400 text-sm">AI Cost Savings</span>
              <Brain className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-bold text-teal-400">
              ${metrics?.aiCostSavings.toLocaleString()}
            </div>
            <p className="text-xs text-stone-500 mt-1">91% reduction vs traditional</p>
          </Card>

          <Card className="bg-stone-900/50 border-stone-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-400 text-sm">Burn Rate</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">
              ${metrics?.burnRate.toLocaleString()}
            </div>
            <p className="text-xs text-stone-500 mt-1">Free tier = ∞ runway</p>
          </Card>

          <Card className="bg-stone-900/50 border-stone-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-400 text-sm">Paying Clients</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold">{metrics?.clients}</div>
            <p className="text-xs text-stone-500 mt-1">Target: 3-5 by Day 90</p>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-stone-900 border-stone-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects Pipeline</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Strategy</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* 90-Day Timeline */}
            <Card className="bg-stone-900/50 border-stone-800 p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-amber-400" />
                90-Day Revenue Timeline
              </h2>
              
              <div className="space-y-4">
                {/* Month 1 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Month 1: Bootstrap & Build</span>
                    <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                      In Progress
                    </Badge>
                  </div>
                  <Progress value={30} className="mb-2" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-stone-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      5 campaigns deployed
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Investor demo in progress
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      NGO outreach starting
                    </div>
                  </div>
                </div>

                {/* Month 2 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Month 2: First Clients</span>
                    <Badge className="bg-stone-700 text-stone-300 border-stone-600">
                      Upcoming
                    </Badge>
                  </div>
                  <Progress value={0} className="mb-2" />
                  <div className="text-sm text-stone-400">
                    Target: $10k-$20k MRR from 1-2 clients
                  </div>
                </div>

                {/* Month 3 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Month 3: Scale & Fundraise</span>
                    <Badge className="bg-stone-700 text-stone-300 border-stone-600">
                      Upcoming
                    </Badge>
                  </div>
                  <Progress value={0} className="mb-2" />
                  <div className="text-sm text-stone-400">
                    Target: $30k-$50k MRR, investor term sheet
                  </div>
                </div>
              </div>
            </Card>

            {/* Weekly Goals */}
            <Card className="bg-stone-900/50 border-stone-800 p-6">
              <h2 className="text-2xl font-bold mb-4">This Week's Goals</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-stone-800/50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Deploy 5 anti-trafficking campaigns</div>
                    <div className="text-sm text-stone-400">Status: Complete ✅</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-stone-800/50 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Record investor demo video</div>
                    <div className="text-sm text-stone-400">Due: Day 2 (tomorrow)</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-stone-800/50 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Email 20 NGOs</div>
                    <div className="text-sm text-stone-400">Due: Day 5-6</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="bg-stone-900/50 border-stone-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(project.status)}`}>
                      {getStageIcon(project.stage)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{project.name}</h3>
                      <p className="text-sm text-stone-400 capitalize">
                        Stage: {project.stage} | {project.timeline.daysLeft} days left
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="text-amber-400">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-stone-400 mb-1">Budget Spent</div>
                      <div className="font-semibold text-emerald-400">
                        ${project.budget.spent}
                      </div>
                    </div>
                    <div>
                      <div className="text-stone-400 mb-1">AI Savings</div>
                      <div className="font-semibold text-teal-400">
                        ${project.budget.aiSavings.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-stone-400 mb-1">Team Size</div>
                      <div className="font-semibold">
                        {project.team.human} human + {project.team.aiAgents} AI
                      </div>
                    </div>
                    <div>
                      <div className="text-stone-400 mb-1">Revenue</div>
                      <div className="font-semibold">
                        {project.revenue !== undefined ? `$${project.revenue.toLocaleString()}` : 'TBD'}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      className="text-amber-400 hover:bg-amber-500/10"
                      size="sm"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Revenue Strategy Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card className="bg-stone-900/50 border-stone-800 p-6">
              <h2 className="text-2xl font-bold mb-4">Revenue Streams (Target: $500k ARR Y1)</h2>
              
              <div className="space-y-4">
                {/* Educational */}
                <div className="p-4 bg-stone-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-teal-400" />
                      <span className="font-semibold">Educational Subscriptions</span>
                    </div>
                    <Badge>20% of revenue</Badge>
                  </div>
                  <div className="text-2xl font-bold text-teal-400 mb-2">$100k ARR</div>
                  <div className="text-sm text-stone-400 space-y-1">
                    <div>• Free tier: 5 campaigns</div>
                    <div>• Student ($29/mo): Full platform</div>
                    <div>• Professional ($99/mo): Premium tools</div>
                    <div>• Enterprise ($10k for 25 seats)</div>
                  </div>
                </div>

                {/* Government */}
                <div className="p-4 bg-stone-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-400" />
                      <span className="font-semibold">Government Contracts</span>
                    </div>
                    <Badge>40% of revenue</Badge>
                  </div>
                  <div className="text-2xl font-bold text-amber-400 mb-2">$200k ARR</div>
                  <div className="text-sm text-stone-400 space-y-1">
                    <div>• FBI VCAC case support</div>
                    <div>• HSI cryptocurrency tracing</div>
                    <div>• State/local PD contracts</div>
                  </div>
                </div>

                {/* Corporate AML */}
                <div className="p-4 bg-stone-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <span className="font-semibold">Corporate AML/KYC</span>
                    </div>
                    <Badge>25% of revenue</Badge>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 mb-2">$125k ARR</div>
                  <div className="text-sm text-stone-400 space-y-1">
                    <div>• Crypto exchanges ($10k-$20k/mo)</div>
                    <div>• Banks ($15k-$30k/mo)</div>
                    <div>• Payment processors ($10k-$15k/mo)</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <Card className="bg-stone-900/50 border-stone-800 p-6">
              <h2 className="text-2xl font-bold mb-4">Active AI Agent Crews</h2>
              <p className="text-stone-400 mb-6">
                All powered by FREE models (Ollama, Groq, HuggingFace) - $0 cost
              </p>

              <div className="space-y-4">
                {/* Development Crew */}
                <div className="p-4 bg-stone-800/50 rounded-lg border border-teal-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-teal-400" />
                      <span className="font-semibold">Development Crew</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                  </div>
                  <div className="text-sm text-stone-400 space-y-2">
                    <div>• Architect (Deepseek Coder V2 - FREE)</div>
                    <div>• Developer (CodeLlama 13B - FREE)</div>
                    <div>• QA Engineer (Groq Mixtral - FREE)</div>
                    <div>• DevOps (Groq Llama 3 - FREE)</div>
                    <div className="pt-2 text-teal-400">Savings: $120k/year vs 1 FT developer</div>
                  </div>
                </div>

                {/* Business Intelligence Crew */}
                <div className="p-4 bg-stone-800/50 rounded-lg border border-amber-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-400" />
                      <span className="font-semibold">Business Intelligence Crew</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                  </div>
                  <div className="text-sm text-stone-400 space-y-2">
                    <div>• Data Analyst (Groq Mixtral - FREE)</div>
                    <div>• Growth Strategist (Llama 3.1 - FREE)</div>
                    <div>• Financial Analyst (Groq Llama 3 - FREE)</div>
                    <div className="pt-2 text-amber-400">Savings: $50k/year vs analysts</div>
                  </div>
                </div>

                {/* Security Crew (per client) */}
                <div className="p-4 bg-stone-800/50 rounded-lg border border-red-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-400" />
                      <span className="font-semibold">Offensive Security Crews</span>
                    </div>
                    <Badge className="bg-stone-700 text-stone-300">Ready to Deploy</Badge>
                  </div>
                  <div className="text-sm text-stone-400 space-y-2">
                    <div>• Recon Agent (Ollama Mistral - FREE)</div>
                    <div>• Scanner Agent (Ollama Mistral - FREE)</div>
                    <div>• Threat Hunter (Groq Mixtral - FREE)</div>
                    <div>• Incident Responder (Claude Haiku - $0.00025/1k tokens)</div>
                    <div>• Report Generator (Groq Llama 3 - FREE)</div>
                    <div className="pt-2 text-red-400">Cost: &lt;$50/month per client vs $50k traditional SOC</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
