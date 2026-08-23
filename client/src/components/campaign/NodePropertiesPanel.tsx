import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Trash2, Link as LinkIcon, Play, GitBranch, Zap, FileText, Folder, File, Sparkles } from 'lucide-react';
import { Campaign, CampaignNode, COLORS, PAGE_LAYOUTS, COLOR_MAP, GlitchEffectType } from './CampaignTypes';
import { GLITCH_EFFECTS, GlitchHover } from '@/components/GlitchHover';
import { useToast } from '@/hooks/use-toast';

const NODE_TYPES: { type: CampaignNode['type']; icon: React.ReactNode; color: string }[] = [
  { type: 'step', icon: <Play className="w-3 h-3" />, color: 'amber' },
  { type: 'decision', icon: <GitBranch className="w-3 h-3" />, color: 'purple' },
  { type: 'tool', icon: <Zap className="w-3 h-3" />, color: 'teal' },
  { type: 'output', icon: <FileText className="w-3 h-3" />, color: 'blue' },
  { type: 'folder', icon: <Folder className="w-3 h-3" />, color: 'stone' },
];

interface NodePropertiesPanelProps {
  campaign: Campaign;
  node: CampaignNode;
  onUpdateNode: (id: string, updates: Partial<CampaignNode>) => void;
  onDeleteNode: (id: string) => void;
  onSelectNode: (id: string | null) => void;
  linkingFrom: string | null;
  onSetLinkingFrom: (id: string | null) => void;
}

