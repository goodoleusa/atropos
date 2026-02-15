import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, Layout, GitBranch, Share2 } from "lucide-react";

export default function CampaignBuilder() {
  return (
    <div className="p-8 space-y-8 bg-stone-950 min-h-screen text-stone-200">
      <header className="flex justify-between items-center border-b border-stone-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-500">Campaign Architect</h1>
          <p className="text-stone-400">Design branch-based investigation narratives</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-stone-700">
            <Share2 className="w-4 h-4 mr-2" />
            Export Twine
          </Button>
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            New Node
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="space-y-4">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Templates</h2>
          <div className="space-y-2">
            {['Basic OSINT', 'Ransomware Trace', 'Social Engineering'].map(template => (
              <Button key={template} variant="ghost" className="w-full justify-start text-stone-400 hover:text-amber-500 hover:bg-stone-900/50">
                <Layout className="w-4 h-4 mr-2" />
                {template}
              </Button>
            ))}
          </div>
        </aside>

        <main className="md:col-span-3 min-h-[600px] border-2 border-dashed border-stone-800 rounded-xl relative overflow-hidden bg-stone-900/20">
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#b45309 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          {/* Mock Node */}
          <motion.div 
            drag
            dragMomentum={false}
            className="absolute top-20 left-20 w-48"
          >
            <Card className="bg-stone-900 border-amber-900/50 shadow-xl cursor-move hover:border-amber-500 transition-colors">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-tighter">Start</span>
                  <GitBranch className="w-3 h-3 text-stone-600" />
                </div>
                <h3 className="text-sm font-medium">Initial Breach</h3>
                <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-1/3" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
