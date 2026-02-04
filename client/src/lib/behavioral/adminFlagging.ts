/**
 * ============================================================================
 * ADMIN FLAGGING SYSTEM - Escalation & RLHF Feedback Loop
 * ============================================================================
 * 
 * Handles escalation of problematic behavior to admins with full context,
 * and implements an RLHF-style feedback loop for model improvement.
 * 
 * KEY FEATURES:
 * 1. Full context capture (IP, session data, interaction history)
 * 2. Admin review interface with grading system
 * 3. Confusion matrix tracking for benchmarking
 * 4. Model improvement through feedback integration
 * 
 * PRIVACY NOTE:
 * - IP and identifying data is only captured for flagged escalations
 * - Data is retained per your data retention policy
 * - Ensure compliance with GDPR/CCPA as applicable
 * ============================================================================
 */

import { GuardrailAlert, BehaviorEvent, AbuseCategory, AlertSeverity } from './types';

// ============================================================================
// ESCALATION TYPES
// ============================================================================

/**
 * Full escalation record with all context for admin review.
 */
export interface EscalationRecord {
  id: string;
  createdAt: number;
  
  // Alert that triggered escalation
  alert: GuardrailAlert;
  
  // User identifying information (captured on escalation only)
  userContext: {
    sessionId: string;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string | null;           // If authenticated
    username: string | null;         // If authenticated
    accountCreatedAt: number | null;
    previousFlags: number;           // Historical flag count
  };
  
  // Full interaction context
  interactionContext: {
    events: BehaviorEvent[];         // All events in session
    recentMessages: string[];        // Recent agent messages (if applicable)
    currentPage: string;
    sessionDuration: number;
    actionsBeforeFlag: number;
  };
  
  // Explanation for escalation
  explanation: {
    summary: string;
    triggerPatterns: string[];
    riskFactors: string[];
    confidenceScore: number;
    modelVersion: string;
    timestamp: number;
  };
  
  // Admin review status
  reviewStatus: 'pending' | 'reviewing' | 'reviewed';
  reviewedBy: string | null;
  reviewedAt: number | null;
  
  // RLHF feedback
  feedback: RLHFFeedback | null;
}

/**
 * Admin feedback for RLHF training.
 */
export interface RLHFFeedback {
  id: string;
  escalationId: string;
  reviewerId: string;
  reviewedAt: number;
  
  // Core classification
  classification: 'true_positive' | 'false_positive' | 'true_negative' | 'false_negative' | 'uncertain';
  
  // Detailed grading (1-5 scale)
  grades: {
    severityAccuracy: number;      // Was severity level correct?
    categoryAccuracy: number;      // Was category correct?
    contextRelevance: number;      // Was flagged context actually problematic?
    explanationQuality: number;    // Was explanation helpful?
    actionAppropriateness: number; // Was recommended action appropriate?
  };
  
  // Correct classification (if model was wrong)
  correctCategory: AbuseCategory | null;
  correctSeverity: AlertSeverity | null;
  
  // Free-form feedback
  notes: string;
  
  // Suggested pattern adjustments
  patternFeedback: {
    patternsThatWorked: string[];
    patternsThatFailed: string[];
    suggestedNewPatterns: string[];
  };
}

/**
 * Confusion matrix for model performance tracking.
 */
export interface ConfusionMatrix {
  // Per-category performance
  byCategory: Record<AbuseCategory, {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
    precision: number;
    recall: number;
    f1Score: number;
  }>;
  
  // Overall performance
  overall: {
    totalReviewed: number;
    accuracy: number;
    avgPrecision: number;
    avgRecall: number;
    avgF1: number;
  };
  
  // Trends over time
  weeklyTrends: {
    weekStart: number;
    accuracy: number;
    falsePositiveRate: number;
    reviewedCount: number;
  }[];
  
  // Last updated
  lastUpdated: number;
  modelVersion: string;
}

/**
 * Benchmark targets for model performance.
 */
export interface PerformanceBenchmarks {
  // Minimum acceptable performance per category
  categoryTargets: Record<AbuseCategory, {
    minPrecision: number;
    minRecall: number;
    maxFalsePositiveRate: number;
  }>;
  
  // Overall targets
  overallTargets: {
    minAccuracy: number;
    maxFalsePositiveRate: number;
    targetF1: number;
  };
  
