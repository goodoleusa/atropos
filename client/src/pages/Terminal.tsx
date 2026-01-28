import { useState } from "react";
import { CustomTerminal } from "@/components/CustomTerminal";
import { GlitchText } from "@/components/GlitchText";
import { QRCodeModal } from "@/components/QRCodeModal";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { QrCode, Home } from "lucide-react";
import { Link } from "wouter";

export default function TerminalPage() {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  
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
      
      {/* Quick Access Bar */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-800/50 text-amber-700 hover:text-amber-500 hover:bg-amber-950/30 bg-black/80 backdrop-blur-sm"
            data-testid="home-button"
          >
            <Home className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </Link>
      </div>
      
      {/* Floating QR Code Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setQrModalOpen(true)}
          className="w-14 h-14 rounded-full bg-amber-700 hover:bg-amber-600 text-black shadow-lg shadow-amber-900/50 border-2 border-amber-500/30"
          data-testid="terminal-qr-button"
        >
          <QrCode className="w-6 h-6" />
        </Button>
        <span className="absolute -top-8 right-0 text-xs text-amber-600/70 font-mono whitespace-nowrap">
          Session QR
        </span>
      </motion.div>
      
      {/* QR Code Modal */}
      <QRCodeModal open={qrModalOpen} onOpenChange={setQrModalOpen} />
    </div>
  );
}
