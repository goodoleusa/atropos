import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MESSAGES = [
  "COPPER OXIDIZES",
  "THE MESH IS LEAKING",
  "SILENCE IS GOLDEN",
  "0x5F3759DF",
  "LOOK CLOSER"
];

export const ChaosOverlay = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    // Reduced frequency of glitches for "less Matrix-like" feel
    const textInterval = setInterval(() => {
      if (Math.random() > 0.97) { 
        const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        setMessage(randomMsg);
        setTimeout(() => setMessage(null), 150); 
      }
    }, 4000);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <>
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[100] cursor-pointer"
            onClick={() => setMessage(null)}
          >
            <h1 className="text-4xl md:text-8xl font-black text-amber-600/50 tracking-widest uppercase font-display blur-sm px-4 text-center">
              {message}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="border-amber-900/50 bg-[hsl(var(--card))] text-amber-500 font-mono">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest text-glitch" data-text="Connection Unstable">Connection Unstable</DialogTitle>
          </DialogHeader>
          <div className="text-amber-700/80">
            <p>Background radiation levels exceeding nominal parameters.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
