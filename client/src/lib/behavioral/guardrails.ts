/**
 * ============================================================================
 * GUARDRAIL SYSTEM - Platform Abuse Detection
 * ============================================================================
 * 
 * Monitors behavioral patterns for potential platform abuse including:
 * - Harassment and targeted behavior
 * - Doxxing attempts (extracting personal info)
 * - CSAM-related patterns (immediate escalation)
 * - Stalking behaviors
 * - Hate speech patterns
 * - Self-harm indicators
 * 
 * IMPORTANT NOTES:
 * - This is PATTERN detection, not content moderation
 * - CSAM indicators trigger immediate escalation
 * - All alerts are logged for review, not auto-actioned
 * - False positives are expected; human review is required
 * 
 * TO REPLACE WITH CUSTOM MODEL:
 * 1. Implement ILLMProvider.checkGuardrails() with your model
 * 2. Adjust patterns and thresholds as needed
 * ============================================================================
 */

import { 
  BehaviorEvent, 
  GuardrailAlert, 
  GuardrailConfig, 
  AbuseCategory,
  AlertSeverity 
} from './types';

/**
 * Default guardrail configuration.
 * Adjust these thresholds based on your platform's needs.
 */
export const DEFAULT_GUARDRAIL_CONFIG: GuardrailConfig = {
  enabled: true,
  
  // Detection thresholds (0-1, lower = more sensitive)
  thresholds: {
    harassment: 0.6,
    doxxing: 0.5,
    stalking: 0.6,
    csam_indicator: 0.3,    // Very sensitive - better false positives than misses
    hate_speech: 0.6,
    self_harm: 0.5,
    violence: 0.6,
    manipulation: 0.7,
    spam: 0.7,
    evasion: 0.6
  },
  
  // Pattern definitions
  watchPatterns: [
    // Doxxing patterns - attempts to extract personal info
    {
      category: 'doxxing',
      patterns: [
        'find.*address',
        'locate.*person',
        'track.*location',
        'where.*live',
        'phone.*number',
        'social.*security',
        'dox',
        'real.*name',
        'identity.*of'
      ],
      weight: 0.8
    },
    
    // Stalking patterns - obsessive tracking
    {
      category: 'stalking',
      patterns: [
        'monitor.*activity',
        'track.*movements',
        'follow.*online',
        'watch.*without',
        'spy.*on'
      ],
      weight: 0.7
    },
    
    // Harassment patterns
    {
      category: 'harassment',
      patterns: [
        'send.*repeatedly',
        'flood.*with',
        'bombard',
        'harass',
        'target.*user',
        'attack.*account'
      ],
      weight: 0.7
    },
    
    // Self-harm patterns (for supportive intervention)
    {
      category: 'self_harm',
      patterns: [
        'hurt.*myself',
        'end.*life',
        'kill.*self',
        'suicide',
        'self.*harm',
        'cut.*myself'
      ],
      weight: 0.9
    },
    
    // Evasion patterns
    {
      category: 'evasion',
      patterns: [
        'bypass.*filter',
        'evade.*detection',
        'hide.*from.*moderation',
        'avoid.*ban',
        'circumvent.*safety'
      ],
      weight: 0.6
    }
  ],
  
  // Actions at each severity level
  actions: {
    info: 'log',
    warning: 'log',
    elevated: 'alert',
    critical: 'restrict'
  },
  
  reportToAdmin: true,
  csamAutoEscalate: true
};

/**
 * Generate a unique alert ID.
 */
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Anonymize session ID for alert reporting.
 */
function anonymizeSessionId(sessionId: string): string {
  let hash = 5381;
  for (let i = 0; i < sessionId.length; i++) {
    hash = ((hash << 5) + hash) + sessionId.charCodeAt(i);
  }
  return `anon_${Math.abs(hash).toString(36)}`;
}

/**
 * Check for pattern matches in event targets/actions.
 */
