import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface GlobalEffectsConfig {
  enabled: boolean;
  scanlines: boolean;
  scanlineOpacity: number;
  vignette: boolean;
  vignetteIntensity: number;
  crt: boolean;
  crtCurvature: number;
  chromaticAberration: boolean;
  chromaticOffset: number;
  glitch: boolean;
  glitchFrequency: number;
  glitchIntensity: number;
  glitchIntervalMs: number;
  glitchDurationMs: number;
  noise: boolean;
  noiseOpacity: number;
  subliminalFlashes: boolean;
  subliminalMessages: string[];
  subliminalIntervalMs: number;
  subliminalDurationMs: number;
  warmGlow: boolean;
  warmGlowIntensity: number;
  flickerEnabled: boolean;
  flickerSpeed: number;
  flickerIntervalMs: number;
  flickerDurationMs: number;
  cursorGlow: boolean;
  cursorGlowColor: string;
  cursorGlowSize: number;
  cursorTrail: boolean;
  cursorTrailLength: number;
  cursorTrailColor: string;
  cursorRipple: boolean;
  cursorRippleDurationMs: number;
  bgParticles: boolean;
  bgParticleCount: number;
  bgParticleColor: string;
  bgParticleSpeed: number;
  bgMatrixRain: boolean;
  bgMatrixSpeed: number;
  bgMatrixColor: string;
  bgGridPulse: boolean;
  bgGridColor: string;
  bgGridOpacity: number;
  bgGridPulseSpeed: number;
  bgFloatingOrbs: boolean;
  bgOrbCount: number;
  bgOrbSpeed: number;
  excludedPages: string[];
  preset: string;
}

export const DEFAULT_GLOBAL_EFFECTS: GlobalEffectsConfig = {
  enabled: false,
  scanlines: false,
  scanlineOpacity: 0.03,
  vignette: false,
  vignetteIntensity: 0.3,
  crt: false,
  crtCurvature: 3,
  chromaticAberration: false,
  chromaticOffset: 2,
  glitch: false,
  glitchFrequency: 0.02,
  glitchIntensity: 0.5,
  glitchIntervalMs: 2000,
  glitchDurationMs: 100,
  noise: false,
  noiseOpacity: 0.02,
  subliminalFlashes: false,
  subliminalMessages: ["LOOK CLOSER", "0xDEAD", "THE SIGNAL", "OBSERVE"],
  subliminalIntervalMs: 5000,
  subliminalDurationMs: 100,
  warmGlow: false,
  warmGlowIntensity: 0.15,
  flickerEnabled: false,
  flickerSpeed: 0.5,
  flickerIntervalMs: 800,
  flickerDurationMs: 50,
  cursorGlow: false,
  cursorGlowColor: "#d97706",
  cursorGlowSize: 200,
  cursorTrail: false,
  cursorTrailLength: 20,
  cursorTrailColor: "#d97706",
  cursorRipple: false,
  cursorRippleDurationMs: 800,
  bgParticles: false,
  bgParticleCount: 50,
  bgParticleColor: "#d97706",
  bgParticleSpeed: 1,
  bgMatrixRain: false,
  bgMatrixSpeed: 1,
  bgMatrixColor: "#14b8a6",
  bgGridPulse: false,
  bgGridColor: "#d97706",
  bgGridOpacity: 0.04,
  bgGridPulseSpeed: 4,
  bgFloatingOrbs: false,
  bgOrbCount: 5,
  bgOrbSpeed: 20,
  excludedPages: ["/admin"],
  preset: "clean",
};

