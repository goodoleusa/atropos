import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Target,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Shield,
  Brain,
  Activity,
  FileText,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  Globe,
  Award,
  ArrowUpRight,
} from "lucide-react";

interface ProjectGoal {
  text: string;
  done: boolean;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  stage: "planning" | "development" | "testing" | "deployed" | "revenue";
  status: "on-track" | "at-risk" | "delayed" | "complete";
  progress: number;
  priority: "low" | "medium" | "high" | "critical";
  category: "security" | "development" | "business" | "marketing" | "operations" | "general";
  budget: { allocated: number; spent: number; aiSavings: number };
  timeline: { started: string; deadline: string };
  team: { human: number; aiAgents: number };
  goals: ProjectGoal[];
  notes: string | null;
  revenue: number | null;
  createdAt: string;
  updatedAt: string;
}

type ProjectFormData = Omit<Project, "id" | "createdAt" | "updatedAt">;

const STAGES: Project["stage"][] = ["planning", "development", "testing", "deployed", "revenue"];
const STATUSES: Project["status"][] = ["on-track", "at-risk", "delayed", "complete"];
const PRIORITIES: Project["priority"][] = ["low", "medium", "high", "critical"];
const CATEGORIES: Project["category"][] = ["security", "development", "business", "marketing", "operations", "general"];

const defaultForm: ProjectFormData = {
  name: "",
  description: "",
  stage: "planning",
  status: "on-track",
  progress: 0,
  priority: "medium",
  category: "general",
  budget: { allocated: 0, spent: 0, aiSavings: 0 },
  timeline: { started: new Date().toISOString().split("T")[0], deadline: new Date().toISOString().split("T")[0] },
  team: { human: 1, aiAgents: 0 },
  goals: [],
  notes: "",
  revenue: null,
};

function getStatusColor(status: Project["status"]) {
  switch (status) {
    case "complete": return "text-teal-400 bg-teal-400/10 border-teal-400/20";
    case "on-track": return "text-teal-400 bg-teal-400/10 border-teal-400/20";
    case "at-risk": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "delayed": return "text-red-400 bg-red-400/10 border-red-400/20";
    default: return "text-stone-400 bg-stone-400/10 border-stone-400/20";
  }
}

function getPriorityColor(priority: Project["priority"]) {
  switch (priority) {
    case "critical": return "text-red-400 bg-red-400/10 border-red-400/20";
    case "high": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "medium": return "text-teal-400 bg-teal-400/10 border-teal-400/20";
    case "low": return "text-stone-400 bg-stone-400/10 border-stone-400/20";
    default: return "text-stone-400 bg-stone-400/10 border-stone-400/20";
  }
}

function getCategoryColor(category: Project["category"]) {
  switch (category) {
    case "security": return "bg-red-500/20 text-red-400";
    case "development": return "bg-teal-500/20 text-teal-400";
    case "business": return "bg-amber-500/20 text-amber-400";
    case "marketing": return "bg-purple-500/20 text-purple-400";
    case "operations": return "bg-blue-500/20 text-blue-400";
    case "general": return "bg-stone-500/20 text-stone-400";
    default: return "bg-stone-500/20 text-stone-400";
  }
}

function getStageIcon(stage: Project["stage"]) {
  switch (stage) {
    case "planning": return <FileText className="w-4 h-4" />;
    case "development": return <Brain className="w-4 h-4" />;
    case "testing": return <AlertCircle className="w-4 h-4" />;
    case "deployed": return <Zap className="w-4 h-4" />;
    case "revenue": return <DollarSign className="w-4 h-4" />;
  }
}

function ProjectForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: ProjectFormData;
  onSave: (data: ProjectFormData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ProjectFormData>({ ...initial, goals: initial.goals ? [...initial.goals] : [] });
  const [newGoal, setNewGoal] = useState("");

  const set = <K extends keyof ProjectFormData>(k: K, v: ProjectFormData[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4 p-4 bg-stone-800/50 rounded-lg border border-stone-700" data-testid="project-form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Name *</label>
          <Input data-testid="input-name" className="bg-stone-900 border-stone-700 text-stone-100" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Category</label>
          <select data-testid="select-category" className="w-full rounded-md bg-stone-900 border border-stone-700 text-stone-100 px-3 py-2 text-sm" value={form.category} onChange={(e) => set("category", e.target.value as Project["category"])}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-stone-400 mb-1 block">Description</label>
        <Textarea data-testid="input-description" className="bg-stone-900 border-stone-700 text-stone-100" value={form.description || ""} onChange={(e) => set("description", e.target.value || null)} rows={2} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Stage</label>
          <select data-testid="select-stage" className="w-full rounded-md bg-stone-900 border border-stone-700 text-stone-100 px-3 py-2 text-sm" value={form.stage} onChange={(e) => set("stage", e.target.value as Project["stage"])}>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Status</label>
          <select data-testid="select-status" className="w-full rounded-md bg-stone-900 border border-stone-700 text-stone-100 px-3 py-2 text-sm" value={form.status} onChange={(e) => set("status", e.target.value as Project["status"])}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Priority</label>
          <select data-testid="select-priority" className="w-full rounded-md bg-stone-900 border border-stone-700 text-stone-100 px-3 py-2 text-sm" value={form.priority} onChange={(e) => set("priority", e.target.value as Project["priority"])}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Progress ({form.progress}%)</label>
          <input data-testid="input-progress" type="range" min={0} max={100} className="w-full accent-amber-400" value={form.progress} onChange={(e) => set("progress", Number(e.target.value))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Budget Allocated</label>
          <Input data-testid="input-budget-allocated" type="number" className="bg-stone-900 border-stone-700 text-stone-100" value={form.budget.allocated} onChange={(e) => set("budget", { ...form.budget, allocated: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Budget Spent</label>
          <Input data-testid="input-budget-spent" type="number" className="bg-stone-900 border-stone-700 text-stone-100" value={form.budget.spent} onChange={(e) => set("budget", { ...form.budget, spent: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-xs text-stone-400 mb-1 block">AI Savings</label>
          <Input data-testid="input-budget-savings" type="number" className="bg-stone-900 border-stone-700 text-stone-100" value={form.budget.aiSavings} onChange={(e) => set("budget", { ...form.budget, aiSavings: Number(e.target.value) })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Start Date</label>
          <Input data-testid="input-start-date" type="date" className="bg-stone-900 border-stone-700 text-stone-100" value={form.timeline.started} onChange={(e) => set("timeline", { ...form.timeline, started: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Deadline</label>
          <Input data-testid="input-deadline" type="date" className="bg-stone-900 border-stone-700 text-stone-100" value={form.timeline.deadline} onChange={(e) => set("timeline", { ...form.timeline, deadline: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Team (Human)</label>
          <Input data-testid="input-team-human" type="number" min={0} className="bg-stone-900 border-stone-700 text-stone-100" value={form.team.human} onChange={(e) => set("team", { ...form.team, human: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-xs text-stone-400 mb-1 block">AI Agents</label>
          <Input data-testid="input-team-ai" type="number" min={0} className="bg-stone-900 border-stone-700 text-stone-100" value={form.team.aiAgents} onChange={(e) => set("team", { ...form.team, aiAgents: Number(e.target.value) })} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Revenue</label>
          <Input data-testid="input-revenue" type="number" className="bg-stone-900 border-stone-700 text-stone-100" value={form.revenue ?? ""} onChange={(e) => set("revenue", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div>
          <label className="text-xs text-stone-400 mb-1 block">Notes</label>
          <Input data-testid="input-notes" className="bg-stone-900 border-stone-700 text-stone-100" value={form.notes || ""} onChange={(e) => set("notes", e.target.value || null)} />
        </div>
      </div>

      <div>
        <label className="text-xs text-stone-400 mb-2 block">Goals</label>
        <div className="space-y-2">
          {form.goals.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              <input data-testid={`goal-checkbox-${i}`} type="checkbox" className="accent-amber-400" checked={g.done} onChange={() => {
                const goals = [...form.goals];
                goals[i] = { ...goals[i], done: !goals[i].done };
                set("goals", goals);
              }} />
              <span className={`flex-1 text-sm ${g.done ? "line-through text-stone-500" : "text-stone-200"}`}>{g.text}</span>
              <Button data-testid={`button-remove-goal-${i}`} variant="ghost" size="sm" className="text-red-400 hover:bg-red-400/10 h-6 w-6 p-0" onClick={() => {
                set("goals", form.goals.filter((_, idx) => idx !== i));
              }}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input data-testid="input-new-goal" className="bg-stone-900 border-stone-700 text-stone-100 text-sm" placeholder="Add a goal..." value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyDown={(e) => {
              if (e.key === "Enter" && newGoal.trim()) {
                set("goals", [...form.goals, { text: newGoal.trim(), done: false }]);
                setNewGoal("");
              }
            }} />
            <Button data-testid="button-add-goal" variant="outline" size="sm" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10" disabled={!newGoal.trim()} onClick={() => {
              if (newGoal.trim()) {
                set("goals", [...form.goals, { text: newGoal.trim(), done: false }]);
                setNewGoal("");
              }
            }}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-stone-700">
        <Button data-testid="button-cancel" variant="ghost" className="text-stone-400 hover:text-stone-200" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
        <Button data-testid="button-save" className="bg-amber-500 text-stone-950 hover:bg-amber-400" disabled={!form.name.trim() || saving} onClick={() => onSave(form)}>
          <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onUpdate,
  onDelete,
}: {
  project: Project;
  onUpdate: (data: ProjectFormData) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <Card data-testid={`card-project-${project.id}`} className="bg-stone-900/50 border-stone-800 overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg flex-shrink-0 ${getStatusColor(project.status)}`}>
              {getStageIcon(project.stage)}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold truncate" data-testid={`text-project-name-${project.id}`}>{project.name}</h3>
              {project.description && <p className="text-sm text-stone-400 truncate">{project.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={getStatusColor(project.status)} data-testid={`badge-status-${project.id}`}>{project.status}</Badge>
            <Button data-testid={`button-edit-${project.id}`} variant="ghost" size="sm" className="text-amber-400 hover:bg-amber-500/10" onClick={() => setEditing(!editing)}>
              {editing ? <ChevronUp className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </Button>
            <Button data-testid={`button-delete-${project.id}`} variant="ghost" size="sm" className="text-red-400 hover:bg-red-400/10" onClick={() => {
              if (window.confirm(`Delete "${project.name}"?`)) onDelete();
            }}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!editing && (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={`text-xs ${getCategoryColor(project.category)}`}>{project.category}</Badge>
              <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>{project.priority}</Badge>
              <Badge className="text-xs bg-stone-700/50 text-stone-300">{project.stage}</Badge>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-400">Progress</span>
                <span className="text-amber-400">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-stone-400">
              <div>
                <span className="block text-stone-500">Budget</span>
                <span className="text-stone-200">${project.budget.allocated.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-stone-500">Spent</span>
                <span className="text-stone-200">${project.budget.spent.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-stone-500">Team</span>
                <span className="text-stone-200">{project.team.human}H + {project.team.aiAgents}AI</span>
              </div>
              <div>
                <span className="block text-stone-500">Deadline</span>
                <span className="text-stone-200">{project.timeline.deadline}</span>
              </div>
            </div>
            {project.goals.length > 0 && (
              <div className="mt-3 pt-3 border-t border-stone-800">
                <span className="text-xs text-stone-500 block mb-1">Goals ({project.goals.filter((g) => g.done).length}/{project.goals.length})</span>
                <div className="flex flex-wrap gap-1">
                  {project.goals.map((g, i) => (
                    <span key={i} className={`text-xs px-2 py-0.5 rounded ${g.done ? "bg-teal-500/10 text-teal-400 line-through" : "bg-stone-800 text-stone-300"}`}>{g.text}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {editing && (
          <ProjectForm
            initial={{
              name: project.name,
              description: project.description,
              stage: project.stage,
              status: project.status,
              progress: project.progress,
              priority: project.priority,
              category: project.category,
              budget: { ...project.budget },
              timeline: { ...project.timeline },
              team: { ...project.team },
              goals: project.goals ? [...project.goals] : [],
              notes: project.notes,
              revenue: project.revenue,
            }}
            onSave={(data) => {
              setSaving(true);
              onUpdate(data);
              setEditing(false);
              setSaving(false);
            }}
            onCancel={() => setEditing(false)}
            saving={saving}
          />
        )}
      </div>
    </Card>
  );
}

function InvestorView({ projects }: { projects: Project[] }) {
  const [metrics, setMetrics] = useState({
    agents: { total: 15, active: 12, scanning: 8, responding: 1 },
    platform: { clientsMonitored: 3, assetsProtected: 247, threatsDetected: 1834, incidentsContained: 12, avgResponseTime: '47 seconds' },
    business: { mrr: 23000, arr: 276000, growthRate: 300, clients: 3, pipeline: 12 },
    impact: { casesSupported: 8, victimsHelped: 3, networksDisrupted: 2, arrestsFacilitated: 5 },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        platform: { ...prev.platform, threatsDetected: prev.platform.threatsDetected + Math.floor(Math.random() * 3) },
        agents: { ...prev.agents, scanning: Math.floor(Math.random() * 10) + 5 },
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalBudget = projects.reduce((s, p) => s + (p.budget?.allocated || 0), 0);
  const totalRevenue = projects.reduce((s, p) => s + (p.revenue || 0), 0);
  const completedProjects = projects.filter(p => p.status === "complete").length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-stone-900/50 border-stone-800 p-6 relative overflow-hidden" data-testid="investor-arr">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-teal-400" />
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">+{metrics.business.growthRate}% MoM</Badge>
            </div>
            <div className="text-4xl font-bold mb-1">${(metrics.business.arr / 1000).toFixed(0)}K</div>
            <div className="text-sm text-stone-400">Annual Recurring Revenue</div>
            <div className="text-xs text-stone-500 mt-2">Target: $500K Y1 → $10M Y3</div>
          </div>
        </Card>
        <Card className="bg-stone-900/50 border-stone-800 p-6 relative overflow-hidden" data-testid="investor-cost">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-8 h-8 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">99% savings</Badge>
            </div>
            <div className="text-4xl font-bold mb-1">$50</div>
            <div className="text-sm text-stone-400">Cost per client/month</div>
            <div className="text-xs text-stone-500 mt-2">vs $50,000 traditional SOC</div>
          </div>
        </Card>
        <Card className="bg-stone-900/50 border-stone-800 p-6 relative overflow-hidden" data-testid="investor-response">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">300x faster</Badge>
            </div>
            <div className="text-4xl font-bold mb-1">47s</div>
            <div className="text-sm text-stone-400">Avg Response Time</div>
            <div className="text-xs text-stone-500 mt-2">vs 4-6 hours industry avg</div>
          </div>
        </Card>
        <Card className="bg-stone-900/50 border-stone-800 p-6 relative overflow-hidden" data-testid="investor-impact">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-red-400" />
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Real Impact</Badge>
            </div>
            <div className="text-4xl font-bold mb-1">{metrics.impact.victimsHelped}</div>
            <div className="text-sm text-stone-400">Victims Helped</div>
            <div className="text-xs text-stone-500 mt-2">{metrics.impact.arrestsFacilitated} arrests facilitated</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-stone-900/50 border-stone-800 p-6" data-testid="investor-threats">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-red-400" /> Live Threat Feed
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-sm text-stone-400">Real-time</span>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[
              { time: '2s ago', severity: 'high', msg: 'Port 3389 (RDP) exposed on 10.0.1.45', client: 'Client A' },
              { time: '15s ago', severity: 'critical', msg: 'SQL injection vulnerability detected', client: 'Client B' },
              { time: '32s ago', severity: 'medium', msg: 'Outdated nginx version (CVE-2023-1234)', client: 'Client A' },
              { time: '1m ago', severity: 'low', msg: 'Missing security headers on api.example.com', client: 'Client C' },
              { time: '2m ago', severity: 'high', msg: 'Suspicious Bitcoin transaction flagged', client: 'NGO Partner' },
              { time: '3m ago', severity: 'info', msg: 'Weekly scan completed - 247 assets healthy', client: 'Client A' },
            ].map((alert, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-stone-800/50 rounded-lg border border-stone-700 hover:border-stone-600 transition-colors">
                <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'high' ? 'text-orange-400' : alert.severity === 'medium' ? 'text-amber-400' : 'text-stone-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{alert.msg}</div>
                  <div className="text-xs text-stone-500 mt-1">{alert.client} • {alert.time}</div>
                </div>
                <Badge className={`${alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-stone-500/20 text-stone-400 border-stone-500/30'}`}>{alert.severity}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-stone-900/50 border-stone-800 p-6" data-testid="investor-agents">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-teal-400" /> AI Agent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-stone-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-teal-400" /></div>
                <div><div className="font-semibold">Recon Agents</div><div className="text-sm text-stone-400">Network scanning</div></div>
              </div>
              <div className="text-right"><div className="text-2xl font-bold text-teal-400">{metrics.agents.scanning}</div><div className="text-xs text-stone-500">active now</div></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-stone-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center"><Target className="w-5 h-5 text-amber-400" /></div>
                <div><div className="font-semibold">Threat Hunters</div><div className="text-sm text-stone-400">Behavioral analysis</div></div>
              </div>
              <div className="text-right"><div className="text-2xl font-bold text-amber-400">4</div><div className="text-xs text-stone-500">hunting now</div></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-stone-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center"><Zap className="w-5 h-5 text-red-400" /></div>
                <div><div className="font-semibold">Incident Responders</div><div className="text-sm text-stone-400">Active containment</div></div>
              </div>
              <div className="text-right"><div className="text-2xl font-bold text-red-400">{metrics.agents.responding}</div><div className="text-xs text-stone-500">responding</div></div>
            </div>
            <div className="p-4 bg-gradient-to-r from-teal-500/10 to-amber-500/10 rounded-lg border border-teal-500/20">
              <div className="text-sm text-stone-300 mb-2">Total AI Cost (All Clients)</div>
              <div className="text-3xl font-bold text-teal-400 mb-1">$0.00</div>
              <div className="text-xs text-stone-500">100% FREE models (Ollama + Groq) • 99.9% margin</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-stone-900/50 border-stone-800 p-6" data-testid="investor-economics">
        <h2 className="text-2xl font-bold mb-6">Unit Economics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><div className="text-stone-400 text-sm mb-2">Customer Acquisition Cost</div><div className="text-4xl font-bold mb-2">$2,000</div><div className="text-sm text-stone-500">Cold outreach + demo + pilot</div></div>
          <div><div className="text-stone-400 text-sm mb-2">Lifetime Value</div><div className="text-4xl font-bold mb-2 text-teal-400">$72,000</div><div className="text-sm text-stone-500">12 months × $10k/mo × 60% margin</div></div>
          <div><div className="text-stone-400 text-sm mb-2">LTV:CAC Ratio</div><div className="text-4xl font-bold mb-2 text-amber-400">36:1</div><div className="text-sm text-stone-500">VCs want 3:1, we have 36:1</div></div>
        </div>
        <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
            <span className="font-semibold text-teal-400">Exceptional Unit Economics</span>
          </div>
          <div className="text-sm text-stone-400">36:1 LTV:CAC ratio means every $1 spent on acquisition returns $36. Industry benchmark: 3:1. We're 12x better than industry standard.</div>
        </div>
      </Card>

      <Card className="bg-stone-900/50 border-stone-800 p-6" data-testid="investor-comparison">
        <h2 className="text-2xl font-bold mb-6">vs Traditional SOC</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-stone-800/50 rounded-lg border border-stone-700">
            <div className="text-lg font-semibold mb-4 text-stone-300">Traditional SOC</div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-stone-400">Monthly Cost:</span><span className="font-semibold text-red-400">$50,000</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Team Size:</span><span className="font-semibold">5-10 humans</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Response Time:</span><span className="font-semibold">4-6 hours</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Scalability:</span><span className="font-semibold text-red-400">Limited</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Coverage:</span><span className="font-semibold">8am-6pm</span></div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-teal-500/10 to-amber-500/10 rounded-lg border border-teal-500/30">
            <div className="text-lg font-semibold mb-4 text-teal-400">Atropos AI Security</div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-stone-400">Monthly Cost:</span><span className="font-semibold text-teal-400">$10,000</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Team Size:</span><span className="font-semibold">5 AI agents + 1 human</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Response Time:</span><span className="font-semibold text-teal-400">47 seconds</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Scalability:</span><span className="font-semibold text-teal-400">Infinite</span></div>
              <div className="flex justify-between"><span className="text-stone-400">Coverage:</span><span className="font-semibold">24/7/365</span></div>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20"><div className="text-3xl font-bold text-teal-400">80%</div><div className="text-sm text-stone-400 mt-1">Cost Savings</div></div>
          <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20"><div className="text-3xl font-bold text-teal-400">300x</div><div className="text-sm text-stone-400 mt-1">Faster Response</div></div>
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20"><div className="text-3xl font-bold text-amber-400">∞</div><div className="text-sm text-stone-400 mt-1">Scalability</div></div>
        </div>
      </Card>

      <Card className="bg-stone-900/50 border-stone-800 p-6" data-testid="investor-mission">
        <h2 className="text-2xl font-bold mb-6">Mission Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center"><div className="text-4xl font-bold text-amber-400 mb-2">{metrics.impact.casesSupported}</div><div className="text-sm text-stone-400">Cases Supported</div><div className="text-xs text-stone-600 mt-1">For Polaris, Thorn, NCMEC</div></div>
          <div className="text-center"><div className="text-4xl font-bold text-red-400 mb-2">{metrics.impact.victimsHelped}</div><div className="text-sm text-stone-400">Victims Helped</div><div className="text-xs text-stone-600 mt-1">Investigation leads</div></div>
          <div className="text-center"><div className="text-4xl font-bold text-teal-400 mb-2">{metrics.impact.networksDisrupted}</div><div className="text-sm text-stone-400">Networks Disrupted</div><div className="text-xs text-stone-600 mt-1">Trafficking operations</div></div>
          <div className="text-center"><div className="text-4xl font-bold text-teal-400 mb-2">{metrics.impact.arrestsFacilitated}</div><div className="text-sm text-stone-400">Arrests Facilitated</div><div className="text-xs text-stone-600 mt-1">Intelligence led to prosecutions</div></div>
        </div>
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-amber-400">Pro-Social + Profitable</span>
          </div>
          <div className="text-sm text-stone-400">ESG investors love this: High social impact + exceptional financial returns. Every dollar invested fights human trafficking AND generates 36:1 returns.</div>
        </div>
      </Card>

      {projects.length > 0 && (
        <Card className="bg-stone-900/50 border-stone-800 p-6" data-testid="investor-portfolio">
          <h2 className="text-2xl font-bold mb-4">Project Portfolio Overview</h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-stone-800/50 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  {getStageIcon(p.stage)}
                  <div className="min-w-0"><div className="text-sm font-semibold truncate">{p.name}</div><div className="text-xs text-stone-500 capitalize">{p.stage} • {p.category}</div></div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={p.progress} className="h-2 w-24" />
                  <span className="text-xs text-amber-400 w-8">{p.progress}%</span>
                  <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function BusinessDashboard() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const tabFromUrl = params.get("tab");
  const [topView, setTopView] = useState(tabFromUrl === "investor" ? "investor" : "business");
  const [activeTab, setActiveTab] = useState("projects");
  const [showNewForm, setShowNewForm] = useState(false);
  const [quickAddStage, setQuickAddStage] = useState<Project["stage"] | null>(null);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/business-projects"],
    queryFn: async () => {
      const res = await fetch("/api/business-projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const res = await fetch("/api/business-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-projects"] });
      toast({ title: "Project created", description: "New project added successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProjectFormData }) => {
      const res = await fetch(`/api/business-projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-projects"] });
      toast({ title: "Project updated", description: "Changes saved successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update project.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/business-projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-projects"] });
      toast({ title: "Project deleted", description: "Project removed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" });
    },
  });

  const totalProjects = projects.length;
  const inProgress = projects.filter((p) => p.status !== "complete").length;
  const completed = projects.filter((p) => p.status === "complete").length;
  const totalBudget = projects.reduce((s, p) => s + (p.budget?.allocated || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + (p.budget?.spent || 0), 0);
  const totalSavings = projects.reduce((s, p) => s + (p.budget?.aiSavings || 0), 0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent" data-testid="text-dashboard-title">
              Business HQ
            </h1>
            <p className="text-stone-400 text-sm">Plan, track, and pitch — all in one place</p>
          </div>
          <div className="flex bg-stone-900 border border-stone-800 rounded-lg p-1 gap-1" data-testid="view-switcher">
            <Button
              variant={topView === "business" ? "default" : "ghost"}
              size="sm"
              className={topView === "business" ? "bg-amber-500 text-stone-950 hover:bg-amber-400" : "text-stone-400 hover:text-stone-200"}
              onClick={() => setTopView("business")}
              data-testid="btn-view-business"
            >
              <Layers className="w-4 h-4 mr-1" /> Operations
            </Button>
            <Button
              variant={topView === "investor" ? "default" : "ghost"}
              size="sm"
              className={topView === "investor" ? "bg-amber-500 text-stone-950 hover:bg-amber-400" : "text-stone-400 hover:text-stone-200"}
              onClick={() => setTopView("investor")}
              data-testid="btn-view-investor"
            >
              <TrendingUp className="w-4 h-4 mr-1" /> Investor Pitch
            </Button>
          </div>
        </div>

        {topView === "investor" && <InvestorView projects={projects} />}
        {topView === "business" && (<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-stone-900/50 border-stone-800 p-4" data-testid="card-total-projects">
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-400 text-xs">Total Projects</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold">{totalProjects}</div>
          </Card>
          <Card className="bg-stone-900/50 border-stone-800 p-4" data-testid="card-in-progress">
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-400 text-xs">In Progress</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-amber-400">{inProgress}</div>
          </Card>
          <Card className="bg-stone-900/50 border-stone-800 p-4" data-testid="card-completed">
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-400 text-xs">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-teal-400">{completed}</div>
          </Card>
          <Card className="bg-stone-900/50 border-stone-800 p-4" data-testid="card-total-budget">
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-400 text-xs">Total Budget</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold">${totalBudget.toLocaleString()}</div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-stone-900 border border-stone-800 mb-4">
            <TabsTrigger data-testid="tab-projects" value="projects">Projects</TabsTrigger>
            <TabsTrigger data-testid="tab-planning" value="planning">Planning</TabsTrigger>
            <TabsTrigger data-testid="tab-analytics" value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">All Projects</h2>
              <Button data-testid="button-add-project" className="bg-amber-500 text-stone-950 hover:bg-amber-400" onClick={() => setShowNewForm(!showNewForm)}>
                <Plus className="w-4 h-4 mr-1" /> Add Project
              </Button>
            </div>

            {showNewForm && (
              <ProjectForm
                initial={defaultForm}
                onSave={(data) => {
                  createMutation.mutate(data);
                  setShowNewForm(false);
                }}
                onCancel={() => setShowNewForm(false)}
                saving={createMutation.isPending}
              />
            )}

            {isLoading && <div className="text-center py-12 text-stone-400">Loading projects...</div>}

            {!isLoading && projects.length === 0 && !showNewForm && (
              <Card className="bg-stone-900/50 border-stone-800 p-12 text-center">
                <Target className="w-12 h-12 text-stone-600 mx-auto mb-4" />
                <p className="text-stone-400 mb-4">No projects yet. Create your first project to get started.</p>
                <Button data-testid="button-add-first-project" className="bg-amber-500 text-stone-950 hover:bg-amber-400" onClick={() => setShowNewForm(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Create First Project
                </Button>
              </Card>
            )}

            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={(data) => updateMutation.mutate({ id: project.id, data })}
                onDelete={() => deleteMutation.mutate(project.id)}
              />
            ))}
          </TabsContent>

          <TabsContent value="planning" className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Project Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {STAGES.map((stage) => {
                const stageProjects = projects.filter((p) => p.stage === stage);
                return (
                  <div key={stage} className="bg-stone-900/30 rounded-lg border border-stone-800 p-3" data-testid={`column-${stage}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStageIcon(stage)}
                        <span className="text-sm font-semibold capitalize">{stage}</span>
                        <Badge className="bg-stone-700 text-stone-300 text-xs">{stageProjects.length}</Badge>
                      </div>
                      <Button data-testid={`button-quick-add-${stage}`} variant="ghost" size="sm" className="h-6 w-6 p-0 text-amber-400 hover:bg-amber-500/10" onClick={() => setQuickAddStage(quickAddStage === stage ? null : stage)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {quickAddStage === stage && (
                      <ProjectForm
                        initial={{ ...defaultForm, stage }}
                        onSave={(data) => {
                          createMutation.mutate(data);
                          setQuickAddStage(null);
                        }}
                        onCancel={() => setQuickAddStage(null)}
                        saving={createMutation.isPending}
                      />
                    )}

                    <div className="space-y-2">
                      {stageProjects.map((p) => (
                        <Card key={p.id} className="bg-stone-800/50 border-stone-700 p-3" data-testid={`kanban-card-${p.id}`}>
                          <div className="text-sm font-semibold truncate mb-1">{p.name}</div>
                          <div className="flex items-center gap-1 mb-2">
                            <Badge className={`text-[10px] px-1 py-0 ${getStatusColor(p.status)}`}>{p.status}</Badge>
                            <Badge className={`text-[10px] px-1 py-0 ${getPriorityColor(p.priority)}`}>{p.priority}</Badge>
                          </div>
                          <Progress value={p.progress} className="h-1.5" />
                          <div className="text-[10px] text-stone-500 mt-1">{p.progress}%</div>
                        </Card>
                      ))}
                      {stageProjects.length === 0 && (
                        <div className="text-xs text-stone-600 text-center py-4">No projects</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-stone-900/50 border-stone-800 p-5" data-testid="card-budget-allocated">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <span className="text-stone-400 text-sm">Total Allocated</span>
                </div>
                <div className="text-3xl font-bold">${totalBudget.toLocaleString()}</div>
              </Card>
              <Card className="bg-stone-900/50 border-stone-800 p-5" data-testid="card-budget-spent">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-red-400" />
                  <span className="text-stone-400 text-sm">Total Spent</span>
                </div>
                <div className="text-3xl font-bold text-red-400">${totalSpent.toLocaleString()}</div>
              </Card>
              <Card className="bg-stone-900/50 border-stone-800 p-5" data-testid="card-ai-savings">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-teal-400" />
                  <span className="text-stone-400 text-sm">AI Savings</span>
                </div>
                <div className="text-3xl font-bold text-teal-400">${totalSavings.toLocaleString()}</div>
              </Card>
            </div>

            <Card className="bg-stone-900/50 border-stone-800 p-5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" /> Projects by Category
              </h3>
              <div className="space-y-3">
                {CATEGORIES.map((cat) => {
                  const count = projects.filter((p) => p.category === cat).length;
                  const pct = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
                  return (
                    <div key={cat} data-testid={`bar-category-${cat}`}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-stone-300">{cat}</span>
                        <span className="text-stone-400">{count}</span>
                      </div>
                      <div className="h-3 bg-stone-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getCategoryColor(cat).includes("red") ? "bg-red-500/60" : getCategoryColor(cat).includes("teal") ? "bg-teal-500/60" : getCategoryColor(cat).includes("amber") ? "bg-amber-500/60" : getCategoryColor(cat).includes("purple") ? "bg-purple-500/60" : getCategoryColor(cat).includes("blue") ? "bg-blue-500/60" : "bg-stone-500/60"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="bg-stone-900/50 border-stone-800 p-5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" /> Projects by Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STATUSES.map((status) => {
                  const count = projects.filter((p) => p.status === status).length;
                  return (
                    <div key={status} className="bg-stone-800/50 rounded-lg p-3 text-center" data-testid={`stat-status-${status}`}>
                      <div className={`text-2xl font-bold ${status === "complete" || status === "on-track" ? "text-teal-400" : status === "at-risk" ? "text-amber-400" : "text-red-400"}`}>{count}</div>
                      <div className="text-xs text-stone-400 capitalize mt-1">{status}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="bg-stone-900/50 border-stone-800 p-5">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" /> Project Deadlines
              </h3>
              <div className="space-y-3">
                {projects.length === 0 && <p className="text-stone-500 text-sm">No projects to show.</p>}
                {[...projects]
                  .sort((a, b) => new Date(a.timeline.deadline).getTime() - new Date(b.timeline.deadline).getTime())
                  .map((p) => {
                    const deadline = new Date(p.timeline.deadline);
                    const now = new Date();
                    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-stone-800/50 rounded-lg" data-testid={`timeline-project-${p.id}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          {getStageIcon(p.stage)}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{p.name}</div>
                            <div className="text-xs text-stone-500">{p.timeline.started} → {p.timeline.deadline}</div>
                          </div>
                        </div>
                        <Badge className={daysLeft < 0 ? "bg-red-400/10 text-red-400" : daysLeft < 7 ? "bg-amber-400/10 text-amber-400" : "bg-teal-400/10 text-teal-400"}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        </>)}
      </div>
    </div>
  );
}
