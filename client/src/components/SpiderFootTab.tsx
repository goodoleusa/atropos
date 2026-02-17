import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useReportContext } from '@/hooks/useReportContext';
import {
  Radar, Shield, Globe, Search, Play, Loader2, Key, RefreshCw,
  ExternalLink, CheckCircle2, AlertTriangle, X, Settings,
  Clock, Target, Eye, EyeOff, Trash2, ChevronDown, ChevronRight,
  Activity, Wifi, WifiOff, Download, FileJson, FileSpreadsheet,
  Send, Crosshair, MessageSquare, ArrowRight
} from 'lucide-react';

interface HealthStatus {
  available: boolean;
  version?: string;
  error?: string;
}

interface SFModule {
  id: string;
  name: string;
  description: string;
}

interface SFResult {
  type: string;
  data: string;
  module: string;
  source?: string;
}

interface SFScanResponse {
  scanId: string;
  status: string;
  target: string;
  results?: SFResult[];
  resultCount?: number;
  error?: string;
  completedAt?: string;
}

interface SFHistoryEntry {
  scanId: string;
  target: string;
  status: string;
  startedAt: string;
  resultCount: number;
  modules?: string[];
  useCase?: string;
}

interface ApiKeyService {
  key: string;
  service: string;
  description: string;
  url: string;
  free: boolean;
  configured: boolean;
  maskedValue: string | null;
}

const PRESET_OPTIONS: Record<string, { label: string; description: string }> = {
  all: { label: 'All Modules', description: 'Run every available module - comprehensive but slow' },
  full_passive: { label: 'Full Passive', description: 'All passive modules - no direct target contact' },
  dns_basic: { label: 'DNS Basic', description: 'DNS records, nameservers, MX entries' },
  email_harvest: { label: 'Email Harvest', description: 'Find email addresses from public sources' },
  subdomain_enum: { label: 'Subdomain Enumeration', description: 'Discover subdomains via certs, DNS, search engines' },
  threat_intel: { label: 'Threat Intelligence', description: 'Check threat feeds, malware databases, reputation' },
  social_media: { label: 'Social Media', description: 'Find social profiles and online presence' },
  web_recon: { label: 'Web Reconnaissance', description: 'HTTP headers, technologies, CMS detection' },
  custom: { label: 'Custom Modules', description: 'Select individual modules manually' },
};

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-stone-500/20 text-stone-400 border-stone-500/30',
};

interface SpiderFootTabProps {
  onSendToAgent?: (context: string) => void;
  onSendToAtropos?: (targets: string[]) => void;
}

