import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BookOpen, ChevronDown, ChevronRight, Save, RefreshCw, Target,
  Layers, Brain, Globe, Edit, X, Check, Trash2, Plus, Zap, Clock,
  Star, GraduationCap, AlertTriangle, BarChart3, Sparkles, Loader2
} from "lucide-react";

interface TrackStat {
  trackId: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  missionCount: number;
  exerciseCount: number;
  objectiveCount: number;
  updatedAt: string;
}

interface OverviewStats {
  totalTracks: number;
  aiTracks: number;
  osintTracks: number;
  totalMissions: number;
  totalExercises: number;
  totalObjectives: number;
  tracks: TrackStat[];
}

interface CurriculumTrackFull {
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
  updatedAt: string;
  createdAt: string;
}

export function CurriculumSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [editingTrack, setEditingTrack] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const [missionDialogTrackId, setMissionDialogTrackId] = useState<string | null>(null);
  const [missionDialogIndex, setMissionDialogIndex] = useState<number | null>(null);
  const [missionEditForm, setMissionEditForm] = useState<Record<string, any>>({});

  const [genOpen, setGenOpen] = useState(false);
  const [genContentType, setGenContentType] = useState<string>("mission");
  const [genTargetTrack, setGenTargetTrack] = useState<string>("");
  const [genDifficulty, setGenDifficulty] = useState<string>("intermediate");
  const [genPainPoints, setGenPainPoints] = useState<string>("");
  const [genSelectedRecs, setGenSelectedRecs] = useState<number[]>([]);
  const [genDraft, setGenDraft] = useState<any>(null);
  const [genError, setGenError] = useState<string>("");

  const { data: stats, isLoading: statsLoading } = useQuery<OverviewStats>({
    queryKey: ["/api/curriculum/stats/overview"],
    queryFn: () => fetch("/api/curriculum/stats/overview").then(r => r.json()),
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery<CurriculumTrackFull[]>({
    queryKey: ["/api/curriculum"],
    queryFn: () => fetch("/api/curriculum").then(r => r.json()),
  });

  const { data: recs = [] } = useQuery<any[]>({
    queryKey: ["/api/recs"],
    queryFn: () => fetch("/api/recs").then(r => r.json()),
    enabled: genOpen,
  });

  const generateDraftMutation = useMutation({
    mutationFn: (body: any) => fetch("/api/curriculum/generate-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Generation failed");
      return data;
    }),
    onSuccess: (data) => {
      setGenDraft(data.draft);
      setGenError("");
      toast({ title: "Draft Generated", description: "Review the draft below. Edit any fields before approving." });
    },
    onError: (e: Error) => {
      setGenError(e.message);
      toast({ title: "Generation Failed", description: e.message, variant: "destructive" });
    },
  });

  const approveDraftMutation = useMutation({
    mutationFn: (body: any) => fetch("/api/curriculum/approve-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Approval failed");
      return data;
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum/stats/overview"] });
      setGenDraft(null);
      toast({ title: "Published!", description: data.message });
    },
    onError: (e: Error) => toast({ title: "Approval Failed", description: e.message, variant: "destructive" }),
  });

  const seedMutation = useMutation({
    mutationFn: () => fetch("/api/curriculum/seed", { method: "POST" }).then(r => r.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum/stats/overview"] });
      toast({ title: "Curriculum Seeded", description: `${data.seeded} tracks synced from static config.` });
    },
    onError: () => toast({ title: "Seed Failed", variant: "destructive" }),
  });

  const updateTrackMutation = useMutation({
    mutationFn: ({ trackId, data }: { trackId: string; data: any }) =>
      fetch(`/api/curriculum/${trackId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum"] });
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum/stats/overview"] });
      setEditingTrack(null);
      setMissionDialogOpen(false);
      setMissionDialogTrackId(null);
      setMissionDialogIndex(null);
      toast({ title: "Track Updated", description: "Changes saved to database." });
    },
    onError: () => toast({ title: "Update Failed", variant: "destructive" }),
  });

  const startEditTrack = (track: CurriculumTrackFull) => {
    setEditingTrack(track.trackId);
    setEditForm({
      name: track.name,
      description: track.description,
      icon: track.icon,
      color: track.color,
      order: track.order,
      isActive: track.isActive,
    });
  };

  const saveTrackEdit = (trackId: string) => {
    updateTrackMutation.mutate({ trackId, data: editForm });
  };

  const openMissionDialog = (trackId: string, mission: any, missionIndex: number) => {
    setMissionDialogTrackId(trackId);
    setMissionDialogIndex(missionIndex);
    setMissionEditForm({
      name: mission.name,
      description: mission.description,
      difficulty: mission.difficulty,
      estimatedTime: mission.estimatedTime,
      xpReward: mission.xpReward,
      objectives: mission.objectives || [],
      keyTakeaways: mission.keyTakeaways || [],
      exercises: (mission.exercises || []).map((ex: any) => ({
        title: ex.title || "",
        type: ex.type || "",
        instructions: ex.instructions || "",
        hints: ex.hints || [],
        successCriteria: ex.successCriteria || "",
      })),
    });
    setMissionDialogOpen(true);
  };

  const saveMissionEdit = () => {
    if (!missionDialogTrackId || missionDialogIndex === null) return;
    const track = tracks.find(t => t.trackId === missionDialogTrackId);
    if (!track) return;
    const updatedMissions = [...track.missions];
    updatedMissions[missionDialogIndex] = {
      ...updatedMissions[missionDialogIndex],
      name: missionEditForm.name,
      description: missionEditForm.description,
      difficulty: missionEditForm.difficulty,
      estimatedTime: missionEditForm.estimatedTime,
      xpReward: Number(missionEditForm.xpReward),
      objectives: missionEditForm.objectives,
      keyTakeaways: missionEditForm.keyTakeaways,
      exercises: missionEditForm.exercises,
    };
    updateTrackMutation.mutate({ trackId: missionDialogTrackId, data: { missions: updatedMissions } });
  };

  const addObjective = () => {
    setMissionEditForm(f => ({ ...f, objectives: [...(f.objectives || []), ""] }));
  };
  const removeObjective = (index: number) => {
    setMissionEditForm(f => ({ ...f, objectives: f.objectives.filter((_: any, i: number) => i !== index) }));
  };
  const updateObjective = (index: number, value: string) => {
    setMissionEditForm(f => {
      const updated = [...f.objectives];
      updated[index] = value;
      return { ...f, objectives: updated };
    });
  };

  const addKeyTakeaway = () => {
    setMissionEditForm(f => ({ ...f, keyTakeaways: [...(f.keyTakeaways || []), ""] }));
  };
  const removeKeyTakeaway = (index: number) => {
    setMissionEditForm(f => ({ ...f, keyTakeaways: f.keyTakeaways.filter((_: any, i: number) => i !== index) }));
  };
  const updateKeyTakeaway = (index: number, value: string) => {
    setMissionEditForm(f => {
      const updated = [...f.keyTakeaways];
      updated[index] = value;
      return { ...f, keyTakeaways: updated };
    });
  };

  const addExercise = () => {
    setMissionEditForm(f => ({
      ...f,
      exercises: [...(f.exercises || []), { title: "", type: "", instructions: "", hints: [], successCriteria: "" }],
    }));
  };
  const removeExercise = (index: number) => {
    setMissionEditForm(f => ({ ...f, exercises: f.exercises.filter((_: any, i: number) => i !== index) }));
  };
  const updateExercise = (index: number, field: string, value: any) => {
    setMissionEditForm(f => {
      const updated = [...f.exercises];
      updated[index] = { ...updated[index], [field]: value };
      return { ...f, exercises: updated };
    });
  };

  const toggleTrackActive = (trackId: string, isActive: boolean) => {
    updateTrackMutation.mutate({ trackId, data: { isActive: !isActive } });
  };

  const aiTracks = tracks.filter(t => t.category === "ai");
  const osintTracks = tracks.filter(t => t.category === "osint");

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40';
      case 'intermediate': return 'bg-amber-900/30 text-amber-400 border-amber-800/40';
      case 'advanced': return 'bg-orange-900/30 text-orange-400 border-orange-800/40';
      case 'expert': return 'bg-red-900/30 text-red-400 border-red-800/40';
      default: return 'bg-stone-800 text-stone-400';
    }
  };

  if (statsLoading || tracksLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2" data-testid="curriculum-title">
            <GraduationCap className="w-5 h-5" /> Curriculum Dashboard
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Edit tracks, missions, and learning objectives. Changes push to the entire platform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="border-amber-800/50 text-amber-400 hover:bg-amber-900/30"
            data-testid="btn-seed-curriculum"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${seedMutation.isPending ? 'animate-spin' : ''}`} />
            {tracks.length === 0 ? 'Seed from Config' : 'Re-sync Config'}
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="curriculum-stats">
          {[
            { label: 'Total Tracks', value: stats.totalTracks, icon: Layers, color: 'text-amber-500' },
            { label: 'AI Tracks', value: stats.aiTracks, icon: Brain, color: 'text-teal-500' },
            { label: 'OSINT Tracks', value: stats.osintTracks, icon: Globe, color: 'text-cyan-500' },
            { label: 'Missions', value: stats.totalMissions, icon: Target, color: 'text-amber-400' },
            { label: 'Exercises', value: stats.totalExercises, icon: Zap, color: 'text-emerald-500' },
            { label: 'Objectives', value: stats.totalObjectives, icon: BookOpen, color: 'text-purple-400' },
          ].map(s => (
            <Card key={s.label} className="bg-[#0a0500] border-stone-800/50">
              <CardContent className="p-3 text-center">
                <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-[9px] text-stone-500 uppercase tracking-widest">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className={`bg-[#0a0500] transition-colors ${genOpen ? 'border-amber-800/40' : 'border-stone-800/40'}`} data-testid="content-generator-card">
        <CardHeader className="p-3 pb-0 cursor-pointer" onClick={() => setGenOpen(o => !o)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-amber-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Content Generator
            </CardTitle>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-stone-600" data-testid="toggle-content-generator">
              {genOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        {genOpen && (
          <CardContent className="p-3 pt-2 space-y-4">
            <div>
              <span className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Source Selection</span>
              {recs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {recs.map((rec: any) => {
                    const isSelected = genSelectedRecs.includes(rec.id);
                    return (
                      <div
                        key={rec.id}
                        className={`rounded border p-2 cursor-pointer transition-colors ${isSelected ? 'border-amber-500 bg-amber-950/20' : 'border-stone-800/40 bg-stone-950/30 hover:border-stone-700'}`}
                        onClick={() => setGenSelectedRecs(prev => isSelected ? prev.filter(id => id !== rec.id) : [...prev, rec.id])}
                        data-testid={`rec-card-${rec.id}`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-medium text-white truncate">{rec.title}</span>
                          {rec.priority && <Badge className={`text-[7px] border ${rec.priority === 'critical' ? 'bg-red-900/30 text-red-400 border-red-800/40' : rec.priority === 'high' ? 'bg-orange-900/30 text-orange-400 border-orange-800/40' : 'bg-stone-800 text-stone-400 border-stone-700'}`}>{rec.priority}</Badge>}
                          {rec.category && <Badge variant="outline" className="text-[7px] border-stone-700 text-stone-500">{rec.category}</Badge>}
                        </div>
                        {rec.painPointsAddressed?.length > 0 && (
                          <div className="text-[9px] text-stone-600 mt-1">{rec.painPointsAddressed.length} pain points</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-stone-600 mt-1 italic">No recs loaded yet</p>
              )}
              <div className="mt-3">
                <Label className="text-[9px] text-stone-500 uppercase">Additional context / pain points</Label>
                <Textarea
                  value={genPainPoints}
                  onChange={e => setGenPainPoints(e.target.value)}
                  placeholder="Describe custom guidance, pain points, or topics..."
                  className="text-xs bg-stone-950 border-stone-800 min-h-[60px] mt-1"
                  data-testid="input-gen-pain-points"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Generation Config</span>
              <div className="space-y-3 mt-2">
                <div>
                  <Label className="text-[9px] text-stone-500 uppercase mb-1 block">Content Type</Label>
                  <div className="flex gap-1">
                    {["mission", "lab", "campaign_flow"].map(ct => (
                      <Button
                        key={ct}
                        size="sm"
                        variant="ghost"
                        className={`text-xs h-8 px-3 ${genContentType === ct ? 'bg-amber-700 text-black' : 'text-stone-400 hover:text-amber-400'}`}
                        onClick={() => setGenContentType(ct)}
                        data-testid={`btn-content-type-${ct}`}
                      >
                        {ct.replace("_", " ")}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-[9px] text-stone-500 uppercase mb-1 block">Target Track</Label>
                  <select
                    value={genTargetTrack}
                    onChange={e => setGenTargetTrack(e.target.value)}
                    className="w-full h-8 text-xs bg-stone-950 border border-stone-800 rounded px-2 text-white"
                    data-testid="select-gen-target-track"
                  >
                    <option value="">Select a track...</option>
                    {tracks.map(t => (
                      <option key={t.trackId} value={t.trackId}>{t.name} ({t.category})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[9px] text-stone-500 uppercase mb-1 block">Difficulty</Label>
                  <div className="flex gap-1">
                    {["beginner", "intermediate", "advanced", "expert"].map(d => (
                      <Button
                        key={d}
                        size="sm"
                        variant="ghost"
                        className={`text-xs h-8 px-3 ${genDifficulty === d ? 'bg-amber-700 text-black' : 'text-stone-400 hover:text-amber-400'}`}
                        onClick={() => setGenDifficulty(d)}
                        data-testid={`btn-difficulty-${d}`}
                      >
                        {d}
                      </Button>
                    ))}
                  </div>
                </div>
                {genError && <p className="text-xs text-red-400">{genError}</p>}
                <Button
                  onClick={() => generateDraftMutation.mutate({
                    recIds: genSelectedRecs,
                    painPoints: genPainPoints,
                    targetTrackId: genTargetTrack,
                    targetCategory: tracks.find(t => t.trackId === genTargetTrack)?.category || "ai",
                    difficulty: genDifficulty,
                    contentType: genContentType,
                  })}
                  disabled={generateDraftMutation.isPending}
                  className="bg-amber-700 hover:bg-amber-600 text-black min-h-[44px] w-full"
                  data-testid="btn-generate-draft"
                >
                  {generateDraftMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {generateDraftMutation.isPending ? "Generating..." : "Generate Draft"}
                </Button>
              </div>
            </div>

            {genDraft && (
              <div className="space-y-3 border-t border-amber-900/30 pt-3">
                <span className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Draft Review & Edit</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[9px] text-stone-500 uppercase">Mission Name</Label>
                    <Input value={genDraft.name || ''} onChange={e => setGenDraft((d: any) => ({ ...d, name: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-gen-name" />
                  </div>
                  <div>
                    <Label className="text-[9px] text-stone-500 uppercase">ID</Label>
                    <Input value={genDraft.id || ''} onChange={e => setGenDraft((d: any) => ({ ...d, id: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-gen-id" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <Label className="text-[9px] text-stone-500 uppercase">Icon</Label>
                    <Input value={genDraft.icon || ''} onChange={e => setGenDraft((d: any) => ({ ...d, icon: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-gen-icon" />
                  </div>
                  <div>
                    <Label className="text-[9px] text-stone-500 uppercase">Difficulty</Label>
                    <select value={genDraft.difficulty || 'intermediate'} onChange={e => setGenDraft((d: any) => ({ ...d, difficulty: e.target.value }))} className="w-full h-8 text-xs bg-stone-950 border border-stone-800 rounded px-1 text-white" data-testid="select-gen-difficulty">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[9px] text-stone-500 uppercase">Estimated Time</Label>
                    <Input value={genDraft.estimatedTime || ''} onChange={e => setGenDraft((d: any) => ({ ...d, estimatedTime: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-gen-time" />
                  </div>
                  <div>
                    <Label className="text-[9px] text-stone-500 uppercase">XP Reward</Label>
                    <Input type="number" value={genDraft.xpReward || 0} onChange={e => setGenDraft((d: any) => ({ ...d, xpReward: Number(e.target.value) }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-gen-xp" />
                  </div>
                </div>
                <div>
                  <Label className="text-[9px] text-stone-500 uppercase">Description</Label>
                  <Textarea value={genDraft.description || ''} onChange={e => setGenDraft((d: any) => ({ ...d, description: e.target.value }))} className="text-xs bg-stone-950 border-stone-800 min-h-[60px]" data-testid="input-gen-description" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[9px] text-stone-500 uppercase">Objectives</Label>
                    <Button size="sm" variant="ghost" onClick={() => setGenDraft((d: any) => ({ ...d, objectives: [...(d.objectives || []), ""] }))} className="h-7 text-[10px] text-amber-400 hover:text-amber-300" data-testid="gen-add-objective">
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {(genDraft.objectives || []).map((obj: string, i: number) => (
                      <div key={i} className="flex items-center gap-1">
                        <Input
                          value={obj}
                          onChange={e => setGenDraft((d: any) => { const u = [...d.objectives]; u[i] = e.target.value; return { ...d, objectives: u }; })}
                          className="h-7 text-xs bg-black/50 border-amber-900/30 flex-1"
                          data-testid={`input-gen-objective-${i}`}
                        />
                        <Button size="sm" variant="ghost" onClick={() => setGenDraft((d: any) => ({ ...d, objectives: d.objectives.filter((_: any, idx: number) => idx !== i) }))} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 shrink-0 min-h-[44px] min-w-[44px]" data-testid={`gen-delete-objective-${i}`}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[9px] text-stone-500 uppercase">Key Takeaways</Label>
                    <Button size="sm" variant="ghost" onClick={() => setGenDraft((d: any) => ({ ...d, keyTakeaways: [...(d.keyTakeaways || []), ""] }))} className="h-7 text-[10px] text-amber-400 hover:text-amber-300" data-testid="gen-add-takeaway">
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {(genDraft.keyTakeaways || []).map((kt: string, i: number) => (
                      <div key={i} className="flex items-center gap-1">
                        <Input
                          value={kt}
                          onChange={e => setGenDraft((d: any) => { const u = [...d.keyTakeaways]; u[i] = e.target.value; return { ...d, keyTakeaways: u }; })}
                          className="h-7 text-xs bg-black/50 border-amber-900/30 flex-1"
                          data-testid={`input-gen-takeaway-${i}`}
                        />
                        <Button size="sm" variant="ghost" onClick={() => setGenDraft((d: any) => ({ ...d, keyTakeaways: d.keyTakeaways.filter((_: any, idx: number) => idx !== i) }))} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 shrink-0 min-h-[44px] min-w-[44px]" data-testid={`gen-delete-takeaway-${i}`}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[9px] text-teal-500 uppercase font-bold">Exercises</Label>
                    <Button size="sm" variant="ghost" onClick={() => setGenDraft((d: any) => ({ ...d, exercises: [...(d.exercises || []), { id: "", title: "", type: "observation", instructions: "", hints: [], successCriteria: [] }] }))} className="h-7 text-[10px] text-teal-400 hover:text-teal-300" data-testid="gen-add-exercise">
                      <Plus className="w-3 h-3 mr-1" /> Add Exercise
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(genDraft.exercises || []).map((ex: any, ei: number) => (
                      <div key={ei} className="rounded border border-stone-800/40 bg-stone-950/30 p-2 space-y-1.5" data-testid={`gen-exercise-item-${ei}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] text-teal-500 uppercase font-bold">Exercise {ei + 1}</span>
                          <Button size="sm" variant="ghost" onClick={() => setGenDraft((d: any) => ({ ...d, exercises: d.exercises.filter((_: any, idx: number) => idx !== ei) }))} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 min-h-[44px] min-w-[44px]" data-testid={`gen-delete-exercise-${ei}`}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          <div>
                            <label className="text-[8px] text-stone-600 uppercase">Title</label>
                            <Input value={ex.title} onChange={e => setGenDraft((d: any) => { const u = [...d.exercises]; u[ei] = { ...u[ei], title: e.target.value }; return { ...d, exercises: u }; })} className="h-7 text-xs bg-black/50 border-amber-900/30" data-testid={`input-gen-exercise-title-${ei}`} />
                          </div>
                          <div>
                            <label className="text-[8px] text-stone-600 uppercase">Type</label>
                            <select
                              value={ex.type}
                              onChange={e => setGenDraft((d: any) => { const u = [...d.exercises]; u[ei] = { ...u[ei], type: e.target.value }; return { ...d, exercises: u }; })}
                              className="w-full h-7 text-xs bg-black/50 border border-amber-900/30 rounded px-1 text-white"
                              data-testid={`select-gen-exercise-type-${ei}`}
                            >
                              {["prompt_craft", "comparison", "crew_build", "eval_run", "observation", "debate", "failure_analysis", "reflection"].map(t => (
                                <option key={t} value={t}>{t.replace("_", " ")}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[8px] text-stone-600 uppercase">Instructions</label>
                          <Textarea value={ex.instructions} onChange={e => setGenDraft((d: any) => { const u = [...d.exercises]; u[ei] = { ...u[ei], instructions: e.target.value }; return { ...d, exercises: u }; })} className="text-xs bg-black/50 border-amber-900/30 min-h-[40px]" data-testid={`input-gen-exercise-instructions-${ei}`} />
                        </div>
                        <div>
                          <label className="text-[8px] text-stone-600 uppercase">Hints (comma-separated)</label>
                          <Input value={(ex.hints || []).join(", ")} onChange={e => setGenDraft((d: any) => { const u = [...d.exercises]; u[ei] = { ...u[ei], hints: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }; return { ...d, exercises: u }; })} className="h-7 text-xs bg-black/50 border-amber-900/30" data-testid={`input-gen-exercise-hints-${ei}`} />
                        </div>
                        <div>
                          <label className="text-[8px] text-stone-600 uppercase">Success Criteria (comma-separated)</label>
                          <Input value={(Array.isArray(ex.successCriteria) ? ex.successCriteria : []).join(", ")} onChange={e => setGenDraft((d: any) => { const u = [...d.exercises]; u[ei] = { ...u[ei], successCriteria: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }; return { ...d, exercises: u }; })} className="h-7 text-xs bg-black/50 border-amber-900/30" data-testid={`input-gen-exercise-criteria-${ei}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Teaching Adaptations</span>
                  <div className="space-y-2 mt-2">
                    {["experiential", "visual", "analytical", "social", "pragmatic"].map(style => (
                      <div key={style}>
                        <Label className="text-[9px] text-stone-500 uppercase">{style}</Label>
                        <Textarea
                          value={genDraft.teachingAdaptations?.[style] || ''}
                          onChange={e => setGenDraft((d: any) => ({ ...d, teachingAdaptations: { ...(d.teachingAdaptations || {}), [style]: e.target.value } }))}
                          className="text-xs bg-stone-950 border-stone-800 min-h-[40px]"
                          data-testid={`input-gen-adaptation-${style}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[9px] text-stone-500 uppercase">Platform Tools (comma-separated)</Label>
                    <Input
                      value={(genDraft.platformTools || []).join(", ")}
                      onChange={e => setGenDraft((d: any) => ({ ...d, platformTools: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))}
                      className="h-8 text-xs bg-stone-950 border-stone-800"
                      data-testid="input-gen-platform-tools"
                    />
                  </div>
                  <div>
                    <Label className="text-[9px] text-stone-500 uppercase">Further Reading (comma-separated)</Label>
                    <Input
                      value={(genDraft.furtherReading || []).join(", ")}
                      onChange={e => setGenDraft((d: any) => ({ ...d, furtherReading: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))}
                      className="h-8 text-xs bg-stone-950 border-stone-800"
                      data-testid="input-gen-further-reading"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-800/30">
                  <Button variant="ghost" onClick={() => setGenDraft(null)} className="text-red-400 hover:text-red-300 min-h-[44px]" data-testid="btn-discard-draft">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Discard Draft
                  </Button>
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      onClick={() => approveDraftMutation.mutate({ trackId: genTargetTrack, mission: genDraft })}
                      disabled={approveDraftMutation.isPending}
                      className="bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]"
                      data-testid="btn-approve-draft"
                    >
                      {approveDraftMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                      Approve & Publish to Track
                    </Button>
                    <span className="text-[9px] text-stone-600">This will add the mission to the live curriculum.</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {tracks.length === 0 && (
        <Card className="bg-amber-950/20 border-amber-900/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-sm text-amber-400 font-medium">No curriculum in database</p>
            <p className="text-xs text-stone-500 mt-1">Click "Seed from Config" to populate from the static curriculum definition.</p>
          </CardContent>
        </Card>
      )}

      {[
        { label: 'AI Mastery', trackList: aiTracks, catColor: 'text-teal-500', borderColor: 'border-teal-900/40' },
        { label: 'Cyber OSINT', trackList: osintTracks, catColor: 'text-cyan-500', borderColor: 'border-cyan-900/40' },
      ].map(section => section.trackList.length > 0 && (
        <div key={section.label} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className={`h-px flex-1 ${section.borderColor}`} style={{ borderTopWidth: 1, borderTopStyle: 'solid' }} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${section.catColor}`}>{section.label}</span>
            <div className={`h-px flex-1 ${section.borderColor}`} style={{ borderTopWidth: 1, borderTopStyle: 'solid' }} />
          </div>

          <div className="space-y-2">
            {section.trackList.map(track => {
              const isExpanded = expandedTrack === track.trackId;
              const isEditing = editingTrack === track.trackId;

              return (
                <Card key={track.trackId} className={`bg-[#0a0500] transition-colors ${isExpanded ? 'border-amber-800/40' : 'border-stone-800/40'} ${!track.isActive ? 'opacity-50' : ''}`} data-testid={`admin-track-${track.trackId}`}>
                  <CardHeader className="p-3 pb-0 cursor-pointer" onClick={() => { if (!isEditing) setExpandedTrack(isExpanded ? null : track.trackId); }}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{track.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-sm text-white truncate">{track.name}</CardTitle>
                          <Badge variant="outline" className="text-[8px] border-stone-700 text-stone-500">{track.trackId}</Badge>
                          {!track.isActive && <Badge className="text-[8px] bg-red-900/30 text-red-400 border-0">Disabled</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-stone-600">
                          <span>{track.missions.length} missions</span>
                          <span>{track.missions.reduce((s: number, m: any) => s + (m.exercises?.length || 0), 0)} exercises</span>
                          <span>{track.missions.reduce((s: number, m: any) => s + (m.objectives?.length || 0), 0)} objectives</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-10 w-10 p-0 min-h-[44px] min-w-[44px] text-stone-600 hover:text-amber-400"
                          onClick={(e) => { e.stopPropagation(); isEditing ? setEditingTrack(null) : startEditTrack(track); }}
                          data-testid={`edit-track-${track.trackId}`}
                        >
                          {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                        </Button>
                        <Switch
                          checked={track.isActive}
                          onCheckedChange={() => toggleTrackActive(track.trackId, track.isActive)}
                          className="scale-75 data-[state=checked]:bg-amber-600"
                        />
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-stone-600" /> : <ChevronRight className="w-4 h-4 text-stone-600" />}
                      </div>
                    </div>
                  </CardHeader>

                  {isEditing && (
                    <CardContent className="p-3 pt-2 space-y-2 border-t border-amber-900/20 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-stone-500 uppercase">Name</label>
                          <Input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-track-name" />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[9px] text-stone-500 uppercase">Icon</label>
                            <Input value={editForm.icon || ''} onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-track-icon" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[9px] text-stone-500 uppercase">Order</label>
                            <Input type="number" value={editForm.order ?? 0} onChange={e => setEditForm(f => ({ ...f, order: Number(e.target.value) }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-track-order" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-stone-500 uppercase">Description</label>
                        <Textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="text-xs bg-stone-950 border-stone-800 min-h-[60px]" data-testid="input-track-description" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingTrack(null)} className="text-stone-500 h-7 text-xs min-h-[44px]" data-testid="cancel-track-edit">Cancel</Button>
                        <Button size="sm" onClick={() => saveTrackEdit(track.trackId)} disabled={updateTrackMutation.isPending} className="bg-amber-700 hover:bg-amber-600 text-black h-7 text-xs min-h-[44px]" data-testid={`save-track-${track.trackId}`}>
                          <Save className="w-3 h-3 mr-1" /> Save
                        </Button>
                      </div>
                    </CardContent>
                  )}

                  {isExpanded && !isEditing && (
                    <CardContent className="p-3 pt-1 space-y-2">
                      <p className="text-[10px] text-stone-500 leading-relaxed">{track.description}</p>

                      {track.missions.map((mission: any, mi: number) => {
                        const mKey = `${track.trackId}-${mi}`;
                        const isMissionExpanded = expandedMission === mKey;

                        return (
                          <div key={mKey} className={`rounded border transition-colors ${isMissionExpanded ? 'border-amber-800/30 bg-stone-950/50' : 'border-stone-800/40 bg-stone-950/30'}`} data-testid={`admin-mission-${mission.id}`}>
                            <div
                              className="flex items-center gap-2 p-2 cursor-pointer min-h-[44px]"
                              onClick={() => setExpandedMission(isMissionExpanded ? null : mKey)}
                            >
                              <span className="text-sm">{mission.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[11px] font-medium text-white truncate">{mission.name}</span>
                                  <Badge className={`text-[7px] border ${difficultyColor(mission.difficulty)}`}>{mission.difficulty}</Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[9px] text-stone-600">
                                  <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {mission.estimatedTime}</span>
                                  <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-amber-700" /> {mission.xpReward} XP</span>
                                  <span>{(mission.exercises || []).length} exercises</span>
                                  <span>{(mission.objectives || []).length} objectives</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 min-h-[44px] min-w-[44px] text-stone-600 hover:text-amber-400 shrink-0"
                                onClick={(e) => { e.stopPropagation(); openMissionDialog(track.trackId, mission, mi); }}
                                data-testid={`edit-mission-${mission.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {isMissionExpanded ? <ChevronDown className="w-3.5 h-3.5 text-stone-600 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-600 shrink-0" />}
                            </div>

                            {isMissionExpanded && (
                              <div className="px-2 pb-2 space-y-2 border-t border-stone-800/30 mt-1 pt-2">
                                <p className="text-[10px] text-stone-500">{mission.description}</p>

                                {mission.objectives?.length > 0 && (
                                  <div>
                                    <span className="text-[9px] text-amber-600 uppercase font-bold tracking-wider">Objectives</span>
                                    <ul className="mt-1 space-y-0.5">
                                      {mission.objectives.map((obj: string, i: number) => (
                                        <li key={i} className="text-[10px] text-stone-400 flex items-start gap-1.5">
                                          <Target className="w-2.5 h-2.5 text-amber-700 mt-0.5 shrink-0" />
                                          {obj}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {mission.exercises?.length > 0 && (
                                  <div>
                                    <span className="text-[9px] text-teal-600 uppercase font-bold tracking-wider">Exercises ({mission.exercises.length})</span>
                                    <div className="mt-1 space-y-1">
                                      {mission.exercises.map((ex: any, ei: number) => (
                                        <div key={ei} className="flex items-start gap-1.5 text-[10px] text-stone-400 bg-stone-900/30 rounded p-1.5">
                                          <Zap className="w-2.5 h-2.5 text-teal-600 mt-0.5 shrink-0" />
                                          <div>
                                            <span className="font-medium text-stone-300">{ex.title}</span>
                                            <Badge className="text-[7px] ml-1.5 bg-stone-800 text-stone-500 border-0">{ex.type}</Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {mission.keyTakeaways?.length > 0 && (
                                  <div>
                                    <span className="text-[9px] text-emerald-600 uppercase font-bold tracking-wider">Key Takeaways</span>
                                    <ul className="mt-1 space-y-0.5">
                                      {mission.keyTakeaways.map((kt: string, i: number) => (
                                        <li key={i} className="text-[10px] text-stone-400 flex items-start gap-1.5">
                                          <Check className="w-2.5 h-2.5 text-emerald-700 mt-0.5 shrink-0" />
                                          {kt}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {mission.platformTools?.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className="text-[9px] text-stone-600 uppercase">Tools:</span>
                                    {mission.platformTools.map((tool: string, i: number) => (
                                      <Badge key={i} variant="outline" className="text-[8px] border-stone-700 text-stone-500">{tool}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {missionDialogOpen && (
        <Dialog open={missionDialogOpen} onOpenChange={(open) => { if (!open) { setMissionDialogOpen(false); setMissionDialogTrackId(null); setMissionDialogIndex(null); } }}>
          <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto" data-testid="dialog-mission-edit">
            <DialogHeader>
              <DialogTitle className="text-amber-600 font-orbitron">Edit Mission</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-stone-500 uppercase">Name</label>
                  <Input value={missionEditForm.name || ''} onChange={e => setMissionEditForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-mission-name" />
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div>
                    <label className="text-[9px] text-stone-500 uppercase">Difficulty</label>
                    <select value={missionEditForm.difficulty || 'beginner'} onChange={e => setMissionEditForm(f => ({ ...f, difficulty: e.target.value }))} className="w-full h-8 text-xs bg-stone-950 border border-stone-800 rounded px-1 text-white" data-testid="select-mission-difficulty">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-stone-500 uppercase">Time</label>
                    <Input value={missionEditForm.estimatedTime || ''} onChange={e => setMissionEditForm(f => ({ ...f, estimatedTime: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-mission-time" />
                  </div>
                  <div>
                    <label className="text-[9px] text-stone-500 uppercase">XP</label>
                    <Input type="number" value={missionEditForm.xpReward || 0} onChange={e => setMissionEditForm(f => ({ ...f, xpReward: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" data-testid="input-mission-xp" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[9px] text-stone-500 uppercase">Description</label>
                <Textarea value={missionEditForm.description || ''} onChange={e => setMissionEditForm(f => ({ ...f, description: e.target.value }))} className="text-xs bg-stone-950 border-stone-800 min-h-[50px]" data-testid="input-mission-description" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] text-stone-500 uppercase">Objectives</label>
                  <Button size="sm" variant="ghost" onClick={addObjective} className="h-7 text-[10px] text-amber-400 hover:text-amber-300" data-testid="add-objective">
                    <Plus className="w-3 h-3 mr-1" /> Add Objective
                  </Button>
                </div>
                <div className="space-y-1">
                  {(missionEditForm.objectives || []).map((obj: string, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      <Input
                        value={obj}
                        onChange={e => updateObjective(i, e.target.value)}
                        className="h-7 text-xs bg-black/50 border-amber-900/30 flex-1"
                        data-testid={`input-objective-${i}`}
                      />
                      <Button size="sm" variant="ghost" onClick={() => removeObjective(i)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 shrink-0 min-h-[44px] min-w-[44px]" data-testid={`delete-objective-${i}`}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {(missionEditForm.objectives || []).length === 0 && (
                    <p className="text-[10px] text-stone-600 italic">No objectives yet</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] text-stone-500 uppercase">Key Takeaways</label>
                  <Button size="sm" variant="ghost" onClick={addKeyTakeaway} className="h-7 text-[10px] text-amber-400 hover:text-amber-300" data-testid="add-takeaway">
                    <Plus className="w-3 h-3 mr-1" /> Add Takeaway
                  </Button>
                </div>
                <div className="space-y-1">
                  {(missionEditForm.keyTakeaways || []).map((kt: string, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      <Input
                        value={kt}
                        onChange={e => updateKeyTakeaway(i, e.target.value)}
                        className="h-7 text-xs bg-black/50 border-amber-900/30 flex-1"
                        data-testid={`input-takeaway-${i}`}
                      />
                      <Button size="sm" variant="ghost" onClick={() => removeKeyTakeaway(i)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 shrink-0 min-h-[44px] min-w-[44px]" data-testid={`delete-takeaway-${i}`}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {(missionEditForm.keyTakeaways || []).length === 0 && (
                    <p className="text-[10px] text-stone-600 italic">No key takeaways yet</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] text-teal-500 uppercase font-bold">Exercises</label>
                  <Button size="sm" variant="ghost" onClick={addExercise} className="h-7 text-[10px] text-teal-400 hover:text-teal-300" data-testid="add-exercise">
                    <Plus className="w-3 h-3 mr-1" /> Add Exercise
                  </Button>
                </div>
                <div className="space-y-2">
                  {(missionEditForm.exercises || []).map((ex: any, ei: number) => (
                    <div key={ei} className="rounded border border-stone-800/40 bg-stone-950/30 p-2 space-y-1.5" data-testid={`exercise-item-${ei}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] text-teal-500 uppercase font-bold">Exercise {ei + 1}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeExercise(ei)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 min-h-[44px] min-w-[44px]" data-testid={`delete-exercise-${ei}`}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        <div>
                          <label className="text-[8px] text-stone-600 uppercase">Title</label>
                          <Input value={ex.title} onChange={e => updateExercise(ei, 'title', e.target.value)} className="h-7 text-xs bg-black/50 border-amber-900/30" data-testid={`input-exercise-title-${ei}`} />
                        </div>
                        <div>
                          <label className="text-[8px] text-stone-600 uppercase">Type</label>
                          <Input value={ex.type} onChange={e => updateExercise(ei, 'type', e.target.value)} className="h-7 text-xs bg-black/50 border-amber-900/30" data-testid={`input-exercise-type-${ei}`} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] text-stone-600 uppercase">Instructions</label>
                        <Textarea value={ex.instructions} onChange={e => updateExercise(ei, 'instructions', e.target.value)} className="text-xs bg-black/50 border-amber-900/30 min-h-[40px]" data-testid={`input-exercise-instructions-${ei}`} />
                      </div>
                      <div>
                        <label className="text-[8px] text-stone-600 uppercase">Hints (comma-separated)</label>
                        <Input value={(ex.hints || []).join(", ")} onChange={e => updateExercise(ei, 'hints', e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} className="h-7 text-xs bg-black/50 border-amber-900/30" data-testid={`input-exercise-hints-${ei}`} />
                      </div>
                      <div>
                        <label className="text-[8px] text-stone-600 uppercase">Success Criteria</label>
                        <Input value={ex.successCriteria} onChange={e => updateExercise(ei, 'successCriteria', e.target.value)} className="h-7 text-xs bg-black/50 border-amber-900/30" data-testid={`input-exercise-criteria-${ei}`} />
                      </div>
                    </div>
                  ))}
                  {(missionEditForm.exercises || []).length === 0 && (
                    <p className="text-[10px] text-stone-600 italic">No exercises yet</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800/30">
                <Button size="sm" variant="ghost" onClick={() => { setMissionDialogOpen(false); setMissionDialogTrackId(null); setMissionDialogIndex(null); }} className="text-stone-500 text-xs min-h-[44px]" data-testid="cancel-mission-edit">Cancel</Button>
                <Button size="sm" onClick={saveMissionEdit} disabled={updateTrackMutation.isPending} className="bg-amber-700 hover:bg-amber-600 text-black text-xs min-h-[44px]" data-testid="save-mission-dialog">
                  <Save className="w-3 h-3 mr-1" /> Save Mission
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
