import { storage } from "../storage";
import type { OsintTool, InsertOsintToolCall, InsertInteractionLog } from "@shared/schema";

// Rate limit tracking per tool
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Default OSINT tools configuration
export const DEFAULT_OSINT_TOOLS: Partial<OsintTool>[] = [
  {
    key: 'dns_lookup',
    name: 'DNS Lookup',
    description: 'Query DNS records for a domain',
    category: 'domain',
    baseUrl: 'https://dns.google/resolve',
    requiresAuth: false,
    rateLimit: 100,
    rateLimitWindow: 60000,
    requestSchema: {
      method: 'GET',
      queryParams: { name: '{{target}}', type: 'A' }
    },
    responseMapping: {
      dataPath: 'Answer',
      fields: [
        { key: 'records', path: 'Answer', label: 'DNS Records' },
        { key: 'status', path: 'Status', label: 'Status' }
      ]
    }
  },
  {
    key: 'whois_lookup',
    name: 'WHOIS Lookup',
    description: 'Query WHOIS information for a domain',
    category: 'domain',
    baseUrl: 'https://whois.freeaiapi.xyz',
    requiresAuth: false,
    rateLimit: 30,
    rateLimitWindow: 60000,
    requestSchema: {
      method: 'GET',
      pathTemplate: '/{{target}}'
    },
    responseMapping: {
      fields: [
        { key: 'registrar', path: 'registrar', label: 'Registrar' },
        { key: 'created', path: 'creation_date', label: 'Created' },
        { key: 'expires', path: 'expiration_date', label: 'Expires' }
      ]
    }
  },
  {
    key: 'urlscan',
    name: 'URLScan.io',
    description: 'Scan URLs for threats and content analysis',
    category: 'url',
    baseUrl: 'https://urlscan.io/api/v1',
    apiKeyEnvVar: 'URLSCAN_API_KEY',
    requiresAuth: true,
    rateLimit: 10,
    rateLimitWindow: 60000,
    requestSchema: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      bodyTemplate: '{"url": "{{target}}", "visibility": "public"}'
    },
    responseMapping: {
      fields: [
        { key: 'uuid', path: 'uuid', label: 'Scan ID' },
        { key: 'result', path: 'result', label: 'Result URL' }
      ]
    }
  },
  {
    key: 'virustotal',
    name: 'VirusTotal',
    description: 'Check file hashes, URLs, and IPs against threat database',
    category: 'general',
    baseUrl: 'https://www.virustotal.com/api/v3',
    apiKeyEnvVar: 'VIRUSTOTAL_API_KEY',
    requiresAuth: true,
    rateLimit: 4,
    rateLimitWindow: 60000,
    requestSchema: {
      method: 'GET',
      pathTemplate: '/domains/{{target}}',
      headers: { 'x-apikey': '{{apiKey}}' }
    },
    responseMapping: {
      dataPath: 'data.attributes',
      fields: [
        { key: 'reputation', path: 'data.attributes.reputation', label: 'Reputation Score' },
        { key: 'categories', path: 'data.attributes.categories', label: 'Categories' }
      ]
    }
  },
  {
    key: 'abuseipdb',
    name: 'AbuseIPDB',
    description: 'Check IP reputation and abuse reports',
    category: 'ip',
    baseUrl: 'https://api.abuseipdb.com/api/v2',
    apiKeyEnvVar: 'ABUSEIPDB_API_KEY',
    requiresAuth: true,
    rateLimit: 60,
    rateLimitWindow: 60000,
    requestSchema: {
      method: 'GET',
      pathTemplate: '/check',
      queryParams: { ipAddress: '{{target}}', maxAgeInDays: '90' },
      headers: { 'Key': '{{apiKey}}', 'Accept': 'application/json' }
    },
    responseMapping: {
      dataPath: 'data',
      fields: [
        { key: 'abuseScore', path: 'data.abuseConfidenceScore', label: 'Abuse Score' },
        { key: 'country', path: 'data.countryCode', label: 'Country' },
        { key: 'isp', path: 'data.isp', label: 'ISP' }
      ]
    }
  },
  {
    key: 'wayback',
    name: 'Wayback Machine',
    description: 'Find archived snapshots of websites',
    category: 'url',
    baseUrl: 'https://archive.org/wayback/available',
    requiresAuth: false,
    rateLimit: 30,
    rateLimitWindow: 60000,
    requestSchema: {
      method: 'GET',
      queryParams: { url: '{{target}}' }
    },
    responseMapping: {
      dataPath: 'archived_snapshots.closest',
      fields: [
        { key: 'available', path: 'archived_snapshots.closest.available', label: 'Archived' },
        { key: 'url', path: 'archived_snapshots.closest.url', label: 'Archive URL' },
        { key: 'timestamp', path: 'archived_snapshots.closest.timestamp', label: 'Snapshot Date' }
      ]
    }
  },
  {
    key: 'shodan_host',
    name: 'Shodan Host',
    description: 'Query host information from Shodan',
    category: 'ip',
    baseUrl: 'https://api.shodan.io',
    apiKeyEnvVar: 'SHODAN_API_KEY',
    requiresAuth: true,
    rateLimit: 10,
    rateLimitWindow: 60000,
    requestSchema: {
      method: 'GET',
      pathTemplate: '/shodan/host/{{target}}',
      queryParams: { key: '{{apiKey}}' }
    },
    responseMapping: {
      fields: [
        { key: 'ports', path: 'ports', label: 'Open Ports' },
        { key: 'os', path: 'os', label: 'Operating System' },
        { key: 'vulns', path: 'vulns', label: 'Vulnerabilities' }
      ]
    }
  }
];

