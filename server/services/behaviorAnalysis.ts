import { storage } from "../storage";
import { db } from "../db";
import { 
  userAnalyses, 
  userFeedback, 
  improvementQueue,
  interactionLogs,
  behavioralProfiles,
  gameSessions
} from "@shared/schema";
import { eq, desc, gte, count, sql, and } from "drizzle-orm";
import { getOpenRouterClient, withCache, logCacheStatus } from "../lib/openrouterClient";

const ANALYSIS_THRESHOLDS = {
  minInteractionsForAnalysis: 20,
  minMinutesForAnalysis: 5,
  periodicAnalysisIntervalHours: 24,
  suspiciousRapidFireThreshold: 50,
  suspiciousErrorRateThreshold: 0.3,
};

// Collect raw behavioral data for a session
async function collectSessionData(sessionToken: string) {
  const [
    interactions,
    behaviors,
    session,
    feedbackItems
  ] = await Promise.all([
    db.select().from(interactionLogs)
      .where(eq(interactionLogs.sessionToken, sessionToken))
      .orderBy(desc(interactionLogs.timestamp))
      .limit(200),
    db.select().from(behavioralProfiles)
      .where(eq(behavioralProfiles.sessionToken, sessionToken))
      .orderBy(desc(behavioralProfiles.timestamp))
      .limit(100),
    storage.getSessionByToken(sessionToken),
    db.select().from(userFeedback)
      .where(eq(userFeedback.sessionToken, sessionToken))
      .orderBy(desc(userFeedback.createdAt))
      .limit(50)
  ]);

  return { interactions, behaviors, session, feedbackItems };
}

// Calculate basic metrics from raw data
function calculateMetrics(data: Awaited<ReturnType<typeof collectSessionData>>) {
  const { interactions, behaviors, session } = data;
  
  if (!interactions.length) {
    return null;
  }

  const firstInteraction = interactions[interactions.length - 1];
  const lastInteraction = interactions[0];
  const timeSpanMs = new Date(lastInteraction.timestamp).getTime() - 
                     new Date(firstInteraction.timestamp).getTime();
  const timeSpentMinutes = Math.round(timeSpanMs / 60000);

  // Feature usage counts
  const featureUsage: Record<string, number> = {};
  const actionTypes: Record<string, number> = {};
  const errorCount = interactions.filter(i => 
    i.output && (i.output as any).error
  ).length;

  for (const i of interactions) {
    featureUsage[i.source] = (featureUsage[i.source] || 0) + 1;
    actionTypes[i.actionType] = (actionTypes[i.actionType] || 0) + 1;
  }

  // Behavioral category counts
  const categoryCount: Record<string, number> = {};
  for (const b of behaviors) {
    categoryCount[b.category] = (categoryCount[b.category] || 0) + b.intensity;
  }

  // Calculate activity rate (actions per minute)
  const actionsPerMinute = timeSpentMinutes > 0 
    ? interactions.length / timeSpentMinutes 
    : 0;

  // Error rate
  const errorRate = interactions.length > 0 
    ? errorCount / interactions.length 
    : 0;

  // Preferred features (top 3)
  const preferredFeatures = Object.entries(featureUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([feature]) => feature);

  // Command patterns
  const commands = interactions
    .filter(i => i.actionType === 'chat' || i.source === 'terminal')
    .map(i => (i.input as any)?.command || (i.input as any)?.prompt || '')
    .filter(Boolean);

  return {
    interactionCount: interactions.length,
    timeSpentMinutes,
    featureUsage,
    actionTypes,
    categoryCount,
    actionsPerMinute,
    errorRate,
    errorCount,
    preferredFeatures,
    commands: commands.slice(0, 20),
    cluesCollected: session?.collectedClues?.length || 0,
    questsCompleted: session?.completedQuests?.length || 0
  };
}

