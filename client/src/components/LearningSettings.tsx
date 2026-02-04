import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGameSession';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  LEARNING_STYLES, 
  LEARNING_GOALS, 
  SKILL_LEVELS,
  CATEGORY_COLORS,
  type LearningStyle,
  type LearningGoal,
  type LearningProfile
} from '@/config/learningConfig';
import { BookOpen, Target, Zap, ChevronDown, ChevronUp, Save } from 'lucide-react';

interface LearningSettingsProps {
  onProfileChange?: (profile: LearningProfile) => void;
  compact?: boolean;
}

export function LearningSettings({ onProfileChange, compact = false }: LearningSettingsProps) {
  const { gameState } = useGame();
  const [profile, setProfile] = useState<LearningProfile>({
    style: 'experiential',
    goals: [],
    interests: [],
    skillLevel: 'beginner',
    preferredPace: 'moderate'
  });
  const [expanded, setExpanded] = useState(!compact);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load profile from server
    if (gameState.sessionToken) {
      fetch(`/api/behavior/profile/${gameState.sessionToken}`)
        .then(r => r.json())
        .then(data => {
          if (data.style) {
            setProfile(data);
          }
        })
        .catch(console.error);
    }
  }, [gameState.sessionToken]);

  const saveProfile = async () => {
    if (!gameState.sessionToken) return;
    setSaving(true);

    try {
      await fetch('/api/behavior/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: gameState.sessionToken, goals: profile.goals })
      });

      await fetch('/api/behavior/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: gameState.sessionToken, style: profile.style })
      });

      onProfileChange?.(profile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }

    setSaving(false);
  };

  const toggleGoal = (goalId: LearningGoal) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const setStyle = (style: LearningStyle) => {
    setProfile(prev => ({ ...prev, style }));
  };

  const setSkillLevel = (skillLevel: LearningProfile['skillLevel']) => {
    setProfile(prev => ({ ...prev, skillLevel }));
  };

  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between p-2 text-xs bg-stone-900/50 rounded border border-stone-800 hover:border-teal-800 transition-colors"
        data-testid="expand-learning-settings"
      >
        <span className="flex items-center gap-2 text-stone-400">
          <BookOpen className="w-3 h-3 text-teal-500" />
          Learning Profile
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-teal-800 text-teal-400">
            {profile.style}
          </Badge>
          <Badge variant="outline" className="text-[9px] border-amber-800 text-amber-400">
            {profile.goals.length} goals
          </Badge>
          <ChevronDown className="w-3 h-3 text-stone-500" />
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-4 bg-stone-950/50 rounded-lg border border-stone-800 p-3">
      {compact && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full flex items-center justify-between text-xs text-stone-400 hover:text-teal-400"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-3 h-3 text-teal-500" />
            Learning Profile Settings
          </span>
          <ChevronUp className="w-3 h-3" />
        </button>
      )}

      {/* Learning Style */}
      <div>
        <Label className="text-xs text-stone-400 mb-2 block">Learning Style</Label>
        <div className="grid grid-cols-1 gap-2">
          {LEARNING_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setStyle(style.id)}
              className={`p-2 rounded border text-left text-xs transition-all ${
                profile.style === style.id
                  ? 'border-teal-600 bg-teal-950/30 text-teal-300'
                  : 'border-stone-800 bg-stone-900/30 text-stone-400 hover:border-stone-700'
              }`}
              data-testid={`style-${style.id}`}
            >
              <div className="flex items-center gap-2">
                <span>{style.icon}</span>
                <span className="font-medium">{style.name}</span>
              </div>
              <p className="text-[10px] text-stone-500 mt-1 pl-6">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Skill Level */}
      <div>
        <Label className="text-xs text-stone-400 mb-2 block">Skill Level</Label>
        <div className="flex gap-1 flex-wrap">
          {SKILL_LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => setSkillLevel(level.id as LearningProfile['skillLevel'])}
              className={`px-2 py-1 rounded text-[10px] border transition-all ${
                profile.skillLevel === level.id
                  ? 'border-amber-600 bg-amber-950/30 text-amber-300'
                  : 'border-stone-800 text-stone-500 hover:border-stone-700'
              }`}
              title={level.description}
              data-testid={`skill-${level.id}`}
            >
              {level.name}
            </button>
          ))}
        </div>
      </div>

      {/* Learning Goals */}
      <div>
        <Label className="text-xs text-stone-400 mb-2 block flex items-center gap-1">
          <Target className="w-3 h-3" /> Learning Goals
        </Label>
        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {LEARNING_GOALS.map(goal => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-2 rounded border text-left text-xs transition-all ${
                profile.goals.includes(goal.id)
                  ? 'border-purple-600 bg-purple-950/30'
                  : 'border-stone-800 bg-stone-900/20 hover:border-stone-700'
              }`}
              data-testid={`goal-${goal.id}`}
            >
              <div className="flex items-center justify-between">
                <span className={profile.goals.includes(goal.id) ? 'text-purple-300' : 'text-stone-400'}>
                  {goal.name}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-[8px] ${CATEGORY_COLORS[goal.category] || 'border-stone-700'}`}
                >
                  {goal.category}
                </Badge>
              </div>
              <p className="text-[10px] text-stone-600 mt-0.5">{goal.description}</p>
              {profile.goals.includes(goal.id) && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {goal.tools.slice(0, 3).map(tool => (
                    <span key={tool} className="text-[8px] px-1 py-0.5 bg-stone-800/50 rounded text-stone-500">
                      {tool}
                    </span>
                  ))}
                  {goal.tools.length > 3 && (
                    <span className="text-[8px] text-stone-600">+{goal.tools.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={saveProfile}
        disabled={saving}
        className="w-full bg-teal-800 hover:bg-teal-700 text-white text-xs h-8"
        data-testid="save-learning-profile"
      >
        {saving ? (
          'Saving...'
        ) : (
          <>
            <Save className="w-3 h-3 mr-1" /> Save Learning Profile
          </>
        )}
      </Button>

      {profile.goals.length > 0 && (
        <p className="text-[10px] text-stone-600 text-center">
          NEXUS will tailor responses to your {profile.goals.length} selected goal{profile.goals.length > 1 ? 's' : ''} 
          using {profile.style} learning style.
        </p>
      )}
    </div>
  );
}
