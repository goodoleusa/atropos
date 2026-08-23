import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useGame } from "@/hooks/useGameSession";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Zap, 
  Award,
  Clock,
  Users,
  Flame,
  Star,
  Calendar,
  ArrowRight,
  ExternalLink,
  Medal,
  Crown,
  Sparkles
} from "lucide-react";
import { useLearningStore } from "@/stores/useLearningStore";
import { LEARNING_GOALS, LEARNING_STYLES } from "@/config/learningConfig";

interface Progression {
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
  currency: number;
  unlockedTools: string[];
  unlockedCampaigns: string[];
}

interface Achievement {
  id: number;
  achievementId: string;
  sessionToken: string;
  unlockedAt: string;
  progress: number;
  metadata: any;
}

interface AchievementDef {
  achievementId: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rarity: string;
  xpReward: number;
  currencyReward: number;
}

interface LeaderboardEntry {
  rank: number;
  sessionToken: string;
  username: string;
  score: number;
}

export default function Dashboard() {
  const { gameState } = useGame();
  const learningProfile = useLearningStore();
  
  const { data: progression, isLoading: loadingProg } = useQuery<Progression>({
    queryKey: ['/api/progression', gameState.sessionToken],
    queryFn: () => fetch(`/api/progression/${gameState.sessionToken}`).then(r => r.json())
  });

  const { data: achievements = [], isLoading: loadingAch } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements/player', gameState.sessionToken],
    queryFn: () => fetch(`/api/achievements/player/${gameState.sessionToken}`).then(r => r.json())
  });

  const { data: allAchievements = [] } = useQuery<AchievementDef[]>({
    queryKey: ['/api/achievements'],
    queryFn: () => fetch('/api/achievements').then(r => r.json())
  });

  const { data: globalRank } = useQuery<{ rank: number; entry: LeaderboardEntry } | null>({
    queryKey: ['/api/leaderboard/global_xp/rank', gameState.sessionToken],
    queryFn: () => fetch(`/api/leaderboard/global_xp/rank/${gameState.sessionToken}`).then(r => r.ok ? r.json() : null)
  });

  const { data: todayChallenge } = useQuery({
    queryKey: ['/api/challenges/today'],
    queryFn: () => fetch('/api/challenges/today').then(r => r.ok ? r.json() : null)
  });

  if (loadingProg || loadingAch) {
    return (
      <div className="min-h-screen bg-[hsl(var(--card))] flex items-center justify-center">
        <div className="text-amber-500 font-mono">Loading your profile...</div>
      </div>
    );
  }

  const level = progression?.level || 1;
  const xp = progression?.xp || 0;
  const xpForNextLevel = level * 100;
  const xpProgress = (xp / xpForNextLevel) * 100;
  const skills = progression?.skills || { osint: 0, network: 0, malware: 0, social: 0 };
  const stats = progression?.stats || {
    campaignsCompleted: 0,
    cluesFound: 0,
    hiddenCluesFound: 0,
    questsCompleted: 0,
    toolsUsed: 0,
    totalPlayTimeMinutes: 0,
    longestStreak: 0,
    currentStreak: 0
  };

  const unlockedAchievementIds = new Set(achievements.map(a => a.achievementId));
  const recentAchievements = [...achievements].sort((a, b) => 
    new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
  ).slice(0, 5);

  const learningGoalNames = learningProfile.goals.map(goalId => 
    LEARNING_GOALS.find(g => g.id === goalId)?.name || goalId
  );

  const learningStyle = LEARNING_STYLES.find(s => s.id === learningProfile.style);

  const rarityColors: Record<string, string> = {
    common: 'border-muted bg-card/30 text-muted-foreground',
    rare: 'border-blue-600 bg-blue-900/30 text-blue-400',
    epic: 'border-purple-600 bg-purple-900/30 text-purple-400',
    legendary: 'border-amber-600 bg-amber-900/30 text-amber-400'
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--card))] text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-[hsl(var(--card))] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-600" />
            <h1 className="font-orbitron text-xl font-bold text-amber-500">PLAYER PROFILE</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/terminal">
              <Button variant="outline" size="sm" className="border-amber-900/50 text-amber-600 hover:bg-amber-950/30">
                Terminal
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-amber-500">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Player Identity & Level */}
        <section>
          <Card className="bg-gradient-to-br from-amber-950/40 via-[hsl(var(--card))] to-teal-950/40 border-amber-900/30">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar/Level Badge */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-amber-900/30 border-4 border-amber-600 flex items-center justify-center">
                    <span className="text-4xl font-orbitron font-bold text-amber-500">{level}</span>
                  </div>
                  {progression?.prestigeLevel && progression.prestigeLevel > 0 && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-purple-900 border-2 border-purple-500 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-purple-300" />
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-orbitron font-bold text-amber-500 mb-2">
                    {gameState.username}
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    <Badge variant="outline" className="border-amber-600 text-amber-400">
                      Level {level}
                    </Badge>
                    {progression?.prestigeLevel && progression.prestigeLevel > 0 && (
                      <Badge className="bg-purple-900/30 text-purple-400 border-purple-700">
                        Prestige {progression.prestigeLevel}
                      </Badge>
                    )}
                    {globalRank && (
                      <Badge variant="outline" className="border-teal-600 text-teal-400">
                        Rank #{globalRank.rank}
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-muted text-muted-foreground">
                      {progression?.totalXp || 0} Total XP
                    </Badge>
                  </div>

                  {/* XP Progress Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Level {level} Progress</span>
                      <span className="text-amber-500">{xp} / {xpForNextLevel} XP</span>
                    </div>
                    <Progress value={xpProgress} className="h-3 bg-card">
                      <div className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full" style={{ width: `${xpProgress}%` }} />
                    </Progress>
                  </div>

                  {/* Currency */}
                  <div className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span className="text-amber-400 font-bold">{progression?.currency || 0}</span>
                    <span className="text-muted-foreground text-sm">Credits</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-teal-950/20 rounded-lg border border-teal-900/30">
                    <div className="text-3xl font-bold text-teal-400">{stats.campaignsCompleted}</div>
                    <div className="text-xs text-muted-foreground">Campaigns</div>
                  </div>
                  <div className="p-4 bg-amber-950/20 rounded-lg border border-amber-900/30">
                    <div className="text-3xl font-bold text-amber-400">{achievements.length}</div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                  </div>
                  <div className="p-4 bg-purple-950/20 rounded-lg border border-purple-900/30">
                    <div className="text-3xl font-bold text-purple-400">{stats.cluesFound}</div>
                    <div className="text-xs text-muted-foreground">Clues Found</div>
                  </div>
                  <div className="p-4 bg-orange-950/20 rounded-lg border border-orange-900/30">
                    <div className="text-3xl font-bold text-orange-400">{stats.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Skills */}
        <section>
          <h3 className="text-xl font-orbitron text-amber-600 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" /> Skill Specializations
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(skills).map(([skill, points]) => {
              const skillIcons: Record<string, any> = {
                osint: '🔍',
                network: '🌐',
                malware: '🦠',
                social: '👥'
              };
              const skillColors: Record<string, string> = {
                osint: 'from-purple-900/40 to-purple-950/20 border-purple-800',
                network: 'from-blue-900/40 to-blue-950/20 border-blue-800',
                malware: 'from-red-900/40 to-red-950/20 border-red-800',
                social: 'from-teal-900/40 to-teal-950/20 border-teal-800'
              };
              const skillLevel = Math.floor(points / 10) + 1;
              const progressInLevel = points % 10;

              return (
                <Card key={skill} className={`bg-gradient-to-br ${skillColors[skill]} border`}>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{skillIcons[skill]}</span>
                        <h4 className="font-bold text-foreground capitalize">{skill}</h4>
                      </div>
                      <Badge variant="outline" className="border-muted text-foreground">
                        Lv {skillLevel}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Points</span>
                        <span className="text-foreground">{points}</span>
                      </div>
                      <Progress value={progressInLevel * 10} className="h-2 bg-black/50" />
                      <div className="text-xs text-muted-foreground text-right">
                        {progressInLevel}/10 to next level
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Learning Profile & Today's Challenge */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Learning Profile */}
          <Card className="bg-[hsl(var(--card))] border-cyan-900/30">
            <CardHeader>
              <CardTitle className="text-cyan-500 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Learning Profile
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your personalized learning configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-2">Learning Style</div>
                <div className="flex items-center gap-2 p-3 bg-cyan-950/20 rounded-lg border border-cyan-900/30">
                  <span className="text-2xl">{learningStyle?.icon}</span>
                  <div>
                    <div className="font-bold text-cyan-400">{learningStyle?.name}</div>
                    <div className="text-xs text-muted-foreground">{learningStyle?.description}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-2">Learning Goals</div>
                <div className="flex flex-wrap gap-2">
                  {learningGoalNames.map(goal => (
                    <Badge key={goal} variant="outline" className="border-cyan-800 text-cyan-400">
                      {goal}
                    </Badge>
                  ))}
                  {learningGoalNames.length === 0 && (
                    <span className="text-muted-foreground text-sm">No goals set</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-2">Skill Level</div>
                <Badge className="bg-cyan-900/30 text-cyan-400 capitalize">
                  {learningProfile.skillLevel}
                </Badge>
              </div>

              <Link href="/investigate">
                <Button className="w-full bg-cyan-900/30 text-cyan-400 border border-cyan-700/50 hover:bg-cyan-900/50">
                  Update Learning Preferences
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Today's Challenge */}
          {todayChallenge && (
            <Card className="bg-[hsl(var(--card))] border-amber-900/30">
              <CardHeader>
                <CardTitle className="text-amber-500 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Daily Challenge
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Complete today's challenge for bonus rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg text-foreground mb-2">{todayChallenge.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{todayChallenge.description}</p>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="border-amber-700 text-amber-400 capitalize">
                      {todayChallenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      {todayChallenge.type}
                    </Badge>
                  </div>
                </div>

                <div className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/30">
                  <div className="text-xs text-muted-foreground uppercase mb-2">Rewards</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-400 font-bold">{todayChallenge.xpReward} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-400 font-bold">{todayChallenge.currencyReward} Credits</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-amber-700 hover:bg-amber-600 text-white">
                  Start Challenge <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {!todayChallenge && (
            <Card className="bg-[hsl(var(--card))] border-border">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No daily challenge available</p>
                <p className="text-xs text-muted-foreground mt-2">Check back tomorrow!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Statistics Grid */}
        <section>
          <h3 className="text-xl font-orbitron text-amber-600 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="bg-[hsl(var(--card))] border-teal-900/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-teal-400">{stats.campaignsCompleted}</div>
                <div className="text-xs text-muted-foreground">Campaigns</div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--card))] border-amber-900/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">{stats.cluesFound}</div>
                <div className="text-xs text-muted-foreground">Clues</div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--card))] border-purple-900/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.hiddenCluesFound}</div>
                <div className="text-xs text-muted-foreground">Hidden</div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--card))] border-blue-900/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.questsCompleted}</div>
                <div className="text-xs text-muted-foreground">Quests</div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--card))] border-orange-900/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.toolsUsed}</div>
                <div className="text-xs text-muted-foreground">Tools Used</div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--card))] border-red-900/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {Math.floor(stats.totalPlayTimeMinutes / 60)}h
                </div>
                <div className="text-xs text-muted-foreground">Play Time</div>
              </CardContent>
            </Card>
          </div>

          {/* Streaks & Records */}
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <Card className="bg-gradient-to-br from-orange-950/30 to-[hsl(var(--card))] border-orange-900/30">
              <CardContent className="p-6 flex items-center gap-4">
                <Flame className="w-10 h-10 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-orange-400">{stats.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                  <div className="text-xs text-muted-foreground">Record: {stats.longestStreak}</div>
                </div>
              </CardContent>
            </Card>

            {stats.fastestCampaignTime && (
              <Card className="bg-gradient-to-br from-teal-950/30 to-[hsl(var(--card))] border-teal-900/30">
                <CardContent className="p-6 flex items-center gap-4">
                  <Clock className="w-10 h-10 text-teal-500" />
                  <div>
                    <div className="text-2xl font-bold text-teal-400">{stats.fastestCampaignTime}m</div>
                    <div className="text-sm text-muted-foreground">Speed Record</div>
                    <div className="text-xs text-muted-foreground">Personal best</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {globalRank && (
              <Card className="bg-gradient-to-br from-amber-950/30 to-[hsl(var(--card))] border-amber-900/30">
                <CardContent className="p-6 flex items-center gap-4">
                  <Medal className="w-10 h-10 text-amber-500" />
                  <div>
                    <div className="text-2xl font-bold text-amber-400">#{globalRank.rank}</div>
                    <div className="text-sm text-muted-foreground">Global Rank</div>
                    <Link href="/leaderboards">
                      <div className="text-xs text-amber-600 hover:text-amber-500 flex items-center gap-1">
                        View leaderboards <ExternalLink className="w-3 h-3" />
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Recent Achievements */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-orbitron text-amber-600 flex items-center gap-2">
              <Award className="w-5 h-5" /> Recent Achievements
            </h3>
            <Badge variant="outline" className="border-amber-700 text-amber-400">
              {achievements.length} / {allAchievements.length}
            </Badge>
          </div>

          {recentAchievements.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAchievements.map(achievement => {
                const def = allAchievements.find(a => a.achievementId === achievement.achievementId);
                if (!def) return null;

                return (
                  <Card 
                    key={achievement.id} 
                    className={`border ${rarityColors[def.rarity] || rarityColors.common}`}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="text-3xl">{def.icon}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] capitalize ${
                            def.rarity === 'legendary' ? 'border-amber-600 text-amber-400' :
                            def.rarity === 'epic' ? 'border-purple-600 text-purple-400' :
                            def.rarity === 'rare' ? 'border-blue-600 text-blue-400' :
                            'border-muted text-muted-foreground'
                          }`}
                        >
                          {def.rarity}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-foreground">{def.name}</h4>
                      <p className="text-xs text-muted-foreground">{def.description}</p>
                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">
                          {def.category}
                        </Badge>
                        <span className="text-muted-foreground">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-[hsl(var(--card))] border-border">
              <CardContent className="p-12 text-center">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No achievements yet</p>
                <p className="text-xs text-muted-foreground mb-4">Complete campaigns and investigations to unlock achievements</p>
                <Link href="/investigate">
                  <Button variant="outline" className="border-amber-900/50 text-amber-600">
                    Start Investigating <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* All Achievements Overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-orbitron text-amber-600 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> All Achievements
            </h3>
            <div className="flex gap-2">
              <Badge className="bg-amber-900/30 text-amber-400 border-amber-800">
                {achievements.length} Unlocked
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">
                {allAchievements.length - achievements.length} Locked
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {allAchievements.map(ach => {
              const isUnlocked = unlockedAchievementIds.has(ach.achievementId);
              
              return (
                <Card 
                  key={ach.achievementId}
                  className={`${
                    isUnlocked 
                      ? `border ${rarityColors[ach.rarity] || rarityColors.common}`
                      : 'bg-[hsl(var(--card))] border-card opacity-60'
                  }`}
                >
                  <CardContent className="p-3 text-center space-y-2">
                    <div className="text-3xl">{isUnlocked ? ach.icon : '🔒'}</div>
                    <h4 className={`font-bold text-sm ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {isUnlocked ? ach.name : '???'}
                    </h4>
                    {isUnlocked ? (
                      <>
                        <p className="text-xs text-muted-foreground min-h-[32px]">{ach.description}</p>
                        <div className="flex items-center justify-center gap-2 text-xs">
                          {ach.xpReward > 0 && (
                            <span className="text-amber-500">+{ach.xpReward} XP</span>
                          )}
                          {ach.currencyReward > 0 && (
                            <span className="text-amber-500">+{ach.currencyReward} Credits</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground min-h-[32px]">Complete challenges to unlock</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid md:grid-cols-3 gap-4">
          <Link href="/investigate">
            <Card className="bg-[hsl(var(--card))] border-teal-900/30 hover:border-teal-700/50 transition-all cursor-pointer h-full">
              <CardContent className="p-6 text-center space-y-2">
                <Target className="w-10 h-10 mx-auto text-teal-500" />
                <h4 className="font-bold text-teal-400">Start Investigation</h4>
                <p className="text-xs text-muted-foreground">Begin a new OSINT campaign</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/leaderboards">
            <Card className="bg-[hsl(var(--card))] border-amber-900/30 hover:border-amber-700/50 transition-all cursor-pointer h-full">
              <CardContent className="p-6 text-center space-y-2">
                <Users className="w-10 h-10 mx-auto text-amber-500" />
                <h4 className="font-bold text-amber-400">Leaderboards</h4>
                <p className="text-xs text-muted-foreground">Compare your ranking</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/terminal">
            <Card className="bg-[hsl(var(--card))] border-purple-900/30 hover:border-purple-700/50 transition-all cursor-pointer h-full">
              <CardContent className="p-6 text-center space-y-2">
                <Zap className="w-10 h-10 mx-auto text-purple-500" />
                <h4 className="font-bold text-purple-400">Terminal</h4>
                <p className="text-xs text-muted-foreground">Access command interface</p>
              </CardContent>
            </Card>
          </Link>
        </section>
      </main>
    </div>
  );
}
