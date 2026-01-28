import { Link, useLocation } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { ChaosOverlay } from "@/components/ChaosOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Network, Lock, Server } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen relative font-sans text-gray-200 selection:bg-green-500 selection:text-black">
      <ChaosOverlay />
      
      {/* Navigation - Looks Normalish */}
      <nav className="w-full border-b border-green-900/30 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="text-green-500 w-6 h-6" />
            <span className="font-orbitron font-bold text-xl tracking-wider">
              SYS<span className="text-green-500">ADMIN</span> CORP
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-green-400 transition-colors">Services</a>
            <a href="#" className="hover:text-green-400 transition-colors">About Us</a>
            <a href="#" className="hover:text-green-400 transition-colors">Enterprise</a>
            {/* Hidden clickable area in nav */}
            <div 
               className="w-4 h-4 cursor-pointer opacity-0 hover:opacity-50 transition-opacity bg-red-500"
               onClick={() => setLocation("/admin")}
               data-testid="hidden-nav-trigger"
            ></div>
            <Link href="/login">
                <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-950/50 h-8">
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
          <div className="inline-block px-3 py-1 mb-6 text-xs font-mono text-green-400 border border-green-900 bg-green-950/30 rounded-full">
            SECURE. RELIABLE. OMNIPRESENT.
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-orbitron mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            Total Network <br/>
            <GlitchText text="Control" className="text-green-500" />
          </h1>
          <p className="max-w-2xl text-gray-400 text-lg mb-8 leading-relaxed">
            We provide state-of-the-art infrastructure monitoring and security solutions for the Fortune 500. 
            Nothing escapes our gaze.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-500 text-black font-bold">
              Schedule Audit
            </Button>
            <Button size="lg" variant="outline" className="border-gray-700 hover:border-green-500 hover:text-green-400">
              View Documentation
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-black/40 border-green-900/30 backdrop-blur-sm group hover:border-green-500/50 transition-colors duration-500">
            <CardHeader>
              <ShieldAlert className="w-10 h-10 text-green-500 mb-2 group-hover:animate-pulse" />
              <CardTitle className="text-xl font-orbitron">Threat Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                AI-powered algorithms that predict breaches before they happen. We know what you're doing.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-green-900/30 backdrop-blur-sm group hover:border-green-500/50 transition-colors duration-500">
            <CardHeader>
              <Network className="w-10 h-10 text-blue-500 mb-2" />
              <CardTitle className="text-xl font-orbitron">Global Mesh</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Interconnected nodes ensuring 99.999% uptime. You can run, but you cannot hide from the mesh.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-green-900/30 backdrop-blur-sm group hover:border-green-500/50 transition-colors duration-500">
            <CardHeader>
              <Lock className="w-10 h-10 text-purple-500 mb-2" />
              <CardTitle className="text-xl font-orbitron">Data Sovereignity</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Your data is safe with us. We definitely don't sell it to the highest bidder.
                {/* Hidden comment in source: <!-- Try /terminal if you want the truth --> */}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <footer className="w-full border-t border-gray-900 py-8 mt-12 bg-black/80">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>&copy; 2026 SysAdmin Corp. All rights reserved.</p>
          <div className="mt-2 opacity-10 hover:opacity-100 transition-opacity">
            <Link href="/terminal" className="text-xs font-mono cursor-default">v4.0.2-beta-build-992</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
