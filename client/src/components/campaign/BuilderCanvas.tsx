import { Campaign, CampaignNode, COLOR_MAP } from './CampaignTypes';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Network } from 'lucide-react';

interface BuilderCanvasProps {
  campaign: Campaign;
  selectedNodeId: string | null;
  linkingFrom: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNode: (id: string, updates: Partial<CampaignNode>) => void;
  onAddLink: (source: string, target: string) => void;
  onSetLinkingFrom: (id: string | null) => void;
  onAddNode: () => void;
}

export default function BuilderCanvas({
  campaign,
  selectedNodeId,
  linkingFrom,
  onSelectNode,
  onUpdateNode,
  onAddLink,
  onSetLinkingFrom,
  onAddNode,
}: BuilderCanvasProps) {
  if (campaign.nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-card">
        <div className="text-center space-y-4">
          <Network className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">Empty canvas</p>
          <Button
            data-testid="add-first-node"
            size="sm"
            variant="outline"
            className="border-amber-600 text-amber-400 hover:bg-amber-950/40"
            onClick={onAddNode}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add First Node
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-auto bg-card"
      onClick={() => onSelectNode(null)}
    >
      <div
        className="relative min-w-[2000px] min-h-[2000px]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(120,113,108,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {campaign.links.map((link) => {
            const src = campaign.nodes.find((n) => n.id === link.source);
            const tgt = campaign.nodes.find((n) => n.id === link.target);
            if (!src || !tgt) return null;
            const x1 = src.x + 96;
            const y1 = src.y + 40;
            const x2 = tgt.x + 96;
            const y2 = tgt.y + 40;
            return (
              <g key={link.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#78716c"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  opacity={0.4}
                />
                <circle cx={x2} cy={y2} r={3} fill="#f59e0b" opacity={0.6} />
              </g>
            );
          })}
        </svg>

        {campaign.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const colorClasses = COLOR_MAP[node.color] || COLOR_MAP['stone'];

          return (
            <motion.div
              key={node.id}
              data-testid={`canvas-node-${node.id}`}
              drag
              dragMomentum={false}
              onDragEnd={(_e, info) => {
                onUpdateNode(node.id, {
                  x: node.x + info.offset.x,
                  y: node.y + info.offset.y,
                });
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (linkingFrom && linkingFrom !== node.id) {
                  onAddLink(linkingFrom, node.id);
                  onSetLinkingFrom(null);
                } else {
                  onSelectNode(node.id);
                }
              }}
              className="absolute cursor-grab active:cursor-grabbing"
              style={{ left: node.x, top: node.y }}
            >
              <Card
                className={`w-48 border-2 ${colorClasses} bg-card/80 backdrop-blur-sm transition-all ${
                  isSelected
                    ? 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-105'
                    : ''
                }`}
              >
                <CardContent className="p-2 space-y-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[8px] px-1 py-0 h-4 border-muted text-muted-foreground"
                    >
                      {node.type}
                    </Badge>
                    {node.pageLayout && (
                      <Badge
                        variant="outline"
                        className="text-[8px] px-1 py-0 h-4 border-border text-muted-foreground"
                      >
                        {node.pageLayout}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-foreground leading-tight truncate">
                    {node.title}
                  </p>
                  {node.content && (
                    <p className="text-[9px] text-muted-foreground leading-tight">
                      {node.content.length > 60
                        ? node.content.slice(0, 60) + '…'
                        : node.content}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
