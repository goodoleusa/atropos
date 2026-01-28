/**
 * ============================================================================
 * BEHAVIORAL PROFILING SYSTEM - TYPE DEFINITIONS
 * ============================================================================
 * 
 * PURPOSE:
 * 1. GUARDRAIL MONITORING - Detect platform abuse (harassment, doxxing, etc.)
 * 2. PEDAGOGICAL AID - Infer learning styles for personalized campaigns
 * 3. UX ANALYTICS - Anonymized data pipeline for product development
 * 
 * ARCHITECTURE OVERVIEW:
 * ┌─────────────┐    ┌──────────────┐    ┌────────────────┐
 * │   Tracker   │───▶│   Analyzer   │───▶│ Prompt Builder │
 * │ (Events)    │    │ (Patterns)   │    │ (Optimized)    │
 * └─────────────┘    └──────────────┘    └────────────────┘
 *        │                  │                    │
 *        ▼                  ▼                    ▼
 * ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐
 * │ Guardrail System │  │ Learning Profile │  │ Anonymized UX  │
 * │ (Abuse Detection)│  │ (Pedagogy)       │  │ Analytics      │
 * └──────────────────┘  └──────────────────┘  └────────────────┘
 * 
 * TO REPLACE WITH CUSTOM MODEL:
 * 1. Keep these type definitions
 * 2. Replace the LLM provider in `llmProvider.ts`
 * 3. Adjust the analyzer if needed for your model's output format
 * ============================================================================
 */

// ============================================================================
// CORE EVENT TYPES
// ============================================================================

/**
 * Categories of trackable user actions.
 * Extend this enum to track new action types.
 */
export type ActionCategory = 
  | 'navigation'      // Page visits, route changes
  | 'terminal'        // Terminal command usage
  | 'agent'           // AI agent interactions
  | 'clue'            // Clue discovery/collection
  | 'quest'           // Quest progression
  | 'exploration'     // Hidden route discovery
  | 'interaction'     // UI interactions (clicks, hovers)
  | 'session'         // Session management actions
  | 'content'         // Content creation/input
  | 'error';          // Error encounters

/**
 * A single tracked user action event.
 * These events are collected and analyzed to build behavioral profiles.
 */
export interface BehaviorEvent {
  id: string;                    // Unique event ID (UUID)
  timestamp: number;             // Unix timestamp (ms)
  category: ActionCategory;      // Event category
  action: string;                // Specific action (e.g., "visited", "executed")
  target: string;                // Action target (e.g., "/terminal", "ls")
  metadata?: Record<string, unknown>; // Optional additional data
  sessionId: string;             // Session identifier (anonymizable)
  
  // Guardrail-relevant fields
  contentHash?: string;          // Hash of user-generated content (for pattern matching)
  targetType?: 'self' | 'other' | 'system'; // Who/what is affected
}

// ============================================================================
// GUARDRAIL MONITORING TYPES
// ============================================================================

/**
 * Types of potentially abusive behavior to monitor.
 * IMPORTANT: This is for pattern detection, not content moderation.
 */
export type AbuseCategory = 
  | 'harassment'       // Repeated targeting of individuals
  | 'doxxing'          // Attempting to extract/share personal info
  | 'stalking'         // Obsessive tracking patterns
  | 'csam_indicator'   // Patterns suggesting CSAM intent (high priority)
  | 'hate_speech'      // Discriminatory content patterns
  | 'self_harm'        // Self-harm related patterns
  | 'violence'         // Threats or violent content
  | 'manipulation'     // Social engineering for harm
  | 'spam'             // Automated/repetitive abuse
  | 'evasion';         // Attempts to bypass safety systems

/**
 * Severity levels for guardrail alerts.
 */
export type AlertSeverity = 'info' | 'warning' | 'elevated' | 'critical';

/**
 * A guardrail alert triggered by behavioral analysis.
 */
export interface GuardrailAlert {
  id: string;
  timestamp: number;
  sessionId: string;             // Anonymized for reporting
  category: AbuseCategory;
  severity: AlertSeverity;
  confidence: number;            // 0-1 confidence in detection
  triggerPatterns: string[];     // What patterns triggered this
  eventIds: string[];            // Related event IDs
  description: string;           // Human-readable description
  recommendedAction: 'monitor' | 'flag' | 'restrict' | 'escalate';
  
  // For CSAM specifically - immediate escalation required
  requiresImmediateReview?: boolean;
}

/**
 * Guardrail configuration.
 * Adjust thresholds based on your platform's needs.
 */
export interface GuardrailConfig {
  enabled: boolean;
  
  // Threshold settings per category (0-1, lower = more sensitive)
  thresholds: Record<AbuseCategory, number>;
  
  // Patterns to watch for (regex strings)
  watchPatterns: {
    category: AbuseCategory;
    patterns: string[];
    weight: number; // How much this pattern contributes to detection
  }[];
  
  // Actions to take at each severity level
  actions: Record<AlertSeverity, 'log' | 'alert' | 'restrict' | 'block'>;
  