export function SpiderFootTab({ onSendToAgent, onSendToAtropos }: SpiderFootTabProps = {}) {
  const { addToolOutput } = useReportContext();
  const queryClient = useQueryClient();

  const [target, setTarget] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('dns_basic');
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessionToken] = useState(() => `sf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  const { data: health } = useQuery<HealthStatus>({
    queryKey: ['/api/spiderfoot/health'],
    queryFn: () => fetch('/api/spiderfoot/health').then(r => r.json()),
    refetchInterval: 30000,
  });

  const { data: modulesData } = useQuery<{ modules: SFModule[]; presets: Record<string, string[]> }>({
    queryKey: ['/api/spiderfoot/modules'],
    queryFn: () => fetch('/api/spiderfoot/modules').then(r => r.json()),
    enabled: health?.available === true,
  });

  const { data: scanResult, refetch: refetchScan } = useQuery<SFScanResponse>({
    queryKey: ['/api/spiderfoot/scan', activeScanId],
    queryFn: () => fetch(`/api/spiderfoot/scan/${activeScanId}`).then(r => r.json()),
    enabled: !!activeScanId,
    refetchInterval: false,
  });

  const { data: history = [], refetch: refetchHistory } = useQuery<SFHistoryEntry[]>({
    queryKey: ['/api/spiderfoot/history', sessionToken],
    queryFn: () => fetch(`/api/spiderfoot/history?session=${sessionToken}`).then(r => r.json()),
  });

  const { data: apiKeysData, refetch: refetchApiKeys } = useQuery<{ services: ApiKeyService[] }>({
    queryKey: ['/api/spiderfoot/api-keys'],
    queryFn: () => fetch('/api/spiderfoot/api-keys').then(r => r.json()),
    enabled: showApiKeys,
  });

  useEffect(() => {
    if (activeScanId && scanResult?.status === 'running') {
      pollRef.current = setInterval(() => {
        refetchScan();
      }, 3000);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (activeScanId && scanResult?.status === 'completed') {
      const resultCount = scanResult.resultCount || scanResult.results?.length || 0;
      addToolOutput({
        type: 'recon',
        source: 'spiderfoot',
        content: `SpiderFoot scan completed on ${scanResult.target}: ${resultCount} results found`,
        metadata: { scanId: activeScanId, target: scanResult.target, resultCount },
      });
      refetchHistory();
      toast({ title: 'Scan Complete', description: `${resultCount} results from ${scanResult.target}` });
    }

    if (activeScanId && scanResult?.status === 'error') {
      toast({ title: 'Scan Error', description: scanResult.error || 'Scan failed', variant: 'destructive' });
      refetchHistory();
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeScanId, scanResult?.status]);

  const startScanMutation = useMutation({
    mutationFn: async (params: { target: string; modules?: string[]; useCase?: string }) => {
      const res = await fetch('/api/spiderfoot/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, sessionToken }),
      });
      if (!res.ok) throw new Error('Scan request failed');
      return res.json() as Promise<SFScanResponse>;
    },
    onSuccess: (data) => {
      setActiveScanId(data.scanId);
      toast({ title: 'Scan Started', description: `Scanning ${data.target}...` });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to start scan', variant: 'destructive' });
    },
  });

  const saveKeyMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await fetch('/api/spiderfoot/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error('Failed to save key');
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast({ title: 'API Key Saved', description: `${vars.key} updated` });
      setApiKeyInputs(prev => ({ ...prev, [vars.key]: '' }));
      refetchApiKeys();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save API key', variant: 'destructive' });
    },
  });

  const removeKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await fetch(`/api/spiderfoot/api-keys/${key}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove key');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'API Key Removed' });
      refetchApiKeys();
    },
  });

  const handleStartScan = () => {
    if (!target.trim()) {
      toast({ title: 'Target Required', description: 'Enter a domain, IP, or URL to scan', variant: 'destructive' });
      return;
    }
    const params: { target: string; modules?: string[]; useCase?: string } = { target: target.trim() };
    if (selectedPreset === 'all') {
      params.useCase = 'all';
    } else if (selectedPreset === 'custom') {
      params.useCase = 'passive';
    } else if (modulesData?.presets?.[selectedPreset]) {
      params.modules = modulesData.presets[selectedPreset];
    } else {
      params.useCase = 'passive';
    }
    startScanMutation.mutate(params);
  };

  const groupedResults = (scanResult?.results || []).reduce<Record<string, SFResult[]>>((acc, r) => {
    (acc[r.type] = acc[r.type] || []).push(r);
    return acc;
  }, {});

  const toggleType = (type: string) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const isScanning = activeScanId !== null && scanResult?.status === 'running';
  const configuredCount = apiKeysData?.services?.filter(s => s.configured).length || 0;
  const hasResults = scanResult?.results && scanResult.results.length > 0;

  const exportAsJSON = () => {
    if (!scanResult?.results) return;
    const exportData = {
      scanId: scanResult.scanId,
      target: scanResult.target,
      status: scanResult.status,
      resultCount: scanResult.resultCount || scanResult.results.length,
      completedAt: scanResult.completedAt,
      results: scanResult.results,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spiderfoot_${scanResult.target}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: `JSON exported for ${scanResult.target}` });
  };

  const exportAsCSV = () => {
    if (!scanResult?.results) return;
    const meta = [
      `# SpiderFoot Scan Export`,
      `# Target: ${scanResult.target}`,
      `# Scan ID: ${scanResult.scanId}`,
      `# Results: ${scanResult.results.length}`,
      `# Date: ${scanResult.completedAt || new Date().toISOString()}`,
    ];
    const header = 'Type,Data,Module,Source';
    const rows = scanResult.results.map(r =>
      [`"${(r.type || '').replace(/"/g, '""')}"`, `"${(r.data || '').replace(/"/g, '""')}"`, `"${(r.module || '').replace(/"/g, '""')}"`, `"${(r.source || '').replace(/"/g, '""')}"`].join(',')
    );
    const csv = [...meta, header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spiderfoot_${scanResult.target}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: `CSV exported for ${scanResult.target}` });
  };

  const extractPivotTargets = (): string[] => {
    if (!scanResult?.results) return [];
    const targets = new Set<string>();
    const pivotTypes = ['Internet Name', 'Domain Name', 'IP Address', 'IPv6 Address', 'Affiliate - Domain Name', 'Co-Hosted Site', 'Email Address', 'Host', 'Nameserver'];
    scanResult.results.forEach(r => {
      if (pivotTypes.includes(r.type) && r.data && r.data !== scanResult.target) {
        targets.add(r.data.trim());
      }
    });
    return Array.from(targets);
  };

  const buildAgentContext = (): string => {
    if (!scanResult?.results) return '';
    const lines = [`SpiderFoot OSINT scan results for target: ${scanResult.target}`, `Total findings: ${scanResult.results.length}`, ''];
    Object.entries(groupedResults)
      .sort(([, a], [, b]) => b.length - a.length)
      .forEach(([type, results]) => {
        lines.push(`[${type}] (${results.length} results)`);
        results.slice(0, 25).forEach(r => lines.push(`  - ${r.data} (via ${r.module})`));
        if (results.length > 25) lines.push(`  ... and ${results.length - 25} more`);
        lines.push('');
      });
    return lines.join('\n');
  };

  const handleSendToAgent = () => {
    const context = buildAgentContext();
    if (!context) return;
    if (onSendToAgent) {
      onSendToAgent(context);
    }
    toast({ title: 'Sent to Agent', description: 'SpiderFoot results loaded into NEXUS agent for analysis' });
  };

  const handleSendToAtropos = () => {
    const pivotTargets = extractPivotTargets();
    if (pivotTargets.length === 0) {
      toast({ title: 'No pivot targets', description: 'No domains or IPs found in results to scan', variant: 'destructive' });
      return;
    }
    if (onSendToAtropos) {
      onSendToAtropos(pivotTargets);
    }
    toast({ title: 'Sent to Scanner', description: `${pivotTargets.length} targets loaded into Atropos scanner` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-400">SpiderFoot OSINT</h3>
          {health?.available ? (
            <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30" data-testid="status-health-available">
              <Wifi className="w-3 h-3 mr-1" /> Online{health.version ? ` · ${health.version}` : ''}
            </Badge>
          ) : (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30" data-testid="status-health-unavailable">
              <WifiOff className="w-3 h-3 mr-1" /> Offline
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant={showApiKeys ? 'default' : 'outline'}
          className={showApiKeys ? 'bg-amber-700 hover:bg-amber-600 text-black min-h-[44px]' : 'border-stone-700 text-amber-400 hover:border-amber-700 min-h-[44px]'}
          onClick={() => setShowApiKeys(!showApiKeys)}
          data-testid="button-toggle-api-keys"
        >
          <Settings className="w-4 h-4 mr-1" />
          API Keys {configuredCount > 0 && <Badge variant="outline" className="ml-1 text-[10px] border-teal-500/30 text-teal-400">{configuredCount}</Badge>}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-stone-900/50 border-stone-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-400 flex items-center gap-2 text-base">
                <Target className="w-4 h-4" /> Scan Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="sf-target" className="text-stone-300 text-sm">Target</Label>
                <Input
                  id="sf-target"
                  placeholder="example.com / 192.168.1.1 / email@test.com"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-stone-900/60 border-stone-800 text-stone-200 placeholder:text-stone-600 min-h-[44px]"
                  data-testid="input-sf-target"
                  onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleStartScan()}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sf-preset" className="text-stone-300 text-sm">Scan Preset</Label>
                <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                  <SelectTrigger className="bg-stone-900/60 border-stone-800 text-stone-200 min-h-[44px]" data-testid="select-sf-preset">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRESET_OPTIONS).map(([key, { label, description }]) => (
                      <SelectItem key={key} value={key} data-testid={`preset-option-${key}`}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{label}</span>
                          <span className="text-xs text-stone-500">{description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPreset !== 'custom' && modulesData?.presets?.[selectedPreset] && (
                <div className="text-xs text-stone-500">
                  Modules: {modulesData.presets[selectedPreset].map(m => m.replace('sfp_', '')).join(', ')}
                </div>
              )}

              <Button
                onClick={handleStartScan}
                disabled={isScanning || startScanMutation.isPending || !target.trim()}
                className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold min-h-[44px]"
                data-testid="button-start-scan"
              >
                {isScanning || startScanMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" /> Start Scan</>
                )}
              </Button>

              {isScanning && (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-md p-2 border border-amber-500/20">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Scanning {scanResult?.target}...</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto h-6 px-2 text-red-400 hover:text-red-300 min-h-0"
                    onClick={() => {
                      fetch(`/api/spiderfoot/scan/${activeScanId}/cancel`, { method: 'POST' });
                      setActiveScanId(null);
                    }}
                    data-testid="button-cancel-scan"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-stone-900/50 border-stone-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-stone-300 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Scan History</span>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-stone-500 hover:text-stone-300" onClick={() => refetchHistory()} data-testid="button-refresh-history">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                {history.length === 0 ? (
                  <div className="text-center text-stone-600 text-sm py-6">No scans yet</div>
                ) : (
                  <div className="space-y-2">
                    {history.map((entry) => (
                      <div
                        key={entry.scanId}
                        className="flex items-center justify-between p-2 rounded-md bg-stone-950/60 border border-stone-800/50 cursor-pointer hover:border-stone-700 transition-colors"
                        onClick={() => { setActiveScanId(entry.scanId); refetchScan(); }}
                        data-testid={`history-entry-${entry.scanId}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-stone-200 truncate">{entry.target}</div>
                          <div className="text-[10px] text-stone-500">
                            {new Date(entry.startedAt).toLocaleString()} · {entry.resultCount} results
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {entry.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-stone-600 hover:text-amber-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/api/spiderfoot/scan/${entry.scanId}/export?format=json`, '_blank');
                              }}
                              data-testid={`button-download-${entry.scanId}`}
                              title="Download JSON"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                          <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[entry.status] || STATUS_COLORS.error}`}>
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-stone-900/50 border-stone-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-400 flex items-center gap-2 text-base">
                  <Search className="w-4 h-4" /> Scan Results
                  {scanResult && scanResult.status !== 'running' && (
                    <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[scanResult.status] || ''}`}>
                      {scanResult.resultCount || scanResult.results?.length || 0} results
                    </Badge>
                  )}
                </CardTitle>
                {scanResult && (
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-stone-500 hover:text-red-400" onClick={() => setActiveScanId(null)} data-testid="button-clear-results">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              {scanResult?.target && (
                <div className="text-xs text-stone-500">Target: {scanResult.target}</div>
              )}
              {hasResults && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-stone-700 text-stone-400 hover:text-amber-400 hover:border-amber-700 gap-1" onClick={exportAsJSON} data-testid="button-export-json">
                    <FileJson className="w-3 h-3" /> JSON
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-stone-700 text-stone-400 hover:text-amber-400 hover:border-amber-700 gap-1" onClick={exportAsCSV} data-testid="button-export-csv">
                    <FileSpreadsheet className="w-3 h-3" /> CSV
                  </Button>
                  <div className="w-px h-4 bg-stone-700 mx-1" />
                  <Button size="sm" variant="outline" className="h-7 text-xs border-teal-800 text-teal-400 hover:bg-teal-900/30 hover:border-teal-600 gap-1" onClick={handleSendToAgent} disabled={!onSendToAgent} data-testid="button-send-to-agent">
                    <MessageSquare className="w-3 h-3" /> Agent
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-orange-800 text-orange-400 hover:bg-orange-900/30 hover:border-orange-600 gap-1" onClick={handleSendToAtropos} disabled={!onSendToAtropos} data-testid="button-send-to-atropos">
                    <Crosshair className="w-3 h-3" /> Scanner
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!scanResult && !isScanning ? (
                <div className="text-center py-12 text-stone-600">
                  <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <div className="text-sm">Run a scan to see results here</div>
                </div>
              ) : scanResult?.status === 'error' ? (
                <div className="text-center py-8 text-red-400">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-60" />
                  <div className="text-sm">{scanResult.error || 'Scan failed'}</div>
                </div>
              ) : isScanning && (!scanResult?.results || scanResult.results.length === 0) ? (
                <div className="text-center py-12 text-amber-400">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
                  <div className="text-sm">Scanning in progress...</div>
                  <div className="text-[10px] text-stone-500 mt-1">Results will appear as they arrive</div>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {Object.entries(groupedResults)
                      .sort(([, a], [, b]) => b.length - a.length)
                      .map(([type, results]) => (
                        <div key={type} className="border border-stone-800/50 rounded-md overflow-hidden">
                          <button
                            className="w-full flex items-center justify-between p-2 hover:bg-stone-800/30 transition-colors text-left min-h-[44px]"
                            onClick={() => toggleType(type)}
                            data-testid={`toggle-type-${type}`}
                          >
                            <div className="flex items-center gap-2">
                              {expandedTypes.has(type) ? <ChevronDown className="w-3.5 h-3.5 text-stone-500" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-500" />}
                              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">{type}</Badge>
                              <span className="text-xs text-stone-500">{results.length} result{results.length !== 1 ? 's' : ''}</span>
                            </div>
                          </button>
                          {expandedTypes.has(type) && (
                            <div className="border-t border-stone-800/50 bg-stone-950/40">
                              {results.map((r, i) => (
                                <div key={i} className="flex items-start gap-2 px-3 py-1.5 text-sm border-b border-stone-800/20 last:border-0" data-testid={`result-${type}-${i}`}>
                                  <span className="text-stone-200 break-all flex-1">{r.data}</span>
                                  <span className="text-stone-600 text-[10px] whitespace-nowrap">{r.module?.replace('sfp_', '')}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    {Object.keys(groupedResults).length === 0 && scanResult?.status === 'completed' && (
                      <div className="text-center py-6 text-stone-500 text-sm">No results found</div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showApiKeys && (
        <Card className="bg-stone-900/50 border-stone-800" data-testid="card-api-keys">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-amber-400 flex items-center gap-2 text-base">
                <Key className="w-4 h-4" /> API Key Management
                <Badge variant="outline" className="text-[10px] border-teal-500/30 text-teal-400">
                  {configuredCount}/{apiKeysData?.services?.length || 0} configured
                </Badge>
              </CardTitle>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-stone-500 hover:text-stone-300" onClick={() => setShowApiKeys(false)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px]">
              <div className="space-y-3">
                {(apiKeysData?.services || []).map((svc) => (
                  <div key={svc.key} className="p-3 rounded-md bg-stone-950/60 border border-stone-800/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-200">{svc.service}</span>
                        {svc.configured ? (
                          <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-[10px]">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Configured
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-stone-700 text-stone-500">Not Set</Badge>
                        )}
                        {svc.free && <Badge variant="outline" className="text-[10px] border-teal-800 text-teal-600">Free</Badge>}
                      </div>
                      <a href={svc.url} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-amber-400 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="text-xs text-stone-500">{svc.description}</div>
                    {svc.configured && svc.maskedValue && (
                      <div className="text-xs text-stone-600 font-mono">{svc.maskedValue}</div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Paste API key..."
                        value={apiKeyInputs[svc.key] || ''}
                        onChange={(e) => setApiKeyInputs(prev => ({ ...prev, [svc.key]: e.target.value }))}
                        className="bg-stone-900/60 border-stone-800 text-stone-200 placeholder:text-stone-600 text-xs h-9 flex-1"
                        type="password"
                        data-testid={`input-api-key-${svc.key}`}
                      />
                      <Button
                        size="sm"
                        className="bg-teal-700 hover:bg-teal-600 text-black h-9 min-h-[36px]"
                        disabled={!apiKeyInputs[svc.key]?.trim() || saveKeyMutation.isPending}
                        onClick={() => saveKeyMutation.mutate({ key: svc.key, value: apiKeyInputs[svc.key] })}
                        data-testid={`button-save-key-${svc.key}`}
                      >
                        {saveKeyMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                      </Button>
                      {svc.configured && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 text-stone-500 hover:text-red-400"
                          onClick={() => removeKeyMutation.mutate(svc.key)}
                          data-testid={`button-remove-key-${svc.key}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
