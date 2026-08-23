import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, LogIn, LogOut, Swords, HandshakeIcon, Timer, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/hooks/useGameSession';
import { motion, AnimatePresence } from 'framer-motion';

const MODE_INFO = {
  coop: { icon: HandshakeIcon, label: 'Co-op', desc: 'Work together on investigations' },
  versus: { icon: Swords, label: 'Versus', desc: 'Race to find clues first' },
  race: { icon: Timer, label: 'Race', desc: 'Time-based challenge' }
};

interface Player {
  sessionToken: string;
  alias: string;
  score: number;
}

interface Lobby {
  lobbyId: string;
  name: string;
  mode: 'coop' | 'versus' | 'race';
  maxPlayers: number;
  currentPlayers: Player[];
  campaignId?: string;
  status: string;
  createdAt: string;
}

export function MultiplayerLobby() {
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [lobbyName, setLobbyName] = useState('');
  const [mode, setMode] = useState<'coop' | 'versus' | 'race'>('coop');
  const [alias, setAlias] = useState('');
  const { toast } = useToast();
  const { gameState } = useGame();
  const sessionToken = gameState.sessionToken;
  const username = gameState.username;
  const queryClient = useQueryClient();

  const { data: lobbies = [], refetch } = useQuery<Lobby[]>({
    queryKey: ['lobbies'],
    queryFn: async () => {
      const res = await fetch('/api/lobbies');
      if (!res.ok) throw new Error('Failed to fetch lobbies');
      return res.json();
    },
    enabled: open,
    refetchInterval: open ? 5000 : false
  });

  const createLobby = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/lobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lobbyName || `${username}'s Lobby`,
          mode,
          maxPlayers: 4,
          sessionToken,
          alias: alias || username || 'Host'
        })
      });
      if (!res.ok) throw new Error('Failed to create lobby');
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Lobby created!', description: `Lobby ID: ${data.lobby.lobbyId}` });
      setShowCreate(false);
      setLobbyName('');
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    }
  });

  const joinLobby = useMutation({
    mutationFn: async (lobbyId: string) => {
      const res = await fetch(`/api/lobbies/${lobbyId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          alias: alias || username || `Agent-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        })
      });
      if (!res.ok) throw new Error('Failed to join lobby');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Joined lobby!' });
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    }
  });

  const leaveLobby = useMutation({
    mutationFn: async (lobbyId: string) => {
      const res = await fetch(`/api/lobbies/${lobbyId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken })
      });
      if (!res.ok) throw new Error('Failed to leave lobby');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Left lobby' });
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    }
  });

  const isInLobby = (lobby: Lobby) => 
    lobby.currentPlayers.some(p => p.sessionToken === sessionToken);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-700/70 hover:text-purple-300 hover:bg-purple-900/20"
          data-testid="button-multiplayer"
        >
          <Users className="w-4 h-4 mr-1" />
          Multiplayer
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[hsl(var(--card))] border-purple-900/50 text-foreground max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-purple-700 font-orbitron flex items-center gap-2">
            <Users className="w-5 h-5" />
            Multiplayer Lobbies
          </DialogTitle>
        </DialogHeader>

        <div className="mb-3">
          <Label className="text-xs text-muted-foreground uppercase">Your Alias</Label>
          <Input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder={username || 'Anonymous Agent'}
            className="bg-black/50 border-border text-sm"
            maxLength={20}
            data-testid="input-alias"
          />
        </div>

        <div className="flex gap-2 mb-3">
          <Button
            variant={!showCreate ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCreate(false)}
            className={!showCreate ? 'bg-purple-700 hover:bg-purple-600' : 'border-purple-900/50'}
            data-testid="button-browse-lobbies"
          >
            Browse Lobbies
          </Button>
          <Button
            variant={showCreate ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowCreate(true)}
            className={showCreate ? 'bg-purple-700 hover:bg-purple-600' : 'border-purple-900/50'}
            data-testid="button-create-lobby"
          >
            <Plus className="w-3 h-3 mr-1" />
            Create
          </Button>
        </div>

        {showCreate ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 p-3 bg-black/30 rounded-md border border-purple-900/30"
          >
            <div>
              <Label className="text-xs text-muted-foreground uppercase">Lobby Name</Label>
              <Input
                value={lobbyName}
                onChange={(e) => setLobbyName(e.target.value)}
                placeholder="My Investigation Room"
                className="bg-black/50 border-border"
                maxLength={50}
                data-testid="input-lobby-name"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground uppercase">Game Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
                <SelectTrigger className="bg-black/50 border-border" data-testid="select-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--card))] border-purple-900/50">
                  {Object.entries(MODE_INFO).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <info.icon className="w-4 h-4" />
                        <span>{info.label}</span>
                        <span className="text-xs text-muted-foreground">- {info.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => createLobby.mutate()}
              disabled={createLobby.isPending}
              className="w-full bg-purple-700 hover:bg-purple-600"
              data-testid="button-confirm-create"
            >
              {createLobby.isPending ? 'Creating...' : 'Create Lobby'}
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <AnimatePresence>
              {lobbies.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">
                  No active lobbies. Create one to start!
                </p>
              ) : (
                lobbies.map((lobby) => {
                  const ModeIcon = MODE_INFO[lobby.mode]?.icon || Users;
                  const inLobby = isInLobby(lobby);
                  
                  return (
                    <motion.div
                      key={lobby.lobbyId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`p-3 rounded-md border ${
                        inLobby 
                          ? 'bg-purple-900/20 border-purple-600/50' 
                          : 'bg-black/30 border-border'
                      }`}
                      data-testid={`lobby-${lobby.lobbyId}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ModeIcon className="w-4 h-4 text-purple-700" />
                          <span className="font-medium text-foreground">{lobby.name}</span>
                          {inLobby && <Badge variant="secondary" className="text-[10px]">Joined</Badge>}
                        </div>
                        <Badge variant="outline" className="text-xs border-border">
                          {lobby.currentPlayers.length}/{lobby.maxPlayers}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {lobby.currentPlayers.map((player, i) => (
                          <span 
                            key={player.sessionToken}
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              i === 0 ? 'bg-amber-900/30 text-amber-800' : 'bg-border text-muted-foreground'
                            }`}
                          >
                            {i === 0 && <Crown className="w-3 h-3 inline mr-0.5" />}
                            {player.alias}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {inLobby ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => leaveLobby.mutate(lobby.lobbyId)}
                            className="flex-1 border-red-900/50 text-red-700 hover:bg-red-900/20"
                            data-testid={`button-leave-${lobby.lobbyId}`}
                          >
                            <LogOut className="w-3 h-3 mr-1" />
                            Leave
                          </Button>
                        ) : lobby.currentPlayers.length < lobby.maxPlayers ? (
                          <Button
                            size="sm"
                            onClick={() => joinLobby.mutate(lobby.lobbyId)}
                            className="flex-1 bg-purple-700 hover:bg-purple-600"
                            data-testid={`button-join-${lobby.lobbyId}`}
                          >
                            <LogIn className="w-3 h-3 mr-1" />
                            Join
                          </Button>
                        ) : (
                          <Button size="sm" disabled className="flex-1">
                            Full
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Lobbies expire after 1 hour of inactivity
        </p>
      </DialogContent>
    </Dialog>
  );
}