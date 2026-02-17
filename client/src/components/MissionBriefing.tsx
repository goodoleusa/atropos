import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useLearningStore } from '@/stores/useLearningStore';
import { AI_CURRICULUM_TRACKS, type AIMission, type AIMissionExercise, type AICurriculumTrack } from '@/config/aiCurriculum';
import {
  Target, BookOpen, ChevronRight, ChevronDown, Lightbulb, Sparkles, Star,
  CheckCircle2, Circle, ArrowRight, Flame, GraduationCap, Clock, X, Brain,
  Eye, Users, Wrench, FlaskConical, Layers,
} from 'lucide-react';
import type { LearningStyle } from '@/config/learningConfig';

const STYLE_META: Record<LearningStyle, { label: string; icon: any; color: string; short: string }> = {
  experiential: { label: 'Experiential', icon: FlaskConical, color: 'text-emerald-400', short: 'Hands-on first, theory later' },
  visual: { label: 'Visual', icon: Eye, color: 'text-sky-400', short: 'Diagrams, maps, visual structure' },
  analytical: { label: 'Analytical', icon: Brain, color: 'text-purple-400', short: 'Deep theory, citations, why' },
  social: { label: 'Social', icon: Users, color: 'text-amber-400', short: 'Community, discussion, collaboration' },
  pragmatic: { label: 'Pragmatic', icon: Wrench, color: 'text-rose-400', short: 'Cheat sheets, rules, quick wins' },
};

const EXERCISE_TYPE_META: Record<string, { label: string; color: string }> = {
  prompt_craft: { label: 'Prompt Craft', color: 'bg-amber-900/30 text-amber-400 border-amber-800/40' },
  comparison: { label: 'Compare', color: 'bg-sky-900/30 text-sky-400 border-sky-800/40' },
  crew_build: { label: 'Crew Build', color: 'bg-purple-900/30 text-purple-400 border-purple-800/40' },
  eval_run: { label: 'Eval Run', color: 'bg-teal-900/30 text-teal-400 border-teal-800/40' },
  observation: { label: 'Observe', color: 'bg-stone-800/50 text-stone-300 border-stone-700' },
  debate: { label: 'Debate', color: 'bg-orange-900/30 text-orange-400 border-orange-800/40' },
  failure_analysis: { label: 'Failure Lab', color: 'bg-red-900/30 text-red-400 border-red-800/40' },
  reflection: { label: 'Reflect', color: 'bg-indigo-900/30 text-indigo-400 border-indigo-800/40' },
};

interface MissionBriefingProps {
  onStartMission: (mission: AIMission, track: AICurriculumTrack) => void;
  onSuggestionChip: (text: string) => void;
  onClose: () => void;
  activeMissionId?: string | null;
}

