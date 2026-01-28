/**
 * ============================================================================
 * BEHAVIORAL REPORT TEMPLATES - UX/UI & Guardrail Analysis
 * ============================================================================
 * 
 * Provides exportable report templates for:
 * 1. UX/UI Analytics Reports - User journey, friction points, engagement
 * 2. Guardrail Reports - Safety monitoring, abuse detection
 * 3. Learning Analytics - Pedagogical insights, skill progression
 * 
 * EXPORT FORMATS:
 * - JSON (structured data)
 * - CSV (spreadsheet-compatible)
 * - Markdown (documentation-ready)
 * - HTML (printable/PDF-ready)
 * 
 * ANALYSIS LEVELS:
 * - Fine-grained: Individual event analysis, detailed patterns
 * - Bird's eye: Aggregate trends, cohort analysis, executive summary
 * ============================================================================
 */

import { 
  BehavioralProfile,
  BehaviorEvent,
  GuardrailAlert,
  AnonymizedBehaviorRecord,
  UXAnalyticsReport,
  LearningStyleProfile,
  SkillAssessment
} from './types';

// ============================================================================
// EXPORT FORMAT TYPES
// ============================================================================

export type ExportFormat = 'json' | 'csv' | 'markdown' | 'html';

export interface ExportOptions {
  format: ExportFormat;
  includeRawData?: boolean;
  anonymize?: boolean;
  dateRange?: { start: number; end: number };
  sections?: string[];
}

// ============================================================================
// REPORT SECTION INTERFACES
// ============================================================================

interface ReportSection {
  id: string;
  title: string;
  level: 'fine' | 'aggregate';
  content: unknown;
  summary?: string;
  recommendations?: string[];
}

interface ReportMetadata {
  reportId: string;
  generatedAt: number;
  reportType: 'ux' | 'guardrail' | 'learning' | 'combined';
  version: string;
  periodStart: number;
  periodEnd: number;
  anonymized: boolean;
}

// ============================================================================
// BASE REPORT TEMPLATE
// ============================================================================

export interface BaseReport {
  metadata: ReportMetadata;
  executiveSummary: string;
  sections: ReportSection[];
  appendix?: Record<string, unknown>;
}

// ============================================================================
// UX/UI ANALYTICS REPORT TEMPLATE
// ============================================================================

export interface UXReport extends BaseReport {
  metadata: ReportMetadata & { reportType: 'ux' };
  
  // Bird's Eye View Sections
  overview: {
    totalSessions: number;
    uniqueUsers: number;
    avgSessionDuration: number;
    avgActionsPerSession: number;
    topFeatures: { name: string; usage: number }[];
    engagementTrend: { date: string; sessions: number; engagement: number }[];
  };
  
  // User Journey Analysis
  journeyAnalysis: {
    commonPaths: { path: string[]; frequency: number; avgDuration: number }[];
    dropOffPoints: { location: string; dropRate: number; reason: string }[];
    conversionFunnels: { name: string; steps: { step: string; rate: number }[] }[];
  };
  
  // Friction Point Analysis
  frictionAnalysis: {
    topFrictionPoints: {
      area: string;
      severity: 'minor' | 'moderate' | 'major';
      frequency: number;
      userImpact: string;
      suggestedFix: string;
    }[];
    errorPatterns: { error: string; frequency: number; context: string }[];
  };
  
  // Feature Engagement
  featureEngagement: {
    features: {
      name: string;
      usageRate: number;
      avgTimeSpent: number;
      satisfactionIndicator: number;
      relatedFeatures: string[];
    }[];
  };
  
  // Fine-Grained: Session Details (anonymized)
  sessionDetails?: {
    sessionId: string;
    duration: number;
    actionCount: number;
    featuresUsed: string[];
    frictionEncountered: string[];
    completedGoals: string[];
  }[];
}

// ============================================================================
// GUARDRAIL REPORT TEMPLATE
// ============================================================================

