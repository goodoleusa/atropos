import { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";

export type MoltenEffect = 
  | "flowing-border"
  | "ember-glow"
  | "heat-shimmer"
  | "molten-text"
  | "forge-pulse"
  | "slag-particles"
  | "cooling-metal"
  | "crucible-ripple"
  | "none";

interface MoltenWrapperProps {
  children: ReactNode;
  effect?: MoltenEffect;
  intensity?: number;
  className?: string;
  style?: CSSProperties;
}

export const MoltenWrapper = ({
  children,
  effect = "none",
  intensity = 0.5,
  className = "",
  style,
}: MoltenWrapperProps) => {
  if (effect === "none") {
    return <div className={className} style={style}>{children}</div>;
  }

  const scale = Math.max(0, Math.min(1, intensity));

  return (
    <div className={`relative ${className}`} style={style}>
      {effect === "flowing-border" && (
        <motion.div
          className="absolute -inset-[2px] rounded-[inherit] z-0"
          style={{
            background: `conic-gradient(from 0deg, 
              rgba(184,115,51,${scale * 0.8}), 
              rgba(217,119,6,${scale * 0.6}), 
              rgba(245,158,11,${scale * 0.4}), 
              rgba(217,119,6,${scale * 0.6}), 
              rgba(184,115,51,${scale * 0.8}))`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}

      {effect === "ember-glow" && (
        <motion.div
          className="absolute -inset-[1px] rounded-[inherit] z-0"
          style={{
            boxShadow: `0 0 ${10 * scale}px rgba(184,115,51,0.5), 
                        inset 0 0 ${5 * scale}px rgba(184,115,51,0.3)`,
          }}
          animate={{
            boxShadow: [
              `0 0 ${10 * scale}px rgba(184,115,51,0.3), inset 0 0 ${5 * scale}px rgba(184,115,51,0.2)`,
              `0 0 ${20 * scale}px rgba(217,119,6,0.5), inset 0 0 ${10 * scale}px rgba(217,119,6,0.3)`,
              `0 0 ${10 * scale}px rgba(184,115,51,0.3), inset 0 0 ${5 * scale}px rgba(184,115,51,0.2)`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {effect === "heat-shimmer" && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] z-10 pointer-events-none"
          style={{ 
            background: "transparent",
            backdropFilter: `blur(${0.3 * scale}px)`,
          }}
          animate={{
            backdropFilter: [
              `blur(${0.2 * scale}px)`,
              `blur(${0.5 * scale}px)`,
              `blur(${0.2 * scale}px)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {effect === "forge-pulse" && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] z-0"
          style={{
            background: `radial-gradient(circle at center, rgba(217,119,6,${scale * 0.15}) 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {effect === "crucible-ripple" && (
        <>
          <motion.div
            className="absolute inset-0 rounded-[inherit] z-0 border border-amber-700/30"
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-[inherit] z-0 border border-amber-600/20"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
        </>
      )}

      <div className="relative z-10 bg-inherit rounded-[inherit]">{children}</div>
    </div>
  );
};

export const MoltenText = ({
  children,
  effect = "molten-text",
  intensity = 0.5,
  className = "",
  as: Component = "span",
}: {
  children: ReactNode;
  effect?: "molten-text" | "cooling-metal" | "none";
  intensity?: number;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p" | "div";
}) => {
  const scale = Math.max(0, Math.min(1, intensity));

  if (effect === "none") {
    return <Component className={className}>{children}</Component>;
  }

  if (effect === "molten-text") {
    return (
      <Component className={`relative inline-block ${className}`}>
        <motion.span
          className="absolute inset-0 blur-sm"
          style={{ color: `rgba(217,119,6,${scale * 0.8})` }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            filter: [`blur(${2 * scale}px)`, `blur(${4 * scale}px)`, `blur(${2 * scale}px)`],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          {children}
        </motion.span>
        <span className="relative">{children}</span>
      </Component>
    );
  }

  if (effect === "cooling-metal") {
    return (
      <motion.span
        className={className}
        animate={{
          color: [
            `rgba(245,158,11,${0.7 + scale * 0.3})`,
            `rgba(184,115,51,${0.6 + scale * 0.2})`,
            `rgba(120,80,40,${0.5 + scale * 0.2})`,
            `rgba(184,115,51,${0.6 + scale * 0.2})`,
            `rgba(245,158,11,${0.7 + scale * 0.3})`,
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.span>
    );
  }

  return <Component className={className}>{children}</Component>;
};

const Particle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-amber-500 rounded-full"
    style={{ left: `${x}%`, bottom: 0 }}
    initial={{ opacity: 0, y: 0 }}
    animate={{
      opacity: [0, 0.8, 0],
      y: [0, -60, -100],
      x: [0, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 30],
      scale: [0.5, 1, 0.3],
    }}
    transition={{
      duration: 2 + Math.random(),
      repeat: Infinity,
      delay,
      ease: "easeOut",
    }}
  />
);

export const SlagParticles = ({ 
  count = 8, 
  className = "" 
}: { 
  count?: number; 
  className?: string;
}) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    x: 10 + Math.random() * 80,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <Particle key={p.id} delay={p.delay} x={p.x} />
      ))}
    </div>
  );
};

export const MOLTEN_PRESETS = {
  subtle: { effect: "ember-glow" as MoltenEffect, intensity: 0.3 },
  dramatic: { effect: "flowing-border" as MoltenEffect, intensity: 0.7 },
  warm: { effect: "forge-pulse" as MoltenEffect, intensity: 0.5 },
  ripple: { effect: "crucible-ripple" as MoltenEffect, intensity: 0.6 },
  shimmer: { effect: "heat-shimmer" as MoltenEffect, intensity: 0.4 },
  clean: { effect: "none" as MoltenEffect, intensity: 0 },
};
