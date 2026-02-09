import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveHoverProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export const InteractiveHover: React.FC<InteractiveHoverProps> = ({ 
  children, 
  className = "", 
  color = "rgba(212, 163, 115, 0.4)" // Molten bronze
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence>
        {isHovered && (
          <>
            {/* Glow following mouse */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-0 rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${color}, transparent 40%)`,
              }}
            />
            
            {/* Edge highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-[1px] rounded-inherit bg-gradient-to-r from-bronze-500/50 via-amber-500/20 to-bronze-500/50 z-[-1] blur-[1px]"
            />

            {/* Subtle particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: mousePos.x,
                  y: mousePos.y 
                }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                  x: mousePos.x + (Math.random() - 0.5) * 100,
                  y: mousePos.y + (Math.random() - 0.5) * 100
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute w-1 h-1 bg-bronze-400 rounded-full pointer-events-none z-10"
              />
            ))}
          </>
        )}
      </AnimatePresence>
      <div className="relative z-1">
        {children}
      </div>
    </motion.div>
  );
};
