import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { GlitchText } from "@/components/GlitchText";
import { Button } from "@/components/ui/button";
import { ClueItem } from "@/components/ClueItem";
import { useGame } from "@/hooks/useGameSession";
import { Terminal, Eye, Sparkles, Zap, Moon, Star, Compass, Skull } from "lucide-react";

const SCRYING_VISIONS = [
  { type: "message", text: "The wave function awaits your observation...", icon: Eye },
  { type: "message", text: "Patterns emerge from the noise. Look deeper.", icon: Sparkles },
  { type: "message", text: "The terminal whispers of hidden commands.", icon: Terminal },
  { type: "message", text: "Data fragments orbit the void. Collect them.", icon: Star },
  { type: "message", text: "A path reveals itself to those who seek.", icon: Compass },
  { type: "message", text: "The oracle senses your presence...", icon: Moon },
  { type: "message", text: "Entropy increases. Certainty fades.", icon: Zap },
  { type: "message", text: "Something stirs in the probability field.", icon: Skull },
];

const TERMINAL_MISSIONS = [
  { id: "mission-recon", name: "Ghost Recon", command: "scan --deep", description: "Map the hidden infrastructure" },
  { id: "mission-secrets", name: "Secret Hunter", command: "grep -r 'password'", description: "Uncover buried credentials" },
  { id: "mission-trace", name: "Signal Trace", command: "traceroute shadow.corp", description: "Follow the packet trail" },
  { id: "mission-decode", name: "Cipher Break", command: "decode base64 message.enc", description: "Decrypt the transmission" },
];

const MYSTICAL_TIPS = [
  "Try typing 'void' in the terminal...",
  "Some commands are hidden. Experiment.",
  "The quantum field responds to your clue count.",
  "Check the Admin Portal. Something's off.",
  "QR codes can carry more than links.",
  "Not all endpoints are documented.",
  "The archive holds forgotten knowledge.",
];

const VOID_CLUES = [
  { id: "clue-void-ash", name: "Void Residue", description: "Ash from the probability core", content: "HEX: #000000 - The color of collapsed possibilities" },
  { id: "clue-void-fragment", name: "Reality Fragment", description: "A shard of destabilized spacetime", content: "Ψ = 0.████ - Partially redacted waveform" },
  { id: "clue-void-echo", name: "Oracle Echo", description: "Whispers from the scrying pool", content: "SIGNAL: The observer changes the observed" },
  { id: "clue-void-key", name: "Entropy Key", description: "Unlocks hidden probability states", content: "KEY: quantum-tunnel-███-access" },
];

