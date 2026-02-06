import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalEffects } from "@/hooks/useGlobalEffects";

interface TrailPoint {
  x: number;
  y: number;
  id: number;
  opacity: number;
}

const CursorEffects = memo(function CursorEffects() {
  const { config } = useGlobalEffects();
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const trailIdRef = useRef(0);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    if (!config.cursorGlow && !config.cursorTrail && !config.cursorRipple) return;

    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (config.cursorTrail) {
        trailIdRef.current++;
        setTrail(prev => {
          const next = [...prev, { x: e.clientX, y: e.clientY, id: trailIdRef.current, opacity: 1 }];
          return next.slice(-config.cursorTrailLength);
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (config.cursorRipple) {
        rippleIdRef.current++;
        setRipples(prev => [...prev, { x: e.clientX, y: e.clientY, id: rippleIdRef.current }]);
        setTimeout(() => {
          setRipples(prev => prev.slice(1));
        }, 800);
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
    };
  }, [config.cursorGlow, config.cursorTrail, config.cursorRipple, config.cursorTrailLength]);

  return (
    <>
      {config.cursorGlow && (
        <div
          className="pointer-events-none fixed z-[90] rounded-full transition-transform duration-75"
          style={{
            left: mousePos.x - config.cursorGlowSize / 2,
            top: mousePos.y - config.cursorGlowSize / 2,
            width: config.cursorGlowSize,
            height: config.cursorGlowSize,
            background: `radial-gradient(circle, ${config.cursorGlowColor}15 0%, ${config.cursorGlowColor}08 30%, transparent 70%)`,
          }}
        />
      )}

      {config.cursorTrail && trail.map((point, i) => (
        <div
          key={point.id}
          className="pointer-events-none fixed z-[89] rounded-full"
          style={{
            left: point.x - 3,
            top: point.y - 3,
            width: 6,
            height: 6,
            backgroundColor: config.cursorTrailColor,
            opacity: (i / trail.length) * 0.6,
            transform: `scale(${0.3 + (i / trail.length) * 0.7})`,
            transition: "opacity 0.3s",
          }}
        />
      ))}

      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="pointer-events-none fixed z-[89] rounded-full border"
          style={{
            left: ripple.x,
            top: ripple.y,
            borderColor: config.cursorGlowColor || "#d97706",
          }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.6 }}
          animate={{ width: 100, height: 100, x: -50, y: -50, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </>
  );
});

const BackgroundParticles = memo(function BackgroundParticles() {
  const { config } = useGlobalEffects();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    particlesRef.current = Array.from({ length: config.bgParticleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * config.bgParticleSpeed * 0.5,
      vy: (Math.random() - 0.5) * config.bgParticleSpeed * 0.5,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = config.bgParticleColor + Math.round(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = config.bgParticleColor + Math.round((1 - dist / 120) * 30).toString(16).padStart(2, "0");
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [config.bgParticleCount, config.bgParticleColor, config.bgParticleSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden="true"
    />
  );
});

const MatrixRain = memo(function MatrixRain() {
  const { config } = useGlobalEffects();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);
    const chars = "ᐁᐂᐃᐄᐅᐆᐇᐈᐉ01アイウエオカキクケコ♦♣♠♥ABCDEF0123456789".split("");

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const alpha = Math.random() * 0.4 + 0.1;
        ctx.fillStyle = config.bgMatrixColor + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += config.bgMatrixSpeed * 0.5;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [config.bgMatrixSpeed, config.bgMatrixColor]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1] opacity-40"
      aria-hidden="true"
    />
  );
});

const FloatingOrbs = memo(function FloatingOrbs() {
  const { config } = useGlobalEffects();

  const orbs = Array.from({ length: config.bgOrbCount }, (_, i) => ({
    id: i,
    size: 80 + Math.random() * 200,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 15 + Math.random() * 25,
    delay: Math.random() * 10,
    color: i % 3 === 0 ? "#d97706" : i % 3 === 1 ? "#14b8a6" : "#7c3aed",
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden="true">
      {orbs.map(orb => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, ${orb.color}12 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 50, -30, 20, 0],
            y: [0, -40, 30, -20, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

const GridPulse = memo(function GridPulse() {
  const { config } = useGlobalEffects();

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${config.bgGridColor}${Math.round(config.bgGridOpacity * 255).toString(16).padStart(2, "0")} 1px, transparent 1px),
            linear-gradient(90deg, ${config.bgGridColor}${Math.round(config.bgGridOpacity * 255).toString(16).padStart(2, "0")} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${config.bgGridColor}08 0%, transparent 50%)`,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
});

function ScreenOverlays() {
  const { config } = useGlobalEffects();
  const [glitchActive, setGlitchActive] = useState(false);
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const [flickerDim, setFlickerDim] = useState(false);

  useEffect(() => {
    if (!config.glitch) return;
    const id = setInterval(() => {
      if (Math.random() < config.glitchFrequency) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 50 + Math.random() * 100);
      }
    }, 2000);
    return () => clearInterval(id);
  }, [config.glitch, config.glitchFrequency]);

  useEffect(() => {
    if (!config.subliminalFlashes || config.subliminalMessages.length === 0) return;
    const id = setInterval(() => {
      if (Math.random() < 0.03) {
        const msg = config.subliminalMessages[Math.floor(Math.random() * config.subliminalMessages.length)];
        setFlashMsg(msg);
        setTimeout(() => setFlashMsg(null), 80 + Math.random() * 70);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [config.subliminalFlashes, config.subliminalMessages]);

  useEffect(() => {
    if (!config.flickerEnabled) return;
    const id = setInterval(() => {
      if (Math.random() < 0.15) {
        setFlickerDim(true);
        setTimeout(() => setFlickerDim(false), 30 + Math.random() * 60);
      }
    }, Math.max(200, 2000 - config.flickerSpeed * 1500));
    return () => clearInterval(id);
  }, [config.flickerEnabled, config.flickerSpeed]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[95]" aria-hidden="true">
      {config.vignette && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,${config.vignetteIntensity * 0.6}) 70%, rgba(0,0,0,${config.vignetteIntensity}) 100%)`,
          }}
        />
      )}

      {config.scanlines && (
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,${config.scanlineOpacity}) 2px, rgba(0,0,0,${config.scanlineOpacity}) 4px)`,
          }}
        />
      )}

      {config.crt && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)
            `,
            boxShadow: `inset 0 0 ${config.crtCurvature * 20}px rgba(0,0,0,0.2)`,
          }}
        />
      )}

      {config.warmGlow && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, rgba(184,115,51,${config.warmGlowIntensity}) 0%, transparent 60%), radial-gradient(ellipse at center, transparent 50%, rgba(10,5,0,${config.warmGlowIntensity * 0.5}) 100%)`,
          }}
        />
      )}

      {config.noise && (
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: config.noiseOpacity,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          animate={{ opacity: [config.noiseOpacity, config.noiseOpacity * 2, config.noiseOpacity] }}
          transition={{ duration: 0.15, repeat: Infinity }}
        />
      )}

      {config.chromaticAberration && glitchActive && (
        <>
          <div className="absolute inset-0 mix-blend-screen" style={{ background: `rgba(255,0,0,0.03)`, transform: `translateX(${config.chromaticOffset}px)` }} />
          <div className="absolute inset-0 mix-blend-screen" style={{ background: `rgba(0,255,255,0.03)`, transform: `translateX(-${config.chromaticOffset}px)` }} />
        </>
      )}

      <AnimatePresence>
        {glitchActive && config.glitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: config.glitchIntensity }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(${Math.random() * 360}deg, transparent ${40 + Math.random() * 20}%, rgba(184,115,51,0.06) ${50}%, transparent ${60 + Math.random() * 20}%)`,
              }}
            />
            <div
              className="absolute h-[2px] w-full"
              style={{
                top: `${Math.random() * 100}%`,
                background: "rgba(184,115,51,0.15)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flashMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-6xl md:text-9xl font-black text-amber-500/20 tracking-widest font-mono blur-[1px] select-none">
              {flashMsg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {flickerDim && (
        <div className="absolute inset-0 bg-black/20" />
      )}
    </div>
  );
}

export default function GlobalEffectsOverlay() {
  const { config, isEffectActive } = useGlobalEffects();

  if (!isEffectActive) return null;

  return (
    <>
      {(config.cursorGlow || config.cursorTrail || config.cursorRipple) && <CursorEffects />}

      {config.bgParticles && <BackgroundParticles />}
      {config.bgMatrixRain && <MatrixRain />}
      {config.bgFloatingOrbs && <FloatingOrbs />}
      {config.bgGridPulse && <GridPulse />}

      <ScreenOverlays />
    </>
  );
}
