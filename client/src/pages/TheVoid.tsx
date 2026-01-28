import { useEffect } from "react";
import { Link } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { Button } from "@/components/ui/button";

export default function TheVoid() {
  
  useEffect(() => {
    // Add a class to body for specific styling if needed, or just rely on component styles
    document.body.style.overflow = "hidden";
    return () => {
        document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden relative perspective-1000">
        <div className="absolute inset-0 bg-[url('/assets/grid-noise.png')] opacity-10 animate-pulse bg-cover"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-purple-500/20 rounded-full animate-ping [animation-duration:3s]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 border border-cyan-500/20 rotate-45 animate-spin [animation-duration:10s]"></div>

        <div className="z-10 text-center space-y-8 max-w-2xl px-4">
            <GlitchText 
                text="YOU FOUND THE VOID" 
                as="h1" 
                className="text-6xl md:text-8xl font-black text-white mix-blend-difference tracking-tighter"
            />
            
            <p className="text-gray-400 font-mono text-sm md:text-base leading-loose">
                This area of memory is corrupted. The data you seek is not here. 
                Or maybe it is, and you just don't have the right <span className="text-purple-500">eyes</span> to see it.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-12">
                <div className="p-4 border border-white/10 hover:bg-white/5 transition-colors cursor-help">
                    <h3 className="font-orbitron text-white text-lg">01. OBSERVATION</h3>
                    <p className="text-xs text-gray-500 mt-2">Look for what doesn't belong.</p>
                </div>
                <div className="p-4 border border-white/10 hover:bg-white/5 transition-colors cursor-help">
                    <h3 className="font-orbitron text-white text-lg">02. ENUMERATION</h3>
                    <p className="text-xs text-gray-500 mt-2">Check every door. Even the locked ones.</p>
                </div>
            </div>

            <div className="pt-12">
                <Link href="/terminal">
                    <Button variant="ghost" className="text-xs font-mono text-gray-600 hover:text-white hover:bg-transparent">
                        &lt; RETURN_TO_SHELL /&gt;
                    </Button>
                </Link>
            </div>
        </div>
    </div>
  );
}
