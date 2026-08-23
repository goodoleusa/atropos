import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Clock, 
  Zap,
  Award,
  Star,
  Flame,
  Brain,
  Shield,
  Code,
  Users,
  Calendar,
  ChevronRight,
  Lock,
  Unlock,
  ArrowLeft,
  Briefcase,
  Crosshair
} from "lucide-react";
import PortfolioTab from "@/components/PortfolioTab";
import MissionControl from "@/components/MissionControl";
import { useGame } from "@/hooks/useGameSession";

interface PlayerProgression {
  level: number;
  xp: number;
  totalXp: number;
  prestigeLevel: number;
  skills: {
    osint: number;
    network: number;
    malware: number;
    social: number;
  };
  stats: {
    campaignsCompleted: number;
    cluesFound: number;
    hiddenCluesFound: number;
    questsCompleted: number;
    toolsUsed: number;
    totalPlayTimeMinutes: number;
    fastestCampaignTime?: number;
    longestStreak: number;
    currentStreak: number;
    lastLoginDate?: string;
  };
  unlockedTools: string[];
  unlockedCampaigns: string[];
  currency: number;
}

interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rarity: string;
  isHidden: boolean;
  xpReward: number;
  currencyReward: number;
}

interface PlayerAchievement {
  achievementId: string;
  unlockedAt: string;
  progress: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

export default function Profile() {
  const { gameState } = useGame();
  const sessionToken = gameState.sessionToken;

  const { data: progression, isLoading: loadingProgression } = useQuery<PlayerProgression>({
    queryKey: ['/api/progression', sessionToken],
    queryFn: () => fetch(`/api/progression/${sessionToken}`).then(r => r.json()),
    enabled: !!sessionToken
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
    queryFn: () => fetch('/api/achievements').then(r => r.json())
  });

  const { data: playerAchievements = [] } = useQuery<PlayerAchievement[]>({
    queryKey: ['/api/achievements/player', sessionToken],
    queryFn: () => fetch(`/api/achievements/player/${sessionToken}`).then(r => r.json()),
    enabled: !!sessionToken
  });

  const { data: globalRank } = useQuery<{ rank: number; entry: LeaderboardEntry } | null>({
    queryKey: ['/api/leaderboard/global_xp/rank', sessionToken],
    queryFn: () => fetch(`/api/leaderboard/global_xp/rank/${sessionToken}`).then(r => r.ok ? r.json() : null),
    enabled: !!sessionToken
  });

  const { data: todayChallenge } = useQuery({
    queryKey: ['/api/challenges/today'],
    queryFn: () => fetch('/api/challenges/today').then(r => r.ok ? r.json() : null)
  });

  const { data: challengeCompletions = [] } = useQuery({
    queryKey: ['/api/challenges/completions', sessionToken],
    queryFn: () => fetch(`/api/challenges/completions/${sessionToken}`).then(r => r.json()),
    enabled: !!sessionToken
  });

  if (loadingProgression) {
    return (
      <div className="min-h-screen bg-[hsl(var(--card))] flex items-center justify-center">
        <div className="text-amber-500 font-mono">Loading profile...</div>
      </div>
    );
  }

  const xpForNextLevel = (progression?.level || 1) * 100;
  const xpProgress = ((progression?.xp || 0) / xpForNextLevel) * 100;

  const skillData = [
    { name: 'OSINT', value: progression?.skills?.osint || 0, color: 'amber', icon: Target },
    { name: 'Network', value: progression?.skills?.network || 0, color: 'teal', icon: Shield },
    { name: 'Malware', value: progression?.skills?.malware || 0, color: 'red', icon: Code },
    { name: 'Social Eng', value: progression?.skills?.social || 0, color: 'purple', icon: Users },
  ];

  const unlockedAchievements = playerAchievements.map(pa => 
    achievements.find(a => a.achievementId === pa.achievementId)
  ).filter(Boolean) as Achievement[];

  const lockedAchievements = achievements.filter(a => 
    !playerAchievements.some(pa => pa.achievementId === a.achievementId) && !a.isHidden
  );

  const rarityColors: Record<string, string> = {
    common: 'border-muted text-muted-foreground',
    rare: 'border-blue-600 text-blue-400',
    epic: 'border-purple-600 text-purple-400',
    legendary: 'border-amber-600 text-amber-400'
  };

  const categoryIcons: Record<string, any> = {
    discovery: Target,
    speed: Zap,
    mastery: Brain,
    social: Users,
    special: Star
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--card))] text-foreground">
      <header className="border-b border-amber-900/30 bg-[hsl(var(--card))] sticky top-0 z-50">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-amber-500">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
            <h1 className="font-orbitron text-xl font-bold">
              <span className="text-amber-600">MISSION</span> <span className="text-muted-foreground">CONTROL</span>
            </h1>
          </div>
          <Badge variant="outline" className="border-teal-600 text-teal-400">
            {gameState.username || 'Guest'}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Level & XP Overview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-[hsl(var(--card))] border-amber-900/30 torch-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-orbitron text-amber-500 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Level {progression?.level || 1}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    {progression?.xp || 0} / {xpForNextLevel} XP to next level
                  </CardDescription>
                </div>
                {progression && progression.prestigeLevel > 0 && (
                  <Badge className="bg-amber-900/50 text-amber-300 border-amber-600">
                    <Star className="w-3 h-3 mr-1" />
                    Prestige {progression.prestigeLevel}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Progress value={xpProgress} className="h-3 bg-card" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{progression?.xp || 0} XP</span>
                  <span>{xpForNextLevel - (progression?.xp || 0)} XP needed</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-teal-950/20 rounded border border-teal-900/30">
                  <p className="text-2xl font-bold text-teal-400">{progression?.stats?.campaignsCompleted || 0}</p>
                  <p className="text-xs text-muted-foreground">Campaigns</p>
                </div>
                <div className="text-center p-3 bg-amber-950/20 rounded border border-amber-900/30">
                  <p className="text-2xl font-bold text-amber-400">{progression?.stats?.cluesFound || 0}</p>
                  <p className="text-xs text-muted-foreground">Clues</p>
                </div>
                <div className="text-center p-3 bg-purple-950/20 rounded border border-purple-900/30">
                  <p className="text-2xl font-bold text-purple-400">{progression?.stats?.questsCompleted || 0}</p>
                  <p className="text-xs text-muted-foreground">Quests</p>
                </div>
                <div className="text-center p-3 bg-orange-950/20 rounded border border-orange-900/30">
                  <p className="text-2xl font-bold text-orange-400">{progression?.currency || 0}</p>
                  <p className="text-xs text-muted-foreground">Credits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(var(--card))] border-teal-900/30">
            <CardHeader>
              <CardTitle className="text-teal-500 text-sm font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Global Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {globalRank ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-teal-400">#{globalRank.rank}</p>
                    <p className="text-xs text-muted-foreground mt-1">out of all players</p>
                  </div>
                  <div className="text-center p-2 bg-teal-950/20 rounded">
                    <p className="text-sm text-muted-foreground">Total XP</p>
                    <p className="text-xl font-bold text-teal-300">{progression?.totalXp || 0}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">Not ranked yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Complete campaigns to rank</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skills Breakdown */}
        <Card className="mb-8 bg-[hsl(var(--card))] border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-500 font-orbitron flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Skill Specializations
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Develop expertise in different security domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {skillData.map((skill) => {
                const Icon = skill.icon;
                return (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 text-${skill.color}-500`} />
                        <span className="text-sm font-medium text-foreground">{skill.name}</span>
                      </div>
                      <Badge variant="outline" className={`border-${skill.color}-900 text-${skill.color}-400 text-xs`}>
                        {skill.value}
                      </Badge>
                    </div>
                    <Progress value={Math.min(100, (skill.value / 100) * 100)} className={`h-2 bg-card`} />
                    <p className="text-xs text-muted-foreground">{skill.value} / 100 points</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Achievements, Stats, Activity */}
        <Tabs defaultValue="missions" className="space-y-6">
          <TabsList className="bg-card/50 border border-amber-900/30 flex-wrap">
            <TabsTrigger value="missions" className="data-[state=active]:bg-teal-900/30 data-[state=active]:text-teal-400" data-testid="missions-tab">
              <Crosshair className="w-4 h-4 mr-2" />
              Mission Control
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-300" data-testid="portfolio-tab">
              <Briefcase className="w-4 h-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400">
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-teal-900/30 data-[state=active]:text-teal-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="challenge" className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-400">
              <Calendar className="w-4 h-4 mr-2" />
              Daily Challenge
            </TabsTrigger>
          </TabsList>

          {/* Mission Control Tab */}
          <TabsContent value="missions" className="space-y-4">
            <MissionControl />
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            <PortfolioTab />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-orbitron text-amber-500">
                {unlockedAchievements.length} / {achievements.length} Unlocked
              </h3>
              <div className="flex gap-2">
                {['common', 'rare', 'epic', 'legendary'].map(rarity => {
                  const count = unlockedAchievements.filter(a => a.rarity === rarity).length;
                  return (
                    <Badge key={rarity} variant="outline" className={`${rarityColors[rarity]} text-xs`}>
                      {count} {rarity}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map((achievement) => {
                const CategoryIcon = categoryIcons[achievement.category] || Trophy;
                const unlockData = playerAchievements.find(pa => pa.achievementId === achievement.achievementId);
                
                return (
                  <Card 
                    key={achievement.achievementId} 
                    className={`bg-[hsl(var(--card))] border transition-all hover:scale-[1.02] ${rarityColors[achievement.rarity]}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground text-sm mb-1">{achievement.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] border-border">
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {achievement.category}
                            </Badge>
                            <Badge variant="outline" className={`text-[9px] ${rarityColors[achievement.rarity]}`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                          {unlockData && (
                            <p className="text-[10px] text-muted-foreground mt-2">
                              Unlocked {new Date(unlockData.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Unlock className="w-4 h-4 text-amber-500" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {lockedAchievements.slice(0, 6).map((achievement) => {
                const CategoryIcon = categoryIcons[achievement.category] || Trophy;
                
                return (
                  <Card 
                    key={achievement.achievementId} 
                    className="bg-[hsl(var(--card))] border-border opacity-50"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl grayscale">🔒</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-muted-foreground text-sm mb-1">???</h4>
                          <p className="text-xs text-muted-foreground mb-2">Locked</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {achievement.category}
                            </Badge>
                          </div>
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-[hsl(var(--card))] border-amber-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-500 text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Investigation Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campaigns Completed</span>
                    <span className="text-amber-400 font-bold">{progression?.stats?.campaignsCompleted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clues Found</span>
                    <span className="text-teal-400 font-bold">{progression?.stats?.cluesFound || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hidden Clues</span>
                    <span className="text-purple-400 font-bold">{progression?.stats?.hiddenCluesFound || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quests Completed</span>
                    <span className="text-orange-400 font-bold">{progression?.stats?.questsCompleted || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-teal-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-teal-500 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Playtime</span>
                    <span className="text-teal-400 font-bold">
                      {Math.floor((progression?.stats?.totalPlayTimeMinutes || 0) / 60)}h {(progression?.stats?.totalPlayTimeMinutes || 0) % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fastest Campaign</span>
                    <span className="text-amber-400 font-bold">
                      {progression?.stats?.fastestCampaignTime ? `${progression.stats.fastestCampaignTime}m` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tools Mastered</span>
                    <span className="text-purple-400 font-bold">{progression?.stats?.toolsUsed || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-orange-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-orange-500 text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="text-center py-2">
                    <p className="text-4xl font-bold text-orange-400">{progression?.stats?.currentStreak || 0}</p>
                    <p className="text-xs text-muted-foreground">day streak</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longest Streak</span>
                    <span className="text-orange-400 font-bold">{progression?.stats?.longestStreak || 0} days</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[hsl(var(--card))] border-amber-900/30">
              <CardHeader>
                <CardTitle className="text-amber-500 text-sm flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Unlocked Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs text-muted-foreground uppercase mb-2">Tools</h4>
                    <div className="space-y-1">
                      {progression?.unlockedTools && progression.unlockedTools.length > 0 ? (
                        progression.unlockedTools.map((tool, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span className="text-muted-foreground">{tool}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No special tools unlocked yet</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs text-muted-foreground uppercase mb-2">Campaigns</h4>
                    <div className="space-y-1">
                      {progression?.unlockedCampaigns && progression.unlockedCampaigns.length > 0 ? (
                        progression.unlockedCampaigns.map((campaign, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Target className="w-3 h-3 text-teal-500" />
                            <span className="text-muted-foreground">{campaign}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">All campaigns available</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Challenge Tab */}
          <TabsContent value="challenge" className="space-y-4">
            {todayChallenge ? (
              <Card className="bg-[hsl(var(--card))] border-purple-900/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-500 font-orbitron">Today's Challenge</CardTitle>
                    <Badge variant="outline" className={`border-${
                      todayChallenge.difficulty === 'easy' ? 'teal' : 
                      todayChallenge.difficulty === 'medium' ? 'amber' : 'red'
                    }-600 text-${
                      todayChallenge.difficulty === 'easy' ? 'teal' : 
                      todayChallenge.difficulty === 'medium' ? 'amber' : 'red'
                    }-400`}>
                      {todayChallenge.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Expires in {Math.floor((new Date(todayChallenge.expiresAt).getTime() - Date.now()) / 1000 / 60 / 60)} hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{todayChallenge.title}</h3>
                    <p className="text-muted-foreground">{todayChallenge.description}</p>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-purple-950/20 rounded border border-purple-900/30">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Reward</p>
                      <p className="text-lg font-bold text-amber-400">+{todayChallenge.xpReward} XP</p>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Credits</p>
                      <p className="text-lg font-bold text-orange-400">+{todayChallenge.currencyReward}</p>
                    </div>
                  </div>

                  {challengeCompletions.some(c => c.challengeId === todayChallenge.challengeId) ? (
                    <div className="p-4 bg-teal-950/20 border border-teal-900/30 rounded text-center">
                      <Award className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                      <p className="text-teal-400 font-bold">Challenge Completed!</p>
                      <p className="text-xs text-muted-foreground mt-1">Come back tomorrow for a new challenge</p>
                    </div>
                  ) : (
                    <Link href="/terminal">
                      <Button className="w-full bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-700/50 min-h-[48px]">
                        <Zap className="w-4 h-4 mr-2" />
                        Start Challenge
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[hsl(var(--card))] border-border">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No challenge available today</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back tomorrow!</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-[hsl(var(--card))] border-border">
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm">Challenge History</CardTitle>
              </CardHeader>
              <CardContent>
                {challengeCompletions.length > 0 ? (
                  <div className="space-y-2">
                    {challengeCompletions.slice(0, 10).map((completion, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-card/30 rounded">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-muted-foreground">{completion.challengeId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {completion.score} pts
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(completion.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No challenges completed yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-[hsl(var(--card))] border-amber-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-500 text-sm">Progression</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Level</p>
                    <p className="text-3xl font-bold text-amber-400">{progression?.level || 1}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total XP Earned</p>
                    <p className="text-2xl font-bold text-foreground">{progression?.totalXp || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Currency</p>
                    <p className="text-xl font-bold text-orange-400">{progression?.currency || 0} credits</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-teal-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-teal-500 text-sm">Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Streak</p>
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <p className="text-2xl font-bold text-orange-400">{progression?.stats?.currentStreak || 0}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                    <p className="text-xl font-bold text-foreground">{progression?.stats?.longestStreak || 0} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Active</p>
                    <p className="text-sm text-muted-foreground">
                      {progression?.stats?.lastLoginDate 
                        ? new Date(progression.stats.lastLoginDate).toLocaleDateString()
                        : 'Today'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[hsl(var(--card))] border-purple-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-500 text-sm">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Fastest Campaign</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {progression?.stats?.fastestCampaignTime ? `${progression.stats.fastestCampaignTime}m` : '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. Playtime</p>
                    <p className="text-xl font-bold text-foreground">
                      {progression?.stats?.campaignsCompleted 
                        ? Math.round((progression.stats.totalPlayTimeMinutes || 0) / progression.stats.campaignsCompleted) 
                        : 0}m / campaign
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link href="/terminal">
            <Card className="bg-[hsl(var(--card))] border-amber-900/30 hover:border-amber-600/50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h3 className="font-bold text-foreground mb-1">Start Investigation</h3>
                <p className="text-xs text-muted-foreground">Launch the terminal</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/leaderboards">
            <Card className="bg-[hsl(var(--card))] border-teal-900/30 hover:border-teal-600/50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                <h3 className="font-bold text-foreground mb-1">View Leaderboards</h3>
                <p className="text-xs text-muted-foreground">Compare with others</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/investigate">
            <Card className="bg-[hsl(var(--card))] border-purple-900/30 hover:border-purple-600/50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-bold text-foreground mb-1">AI Workspace</h3>
                <p className="text-xs text-muted-foreground">Guided investigations</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
