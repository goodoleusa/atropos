import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { ChaosOverlay } from "@/components/ChaosOverlay";
import { ClueItem } from "@/components/ClueItem";
import { QRCodeModal } from "@/components/QRCodeModal";
import { MysticalPopups } from "@/components/MysticalPopups";
import { QuantumField } from "@/components/QuantumField";
import { useGame } from "@/hooks/useGameSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Network, Server, Eye, QrCode } from "lucide-react";
import { motion, useMotionValue } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const { gameState } = useGame();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  
  // Mouse tracking for "Focus/Hump" effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      // Update CSS variables for the global mask effect
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen relative font-sans text-stone-300 selection:bg-amber-600 selection:text-black">
      {/* The Molten Overlay Effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle 200px at var(--mouse-x, 50%) var(--mouse-y, 50%), transparent 0%, rgba(10, 5, 0, 0.4) 100%)`,
          backdropFilter: 'sepia(20%)'
        }}
      />
      
      {/* Subtle Lens Distortion at cursor */}
      <div 
        className="fixed w-64 h-64 rounded-full pointer-events-none z-40 mix-blend-overlay opacity-30"
        style={{
          left: 'var(--mouse-x)',
          top: 'var(--mouse-y)',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(205, 127, 50, 0.4) 0%, transparent 70%)',
          boxShadow: 'inset 0 0 40px rgba(184, 115, 51, 0.2)'
        }}
      />

      <ChaosOverlay />
      
      {/* Navigation */}
      <nav className="w-full border-b border-amber-900/20 bg-[#0a0500]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="text-amber-600 w-6 h-6" />
            <span className="font-orbitron font-bold text-xl tracking-wider text-stone-200">
              SYS<span className="text-amber-600">ADMIN</span> CORP
            </span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-stone-500 items-center">
            <a href="#" className="hover:text-amber-500 transition-colors">Services</a>
            <a href="#" className="hover:text-amber-500 transition-colors">About Us</a>
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-amber-800/50">
                    ID: {gameState.sessionToken.substring(0, 8)}...
                </span>
                <span className="text-xs font-mono text-amber-600">
                   DATA: {gameState.inventory.length}/5
                </span>
            </div>
            
            {/* QR Code Tool Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setQrModalOpen(true)}
              className="text-amber-700 hover:text-amber-500 hover:bg-amber-950/30"
              data-testid="qr-tool-button"
            >
              <QrCode className="w-4 h-4" />
            </Button>
            
            {/* Hidden clickable area in nav */}
            <div 
               className="w-4 h-4 cursor-pointer opacity-0 hover:opacity-50 transition-opacity bg-amber-600/50 rounded-full"
               onClick={() => setLocation("/admin")}
               data-testid="hidden-nav-trigger"
               title="Staff Entrance"
            ></div>
            
            <Link href="/login">
                <Button variant="outline" className="border-amber-700/30 text-amber-600 hover:bg-amber-950/30 hover:border-amber-600/50 h-8">
                  Client Portal
                </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 flex flex-col items-center text-center relative">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-3 py-1 mb-6 text-xs font-mono text-amber-500 border border-amber-900/50 bg-amber-950/20 rounded-full">
            INFRASTRUCTURE. STABILITY. CONTROL.
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-orbitron mb-6 bg-clip-text text-transparent bg-gradient-to-b from-stone-100 to-stone-600">
            Total Network <br/>
            <GlitchText text="Control" className="text-amber-600" />
          </h1>
          <p className="max-w-2xl text-stone-500 text-lg mb-8 leading-relaxed font-light">
            We provide state-of-the-art infrastructure monitoring for the modern enterprise. 
            Reliability is not just a metric; it is our religion.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-amber-700 hover:bg-amber-600 text-black font-bold border-none">
              Schedule Audit
            </Button>
            <Button size="lg" variant="outline" className="border-stone-800 text-stone-400 hover:border-amber-700 hover:text-amber-500 bg-transparent">
              View Documentation
            </Button>
          </div>
        </motion.div>
        
        {/* Hidden Clue 1: In plain sight but needs hover */}
        <div className="absolute bottom-10 right-10 opacity-30 hover:opacity-100 transition-opacity duration-1000">
           <ClueItem 
             id="clue-01" 
             name="Obsolete Protocol" 
             description="A reference to an old port number." 
             content="Port 8080 is open on the legacy mainframe." 
             triggerText="Inspect Anomaly"
           />
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-[#0f0a05]/80 border-amber-900/20 backdrop-blur-sm group hover:border-amber-600/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(184,115,51,0.1)]">
            <CardHeader>
              <ShieldAlert className="w-10 h-10 text-amber-700 mb-2 group-hover:text-amber-500 transition-colors" />
              <CardTitle className="text-xl font-orbitron text-stone-200">Threat Mitigation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-stone-500">
                Advanced heuristics designed to neutralize unauthorized access attempts immediately.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-[#0f0a05]/80 border-amber-900/20 backdrop-blur-sm group hover:border-amber-600/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(184,115,51,0.1)]">
            <CardHeader>
              <Network className="w-10 h-10 text-stone-700 mb-2 group-hover:text-stone-400 transition-colors" />
              <CardTitle className="text-xl font-orbitron text-stone-200">Mesh Connectivity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-stone-500">
                A seamless fabric of copper and light, binding every node into a singular consciousness.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-[#0f0a05]/80 border-amber-900/20 backdrop-blur-sm group hover:border-amber-600/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(184,115,51,0.1)]">
            <CardHeader>
              <Eye className="w-10 h-10 text-amber-900/50 mb-2 group-hover:text-amber-500 transition-colors" />
              <CardTitle className="text-xl font-orbitron text-stone-200">Deep Oversight</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-stone-500 relative">
                Nothing is deleted. Every packet is archived in the molten core.
                <div className="absolute top-0 right-0">
                    <ClueItem 
                        id="clue-02" 
                        name="Archive Index" 
                        description="A path to a hidden directory." 
                        content="/var/log/sys_core_dump.log" 
                        triggerText="Extract"
                    />
                </div>
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <footer className="w-full border-t border-amber-900/10 py-8 mt-12 bg-[#050200]">
        <div className="container mx-auto px-4 text-center text-stone-700 text-sm">
          <p>&copy; 2026 SysAdmin Corp. All rights reserved.</p>
          <div className="mt-4 opacity-30 hover:opacity-100 transition-opacity">
            <Link href="/terminal" className="text-xs font-mono cursor-pointer hover:text-amber-500 transition-colors">
                sys_v4.0.2-copper
            </Link>
          </div>
        </div>
      </footer>
      
      {/* QR Code Modal */}
      <QRCodeModal open={qrModalOpen} onOpenChange={setQrModalOpen} />
      
      {/* Mystical & Quantum Systems */}
      <MysticalPopups />
      <QuantumField />
    </div>
  );
}
