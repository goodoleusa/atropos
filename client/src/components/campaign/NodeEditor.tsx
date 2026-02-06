import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Edit3, Play, Link, GraduationCap } from 'lucide-react';
import { LEARNING_GOALS, SKILL_LEVELS, CATEGORY_COLORS } from '@/config/learningConfig';
import {
  CampaignNode, Campaign, SharedClue, NodeTypeInfo,
  FEATURE_TYPES, CAMPAIGN_TYPES, SKILL_CATEGORIES
} from './CampaignTypes';

interface NodeEditorProps {
  editingNode: CampaignNode;
  setEditingNode: (node: CampaignNode | null) => void;
  campaign: Campaign;
  sharedClues: SharedClue[];
  NODE_TYPES: NodeTypeInfo[];
  updateNode: (nodeId: string, updates: Partial<CampaignNode>) => void;
  startTestRun: (startNodeId: string) => void;
  parseWikilinks: (content: string) => string[];
  findNodeByTitle: (title: string) => CampaignNode | undefined;
  syncWikilinks: (nodeId: string, content: string) => void;
  getBacklinks: (nodeId: string) => CampaignNode[];
  getForwardLinks: (nodeId: string) => CampaignNode[];
}

export default function NodeEditor({
  editingNode,
  setEditingNode,
  campaign,
  sharedClues,
  NODE_TYPES,
  updateNode,
  startTestRun,
  parseWikilinks,
  findNodeByTitle,
  syncWikilinks,
  getBacklinks,
  getForwardLinks,
}: NodeEditorProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 max-h-[70vh] sm:relative sm:inset-auto sm:max-h-none z-50 sm:z-0 bg-[#0a0500] sm:bg-transparent sm:w-72 sm:border-l border-amber-900/30 border-t sm:border-t-0 rounded-t-2xl sm:rounded-none p-4 overflow-y-auto shadow-2xl sm:shadow-none">
      <div className="sm:hidden w-12 h-1 bg-stone-600 rounded-full mx-auto mb-3" />
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0a0500] py-2 z-10">
        <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2">
          <Edit3 className="w-4 h-4" /> Edit Node
        </h3>
        <Button size="sm" variant="ghost" onClick={() => setEditingNode(null)} className="min-h-[44px] min-w-[44px]">
          <span className="text-stone-500 text-xl">×</span>
        </Button>
      </div>

      <div className="space-y-6 pb-20 sm:pb-0">
        <Button
          size="sm"
          variant="outline"
          onClick={() => startTestRun(editingNode.id)}
          className="w-full border-teal-800 text-teal-300 hover:bg-teal-900/30 min-h-[44px]"
          data-testid="test-from-node-btn"
        >
          <Play className="w-4 h-4 mr-2" /> Playtest from this node
        </Button>
        <div>
          <label className="text-[10px] text-stone-500 uppercase">Node Type</label>
          <Select
            value={editingNode.type}
            onValueChange={(type: CampaignNode['type']) => {
              const nodeType = NODE_TYPES.find(t => t.type === type);
              setEditingNode({ ...editingNode, type, color: nodeType?.color || editingNode.color });
              updateNode(editingNode.id, { type, color: nodeType?.color || editingNode.color });
            }}
          >
            <SelectTrigger className="bg-black/50 border-stone-700 text-stone-300 min-h-[44px]" data-testid="node-type-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-stone-700">
              {NODE_TYPES.map(nt => (
                <SelectItem key={nt.type} value={nt.type} className="text-stone-300">
                  <span className="flex items-center gap-2">
                    {nt.icon} {nt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] text-stone-500 uppercase">Title</label>
          <Input
            value={editingNode.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setEditingNode({ ...editingNode, title: newTitle });
              updateNode(editingNode.id, { title: newTitle });
            }}
            className="bg-black/50 border-stone-700 text-base min-h-[44px]"
          />
        </div>

        <div>
          <label className="text-[10px] text-stone-500 uppercase">Content <span className="text-stone-600">(use [[Node Title]] for wikilinks)</span></label>
          <Textarea
            value={editingNode.content}
            onChange={(e) => {
              const newContent = e.target.value;
              setEditingNode({ ...editingNode, content: newContent });
              updateNode(editingNode.id, { content: newContent });
            }}
            onBlur={(e) => {
              syncWikilinks(editingNode.id, e.target.value);
            }}
            className="bg-black/50 border-stone-700 text-base min-h-[120px] font-mono"
            placeholder="Describe this step... Use [[Other Node]] to link"
          />
          {parseWikilinks(editingNode.content).length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="text-[9px] text-stone-600">Links:</span>
              {parseWikilinks(editingNode.content).map((link, i) => {
                const target = findNodeByTitle(link);
                return (
                  <Badge key={i} variant="outline" className={`text-[9px] ${target ? 'border-teal-700 text-teal-400' : 'border-red-700 text-red-400'}`}>
                    {target ? <Link className="w-2 h-2 mr-1" /> : '⚠'} {link}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {(() => {
          const backlinks = getBacklinks(editingNode.id);
          const forwardLinks = getForwardLinks(editingNode.id);
          if (backlinks.length === 0 && forwardLinks.length === 0) return null;
          return (
            <div className="bg-stone-900/50 rounded p-2 border border-stone-800">
              <p className="text-[10px] text-stone-500 uppercase mb-1">Links Graph</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-purple-400 text-[9px] mb-1">← Backlinks ({backlinks.length})</p>
                  {backlinks.slice(0, 5).map(n => (
                    <button key={n.id} onClick={() => setEditingNode(n)} className="block text-stone-400 hover:text-purple-400 text-[10px] truncate w-full text-left">
                      {n.title}
                    </button>
                  ))}
                </div>
                <div>
                  <p className="text-teal-400 text-[9px] mb-1">→ Forward ({forwardLinks.length})</p>
                  {forwardLinks.slice(0, 5).map(n => (
                    <button key={n.id} onClick={() => setEditingNode(n)} className="block text-stone-400 hover:text-teal-400 text-[10px] truncate w-full text-left">
                      {n.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        <div>
          <label className="text-[10px] text-stone-500 uppercase">Color</label>
          <Select
            value={editingNode.color}
            onValueChange={(color) => {
              setEditingNode({ ...editingNode, color });
              updateNode(editingNode.id, { color });
            }}
          >
            <SelectTrigger className="bg-black/50 border-stone-700 text-stone-300 min-h-[44px]" data-testid="node-color-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-stone-700">
              {[
                { value: 'amber', label: 'Amber', bg: 'bg-amber-500' },
                { value: 'teal', label: 'Teal', bg: 'bg-teal-500' },
                { value: 'purple', label: 'Purple', bg: 'bg-purple-500' },
                { value: 'stone', label: 'Stone', bg: 'bg-stone-500' }
              ].map(color => (
                <SelectItem key={color.value} value={color.value} className="text-stone-300">
                  <span className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded ${color.bg}`} />
                    {color.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-stone-500 uppercase">Feature</label>
            <Select
              value={editingNode.metadata?.featureType || ''}
              onValueChange={(value) => {
                const featureType = value as typeof FEATURE_TYPES[number];
                const newMeta = { ...editingNode.metadata, featureType };
                setEditingNode({ ...editingNode, metadata: newMeta });
                updateNode(editingNode.id, { metadata: newMeta });
              }}
            >
              <SelectTrigger className="bg-black/50 border-stone-700 text-stone-300 min-h-[44px]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-700">
                {FEATURE_TYPES.map(f => (
                  <SelectItem key={f} value={f} className="text-stone-300 capitalize">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-stone-500 uppercase">Campaign Type</label>
            <Select
              value={editingNode.metadata?.campaignType || ''}
              onValueChange={(value) => {
                const campaignType = value as typeof CAMPAIGN_TYPES[number];
                const newMeta = { ...editingNode.metadata, campaignType };
                setEditingNode({ ...editingNode, metadata: newMeta });
                updateNode(editingNode.id, { metadata: newMeta });
              }}
            >
              <SelectTrigger className="bg-black/50 border-stone-700 text-stone-300 min-h-[44px]">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-700">
                {CAMPAIGN_TYPES.map(c => (
                  <SelectItem key={c} value={c} className="text-stone-300 capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-stone-500 uppercase">Skills Required</label>
          <div className="grid grid-cols-2 gap-1 mt-1 max-h-[120px] overflow-y-auto">
            {Object.entries(SKILL_CATEGORIES).map(([cat, subskills]) => (
              <div key={cat} className="space-y-0.5">
                <p className="text-[9px] text-amber-600 uppercase">{cat}</p>
                {subskills.map(skill => {
                  const skillId = `${cat}:${skill}`;
                  const isSelected = editingNode.metadata?.skills?.includes(skillId);
                  return (
                    <button
                      key={skill}
                      onClick={() => {
                        const current = editingNode.metadata?.skills || [];
                        const newSkills = isSelected ? current.filter(s => s !== skillId) : [...current, skillId];
                        const newMeta = { ...editingNode.metadata, skills: newSkills };
                        setEditingNode({ ...editingNode, metadata: newMeta });
                        updateNode(editingNode.id, { metadata: newMeta });
                      }}
                      className={`text-[9px] px-1.5 py-0.5 rounded block w-full text-left touch-manipulation ${
                        isSelected ? 'bg-teal-900/50 text-teal-300' : 'bg-stone-800/50 text-stone-500 hover:bg-stone-800'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-stone-500 uppercase">Linked Clues (IDs)</label>
          <Select
            onValueChange={(clueId) => {
              const current = editingNode.metadata?.linkedClues || [];
              if (clueId && !current.includes(clueId)) {
                const newMeta = { ...editingNode.metadata, linkedClues: [...current, clueId] };
                setEditingNode({ ...editingNode, metadata: newMeta });
                updateNode(editingNode.id, { metadata: newMeta });
                toast({ title: "Clue linked", description: `Added ${sharedClues.find(c => c.id === clueId)?.name || clueId}` });
              }
            }}
          >
            <SelectTrigger className="bg-black/50 border-stone-700 text-stone-300 min-h-[44px]">
              <SelectValue placeholder="Select clue to link..." />
            </SelectTrigger>
            <SelectContent className="bg-stone-900 border-stone-700 max-h-[300px]">
              {sharedClues.length === 0 ? (
                <div className="p-2 text-center text-stone-500 text-xs">
                  No clues available. Add clues in Admin → Clues tab.
                </div>
              ) : (
                sharedClues.map(clue => {
                  const isLinked = editingNode.metadata?.linkedClues?.includes(clue.id);
                  return (
                    <SelectItem 
                      key={clue.id} 
                      value={clue.id} 
                      className={`text-stone-300 ${isLinked ? 'opacity-50' : ''}`}
                      disabled={isLinked}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-purple-400">🔗</span>
                        <span>{clue.name}</span>
                        {clue.tags?.length > 0 && (
                          <span className="text-[9px] text-stone-500">[{clue.tags.slice(0, 2).join(', ')}]</span>
                        )}
                        {isLinked && <span className="text-teal-400 text-[9px]">✓</span>}
                      </span>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1 mt-2">
            {editingNode.metadata?.linkedClues?.map((clueId, i) => {
              const clue = sharedClues.find(c => c.id === clueId);
              return (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-[10px] border-purple-600 text-purple-400 cursor-pointer hover:bg-red-900/30 hover:border-red-600 transition-colors flex items-center gap-1"
                  onClick={() => {
                    const newClues = editingNode.metadata?.linkedClues?.filter(c => c !== clueId) || [];
                    const newMeta = { ...editingNode.metadata, linkedClues: newClues };
                    setEditingNode({ ...editingNode, metadata: newMeta });
                    updateNode(editingNode.id, { metadata: newMeta });
                    toast({ title: "Clue unlinked", description: clue?.name || clueId });
                  }}
                  title={`Click to remove: ${clue?.description || clueId}`}
                >
                  🔗 {clue?.name || clueId} ×
                </Badge>
              );
            })}
            {(!editingNode.metadata?.linkedClues || editingNode.metadata.linkedClues.length === 0) && (
              <span className="text-stone-600 text-xs italic">No clues linked</span>
            )}
          </div>
        </div>

        {editingNode.type === 'decision' && (
          <div>
            <label className="text-[10px] text-stone-500 uppercase">Branch Condition</label>
            <Textarea
              value={editingNode.metadata?.condition || ''}
              onChange={(e) => {
                const newMeta = { ...editingNode.metadata, condition: e.target.value };
                setEditingNode({ ...editingNode, metadata: newMeta });
                updateNode(editingNode.id, { metadata: newMeta });
              }}
              placeholder="e.g., if user finds vulnerability..."
              className="bg-black/50 border-stone-700 text-xs min-h-[60px]"
            />
          </div>
        )}

        {editingNode.type === 'step' && editingNode.metadata && (
          <>
            <div>
              <label className="text-[10px] text-stone-500 uppercase">Tools for Step</label>
              <Input
                placeholder="Shodan, Censys, nmap..."
                className="bg-black/50 border-stone-700 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      const newTools = [...(editingNode.metadata?.toolsForStep || []), val];
                      setEditingNode({ 
                        ...editingNode, 
                        metadata: { ...editingNode.metadata, toolsForStep: newTools }
                      });
                      updateNode(editingNode.id, { 
                        metadata: { ...editingNode.metadata, toolsForStep: newTools }
                      });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {editingNode.metadata.toolsForStep?.map((tool, i) => (
                  <Badge key={i} variant="outline" className="text-[8px] border-amber-600 text-amber-400">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-stone-500 uppercase">Success Indicators</label>
              <Input
                placeholder="Add indicator..."
                className="bg-black/50 border-stone-700 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      const newIndicators = [...(editingNode.metadata?.successIndicators || []), val];
                      setEditingNode({ 
                        ...editingNode, 
                        metadata: { ...editingNode.metadata, successIndicators: newIndicators }
                      });
                      updateNode(editingNode.id, { 
                        metadata: { ...editingNode.metadata, successIndicators: newIndicators }
                      });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {editingNode.metadata.successIndicators?.map((ind, i) => (
                  <Badge key={i} variant="outline" className="text-[8px] border-green-600 text-green-400">
                    {ind}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-stone-800">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-stone-500">Width</label>
              <Input
                type="number"
                value={editingNode.width}
                onChange={(e) => {
                  const w = parseInt(e.target.value) || 200;
                  setEditingNode({ ...editingNode, width: w });
                  updateNode(editingNode.id, { width: w });
                }}
                className="bg-black/50 border-stone-700 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-500">Height</label>
              <Input
                type="number"
                value={editingNode.height}
                onChange={(e) => {
                  const h = parseInt(e.target.value) || 100;
                  setEditingNode({ ...editingNode, height: h });
                  updateNode(editingNode.id, { height: h });
                }}
                className="bg-black/50 border-stone-700 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-purple-900/30 pt-4">
          <div className="flex items-center gap-2 text-purple-400">
            <GraduationCap className="w-4 h-4" />
            <span className="text-xs font-bold">Learning Goals</span>
          </div>
          
          <div>
            <label className="text-[10px] text-stone-500">Skill Level for this Step</label>
            <Select
              value={editingNode.metadata?.skillLevel || 'intermediate'}
              onValueChange={(level: 'beginner' | 'intermediate' | 'advanced' | 'expert') => {
                const newMetadata = { ...editingNode.metadata, skillLevel: level };
                setEditingNode({ ...editingNode, metadata: newMetadata });
                updateNode(editingNode.id, { metadata: newMetadata });
              }}
            >
              <SelectTrigger className="bg-black/50 border-stone-700 text-xs min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-700">
                {SKILL_LEVELS.map(level => (
                  <SelectItem key={level.id} value={level.id} className="text-xs">
                    {level.name} - {level.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] text-stone-500">Learning Goals Covered</label>
            <div className="flex flex-wrap gap-1 mt-1 max-h-32 overflow-y-auto">
              {LEARNING_GOALS.map(goal => {
                const isSelected = editingNode.metadata?.learningGoals?.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => {
                      const currentGoals = editingNode.metadata?.learningGoals || [];
                      const newGoals = isSelected 
                        ? currentGoals.filter(g => g !== goal.id)
                        : [...currentGoals, goal.id];
                      const newMetadata = { ...editingNode.metadata, learningGoals: newGoals };
                      setEditingNode({ ...editingNode, metadata: newMetadata });
                      updateNode(editingNode.id, { metadata: newMetadata });
                    }}
                    className={`px-2 py-1 text-[10px] rounded border min-h-[32px] transition-colors ${
                      isSelected
                        ? CATEGORY_COLORS[goal.category] || 'bg-purple-900/50 text-purple-400 border-purple-700'
                        : 'bg-stone-900/50 text-stone-500 border-stone-700 hover:border-purple-700'
                    }`}
                  >
                    {goal.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-stone-500">Teaching Notes</label>
            <Textarea
              value={editingNode.metadata?.teachingNotes || ''}
              onChange={(e) => {
                const newMetadata = { ...editingNode.metadata, teachingNotes: e.target.value };
                setEditingNode({ ...editingNode, metadata: newMetadata });
                updateNode(editingNode.id, { metadata: newMetadata });
              }}
              placeholder="Notes for teaching this step (explanations, tips, common mistakes...)"
              className="bg-black/50 border-stone-700 text-xs min-h-[60px]"
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0500] border-t border-amber-900/30 sm:relative sm:p-0 sm:bg-transparent sm:border-0 sm:mt-6">
          <Button 
            onClick={() => setEditingNode(null)} 
            className="w-full min-h-[50px] bg-amber-700 hover:bg-amber-600 text-black font-bold"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
