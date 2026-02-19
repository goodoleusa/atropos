import OpenAI from "openai";
import { nanoid } from "nanoid";
import { 
  SECURITY_AGENTS, 
  getAgentById,
  AgentConfig,
  AgentRun 
} from "@shared/agents";

interface WandBConfig {
  apiKey?: string;
  project?: string;
  entity?: string;
}

interface OrchestrationResult {
  scanId: string;
  agentRuns: AgentRun[];
  synthesis?: AgentRun;
  totalLatencyMs: number;
  totalTokens: number;
}

const CATEGORY_AGENTS: Record<string, string[]> = {
  'vulnerability': ['vuln_analyst', 'threat_intel'],
  'vuln': ['vuln_analyst', 'threat_intel'],
  'osint': ['osint_analyst', 'network_recon'],
  'intel': ['threat_intel', 'osint_analyst'],
  'secret_detection': ['secret_hunter', 'vuln_analyst'],
  'network': ['network_recon', 'vuln_analyst'],
  'general': ['vuln_analyst', 'osint_analyst', 'threat_intel', 'secret_hunter', 'network_recon'],
};

import { getOpenRouterClient as getCachedClient, logCacheStatus, withCache } from "../lib/openrouterClient";

function getOpenRouterClient() {
  return getCachedClient({ referer: "https://nexus.security", title: "NEXUS Multi-Agent System" });
}

export class AgentOrchestrator {
  private openrouter: OpenAI;
  private wandbConfig?: WandBConfig;

  constructor() {
    this.openrouter = getOpenRouterClient();
    
    if (process.env.WANDB_API_KEY) {
      this.wandbConfig = {
        apiKey: process.env.WANDB_API_KEY,
        project: process.env.WANDB_PROJECT || "nexus-agents",
        entity: process.env.WANDB_ENTITY,
      };
    }
  }

  async runAgent(
    agent: AgentConfig,
    scanData: any,
    scanId: string,
    sessionToken?: string
  ): Promise<AgentRun> {
    const runId = `run_${nanoid(12)}`;
    const startTime = Date.now();

    const run: AgentRun = {
      id: runId,
      agentId: agent.id,
      scanId,
      sessionToken,
      input: scanData,
      status: "running",
      startedAt: new Date().toISOString(),
      model: agent.model,
    };

    try {
      const userPrompt = this.formatScanDataForAgent(agent, scanData);
      
      const response = await this.openrouter.chat.completions.create(withCache({
        model: agent.model,
        messages: [
          { role: "system", content: agent.systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: agent.temperature,
        max_tokens: agent.maxTokens,
      }, 'agent-' + agent.id));

      logCacheStatus(response, 'orchestrator');
      const output = response.choices[0]?.message?.content || "";
      const latencyMs = Date.now() - startTime;

      run.output = output;
      run.status = "completed";
      run.completedAt = new Date().toISOString();
      run.latencyMs = latencyMs;
      run.tokenUsage = {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      };

      await this.logToWandB(run, agent);

      return run;
    } catch (error: any) {
      run.status = "failed";
      run.output = error.message || "Agent execution failed";
      run.completedAt = new Date().toISOString();
      run.latencyMs = Date.now() - startTime;
      return run;
    }
  }

  private formatScanDataForAgent(agent: AgentConfig, scanData: any): string {
    const dataStr = typeof scanData === "string" 
      ? scanData 
      : JSON.stringify(scanData, null, 2);
    
    return `Analyze the following scan results:\n\n${dataStr}\n\nProvide your analysis following your output format guidelines.`;
  }

  private getAgentsForCategory(category: string): AgentConfig[] {
    const agentIds = CATEGORY_AGENTS[category] || CATEGORY_AGENTS['general'];
    return agentIds
      .map(id => getAgentById(id))
      .filter((a): a is AgentConfig => a !== undefined);
  }

  async orchestrate(
    scanData: any,
    scanId: string,
    category: string,
    sessionToken?: string,
    options: {
      runSynthesis?: boolean;
      agentIds?: string[];
    } = {}
  ): Promise<OrchestrationResult> {
    const { runSynthesis = true, agentIds } = options;
    const startTime = Date.now();
    const agentRuns: AgentRun[] = [];

    let agentsToRun: AgentConfig[];
    
    if (agentIds && agentIds.length > 0) {
      agentsToRun = agentIds
        .map(id => getAgentById(id))
        .filter((a): a is AgentConfig => a !== undefined && a.role !== "synthesis");
    } else {
      agentsToRun = this.getAgentsForCategory(category);
    }

    const runPromises = agentsToRun.map(agent => 
      this.runAgent(agent, scanData, scanId, sessionToken)
    );
    
    const results = await Promise.all(runPromises);
    agentRuns.push(...results);

    let synthesisRun: AgentRun | undefined;
    
    if (runSynthesis && agentRuns.length > 0) {
      const synthesisAgent = getAgentById("synthesis");
      if (synthesisAgent) {
        const synthesisInput = agentRuns
          .filter(r => r.status === "completed")
          .map(r => ({
            agent: r.agentId,
            analysis: r.output,
          }));
        
        synthesisRun = await this.runAgent(
          synthesisAgent,
          synthesisInput,
          scanId,
          sessionToken
        );
      }
    }

    const totalTokens = agentRuns.reduce(
      (sum, r) => sum + (r.tokenUsage?.total || 0), 
      0
    ) + (synthesisRun?.tokenUsage?.total || 0);

    return {
      scanId,
      agentRuns,
      synthesis: synthesisRun,
      totalLatencyMs: Date.now() - startTime,
      totalTokens,
    };
  }

  async runParallelAnalysis(
    scanData: any,
    scanId: string,
    sessionToken?: string
  ): Promise<OrchestrationResult> {
    const allAgents = SECURITY_AGENTS.filter(a => a.role !== "synthesis");
    
    return this.orchestrate(scanData, scanId, "*", sessionToken, {
      runSynthesis: true,
      agentIds: allAgents.map(a => a.id),
    });
  }

  private async logToWandB(run: AgentRun, agent: AgentConfig): Promise<void> {
    if (!this.wandbConfig?.apiKey) return;

    try {
      const wandbLog = {
        run_id: run.id,
        agent_id: agent.id,
        agent_name: agent.name,
        model: run.model,
        status: run.status,
        latency_ms: run.latencyMs,
        prompt_tokens: run.tokenUsage?.prompt || 0,
        completion_tokens: run.tokenUsage?.completion || 0,
        total_tokens: run.tokenUsage?.total || 0,
        timestamp: run.completedAt || run.startedAt,
        input_length: JSON.stringify(run.input).length,
        output_length: run.output?.length || 0,
      };

      console.log(`[wandb] Logging run ${run.id} for agent ${agent.name}:`, wandbLog);
      
    } catch (error) {
      console.error("[wandb] Failed to log:", error);
    }
  }

  getAgents(): AgentConfig[] {
    return SECURITY_AGENTS;
  }

  getAgentById(id: string): AgentConfig | undefined {
    return getAgentById(id);
  }
}

export const agentOrchestrator = new AgentOrchestrator();
