// TEMPLATE: Admin Feedback Section
// Shows agent-reported bugs, ideas, and improvements.
// Copy this pattern for other admin sections.

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// TEMPLATE: Define your item type matching the schema
interface FeedbackItem {
  id: number;
  type: string;
  source: string;
  status: string;
  priority: string;
  title: string;
  description: string;
  tags: string[];
  votes: number;
  createdAt: string;
}

// TEMPLATE: Section component pattern — self-contained with its own data fetching
export function FeedbackSection() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  // TEMPLATE: Fetch data with auto-refresh
  const { data: items = [], isLoading } = useQuery<FeedbackItem[]>({
    queryKey: ["/api/feedback"],
    refetchInterval: 30000,
  });

  // TEMPLATE: Mutation pattern for updates
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/feedback"] }),
  });

  // TEMPLATE: Client-side filtering
  const filtered = items.filter(item => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4" data-testid="feedback-section">
      {/* TEMPLATE: Filter bar */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48 h-8 text-xs"
          data-testid="feedback-search"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32 h-8 text-xs" data-testid="filter-type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="idea">Idea</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">{filtered.length} items</Badge>
      </div>

      {/* TEMPLATE: Item list */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        {isLoading ? (
          <div className="text-center py-8 opacity-50">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 opacity-50">No feedback yet</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <Card key={item.id} data-testid={`feedback-item-${item.id}`}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{item.title}</span>
                        <Badge className="text-[10px]">{item.priority}</Badge>
                        <Badge variant="outline" className="text-[10px]">{item.source}</Badge>
                      </div>
                      <p className="text-xs opacity-70 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    {/* TEMPLATE: Inline status control */}
                    <Select
                      value={item.status}
                      onValueChange={(val) => updateStatus.mutate({ id: item.id, status: val })}
                    >
                      <SelectTrigger className="h-6 w-24 text-[10px]" data-testid={`status-${item.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
