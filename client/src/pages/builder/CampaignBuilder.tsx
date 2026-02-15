import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Layout, GitBranch, Share2, Save, 
  Trash2, Edit3, Link as LinkIcon, Eye, 
  File, Folder, ChevronRight, Menu, X,
  Search as SearchIcon, FileText
} from "lucide-react";
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
      { id: '1', title: 'Target Selection', content: 'Choose a primary domain or username. Refer to [[OSINT Methods]] for guidance.', type: 'start' as const, x: 50, y: 50 },
      { id: '2', title: 'WHOIS Lookup', content: 'Gather registration data.', type: 'choice' as const, x: 300, y: 50 },
      { id: '3', title: 'DNS Enumeration', content: 'Scan for subdomains.', type: 'choice' as const, x: 300, y: 200 }
    ]
  },
  {
    name: 'Social Engineering',
    nodes: [
      { id: '1', title: 'Persona Setup', content: 'Craft a convincing LinkedIn profile. Mention [[Credential Harvesting]] as the goal.', type: 'start' as const, x: 50, y: 50 },
      { id: '2', title: 'Phishing Draft', content: 'Write an urgent internal security alert.', type: 'choice' as const, x: 300, y: 50 },
      { id: '3', title: 'Success Outcome', content: 'Target clicked the link. Access granted.', type: 'outcome' as const, x: 550, y: 50 }
    ]
  },
  {
    name: 'Financial Trace',
    nodes: [
      { id: '1', title: 'Wallet Discovery', content: 'Find the transaction ID in [[Dark Web Intel]].', type: 'start' as const, x: 50, y: 50 },
      { id: '2', title: 'Mixer Analysis', content: 'De-anonymize the mixer traffic.', type: 'choice' as const, x: 300, y: 50 },
      { id: '3', title: 'Exchange Off-ramp', content: 'Identify the KYC verified account.', type: 'choice' as const, x: 550, y: 50 }
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    toast({ 
      title: "Node Created", 
      description: "Position your new node in the architect.",
      duration: 2000
    });
  };

  const applyTemplate = (templateName: string) => {
    const template = TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setNodes(template.nodes);
      toast({ 
        title: "Template Applied", 
        description: `Loaded ${templateName} workflow.`,
        duration: 2000
      });
    }
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNode === id) setSelectedNode(null);
  };

  const handleWikilinkClick = (nodeTitle: string) => {
    const targetNode = nodes.find(n => n.title.toLowerCase() === nodeTitle.toLowerCase());
    if (targetNode) {
      setSelectedNode(targetNode.id);
      toast({ 
        title: "Navigated", 
        description: `Jumping to ${targetNode.title}`,
        duration: 1500
      });
    } else {
      toast({ title: "Reference Missing", description: `Node "${nodeTitle}" not found.` });
    }
  };

  const renderContentWithWikilinks = (content: string) => {
    const parts = content.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const title = part.slice(2, -2);
        return (
          <button
            key={i}
            onClick={() => handleWikilinkClick(title)}
            className="text-amber-500 hover:underline font-bold decoration-amber-500/30 transition-all"
          >
            {title}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-stone-950 text-stone-200 font-sans selection:bg-amber-500/30 overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <header className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-3">
            <Layout className="w-5 h-5 text-amber-500" />
            <h1 className="font-bold text-amber-500 uppercase tracking-tighter">Architect</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>
      )}

      {/* Sidebar / File Tree */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <motion.aside
            initial={isMobile ? { x: -300 } : { width: 300 }}
            animate={isMobile ? { x: 0 } : { width: 300 }}
            exit={isMobile ? { x: -300 } : { width: 0 }}
            className={`
              ${isMobile ? 'fixed inset-y-0 left-0 z-50 bg-stone-950 w-72' : 'relative'}
              border-r border-stone-800 flex flex-col h-full
            `}
          >
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Campaign Files</span>
              </div>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
              <section className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                  <ChevronRight className="w-3 h-3" />
                  Templates
                </div>
                {TEMPLATES.map(t => (
                  <Button
                    key={t.name}
                    variant="ghost"
                    onClick={() => applyTemplate(t.name)}
                    className="w-full justify-start text-xs h-9 text-stone-400 hover:text-amber-500 hover:bg-amber-500/5 group"
                  >
                    <FileText className="w-3.5 h-3.5 mr-2 opacity-50 group-hover:opacity-100" />
                    {t.name}
                  </Button>
                ))}
              </section>

              <section className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                  <ChevronRight className="w-3 h-3" />
                  Nodes
                </div>
                {nodes.map(node => (
                  <Button
                    key={node.id}
                    variant="ghost"
                    onClick={() => setSelectedNode(node.id)}
                    className={`
                      w-full justify-start text-xs h-9 transition-all
                      ${selectedNode === node.id ? 'bg-amber-500/10 text-amber-500' : 'text-stone-400 hover:text-stone-200'}
                    `}
                  >
                    <File className={`w-3.5 h-3.5 mr-2 ${selectedNode === node.id ? 'text-amber-500' : 'opacity-40'}`} />
                    <span className="truncate">{node.title}</span>
                  </Button>
                ))}
                <Button 
                  variant="ghost" 
                  onClick={addNode}
                  className="w-full justify-start text-xs h-9 text-stone-600 hover:text-amber-500 border border-dashed border-stone-800 mt-2"
                >
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  New Node...
                </Button>
              </section>
            </div>

            <div className="p-4 border-t border-stone-800 bg-stone-950/50">
              <Button className="w-full bg-amber-600 hover:bg-amber-500 h-10 shadow-lg shadow-amber-900/20" showParticles>
                <Save className="w-4 h-4 mr-2" />
                Commit Changes
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Canvas Area */}
      <main className="flex-1 relative overflow-hidden group">
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-[0.05]" 
          style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
        />
        
        {/* Toolbar */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          {!isMobile && (
            <>
              <Button variant="outline" size="sm" className="bg-stone-950/80 backdrop-blur border-stone-800">
                <Share2 className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button variant="outline" size="sm" className="bg-stone-950/80 backdrop-blur border-stone-800">
                <Eye className="w-4 h-4 mr-2" /> Preview
              </Button>
            </>
          )}
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
                bg-stone-950/90 border-2 shadow-2xl cursor-move transition-all duration-300 backdrop-blur-sm
                ${selectedNode === node.id ? 'border-amber-500 shadow-amber-500/10 ring-1 ring-amber-500/20 scale-105' : 'border-stone-800 hover:border-stone-600'}
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
                    <div className="text-[10px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {renderContentWithWikilinks(node.content)}
                    </div>
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

        {/* Property Sheet (Mobile Friendly) */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className={`
                fixed bottom-0 inset-x-0 z-40 bg-stone-950 border-t border-stone-800 p-6 shadow-2xl
                md:absolute md:top-4 md:right-4 md:bottom-auto md:left-auto md:w-80 md:rounded-2xl md:border
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                  <Edit3 className="w-3 h-3 text-amber-500" />
                  Node Properties
                </h2>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedNode(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-stone-500 font-bold uppercase">Node Title</label>
                  <input 
                    className="w-full bg-stone-900 border border-stone-800 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none transition-colors"
                    value={nodes.find(n => n.id === selectedNode)?.title}
                    onChange={(e) => {
                      setNodes(nodes.map(n => n.id === selectedNode ? { ...n, title: e.target.value } : n));
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-stone-500 font-bold uppercase">Clue Data / Narrative</label>
                    <span className="text-[8px] text-stone-600 bg-stone-900 px-1 rounded">[[wikilinks]] supported</span>
                  </div>
                  <textarea 
                    className="w-full bg-stone-900 border border-stone-800 rounded px-3 py-2 text-sm h-32 md:h-48 resize-none focus:border-amber-500 outline-none transition-colors"
                    value={nodes.find(n => n.id === selectedNode)?.content}
                    onChange={(e) => {
                      setNodes(nodes.map(n => n.id === selectedNode ? { ...n, content: e.target.value } : n));
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-[10px] uppercase font-bold tracking-wider h-10">
                    <LinkIcon className="w-3 h-3 mr-1.5" /> Link Node
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => deleteNode(selectedNode)}
                    className="flex-1 text-[10px] uppercase font-bold tracking-wider h-10 border-red-900/50 text-red-500 hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3 h-3 mr-1.5" /> Purge
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
