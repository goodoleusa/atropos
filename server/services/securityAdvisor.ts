/**
 * Security Advisor Service
 * Connects user behavior analysis with Atropos OSINT scanner to provide:
 * - Vulnerability recommendations based on user activity
 * - IOC (Indicators of Compromise) updates
 * - CVE recommendations
 * - Code execution behavior analysis
 */
import { storage } from '../storage';
import { atroposService } from './atropos';
import { behaviorAnalyzer, type LearningProfile, type LearningGoal, LEARNING_GOAL_METADATA } from '../behaviorAnalyzer';
import { nanoid } from 'nanoid';

export interface SecurityRecommendation {
  id: string;
  type: 'vulnerability' | 'ioc' | 'cve' | 'behavior' | 'scan';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action?: string;
  atroposScript?: string;
  relatedGoals?: LearningGoal[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserSecurityContext {
  sessionToken: string;
  learningProfile?: LearningProfile;
  recentTargets: string[];
  recentScans: string[];
  behaviorPatterns: string[];
  riskScore: number;
}

export interface IOCUpdate {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
  source: string;
  threatType: string;
  confidence: number;
  lastSeen: string;
}

export interface CVERecommendation {
  cveId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSoftware: string[];
  exploitAvailable: boolean;
  patchAvailable: boolean;
  recommendedAction: string;
  atroposScript?: string;
}

const GOAL_TO_SCAN_MAPPING: Partial<Record<LearningGoal, string[]>> = {
  osint_investigation: ['bbot_scanner.lua', 'amass_osint.lua', 'spiderfoot_osint.lua'],
  penetration_testing: ['sqli_scanner.lua', 'xss_scanner.lua', 'api_fuzzer.lua'],
  vulnerability_research: ['sqli_scanner.lua', 'xss_scanner.lua'],
  threat_hunting: ['threat_intel_scanner.lua'],
  network_security: ['finalrecon_scanner.lua'],
};

const BEHAVIOR_RISK_INDICATORS = [
  { pattern: /(\bsqli\b|sql.*inject|union.*select)/i, risk: 0.3, type: 'sql_injection_interest' },
  { pattern: /(\bxss\b|cross.?site|<script)/i, risk: 0.25, type: 'xss_interest' },
  { pattern: /(shell|reverse.*shell|nc\s+-e|bash\s+-i)/i, risk: 0.4, type: 'shell_access' },
  { pattern: /(password|credential|auth.*bypass)/i, risk: 0.2, type: 'credential_focus' },
  { pattern: /(exploit|payload|0day|zero.?day)/i, risk: 0.35, type: 'exploit_interest' },
  { pattern: /(ransomware|malware|trojan|backdoor)/i, risk: 0.5, type: 'malware_interest' },
];

export class SecurityAdvisorService {
  
  async analyzeUserContext(sessionToken: string): Promise<UserSecurityContext> {
    const toolCalls = await storage.getToolCallsBySession(sessionToken, 50);
    const session = await storage.getSessionByToken(sessionToken);
    
    const recentTargets = Array.from(new Set(toolCalls.map(tc => tc.targetValue).filter(Boolean))) as string[];
    const recentScans = toolCalls.filter(tc => tc.toolKey === 'atropos').map(tc => tc.request?.scriptPath).filter(Boolean);
    
    const behaviorPatterns: string[] = [];
    let riskScore = 0;
    
    const allInputs = toolCalls.map(tc => JSON.stringify(tc.request)).join(' ');
    for (const indicator of BEHAVIOR_RISK_INDICATORS) {
      if (indicator.pattern.test(allInputs)) {
        behaviorPatterns.push(indicator.type);
        riskScore += indicator.risk;
      }
    }
    
    riskScore = Math.min(1, riskScore);
    
    const learningProfile = session?.settings?.learningProfile as LearningProfile | undefined;
    
    return {
      sessionToken,
      learningProfile,
      recentTargets,
      recentScans,
      behaviorPatterns,
      riskScore
    };
  }
  
  async getRecommendations(sessionToken: string): Promise<SecurityRecommendation[]> {
    const context = await this.analyzeUserContext(sessionToken);
    const recommendations: SecurityRecommendation[] = [];
    
    if (context.learningProfile?.goals) {
      for (const goal of context.learningProfile.goals) {
        const scripts = GOAL_TO_SCAN_MAPPING[goal];
        if (scripts) {
          for (const script of scripts) {
            recommendations.push({
              id: `rec_${nanoid(8)}`,
              type: 'scan',
              severity: 'info',
              title: `Recommended: ${script.replace('.lua', '').replace(/_/g, ' ')}`,
              description: `Based on your interest in ${LEARNING_GOAL_METADATA[goal]?.name || goal}, this scan may help your investigation.`,
              action: 'Run this Atropos scan on your current target',
              atroposScript: script,
              relatedGoals: [goal],
              createdAt: new Date().toISOString()
            });
          }
        }
      }
    }
    
    if (context.recentTargets.length > 0 && context.recentScans.length === 0) {
      recommendations.push({
        id: `rec_${nanoid(8)}`,
        type: 'scan',
        severity: 'low',
        title: 'No scans run yet',
        description: `You've identified ${context.recentTargets.length} target(s) but haven't run any Atropos scans. Consider running reconnaissance.`,
        action: 'Start with bbot_scanner.lua for comprehensive OSINT',
        atroposScript: 'bbot_scanner.lua',
        createdAt: new Date().toISOString()
      });
    }
    
    if (context.behaviorPatterns.includes('sql_injection_interest')) {
      recommendations.push({
        id: `rec_${nanoid(8)}`,
        type: 'vulnerability',
        severity: 'medium',
        title: 'SQL Injection Testing Recommended',
        description: 'Your activity suggests interest in SQL injection. Use Atropos sqli_scanner for systematic testing.',
        atroposScript: 'sqli_scanner.lua',
        createdAt: new Date().toISOString()
      });
    }
    
    if (context.behaviorPatterns.includes('xss_interest')) {
      recommendations.push({
        id: `rec_${nanoid(8)}`,
        type: 'vulnerability',
        severity: 'medium',
        title: 'XSS Testing Recommended',
        description: 'Consider using the XSS scanner for comprehensive cross-site scripting detection.',
        atroposScript: 'xss_scanner.lua',
        createdAt: new Date().toISOString()
      });
    }
    
    if (context.riskScore > 0.5) {
      recommendations.push({
        id: `rec_${nanoid(8)}`,
        type: 'behavior',
        severity: 'high',
        title: 'High-Risk Activity Detected',
        description: 'Your recent activity patterns indicate advanced offensive techniques. Ensure you have proper authorization.',
        metadata: { riskScore: context.riskScore, patterns: context.behaviorPatterns },
        createdAt: new Date().toISOString()
      });
    }
    
    return recommendations;
  }
  
  async getCVERecommendations(targets: string[]): Promise<CVERecommendation[]> {
    const recommendations: CVERecommendation[] = [];
    
    const recentCVEs: CVERecommendation[] = [
      {
        cveId: 'CVE-2024-3400',
        severity: 'critical',
        description: 'Palo Alto PAN-OS Command Injection',
        affectedSoftware: ['PAN-OS 10.2', 'PAN-OS 11.0', 'PAN-OS 11.1'],
        exploitAvailable: true,
        patchAvailable: true,
        recommendedAction: 'Update to patched versions immediately. Disable device telemetry if update not possible.',
        atroposScript: 'api_fuzzer.lua'
      },
      {
        cveId: 'CVE-2024-21762',
        severity: 'critical',
        description: 'Fortinet FortiOS Out-of-Bounds Write',
        affectedSoftware: ['FortiOS 7.4.x', 'FortiOS 7.2.x', 'FortiOS 7.0.x'],
        exploitAvailable: true,
        patchAvailable: true,
        recommendedAction: 'Upgrade FortiOS to latest patched version.',
      },
      {
        cveId: 'CVE-2024-1709',
        severity: 'critical',
        description: 'ConnectWise ScreenConnect Authentication Bypass',
        affectedSoftware: ['ScreenConnect < 23.9.8'],
        exploitAvailable: true,
        patchAvailable: true,
        recommendedAction: 'Update ScreenConnect immediately or disable public access.',
      },
      {
        cveId: 'CVE-2023-46747',
        severity: 'critical',
        description: 'F5 BIG-IP Configuration Utility Authentication Bypass',
        affectedSoftware: ['BIG-IP 17.1.0', 'BIG-IP 16.1.x', 'BIG-IP 15.1.x'],
        exploitAvailable: true,
        patchAvailable: true,
        recommendedAction: 'Apply hotfix or restrict access to Configuration utility.',
      }
    ];
    
    return recentCVEs;
  }
  
  async getIOCUpdates(sessionToken: string): Promise<IOCUpdate[]> {
    const context = await this.analyzeUserContext(sessionToken);
    const iocs: IOCUpdate[] = [];
    
    for (const target of context.recentTargets.slice(0, 5)) {
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(target)) {
        iocs.push({
          id: `ioc_${nanoid(8)}`,
          type: 'ip',
          value: target,
          source: 'user_investigation',
          threatType: 'under_investigation',
          confidence: 0.5,
          lastSeen: new Date().toISOString()
        });
      } else if (target.includes('.') && !target.includes('/')) {
        iocs.push({
          id: `ioc_${nanoid(8)}`,
          type: 'domain',
          value: target,
          source: 'user_investigation',
          threatType: 'under_investigation',
          confidence: 0.5,
          lastSeen: new Date().toISOString()
        });
      }
    }
    
    return iocs;
  }
  
  async runRecommendedScan(
    sessionToken: string, 
    recommendationId: string,
    target: string
  ): Promise<{ success: boolean; scanResult?: any; error?: string }> {
    const recommendations = await this.getRecommendations(sessionToken);
    const recommendation = recommendations.find(r => r.id === recommendationId);
    
    if (!recommendation?.atroposScript) {
      return { success: false, error: 'Recommendation not found or has no associated scan' };
    }
    
    const result = await atroposService.executeScript({
      scriptPath: recommendation.atroposScript,
      target,
      sessionToken,
      source: 'campaign'
    });
    
    return {
      success: result.success,
      scanResult: result.data,
      error: result.error
    };
  }
  
  async getSecurityDashboard(sessionToken: string): Promise<{
    context: UserSecurityContext;
    recommendations: SecurityRecommendation[];
    cveAlerts: CVERecommendation[];
    iocs: IOCUpdate[];
    atroposHealth: { available: boolean; path: string; error?: string };
  }> {
    const [context, recommendations, cveAlerts, iocs, atroposHealth] = await Promise.all([
      this.analyzeUserContext(sessionToken),
      this.getRecommendations(sessionToken),
      this.getCVERecommendations([]),
      this.getIOCUpdates(sessionToken),
      atroposService.checkBinary()
    ]);
    
    return {
      context,
      recommendations,
      cveAlerts,
      iocs,
      atroposHealth
    };
  }
}

export const securityAdvisor = new SecurityAdvisorService();