  // Whether to send anonymized alerts to admin
  reportToAdmin: boolean;
  
  // CSAM detection requires special handling - always escalate
  csamAutoEscalate: boolean;
}

// ============================================================================
// PEDAGOGICAL / LEARNING STYLE TYPES
// ============================================================================

/**
 * Learning style dimensions based on established pedagogy models.
 * References: VARK, Kolb's Learning Cycle, Felder-Silverman
 */
export interface LearningStyleProfile {
  // Information Processing (VARK-inspired)
  visualLearner: number;         // 0-1 preference for visual info
  auditoryLearner: number;       // 0-1 preference for explanations
  readWriteLearner: number;      // 0-1 preference for text/docs
  kinestheticLearner: number;    // 0-1 preference for hands-on
  
  // Knowledge Acquisition (Kolb-inspired)
  concreteExperience: number;    // Learning by doing
  reflectiveObservation: number; // Learning by watching
  abstractConceptualization: number; // Learning by thinking
  activeExperimentation: number; // Learning by trying
  
  // Pace and Structure Preferences
  preferredPace: 'guided' | 'self-directed' | 'adaptive';
  structurePreference: 'rigid' | 'flexible' | 'chaotic';
  feedbackFrequency: 'immediate' | 'periodic' | 'on-demand';
  
  // Challenge Preferences
  difficultyPreference: 'easy-wins' | 'balanced' | 'hard-challenges';
  frustrationTolerance: 'low' | 'medium' | 'high';
  hintUsage: 'never' | 'sometimes' | 'often' | 'always';
  
  // Social Learning
  collaborativePreference: number; // 0-1 preference for social features
  competitivePreference: number;   // 0-1 preference for leaderboards/competition
}

/**
 * Interest areas detected from user behavior.
 */
export interface InterestProfile {
  // Topic interests (0-1 strength)
  interests: {
    topic: string;
    strength: number;
    evidence: string[];          // What behaviors suggest this
    lastEngaged: number;         // Timestamp
  }[];
  
  // Skill domains they're developing
  developingSkills: {
    skill: string;
    currentLevel: 'novice' | 'beginner' | 'intermediate' | 'advanced';
    progressRate: 'slow' | 'steady' | 'fast';
    recommendedCampaigns: string[];
  }[];
  
  // Campaign engagement history
  campaignEngagement: {
    campaignId: string;
    started: number;
    completed: boolean;
    timeSpent: number;
    successRate: number;
    struggles: string[];         // Where they had difficulty
  }[];
}

// ============================================================================
// ANONYMIZATION PIPELINE TYPES
// ============================================================================

/**
 * Anonymization levels for data export.
 */
export type AnonymizationLevel = 
  | 'none'          // No anonymization (internal use only)
  | 'pseudonymous'  // Replace IDs with random tokens
  | 'aggregated'    // Aggregate data only, no individual records
  | 'differential'  // Apply differential privacy noise
  | 'full';         // Full k-anonymity with generalization

/**
 * Anonymized behavioral record for UX analytics.
 * This is what gets exported for company analysis.
 */
export interface AnonymizedBehaviorRecord {
  // Anonymized session identifier (one-way hash)
  anonymousId: string;
  
  // Coarse timestamp (bucketed to reduce identifiability)
  timeBucket: string; // e.g., "2025-01-W04" (year-month-week)
  
  // Aggregated metrics (no individual events)
  metrics: {
    sessionDuration: number;     // Rounded to nearest 5 min
    actionsPerMinute: number;    // Activity rate
    pagesVisited: number;        // Bucketed (1-5, 6-10, 11-20, 20+)
    commandsExecuted: number;    // Bucketed
    cluesFound: number;          // Bucketed
    campaignsAttempted: number;
    campaignsCompleted: number;
  };
  
  // Generalized learning style (no exact values)
  learningStyle: {
    primaryStyle: string;        // e.g., "kinesthetic", "visual"
    paceCategory: string;        // e.g., "fast", "methodical"
    difficultyPreference: string;
  };
  
  // Interest categories (generalized, not specific topics)
  interestCategories: string[];  // e.g., ["networking", "osint"]
  
  // UX friction points (anonymized patterns)
  frictionPoints: {
    area: string;                // e.g., "terminal-input", "navigation"
    severity: 'minor' | 'moderate' | 'major';
    frequency: number;           // Normalized
  }[];
  
  // Feature engagement (what features they used)
  featureEngagement: Record<string, number>; // feature -> usage score
}

/**
 * Aggregated analytics report for UX development.
 */
export interface UXAnalyticsReport {
  reportId: string;
  generatedAt: number;
  periodStart: number;
  periodEnd: number;
  
  // Aggregate statistics
  totalSessions: number;
  uniqueUsers: number;           // Approximate via HyperLogLog
  
  // Learning style distribution
  learningStyleDistribution: Record<string, number>;
  
  // Interest distribution
  interestDistribution: Record<string, number>;
  
