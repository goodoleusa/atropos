import { useState, useEffect, useRef, useCallback, ReactNode, CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type GlitchEffect =
  | "text-scramble"
  | "scanline"
  | "static-burst"
  | "data-corrupt"
  | "color-shift"
  | "flicker"
  | "pixel-sort"
  | "none";

export const GLITCH_EFFECTS: { id: GlitchEffect; label: string; description: string }[] = [
  { id: "none", label: "None", description: "No effect" },
  { id: "text-scramble", label: "Text Scramble", description: "Characters randomly scramble on hover" },
  { id: "scanline", label: "Scanline", description: "CRT scanline sweep across element" },
  { id: "static-burst", label: "Static Burst", description: "Brief TV static noise overlay" },
  { id: "data-corrupt", label: "Data Corrupt", description: "Element fragments and reassembles" },
  { id: "color-shift", label: "Color Shift", description: "RGB channel split on hover" },
  { id: "flicker", label: "Flicker", description: "Random opacity flicker like a bad connection" },
  { id: "pixel-sort", label: "Pixel Sort", description: "Glitch art pixel sorting effect" },
];

interface GlitchHoverProps {
  children: ReactNode;
  effect?: GlitchEffect;
  intensity?: number;
  className?: string;
  style?: CSSProperties;
  triggerOnMount?: boolean;
  disabled?: boolean;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>{}[]|/\\";

function useTextScramble(text: string, active: boolean, intensity: number) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!active) { setDisplay(text); return; }

    let frame = 0;
    const totalFrames = Math.max(8, Math.floor(20 * intensity));
    const scramble = () => {
      const progress = frame / totalFrames;
      const result = text.split("").map((char, i) => {
        if (char === " ") return " ";
        if (i / text.length < progress) return char;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join("");
      setDisplay(result);
      frame++;
      if (frame <= totalFrames) {
        frameRef.current = requestAnimationFrame(scramble);
      }
    };
    scramble();
    return () => cancelAnimationFrame(frameRef.current);
  }, [active, text, intensity]);

  return display;
}

