import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { MessageSquare, Folder, Zap, Sparkles, Settings, Rocket, Plus, Target, Map } from "lucide-react";
import { CHAOS_MESSAGES, MYSTICAL_CARDS, TOAST_MESSAGES, UI_TEXT, TERMINAL_MESSAGES } from "@/config/messages";
import { AGENT_CAMPAIGNS, getDifficultyColor } from "@/config/agentCampaigns";
import { ClueGraph } from "@/components/ClueGraph";
import { ClueBreadcrumbs } from "@/components/ClueBreadcrumbs";

export function MessagesPanel({ chaosEnabled, setChaosEnabled, subliminalMessages, newSubliminal, setNewSubliminal, addSubliminalMessage, removeSubliminalMessage, renderTree }: any) {
  return (
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
        <Card className="lg:col-span-2 bg-[hsl(var(--card))] border-amber-900/30 overflow-hidden">
          <CardHeader className="bg-amber-950/10 border-b border-amber-900/20">
            <CardTitle className="text-amber-500 font-mono text-sm flex items-center gap-2">
              <Folder className="w-4 h-4" /> root/messages/config
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto max-h-[600px]">
            {renderTree({ TERMINAL_MESSAGES, TOAST_MESSAGES, CHAOS_MESSAGES, MYSTICAL_CARDS, UI_TEXT })}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="bg-[hsl(var(--card))] border-teal-900/30">
            <CardHeader>
              <CardTitle className="text-teal-400 font-mono text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" /> Chaos Overlay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-black/50 p-3 rounded border border-teal-900/20">
                <Label className="text-teal-600 text-[10px] uppercase font-bold mb-2 block">Active Strings</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {CHAOS_MESSAGES.subliminal.map((msg: string, i: number) => (
                    <div key={i} className="flex items-center justify-between group bg-teal-950/10 p-2 rounded border border-teal-900/10">
                      <span className="text-xs font-mono text-foreground">{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[hsl(var(--card))] border-amber-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-500 font-mono text-sm">System Simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-amber-900/20 border border-amber-700/30 text-amber-500 text-xs py-6 hover:bg-amber-900/40">
                <Zap className="w-4 h-4 mr-2" /> TRIGGER CHAOS FLASH
              </Button>
              <Button className="w-full bg-teal-900/20 border border-teal-700/30 text-teal-500 text-xs py-6 hover:bg-teal-900/40">
                <Sparkles className="w-4 h-4 mr-2" /> SPAWN MYSTICAL POPUP
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function TerminalPanel() {
  return (
    <Card className="bg-[hsl(var(--card))] border-amber-900/30">
      <CardHeader>
        <CardTitle className="text-amber-500 font-mono">Available Terminal Commands</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { cmd: 'help', desc: 'Show available commands', category: 'basic' },
            { cmd: 'scan', desc: 'Start network scan', category: 'recon' },
            { cmd: 'clues', desc: 'View collected clues', category: 'game' },
            { cmd: 'quests', desc: 'View active quests', category: 'game' },
            { cmd: 'nexus', desc: 'Open NEXUS AI Agent', category: 'ai' },
            { cmd: 'clear', desc: 'Clear terminal', category: 'basic' },
            { cmd: 'whoami', desc: 'Current user info', category: 'basic' },
            { cmd: 'status', desc: 'System status', category: 'recon' },
            { cmd: 'ls', desc: 'List files', category: 'basic' },
          ].map((item) => (
            <div key={item.cmd} className="p-3 rounded border border-amber-900/20 bg-black/30">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-amber-400 text-sm font-bold">{item.cmd}</code>
                <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">{item.category}</Badge>
              </div>
              <p className="text-muted-foreground text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfigPanel({ gameState, clues, quests }: { gameState: any; clues: any[]; quests: any[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2">
        <Settings className="w-5 h-5" /> System Configuration
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 text-sm">Game State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Dev Mode</span><span className={gameState.devMode ? 'text-teal-400' : 'text-muted-foreground'}>{gameState.devMode ? 'ON' : 'OFF'}</span></div>
            <div className="flex justify-between"><span>Total Clues</span><span className="text-amber-400">{clues.length}</span></div>
            <div className="flex justify-between"><span>Total Quests</span><span className="text-amber-400">{quests.length}</span></div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 text-sm">Database</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <p>PostgreSQL with Drizzle ORM</p>
            <p className="text-muted-foreground mt-1">Schema: shared/schema.ts</p>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-500 text-sm">API</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <p>Express + TypeScript</p>
            <p className="text-muted-foreground mt-1">Routes: server/routes.ts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CampaignsPanel({ onOpenBuilder }: { onOpenBuilder: (campaignId?: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2">
          <Rocket className="w-5 h-5" /> Investigation Campaigns
        </h3>
        <Button
          onClick={() => onOpenBuilder()}
          className="bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 border border-amber-700/30"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> New Campaign
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENT_CAMPAIGNS.map((campaign) => (
          <Card key={campaign.id} className="bg-[hsl(var(--card))] border-amber-900/30 hover:border-amber-700/50 transition-all cursor-pointer" onClick={() => { onOpenBuilder(campaign.id); }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                <Target className="w-4 h-4" /> {campaign.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs mb-2">{campaign.description}</p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[9px] border-border">{campaign.tags?.[0] || 'general'}</Badge>
                <Badge variant="outline" className={`text-[9px] ${getDifficultyColor(campaign.difficulty)}`}>{campaign.difficulty}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function GraphPanel({ clues, selectedClueId, setSelectedClueId, clueTrail, setClueTrail, showGraphView, setShowGraphView, gameState }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-blue-400 flex items-center gap-2">
          <Map className="w-5 h-5" /> Knowledge Graph
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showGraphView ? "default" : "outline"}
            onClick={() => setShowGraphView(true)}
            className={showGraphView ? "bg-blue-900/30 text-blue-400" : "border-blue-900/30 text-muted-foreground"}
          >
            Graph View
          </Button>
          <Button
            size="sm"
            variant={!showGraphView ? "default" : "outline"}
            onClick={() => setShowGraphView(false)}
            className={!showGraphView ? "bg-blue-900/30 text-blue-400" : "border-blue-900/30 text-muted-foreground"}
          >
            List View
          </Button>
        </div>
      </div>
      {showGraphView ? (
        <Card className="bg-[hsl(var(--card))] border-blue-900/30">
          <CardContent className="p-4">
            <ClueGraph
              clues={clues.map((c: any) => ({ id: c.id, name: c.name, linkedTo: [], linkedFrom: [] }))}
              selectedClueId={selectedClueId || undefined}
              onSelectClue={(id: string) => setSelectedClueId(id)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {selectedClueId && (
            <ClueBreadcrumbs
              currentClue={{ id: selectedClueId, name: clues.find((c: any) => c.id === selectedClueId)?.name || selectedClueId, linkedTo: [], linkedFrom: [] }}
              allClues={clues.map((c: any) => ({ id: c.id, name: c.name, linkedTo: [], linkedFrom: [] }))}
              trail={clueTrail}
              onTrailChange={setClueTrail}
              onNavigate={(id: string) => setSelectedClueId(id)}
            />
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {clues.map((clue: any) => (
              <Card
                key={clue.id}
                className={`bg-[hsl(var(--card))] border-blue-900/30 cursor-pointer transition-all hover:border-blue-600/50 ${selectedClueId === clue.id ? 'ring-1 ring-blue-500' : ''}`}
                onClick={() => { setSelectedClueId(clue.id); setClueTrail((prev: any[]) => [...prev.filter((t: any) => t !== clue.id), clue.id]); }}
              >
                <CardContent className="p-3">
                  <p className="text-blue-400 text-sm font-bold">{clue.title}</p>
                  <p className="text-muted-foreground text-xs mt-1">{clue.description}</p>
                  <Badge variant="outline" className="mt-2 text-[9px] border-border">{clue.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
