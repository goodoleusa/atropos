import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Trophy, 
  Terminal, 
  Plus, 
  Map,
  QrCode,
  Server,
  Database,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  MessageSquare,
  Settings,
  Edit,
  Trash2,
  Save,
  Bug,
  BookOpen,
  Eye,
  EyeOff,
  Rocket,
  Target,
  ExternalLink,
  Play,
  FileText,
  Bot,
  ChevronRight,
  ChevronDown,
  Folder,
  File
} from "lucide-react";
import { CHAOS_MESSAGES, MYSTICAL_CARDS, TOAST_MESSAGES, UI_TEXT, TERMINAL_MESSAGES } from "@/config/messages";
import { AGENT_CAMPAIGNS, CAMPAIGN_CATEGORIES, getDifficultyColor, type Campaign } from "@/config/agentCampaigns";
import { useGame } from "@/hooks/useGameSession";
import { ContentSearch, type SearchableItem, type ContentType } from "@/components/ContentSearch";
import { WikiLinkInput, extractLinkIds } from "@/components/WikiLinkInput";
import { ClueGraph } from "@/components/ClueGraph";
import { ClueBreadcrumbs } from "@/components/ClueBreadcrumbs";
import { ApiPlayground } from "@/components/ApiPlayground";
import CampaignDesigner from "@/components/CampaignDesigner";

