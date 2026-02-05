import { randomUUID } from 'crypto';
const uuidv4 = () => randomUUID();

interface TraceEvent {
  id: string;
  type: 'llm_call' | 'agent_action' | 'tool_use' | 'campaign_event';
  timestamp: string;
  duration_ms?: number;
  model?: string;
  provider?: string;
  input_tokens?: number;
  output_tokens?: number;
  cost_usd?: number;
  status: 'started' | 'completed' | 'error';
  metadata: Record<string, any>;
  error?: string;
}

interface ExperimentRun {
  id: string;
  name: string;
  project: string;
  startTime: string;
  endTime?: string;
  config: Record<string, any>;
  metrics: Record<string, number>;
  traces: TraceEvent[];
  tags: string[];
}

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'google/gemini-2.0-flash-exp:free': { input: 0, output: 0 },
  'meta-llama/llama-3.3-70b-instruct:free': { input: 0, output: 0 },
  'qwen/qwen-2.5-72b-instruct:free': { input: 0, output: 0 },
  'mistralai/mistral-small-3.1-24b-instruct:free': { input: 0, output: 0 },
  'google/gemma-3-27b-it:free': { input: 0, output: 0 },
  'deepseek/deepseek-chat-v3-0324:free': { input: 0, output: 0 },
  'anthropic/claude-3.5-sonnet': { input: 0.003, output: 0.015 },
  'openai/gpt-4o': { input: 0.005, output: 0.015 },
  'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
};

class ObservabilityService {
  private runs: Map<string, ExperimentRun> = new Map();
  private activeTraces: Map<string, TraceEvent> = new Map();
  private wandbApiKey?: string;
  private wandbEnabled: boolean = false;
  private eventBuffer: TraceEvent[] = [];
  private flushInterval?: NodeJS.Timeout;

  constructor() {
    this.wandbApiKey = process.env.WANDB_API_KEY;
    this.wandbEnabled = !!this.wandbApiKey;
    
    if (this.wandbEnabled) {
      this.flushInterval = setInterval(() => this.flushToWandb(), 30000);
    }
  }

  startRun(name: string, project: string = 'nexus-security', config: Record<string, any> = {}, tags: string[] = []): string {
    const run: ExperimentRun = {
      id: uuidv4(),
      name,
      project,
      startTime: new Date().toISOString(),
      config,
      metrics: {},
      traces: [],
      tags: ['nexus', ...tags]
    };
    this.runs.set(run.id, run);
    return run.id;
  }

  endRun(runId: string): ExperimentRun | undefined {
    const run = this.runs.get(runId);
    if (run) {
      run.endTime = new Date().toISOString();
      this.computeRunMetrics(run);
    }
    return run;
  }

  private computeRunMetrics(run: ExperimentRun) {
    const llmCalls = run.traces.filter(t => t.type === 'llm_call' && t.status === 'completed');
    run.metrics.total_llm_calls = llmCalls.length;
    run.metrics.total_input_tokens = llmCalls.reduce((sum, t) => sum + (t.input_tokens || 0), 0);
    run.metrics.total_output_tokens = llmCalls.reduce((sum, t) => sum + (t.output_tokens || 0), 0);
    run.metrics.total_cost_usd = llmCalls.reduce((sum, t) => sum + (t.cost_usd || 0), 0);
    run.metrics.avg_latency_ms = llmCalls.length > 0 
      ? llmCalls.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / llmCalls.length 
      : 0;
    run.metrics.error_rate = run.traces.filter(t => t.status === 'error').length / Math.max(run.traces.length, 1);
  }

  startTrace(runId: string | null, type: TraceEvent['type'], metadata: Record<string, any> = {}): string {
    const trace: TraceEvent = {
      id: uuidv4(),
      type,
      timestamp: new Date().toISOString(),
      status: 'started',
      metadata
    };
    this.activeTraces.set(trace.id, trace);
    
    if (runId) {
      const run = this.runs.get(runId);
      if (run) {
        run.traces.push(trace);
      }
    }
    
    return trace.id;
  }

