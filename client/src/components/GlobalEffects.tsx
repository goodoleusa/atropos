import { useEffect, useRef, useState, useCallback } from 'react';
import { useEffectsStore } from '@/stores/useEffectsStore';

export function GlobalEffects() {
  const background = useEffectsStore((state) => state.background);
  const mouse = useEffectsStore((state) => state.mouse);
  const glitch = useEffectsStore((state) => state.glitch);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = useState(false);
  const [flickerOpacity, setFlickerOpacity] = useState(0);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const [rgbOffset, setRgbOffset] = useState({ r: 0, g: 0, b: 0 });
  const [pulsePhase, setPulsePhase] = useState(0);
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number }>>([]);
  const [corruptBlocks, setCorruptBlocks] = useState<Array<{ id: number; x: number; y: number; w: number; h: number }>>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matrixChars = useRef<number[]>([]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Glitch pulse - random bursts
  useEffect(() => {
    if (!glitch.textGlitch && !glitch.rgbSplit) return;
    
    const glitchPulse = () => {
      if (Math.random() > 0.92) {
        setGlitchActive(true);
        setRgbOffset({
          r: (Math.random() - 0.5) * 8,
          g: (Math.random() - 0.5) * 8,
          b: (Math.random() - 0.5) * 8
        });
        setTimeout(() => {
          setGlitchActive(false);
          setRgbOffset({ r: 0, g: 0, b: 0 });
        }, 50 + Math.random() * 150);
      }
    };
    
    const interval = setInterval(glitchPulse, 100);
    return () => clearInterval(interval);
  }, [glitch.textGlitch, glitch.rgbSplit]);

  // Screen shake bursts
  useEffect(() => {
    if (!glitch.screenShake) return;
    
    const shakeBurst = () => {
      if (Math.random() > 0.95) {
        const intensity = 2 + Math.random() * 4;
        const duration = 100 + Math.random() * 200;
        const startTime = Date.now();
        
        const shakeFrame = () => {
          const elapsed = Date.now() - startTime;
          if (elapsed < duration) {
            const decay = 1 - (elapsed / duration);
            setShakeOffset({
              x: (Math.random() - 0.5) * intensity * decay,
              y: (Math.random() - 0.5) * intensity * decay
            });
            requestAnimationFrame(shakeFrame);
          } else {
            setShakeOffset({ x: 0, y: 0 });
          }
        };
        shakeFrame();
      }
    };
    
    const interval = setInterval(shakeBurst, 200);
    return () => clearInterval(interval);
  }, [glitch.screenShake]);

  // Flicker effect
  useEffect(() => {
    if (!glitch.flicker) return;
    
    const flicker = () => {
      if (Math.random() > 0.97) {
        setFlickerOpacity(0.1 + Math.random() * 0.2);
        setTimeout(() => setFlickerOpacity(0), 30 + Math.random() * 70);
      }
    };
    
    const interval = setInterval(flicker, 50);
    return () => clearInterval(interval);
  }, [glitch.flicker]);

  // Grid pulse animation
  useEffect(() => {
    if (!background.gridPulse) return;
    
    const animate = () => {
      setPulsePhase(p => (p + 0.02) % (Math.PI * 2));
    };
    
    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [background.gridPulse]);

  // Bubble particles
  useEffect(() => {
    if (!mouse.cursorTrail) return;
    
    const spawnBubble = () => {
      if (mousePos.x === 0 && mousePos.y === 0) return;
      
      const newBubble = {
        id: Date.now() + Math.random(),
        x: mousePos.x + (Math.random() - 0.5) * 40,
        y: mousePos.y + (Math.random() - 0.5) * 40,
        size: 4 + Math.random() * 12,
        opacity: 0.6 + Math.random() * 0.4
      };
      
      setBubbles(prev => [...prev.slice(-15), newBubble]);
    };
    
    const interval = setInterval(spawnBubble, 80);
    
    // Fade out bubbles
    const fadeInterval = setInterval(() => {
      setBubbles(prev => prev
        .map(b => ({ ...b, opacity: b.opacity - 0.08, y: b.y - 2 }))
        .filter(b => b.opacity > 0)
      );
    }, 50);
    
    return () => {
      clearInterval(interval);
      clearInterval(fadeInterval);
    };
  }, [mouse.cursorTrail, mousePos]);

  // Corrupted pixel blocks
  useEffect(() => {
    if (!glitch.corruptedPixels) return;
    
    const spawnCorruption = () => {
      if (Math.random() > 0.9) {
        const newBlock = {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          w: 20 + Math.random() * 100,
          h: 2 + Math.random() * 6
        };
        
        setCorruptBlocks(prev => [...prev, newBlock]);
        
        setTimeout(() => {
          setCorruptBlocks(prev => prev.filter(b => b.id !== newBlock.id));
        }, 100 + Math.random() * 300);
      }
    };
    
    const interval = setInterval(spawnCorruption, 150);
    return () => clearInterval(interval);
  }, [glitch.corruptedPixels]);

  // Matrix rain canvas
  useEffect(() => {
    if (!background.matrixRain || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.floor(canvas.width / 16);
      matrixChars.current = Array(cols).fill(0);
    };
    resize();
    window.addEventListener('resize', resize);
    
    const chars = 'ネクサス01アイ量子'.split('');
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = '14px monospace';
      
      matrixChars.current.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 16;
        
        // Gradient from amber to teal
        const hue = 35 + (y % 50);
        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.fillText(char, x, y);
        
        if (y > canvas.height && Math.random() > 0.98) {
          matrixChars.current[i] = 0;
        } else {
          matrixChars.current[i] = y + 16;
        }
      });
    };
    
    const interval = setInterval(draw, 45);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, [background.matrixRain]);

  // Apply shake to body
  useEffect(() => {
    if (shakeOffset.x !== 0 || shakeOffset.y !== 0) {
      document.body.style.transform = `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`;
    } else {
      document.body.style.transform = '';
    }
  }, [shakeOffset]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9990] overflow-hidden">
      {/* Scanlines - subtle animated */}
      {background.scanlines && (
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
            animation: 'scanlineMove 8s linear infinite',
          }}
        />
      )}
      
      {/* Noise grain - flashing in/out */}
      {background.noiseTexture && (
        <div 
          className="absolute inset-0"
          style={{
            opacity: 0.02 + Math.sin(Date.now() / 200) * 0.01,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            animation: 'noiseFlash 0.1s steps(2) infinite',
          }}
        />
      )}
      
      {/* Vignette */}
      {background.vignette && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          }}
        />
      )}
      
      {/* Grid pulse */}
      {background.gridPulse && (
        <div 
          className="absolute inset-0"
          style={{
            opacity: 0.03 + Math.sin(pulsePhase) * 0.02,
            backgroundImage: `
              linear-gradient(rgba(217, 119, 6, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(217, 119, 6, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: `scale(${1 + Math.sin(pulsePhase) * 0.01})`,
          }}
        />
      )}
      
      {/* Matrix rain canvas */}
      {background.matrixRain && (
        <canvas ref={canvasRef} className="absolute inset-0 opacity-25" />
      )}
      
      {/* CRT curvature overlay */}
      {background.crtCurvature && (
        <div 
          className="absolute inset-0"
          style={{
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5), inset 0 0 200px rgba(0,0,0,0.3)',
            borderRadius: '10px',
          }}
        />
      )}
      
      {/* Mouse glow - parallax follow */}
      {mouse.glowFollow && (
        <div 
          className="absolute rounded-full blur-3xl"
          style={{
            left: mousePos.x - 150,
            top: mousePos.y - 150,
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%)',
            transform: `translate(${(mousePos.x - window.innerWidth/2) * 0.02}px, ${(mousePos.y - window.innerHeight/2) * 0.02}px)`,
            transition: 'left 0.15s ease-out, top 0.15s ease-out',
          }}
        />
      )}
      
      {/* Lens distortion spotlight */}
      {mouse.lensDistortion && (
        <div 
          className="absolute rounded-full"
          style={{
            left: mousePos.x - 80,
            top: mousePos.y - 80,
            width: 160,
            height: 160,
            background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 50%)',
            boxShadow: '0 0 40px rgba(20,184,166,0.1)',
            transition: 'left 0.08s, top 0.08s',
          }}
        />
      )}
      
      {/* Bubble particles */}
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="absolute rounded-full border border-amber-500/30"
          style={{
            left: bubble.x - bubble.size/2,
            top: bubble.y - bubble.size/2,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity,
            background: 'radial-gradient(circle at 30% 30%, rgba(217,119,6,0.3), transparent)',
          }}
        />
      ))}
      
      {/* RGB split / chromatic aberration flash */}
      {glitch.rgbSplit && glitchActive && (
        <>
          <div 
            className="absolute inset-0 mix-blend-screen opacity-30"
            style={{ 
              background: 'rgba(255,0,0,0.1)',
              transform: `translateX(${rgbOffset.r}px)`,
            }}
          />
          <div 
            className="absolute inset-0 mix-blend-screen opacity-30"
            style={{ 
              background: 'rgba(0,255,255,0.1)',
              transform: `translateX(${rgbOffset.b}px)`,
            }}
          />
        </>
      )}
      
      {/* Flicker flash */}
      {glitch.flicker && flickerOpacity > 0 && (
        <div 
          className="absolute inset-0 bg-white"
          style={{ opacity: flickerOpacity }}
        />
      )}
      
      {/* Corrupted pixel blocks */}
      {corruptBlocks.map(block => (
        <div
          key={block.id}
          className="absolute"
          style={{
            left: block.x,
            top: block.y,
            width: block.w,
            height: block.h,
            background: `linear-gradient(90deg, 
              rgba(217,119,6,0.5) 0%, 
              rgba(20,184,166,0.5) ${Math.random() * 50}%, 
              rgba(168,85,247,0.5) 100%
            )`,
            mixBlendMode: 'screen',
          }}
        />
      ))}
      
      {/* Data mosh effect - horizontal slice displacement */}
      {glitch.dataMosh && glitchActive && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full bg-amber-500/10"
              style={{
                top: `${20 + i * 15 + Math.random() * 10}%`,
                height: `${2 + Math.random() * 4}px`,
                transform: `translateX(${(Math.random() - 0.5) * 50}px)`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Click ripple effect */}
      {mouse.rippleClick && (
        <style>{`
          @keyframes clickRipple {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
          }
        `}</style>
      )}
      
      {/* Animation keyframes */}
      <style>{`
        @keyframes scanlineMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 100px; }
        }
        @keyframes noiseFlash {
          0% { opacity: 0.02; }
          50% { opacity: 0.04; }
          100% { opacity: 0.02; }
        }
      `}</style>
    </div>
  );
}

export const EFFECT_SUGGESTIONS = {
  terminal: {
    recommended: ['scanlines', 'textGlitch', 'vignette'],
    description: 'Classic CRT terminal feel',
  },
  homepage: {
    recommended: ['gridPulse', 'vignette', 'glowFollow'],
    description: 'Polished cyberpunk landing',
  },
  investigation: {
    recommended: ['scanlines', 'vignette', 'rippleClick'],
    description: 'Focused workspace',
  },
  theVoid: {
    recommended: ['matrixRain', 'rgbSplit', 'flicker', 'corruptedPixels', 'screenShake'],
    description: 'Maximum glitchcore chaos',
  },
  agents: {
    recommended: ['gradientOverlay', 'lensDistortion', 'glowFollow'],
    description: 'AI interface',
  },
  admin: {
    recommended: ['scanlines', 'vignette'],
    description: 'Clean control panel',
  },
};
