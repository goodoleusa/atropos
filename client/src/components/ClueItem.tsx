import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGameSession';
import { cn } from '@/lib/utils';
import { Key } from 'lucide-react';

interface ClueItemProps {
  id: string;
  name: string;
  description: string;
  content: string;
  triggerText?: string; // Text to show before collecting
  className?: string;
}

export const ClueItem = ({ id, name, description, content, triggerText, className }: ClueItemProps) => {
  const { hasClue, collectClue } = useGame();
  const collected = hasClue(id);
  const [isHovered, setIsHovered] = useState(false);

  if (collected) return null; // Hide if already collected (or show distinct state)

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn("cursor-pointer inline-block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => collectClue({ id, name, description, content, foundAt: new Date().toISOString() })}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 border border-primary/50 text-primary px-3 py-1 text-xs font-mono whitespace-nowrap z-50 backdrop-blur-md"
          >
            {triggerText || "UNKNOWN_DATA_FRAGMENT"}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative group">
        <Key className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors animate-pulse" />
        <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
      </div>
    </motion.div>
  );
};
