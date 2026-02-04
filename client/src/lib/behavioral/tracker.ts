/**
 * ============================================================================
 * BEHAVIORAL TRACKER - Event Collection System
 * ============================================================================
 * 
 * Collects user behavior events for analysis. All events are stored locally
 * and optionally synced for anonymized UX analytics.
 * 
 * USAGE:
 *   import { tracker } from './tracker';
 *   tracker.track({ category: 'navigation', action: 'visited', target: '/terminal' });
 * 
 * PRIVACY CONSIDERATIONS:
 * - Events are stored in localStorage (user-controlled)
 * - No PII is collected in event data
 * - Session IDs are random, not tied to user identity
 * - Export requires explicit anonymization
 * ============================================================================
 */

import { 
  BehaviorEvent, 
  ActionCategory, 
  IBehavioralTracker,
  AnonymizedBehaviorRecord 
} from './types';

/**
 * Storage key for behavioral events in localStorage.
 */
const STORAGE_KEY = 'sysadmin_behavioral_events';
const SESSION_KEY = 'sysadmin_behavioral_session';
const MAX_STORED_EVENTS = 1000;

/**
 * Generate a unique event ID.
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate or retrieve session ID.
 * Session IDs are random and not tied to user identity.
 */
function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Hash content for pattern matching without storing raw content.
 * Uses a simple non-cryptographic hash for performance.
 */
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `h_${Math.abs(hash).toString(36)}`;
}

/**
 * BehavioralTracker - Main event collection class.
 * 
 * Implements IBehavioralTracker interface for easy replacement.
 */
class BehavioralTracker implements IBehavioralTracker {
  private events: BehaviorEvent[] = [];
  private sessionId: string;
  private initialized: boolean = false;

  constructor() {
    this.sessionId = getOrCreateSessionId();
    this.loadFromStorage();
    this.initialized = true;
  }

