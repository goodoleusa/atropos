import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  Cpu,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Rocket
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  phase: 1 | 2 | 3 | 4;
  status: 'planning' | 'in_progress' | 'testing' | 'deployed' | 'blocked';
  progress: number;
  budget: {
    allocated: number;
    spent: number;
    aiCost: number;
  };
  timeline: {
    start: Date;
    end: Date;
    daysRemaining: number;
  };
  aiAgents: {
    assigned: string[];
    tasksCompleted: number;
    costSavings: number;
  };
  features: Feature[];
}

interface Feature {
  id: string;
  name: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignedAgent: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedHours: number;
  actualHours: number;
}

interface RevenueMetrics {
  mrr: number;
  arr: number;
  clients: {
    total: number;
    smallBusiness: number;
    midMarket: number;
    enterprise: number;
  };
  students: {
    total: number;
    free: number;
    paid: number;
  };
  projectedGrowth: number;
}

export default function BusinessDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [aiUtilization, setAiUtilization] = useState({
    freeModels: 0,
    cheapModels: 0,
    premiumModels: 0,
    totalSavings: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Load from API
    const projectsRes = await fetch('/api/business/projects');
    const metricsRes = await fetch('/api/business/metrics');
    const aiRes = await fetch('/api/business/ai-utilization');
    
    setProjects(await projectsRes.json());
    setMetrics(await metricsRes.json());
    setAiUtilization(await aiRes.json());
  };

  const getPhaseInfo = (phase: number) => {
    const phases = {
      1: { name: 'Enhanced Gameplay', color: 'amber', icon: Rocket },
      2: { name: 'Business Foundation', color: 'teal', icon: DollarSign },
      3: { name: 'Content & Community', color: 'purple', icon: Users },
      4: { name: 'Intelligence & Scale', color: 'orange', icon: Zap }
    };
    return phases[phase as keyof typeof phases];
  };

  const getTotalBudget = () => {
    return projects.reduce((sum, p) => sum + p.budget.allocated, 0);
  };

  const getTotalSpent = () => {
    return projects.reduce((sum, p) => sum + p.budget.spent, 0);
  };

  const getAverageCostPerFeature = () => {
    const totalFeatures = projects.reduce((sum, p) => sum + p.features.length, 0);
    const totalCost = getTotalSpent();
    return totalFeatures > 0 ? totalCost / totalFeatures : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              Business Planning Dashboard
            </h1>
            <p className="text-stone-400 mt-2">AI-Powered Development & Revenue Tracking</p>
          </div>
          <Button 
            onClick={() => window.location.href = '/admin/sprint-automation'}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Cpu className="mr-2 h-4 w-4" />
            Launch AI Sprint
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-stone-900/50 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-300">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                ${metrics?.mrr.toLocaleString() || 0}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                ARR: ${((metrics?.mrr || 0) * 12).toLocaleString()}
              </p>
              <Progress 
                value={(metrics?.mrr || 0) / 1000} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-stone-900/50 border-teal-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-300">AI Cost Savings</CardTitle>
              <Zap className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-500">
                ${aiUtilization.totalSavings.toLocaleString()}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                91% reduction vs traditional
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-green-500 border-green-500/30">
                  {aiUtilization.freeModels}% Free
                </Badge>
                <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                  {aiUtilization.cheapModels}% Cheap
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/50 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-300">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">
                {metrics?.clients.total || 0}
              </div>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="text-stone-400">
                  {metrics?.clients.smallBusiness || 0} Small
                </span>
                <span className="text-stone-400">
                  {metrics?.clients.midMarket || 0} Mid
                </span>
                <span className="text-stone-400">
                  {metrics?.clients.enterprise || 0} Ent
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/50 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-stone-300">Development Progress</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {projects.filter(p => p.status === 'deployed').length} of {projects.length} deployed
              </p>
              <Progress 
                value={projects.reduce((sum, p) => sum + p.progress, 0) / projects.length} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="bg-stone-900/50 border border-amber-500/20">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="ai-agents">AI Agents</TabsTrigger>
            <TabsTrigger value="clients">Client Services</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {[1, 2, 3, 4].map(phase => {
              const phaseProjects = projects.filter(p => p.phase === phase);
              const phaseInfo = getPhaseInfo(phase);
              const PhaseIcon = phaseInfo.icon;
              
              return (
                <Card key={phase} className="bg-stone-900/50 border-amber-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PhaseIcon className={`h-6 w-6 text-${phaseInfo.color}-500`} />
                        <div>
                          <CardTitle className="text-xl text-stone-100">
                            Phase {phase}: {phaseInfo.name}
                          </CardTitle>
                          <CardDescription>
                            {phaseProjects.length} projects • 
                            {phaseProjects.reduce((sum, p) => sum + p.features.length, 0)} features
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`text-${phaseInfo.color}-500 border-${phaseInfo.color}-500/30`}
                      >
                        {Math.round(phaseProjects.reduce((sum, p) => sum + p.progress, 0) / phaseProjects.length)}% Complete
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {phaseProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-stone-900/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-stone-100">Revenue Breakdown</CardTitle>
                  <CardDescription>Current monthly recurring revenue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RevenueBreakdownItem
                    label="Educational Subscriptions"
                    amount={(metrics?.students.paid || 0) * 39}
                    percentage={60}
                    color="amber"
                  />
                  <RevenueBreakdownItem
                    label="Client Services"
                    amount={metrics?.clients.total || 0 * 2500}
                    percentage={35}
                    color="teal"
                  />
                  <RevenueBreakdownItem
                    label="Enterprise Training"
                    amount={5000}
                    percentage={5}
                    color="purple"
                  />
                </CardContent>
              </Card>

              <Card className="bg-stone-900/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-stone-100">Cost Structure</CardTitle>
                  <CardDescription>Monthly operational costs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CostItem label="AI Models" amount={750} budget={750} />
                  <CostItem label="Infrastructure" amount={200} budget={300} />
                  <CostItem label="APIs & Tools" amount={300} budget={400} />
                  <CostItem label="Contractors" amount={2000} budget={3900} />
                  <div className="pt-3 border-t border-stone-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-stone-300">Total</span>
                      <span className="font-bold text-amber-500">$3,250 / $5,350</span>
                    </div>
                    <p className="text-xs text-green-500 mt-1">
                      39% under budget • $2,100 savings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="ai-agents" className="space-y-4">
            <AIAgentUtilization />
          </TabsContent>

          {/* Client Services Tab */}
          <TabsContent value="clients" className="space-y-4">
            <ClientServicesOverview />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'blue',
      in_progress: 'yellow',
      testing: 'purple',
      deployed: 'green',
      blocked: 'red'
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'deployed') return <CheckCircle2 className="h-4 w-4" />;
    if (status === 'blocked') return <AlertTriangle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="p-4 rounded-lg border border-stone-800 bg-stone-950/50 hover:border-amber-500/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-stone-100">{project.name}</h4>
          <p className="text-sm text-stone-400 mt-1">
            {project.features.length} features • 
            {project.aiAgents.assigned.length} AI agents
          </p>
        </div>
        <Badge 
          variant="outline"
          className={`text-${getStatusColor(project.status)}-500 border-${getStatusColor(project.status)}-500/30`}
        >
          {getStatusIcon(project.status)}
          <span className="ml-1">{project.status.replace('_', ' ')}</span>
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400">Progress</span>
          <span className="text-amber-500 font-semibold">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-2" />

        <div className="flex items-center justify-between text-sm pt-2">
          <span className="text-stone-400">Budget</span>
          <span className="text-teal-500 font-semibold">
            ${project.budget.spent} / ${project.budget.allocated}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400">AI Cost Savings</span>
          <span className="text-green-500 font-semibold">
            ${project.aiAgents.costSavings.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400">Days Remaining</span>
          <span className="text-purple-500 font-semibold">
            {project.timeline.daysRemaining}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-800">
        <div className="flex flex-wrap gap-2">
          {project.aiAgents.assigned.map(agent => (
            <Badge key={agent} variant="outline" className="text-xs">
              <Cpu className="h-3 w-3 mr-1" />
              {agent}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueBreakdownItem({ label, amount, percentage, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-stone-400">{label}</span>
        <span className={`font-semibold text-${color}-500`}>
          ${amount.toLocaleString()}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

function CostItem({ label, amount, budget }: { label: string; amount: number; budget: number }) {
  const percentage = (amount / budget) * 100;
  const color = percentage > 90 ? 'red' : percentage > 70 ? 'yellow' : 'green';
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-stone-400">{label}</span>
        <span className={`font-semibold text-${color}-500`}>
          ${amount} / ${budget}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

function AIAgentUtilization() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-stone-900/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-green-500">Free Models</CardTitle>
          <CardDescription>Ollama + Groq</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500">85%</div>
          <p className="text-sm text-stone-400 mt-2">
            Deepseek Coder, Mistral, Llama 3
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Development</span>
              <span className="text-green-500">100%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Free Users</span>
              <span className="text-green-500">100%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Client Edge Devices</span>
              <span className="text-green-500">100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-stone-900/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-yellow-500">Cheap Models</CardTitle>
          <CardDescription>Claude Haiku, Gemini Flash</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-500">12%</div>
          <p className="text-sm text-stone-400 mt-2">
            $0.00007 - $0.00025 per 1k tokens
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Paid Users</span>
              <span className="text-yellow-500">80%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Small Biz Clients</span>
              <span className="text-yellow-500">60%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-stone-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-purple-500">Premium Models</CardTitle>
          <CardDescription>Claude Sonnet, GPT-4o</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-500">3%</div>
          <p className="text-sm text-stone-400 mt-2">
            $0.003 per 1k tokens
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Enterprise Clients</span>
              <span className="text-purple-500">100%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Critical Incidents</span>
              <span className="text-purple-500">100%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400">Campaign Generation</span>
              <span className="text-purple-500">50%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientServicesOverview() {
  const clients = [
    { 
      name: 'TechCorp Industries', 
      tier: 'enterprise', 
      mrr: 25000, 
      agents: 5, 
      alerts: 142,
      status: 'active'
    },
    { 
      name: 'SecureBank LLC', 
      tier: 'mid_market', 
      mrr: 8500, 
      agents: 4, 
      alerts: 89,
      status: 'active'
    },
    { 
      name: 'StartupXYZ', 
      tier: 'small_business', 
      mrr: 1500, 
      agents: 2, 
      alerts: 34,
      status: 'active'
    },
  ];

  return (
    <div className="space-y-4">
      {clients.map(client => (
        <Card key={client.name} className="bg-stone-900/50 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-stone-100">{client.name}</h4>
                <p className="text-sm text-stone-400 mt-1">
                  {client.agents} AI agents deployed • {client.alerts} alerts this month
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-500">
                  ${client.mrr.toLocaleString()}/mo
                </div>
                <Badge variant="outline" className="mt-2 text-teal-500 border-teal-500/30">
                  {client.tier.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
