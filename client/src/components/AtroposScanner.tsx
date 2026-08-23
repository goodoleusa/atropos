import { useState, useCallback, useEffect } from 'react';
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
  Terminal, Upload, Play, Loader2, Target, AlertTriangle, 
  Shield, Globe, Server, Key, FileJson, Send, CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useReportContext } from '@/hooks/useReportContext';

interface AtroposScript {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface AtroposFinding {
  type: string;
  value: string;
  severity?: string;
  source?: string;
  metadata?: Record<string, any>;
}

interface AtroposScanResult {
  id: string;
  scanType: string;
  target: string;
  timestamp: string;
  status: string;
  findings: AtroposFinding[];
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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  osint: <Globe className="w-4 h-4" />,
  vuln: <AlertTriangle className="w-4 h-4" />,
  intel: <Shield className="w-4 h-4" />,
  recon: <Target className="w-4 h-4" />,
  api: <Server className="w-4 h-4" />,
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  info: "bg-muted/20 text-muted-foreground border-muted/30",
};

interface AtroposScannerProps {
  onAnalyzeWithNexus?: (prompt: string, scanData: any) => void;
}

function mergeScanResults(existing: AtroposScanResult | null, incoming: AtroposScanResult): AtroposScanResult {
  if (!existing) return incoming;
  const existingValues = new Set(existing.findings.map(f => `${f.type}:${f.value}`));
  const newFindings = incoming.findings.filter(f => !existingValues.has(`${f.type}:${f.value}`));
  return {
    ...incoming,
    findings: [...existing.findings, ...newFindings],
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

export function AtroposScanner({ onAnalyzeWithNexus }: AtroposScannerProps) {
  const { addToolOutput } = useReportContext();
  const [scripts, setScripts] = useState<AtroposScript[]>([]);
  const [selectedScript, setSelectedScript] = useState<string>("bbot_scanner");
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AtroposScanResult | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [importData, setImportData] = useState("");
  const [importFormat, setImportFormat] = useState<"atropos" | "bbot" | "nuclei">("atropos");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [remoteStatus, setRemoteStatus] = useState<"unknown" | "online" | "offline">("unknown");

  const loadScripts = useCallback(async () => {
    try {
      const res = await fetch("/api/atropos/scripts");
      if (res.ok) {
        const data = await res.json();
        setScripts(data);
      }
    } catch (error) {
      console.error("Failed to load scripts:", error);
    }
  }, []);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  const runSimulatedScan = async () => {
    if (!target.trim()) {
      toast({ title: "Target required", description: "Enter a domain or IP to scan", variant: "destructive" });
      return;
    }

    setIsScanning(true);
    try {
      const res = await fetch("/api/atropos/scan/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim(), scriptId: selectedScript })
      });

      if (res.ok) {
        const result = await res.json();
        setScanResult(prev => mergeScanResults(prev, result));
        setScanCount(c => c + 1);
        addToolOutput({ 
          type: 'scan', 
          source: 'atropos', 
          content: `Scan completed: ${result.summary.vulnerabilities} vulnerabilities found`,
          metadata: { scanId: result.id, target: result.target }
        });
        toast({ 
          title: "Scan Complete", 
          description: `Found ${result.findings.length} findings added (risk score ${result.summary.riskScore})` 
        });
      } else {
        throw new Error("Scan failed");
      }
    } catch (error) {
      toast({ title: "Scan Error", description: "Failed to run simulated scan", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const importResults = async () => {
    if (!importData.trim()) {
      toast({ title: "No data", description: "Paste scan results JSON", variant: "destructive" });
      return;
    }

    try {
      const parsed = JSON.parse(importData);
      const res = await fetch("/api/atropos/results/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: parsed, format: importFormat })
      });

      if (res.ok) {
        const data = await res.json();
        setScanResult(data.result);
        setImportData("");
        toast({ title: "Import Successful", description: `Imported scan with ${data.result.findings.length} findings` });
      } else {
        throw new Error("Import failed");
      }
    } catch (error: any) {
      toast({ 
        title: "Import Error", 
        description: error.message?.includes("JSON") ? "Invalid JSON format" : "Failed to import results", 
        variant: "destructive" 
      });
    }
  };

  const checkRemoteStatus = async () => {
    if (!remoteUrl.trim()) return;
    
    try {
      const res = await fetch(`/api/atropos/remote/status?url=${encodeURIComponent(remoteUrl)}`);
      const data = await res.json();
      setRemoteStatus(data.connected ? "online" : "offline");
    } catch {
      setRemoteStatus("offline");
    }
  };

  const analyzeWithNexus = async () => {
    if (!scanResult) return;

    try {
      const res = await fetch(`/api/atropos/results/${scanResult.id}/analyze`, { method: "POST" });
      if (res.ok) {
        const { analysisPrompt, reportData } = await res.json();
        if (onAnalyzeWithNexus) {
          onAnalyzeWithNexus(analysisPrompt, reportData);
        } else {
          const scanData = encodeURIComponent(JSON.stringify(scanResult));
          window.location.href = `/agents?scanData=${scanData}`;
        }
        toast({ title: "Opening NEXUS", description: "Loading scan results into agent workspace" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to prepare analysis", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4" data-testid="atropos-scanner">
      <Tabs defaultValue="simulate" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50">
          <TabsTrigger value="simulate" className="data-[state=active]:bg-amber-900/30" data-testid="tab-simulate">
            <Play className="w-4 h-4 mr-2" /> Simulate
          </TabsTrigger>
          <TabsTrigger value="import" className="data-[state=active]:bg-amber-900/30" data-testid="tab-import">
            <Upload className="w-4 h-4 mr-2" /> Import
          </TabsTrigger>
          <TabsTrigger value="remote" className="data-[state=active]:bg-amber-900/30" data-testid="tab-remote">
            <Server className="w-4 h-4 mr-2" /> Remote
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulate" className="space-y-4">
          <Card className="bg-card/50 border-amber-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Terminal className="w-5 h-5" /> Simulated Scan
              </CardTitle>
              <CardDescription>Run demo scans to test the NEXUS workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    placeholder="example.com"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="bg-border/50 border-amber-900/30"
                    data-testid="input-target"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="script">Script</Label>
                  <Select value={selectedScript} onValueChange={setSelectedScript}>
                    <SelectTrigger className="bg-border/50 border-amber-900/30" data-testid="select-script">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {scripts.map((script) => (
                        <SelectItem key={script.id} value={script.id}>
                          <div className="flex items-center gap-2 py-0.5">
                            {CATEGORY_ICONS[script.category] || <Terminal className="w-4 h-4" />}
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-sm">{script.name}</span>
                              <span className="text-xs text-muted-foreground">{script.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={runSimulatedScan} 
                disabled={isScanning || !target}
                className="w-full bg-amber-700 hover:bg-amber-600"
                data-testid="button-scan"
              >
                {isScanning ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" /> Run Simulated Scan</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card className="bg-card/50 border-amber-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <FileJson className="w-5 h-5" /> Import Scan Results
              </CardTitle>
              <CardDescription>Paste JSON output from Atropos, BBOT, or Nuclei</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select value={importFormat} onValueChange={(v: any) => setImportFormat(v)}>
                  <SelectTrigger className="bg-border/50 border-amber-900/30" data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atropos">Atropos JSON</SelectItem>
                    <SelectItem value="bbot">BBOT NDJSON</SelectItem>
                    <SelectItem value="nuclei">Nuclei JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="import-data">JSON Data</Label>
                <Textarea
                  id="import-data"
                  placeholder='{"target": "example.com", "findings": [...], ...}'
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="bg-border/50 border-amber-900/30 h-40 font-mono text-sm"
                  data-testid="textarea-import"
                />
              </div>
              <Button 
                onClick={importResults}
                disabled={!importData.trim()}
                className="w-full bg-teal-700 hover:bg-teal-600"
                data-testid="button-import"
              >
                <Upload className="w-4 h-4 mr-2" /> Import Results
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remote" className="space-y-4">
          <Card className="bg-card/50 border-amber-900/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Server className="w-5 h-5" /> Remote Atropos Server
              </CardTitle>
              <CardDescription>Connect to an Atropos instance running elsewhere</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remote-url">Atropos API URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="remote-url"
                    placeholder="https://atropos.example.com"
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                    className="bg-border/50 border-amber-900/30 flex-1"
                    data-testid="input-remote-url"
                  />
                  <Button 
                    variant="outline" 
                    onClick={checkRemoteStatus}
                    className="border-amber-900/30"
                    data-testid="button-check-status"
                  >
                    Check
                  </Button>
                </div>
                {remoteStatus !== "unknown" && (
                  <Badge className={remoteStatus === "online" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                    {remoteStatus === "online" ? "Connected" : "Offline"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Deploy Atropos to Railway, Render, or your VPS using{" "}
                <code className="text-amber-400">atropos serve</code>
              </p>
              <Button 
                variant="outline"
                className="w-full border-amber-900/30"
                onClick={() => window.open("https://github.com/goodoleusa/lotus", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" /> View Atropos on GitHub
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {scanResult && (
        <Card className="terminal-panel bg-card/50 border-amber-900/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" /> Scan Results
              </CardTitle>
              <Badge className={SEVERITY_COLORS[scanResult.summary.riskLevel] || SEVERITY_COLORS.info}>
                Risk: {scanResult.summary.riskLevel.toUpperCase()} ({scanResult.summary.riskScore}/100)
              </Badge>
            </div>
            <CardDescription>
              {scanResult.target} • {scanResult.scanType} • {new Date(scanResult.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-border/50 rounded-lg p-2">
                <div className="text-xl font-bold text-amber-300">{scanResult.summary.subdomains}</div>
                <div className="text-xs text-muted-foreground">Subdomains</div>
              </div>
              <div className="bg-border/50 rounded-lg p-2">
                <div className="text-xl font-bold text-teal-300">{scanResult.summary.openPorts}</div>
                <div className="text-xs text-muted-foreground">Open Ports</div>
              </div>
              <div className="bg-border/50 rounded-lg p-2">
                <div className="text-xl font-bold text-blue-300">{scanResult.summary.technologies}</div>
                <div className="text-xs text-muted-foreground">Technologies</div>
              </div>
              <div className="bg-border/50 rounded-lg p-2">
                <div className="text-xl font-bold text-red-300">{scanResult.summary.vulnerabilities}</div>
                <div className="text-xs text-muted-foreground">Vulns</div>
              </div>
            </div>

            <ScrollArea className="h-48 rounded-lg border border-amber-900/30 bg-border/30 p-3">
              <div className="space-y-2">
                {scanResult.findings.slice(0, 30).map((finding, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[finding.severity || "info"]}`}>
                      {finding.type}
                    </Badge>
                    <span className="text-foreground truncate flex-1">{finding.value}</span>
                    {finding.source && <span className="text-muted-foreground text-xs">{finding.source}</span>}
                  </div>
                ))}
                {scanResult.findings.length > 30 && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    +{scanResult.findings.length - 30} more findings...
                  </div>
                )}
              </div>
            </ScrollArea>

            <Button 
              onClick={analyzeWithNexus}
              className="w-full bg-gradient-to-r from-amber-700 to-teal-700 hover:from-amber-600 hover:to-teal-600"
              data-testid="button-analyze-nexus"
            >
              <Send className="w-4 h-4 mr-2" /> Analyze with NEXUS Agent
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AtroposScanner;
