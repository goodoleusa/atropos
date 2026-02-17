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
  Target, Code2, Maximize2, Minimize2, Newspaper
} from 'lucide-react';
import { useReportContext } from '@/hooks/useReportContext';

interface AtroposScript {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty?: string;
  education?: string;
  realTool?: string | null;
  installed?: boolean;
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

interface ScanTabProps {
  injectedTargets?: string[];
}

function ScanTab({ injectedTargets }: ScanTabProps) {
  const { addToolOutput } = useReportContext();
  const [target, setTarget] = useState("");
  const [selectedScript, setSelectedScript] = useState("bbot_scanner");

  useEffect(() => {
    if (injectedTargets && injectedTargets.length > 0) {
      setTarget(injectedTargets[0]);
    }
  }, [injectedTargets]);
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
              {injectedTargets && injectedTargets.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-stone-500 mr-1">From SpiderFoot:</span>
                  {injectedTargets.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => setTarget(t)}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                        target === t
                          ? 'bg-orange-900/40 border-orange-700 text-orange-400'
                          : 'bg-stone-900/40 border-stone-700 text-stone-400 hover:border-orange-700 hover:text-orange-400'
                      }`}
                      data-testid={`pivot-target-${i}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
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
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-sm">{s.name}</span>
                            {s.difficulty && (
                              <span className={`text-[9px] px-1.5 py-0 rounded-full font-bold ${
                                s.difficulty === 'beginner' ? 'bg-teal-900/50 text-teal-400' :
                                s.difficulty === 'intermediate' ? 'bg-amber-900/50 text-amber-400' :
                                'bg-red-900/50 text-red-400'
                              }`}>{s.difficulty}</span>
                            )}
                            {s.installed === false && (
                              <span className="text-[9px] px-1 py-0 rounded bg-stone-800 text-stone-500">not installed</span>
                            )}
                          </div>
                          <span className="text-xs text-stone-500">{s.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(() => {
            const selected = scripts.find(s => s.id === selectedScript);
            if (!selected?.education) return null;
            return (
              <div className="p-3 rounded-lg bg-stone-900/40 border border-stone-800/50 space-y-2" data-testid="tool-education-panel">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">About This Tool</span>
                  {selected.difficulty && (
                    <Badge variant="outline" className={`text-[10px] ml-auto ${
                      selected.difficulty === 'beginner' ? 'border-teal-700 text-teal-400' :
                      selected.difficulty === 'intermediate' ? 'border-amber-700 text-amber-400' :
                      'border-red-700 text-red-400'
                    }`}>{selected.difficulty}</Badge>
                  )}
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">{selected.education}</p>
                {selected.realTool && (
                  <div className="text-[10px] text-stone-500">
                    Real tool: <span className="text-stone-400 font-mono">{selected.realTool}</span>
                    {selected.installed ? ' (installed)' : ' (simulated)'}
                  </div>
                )}
              </div>
            );
          })()}
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
  const [showGuide, setShowGuide] = useState(true);

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
      {showGuide && (
        <Card className="bg-amber-900/10 border-amber-900/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> ATROPOS SCRIPTING GUIDE
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowGuide(false)} className="h-6 w-6 p-0 text-amber-600">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-[11px] text-stone-400 space-y-2">
            <p><span className="text-amber-500 font-bold">LUA:</span> Core scanner logic. Use Lua to write custom OSINT & vulnerability checks. These scripts run on the Rust back-end scanner.</p>
            <p><span className="text-teal-500 font-bold">FRIDA (JS):</span> Located in 'Toolkit'. Used for dynamic instrumentation of live processes. Use JS to hook functions and bypass protections.</p>
            <p><span className="text-stone-300 font-bold">HOW TO LOAD:</span> Select a script from the list or choose a 'Template' to start. Modify code in the editor, then 'Save' to apply changes instantly.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <Input
            placeholder="Search scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-stone-900/60 border-stone-800 text-stone-200"
            data-testid="input-search-scripts"
          />
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

      <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <Filter className="w-3.5 h-3.5 text-stone-500 shrink-0" />
        <Badge
          variant={categoryFilter === "all" ? "default" : "outline"}
          className={`cursor-pointer text-[10px] whitespace-nowrap ${categoryFilter === "all" ? "bg-amber-700 text-black" : "border-stone-700 text-stone-400"}`}
          onClick={() => setCategoryFilter("all")}
        >All</Badge>
        {CATEGORY_LIST.map((cat) => (
          <Badge
            key={cat}
            variant={categoryFilter === cat ? "default" : "outline"}
            className={`cursor-pointer text-[10px] whitespace-nowrap ${categoryFilter === cat ? "bg-amber-700 text-black" : "border-stone-700 text-stone-400"}`}
            onClick={() => setCategoryFilter(cat)}
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
                className={`cursor-pointer text-[10px] whitespace-nowrap ${focusFilter === key ? cfg.color : "border-stone-700 text-stone-400"}`}
                onClick={() => setFocusFilter(key)}
              >
                <span className="flex items-center gap-1">
                  {cfg.icon}
                  {cfg.label}
                </span>
              </Badge>
            ))}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <div className="lg:col-span-4 space-y-4">
          <ScrollArea className="h-[400px] lg:h-[600px] rounded-lg border border-stone-800 bg-stone-900/20">
            <div className="p-3 space-y-2">
              {showTemplates ? (
                filteredTemplates.length > 0 ? (
                  filteredTemplates.map((t) => (
                    <Card
                      key={t.id}
                      className="bg-stone-900/40 border-stone-800 hover:border-amber-900/50 cursor-pointer transition-all group"
                      onClick={() => useTemplate(t)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-amber-400 text-sm group-hover:text-amber-300">{t.name}</h4>
                          <Badge variant="outline" className={`text-[9px] ${DIFFICULTY_COLORS[t.difficulty]}`}>{t.difficulty}</Badge>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">{t.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {t.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[9px] bg-stone-800/50 text-stone-400">#{tag}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-stone-600 text-xs font-mono">NO TEMPLATES FOUND</div>
                )
              ) : (
                filteredScripts.length > 0 ? (
                  filteredScripts.map((s) => (
                    <div
                      key={s.filename}
                      onClick={() => selectScript(s)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                        selectedScript?.filename === s.filename
                          ? 'bg-amber-900/20 border-amber-700/50 shadow-lg shadow-amber-900/10'
                          : 'bg-stone-900/40 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {CATEGORY_ICONS_MAP[s.category] || <FileCode className="w-3.5 h-3.5 text-stone-500" />}
                          <span className={`text-sm font-bold truncate ${selectedScript?.filename === s.filename ? 'text-amber-400' : 'text-stone-300 group-hover:text-stone-200'}`}>
                            {s.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {deleteTarget === s.filename ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); deleteScript(s.filename); }}>Yes</Button>
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-stone-400" onClick={(e) => { e.stopPropagation(); setDeleteTarget(null); }}>No</Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-stone-500 hover:text-red-400"
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(s.filename); }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-500 truncate">{s.filename} · {Math.round(s.size / 1024)} KB</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-stone-600 text-xs font-mono">NO SCRIPTS FOUND</div>
                )
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-8 space-y-4">
          {(selectedScript || showNewForm) ? (
            <Card className={`bg-stone-900/20 border-stone-800 flex flex-col ${editorExpanded ? 'fixed inset-4 z-50' : 'h-full min-h-[500px]'}`}>
              <CardHeader className="p-4 border-b border-stone-800 flex flex-row items-center justify-between shrink-0">
                <div>
                  <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    {showNewForm ? (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="filename.lua"
                          value={newFilename}
                          onChange={(e) => setNewFilename(e.target.value)}
                          className="h-7 text-xs bg-stone-950 border-stone-800 w-48 font-mono"
                        />
                      </div>
                    ) : (
                      <span className="font-mono">{selectedScript?.filename}</span>
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-500" onClick={() => setEditorExpanded(!editorExpanded)}>
                    {editorExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-amber-700 hover:bg-amber-600 text-black font-bold h-8"
                    disabled={isSaving}
                    onClick={showNewForm ? createScript : saveEdit}
                  >
                    {isSaving ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                    {showNewForm ? 'Create' : 'Save'}
                  </Button>
                  {showNewForm && (
                    <Button variant="ghost" size="sm" className="h-8 text-stone-500" onClick={() => setShowNewForm(false)}>Cancel</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative min-h-0">
                <Textarea
                  value={showNewForm ? newContent : editContent}
                  onChange={(e) => showNewForm ? setNewContent(e.target.value) : setEditContent(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-stone-950 border-0 rounded-none font-mono text-xs p-4 resize-none focus-visible:ring-0 text-amber-500/90 leading-relaxed"
                  placeholder="-- Write your Lua script here..."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-stone-800 rounded-lg bg-stone-900/10 text-stone-600 space-y-4">
              <FileCode className="w-12 h-12 text-stone-800" />
              <div className="text-center px-6">
                <p className="text-sm font-medium text-stone-500">No Script Selected</p>
                <p className="text-xs text-stone-600 mt-1 max-w-xs">Select a script from the sidebar or use a template to begin development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
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
              <Input placeholder="example.com or IP" value={freeTarget} onChange={(e) => setFreeTarget(e.target.value)} className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="input-free-target" />
            </div>
            <div className="space-y-1">
              <Label className="text-stone-300 text-xs">Service</Label>
              <Select value={freeService} onValueChange={setFreeService}>
                <SelectTrigger className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="select-free-service"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Available</SelectItem>
                  <SelectItem value="dns">DNS Records</SelectItem>
                  <SelectItem value="whois">WHOIS Data</SelectItem>
                  <SelectItem value="http">HTTP Headers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => doLookup("/api/atropos/lookup/free", { target: freeTarget, service: freeService }, setFreeResult, setFreeLoading, "Free Lookup")}
            disabled={freeLoading || !freeTarget.trim()}
            className="w-full bg-amber-700 hover:bg-amber-600 text-black"
            data-testid="button-free-lookup"
          >
            {freeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Globe className="w-4 h-4 mr-2" /> Run Lookup</>}
          </Button>
          {renderResult(freeResult, "free")}
        </CardContent>
      </Card>
    </div>
  );
}

function ToolsTab() {
  const [fridaStatus, setFridaStatus] = useState<any>(null);
  const [fridaLoading, setFridaLoading] = useState(false);
  const [fridaScriptType, setFridaScriptType] = useState("ssl_bypass");
  const [fridaTarget, setFridaTarget] = useState("");
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const checkFrida = async () => {
    setFridaLoading(true);
    try {
      const res = await fetch("/api/atropos/frida/status");
      const data = await res.json();
      setFridaStatus(data);
    } catch {
      toast({ title: "Error", description: "Failed to check Frida status", variant: "destructive" });
    } finally {
      setFridaLoading(false);
    }
  };

  const generateFridaScript = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/atropos/frida/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptType: fridaScriptType, target: fridaTarget })
      });
      const data = await res.json();
      setGeneratedScript(data);
      toast({ title: "Script Generated", description: data.name || "Frida script ready" });
    } catch {
      toast({ title: "Error", description: "Failed to generate script", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { checkFrida(); }, []);

  const tools = [
    {
      id: "frida",
      name: "Frida Toolkit",
      icon: <Bug className="w-5 h-5" />,
      lang: "JavaScript",
      status: fridaStatus?.installed ? "active" : "simulated",
      statusColor: fridaStatus?.installed ? "text-teal-400 bg-teal-500/20" : "text-amber-400 bg-amber-500/20",
      description: "Dynamic instrumentation for hooking live processes, tracing API calls, and bypassing protections.",
      howToUse: [
        "1. Choose a script type below (SSL bypass, crypto trace, etc.)",
        "2. Optionally enter a target app name",
        "3. Click 'Generate Script' to get ready-to-use Frida JS",
        "4. Copy the script and run with: frida -l script.js <target>"
      ],
      color: "text-teal-400 border-teal-500/30 bg-teal-500/10",
      navTarget: "/wiki"
    },
    {
      id: "lua",
      name: "Lua Scanner Scripts",
      icon: <Code2 className="w-5 h-5" />,
      lang: "Lua",
      status: "active",
      statusColor: "text-teal-400 bg-teal-500/20",
      description: "Core scanner logic. Write custom OSINT & vulnerability checks that run on the Rust back-end.",
      howToUse: [
        "1. Go to the 'Scripts' tab above",
        "2. Click 'Templates' to start from a preset, or 'New Script'",
        "3. Write Lua code using atropos.emit() and atropos.http.get()",
        "4. Click 'Save' - your script is instantly available in Live Scan"
      ],
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      navTarget: "scripts"
    },
    {
      id: "api",
      name: "API Lookups",
      icon: <RefreshCw className="w-5 h-5" />,
      lang: "JSON",
      status: "active",
      statusColor: "text-teal-400 bg-teal-500/20",
      description: "Query VirusTotal, Hybrid Analysis, DNS, WHOIS, and HTTP headers from one place.",
      howToUse: [
        "1. Go to the 'API Data' tab above",
        "2. Enter a domain, IP, hash, or URL as your target",
        "3. Choose the lookup service (VT, HA, or free DNS/WHOIS)",
        "4. Results appear inline - no external tools needed"
      ],
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      navTarget: "lookups"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.id} className="bg-stone-950/80 border-stone-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 w-max rounded-lg ${tool.color}`}>
                  {tool.icon}
                </div>
                <Badge className={`text-[10px] ${tool.statusColor}`}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {tool.status === "active" ? "Built-in" : "Simulated"}
                </Badge>
              </div>
              <CardTitle className="text-stone-100 flex items-center justify-between">
                {tool.name}
                <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-500">{tool.lang}</Badge>
              </CardTitle>
              <CardDescription className="text-stone-500 text-xs">{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest text-stone-500">How to Use</Label>
                <div className="space-y-1">
                  {tool.howToUse.map((step, i) => (
                    <p key={i} className="text-[11px] text-stone-400 leading-relaxed">{step}</p>
                  ))}
                </div>
              </div>
              {tool.navTarget.startsWith("/") ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-stone-800 text-stone-400 hover:text-amber-400 h-8 text-[11px]"
                  onClick={() => window.location.href = tool.navTarget}
                  data-testid={`btn-nav-${tool.id}`}
                >
                  View Wiki Docs <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-stone-800 text-stone-400 hover:text-amber-400 h-8 text-[11px]"
                  onClick={() => {
                    const tabEl = document.querySelector(`[data-testid="tab-${tool.navTarget}"]`) as HTMLElement;
                    if (tabEl) tabEl.click();
                  }}
                  data-testid={`btn-nav-${tool.id}`}
                >
                  Go to {tool.navTarget === "scripts" ? "Scripts" : "API Data"} Tab <ChevronRight className="w-3 h-3 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-amber-400 flex items-center gap-2 text-sm">
              <Bug className="w-4 h-4" /> Frida Script Generator
            </CardTitle>
            {fridaStatus && (
              <Badge variant="outline" className={`text-[10px] ${fridaStatus.installed ? 'border-teal-700 text-teal-400' : 'border-amber-700 text-amber-400'}`}>
                {fridaStatus.installed ? `v${fridaStatus.version}` : 'Simulated Mode'}
              </Badge>
            )}
          </div>
          <CardDescription className="text-stone-500 text-xs">Generate ready-to-use Frida instrumentation scripts for common security tasks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1 space-y-1">
              <Label className="text-stone-300 text-xs">Script Type</Label>
              <Select value={fridaScriptType} onValueChange={setFridaScriptType}>
                <SelectTrigger className="bg-stone-900/60 border-stone-800 text-stone-200" data-testid="select-frida-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ssl_bypass">SSL Pinning Bypass</SelectItem>
                  <SelectItem value="crypto_trace">Crypto API Tracer</SelectItem>
                  <SelectItem value="network_monitor">Network Monitor</SelectItem>
                  <SelectItem value="root_detect">Root Detection Bypass</SelectItem>
                  <SelectItem value="keystore_dump">Keystore Dumper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1 space-y-1">
              <Label className="text-stone-300 text-xs">Target App (optional)</Label>
              <Input
                placeholder="com.example.app"
                value={fridaTarget}
                onChange={(e) => setFridaTarget(e.target.value)}
                className="bg-stone-900/60 border-stone-800 text-stone-200"
                data-testid="input-frida-target"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={generateFridaScript}
                disabled={generating}
                className="w-full bg-teal-700 hover:bg-teal-600 text-black font-bold"
                data-testid="btn-generate-frida"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Code2 className="w-4 h-4 mr-2" /> Generate Script</>}
              </Button>
            </div>
          </div>

          {generatedScript && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-amber-400 text-xs font-bold">{generatedScript.name}</Label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-stone-500 hover:text-amber-400"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedScript.code);
                      toast({ title: "Copied", description: "Frida script copied to clipboard" });
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-stone-500 hover:text-amber-400"
                    onClick={() => {
                      const blob = new Blob([generatedScript.code], { type: "text/javascript" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `frida_${fridaScriptType}.js`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {generatedScript.description && (
                <p className="text-[11px] text-stone-500">{generatedScript.description}</p>
              )}
              <ScrollArea className="h-64 rounded-lg border border-stone-800 bg-stone-900/40">
                <pre className="p-3 text-xs font-mono text-teal-400/80 whitespace-pre-wrap">{generatedScript.code}</pre>
              </ScrollArea>
              {generatedScript.usage && (
                <div className="p-2 rounded bg-stone-900 border border-stone-800 font-mono text-[10px] text-amber-500/80">
                  $ {generatedScript.usage}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScanHistoryTab() {
  const { data: results = [] } = useQuery<ScanResult[]>({
    queryKey: ['/api/atropos/scan-history'],
    queryFn: () => fetch('/api/atropos/scan-history').then(r => r.json()),
  });

  return (
    <div className="space-y-4">
      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-400 flex items-center gap-2 text-sm uppercase tracking-widest font-orbitron">
            <Terminal className="w-4 h-4" /> RECENT SCAN OPERATIONS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {results.length === 0 ? (
              <div className="text-center py-20 text-stone-600 space-y-3">
                <Radar className="w-10 h-10 mx-auto text-stone-800" />
                <p className="text-xs uppercase tracking-widest">No operation logs detected</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-900">
                {results.map((r) => (
                  <div key={r.id} className="p-4 hover:bg-stone-900/40 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-amber-500 font-bold">{r.target}</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-stone-700 text-stone-500 uppercase tracking-tighter">
                            {r.scanType}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-stone-500 font-mono">ID: {r.id} · {new Date(r.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge className={`text-[10px] shrink-0 ${SEVERITY_COLORS[r.summary.riskLevel] || ""}`}>
                        RISK: {r.summary.riskLevel.toUpperCase()} ({r.summary.riskScore})
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[10px] text-stone-600 font-medium">
                      <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {r.summary.subdomains} Subdomains</span>
                      <span className="flex items-center gap-1.5"><Target className="w-3 h-3" /> {r.summary.openPorts} Ports</span>
                      <span className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> {r.summary.vulnerabilities} Vulns</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function OsintToolkitTab() {
  const { addToolOutput, addPendingFinding, addTarget } = useReportContext();
  const [iocInput, setIocInput] = useState("");
  const [iocResult, setIocResult] = useState<any>(null);
  const [iocLoading, setIocLoading] = useState(false);
  const [reconTarget, setReconTarget] = useState("");
  const [reconResult, setReconResult] = useState<any>(null);
  const [reconLoading, setReconLoading] = useState(false);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [extractingIoc, setExtractingIoc] = useState<string | null>(null);
  const [extractedIocs, setExtractedIocs] = useState<Record<string, any>>({}); 
  const [defangInput, setDefangInput] = useState("");
  const [defangMode, setDefangMode] = useState<"defang" | "refang">("defang");
  const [defangResult, setDefangResult] = useState("");
  const [defangLoading, setDefangLoading] = useState(false);

  const detectIocType = (value: string): string => {
    if (!value) return "unknown";
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return "ip";
    if (/^[a-f0-9]{32,64}$/i.test(value)) return "hash";
    if (/^CVE-\d{4}-\d+$/i.test(value)) return "cve";
    if (/^https?:\/\//i.test(value)) return "url";
    if (/@/.test(value)) return "email";
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return "domain";
    return "unknown";
  };

  const iocType = detectIocType(iocInput.trim());

  const IOC_TYPE_COLORS: Record<string, string> = {
    ip: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    domain: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    hash: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    url: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    email: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    cve: "bg-red-500/20 text-red-400 border-red-500/30",
    unknown: "bg-stone-500/20 text-stone-400 border-stone-500/30",
  };

  const analyzeIoc = async () => {
    if (!iocInput.trim()) return;
    setIocLoading(true);
    setIocResult(null);
    try {
      const res = await fetch(`/api/atropos/osint/ioc/lookup?ioc=${encodeURIComponent(iocInput.trim())}`);
      if (!res.ok) throw new Error("IOC lookup failed");
      const data = await res.json();
      setIocResult(data);
      toast({ title: "IOC Analysis Complete", description: `Analyzed ${iocType}: ${iocInput.trim()}` });
    } catch {
      toast({ title: "Analysis Error", description: "Failed to analyze IOC", variant: "destructive" });
    } finally {
      setIocLoading(false);
    }
  };

  const sendIocToReport = () => {
    if (!iocResult) return;
    addToolOutput({
      type: 'scan',
      source: 'osint-toolkit',
      content: `IOC Analysis on ${iocInput}: ${JSON.stringify(iocResult).substring(0, 500)}`,
      metadata: { iocType, target: iocInput }
    });
    toast({ title: "Sent to Report", description: "IOC analysis added to report builder" });
  };

  const analyzeInNexus = (data: any) => {
    const encoded = encodeURIComponent(JSON.stringify(data));
    window.location.href = `/agents?scanData=${encoded}`;
  };

  const addIocToPortfolio = async () => {
    if (!iocResult) return;
    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'investigation', title: `OSINT: ${iocInput}`, content: JSON.stringify(iocResult), tags: ['osint', 'recon'] })
      });
      toast({ title: "Added to Portfolio", description: `IOC investigation saved` });
    } catch {
      toast({ title: "Error", description: "Failed to add to portfolio", variant: "destructive" });
    }
  };

  const runDomainRecon = async () => {
    if (!reconTarget.trim()) return;
    setReconLoading(true);
    setReconResult(null);
    try {
      const res = await fetch("/api/atropos/osint/scan/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: reconTarget.trim(), scanType: "domain_recon" })
      });
      if (!res.ok) throw new Error("Domain recon failed");
      const data = await res.json();
      setReconResult(data);
      addToolOutput({
        type: 'scan',
        source: 'osint-toolkit',
        content: `OSINT scan on ${reconTarget}: ${data.findings?.length || 0} findings`,
        metadata: { scanId: data.id, target: reconTarget }
      });
      toast({ title: "Recon Complete", description: `${data.findings?.length || 0} findings on ${reconTarget}` });
    } catch {
      toast({ title: "Recon Error", description: "Failed to run domain recon", variant: "destructive" });
    } finally {
      setReconLoading(false);
    }
  };

  useEffect(() => {
    setNewsLoading(true);
    fetch("/api/atropos/osint/newsfeed")
      .then(r => r.ok ? r.json() : [])
      .then(data => setNewsArticles(Array.isArray(data) ? data : []))
      .catch(() => setNewsArticles([]))
      .finally(() => setNewsLoading(false));
  }, []);

  const extractArticleIocs = async (articleId: string, text: string) => {
    setExtractingIoc(articleId);
    try {
      const res = await fetch("/api/atropos/osint/ioc/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error("Extract failed");
      const data = await res.json();
      setExtractedIocs(prev => ({ ...prev, [articleId]: data }));
      toast({ title: "IOCs Extracted", description: `Found indicators in article` });
    } catch {
      toast({ title: "Extraction Error", description: "Failed to extract IOCs", variant: "destructive" });
    } finally {
      setExtractingIoc(null);
    }
  };

  const runDefang = async () => {
    if (!defangInput.trim()) return;
    setDefangLoading(true);
    setDefangResult("");
    try {
      const res = await fetch(`/api/atropos/osint/${defangMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: defangInput.trim() })
      });
      if (!res.ok) throw new Error("Operation failed");
      const data = await res.json();
      setDefangResult(data.result || data.text || "");
      toast({ title: defangMode === "defang" ? "Defanged" : "Refanged", description: "Text processed successfully" });
    } catch {
      toast({ title: "Error", description: `Failed to ${defangMode}`, variant: "destructive" });
    } finally {
      setDefangLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-400 flex items-center gap-2">
            <Search className="w-5 h-5" /> IOC Analyzer
          </CardTitle>
          <CardDescription className="text-stone-400">Analyze any Indicator of Compromise — IP, domain, hash, URL, email, or CVE</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Enter IOC: 8.8.8.8 / example.com / CVE-2024-1234 / hash..."
                value={iocInput}
                onChange={(e) => setIocInput(e.target.value)}
                className="bg-stone-900/60 border-stone-800 text-stone-200 placeholder:text-stone-600 pr-20"
                data-testid="input-ioc"
                onKeyDown={(e) => e.key === 'Enter' && analyzeIoc()}
              />
              {iocInput.trim() && (
                <Badge variant="outline" className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] ${IOC_TYPE_COLORS[iocType]}`} data-testid="badge-ioc-type">
                  {iocType.toUpperCase()}
                </Badge>
              )}
            </div>
            <Button
              onClick={analyzeIoc}
              disabled={iocLoading || !iocInput.trim()}
              className="bg-amber-700 hover:bg-amber-600 text-black font-bold"
              data-testid="button-analyze-ioc"
            >
              {iocLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-1" /> Analyze</>}
            </Button>
          </div>

          {iocResult && (
            <div className="space-y-3" data-testid="ioc-results">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {iocResult.dns && (
                  <div className="bg-stone-900/60 rounded-lg p-3 border border-stone-800">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> DNS</div>
                    <pre className="text-[11px] text-stone-300 whitespace-pre-wrap break-all">{typeof iocResult.dns === 'string' ? iocResult.dns : JSON.stringify(iocResult.dns, null, 2)}</pre>
                  </div>
                )}
                {iocResult.whois && (
                  <div className="bg-stone-900/60 rounded-lg p-3 border border-stone-800">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> WHOIS</div>
                    <pre className="text-[11px] text-stone-300 whitespace-pre-wrap break-all">{typeof iocResult.whois === 'string' ? iocResult.whois : JSON.stringify(iocResult.whois, null, 2)}</pre>
                  </div>
                )}
                {iocResult.headers && (
                  <div className="bg-stone-900/60 rounded-lg p-3 border border-stone-800">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileCode className="w-3.5 h-3.5" /> Headers</div>
                    <pre className="text-[11px] text-stone-300 whitespace-pre-wrap break-all">{typeof iocResult.headers === 'string' ? iocResult.headers : JSON.stringify(iocResult.headers, null, 2)}</pre>
                  </div>
                )}
                {iocResult.ssl && (
                  <div className="bg-stone-900/60 rounded-lg p-3 border border-stone-800">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> SSL</div>
                    <pre className="text-[11px] text-stone-300 whitespace-pre-wrap break-all">{typeof iocResult.ssl === 'string' ? iocResult.ssl : JSON.stringify(iocResult.ssl, null, 2)}</pre>
                  </div>
                )}
                {iocResult.certTransparency && (
                  <div className="bg-stone-900/60 rounded-lg p-3 border border-stone-800">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Radar className="w-3.5 h-3.5" /> Cert Transparency</div>
                    <pre className="text-[11px] text-stone-300 whitespace-pre-wrap break-all">{typeof iocResult.certTransparency === 'string' ? iocResult.certTransparency : JSON.stringify(iocResult.certTransparency, null, 2)}</pre>
                  </div>
                )}
                {iocResult.ports && (
                  <div className="bg-stone-900/60 rounded-lg p-3 border border-stone-800">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Ports</div>
                    <pre className="text-[11px] text-stone-300 whitespace-pre-wrap break-all">{typeof iocResult.ports === 'string' ? iocResult.ports : JSON.stringify(iocResult.ports, null, 2)}</pre>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="border-amber-700 text-amber-400 hover:bg-amber-900/30" onClick={sendIocToReport} data-testid="button-ioc-to-report">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Send to Report
                </Button>
                <Button size="sm" variant="outline" className="border-teal-700 text-teal-400 hover:bg-teal-900/30" onClick={() => analyzeInNexus(iocResult)} data-testid="button-ioc-to-nexus">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Analyze in NEXUS
                </Button>
                <Button size="sm" variant="outline" className="border-purple-700 text-purple-400 hover:bg-purple-900/30" onClick={addIocToPortfolio} data-testid="button-ioc-to-portfolio">
                  <Tag className="w-3.5 h-3.5 mr-1.5" /> Add to Portfolio
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-400 flex items-center gap-2">
            <Radar className="w-5 h-5" /> Live Domain Recon
          </CardTitle>
          <CardDescription className="text-stone-400">Full reconnaissance scan on a target domain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter target domain: example.com"
              value={reconTarget}
              onChange={(e) => setReconTarget(e.target.value)}
              className="bg-stone-900/60 border-stone-800 text-stone-200 placeholder:text-stone-600"
              data-testid="input-recon-target"
              onKeyDown={(e) => e.key === 'Enter' && runDomainRecon()}
            />
            <Button
              onClick={runDomainRecon}
              disabled={reconLoading || !reconTarget.trim()}
              className="bg-amber-700 hover:bg-amber-600 text-black font-bold"
              data-testid="button-full-recon"
            >
              {reconLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Radar className="w-4 h-4 mr-1" /> Full Recon</>}
            </Button>
          </div>

          {reconResult && (
            <div className="space-y-3" data-testid="recon-results">
              {reconResult.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Subdomains", value: reconResult.summary.subdomains || 0, color: "text-amber-300" },
                    { label: "Open Ports", value: reconResult.summary.openPorts || 0, color: "text-teal-300" },
                    { label: "Technologies", value: reconResult.summary.technologies || 0, color: "text-blue-300" },
                    { label: "Vulnerabilities", value: reconResult.summary.vulnerabilities || 0, color: "text-red-300" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-stone-900/60 rounded-lg p-2">
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-stone-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {reconResult.findings && reconResult.findings.length > 0 && (
                <ScrollArea className="h-48 rounded-lg border border-stone-800 bg-stone-900/40 p-3">
                  <div className="space-y-2">
                    {reconResult.findings.slice(0, 50).map((f: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm" data-testid={`recon-finding-${idx}`}>
                        <Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[f.severity || "info"]}`}>
                          {f.type}
                        </Badge>
                        <span className="text-stone-300 truncate flex-1">{f.value}</span>
                        {f.source && <span className="text-stone-600 text-xs">{f.source}</span>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="border-amber-700 text-amber-400 hover:bg-amber-900/30" onClick={() => {
                  addToolOutput({
                    type: 'scan',
                    source: 'osint-toolkit',
                    content: `Domain recon on ${reconTarget}: ${reconResult.findings?.length || 0} findings`,
                    metadata: { scanId: reconResult.id, target: reconTarget }
                  });
                  toast({ title: "Exported to Report", description: "Recon results added to report builder" });
                }} data-testid="button-recon-to-report">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Export to Report
                </Button>
                <Button size="sm" variant="outline" className="border-teal-700 text-teal-400 hover:bg-teal-900/30" onClick={() => analyzeInNexus(reconResult)} data-testid="button-recon-to-nexus">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Load into NEXUS
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-400 flex items-center gap-2">
            <Newspaper className="w-5 h-5" /> Cybersecurity Newsfeed
          </CardTitle>
          <CardDescription className="text-stone-400">Latest cybersecurity news with IOC extraction</CardDescription>
        </CardHeader>
        <CardContent>
          {newsLoading ? (
            <div className="flex items-center justify-center py-8 text-stone-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading newsfeed...
            </div>
          ) : newsArticles.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-sm">No articles available</div>
          ) : (
            <ScrollArea className="h-80">
              <div className="space-y-3 pr-3">
                {newsArticles.map((article: any, idx: number) => (
                  <div key={article.id || idx} className="bg-stone-900/60 rounded-lg p-3 border border-stone-800" data-testid={`news-article-${idx}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-stone-200 leading-tight flex-1">{article.title}</h4>
                      {article.source && (
                        <Badge variant="outline" className="text-[9px] shrink-0 bg-blue-500/10 text-blue-400 border-blue-500/30">{article.source}</Badge>
                      )}
                    </div>
                    {article.published && (
                      <div className="text-[10px] text-stone-600 mb-1.5">{new Date(article.published).toLocaleDateString()}</div>
                    )}
                    {article.summary && (
                      <p className="text-xs text-stone-400 leading-relaxed mb-2 line-clamp-3">{article.summary}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] text-amber-400 hover:bg-amber-900/20 px-2"
                        onClick={() => extractArticleIocs(article.id || String(idx), article.summary || article.title)}
                        disabled={extractingIoc === (article.id || String(idx))}
                        data-testid={`button-extract-iocs-${idx}`}
                      >
                        {extractingIoc === (article.id || String(idx)) ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Search className="w-3 h-3 mr-1" />}
                        Extract IOCs
                      </Button>
                      {article.url && (
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-300 transition-colors" data-testid={`link-article-${idx}`}>
                          <ExternalLink className="w-3 h-3" /> Source
                        </a>
                      )}
                    </div>
                    {extractedIocs[article.id || String(idx)] && (
                      <div className="mt-2 p-2 rounded bg-stone-800/50 border border-stone-700">
                        <div className="text-[10px] font-bold text-amber-400 mb-1">Extracted IOCs:</div>
                        <pre className="text-[10px] text-stone-300 whitespace-pre-wrap break-all">{JSON.stringify(extractedIocs[article.id || String(idx)], null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-400 flex items-center gap-2">
            <Shield className="w-5 h-5" /> IOC Defanger / Refanger
          </CardTitle>
          <CardDescription className="text-stone-400">Safely defang or refang indicators for sharing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={defangMode === "defang" ? "Enter IOC to defang: http://evil.com" : "Enter defanged IOC: hxxp://evil[.]com"}
              value={defangInput}
              onChange={(e) => setDefangInput(e.target.value)}
              className="bg-stone-900/60 border-stone-800 text-stone-200 placeholder:text-stone-600 flex-1"
              data-testid="input-defang"
              onKeyDown={(e) => e.key === 'Enter' && runDefang()}
            />
            <Button
              size="sm"
              variant="outline"
              className={`border-stone-700 text-stone-300 min-w-[90px] ${defangMode === "defang" ? "bg-amber-900/20 border-amber-700 text-amber-400" : "bg-teal-900/20 border-teal-700 text-teal-400"}`}
              onClick={() => setDefangMode(defangMode === "defang" ? "refang" : "defang")}
              data-testid="button-toggle-defang-mode"
            >
              {defangMode === "defang" ? "Defang" : "Refang"}
            </Button>
            <Button
              onClick={runDefang}
              disabled={defangLoading || !defangInput.trim()}
              className="bg-amber-700 hover:bg-amber-600 text-black font-bold"
              data-testid="button-run-defang"
            >
              {defangLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 mr-1" /> Go</>}
            </Button>
          </div>
          {defangResult && (
            <div className="flex items-center gap-2 bg-stone-900/60 rounded-lg p-3 border border-stone-800" data-testid="defang-result">
              <code className="text-sm text-stone-200 flex-1 break-all font-mono">{defangResult}</code>
              <Button size="sm" variant="ghost" className="text-stone-400 hover:text-amber-400 shrink-0" onClick={() => copyToClipboard(defangResult)} data-testid="button-copy-defang">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ScannerContentProps {
  injectedTargets?: string[];
}

export function ScannerContent({ injectedTargets }: ScannerContentProps = {}) {
  return (
    <div className="flex flex-col h-full min-h-0 bg-stone-950 border border-stone-800 rounded-xl overflow-hidden shadow-2xl shadow-amber-900/10">
      <div className="p-4 md:p-6 border-b border-stone-800 bg-stone-900/30 shrink-0">
        <h1 className="text-xl md:text-2xl font-bold font-orbitron tracking-tighter text-amber-500 flex items-center gap-3">
          <Shield className="w-6 h-6 md:w-8 h-8 text-amber-600" /> ATROPOS ADMIN TERMINAL
        </h1>
        <p className="text-[10px] md:text-xs text-stone-500 mt-1 uppercase tracking-widest font-medium">Scanner Management & Script Development Environment</p>
      </div>

      <Tabs defaultValue="scripts" className="w-full flex-1 flex flex-col min-h-0">
        <div className="px-4 md:px-6 py-2 bg-stone-900/50 border-b border-stone-800 shrink-0 overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent border-0 gap-4 md:gap-6 h-12 p-0 w-max" data-testid="scanner-tabs">
            <TabsTrigger value="scripts" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-400 rounded-none px-0 h-full font-orbitron text-[10px] md:text-[11px] tracking-widest uppercase whitespace-nowrap" data-testid="tab-scripts">
              <FileCode className="w-4 h-4 mr-2" /> Scripts
            </TabsTrigger>
            <TabsTrigger value="scan" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-400 rounded-none px-0 h-full font-orbitron text-[10px] md:text-[11px] tracking-widest uppercase whitespace-nowrap" data-testid="tab-scan">
              <Play className="w-4 h-4 mr-2" /> Live Scan
            </TabsTrigger>
            <TabsTrigger value="tools" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-400 rounded-none px-0 h-full font-orbitron text-[10px] md:text-[11px] tracking-widest uppercase whitespace-nowrap" data-testid="tab-tools">
              <Zap className="w-4 h-4 mr-2" /> Toolkit
            </TabsTrigger>
            <TabsTrigger value="lookups" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-400 rounded-none px-0 h-full font-orbitron text-[10px] md:text-[11px] tracking-widest uppercase whitespace-nowrap" data-testid="tab-lookups">
              <Globe className="w-4 h-4 mr-2" /> API Data
            </TabsTrigger>
            <TabsTrigger value="history" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-400 rounded-none px-0 h-full font-orbitron text-[10px] md:text-[11px] tracking-widest uppercase whitespace-nowrap" data-testid="tab-history">
              <Terminal className="w-4 h-4 mr-2" /> Logs
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 bg-stone-950/50">
          <div className="p-4 md:p-6 pb-24 md:pb-6">
            <TabsContent value="scripts" className="mt-0 focus-visible:outline-none"><LuaScriptsTab /></TabsContent>
            <TabsContent value="scan" className="mt-0 focus-visible:outline-none"><ScanTab injectedTargets={injectedTargets} /></TabsContent>
            <TabsContent value="tools" className="mt-0 focus-visible:outline-none"><ToolsTab /></TabsContent>
            <TabsContent value="lookups" className="mt-0 focus-visible:outline-none"><ApiLookupsTab /></TabsContent>
            <TabsContent value="history" className="mt-0 focus-visible:outline-none"><ScanHistoryTab /></TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

export default function ScannerDashboard() {
  return (
    <div className="fixed inset-0 bg-stone-950 p-2 md:p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full">
        <ScannerContent />
      </div>
    </div>
  );
}
