import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { QRCodeModal } from "@/components/QRCodeModal";
import { AgentChat } from "@/components/AgentChat";
import { useGame } from "@/hooks/useGameSession";
import { Button } from "@/components/ui/button";
import { 
  Shield, Zap, Eye, Server, QrCode, Bot, 
  ChevronDown, Crosshair, Clock, AlertTriangle,
  Target, Radio, FileSearch
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const { gameState } = useGame();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [agentChatOpen, setAgentChatOpen] = useState(false);
  const [scrolledPastVideo, setScrolledPastVideo] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const darkSectionRef = useRef<HTMLDivElement>(null);
  const paragraph1Ref = useRef<HTMLDivElement>(null);
  const paragraph2Ref = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const videoOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const videoHeight = window.innerHeight;
      setScrolledPastVideo(scrollPosition > videoHeight * 0.7);
      
      // Fade in paragraphs on scroll
      [paragraph1Ref, paragraph2Ref].forEach((ref) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight * 0.8;
          if (isVisible) {
            ref.current.classList.add('visible');
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Video Lander Section - White Background */}
      <section className="h-screen w-full bg-white relative overflow-hidden">
        {/* Video Background */}
        <motion.div 
          style={{ opacity: videoOpacity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/videos/probability-poster.png"
            data-testid="hero-video"
          >
            <source src="/videos/hero-one-card-sequence.mp4" type="video/mp4" />
          </video>
          
        </motion.div>
        
        {/* Minimal Logo on Video */}
        <div className="absolute top-6 left-6 z-20">
          <div className="flex items-center gap-2">
            <Server className="text-stone-800 w-6 h-6" />
            <span className="font-orbitron font-bold text-xl tracking-wider text-stone-800">
              NEXUS
            </span>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          data-testid="scroll-indicator"
        >
          <span className="text-stone-500 text-sm font-mono tracking-widest">EXPLORE</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-stone-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Dark Section - Torch-Cut Paragraphs */}
      <section 
        ref={darkSectionRef}
        className="min-h-screen bg-[#0a0500] relative py-24 px-4"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(205, 127, 50, 0.08), transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(20, 184, 166, 0.05), transparent 50%),
            linear-gradient(to bottom, #0a0500 0%, #050208 100%)
          `
        }}
      >
        {/* Navigation - Appears after scroll */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolledPastVideo 
            ? 'bg-[#0a0500]/95 backdrop-blur-md border-b border-amber-900/20 translate-y-0' 
            : '-translate-y-full'
        }`}>
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="text-amber-600 w-6 h-6" />
              <span className="font-orbitron font-bold text-xl tracking-wider text-stone-200">
                NEXUS
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terminal">
                <Button 
                  variant="ghost" 
                  className="text-stone-400 hover:text-amber-500 touch-target hidden md:flex"
                  data-testid="nav-terminal"
                >
                  Terminal
                </Button>
              </Link>
              <Button 
                variant="outline"
                onClick={() => setQrModalOpen(true)}
                className="border-amber-700/50 text-amber-600 hover:bg-amber-950/30 touch-target"
                data-testid="nav-qr-button"
              >
                <QrCode className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Tools</span>
              </Button>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 text-black font-bold touch-target" data-testid="nav-access-button">
                  Access
                </Button>
              </Link>
              {/* Hidden admin trigger */}
              <div 
                className="w-4 h-4 cursor-pointer opacity-0 hover:opacity-30 transition-opacity"
                onClick={() => setLocation("/admin")}
                data-testid="hidden-nav-trigger"
              />
            </div>
          </div>
        </nav>

        <div className="container mx-auto max-w-4xl pt-16">
          {/* Torch-Cut Paragraph 1 */}
          <div 
            ref={paragraph1Ref}
            className="fade-in-scroll mb-16"
          >
            <div className="torch-border p-8 md:p-12 bg-[#0a0500]/90" data-testid="torch-paragraph-1">
              <h2 className="font-orbitron text-2xl md:text-3xl text-stone-200 mb-4">
                In Security, <span className="text-amber-500">Probability</span> Is Everything
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed">
                Every system has vulnerabilities. Every network has entry points. The question isn't 
                <em className="text-teal-400"> if</em> an attack will come—it's <em className="text-teal-400">when</em>, 
                and whether you've shifted the odds in your favor. We don't play defense. 
                We reshape the battlefield.
              </p>
            </div>
          </div>

          {/* Torch-Cut Paragraph 2 */}
          <div 
            ref={paragraph2Ref}
            className="fade-in-scroll"
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="torch-border p-8 md:p-12 bg-[#0a0500]/90" data-testid="torch-paragraph-2">
              <h2 className="font-orbitron text-2xl md:text-3xl text-stone-200 mb-4">
                Offensive Security. <span className="text-teal-400">Adaptive Response.</span>
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed">
                Our team operates at the intersection of threat intelligence and proactive defense. 
                We simulate adversarial thinking, stress-test your infrastructure, and build 
                resilience before the cards are dealt. When uncertainty is your enemy, 
                <span className="text-amber-400"> we become your edge</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Selling Points Section */}
      <section className="bg-[#050208] py-24 px-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-3xl md:text-4xl text-stone-200 mb-4">
              Why <span className="text-amber-500">NEXUS</span>
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              Three pillars of comprehensive security coverage
            </p>
          </div>

          {/* Three Selling Points - Cards */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Offensive Security */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group"
            >
              <div className="h-full p-6 md:p-8 bg-gradient-to-br from-[#0f0a05] to-[#0a0500] border border-amber-900/30 rounded-lg molten-edge transition-all duration-500 hover:border-amber-600/50" data-testid="card-offensive-security">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-900/40 to-amber-950/60 flex items-center justify-center mb-6 group-hover:from-amber-800/50 group-hover:to-amber-900/70 transition-all">
                  <Crosshair className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="font-orbitron text-xl text-stone-200 mb-3">
                  Battle-Hardened Offensive Security
                </h3>
                <p className="text-stone-500 leading-relaxed mb-4">
                  Red team operations, penetration testing, and adversarial simulation. 
                  We find your weaknesses before attackers do.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-1 rounded bg-amber-950/50 text-amber-500 border border-amber-900/30">
                    PENTEST
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded bg-amber-950/50 text-amber-500 border border-amber-900/30">
                    RED TEAM
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded bg-teal-950/50 text-teal-500 border border-teal-900/30">
                    BUG BOUNTY
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 24/7 Monitoring */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group"
            >
              <div className="h-full p-6 md:p-8 bg-gradient-to-br from-[#050a0f] to-[#0a0500] border border-teal-900/30 rounded-lg molten-edge transition-all duration-500 hover:border-teal-600/50" data-testid="card-monitoring">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-teal-900/40 to-teal-950/60 flex items-center justify-center mb-6 group-hover:from-teal-800/50 group-hover:to-teal-900/70 transition-all">
                  <Radio className="w-7 h-7 text-teal-500" />
                </div>
                <h3 className="font-orbitron text-xl text-stone-200 mb-3">
                  24/7 Live Monitoring
                </h3>
                <p className="text-stone-500 leading-relaxed mb-4">
                  Real-time threat detection across your entire attack surface. 
                  AI-powered analysis with human oversight, around the clock.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-1 rounded bg-teal-950/50 text-teal-500 border border-teal-900/30">
                    SIEM/SOAR
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded bg-teal-950/50 text-teal-500 border border-teal-900/30">
                    THREAT INTEL
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded bg-amber-950/50 text-amber-500 border border-amber-900/30">
                    ML-POWERED
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Incident Response */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group"
            >
              <div className="h-full p-6 md:p-8 bg-gradient-to-br from-[#0f0505] to-[#0a0500] border border-orange-900/30 rounded-lg molten-edge transition-all duration-500 hover:border-orange-600/50" data-testid="card-incident-response">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-900/40 to-orange-950/60 flex items-center justify-center mb-6 group-hover:from-orange-800/50 group-hover:to-orange-900/70 transition-all">
                  <AlertTriangle className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="font-orbitron text-xl text-stone-200 mb-3">
                  Rapid Incident Response
                </h3>
                <p className="text-stone-500 leading-relaxed mb-4">
                  When breaches occur, every second counts. Our response teams 
                  contain, investigate, and remediate with surgical precision.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] px-2 py-1 rounded bg-orange-950/50 text-orange-500 border border-orange-900/30">
                    FORENSICS
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded bg-orange-950/50 text-orange-500 border border-orange-900/30">
                    CONTAINMENT
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded bg-teal-950/50 text-teal-500 border border-teal-900/30">
                    RECOVERY
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-stone-800/50">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-amber-500">99.99%</div>
              <div className="text-xs text-stone-500 font-mono mt-1">UPTIME SLA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-teal-500">&lt;3ms</div>
              <div className="text-xs text-stone-500 font-mono mt-1">RESPONSE TIME</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-orange-500">24/7</div>
              <div className="text-xs text-stone-500 font-mono mt-1">SOC COVERAGE</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-stone-300">15+</div>
              <div className="text-xs text-stone-500 font-mono mt-1">GLOBAL NODES</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0a0500] py-20 px-4 border-t border-amber-900/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-orbitron text-2xl md:text-3xl text-stone-200 mb-6">
            Ready to Shift the Odds?
          </h2>
          <p className="text-stone-500 mb-8 max-w-xl mx-auto">
            Request a security assessment and discover your true attack surface.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-bold shadow-lg shadow-amber-900/30 touch-target"
              data-testid="cta-security-audit"
            >
              <Shield className="w-5 h-5 mr-2" />
              Request Security Audit
            </Button>
            <Link href="/terminal">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-teal-800/50 text-teal-400 hover:border-teal-600 hover:bg-teal-950/20 touch-target w-full sm:w-auto"
                data-testid="cta-explore-platform"
              >
                <Target className="w-5 h-5 mr-2" />
                Explore Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-amber-900/10 py-8 bg-[#050200]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Server className="text-amber-600 w-5 h-5" />
              <span className="font-orbitron text-sm text-stone-400">NEXUS Security</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-stone-600">
              <Link href="/wiki" className="hover:text-amber-500 transition-colors touch-target flex items-center" data-testid="link-wiki">
                <FileSearch className="w-4 h-4 mr-1" />
                Docs
              </Link>
              <Link href="/terminal" className="hover:text-amber-500 transition-colors touch-target flex items-center" data-testid="link-terminal">
                <Server className="w-4 h-4 mr-1" />
                Terminal
              </Link>
              <span className="text-stone-700">|</span>
              <span className="font-mono text-stone-700">v4.0.2</span>
            </div>
            <p className="text-stone-700 text-xs">&copy; 2026 NEXUS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        className={`fixed bottom-6 right-6 z-50 hidden md:flex flex-col gap-3 transition-opacity duration-500 ${
          scrolledPastVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <Button
          onClick={() => setAgentChatOpen(true)}
          className="w-14 h-14 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-500 shadow-lg shadow-amber-900/30 border-2 border-amber-900/50 touch-target"
          data-testid="floating-agent-button"
        >
          <Bot className="w-6 h-6" />
        </Button>
        
        <Button
          onClick={() => setQrModalOpen(true)}
          className="w-14 h-14 rounded-full bg-amber-700 hover:bg-amber-600 text-black shadow-lg shadow-amber-900/50 border-2 border-amber-500/30 touch-target"
          data-testid="floating-qr-button"
        >
          <QrCode className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Modals */}
      <QRCodeModal open={qrModalOpen} onOpenChange={setQrModalOpen} />
      <AgentChat open={agentChatOpen} onOpenChange={setAgentChatOpen} />
    </div>
  );
}
