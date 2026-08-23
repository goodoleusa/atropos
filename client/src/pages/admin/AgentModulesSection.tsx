import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, Plus, Edit2, Trash2, RefreshCw, Shield, Search, Database, 
  AlertTriangle, Eye, Users, Clock, Zap, ChevronDown, ChevronUp, Save
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
  createdAt: string;
  updatedAt: string;
}

const ICON_OPTIONS = ["Shield", "Search", "Database", "AlertTriangle", "Eye", "Users", "Target", "Zap"];
const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const COLOR_OPTIONS = ["bronze", "teal", "amber", "rose", "violet", "emerald", "blue", "red"];

export function AgentModulesSection() {
  const queryClient = useQueryClient();
  const [editingModule, setEditingModule] = useState<AgentModule | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newModule, setNewModule] = useState<Partial<AgentModule>>({
    difficulty: "Intermediate",
    estimatedTime: "30 min",
    color: "bronze",
    icon: "Shield",
    tags: [],
    objectives: [],
    tools: [],
    targetFields: [],
    dummyTargets: {},
    steps: [],
    adaptivePrompts: [],
    isActive: true,
    sortOrder: 0
  });
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const { data: modules = [], isLoading, refetch } = useQuery<AgentModule[]>({
    queryKey: ["/api/agent-modules"],
    queryFn: () => fetch("/api/agent-modules").then(r => r.json())
  });

  const seedMutation = useMutation({
    mutationFn: () => 
      fetch("/api/agent-modules/seed", { method: "POST" }).then(r => r.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-modules"] });
      alert(`Seeded ${data.seeded} modules from configuration`);
    },
    onError: (error: Error) => alert(`Error: ${error.message}`)
  });

  const saveMutation = useMutation({
    mutationFn: (module: Partial<AgentModule> & { moduleId: string }) =>
      fetch(`/api/agent-modules/${module.moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(module)
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-modules"] });
      setEditingModule(null);
      setCreateDialogOpen(false);
      setNewModule({
        difficulty: "Intermediate",
        estimatedTime: "30 min",
        color: "bronze",
        icon: "Shield",
        tags: [],
        objectives: [],
        tools: [],
        targetFields: [],
        dummyTargets: {},
        steps: [],
        adaptivePrompts: [],
        isActive: true,
        sortOrder: 0
      });
    },
    onError: (error: Error) => alert(`Error: ${error.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (moduleId: string) =>
      fetch(`/api/agent-modules/${moduleId}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-modules"] });
    },
    onError: (error: Error) => alert(`Error: ${error.message}`)
  });

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, typeof Shield> = { Shield, Search, Database, AlertTriangle, Eye, Users, Target, Zap };
    const IconComponent = icons[iconName] || Shield;
    return <IconComponent className="w-5 h-5" />;
  };

  const renderModuleForm = (module: Partial<AgentModule>, setModule: (m: Partial<AgentModule>) => void, isEdit: boolean) => (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="bg-black/50 border-amber-900/30 mb-4">
        <TabsTrigger value="basic" className="data-[state=active]:bg-amber-900/30 text-amber-800">Basic Info</TabsTrigger>
        <TabsTrigger value="content" className="data-[state=active]:bg-amber-900/30 text-amber-800">Content</TabsTrigger>
        <TabsTrigger value="workflow" className="data-[state=active]:bg-amber-900/30 text-amber-800">Workflow</TabsTrigger>
        <TabsTrigger value="advanced" className="data-[state=active]:bg-amber-900/30 text-amber-800">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 max-h-[400px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-amber-800 text-xs">Module ID</Label>
            <Input
              placeholder="e.g., domain-recon"
              value={module.moduleId || ""}
              onChange={(e) => setModule({ ...module, moduleId: e.target.value })}
              className="bg-black/50 border-amber-900/30 text-amber-800"
              disabled={isEdit}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-amber-800 text-xs">Name</Label>
            <Input
              placeholder="Domain Reconnaissance"
              value={module.name || ""}
              onChange={(e) => setModule({ ...module, name: e.target.value })}
              className="bg-black/50 border-amber-900/30 text-amber-800"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-amber-800 text-xs">Description</Label>
          <Textarea
            placeholder="Describe what this investigation module covers..."
            value={module.description || ""}
            onChange={(e) => setModule({ ...module, description: e.target.value })}
            className="bg-black/50 border-amber-900/30 text-amber-800 min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-amber-800 text-xs">Icon</Label>
            <Select value={module.icon || "Shield"} onValueChange={(v) => setModule({ ...module, icon: v })}>
              <SelectTrigger className="bg-black/50 border-amber-900/30 text-amber-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--card))] border-amber-900/50">
                {ICON_OPTIONS.map(icon => (
                  <SelectItem key={icon} value={icon} className="text-amber-800">{icon}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-amber-800 text-xs">Difficulty</Label>
            <Select value={module.difficulty || "Intermediate"} onValueChange={(v) => setModule({ ...module, difficulty: v })}>
              <SelectTrigger className="bg-black/50 border-amber-900/30 text-amber-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--card))] border-amber-900/50">
                {DIFFICULTY_OPTIONS.map(d => (
                  <SelectItem key={d} value={d} className="text-amber-800">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-amber-800 text-xs">Color</Label>
            <Select value={module.color || "bronze"} onValueChange={(v) => setModule({ ...module, color: v })}>
              <SelectTrigger className="bg-black/50 border-amber-900/30 text-amber-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--card))] border-amber-900/50">
                {COLOR_OPTIONS.map(c => (
                  <SelectItem key={c} value={c} className="text-amber-800">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-amber-800 text-xs">Estimated Time</Label>
            <Input
              placeholder="30 min"
              value={module.estimatedTime || ""}
              onChange={(e) => setModule({ ...module, estimatedTime: e.target.value })}
              className="bg-black/50 border-amber-900/30 text-amber-800"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-amber-800 text-xs">Sort Order</Label>
            <Input
              type="number"
              value={module.sortOrder || 0}
              onChange={(e) => setModule({ ...module, sortOrder: parseInt(e.target.value) || 0 })}
              className="bg-black/50 border-amber-900/30 text-amber-800"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-amber-800 text-xs">Tags (comma-separated)</Label>
          <Input
            placeholder="osint, reconnaissance, domains"
            value={(module.tags || []).join(", ")}
            onChange={(e) => setModule({ ...module, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            className="bg-black/50 border-amber-900/30 text-amber-800"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={module.isActive !== false}
            onCheckedChange={(checked) => setModule({ ...module, isActive: checked })}
          />
          <Label className="text-amber-800 text-xs">Active (visible to users)</Label>
        </div>
      </TabsContent>

      <TabsContent value="content" className="space-y-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          <Label className="text-amber-800 text-xs">Starter Prompt</Label>
          <Textarea
            placeholder="The AI assistant prompt that kicks off this investigation..."
            value={module.starterPrompt || ""}
            onChange={(e) => setModule({ ...module, starterPrompt: e.target.value })}
            className="bg-black/50 border-amber-900/30 text-amber-800 min-h-[120px] font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-amber-800 text-xs">Objectives (one per line)</Label>
          <Textarea
            placeholder="Enumerate subdomains&#10;Identify exposed services&#10;Map infrastructure"
            value={(module.objectives || []).join("\n")}
            onChange={(e) => setModule({ ...module, objectives: e.target.value.split("\n").filter(Boolean) })}
            className="bg-black/50 border-amber-900/30 text-amber-800 min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-amber-800 text-xs">Tools (comma-separated)</Label>
          <Input
            placeholder="subfinder, amass, shodan"
            value={(module.tools || []).join(", ")}
            onChange={(e) => setModule({ ...module, tools: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            className="bg-black/50 border-amber-900/30 text-amber-800"
          />
        </div>
      </TabsContent>

      <TabsContent value="workflow" className="space-y-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          <Label className="text-amber-800 text-xs">Target Fields (comma-separated)</Label>
          <Input
            placeholder="domain, ip, email"
            value={(module.targetFields || []).join(", ")}
            onChange={(e) => setModule({ ...module, targetFields: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
            className="bg-black/50 border-amber-900/30 text-amber-800"
          />
          <p className="text-muted-foreground text-xs">Fields users must fill in before starting</p>
        </div>

        <div className="space-y-2">
          <Label className="text-amber-800 text-xs">Dummy Targets (JSON)</Label>
          <Textarea
            placeholder='{"domain": "example.com", "ip": "192.168.1.1"}'
            value={JSON.stringify(module.dummyTargets || {}, null, 2)}
            onChange={(e) => {
              try {
                setModule({ ...module, dummyTargets: JSON.parse(e.target.value) });
              } catch {}
            }}
            className="bg-black/50 border-amber-900/30 text-amber-800 font-mono text-xs min-h-[80px]"
          />
          <p className="text-muted-foreground text-xs">Default values for practice mode</p>
        </div>

        <div className="space-y-2">
          <Label className="text-amber-800 text-xs">Steps (JSON array)</Label>
          <Textarea
            placeholder='[{"id": "step1", "title": "Passive Recon", "description": "...", "type": "action"}]'
            value={JSON.stringify(module.steps || [], null, 2)}
            onChange={(e) => {
              try {
                setModule({ ...module, steps: JSON.parse(e.target.value) });
              } catch {}
            }}
            className="bg-black/50 border-amber-900/30 text-amber-800 font-mono text-xs min-h-[120px]"
          />
        </div>
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          <Label className="text-amber-800 text-xs">Adaptive Prompts (JSON array)</Label>
          <Textarea
            placeholder='[{"trigger": "found subdomain", "response": "Good! Now check for open ports..."}]'
            value={JSON.stringify(module.adaptivePrompts || [], null, 2)}
            onChange={(e) => {
              try {
                setModule({ ...module, adaptivePrompts: JSON.parse(e.target.value) });
              } catch {}
            }}
            className="bg-black/50 border-amber-900/30 text-amber-800 font-mono text-xs min-h-[150px]"
          />
          <p className="text-muted-foreground text-xs">AI responses triggered by user discoveries</p>
        </div>
      </TabsContent>
    </Tabs>
  );

  if (isLoading) {
    return <div className="text-amber-800">Loading agent modules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-orbitron text-amber-800 flex items-center gap-2">
            <Target className="w-5 h-5" /> Investigation Modules
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Configure AI-guided investigation campaigns. Each module defines a complete security workflow.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="border-amber-900/50 text-amber-800 hover:bg-amber-900/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${seedMutation.isPending ? 'animate-spin' : ''}`} />
            Seed Defaults
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-700 hover:bg-amber-600 text-black">
                <Plus className="w-4 h-4 mr-2" /> New Module
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(var(--card))] border-amber-900/50 text-foreground max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-amber-800 font-orbitron">Create Investigation Module</DialogTitle>
              </DialogHeader>
              {renderModuleForm(newModule, setNewModule, false)}
              <Button
                onClick={() => newModule.moduleId && saveMutation.mutate({ 
                  ...newModule, 
                  moduleId: newModule.moduleId 
                } as any)}
                disabled={saveMutation.isPending || !newModule.moduleId || !newModule.name}
                className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold mt-4"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Create Module"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => (
          <Card 
            key={module.moduleId} 
            className={`bg-[hsl(var(--card))] border-amber-900/30 hover:border-amber-600/50 transition-colors ${!module.isActive ? 'opacity-50' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-800 text-sm font-mono flex items-center gap-2">
                  {getIconComponent(module.icon)}
                  {module.name}
                  {!module.isActive && <Badge variant="outline" className="border-red-900/50 text-red-700 text-xs ml-2">Disabled</Badge>}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`bg-${module.color}-900/30 text-${module.color}-500 border-${module.color}-900/50`}>
                    {module.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-amber-900/50 text-amber-800">
                    <Clock className="w-3 h-3 mr-1" /> {module.estimatedTime}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedCard(expandedCard === module.moduleId ? null : module.moduleId)}
                    className="text-amber-800 hover:bg-amber-900/20"
                  >
                    {expandedCard === module.moduleId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <CardDescription className="text-muted-foreground text-xs">{module.moduleId}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <p className="text-muted-foreground">{module.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {module.tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="border-amber-900/30 text-amber-700 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {expandedCard === module.moduleId && (
                <div className="mt-4 pt-4 border-t border-amber-900/30 space-y-3">
                  <div>
                    <Label className="text-amber-800 text-xs">Objectives ({module.objectives?.length || 0})</Label>
                    <ul className="list-disc list-inside text-muted-foreground mt-1">
                      {module.objectives?.slice(0, 3).map((obj, i) => <li key={i}>{obj}</li>)}
                      {(module.objectives?.length || 0) > 3 && <li className="text-amber-700">...and {module.objectives!.length - 3} more</li>}
                    </ul>
                  </div>
                  <div>
                    <Label className="text-amber-800 text-xs">Tools</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {module.tools?.map(tool => (
                        <Badge key={tool} className="bg-teal-900/30 text-teal-800 border-teal-900/50 text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {module.starterPrompt && (
                    <div>
                      <Label className="text-amber-800 text-xs">Starter Prompt Preview</Label>
                      <p className="text-muted-foreground font-mono text-xs mt-1 truncate">{module.starterPrompt.slice(0, 150)}...</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingModule(module)}
                      className="border-amber-900/50 text-amber-800 hover:bg-amber-900/20 min-h-[44px] min-w-[44px]"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[hsl(var(--card))] border-amber-900/50 text-foreground max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-amber-800 font-orbitron">Edit: {module.name}</DialogTitle>
                    </DialogHeader>
                    {editingModule && renderModuleForm(editingModule, setEditingModule as any, true)}
                    <Button
                      onClick={() => editingModule && saveMutation.mutate(editingModule as any)}
                      disabled={saveMutation.isPending}
                      className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold mt-4"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Delete "${module.name}"? This cannot be undone.`)) {
                      deleteMutation.mutate(module.moduleId);
                    }
                  }}
                  className="border-red-900/50 text-red-600 hover:bg-red-900/20 min-h-[44px] min-w-[44px]"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {modules.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No investigation modules found.</p>
            <p className="text-sm mt-2">Click "Seed Defaults" to import from configuration, or create a new module.</p>
          </div>
        )}
      </div>
    </div>
  );
}
