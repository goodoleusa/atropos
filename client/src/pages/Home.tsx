import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { QRCodeModal } from "@/components/QRCodeModal";
import { AgentChat } from "@/components/AgentChat";
import { useGame } from "@/hooks/useGameSession";
import { Button } from "@/components/ui/button";
import { InteractiveHover } from '@/components/InteractiveHover';
import { 
  Shield, Zap, Eye, Server, QrCode, Bot, 
  ChevronDown, Crosshair, Clock, AlertTriangle,
  Target, Radio, FileSearch, Layout
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const { gameState } = useGame();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [agentChatOpen, setAgentChatOpen] = useState(false);
  const [scrolledPastVideo, setScrolledPastVideo] = useState(false);
  
  const [videoLoaded, setVideoLoaded] = useState(false);
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
          className="absolute inset-0"
        >
          {/* Poster image - visible until video loads */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
            <img
              src="/videos/nexus-hero-poster.png"
              alt=""
              className="w-full h-full object-cover"
              data-testid="hero-poster"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-500/60 border-t-amber-400 rounded-full animate-spin" />
              <span className="text-amber-400/80 text-xs font-mono tracking-widest uppercase">Initializing</span>
            </div>
          </div>

          {/* Video - fades in once loaded */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onCanPlayThrough={() => setVideoLoaded(true)}
            onPlaying={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            data-testid="hero-video"
          >
            <source src="/videos/hero-one-card-sequence.mp4" type="video/mp4" />
          </video>
        </motion.div>
        
        {/* Minimal Logo on Video */}
        <div 
          className="absolute top-6 left-6 z-20 cursor-pointer group"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-quicknav'))}
        >
          <div className="flex items-center gap-2">
            <Server className={`w-6 h-6 transition-all duration-1000 group-hover:scale-110 ${videoLoaded ? 'text-white/80' : 'text-amber-400'}`} />
            <span className={`font-nav font-bold text-xl tracking-wider transition-colors duration-1000 group-hover:text-amber-500 ${videoLoaded ? 'text-white/80' : 'text-amber-400'}`}>
              ATROPOS
            </span>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          data-testid="scroll-indicator"
        >
          <span className="text-white/70 text-sm font-mono tracking-widest">EXPLORE</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-white/70" />
          </motion.div>
        </motion.div>
      </section>

      {/* Torch-Cut Paragraphs section */}
      <section
        ref={darkSectionRef}
        className="min-h-screen bg-[hsl(var(--card))] relative py-24 px-4"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(180, 100, 30, 0.06), transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(15, 107, 99, 0.05), transparent 50%)
          `
        }}
      >
        <div className="container mx-auto max-w-4xl pt-16">
          {/* Torch-Cut Paragraph 1 */}
          <div 
            ref={paragraph1Ref}
            className="fade-in-scroll mb-16"
          >
            <div className="torch-border p-8 md:p-12 bg-[hsl(var(--card))]/90" data-testid="torch-paragraph-1">
              <h2 className="font-orbitron text-2xl md:text-3xl text-foreground mb-4">
                In Security, <span className="text-amber-800">Probability</span> Is Everything
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Every system has vulnerabilities. Every network has entry points. The question isn't 
                <em className="text-teal-800"> if</em> an attack will come—it's <em className="text-teal-800">when</em>, 
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
            <div className="torch-border p-8 md:p-12 bg-[hsl(var(--card))]/90" data-testid="torch-paragraph-2">
              <h2 className="font-orbitron text-2xl md:text-3xl text-foreground mb-4">
                Offensive Security. <span className="text-teal-800">Adaptive Response.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our team operates at the intersection of threat intelligence and proactive defense. 
                We simulate adversarial thinking, stress-test your infrastructure, and build 
                resilience before the cards are dealt. When uncertainty is your enemy, 
                <span className="text-amber-800"> we become your edge</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Selling Points Section */}
      <section className="bg-[hsl(var(--background))] py-24 px-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-3xl md:text-4xl text-foreground mb-4">
              Why <span className="text-amber-800">NEXUS</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
              <InteractiveHover className="h-full">
                <div className="h-full p-6 md:p-8 bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--card))] border border-amber-900/30 rounded-lg molten-edge transition-all duration-500 hover:border-amber-600/50" data-testid="card-offensive-security">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-900/40 to-amber-950/60 flex items-center justify-center mb-6 group-hover:from-amber-800/50 group-hover:to-amber-900/70 transition-all">
                    <Crosshair className="w-7 h-7 text-amber-800" />
                  </div>
                  <h3 className="font-orbitron text-xl text-foreground mb-3">
                    Battle-Hardened Offensive Security
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Red team operations, penetration testing, and adversarial simulation. 
                    We find your weaknesses before attackers do.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] px-2 py-1 rounded bg-amber-950/50 text-amber-800 border border-amber-900/30">
                      PENTEST
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded bg-amber-950/50 text-amber-800 border border-amber-900/30">
                      RED TEAM
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded bg-teal-950/50 text-teal-800 border border-teal-900/30">
                      BUG BOUNTY
                    </span>
                  </div>
                </div>
              </InteractiveHover>
            </motion.div>

            {/* 24/7 Monitoring */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group"
            >
              <InteractiveHover className="h-full" color="rgba(20, 184, 166, 0.4)">
                <div className="h-full p-6 md:p-8 bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--card))] border border-teal-900/30 rounded-lg molten-edge transition-all duration-500 hover:border-teal-600/50" data-testid="card-monitoring">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-teal-900/40 to-teal-950/60 flex items-center justify-center mb-6 group-hover:from-teal-800/50 group-hover:to-teal-900/70 transition-all">
                    <Radio className="w-7 h-7 text-teal-800" />
                  </div>
                  <h3 className="font-orbitron text-xl text-foreground mb-3">
                    24/7 Live Monitoring
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Real-time threat detection across your entire attack surface. 
                    AI-powered analysis with human oversight, around the clock.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] px-2 py-1 rounded bg-teal-950/50 text-teal-800 border border-teal-900/30">
                      SIEM/SOAR
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded bg-teal-950/50 text-teal-800 border border-teal-900/30">
                      THREAT INTEL
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded bg-amber-950/50 text-amber-800 border border-amber-900/30">
                      ML-POWERED
                    </span>
                  </div>
                </div>
              </InteractiveHover>
            </motion.div>

            {/* Incident Response */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group"
            >
              <InteractiveHover className="h-full" color="rgba(249, 115, 22, 0.4)">
                <div className="h-full p-6 md:p-8 bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--card))] border border-orange-900/30 rounded-lg molten-edge transition-all duration-500 hover:border-orange-600/50" data-testid="card-incident-response">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-900/40 to-orange-950/60 flex items-center justify-center mb-6 group-hover:from-orange-800/50 group-hover:to-orange-900/70 transition-all">
                    <AlertTriangle className="w-7 h-7 text-orange-800" />
                  </div>
                  <h3 className="font-orbitron text-xl text-foreground mb-3">
                    Rapid Incident Response
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    When breaches occur, every second counts. Our response teams 
                    contain, investigate, and remediate with surgical precision.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] px-2 py-1 rounded bg-orange-950/50 text-orange-800 border border-orange-900/30">
                      FORENSICS
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded bg-orange-950/50 text-orange-800 border border-orange-900/30">
                      CONTAINMENT
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded bg-teal-950/50 text-teal-800 border border-teal-900/30">
                      RECOVERY
                    </span>
                  </div>
                </div>
              </InteractiveHover>
            </motion.div>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border/50">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-amber-800">99.99%</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">UPTIME SLA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-teal-800">&lt;3ms</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">RESPONSE TIME</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-orange-800">24/7</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">SOC COVERAGE</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-foreground">15+</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">GLOBAL NODES</div>
            </div>
          </div>
        </div>
      </section>

      {/* Civic Engagement Learning Section */}
      <section className="bg-[hsl(var(--background))] py-24 px-4 relative overflow-hidden border-t border-amber-900/20">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl md:text-4xl text-foreground mb-4">
              <span className="text-amber-800">Civic Engagement</span> & Movement History
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn from movements that toppled authoritarian regimes with laughter, unity, and creative resistance. Serbia, Euromaidan, Hong Kong, and more.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'serbia_otpor', icon: '✊', name: 'Serbia: Otpor!', desc: 'Youth-led humor & unity vs Milosevic' },
              { id: 'euromaidan', icon: '🌻', name: 'Euromaidan', desc: 'Ukraine 2013-14 grassroots mobilization' },
              { id: 'hong_kong_resistance', icon: '☂️', name: 'Hong Kong', desc: 'Creative resistance & Be Water' },
              { id: 'humor_unity_resistance', icon: '😄', name: 'Laughter & Unity', desc: 'Comparative nonviolent resistance' },
            ].map((c) => (
              <Link key={c.id} href={`/investigate?campaign=${c.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-5 bg-[hsl(var(--muted))]/80 border border-amber-900/30 rounded-lg hover:border-amber-600/50 transition-all cursor-pointer group"
                >
                  <span className="text-2xl block mb-2">{c.icon}</span>
                  <h3 className="font-orbitron text-amber-800 group-hover:text-amber-600">{c.name}</h3>
                  <p className="text-muted-foreground text-xs mt-1">{c.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/campaigns">
              <Button variant="outline" className="border-amber-800/50 text-amber-800 hover:border-amber-600 hover:bg-amber-950/20">
                View All Civic & Security Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[hsl(var(--card))] py-20 px-4 border-t border-amber-900/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-orbitron text-2xl md:text-3xl text-foreground mb-6">
            Ready to Shift the Odds?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Request a security assessment and discover your true attack surface.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-bold shadow-lg shadow-amber-900/30 touch-target"
              data-testid="cta-security-audit"
              showParticles
            >
              <Shield className="w-5 h-5 mr-2" />
              Request Security Audit
            </Button>
            <Link href="/builder">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-amber-800/50 text-amber-800 hover:border-amber-600 hover:bg-amber-950/20 touch-target w-full sm:w-auto"
                data-testid="cta-open-builder"
                showParticles
              >
                <Layout className="w-5 h-5 mr-2" />
                Campaign Architect
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-amber-900/10 py-8 bg-[hsl(var(--card))]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Server className="text-amber-800 w-5 h-5" />
              <span className="font-orbitron text-sm text-muted-foreground">NEXUS Security</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link href="/wiki" className="hover:text-amber-500 transition-colors touch-target flex items-center" data-testid="link-wiki">
                <FileSearch className="w-4 h-4 mr-1" />
                Docs
              </Link>
              <Link href="/terminal" className="hover:text-amber-500 transition-colors touch-target flex items-center" data-testid="link-terminal">
                <Server className="w-4 h-4 mr-1" />
                Terminal
              </Link>
              <span className="text-muted-foreground">|</span>
              <span className="font-mono text-muted-foreground">v4.0.2</span>
            </div>
            <p className="text-muted-foreground text-xs">&copy; 2026 NEXUS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QRCodeModal open={qrModalOpen} onOpenChange={setQrModalOpen} />
      <AgentChat open={agentChatOpen} onOpenChange={setAgentChatOpen} />
    </div>
  );
}
