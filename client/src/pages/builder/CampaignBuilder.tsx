import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Layout, GitBranch, Share2, Save, 
  Trash2, Edit3, Link as LinkIcon, Eye, 
  File, Folder, ChevronRight, Menu, X,
  Search as SearchIcon, FileText, Settings,
  Code, Maximize2, Minimize2, Network,
  BookOpen, Zap, Terminal, Shield, Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- Types ---
interface Node {
  id: string;
  title: string;
  content: string;
  type: 'start' | 'choice' | 'outcome' | 'tool' | 'clue';
  x: number;
  y: number;
  metadata?: Record<string, any>;
}

interface CampaignArc {
  name: string;
  description: string;
  nodes: Node[];
}

// --- Templates (Mini Arcs) ---
const ARC_TEMPLATES: CampaignArc[] = [
  {
    name: 'Phantom Thread (Initial Access)',
    description: 'A 3-node arc focusing on credential harvesting via a fake login portal.',
    nodes: [
      { 
        id: 'pt-1', 
        title: 'The Bait', 
        content: '# The Bait\nTarget received an urgent security alert regarding their [[O365 Account]].\n\nObjective: Use the [[Social Engineering]] toolkit to craft a convincing email.', 
        type: 'start', 
        x: 100, 
        y: 100 
      },
      { 
        id: 'pt-2', 
        title: 'Login Capture', 
        content: '# Login Capture\nThe target clicked the link. They are now at the [[Fake Portal]].\n\nSetup a listener on the [[C2 Framework]] to capture POST requests.', 
        type: 'choice', 
        x: 400, 
        y: 100 
      },
      { 
        id: 'pt-3', 
        title: 'Session Established', 
        content: '# Session Established\nSuccess. Credentials captured. Use the token to access the [[Internal Database]].', 
        type: 'outcome', 
        x: 700, 
        y: 100 
      }
    ]
  },
  {
    name: 'Ghost in the Machine (Persistence)',
    description: 'Establish long-term access via scheduled tasks and registry keys.',
    nodes: [
      { 
        id: 'gm-1', 
        title: 'Discovery', 
        content: 'Identify high-value targets in the [[Active Directory]].', 
        type: 'start', 
        x: 100, 
        y: 100 
      },
      { 
        id: 'gm-2', 
        title: 'Registry Injection', 
        content: 'Inject a malicious DLL into the `RunOnce` key.', 
        type: 'tool', 
        x: 400, 
        y: 100 
      }
    ]
  }
];

