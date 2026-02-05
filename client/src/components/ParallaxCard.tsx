import { useState, useEffect, useRef, ReactNode } from 'react';
import Atropos from 'atropos/react';
import 'atropos/css';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameSession';

interface ParallaxCardProps {
  children: ReactNode;
  className?: string;
  shadow?: boolean;
  highlight?: boolean;
  rotateXMax?: number;
  rotateYMax?: number;
  activeOffset?: number;
}

export function ParallaxCard({ 
  children, 
  className = '',
  shadow = true,
  highlight = true,
  rotateXMax = 15,
  rotateYMax = 15,
  activeOffset = 40
}: ParallaxCardProps) {
  return (
    <Atropos
      className={`atropos-card ${className}`}
      shadow={shadow}
      highlight={highlight}
      rotateXMax={rotateXMax}
      rotateYMax={rotateYMax}
      activeOffset={activeOffset}
    >
      {children}
    </Atropos>
  );
}

interface ParallaxLayerProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

export function ParallaxLayer({ children, offset = 0, className = '' }: ParallaxLayerProps) {
  return (
    <div data-atropos-offset={offset} className={className}>
      {children}
    </div>
  );
}

interface ParallaxHeroProps {
  backgroundImage?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function ParallaxHero({ backgroundImage, title, subtitle, className = '' }: ParallaxHeroProps) {
  return (
    <Atropos
      className={`parallax-hero w-full ${className}`}
      shadow={true}
      highlight={true}
      rotateXMax={8}
      rotateYMax={8}
      activeOffset={50}
    >
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-gradient-to-br from-amber-950/50 to-stone-950">
        {backgroundImage && (
          <img 
            src={backgroundImage} 
            alt="" 
            data-atropos-offset="-3"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div 
          data-atropos-offset="0"
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
        />
        <div 
          data-atropos-offset="5"
          className="absolute bottom-8 left-8 right-8"
        >
          <h2 className="font-orbitron text-3xl md:text-5xl font-bold text-amber-500 mb-2">
            {title}
          </h2>
          {subtitle && (
            <p data-atropos-offset="8" className="text-stone-400 text-lg">
              {subtitle}
            </p>
          )}
        </div>
        <div 
          data-atropos-offset="10"
          className="absolute top-4 right-4 w-16 h-16 border border-amber-600/30 rounded-lg opacity-50"
        />
        <div 
          data-atropos-offset="7"
          className="absolute top-8 right-8 w-8 h-8 border border-teal-600/30 rounded-full opacity-30"
        />
      </div>
    </Atropos>
  );
}

interface ParallaxMissionCardProps {
  missionName: string;
  codename: string;
  status: 'active' | 'pending' | 'complete' | 'classified';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  description: string;
  clueCount?: number;
  onClick?: () => void;
}

export function ParallaxMissionCard({ 
  missionName, 
  codename, 
  status, 
  difficulty, 
  description,
  clueCount = 0,
  onClick 
}: ParallaxMissionCardProps) {
  const statusColors = {
    active: 'bg-teal-500/20 text-teal-400 border-teal-500/50',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    complete: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    classified: 'bg-red-500/20 text-red-400 border-red-500/50'
  };

  const difficultyColors = {
    easy: 'text-emerald-400',
    medium: 'text-amber-400',
    hard: 'text-orange-400',
    expert: 'text-red-400'
  };

  return (
    <Atropos
      className="mission-card cursor-pointer"
      shadow={true}
      highlight={true}
      rotateXMax={12}
      rotateYMax={12}
      activeOffset={35}
      onClick={onClick}
    >
      <div className="relative bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-900/30 rounded-lg p-6 min-h-[200px] hover:border-amber-600/50 transition-colors">
        <div data-atropos-offset="-2" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(217,119,6,0.1),transparent_50%)] rounded-lg" />
        
        <div data-atropos-offset="2" className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${statusColors[status]}`}>
              {status}
            </span>
            <span className={`text-xs font-mono ${difficultyColors[difficulty]}`}>
              {difficulty.toUpperCase()}
            </span>
          </div>
          
          <h3 data-atropos-offset="4" className="font-orbitron text-lg font-bold text-amber-500 mb-1">
            {missionName}
          </h3>
          
          <p data-atropos-offset="3" className="text-xs font-mono text-stone-600 mb-3">
            CODENAME: {codename}
          </p>
          
          <p data-atropos-offset="2" className="text-sm text-stone-400 line-clamp-2 mb-4">
            {description}
          </p>
          
          {clueCount > 0 && (
            <div data-atropos-offset="5" className="flex items-center gap-2 text-xs text-teal-400">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              {clueCount} clues available
            </div>
          )}
        </div>
        
        <div data-atropos-offset="8" className="absolute bottom-2 right-2 text-amber-900/30 text-4xl font-orbitron font-bold">
          ⬡
        </div>
      </div>
    </Atropos>
  );
}

// ============================================
// HIDDEN CLUE REVEAL EFFECTS
// ============================================

interface HiddenClueRevealProps {
  visibleContent: ReactNode;
  hiddenClue: {
    id: string;
    name: string;
    content: string;
    hint?: string;
  };
  revealMethod: 'hover' | 'hold' | 'tilt' | 'scratch';
  holdDuration?: number;
  className?: string;
}

export function HiddenClueReveal({ 
  visibleContent, 
  hiddenClue, 
  revealMethod = 'hover',
  holdDuration = 2000,
  className = ''
}: HiddenClueRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [collected, setCollected] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const { collectClue, hasClue } = useGame();

  useEffect(() => {
    if (hasClue(hiddenClue.id)) {
      setCollected(true);
    }
  }, [hasClue, hiddenClue.id]);

  const startHold = () => {
    if (revealMethod !== 'hold') return;
    
    progressRef.current = setInterval(() => {
      setHoldProgress(prev => Math.min(100, prev + (100 / (holdDuration / 50))));
    }, 50);
    
    holdTimerRef.current = setTimeout(() => {
      setRevealed(true);
      handleCollect();
    }, holdDuration);
  };

  const endHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setHoldProgress(0);
  };

  const handleCollect = () => {
    if (!collected && !hasClue(hiddenClue.id)) {
      collectClue({
        id: hiddenClue.id,
        name: hiddenClue.name,
        description: hiddenClue.hint || 'A hidden clue discovered through exploration',
        content: hiddenClue.content,
        foundAt: new Date().toISOString()
      });
      setCollected(true);
    }
  };

  const handleMouseEnter = () => {
    if (revealMethod === 'hover') {
      setRevealed(true);
      handleCollect();
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => revealMethod === 'hover' && setRevealed(false)}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      data-testid={`hidden-clue-${hiddenClue.id}`}
    >
      {/* Visible Content */}
      <div className={`transition-all duration-300 ${revealed ? 'opacity-30 blur-sm' : ''}`}>
        {visibleContent}
      </div>

      {/* Hold Progress Bar */}
      {revealMethod === 'hold' && holdProgress > 0 && !revealed && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${holdProgress}%` }}
          />
        </div>
      )}

      {/* Hidden Clue Overlay */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md rounded-lg border border-amber-500/50"
          >
            <div className="text-center">
              <span className="text-[10px] text-teal-400 uppercase tracking-wider">
                {collected ? '✓ COLLECTED' : 'CLUE DISCOVERED'}
              </span>
              <h4 className="text-amber-500 font-orbitron font-bold mt-1">{hiddenClue.name}</h4>
              <p className="text-stone-300 text-sm mt-2 font-mono">{hiddenClue.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint indicator for hold method */}
      {revealMethod === 'hold' && !revealed && (
        <div className="absolute top-1 right-1 text-[8px] text-amber-600/50 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          HOLD TO REVEAL
        </div>
      )}
    </div>
  );
}

