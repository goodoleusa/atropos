import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { ChaosOverlay } from "@/components/ChaosOverlay";
import { ClueItem } from "@/components/ClueItem";
import { QRCodeModal } from "@/components/QRCodeModal";
import { AgentChat } from "@/components/AgentChat";
import { MysticalPopups } from "@/components/MysticalPopups";
import { QuantumField } from "@/components/QuantumField";
import { GlobalAttackMap } from "@/components/GlobalAttackMap";
import { useGame } from "@/hooks/useGameSession";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Network, Server, Eye, QrCode, Bot, Shield, Zap, Lock, Globe, Activity } from "lucide-react";
import { motion, useMotionValue } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const { gameState } = useGame();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [agentChatOpen, setAgentChatOpen] = useState(false);
  
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
            
            {/* QR Code Tool Button - More Prominent */}
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setQrModalOpen(true)}
              className="border-amber-700/50 text-amber-600 hover:text-amber-400 hover:bg-amber-950/30 hover:border-amber-500 gap-2"
              data-testid="qr-tool-button"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden lg:inline">QR Tools</span>
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
      <section className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-mono border rounded-full bg-gradient-to-r from-teal-950/50 to-amber-950/50 border-teal-800/30">
              <Activity className="w-3 h-3 text-teal-500" />
              <span className="text-teal-400">LIVE THREAT INTELLIGENCE</span>
              <span className="text-amber-500">|</span>
              <span className="text-amber-400">GLOBAL NETWORK</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600">
                Cyber Defense
              </span>
              <br/>
              <span className="text-stone-200">For The </span>
              <GlitchText text="Modern Era" className="text-teal-500" />
            </h1>
            <p className="max-w-xl text-stone-400 text-lg mb-8 leading-relaxed">
              Real-time threat detection across 15+ global nodes. We neutralize attacks before they reach your infrastructure.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-bold border-none shadow-lg shadow-amber-900/30">
                <Shield className="w-4 h-4 mr-2" />
                Request Security Audit
              </Button>
              <Button size="lg" variant="outline" className="border-teal-800/50 text-teal-400 hover:border-teal-600 hover:text-teal-300 bg-teal-950/20">
                <Globe className="w-4 h-4 mr-2" />
                View Global Status
              </Button>
            </div>
            
            {/* Quick stats */}
            <div className="flex gap-8 mt-10 pt-8 border-t border-stone-800/50">
              <div>
                <div className="text-2xl font-orbitron font-bold text-amber-500">99.99%</div>
                <div className="text-xs text-stone-500 font-mono">UPTIME SLA</div>
              </div>
              <div>
                <div className="text-2xl font-orbitron font-bold text-teal-500">&lt;3ms</div>
                <div className="text-xs text-stone-500 font-mono">RESPONSE TIME</div>
              </div>
              <div>
                <div className="text-2xl font-orbitron font-bold text-orange-500">24/7</div>
                <div className="text-xs text-stone-500 font-mono">SOC COVERAGE</div>
              </div>
            </div>
          </motion.div>

          {/* Attack Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <GlobalAttackMap />
            
            {/* Hidden Clue 1: In plain sight but needs hover */}
            <div className="absolute -bottom-4 right-4 opacity-30 hover:opacity-100 transition-opacity duration-1000">
              <ClueItem 
                id="clue-01" 
                name="Obsolete Protocol" 
                description="A reference to an old port number." 
                content="Port 8080 is open on the legacy mainframe." 
                triggerText="Inspect Anomaly"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-orbitron font-bold text-stone-200 mb-4">
            Enterprise <span className="text-teal-500">Security</span> Solutions
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Comprehensive protection powered by machine learning and 24/7 human oversight
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-[#0f0a05]/90 to-[#050a0f]/80 border-amber-900/20 backdrop-blur-sm group hover:border-teal-600/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)]">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-900/30 to-amber-950/50 flex items-center justify-center mb-3 group-hover:from-amber-800/40 group-hover:to-amber-900/60 transition-all">
                <ShieldAlert className="w-6 h-6 text-amber-500" />
              </div>
              <CardTitle className="text-xl font-orbitron text-stone-200">Threat Mitigation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-stone-500">
                AI-powered threat detection neutralizes attacks in milliseconds. Zero-day protection included.
              </CardDescription>
              <div className="mt-4 flex gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/50 text-amber-500 border border-amber-900/30">ML-POWERED</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950/50 text-teal-500 border border-teal-900/30">REAL-TIME</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0f0a05]/90 to-[#050a0f]/80 border-teal-900/20 backdrop-blur-sm group hover:border-teal-600/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)]">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-900/30 to-teal-950/50 flex items-center justify-center mb-3 group-hover:from-teal-800/40 group-hover:to-teal-900/60 transition-all">
                <Network className="w-6 h-6 text-teal-500" />
              </div>
              <CardTitle className="text-xl font-orbitron text-stone-200">Mesh Connectivity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-stone-500">
                Encrypted node-to-node communication across 15 global data centers. Zero trust architecture.
              </CardDescription>
              <div className="mt-4 flex gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950/50 text-teal-500 border border-teal-900/30">ZERO-TRUST</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-orange-950/50 text-orange-500 border border-orange-900/30">E2E ENCRYPTED</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0f0a05]/90 to-[#050a0f]/80 border-amber-900/20 backdrop-blur-sm group hover:border-amber-600/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-900/30 to-orange-950/50 flex items-center justify-center mb-3 group-hover:from-orange-800/40 group-hover:to-orange-900/60 transition-all">
                <Eye className="w-6 h-6 text-orange-500" />
              </div>
              <CardTitle className="text-xl font-orbitron text-stone-200">Deep Oversight</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-stone-500 relative">
                Full packet inspection and forensic logging. Nothing escapes the archive.
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
              <div className="mt-4 flex gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-orange-950/50 text-orange-500 border border-orange-900/30">FORENSIC</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/50 text-amber-500 border border-amber-900/30">90-DAY RETENTION</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Certifications / Trust badges */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
          <div className="flex items-center gap-2 text-stone-600 font-mono text-sm">
            <Lock className="w-4 h-4" /> SOC 2 TYPE II
          </div>
          <div className="flex items-center gap-2 text-stone-600 font-mono text-sm">
            <Shield className="w-4 h-4" /> ISO 27001
          </div>
          <div className="flex items-center gap-2 text-stone-600 font-mono text-sm">
            <Zap className="w-4 h-4" /> GDPR COMPLIANT
          </div>
          <div className="flex items-center gap-2 text-stone-600 font-mono text-sm">
            <Globe className="w-4 h-4" /> FEDRAMP AUTHORIZED
          </div>
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
      
      {/* Floating Buttons - QR Code & Agent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
      >
        {/* Agent Chat Button */}
        <Button
          onClick={() => setAgentChatOpen(true)}
          className="w-14 h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-500 shadow-lg shadow-amber-900/30 border-2 border-amber-900/50"
          data-testid="floating-agent-button"
        >
          <Bot className="w-6 h-6" />
        </Button>
        
        {/* QR Code Button */}
        <Button
          onClick={() => setQrModalOpen(true)}
          className="w-14 h-14 rounded-full bg-amber-700 hover:bg-amber-600 text-black shadow-lg shadow-amber-900/50 border-2 border-amber-500/30"
          data-testid="floating-qr-button"
        >
          <QrCode className="w-6 h-6" />
        </Button>
        <span className="absolute -bottom-6 right-0 text-xs text-amber-600/70 font-mono whitespace-nowrap">
          QR | Agent
        </span>
      </motion.div>
      
      {/* Agent Chat Modal */}
      <AgentChat open={agentChatOpen} onOpenChange={setAgentChatOpen} />
    </div>
  );
}
