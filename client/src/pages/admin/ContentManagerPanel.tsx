import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronDown, ChevronRight, Skull, Target, Layers, BookOpen, FlaskConical,
  Save, Trash2, RefreshCw, Plus, ExternalLink, Eye, EyeOff, FileText,
  Clock, Zap, Globe, Shield, Search, Database, AlertTriangle, Users,
  Sparkles, Loader2, Play, Edit3, Share2
} from "lucide-react";

interface AgentModule {
  id: number;
  moduleId: string;
  name: string;
  icon: string;
  description: string | null;
  difficulty: string;
  estimatedTime: string;
  tags: string[];
  color: string;
  starterPrompt: string | null;
  objectives: string[];
  tools: string[];
  targetFields: string[];
  dummyTargets: Record<string, string>;
  steps: Array<{ id: string; title: string; description: string; type: string }>;
  adaptivePrompts: Array<{ trigger: string; response: string }>;
  isActive: boolean;
  sortOrder: number;
}

interface CurriculumTrack {
  id: number;
  trackId: string;
  category: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  order: number;
  prerequisiteTrackIds: string[];
  missions: any[];
  isActive: boolean;
}

interface DesignerCampaign {
  campaignId: string;
  name: string;
  description: string;
  difficulty?: string;
  category?: string;
  nodes?: any[];
  links?: any[];
  tags?: string[];
  isPublished?: boolean;
  hiddenClues?: any[];
}

type SelectedItem =
  | { type: "module"; id: string }
  | { type: "designer"; id: string }
  | { type: "curriculum"; id: string }
  | { type: "lab"; id: string }
  | null;

const DIFFICULTY_OPTIONS = ["beginner", "intermediate", "advanced", "expert"];
const COLOR_OPTIONS = ["bronze", "teal", "amber", "rose", "violet", "emerald", "blue", "red", "cyan", "purple", "yellow"];
const NATION_FLAGS: Record<string, string> = { Russia: "RUS", China: "CHN", DPRK: "DPRK", Iran: "IRN" };