// ============================================
// SCRATCH TO REVEAL
// ============================================

interface ScratchRevealProps {
  hiddenContent: ReactNode;
  coverImage?: string;
  clueId?: string;
  onReveal?: () => void;
  className?: string;
}

export function ScratchReveal({ 
  hiddenContent, 
  coverImage,
  clueId,
  onReveal,
  className = ''
}: ScratchRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with scratch-off pattern
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise texture
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 50 + 20}, ${Math.random() * 30 + 10}, 0, 0.3)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    // Add text hint
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2);
  }, []);

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Check reveal progress
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 128) transparent++;
    }
    const progress = (transparent / (imageData.data.length / 4)) * 100;
    setScratchProgress(progress);

    if (progress > 60 && !isRevealed) {
      setIsRevealed(true);
      onReveal?.();
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Hidden content underneath */}
      <div className="p-4 bg-gradient-to-br from-amber-950/50 to-stone-950 min-h-[120px] flex items-center justify-center">
        {hiddenContent}
      </div>

      {/* Scratch overlay */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          width={300}
          height={120}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          onMouseDown={() => isDrawing.current = true}
          onMouseUp={() => isDrawing.current = false}
          onMouseLeave={() => isDrawing.current = false}
          onMouseMove={scratch}
          onTouchStart={() => isDrawing.current = true}
          onTouchEnd={() => isDrawing.current = false}
          onTouchMove={scratch}
        />
      )}

      {/* Progress indicator */}
      {!isRevealed && scratchProgress > 0 && (
        <div className="absolute bottom-2 left-2 right-2 h-1 bg-stone-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all"
            style={{ width: `${Math.min(100, scratchProgress * 1.5)}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// GLITCH TEXT REVEAL
// ============================================

interface GlitchRevealProps {
  normalText: string;
  hiddenText: string;
  triggerOnHover?: boolean;
  autoGlitch?: boolean;
  glitchInterval?: number;
  className?: string;
}

export function GlitchReveal({
  normalText,
  hiddenText,
  triggerOnHover = true,
  autoGlitch = false,
  glitchInterval = 5000,
  className = ''
}: GlitchRevealProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  const [displayText, setDisplayText] = useState(normalText);

  useEffect(() => {
    if (!autoGlitch) return;
    
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 500);
    }, glitchInterval);

    return () => clearInterval(interval);
  }, [autoGlitch, glitchInterval]);

  useEffect(() => {
    if (isGlitching) {
      // Rapid text switching effect
      let count = 0;
      const glitchEffect = setInterval(() => {
        setDisplayText(count % 2 === 0 ? hiddenText : normalText);
        count++;
        if (count > 6) {
          clearInterval(glitchEffect);
          setDisplayText(normalText);
        }
      }, 80);
      return () => clearInterval(glitchEffect);
    }
  }, [isGlitching, normalText, hiddenText]);

  return (
    <span 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => triggerOnHover && setIsGlitching(true)}
    >
      <span className={`${isGlitching ? 'animate-pulse text-teal-400' : ''} transition-colors`}>
        {displayText}
      </span>
      {isGlitching && (
        <>
          <span className="absolute inset-0 text-red-500/50 translate-x-[2px] translate-y-[1px] clip-glitch-1">
            {displayText}
          </span>
          <span className="absolute inset-0 text-cyan-500/50 -translate-x-[2px] -translate-y-[1px] clip-glitch-2">
            {displayText}
          </span>
        </>
      )}
    </span>
  );
}

// ============================================
// TILT REVEAL (Uses Atropos angle)
// ============================================

interface TiltRevealProps {
  children: ReactNode;
  hiddenClue: {
    id: string;
    name: string;
    content: string;
  };
  revealAngle?: number;
  className?: string;
}

export function TiltReveal({
  children,
  hiddenClue,
  revealAngle = 12,
  className = ''
}: TiltRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const { collectClue, hasClue } = useGame();

  const handleRotate = (x: number, y: number) => {
    const angle = Math.sqrt(x * x + y * y);
    if (angle >= revealAngle && !revealed) {
      setRevealed(true);
      if (!hasClue(hiddenClue.id)) {
        collectClue({
          id: hiddenClue.id,
          name: hiddenClue.name,
          description: 'Discovered by tilting the card at an extreme angle',
          content: hiddenClue.content,
          foundAt: new Date().toISOString()
        });
      }
    }
  };

  return (
    <Atropos
      className={className}
      rotateXMax={15}
      rotateYMax={15}
      onRotate={(x, y) => handleRotate(x, y)}
    >
      <div className="relative">
        {children}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-purple-950/90 backdrop-blur rounded-lg p-4"
            >
              <div className="text-center">
                <span className="text-purple-400 text-xs uppercase tracking-wider">ANGLE UNLOCKED</span>
                <h4 className="text-amber-400 font-orbitron font-bold mt-1">{hiddenClue.name}</h4>
                <p className="text-stone-300 text-sm mt-2">{hiddenClue.content}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Atropos>
  );
}

// ============================================
// MOUSE SPOTLIGHT EFFECT
// ============================================

interface SpotlightRevealProps {
  children: ReactNode;
  hiddenElements: Array<{
    x: number;  // percentage position
    y: number;
    content: string;
    clueId?: string;
  }>;
  spotlightRadius?: number;
  className?: string;
}

export function SpotlightReveal({
  children,
  hiddenElements,
  spotlightRadius = 60,
  className = ''
}: SpotlightRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [visibleElements, setVisibleElements] = useState<Set<number>>(new Set());
  const { collectClue, hasClue } = useGame();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });

    // Check if spotlight reveals any hidden elements
    hiddenElements.forEach((elem, index) => {
      const distance = Math.sqrt(Math.pow(x - elem.x, 2) + Math.pow(y - elem.y, 2));
      if (distance < (spotlightRadius / 3) && !visibleElements.has(index)) {
        setVisibleElements(prev => new Set(Array.from(prev).concat([index])));
        if (elem.clueId && !hasClue(elem.clueId)) {
          collectClue({
            id: elem.clueId,
            name: `Hidden Fragment ${index + 1}`,
            description: 'Discovered with the spotlight',
            content: elem.content,
            foundAt: new Date().toISOString()
          });
        }
      }
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden cursor-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: -100, y: -100 })}
    >
      {children}

      {/* Spotlight effect */}
      <div 
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle ${spotlightRadius}px at ${mousePos.x}% ${mousePos.y}%, transparent 0%, rgba(0,0,0,0.95) 100%)`
        }}
      />

      {/* Hidden elements revealed by spotlight */}
      {hiddenElements.map((elem, index) => (
        <motion.div
          key={index}
          className="absolute text-xs font-mono text-amber-400 pointer-events-none"
          style={{ left: `${elem.x}%`, top: `${elem.y}%`, transform: 'translate(-50%, -50%)' }}
          animate={{
            opacity: visibleElements.has(index) ? 1 : 
              (Math.sqrt(Math.pow(mousePos.x - elem.x, 2) + Math.pow(mousePos.y - elem.y, 2)) < spotlightRadius / 2 ? 0.8 : 0)
          }}
        >
          {elem.content}
        </motion.div>
      ))}

      {/* Custom cursor */}
      <div 
        className="pointer-events-none absolute w-4 h-4 border-2 border-amber-500 rounded-full transition-transform"
        style={{ 
          left: `${mousePos.x}%`, 
          top: `${mousePos.y}%`, 
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 20px rgba(217, 119, 6, 0.5)'
        }}
      />
    </div>
  );
}