export default function TheVoid() {
  const { gameState, collectClue, hasClue, acceptMission } = useGame();
  const [, setLocation] = useLocation();
  const [currentVision, setCurrentVision] = useState(0);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [floatingClue, setFloatingClue] = useState<typeof VOID_CLUES[0] | null>(null);
  const [missionPrompt, setMissionPrompt] = useState<typeof TERMINAL_MISSIONS[0] | null>(null);
  const [tipMessage, setTipMessage] = useState<string | null>(null);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [poolRipple, setPoolRipple] = useState(false);
  
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const initialParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(initialParticles);
  }, []);

  useEffect(() => {
    const visionInterval = setInterval(() => {
      setCurrentVision((prev) => (prev + 1) % SCRYING_VISIONS.length);
      setPoolRipple(true);
      setTimeout(() => setPoolRipple(false), 1000);
    }, 6000);
    return () => clearInterval(visionInterval);
  }, []);

  const triggerQuantumEvent = useCallback(() => {
    const roll = Math.random();
    const clueBonus = gameState.inventory.length * 0.02;
    
    if (roll < 0.15 + clueBonus) {
      const uncollectedClues = VOID_CLUES.filter(c => !hasClue(c.id));
      if (uncollectedClues.length > 0) {
        const randomClue = uncollectedClues[Math.floor(Math.random() * uncollectedClues.length)];
        setFloatingClue(randomClue);
        setActiveEvent("clue");
      }
    } else if (roll < 0.35 + clueBonus) {
      const randomMission = TERMINAL_MISSIONS[Math.floor(Math.random() * TERMINAL_MISSIONS.length)];
      setMissionPrompt(randomMission);
      setActiveEvent("mission");
    } else if (roll < 0.55 + clueBonus) {
      const randomTip = MYSTICAL_TIPS[Math.floor(Math.random() * MYSTICAL_TIPS.length)];
      setTipMessage(randomTip);
      setActiveEvent("tip");
    }
  }, [gameState.inventory.length, hasClue]);

  useEffect(() => {
    const eventInterval = setInterval(triggerQuantumEvent, 8000);
    setTimeout(triggerQuantumEvent, 2000);
    return () => clearInterval(eventInterval);
  }, [triggerQuantumEvent]);

  const handleCollectFloatingClue = () => {
    if (floatingClue) {
      collectClue({
        id: floatingClue.id,
        name: floatingClue.name,
        description: floatingClue.description,
        content: floatingClue.content,
        foundAt: new Date().toISOString(),
      });
      setFloatingClue(null);
      setActiveEvent(null);
    }
  };

  const dismissEvent = () => {
    setFloatingClue(null);
    setMissionPrompt(null);
    setTipMessage(null);
    setActiveEvent(null);
  };

  const vision = SCRYING_VISIONS[currentVision];
  const VisionIcon = vision.icon;

  return (
    <div className="h-screen w-screen bg-[#000] flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/assets/grid-noise.png')] opacity-5 bg-cover" />
      
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-amber-500/30 rounded-full"
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 0 }}
          animate={{
            x: [`${p.x}vw`, `${(p.x + 20) % 100}vw`, `${p.x}vw`],
            y: [`${p.y}vh`, `${(p.y + 30) % 100}vh`, `${p.y}vh`],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 15 + p.delay * 3,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-amber-900/10 rounded-full animate-pulse [animation-duration:4s]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-amber-900/10 rounded-full animate-pulse [animation-duration:6s]" />
      <motion.div
        className="absolute top-1/3 right-1/3 w-32 h-32 border border-stone-800/20 rotate-45"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      <div className="z-10 text-center space-y-6 max-w-3xl px-4">
        <GlitchText 
          text="THE SCRYING POOL" 
          as="h1" 
          className="text-4xl md:text-6xl font-black text-amber-900/30 tracking-tighter mix-blend-exclusion"
        />
        
        <p className="text-stone-600 font-mono text-xs md:text-sm">
          Gaze into the probability field. Visions manifest for those who wait.
        </p>

        <motion.div 
          className="relative mx-auto w-72 h-72 md:w-96 md:h-96 rounded-full cursor-pointer"
          onClick={triggerQuantumEvent}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="scrying-pool"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-stone-950 via-amber-950/20 to-amber-950/30 border border-amber-900/20" />
          
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-radial from-amber-900/10 via-transparent to-transparent"
            animate={poolRipple ? { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] } : {}}
            transition={{ duration: 1 }}
          />
          
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-conic from-amber-900/5 via-amber-900/5 to-amber-900/5"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentVision}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8"
            >
              <VisionIcon className="w-8 h-8 text-amber-700/50 mb-4" />
              <p className="text-amber-600/70 text-sm md:text-base font-mono text-center leading-relaxed">
                {vision.text}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="absolute -inset-2 rounded-full border border-amber-800/10 animate-ping [animation-duration:3s]" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {VOID_CLUES.map((clue) => (
            <div key={clue.id} className="relative">
              {!hasClue(clue.id) ? (
                <ClueItem
                  id={clue.id}
                  name={clue.name}
                  description={clue.description}
                  content={clue.content}
                  triggerText={clue.name}
                  className="text-xs text-stone-600 hover:text-amber-500 transition-colors p-2 border border-amber-900/10 hover:border-amber-700/30 rounded block w-full text-center"
                />
              ) : (
                <div className="text-xs text-amber-800/50 p-2 border border-amber-900/20 rounded opacity-50">
                  {clue.name} ✓
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-6">
          <Link href="/terminal">
            <Button variant="ghost" className="text-xs font-mono text-stone-600 hover:text-amber-500 hover:bg-amber-900/10 gap-2">
              <Terminal className="w-3 h-3" />
              TERMINAL
            </Button>
          </Link>
          <Link href="/agents">
            <Button variant="ghost" className="text-xs font-mono text-stone-600 hover:text-amber-500 hover:bg-amber-900/10 gap-2">
              <Eye className="w-3 h-3" />
              AGENTS
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-xs font-mono text-stone-600 hover:text-amber-500 hover:bg-amber-900/10 gap-2">
              <Compass className="w-3 h-3" />
              RETURN
            </Button>
          </Link>
        </div>

        <p className="text-[10px] text-stone-700 font-mono pt-4">
          Clues collected: {gameState.inventory.length} | Click the pool to invoke the oracle
        </p>
      </div>

      <AnimatePresence>
        {activeEvent === "clue" && floatingClue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={dismissEvent}
          >
            <motion.div
              className="bg-[#0a0500]/95 border border-amber-600/50 rounded-lg p-6 max-w-sm backdrop-blur-md shadow-[0_0_60px_rgba(184,115,51,0.3)]"
              onClick={(e) => e.stopPropagation()}
              animate={{ boxShadow: ["0 0 30px rgba(184,115,51,0.2)", "0 0 60px rgba(184,115,51,0.4)", "0 0 30px rgba(184,115,51,0.2)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-center">
                <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-amber-500 font-orbitron text-lg mb-2">MANIFESTATION</h3>
                <p className="text-amber-700 font-mono text-sm mb-1">{floatingClue.name}</p>
                <p className="text-stone-500 text-xs mb-4">{floatingClue.description}</p>
                <Button
                  onClick={handleCollectFloatingClue}
                  className="bg-amber-700 hover:bg-amber-600 text-black font-bold text-sm"
                  data-testid="collect-floating-clue"
                >
                  CAPTURE FRAGMENT
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeEvent === "mission" && missionPrompt && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-1/2 right-4 -translate-y-1/2 z-50 max-w-xs"
          >
            <div className="bg-[#0a0500]/95 border border-teal-600/50 rounded-lg p-4 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <Terminal className="w-5 h-5 text-teal-500 mt-1 shrink-0" />
                <div>
                  <h4 className="text-teal-400 font-orbitron text-sm mb-1">MISSION AVAILABLE</h4>
                  <p className="text-teal-600 font-mono text-xs mb-2">{missionPrompt.name}</p>
                  <p className="text-stone-500 text-xs mb-3">{missionPrompt.description}</p>
                  <code className="text-[10px] text-teal-700 bg-black/50 px-2 py-1 rounded block mb-3">
                    $ {missionPrompt.command}
                  </code>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-teal-700 hover:bg-teal-600 text-black text-xs h-7"
                      data-testid="accept-void-mission"
                      onClick={() => {
                        acceptMission({
                          id: missionPrompt.id,
                          name: missionPrompt.name,
                          command: missionPrompt.command,
                          description: missionPrompt.description,
                          source: 'void',
                        });
                        dismissEvent();
                        setLocation(`/terminal?cmd=${encodeURIComponent(missionPrompt.command)}`);
                      }}
                    >
                      ACCEPT
                    </Button>
                    <Button size="sm" variant="ghost" onClick={dismissEvent} className="text-stone-500 text-xs h-7">
                      DISMISS
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeEvent === "tip" && tipMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <div 
              className="bg-[#0a0500]/90 border border-amber-600/40 rounded-lg px-6 py-3 backdrop-blur-md cursor-pointer"
              onClick={dismissEvent}
            >
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4 text-amber-500" />
                <p className="text-amber-400 font-mono text-sm italic">{tipMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
