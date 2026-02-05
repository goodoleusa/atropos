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
import { Send, Zap, Map, Target, Layers, Search, Filter, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AGENT_CAMPAIGNS } from "@/config/agentCampaigns";

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

export function QuickPushSection() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<ClueTemplate | null>(null);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [customName, setCustomName] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const { data: clues = [] } = useQuery({
    queryKey: ['/api/clues'],
    queryFn: async () => {
      const res = await fetch('/api/clues');
      return res.json();
    }
  });

  const pushClueMutation = useMutation({
    mutationFn: async (clueData: any) => {
      const res = await fetch('/api/clues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clueData)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create clue');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clues'] });
      toast({ title: 'Clue Pushed', description: `Deployed to ${selectedZones.length} zones` });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Push Failed', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setSelectedTemplate(null);
    setSelectedZones([]);
    setSelectedCampaigns([]);
    setCustomName('');
    setCustomContent('');
  };

  const handlePush = () => {
    if (!selectedTemplate && !customName) {
      toast({ title: 'Error', description: 'Select a template or enter custom name', variant: 'destructive' });
      return;
    }
    if (selectedZones.length === 0) {
      toast({ title: 'Error', description: 'Select at least one zone', variant: 'destructive' });
      return;
    }

    const clueData = {
      id: `push-${Date.now()}`,
      name: customName || selectedTemplate?.name || 'Unnamed Clue',
      description: `${selectedTemplate?.description || 'Quick pushed clue'}${selectedCampaigns.length > 0 ? ` [Campaigns: ${selectedCampaigns.join(', ')}]` : ''} [Type: ${selectedTemplate?.type || 'intel'}]`,
      content: customContent || `Deployed via Quick Push to: ${selectedZones.join(', ')}`,
      location: selectedZones.join(','),
      difficulty: selectedTemplate?.difficulty || 2,
    };

    pushClueMutation.mutate(clueData);
  };

  const toggleZone = (zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) ? prev.filter(z => z !== zoneId) : [...prev, zoneId]
    );
  };

  const toggleCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId) ? prev.filter(c => c !== campaignId) : [...prev, campaignId]
    );
  };

  const filteredCampaigns = AGENT_CAMPAIGNS.filter(c => 
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.tags.some(tag => tag.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-amber-400 flex items-center gap-2">
          <Zap className="w-5 h-5" /> Quick Push Console
        </h3>
        <Badge variant="outline" className="border-amber-600 text-amber-400">
          {clues.length} Total Clues
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)] pr-4">
        <div className="space-y-6">
          <Card className="bg-[#0a0500] border-amber-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                <Layers className="w-4 h-4" /> Clue Template
              </CardTitle>
              <CardDescription className="text-stone-500 text-xs">
                Select a pre-built template or customize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CLUE_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-amber-500 bg-amber-900/20'
                        : 'border-stone-700 hover:border-stone-600'
                    }`}
                    data-testid={`template-${template.id}`}
                  >
                    <p className="text-sm font-medium text-stone-300">{template.name}</p>
                    <p className="text-xs text-stone-500">{template.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] border-stone-600">
                        {template.type}
                      </Badge>
                      <span className="text-[10px] text-amber-500">★{template.difficulty}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <Label className="text-stone-400 text-xs">Custom Name (optional)</Label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Override template name..."
                    className="bg-black/50 border-stone-700 mt-1"
                    data-testid="custom-name-input"
                  />
                </div>
                <div>
                  <Label className="text-stone-400 text-xs">Custom Content</Label>
                  <Textarea
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Clue content or message..."
                    className="bg-black/50 border-stone-700 mt-1 min-h-[80px]"
                    data-testid="custom-content-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0500] border-teal-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-teal-500 text-sm font-mono flex items-center gap-2">
                <Map className="w-4 h-4" /> Target Zones
              </CardTitle>
              <CardDescription className="text-stone-500 text-xs">
                Where should this clue appear?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LOCATION_ZONES.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => toggleZone(zone.id)}
                    className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
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
                <p className="text-xs text-teal-400 mt-2">
                  Selected: {selectedZones.join(', ')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#0a0500] border-purple-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-500 text-sm font-mono flex items-center gap-2">
                <Target className="w-4 h-4" /> Link to Campaigns
              </CardTitle>
              <CardDescription className="text-stone-500 text-xs">
                Optional: Associate with investigation campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <Input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter campaigns..."
                  className="pl-9 bg-black/50 border-stone-700"
                  data-testid="campaign-search"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredCampaigns.slice(0, 8).map(campaign => (
                  <div
                    key={campaign.id}
                    className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-all ${
                      selectedCampaigns.includes(campaign.id)
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-stone-700 hover:border-stone-600'
                    }`}
                    onClick={() => toggleCampaign(campaign.id)}
                    data-testid={`campaign-${campaign.id}`}
                  >
                    <Checkbox 
                      checked={selectedCampaigns.includes(campaign.id)}
                      className="border-stone-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-300 truncate">{campaign.name}</p>
                      <p className="text-xs text-stone-500">{campaign.tags.slice(0, 2).join(', ')}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {campaign.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handlePush}
            disabled={pushClueMutation.isPending}
            className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold py-6"
            data-testid="push-clue-button"
          >
            <Send className="w-5 h-5 mr-2" />
            {pushClueMutation.isPending ? 'Pushing...' : `Push Clue to ${selectedZones.length} Zone(s)`}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
