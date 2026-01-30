import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  FolderTree, FileText, Plus, Trash2, Edit3, Link2, Eye, Save, Download,
  Play, Pause, ChevronRight, ChevronDown, Zap, Target, Shield, Search, Settings,
  Move, MousePointer, Unlink, GitBranch, Layers, Copy, MoreVertical, SkipBack, SkipForward, RotateCcw
} from 'lucide-react';

interface CampaignNode {
  id: string;
  type: 'step' | 'decision' | 'tool' | 'output' | 'folder';
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  children?: string[];
  metadata?: {
    toolsForStep?: string[];
    questions?: string[];
    successIndicators?: string[];
    redFlags?: string[];
  };
}

type RelationType = 'parent' | 'child' | 'sibling' | 'related' | 'next' | 'prev';

interface CampaignLink {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  color: string;
  relation?: RelationType;
}

interface SharedClue {
  id: string;
  name: string;
  description: string;
  tags: string[];
  usedIn: string[]; // Campaign IDs where this clue is referenced
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  nodes: CampaignNode[];
  links: CampaignLink[];
  rootNodes: string[];
  isChunk?: boolean; // Modular chunk that can be embedded in other campaigns
  entryPoints?: string[]; // Node IDs that can be entered from other campaigns
  exitPoints?: string[]; // Node IDs that can link to other campaigns
  clueRefs?: string[]; // Shared clue IDs referenced in this campaign
}

const NODE_TYPES = [
  { type: 'step', label: 'Step', icon: <Play className="w-3 h-3" />, color: 'amber' },
  { type: 'decision', label: 'Decision', icon: <GitBranch className="w-3 h-3" />, color: 'purple' },
  { type: 'tool', label: 'Tool', icon: <Zap className="w-3 h-3" />, color: 'teal' },
  { type: 'output', label: 'Output', icon: <FileText className="w-3 h-3" />, color: 'purple' },
  { type: 'folder', label: 'Folder', icon: <FolderTree className="w-3 h-3" />, color: 'stone' }
];

const COLOR_MAP: Record<string, string> = {
  amber: 'border-amber-600 bg-amber-950/30',
  purple: 'border-purple-600 bg-purple-950/30',
  teal: 'border-teal-600 bg-teal-950/30',
  stone: 'border-stone-600 bg-stone-900/30',
};