export function MissionBriefing({ onStartMission, onSuggestionChip, onClose, activeMissionId }: MissionBriefingProps) {
  const [expandedTrack, setExpandedTrack] = useState<string | null>('scientific_prompting');
  const [selectedMission, setSelectedMission] = useState<AIMission | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem('atropos_completed_exercises') || '[]'))
  );

  const style = useLearningStore(s => s.style);
  const setStyle = useLearningStore(s => s.setStyle);
  const styleMeta = STYLE_META[style];
  const StyleIcon = styleMeta.icon;

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      localStorage.setItem('atropos_completed_exercises', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const getMissionProgress = (mission: AIMission) => {
    if (mission.exercises.length === 0) return 0;
    const done = mission.exercises.filter(e => completedExercises.has(e.id)).length;
    return Math.round((done / mission.exercises.length) * 100);
  };

  if (selectedMission) {
    const track = AI_CURRICULUM_TRACKS.find(t => t.id === selectedMission.trackId);
    const progress = getMissionProgress(selectedMission);
    const adaptation = selectedMission.teachingAdaptations[style];
    const isActive = activeMissionId === selectedMission.id;

    return (
      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedMission(null)} className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-400 transition-colors min-h-[36px] md:min-h-0 px-1" data-testid="back-to-tracks">
            <ChevronRight className="w-3.5 h-3.5 md:w-3 md:h-3 rotate-180" /> Back
          </button>
          <button onClick={onClose} className="p-2 md:p-1.5 rounded text-stone-600 hover:text-white hover:bg-stone-800/50 transition-colors" data-testid="close-mission-detail">
            <X className="w-4 h-4 md:w-3.5 md:h-3.5" />
          </button>
        </div>

        <div className="bg-stone-900/50 rounded-lg border border-amber-900/30 p-2.5 md:p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg md:text-xl">{selectedMission.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs md:text-sm font-bold text-amber-400">{selectedMission.name}</h3>
              <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2">{selectedMission.description}</p>
              <div className="flex items-center gap-2 md:gap-3 mt-1.5 text-[10px] text-stone-600 flex-wrap">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedMission.estimatedTime}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-600" /> {selectedMission.xpReward} XP</span>
                <Badge variant="outline" className="text-[9px] border-stone-700 text-stone-500">{selectedMission.difficulty}</Badge>
              </div>
              {progress > 0 && (
                <div className="mt-2">
                  <Progress value={progress} className="h-1 bg-stone-800" />
                  <span className="text-[9px] text-stone-600">{progress}% complete</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`rounded-lg border p-2 md:p-2.5 ${styleMeta.color.replace('text-', 'border-').replace('400', '800/40')} bg-stone-900/30`}>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StyleIcon className={`w-3.5 h-3.5 ${styleMeta.color}`} />
            <span className={`text-[9px] md:text-[10px] font-bold uppercase ${styleMeta.color}`}>
              {styleMeta.label} Mode
            </span>
            <div className="ml-auto flex gap-0.5">
              {(Object.keys(STYLE_META) as LearningStyle[]).map(s => {
                const m = STYLE_META[s];
                const Icon = m.icon;
                return (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`p-1 md:p-0.5 rounded transition-colors ${style === s ? `${m.color} bg-stone-800` : 'text-stone-700 hover:text-stone-400'}`}
                    title={`Switch to ${m.label}`}
                  >
                    <Icon className="w-3 h-3" />
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-stone-400 leading-relaxed">{adaptation}</p>
        </div>

        <div>
          <h4 className="text-[10px] text-stone-500 uppercase font-bold mb-1 md:mb-1.5 flex items-center gap-1">
            <Target className="w-3 h-3" /> Objectives
          </h4>
          <div className="space-y-1">
            {selectedMission.objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] text-stone-400">
                <Circle className="w-3 h-3 text-amber-700 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] text-stone-500 uppercase font-bold mb-1 md:mb-1.5 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Exercises
          </h4>
          <div className="space-y-1.5 md:space-y-2">
            {selectedMission.exercises.map((exercise) => {
              const isDone = completedExercises.has(exercise.id);
              const typeMeta = EXERCISE_TYPE_META[exercise.type] || { label: exercise.type, color: 'bg-stone-800 text-stone-400 border-stone-700' };
              return (
                <div key={exercise.id} className={`rounded-lg border p-2 md:p-2.5 transition-colors ${isDone ? 'border-emerald-800/40 bg-emerald-900/10' : 'border-stone-800 bg-stone-900/30'}`} data-testid={`exercise-${exercise.id}`}>
                  <div className="flex items-start gap-2">
                    <button onClick={() => toggleExercise(exercise.id)} className="mt-0.5 shrink-0 p-0.5 min-w-[24px] min-h-[24px] flex items-center justify-center">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-600 hover:text-amber-500 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        <span className={`text-[11px] md:text-xs font-medium ${isDone ? 'text-stone-500 line-through' : 'text-white'}`}>{exercise.title}</span>
                        <Badge className={`text-[7px] md:text-[8px] border px-1 py-0 ${typeMeta.color}`}>{typeMeta.label}</Badge>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-0.5 md:mt-1 leading-relaxed">{exercise.instructions}</p>

                      {exercise.hints.length > 0 && (
                        <div className="mt-1 md:mt-1.5 space-y-0.5">
                          {exercise.hints.map((hint, i) => (
                            <div key={i} className="flex items-start gap-1 text-[9px] text-stone-600">
                              <Lightbulb className="w-2.5 h-2.5 text-amber-700 shrink-0 mt-0.5" />
                              <span>{hint}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {exercise.suggestedPrompts && exercise.suggestedPrompts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 md:mt-2">
                          {exercise.suggestedPrompts.map((prompt, i) => (
                            <button
                              key={i}
                              onClick={() => onSuggestionChip(prompt)}
                              className="text-[9px] px-2 py-1 md:py-0.5 rounded-full bg-amber-900/20 border border-amber-800/30 text-amber-400 hover:bg-amber-900/40 active:bg-amber-900/60 transition-colors truncate max-w-[85vw] md:max-w-[200px]"
                              title={prompt}
                              data-testid={`suggestion-chip-${i}`}
                            >
                              <ArrowRight className="w-2.5 h-2.5 inline mr-0.5" /> {prompt.slice(0, 50)}...
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedMission.keyTakeaways.length > 0 && (
          <div className="bg-stone-900/30 rounded-lg border border-stone-800 p-2 md:p-2.5">
            <h4 className="text-[10px] text-stone-500 uppercase font-bold mb-1 flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Key Takeaways
            </h4>
            <div className="space-y-1">
              {selectedMission.keyTakeaways.map((t, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] text-stone-400">
                  <Sparkles className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isActive && (
          <Button
            className="w-full bg-gradient-to-r from-amber-700 to-teal-700 hover:from-amber-600 hover:to-teal-600 active:from-amber-500 active:to-teal-500 text-black font-orbitron text-xs h-10 md:h-8"
            onClick={() => track && onStartMission(selectedMission, track)}
            data-testid="start-mission-btn"
          >
            <Flame className="w-3.5 h-3.5 mr-1" />
            Start Mission
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] md:text-xs font-orbitron text-amber-400 flex items-center gap-1.5 shrink-0">
          <Layers className="w-3.5 h-3.5" /> AI Mastery
        </h3>
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
          <div className="flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 rounded bg-stone-900/50 border border-stone-800 shrink-0">
            <StyleIcon className={`w-3 h-3 ${styleMeta.color}`} />
            <span className={`text-[9px] ${styleMeta.color} hidden sm:inline`}>{styleMeta.label}</span>
            <div className="flex gap-0.5 ml-0.5 md:ml-1">
              {(Object.keys(STYLE_META) as LearningStyle[]).map(s => {
                const m = STYLE_META[s];
                const Icon = m.icon;
                return (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`p-1 md:p-0.5 rounded transition-colors ${style === s ? `${m.color} bg-stone-800` : 'text-stone-700 hover:text-stone-400'}`}
                    title={`${m.label}: ${m.short}`}
                  >
                    <Icon className="w-3 h-3 md:w-2.5 md:h-2.5" />
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 md:p-1 rounded text-stone-600 hover:text-white hover:bg-stone-800/50 transition-colors shrink-0" data-testid="close-tracks">
            <X className="w-4 h-4 md:w-3.5 md:h-3.5" />
          </button>
        </div>
      </div>

      <ScrollArea className="max-h-[35vh] md:max-h-[50vh]">
        <div className="space-y-1.5 md:space-y-2 pr-1 md:pr-2">
          {AI_CURRICULUM_TRACKS.map(track => {
            const isExpanded = expandedTrack === track.id;
            const totalExercises = track.missions.reduce((s, m) => s + m.exercises.length, 0);
            const completedCount = track.missions.reduce((s, m) => s + m.exercises.filter(e => completedExercises.has(e.id)).length, 0);
            const trackProgress = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
            const isPrereqMet = track.prerequisiteTrackIds.length === 0 || track.prerequisiteTrackIds.every(pid => {
              const pTrack = AI_CURRICULUM_TRACKS.find(t => t.id === pid);
              if (!pTrack) return true;
              const pTotal = pTrack.missions.reduce((s, m) => s + m.exercises.length, 0);
              const pDone = pTrack.missions.reduce((s, m) => s + m.exercises.filter(e => completedExercises.has(e.id)).length, 0);
              return pTotal > 0 && pDone / pTotal >= 0.5;
            });

            return (
              <div key={track.id} className={`rounded-lg border transition-colors ${isExpanded ? 'border-amber-800/40 bg-stone-900/40' : 'border-stone-800 bg-stone-900/20'} ${!isPrereqMet ? 'opacity-60' : ''}`} data-testid={`track-${track.id}`}>
                <button
                  onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
                  className="w-full text-left p-2 md:p-2.5 flex items-center gap-2 min-h-[44px]"
                >
                  <span className="text-base md:text-lg">{track.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                      <span className="text-[11px] md:text-xs font-medium text-white truncate">{track.name}</span>
                      {track.order === 0 && (
                        <Badge className="text-[7px] md:text-[8px] bg-emerald-900/30 text-emerald-400 border-0">Foundation</Badge>
                      )}
                      {!isPrereqMet && (
                        <Badge className="text-[7px] md:text-[8px] bg-stone-800 text-stone-500 border-0">Locked</Badge>
                      )}
                    </div>
                    {trackProgress > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={trackProgress} className="h-0.5 flex-1 bg-stone-800" />
                        <span className="text-[9px] text-stone-600">{trackProgress}%</span>
                      </div>
                    )}
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 md:w-3.5 md:h-3.5 text-stone-600 shrink-0" /> : <ChevronRight className="w-4 h-4 md:w-3.5 md:h-3.5 text-stone-600 shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-2 md:px-2.5 pb-2 md:pb-2.5 space-y-1.5">
                    <p className="text-[10px] text-stone-500 leading-relaxed">{track.description}</p>

                    {track.missions.map(mission => {
                      const mProgress = getMissionProgress(mission);
                      const isActiveMission = activeMissionId === mission.id;
                      return (
                        <button
                          key={mission.id}
                          onClick={() => setSelectedMission(mission)}
                          className={`w-full text-left p-2 md:p-2 rounded border transition-all min-h-[44px] ${
                            isActiveMission
                              ? 'border-teal-700 bg-teal-900/20'
                              : 'border-stone-800 hover:border-amber-800/40 active:border-amber-700/50 bg-stone-950/50 hover:bg-stone-900/40'
                          }`}
                          data-testid={`mission-${mission.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{mission.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                                <span className="text-[11px] font-medium text-white truncate">{mission.name}</span>
                                {isActiveMission && <Badge className="text-[7px] md:text-[8px] bg-teal-900/30 text-teal-400 border-0">Active</Badge>}
                              </div>
                              <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 text-[9px] text-stone-600 flex-wrap">
                                <span>{mission.difficulty}</span>
                                <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {mission.estimatedTime}</span>
                                <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-amber-700" /> {mission.xpReward}</span>
                                {mProgress > 0 && <span className="text-emerald-500">{mProgress}%</span>}
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 md:w-3 md:h-3 text-stone-700 shrink-0" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
