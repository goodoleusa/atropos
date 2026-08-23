import { useState } from 'react';
import { useGame } from '@/hooks/useGameSession';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useLearningStore } from '@/stores/useLearningStore';
import { 
  LEARNING_STYLES, 
  LEARNING_GOALS, 
  SKILL_LEVELS,
  CATEGORY_COLORS,
  type LearningStyle,
  type LearningGoal,
  type LearningProfile
} from '@/config/learningConfig';
import { BookOpen, Target, ChevronDown, ChevronUp, Brain, Eye, Users, Wrench, FlaskConical } from 'lucide-react';

const STYLE_ICONS: Record<LearningStyle, typeof Brain> = {
  experiential: FlaskConical,
  visual: Eye,
  analytical: Brain,
  social: Users,
  pragmatic: Wrench,
};

const STYLE_COLORS: Record<LearningStyle, string> = {
  experiential: 'border-emerald-600 bg-emerald-950/30 text-emerald-300',
  visual: 'border-sky-600 bg-sky-950/30 text-sky-300',
  analytical: 'border-purple-600 bg-purple-950/30 text-purple-300',
  social: 'border-amber-600 bg-amber-950/30 text-amber-300',
  pragmatic: 'border-rose-600 bg-rose-950/30 text-rose-300',
};

interface LearningSettingsProps {
  onProfileChange?: (profile: LearningProfile) => void;
  compact?: boolean;
}

export function LearningSettings({ onProfileChange, compact = false }: LearningSettingsProps) {
  const store = useLearningStore();
  const [expanded, setExpanded] = useState(!compact);

  const handleStyleChange = (s: LearningStyle) => {
    store.setStyle(s);
    onProfileChange?.({ style: s, goals: store.goals, interests: store.interests, skillLevel: store.skillLevel, preferredPace: store.preferredPace });
  };

  const handleSkillChange = (level: LearningProfile['skillLevel']) => {
    store.setSkillLevel(level);
    onProfileChange?.({ style: store.style, goals: store.goals, interests: store.interests, skillLevel: level, preferredPace: store.preferredPace });
  };

  const handleGoalToggle = (goalId: LearningGoal) => {
    store.toggleGoal(goalId);
    onProfileChange?.({ style: store.style, goals: store.goals.includes(goalId) ? store.goals.filter(g => g !== goalId) : [...store.goals, goalId], interests: store.interests, skillLevel: store.skillLevel, preferredPace: store.preferredPace });
  };

  if (compact && !expanded) {
    const StyleIcon = STYLE_ICONS[store.style];
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between p-2 text-xs bg-card/50 rounded border border-border hover:border-teal-800 transition-colors min-h-[44px]"
        data-testid="expand-learning-settings"
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="w-3 h-3 text-teal-500" />
          Learning Profile
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-teal-800 text-teal-400 flex items-center gap-1">
            <StyleIcon className="w-2.5 h-2.5" />
            {store.style}
          </Badge>
          <Badge variant="outline" className="text-[9px] border-amber-800 text-amber-400">
            {store.goals.length} goals
          </Badge>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4 bg-card/50 rounded-lg border border-border p-2.5 md:p-3">
      {compact && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-teal-400 min-h-[36px]"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-3 h-3 text-teal-500" />
            Learning Profile Settings
          </span>
          <ChevronUp className="w-3 h-3" />
        </button>
      )}

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Learning Style</Label>
        <div className="grid grid-cols-1 gap-1.5 md:gap-2">
          {LEARNING_STYLES.map(s => {
            const StyleIcon = STYLE_ICONS[s.id];
            return (
              <button
                key={s.id}
                onClick={() => handleStyleChange(s.id)}
                className={`p-2 md:p-2 rounded border text-left text-xs transition-all min-h-[44px] ${
                  store.style === s.id
                    ? STYLE_COLORS[s.id]
                    : 'border-border bg-card/30 text-muted-foreground hover:border-border active:bg-border/30'
                }`}
                data-testid={`style-${s.id}`}
              >
                <div className="flex items-center gap-2">
                  <StyleIcon className={`w-3.5 h-3.5 ${store.style === s.id ? '' : 'text-muted-foreground'}`} />
                  <span className="font-medium">{s.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 pl-6">{s.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Skill Level</Label>
        <div className="flex gap-1 flex-wrap">
          {SKILL_LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => handleSkillChange(level.id as LearningProfile['skillLevel'])}
              className={`px-2.5 py-1.5 md:py-1 rounded text-[10px] md:text-[10px] border transition-all min-h-[36px] md:min-h-0 ${
                store.skillLevel === level.id
                  ? 'border-amber-600 bg-amber-950/30 text-amber-300'
                  : 'border-border text-muted-foreground hover:border-border active:bg-border/30'
              }`}
              title={level.description}
              data-testid={`skill-${level.id}`}
            >
              {level.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1">
          <Target className="w-3 h-3" /> Learning Goals
        </Label>
        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {LEARNING_GOALS.map(goal => (
            <button
              key={goal.id}
              onClick={() => handleGoalToggle(goal.id)}
              className={`p-2 rounded border text-left text-xs transition-all min-h-[44px] ${
                store.goals.includes(goal.id)
                  ? 'border-purple-600 bg-purple-950/30'
                  : 'border-border bg-card/20 hover:border-border active:bg-border/30'
              }`}
              data-testid={`goal-${goal.id}`}
            >
              <div className="flex items-center justify-between">
                <span className={store.goals.includes(goal.id) ? 'text-purple-300' : 'text-muted-foreground'}>
                  {goal.name}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-[8px] ${CATEGORY_COLORS[goal.category] || 'border-border'}`}
                >
                  {goal.category}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{goal.description}</p>
              {store.goals.includes(goal.id) && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {goal.tools.slice(0, 3).map(tool => (
                    <span key={tool} className="text-[8px] px-1 py-0.5 bg-border/50 rounded text-muted-foreground">
                      {tool}
                    </span>
                  ))}
                  {goal.tools.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">+{goal.tools.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {store.goals.length > 0 && (
        <p className="text-[10px] text-muted-foreground text-center">
          NEXUS tailors responses to your {store.goals.length} goal{store.goals.length > 1 ? 's' : ''} using {store.style} style.
          <br />
          <span className="text-muted-foreground">Changes saved automatically.</span>
        </p>
      )}
    </div>
  );
}
