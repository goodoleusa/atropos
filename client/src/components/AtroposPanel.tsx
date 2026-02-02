import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Play, Loader2, CheckCircle2, XCircle, FileText, 
  Search, Clock, Zap, AlertCircle, ExternalLink
} from 'lucide-react';
import { useGameSession } from '@/hooks/useGameSession';

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

interface AtroposPanelProps {
  investigationId?: string;
  onScanComplete?: (scan: AtroposScan) => void;
}

export function AtroposPanel({ investigationId, onScanComplete }: AtroposPanelProps) {
  const { gameState } = useGameSession();
  const [scripts, setScripts] = useState<AtroposScript[]>([]);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [scans, setScans] = useState<AtroposScan[]>([]);
  const [selectedScan, setSelectedScan] = useState<AtroposScan | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ available: boolean; error?: string } | null>(null);

  // Load scripts and health status on mount
  useEffect(() => {
    loadScripts();
    checkHealth();
    if (gameState?.sessionToken) {
      loadScans();
    }
  }, [gameState?.sessionToken]);

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
        if (data.length > 0 && !selectedScript) {
          setSelectedScript(data[0].scriptId);
        }
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

  const loadScans = async () => {
    if (!gameState?.sessionToken) return;
    
    try {
      const res = await fetch(`/api/atropos/scans/${gameState.sessionToken}`);
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
      }
    } catch (error) {
      console.error('Failed to load scans:', error);
    }
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

        // Reload scans
        await loadScans();

        // Find the new scan and select it
        const newScan = scans.find(s => s.scanId === result.scanId) || {
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'osint': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'vulnerability': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'secret_detection': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Health Status */}
      {healthStatus && (
        <Card className={healthStatus.available ? "border-green-500/50" : "border-red-500/50"}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {healthStatus.available ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-green-300">Atropos binary is available</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-red-300">
                    Atropos binary not available: {healthStatus.error || 'Unknown error'}
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="execute" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="execute">Execute Scan</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
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
                  <SelectTrigger id="script">
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
                />
                <p className="text-xs text-muted-foreground">
                  Enter a domain, IP address, URL, or email address
                </p>
              </div>

              <Button 
                onClick={executeScan} 
                disabled={loading || !selectedScript || !target.trim() || !healthStatus?.available}
                className="w-full"
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
                      <p className="text-sm text-red-300">{selectedScan.error}</p>
                    </div>
                  )}

                  {selectedScan.results && (
                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <pre className="text-xs font-mono text-muted-foreground overflow-auto">
                        {JSON.stringify(selectedScan.results, null, 2)}
                      </pre>
                    </ScrollArea>
                  )}
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
                          selectedScan?.id === scan.id ? 'border-primary' : ''
                        }`}
                        onClick={() => setSelectedScan(scan)}
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
                                  {scan.scriptPath}
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
