import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Play, CheckCircle2, Lock, Eye, EyeOff,
  Terminal, Globe, Search, Flag, Award, ArrowRight, Lightbulb,
  FileCode, Network, Code2, Bug, Shield, Zap, Sparkles
} from 'lucide-react';
import { useGame } from '@/hooks/useGameSession';

interface CampaignNode {
  id: string;
  type: 'step' | 'decision' | 'tool' | 'output' | 'folder';
  title: string;
  content: string;
  htmlContent?: string;
  pageLayout?: 'card' | 'full-page' | 'terminal' | 'dossier' | 'split';
  customCss?: string;
  x: number; y: number; width: number; height: number;
  color: string;
  children?: string[];
  metadata?: {
    toolsForStep?: string[];
    questions?: string[];
    successIndicators?: string[];
    redFlags?: string[];
    featureType?: string;
    campaignType?: string;
    skillLevel?: string;
  };
}

interface CampaignLink {
  id: string; source: string; target: string;
  label?: string; condition?: string; color: string;
}

interface HiddenClue {
  id: string;
  type: 'source-code' | 'network-request' | 'http-header' | 'console-log' | 'css-comment' | 'data-attribute' | 'meta-tag' | 'base64' | 'hex-encoded' | 'steganography';
  nodeId: string;
  hint: string;
  value: string;
}

interface CampaignData {
  campaignId: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedTime: string;
  nodes: CampaignNode[];
  links: CampaignLink[];
  rootNodes: string[];
  hiddenClues: HiddenClue[];
  tags: string[];
}

const NODE_ICONS: Record<string, any> = {
  step: <Play className="w-4 h-4" />,
  decision: <Search className="w-4 h-4" />,
  tool: <Terminal className="w-4 h-4" />,
  output: <Flag className="w-4 h-4" />,
  folder: <Globe className="w-4 h-4" />,
};

const COLOR_ACCENTS: Record<string, string> = {
  amber: 'border-amber-600 bg-amber-950/20 text-amber-400',
  teal: 'border-teal-600 bg-teal-950/20 text-teal-400',
  purple: 'border-purple-600 bg-purple-950/20 text-purple-400',
  stone: 'border-stone-600 bg-stone-900/20 text-stone-400',
};

const CLUE_TYPE_ICONS: Record<string, { icon: any; label: string; tip: string }> = {
  'source-code': { icon: <FileCode className="w-3.5 h-3.5" />, label: 'Source Code', tip: 'Right-click → View Page Source (Ctrl+U)' },
  'network-request': { icon: <Network className="w-3.5 h-3.5" />, label: 'Network Request', tip: 'DevTools → Network tab → Watch for XHR requests' },
  'http-header': { icon: <Code2 className="w-3.5 h-3.5" />, label: 'HTTP Header', tip: 'DevTools → Network → Click request → Headers tab' },
  'console-log': { icon: <Terminal className="w-3.5 h-3.5" />, label: 'Console', tip: 'DevTools → Console tab (F12 or Ctrl+Shift+I)' },
  'css-comment': { icon: <Eye className="w-3.5 h-3.5" />, label: 'CSS Comment', tip: 'DevTools → Elements → Inspect styles' },
  'data-attribute': { icon: <Code2 className="w-3.5 h-3.5" />, label: 'Data Attribute', tip: 'DevTools → Elements → Inspect element attributes' },
  'meta-tag': { icon: <Globe className="w-3.5 h-3.5" />, label: 'Meta Tag', tip: 'View source → Look in <head> section' },
  'base64': { icon: <Lock className="w-3.5 h-3.5" />, label: 'Base64 Encoded', tip: 'Use atob() in console or a decoder' },
  'hex-encoded': { icon: <Bug className="w-3.5 h-3.5" />, label: 'Hex Encoded', tip: 'Decode hex string byte-by-byte' },
  'steganography': { icon: <EyeOff className="w-3.5 h-3.5" />, label: 'Hidden in Image', tip: 'Use stego tools to extract' },
};

