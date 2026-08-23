import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  FolderTree, FileText, Play, Pause, ChevronRight, GitBranch, Layers, Download,
  Key, Eye
} from 'lucide-react';
import { Campaign, CampaignNode, NodeTypeInfo } from './CampaignTypes';

interface CampaignToolbarProps {
  campaign: Campaign;
  setCampaign: React.Dispatch<React.SetStateAction<Campaign>>;
  mode: 'tree' | 'graph';
  setMode: (mode: 'tree' | 'graph') => void;
  viewMode: 'canvas' | 'story' | 'tree' | 'clues' | 'overview';
  setViewMode: (mode: 'canvas' | 'story' | 'tree' | 'clues' | 'overview') => void;
  testRunMode: boolean;
  selectedNode: string | null;
  setSelectedNode: (id: string | null) => void;
  testStartNode: string | null;
  breadcrumbTrail: string[];
  startTestRun: (startNodeId: string) => void;
  stopTestRun: (status?: "paused" | "completed" | "abandoned") => void;
  exportCampaignJSON: () => void;
  exportCampaignObsidian: () => void;
}

export default function CampaignToolbar({
  campaign,
  setCampaign,
  mode,
  setMode,
  viewMode,
  setViewMode,
  testRunMode,
  selectedNode,
  setSelectedNode,
  testStartNode,
  breadcrumbTrail,
  startTestRun,
  stopTestRun,
  exportCampaignJSON,
  exportCampaignObsidian,
}: CampaignToolbarProps) {
  return (
    <div className="flex flex-col gap-2 mt-2 sm:mt-3">
      <Input
        value={campaign.name}
        onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
        className="bg-transparent border-border text-foreground text-sm min-h-[44px]"
        placeholder="Campaign name..."
      />
      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
        <Button
          size="sm"
          variant={mode === 'tree' ? 'default' : 'outline'}
          onClick={() => setMode('tree')}
          className={`min-h-[44px] min-w-[44px] px-3 ${mode === 'tree' ? 'bg-amber-700 text-black' : 'border-border text-muted-foreground'}`}
        >
          <FolderTree className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Tree</span>
        </Button>
        <Button
          size="sm"
          variant={mode === 'graph' ? 'default' : 'outline'}
          onClick={() => setMode('graph')}
          className={`min-h-[44px] min-w-[44px] px-3 ${mode === 'graph' ? 'bg-purple-700 text-white' : 'border-border text-muted-foreground'}`}
        >
          <GitBranch className="w-4 h-4" />
          <span className="ml-1 hidden sm:inline">Graph</span>
        </Button>
        <Select
          value=""
          onValueChange={(format) => {
            if (format === 'json') exportCampaignJSON();
            else if (format === 'obsidian') exportCampaignObsidian();
          }}
        >
          <SelectTrigger className="border-amber-800 text-amber-400 min-h-[44px] min-w-[44px] w-auto px-2 bg-transparent" data-testid="export-dropdown">
            <Download className="w-4 h-4" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="json" className="text-foreground min-h-[44px]">
              Export JSON
            </SelectItem>
            <SelectItem value="obsidian" className="text-foreground min-h-[44px]">
              Export Obsidian (Dataview/Breadcrumbs)
            </SelectItem>
          </SelectContent>
        </Select>
        <Button 
          size="sm" 
          variant={testRunMode ? 'default' : 'outline'} 
          onClick={() => {
            if (!testRunMode) {
              const startNode =
                selectedNode ||
                testStartNode ||
                campaign.rootNodes[0] ||
                campaign.nodes[0]?.id;

              if (!startNode) {
                toast({ title: "No nodes to test", description: "Add a node before starting test mode." });
                return;
              }

              startTestRun(startNode);
            } else {
              stopTestRun();
            }
          }}
          className={`min-h-[44px] min-w-[44px] px-3 ${testRunMode ? 'bg-teal-700 text-white' : 'border-teal-800 text-teal-400'}`}
          disabled={campaign.nodes.length === 0}
          data-testid="test-run-btn"
        >
          {testRunMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="ml-1 hidden sm:inline">{testRunMode ? 'Stop' : 'Test'}</span>
        </Button>
        <div className="border-l border-border h-6 mx-1" />
        {(['story', 'canvas', 'clues', 'overview'] as const).map(v => (
          <Button
            key={v}
            size="sm"
            variant={viewMode === v ? 'default' : 'ghost'}
            onClick={() => setViewMode(v)}
            className={`min-h-[44px] px-2 capitalize ${viewMode === v ? 'bg-cyan-800 text-white' : 'text-muted-foreground'}`}
          >
            {v === 'story' ? <FileText className="w-4 h-4" /> : v === 'canvas' ? <Layers className="w-4 h-4" /> : v === 'clues' ? <Key className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="ml-1 hidden sm:inline text-xs">{v}</span>
          </Button>
        ))}
      </div>
      {breadcrumbTrail.length > 0 && viewMode === 'canvas' && (
        <div className="flex items-center gap-1 text-xs mt-2 flex-wrap">
          <span className="text-muted-foreground">Path:</span>
          {breadcrumbTrail.map((nodeId, i) => {
            const node = campaign.nodes.find(n => n.id === nodeId);
            return (
              <span key={nodeId} className="flex items-center">
                {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />}
                <button
                  onClick={() => setSelectedNode(nodeId)}
                  className={`px-1.5 py-0.5 rounded ${nodeId === selectedNode ? 'bg-amber-900/50 text-amber-400' : 'bg-border/50 text-muted-foreground hover:bg-border'}`}
                >
                  {node?.title || nodeId.slice(0, 8)}
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
