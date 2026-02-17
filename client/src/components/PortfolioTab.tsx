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
  X
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
}

const SKILL_TAGS = ["OSINT", "Network Security", "Malware Analysis", "Social Engineering", "Crypto Forensics", "Web Security", "Threat Intel", "Incident Response"];
const TOOL_TAGS = ["Atropos Scanner", "NEXUS Agent", "Shodan", "Censys", "VirusTotal", "Nmap", "Wireshark", "Burp Suite"];
const CATEGORIES = [
  { value: "investigation", label: "Investigation", icon: Crosshair },
  { value: "campaign", label: "Campaign", icon: Target },
  { value: "scan", label: "Scan Analysis", icon: Scan },
  { value: "report", label: "Report", icon: FileText },
  { value: "research", label: "Research", icon: Layers },
];

function RadarChart({ skills }: { skills: { name: string; value: number }[] }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 80;
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
        const labelP = getPoint(i, maxRadius + 20);
        return (
          <text
            key={i}
            x={labelP.x}
            y={labelP.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-stone-400 text-[10px] font-mono"
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
        <span className="text-stone-500">{label}</span>
        <span className={`text-${color}-400 font-mono`}>{value}</span>
      </div>
      <div className="h-2 bg-stone-900 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-${color}-600 to-${color}-400 rounded-full transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PortfolioCard({ entry, onToggleVisibility, onToggleFeatured, onDelete, onCopyLink }: {
  entry: PortfolioEntry;
  onToggleVisibility: (id: number, vis: string) => void;
  onToggleFeatured: (id: number, featured: boolean) => void;
  onDelete: (id: number) => void;
  onCopyLink: (shareId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const CategoryIcon = CATEGORIES.find(c => c.value === entry.category)?.icon || Briefcase;

  const difficultyColor = entry.difficulty === "expert" ? "red" : entry.difficulty === "hard" ? "orange" : entry.difficulty === "medium" ? "amber" : "teal";

  return (
    <Card className={`bg-[#0a0500] border-amber-900/30 transition-all hover:border-amber-700/50 ${entry.featured ? "ring-1 ring-amber-600/30" : ""}`}>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-amber-900/20 border border-amber-900/30 flex items-center justify-center flex-shrink-0">
                <CategoryIcon className="w-5 h-5 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-stone-200 truncate">{entry.title}</h3>
                  {entry.featured && <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[9px] border-stone-700 text-stone-500">
                    {entry.category}
                  </Badge>
                  {entry.difficulty && (
                    <Badge variant="outline" className={`text-[9px] border-${difficultyColor}-900 text-${difficultyColor}-400`}>
                      {entry.difficulty}
                    </Badge>
                  )}
                  <Badge variant="outline" className={`text-[9px] ${entry.visibility === "public" ? "border-teal-700 text-teal-400" : "border-stone-700 text-stone-500"}`}>
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
                className="h-7 w-7 p-0 text-stone-600 hover:text-amber-400"
                onClick={() => onToggleFeatured(entry.id, !entry.featured)}
                data-testid={`toggle-featured-${entry.id}`}
              >
                {entry.featured ? <Star className="w-3.5 h-3.5" /> : <StarOff className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-stone-600 hover:text-teal-400"
                onClick={() => onToggleVisibility(entry.id, entry.visibility === "public" ? "private" : "public")}
                data-testid={`toggle-visibility-${entry.id}`}
              >
                {entry.visibility === "public" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-stone-600 hover:text-amber-400"
                onClick={() => onCopyLink(entry.shareId)}
                data-testid={`copy-link-${entry.id}`}
              >
                <Share2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-stone-600 hover:text-red-400"
                onClick={() => onDelete(entry.id)}
                data-testid={`delete-entry-${entry.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {entry.summary && (
            <p className="text-xs text-stone-500 mt-2 line-clamp-2">{entry.summary}</p>
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

          <div className="flex items-center gap-4 mt-3 text-[10px] text-stone-600">
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

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 px-4 text-[10px] text-stone-600 hover:text-stone-400 border-t border-stone-900/50 flex items-center justify-center gap-1 transition-colors"
          data-testid={`expand-entry-${entry.id}`}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Collapse" : "Expand Details"}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-stone-900/50">
            {entry.agentSnapshot?.extractedIntel && (
              <div className="space-y-2 pt-3">
                <h4 className="text-xs font-mono text-amber-500 flex items-center gap-1"><Bot className="w-3 h-3" /> Agent Intelligence</h4>
                <div className="grid grid-cols-2 gap-2">
                  {entry.agentSnapshot.extractedIntel.targets?.length > 0 && (
                    <div className="p-2 bg-stone-900/30 rounded">
                      <p className="text-[10px] text-stone-600 mb-1">Targets</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.agentSnapshot.extractedIntel.targets.map((t: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-[9px] border-amber-900/30 text-amber-400">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.agentSnapshot.extractedIntel.technologies?.length > 0 && (
                    <div className="p-2 bg-stone-900/30 rounded">
                      <p className="text-[10px] text-stone-600 mb-1">Technologies</p>
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
                    <p className="text-[10px] text-stone-600 mb-1">Potential Vulnerabilities</p>
                    <div className="space-y-1">
                      {entry.agentSnapshot.extractedIntel.potentialVulns.map((v: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[10px]">
                          <AlertTriangle className={`w-3 h-3 ${v.severity === "critical" ? "text-red-400" : v.severity === "high" ? "text-orange-400" : "text-amber-400"}`} />
                          <span className="text-stone-400">{v.type}</span>
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
                  <div key={i} className="p-2 bg-stone-900/30 rounded text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 font-mono">{scan.target}</span>
                      <span className="text-stone-600">{scan.scriptPath}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {entry.evidence.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-purple-500 flex items-center gap-1"><FileText className="w-3 h-3" /> Evidence</h4>
                {entry.evidence.map((ev, i) => (
                  <div key={i} className="p-2 bg-stone-900/30 rounded text-[10px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[8px] border-purple-900/30 text-purple-400">{ev.type}</Badge>
                      <span className="text-stone-400">{ev.label}</span>
                    </div>
                    <p className="text-stone-600 font-mono text-[9px] whitespace-pre-wrap line-clamp-3">{ev.content}</p>
                  </div>
                ))}
              </div>
            )}

            {entry.outcome && (
              <div className="p-2 bg-teal-950/10 rounded border border-teal-900/20">
                <p className="text-[10px] text-stone-600 mb-1">Outcome</p>
                <p className="text-xs text-stone-400">{entry.outcome}</p>
              </div>
            )}
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
  const [visibility, setVisibility] = useState("private");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-token": sessionToken },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Portfolio entry created", description: "Your work has been saved to your portfolio" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create entry", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) return;

    const inv = sources.investigations.find((i: any) => i.investigationId === selectedInvestigation);
    const campaign = sources.campaignRuns.find((c: any) => c.runId === selectedCampaign);
    const relatedScans = selectedInvestigation
      ? sources.scans.filter((s: any) => s.investigationId === selectedInvestigation)
      : [];

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
      scanSnapshot: relatedScans.map((s: any) => ({
        scanId: s.scanId,
        target: s.target,
        scriptPath: s.scriptPath,
        results: s.results,
        completedAt: s.completedAt,
      })),
      evidence: [],
    });
  };

  return (
    <Card className="bg-[#0a0500] border-amber-900/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Portfolio Entry
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-600" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[10px] text-stone-600 uppercase mb-1 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., APT-29 Infrastructure Analysis"
              className="bg-stone-900/30 border-stone-800 text-stone-300 h-8 text-sm"
              data-testid="portfolio-title-input"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-stone-600 uppercase mb-1 block">Summary</label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief description of this investigation or project..."
              className="bg-stone-900/30 border-stone-800 text-stone-300 text-sm min-h-[60px]"
              data-testid="portfolio-summary-input"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-600 uppercase mb-1 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-stone-900/30 border border-stone-800 rounded-md px-3 py-1.5 text-sm text-stone-300"
              data-testid="portfolio-category-select"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-stone-600 uppercase mb-1 block">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-stone-900/30 border border-stone-800 rounded-md px-3 py-1.5 text-sm text-stone-300"
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

        {sources.investigations.length > 0 && (
          <div>
            <label className="text-[10px] text-stone-600 uppercase mb-1 block">Link Investigation</label>
            <select
              value={selectedInvestigation}
              onChange={(e) => setSelectedInvestigation(e.target.value)}
              className="w-full bg-stone-900/30 border border-stone-800 rounded-md px-3 py-1.5 text-sm text-stone-300"
              data-testid="portfolio-investigation-select"
            >
              <option value="">None</option>
              {sources.investigations.map((inv: any) => (
                <option key={inv.investigationId} value={inv.investigationId}>
                  {inv.title || inv.investigationId} — {inv.status}
                </option>
              ))}
            </select>
          </div>
        )}

        {sources.campaignRuns.length > 0 && (
          <div>
            <label className="text-[10px] text-stone-600 uppercase mb-1 block">Link Campaign</label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full bg-stone-900/30 border border-stone-800 rounded-md px-3 py-1.5 text-sm text-stone-300"
              data-testid="portfolio-campaign-select"
            >
              <option value="">None</option>
              {sources.campaignRuns.map((cr: any) => (
                <option key={cr.runId} value={cr.runId}>
                  {cr.campaignId} — {cr.status} ({cr.score || 0} pts)
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-[10px] text-stone-600 uppercase mb-1 block">Skills Demonstrated</label>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_TAGS.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                  selectedSkills.includes(skill)
                    ? "bg-amber-900/30 border-amber-700/50 text-amber-400"
                    : "bg-stone-900/20 border-stone-800 text-stone-600 hover:border-stone-700"
                }`}
                data-testid={`skill-tag-${skill.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-stone-600 uppercase mb-1 block">Tools Used</label>
          <div className="flex flex-wrap gap-1.5">
            {TOOL_TAGS.map((tool) => (
              <button
                key={tool}
                onClick={() => setSelectedTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool])}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                  selectedTools.includes(tool)
                    ? "bg-teal-900/30 border-teal-700/50 text-teal-400"
                    : "bg-stone-900/20 border-stone-800 text-stone-600 hover:border-stone-700"
                }`}
                data-testid={`tool-tag-${tool.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-stone-600 uppercase mb-1 block">Outcome / Findings</label>
          <Textarea
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Key findings, impact, or results..."
            className="bg-stone-900/30 border-stone-800 text-stone-300 text-sm min-h-[50px]"
            data-testid="portfolio-outcome-input"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibility(visibility === "public" ? "private" : "public")}
            className={`text-xs ${visibility === "public" ? "text-teal-400" : "text-stone-500"}`}
            data-testid="toggle-new-visibility"
          >
            {visibility === "public" ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
            {visibility === "public" ? "Public" : "Private"}
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onClose} className="text-stone-500 text-xs">Cancel</Button>
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
  const sources = sourcesData?.sources || { investigations: [], campaignRuns: [], scans: [] };

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] }),
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
            <p className="text-[10px] text-stone-600 uppercase">Entries</p>
          </div>
          <div className="text-center p-3 bg-teal-950/10 rounded-lg border border-teal-900/20">
            <p className="text-2xl font-bold text-teal-400 font-mono">{portfolioStats.publicEntries}</p>
            <p className="text-[10px] text-stone-600 uppercase">Public</p>
          </div>
          <div className="text-center p-3 bg-purple-950/10 rounded-lg border border-purple-900/20">
            <p className="text-2xl font-bold text-purple-400 font-mono">{portfolioStats.totalScans}</p>
            <p className="text-[10px] text-stone-600 uppercase">Scans</p>
          </div>
          <div className="text-center p-3 bg-red-950/10 rounded-lg border border-red-900/20">
            <p className="text-2xl font-bold text-red-400 font-mono">{portfolioStats.totalFindings}</p>
            <p className="text-[10px] text-stone-600 uppercase">Findings</p>
          </div>
          <div className="text-center p-3 bg-orange-950/10 rounded-lg border border-orange-900/20">
            <p className="text-2xl font-bold text-orange-400 font-mono">{portfolioStats.featuredEntries}</p>
            <p className="text-[10px] text-stone-600 uppercase">Featured</p>
          </div>
          <div className="text-center p-3 bg-stone-900/30 rounded-lg border border-stone-800/40">
            <p className="text-2xl font-bold text-stone-400 font-mono">{portfolioStats.topSkills.length}</p>
            <p className="text-[10px] text-stone-600 uppercase">Skills</p>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="bg-[#0a0500] border-amber-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-500 text-xs font-mono flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" /> Skill Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChart skills={skillRadarData} />
            </CardContent>
          </Card>

          <Card className="bg-[#0a0500] border-teal-900/20">
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
                      <span className="flex items-center gap-1.5 text-stone-400">
                        <Icon className="w-3 h-3 text-teal-500" /> {cat.label}
                      </span>
                      <span className="font-mono text-teal-400">{cat.count}</span>
                    </div>
                    <div className="h-1.5 bg-stone-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {portfolioStats.topTools.length > 0 && (
                <div className="pt-2 border-t border-stone-900/50">
                  <p className="text-[10px] text-stone-600 uppercase mb-2">Top Tools</p>
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
        <Card className="bg-[#0a0500] border-stone-800">
          <CardContent className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-stone-700 mx-auto mb-4" />
            <p className="text-stone-500 mb-2">Your portfolio is empty</p>
            <p className="text-xs text-stone-700 mb-4">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
