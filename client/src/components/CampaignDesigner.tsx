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

interface CampaignLink {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  color: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  nodes: CampaignNode[];
  links: CampaignLink[];
  rootNodes: string[];
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
  const canvasRef = useRef<HTMLDivElement>(null);

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

  const createLink = useCallback((sourceId: string, targetId: string) => {
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
      color: 'amber'
    };

    setCampaign(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));

    setLinkingFrom(null);
    toast({ title: 'Link created' });
  }, [campaign.links]);

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

  const exportCampaign = useCallback(() => {
    const blob = new Blob([JSON.stringify(campaign, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.name.replace(/\s+/g, '_')}.json`;
    a.click();
    toast({ title: 'Campaign exported' });
  }, [campaign]);

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
        
        {/* Link connector - bigger touch target */}
        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
          <button
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isLinking 
                ? 'bg-teal-500 border-teal-400 scale-125' 
                : 'bg-stone-800 border-stone-600 hover:border-amber-500 hover:bg-amber-900/50'
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
            title={linkingFrom ? (linkingFrom === node.id ? 'Cancel linking' : 'Connect here') : 'Drag to link'}
          >
            {isLinking ? '✕' : '→'}
          </button>
        </div>

        {/* Left connector for incoming links */}
        {isLinkTarget && (
          <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-6 rounded-full border-2 border-teal-400 bg-teal-500/50 flex items-center justify-center animate-pulse">
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
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] bg-[#0a0500] border-amber-900/50 p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="p-4 border-b border-amber-900/30 shrink-0">
            <DialogTitle className="text-amber-500 font-orbitron flex items-center gap-2 text-base">
              <Layers className="w-5 h-5" />
              Campaign Designer
            </DialogTitle>
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <Input
                value={campaign.name}
                onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                className="bg-transparent border-stone-700 text-stone-300 text-base min-h-[44px] flex-1"
                placeholder="Campaign name..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={mode === 'tree' ? 'default' : 'outline'}
                  onClick={() => setMode('tree')}
                  className={`min-h-[44px] flex-1 sm:flex-none ${mode === 'tree' ? 'bg-amber-700 text-black' : 'border-stone-700 text-stone-400'}`}
                >
                  <FolderTree className="w-4 h-4 mr-1" /> Tree
                </Button>
                <Button
                  size="sm"
                  variant={mode === 'graph' ? 'default' : 'outline'}
                  onClick={() => setMode('graph')}
                  className={`min-h-[44px] flex-1 sm:flex-none ${mode === 'graph' ? 'bg-purple-700 text-white' : 'border-stone-700 text-stone-400'}`}
                >
                  <GitBranch className="w-4 h-4 mr-1" /> Graph
                </Button>
                <Button size="sm" variant="outline" onClick={exportCampaign} className="border-amber-800 text-amber-400 min-h-[44px]">
                  <Download className="w-4 h-4" />
                </Button>
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
                  className={`min-h-[44px] ${testRunMode ? 'bg-teal-700 text-white' : 'border-teal-800 text-teal-400'}`}
                  disabled={campaign.rootNodes.length === 0}
                  data-testid="test-run-btn"
                >
                  {testRunMode ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  {testRunMode ? 'Stop' : 'Test'}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
            <div className="border-b sm:border-b-0 sm:border-r border-amber-900/30 p-3 shrink-0">
              <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-2">Add Node</p>
              <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
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
                      className={`justify-start min-h-[44px] min-w-[90px] text-xs ${buttonStyles[nt.color] || buttonStyles.stone}`}
                      data-testid={`add-node-${nt.type}`}
                    >
                      {nt.icon}
                      <span className="ml-2 hidden sm:inline">{nt.label}</span>
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
                      className="w-full justify-start text-xs border-red-700 text-red-400"
                    >
                      <Trash2 className="w-3 h-3 mr-2" /> Delete
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {/* Mobile action bar for selected node */}
              {selectedNode && (
                <div className="sm:hidden sticky top-0 z-10 bg-[#0a0500]/95 backdrop-blur border-b border-amber-900/30 p-2 flex items-center gap-2" data-testid="mobile-action-bar">
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
                    className="min-h-[36px] min-w-[36px] p-0 border-amber-700 text-amber-400"
                    data-testid="mobile-edit-btn"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLinkingFrom(selectedNode)}
                    className="min-h-[36px] min-w-[36px] p-0 border-teal-700 text-teal-400"
                    data-testid="mobile-link-btn"
                  >
                    <Link2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteNode(selectedNode)}
                    className="min-h-[36px] min-w-[36px] p-0 border-red-700 text-red-400"
                    data-testid="mobile-delete-btn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedNode(null)}
                    className="min-h-[36px] min-w-[36px] p-0 text-stone-400"
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
                  className="absolute inset-0 overflow-auto bg-[#050200] touch-none"
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
                  style={{
                    backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                >
                  {/* Linking mode indicator */}
                  {linkingFrom && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-teal-900/90 text-teal-300 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                      <Link2 className="w-4 h-4" />
                      Click target node or canvas to cancel
                    </div>
                  )}
                  
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 2000, minHeight: 1500 }}>
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
                        {['amber', 'teal', 'purple', 'blue', 'red', 'green'].map(color => (
                          <SelectItem key={color} value={color} className="text-stone-300">
                            <span className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded bg-${color}-500`} />
                              {color.charAt(0).toUpperCase() + color.slice(1)}
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