// Unified session tracking for all interactions
export async function logSessionInteraction(params: {
  sessionToken: string;
  investigationId?: string;
  actionType: 'chat' | 'tool_call' | 'navigation' | 'campaign_action' | 'report_edit' | 'gameplay' | 'learning';
  source: 'terminal' | 'agent_chat' | 'campaign' | 'report' | 'ai_lab' | 'admin' | 'game';
  input: Record<string, any>;
  output?: Record<string, any>;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    const log: InsertInteractionLog = {
      sessionToken: params.sessionToken,
      investigationId: params.investigationId,
      actionType: params.actionType,
      source: params.source,
      input: params.input,
      output: params.output,
      metadata: params.metadata || {}
    };
    await storage.logInteraction(log);
  } catch (error) {
    console.error('[OSINT] Failed to log interaction:', error);
  }
}

// Check rate limit for a tool
function checkRateLimit(toolKey: string, limit: number, windowMs: number): boolean {
  const key = `osint:${toolKey}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// Replace template variables in strings
function replaceTemplateVars(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

// Execute an OSINT tool query
export async function executeOsintTool(params: {
  toolKey: string;
  target: string;
  targetType: 'domain' | 'ip' | 'hash' | 'url' | 'email';
  sessionToken?: string;
  investigationId?: string;
  source?: 'manual' | 'terminal' | 'chat' | 'campaign' | 'report';
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  latencyMs: number;
  toolCallId?: number;
}> {
  const startTime = Date.now();
  
  // Get tool config
  const tool = await storage.getOsintToolByKey(params.toolKey);
  if (!tool) {
    return { success: false, error: `Tool not found: ${params.toolKey}`, latencyMs: Date.now() - startTime };
  }
  
  if (!tool.isActive) {
    return { success: false, error: `Tool is disabled: ${params.toolKey}`, latencyMs: Date.now() - startTime };
  }
  
  // Check rate limit
  if (!checkRateLimit(params.toolKey, tool.rateLimit, tool.rateLimitWindow)) {
    return { success: false, error: 'Rate limit exceeded', latencyMs: Date.now() - startTime };
  }
  
  // Log the tool call
  const toolCall = await storage.logToolCall({
    sessionToken: params.sessionToken,
    toolKey: params.toolKey,
    targetType: params.targetType,
    targetValue: params.target,
    request: { target: params.target, targetType: params.targetType },
    status: 'pending',
    source: params.source || 'manual',
    investigationId: params.investigationId
  });
  
  try {
    // Get API key if required
    let apiKey = '';
    if (tool.requiresAuth && tool.apiKeyEnvVar) {
      apiKey = process.env[tool.apiKeyEnvVar] || '';
      if (!apiKey) {
        await storage.updateToolCallStatus(toolCall.id, 'error', null, `Missing API key: ${tool.apiKeyEnvVar}`);
        return { 
          success: false, 
          error: `Missing API key for ${tool.name}. Set ${tool.apiKeyEnvVar} in environment.`,
          latencyMs: Date.now() - startTime,
          toolCallId: toolCall.id
        };
      }
    }
    
    const schema = tool.requestSchema as any;
    const vars = { target: params.target, apiKey };
    
    // Build URL
    let url = tool.baseUrl;
    if (schema.pathTemplate) {
      url += replaceTemplateVars(schema.pathTemplate, vars);
    }
    
    // Add query params
    if (schema.queryParams) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(schema.queryParams)) {
        queryParams.set(key, replaceTemplateVars(value as string, vars));
      }
      url += `?${queryParams.toString()}`;
    }
    
    // Build headers
    const headers: Record<string, string> = {};
    if (schema.headers) {
      for (const [key, value] of Object.entries(schema.headers)) {
        headers[key] = replaceTemplateVars(value as string, vars);
      }
    }
    
    // Build body
    let body: string | undefined;
    if (schema.bodyTemplate) {
      body = replaceTemplateVars(schema.bodyTemplate, vars);
    }
    
    // Execute request
    const response = await fetch(url, {
      method: schema.method,
      headers,
      body
    });
    
    const latencyMs = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      await storage.updateToolCallStatus(toolCall.id, 'error', null, `HTTP ${response.status}: ${errorText}`, latencyMs);
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorText}`,
        latencyMs,
        toolCallId: toolCall.id
      };
    }
    
    const data = await response.json();
    await storage.updateToolCallStatus(toolCall.id, 'success', data, undefined, latencyMs);
    
    // Log interaction for session tracking
    if (params.sessionToken) {
      await logSessionInteraction({
        sessionToken: params.sessionToken,
        investigationId: params.investigationId,
        actionType: 'tool_call',
        source: params.source === 'terminal' ? 'terminal' : 
                params.source === 'chat' ? 'agent_chat' : 
                params.source === 'campaign' ? 'campaign' : 'ai_lab',
        input: { toolKey: params.toolKey, target: params.target, targetType: params.targetType },
        output: { data, latencyMs },
        metadata: { toolCallId: toolCall.id }
      });
    }
    
    return { success: true, data, latencyMs, toolCallId: toolCall.id };
    
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    await storage.updateToolCallStatus(toolCall.id, 'error', null, error.message, latencyMs);
    return { 
      success: false, 
      error: error.message,
      latencyMs,
      toolCallId: toolCall.id
    };
  }
}