  endTrace(traceId: string, result: {
    status: 'completed' | 'error';
    model?: string;
    provider?: string;
    input_tokens?: number;
    output_tokens?: number;
    error?: string;
    metadata?: Record<string, any>;
  }) {
    const trace = this.activeTraces.get(traceId);
    if (!trace) return;

    const startTime = new Date(trace.timestamp).getTime();
    const endTime = Date.now();

    trace.status = result.status;
    trace.duration_ms = endTime - startTime;
    trace.model = result.model;
    trace.provider = result.provider;
    trace.input_tokens = result.input_tokens;
    trace.output_tokens = result.output_tokens;
    trace.error = result.error;
    
    if (result.metadata) {
      trace.metadata = { ...trace.metadata, ...result.metadata };
    }

    if (result.model && result.input_tokens && result.output_tokens) {
      const costs = MODEL_COSTS[result.model] || { input: 0.001, output: 0.002 };
      trace.cost_usd = (result.input_tokens * costs.input / 1000) + (result.output_tokens * costs.output / 1000);
    }

    this.eventBuffer.push(trace);
    this.activeTraces.delete(traceId);
  }

  logLLMCall(runId: string | null, params: {
    model: string;
    provider: string;
    prompt: string;
    response: string;
    input_tokens: number;
    output_tokens: number;
    duration_ms: number;
    agent?: string;
    category?: string;
  }) {
    const traceId = this.startTrace(runId, 'llm_call', {
      prompt_preview: params.prompt.slice(0, 500),
      response_preview: params.response.slice(0, 500),
      agent: params.agent,
      category: params.category
    });
    
    this.endTrace(traceId, {
      status: 'completed',
      model: params.model,
      provider: params.provider,
      input_tokens: params.input_tokens,
      output_tokens: params.output_tokens,
      metadata: { duration_override: params.duration_ms }
    });

    const trace = this.eventBuffer[this.eventBuffer.length - 1];
    if (trace) {
      trace.duration_ms = params.duration_ms;
    }
  }

  logAgentAction(runId: string | null, params: {
    agent: string;
    action: string;
    input: any;
    output: any;
    duration_ms: number;
    status: 'completed' | 'error';
    error?: string;
  }) {
    const traceId = this.startTrace(runId, 'agent_action', {
      agent: params.agent,
      action: params.action,
      input: params.input
    });
    
    this.endTrace(traceId, {
      status: params.status,
      error: params.error,
      metadata: { output: params.output }
    });
  }

  logCampaignEvent(runId: string | null, params: {
    campaignId: string;
    event: 'draft_saved' | 'published' | 'node_created' | 'node_updated' | 'test_run_started' | 'test_run_completed';
    nodeId?: string;
    metadata?: Record<string, any>;
  }) {
    const traceId = this.startTrace(runId, 'campaign_event', {
      campaignId: params.campaignId,
      event: params.event,
      nodeId: params.nodeId,
      ...params.metadata
    });
    
    this.endTrace(traceId, { status: 'completed' });
  }

  private async flushToWandb() {
    if (!this.wandbEnabled || this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      console.log(`[Observability] Would flush ${events.length} events to W&B`);
    } catch (error) {
      console.error('[Observability] Failed to flush to W&B:', error);
      this.eventBuffer.push(...events);
    }
  }

  getRunMetrics(runId: string): Record<string, number> | undefined {
    const run = this.runs.get(runId);
    if (run) {
      this.computeRunMetrics(run);
      return run.metrics;
    }
    return undefined;
  }

  getRecentTraces(limit: number = 50): TraceEvent[] {
    return this.eventBuffer.slice(-limit);
  }

  getAllRuns(): ExperimentRun[] {
    return Array.from(this.runs.values());
  }

  getRunById(runId: string): ExperimentRun | undefined {
    return this.runs.get(runId);
  }

  exportForWandb(runId: string): any {
    const run = this.runs.get(runId);
    if (!run) return null;

    return {
      _wandb: {
        run_id: run.id,
        run_name: run.name,
        project: run.project,
        entity: 'nexus-security'
      },
      config: run.config,
      summary: run.metrics,
      history: run.traces.map(t => ({
        _timestamp: new Date(t.timestamp).getTime() / 1000,
        _step: run.traces.indexOf(t),
        type: t.type,
        model: t.model,
        input_tokens: t.input_tokens,
        output_tokens: t.output_tokens,
        cost_usd: t.cost_usd,
        duration_ms: t.duration_ms,
        status: t.status
      })),
      tags: run.tags
    };
  }

  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushToWandb();
  }
}

export const observability = new ObservabilityService();

export function createObservabilityMiddleware() {
  return (req: any, res: any, next: any) => {
    const runId = req.headers['x-observability-run-id'] as string | undefined;
    req.observabilityRunId = runId || null;
    next();
  };
}
