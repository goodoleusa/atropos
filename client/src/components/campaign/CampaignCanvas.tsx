import React, { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronRight, ChevronDown, Edit3, Plus, Link2, Key, Eye,
  Play, ZoomIn, ZoomOut, Wand2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  SkipBack, RotateCcw
} from 'lucide-react';
import { CampaignNode, CampaignLink, Campaign, SharedClue, NodeTypeInfo, COLOR_MAP, RelationType } from './CampaignTypes';

interface CampaignCanvasProps {
  campaign: Campaign;
  selectedNode: string | null;
  setSelectedNode: (id: string | null) => void;
  editingNode: CampaignNode | null;
  setEditingNode: (node: CampaignNode | null) => void;
  linkingFrom: string | null;
  setLinkingFrom: (id: string | null) => void;
  linkMousePos: { x: number; y: number } | null;
  setLinkMousePos: (pos: { x: number; y: number } | null) => void;
  inlineEditNode: string | null;
  setInlineEditNode: (id: string | null) => void;
  draggedNode: string | null;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  mode: 'tree' | 'graph';
  viewMode: 'canvas' | 'story' | 'tree' | 'clues' | 'overview';
  setViewMode: (mode: 'canvas' | 'story' | 'tree' | 'clues' | 'overview') => void;
  breadcrumbs: CampaignNode[];
  nodeRelations: {
    parents: { node: CampaignNode; relation: RelationType }[];
    children: { node: CampaignNode; relation: RelationType }[];
    siblings: { node: CampaignNode; relation: RelationType }[];
    related: { node: CampaignNode; relation: RelationType }[];
  };
  sharedClues: SharedClue[];
  savedCampaigns: Campaign[];
  storyOrder: CampaignNode[];
  NODE_TYPES: NodeTypeInfo[];
  testRunMode: boolean;
  testCurrentNode: string | null;
  setTestCurrentNode: (id: string | null) => void;
  testHistory: string[];
  setTestHistory: React.Dispatch<React.SetStateAction<string[]>>;
  testStartNode: string | null;
  setTestStartNode: (id: string | null) => void;
  handleNodeDragStart: (e: React.MouseEvent | React.TouchEvent, nodeId: string) => void;
  handleCanvasMouseMove: (e: React.MouseEvent | React.TouchEvent) => void;
  handleCanvasMouseUp: () => void;
  handleTouchStartZoom: (e: React.TouchEvent) => void;
  handleTouchMoveZoom: (e: React.TouchEvent) => void;
  handleTouchEndZoom: () => void;
  handleKeyboardNavigation: (e: React.KeyboardEvent) => void;
  updateNode: (nodeId: string, updates: Partial<CampaignNode>) => void;
  deleteNode: (nodeId: string) => void;
  createLink: (sourceId: string, targetId: string, relation?: RelationType) => void;
  deleteLink: (linkId: string) => void;
  addNode: (type: string, parentId?: string) => void;
  addStoryNodeAfter: (nodeId: string) => void;
  addClueToNode: (nodeId: string, clueId: string) => void;
  removeClueFromNode: (nodeId: string, clueId: string) => void;
  autoOrganize: () => void;
  moveNodeUp: (nodeId: string) => void;
  moveNodeDown: (nodeId: string) => void;
  indentNode: (nodeId: string) => void;
  outdentNode: (nodeId: string) => void;
  getNodeDepth: (nodeId: string) => number;
  renderTreeNode: (nodeId: string, depth?: number) => React.ReactNode;
  loadCampaign: (id: string) => void;
  jumpToNode: (nodeId: string) => void;
  startTestRun: (startNodeId: string) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export default function CampaignCanvas({
  campaign,
  selectedNode,
  setSelectedNode,
  editingNode,
  setEditingNode,
  linkingFrom,
  setLinkingFrom,
  linkMousePos,
  setLinkMousePos,
  inlineEditNode,
  setInlineEditNode,
  draggedNode,
  zoom,
  setZoom,
  mode,
  viewMode,
  setViewMode,
  breadcrumbs,
  nodeRelations,
  sharedClues,
  savedCampaigns,
  storyOrder,
  NODE_TYPES,
  testRunMode,
  testCurrentNode,
  setTestCurrentNode,
  testHistory,
  setTestHistory,
  testStartNode,
  setTestStartNode,
  handleNodeDragStart,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleTouchStartZoom,
  handleTouchMoveZoom,
  handleTouchEndZoom,
  handleKeyboardNavigation,
  updateNode,
  deleteNode,
  createLink,
  deleteLink,
  addNode,
  addStoryNodeAfter,
  addClueToNode,
  removeClueFromNode,
  autoOrganize,
  moveNodeUp,
  moveNodeDown,
  indentNode,
  outdentNode,
  getNodeDepth,
  renderTreeNode,
  loadCampaign,
  jumpToNode,
  startTestRun,
  canvasRef,
}: CampaignCanvasProps) {
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
        {isSelected && (
          <div className="absolute -top-2 -left-2 bg-amber-500 text-black text-[10px] px-1.5 py-0.5 rounded font-bold">
            SELECTED
          </div>
        )}
        
        {node.metadata?.linkedClues && node.metadata.linkedClues.length > 0 && (
          <div 
            className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"
            data-testid={`clue-badge-${node.id}`}
          >
            <Key className="w-2.5 h-2.5" />
            {node.metadata.linkedClues.length}
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
              className="text-xs bg-transparent border-amber-600 h-6 p-1 text-foreground"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-xs font-bold text-foreground truncate flex-1">{node.title}</span>
          )}
          <Badge variant="outline" className={`text-[8px] border-${node.color}-600 text-${node.color}-400`}>
            {nodeType?.label}
          </Badge>
        </div>
        
        {isInlineEditing ? (
          <textarea
            value={node.content}
            onChange={(e) => updateNode(node.id, { content: e.target.value })}
            className="w-full text-[10px] bg-transparent border border-amber-600 rounded p-1 text-foreground resize-none"
            rows={3}
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter node content..."
          />
        ) : (
          <p className="text-[10px] text-muted-foreground line-clamp-3">{node.content || 'Double-click to edit'}</p>
        )}
        
        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
          <button
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isLinkTarget
                ? 'bg-teal-500 border-teal-400 scale-125 animate-pulse' 
                : 'bg-card border-muted hover:border-teal-400 hover:bg-teal-900/50'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (linkingFrom && linkingFrom !== node.id) {
                createLink(linkingFrom, node.id);
              }
            }}
            title="Drop link here"
          >
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
        
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
          <button
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all text-sm font-bold ${
              isLinking 
                ? 'bg-teal-500 border-teal-400 scale-110 text-black' 
                : 'bg-border border-muted hover:border-amber-500 hover:bg-amber-900/50 text-foreground'
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
            <text x={midX} y={(y1 + y2) / 2 - 8} className="text-[11px] fill-foreground font-bold" textAnchor="middle">
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
    <div className="flex-1 overflow-hidden relative flex flex-col">
      {selectedNode && breadcrumbs.length > 0 && (
        <div className="bg-card/80 backdrop-blur border-b border-border px-3 py-1.5 flex items-center gap-1 overflow-x-auto shrink-0" data-testid="breadcrumbs">
          {breadcrumbs.map((node, idx) => (
            <div key={node.id} className="flex items-center gap-1 shrink-0">
              {idx > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              <button
                onClick={() => setSelectedNode(node.id)}
                className={`text-xs px-2 py-1 rounded transition-colors min-h-[32px] ${
                  node.id === selectedNode 
                    ? 'bg-amber-900/50 text-amber-800 font-medium' 
                    : 'text-muted-foreground hover:bg-border hover:text-foreground'
                }`}
              >
                {node.title}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedNode && (nodeRelations.parents.length > 0 || nodeRelations.children.length > 0 || nodeRelations.siblings.length > 0) && (
        <div className="bg-card/60 border-b border-border px-3 py-2 shrink-0 overflow-x-auto" data-testid="relations-panel">
          <div className="flex items-center gap-4 text-[10px]">
            {nodeRelations.parents.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-purple-700 font-medium">↑ Parents:</span>
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
                <span className="text-teal-800 font-medium">↓ Children:</span>
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
                <span className="text-amber-800 font-medium">↔ Siblings:</span>
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

      {selectedNode && (
        <div className="sm:hidden sticky top-0 z-10 bg-[hsl(var(--card))]/95 backdrop-blur border-b border-amber-900/30 p-2 flex items-center gap-2 shrink-0" data-testid="mobile-action-bar">
          <span className="text-xs text-muted-foreground truncate flex-1" data-testid="selected-node-title">
            {campaign.nodes.find(n => n.id === selectedNode)?.title}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const node = campaign.nodes.find(n => n.id === selectedNode);
              if (node) setEditingNode(node);
            }}
            className="min-h-[44px] min-w-[44px] p-0 border-amber-700 text-amber-800"
            data-testid="mobile-edit-btn"
          >
            <Edit3 className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLinkingFrom(selectedNode)}
            className="min-h-[44px] min-w-[44px] p-0 border-teal-700 text-teal-800"
            data-testid="mobile-link-btn"
          >
            <Link2 className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteNode(selectedNode)}
            className="min-h-[44px] min-w-[44px] p-0 border-purple-700 text-purple-700"
            data-testid="mobile-delete-btn"
          >
            <Edit3 className="w-5 h-5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedNode(null)}
            className="min-h-[44px] min-w-[44px] p-0 text-muted-foreground text-xl"
            data-testid="mobile-close-btn"
          >
            ×
          </Button>
        </div>
      )}

      {viewMode === 'story' ? (
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-amber-800 font-bold flex items-center gap-2">
                <Play className="w-4 h-4" /> Story Flow
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addNode('step')}
                className="border-amber-700 text-amber-800"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Step
              </Button>
            </div>

            {storyOrder.length === 0 ? (
              <div className="bg-card/30 border border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
                Start your story with the first step.
              </div>
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
                    <div key={node.id} className="bg-card/30 border border-border rounded-lg">
                      <div className="p-3 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                                Step {index + 1}
                              </Badge>
                              <Badge className={
                                node.color === 'amber' ? 'bg-amber-700 text-white' :
                                node.color === 'purple' ? 'bg-purple-700 text-white' :
                                node.color === 'teal' ? 'bg-teal-700 text-white' :
                                'bg-border text-white'
                              }>
                                {node.type}
                              </Badge>
                            </div>
                            <button
                              onClick={() => setEditingNode(node)}
                              className="text-amber-800 text-sm font-bold hover:text-amber-300 text-left"
                            >
                              {node.title}
                            </button>
                            <p className="text-muted-foreground text-xs line-clamp-3">{node.content || 'No content yet.'}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingNode(node)}
                              className="border-amber-700 text-amber-800"
                            >
                              <Edit3 className="w-3 h-3 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => addStoryNodeAfter(node.id)}
                              className="text-teal-800"
                            >
                              <Plus className="w-3 h-3 mr-1" /> {node.type === 'decision' ? 'Add Branch' : 'Add Next'}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 pb-3 space-y-3 text-xs">
                        <div className="flex flex-wrap gap-2">
                          {prevNodes.length > 0 && (
                            <div className="text-muted-foreground">
                              From: {prevNodes.map(n => n.title).join(', ')}
                            </div>
                          )}
                          {nextNodes.length > 0 && (
                            <div className="text-muted-foreground">
                              Next: {nextNodes.map(n => n.title).join(', ')}
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase">Linked Clues</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {linkedClues.length === 0 && (
                              <span className="text-[10px] text-muted-foreground">No clues linked</span>
                            )}
                            {linkedClues.map(clueId => (
                              <Badge
                                key={clueId}
                                variant="outline"
                                className="text-[9px] border-purple-700 text-purple-700 cursor-pointer hover:bg-red-900/30"
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
                              className="bg-black/50 border-border text-xs min-h-[36px]"
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
                      </div>
                    </div>
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
              <h3 className="text-amber-800 font-bold flex items-center gap-2">
                <Key className="w-4 h-4" /> All Clues & Campaign Links
              </h3>
              <Badge variant="outline" className="border-amber-700 text-amber-800">
                {sharedClues.length} clues
              </Badge>
            </div>
            {sharedClues.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No clues defined yet. Add clues in Admin → Clues tab.</p>
            ) : (
              <div className="grid gap-2">
                {sharedClues.map(clue => {
                  const linkedNodes = campaign.nodes.filter(n => n.metadata?.linkedClues?.includes(clue.id));
                  return (
                    <div key={clue.id} className="bg-card/30 border border-border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-amber-800 font-medium text-sm">{clue.name}</p>
                          <p className="text-muted-foreground text-xs">{clue.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {clue.tags?.map(t => <Badge key={t} variant="outline" className="text-[8px] border-border text-muted-foreground">{t}</Badge>)}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-muted-foreground">Used in {linkedNodes.length} nodes</p>
                          {linkedNodes.slice(0, 3).map(n => (
                            <button key={n.id} onClick={() => { setViewMode('canvas'); setSelectedNode(n.id); }} className="text-[9px] text-teal-800 hover:underline block">
                              → {n.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6">
              <h4 className="text-teal-800 text-sm font-bold mb-2">Nodes with Linked Clues</h4>
              <div className="space-y-1">
                {campaign.nodes.filter(n => n.metadata?.linkedClues?.length).map(node => (
                  <div key={node.id} className="flex items-center justify-between p-2 bg-card/30 rounded border border-border">
                    <button onClick={() => { setViewMode('canvas'); setSelectedNode(node.id); }} className="text-sm text-foreground hover:text-amber-400">
                      {node.title}
                    </button>
                    <div className="flex gap-1">
                      {node.metadata?.linkedClues?.map(c => (
                        <Badge key={c} variant="outline" className="text-[8px] border-purple-700 text-purple-700">🔗 {c}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {campaign.nodes.filter(n => n.metadata?.linkedClues?.length).length === 0 && (
                  <p className="text-muted-foreground text-xs">No nodes have linked clues yet. Edit a node and add clue IDs.</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-amber-800">{campaign.nodes.length}</p>
                <p className="text-[10px] text-muted-foreground">Nodes</p>
              </div>
              <div className="bg-teal-950/20 border border-teal-900/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-teal-800">{campaign.links.length}</p>
                <p className="text-[10px] text-muted-foreground">Links</p>
              </div>
              <div className="bg-purple-950/20 border border-purple-900/30 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-purple-700">{campaign.nodes.filter(n => n.type === 'decision').length}</p>
                <p className="text-[10px] text-muted-foreground">Decisions</p>
              </div>
              <div className="bg-border/30 border border-border rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-muted-foreground">{savedCampaigns.length}</p>
                <p className="text-[10px] text-muted-foreground">Campaigns</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card/30 border border-border rounded-lg">
                <div className="p-3 pb-2"><p className="text-sm text-amber-800 font-semibold">Features Used</p></div>
                <div className="px-3 pb-3 flex flex-wrap gap-1">
                  {Array.from(new Set(campaign.nodes.map(n => n.metadata?.featureType).filter(Boolean))).map(f => (
                    <Badge key={f} variant="outline" className="border-amber-700 text-amber-800 capitalize">{f}</Badge>
                  ))}
                  {campaign.nodes.every(n => !n.metadata?.featureType) && <span className="text-muted-foreground text-xs">None set</span>}
                </div>
              </div>
              <div className="bg-card/30 border border-border rounded-lg">
                <div className="p-3 pb-2"><p className="text-sm text-teal-800 font-semibold">Skills Covered</p></div>
                <div className="px-3 pb-3 flex flex-wrap gap-1">
                  {Array.from(new Set(campaign.nodes.flatMap(n => n.metadata?.skills || []))).slice(0, 10).map(s => (
                    <Badge key={s} variant="outline" className="border-teal-700 text-teal-800 text-[9px]">{s}</Badge>
                  ))}
                  {campaign.nodes.every(n => !n.metadata?.skills?.length) && <span className="text-muted-foreground text-xs">None set</span>}
                </div>
              </div>
            </div>
            <div className="bg-card/30 border border-border rounded-lg">
              <div className="p-3 pb-2"><p className="text-sm text-purple-700 font-semibold">All Campaigns</p></div>
              <div className="px-3 pb-3 space-y-1">
                {savedCampaigns.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 bg-card/50 rounded">
                    <button onClick={() => loadCampaign(c.id)} className={`text-sm ${c.id === campaign.id ? 'text-amber-800' : 'text-muted-foreground hover:text-foreground'}`}>
                      {c.name}
                    </button>
                    <span className="text-[10px] text-muted-foreground">{c.nodes.length} nodes</span>
                  </div>
                ))}
                {savedCampaigns.length === 0 && <p className="text-muted-foreground text-xs">No saved campaigns yet</p>}
              </div>
            </div>
            <div className="bg-card/30 border border-border rounded-lg">
              <div className="p-3 pb-2"><p className="text-sm text-cyan-400 font-semibold">Decision Tree Paths</p></div>
              <div className="px-3 pb-3 space-y-1 max-h-[200px] overflow-y-auto">
                {campaign.nodes.filter(n => n.type === 'decision').map(node => {
                  const children = campaign.links.filter(l => l.source === node.id);
                  return (
                    <div key={node.id} className="text-xs p-2 bg-purple-950/20 rounded border border-purple-900/30">
                      <p className="text-purple-700 font-medium">{node.title}</p>
                      <p className="text-muted-foreground text-[10px]">{node.metadata?.condition || node.content}</p>
                      <div className="mt-1 flex gap-1 flex-wrap">
                        {children.map(l => {
                          const target = campaign.nodes.find(n => n.id === l.target);
                          return target ? (
                            <button key={l.id} onClick={() => { setViewMode('canvas'); setSelectedNode(target.id); }} className="text-[9px] px-1.5 py-0.5 bg-teal-900/30 text-teal-800 rounded hover:bg-teal-800/50">
                              → {target.title} {l.label ? `(${l.label})` : ''}
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  );
                })}
                {campaign.nodes.filter(n => n.type === 'decision').length === 0 && <p className="text-muted-foreground text-xs">No decision nodes yet</p>}
              </div>
            </div>
          </div>
        </ScrollArea>
      ) : mode === 'tree' ? (
        <ScrollArea className="h-full p-4">
          <div className="space-y-1">
            {campaign.rootNodes.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
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
          className="absolute inset-0 overflow-auto bg-[hsl(var(--card))] outline-none"
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
          <div className="fixed bottom-20 right-4 sm:absolute sm:bottom-4 sm:right-4 z-50 flex flex-col gap-2 bg-card/90 backdrop-blur rounded-lg p-2 border border-border">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setZoom(z => Math.min(2, z + 0.25))}
              className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-amber-400"
              data-testid="zoom-in-btn"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <span className="text-center text-xs text-muted-foreground font-mono">{Math.round(zoom * 100)}%</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
              className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-amber-400"
              data-testid="zoom-out-btn"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <div className="border-t border-border pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoom(1)}
                className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-teal-400 text-xs"
                data-testid="zoom-reset-btn"
              >
                Reset
              </Button>
            </div>
            <div className="border-t border-border pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={autoOrganize}
                className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-purple-400"
                title="Auto-organize nodes"
                data-testid="auto-organize-btn"
              >
                <Wand2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {selectedNode && !editingNode && (
            <div className="fixed bottom-20 left-4 sm:absolute sm:bottom-4 sm:left-4 z-50 bg-card/90 backdrop-blur rounded-lg p-2 border border-amber-700/50">
              <p className="text-[10px] text-amber-800 uppercase mb-2 text-center font-bold">Order</p>
              <div className="grid grid-cols-3 gap-1">
                <div />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveNodeUp(selectedNode)}
                  className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-amber-400"
                  title="Move node up (↑)"
                  data-testid="move-up-btn"
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
                <div />
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => outdentNode(selectedNode)}
                  className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-purple-400"
                  title="Outdent (←)"
                  data-testid="outdent-btn"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center justify-center text-[10px] text-muted-foreground">
                  {getNodeDepth(selectedNode) > 0 && (
                    <span className="bg-purple-900/50 px-1.5 py-0.5 rounded text-purple-700">
                      L{getNodeDepth(selectedNode)}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => indentNode(selectedNode)}
                  className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-teal-400"
                  title="Indent (→)"
                  data-testid="indent-btn"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
                
                <div />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveNodeDown(selectedNode)}
                  className="min-h-[44px] min-w-[44px] text-muted-foreground hover:text-amber-400"
                  title="Move node down (↓)"
                  data-testid="move-down-btn"
                >
                  <ArrowDown className="w-5 h-5" />
                </Button>
                <div />
              </div>
            </div>
          )}

          {linkingFrom && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-teal-900/90 text-teal-300 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
              <Link2 className="w-4 h-4" />
              Click target node or canvas to cancel
            </div>
          )}
          
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

      {testRunMode && testCurrentNode && (
        <div className="fixed inset-x-0 bottom-0 sm:absolute sm:inset-auto sm:bottom-4 sm:left-4 sm:right-4 z-50 bg-teal-950/95 backdrop-blur border-t sm:border sm:rounded-lg border-teal-700 p-4" data-testid="test-run-panel">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-teal-800 flex items-center gap-2">
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
                className="min-h-[44px] min-w-[44px] text-teal-800"
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
                className="min-h-[44px] min-w-[44px] text-teal-800"
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
                  <span className="text-xs text-muted-foreground">Start from</span>
                  <Select
                    value={testStartNode || currentNode.id}
                    onValueChange={(nodeId) => {
                      setTestStartNode(nodeId);
                      setTestCurrentNode(nodeId);
                      setTestHistory([nodeId]);
                    }}
                  >
                    <SelectTrigger className="bg-black/50 border-teal-700 text-foreground min-h-[36px] w-[220px]">
                      <SelectValue placeholder="Select start node..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-teal-700">
                      {campaign.nodes.map(node => (
                        <SelectItem key={node.id} value={node.id} className="text-foreground">
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
                    'bg-border text-white'
                  }>
                    {nodeType?.icon} {nodeType?.label}
                  </Badge>
                  <span className="text-sm font-bold text-foreground">{currentNode.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{currentNode.content || 'No content'}</p>
                
                {outgoingLinks.length > 0 ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Choose next step:</p>
                    <Select
                      value=""
                      onValueChange={(nodeId) => {
                        setTestCurrentNode(nodeId);
                        setTestHistory(prev => [...prev, nodeId]);
                      }}
                    >
                      <SelectTrigger className="bg-black/50 border-teal-700 text-foreground min-h-[44px]" data-testid="test-next-select">
                        <SelectValue placeholder="Select next node..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-teal-700">
                        {outgoingLinks.map(link => {
                          const targetNode = campaign.nodes.find(n => n.id === link.target);
                          return targetNode ? (
                            <SelectItem key={link.id} value={link.target} className="text-foreground">
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
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                              : 'border-border text-muted-foreground hover:text-foreground'
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
    </div>
  );
}
