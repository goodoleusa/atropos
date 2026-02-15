import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export function ParticleEffect({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        const id = Math.random();
        setParticles((prev) => [
          ...prev.slice(-15),
          {
            id,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            color: Math.random() > 0.5 ? "#b45309" : "#d97706", // amber-700 / amber-600
          },
        ]);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [active]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0.5],
              y: -50,
              x: p.x + (Math.random() - 0.5) * 20 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute rounded-full shadow-[0_0_8px_rgba(180,83,9,0.6)]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
