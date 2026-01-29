import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Finding } from '@/config/reportTemplate';

interface ToolOutput {
  id: string;
  timestamp: string;
  type: 'scan' | 'recon' | 'analysis' | 'finding' | 'evidence';
  source: string;
  content: string;
  metadata?: Record<string, any>;
}

interface ReportContextType {
  toolOutputs: ToolOutput[];
  pendingFindings: Partial<Finding>[];
  addToolOutput: (output: Omit<ToolOutput, 'id' | 'timestamp'>) => void;
  addPendingFinding: (finding: Partial<Finding>) => void;
  removePendingFinding: (index: number) => void;
  clearToolOutputs: () => void;
  exportToReport: () => { toolOutputs: ToolOutput[]; pendingFindings: Partial<Finding>[] };
}

const ReportContext = createContext<ReportContextType | null>(null);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [toolOutputs, setToolOutputs] = useState<ToolOutput[]>([]);
  const [pendingFindings, setPendingFindings] = useState<Partial<Finding>[]>([]);

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
    return { toolOutputs, pendingFindings };
  }, [toolOutputs, pendingFindings]);

  return (
    <ReportContext.Provider value={{
      toolOutputs,
      pendingFindings,
      addToolOutput,
      addPendingFinding,
      removePendingFinding,
      clearToolOutputs,
      exportToReport
    }}>
      {children}
    </ReportContext.Provider>
  );
}

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
