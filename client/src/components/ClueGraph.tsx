import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClueNode {
  id: string;
  name: string;
  linkedTo: string[];
  linkedFrom: string[];
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  collected?: boolean;
}

interface ClueGraphProps {
  clues: ClueNode[];
  selectedClueId?: string;
  onSelectClue: (id: string) => void;
  showUncollected?: boolean;
}

interface NodePosition {
  x: number;
  y: number;
}

export function ClueGraph({ 
  clues, 
  selectedClueId, 
  onSelectClue,
  showUncollected = true 
}: ClueGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const filteredClues = showUncollected ? clues : clues.filter(c => c.collected);

  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    filteredClues.forEach((clue, index) => {
      const angle = (2 * Math.PI * index) / filteredClues.length;
      const connectionCount = clue.linkedTo.length + clue.linkedFrom.length;
      const radius = Math.max(80, 150 - connectionCount * 10);
      
      positions[clue.id] = {
        x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 40,
        y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 40
      };
    });

    return positions;
  }, [filteredClues]);

  const edges = useMemo(() => {
    const edgeList: Array<{ from: string; to: string; bidirectional: boolean }> = [];
    const processed = new Set<string>();

    filteredClues.forEach(clue => {
      clue.linkedTo.forEach(targetId => {
        const edgeKey = [clue.id, targetId].sort().join('-');
        if (!processed.has(edgeKey) && nodePositions[targetId]) {
          const isBidirectional = filteredClues.find(c => c.id === targetId)?.linkedTo.includes(clue.id);
          edgeList.push({ from: clue.id, to: targetId, bidirectional: !!isBidirectional });
          processed.add(edgeKey);
        }
      });
    });

    return edgeList;
  }, [filteredClues, nodePositions]);

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return '#a855f7';
      case 'rare': return '#3b82f6';
      case 'uncommon': return '#14b8a6';
      default: return '#d97706';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(3, z * delta)));
  };

  return (
    <div className="relative bg-black/50 rounded-lg border border-amber-900/30 overflow-hidden">
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(z => Math.min(3, z * 1.2))}
          className="h-7 w-7 p-0 bg-black/50 text-amber-800 hover:bg-amber-900/30"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(z => Math.max(0.3, z * 0.8))}
          className="h-7 w-7 p-0 bg-black/50 text-amber-800 hover:bg-amber-900/30"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="h-7 w-7 p-0 bg-black/50 text-amber-800 hover:bg-amber-900/30"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute top-2 left-2 z-10 text-[10px] text-muted-foreground bg-black/50 px-2 py-1 rounded">
        {filteredClues.length} nodes · {edges.length} connections
      </div>

      <div
        ref={containerRef}
        className="w-full h-[400px] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 600 400"
          style={{ 
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center'
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#d9770644" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {edges.map(edge => {
            const from = nodePositions[edge.from];
            const to = nodePositions[edge.to];
            if (!from || !to) return null;

            const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to || 
                                  selectedClueId === edge.from || selectedClueId === edge.to;

            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isHighlighted ? '#d97706' : '#d9770633'}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={edge.bidirectional ? undefined : '4,2'}
                markerEnd={edge.bidirectional ? undefined : 'url(#arrowhead)'}
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
            );
          })}

          {filteredClues.map(clue => {
            const pos = nodePositions[clue.id];
            if (!pos) return null;

            const isSelected = selectedClueId === clue.id;
            const isHovered = hoveredNode === clue.id;
            const isConnected = hoveredNode && (
              clue.linkedTo.includes(hoveredNode) || 
              clue.linkedFrom.includes(hoveredNode)
            );
            const color = getRarityColor(clue.rarity);

            return (
              <g key={clue.id}>
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 14 : isHovered ? 12 : 10}
                  fill={clue.collected ? color : '#1c1917'}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : isConnected ? 2 : 1}
                  opacity={clue.collected ? 1 : 0.5}
                  filter={isSelected || isHovered ? 'url(#glow)' : undefined}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => onSelectClue(clue.id)}
                  onMouseEnter={() => setHoveredNode(clue.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  initial={false}
                  animate={{ r: isSelected ? 14 : isHovered ? 12 : 10 }}
                />
                
                {(isHovered || isSelected) && (
                  <text
                    x={pos.x}
                    y={pos.y + 24}
                    textAnchor="middle"
                    fill="#d97706"
                    fontSize="10"
                    fontFamily="monospace"
                    className="pointer-events-none"
                  >
                    {clue.name.length > 15 ? clue.name.slice(0, 15) + '...' : clue.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[9px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-600" />
          <span className="text-muted-foreground">Common</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <span className="text-muted-foreground">Uncommon</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Rare</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-muted-foreground">Legendary</span>
        </div>
      </div>
    </div>
  );
}
