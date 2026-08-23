import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server } from "lucide-react";

export function SessionsPanel() {
  const { data: sessions, isLoading } = useQuery<any[]>({
    queryKey: ['/api/sessions'],
    queryFn: () => fetch('/api/sessions', {
      headers: { 'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || '' }
    }).then(r => r.ok ? r.json() : [])
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading sessions...
      </div>
    );
  }

  const activeSessions = sessions?.filter(s => {
    const lastActive = new Date(s.lastActiveAt || s.createdAt);
    return (Date.now() - lastActive.getTime()) < 5 * 60 * 1000;
  }) || [];

  if (!sessions || sessions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-orbitron text-amber-800">Player Sessions</h3>
          <Badge className="bg-amber-900/50 text-amber-800">Live View</Badge>
        </div>
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardContent className="p-8 text-center">
            <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No Active Sessions</p>
            <p className="text-muted-foreground text-sm">Session data will appear here when players interact with the terminal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-orbitron text-amber-800">Player Sessions</h3>
        <Badge className="bg-teal-900/50 text-teal-800">{activeSessions.length} Active</Badge>
      </div>
      
      <div className="grid gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-teal-950/20 border-teal-900/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-teal-800">{activeSessions.length}</p>
              <p className="text-xs text-muted-foreground">Active Now</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-950/20 border-amber-900/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-800">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
            </CardContent>
          </Card>
          <Card className="bg-teal-950/20 border-teal-900/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-teal-800">
                {sessions.reduce((acc, s) => acc + (s.cluesCollected || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Clues Collected</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-950/20 border-purple-900/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {sessions.reduce((acc, s) => acc + (s.questsCompleted || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Quests Completed</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-800 text-sm flex items-center gap-2">
              <Server className="w-4 h-4" /> Recent Player Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {sessions.slice(0, 20).map((session, i) => {
                const lastActive = new Date(session.lastActiveAt || session.createdAt);
                const isActive = (Date.now() - lastActive.getTime()) < 5 * 60 * 1000;
                const isIdle = !isActive && (Date.now() - lastActive.getTime()) < 60 * 60 * 1000;
                
                const timeAgo = (() => {
                  const diff = Date.now() - lastActive.getTime();
                  if (diff < 60000) return 'Just now';
                  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
                  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
                  return `${Math.floor(diff / 86400000)} days ago`;
                })();

                return (
                  <div 
                    key={session.id || i} 
                    className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border"
                    data-testid={`session-row-${i}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-teal-500 animate-pulse' : 
                        isIdle ? 'bg-amber-500' : 'bg-muted'
                      }`} />
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {session.username || `Session ${(session.token || session.id || '').slice(0, 8)}...`}
                        </p>
                        <p className="text-xs text-muted-foreground">{(session.token || session.id || '').slice(0, 12)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <p className="text-amber-800">{session.cluesCollected || 0}</p>
                        <p className="text-muted-foreground">clues</p>
                      </div>
                      <div className="text-center">
                        <p className="text-teal-800">{session.questsCompleted || 0}</p>
                        <p className="text-muted-foreground">quests</p>
                      </div>
                      <Badge variant="outline" className={
                        isActive ? 'border-teal-700 text-teal-800' :
                        isIdle ? 'border-amber-700 text-amber-800' :
                        'border-border text-muted-foreground'
                      } data-testid={`session-status-${i}`}>
                        {timeAgo}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
