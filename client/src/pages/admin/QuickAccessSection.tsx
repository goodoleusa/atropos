import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Users, Activity } from "lucide-react";

export function QuickAccessSection() {
  const { data: health } = useQuery({
    queryKey: ["/api/atropos/health"],
    queryFn: () => fetch("/api/atropos/health").then(r => r.json())
  });

  const { data: sessions } = useQuery<any[]>({
    queryKey: ['/api/sessions'],
    queryFn: () => fetch('/api/sessions', {
      headers: { 'x-access-token': localStorage.getItem('APP_ACCESS_TOKEN') || '' }
    }).then(r => r.ok ? r.json() : [])
  });

  const { data: activityData } = useQuery<{ activities: any[]; total: number }>({
    queryKey: ["/api/admin/activity-log", "quick"],
    queryFn: () => fetch("/api/admin/activity-log?limit=5").then(r => r.json()),
    refetchInterval: 15000,
  });

  const activeSessions = sessions?.filter(s => {
    const lastActive = new Date(s.lastActiveAt || s.createdAt);
    return (Date.now() - lastActive.getTime()) < 5 * 60 * 1000;
  }) || [];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-[#0a0500] border-red-900/20 hover:border-red-700/40 transition-colors shadow-sm" data-testid="quick-access-atropos">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">Scanner Status</span>
              </div>
              {health?.status === "ok" ? (
                <Badge className="bg-emerald-950/30 text-emerald-500 border-emerald-900/30 text-[9px] h-5 px-1.5 font-bold uppercase">Online</Badge>
              ) : (
                <Badge variant="outline" className="border-red-900/30 text-red-500 text-[9px] h-5 px-1.5 font-bold uppercase">Offline</Badge>
              )}
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-500">Binary Engine</span>
                <span className={`text-[10px] font-mono ${health?.binary?.available ? 'text-emerald-500' : 'text-red-500'}`}>
                  {health?.binary?.available ? 'READY' : 'MISSING'}
                </span>
              </div>
              {health?.binary?.path && (
                <div className="bg-black/40 p-1.5 rounded border border-stone-900 overflow-hidden">
                  <p className="text-[9px] text-stone-600 font-mono truncate lowercase">{health.binary.path}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0500] border-teal-900/20 hover:border-teal-700/40 transition-colors shadow-sm" data-testid="quick-access-sessions">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-500" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">Active Matrix</span>
              </div>
              <Badge variant="outline" className="border-teal-900/30 text-teal-500 text-[9px] h-5 px-1.5 font-bold">
                {sessions?.length || 0} TOTAL
              </Badge>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-orbitron font-bold text-teal-400 leading-none">
                  {activeSessions.length}
                </p>
                <p className="text-[9px] text-stone-600 uppercase mt-1 font-bold tracking-tighter">Players Connected</p>
              </div>
              <div className="flex -space-x-1">
                {[...Array(Math.min(activeSessions.length, 5))].map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-teal-950 border border-teal-900 flex items-center justify-center">
                    <Users className="w-2.5 h-2.5 text-teal-500" />
                  </div>
                ))}
                {activeSessions.length > 5 && (
                  <div className="w-5 h-5 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-[8px] text-stone-500 font-bold">
                    +{activeSessions.length - 5}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0500] border-amber-900/20 hover:border-amber-700/40 transition-colors shadow-sm sm:col-span-2 lg:col-span-1" data-testid="quick-access-activity">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tight">Telemetry Stream</span>
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[8px] text-amber-600 font-mono font-bold uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="space-y-1.5 h-[44px] overflow-hidden">
              {(activityData?.activities || []).slice(0, 2).map((act, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <div className={`w-1 h-1 rounded-full shrink-0 ${
                    act.type === 'command' ? 'bg-amber-500' :
                    act.type === 'session' ? 'bg-teal-500' : 'bg-purple-500'
                  }`} />
                  <span className="text-[10px] text-stone-400 truncate flex-1 group-hover:text-stone-200 transition-colors">{act.description}</span>
                  <span className="text-[8px] text-stone-700 font-mono shrink-0">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {(!activityData?.activities || activityData.activities.length === 0) && (
                <p className="text-[10px] text-stone-700 italic">Standby - waiting for data...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
