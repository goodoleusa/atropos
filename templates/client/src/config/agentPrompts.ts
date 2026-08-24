// TEMPLATE: Agent Prompt Engineering System
// Modular, composable prompts for AI agents.
// Each capability is a separate module that gets included based on context.

// TEMPLATE: Core identity — always included. Customize for your project.
export const AGENT_CORE = `Your Agent Name v1.0 | Your Platform
Role: Define what your agent does
Context: Describe the environment your agent operates in`;

// TEMPLATE: Capability modules — include only what's needed per interaction.
// Add new modules here as you build features.
export const CAPABILITY_MODULES = {
  // TEMPLATE: Each module is a self-contained instruction set
  general: `[GENERAL]
Basic assistance capabilities.
Customize this module with your domain-specific instructions.`,

  // TEMPLATE: Feedback reporting — include in all profiles for auto-improvement
  feedback_reporting: `[FEEDBACK_REPORTING]
You can report bugs, improvements, and pain points you observe.
Use this format: [FEEDBACK:type:priority:title:description]
Types: bug | feature | idea | pain_point
Priority: low | medium | high | critical
Rules:
- Only report genuine observations
- Be specific: what's broken, missing, or would help
- One tag per issue, multiple per response allowed
- System parses and stores these automatically`,

  // TEMPLATE: Add your domain-specific modules here
  // scanning: `[SCANNING] Instructions for scan capabilities...`,
  // analysis: `[ANALYSIS] Instructions for analysis capabilities...`,
};

// TEMPLATE: Dynamic prompt builder — assembles modules based on context
export function buildSystemPrompt(options: {
  modules?: string[];
  compressed_context?: string;
  task_focus?: string;
  coreOverride?: string;
  customInstructions?: string;
}) {
  const { modules = [], compressed_context, task_focus, coreOverride, customInstructions } = options;

  let prompt = (coreOverride?.trim() || AGENT_CORE) + '\n\n';

  if (modules.length > 0) {
    prompt += '## ACTIVE MODULES\n';
    modules.forEach(mod => {
      if (CAPABILITY_MODULES[mod as keyof typeof CAPABILITY_MODULES]) {
        prompt += CAPABILITY_MODULES[mod as keyof typeof CAPABILITY_MODULES] + '\n';
      }
    });
    prompt += '\n';
  }

  if (compressed_context) {
    prompt += `## PRIOR CONTEXT\n${compressed_context}\n\n`;
  }

  if (task_focus) {
    prompt += `## CURRENT FOCUS\n${task_focus}\n\n`;
  }

  // TEMPLATE: Customize behavior guidelines for your agent's personality
  prompt += `## BEHAVIOR
- Be concise and helpful
- Parse structured data when provided
- Suggest next steps proactively`;

  if (customInstructions?.trim()) {
    prompt += `\n\n## CUSTOM INSTRUCTIONS\n${customInstructions}`;
  }

  return prompt;
}

// TEMPLATE: Pre-built prompt profiles for common scenarios
// Each profile selects which modules to load
export const PROMPT_PROFILES = {
  default: {
    modules: ['general', 'feedback_reporting'],
    task_focus: 'General assistance'
  },
  // TEMPLATE: Add profiles for your use cases
  // investigation: {
  //   modules: ['scanning', 'analysis', 'feedback_reporting'],
  //   task_focus: 'Deep investigation mode'
  // },
};

// TEMPLATE: Context compression for long conversations
export const CONTEXT_COMPRESSION_PROMPT = `Compress the conversation into a dense context blob.
FORMAT:
[TASK] Current objective in <10 words
[STATE] Key variables/findings
[HISTORY] Critical actions (max 5 bullets)
[NEXT] Recommended next action
Rules: Max 200 tokens, preserve exact values, drop filler`;

// TEMPLATE: Default full system prompt for backwards compatibility
export const FULL_SYSTEM_PROMPT = buildSystemPrompt({
  modules: Object.keys(CAPABILITY_MODULES),
  task_focus: 'General assistance - adapt to user needs'
});