export interface GuardrailReport extends BaseReport {
  metadata: ReportMetadata & { reportType: 'guardrail' };
  
  // Bird's Eye View: Safety Overview
  safetyOverview: {
    totalAlertsGenerated: number;
    alertsBySeverity: Record<string, number>;
    alertsByCategory: Record<string, number>;
    escalationRate: number;
    falsePositiveEstimate: number;
    trendsOverTime: { date: string; alerts: number; severity: string }[];
  };
  
  // Category Breakdown
  categoryBreakdown: {
    category: string;
    alertCount: number;
    avgConfidence: number;
    actionsTaken: Record<string, number>;
    topTriggerPatterns: string[];
    recommendedThresholdAdjustment?: string;
  }[];
  
  // Pattern Analysis
  patternAnalysis: {
    emergingPatterns: { pattern: string; frequency: number; risk: string }[];
    decreasingPatterns: { pattern: string; previousFreq: number; currentFreq: number }[];
    correlatedBehaviors: { behaviors: string[]; correlation: number }[];
  };
  
  // Intervention Effectiveness
  interventionEffectiveness: {
    interventionType: string;
    timesApplied: number;
    recidivismRate: number;
    avgTimeToRecidivism: number;
    effectiveness: 'low' | 'medium' | 'high';
  }[];
  
  // Fine-Grained: Individual Alerts (for review)
  alertDetails?: {
    alertId: string;
    timestamp: number;
    category: string;
    severity: string;
    description: string;
    actionTaken: string;
    reviewed: boolean;
    reviewNotes?: string;
  }[];
}

// ============================================================================
// LEARNING ANALYTICS REPORT TEMPLATE
// ============================================================================

export interface LearningReport extends BaseReport {
  metadata: ReportMetadata & { reportType: 'learning' };
  
  // Bird's Eye View: Learning Overview
  learningOverview: {
    totalLearners: number;
    avgProgressRate: number;
    completionRate: number;
    learningStyleDistribution: Record<string, number>;
    topDevelopingSkills: { skill: string; learners: number }[];
  };
  
  // Learning Style Analysis
  learningStyleAnalysis: {
    styleProfiles: {
      style: string;
      percentage: number;
      avgCompletionRate: number;
      preferredCampaigns: string[];
      optimalContentTypes: string[];
    }[];
    recommendations: string[];
  };
  
  // Campaign Performance
  campaignPerformance: {
    campaignId: string;
    campaignName: string;
    attempts: number;
    completionRate: number;
    avgTimeToComplete: number;
    difficultyPerception: 'too-easy' | 'appropriate' | 'too-hard';
    skillsTargeted: string[];
    struggglePoints: { point: string; frequency: number }[];
  }[];
  
  // Skill Progression
  skillProgression: {
    skill: string;
    learnersAtLevel: Record<string, number>;
    avgTimeToProgress: number;
    blockers: string[];
  }[];
  
  // Fine-Grained: Individual Learner Profiles (anonymized)
  learnerProfiles?: {
    anonymousId: string;
    primaryLearningStyle: string;
    skillLevels: Record<string, string>;
    campaignsCompleted: string[];
    strugglingAreas: string[];
    recommendedNextSteps: string[];
  }[];
}

// ============================================================================
// REPORT GENERATORS
// ============================================================================

/**
 * Generate a unique report ID.
 */
