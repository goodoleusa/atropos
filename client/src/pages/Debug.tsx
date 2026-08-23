import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useGame } from "@/hooks/useGameSession";
import { Bug, Terminal, Activity, Cpu, HardDrive, Wifi, AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SystemMetric {
  name: string;
  value: string;
  status: "OK" | "WARNING" | "CRITICAL" | "UNKNOWN";
  icon: React.ReactNode;
}

const SYSTEM_SECRETS = [
  { trigger: "cpu", message: "CPU cycles reveal patterns. Pattern: 7-4-2-8-1", missionHint: "Operation: THREADRIPPER" },
  { trigger: "memory", message: "Memory fragments reassembling... The void remembers your first command.", missionHint: "Mission: GHOST PROTOCOL" },
  { trigger: "network", message: "Packet analysis complete. Hidden endpoint: /api/whisper", missionHint: "Campaign: DARKNET RISING" },
  { trigger: "disk", message: "Sector scan initiated. Corrupted block at 0x7F4D contains: 'TRUST NO OUTPUT'", missionHint: "Objective: DATA EXFIL" },
];

const MISSION_CODENAMES = [
  "SHADOW PROTOCOL", "GHOST IN THE WIRE", "ZERO DAY SUNRISE", "PHOENIX REBORN",
  "SILENT THUNDER", "CRIMSON TIDE", "BLACK ICE", "VIPER STRIKE",
  "QUANTUM BREACH", "IRON LOTUS", "NIGHTFALL OPS", "ARCTIC FOX"
];

const CLUE_FRAGMENTS = [
  { id: "fragment-alpha", name: "Fragment Alpha", hint: "First piece of the cipher key" },
  { id: "fragment-beta", name: "Fragment Beta", hint: "Server logs reveal timing patterns" },
  { id: "fragment-gamma", name: "Fragment Gamma", hint: "The admin left breadcrumbs" },
  { id: "fragment-delta", name: "Fragment Delta", hint: "Check the response headers" },
  { id: "fragment-omega", name: "Fragment Omega", hint: "Final piece unlocks the vault" },
];

export default function Debug() {
  const { gameState, collectClue, hasClue } = useGame();
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [secretsFound, setSecretsFound] = useState<string[]>([]);
  const [glitchMode, setGlitchMode] = useState(false);

  useEffect(() => {
    // Initialize fake metrics
    const updateMetrics = () => {
      setMetrics([
        { 
          name: "CPU Usage", 
          value: `${Math.floor(Math.random() * 40 + 30)}%`, 
          status: Math.random() > 0.8 ? "WARNING" : "OK",
          icon: <Cpu className="w-4 h-4" />
        },
        { 
          name: "Memory", 
          value: `${Math.floor(Math.random() * 2000 + 1000)}MB`, 
          status: Math.random() > 0.9 ? "CRITICAL" : "OK",
          icon: <HardDrive className="w-4 h-4" />
        },
        { 
          name: "Network", 
          value: `${Math.floor(Math.random() * 100 + 50)}ms`, 
          status: "OK",
          icon: <Wifi className="w-4 h-4" />
        },
        { 
          name: "Disk I/O", 
          value: `${Math.floor(Math.random() * 500 + 100)}KB/s`, 
          status: Math.random() > 0.7 ? "WARNING" : "OK",
          icon: <Activity className="w-4 h-4" />
        },
      ]);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Add fake log entries
    const logInterval = setInterval(() => {
      const newLog = generateLogEntry();
      setLogs(prev => [newLog, ...prev].slice(0, 50));
      
      // Random glitch
      if (Math.random() > 0.95) {
        setGlitchMode(true);
        setTimeout(() => setGlitchMode(false), 200);
      }
    }, 2000);

    return () => clearInterval(logInterval);
  }, []);

  const generateLogEntry = () => {
    const types = ["INFO", "DEBUG", "WARN", "ERROR", "TRACE", "RECON", "INTEL"];
    const missionRef = MISSION_CODENAMES[Math.floor(Math.random() * MISSION_CODENAMES.length)];
    const clueRef = CLUE_FRAGMENTS[Math.floor(Math.random() * CLUE_FRAGMENTS.length)];
    const messages = [
      "Connection pool refreshed",
      "Cache invalidation triggered",
      "Session heartbeat received",
      "Quantum state observed",
      "Probability field fluctuation detected",
      "Observer pattern engaged",
      "Memory fragment recovered",
      "Void proximity warning",
      "Temporal anomaly logged",
      "User behavior analyzed",
      `Mission [${missionRef}] status: ACTIVE`,
      `Clue detected: ${clueRef.name} - ${clueRef.hint}`,
      `Target acquired for operation ${missionRef}`,
      "C2 beacon received from remote agent",
      "QR payload decoded successfully",
      `Encrypted channel opened: ${missionRef.toLowerCase().replace(/ /g, '-')}`,
      "Atropos scan results pending review",
      `Agent check-in: ${missionRef} operative online`,
      "Exfiltration queue: 3 items pending",
      "Firewall bypass successful - maintaining stealth",
      `Intel drop received: ${clueRef.hint}`,
      "Network pivot established through proxy chain",
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    return `[${time}] ${type}: ${msg}`;
  };

  const handleMetricClick = (metricName: string) => {
    const secret = SYSTEM_SECRETS.find(s => 
      metricName.toLowerCase().includes(s.trigger)
    );
    
    if (secret && !secretsFound.includes(secret.trigger)) {
      setSecretsFound(prev => [...prev, secret.trigger]);
      
      const clueId = `debug-${secret.trigger}`;
      if (!hasClue(clueId)) {
        collectClue({
          id: clueId,
          name: `Debug: ${metricName} Analysis`,
          description: "Discovered a hidden message in system diagnostics.",
          content: secret.message,
          foundAt: new Date().toISOString()
        });
      }
    }
  };

  const getStatusColor = (status: SystemMetric["status"]) => {
    switch (status) {
      case "OK": return "text-amber-500";
      case "WARNING": return "text-orange-500";
      case "CRITICAL": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className={`terminal-panel min-h-screen bg-[hsl(var(--card))] text-foreground font-mono ${glitchMode ? 'animate-pulse' : ''}`}>
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-[hsl(var(--card))]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bug className="w-6 h-6 text-amber-600" />
            <h1 className="font-orbitron text-xl font-bold">
              <span className="text-amber-600">DEBUG</span> CONSOLE
            </h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-amber-500" data-testid="link-home">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* System Status Warning */}
        <div className="mb-6 p-4 bg-amber-950/30 border border-amber-700/50 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-500 font-bold text-sm">DEBUG MODE ACTIVE</p>
            <p className="text-muted-foreground text-xs">
              System diagnostics exposed. Click on metrics to analyze subsystems.
              Anomalies may contain hidden information.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleMetricClick(metric.name)}
              className="cursor-pointer"
            >
              <Card className={`bg-[hsl(var(--card))] border-amber-900/30 hover:border-amber-600/50 transition-all ${
                secretsFound.some(s => metric.name.toLowerCase().includes(s)) ? 'ring-1 ring-amber-500' : ''
              }`} data-testid={`card-metric-${metric.name.toLowerCase().replace(' ', '-')}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                    {metric.icon} {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className={`text-xs ${getStatusColor(metric.status)}`}>
                    Status: {metric.status}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Live Logs */}
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-amber-500 font-mono flex items-center gap-2">
              <Terminal className="w-5 h-5" /> System Logs
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearLogs}
              className="text-muted-foreground hover:text-amber-500"
              data-testid="button-clear-logs"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-black/50 rounded p-4 h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">Waiting for log entries...</p>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`mb-1 ${
                      log.includes('ERROR') ? 'text-red-500' :
                      log.includes('WARN') ? 'text-yellow-500' :
                      log.includes('DEBUG') ? 'text-purple-400' :
                      'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hidden Message - appears after finding secrets */}
        {secretsFound.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-purple-950/20 border border-purple-700/30 rounded-lg text-center"
          >
            <p className="text-purple-400 font-orbitron">
              SYSTEM ANOMALY DETECTED
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              You have uncovered {secretsFound.length} hidden diagnostics.
              The debug console reveals more than it should.
            </p>
            <p className="text-amber-600 text-xs mt-4 font-mono">
              HINT: The patterns connect. Follow the numbers.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
