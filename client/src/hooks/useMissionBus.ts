import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface MissionFinding {
  id: number;
  sessionToken: string | null;
  source: string;
  sourceAgent: string | null;
  type: string;
  title: string;
  content: string;
  severity: string | null;
  status: string;
  sentTo: string[];
  metadata: Record<string, any>;
  createdAt: string;
}

export interface BackgroundTask {
  id: number;
  sessionToken: string | null;
  taskType: string;
  taskName: string;
  status: string;
  progress: number;
  result: Record<string, any> | null;
  error: string | null;
  metadata: Record<string, any>;
  startedAt: string;
  completedAt: string | null;
}

export interface ActivityItem {
  kind: 'finding' | 'task';
  id: number;
  title: string;
  source: string;
  sourceAgent?: string;
  type?: string;
  severity?: string;
  status: string;
  sentTo?: string[];
  content?: string;
  progress?: number;
  timestamp: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface FindingStats {
  total: number;
  new: number;
  bySource: Array<{ source: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
}

export function useMissionFindings(filters?: { source?: string; type?: string; status?: string; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.source) params.set('source', filters.source);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();

  return useQuery<MissionFinding[]>({
    queryKey: ['/api/mission/findings', qs],
    queryFn: () => fetch(`/api/mission/findings${qs ? `?${qs}` : ''}`).then(r => r.json()),
    refetchInterval: 10000,
  });
}

export function useMissionActivity(limit = 30) {
  return useQuery<ActivityItem[]>({
    queryKey: ['/api/mission/activity', limit],
    queryFn: () => fetch(`/api/mission/activity?limit=${limit}`).then(r => r.json()),
    refetchInterval: 8000,
  });
}

export function useMissionStats() {
  return useQuery<FindingStats>({
    queryKey: ['/api/mission/findings/stats'],
    queryFn: () => fetch('/api/mission/findings/stats').then(r => r.json()),
    refetchInterval: 15000,
  });
}

export function useBackgroundTasks(status?: string) {
  const qs = status ? `?status=${status}` : '';
  return useQuery<BackgroundTask[]>({
    queryKey: ['/api/mission/tasks', status],
    queryFn: () => fetch(`/api/mission/tasks${qs}`).then(r => r.json()),
    refetchInterval: 5000,
  });
}

export function useAddFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (finding: Omit<MissionFinding, 'id' | 'createdAt'>) => {
      const res = await apiRequest('POST', '/api/mission/findings', finding);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/mission/findings'] });
      qc.invalidateQueries({ queryKey: ['/api/mission/activity'] });
      qc.invalidateQueries({ queryKey: ['/api/mission/findings/stats'] });
    },
  });
}

export function useUpdateFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; status?: string; sentTo?: string[] }) => {
      const res = await apiRequest('PATCH', `/api/mission/findings/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/mission/findings'] });
      qc.invalidateQueries({ queryKey: ['/api/mission/activity'] });
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: Omit<BackgroundTask, 'id' | 'startedAt' | 'completedAt'>) => {
      const res = await apiRequest('POST', '/api/mission/tasks', task);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/mission/tasks'] });
      qc.invalidateQueries({ queryKey: ['/api/mission/activity'] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; status?: string; progress?: number; result?: any; error?: string }) => {
      const res = await apiRequest('PATCH', `/api/mission/tasks/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/mission/tasks'] });
      qc.invalidateQueries({ queryKey: ['/api/mission/activity'] });
    },
  });
}

export function useSendTo() {
  const updateFinding = useUpdateFinding();
  
  return {
    sendToReportBuilder: (finding: MissionFinding) => {
      updateFinding.mutate({ id: finding.id, status: 'sent', sentTo: [...finding.sentTo, 'report-builder'] });
      return finding;
    },
    sendToNexus: (finding: MissionFinding) => {
      updateFinding.mutate({ id: finding.id, status: 'sent', sentTo: [...finding.sentTo, 'nexus'] });
      return finding;
    },
    sendToScanner: (finding: MissionFinding) => {
      updateFinding.mutate({ id: finding.id, status: 'sent', sentTo: [...finding.sentTo, 'scanner'] });
      return finding;
    },
    sendToPortfolio: (finding: MissionFinding) => {
      updateFinding.mutate({ id: finding.id, status: 'sent', sentTo: [...finding.sentTo, 'portfolio'] });
      return finding;
    },
  };
}
