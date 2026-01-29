import { useState, useMemo, useCallback } from 'react';
import { extractLinkIds } from '@/components/WikiLinkInput';

export interface ClueNode {
  id: string;
  name: string;
  description: string;
  content: string;
  location: string;
  linkedTo: string[];
  linkedFrom: string[];
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  collected?: boolean;
  tags?: string[];
}

export interface ClueGraphState {
  nodes: ClueNode[];
  selectedId: string | null;
  trail: string[];
  searchQuery: string;
}

export function useClueGraph(initialClues: ClueNode[] = []) {
  const [state, setState] = useState<ClueGraphState>({
    nodes: initialClues,
    selectedId: null,
    trail: [],
    searchQuery: ''
  });

  const buildGraphFromClues = useCallback((clues: Array<{
    id: string;
    name: string;
    description: string;
    content: string;
    location: string;
    rarity?: string;
  }>, collectedIds: string[] = []) => {
    const linkMap = new Map<string, string[]>();
    const backlinkMap = new Map<string, string[]>();

    clues.forEach(clue => {
      const links = extractLinkIds(clue.content || '');
      linkMap.set(clue.id, links);
      
      links.forEach(targetId => {
        const existing = backlinkMap.get(targetId) || [];
        if (!existing.includes(clue.id)) {
          backlinkMap.set(targetId, [...existing, clue.id]);
        }
      });
    });

    const nodes: ClueNode[] = clues.map(clue => ({
      ...clue,
      linkedTo: linkMap.get(clue.id) || [],
      linkedFrom: backlinkMap.get(clue.id) || [],
      rarity: (clue.rarity as ClueNode['rarity']) || 'common',
      collected: collectedIds.includes(clue.id)
    }));

    setState(prev => ({ ...prev, nodes }));
    return nodes;
  }, []);

  const selectClue = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedId: id,
      trail: prev.trail.includes(id) 
        ? prev.trail.slice(0, prev.trail.indexOf(id) + 1)
        : [...prev.trail, id]
    }));
  }, []);

  const navigateTrail = useCallback((trail: string[]) => {
    setState(prev => ({
      ...prev,
      trail,
      selectedId: trail[trail.length - 1] || null
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const filteredNodes = useMemo(() => {
    if (!state.searchQuery) return state.nodes;
    const q = state.searchQuery.toLowerCase();
    return state.nodes.filter(node => 
      node.name.toLowerCase().includes(q) ||
      node.id.toLowerCase().includes(q) ||
      node.description?.toLowerCase().includes(q) ||
      node.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [state.nodes, state.searchQuery]);

  const selectedNode = useMemo(() => 
    state.nodes.find(n => n.id === state.selectedId) || null
  , [state.nodes, state.selectedId]);

  const getConnectedNodes = useCallback((nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return { forward: [], backward: [] };

    return {
      forward: node.linkedTo.map(id => state.nodes.find(n => n.id === id)).filter(Boolean) as ClueNode[],
      backward: node.linkedFrom.map(id => state.nodes.find(n => n.id === id)).filter(Boolean) as ClueNode[]
    };
  }, [state.nodes]);

  const getOrphanNodes = useMemo(() => 
    state.nodes.filter(n => n.linkedTo.length === 0 && n.linkedFrom.length === 0)
  , [state.nodes]);

  const getMostConnected = useMemo(() => 
    [...state.nodes].sort((a, b) => 
      (b.linkedTo.length + b.linkedFrom.length) - (a.linkedTo.length + a.linkedFrom.length)
    ).slice(0, 5)
  , [state.nodes]);

  const availableLinks = useMemo(() => 
    state.nodes.map(n => ({
      id: n.id,
      name: n.name,
      type: 'clue' as const
    }))
  , [state.nodes]);

  return {
    nodes: state.nodes,
    filteredNodes,
    selectedNode,
    selectedId: state.selectedId,
    trail: state.trail,
    searchQuery: state.searchQuery,
    buildGraphFromClues,
    selectClue,
    navigateTrail,
    setSearchQuery,
    getConnectedNodes,
    getOrphanNodes,
    getMostConnected,
    availableLinks
  };
}