const RELATION_TYPES: { type: RelationType; label: string; icon: string; color: string }[] = [
  { type: 'parent', label: 'Parent', icon: '↑', color: 'text-purple-400' },
  { type: 'child', label: 'Child', icon: '↓', color: 'text-teal-400' },
  { type: 'sibling', label: 'Sibling', icon: '↔', color: 'text-amber-400' },
  { type: 'next', label: 'Next', icon: '→', color: 'text-teal-400' },
  { type: 'prev', label: 'Previous', icon: '←', color: 'text-purple-400' },
  { type: 'related', label: 'Related', icon: '◇', color: 'text-stone-400' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CampaignDesigner({ open, onOpenChange }: Props) {
  const [mode, setMode] = useState<'tree' | 'graph'>('tree');
  const [campaign, setCampaign] = useState<Campaign>({
    id: `campaign-${Date.now()}`,
    name: 'New Campaign',
    description: 'Investigation campaign',
    nodes: [],
    links: [],
    rootNodes: []
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<CampaignNode | null>(null);
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [inlineEditNode, setInlineEditNode] = useState<string | null>(null);
  const [linkMousePos, setLinkMousePos] = useState<{ x: number; y: number } | null>(null);
  const [testRunMode, setTestRunMode] = useState(false);
  const [testCurrentNode, setTestCurrentNode] = useState<string | null>(null);
  const [testHistory, setTestHistory] = useState<string[]>([]);
  const [linkQuery, setLinkQuery] = useState('');
  const [showLinkSuggestions, setShowLinkSuggestions] = useState(false);
  const [showFileTree, setShowFileTree] = useState(true);
  const [savedCampaigns, setSavedCampaigns] = useState<Campaign[]>([]);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sharedClues, setSharedClues] = useState<SharedClue[]>([]);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Load saved campaigns from database on mount
  useEffect(() => {
    const loadFromDB = async () => {
      try {
        const response = await fetch('/api/designer/campaigns');
        if (response.ok) {
          const dbCampaigns = await response.json();
          const converted = dbCampaigns.map((c: any) => ({
            id: c.campaignId,
            name: c.name,
            description: c.description,
            nodes: c.nodes || [],
            links: c.links || [],
            rootNodes: c.rootNodes || [],
            isChunk: c.isChunk,
            entryPoints: c.entryPoints,
            exitPoints: c.exitPoints,
            clueRefs: c.clueRefs
          }));
          setSavedCampaigns(converted);
        }
      } catch (error) {
        // Fallback to localStorage
        const saved = localStorage.getItem('nexus_campaigns');
        if (saved) {
          try { setSavedCampaigns(JSON.parse(saved)); } catch {}
        }
      }
    };
    loadFromDB();
    
    // Load shared clues
    fetch('/api/designer/clues')
      .then(r => r.ok ? r.json() : [])
      .then(clues => setSharedClues(clues))
      .catch(() => {});
  }, [open]);

  // Track unsaved changes
  useEffect(() => {
    const savedVersion = savedCampaigns.find(c => c.id === campaign.id);
    if (savedVersion) {
      setIsUnsaved(JSON.stringify(savedVersion) !== JSON.stringify(campaign));
    } else if (campaign.nodes.length > 0) {
      setIsUnsaved(true);
    }
  }, [campaign, savedCampaigns]);

  // Save campaign to database
  const saveCampaign = useCallback(async () => {
    setIsSyncing(true);
    try {
      const payload = {
        name: campaign.name,
        description: campaign.description,
        nodes: campaign.nodes,
        links: campaign.links,
        rootNodes: campaign.rootNodes,
        isChunk: campaign.isChunk || false,
        entryPoints: campaign.entryPoints || [],
        exitPoints: campaign.exitPoints || [],
        clueRefs: campaign.clueRefs || []
      };
      
      const response = await fetch(`/api/designer/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        // Update local cache
        const existing = savedCampaigns.findIndex(c => c.id === campaign.id);
        const updated = [...savedCampaigns];
        if (existing >= 0) {
          updated[existing] = campaign;
        } else {
          updated.push(campaign);
        }
        setSavedCampaigns(updated);
        localStorage.setItem('nexus_campaigns', JSON.stringify(updated));
        setIsUnsaved(false);
        toast({ title: 'Campaign Saved', description: `"${campaign.name}" synced to database` });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      // Fallback to localStorage only
      const existing = savedCampaigns.findIndex(c => c.id === campaign.id);
      const updated = [...savedCampaigns];
      if (existing >= 0) updated[existing] = campaign;
      else updated.push(campaign);
      localStorage.setItem('nexus_campaigns', JSON.stringify(updated));
      setSavedCampaigns(updated);
      setIsUnsaved(false);
      toast({ title: 'Saved Locally', description: 'Database sync failed, saved to local storage' });
    }
    setIsSyncing(false);
  }, [campaign, savedCampaigns]);

  const loadCampaign = useCallback((campaignId: string) => {
    const toLoad = savedCampaigns.find(c => c.id === campaignId);
    if (toLoad) {
      setCampaign(toLoad);
      setSelectedNode(null);
      setEditingNode(null);
      setIsUnsaved(false);
      toast({ title: 'Campaign Loaded', description: `"${toLoad.name}" loaded` });
    }
  }, [savedCampaigns]);

  const deleteCampaign = useCallback(async (campaignId: string) => {
    try {
      await fetch(`/api/designer/campaigns/${campaignId}`, { method: 'DELETE' });
    } catch {}
    
    const updated = savedCampaigns.filter(c => c.id !== campaignId);
    setSavedCampaigns(updated);
    localStorage.setItem('nexus_campaigns', JSON.stringify(updated));
    
    if (campaign.id === campaignId) {
      setCampaign({
        id: `campaign-${Date.now()}`,
        name: 'New Campaign',
        description: 'Investigation campaign',
        nodes: [],
        links: [],
        rootNodes: []
      });
    }
    toast({ title: 'Campaign Deleted' });
  }, [campaign.id, savedCampaigns]);

  const duplicateCampaign = useCallback(async (campaignId: string) => {
    const original = savedCampaigns.find(c => c.id === campaignId);
    if (original) {
      const duplicate: Campaign = {
        ...original,
        id: `campaign-${Date.now()}`,
        name: `${original.name} (Copy)`
      };
      
      try {
        await fetch(`/api/designer/campaigns/${duplicate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: duplicate.name,
            description: duplicate.description,
            nodes: duplicate.nodes,
            links: duplicate.links,
            rootNodes: duplicate.rootNodes
          })
        });
      } catch {}
      
      const updated = [...savedCampaigns, duplicate];
      setSavedCampaigns(updated);
      localStorage.setItem('nexus_campaigns', JSON.stringify(updated));
      toast({ title: 'Campaign Duplicated', description: `Created "${duplicate.name}"` });
    }
  }, [savedCampaigns]);

  const newCampaign = useCallback(() => {
    setCampaign({
      id: `campaign-${Date.now()}`,
      name: 'New Campaign',
      description: 'Investigation campaign',
      nodes: [],
      links: [],
      rootNodes: []
    });
    setSelectedNode(null);
    setEditingNode(null);
    setIsUnsaved(false);
  }, []);

  // Auto-organize nodes in a tree/grid layout
  const autoOrganize = useCallback(() => {
    if (campaign.nodes.length === 0) return;
    
    const nodeWidth = 220;
    const nodeHeight = 130;
    const horizontalGap = 60;
    const verticalGap = 80;
    const startX = 100;
    const startY = 100;
    
    // Build adjacency list from links
    const children: Record<string, string[]> = {};
    const parents: Record<string, string[]> = {};
    campaign.nodes.forEach(n => { children[n.id] = []; parents[n.id] = []; });
    campaign.links.forEach(l => {
      children[l.source]?.push(l.target);
      parents[l.target]?.push(l.source);
    });
    
    // Find root nodes (no parents or in rootNodes list)
    const roots = campaign.nodes.filter(n => 
      parents[n.id]?.length === 0 || campaign.rootNodes.includes(n.id)
    );
    
    // BFS to assign levels
    const levels: Record<string, number> = {};
    const visited = new Set<string>();
    const queue: { id: string; level: number }[] = roots.map(r => ({ id: r.id, level: 0 }));
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      levels[id] = level;
      children[id]?.forEach(childId => {
        if (!visited.has(childId)) {
          queue.push({ id: childId, level: level + 1 });
        }
      });
    }
    
    // Place unvisited nodes at level 0
    campaign.nodes.forEach(n => {
      if (!visited.has(n.id)) {
        levels[n.id] = 0;
        visited.add(n.id);
      }
    });
    
    // Group nodes by level
    const levelGroups: Record<number, string[]> = {};
    Object.entries(levels).forEach(([id, level]) => {
      if (!levelGroups[level]) levelGroups[level] = [];
      levelGroups[level].push(id);
    });
    
    // Position nodes
    const updatedNodes = campaign.nodes.map(node => {
      const level = levels[node.id] || 0;
      const nodesAtLevel = levelGroups[level] || [];
      const indexInLevel = nodesAtLevel.indexOf(node.id);
      
      return {
        ...node,
        x: startX + level * (nodeWidth + horizontalGap),
        y: startY + indexInLevel * (nodeHeight + verticalGap)
      };
    });
    
    setCampaign(prev => ({ ...prev, nodes: updatedNodes }));
    setZoom(1);
    toast({ title: 'Auto-Organized', description: `Arranged ${campaign.nodes.length} nodes` });
  }, [campaign]);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Obsidian-style link query parser - supports [[name]], @type:value, #property:value
  const parseLinkQuery = useCallback((query: string): CampaignNode[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    
    // [[node-name]] - exact or partial title match
    const wikiLinkMatch = q.match(/^\[\[(.+?)\]\]$/);
    if (wikiLinkMatch) {
      const searchTerm = wikiLinkMatch[1].toLowerCase();
      return campaign.nodes.filter(n => 
        n.title.toLowerCase().includes(searchTerm) ||
        n.id.toLowerCase().includes(searchTerm)
      );
    }
    
    // @type:value - filter by node type
    const typeMatch = q.match(/^@type:(\w+)$/);
    if (typeMatch) {
      const typeFilter = typeMatch[1];
      return campaign.nodes.filter(n => n.type.toLowerCase() === typeFilter);
    }
    
    // @color:value - filter by color
    const colorMatch = q.match(/^@color:(\w+)$/);
    if (colorMatch) {
      const colorFilter = colorMatch[1];
      return campaign.nodes.filter(n => n.color.toLowerCase() === colorFilter);
    }
    
    // #tool:value - filter by tools in metadata
    const toolMatch = q.match(/^#tool:(.+)$/);
    if (toolMatch) {
      const toolFilter = toolMatch[1].toLowerCase();
      return campaign.nodes.filter(n => 
        n.metadata?.toolsForStep?.some(t => t.toLowerCase().includes(toolFilter))
      );
    }
    
    // #question:value - filter by questions in metadata
    const questionMatch = q.match(/^#question:(.+)$/);
    if (questionMatch) {
      const questionFilter = questionMatch[1].toLowerCase();
      return campaign.nodes.filter(n => 
        n.metadata?.questions?.some(q => q.toLowerCase().includes(questionFilter))
      );
    }
    
    // #flag:value - filter by red flags
    const flagMatch = q.match(/^#flag:(.+)$/);
    if (flagMatch) {
      const flagFilter = flagMatch[1].toLowerCase();
      return campaign.nodes.filter(n => 
        n.metadata?.redFlags?.some(f => f.toLowerCase().includes(flagFilter))
      );
    }
    
    // Default: fuzzy search on title and content
    return campaign.nodes.filter(n => 
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
    );
  }, [campaign.nodes]);

  // Compute matching nodes from link query
  const linkQueryResults = useMemo(() => {
    return parseLinkQuery(linkQuery);
  }, [linkQuery, parseLinkQuery]);

  // Compute breadcrumbs - path from root to selected node
  const getBreadcrumbs = useCallback((nodeId: string | null): CampaignNode[] => {
    if (!nodeId) return [];
    const path: CampaignNode[] = [];
    const visited = new Set<string>();
    
    const findPath = (targetId: string): boolean => {
      const node = campaign.nodes.find(n => n.id === targetId);
      if (!node || visited.has(targetId)) return false;
      visited.add(targetId);
      
      // Find parent links (links where this node is the target)
      const parentLinks = campaign.links.filter(l => l.target === targetId);
      
      if (parentLinks.length === 0) {
        // This is a root node
        path.unshift(node);
        return true;
      }
      
      // Try to find path through any parent
      for (const link of parentLinks) {
        if (findPath(link.source)) {
          path.push(node);
          return true;
        }
      }
      
      // If no path through parents, treat as root
      path.unshift(node);
      return true;
    };
    
    findPath(nodeId);
    return path;
  }, [campaign.nodes, campaign.links]);

  // Get node relations (Excalibrain-style)
  const getNodeRelations = useCallback((nodeId: string | null) => {
    if (!nodeId) return { parents: [], children: [], siblings: [], related: [] };
    
    const parents: { node: CampaignNode; relation: RelationType }[] = [];
    const children: { node: CampaignNode; relation: RelationType }[] = [];
    const siblings: { node: CampaignNode; relation: RelationType }[] = [];
    const related: { node: CampaignNode; relation: RelationType }[] = [];
    
    // Find direct connections
    campaign.links.forEach(link => {
      if (link.source === nodeId) {
        const targetNode = campaign.nodes.find(n => n.id === link.target);
        if (targetNode) {
          const rel = link.relation || 'next';
          if (rel === 'child' || rel === 'next') {
            children.push({ node: targetNode, relation: rel });
          } else if (rel === 'sibling') {
            siblings.push({ node: targetNode, relation: rel });
          } else {
            related.push({ node: targetNode, relation: rel });
          }
        }
      }
      if (link.target === nodeId) {
        const sourceNode = campaign.nodes.find(n => n.id === link.source);
        if (sourceNode) {
          const rel = link.relation || 'prev';
          if (rel === 'parent' || rel === 'prev' || rel === 'next') {
            parents.push({ node: sourceNode, relation: rel === 'next' ? 'prev' : rel });
          } else if (rel === 'sibling') {
            siblings.push({ node: sourceNode, relation: rel });
          } else {
            related.push({ node: sourceNode, relation: rel });
          }
        }
      }
    });
    
    return { parents, children, siblings, related };
  }, [campaign.nodes, campaign.links]);

  // Selected node breadcrumbs and relations
  const breadcrumbs = useMemo(() => getBreadcrumbs(selectedNode), [selectedNode, getBreadcrumbs]);
  const nodeRelations = useMemo(() => getNodeRelations(selectedNode), [selectedNode, getNodeRelations]);

  const addNode = useCallback((type: string, parentId?: string) => {
    const nodeType = NODE_TYPES.find(t => t.type === type);
    const newNode: CampaignNode = {
      id: `node-${Date.now()}`,
      type: type as CampaignNode['type'],
      title: `New ${nodeType?.label || 'Node'}`,
      content: '',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 200,
      height: 100,
      color: nodeType?.color || 'stone',
      children: type === 'folder' ? [] : undefined,
      metadata: type === 'step' ? {
        toolsForStep: [],
        questions: [],
        successIndicators: [],
        redFlags: []
      } : undefined
    };

    setCampaign(prev => {
      const newNodes = [...prev.nodes, newNode];
      let newRootNodes = prev.rootNodes;
      
      if (parentId) {
        const parentIndex = newNodes.findIndex(n => n.id === parentId);
        if (parentIndex >= 0 && newNodes[parentIndex].type === 'folder') {
          newNodes[parentIndex] = {
            ...newNodes[parentIndex],
            children: [...(newNodes[parentIndex].children || []), newNode.id]
          };
        }
      } else {
        newRootNodes = [...prev.rootNodes, newNode.id];
      }

      return { ...prev, nodes: newNodes, rootNodes: newRootNodes };
    });

    setEditingNode(newNode);
    toast({ title: `${nodeType?.label} added` });
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<CampaignNode>) => {
    setCampaign(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
    }));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setCampaign(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId).map(n => ({
        ...n,
        children: n.children?.filter(c => c !== nodeId)
      })),
      links: prev.links.filter(l => l.source !== nodeId && l.target !== nodeId),
      rootNodes: prev.rootNodes.filter(r => r !== nodeId)
    }));
    setSelectedNode(null);
  }, []);

  const [pendingLinkRelation, setPendingLinkRelation] = useState<RelationType>('next');

  const createLink = useCallback((sourceId: string, targetId: string, relation: RelationType = 'next') => {
    if (sourceId === targetId) return;
    
    const existingLink = campaign.links.find(
      l => l.source === sourceId && l.target === targetId
    );
    if (existingLink) {
      toast({ title: 'Link already exists', variant: 'destructive' });
      return;
    }

    const newLink: CampaignLink = {
      id: `link-${Date.now()}`,
      source: sourceId,
      target: targetId,
      color: 'amber',
      relation: relation
    };

    setCampaign(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));

    setLinkingFrom(null);
    toast({ title: `Link created (${relation})` });
  }, [campaign.links]);

  const updateLinkRelation = useCallback((linkId: string, relation: RelationType) => {
    setCampaign(prev => ({
      ...prev,
      links: prev.links.map(l => l.id === linkId ? { ...l, relation } : l)
    }));
  }, []);

  const deleteLink = useCallback((linkId: string) => {
    setCampaign(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== linkId)
    }));
  }, []);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const getEventCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handleNodeDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, nodeId: string) => {
    if (mode !== 'graph') return;
    const node = campaign.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const { clientX, clientY } = getEventCoords(e);
    setDraggedNode(nodeId);
    setDragOffset({
      x: clientX - node.x,
      y: clientY - node.y
    });
  }, [mode, campaign.nodes]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!draggedNode || mode !== 'graph') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { clientX, clientY } = getEventCoords(e);
    const x = clientX - rect.left - dragOffset.x;
    const y = clientY - rect.top - dragOffset.y;

    updateNode(draggedNode, { x: Math.max(0, x), y: Math.max(0, y) });
  }, [draggedNode, mode, dragOffset, updateNode]);

  const handleCanvasMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  // Export as JSON
  const exportCampaignJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(campaign, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.name.replace(/\s+/g, '_')}.json`;
    a.click();
    toast({ title: 'Campaign exported as JSON' });
  }, [campaign]);

  // Export as Obsidian-compatible Markdown (Dataview, Breadcrumbs, Excalibrain)
  const exportCampaignObsidian = useCallback(() => {
    const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Generate markdown for each node
    const files: { name: string; content: string }[] = [];
    
    campaign.nodes.forEach(node => {
      const nodeLinks = campaign.links.filter(l => l.source === node.id || l.target === node.id);
      const outgoing = nodeLinks.filter(l => l.source === node.id);
      const incoming = nodeLinks.filter(l => l.target === node.id);
      
      // Build YAML frontmatter (Dataview compatible)
      const frontmatter: Record<string, unknown> = {
        id: node.id,
        type: node.type,
        color: node.color,
        tags: [`campaign/${campaign.name.replace(/\s+/g, '-')}`],
        created: new Date().toISOString().split('T')[0],
      };
      
      // Breadcrumbs plugin relations
      if (incoming.length > 0) {
        frontmatter['up'] = incoming.map(l => {
          const sourceNode = campaign.nodes.find(n => n.id === l.source);
          return `[[${sanitizeFilename(sourceNode?.title || l.source)}]]`;
        });
      }
      if (outgoing.length > 0) {
        frontmatter['down'] = outgoing.map(l => {
          const targetNode = campaign.nodes.find(n => n.id === l.target);
          return `[[${sanitizeFilename(targetNode?.title || l.target)}]]`;
        });
      }
      
      // Add metadata fields for Dataview
      if (node.metadata?.toolsForStep?.length) {
        frontmatter['tools'] = node.metadata.toolsForStep;
      }
      if (node.metadata?.questions?.length) {
        frontmatter['questions'] = node.metadata.questions;
      }
      if (node.metadata?.successIndicators?.length) {
        frontmatter['success-indicators'] = node.metadata.successIndicators;
      }
      if (node.metadata?.redFlags?.length) {
        frontmatter['red-flags'] = node.metadata.redFlags;
      }
      
      // Build markdown content
      let md = '---\n';
      Object.entries(frontmatter).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          md += `${key}:\n${value.map(v => `  - ${v}`).join('\n')}\n`;
        } else {
          md += `${key}: ${value}\n`;
        }
      });
      md += '---\n\n';
      
      // Title
      md += `# ${node.title}\n\n`;
      
      // Type badge
      md += `> [!info] ${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node\n`;
      md += `> Color: ${node.color}\n\n`;
      
      // Content
      if (node.content) {
        md += `## Content\n\n${node.content}\n\n`;
      }
      
      // Excalibrain-style inline relations
      md += `## Relations\n\n`;
      
      if (incoming.length > 0) {
        md += `### Parents (up::)\n`;
        incoming.forEach(l => {
          const sourceNode = campaign.nodes.find(n => n.id === l.source);
          const relType = l.relation || 'parent';
          md += `- up:: [[${sanitizeFilename(sourceNode?.title || l.source)}]] (${relType})\n`;
        });
        md += '\n';
      }
      
      if (outgoing.length > 0) {
        md += `### Children (down::)\n`;
        outgoing.forEach(l => {
          const targetNode = campaign.nodes.find(n => n.id === l.target);
          const relType = l.relation || 'child';
          md += `- down:: [[${sanitizeFilename(targetNode?.title || l.target)}]] (${relType})\n`;
        });
        md += '\n';
      }
      
      // Metadata sections
      if (node.metadata?.toolsForStep?.length) {
        md += `## Tools\n\n`;
        node.metadata.toolsForStep.forEach(tool => {
          md += `- \`${tool}\`\n`;
        });
        md += '\n';
      }
      
      if (node.metadata?.questions?.length) {
        md += `## Investigation Questions\n\n`;
        node.metadata.questions.forEach(q => {
          md += `- [ ] ${q}\n`;
        });
        md += '\n';
      }
      
      if (node.metadata?.successIndicators?.length) {
        md += `## Success Indicators\n\n`;
        node.metadata.successIndicators.forEach(s => {
          md += `- ✅ ${s}\n`;
        });
        md += '\n';
      }
      
      if (node.metadata?.redFlags?.length) {
        md += `## Red Flags\n\n`;
        node.metadata.redFlags.forEach(f => {
          md += `- 🚩 ${f}\n`;
        });
        md += '\n';
      }
      
      // Dataview query example
      md += `---\n\n`;
      md += `## Dataview Queries\n\n`;
      md += '```dataview\n';
      md += `TABLE type, tools\n`;
      md += `FROM #campaign/${campaign.name.replace(/\s+/g, '-')}\n`;
      md += `WHERE type = "${node.type}"\n`;
      md += '```\n';
      
      files.push({
        name: `${sanitizeFilename(node.title)}.md`,
        content: md
      });
    });
    
    // Create index file
    let indexMd = '---\n';
    indexMd += `title: ${campaign.name}\n`;
    indexMd += `description: ${campaign.description}\n`;
    indexMd += `type: campaign-index\n`;
    indexMd += `nodes: ${campaign.nodes.length}\n`;
    indexMd += `links: ${campaign.links.length}\n`;
    indexMd += '---\n\n';
    indexMd += `# ${campaign.name}\n\n`;
    indexMd += `${campaign.description}\n\n`;
    indexMd += `## Campaign Nodes\n\n`;
    indexMd += '```dataview\n';
    indexMd += `TABLE type, tools, up, down\n`;
    indexMd += `FROM #campaign/${campaign.name.replace(/\s+/g, '-')}\n`;
    indexMd += `SORT type ASC\n`;
    indexMd += '```\n\n';
    indexMd += `## Node List\n\n`;
    campaign.nodes.forEach(node => {
      indexMd += `- [[${sanitizeFilename(node.title)}]] (${node.type})\n`;
    });
    
    files.push({
      name: `_${sanitizeFilename(campaign.name)}_Index.md`,
      content: indexMd
    });
    
    // Create a zip-like concatenated file (or download individual)
    const allContent = files.map(f => `<!-- FILE: ${f.name} -->\n${f.content}\n\n---\n\n`).join('');
    const blob = new Blob([allContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.name.replace(/\s+/g, '_')}_obsidian.md`;
    a.click();
    toast({ title: 'Exported for Obsidian (Dataview/Breadcrumbs/Excalibrain)' });
  }, [campaign]);

  const exportCampaign = exportCampaignJSON;

  const renderTreeNode = (nodeId: string, depth: number = 0) => {
    const node = campaign.nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders.has(nodeId);
    const isSelected = selectedNode === nodeId;
    const nodeType = NODE_TYPES.find(t => t.type === node.type);

    return (
      <div key={nodeId} style={{ marginLeft: depth * 16 }}>
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
            isSelected ? 'bg-amber-900/30 border border-amber-600' : 'hover:bg-stone-800/50'
          }`}
          onClick={() => setSelectedNode(nodeId)}
          data-testid={`tree-node-${nodeId}`}
        >
          {isFolder && (
            <button onClick={(e) => { e.stopPropagation(); toggleFolder(nodeId); }}>
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
          <span className={`text-${node.color}-400`}>{nodeType?.icon}</span>
          <span className="text-xs text-stone-300 truncate flex-1">{node.title}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
            <button onClick={(e) => { e.stopPropagation(); setEditingNode(node); }} className="p-1 hover:bg-stone-700 rounded">
              <Edit3 className="w-3 h-3 text-stone-400" />
            </button>
            {isFolder && (
              <button onClick={(e) => { e.stopPropagation(); addNode('step', nodeId); }} className="p-1 hover:bg-stone-700 rounded">
                <Plus className="w-3 h-3 text-stone-400" />
              </button>
            )}
          </div>
        </div>
        {isFolder && isExpanded && node.children?.map(childId => renderTreeNode(childId, depth + 1))}
      </div>
    );
  };

  const renderGraphNode = (node: CampaignNode) => {
    const nodeType = NODE_TYPES.find(t => t.type === node.type);
    const isSelected = selectedNode === node.id;
    const isLinking = linkingFrom === node.id;
    const isLinkTarget = linkingFrom && linkingFrom !== node.id;
    const isInlineEditing = inlineEditNode === node.id;

    return (
      <div
        key={node.id}
        className={`absolute p-3 rounded-lg transition-all duration-200 ${COLOR_MAP[node.color]} ${
          isSelected ? 'ring-4 ring-amber-500 ring-opacity-80 shadow-lg shadow-amber-500/30 border-amber-400' : 'border-2'
        } ${isLinking ? 'ring-4 ring-teal-500 ring-opacity-80 shadow-lg shadow-teal-500/30' : ''} ${
          isLinkTarget ? 'border-teal-400 border-dashed animate-pulse cursor-crosshair' : 'cursor-move'
        }`}
        style={{
          left: node.x,
          top: node.y,
          width: node.width,
          minHeight: node.height,
          zIndex: isSelected || isLinking ? 50 : 10
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isLinkTarget) {
            createLink(linkingFrom!, node.id);
          } else {
            setSelectedNode(node.id);
          }
        }}
        onDoubleClick={() => setInlineEditNode(node.id)}
        onMouseDown={(e) => !isInlineEditing && handleNodeDragStart(e, node.id)}
        onTouchStart={(e) => !isInlineEditing && handleNodeDragStart(e, node.id)}
        data-testid={`graph-node-${node.id}`}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-2 -left-2 bg-amber-500 text-black text-[10px] px-1.5 py-0.5 rounded font-bold">
            SELECTED
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-${node.color}-400`}>{nodeType?.icon}</span>
          {isInlineEditing ? (
            <Input
              autoFocus
              value={node.title}
              onChange={(e) => updateNode(node.id, { title: e.target.value })}
              onBlur={() => setInlineEditNode(null)}
              onKeyDown={(e) => e.key === 'Enter' && setInlineEditNode(null)}
              className="text-xs bg-transparent border-amber-600 h-6 p-1 text-stone-200"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-xs font-bold text-stone-200 truncate flex-1">{node.title}</span>
          )}
          <Badge variant="outline" className={`text-[8px] border-${node.color}-600 text-${node.color}-400`}>
            {nodeType?.label}
          </Badge>
        </div>
        
        {isInlineEditing ? (
          <textarea
            value={node.content}
            onChange={(e) => updateNode(node.id, { content: e.target.value })}
            className="w-full text-[10px] bg-transparent border border-amber-600 rounded p-1 text-stone-300 resize-none"
            rows={3}
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter node content..."
          />
        ) : (
          <p className="text-[10px] text-stone-400 line-clamp-3">{node.content || 'Double-click to edit'}</p>
        )}
        
        {/* Left input connector - for receiving links */}
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
          <button
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isLinkTarget
                ? 'bg-teal-500 border-teal-400 scale-125 animate-pulse' 
                : 'bg-stone-900 border-stone-600 hover:border-teal-400 hover:bg-teal-900/50'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (linkingFrom && linkingFrom !== node.id) {
                createLink(linkingFrom, node.id);
              }
            }}
            title="Drop link here"
          >
            <ChevronRight className="w-3 h-3 text-stone-400" />
          </button>
        </div>
        
        {/* Right output connector - bigger touch target for creating links */}
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
          <button
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all text-sm font-bold ${
              isLinking 
                ? 'bg-teal-500 border-teal-400 scale-110 text-black' 
                : 'bg-stone-800 border-stone-600 hover:border-amber-500 hover:bg-amber-900/50 text-stone-300'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (linkingFrom && linkingFrom !== node.id) {
                createLink(linkingFrom, node.id);
              } else if (linkingFrom === node.id) {
                setLinkingFrom(null);
                setLinkMousePos(null);
              } else {
                setLinkingFrom(node.id);
              }
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (linkingFrom && linkingFrom !== node.id) {
                createLink(linkingFrom, node.id);
              } else if (linkingFrom === node.id) {
                setLinkingFrom(null);
                setLinkMousePos(null);
              } else {
                setLinkingFrom(node.id);
              }
            }}
            title={linkingFrom ? (linkingFrom === node.id ? 'Cancel linking' : 'Connect here') : 'Tap to link'}
            data-testid={`link-connector-${node.id}`}
          >
            {isLinking ? '✕' : '→'}
          </button>
        </div>

        {/* Left connector for incoming links */}
        {isLinkTarget && (
          <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
            <div className="w-10 h-10 rounded-full border-2 border-teal-400 bg-teal-500/50 flex items-center justify-center animate-pulse text-sm font-bold text-black">
              ←
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLinks = () => {
    return campaign.links.map(link => {
      const source = campaign.nodes.find(n => n.id === link.source);
      const target = campaign.nodes.find(n => n.id === link.target);
      if (!source || !target) return null;

      const x1 = source.x + source.width;
      const y1 = source.y + source.height / 2;
      const x2 = target.x;
      const y2 = target.y + target.height / 2;

      const midX = (x1 + x2) / 2;

      return (
        <g key={link.id}>
          <path
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke={`var(--${link.color}-500, #f59e0b)`}
            strokeWidth="3"
            className="cursor-pointer hover:stroke-red-500 transition-colors"
            onClick={() => deleteLink(link.id)}
          />
          <circle cx={x2} cy={y2} r="6" fill={`var(--${link.color}-500, #f59e0b)`} className="animate-pulse" />
          <circle cx={x1} cy={y1} r="4" fill={`var(--${link.color}-500, #f59e0b)`} />
          {link.label && (
            <text x={midX} y={(y1 + y2) / 2 - 8} className="text-[11px] fill-stone-300 font-bold" textAnchor="middle">
              {link.label}
            </text>
          )}
        </g>
      );
    });
  };

  const renderLinkPreview = () => {
    if (!linkingFrom || !linkMousePos) return null;
    
    const source = campaign.nodes.find(n => n.id === linkingFrom);
    if (!source) return null;

    const x1 = source.x + source.width;
    const y1 = source.y + source.height / 2;
    const x2 = linkMousePos.x;
    const y2 = linkMousePos.y;
    const midX = (x1 + x2) / 2;

    return (
      <path
        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke="#14b8a6"
        strokeWidth="3"
        strokeDasharray="8 4"
        className="pointer-events-none animate-pulse"
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[100vw] sm:w-[95vw] h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-[#0a0500] border-amber-900/50 p-0 overflow-hidden rounded-none sm:rounded-lg">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-3 sm:p-4 border-b border-amber-900/30 shrink-0">
            <DialogTitle className="text-amber-500 font-orbitron flex items-center gap-2 text-sm sm:text-base">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              Campaign Designer
            </DialogTitle>
            <div className="flex flex-col gap-2 mt-2 sm:mt-3">
              <Input
                value={campaign.name}
                onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                className="bg-transparent border-stone-700 text-stone-300 text-sm min-h-[44px]"
                placeholder="Campaign name..."
              />
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={mode === 'tree' ? 'default' : 'outline'}
                  onClick={() => setMode('tree')}
                  className={`min-h-[44px] min-w-[44px] px-3 ${mode === 'tree' ? 'bg-amber-700 text-black' : 'border-stone-700 text-stone-400'}`}
                >
                  <FolderTree className="w-4 h-4" />
                  <span className="ml-1 hidden sm:inline">Tree</span>
                </Button>
                <Button
                  size="sm"
                  variant={mode === 'graph' ? 'default' : 'outline'}
                  onClick={() => setMode('graph')}
                  className={`min-h-[44px] min-w-[44px] px-3 ${mode === 'graph' ? 'bg-purple-700 text-white' : 'border-stone-700 text-stone-400'}`}
                >
                  <GitBranch className="w-4 h-4" />
                  <span className="ml-1 hidden sm:inline">Graph</span>
                </Button>
                <Select
                  value=""
                  onValueChange={(format) => {
                    if (format === 'json') exportCampaignJSON();
                    else if (format === 'obsidian') exportCampaignObsidian();
                  }}
                >
                  <SelectTrigger className="border-amber-800 text-amber-400 min-h-[44px] min-w-[44px] w-auto px-2 bg-transparent" data-testid="export-dropdown">
                    <Download className="w-4 h-4" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900 border-stone-700">
                    <SelectItem value="json" className="text-stone-300 min-h-[44px]">
                      Export JSON
                    </SelectItem>
                    <SelectItem value="obsidian" className="text-stone-300 min-h-[44px]">
                      Export Obsidian (Dataview/Breadcrumbs)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  variant={testRunMode ? 'default' : 'outline'} 
                  onClick={() => {
                    if (!testRunMode && campaign.rootNodes.length > 0) {
                      setTestRunMode(true);
                      setTestCurrentNode(campaign.rootNodes[0]);
                      setTestHistory([campaign.rootNodes[0]]);
                    } else {
                      setTestRunMode(false);
                      setTestCurrentNode(null);
                      setTestHistory([]);
                    }
                  }}
                  className={`min-h-[44px] min-w-[44px] px-3 ${testRunMode ? 'bg-teal-700 text-white' : 'border-teal-800 text-teal-400'}`}
                  disabled={campaign.rootNodes.length === 0}
                  data-testid="test-run-btn"
                >
                  {testRunMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="ml-1 hidden sm:inline">{testRunMode ? 'Stop' : 'Test'}</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">
            {/* Campaign File Tree Sidebar - Always visible on desktop */}
            <div className={`border-b sm:border-b-0 sm:border-r border-amber-900/30 p-2 sm:p-3 shrink-0 sm:w-[200px] bg-stone-950/50 ${showFileTree ? '' : 'hidden sm:block'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-amber-500 uppercase tracking-wider font-bold flex items-center gap-1">
                    <FolderTree className="w-3 h-3" /> Campaigns
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={newCampaign}
                    className="p-0 h-6 w-6 text-amber-400 hover:text-amber-300"
                    title="New Campaign"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <ScrollArea className="h-[120px] sm:h-[200px]">
                  <div className="space-y-1">
                    {savedCampaigns.length === 0 ? (
                      <p className="text-stone-600 text-xs text-center py-4">No saved campaigns</p>
                    ) : (
                      savedCampaigns.map(c => (
                        <div 
                          key={c.id}
                          className={`group flex items-center gap-1 p-1.5 rounded cursor-pointer text-xs transition-all ${
                            c.id === campaign.id 
                              ? 'bg-amber-900/40 text-amber-300' 
                              : 'hover:bg-stone-800 text-stone-400'
                          }`}
                          onClick={() => loadCampaign(c.id)}
                          data-testid={`campaign-file-${c.id}`}
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="truncate flex-1">{c.name}</span>
                          <div className="hidden group-hover:flex gap-0.5">
                            <button 
                              onClick={(e) => { e.stopPropagation(); duplicateCampaign(c.id); }}
                              className="p-0.5 hover:text-teal-400"
                              title="Duplicate"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteCampaign(c.id); }}
                              className="p-0.5 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="border-t border-stone-800 mt-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveCampaign}
                    disabled={isSyncing}
                    className={`w-full justify-start text-xs min-h-[36px] ${
                      isSyncing
                        ? 'border-teal-600 text-teal-400'
                        : isUnsaved 
                          ? 'border-amber-600 text-amber-400 animate-pulse' 
                          : 'border-stone-700 text-stone-400'
                    }`}
                    data-testid="save-campaign-btn"
                  >
                    {isSyncing ? (
                      <div className="w-3 h-3 mr-1.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3 h-3 mr-1.5" />
                    )}
                    {isSyncing ? 'Syncing...' : isUnsaved ? 'Save*' : 'Saved'}
                  </Button>
                </div>
              </div>

            {/* Node Types Sidebar */}
            <div className="border-b sm:border-b-0 sm:border-r border-amber-900/30 p-2 sm:p-3 shrink-0">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">Add Node</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowFileTree(!showFileTree)}
                  className="p-0 h-5 w-5 text-stone-500 hover:text-amber-400 sm:hidden"
                  title="Toggle File Tree"
                >
                  <FolderTree className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex sm:flex-col gap-1.5 sm:gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
              {NODE_TYPES.map(nt => {
                  const buttonStyles: Record<string, string> = {
                    amber: 'border-amber-800 text-amber-400 hover:bg-amber-950/30',
                    purple: 'border-purple-800 text-purple-400 hover:bg-purple-950/30',
                    teal: 'border-teal-800 text-teal-400 hover:bg-teal-950/30',
                    stone: 'border-stone-800 text-stone-400 hover:bg-stone-950/30'
                  };
                  return (
                    <Button
                      key={nt.type}
                      size="sm"
                      variant="outline"
                      onClick={() => addNode(nt.type)}
                      className={`justify-center sm:justify-start min-h-[44px] min-w-[44px] sm:min-w-[90px] px-2 sm:px-3 text-xs ${buttonStyles[nt.color] || buttonStyles.stone}`}
                      data-testid={`add-node-${nt.type}`}
                    >
                      {nt.icon}
                      <span className="ml-1.5 hidden sm:inline">{nt.label}</span>
                    </Button>
                  );
                })}
              </div>

              <div className="border-t border-stone-800 mt-2 pt-2 hidden sm:block">
                <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-2">Actions</p>
                {linkingFrom && (
                  <Badge className="bg-teal-900 text-teal-400 text-[10px] mb-2">
                    Linking mode: Click target node
                  </Badge>
                )}
                {selectedNode && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const node = campaign.nodes.find(n => n.id === selectedNode);
                        if (node) setEditingNode(node);
                      }}
                      className="w-full justify-start text-xs border-stone-700 text-stone-400 mb-1"
                    >
                      <Edit3 className="w-3 h-3 mr-2" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLinkingFrom(selectedNode)}
                      className="w-full justify-start text-xs border-teal-700 text-teal-400 mb-1"
                    >
                      <Link2 className="w-3 h-3 mr-2" /> Link From
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteNode(selectedNode)}
                      className="w-full justify-start text-xs border-purple-700 text-purple-400"
                    >
                      <Trash2 className="w-3 h-3 mr-2" /> Delete
                    </Button>
                  </>
                )}
              </div>

              {/* Obsidian-style Link Query */}
              <div className="border-t border-stone-800 mt-2 pt-2 hidden sm:block">
                <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-2">Link by Query</p>
                <div className="relative">
                  <Input
                    value={linkQuery}
                    onChange={(e) => {
                      setLinkQuery(e.target.value);
                      setShowLinkSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => linkQuery && setShowLinkSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLinkSuggestions(false), 200)}
                    placeholder="[[name]] @type: #tool:"
                    className="bg-black/30 border-stone-700 text-stone-300 text-xs h-8"
                    data-testid="link-query-input"
                  />
                  {showLinkSuggestions && linkQueryResults.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-stone-900 border border-stone-700 rounded-md shadow-lg max-h-32 overflow-auto">
                      {linkQueryResults.slice(0, 5).map(node => (
                        <button
                          key={node.id}
                          className="w-full text-left px-2 py-1.5 text-xs hover:bg-stone-800 flex items-center gap-2"
                          onClick={() => {
                            if (selectedNode && selectedNode !== node.id) {
                              createLink(selectedNode, node.id);
                              setLinkQuery('');
                              setShowLinkSuggestions(false);
                            } else {
                              setSelectedNode(node.id);
                              setLinkQuery('');
                              setShowLinkSuggestions(false);
                            }
                          }}
                        >
                          <span className={`w-2 h-2 rounded-full bg-${node.color}-500`} />
                          <span className="text-stone-300 truncate">{node.title}</span>
                          <span className="text-stone-500 text-[10px]">@{node.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-stone-600 mt-1">
                  [[name]] @type:step #tool:nmap
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative flex flex-col">
              {/* Breadcrumbs - path to selected node */}
              {selectedNode && breadcrumbs.length > 0 && (
                <div className="bg-stone-900/80 backdrop-blur border-b border-stone-800 px-3 py-1.5 flex items-center gap-1 overflow-x-auto shrink-0" data-testid="breadcrumbs">
                  {breadcrumbs.map((node, idx) => (
                    <div key={node.id} className="flex items-center gap-1 shrink-0">
                      {idx > 0 && <ChevronRight className="w-3 h-3 text-stone-600" />}
                      <button
                        onClick={() => setSelectedNode(node.id)}
                        className={`text-xs px-2 py-1 rounded transition-colors min-h-[32px] ${
                          node.id === selectedNode 
                            ? 'bg-amber-900/50 text-amber-400 font-medium' 
                            : 'text-stone-400 hover:bg-stone-800 hover:text-stone-300'
                        }`}
                      >
                        {node.title}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Relations Panel - Excalibrain style */}
              {selectedNode && (nodeRelations.parents.length > 0 || nodeRelations.children.length > 0 || nodeRelations.siblings.length > 0) && (
                <div className="bg-stone-900/60 border-b border-stone-800 px-3 py-2 shrink-0 overflow-x-auto" data-testid="relations-panel">
                  <div className="flex items-center gap-4 text-[10px]">
                    {nodeRelations.parents.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-purple-400 font-medium">↑ Parents:</span>
                        {nodeRelations.parents.slice(0, 3).map(({ node }) => (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNode(node.id)}
                            className="px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-300 hover:bg-purple-800/50 min-h-[24px]"
                          >
                            {node.title}
                          </button>
                        ))}
                      </div>
                    )}
                    {nodeRelations.children.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-teal-400 font-medium">↓ Children:</span>
                        {nodeRelations.children.slice(0, 3).map(({ node }) => (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNode(node.id)}
                            className="px-1.5 py-0.5 rounded bg-teal-900/30 text-teal-300 hover:bg-teal-800/50 min-h-[24px]"
                          >
                            {node.title}
                          </button>
                        ))}
                      </div>
                    )}
                    {nodeRelations.siblings.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-medium">↔ Siblings:</span>
                        {nodeRelations.siblings.slice(0, 3).map(({ node }) => (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNode(node.id)}
                            className="px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-300 hover:bg-amber-800/50 min-h-[24px]"
                          >
                            {node.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile action bar for selected node */}
              {selectedNode && (
                <div className="sm:hidden sticky top-0 z-10 bg-[#0a0500]/95 backdrop-blur border-b border-amber-900/30 p-2 flex items-center gap-2 shrink-0" data-testid="mobile-action-bar">
                  <span className="text-xs text-stone-400 truncate flex-1" data-testid="selected-node-title">
                    {campaign.nodes.find(n => n.id === selectedNode)?.title}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const node = campaign.nodes.find(n => n.id === selectedNode);
                      if (node) setEditingNode(node);
                    }}
                    className="min-h-[44px] min-w-[44px] p-0 border-amber-700 text-amber-400"
                    data-testid="mobile-edit-btn"
                  >
                    <Edit3 className="w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLinkingFrom(selectedNode)}
                    className="min-h-[44px] min-w-[44px] p-0 border-teal-700 text-teal-400"
                    data-testid="mobile-link-btn"
                  >
                    <Link2 className="w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteNode(selectedNode)}
                    className="min-h-[44px] min-w-[44px] p-0 border-purple-700 text-purple-400"
                    data-testid="mobile-delete-btn"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedNode(null)}
                    className="min-h-[44px] min-w-[44px] p-0 text-stone-400 text-xl"
                    data-testid="mobile-close-btn"
                  >
                    ×
                  </Button>
                </div>
              )}
              {mode === 'tree' ? (
                <ScrollArea className="h-full p-4">
                  <div className="space-y-1">
                    {campaign.rootNodes.length === 0 ? (
                      <p className="text-stone-500 text-sm text-center py-8">
                        Add nodes using the sidebar to build your campaign
                      </p>
                    ) : (
                      campaign.rootNodes.map(nodeId => renderTreeNode(nodeId))
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div
                  ref={canvasRef}
                  className="absolute inset-0 overflow-auto bg-[#050200]"
                  style={{ 
                    touchAction: draggedNode ? 'none' : 'pan-x pan-y',
                    backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                  onMouseMove={(e) => {
                    handleCanvasMouseMove(e);
                    if (linkingFrom && canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      setLinkMousePos({
                        x: e.clientX - rect.left + canvasRef.current.scrollLeft,
                        y: e.clientY - rect.top + canvasRef.current.scrollTop
                      });
                    }
                  }}
                  onMouseUp={() => {
                    handleCanvasMouseUp();
                    if (linkingFrom) {
                      setLinkingFrom(null);
                      setLinkMousePos(null);
                    }
                  }}
                  onMouseLeave={() => {
                    handleCanvasMouseUp();
                    setLinkMousePos(null);
                  }}
                  onTouchMove={handleCanvasMouseMove}
                  onTouchEnd={handleCanvasMouseUp}
                  onTouchCancel={handleCanvasMouseUp}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setSelectedNode(null);
                      setInlineEditNode(null);
                      if (linkingFrom) {
                        setLinkingFrom(null);
                        setLinkMousePos(null);
                      }
                    }
                  }}
                >
                  {/* Linking mode indicator */}
                  {linkingFrom && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-teal-900/90 text-teal-300 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                      <Link2 className="w-4 h-4" />
                      Click target node or canvas to cancel
                    </div>
                  )}
                  
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 4000, minHeight: 3000 }}>
                    {renderLinks()}
                    {renderLinkPreview()}
                  </svg>
                  {campaign.nodes.map(renderGraphNode)}
                </div>
              )}
            </div>

            {/* Test Run Panel */}
            {testRunMode && testCurrentNode && (
              <div className="fixed inset-x-0 bottom-0 sm:absolute sm:inset-auto sm:bottom-4 sm:left-4 sm:right-4 z-50 bg-teal-950/95 backdrop-blur border-t sm:border sm:rounded-lg border-teal-700 p-4" data-testid="test-run-panel">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-teal-400 flex items-center gap-2">
                    <Play className="w-4 h-4" /> Test Run Mode
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (testHistory.length > 1) {
                          const newHistory = testHistory.slice(0, -1);
                          setTestHistory(newHistory);
                          setTestCurrentNode(newHistory[newHistory.length - 1]);
                        }
                      }}
                      disabled={testHistory.length <= 1}
                      className="min-h-[44px] min-w-[44px] text-teal-400"
                      data-testid="test-back-btn"
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTestCurrentNode(campaign.rootNodes[0]);
                        setTestHistory([campaign.rootNodes[0]]);
                      }}
                      className="min-h-[44px] min-w-[44px] text-teal-400"
                      data-testid="test-restart-btn"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {(() => {
                  const currentNode = campaign.nodes.find(n => n.id === testCurrentNode);
                  const nodeType = NODE_TYPES.find(t => t.type === currentNode?.type);
                  const outgoingLinks = campaign.links.filter(l => l.source === testCurrentNode);
                  
                  return currentNode ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          currentNode.color === 'amber' ? 'bg-amber-700 text-white' :
                          currentNode.color === 'purple' ? 'bg-purple-700 text-white' :
                          currentNode.color === 'teal' ? 'bg-teal-700 text-white' :
                          'bg-stone-700 text-white'
                        }>
                          {nodeType?.icon} {nodeType?.label}
                        </Badge>
                        <span className="text-sm font-bold text-stone-200">{currentNode.title}</span>
                      </div>
                      <p className="text-sm text-stone-400">{currentNode.content || 'No content'}</p>
                      
                      {outgoingLinks.length > 0 ? (
                        <div>
                          <p className="text-xs text-stone-500 mb-2">Choose next step:</p>
                          <Select
                            value=""
                            onValueChange={(nodeId) => {
                              setTestCurrentNode(nodeId);
                              setTestHistory(prev => [...prev, nodeId]);
                            }}
                          >
                            <SelectTrigger className="bg-black/50 border-teal-700 text-stone-300 min-h-[44px]" data-testid="test-next-select">
                              <SelectValue placeholder="Select next node..." />
                            </SelectTrigger>
                            <SelectContent className="bg-stone-900 border-teal-700">
                              {outgoingLinks.map(link => {
                                const targetNode = campaign.nodes.find(n => n.id === link.target);
                                return targetNode ? (
                                  <SelectItem key={link.id} value={link.target} className="text-stone-300">
                                    {link.label ? `${link.label}: ` : ''}{targetNode.title}
                                  </SelectItem>
                                ) : null;
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <Badge className="bg-amber-900 text-amber-300">End of flow - no outgoing links</Badge>
                      )}

                      <div className="flex items-center gap-2 text-xs text-stone-500 pt-2 border-t border-teal-900">
                        <span>Step {testHistory.length}</span>
                        <span>•</span>
                        <span>Path: {testHistory.map(id => campaign.nodes.find(n => n.id === id)?.title || 'Unknown').join(' → ')}</span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {editingNode && !testRunMode && (
              <div className="fixed inset-0 sm:relative sm:inset-auto z-50 sm:z-0 bg-[#0a0500] sm:bg-transparent sm:w-72 sm:border-l border-amber-900/30 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0a0500] py-2 z-10">
                  <h3 className="text-sm font-bold text-amber-500">Edit Node</h3>
                  <Button size="sm" variant="ghost" onClick={() => setEditingNode(null)} className="min-h-[44px] min-w-[44px]">
                    <span className="text-stone-500 text-xl">×</span>
                  </Button>
                </div>

                <div className="space-y-6 pb-20 sm:pb-0">
                  <div>
                    <label className="text-[10px] text-stone-500 uppercase">Node Type</label>
                    <Select
                      value={editingNode.type}
                      onValueChange={(type: CampaignNode['type']) => {
                        const nodeType = NODE_TYPES.find(t => t.type === type);
                        setEditingNode(prev => prev ? { ...prev, type, color: nodeType?.color || prev.color } : null);
                        updateNode(editingNode.id, { type, color: nodeType?.color || editingNode.color });
                      }}
                    >
                      <SelectTrigger className="bg-black/50 border-stone-700 text-stone-300 min-h-[44px]" data-testid="node-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-stone-700">
                        {NODE_TYPES.map(nt => (
                          <SelectItem key={nt.type} value={nt.type} className="text-stone-300">
                            <span className="flex items-center gap-2">
                              {nt.icon} {nt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-500 uppercase">Title</label>
                    <Input
                      value={editingNode.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setEditingNode(prev => prev ? { ...prev, title: newTitle } : null);
                        updateNode(editingNode.id, { title: newTitle });
                      }}
                      className="bg-black/50 border-stone-700 text-base min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-500 uppercase">Content</label>
                    <Textarea
                      value={editingNode.content}
                      onChange={(e) => {
                        const newContent = e.target.value;
                        setEditingNode(prev => prev ? { ...prev, content: newContent } : null);
                        updateNode(editingNode.id, { content: newContent });
                      }}
                      className="bg-black/50 border-stone-700 text-base min-h-[120px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-stone-500 uppercase">Color</label>
                    <Select
                      value={editingNode.color}
                      onValueChange={(color) => {
                        setEditingNode(prev => prev ? { ...prev, color } : null);
                        updateNode(editingNode.id, { color });
                      }}
                    >
                      <SelectTrigger className="bg-black/50 border-stone-700 text-stone-300 min-h-[44px]" data-testid="node-color-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-900 border-stone-700">
                        {[
                          { value: 'amber', label: 'Amber', bg: 'bg-amber-500' },
                          { value: 'teal', label: 'Teal', bg: 'bg-teal-500' },
                          { value: 'purple', label: 'Purple', bg: 'bg-purple-500' },
                          { value: 'stone', label: 'Stone', bg: 'bg-stone-500' }
                        ].map(color => (
                          <SelectItem key={color.value} value={color.value} className="text-stone-300">
                            <span className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded ${color.bg}`} />
                              {color.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {editingNode.type === 'step' && editingNode.metadata && (
                    <>
                      <div>
                        <label className="text-[10px] text-stone-500 uppercase">Tools for Step</label>
                        <Input
                          placeholder="Shodan, Censys, nmap..."
                          className="bg-black/50 border-stone-700 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                const newTools = [...(editingNode.metadata?.toolsForStep || []), val];
                                setEditingNode(prev => prev ? { 
                                  ...prev, 
                                  metadata: { ...prev.metadata, toolsForStep: newTools }
                                } : null);
                                updateNode(editingNode.id, { 
                                  metadata: { ...editingNode.metadata, toolsForStep: newTools }
                                });
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {editingNode.metadata.toolsForStep?.map((tool, i) => (
                            <Badge key={i} variant="outline" className="text-[8px] border-amber-600 text-amber-400">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-stone-500 uppercase">Success Indicators</label>
                        <Input
                          placeholder="Add indicator..."
                          className="bg-black/50 border-stone-700 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                const newIndicators = [...(editingNode.metadata?.successIndicators || []), val];
                                setEditingNode(prev => prev ? { 
                                  ...prev, 
                                  metadata: { ...prev.metadata, successIndicators: newIndicators }
                                } : null);
                                updateNode(editingNode.id, { 
                                  metadata: { ...editingNode.metadata, successIndicators: newIndicators }
                                });
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <div className="flex flex-wrap gap-1 mt-1">
                          {editingNode.metadata.successIndicators?.map((ind, i) => (
                            <Badge key={i} variant="outline" className="text-[8px] border-green-600 text-green-400">
                              {ind}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t border-stone-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-stone-500">Width</label>
                        <Input
                          type="number"
                          value={editingNode.width}
                          onChange={(e) => {
                            const w = parseInt(e.target.value) || 200;
                            setEditingNode(prev => prev ? { ...prev, width: w } : null);
                            updateNode(editingNode.id, { width: w });
                          }}
                          className="bg-black/50 border-stone-700 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500">Height</label>
                        <Input
                          type="number"
                          value={editingNode.height}
                          onChange={(e) => {
                            const h = parseInt(e.target.value) || 100;
                            setEditingNode(prev => prev ? { ...prev, height: h } : null);
                            updateNode(editingNode.id, { height: h });
                          }}
                          className="bg-black/50 border-stone-700 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0500] border-t border-amber-900/30 sm:relative sm:p-0 sm:bg-transparent sm:border-0 sm:mt-6">
                    <Button 
                      onClick={() => setEditingNode(null)} 
                      className="w-full min-h-[50px] bg-amber-700 hover:bg-amber-600 text-black font-bold"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
