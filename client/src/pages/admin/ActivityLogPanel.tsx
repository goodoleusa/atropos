import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Terminal, Users, Activity, Clock } from "lucide-react";

export function ActivityLogPanel() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data, isLoading, refetch } = useQuery<{ activities: any[]; total: number }>({
    queryKey: ["/api/admin/activity-log"],
    queryFn: () => fetch("/api/admin/activity-log?limit=100").then(r => r.json()),
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const activities = data?.activities || [];

  const typeIcon = (type: string) => {
    switch (type) {
      case 'command': return <Terminal className="w-3.5 h-3.5 text-amber-500" />;
      case 'session': return <Users className="w-3.5 h-3.5 text-teal-500" />;
      case 'behavior': return <Activity className="w-3.5 h-3.5 text-purple-500" />;
      default: return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'command': return 'border-amber-900/30 bg-amber-950/10';
      case 'session': return 'border-teal-900/30 bg-teal-950/10';
      case 'behavior': return 'border-purple-900/30 bg-purple-950/10';
      default: return 'border-border bg-card/10';
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading activity log...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-amber-500 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Real-Time Activity Log
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-muted-foreground text-xs">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              data-testid="activity-auto-refresh"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="border-amber-900/50 text-amber-500 h-8"
            data-testid="activity-refresh-btn"
          >
            Refresh
          </Button>
          <Badge variant="outline" className="border-amber-900/50 text-amber-400">
            {activities.length} events
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <Card className="bg-amber-950/20 border-amber-900/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {activities.filter(a => a.type === 'command').length}
            </p>
            <p className="text-xs text-muted-foreground">Commands</p>
          </CardContent>
        </Card>
        <Card className="bg-teal-950/20 border-teal-900/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-teal-400">
              {activities.filter(a => a.type === 'session').length}
            </p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-950/20 border-purple-900/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {activities.filter(a => a.type === 'behavior').length}
            </p>
            <p className="text-xs text-muted-foreground">Behaviors</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[hsl(var(--card))] border-amber-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
            <Clock className="w-4 h-4" /> Live Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No activity recorded yet</p>
              </div>
            ) : activities.map((act) => (
              <div
                key={act.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${typeColor(act.type)} transition-all hover:opacity-90`}
                data-testid={`activity-row-${act.id}`}
              >
                <div className="flex-shrink-0">{typeIcon(act.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{act.description}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{act.detail}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                    {act.type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatTime(act.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
