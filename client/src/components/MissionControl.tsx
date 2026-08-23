import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/hooks/useGameSession";
import { useLearningStore } from "@/stores/useLearningStore";
import { ActivityStream } from "./ActivityStream";
import { useMissionStats } from "@/hooks/useMissionBus";
import {
  Target,
  Terminal,
  Shield,
  Radio,
  Globe,
  Search,
  Crosshair,
  ChevronRight,
  CheckCircle,
  Clock,
  Zap,
  FlaskConical,
  Radar,
  Play,
  Brain,
  Eye,
  Users,
  Wrench,
  GraduationCap,
} from "lucide-react";
import type { LearningStyle } from "@/config/learningConfig";

interface CampaignRun {
  runId: string;
  campaignId: string;
  sessionToken: string;
  status: string;
  currentNode: string;
  nodeHistory: string[];
  visitedNodes: string[];
  inventory: string[];
  flags: Record<string, boolean>;
  startedAt: string;
  updatedAt: string;
}

const SIMULATED_BADGE = (
  <Badge
    variant="outline"
    className="border-purple-500/60 bg-purple-950/40 text-purple-300 text-[9px] font-mono uppercase tracking-wider gap-1 shrink-0"
    data-testid="badge-simulated"
  >
    <Shield className="w-2.5 h-2.5" />
    Sandbox
  </Badge>
);

const LIVE_BADGE = (
  <Badge
    variant="outline"
    className="border-red-500/60 bg-red-950/40 text-red-300 text-[9px] font-mono uppercase tracking-wider gap-1 animate-pulse shrink-0"
    data-testid="badge-live"
  >
    <Radio className="w-2.5 h-2.5" />
    Live Data
  </Badge>
);

const CATEGORY_CONFIG: Record<string, {
  label: string;
  icon: typeof Target;
  color: string;
  border: string;
  bg: string;
  isLive: boolean;
  description: string;
  href: string;
}> = {
  campaigns: {
    label: "Investigation Campaigns",
    icon: Target,
    color: "text-amber-800",
    border: "border-amber-900/40",
    bg: "bg-amber-950/20",
    isLive: false,
    description: "Scripted detective stories with branching paths and hidden clues",
    href: "/campaigns",
  },
  c2missions: {
    label: "C2 Guided Missions",
    icon: Terminal,
    color: "text-teal-800",
    border: "border-teal-900/40",
    bg: "bg-teal-950/20",
    isLive: false,
    description: "QR command & control tutorials — beaconing, tasking, evasion",
    href: "/terminal",
  },
  labs: {
    label: "QR Hijacking Labs",
    icon: FlaskConical,
    color: "text-purple-700",
    border: "border-purple-900/40",
    bg: "bg-purple-950/20",
    isLive: false,
    description: "Hands-on QR code attack labs in a sandboxed environment",
    href: "/terminal",
  },
  voidMissions: {
    label: "Void Missions",
    icon: Crosshair,
    color: "text-muted-foreground",
    border: "border-border",
    bg: "bg-card/20",
    isLive: false,
    description: "Terminal challenges from The Scrying Pool",
    href: "/terminal",
  },
  investigations: {
    label: "Live Investigations",
    icon: Search,
    color: "text-red-700",
    border: "border-red-900/40",
    bg: "bg-red-950/20",
    isLive: true,
    description: "Freeform workspace — real OSINT scans against actual targets",
    href: "/investigate",
  },
  scans: {
    label: "Scanner & SpiderFoot",
    icon: Radar,
    color: "text-red-700",
    border: "border-red-900/40",
    bg: "bg-red-950/20",
    isLive: true,
    description: "Atropos Scanner and SpiderFoot hits real targets",
    href: "/investigate",
  },
  agents: {
    label: "Agent Conversations",
    icon: Globe,
    color: "text-orange-800",
    border: "border-orange-900/40",
    bg: "bg-orange-950/20",
    isLive: true,
    description: "NEXUS specialists — real AI analysis, can use live scan data",
    href: "/agents",
  },
};

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  active: { dot: "bg-teal-400 animate-pulse", text: "text-teal-800", label: "In Progress" },
  accepted: { dot: "bg-amber-400", text: "text-amber-800", label: "Accepted" },
  in_progress: { dot: "bg-teal-400 animate-pulse", text: "text-teal-800", label: "In Progress" },
  completed: { dot: "bg-muted", text: "text-muted-foreground", label: "Completed" },
  abandoned: { dot: "bg-red-600", text: "text-red-700", label: "Abandoned" },
};

