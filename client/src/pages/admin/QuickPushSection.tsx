import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Zap, Map, Target, Layers, Search, ChevronRight, AlertCircle, CheckCircle, Plus, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ClueTemplate {
  id: string;
  name: string;
  description: string;
  type: 'intel' | 'artifact' | 'secret' | 'trail';
  difficulty: number;
}

const CLUE_TEMPLATES: ClueTemplate[] = [
  { id: 'intel-basic', name: 'Intel Drop', description: 'Basic intelligence document', type: 'intel', difficulty: 1 },
  { id: 'artifact-data', name: 'Data Fragment', description: 'Encrypted data piece', type: 'artifact', difficulty: 2 },
  { id: 'secret-code', name: 'Secret Code', description: 'Hidden cipher or passphrase', type: 'secret', difficulty: 3 },
  { id: 'trail-marker', name: 'Trail Marker', description: 'Breadcrumb to next clue', type: 'trail', difficulty: 1 },
  { id: 'intel-classified', name: 'Classified File', description: 'High-value classified intel', type: 'intel', difficulty: 4 },
  { id: 'artifact-hardware', name: 'Hardware Token', description: 'Physical security artifact', type: 'artifact', difficulty: 3 },
];

const LOCATION_ZONES = [
  { id: 'terminal', name: 'Terminal', icon: '💻' },
  { id: 'home', name: 'Home Page', icon: '🏠' },
  { id: 'ai-lab', name: 'AI Lab', icon: '🧠' },
  { id: 'report', name: 'Report Builder', icon: '📋' },
  { id: 'investigate', name: 'Investigation', icon: '🔍' },
  { id: 'campaign', name: 'Campaign Area', icon: '🎯' },
  { id: 'debug', name: 'Debug Page', icon: '🐛' },
];

const HIDDEN_CLUE_TYPES = [
  { value: 'source-code', label: 'HTML Source Comment' },
  { value: 'console-log', label: 'Console Log' },
  { value: 'data-attribute', label: 'Data Attribute' },
  { value: 'css-comment', label: 'CSS Comment' },
  { value: 'meta-tag', label: 'Meta Tag' },
  { value: 'base64', label: 'Base64 Encoded' },
  { value: 'hex-encoded', label: 'Hex Encoded' },
  { value: 'http-header', label: 'HTTP Header' },
  { value: 'network-request', label: 'Network Request' },
] as const;

