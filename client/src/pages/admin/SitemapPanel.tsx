import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Map, Zap, Plus, Save, Layers, Folder, Globe, Edit, Trash2, ArrowRight,
  Rocket, Bot, MessageSquare, ShieldAlert, Bug, Beaker, Brain, FileText,
  BookOpen, Target, Terminal, Users, Trophy, Play, Eye, Database, Settings,
  Activity, ExternalLink, QrCode
} from "lucide-react";

const SITEMAP_ICONS: Record<string, any> = {
  Bot, MessageSquare, ShieldAlert, Bug, Beaker, Brain, Rocket, Layers, FileText, BookOpen,
  Globe, Target, Terminal, Users, Trophy, Play, Eye, Database, Settings, Activity, ExternalLink, QrCode,
};
const ICON_NAMES = Object.keys(SITEMAP_ICONS);

const PAGE_LAYOUTS = ['card', 'full-page', 'terminal', 'dossier', 'split'] as const;
const SITEMAP_CATEGORIES = ['Core Platform', 'Investigation Hub', 'Campaigns & Learning', 'Media & Content', 'Administration'] as const;
const SITEMAP_COLORS = ['amber', 'teal', 'purple', 'orange', 'red'] as const;

const ARC_TEMPLATE_SUMMARIES = [
  { id: 'phantom-thread', name: 'Phantom Thread', desc: 'Phishing / Initial Access', category: 'social', nodes: 4 },
  { id: 'ghost-protocol', name: 'Ghost Protocol', desc: 'Persistence / Backdoor', category: 'exploit', nodes: 3 },
  { id: 'shadow-network', name: 'Shadow Network', desc: 'OSINT Recon', category: 'osint', nodes: 5 },
  { id: 'wire-transfer', name: 'Wire Transfer', desc: 'Financial / Crypto Tracing', category: 'forensics', nodes: 4 },
  { id: 'social-spider', name: 'Social Spider', desc: 'Social Engineering', category: 'social', nodes: 4 },
  { id: 'dark-mirror', name: 'Dark Mirror', desc: 'Dark Web Intel', category: 'osint', nodes: 3 },
  { id: 'packet-storm', name: 'Packet Storm', desc: 'Network Forensics', category: 'forensics', nodes: 4 },
  { id: 'zero-day', name: 'Zero Day', desc: 'Vulnerability Research', category: 'exploit', nodes: 5 },
  { id: 'red-herring', name: 'Red Herring', desc: 'Counter-Intelligence', category: 'defense', nodes: 3 },
  { id: 'first-contact', name: 'First Contact', desc: 'Beginner Tutorial', category: 'recon', nodes: 3 },
];