// ============================================
// QUANTUM RIPPLE DISTORTION EFFECT
// ============================================

interface QuantumRippleProps {
  children: ReactNode;
  artifactLocations?: Array<{ x: number; y: number; clueId: string; intensity?: number }>;
  onArtifactDetected?: (clueId: string) => void;
  className?: string;
}

export function QuantumRipple({
  children,
  artifactLocations = [],
  onArtifactDetected,
  className = ''
}: QuantumRippleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; intensity: number }>>([]);
  const [distortionLevel, setDistortionLevel] = useState(0);
  const [nearbyArtifact, setNearbyArtifact] = useState<string | null>(null);
  const rippleIdRef = useRef(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });

    // Calculate distortion based on proximity to artifacts
    let maxDistortion = 0;
    let closestArtifact: string | null = null;

    artifactLocations.forEach(artifact => {
      const distance = Math.sqrt(Math.pow(x - artifact.x, 2) + Math.pow(y - artifact.y, 2));
      const intensity = artifact.intensity || 1;
      
      // Distortion increases as you get closer
      if (distance < 30) {
        const distortion = ((30 - distance) / 30) * intensity;
        if (distortion > maxDistortion) {
          maxDistortion = distortion;
          closestArtifact = artifact.clueId;
        }
        
        // Trigger ripple when very close
        if (distance < 10 && Math.random() > 0.7) {
          addRipple(artifact.x, artifact.y, intensity);
        }
      }
    });

    setDistortionLevel(maxDistortion);
    
    if (closestArtifact !== nearbyArtifact) {
      setNearbyArtifact(closestArtifact);
      if (closestArtifact) {
        onArtifactDetected?.(closestArtifact);
      }
    }
  };

  const addRipple = (x: number, y: number, intensity: number) => {
    const id = rippleIdRef.current++;
    setRipples(prev => [...prev, { id, x, y, intensity }]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1500);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    addRipple(x, y, 0.5 + distortionLevel);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        filter: distortionLevel > 0 ? `blur(${distortionLevel * 0.5}px) hue-rotate(${distortionLevel * 20}deg)` : 'none',
        transition: 'filter 0.2s ease-out'
      }}
    >
      {children}

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <div 
            className="w-20 h-20 -ml-10 -mt-10 rounded-full border-2 border-purple-500/50"
            style={{ boxShadow: `0 0 ${20 * ripple.intensity}px rgba(168, 85, 247, ${0.3 * ripple.intensity})` }}
          />
        </motion.div>
      ))}

      {/* Quantum field distortion overlay */}
      {distortionLevel > 0.3 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: distortionLevel * 0.5 }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)`,
              mixBlendMode: 'screen'
            }}
          />
        </motion.div>
      )}

      {/* Artifact proximity indicator */}
      <AnimatePresence>
        {nearbyArtifact && distortionLevel > 0.5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-950/90 border border-purple-500/50 rounded-full text-xs text-purple-300 font-mono"
          >
            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2" />
            QUANTUM ANOMALY DETECTED
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// DISTORTION LENS EFFECT
// ============================================

interface DistortionLensProps {
  children: ReactNode;
  lensSize?: number;
  distortionStrength?: number;
  className?: string;
}

export function DistortionLens({
  children,
  lensSize = 100,
  distortionStrength = 1.5,
  className = ''
}: DistortionLensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [isActive, setIsActive] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => { setIsActive(false); setMousePos({ x: -200, y: -200 }); }}
    >
      {children}

      {/* Lens magnification effect using clip-path and scale */}
      {isActive && (
        <div
          className="absolute pointer-events-none overflow-hidden rounded-full border border-amber-500/30"
          style={{
            width: lensSize,
            height: lensSize,
            left: mousePos.x - lensSize / 2,
            top: mousePos.y - lensSize / 2,
            background: 'rgba(217, 119, 6, 0.05)',
            boxShadow: 'inset 0 0 20px rgba(217, 119, 6, 0.2), 0 0 30px rgba(217, 119, 6, 0.1)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '100vw',
              height: '100vh',
              left: -(mousePos.x - lensSize / 2),
              top: -(mousePos.y - lensSize / 2),
              transform: `scale(${distortionStrength})`,
              transformOrigin: `${mousePos.x}px ${mousePos.y}px`,
              pointerEvents: 'none'
            }}
          >
            {children}
          </div>
        </div>
      )}

      {/* Subtle glow around cursor */}
      {isActive && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: lensSize * 1.5,
            height: lensSize * 1.5,
            left: mousePos.x - (lensSize * 1.5) / 2,
            top: mousePos.y - (lensSize * 1.5) / 2,
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.1) 0%, transparent 70%)',
            mixBlendMode: 'screen'
          }}
        />
      )}
    </div>
  );
}

// ============================================
// SCANLINE CRT EFFECT
// ============================================

interface ScanlineOverlayProps {
  intensity?: number;
  animated?: boolean;
  className?: string;
}

export function ScanlineOverlay({
  intensity = 0.1,
  animated = true,
  className = ''
}: ScanlineOverlayProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-50 ${className}`}>
      {/* Horizontal scanlines */}
      <div 
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, ${intensity}) 2px,
            rgba(0, 0, 0, ${intensity}) 4px
          )`
        }}
      />
      
      {/* Animated scan bar */}
      {animated && (
        <motion.div
          className="absolute left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.3), transparent)`,
            boxShadow: '0 0 10px rgba(217, 119, 6, 0.5)'
          }}
          animate={{
            top: ['0%', '100%']
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.4) 100%)'
        }}
      />
    </div>
  );
}

// ============================================
// CHROMATIC ABERRATION TEXT
// ============================================

interface ChromaticTextProps {
  text: string;
  active?: boolean;
  className?: string;
}

export function ChromaticText({
  text,
  active = true,
  className = ''
}: ChromaticTextProps) {
  if (!active) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span 
        className="absolute inset-0 text-red-500/50" 
        style={{ transform: 'translate(-1px, 0)' }}
        aria-hidden="true"
      >
        {text}
      </span>
      <span 
        className="absolute inset-0 text-cyan-500/50" 
        style={{ transform: 'translate(1px, 0)' }}
        aria-hidden="true"
      >
        {text}
      </span>
    </span>
  );
}
