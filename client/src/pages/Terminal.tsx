import { CustomTerminal } from "@/components/CustomTerminal";
import { GlitchText } from "@/components/GlitchText";
import { motion } from "framer-motion";

export default function TerminalPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Matrix Rain Effect (Simulated with simple CSS for now, could be canvas later) */}
      <div className="absolute inset-0 bg-[url('/assets/grid-noise.png')] opacity-20 pointer-events-none"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="mb-4 flex items-end justify-between">
            <div>
                <GlitchText text="SYSTEM_ROOT_ACCESS" as="h1" className="text-2xl md:text-4xl font-bold text-green-600 font-orbitron" />
                <p className="text-green-800 font-mono text-xs mt-1">WARNING: UNAUTHORIZED ACCESS IS A FEDERAL CRIME</p>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-xs text-red-500 font-mono animate-pulse">CONNECTION: UNSECURE</div>
                <div className="text-xs text-green-900 font-mono">IP: 192.168.0.X</div>
            </div>
        </div>
        
        <CustomTerminal />
        
        <div className="mt-8 text-center">
             <p className="text-gray-600 text-xs font-mono max-w-md mx-auto">
                "The only winning move is not to play."
             </p>
        </div>
      </motion.div>
    </div>
  );
}
