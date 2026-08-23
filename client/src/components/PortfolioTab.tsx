import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Plus,
  Eye,
  EyeOff,
  Share2,
  Trash2,
  ExternalLink,
  Star,
  StarOff,
  Shield,
  Target,
  Code,
  Users,
  Cpu,
  FileText,
  Scan,
  Bot,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Activity,
  Layers,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  X,
  Pencil,
  Link,
  PieChart,
  Clipboard,
  TrendingUp,
  Palette
} from "lucide-react";
import { useGame } from "@/hooks/useGameSession";
import { useToast } from "@/hooks/use-toast";

interface PortfolioEntry {
  id: number;
  shareId: string;
  title: string;
  summary: string | null;
  category: string;
  visibility: string;
  investigationId: string | null;
  campaignId: string | null;
  campaignRunId: string | null;
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
  updatedAt: string;
}

interface PortfolioSources {
  investigations: any[];
  campaignRuns: any[];
  scans: any[];
  dossiers: any[];
}

type VizType = "radar" | "severity" | "timeline" | "donut" | "none";
const VIZ_OPTIONS: { value: VizType; label: string; desc: string }[] = [
  { value: "none", label: "No Visualization", desc: "Text-only entry" },
  { value: "radar", label: "Skills Radar", desc: "Radar chart of skill coverage" },
  { value: "severity", label: "Severity Chart", desc: "Vulnerability severity breakdown" },
  { value: "timeline", label: "Scan Timeline", desc: "Timeline of scan results" },
  { value: "donut", label: "Evidence Donut", desc: "Evidence type distribution" },
];

const SKILL_TAGS = ["OSINT", "Network Security", "Malware Analysis", "Social Engineering", "Crypto Forensics", "Web Security", "Threat Intel", "Incident Response"];
const TOOL_TAGS = ["Atropos Scanner", "NEXUS Agent", "Shodan", "Censys", "VirusTotal", "Nmap", "Wireshark", "Burp Suite"];
const CATEGORIES = [
  { value: "investigation", label: "Investigation", icon: Crosshair },
  { value: "campaign", label: "Campaign", icon: Target },
  { value: "scan", label: "Scan Analysis", icon: Scan },
  { value: "report", label: "Report", icon: FileText },
  { value: "research", label: "Research", icon: Layers },
];

function RadarChart({ skills, size: sizeProp }: { skills: { name: string; value: number }[]; size?: number }) {
  const size = sizeProp || 200;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.4;
  const levels = 4;
  const n = skills.length;

  const getPoint = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const gridLines = Array.from({ length: levels }, (_, l) => {
    const r = (maxRadius * (l + 1)) / levels;
    const pts = Array.from({ length: n }, (_, i) => getPoint(i, r));
    return pts.map((p) => `${p.x},${p.y}`).join(" ");
  });

  const dataPoints = skills.map((s, i) => {
    const r = (s.value / 100) * maxRadius;
    return getPoint(i, r);
  });
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {gridLines.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(217, 119, 6, 0.15)"
          strokeWidth="1"
        />
      ))}
      {skills.map((_, i) => {
        const outer = getPoint(i, maxRadius);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(217, 119, 6, 0.1)"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points={dataPath}
        fill="rgba(217, 119, 6, 0.2)"
        stroke="rgba(217, 119, 6, 0.8)"
        strokeWidth="2"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#d97706" stroke="#0a0500" strokeWidth="2" />
      ))}
      {skills.map((s, i) => {
        const labelP = getPoint(i, maxRadius + (size * 0.1));
        return (
          <text
            key={i}
            x={labelP.x}
            y={labelP.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px] font-mono"
          >
            {s.name}
          </text>
        );
      })}
    </svg>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`text-${color}-400 font-mono`}>{value}</span>
      </div>
      <div className="h-2 bg-card rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-${color}-600 to-${color}-400 rounded-full transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SeverityChart({ vulns }: { vulns: any[] }) {
  const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  vulns.forEach(v => {
    const s = (v.severity || "medium").toLowerCase();
    if (counts[s] !== undefined) counts[s]++;
  });
  const total = vulns.length || 1;
  const colors: Record<string, string> = { critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#14b8a6" };
  const labels: Record<string, string> = { critical: "Critical", high: "High", medium: "Medium", low: "Low" };

  return (
    <div className="space-y-1.5">
      <h5 className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Severity Distribution</h5>
      {Object.entries(counts).filter(([, c]) => c > 0).map(([sev, count]) => (
        <div key={sev} className="flex items-center gap-2">
          <span className="text-[9px] w-12 text-right font-mono" style={{ color: colors[sev] }}>{labels[sev]}</span>
          <div className="flex-1 h-3 bg-card rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(count / total) * 100}%`, backgroundColor: colors[sev] }} />
          </div>
          <span className="text-[9px] text-muted-foreground font-mono w-4">{count}</span>
        </div>
      ))}
    </div>
  );
}

