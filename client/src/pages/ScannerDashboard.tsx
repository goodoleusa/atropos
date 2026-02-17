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
  const tools = [
    {
      id: "frida",
      name: "Frida Toolkit",
      icon: <Bug className="w-5 h-5" />,
      lang: "JavaScript",
      description: "Dynamic instrumentation toolkit for developers and security researchers.",
      usage: "Inject scripts into live processes to hook functions, trace instructions, and modify behavior.",
      commands: [
        "frida -p <pid> -l script.js",
        "frida-ps -U",
        "frida-trace -i \"recv*\" <process>"
      ],
      color: "text-teal-400 border-teal-500/30 bg-teal-500/10"
    },
    {
      id: "lua",
      name: "Lua Scripting",
      icon: <Code2 className="w-5 h-5" />,
      lang: "Lua",
      description: "High-performance scripting for scanner logic and data processing.",
      usage: "Write custom scanner modules using the Lua API for rapid extension of Atropos capabilities.",
      commands: [
        "atropos --script-file my_recon.lua",
        "atropos.emit(finding_data)",
        "atropos.http.get(url)"
      ],
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10"
    },
    {
      id: "api",
      name: "API Integration",
      icon: <RefreshCw className="w-5 h-5" />,
      lang: "JSON",
      description: "External data source connectors and API data enrichment.",
      usage: "Connect Atropos to third-party services like VirusTotal, Shodan, and Hybrid Analysis.",
      commands: [
        "POST /api/atropos/lookup/vt",
        "GET /api/atropos/scripts",
        "POST /api/atropos/scan"
      ],
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tools.map((tool) => (
        <Card key={tool.id} className="bg-stone-950/80 border-stone-800">
          <CardHeader className="pb-3">
            <div className={`p-2 w-max rounded-lg mb-2 ${tool.color}`}>
              {tool.icon}
            </div>
            <CardTitle className="text-stone-100 flex items-center justify-between">
              {tool.name}
              <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-500">{tool.lang}</Badge>
            </CardTitle>
            <CardDescription className="text-stone-500 text-xs">{tool.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-stone-500">Usage Case</Label>
              <p className="text-[11px] text-stone-300 leading-relaxed">{tool.usage}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-stone-500">Common Commands</Label>
              <div className="p-2 rounded bg-stone-900 border border-stone-800 font-mono text-[10px] text-amber-500/80 space-y-1">
                {tool.commands.map((cmd, i) => (
                  <div key={i}>$ {cmd}</div>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-stone-800 text-stone-400 hover:text-amber-400 h-8 text-[11px]">
              Open Documentation <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
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
