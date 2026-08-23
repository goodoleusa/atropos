import { useState } from "react";
import { CustomTerminal } from "@/components/CustomTerminal";
import { GlitchText } from "@/components/GlitchText";
import { QRCodeModal } from "@/components/QRCodeModal";
import { AgentChat } from "@/components/AgentChat";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { QrCode, Home, Bot } from "lucide-react";
import { Link } from "wouter";

export default function TerminalPage() {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [agentChatOpen, setAgentChatOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 pt-16 sm:pt-4 relative overflow-hidden">
      {/* Background Matrix Rain Effect (Simulated with simple CSS for now, could be canvas later) */}
      <div className="absolute inset-0 bg-[url('/assets/grid-noise.png')] opacity-10 pointer-events-none mix-blend-color-dodge"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="mb-2 sm:mb-4 flex items-end justify-between">
            <div>
                <GlitchText text="KERNEL_ACCESS" as="h1" className="text-lg sm:text-2xl md:text-4xl font-bold text-amber-700 font-orbitron" />
                <p className="text-amber-900/60 font-mono text-[10px] sm:text-xs mt-1 hidden sm:block">WARNING: UNAUTHORIZED ACCESS WILL BE INCINERATED</p>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-xs text-red-900 font-mono animate-pulse">CONNECTION: UNSTABLE</div>
                <div className="text-xs text-amber-900/40 font-mono">IP: HIDDEN</div>
            </div>
        </div>
        
        <CustomTerminal />
        
        <div className="mt-4 sm:mt-8 text-center hidden sm:block">
             <p className="text-muted-foreground text-xs font-mono max-w-md mx-auto">
                "The metal remembers what the code forgets."
             </p>
        </div>
      </motion.div>
      
      {/* Quick Access Bar - responsive positioning */}
      <div className="fixed top-2 sm:top-4 left-2 sm:left-4 z-50 flex gap-2">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-800/50 text-amber-700 hover:text-amber-500 hover:bg-amber-950/30 bg-black/80 backdrop-blur-sm min-h-[44px] min-w-[44px] px-2 sm:px-3"
            data-testid="home-button"
          >
            <Home className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </Link>
      </div>
      
      {/* Floating Buttons - responsive sizing */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="fixed bottom-4 sm:bottom-6 right-2 sm:right-6 z-50 flex flex-row sm:flex-col gap-2 sm:gap-3 pb-safe"
      >
        {/* Agent Chat Button */}
        <Button
          onClick={() => setAgentChatOpen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-border hover:bg-border text-amber-800 shadow-lg shadow-amber-900/30 border-2 border-amber-900/50 touch-manipulation active:scale-95 transition-transform"
          data-testid="terminal-agent-button"
        >
          <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
        
        {/* QR Code Button */}
        <Button
          onClick={() => setQrModalOpen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-700 hover:bg-amber-600 text-black shadow-lg shadow-amber-900/50 border-2 border-amber-500/30 touch-manipulation active:scale-95 transition-transform"
          data-testid="terminal-qr-button"
        >
          <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
        <span className="hidden sm:block absolute -bottom-6 right-0 text-xs text-amber-800/70 font-mono whitespace-nowrap">
          QR | Agent
        </span>
      </motion.div>
      
      {/* QR Code Modal */}
      <QRCodeModal open={qrModalOpen} onOpenChange={setQrModalOpen} />
      
      {/* Agent Chat Modal */}
      <AgentChat open={agentChatOpen} onOpenChange={setAgentChatOpen} />
    </div>
  );
}
