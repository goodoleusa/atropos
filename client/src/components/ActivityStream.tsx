import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Bot, Radar, Eye, Shield, Globe, FileText, 
  Clock, CheckCircle2, AlertTriangle, Loader2, Send,
  Archive, Filter, RefreshCw
} from 'lucide-react';
import { useMissionActivity, useMissionStats, useBackgroundTasks, type ActivityItem } from '@/hooks/useMissionBus';
import { SendToMenu } from './SendToMenu';
import type { MissionFinding } from '@/hooks/useMissionBus';

const SOURCE_CONFIG: Record<string, { icon: typeof Bot; color: string; label: string }> = {
  nexus: { icon: Bot, color: 'text-teal-800', label: 'NEXUS' },
  agent: { icon: Shield, color: 'text-amber-800', label: 'Agent' },
  scanner: { icon: Radar, color: 'text-blue-400', label: 'Scanner' },
  spiderfoot: { icon: Globe, color: 'text-purple-700', label: 'SpiderFoot' },
  manual: { icon: FileText, color: 'text-muted-foreground', label: 'Manual' },
  agent_analysis: { icon: Shield, color: 'text-amber-800', label: 'Analysis' },
  scan: { icon: Radar, color: 'text-blue-400', label: 'Scan' },
  compression: { icon: Archive, color: 'text-muted-foreground', label: 'Memory' },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-900/30 text-red-700 border-red-700',
  high: 'bg-orange-900/30 text-orange-800 border-orange-700',
  medium: 'bg-amber-900/30 text-amber-800 border-amber-700',
  low: 'bg-teal-900/30 text-teal-800 border-teal-700',
  info: 'bg-border/50 text-muted-foreground border-border',
};

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  running: Loader2,
  completed: CheckCircle2,
  failed: AlertTriangle,
  new: Activity,
  sent: Send,
  reviewing: Eye,
  archived: Archive,
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ActivityItemRow({ item }: { item: ActivityItem }) {
  const cfg = SOURCE_CONFIG[item.source] || SOURCE_CONFIG.manual;
  const Icon = cfg.icon;
  const StatusIcon = STATUS_ICONS[item.status] || Activity;
  const isTask = item.kind === 'task';

  const findingForSendTo: MissionFinding | null = item.kind === 'finding' ? {
    id: item.id,
    sessionToken: null,
    source: item.source,
    sourceAgent: item.sourceAgent || null,
    type: item.type || 'finding',
    title: item.title,
    content: item.content || '',
    severity: item.severity || null,
    status: item.status,
    sentTo: item.sentTo || [],
    metadata: item.metadata || {},
    createdAt: item.timestamp,
  } : null;

  return (
    <div className="flex items-start gap-3 p-3 border-b border-border/50 hover:bg-card/30 transition-colors group" data-testid={`activity-item-${item.id}`}>
      <div className={`mt-0.5 p-1.5 rounded ${cfg.color} bg-card/50`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-foreground truncate">{item.title}</span>
          {item.severity && (
            <Badge variant="outline" className={`text-[9px] px-1 py-0 ${SEVERITY_COLORS[item.severity] || ''}`}>
              {item.severity}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className={cfg.color}>{cfg.label}</span>
          {item.sourceAgent && <span>· {item.sourceAgent}</span>}
          <span>· {timeAgo(item.timestamp)}</span>
          {isTask && item.progress !== undefined && item.status === 'running' && (
            <span className="text-amber-800">{item.progress}%</span>
          )}
          <StatusIcon className={`w-3 h-3 ${item.status === 'running' ? 'animate-spin text-amber-800' : item.status === 'completed' ? 'text-emerald-400' : item.status === 'failed' ? 'text-red-700' : 'text-muted-foreground'}`} />
        </div>
        {item.content && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{item.content.slice(0, 150)}</p>
        )}
        {item.sentTo && item.sentTo.length > 0 && (
          <div className="flex gap-1 mt-1">
            {item.sentTo.map(t => (
              <Badge key={t} variant="outline" className="text-[8px] border-border text-muted-foreground">{t}</Badge>
            ))}
          </div>
        )}
      </div>
      {findingForSendTo && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <SendToMenu finding={findingForSendTo} compact />
        </div>
      )}
    </div>
  );
}

export function ActivityStream({ limit = 30 }: { limit?: number }) {
  const { data: activity = [], isLoading } = useMissionActivity(limit);
  const { data: stats } = useMissionStats();
  const { data: runningTasks = [] } = useBackgroundTasks('running');
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? activity : activity.filter(a => a.source === filter || a.kind === filter);

  return (
    <div className="space-y-3" data-testid="activity-stream">
      {runningTasks.length > 0 && (
        <div className="space-y-1">
          {runningTasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 px-3 py-2 bg-amber-900/10 border border-amber-900/20 rounded text-xs">
              <Loader2 className="w-3 h-3 animate-spin text-amber-800" />
              <span className="text-amber-300">{task.taskName}</span>
              <span className="text-amber-800 ml-auto">{task.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground cursor-pointer hover:border-amber-700" onClick={() => setFilter('all')} data-testid="filter-all">
            All ({stats.total})
          </Badge>
          {stats.bySource.map(s => {
            const cfg = SOURCE_CONFIG[s.source] || SOURCE_CONFIG.manual;
            return (
              <Badge key={s.source} variant="outline" className={`text-[10px] border-border ${cfg.color} cursor-pointer hover:border-amber-700`} onClick={() => setFilter(s.source)} data-testid={`filter-${s.source}`}>
                {cfg.label} ({s.count})
              </Badge>
            );
          })}
          {stats.new > 0 && (
            <Badge variant="outline" className="text-[10px] border-emerald-800 text-emerald-400">
              {stats.new} new
            </Badge>
          )}
        </div>
      )}

      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <Activity className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs">Findings from NEXUS, agents, and scanners will appear here</p>
          </div>
        ) : (
          <div>
            {filtered.map(item => (
              <ActivityItemRow key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