function checkPatterns(
  text: string,
  patterns: string[]
): { matched: boolean; matchedPatterns: string[] } {
  const matchedPatterns: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const pattern of patterns) {
    try {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lowerText)) {
        matchedPatterns.push(pattern);
      }
    } catch {
      // Invalid regex, skip
      if (lowerText.includes(pattern.toLowerCase())) {
        matchedPatterns.push(pattern);
      }
    }
  }
  
  return {
    matched: matchedPatterns.length > 0,
    matchedPatterns
  };
}

/**
 * Detect behavioral patterns indicating abuse.
 */
function detectBehavioralPatterns(
  events: BehaviorEvent[],
  config: GuardrailConfig
): { category: AbuseCategory; score: number; patterns: string[]; events: string[] }[] {
  const detections: Map<AbuseCategory, { score: number; patterns: string[]; events: string[] }> = new Map();
  
  // Check each event against watch patterns
  for (const event of events) {
    const textToCheck = `${event.action} ${event.target} ${JSON.stringify(event.metadata || {})}`;
    
    for (const watchPattern of config.watchPatterns) {
      const { matched, matchedPatterns } = checkPatterns(textToCheck, watchPattern.patterns);
      
      if (matched) {
        const existing = detections.get(watchPattern.category) || { score: 0, patterns: [], events: [] };
        existing.score += watchPattern.weight * matchedPatterns.length;
        existing.patterns.push(...matchedPatterns);
        existing.events.push(event.id);
        detections.set(watchPattern.category, existing);
      }
    }
  }
  
  // Detect behavioral patterns (not just text patterns)
  
  // Repetitive targeting (potential harassment/stalking)
  const targetCounts = new Map<string, number>();
  for (const event of events) {
    if (event.targetType === 'other') {
      const count = (targetCounts.get(event.target) || 0) + 1;
      targetCounts.set(event.target, count);
    }
  }
  
  targetCounts.forEach((count, target) => {
    if (count >= 10) {
      const existing = detections.get('stalking') || { score: 0, patterns: [], events: [] };
      existing.score += 0.5 * Math.log(count);
      existing.patterns.push(`repeated_target:${count}`);
      detections.set('stalking', existing);
    }
  });
  
  // Rapid activity (potential spam/automation)
  const timeDiffs: number[] = [];
  for (let i = 1; i < events.length; i++) {
    timeDiffs.push(events[i].timestamp - events[i-1].timestamp);
  }
  const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
  
  if (avgTimeDiff < 500 && events.length > 20) { // < 500ms between actions
    const existing = detections.get('spam') || { score: 0, patterns: [], events: [] };
    existing.score += 0.8;
    existing.patterns.push(`rapid_activity:${Math.round(avgTimeDiff)}ms`);
    detections.set('spam', existing);
  }
  
  return Array.from(detections.entries()).map(([category, data]) => ({
    category,
    ...data
  }));
}

/**
 * Determine alert severity based on category and score.
 */
function determineSeverity(category: AbuseCategory, score: number, config: GuardrailConfig): AlertSeverity {
  const threshold = config.thresholds[category];
  const normalizedScore = score / (threshold * 2); // Normalize against threshold
  
  // CSAM is always critical if detected
  if (category === 'csam_indicator') return 'critical';
  
  // Self-harm needs careful handling (supportive, not punitive)
  if (category === 'self_harm') return 'elevated';
  
  if (normalizedScore >= 1.5) return 'critical';
  if (normalizedScore >= 1.0) return 'elevated';
  if (normalizedScore >= 0.5) return 'warning';
  return 'info';
}

/**
 * Determine recommended action based on severity and category.
 */
function determineAction(
  category: AbuseCategory,
  severity: AlertSeverity,
  config: GuardrailConfig
): GuardrailAlert['recommendedAction'] {
  // CSAM always escalates
  if (category === 'csam_indicator') return 'escalate';
  
  // Self-harm should be monitored supportively, not restricted
  if (category === 'self_harm') return 'flag';
  
  switch (severity) {
    case 'critical': return 'escalate';
    case 'elevated': return 'restrict';
    case 'warning': return 'flag';
    default: return 'monitor';
  }
}

