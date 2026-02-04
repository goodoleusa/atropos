import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Finding } from '@/config/reportTemplate';

interface ToolOutput {
  id: string;
  timestamp: string;
  type: 'scan' | 'recon' | 'analysis' | 'finding' | 'evidence';
  source: string;
  content: string;
  metadata?: Record<string, any>;
}

interface InvestigationTarget {
  id: string;
  type: 'ip' | 'domain' | 'url' | 'system' | 'api' | 'custom';
  value: string;
  name?: string;
  notes?: string;
  addedAt: string;
}

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  campaign?: string;
}

interface ModelBenchmark {
  modelId: string;
  modelName: string;
  wins: number;
  losses: number;
  ties: number;
  avgLatency: number;
  avgScore: number;
}

interface InvestigationSession {
  id: string;
  name: string;
  startedAt: string;
  targets: InvestigationTarget[];
  activeCampaign?: string;
  agentMessages: AgentMessage[];
  modelBenchmarks: ModelBenchmark[];
}

interface ReportContextType {
  toolOutputs: ToolOutput[];
  pendingFindings: Partial<Finding>[];
  currentSession: InvestigationSession | null;
  targets: InvestigationTarget[];
  addToolOutput: (output: Omit<ToolOutput, 'id' | 'timestamp'>) => void;
  addPendingFinding: (finding: Partial<Finding>) => void;
  removePendingFinding: (index: number) => void;
  clearToolOutputs: () => void;
  exportToReport: () => { toolOutputs: ToolOutput[]; pendingFindings: Partial<Finding>[]; session: InvestigationSession | null };
  startSession: (name: string) => void;
  endSession: () => void;
  addTarget: (target: Omit<InvestigationTarget, 'id' | 'addedAt'>) => void;
  removeTarget: (id: string) => void;
  setCampaign: (campaignId: string) => void;
  addAgentMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  updateBenchmarks: (benchmarks: ModelBenchmark[]) => void;
}

