import React, { useState, useRef } from 'react';
import {
  Campaign, CampaignNode, HiddenClue, ClueType, ArcTemplate, CATEGORIES, DIFFICULTIES
} from './CampaignTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Plus, Trash2, X, Zap, FileText, Play, GitBranch, Folder, Upload,
  FileCode, Network, Code2, Terminal, Eye, Globe, Lock, Bug, EyeOff
} from 'lucide-react';

const CLUE_ICONS: Record<ClueType, React.ReactNode> = {
  'source-code': <FileCode className="w-3.5 h-3.5" />,
  'network-request': <Network className="w-3.5 h-3.5" />,
  'http-header': <Code2 className="w-3.5 h-3.5" />,
  'console-log': <Terminal className="w-3.5 h-3.5" />,
  'css-comment': <Eye className="w-3.5 h-3.5" />,
  'data-attribute': <Code2 className="w-3.5 h-3.5" />,
  'meta-tag': <Globe className="w-3.5 h-3.5" />,
  'base64': <Lock className="w-3.5 h-3.5" />,
  'hex-encoded': <Bug className="w-3.5 h-3.5" />,
  'steganography': <EyeOff className="w-3.5 h-3.5" />,
};

const CLUE_TYPES = Object.keys(CLUE_ICONS) as ClueType[];

const NODE_TYPE_ICONS: Record<CampaignNode['type'], React.ReactNode> = {
  step: <Play className="w-3 h-3" />,
  decision: <GitBranch className="w-3 h-3" />,
  tool: <Zap className="w-3 h-3" />,
  output: <FileText className="w-3 h-3" />,
  folder: <Folder className="w-3 h-3" />,
};

interface BuilderSidebarProps {
  campaign: Campaign;
  selectedNodeId: string | null;
  isMobile: boolean;
  onSelectNode: (id: string | null) => void;
  onAddNode: (type?: CampaignNode['type']) => void;
  onApplyArc: (arc: ArcTemplate) => void;
  onAddClue: (clue: HiddenClue) => void;
  onDeleteClue: (id: string) => void;
  onUpdateCampaign: (updates: Partial<Campaign>) => void;
  onImportFiles: (files: FileList) => Promise<void>;
  onClose: () => void;
  arcTemplates: ArcTemplate[];
}

