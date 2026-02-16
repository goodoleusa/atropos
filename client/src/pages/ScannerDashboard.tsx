import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Terminal, Radar, Shield, Globe, Search, Play, Loader2, Plus, Trash2, Edit,
  FileCode, Key, RefreshCw, ExternalLink, AlertTriangle, CheckCircle2,
  Bug, Crosshair, BookOpen, Copy, Download, Tag, Zap, Filter, X, ChevronDown, ChevronRight,
  Target, Code2, Maximize2, Minimize2
} from 'lucide-react';
import { useReportContext } from '@/hooks/useReportContext';

interface AtroposScript {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface LuaScript {
  filename: string;
  name: string;
  description: string;
  category: string;
  size: number;
  modified: string;
  content: string;
}

interface Finding {
  type: string;
  value: string;
  severity?: string;
  source?: string;
  metadata?: Record<string, any>;
}

interface ScanResult {
  id: string;
  scanType: string;
  target: string;
  timestamp: string;
  status: string;
  findings: Finding[];
  summary: {
    subdomains: number;
    ipAddresses: number;
    urls: number;
    emails: number;
    openPorts: number;
    technologies: number;
    vulnerabilities: number;
    secrets: number;
    riskScore: number;
    riskLevel: string;
  };
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  info: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const CATEGORY_LIST = ["osint", "vulnerability", "secret_detection", "threat_intel", "monitoring", "general"] as const;

const SCAN_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  osint: <Globe className="w-3.5 h-3.5 text-blue-400" />,
  vuln: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
  intel: <Shield className="w-3.5 h-3.5 text-purple-400" />,
  recon: <Target className="w-3.5 h-3.5 text-teal-400" />,
  api: <Terminal className="w-3.5 h-3.5 text-amber-400" />,
};

function mergeScanResults(existing: ScanResult | null, incoming: ScanResult): ScanResult {
  if (!existing) return incoming;
  const existingValues = new Set(existing.findings.map(f => `${f.type}:${f.value}`));
  const newFindings = incoming.findings.filter(f => !existingValues.has(`${f.type}:${f.value}`));
  const mergedFindings = [...existing.findings, ...newFindings];
  return {
    ...incoming,
    findings: mergedFindings,
    summary: {
      subdomains: existing.summary.subdomains + incoming.summary.subdomains,
      ipAddresses: existing.summary.ipAddresses + incoming.summary.ipAddresses,
      urls: existing.summary.urls + incoming.summary.urls,
      emails: existing.summary.emails + incoming.summary.emails,
      openPorts: existing.summary.openPorts + incoming.summary.openPorts,
      technologies: Math.max(existing.summary.technologies, incoming.summary.technologies),
      vulnerabilities: existing.summary.vulnerabilities + incoming.summary.vulnerabilities,
      secrets: existing.summary.secrets + incoming.summary.secrets,
      riskScore: Math.max(existing.summary.riskScore, incoming.summary.riskScore),
      riskLevel: incoming.summary.riskScore >= existing.summary.riskScore ? incoming.summary.riskLevel : existing.summary.riskLevel,
    },
  };
}

function ScanTab() {
  const { addToolOutput } = useReportContext();
  const [target, setTarget] = useState("");
  const [selectedScript, setSelectedScript] = useState("bbot_scanner");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanCount, setScanCount] = useState(0);

  const { data: scripts = [] } = useQuery<AtroposScript[]>({
    queryKey: ['/api/atropos/scripts'],
    queryFn: () => fetch('/api/atropos/scripts').then(r => r.json()),
  });