function generateReportId(): string {
  return `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate UX Analytics Report from behavioral data.
 */
export function generateUXReport(
  profiles: BehavioralProfile[],
  options?: { dateRange?: { start: number; end: number } }
): UXReport {
  const now = Date.now();
  const periodStart = options?.dateRange?.start || now - (7 * 24 * 60 * 60 * 1000);
  const periodEnd = options?.dateRange?.end || now;
  
  // Filter profiles in date range
  const relevantProfiles = profiles.filter(
    p => p.createdAt >= periodStart && p.createdAt <= periodEnd
  );
  
  // Calculate aggregates
  const totalSessions = relevantProfiles.length;
  const avgDuration = totalSessions > 0 
    ? relevantProfiles.reduce((a, p) => a + p.sessionDuration, 0) / totalSessions 
    : 0;
  const avgActions = totalSessions > 0
    ? relevantProfiles.reduce((a, p) => a + p.totalEvents, 0) / totalSessions
    : 0;
  
  // Aggregate feature usage
  const featureUsage: Record<string, number> = {};
  for (const profile of relevantProfiles) {
    if (profile.stats.commandsExecuted > 0) featureUsage['terminal'] = (featureUsage['terminal'] || 0) + 1;
    if (profile.stats.agentInteractions > 0) featureUsage['agent'] = (featureUsage['agent'] || 0) + 1;
    if (profile.stats.cluesFound > 0) featureUsage['clues'] = (featureUsage['clues'] || 0) + 1;
    if (profile.stats.questsCompleted > 0) featureUsage['quests'] = (featureUsage['quests'] || 0) + 1;
  }
  
  return {
    metadata: {
      reportId: generateReportId(),
      generatedAt: now,
      reportType: 'ux',
      version: '1.0.0',
      periodStart,
      periodEnd,
      anonymized: true
    },
    executiveSummary: generateUXSummary(totalSessions, avgDuration, avgActions),
    sections: [],
    overview: {
      totalSessions,
      uniqueUsers: totalSessions, // Approximate
      avgSessionDuration: Math.round(avgDuration / 1000 / 60), // in minutes
      avgActionsPerSession: Math.round(avgActions),
      topFeatures: Object.entries(featureUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, usage]) => ({ name, usage })),
      engagementTrend: []
    },
    journeyAnalysis: {
      commonPaths: [],
      dropOffPoints: [],
      conversionFunnels: []
    },
    frictionAnalysis: {
      topFrictionPoints: [],
      errorPatterns: []
    },
    featureEngagement: {
      features: Object.entries(featureUsage).map(([name, usageRate]) => ({
        name,
        usageRate: totalSessions > 0 ? usageRate / totalSessions : 0,
        avgTimeSpent: 0,
        satisfactionIndicator: 0.7, // Default placeholder
        relatedFeatures: []
      }))
    }
  };
}

function generateUXSummary(sessions: number, avgDuration: number, avgActions: number): string {
  const durationMins = Math.round(avgDuration / 1000 / 60);
  return `Report covers ${sessions} sessions with average duration of ${durationMins} minutes and ${Math.round(avgActions)} actions per session. ` +
    `Engagement levels appear ${avgActions > 20 ? 'high' : avgActions > 10 ? 'moderate' : 'low'}.`;
}

/**
 * Generate Guardrail Report from alerts.
 */
export function generateGuardrailReport(
  alerts: GuardrailAlert[],
  options?: { dateRange?: { start: number; end: number } }
): GuardrailReport {
  const now = Date.now();
  const periodStart = options?.dateRange?.start || now - (7 * 24 * 60 * 60 * 1000);
  const periodEnd = options?.dateRange?.end || now;
  
  const relevantAlerts = alerts.filter(
    a => a.timestamp >= periodStart && a.timestamp <= periodEnd
  );
  
  // Aggregate by severity
  const bySeverity: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let escalations = 0;
  
  for (const alert of relevantAlerts) {
    bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    byCategory[alert.category] = (byCategory[alert.category] || 0) + 1;
    if (alert.recommendedAction === 'escalate') escalations++;
  }
  
  return {
    metadata: {
      reportId: generateReportId(),
      generatedAt: now,
      reportType: 'guardrail',
      version: '1.0.0',
      periodStart,
      periodEnd,
      anonymized: true
    },
    executiveSummary: generateGuardrailSummary(relevantAlerts.length, escalations, byCategory),
    sections: [],
    safetyOverview: {
      totalAlertsGenerated: relevantAlerts.length,
      alertsBySeverity: bySeverity,
      alertsByCategory: byCategory,
      escalationRate: relevantAlerts.length > 0 ? escalations / relevantAlerts.length : 0,
      falsePositiveEstimate: 0.15, // Placeholder - would be calculated from review data
      trendsOverTime: []
    },
    categoryBreakdown: Object.entries(byCategory).map(([category, count]) => ({
      category,
      alertCount: count,
      avgConfidence: relevantAlerts
        .filter(a => a.category === category)
        .reduce((a, b) => a + b.confidence, 0) / count,
      actionsTaken: {},
      topTriggerPatterns: []
    })),
    patternAnalysis: {
      emergingPatterns: [],
      decreasingPatterns: [],
      correlatedBehaviors: []
    },
    interventionEffectiveness: []
  };
}

function generateGuardrailSummary(total: number, escalations: number, byCategory: Record<string, number>): string {
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  return `${total} alerts generated with ${escalations} requiring escalation. ` +
    `${topCategory ? `Most common category: ${topCategory[0]} (${topCategory[1]} alerts). ` : ''}` +
    `Estimated false positive rate: 15%.`;
}

/**
 * Generate Learning Analytics Report.
 */
export function generateLearningReport(
  profiles: BehavioralProfile[],
  options?: { dateRange?: { start: number; end: number } }
): LearningReport {
  const now = Date.now();
  const periodStart = options?.dateRange?.start || now - (30 * 24 * 60 * 60 * 1000);
  const periodEnd = options?.dateRange?.end || now;
  
  const relevantProfiles = profiles.filter(
    p => p.createdAt >= periodStart && p.createdAt <= periodEnd
  );
  
  // Aggregate learning styles
  const styleDistribution: Record<string, number> = {};
  for (const profile of relevantProfiles) {
    const primaryStyle = determinePrimaryLearningStyle(profile.learningStyle);
    styleDistribution[primaryStyle] = (styleDistribution[primaryStyle] || 0) + 1;
  }
  
  // Aggregate skills
  const skillCounts: Record<string, number> = {};
  for (const profile of relevantProfiles) {
    for (const skill of profile.skills) {
      skillCounts[skill.domain] = (skillCounts[skill.domain] || 0) + 1;
    }
  }
  
  return {
    metadata: {
      reportId: generateReportId(),
      generatedAt: now,
      reportType: 'learning',
      version: '1.0.0',
      periodStart,
      periodEnd,
      anonymized: true
    },
    executiveSummary: generateLearningSummary(relevantProfiles.length, styleDistribution),
    sections: [],
    learningOverview: {
      totalLearners: relevantProfiles.length,
      avgProgressRate: 0.7, // Placeholder
      completionRate: 0.6, // Placeholder
      learningStyleDistribution: styleDistribution,
      topDevelopingSkills: Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill, learners]) => ({ skill, learners }))
    },
    learningStyleAnalysis: {
      styleProfiles: Object.entries(styleDistribution).map(([style, count]) => ({
        style,
        percentage: relevantProfiles.length > 0 ? count / relevantProfiles.length : 0,
        avgCompletionRate: 0.6,
        preferredCampaigns: [],
        optimalContentTypes: getOptimalContentTypes(style)
      })),
      recommendations: generateLearningRecommendations(styleDistribution)
    },
    campaignPerformance: [],
    skillProgression: []
  };
}

function determinePrimaryLearningStyle(style: LearningStyleProfile): string {
  const scores = {
    visual: style.visualLearner,
    auditory: style.auditoryLearner,
    readWrite: style.readWriteLearner,
    kinesthetic: style.kinestheticLearner
  };
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function getOptimalContentTypes(style: string): string[] {
  const contentMap: Record<string, string[]> = {
    visual: ['diagrams', 'flowcharts', 'videos', 'infographics'],
    auditory: ['explanations', 'discussions', 'podcasts', 'narrated tutorials'],
    readWrite: ['documentation', 'text tutorials', 'notes', 'written guides'],
    kinesthetic: ['hands-on labs', 'interactive exercises', 'simulations', 'practice challenges']
  };
  return contentMap[style] || contentMap.kinesthetic;
}

function generateLearningSummary(total: number, styleDistribution: Record<string, number>): string {
  const topStyle = Object.entries(styleDistribution).sort((a, b) => b[1] - a[1])[0];
  return `${total} learners analyzed. ` +
    `${topStyle ? `Predominant learning style: ${topStyle[0]} (${Math.round(topStyle[1] / total * 100)}%). ` : ''}` +
    `Consider diversifying content formats to accommodate all learning styles.`;
}

function generateLearningRecommendations(styleDistribution: Record<string, number>): string[] {
  const recommendations: string[] = [];
  const total = Object.values(styleDistribution).reduce((a, b) => a + b, 0);
  
  if ((styleDistribution.kinesthetic || 0) / total > 0.4) {
    recommendations.push('High kinesthetic learner population - prioritize hands-on interactive content');
  }
  if ((styleDistribution.visual || 0) / total > 0.3) {
    recommendations.push('Significant visual learner segment - add more diagrams and flowcharts');
  }
  if ((styleDistribution.readWrite || 0) / total > 0.2) {
    recommendations.push('Notable read/write preference - ensure comprehensive documentation');
  }
  
  return recommendations;
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export report to JSON format.
 */
export function exportToJSON(report: BaseReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Export report to CSV format (flattened).
 */
export function exportToCSV(report: BaseReport, section?: string): string {
  const rows: string[][] = [];
  
  // Metadata row
  rows.push(['Report ID', 'Generated At', 'Report Type', 'Period Start', 'Period End']);
  rows.push([
    report.metadata.reportId,
    new Date(report.metadata.generatedAt).toISOString(),
    report.metadata.reportType,
    new Date(report.metadata.periodStart).toISOString(),
    new Date(report.metadata.periodEnd).toISOString()
  ]);
  rows.push([]);
  
  // Executive Summary
  rows.push(['Executive Summary']);
  rows.push([report.executiveSummary]);
  rows.push([]);
  
  // Sections (basic flattening)
  for (const sec of report.sections) {
    if (section && sec.id !== section) continue;
    rows.push([sec.title]);
    if (sec.summary) rows.push(['Summary', sec.summary]);
    if (Array.isArray(sec.content)) {
      for (const item of sec.content as Record<string, unknown>[]) {
        rows.push(Object.values(item).map(v => String(v)));
      }
    }
    rows.push([]);
  }
  
  return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

/**
 * Export report to Markdown format.
 */
export function exportToMarkdown(report: BaseReport): string {
  let md = '';
  
  // Title and metadata
  md += `# ${report.metadata.reportType.toUpperCase()} Report\n\n`;
  md += `**Report ID:** ${report.metadata.reportId}\n`;
  md += `**Generated:** ${new Date(report.metadata.generatedAt).toLocaleString()}\n`;
  md += `**Period:** ${new Date(report.metadata.periodStart).toLocaleDateString()} - ${new Date(report.metadata.periodEnd).toLocaleDateString()}\n`;
  md += `**Anonymized:** ${report.metadata.anonymized ? 'Yes' : 'No'}\n\n`;
  
  // Executive Summary
  md += `## Executive Summary\n\n${report.executiveSummary}\n\n`;
  
  // Sections
  for (const section of report.sections) {
    md += `## ${section.title}\n\n`;
    md += `*Level: ${section.level}*\n\n`;
    if (section.summary) md += `${section.summary}\n\n`;
    if (section.recommendations?.length) {
      md += `### Recommendations\n\n`;
      for (const rec of section.recommendations) {
        md += `- ${rec}\n`;
      }
      md += '\n';
    }
  }
  
  return md;
}

