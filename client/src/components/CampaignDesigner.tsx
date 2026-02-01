import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  FolderTree, FileText, Plus, Trash2, Edit3, Link2, Eye, Save, Download, Key, Link, ExternalLink,
  Play, Pause, ChevronRight, ChevronDown, ChevronUp, ChevronLeft, Zap, Target, Shield, Search, Settings,
  Move, MousePointer, Unlink, GitBranch, Layers, Copy, MoreVertical, SkipBack, SkipForward, RotateCcw,
  ZoomIn, ZoomOut, Wand2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, GraduationCap
} from 'lucide-react';
import { useLearningStore } from '@/stores/useLearningStore';
import { LEARNING_GOALS, SKILL_LEVELS, CATEGORY_COLORS, type LearningGoal } from '@/config/learningConfig';

// Feature types available in the game
const FEATURE_TYPES = ['terminal', 'api', 'qr', 'crypto', 'agent', 'web', 'osint', 'steganography'] as const;
const CAMPAIGN_TYPES = ['recon', 'exploit', 'defense', 'osint', 'forensics', 'social', 'crypto', 'puzzle'] as const;
const SKILL_CATEGORIES = {
  'network': ['dns', 'tcp/ip', 'routing', 'firewall', 'vpn', 'bgp'],
  'web': ['http', 'cookies', 'xss', 'sqli', 'csrf', 'auth'],
  'crypto': ['encoding', 'hashing', 'encryption', 'pki', 'steganography'],
  'osint': ['dorking', 'social', 'metadata', 'geolocation', 'archives'],
  'system': ['linux', 'windows', 'permissions', 'processes', 'logs'],
  'programming': ['scripting', 'regex', 'api', 'parsing', 'automation']
} as const;

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
    learningGoals?: string[];
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    teachingNotes?: string;
    featureType?: typeof FEATURE_TYPES[number];
    campaignType?: typeof CAMPAIGN_TYPES[number];
    skills?: string[];
    linkedClues?: string[];
    condition?: string;
    parentOutcome?: string;
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
  sessionToken?: string;
}