export default function NodePropertiesPanel({
  campaign, node, onUpdateNode, onDeleteNode, onSelectNode, linkingFrom, onSetLinkingFrom,
}: NodePropertiesPanelProps) {
  const { toast } = useToast();

  const connectedNodes = useMemo(() => {
    return campaign.links
      .filter(l => l.source === node.id || l.target === node.id)
      .map(l => {
        const otherId = l.source === node.id ? l.target : l.source;
        const other = campaign.nodes.find(n => n.id === otherId);
        return other ? { ...other, direction: l.source === node.id ? 'outgoing' : 'incoming' } : null;
      })
      .filter(Boolean) as (CampaignNode & { direction: string })[];
  }, [node.id, campaign.links, campaign.nodes]);

  const nodeTypeIcon = (type: string) => NODE_TYPES.find(t => t.type === type)?.icon || <File className="w-3 h-3" />;

  return (
    <aside className="w-72 bg-card border-l border-border p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Node Properties</h2>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onSelectNode(null)}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-amber-500/70 font-bold uppercase">Title</label>
        <Input
          data-testid="prop-node-title"
          value={node.title}
          onChange={e => onUpdateNode(node.id, { title: e.target.value })}
          className="bg-card border-border h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-amber-500/70 font-bold uppercase">Type</label>
        <div className="grid grid-cols-3 gap-1">
          {NODE_TYPES.map(t => (
            <Button
              key={t.type}
              data-testid={`set-type-${t.type}`}
              variant={node.type === t.type ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onUpdateNode(node.id, { type: t.type })}
              className="h-7 text-[8px] uppercase font-bold border-border gap-1"
            >
              {t.icon}{t.type}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-amber-500/70 font-bold uppercase">Color</label>
        <div className="flex gap-1 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              data-testid={`set-color-${c}`}
              onClick={() => onUpdateNode(node.id, { color: c })}
              className={`w-6 h-6 rounded border-2 transition-all ${node.color === c ? 'scale-110 border-white' : 'border-border'}`}
              style={{
                backgroundColor: c === 'amber' ? '#d97706' : c === 'purple' ? '#9333ea' : c === 'teal' ? '#0d9488'
                  : c === 'blue' ? '#2563eb' : c === 'red' ? '#dc2626' : c === 'green' ? '#16a34a' : '#57534e'
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-amber-500/70 font-bold uppercase">Page Layout</label>
        <Select value={node.pageLayout || 'card'} onValueChange={v => onUpdateNode(node.id, { pageLayout: v as any })}>
          <SelectTrigger data-testid="select-layout" className="bg-card border-border h-7 text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_LAYOUTS.map(l => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border" />

      <div className="space-y-1.5">
        <label className="text-[9px] text-muted-foreground font-bold uppercase">Connected ({connectedNodes.length})</label>
        {connectedNodes.map(n => (
          <div
            key={n.id}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer hover:text-amber-500"
            onClick={() => onSelectNode(n.id)}
          >
            {nodeTypeIcon(n.type)}
            <span className="truncate">{n.title}</span>
            <Badge className="ml-auto text-[7px] bg-card border-border text-muted-foreground">{n.direction}</Badge>
          </div>
        ))}
      </div>

      <Separator className="bg-border" />

      <Button
        data-testid="link-from-node"
        variant="outline"
        size="sm"
        className="w-full border-border text-muted-foreground h-8 text-[10px]"
        onClick={() => {
          onSetLinkingFrom(node.id);
          toast({ title: 'Link Mode', description: 'Click another node to create a link.' });
        }}
      >
        <LinkIcon className="w-3 h-3 mr-1.5" />
        {linkingFrom === node.id ? 'Click target...' : 'Add Link From Here'}
      </Button>

      <Separator className="bg-border" />

      <div className="space-y-2">
        <label className="text-[9px] text-amber-500/70 font-bold uppercase flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> UI Effects
        </label>

        <div className="space-y-1">
          <label className="text-[8px] text-muted-foreground uppercase">Hover Effect</label>
          <Select
            value={node.uiEffects?.hoverEffect || 'none'}
            onValueChange={v => onUpdateNode(node.id, { uiEffects: { ...node.uiEffects, hoverEffect: v as GlitchEffectType } })}
          >
            <SelectTrigger data-testid="select-hover-effect" className="bg-card border-border h-7 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GLITCH_EFFECTS.map(e => (
                <SelectItem key={e.id} value={e.id} className="text-xs">{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {node.uiEffects?.hoverEffect && node.uiEffects.hoverEffect !== 'none' && (
          <div className="space-y-1">
            <label className="text-[8px] text-muted-foreground uppercase">Intensity ({((node.uiEffects?.hoverIntensity ?? 0.5) * 100).toFixed(0)}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={(node.uiEffects?.hoverIntensity ?? 0.5) * 100}
              onChange={e => onUpdateNode(node.id, { uiEffects: { ...node.uiEffects, hoverIntensity: parseInt(e.target.value) / 100 } })}
              className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber-500"
              data-testid="slider-effect-intensity"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[8px] text-muted-foreground uppercase">Entry Animation</label>
          <Select
            value={node.uiEffects?.entryAnimation || 'none'}
            onValueChange={v => onUpdateNode(node.id, { uiEffects: { ...node.uiEffects, entryAnimation: v as any } })}
          >
            <SelectTrigger data-testid="select-entry-anim" className="bg-card border-border h-7 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">None</SelectItem>
              <SelectItem value="glitch-in" className="text-xs">Glitch In</SelectItem>
              <SelectItem value="fade" className="text-xs">Fade</SelectItem>
              <SelectItem value="slide-up" className="text-xs">Slide Up</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[8px] text-muted-foreground uppercase">Clue Reveal Effect</label>
          <Select
            value={node.uiEffects?.clueRevealEffect || 'none'}
            onValueChange={v => onUpdateNode(node.id, { uiEffects: { ...node.uiEffects, clueRevealEffect: v as GlitchEffectType } })}
          >
            <SelectTrigger data-testid="select-clue-reveal" className="bg-card border-border h-7 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GLITCH_EFFECTS.map(e => (
                <SelectItem key={e.id} value={e.id} className="text-xs">{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {node.uiEffects?.hoverEffect && node.uiEffects.hoverEffect !== 'none' && (
          <GlitchHover effect={node.uiEffects.hoverEffect} intensity={node.uiEffects.hoverIntensity ?? 0.5}>
            <div className="p-2 rounded border border-border bg-card/50 text-center">
              <span className="text-[9px] text-muted-foreground">Hover to preview</span>
            </div>
          </GlitchHover>
        )}
      </div>

      <Button
        data-testid="delete-node"
        variant="destructive"
        size="sm"
        className="w-full bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-900/30 h-8 text-[10px] uppercase font-bold"
        onClick={() => onDeleteNode(node.id)}
      >
        <Trash2 className="w-3 h-3 mr-1.5" />Delete Node
      </Button>
    </aside>
  );
}
