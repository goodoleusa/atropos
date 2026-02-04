import { Router, Request, Response } from "express";
import { z } from "zod";
import { agentOrchestrator } from "../services/agentOrchestrator";
import { atroposService } from "../services/atropos";
import { 
  SECURITY_AGENTS, 
  exportToCrewAI, 
  exportToLangChain
} from "@shared/agents";
import { rateLimit, validateSessionToken } from "../security";

const router = Router();

const AnalyzeRequestSchema = z.object({
  scanData: z.unknown().refine(val => val !== undefined && val !== null, {
    message: "scanData is required"
  }),
  scanId: z.string().min(1, "scanId is required"),
  category: z.enum(["vulnerability", "vuln", "osint", "intel", "secret_detection", "network", "general"]).default("general"),
  sessionToken: z.string().optional(),
  runSynthesis: z.boolean().default(true),
  agentIds: z.array(z.string()).optional(),
});

const ScanAndAnalyzeRequestSchema = z.object({
  scriptPath: z.string().min(1, "scriptPath is required"),
  target: z.string().min(1, "target is required"),
  sessionToken: z.string().optional(),
  runSynthesis: z.boolean().default(true),
  agentIds: z.array(z.string()).optional(),
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const agents = agentOrchestrator.getAgents();
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const agent = agentOrchestrator.getAgentById(id);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    res.json(agent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/analyze", rateLimit(10, 60000), async (req: Request, res: Response) => {
  try {
    const validation = AnalyzeRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Validation failed",
        details: validation.error.issues 
      });
    }

    const { scanData, scanId, category, sessionToken, runSynthesis, agentIds } = validation.data;

    if (sessionToken && !validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Invalid session token format" });
    }

    const result = await agentOrchestrator.orchestrate(
      scanData,
      scanId,
      category,
      sessionToken,
      { runSynthesis, agentIds }
    );

    res.json(result);
  } catch (error: any) {
    console.error("[agents] Analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/analyze-all", rateLimit(5, 60000), async (req: Request, res: Response) => {
  try {
    const validation = AnalyzeRequestSchema.pick({ 
      scanData: true, 
      scanId: true, 
      sessionToken: true 
    }).safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Validation failed",
        details: validation.error.issues 
      });
    }

    const { scanData, scanId, sessionToken } = validation.data;

    if (sessionToken && !validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Invalid session token format" });
    }

    const result = await agentOrchestrator.runParallelAnalysis(
      scanData,
      scanId,
      sessionToken
    );

    res.json(result);
  } catch (error: any) {
    console.error("[agents] Parallel analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/scan-and-analyze", rateLimit(5, 60000), async (req: Request, res: Response) => {
  try {
    const validation = ScanAndAnalyzeRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Validation failed",
        details: validation.error.issues 
      });
    }

    const { scriptPath, target, sessionToken, runSynthesis, agentIds } = validation.data;

    if (sessionToken && !validateSessionToken(sessionToken)) {
      return res.status(400).json({ error: "Invalid session token format" });
    }

    const scanResult = await atroposService.executeScript({
      scriptPath,
      target,
      sessionToken,
      source: 'chat'
    });

    if (!scanResult.success) {
      return res.status(500).json({ 
        error: scanResult.error,
        scanId: scanResult.scanId
      });
    }

    const category = scriptPath.includes('osint') ? 'osint' :
                     scriptPath.includes('vuln') ? 'vulnerability' :
                     scriptPath.includes('secret') ? 'secret_detection' :
                     scriptPath.includes('intel') ? 'intel' : 'general';

    const analysisResult = await agentOrchestrator.orchestrate(
      scanResult.data || scanResult.output,
      scanResult.scanId!,
      category,
      sessionToken,
      { runSynthesis, agentIds }
    );

    res.json({
      scan: scanResult,
      analysis: analysisResult
    });
  } catch (error: any) {
    console.error("[agents] Scan-and-analyze error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/export/crewai", async (req: Request, res: Response) => {
  try {
    const agentIds = req.query.agents 
      ? (req.query.agents as string).split(',')
      : undefined;
    
    let agents = SECURITY_AGENTS;
    if (agentIds) {
      agents = agents.filter(a => agentIds.includes(a.id));
    }

    const crewaiConfig = exportToCrewAI(agents);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="nexus_crew.json"');
    res.json(crewaiConfig);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/export/langchain", async (req: Request, res: Response) => {
  try {
    const agentIds = req.query.agents 
      ? (req.query.agents as string).split(',')
      : undefined;
    
    let agents = SECURITY_AGENTS;
    if (agentIds) {
      agents = agents.filter(a => agentIds.includes(a.id));
    }

    const langchainConfig = exportToLangChain(agents);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="nexus_langchain.json"');
    res.json(langchainConfig);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/export/python", async (req: Request, res: Response) => {
  try {
    const pythonCode = `"""
NEXUS Security Agents - Python Export
Compatible with CrewAI and LangChain

Usage with CrewAI:
    from crewai import Agent, Task, Crew
    agents = create_crewai_agents()
    
Usage with LangChain:
    from langchain.agents import create_react_agent
    agents = create_langchain_agents()
"""

import os
from typing import List, Dict, Any

# Agent configurations exported from NEXUS
AGENT_CONFIGS = ${JSON.stringify(SECURITY_AGENTS, null, 2)}

def get_openrouter_llm(model: str, temperature: float = 0.7):
    """Get OpenRouter LLM for use with CrewAI or LangChain"""
    from langchain_openai import ChatOpenAI
    
    return ChatOpenAI(
        model=model,
        temperature=temperature,
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=os.environ.get("OPENROUTER_API_KEY"),
    )

def create_crewai_agents():
    """Create CrewAI agents from NEXUS config"""
    from crewai import Agent
    
    agents = []
    for config in AGENT_CONFIGS:
        if config["role"] == "synthesis":
            continue
        
        agent = Agent(
            role=config["name"],
            goal=config.get("crewai", {}).get("goal", config["description"]),
            backstory=config.get("crewai", {}).get("backstory", f"You are {config['name']}"),
            verbose=config.get("crewai", {}).get("verbose", True),
            allow_delegation=config.get("crewai", {}).get("allowDelegation", False),
            llm=get_openrouter_llm(config["model"], config["temperature"])
        )
        agents.append(agent)
    
    return agents

def create_langchain_agents():
    """Create LangChain agents from NEXUS config"""
    from langchain.agents import AgentExecutor, create_react_agent
    from langchain.prompts import PromptTemplate
    
    agents = []
    for config in AGENT_CONFIGS:
        llm = get_openrouter_llm(config["model"], config["temperature"])
        
        prompt = PromptTemplate.from_template(
            config["systemPrompt"] + "\\n\\nUser: {input}\\n\\nThought: {agent_scratchpad}"
        )
        
        agents.append({
            "name": config["name"],
            "llm": llm,
            "prompt": prompt,
            "config": config
        })
    
    return agents

# W&B Integration
def log_to_wandb(run_data: Dict[str, Any], project: str = "nexus-agents"):
    """Log agent run to Weights & Biases"""
    try:
        import wandb
        
        if not wandb.run:
            wandb.init(project=project)
        
        wandb.log(run_data)
    except ImportError:
        print("wandb not installed. Run: pip install wandb")

if __name__ == "__main__":
    print("NEXUS Security Agents loaded.")
    print(f"Available agents: {[a['name'] for a in AGENT_CONFIGS]}")
`;

    res.setHeader('Content-Type', 'text/x-python');
    res.setHeader('Content-Disposition', 'attachment; filename="nexus_agents.py"');
    res.send(pythonCode);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