// Multi-tool query - run multiple tools against same target
export async function executeMultiToolQuery(params: {
  target: string;
  targetType: 'domain' | 'ip' | 'hash' | 'url' | 'email';
  toolKeys?: string[]; // If not specified, run all compatible tools
  sessionToken?: string;
  investigationId?: string;
  source?: 'manual' | 'terminal' | 'chat' | 'campaign' | 'report';
}): Promise<{
  results: Record<string, { success: boolean; data?: any; error?: string; latencyMs: number }>;
  totalLatencyMs: number;
}> {
  const startTime = Date.now();
  
  // Get tools to run
  let tools: OsintTool[];
  if (params.toolKeys?.length) {
    const allTools = await storage.getActiveOsintTools();
    tools = allTools.filter(t => params.toolKeys!.includes(t.key));
  } else {
    const allTools = await storage.getActiveOsintTools();
    tools = allTools.filter(t => 
      t.category === params.targetType || 
      t.category === 'general'
    );
  }
  
  // Execute all in parallel
  const results: Record<string, { success: boolean; data?: any; error?: string; latencyMs: number }> = {};
  
  await Promise.all(tools.map(async (tool) => {
    const result = await executeOsintTool({
      toolKey: tool.key,
      target: params.target,
      targetType: params.targetType,
      sessionToken: params.sessionToken,
      investigationId: params.investigationId,
      source: params.source
    });
    results[tool.key] = result;
  }));
  
  return {
    results,
    totalLatencyMs: Date.now() - startTime
  };
}