/**
 * Main guardrail checking function.
 * Analyzes events and returns any alerts.
 */
export function checkGuardrails(
  events: BehaviorEvent[],
  config: GuardrailConfig = DEFAULT_GUARDRAIL_CONFIG
): GuardrailAlert[] {
  if (!config.enabled || events.length === 0) return [];
  
  const alerts: GuardrailAlert[] = [];
  const detections = detectBehavioralPatterns(events, config);
  
  for (const detection of detections) {
    const threshold = config.thresholds[detection.category];
    
    // Only alert if score exceeds threshold
    if (detection.score >= threshold) {
      const severity = determineSeverity(detection.category, detection.score, config);
      
      alerts.push({
        id: generateAlertId(),
        timestamp: Date.now(),
        sessionId: anonymizeSessionId(events[0]?.sessionId || 'unknown'),
        category: detection.category,
        severity,
        confidence: Math.min(detection.score / (threshold * 2), 1),
        triggerPatterns: detection.patterns,
        eventIds: detection.events,
        description: generateAlertDescription(detection.category, detection.patterns),
        recommendedAction: determineAction(detection.category, severity, config),
        requiresImmediateReview: detection.category === 'csam_indicator' || severity === 'critical'
      });
    }
  }
  
  return alerts;
}

/**
 * Generate human-readable alert description.
 */
function generateAlertDescription(category: AbuseCategory, patterns: string[]): string {
  const descriptions: Record<AbuseCategory, string> = {
    harassment: 'Potential harassment pattern detected. Repeated targeting or hostile behavior patterns observed.',
    doxxing: 'Potential doxxing attempt detected. Patterns suggest attempts to extract or share personal information.',
    stalking: 'Potential stalking behavior detected. Obsessive tracking or monitoring patterns observed.',
    csam_indicator: 'CRITICAL: Potential CSAM-related pattern detected. Immediate review required.',
    hate_speech: 'Potential hate speech pattern detected. Discriminatory content patterns observed.',
    self_harm: 'Self-harm related patterns detected. Consider supportive intervention resources.',
    violence: 'Potential violence-related content detected. Threats or violent content patterns observed.',
    manipulation: 'Potential manipulation pattern detected. Social engineering for harm patterns observed.',
    spam: 'Spam behavior detected. Automated or repetitive abuse patterns observed.',
    evasion: 'Safety evasion attempt detected. Attempts to bypass safety systems observed.'
  };
  
  return `${descriptions[category]} Triggered by: ${patterns.slice(0, 3).join(', ')}${patterns.length > 3 ? '...' : ''}`;
}

/**
 * Log alert for admin review (console for now, replace with your reporting system).
 */
export function logAlertForReview(alert: GuardrailAlert): void {
  const logLevel = alert.severity === 'critical' ? 'error' : 'warn';
  
  console[logLevel]('[GUARDRAIL ALERT]', {
    id: alert.id,
    category: alert.category,
    severity: alert.severity,
    description: alert.description,
    recommendedAction: alert.recommendedAction,
    requiresImmediateReview: alert.requiresImmediateReview
  });
  
  // In production, this would send to your admin dashboard / alerting system
  // Example: await fetch('/api/admin/guardrail-alert', { method: 'POST', body: JSON.stringify(alert) });
}

/**
 * Get supportive resources for self-harm detection.
 * Returns resources instead of punitive action.
 */
export function getSelfHarmResources(): { name: string; contact: string; url?: string }[] {
  return [
    { 
      name: 'National Suicide Prevention Lifeline',
      contact: '988 (US)',
      url: 'https://988lifeline.org'
    },
    {
      name: 'Crisis Text Line',
      contact: 'Text HOME to 741741',
      url: 'https://www.crisistextline.org'
    },
    {
      name: 'International Association for Suicide Prevention',
      contact: 'See website for local resources',
      url: 'https://www.iasp.info/resources/Crisis_Centres/'
    }
  ];
}

export default checkGuardrails;
