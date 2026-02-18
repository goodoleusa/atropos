const WANDB_BASE_URL = 'https://api.wandb.ai';

interface CompressionMetrics {
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  model: string;
  latencyMs: number;
  messageCount: number;
  triggerReason: string;
  capsuleType: string;
  sessionToken: string;
  conversationId?: number;
  timestamp: number;
}

interface WandbConfig {
  apiKey: string | undefined;
  project: string;
  entity?: string;
}

class WandbTracker {
  private config: WandbConfig;
  private runId: string | null = null;
  private metricsBuffer: CompressionMetrics[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private enabled: boolean;

  constructor() {
    this.config = {
      apiKey: process.env.WANDB_API_KEY,
      project: 'nexus-context-manager',
      entity: process.env.WANDB_ENTITY,
    };
    this.enabled = !!this.config.apiKey;

    if (this.enabled) {
      console.log('[wandb] W&B tracking enabled for project:', this.config.project);
      this.flushInterval = setInterval(() => this.flush(), 30000);
    } else {
      console.log('[wandb] No WANDB_API_KEY found — metrics stored locally only');
    }
  }

  async logCompression(metrics: CompressionMetrics): Promise<void> {
    this.metricsBuffer.push(metrics);

    if (!this.enabled) return;

    try {
      if (!this.runId) {
        await this.initRun();
      }
      await this.sendMetrics(metrics);
    } catch (error) {
      console.warn('[wandb] Failed to log metrics:', (error as Error).message);
    }
  }

  private async initRun(): Promise<void> {
    if (!this.config.apiKey) return;

    try {
      const response = await fetch(`${WANDB_BASE_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation CreateRun($entity: String!, $project: String!, $displayName: String!) {
            upsertBucket(input: {entityName: $entity, projectName: $project, displayName: $displayName}) {
              bucket { id name displayName }
            }
          }`,
          variables: {
            entity: this.config.entity || 'default',
            project: this.config.project,
            displayName: `nexus-memory-${Date.now()}`,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.runId = data?.data?.upsertBucket?.bucket?.name;
        console.log('[wandb] Run initialized:', this.runId);
      }
    } catch (error) {
      console.warn('[wandb] Run init failed:', (error as Error).message);
    }
  }

  private async sendMetrics(metrics: CompressionMetrics): Promise<void> {
    if (!this.config.apiKey || !this.runId) return;

    try {
      await fetch(`${WANDB_BASE_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation UpsertBucket($entity: String!, $project: String!, $name: String!, $historyStep: JSONString!) {
            upsertBucket(input: {entityName: $entity, projectName: $project, name: $name, historyStep: $historyStep}) {
              bucket { id }
            }
          }`,
          variables: {
            entity: this.config.entity || 'default',
            project: this.config.project,
            name: this.runId,
            historyStep: JSON.stringify({
              compression_ratio: metrics.compressionRatio,
              original_tokens: metrics.originalTokens,
              compressed_tokens: metrics.compressedTokens,
              latency_ms: metrics.latencyMs,
              message_count: metrics.messageCount,
              trigger_reason: metrics.triggerReason,
              model: metrics.model,
              token_savings: metrics.originalTokens - metrics.compressedTokens,
              savings_percent: ((metrics.originalTokens - metrics.compressedTokens) / metrics.originalTokens) * 100,
            }),
          },
        }),
      });
    } catch (error) {
      console.warn('[wandb] Metrics send failed:', (error as Error).message);
    }
  }

  private async flush(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;
    this.metricsBuffer = [];
  }

  getLocalMetrics(): CompressionMetrics[] {
    return [...this.metricsBuffer];
  }

  getStats(): {
    totalCompressions: number;
    avgCompressionRatio: number;
    avgLatencyMs: number;
    totalTokensSaved: number;
    enabled: boolean;
  } {
    const total = this.metricsBuffer.length;
    if (total === 0) {
      return { totalCompressions: 0, avgCompressionRatio: 0, avgLatencyMs: 0, totalTokensSaved: 0, enabled: this.enabled };
    }

    const avgRatio = this.metricsBuffer.reduce((sum, m) => sum + m.compressionRatio, 0) / total;
    const avgLatency = this.metricsBuffer.reduce((sum, m) => sum + m.latencyMs, 0) / total;
    const totalSaved = this.metricsBuffer.reduce((sum, m) => sum + (m.originalTokens - m.compressedTokens), 0);

    return {
      totalCompressions: total,
      avgCompressionRatio: Math.round(avgRatio * 100) / 100,
      avgLatencyMs: Math.round(avgLatency),
      totalTokensSaved: totalSaved,
      enabled: this.enabled,
    };
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

export const wandbTracker = new WandbTracker();
