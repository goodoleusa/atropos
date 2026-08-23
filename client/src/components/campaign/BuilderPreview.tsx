import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Campaign, CampaignNode } from './CampaignTypes';

interface BuilderPreviewProps {
  campaign: Campaign;
  node: CampaignNode | null;
  onSelectNode: (id: string) => void;
}

export default function BuilderPreview({ campaign, node, onSelectNode }: BuilderPreviewProps) {
  const connectedNodes = useMemo(() => {
    if (!node) return [];
    return campaign.links
      .filter(l => l.source === node.id || l.target === node.id)
      .map(l => {
        const otherId = l.source === node.id ? l.target : l.source;
        const other = campaign.nodes.find(n => n.id === otherId);
        return other ? { ...other, direction: l.source === node.id ? 'outgoing' : 'incoming' } : null;
      })
      .filter(Boolean) as (CampaignNode & { direction: string })[];
  }, [node, campaign.links, campaign.nodes]);

  const renderWikilinks = (content: string) => {
    return content.split(/(\[\[.*?\]\])/g).map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const title = part.slice(2, -2);
        return (
          <button
            key={i}
            onClick={() => {
              const t = campaign.nodes.find(n => n.title.toLowerCase() === title.toLowerCase());
              if (t) onSelectNode(t.id);
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

  if (!node) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a node to preview.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-12">
      <div className="max-w-3xl mx-auto w-full">
        <div className="border-l-4 border-amber-500 pl-6 py-2 mb-8 bg-amber-500/5 rounded-r">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{node.title}</h1>
          <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em] mt-1">
            {node.type} · {node.pageLayout || 'card'}
          </p>
        </div>
        <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {renderWikilinks(node.content)}
        </div>
        {node.metadata?.learningGoals && node.metadata.learningGoals.length > 0 && (
          <div className="mt-8 p-4 bg-teal-950/20 border border-teal-900/30 rounded-lg">
            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Learning Goals</h3>
            <ul className="space-y-1">
              {node.metadata.learningGoals.map((g, i) => (
                <li key={i} className="text-sm text-muted-foreground">· {g}</li>
              ))}
            </ul>
          </div>
        )}
        {connectedNodes.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
            {connectedNodes.map(n => (
              <Button
                key={n.id}
                variant="outline"
                className="justify-between h-12 border-border hover:border-amber-900/50 bg-card/50 group"
                onClick={() => onSelectNode(n.id)}
              >
                <span className="text-xs uppercase font-bold text-muted-foreground group-hover:text-amber-500">{n.title}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500" />
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
