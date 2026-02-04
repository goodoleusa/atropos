import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameSession';
import { QUANTUM_EVENTS, QUANTUM_MESSAGES } from '@/config/quantumConfig';

interface QuantumState {
  probability: number;
  collapsed: boolean;
  outcome: string | null;
  entropy: number;
}

interface ProbabilityEvent {
  id: string;
  name: string;
  description: string;
  baseProb: number;
  currentProb: number;
  modifiers: string[];
}

const DEFAULT_EVENTS: ProbabilityEvent[] = QUANTUM_EVENTS.map(event => ({
  ...event,
  baseProb: event.baseProb / 100,
  currentProb: event.baseProb / 100,
  modifiers: []
}));

export const QuantumField = () => {
  const { gameState, collectClue } = useGame();
  const [quantumMessages, setQuantumMessages] = useState<string[]>(QUANTUM_MESSAGES);
  const [probabilityEvents, setProbabilityEvents] = useState<ProbabilityEvent[]>(DEFAULT_EVENTS);
  const [quantumState, setQuantumState] = useState<QuantumState>({
    probability: 0.5,
    collapsed: false,
    outcome: null,
    entropy: Math.random()
  });
  const [activeEvent, setActiveEvent] = useState<ProbabilityEvent | null>(null);
  const [showMeter, setShowMeter] = useState(false);

  useEffect(() => {
    const loadQuantumConfig = async () => {
      try {
        const [messagesRes, eventsRes] = await Promise.all([
          fetch('/api/quantum/messages'),
          fetch('/api/quantum/events')
        ]);

        if (messagesRes.ok) {
          const messages = await messagesRes.json();
          const enabledMessages = messages
            .filter((m: { enabled?: boolean }) => m.enabled !== false)
            .map((m: { message: string }) => m.message);
          if (enabledMessages.length > 0) {
            setQuantumMessages(enabledMessages);
          }
        }

        if (eventsRes.ok) {
          const events = await eventsRes.json();
          const enabledEvents = events
            .filter((e: { enabled?: boolean }) => e.enabled !== false)
            .map((e: { id: string; name: string; description: string; baseProb: number }) => ({
              id: e.id,
              name: e.name,
              description: e.description,
              baseProb: Math.max(0, Math.min(1, (e.baseProb || 0) / 100)),
              currentProb: Math.max(0, Math.min(1, (e.baseProb || 0) / 100)),
              modifiers: []
            }));
          if (enabledEvents.length > 0) {
            setProbabilityEvents(enabledEvents);
          }
        }
      } catch (error) {
        console.error('Failed to load quantum config:', error);
      }
    };

    loadQuantumConfig();
  }, []);
  // Calculate probability modifiers based on player actions
  const calculateModifiers = useCallback(() => {
    const clueCount = gameState.inventory.length;
    const modifiers: Record<string, number> = {
      'clue-spawn': 0.15 + (clueCount * 0.02), // More clues = higher chance of finding more
      'glitch-surge': 0.08 + (clueCount * 0.01),
      'oracle-vision': 0.12 + (clueCount * 0.015),
      'path-reveal': 0.05 + (clueCount * 0.025), // Significant boost with more clues
    };
    return modifiers;
  }, [gameState.inventory.length]);

  // Quantum fluctuation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumState(prev => ({
        ...prev,
        entropy: Math.random(),
        probability: 0.5 + (Math.random() - 0.5) * 0.3
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Probability collapse events
  useEffect(() => {
    if (probabilityEvents.length === 0) return;

    const modifiers = calculateModifiers();

    const collapseInterval = setInterval(() => {
      const roll = Math.random();

      for (const event of probabilityEvents) {
        const adjustedProb = modifiers[event.id] || event.baseProb;

        if (roll < adjustedProb * 0.1) { // 10% of adjusted probability per check
          setActiveEvent({ ...event, currentProb: adjustedProb });
          setQuantumState(prev => ({
            ...prev,
            collapsed: true,
            outcome: event.name
          }));

          setTimeout(() => {
            setActiveEvent(null);
            setQuantumState(prev => ({
              ...prev,
              collapsed: false,
              outcome: null
            }));
          }, 5000);

          break;
        }
      }
    }, 20000);

    return () => clearInterval(collapseInterval);
  }, [calculateModifiers, probabilityEvents]);

  const handleCollectEvent = () => {
    if (!activeEvent) return;
    
    const clueId = `quantum-${activeEvent.id}-${Date.now()}`;
    
    collectClue({
      id: clueId,
      name: `Quantum: ${activeEvent.name}`,
      description: activeEvent.description,
      content: `Probability collapsed at ${(activeEvent.currentProb * 100).toFixed(1)}%. ${quantumMessages[Math.floor(Math.random() * quantumMessages.length)] || 'Quantum fluctuation detected.'}`,
      foundAt: new Date().toISOString()
    });
    
    setActiveEvent(null);
  };

  return (
    <>
      {/* Probability Field Indicator - Subtle corner element (hidden on mobile) */}
      <div 
        className="hidden md:block fixed bottom-4 left-20 z-40 cursor-pointer group"
        onClick={() => setShowMeter(!showMeter)}
        data-testid="quantum-indicator"
      >
        <div className="relative">
          {/* Pulsing quantum core */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600/30 to-purple-600/30 border border-amber-700/50"
          />
          
          {/* Orbiting particles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-amber-500 rounded-full transform -translate-x-1/2 -translate-y-1" />
          </motion.div>
          
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-500 rounded-full transform -translate-x-1/2 translate-y-1" />
          </motion.div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black/90 border border-amber-900/50 px-2 py-1 text-xs font-mono text-amber-600 whitespace-nowrap rounded">
            Ψ = {quantumState.probability.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Expanded Probability Meter */}
      <AnimatePresence>
        {showMeter && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="hidden md:block fixed bottom-16 left-20 z-40 w-64 bg-[#0a0500]/95 border border-amber-900/50 rounded-lg p-4 backdrop-blur-md"
          >
            <h3 className="text-amber-600 font-orbitron text-sm mb-3 flex items-center gap-2">
              <span className="text-purple-500">Ψ</span> QUANTUM STATE
            </h3>
            
            <div className="space-y-3 text-xs font-mono">
              {/* Wave Function */}
              <div>
                <div className="flex justify-between text-stone-500 mb-1">
                  <span>Wave Function</span>
                  <span className="text-amber-500">{quantumState.probability.toFixed(4)}</span>
                </div>
                <div className="h-2 bg-black/50 rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-700 to-amber-500"
                    animate={{ width: `${quantumState.probability * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              
              {/* Entropy */}
              <div>
                <div className="flex justify-between text-stone-500 mb-1">
                  <span>Entropy</span>
                  <span className="text-purple-500">{quantumState.entropy.toFixed(4)}</span>
                </div>
                <div className="h-2 bg-black/50 rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-700 to-purple-500"
                    animate={{ width: `${quantumState.entropy * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              
              {/* Observer Effect */}
              <div className="pt-2 border-t border-amber-900/30">
                <p className="text-stone-600 italic">
                  {quantumState.collapsed 
                    ? `Collapsed: ${quantumState.outcome}`
                    : "Superposition stable. Observing..."
                  }
                </p>
              </div>
              
              {/* Clue Modifier */}
              <div className="pt-2 border-t border-amber-900/30">
                <p className="text-amber-700">
                  Data Fragments: {gameState.inventory.length}
                </p>
                <p className="text-stone-600 text-[10px]">
                  Each fragment increases manifestation probability
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Probability Collapse Event Modal */}
      <AnimatePresence>
        {activeEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setActiveEvent(null)}
          >
            <div 
              className="bg-[#0a0500]/95 border border-amber-600/50 rounded-lg p-4 md:p-6 w-full max-w-sm backdrop-blur-md shadow-[0_0_50px_rgba(184,115,51,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl mb-3"
                >
                  ⚛️
                </motion.div>
                
                <h3 className="text-amber-500 font-orbitron text-lg mb-2">
                  WAVE FUNCTION COLLAPSED
                </h3>
                
                <p className="text-amber-700 text-sm font-mono mb-1">
                  {activeEvent.name}
                </p>
                
                <p className="text-stone-400 text-sm mb-4">
                  {activeEvent.description}
                </p>
                
                <div className="bg-black/50 rounded p-2 mb-4">
                  <p className="text-xs text-stone-500">
                    Collapse Probability: <span className="text-amber-500">{(activeEvent.currentProb * 100).toFixed(1)}%</span>
                  </p>
                  <p className="text-xs text-purple-600 italic mt-1">
                    {quantumMessages[Math.floor(Math.random() * quantumMessages.length)] || "Quantum fluctuation detected."}
                  </p>
                </div>
                
                <button
                  onClick={handleCollectEvent}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-black font-bold text-sm rounded transition-colors"
                  data-testid="quantum-collect"
                >
                  CAPTURE QUANTUM STATE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
