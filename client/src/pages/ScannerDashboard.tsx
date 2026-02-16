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
  FileCode, Key, RefreshCw, ExternalLink, AlertTriangle, CheckCircle2
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

function ScanTab() {
  const { addToolOutput } = useReportContext();
  const [target, setTarget] = useState("");
  const [selectedScript, setSelectedScript] = useState("bbot_scanner");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

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
      setScanResult(result);
      addToolOutput({
        type: 'scan',
        source: 'atropos',
        content: `Scan completed on ${result.target}: ${result.summary.vulnerabilities} vulnerabilities, risk ${result.summary.riskScore}/100`,
        metadata: { scanId: result.id, target: result.target }
      });
      toast({ title: "Scan Complete", description: `Found ${result.findings.length} findings — Risk: ${result.summary.riskLevel.toUpperCase()}` });
    } catch {
      toast({ title: "Scan Error", description: "Failed to run scan", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const analyzeWithNexus = async () => {
    if (!scanResult) return;
    try {
      const res = await fetch(`/api/atropos/results/${scanResult.id}/analyze`, { method: "POST" });
      if (res.ok) {
        toast({ title: "Sent to NEXUS", description: "Scan results ready for AI analysis" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to prepare analysis", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-stone-950/80 border-stone-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-amber-400 flex items-center gap-2">
            <Radar className="w-5 h-5" /> Run Scan
          </CardTitle>
          <CardDescription className="text-stone-400">Enter a target and select a scan script</CardDescription>
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
                <SelectContent>
                  {scripts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
              </CardTitle>
              <Badge className={SEVERITY_COLORS[scanResult.summary.riskLevel] || SEVERITY_COLORS.info}>
                Risk: {scanResult.summary.riskLevel.toUpperCase()} ({scanResult.summary.riskScore}/100)
              </Badge>
            </div>
            <CardDescription className="text-stone-400">
              {scanResult.target} · {scanResult.scanType} · {new Date(scanResult.timestamp).toLocaleString()}
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
                {scanResult.findings.slice(0, 30).map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm" data-testid={`finding-${idx}`}>
                    <Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[f.severity || "info"]}`}>
                      {f.type}
                    </Badge>
                    <span className="text-stone-300 truncate flex-1">{f.value}</span>
                    {f.source && <span className="text-stone-600 text-xs">{f.source}</span>}
                  </div>
                ))}
                {scanResult.findings.length > 30 && (
                  <div className="text-xs text-stone-500 text-center pt-2">+{scanResult.findings.length - 30} more findings…</div>
                )}
              </div>
            </ScrollArea>

            <Button
              onClick={analyzeWithNexus}
              className="w-full bg-gradient-to-r from-amber-700 to-teal-700 hover:from-amber-600 hover:to-teal-600 text-black font-bold"
              data-testid="button-analyze-nexus"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Analyze with NEXUS
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LuaScriptsTab() {
  const queryClient = useQueryClient();
  const [selectedScript, setSelectedScript] = useState<LuaScript | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFilename, setNewFilename] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: luaScripts = [], isLoading } = useQuery<LuaScript[]>({
    queryKey: ['/api/atropos/lua-scripts'],
    queryFn: () => fetch('/api/atropos/lua-scripts').then(r => r.json()),
  });

  const { data: lotusCategories } = useQuery({
    queryKey: ['/api/atropos/lotus-scripts-categories'],
    queryFn: () => fetch('/api/atropos/lotus-scripts-categories').then(r => r.ok ? r.json() : []),
  });

  const filteredScripts = categoryFilter === "all"
    ? luaScripts
    : luaScripts.filter((s) => s.category === categoryFilter);

  const selectScript = (s: LuaScript) => {
    setSelectedScript(s);
    setEditContent(s.content);
    setIsEditing(false);
    setShowNewForm(false);
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
        body: JSON.stringify({ filename: fname, content: newContent })
      });
      if (!res.ok) throw new Error("Create failed");
      toast({ title: "Script Created", description: `${fname} added` });
      setShowNewForm(false);
      setNewFilename("");
      setNewContent("");
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={categoryFilter === "all" ? "default" : "outline"}
          className={`cursor-pointer ${categoryFilter === "all" ? "bg-amber-700 text-black" : "border-stone-700 text-stone-400 hover:border-amber-700"}`}
          onClick={() => setCategoryFilter("all")}
          data-testid="filter-all"
        >All</Badge>
        {CATEGORY_LIST.map((cat) => (
          <Badge
            key={cat}
            variant={categoryFilter === cat ? "default" : "outline"}
            className={`cursor-pointer ${categoryFilter === cat ? "bg-amber-700 text-black" : "border-stone-700 text-stone-400 hover:border-amber-700"}`}
            onClick={() => setCategoryFilter(cat)}
            data-testid={`filter-${cat}`}
          >{cat.replace(/_/g, " ")}</Badge>
        ))}
        <Button
          size="sm"
          className="ml-auto bg-teal-700 hover:bg-teal-600 text-black"
          onClick={() => { setShowNewForm(true); setSelectedScript(null); }}
          data-testid="button-add-script"
        >
          <Plus className="w-4 h-4 mr-1" /> Add New Script
        </Button>
      </div>

      {lotusCategories && Array.isArray(lotusCategories) && lotusCategories.length > 0 && (
        <div className="text-xs text-stone-500">
          <span className="text-stone-400 font-semibold">Lotus categories:</span>{" "}
          {lotusCategories.map((c: any) => typeof c === 'string' ? c : c.name || c.category).join(", ")}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-stone-950/80 border-stone-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
              <FileCode className="w-4 h-4" /> Scripts ({filteredScripts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                </div>
              ) : filteredScripts.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-sm">No scripts found</div>
              ) : (
                <div className="divide-y divide-stone-800/50">
                  {filteredScripts.map((s) => (
                    <div
                      key={s.filename}
                      className={`px-4 py-3 cursor-pointer hover:bg-stone-900/60 transition-colors ${selectedScript?.filename === s.filename ? "bg-stone-900/80 border-l-2 border-amber-500" : ""}`}
                      onClick={() => selectScript(s)}
                      data-testid={`script-item-${s.filename}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-stone-200 truncate">{s.name}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-500">{s.category}</Badge>
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
                      <p className="text-xs text-stone-500 truncate mt-0.5">{s.description}</p>
                      <div className="text-[10px] text-stone-600 mt-1">{(s.size / 1024).toFixed(1)} KB · {new Date(s.modified).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-stone-950/80 border-stone-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-400 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4" /> {showNewForm ? "New Script" : selectedScript ? selectedScript.name : "Editor"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {showNewForm ? (
              <>
                <div className="space-y-2">
                  <Label className="text-stone-300">Filename</Label>
                  <Input
                    placeholder="my_script.lua"
                    value={newFilename}
                    onChange={(e) => setNewFilename(e.target.value)}
                    className="bg-stone-900/60 border-stone-800 text-stone-200"
                    data-testid="input-new-filename"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-stone-300">Content</Label>
                  <Textarea
                    placeholder="-- Your Lua script here"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="bg-stone-900/60 border-stone-800 text-stone-200 font-mono text-sm h-64"
                    data-testid="textarea-new-content"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createScript} disabled={isSaving} className="flex-1 bg-teal-700 hover:bg-teal-600 text-black" data-testid="button-create-script">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Create</>}
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewForm(false)} className="border-stone-700 text-stone-400" data-testid="button-cancel-new">Cancel</Button>
                </div>
              </>
            ) : selectedScript ? (
              <>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  readOnly={!isEditing}
                  className={`bg-stone-900/60 border-stone-800 text-stone-200 font-mono text-sm h-72 ${!isEditing ? "opacity-80" : ""}`}
                  data-testid="textarea-script-editor"
                />
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={saveEdit} disabled={isSaving} className="flex-1 bg-amber-700 hover:bg-amber-600 text-black" data-testid="button-save-script">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" /> Save</>}
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
              <div className="flex items-center justify-center h-72 text-stone-600 text-sm">Select a script or create a new one</div>
            )}
          </CardContent>
        </Card>
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
          <TabsList className="grid w-full grid-cols-4 bg-stone-900/60 border border-stone-800" data-testid="scanner-tabs">
            <TabsTrigger value="scan" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400" data-testid="tab-scan">
              <Play className="w-4 h-4 mr-2 hidden sm:inline" /> Scan
            </TabsTrigger>
            <TabsTrigger value="scripts" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-400" data-testid="tab-scripts">
              <FileCode className="w-4 h-4 mr-2 hidden sm:inline" /> Lua Scripts
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
          <TabsContent value="lookups"><ApiLookupsTab /></TabsContent>
          <TabsContent value="history"><ScanHistoryTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}