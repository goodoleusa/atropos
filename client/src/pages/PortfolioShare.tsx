import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Briefcase,
  Target,
  Scan,
  Bot,
  FileText,
  Shield,
  AlertTriangle,
  Crosshair,
  Layers,
  Star,
  ExternalLink,
  Clock,
  Code,
  Users
} from "lucide-react";

interface PortfolioEntry {
  id: number;
  shareId: string;
  title: string;
  summary: string | null;
  category: string;
  visibility: string;
  skills: string[];
  tools: string[];
  reportSnapshot: any;
  scanSnapshot: any[];
  agentSnapshot: any;
  evidence: { type: string; label: string; content: string }[];
  outcome: string | null;
  difficulty: string | null;
  timeSpentMinutes: number | null;
  featured: boolean;
  createdAt: string;
}

function RadarChart({ skills }: { skills: { name: string; value: number }[] }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 110;
  const levels = 4;
  const n = skills.length;

  const getPoint = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLines = Array.from({ length: levels }, (_, l) => {
    const r = (maxRadius * (l + 1)) / levels;
    return Array.from({ length: n }, (_, i) => getPoint(i, r)).map(p => `${p.x},${p.y}`).join(" ");
  });

  const dataPoints = skills.map((s, i) => getPoint(i, (s.value / 100) * maxRadius));
  const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(217, 119, 6, 0.3)" />
          <stop offset="100%" stopColor="rgba(20, 184, 166, 0.2)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {gridLines.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(217, 119, 6, 0.12)" strokeWidth="1" />
      ))}
      {skills.map((_, i) => {
        const outer = getPoint(i, maxRadius);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="rgba(217, 119, 6, 0.08)" strokeWidth="1" />;
      })}
      <polygon points={dataPath} fill="url(#radarFill)" stroke="rgba(217, 119, 6, 0.8)" strokeWidth="2" filter="url(#glow)" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill="#d97706" stroke="#0a0500" strokeWidth="2" filter="url(#glow)" />
      ))}
      {skills.map((s, i) => {
        const labelP = getPoint(i, maxRadius + 28);
        return (
          <text key={i} x={labelP.x} y={labelP.y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[11px] font-mono">
            {s.name}
          </text>
        );
      })}
    </svg>
  );
}

