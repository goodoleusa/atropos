import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export function AtroposScannerPanel() {
  const { data: health } = useQuery({
    queryKey: ["/api/atropos/health"],
    queryFn: () => fetch("/api/atropos/health").then(r => r.json())
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-orbitron text-amber-600 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Atropos Scanner
          </h3>
          <p className="text-xs text-stone-500 mt-1">Status and health of the Rust-based OSINT scanner.</p>
        </div>
        {health?.status === "ok" ? (
          <Badge className="bg-emerald-900/30 text-emerald-500 border-emerald-900/50">Scanner Online</Badge>
        ) : (
          <Badge variant="outline" className="border-red-900/50 text-red-500">Scanner Offline</Badge>
        )}
      </div>

      <Card className="bg-[#0a0500] border-amber-900/30">
        <CardHeader>
          <CardTitle className="text-amber-500 text-sm font-mono">Scanner Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500">Binary Path:</span>
            <span className="text-stone-300 font-mono">{health?.binary?.path || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Available:</span>
            <span className={health?.binary?.available ? "text-emerald-500" : "text-red-500"}>
              {health?.binary?.available ? "Yes" : "No"}
            </span>
          </div>
          {!health?.binary?.available && (
            <div className="mt-4 p-2 bg-red-900/20 border border-red-900/30 rounded text-red-400">
              Error: {health?.binary?.error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