export default function CampaignDesigner({ open, onOpenChange, sessionToken }: Props) {
  const learningProfile = useLearningStore(state => ({
    goals: state.goals,
    skillLevel: state.skillLevel,
    style: state.style,
    preferredPace: state.preferredPace
  }));
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
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [testStartNode, setTestStartNode] = useState<string | null>(null);
  const [linkQuery, setLinkQuery] = useState('');
  const [showLinkSuggestions, setShowLinkSuggestions] = useState(false);
  const [showFileTree, setShowFileTree] = useState(true);
  const [savedCampaigns, setSavedCampaigns] = useState<Campaign[]>([]);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sharedClues, setSharedClues] = useState<SharedClue[]>([]);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'canvas' | 'story' | 'tree' | 'clues' | 'overview'>('canvas');
  const [breadcrumbTrail, setBreadcrumbTrail] = useState<string[]>([]);

  // Wikilink parsing - extract [[Node Title]] links from content
  const parseWikilinks = useCallback((content: string): string[] => {
    const matches = content.match(/\[\[([^\]]+)\]\]/g) || [];
    return matches.map(m => m.slice(2, -2));
  }, []);

  // Find node by title (for wikilink resolution)
  const findNodeByTitle = useCallback((title: string) => {
    return campaign.nodes.find(n => n.title.toLowerCase() === title.toLowerCase());
  }, [campaign.nodes]);

  // Get all backlinks for a node (what links TO this node)
  const getBacklinks = useCallback((nodeId: string) => {
    const node = campaign.nodes.find(n => n.id === nodeId);
    if (!node) return [];
    return campaign.nodes.filter(n => {
      const links = parseWikilinks(n.content);
      return links.some(l => l.toLowerCase() === node.title.toLowerCase());
    });
  }, [campaign.nodes, parseWikilinks]);

  // Get forward links from a node (wikilinks in content)
  const getForwardLinks = useCallback((nodeId: string) => {
    const node = campaign.nodes.find(n => n.id === nodeId);
    if (!node) return [];
    const linkTitles = parseWikilinks(node.content);
    return linkTitles.map(t => findNodeByTitle(t)).filter(Boolean) as CampaignNode[];
  }, [campaign.nodes, parseWikilinks, findNodeByTitle]);

  // Build breadcrumb trail from root to selected node
  const computeBreadcrumbs = useCallback((targetId: string) => {
    const parents: Record<string, string> = {};
    campaign.links.forEach(l => { parents[l.target] = l.source; });
    const trail: string[] = [];
    let current = targetId;
    while (current) {
      trail.unshift(current);
      current = parents[current];
    }
    return trail;
  }, [campaign.links]);

  // Update breadcrumbs when selection changes
  useEffect(() => {
    if (selectedNode) {
      setBreadcrumbTrail(computeBreadcrumbs(selectedNode));
    } else {
      setBreadcrumbTrail([]);
    }
  }, [selectedNode, computeBreadcrumbs]);

  // Default to story view on small screens
  useEffect(() => {
    if (open && window.innerWidth < 640) {
      setViewMode('story');
    }
  }, [open]);

  const startTestRun = useCallback(async (startNodeId: string) => {
    if (!startNodeId) return;

    setTestRunMode(true);
    setTestCurrentNode(startNodeId);
    setTestHistory([startNodeId]);
    setTestStartNode(startNodeId);

    if (!sessionToken) return;

    try {
      const response = await fetch("/api/campaign-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          campaignId: campaign.id,
          currentNodeId: startNodeId,
          nodeHistory: [startNodeId],
          visitedNodes: [startNodeId],
          status: "active"
        })
      });

      if (response.ok) {
        const run = await response.json();
        if (run?.runId) {
          setTestRunId(run.runId);
        }
      }
    } catch (error) {
      console.error("Failed to create campaign run:", error);
    }
  }, [campaign.id, sessionToken]);

  const stopTestRun = useCallback(async (status: "paused" | "completed" | "abandoned" = "paused") => {
    if (testRunId) {
      try {
        await fetch(`/api/campaign-runs/${testRunId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        });
      } catch (error) {
        console.error("Failed to update campaign run status:", error);
      }
    }

    setTestRunMode(false);
    setTestCurrentNode(null);
    setTestHistory([]);
    setTestRunId(null);
    setTestStartNode(null);
  }, [testRunId]);

  useEffect(() => {
    if (!testRunId || !testRunMode || !testCurrentNode) return;

    const visitedNodes = Array.from(new Set(testHistory));

    const syncRun = async () => {
      try {
        await fetch(`/api/campaign-runs/${testRunId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentNodeId: testCurrentNode,
            nodeHistory: testHistory,
            visitedNodes
          })
        });
      } catch (error) {
        console.error("Failed to sync campaign run:", error);
      }
    };

    syncRun();
  }, [testRunId, testRunMode, testCurrentNode, testHistory]);

  // Auto-create links from wikilinks in content
  const syncWikilinks = useCallback((nodeId: string, content: string) => {
    const linkTitles = parseWikilinks(content);
    if (linkTitles.length === 0) return;

    let createdNodes = 0;
    let createdLinks = 0;

    setCampaign(prev => {
      const sourceNode = prev.nodes.find(n => n.id === nodeId);
      const newNodes: CampaignNode[] = [];
      const newLinks: CampaignLink[] = [];
      const createdTitleSet = new Set<string>();

      linkTitles.forEach((rawTitle, index) => {
        const title = rawTitle.trim();
        if (!title) return;
        const normalized = title.toLowerCase();

        const existing =
          prev.nodes.find(n => n.title.toLowerCase() === normalized) ||
          newNodes.find(n => n.title.toLowerCase() === normalized);

        let targetNode = existing;

        if (!targetNode && !createdTitleSet.has(normalized)) {
          const baseX = sourceNode ? sourceNode.x + 260 : 160;
          const baseY = sourceNode ? sourceNode.y + 40 + index * 140 : 160 + index * 140;
          const nodeType = NODE_TYPES.find(t => t.type === 'step');

          targetNode = {
            id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'step',
            title,
            content: '',
            x: baseX,
            y: baseY,
            width: 200,
            height: 100,
            color: nodeType?.color || 'amber',
            metadata: {
              toolsForStep: [],
              questions: [],
              successIndicators: [],
              redFlags: []
            }
          };

          newNodes.push(targetNode);
          createdTitleSet.add(normalized);
        }

        if (targetNode && targetNode.id !== nodeId) {
          const alreadyLinked =
            prev.links.some(l => l.source === nodeId && l.target === targetNode?.id) ||
            newLinks.some(l => l.source === nodeId && l.target === targetNode?.id);

          if (!alreadyLinked) {
            newLinks.push({
              id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              source: nodeId,
              target: targetNode.id,
              color: 'stone',
              label: 'wikilink',
              relation: 'next'
            });
          }
        }
      });

      createdNodes = newNodes.length;
      createdLinks = newLinks.length;

      if (newNodes.length === 0 && newLinks.length === 0) {
        return prev;
      }

      return {
        ...prev,
        nodes: [...prev.nodes, ...newNodes],
        links: [...prev.links, ...newLinks],
        rootNodes: prev.rootNodes.filter(id => !newNodes.some(n => n.id === id))
      };
    });

    if (createdNodes > 0) {
      toast({ title: "Wikilinks created", description: `Added ${createdNodes} node${createdNodes === 1 ? "" : "s"} from links.` });
    } else if (createdLinks > 0) {
      toast({ title: "Wikilinks synced", description: `Linked ${createdLinks} node${createdLinks === 1 ? "" : "s"}.` });
    }

    if (createdNodes > 0 || createdLinks > 0) {
      setIsUnsaved(true);
    }
  }, [parseWikilinks]);

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

  // Campaign Templates for Quick Start
  const CAMPAIGN_TEMPLATES = useMemo(() => [
    { id: 'recon', name: 'Reconnaissance', icon: '🔍', difficulty: 'beginner',
      description: 'Basic target enumeration flow',
      nodes: [
        { id: 'n1', type: 'step' as const, title: 'Define Target', content: 'Identify the target domain/IP', x: 100, y: 100, width: 200, height: 100, color: 'amber' },
        { id: 'n2', type: 'tool' as const, title: 'DNS Lookup', content: 'Query DNS records', x: 350, y: 100, width: 200, height: 100, color: 'teal' },
        { id: 'n3', type: 'tool' as const, title: 'WHOIS', content: 'Check domain registration', x: 350, y: 230, width: 200, height: 100, color: 'teal' },
        { id: 'n4', type: 'output' as const, title: 'Document Findings', content: 'Record discovered information', x: 600, y: 160, width: 200, height: 100, color: 'purple' }
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal' },
        { id: 'l4', source: 'n3', target: 'n4', color: 'teal' }
      ]
    },
    { id: 'vuln', name: 'Vulnerability Analysis', icon: '🛡️', difficulty: 'intermediate',
      description: 'Systematic vulnerability assessment',
      nodes: [
        { id: 'n1', type: 'step' as const, title: 'Scope Definition', content: 'Define what is in scope', x: 100, y: 150, width: 200, height: 100, color: 'amber' },
        { id: 'n2', type: 'decision' as const, title: 'Asset Type?', content: 'Web app, API, or infrastructure?', x: 350, y: 150, width: 200, height: 100, color: 'purple' },
        { id: 'n3', type: 'tool' as const, title: 'Scan Target', content: 'Run appropriate scanner', x: 600, y: 150, width: 200, height: 100, color: 'teal' },
        { id: 'n4', type: 'output' as const, title: 'Prioritize Findings', content: 'Rank by severity', x: 850, y: 150, width: 200, height: 100, color: 'purple' }
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber' },
        { id: 'l2', source: 'n2', target: 'n3', color: 'purple' },
        { id: 'l3', source: 'n3', target: 'n4', color: 'teal' }
      ]
    },
    { id: 'osint', name: 'OSINT Investigation', icon: '🕵️', difficulty: 'intermediate',
      description: 'Open source intelligence gathering',
      nodes: [
        { id: 'n1', type: 'step' as const, title: 'Subject Identification', content: 'Define what/who to investigate', x: 100, y: 100, width: 200, height: 100, color: 'amber' },
        { id: 'n2', type: 'tool' as const, title: 'Search Engines', content: 'Google dorking, Bing, etc.', x: 350, y: 50, width: 200, height: 100, color: 'teal' },
        { id: 'n3', type: 'tool' as const, title: 'Social Media', content: 'LinkedIn, Twitter, etc.', x: 350, y: 180, width: 200, height: 100, color: 'teal' },
        { id: 'n4', type: 'step' as const, title: 'Correlate Data', content: 'Cross-reference findings', x: 600, y: 115, width: 200, height: 100, color: 'amber' },
        { id: 'n5', type: 'output' as const, title: 'Build Profile', content: 'Create subject dossier', x: 850, y: 115, width: 200, height: 100, color: 'purple' }
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber' },
        { id: 'l2', source: 'n1', target: 'n3', color: 'amber' },
        { id: 'l3', source: 'n2', target: 'n4', color: 'teal' },
        { id: 'l4', source: 'n3', target: 'n4', color: 'teal' },
        { id: 'l5', source: 'n4', target: 'n5', color: 'amber' }
      ]
    },
    { id: 'story', name: 'Story Starter (Twine-Style)', icon: '🧭', difficulty: 'any',
      description: 'Narrative flow with hooks, choices, and a twist',
      nodes: [
        { id: 'n1', type: 'step' as const, title: 'Opening Hook', content: 'Set the scene and tone. What is strange, urgent, or tempting?', x: 100, y: 150, width: 220, height: 110, color: 'amber',
          metadata: { questions: ['What is the world like right now?', 'What is the promise to the player?'], successIndicators: ['Player is curious and wants to continue'] }
        },
        { id: 'n2', type: 'step' as const, title: 'Inciting Incident', content: 'The moment that breaks normal and forces action.', x: 380, y: 150, width: 220, height: 110, color: 'amber',
          metadata: { questions: ['What changes? Who is threatened?'], successIndicators: ['Player has a clear goal'] }
        },
        { id: 'n3', type: 'decision' as const, title: 'First Choice', content: 'Two believable paths forward. Let the player choose.', x: 660, y: 150, width: 220, height: 110, color: 'purple',
          metadata: { condition: 'Choice A = follow the lead. Choice B = take the risky detour.' }
        },
        { id: 'n4', type: 'step' as const, title: 'Branch A: Follow the Lead', content: 'Straightforward investigation. Reward with a hint.', x: 940, y: 60, width: 240, height: 110, color: 'amber',
          metadata: { questions: ['What evidence is found?'], successIndicators: ['Player learns something concrete'] }
        },
        { id: 'n5', type: 'step' as const, title: 'Branch B: Risky Detour', content: 'Higher risk, bigger reward. Show a cost.', x: 940, y: 240, width: 240, height: 110, color: 'amber',
          metadata: { questions: ['What is the setback or danger?'], successIndicators: ['Player feels the stakes'] }
        },
        { id: 'n6', type: 'output' as const, title: 'Reveal / Clue', content: 'Drop a clue that reframes the mystery.', x: 1240, y: 150, width: 220, height: 110, color: 'purple' },
        { id: 'n7', type: 'decision' as const, title: 'Twist Decision', content: 'A new complication appears. Choose the next move.', x: 1500, y: 150, width: 220, height: 110, color: 'purple',
          metadata: { condition: 'If clue points to insider, branch to social route. If external threat, branch to technical route.' }
        },
        { id: 'n8', type: 'output' as const, title: 'Resolution / Next Chapter', content: 'What changes now? Set up the next act.', x: 1760, y: 150, width: 240, height: 110, color: 'purple' }
      ],
      links: [
        { id: 'l1', source: 'n1', target: 'n2', color: 'amber' },
        { id: 'l2', source: 'n2', target: 'n3', color: 'amber' },
        { id: 'l3', source: 'n3', target: 'n4', color: 'purple', label: 'Follow lead' },
        { id: 'l4', source: 'n3', target: 'n5', color: 'purple', label: 'Risky detour' },
        { id: 'l5', source: 'n4', target: 'n6', color: 'amber' },
        { id: 'l6', source: 'n5', target: 'n6', color: 'amber' },
        { id: 'l7', source: 'n6', target: 'n7', color: 'teal' },
        { id: 'l8', source: 'n7', target: 'n8', color: 'teal' }
      ]
    },
    { id: 'blank', name: 'Blank Canvas', icon: '📝', difficulty: 'any', description: 'Start from scratch', nodes: [], links: [] }
  ], []);

  const createFromTemplate = useCallback((templateId: string) => {
    const template = CAMPAIGN_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    const newId = `campaign-${Date.now()}`;

    const withLearningDefaults = (node: CampaignNode) => {
      const meta = { ...(node.metadata || {}) };
      if (!meta.learningGoals || meta.learningGoals.length === 0) {
        meta.learningGoals = learningProfile.goals;
      }
      if (!meta.skillLevel) {
        meta.skillLevel = learningProfile.skillLevel;
      }
      if (!meta.teachingNotes) {
        meta.teachingNotes = `Style: ${learningProfile.style} • Pace: ${learningProfile.preferredPace}`;
      }
      return { ...node, metadata: meta };
    };

    setCampaign({
      id: newId,
      name: `${template.name} Campaign`,
      description: template.description,
      nodes: template.nodes.map(n => withLearningDefaults({ ...n, id: `${newId}-${n.id}` })),
      links: template.links.map(l => ({ 
        ...l, 
        id: `${newId}-${l.id}`,
        source: `${newId}-${l.source}`,
        target: `${newId}-${l.target}`
      })),
      rootNodes: template.nodes.length > 0 ? [`${newId}-n1`] : []
    });
    setSelectedNode(null);
    setIsUnsaved(true);
    toast({ title: 'Template Applied', description: `Created from "${template.name}" template` });
  }, [CAMPAIGN_TEMPLATES, learningProfile]);

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
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  // Pinch-to-zoom gesture handler
  const handleTouchStartZoom = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      lastTouchDistance.current = distance;
      lastTouchCenter.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    }
  }, []);

  const handleTouchMoveZoom = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const scale = distance / lastTouchDistance.current;
      
      setZoom(prevZoom => {
        const newZoom = prevZoom * scale;
        return Math.min(2, Math.max(0.25, newZoom));
      });
      
      lastTouchDistance.current = distance;
    }
  }, []);

  const handleTouchEndZoom = useCallback(() => {
    lastTouchDistance.current = null;
    lastTouchCenter.current = null;
  }, []);

  // Keyboard navigation for node ordering
  const handleKeyboardNavigation = useCallback((e: React.KeyboardEvent) => {
    if (!selectedNode || editingNode || inlineEditNode) return;
    
    const nodeIndex = campaign.nodes.findIndex(n => n.id === selectedNode);
    if (nodeIndex === -1) return;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        // Move selection up
        if (nodeIndex > 0) {
          setSelectedNode(campaign.nodes[nodeIndex - 1].id);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        // Move selection down
        if (nodeIndex < campaign.nodes.length - 1) {
          setSelectedNode(campaign.nodes[nodeIndex + 1].id);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        // Outdent - remove from parent, make sibling
        outdentNode(selectedNode);
        break;
      case 'ArrowRight':
        e.preventDefault();
        // Indent - make child of previous sibling
        indentNode(selectedNode);
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          outdentNode(selectedNode);
        } else {
          indentNode(selectedNode);
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (!inlineEditNode && !editingNode) {
          e.preventDefault();
          deleteNode(selectedNode);
        }
        break;
    }
  }, [selectedNode, campaign.nodes, editingNode, inlineEditNode]);

  // Indent node - make it a child of the previous sibling
  const indentNode = useCallback((nodeId: string) => {
    const nodeIndex = campaign.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex <= 0) return; // Can't indent first node
    
    const prevNode = campaign.nodes[nodeIndex - 1];
    
    // Add link from previous node to this one
    const existingLink = campaign.links.find(l => l.source === prevNode.id && l.target === nodeId);
    if (!existingLink) {
      const newLink: CampaignLink = {
        id: `link-${Date.now()}`,
        source: prevNode.id,
        target: nodeId,
        color: 'teal',
        relation: 'child'
      };
      setCampaign(prev => ({
        ...prev,
        links: [...prev.links, newLink],
        rootNodes: prev.rootNodes.filter(id => id !== nodeId) // Remove from roots if present
      }));
      setIsUnsaved(true);
      toast({ title: 'Node Indented', description: `Now child of "${prevNode.title}"` });
    }
  }, [campaign]);

  // Outdent node - remove parent relationship
  const outdentNode = useCallback((nodeId: string) => {
    // Find incoming links (where this node is target)
    const parentLinks = campaign.links.filter(l => l.target === nodeId);
    if (parentLinks.length === 0) return; // Already at root level
    
    // Remove the parent link
    setCampaign(prev => ({
      ...prev,
      links: prev.links.filter(l => l.target !== nodeId),
      rootNodes: prev.rootNodes.includes(nodeId) ? prev.rootNodes : [...prev.rootNodes, nodeId]
    }));
    setIsUnsaved(true);
    toast({ title: 'Node Outdented', description: 'Moved to root level' });
  }, [campaign]);

  // Move node up in order
  const moveNodeUp = useCallback((nodeId: string) => {
    const nodeIndex = campaign.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex <= 0) return;
    
    const newNodes = [...campaign.nodes];
    [newNodes[nodeIndex - 1], newNodes[nodeIndex]] = [newNodes[nodeIndex], newNodes[nodeIndex - 1]];
    setCampaign(prev => ({ ...prev, nodes: newNodes }));
    setIsUnsaved(true);
  }, [campaign.nodes]);

  // Move node down in order
  const moveNodeDown = useCallback((nodeId: string) => {
    const nodeIndex = campaign.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex >= campaign.nodes.length - 1) return;
    
    const newNodes = [...campaign.nodes];
    [newNodes[nodeIndex], newNodes[nodeIndex + 1]] = [newNodes[nodeIndex + 1], newNodes[nodeIndex]];
    setCampaign(prev => ({ ...prev, nodes: newNodes }));
    setIsUnsaved(true);
  }, [campaign.nodes]);

  // Get node hierarchy depth (for indentation display)
  const getNodeDepth = useCallback((nodeId: string, visited = new Set<string>()): number => {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);
    
    const parentLink = campaign.links.find(l => l.target === nodeId);
    if (!parentLink) return 0;
    return 1 + getNodeDepth(parentLink.source, visited);
  }, [campaign.links]);

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
    const baseMetadata = type === 'step' ? {
      toolsForStep: [],
      questions: [],
      successIndicators: [],
      redFlags: [],
      learningGoals: learningProfile.goals,
      skillLevel: learningProfile.skillLevel,
      teachingNotes: `Style: ${learningProfile.style} • Pace: ${learningProfile.preferredPace}`
    } : undefined;
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
      metadata: baseMetadata
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
  }, [learningProfile]);

  const addStoryNodeAfter = useCallback((nodeId: string) => {
    const nodeType = NODE_TYPES.find(t => t.type === 'step');
    const newNode: CampaignNode = {
      id: `node-${Date.now()}`,
      type: 'step',
      title: 'New Story Step',
      content: '',
      x: 120 + Math.random() * 180,
      y: 120 + Math.random() * 180,
      width: 220,
      height: 110,
      color: nodeType?.color || 'amber',
      metadata: {
        toolsForStep: [],
        questions: [],
        successIndicators: [],
        redFlags: [],
        learningGoals: learningProfile.goals,
        skillLevel: learningProfile.skillLevel,
        teachingNotes: `Style: ${learningProfile.style} • Pace: ${learningProfile.preferredPace}`
      }
    };

    setCampaign(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      links: [
        ...prev.links,
        {
          id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          source: nodeId,
          target: newNode.id,
          color: 'amber',
          relation: 'next'
        }
      ]
    }));
    setEditingNode(newNode);
    setSelectedNode(newNode.id);
    setIsUnsaved(true);
    toast({ title: 'Story step added', description: 'Linked to previous step.' });
  }, [learningProfile]);

  const addClueToNode = useCallback((nodeId: string, clueId: string) => {
    if (!clueId) return;
    setCampaign(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => {
        if (n.id !== nodeId) return n;
        const current = n.metadata?.linkedClues || [];
        if (current.includes(clueId)) return n;
        return {
          ...n,
          metadata: { ...n.metadata, linkedClues: [...current, clueId] }
        };
      })
    }));
    setIsUnsaved(true);
  }, []);

  const removeClueFromNode = useCallback((nodeId: string, clueId: string) => {
    setCampaign(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => {
        if (n.id !== nodeId) return n;
        const current = n.metadata?.linkedClues || [];
        return {
          ...n,
          metadata: { ...n.metadata, linkedClues: current.filter(c => c !== clueId) }
        };
      })
    }));
    setIsUnsaved(true);
  }, []);

  const storyOrder = useMemo(() => {
    if (campaign.nodes.length === 0) return [];

    const order: CampaignNode[] = [];
    const visited = new Set<string>();
    const linksBySource = new Map<string, string[]>();
    const incoming = new Set<string>();

    campaign.links.forEach(link => {
      incoming.add(link.target);
      if (!linksBySource.has(link.source)) {
        linksBySource.set(link.source, []);
      }
      linksBySource.get(link.source)!.push(link.target);
    });

    const roots =
      campaign.rootNodes.length > 0
        ? campaign.rootNodes
        : campaign.nodes.filter(n => !incoming.has(n.id)).map(n => n.id);

    const walk = (rootId: string) => {
      const queue = [rootId];
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        const node = campaign.nodes.find(n => n.id === currentId);
        if (node) order.push(node);
        const children = linksBySource.get(currentId) || [];
        children.forEach(childId => {
          if (!visited.has(childId)) queue.push(childId);
        });
      }
    };

    roots.forEach(walk);
    campaign.nodes.forEach(node => {
      if (!visited.has(node.id)) order.push(node);
    });

    return order;
  }, [campaign.nodes, campaign.links, campaign.rootNodes]);

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
                    if (!testRunMode) {
                      const startNode =
                        selectedNode ||
                        testStartNode ||
                        campaign.rootNodes[0] ||
                        campaign.nodes[0]?.id;

                      if (!startNode) {
                        toast({ title: "No nodes to test", description: "Add a node before starting test mode." });
                        return;
                      }

                      startTestRun(startNode);
                    } else {
                      stopTestRun();
                    }
                  }}
                  className={`min-h-[44px] min-w-[44px] px-3 ${testRunMode ? 'bg-teal-700 text-white' : 'border-teal-800 text-teal-400'}`}
                  disabled={campaign.nodes.length === 0}
                  data-testid="test-run-btn"
                >
                  {testRunMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="ml-1 hidden sm:inline">{testRunMode ? 'Stop' : 'Test'}</span>
                </Button>
                <div className="border-l border-stone-700 h-6 mx-1" />
                {/* View Mode Selector */}
                {(['story', 'canvas', 'clues', 'overview'] as const).map(v => (
                  <Button
                    key={v}
                    size="sm"
                    variant={viewMode === v ? 'default' : 'ghost'}
                    onClick={() => setViewMode(v)}
                    className={`min-h-[44px] px-2 capitalize ${viewMode === v ? 'bg-cyan-800 text-white' : 'text-stone-500'}`}
                  >
                    {v === 'story' ? <FileText className="w-4 h-4" /> : v === 'canvas' ? <Layers className="w-4 h-4" /> : v === 'clues' ? <Key className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="ml-1 hidden sm:inline text-xs">{v}</span>
                  </Button>
                ))}
              </div>
              {/* Breadcrumb Trail */}
              {breadcrumbTrail.length > 0 && viewMode === 'canvas' && (
                <div className="flex items-center gap-1 text-xs mt-2 flex-wrap">
                  <span className="text-stone-600">Path:</span>
                  {breadcrumbTrail.map((nodeId, i) => {
                    const node = campaign.nodes.find(n => n.id === nodeId);
                    return (
                      <span key={nodeId} className="flex items-center">
                        {i > 0 && <ChevronRight className="w-3 h-3 text-stone-600 mx-0.5" />}
                        <button
                          onClick={() => setSelectedNode(nodeId)}
                          className={`px-1.5 py-0.5 rounded ${nodeId === selectedNode ? 'bg-amber-900/50 text-amber-400' : 'bg-stone-800/50 text-stone-400 hover:bg-stone-700'}`}
                        >
                          {node?.title || nodeId.slice(0, 8)}
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">
            {/* Mobile File Tree Toggle */}
            <button
              onClick={() => setShowFileTree(!showFileTree)}
              className="sm:hidden flex items-center justify-between w-full p-3 bg-stone-950/80 border-b border-amber-900/30 text-amber-500"
              data-testid="mobile-file-tree-toggle"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <FolderTree className="w-4 h-4" />
                {campaign.name || 'Select Campaign'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFileTree ? 'rotate-180' : ''}`} />
            </button>

            {/* Campaign File Tree Sidebar - Collapsible on mobile */}
            <div className={`border-b sm:border-b-0 sm:border-r border-amber-900/30 p-2 sm:p-3 shrink-0 sm:w-[200px] bg-stone-950/50 transition-all ${showFileTree ? 'max-h-[200px] sm:max-h-none' : 'max-h-0 sm:max-h-none overflow-hidden sm:overflow-visible'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-amber-500 uppercase tracking-wider font-bold flex items-center gap-1">
                    <FolderTree className="w-3 h-3" /> Campaigns
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="p-0 h-8 w-8 text-amber-400 hover:text-amber-300 touch-manipulation" data-testid="new-campaign-btn">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-stone-900 border-amber-900/50">
                      <DropdownMenuLabel className="text-amber-500 text-xs">Quick Start</DropdownMenuLabel>
                      {CAMPAIGN_TEMPLATES.map(t => (
                        <DropdownMenuItem key={t.id} onClick={() => createFromTemplate(t.id)} className="text-stone-300 hover:bg-amber-900/30 min-h-[44px] touch-manipulation" data-testid={`template-${t.id}`}>
                          <span className="mr-2">{t.icon}</span> {t.name}
                          <Badge variant="outline" className="ml-auto text-[9px] border-stone-700 text-stone-500">{t.difficulty}</Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              {/* Clues View - All clues with campaign connections */}
              {viewMode === 'story' ? (
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-amber-500 font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Story Flow
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNode('step')}
                        className="border-amber-700 text-amber-400"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Step
                      </Button>
                    </div>

                    {storyOrder.length === 0 ? (
                      <Card className="bg-stone-900/30 border-stone-800">
                        <CardContent className="p-6 text-center text-stone-500 text-sm">
                          Start your story with the first step.
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {storyOrder.map((node, index) => {
                          const nextLinks = campaign.links.filter(l => l.source === node.id);
                          const nextNodes = nextLinks.map(l => campaign.nodes.find(n => n.id === l.target)).filter(Boolean) as CampaignNode[];
                          const prevNodes = campaign.links
                            .filter(l => l.target === node.id)
                            .map(l => campaign.nodes.find(n => n.id === l.source))
                            .filter(Boolean) as CampaignNode[];
                          const linkedClues = node.metadata?.linkedClues || [];
                          const clueDatalistId = `clue-options-${node.id}`;

                          return (
                            <Card key={node.id} className="bg-stone-900/30 border-stone-800">
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-400">
                                        Step {index + 1}
                                      </Badge>
                                      <Badge className={
                                        node.color === 'amber' ? 'bg-amber-700 text-white' :
                                        node.color === 'purple' ? 'bg-purple-700 text-white' :
                                        node.color === 'teal' ? 'bg-teal-700 text-white' :
                                        'bg-stone-700 text-white'
                                      }>
                                        {node.type}
                                      </Badge>
                                    </div>
                                    <button
                                      onClick={() => setEditingNode(node)}
                                      className="text-amber-400 text-sm font-bold hover:text-amber-300 text-left"
                                    >
                                      {node.title}
                                    </button>
                                    <p className="text-stone-500 text-xs line-clamp-3">{node.content || 'No content yet.'}</p>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingNode(node)}
                                      className="border-amber-700 text-amber-400"
                                    >
                                      <Edit3 className="w-3 h-3 mr-1" /> Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => addStoryNodeAfter(node.id)}
                                      className="text-teal-400"
                                    >
                                      <Plus className="w-3 h-3 mr-1" /> {node.type === 'decision' ? 'Add Branch' : 'Add Next'}
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3 text-xs">
                                <div className="flex flex-wrap gap-2">
                                  {prevNodes.length > 0 && (
                                    <div className="text-stone-500">
                                      From: {prevNodes.map(n => n.title).join(', ')}
                                    </div>
                                  )}
                                  {nextNodes.length > 0 && (
                                    <div className="text-stone-500">
                                      Next: {nextNodes.map(n => n.title).join(', ')}
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <Label className="text-[10px] text-stone-500 uppercase">Linked Clues</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {linkedClues.length === 0 && (
                                      <span className="text-[10px] text-stone-600">No clues linked</span>
                                    )}
                                    {linkedClues.map(clueId => (
                                      <Badge
                                        key={clueId}
                                        variant="outline"
                                        className="text-[9px] border-purple-700 text-purple-400 cursor-pointer hover:bg-red-900/30"
                                        onClick={() => removeClueFromNode(node.id, clueId)}
                                      >
                                        🔗 {clueId} ×
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="mt-2">
                                    <Input
                                      list={clueDatalistId}
                                      placeholder="Link clue by ID..."
                                      className="bg-black/50 border-stone-700 text-xs min-h-[36px]"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const val = (e.target as HTMLInputElement).value.trim();
                                          if (val) {
                                            addClueToNode(node.id, val);
                                            (e.target as HTMLInputElement).value = '';
                                          }
                                        }
                                      }}
                                    />
                                    <datalist id={clueDatalistId}>
                                      {sharedClues.map(clue => (
                                        <option key={clue.id} value={clue.id}>{clue.name}</option>
                                      ))}
                                    </datalist>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : viewMode === 'clues' ? (
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-amber-500 font-bold flex items-center gap-2">
                        <Key className="w-4 h-4" /> All Clues & Campaign Links
                      </h3>
                      <Badge variant="outline" className="border-amber-700 text-amber-400">
                        {sharedClues.length} clues
                      </Badge>
                    </div>
                    {sharedClues.length === 0 ? (
                      <p className="text-stone-500 text-center py-8">No clues defined yet. Add clues in Admin → Clues tab.</p>
                    ) : (
                      <div className="grid gap-2">
                        {sharedClues.map(clue => {
                          const linkedNodes = campaign.nodes.filter(n => n.metadata?.linkedClues?.includes(clue.id));
                          return (
                            <Card key={clue.id} className="bg-stone-900/30 border-stone-800">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-amber-400 font-medium text-sm">{clue.name}</p>
                                    <p className="text-stone-500 text-xs">{clue.description}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {clue.tags?.map(t => <Badge key={t} variant="outline" className="text-[8px] border-stone-700 text-stone-500">{t}</Badge>)}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-[10px] text-stone-600">Used in {linkedNodes.length} nodes</p>
                                    {linkedNodes.slice(0, 3).map(n => (
                                      <button key={n.id} onClick={() => { setViewMode('canvas'); setSelectedNode(n.id); }} className="text-[9px] text-teal-400 hover:underline block">
                                        → {n.title}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                    {/* Nodes with Clues */}
                    <div className="mt-6">
                      <h4 className="text-teal-400 text-sm font-bold mb-2">Nodes with Linked Clues</h4>
                      <div className="space-y-1">
                        {campaign.nodes.filter(n => n.metadata?.linkedClues?.length).map(node => (
                          <div key={node.id} className="flex items-center justify-between p-2 bg-stone-900/30 rounded border border-stone-800">
                            <button onClick={() => { setViewMode('canvas'); setSelectedNode(node.id); }} className="text-sm text-stone-300 hover:text-amber-400">
                              {node.title}
                            </button>
                            <div className="flex gap-1">
                              {node.metadata?.linkedClues?.map(c => (
                                <Badge key={c} variant="outline" className="text-[8px] border-purple-700 text-purple-400">🔗 {c}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                        {campaign.nodes.filter(n => n.metadata?.linkedClues?.length).length === 0 && (
                          <p className="text-stone-600 text-xs">No nodes have linked clues yet. Edit a node and add clue IDs.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              ) : viewMode === 'overview' ? (
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    <h3 className="text-cyan-400 font-bold flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Campaign Overview
                    </h3>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Card className="bg-amber-950/20 border-amber-900/30"><CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-amber-400">{campaign.nodes.length}</p>
                        <p className="text-[10px] text-stone-500">Nodes</p>
                      </CardContent></Card>
                      <Card className="bg-teal-950/20 border-teal-900/30"><CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-teal-400">{campaign.links.length}</p>
                        <p className="text-[10px] text-stone-500">Links</p>
                      </CardContent></Card>
                      <Card className="bg-purple-950/20 border-purple-900/30"><CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-purple-400">{campaign.nodes.filter(n => n.type === 'decision').length}</p>
                        <p className="text-[10px] text-stone-500">Decisions</p>
                      </CardContent></Card>
                      <Card className="bg-stone-800/30 border-stone-700"><CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-stone-400">{savedCampaigns.length}</p>
                        <p className="text-[10px] text-stone-500">Campaigns</p>
                      </CardContent></Card>
                    </div>
                    {/* Feature/Skill breakdown */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card className="bg-stone-900/30 border-stone-800">
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">Features Used</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-1">
                          {[...new Set(campaign.nodes.map(n => n.metadata?.featureType).filter(Boolean))].map(f => (
                            <Badge key={f} variant="outline" className="border-amber-700 text-amber-400 capitalize">{f}</Badge>
                          ))}
                          {campaign.nodes.every(n => !n.metadata?.featureType) && <span className="text-stone-600 text-xs">None set</span>}
                        </CardContent>
                      </Card>
                      <Card className="bg-stone-900/30 border-stone-800">
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-teal-400">Skills Covered</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-1">
                          {[...new Set(campaign.nodes.flatMap(n => n.metadata?.skills || []))].slice(0, 10).map(s => (
                            <Badge key={s} variant="outline" className="border-teal-700 text-teal-400 text-[9px]">{s}</Badge>
                          ))}
                          {campaign.nodes.every(n => !n.metadata?.skills?.length) && <span className="text-stone-600 text-xs">None set</span>}
                        </CardContent>
                      </Card>
                    </div>
                    {/* All Campaigns List */}
                    <Card className="bg-stone-900/30 border-stone-800">
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-purple-400">All Campaigns</CardTitle></CardHeader>
                      <CardContent className="space-y-1">
                        {savedCampaigns.map(c => (
                          <div key={c.id} className="flex items-center justify-between p-2 bg-stone-900/50 rounded">
                            <button onClick={() => loadCampaign(c.id)} className={`text-sm ${c.id === campaign.id ? 'text-amber-400' : 'text-stone-400 hover:text-stone-300'}`}>
                              {c.name}
                            </button>
                            <span className="text-[10px] text-stone-600">{c.nodes.length} nodes</span>
                          </div>
                        ))}
                        {savedCampaigns.length === 0 && <p className="text-stone-600 text-xs">No saved campaigns yet</p>}
                      </CardContent>
                    </Card>
                    {/* Decision Tree Summary */}
                    <Card className="bg-stone-900/30 border-stone-800">
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-cyan-400">Decision Tree Paths</CardTitle></CardHeader>
                      <CardContent className="space-y-1 max-h-[200px] overflow-y-auto">
                        {campaign.nodes.filter(n => n.type === 'decision').map(node => {
                          const children = campaign.links.filter(l => l.source === node.id);
                          return (
                            <div key={node.id} className="text-xs p-2 bg-purple-950/20 rounded border border-purple-900/30">
                              <p className="text-purple-400 font-medium">{node.title}</p>
                              <p className="text-stone-600 text-[10px]">{node.metadata?.condition || node.content}</p>
                              <div className="mt-1 flex gap-1 flex-wrap">
                                {children.map(l => {
                                  const target = campaign.nodes.find(n => n.id === l.target);
                                  return target ? (
                                    <button key={l.id} onClick={() => { setViewMode('canvas'); setSelectedNode(target.id); }} className="text-[9px] px-1.5 py-0.5 bg-teal-900/30 text-teal-400 rounded hover:bg-teal-800/50">
                                      → {target.title} {l.label ? `(${l.label})` : ''}
                                    </button>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {campaign.nodes.filter(n => n.type === 'decision').length === 0 && <p className="text-stone-600 text-xs">No decision nodes yet</p>}
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              ) : mode === 'tree' ? (
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
                  tabIndex={0}
                  className="absolute inset-0 overflow-auto bg-[#050200] outline-none"
                  style={{ 
                    touchAction: draggedNode ? 'none' : 'manipulation',
                    backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`
                  }}
                  onMouseMove={(e) => {
                    handleCanvasMouseMove(e);
                    if (linkingFrom && canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      setLinkMousePos({
                        x: (e.clientX - rect.left + canvasRef.current.scrollLeft) / zoom,
                        y: (e.clientY - rect.top + canvasRef.current.scrollTop) / zoom
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
                  onWheel={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      e.preventDefault();
                      const delta = e.deltaY > 0 ? -0.1 : 0.1;
                      setZoom(z => Math.min(2, Math.max(0.25, z + delta)));
                    }
                  }}
                  onTouchStart={handleTouchStartZoom}
                  onTouchMove={(e) => {
                    handleTouchMoveZoom(e);
                    if (e.touches.length === 1) handleCanvasMouseMove(e);
                  }}
                  onTouchEnd={(e) => {
                    handleTouchEndZoom();
                    handleCanvasMouseUp();
                  }}
                  onTouchCancel={(e) => {
                    handleTouchEndZoom();
                    handleCanvasMouseUp();
                  }}
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
                  onKeyDown={handleKeyboardNavigation}
                >
                  {/* Zoom Controls - Fixed Position */}
                  <div className="fixed bottom-20 right-4 sm:absolute sm:bottom-4 sm:right-4 z-50 flex flex-col gap-2 bg-stone-900/90 backdrop-blur rounded-lg p-2 border border-stone-700">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                      className="min-h-[44px] min-w-[44px] text-stone-400 hover:text-amber-400"
                      data-testid="zoom-in-btn"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </Button>
                    <span className="text-center text-xs text-stone-500 font-mono">{Math.round(zoom * 100)}%</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
                      className="min-h-[44px] min-w-[44px] text-stone-400 hover:text-amber-400"
                      data-testid="zoom-out-btn"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </Button>
                    <div className="border-t border-stone-700 pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setZoom(1)}
                        className="min-h-[44px] min-w-[44px] text-stone-400 hover:text-teal-400 text-xs"
                        data-testid="zoom-reset-btn"
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="border-t border-stone-700 pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={autoOrganize}
                        className="min-h-[44px] min-w-[44px] text-stone-400 hover:text-purple-400"
                        title="Auto-organize nodes"
                        data-testid="auto-organize-btn"
                      >
                        <Wand2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Node Ordering Controls - Shows when node selected */}
                  {selectedNode && !editingNode && (
                    <div className="fixed bottom-20 left-4 sm:absolute sm:bottom-4 sm:left-4 z-50 bg-stone-900/90 backdrop-blur rounded-lg p-2 border border-amber-700/50">
                      <p className="text-[10px] text-amber-500 uppercase mb-2 text-center font-bold">Order</p>
                      <div className="grid grid-cols-3 gap-1">
                        {/* Top row - Move Up */}
                        <div />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveNodeUp(selectedNode)}
                          className="min-h-[44px] min-w-[44px] text-stone-400 hover:text-amber-400"
                          title="Move node up (↑)"
                          data-testid="move-up-btn"
                        >
                          <ArrowUp className="w-5 h-5" />
                        </Button>
                        <div />
                        
                        {/* Middle row - Outdent, label, Indent */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => outdentNode(selectedNode)}
                          className="min-h-[44px] min-w-[44px] text-stone-400 hover:text-purple-400"
                          title="Outdent (←)"
                          data-testid="outdent-btn"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center justify-center text-[10px] text-stone-500">
                          {getNodeDepth(selectedNode) > 0 && (
                            <span className="bg-purple-900/50 px-1.5 py-0.5 rounded text-purple-400">
                              L{getNodeDepth(selectedNode)}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => indentNode(selectedNode)}
                          className="min-h-[44px] min-w-[44px] text-stone-400 hover:text-teal-400"
                          title="Indent (→)"
                          data-testid="indent-btn"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                        
                        {/* Bottom row - Move Down */}
                        <div />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveNodeDown(selectedNode)}
                          className="min-h-[44px] min-w-[44px] text-stone-400 hover:text-amber-400"
                          title="Move node down (↓)"
                          data-testid="move-down-btn"
                        >
                          <ArrowDown className="w-5 h-5" />
                        </Button>
                        <div />
                      </div>
                    </div>
                  )}

                  {/* Linking mode indicator */}
                  {linkingFrom && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-teal-900/90 text-teal-300 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                      <Link2 className="w-4 h-4" />
                      Click target node or canvas to cancel
                    </div>
                  )}
                  
                  {/* Zoomable Canvas Content */}
                  <div 
                    style={{ 
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left',
                      minWidth: 4000, 
                      minHeight: 3000 
                    }}
                  >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 4000, minHeight: 3000 }}>
                      {renderLinks()}
                      {renderLinkPreview()}
                    </svg>
                    {campaign.nodes.map(renderGraphNode)}
                  </div>
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
                        const startNode =
                          testStartNode ||
                          campaign.rootNodes[0] ||
                          campaign.nodes[0]?.id;

                        if (startNode) {
                          setTestCurrentNode(startNode);
                          setTestHistory([startNode]);
                          setTestStartNode(startNode);
                        }
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-stone-500">Start from</span>
                        <Select
                          value={testStartNode || currentNode.id}
                          onValueChange={(nodeId) => {
                            setTestStartNode(nodeId);
                            setTestCurrentNode(nodeId);
                            setTestHistory([nodeId]);
                          }}
                        >
                          <SelectTrigger className="bg-black/50 border-teal-700 text-stone-300 min-h-[36px] w-[220px]">
                            <SelectValue placeholder="Select start node..." />
                          </SelectTrigger>
                          <SelectContent className="bg-stone-900 border-teal-700">
                            {campaign.nodes.map(node => (
                              <SelectItem key={node.id} value={node.id} className="text-stone-300">
                                {node.title || node.id.slice(0, 8)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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

                      <div className="pt-2 border-t border-teal-900">
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span>Step {testHistory.length}</span>
                          <span>•</span>
                          <span>History</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {testHistory.map((id, index) => {
                            const title = campaign.nodes.find(n => n.id === id)?.title || 'Unknown';
                            return (
                              <button
                                key={`${id}-${index}`}
                                onClick={() => {
                                  const newHistory = testHistory.slice(0, index + 1);
                                  setTestHistory(newHistory);
                                  setTestCurrentNode(id);
                                }}
                                className={`text-[10px] px-2 py-1 rounded border ${
                                  index === testHistory.length - 1
                                    ? 'border-teal-600 text-teal-300 bg-teal-900/30'
                                    : 'border-stone-700 text-stone-400 hover:text-stone-200'
                                }`}
                                data-testid={`test-history-${index}`}
                              >
                                {index + 1}. {title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {editingNode && !testRunMode && (
              <div className="fixed inset-x-0 bottom-0 max-h-[70vh] sm:relative sm:inset-auto sm:max-h-none z-50 sm:z-0 bg-[#0a0500] sm:bg-transparent sm:w-72 sm:border-l border-amber-900/30 border-t sm:border-t-0 rounded-t-2xl sm:rounded-none p-4 overflow-y-auto shadow-2xl sm:shadow-none">
                {/* Mobile drag handle */}
                <div className="sm:hidden w-12 h-1 bg-stone-600 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0a0500] py-2 z-10">
                  <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Edit Node
                  </h3>
                  <Button size="sm" variant="ghost" onClick={() => setEditingNode(null)} className="min-h-[44px] min-w-[44px]">
                    <span className="text-stone-500 text-xl">×</span>
                  </Button>
                </div>

                <div className="space-y-6 pb-20 sm:pb-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startTestRun(editingNode.id)}
                    className="w-full border-teal-800 text-teal-300 hover:bg-teal-900/30 min-h-[44px]"
                    data-testid="test-from-node-btn"
                  >
                    <Play className="w-4 h-4 mr-2" /> Playtest from this node
                  </Button>
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
                    <label className="text-[10px] text-stone-500 uppercase">Content <span className="text-stone-600">(use [[Node Title]] for wikilinks)</span></label>
                    <Textarea
                      value={editingNode.content}
                      onChange={(e) => {
                        const newContent = e.target.value;
                        setEditingNode(prev => prev ? { ...prev, content: newContent } : null);
                        updateNode(editingNode.id, { content: newContent });
                      }}
                      onBlur={(e) => {
                        syncWikilinks(editingNode.id, e.target.value);
                      }}
                      className="bg-black/50 border-stone-700 text-base min-h-[120px] font-mono"
                      placeholder="Describe this step... Use [[Other Node]] to link"
                    />
                    {/* Wikilinks detected */}
                    {parseWikilinks(editingNode.content).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="text-[9px] text-stone-600">Links:</span>
                        {parseWikilinks(editingNode.content).map((link, i) => {
                          const target = findNodeByTitle(link);
                          return (
                            <Badge key={i} variant="outline" className={`text-[9px] ${target ? 'border-teal-700 text-teal-400' : 'border-red-700 text-red-400'}`}>
                              {target ? <Link className="w-2 h-2 mr-1" /> : '⚠'} {link}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Backlinks Panel - Obsidian-style */}
                  {(() => {
                    const backlinks = getBacklinks(editingNode.id);
                    const forwardLinks = getForwardLinks(editingNode.id);
                    if (backlinks.length === 0 && forwardLinks.length === 0) return null;
                    return (
                      <div className="bg-stone-900/50 rounded p-2 border border-stone-800">
                        <p className="text-[10px] text-stone-500 uppercase mb-1">Links Graph</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-purple-400 text-[9px] mb-1">← Backlinks ({backlinks.length})</p>
                            {backlinks.slice(0, 5).map(n => (
                              <button key={n.id} onClick={() => setEditingNode(n)} className="block text-stone-400 hover:text-purple-400 text-[10px] truncate w-full text-left">
                                {n.title}
                              </button>
                            ))}
                          </div>
                          <div>
                            <p className="text-teal-400 text-[9px] mb-1">→ Forward ({forwardLinks.length})</p>
                            {forwardLinks.slice(0, 5).map(n => (
                              <button key={n.id} onClick={() => setEditingNode(n)} className="block text-stone-400 hover:text-teal-400 text-[10px] truncate w-full text-left">
                                {n.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

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

                  {/* Feature & Campaign Type Selection */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-500 uppercase">Feature</label>
                      <Select
                        value={editingNode.metadata?.featureType || ''}
                        onValueChange={(featureType) => {
                          const newMeta = { ...editingNode.metadata, featureType };
                          setEditingNode(prev => prev ? { ...prev, metadata: newMeta } : null);
                          updateNode(editingNode.id, { metadata: newMeta });
                        }}
                      >
                        <SelectTrigger className="bg-black/50 border-stone-700 text-stone-300 min-h-[44px]">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-900 border-stone-700">
                          {FEATURE_TYPES.map(f => (
                            <SelectItem key={f} value={f} className="text-stone-300 capitalize">{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 uppercase">Campaign Type</label>
                      <Select
                        value={editingNode.metadata?.campaignType || ''}
                        onValueChange={(campaignType) => {
                          const newMeta = { ...editingNode.metadata, campaignType };
                          setEditingNode(prev => prev ? { ...prev, metadata: newMeta } : null);
                          updateNode(editingNode.id, { metadata: newMeta });
                        }}
                      >
                        <SelectTrigger className="bg-black/50 border-stone-700 text-stone-300 min-h-[44px]">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-900 border-stone-700">
                          {CAMPAIGN_TYPES.map(c => (
                            <SelectItem key={c} value={c} className="text-stone-300 capitalize">{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Skills Selection */}
                  <div>
                    <label className="text-[10px] text-stone-500 uppercase">Skills Required</label>
                    <div className="grid grid-cols-2 gap-1 mt-1 max-h-[120px] overflow-y-auto">
                      {Object.entries(SKILL_CATEGORIES).map(([cat, subskills]) => (
                        <div key={cat} className="space-y-0.5">
                          <p className="text-[9px] text-amber-600 uppercase">{cat}</p>
                          {subskills.map(skill => {
                            const skillId = `${cat}:${skill}`;
                            const isSelected = editingNode.metadata?.skills?.includes(skillId);
                            return (
                              <button
                                key={skill}
                                onClick={() => {
                                  const current = editingNode.metadata?.skills || [];
                                  const newSkills = isSelected ? current.filter(s => s !== skillId) : [...current, skillId];
                                  const newMeta = { ...editingNode.metadata, skills: newSkills };
                                  setEditingNode(prev => prev ? { ...prev, metadata: newMeta } : null);
                                  updateNode(editingNode.id, { metadata: newMeta });
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded block w-full text-left touch-manipulation ${
                                  isSelected ? 'bg-teal-900/50 text-teal-300' : 'bg-stone-800/50 text-stone-500 hover:bg-stone-800'
                                }`}
                              >
                                {skill}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Linked Clues */}
                  <div>
                    <label className="text-[10px] text-stone-500 uppercase">Linked Clues (IDs)</label>
                    <Input
                      placeholder="Enter clue ID and press Enter..."
                      className="bg-black/50 border-stone-700 text-sm min-h-[44px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            const current = editingNode.metadata?.linkedClues || [];
                            if (!current.includes(val)) {
                              const newMeta = { ...editingNode.metadata, linkedClues: [...current, val] };
                              setEditingNode(prev => prev ? { ...prev, metadata: newMeta } : null);
                              updateNode(editingNode.id, { metadata: newMeta });
                            }
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {editingNode.metadata?.linkedClues?.map((clueId, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="text-[8px] border-purple-600 text-purple-400 cursor-pointer hover:bg-red-900/30"
                          onClick={() => {
                            const newClues = editingNode.metadata?.linkedClues?.filter(c => c !== clueId) || [];
                            const newMeta = { ...editingNode.metadata, linkedClues: newClues };
                            setEditingNode(prev => prev ? { ...prev, metadata: newMeta } : null);
                            updateNode(editingNode.id, { metadata: newMeta });
                          }}
                        >
                          🔗 {clueId} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Decision Condition (for decision nodes) */}
                  {editingNode.type === 'decision' && (
                    <div>
                      <label className="text-[10px] text-stone-500 uppercase">Branch Condition</label>
                      <Textarea
                        value={editingNode.metadata?.condition || ''}
                        onChange={(e) => {
                          const newMeta = { ...editingNode.metadata, condition: e.target.value };
                          setEditingNode(prev => prev ? { ...prev, metadata: newMeta } : null);
                          updateNode(editingNode.id, { metadata: newMeta });
                        }}
                        placeholder="e.g., if user finds vulnerability..."
                        className="bg-black/50 border-stone-700 text-xs min-h-[60px]"
                      />
                    </div>
                  )}

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

                  {/* Learning Goals Section */}
                  <div className="space-y-3 border-t border-purple-900/30 pt-4">
                    <div className="flex items-center gap-2 text-purple-400">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-xs font-bold">Learning Goals</span>
                    </div>
                    
                    <div>
                      <label className="text-[10px] text-stone-500">Skill Level for this Step</label>
                      <Select
                        value={editingNode.metadata?.skillLevel || 'intermediate'}
                        onValueChange={(level: 'beginner' | 'intermediate' | 'advanced' | 'expert') => {
                          const newMetadata = { ...editingNode.metadata, skillLevel: level };
                          setEditingNode(prev => prev ? { ...prev, metadata: newMetadata } : null);
                          updateNode(editingNode.id, { metadata: newMetadata });
                        }}
                      >
                        <SelectTrigger className="bg-black/50 border-stone-700 text-xs min-h-[44px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-900 border-stone-700">
                          {SKILL_LEVELS.map(level => (
                            <SelectItem key={level.id} value={level.id} className="text-xs">
                              {level.name} - {level.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] text-stone-500">Learning Goals Covered</label>
                      <div className="flex flex-wrap gap-1 mt-1 max-h-32 overflow-y-auto">
                        {LEARNING_GOALS.map(goal => {
                          const isSelected = editingNode.metadata?.learningGoals?.includes(goal.id);
                          return (
                            <button
                              key={goal.id}
                              onClick={() => {
                                const currentGoals = editingNode.metadata?.learningGoals || [];
                                const newGoals = isSelected 
                                  ? currentGoals.filter(g => g !== goal.id)
                                  : [...currentGoals, goal.id];
                                const newMetadata = { ...editingNode.metadata, learningGoals: newGoals };
                                setEditingNode(prev => prev ? { ...prev, metadata: newMetadata } : null);
                                updateNode(editingNode.id, { metadata: newMetadata });
                              }}
                              className={`px-2 py-1 text-[10px] rounded border min-h-[32px] transition-colors ${
                                isSelected
                                  ? CATEGORY_COLORS[goal.category] || 'bg-purple-900/50 text-purple-400 border-purple-700'
                                  : 'bg-stone-900/50 text-stone-500 border-stone-700 hover:border-purple-700'
                              }`}
                            >
                              {goal.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-stone-500">Teaching Notes</label>
                      <Textarea
                        value={editingNode.metadata?.teachingNotes || ''}
                        onChange={(e) => {
                          const newMetadata = { ...editingNode.metadata, teachingNotes: e.target.value };
                          setEditingNode(prev => prev ? { ...prev, metadata: newMetadata } : null);
                          updateNode(editingNode.id, { metadata: newMetadata });
                        }}
                        placeholder="Notes for teaching this step (explanations, tips, common mistakes...)"
                        className="bg-black/50 border-stone-700 text-xs min-h-[60px]"
                      />
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
