import { CustomTerminal } from "@/components/CustomTerminal";
import { GlitchText } from "@/components/GlitchText";
import { motion } from "framer-motion";

export default function TerminalPage() {
  return (
    <div className="min-h-screen bg-[#050301] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Matrix Rain Effect (Simulated with simple CSS for now, could be canvas later) */}
      <div className="absolute inset-0 bg-[url('/assets/grid-noise.png')] opacity-10 pointer-events-none mix-blend-color-dodge"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="mb-4 flex items-end justify-between">
            <div>
                <GlitchText text="KERNEL_ACCESS_POINT" as="h1" className="text-2xl md:text-4xl font-bold text-amber-700 font-orbitron" />
                <p className="text-amber-900/60 font-mono text-xs mt-1">WARNING: UNAUTHORIZED ACCESS WILL BE INCINERATED</p>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-xs text-red-900 font-mono animate-pulse">CONNECTION: UNSTABLE</div>
                <div className="text-xs text-amber-900/40 font-mono">IP: HIDDEN</div>
            </div>
        </div>
        
        <CustomTerminal />
        
        <div className="mt-8 text-center">
             <p className="text-stone-700 text-xs font-mono max-w-md mx-auto">
                "The metal remembers what the code forgets."
             </p>
        </div>
      </motion.div>
    </div>
  );
}
