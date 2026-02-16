import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Save, Trash2, Edit3, Eye, File, Folder, ChevronRight, Menu, X,
  Settings, Code, Network, BookOpen, Zap, Terminal, Shield, Globe,
  Share2, FileCode, Code2, Lock, Bug, EyeOff, GitBranch, FileText,
  Play, Layers, ChevronDown, Palette, Layout, Link as LinkIcon, Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface CampaignNode {
  id: string; type: 'step' | 'decision' | 'tool' | 'output' | 'folder';
  title: string; content: string; htmlContent?: string;
  pageLayout?: 'card' | 'full-page' | 'terminal' | 'dossier' | 'split';
  customCss?: string; x: number; y: number; width: number; height: number;
  color: string; children?: string[];
  metadata?: { toolsForStep?: string[]; questions?: string[]; successIndicators?: string[]; redFlags?: string[]; featureType?: string; campaignType?: string; skillLevel?: string; linkedClues?: string[]; };
}
interface CampaignLink { id: string; source: string; target: string; label?: string; condition?: string; color: string; }
interface HiddenClue { id: string; type: ClueType; nodeId: string; hint: string; value: string; }
type ClueType = 'source-code' | 'network-request' | 'http-header' | 'console-log' | 'css-comment' | 'data-attribute' | 'meta-tag' | 'base64' | 'hex-encoded' | 'steganography';
interface Campaign {
  id: string; name: string; description: string; category: string; difficulty: string; estimatedTime: string;
  nodes: CampaignNode[]; links: CampaignLink[]; rootNodes: string[];
  isChunk: boolean; entryPoints: string[]; exitPoints: string[];
  clueRefs: string[]; hiddenClues: HiddenClue[]; tags: string[]; isPublished: boolean;
}

