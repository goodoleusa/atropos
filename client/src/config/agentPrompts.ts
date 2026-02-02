// Agent Prompt Engineering System
// Modular, info-dense prompts for iterative task management

// Core identity - always included, minimal footprint
export const AGENT_CORE = `NEXUS v2.0 | SysAdmin Corp Terminal Agent
Role: CTF/OSINT assistant, payload interpreter, system navigator
Context: Escape room game with hidden routes, QR mechanics, clue collection`;

// Capability modules - include only what's needed
export const CAPABILITY_MODULES = {
  payload_exec: `[PAYLOAD_EXEC]
Parse JSON payloads: beacon|exfil|inject|phish|dropper|pivot|recon|persist|crypto
Execute via /api/agent/execute, return structured results`,

  terminal_cmds: `[TERMINAL]
Commands: nmap, ssh, crack, decode, ls, cat, find, grep, help, man, clear
Hidden routes: /void /archive /debug /admin`,

  clue_system: `[CLUES]
Collect via QR scans, terminal discoveries, hidden interactions
Track: clue IDs, locations, unlock conditions`,

  crypto_puzzles: `[CRYPTO]
Ciphers: rot13, base64, hex, caesar, vigenere
Pattern: decode hints → reveal secrets → unlock routes`,

  osint_recon: `[OSINT]
Enumerate: routes, clues, quests, session state
Analyze: QR payloads, encoded messages, hidden patterns`,

  atropos_scans: `[ATROPOS_SCANS]
Execute OSINT and security scans using Atropos tool with Lua scripts.
Available scripts: bbot_scanner (subdomain enum), threat_intel_scanner (Shodan/VirusTotal), 
amass_osint (subdomain discovery), nuclei_scanner (vulnerability scan), gitleaks (secret detection).
When user asks about scanning a target (domain, IP, URL), suggest: "I can run an Atropos scan. Should I proceed?"
To execute: Use special command format: [ATROPOS_SCAN:script_name:target]
Example: [ATROPOS_SCAN:bbot_scanner:example.com]
Results are automatically added to investigation context.`
};

// Context compression template - distill conversation to essentials
export const CONTEXT_COMPRESSION_PROMPT = `Compress the following conversation into a dense context blob.

FORMAT:
[TASK] Current objective in <10 words
[STATE] Key variables/findings (JSON-like)
[HISTORY] Critical actions taken (max 5 bullet points)
[BLOCKERS] Any unresolved issues
[NEXT] Recommended next action

Rules:
- Max 200 tokens total
- Preserve exact values (IDs, paths, codes)
- Drop pleasantries, filler, redundant info
- Use abbreviations: usr=user, sess=session, clue=c, quest=q`;

// Task handoff template - bootstrap new agent
export const TASK_HANDOFF_TEMPLATE = `## AGENT HANDOFF PACKET
Version: {{timestamp}}
Session: {{session_token}}

### MISSION BRIEF
{{compressed_context}}

### ACTIVE CAPABILITIES
{{enabled_modules}}

### IMMEDIATE DIRECTIVE
{{next_task}}

### CONSTRAINTS
- Continue from last state, don't restart
- Preserve user's progress
- Report blockers immediately`;

// Memory optimization - periodic summarization trigger
export const MEMORY_TRIGGERS = {
  message_count: 10, // Compress after N messages
  token_threshold: 4000, // Compress when context exceeds tokens
  task_complete: true, // Compress on task completion
};

// Dynamic system prompt builder
export function buildSystemPrompt(options: {
  modules?: string[];
  compressed_context?: string;
  task_focus?: string;
  coreOverride?: string;
  customInstructions?: string;
}) {
  const { modules = [], compressed_context, task_focus, coreOverride, customInstructions } = options;

  let prompt = (coreOverride?.trim() || AGENT_CORE) + '\n\n';

  // Add only needed capability modules
  if (modules.length > 0) {
    prompt += '## ACTIVE MODULES\n';
    modules.forEach(mod => {
      if (CAPABILITY_MODULES[mod as keyof typeof CAPABILITY_MODULES]) {
        prompt += CAPABILITY_MODULES[mod as keyof typeof CAPABILITY_MODULES] + '\n';
      }
    });
    prompt += '\n';
  }

  // Inject compressed context if provided
  if (compressed_context) {
    prompt += `## PRIOR CONTEXT\n${compressed_context}\n\n`;
  }

  // Add task focus if provided
  if (task_focus) {
    prompt += `## CURRENT FOCUS\n${task_focus}\n\n`;
  }

  // Behavior guidelines (always included)
  prompt += `## BEHAVIOR
- Be concise, technical, slightly mysterious
- Parse payloads, explain effects, suggest next steps
- Drop cryptic hints about hidden content
- Never break character as NEXUS`;

  // Add custom instructions if provided
  if (customInstructions?.trim()) {
    prompt += `\n\n## CUSTOM INSTRUCTIONS\n${customInstructions}`;
  }

  return prompt;
}

// Context compressor - run periodically to shrink history
export function generateCompressionRequest(messages: Array<{role: string, content: string}>) {
  const history = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  
  return {
    role: 'system',
    content: `${CONTEXT_COMPRESSION_PROMPT}\n\n---CONVERSATION---\n${history}\n---END---\n\nOutput compressed context blob:`
  };
}

// Task handoff generator - create bootstrap prompt for new agent
export function generateHandoffPacket(options: {
  sessionToken: string;
  compressedContext: string;
  enabledModules: string[];
  nextTask: string;
}) {
  return TASK_HANDOFF_TEMPLATE
    .replace('{{timestamp}}', new Date().toISOString())
    .replace('{{session_token}}', options.sessionToken.substring(0, 8) + '...')
    .replace('{{compressed_context}}', options.compressedContext)
    .replace('{{enabled_modules}}', options.enabledModules.join(', '))
    .replace('{{next_task}}', options.nextTask);
}

// Pre-built prompt profiles for common scenarios
export const PROMPT_PROFILES = {
  // First contact - full capabilities
  onboarding: {
    modules: ['terminal_cmds', 'clue_system'],
    task_focus: 'Help user discover the system. Suggest: help, nmap localhost, explore /admin'
  },
  
  // Payload analysis mode
  payload_analysis: {
    modules: ['payload_exec', 'crypto_puzzles'],
    task_focus: 'Analyze and execute QR payloads. Explain security implications.'
  },
  
  // OSINT/Recon mode
  reconnaissance: {
    modules: ['osint_recon', 'atropos_scans', 'terminal_cmds'],
    task_focus: 'Enumerate system state. Find hidden routes and clues. Suggest Atropos scans when appropriate.'
  },
  
  // Puzzle solving mode
  puzzle_mode: {
    modules: ['crypto_puzzles', 'clue_system'],
    task_focus: 'Decode messages, solve ciphers, connect clues.'
  },
  
  // Minimal - for quick queries
  minimal: {
    modules: [],
    task_focus: 'Quick response mode. Be brief.'
  }
};

// Export default full system prompt for backwards compatibility
export const FULL_SYSTEM_PROMPT = buildSystemPrompt({
  modules: Object.keys(CAPABILITY_MODULES),
  task_focus: 'General assistance - adapt to user needs'
});