export default function PortfolioShare() {
  const [, params] = useRoute("/portfolio/:shareId");
  const shareId = params?.shareId;

  const { data, isLoading, error } = useQuery<{ success: boolean; entry: PortfolioEntry }>({
    queryKey: ["/api/portfolio/share", shareId],
    queryFn: () => fetch(`/api/portfolio/share/${shareId}`).then(r => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    }),
    enabled: !!shareId,
  });

  const entry = data?.entry;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--card))] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-800 font-mono text-sm">Loading portfolio entry...</p>
        </div>
      </div>
    );
  }

  if (!entry || error) {
    return (
      <div className="min-h-screen bg-[hsl(var(--card))] flex items-center justify-center">
        <Card className="bg-[hsl(var(--card))] border-border max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-muted-foreground text-lg font-bold mb-2">Portfolio Entry Not Found</h2>
            <p className="text-muted-foreground text-sm mb-4">This entry may be private or no longer exists.</p>
            <Link href="/">
              <Button variant="ghost" className="text-amber-800">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const difficultyColor = entry.difficulty === "expert" ? "red" : entry.difficulty === "hard" ? "orange" : entry.difficulty === "medium" ? "amber" : "teal";

  const skillRadarData = (() => {
    const mapped: Record<string, number> = { OSINT: 0, Network: 0, Malware: 0, "Social Eng": 0, "Web Sec": 0, "Threat Intel": 0 };
    entry.skills.forEach(s => {
      if (s.includes("OSINT")) mapped["OSINT"] = 80;
      if (s.includes("Network")) mapped["Network"] = 80;
      if (s.includes("Malware")) mapped["Malware"] = 80;
      if (s.includes("Social")) mapped["Social Eng"] = 80;
      if (s.includes("Web")) mapped["Web Sec"] = 80;
      if (s.includes("Threat")) mapped["Threat Intel"] = 80;
    });
    return Object.entries(mapped).map(([name, value]) => ({ name, value }));
  })();

  const hasIntel = entry.agentSnapshot?.extractedIntel;

  return (
    <div className="min-h-screen bg-[hsl(var(--card))] text-foreground">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-900/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-900/5 rounded-full blur-3xl" />
      </div>

      <header className="border-b border-amber-900/20 bg-[hsl(var(--card))]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-900/20 border border-amber-900/30 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-mono">Portfolio Entry</p>
              <h1 className="text-sm font-bold text-foreground">{entry.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {entry.featured && (
              <Badge className="bg-amber-900/30 text-amber-300 border-amber-600 text-[10px]">
                <Star className="w-2.5 h-2.5 mr-1" /> Featured
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
              {new Date(entry.createdAt).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10 space-y-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="outline" className="border-amber-900/30 text-amber-800">{entry.category}</Badge>
          {entry.difficulty && (
            <Badge variant="outline" className={`border-${difficultyColor}-900 text-${difficultyColor}-400`}>
              {entry.difficulty}
            </Badge>
          )}
          {entry.timeSpentMinutes && (
            <Badge variant="outline" className="border-border text-muted-foreground">
              <Clock className="w-2.5 h-2.5 mr-1" /> {entry.timeSpentMinutes}m
            </Badge>
          )}
        </div>

        {entry.summary && (
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">{entry.summary}</p>
        )}

        {(entry.skills.length > 0 || entry.tools.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-[hsl(var(--card))] border-amber-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 text-xs font-mono flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" /> Skills Demonstrated
                </CardTitle>
              </CardHeader>
              <CardContent>
                {skillRadarData.some(s => s.value > 0) && <RadarChart skills={skillRadarData} />}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {entry.skills.map(s => (
                    <Badge key={s} className="text-[10px] bg-amber-950/30 text-amber-800 border-amber-900/30">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[hsl(var(--card))] border-teal-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-teal-800 text-xs font-mono flex items-center gap-2">
                  <Code className="w-3.5 h-3.5" /> Tools & Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entry.tools.map((tool) => (
                    <div key={tool} className="flex items-center gap-3 p-2 bg-card/20 rounded">
                      <div className="w-8 h-8 rounded bg-teal-900/20 border border-teal-900/30 flex items-center justify-center">
                        <Scan className="w-4 h-4 text-teal-800" />
                      </div>
                      <span className="text-sm text-foreground">{tool}</span>
                    </div>
                  ))}
                  {entry.tools.length === 0 && (
                    <p className="text-muted-foreground text-xs">No tools specified</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {hasIntel && (
          <Card className="bg-[hsl(var(--card))] border-amber-900/20">
            <CardHeader>
              <CardTitle className="text-amber-800 text-sm font-mono flex items-center gap-2">
                <Bot className="w-4 h-4" /> Agent Intelligence Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-card/20 rounded-lg border border-border/30">
                  <p className="text-[10px] text-muted-foreground uppercase mb-2">Messages Analyzed</p>
                  <p className="text-2xl font-bold text-amber-800 font-mono">{entry.agentSnapshot?.messageCount || 0}</p>
                </div>
                <div className="p-3 bg-card/20 rounded-lg border border-border/30">
                  <p className="text-[10px] text-muted-foreground uppercase mb-2">Targets Identified</p>
                  <p className="text-2xl font-bold text-teal-800 font-mono">{hasIntel.targets?.length || 0}</p>
                </div>
                <div className="p-3 bg-card/20 rounded-lg border border-border/30">
                  <p className="text-[10px] text-muted-foreground uppercase mb-2">Vulnerabilities Found</p>
                  <p className="text-2xl font-bold text-red-700 font-mono">{hasIntel.potentialVulns?.length || 0}</p>
                </div>
              </div>

              {hasIntel.targets?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Targets</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hasIntel.targets.map((t: string, i: number) => (
                      <Badge key={i} className="bg-amber-950/20 text-amber-800 border-amber-900/30 text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {hasIntel.technologies?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Technologies Discovered</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hasIntel.technologies.map((t: string, i: number) => (
                      <Badge key={i} className="bg-teal-950/20 text-teal-800 border-teal-900/30 text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {hasIntel.potentialVulns?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Potential Vulnerabilities</p>
                  <div className="space-y-2">
                    {hasIntel.potentialVulns.map((v: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-red-950/10 rounded border border-red-900/20">
                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${v.severity === "critical" ? "text-red-700" : v.severity === "high" ? "text-orange-800" : "text-amber-800"}`} />
                        <span className="text-sm text-foreground flex-1">{v.type}</span>
                        <Badge variant="outline" className={`text-[9px] ${v.severity === "critical" ? "border-red-700 text-red-700" : v.severity === "high" ? "border-orange-700 text-orange-800" : "border-amber-700 text-amber-800"}`}>
                          {v.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasIntel.recommendations?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Recommendations</p>
                  <ul className="space-y-1.5">
                    {hasIntel.recommendations.map((r: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-amber-800 mt-0.5">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {entry.scanSnapshot.length > 0 && (
          <Card className="bg-[hsl(var(--card))] border-teal-900/20">
            <CardHeader>
              <CardTitle className="text-teal-800 text-sm font-mono flex items-center gap-2">
                <Scan className="w-4 h-4" /> Scan Results ({entry.scanSnapshot.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entry.scanSnapshot.map((scan: any, i: number) => (
                <div key={i} className="p-3 bg-card/20 rounded-lg border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-teal-800">{scan.target}</span>
                    <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">{scan.scriptPath}</Badge>
                  </div>
                  {scan.completedAt && (
                    <p className="text-[10px] text-muted-foreground">Completed: {new Date(scan.completedAt).toLocaleString()}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {entry.evidence.length > 0 && (
          <Card className="bg-[hsl(var(--card))] border-purple-900/20">
            <CardHeader>
              <CardTitle className="text-purple-700 text-sm font-mono flex items-center gap-2">
                <FileText className="w-4 h-4" /> Evidence ({entry.evidence.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entry.evidence.map((ev, i) => (
                <div key={i} className="p-3 bg-card/20 rounded-lg border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-[9px] bg-purple-950/30 text-purple-700 border-purple-900/30">{ev.type}</Badge>
                    <span className="text-sm text-foreground">{ev.label}</span>
                  </div>
                  <pre className="text-[11px] text-muted-foreground font-mono whitespace-pre-wrap bg-card/30 p-2 rounded">{ev.content}</pre>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {entry.outcome && (
          <Card className="bg-[hsl(var(--card))] border-teal-900/20">
            <CardHeader>
              <CardTitle className="text-teal-800 text-sm font-mono flex items-center gap-2">
                <Crosshair className="w-4 h-4" /> Outcome & Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{entry.outcome}</p>
            </CardContent>
          </Card>
        )}

        <div className="text-center pt-8 pb-4 border-t border-card/30">
          <p className="text-[10px] text-muted-foreground font-mono">
            Built with SysAdmin Corp • Cybersecurity Training Platform
          </p>
        </div>
      </main>
    </div>
  );
}
