import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SubliminalMode = "off" | "subtle" | "moderate" | "intense";

interface SubliminalConfig {
  mode: SubliminalMode;
  glitchFrequency: number;
  scanlines: boolean;
  vignette: boolean;
  vignetteIntensity: number;
  chromatic: boolean;
  noise: boolean;
  subliminalMessages: boolean;
  messages: string[];
}

const DEFAULT_CONFIG: SubliminalConfig = {
  mode: "subtle",
  glitchFrequency: 0.02,
  scanlines: true,
  vignette: true,
  vignetteIntensity: 0.3,
  chromatic: false,
  noise: true,
  subliminalMessages: true,
  messages: [
    "LOOK CLOSER",
    "THE SIGNAL",
    "0xDEAD",
    "OBSERVE",
    "PATTERNS",
  ],
};

export const useSubliminalConfig = () => {
  const [config, setConfig] = useState<SubliminalConfig>(() => {
    const saved = localStorage.getItem("subliminal_config");
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  });

  const updateConfig = (updates: Partial<SubliminalConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem("subliminal_config", JSON.stringify(newConfig));
  };

  const toggleMode = (mode: SubliminalMode) => updateConfig({ mode });

  return { config, updateConfig, toggleMode };
};

interface SubliminalOverlayProps {
  config?: Partial<SubliminalConfig>;
  children?: ReactNode;
}

export const SubliminalOverlay = ({ config: propConfig, children }: SubliminalOverlayProps) => {
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [glitchActive, setGlitchActive] = useState(false);
  
  const config = { ...DEFAULT_CONFIG, ...propConfig };
  
  const frequencyMultiplier = 
    config.mode === "off" ? 0 :
    config.mode === "subtle" ? 0.5 :
    config.mode === "moderate" ? 1 :
    2;

  useEffect(() => {
    if (config.mode === "off") return;

    const glitchInterval = setInterval(() => {
      if (Math.random() < config.glitchFrequency * frequencyMultiplier) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 50 + Math.random() * 100);
      }
    }, 2000);

    const messageInterval = setInterval(() => {
      if (config.subliminalMessages && Math.random() < 0.03 * frequencyMultiplier) {
        const msg = config.messages[Math.floor(Math.random() * config.messages.length)];
        setFlashMessage(msg);
        setTimeout(() => setFlashMessage(null), 80 + Math.random() * 70);
      }
    }, 5000);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(messageInterval);
    };
  }, [config.mode, config.glitchFrequency, config.subliminalMessages, config.messages, frequencyMultiplier]);

  if (config.mode === "off") {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      
      <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
        {config.vignette && (
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, 
                transparent 30%, 
                rgba(0,0,0,${config.vignetteIntensity * 0.5}) 70%,
                rgba(0,0,0,${config.vignetteIntensity}) 100%)`,
            }}
          />
        )}

        {config.scanlines && (
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.3) 2px,
                rgba(0,0,0,0.3) 4px
              )`,
            }}
          />
        )}

        {config.noise && (
          <motion.div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
            animate={{ opacity: [0.02, 0.04, 0.02] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
        )}

        <AnimatePresence>
          {glitchActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {config.chromatic && (
                <>
                  <div 
                    className="absolute inset-0 mix-blend-screen"
                    style={{ 
                      background: "rgba(255,0,0,0.03)",
                      transform: "translateX(2px)",
                    }}
                  />
                  <div 
                    className="absolute inset-0 mix-blend-screen"
                    style={{ 
                      background: "rgba(0,255,255,0.03)",
                      transform: "translateX(-2px)",
                    }}
                  />
                </>
              )}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(
                    ${Math.random() * 360}deg,
                    transparent ${40 + Math.random() * 20}%,
                    rgba(184,115,51,0.05) ${50 + Math.random() * 10}%,
                    transparent ${60 + Math.random() * 20}%
                  )`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {flashMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-6xl md:text-9xl font-black text-amber-800/20 tracking-widest font-mono blur-[1px]">
                {flashMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface VideoOverlayProps {
  variant?: "cyberpunk" | "vhs" | "film" | "clean";
  intensity?: number;
}

export const VideoOverlay = ({ variant = "cyberpunk", intensity = 0.5 }: VideoOverlayProps) => {
  const scale = Math.max(0, Math.min(1, intensity));

  if (variant === "clean") return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
      {variant === "cyberpunk" && (
        <>
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, 
                transparent 20%, 
                rgba(0,0,0,${scale * 0.4}) 60%,
                rgba(0,0,0,${scale * 0.7}) 100%)`,
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 1px,
                rgba(184,115,51,0.5) 1px,
                rgba(184,115,51,0.5) 2px
              )`,
            }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1/3"
            style={{
              background: `linear-gradient(to top, rgba(184,115,51,${scale * 0.1}) 0%, transparent 100%)`,
            }}
          />
        </>
      )}

      {variant === "vhs" && (
        <>
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${scale * 0.6}) 100%)`,
            }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.01) 2px,
                rgba(255,255,255,0.01) 4px
              )`,
            }}
            animate={{ backgroundPosition: ["0px 0px", "0px 4px"] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
              background: "linear-gradient(90deg, rgba(255,0,0,0.5), transparent 3%, transparent 97%, rgba(0,255,255,0.5))",
            }}
          />
        </>
      )}

      {variant === "film" && (
        <>
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${scale * 0.5}) 100%)`,
            }}
          />
          <motion.div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
            animate={{ opacity: [0.03, 0.05, 0.03] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
        </>
      )}
    </div>
  );
};

export const SUBLIMINAL_PRESETS = {
  off: { mode: "off" as SubliminalMode },
  whisper: { mode: "subtle" as SubliminalMode, glitchFrequency: 0.01, subliminalMessages: false },
  subtle: { mode: "subtle" as SubliminalMode, glitchFrequency: 0.02 },
  cassette: { mode: "moderate" as SubliminalMode, scanlines: true, noise: true, chromatic: true },
  glitchy: { mode: "intense" as SubliminalMode, glitchFrequency: 0.05, chromatic: true },
};

export const VIDEO_OVERLAY_PRESETS = {
  clean: { variant: "clean" as const, intensity: 0 },
  subtle: { variant: "cyberpunk" as const, intensity: 0.3 },
  cyberpunk: { variant: "cyberpunk" as const, intensity: 0.5 },
  vhs: { variant: "vhs" as const, intensity: 0.5 },
  film: { variant: "film" as const, intensity: 0.4 },
};