  // Trend requirements
  trendTargets: {
    weekOverWeekImprovement: number;
    maxRegressionAllowed: number;
  };
}

// ============================================================================
// DEFAULT BENCHMARKS
// ============================================================================

export const DEFAULT_BENCHMARKS: PerformanceBenchmarks = {
  categoryTargets: {
    csam_indicator: { minPrecision: 0.5, minRecall: 0.99, maxFalsePositiveRate: 0.5 },
    harassment: { minPrecision: 0.7, minRecall: 0.8, maxFalsePositiveRate: 0.3 },
    doxxing: { minPrecision: 0.75, minRecall: 0.85, maxFalsePositiveRate: 0.25 },
    stalking: { minPrecision: 0.7, minRecall: 0.8, maxFalsePositiveRate: 0.3 },
    hate_speech: { minPrecision: 0.75, minRecall: 0.8, maxFalsePositiveRate: 0.25 },
    self_harm: { minPrecision: 0.6, minRecall: 0.9, maxFalsePositiveRate: 0.4 },
    violence: { minPrecision: 0.75, minRecall: 0.85, maxFalsePositiveRate: 0.25 },
    manipulation: { minPrecision: 0.7, minRecall: 0.75, maxFalsePositiveRate: 0.3 },
    spam: { minPrecision: 0.85, minRecall: 0.9, maxFalsePositiveRate: 0.15 },
    evasion: { minPrecision: 0.7, minRecall: 0.75, maxFalsePositiveRate: 0.3 }
  },
  overallTargets: {
    minAccuracy: 0.8,
    maxFalsePositiveRate: 0.2,
    targetF1: 0.75
  },
  trendTargets: {
    weekOverWeekImprovement: 0.01,
    maxRegressionAllowed: 0.05
  }
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

const ESCALATIONS_KEY = 'sysadmin_escalations';
const FEEDBACK_KEY = 'sysadmin_rlhf_feedback';
const MATRIX_KEY = 'sysadmin_confusion_matrix';

// ============================================================================
// CONTEXT CAPTURE FUNCTIONS
// ============================================================================

/**
 * Capture user context for escalation.
 * Only call this when escalating - don't capture IP routinely.
 */
export async function captureUserContext(): Promise<EscalationRecord['userContext']> {
  const sessionId = localStorage.getItem('sysadmin_behavioral_session') || 'unknown';
  
  // Get IP address (requires server endpoint)
  let ipAddress: string | null = null;
  try {
    const ipResponse = await fetch('/api/client-info');
    if (ipResponse.ok) {
      const data = await ipResponse.json();
      ipAddress = data.ip || null;
    }
  } catch {
    // IP capture failed, continue without
  }
  
  // Get previous flag count
  const escalations = getStoredEscalations();
  const previousFlags = escalations.filter(e => e.userContext.sessionId === sessionId).length;
  
  return {
    sessionId,
    ipAddress,
    userAgent: navigator.userAgent,
    userId: null,      // Would come from auth context
    username: null,    // Would come from auth context
    accountCreatedAt: null,
    previousFlags
  };
}

/**
 * Capture full interaction context for escalation.
 */
export function captureInteractionContext(
  events: BehaviorEvent[],
  recentMessages: string[] = []
): EscalationRecord['interactionContext'] {
  const sessionStart = events.length > 0 ? events[0].timestamp : Date.now();
  
  return {
    events: events.slice(-100), // Last 100 events
    recentMessages: recentMessages.slice(-20), // Last 20 messages
    currentPage: window.location.pathname,
    sessionDuration: Date.now() - sessionStart,
    actionsBeforeFlag: events.length
  };
}

/**
 * Generate explanation for escalation.
 */
export function generateEscalationExplanation(
  alert: GuardrailAlert,
  events: BehaviorEvent[]
): EscalationRecord['explanation'] {
  const riskFactors: string[] = [];
  
  // Analyze risk factors
  if (alert.confidence > 0.8) riskFactors.push('High confidence detection');
  if (alert.requiresImmediateReview) riskFactors.push('Requires immediate review');
  if (events.length > 50) riskFactors.push('High activity session');
  
  // Check for repeat patterns
  const targetCounts: Record<string, number> = {};
  for (const event of events) {
    if (event.targetType === 'other') {
      targetCounts[event.target] = (targetCounts[event.target] || 0) + 1;
    }
  }
  const maxTarget = Math.max(...Object.values(targetCounts), 0);
  if (maxTarget > 5) riskFactors.push(`Repeated targeting (${maxTarget}x)`);
  
  return {
    summary: alert.description,
    triggerPatterns: alert.triggerPatterns,
    riskFactors,
    confidenceScore: alert.confidence,
    modelVersion: '1.0.0',
    timestamp: Date.now()
  };
}

// ============================================================================
// ESCALATION MANAGEMENT
// ============================================================================

/**
 * Create and store an escalation record.
 */
export async function createEscalation(
  alert: GuardrailAlert,
  events: BehaviorEvent[],
  recentMessages: string[] = []
): Promise<EscalationRecord> {
  const escalation: EscalationRecord = {
    id: `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    alert,
    userContext: await captureUserContext(),
    interactionContext: captureInteractionContext(events, recentMessages),
    explanation: generateEscalationExplanation(alert, events),
    reviewStatus: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    feedback: null
  };
  
  // Store escalation
  const escalations = getStoredEscalations();
  escalations.push(escalation);
  localStorage.setItem(ESCALATIONS_KEY, JSON.stringify(escalations));
  
  // Log for admin notification
  console.error('[ESCALATION CREATED]', {
    id: escalation.id,
    category: alert.category,
    severity: alert.severity,
    requiresImmediate: alert.requiresImmediateReview
  });
  
  // In production, send to admin dashboard
  await sendToAdminDashboard(escalation);
  
  return escalation;
}

/**
 * Get stored escalations.
 */
export function getStoredEscalations(): EscalationRecord[] {
  try {
    const stored = localStorage.getItem(ESCALATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get pending escalations for admin review.
 */
export function getPendingEscalations(): EscalationRecord[] {
  return getStoredEscalations().filter(e => e.reviewStatus === 'pending');
}

/**
 * Send FULL escalation context to admin dashboard.
 * Sends complete data for server-side storage and review.
 * Local storage is only used as fallback if server is unreachable.
 */
async function sendToAdminDashboard(escalation: EscalationRecord): Promise<void> {
  try {
    // Send FULL escalation context to server for secure storage
    const response = await fetch('/api/admin/escalations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Full escalation data for server storage
        id: escalation.id,
        createdAt: escalation.createdAt,
        
        // Alert details
        alert: {
          id: escalation.alert.id,
          category: escalation.alert.category,
          severity: escalation.alert.severity,
          confidence: escalation.alert.confidence,
          triggerPatterns: escalation.alert.triggerPatterns,
          description: escalation.alert.description,
          recommendedAction: escalation.alert.recommendedAction,
          requiresImmediateReview: escalation.alert.requiresImmediateReview
        },
        
        // User context (PII - stored server-side only)
        userContext: escalation.userContext,
        
        // Interaction context (trimmed for size)
        interactionContext: {
          recentMessages: escalation.interactionContext.recentMessages,
          currentPage: escalation.interactionContext.currentPage,
          sessionDuration: escalation.interactionContext.sessionDuration,
          actionsBeforeFlag: escalation.interactionContext.actionsBeforeFlag,
          // Send last 50 events only
          eventSummary: escalation.interactionContext.events.slice(-50).map(e => ({
            category: e.category,
            action: e.action,
            target: e.target,
            timestamp: e.timestamp
          }))
        },
        
        // Explanation
        explanation: escalation.explanation
      })
    });
    
    if (response.ok) {
      // Server stored successfully - remove PII from local storage
      clearLocalPII(escalation.id);
    }
  } catch (error) {
    // Fallback: keep in local storage for retry
    console.warn('[Escalation] Failed to send to admin, stored locally for retry');
    markForRetry(escalation.id);
  }
}

/**
 * Clear PII from local escalation storage after server confirms receipt.
 */
function clearLocalPII(escalationId: string): void {
  const escalations = getStoredEscalations();
  const escalation = escalations.find(e => e.id === escalationId);
  if (escalation) {
    // Redact PII from local copy
    escalation.userContext = {
      sessionId: '[SENT_TO_SERVER]',
      ipAddress: null,
      userAgent: null,
      userId: null,
      username: null,
      accountCreatedAt: null,
      previousFlags: 0
    };
    escalation.interactionContext = {
      events: [],
      recentMessages: [],
      currentPage: '[SENT_TO_SERVER]',
      sessionDuration: 0,
      actionsBeforeFlag: 0
    };
    localStorage.setItem(ESCALATIONS_KEY, JSON.stringify(escalations));
  }
}

/**
 * Mark escalation for retry sync.
 */
function markForRetry(escalationId: string): void {
  const retryQueue = JSON.parse(localStorage.getItem('escalation_retry_queue') || '[]');
  if (!retryQueue.includes(escalationId)) {
    retryQueue.push(escalationId);
    localStorage.setItem('escalation_retry_queue', JSON.stringify(retryQueue));
  }
}

/**
 * Retry sending pending escalations to server.
 * Call periodically or on reconnect.
 */
export async function retryPendingEscalations(): Promise<number> {
  const retryQueue = JSON.parse(localStorage.getItem('escalation_retry_queue') || '[]');
  if (retryQueue.length === 0) return 0;
  
  const escalations = getStoredEscalations();
  let successCount = 0;
  
  for (const id of retryQueue) {
    const escalation = escalations.find(e => e.id === id);
    if (escalation && escalation.userContext.sessionId !== '[SENT_TO_SERVER]') {
      await sendToAdminDashboard(escalation);
      successCount++;
    }
  }
  
  // Clear successfully sent from retry queue
  localStorage.setItem('escalation_retry_queue', JSON.stringify([]));
  return successCount;
}

// ============================================================================
// RLHF FEEDBACK SYSTEM
// ============================================================================

/**
 * Submit admin feedback for an escalation.
 */
export function submitFeedback(
  escalationId: string,
  reviewerId: string,
  feedback: Omit<RLHFFeedback, 'id' | 'escalationId' | 'reviewerId' | 'reviewedAt'>
): RLHFFeedback {
  const fullFeedback: RLHFFeedback = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    escalationId,
    reviewerId,
    reviewedAt: Date.now(),
    ...feedback
  };
  
  // Store feedback
  const allFeedback = getStoredFeedback();
  allFeedback.push(fullFeedback);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(allFeedback));
  
  // Update escalation record
  const escalations = getStoredEscalations();
  const escalation = escalations.find(e => e.id === escalationId);
  if (escalation) {
    escalation.feedback = fullFeedback;
    escalation.reviewStatus = 'reviewed';
    escalation.reviewedBy = reviewerId;
    escalation.reviewedAt = Date.now();
    localStorage.setItem(ESCALATIONS_KEY, JSON.stringify(escalations));
  }
  
  // Update confusion matrix
  updateConfusionMatrix(fullFeedback);
  
  return fullFeedback;
}

/**
 * Get stored feedback.
 */
export function getStoredFeedback(): RLHFFeedback[] {
  try {
    const stored = localStorage.getItem(FEEDBACK_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// ============================================================================
// CONFUSION MATRIX & BENCHMARKING
// ============================================================================

/**
 * Get or initialize confusion matrix.
 */
export function getConfusionMatrix(): ConfusionMatrix {
  try {
    const stored = localStorage.getItem(MATRIX_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* continue to default */ }
  
  // Initialize empty matrix
  const categories: AbuseCategory[] = [
    'harassment', 'doxxing', 'stalking', 'csam_indicator',
    'hate_speech', 'self_harm', 'violence', 'manipulation', 'spam', 'evasion'
  ];
  
  const byCategory: ConfusionMatrix['byCategory'] = {} as ConfusionMatrix['byCategory'];
  for (const cat of categories) {
    byCategory[cat] = {
      truePositives: 0,
      falsePositives: 0,
      trueNegatives: 0,
      falseNegatives: 0,
      precision: 0,
      recall: 0,
      f1Score: 0
    };
  }
  
  return {
    byCategory,
    overall: {
      totalReviewed: 0,
      accuracy: 0,
      avgPrecision: 0,
      avgRecall: 0,
      avgF1: 0
    },
    weeklyTrends: [],
    lastUpdated: Date.now(),
    modelVersion: '1.0.0'
  };
}

/**
 * Update confusion matrix based on feedback.
 * Handles correctCategory for misclassification and uncertain classifications.
 */
export function updateConfusionMatrix(feedback: RLHFFeedback): void {
  const matrix = getConfusionMatrix();
  
  // Get the escalation to know original category
  const escalations = getStoredEscalations();
  const escalation = escalations.find(e => e.id === feedback.escalationId);
  if (!escalation) return;
  
  const originalCategory = escalation.alert.category;
  const originalCategoryData = matrix.byCategory[originalCategory];
  
  // Handle classification with proper ground-truth mapping
  switch (feedback.classification) {
    case 'true_positive':
      // Model correctly identified this category
      originalCategoryData.truePositives++;
      break;
      
    case 'false_positive':
      // Model flagged wrong category or flagged when shouldn't have
      originalCategoryData.falsePositives++;
      // If there's a correct category, that category had a false negative
      if (feedback.correctCategory && feedback.correctCategory !== originalCategory) {
        matrix.byCategory[feedback.correctCategory].falseNegatives++;
      }
      break;
      
    case 'true_negative':
      // Model correctly didn't flag (rare - usually we review positives)
      originalCategoryData.trueNegatives++;
      break;
      
    case 'false_negative':
      // Model missed this - should have flagged
      // The correctCategory indicates what it actually was
      if (feedback.correctCategory) {
        matrix.byCategory[feedback.correctCategory].falseNegatives++;
      } else {
        originalCategoryData.falseNegatives++;
      }
      break;
      
    case 'uncertain':
      // Don't update metrics for uncertain cases, but log for analysis
      console.log('[RLHF] Uncertain classification logged:', {
        escalationId: feedback.escalationId,
        originalCategory,
        notes: feedback.notes
      });
      return; // Skip metric updates for uncertain
  }
  
  // Recalculate metrics for ALL categories (not just original)
  const categories = Object.entries(matrix.byCategory);
  
  for (const [, categoryData] of categories) {
    const tp = categoryData.truePositives;
    const fp = categoryData.falsePositives;
    const fn = categoryData.falseNegatives;
    
    categoryData.precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    categoryData.recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    categoryData.f1Score = categoryData.precision + categoryData.recall > 0
      ? 2 * (categoryData.precision * categoryData.recall) / (categoryData.precision + categoryData.recall)
      : 0;
  }
  
  // Recalculate overall metrics
  const allCategories = Object.values(matrix.byCategory);
  const totalPositives = allCategories.reduce((a, c) => a + c.truePositives + c.falsePositives, 0);
  const totalReviewed = allCategories.reduce((a, c) => a + c.truePositives + c.falsePositives + c.falseNegatives + c.trueNegatives, 0);
  const totalCorrect = allCategories.reduce((a, c) => a + c.truePositives + c.trueNegatives, 0);
  
  // Only count categories with actual data for averaging
  const categoriesWithData = allCategories.filter(c => c.truePositives + c.falsePositives + c.falseNegatives > 0);
  const numWithData = categoriesWithData.length || 1;
  
  matrix.overall = {
    totalReviewed,
    accuracy: totalReviewed > 0 ? totalCorrect / totalReviewed : 0,
    avgPrecision: categoriesWithData.reduce((a, c) => a + c.precision, 0) / numWithData,
    avgRecall: categoriesWithData.reduce((a, c) => a + c.recall, 0) / numWithData,
    avgF1: categoriesWithData.reduce((a, c) => a + c.f1Score, 0) / numWithData
  };
  
  // Update weekly trend
  const weekStart = getWeekStart(Date.now());
  const existingWeek = matrix.weeklyTrends.find(w => w.weekStart === weekStart);
  const fpRate = totalPositives > 0 
    ? allCategories.reduce((a, c) => a + c.falsePositives, 0) / totalPositives 
    : 0;
    
  if (existingWeek) {
    existingWeek.accuracy = matrix.overall.accuracy;
    existingWeek.falsePositiveRate = fpRate;
    existingWeek.reviewedCount++;
  } else {
    matrix.weeklyTrends.push({
      weekStart,
      accuracy: matrix.overall.accuracy,
      falsePositiveRate: fpRate,
      reviewedCount: 1
    });
  }
  
  matrix.lastUpdated = Date.now();
  localStorage.setItem(MATRIX_KEY, JSON.stringify(matrix));
  
  // Send metrics to server for persistence
  syncMatrixToServer(matrix).catch(console.error);
}

/**
 * Sync confusion matrix to server for persistence.
 */
async function syncMatrixToServer(matrix: ConfusionMatrix): Promise<void> {
  try {
    await fetch('/api/admin/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matrix, timestamp: Date.now() })
    });
  } catch {
    // Fallback to local storage only
  }
}

function getWeekStart(timestamp: number): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
}

/**
 * Check if model meets benchmarks.
 */
export function checkBenchmarks(
  matrix: ConfusionMatrix,
  benchmarks: PerformanceBenchmarks = DEFAULT_BENCHMARKS
): {
  passing: boolean;
  issues: { category: string; metric: string; current: number; target: number }[];
  recommendations: string[];
} {
  const issues: { category: string; metric: string; current: number; target: number }[] = [];
  const recommendations: string[] = [];
  
  // Check category-level targets
  for (const [category, targets] of Object.entries(benchmarks.categoryTargets)) {
    const data = matrix.byCategory[category as AbuseCategory];
    if (!data) continue;
    
    if (data.precision < targets.minPrecision) {
      issues.push({
        category,
        metric: 'precision',
        current: data.precision,
        target: targets.minPrecision
      });
      recommendations.push(`${category}: Tighten detection patterns to reduce false positives`);
    }
    
    if (data.recall < targets.minRecall) {
      issues.push({
        category,
        metric: 'recall',
        current: data.recall,
        target: targets.minRecall
      });
      recommendations.push(`${category}: Add more detection patterns to catch missed cases`);
    }
  }
  
  // Check overall targets
  if (matrix.overall.accuracy < benchmarks.overallTargets.minAccuracy) {
    issues.push({
      category: 'overall',
      metric: 'accuracy',
      current: matrix.overall.accuracy,
      target: benchmarks.overallTargets.minAccuracy
    });
  }
  
  return {
    passing: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Generate threshold adjustments based on feedback.
 * This is the RLHF output that would tune the model.
 */
export function generateThresholdAdjustments(
  matrix: ConfusionMatrix
): Record<AbuseCategory, { adjustment: number; reason: string }> {
  const adjustments: Record<string, { adjustment: number; reason: string }> = {};
  
  for (const [category, data] of Object.entries(matrix.byCategory)) {
    const fpRate = data.truePositives + data.falsePositives > 0
      ? data.falsePositives / (data.truePositives + data.falsePositives)
      : 0;
    const fnRate = data.truePositives + data.falseNegatives > 0
      ? data.falseNegatives / (data.truePositives + data.falseNegatives)
      : 0;
    
    let adjustment = 0;
    let reason = 'No adjustment needed';
    
    if (fpRate > 0.3) {
      // Too many false positives - raise threshold
      adjustment = 0.1;
      reason = `High false positive rate (${(fpRate * 100).toFixed(1)}%) - raising threshold`;
    } else if (fnRate > 0.2) {
      // Missing too many - lower threshold
      adjustment = -0.1;
      reason = `High false negative rate (${(fnRate * 100).toFixed(1)}%) - lowering threshold`;
    } else if (data.f1Score > 0.8) {
      reason = `Good performance (F1: ${data.f1Score.toFixed(2)})`;
    }
    
    adjustments[category] = { adjustment, reason };
  }
  
  return adjustments as Record<AbuseCategory, { adjustment: number; reason: string }>;
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export all RLHF data for model training.
 */
export function exportRLHFData(): {
  escalations: EscalationRecord[];
  feedback: RLHFFeedback[];
  matrix: ConfusionMatrix;
  adjustments: Record<AbuseCategory, { adjustment: number; reason: string }>;
} {
  const matrix = getConfusionMatrix();
  return {
    escalations: getStoredEscalations(),
    feedback: getStoredFeedback(),
    matrix,
    adjustments: generateThresholdAdjustments(matrix)
  };
}

export default {
  createEscalation,
  submitFeedback,
  getConfusionMatrix,
  checkBenchmarks,
  generateThresholdAdjustments,
  exportRLHFData,
  getPendingEscalations
};
