import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EffectsSettings {
  background: {
    gradientOverlay: boolean;
    scanlines: boolean;
    noiseTexture: boolean;
    vignette: boolean;
    crtCurvature: boolean;
    matrixRain: boolean;
    gridPulse: boolean;
  };
  mouse: {
    lensDistortion: boolean;
    glowFollow: boolean;
    cursorTrail: boolean;
    magneticButtons: boolean;
    rippleClick: boolean;
  };
  glitch: {
    textGlitch: boolean;
    rgbSplit: boolean;
    screenShake: boolean;
    flicker: boolean;
    corruptedPixels: boolean;
    dataMosh: boolean;
  };
  ambient: {
    terminalMessages: boolean;
    messageInterval: number;
    chaosFlashChance: number;
    quantumCheckInterval: number;
  };
  zones: {
    terminal: string[];
    homepage: string[];
    investigation: string[];
    global: string[];
  };
}

interface EffectsState extends EffectsSettings {
  setBackground: (key: keyof EffectsSettings['background'], value: boolean) => void;
  setMouse: (key: keyof EffectsSettings['mouse'], value: boolean) => void;
  setGlitch: (key: keyof EffectsSettings['glitch'], value: boolean) => void;
  setAmbient: (key: keyof EffectsSettings['ambient'], value: number | boolean) => void;
  setZoneEffects: (zone: keyof EffectsSettings['zones'], effects: string[]) => void;
  addZoneEffect: (zone: keyof EffectsSettings['zones'], effect: string) => void;
  removeZoneEffect: (zone: keyof EffectsSettings['zones'], effect: string) => void;
  resetToDefaults: () => void;
  getActiveEffects: (zone?: keyof EffectsSettings['zones']) => string[];
}

const DEFAULT_SETTINGS: EffectsSettings = {
  background: {
    gradientOverlay: true,
    scanlines: true,
    noiseTexture: false,
    vignette: true,
    crtCurvature: false,
    matrixRain: false,
    gridPulse: false,
  },
  mouse: {
    lensDistortion: false,
    glowFollow: false,
    cursorTrail: false,
    magneticButtons: false,
    rippleClick: false,
  },
  glitch: {
    textGlitch: true,
    rgbSplit: false,
    screenShake: false,
    flicker: false,
    corruptedPixels: false,
    dataMosh: false,
  },
  ambient: {
    terminalMessages: true,
    messageInterval: 45,
    chaosFlashChance: 3,
    quantumCheckInterval: 20,
  },
  zones: {
    terminal: ['scanlines', 'textGlitch', 'terminalMessages'],
    homepage: ['gradientOverlay', 'vignette'],
    investigation: ['scanlines', 'vignette'],
    global: ['gradientOverlay'],
  },
};

export const useEffectsStore = create<EffectsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setBackground: (key, value) => set((state) => ({
        background: { ...state.background, [key]: value }
      })),

      setMouse: (key, value) => set((state) => ({
        mouse: { ...state.mouse, [key]: value }
      })),

      setGlitch: (key, value) => set((state) => ({
        glitch: { ...state.glitch, [key]: value }
      })),

      setAmbient: (key, value) => set((state) => ({
        ambient: { ...state.ambient, [key]: value }
      })),

      setZoneEffects: (zone, effects) => set((state) => ({
        zones: { ...state.zones, [zone]: effects }
      })),

      addZoneEffect: (zone, effect) => set((state) => ({
        zones: {
          ...state.zones,
          [zone]: state.zones[zone].includes(effect) 
            ? state.zones[zone] 
            : [...state.zones[zone], effect]
        }
      })),

      removeZoneEffect: (zone, effect) => set((state) => ({
        zones: {
          ...state.zones,
          [zone]: state.zones[zone].filter(e => e !== effect)
        }
      })),

      resetToDefaults: () => set(DEFAULT_SETTINGS),

      getActiveEffects: (zone) => {
        const state = get();
        const allEffects: string[] = [];
        
        // Collect enabled effects from all categories
        Object.entries(state.background).forEach(([key, enabled]) => {
          if (enabled) allEffects.push(key);
        });
        Object.entries(state.mouse).forEach(([key, enabled]) => {
          if (enabled) allEffects.push(key);
        });
        Object.entries(state.glitch).forEach(([key, enabled]) => {
          if (enabled) allEffects.push(key);
        });
        if (state.ambient.terminalMessages) allEffects.push('terminalMessages');
        
        if (zone) {
          // Return only effects enabled for this zone
          return allEffects.filter(e => 
            state.zones[zone].includes(e) || state.zones.global.includes(e)
          );
        }
        
        return allEffects;
      },
    }),
    { name: 'nexus-effects-settings' }
  )
);

export const EFFECT_PRESETS = {
  minimal: {
    name: 'Minimal',
    description: 'Clean, distraction-free interface',
    settings: {
      background: { gradientOverlay: true, scanlines: false, noiseTexture: false, vignette: true, crtCurvature: false, matrixRain: false, gridPulse: false },
      mouse: { lensDistortion: false, glowFollow: false, cursorTrail: false, magneticButtons: false, rippleClick: false },
      glitch: { textGlitch: false, rgbSplit: false, screenShake: false, flicker: false, corruptedPixels: false, dataMosh: false },
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    description: 'Neon-lit hacker aesthetic',
    settings: {
      background: { gradientOverlay: true, scanlines: true, noiseTexture: true, vignette: true, crtCurvature: false, matrixRain: false, gridPulse: true },
      mouse: { lensDistortion: true, glowFollow: true, cursorTrail: false, magneticButtons: true, rippleClick: true },
      glitch: { textGlitch: true, rgbSplit: true, screenShake: false, flicker: false, corruptedPixels: false, dataMosh: false },
    }
  },
  glitchcore: {
    name: 'Glitchcore',
    description: 'Maximum chaos and corruption',
    settings: {
      background: { gradientOverlay: true, scanlines: true, noiseTexture: true, vignette: true, crtCurvature: true, matrixRain: false, gridPulse: false },
      mouse: { lensDistortion: true, glowFollow: true, cursorTrail: true, magneticButtons: false, rippleClick: true },
      glitch: { textGlitch: true, rgbSplit: true, screenShake: true, flicker: true, corruptedPixels: true, dataMosh: true },
    }
  },
  retro: {
    name: 'Retro CRT',
    description: 'Old-school terminal vibes',
    settings: {
      background: { gradientOverlay: false, scanlines: true, noiseTexture: true, vignette: true, crtCurvature: true, matrixRain: false, gridPulse: false },
      mouse: { lensDistortion: false, glowFollow: false, cursorTrail: false, magneticButtons: false, rippleClick: false },
      glitch: { textGlitch: false, rgbSplit: false, screenShake: false, flicker: true, corruptedPixels: false, dataMosh: false },
    }
  },
  matrix: {
    name: 'Matrix',
    description: 'Digital rain and emergence',
    settings: {
      background: { gradientOverlay: false, scanlines: false, noiseTexture: false, vignette: true, crtCurvature: false, matrixRain: true, gridPulse: false },
      mouse: { lensDistortion: false, glowFollow: true, cursorTrail: true, magneticButtons: false, rippleClick: false },
      glitch: { textGlitch: true, rgbSplit: false, screenShake: false, flicker: false, corruptedPixels: false, dataMosh: false },
    }
  },
};
