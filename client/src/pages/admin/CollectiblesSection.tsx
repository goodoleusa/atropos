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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Key, Sparkles, Zap, Edit, Trash2, Database, Star, Moon, Lightbulb, Send, Map } from "lucide-react";
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

interface SharedClue {
  clueId: string;
  name: string;
  description: string;
  content: string;
  tags: string[];
  usedInCampaigns: string[];
  linkedClues: string[];
  difficulty: number;
  category: string;
}

interface ClueTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: number;
}

const CLUE_CATEGORIES = ["general", "osint", "crypto", "network", "social", "forensics"];

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

const DifficultyStars = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i <= value ? "text-amber-800 fill-amber-500" : "text-muted-foreground"} ${onChange ? "cursor-pointer" : ""}`}
        onClick={() => onChange?.(i)}
        data-testid={`difficulty-star-${i}`}
      />
    ))}
  </div>
);

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

  const [newClue, setNewClue] = useState<{ clueId: string; name: string; description: string; content: string; tags: string[]; difficulty: number; category: string }>({ clueId: "", name: "", description: "", content: "", tags: [], difficulty: 1, category: "general" });
  const [editingClue, setEditingClue] = useState<SharedClue | null>(null);
  const [clueDialogOpen, setClueDialogOpen] = useState(false);
  const [quickPushTemplate, setQuickPushTemplate] = useState<ClueTemplate | null>(null);
  const [quickPushZones, setQuickPushZones] = useState<string[]>([]);
  const [quickPushName, setQuickPushName] = useState("");
  const [quickPushContent, setQuickPushContent] = useState("");
  
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

  const { data: sharedClues = [] } = useQuery<SharedClue[]>({
    queryKey: ["/api/designer/clues"],
    queryFn: () => fetch("/api/designer/clues").then((r) => r.json())
  });

  const upsertClue = useMutation({
    mutationFn: (clue: { clueId: string; name: string; description: string; content: string; tags: string[]; difficulty: number; category: string }) =>
      fetch(`/api/designer/clues/${clue.clueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clue)
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to save clue");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designer/clues"] });
      setClueDialogOpen(false);
      setEditingClue(null);
      setNewClue({ clueId: "", name: "", description: "", content: "", tags: [], difficulty: 1, category: "general" });
      toast({ title: "Clue saved" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const deleteClue = useMutation({
    mutationFn: (clueId: string) =>
      fetch(`/api/designer/clues/${clueId}`, { method: "DELETE" }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to delete clue");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/designer/clues"] });
      toast({ title: "Clue deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" })
  });

  const quickPushClue = useMutation({
    mutationFn: (clueData: { id: string; name: string; description: string; content: string; location: string; difficulty: number }) =>
      fetch("/api/clues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clueData)
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed to push clue");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clues"] });
      setQuickPushTemplate(null);
      setQuickPushZones([]);
      setQuickPushName("");
      setQuickPushContent("");
      toast({ title: "Clue pushed", description: `Deployed to ${quickPushZones.length} zone(s)` });
    },
    onError: (e: Error) => toast({ title: "Push failed", description: e.message, variant: "destructive" })
  });

  const handleQuickPush = () => {
    if (!quickPushTemplate && !quickPushName) {
      toast({ title: "Error", description: "Select a template or enter a custom name", variant: "destructive" });
      return;
    }
    if (quickPushZones.length === 0) {
      toast({ title: "Error", description: "Select at least one zone", variant: "destructive" });
      return;
    }
    quickPushClue.mutate({
      id: `push-${Date.now()}`,
      name: quickPushName || quickPushTemplate?.name || "Unnamed Clue",
      description: quickPushTemplate?.description || "Quick pushed clue",
      content: quickPushContent || `Deployed via Quick Push to: ${quickPushZones.join(", ")}`,
      location: quickPushZones.join(","),
      difficulty: quickPushTemplate?.difficulty || 2,
    });
  };

  const openClueDialog = (clue?: SharedClue) => {
    if (clue) {
      setEditingClue(clue);
      setNewClue({ clueId: clue.clueId, name: clue.name, description: clue.description, content: clue.content, tags: clue.tags || [], difficulty: clue.difficulty || 1, category: clue.category || "general" });
    } else {
      setEditingClue(null);
      setNewClue({ clueId: "", name: "", description: "", content: "", tags: [], difficulty: 1, category: "general" });
    }
    setClueDialogOpen(true);
  };

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
        <h3 className="text-lg font-orbitron text-amber-800 flex items-center gap-2">
          <Database className="w-5 h-5" /> Collectibles Library
        </h3>
        <Badge variant="outline" className="border-amber-700 text-amber-800">
          {sharedClues.length} Clues · {artifacts.length} Artifacts · Popups
        </Badge>
      </div>

      {/* Clue Library */}
      <Card className="bg-[hsl(var(--card))] border-amber-900/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-amber-800 text-sm font-mono flex items-center gap-2">
              <Key className="w-4 h-4" /> Clue Library ({sharedClues.length})
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Designer clues — create, edit, and manage shared clue definitions
            </CardDescription>
          </div>
          <Button
            className="bg-amber-700 hover:bg-amber-600 text-black"
            onClick={() => openClueDialog()}
            data-testid="add-clue-btn"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Clue
          </Button>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {sharedClues.map((clue) => (
            <Card key={clue.clueId} className="bg-black/30 border-amber-900/30" data-testid={`clue-card-${clue.clueId}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 text-sm font-mono flex items-center gap-2">
                  <Key className="w-3 h-3" /> {clue.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs font-mono">{clue.clueId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground line-clamp-2">{clue.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="border-amber-700 text-amber-800 text-[10px]">
                    {clue.category || "general"}
                  </Badge>
                  <DifficultyStars value={clue.difficulty || 1} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {clue.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-border text-muted-foreground text-[8px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openClueDialog(clue)}
                    className="border-amber-700 text-amber-800"
                    data-testid={`edit-clue-${clue.clueId}`}
                  >
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteClue.mutate(clue.clueId)}
                    className="text-red-700"
                    data-testid={`delete-clue-${clue.clueId}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {sharedClues.length === 0 && (
            <p className="text-muted-foreground col-span-3 text-center py-8">No clues defined yet. Click "Add Clue" to create one.</p>
          )}
        </CardContent>
      </Card>

      {/* Clue Dialog */}
      <Dialog open={clueDialogOpen} onOpenChange={setClueDialogOpen}>
        <DialogContent className="bg-[hsl(var(--card))] border-amber-900/50 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-amber-800 font-orbitron">{editingClue ? "Edit Clue" : "Create Clue"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Clue ID (e.g., clue-osint-01)"
              value={newClue.clueId}
              onChange={(e) => setNewClue({ ...newClue, clueId: e.target.value })}
              className="bg-black/50 border-amber-900/30 text-amber-800"
              disabled={!!editingClue}
              data-testid="input-clue-id"
            />
            <Input
              placeholder="Name"
              value={newClue.name}
              onChange={(e) => setNewClue({ ...newClue, name: e.target.value })}
              className="bg-black/50 border-amber-900/30 text-amber-800"
              data-testid="input-clue-name"
            />
            <Textarea
              placeholder="Description"
              value={newClue.description}
              onChange={(e) => setNewClue({ ...newClue, description: e.target.value })}
              className="bg-black/50 border-amber-900/30 text-amber-800"
              data-testid="input-clue-description"
            />
            <Textarea
              placeholder="Content"
              value={newClue.content}
              onChange={(e) => setNewClue({ ...newClue, content: e.target.value })}
              className="bg-black/50 border-amber-900/30 text-amber-800"
              data-testid="input-clue-content"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-amber-800 text-[10px] uppercase font-bold">Category</Label>
                <Select value={newClue.category} onValueChange={(v) => setNewClue({ ...newClue, category: v })}>
                  <SelectTrigger className="bg-black/50 border-amber-900/30 text-amber-800" data-testid="select-clue-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-amber-900/30">
                    {CLUE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-amber-800 text-[10px] uppercase font-bold">Difficulty</Label>
                <div className="pt-2">
                  <DifficultyStars value={newClue.difficulty} onChange={(v) => setNewClue({ ...newClue, difficulty: v })} />
                </div>
              </div>
            </div>
            <Input
              placeholder="Tags (comma-separated)"
              value={newClue.tags.join(", ")}
              onChange={(e) => setNewClue({ ...newClue, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
              className="bg-black/50 border-amber-900/30 text-amber-800"
              data-testid="input-clue-tags"
            />
            <Button
              onClick={() => upsertClue.mutate(newClue)}
              className="w-full bg-amber-700 hover:bg-amber-600 text-black"
              disabled={upsertClue.isPending}
              data-testid="save-clue-btn"
            >
              {upsertClue.isPending ? "Saving..." : editingClue ? "Update Clue" : "Create Clue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Push to Zone */}
      <Card className="bg-[hsl(var(--card))] border-teal-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-teal-800 text-sm font-mono flex items-center gap-2">
            <Send className="w-4 h-4" /> Quick Push to Zone
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Rapidly deploy clues to game zones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-[10px] text-teal-800 uppercase">Template</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-1">
              {CLUE_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setQuickPushTemplate(quickPushTemplate?.id === t.id ? null : t)}
                  className={`p-2 rounded border text-left transition-all text-[10px] ${
                    quickPushTemplate?.id === t.id
                      ? "border-teal-500 bg-teal-900/20 text-teal-300"
                      : "border-border hover:border-muted text-muted-foreground"
                  }`}
                  data-testid={`qp-template-${t.id}`}
                >
                  <p className="font-medium truncate">{t.name}</p>
                  <span className="text-amber-800">{"★".repeat(t.difficulty)}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-teal-800 uppercase flex items-center gap-1">
              <Map className="w-3 h-3" /> Zones
            </Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {LOCATION_ZONES.map((z) => (
                <button
                  key={z.id}
                  onClick={() => setQuickPushZones((prev) => prev.includes(z.id) ? prev.filter((x) => x !== z.id) : [...prev, z.id])}
                  className={`px-2 py-1 rounded border text-xs flex items-center gap-1 transition-all ${
                    quickPushZones.includes(z.id)
                      ? "border-teal-500 bg-teal-900/20 text-teal-300"
                      : "border-border hover:border-muted text-muted-foreground"
                  }`}
                  data-testid={`qp-zone-${z.id}`}
                >
                  <span>{z.icon}</span> {z.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Custom name override"
              value={quickPushName}
              onChange={(e) => setQuickPushName(e.target.value)}
              className="bg-black/50 border-border text-xs"
              data-testid="qp-custom-name"
            />
            <Input
              placeholder="Custom content"
              value={quickPushContent}
              onChange={(e) => setQuickPushContent(e.target.value)}
              className="bg-black/50 border-border text-xs"
              data-testid="qp-custom-content"
            />
          </div>
          <Button
            onClick={handleQuickPush}
            disabled={quickPushClue.isPending}
            className="w-full bg-teal-700 hover:bg-teal-600 text-black font-bold"
            data-testid="qp-push-btn"
          >
            <Send className="w-4 h-4 mr-2" />
            {quickPushClue.isPending ? "Pushing..." : `Push to ${quickPushZones.length} Zone(s)`}
          </Button>
        </CardContent>
      </Card>

      {/* Artifacts */}
      <Card className="bg-[hsl(var(--card))] border-purple-900/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-purple-700 text-sm font-mono flex items-center gap-2">
              <Database className="w-4 h-4" /> Artifacts ({artifacts.length})
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Files, intel, logs, or drops players can collect
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-700 hover:bg-purple-600 text-black">
                <Plus className="w-4 h-4 mr-2" /> Add Artifact
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(var(--card))] border-purple-900/50 text-foreground">
              <DialogHeader>
                <DialogTitle className="text-purple-700 font-orbitron">Create Artifact</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Artifact ID (e.g., artifact-01)"
                  value={newArtifact.id || ""}
                  onChange={(e) => setNewArtifact({ ...newArtifact, id: e.target.value })}
                  className="bg-black/50 border-purple-900/30 text-purple-700"
                />
                <Input
                  placeholder="Name"
                  value={newArtifact.name || ""}
                  onChange={(e) => setNewArtifact({ ...newArtifact, name: e.target.value })}
                  className="bg-black/50 border-purple-900/30 text-purple-700"
                />
                <Textarea
                  placeholder="Description"
                  value={newArtifact.description || ""}
                  onChange={(e) => setNewArtifact({ ...newArtifact, description: e.target.value })}
                  className="bg-black/50 border-purple-900/30 text-purple-700"
                />
                <Input
                  placeholder="Content"
                  value={newArtifact.content || ""}
                  onChange={(e) => setNewArtifact({ ...newArtifact, content: e.target.value })}
                  className="bg-black/50 border-purple-900/30 text-purple-700"
                />
                <Input
                  placeholder="Category (file, log, intel...)"
                  value={newArtifact.category || ""}
                  onChange={(e) => setNewArtifact({ ...newArtifact, category: e.target.value })}
                  className="bg-black/50 border-purple-900/30 text-purple-700"
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
                  className="bg-black/50 border-purple-900/30 text-purple-700"
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
                <CardTitle className="text-purple-700 text-sm font-mono">{artifact.name}</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">{artifact.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">{artifact.description}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="border-purple-700 text-purple-700 text-[8px]">
                    {artifact.category || "general"}
                  </Badge>
                  {artifact.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-border text-muted-foreground text-[8px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingArtifact(artifact)}
                    className="border-purple-700 text-purple-700"
                  >
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteArtifact.mutate(artifact.id)}
                    className="text-red-700"
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
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-amber-800 text-sm font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Mystical Popups
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Tarot + Zodiac collectibles
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={seedMysticalDefaults} className="border-amber-700 text-amber-800">
              Seed Defaults
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[10px] text-amber-800 uppercase">Tarot Cards</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {tarotCards.map((card) => (
                  <div key={card.cardId} className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded border border-amber-900/20">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">{card.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-amber-800 text-xs font-bold">{card.name} <span className="text-muted-foreground">({card.symbol})</span></p>
                        <p className="text-muted-foreground text-[10px] line-clamp-1">{card.hint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setEditingMysticalCard(card)}
                        className="text-amber-800 h-7 w-7 p-0"
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
              <Label className="text-[10px] text-purple-700 uppercase">Zodiac Signs</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {zodiacCards.map((card) => (
                  <div key={card.cardId} className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded border border-purple-900/20">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl text-purple-700">{card.symbol}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-purple-700 text-xs font-bold">{card.name} <span className="text-muted-foreground">({card.element})</span></p>
                        <p className="text-muted-foreground text-[10px] line-clamp-1">{card.hint}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setEditingMysticalCard(card)}
                        className="text-purple-700 h-7 w-7 p-0"
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

        <Card className="bg-[hsl(var(--card))] border-teal-900/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-teal-800 text-sm font-mono flex items-center gap-2">
                <Zap className="w-4 h-4" /> Quantum Popups
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Probability events + quantum messages
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={seedQuantumDefaults} className="border-teal-700 text-teal-800">
              Seed Defaults
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[10px] text-teal-800 uppercase">Events</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {quantumEvents.map((event) => (
                  <div key={event.id} className="bg-black/40 p-2 rounded border border-teal-900/20">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-teal-300 text-xs font-bold">{event.name}</p>
                        <p className="text-muted-foreground text-[10px]">{event.description}</p>
                        <p className="text-teal-800 text-[10px]">Base: {event.baseProb}%</p>
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
              <Label className="text-[10px] text-teal-800 uppercase">Messages</Label>
              <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                {quantumMessages.map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded border border-teal-900/20">
                    <p className="text-muted-foreground text-[10px]">{msg.message}</p>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={msg.enabled}
                        onCheckedChange={(enabled) => updateQuantumMessage.mutate({ ...msg, enabled })}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteQuantumMessage.mutate(msg.id)}
                        className="text-red-700"
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
        <DialogContent className="bg-[hsl(var(--card))] border-purple-900/50 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-purple-700 font-orbitron">Edit Artifact</DialogTitle>
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
        <DialogContent className="bg-[hsl(var(--card))] border-amber-900/50 text-foreground">
          <DialogHeader>
            <DialogTitle className={`font-orbitron ${editingMysticalCard?.type === 'tarot' ? 'text-amber-800' : 'text-purple-700'}`}>
              Edit {editingMysticalCard?.type === 'tarot' ? 'Tarot Card' : 'Zodiac Sign'}
            </DialogTitle>
          </DialogHeader>
          {editingMysticalCard && (
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase">Name</Label>
                <Input 
                  value={editingMysticalCard.name} 
                  onChange={(e) => setEditingMysticalCard({ ...editingMysticalCard, name: e.target.value })}
                  className="bg-black/50 border-border"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase">Symbol</Label>
                <Input 
                  value={editingMysticalCard.symbol || ''} 
                  onChange={(e) => setEditingMysticalCard({ ...editingMysticalCard, symbol: e.target.value })}
                  className="bg-black/50 border-border"
                />
              </div>
              {editingMysticalCard.type === 'tarot' && (
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Icon (emoji)</Label>
                  <Input 
                    value={editingMysticalCard.icon || ''} 
                    onChange={(e) => setEditingMysticalCard({ ...editingMysticalCard, icon: e.target.value })}
                    className="bg-black/50 border-border"
                  />
                </div>
              )}
              {editingMysticalCard.type === 'zodiac' && (
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Element</Label>
                  <Input 
                    value={editingMysticalCard.element || ''} 
                    onChange={(e) => setEditingMysticalCard({ ...editingMysticalCard, element: e.target.value })}
                    className="bg-black/50 border-border"
                    placeholder="Fire, Water, Earth, Air"
                  />
                </div>
              )}
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase">Hint / Clue Text</Label>
                <Textarea 
                  value={editingMysticalCard.hint} 
                  onChange={(e) => setEditingMysticalCard({ ...editingMysticalCard, hint: e.target.value })}
                  className="bg-black/50 border-border min-h-[80px]"
                  placeholder="The mystical message or game hint..."
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingMysticalCard.enabled}
                    onCheckedChange={(enabled) => setEditingMysticalCard({ ...editingMysticalCard, enabled })}
                  />
                  <Label className="text-xs text-muted-foreground">Enabled</Label>
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