interface Clue {
  id: string;
  name: string;
  description: string;
  content: string;
  location: string;
  difficulty: number;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  requiredClues: string[];
  reward: string | null;
  unlocks: string | null;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { gameState, toggleDevMode } = useGame();
  const [newClue, setNewClue] = useState<Partial<Clue>>({});
  const [newQuest, setNewQuest] = useState<Partial<Quest>>({});
  const [clueDialogOpen, setClueDialogOpen] = useState(false);
  const [questDialogOpen, setQuestDialogOpen] = useState(false);
  const [apiPlaygroundOpen, setApiPlaygroundOpen] = useState(false);
  const [campaignDesignerOpen, setCampaignDesignerOpen] = useState(false);
  const [editingClue, setEditingClue] = useState<Clue | null>(null);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'root': true });
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const [clueTrail, setClueTrail] = useState<string[]>([]);
  const [showGraphView, setShowGraphView] = useState(false);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (data: any, path: string = 'root') => {
    if (typeof data !== 'object' || data === null) {
      return (
        <div className="flex items-center gap-2 py-1 pl-6">
          <File className="w-3 h-3 text-stone-600" />
          <span className="text-stone-400 text-xs">{String(data)}</span>
        </div>
      );
    }

    return Object.entries(data).map(([key, value]) => {
      const currentPath = `${path}.${key}`;
      const isExpanded = expandedNodes[currentPath];
      const hasChildren = typeof value === 'object' && value !== null;

      return (
        <div key={currentPath} className="pl-4">
          <div 
            className="flex items-center gap-2 py-1 cursor-pointer hover:bg-amber-900/10 rounded px-1 transition-colors"
            onClick={() => hasChildren && toggleNode(currentPath)}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-3 h-3 text-amber-600" /> : <ChevronRight className="w-3 h-3 text-amber-600" />
            ) : (
              <File className="w-3 h-3 text-stone-600" />
            )}
            {hasChildren ? <Folder className="w-3 h-3 text-amber-700" /> : null}
            <span className={`text-xs font-mono ${hasChildren ? 'text-amber-500 font-bold' : 'text-stone-400'}`}>
              {key}
            </span>
            {!hasChildren && (
              <span className="text-[10px] text-stone-600 italic truncate ml-2">
                {String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}
              </span>
            )}
          </div>
          {hasChildren && isExpanded && (
            <div className="border-l border-amber-900/20 ml-1.5">
              {renderTree(value, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };
  
  // Local state for live config editing (these would sync to server/localStorage)
  const [chaosEnabled, setChaosEnabled] = useState(CHAOS_MESSAGES.enabled);
  const [mysticalEnabled, setMysticalEnabled] = useState(MYSTICAL_CARDS.enabled);
  const [subliminalMessages, setSubliminalMessages] = useState(CHAOS_MESSAGES.subliminal);
  const [newSubliminal, setNewSubliminal] = useState('');

  const { data: clues = [] } = useQuery<Clue[]>({
    queryKey: ['/api/clues'],
    queryFn: () => fetch('/api/clues').then(r => r.json())
  });

  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: ['/api/quests'],
    queryFn: () => fetch('/api/quests').then(r => r.json())
  });

  const createClueMutation = useMutation({
    mutationFn: (clue: Partial<Clue>) => 
      fetch('/api/clues', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || ''
        },
        body: JSON.stringify({ ...clue, content: clue.content || '' })
      }).then(async r => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || 'Failed to create clue');
        }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clues'] });
      setClueDialogOpen(false);
      setNewClue({});
    },
    onError: (error: Error) => {
      console.error('Clue creation failed:', error);
      alert(`Error: ${error.message}`);
    }
  });

  const createQuestMutation = useMutation({
    mutationFn: (quest: Partial<Quest>) => 
      fetch('/api/quests', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || ''
        },
        body: JSON.stringify(quest)
      }).then(async r => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || 'Failed to create quest');
        }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      setQuestDialogOpen(false);
      setNewQuest({});
    },
    onError: (error: Error) => {
      console.error('Quest creation failed:', error);
      alert(`Error: ${error.message}`);
    }
  });

  const updateClueMutation = useMutation({
    mutationFn: (clue: Clue) => 
      fetch(`/api/clues/${clue.id}`, { 
        method: 'PATCH', 
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || ''
        },
        body: JSON.stringify(clue)
      }).then(async r => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || 'Failed to update clue');
        }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clues'] });
      setEditingClue(null);
    },
    onError: (error: Error) => {
      alert(`Update failed: ${error.message}`);
    }
  });

  const deleteClueMutation = useMutation({
    mutationFn: (id: string) => 
      fetch(`/api/clues/${id}`, { 
        method: 'DELETE',
        headers: {
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || ''
        }
      }).then(async r => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || 'Failed to delete clue');
        }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clues'] });
    },
    onError: (error: Error) => {
      alert(`Delete failed: ${error.message}`);
    }
  });

  const updateQuestMutation = useMutation({
    mutationFn: (quest: Quest) => 
      fetch(`/api/quests/${quest.id}`, { 
        method: 'PATCH', 
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || ''
        },
        body: JSON.stringify(quest)
      }).then(async r => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || 'Failed to update quest');
        }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      setEditingQuest(null);
    },
    onError: (error: Error) => {
      alert(`Update failed: ${error.message}`);
    }
  });

  const deleteQuestMutation = useMutation({
    mutationFn: (id: string) => 
      fetch(`/api/quests/${id}`, { 
        method: 'DELETE',
        headers: {
          'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || ''
        }
      }).then(async r => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || 'Failed to delete quest');
        }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
    },
    onError: (error: Error) => {
      alert(`Delete failed: ${error.message}`);
    }
  });

  const addSubliminalMessage = () => {
    if (newSubliminal.trim()) {
      setSubliminalMessages([...subliminalMessages, newSubliminal.trim()]);
      setNewSubliminal('');
    }
  };

  const removeSubliminalMessage = (index: number) => {
    setSubliminalMessages(subliminalMessages.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#050200] text-stone-300 font-mono">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-[#0a0500]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-amber-600" />
            <h1 className="font-orbitron text-xl font-bold">
              <span className="text-amber-600">ADMIN</span> CONSOLE
            </h1>
            <Badge 
              variant="outline" 
              className={`ml-2 ${gameState.devMode ? 'border-teal-500 text-teal-400 bg-teal-950/30' : 'border-amber-900/50 text-amber-600'}`}
            >
              {gameState.devMode ? 'DEV MODE' : 'GAME MODE'}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-amber-900/30 bg-black/30">
              <Label htmlFor="dev-mode-toggle" className="text-stone-400 text-xs">Dev Mode</Label>
              <Switch 
                id="dev-mode-toggle"
                checked={gameState.devMode} 
                onCheckedChange={toggleDevMode}
                data-testid="dev-mode-toggle"
              />
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-stone-500 hover:text-amber-500">
                View Site
              </Button>
            </Link>
            <Link href="/terminal">
              <Button variant="outline" className="border-amber-900/50 text-amber-600 hover:bg-amber-950/30">
                <Terminal className="w-4 h-4 mr-2" /> Terminal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Dev Mode Quick Nav */}
      {gameState.devMode && (
        <div className="bg-teal-950/20 border-b border-teal-900/30 py-3">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-teal-400 text-xs font-bold mr-2">QUICK NAV:</span>
              <Link href="/terminal">
                <Button size="sm" variant="outline" className="h-7 text-xs border-teal-800 text-teal-400 hover:bg-teal-950/50">
                  <Terminal className="w-3 h-3 mr-1" /> Terminal
                </Button>
              </Link>
              <Link href="/void">
                <Button size="sm" variant="outline" className="h-7 text-xs border-purple-800 text-purple-400 hover:bg-purple-950/50">
                  <Sparkles className="w-3 h-3 mr-1" /> The Void
                </Button>
              </Link>
              <Link href="/archive">
                <Button size="sm" variant="outline" className="h-7 text-xs border-amber-800 text-amber-400 hover:bg-amber-950/50">
                  <FileText className="w-3 h-3 mr-1" /> Archive
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs border-blue-800 text-blue-400 hover:bg-blue-950/50"
                onClick={() => setApiPlaygroundOpen(true)}
                data-testid="api-playground-button"
              >
                <Zap className="w-3 h-3 mr-1" /> API Playground
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs border-purple-800 text-purple-400 hover:bg-purple-950/50"
                onClick={() => setCampaignDesignerOpen(true)}
                data-testid="campaign-designer-button"
              >
                <Layers className="w-3 h-3 mr-1" /> Campaign Designer
              </Button>
              <Link href="/debug">
                <Button size="sm" variant="outline" className="h-7 text-xs border-red-800 text-red-400 hover:bg-red-950/50">
                  <Bug className="w-3 h-3 mr-1" /> Debug
                </Button>
              </Link>
              <Link href="/ai-lab">
                <Button size="sm" variant="outline" className="h-7 text-xs border-blue-800 text-blue-400 hover:bg-blue-950/50">
                  <Bot className="w-3 h-3 mr-1" /> AI Lab
                </Button>
              </Link>
              <Link href="/report">
                <Button size="sm" variant="outline" className="h-7 text-xs border-orange-800 text-orange-400 hover:bg-orange-950/50">
                  <FileText className="w-3 h-3 mr-1" /> Report Builder
                </Button>
              </Link>
              <a href="/api/agent/schema" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="h-7 text-xs border-stone-700 text-stone-400 hover:bg-stone-900/50">
                  <ExternalLink className="w-3 h-3 mr-1" /> API Schema
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Architecture Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-orbitron text-amber-600 mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6" /> Architecture Overview
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#0a0500] border-amber-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                  <Database className="w-4 h-4" /> Database
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-stone-500">
                PostgreSQL with Drizzle ORM
              </CardContent>
            </Card>
            
            <Card className="bg-[#0a0500] border-amber-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                  <Server className="w-4 h-4" /> Backend
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-stone-500">
                Express + TypeScript
              </CardContent>
            </Card>
            
            <Card className="bg-[#0a0500] border-amber-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Frontend
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-stone-500">
                React + Tailwind + Framer
              </CardContent>
            </Card>
            
            <Card className="bg-[#0a0500] border-amber-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                  <QrCode className="w-4 h-4" /> QR System
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-stone-500">
                qrcode + base64 encoding
              </CardContent>
            </Card>
          </div>

          {/* Route Map */}
          <Card className="bg-[#0a0500] border-amber-900/30 mb-8">
            <CardHeader>
              <CardTitle className="text-amber-500 font-mono flex items-center gap-2">
                <Map className="w-5 h-5" /> Route Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-amber-700 text-sm mb-3 font-bold">PUBLIC ROUTES</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-amber-600">/</span> <ArrowRight className="w-3 h-3" /> Home (Corporate Facade)
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-amber-600">/login</span> <ArrowRight className="w-3 h-3" /> Fake Login Portal
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-amber-700 text-sm mb-3 font-bold">HIDDEN ROUTES</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-amber-600">/terminal</span> <ArrowRight className="w-3 h-3" /> Command Interface
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-amber-600">/void</span> <ArrowRight className="w-3 h-3" /> The Void (Easter Egg)
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-amber-600">/admin</span> <ArrowRight className="w-3 h-3" /> This Dashboard
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-amber-600">/archive</span> <ArrowRight className="w-3 h-3" /> Data Archive
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-amber-600">/debug</span> <ArrowRight className="w-3 h-3" /> Debug Console
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Content Management Tabs */}
        <Tabs defaultValue="clues" className="space-y-6">
          <TabsList className="bg-[#0a0500] border border-amber-900/30 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="clues" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
              <Key className="w-4 h-4 mr-2" /> Clues ({clues.length})
            </TabsTrigger>
            <TabsTrigger value="quests" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
              <Trophy className="w-4 h-4 mr-2" /> Quests ({quests.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-teal-900/30 data-[state=active]:text-teal-500">
              <MessageSquare className="w-4 h-4 mr-2" /> Messages
            </TabsTrigger>
            <TabsTrigger value="mystical" className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-500">
              <Sparkles className="w-4 h-4 mr-2" /> Mystical
            </TabsTrigger>
            <TabsTrigger value="terminal" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
              <Terminal className="w-4 h-4 mr-2" /> Commands
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
              <Settings className="w-4 h-4 mr-2" /> Config
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-teal-900/30 data-[state=active]:text-teal-500">
              <Rocket className="w-4 h-4 mr-2" /> Campaigns
            </TabsTrigger>
            <TabsTrigger value="graph" className="data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-500">
              <Map className="w-4 h-4 mr-2" /> Knowledge Graph
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-red-900/30 data-[state=active]:text-red-500">
              <Eye className="w-4 h-4 mr-2" /> Behavior Analytics
            </TabsTrigger>
          </TabsList>

          {/* Clues Tab */}
          <TabsContent value="clues">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-orbitron text-amber-600">Collectable Clues</h3>
              <Dialog open={clueDialogOpen} onOpenChange={setClueDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-700 hover:bg-amber-600 text-black">
                    <Plus className="w-4 h-4 mr-2" /> Add Clue
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300">
                  <DialogHeader>
                    <DialogTitle className="text-amber-600 font-orbitron">Create New Clue</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input 
                      placeholder="Clue ID (e.g., clue-03)" 
                      value={newClue.id || ''}
                      onChange={e => setNewClue({...newClue, id: e.target.value})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Input 
                      placeholder="Name" 
                      value={newClue.name || ''}
                      onChange={e => setNewClue({...newClue, name: e.target.value})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Textarea 
                      placeholder="Description" 
                      value={newClue.description || ''}
                      onChange={e => setNewClue({...newClue, description: e.target.value})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Input 
                      placeholder="Content (the secret)" 
                      value={newClue.content || ''}
                      onChange={e => setNewClue({...newClue, content: e.target.value})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Input 
                      placeholder="Location (e.g., /terminal, home-page)" 
                      value={newClue.location || ''}
                      onChange={e => setNewClue({...newClue, location: e.target.value})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Button 
                      onClick={() => createClueMutation.mutate(newClue)}
                      className="w-full bg-amber-700 hover:bg-amber-600 text-black"
                    >
                      Create Clue
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clues.map(clue => (
                <Card key={clue.id} className="bg-[#0a0500] border-amber-900/30 hover:border-amber-600/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                      <Key className="w-4 h-4" /> {clue.name}
                    </CardTitle>
                    <CardDescription className="text-stone-600 text-xs">{clue.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs">
                    <p className="text-stone-400 mb-2">{clue.description}</p>
                    <p className="text-amber-700 font-bold">Location: {clue.location}</p>
                  </CardContent>
                </Card>
              ))}
              {clues.length === 0 && (
                <p className="text-stone-600 col-span-3 text-center py-8">No clues in database. Add some to get started!</p>
              )}
            </div>
          </TabsContent>

          {/* Quests Tab */}
          <TabsContent value="quests">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-orbitron text-amber-600">Quest Chains</h3>
              <Dialog open={questDialogOpen} onOpenChange={setQuestDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-700 hover:bg-amber-600 text-black">
                    <Plus className="w-4 h-4 mr-2" /> Add Quest
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300">
                  <DialogHeader>
                    <DialogTitle className="text-amber-600 font-orbitron">Create New Quest</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-amber-600 text-xs">Quest ID</Label>
                      <Input 
                        placeholder="e.g., quest-01" 
                        value={newQuest.id || ''}
                        onChange={e => setNewQuest({...newQuest, id: e.target.value})}
                        className="bg-black/50 border-amber-900/30 text-amber-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-amber-600 text-xs">Quest Name</Label>
                      <Input 
                        placeholder="Quest Name" 
                        value={newQuest.name || ''}
                        onChange={e => setNewQuest({...newQuest, name: e.target.value})}
                        className="bg-black/50 border-amber-900/30 text-amber-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-amber-600 text-xs">Description</Label>
                      <Textarea 
                        placeholder="Detailed quest description" 
                        value={newQuest.description || ''}
                        onChange={e => setNewQuest({...newQuest, description: e.target.value})}
                        className="bg-black/50 border-amber-900/30 text-amber-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-amber-600 text-xs">Required Clues (IDs, comma-separated)</Label>
                      <Input 
                        placeholder="clue-01, clue-02" 
                        value={newQuest.requiredClues?.join(', ') || ''}
                        onChange={e => setNewQuest({...newQuest, requiredClues: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        className="bg-black/50 border-amber-900/30 text-amber-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-amber-600 text-xs">Reward (Optional)</Label>
                      <Input 
                        placeholder="e.g., Access to Archive" 
                        value={newQuest.reward || ''}
                        onChange={e => setNewQuest({...newQuest, reward: e.target.value})}
                        className="bg-black/50 border-amber-900/30 text-amber-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-amber-600 text-xs">Unlocks (Optional)</Label>
                      <Input 
                        placeholder="e.g., /archive" 
                        value={newQuest.unlocks || ''}
                        onChange={e => setNewQuest({...newQuest, unlocks: e.target.value})}
                        className="bg-black/50 border-amber-900/30 text-amber-500"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        console.log("Submitting quest:", newQuest);
                        createQuestMutation.mutate(newQuest);
                      }}
                      disabled={createQuestMutation.isPending || !newQuest.id || !newQuest.name}
                      className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold"
                    >
                      {createQuestMutation.isPending ? 'Processing...' : 'Create Quest'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {quests.map(quest => (
                <Card key={quest.id} className="bg-[#0a0500] border-amber-900/30 hover:border-amber-600/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                      <Trophy className="w-4 h-4" /> {quest.name}
                    </CardTitle>
                    <CardDescription className="text-stone-600 text-xs">{quest.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs">
                    <p className="text-stone-400 mb-2">{quest.description}</p>
                    <p className="text-amber-700">Requires: {quest.requiredClues?.join(', ') || 'None'}</p>
                    {quest.unlocks && <p className="text-amber-600 mt-1">Unlocks: {quest.unlocks}</p>}
                  </CardContent>
                </Card>
              ))}
              {quests.length === 0 && (
                <p className="text-stone-600 col-span-2 text-center py-8">No quests defined. Create quest chains to guide players!</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-orbitron text-teal-400 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Game Narrative & Message Tree
                </h3>
                <Badge variant="outline" className="border-teal-600 text-teal-400">
                  Read Only / Simulation
                </Badge>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Message Tree View */}
                <Card className="lg:col-span-2 bg-[#0a0500] border-amber-900/30 overflow-hidden">
                  <CardHeader className="bg-amber-950/10 border-b border-amber-900/20">
                    <CardTitle className="text-amber-500 font-mono text-sm flex items-center gap-2">
                      <Folder className="w-4 h-4" /> root/messages/config
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 overflow-y-auto max-h-[600px] custom-scrollbar">
                    {renderTree({
                      TERMINAL_MESSAGES,
                      TOAST_MESSAGES,
                      CHAOS_MESSAGES,
                      MYSTICAL_CARDS,
                      UI_TEXT
                    })}
                  </CardContent>
                </Card>

                {/* Direct Quantum Controls */}
                <div className="space-y-4">
                  <Card className="bg-[#0a0500] border-teal-900/30">
                    <CardHeader>
                      <CardTitle className="text-teal-400 font-mono text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Quantum Probability Text
                      </CardTitle>
                      <CardDescription className="text-stone-500 text-[10px]">
                        Manage strings used in the quantum fluctuation simulations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-black/50 p-3 rounded border border-teal-900/20">
                        <Label className="text-teal-600 text-[10px] uppercase font-bold mb-2 block">Active Wave Strings</Label>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {CHAOS_MESSAGES.subliminal.map((msg, i) => (
                            <div key={i} className="flex items-center justify-between group bg-teal-950/10 p-2 rounded border border-teal-900/10 hover:border-teal-500/30 transition-all">
                              <span className="text-xs font-mono text-stone-300">{msg}</span>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Input 
                            placeholder="New quantum string..." 
                            className="bg-black/50 border-teal-900/30 text-teal-400 text-xs h-8" 
                          />
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-black h-8">
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0a0500] border-amber-900/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-amber-500 font-mono text-sm">System Simulation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full bg-amber-900/20 border border-amber-700/30 text-amber-500 text-xs py-6 hover:bg-amber-900/40 transition-all group">
                        <div className="flex flex-col items-center gap-1">
                          <Zap className="w-4 h-4 group-hover:animate-pulse" />
                          <span>TRIGGER CHAOS FLASH</span>
                        </div>
                      </Button>
                      <Button className="w-full bg-teal-900/20 border border-teal-700/30 text-teal-500 text-xs py-6 hover:bg-teal-900/40 transition-all group">
                        <div className="flex flex-col items-center gap-1">
                          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                          <span>SPAWN MYSTICAL POPUP</span>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Mystical Cards Tab */}
          <TabsContent value="mystical">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-orbitron text-purple-400">Mystical Card System</h3>
                <div className="flex items-center gap-4">
                  <Label htmlFor="mystical-enabled" className="text-stone-400">Enable Mystical Popups</Label>
                  <Switch 
                    id="mystical-enabled" 
                    checked={mysticalEnabled} 
                    onCheckedChange={setMysticalEnabled}
                    data-testid="mystical-toggle"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Tarot Cards */}
                <Card className="bg-[#0a0500] border-amber-900/30">
                  <CardHeader>
                    <CardTitle className="text-amber-500 font-mono">Tarot Cards ({MYSTICAL_CARDS.tarot.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                    {MYSTICAL_CARDS.tarot.map((card, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-black/50 rounded border border-amber-900/20">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{card.icon}</span>
                          <div>
                            <p className="text-amber-500 text-sm font-bold">{card.name}</p>
                            <p className="text-stone-600 text-xs truncate max-w-[200px]">{card.hint}</p>
                          </div>
                        </div>
                        <Switch checked={card.enabled} className="scale-75" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Zodiac Signs */}
                <Card className="bg-[#0a0500] border-purple-900/30">
                  <CardHeader>
                    <CardTitle className="text-purple-400 font-mono">Zodiac Signs ({MYSTICAL_CARDS.zodiac.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                    {MYSTICAL_CARDS.zodiac.map((sign, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-black/50 rounded border border-purple-900/20">
                        <div className="flex items-center gap-2">
                          <span className="text-xl text-purple-400">{sign.symbol}</span>
                          <div>
                            <p className="text-purple-400 text-sm font-bold">{sign.name}</p>
                            <p className="text-stone-600 text-xs truncate max-w-[200px]">{sign.hint}</p>
                          </div>
                        </div>
                        <Switch checked={sign.enabled} className="scale-75" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Terminal Commands Tab */}
          <TabsContent value="terminal">
            <Card className="bg-[#0a0500] border-amber-900/30">
              <CardHeader>
                <CardTitle className="text-amber-500 font-mono">Available Terminal Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
                  <div className="space-y-2">
                    <h4 className="text-amber-700 font-bold mb-3">BASIC COMMANDS</h4>
                    <p className="text-stone-400"><span className="text-amber-500">help</span> - Show available commands</p>
                    <p className="text-stone-400"><span className="text-amber-500">whoami</span> - Display current user</p>
                    <p className="text-stone-400"><span className="text-amber-500">ls</span> - List directory contents</p>
                    <p className="text-stone-400"><span className="text-amber-500">clear</span> - Clear terminal</p>
                    <p className="text-stone-400"><span className="text-amber-500">inventory</span> - Show collected clues</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-amber-700 font-bold mb-3">SECRET COMMANDS</h4>
                    <p className="text-stone-400"><span className="text-amber-500">cat [file]</span> - Read file contents</p>
                    <p className="text-stone-400"><span className="text-amber-500">ssh [host]</span> - Connect to remote</p>
                    <p className="text-stone-400"><span className="text-amber-500">decode [base64]</span> - Decode message</p>
                    <p className="text-stone-400"><span className="text-amber-500">probe [route]</span> - Scan for vulnerabilities</p>
                    <p className="text-stone-400"><span className="text-amber-500">netstat</span> - Show network connections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* UX Config / Playground Tab */}
          <TabsContent value="config">
            <div className="space-y-6">
              <h3 className="text-lg font-orbitron text-amber-600 flex items-center gap-2">
                <Settings className="w-5 h-5" /> UX Playground - Visual Effects
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Background Effects */}
                <Card className="bg-[#0a0500] border-amber-900/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-amber-500 font-mono text-sm">Background Effects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Gradient Overlay</Label>
                      <Switch defaultChecked data-testid="gradient-toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Scanlines</Label>
                      <Switch defaultChecked data-testid="scanlines-toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Noise Texture</Label>
                      <Switch data-testid="noise-toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Vignette</Label>
                      <Switch defaultChecked data-testid="vignette-toggle" />
                    </div>
                  </CardContent>
                </Card>

                {/* Mouse Effects */}
                <Card className="bg-[#0a0500] border-teal-900/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-teal-400 font-mono text-sm">Mouse Tracking Effects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Lens Distortion</Label>
                      <Switch defaultChecked data-testid="lens-toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Glow Follow</Label>
                      <Switch data-testid="glow-follow-toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Cursor Trail</Label>
                      <Switch data-testid="cursor-trail-toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Magnetic Buttons</Label>
                      <Switch data-testid="magnetic-toggle" />
                    </div>
                  </CardContent>
                </Card>

                {/* Glitch Effects */}
                <Card className="bg-[#0a0500] border-purple-900/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-purple-400 font-mono text-sm">Glitch & Chaos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Text Glitch</Label>
                      <Switch defaultChecked data-testid="text-glitch-toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">RGB Split</Label>
                      <Switch data-testid="rgb-split-toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Screen Shake</Label>
                      <Switch data-testid="shake-toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-400 text-xs">Flicker</Label>
                      <Switch data-testid="flicker-toggle" />
                    </div>
                  </CardContent>
                </Card>

                {/* Popup Timing */}
                <Card className="bg-[#0a0500] border-amber-900/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-amber-500 font-mono text-sm">Popup Timing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-stone-400 text-xs block mb-2">Mystical Card Interval</Label>
                      <Input type="number" defaultValue="15" className="bg-black/50 border-amber-900/30 text-amber-500 w-20" />
                      <span className="text-stone-600 text-xs ml-2">seconds</span>
                    </div>
                    <div>
                      <Label className="text-stone-400 text-xs block mb-2">Chaos Flash Duration</Label>
                      <Input type="number" defaultValue="150" className="bg-black/50 border-amber-900/30 text-amber-500 w-20" />
                      <span className="text-stone-600 text-xs ml-2">ms</span>
                    </div>
                    <div>
                      <Label className="text-stone-400 text-xs block mb-2">Quantum Check Interval</Label>
                      <Input type="number" defaultValue="20" className="bg-black/50 border-amber-900/30 text-amber-500 w-20" />
                      <span className="text-stone-600 text-xs ml-2">seconds</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Color Palette */}
                <Card className="bg-[#0a0500] border-amber-900/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-amber-500 font-mono text-sm">Color Palette</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-amber-600 border border-amber-500"></div>
                      <span className="text-stone-400 text-xs">Primary (Amber)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-teal-500 border border-teal-400"></div>
                      <span className="text-stone-400 text-xs">Accent (Teal)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-purple-500 border border-purple-400"></div>
                      <span className="text-stone-400 text-xs">Mystical (Purple)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-red-500 border border-red-400"></div>
                      <span className="text-stone-400 text-xs">Danger (Red)</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Probability Settings */}
                <Card className="bg-[#0a0500] border-purple-900/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-purple-400 font-mono text-sm">Event Probability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-stone-400 text-xs block mb-2">Mystical Card Chance</Label>
                      <Input type="number" defaultValue="8" min="0" max="100" className="bg-black/50 border-amber-900/30 text-amber-500 w-20" />
                      <span className="text-stone-600 text-xs ml-2">%</span>
                    </div>
                    <div>
                      <Label className="text-stone-400 text-xs block mb-2">Chaos Flash Chance</Label>
                      <Input type="number" defaultValue="3" min="0" max="100" className="bg-black/50 border-amber-900/30 text-amber-500 w-20" />
                      <span className="text-stone-600 text-xs ml-2">%</span>
                    </div>
                    <div>
                      <Label className="text-stone-400 text-xs block mb-2">Quantum Event Chance</Label>
                      <Input type="number" defaultValue="15" min="0" max="100" className="bg-black/50 border-amber-900/30 text-amber-500 w-20" />
                      <span className="text-stone-600 text-xs ml-2">%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Save Config Button */}
              <div className="flex justify-end pt-4">
                <Button className="bg-teal-600 hover:bg-teal-500 text-black font-bold" data-testid="save-config">
                  <Save className="w-4 h-4 mr-2" /> Save Configuration
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-orbitron text-teal-400 flex items-center gap-2">
                  <Rocket className="w-5 h-5" /> Investigation Campaigns
                </h3>
                <Badge variant="outline" className="border-teal-600 text-teal-400">
                  {AGENT_CAMPAIGNS.length} Campaigns
                </Badge>
              </div>

              {/* Campaign Categories */}
              <div className="space-y-4">
                {CAMPAIGN_CATEGORIES.map(category => (
                  <Card key={category.id} className="bg-[#0a0500] border-amber-900/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-amber-500 font-mono text-sm">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.campaigns.map(campaignId => {
                          const campaign = AGENT_CAMPAIGNS.find(c => c.id === campaignId);
                          if (!campaign) return null;
                          return (
                            <button
                              key={campaign.id}
                              onClick={() => setSelectedCampaign(campaign)}
                              className={`p-3 rounded border text-left transition-all hover:scale-[1.02] ${
                                selectedCampaign?.id === campaign.id
                                  ? 'border-teal-500 bg-teal-950/30'
                                  : 'border-amber-900/30 hover:border-amber-600/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{campaign.icon}</span>
                                <span className="text-amber-500 font-bold text-sm">{campaign.name}</span>
                              </div>
                              <p className="text-stone-500 text-xs line-clamp-2">{campaign.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] ${getDifficultyColor(campaign.difficulty)}`}>
                                  {campaign.difficulty.toUpperCase()}
                                </span>
                                <span className="text-stone-600 text-[10px]">{campaign.estimatedTime}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Campaign Details */}
              {selectedCampaign && (
                <Card className="bg-[#0a0500] border-teal-900/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-teal-400 font-mono flex items-center gap-2">
                        <span className="text-2xl">{selectedCampaign.icon}</span>
                        {selectedCampaign.name}
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedCampaign(null)}
                        className="text-stone-500"
                      >
                        Close
                      </Button>
                    </div>
                    <CardDescription className="text-stone-400">
                      {selectedCampaign.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-amber-600 text-sm font-bold mb-2">Objectives</h4>
                        <ul className="space-y-1">
                          {selectedCampaign.objectives.map((obj, i) => (
                            <li key={i} className="text-stone-400 text-xs flex items-center gap-2">
                              <Target className="w-3 h-3 text-teal-500" /> {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-amber-600 text-sm font-bold mb-2">Tools</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedCampaign.tools.map((tool, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] border-stone-700 text-stone-400">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-amber-600 text-sm font-bold mb-2">Starter Prompt</h4>
                      <pre className="bg-black/50 p-3 rounded border border-amber-900/20 text-xs text-stone-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {selectedCampaign.starterPrompt}
                      </pre>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        className="border-amber-800 text-amber-500"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedCampaign.starterPrompt);
                        }}
                      >
                        Copy Prompt
                      </Button>
                      <Link href="/terminal">
                        <Button className="bg-teal-600 hover:bg-teal-500 text-black">
                          <Play className="w-4 h-4 mr-2" /> Launch Campaign
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags Overview */}
              <Card className="bg-[#0a0500] border-amber-900/30">
                <CardHeader>
                  <CardTitle className="text-amber-500 font-mono text-sm">Campaign Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(AGENT_CAMPAIGNS.flatMap(c => c.tags))).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs border-amber-800 text-amber-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Knowledge Graph Tab */}
          <TabsContent value="graph">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-orbitron text-blue-400 flex items-center gap-2">
                  <Map className="w-5 h-5" /> Clue Knowledge Graph
                </h3>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={showGraphView ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowGraphView(true)}
                    className={showGraphView ? "bg-blue-600 text-white" : "border-blue-900/50 text-blue-400"}
                  >
                    Graph View
                  </Button>
                  <Button 
                    variant={!showGraphView ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowGraphView(false)}
                    className={!showGraphView ? "bg-blue-600 text-white" : "border-blue-900/50 text-blue-400"}
                  >
                    List View
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <ContentSearch
                items={[
                  ...clues.map(c => ({
                    id: c.id,
                    name: c.name,
                    type: 'clue' as ContentType,
                    description: c.description,
                    content: c.content,
                    location: c.location
                  })),
                  ...quests.map(q => ({
                    id: q.id,
                    name: q.name,
                    type: 'quest' as ContentType,
                    description: q.description,
                    tags: q.requiredClues
                  })),
                  ...MYSTICAL_CARDS.tarot.map(t => ({
                    id: `tarot-${t.symbol}`,
                    name: t.name,
                    type: 'mystical' as ContentType,
                    description: t.hint
                  })),
                  ...MYSTICAL_CARDS.zodiac.map(z => ({
                    id: `zodiac-${z.name.toLowerCase()}`,
                    name: z.name,
                    type: 'mystical' as ContentType,
                    description: z.hint
                  }))
                ]}
                onSelect={(item) => {
                  if (item.type === 'clue') {
                    setSelectedClueId(item.id);
                    setClueTrail(prev => prev.includes(item.id) ? prev : [...prev, item.id]);
                  }
                }}
                placeholder="Search clues, quests, locations... (type [[ for wikilinks)"
              />

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Graph or List */}
                <div className="lg:col-span-2">
                  {showGraphView ? (
                    <ClueGraph
                      clues={clues.map(c => ({
                        id: c.id,
                        name: c.name,
                        linkedTo: extractLinkIds(c.content || ''),
                        linkedFrom: clues
                          .filter(other => extractLinkIds(other.content || '').includes(c.id))
                          .map(other => other.id),
                        rarity: c.difficulty <= 1 ? 'common' : c.difficulty <= 2 ? 'uncommon' : c.difficulty <= 3 ? 'rare' : 'legendary',
                        collected: gameState.inventory?.some(clue => clue.id === c.id) || false
                      }))}
                      selectedClueId={selectedClueId || undefined}
                      onSelectClue={(id) => {
                        setSelectedClueId(id);
                        setClueTrail(prev => prev.includes(id) ? prev : [...prev, id]);
                      }}
                    />
                  ) : (
                    <Card className="bg-[#0a0500] border-amber-900/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-amber-500 font-mono text-sm">All Clues ({clues.length})</CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-[400px] overflow-y-auto space-y-2">
                        {clues.map(clue => {
                          const linkedTo = extractLinkIds(clue.content || '');
                          const linkedFrom = clues
                            .filter(other => extractLinkIds(other.content || '').includes(clue.id))
                            .map(other => other.id);
                          
                          return (
                            <button
                              key={clue.id}
                              onClick={() => {
                                setSelectedClueId(clue.id);
                                setClueTrail(prev => prev.includes(clue.id) ? prev : [...prev, clue.id]);
                              }}
                              className={`w-full text-left p-3 rounded border transition-all ${
                                selectedClueId === clue.id
                                  ? 'border-blue-500 bg-blue-950/30'
                                  : 'border-amber-900/30 hover:border-amber-600/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-amber-500 font-bold text-sm">{clue.name}</span>
                                <div className="flex items-center gap-2">
                                  {linkedTo.length > 0 && (
                                    <Badge variant="outline" className="text-[9px] border-teal-700 text-teal-400">
                                      {linkedTo.length} outlinks
                                    </Badge>
                                  )}
                                  {linkedFrom.length > 0 && (
                                    <Badge variant="outline" className="text-[9px] border-purple-700 text-purple-400">
                                      {linkedFrom.length} backlinks
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-stone-500 truncate">{clue.description}</p>
                              <p className="text-[10px] text-stone-700 mt-1">{clue.id} · {clue.location}</p>
                            </button>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Details Panel */}
                <div className="space-y-4">
                  {/* Breadcrumb Trail */}
                  {clueTrail.length > 0 && (
                    <Card className="bg-[#0a0500] border-blue-900/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-blue-400 font-mono text-sm">Navigation Trail</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ClueBreadcrumbs
                          currentClue={{
                            id: selectedClueId || '',
                            name: clues.find(c => c.id === selectedClueId)?.name || '',
                            linkedTo: extractLinkIds(clues.find(c => c.id === selectedClueId)?.content || ''),
                            linkedFrom: clues
                              .filter(other => extractLinkIds(other.content || '').includes(selectedClueId || ''))
                              .map(other => other.id)
                          }}
                          allClues={clues.map(c => ({
                            id: c.id,
                            name: c.name,
                            linkedTo: extractLinkIds(c.content || ''),
                            linkedFrom: clues
                              .filter(other => extractLinkIds(other.content || '').includes(c.id))
                              .map(other => other.id)
                          }))}
                          onNavigate={(id) => setSelectedClueId(id)}
                          trail={clueTrail}
                          onTrailChange={setClueTrail}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Selected Clue Details */}
                  {selectedClueId && (
                    <Card className="bg-[#0a0500] border-amber-900/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-amber-500 font-mono text-sm flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {clues.find(c => c.id === selectedClueId)?.name}
                        </CardTitle>
                        <CardDescription className="text-stone-600 text-[10px]">
                          {selectedClueId}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-amber-700 text-[10px] uppercase">Description</Label>
                          <p className="text-xs text-stone-400">
                            {clues.find(c => c.id === selectedClueId)?.description}
                          </p>
                        </div>
                        <div>
                          <Label className="text-amber-700 text-[10px] uppercase">Content</Label>
                          <p className="text-xs text-stone-400 bg-black/30 p-2 rounded border border-amber-900/20">
                            {clues.find(c => c.id === selectedClueId)?.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-[10px]">
                          <span className="text-stone-600">
                            Location: <span className="text-amber-500">{clues.find(c => c.id === selectedClueId)?.location}</span>
                          </span>
                          <span className="text-stone-600">
                            Difficulty: <span className="text-amber-500">{clues.find(c => c.id === selectedClueId)?.difficulty}</span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Stats */}
                  <Card className="bg-[#0a0500] border-amber-900/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-500 font-mono text-sm">Graph Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Total Nodes</span>
                        <span className="text-amber-500">{clues.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Total Connections</span>
                        <span className="text-teal-500">
                          {clues.reduce((acc, c) => acc + extractLinkIds(c.content || '').length, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Orphan Nodes</span>
                        <span className="text-red-500">
                          {clues.filter(c => {
                            const hasOutLinks = extractLinkIds(c.content || '').length > 0;
                            const hasInLinks = clues.some(other => 
                              extractLinkIds(other.content || '').includes(c.id)
                            );
                            return !hasOutLinks && !hasInLinks;
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Collected</span>
                        <span className="text-purple-500">{gameState.inventory?.length || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Behavior Analytics Tab */}
          <TabsContent value="behavior">
            <BehaviorAnalyticsPanel />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* API Playground Modal */}
      <ApiPlayground open={apiPlaygroundOpen} onOpenChange={setApiPlaygroundOpen} />
      <CampaignDesigner open={campaignDesignerOpen} onOpenChange={setCampaignDesignerOpen} />
    </div>
  );
}

function BehaviorAnalyticsPanel() {
  const [trends, setTrends] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    loadData();
  }, [selectedDays]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trendsRes, eventsRes] = await Promise.all([
        fetch(`/api/behavior/trends?days=${selectedDays}`).then(r => r.json()),
        fetch('/api/behavior/events?limit=50').then(r => r.json())
      ]);
      setTrends(trendsRes);
      setEvents(eventsRes);
    } catch (error) {
      console.error('Failed to load behavior data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
        Loading behavioral analytics...
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    'aggressive': 'bg-red-900/30 text-red-400',
    'cautious': 'bg-blue-900/30 text-blue-400',
    'curious': 'bg-purple-900/30 text-purple-400',
    'analytical': 'bg-teal-900/30 text-teal-400',
    'jailbreak': 'bg-red-900/50 text-red-300 border border-red-700',
    'stalking': 'bg-orange-900/50 text-orange-300 border border-orange-700',
    'illegal': 'bg-red-950/50 text-red-200 border border-red-600',
    'suspicious': 'bg-amber-900/50 text-amber-300 border border-amber-700',
    'normal': 'bg-stone-900/30 text-stone-400'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-red-400 flex items-center gap-2">
          <Eye className="w-5 h-5" /> Behavioral Analytics & User Profiling
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Time Range:</span>
          {[7, 14, 30].map(days => (
            <Button
              key={days}
              variant={selectedDays === days ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDays(days)}
              className={selectedDays === days ? "bg-red-800 text-white" : "border-red-900/50 text-red-400"}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[#0a0500] border-red-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-500 text-sm font-mono">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{trends?.totalEvents || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0500] border-teal-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-teal-500 text-sm font-mono">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-400">{trends?.uniqueUsers || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 text-sm font-mono">Flagged Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{trends?.flaggedSessions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#0a0500] border-purple-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-500 text-sm font-mono">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{trends?.categoryDistribution?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Sessions Alert */}
      {trends?.flaggedSessions?.length > 0 && (
        <Card className="bg-red-950/20 border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 font-mono flex items-center gap-2">
              <EyeOff className="w-4 h-4" /> Flagged Sessions (Sandboxed & Playing Along)
            </CardTitle>
            <CardDescription className="text-red-300/70">
              These sessions triggered behavioral flags but are still active in sandbox mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends.flaggedSessions.map((session: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-red-950/30 p-2 rounded border border-red-900/50">
                  <div className="flex items-center gap-3">
                    <code className="text-xs text-red-300 font-mono">{session.sessionToken?.substring(0, 12)}...</code>
                    <Badge className={categoryColors[session.reason] || categoryColors.normal}>
                      {session.reason}
                    </Badge>
                    <Badge variant="outline" className="text-red-400 border-red-800 text-[10px]">
                      {session.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500">
                    {session.sandboxed && <Badge className="bg-amber-900/30 text-amber-400">SANDBOXED</Badge>}
                    {session.playAlong && <Badge className="bg-teal-900/30 text-teal-400">PLAY ALONG</Badge>}
                    <span>{new Date(session.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-500 font-mono text-sm">Behavior Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends?.categoryDistribution?.map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <Badge className={categoryColors[cat.category] || categoryColors.normal}>
                    {cat.category}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-stone-800 rounded-full h-2">
                      <div 
                        className="bg-amber-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (cat.count / (trends.totalEvents || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-400 w-8 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
              {(!trends?.categoryDistribution || trends.categoryDistribution.length === 0) && (
                <p className="text-stone-600 text-sm">No behavioral data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Types */}
        <Card className="bg-[#0a0500] border-teal-900/30">
          <CardHeader>
            <CardTitle className="text-teal-500 font-mono text-sm">Action Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends?.actionTypeDistribution?.map((action: any) => (
                <div key={action.actionType} className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">{action.actionType}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-stone-800 rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (action.count / (trends.totalEvents || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-400 w-8 text-right">{action.count}</span>
                  </div>
                </div>
              ))}
              {(!trends?.actionTypeDistribution || trends.actionTypeDistribution.length === 0) && (
                <p className="text-stone-600 text-sm">No action data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="bg-[#0a0500] border-stone-800">
        <CardHeader>
          <CardTitle className="text-stone-400 font-mono text-sm">Recent Behavioral Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {events.map((event: any) => (
              <div 
                key={event.id} 
                className="flex items-center justify-between py-1.5 px-2 bg-stone-900/30 rounded text-xs border border-stone-800/50"
              >
                <div className="flex items-center gap-2">
                  <code className="text-stone-600 font-mono">{event.sessionToken?.substring(0, 8)}...</code>
                  <span className="text-stone-400">{event.actionType}</span>
                  <Badge className={categoryColors[event.category] || categoryColors.normal} variant="outline">
                    {event.category}
                  </Badge>
                </div>
                <span className="text-stone-600 text-[10px]">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-stone-600 text-sm text-center py-4">No behavioral events recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interests & Learning Patterns */}
      <Card className="bg-[#0a0500] border-purple-900/30">
        <CardHeader>
          <CardTitle className="text-purple-500 font-mono text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Learning Style & Interest Analysis
          </CardTitle>
          <CardDescription className="text-stone-500">
            Detected patterns across user sessions for agent customization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs text-stone-400 mb-2">Common Interests</h4>
              <div className="flex flex-wrap gap-1">
                {['network_analysis', 'osint', 'malware', 'web_security', 'cryptography', 'forensics', 'threat_intel', 'cloud'].map(interest => (
                  <Badge key={interest} variant="outline" className="text-[10px] border-purple-900 text-purple-400">
                    {interest.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs text-stone-400 mb-2">Learning Styles Detected</h4>
              <div className="flex flex-wrap gap-1">
                {['experiential', 'visual', 'analytical', 'pragmatic', 'social'].map(style => (
                  <Badge key={style} variant="outline" className="text-[10px] border-teal-900 text-teal-400">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