// Detect suspicious patterns
function detectSuspiciousPatterns(metrics: NonNullable<ReturnType<typeof calculateMetrics>>) {
  const patterns: string[] = [];
  const riskFactors: string[] = [];
  let maliciousLikelihood = 0;

  // Rapid fire activity
  if (metrics.actionsPerMinute > ANALYSIS_THRESHOLDS.suspiciousRapidFireThreshold) {
    patterns.push('rapid_fire_activity');
    riskFactors.push('Unusually high action rate - possible automation');
    maliciousLikelihood += 25;
  }

  // High error rate
  if (metrics.errorRate > ANALYSIS_THRESHOLDS.suspiciousErrorRateThreshold) {
    patterns.push('high_error_rate');
    riskFactors.push('High error rate - possible probing/fuzzing');
    maliciousLikelihood += 20;
  }

  // Aggressive category dominance
  if (metrics.categoryCount['aggressive'] > (metrics.interactionCount * 0.5)) {
    patterns.push('aggressive_behavior_dominant');
    riskFactors.push('Predominantly aggressive interaction style');
    maliciousLikelihood += 15;
  }

  // Terminal heavy usage (could be recon)
  if (metrics.featureUsage['terminal'] > (metrics.interactionCount * 0.7)) {
    patterns.push('terminal_heavy_usage');
    // Not necessarily suspicious, but notable
  }

  // Check for injection-like patterns in commands
  const suspiciousPatterns = [
    /[<>]script/i,
    /union\s+select/i,
    /\.\.\//,
    /etc\/passwd/i,
    /\beval\b/i,
    /\bexec\b/i
  ];
  
  for (const cmd of metrics.commands) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(cmd)) {
        patterns.push('injection_attempt_detected');
        riskFactors.push('Possible injection attempt in commands');
        maliciousLikelihood += 30;
        break;
      }
    }
  }

  return {
    suspiciousPatterns: patterns,
    riskFactors,
    maliciousLikelihood: Math.min(100, maliciousLikelihood),
    trustScore: Math.max(0, 100 - maliciousLikelihood)
  };
}

// Generate AI-powered analysis
async function generateAIAnalysis(
  sessionToken: string,
  metrics: NonNullable<ReturnType<typeof calculateMetrics>>,
  riskData: ReturnType<typeof detectSuspiciousPatterns>
) {
  const client = getOpenRouterClient();

  const prompt = `You are a user behavior analyst for a security training platform. Analyze this user's behavior data and provide insights.

## USER DATA
Session: ${sessionToken.slice(0, 8)}...
Total Interactions: ${metrics.interactionCount}
Time Spent: ${metrics.timeSpentMinutes} minutes
Actions Per Minute: ${metrics.actionsPerMinute.toFixed(2)}
Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%

## FEATURE USAGE
${Object.entries(metrics.featureUsage).map(([f, c]) => `- ${f}: ${c} uses`).join('\n')}

## ACTION TYPES
${Object.entries(metrics.actionTypes).map(([a, c]) => `- ${a}: ${c}`).join('\n')}

## PROGRESS
- Clues Collected: ${metrics.cluesCollected}
- Quests Completed: ${metrics.questsCompleted}

## RISK ASSESSMENT
- Malicious Likelihood: ${riskData.maliciousLikelihood}%
- Trust Score: ${riskData.trustScore}%
- Risk Factors: ${riskData.riskFactors.join(', ') || 'None detected'}

Provide a JSON response with these fields:
{
  "personalityTraits": {
    "curiosity": 0-100,
    "patience": 0-100,
    "technicalAptitude": 0-100,
    "riskTolerance": 0-100,
    "persistence": 0-100,
    "creativity": 0-100
  },
  "narrativeSummary": "2-3 sentence personality summary",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "painPoints": ["pain point if any"],
  "suggestedImprovements": ["improvement suggestion for the product"],
  "learningStyle": "visual|auditory|reading|kinesthetic|mixed",
  "progressionSpeed": "fast|moderate|slow|stalled",
  "customerJourney": {
    "stage": "awareness|consideration|decision|retention|advocacy",
    "nextBestAction": "what action would move them to next stage",
    "churnRisk": 0-100,
    "lifetimeValuePotential": "low|medium|high",
    "segmentTags": ["tag1", "tag2"]
  },
  "marketingInsights": {
    "userPersona": "brief persona description",
    "motivations": ["motivation1", "motivation2"],
    "barriers": ["barrier1"],
    "messagingAngle": "how to message to this user type",
    "upsellOpportunities": ["opportunity1"]
  }
}`;

  try {
    const response = await client.chat.completions.create(withCache({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.3,
    }, 'behavior-analysis'));

    logCacheStatus(response, 'behavior');
    const content = response.choices[0]?.message?.content || '{}';
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('[BehaviorAnalysis] AI analysis failed:', error);
    return null;
  }
}