export function SitemapPanel() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [newEntry, setNewEntry] = useState({ name: '', path: '', icon: 'Globe', description: '', category: 'Core Platform', color: 'amber', pageLayout: 'card', templateId: '', arcTemplateId: '' });
  const [editEntry, setEditEntry] = useState<any>(null);

  const { data: sitemapData, refetch } = useQuery({
    queryKey: ['/api/sitemap'],
    queryFn: () => fetch('/api/sitemap').then(r => r.json()),
  });

  const entries: any[] = sitemapData?.entries || [];
  const grouped = entries.reduce((acc: Record<string, any[]>, e: any) => {
    (acc[e.category] = acc[e.category] || []).push(e);
    return acc;
  }, {});

  const categoryColors: Record<string, { border: string; bg: string; text: string; dot: string; hover: string }> = {
    teal: { border: 'border-teal-900/40', bg: 'bg-teal-950/20', text: 'text-teal-400', dot: 'bg-teal-500', hover: 'hover:border-teal-700/60 hover:bg-teal-950/30' },
    purple: { border: 'border-purple-900/40', bg: 'bg-purple-950/20', text: 'text-purple-400', dot: 'bg-purple-500', hover: 'hover:border-purple-700/60 hover:bg-purple-950/30' },
    amber: { border: 'border-amber-900/40', bg: 'bg-amber-950/20', text: 'text-amber-400', dot: 'bg-amber-500', hover: 'hover:border-amber-700/60 hover:bg-amber-950/30' },
    orange: { border: 'border-orange-900/40', bg: 'bg-orange-950/20', text: 'text-orange-400', dot: 'bg-orange-500', hover: 'hover:border-orange-700/60 hover:bg-orange-950/30' },
    red: { border: 'border-red-900/40', bg: 'bg-red-950/20', text: 'text-red-400', dot: 'bg-red-500', hover: 'hover:border-red-700/60 hover:bg-red-950/30' },
  };

  const handleCreate = async () => {
    if (!newEntry.name.trim() || !newEntry.path.trim()) {
      toast({ title: "Name and path are required", variant: "destructive" });
      return;
    }
    try {
      const maxOrder = entries.length > 0 ? Math.max(...entries.map((e: any) => e.sortOrder)) : 0;
      await fetch('/api/sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEntry, isCustom: true, isPublished: false, sortOrder: maxOrder + 1, metadata: newEntry.arcTemplateId ? { arcTemplate: newEntry.arcTemplateId } : {} }),
      });
      setNewEntry({ name: '', path: '', icon: 'Globe', description: '', category: 'Core Platform', color: 'amber', pageLayout: 'card', templateId: '', arcTemplateId: '' });
      setShowAdd(false);
      refetch();
      toast({ title: "Page added to sitemap" });
    } catch (e: any) {
      toast({ title: "Failed to create entry", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editEntry) return;
    try {
      await fetch(`/api/sitemap/${editEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editEntry),
      });
      setEditingId(null);
      setEditEntry(null);
      refetch();
      toast({ title: "Entry updated" });
    } catch (e: any) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/sitemap/${id}`, { method: 'DELETE' });
      refetch();
      toast({ title: "Entry removed" });
    } catch (e: any) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleSync = async () => {
    try {
      await fetch('/api/sitemap/sync', { method: 'POST' });
      refetch();
      toast({ title: "Sitemap synced with platform routes" });
    } catch (e: any) {
      toast({ title: "Sync failed", variant: "destructive" });
    }
  };

  const openInBuilder = (entry: any) => {
    const arcId = entry.arcTemplateId || entry.metadata?.arcTemplate;
    if (arcId) {
      navigate(`/builder?arc=${encodeURIComponent(arcId)}`);
    } else {
      navigate(`/builder?page=${encodeURIComponent(entry.name)}&layout=${entry.pageLayout || 'card'}`);
    }
  };

  const applyArcTemplate = (arc: typeof ARC_TEMPLATE_SUMMARIES[0]) => {
    setNewEntry(prev => ({
      ...prev,
      name: arc.name,
      description: arc.desc,
      arcTemplateId: arc.id,
      path: `/${arc.id.replace(/\s+/g, '-').toLowerCase()}`,
      category: 'Campaigns & Learning',
      color: 'purple',
      icon: 'Rocket',
    }));
  };

  const filteredGroups = filterCategory ? { [filterCategory]: grouped[filterCategory] || [] } : grouped;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2 mb-1">
            <Map className="w-5 h-5" /> Platform Sitemap
          </h3>
          <p className="text-xs text-muted-foreground">Interactive map of all pages. Add pages, apply arc templates, open in Campaign Builder.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleSync} className="text-xs text-muted-foreground hover:text-teal-400" data-testid="sitemap-sync-btn">
            <Zap className="w-3 h-3 mr-1" /> Sync Routes
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setViewMode(v => v === 'tree' ? 'grid' : 'tree')} className="text-xs text-muted-foreground">
            {viewMode === 'tree' ? <Layers className="w-3 h-3" /> : <Folder className="w-3 h-3" />}
          </Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-amber-700 hover:bg-amber-600 text-black text-xs" data-testid="sitemap-add-btn">
            <Plus className="w-3 h-3 mr-1" /> Add Page
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setFilterCategory('')} className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${!filterCategory ? 'bg-amber-900/30 border-amber-700/50 text-amber-400' : 'bg-card/20 border-border text-muted-foreground'}`}>All</button>
        {SITEMAP_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat === filterCategory ? '' : cat)} className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${filterCategory === cat ? 'bg-amber-900/30 border-amber-700/50 text-amber-400' : 'bg-card/20 border-border text-muted-foreground'}`}>{cat}</button>
        ))}
      </div>

      {showAdd && (
        <div className="p-4 rounded-lg border border-amber-900/40 bg-amber-950/10 space-y-3" data-testid="sitemap-add-form">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5"><Plus className="w-3 h-3" /> New Page</h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">Name</label>
              <Input value={newEntry.name} onChange={e => setNewEntry(p => ({ ...p, name: e.target.value }))} className="bg-card/30 border-border h-7 text-xs text-foreground" data-testid="sitemap-name-input" />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">Path</label>
              <Input value={newEntry.path} onChange={e => setNewEntry(p => ({ ...p, path: e.target.value }))} placeholder="/my-page" className="bg-card/30 border-border h-7 text-xs text-foreground" data-testid="sitemap-path-input" />
            </div>
          </div>
          <div>
            <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">Description</label>
            <Input value={newEntry.description} onChange={e => setNewEntry(p => ({ ...p, description: e.target.value }))} className="bg-card/30 border-border h-7 text-xs text-foreground" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">Category</label>
              <select value={newEntry.category} onChange={e => setNewEntry(p => ({ ...p, category: e.target.value }))} className="w-full bg-card/30 border border-border rounded px-2 py-1 text-[10px] text-foreground">
                {SITEMAP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">Color</label>
              <select value={newEntry.color} onChange={e => setNewEntry(p => ({ ...p, color: e.target.value }))} className="w-full bg-card/30 border border-border rounded px-2 py-1 text-[10px] text-foreground">
                {SITEMAP_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">Page Layout</label>
              <select value={newEntry.pageLayout} onChange={e => setNewEntry(p => ({ ...p, pageLayout: e.target.value }))} className="w-full bg-card/30 border border-border rounded px-2 py-1 text-[10px] text-foreground" data-testid="sitemap-layout-select">
                {PAGE_LAYOUTS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">Icon</label>
              <select value={newEntry.icon} onChange={e => setNewEntry(p => ({ ...p, icon: e.target.value }))} className="w-full bg-card/30 border border-border rounded px-2 py-1 text-[10px] text-foreground">
                {ICON_NAMES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[9px] text-muted-foreground uppercase block mb-1 flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> Apply Arc Template (opens in Campaign Builder)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
              {ARC_TEMPLATE_SUMMARIES.map(arc => (
                <button
                  key={arc.id}
                  onClick={() => applyArcTemplate(arc)}
                  className={`p-2 rounded border text-left transition-colors ${newEntry.arcTemplateId === arc.id ? 'border-amber-600/60 bg-amber-950/30' : 'border-border bg-card/20 hover:border-border'}`}
                  data-testid={`arc-template-${arc.id}`}
                >
                  <span className="text-[10px] font-bold text-foreground block truncate">{arc.name}</span>
                  <span className="text-[8px] text-muted-foreground">{arc.desc}</span>
                  <div className="flex gap-1 mt-0.5">
                    <Badge variant="outline" className="text-[7px] px-1 py-0 border-border text-muted-foreground">{arc.nodes}n</Badge>
                    <Badge variant="outline" className="text-[7px] px-1 py-0 border-border text-muted-foreground">{arc.category}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleCreate} className="bg-amber-700 hover:bg-amber-600 text-black text-xs" data-testid="sitemap-save-btn">
              <Save className="w-3 h-3 mr-1" /> Save Page
            </Button>
            {newEntry.arcTemplateId && (
              <Button size="sm" variant="outline" onClick={() => { handleCreate().then(() => openInBuilder({ ...newEntry, metadata: { arcTemplate: newEntry.arcTemplateId } })); }} className="text-xs border-purple-700 text-purple-400 hover:bg-purple-950/30">
                <Layers className="w-3 h-3 mr-1" /> Save & Open in Builder
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)} className="text-xs text-muted-foreground">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {Object.entries(filteredGroups).map(([category, items]) => {
          if (!items || items.length === 0) return null;
          const color = (items as any[])[0]?.color || 'amber';
          const colors = categoryColors[color] || categoryColors.amber;
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <h4 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>{category}</h4>
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[10px] text-muted-foreground">{(items as any[]).length} pages</span>
              </div>

              <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-2 ml-4' : 'space-y-1 ml-4'}>
                {(items as any[]).map((item: any) => {
                  const IconComp = SITEMAP_ICONS[item.icon] || Globe;
                  const isEditing = editingId === item.id;

                  if (isEditing && editEntry) {
                    return (
                      <div key={item.id} className="p-3 rounded-lg border border-amber-900/40 bg-amber-950/10 space-y-2" data-testid={`sitemap-edit-${item.id}`}>
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={editEntry.name} onChange={e => setEditEntry((p: any) => ({ ...p, name: e.target.value }))} className="bg-card/30 border-border h-7 text-xs text-foreground" />
                          <Input value={editEntry.path} onChange={e => setEditEntry((p: any) => ({ ...p, path: e.target.value }))} className="bg-card/30 border-border h-7 text-xs text-foreground" />
                        </div>
                        <Input value={editEntry.description} onChange={e => setEditEntry((p: any) => ({ ...p, description: e.target.value }))} className="bg-card/30 border-border h-7 text-xs text-foreground" />
                        <div className="grid grid-cols-4 gap-2">
                          <select value={editEntry.category} onChange={e => setEditEntry((p: any) => ({ ...p, category: e.target.value }))} className="bg-card/30 border border-border rounded px-2 py-1 text-[10px] text-foreground">
                            {SITEMAP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <select value={editEntry.color} onChange={e => setEditEntry((p: any) => ({ ...p, color: e.target.value }))} className="bg-card/30 border border-border rounded px-2 py-1 text-[10px] text-foreground">
                            {SITEMAP_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <select value={editEntry.pageLayout} onChange={e => setEditEntry((p: any) => ({ ...p, pageLayout: e.target.value }))} className="bg-card/30 border border-border rounded px-2 py-1 text-[10px] text-foreground">
                            {PAGE_LAYOUTS.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                          <select value={editEntry.icon} onChange={e => setEditEntry((p: any) => ({ ...p, icon: e.target.value }))} className="bg-card/30 border border-border rounded px-2 py-1 text-[10px] text-foreground">
                            {ICON_NAMES.map(i => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdate} className="bg-amber-700 hover:bg-amber-600 text-black text-xs"><Save className="w-3 h-3 mr-1" /> Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setEditEntry(null); }} className="text-xs text-muted-foreground">Cancel</Button>
                        </div>
                      </div>
                    );
                  }

                  if (viewMode === 'tree') {
                    return (
                      <div key={item.id} className={`flex items-center gap-2 py-1.5 px-2 rounded hover:bg-card/30 group transition-colors`} data-testid={`sitemap-row-${item.id}`}>
                        <IconComp className={`w-3.5 h-3.5 ${colors.text} shrink-0`} />
                        <Link href={item.path.includes(':') ? '#' : item.path} className="flex-1 min-w-0">
                          <span className="text-xs text-foreground group-hover:text-white font-medium truncate block">{item.name}</span>
                        </Link>
                        <span className="text-[8px] text-muted-foreground font-mono shrink-0">{item.path}</span>
                        <Badge variant="outline" className="text-[7px] px-1 py-0 border-border text-muted-foreground shrink-0">{item.pageLayout}</Badge>
                        {item.isCustom && <Badge variant="outline" className="text-[7px] px-1 py-0 border-amber-800 text-amber-600 shrink-0">custom</Badge>}
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-amber-400" onClick={() => { setEditingId(item.id); setEditEntry({ ...item }); }} data-testid={`sitemap-edit-${item.id}`}>
                            <Edit className="w-2.5 h-2.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-purple-400" onClick={() => openInBuilder(item)} data-testid={`sitemap-builder-${item.id}`}>
                            <Layers className="w-2.5 h-2.5" />
                          </Button>
                          {item.isCustom && (
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(item.id)} data-testid={`sitemap-delete-${item.id}`}>
                              <Trash2 className="w-2.5 h-2.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={item.id} className={`p-3 rounded-lg border ${colors.border} bg-[hsl(var(--card))] ${colors.hover} transition-all group relative`} data-testid={`sitemap-card-${item.id}`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 p-1.5 rounded ${colors.bg}`}>
                          <IconComp className={`w-3.5 h-3.5 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={item.path.includes(':') ? '#' : item.path}>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground group-hover:text-white transition-colors truncate">{item.name}</span>
                              <ArrowRight className="w-2.5 h-2.5 text-muted-foreground group-hover:text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                            </div>
                          </Link>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] text-muted-foreground font-mono">{item.path}</span>
                            <Badge variant="outline" className="text-[7px] px-1 py-0 border-border text-muted-foreground">{item.pageLayout}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-amber-400" onClick={() => { setEditingId(item.id); setEditEntry({ ...item }); }}>
                          <Edit className="w-2.5 h-2.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-purple-400" onClick={() => openInBuilder(item)}>
                          <Layers className="w-2.5 h-2.5" />
                        </Button>
                        {item.isCustom && (
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-lg bg-card/30 border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Coverage</span>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px]">
          {Object.entries(grouped).map(([cat, items]) => {
            const color = (items as any[])[0]?.color || 'amber';
            const c = categoryColors[color] || categoryColors.amber;
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                <span className="text-muted-foreground">{cat}</span>
                <span className="text-muted-foreground">({(items as any[]).length})</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-muted-foreground font-bold">{entries.length} total pages</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-amber-600">{entries.filter((e: any) => e.isCustom).length} custom</span>
          </div>
        </div>
      </div>
    </div>
  );
}