  const runScan = async () => {
    if (!target.trim()) {
      toast({ title: "Target required", description: "Enter a domain, IP, URL, or hash to scan", variant: "destructive" });
      return;
    }
    setIsScanning(true);
    try {
      const res = await fetch("/api/atropos/scan/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim(), scriptId: selectedScript })
      });
      if (!res.ok) throw new Error("Scan failed");
      const result = await res.json();
      setScanResult(prev => mergeScanResults(prev, result));
      setScanCount(c => c + 1);
      addToolOutput({
        type: 'scan',
        source: 'atropos',
        content: `Scan completed on ${result.target}: ${result.summary.vulnerabilities} vulnerabilities, risk ${result.summary.riskScore}/100`,
        metadata: { scanId: result.id, target: result.target }
      });
      const scriptName = scripts.find(s => s.id === selectedScript)?.name || selectedScript;
      toast({ title: "Scan Complete", description: `${scriptName}: ${result.findings.length} findings added (Risk: ${result.summary.riskLevel.toUpperCase()})` });
    } catch {
      toast({ title: "Scan Error", description: "Failed to run scan", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const analyzeWithNexus = () => {
    if (!scanResult) return;
    const scanData = encodeURIComponent(JSON.stringify(scanResult));
    window.location.href = `/agents?scanData=${scanData}`;
    toast({ title: "Opening NEXUS", description: "Loading scan results into agent workspace" });
  };

  const clearResults = () => {
    setScanResult(null);
    setScanCount(0);
    toast({ title: "Results Cleared", description: "Ready for new scans" });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-400 flex items-center gap-2">
            <Radar className="w-5 h-5" /> Run Scan
          </CardTitle>
          <CardDescription className="text-stone-400">Enter a target and select a scan script. Results accumulate across multiple scans.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scan-target" className="text-stone-300">Target</Label>
              <Input
                id="scan-target"
                placeholder="example.com / 192.168.1.1 / URL / hash"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-stone-900/60 border-stone-800 text-stone-200 placeholder:text-stone-600"
                data-testid="input-scan-target"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scan-script" className="text-stone-300">Script</Label>
              <Select value={selectedScript} onValueChange={setSelectedScript}>
                <SelectTrigger className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="select-scan-script">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {scripts.map((s) => (
                    <SelectItem key={s.id} value={s.id} data-testid={`script-option-${s.id}`}>
                      <div className="flex items-center gap-2 py-0.5">
                        {SCAN_CATEGORY_ICONS[s.category] || <Terminal className="w-3.5 h-3.5 text-stone-400" />}
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{s.name}</span>
                          <span className="text-xs text-stone-500">{s.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={runScan}
            disabled={isScanning || !target.trim()}
            className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold"
            data-testid="button-run-scan"
          >
            {isScanning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</> : <><Play className="w-4 h-4 mr-2" /> Run Scan</>}
          </Button>
        </CardContent>
      </Card>

      {scanResult && (
        <Card className="bg-stone-950/80 border-stone-800" data-testid="card-scan-result">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400" /> Scan Results
                {scanCount > 1 && <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-400">{scanCount} scans merged</Badge>}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={SEVERITY_COLORS[scanResult.summary.riskLevel] || SEVERITY_COLORS.info}>
                  Risk: {scanResult.summary.riskLevel.toUpperCase()} ({scanResult.summary.riskScore}/100)
                </Badge>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-stone-500 hover:text-red-400" onClick={clearResults} title="Clear results">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-stone-400">
              {scanResult.target} · {scanResult.scanType} · {new Date(scanResult.timestamp).toLocaleString()}
              {scanCount > 1 && ` · ${scanResult.findings.length} total findings`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
              {[
                { label: "Subdomains", value: scanResult.summary.subdomains, color: "text-amber-300" },
                { label: "Open Ports", value: scanResult.summary.openPorts, color: "text-teal-300" },
                { label: "Technologies", value: scanResult.summary.technologies, color: "text-blue-300" },
                { label: "Vulnerabilities", value: scanResult.summary.vulnerabilities, color: "text-red-300" },
              ].map((stat) => (
                <div key={stat.label} className="bg-stone-900/60 rounded-lg p-2">
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-stone-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <ScrollArea className="h-48 rounded-lg border border-stone-800 bg-stone-900/40 p-3">
              <div className="space-y-2">
                {scanResult.findings.slice(0, 50).map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm" data-testid={`finding-${idx}`}>
                    <Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[f.severity || "info"]}`}>
                      {f.type}
                    </Badge>
                    <span className="text-stone-300 truncate flex-1">{f.value}</span>
                    {f.source && <span className="text-stone-600 text-xs">{f.source}</span>}
                  </div>
                ))}
                {scanResult.findings.length > 50 && (
                  <div className="text-xs text-stone-500 text-center pt-2">+{scanResult.findings.length - 50} more findings…</div>
                )}
              </div>
            </ScrollArea>

            <Button
              onClick={analyzeWithNexus}
              className="w-full bg-gradient-to-r from-amber-700 to-teal-700 hover:from-amber-600 hover:to-teal-600 text-black font-bold"
              data-testid="button-analyze-nexus"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Load into NEXUS Agent
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface LuaTemplate {
  id: string;
  name: string;
  category: string;
  focus: string;
  difficulty: string;
  description: string;
  tags: string[];
  content: string;
}

const FOCUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  bug_bounty: { label: "Bug Bounty", icon: <Bug className="w-3.5 h-3.5" />, color: "text-red-400 border-red-500/30 bg-red-500/10" },
  threat_hunting: { label: "Threat Hunting", icon: <Crosshair className="w-3.5 h-3.5" />, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  general: { label: "General", icon: <Code2 className="w-3.5 h-3.5" />, color: "text-stone-400 border-stone-500/30 bg-stone-500/10" },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-teal-400 bg-teal-500/10",
  intermediate: "text-amber-400 bg-amber-500/10",
  advanced: "text-red-400 bg-red-500/10",
};

const CATEGORY_ICONS_MAP: Record<string, React.ReactNode> = {
  recon: <Target className="w-4 h-4 text-blue-400" />,
  vulnerability: <AlertTriangle className="w-4 h-4 text-red-400" />,
  secret_detection: <Key className="w-4 h-4 text-amber-400" />,
  threat_intel: <Shield className="w-4 h-4 text-purple-400" />,
  monitoring: <Radar className="w-4 h-4 text-teal-400" />,
  osint: <Globe className="w-4 h-4 text-blue-400" />,
  general: <FileCode className="w-4 h-4 text-stone-400" />,
};

function LuaScriptsTab() {
  const queryClient = useQueryClient();
  const [selectedScript, setSelectedScript] = useState<LuaScript | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [focusFilter, setFocusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newFilename, setNewFilename] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editorExpanded, setEditorExpanded] = useState(false);

  const { data: luaScripts = [], isLoading } = useQuery<LuaScript[]>({
    queryKey: ['/api/atropos/lua-scripts'],
    queryFn: () => fetch('/api/atropos/lua-scripts').then(r => r.json()),
  });

  const { data: templates = [] } = useQuery<LuaTemplate[]>({
    queryKey: ['/api/atropos/lua-templates'],
    queryFn: () => fetch('/api/atropos/lua-templates').then(r => r.json()),
  });

  const filteredScripts = luaScripts.filter((s) => {
    if (categoryFilter !== "all" && s.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.filename.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredTemplates = templates.filter((t) => {
    if (focusFilter !== "all" && t.focus !== focusFilter) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q));
    }
    return true;
  });

  const selectScript = (s: LuaScript) => {
    setSelectedScript(s);
    setEditContent(s.content);
    setIsEditing(false);
    setShowNewForm(false);
    setShowTemplates(false);
  };

  const useTemplate = (t: LuaTemplate) => {
    const fname = t.id + ".lua";
    setNewFilename(fname);
    setNewContent(t.content);
    setNewCategory(t.category);
    setShowNewForm(true);
    setShowTemplates(false);
    setSelectedScript(null);
    toast({ title: "Template Loaded", description: `"${t.name}" ready to customize` });
  };

  const saveEdit = async () => {
    if (!selectedScript) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/atropos/lua-scripts/${selectedScript.filename}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent })
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Script Saved", description: `${selectedScript.filename} updated` });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/atropos/lua-scripts'] });
    } catch {
      toast({ title: "Error", description: "Failed to save script", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const createScript = async () => {
    if (!newFilename.trim() || !newContent.trim()) {
      toast({ title: "Missing fields", description: "Provide a filename and content", variant: "destructive" });
      return;
    }
    const fname = newFilename.endsWith(".lua") ? newFilename : `${newFilename}.lua`;
    setIsSaving(true);
    try {
      const res = await fetch("/api/atropos/lua-scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: fname, content: newContent, category: newCategory })
      });
      if (!res.ok) throw new Error("Create failed");
      toast({ title: "Script Created", description: `${fname} added to your scripts` });
      setShowNewForm(false);
      setNewFilename("");
      setNewContent("");
      setNewCategory("general");
      queryClient.invalidateQueries({ queryKey: ['/api/atropos/lua-scripts'] });
    } catch {
      toast({ title: "Error", description: "Failed to create script", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteScript = async (filename: string) => {
    try {
      const res = await fetch(`/api/atropos/lua-scripts/${filename}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Deleted", description: `${filename} removed` });
      if (selectedScript?.filename === filename) {
        setSelectedScript(null);
        setEditContent("");
      }
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['/api/atropos/lua-scripts'] });
    } catch {
      toast({ title: "Error", description: "Failed to delete script", variant: "destructive" });
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied", description: "Script copied to clipboard" });
  };

  const downloadScript = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <Input
            placeholder="Search scripts by name, description, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-stone-900/60 border-stone-800 text-stone-200"
            data-testid="input-search-scripts"
          />
          {searchQuery && (
            <Button size="sm" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-stone-500 hover:text-stone-300" onClick={() => setSearchQuery("")}>
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showTemplates ? "default" : "outline"}
            className={showTemplates ? "bg-amber-700 hover:bg-amber-600 text-black" : "border-stone-700 text-amber-400 hover:border-amber-700"}
            onClick={() => { setShowTemplates(!showTemplates); setShowNewForm(false); }}
            data-testid="button-show-templates"
          >
            <BookOpen className="w-4 h-4 mr-1" /> Templates
          </Button>
          <Button
            size="sm"
            className="bg-teal-700 hover:bg-teal-600 text-black"
            onClick={() => { setShowNewForm(true); setShowTemplates(false); setSelectedScript(null); setNewContent(""); setNewFilename(""); }}
            data-testid="button-add-script"
          >
            <Plus className="w-4 h-4 mr-1" /> New Script
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-stone-500" />
        <Badge
          variant={categoryFilter === "all" ? "default" : "outline"}
          className={`cursor-pointer text-xs ${categoryFilter === "all" ? "bg-amber-700 text-black" : "border-stone-700 text-stone-400 hover:border-amber-700"}`}
          onClick={() => setCategoryFilter("all")}
          data-testid="filter-all"
        >All</Badge>
        {CATEGORY_LIST.map((cat) => (
          <Badge
            key={cat}
            variant={categoryFilter === cat ? "default" : "outline"}
            className={`cursor-pointer text-xs ${categoryFilter === cat ? "bg-amber-700 text-black" : "border-stone-700 text-stone-400 hover:border-amber-700"}`}
            onClick={() => setCategoryFilter(cat)}
            data-testid={`filter-${cat}`}
          >
            <span className="flex items-center gap-1">
              {CATEGORY_ICONS_MAP[cat] || <FileCode className="w-3 h-3" />}
              {cat.replace(/_/g, " ")}
            </span>
          </Badge>
        ))}
        {showTemplates && (
          <>
            <span className="text-stone-600 mx-1">|</span>
            {Object.entries(FOCUS_CONFIG).map(([key, cfg]) => (
              <Badge
                key={key}
                variant={focusFilter === key ? "default" : "outline"}
                className={`cursor-pointer text-xs ${focusFilter === key ? cfg.color : "border-stone-700 text-stone-400 hover:border-amber-700"}`}
                onClick={() => setFocusFilter(focusFilter === key ? "all" : key)}
                data-testid={`focus-${key}`}
              >
                <span className="flex items-center gap-1">{cfg.icon} {cfg.label}</span>
              </Badge>
            ))}
          </>
        )}
      </div>

      {showTemplates ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-amber-400 font-bold text-sm">Script Templates ({filteredTemplates.length})</h3>
            <span className="text-xs text-stone-500">Click to create from template</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((t) => {
              const focusCfg = FOCUS_CONFIG[t.focus] || FOCUS_CONFIG.general;
              return (
                <Card
                  key={t.id}
                  className="bg-stone-950/80 border-stone-800 hover:border-amber-700/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-amber-900/10 group"
                  onClick={() => useTemplate(t)}
                  data-testid={`template-${t.id}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {CATEGORY_ICONS_MAP[t.category] || <FileCode className="w-4 h-4 text-stone-400" />}
                        <span className="text-sm font-semibold text-stone-200 truncate group-hover:text-amber-300 transition-colors">{t.name}</span>
                      </div>
                      <Badge className={`text-[10px] shrink-0 ${DIFFICULTY_COLORS[t.difficulty] || ""}`}>
                        {t.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-400 line-clamp-2">{t.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[10px] ${focusCfg.color}`}>
                        <span className="flex items-center gap-1">{focusCfg.icon} {focusCfg.label}</span>
                      </Badge>
                      <span className="text-[10px] text-stone-600">{t.content.split('\n').length} lines</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800/60 text-stone-500">
                          {tag}
                        </span>
                      ))}
                      {t.tags.length > 4 && <span className="text-[10px] text-stone-600">+{t.tags.length - 4}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-stone-500 text-sm">No templates match your filters</div>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 ${editorExpanded ? "" : "md:grid-cols-2"}`}>
          {!editorExpanded && (
            <Card className="bg-stone-950/80 border-stone-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4" /> Your Scripts ({filteredScripts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                    </div>
                  ) : filteredScripts.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3">
                      <FileCode className="w-8 h-8 mx-auto text-stone-600" />
                      <p className="text-stone-500 text-sm">
                        {searchQuery ? "No scripts match your search" : "No scripts yet"}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-700/50 text-amber-400"
                        onClick={() => { setShowTemplates(true); setShowNewForm(false); }}
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1" /> Browse Templates
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-800/50">
                      {filteredScripts.map((s) => (
                        <div
                          key={s.filename}
                          className={`px-4 py-3 cursor-pointer hover:bg-stone-900/60 transition-colors ${selectedScript?.filename === s.filename ? "bg-stone-900/80 border-l-2 border-amber-500" : ""}`}
                          onClick={() => selectScript(s)}
                          data-testid={`script-item-${s.filename}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {CATEGORY_ICONS_MAP[s.category] || <FileCode className="w-3.5 h-3.5 text-stone-500 shrink-0" />}
                              <span className="text-sm font-medium text-stone-200 truncate">{s.name}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-500">{s.category.replace(/_/g, " ")}</Badge>
                              {deleteTarget === s.filename ? (
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" className="h-6 px-2 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); deleteScript(s.filename); }} data-testid={`button-confirm-delete-${s.filename}`}>Yes</Button>
                                  <Button size="sm" variant="ghost" className="h-6 px-2 text-stone-400" onClick={(e) => { e.stopPropagation(); setDeleteTarget(null); }} data-testid={`button-cancel-delete-${s.filename}`}>No</Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-stone-600 hover:text-red-400" onClick={(e) => { e.stopPropagation(); setDeleteTarget(s.filename); }} data-testid={`button-delete-${s.filename}`}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-stone-500 truncate mt-1">{s.description || "No description"}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-stone-600">{(s.size / 1024).toFixed(1)} KB</span>
                            <span className="text-[10px] text-stone-600">{new Date(s.modified).toLocaleDateString()}</span>
                            <span className="text-[10px] text-stone-600">{s.content.split('\n').length} lines</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Card className={`bg-stone-950/80 border-stone-800 ${editorExpanded ? "col-span-full" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  {showNewForm ? "New Script" : selectedScript ? selectedScript.name : "Editor"}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {(selectedScript || showNewForm) && (
                    <>
                      {selectedScript && !isEditing && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-stone-500 hover:text-amber-400" onClick={() => copyToClipboard(selectedScript.content)} title="Copy">
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-stone-500 hover:text-amber-400" onClick={() => downloadScript(selectedScript.filename, selectedScript.content)} title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-stone-500 hover:text-amber-400" onClick={() => setEditorExpanded(!editorExpanded)} title={editorExpanded ? "Collapse" : "Expand"}>
                        {editorExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showNewForm ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-stone-300 text-xs">Filename</Label>
                      <Input
                        placeholder="my_threat_hunter.lua"
                        value={newFilename}
                        onChange={(e) => setNewFilename(e.target.value)}
                        className="bg-stone-900/60 border-stone-800 text-stone-200"
                        data-testid="input-new-filename"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-stone-300 text-xs">Category</Label>
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="select-new-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_LIST.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              <span className="flex items-center gap-2">
                                {CATEGORY_ICONS_MAP[cat]}
                                {cat.replace(/_/g, " ")}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-stone-300 text-xs">Script Code</Label>
                      <span className="text-[10px] text-stone-600">{newContent.split('\n').length} lines</span>
                    </div>
                    <Textarea
                      placeholder="-- Your Lua script here&#10;-- Use atropos.emit() to output findings&#10;-- Use atropos.http.get() for HTTP requests"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className={`bg-stone-900/60 border-stone-800 text-stone-200 font-mono text-sm ${editorExpanded ? "h-[500px]" : "h-80"} leading-relaxed`}
                      data-testid="textarea-new-content"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createScript} disabled={isSaving} className="flex-1 bg-teal-700 hover:bg-teal-600 text-black font-semibold" data-testid="button-create-script">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Create Script</>}
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewForm(false)} className="border-stone-700 text-stone-400" data-testid="button-cancel-new">Cancel</Button>
                  </div>
                </>
              ) : selectedScript ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-400">
                      {CATEGORY_ICONS_MAP[selectedScript.category]} {selectedScript.category.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-[10px] text-stone-600">{selectedScript.filename}</span>
                    <span className="text-[10px] text-stone-600">{(selectedScript.size / 1024).toFixed(1)} KB</span>
                    <span className="text-[10px] text-stone-600">{selectedScript.content.split('\n').length} lines</span>
                  </div>
                  {selectedScript.description && (
                    <p className="text-xs text-stone-400 italic">{selectedScript.description}</p>
                  )}
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    readOnly={!isEditing}
                    className={`bg-stone-900/60 border-stone-800 text-stone-200 font-mono text-sm ${editorExpanded ? "h-[500px]" : "h-80"} leading-relaxed ${!isEditing ? "opacity-80" : "ring-1 ring-amber-700/30"}`}
                    data-testid="textarea-script-editor"
                  />
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={saveEdit} disabled={isSaving} className="flex-1 bg-amber-700 hover:bg-amber-600 text-black font-semibold" data-testid="button-save-script">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" /> Save Changes</>}
                        </Button>
                        <Button variant="outline" onClick={() => { setIsEditing(false); setEditContent(selectedScript.content); }} className="border-stone-700 text-stone-400" data-testid="button-cancel-edit">Cancel</Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200" data-testid="button-edit-script">
                        <Edit className="w-4 h-4 mr-1" /> Edit Script
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 text-stone-600 space-y-4">
                  <Code2 className="w-10 h-10 text-stone-700" />
                  <p className="text-sm">Select a script to view or edit</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-amber-700/50 text-amber-400 text-xs" onClick={() => setShowTemplates(true)}>
                      <BookOpen className="w-3.5 h-3.5 mr-1" /> Browse Templates
                    </Button>
                    <Button size="sm" variant="outline" className="border-teal-700/50 text-teal-400 text-xs" onClick={() => setShowNewForm(true)}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Blank Script
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function ApiLookupsTab() {
  const [vtTarget, setVtTarget] = useState("");
  const [vtType, setVtType] = useState("domain");
  const [vtResult, setVtResult] = useState<any>(null);
  const [vtLoading, setVtLoading] = useState(false);

  const [haTarget, setHaTarget] = useState("");
  const [haType, setHaType] = useState("hash");
  const [haResult, setHaResult] = useState<any>(null);
  const [haLoading, setHaLoading] = useState(false);

  const [freeTarget, setFreeTarget] = useState("");
  const [freeService, setFreeService] = useState("all");
  const [freeResult, setFreeResult] = useState<any>(null);
  const [freeLoading, setFreeLoading] = useState(false);

  const doLookup = async (
    endpoint: string,
    body: object,
    setResult: (r: any) => void,
    setLoading: (b: boolean) => void,
    label: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setResult(data);
      if (data.needsKey) {
        toast({ title: "API Key Required", description: `${label} API key needs to be configured in settings`, variant: "destructive" });
      }
    } catch {
      toast({ title: "Lookup Error", description: `${label} lookup failed`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderResult = (result: any, testId: string) => {
    if (!result) return null;
    if (result.needsKey) {
      return (
        <div className="mt-3 p-3 rounded-lg bg-amber-900/20 border border-amber-800/30 text-amber-300 text-sm flex items-center gap-2" data-testid={`${testId}-needs-key`}>
          <Key className="w-4 h-4" /> API key needs to be configured for this service.
        </div>
      );
    }
    return (
      <ScrollArea className="mt-3 h-48 rounded-lg border border-stone-800 bg-stone-900/40 p-3" data-testid={`${testId}-result`}>
        <pre className="text-xs text-stone-300 font-mono whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-400 flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" /> VirusTotal Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2 space-y-1">
              <Label className="text-stone-300 text-xs">Target</Label>
              <Input placeholder="domain, IP, hash, or URL" value={vtTarget} onChange={(e) => setVtTarget(e.target.value)} className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="input-vt-target" />
            </div>
            <div className="space-y-1">
              <Label className="text-stone-300 text-xs">Type</Label>
              <Select value={vtType} onValueChange={setVtType}>
                <SelectTrigger className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="select-vt-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="ip">IP</SelectItem>
                  <SelectItem value="hash">Hash</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => doLookup("/api/atropos/lookup/virustotal", { target: vtTarget, type: vtType }, setVtResult, setVtLoading, "VirusTotal")}
            disabled={vtLoading || !vtTarget.trim()}
            className="w-full bg-amber-700 hover:bg-amber-600 text-black"
            data-testid="button-vt-lookup"
          >
            {vtLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> Lookup</>}
          </Button>
          {renderResult(vtResult, "vt")}
        </CardContent>
      </Card>

      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-400 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4" /> Hybrid Analysis Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2 space-y-1">
              <Label className="text-stone-300 text-xs">Target</Label>
              <Input placeholder="hash, domain, or search term" value={haTarget} onChange={(e) => setHaTarget(e.target.value)} className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="input-ha-target" />
            </div>
            <div className="space-y-1">
              <Label className="text-stone-300 text-xs">Type</Label>
              <Select value={haType} onValueChange={setHaType}>
                <SelectTrigger className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="select-ha-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hash">Hash</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => doLookup("/api/atropos/lookup/hybrid-analysis", { target: haTarget, type: haType }, setHaResult, setHaLoading, "Hybrid Analysis")}
            disabled={haLoading || !haTarget.trim()}
            className="w-full bg-amber-700 hover:bg-amber-600 text-black"
            data-testid="button-ha-lookup"
          >
            {haLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> Lookup</>}
          </Button>
          {renderResult(haResult, "ha")}
        </CardContent>
      </Card>

      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-400 flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4" /> Free Lookups
          </CardTitle>
          <CardDescription className="text-stone-500">DNS, WHOIS, HTTP Headers — no API key needed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2 space-y-1">
              <Label className="text-stone-300 text-xs">Target</Label>
              <Input placeholder="example.com" value={freeTarget} onChange={(e) => setFreeTarget(e.target.value)} className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="input-free-target" />
            </div>
            <div className="space-y-1">
              <Label className="text-stone-300 text-xs">Service</Label>
              <Select value={freeService} onValueChange={setFreeService}>
                <SelectTrigger className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="select-free-service"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="dns">DNS</SelectItem>
                  <SelectItem value="whois">WHOIS</SelectItem>
                  <SelectItem value="headers">HTTP Headers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => doLookup("/api/atropos/lookup/free", { target: freeTarget, service: freeService }, setFreeResult, setFreeLoading, "Free")}
            disabled={freeLoading || !freeTarget.trim()}
            className="w-full bg-teal-700 hover:bg-teal-600 text-black"
            data-testid="button-free-lookup"
          >
            {freeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Globe className="w-4 h-4 mr-2" /> Lookup</>}
          </Button>
          {renderResult(freeResult, "free")}
        </CardContent>
      </Card>
    </div>
  );
}

function ScanHistoryTab() {
  const { data: history = [], isLoading, refetch } = useQuery<ScanResult[]>({
    queryKey: ['/api/atropos/results'],
    queryFn: () => fetch('/api/atropos/results').then(r => r.json()),
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-amber-400 font-bold text-sm">Scan History ({history.length})</h3>
        <Button size="sm" variant="outline" className="border-stone-700 text-stone-400 hover:text-amber-400" onClick={() => refetch()} data-testid="button-refresh-history">
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-5 h-5 animate-spin text-amber-400" /></div>
      ) : history.length === 0 ? (
        <Card className="bg-stone-950/80 border-stone-800">
          <CardContent className="py-12 text-center text-stone-500">No scan history yet. Run a scan to see results here.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((scan) => (
            <Card
              key={scan.id}
              className={`bg-stone-950/80 border-stone-800 cursor-pointer transition-colors hover:border-amber-900/50 ${expandedId === scan.id ? "border-amber-700/50" : ""}`}
              onClick={() => setExpandedId(expandedId === scan.id ? null : scan.id)}
              data-testid={`history-card-${scan.id}`}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Radar className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-sm font-medium text-stone-200">{scan.target}</div>
                      <div className="text-xs text-stone-500">{scan.scanType} · {new Date(scan.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <Badge className={SEVERITY_COLORS[scan.summary.riskLevel] || SEVERITY_COLORS.info}>
                    {scan.summary.riskLevel.toUpperCase()} ({scan.summary.riskScore}/100)
                  </Badge>
                </div>

                {expandedId === scan.id && (
                  <div className="mt-3 pt-3 border-t border-stone-800 space-y-2" data-testid={`history-expanded-${scan.id}`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-stone-900/60 rounded p-1.5"><span className="text-amber-300 font-bold">{scan.summary.subdomains}</span> <span className="text-stone-500">subs</span></div>
                      <div className="bg-stone-900/60 rounded p-1.5"><span className="text-teal-300 font-bold">{scan.summary.openPorts}</span> <span className="text-stone-500">ports</span></div>
                      <div className="bg-stone-900/60 rounded p-1.5"><span className="text-blue-300 font-bold">{scan.summary.technologies}</span> <span className="text-stone-500">tech</span></div>
                      <div className="bg-stone-900/60 rounded p-1.5"><span className="text-red-300 font-bold">{scan.summary.vulnerabilities}</span> <span className="text-stone-500">vulns</span></div>
                    </div>
                    <ScrollArea className="h-32 rounded-lg border border-stone-800 bg-stone-900/40 p-2">
                      <div className="space-y-1">
                        {scan.findings.map((f, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[f.severity || "info"]}`}>{f.type}</Badge>
                            <span className="text-stone-300 truncate">{f.value}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolsTab() {
  const [activeTool, setActiveTool] = useState<"frida" | "pano" | "osint">("frida");
  const [fridaScriptType, setFridaScriptType] = useState("ssl_bypass");
  const [fridaTarget, setFridaTarget] = useState("");
  const [fridaCode, setFridaCode] = useState("");
  const [fridaLoading, setFridaLoading] = useState(false);

  const [panoEntityType, setPanoEntityType] = useState("email");
  const [panoEntityValue, setPanoEntityValue] = useState("");
  const [panoResults, setPanoResults] = useState<any>(null);
  const [panoLoading, setPanoLoading] = useState(false);

  const [iocInput, setIocInput] = useState("");
  const [iocResults, setIocResults] = useState<any>(null);
  const [iocLoading, setIocLoading] = useState(false);
  const [extractText, setExtractText] = useState("");
  const [extractResults, setExtractResults] = useState<any>(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [osintMode, setOsintMode] = useState<"analyze" | "extract">("analyze");

  const generateFridaScript = async () => {
    setFridaLoading(true);
    try {
      const resp = await fetch("/api/atropos/frida/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptType: fridaScriptType, target: fridaTarget || undefined }),
      });
      const data = await resp.json();
      if (data.code) {
        setFridaCode(data.code);
        toast({ title: `Generated: ${data.name}`, description: data.description });
      }
    } catch { toast({ title: "Error generating script", variant: "destructive" }); }
    setFridaLoading(false);
  };

  const runPanoTransform = async () => {
    if (!panoEntityValue.trim()) return;
    setPanoLoading(true);
    try {
      const resp = await fetch("/api/atropos/pano/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: panoEntityType, entityValue: panoEntityValue }),
      });
      setPanoResults(await resp.json());
    } catch { toast({ title: "Transform failed", variant: "destructive" }); }
    setPanoLoading(false);
  };

  const analyzeIOC = async () => {
    if (!iocInput.trim()) return;
    setIocLoading(true);
    try {
      const resp = await fetch("/api/atropos/osint-toolkit/ioc/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ioc: iocInput }),
      });
      setIocResults(await resp.json());
    } catch { toast({ title: "Analysis failed", variant: "destructive" }); }
    setIocLoading(false);
  };

  const extractIOCs = async () => {
    if (!extractText.trim()) return;
    setExtractLoading(true);
    try {
      const resp = await fetch("/api/atropos/osint-toolkit/ioc/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractText }),
      });
      setExtractResults(await resp.json());
    } catch { toast({ title: "Extraction failed", variant: "destructive" }); }
    setExtractLoading(false);
  };

  const fridaScripts = [
    { id: "ssl_bypass", name: "SSL Pinning Bypass", desc: "Bypass certificate pinning on Android/iOS", icon: Shield },
    { id: "crypto_trace", name: "Crypto API Tracer", desc: "Trace AES, RSA, SHA operations", icon: Key },
    { id: "network_monitor", name: "Network Monitor", desc: "Monitor connections and HTTP requests", icon: Globe },
    { id: "api_hook", name: "API Function Hooker", desc: "Hook and trace API calls with args", icon: Code2 },
    { id: "root_jailbreak_detect", name: "Root/JB Detection Bypass", desc: "Bypass root and jailbreak checks", icon: Shield },
  ];

  const panoEntities = [
    { type: "email", label: "Email", placeholder: "user@example.com" },
    { type: "username", label: "Username", placeholder: "johndoe" },
    { type: "website", label: "Website/URL", placeholder: "https://example.com" },
    { type: "location", label: "Location", placeholder: "40.7128, -74.0060" },
  ];

  const tools = [
    { id: "frida" as const, name: "Frida", desc: "Dynamic Instrumentation", lang: "JavaScript", color: "text-orange-400", bgColor: "bg-orange-900/20 border-orange-800/40" },
    { id: "pano" as const, name: "PANO", desc: "OSINT Graph Analysis", lang: "Python / Qt", color: "text-cyan-400", bgColor: "bg-cyan-900/20 border-cyan-800/40" },
    { id: "osint" as const, name: "OSINT Toolkit", desc: "Threat Intel Platform", lang: "Docker Web App", color: "text-emerald-400", bgColor: "bg-emerald-900/20 border-emerald-800/40" },
  ];

  return (
    <div className="space-y-4 mt-4" data-testid="tools-tab">
      <div className="grid grid-cols-3 gap-3">
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={`p-3 rounded-lg border text-left transition-all ${activeTool === t.id ? t.bgColor + " ring-1 ring-amber-600/50" : "bg-stone-900/40 border-stone-800 hover:border-stone-700"}`}
            data-testid={`tool-select-${t.id}`}
          >
            <div className={`text-sm font-bold ${activeTool === t.id ? t.color : "text-stone-300"}`}>{t.name}</div>
            <div className="text-xs text-stone-500">{t.desc}</div>
            <Badge variant="outline" className="mt-1 text-[10px]">{t.lang}</Badge>
          </button>
        ))}
      </div>

      {activeTool === "frida" && (
        <Card className="bg-stone-950/80 border-stone-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-400 flex items-center gap-2"><Zap className="w-5 h-5" /> Frida - Dynamic Instrumentation Toolkit</CardTitle>
            <CardDescription>Inject JavaScript into native apps to hook functions, trace APIs, and bypass protections. No Lua - pure JS runtime.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-stone-400 text-xs">Script Template</Label>
                <div className="space-y-2">
                  {fridaScripts.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setFridaScriptType(s.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors ${fridaScriptType === s.id ? "bg-orange-900/20 border-orange-700/50 text-orange-300" : "bg-stone-900/40 border-stone-800 text-stone-400 hover:border-stone-700"}`}
                      data-testid={`frida-script-${s.id}`}
                    >
                      <s.icon className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="text-xs font-medium">{s.name}</div>
                        <div className="text-[10px] text-stone-500">{s.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-400 text-xs">Target App (optional)</Label>
                  <Input
                    value={fridaTarget}
                    onChange={e => setFridaTarget(e.target.value)}
                    placeholder="com.example.app or process name"
                    className="bg-stone-900/60 border-stone-700 text-sm"
                    data-testid="frida-target-input"
                  />
                </div>
                <Button onClick={generateFridaScript} disabled={fridaLoading} className="w-full bg-orange-700 hover:bg-orange-600" data-testid="frida-generate-btn">
                  {fridaLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Code2 className="w-4 h-4 mr-2" />}
                  Generate Script
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-stone-400 text-xs">Generated JavaScript</Label>
                  {fridaCode && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { navigator.clipboard.writeText(fridaCode); toast({ title: "Copied" }); }} data-testid="frida-copy-btn">
                        <Copy className="w-3 h-3 mr-1" /> Copy
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => { const b = new Blob([fridaCode], { type: "text/javascript" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `frida_${fridaScriptType}.js`; a.click(); }} data-testid="frida-download-btn">
                        <Download className="w-3 h-3 mr-1" /> .js
                      </Button>
                    </div>
                  )}
                </div>
                <ScrollArea className="h-[340px] rounded-lg border border-stone-800 bg-black/60">
                  {fridaCode ? (
                    <pre className="p-3 text-xs text-orange-300/90 font-mono whitespace-pre-wrap">{fridaCode}</pre>
                  ) : (
                    <div className="p-6 text-center text-stone-600 text-sm">Select a template and click Generate to create a Frida script</div>
                  )}
                </ScrollArea>
                {fridaCode && (
                  <div className="bg-stone-900/60 rounded-lg border border-stone-800 p-2.5">
                    <div className="text-[10px] text-stone-500 mb-1">Usage</div>
                    <code className="text-xs text-amber-300 font-mono">frida -U -l script.js {fridaTarget || "<target_app>"}</code>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTool === "pano" && (
        <Card className="bg-stone-950/80 border-stone-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-cyan-400 flex items-center gap-2"><Search className="w-5 h-5" /> PANO - OSINT Investigation Platform</CardTitle>
            <CardDescription>Python/Qt desktop app with graph visualization, timeline analysis, and AI-powered entity discovery. Transforms entities into intelligence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-stone-400 text-xs">Entity Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {panoEntities.map(e => (
                    <button
                      key={e.type}
                      onClick={() => { setPanoEntityType(e.type); setPanoEntityValue(""); }}
                      className={`p-2 rounded-lg border text-xs font-medium transition-colors ${panoEntityType === e.type ? "bg-cyan-900/20 border-cyan-700/50 text-cyan-300" : "bg-stone-900/40 border-stone-800 text-stone-400 hover:border-stone-700"}`}
                      data-testid={`pano-entity-${e.type}`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-400 text-xs">Entity Value</Label>
                  <Input
                    value={panoEntityValue}
                    onChange={e => setPanoEntityValue(e.target.value)}
                    placeholder={panoEntities.find(e => e.type === panoEntityType)?.placeholder}
                    className="bg-stone-900/60 border-stone-700 text-sm"
                    data-testid="pano-entity-input"
                  />
                </div>
                <Button onClick={runPanoTransform} disabled={panoLoading || !panoEntityValue.trim()} className="w-full bg-cyan-700 hover:bg-cyan-600" data-testid="pano-transform-btn">
                  {panoLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Run Transform
                </Button>
                <div className="space-y-2">
                  <Label className="text-stone-400 text-xs">PANO Helpers</Label>
                  <div className="space-y-1">
                    {["Cross-Examination", "Portrait Creator", "Media Analyzer", "Base Searcher", "Translator"].map(h => (
                      <div key={h} className="flex items-center gap-2 text-xs text-stone-500 bg-stone-900/40 rounded p-1.5 border border-stone-800">
                        <Zap className="w-3 h-3 text-cyan-600" /> {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-stone-400 text-xs">Transform Results / Entity Graph</Label>
                <ScrollArea className="h-[380px] rounded-lg border border-stone-800 bg-black/60">
                  {panoResults ? (
                    <div className="p-3 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-cyan-900/40 text-cyan-300">{panoResults.entity?.type}</Badge>
                        <span className="text-xs text-stone-300 truncate">{panoResults.entity?.value}</span>
                      </div>
                      {panoResults.graph && (
                        <div className="space-y-2">
                          <div className="text-[10px] text-stone-500 uppercase tracking-wider">Graph Nodes ({panoResults.graph.nodes?.length || 0})</div>
                          <div className="space-y-1">
                            {panoResults.graph.nodes?.map((n: any, i: number) => (
                              <div key={i} className={`flex items-center gap-2 text-xs p-1.5 rounded ${i === 0 ? "bg-cyan-900/30 border border-cyan-800/40" : "bg-stone-900/40 border border-stone-800"}`}>
                                <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-cyan-400" : "bg-stone-500"}`} />
                                <Badge variant="outline" className="text-[9px]">{n.type}</Badge>
                                <span className="text-stone-300 truncate">{n.label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-wider mt-3">Connections ({panoResults.graph.edges?.length || 0})</div>
                          <div className="space-y-1">
                            {panoResults.graph.edges?.map((e: any, i: number) => (
                              <div key={i} className="flex items-center gap-1 text-[10px] text-stone-500">
                                <span className="text-cyan-400">{e.from}</span> <ChevronRight className="w-3 h-3" /> <span className="text-stone-300">{e.to}</span>
                                <Badge variant="outline" className="text-[8px] ml-auto">{e.label}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {panoResults.results?.length > 0 && (
                        <div className="space-y-1 mt-3">
                          <div className="text-[10px] text-stone-500 uppercase tracking-wider">Discovered Entities</div>
                          {panoResults.results.map((r: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs bg-stone-900/40 rounded p-1.5 border border-stone-800">
                              <Badge variant="outline" className="text-[9px]">{r.type}</Badge>
                              <span className="text-stone-300 truncate flex-1">{r.value}</span>
                              <span className="text-stone-600 text-[10px]">{Math.round(r.confidence * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-stone-600 text-sm">Enter an entity and run a transform to see results</div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTool === "osint" && (
        <Card className="bg-stone-950/80 border-stone-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-emerald-400 flex items-center gap-2"><Shield className="w-5 h-5" /> OSINT Toolkit - Threat Intelligence Platform</CardTitle>
            <CardDescription>Docker-based web app (React + FastAPI) for IOC analysis, email forensics, domain monitoring, and AI-powered threat detection. Results are simulated for training purposes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant={osintMode === "analyze" ? "default" : "ghost"} size="sm" onClick={() => setOsintMode("analyze")} className={osintMode === "analyze" ? "bg-emerald-700" : ""} data-testid="osint-mode-analyze">
                <Search className="w-3 h-3 mr-1" /> IOC Analyzer
              </Button>
              <Button variant={osintMode === "extract" ? "default" : "ghost"} size="sm" onClick={() => setOsintMode("extract")} className={osintMode === "extract" ? "bg-emerald-700" : ""} data-testid="osint-mode-extract">
                <Target className="w-3 h-3 mr-1" /> IOC Extractor
              </Button>
            </div>

            {osintMode === "analyze" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-stone-400 text-xs">Indicator of Compromise</Label>
                  <Input
                    value={iocInput}
                    onChange={e => setIocInput(e.target.value)}
                    placeholder="IP, domain, hash, email, URL, or CVE"
                    className="bg-stone-900/60 border-stone-700 text-sm"
                    data-testid="osint-ioc-input"
                  />
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-stone-500">
                    {["192.168.1.1", "evil.com", "CVE-2024-1234"].map(ex => (
                      <button key={ex} onClick={() => setIocInput(ex)} className="bg-stone-900/40 rounded p-1 border border-stone-800 hover:border-stone-700 truncate">{ex}</button>
                    ))}
                  </div>
                  <Button onClick={analyzeIOC} disabled={iocLoading || !iocInput.trim()} className="w-full bg-emerald-700 hover:bg-emerald-600" data-testid="osint-analyze-btn">
                    {iocLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                    Analyze IOC
                  </Button>
                  <div className="space-y-1">
                    <Label className="text-stone-400 text-xs">Integrated Services</Label>
                    <div className="grid grid-cols-2 gap-1">
                      {["VirusTotal", "AbuseIPDB", "Shodan", "URLScan", "ThreatFox", "NIST NVD"].map(s => (
                        <div key={s} className="text-[10px] text-stone-500 bg-stone-900/40 rounded p-1 border border-stone-800 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> {s}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-400 text-xs">Analysis Results</Label>
                  <ScrollArea className="h-[340px] rounded-lg border border-stone-800 bg-black/60">
                    {iocResults ? (
                      <div className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-900/40 text-emerald-300">{iocResults.type}</Badge>
                            <span className="text-xs text-stone-300 font-mono">{iocResults.ioc}</span>
                          </div>
                          <Badge className={iocResults.riskScore > 60 ? "bg-red-900/40 text-red-300" : iocResults.riskScore > 30 ? "bg-yellow-900/40 text-yellow-300" : "bg-green-900/40 text-green-300"}>
                            Risk: {iocResults.riskScore}/100
                          </Badge>
                        </div>
                        {iocResults.defanged && (
                          <div className="text-[10px] text-stone-500 bg-stone-900/40 rounded p-1.5 border border-stone-800 font-mono">
                            Defanged: {iocResults.defanged}
                          </div>
                        )}
                        {iocResults.analyses?.map((a: any, i: number) => (
                          <div key={i} className="bg-stone-900/40 rounded-lg border border-stone-800 p-2.5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <ExternalLink className="w-3 h-3 text-emerald-500" />
                              <span className="text-xs font-medium text-stone-200">{a.service}</span>
                              <Badge variant="outline" className="text-[9px]">{a.status}</Badge>
                            </div>
                            <div className="space-y-0.5">
                              {Object.entries(a.data || {}).map(([k, v]) => (
                                <div key={k} className="flex justify-between text-[10px]">
                                  <span className="text-stone-500">{k.replace(/([A-Z])/g, " $1").trim()}</span>
                                  <span className="text-stone-300 font-mono">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-stone-600 text-sm">Enter an IOC to analyze it against threat intelligence services</div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}

            {osintMode === "extract" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-stone-400 text-xs">Paste text, logs, or reports to extract IOCs</Label>
                  <Textarea
                    value={extractText}
                    onChange={e => setExtractText(e.target.value)}
                    placeholder={"Paste threat reports, logs, emails, or any text containing indicators...\n\nExample:\nThe malware connected to 192.168.1.100 and resolved evil-domain.com.\nFile hash: a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4\nAttacker email: threat@badactor.com\nExploit: CVE-2024-12345"}
                    className="bg-stone-900/60 border-stone-700 text-sm min-h-[200px] font-mono"
                    data-testid="osint-extract-input"
                  />
                  <Button onClick={extractIOCs} disabled={extractLoading || !extractText.trim()} className="w-full bg-emerald-700 hover:bg-emerald-600" data-testid="osint-extract-btn">
                    {extractLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Target className="w-4 h-4 mr-2" />}
                    Extract IOCs
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-400 text-xs">Extracted Indicators</Label>
                  <ScrollArea className="h-[280px] rounded-lg border border-stone-800 bg-black/60">
                    {extractResults ? (
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-stone-400">Found {extractResults.count} indicators</span>
                          {extractResults.count > 0 && (
                            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                              const text = extractResults.indicators.map((i: any) => `${i.type}: ${i.value}`).join("\n");
                              navigator.clipboard.writeText(text);
                              toast({ title: "Copied all IOCs" });
                            }} data-testid="osint-copy-iocs">
                              <Copy className="w-3 h-3 mr-1" /> Copy All
                            </Button>
                          )}
                        </div>
                        {extractResults.indicators?.map((ind: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs bg-stone-900/40 rounded p-1.5 border border-stone-800">
                            <Badge variant="outline" className="text-[9px] shrink-0">{ind.type}</Badge>
                            <span className="text-stone-300 font-mono truncate flex-1">{ind.value}</span>
                            <Button variant="ghost" size="sm" className="h-5 px-1.5" onClick={() => { setOsintMode("analyze"); setIocInput(ind.value); }}>
                              <Search className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-stone-600 text-sm">Paste text and click Extract to find indicators of compromise</div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ScannerDashboard() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-200" data-testid="scanner-dashboard">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Radar className="w-7 h-7 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-amber-400 tracking-tight">Atropos Scanner</h1>
            <p className="text-sm text-stone-500">Reconnaissance · Vulnerability Analysis · Threat Intelligence</p>
          </div>
        </div>

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-stone-900/60 border border-stone-800" data-testid="scanner-tabs">
            <TabsTrigger value="scan" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400" data-testid="tab-scan">
              <Play className="w-4 h-4 mr-2 hidden sm:inline" /> Scan
            </TabsTrigger>
            <TabsTrigger value="scripts" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400" data-testid="tab-scripts">
              <FileCode className="w-4 h-4 mr-2 hidden sm:inline" /> Lua Scripts
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400" data-testid="tab-tools">
              <Zap className="w-4 h-4 mr-2 hidden sm:inline" /> Tools
            </TabsTrigger>
            <TabsTrigger value="lookups" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400" data-testid="tab-lookups">
              <Globe className="w-4 h-4 mr-2 hidden sm:inline" /> API Lookups
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400" data-testid="tab-history">
              <Terminal className="w-4 h-4 mr-2 hidden sm:inline" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan"><ScanTab /></TabsContent>
          <TabsContent value="scripts"><LuaScriptsTab /></TabsContent>
          <TabsContent value="tools"><ToolsTab /></TabsContent>
          <TabsContent value="lookups"><ApiLookupsTab /></TabsContent>
          <TabsContent value="history"><ScanHistoryTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}