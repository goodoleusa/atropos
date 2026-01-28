import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MESSAGES = [
  "THEY ARE WATCHING",
  "NOTHING IS REAL",
  "WAKE UP",
  "SYSTEM FAILURE IMMINENT",
  "LOOK BEHIND THE CURTAIN",
  "01001000 01000101 01001100 01010000",
  "DONT TRUST THE ADMIN"
];

export const ChaosOverlay = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    // Random subliminal text flashes
    const textInterval = setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance every 2 seconds
        const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        setMessage(randomMsg);
        setTimeout(() => setMessage(null), 100); // Show for only 100ms
      }
    }, 2000);

    // Random modal popups
    const modalInterval = setInterval(() => {
      if (Math.random() > 0.98) { // 2% chance every 5 seconds
        setShowModal(true);
      }
    }, 5000);

    // Random screen glitch
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200);
      }
    }, 3000);

    return () => {
      clearInterval(textInterval);
      clearInterval(modalInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
          >
            <h1 className="text-9xl font-black text-red-600 tracking-tighter mix-blend-difference uppercase font-mono shadow-red-500 text-stroke">
              {message}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {glitchActive && (
        <div className="fixed inset-0 bg-red-500/10 z-[90] pointer-events-none mix-blend-color-dodge backdrop-invert">
           <div className="absolute top-10 left-0 w-full h-2 bg-white/50 blur-sm"></div>
           <div className="absolute bottom-20 left-0 w-full h-10 bg-blue-500/20 blur-md skew-x-12"></div>
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="border-red-500 bg-black text-red-500 font-mono">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest text-glitch" data-text="System Breach">System Breach</DialogTitle>
            <DialogDescription className="text-red-400">
              Unauthorized access detected from your IP address. 
              Tracing connection...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-2 w-full bg-red-900 overflow-hidden">
                <motion.div 
                  className="h-full bg-red-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
            </div>
            <p className="text-xs">PROBABILITY OF DETECTION: {(Math.random() * 100).toFixed(2)}%</p>
            <div className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => setShowModal(false)} className="hover:animate-pulse">ABORT</Button>
                <Button variant="outline" onClick={() => setShowModal(false)} className="border-red-500 text-red-500 hover:bg-red-950">IGNORE</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
