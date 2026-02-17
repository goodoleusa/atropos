import { useState, useMemo } from "react";
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
import { Slider } from "@/components/ui/slider";
import {
  Plus, Search, Edit, Trash2, Star, Key, Terminal, Trophy, Sparkles,
  Zap, Link2, X, MessageSquare, Layers, Award
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

interface GameClue {
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

interface DesignerCampaign {
  id: string;
  name: string;
}

interface AchievementDef {
  id: number;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xpReward: number;
  condition: {
    type: string;
    value: number | string;
    comparison?: string;
  };
  isActive: boolean;
  isHidden: boolean;
  sortOrder: number;
}

const TABS = [
  { id: "clues", label: "Clues & Evidence", icon: Key },
  { id: "terminal", label: "Terminal Commands", icon: Terminal },
  { id: "quests", label: "Missions & Quests", icon: Trophy },
  { id: "mystical", label: "Mystical Messages", icon: Sparkles },
  { id: "quantum", label: "Quantum Popups", icon: Zap },
  { id: "campaigns", label: "Campaign Links", icon: Link2 },
  { id: "achievements", label: "Achievements", icon: Award },
] as const;

const CATEGORIES = ["general", "osint", "crypto", "network", "social", "forensics"];

const DifficultyStars = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i <= value ? "text-amber-500 fill-amber-500" : "text-stone-700"} ${onChange ? "cursor-pointer" : ""}`}
        onClick={() => onChange?.(i)}
        data-testid={`star-${i}`}
      />
    ))}
  </div>
);

function useFetch<T>(key: string, url: string, fallback: T) {
  return useQuery<T>({ queryKey: [key], queryFn: () => fetch(url).then((r) => r.json()) }).data ?? fallback;
}

export function GameplaySection() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<string>("clues");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [linkDialogClue, setLinkDialogClue] = useState<SharedClue | null>(null);
  const [newMsg, setNewMsg] = useState("");

  const sharedClues = useFetch<SharedClue[]>("/api/designer/clues", "/api/designer/clues", []);
  const gameClues = useFetch<GameClue[]>("/api/clues", "/api/clues", []);
  const quests = useFetch<Quest[]>("/api/quests", "/api/quests", []);
  const mysticalCards = useFetch<MysticalCard[]>("/api/mystical-cards", "/api/mystical-cards", []);
  const quantumEvents = useFetch<QuantumEvent[]>("/api/quantum/events", "/api/quantum/events", []);
  const quantumMessages = useFetch<QuantumMessage[]>("/api/quantum/messages", "/api/quantum/messages", []);
  const campaigns = useFetch<DesignerCampaign[]>("/api/designer/campaigns", "/api/designer/campaigns", []);
  const achievements = useFetch<AchievementDef[]>("/api/gameplay/achievements/all", "/api/gameplay/achievements/all", []);

  const terminalClues = useMemo(() => gameClues.filter((c) => c.location?.startsWith("terminal")), [gameClues]);

  const mutation = (method: string, urlFn: (d: any) => string, keys: string[], resetFn?: () => void) =>
    useMutation({
      mutationFn: (data: any) =>
        fetch(urlFn(data), {
          method,
          headers: { "Content-Type": "application/json" },
          body: method !== "DELETE" ? JSON.stringify(data) : undefined,
        }).then(async (r) => {
          if (!r.ok) throw new Error((await r.json()).error || "Request failed");
          return r.json();
        }),
      onSuccess: () => {
        keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
        resetFn?.();
        toast({ title: "Success" });
      },
      onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });

  const upsertClue = mutation("PUT", (d) => `/api/designer/clues/${d.clueId}`, ["/api/designer/clues"], () => { setDialogOpen(false); setEditItem(null); });
  const deleteClue = mutation("DELETE", (id) => `/api/designer/clues/${id}`, ["/api/designer/clues"]);
  const createGameClue = mutation("POST", () => "/api/clues", ["/api/clues"], () => { setDialogOpen(false); setEditItem(null); });
  const updateGameClue = mutation("PUT", (d) => `/api/clues/${d.id}`, ["/api/clues"], () => { setEditItem(null); });
  const deleteGameClue = mutation("DELETE", (id) => `/api/clues/${id}`, ["/api/clues"]);
  const createQuest = mutation("POST", () => "/api/quests", ["/api/quests"], () => { setDialogOpen(false); setEditItem(null); });
  const updateQuest = mutation("PUT", (d) => `/api/quests/${d.id}`, ["/api/quests"], () => { setEditItem(null); });
  const deleteQuest = mutation("DELETE", (id) => `/api/quests/${id}`, ["/api/quests"]);
  const upsertCard = mutation("PUT", (d) => `/api/mystical-cards/${d.cardId}`, ["/api/mystical-cards"], () => { setDialogOpen(false); setEditItem(null); });
  const deleteCard = mutation("DELETE", (id) => `/api/mystical-cards/${id}`, ["/api/mystical-cards"]);
  const upsertEvent = mutation("PUT", (d) => `/api/quantum/events/${d.id}`, ["/api/quantum/events"]);
  const createQMsg = mutation("POST", () => "/api/quantum/messages", ["/api/quantum/messages"], () => setNewMsg(""));
  const updateQMsg = mutation("PATCH", (d) => `/api/quantum/messages/${d.id}`, ["/api/quantum/messages"]);
  const deleteQMsg = mutation("DELETE", (id) => `/api/quantum/messages/${id}`, ["/api/quantum/messages"]);
  const upsertAchievement = mutation("POST", () => "/api/gameplay/achievements", ["/api/gameplay/achievements/all"], () => { setDialogOpen(false); setEditItem(null); });
  const deleteAchievement = mutation("DELETE", (id) => `/api/gameplay/achievements/${id}`, ["/api/gameplay/achievements/all"]);

  const filtered = <T extends Record<string, any>>(items: T[], fields: string[]) =>
    search ? items.filter((i) => fields.some((f) => String(i[f] || "").toLowerCase().includes(search.toLowerCase()))) : items;

  const openCreate = (defaults: any = {}) => { setEditItem(defaults); setDialogOpen(true); };
  const inp = "bg-black/50 border-amber-900/30 text-amber-500";

  const handleCampaignLink = (clue: SharedClue, campaignId: string, add: boolean) => {
    const current = clue.usedInCampaigns || [];
    const updated = add ? Array.from(new Set([...current, campaignId])) : current.filter((c) => c !== campaignId);
    upsertClue.mutate({ ...clue, usedInCampaigns: updated });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-amber-600 flex items-center gap-2">
          <Layers className="w-5 h-5" /> Gameplay Elements
        </h3>
        <Badge variant="outline" className="border-amber-700 text-amber-400" data-testid="gameplay-badge">
          {sharedClues.length} Clues · {quests.length} Quests
        </Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0" data-testid="gameplay-tabs">
        {TABS.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={tab === t.id ? "default" : "ghost"}
            className={`shrink-0 min-h-[44px] min-w-[120px] md:min-w-0 ${tab === t.id ? "bg-amber-700 text-black" : "text-stone-400 hover:text-amber-400 border border-stone-800/30 md:border-0"}`}
            onClick={() => { setTab(t.id); setSearch(""); }}
            data-testid={`tab-${t.id}`}
          >
            <t.icon className="w-4 h-4 mr-2" /> {t.label}
          </Button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`pl-10 ${inp}`}
          data-testid="gameplay-search"
        />
      </div>

      {tab === "clues" && (
        <>
          <div className="flex justify-end">
            <Button className="bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" onClick={() => openCreate({ clueId: "", name: "", description: "", content: "", tags: [], usedInCampaigns: [], linkedClues: [], difficulty: 1, category: "general" })} data-testid="create-clue-btn">
              <Plus className="w-4 h-4 mr-2" /> Create New Clue
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered(sharedClues, ["name", "category", "description"]).map((clue) => (
              <Card key={clue.clueId} className="bg-[#0a0500] border-amber-900/30" data-testid={`clue-card-${clue.clueId}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                    <Key className="w-4 h-4" /> {clue.name}
                  </CardTitle>
                  <CardDescription className="text-stone-600 text-xs font-mono">{clue.clueId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-stone-400 line-clamp-2">{clue.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-amber-700 text-amber-400 text-[10px]">{clue.category || "general"}</Badge>
                    <DifficultyStars value={clue.difficulty || 1} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {clue.tags?.map((t) => <Badge key={t} variant="outline" className="border-stone-700 text-stone-500 text-[8px]">{t}</Badge>)}
                  </div>
                  {clue.usedInCampaigns?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {clue.usedInCampaigns.map((c) => <Badge key={c} className="bg-teal-900/30 text-teal-400 text-[8px]">{c}</Badge>)}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="border-amber-700 text-amber-400 min-h-[44px]" onClick={() => { setEditItem(clue); setDialogOpen(true); }} data-testid={`edit-clue-${clue.clueId}`}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                    <Button size="sm" variant="outline" className="border-teal-700 text-teal-400 min-h-[44px]" onClick={() => setLinkDialogClue(clue)} data-testid={`link-clue-${clue.clueId}`}><Link2 className="w-3 h-3 mr-1" /> Campaigns</Button>
                    <Button size="sm" variant="ghost" className="text-red-400 min-h-[44px]" onClick={() => deleteClue.mutate(clue.clueId)} data-testid={`delete-clue-${clue.clueId}`}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {dialogOpen && editItem && tab === "clues" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 w-full max-w-lg">
                <DialogHeader><DialogTitle className="text-amber-600 font-orbitron">{editItem.clueId ? "Edit Clue" : "Create Clue"}</DialogTitle></DialogHeader>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 scrollbar-thin">
                  <div className="space-y-1.5">
                    <Label className="text-amber-600 text-[10px] uppercase font-bold">Identity</Label>
                    <Input placeholder="Clue ID" value={editItem.clueId} onChange={(e) => setEditItem({ ...editItem, clueId: e.target.value })} className={inp} data-testid="input-clue-id" />
                    <Input placeholder="Name" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className={inp} data-testid="input-clue-name" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-amber-600 text-[10px] uppercase font-bold">Content</Label>
                    <Textarea placeholder="Description" value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} className={`${inp} min-h-[80px]`} data-testid="input-clue-desc" />
                    <Textarea placeholder="Content" value={editItem.content} onChange={(e) => setEditItem({ ...editItem, content: e.target.value })} className={`${inp} min-h-[100px]`} data-testid="input-clue-content" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-amber-600 text-[10px] uppercase font-bold">Category</Label>
                      <Select value={editItem.category || "general"} onValueChange={(v) => setEditItem({ ...editItem, category: v })}>
                        <SelectTrigger className={`${inp} h-11`} data-testid="select-clue-category"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-stone-950 border-amber-900/30">{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-amber-600 text-[10px] uppercase font-bold">Difficulty</Label>
                      <div className="pt-2">
                        <DifficultyStars value={editItem.difficulty || 1} onChange={(v) => setEditItem({ ...editItem, difficulty: v })} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-amber-600 text-[10px] uppercase font-bold">Metadata</Label>
                    <Input placeholder="Tags (comma-separated)" value={editItem.tags?.join(", ") || ""} onChange={(e) => setEditItem({ ...editItem, tags: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) })} className={inp} data-testid="input-clue-tags" />
                  </div>

                  <Button className="w-full bg-amber-700 hover:bg-amber-600 text-black min-h-[48px] font-bold text-sm mt-4" onClick={() => upsertClue.mutate(editItem)} data-testid="save-clue-btn">{upsertClue.isPending ? "Saving..." : "Save Clue"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {linkDialogClue && (
            <Dialog open={!!linkDialogClue} onOpenChange={() => setLinkDialogClue(null)}>
              <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 w-full max-w-md">
                <DialogHeader><DialogTitle className="text-teal-400 font-orbitron">Campaign Links: {linkDialogClue.name}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Label className="text-amber-600 text-xs">Linked Campaigns</Label>
                  <div className="flex flex-wrap gap-1 min-h-[32px]">
                    {(linkDialogClue.usedInCampaigns || []).map((c) => (
                      <Badge key={c} className="bg-teal-900/30 text-teal-400 cursor-pointer" onClick={() => { handleCampaignLink(linkDialogClue, c, false); setLinkDialogClue({ ...linkDialogClue, usedInCampaigns: linkDialogClue.usedInCampaigns.filter((x) => x !== c) }); }} data-testid={`unlink-campaign-${c}`}>
                        {c} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                    {(!linkDialogClue.usedInCampaigns || linkDialogClue.usedInCampaigns.length === 0) && <span className="text-stone-600 text-xs">No campaigns linked</span>}
                  </div>
                  <Label className="text-amber-600 text-xs">Add to Campaign</Label>
                  <Select onValueChange={(v) => { handleCampaignLink(linkDialogClue, v, true); setLinkDialogClue({ ...linkDialogClue, usedInCampaigns: Array.from(new Set([...(linkDialogClue.usedInCampaigns || []), v])) }); }}>
                    <SelectTrigger className={inp} data-testid="select-add-campaign"><SelectValue placeholder="Select campaign..." /></SelectTrigger>
                    <SelectContent className="bg-stone-950 border-amber-900/30">
                      {campaigns.filter((c) => !(linkDialogClue.usedInCampaigns || []).includes(c.id)).map((c) => <SelectItem key={c.id} value={c.id}>{c.name || c.id}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {tab === "terminal" && (
        <>
          <div className="flex justify-end">
            <Button className="bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" onClick={() => openCreate({ id: "", name: "", description: "", content: "", location: "terminal", difficulty: 1 })} data-testid="create-terminal-btn">
              <Plus className="w-4 h-4 mr-2" /> Add Terminal Command
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered(terminalClues, ["name", "description"]).map((clue) => (
              <Card key={clue.id} className="bg-[#0a0500] border-amber-900/30" data-testid={`terminal-card-${clue.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2"><Terminal className="w-4 h-4" /> {clue.name}</CardTitle>
                  <CardDescription className="text-stone-600 text-xs font-mono">{clue.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-stone-400">{clue.description}</p>
                  <pre className="bg-black/50 p-2 rounded text-green-400 text-[10px] overflow-x-auto">{clue.content}</pre>
                  <DifficultyStars value={clue.difficulty || 1} />
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="border-amber-700 text-amber-400 min-h-[44px]" onClick={() => { setEditItem(clue); setDialogOpen(true); }} data-testid={`edit-terminal-${clue.id}`}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                    <Button size="sm" variant="ghost" className="text-red-400 min-h-[44px]" onClick={() => deleteGameClue.mutate(clue.id)} data-testid={`delete-terminal-${clue.id}`}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {terminalClues.length === 0 && <p className="text-stone-600 col-span-3 text-center py-8">No terminal commands defined.</p>}
          </div>
          {dialogOpen && editItem && tab === "terminal" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 w-full max-w-lg">
                <DialogHeader><DialogTitle className="text-amber-600 font-orbitron">{editItem.id ? "Edit Terminal Command" : "Create Terminal Command"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Command ID" value={editItem.id} onChange={(e) => setEditItem({ ...editItem, id: e.target.value })} className={inp} data-testid="input-terminal-id" />
                  <Input placeholder="Name" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className={inp} data-testid="input-terminal-name" />
                  <Textarea placeholder="Description" value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} className={inp} data-testid="input-terminal-desc" />
                  <Textarea placeholder="Terminal output content" value={editItem.content} onChange={(e) => setEditItem({ ...editItem, content: e.target.value })} className={`${inp} font-mono`} data-testid="input-terminal-content" />
                  <div>
                    <Label className="text-amber-600 text-xs">Difficulty</Label>
                    <DifficultyStars value={editItem.difficulty || 1} onChange={(v) => setEditItem({ ...editItem, difficulty: v })} />
                  </div>
                  <Button className="w-full bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" onClick={() => (editItem.id && gameClues.find((c) => c.id === editItem.id) ? updateGameClue : createGameClue).mutate({ ...editItem, location: editItem.location || "terminal" })} data-testid="save-terminal-btn">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {tab === "quests" && (
        <>
          <div className="flex justify-end">
            <Button className="bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" onClick={() => openCreate({ id: "", name: "", description: "", requiredClues: [], reward: "", unlocks: "" })} data-testid="create-quest-btn">
              <Plus className="w-4 h-4 mr-2" /> Create Quest
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered(quests, ["name", "description"]).map((quest) => (
              <Card key={quest.id} className="bg-[#0a0500] border-amber-900/30" data-testid={`quest-card-${quest.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2"><Trophy className="w-4 h-4" /> {quest.name}</CardTitle>
                  <CardDescription className="text-stone-600 text-xs font-mono">{quest.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-stone-400">{quest.description}</p>
                  <p className="text-amber-700">Required: {quest.requiredClues?.join(", ") || "None"}</p>
                  {quest.reward && <p className="text-teal-500">Reward: {quest.reward}</p>}
                  {quest.unlocks && <p className="text-amber-600">Unlocks: {quest.unlocks}</p>}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="border-amber-700 text-amber-400 min-h-[44px]" onClick={() => { setEditItem(quest); setDialogOpen(true); }} data-testid={`edit-quest-${quest.id}`}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                    <Button size="sm" variant="ghost" className="text-red-400 min-h-[44px]" onClick={() => deleteQuest.mutate(quest.id)} data-testid={`delete-quest-${quest.id}`}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {quests.length === 0 && <p className="text-stone-600 col-span-3 text-center py-8">No quests defined yet.</p>}
          </div>
          {dialogOpen && editItem && tab === "quests" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 w-full max-w-lg">
                <DialogHeader><DialogTitle className="text-amber-600 font-orbitron">{editItem.id ? "Edit Quest" : "Create Quest"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Quest ID" value={editItem.id} onChange={(e) => setEditItem({ ...editItem, id: e.target.value })} className={inp} data-testid="input-quest-id" />
                  <Input placeholder="Name" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className={inp} data-testid="input-quest-name" />
                  <Textarea placeholder="Description" value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} className={inp} data-testid="input-quest-desc" />
                  <div>
                    <Label className="text-amber-600 text-xs">Required Clues</Label>
                    <div className="flex flex-wrap gap-1 min-h-[32px] mt-1 p-2 bg-black/30 rounded border border-amber-900/20">
                      {(editItem.requiredClues || []).map((clueId: string) => {
                        const clue = sharedClues.find(c => c.clueId === clueId);
                        return (
                          <Badge key={clueId} className="bg-amber-900/30 text-amber-400 cursor-pointer text-[10px]" 
                            onClick={() => setEditItem({ ...editItem, requiredClues: editItem.requiredClues.filter((c: string) => c !== clueId) })}
                            data-testid={`remove-req-clue-${clueId}`}>
                            {clue?.name || clueId} <X className="w-2.5 h-2.5 ml-1" />
                          </Badge>
                        );
                      })}
                      {(!editItem.requiredClues || editItem.requiredClues.length === 0) && (
                        <span className="text-stone-600 text-xs">No clues required</span>
                      )}
                    </div>
                    <Select onValueChange={(v) => setEditItem({ ...editItem, requiredClues: Array.from(new Set([...(editItem.requiredClues || []), v])) })}>
                      <SelectTrigger className="mt-1 bg-black/50 border-amber-900/30 text-amber-500" data-testid="select-add-req-clue">
                        <SelectValue placeholder="Add required clue..." />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-950 border-amber-900/30 max-h-[200px]">
                        {sharedClues.filter(c => !(editItem.requiredClues || []).includes(c.clueId)).map(c => (
                          <SelectItem key={c.clueId} value={c.clueId}>{c.name} ({c.category})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input placeholder="Reward" value={editItem.reward || ""} onChange={(e) => setEditItem({ ...editItem, reward: e.target.value })} className={inp} data-testid="input-quest-reward" />
                  <div>
                    <Label className="text-amber-600 text-xs">Unlocks (Quest ID)</Label>
                    <Select value={editItem.unlocks || ""} onValueChange={(v) => setEditItem({ ...editItem, unlocks: v })}>
                      <SelectTrigger className="bg-black/50 border-amber-900/30 text-amber-500" data-testid="select-quest-unlocks">
                        <SelectValue placeholder="Select quest to unlock..." />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-950 border-amber-900/30">
                        <SelectItem value="">None</SelectItem>
                        {quests.filter(q => q.id !== editItem.id).map(q => (
                          <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" onClick={() => (quests.find((q) => q.id === editItem.id) ? updateQuest : createQuest).mutate(editItem)} data-testid="save-quest-btn">Save Quest</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {tab === "mystical" && (
        <>
          <div className="flex justify-end">
            <Button className="bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" onClick={() => openCreate({ cardId: "", type: "tarot", name: "", symbol: "", hint: "", element: "", enabled: true })} data-testid="create-card-btn">
              <Plus className="w-4 h-4 mr-2" /> Create Card
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered(mysticalCards, ["name", "type", "hint"]).map((card) => (
              <Card key={card.cardId} className="bg-[#0a0500] border-amber-900/30" data-testid={`card-${card.cardId}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> {card.name}
                  </CardTitle>
                  <CardDescription className="text-stone-600 text-xs flex items-center gap-2">
                    <Badge variant="outline" className="border-purple-700 text-purple-400 text-[10px]">{card.type}</Badge>
                    {card.symbol && <span>{card.symbol}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-stone-400">{card.hint}</p>
                  {card.element && <Badge variant="outline" className="border-stone-700 text-stone-500 text-[10px]">{card.element}</Badge>}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-stone-500 text-xs">Enabled</Label>
                      <Switch checked={card.enabled} onCheckedChange={(v) => upsertCard.mutate({ ...card, enabled: v })} data-testid={`toggle-card-${card.cardId}`} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-amber-700 text-amber-400 min-h-[44px]" onClick={() => { setEditItem(card); setDialogOpen(true); }} data-testid={`edit-card-${card.cardId}`}><Edit className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-400 min-h-[44px]" onClick={() => deleteCard.mutate(card.cardId)} data-testid={`delete-card-${card.cardId}`}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {dialogOpen && editItem && tab === "mystical" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 w-full max-w-lg">
                <DialogHeader><DialogTitle className="text-amber-600 font-orbitron">{editItem.cardId ? "Edit Card" : "Create Card"}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Card ID" value={editItem.cardId} onChange={(e) => setEditItem({ ...editItem, cardId: e.target.value })} className={inp} data-testid="input-card-id" />
                  <Select value={editItem.type} onValueChange={(v) => setEditItem({ ...editItem, type: v })}>
                    <SelectTrigger className={inp} data-testid="select-card-type"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-stone-950 border-amber-900/30"><SelectItem value="tarot">Tarot</SelectItem><SelectItem value="zodiac">Zodiac</SelectItem></SelectContent>
                  </Select>
                  <Input placeholder="Name" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className={inp} data-testid="input-card-name" />
                  <Input placeholder="Symbol" value={editItem.symbol || ""} onChange={(e) => setEditItem({ ...editItem, symbol: e.target.value })} className={inp} data-testid="input-card-symbol" />
                  <Textarea placeholder="Hint" value={editItem.hint} onChange={(e) => setEditItem({ ...editItem, hint: e.target.value })} className={inp} data-testid="input-card-hint" />
                  <Input placeholder="Element" value={editItem.element || ""} onChange={(e) => setEditItem({ ...editItem, element: e.target.value })} className={inp} data-testid="input-card-element" />
                  <Button className="w-full bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" onClick={() => upsertCard.mutate(editItem)} data-testid="save-card-btn">Save Card</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {tab === "quantum" && (
        <div className="space-y-6">
          <Card className="bg-[#0a0500] border-amber-900/30">
            <CardHeader>
              <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2"><Zap className="w-4 h-4" /> Quantum Events ({quantumEvents.length})</CardTitle>
              <CardDescription className="text-stone-500 text-xs">Random popup events with probability control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filtered(quantumEvents, ["name", "description"]).map((event) => (
                <div key={event.id} className="bg-black/30 border border-amber-900/20 rounded p-3 space-y-2" data-testid={`event-${event.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 text-sm font-mono">{event.name}</span>
                    <Switch checked={event.enabled} onCheckedChange={(v) => upsertEvent.mutate({ ...event, enabled: v })} data-testid={`toggle-event-${event.id}`} />
                  </div>
                  <p className="text-stone-400 text-xs">{event.description}</p>
                  <div className="flex items-center gap-3">
                    <Label className="text-stone-500 text-xs shrink-0">Probability: {event.baseProb}%</Label>
                    <Slider value={[event.baseProb]} min={0} max={100} step={1} onValueCommit={(v) => upsertEvent.mutate({ ...event, baseProb: v[0] })} className="flex-1" data-testid={`slider-event-${event.id}`} />
                  </div>
                </div>
              ))}
              {quantumEvents.length === 0 && <p className="text-stone-600 text-center py-4">No quantum events configured.</p>}
            </CardContent>
          </Card>

          <Card className="bg-[#0a0500] border-amber-900/30">
            <CardHeader>
              <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Quantum Messages ({quantumMessages.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input placeholder="New quantum message..." value={newMsg} onChange={(e) => setNewMsg(e.target.value)} className={`flex-1 ${inp}`} data-testid="input-new-qmsg" />
                <Button className="bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" onClick={() => newMsg && createQMsg.mutate({ message: newMsg, enabled: true })} data-testid="add-qmsg-btn"><Plus className="w-4 h-4" /></Button>
              </div>
              {filtered(quantumMessages, ["message"]).map((msg) => (
                <div key={msg.id} className="flex items-center gap-3 bg-black/30 border border-amber-900/20 rounded p-2" data-testid={`qmsg-${msg.id}`}>
                  <Switch checked={msg.enabled} onCheckedChange={(v) => updateQMsg.mutate({ ...msg, enabled: v })} data-testid={`toggle-qmsg-${msg.id}`} />
                  <span className="text-stone-300 text-xs flex-1">{msg.message}</span>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteQMsg.mutate(msg.id)} data-testid={`delete-qmsg-${msg.id}`}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "campaigns" && (
        <div className="space-y-4">
          <p className="text-stone-400 text-xs">Overview of campaigns and their linked gameplay elements. Select a campaign to see linked clues and quests.</p>
          {campaigns.length === 0 && <p className="text-stone-600 text-center py-8">No campaigns found. Create campaigns in the Campaign Designer first.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered(campaigns, ["name", "id"]).map((campaign) => {
              const linkedClues = sharedClues.filter((c) => c.usedInCampaigns?.includes(campaign.id));
              return (
                <Card key={campaign.id} className="bg-[#0a0500] border-amber-900/30" data-testid={`campaign-link-${campaign.id}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2"><Link2 className="w-4 h-4" /> {campaign.name || campaign.id}</CardTitle>
                    <CardDescription className="text-stone-600 text-xs font-mono">{campaign.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div>
                      <Label className="text-amber-600 text-[10px] uppercase">Linked Clues ({linkedClues.length})</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {linkedClues.map((c) => (
                          <Badge key={c.clueId} className="bg-teal-900/30 text-teal-400 text-[8px] cursor-pointer" onClick={() => handleCampaignLink(c, campaign.id, false)} data-testid={`unlink-${campaign.id}-${c.clueId}`}>
                            {c.name} <X className="w-2.5 h-2.5 ml-0.5" />
                          </Badge>
                        ))}
                        {linkedClues.length === 0 && <span className="text-stone-600 text-[10px]">No clues linked</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-amber-600 text-[10px] uppercase">Quick Add Clue</Label>
                      <Select onValueChange={(v) => { const clue = sharedClues.find((c) => c.clueId === v); if (clue) handleCampaignLink(clue, campaign.id, true); }}>
                        <SelectTrigger className={`mt-1 ${inp}`} data-testid={`quickadd-${campaign.id}`}><SelectValue placeholder="Add clue..." /></SelectTrigger>
                        <SelectContent className="bg-stone-950 border-amber-900/30">
                          {sharedClues.filter((c) => !c.usedInCampaigns?.includes(campaign.id)).map((c) => <SelectItem key={c.clueId} value={c.clueId}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {tab === "achievements" && (
        <>
          <div className="flex justify-end">
            <Button className="bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" onClick={() => openCreate({
              achievementId: "", name: "", description: "", icon: "🏆", category: "general",
              rarity: "common", xpReward: 100, condition: { type: "clue_count", value: 1, comparison: "gte" },
              isActive: true, isHidden: false, sortOrder: 0
            })} data-testid="create-achievement-btn">
              <Plus className="w-4 h-4 mr-2" /> Create Achievement
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered(achievements, ["name", "description", "category"]).map((ach) => (
              <Card key={ach.achievementId} className="bg-[#0a0500] border-amber-900/30" data-testid={`achievement-card-${ach.achievementId}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                    <span>{ach.icon}</span> {ach.name}
                  </CardTitle>
                  <CardDescription className="text-stone-600 text-xs font-mono flex items-center gap-2">
                    {ach.achievementId}
                    <Badge variant="outline" className={`text-[8px] ${
                      ach.rarity === "legendary" ? "border-amber-500 text-amber-400" :
                      ach.rarity === "epic" ? "border-purple-500 text-purple-400" :
                      ach.rarity === "rare" ? "border-cyan-500 text-cyan-400" :
                      ach.rarity === "uncommon" ? "border-teal-500 text-teal-400" :
                      "border-stone-600 text-stone-500"
                    }`}>{ach.rarity}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-stone-400">{ach.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-amber-700 text-amber-400 text-[10px]">{ach.category}</Badge>
                    <span className="text-amber-700 text-[10px]">{ach.xpReward} XP</span>
                    <span className="text-stone-600 text-[10px]">
                      {ach.condition.type}: {ach.condition.comparison || "gte"} {ach.condition.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-stone-500 text-xs">Active</Label>
                      <Switch checked={ach.isActive} onCheckedChange={(v) => upsertAchievement.mutate({ ...ach, isActive: v })} data-testid={`toggle-ach-${ach.achievementId}`} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-amber-700 text-amber-400 min-h-[44px]" onClick={() => { setEditItem(ach); setDialogOpen(true); }} data-testid={`edit-ach-${ach.achievementId}`}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                      <Button size="sm" variant="ghost" className="text-red-400 min-h-[44px]" onClick={() => deleteAchievement.mutate(ach.achievementId)} data-testid={`delete-ach-${ach.achievementId}`}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {achievements.length === 0 && <p className="text-stone-600 col-span-3 text-center py-8">No achievements defined. Create one to get started.</p>}
          </div>
          {dialogOpen && editItem && tab === "achievements" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 w-full max-w-lg">
                <DialogHeader><DialogTitle className="text-amber-600 font-orbitron">{editItem.achievementId ? "Edit Achievement" : "Create Achievement"}</DialogTitle></DialogHeader>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  <Input placeholder="Achievement ID (snake_case)" value={editItem.achievementId} onChange={(e) => setEditItem({ ...editItem, achievementId: e.target.value })} className={inp} data-testid="input-ach-id" />
                  <Input placeholder="Name" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className={inp} data-testid="input-ach-name" />
                  <Textarea placeholder="Description" value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} className={inp} data-testid="input-ach-desc" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-amber-600 text-xs">Icon (emoji)</Label>
                      <Input value={editItem.icon} onChange={(e) => setEditItem({ ...editItem, icon: e.target.value })} className={inp} data-testid="input-ach-icon" />
                    </div>
                    <div>
                      <Label className="text-amber-600 text-xs">XP Reward</Label>
                      <Input type="number" value={editItem.xpReward} onChange={(e) => setEditItem({ ...editItem, xpReward: Number(e.target.value) })} className={inp} data-testid="input-ach-xp" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-amber-600 text-xs">Category</Label>
                      <Select value={editItem.category} onValueChange={(v) => setEditItem({ ...editItem, category: v })}>
                        <SelectTrigger className={inp} data-testid="select-ach-category"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-stone-950 border-amber-900/30">
                          {["general", "discovery", "speed", "mastery", "social", "special"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-amber-600 text-xs">Rarity</Label>
                      <Select value={editItem.rarity} onValueChange={(v) => setEditItem({ ...editItem, rarity: v })}>
                        <SelectTrigger className={inp} data-testid="select-ach-rarity"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-stone-950 border-amber-900/30">
                          {["common", "uncommon", "rare", "epic", "legendary"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-amber-600 text-xs">Unlock Condition</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <Select value={editItem.condition?.type || "clue_count"} onValueChange={(v) => setEditItem({ ...editItem, condition: { ...editItem.condition, type: v } })}>
                        <SelectTrigger className={inp} data-testid="select-ach-cond-type"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-stone-950 border-amber-900/30">
                          {["clue_count", "quest_count", "campaign_count", "command_count", "xp_threshold", "level_threshold", "streak", "specific_clue", "specific_quest", "time_played", "custom"].map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={editItem.condition?.comparison || "gte"} onValueChange={(v) => setEditItem({ ...editItem, condition: { ...editItem.condition, comparison: v } })}>
                        <SelectTrigger className={inp} data-testid="select-ach-cond-comp"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-stone-950 border-amber-900/30">
                          <SelectItem value="gte">at least</SelectItem>
                          <SelectItem value="eq">exactly</SelectItem>
                          <SelectItem value="includes">includes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Value" value={editItem.condition?.value ?? ""} onChange={(e) => setEditItem({ ...editItem, condition: { ...editItem.condition, value: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) } })} className={inp} data-testid="input-ach-cond-value" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-stone-500 text-xs">Hidden</Label>
                      <Switch checked={editItem.isHidden} onCheckedChange={(v) => setEditItem({ ...editItem, isHidden: v })} data-testid="toggle-ach-hidden" />
                    </div>
                    <div>
                      <Label className="text-stone-500 text-xs">Sort Order</Label>
                      <Input type="number" value={editItem.sortOrder ?? 0} onChange={(e) => setEditItem({ ...editItem, sortOrder: Number(e.target.value) })} className={`w-20 ml-1 ${inp}`} data-testid="input-ach-sort" />
                    </div>
                  </div>
                  <Button className="w-full bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]" onClick={() => upsertAchievement.mutate(editItem)} data-testid="save-ach-btn">
                    {upsertAchievement.isPending ? "Saving..." : "Save Achievement"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}