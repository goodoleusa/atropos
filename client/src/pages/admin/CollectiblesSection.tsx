import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Key, Sparkles, Zap, Edit, Trash2, Database, Star, Moon, Lightbulb, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MYSTICAL_CARDS } from "@/config/messages";
import { QUANTUM_EVENTS, QUANTUM_MESSAGES } from "@/config/quantumConfig";

interface Clue {
  id: string;
  name: string;
  description: string;
  content: string;
  location: string;
  difficulty: number;
}

interface Artifact {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
}

interface MysticalCard {
  cardId: string;
  type: "tarot" | "zodiac";
  name: string;
  symbol?: string;
  hint: string;
  icon?: string;
  element?: string;
  enabled: boolean;
}

interface QuantumEvent {
  id: string;
  name: string;
  description: string;
  baseProb: number;
  enabled: boolean;
}

interface QuantumMessage {
  id: number;
  message: string;
  enabled: boolean;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export function CollectiblesSection() {
  const queryClient = useQueryClient();
  const [newArtifact, setNewArtifact] = useState<Partial<Artifact>>({});
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [newQuantumMessage, setNewQuantumMessage] = useState("");
  const [editingMysticalCard, setEditingMysticalCard] = useState<MysticalCard | null>(null);
  
  // Zodiac flavor effects - random items/tips when users engage with zodiac
  const [zodiacEffects, setZodiacEffects] = useState<Record<string, { collectibles: string[]; tips: string[] }>>({});
  
  // Load zodiac effects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zodiac_effects');
    if (saved) {
      setZodiacEffects(JSON.parse(saved));
    }
  }, []);
  
  const saveZodiacEffects = (effects: Record<string, { collectibles: string[]; tips: string[] }>) => {
    setZodiacEffects(effects);
    localStorage.setItem('zodiac_effects', JSON.stringify(effects));
    toast({ title: "Zodiac effects saved" });
  };

  const { data: clues = [] } = useQuery<Clue[]>({
    queryKey: ["/api/clues"],
    queryFn: () => fetch("/api/clues").then((r) => r.json())
  });

  const { data: artifacts = [] } = useQuery<Artifact[]>({
    queryKey: ["/api/artifacts"],
    queryFn: () => fetch("/api/artifacts").then((r) => r.json())
  });

  const { data: mysticalCards = [] } = useQuery<MysticalCard[]>({
    queryKey: ["/api/mystical-cards"],
    queryFn: () => fetch("/api/mystical-cards").then((r) => r.json())
  });

  const { data: quantumEvents = [] } = useQuery<QuantumEvent[]>({
    queryKey: ["/api/quantum/events"],
    queryFn: () => fetch("/api/quantum/events").then((r) => r.json())
  });

  const { data: quantumMessages = [] } = useQuery<QuantumMessage[]>({
    queryKey: ["/api/quantum/messages"],
    queryFn: () => fetch("/api/quantum/messages").then((r) => r.json())
  });

  const tarotCards = useMemo(
    () => mysticalCards.filter((c) => c.type === "tarot"),
    [mysticalCards]
  );
  const zodiacCards = useMemo(
    () => mysticalCards.filter((c) => c.type === "zodiac"),
    [mysticalCards]
  );

  const createArtifact = useMutation({
    mutationFn: (artifact: Partial<Artifact>) =>
      fetch("/api/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...artifact,
          tags: artifact.tags || []
        })
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to create artifact");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artifacts"] });
      setNewArtifact({});
      toast({ title: "Artifact created" });
    }
  });

  const updateArtifact = useMutation({
    mutationFn: (artifact: Artifact) =>
      fetch(`/api/artifacts/${artifact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artifact)
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to update artifact");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artifacts"] });
      setEditingArtifact(null);
      toast({ title: "Artifact updated" });
    }
  });

  const deleteArtifact = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/artifacts/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to delete artifact");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artifacts"] });
      toast({ title: "Artifact deleted" });
    }
  });

  const updateMysticalCard = useMutation({
    mutationFn: (card: MysticalCard) =>
      fetch(`/api/mystical-cards/${card.cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card)
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to update card");
        return r.json();
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/mystical-cards"] })
  });

  const updateQuantumEvent = useMutation({
    mutationFn: (event: QuantumEvent) =>
      fetch(`/api/quantum/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event)
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to update event");
        return r.json();
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/quantum/events"] })
  });

  const createQuantumMessage = useMutation({
    mutationFn: (message: string) =>
      fetch("/api/quantum/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to create message");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quantum/messages"] });
      setNewQuantumMessage("");
    }
  });

  const updateQuantumMessage = useMutation({
    mutationFn: (message: QuantumMessage) =>
      fetch(`/api/quantum/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to update message");
        return r.json();
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/quantum/messages"] })
  });

  const deleteQuantumMessage = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/quantum/messages/${id}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to delete message");
        return r.json();
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/quantum/messages"] })
  });

  const seedMysticalDefaults = async () => {
    const tarot = MYSTICAL_CARDS.tarot.map((card) => ({
      cardId: `tarot-${slugify(card.name)}`,
      type: "tarot",
      name: card.name,
      symbol: card.symbol,
      hint: card.hint,
      icon: card.icon,
      enabled: card.enabled !== false
    }));
    const zodiac = MYSTICAL_CARDS.zodiac.map((card) => ({
      cardId: `zodiac-${slugify(card.name)}`,
      type: "zodiac",
      name: card.name,
      symbol: card.symbol,
      hint: card.hint,
      element: card.element,
      enabled: card.enabled !== false
    }));

    await Promise.all(
      [...tarot, ...zodiac].map((card) =>
        fetch(`/api/mystical-cards/${card.cardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card)
        })
      )
    );
    queryClient.invalidateQueries({ queryKey: ["/api/mystical-cards"] });
    toast({ title: "Mystical cards seeded" });
  };

  const seedQuantumDefaults = async () => {
    await Promise.all(
      QUANTUM_EVENTS.map((event) =>
        fetch(`/api/quantum/events/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event)
        })
      )
    );

    await Promise.all(
      QUANTUM_MESSAGES.map((message) =>
        fetch("/api/quantum/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        })
      )
    );

    queryClient.invalidateQueries({ queryKey: ["/api/quantum/events"] });
    queryClient.invalidateQueries({ queryKey: ["/api/quantum/messages"] });
    toast({ title: "Quantum defaults seeded" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-amber-600 flex items-center gap-2">
          <Database className="w-5 h-5" /> Collectibles Library
        </h3>
        <Badge variant="outline" className="border-amber-700 text-amber-400">
          Clues + Artifacts + Popups
        </Badge>
      </div>

      {/* Clues — managed in Gameplay Editor */}
      <Card className="bg-[#0a0500] border-amber-900/30">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-amber-500 text-sm font-mono font-bold">Clues ({clues.length})</p>
              <p className="text-stone-500 text-xs">Clue management has moved to the Gameplay Editor for a single source of truth.</p>
            </div>
          </div>
          <Badge variant="outline" className="border-amber-700 text-amber-400 shrink-0 flex items-center gap-1 cursor-default" data-testid="clues-xref-gameplay">
            Gameplay Editor <ArrowRight className="w-3 h-3" />
          </Badge>
        </CardContent>
      </Card>

      {/* Artifacts */}
      <Card className="bg-[#0a0500] border-purple-900/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-purple-400 text-sm font-mono flex items-center gap-2">
              <Database className="w-4 h-4" /> Artifacts ({artifacts.length})
            </CardTitle>
            <CardDescription className="text-stone-500 text-xs">
              Files, intel, logs, or drops players can collect
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-700 hover:bg-purple-600 text-black">
                <Plus className="w-4 h-4 mr-2" /> Add Artifact
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0500] border-purple-900/50 text-stone-300">
              <DialogHeader>
                <DialogTitle className="text-purple-400 font-orbitron">Create Artifact</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Artifact ID (e.g., artifact-01)"
                  value={newArtifact.id || ""}
                  onChange={(e) => setNewArtifact({ ...newArtifact, id: e.target.value })}
                  className="bg-black/50 border-purple-900/30 text-purple-400"
                />
                <Input
                  placeholder="Name"
                  value={newArtifact.name || ""}
                  onChange={(e) => setNewArtifact({ ...newArtifact, name: e.target.value })}
                  className="bg-black/50 border-purple-900/30 text-purple-400"
                />
                <Textarea
                  placeholder="Description"
                  value={newArtifact.description || ""}
                  onChange={(e) => setNewArtifact({ ...newArtifact, description: e.target.value })}
                  className="bg-black/50 border-purple-900/30 text-purple-400"
                />
                <Input
                  placeholder="Content"
                  value={newArtifact.content || ""}
                  onChange={(e) => setNewArtifact({ ...newArtifact, content: e.target.value })}
                  className="bg-black/50 border-purple-900/30 text-purple-400"
                />
                <Input
                  placeholder="Category (file, log, intel...)"
                  value={newArtifact.category || ""}
                  onChange={(e) => setNewArtifact({ ...newArtifact, category: e.target.value })}
                  className="bg-black/50 border-purple-900/30 text-purple-400"
                />
                <Input
                  placeholder="Tags (comma-separated)"
                  value={newArtifact.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setNewArtifact({
                      ...newArtifact,
                      tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                    })
                  }
                  className="bg-black/50 border-purple-900/30 text-purple-400"
                />
                <Button
                  onClick={() => createArtifact.mutate(newArtifact)}
                  className="w-full bg-purple-700 hover:bg-purple-600 text-black"
                >
                  Create Artifact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {artifacts.map((artifact) => (
            <Card key={artifact.id} className="bg-black/30 border-purple-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-400 text-sm font-mono">{artifact.name}</CardTitle>
                <CardDescription className="text-stone-600 text-xs">{artifact.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-stone-400">{artifact.description}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="border-purple-700 text-purple-400 text-[8px]">
                    {artifact.category || "general"}
                  </Badge>
                  {artifact.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-stone-700 text-stone-500 text-[8px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingArtifact(artifact)}
                    className="border-purple-700 text-purple-400"
                  >
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteArtifact.mutate(artifact.id)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Mystical + Quantum */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0a0500] border-amber-900/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Mystical Popups
              </CardTitle>
              <CardDescription className="text-stone-500 text-xs">
                Tarot + Zodiac collectibles
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={seedMysticalDefaults} className="border-amber-700 text-amber-400">
              Seed Defaults
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[10px] text-amber-600 uppercase">Tarot Cards</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {tarotCards.map((card) => (
                  <div key={card.cardId} className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded border border-amber-900/20">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">{card.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-amber-500 text-xs font-bold">{card.name} <span className="text-stone-600">({card.symbol})</span></p>
                        <p className="text-stone-600 text-[10px] line-clamp-1">{card.hint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setEditingMysticalCard(card)}
                        className="text-amber-400 h-7 w-7 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Switch
                        checked={card.enabled}
                        onCheckedChange={(enabled) => updateMysticalCard.mutate({ ...card, enabled })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[10px] text-purple-500 uppercase">Zodiac Signs</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {zodiacCards.map((card) => (
                  <div key={card.cardId} className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded border border-purple-900/20">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl text-purple-400">{card.symbol}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-purple-400 text-xs font-bold">{card.name} <span className="text-stone-600">({card.element})</span></p>
                        <p className="text-stone-600 text-[10px] line-clamp-1">{card.hint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setEditingMysticalCard(card)}
                        className="text-purple-400 h-7 w-7 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Switch
                        checked={card.enabled}
                        onCheckedChange={(enabled) => updateMysticalCard.mutate({ ...card, enabled })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0500] border-teal-900/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-teal-400 text-sm font-mono flex items-center gap-2">
                <Zap className="w-4 h-4" /> Quantum Popups
              </CardTitle>
              <CardDescription className="text-stone-500 text-xs">
                Probability events + quantum messages
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={seedQuantumDefaults} className="border-teal-700 text-teal-400">
              Seed Defaults
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[10px] text-teal-500 uppercase">Events</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {quantumEvents.map((event) => (
                  <div key={event.id} className="bg-black/40 p-2 rounded border border-teal-900/20">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-teal-300 text-xs font-bold">{event.name}</p>
                        <p className="text-stone-600 text-[10px]">{event.description}</p>
                        <p className="text-teal-500 text-[10px]">Base: {event.baseProb}%</p>
                      </div>
                      <Switch
                        checked={event.enabled}
                        onCheckedChange={(enabled) => updateQuantumEvent.mutate({ ...event, enabled })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[10px] text-teal-500 uppercase">Messages</Label>
              <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                {quantumMessages.map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded border border-teal-900/20">
                    <p className="text-stone-500 text-[10px]">{msg.message}</p>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={msg.enabled}
                        onCheckedChange={(enabled) => updateQuantumMessage.mutate({ ...msg, enabled })}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteQuantumMessage.mutate(msg.id)}
                        className="text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Add quantum message..."
                  value={newQuantumMessage}
                  onChange={(e) => setNewQuantumMessage(e.target.value)}
                  className="bg-black/50 border-teal-900/30 text-teal-300 text-xs"
                />
                <Button
                  size="sm"
                  onClick={() => createQuantumMessage.mutate(newQuantumMessage)}
                  className="bg-teal-600 hover:bg-teal-500 text-black"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit dialogs */}
      <Dialog open={!!editingArtifact} onOpenChange={(open) => !open && setEditingArtifact(null)}>
        <DialogContent className="bg-[#0a0500] border-purple-900/50 text-stone-300">
          <DialogHeader>
            <DialogTitle className="text-purple-400 font-orbitron">Edit Artifact</DialogTitle>
          </DialogHeader>
          {editingArtifact && (
            <div className="space-y-3">
              <Input value={editingArtifact.name} onChange={(e) => setEditingArtifact({ ...editingArtifact, name: e.target.value })} />
              <Textarea value={editingArtifact.description} onChange={(e) => setEditingArtifact({ ...editingArtifact, description: e.target.value })} />
              <Input value={editingArtifact.content} onChange={(e) => setEditingArtifact({ ...editingArtifact, content: e.target.value })} />
              <Input value={editingArtifact.category} onChange={(e) => setEditingArtifact({ ...editingArtifact, category: e.target.value })} />
              <Input
                value={editingArtifact.tags?.join(", ") || ""}
                onChange={(e) =>
                  setEditingArtifact({
                    ...editingArtifact,
                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                  })
                }
              />
              <Button onClick={() => updateArtifact.mutate(editingArtifact)} className="w-full bg-purple-700 hover:bg-purple-600 text-black">
                Save Artifact
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Mystical Card Dialog */}
      <Dialog open={!!editingMysticalCard} onOpenChange={(open) => !open && setEditingMysticalCard(null)}>
        <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300">
          <DialogHeader>
            <DialogTitle className={`font-orbitron ${editingMysticalCard?.type === 'tarot' ? 'text-amber-500' : 'text-purple-400'}`}>
              Edit {editingMysticalCard?.type === 'tarot' ? 'Tarot Card' : 'Zodiac Sign'}
            </DialogTitle>
          </DialogHeader>
          {editingMysticalCard && (
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-stone-500 uppercase">Name</Label>
                <Input 
                  value={editingMysticalCard.name} 
                  onChange={(e) => setEditingMysticalCard({ ...editingMysticalCard, name: e.target.value })}
                  className="bg-black/50 border-stone-700"
                />
              </div>
              <div>
                <Label className="text-[10px] text-stone-500 uppercase">Symbol</Label>
                <Input 
                  value={editingMysticalCard.symbol || ''} 
                  onChange={(e) => setEditingMysticalCard({ ...editingMysticalCard, symbol: e.target.value })}
                  className="bg-black/50 border-stone-700"
                />
              </div>
              {editingMysticalCard.type === 'tarot' && (
                <div>
                  <Label className="text-[10px] text-stone-500 uppercase">Icon (emoji)</Label>
                  <Input 
                    value={editingMysticalCard.icon || ''} 
                    onChange={(e) => setEditingMysticalCard({ ...editingMysticalCard, icon: e.target.value })}
                    className="bg-black/50 border-stone-700"
                  />
                </div>
              )}
              {editingMysticalCard.type === 'zodiac' && (
                <div>
                  <Label className="text-[10px] text-stone-500 uppercase">Element</Label>
                  <Input 
                    value={editingMysticalCard.element || ''} 
                    onChange={(e) => setEditingMysticalCard({ ...editingMysticalCard, element: e.target.value })}
                    className="bg-black/50 border-stone-700"
                    placeholder="Fire, Water, Earth, Air"
                  />
                </div>
              )}
              <div>
                <Label className="text-[10px] text-stone-500 uppercase">Hint / Clue Text</Label>
                <Textarea 
                  value={editingMysticalCard.hint} 
                  onChange={(e) => setEditingMysticalCard({ ...editingMysticalCard, hint: e.target.value })}
                  className="bg-black/50 border-stone-700 min-h-[80px]"
                  placeholder="The mystical message or game hint..."
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingMysticalCard.enabled}
                    onCheckedChange={(enabled) => setEditingMysticalCard({ ...editingMysticalCard, enabled })}
                  />
                  <Label className="text-xs text-stone-400">Enabled</Label>
                </div>
                <Button 
                  onClick={() => {
                    updateMysticalCard.mutate(editingMysticalCard);
                    setEditingMysticalCard(null);
                    toast({ title: "Card updated" });
                  }} 
                  className={`${editingMysticalCard.type === 'tarot' ? 'bg-amber-700 hover:bg-amber-600' : 'bg-purple-700 hover:bg-purple-600'} text-black`}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