export function GlitchHover({
  children,
  effect = "scanline",
  intensity = 0.5,
  className,
  style,
  triggerOnMount = false,
  disabled = false,
}: GlitchHoverProps) {
  const [isHovered, setIsHovered] = useState(triggerOnMount);
  const active = !disabled && isHovered;
  const scale = Math.max(0, Math.min(1, intensity));

  if (effect === "none" || disabled) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <div
      className={cn("relative", className)}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {effect === "scanline" && active && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[inherit]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(217,119,6,${scale * 0.6}), rgba(245,158,11,${scale * 0.4}), transparent)`,
              boxShadow: `0 0 ${8 * scale}px rgba(217,119,6,${scale * 0.3})`,
            }}
            initial={{ top: "-2px" }}
            animate={{ top: "calc(100% + 2px)" }}
            transition={{ duration: 0.6 / scale, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}

      {effect === "static-burst" && active && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none rounded-[inherit] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, scale * 0.4, 0, scale * 0.3, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.5 + Math.random() * 2 }}
        >
          <StaticNoise opacity={scale * 0.5} />
        </motion.div>
      )}

      {effect === "data-corrupt" && (
        <motion.div
          className="relative"
          animate={active ? {
            x: [0, -2 * scale, 3 * scale, -1 * scale, 0],
            skewX: [0, -1 * scale, 2 * scale, 0],
          } : { x: 0, skewX: 0 }}
          transition={{ duration: 0.15, repeat: active ? Infinity : 0, repeatDelay: 0.8 }}
        >
          {active && (
            <>
              <div
                className="absolute inset-0 z-10 pointer-events-none rounded-[inherit]"
                style={{
                  clipPath: `inset(${30 + Math.random() * 40}% 0 ${10 + Math.random() * 30}% 0)`,
                  transform: `translateX(${(Math.random() - 0.5) * 8 * scale}px)`,
                  filter: `hue-rotate(${Math.random() * 30}deg)`,
                  opacity: scale * 0.7,
                  background: "rgba(217,119,6,0.05)",
                }}
              />
            </>
          )}
          {children}
        </motion.div>
      )}

      {effect === "color-shift" && (
        <div className="relative">
          {active && (
            <>
              <div
                className="absolute inset-0 z-10 pointer-events-none rounded-[inherit] mix-blend-multiply"
                style={{
                  background: `rgba(255,0,0,${scale * 0.1})`,
                  transform: `translate(${scale * 2}px, ${-scale}px)`,
                }}
              />
              <div
                className="absolute inset-0 z-10 pointer-events-none rounded-[inherit] mix-blend-multiply"
                style={{
                  background: `rgba(0,0,255,${scale * 0.1})`,
                  transform: `translate(${-scale * 2}px, ${scale}px)`,
                }}
              />
            </>
          )}
          {children}
        </div>
      )}

      {effect === "flicker" && (
        <motion.div
          animate={active ? {
            opacity: [1, 0.7, 1, 0.85, 1, 0.6, 1, 0.9, 1],
          } : { opacity: 1 }}
          transition={{ duration: 0.4, repeat: active ? Infinity : 0, repeatDelay: 1 + Math.random() * 3 }}
        >
          {children}
        </motion.div>
      )}

      {effect === "pixel-sort" && (
        <div className="relative">
          {active && (
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none rounded-[inherit] overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: scale * 0.5 }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-0 right-0"
                  style={{
                    height: `${2 + Math.random() * 4}px`,
                    top: `${10 + i * 18 + Math.random() * 10}%`,
                    background: `linear-gradient(90deg, transparent ${Math.random() * 20}%, rgba(217,119,6,0.3) ${30 + Math.random() * 20}%, rgba(184,115,51,0.2) ${60 + Math.random() * 20}%, transparent ${80 + Math.random() * 20}%)`,
                  }}
                  animate={{ x: [-20, 20] }}
                  transition={{ duration: 0.2 + Math.random() * 0.3, repeat: Infinity, repeatType: "reverse" }}
                />
              ))}
            </motion.div>
          )}
          {children}
        </div>
      )}

      {effect !== "data-corrupt" && effect !== "color-shift" && effect !== "flicker" && effect !== "pixel-sort" && children}
    </div>
  );
}

function StaticNoise({ opacity }: { opacity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = 100;

    const draw = () => {
      const imageData = ctx.createImageData(100, 100);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 255;
        imageData.data[i] = v * 0.85;
        imageData.data[i + 1] = v * 0.65;
        imageData.data[i + 2] = v * 0.3;
        imageData.data[i + 3] = Math.random() * 100;
      }
      ctx.putImageData(imageData, 0, 0);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity, imageRendering: "pixelated" }}
    />
  );
}

export function GlitchText({
  text,
  effect = "text-scramble",
  intensity = 0.5,
  className,
  as: Component = "span",
}: {
  text: string;
  effect?: "text-scramble" | "glitch-css";
  intensity?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p" | "div";
}) {
  const [hovered, setHovered] = useState(false);
  const display = useTextScramble(text, hovered && effect === "text-scramble", intensity);

  if (effect === "glitch-css") {
    return (
      <Component
        className={cn("text-glitch relative inline-block", className)}
        data-text={text}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {text}
      </Component>
    );
  }

  return (
    <Component
      className={cn("inline-block cursor-default", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {display}
    </Component>
  );
}

interface CluePopoverProps {
  children: ReactNode;
  clueId?: string;
  title: string;
  description?: string;
  difficulty?: number;
  className?: string;
}

export function CluePopover({ children, clueId, title, description, difficulty, className }: CluePopoverProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<"top" | "bottom">("top");
  const ref = useRef<HTMLDivElement>(null);

  const handleEnter = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos(rect.top < 200 ? "bottom" : "top");
    }
    setShow(true);
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative inline-block", className)}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            className={cn(
              "absolute z-50 left-1/2 w-56 pointer-events-none",
              pos === "top" ? "bottom-full mb-2" : "top-full mt-2"
            )}
            style={{ transform: "translateX(-50%)" }}
            initial={{ opacity: 0, y: pos === "top" ? 8 : -8, scaleY: 0.8, filter: "blur(4px)" }}
            animate={{
              opacity: [0, 0.6, 1, 0.9, 1],
              y: 0,
              scaleY: 1,
              filter: "blur(0px)",
            }}
            exit={{ opacity: 0, y: pos === "top" ? 4 : -4, filter: "blur(2px)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="bg-stone-950/95 border border-amber-900/40 rounded-lg p-3 shadow-xl shadow-amber-900/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-mono text-amber-600 uppercase tracking-widest">
                  {clueId ? `CLUE::${clueId.slice(0, 8)}` : "INTEL"}
                </span>
              </div>
              <GlitchText text={title} className="text-xs font-bold text-amber-400 block mb-1" />
              {description && (
                <p className="text-[10px] text-stone-500 leading-relaxed">{description}</p>
              )}
              {difficulty !== undefined && (
                <div className="flex gap-0.5 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-3 h-1 rounded-full",
                        i < difficulty ? "bg-amber-600" : "bg-stone-800"
                      )}
                    />
                  ))}
                </div>
              )}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[1px]"
                style={{ background: "linear-gradient(90deg, transparent, #d97706, transparent)" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GlitchModal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{
        opacity: 0,
        scaleX: 1.02,
        filter: "blur(3px) hue-rotate(10deg)",
        clipPath: "inset(10% 0 10% 0)",
      }}
      animate={{
        opacity: 1,
        scaleX: 1,
        filter: "blur(0px) hue-rotate(0deg)",
        clipPath: "inset(0% 0 0% 0)",
      }}
      exit={{
        opacity: 0,
        scaleX: 0.98,
        filter: "blur(2px)",
        clipPath: "inset(5% 0 5% 0)",
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
