import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { storage } from '../storage';
import { wandbTracker } from '../lib/wandbTracker';
import { getOpenRouterClient, withCache, logCacheStatus } from '../lib/openrouterClient';

const COMPRESSION_PROMPT = `You are a context compression engine. Condense the conversation into a dense state capsule that preserves:
1. KEY FINDINGS: All discoveries, evidence, vulnerabilities, IOCs
2. ACTIVE TASKS: What the user is currently working on
3. DECISIONS MADE: Important choices and their rationale
4. TOOL STATE: Scanner results, targets, active campaigns
5. USER CONTEXT: Skill level, learning style, preferences observed

Output format - a single dense paragraph, no bullets, no headers. Pack maximum information into minimum tokens. This will be injected as compressed context into a fresh agent session.`;

const DEFAULT_THRESHOLDS = {
  messageCount: 10,
  tokenEstimate: 4000,
  autoCompress: true,
};

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

const FALLBACK_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-r1:free',
  'nvidia/llama-3.1-nemotron-70b-instruct:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'mistralai/devstral-2512:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'moonshotai/kimi-k2-thinking:free',
  'qwen/qwq-32b:free',
  'microsoft/phi-4:free',
  'google/gemma-2-27b-it:free',
];

async function callWithFallback(
  client: OpenAI,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  preferredModel: string,
  maxTokens: number = 600,
  temperature: number = 0.2,
): Promise<{ content: string; model: string }> {
  const models = [preferredModel, ...FALLBACK_MODELS.filter(m => m !== preferredModel)];
  for (const model of models) {
    try {
      const response = await client.chat.completions.create(withCache({ model, messages, max_tokens: maxTokens, temperature }, 'memory'));
      const content = response.choices[0]?.message?.content || '';
      if (content) return { content, model };
    } catch (err: any) {
      const status = err?.status || err?.code;
      if (status === 403 || status === 429 || status === 503) {
        console.warn(`[memory] Model ${model} unavailable (${status}), trying next...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error('All models unavailable');
}

const router = Router();

router.post('/api/chat/memory/check', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      conversationId,
      sessionToken = 'default',
      model = 'meta-llama/llama-3.3-70b-instruct:free',
      thresholds = DEFAULT_THRESHOLDS,
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const nonSystemMessages = messages.filter((m: any) => m.role !== 'system');
    const totalText = messages.map((m: any) => m.content).join(' ');
    const currentTokens = estimateTokens(totalText);
    const messageCount = nonSystemMessages.length;

    const shouldCompress =
      thresholds.autoCompress &&
      (messageCount >= thresholds.messageCount || currentTokens >= thresholds.tokenEstimate);

    if (!shouldCompress) {
      return res.json({
        action: 'continue',
        metrics: { messageCount, tokenEstimate: currentTokens },
        thresholds,
      });
    }

    const startTime = Date.now();
    const openrouter = getOpenRouterClient();

    const conversationText = nonSystemMessages
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const result = await callWithFallback(
      openrouter,
      [
        { role: 'system', content: COMPRESSION_PROMPT },
        { role: 'user', content: `Compress this conversation:\n\n${conversationText}` },
      ],
      model,
      600,
      0.2,
    );

    const compressed = result.content;
    const usedModel = result.model;
    const compressedTokens = estimateTokens(compressed);
    const latencyMs = Date.now() - startTime;
    const compressionRatio = currentTokens > 0 ? compressedTokens / currentTokens : 1;
    const triggerReason = messageCount >= thresholds.messageCount ? 'message_threshold' : 'token_threshold';

    const capsule = await storage.createStateCapsule({
      sessionToken,
      investigationId: null,
      conversationId: conversationId || null,
      capsuleType: 'auto_compress',
      content: compressed,
      metadata: {
        phase: 'active',
        findingsCount: 0,
        toolsUsed: [],
        tokensEstimate: compressedTokens,
        createdBy: 'auto',
        compressionRatio,
        originalTokens: currentTokens,
        compressedTokens,
        model: usedModel,
        latencyMs,
        messageCount,
        triggerReason,
      },
    });

    await wandbTracker.logCompression({
      originalTokens: currentTokens,
      compressedTokens,
      compressionRatio,
      model: usedModel,
      latencyMs,
      messageCount,
      triggerReason,
      capsuleType: 'auto_compress',
      sessionToken,
      conversationId,
      timestamp: Date.now(),
    });

    const shouldHandoff = currentTokens >= thresholds.tokenEstimate * 1.5;

    res.json({
      action: shouldHandoff ? 'handoff' : 'compressed',
      capsuleId: capsule.id,
      compressed,
      metrics: {
        originalTokens: currentTokens,
        compressedTokens,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        latencyMs,
        messageCount,
        triggerReason,
        tokensSaved: currentTokens - compressedTokens,
      },
    });
  } catch (error) {
    console.error('[memory] Check failed:', error);
    res.status(500).json({ error: 'Memory check failed' });
  }
});

router.post('/api/chat/memory/force-compress', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      conversationId,
      sessionToken = 'default',
      model = 'meta-llama/llama-3.3-70b-instruct:free',
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const startTime = Date.now();
    const openrouter = getOpenRouterClient();

    const conversationText = messages
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const totalTokens = estimateTokens(conversationText);

    const result = await callWithFallback(
      openrouter,
      [
        { role: 'system', content: COMPRESSION_PROMPT },
        { role: 'user', content: `Compress this conversation:\n\n${conversationText}` },
      ],
      model,
      600,
      0.2,
    );

    const compressed = result.content;
    const usedModel = result.model;
    const compressedTokens = estimateTokens(compressed);
    const latencyMs = Date.now() - startTime;
    const compressionRatio = totalTokens > 0 ? compressedTokens / totalTokens : 1;

    const capsule = await storage.createStateCapsule({
      sessionToken,
      investigationId: null,
      conversationId: conversationId || null,
      capsuleType: 'checkpoint',
      content: compressed,
      metadata: {
        phase: 'manual',
        findingsCount: 0,
        toolsUsed: [],
        tokensEstimate: compressedTokens,
        createdBy: 'manual',
        compressionRatio,
        originalTokens: totalTokens,
        compressedTokens,
        model: usedModel,
        latencyMs,
        messageCount: messages.length,
        triggerReason: 'manual',
      },
    });

    await wandbTracker.logCompression({
      originalTokens: totalTokens,
      compressedTokens,
      compressionRatio,
      model: usedModel,
      latencyMs,
      messageCount: messages.length,
      triggerReason: 'manual',
      capsuleType: 'checkpoint',
      sessionToken,
      conversationId,
      timestamp: Date.now(),
    });

    res.json({
      capsuleId: capsule.id,
      compressed,
      metrics: {
        originalTokens: totalTokens,
        compressedTokens,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        latencyMs,
        tokensSaved: totalTokens - compressedTokens,
      },
    });
  } catch (error) {
    console.error('[memory] Force compress failed:', error);
    res.status(500).json({ error: 'Compression failed' });
  }
});

router.post('/api/chat/memory/handoff', async (req: Request, res: Response) => {
  try {
    const {
      capsuleId,
      sessionToken = 'default',
      newConversationTitle,
    } = req.body;

    if (!capsuleId) {
      return res.status(400).json({ error: 'capsuleId required' });
    }

    const capsules = await storage.getStateCapsulesBySession(sessionToken);
    const capsule = capsules.find(c => c.id === capsuleId);

    if (!capsule) {
      return res.status(404).json({ error: 'Capsule not found' });
    }

    const handoffCapsule = await storage.createStateCapsule({
      sessionToken,
      investigationId: capsule.investigationId,
      conversationId: capsule.conversationId,
      capsuleType: 'handoff',
      content: capsule.content,
      metadata: {
        ...capsule.metadata,
        createdBy: 'auto',
        phase: 'handoff',
      },
    });

    res.json({
      handoffCapsuleId: handoffCapsule.id,
      compressedContext: capsule.content,
      suggestedTitle: newConversationTitle || `Handoff from #${capsule.conversationId || 'session'}`,
    });
  } catch (error) {
    console.error('[memory] Handoff failed:', error);
    res.status(500).json({ error: 'Handoff failed' });
  }
});