export const EFFECT_PRESETS: Record<string, Partial<GlobalEffectsConfig>> = {
  clean: { enabled: false },
  subtle: {
    enabled: true,
    vignette: true, vignetteIntensity: 0.2,
    warmGlow: true, warmGlowIntensity: 0.1,
    cursorGlow: true, cursorGlowSize: 250, cursorGlowColor: "#d97706",
  },
  cyberpunk: {
    enabled: true,
    scanlines: true, scanlineOpacity: 0.04,
    vignette: true, vignetteIntensity: 0.35,
    chromaticAberration: true, chromaticOffset: 1.5,
    noise: true, noiseOpacity: 0.015,
    warmGlow: true, warmGlowIntensity: 0.12,
    cursorGlow: true, cursorGlowColor: "#14b8a6", cursorGlowSize: 180,
    bgGridPulse: true, bgGridColor: "#d97706", bgGridOpacity: 0.03,
    bgParticles: true, bgParticleCount: 30, bgParticleColor: "#d97706",
  },
  crt_monitor: {
    enabled: true,
    scanlines: true, scanlineOpacity: 0.06,
    crt: true, crtCurvature: 4,
    vignette: true, vignetteIntensity: 0.5,
    flickerEnabled: true, flickerSpeed: 0.3,
    noise: true, noiseOpacity: 0.03,
    cursorGlow: true, cursorGlowColor: "#22c55e", cursorGlowSize: 150,
  },
  glitch_storm: {
    enabled: true,
    glitch: true, glitchFrequency: 0.06, glitchIntensity: 0.8,
    chromaticAberration: true, chromaticOffset: 3,
    subliminalFlashes: true,
    scanlines: true, scanlineOpacity: 0.05,
    noise: true, noiseOpacity: 0.025,
    cursorTrail: true, cursorTrailLength: 15, cursorTrailColor: "#ef4444",
    cursorRipple: true,
  },
  matrix: {
    enabled: true,
    bgMatrixRain: true, bgMatrixSpeed: 1.2, bgMatrixColor: "#14b8a6",
    scanlines: true, scanlineOpacity: 0.03,
    vignette: true, vignetteIntensity: 0.4,
    cursorGlow: true, cursorGlowColor: "#14b8a6", cursorGlowSize: 200,
  },
  vaporwave: {
    enabled: true,
    chromaticAberration: true, chromaticOffset: 2,
    scanlines: true, scanlineOpacity: 0.02,
    vignette: true, vignetteIntensity: 0.25,
    warmGlow: true, warmGlowIntensity: 0.08,
    bgFloatingOrbs: true, bgOrbCount: 6,
    cursorGlow: true, cursorGlowColor: "#c084fc", cursorGlowSize: 220,
  },
  haunted: {
    enabled: true,
    glitch: true, glitchFrequency: 0.03, glitchIntensity: 0.4,
    subliminalFlashes: true,
    vignette: true, vignetteIntensity: 0.6,
    noise: true, noiseOpacity: 0.04,
    flickerEnabled: true, flickerSpeed: 0.8,
    bgParticles: true, bgParticleCount: 20, bgParticleColor: "#78716c",
    cursorTrail: true, cursorTrailLength: 25, cursorTrailColor: "#78716c",
  },
  deep_space: {
    enabled: true,
    vignette: true, vignetteIntensity: 0.45,
    bgParticles: true, bgParticleCount: 80, bgParticleColor: "#ffffff", bgParticleSpeed: 0.3,
    bgFloatingOrbs: true, bgOrbCount: 4,
    cursorGlow: true, cursorGlowColor: "#3b82f6", cursorGlowSize: 300,
    noise: true, noiseOpacity: 0.01,
  },
};

interface GlobalEffectsContextType {
  config: GlobalEffectsConfig;
  updateConfig: (updates: Partial<GlobalEffectsConfig>) => void;
  applyPreset: (presetName: string) => void;
  saveToServer: () => Promise<void>;
  isEffectActive: boolean;
}

const GlobalEffectsContext = createContext<GlobalEffectsContextType | null>(null);

export function GlobalEffectsProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<GlobalEffectsConfig>(() => {
    const saved = localStorage.getItem("global_effects_config");
    return saved ? { ...DEFAULT_GLOBAL_EFFECTS, ...JSON.parse(saved) } : DEFAULT_GLOBAL_EFFECTS;
  });

  useEffect(() => {
    fetch("/api/admin/global-effects")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.config) {
          const merged = { ...DEFAULT_GLOBAL_EFFECTS, ...data.config };
          setConfig(merged);
          localStorage.setItem("global_effects_config", JSON.stringify(merged));
        }
      })
      .catch(() => {});
  }, []);

  const updateConfig = useCallback((updates: Partial<GlobalEffectsConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem("global_effects_config", JSON.stringify(next));
      return next;
    });
  }, []);

  const applyPreset = useCallback((presetName: string) => {
    const preset = EFFECT_PRESETS[presetName];
    if (preset) {
      const next = { ...DEFAULT_GLOBAL_EFFECTS, ...preset, preset: presetName };
      setConfig(next);
      localStorage.setItem("global_effects_config", JSON.stringify(next));
    }
  }, []);

  const saveToServer = useCallback(async () => {
    try {
      await fetch("/api/admin/global-effects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
    } catch (e) {
      console.error("Failed to save effects config:", e);
    }
  }, [config]);

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const isEffectActive = config.enabled && !config.excludedPages.some(p => currentPath.startsWith(p));

  return (
    <GlobalEffectsContext.Provider value={{ config, updateConfig, applyPreset, saveToServer, isEffectActive }}>
      {children}
    </GlobalEffectsContext.Provider>
  );
}

export function useGlobalEffects() {
  const ctx = useContext(GlobalEffectsContext);
  if (!ctx) throw new Error("useGlobalEffects must be inside GlobalEffectsProvider");
  return ctx;
}
