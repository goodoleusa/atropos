import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningStyle, LearningGoal, LearningProfile } from '@/config/learningConfig';
import { LEARNING_STYLES, LEARNING_GOALS } from '@/config/learningConfig';

interface LearningState extends LearningProfile {
  setStyle: (style: LearningStyle) => void;
  addGoal: (goal: LearningGoal) => void;
  removeGoal: (goal: LearningGoal) => void;
  toggleGoal: (goal: LearningGoal) => void;
  setGoals: (goals: LearningGoal[]) => void;
  setSkillLevel: (level: LearningProfile['skillLevel']) => void;
  setPreferredPace: (pace: LearningProfile['preferredPace']) => void;
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  setInterests: (interests: string[]) => void;
  reset: () => void;
  
  getStylePromptModifier: () => string;
  getGoalsPromptModifier: () => string;
  getFullPromptModifier: () => string;
  getRecommendedTools: () => string[];
}

const DEFAULT_PROFILE: LearningProfile = {
  style: 'experiential',
  goals: ['penetration_testing'],
  interests: [],
  skillLevel: 'intermediate',
  preferredPace: 'moderate'
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PROFILE,

      setStyle: (style) => set({ style }),

      addGoal: (goal) => set((state) => ({
        goals: state.goals.includes(goal) ? state.goals : [...state.goals, goal]
      })),

      removeGoal: (goal) => set((state) => ({
        goals: state.goals.filter(g => g !== goal)
      })),

      toggleGoal: (goal) => set((state) => ({
        goals: state.goals.includes(goal)
          ? state.goals.filter(g => g !== goal)
          : [...state.goals, goal]
      })),

      setGoals: (goals) => set({ goals }),

      setSkillLevel: (skillLevel) => set({ skillLevel }),

      setPreferredPace: (preferredPace) => set({ preferredPace }),

      addInterest: (interest) => set((state) => ({
        interests: state.interests.includes(interest) ? state.interests : [...state.interests, interest]
      })),

      removeInterest: (interest) => set((state) => ({
        interests: state.interests.filter(i => i !== interest)
      })),

      setInterests: (interests) => set({ interests }),

      reset: () => set(DEFAULT_PROFILE),

      getStylePromptModifier: () => {
        const { style, preferredPace } = get();
        const styleInfo = LEARNING_STYLES.find(s => s.id === style);
        
        const styleModifiers: Record<LearningStyle, string> = {
          experiential: 'Provide hands-on exercises, practical labs, and real-world scenarios. Lead with "Try this:" prompts. Include command examples the user can run immediately.',
          visual: 'Include ASCII diagrams, flowcharts, network topology maps, and visual representations. Structure output with clear visual hierarchy using headers, bullets, and code blocks.',
          analytical: 'Provide in-depth technical details, reference documentation, RFCs, and theoretical foundations. Explain the "why" behind each concept with citations where applicable.',
          social: 'Reference community resources, forums, CTF writeups, discussion threads, and collaborative approaches. Mention where to find peer discussions and mentorship.',
          pragmatic: 'Focus on quick wins, automation scripts, and efficient shortcuts. Prioritize actionable steps that deliver immediate results. Skip theory, get to the point.'
        };

        const paceModifiers: Record<LearningProfile['preferredPace'], string> = {
          fast: 'Be concise and skip explanations unless asked.',
          moderate: 'Balance explanation with practical application.',
          thorough: 'Provide comprehensive coverage with detailed explanations at each step.'
        };

        return `Learning Style: ${styleInfo?.name || style}
${styleModifiers[style]}
Pace: ${paceModifiers[preferredPace]}`;
      },

      getGoalsPromptModifier: () => {
        const { goals, skillLevel } = get();
        if (goals.length === 0) return '';

        const goalDetails = goals.map(goalId => {
          const goal = LEARNING_GOALS.find(g => g.id === goalId);
          return goal ? `- ${goal.name}: ${goal.description}` : null;
        }).filter(Boolean).join('\n');

        const skillContext: Record<LearningProfile['skillLevel'], string> = {
          beginner: 'Explain fundamentals, define technical terms, and provide step-by-step guidance.',
          intermediate: 'Assume familiarity with basics, focus on practical application and common pitfalls.',
          advanced: 'Cover edge cases, advanced techniques, and optimization strategies.',
          expert: 'Discuss cutting-edge research, novel attack vectors, and contribute to the field.'
        };

        return `Focus Areas:
${goalDetails}

Skill Level: ${skillLevel}
${skillContext[skillLevel]}`;
      },

      getFullPromptModifier: () => {
        const styleModifier = get().getStylePromptModifier();
        const goalsModifier = get().getGoalsPromptModifier();
        
        return `## Learning Profile
${styleModifier}

${goalsModifier}`.trim();
      },

      getRecommendedTools: () => {
        const { goals } = get();
        const toolSet = new Set<string>();
        
        goals.forEach(goalId => {
          const goal = LEARNING_GOALS.find(g => g.id === goalId);
          goal?.tools.forEach(tool => toolSet.add(tool));
        });

        return Array.from(toolSet);
      }
    }),
    {
      name: 'nexus-learning-profile',
      version: 1
    }
  )
);