  // Campaign performance
  campaignMetrics: {
    campaignId: string;
    attempts: number;
    completionRate: number;
    avgTimeToComplete: number;
    dropOffPoints: { step: string; dropRate: number }[];
    difficultyFeedback: Record<string, number>;
  }[];
  
  // UX insights
  topFrictionPoints: { area: string; score: number; recommendation: string }[];
  topEngagedFeatures: { feature: string; engagementScore: number }[];
  
  // Retention metrics
  retentionCurve: { day: number; retentionRate: number }[];
  
  // Recommendations for UX improvements
  recommendations: {
    priority: 'low' | 'medium' | 'high';
    area: string;
    issue: string;
    suggestion: string;
    estimatedImpact: string;
  }[];
}

// ============================================================================
// COMPLETE BEHAVIORAL PROFILE
// ============================================================================

/**
 * User skill level assessment per domain.
 */
export interface SkillAssessment {
  domain: string;
  level: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence: number;
  evidenceCount: number;
  lastUpdated: number;
}

/**
 * Detected behavioral pattern from event analysis.
 */
export interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  significance: 'low' | 'medium' | 'high';
  relatedEvents: string[];
}

/**
 * Complete behavioral profile for a user session.
 * Combines all profiling aspects.
 */
export interface BehavioralProfile {
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  
  // Core metrics
  totalEvents: number;
  sessionDuration: number;
  
  // Skill assessments
  skills: SkillAssessment[];
  
  // Detected patterns
  patterns: BehaviorPattern[];
  
  // Learning profile (pedagogical)
  learningStyle: LearningStyleProfile;
  interests: InterestProfile;
  
  // Guardrail status
  guardrailStatus: {
    alerts: GuardrailAlert[];
    riskScore: number;           // 0-100 overall risk assessment
    lastChecked: number;
  };
  
  // Session statistics
  stats: {
    commandsExecuted: number;
    pagesVisited: number;
    cluesFound: number;
    questsCompleted: number;
    agentInteractions: number;
    explorationScore: number;
    persistenceScore: number;
  };
  
  // Optimized prompt context
  optimizedContext: string;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Configuration for the behavioral analysis engine.
 */
export interface AnalyzerConfig {
  minEventsForProfile: number;
  patternWindowMs: number;
  refreshIntervalMs: number;
  maxStoredEvents: number;
  useLLMAnalysis: boolean;
  llmModel: string;
  
  // Guardrail settings
  guardrails: GuardrailConfig;
  
  // Anonymization settings
  anonymization: {
    level: AnonymizationLevel;
    exportEnabled: boolean;
    exportIntervalMs: number;
    retentionDays: number;
  };
}

// ============================================================================
// PROVIDER INTERFACES (FOR CUSTOM MODEL REPLACEMENT)
// ============================================================================

/**
 * Interface for LLM providers.
 * 
 * TO REPLACE WITH CUSTOM MODEL:
 * Implement this interface with your model's API.
 */
export interface ILLMProvider {
  analyzeEvents(
    events: BehaviorEvent[],
    existingProfile?: BehavioralProfile
  ): Promise<Partial<BehavioralProfile>>;
  
  generateOptimizedContext(
    profile: BehavioralProfile,
    maxTokens?: number
  ): Promise<OptimizedPromptContext>;
  
  checkGuardrails(
    events: BehaviorEvent[],
    config: GuardrailConfig
  ): Promise<GuardrailAlert[]>;
  
  isAvailable(): boolean;
  getProviderName(): string;
}

/**
 * Optimized prompt context output.
 */
export interface OptimizedPromptContext {
  summary: string;
  traits: string[];
  skillMap: Record<string, string>;
  learningHints: string[];
  agentHints: string[];
  estimatedTokens: number;
}

/**
 * Interface for the anonymization service.
 */
export interface IAnonymizationService {
  anonymizeProfile(profile: BehavioralProfile): AnonymizedBehaviorRecord;
  anonymizeEvents(events: BehaviorEvent[]): BehaviorEvent[];
  generateReport(records: AnonymizedBehaviorRecord[]): UXAnalyticsReport;
  hashIdentifier(id: string): string;
}

/**
 * Interface for the behavioral tracker.
 */
export interface IBehavioralTracker {
  track(event: Omit<BehaviorEvent, 'id' | 'timestamp' | 'sessionId'>): void;
  getEvents(options?: { limit?: number; category?: ActionCategory }): BehaviorEvent[];
  clearEvents(): void;
  getSessionId(): string;
  exportAnonymized(): AnonymizedBehaviorRecord;
}

/**
 * Interface for the behavioral analyzer.
 */
export interface IBehavioralAnalyzer {
  analyze(events: BehaviorEvent[]): Promise<BehavioralProfile>;
  getProfile(): BehavioralProfile | null;
  updateProfile(events: BehaviorEvent[]): Promise<BehavioralProfile>;
  checkGuardrails(): Promise<GuardrailAlert[]>;
}