export function ContentManagerPanel({ onOpenBuilder }: { onOpenBuilder: (campaignId?: string) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<SelectedItem>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    apt: true, modules: true, designer: true, curriculum: true, labs: true,
  });
  const [editForm, setEditForm] = useState<any>({});
  const [trackEditForm, setTrackEditForm] = useState<any>({});
  const [designerEditForm, setDesignerEditForm] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [genForm, setGenForm] = useState({
    contentType: "mission" as string,
    targetTrackId: "",
    difficulty: "intermediate",
    painPoints: "",
  });
  const [genDraft, setGenDraft] = useState<any>(null);

  const { data: modules = [] } = useQuery<AgentModule[]>({
    queryKey: ["/api/agent-modules"],
    queryFn: () => fetch("/api/agent-modules").then(r => r.json()),
  });

  const { data: designerCampaigns = [] } = useQuery<DesignerCampaign[]>({
    queryKey: ["/api/designer/campaigns"],
    queryFn: () => fetch("/api/designer/campaigns").then(r => r.ok ? r.json() : []),
  });

  const { data: curriculumTracks = [] } = useQuery<CurriculumTrack[]>({
    queryKey: ["/api/curriculum"],
    queryFn: () => fetch("/api/curriculum").then(r => r.json()),
  });

  const aptModules = modules.filter(m => m.tags?.some(t => t === "APT" || t.startsWith("APT")));
  const regularModules = modules.filter(m => !m.tags?.some(t => t === "APT" || t.startsWith("APT")));

  const saveModuleMut = useMutation({
    mutationFn: (data: any) =>
      fetch(`/api/agent-modules/${data.moduleId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-modules"] });
      setIsEditing(false);
      toast({ title: "Saved", description: "Module updated successfully." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteModuleMut = useMutation({
    mutationFn: (moduleId: string) =>
      fetch(`/api/agent-modules/${moduleId}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-modules"] });
      setSelected(null);
      toast({ title: "Deleted" });
    },
  });

  const seedModulesMut = useMutation({
    mutationFn: () => fetch("/api/agent-modules/seed", { method: "POST" }).then(r => r.json()),
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-modules"] });
      toast({ title: "Modules Seeded", description: `${d.seeded} modules synced from config.` });
    },
  });

  const seedCurriculumMut = useMutation({
    mutationFn: () => fetch("/api/curriculum/seed", { method: "POST" }).then(r => r.json()),
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      toast({ title: "Curriculum Seeded", description: `${d.seeded} tracks synced from config.` });
    },
  });

  const saveCurriculumMut = useMutation({
    mutationFn: ({ trackId, data }: { trackId: string; data: any }) =>
      fetch(`/api/curriculum/${trackId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      setIsEditing(false);
      toast({ title: "Saved", description: "Curriculum track updated." });
    },
  });

  const publishMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "publish" | "unpublish" }) =>
      fetch(`/api/designer/campaigns/${id}/${action}`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designer/campaigns"] });
      toast({ title: "Status updated" });
    },
  });

  const saveDesignerMut = useMutation({
    mutationFn: (data: { id: string; name: string; description: string; difficulty: string; category: string; tags: string[] }) =>
      fetch(`/api/designer/campaigns/${data.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, description: data.description, difficulty: data.difficulty, category: data.category, tags: data.tags }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designer/campaigns"] });
      setIsEditing(false);
      toast({ title: "Saved", description: "Campaign metadata updated." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const generateDraftMut = useMutation({
    mutationFn: (body: any) =>
      fetch("/api/curriculum/generate-draft", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: (d) => {
      setGenDraft(d.draft);
      toast({ title: "Draft Generated", description: "Review and approve below." });
    },
    onError: (e: Error) => toast({ title: "Generation Failed", description: e.message, variant: "destructive" }),
  });

  const approveDraftMut = useMutation({
    mutationFn: (body: any) =>
      fetch("/api/curriculum/approve-draft", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: (d) => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      setGenDraft(null);
      setGenOpen(false);
      toast({ title: "Published!", description: d.message });
    },
  });

  const toggleFolder = (key: string) =>
    setExpandedFolders(p => ({ ...p, [key]: !p[key] }));

  const selectItem = (item: SelectedItem) => {
    setSelected(item);
    setIsEditing(false);
    setEditForm({});
    setTrackEditForm({});
  };

  const getSelectedModule = () => selected?.type === "module" ? modules.find(m => m.moduleId === selected.id) : null;
  const getSelectedDesigner = () => selected?.type === "designer" ? designerCampaigns.find(c => c.campaignId === selected.id) : null;
  const getSelectedTrack = () => selected?.type === "curriculum" ? curriculumTracks.find(t => t.trackId === selected.id) : null;

  const startEditModule = (m: AgentModule) => {
    setIsEditing(true);
    setEditForm({
      moduleId: m.moduleId, name: m.name, description: m.description || "", icon: m.icon,
      difficulty: m.difficulty, estimatedTime: m.estimatedTime, color: m.color,
      tags: (m.tags || []).join(", "), starterPrompt: m.starterPrompt || "",
      objectives: (m.objectives || []).join("\n"), tools: (m.tools || []).join(", "),
      targetFields: (m.targetFields || []).join(", "),
      dummyTargets: JSON.stringify(m.dummyTargets || {}, null, 2),
      steps: JSON.stringify(m.steps || [], null, 2),
      adaptivePrompts: JSON.stringify(m.adaptivePrompts || [], null, 2),
      isActive: m.isActive, sortOrder: m.sortOrder,
    });
  };

  const saveModuleEdit = () => {
    const f = editForm;
    saveModuleMut.mutate({
      moduleId: f.moduleId, name: f.name, description: f.description, icon: f.icon,
      difficulty: f.difficulty, estimatedTime: f.estimatedTime, color: f.color,
      tags: f.tags.split(",").map((s: string) => s.trim()).filter(Boolean),
      starterPrompt: f.starterPrompt,
      objectives: f.objectives.split("\n").filter(Boolean),
      tools: f.tools.split(",").map((s: string) => s.trim()).filter(Boolean),
      targetFields: f.targetFields.split(",").map((s: string) => s.trim()).filter(Boolean),
      dummyTargets: (() => { try { return JSON.parse(f.dummyTargets); } catch { return {}; } })(),
      steps: (() => { try { return JSON.parse(f.steps); } catch { return []; } })(),
      adaptivePrompts: (() => { try { return JSON.parse(f.adaptivePrompts); } catch { return []; } })(),
      isActive: f.isActive, sortOrder: f.sortOrder,
    });
  };

  const startEditTrack = (t: CurriculumTrack) => {
    setIsEditing(true);
    setTrackEditForm({
      trackId: t.trackId, name: t.name, description: t.description,
      icon: t.icon, color: t.color, order: t.order, isActive: t.isActive,
    });
  };

  const getNation = (tags: string[]) => {
    for (const t of tags) if (NATION_FLAGS[t]) return NATION_FLAGS[t];
    return null;
  };

  const diffColor = (d: string) => {
    if (d === "beginner") return "text-emerald-400 border-emerald-800/50";
    if (d === "intermediate") return "text-amber-400 border-amber-800/50";
    if (d === "advanced") return "text-orange-400 border-orange-800/50";
    if (d === "expert") return "text-red-400 border-red-800/50";
    return "text-stone-400 border-stone-700";
  };

  const TreeItem = ({ icon, label, isActive, isSelected, onClick, badge, statusColor }: {
    icon: React.ReactNode; label: string; isActive?: boolean; isSelected?: boolean;
    onClick: () => void; badge?: string; statusColor?: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] transition-all group ${
        isSelected ? "bg-amber-900/30 text-amber-400 border border-amber-700/50" : "text-stone-400 hover:text-stone-200 hover:bg-stone-900/50 border border-transparent"
      }`}
      data-testid={`tree-item-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor || (isActive !== false ? "bg-emerald-500" : "bg-red-500")}`} />
      <span className="shrink-0">{icon}</span>
      <span className="truncate text-left flex-1">{label}</span>
      {badge && <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 border-stone-700 text-stone-500 shrink-0">{badge}</Badge>}
    </button>
  );

  const FolderHeader = ({ label, icon, count, folderKey, color }: {
    label: string; icon: React.ReactNode; count: number; folderKey: string; color: string;
  }) => (
    <button
      onClick={() => toggleFolder(folderKey)}
      className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-stone-900/30 transition-all group"
      data-testid={`folder-${folderKey}`}
    >
      {expandedFolders[folderKey] ? <ChevronDown className="w-3 h-3 text-stone-600" /> : <ChevronRight className="w-3 h-3 text-stone-600" />}
      <span className={`${color}`}>{icon}</span>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${color} flex-1 text-left`}>{label}</span>
      <span className="text-[9px] text-stone-600 font-mono">{count}</span>
    </button>
  );

  const renderOverview = () => (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-lg font-mono font-bold text-amber-500 mb-1" data-testid="content-manager-title">Content Manager</h2>
        <p className="text-xs text-stone-500">All content that appears in the Missions & Labs hub. Select an item from the tree to edit.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "APT Case Studies", count: aptModules.length, icon: <Skull className="w-4 h-4" />, color: "text-red-400" },
          { label: "Investigation Modules", count: regularModules.length, icon: <Target className="w-4 h-4" />, color: "text-amber-400" },
          { label: "Designer Campaigns", count: designerCampaigns.length, icon: <Layers className="w-4 h-4" />, color: "text-purple-400" },
          { label: "Curriculum Tracks", count: curriculumTracks.length, icon: <BookOpen className="w-4 h-4" />, color: "text-emerald-400" },
          { label: "Labs", count: 1, icon: <FlaskConical className="w-4 h-4" />, color: "text-violet-400" },
          { label: "Total", count: modules.length + designerCampaigns.length + curriculumTracks.length + 1, icon: <Globe className="w-4 h-4" />, color: "text-stone-300" },
        ].map(s => (
          <Card key={s.label} className="bg-stone-950 border-stone-800/50">
            <CardContent className="p-3 text-center">
              <div className={`mx-auto mb-1 ${s.color}`}>{s.icon}</div>
              <div className="text-lg font-bold text-stone-200">{s.count}</div>
              <div className="text-[9px] text-stone-600 uppercase">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onOpenBuilder()} className="bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 border border-purple-800/50" data-testid="btn-new-campaign">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Campaign
          </Button>
          <Button size="sm" variant="outline" onClick={() => seedModulesMut.mutate()} disabled={seedModulesMut.isPending} className="border-amber-800/50 text-amber-400" data-testid="btn-seed-modules">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${seedModulesMut.isPending ? "animate-spin" : ""}`} /> Seed Modules
          </Button>
          <Button size="sm" variant="outline" onClick={() => seedCurriculumMut.mutate()} disabled={seedCurriculumMut.isPending} className="border-emerald-800/50 text-emerald-400" data-testid="btn-seed-curriculum">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${seedCurriculumMut.isPending ? "animate-spin" : ""}`} /> Seed Curriculum
          </Button>
          <Button size="sm" variant="outline" onClick={() => setGenOpen(true)} className="border-cyan-800/50 text-cyan-400" data-testid="btn-generate-content">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate New Content
          </Button>
        </div>
      </div>

      <Card className="bg-stone-950 border-stone-800/50">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">How It Works</h3>
          <div className="space-y-2 text-xs text-stone-500">
            <div className="flex items-start gap-2"><Badge className="bg-amber-900/30 text-amber-400 text-[9px] shrink-0">1</Badge> <span>Select any item in the file tree to view and edit it</span></div>
            <div className="flex items-start gap-2"><Badge className="bg-amber-900/30 text-amber-400 text-[9px] shrink-0">2</Badge> <span>Toggle active/published status — changes appear in the hub immediately</span></div>
            <div className="flex items-start gap-2"><Badge className="bg-amber-900/30 text-amber-400 text-[9px] shrink-0">3</Badge> <span>Designer campaigns open in the visual Campaign Builder</span></div>
            <div className="flex items-start gap-2"><Badge className="bg-amber-900/30 text-amber-400 text-[9px] shrink-0">4</Badge> <span>Use "Generate New Content" to create missions/labs from AI using curriculum context</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderModuleEditor = (m: AgentModule) => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-mono font-bold text-amber-500 flex items-center gap-2">
            <span className="text-lg">{m.icon}</span> {m.name}
          </h2>
          <p className="text-[10px] text-stone-600 font-mono mt-0.5">{m.moduleId}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Switch checked={m.isActive} onCheckedChange={(v) => saveModuleMut.mutate({ moduleId: m.moduleId, isActive: v })} />
            <span className="text-[10px] text-stone-500">{m.isActive ? "Active" : "Hidden"}</span>
          </div>
          {!isEditing ? (
            <Button size="sm" onClick={() => startEditModule(m)} className="bg-amber-900/30 text-amber-400 border border-amber-800/50" data-testid="btn-edit-module">
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button size="sm" onClick={saveModuleEdit} disabled={saveModuleMut.isPending} className="bg-amber-600 text-black" data-testid="btn-save-module">
                <Save className="w-3.5 h-3.5 mr-1" /> {saveModuleMut.isPending ? "..." : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="border-stone-700 text-stone-400" data-testid="btn-cancel-edit">Cancel</Button>
            </div>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={diffColor(m.difficulty)}>{m.difficulty}</Badge>
            <Badge variant="outline" className="border-stone-700 text-stone-400"><Clock className="w-3 h-3 mr-1" /> {m.estimatedTime}</Badge>
            {m.tags?.map(t => <Badge key={t} variant="outline" className={t === "APT" ? "border-red-800 text-red-400" : "border-stone-700 text-stone-500"}>{t}</Badge>)}
          </div>
          <p className="text-sm text-stone-400">{m.description}</p>
          {m.objectives?.length > 0 && (
            <div>
              <Label className="text-amber-600 text-xs">Objectives ({m.objectives.length})</Label>
              <ul className="list-disc list-inside text-stone-500 text-xs mt-1 space-y-0.5">
                {m.objectives.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
          )}
          {m.tools?.length > 0 && (
            <div>
              <Label className="text-amber-600 text-xs">Tools</Label>
              <div className="flex flex-wrap gap-1 mt-1">{m.tools.map(t => <Badge key={t} className="bg-teal-900/30 text-teal-400 text-[10px]">{t}</Badge>)}</div>
            </div>
          )}
          {m.starterPrompt && (
            <div>
              <Label className="text-amber-600 text-xs">Starter Prompt</Label>
              <pre className="text-[10px] text-stone-500 font-mono bg-black/30 rounded p-2 mt-1 max-h-32 overflow-auto whitespace-pre-wrap">{m.starterPrompt}</pre>
            </div>
          )}
          {m.steps?.length > 0 && (
            <div>
              <Label className="text-amber-600 text-xs">Steps ({m.steps.length})</Label>
              <div className="space-y-1 mt-1">
                {m.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-stone-500">
                    <Badge className="bg-stone-800 text-stone-400 text-[9px] w-5 h-5 flex items-center justify-center p-0">{i+1}</Badge>
                    <span className="font-medium text-stone-300">{s.title}</span>
                    <span className="text-stone-600">— {s.description?.slice(0, 60)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete "${m.name}"?`)) deleteModuleMut.mutate(m.moduleId); }} className="border-red-900/50 text-red-500 hover:bg-red-950/30" data-testid="btn-delete-module">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Module
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="bg-black/50 border-amber-900/30 mb-3">
            <TabsTrigger value="basic" className="data-[state=active]:bg-amber-900/30 text-amber-500 text-xs">Basic</TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-amber-900/30 text-amber-500 text-xs">Content</TabsTrigger>
            <TabsTrigger value="workflow" className="data-[state=active]:bg-amber-900/30 text-amber-500 text-xs">Workflow</TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-amber-900/30 text-amber-500 text-xs">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-amber-600 text-[10px]">Name</Label>
                <Input value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-amber-600 text-[10px]">Icon (emoji)</Label>
                <Input value={editForm.icon || ""} onChange={e => setEditForm({ ...editForm, icon: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 h-8 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-amber-600 text-[10px]">Description</Label>
              <Textarea value={editForm.description || ""} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 text-xs min-h-[60px]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-amber-600 text-[10px]">Difficulty</Label>
                <Select value={editForm.difficulty} onValueChange={v => setEditForm({ ...editForm, difficulty: v })}>
                  <SelectTrigger className="bg-black/50 border-amber-900/30 text-stone-300 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0a0500] border-amber-900/50">{DIFFICULTY_OPTIONS.map(d => <SelectItem key={d} value={d} className="text-stone-300 text-xs">{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-amber-600 text-[10px]">Color</Label>
                <Select value={editForm.color} onValueChange={v => setEditForm({ ...editForm, color: v })}>
                  <SelectTrigger className="bg-black/50 border-amber-900/30 text-stone-300 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0a0500] border-amber-900/50">{COLOR_OPTIONS.map(c => <SelectItem key={c} value={c} className="text-stone-300 text-xs">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-amber-600 text-[10px]">Est. Time</Label>
                <Input value={editForm.estimatedTime || ""} onChange={e => setEditForm({ ...editForm, estimatedTime: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 h-8 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-amber-600 text-[10px]">Tags (comma-separated)</Label>
              <Input value={editForm.tags || ""} onChange={e => setEditForm({ ...editForm, tags: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 h-8 text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editForm.isActive !== false} onCheckedChange={v => setEditForm({ ...editForm, isActive: v })} />
              <Label className="text-stone-500 text-[10px]">Active (visible in hub)</Label>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-3">
            <div className="space-y-1">
              <Label className="text-amber-600 text-[10px]">Starter Prompt</Label>
              <Textarea value={editForm.starterPrompt || ""} onChange={e => setEditForm({ ...editForm, starterPrompt: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 text-xs font-mono min-h-[100px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-amber-600 text-[10px]">Objectives (one per line)</Label>
              <Textarea value={editForm.objectives || ""} onChange={e => setEditForm({ ...editForm, objectives: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 text-xs min-h-[80px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-amber-600 text-[10px]">Tools (comma-separated)</Label>
              <Input value={editForm.tools || ""} onChange={e => setEditForm({ ...editForm, tools: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 h-8 text-xs" />
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-3">
            <div className="space-y-1">
              <Label className="text-amber-600 text-[10px]">Target Fields (comma-separated)</Label>
              <Input value={editForm.targetFields || ""} onChange={e => setEditForm({ ...editForm, targetFields: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-amber-600 text-[10px]">Dummy Targets (JSON)</Label>
              <Textarea value={editForm.dummyTargets || "{}"} onChange={e => setEditForm({ ...editForm, dummyTargets: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 text-xs font-mono min-h-[60px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-amber-600 text-[10px]">Steps (JSON array)</Label>
              <Textarea value={editForm.steps || "[]"} onChange={e => setEditForm({ ...editForm, steps: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 text-xs font-mono min-h-[100px]" />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-3">
            <div className="space-y-1">
              <Label className="text-amber-600 text-[10px]">Adaptive Prompts (JSON array)</Label>
              <Textarea value={editForm.adaptivePrompts || "[]"} onChange={e => setEditForm({ ...editForm, adaptivePrompts: e.target.value })} className="bg-black/50 border-amber-900/30 text-stone-300 text-xs font-mono min-h-[120px]" />
              <p className="text-stone-600 text-[9px]">AI responses triggered by user discoveries during investigation</p>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );

  const renderDesignerEditor = (c: DesignerCampaign) => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-mono font-bold text-purple-400">{c.name}</h2>
          <p className="text-[10px] text-stone-600 font-mono mt-0.5">{c.campaignId}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button size="sm" variant="outline" className="border-stone-700 text-stone-400" onClick={() => {
              setDesignerEditForm({ name: c.name, description: c.description || "", difficulty: c.difficulty || "intermediate", category: c.category || "", tags: (c.tags || []).join(", ") });
              setIsEditing(true);
            }} data-testid="btn-edit-designer">
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
          )}
          <Button size="sm" onClick={() => publishMut.mutate({ id: c.campaignId, action: c.isPublished ? "unpublish" : "publish" })}
            className={c.isPublished ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50" : "bg-stone-900/50 text-stone-400 border border-stone-700"}
            data-testid="btn-toggle-publish"
          >
            {c.isPublished ? <><Eye className="w-3.5 h-3.5 mr-1" /> Published</> : <><EyeOff className="w-3.5 h-3.5 mr-1" /> Draft</>}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 p-4 bg-stone-950 border border-purple-900/30 rounded-lg">
          <div className="space-y-1">
            <Label className="text-purple-400 text-[10px]">Name</Label>
            <Input value={designerEditForm.name || ""} onChange={e => setDesignerEditForm({ ...designerEditForm, name: e.target.value })} className="bg-black/50 border-purple-900/30 text-stone-300 h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-purple-400 text-[10px]">Description</Label>
            <Textarea value={designerEditForm.description || ""} onChange={e => setDesignerEditForm({ ...designerEditForm, description: e.target.value })} className="bg-black/50 border-purple-900/30 text-stone-300 text-xs min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-purple-400 text-[10px]">Difficulty</Label>
              <select value={designerEditForm.difficulty || "intermediate"} onChange={e => setDesignerEditForm({ ...designerEditForm, difficulty: e.target.value })} className="w-full h-8 text-xs rounded-md border border-purple-900/30 bg-black/50 text-stone-300 px-2">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-purple-400 text-[10px]">Category</Label>
              <Input value={designerEditForm.category || ""} onChange={e => setDesignerEditForm({ ...designerEditForm, category: e.target.value })} className="bg-black/50 border-purple-900/30 text-stone-300 h-8 text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-purple-400 text-[10px]">Tags (comma-separated)</Label>
            <Input value={designerEditForm.tags || ""} onChange={e => setDesignerEditForm({ ...designerEditForm, tags: e.target.value })} className="bg-black/50 border-purple-900/30 text-stone-300 h-8 text-xs" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-purple-900/30 text-purple-400 border border-purple-800/50" onClick={() => saveDesignerMut.mutate({ id: c.campaignId, name: designerEditForm.name, description: designerEditForm.description, difficulty: designerEditForm.difficulty, category: designerEditForm.category, tags: designerEditForm.tags.split(",").map((t: string) => t.trim()).filter(Boolean) })} data-testid="btn-save-designer">
              <Save className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
            <Button size="sm" variant="outline" className="border-stone-700 text-stone-400" onClick={() => setIsEditing(false)} data-testid="btn-cancel-designer">Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-stone-400">{c.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={diffColor(c.difficulty || "intermediate")}>{c.difficulty || "intermediate"}</Badge>
            <Badge variant="outline" className="border-stone-700 text-stone-400">{c.nodes?.length || 0} nodes</Badge>
            <Badge variant="outline" className="border-stone-700 text-stone-400">{c.links?.length || 0} links</Badge>
            <Badge variant="outline" className="border-stone-700 text-stone-400">{c.hiddenClues?.length || 0} clues</Badge>
            {c.tags?.map(t => <Badge key={t} variant="outline" className="border-stone-700 text-stone-500">{t}</Badge>)}
          </div>
        </>
      )}

      <Button onClick={() => onOpenBuilder(c.campaignId)} className="w-full bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 border border-purple-800/50 py-6" data-testid="btn-open-builder">
        <Layers className="w-5 h-5 mr-2" /> Open in Campaign Builder
      </Button>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-stone-950 border-stone-800/50">
          <CardContent className="p-3 text-center">
            <FileText className="w-4 h-4 mx-auto mb-1 text-purple-400" />
            <div className="text-sm font-bold text-stone-200">{c.nodes?.length || 0}</div>
            <div className="text-[9px] text-stone-600">Nodes</div>
          </CardContent>
        </Card>
        <Card className="bg-stone-950 border-stone-800/50">
          <CardContent className="p-3 text-center">
            <Share2 className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
            <div className="text-sm font-bold text-stone-200">{c.links?.length || 0}</div>
            <div className="text-[9px] text-stone-600">Links</div>
          </CardContent>
        </Card>
        <Card className="bg-stone-950 border-stone-800/50">
          <CardContent className="p-3 text-center">
            <Search className="w-4 h-4 mx-auto mb-1 text-amber-400" />
            <div className="text-sm font-bold text-stone-200">{c.hiddenClues?.length || 0}</div>
            <div className="text-[9px] text-stone-600">Clues</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTrackEditor = (t: CurriculumTrack) => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-mono font-bold text-emerald-400 flex items-center gap-2">
            <span className="text-lg">{t.icon}</span> {t.name}
          </h2>
          <p className="text-[10px] text-stone-600 font-mono mt-0.5">{t.trackId} · {t.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Switch checked={t.isActive} onCheckedChange={(v) => saveCurriculumMut.mutate({ trackId: t.trackId, data: { isActive: v } })} />
            <span className="text-[10px] text-stone-500">{t.isActive ? "Active" : "Hidden"}</span>
          </div>
          {!isEditing ? (
            <Button size="sm" onClick={() => startEditTrack(t)} className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/50" data-testid="btn-edit-track">
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button size="sm" onClick={() => saveCurriculumMut.mutate({ trackId: t.trackId, data: trackEditForm })} disabled={saveCurriculumMut.isPending} className="bg-emerald-600 text-black" data-testid="btn-save-track">
                <Save className="w-3.5 h-3.5 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="border-stone-700 text-stone-400">Cancel</Button>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="space-y-3 p-4 bg-stone-950 rounded-lg border border-emerald-900/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-emerald-600 text-[10px]">Name</Label>
              <Input value={trackEditForm.name || ""} onChange={e => setTrackEditForm({ ...trackEditForm, name: e.target.value })} className="bg-black/50 border-emerald-900/30 text-stone-300 h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-emerald-600 text-[10px]">Icon (emoji)</Label>
              <Input value={trackEditForm.icon || ""} onChange={e => setTrackEditForm({ ...trackEditForm, icon: e.target.value })} className="bg-black/50 border-emerald-900/30 text-stone-300 h-8 text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-emerald-600 text-[10px]">Description</Label>
            <Textarea value={trackEditForm.description || ""} onChange={e => setTrackEditForm({ ...trackEditForm, description: e.target.value })} className="bg-black/50 border-emerald-900/30 text-stone-300 text-xs min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-emerald-600 text-[10px]">Color</Label>
              <Select value={trackEditForm.color} onValueChange={v => setTrackEditForm({ ...trackEditForm, color: v })}>
                <SelectTrigger className="bg-black/50 border-emerald-900/30 text-stone-300 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0a0500] border-emerald-900/50">{COLOR_OPTIONS.map(c => <SelectItem key={c} value={c} className="text-stone-300 text-xs">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-emerald-600 text-[10px]">Order</Label>
              <Input type="number" value={trackEditForm.order || 0} onChange={e => setTrackEditForm({ ...trackEditForm, order: parseInt(e.target.value) || 0 })} className="bg-black/50 border-emerald-900/30 text-stone-300 h-8 text-xs" />
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-stone-400">{t.description}</p>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => { setGenForm(p => ({ ...p, targetTrackId: t.trackId })); setGenOpen(true); }} className="border-cyan-800/50 text-cyan-400" data-testid="btn-generate-for-track">
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Generate Mission for This Track
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Missions ({t.missions?.length || 0})</h3>
        {t.missions?.map((m: any, i: number) => (
          <Card key={m.id || i} className="bg-stone-950 border-stone-800/50 hover:border-emerald-800/40 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <span>{m.icon || "📋"}</span> {m.name}
                </span>
                <div className="flex gap-1.5">
                  <Badge variant="outline" className={`text-[9px] ${diffColor(m.difficulty)}`}>{m.difficulty}</Badge>
                  <Badge variant="outline" className="text-[9px] border-stone-700 text-stone-500"><Clock className="w-2.5 h-2.5 mr-0.5" /> {m.estimatedTime}</Badge>
                </div>
              </div>
              <p className="text-[10px] text-stone-500 line-clamp-2">{m.description}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[9px] text-stone-600">
                <span>{m.objectives?.length || 0} objectives</span>
                <span>{m.exercises?.length || 0} exercises</span>
                <span>{m.xpReward || 0} XP</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLabEditor = () => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-mono font-bold text-violet-400 flex items-center gap-2">
          <FlaskConical className="w-5 h-5" /> Decoherence Lab
        </h2>
        <Badge className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">Active</Badge>
      </div>
      <p className="text-sm text-stone-400">AI failure mode exercises — test for hallucination, sycophancy, anchoring bias, and boundary violations. Learn to identify when AI breaks down.</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="border-violet-800/50 text-violet-400">12 exercises</Badge>
        <Badge variant="outline" className="border-stone-700 text-stone-400">30-60 min</Badge>
        <Badge variant="outline" className="border-stone-700 text-stone-500">intermediate</Badge>
      </div>
      <Button onClick={() => navigate("/decoherence")} className="bg-violet-900/30 text-violet-400 hover:bg-violet-900/50 border border-violet-800/50" data-testid="btn-open-lab">
        <Play className="w-4 h-4 mr-2" /> Open Lab
      </Button>
    </div>
  );

  const renderRightPane = () => {
    if (!selected) return renderOverview();
    if (selected.type === "module") {
      const m = getSelectedModule();
      return m ? renderModuleEditor(m) : <p className="p-6 text-stone-500">Module not found</p>;
    }
    if (selected.type === "designer") {
      const c = getSelectedDesigner();
      return c ? renderDesignerEditor(c) : <p className="p-6 text-stone-500">Campaign not found</p>;
    }
    if (selected.type === "curriculum") {
      const t = getSelectedTrack();
      return t ? renderTrackEditor(t) : <p className="p-6 text-stone-500">Track not found</p>;
    }
    if (selected.type === "lab") return renderLabEditor();
    return renderOverview();
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-[#0a0500] rounded-lg border border-stone-800/50 overflow-hidden" data-testid="content-manager">
      {/* File Tree */}
      <div className="w-72 border-r border-stone-800/50 flex flex-col shrink-0">
        <div className="p-3 border-b border-stone-800/30">
          <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Content Tree</h3>
          <p className="text-[9px] text-stone-600 mt-0.5">{modules.length + designerCampaigns.length + curriculumTracks.length + 1} items</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* Dashboard */}
            <TreeItem
              icon={<Globe className="w-3 h-3" />}
              label="Dashboard"
              isSelected={!selected}
              onClick={() => selectItem(null)}
              statusColor="bg-amber-500"
            />

            {/* APT Case Studies */}
            <FolderHeader label="APT Case Studies" icon={<Skull className="w-3 h-3" />} count={aptModules.length} folderKey="apt" color="text-red-400" />
            {expandedFolders.apt && aptModules.map(m => (
              <div key={m.moduleId} className="pl-4">
                <TreeItem
                  icon={<span className="text-[10px]">{m.icon}</span>}
                  label={m.name}
                  isActive={m.isActive}
                  isSelected={selected?.type === "module" && selected.id === m.moduleId}
                  onClick={() => selectItem({ type: "module", id: m.moduleId })}
                  badge={getNation(m.tags) || undefined}
                />
              </div>
            ))}

            {/* Investigation Modules */}
            <FolderHeader label="Investigation Modules" icon={<Target className="w-3 h-3" />} count={regularModules.length} folderKey="modules" color="text-amber-400" />
            {expandedFolders.modules && regularModules.map(m => (
              <div key={m.moduleId} className="pl-4">
                <TreeItem
                  icon={<span className="text-[10px]">{m.icon}</span>}
                  label={m.name}
                  isActive={m.isActive}
                  isSelected={selected?.type === "module" && selected.id === m.moduleId}
                  onClick={() => selectItem({ type: "module", id: m.moduleId })}
                  badge={m.difficulty}
                />
              </div>
            ))}

            {/* Designer Campaigns */}
            <FolderHeader label="Designer Campaigns" icon={<Layers className="w-3 h-3" />} count={designerCampaigns.length} folderKey="designer" color="text-purple-400" />
            {expandedFolders.designer && designerCampaigns.map(c => (
              <div key={c.campaignId} className="pl-4">
                <TreeItem
                  icon={<FileText className="w-3 h-3" />}
                  label={c.name}
                  isActive={c.isPublished}
                  isSelected={selected?.type === "designer" && selected.id === c.campaignId}
                  onClick={() => selectItem({ type: "designer", id: c.campaignId })}
                  badge={c.isPublished ? "live" : "draft"}
                  statusColor={c.isPublished ? "bg-emerald-500" : "bg-stone-600"}
                />
              </div>
            ))}

            {/* Curriculum Tracks */}
            <FolderHeader label="Curriculum Tracks" icon={<BookOpen className="w-3 h-3" />} count={curriculumTracks.length} folderKey="curriculum" color="text-emerald-400" />
            {expandedFolders.curriculum && curriculumTracks.map(t => (
              <div key={t.trackId} className="pl-4">
                <TreeItem
                  icon={<span className="text-[10px]">{t.icon}</span>}
                  label={t.name}
                  isActive={t.isActive}
                  isSelected={selected?.type === "curriculum" && selected.id === t.trackId}
                  onClick={() => selectItem({ type: "curriculum", id: t.trackId })}
                  badge={`${t.missions?.length || 0}m`}
                />
              </div>
            ))}

            {/* Labs */}
            <FolderHeader label="Labs" icon={<FlaskConical className="w-3 h-3" />} count={1} folderKey="labs" color="text-violet-400" />
            {expandedFolders.labs && (
              <div className="pl-4">
                <TreeItem
                  icon={<span className="text-[10px]">🧪</span>}
                  label="Decoherence Lab"
                  isActive={true}
                  isSelected={selected?.type === "lab"}
                  onClick={() => selectItem({ type: "lab", id: "decoherence" })}
                  badge="12 ex"
                />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom actions */}
        <div className="p-2 border-t border-stone-800/30 space-y-1">
          <Button size="sm" variant="ghost" onClick={() => onOpenBuilder()} className="w-full justify-start text-[10px] text-purple-400 hover:bg-purple-950/20 h-7" data-testid="btn-tree-new-campaign">
            <Plus className="w-3 h-3 mr-1.5" /> New Campaign
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setGenOpen(true)} className="w-full justify-start text-[10px] text-cyan-400 hover:bg-cyan-950/20 h-7" data-testid="btn-tree-generate">
            <Sparkles className="w-3 h-3 mr-1.5" /> Generate Content
          </Button>
        </div>
      </div>

      {/* Right Pane */}
      <ScrollArea className="flex-1">
        {renderRightPane()}
      </ScrollArea>

      {/* Generate Content Dialog */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="bg-[#0a0500] border-stone-800 text-stone-300 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-400 font-mono flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Generate New Content
            </DialogTitle>
          </DialogHeader>

          {!genDraft ? (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">Use AI to generate new missions, labs, or campaign flows from your curriculum context. The AI follows strict pedagogy rules (80/20 hands-on, Kolb's cycle, Bloom's taxonomy).</p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-cyan-600 text-[10px]">Content Type</Label>
                  <Select value={genForm.contentType} onValueChange={v => setGenForm(p => ({ ...p, contentType: v }))}>
                    <SelectTrigger className="bg-black/50 border-cyan-900/30 text-stone-300 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a0500] border-cyan-900/50">
                      <SelectItem value="mission" className="text-stone-300 text-xs">Mission (guided learning module)</SelectItem>
                      <SelectItem value="lab" className="text-stone-300 text-xs">Lab (hands-on exercise set)</SelectItem>
                      <SelectItem value="campaign_flow" className="text-stone-300 text-xs">Campaign Flow (multi-step investigation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-cyan-600 text-[10px]">Target Track</Label>
                  <Select value={genForm.targetTrackId} onValueChange={v => setGenForm(p => ({ ...p, targetTrackId: v }))}>
                    <SelectTrigger className="bg-black/50 border-cyan-900/30 text-stone-300 h-9 text-xs"><SelectValue placeholder="Select a curriculum track..." /></SelectTrigger>
                    <SelectContent className="bg-[#0a0500] border-cyan-900/50">
                      {curriculumTracks.map(t => (
                        <SelectItem key={t.trackId} value={t.trackId} className="text-stone-300 text-xs">
                          {t.icon} {t.name} ({t.missions?.length || 0} missions)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-cyan-600 text-[10px]">Difficulty</Label>
                  <Select value={genForm.difficulty} onValueChange={v => setGenForm(p => ({ ...p, difficulty: v }))}>
                    <SelectTrigger className="bg-black/50 border-cyan-900/30 text-stone-300 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a0500] border-cyan-900/50">
                      {DIFFICULTY_OPTIONS.map(d => <SelectItem key={d} value={d} className="text-stone-300 text-xs">{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-cyan-600 text-[10px]">Topic / Pain Points</Label>
                  <Textarea
                    value={genForm.painPoints}
                    onChange={e => setGenForm(p => ({ ...p, painPoints: e.target.value }))}
                    placeholder="Describe the topic, skill gap, or learning objective you want to address. E.g., 'Students struggle with WHOIS record analysis' or 'Need hands-on DNS enumeration practice'"
                    className="bg-black/50 border-cyan-900/30 text-stone-300 text-xs min-h-[80px]"
                  />
                  <p className="text-[9px] text-stone-600">The more context you provide, the better the generated content will be.</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  const track = curriculumTracks.find(t => t.id?.toString() === genForm.targetTrackId);
                  generateDraftMut.mutate({
                    contentType: genForm.contentType,
                    targetTrackId: genForm.targetTrackId,
                    targetCategory: track?.category || "osint",
                    difficulty: genForm.difficulty,
                    painPoints: genForm.painPoints,
                  });
                }}
                disabled={generateDraftMut.isPending || !genForm.targetTrackId || !genForm.painPoints.trim()}
                className="w-full bg-cyan-700 hover:bg-cyan-600 text-black font-bold"
                data-testid="btn-run-generate"
              >
                {generateDraftMut.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Draft</>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-bold text-cyan-400">Generated Draft</h3>
                <div className="space-y-2 text-xs text-stone-300">
                  <div><span className="text-cyan-600">Name:</span> {genDraft.name}</div>
                  <div><span className="text-cyan-600">Type:</span> {genDraft.type || genForm.contentType}</div>
                  <div><span className="text-cyan-600">Difficulty:</span> {genDraft.difficulty}</div>
                  {genDraft.description && <div><span className="text-cyan-600">Description:</span> {genDraft.description}</div>}
                  {genDraft.objectives && (
                    <div>
                      <span className="text-cyan-600">Objectives:</span>
                      <ul className="list-disc list-inside mt-1 text-stone-400">
                        {genDraft.objectives.map((o: string, i: number) => <li key={i}>{o}</li>)}
                      </ul>
                    </div>
                  )}
                  {genDraft.exercises && (
                    <div>
                      <span className="text-cyan-600">Exercises ({genDraft.exercises.length}):</span>
                      {genDraft.exercises.map((ex: any, i: number) => (
                        <div key={i} className="ml-3 mt-1 p-2 bg-black/30 rounded">
                          <div className="font-bold text-stone-200">{ex.title}</div>
                          <div className="text-stone-500 text-[10px]">{ex.type} · {ex.instructions?.slice(0, 100)}...</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => approveDraftMut.mutate({
                  draft: genDraft,
                  targetTrackId: genForm.targetTrackId,
                  contentType: genForm.contentType,
                })} disabled={approveDraftMut.isPending} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-black font-bold" data-testid="btn-approve-draft">
                  {approveDraftMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve & Publish"}
                </Button>
                <Button variant="outline" onClick={() => setGenDraft(null)} className="border-stone-700 text-stone-400" data-testid="btn-reject-draft">
                  Regenerate
                </Button>
                <Button variant="outline" onClick={() => { setGenDraft(null); setGenOpen(false); }} className="border-stone-700 text-stone-400">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
