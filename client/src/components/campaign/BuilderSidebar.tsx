import React, { useState, useRef } from 'react';
import {
  Campaign, CampaignNode, HiddenClue, ClueType, ArcTemplate, TerminalMission, CATEGORIES, DIFFICULTIES, uid
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
  FileCode, Network, Code2, Terminal, Eye, Globe, Lock, Bug, EyeOff, Edit3
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
  onAddTerminalMission?: (mission: TerminalMission) => void;
  onUpdateTerminalMission?: (id: string, updates: Partial<TerminalMission>) => void;
  onDeleteTerminalMission?: (id: string) => void;
}

export default function BuilderSidebar({
  campaign, selectedNodeId, isMobile, onSelectNode, onAddNode, onApplyArc,
  onAddClue, onDeleteClue, onUpdateCampaign, onImportFiles, onClose, arcTemplates,
  onAddTerminalMission, onUpdateTerminalMission, onDeleteTerminalMission,
}: BuilderSidebarProps) {
  const [showClueForm, setShowClueForm] = useState(false);
  const [newClue, setNewClue] = useState<{ type: ClueType; nodeId: string; hint: string; value: string }>({
    type: 'source-code', nodeId: '', hint: '', value: '',
  });
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [newMission, setNewMission] = useState({ name: '', command: '', description: '', expectedOutput: '', hint: '', xpReward: 50, triggerNodeId: '', toolsRequired: '' });
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
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
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between px-3 h-10 border-b border-border shrink-0">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Explorer</span>
        <Button data-testid="toggle-sidebar" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <Tabs defaultValue="files" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-card/50 border-b border-border rounded-none h-8 px-1 shrink-0 w-full justify-start flex-wrap">
          {['files', 'arcs', 'clues', 'missions', 'meta', 'import'].map(tab => (
            <TabsTrigger key={tab} value={tab} className={`text-[9px] uppercase font-bold px-2 h-6 data-[state=active]:text-amber-500 text-muted-foreground ${tab === 'missions' ? 'data-[state=active]:bg-teal-600/20 data-[state=active]:text-teal-400' : 'data-[state=active]:bg-amber-600/20'}`}>
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
                    ? 'bg-amber-600/20 text-amber-800 border border-amber-600/30'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground border border-transparent'
                }`}
              >
                <span className="shrink-0">{NODE_TYPE_ICONS[node.type]}</span>
                <span className="text-[11px] truncate">{node.title}</span>
              </button>
            ))}
            {campaign.nodes.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-4">No nodes yet</p>
            )}
            <Separator className="bg-border my-2" />
            <Button
              data-testid="add-node"
              variant="ghost"
              size="sm"
              className={`w-full text-muted-foreground hover:text-amber-500 text-[10px] h-8 ${isMobile ? 'min-h-[44px]' : ''}`}
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
                  className={`bg-card/50 border-border cursor-pointer hover:border-amber-600/50 transition-colors ${isMobile ? 'min-h-[44px]' : ''}`}
                  onClick={() => onApplyArc(arc)}
                >
                  <CardContent className="p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3 h-3 text-amber-800" />
                      <span className="text-[11px] font-bold text-foreground">{arc.name}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mb-1.5">{arc.desc}</p>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[8px] border-border text-muted-foreground px-1 py-0">
                        {arc.nodes.length} nodes
                      </Badge>
                      <Badge variant="outline" className="text-[8px] border-border text-muted-foreground px-1 py-0">
                        {arc.clues.length} clues
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {arcTemplates.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-4">No arc templates available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="clues" className="mt-0 p-2 space-y-2">
            <Button
              data-testid="add-clue"
              variant="ghost"
              size="sm"
              className={`w-full text-muted-foreground hover:text-amber-500 text-[10px] h-8 ${isMobile ? 'min-h-[44px]' : ''}`}
              onClick={() => setShowClueForm(!showClueForm)}
            >
              <Plus className="w-3 h-3 mr-1" />Add Hidden Clue
            </Button>

            {showClueForm && (
              <Card className="bg-card/50 border-border">
                <CardContent className="p-2.5 space-y-2">
                  <div>
                    <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Type</label>
                    <Select value={newClue.type} onValueChange={(v) => setNewClue(p => ({ ...p, type: v as ClueType }))}>
                      <SelectTrigger className="h-7 text-[10px] bg-card border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {CLUE_TYPES.map(ct => (
                          <SelectItem key={ct} value={ct} className="text-[10px] text-foreground">
                            <span className="flex items-center gap-1.5">{CLUE_ICONS[ct]}{ct}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Target Node</label>
                    <Select value={newClue.nodeId} onValueChange={(v) => setNewClue(p => ({ ...p, nodeId: v }))}>
                      <SelectTrigger className="h-7 text-[10px] bg-card border-border text-foreground">
                        <SelectValue placeholder="Select node..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {campaign.nodes.map(n => (
                          <SelectItem key={n.id} value={n.id} className="text-[10px] text-foreground">{n.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Hint</label>
                    <Input
                      value={newClue.hint}
                      onChange={(e) => setNewClue(p => ({ ...p, hint: e.target.value }))}
                      placeholder="Hint for the player..."
                      className="h-7 text-[10px] bg-card border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Value</label>
                    <Input
                      value={newClue.value}
                      onChange={(e) => setNewClue(p => ({ ...p, value: e.target.value }))}
                      placeholder="Hidden value..."
                      className="h-7 text-[10px] bg-card border-border text-foreground placeholder:text-muted-foreground"
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
                  <div key={clue.id} className="flex items-start gap-2 px-2 py-1.5 rounded bg-card/30 border border-border/50 group">
                    <span className="shrink-0 text-amber-800/70 mt-0.5">{CLUE_ICONS[clue.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-foreground truncate">{clue.hint}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{targetNode?.title || clue.nodeId}</p>
                    </div>
                    <Button
                      data-testid={`delete-clue-${clue.id}`}
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={() => onDeleteClue(clue.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
              {campaign.hiddenClues.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-4">No clues added yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="missions" className="mt-0 p-2 space-y-2">
            <Button
              data-testid="add-terminal-mission"
              variant="ghost"
              size="sm"
              className={`w-full text-muted-foreground hover:text-teal-500 text-[10px] h-8 ${isMobile ? 'min-h-[44px]' : ''}`}
              onClick={() => {
                setShowMissionForm(!showMissionForm);
                setEditingMissionId(null);
                setNewMission({ name: '', command: '', description: '', expectedOutput: '', hint: '', xpReward: 50, triggerNodeId: '', toolsRequired: '' });
              }}
            >
              <Plus className="w-3 h-3 mr-1" />Add Terminal Mission
            </Button>

            {!showMissionForm && (
              <div className="space-y-1">
                <p className="text-[8px] uppercase text-muted-foreground font-bold px-1">Quick Templates</p>
                {[
                  { name: 'Port Scan', command: 'nmap -sV target.local', description: 'Scan target for open ports and services', xpReward: 50, toolsRequired: 'nmap' },
                  { name: 'DNS Lookup', command: 'dig target.local ANY', description: 'Enumerate DNS records for the target domain', xpReward: 30, toolsRequired: 'dig' },
                  { name: 'WHOIS Recon', command: 'whois target.local', description: 'Retrieve domain registration information', xpReward: 25, toolsRequired: 'whois' },
                  { name: 'Directory Brute', command: 'gobuster dir -u http://target.local -w wordlist.txt', description: 'Discover hidden directories and files', xpReward: 75, toolsRequired: 'gobuster' },
                  { name: 'Packet Capture', command: 'tcpdump -i eth0 -w capture.pcap', description: 'Capture network traffic for analysis', xpReward: 60, toolsRequired: 'tcpdump' },
                  { name: 'Hash Crack', command: 'hashcat -m 0 hash.txt rockyou.txt', description: 'Crack password hashes using wordlist', xpReward: 100, toolsRequired: 'hashcat' },
                ].map((preset) => (
                  <Button
                    key={preset.name}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-[9px] h-6 text-muted-foreground hover:text-teal-400 hover:bg-teal-900/10 px-2"
                    onClick={() => {
                      setNewMission({
                        name: preset.name,
                        command: preset.command,
                        description: preset.description,
                        expectedOutput: '',
                        hint: '',
                        xpReward: preset.xpReward,
                        triggerNodeId: '',
                        toolsRequired: preset.toolsRequired,
                      });
                      setEditingMissionId(null);
                      setShowMissionForm(true);
                    }}
                    data-testid={`preset-mission-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Terminal className="w-3 h-3 mr-1.5 text-teal-700" />
                    {preset.name}
                    <Badge variant="outline" className="ml-auto text-[7px] border-amber-800/30 text-amber-800 px-1 py-0">{preset.xpReward} XP</Badge>
                  </Button>
                ))}
              </div>
            )}

            {showMissionForm && (
              <Card className="bg-card/50 border-teal-800/30">
                <CardContent className="p-2.5 space-y-2">
                  <div>
                    <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Mission Name</label>
                    <Input
                      data-testid="mission-name"
                      value={newMission.name}
                      onChange={(e) => setNewMission(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Ghost Recon"
                      className="h-7 text-[10px] bg-card border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Command</label>
                    <Input
                      data-testid="mission-command"
                      value={newMission.command}
                      onChange={(e) => setNewMission(p => ({ ...p, command: e.target.value }))}
                      placeholder="e.g. scan --deep target.corp"
                      className="h-7 text-[10px] bg-card border-border text-teal-800 font-mono placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Description</label>
                    <Textarea
                      data-testid="mission-desc"
                      value={newMission.description}
                      onChange={(e) => setNewMission(p => ({ ...p, description: e.target.value }))}
                      placeholder="What the player should do..."
                      className="text-[10px] bg-card border-border text-foreground min-h-[40px] resize-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Expected Output (optional)</label>
                    <Textarea
                      data-testid="mission-output"
                      value={newMission.expectedOutput}
                      onChange={(e) => setNewMission(p => ({ ...p, expectedOutput: e.target.value }))}
                      placeholder="What the terminal should show..."
                      className="text-[10px] bg-card border-border text-foreground min-h-[40px] resize-none font-mono placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Hint (optional)</label>
                    <Input
                      data-testid="mission-hint"
                      value={newMission.hint}
                      onChange={(e) => setNewMission(p => ({ ...p, hint: e.target.value }))}
                      placeholder="Hint for stuck players..."
                      className="h-7 text-[10px] bg-card border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">XP Reward</label>
                      <Input
                        data-testid="mission-xp"
                        type="number"
                        value={newMission.xpReward}
                        onChange={(e) => setNewMission(p => ({ ...p, xpReward: parseInt(e.target.value) || 0 }))}
                        className="h-7 text-[10px] bg-card border-border text-amber-800 font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Trigger Node</label>
                      <Select value={newMission.triggerNodeId} onValueChange={(v) => setNewMission(p => ({ ...p, triggerNodeId: v }))}>
                        <SelectTrigger className="h-7 text-[10px] bg-card border-border text-foreground">
                          <SelectValue placeholder="Optional..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="none" className="text-[10px] text-muted-foreground">None</SelectItem>
                          {campaign.nodes.map(n => (
                            <SelectItem key={n.id} value={n.id} className="text-[10px] text-foreground">{n.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Required Tools (comma-separated)</label>
                    <Input
                      data-testid="mission-tools"
                      value={newMission.toolsRequired}
                      onChange={(e) => setNewMission(p => ({ ...p, toolsRequired: e.target.value }))}
                      placeholder="e.g. nmap, whois, dig"
                      className="h-7 text-[10px] bg-card border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button
                    data-testid="confirm-mission"
                    size="sm"
                    className="w-full h-7 text-[10px] bg-teal-600 hover:bg-teal-500 text-black font-bold"
                    onClick={() => {
                      if (!newMission.name || !newMission.command) return;
                      const mission: TerminalMission = {
                        id: editingMissionId || `mission-${uid()}`,
                        name: newMission.name,
                        command: newMission.command,
                        description: newMission.description,
                        expectedOutput: newMission.expectedOutput || undefined,
                        hint: newMission.hint || undefined,
                        xpReward: newMission.xpReward,
                        triggerNodeId: newMission.triggerNodeId === 'none' ? undefined : newMission.triggerNodeId || undefined,
                        toolsRequired: newMission.toolsRequired ? newMission.toolsRequired.split(',').map(t => t.trim()).filter(Boolean) : undefined,
                      };
                      if (editingMissionId) {
                        onUpdateTerminalMission?.(editingMissionId, mission);
                      } else {
                        onAddTerminalMission?.(mission);
                      }
                      setNewMission({ name: '', command: '', description: '', expectedOutput: '', hint: '', xpReward: 50, triggerNodeId: '', toolsRequired: '' });
                      setShowMissionForm(false);
                      setEditingMissionId(null);
                    }}
                  >
                    {editingMissionId ? 'Update Mission' : 'Add Mission'}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-1">
              {(campaign.terminalMissions || []).map(mission => {
                const triggerNode = mission.triggerNodeId ? campaign.nodes.find(n => n.id === mission.triggerNodeId) : null;
                return (
                  <div key={mission.id} className="px-2 py-2 rounded bg-card/30 border border-teal-800/20 group">
                    <div className="flex items-start gap-2">
                      <Terminal className="w-3.5 h-3.5 text-teal-800 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-foreground font-bold truncate">{mission.name}</p>
                        <code className="text-[9px] text-teal-600 font-mono block truncate">$ {mission.command}</code>
                        {mission.description && <p className="text-[9px] text-muted-foreground truncate mt-0.5">{mission.description}</p>}
                        <div className="flex gap-1.5 mt-1">
                          <Badge variant="outline" className="text-[7px] border-amber-800/30 text-amber-800 px-1 py-0">
                            {mission.xpReward} XP
                          </Badge>
                          {triggerNode && (
                            <Badge variant="outline" className="text-[7px] border-border text-muted-foreground px-1 py-0">
                              @ {triggerNode.title}
                            </Badge>
                          )}
                          {mission.toolsRequired?.map(t => (
                            <Badge key={t} variant="outline" className="text-[7px] border-teal-800/30 text-teal-600 px-1 py-0">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-amber-400"
                          onClick={() => {
                            setEditingMissionId(mission.id);
                            setNewMission({
                              name: mission.name,
                              command: mission.command,
                              description: mission.description,
                              expectedOutput: mission.expectedOutput || '',
                              hint: mission.hint || '',
                              xpReward: mission.xpReward,
                              triggerNodeId: mission.triggerNodeId || '',
                              toolsRequired: mission.toolsRequired?.join(', ') || '',
                            });
                            setShowMissionForm(true);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-red-400"
                          onClick={() => onDeleteTerminalMission?.(mission.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!campaign.terminalMissions || campaign.terminalMissions.length === 0) && (
                <div className="text-center py-4 space-y-2">
                  <Terminal className="w-6 h-6 text-muted-foreground mx-auto" />
                  <p className="text-[10px] text-muted-foreground">No terminal missions yet</p>
                  <p className="text-[9px] text-muted-foreground">Add commands, tools, and objectives that players execute in the terminal</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="meta" className="mt-0 p-2 space-y-3">
            <div>
              <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Name</label>
              <Input
                data-testid="input-campaign-name"
                value={campaign.name}
                onChange={(e) => onUpdateCampaign({ name: e.target.value })}
                className="h-7 text-[10px] bg-card border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Description</label>
              <Textarea
                data-testid="input-campaign-desc"
                value={campaign.description}
                onChange={(e) => onUpdateCampaign({ description: e.target.value })}
                className="text-[10px] bg-card border-border text-foreground min-h-[60px] resize-none"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Category</label>
              <Select
                value={campaign.category}
                onValueChange={(v) => onUpdateCampaign({ category: v })}
              >
                <SelectTrigger data-testid="select-category" className="h-7 text-[10px] bg-card border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c} className="text-[10px] text-foreground">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Difficulty</label>
              <Select
                value={campaign.difficulty}
                onValueChange={(v) => onUpdateCampaign({ difficulty: v })}
              >
                <SelectTrigger data-testid="select-difficulty" className="h-7 text-[10px] bg-card border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {DIFFICULTIES.map(d => (
                    <SelectItem key={d} value={d} className="text-[10px] text-foreground">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Estimated Time</label>
              <Input
                data-testid="input-time"
                value={campaign.estimatedTime}
                onChange={(e) => onUpdateCampaign({ estimatedTime: e.target.value })}
                placeholder="e.g. 30 min"
                className="h-7 text-[10px] bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase text-muted-foreground font-bold mb-1 block">Tags (comma-separated)</label>
              <Input
                data-testid="input-tags"
                value={campaign.tags.join(', ')}
                onChange={(e) => onUpdateCampaign({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="osint, beginner, phishing"
                className="h-7 text-[10px] bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </TabsContent>

          <TabsContent value="import" className="mt-0 p-2 space-y-3">
            <div className="border border-dashed border-border rounded-lg p-4 text-center space-y-3">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
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
                className={`border-border text-muted-foreground hover:text-amber-500 hover:border-amber-600/50 text-[10px] h-8 ${isMobile ? 'min-h-[44px]' : ''}`}
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
