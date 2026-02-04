import { useEffect } from "react";
import { Link } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { Button } from "@/components/ui/button";
import { ClueItem } from "@/components/ClueItem";

export default function TheVoid() {
  
  useEffect(() => {
    // Add a class to body for specific styling if needed, or just rely on component styles
    document.body.style.overflow = "hidden";
    return () => {
        document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-[#000] flex items-center justify-center overflow-hidden relative perspective-1000">
        <div className="absolute inset-0 bg-[url('/assets/grid-noise.png')] opacity-10 animate-pulse bg-cover"></div>
        
        {/* Floating geometric shapes - updated colors */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-amber-900/20 rounded-full animate-ping [animation-duration:3s]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 border border-stone-800/20 rotate-45 animate-spin [animation-duration:10s]"></div>

        <div className="z-10 text-center space-y-8 max-w-2xl px-4">
            <GlitchText 
                text="CORE DUMP 0x00" 
                as="h1" 
                className="text-6xl md:text-8xl font-black text-amber-900/20 tracking-tighter mix-blend-exclusion"
            />
            
            <p className="text-stone-600 font-mono text-sm md:text-base leading-loose">
                You have reached the bottom of the melting pot. 
                <br/>
                <span className="text-amber-800">Slag and data are indistinguishable here.</span>
            </p>

            <div className="grid grid-cols-2 gap-4 mt-12">
                <div className="p-4 border border-amber-900/10 hover:bg-amber-900/5 transition-colors cursor-help">
                    <h3 className="font-orbitron text-amber-800 text-lg">01. OBSERVATION</h3>
                    <p className="text-xs text-stone-700 mt-2">Heat signatures detected.</p>
                </div>
                <div className="p-4 border border-amber-900/10 hover:bg-amber-900/5 transition-colors cursor-help flex flex-col items-center justify-center">
                    <h3 className="font-orbitron text-amber-800 text-lg">02. EXTRACTION</h3>
                     <div className="mt-2">
                        <ClueItem 
                            id="clue-void"
                            name="Void Residue"
                            description="Ash from the core."
                            content="HEX: #000000"
                            triggerText="Collect Ash"
                            className="text-stone-500 hover:text-white"
                        />
                     </div>
                </div>
            </div>

            <div className="pt-12">
                <Link href="/terminal">
                    <Button variant="ghost" className="text-xs font-mono text-stone-700 hover:text-amber-500 hover:bg-transparent">
                        &lt; RETURN_TO_SHELL /&gt;
                    </Button>
                </Link>
            </div>
        </div>
    </div>
  );
}