const STYLE_CONFIG: Record<LearningStyle, { label: string; desc: string; icon: typeof Brain; color: string; border: string; bg: string }> = {
  experiential: { label: 'Experiential', desc: 'Hands-on labs, try first, theory later', icon: FlaskConical, color: 'text-emerald-400', border: 'border-emerald-800/40', bg: 'bg-emerald-900/15' },
  visual: { label: 'Visual', desc: 'Diagrams, flowcharts, visual mapping', icon: Eye, color: 'text-sky-400', border: 'border-sky-800/40', bg: 'bg-sky-900/15' },
  analytical: { label: 'Analytical', desc: 'Deep theory, citations, detailed why', icon: Brain, color: 'text-purple-700', border: 'border-purple-800/40', bg: 'bg-purple-900/15' },
  social: { label: 'Social', desc: 'Community, discussion, collaboration', icon: Users, color: 'text-amber-800', border: 'border-amber-800/40', bg: 'bg-amber-900/15' },
  pragmatic: { label: 'Pragmatic', desc: 'Quick wins, cheat sheets, shortcuts', icon: Wrench, color: 'text-rose-400', border: 'border-rose-800/40', bg: 'bg-rose-900/15' },
};

export default function MissionControl() {
  const { gameState, completeMission } = useGame();
  const sessionToken = gameState.sessionToken;
  const learningStyle = useLearningStore(s => s.style);
  const setLearningStyle = useLearningStore(s => s.setStyle);
  const skillLevel = useLearningStore(s => s.skillLevel);
  const setSkillLevel = useLearningStore(s => s.setSkillLevel);

  const { data: campaignRuns = [] } = useQuery<CampaignRun[]>({
    queryKey: ["/api/campaign-runs/session", sessionToken],
    queryFn: () =>
      fetch(`/api/campaign-runs/session/${sessionToken}`).then((r) =>
        r.ok ? r.json() : []
      ),
    enabled: !!sessionToken,
  });

  const { data: spiderfootHistory = [] } = useQuery<any[]>({
    queryKey: ["/api/spiderfoot/history"],
    queryFn: () =>
      fetch("/api/spiderfoot/history").then((r) => (r.ok ? r.json() : [])),
  });

  const { data: campaigns = [] } = useQuery<any[]>({
    queryKey: ["/api/campaigns"],
    queryFn: () =>
      fetch("/api/campaigns").then((r) => (r.ok ? r.json() : [])),
  });

  const activeCampaigns = campaignRuns.filter((r) => r.status === "active");
  const completedCampaigns = campaignRuns.filter((r) => r.status === "completed");
  const voidMissions = gameState.acceptedMissions.filter((m) => m.source === "void");
  const activeMissions = gameState.acceptedMissions.filter((m) => m.status !== "completed");
  const completedMissions = gameState.acceptedMissions.filter((m) => m.status === "completed");

  const totalActive =
    activeCampaigns.length +
    activeMissions.length +
    spiderfootHistory.filter((s: any) => s.status === "running").length;

  const totalCompleted =
    completedCampaigns.length +
    completedMissions.length +
    (gameState.stats?.missionsCompleted || 0);

  const { data: busStats } = useMissionStats();
  const newFindings = busStats?.new || 0;

  return (
    <div className="space-y-6" data-testid="mission-control-tab">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-orbitron text-amber-800" data-testid="mission-control-title">
            Mission Control
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            All your active campaigns and missions in one place
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              {SIMULATED_BADGE}
              <span className="text-muted-foreground">= Safe, no real targets</span>
            </div>
            <div className="flex items-center gap-2">
              {LIVE_BADGE}
              <span className="text-muted-foreground">= Real targets/data</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="bg-card/50 border border-border">
          <TabsTrigger value="missions" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400 text-xs">
            Missions
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-teal-900/30 data-[state=active]:text-teal-400 text-xs" data-testid="activity-tab">
            Activity Feed
            {newFindings > 0 && (
              <Badge variant="outline" className="ml-1.5 text-[9px] px-1 py-0 border-teal-700 text-teal-800">{newFindings}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-4">
          <Card className="bg-[hsl(var(--card))] border-teal-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-teal-800 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" /> Cross-Module Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityStream />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions" className="mt-4 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-[hsl(var(--card))] border-teal-900/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-teal-800" data-testid="active-count">{totalActive}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-800" data-testid="completed-count">{totalCompleted}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-purple-900/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{campaignRuns.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Campaigns</p>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{gameState.acceptedMissions.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Missions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[hsl(var(--card))] border-border" data-testid="learning-style-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-mono flex items-center gap-2 text-foreground">
              <GraduationCap className="w-4 h-4 text-teal-800" />
              Learning Profile
            </CardTitle>
            <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">
              Persists across sessions
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Your style adapts all AI missions, NEXUS guidance, and exercise content
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-2">How do you learn best?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 md:gap-2">
              {(Object.entries(STYLE_CONFIG) as [LearningStyle, typeof STYLE_CONFIG[LearningStyle]][]).map(([key, meta]) => {
                const SIcon = meta.icon;
                const isActive = key === learningStyle;
                return (
                  <button
                    key={key}
                    onClick={() => setLearningStyle(key)}
                    className={`flex items-center gap-2 p-2.5 md:p-2 rounded-lg border transition-all min-h-[48px] md:min-h-0 ${
                      isActive
                        ? `${meta.border} ${meta.bg} ring-1 ring-inset ${meta.border}`
                        : 'border-border bg-card/30 hover:border-border active:bg-card/40'
                    }`}
                    data-testid={`style-select-${key}`}
                  >
                    <SIcon className={`w-4 h-4 md:w-3.5 md:h-3.5 shrink-0 ${isActive ? meta.color : 'text-muted-foreground'}`} />
                    <div className="text-left min-w-0">
                      <p className={`text-[11px] md:text-[10px] font-medium ${isActive ? meta.color : 'text-muted-foreground'}`}>{meta.label}</p>
                      <p className="text-[9px] text-muted-foreground truncate hidden sm:block">{meta.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-1 border-t border-border/50">
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Skill Level</p>
              <div className="flex gap-1 flex-wrap">
                {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setSkillLevel(level)}
                    className={`px-2.5 py-1.5 md:py-1 rounded text-[10px] md:text-[9px] font-medium transition-colors min-h-[36px] md:min-h-0 ${
                      skillLevel === level
                        ? 'bg-teal-900/30 border border-teal-800/40 text-teal-800'
                        : 'bg-card/30 border border-border text-muted-foreground hover:text-foreground active:bg-border/40'
                    }`}
                    data-testid={`skill-level-${level}`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground sm:text-right">
              <span className={`${STYLE_CONFIG[learningStyle].color} font-medium`}>
                {STYLE_CONFIG[learningStyle].label}
              </span>
              {' · '}
              <span className="text-teal-800">{skillLevel}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeCampaigns.length > 0 && (
        <CategorySection category="campaigns">
          {activeCampaigns.map((run) => {
            const campaign = campaigns.find((c: any) => c.key === run.campaignId || c.campaignId === run.campaignId);
            const progress = run.visitedNodes?.length
              ? Math.min(100, (run.visitedNodes.length / Math.max(run.visitedNodes.length + 3, 10)) * 100)
              : 10;
            return (
              <MissionCard
                key={run.runId}
                title={campaign?.title || run.campaignId}
                subtitle={`${run.visitedNodes?.length || 0} nodes visited · ${run.inventory?.length || 0} items`}
                status={run.status}
                progress={progress}
                href={`/play/${run.campaignId}`}
                isLive={false}
              />
            );
          })}
        </CategorySection>
      )}

      {completedCampaigns.length > 0 && (
        <CategorySection category="campaigns" label="Completed Campaigns">
          {completedCampaigns.slice(0, 3).map((run) => {
            const campaign = campaigns.find((c: any) => c.key === run.campaignId || c.campaignId === run.campaignId);
            return (
              <MissionCard
                key={run.runId}
                title={campaign?.title || run.campaignId}
                subtitle={`Finished ${new Date(run.updatedAt).toLocaleDateString()}`}
                status="completed"
                progress={100}
                href={`/play/${run.campaignId}`}
                isLive={false}
              />
            );
          })}
        </CategorySection>
      )}

      {voidMissions.length > 0 && (
        <CategorySection category="voidMissions">
          {voidMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              title={mission.name}
              subtitle={mission.description}
              status={mission.status}
              progress={mission.status === "completed" ? 100 : 30}
              href={`/terminal?cmd=${encodeURIComponent(mission.command)}`}
              isLive={false}
              command={mission.command}
              onComplete={mission.status !== "completed" ? () => completeMission(mission.id) : undefined}
            />
          ))}
        </CategorySection>
      )}

      <CategorySection category="c2missions">
        <div className="text-center py-4">
          <p className="text-muted-foreground text-xs mb-3">
            C2 missions run inside the QR C2 panel on the Terminal page
          </p>
          <Link href="/terminal">
            <Button
              size="sm"
              variant="outline"
              className="border-teal-800/50 text-teal-800 hover:bg-teal-950/30 text-xs"
              data-testid="go-to-c2"
            >
              <Terminal className="w-3 h-3 mr-1" />
              Open Terminal & QR Panel
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CategorySection>

      <CategorySection category="labs">
        <div className="text-center py-4">
          <p className="text-muted-foreground text-xs mb-3">
            6 QR hijacking labs — access via QR Code panel on Terminal page
          </p>
          <Link href="/terminal">
            <Button
              size="sm"
              variant="outline"
              className="border-purple-800/50 text-purple-700 hover:bg-purple-950/30 text-xs"
              data-testid="go-to-labs"
            >
              <FlaskConical className="w-3 h-3 mr-1" />
              Open Labs
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CategorySection>

      <div className="pt-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-px h-4 bg-red-600/50" />
          <h4 className="text-xs font-mono text-red-700 uppercase tracking-widest">
            Live Operations
          </h4>
          <div className="flex-1 h-px bg-red-900/20" />
          {LIVE_BADGE}
        </div>
        <p className="text-[10px] text-red-700/60 mb-4 font-mono">
          These tools hit real targets. Only scan systems you have permission to test.
        </p>
      </div>

      <CategorySection category="investigations">
        <div className="text-center py-4">
          <p className="text-muted-foreground text-xs mb-3">
            Freeform workspace with scanner, SpiderFoot, and AI agents
          </p>
          <Link href="/investigate">
            <Button
              size="sm"
              variant="outline"
              className="border-red-800/50 text-red-700 hover:bg-red-950/30 text-xs"
              data-testid="go-to-investigate"
            >
              <Search className="w-3 h-3 mr-1" />
              Open Investigation Hub
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CategorySection>

      {spiderfootHistory.length > 0 && (
        <CategorySection category="scans">
          {spiderfootHistory.slice(0, 5).map((scan: any, i: number) => (
            <MissionCard
              key={scan.scanId || i}
              title={`SpiderFoot: ${scan.target}`}
              subtitle={`${scan.modules?.length || 0} modules · ${scan.status}`}
              status={scan.status === "running" ? "active" : scan.status === "completed" ? "completed" : "abandoned"}
              progress={scan.status === "completed" ? 100 : scan.status === "running" ? 50 : 0}
              href="/investigate"
              isLive={true}
            />
          ))}
        </CategorySection>
      )}

      <CategorySection category="agents">
        <div className="text-center py-4">
          <p className="text-muted-foreground text-xs mb-3">
            6 NEXUS specialists analyze data and guide investigations
          </p>
          <Link href="/agents">
            <Button
              size="sm"
              variant="outline"
              className="border-orange-800/50 text-orange-800 hover:bg-orange-950/30 text-xs"
              data-testid="go-to-agents"
            >
              <Globe className="w-3 h-3 mr-1" />
              Open Agent Hub
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CategorySection>

      {totalActive === 0 && campaignRuns.length === 0 && gameState.acceptedMissions.length === 0 && (
        <Card className="bg-[hsl(var(--card))] border-border">
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm mb-2">No missions yet</p>
            <p className="text-muted-foreground text-xs mb-4">
              Start a campaign, visit The Void, or open the Investigation Hub
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/campaigns">
                <Button size="sm" variant="outline" className="border-amber-800/50 text-amber-800 text-xs">
                  Browse Campaigns
                </Button>
              </Link>
              <Link href="/void">
                <Button size="sm" variant="outline" className="border-purple-800/50 text-purple-700 text-xs">
                  Enter The Void
                </Button>
              </Link>
              <Link href="/investigate">
                <Button size="sm" variant="outline" className="border-red-800/50 text-red-700 text-xs">
                  Investigation Hub
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CategorySection({
  category,
  label,
  children,
}: {
  category: string;
  label?: string;
  children: React.ReactNode;
}) {
  const config = CATEGORY_CONFIG[category];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <Card className={`bg-[hsl(var(--card))] ${config.border}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-mono flex items-center gap-2 ${config.color}`}>
            <Icon className="w-4 h-4" />
            {label || config.label}
          </CardTitle>
          {config.isLive ? LIVE_BADGE : SIMULATED_BADGE}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{config.description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MissionCard({
  title,
  subtitle,
  status,
  progress,
  href,
  isLive,
  command,
  onComplete,
}: {
  title: string;
  subtitle: string;
  status: string;
  progress: number;
  href: string;
  isLive: boolean;
  command?: string;
  onComplete?: () => void;
}) {
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.active;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded border ${
        isLive ? "border-red-900/20 bg-red-950/10" : "border-border/50 bg-card/30"
      } hover:border-amber-800/30 transition-colors group`}
      data-testid={`mission-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${statusStyle.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-foreground font-medium truncate">{title}</p>
          <span className={`text-[9px] ${statusStyle.text} uppercase tracking-wider`}>
            {statusStyle.label}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>
        {command && (
          <code className="text-[9px] text-teal-700 bg-black/50 px-1.5 py-0.5 rounded mt-1 inline-block font-mono">
            $ {command}
          </code>
        )}
        {progress > 0 && progress < 100 && (
          <Progress value={progress} className="h-1 mt-1.5 bg-card" />
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onComplete && (
          <Button
            size="sm"
            variant="ghost"
            className="text-teal-800 hover:text-teal-400 text-[10px] h-6 px-2"
            onClick={(e) => {
              e.preventDefault();
              onComplete();
            }}
            data-testid={`complete-mission-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Done
          </Button>
        )}
        <Link href={href}>
          <Button
            size="sm"
            variant="ghost"
            className="text-amber-800 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
          >
            <Play className="w-3 h-3 mr-1" />
            <span className="text-[10px]">Go</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