export default function CampaignBuilder() {
  const [nodes, setNodes] = useState<Node[]>(ARC_TEMPLATES[0].nodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'editor' | 'preview'>('canvas');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('files');
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddNode = () => {
    const newNode: Node = {
      id: `node-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Page',
      content: '# New Page\nWrite your investigation narrative here using [[wikilinks]].',
      type: 'choice',
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const updateNode = (id: string, updates: Partial<Node>) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const applyArc = (arc: CampaignArc) => {
    setNodes(arc.nodes);
    toast({ title: "Arc Loaded", description: `Injected "${arc.name}" template.` });
  };

  const renderWikilinks = (content: string) => {
    const parts = content.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const title = part.slice(2, -2);
        return (
          <button
            key={i}
            onClick={() => {
              const target = nodes.find(n => n.title.toLowerCase() === title.toLowerCase());
              if (target) setSelectedNodeId(target.id);
            }}
            className="text-amber-500 font-mono font-bold hover:underline"
          >
            {title}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-stone-300 font-mono selection:bg-amber-500/30 overflow-hidden">
      {/* Top Header / Toolbar */}
      <header className="h-14 border-b border-stone-800 bg-stone-950 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-amber-500">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h1 className="font-bold tracking-tighter text-amber-500 hidden sm:block uppercase">Nexus Architect</h1>
            <Badge variant="outline" className="text-[10px] border-amber-900/50 text-amber-600 bg-amber-950/20">BETA v2</Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-stone-900/50 p-1 rounded-md border border-stone-800">
          <Button 
            variant={viewMode === 'canvas' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('canvas')}
            className="h-8 text-[10px] uppercase font-bold"
          >
            <Network className="w-3.5 h-3.5 mr-1.5" /> Canvas
          </Button>
          <Button 
            variant={viewMode === 'editor' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('editor')}
            className="h-8 text-[10px] uppercase font-bold"
          >
            <Code className="w-3.5 h-3.5 mr-1.5" /> Editor
          </Button>
          <Button 
            variant={viewMode === 'preview' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('preview')}
            className="h-8 text-[10px] uppercase font-bold"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex border-stone-800 text-stone-400 h-9">
            <Share2 className="w-4 h-4 mr-2" /> Publish
          </Button>
          <Button className="bg-amber-600 hover:bg-amber-500 text-black h-9 font-bold px-4">
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar / Filetree */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobile ? '100%' : 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={`
                bg-stone-950 border-r border-stone-800 flex flex-col z-40
                ${isMobile ? 'absolute inset-0' : 'relative'}
              `}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-stone-800 flex items-center justify-between">
                  <TabsList className="bg-stone-900 border-none h-8 w-full">
                    <TabsTrigger value="files" className="text-[10px] uppercase font-bold flex-1">Files</TabsTrigger>
                    <TabsTrigger value="arcs" className="text-[10px] uppercase font-bold flex-1">Arcs</TabsTrigger>
                    <TabsTrigger value="meta" className="text-[10px] uppercase font-bold flex-1">Meta</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 p-2">
                  <TabsContent value="files" className="mt-0 space-y-4 flex-1">
                    <div className="space-y-1">
                      <div className="px-2 py-1 text-[9px] text-stone-500 uppercase tracking-widest font-bold flex items-center gap-2">
                        <Folder className="w-3 h-3" /> Root Campaign
                      </div>
                      {nodes.map(node => (
                        <Button
                          key={node.id}
                          variant="ghost"
                          onClick={() => {
                            setSelectedNodeId(node.id);
                            if (isMobile) setIsSidebarOpen(false);
                          }}
                          className={`
                            w-full justify-start text-[11px] h-9 px-3 gap-2
                            ${selectedNodeId === node.id ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500' : 'text-stone-400 hover:bg-stone-900'}
                          `}
                        >
                          <File className="w-3.5 h-3.5 opacity-50" />
                          <span className="truncate">{node.title}</span>
                        </Button>
                      ))}
                      <Button 
                        variant="ghost" 
                        onClick={handleAddNode}
                        className="w-full justify-start text-[10px] h-9 text-stone-600 border border-dashed border-stone-800 mt-2"
                      >
                        <Plus className="w-3.5 h-3.5 mr-2" /> New Node
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="arcs" className="mt-0 space-y-4 flex-1">
                    <div className="p-2 space-y-3">
                      <h3 className="text-[10px] text-amber-500/70 font-bold uppercase tracking-widest mb-2">Mini Arcs</h3>
                      {ARC_TEMPLATES.map(arc => (
                        <Card key={arc.name} className="bg-stone-900/50 border-stone-800 hover:border-amber-900/50 cursor-pointer transition-colors" onClick={() => applyArc(arc)}>
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center gap-2 text-amber-500">
                              <Zap className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-bold">{arc.name}</span>
                            </div>
                            <p className="text-[9px] text-stone-500 leading-tight">{arc.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Workspace */}
        <main className="flex-1 relative bg-stone-950 flex flex-col overflow-hidden">
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
          />

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 flex flex-col overflow-hidden">
            <TabsContent value="canvas" className="m-0 h-full w-full relative overflow-auto flex-1">
              <div className="min-w-[2000px] min-h-[2000px] relative p-20">
                {nodes.map(node => (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      updateNode(node.id, { x: node.x + info.offset.x, y: node.y + info.offset.y });
                    }}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{ left: node.x, top: node.y }}
                    className="absolute cursor-move z-10"
                  >
                    <Card className={`
                      w-48 bg-stone-950/90 border-2 backdrop-blur-md transition-all
                      ${selectedNodeId === node.id ? 'border-amber-500 shadow-xl shadow-amber-500/10 scale-105' : 'border-stone-800 hover:border-stone-700'}
                    `}>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[8px] border-stone-800 text-stone-500 font-bold uppercase tracking-tighter">
                            {node.type}
                          </Badge>
                          <Settings className="w-3 h-3 text-stone-800" />
                        </div>
                        <h3 className="text-[11px] font-bold truncate text-stone-100 uppercase tracking-wide">{node.title}</h3>
                        <div className="text-[9px] text-stone-600 line-clamp-2 italic leading-tight">
                          {node.content.substring(0, 50)}...
                        </div>
                      </CardContent>
                    </Card>
                    {/* Visual Connector Handle */}
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-stone-700 border border-stone-950 group-hover:bg-amber-500 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="editor" className="m-0 h-full w-full flex flex-col p-4 sm:p-8 flex-1">
              {selectedNode ? (
                <div className="max-w-4xl mx-auto w-full space-y-6 flex-1 flex flex-col">
                  <div className="space-y-2">
                    <Input 
                      value={selectedNode.title}
                      onChange={e => updateNode(selectedNode.id, { title: e.target.value })}
                      className="text-2xl font-black bg-transparent border-none p-0 focus-visible:ring-0 text-amber-500 h-auto uppercase tracking-tighter"
                    />
                    <div className="flex gap-2">
                      <Badge className="bg-stone-900 text-stone-500 border-stone-800 h-5 text-[9px]">{selectedNode.id}</Badge>
                      <Badge className="bg-amber-950/30 text-amber-500 border-amber-900/30 h-5 text-[9px] uppercase">{selectedNode.type}</Badge>
                    </div>
                  </div>
                  <Textarea 
                    value={selectedNode.content}
                    onChange={e => updateNode(selectedNode.id, { content: e.target.value })}
                    className="flex-1 bg-stone-900/30 border-stone-800 text-stone-300 resize-none font-mono text-sm leading-relaxed focus:border-amber-900/50 p-6 rounded-xl"
                    placeholder="# Start typing your markdown here..."
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-stone-600 italic text-sm">
                  Select a node to edit its content.
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="m-0 h-full w-full overflow-y-auto p-4 sm:p-12 flex-1">
              {selectedNode ? (
                <div className="max-w-3xl mx-auto w-full prose prose-invert prose-stone">
                  <div className="border-l-4 border-amber-500 pl-6 py-2 mb-8 bg-amber-500/5">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-0">{selectedNode.title}</h1>
                    <p className="text-stone-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Node Type: {selectedNode.type}</p>
                  </div>
                  <div className="text-lg text-stone-400 leading-relaxed whitespace-pre-wrap">
                    {renderWikilinks(selectedNode.content)}
                  </div>
                  {/* Simulated Outgoing Links Section */}
                  <div className="mt-12 pt-8 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {nodes.filter(n => selectedNode.content.toLowerCase().includes(`[[${n.title.toLowerCase()}]]`)).map(n => (
                      <Button 
                        key={n.id} 
                        variant="outline" 
                        className="justify-between h-14 border-stone-800 hover:border-amber-900/50 bg-stone-900/50 hover:bg-amber-950/20 group"
                        onClick={() => setSelectedNodeId(n.id)}
                      >
                        <span className="text-xs uppercase font-bold text-stone-400 group-hover:text-amber-500 transition-colors">{n.title}</span>
                        <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-amber-500 transition-colors" />
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-stone-600">
                  Select a node to preview.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Node Detail Sheet (Desktop Only, Right Side) */}
        {!isMobile && selectedNode && viewMode === 'canvas' && (
          <aside className="w-80 bg-stone-950 border-l border-stone-800 p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Page Settings</h2>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedNodeId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-amber-500/70 font-bold uppercase">Display Title</label>
                <Input 
                  value={selectedNode.title}
                  onChange={e => updateNode(selectedNode.id, { title: e.target.value })}
                  className="bg-stone-900 border-stone-800 h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-amber-500/70 font-bold uppercase">Node Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {['start', 'choice', 'outcome', 'tool', 'clue'].map(type => (
                    <Button
                      key={type}
                      variant={selectedNode.type === type ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => updateNode(selectedNode.id, { type: type as any })}
                      className="h-8 text-[9px] uppercase font-bold border-stone-800"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="bg-stone-800" />

              <div className="space-y-2">
                <label className="text-[9px] text-stone-500 font-bold uppercase">Internal Refs</label>
                <div className="bg-stone-900 rounded-md p-3 space-y-2 border border-stone-800">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500">Backlinks</span>
                    <Badge className="bg-stone-800 text-stone-500 border-none px-1 h-4 min-w-[16px] flex justify-center">0</Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500">Outgoing</span>
                    <Badge className="bg-amber-950/30 text-amber-600 border-none px-1 h-4 min-w-[16px] flex justify-center">
                      {nodes.filter(n => selectedNode.content.toLowerCase().includes(`[[${n.title.toLowerCase()}]]`)).length}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-900/30 h-10 text-[10px] uppercase font-bold"
                onClick={() => deleteNode(selectedNode.id)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Purge Node
              </Button>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Bottom Navigation (Floating) */}
      {isMobile && selectedNode && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-6 right-6 z-50 bg-amber-600 rounded-2xl p-4 shadow-2xl flex items-center justify-between text-black"
        >
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Editing Page</span>
            <span className="text-xs font-bold uppercase truncate max-w-[150px]">{selectedNode.title}</span>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="bg-black/10 rounded-full h-10 w-10" onClick={() => setViewMode('editor')}>
              <Edit3 className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" className="bg-black/10 rounded-full h-10 w-10" onClick={() => setViewMode('preview')}>
              <BookOpen className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" className="bg-black/10 rounded-full h-10 w-10" onClick={() => setSelectedNodeId(null)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