  /**
   * Load events from localStorage on initialization.
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only load events from current session
        this.events = parsed.filter((e: BehaviorEvent) => e.sessionId === this.sessionId);
      }
    } catch (error) {
      console.warn('[BehavioralTracker] Failed to load stored events:', error);
      this.events = [];
    }
  }

  /**
   * Save events to localStorage.
   * Maintains a rolling window of MAX_STORED_EVENTS.
   */
  private saveToStorage(): void {
    try {
      // Trim to max events
      if (this.events.length > MAX_STORED_EVENTS) {
        this.events = this.events.slice(-MAX_STORED_EVENTS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.warn('[BehavioralTracker] Failed to save events:', error);
    }
  }

  /**
   * Track a user behavior event.
   * 
   * @param event - Event data (id, timestamp, sessionId auto-generated)
   */
  track(event: Omit<BehaviorEvent, 'id' | 'timestamp' | 'sessionId'>): void {
    const fullEvent: BehaviorEvent = {
      ...event,
      id: generateEventId(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      // Hash any content for pattern matching without storing raw data
      contentHash: event.metadata?.content 
        ? hashContent(String(event.metadata.content))
        : undefined
    };

    // Remove raw content from metadata (privacy)
    if (fullEvent.metadata?.content) {
      delete fullEvent.metadata.content;
    }

    this.events.push(fullEvent);
    this.saveToStorage();

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('[BehavioralTracker] Event:', fullEvent.category, fullEvent.action, fullEvent.target);
    }
  }

  /**
   * Get tracked events with optional filtering.
   */
  getEvents(options?: { limit?: number; category?: ActionCategory }): BehaviorEvent[] {
    let filtered = [...this.events];

    if (options?.category) {
      filtered = filtered.filter(e => e.category === options.category);
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  /**
   * Clear all tracked events.
   * Call when user requests data deletion.
   */
  clearEvents(): void {
    this.events = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get the current session ID.
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Start a new session (creates new session ID).
   */
  startNewSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sessionId = getOrCreateSessionId();
    this.events = [];
    this.saveToStorage();
  }

  /**
   * Get session statistics.
   */
  getSessionStats(): {
    eventCount: number;
    sessionStart: number;
    categories: Record<ActionCategory, number>;
  } {
    const categories: Record<string, number> = {};
    let sessionStart = Date.now();

    for (const event of this.events) {
      categories[event.category] = (categories[event.category] || 0) + 1;
      if (event.timestamp < sessionStart) {
        sessionStart = event.timestamp;
      }
    }

    return {
      eventCount: this.events.length,
      sessionStart,
      categories: categories as Record<ActionCategory, number>
    };
  }

  /**
   * Export anonymized record for UX analytics.
   * Applies data minimization and bucketing.
   */
  exportAnonymized(): AnonymizedBehaviorRecord {
    const stats = this.getSessionStats();
    const duration = Date.now() - stats.sessionStart;

    // Bucket function for k-anonymity
    const bucket = (n: number, buckets: number[]): string => {
      for (let i = 0; i < buckets.length - 1; i++) {
        if (n <= buckets[i]) return `${i > 0 ? buckets[i-1] + 1 : 0}-${buckets[i]}`;
      }
      return `${buckets[buckets.length - 1]}+`;
    };

    // Generate time bucket (week granularity)
    const now = new Date();
    const weekNum = Math.ceil((now.getDate() - now.getDay() + 1) / 7);
    const timeBucket = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-W${String(weekNum).padStart(2, '0')}`;

    return {
      anonymousId: this.hashIdentifier(this.sessionId),
      timeBucket,
      metrics: {
        sessionDuration: Math.round(duration / 300000) * 5 * 60000, // Round to 5 min
        actionsPerMinute: Math.round((stats.eventCount / (duration / 60000)) * 10) / 10,
        pagesVisited: bucket(stats.categories.navigation || 0, [5, 10, 20]).length,
        commandsExecuted: bucket(stats.categories.terminal || 0, [10, 25, 50]).length,
        cluesFound: bucket(stats.categories.clue || 0, [3, 5, 10]).length,
        campaignsAttempted: 0, // Will be filled by analyzer
        campaignsCompleted: 0
      },
      learningStyle: {
        primaryStyle: 'unknown',
        paceCategory: 'unknown',
        difficultyPreference: 'unknown'
      },
      interestCategories: [],
      frictionPoints: [],
      featureEngagement: {}
    };
  }

  /**
   * One-way hash for anonymization.
   */
  private hashIdentifier(id: string): string {
    let hash = 5381;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) + hash) + id.charCodeAt(i);
    }
    return `anon_${Math.abs(hash).toString(36)}`;
  }
}

// ============================================================================
// CONVENIENCE TRACKING FUNCTIONS
// ============================================================================

/**
 * Singleton tracker instance.
 */
export const tracker = new BehavioralTracker();

/**
 * Track a page navigation event.
 */
export function trackNavigation(path: string, metadata?: Record<string, unknown>): void {
  tracker.track({
    category: 'navigation',
    action: 'visited',
    target: path,
    metadata
  });
}

/**
 * Track a terminal command execution.
 */
export function trackCommand(command: string, success: boolean, metadata?: Record<string, unknown>): void {
  tracker.track({
    category: 'terminal',
    action: success ? 'executed' : 'failed',
    target: command.split(' ')[0], // Only store command name, not arguments
    metadata: { ...metadata, success }
  });
}

/**
 * Track an AI agent interaction.
 */
export function trackAgentInteraction(
  action: 'message_sent' | 'response_received' | 'campaign_started' | 'campaign_completed',
  target: string,
  metadata?: Record<string, unknown>
): void {
  tracker.track({
    category: 'agent',
    action,
    target,
    metadata
  });
}

/**
 * Track a clue discovery.
 */
export function trackClueDiscovery(clueId: string, location: string): void {
  tracker.track({
    category: 'clue',
    action: 'discovered',
    target: clueId,
    metadata: { location }
  });
}

/**
 * Track exploration of hidden routes.
 */
export function trackExploration(route: string, discovered: boolean): void {
  tracker.track({
    category: 'exploration',
    action: discovered ? 'discovered' : 'visited',
    target: route
  });
}

/**
 * Track an error encounter.
 */
export function trackError(errorType: string, context: string): void {
  tracker.track({
    category: 'error',
    action: 'encountered',
    target: errorType,
    metadata: { context }
  });
}

/**
 * Track content creation/input (for guardrail monitoring).
 * Content is hashed, not stored.
 */
export function trackContent(action: string, contentType: string, content: string): void {
  tracker.track({
    category: 'content',
    action,
    target: contentType,
    metadata: { content }, // Will be hashed by tracker
    targetType: 'self'
  });
}

export default tracker;
