import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import {
  FolderTree, FileText, Plus, Trash2, Edit3, Link2, Copy, Save, ChevronDown
} from 'lucide-react';
import { Campaign, CampaignNode, NodeTypeInfo, RelationType } from './CampaignTypes';

interface CampaignSidebarProps {
  campaign: Campaign;
  selectedNode: string | null;
  setSelectedNode: (id: string | null) => void;
  setEditingNode: (node: CampaignNode | null) => void;
  linkingFrom: string | null;
  setLinkingFrom: (id: string | null) => void;
  showFileTree: boolean;
  setShowFileTree: (show: boolean) => void;
  savedCampaigns: Campaign[];
  isUnsaved: boolean;
  isSyncing: boolean;
  NODE_TYPES: NodeTypeInfo[];
  linkQuery: string;
  setLinkQuery: (q: string) => void;
  showLinkSuggestions: boolean;
  setShowLinkSuggestions: (show: boolean) => void;
  linkQueryResults: CampaignNode[];
  CAMPAIGN_TEMPLATES: { id: string; name: string; icon: string; difficulty: string }[];
  saveCampaign: () => void;
  loadCampaign: (id: string) => void;
  deleteCampaign: (id: string) => void;
  duplicateCampaign: (id: string) => void;
  createFromTemplate: (id: string) => void;
  addNode: (type: string, parentId?: string) => void;
  deleteNode: (nodeId: string) => void;
  createLink: (sourceId: string, targetId: string, relation?: RelationType) => void;
}

