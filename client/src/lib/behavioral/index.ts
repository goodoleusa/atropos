/**
 * ============================================================================
 * BEHAVIORAL PROFILING SYSTEM - Main Index
 * ============================================================================
 * 
 * Central export for the behavioral profiling system.
 * 
 * USAGE:
 *   import { tracker, trackNavigation, checkGuardrails } from '@/lib/behavioral';
 * 
 * COMPONENTS:
 * 1. Types - All type definitions
 * 2. Tracker - Event collection
 * 3. Guardrails - Abuse detection
 * 4. Reports - Export templates
 * 5. Admin Flagging - Escalation & RLHF
 * ============================================================================
 */

// Types
export * from './types';

// Tracker
export { 
  tracker,
  trackNavigation,
  trackCommand,
  trackAgentInteraction,
  trackClueDiscovery,
  trackExploration,
  trackError,
  trackContent
} from './tracker';

// Guardrails
export {
  checkGuardrails,
  DEFAULT_GUARDRAIL_CONFIG,
  logAlertForReview,
  getSelfHarmResources
} from './guardrails';

// Reports
export {
  generateUXReport,
  generateGuardrailReport,
  generateLearningReport,
  exportReport,
  downloadReport,
  exportToJSON,
  exportToCSV,
  exportToMarkdown,
  exportToHTML,
  ANALYSIS_PROMPTS,
  type UXReport,
  type GuardrailReport,
  type LearningReport,
  type ExportFormat,
  type ExportOptions
} from './reports';

// Admin Flagging & RLHF
export {
  createEscalation,
  submitFeedback,
  getConfusionMatrix,
  checkBenchmarks,
  generateThresholdAdjustments,
  exportRLHFData,
  getPendingEscalations,
  getStoredEscalations,
  getStoredFeedback,
  retryPendingEscalations,
  DEFAULT_BENCHMARKS,
  type EscalationRecord,
  type RLHFFeedback,
  type ConfusionMatrix,
  type PerformanceBenchmarks
} from './adminFlagging';