export default function BuilderSidebar({
  campaign, selectedNodeId, isMobile, onSelectNode, onAddNode, onApplyArc,
  onAddClue, onDeleteClue, onUpdateCampaign, onImportFiles, onClose, arcTemplates,
}: BuilderSidebarProps) {
  const [showClueForm, setShowClueForm] = useState(false);
  const [newClue, setNewClue] = useState<{ type: ClueType; nodeId: string; hint: string; value: string }>({
    type: 'source-code', nodeId: '', hint: '', value: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClue = () => {
    if (!newClue.type || !newClue.nodeId || !newClue.hint || !newClue.value) return;
    const clue: HiddenClue = {
      id: `clue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: newClue.type,
      nodeId: newClue.nodeId,
      hint: newClue.hint,
      value: newClue.value,
    };
    onAddClue(clue);
    setNewClue({ type: 'source-code', nodeId: '', hint: '', value: '' });
    setShowClueForm(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="w-64 bg-stone-950 border-r border-stone-800 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 h-10 border-b border-stone-800 shrink-0">
        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Explorer</span>
        <Button data-testid="toggle-sidebar" variant="ghost" size="icon" className="h-6 w-6 text-stone-500 hover:text-stone-300" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <Tabs defaultValue="files" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-stone-900/50 border-b border-stone-800 rounded-none h-8 px-1 shrink-0 w-full justify-start">
          {['files', 'arcs', 'clues', 'meta', 'import'].map(tab => (
            <TabsTrigger key={tab} value={tab} className="text-[9px] uppercase font-bold px-2 h-6 data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-500 text-stone-500">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="files" className="mt-0 p-2 space-y-1">
            {campaign.nodes.map(node => (
              <button
                key={node.id}
                data-testid={`select-node-${node.id}`}
                onClick={() => onSelectNode(node.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${isMobile ? 'min-h-[44px]' : ''} ${
                  selectedNodeId === node.id
                    ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                    : 'text-stone-400 hover:bg-stone-900 hover:text-stone-300 border border-transparent'
                }`}
              >
                <span className="shrink-0">{NODE_TYPE_ICONS[node.type]}</span>
                <span className="text-[11px] truncate">{node.title}</span>
              </button>
            ))}
            {campaign.nodes.length === 0 && (
              <p className="text-[10px] text-stone-600 text-center py-4">No nodes yet</p>
            )}
            <Separator className="bg-stone-800 my-2" />
            <Button
              data-testid="add-node"
              variant="ghost"
              size="sm"
              className={`w-full text-stone-500 hover:text-amber-500 text-[10px] h-8 ${isMobile ? 'min-h-[44px]' : ''}`}
              onClick={() => onAddNode()}
            >
              <Plus className="w-3 h-3 mr-1" />Add Node
            </Button>
          </TabsContent>

          <TabsContent value="arcs" className="mt-0 p-2 space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {arcTemplates.map(arc => (
                <Card
                  key={arc.name}
                  data-testid={`arc-${arc.name}`}
                  className={`bg-stone-900/50 border-stone-800 cursor-pointer hover:border-amber-600/50 transition-colors ${isMobile ? 'min-h-[44px]' : ''}`}
                  onClick={() => onApplyArc(arc)}
                >
                  <CardContent className="p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-[11px] font-bold text-stone-300">{arc.name}</span>
                    </div>
                    <p className="text-[9px] text-stone-500 mb-1.5">{arc.desc}</p>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[8px] border-stone-700 text-stone-500 px-1 py-0">
                        {arc.nodes.length} nodes
                      </Badge>
                      <Badge variant="outline" className="text-[8px] border-stone-700 text-stone-500 px-1 py-0">
                        {arc.clues.length} clues
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {arcTemplates.length === 0 && (
                <p className="text-[10px] text-stone-600 text-center py-4">No arc templates available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="clues" className="mt-0 p-2 space-y-2">
            <Button
              data-testid="add-clue"
              variant="ghost"
              size="sm"
              className={`w-full text-stone-500 hover:text-amber-500 text-[10px] h-8 ${isMobile ? 'min-h-[44px]' : ''}`}
              onClick={() => setShowClueForm(!showClueForm)}
            >
              <Plus className="w-3 h-3 mr-1" />Add Hidden Clue
            </Button>

            {showClueForm && (
              <Card className="bg-stone-900/50 border-stone-800">
                <CardContent className="p-2.5 space-y-2">
                  <div>
                    <label className="text-[9px] uppercase text-stone-500 font-bold mb-1 block">Type</label>
                    <Select value={newClue.type} onValueChange={(v) => setNewClue(p => ({ ...p, type: v as ClueType }))}>
                      <SelectTrigger className="h-7 text-[10px] bg-stone-900 border-stone-800 text-stone-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-950 border-stone-800">
                        {CLUE_TYPES.map(ct => (
                          <SelectItem key={ct} value={ct} className="text-[10px] text-stone-300">
                            <span className="flex items-center gap-1.5">{CLUE_ICONS[ct]}{ct}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-stone-500 font-bold mb-1 block">Target Node</label>
                    <Select value={newClue.nodeId} onValueChange={(v) => setNewClue(p => ({ ...p, nodeId: v }))}>
                      <SelectTrigger className="h-7 text-[10px] bg-stone-900 border-stone-800 text-stone-300">
                        <SelectValue placeholder="Select node..." />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-950 border-stone-800">
                        {campaign.nodes.map(n => (
                          <SelectItem key={n.id} value={n.id} className="text-[10px] text-stone-300">{n.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-stone-500 font-bold mb-1 block">Hint</label>
                    <Input
                      value={newClue.hint}
                      onChange={(e) => setNewClue(p => ({ ...p, hint: e.target.value }))}
                      placeholder="Hint for the player..."
                      className="h-7 text-[10px] bg-stone-900 border-stone-800 text-stone-300 placeholder:text-stone-600"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-stone-500 font-bold mb-1 block">Value</label>
                    <Input
                      value={newClue.value}
                      onChange={(e) => setNewClue(p => ({ ...p, value: e.target.value }))}
                      placeholder="Hidden value..."
                      className="h-7 text-[10px] bg-stone-900 border-stone-800 text-stone-300 placeholder:text-stone-600"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-7 text-[10px] bg-amber-600 hover:bg-amber-500 text-black font-bold"
                    onClick={handleAddClue}
                  >
                    Confirm
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-1">
              {campaign.hiddenClues.map(clue => {
                const targetNode = campaign.nodes.find(n => n.id === clue.nodeId);
                return (
                  <div key={clue.id} className="flex items-start gap-2 px-2 py-1.5 rounded bg-stone-900/30 border border-stone-800/50 group">
                    <span className="shrink-0 text-amber-500/70 mt-0.5">{CLUE_ICONS[clue.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-stone-300 truncate">{clue.hint}</p>
                      <p className="text-[9px] text-stone-600 truncate">{targetNode?.title || clue.nodeId}</p>
                    </div>
                    <Button
                      data-testid={`delete-clue-${clue.id}`}
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={() => onDeleteClue(clue.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
              {campaign.hiddenClues.length === 0 && (
                <p className="text-[10px] text-stone-600 text-center py-4">No clues added yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="meta" className="mt-0 p-2 space-y-3">
            <div>
              <label className="text-[9px] uppercase text-stone-500 font-bold mb-1 block">Name</label>
              <Input
                data-testid="input-campaign-name"
                value={campaign.name}
                onChange={(e) => onUpdateCampaign({ name: e.target.value })}
                className="h-7 text-[10px] bg-stone-900 border-stone-800 text-stone-300"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase text-stone-500 font-bold mb-1 block">Description</label>
              <Textarea
                data-testid="input-campaign-desc"
                value={campaign.description}
                onChange={(e) => onUpdateCampaign({ description: e.target.value })}
                className="text-[10px] bg-stone-900 border-stone-800 text-stone-300 min-h-[60px] resize-none"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase text-stone-500 font-bold mb-1 block">Category</label>
              <Select
                value={campaign.category}
                onValueChange={(v) => onUpdateCampaign({ category: v })}
              >
                <SelectTrigger data-testid="select-category" className="h-7 text-[10px] bg-stone-900 border-stone-800 text-stone-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stone-950 border-stone-800">
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c} className="text-[10px] text-stone-300">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[9px] uppercase text-stone-500 font-bold mb-1 block">Difficulty</label>
              <Select
                value={campaign.difficulty}
                onValueChange={(v) => onUpdateCampaign({ difficulty: v })}
              >
                <SelectTrigger data-testid="select-difficulty" className="h-7 text-[10px] bg-stone-900 border-stone-800 text-stone-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stone-950 border-stone-800">
                  {DIFFICULTIES.map(d => (
                    <SelectItem key={d} value={d} className="text-[10px] text-stone-300">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[9px] uppercase text-stone-500 font-bold mb-1 block">Estimated Time</label>
              <Input
                data-testid="input-time"
                value={campaign.estimatedTime}
                onChange={(e) => onUpdateCampaign({ estimatedTime: e.target.value })}
                placeholder="e.g. 30 min"
                className="h-7 text-[10px] bg-stone-900 border-stone-800 text-stone-300 placeholder:text-stone-600"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase text-stone-500 font-bold mb-1 block">Tags (comma-separated)</label>
              <Input
                data-testid="input-tags"
                value={campaign.tags.join(', ')}
                onChange={(e) => onUpdateCampaign({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="osint, beginner, phishing"
                className="h-7 text-[10px] bg-stone-900 border-stone-800 text-stone-300 placeholder:text-stone-600"
              />
            </div>
          </TabsContent>

          <TabsContent value="import" className="mt-0 p-2 space-y-3">
            <div className="border border-dashed border-stone-700 rounded-lg p-4 text-center space-y-3">
              <Upload className="w-8 h-8 text-stone-600 mx-auto" />
              <p className="text-[10px] text-stone-500 leading-relaxed">
                Import a single .md or .json file, or select multiple .md files from an Obsidian vault folder.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.json"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                data-testid="import-files-btn"
                variant="outline"
                size="sm"
                className={`border-stone-700 text-stone-400 hover:text-amber-500 hover:border-amber-600/50 text-[10px] h-8 ${isMobile ? 'min-h-[44px]' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-3 h-3 mr-1.5" />Select Files
              </Button>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