export default function CampaignSidebar({
  campaign,
  selectedNode,
  setSelectedNode,
  setEditingNode,
  linkingFrom,
  setLinkingFrom,
  showFileTree,
  setShowFileTree,
  savedCampaigns,
  isUnsaved,
  isSyncing,
  NODE_TYPES,
  linkQuery,
  setLinkQuery,
  showLinkSuggestions,
  setShowLinkSuggestions,
  linkQueryResults,
  CAMPAIGN_TEMPLATES,
  saveCampaign,
  loadCampaign,
  deleteCampaign,
  duplicateCampaign,
  createFromTemplate,
  addNode,
  deleteNode,
  createLink,
}: CampaignSidebarProps) {
  return (
    <>
      <button
        onClick={() => setShowFileTree(!showFileTree)}
        className="sm:hidden flex items-center justify-between w-full p-3 bg-card/80 border-b border-amber-900/30 text-amber-500"
        data-testid="mobile-file-tree-toggle"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <FolderTree className="w-4 h-4" />
          {campaign.name || 'Select Campaign'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showFileTree ? 'rotate-180' : ''}`} />
      </button>

      <div className={`border-b sm:border-b-0 sm:border-r border-amber-900/30 p-2 sm:p-3 shrink-0 sm:w-[200px] bg-card/50 transition-all ${showFileTree ? 'max-h-[200px] sm:max-h-none' : 'max-h-0 sm:max-h-none overflow-hidden sm:overflow-visible'}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-amber-500 uppercase tracking-wider font-bold flex items-center gap-1">
            <FolderTree className="w-3 h-3" /> Campaigns
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="p-0 h-8 w-8 text-amber-400 hover:text-amber-300 touch-manipulation" data-testid="new-campaign-btn">
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-amber-900/50">
              <DropdownMenuLabel className="text-amber-500 text-xs">Quick Start</DropdownMenuLabel>
              {CAMPAIGN_TEMPLATES.map(t => (
                <DropdownMenuItem key={t.id} onClick={() => createFromTemplate(t.id)} className="text-foreground hover:bg-amber-900/30 min-h-[44px] touch-manipulation" data-testid={`template-${t.id}`}>
                  <span className="mr-2">{t.icon}</span> {t.name}
                  <Badge variant="outline" className="ml-auto text-[9px] border-border text-muted-foreground">{t.difficulty}</Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ScrollArea className="h-[120px] sm:h-[200px]">
          <div className="space-y-1">
            {savedCampaigns.length === 0 ? (
              <p className="text-muted-foreground text-xs text-center py-4">No saved campaigns</p>
            ) : (
              savedCampaigns.map(c => (
                <div 
                  key={c.id}
                  className={`group flex items-center gap-1 p-1.5 rounded cursor-pointer text-xs transition-all ${
                    c.id === campaign.id 
                      ? 'bg-amber-900/40 text-amber-300' 
                      : 'hover:bg-border text-muted-foreground'
                  }`}
                  onClick={() => loadCampaign(c.id)}
                  data-testid={`campaign-file-${c.id}`}
                >
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="truncate flex-1">{c.name}</span>
                  <div className="hidden group-hover:flex gap-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); duplicateCampaign(c.id); }}
                      className="p-0.5 hover:text-teal-400"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteCampaign(c.id); }}
                      className="p-0.5 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="border-t border-border mt-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={saveCampaign}
            disabled={isSyncing}
            className={`w-full justify-start text-xs min-h-[36px] ${
              isSyncing
                ? 'border-teal-600 text-teal-400'
                : isUnsaved 
                  ? 'border-amber-600 text-amber-400 animate-pulse' 
                  : 'border-border text-muted-foreground'
            }`}
            data-testid="save-campaign-btn"
          >
            {isSyncing ? (
              <div className="w-3 h-3 mr-1.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3 h-3 mr-1.5" />
            )}
            {isSyncing ? 'Syncing...' : isUnsaved ? 'Save*' : 'Saved'}
          </Button>
        </div>
      </div>

      <div className="border-b sm:border-b-0 sm:border-r border-amber-900/30 p-2 sm:p-3 shrink-0">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Add Node</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowFileTree(!showFileTree)}
            className="p-0 h-5 w-5 text-muted-foreground hover:text-amber-400 sm:hidden"
            title="Toggle File Tree"
          >
            <FolderTree className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex sm:flex-col gap-1.5 sm:gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
          {NODE_TYPES.map(nt => {
            const buttonStyles: Record<string, string> = {
              amber: 'border-amber-800 text-amber-400 hover:bg-amber-950/30',
              purple: 'border-purple-800 text-purple-400 hover:bg-purple-950/30',
              teal: 'border-teal-800 text-teal-400 hover:bg-teal-950/30',
              stone: 'border-border text-muted-foreground hover:bg-card/30'
            };
            return (
              <Button
                key={nt.type}
                size="sm"
                variant="outline"
                onClick={() => addNode(nt.type)}
                className={`justify-center sm:justify-start min-h-[44px] min-w-[44px] sm:min-w-[90px] px-2 sm:px-3 text-xs ${buttonStyles[nt.color] || buttonStyles.stone}`}
                data-testid={`add-node-${nt.type}`}
              >
                {nt.icon}
                <span className="ml-1.5 hidden sm:inline">{nt.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="border-t border-border mt-2 pt-2 hidden sm:block">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Actions</p>
          {linkingFrom && (
            <Badge className="bg-teal-900 text-teal-400 text-[10px] mb-2">
              Linking mode: Click target node
            </Badge>
          )}
          {selectedNode && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const node = campaign.nodes.find(n => n.id === selectedNode);
                  if (node) setEditingNode(node);
                }}
                className="w-full justify-start text-xs border-border text-muted-foreground mb-1"
              >
                <Edit3 className="w-3 h-3 mr-2" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLinkingFrom(selectedNode)}
                className="w-full justify-start text-xs border-teal-700 text-teal-400 mb-1"
              >
                <Link2 className="w-3 h-3 mr-2" /> Link From
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteNode(selectedNode)}
                className="w-full justify-start text-xs border-purple-700 text-purple-400"
              >
                <Trash2 className="w-3 h-3 mr-2" /> Delete
              </Button>
            </>
          )}
        </div>

        <div className="border-t border-border mt-2 pt-2 hidden sm:block">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Link by Query</p>
          <div className="relative">
            <Input
              value={linkQuery}
              onChange={(e) => {
                setLinkQuery(e.target.value);
                setShowLinkSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => linkQuery && setShowLinkSuggestions(true)}
              onBlur={() => setTimeout(() => setShowLinkSuggestions(false), 200)}
              placeholder="[[name]] @type: #tool:"
              className="bg-black/30 border-border text-foreground text-xs h-8"
              data-testid="link-query-input"
            />
            {showLinkSuggestions && linkQueryResults.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg max-h-32 overflow-auto">
                {linkQueryResults.slice(0, 5).map(node => (
                  <button
                    key={node.id}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-border flex items-center gap-2"
                    onClick={() => {
                      if (selectedNode && selectedNode !== node.id) {
                        createLink(selectedNode, node.id);
                        setLinkQuery('');
                        setShowLinkSuggestions(false);
                      } else {
                        setSelectedNode(node.id);
                        setLinkQuery('');
                        setShowLinkSuggestions(false);
                      }
                    }}
                  >
                    <span className={`w-2 h-2 rounded-full bg-${node.color}-500`} />
                    <span className="text-foreground truncate">{node.title}</span>
                    <span className="text-muted-foreground text-[10px]">@{node.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground mt-1">
            [[name]] @type:step #tool:nmap
          </p>
        </div>
      </div>
    </>
  );
}
