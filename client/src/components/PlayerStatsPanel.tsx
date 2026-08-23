import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGameSession';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Zap, Target, Shield, Clock,
  ChevronUp, Award, Flame, Users, BarChart3
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  level: number;
  title: string;
  clueCount: number;
  questCount: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'border-muted text-muted-foreground bg-card/20',
  uncommon: 'border-teal-700 text-teal-400 bg-teal-900/20',
  rare: 'border-blue-700 text-blue-400 bg-blue-900/20',
  epic: 'border-orange-700 text-orange-400 bg-orange-900/20',
  legendary: 'border-amber-600 text-amber-400 bg-amber-900/20',
};

export function PlayerStatsPanel() {
  const { gameState } = useGame();
  const [open, setOpen] = useState(false);

  const { data: playerStats } = useQuery({
    queryKey: ['player-stats', gameState.sessionToken],
    queryFn: async () => {
      const res = await fetch(`/api/gameplay/player-stats/${gameState.sessionToken}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: open,
    refetchInterval: open ? 10000 : false,
  });

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/gameplay/leaderboard?limit=10');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: open,
    refetchInterval: open ? 30000 : false,
  });

  const { data: achievementDefs = [] } = useQuery({
    queryKey: ['achievement-defs'],
    queryFn: async () => {
      const res = await fetch('/api/gameplay/achievements');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: open,
  });

  const xp = playerStats?.xp || gameState.xp || 0;
  const level = playerStats?.level || gameState.level || 1;
  const title = playerStats?.title || 'Recruit';
  const xpForNext = playerStats?.xpForNext || 250;
  const xpProgress = playerStats?.xpProgress || 0;
  const progressPct = xpForNext > 0 ? Math.min((xpProgress / xpForNext) * 100, 100) : 100;

  const [tab, setTab] = useState<'stats' | 'achievements' | 'leaderboard'>('stats');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-500/70 hover:text-amber-400 hover:bg-amber-900/20 gap-1.5"
          data-testid="button-player-stats"
        >
          <Star className="w-4 h-4" />
          <span className="font-mono text-xs">Lv.{level}</span>
          <span className="font-mono text-[10px] text-amber-600">{xp} XP</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[hsl(var(--card))] border-amber-900/50 text-foreground w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-amber-500 font-orbitron flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Agent Profile
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-foreground font-mono font-bold">{gameState.username}</p>
              <p className="text-amber-500 text-xs">Level {level} - {title}</p>
            </div>
            <div className="text-right">
              <p className="text-amber-400 font-mono text-lg font-bold">{xp.toLocaleString()} XP</p>
              <p className="text-muted-foreground text-[10px]">{xpForNext > 0 ? `${xpProgress}/${xpForNext} to next level` : 'Max level'}</p>
            </div>
          </div>
          <div className="h-2 bg-card rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-700 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex gap-1 mb-3">
          {(['stats', 'achievements', 'leaderboard'] as const).map(t => (
            <Button
              key={t}
              size="sm"
              variant={tab === t ? 'default' : 'outline'}
              onClick={() => setTab(t)}
              className={`min-h-[44px] touch-manipulation ${tab === t
                ? 'bg-amber-700 hover:bg-amber-600 text-xs flex-1'
                : 'border-border text-muted-foreground text-xs flex-1'
              }`}
            >
              {t === 'stats' && <BarChart3 className="w-3 h-3 mr-1" />}
              {t === 'achievements' && <Trophy className="w-3 h-3 mr-1" />}
              {t === 'leaderboard' && <Users className="w-3 h-3 mr-1" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[45vh] sm:h-[340px]">
          <AnimatePresence mode="wait">
            {tab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Clues Found', value: gameState.inventory.length, icon: Target, color: 'text-teal-400' },
                    { label: 'Quests Done', value: playerStats?.questCount || 0, icon: Trophy, color: 'text-amber-400' },
                    { label: 'Campaigns', value: gameState.stats.campaignsCompleted, icon: Flame, color: 'text-orange-400' },
                    { label: 'Commands Run', value: gameState.stats.commandsRun, icon: Zap, color: 'text-orange-400' },
                    { label: 'Play Time', value: `${gameState.stats.totalPlayTimeMinutes}m`, icon: Clock, color: 'text-muted-foreground' },
                    { label: 'Achievements', value: gameState.achievements.length, icon: Award, color: 'text-amber-500' },
                  ].map(stat => (
                    <Card key={stat.label} className="bg-card border-border">
                      <CardContent className="p-3 flex items-center gap-2">
                        <stat.icon className={`w-4 h-4 ${stat.color} shrink-0`} />
                        <div>
                          <p className={`font-mono font-bold text-sm ${stat.color}`}>{stat.value}</p>
                          <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {playerStats?.recentEvents?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</p>
                    <div className="space-y-1">
                      {playerStats.recentEvents.slice(0, 8).map((event: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-card/50 rounded">
                          <span className="text-muted-foreground">{event.eventType.replace(/_/g, ' ')}</span>
                          {event.xpAwarded > 0 && (
                            <Badge variant="outline" className="text-[10px] border-amber-800 text-amber-500">
                              +{event.xpAwarded} XP
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-2"
              >
                {achievementDefs.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No achievements defined yet.</p>
                ) : (
                  achievementDefs.map((ach: any) => {
                    const unlocked = gameState.achievements.includes(ach.achievementId);
                    const rarityStyle = RARITY_COLORS[ach.rarity] || RARITY_COLORS.common;
                    return (
                      <div
                        key={ach.achievementId}
                        className={`p-3 rounded border transition-all ${
                          unlocked ? rarityStyle : 'border-border bg-card/30 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{ach.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-mono font-bold ${unlocked ? '' : 'text-muted-foreground'}`}>
                                {ach.isHidden && !unlocked ? '???' : ach.name}
                              </span>
                              <Badge variant="outline" className="text-[9px] capitalize">{ach.rarity}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {ach.isHidden && !unlocked ? 'Hidden achievement' : ach.description}
                            </p>
                          </div>
                          {unlocked ? (
                            <Award className="w-4 h-4 text-amber-400" />
                          ) : (
                            <span className="text-[10px] text-muted-foreground">+{ach.xpReward} XP</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {tab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-1"
              >
                {leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No players on the leaderboard yet.</p>
                ) : (
                  leaderboard.map((entry) => {
                    const isMe = entry.username === gameState.username;
                    return (
                      <div
                        key={entry.rank}
                        className={`flex items-center gap-3 p-2.5 rounded ${
                          isMe ? 'bg-amber-900/20 border border-amber-800/50' : 'bg-card/30'
                        }`}
                      >
                        <span className={`font-mono font-bold text-sm w-6 text-center ${
                          entry.rank === 1 ? 'text-amber-400' :
                          entry.rank === 2 ? 'text-foreground' :
                          entry.rank === 3 ? 'text-orange-600' :
                          'text-muted-foreground'
                        }`}>
                          #{entry.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-mono truncate ${isMe ? 'text-amber-400' : 'text-foreground'}`}>
                            {entry.username}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{entry.title}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-amber-400 font-mono text-sm">{entry.xp.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">Lv.{entry.level}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
