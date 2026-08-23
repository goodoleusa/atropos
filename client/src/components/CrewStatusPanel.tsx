import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Bug, Eye, Radar, Lock, Network, Brain, Zap, Activity, ArrowRight } from 'lucide-react';
import { useBackgroundTasks, useMissionFindings } from '@/hooks/useMissionBus';
import { useLocation } from 'wouter';

const CREW_AGENTS = [
  { id: 'vuln_analyst', name: 'VulnAnalyst', icon: Bug, color: 'text-red-700', bg: 'bg-red-500/10', border: 'border-red-500/20', role: 'Vulnerability assessment' },
  { id: 'osint_analyst', name: 'OSINTAnalyst', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', role: 'Open-source intelligence' },
  { id: 'threat_intel', name: 'ThreatIntel', icon: Radar, color: 'text-purple-700', bg: 'bg-purple-500/10', border: 'border-purple-500/20', role: 'Threat intelligence analysis' },
  { id: 'secret_hunter', name: 'SecretHunter', icon: Lock, color: 'text-amber-800', bg: 'bg-amber-500/10', border: 'border-amber-500/20', role: 'Credential & secret detection' },
  { id: 'network_recon', name: 'NetworkRecon', icon: Network, color: 'text-teal-800', bg: 'bg-teal-500/10', border: 'border-teal-500/20', role: 'Network reconnaissance' },
  { id: 'synthesis', name: 'Synthesis', icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', role: 'Cross-analysis synthesis' },
] as const;

export function CrewStatusPanel({ compact = false }: { compact?: boolean }) {
  const [, setLocation] = useLocation();
  const { data: tasks = [] } = useBackgroundTasks();
  const { data: findings = [] } = useMissionFindings({ source: 'agent', limit: 20 });

  const agentActivity = CREW_AGENTS.map(agent => {
    const agentFindings = findings.filter(f => f.sourceAgent === agent.id);
    const agentTasks = tasks.filter(t => t.metadata?.agentId === agent.id);
    const isRunning = agentTasks.some(t => t.status === 'running');
    const lastRun = agentFindings[0]?.createdAt;
    return { ...agent, findingsCount: agentFindings.length, isRunning, lastRun };
  });

  const totalFindings = findings.length;
  const runningCount = agentActivity.filter(a => a.isRunning).length;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2" data-testid="crew-status-compact">
        <Bot className="w-3.5 h-3.5 text-teal-800" />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Crew</span>
        <div className="flex gap-1">
          {agentActivity.map(a => (
            <div
              key={a.id}
              className={`w-2 h-2 rounded-full ${a.isRunning ? 'bg-amber-400 animate-pulse' : a.findingsCount > 0 ? 'bg-teal-400' : 'bg-border'}`}
              title={`${a.name}: ${a.isRunning ? 'Running' : a.findingsCount > 0 ? `${a.findingsCount} findings` : 'Standby'}`}
              data-testid={`crew-dot-${a.id}`}
            />
          ))}
        </div>
        {runningCount > 0 && (
          <Badge variant="outline" className="text-[8px] border-amber-500/30 text-amber-800 px-1 py-0 h-4">
            {runningCount} active
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-[hsl(var(--card))] border-border/50" data-testid="crew-status-panel">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-xs font-medium flex items-center gap-2 text-foreground">
          <Zap className="w-3.5 h-3.5 text-teal-800" />
          NEXUS CREW
          <Badge variant="outline" className="ml-auto text-[8px] border-border text-muted-foreground">
            {totalFindings} findings
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-1.5">
        {agentActivity.map(agent => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              className={`flex items-center gap-2 p-1.5 rounded ${agent.bg} border ${agent.border} group cursor-pointer hover:brightness-125 transition-all`}
              onClick={() => setLocation(`/agents?agent=${agent.id}`)}
              data-testid={`crew-agent-${agent.id}`}
            >
              <Icon className={`w-3.5 h-3.5 ${agent.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-medium ${agent.color}`}>{agent.name}</span>
                  {agent.isRunning ? (
                    <Badge className="text-[7px] bg-amber-500/20 text-amber-800 border-amber-500/30 px-1 py-0 h-3.5 animate-pulse">
                      RUNNING
                    </Badge>
                  ) : agent.findingsCount > 0 ? (
                    <Badge variant="outline" className="text-[7px] border-border text-muted-foreground px-1 py-0 h-3.5">
                      {agent.findingsCount}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[7px] border-border text-muted-foreground px-1 py-0 h-3.5">
                      STANDBY
                    </Badge>
                  )}
                </div>
                <p className="text-[8px] text-muted-foreground truncate">{agent.role}</p>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-muted-foreground transition-colors" />
            </div>
          );
        })}

        <div className="pt-1 flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-6 text-[9px] border-teal-900/30 text-teal-800 hover:bg-teal-500/10"
            onClick={() => setLocation('/agents')}
            data-testid="crew-deploy-all"
          >
            <Activity className="w-3 h-3 mr-1" />
            Deploy Crew
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
