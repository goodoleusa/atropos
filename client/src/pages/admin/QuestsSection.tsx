import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trophy, Plus } from "lucide-react";

interface Quest {
  id: string;
  name: string;
  description: string;
  requiredClues: string[];
  reward: string | null;
  unlocks: string | null;
}

interface QuestsSectionProps {
  quests: Quest[];
}

export function QuestsSection({ quests }: QuestsSectionProps) {
  const queryClient = useQueryClient();
  const [newQuest, setNewQuest] = useState<Partial<Quest>>({});
  const [questDialogOpen, setQuestDialogOpen] = useState(false);

  const createQuestMutation = useMutation({
    mutationFn: (quest: Partial<Quest>) =>
      fetch("/api/quests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("APP_ACCESS_TOKEN") || ""
        },
        body: JSON.stringify(quest)
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || "Failed to create quest");
        }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      setQuestDialogOpen(false);
      setNewQuest({});
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-orbitron text-amber-800">Quest Chains</h3>
          <p className="text-xs text-muted-foreground mt-1">Guide players with structured quest milestones.</p>
        </div>
        <Dialog open={questDialogOpen} onOpenChange={setQuestDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-700 hover:bg-amber-600 text-black">
              <Plus className="w-4 h-4 mr-2" /> Add Quest
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[hsl(var(--card))] border-amber-900/50 text-foreground">
            <DialogHeader>
              <DialogTitle className="text-amber-800 font-orbitron">Create New Quest</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-amber-800 text-xs">Quest ID</Label>
                <Input
                  placeholder="e.g., quest-01"
                  value={newQuest.id || ""}
                  onChange={(e) => setNewQuest({ ...newQuest, id: e.target.value })}
                  className="bg-black/50 border-amber-900/30 text-amber-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-amber-800 text-xs">Quest Name</Label>
                <Input
                  placeholder="Quest Name"
                  value={newQuest.name || ""}
                  onChange={(e) => setNewQuest({ ...newQuest, name: e.target.value })}
                  className="bg-black/50 border-amber-900/30 text-amber-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-amber-800 text-xs">Description</Label>
                <Textarea
                  placeholder="Detailed quest description"
                  value={newQuest.description || ""}
                  onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                  className="bg-black/50 border-amber-900/30 text-amber-800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-amber-800 text-xs">Required Clues (IDs, comma-separated)</Label>
                <Input
                  placeholder="clue-01, clue-02"
                  value={newQuest.requiredClues?.join(", ") || ""}
                  onChange={(e) =>
                    setNewQuest({
                      ...newQuest,
                      requiredClues: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    })
                  }
                  className="bg-black/50 border-amber-900/30 text-amber-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-amber-800 text-xs">Reward (Optional)</Label>
                <Input
                  placeholder="e.g., Access to Archive"
                  value={newQuest.reward || ""}
                  onChange={(e) => setNewQuest({ ...newQuest, reward: e.target.value })}
                  className="bg-black/50 border-amber-900/30 text-amber-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-amber-800 text-xs">Unlocks (Optional)</Label>
                <Input
                  placeholder="e.g., /archive"
                  value={newQuest.unlocks || ""}
                  onChange={(e) => setNewQuest({ ...newQuest, unlocks: e.target.value })}
                  className="bg-black/50 border-amber-900/30 text-amber-800"
                />
              </div>
              <Button
                onClick={() => createQuestMutation.mutate(newQuest)}
                disabled={createQuestMutation.isPending || !newQuest.id || !newQuest.name}
                className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold"
              >
                {createQuestMutation.isPending ? "Processing..." : "Create Quest"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {quests.map((quest) => (
          <Card key={quest.id} className="bg-[hsl(var(--card))] border-amber-900/30 hover:border-amber-600/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800 text-sm font-mono flex items-center gap-2">
                <Trophy className="w-4 h-4" /> {quest.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">{quest.id}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs">
              <p className="text-muted-foreground mb-2">{quest.description}</p>
              <p className="text-amber-700">Requires: {quest.requiredClues?.join(", ") || "None"}</p>
              {quest.unlocks && <p className="text-amber-800 mt-1">Unlocks: {quest.unlocks}</p>}
            </CardContent>
          </Card>
        ))}
        {quests.length === 0 && (
          <p className="text-muted-foreground col-span-2 text-center py-8">No quests defined. Create quest chains to guide players!</p>
        )}
      </div>
    </div>
  );
}