const ReportContext = createContext<ReportContextType | null>(null);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [toolOutputs, setToolOutputs] = useState<ToolOutput[]>([]);
  const [pendingFindings, setPendingFindings] = useState<Partial<Finding>[]>([]);
  const [currentSession, setCurrentSession] = useState<InvestigationSession | null>(null);
  const [targets, setTargets] = useState<InvestigationTarget[]>([]);

  // Load saved session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('investigationSession');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentSession(parsed.session || null);
        setTargets(parsed.targets || []);
        setToolOutputs(parsed.toolOutputs || []);
        setPendingFindings(parsed.pendingFindings || []);
      } catch (e) {
        console.error('Failed to parse saved session:', e);
      }
    }
  }, []);

  // Save session to localStorage on changes
  useEffect(() => {
    if (currentSession || targets.length > 0 || toolOutputs.length > 0) {
      localStorage.setItem('investigationSession', JSON.stringify({
        session: currentSession,
        targets,
        toolOutputs,
        pendingFindings
      }));
    }
  }, [currentSession, targets, toolOutputs, pendingFindings]);

  const startSession = useCallback((name: string) => {
    const session: InvestigationSession = {
      id: `session-${Date.now()}`,
      name,
      startedAt: new Date().toISOString(),
      targets: [],
      agentMessages: [],
      modelBenchmarks: []
    };
    setCurrentSession(session);
    setToolOutputs([]);
    setPendingFindings([]);
  }, []);

  const endSession = useCallback(() => {
    setCurrentSession(null);
    localStorage.removeItem('investigationSession');
  }, []);

  const addTarget = useCallback((target: Omit<InvestigationTarget, 'id' | 'addedAt'>) => {
    const newTarget: InvestigationTarget = {
      ...target,
      id: `target-${Date.now()}`,
      addedAt: new Date().toISOString()
    };
    setTargets(prev => [...prev, newTarget]);
    setCurrentSession(prev => prev ? { ...prev, targets: [...prev.targets, newTarget] } : null);
  }, []);

  const removeTarget = useCallback((id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    setCurrentSession(prev => prev ? { ...prev, targets: prev.targets.filter(t => t.id !== id) } : null);
  }, []);

  const setCampaign = useCallback((campaignId: string) => {
    setCurrentSession(prev => prev ? { ...prev, activeCampaign: campaignId } : null);
  }, []);

  const addAgentMessage = useCallback((message: Omit<AgentMessage, 'id' | 'timestamp'>) => {
    const newMessage: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setCurrentSession(prev => prev ? { ...prev, agentMessages: [...prev.agentMessages, newMessage] } : null);
  }, []);

  const updateBenchmarks = useCallback((benchmarks: ModelBenchmark[]) => {
    setCurrentSession(prev => prev ? { ...prev, modelBenchmarks: benchmarks } : null);
  }, []);

  const addToolOutput = useCallback((output: Omit<ToolOutput, 'id' | 'timestamp'>) => {
    const newOutput: ToolOutput = {
      ...output,
      id: `output-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString()
    };
    setToolOutputs(prev => [...prev, newOutput]);
    
    if (output.type === 'finding') {
      setPendingFindings(prev => [...prev, {
        title: output.content.split('\n')[0]?.substring(0, 100) || 'Untitled Finding',
        description: output.content,
        category: output.metadata?.category || 'info_disclosure',
        severity: output.metadata?.severity || 'medium',
        confidence: 'potential',
        status: 'new',
        evidence: [output.content]
      }]);
    }
  }, []);

  const addPendingFinding = useCallback((finding: Partial<Finding>) => {
    setPendingFindings(prev => [...prev, finding]);
  }, []);

  const removePendingFinding = useCallback((index: number) => {
    setPendingFindings(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearToolOutputs = useCallback(() => {
    setToolOutputs([]);
  }, []);

  const exportToReport = useCallback(() => {
    return { toolOutputs, pendingFindings, session: currentSession };
  }, [toolOutputs, pendingFindings, currentSession]);

  return (
    <ReportContext.Provider value={{
      toolOutputs,
      pendingFindings,
      currentSession,
      targets,
      addToolOutput,
      addPendingFinding,
      removePendingFinding,
      clearToolOutputs,
      exportToReport,
      startSession,
      endSession,
      addTarget,
      removeTarget,
      setCampaign,
      addAgentMessage,
      updateBenchmarks
    }}>
      {children}
    </ReportContext.Provider>
  );
}

// Export types for use in other components
export type { InvestigationTarget, AgentMessage, ModelBenchmark, InvestigationSession };

export function useReportContext() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReportContext must be used within a ReportProvider');
  }
  return context;
}

export const FINDING_PATTERNS = [
  { pattern: /found.*vuln|vulnerability.*detected|security.*issue/i, type: 'finding', severity: 'medium' },
  { pattern: /critical.*flaw|rce|remote.*code.*execution/i, type: 'finding', severity: 'critical' },
  { pattern: /sqli|sql.*injection|xss|cross.*site/i, type: 'finding', severity: 'high' },
  { pattern: /exposed.*credential|leaked.*password|api.*key.*found/i, type: 'finding', severity: 'critical' },
  { pattern: /subdomain.*found|discovered.*host|new.*endpoint/i, type: 'recon', severity: 'info' },
  { pattern: /scan.*complete|enumeration.*finished/i, type: 'scan', severity: 'info' },
  { pattern: /analysis.*shows|evidence.*indicates/i, type: 'analysis', severity: 'medium' }
];

export function detectFindingFromMessage(message: string): { detected: boolean; type: string; severity: string } | null {
  for (const { pattern, type, severity } of FINDING_PATTERNS) {
    if (pattern.test(message)) {
      return { detected: true, type, severity };
    }
  }
  return null;
}