router.get('/api/chat/memory/capsules', async (req: Request, res: Response) => {
  try {
    const { sessionToken, conversationId, limit } = req.query;

    let capsules;
    if (conversationId) {
      capsules = await storage.getStateCapsulesByConversation(parseInt(conversationId as string));
    } else if (sessionToken) {
      capsules = await storage.getStateCapsulesBySession(sessionToken as string);
    } else {
      capsules = await storage.getAllStateCapsules(parseInt(limit as string) || 50);
    }

    res.json(capsules);
  } catch (error) {
    console.error('[memory] Capsule fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch capsules' });
  }
});

router.get('/api/chat/memory/stats', async (req: Request, res: Response) => {
  try {
    const allCapsules = await storage.getAllStateCapsules(100);
    const wandbStats = wandbTracker.getStats();

    const totalCompressions = allCapsules.length;
    const autoCompressions = allCapsules.filter(c => c.metadata.createdBy === 'auto').length;
    const manualCompressions = allCapsules.filter(c => c.metadata.createdBy === 'manual').length;
    const handoffs = allCapsules.filter(c => c.capsuleType === 'handoff').length;

    const totalTokensSaved = allCapsules.reduce((sum, c) => {
      const orig = c.metadata.originalTokens || 0;
      const comp = c.metadata.compressedTokens || 0;
      return sum + (orig - comp);
    }, 0);

    const avgRatio = totalCompressions > 0
      ? allCapsules.reduce((sum, c) => sum + (c.metadata.compressionRatio || 0), 0) / totalCompressions
      : 0;

    const avgLatency = totalCompressions > 0
      ? allCapsules.reduce((sum, c) => sum + (c.metadata.latencyMs || 0), 0) / totalCompressions
      : 0;

    const byTrigger: Record<string, number> = {};
    allCapsules.forEach(c => {
      const reason = c.metadata.triggerReason || 'unknown';
      byTrigger[reason] = (byTrigger[reason] || 0) + 1;
    });

    const byModel: Record<string, { count: number; avgRatio: number; avgLatency: number }> = {};
    allCapsules.forEach(c => {
      const model = c.metadata.model || 'unknown';
      if (!byModel[model]) byModel[model] = { count: 0, avgRatio: 0, avgLatency: 0 };
      byModel[model].count++;
      byModel[model].avgRatio += c.metadata.compressionRatio || 0;
      byModel[model].avgLatency += c.metadata.latencyMs || 0;
    });
    Object.keys(byModel).forEach(model => {
      const m = byModel[model];
      m.avgRatio = Math.round((m.avgRatio / m.count) * 100) / 100;
      m.avgLatency = Math.round(m.avgLatency / m.count);
    });

    res.json({
      totalCompressions,
      autoCompressions,
      manualCompressions,
      handoffs,
      totalTokensSaved,
      avgCompressionRatio: Math.round(avgRatio * 100) / 100,
      avgLatencyMs: Math.round(avgLatency),
      byTrigger,
      byModel,
      wandb: wandbStats,
      recentCapsules: allCapsules.slice(0, 10).map(c => ({
        id: c.id,
        type: c.capsuleType,
        createdBy: c.metadata.createdBy,
        tokens: c.metadata.compressedTokens,
        ratio: c.metadata.compressionRatio,
        model: c.metadata.model,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('[memory] Stats failed:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.post('/api/chat/memory/quality-check', async (req: Request, res: Response) => {
  try {
    const { capsuleId } = req.body;

    if (!capsuleId) {
      return res.status(400).json({ error: 'capsuleId required' });
    }

    const allCapsules = await storage.getAllStateCapsules(200);
    const capsule = allCapsules.find(c => c.id === capsuleId);

    if (!capsule) {
      return res.status(404).json({ error: 'Capsule not found' });
    }

    const openrouter = getOpenRouterClient();

    const response = await openrouter.chat.completions.create(withCache({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        {
          role: 'system',
          content: `You are a quality auditor for compressed conversation context. Evaluate the compressed capsule below and rate it on these dimensions:

1. COMPLETENESS (1-10): Are key findings, decisions, and tasks preserved?
2. ACCURACY (1-10): Is the information factually correct and not hallucinated?
3. ACTIONABILITY (1-10): Could a new agent continue effectively from this context?
4. DENSITY (1-10): Is information packed efficiently without unnecessary filler?
5. CRITICAL_LOSS (list): What important information appears to be missing?

Output ONLY valid JSON:
{"completeness": N, "accuracy": N, "actionability": N, "density": N, "overall": N, "critical_loss": ["item1", "item2"], "verdict": "pass|warn|fail", "notes": "brief explanation"}`
        },
        {
          role: 'user',
          content: `Compressed capsule (${capsule.metadata.compressedTokens || capsule.metadata.tokensEstimate} tokens, from ${capsule.metadata.originalTokens || '?'} original tokens, ${capsule.metadata.messageCount || '?'} messages):\n\n${capsule.content}`
        }
      ],
      max_tokens: 400,
      temperature: 0.1,
    }, 'memory'));

    logCacheStatus(response, 'memory');
    const raw = response.choices[0]?.message?.content || '';

    let quality;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      quality = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse quality response' };
    } catch {
      quality = { error: 'Failed to parse quality response', raw };
    }

    await wandbTracker.logCompression({
      originalTokens: capsule.metadata.originalTokens || 0,
      compressedTokens: capsule.metadata.compressedTokens || 0,
      compressionRatio: capsule.metadata.compressionRatio || 0,
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      latencyMs: 0,
      messageCount: capsule.metadata.messageCount || 0,
      triggerReason: 'quality_check',
      capsuleType: 'quality_audit',
      sessionToken: capsule.sessionToken,
      conversationId: capsule.conversationId || undefined,
      timestamp: Date.now(),
    });

    res.json({
      capsuleId: capsule.id,
      quality,
      capsuleType: capsule.capsuleType,
      compressionRatio: capsule.metadata.compressionRatio,
      tokens: {
        original: capsule.metadata.originalTokens,
        compressed: capsule.metadata.compressedTokens,
      },
    });
  } catch (error) {
    console.error('[memory] Quality check failed:', error);
    res.status(500).json({ error: 'Quality check failed' });
  }
});

router.post('/api/chat/memory/quality-check-batch', async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.body;
    const capsules = await storage.getAllStateCapsules(limit);

    if (capsules.length === 0) {
      return res.json({ results: [], summary: { avgOverall: 0, passRate: 0, total: 0 } });
    }

    const openrouter = getOpenRouterClient();
    const results: any[] = [];

    for (const capsule of capsules.slice(0, Math.min(limit, 5))) {
      try {
        const response = await openrouter.chat.completions.create(withCache({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            {
              role: 'system',
              content: `Rate this compressed context capsule. Output ONLY JSON: {"completeness": 1-10, "accuracy": 1-10, "actionability": 1-10, "density": 1-10, "overall": 1-10, "verdict": "pass|warn|fail", "notes": "1 sentence"}`
            },
            {
              role: 'user',
              content: `Capsule (${capsule.metadata.compressedTokens || '?'} tokens compressed from ${capsule.metadata.originalTokens || '?'}):\n${capsule.content}`
            }
          ],
          max_tokens: 200,
          temperature: 0.1,
        }, 'memory'));

        logCacheStatus(response, 'memory');
        const raw = response.choices[0]?.message?.content || '';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const quality = jsonMatch ? JSON.parse(jsonMatch[0]) : { overall: 0, verdict: 'fail' };

        results.push({
          capsuleId: capsule.id,
          capsuleType: capsule.capsuleType,
          createdAt: capsule.createdAt,
          compressionRatio: capsule.metadata.compressionRatio,
          quality,
        });
      } catch {
        results.push({ capsuleId: capsule.id, error: 'check failed' });
      }
    }

    const scored = results.filter(r => r.quality?.overall);
    const avgOverall = scored.length > 0
      ? Math.round((scored.reduce((s, r) => s + r.quality.overall, 0) / scored.length) * 10) / 10
      : 0;
    const passRate = scored.length > 0
      ? Math.round((scored.filter(r => r.quality.verdict === 'pass').length / scored.length) * 100)
      : 0;

    res.json({
      results,
      summary: { avgOverall, passRate, total: results.length },
    });
  } catch (error) {
    console.error('[memory] Batch quality check failed:', error);
    res.status(500).json({ error: 'Batch quality check failed' });
  }
});

export default router;
