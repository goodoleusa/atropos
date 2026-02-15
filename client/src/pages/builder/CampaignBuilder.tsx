import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Layout, GitBranch, Share2, Save, Trash2, Edit3, Link as LinkIcon, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Node {
  id: string;
  title: string;
  content: string;
  type: 'start' | 'choice' | 'outcome';
  x: number;
  y: number;
}

const TEMPLATES = [
  {
    name: 'Basic OSINT',
    nodes: [
      { id: '1', title: 'Target Selection', content: 'Choose a primary domain or username.', type: 'start' as const, x: 50, y: 50 },
      { id: '2', title: 'WHOIS Lookup', content: 'Gather registration data.', type: 'choice' as const, x: 300, y: 50 },
      { id: '3', title: 'DNS Enumeration', content: 'Scan for subdomains.', type: 'choice' as const, x: 300, y: 200 }
    ]
  },
  {
    name: 'Ransomware Trace',
    nodes: [
      { id: '1', title: 'Initial Infection', content: 'Identify the entry vector.', type: 'start' as const, x: 50, y: 150 },
      { id: '2', title: 'C2 Discovery', content: 'Trace outbound connections.', type: 'choice' as const, x: 300, y: 150 }
    ]
  }
];

export default function CampaignBuilder() {
  const [nodes, setNodes] = useState<Node[]>(TEMPLATES[0].nodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { toast } = useToast();

  const addNode = () => {
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Investigation Node',
      content: 'Define the clues or actions here...',
      type: 'choice',
      x: 100,
      y: 100
    };
    setNodes([...nodes, newNode]);
    toast({ title: "Node Created", description: "Position your new node in the architect." });
  };

  const applyTemplate = (templateName: string) => {
    const template = TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setNodes(template.nodes);
      toast({ title: "Template Applied", description: `Loaded ${templateName} workflow.` });
    }
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNode === id) setSelectedNode(null);
  };

  return (
    <div className="p-8 space-y-8 bg-stone-950 min-h-screen text-stone-200 font-sans selection:bg-amber-500/30">
      <header className="flex justify-between items-center border-b border-stone-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Layout className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-amber-500 tracking-tight">Campaign Architect</h1>
            <p className="text-stone-400 text-sm">Twine-inspired narrative design for security training</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-stone-700 hover:bg-stone-900" showParticles>
            <Share2 className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="border-stone-700 hover:bg-stone-900">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={addNode} className="bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/20" showParticles>
            <Plus className="w-4 h-4 mr-2" />
            New Node
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest px-2">Templates</h2>
            <div className="space-y-1">
              {TEMPLATES.map(t => (
                <Button 
                  key={t.name} 
                  variant="ghost" 
                  onClick={() => applyTemplate(t.name)}
                  className="w-full justify-start text-stone-400 hover:text-amber-500 hover:bg-amber-500/5 group"
                >
                  <Layout className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {t.name}
                </Button>
              ))}
            </div>
          </section>

          {selectedNode && (
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-stone-900/50 border border-stone-800 rounded-xl space-y-4 shadow-inner"
            >
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center justify-between">
                Properties
                <Edit3 className="w-3 h-3" />
              </h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-500 font-bold uppercase">Node Title</label>
                  <input 
                    className="w-full bg-stone-950 border border-stone-800 rounded px-2 py-1 text-sm focus:border-amber-500 outline-none transition-colors"
                    value={nodes.find(n => n.id === selectedNode)?.title}
                    onChange={(e) => {
                      setNodes(nodes.map(n => n.id === selectedNode ? { ...n, title: e.target.value } : n));
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-stone-500 font-bold uppercase">Clue Data / Narrative</label>
                  <textarea 
                    className="w-full bg-stone-950 border border-stone-800 rounded px-2 py-1 text-sm h-32 resize-none focus:border-amber-500 outline-none transition-colors"
                    value={nodes.find(n => n.id === selectedNode)?.content}
                    onChange={(e) => {
                      setNodes(nodes.map(n => n.id === selectedNode ? { ...n, content: e.target.value } : n));
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-[10px] uppercase font-bold tracking-wider">
                    <LinkIcon className="w-3 h-3 mr-1" /> Link
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => deleteNode(selectedNode)}
                    className="flex-1 text-[10px] uppercase font-bold tracking-wider border-red-900/50 text-red-500 hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </motion.section>
          )}
        </aside>

        <main className="md:col-span-3 min-h-[700px] border border-stone-800 rounded-2xl relative overflow-hidden bg-stone-900/10 backdrop-blur-sm group">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-[0.05]" 
               style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button size="sm" variant="outline" className="bg-stone-950/80 backdrop-blur border-stone-800">
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
          </div>

          <AnimatePresence>
            {nodes.map((node) => (
              <motion.div 
                key={node.id}
                drag
                dragMomentum={false}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onDragStart={() => setSelectedNode(node.id)}
                onClick={() => setSelectedNode(node.id)}
                style={{ left: node.x, top: node.y }}
                className="absolute w-56 z-10 group/node"
              >
                <Card className={`
                  bg-stone-950/90 border-2 shadow-2xl cursor-move transition-all duration-300
                  ${selectedNode === node.id ? 'border-amber-500 shadow-amber-500/10 ring-1 ring-amber-500/20' : 'border-stone-800 hover:border-stone-600'}
                `}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                        node.type === 'start' ? 'bg-amber-500/20 text-amber-500' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {node.type}
                      </div>
                      <GitBranch className={`w-3 h-3 transition-colors ${selectedNode === node.id ? 'text-amber-500' : 'text-stone-700'}`} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold truncate pr-4 text-stone-100 uppercase tracking-wide">{node.title}</h3>
                      <p className="text-[10px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">{node.content}</p>
                    </div>
                    <div className="h-1 w-full bg-stone-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: selectedNode === node.id ? '100%' : '30%' }}
                        className={`h-full transition-colors ${selectedNode === node.id ? 'bg-amber-500' : 'bg-stone-700'}`} 
                      />
                    </div>
                  </CardContent>
                </Card>
                {/* Visual Connector Handle Mockup */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-stone-800 border-2 border-stone-950 scale-0 group-hover/node:scale-100 transition-transform cursor-crosshair hover:bg-amber-500" />
              </motion.div>
            ))}
          </AnimatePresence>

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-stone-600">
              <div className="text-center space-y-4">
                <Layout className="w-12 h-12 mx-auto opacity-20" />
                <p className="text-sm font-medium">Empty Architect Canvas</p>
                <Button variant="outline" size="sm" onClick={addNode}>Start Building</Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
