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
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, ChevronDown, ChevronRight, Save, RefreshCw, Target,
  Layers, Brain, Globe, Edit, X, Check, Trash2, Plus, Zap, Clock,
  Star, GraduationCap, AlertTriangle, BarChart3
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
  const [editingMission, setEditingMission] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [missionEditForm, setMissionEditForm] = useState<Record<string, any>>({});

  const { data: stats, isLoading: statsLoading } = useQuery<OverviewStats>({
    queryKey: ["/api/curriculum/stats/overview"],
    queryFn: () => fetch("/api/curriculum/stats/overview").then(r => r.json()),
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery<CurriculumTrackFull[]>({
    queryKey: ["/api/curriculum"],
    queryFn: () => fetch("/api/curriculum").then(r => r.json()),
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

  const startEditMission = (trackId: string, mission: any, missionIndex: number) => {
    setEditingMission(`${trackId}-${missionIndex}`);
    setMissionEditForm({
      name: mission.name,
      description: mission.description,
      difficulty: mission.difficulty,
      estimatedTime: mission.estimatedTime,
      xpReward: mission.xpReward,
      objectives: (mission.objectives || []).join("\n"),
      keyTakeaways: (mission.keyTakeaways || []).join("\n"),
    });
  };

  const saveMissionEdit = (trackId: string, missionIndex: number) => {
    const track = tracks.find(t => t.trackId === trackId);
    if (!track) return;
    const updatedMissions = [...track.missions];
    updatedMissions[missionIndex] = {
      ...updatedMissions[missionIndex],
      name: missionEditForm.name,
      description: missionEditForm.description,
      difficulty: missionEditForm.difficulty,
      estimatedTime: missionEditForm.estimatedTime,
      xpReward: Number(missionEditForm.xpReward),
      objectives: missionEditForm.objectives.split("\n").filter((s: string) => s.trim()),
      keyTakeaways: missionEditForm.keyTakeaways.split("\n").filter((s: string) => s.trim()),
    };
    updateTrackMutation.mutate({ trackId, data: { missions: updatedMissions } });
    setEditingMission(null);
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
                          className="h-7 w-7 p-0 text-stone-600 hover:text-amber-400"
                          onClick={(e) => { e.stopPropagation(); isEditing ? setEditingTrack(null) : startEditTrack(track); }}
                          data-testid={`edit-track-${track.trackId}`}
                        >
                          {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
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
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-stone-500 uppercase">Name</label>
                          <Input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[9px] text-stone-500 uppercase">Icon</label>
                            <Input value={editForm.icon || ''} onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))} className="h-8 text-xs bg-stone-950 border-stone-800" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[9px] text-stone-500 uppercase">Order</label>
                            <Input type="number" value={editForm.order ?? 0} onChange={e => setEditForm(f => ({ ...f, order: Number(e.target.value) }))} className="h-8 text-xs bg-stone-950 border-stone-800" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-stone-500 uppercase">Description</label>
                        <Textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="text-xs bg-stone-950 border-stone-800 min-h-[60px]" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingTrack(null)} className="text-stone-500 h-7 text-xs">Cancel</Button>
                        <Button size="sm" onClick={() => saveTrackEdit(track.trackId)} disabled={updateTrackMutation.isPending} className="bg-amber-700 hover:bg-amber-600 text-black h-7 text-xs" data-testid={`save-track-${track.trackId}`}>
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
                        const isMissionEditing = editingMission === mKey;

                        return (
                          <div key={mKey} className={`rounded border transition-colors ${isMissionExpanded ? 'border-amber-800/30 bg-stone-950/50' : 'border-stone-800/40 bg-stone-950/30'}`} data-testid={`admin-mission-${mission.id}`}>
                            <div
                              className="flex items-center gap-2 p-2 cursor-pointer min-h-[40px]"
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
                                className="h-6 w-6 p-0 text-stone-600 hover:text-amber-400 shrink-0"
                                onClick={(e) => { e.stopPropagation(); isMissionEditing ? setEditingMission(null) : startEditMission(track.trackId, mission, mi); }}
                              >
                                {isMissionEditing ? <X className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                              </Button>
                              {isMissionExpanded ? <ChevronDown className="w-3.5 h-3.5 text-stone-600 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-600 shrink-0" />}
                            </div>

                            {isMissionEditing && (
                              <div className="px-2 pb-2 space-y-2 border-t border-amber-900/20 mt-1 pt-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[9px] text-stone-500 uppercase">Name</label>
                                    <Input value={missionEditForm.name || ''} onChange={e => setMissionEditForm(f => ({ ...f, name: e.target.value }))} className="h-7 text-xs bg-stone-950 border-stone-800" />
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <div>
                                      <label className="text-[9px] text-stone-500 uppercase">Difficulty</label>
                                      <select value={missionEditForm.difficulty || 'beginner'} onChange={e => setMissionEditForm(f => ({ ...f, difficulty: e.target.value }))} className="w-full h-7 text-xs bg-stone-950 border border-stone-800 rounded px-1 text-white">
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="expert">Expert</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-stone-500 uppercase">Time</label>
                                      <Input value={missionEditForm.estimatedTime || ''} onChange={e => setMissionEditForm(f => ({ ...f, estimatedTime: e.target.value }))} className="h-7 text-xs bg-stone-950 border-stone-800" />
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-stone-500 uppercase">XP</label>
                                      <Input type="number" value={missionEditForm.xpReward || 0} onChange={e => setMissionEditForm(f => ({ ...f, xpReward: e.target.value }))} className="h-7 text-xs bg-stone-950 border-stone-800" />
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[9px] text-stone-500 uppercase">Description</label>
                                  <Textarea value={missionEditForm.description || ''} onChange={e => setMissionEditForm(f => ({ ...f, description: e.target.value }))} className="text-xs bg-stone-950 border-stone-800 min-h-[50px]" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[9px] text-stone-500 uppercase">Objectives (one per line)</label>
                                    <Textarea value={missionEditForm.objectives || ''} onChange={e => setMissionEditForm(f => ({ ...f, objectives: e.target.value }))} className="text-xs bg-stone-950 border-stone-800 min-h-[80px] font-mono" />
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-stone-500 uppercase">Key Takeaways (one per line)</label>
                                    <Textarea value={missionEditForm.keyTakeaways || ''} onChange={e => setMissionEditForm(f => ({ ...f, keyTakeaways: e.target.value }))} className="text-xs bg-stone-950 border-stone-800 min-h-[80px] font-mono" />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => setEditingMission(null)} className="text-stone-500 h-6 text-[10px]">Cancel</Button>
                                  <Button size="sm" onClick={() => saveMissionEdit(track.trackId, mi)} disabled={updateTrackMutation.isPending} className="bg-amber-700 hover:bg-amber-600 text-black h-6 text-[10px]" data-testid={`save-mission-${mission.id}`}>
                                    <Save className="w-3 h-3 mr-1" /> Save Mission
                                  </Button>
                                </div>
                              </div>
                            )}

                            {isMissionExpanded && !isMissionEditing && (
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
    </div>
  );
}