// Main analysis function
export async function analyzeUserBehavior(
  sessionToken: string,
  options?: { force?: boolean; analysisType?: string }
): Promise<{
  success: boolean;
  analysisId?: number;
  summary?: string;
  error?: string;
}> {
  try {
    // Collect data
    const data = await collectSessionData(sessionToken);
    const metrics = calculateMetrics(data);

    if (!metrics) {
      return { success: false, error: 'No interaction data found' };
    }

    // Check if analysis is warranted
    if (!options?.force) {
      if (metrics.interactionCount < ANALYSIS_THRESHOLDS.minInteractionsForAnalysis) {
        return { 
          success: false, 
          error: `Need at least ${ANALYSIS_THRESHOLDS.minInteractionsForAnalysis} interactions (have ${metrics.interactionCount})` 
        };
      }
    }

    // Detect suspicious patterns
    const riskData = detectSuspiciousPatterns(metrics);

    // Generate AI analysis
    const aiAnalysis = await generateAIAnalysis(sessionToken, metrics, riskData);

    // Build analysis record
    const analysis = {
      sessionToken,
      analysisType: options?.analysisType || 'periodic',
      interactionCount: metrics.interactionCount,
      timeSpentMinutes: metrics.timeSpentMinutes,
      personalityTraits: aiAnalysis?.personalityTraits || {
        curiosity: 50, patience: 50, technicalAptitude: 50,
        riskTolerance: 50, persistence: 50, creativity: 50
      },
      behaviorPatterns: {
        preferredFeatures: metrics.preferredFeatures,
        avoidedFeatures: [],
        peakActivityTimes: [],
        averageSessionLength: metrics.timeSpentMinutes,
        commandPatterns: metrics.commands.slice(0, 5),
        learningStyle: aiAnalysis?.learningStyle || 'unknown'
      },
      riskAssessment: {
        maliciousLikelihood: riskData.maliciousLikelihood,
        riskFactors: riskData.riskFactors,
        suspiciousPatterns: riskData.suspiciousPatterns,
        trustScore: riskData.trustScore,
        flaggedBehaviors: []
      },
      painPoints: {
        frustrationIndicators: aiAnalysis?.painPoints || [],
        abandonedFeatures: [],
        repeatedErrors: [],
        helpSeekingBehavior: [],
        suggestedImprovements: aiAnalysis?.suggestedImprovements || []
      },
      engagementMetrics: {
        overallEngagement: Math.min(100, (metrics.interactionCount / 50) * 100),
        featureAdoption: metrics.featureUsage,
        progressionSpeed: aiAnalysis?.progressionSpeed || 'moderate',
        returnRate: 0,
        completionRate: metrics.questsCompleted > 0 ? 50 : 0
      },
      narrativeSummary: aiAnalysis?.narrativeSummary || 
        `User has ${metrics.interactionCount} interactions over ${metrics.timeSpentMinutes} minutes.`,
      keyInsights: aiAnalysis?.keyInsights || [],
      recommendedActions: aiAnalysis?.suggestedImprovements || [],
      dataWindowStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      dataWindowEnd: new Date()
    };

    // Store analysis
    const [saved] = await db.insert(userAnalyses).values(analysis).returning();

    // If marketing insights exist, potentially create improvement queue items
    if (aiAnalysis?.marketingInsights) {
      const marketingData = aiAnalysis.marketingInsights;
      const customerJourney = aiAnalysis.customerJourney;

      // Store marketing insights as improvement queue item for admin review
      if (marketingData.barriers?.length > 0 || customerJourney?.churnRisk > 50) {
        await db.insert(improvementQueue).values({
          category: 'ux',
          source: 'behavior_analysis',
          title: `User Journey Insight: ${marketingData.userPersona || 'Unknown Persona'}`,
          description: `
Persona: ${marketingData.userPersona}
Journey Stage: ${customerJourney?.stage || 'unknown'}
Churn Risk: ${customerJourney?.churnRisk || 0}%
LTV Potential: ${customerJourney?.lifetimeValuePotential || 'unknown'}

Motivations: ${marketingData.motivations?.join(', ') || 'None identified'}
Barriers: ${marketingData.barriers?.join(', ') || 'None identified'}
Messaging Angle: ${marketingData.messagingAngle || 'N/A'}
Upsell Opportunities: ${marketingData.upsellOpportunities?.join(', ') || 'None'}

Next Best Action: ${customerJourney?.nextBestAction || 'N/A'}
          `.trim(),
          evidence: {
            analysisIds: [saved.id],
            sessionTokens: [sessionToken],
            impactScore: customerJourney?.churnRisk || 50
          },
          priority: customerJourney?.churnRisk > 70 ? 80 : 50
        });
      }
    }

    return {
      success: true,
      analysisId: saved.id,
      summary: analysis.narrativeSummary
    };

  } catch (error: any) {
    console.error('[BehaviorAnalysis] Error:', error);
    return { success: false, error: error.message };
  }
}

