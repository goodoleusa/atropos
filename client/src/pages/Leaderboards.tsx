import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Trophy,
  Zap,
  Clock,
  Target,
  Crown,
  Medal,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useGame } from "@/hooks/useGameSession";

interface LeaderboardEntry {
  sessionToken: string;
  username: string;
  leaderboardType: string;
  score: number;
  rank?: number;
  metadata?: Record<string, any>;
  updatedAt: string;
}

export default function Leaderboards() {
  const { gameState } = useGame();
  const [activeBoard, setActiveBoard] = useState('global_xp');

  const { data: globalLeaderboard = [], refetch: refetchGlobal, isLoading: loadingGlobal } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard/global_xp'],
    queryFn: () => fetch('/api/leaderboard/global_xp?limit=100').then(r => r.json()),
    refetchInterval: 30000
  });

  const { data: playerRank } = useQuery<{ rank: number; entry: LeaderboardEntry } | null>({
    queryKey: ['/api/leaderboard/global_xp/rank', gameState.sessionToken],
    queryFn: () => fetch(`/api/leaderboard/global_xp/rank/${gameState.sessionToken}`).then(r => r.ok ? r.json() : null),
    enabled: !!gameState.sessionToken
  });

  const leaderboardTypes = [
    { id: 'global_xp', name: 'Global XP', icon: Trophy, color: 'amber', description: 'Total experience points' },
    { id: 'weekly_xp', name: 'This Week', icon: Zap, color: 'teal', description: 'Weekly leaderboard' },
    { id: 'campaigns', name: 'Campaign Masters', icon: Target, color: 'purple', description: 'Most campaigns completed' },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-800" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-800" />;
    return <span className="text-muted-foreground font-mono text-sm">#{rank}</span>;
  };

  const getRowStyle = (rank: number, isPlayer: boolean) => {
    if (isPlayer) return 'bg-amber-900/30 border-amber-600/50 border-2';
    if (rank === 1) return 'bg-amber-950/20 border-amber-900/30';
    if (rank === 2) return 'bg-card/30 border-border/30';
    if (rank === 3) return 'bg-orange-950/20 border-orange-900/30';
    return 'bg-card/20 border-border/30';
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--card))] text-foreground">
      <header className="border-b border-amber-900/30 bg-[hsl(var(--card))] sticky top-0 z-50">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-amber-500">
                <ArrowLeft className="w-4 h-4 mr-1" /> Profile
              </Button>
            </Link>
            <h1 className="font-orbitron text-xl font-bold">
              <span className="text-amber-800">LEADERBOARDS</span>
            </h1>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchGlobal()}
            className="border-amber-900/50 text-amber-800"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Player Position Card */}
        {playerRank && (
          <Card className="mb-8 bg-gradient-to-r from-amber-950/20 to-teal-950/20 border-amber-600/50 torch-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-900/30 border-2 border-amber-600">
                    {getRankBadge(playerRank.rank)}
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Your Global Rank</p>
                    <p className="text-3xl font-bold text-amber-800">#{playerRank.rank}</p>
                    <p className="text-muted-foreground text-xs mt-1">{gameState.username || 'Guest'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">Your Score</p>
                  <p className="text-2xl font-bold text-teal-800">{playerRank.entry.score.toLocaleString()}</p>
                  <p className="text-muted-foreground text-xs mt-1">Total XP</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Tabs value={activeBoard} onValueChange={setActiveBoard}>
          <TabsList className="bg-card/50 border border-amber-900/30 mb-6">
            {leaderboardTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TabsTrigger 
                  key={type.id} 
                  value={type.id}
                  className={`data-[state=active]:bg-${type.color}-900/30 data-[state=active]:text-${type.color}-400`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {type.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="global_xp">
            <Card className="bg-[hsl(var(--card))] border-amber-900/30">
              <CardHeader>
                <CardTitle className="text-amber-800 font-orbitron flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Global XP Rankings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Top investigators by total experience points earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingGlobal ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading rankings...
                  </div>
                ) : globalLeaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No rankings yet</p>
                    <p className="text-muted-foreground text-sm mt-1">Complete campaigns to appear on the leaderboard</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {globalLeaderboard.map((entry, index) => {
                      const rank = index + 1;
                      const isPlayer = entry.sessionToken === gameState.sessionToken;
                      
                      return (
                        <div
                          key={entry.sessionToken}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:scale-[1.01] ${getRowStyle(rank, isPlayer)}`}
                        >
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/30">
                            {getRankBadge(rank)}
                          </div>
                          
                          <div className="flex-1">
                            <p className={`font-bold ${isPlayer ? 'text-amber-800' : 'text-foreground'}`}>
                              {entry.username || 'Anonymous'}
                              {isPlayer && <Badge className="ml-2 text-[10px] bg-amber-900/50 text-amber-300">YOU</Badge>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.sessionToken.substring(0, 8)}...
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xl font-bold text-teal-800">
                              {entry.score.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Total XP</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly_xp">
            <Card className="bg-[hsl(var(--card))] border-teal-900/30">
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 text-teal-700 mx-auto mb-4" />
                <p className="text-muted-foreground">Weekly leaderboard</p>
                <p className="text-muted-foreground text-sm mt-1">Coming soon - resets every Monday</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card className="bg-[hsl(var(--card))] border-purple-900/30">
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-purple-700 mx-auto mb-4" />
                <p className="text-muted-foreground">Campaign completion leaderboard</p>
                <p className="text-muted-foreground text-sm mt-1">Coming soon - most campaigns finished</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-[hsl(var(--card))] border-amber-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800 text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                How Rankings Work
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Earn XP by completing campaigns and challenges</p>
              <p>• Rankings update in real-time</p>
              <p>• Ties broken by earliest achievement</p>
              <p>• Top 100 players displayed</p>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(var(--card))] border-teal-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-teal-800 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Earn More XP
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Complete investigations: +100 XP</p>
              <p>• Find hidden clues: +50 XP</p>
              <p>• Daily challenges: +100-300 XP</p>
              <p>• Unlock achievements: varies</p>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(var(--card))] border-purple-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-700 text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Compete
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• Weekly challenges reset Monday</p>
              <p>• Campaign speed runs track your best times</p>
              <p>• Special events have bonus XP</p>
              <p>• Form teams in multiplayer mode</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <Link href="/terminal">
            <Button className="bg-amber-900/30 hover:bg-amber-900/50 text-amber-300 border border-amber-700/50 min-h-[48px]">
              <Target className="w-4 h-4 mr-2" />
              Start Investigation
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" className="border-teal-900/50 text-teal-800 min-h-[48px]">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Your Profile
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
