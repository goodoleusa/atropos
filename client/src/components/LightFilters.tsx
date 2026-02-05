import { motion } from "framer-motion";

type FilterType = "vignette" | "film-grain" | "scan-lines" | "warm-glow" | "cool-fade" | "none";

interface LightFiltersProps {
  filter?: FilterType;
  intensity?: number;
  className?: string;
}

export const LightFilters = ({ 
  filter = "vignette", 
  intensity = 0.3,
  className = "" 
}: LightFiltersProps) => {
  if (filter === "none") return null;

  const opacityScale = Math.max(0, Math.min(1, intensity));

  return (
    <div className={`pointer-events-none fixed inset-0 z-[5] ${className}`} aria-hidden="true">
      {filter === "vignette" && (
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${opacityScale * 0.6}) 100%)`,
          }}
        />
      )}

      {filter === "film-grain" && (
        <motion.div
          className="absolute inset-0 bg-[url('/assets/grid-noise.png')] bg-repeat"
          style={{ opacity: opacityScale * 0.08 }}
          animate={{ 
            backgroundPosition: ["0px 0px", "100px 50px", "0px 0px"]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      )}

      {filter === "scan-lines" && (
        <div 
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,${opacityScale * 0.03}) 2px,
              rgba(0,0,0,${opacityScale * 0.03}) 4px
            )`,
          }}
        />
      )}

      {filter === "warm-glow" && (
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, rgba(184,115,51,${opacityScale * 0.1}) 0%, transparent 60%),
                         radial-gradient(ellipse at center, transparent 50%, rgba(10,5,0,${opacityScale * 0.4}) 100%)`,
          }}
        />
      )}

      {filter === "cool-fade" && (
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, rgba(59,130,246,${opacityScale * 0.05}) 0%, transparent 50%),
                         radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${opacityScale * 0.5}) 100%)`,
          }}
        />
      )}
    </div>
  );
};

export const FILTER_PRESETS = {
  subtle: { filter: "vignette" as FilterType, intensity: 0.25 },
  cinematic: { filter: "vignette" as FilterType, intensity: 0.5 },
  retro: { filter: "scan-lines" as FilterType, intensity: 0.4 },
  film: { filter: "film-grain" as FilterType, intensity: 0.5 },
  bronze: { filter: "warm-glow" as FilterType, intensity: 0.4 },
  cold: { filter: "cool-fade" as FilterType, intensity: 0.35 },
  clean: { filter: "none" as FilterType, intensity: 0 },
};