// Get latest analysis for a session
export async function getLatestAnalysis(sessionToken: string) {
  const [analysis] = await db.select()
    .from(userAnalyses)
    .where(eq(userAnalyses.sessionToken, sessionToken))
    .orderBy(desc(userAnalyses.analyzedAt))
    .limit(1);
  return analysis;
}

// Get all analyses for admin dashboard
export async function getAllAnalyses(limit = 50) {
  return await db.select()
    .from(userAnalyses)
    .orderBy(desc(userAnalyses.analyzedAt))
    .limit(limit);
}

// Get aggregated marketing segments
export async function getMarketingSegments() {
  const analyses = await db.select()
    .from(userAnalyses)
    .orderBy(desc(userAnalyses.analyzedAt))
    .limit(200);

  // Aggregate into segments
  const segments: Record<string, {
    count: number;
    avgEngagement: number;
    avgChurnRisk: number;
    commonMotivations: string[];
    commonBarriers: string[];
  }> = {};

  for (const a of analyses) {
    const stage = (a.engagementMetrics as any)?.progressionSpeed || 'unknown';
    if (!segments[stage]) {
      segments[stage] = {
        count: 0,
        avgEngagement: 0,
        avgChurnRisk: 0,
        commonMotivations: [],
        commonBarriers: []
      };
    }
    segments[stage].count++;
    segments[stage].avgEngagement += (a.engagementMetrics as any)?.overallEngagement || 0;
  }

  // Calculate averages
  for (const seg of Object.values(segments)) {
    if (seg.count > 0) {
      seg.avgEngagement = Math.round(seg.avgEngagement / seg.count);
    }
  }

  return segments;
}

// Check if session needs analysis
export async function shouldAnalyze(sessionToken: string): Promise<boolean> {
  // Get interaction count
  const [result] = await db.select({ count: count() })
    .from(interactionLogs)
    .where(eq(interactionLogs.sessionToken, sessionToken));

  const interactionCount = result?.count || 0;

  if (interactionCount < ANALYSIS_THRESHOLDS.minInteractionsForAnalysis) {
    return false;
  }

  // Check last analysis time
  const [lastAnalysis] = await db.select()
    .from(userAnalyses)
    .where(eq(userAnalyses.sessionToken, sessionToken))
    .orderBy(desc(userAnalyses.analyzedAt))
    .limit(1);

  if (!lastAnalysis) {
    return true; // Never analyzed
  }

  const hoursSinceLastAnalysis = 
    (Date.now() - new Date(lastAnalysis.analyzedAt).getTime()) / (1000 * 60 * 60);

  return hoursSinceLastAnalysis >= ANALYSIS_THRESHOLDS.periodicAnalysisIntervalHours;
}

// Batch analyze all eligible sessions
export async function runPeriodicAnalysis(): Promise<{
  analyzed: number;
  skipped: number;
  errors: number;
}> {
  const results = { analyzed: 0, skipped: 0, errors: 0 };

  // Get all sessions with sufficient activity
  const sessions = await db.select()
    .from(gameSessions)
    .orderBy(desc(gameSessions.lastActive))
    .limit(100);

  for (const session of sessions) {
    const shouldRun = await shouldAnalyze(session.sessionToken);
    
    if (!shouldRun) {
      results.skipped++;
      continue;
    }

    const result = await analyzeUserBehavior(session.sessionToken, {
      analysisType: 'periodic'
    });

    if (result.success) {
      results.analyzed++;
    } else {
      results.errors++;
    }
  }

  console.log(`[BehaviorAnalysis] Periodic run complete: ${results.analyzed} analyzed, ${results.skipped} skipped, ${results.errors} errors`);
  return results;
}