/**
 * Export report to HTML format (PDF-ready).
 */
export function exportToHTML(report: BaseReport): string {
  const typeColors: Record<string, string> = {
    ux: '#f59e0b',
    guardrail: '#ef4444',
    learning: '#8b5cf6'
  };
  const color = typeColors[report.metadata.reportType] || '#6b7280';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.metadata.reportType.toUpperCase()} Report - ${report.metadata.reportId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      border-bottom: 3px solid ${color};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: ${color};
      font-size: 2rem;
      margin-bottom: 10px;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      font-size: 0.875rem;
      color: #6b7280;
    }
    .meta-item { display: flex; gap: 8px; }
    .meta-label { font-weight: 600; }
    .summary {
      background: #f9fafb;
      border-left: 4px solid ${color};
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 0 8px 8px 0;
    }
    .summary h2 {
      color: ${color};
      margin-bottom: 10px;
      font-size: 1.25rem;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .section-level {
      display: inline-block;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 4px;
      background: ${color}20;
      color: ${color};
      margin-left: 10px;
    }
    .recommendations {
      background: #fef3c7;
      border-radius: 8px;
      padding: 15px;
      margin-top: 10px;
    }
    .recommendations h3 {
      color: #92400e;
      font-size: 0.875rem;
      margin-bottom: 8px;
    }
    .recommendations ul {
      margin-left: 20px;
      color: #78350f;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 0.75rem;
      color: #9ca3af;
      text-align: center;
    }
    @media print {
      body { max-width: 100%; padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${report.metadata.reportType.toUpperCase()} ANALYTICS REPORT</h1>
    <div class="meta">
      <div class="meta-item"><span class="meta-label">Report ID:</span> ${report.metadata.reportId}</div>
      <div class="meta-item"><span class="meta-label">Generated:</span> ${new Date(report.metadata.generatedAt).toLocaleString()}</div>
      <div class="meta-item"><span class="meta-label">Period:</span> ${new Date(report.metadata.periodStart).toLocaleDateString()} - ${new Date(report.metadata.periodEnd).toLocaleDateString()}</div>
      <div class="meta-item"><span class="meta-label">Anonymized:</span> ${report.metadata.anonymized ? 'Yes' : 'No'}</div>
    </div>
  </div>
  
  <div class="summary">
    <h2>Executive Summary</h2>
    <p>${report.executiveSummary}</p>
  </div>
  
  ${report.sections.map(section => `
  <div class="section">
    <h2>${section.title} <span class="section-level">${section.level}</span></h2>
    ${section.summary ? `<p>${section.summary}</p>` : ''}
    ${section.recommendations?.length ? `
    <div class="recommendations">
      <h3>Recommendations</h3>
      <ul>
        ${section.recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  </div>
  `).join('')}
  
  <div class="footer">
    <p>Generated by SysAdmin Corp Behavioral Analytics System v${report.metadata.version}</p>
    <p>This report contains anonymized data only. No personally identifiable information is included.</p>
  </div>
</body>
</html>`;
}

/**
 * Universal export function.
 */
export function exportReport(report: BaseReport, options: ExportOptions): string {
  switch (options.format) {
    case 'json': return exportToJSON(report);
    case 'csv': return exportToCSV(report);
    case 'markdown': return exportToMarkdown(report);
    case 'html': return exportToHTML(report);
    default: return exportToJSON(report);
  }
}

/**
 * Download report as file (browser).
 */
export function downloadReport(report: BaseReport, options: ExportOptions): void {
  const content = exportReport(report, options);
  const mimeTypes: Record<ExportFormat, string> = {
    json: 'application/json',
    csv: 'text/csv',
    markdown: 'text/markdown',
    html: 'text/html'
  };
  const extensions: Record<ExportFormat, string> = {
    json: 'json',
    csv: 'csv',
    markdown: 'md',
    html: 'html'
  };
  
  const blob = new Blob([content], { type: mimeTypes[options.format] });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.metadata.reportType}_report_${report.metadata.reportId}.${extensions[options.format]}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// OPTIMIZED PROMPT TEMPLATES FOR LLM ANALYSIS
// ============================================================================

/**
 * Prompts for LLM-powered report analysis.
 * These generate detailed insights from raw data.
 */
export const ANALYSIS_PROMPTS = {
  /**
   * Fine-grained: Analyze individual session behavior.
   */
  sessionAnalysis: (events: BehaviorEvent[]) => `
Analyze this user session and provide insights:

SESSION DATA:
- Total events: ${events.length}
- Duration: ${events.length > 1 ? Math.round((events[events.length-1].timestamp - events[0].timestamp) / 1000 / 60) : 0} minutes
- Categories: ${Array.from(new Set(events.map(e => e.category))).join(', ')}

EVENT SUMMARY:
${events.slice(0, 20).map(e => `- [${e.category}] ${e.action}: ${e.target}`).join('\n')}
${events.length > 20 ? `... and ${events.length - 20} more events` : ''}

Provide a brief analysis covering:
1. User intent and goals
2. Skill level indicators
3. Friction points encountered
4. Engagement patterns
5. Recommendations for personalization

Keep response under 200 words.`,

  /**
   * Bird's eye: Aggregate trend analysis.
   */
  trendAnalysis: (report: UXReport) => `
Analyze these UX metrics and identify trends:

OVERVIEW:
- Sessions: ${report.overview.totalSessions}
- Avg Duration: ${report.overview.avgSessionDuration} min
- Avg Actions: ${report.overview.avgActionsPerSession}

TOP FEATURES:
${report.overview.topFeatures.map(f => `- ${f.name}: ${f.usage} uses`).join('\n')}

FRICTION POINTS:
${report.frictionAnalysis.topFrictionPoints.slice(0, 5).map(f => `- ${f.area} (${f.severity}): ${f.userImpact}`).join('\n') || 'None identified'}

Provide:
1. Key trends (positive and negative)
2. Feature adoption insights
3. UX improvement priorities
4. Predicted impact of addressing top friction points
5. Recommended A/B tests

Keep response under 250 words.`,

  /**
   * Guardrail: Safety pattern analysis.
   */
  safetyAnalysis: (report: GuardrailReport) => `
Analyze these safety monitoring results:

OVERVIEW:
- Total Alerts: ${report.safetyOverview.totalAlertsGenerated}
- Escalation Rate: ${Math.round(report.safetyOverview.escalationRate * 100)}%
- Est. False Positive: ${Math.round(report.safetyOverview.falsePositiveEstimate * 100)}%

BY CATEGORY:
${Object.entries(report.safetyOverview.alertsByCategory).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

BY SEVERITY:
${Object.entries(report.safetyOverview.alertsBySeverity).map(([sev, count]) => `- ${sev}: ${count}`).join('\n')}

Provide:
1. Risk assessment summary
2. Pattern concerns (emerging threats)
3. Threshold adjustment recommendations
4. False positive reduction strategies
5. Priority areas for human review

Keep response under 200 words. Flag any critical concerns prominently.`,

  /**
   * Learning: Pedagogical insights.
   */
  learningAnalysis: (report: LearningReport) => `
Analyze these learning analytics:

LEARNER OVERVIEW:
- Total Learners: ${report.learningOverview.totalLearners}
- Avg Progress: ${Math.round(report.learningOverview.avgProgressRate * 100)}%
- Completion Rate: ${Math.round(report.learningOverview.completionRate * 100)}%

LEARNING STYLE DISTRIBUTION:
${Object.entries(report.learningOverview.learningStyleDistribution).map(([style, count]) => `- ${style}: ${count}`).join('\n')}

TOP DEVELOPING SKILLS:
${report.learningOverview.topDevelopingSkills.map(s => `- ${s.skill}: ${s.learners} learners`).join('\n')}

Provide:
1. Learning population characterization
2. Content format recommendations
3. Campaign design suggestions
4. Skill progression bottlenecks
5. Personalization opportunities

Keep response under 250 words.`
};

export default {
  generateUXReport,
  generateGuardrailReport,
  generateLearningReport,
  exportReport,
  downloadReport,
  ANALYSIS_PROMPTS
};