function ScanTimeline({ scans }: { scans: any[] }) {
  const sorted = [...scans].sort((a, b) => {
    const da = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const db = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return da - db;
  });
  return (
    <div className="space-y-1.5">
      <h5 className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Scan Timeline</h5>
      <div className="flex items-end gap-1 h-12">
        {sorted.map((s, i) => {
          const resultCount = Array.isArray(s.results) ? s.results.length : (s.results ? Object.keys(s.results).length : 0);
          const maxResults = Math.max(1, ...sorted.map((sc: any) => Array.isArray(sc.results) ? sc.results.length : (sc.results ? Object.keys(sc.results).length : 0)));
          const h = Math.max(15, (resultCount / maxResults) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${s.target} (${resultCount} results)`}>
              <div className="w-full rounded-t bg-gradient-to-t from-teal-700 to-teal-400 transition-all" style={{ height: `${h}%` }} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[8px] text-muted-foreground">
        <span>{sorted[0]?.completedAt ? new Date(sorted[0].completedAt).toLocaleDateString() : "Start"}</span>
        <span>{sorted[sorted.length - 1]?.completedAt ? new Date(sorted[sorted.length - 1].completedAt).toLocaleDateString() : "End"}</span>
      </div>
    </div>
  );
}

function EvidenceDonut({ evidence }: { evidence: { type: string; label: string; content: string }[] }) {
  const typeCounts: Record<string, number> = {};
  evidence.forEach(ev => { typeCounts[ev.type] = (typeCounts[ev.type] || 0) + 1; });
  const entries = Object.entries(typeCounts);
  const total = evidence.length || 1;
  const donutColors = ["#d97706", "#14b8a6", "#a855f7", "#ef4444", "#3b82f6", "#22c55e"];
  const r = 30;
  const cx = 40;
  const cy = 40;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="space-y-1.5">
      <h5 className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><PieChart className="w-3 h-3" /> Evidence by Type</h5>
      <div className="flex items-center gap-3">
        <svg width={80} height={80} viewBox="0 0 80 80">
          {entries.map(([type, count], i) => {
            const pct = count / total;
            const dashLen = pct * circumference;
            const seg = (
              <circle
                key={type}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={donutColors[i % donutColors.length]}
                strokeWidth="10"
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
            offset += dashLen;
            return seg;
          })}
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[12px] font-mono font-bold">{total}</text>
        </svg>
        <div className="space-y-0.5">
          {entries.map(([type, count], i) => (
            <div key={type} className="flex items-center gap-1.5 text-[9px]">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: donutColors[i % donutColors.length] }} />
              <span className="text-muted-foreground">{type}</span>
              <span className="text-muted-foreground font-mono">({count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmbedCard({ type, title, content, id, color }: { type: string; title: string; content: string; id: number; color: string }) {
  const [copied, setCopied] = useState(false);
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const embedHtml = `<div style="font-family:system-ui,-apple-system,sans-serif;background:#0a0500;border:1px solid ${color === "amber" ? "#92400e" : color === "teal" ? "#134e4a" : "#581c87"}33;border-radius:8px;padding:16px;max-width:480px;color:#d6d3d1"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="color:${color === "amber" ? "#f59e0b" : color === "teal" ? "#14b8a6" : "#a855f7"};font-size:11px;text-transform:uppercase;font-weight:600">${esc(type)}</span></div><h3 style="color:#e7e5e4;font-size:14px;font-weight:bold;margin:0 0 8px 0">${esc(title)}</h3><p style="color:#78716c;font-size:12px;margin:0;line-height:1.5">${esc(content.slice(0, 200))}</p><div style="margin-top:12px;padding-top:8px;border-top:1px solid #1c1917;font-size:10px;color:#57534e">Built with SysAdmin Corp</div></div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-3 bg-card/20 rounded-lg border border-${color}-900/20`}>
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className={`text-[9px] border-${color}-900/30 text-${color}-400`}>{type}</Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[9px] text-muted-foreground hover:text-amber-400"
          onClick={handleCopy}
          data-testid={`copy-embed-${type.toLowerCase().replace(/\s+/g, "-")}-${id}`}
        >
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Clipboard className="w-3 h-3 mr-1" />}
          {copied ? "Copied" : "Copy Embed"}
        </Button>
      </div>
      <h5 className="text-xs font-bold text-foreground mb-1">{title}</h5>
      <p className="text-[10px] text-muted-foreground line-clamp-2">{content}</p>
    </div>
  );
}

function EditEntryForm({ entry, onSave, onCancel }: {
  entry: PortfolioEntry;
  onSave: (id: number, updates: any) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(entry.title);
  const [summary, setSummary] = useState(entry.summary || "");
  const [category, setCategory] = useState(entry.category);
  const [difficulty, setDifficulty] = useState(entry.difficulty || "");
  const [outcome, setOutcome] = useState(entry.outcome || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(entry.skills);
  const [selectedTools, setSelectedTools] = useState<string[]>(entry.tools);
  const [visibility, setVisibility] = useState(entry.visibility);
  const existingVizConfig = entry.evidence.find((e: any) => e.type === "viz_config");
  const [selectedViz, setSelectedViz] = useState<string[]>(existingVizConfig ? existingVizConfig.content.split(",") : []);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const updatedEvidence = entry.evidence.filter((e: any) => e.type !== "viz_config");
    if (selectedViz.length > 0) {
      updatedEvidence.push({ type: "viz_config", label: "Visualization Settings", content: selectedViz.join(",") });
    }
    onSave(entry.id, {
      title: title.trim(),
      summary: summary.trim() || null,
      category,
      difficulty: difficulty || null,
      outcome: outcome.trim() || null,
      skills: selectedSkills,
      tools: selectedTools,
      visibility,
      evidence: updatedEvidence,
    });
  };

  return (
    <div className="p-4 space-y-4 border-t border-amber-900/30 bg-amber-950/5" data-testid={`edit-form-${entry.id}`}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-card/30 border-border text-foreground h-8 text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Summary</label>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="bg-card/30 border-border text-foreground text-sm min-h-[60px]"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-card/30 border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-card/30 border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
          >
            <option value="">Select...</option>
            <option value="beginner">Beginner</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Skills</label>
        <div className="flex flex-wrap gap-1.5">
          {SKILL_TAGS.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                selectedSkills.includes(skill)
                  ? "bg-amber-900/30 border-amber-700/50 text-amber-400"
                  : "bg-card/20 border-border text-muted-foreground hover:border-border"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Tools</label>
        <div className="flex flex-wrap gap-1.5">
          {TOOL_TAGS.map((tool) => (
            <button
              key={tool}
              onClick={() => setSelectedTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool])}
              className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                selectedTools.includes(tool)
                  ? "bg-teal-900/30 border-teal-700/50 text-teal-400"
                  : "bg-card/20 border-border text-muted-foreground hover:border-border"
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase mb-1 block flex items-center gap-1"><BarChart3 className="w-2.5 h-2.5" /> Visualization Style</label>
        <div className="flex flex-wrap gap-1.5">
          {VIZ_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectedViz(prev => value === "none" ? [] : prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])}
              className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 transition-colors ${
                value === "none" && selectedViz.length === 0
                  ? "bg-amber-900/30 border-amber-700/50 text-amber-400"
                  : value !== "none" && selectedViz.includes(value)
                  ? "bg-amber-900/30 border-amber-700/50 text-amber-400"
                  : "bg-card/20 border-border text-muted-foreground hover:border-border"
              }`}
              data-testid={`edit-viz-option-${value}`}
            >
              <Icon className="w-2.5 h-2.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Outcome</label>
        <Textarea
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="bg-card/30 border-border text-foreground text-sm min-h-[50px]"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setVisibility(visibility === "public" ? "private" : "public")}
          className={`text-xs ${visibility === "public" ? "text-teal-400" : "text-muted-foreground"}`}
        >
          {visibility === "public" ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
          {visibility === "public" ? "Public" : "Private"}
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground text-xs" data-testid={`cancel-edit-${entry.id}`}>Cancel</Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="bg-amber-900/30 hover:bg-amber-900/50 text-amber-300 border border-amber-700/50 text-xs"
          data-testid={`save-edit-${entry.id}`}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function PortfolioCard({ entry, onToggleVisibility, onToggleFeatured, onDelete, onCopyLink, onEdit }: {
  entry: PortfolioEntry;
  onToggleVisibility: (id: number, vis: string) => void;
  onToggleFeatured: (id: number, featured: boolean) => void;
  onDelete: (id: number) => void;
  onCopyLink: (shareId: string) => void;
  onEdit: (id: number, updates: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const CategoryIcon = CATEGORIES.find(c => c.value === entry.category)?.icon || Briefcase;

  const difficultyColor = entry.difficulty === "expert" ? "red" : entry.difficulty === "hard" ? "orange" : entry.difficulty === "medium" ? "amber" : "teal";

  const shareUrl = `${window.location.origin}/portfolio/${entry.shareId}`;
  const displayUrl = `${window.location.host}/portfolio/${entry.shareId}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const handleSaveEdit = (id: number, updates: any) => {
    onEdit(id, updates);
    setEditing(false);
  };

  const skillRadarData = useMemo(() => {
    const mapped: Record<string, number> = { OSINT: 0, Net: 0, Malw: 0, SocE: 0, Web: 0, Intel: 0 };
    entry.skills.forEach(s => {
      if (s.includes("OSINT")) mapped["OSINT"] = 80;
      if (s.includes("Network")) mapped["Net"] = 80;
      if (s.includes("Malware")) mapped["Malw"] = 80;
      if (s.includes("Social")) mapped["SocE"] = 80;
      if (s.includes("Web")) mapped["Web"] = 80;
      if (s.includes("Threat")) mapped["Intel"] = 80;
    });
    return Object.entries(mapped).map(([name, value]) => ({ name, value }));
  }, [entry.skills]);

  const vulns = entry.agentSnapshot?.extractedIntel?.potentialVulns || [];

  return (
    <Card className={`bg-[hsl(var(--card))] border-amber-900/30 transition-all hover:border-amber-700/50 ${entry.featured ? "ring-1 ring-amber-600/30" : ""}`}>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-amber-900/20 border border-amber-900/30 flex items-center justify-center flex-shrink-0">
                <CategoryIcon className="w-5 h-5 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground truncate">{entry.title}</h3>
                  {entry.featured && <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">
                    {entry.category}
                  </Badge>
                  {entry.difficulty && (
                    <Badge variant="outline" className={`text-[9px] border-${difficultyColor}-900 text-${difficultyColor}-400`}>
                      {entry.difficulty}
                    </Badge>
                  )}
                  <Badge variant="outline" className={`text-[9px] ${entry.visibility === "public" ? "border-teal-700 text-teal-400" : "border-border text-muted-foreground"}`}>
                    {entry.visibility === "public" ? <Eye className="w-2.5 h-2.5 mr-1" /> : <EyeOff className="w-2.5 h-2.5 mr-1" />}
                    {entry.visibility}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-400"
                onClick={() => setEditing(!editing)}
                data-testid={`edit-entry-${entry.id}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-400"
                onClick={() => onToggleFeatured(entry.id, !entry.featured)}
                data-testid={`toggle-featured-${entry.id}`}
              >
                {entry.featured ? <Star className="w-3.5 h-3.5" /> : <StarOff className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-teal-400"
                onClick={() => onToggleVisibility(entry.id, entry.visibility === "public" ? "private" : "public")}
                data-testid={`toggle-visibility-${entry.id}`}
              >
                {entry.visibility === "public" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-400"
                onClick={() => onCopyLink(entry.shareId)}
                data-testid={`copy-link-${entry.id}`}
              >
                <Share2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                onClick={() => onDelete(entry.id)}
                data-testid={`delete-entry-${entry.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 p-2 bg-card/30 rounded border border-border/50" data-testid={`share-url-${entry.id}`}>
            <Link className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] text-muted-foreground font-mono truncate flex-1">{displayUrl}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-muted-foreground hover:text-amber-400"
              onClick={handleCopyUrl}
            >
              {urlCopied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
            </Button>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" data-testid={`open-share-${entry.id}`}>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-teal-400">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>

          {entry.summary && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{entry.summary}</p>
          )}

          {(entry.skills.length > 0 || entry.tools.length > 0) && (
            <div className="flex flex-wrap gap-1 mt-3">
              {entry.skills.map(s => (
                <Badge key={s} className="text-[9px] bg-amber-950/30 text-amber-400 border-amber-900/30">{s}</Badge>
              ))}
              {entry.tools.map(t => (
                <Badge key={t} className="text-[9px] bg-teal-950/30 text-teal-400 border-teal-900/30">{t}</Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            {entry.scanSnapshot.length > 0 && (
              <span className="flex items-center gap-1"><Scan className="w-3 h-3" /> {entry.scanSnapshot.length} scans</span>
            )}
            {entry.agentSnapshot && (
              <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> {entry.agentSnapshot.messageCount} msgs</span>
            )}
            {entry.evidence.length > 0 && (
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {entry.evidence.length} evidence</span>
            )}
            {entry.timeSpentMinutes && (
              <span>{entry.timeSpentMinutes}m spent</span>
            )}
          </div>
        </div>

        {editing && (
          <EditEntryForm
            entry={entry}
            onSave={handleSaveEdit}
            onCancel={() => setEditing(false)}
          />
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 px-4 text-[10px] text-muted-foreground hover:text-muted-foreground border-t border-card/50 flex items-center justify-center gap-1 transition-colors"
          data-testid={`expand-entry-${entry.id}`}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Collapse" : "Expand Details"}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-card/50">

            {(() => {
              const vizConfig = entry.evidence.find((e: any) => e.type === "viz_config");
              const activeViz: string[] = vizConfig ? vizConfig.content.split(",") : [];
              const showSeverity = activeViz.length === 0 ? vulns.length > 0 : activeViz.includes("severity") && vulns.length > 0;
              const showTimeline = activeViz.length === 0 ? entry.scanSnapshot.length > 0 : activeViz.includes("timeline") && entry.scanSnapshot.length > 0;
              const showRadar = activeViz.length === 0 ? entry.skills.length > 0 : activeViz.includes("radar") && entry.skills.length > 0;
              const showDonut = activeViz.length === 0 ? entry.evidence.filter((e: any) => e.type !== "viz_config").length > 0 : activeViz.includes("donut") && entry.evidence.filter((e: any) => e.type !== "viz_config").length > 0;
              const hasAnyViz = showSeverity || showTimeline || showRadar || showDonut;
              return hasAnyViz ? (
                <div className="grid grid-cols-2 gap-3 pt-3">
                  {showSeverity && (
                    <div className="p-2 bg-card/20 rounded border border-border/30">
                      <SeverityChart vulns={vulns} />
                    </div>
                  )}
                  {showTimeline && (
                    <div className="p-2 bg-card/20 rounded border border-border/30">
                      <ScanTimeline scans={entry.scanSnapshot} />
                    </div>
                  )}
                  {showRadar && (
                    <div className="p-2 bg-card/20 rounded border border-border/30">
                      <h5 className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 mb-1"><Palette className="w-3 h-3" /> Skills Radar</h5>
                      <RadarChart skills={skillRadarData} size={140} />
                    </div>
                  )}
                  {showDonut && (
                    <div className="p-2 bg-card/20 rounded border border-border/30">
                      <EvidenceDonut evidence={entry.evidence.filter((e: any) => e.type !== "viz_config")} />
                    </div>
                  )}
                </div>
              ) : null;
            })()}

            {entry.agentSnapshot?.extractedIntel && (
              <div className="space-y-2 pt-3">
                <h4 className="text-xs font-mono text-amber-500 flex items-center gap-1"><Bot className="w-3 h-3" /> Agent Intelligence</h4>
                <div className="grid grid-cols-2 gap-2">
                  {entry.agentSnapshot.extractedIntel.targets?.length > 0 && (
                    <div className="p-2 bg-card/30 rounded">
                      <p className="text-[10px] text-muted-foreground mb-1">Targets</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.agentSnapshot.extractedIntel.targets.map((t: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-[9px] border-amber-900/30 text-amber-400">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.agentSnapshot.extractedIntel.technologies?.length > 0 && (
                    <div className="p-2 bg-card/30 rounded">
                      <p className="text-[10px] text-muted-foreground mb-1">Technologies</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.agentSnapshot.extractedIntel.technologies.map((t: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-[9px] border-teal-900/30 text-teal-400">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {entry.agentSnapshot.extractedIntel.potentialVulns?.length > 0 && (
                  <div className="p-2 bg-red-950/10 rounded border border-red-900/20">
                    <p className="text-[10px] text-muted-foreground mb-1">Potential Vulnerabilities</p>
                    <div className="space-y-1">
                      {entry.agentSnapshot.extractedIntel.potentialVulns.map((v: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[10px]">
                          <AlertTriangle className={`w-3 h-3 ${v.severity === "critical" ? "text-red-400" : v.severity === "high" ? "text-orange-400" : "text-amber-400"}`} />
                          <span className="text-muted-foreground">{v.type}</span>
                          <Badge variant="outline" className={`text-[8px] ml-auto ${v.severity === "critical" ? "border-red-700 text-red-400" : v.severity === "high" ? "border-orange-700 text-orange-400" : "border-amber-700 text-amber-400"}`}>
                            {v.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {entry.scanSnapshot.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-teal-500 flex items-center gap-1"><Scan className="w-3 h-3" /> Scan Results</h4>
                {entry.scanSnapshot.map((scan: any, i: number) => (
                  <div key={i} className="p-2 bg-card/30 rounded text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-mono">{scan.target}</span>
                      <span className="text-muted-foreground">{scan.scriptPath}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {entry.evidence.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-purple-500 flex items-center gap-1"><FileText className="w-3 h-3" /> Evidence</h4>
                {entry.evidence.map((ev, i) => (
                  <div key={i} className="p-2 bg-card/30 rounded text-[10px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[8px] border-purple-900/30 text-purple-400">{ev.type}</Badge>
                      <span className="text-muted-foreground">{ev.label}</span>
                    </div>
                    <p className="text-muted-foreground font-mono text-[9px] whitespace-pre-wrap line-clamp-3">{ev.content}</p>
                  </div>
                ))}
              </div>
            )}

            {entry.outcome && (
              <div className="p-2 bg-teal-950/10 rounded border border-teal-900/20">
                <p className="text-[10px] text-muted-foreground mb-1">Outcome</p>
                <p className="text-xs text-muted-foreground">{entry.outcome}</p>
              </div>
            )}

            <div className="space-y-2 pt-3 border-t border-card/50">
              <h4 className="text-xs font-mono text-amber-500 flex items-center gap-1"><Layers className="w-3 h-3" /> Embeddable Cards</h4>
              <div className="grid gap-2">
                {vulns.length > 0 && vulns.map((v: any, i: number) => (
                  <EmbedCard
                    key={`finding-${i}`}
                    type="Finding"
                    title={v.type || "Vulnerability"}
                    content={`Severity: ${v.severity || "unknown"}. ${v.description || v.type || "Security finding identified during analysis."}`}
                    id={entry.id}
                    color="amber"
                  />
                ))}
                {entry.scanSnapshot.map((scan: any, i: number) => (
                  <EmbedCard
                    key={`scan-${i}`}
                    type="Scan Result"
                    title={scan.target || "Scan Target"}
                    content={`Script: ${scan.scriptPath || "N/A"}. ${scan.completedAt ? `Completed: ${new Date(scan.completedAt).toLocaleString()}` : "In progress"}`}
                    id={entry.id}
                    color="teal"
                  />
                ))}
                {entry.agentSnapshot?.extractedIntel && (
                  <EmbedCard
                    type="Agent Intel"
                    title={`${entry.title} — Intelligence Summary`}
                    content={`${entry.agentSnapshot.messageCount || 0} messages analyzed. ${entry.agentSnapshot.extractedIntel.targets?.length || 0} targets identified. ${vulns.length} potential vulnerabilities found.`}
                    id={entry.id}
                    color="amber"
                  />
                )}
                {vulns.length === 0 && entry.scanSnapshot.length === 0 && !entry.agentSnapshot?.extractedIntel && (
                  <p className="text-[10px] text-muted-foreground">No embeddable content available for this entry.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateEntryForm({ sources, onClose, sessionToken }: {
  sources: PortfolioSources;
  onClose: () => void;
  sessionToken: string;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("investigation");
  const [difficulty, setDifficulty] = useState("");
  const [outcome, setOutcome] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [selectedDossier, setSelectedDossier] = useState("");
  const [selectedScans, setSelectedScans] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("private");
  const [selectedViz, setSelectedViz] = useState<VizType[]>([]);

  const hasSources = sources.investigations.length > 0 || sources.campaignRuns.length > 0 || sources.dossiers.length > 0 || sources.scans.length > 0;

  const autoPopulateFromInvestigation = (invId: string) => {
    setSelectedInvestigation(invId);
    const inv = sources.investigations.find((i: any) => i.investigationId === invId);
    if (!inv) return;
    if (!title) setTitle(inv.name || inv.investigationId);
    if (!summary) setSummary(`${inv.targetType} investigation targeting ${inv.targetValue}. Phase: ${inv.phase}. Status: ${inv.status}.`);
    if (!difficulty) {
      const findingsCount = inv.findings?.length || 0;
      setDifficulty(findingsCount > 10 ? "expert" : findingsCount > 5 ? "hard" : findingsCount > 2 ? "medium" : "beginner");
    }
    if (inv.toolsUsed?.length > 0) {
      const matchedTools = TOOL_TAGS.filter(t => inv.toolsUsed.some((u: string) => u.toLowerCase().includes(t.toLowerCase())));
      if (matchedTools.length > 0) setSelectedTools(prev => Array.from(new Set([...prev, ...matchedTools])));
    }
    if (inv.findings?.length > 0) {
      const findingSummary = inv.findings.map((f: any) => `[${f.severity?.toUpperCase()}] ${f.title}`).join("\n");
      if (!outcome) setOutcome(findingSummary);
    }
    const relatedScans = sources.scans.filter((s: any) => s.investigationId === invId);
    if (relatedScans.length > 0) {
      setSelectedScans(relatedScans.map((s: any) => s.id?.toString() || s.scanId));
    }
    setCategory("investigation");
  };

  const autoPopulateFromCampaign = (runId: string) => {
    setSelectedCampaign(runId);
    const cr = sources.campaignRuns.find((c: any) => c.runId === runId);
    if (!cr) return;
    if (!title) setTitle(`Campaign: ${cr.campaignId.replace(/-/g, " ").replace(/campaign /i, "")}`);
    if (!summary) setSummary(`Campaign run ${cr.status}. Visited ${cr.visitedNodes?.length || 0} nodes. Progress: ${cr.variables?.progress || 0}%.`);
    if (!difficulty) setDifficulty(cr.visitedNodes?.length > 6 ? "hard" : cr.visitedNodes?.length > 3 ? "medium" : "beginner");
    setCategory("campaign");
  };

  const autoPopulateFromDossier = (dossierId: string) => {
    setSelectedDossier(dossierId);
    const d = sources.dossiers.find((ds: any) => ds.id?.toString() === dossierId);
    if (!d) return;
    if (!title) setTitle(d.title);
    if (!summary) setSummary(d.summary || `Report: ${d.title}. Severity: ${d.severity}. Status: ${d.status}.`);
    if (!difficulty) {
      setDifficulty(d.severity === "critical" ? "expert" : d.severity === "high" ? "hard" : d.severity === "medium" ? "medium" : "beginner");
    }
    if (d.tools?.length > 0) {
      const matchedTools = TOOL_TAGS.filter(t => d.tools.some((u: string) => u.toLowerCase().includes(t.toLowerCase())));
      if (matchedTools.length > 0) setSelectedTools(prev => Array.from(new Set([...prev, ...matchedTools])));
    }
    if (d.findings?.length > 0) {
      const findingSummary = d.findings.map((f: any) => typeof f === "string" ? f : (f.title || f.description || JSON.stringify(f))).join("\n");
      if (!outcome) setOutcome(findingSummary);
    }
    if (d.iocs?.length > 0 && !outcome) {
      setOutcome(prev => prev ? prev + "\n\nIOCs: " + d.iocs.join(", ") : "IOCs: " + d.iocs.join(", "));
    }
    setCategory("report");
  };

  const toggleViz = (v: VizType) => {
    if (v === "none") {
      setSelectedViz([]);
      return;
    }
    setSelectedViz(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev.filter(x => x !== "none"), v]);
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-token": sessionToken },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create entry" }));
        throw new Error(err.error || "Failed to create entry");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Portfolio entry created", description: "Your work has been saved to your portfolio" });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message || "Failed to create entry", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a title for your portfolio entry", variant: "destructive" });
      return;
    }

    const inv = sources.investigations.find((i: any) => i.investigationId === selectedInvestigation);
    const campaign = sources.campaignRuns.find((c: any) => c.runId === selectedCampaign);
    const dossier = sources.dossiers.find((d: any) => d.id?.toString() === selectedDossier);

    const relatedScans = selectedScans.length > 0
      ? sources.scans.filter((s: any) => selectedScans.includes(s.id?.toString() || s.scanId))
      : selectedInvestigation
        ? sources.scans.filter((s: any) => s.investigationId === selectedInvestigation)
        : [];

    const reportSnapshot = dossier ? {
      findings: dossier.findings || [],
      reportData: {
        title: dossier.title,
        summary: dossier.summary || "",
        severity: dossier.severity,
        status: dossier.status,
        iocs: (dossier.iocs || []).join(", "),
        bountyAmount: dossier.bountyAmount || "",
        template: dossier.reportTemplate || "",
      },
      completionPercentage: dossier.status === "submitted" || dossier.status === "accepted" ? 100 : dossier.status === "draft" ? 50 : 75,
    } : inv?.findings?.length > 0 ? {
      findings: inv.findings,
      reportData: { name: inv.name, target: inv.targetValue, phase: inv.phase },
      completionPercentage: inv.status === "completed" ? 100 : inv.status === "active" ? 60 : 30,
    } : null;

    const agentSnapshot = inv?.compressedHistory ? {
      messageCount: inv.compressedHistory.split("\n").length,
      model: "nexus",
      extractedIntel: {
        targets: [inv.targetValue],
        technologies: inv.toolsUsed || [],
        potentialVulns: (inv.findings || []).filter((f: any) => f.severity === "high" || f.severity === "critical").map((f: any) => ({ type: f.title, severity: f.severity })),
        recommendations: (inv.hypotheses || []).filter((h: any) => h.status === "confirmed").map((h: any) => h.text),
      },
    } : null;

    const evidence: { type: string; label: string; content: string }[] = [];
    if (dossier?.iocs?.length > 0) {
      evidence.push({ type: "ioc", label: "Indicators of Compromise", content: dossier.iocs.join("\n") });
    }
    if (inv?.hypotheses?.length > 0) {
      evidence.push({ type: "hypothesis", label: "Investigation Hypotheses", content: inv.hypotheses.map((h: any) => `[${h.status}] ${h.text}`).join("\n") });
    }
    if (dossier?.reportTemplate) {
      evidence.push({ type: "report", label: "Report Template", content: dossier.reportTemplate.slice(0, 500) });
    }
    if (selectedViz.length > 0) {
      evidence.push({ type: "viz_config", label: "Visualization Settings", content: selectedViz.join(",") });
    }

    createMutation.mutate({
      title: title.trim(),
      summary: summary.trim() || null,
      category,
      visibility,
      difficulty: difficulty || null,
      outcome: outcome.trim() || null,
      investigationId: selectedInvestigation || null,
      campaignId: campaign?.campaignId || null,
      campaignRunId: selectedCampaign || null,
      skills: selectedSkills,
      tools: selectedTools,
      reportSnapshot,
      agentSnapshot,
      scanSnapshot: relatedScans.map((s: any) => ({
        scanId: s.scanId || s.id?.toString(),
        target: s.target,
        scriptPath: s.scriptPath,
        results: s.results,
        completedAt: s.completedAt,
      })),
      evidence,
    });
  };

  return (
    <Card className="bg-[hsl(var(--card))] border-amber-900/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Portfolio Entry
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription className="text-muted-foreground text-xs">
          Select a source below to auto-fill, or create a blank entry
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSources && (
          <div className="space-y-3 p-3 bg-amber-950/10 rounded-lg border border-amber-900/20">
            <h4 className="text-[10px] text-amber-500 uppercase font-mono flex items-center gap-1">
              <Layers className="w-3 h-3" /> Load From Your Work
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sources.investigations.length > 0 && (
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                    <Crosshair className="w-2.5 h-2.5" /> Investigation ({sources.investigations.length})
                  </label>
                  <select
                    value={selectedInvestigation}
                    onChange={(e) => autoPopulateFromInvestigation(e.target.value)}
                    className="w-full bg-card/30 border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
                    data-testid="portfolio-investigation-select"
                  >
                    <option value="">Select investigation...</option>
                    {sources.investigations.map((inv: any) => (
                      <option key={inv.investigationId} value={inv.investigationId}>
                        {inv.name || inv.investigationId} — {inv.status} ({inv.findings?.length || 0} findings)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sources.campaignRuns.length > 0 && (
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                    <Target className="w-2.5 h-2.5" /> Campaign ({sources.campaignRuns.length})
                  </label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => autoPopulateFromCampaign(e.target.value)}
                    className="w-full bg-card/30 border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
                    data-testid="portfolio-campaign-select"
                  >
                    <option value="">Select campaign...</option>
                    {sources.campaignRuns.map((cr: any) => (
                      <option key={cr.runId} value={cr.runId}>
                        {cr.campaignId.replace(/-/g, " ")} — {cr.status} ({cr.variables?.progress || 0}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sources.dossiers.length > 0 && (
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                    <FileText className="w-2.5 h-2.5" /> Report / Dossier ({sources.dossiers.length})
                  </label>
                  <select
                    value={selectedDossier}
                    onChange={(e) => autoPopulateFromDossier(e.target.value)}
                    className="w-full bg-card/30 border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
                    data-testid="portfolio-dossier-select"
                  >
                    <option value="">Select report...</option>
                    {sources.dossiers.map((d: any) => (
                      <option key={d.id} value={d.id.toString()}>
                        {d.title} — {d.status} ({d.severity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sources.scans.length > 0 && (
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                    <Scan className="w-2.5 h-2.5" /> Scans ({sources.scans.length})
                  </label>
                  <div className="max-h-24 overflow-y-auto space-y-1 bg-card/30 border border-border rounded-md p-2">
                    {sources.scans.map((s: any) => {
                      const scanKey = s.id?.toString() || s.scanId;
                      return (
                        <label key={scanKey} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          <input
                            type="checkbox"
                            checked={selectedScans.includes(scanKey)}
                            onChange={() => setSelectedScans(prev => prev.includes(scanKey) ? prev.filter(x => x !== scanKey) : [...prev, scanKey])}
                            className="rounded border-border"
                          />
                          <span className="truncate">{s.target || "Unknown"} — {s.scriptPath || "scan"}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., APT-29 Infrastructure Analysis"
              className="bg-card/30 border-border text-foreground h-8 text-sm"
              data-testid="portfolio-title-input"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Summary</label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief description of this investigation or project..."
              className="bg-card/30 border-border text-foreground text-sm min-h-[60px]"
              data-testid="portfolio-summary-input"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-card/30 border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
              data-testid="portfolio-category-select"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-card/30 border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
              data-testid="portfolio-difficulty-select"
            >
              <option value="">Select...</option>
              <option value="beginner">Beginner</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block flex items-center gap-1">
            <Palette className="w-2.5 h-2.5" /> Visualization Style
          </label>
          <div className="flex flex-wrap gap-1.5">
            {VIZ_OPTIONS.map((v) => (
              <button
                key={v.value}
                onClick={() => toggleViz(v.value)}
                className={`px-2.5 py-1 rounded text-[10px] border transition-colors ${
                  (v.value === "none" && selectedViz.length === 0) || selectedViz.includes(v.value)
                    ? "bg-amber-900/30 border-amber-700/50 text-amber-400"
                    : "bg-card/20 border-border text-muted-foreground hover:border-border"
                }`}
                title={v.desc}
                data-testid={`viz-option-${v.value}`}
              >
                {v.value === "radar" && <BarChart3 className="w-2.5 h-2.5 inline mr-1" />}
                {v.value === "severity" && <AlertTriangle className="w-2.5 h-2.5 inline mr-1" />}
                {v.value === "timeline" && <TrendingUp className="w-2.5 h-2.5 inline mr-1" />}
                {v.value === "donut" && <PieChart className="w-2.5 h-2.5 inline mr-1" />}
                {v.label}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-1">Select which visualizations to show on this entry, or none for text-only</p>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Skills Demonstrated</label>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_TAGS.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                  selectedSkills.includes(skill)
                    ? "bg-amber-900/30 border-amber-700/50 text-amber-400"
                    : "bg-card/20 border-border text-muted-foreground hover:border-border"
                }`}
                data-testid={`skill-tag-${skill.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Tools Used</label>
          <div className="flex flex-wrap gap-1.5">
            {TOOL_TAGS.map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool])}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                  selectedTools.includes(tool)
                    ? "bg-teal-900/30 border-teal-700/50 text-teal-400"
                    : "bg-card/20 border-border text-muted-foreground hover:border-border"
                }`}
                data-testid={`tool-tag-${tool.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Outcome / Findings</label>
          <Textarea
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Key findings, impact, or results..."
            className="bg-card/30 border-border text-foreground text-sm min-h-[50px]"
            data-testid="portfolio-outcome-input"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibility(visibility === "public" ? "private" : "public")}
            className={`text-xs ${visibility === "public" ? "text-teal-400" : "text-muted-foreground"}`}
            data-testid="toggle-new-visibility"
          >
            {visibility === "public" ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
            {visibility === "public" ? "Public" : "Private"}
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground text-xs">Cancel</Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim() || createMutation.isPending}
            className="bg-amber-900/30 hover:bg-amber-900/50 text-amber-300 border border-amber-700/50 text-xs"
            data-testid="create-portfolio-entry-btn"
          >
            {createMutation.isPending ? "Saving..." : "Save to Portfolio"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PortfolioTab() {
  const { gameState } = useGame();
  const sessionToken = gameState.sessionToken || "";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: portfolioData, isLoading } = useQuery<{ success: boolean; entries: PortfolioEntry[] }>({
    queryKey: ["/api/portfolio"],
    queryFn: () => fetch("/api/portfolio", { headers: { "x-session-token": sessionToken } }).then(r => r.json()),
    enabled: !!sessionToken,
  });

  const { data: sourcesData } = useQuery<{ success: boolean; sources: PortfolioSources }>({
    queryKey: ["/api/portfolio/sources"],
    queryFn: () => fetch("/api/portfolio/sources", { headers: { "x-session-token": sessionToken } }).then(r => r.json()),
    enabled: !!sessionToken && showCreate,
  });

  const entries = portfolioData?.entries || [];
  const sources = sourcesData?.sources || { investigations: [], campaignRuns: [], scans: [], dossiers: [] };

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-session-token": sessionToken },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Entry updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
        headers: { "x-session-token": sessionToken },
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Entry removed from portfolio" });
    },
  });

  const handleCopyLink = (shareId: string) => {
    const url = `${window.location.origin}/portfolio/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    toast({ title: "Link copied!", description: "Share this link with anyone" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (id: number, updates: any) => {
    updateMutation.mutate({ id, updates });
  };

  const portfolioStats = useMemo(() => {
    const allSkills: Record<string, number> = {};
    const allTools: Record<string, number> = {};
    let totalScans = 0;
    let totalFindings = 0;

    entries.forEach(e => {
      e.skills.forEach(s => { allSkills[s] = (allSkills[s] || 0) + 1; });
      e.tools.forEach(t => { allTools[t] = (allTools[t] || 0) + 1; });
      totalScans += e.scanSnapshot.length;
      totalFindings += e.agentSnapshot?.extractedIntel?.potentialVulns?.length || 0;
    });

    return {
      totalEntries: entries.length,
      publicEntries: entries.filter(e => e.visibility === "public").length,
      featuredEntries: entries.filter(e => e.featured).length,
      totalScans,
      totalFindings,
      topSkills: Object.entries(allSkills).sort((a, b) => b[1] - a[1]).slice(0, 6),
      topTools: Object.entries(allTools).sort((a, b) => b[1] - a[1]).slice(0, 6),
      categories: CATEGORIES.map(c => ({
        ...c,
        count: entries.filter(e => e.category === c.value).length,
      })),
    };
  }, [entries]);

  const skillRadarData = useMemo(() => {
    const mapped: Record<string, number> = { OSINT: 0, Network: 0, Malware: 0, "Social Eng": 0, "Web Sec": 0, "Threat Intel": 0 };
    entries.forEach(e => {
      e.skills.forEach(s => {
        if (s.includes("OSINT")) mapped["OSINT"] += 15;
        if (s.includes("Network")) mapped["Network"] += 15;
        if (s.includes("Malware")) mapped["Malware"] += 15;
        if (s.includes("Social")) mapped["Social Eng"] += 15;
        if (s.includes("Web")) mapped["Web Sec"] += 15;
        if (s.includes("Threat")) mapped["Threat Intel"] += 15;
      });
    });
    return Object.entries(mapped).map(([name, value]) => ({ name, value: Math.min(100, value) }));
  }, [entries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-amber-500 font-mono text-sm animate-pulse">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="text-center p-3 bg-amber-950/10 rounded-lg border border-amber-900/20">
            <p className="text-2xl font-bold text-amber-400 font-mono">{portfolioStats.totalEntries}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Entries</p>
          </div>
          <div className="text-center p-3 bg-teal-950/10 rounded-lg border border-teal-900/20">
            <p className="text-2xl font-bold text-teal-400 font-mono">{portfolioStats.publicEntries}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Public</p>
          </div>
          <div className="text-center p-3 bg-purple-950/10 rounded-lg border border-purple-900/20">
            <p className="text-2xl font-bold text-purple-400 font-mono">{portfolioStats.totalScans}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Scans</p>
          </div>
          <div className="text-center p-3 bg-red-950/10 rounded-lg border border-red-900/20">
            <p className="text-2xl font-bold text-red-400 font-mono">{portfolioStats.totalFindings}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Findings</p>
          </div>
          <div className="text-center p-3 bg-orange-950/10 rounded-lg border border-orange-900/20">
            <p className="text-2xl font-bold text-orange-400 font-mono">{portfolioStats.featuredEntries}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Featured</p>
          </div>
          <div className="text-center p-3 bg-card/30 rounded-lg border border-border/40">
            <p className="text-2xl font-bold text-muted-foreground font-mono">{portfolioStats.topSkills.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Skills</p>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="bg-[hsl(var(--card))] border-amber-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-500 text-xs font-mono flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" /> Skill Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChart skills={skillRadarData} />
            </CardContent>
          </Card>

          <Card className="bg-[hsl(var(--card))] border-teal-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-teal-500 text-xs font-mono flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {portfolioStats.categories.filter(c => c.count > 0).map((cat) => {
                const Icon = cat.icon;
                const pct = portfolioStats.totalEntries > 0 ? (cat.count / portfolioStats.totalEntries) * 100 : 0;
                return (
                  <div key={cat.value} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Icon className="w-3 h-3 text-teal-500" /> {cat.label}
                      </span>
                      <span className="font-mono text-teal-400">{cat.count}</span>
                    </div>
                    <div className="h-1.5 bg-card rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {portfolioStats.topTools.length > 0 && (
                <div className="pt-2 border-t border-card/50">
                  <p className="text-[10px] text-muted-foreground uppercase mb-2">Top Tools</p>
                  <div className="flex flex-wrap gap-1">
                    {portfolioStats.topTools.map(([tool, count]) => (
                      <Badge key={tool} className="text-[9px] bg-teal-950/20 text-teal-400 border-teal-900/30">
                        {tool} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-orbitron text-amber-500">
          Portfolio Entries
        </h3>
        <Button
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
          className="bg-amber-900/30 hover:bg-amber-900/50 text-amber-300 border border-amber-700/50 text-xs"
          data-testid="add-portfolio-entry-btn"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Entry
        </Button>
      </div>

      {showCreate && (
        <CreateEntryForm
          sources={sources}
          onClose={() => setShowCreate(false)}
          sessionToken={sessionToken}
        />
      )}

      {entries.length === 0 ? (
        <Card className="bg-[hsl(var(--card))] border-border">
          <CardContent className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Your portfolio is empty</p>
            <p className="text-xs text-muted-foreground mb-4">
              Add investigations, campaigns, and scan results to build a professional cybersecurity portfolio
            </p>
            <Button
              size="sm"
              onClick={() => setShowCreate(true)}
              className="bg-amber-900/30 hover:bg-amber-900/50 text-amber-300 border border-amber-700/50 text-xs"
              data-testid="empty-add-entry-btn"
            >
              <Plus className="w-3 h-3 mr-1" /> Create First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <PortfolioCard
              key={entry.id}
              entry={entry}
              onToggleVisibility={(id, vis) => updateMutation.mutate({ id, updates: { visibility: vis } })}
              onToggleFeatured={(id, featured) => updateMutation.mutate({ id, updates: { featured } })}
              onDelete={(id) => deleteMutation.mutate(id)}
              onCopyLink={handleCopyLink}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
