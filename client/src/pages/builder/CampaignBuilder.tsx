import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Save, Edit3, Eye, Menu, X, Code, Network, Shield, Share2,
  FileText, ChevronDown, Clock, BookOpen, Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import {
  Campaign, CampaignNode, HiddenClue, ClueType, ArcTemplate,
  uid, mkNode, mkLink, mkClue, emptyCampaign
} from '@/components/campaign/CampaignTypes';
import { ARC_TEMPLATES } from '@/components/campaign/ArcTemplates';
import { exportCampaignJSON, exportCampaignObsidian } from '@/components/campaign/campaignExport';
import { importFiles } from '@/components/campaign/campaignImport';
import BuilderSidebar from '@/components/campaign/BuilderSidebar';
import BuilderCanvas from '@/components/campaign/BuilderCanvas';
import BuilderEditor from '@/components/campaign/BuilderEditor';
import BuilderPreview from '@/components/campaign/BuilderPreview';
import NodePropertiesPanel from '@/components/campaign/NodePropertiesPanel';

export default function CampaignBuilder() {
  const [location] = useLocation();
  const { toast } = useToast();

  const [campaign, setCampaign] = useState<Campaign>(emptyCampaign);
  const [savedCampaigns, setSavedCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'editor' | 'preview'>('canvas');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [campaignSelectorOpen, setCampaignSelectorOpen] = useState(false);
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const dirtyRef = useRef(false);

  const selectedNode = useMemo(
    () => campaign.nodes.find(n => n.id === selectedNodeId) || null,
    [campaign.nodes, selectedNodeId]
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetchCampaignList();
    const params = new URLSearchParams(location.split('?')[1] || '');
    const cid = params.get('campaign');
    if (cid) {
      loadCampaign(cid);
    } else {
      const arcId = params.get('arc');
      const pageName = params.get('page');
      const pageLayout = params.get('layout');
      if (arcId) {
        const tmpl = ARC_TEMPLATES.find((t: any) => t.id === arcId || t.name?.toLowerCase().replace(/\s+/g, '-') === arcId);
        if (tmpl) {
          setCampaign({
            ...emptyCampaign,
            id: uid(),
            name: tmpl.name || arcId,
            description: tmpl.description || '',
            category: (tmpl as any).category || 'recon',
            nodes: tmpl.nodes?.map((n: any) => mkNode(n.title || n.name || 'Node', n.type || 'scene', n.content || '')) || [],
          });
          toast({ title: `Loaded arc template: ${tmpl.name || arcId}` });
        }
      } else if (pageName) {
        setCampaign({
          ...emptyCampaign,
          id: uid(),
          name: decodeURIComponent(pageName),
          description: `Page layout: ${pageLayout || 'card'}`,
        });
      }
    }
  }, []);

  const fetchCampaignList = async () => {
    try {
      const r = await fetch('/api/designer/campaigns');
      if (r.ok) {
        const data = await r.json();
        setSavedCampaigns(data.map((c: any) => ({ id: c.campaignId, name: c.name })));
      }
    } catch {}
  };

  const loadCampaign = async (id: string) => {
    try {
      const r = await fetch(`/api/designer/campaigns/${id}`);
      if (r.ok) {
        const c = await r.json();
        setCampaign({
          id: c.campaignId, name: c.name || '', description: c.description || '',
          category: c.category || 'recon', difficulty: c.difficulty || 'beginner',
          estimatedTime: c.estimatedTime || '30 min',
          nodes: c.nodes || [], links: c.links || [], rootNodes: c.rootNodes || [],
          isChunk: c.isChunk || false, entryPoints: c.entryPoints || [],
          exitPoints: c.exitPoints || [], clueRefs: c.clueRefs || [],
          hiddenClues: c.hiddenClues || [], tags: c.tags || [],
          isPublished: c.isPublished || false,
        });
        setSelectedNodeId(null);
        dirtyRef.current = false;
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load campaign', variant: 'destructive' });
    }
  };

  const saveCampaign = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const { id, ...rest } = campaign;
      const r = await fetch(`/api/designer/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest),
      });
      if (r.ok) {
        setLastSaved(new Date());
        dirtyRef.current = false;
        fetchCampaignList();
        toast({ title: 'Saved', description: `"${campaign.name}" saved.` });
      } else throw new Error();
    } catch {
      toast({ title: 'Error', description: 'Save failed', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [campaign, isSaving]);

  const publishToggle = async () => {
    if (dirtyRef.current) await saveCampaign();
    setIsPublishing(true);
    try {
      const endpoint = campaign.isPublished ? 'unpublish' : 'publish';
      const r = await fetch(`/api/designer/campaigns/${campaign.id}/${endpoint}`, { method: 'POST' });
      if (r.ok) {
        setCampaign(p => ({ ...p, isPublished: !p.isPublished }));
        toast({ title: campaign.isPublished ? 'Unpublished' : 'Published' });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
    setIsPublishing(false);
  };

  const markDirty = () => {
    dirtyRef.current = true;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => { if (dirtyRef.current) saveCampaign(); }, 5000);
  };

  const updateCampaign = (updates: Partial<Campaign>) => {
    setCampaign(p => ({ ...p, ...updates }));
    markDirty();
  };

  const updateNode = (id: string, updates: Partial<CampaignNode>) => {
    setCampaign(p => ({ ...p, nodes: p.nodes.map(n => n.id === id ? { ...n, ...updates } : n) }));
    markDirty();
  };

  const deleteNode = (id: string) => {
    setCampaign(p => ({
      ...p,
      nodes: p.nodes.filter(n => n.id !== id),
      links: p.links.filter(l => l.source !== id && l.target !== id),
      hiddenClues: p.hiddenClues.filter(c => c.nodeId !== id),
    }));
    if (selectedNodeId === id) setSelectedNodeId(null);
    markDirty();
  };

  const addNode = (type: CampaignNode['type'] = 'step') => {
    const maxY = campaign.nodes.reduce((m, n) => Math.max(m, n.y), 0);
    const n = mkNode(`node-${uid()}`, type, 'New Node', '', 100, maxY + 160);
    setCampaign(p => ({ ...p, nodes: [...p.nodes, n] }));
    setSelectedNodeId(n.id);
    markDirty();
  };

  const addLink = (source: string, target: string) => {
    if (source === target || campaign.links.some(l => l.source === source && l.target === target)) return;
    setCampaign(p => ({ ...p, links: [...p.links, mkLink(source, target)] }));
    markDirty();
  };

  const applyArc = (arc: ArcTemplate) => {
    const offsetX = campaign.nodes.reduce((m, n) => Math.max(m, n.x + n.width), 0) + 80;
    const offsetY = 80;
    const idMap: Record<string, string> = {};
    const newNodes = arc.nodes.map(n => {
      const newId = `${n.id}-${uid()}`;
      idMap[n.id] = newId;
      return { ...n, id: newId, x: n.x + offsetX, y: n.y + offsetY };
    });
    const newLinks = arc.links.map(l => ({
      ...l, id: `link-${uid()}`, source: idMap[l.source], target: idMap[l.target],
    }));
    const newClues = arc.clues.map(c => ({
      ...c, id: `clue-${uid()}`, nodeId: idMap[c.nodeId],
    }));
    setCampaign(p => ({
      ...p,
      nodes: [...p.nodes, ...newNodes],
      links: [...p.links, ...newLinks],
      hiddenClues: [...p.hiddenClues, ...newClues],
    }));
    markDirty();
    toast({ title: 'Arc Added', description: `"${arc.name}" injected with ${newNodes.length} nodes and ${newClues.length} clues.` });
  };

  const addClue = (clue: HiddenClue) => {
    setCampaign(p => ({ ...p, hiddenClues: [...p.hiddenClues, clue] }));
    markDirty();
  };

  const deleteClue = (id: string) => {
    setCampaign(p => ({ ...p, hiddenClues: p.hiddenClues.filter(c => c.id !== id) }));
    markDirty();
  };

  const handleExport = (format: string) => {
    if (format === 'json') {
      exportCampaignJSON(campaign);
      toast({ title: 'Campaign exported as JSON' });
    } else if (format === 'obsidian') {
      const count = exportCampaignObsidian(campaign);
      toast({ title: 'Exported for Obsidian', description: `${count} files with clues, layouts, and learning goals` });
    }
  };

  const handleImport = async (files: FileList) => {
    try {
      const imported = await importFiles(files);
      if (imported) {
        setCampaign(imported);
        setSelectedNodeId(null);
        dirtyRef.current = true;
        toast({
          title: 'Campaign Imported',
          description: `"${imported.name}" with ${imported.nodes.length} nodes and ${imported.hiddenClues.length} clues.`,
        });
      }
    } catch (err) {
      toast({ title: 'Import Failed', description: 'Could not parse the file(s).', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-stone-300 selection:bg-amber-500/30 overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-stone-800 bg-stone-950 flex items-center justify-between px-3 z-50 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button data-testid="toggle-sidebar" variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-amber-500 shrink-0">
            <Menu className="w-5 h-5" />
          </Button>
          <Shield className="w-5 h-5 text-amber-500 shrink-0 hidden sm:block" />
          <h1 className="font-bold tracking-tighter text-amber-500 hidden md:block uppercase text-sm">Nexus Architect</h1>
          <Separator orientation="vertical" className="h-6 bg-stone-800 hidden sm:block" />
          <div className="relative hidden sm:block">
            <Button data-testid="select-campaign" variant="outline" size="sm" className="border-stone-800 text-stone-400 h-8 text-xs max-w-[180px] truncate" onClick={() => setCampaignSelectorOpen(true)}>
              <ChevronDown className="w-3 h-3 mr-1 shrink-0" />{campaign.name}
            </Button>
          </div>
          <Button data-testid="new-campaign" variant="ghost" size="sm" className="text-stone-500 h-8 text-xs hidden sm:flex" onClick={() => { setCampaign(emptyCampaign()); setSelectedNodeId(null); dirtyRef.current = false; }}>
            <Plus className="w-3.5 h-3.5 mr-1" />New
          </Button>
          {lastSaved && (
            <span className="text-[9px] text-stone-600 hidden lg:flex items-center gap-1">
              <Clock className="w-3 h-3" />{lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-stone-900/50 p-0.5 rounded-md border border-stone-800">
          {(['canvas', 'editor', 'preview'] as const).map(m => (
            <Button key={m} data-testid={`view-${m}`} variant={viewMode === m ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode(m)} className="h-7 text-[10px] uppercase font-bold px-2">
              {m === 'canvas' ? <Network className="w-3.5 h-3.5 sm:mr-1" /> : m === 'editor' ? <Code className="w-3.5 h-3.5 sm:mr-1" /> : <Eye className="w-3.5 h-3.5 sm:mr-1" />}
              <span className="hidden sm:inline">{m}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <select
            data-testid="export-dropdown"
            className="hidden sm:block bg-stone-900 border border-stone-800 text-stone-400 text-xs h-8 px-2 rounded-md"
            value=""
            onChange={e => { if (e.target.value) { handleExport(e.target.value); e.target.value = ''; } }}
          >
            <option value="" disabled>Export</option>
            <option value="json">JSON</option>
            <option value="obsidian">Obsidian</option>
          </select>
          <Button data-testid="publish-campaign" variant="outline" size="sm" className={`hidden sm:flex border-stone-800 h-8 text-xs ${campaign.isPublished ? 'text-green-400 border-green-900/50' : 'text-stone-400'}`} onClick={publishToggle} disabled={isPublishing}>
            <Share2 className="w-3.5 h-3.5 mr-1" />{campaign.isPublished ? 'Live' : 'Publish'}
          </Button>
          <Button data-testid="save-campaign" className="bg-amber-600 hover:bg-amber-500 text-black h-8 font-bold px-3 text-xs" onClick={saveCampaign} disabled={isSaving}>
            <Save className="w-3.5 h-3.5 mr-1" />{isSaving ? '...' : 'Save'}
          </Button>
        </div>
      </header>

      {/* Campaign Selector Dialog */}
      <Dialog open={campaignSelectorOpen} onOpenChange={setCampaignSelectorOpen}>
        <DialogContent className="bg-stone-950 border-stone-800 max-w-md">
          <DialogHeader><DialogTitle className="text-amber-500">Load Campaign</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-1">
              {savedCampaigns.map(c => (
                <Button key={c.id} data-testid={`load-campaign-${c.id}`} variant="ghost" className="w-full justify-start text-xs text-stone-300 h-9" onClick={() => { loadCampaign(c.id); setCampaignSelectorOpen(false); }}>
                  <FileText className="w-3.5 h-3.5 mr-2 text-amber-500/50" />{c.name}
                </Button>
              ))}
              {savedCampaigns.length === 0 && <p className="text-xs text-stone-600 p-4 text-center">No saved campaigns yet.</p>}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobile ? '100%' : 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={`z-40 ${isMobile ? 'absolute inset-0' : 'relative'}`}
            >
              <BuilderSidebar
                campaign={campaign}
                selectedNodeId={selectedNodeId}
                isMobile={isMobile}
                onSelectNode={id => { setSelectedNodeId(id); if (isMobile) setIsSidebarOpen(false); }}
                onAddNode={addNode}
                onApplyArc={applyArc}
                onAddClue={addClue}
                onDeleteClue={deleteClue}
                onUpdateCampaign={updateCampaign}
                onImportFiles={handleImport}
                onClose={() => setIsSidebarOpen(false)}
                arcTemplates={ARC_TEMPLATES}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 relative bg-stone-950 flex flex-col overflow-hidden">
          {viewMode === 'canvas' && (
            <BuilderCanvas
              campaign={campaign}
              selectedNodeId={selectedNodeId}
              linkingFrom={linkingFrom}
              onSelectNode={setSelectedNodeId}
              onUpdateNode={updateNode}
              onAddLink={addLink}
              onSetLinkingFrom={setLinkingFrom}
              onAddNode={() => addNode()}
            />
          )}
          {viewMode === 'editor' && (
            <BuilderEditor node={selectedNode} onUpdateNode={updateNode} />
          )}
          {viewMode === 'preview' && (
            <BuilderPreview campaign={campaign} node={selectedNode} onSelectNode={setSelectedNodeId} />
          )}
        </main>

        {/* Properties Panel */}
        {!isMobile && selectedNode && viewMode === 'canvas' && (
          <NodePropertiesPanel
            campaign={campaign}
            node={selectedNode}
            onUpdateNode={updateNode}
            onDeleteNode={deleteNode}
            onSelectNode={setSelectedNodeId}
            linkingFrom={linkingFrom}
            onSetLinkingFrom={setLinkingFrom}
          />
        )}
      </div>

      {/* Mobile Bottom Bar */}
      {isMobile && selectedNode && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-4 left-4 right-4 z-50 bg-amber-600 rounded-xl p-3 shadow-2xl flex items-center justify-between text-black">
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Selected</span>
            <span className="text-xs font-bold uppercase truncate">{selectedNode.title}</span>
          </div>
          <div className="flex gap-1.5">
            <Button data-testid="mobile-edit" size="icon" variant="ghost" className="bg-black/10 rounded-full h-9 w-9" onClick={() => setViewMode('editor')}>
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button data-testid="mobile-preview" size="icon" variant="ghost" className="bg-black/10 rounded-full h-9 w-9" onClick={() => setViewMode('preview')}>
              <BookOpen className="w-4 h-4" />
            </Button>
            <Button data-testid="mobile-delete" size="icon" variant="ghost" className="bg-black/10 rounded-full h-9 w-9" onClick={() => deleteNode(selectedNode.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button data-testid="mobile-deselect" size="icon" variant="ghost" className="bg-black/10 rounded-full h-9 w-9" onClick={() => setSelectedNodeId(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