export default function CampaignPlayer() {
  const params = useParams<{ campaignId: string }>();
  const campaignId = params.campaignId;
  const [, navigate] = useLocation();
  const { gameState, awardXP } = useGame();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [foundClues, setFoundClues] = useState<Set<string>>(new Set());
  const [clueInput, setClueInput] = useState('');
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [beaconFired, setBeaconFired] = useState<Set<string>>(new Set());
  const [runId, setRunId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [clueRevealEffect, setClueRevealEffect] = useState<{ type: string; id: string } | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; angle: number; speed: number; size: number; color: string; delay: number }>>([]);
  const [screenFlash, setScreenFlash] = useState(false);

  useEffect(() => {
    if (!campaignId) return;
    setLoading(true);
    fetch(`/api/campaigns/${campaignId}/play`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setCampaign(data);
          const startNode = data.rootNodes?.[0] || data.nodes?.[0]?.id;
          if (startNode) {
            setCurrentNodeId(startNode);
            setVisitedNodes(new Set([startNode]));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [campaignId]);

  const currentNode = useMemo(() => {
    if (!campaign || !currentNodeId) return null;
    return campaign.nodes.find(n => n.id === currentNodeId) || null;
  }, [campaign, currentNodeId]);

  const outgoingLinks = useMemo(() => {
    if (!campaign || !currentNodeId) return [];
    return campaign.links.filter(l => l.source === currentNodeId);
  }, [campaign, currentNodeId]);

  const nextNodes = useMemo(() => {
    if (!campaign) return [];
    return outgoingLinks.map(l => ({
      link: l,
      node: campaign.nodes.find(n => n.id === l.target),
    })).filter(x => x.node) as { link: CampaignLink; node: CampaignNode }[];
  }, [campaign, outgoingLinks]);

  const nodeClues = useMemo(() => {
    if (!campaign || !currentNodeId) return [];
    return campaign.hiddenClues.filter(c => c.nodeId === currentNodeId);
  }, [campaign, currentNodeId]);

  const totalClues = campaign?.hiddenClues?.length || 0;
  const progress = campaign ? (visitedNodes.size / campaign.nodes.length) * 100 : 0;

  const syncCheckpoint = useCallback(async (nodeId: string, visited: string[], clues: string[], isComplete = false) => {
    if (!campaignId) return;
    try {
      const progressPct = campaign ? (visited.length / campaign.nodes.length) * 100 : 0;
      const res = await fetch('/api/gameplay/campaign-checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: gameState.sessionToken,
          campaignId,
          runId,
          currentNodeId: nodeId,
          visitedNodes: visited,
          foundClues: clues,
          progress: Math.round(progressPct),
          isComplete,
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.run?.runId && !runId) {
          setRunId(data.run.runId);
        }
      }
    } catch (err) {
      console.error('Failed to sync campaign checkpoint:', err);
    }
  }, [campaignId, campaign, gameState.sessionToken, runId]);

  const navigateToNode = useCallback((nodeId: string) => {
    setCurrentNodeId(nodeId);
    setVisitedNodes(prev => {
      const next = new Set([...prev, nodeId]);
      syncCheckpoint(nodeId, Array.from(next), Array.from(foundClues));
      return next;
    });
    setClueInput('');
    contentRef.current?.scrollTo(0, 0);
  }, [syncCheckpoint, foundClues]);

  const fireBeacon = useCallback(async () => {
    if (!campaignId || !currentNodeId || beaconFired.has(currentNodeId)) return;
    setBeaconFired(prev => new Set([...prev, currentNodeId]));
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/hidden-beacon?nodeId=${currentNodeId}`);
      const headers: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        if (key.startsWith('x-nexus')) headers[key] = val;
      });
      if (Object.keys(headers).length > 0) {
        toast({
          title: "Beacon Intercepted",
          description: `Found ${Object.keys(headers).length} hidden header(s). Check Network tab!`,
        });
      }
    } catch {}
  }, [campaignId, currentNodeId, beaconFired]);

  useEffect(() => {
    if (!currentNode || !nodeClues.length) return;
    const consoleClues = nodeClues.filter(c => c.type === 'console-log');
    consoleClues.forEach(clue => {
      console.log(`%c${clue.value}`, 'color: #d97706; font-weight: bold; font-size: 14px; background: #0a0500; padding: 4px 8px; border-left: 3px solid #d97706;');
    });
    const networkClues = nodeClues.filter(c => c.type === 'network-request');
    if (networkClues.length > 0) {
      fireBeacon();
    }
  }, [currentNodeId, nodeClues, fireBeacon, currentNode]);

  const triggerClueReveal = useCallback((clueType: string, clueId: string) => {
    setClueRevealEffect({ type: clueType, id: clueId });
    setScreenFlash(true);
    setTimeout(() => setScreenFlash(false), 300);

    const clueColors: Record<string, string> = {
      'source-code': '#d97706', 'network-request': '#14b8a6', 'http-header': '#8b5cf6',
      'console-log': '#f59e0b', 'css-comment': '#06b6d4', 'data-attribute': '#ec4899',
      'meta-tag': '#10b981', 'base64': '#ef4444', 'hex-encoded': '#f97316', 'steganography': '#6366f1',
    };
    const color = clueColors[clueType] || '#d97706';
    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: Date.now() + i,
      x: 50 + Math.random() * 20 - 10,
      y: 50 + Math.random() * 20 - 10,
      angle: (i / 24) * 360 + Math.random() * 15,
      speed: 2 + Math.random() * 4,
      size: 3 + Math.random() * 5,
      color,
      delay: Math.random() * 0.15,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1500);
    setTimeout(() => setClueRevealEffect(null), 2000);
  }, []);

  const checkClueAnswer = useCallback(async () => {
    if (!clueInput.trim() || !campaignId || !currentNodeId) return;
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/clue-check?nodeId=${currentNodeId}&answer=${encodeURIComponent(clueInput.trim())}`);
      const data = await res.json();
      if (data.found) {
        setFoundClues(prev => new Set([...prev, data.clueId]));
        const clue = nodeClues.find(c => c.id === data.clueId);
        triggerClueReveal(clue?.type || 'source-code', data.clueId);
        toast({
          title: "Intelligence Captured!",
          description: `${data.flag} - ${data.hint}`,
        });
        setClueInput('');
      } else {
        toast({ title: "Not quite...", description: "That's not the hidden value. Keep investigating!" });
      }
    } catch {}
  }, [clueInput, campaignId, currentNodeId, nodeClues, triggerClueReveal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0500] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 font-mono text-sm">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign || !currentNode) {
    return (
      <div className="min-h-screen bg-[#0a0500] flex items-center justify-center">
        <Card className="bg-stone-950 border-red-900/50 max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-red-400 font-mono text-lg mb-2">Campaign Not Found</h2>
            <p className="text-stone-500 text-sm mb-4">This campaign doesn't exist or hasn't been published yet.</p>
            <Button onClick={() => navigate('/campaigns')} className="bg-amber-700 hover:bg-amber-600">
              Browse Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isComplete = currentNode.type === 'output' && nextNodes.length === 0;

  useEffect(() => {
    if (isComplete && campaignId && currentNodeId) {
      syncCheckpoint(currentNodeId, Array.from(visitedNodes), Array.from(foundClues), true);
    }
  }, [isComplete, campaignId, currentNodeId, visitedNodes, foundClues, syncCheckpoint]);

  return (
    <div className="min-h-screen bg-[#0a0500] text-stone-300">
      {nodeClues.filter(c => c.type === 'source-code').map(clue => (
        <div key={clue.id} dangerouslySetInnerHTML={{ __html: `<!-- ${clue.value} -->` }} style={{ display: 'none' }} />
      ))}
      {nodeClues.filter(c => c.type === 'css-comment').map(clue => (
        <style key={clue.id} dangerouslySetInnerHTML={{ __html: `${clue.value}` }} />
      ))}
      {nodeClues.filter(c => c.type === 'data-attribute').map(clue => (
        <div key={clue.id} data-nexus-intel={clue.value} data-clue-type={clue.type} style={{ display: 'none' }} />
      ))}
      {nodeClues.filter(c => c.type === 'meta-tag').map(clue => (
        <div key={clue.id} data-meta-debug={clue.value} style={{ display: 'none' }} />
      ))}
      {nodeClues.filter(c => c.type === 'base64').map(clue => (
        <div key={clue.id} data-encoded-payload={clue.value} data-encoding="base64" style={{ display: 'none' }} />
      ))}
      {nodeClues.filter(c => c.type === 'hex-encoded').map(clue => (
        <div key={clue.id} data-hex-dump={clue.value} data-encoding="hex" style={{ display: 'none' }} />
      ))}

      <AnimatePresence>
        {screenFlash && (
          <motion.div
            className="fixed inset-0 z-[100] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(217,119,6,0.15) 0%, transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {clueRevealEffect && (
          <motion.div
            className="fixed inset-0 z-[99] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="w-20 h-20 rounded-full bg-amber-900/30 border-2 border-amber-500/50 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-400/30"
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-teal-400/20"
                animate={{ scale: [1, 3], opacity: [0.4, 0] }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="fixed z-[101] pointer-events-none rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color, left: `${p.x}%`, top: `${p.y}%` }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(p.angle * Math.PI / 180) * p.speed * 80,
              y: Math.sin(p.angle * Math.PI / 180) * p.speed * 80,
              opacity: 0,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 + Math.random() * 0.5, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      <div className="sticky top-0 z-30 bg-[#0a0500]/95 border-b border-amber-900/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/campaigns')}
                className="text-stone-500 hover:text-amber-400 shrink-0 min-h-[44px] min-w-[44px] touch-manipulation"
                data-testid="back-to-campaigns"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-amber-500 font-mono text-xs sm:text-sm font-bold truncate" data-testid="campaign-title">{campaign.name}</h1>
                <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                  <Badge variant="outline" className="border-stone-700 text-stone-500 text-[9px] sm:text-[10px]">{campaign.category}</Badge>
                  <Badge variant="outline" className="border-stone-700 text-stone-500 text-[9px] sm:text-[10px]">{campaign.difficulty}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-[10px] text-stone-600">CLUES</p>
                <p className="text-amber-400 font-mono text-sm">{foundClues.size}/{totalClues}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-stone-600">PROGRESS</p>
                <p className="text-teal-400 font-mono text-sm">{Math.round(progress)}%</p>
              </div>
            </div>
          </div>
          <div className="mt-2 h-1 bg-stone-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-teal-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="flex max-w-5xl mx-auto">
        <div className="hidden md:block w-48 shrink-0 border-r border-stone-800/50 p-3 sticky top-[85px] h-[calc(100vh-85px)]">
          <p className="text-[10px] text-stone-600 uppercase tracking-wider mb-2">Navigation</p>
          <ScrollArea className="h-[calc(100vh-130px)]">
            <div className="space-y-1">
              {campaign.nodes.map(node => {
                const isVisited = visitedNodes.has(node.id);
                const isCurrent = node.id === currentNodeId;
                const hasClue = campaign.hiddenClues.some(c => c.nodeId === node.id);
                const clueFound = campaign.hiddenClues.filter(c => c.nodeId === node.id).every(c => foundClues.has(c.id));
                return (
                  <button
                    key={node.id}
                    onClick={() => isVisited ? navigateToNode(node.id) : null}
                    disabled={!isVisited}
                    className={`w-full text-left p-2 rounded text-xs flex items-center gap-2 transition-all ${
                      isCurrent ? 'bg-amber-900/30 text-amber-400 border border-amber-700' :
                      isVisited ? 'text-stone-400 hover:bg-stone-800/50 cursor-pointer' :
                      'text-stone-700 cursor-not-allowed'
                    }`}
                    data-testid={`nav-node-${node.id}`}
                  >
                    {isVisited ? (
                      <CheckCircle2 className={`w-3 h-3 shrink-0 ${isCurrent ? 'text-amber-400' : 'text-teal-600'}`} />
                    ) : (
                      <Lock className="w-3 h-3 shrink-0 text-stone-700" />
                    )}
                    <span className="truncate flex-1">{node.title}</span>
                    {hasClue && (
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${clueFound ? 'bg-teal-500' : 'bg-amber-500 animate-pulse'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 min-w-0" ref={contentRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNodeId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-3 sm:p-4 md:p-8 max-w-3xl mx-auto pb-20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg border ${COLOR_ACCENTS[currentNode.color] || COLOR_ACCENTS.stone}`}>
                  {NODE_ICONS[currentNode.type] || NODE_ICONS.step}
                </div>
                <div>
                  <h2 className="text-xl font-mono font-bold text-stone-200" data-testid="node-title">{currentNode.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-500 capitalize">{currentNode.type}</Badge>
                    {currentNode.metadata?.featureType && (
                      <Badge variant="outline" className="text-[10px] border-teal-800 text-teal-500">{currentNode.metadata.featureType}</Badge>
                    )}
                    {currentNode.metadata?.skillLevel && (
                      <Badge variant="outline" className="text-[10px] border-purple-800 text-purple-500">{currentNode.metadata.skillLevel}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {currentNode.htmlContent ? (
                <div className={`mb-6 ${
                  currentNode.pageLayout === 'full-page' ? '' :
                  currentNode.pageLayout === 'terminal' ? 'bg-black border border-amber-900/40 rounded-lg font-mono text-sm' :
                  currentNode.pageLayout === 'dossier' ? 'bg-stone-950 border-2 border-amber-800/50 rounded-none' :
                  currentNode.pageLayout === 'split' ? 'grid md:grid-cols-2 gap-4' :
                  'bg-stone-950/50 border border-stone-800 rounded-lg'
                }`}>
                  {currentNode.customCss && (
                    <style dangerouslySetInnerHTML={{ __html: currentNode.customCss }} />
                  )}
                  <div
                    className={`campaign-page-content ${
                      currentNode.pageLayout === 'terminal' ? 'p-4 text-amber-400' :
                      currentNode.pageLayout === 'dossier' ? 'p-6' :
                      currentNode.pageLayout === 'full-page' ? '' :
                      'p-6'
                    }`}
                    dangerouslySetInnerHTML={{ __html: currentNode.htmlContent }}
                    data-campaign-node={currentNode.id}
                    data-page-layout={currentNode.pageLayout || 'card'}
                  />
                </div>
              ) : (
                <Card className="bg-stone-950/50 border-stone-800 mb-6">
                  <CardContent className="p-6">
                    <div className="prose prose-invert prose-sm max-w-none">
                      {currentNode.content.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <h3 key={i} className="text-amber-500 font-mono text-lg mb-2">{line.replace(/\*\*/g, '')}</h3>;
                        }
                        if (line.startsWith('> ')) {
                          return <blockquote key={i} className="border-l-2 border-amber-700 pl-3 text-stone-500 italic my-2">{line.slice(2)}</blockquote>;
                        }
                        if (line.startsWith('- ') || line.startsWith('→ ')) {
                          return <li key={i} className="text-stone-300 ml-4 list-disc my-1">{line.slice(2)}</li>;
                        }
                        if (line.match(/^\d+\./)) {
                          return <li key={i} className="text-stone-300 ml-4 list-decimal my-1">{line.replace(/^\d+\.\s*/, '')}</li>;
                        }
                        if (line.startsWith('⚠️')) {
                          return <p key={i} className="text-amber-400 bg-amber-900/10 border border-amber-900/30 rounded p-2 my-2 text-xs">{line}</p>;
                        }
                        if (line.trim() === '') return <br key={i} />;
                        return <p key={i} className="text-stone-300 my-1">{line}</p>;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentNode.metadata?.toolsForStep && currentNode.metadata.toolsForStep.length > 0 && (
                <Card className="bg-teal-950/10 border-teal-900/30 mb-6">
                  <CardContent className="p-4">
                    <p className="text-teal-500 text-xs font-mono mb-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> TOOLS FOR THIS STEP
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentNode.metadata.toolsForStep.map(tool => (
                        <Badge key={tool} variant="outline" className="border-teal-800 text-teal-400 text-xs">{tool}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {nodeClues.length > 0 && (
                <Card className="bg-amber-950/10 border-amber-900/30 mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                      <Search className="w-4 h-4" /> Hidden Intelligence ({nodeClues.filter(c => foundClues.has(c.id)).length}/{nodeClues.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {nodeClues.map(clue => {
                      const isFound = foundClues.has(clue.id);
                      const justRevealed = clueRevealEffect?.id === clue.id;
                      const typeInfo = CLUE_TYPE_ICONS[clue.type] || CLUE_TYPE_ICONS['source-code'];
                      const showHint = showHints[clue.id];
                      return (
                        <motion.div
                          key={clue.id}
                          layout
                          className={`p-3 rounded border relative overflow-hidden transition-colors duration-500 ${
                            isFound
                              ? 'border-teal-700 bg-teal-950/20'
                              : 'border-stone-800 bg-stone-950/30'
                          }`}
                          animate={justRevealed ? { 
                            borderColor: ['#d97706', '#14b8a6', '#14b8a6'],
                            boxShadow: ['0 0 20px rgba(217,119,6,0.4)', '0 0 30px rgba(20,184,166,0.3)', '0 0 0px transparent'],
                          } : {}}
                          transition={justRevealed ? { duration: 1.5 } : {}}
                          data-testid={`clue-${clue.id}`}
                        >
                          {justRevealed && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-transparent"
                              initial={{ x: '-100%' }}
                              animate={{ x: '200%' }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          )}
                          <div className="flex items-center justify-between relative">
                            <div className="flex items-center gap-2">
                              <motion.span
                                className={isFound ? 'text-teal-400' : 'text-amber-500'}
                                animate={justRevealed ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
                                transition={{ duration: 0.5 }}
                              >
                                {typeInfo.icon}
                              </motion.span>
                              <span className={`text-xs font-mono ${isFound ? 'text-teal-400' : 'text-stone-400'}`}>{typeInfo.label}</span>
                              {isFound && (
                                <motion.span
                                  initial={justRevealed ? { scale: 0 } : { scale: 1 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                                </motion.span>
                              )}
                            </div>
                            {!isFound && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowHints(prev => ({ ...prev, [clue.id]: !prev[clue.id] }))}
                                className="text-stone-600 hover:text-amber-400 h-6 px-2 text-[10px]"
                              >
                                <Lightbulb className="w-3 h-3 mr-1" /> {showHint ? 'Hide' : 'Hint'}
                              </Button>
                            )}
                          </div>
                          <AnimatePresence>
                            {showHint && !isFound && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-2 text-xs overflow-hidden"
                              >
                                <p className="text-amber-400/80 mb-1">{clue.hint}</p>
                                <p className="text-stone-600">{typeInfo.tip}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {isFound && (
                            <motion.p
                              initial={justRevealed ? { opacity: 0, y: 10 } : {}}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              className="mt-1 text-teal-400/70 text-[10px] font-mono break-all"
                            >
                              FLAG{'{'}captured{'}'}
                            </motion.p>
                          )}
                        </motion.div>
                      );
                    })}

                    {nodeClues.some(c => !foundClues.has(c.id)) && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={clueInput}
                          onChange={(e) => setClueInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && checkClueAnswer()}
                          placeholder="Enter discovered value..."
                          className="bg-black/30 border-stone-700 text-stone-300 text-xs sm:text-sm flex-1 min-h-[44px]"
                          data-testid="clue-input"
                        />
                        <Button
                          size="sm"
                          onClick={checkClueAnswer}
                          disabled={!clueInput.trim()}
                          className="bg-amber-700 hover:bg-amber-600 text-xs min-h-[44px] min-w-[44px] touch-manipulation"
                          data-testid="submit-clue"
                        >
                          <Flag className="w-3 h-3 mr-1" /> Submit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {isComplete ? (
                <Card className="bg-gradient-to-br from-amber-950/30 to-teal-950/30 border-amber-700">
                  <CardContent className="p-8 text-center">
                    <Award className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-amber-400 font-mono text-xl mb-2">Campaign Complete</h3>
                    <p className="text-stone-400 text-sm mb-2">
                      You found {foundClues.size} of {totalClues} hidden clues.
                    </p>
                    <p className="text-stone-500 text-xs mb-6">
                      Visited {visitedNodes.size} of {campaign.nodes.length} nodes.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => {
                          const startNode = campaign.rootNodes?.[0] || campaign.nodes?.[0]?.id;
                          if (startNode) {
                            setCurrentNodeId(startNode);
                            setVisitedNodes(new Set([startNode]));
                            setFoundClues(new Set());
                            setBeaconFired(new Set());
                          }
                        }}
                        variant="outline"
                        className="border-stone-700 text-stone-400"
                        data-testid="replay-campaign"
                      >
                        Replay
                      </Button>
                      <Button
                        onClick={() => navigate('/campaigns')}
                        className="bg-amber-700 hover:bg-amber-600"
                        data-testid="browse-more"
                      >
                        More Campaigns
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <p className="text-stone-600 text-xs font-mono uppercase tracking-wider">
                    {currentNode.type === 'decision' ? 'Choose your path' : 'Continue investigation'}
                  </p>
                  {nextNodes.map(({ link, node }) => (
                    <button
                      key={link.id}
                      onClick={() => navigateToNode(node.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all hover:scale-[1.01] active:scale-[0.99] min-h-[56px] touch-manipulation ${
                        COLOR_ACCENTS[node.color] || COLOR_ACCENTS.stone
                      } hover:brightness-125`}
                      data-testid={`next-node-${node.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {NODE_ICONS[node.type] || NODE_ICONS.step}
                          <div>
                            <p className="font-mono text-sm font-medium">{node.title}</p>
                            {link.label && (
                              <p className="text-[10px] text-stone-500 mt-0.5">{link.label}</p>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-600" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {visitedNodes.size > 1 && (
                <div className="mt-8 pt-4 border-t border-stone-800/50">
                  <p className="text-stone-700 text-[10px] font-mono mb-2">TRAIL</p>
                  <div className="flex flex-wrap items-center gap-1">
                    {Array.from(visitedNodes).map((nid, i) => {
                      const n = campaign.nodes.find(x => x.id === nid);
                      return (
                        <span key={nid} className="flex items-center">
                          {i > 0 && <ChevronRight className="w-3 h-3 text-stone-800 mx-0.5" />}
                          <button
                            onClick={() => navigateToNode(nid)}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              nid === currentNodeId ? 'bg-amber-900/30 text-amber-400' : 'text-stone-600 hover:text-stone-400'
                            }`}
                          >
                            {n?.title || nid.slice(0, 6)}
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