export function QuickPushSection() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<ClueTemplate | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [customName, setCustomName] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [pushMode, setPushMode] = useState<'clue' | 'campaign-clue' | 'both'>('both');
  const [hiddenClueType, setHiddenClueType] = useState<string>('source-code');
  const [hiddenClueValue, setHiddenClueValue] = useState('');
  const [hiddenClueHint, setHiddenClueHint] = useState('');
  const [recentPushes, setRecentPushes] = useState<Array<{id: string; name: string; status: string; timestamp: string}>>([]);

  const { data: clues = [] } = useQuery({
    queryKey: ['/api/clues'],
    queryFn: async () => {
      const res = await fetch('/api/clues');
      return res.json();
    }
  });

  const { data: sharedClues = [] } = useQuery({
    queryKey: ['/api/designer/clues'],
    queryFn: async () => {
      const res = await fetch('/api/designer/clues');
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/designer/campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/designer/campaigns');
      if (!res.ok) return [];
      return res.json();
    }
  });

  const pushClueMutation = useMutation({
    mutationFn: async (clueData: any) => {
      const results: string[] = [];

      if (pushMode === 'clue' || pushMode === 'both') {
        const res = await fetch('/api/clues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: clueData.id,
            name: clueData.name,
            description: clueData.description,
            content: clueData.content,
            location: clueData.location,
            difficulty: clueData.difficulty,
          })
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to push to clues table');
        }
        results.push('clues');
      }

      if (pushMode === 'campaign-clue' || pushMode === 'both') {
        const sharedRes = await fetch(`/api/designer/clues/${clueData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clueId: clueData.id,
            name: clueData.name,
            description: clueData.description,
            content: clueData.content,
            tags: [clueData.type || 'intel', ...clueData.zones],
            difficulty: clueData.difficulty,
            category: clueData.type || 'general',
          })
        });
        if (sharedRes.ok) {
          results.push('shared-clues');
        }
      }

      return { results, clueData };
    },
    onSuccess: ({ results, clueData }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/clues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/designer/clues'] });
      const where = results.join(' + ');
      toast({ title: 'Clue Pushed', description: `"${clueData.name}" deployed to ${where} (${selectedZones.length} zones)` });
      setRecentPushes(prev => [{
        id: clueData.id,
        name: clueData.name,
        status: 'success',
        timestamp: new Date().toISOString()
      }, ...prev].slice(0, 10));
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Push Failed', description: error.message, variant: 'destructive' });
      setRecentPushes(prev => [{
        id: 'error',
        name: customName || selectedTemplate?.name || 'Unknown',
        status: 'error',
        timestamp: new Date().toISOString()
      }, ...prev].slice(0, 10));
    }
  });

  const resetForm = () => {
    setSelectedTemplate(null);
    setSelectedZones([]);
    setCustomName('');
    setCustomContent('');
    setHiddenClueValue('');
    setHiddenClueHint('');
    setDifficulty(2);
  };

  const handlePush = () => {
    if (!selectedTemplate && !customName) {
      toast({ title: 'Missing Info', description: 'Select a template or enter a custom name', variant: 'destructive' });
      return;
    }
    if (selectedZones.length === 0) {
      toast({ title: 'Missing Zones', description: 'Select at least one target zone', variant: 'destructive' });
      return;
    }

    const clueData = {
      id: `push-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: customName || selectedTemplate?.name || 'Unnamed Clue',
      description: `${selectedTemplate?.description || 'Quick pushed clue'} [Type: ${selectedTemplate?.type || 'intel'}]`,
      content: customContent || `Deployed via Quick Push to: ${selectedZones.join(', ')}`,
      location: selectedZones.join(','),
      difficulty: difficulty,
      type: selectedTemplate?.type || 'intel',
      zones: selectedZones,
      hiddenClue: hiddenClueValue ? {
        type: hiddenClueType,
        value: hiddenClueValue,
        hint: hiddenClueHint || 'Find the hidden value',
      } : null,
    };

    pushClueMutation.mutate(clueData);
  };

  const toggleZone = (zoneId: string) => {
    setSelectedZones(prev =>
      prev.includes(zoneId) ? prev.filter(z => z !== zoneId) : [...prev, zoneId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-orbitron text-amber-400 flex items-center gap-2">
          <Zap className="w-5 h-5" /> Quick Push Console
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-600 text-amber-400">
            {clues.length} Clues
          </Badge>
          <Badge variant="outline" className="border-teal-600 text-teal-400">
            {sharedClues.length} Shared
          </Badge>
          <Badge variant="outline" className="border-purple-600 text-purple-400">
            {campaigns.length} Campaigns
          </Badge>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)] pr-2">
        <div className="space-y-4">
          {/* Push Mode Selector */}
          <Card className="bg-[#0a0500] border-stone-800">
            <CardContent className="p-3">
              <Label className="text-stone-400 text-xs mb-2 block">Push Destination</Label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'both', label: 'Clues + Campaign Library', desc: 'Available everywhere' },
                  { value: 'clue', label: 'Clues Table Only', desc: 'Game clues only' },
                  { value: 'campaign-clue', label: 'Campaign Library Only', desc: 'Designer shared clues' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPushMode(opt.value as any)}
                    className={`flex-1 min-w-[120px] p-2 rounded border text-left transition-all min-h-[48px] touch-manipulation ${
                      pushMode === opt.value
                        ? 'border-amber-500 bg-amber-900/20'
                        : 'border-stone-700 hover:border-stone-600'
                    }`}
                  >
                    <p className="text-xs font-medium text-stone-300">{opt.label}</p>
                    <p className="text-[10px] text-stone-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clue Template */}
          <Card className="bg-[#0a0500] border-amber-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                <Layers className="w-4 h-4" /> Clue Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CLUE_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-3 rounded-lg border text-left transition-all min-h-[48px] touch-manipulation ${
                      selectedTemplate?.id === template.id
                        ? 'border-amber-500 bg-amber-900/20'
                        : 'border-stone-700 hover:border-stone-600'
                    }`}
                    data-testid={`template-${template.id}`}
                  >
                    <p className="text-sm font-medium text-stone-300">{template.name}</p>
                    <p className="text-[10px] text-stone-500">{template.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] border-stone-600">{template.type}</Badge>
                      <span className="text-[10px] text-amber-500">Diff: {template.difficulty}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <Label className="text-stone-400 text-xs">Name</Label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={selectedTemplate ? selectedTemplate.name : "Clue name..."}
                    className="bg-black/50 border-stone-700 mt-1 min-h-[44px]"
                    data-testid="custom-name-input"
                  />
                </div>
                <div>
                  <Label className="text-stone-400 text-xs">Content</Label>
                  <Textarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Clue content, message, or encoded data..."
                    className="bg-black/50 border-stone-700 mt-1 min-h-[80px]"
                    data-testid="custom-content-input"
                  />
                </div>
                <div>
                  <Label className="text-stone-400 text-xs">Difficulty (1-5)</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 p-2 rounded border text-xs min-h-[44px] touch-manipulation ${
                          difficulty === d ? 'border-amber-500 bg-amber-900/20 text-amber-400' : 'border-stone-700 text-stone-500'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hidden Clue Embed (for campaigns) */}
          {(pushMode === 'campaign-clue' || pushMode === 'both') && (
            <Card className="bg-[#0a0500] border-teal-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-teal-500 text-sm font-mono flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Hidden Clue Embed (Campaign Pages)
                </CardTitle>
                <CardDescription className="text-stone-500 text-xs">
                  Optionally embed a hidden value in campaign web pages (source code, console, headers, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-stone-400 text-xs">Hide Method</Label>
                  <Select value={hiddenClueType} onValueChange={setHiddenClueType}>
                    <SelectTrigger className="bg-black/50 border-stone-700 mt-1 min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0500] border-stone-700">
                      {HIDDEN_CLUE_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-stone-400 text-xs">Hidden Value</Label>
                  <Input
                    value={hiddenClueValue}
                    onChange={(e) => setHiddenClueValue(e.target.value)}
                    placeholder="FLAG{secret_value} or any hidden string..."
                    className="bg-black/50 border-stone-700 mt-1 min-h-[44px] font-mono text-teal-400"
                  />
                </div>
                <div>
                  <Label className="text-stone-400 text-xs">Player Hint</Label>
                  <Input
                    value={hiddenClueHint}
                    onChange={(e) => setHiddenClueHint(e.target.value)}
                    placeholder="Check the page source..."
                    className="bg-black/50 border-stone-700 mt-1 min-h-[44px]"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Target Zones */}
          <Card className="bg-[#0a0500] border-teal-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-teal-500 text-sm font-mono flex items-center gap-2">
                <Map className="w-4 h-4" /> Target Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LOCATION_ZONES.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => toggleZone(zone.id)}
                    className={`p-2 rounded-lg border flex items-center gap-2 transition-all min-h-[48px] touch-manipulation ${
                      selectedZones.includes(zone.id)
                        ? 'border-teal-500 bg-teal-900/20'
                        : 'border-stone-700 hover:border-stone-600'
                    }`}
                    data-testid={`zone-${zone.id}`}
                  >
                    <span className="text-lg">{zone.icon}</span>
                    <span className="text-xs text-stone-300">{zone.name}</span>
                  </button>
                ))}
              </div>
              {selectedZones.length > 0 && (
                <p className="text-xs text-teal-400 mt-2">Deploying to: {selectedZones.join(', ')}</p>
              )}
            </CardContent>
          </Card>

          {/* Push Button */}
          <Button
            onClick={handlePush}
            disabled={pushClueMutation.isPending || (!selectedTemplate && !customName) || selectedZones.length === 0}
            className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold py-6 min-h-[56px] touch-manipulation"
            data-testid="push-clue-button"
          >
            <Send className="w-5 h-5 mr-2" />
            {pushClueMutation.isPending ? 'Pushing...' : `Push Clue to ${selectedZones.length || 0} Zone(s)`}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Recent Pushes */}
          {recentPushes.length > 0 && (
            <Card className="bg-[#0a0500] border-stone-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-stone-400 text-xs font-mono">Recent Pushes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentPushes.map((push, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-1.5 bg-stone-950/50 rounded">
                      {push.status === 'success' ? (
                        <CheckCircle className="w-3 h-3 text-teal-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                      )}
                      <span className="text-stone-400 truncate flex-1">{push.name}</span>
                      <span className="text-stone-600 text-[10px] shrink-0">{new Date(push.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Clues */}
          <Card className="bg-[#0a0500] border-stone-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-stone-400 text-xs font-mono flex items-center justify-between">
                <span>Existing Clues ({clues.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clues.length === 0 ? (
                <p className="text-stone-600 text-xs text-center py-4">No clues yet. Push your first one above.</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {clues.slice(0, 20).map((clue: any) => (
                    <div key={clue.id} className="flex items-center justify-between text-xs p-2 bg-stone-950/50 rounded">
                      <div className="min-w-0 flex-1">
                        <span className="text-amber-400 font-mono">{clue.name}</span>
                        <span className="text-stone-600 ml-2">{clue.location}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] border-stone-700 shrink-0">
                        Diff: {clue.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
