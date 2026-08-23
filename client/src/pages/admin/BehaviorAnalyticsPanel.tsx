import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, BookOpen } from "lucide-react";

export function BehaviorAnalyticsPanel() {
  const [trends, setTrends] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    loadData();
  }, [selectedDays]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trendsRes, eventsRes] = await Promise.all([
        fetch(`/api/behavior/trends?days=${selectedDays}`).then(r => r.json()),
        fetch('/api/behavior/events?limit=50').then(r => r.json())
      ]);
      setTrends(trendsRes);
      setEvents(eventsRes);
    } catch (error) {
      console.error('Failed to load behavior data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading behavioral analytics...
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    'aggressive': 'bg-red-900/30 text-red-700',
    'cautious': 'bg-blue-900/30 text-blue-400',
    'curious': 'bg-purple-900/30 text-purple-700',
    'analytical': 'bg-teal-900/30 text-teal-800',
    'jailbreak': 'bg-red-900/50 text-red-300 border border-red-700',
    'stalking': 'bg-orange-900/50 text-orange-300 border border-orange-700',
    'illegal': 'bg-red-950/50 text-red-200 border border-red-600',
    'suspicious': 'bg-amber-900/50 text-amber-300 border border-amber-700',
    'normal': 'bg-card/30 text-muted-foreground'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-red-700 flex items-center gap-2">
          <Eye className="w-5 h-5" /> Behavioral Analytics & User Profiling
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Time Range:</span>
          {[7, 14, 30].map(days => (
            <Button
              key={days}
              variant={selectedDays === days ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDays(days)}
              className={selectedDays === days ? "bg-red-800 text-white" : "border-red-900/50 text-red-700"}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-[hsl(var(--card))] border-red-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 text-sm font-mono">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{trends?.totalEvents || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-teal-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-teal-800 text-sm font-mono">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-800">{trends?.uniqueUsers || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 text-sm font-mono">Flagged Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-800">{trends?.flaggedSessions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--card))] border-purple-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-purple-700 text-sm font-mono">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{trends?.categoryDistribution?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Sessions Alert */}
      {trends?.flaggedSessions?.length > 0 && (
        <Card className="bg-red-950/20 border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 font-mono flex items-center gap-2">
              <EyeOff className="w-4 h-4" /> Flagged Sessions (Sandboxed & Playing Along)
            </CardTitle>
            <CardDescription className="text-red-300/70">
              These sessions triggered behavioral flags but are still active in sandbox mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends.flaggedSessions.map((session: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-red-950/30 p-2 rounded border border-red-900/50">
                  <div className="flex items-center gap-3">
                    <code className="text-xs text-red-300 font-mono">{session.sessionToken?.substring(0, 12)}...</code>
                    <Badge className={categoryColors[session.reason] || categoryColors.normal}>
                      {session.reason}
                    </Badge>
                    <Badge variant="outline" className="text-red-700 border-red-800 text-[10px]">
                      {session.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {session.sandboxed && <Badge className="bg-amber-900/30 text-amber-800">SANDBOXED</Badge>}
                    {session.playAlong && <Badge className="bg-teal-900/30 text-teal-800">PLAY ALONG</Badge>}
                    <span>{new Date(session.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="bg-[hsl(var(--card))] border-amber-900/30">
          <CardHeader>
            <CardTitle className="text-amber-800 font-mono text-sm">Behavior Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends?.categoryDistribution?.map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <Badge className={categoryColors[cat.category] || categoryColors.normal}>
                    {cat.category}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-border rounded-full h-2">
                      <div 
                        className="bg-amber-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (cat.count / (trends.totalEvents || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
              {(!trends?.categoryDistribution || trends.categoryDistribution.length === 0) && (
                <p className="text-muted-foreground text-sm">No behavioral data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Types */}
        <Card className="bg-[hsl(var(--card))] border-teal-900/30">
          <CardHeader>
            <CardTitle className="text-teal-800 font-mono text-sm">Action Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends?.actionTypeDistribution?.map((action: any) => (
                <div key={action.actionType} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{action.actionType}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-border rounded-full h-2">
                      <div 
                        className="bg-teal-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (action.count / (trends.totalEvents || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{action.count}</span>
                  </div>
                </div>
              ))}
              {(!trends?.actionTypeDistribution || trends.actionTypeDistribution.length === 0) && (
                <p className="text-muted-foreground text-sm">No action data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="bg-[hsl(var(--card))] border-border">
        <CardHeader>
          <CardTitle className="text-muted-foreground font-mono text-sm">Recent Behavioral Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {events.map((event: any) => (
              <div 
                key={event.id} 
                className="flex items-center justify-between py-1.5 px-2 bg-card/30 rounded text-xs border border-border/50"
              >
                <div className="flex items-center gap-2">
                  <code className="text-muted-foreground font-mono">{event.sessionToken?.substring(0, 8)}...</code>
                  <span className="text-muted-foreground">{event.actionType}</span>
                  <Badge className={categoryColors[event.category] || categoryColors.normal} variant="outline">
                    {event.category}
                  </Badge>
                </div>
                <span className="text-muted-foreground text-[10px]">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">No behavioral events recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interests & Learning Patterns */}
      <Card className="bg-[hsl(var(--card))] border-purple-900/30">
        <CardHeader>
          <CardTitle className="text-purple-700 font-mono text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Learning Style & Interest Analysis
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Detected patterns across user sessions for agent customization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs text-muted-foreground mb-2">Common Interests</h4>
              <div className="flex flex-wrap gap-1">
                {['network_analysis', 'osint', 'malware', 'web_security', 'cryptography', 'forensics', 'threat_intel', 'cloud'].map(interest => (
                  <Badge key={interest} variant="outline" className="text-[10px] border-purple-900 text-purple-700">
                    {interest.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs text-muted-foreground mb-2">Learning Styles Detected</h4>
              <div className="flex flex-wrap gap-1">
                {['experiential', 'visual', 'analytical', 'pragmatic', 'social'].map(style => (
                  <Badge key={style} variant="outline" className="text-[10px] border-teal-900 text-teal-800">
                    {style}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
