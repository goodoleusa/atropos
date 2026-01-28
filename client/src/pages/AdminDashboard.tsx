import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  LayoutDashboard, 
  Key, 
  Trophy, 
  Terminal, 
  Users, 
  Plus, 
  Eye,
  Map,
  QrCode,
  Server,
  Database,
  Layers,
  ArrowRight
} from "lucide-react";

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
  const [newClue, setNewClue] = useState<Partial<Clue>>({});
  const [newQuest, setNewQuest] = useState<Partial<Quest>>({});
  const [clueDialogOpen, setClueDialogOpen] = useState(false);
  const [questDialogOpen, setQuestDialogOpen] = useState(false);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clue)
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clues'] });
      setClueDialogOpen(false);
      setNewClue({});
    }
  });

  const createQuestMutation = useMutation({
    mutationFn: (quest: Partial<Quest>) => 
      fetch('/api/quests', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quest)
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      setQuestDialogOpen(false);
      setNewQuest({});
    }
  });

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
          </div>
          <div className="flex gap-4">
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
          <TabsList className="bg-[#0a0500] border border-amber-900/30">
            <TabsTrigger value="clues" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
              <Key className="w-4 h-4 mr-2" /> Clues ({clues.length})
            </TabsTrigger>
            <TabsTrigger value="quests" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
              <Trophy className="w-4 h-4 mr-2" /> Quests ({quests.length})
            </TabsTrigger>
            <TabsTrigger value="terminal" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
              <Terminal className="w-4 h-4 mr-2" /> Commands
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
                    <Input 
                      placeholder="Quest ID (e.g., quest-01)" 
                      value={newQuest.id || ''}
                      onChange={e => setNewQuest({...newQuest, id: e.target.value})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Input 
                      placeholder="Name" 
                      value={newQuest.name || ''}
                      onChange={e => setNewQuest({...newQuest, name: e.target.value})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Textarea 
                      placeholder="Description" 
                      value={newQuest.description || ''}
                      onChange={e => setNewQuest({...newQuest, description: e.target.value})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Input 
                      placeholder="Required Clues (comma-separated IDs)" 
                      onChange={e => setNewQuest({...newQuest, requiredClues: e.target.value.split(',').map(s => s.trim())})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Input 
                      placeholder="Reward text" 
                      value={newQuest.reward || ''}
                      onChange={e => setNewQuest({...newQuest, reward: e.target.value})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Input 
                      placeholder="Unlocks (route or feature)" 
                      value={newQuest.unlocks || ''}
                      onChange={e => setNewQuest({...newQuest, unlocks: e.target.value})}
                      className="bg-black/50 border-amber-900/30 text-amber-500"
                    />
                    <Button 
                      onClick={() => createQuestMutation.mutate(newQuest)}
                      className="w-full bg-amber-700 hover:bg-amber-600 text-black"
                    >
                      Create Quest
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
        </Tabs>
      </div>
    </div>
  );
}
