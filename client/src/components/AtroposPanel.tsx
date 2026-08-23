import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Play, Loader2, CheckCircle2, XCircle, FileText, 
  Search, Clock, Zap, AlertCircle, Copy, Send, RefreshCw, Upload, Server
} from 'lucide-react';
import { useGame } from '@/hooks/useGameSession';
import { useReportContext } from '@/hooks/useReportContext';

export interface AtroposScript {
  scriptId: string;
  name: string;
  description?: string;
  category: 'osint' | 'vulnerability' | 'secret_detection' | 'general';
  path: string;
}

export interface AtroposScan {
  id: number;
  scanId: string;
  target: string;
  scriptPath: string;
  status: 'pending' | 'running' | 'success' | 'error';
  results?: any;
  error?: string;
  latencyMs?: number;
  timestamp: string;
}

interface AtroposFinding {
  type: string;
  value: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source?: string;
  metadata?: Record<string, any>;
}

interface AtroposSummary {
  subdomains: number;
  ipAddresses: number;
  urls: number;
  emails: number;
  openPorts: number;
  technologies: number;
  vulnerabilities: number;
  secrets: number;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

interface SimulatedScanResult {
  id: string;
  scanType: string;
  target: string;
  timestamp: string;
  status: string;
  findings: AtroposFinding[];
  summary: AtroposSummary;
  scriptUsed?: string;
}

interface AtroposPanelProps {
  investigationId?: string;
  onScanComplete?: (scan: AtroposScan) => void;
  onAnalyzeWithNexus?: (prompt: string, scanData: unknown) => void;
}

export function AtroposPanel({ investigationId, onScanComplete, onAnalyzeWithNexus }: AtroposPanelProps) {
  const { gameState } = useGame();
  const { addToolOutput } = useReportContext();
  const [scripts, setScripts] = useState<AtroposScript[]>([]);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [scans, setScans] = useState<AtroposScan[]>([]);
  const [selectedScan, setSelectedScan] = useState<AtroposScan | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ available: boolean; error?: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [simulateScript, setSimulateScript] = useState('');
  const [simulateTarget, setSimulateTarget] = useState('');
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [simulateResult, setSimulateResult] = useState<SimulatedScanResult | null>(null);
  const [importFormat, setImportFormat] = useState<'atropos' | 'bbot' | 'nuclei'>('atropos');
  const [importData, setImportData] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<SimulatedScanResult | null>(null);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [remoteApiKey, setRemoteApiKey] = useState('');
  const [remoteTarget, setRemoteTarget] = useState('');
  const [remoteScript, setRemoteScript] = useState('');
  const [remoteStatus, setRemoteStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteResult, setRemoteResult] = useState<unknown | null>(null);

  useEffect(() => {
    refreshPanel();
  }, [gameState?.sessionToken, investigationId]);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/atropos/health');
      const data = await res.json();
      setHealthStatus({
        available: data.binary?.available || false,
        error: data.binary?.error
      });
    } catch (error) {
      setHealthStatus({ available: false, error: 'Failed to check health' });
    }
  };

  const loadScripts = async () => {
    try {
      const res = await fetch('/api/atropos/scripts');
      if (res.ok) {
        const data = await res.json();
        setScripts(data);
        setSelectedScript(prev => {
          if (!data.length) return '';
          if (prev && data.some((script: AtroposScript) => script.scriptId === prev)) {
            return prev;
          }
          return data[0].scriptId;
        });
        setSimulateScript(prev => {
          if (!data.length) return '';
          if (prev && data.some((script: AtroposScript) => script.scriptId === prev)) {
            return prev;
          }
          return data[0].scriptId;
        });
        setRemoteScript(prev => {
          if (!data.length) return '';
          if (prev && data.some((script: AtroposScript) => script.scriptId === prev)) {
            return prev;
          }
          return data[0].scriptId;
        });
      }
    } catch (error) {
      console.error('Failed to load scripts:', error);
      toast({
        title: "Error",
        description: "Failed to load Atropos scripts",
        variant: "destructive"
      });
    }
  };

  const loadScans = async (selectActive = false) => {
    const sessionToken = gameState?.sessionToken;
    const endpoint = investigationId
      ? `/api/atropos/scans/investigation/${investigationId}`
      : sessionToken
        ? `/api/atropos/scans/${sessionToken}`
        : null;
    if (!endpoint) {
      setScans([]);
      if (selectActive) {
        setSelectedScan(null);
      }
      return [];
    }
    
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        // Transform tool calls to scan format
        const transformedScans: AtroposScan[] = data.map((tc: any) => ({
          id: tc.id,
          scanId: tc.request?.scanId || `scan_${tc.id}`,
          target: tc.targetValue,
          scriptPath: tc.request?.scriptPath || 'unknown',
          status: tc.status === 'success' ? 'success' : 
                  tc.status === 'error' ? 'error' : 'pending',
          results: tc.response,
          error: tc.errorMessage,
          latencyMs: tc.latencyMs,
          timestamp: tc.timestamp
        }));
        setScans(transformedScans);
        if (selectActive) {
          setSelectedScan(prev => {
            if (!transformedScans.length) return null;
            if (prev) {
              const match = transformedScans.find(scan => scan.scanId === prev.scanId) ||
                transformedScans.find(scan => scan.id === prev.id);
              if (match) return match;
            }
            return transformedScans[0];
          });
        }
        return transformedScans;
      }
    } catch (error) {
      console.error('Failed to load scans:', error);
    }
    return [];
  };

  const refreshPanel = async () => {
    setRefreshing(true);
    await Promise.all([loadScripts(), checkHealth()]);
    await loadScans(true);
    setRefreshing(false);
  };

  const formatResultsForPrompt = (results: unknown) => {
    if (results === undefined || results === null) {
      return 'No results payload.';
    }
    try {
      const json = JSON.stringify(results, null, 2);
      if (json.length > 6000) {
        return `${json.slice(0, 6000)}\n... (truncated)`;
      }
      return json;
    } catch {
      return String(results);
    }
  };

  const copyJson = async (payload: unknown, emptyMessage: string) => {
    if (!payload) {
      toast({
        title: "No results",
        description: emptyMessage,
        variant: "destructive"
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast({
        title: "Copied",
        description: "Results copied to clipboard"
      });
    } catch (error: any) {
      toast({
        title: "Copy failed",
        description: error.message || "Unable to copy results",
        variant: "destructive"
      });
    }
  };

  const buildNexusPrompt = (scan: AtroposScan) => {
    const script = scripts.find(s => s.path === scan.scriptPath || s.scriptId === scan.scriptPath);
    const scriptLabel = script?.name || scan.scriptPath;
    const resultsText = formatResultsForPrompt(scan.results);
    const errorText = scan.error ? `\nError: ${scan.error}` : '';
    return `Atropos scan results

Target: ${scan.target}
Script: ${scriptLabel}
Status: ${scan.status}
Scan ID: ${scan.scanId}
Timestamp: ${new Date(scan.timestamp).toISOString()}
Latency: ${scan.latencyMs ?? 'N/A'}ms

Results:
${resultsText}${errorText}

Please summarize key findings, prioritize risks, and recommend next investigation steps.`;
  };

  const handleAnalyzeWithNexus = () => {
    if (!selectedScan) return;
    if (!onAnalyzeWithNexus) {
      toast({
        title: "NEXUS unavailable",
        description: "Open the agent chat to analyze scan results",
        variant: "destructive"
      });
      return;
    }
    const prompt = buildNexusPrompt(selectedScan);
    onAnalyzeWithNexus(prompt, selectedScan);
    toast({
      title: "Sent to NEXUS",
      description: "Scan results prepared for analysis"
    });
  };

  const handleCopyResults = async () => {
    await copyJson(selectedScan?.results, "No scan results available to copy");
  };

  const buildFindingsPrompt = (result: SimulatedScanResult) => {
    const critical = result.findings.filter(f => f.severity === 'critical');
    const high = result.findings.filter(f => f.severity === 'high');
    const vulns = result.findings.filter(f => f.type === 'vulnerability');
    return `Atropos scan results

Target: ${result.target}
Scan Type: ${result.scanType}
Timestamp: ${result.timestamp}
Risk: ${result.summary.riskLevel.toUpperCase()} (${result.summary.riskScore}/100)

Summary:
- Subdomains: ${result.summary.subdomains}
- IPs: ${result.summary.ipAddresses}
- Open Ports: ${result.summary.openPorts}
- Technologies: ${result.summary.technologies}
- Vulnerabilities: ${result.summary.vulnerabilities}

${critical.length ? `Critical Findings:\n${critical.map(f => `- ${f.value}`).join('\n')}` : ''}

${high.length ? `High Findings:\n${high.map(f => `- ${f.value}`).join('\n')}` : ''}

${vulns.length ? `Vulnerabilities:\n${vulns.map(f => `- [${(f.severity || 'info').toUpperCase()}] ${f.value}`).join('\n')}` : ''}

Provide prioritized remediation advice and next investigation steps.`;
  };

  const analyzeStoredResult = async (result: SimulatedScanResult) => {
    if (!onAnalyzeWithNexus) {
      toast({
        title: "NEXUS unavailable",
        description: "Open the agent chat to analyze scan results",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch(`/api/atropos/results/${result.id}/analyze`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        onAnalyzeWithNexus(data.analysisPrompt, result);
        toast({
          title: "Sent to NEXUS",
          description: "Scan results prepared for analysis"
        });
        return;
      }
    } catch (error) {
      console.error('Analyze error:', error);
    }

    onAnalyzeWithNexus(buildFindingsPrompt(result), result);
    toast({
      title: "Sent to NEXUS",
      description: "Scan results prepared for analysis"
    });
  };

  const buildRemotePrompt = (payload: unknown) => {
    const scriptLabel = scripts.find(s => s.scriptId === remoteScript)?.name || remoteScript || 'Unknown script';
    return `Remote Atropos scan results

Target: ${remoteTarget || 'Unknown'}
Script: ${scriptLabel}
Timestamp: ${new Date().toISOString()}

Results:
${formatResultsForPrompt(payload)}

Summarize key findings, highlight risks, and recommend next investigation steps.`;
  };

  const handleAnalyzeRemote = () => {
    if (!remoteResult) {
      toast({
        title: "No results",
        description: "Run a remote scan to analyze results",
        variant: "destructive"
      });
      return;
    }
    if (!onAnalyzeWithNexus) {
      toast({
        title: "NEXUS unavailable",
        description: "Open the agent chat to analyze scan results",
        variant: "destructive"
      });
      return;
    }
    onAnalyzeWithNexus(buildRemotePrompt(remoteResult), {
      source: 'remote',
      target: remoteTarget,
      scriptId: remoteScript,
      result: remoteResult
    });
    toast({
      title: "Sent to NEXUS",
      description: "Remote results prepared for analysis"
    });
  };

  const executeScan = async () => {
    if (!selectedScript || !target.trim()) {
      toast({
        title: "Missing fields",
        description: "Please select a script and enter a target",
        variant: "destructive"
      });
      return;
    }

    if (!gameState?.sessionToken) {
      toast({
        title: "No session",
        description: "Please start a game session first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const script = scripts.find(s => s.scriptId === selectedScript);
      if (!script) {
        throw new Error('Script not found');
      }

      const res = await fetch('/api/atropos/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptPath: script.path,
          target: target.trim(),
          sessionToken: gameState.sessionToken,
          investigationId,
          source: 'manual'
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Scan failed');
      }

      if (result.success) {
        toast({
          title: "Scan started",
          description: `Scan ${result.scanId} executed successfully`,
        });

        addToolOutput({
          type: 'scan',
          source: 'atropos',
          content: `Atropos scan completed: ${script.name} on ${target.trim()}`,
          metadata: {
            scanId: result.scanId,
            scriptPath: script.path,
            target: target.trim()
          }
        });

        const updatedScans = await loadScans(true);

        const newScan = updatedScans.find(s => s.scanId === result.scanId) || {
          id: Date.now(),
          scanId: result.scanId || 'unknown',
          target: target.trim(),
          scriptPath: script.path,
          status: 'success' as const,
          results: result.data,
          latencyMs: result.latencyMs,
          timestamp: new Date().toISOString()
        };

        setSelectedScan(newScan);
        onScanComplete?.(newScan);
      } else {
        throw new Error(result.error || 'Scan failed');
      }
    } catch (error: any) {
      console.error('Scan execution error:', error);
      toast({
        title: "Scan failed",
        description: error.message || "Failed to execute scan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runSimulatedScan = async () => {
    if (!simulateTarget.trim()) {
      toast({
        title: "Target required",
        description: "Enter a domain or IP to simulate",
        variant: "destructive"
      });
      return;
    }

    setSimulateLoading(true);
    try {
      const res = await fetch('/api/atropos/scan/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: simulateTarget.trim(),
          scriptId: simulateScript || selectedScript
        })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Simulation failed');
      }

      const result = await res.json();
      setSimulateResult(result);
      addToolOutput({
        type: 'scan',
        source: 'atropos',
        content: `Simulated scan completed: ${result.scanType} on ${result.target}`,
        metadata: { scanId: result.id, target: result.target, source: 'simulate' }
      });
      toast({
        title: "Simulation complete",
        description: `Findings: ${result.findings.length} • Risk: ${result.summary.riskLevel.toUpperCase()}`
      });
    } catch (error: any) {
      console.error('Simulated scan error:', error);
      toast({
        title: "Simulation failed",
        description: error.message || "Failed to run simulated scan",
        variant: "destructive"
      });
    } finally {
      setSimulateLoading(false);
    }
  };

  const importResults = async () => {
    if (!importData.trim()) {
      toast({
        title: "No data",
        description: "Paste scan results JSON to import",
        variant: "destructive"
      });
      return;
    }

    setImportLoading(true);
    try {
      const parsed = JSON.parse(importData);
      const res = await fetch('/api/atropos/results/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: parsed, format: importFormat })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Import failed');
      }

      const data = await res.json();
      setImportResult(data.result);
      setImportData('');
      addToolOutput({
        type: 'scan',
        source: 'atropos',
        content: `Imported scan results for ${data.result.target}`,
        metadata: { scanId: data.result.id, target: data.result.target, source: 'import' }
      });
      toast({
        title: "Import successful",
        description: `Findings: ${data.result.findings.length}`
      });
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import results",
        variant: "destructive"
      });
    } finally {
      setImportLoading(false);
    }
  };

  const checkRemoteStatus = async () => {
    if (!remoteUrl.trim()) {
      toast({
        title: "URL required",
        description: "Enter a remote Atropos URL to check status",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch(`/api/atropos/remote/status?url=${encodeURIComponent(remoteUrl.trim())}`);
      const data = await res.json();
      setRemoteStatus(data.connected ? 'online' : 'offline');
    } catch (error) {
      setRemoteStatus('offline');
    }
  };

  const runRemoteScan = async () => {
    if (!remoteUrl.trim() || !remoteTarget.trim()) {
      toast({
        title: "Missing fields",
        description: "Remote URL and target are required",
        variant: "destructive"
      });
      return;
    }

    setRemoteLoading(true);
    try {
      const res = await fetch('/api/atropos/remote/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          atroposUrl: remoteUrl.trim(),
          target: remoteTarget.trim(),
          scriptId: remoteScript || undefined,
          apiKey: remoteApiKey.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Remote scan failed');
      }

      setRemoteResult(data);
      addToolOutput({
        type: 'scan',
        source: 'atropos',
        content: `Remote scan completed for ${remoteTarget.trim()}`,
        metadata: { target: remoteTarget.trim(), source: 'remote', scriptId: remoteScript }
      });
      toast({
        title: "Remote scan complete",
        description: "Results received from remote Atropos server"
      });
    } catch (error: any) {
      toast({
        title: "Remote scan failed",
        description: error.message || "Failed to run remote scan",
        variant: "destructive"
      });
    } finally {
      setRemoteLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'osint': return 'bg-teal-500/15 text-teal-800 border-teal-500/40';
      case 'vulnerability': return 'bg-orange-500/15 text-orange-800 border-orange-500/40';
      case 'secret_detection': return 'bg-amber-500/15 text-amber-800 border-amber-500/40';
      default: return 'bg-muted/15 text-foreground border-muted/40';
    }
  };

  const getSeverityColor = (severity?: AtroposFinding['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-800 border-red-500/40';
      case 'high': return 'bg-orange-500/20 text-orange-800 border-orange-500/40';
      case 'medium': return 'bg-amber-500/20 text-amber-800 border-amber-500/40';
      case 'low': return 'bg-teal-500/20 text-teal-800 border-teal-500/40';
      default: return 'bg-muted/20 text-foreground border-muted/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-teal-800" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-700" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-amber-800 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const renderFindingsResult = (result: SimulatedScanResult, actions: { onCopy: () => void; onAnalyze: () => void }) => {
    const scriptLabel = scripts.find(s => s.scriptId === result.scriptUsed || s.scriptId === result.scanType)?.name || result.scanType;
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Scan Results
            </CardTitle>
            <Badge variant="outline" className={getSeverityColor(result.summary.riskLevel)}>
              Risk: {result.summary.riskLevel.toUpperCase()} ({result.summary.riskScore}/100)
            </Badge>
          </div>
          <CardDescription>
            {result.target} • {scriptLabel} • {new Date(result.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-amber-900/30 bg-card/60 p-2 text-center">
              <div className="text-lg font-bold text-amber-700">{result.summary.subdomains}</div>
              <div className="text-xs text-muted-foreground">Subdomains</div>
            </div>
            <div className="rounded-lg border border-teal-900/30 bg-card/60 p-2 text-center">
              <div className="text-lg font-bold text-teal-700">{result.summary.openPorts}</div>
              <div className="text-xs text-muted-foreground">Open Ports</div>
            </div>
            <div className="rounded-lg border border-amber-900/30 bg-card/60 p-2 text-center">
              <div className="text-lg font-bold text-amber-700">{result.summary.technologies}</div>
              <div className="text-xs text-muted-foreground">Technologies</div>
            </div>
            <div className="rounded-lg border border-orange-900/30 bg-card/60 p-2 text-center">
              <div className="text-lg font-bold text-orange-700">{result.summary.vulnerabilities}</div>
              <div className="text-xs text-muted-foreground">Vulnerabilities</div>
            </div>
          </div>

          <ScrollArea className="h-56 rounded-lg border border-amber-900/30 bg-card/50 p-3">
            <div className="space-y-2">
              {result.findings.slice(0, 30).map((finding, idx) => (
                <div key={`${finding.type}-${idx}`} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className={`text-[10px] ${getSeverityColor(finding.severity)}`}>
                    {finding.type}
                  </Badge>
                  <span className="text-foreground truncate flex-1">{finding.value}</span>
                  {finding.source && <span className="text-muted-foreground text-xs">{finding.source}</span>}
                </div>
              ))}
              {result.findings.length > 30 && (
                <div className="text-xs text-muted-foreground text-center pt-2">
                  +{result.findings.length - 30} more findings...
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={actions.onCopy}
              className="border-amber-900/40 text-amber-800 hover:text-amber-600"
              data-testid="atropos-findings-copy"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy JSON
            </Button>
            <Button
              onClick={actions.onAnalyze}
              disabled={!onAnalyzeWithNexus}
              className="bg-amber-700 hover:bg-amber-600"
              data-testid="atropos-findings-analyze"
            >
              <Send className="mr-2 h-4 w-4" />
              Analyze with NEXUS
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Health Status */}
      {healthStatus && (
        <Card className={healthStatus.available ? "border-teal-500/50" : "border-red-500/50"}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-2">
              {healthStatus.available ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-800" />
                  <span className="text-sm text-teal-800">Atropos binary is available</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-700" />
                  <span className="text-sm text-red-800">
                    Atropos binary not available: {healthStatus.error || 'Unknown error'}
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPanel}
                disabled={refreshing}
                className="border-amber-900/40 text-amber-800 hover:text-amber-600"
                data-testid="atropos-refresh"
              >
                {refreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="execute" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="execute" data-testid="atropos-tab-execute" className="min-h-[44px] gap-2">
            <Zap className="h-4 w-4" />
            Execute
          </TabsTrigger>
          <TabsTrigger value="simulate" data-testid="atropos-tab-simulate" className="min-h-[44px] gap-2">
            <Play className="h-4 w-4" />
            Simulate
          </TabsTrigger>
          <TabsTrigger value="import" data-testid="atropos-tab-import" className="min-h-[44px] gap-2">
            <Upload className="h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="remote" data-testid="atropos-tab-remote" className="min-h-[44px] gap-2">
            <Server className="h-4 w-4" />
            Remote
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="atropos-tab-history" className="min-h-[44px] gap-2">
            <Search className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="execute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Execute Atropos Scan
              </CardTitle>
              <CardDescription>
                Run OSINT and security scans using Lua scripts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="script">Script</Label>
                <Select value={selectedScript} onValueChange={setSelectedScript}>
                  <SelectTrigger id="script" data-testid="atropos-script-select">
                    <SelectValue placeholder="Select a script" />
                  </SelectTrigger>
                  <SelectContent>
                    {scripts.map((script) => (
                      <SelectItem key={script.scriptId} value={script.scriptId}>
                        <div className="flex items-center gap-2">
                          <span>{script.name}</span>
                          <Badge variant="outline" className={getCategoryColor(script.category)}>
                            {script.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedScript && (
                  <p className="text-xs text-muted-foreground">
                    {scripts.find(s => s.scriptId === selectedScript)?.description || 'No description'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  placeholder="example.com, 192.168.1.1, https://example.com"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      executeScan();
                    }
                  }}
                  data-testid="atropos-target-input"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a domain, IP address, URL, or email address
                </p>
              </div>

              <Button 
                onClick={executeScan} 
                disabled={loading || !selectedScript || !target.trim() || !healthStatus?.available}
                className="w-full"
                data-testid="atropos-execute"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute Scan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Display */}
          {selectedScan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Scan Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedScan.status)}
                    <span className="font-medium">{selectedScan.scanId}</span>
                    {selectedScan.latencyMs && (
                      <Badge variant="outline" className="ml-auto">
                        {selectedScan.latencyMs}ms
                      </Badge>
                    )}
                  </div>

                  {selectedScan.error && (
                    <div className="rounded-md bg-red-500/10 border border-red-500/50 p-3">
                      <p className="text-sm text-red-800">{selectedScan.error}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Target: {selectedScan.target}</span>
                    <span>
                      Script: {scripts.find(s => s.path === selectedScan.scriptPath)?.name || selectedScan.scriptPath}
                    </span>
                    <span>Time: {new Date(selectedScan.timestamp).toLocaleString()}</span>
                  </div>

                  {selectedScan.results && (
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <pre className="text-xs font-mono text-muted-foreground overflow-auto">
                        {JSON.stringify(selectedScan.results, null, 2)}
                      </pre>
                    </ScrollArea>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      onClick={handleCopyResults}
                      disabled={!selectedScan.results}
                      className="border-amber-900/40 text-amber-800 hover:text-amber-600"
                      data-testid="atropos-copy-json"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy JSON
                    </Button>
                    <Button
                      onClick={handleAnalyzeWithNexus}
                      disabled={!selectedScan.results || !onAnalyzeWithNexus}
                      className="bg-amber-700 hover:bg-amber-600"
                      data-testid="atropos-analyze"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Analyze with NEXUS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="simulate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Simulated Scan
              </CardTitle>
              <CardDescription>
                Run a simulated scan to test the workflow without the binary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="simulate-target">Target</Label>
                  <Input
                    id="simulate-target"
                    placeholder="example.com"
                    value={simulateTarget}
                    onChange={(e) => setSimulateTarget(e.target.value)}
                    data-testid="atropos-sim-target"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="simulate-script">Script</Label>
                  <Select value={simulateScript} onValueChange={setSimulateScript}>
                    <SelectTrigger id="simulate-script" data-testid="atropos-sim-script">
                      <SelectValue placeholder="Select a script" />
                    </SelectTrigger>
                    <SelectContent>
                      {scripts.map((script) => (
                        <SelectItem key={script.scriptId} value={script.scriptId}>
                          {script.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={runSimulatedScan}
                disabled={simulateLoading || !simulateTarget.trim()}
                className="w-full"
                data-testid="atropos-sim-run"
              >
                {simulateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Simulated Scan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {simulateResult && renderFindingsResult(simulateResult, {
            onCopy: () => copyJson(simulateResult, "No simulated results available to copy"),
            onAnalyze: () => analyzeStoredResult(simulateResult)
          })}
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Results
              </CardTitle>
              <CardDescription>
                Import Atropos, BBOT, or Nuclei results for analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-format">Format</Label>
                <Select value={importFormat} onValueChange={(value) => setImportFormat(value as 'atropos' | 'bbot' | 'nuclei')}>
                  <SelectTrigger id="import-format" data-testid="atropos-import-format">
                    <SelectValue placeholder="Select format" />
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
                  placeholder='{"target": "example.com", "findings": [...]}'
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="min-h-[160px] font-mono text-sm"
                  data-testid="atropos-import-data"
                />
              </div>
              <Button
                onClick={importResults}
                disabled={importLoading || !importData.trim()}
                className="w-full"
                data-testid="atropos-import-run"
              >
                {importLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Results
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {importResult && renderFindingsResult(importResult, {
            onCopy: () => copyJson(importResult, "No imported results available to copy"),
            onAnalyze: () => analyzeStoredResult(importResult)
          })}
        </TabsContent>

        <TabsContent value="remote" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Remote Scanner
              </CardTitle>
              <CardDescription>
                Connect to a remote Atropos instance and run scans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remote-url">Atropos API URL</Label>
                <Input
                  id="remote-url"
                  placeholder="https://atropos.example.com"
                  value={remoteUrl}
                  onChange={(e) => {
                    setRemoteUrl(e.target.value);
                    setRemoteStatus('unknown');
                  }}
                  data-testid="atropos-remote-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remote-key">API Key (optional)</Label>
                <Input
                  id="remote-key"
                  placeholder="Bearer token"
                  value={remoteApiKey}
                  onChange={(e) => setRemoteApiKey(e.target.value)}
                  data-testid="atropos-remote-key"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="remote-target">Target</Label>
                  <Input
                    id="remote-target"
                    placeholder="example.com"
                    value={remoteTarget}
                    onChange={(e) => setRemoteTarget(e.target.value)}
                    data-testid="atropos-remote-target"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remote-script">Script</Label>
                  <Select value={remoteScript} onValueChange={setRemoteScript}>
                    <SelectTrigger id="remote-script" data-testid="atropos-remote-script">
                      <SelectValue placeholder="Select a script" />
                    </SelectTrigger>
                    <SelectContent>
                      {scripts.map((script) => (
                        <SelectItem key={script.scriptId} value={script.scriptId}>
                          {script.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={checkRemoteStatus}
                  className="border-amber-900/40 text-amber-800 hover:text-amber-600"
                  data-testid="atropos-remote-check"
                >
                  Check Status
                </Button>
                <Button
                  onClick={runRemoteScan}
                  disabled={remoteLoading || !remoteUrl.trim() || !remoteTarget.trim()}
                  data-testid="atropos-remote-run"
                >
                  {remoteLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Server className="mr-2 h-4 w-4" />
                      Run Remote Scan
                    </>
                  )}
                </Button>
                {remoteStatus !== 'unknown' && (
                  <Badge className={remoteStatus === 'online'
                    ? 'bg-teal-500/15 text-teal-800 border-teal-500/40'
                    : 'bg-red-500/15 text-red-800 border-red-500/40'
                  }>
                    {remoteStatus === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {remoteResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Remote Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <pre className="text-xs font-mono text-muted-foreground overflow-auto">
                    {JSON.stringify(remoteResult, null, 2)}
                  </pre>
                </ScrollArea>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={() => copyJson(remoteResult, "No remote results available to copy")}
                    className="border-amber-900/40 text-amber-800 hover:text-amber-600"
                    data-testid="atropos-remote-copy"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy JSON
                  </Button>
                  <Button
                    onClick={handleAnalyzeRemote}
                    disabled={!onAnalyzeWithNexus}
                    className="bg-amber-700 hover:bg-amber-600"
                    data-testid="atropos-remote-analyze"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Analyze with NEXUS
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Scan History
              </CardTitle>
              <CardDescription>
                View previous scan executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No scans yet</p>
                  <p className="text-xs">Execute a scan to see results here</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {scans.map((scan) => (
                      <Card 
                        key={scan.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedScan?.id === scan.id ? 'border-amber-500/50 bg-amber-950/10' : ''
                        }`}
                        onClick={() => setSelectedScan(scan)}
                        data-testid={`atropos-history-${scan.id}`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(scan.status)}
                                <span className="font-medium">{scan.target}</span>
                                <Badge variant="outline" className={getCategoryColor(
                                  scripts.find(s => s.path === scan.scriptPath)?.category || 'general'
                                )}>
                                  {scripts.find(s => s.path === scan.scriptPath)?.name || scan.scriptPath}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(scan.timestamp).toLocaleString()}
                              </p>
                            </div>
                            {scan.latencyMs && (
                              <Badge variant="outline" className="ml-2">
                                {scan.latencyMs}ms
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
