import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CampaignNode } from './CampaignTypes';

interface BuilderEditorProps {
  node: CampaignNode | null;
  onUpdateNode: (id: string, updates: Partial<CampaignNode>) => void;
}

export default function BuilderEditor({ node, onUpdateNode }: BuilderEditorProps) {
  if (!node) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground italic text-sm">
        Select a node to edit.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-auto">
      <div className="max-w-4xl mx-auto w-full space-y-4 flex-1 flex flex-col">
        <Input
          data-testid="edit-node-title"
          value={node.title}
          onChange={e => onUpdateNode(node.id, { title: e.target.value })}
          className="text-2xl font-black bg-transparent border-none p-0 focus-visible:ring-0 text-amber-800 h-auto uppercase tracking-tighter"
        />
        <div className="flex gap-2">
          <Badge className="bg-card text-muted-foreground border-border h-5 text-[9px] font-mono">{node.id}</Badge>
          <Badge className="bg-amber-950/30 text-amber-800 border-amber-900/30 h-5 text-[9px] uppercase">{node.type}</Badge>
          {node.pageLayout && (
            <Badge className="bg-teal-950/30 text-teal-800 border-teal-900/30 h-5 text-[9px]">{node.pageLayout}</Badge>
          )}
        </div>
        <Textarea
          data-testid="edit-node-content"
          value={node.content}
          onChange={e => onUpdateNode(node.id, { content: e.target.value })}
          className="flex-1 bg-card/30 border-border text-foreground resize-none font-mono text-sm leading-relaxed focus:border-amber-900/50 p-4 rounded-xl min-h-[300px]"
          placeholder="Write markdown with [[wikilinks]]..."
        />
      </div>
    </div>
  );
}