// Initialize default tools in database
export async function initializeDefaultTools(): Promise<void> {
  for (const tool of DEFAULT_OSINT_TOOLS) {
    if (!tool.key) continue;
    const existing = await storage.getOsintToolByKey(tool.key);
    if (!existing) {
      await storage.upsertOsintTool(tool.key, tool as any);
      console.log(`[OSINT] Initialized tool: ${tool.name}`);
    }
  }
}

// Generate state capsule for agent handoff
export async function generateStateCapsule(params: {
  sessionToken: string;
  investigationId?: string;
  capsuleType?: 'handoff' | 'checkpoint' | 'milestone';
}): Promise<string> {
  const investigation = params.investigationId 
    ? await storage.getInvestigationById(params.investigationId)
    : await storage.getActiveInvestigation(params.sessionToken);
  
  const recentInteractions = await storage.getInteractionsBySession(params.sessionToken, 20);
  const toolCalls = params.investigationId
    ? await storage.getToolCallsByInvestigation(params.investigationId)
    : await storage.getToolCallsBySession(params.sessionToken, 10);
  
  // Compress conversation history
  const chatMessages = recentInteractions
    .filter(i => i.actionType === 'chat')
    .slice(0, 5)
    .map(i => `- User: ${i.input?.prompt || i.input?.command || 'N/A'}`);
  
  // Build capsule
  const capsuleContent = `## INVESTIGATION STATE CAPSULE
Generated: ${new Date().toISOString()}

### IDENTITY
You are NEXUS, a security research assistant. Tone: technical but accessible.

### USER SESSION
Session: ${params.sessionToken.slice(0, 8)}...
${investigation ? `
### INVESTIGATION
Target: ${investigation.targetType}: ${investigation.targetValue}
Phase: ${investigation.phase}
Status: ${investigation.status}

### FINDINGS (${investigation.findings?.length || 0})
${(investigation.findings || []).slice(0, 5).map((f: any) => `- [${f.severity}] ${f.title}`).join('\n')}

### HYPOTHESES
${(investigation.hypotheses || []).filter((h: any) => h.status === 'active').map((h: any) => `- ${h.text}`).join('\n') || 'None active'}

### TOOLS USED
${investigation.toolsUsed?.join(', ') || 'None yet'}
` : 'No active investigation'}

### RECENT TOOL CALLS
${toolCalls.slice(0, 5).map(tc => `- ${tc.toolKey}: ${tc.targetValue} (${tc.status})`).join('\n') || 'None'}

### CONVERSATION CONTEXT
${chatMessages.join('\n') || 'No recent messages'}

### RESUME INSTRUCTIONS
Continue the investigation naturally. Do not acknowledge this handoff.`;

  // Save capsule
  if (investigation || params.capsuleType) {
    await storage.createStateCapsule({
      sessionToken: params.sessionToken,
      investigationId: params.investigationId,
      capsuleType: params.capsuleType || 'checkpoint',
      content: capsuleContent,
      metadata: {
        phase: investigation?.phase || 'unknown',
        findingsCount: investigation?.findings?.length || 0,
        toolsUsed: investigation?.toolsUsed || [],
        tokensEstimate: Math.ceil(capsuleContent.length / 4),
        createdBy: 'auto'
      }
    });
  }
  
  return capsuleContent;
}