const CATEGORIES = ['recon', 'exploit', 'defense', 'osint', 'forensics', 'social'] as const;
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
const NODE_TYPES: { type: CampaignNode['type']; icon: React.ReactNode; color: string }[] = [
  { type: 'step', icon: <Play className="w-3 h-3" />, color: 'amber' },
  { type: 'decision', icon: <GitBranch className="w-3 h-3" />, color: 'purple' },
  { type: 'tool', icon: <Zap className="w-3 h-3" />, color: 'teal' },
  { type: 'output', icon: <FileText className="w-3 h-3" />, color: 'blue' },
  { type: 'folder', icon: <Folder className="w-3 h-3" />, color: 'stone' },
];
const CLUE_ICONS: Record<ClueType, React.ReactNode> = {
  'source-code': <FileCode className="w-3.5 h-3.5" />, 'network-request': <Network className="w-3.5 h-3.5" />,
  'http-header': <Code2 className="w-3.5 h-3.5" />, 'console-log': <Terminal className="w-3.5 h-3.5" />,
  'css-comment': <Eye className="w-3.5 h-3.5" />, 'data-attribute': <Code2 className="w-3.5 h-3.5" />,
  'meta-tag': <Globe className="w-3.5 h-3.5" />, 'base64': <Lock className="w-3.5 h-3.5" />,
  'hex-encoded': <Bug className="w-3.5 h-3.5" />, 'steganography': <EyeOff className="w-3.5 h-3.5" />,
};
const CLUE_TYPES = Object.keys(CLUE_ICONS) as ClueType[];
const COLORS = ['amber', 'purple', 'teal', 'blue', 'red', 'green', 'stone'];
const LAYOUTS: CampaignNode['pageLayout'][] = ['card', 'full-page', 'terminal', 'dossier', 'split'];
const COLOR_MAP: Record<string, string> = {
  amber: 'border-amber-600', purple: 'border-purple-600', teal: 'border-teal-600',
  blue: 'border-blue-600', red: 'border-red-600', green: 'border-green-600', stone: 'border-stone-600',
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const mkNode = (id: string, type: CampaignNode['type'], title: string, content: string, x: number, y: number, color = 'amber'): CampaignNode => ({
  id, type, title, content, x, y, width: 200, height: 100, color, metadata: {}
});
const mkLink = (src: string, tgt: string, label = ''): CampaignLink => ({ id: `link-${uid()}`, source: src, target: tgt, label, color: 'stone' });
const mkClue = (type: ClueType, nodeId: string, hint: string, value: string): HiddenClue => ({ id: `clue-${uid()}`, type, nodeId, hint, value });

type ArcTemplate = { name: string; desc: string; category: string; nodes: CampaignNode[]; links: CampaignLink[]; clues: HiddenClue[] };
const ARC_TEMPLATES: ArcTemplate[] = [
  { name: 'Phantom Thread', desc: 'Phishing / Initial Access', category: 'social', nodes: [
    mkNode('pt1','step','Suspicious Email','Analyze the phishing email. Check [[Sender Analysis]] for header clues.',0,0),
    mkNode('pt2','tool','Sender Analysis','Run DKIM/SPF checks. Forward to [[Payload Extraction]].',300,0),
    mkNode('pt3','step','Payload Extraction','Extract the malicious attachment. See [[Credential Harvest]].',600,0),
    mkNode('pt4','output','Credential Harvest','Document captured credentials and IOCs.',900,0),
  ], links: [mkLink('pt1','pt2'),mkLink('pt2','pt3'),mkLink('pt3','pt4')],
    clues: [mkClue('source-code','pt3','Check the HTML source for a hidden form action','https://evil.corp/harvest'),mkClue('http-header','pt1','Inspect X-Originating-IP header','192.168.13.37')]},
  { name: 'Ghost Protocol', desc: 'Persistence / Backdoor', category: 'exploit', nodes: [
    mkNode('gp1','step','Initial Foothold','Enumerate services. Proceed to [[Registry Persistence]].',0,0),
    mkNode('gp2','tool','Registry Persistence','Plant RunOnce key. Verify with [[Callback Verification]].',300,0),
    mkNode('gp3','output','Callback Verification','Confirm C2 beacon established.',600,0),
  ], links: [mkLink('gp1','gp2'),mkLink('gp2','gp3')],
    clues: [mkClue('console-log','gp2','Check browser console for encoded beacon','beacon_active=true'),mkClue('data-attribute','gp3','Look for data-status attribute','persistence-confirmed')]},
  { name: 'Shadow Network', desc: 'OSINT Recon', category: 'osint', nodes: [
    mkNode('sn1','step','Target Profile','Gather initial intel on target. Check [[Domain Recon]].',0,0),
    mkNode('sn2','tool','Domain Recon','WHOIS/DNS enumeration. See [[Social Footprint]].',300,0),
    mkNode('sn3','step','Social Footprint','Map social accounts. Cross-ref with [[Dark Web Search]].',600,0),
    mkNode('sn4','tool','Dark Web Search','Search .onion indexes for mentions. See [[Intel Report]].',300,200),
    mkNode('sn5','output','Intel Report','Compile findings into structured report.',600,200),
  ], links: [mkLink('sn1','sn2'),mkLink('sn2','sn3'),mkLink('sn3','sn4'),mkLink('sn4','sn5')],
    clues: [mkClue('meta-tag','sn1','Check meta author tag','agent_shadow'),mkClue('css-comment','sn3','Hidden CSS comment reveals alias','/* alias: gh0st_runner */'),mkClue('base64','sn5','Decode the base64 string in the report footer','U2hhZG93IE5ldHdvcms=')]},
  { name: 'Wire Transfer', desc: 'Financial / Crypto Tracing', category: 'forensics', nodes: [
    mkNode('wt1','step','Transaction Alert','Suspicious transfer flagged. Trace via [[Blockchain Explorer]].',0,0),
    mkNode('wt2','tool','Blockchain Explorer','Follow the money through mixers. See [[Exchange KYC]].',300,0),
    mkNode('wt3','step','Exchange KYC','Subpoena exchange records. Compile in [[Financial Report]].',600,0),
    mkNode('wt4','output','Financial Report','Document the complete money trail.',900,0),
  ], links: [mkLink('wt1','wt2'),mkLink('wt2','wt3'),mkLink('wt3','wt4')],
    clues: [mkClue('network-request','wt2','Inspect XHR for hidden wallet address','bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'),mkClue('hex-encoded','wt4','Decode hex in transaction memo','4d6f6e6579204c61756e646572696e67')]},
  { name: 'Social Spider', desc: 'Social Engineering', category: 'social', nodes: [
    mkNode('ss1','step','Target Selection','Identify high-value target. Build [[Pretext Profile]].',0,0),
    mkNode('ss2','step','Pretext Profile','Craft believable cover story. Plan [[Vishing Call]].',300,0),
    mkNode('ss3','tool','Vishing Call','Execute voice phishing. Record in [[Debrief]].',600,0),
    mkNode('ss4','output','Debrief','Document what intel was extracted.',900,0),
  ], links: [mkLink('ss1','ss2'),mkLink('ss2','ss3'),mkLink('ss3','ss4')],
    clues: [mkClue('http-header','ss1','Check custom X-Agent header','spider-agent-7'),mkClue('source-code','ss3','View source for hidden script tag','<script>reportBack("success")</script>')]},
  { name: 'Dark Mirror', desc: 'Dark Web Intel', category: 'osint', nodes: [
    mkNode('dm1','step','Surface Scan','Search clearnet for breadcrumbs. Follow to [[Onion Crawl]].',0,0),
    mkNode('dm2','tool','Onion Crawl','Crawl hidden services. Document in [[Intel Dossier]].',300,0),
    mkNode('dm3','output','Intel Dossier','Compile dark web intelligence report.',600,0),
  ], links: [mkLink('dm1','dm2'),mkLink('dm2','dm3')],
    clues: [mkClue('steganography','dm2','Image contains hidden data','dead_drop_location_42'),mkClue('base64','dm3','Base64 in page footer','RGFyayBNaXJyb3IgQWN0aXZl')]},
  { name: 'Packet Storm', desc: 'Network Forensics', category: 'forensics', nodes: [
    mkNode('ps1','step','Capture Traffic','Start packet capture on suspect interface. Analyze in [[Protocol Analysis]].',0,0),
    mkNode('ps2','tool','Protocol Analysis','Deep-dive into anomalous packets. Check [[DNS Tunneling]].',300,0),
    mkNode('ps3','decision','DNS Tunneling','Is data being exfiltrated via DNS? See [[Forensic Report]].',600,0),
    mkNode('ps4','output','Forensic Report','Document network forensics findings.',900,0),
  ], links: [mkLink('ps1','ps2'),mkLink('ps2','ps3'),mkLink('ps3','ps4')],
    clues: [mkClue('console-log','ps1','Console shows hidden packet count','captured_packets: 1337'),mkClue('network-request','ps2','XHR reveals C2 domain','c2.malware.internal'),mkClue('http-header','ps4','Response header contains case ID','X-Case-ID: PKT-2026-001')]},
  { name: 'Zero Day', desc: 'Vulnerability Research', category: 'exploit', nodes: [
    mkNode('zd1','step','Attack Surface','Map the application attack surface. Start [[Fuzzing]].',0,0),
    mkNode('zd2','tool','Fuzzing','Fuzz input parameters. Crashes lead to [[Root Cause]].',300,0),
    mkNode('zd3','step','Root Cause','Analyze crash dump. Develop [[Exploit PoC]].',600,0),
    mkNode('zd4','tool','Exploit PoC','Build proof-of-concept exploit. Write [[Advisory]].',300,200),
    mkNode('zd5','output','Advisory','Responsible disclosure report.',600,200),
  ], links: [mkLink('zd1','zd2'),mkLink('zd2','zd3'),mkLink('zd3','zd4'),mkLink('zd4','zd5')],
    clues: [mkClue('source-code','zd2','View source for buffer size hint','MAX_BUF=256'),mkClue('data-attribute','zd3','data-vuln-class attribute','heap-overflow'),mkClue('css-comment','zd5','CSS comment has CVE','/* CVE-2026-31337 */')]},
  { name: 'Red Herring', desc: 'Counter-Intelligence', category: 'defense', nodes: [
    mkNode('rh1','step','Threat Detection','Anomaly detected. Is it real or a [[Decoy Analysis]]?',0,0),
    mkNode('rh2','decision','Decoy Analysis','Determine if this is misdirection. Report in [[CI Brief]].',300,0),
    mkNode('rh3','output','CI Brief','Counter-intelligence assessment.',600,0),
  ], links: [mkLink('rh1','rh2'),mkLink('rh2','rh3')],
    clues: [mkClue('meta-tag','rh1','Meta tag reveals true origin','origin: counterintel-unit-9'),mkClue('hex-encoded','rh3','Hex string in report','5265642048657272696e67')]},
  { name: 'First Contact', desc: 'Beginner Tutorial', category: 'recon', nodes: [
    mkNode('fc1','step','Welcome','Welcome to your first investigation! Start by reading [[Gather Clues]].',0,0),
    mkNode('fc2','step','Gather Clues','Look around the page for hidden information. Then [[Write Report]].',300,0),
    mkNode('fc3','output','Write Report','Summarize what you found. Congratulations!',600,0),
  ], links: [mkLink('fc1','fc2'),mkLink('fc2','fc3')],
    clues: [mkClue('source-code','fc2','Right-click and View Source to find the flag','FLAG{welcome_agent}')]},
];

const emptyCampaign = (): Campaign => ({
  id: `campaign-${Date.now()}`, name: 'Untitled Campaign', description: '', category: 'recon',
  difficulty: 'beginner', estimatedTime: '30 min', nodes: [], links: [], rootNodes: [],
  isChunk: false, entryPoints: [], exitPoints: [], clueRefs: [], hiddenClues: [], tags: [], isPublished: false,
});

export default function CampaignBuilder() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign>(emptyCampaign);
  const [savedCampaigns, setSavedCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'editor' | 'preview'>('canvas');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('files');
  const [isMobile, setIsMobile] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [clueDialogOpen, setClueDialogOpen] = useState(false);
  const [newClue, setNewClue] = useState<Partial<HiddenClue>>({ type: 'source-code', hint: '', value: '', nodeId: '' });
  const [campaignSelectorOpen, setCampaignSelectorOpen] = useState(false);
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const dirtyRef = useRef(false);

  const selectedNode = useMemo(() => campaign.nodes.find(n => n.id === selectedNodeId), [campaign.nodes, selectedNodeId]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetchCampaignList();
    const params = new URLSearchParams(location.split('?')[1] || '');
    const cid = params.get('campaign');
    if (cid) loadCampaign(cid);
  }, []);

  const fetchCampaignList = async () => {
    try {
      const r = await fetch('/api/designer/campaigns');
      if (r.ok) { const data = await r.json(); setSavedCampaigns(data.map((c: any) => ({ id: c.campaignId, name: c.name }))); }
    } catch {}
  };

  const loadCampaign = async (id: string) => {
    try {
      const r = await fetch(`/api/designer/campaigns/${id}`);
      if (r.ok) {
        const c = await r.json();
        setCampaign({
          id: c.campaignId, name: c.name || '', description: c.description || '', category: c.category || 'recon',
          difficulty: c.difficulty || 'beginner', estimatedTime: c.estimatedTime || '30 min',
          nodes: c.nodes || [], links: c.links || [], rootNodes: c.rootNodes || [],
          isChunk: c.isChunk || false, entryPoints: c.entryPoints || [], exitPoints: c.exitPoints || [],
          clueRefs: c.clueRefs || [], hiddenClues: c.hiddenClues || [], tags: c.tags || [], isPublished: c.isPublished || false,
        });
        setSelectedNodeId(null);
        dirtyRef.current = false;
      }
    } catch { toast({ title: 'Error', description: 'Failed to load campaign', variant: 'destructive' }); }
  };

  const saveCampaign = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const { id, ...rest } = campaign;
      const r = await fetch(`/api/designer/campaigns/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rest),
      });
      if (r.ok) {
        setLastSaved(new Date()); dirtyRef.current = false;
        fetchCampaignList();
        toast({ title: 'Saved', description: `"${campaign.name}" saved.` });
      } else throw new Error();
    } catch { toast({ title: 'Error', description: 'Save failed', variant: 'destructive' }); }
    finally { setIsSaving(false); }
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
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    setIsPublishing(false);
  };

  const markDirty = () => {
    dirtyRef.current = true;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => { if (dirtyRef.current) saveCampaign(); }, 5000);
  };

  const updateCampaign = (updates: Partial<Campaign>) => { setCampaign(p => ({ ...p, ...updates })); markDirty(); };
  const updateNode = (id: string, updates: Partial<CampaignNode>) => {
    setCampaign(p => ({ ...p, nodes: p.nodes.map(n => n.id === id ? { ...n, ...updates } : n) })); markDirty();
  };
  const deleteNode = (id: string) => {
    setCampaign(p => ({ ...p, nodes: p.nodes.filter(n => n.id !== id), links: p.links.filter(l => l.source !== id && l.target !== id), hiddenClues: p.hiddenClues.filter(c => c.nodeId !== id) }));
    if (selectedNodeId === id) setSelectedNodeId(null); markDirty();
  };
  const addNode = (type: CampaignNode['type'] = 'step') => {
    const maxY = campaign.nodes.reduce((m, n) => Math.max(m, n.y), 0);
    const n = mkNode(`node-${uid()}`, type, 'New Node', '', 100, maxY + 160);
    setCampaign(p => ({ ...p, nodes: [...p.nodes, n] })); setSelectedNodeId(n.id); markDirty();
  };
  const addLink = (source: string, target: string) => {
    if (source === target || campaign.links.some(l => l.source === source && l.target === target)) return;
    setCampaign(p => ({ ...p, links: [...p.links, mkLink(source, target)] })); markDirty();
  };

  const applyArc = (arc: ArcTemplate) => {
    const offsetX = campaign.nodes.reduce((m, n) => Math.max(m, n.x + n.width), 0) + 80;
    const offsetY = 80;
    const idMap: Record<string, string> = {};
    const newNodes = arc.nodes.map(n => {
      const newId = `${n.id}-${uid()}`; idMap[n.id] = newId;
      return { ...n, id: newId, x: n.x + offsetX, y: n.y + offsetY };
    });
    const newLinks = arc.links.map(l => ({ ...l, id: `link-${uid()}`, source: idMap[l.source], target: idMap[l.target] }));
    const newClues = arc.clues.map(c => ({ ...c, id: `clue-${uid()}`, nodeId: idMap[c.nodeId] }));
    setCampaign(p => ({
      ...p, nodes: [...p.nodes, ...newNodes], links: [...p.links, ...newLinks], hiddenClues: [...p.hiddenClues, ...newClues],
    }));
    markDirty();
    toast({ title: 'Arc Added', description: `"${arc.name}" injected with ${newNodes.length} nodes and ${newClues.length} clues.` });
  };

  const addClue = () => {
    if (!newClue.type || !newClue.nodeId || !newClue.hint || !newClue.value) return;
    const clue = mkClue(newClue.type as ClueType, newClue.nodeId, newClue.hint, newClue.value);
    setCampaign(p => ({ ...p, hiddenClues: [...p.hiddenClues, clue] }));
    setNewClue({ type: 'source-code', hint: '', value: '', nodeId: '' }); setClueDialogOpen(false); markDirty();
  };
  const deleteClue = (id: string) => {
    setCampaign(p => ({ ...p, hiddenClues: p.hiddenClues.filter(c => c.id !== id) })); markDirty();
  };

  const renderWikilinks = (content: string) => {
    return content.split(/(\[\[.*?\]\])/g).map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const title = part.slice(2, -2);
        return <button key={i} onClick={() => { const t = campaign.nodes.find(n => n.title.toLowerCase() === title.toLowerCase()); if (t) setSelectedNodeId(t.id); }} className="text-amber-500 font-mono font-bold hover:underline">{title}</button>;
      }
      return part;
    });
  };

  const nodeTypeIcon = (type: string) => NODE_TYPES.find(t => t.type === type)?.icon || <File className="w-3 h-3" />;

  const connectedNodes = useMemo(() => {
    if (!selectedNodeId) return [];
    return campaign.links.filter(l => l.source === selectedNodeId || l.target === selectedNodeId).map(l => {
      const otherId = l.source === selectedNodeId ? l.target : l.source;
      const other = campaign.nodes.find(n => n.id === otherId);
      return other ? { ...other, direction: l.source === selectedNodeId ? 'outgoing' : 'incoming' } : null;
    }).filter(Boolean);
  }, [selectedNodeId, campaign.links, campaign.nodes]);

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-stone-300 selection:bg-amber-500/30 overflow-hidden">
      <header className="h-14 border-b border-stone-800 bg-stone-950 flex items-center justify-between px-3 z-50 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button data-testid="toggle-sidebar" variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-amber-500 shrink-0"><Menu className="w-5 h-5" /></Button>
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
          {lastSaved && <span className="text-[9px] text-stone-600 hidden lg:flex items-center gap-1"><Clock className="w-3 h-3" />{lastSaved.toLocaleTimeString()}</span>}
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
          <Button data-testid="publish-campaign" variant="outline" size="sm" className={`hidden sm:flex border-stone-800 h-8 text-xs ${campaign.isPublished ? 'text-green-400 border-green-900/50' : 'text-stone-400'}`} onClick={publishToggle} disabled={isPublishing}>
            <Share2 className="w-3.5 h-3.5 mr-1" />{campaign.isPublished ? 'Live' : 'Publish'}
          </Button>
          <Button data-testid="save-campaign" className="bg-amber-600 hover:bg-amber-500 text-black h-8 font-bold px-3 text-xs" onClick={saveCampaign} disabled={isSaving}>
            <Save className="w-3.5 h-3.5 mr-1" />{isSaving ? '...' : 'Save'}
          </Button>
        </div>
      </header>

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

      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: isMobile ? '100%' : 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className={`bg-stone-950 border-r border-stone-800 flex flex-col z-40 ${isMobile ? 'absolute inset-0' : 'relative'}`}>
              {isMobile && <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-50 text-stone-400" onClick={() => setIsSidebarOpen(false)}><X className="w-5 h-5" /></Button>}
              <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-stone-800">
                  <TabsList className="bg-stone-900 border-none h-7 w-full">
                    {['files','arcs','clues','meta'].map(t => <TabsTrigger key={t} value={t} className="text-[9px] uppercase font-bold flex-1">{t}</TabsTrigger>)}
                  </TabsList>
                </div>
                <ScrollArea className="flex-1">
                  <TabsContent value="files" className="mt-0 p-2">
                    <div className="space-y-0.5">
                      {campaign.nodes.map(node => (
                        <Button key={node.id} data-testid={`select-node-${node.id}`} variant="ghost" onClick={() => { setSelectedNodeId(node.id); if (isMobile) setIsSidebarOpen(false); }}
                          className={`w-full justify-start text-[11px] h-8 px-2 gap-1.5 ${selectedNodeId === node.id ? 'bg-amber-500/10 text-amber-500' : 'text-stone-400 hover:bg-stone-900'}`}>
                          {nodeTypeIcon(node.type)}<span className="truncate">{node.title}</span>
                        </Button>
                      ))}
                      <Button data-testid="add-node" variant="ghost" onClick={() => addNode()} className="w-full justify-start text-[10px] h-8 text-stone-600 border border-dashed border-stone-800 mt-1">
                        <Plus className="w-3 h-3 mr-1" />Add Node
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="arcs" className="mt-0 p-2 space-y-2">
                    {ARC_TEMPLATES.map(arc => (
                      <Card key={arc.name} data-testid={`arc-${arc.name.replace(/\s/g,'-').toLowerCase()}`} className="bg-stone-900/50 border-stone-800 hover:border-amber-900/50 cursor-pointer transition-colors" onClick={() => applyArc(arc)}>
                        <CardContent className="p-2.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-500"><Zap className="w-3 h-3" /><span className="text-[11px] font-bold">{arc.name}</span></div>
                          <p className="text-[9px] text-stone-500">{arc.desc} · {arc.nodes.length} nodes · {arc.clues.length} clues</p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="clues" className="mt-0 p-2 space-y-2">
                    <Button data-testid="add-clue" variant="outline" size="sm" className="w-full border-stone-800 text-amber-500 text-[10px] h-7" onClick={() => setClueDialogOpen(true)}>
                      <Plus className="w-3 h-3 mr-1" />Add Hidden Clue
                    </Button>
                    {campaign.hiddenClues.map(clue => {
                      const node = campaign.nodes.find(n => n.id === clue.nodeId);
                      return (
                        <div key={clue.id} className="bg-stone-900/50 border border-stone-800 rounded-md p-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-amber-500">{CLUE_ICONS[clue.type]}<span className="text-[10px] font-bold">{clue.type}</span></div>
                            <Button data-testid={`delete-clue-${clue.id}`} variant="ghost" size="icon" className="h-5 w-5 text-stone-600 hover:text-red-400" onClick={() => deleteClue(clue.id)}><X className="w-3 h-3" /></Button>
                          </div>
                          <p className="text-[9px] text-stone-400">{clue.hint}</p>
                          <p className="text-[9px] text-stone-600 font-mono truncate">→ {node?.title || 'Unknown node'}</p>
                        </div>
                      );
                    })}
                    {campaign.hiddenClues.length === 0 && <p className="text-[9px] text-stone-600 text-center py-4">No hidden clues yet. Add an arc template or create one manually.</p>}
                  </TabsContent>

                  <TabsContent value="meta" className="mt-0 p-3 space-y-3">
                    <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Name</label>
                      <Input data-testid="input-campaign-name" value={campaign.name} onChange={e => updateCampaign({ name: e.target.value })} className="bg-stone-900 border-stone-800 h-8 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Description</label>
                      <Textarea data-testid="input-campaign-desc" value={campaign.description} onChange={e => updateCampaign({ description: e.target.value })} className="bg-stone-900 border-stone-800 text-xs min-h-[60px]" /></div>
                    <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Category</label>
                      <Select value={campaign.category} onValueChange={v => updateCampaign({ category: v })}>
                        <SelectTrigger data-testid="select-category" className="bg-stone-900 border-stone-800 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                      </Select></div>
                    <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Difficulty</label>
                      <Select value={campaign.difficulty} onValueChange={v => updateCampaign({ difficulty: v })}>
                        <SelectTrigger data-testid="select-difficulty" className="bg-stone-900 border-stone-800 h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}</SelectContent>
                      </Select></div>
                    <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Estimated Time</label>
                      <Input data-testid="input-time" value={campaign.estimatedTime} onChange={e => updateCampaign({ estimatedTime: e.target.value })} className="bg-stone-900 border-stone-800 h-8 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Tags (comma-separated)</label>
                      <Input data-testid="input-tags" value={campaign.tags.join(', ')} onChange={e => updateCampaign({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} className="bg-stone-900 border-stone-800 h-8 text-xs" /></div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 relative bg-stone-950 flex flex-col overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {viewMode === 'canvas' && (
            <div className="flex-1 overflow-auto relative">
              <div className="min-w-[2000px] min-h-[2000px] relative p-16">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                  {campaign.links.map(link => {
                    const src = campaign.nodes.find(n => n.id === link.source);
                    const tgt = campaign.nodes.find(n => n.id === link.target);
                    if (!src || !tgt) return null;
                    const x1 = src.x + 96; const y1 = src.y + 40;
                    const x2 = tgt.x + 96; const y2 = tgt.y + 40;
                    return <g key={link.id}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#78716c" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.4} />
                      <circle cx={x2} cy={y2} r={3} fill="#f59e0b" opacity={0.6} /></g>;
                  })}
                </svg>
                {campaign.nodes.map(node => (
                  <motion.div key={node.id} drag dragMomentum={false}
                    onDragEnd={(_, info) => updateNode(node.id, { x: node.x + info.offset.x, y: node.y + info.offset.y })}
                    onClick={() => {
                      if (linkingFrom && linkingFrom !== node.id) { addLink(linkingFrom, node.id); setLinkingFrom(null); }
                      else setSelectedNodeId(node.id);
                    }}
                    style={{ left: node.x, top: node.y }} className="absolute cursor-move z-10">
                    <Card data-testid={`canvas-node-${node.id}`} className={`w-48 bg-stone-950/90 border-2 backdrop-blur-md transition-all ${selectedNodeId === node.id ? 'border-amber-500 shadow-lg shadow-amber-500/10 scale-105' : `${COLOR_MAP[node.color] || 'border-stone-800'} hover:border-stone-700`}`}>
                      <CardContent className="p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[8px] border-stone-800 text-stone-500 font-bold uppercase">{node.type}</Badge>
                          {node.pageLayout && <Badge variant="outline" className="text-[7px] border-stone-800 text-stone-600">{node.pageLayout}</Badge>}
                        </div>
                        <h3 className="text-[11px] font-bold truncate text-stone-100 uppercase tracking-wide">{node.title}</h3>
                        <div className="text-[9px] text-stone-600 line-clamp-2 leading-tight">{node.content.substring(0, 60)}{node.content.length > 60 ? '...' : ''}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {campaign.nodes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <Network className="w-12 h-12 text-stone-800 mx-auto" />
                      <p className="text-stone-600 text-sm">Empty canvas. Add a node or inject an arc template.</p>
                      <Button data-testid="add-first-node" variant="outline" className="border-stone-800 text-amber-500" onClick={() => addNode()}>
                        <Plus className="w-4 h-4 mr-2" />Add First Node
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'editor' && (
            <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-auto">
              {selectedNode ? (
                <div className="max-w-4xl mx-auto w-full space-y-4 flex-1 flex flex-col">
                  <Input data-testid="edit-node-title" value={selectedNode.title} onChange={e => updateNode(selectedNode.id, { title: e.target.value })}
                    className="text-2xl font-black bg-transparent border-none p-0 focus-visible:ring-0 text-amber-500 h-auto uppercase tracking-tighter" />
                  <div className="flex gap-2">
                    <Badge className="bg-stone-900 text-stone-500 border-stone-800 h-5 text-[9px] font-mono">{selectedNode.id}</Badge>
                    <Badge className="bg-amber-950/30 text-amber-500 border-amber-900/30 h-5 text-[9px] uppercase">{selectedNode.type}</Badge>
                  </div>
                  <Textarea data-testid="edit-node-content" value={selectedNode.content} onChange={e => updateNode(selectedNode.id, { content: e.target.value })}
                    className="flex-1 bg-stone-900/30 border-stone-800 text-stone-300 resize-none font-mono text-sm leading-relaxed focus:border-amber-900/50 p-4 rounded-xl min-h-[300px]"
                    placeholder="Write markdown with [[wikilinks]]..." />
                </div>
              ) : <div className="flex-1 flex items-center justify-center text-stone-600 italic text-sm">Select a node to edit.</div>}
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-12">
              {selectedNode ? (
                <div className="max-w-3xl mx-auto w-full">
                  <div className="border-l-4 border-amber-500 pl-6 py-2 mb-8 bg-amber-500/5 rounded-r">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedNode.title}</h1>
                    <p className="text-stone-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">{selectedNode.type} · {selectedNode.pageLayout || 'card'}</p>
                  </div>
                  <div className="text-base text-stone-400 leading-relaxed whitespace-pre-wrap">{renderWikilinks(selectedNode.content)}</div>
                  {connectedNodes.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {connectedNodes.map((n: any) => (
                        <Button key={n.id} variant="outline" className="justify-between h-12 border-stone-800 hover:border-amber-900/50 bg-stone-900/50 group" onClick={() => setSelectedNodeId(n.id)}>
                          <span className="text-xs uppercase font-bold text-stone-400 group-hover:text-amber-500">{n.title}</span>
                          <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-amber-500" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ) : <div className="flex-1 flex items-center justify-center text-stone-600">Select a node to preview.</div>}
            </div>
          )}
        </main>

        {!isMobile && selectedNode && viewMode === 'canvas' && (
          <aside className="w-72 bg-stone-950 border-l border-stone-800 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Node Properties</h2>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelectedNodeId(null)}><X className="w-3.5 h-3.5" /></Button>
            </div>
            <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Title</label>
              <Input data-testid="prop-node-title" value={selectedNode.title} onChange={e => updateNode(selectedNode.id, { title: e.target.value })} className="bg-stone-900 border-stone-800 h-8 text-xs" /></div>
            <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Type</label>
              <div className="grid grid-cols-3 gap-1">
                {NODE_TYPES.map(t => (
                  <Button key={t.type} data-testid={`set-type-${t.type}`} variant={selectedNode.type === t.type ? 'secondary' : 'outline'} size="sm"
                    onClick={() => updateNode(selectedNode.id, { type: t.type })} className="h-7 text-[8px] uppercase font-bold border-stone-800 gap-1">
                    {t.icon}{t.type}
                  </Button>
                ))}
              </div></div>
            <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Color</label>
              <div className="flex gap-1 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} data-testid={`set-color-${c}`} onClick={() => updateNode(selectedNode.id, { color: c })}
                    className={`w-6 h-6 rounded border-2 transition-all ${selectedNode.color === c ? 'scale-110 border-white' : 'border-stone-700'}`}
                    style={{ backgroundColor: c === 'amber' ? '#d97706' : c === 'purple' ? '#9333ea' : c === 'teal' ? '#0d9488' : c === 'blue' ? '#2563eb' : c === 'red' ? '#dc2626' : c === 'green' ? '#16a34a' : '#57534e' }} />
                ))}
              </div></div>
            <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Page Layout</label>
              <Select value={selectedNode.pageLayout || 'card'} onValueChange={v => updateNode(selectedNode.id, { pageLayout: v as any })}>
                <SelectTrigger data-testid="select-layout" className="bg-stone-900 border-stone-800 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>{LAYOUTS.map(l => <SelectItem key={l} value={l!} className="text-xs">{l}</SelectItem>)}</SelectContent>
              </Select></div>
            <Separator className="bg-stone-800" />
            <div className="space-y-1.5">
              <label className="text-[9px] text-stone-500 font-bold uppercase">Connected ({connectedNodes.length})</label>
              {connectedNodes.map((n: any) => (
                <div key={n.id} className="flex items-center gap-1.5 text-[10px] text-stone-400 cursor-pointer hover:text-amber-500" onClick={() => setSelectedNodeId(n.id)}>
                  {nodeTypeIcon(n.type)}<span className="truncate">{n.title}</span>
                  <Badge className="ml-auto text-[7px] bg-stone-900 border-stone-800 text-stone-600">{n.direction}</Badge>
                </div>
              ))}
            </div>
            <Separator className="bg-stone-800" />
            <Button data-testid="link-from-node" variant="outline" size="sm" className="w-full border-stone-800 text-stone-400 h-8 text-[10px]"
              onClick={() => { setLinkingFrom(selectedNode.id); toast({ title: 'Link Mode', description: 'Click another node to create a link.' }); }}>
              <LinkIcon className="w-3 h-3 mr-1.5" />{linkingFrom === selectedNode.id ? 'Click target...' : 'Add Link From Here'}
            </Button>
            <Button data-testid="delete-node" variant="destructive" size="sm" className="w-full bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-900/30 h-8 text-[10px] uppercase font-bold" onClick={() => deleteNode(selectedNode.id)}>
              <Trash2 className="w-3 h-3 mr-1.5" />Delete Node
            </Button>
          </aside>
        )}
      </div>

      <Dialog open={clueDialogOpen} onOpenChange={setClueDialogOpen}>
        <DialogContent className="bg-stone-950 border-stone-800 max-w-md">
          <DialogHeader><DialogTitle className="text-amber-500">Add Hidden Clue</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Clue Type</label>
              <Select value={newClue.type} onValueChange={v => setNewClue(p => ({ ...p, type: v as ClueType }))}>
                <SelectTrigger data-testid="select-clue-type" className="bg-stone-900 border-stone-800 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{CLUE_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs"><span className="flex items-center gap-2">{CLUE_ICONS[t]}{t}</span></SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Target Node</label>
              <Select value={newClue.nodeId} onValueChange={v => setNewClue(p => ({ ...p, nodeId: v }))}>
                <SelectTrigger data-testid="select-clue-node" className="bg-stone-900 border-stone-800 h-8 text-xs"><SelectValue placeholder="Select node..." /></SelectTrigger>
                <SelectContent>{campaign.nodes.map(n => <SelectItem key={n.id} value={n.id} className="text-xs">{n.title}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Hint</label>
              <Input data-testid="input-clue-hint" value={newClue.hint} onChange={e => setNewClue(p => ({ ...p, hint: e.target.value }))} placeholder="What should the player look for?" className="bg-stone-900 border-stone-800 h-8 text-xs" /></div>
            <div className="space-y-1"><label className="text-[9px] text-amber-500/70 font-bold uppercase">Value</label>
              <Input data-testid="input-clue-value" value={newClue.value} onChange={e => setNewClue(p => ({ ...p, value: e.target.value }))} placeholder="The hidden clue content" className="bg-stone-900 border-stone-800 h-8 text-xs" /></div>
            <Button data-testid="confirm-add-clue" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold h-8 text-xs" onClick={addClue}>Add Clue</Button>
          </div>
        </DialogContent>
      </Dialog>

      {isMobile && selectedNode && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-4 left-4 right-4 z-50 bg-amber-600 rounded-xl p-3 shadow-2xl flex items-center justify-between text-black">
          <div className="flex flex-col min-w-0">
            <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Selected</span>
            <span className="text-xs font-bold uppercase truncate">{selectedNode.title}</span>
          </div>
          <div className="flex gap-1.5">
            <Button data-testid="mobile-edit" size="icon" variant="ghost" className="bg-black/10 rounded-full h-9 w-9" onClick={() => setViewMode('editor')}><Edit3 className="w-4 h-4" /></Button>
            <Button data-testid="mobile-preview" size="icon" variant="ghost" className="bg-black/10 rounded-full h-9 w-9" onClick={() => setViewMode('preview')}><BookOpen className="w-4 h-4" /></Button>
            <Button data-testid="mobile-delete" size="icon" variant="ghost" className="bg-black/10 rounded-full h-9 w-9" onClick={() => deleteNode(selectedNode.id)}><Trash2 className="w-4 h-4" /></Button>
            <Button data-testid="mobile-deselect" size="icon" variant="ghost" className="bg-black/10 rounded-full h-9 w-9" onClick={() => setSelectedNodeId(null)}><X className="w-4 h-4" /></Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}