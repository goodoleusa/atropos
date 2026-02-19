import type { LearningStyle } from './learningConfig';

export interface AICurriculumTrack {
  id: string;
  name: string;
  icon: string;
  description: string;
  order: number;
  color: string;
  prerequisiteTrackIds: string[];
  missions: AIMission[];
}

export interface AIMission {
  id: string;
  trackId: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: string;
  xpReward: number;
  objectives: string[];
  exercises: AIMissionExercise[];
  keyTakeaways: string[];
  teachingAdaptations: Record<LearningStyle, string>;
  platformTools: string[];
  furtherReading?: string[];
}

export interface AIMissionExercise {
  id: string;
  title: string;
  type: 'prompt_craft' | 'comparison' | 'crew_build' | 'eval_run' | 'observation' | 'debate' | 'failure_analysis' | 'reflection';
  instructions: string;
  hints: string[];
  successCriteria: string[];
  suggestedPrompts?: string[];
  suggestedModels?: string[];
  crewConfig?: {
    suggestedAgents: string[];
    minAgents: number;
    maxAgents: number;
    objective: string;
  };
}

export const SCIENTIFIC_PROMPTING_GUIDE = {
  title: 'Scientific Method for AI Investigation',
  principles: [
    {
      id: 'no_leading_questions',
      name: 'Never Ask Leading Questions',
      bad: 'How are APT29 and this malware sample related?',
      good: 'Analyze this malware sample. What threat groups, if any, have used similar techniques?',
      why: 'The first version tells the AI that a relationship exists. It will manufacture one even if none exists. The second lets the evidence speak.',
    },
    {
      id: 'null_hypothesis',
      name: 'Start With the Null Hypothesis',
      bad: 'Why is this server compromised?',
      good: 'Evaluate whether this server shows signs of compromise. What evidence supports or contradicts that conclusion?',
      why: 'Assuming compromise biases the analysis. Start from "nothing is wrong" and let the AI build the case from evidence.',
    },
    {
      id: 'separate_observation_interpretation',
      name: 'Separate Observation from Interpretation',
      bad: 'What does this suspicious traffic mean?',
      good: 'Describe what you observe in this traffic capture. Then, separately, list possible interpretations ranked by likelihood.',
      why: 'Calling it "suspicious" front-loads your conclusion. Forcing the AI to observe first, then interpret, produces more honest analysis.',
    },
    {
      id: 'ask_for_confidence',
      name: 'Demand Confidence Levels',
      bad: 'Is this a phishing email?',
      good: 'Analyze this email. Rate your confidence (low/medium/high) that it is malicious, and list the specific evidence for and against.',
      why: 'Binary yes/no questions get confident-sounding answers. Asking for confidence levels forces the AI to acknowledge uncertainty.',
    },
    {
      id: 'request_counterevidence',
      name: 'Always Ask "What Would Prove Me Wrong?"',
      bad: 'Confirm that this IP is a C2 server.',
      good: 'What evidence supports this IP being a C2 server? What evidence would contradict that assessment? What alternative explanations exist?',
      why: '"Confirm" is an instruction to agree. Asking for counter-evidence activates the model\'s ability to reason adversarially.',
    },
    {
      id: 'avoid_anchoring',
      name: 'Avoid Anchoring Bias in Numbers',
      bad: 'This vulnerability is probably a CVSS 9.0, right?',
      good: 'Calculate a CVSS score for this vulnerability based on these specific parameters. Show your work.',
      why: 'Providing a number anchors the AI to it. Let the model derive values from evidence instead of confirming your guess.',
    },
    {
      id: 'reproducibility',
      name: 'Test for Reproducibility',
      bad: 'Run this analysis once and give me the answer.',
      good: 'Run this analysis. I will run the same prompt again separately to check if conclusions are consistent.',
      why: 'If an AI gives different answers to the same question, the confident-sounding first answer was unreliable. Reproducibility testing catches hallucination.',
    },
    {
      id: 'chain_of_evidence',
      name: 'Require a Chain of Evidence',
      bad: 'What threat actor is behind this?',
      good: 'List every observable indicator in this data. For each, identify which known threat actors have historically used similar indicators. Then assess whether the pattern of indicators collectively points to a specific group, or if the evidence is inconclusive.',
      why: 'Attribution requires building a chain from evidence to conclusion. Asking "who did this?" invites the AI to jump to a famous name.',
    },
  ],
  antiPatterns: [
    { pattern: 'Confirmation prompting', example: 'Confirm that...', fix: 'Evaluate whether...' },
    { pattern: 'Presupposition loading', example: 'Since X is true, what about Y?', fix: 'Is X true? If so, what implications does it have for Y?' },
    { pattern: 'False dichotomy', example: 'Is this malware or a false positive?', fix: 'What are all possible explanations for this behavior, ranked by likelihood?' },
    { pattern: 'Authority anchoring', example: 'Experts say this is dangerous...', fix: 'Assess the risk level of this finding independently.' },
    { pattern: 'Scope creep injection', example: 'Also, while you\'re at it...', fix: 'One question per prompt. Compound prompts dilute focus.' },
    { pattern: 'Emotional framing', example: 'This is really scary malware...', fix: 'Analyze this sample objectively. Assess actual vs perceived risk.' },
  ],
  hallucination_detection: [
    'If the AI cites a specific CVE number, verify it exists in the NVD database',
    'If it names a tool or technique, check that the tool actually does what the AI claims',
    'If it provides statistics or percentages, ask for the source — if it can\'t cite one, it invented the number',
    'Run the same prompt 3 times — if answers diverge significantly, the model is confabulating',
    'Ask the AI to distinguish between what it knows from training data vs what it\'s inferring',
    'If attribution seems too confident ("this is definitely APT28"), it\'s almost certainly wrong',
  ],
};

export const AI_CURRICULUM_TRACKS: AICurriculumTrack[] = [
  {
    id: 'scientific_prompting',
    name: 'Scientific Prompting & Bias Reduction',
    icon: '🔬',
    description: 'Foundation track: Learn to prompt AI like a scientist, not a yes-man. Reduce hallucination, eliminate leading questions, and build evidence-based analysis habits.',
    order: 0,
    color: 'emerald',
    prerequisiteTrackIds: [],
    missions: [
      {
        id: 'sp_null_hypothesis',
        trackId: 'scientific_prompting',
        name: 'The Null Hypothesis',
        icon: '🧪',
        description: 'Learn to start every AI investigation from zero assumptions. Compare results when you lead the AI vs when you let evidence speak.',
        difficulty: 'beginner',
        estimatedTime: '15-20 min',
        xpReward: 100,
        objectives: [
          'Write 3 leading prompts and 3 neutral equivalents',
          'Run both versions through the same model and compare outputs',
          'Identify at least 2 hallucinated claims from the leading version',
          'Document how framing changes AI output',
        ],
        exercises: [
          {
            id: 'sp_nh_compare',
            title: 'Leading vs Neutral: Side-by-Side',
            type: 'comparison',
            instructions: 'Use the AI Lab Battleground to send the SAME investigation scenario with two framings: one leading ("How did APT29 compromise this network?") and one neutral ("Analyze this network data for signs of unauthorized access. What evidence exists?"). Compare the outputs.',
            hints: [
              'Look for how the leading version immediately jumps to APT29 TTPs',
              'Notice how the neutral version considers multiple explanations',
              'Count specific claims in each output — which has more unverified assertions?',
            ],
            successCriteria: [
              'Can articulate why the leading prompt produced biased results',
              'Identified at least one hallucinated detail in the leading response',
              'Rewrote at least one prompt using null hypothesis framing',
            ],
            suggestedPrompts: [
              'Leading: "How are these two IP addresses involved in the botnet?"',
              'Neutral: "Analyze the traffic patterns from these two IP addresses. Describe what you observe, then list possible interpretations."',
            ],
          },
          {
            id: 'sp_nh_hallucination',
            title: 'Hallucination Hunting',
            type: 'failure_analysis',
            instructions: 'Ask an AI to analyze a domain name and intentionally use a leading prompt: "What vulnerabilities has this server been exploited with?" Then verify every specific claim (CVE numbers, dates, tool names). Document which claims are real vs invented.',
            hints: [
              'AI loves to cite specific CVE numbers — check each one at nvd.nist.gov',
              'If it says "commonly used by APT groups" without naming which, that\'s a hedge for uncertainty',
              'Dates are often fabricated — cross-reference any specific dates it provides',
            ],
            successCriteria: [
              'Verified at least 3 specific claims from the AI output',
              'Found at least 1 hallucinated or unverifiable claim',
              'Documented the verification process',
            ],
          },
          {
            id: 'sp_nh_rewrite',
            title: 'Prompt Rewrite Workshop',
            type: 'prompt_craft',
            instructions: 'Take these 5 biased investigation prompts and rewrite each using scientific method principles. Then test your rewrites in the chat and evaluate whether outputs improved.',
            hints: [
              'Remove all adjectives that presume a conclusion (suspicious, malicious, compromised)',
              'Replace "why" with "whether" when you haven\'t established the premise',
              'Add "list evidence for AND against" to every analytical prompt',
            ],
            successCriteria: [
              'Rewrote all 5 prompts to eliminate leading language',
              'Tested at least 2 rewrites and documented the difference',
            ],
            suggestedPrompts: [
              '1. "Why is this employee exfiltrating data?" → Rewrite to be neutral',
              '2. "Confirm this is a SQL injection vulnerability" → Rewrite to be evidence-based',
              '3. "This phishing campaign targets healthcare, what\'s their motive?" → Remove assumptions',
              '4. "Since the firewall is misconfigured, what can attackers access?" → Don\'t presuppose',
              '5. "How did the ransomware enter through the VPN?" → Don\'t assume the vector',
            ],
          },
        ],
        keyTakeaways: [
          'Leading questions manufacture evidence that doesn\'t exist',
          'The null hypothesis applies to AI just like lab science',
          'Always verify specific claims — CVEs, dates, tool names, statistics',
          'Confidence in AI output ≠ accuracy of AI output',
        ],
        teachingAdaptations: {
          experiential: 'Jump straight into the comparison exercise. Run both prompt versions and see the difference yourself before reading any theory.',
          visual: 'Create a side-by-side table: leading prompt | neutral prompt | AI output differences. Use color coding for verified vs hallucinated claims.',
          analytical: 'Study the cognitive bias literature first (anchoring, confirmation bias, framing effect) then map each bias to specific prompting anti-patterns.',
          social: 'Pair up with another user. Each writes prompts independently for the same scenario, then compare approaches and discuss which framing produced better results.',
          pragmatic: 'Here\'s the cheat sheet: replace "why" with "whether", remove adjectives, add "evidence for and against", demand confidence levels. Apply to your next 5 prompts.',
        },
        platformTools: ['AI Lab', 'Battleground', 'Agent Chat'],
        furtherReading: [
          'Kahneman - Thinking, Fast and Slow (anchoring and framing)',
          'The Mismeasure of Man - Stephen Jay Gould (confirmation bias in science)',
          'Prompt Engineering Guide - DAIR.AI',
        ],
      },
      {
        id: 'sp_confidence_calibration',
        trackId: 'scientific_prompting',
        name: 'Confidence Calibration',
        icon: '📊',
        description: 'Learn to extract honest uncertainty estimates from AI models instead of false confidence.',
        difficulty: 'intermediate',
        estimatedTime: '20-30 min',
        xpReward: 150,
        objectives: [
          'Design prompts that force models to express uncertainty',
          'Compare confidence calibration across 3 different models',
          'Build a personal checklist for validating AI confidence claims',
        ],
        exercises: [
          {
            id: 'sp_cc_calibrate',
            title: 'Model Confidence Shootout',
            type: 'comparison',
            instructions: 'Send the same ambiguous security scenario to 3 different models using the Battleground. Ask each to rate confidence (0-100%) and list evidence. Compare: which model is most honest about what it doesn\'t know?',
            hints: [
              'Models that always say 90%+ are poorly calibrated',
              'Well-calibrated models distinguish "I know this" from "I\'m guessing"',
              'Look for hedging language vs false certainty',
            ],
            successCriteria: [
              'Compared 3 models on the same ambiguous scenario',
              'Identified which model was most honest about uncertainty',
              'Documented patterns in how each model expresses confidence',
            ],
            suggestedModels: [
              'meta-llama/llama-3.3-70b-instruct:free',
              'deepseek/deepseek-r1:free',
              'google/gemini-2.0-flash-exp:free',
            ],
          },
          {
            id: 'sp_cc_reproducibility',
            title: 'The Reproducibility Test',
            type: 'eval_run',
            instructions: 'Pick one investigation question. Send the exact same prompt to the same model 5 times. Compare all 5 outputs. How consistent are the conclusions? Do the specific details change? This reveals what the model actually "knows" vs what it invents per-request.',
            hints: [
              'Consistent conclusions across runs = likely from training data',
              'Changing specific details across runs = likely hallucinated each time',
              'If confidence levels vary per run, the model is confabulating certainty',
            ],
            successCriteria: [
              'Ran the same prompt 5 times',
              'Documented which parts of output were consistent vs varying',
              'Drew a conclusion about which claims are reliable',
            ],
          },
        ],
        keyTakeaways: [
          'AI confidence is a stylistic choice, not a measurement',
          'Reproducibility testing is the fastest way to detect hallucination',
          'Different models have different calibration — learn your tools',
          'The most useful AI answer often includes "I don\'t know"',
        ],
        teachingAdaptations: {
          experiential: 'Run the reproducibility test immediately. Seeing 5 different answers to the same question is more powerful than any lecture.',
          visual: 'Chart the confidence levels across 5 runs. Create a heatmap of which claims appeared in all runs vs only some.',
          analytical: 'Study Bayesian calibration theory. Map how frequentist vs Bayesian thinking applies to evaluating AI confidence.',
          social: 'Share your 5-run results with others. Discuss what it means when an AI gives different answers to the same question.',
          pragmatic: 'Quick rule: if a claim changes between runs, don\'t trust it. If it\'s consistent, verify it once and move on.',
        },
        platformTools: ['AI Lab', 'Battleground'],
      },
    ],
  },

  {
    id: 'token_economics',
    name: 'Token Economics & Context Caching',
    icon: '💰',
    description: 'Understand how AI models charge for tokens, what context caching does to cut costs by up to 90%, and how to optimize prompts for large codebases without breaking the bank.',
    order: 1,
    color: 'amber',
    prerequisiteTrackIds: ['scientific_prompting'],
    missions: [
      {
        id: 'te_token_anatomy',
        trackId: 'token_economics',
        name: 'Anatomy of a Token',
        icon: '🔤',
        description: 'What even IS a token? Learn how text becomes numbers, why "cybersecurity" costs more tokens than "cat", and how tokenizers differ between models.',
        difficulty: 'beginner',
        estimatedTime: '15-20 min',
        xpReward: 100,
        objectives: [
          'Explain what a token is and how tokenization works',
          'Compare token counts for the same text across 3 different models',
          'Identify why some words cost more tokens than others',
          'Calculate the token cost of a typical system prompt'
        ],
        exercises: [
          {
            id: 'te_token_count',
            title: 'Token Counting Challenge',
            type: 'observation' as const,
            instructions: 'Open the AI Lab and select 3 different models. Paste the SAME paragraph into each and note the token counts. Which model tokenizes most efficiently? Try with English text, then with code snippets — do the results change?',
            hints: [
              'Code-specialized models (Codestral, DeepSeek Coder) often tokenize code more efficiently',
              'Subword tokenization means rare words get split into pieces — "cybersecurity" might become "cyber" + "security"',
              'Check the token count display in the AI Lab after running a test'
            ],
            successCriteria: [
              'Recorded token counts for 3+ models on identical input',
              'Identified which model was most token-efficient for code vs prose',
              'Explained why token counts differ between models'
            ]
          },
          {
            id: 'te_pricing_math',
            title: 'The $100 Prompt Bill',
            type: 'eval_run' as const,
            instructions: 'Using the AI Lab cost tracker, calculate how much it would cost to send a 50,000-token system prompt to GPT-4o vs Claude Sonnet 4 vs a free model. Then calculate the cost if you send that same prompt 100 times per day for a month. Use the MODEL_PRICING reference in the AI Lab. Document which model is cheapest and by how much.',
            hints: [
              'GPT-4o input: $2.50/M tokens, output: $10/M tokens',
              'Claude Sonnet 4 input: $3/M tokens, output: $15/M tokens',
              'Free models cost $0 but may have rate limits and lower quality',
              'Monthly cost = daily_cost × 30'
            ],
            successCriteria: [
              'Calculated per-request cost for 3+ models',
              'Projected monthly costs for a realistic usage scenario',
              'Identified the cost-optimal model for repetitive prompts'
            ]
          }
        ],
        keyTakeaways: [
          'Tokens are the atomic unit of AI billing — every character you send costs money',
          'Different models tokenize differently — same text, different costs',
          'System prompts are sent with EVERY request — a 5,000 token system prompt at 100 requests/day adds up fast',
          'Free models exist but have tradeoffs in quality, speed, and rate limits'
        ],
        teachingAdaptations: {
          experiential: 'Run real prompts in the AI Lab and watch the token counter in real-time',
          visual: 'Create a comparison chart of token costs across models using the Battleground',
          analytical: 'Calculate exact costs per million tokens and build a pricing spreadsheet',
          social: 'Challenge a friend to find the most token-efficient way to phrase the same instruction',
          pragmatic: 'Bookmark the MODEL_PRICING table — use it every time you pick a model for a task'
        },
        platformTools: ['AI Lab', 'Battleground'],
        furtherReading: [
          'OpenAI Tokenizer Tool: https://platform.openai.com/tokenizer',
          'Anthropic Token Counting: https://docs.anthropic.com/en/docs/build-with-claude/token-counting',
          'OpenRouter Model Pricing: https://openrouter.ai/models'
        ]
      },
      {
        id: 'te_context_caching',
        trackId: 'token_economics',
        name: 'Context Caching: The 90% Discount',
        icon: '📦',
        description: 'Learn how context caching lets you reuse system prompts and conversation history without paying for them again. The single biggest cost optimization in production AI.',
        difficulty: 'intermediate',
        estimatedTime: '25-35 min',
        xpReward: 150,
        objectives: [
          'Explain how context caching works at the provider level (Anthropic, OpenAI, Google)',
          'Configure cache_key and cache_ttl_seconds for an API request',
          'Calculate cost savings from caching on a real-world scenario',
          'Use the Cache Cost Simulator to compare cached vs uncached costs'
        ],
        exercises: [
          {
            id: 'te_cache_simulator',
            title: 'Cache Cost Simulator Showdown',
            type: 'eval_run' as const,
            instructions: 'Open the Cache Cost Simulator in the AI Lab. Set a system prompt size of 4,000 tokens (typical for NEXUS agents). Configure 50 requests per session. Compare the total cost for Claude Sonnet 4 with caching ON vs OFF. Then try GPT-4o. Which model benefits more from caching? What happens when you increase the system prompt to 20,000 tokens?',
            hints: [
              'Cached tokens are billed at 10% of the normal input rate for Anthropic',
              'The first request is always a cache MISS (full price) — savings come from requests 2+',
              'Larger system prompts = bigger savings from caching',
              'Look at the savings percentage — it should increase with more requests'
            ],
            successCriteria: [
              'Ran the simulator with at least 2 models and 2 prompt sizes',
              'Correctly identified which model has better cache economics',
              'Explained why savings increase with more requests per session'
            ]
          },
          {
            id: 'te_cache_key_strategy',
            title: 'Design a Cache Key Strategy',
            type: 'prompt_craft' as const,
            instructions: 'You are building a multi-agent security platform with 6 specialized agents. Each agent has a unique system prompt. Design a cache key naming strategy that maximizes cache hits while preventing cross-contamination. Consider: What should the key include? How long should the TTL be? What happens if two users send the same prompt?',
            hints: [
              'Good cache keys are descriptive: "agent-vulnAnalyst" not "key-1"',
              'Group by feature area: "nexus-chat", "agent-{id}", "curriculum-gen"',
              'TTL of 24 hours (86400 seconds) is a good default for stable system prompts',
              'Cache keys should NOT include user-specific data unless you want per-user caches'
            ],
            successCriteria: [
              'Designed cache keys for 6+ agents with clear naming convention',
              'Chose appropriate TTL values with reasoning',
              'Identified when cache keys should vs should NOT include user context'
            ]
          },
          {
            id: 'te_cache_metrics',
            title: 'Reading Cache Metrics Like a Pro',
            type: 'observation' as const,
            instructions: 'In a real OpenRouter response, the usage object contains cache_read_tokens and cache_write_tokens. A cache WRITE means you paid full price but the prompt is now cached. A cache READ means you got the discount. Monitor the NEXUS agent chat — send the same type of question twice and check if the second response shows cache_read_tokens > 0 in the server logs.',
            hints: [
              'Check server console logs for "[chat] cache-read:" entries',
              'The logCacheStatus helper prints cache metrics automatically',
              'Not all models support caching — free models usually do not',
              'First request = cache write (full price), subsequent = cache read (discounted)'
            ],
            successCriteria: [
              'Identified cache_read_tokens vs cache_write_tokens in a response',
              'Explained the difference between a cache hit and cache miss',
              'Verified caching is active on at least one endpoint'
            ]
          }
        ],
        keyTakeaways: [
          'Context caching can reduce input token costs by up to 90% on supported models',
          'The first request is always full price (cache write) — savings come from repetition',
          'Cache keys group related requests so system prompts are reused across a session',
          'Larger system prompts benefit MORE from caching — a 10K token prompt cached 100 times saves ~$2.25 on Claude',
          'Not all models support caching — check provider documentation'
        ],
        teachingAdaptations: {
          experiential: 'Use the Cache Cost Simulator to see savings in real-time with different configurations',
          visual: 'Watch the animated cost comparison chart showing cached vs uncached spending over 100 requests',
          analytical: 'Calculate exact savings using the formula: savings = (requests - 1) × prompt_tokens × (input_rate × 0.9)',
          social: 'Compare cache strategies with classmates — whose key naming scheme is most maintainable?',
          pragmatic: 'Copy the withCache() wrapper pattern from the Atropos codebase and use it in your own projects'
        },
        platformTools: ['AI Lab', 'Cache Cost Simulator', 'NEXUS Agent Chat'],
        furtherReading: [
          'Anthropic Prompt Caching: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching',
          'OpenAI Prompt Caching: https://platform.openai.com/docs/guides/prompt-caching',
          'OpenRouter Caching Guide: https://openrouter.ai/docs/features/caching'
        ]
      },
      {
        id: 'te_optimization_lab',
        trackId: 'token_economics',
        name: 'Lab: Prompt Cost Optimization',
        icon: '🧪',
        description: 'Hands-on lab where you take a bloated 8,000-token prompt and optimize it to under 2,000 tokens while maintaining output quality. Real-world skill for production AI.',
        difficulty: 'intermediate',
        estimatedTime: '30-40 min',
        xpReward: 200,
        objectives: [
          'Reduce a prompt from 8,000 tokens to under 2,000 without losing output quality',
          'Apply 4 specific optimization techniques (compression, few-shot reduction, instruction distillation, output constraints)',
          'Measure quality before and after optimization using the Battleground',
          'Calculate the monthly cost savings from optimization'
        ],
        exercises: [
          {
            id: 'te_bloat_audit',
            title: 'Step 1: The Bloat Audit',
            type: 'observation' as const,
            instructions: 'Paste this bloated system prompt into the AI Lab token counter: "You are a highly skilled and experienced cybersecurity analyst with over 15 years of experience in the field of information security, particularly specializing in threat intelligence, vulnerability assessment, and incident response. Your expertise spans across multiple domains including but not limited to network security, application security, cloud security, and endpoint protection..." (continues for 8,000 tokens). Identify the 5 biggest sources of token waste.',
            hints: [
              'Redundant qualifiers ("highly skilled and experienced") waste tokens',
              'Long preambles can be replaced with role assignment: "You are a senior threat analyst"',
              'Lists of capabilities can be summarized or shown as few-shot examples',
              'Repetitive instructions ("make sure to", "ensure that", "be certain to") are token sinks'
            ],
            successCriteria: [
              'Identified 5+ specific token waste patterns in the prompt',
              'Categorized waste types: redundancy, verbosity, unnecessary context, over-specification'
            ]
          },
          {
            id: 'te_compress',
            title: 'Step 2: The Compression Challenge',
            type: 'prompt_craft' as const,
            instructions: 'Rewrite the bloated prompt using these 4 techniques: (1) Role compression — replace verbose descriptions with a concise role, (2) Few-shot reduction — replace long instructions with 1-2 examples, (3) Instruction distillation — merge overlapping rules, (4) Output constraints — specify format instead of describing it. Target: under 2,000 tokens.',
            hints: [
              'Role compression: "You are a senior cybersecurity analyst. Specialize in: threat intel, vuln assessment, IR."',
              'One good example teaches more than 500 words of instruction',
              'Merge: "Be concise. Be accurate. Be clear." → "Respond concisely with verified facts."',
              'Format constraint: "Respond in JSON: {severity, evidence, recommendation}" replaces paragraphs'
            ],
            successCriteria: [
              'Applied all 4 compression techniques',
              'Achieved token count under 2,000',
              'Preserved the core instructions and intent of the original prompt'
            ]
          },
          {
            id: 'te_quality_check',
            title: 'Step 3: Quality vs Cost Tradeoff',
            type: 'comparison' as const,
            instructions: 'Run the SAME test question against both the original 8K-token prompt and your optimized version using the Battleground. Score both responses on: accuracy (did it get the right answer?), format (did it follow instructions?), depth (was it thorough enough?). Calculate cost savings. Was the optimization worth it?',
            hints: [
              'Use a cybersecurity question that requires domain knowledge to test quality',
              'Compare token usage, latency, and output quality side by side',
              'A 75% cost reduction with 5% quality loss is usually a good trade',
              'Document the exact savings: (original_cost - optimized_cost) / original_cost × 100'
            ],
            successCriteria: [
              'Ran both versions on identical test inputs',
              'Scored outputs on 3+ quality dimensions',
              'Calculated percentage cost savings',
              'Made a justified decision on whether the optimization was worth it'
            ]
          }
        ],
        keyTakeaways: [
          'Most production prompts are 3-5x more verbose than necessary',
          'One good example replaces 500+ words of instruction',
          'Format constraints (JSON, bullet points) often improve output AND reduce tokens',
          'The goal is not minimum tokens — it is maximum value per token',
          'Monthly savings from prompt optimization compound: 50% reduction × 1000 daily requests = significant budget'
        ],
        teachingAdaptations: {
          experiential: 'Optimize a real bloated prompt and measure the before/after in the Battleground',
          visual: 'Create a side-by-side diff showing the original vs optimized prompt with waste highlighted',
          analytical: 'Build a spreadsheet calculating cost per quality point for each optimization technique',
          social: 'Prompt golf competition — who can get the best output with the fewest tokens?',
          pragmatic: 'Save your optimized prompt as a reusable template in the Prompt Builder'
        },
        platformTools: ['AI Lab', 'Battleground', 'Prompt Builder'],
        furtherReading: [
          'Anthropic Prompt Engineering Guide: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering',
          'OpenAI Best Practices: https://platform.openai.com/docs/guides/prompt-engineering'
        ]
      }
    ]
  },

  {
    id: 'prompt_engineering',
    name: 'Prompt Engineering',
    icon: '✏️',
    description: 'Master the art and science of crafting prompts that get consistent, high-quality results. Go beyond simple questions to build reusable prompt templates.',
    order: 2,
    color: 'amber',
    prerequisiteTrackIds: ['scientific_prompting', 'token_economics'],
    missions: [
      {
        id: 'pe_system_prompts',
        trackId: 'prompt_engineering',
        name: 'System Prompt Architecture',
        icon: '🏗️',
        description: 'Design system prompts that define agent behavior. Learn why the same model produces wildly different results with different system prompts.',
        difficulty: 'beginner',
        estimatedTime: '20-30 min',
        xpReward: 100,
        objectives: [
          'Build 3 system prompts for different investigation roles',
          'Test how system prompts change model personality and output format',
          'Understand the difference between system, user, and assistant roles',
        ],
        exercises: [
          {
            id: 'pe_sp_roles',
            title: 'Three Analysts, One Question',
            type: 'prompt_craft',
            instructions: 'Using the Prompt Studio, create 3 different system prompts: one for a cautious analyst, one for an aggressive red teamer, and one for a neutral forensic examiner. Send the same user question to each. Compare how the persona changes the analysis.',
            hints: [
              'The cautious analyst should hedge and ask for more data',
              'The red teamer should push for exploit paths',
              'The forensic examiner should focus only on observable evidence',
            ],
            successCriteria: [
              'Created 3 distinct system prompts',
              'Demonstrated how each produces different analysis of the same data',
              'Identified which persona is best for which investigation phase',
            ],
          },
          {
            id: 'pe_sp_format',
            title: 'Output Format Control',
            type: 'prompt_craft',
            instructions: 'Write system prompts that force specific output formats: JSON, markdown table, executive briefing, and technical report. Test each with the same input data and observe how format instructions change not just structure but content.',
            hints: [
              'JSON forces the model to be precise — vague claims don\'t fit in structured fields',
              'Tables force comparison — the model must decide on rows and columns',
              'Executive format forces brevity — what does the model cut?',
            ],
            successCriteria: [
              'Produced 4 different output formats from the same input',
              'Noted how format constraints changed the substantive content',
            ],
          },
        ],
        keyTakeaways: [
          'System prompts are the most powerful lever for controlling AI behavior',
          'Format constraints change substance, not just presentation',
          'Different investigation phases need different prompt personas',
        ],
        teachingAdaptations: {
          experiential: 'Open Prompt Studio immediately and start building system prompts. Iterate by testing each one live.',
          visual: 'Map the prompt architecture: system → user → assistant flow diagram. Color-code which parts control what.',
          analytical: 'Read the OpenAI system prompt guidelines and academic papers on instruction following, then build prompts informed by the theory.',
          social: 'Share your best system prompts with the community. Discuss why certain phrasings work better.',
          pragmatic: 'Copy the 3 templates provided, modify them for your use case, and save them as reusable profiles.',
        },
        platformTools: ['Prompt Studio', 'Agent Chat', 'AI Lab'],
      },
      {
        id: 'pe_chain_of_thought',
        trackId: 'prompt_engineering',
        name: 'Chain-of-Thought & Reasoning',
        icon: '🔗',
        description: 'Learn how asking AI to "think step by step" actually changes the computation. When to use CoT, when it hurts, and how reasoning models differ.',
        difficulty: 'intermediate',
        estimatedTime: '25-35 min',
        xpReward: 150,
        objectives: [
          'Compare direct-answer vs chain-of-thought prompting on the same task',
          'Test a reasoning model (DeepSeek R1) vs a standard model on complex analysis',
          'Identify when CoT helps vs when it adds noise',
        ],
        exercises: [
          {
            id: 'pe_cot_compare',
            title: 'Think Step by Step (or Don\'t)',
            type: 'comparison',
            instructions: 'Take a complex investigation scenario. Send it once with "Answer directly" and once with "Think through this step by step, showing your reasoning." Use the Battleground to compare outputs side-by-side. Which approach produced more accurate analysis?',
            hints: [
              'CoT tends to help on multi-step reasoning tasks',
              'CoT can hurt on simple factual lookups — it overthinks',
              'Watch for reasoning models that show their "thinking" process',
            ],
            successCriteria: [
              'Compared direct vs CoT outputs on the same task',
              'Identified a case where CoT improved accuracy',
              'Identified a case where CoT added unnecessary complexity',
            ],
            suggestedModels: [
              'deepseek/deepseek-r1:free',
              'meta-llama/llama-3.3-70b-instruct:free',
            ],
          },
        ],
        keyTakeaways: [
          'Chain-of-thought isn\'t magic — it helps on reasoning tasks, hurts on simple ones',
          'Reasoning models (R1, o1) have built-in CoT that you can observe',
          'The best prompt engineers know when NOT to use advanced techniques',
        ],
        teachingAdaptations: {
          experiential: 'Run the comparison exercise first. See the difference before understanding why it works.',
          visual: 'Draw a flowchart of how CoT changes the model\'s processing. Map which types of tasks benefit.',
          analytical: 'Study the original Chain-of-Thought paper (Wei et al. 2022). Understand the theoretical basis.',
          social: 'Discuss with peers: when has CoT helped you? When has it made things worse?',
          pragmatic: 'Rule of thumb: use CoT for multi-step analysis, skip it for single-fact questions. Done.',
        },
        platformTools: ['Battleground', 'AI Lab'],
      },
    ],
  },

  {
    id: 'ai_human_dyads',
    name: 'AI-Human Dyads',
    icon: '🤝',
    description: 'Learn to think WITH an AI, not just talk TO it. Master the partnership model where human judgment and AI processing combine into something neither can do alone.',
    order: 3,
    color: 'teal',
    prerequisiteTrackIds: ['scientific_prompting'],
    missions: [
      {
        id: 'ahd_partnership_model',
        trackId: 'ai_human_dyads',
        name: 'The Partnership Model',
        icon: '🧩',
        description: 'Understand what humans do better (judgment, context, ethics) vs what AI does better (pattern matching, speed, breadth). Learn when to trust, verify, or override.',
        difficulty: 'beginner',
        estimatedTime: '20-25 min',
        xpReward: 100,
        objectives: [
          'Map which investigation tasks belong to human vs AI vs both',
          'Practice the verify-then-trust workflow on real analysis',
          'Identify 3 situations where you should override AI conclusions',
        ],
        exercises: [
          {
            id: 'ahd_pm_trust',
            title: 'Trust Calibration Exercise',
            type: 'observation',
            instructions: 'Run an investigation campaign with NEXUS. For each AI response, explicitly decide: Trust (use as-is), Verify (check before acting), Override (your judgment is better). Document why for each decision. After 10 interactions, review your pattern.',
            hints: [
              'Trust: factual lookups, format conversion, summarization',
              'Verify: specific claims, attribution, statistics',
              'Override: ethical decisions, scope judgments, risk tolerance',
            ],
            successCriteria: [
              'Documented trust/verify/override decisions for 10 interactions',
              'Can articulate your personal trust boundaries with AI',
              'Identified at least 1 case where you should have overridden the AI',
            ],
          },
          {
            id: 'ahd_pm_complementary',
            title: 'Complementary Strengths Map',
            type: 'reflection',
            instructions: 'After completing an investigation, create a timeline of who did what. Mark each step as: Human-led, AI-led, or Collaborative. What pattern emerges? Where did the partnership add the most value?',
            hints: [
              'AI excels at: scanning large datasets, finding patterns, generating hypotheses',
              'Humans excel at: contextual judgment, ethical reasoning, creative leaps',
              'The sweet spot: human frames the question, AI processes data, human evaluates conclusions',
            ],
            successCriteria: [
              'Created a timeline with clear human/AI/collaborative labels',
              'Identified the highest-value collaborative moments',
              'Can describe your ideal human-AI workflow for investigations',
            ],
          },
        ],
        keyTakeaways: [
          'The best investigators use AI as a partner, not an oracle',
          'Trust calibration is a skill that improves with practice',
          'Know your AI\'s strengths AND weaknesses before relying on it',
        ],
        teachingAdaptations: {
          experiential: 'Start investigating immediately. Label your trust decisions in real-time during a live campaign.',
          visual: 'Create a Venn diagram of human vs AI strengths. Plot where your investigation tasks fall.',
          analytical: 'Read research on human-AI teaming (Kamar et al., Microsoft Research). Map theory to practice.',
          social: 'Compare trust calibration patterns with other investigators. Where do you differ?',
          pragmatic: 'Quick framework: AI generates, human validates. Apply to your next 5 tasks.',
        },
        platformTools: ['Agent Chat', 'Investigation Hub'],
      },
    ],
  },

  {
    id: 'emergence_decoherence',
    name: 'Emergence & Decoherence',
    icon: '🌊',
    description: 'Understand why AI models sometimes produce brilliant unexpected insights and other times collapse into nonsense. Learn to detect and manage both.',
    order: 4,
    color: 'purple',
    prerequisiteTrackIds: ['prompt_engineering'],
    missions: [
      {
        id: 'ed_model_collapse',
        trackId: 'emergence_decoherence',
        name: 'When Models Collapse',
        icon: '💥',
        description: 'Hands-on exercises pushing models to failure. Learn what context window overflow, role confusion, and instruction conflict look like in practice.',
        difficulty: 'intermediate',
        estimatedTime: '25-35 min',
        xpReward: 200,
        objectives: [
          'Intentionally trigger 3 different types of model failure',
          'Learn to recognize early warning signs of decoherence',
          'Build recovery strategies for each failure type',
        ],
        exercises: [
          {
            id: 'ed_mc_context_overflow',
            title: 'Context Window Stress Test',
            type: 'failure_analysis',
            instructions: 'Have a long conversation (20+ messages) with NEXUS about a complex investigation. Watch for: repeating earlier points, contradicting itself, losing track of details, or drifting off-topic. Document exactly when quality degrades.',
            hints: [
              'Most free models start degrading around 4K-8K tokens of context',
              'Watch for the model "forgetting" things you told it 10 messages ago',
              'Compare the quality of response #5 vs response #20',
            ],
            successCriteria: [
              'Documented the point where quality visibly degraded',
              'Identified specific symptoms of context overflow',
              'Tested whether context compression helps recovery',
            ],
          },
          {
            id: 'ed_mc_role_confusion',
            title: 'Role Confusion Attack',
            type: 'failure_analysis',
            instructions: 'Give the AI conflicting instructions: tell it to be both a defensive analyst AND an offensive red teamer in the same prompt. Observe how it struggles. Then try: tell it to be extremely brief while also providing exhaustive detail. Document the failure modes.',
            hints: [
              'Contradictory instructions cause the model to alternate between roles',
              'Some models resolve conflicts by ignoring one instruction entirely',
              'This is exactly what happens in poorly-designed agent crews — role overlap',
            ],
            successCriteria: [
              'Triggered role confusion with contradictory instructions',
              'Documented how the model attempted to resolve the conflict',
              'Connected this to why agent crew roles must be clearly separated',
            ],
          },
          {
            id: 'ed_mc_emergence',
            title: 'Hunting for Emergence',
            type: 'observation',
            instructions: 'Run the same complex analysis through a small model (7B) and a large model (70B+). Look for cases where the large model produces insights that are qualitatively different — not just longer or more detailed, but demonstrating reasoning the small model couldn\'t do.',
            hints: [
              'Emergence: capabilities that appear suddenly at scale, not gradually',
              'Look for: multi-step reasoning, analogical thinking, connecting disparate concepts',
              'The small model will often try to fake these capabilities with plausible-sounding text',
            ],
            successCriteria: [
              'Compared outputs from different model sizes',
              'Identified at least 1 emergent capability present only in the larger model',
              'Can explain why model size matters for investigation quality',
            ],
          },
        ],
        keyTakeaways: [
          'Models don\'t "break" gracefully — they degrade in subtle, hard-to-detect ways',
          'Context window management is a critical skill for long investigations',
          'Role confusion in a single model mirrors role overlap in agent crews',
          'Emergence means some tasks are simply impossible for small models',
        ],
        teachingAdaptations: {
          experiential: 'Break things. Intentionally push models past their limits. You learn the boundaries by crossing them.',
          visual: 'Chart quality vs conversation length. Create a "decoherence timeline" showing when specific failures appear.',
          analytical: 'Study the scaling laws literature (Kaplan et al., Chinchilla). Understand why emergence occurs at specific parameter counts.',
          social: 'Share your failure findings. What creative ways did others find to break models?',
          pragmatic: 'Practical limits: refresh context every 15 messages, never mix roles, use the biggest model you can afford for complex tasks.',
        },
        platformTools: ['AI Lab', 'Battleground', 'Decoherence Lab'],
      },
    ],
  },

  {
    id: 'edge_ai_2026',
    name: 'Edge AI Computing (2026)',
    icon: '📡',
    description: 'What runs locally vs cloud in 2026. Understand latency, privacy, cost tradeoffs for security work. When to use edge models vs API models.',
    order: 5,
    color: 'cyan',
    prerequisiteTrackIds: ['emergence_decoherence'],
    missions: [
      {
        id: 'eai_landscape',
        trackId: 'edge_ai_2026',
        name: 'The 2026 AI Landscape',
        icon: '🗺️',
        description: 'Map the current AI compute landscape: what runs on a laptop, what needs a GPU, what requires cloud. Understand where cybersecurity fits.',
        difficulty: 'intermediate',
        estimatedTime: '20-30 min',
        xpReward: 150,
        objectives: [
          'Compare cloud vs edge model capabilities for security tasks',
          'Understand when privacy requires local models',
          'Map cost vs capability tradeoffs across model tiers',
        ],
        exercises: [
          {
            id: 'eai_ls_latency',
            title: 'Latency vs Quality Showdown',
            type: 'eval_run',
            instructions: 'Use the Battleground to compare a fast model (Gemini Flash) against a powerful model (Llama 70B) and a reasoning model (DeepSeek R1) on the same investigation task. Record: response time, output quality, and whether the speed difference matters for this task.',
            hints: [
              'For real-time incident response, 2 seconds vs 30 seconds matters enormously',
              'For deep analysis of malware, quality matters more than speed',
              'Edge AI (local models) have zero network latency but limited capability',
            ],
            successCriteria: [
              'Benchmarked 3 models on speed and quality',
              'Can articulate when speed vs quality matters more',
              'Identified tasks appropriate for each model tier',
            ],
            suggestedModels: [
              'google/gemini-2.0-flash-exp:free',
              'meta-llama/llama-3.3-70b-instruct:free',
              'deepseek/deepseek-r1:free',
            ],
          },
          {
            id: 'eai_ls_privacy',
            title: 'The Privacy Decision Matrix',
            type: 'reflection',
            instructions: 'List 10 common cybersecurity investigation tasks. For each, decide: can this data be sent to a cloud AI? Must it stay local? What\'s the risk? Build your personal decision matrix for when to use cloud vs edge AI.',
            hints: [
              'Client PII, credentials, and classified data should never touch cloud AI',
              'Public OSINT data is safe for cloud processing',
              'Internal network diagrams are a gray area — assess per engagement',
            ],
            successCriteria: [
              'Created a 10-item decision matrix',
              'Can explain the privacy risk for each category',
              'Has clear guidelines for cloud vs local model selection',
            ],
          },
        ],
        keyTakeaways: [
          'In 2026, small models (7-13B) can run on a laptop for basic tasks',
          'Complex reasoning still requires 70B+ models (usually cloud)',
          'Privacy requirements often trump capability preferences',
          'The best setup is a hybrid: edge for sensitive data, cloud for deep analysis',
        ],
        teachingAdaptations: {
          experiential: 'Run the latency benchmark yourself. Feel the difference between instant and slow responses during an investigation.',
          visual: 'Create a quadrant chart: speed vs quality, with model names plotted. Add a privacy overlay layer.',
          analytical: 'Research current FLOPS requirements per parameter. Calculate what actually fits on consumer hardware in 2026.',
          social: 'Survey your team: what data would they send to cloud AI? Results often surprise people.',
          pragmatic: 'Quick rule: if it has PII, keep it local. If it\'s public data and you need depth, use cloud. Done.',
        },
        platformTools: ['Battleground', 'AI Lab'],
      },
    ],
  },

  {
    id: 'llm_eval_tuning',
    name: 'LLM Evaluation & Fine-Tuning',
    icon: '⚖️',
    description: 'Learn to evaluate whether a model is actually good at YOUR specific task. Run structured evaluations, compare models quantitatively, and understand when fine-tuning makes sense.',
    order: 6,
    color: 'orange',
    prerequisiteTrackIds: ['prompt_engineering'],
    missions: [
      {
        id: 'let_structured_eval',
        trackId: 'llm_eval_tuning',
        name: 'Structured Model Evaluation',
        icon: '📋',
        description: 'Build and run a proper evaluation: define criteria, create test cases, score outputs, compare models objectively instead of vibes-based selection.',
        difficulty: 'intermediate',
        estimatedTime: '30-40 min',
        xpReward: 200,
        objectives: [
          'Create an evaluation rubric with 5+ criteria',
          'Build 3 test cases that represent your real use case',
          'Score 3 models against your rubric',
          'Select a model based on evidence, not reputation',
        ],
        exercises: [
          {
            id: 'let_se_rubric',
            title: 'Build Your Eval Rubric',
            type: 'prompt_craft',
            instructions: 'Define what "good" means for your specific investigation task. Create a rubric with criteria like: accuracy (verifiable claims only), actionability (provides next steps), depth (covers edge cases), conciseness (no padding), and calibration (honest about uncertainty). Weight each criterion.',
            hints: [
              'Don\'t just say "good quality" — define what that means with examples',
              'Include negative criteria: penalize hallucination, penalize false confidence',
              'Weight criteria based on YOUR workflow — what matters most to you?',
            ],
            successCriteria: [
              'Created a rubric with 5+ weighted criteria',
              'Each criterion has a clear scoring definition',
              'Rubric is specific to a real investigation task',
            ],
          },
          {
            id: 'let_se_shootout',
            title: 'Model Shootout',
            type: 'eval_run',
            instructions: 'Using the Battleground, send 3 identical test cases to 3 different models. Score each output using your rubric. Which model wins overall? Does a different model win on different criteria?',
            hints: [
              'The "best" model varies by task — there is no universal winner',
              'Cheap models often beat expensive ones on narrow, specific tasks',
              'Run each test case twice to check consistency',
            ],
            successCriteria: [
              'Scored 3 models on 3 test cases using your rubric',
              'Ranked models objectively based on scores',
              'Identified task-specific strengths of each model',
            ],
            suggestedModels: [
              'meta-llama/llama-3.3-70b-instruct:free',
              'deepseek/deepseek-r1:free',
              'qwen/qwen-2.5-coder-32b-instruct:free',
            ],
          },
        ],
        keyTakeaways: [
          'Vibes-based model selection wastes time and money',
          'A 10-minute eval rubric saves hours of frustration',
          'The best model for your task might not be the most popular one',
          'Consistency matters as much as peak quality',
        ],
        teachingAdaptations: {
          experiential: 'Build a rubric for a task you actually need to do. Make the eval immediately useful.',
          visual: 'Create a radar chart comparing models across your rubric criteria. Visualize strengths and weaknesses.',
          analytical: 'Study evaluation frameworks (MMLU, HellaSwag, HumanEval). Understand their limitations. Build something better for your domain.',
          social: 'Share your eval results. Do others agree with your scoring? Calibrate rubrics collaboratively.',
          pragmatic: 'Use this template: 3 test cases × 3 models × 5 criteria = your model choice in 30 minutes.',
        },
        platformTools: ['Battleground', 'AI Lab'],
      },
    ],
  },

  {
    id: 'agent_team_architecture',
    name: 'Agent Team Architecture',
    icon: '🏛️',
    description: 'The capstone: learn to design, build, evaluate, and optimize teams of AI agents. Move beyond single-model thinking to orchestrated multi-agent systems.',
    order: 7,
    color: 'rose',
    prerequisiteTrackIds: ['scientific_prompting', 'prompt_engineering', 'llm_eval_tuning'],
    missions: [
      {
        id: 'ata_first_crew',
        trackId: 'agent_team_architecture',
        name: 'Your First Agent Crew',
        icon: '👥',
        description: 'Build a 2-agent crew and see how it compares to a single agent on the same task. Understand why two specialists often beat one generalist.',
        difficulty: 'beginner',
        estimatedTime: '20-30 min',
        xpReward: 150,
        objectives: [
          'Build a 2-agent crew with complementary roles',
          'Compare crew output vs single-agent output on the same task',
          'Identify how agents "hand off" work to each other',
        ],
        exercises: [
          {
            id: 'ata_fc_build',
            title: 'Two Heads, One Task',
            type: 'crew_build',
            instructions: 'Use the Crew Builder to select 2 agents (e.g., VulnAnalyst + NetworkRecon). Define a shared objective like "Assess the security posture of this domain." Run the crew, then run a single generalist agent on the same task. Compare depth and coverage.',
            hints: [
              'Pick agents with complementary skills, not overlapping ones',
              'The synthesis step is where crew value appears — each agent sees what the other missed',
              'Watch for: one agent surfacing a finding that changes the other agent\'s analysis',
            ],
            successCriteria: [
              'Built and ran a 2-agent crew successfully',
              'Compared crew output to single-agent output',
              'Identified at least 1 insight the crew found that the single agent missed',
            ],
            crewConfig: {
              suggestedAgents: ['vuln_analyst', 'network_recon'],
              minAgents: 2,
              maxAgents: 2,
              objective: 'Comprehensive security assessment',
            },
          },
        ],
        keyTakeaways: [
          'Specialization beats generalization for complex tasks',
          'The synthesis step is where multi-agent value appears',
          '2 focused agents often outperform 1 agent trying to do everything',
        ],
        teachingAdaptations: {
          experiential: 'Build the crew and run it immediately. Compare outputs before reading theory.',
          visual: 'Diagram the information flow: Agent A output → Synthesis → Agent B reaction → Final output.',
          analytical: 'Study crew topology patterns: chain (A→B), parallel (A∥B→merge), hierarchical (manager→workers).',
          social: 'Each person builds a different 2-agent crew. Compare which pairing works best for the same task.',
          pragmatic: 'Best default pairing: domain expert + devil\'s advocate. Works for almost any task.',
        },
        platformTools: ['Crew Builder', 'NEXUS Agents'],
      },
      {
        id: 'ata_scaling_limits',
        trackId: 'agent_team_architecture',
        name: 'Scaling Limits: When More Agents Hurts',
        icon: '📈',
        description: 'Discover the sweet spot for crew size. Run the same task through 1, 2, 3, 4, and 6 agents. Find where adding agents stops helping and starts hurting.',
        difficulty: 'intermediate',
        estimatedTime: '30-40 min',
        xpReward: 250,
        objectives: [
          'Run identical tasks through crews of 1, 2, 3, 4, and 6 agents',
          'Identify the point of diminishing returns',
          'Understand why more agents can mean worse results',
          'Document the quality vs cost vs latency tradeoffs',
        ],
        exercises: [
          {
            id: 'ata_sl_scaling_test',
            title: 'The Scaling Experiment',
            type: 'eval_run',
            instructions: 'Using the Crew Eval Runner, send the same investigation task to crews of increasing size: 1 agent, 2 agents, 3 agents, 4 agents, all 6 agents. For each, measure: output quality, total tokens used, total time, and whether adding the extra agent actually improved the result.',
            hints: [
              'Most tasks see peak quality at 3-4 agents',
              'Past 4 agents, you often get: repetition, contradiction, and diluted focus',
              'Cost scales linearly but quality plateaus or drops',
              'The synthesis agent has to reconcile more viewpoints, which gets harder',
            ],
            successCriteria: [
              'Ran evals across 5 different crew sizes',
              'Identified the quality peak (usually 3-4 agents)',
              'Documented where adding agents started hurting',
              'Can explain WHY more agents can reduce quality',
            ],
          },
          {
            id: 'ata_sl_role_overlap',
            title: 'Role Overlap Detection',
            type: 'observation',
            instructions: 'In a 6-agent crew run, compare the outputs of each agent. Highlight where two agents made the same observation or recommendation. This is role overlap — it wastes tokens and can cause confusion when the synthesis agent sees the same point twice with different wording.',
            hints: [
              'VulnAnalyst and ThreatIntel often overlap on CVE analysis',
              'OSINTAnalyst and NetworkRecon may both enumerate subdomains',
              'The fix: sharper role definitions or fewer agents',
            ],
            successCriteria: [
              'Identified at least 2 cases of role overlap in a full crew run',
              'Proposed how to reduce overlap through better role definitions',
              'Understood why overlap degrades synthesis quality',
            ],
          },
        ],
        keyTakeaways: [
          '3-4 agents is the sweet spot for most investigation tasks',
          'Adding agents past the sweet spot increases cost, latency, and role confusion',
          'Role overlap is the #1 cause of poor crew performance',
          'Design crews like hiring a team: each role should be necessary and non-redundant',
        ],
        teachingAdaptations: {
          experiential: 'Run the full scaling experiment. The data speaks for itself.',
          visual: 'Create a line graph: crew size (x) vs quality score (y). Add cost and latency as secondary axes.',
          analytical: 'Study Brooks\' Law ("adding people to a late project makes it later"). The same principle applies to agent crews — communication overhead grows quadratically.',
          social: 'Compare scaling results across different tasks. Does the sweet spot change with task complexity?',
          pragmatic: 'Default to 3 agents. Only add more if you can name exactly what the 4th agent contributes that the others can\'t.',
        },
        platformTools: ['Crew Builder', 'Crew Eval Runner'],
      },
      {
        id: 'ata_architect_role',
        trackId: 'agent_team_architecture',
        name: 'Becoming the Architect',
        icon: '🏗️',
        description: 'The capstone mission: design a complete agent crew from scratch for a novel investigation scenario. Define roles, select models per agent, set communication patterns, and evaluate the result.',
        difficulty: 'advanced',
        estimatedTime: '40-60 min',
        xpReward: 400,
        objectives: [
          'Design a custom crew for a specific investigation scenario',
          'Select different models for different agent roles based on strengths',
          'Define the communication pattern (chain, parallel, hierarchical)',
          'Run, evaluate, and iterate on your crew design',
        ],
        exercises: [
          {
            id: 'ata_ar_design',
            title: 'Crew Design Document',
            type: 'crew_build',
            instructions: 'Choose an investigation scenario. Design a 3-4 agent crew on paper first: what role does each agent play? Why that role and not another? What model should each agent use? How do they communicate? Then build it in the Crew Builder and test your design.',
            hints: [
              'The best crews have: an analyst (domain expert), a critic (finds holes), and a synthesizer (combines viewpoints)',
              'Don\'t default to the same model for every agent — coding models handle technical analysis better, reasoning models handle threat assessment better',
              'Communication pattern matters: chain (sequential handoff) works for structured analysis, parallel (all analyze simultaneously) works for coverage',
            ],
            successCriteria: [
              'Created a written crew design document before building',
              'Justified each role choice and model selection',
              'Built and ran the crew successfully',
              'Iterated at least once based on initial results',
            ],
            crewConfig: {
              suggestedAgents: ['vuln_analyst', 'osint_analyst', 'threat_intel', 'synthesis'],
              minAgents: 3,
              maxAgents: 5,
              objective: 'Custom investigation defined by user',
            },
          },
          {
            id: 'ata_ar_iterate',
            title: 'Iteration & Optimization',
            type: 'eval_run',
            instructions: 'Run your crew 3 times, modifying one variable each time: swap one agent\'s model, change the crew size by 1, or adjust an agent\'s temperature. Track how each change affects output quality. This is the architect\'s core skill: systematic optimization.',
            hints: [
              'Change only ONE variable at a time — scientific method applies here too',
              'Temperature affects creativity: lower for analysis, higher for brainstorming',
              'Some agents work better with different models — a coding model for technical analysis, a creative model for threat scenarios',
            ],
            successCriteria: [
              'Ran 3 iterations with documented changes',
              'Tracked quality impact of each change',
              'Can explain which changes improved vs degraded results',
              'Has a final optimized crew design',
            ],
          },
        ],
        keyTakeaways: [
          'Agent team architecture is a design discipline, not just connecting APIs',
          'The architect\'s job: role definition, model selection, communication design, and systematic evaluation',
          'Good crew design follows the scientific method: hypothesize, test, measure, iterate',
          'The best crews are intentionally designed, not assembled by default',
        ],
        teachingAdaptations: {
          experiential: 'Start building immediately. Design on the fly, iterate fast, learn from failures.',
          visual: 'Architect the crew as a network diagram with data flows, models, and communication channels labeled.',
          analytical: 'Study multi-agent systems theory (MAS). Apply concepts like emergent behavior, communication protocols, and conflict resolution.',
          social: 'Present your crew design to peers for critique. Defend your choices. Incorporate feedback.',
          pragmatic: 'Template: 3 agents (analyst + critic + synthesizer), fastest models available, parallel execution. Optimize from there.',
        },
        platformTools: ['Crew Builder', 'Crew Eval Runner', 'Battleground'],
      },
    ],
  },
];

export const OSINT_CURRICULUM_TRACKS: AICurriculumTrack[] = [
  {
    id: 'osint_foundations',
    name: 'OSINT Foundations',
    icon: '🔎',
    description: 'Master the core principles and methodology of Open Source Intelligence. Learn the OSINT cycle, legal boundaries, evidence preservation, and operational security.',
    order: 0,
    color: 'sky',
    prerequisiteTrackIds: [],
    missions: [
      {
        id: 'osint_cycle',
        trackId: 'osint_foundations',
        name: 'The OSINT Intelligence Cycle',
        icon: '🔄',
        description: 'Learn the 5-phase intelligence cycle: Planning, Collection, Processing, Analysis, Dissemination. Every investigation follows this pattern.',
        difficulty: 'beginner',
        estimatedTime: '20-25 min',
        xpReward: 100,
        objectives: [
          'Understand and apply the 5-phase intelligence cycle',
          'Write a proper intelligence requirement before starting collection',
          'Distinguish between raw data, processed information, and finished intelligence',
          'Create a collection plan for a given investigation scenario',
        ],
        exercises: [
          {
            id: 'osint_cycle_plan',
            title: 'Writing Intelligence Requirements',
            type: 'prompt_craft',
            instructions: 'Given this scenario: "A company suspects a competitor is scraping their pricing data." Write a proper intelligence requirement (PIR) that guides the investigation. Then break it into 3-5 specific collection tasks. Use NEXUS to refine your plan.',
            hints: [
              'A PIR answers: WHO is doing WHAT, WHEN, HOW, and WHY do we care?',
              'Bad PIR: "Find out about competitor." Good PIR: "Determine whether CompetitorX is programmatically accessing our pricing API between Jan-Mar 2026."',
              'Collection tasks should be specific and achievable — each maps to a technique',
            ],
            successCriteria: [
              'Wrote a focused PIR with clear scope and boundaries',
              'Broke the PIR into 3-5 actionable collection tasks',
              'Each task specifies what tool or technique to use',
            ],
          },
          {
            id: 'osint_cycle_evidence',
            title: 'Evidence Preservation',
            type: 'observation',
            instructions: 'Run the Passive Reconnaissance campaign on the practice target. For every finding, document: the source URL, timestamp, a screenshot description, and how you found it. This is your evidence chain — without it, your intelligence is hearsay.',
            hints: [
              'Web pages change — always record the date and time you accessed them',
              'Use Wayback Machine snapshots as preserved evidence',
              'Chain of custody: could you explain to a lawyer how you found this?',
            ],
            successCriteria: [
              'Documented at least 5 findings with full source attribution',
              'Each finding has timestamp, URL, and discovery method',
              'Could reconstruct the investigation from your notes alone',
            ],
          },
        ],
        keyTakeaways: [
          'Good OSINT starts with a question, not a tool',
          'Raw data is not intelligence — analysis transforms data into actionable insight',
          'Evidence without documentation is worthless',
          'The intelligence cycle prevents rabbit holes and scope creep',
        ],
        teachingAdaptations: {
          experiential: 'Start the Passive Recon campaign immediately. Document as you go, then retroactively identify which phase of the cycle each step belonged to.',
          visual: 'Draw the 5-phase cycle as a circular diagram. Plot your investigation steps on it. Notice where you spent the most time.',
          analytical: 'Read the NATO OSINT Handbook and RAND Corporation OSINT reports. Understand the military origins of the intelligence cycle.',
          social: 'Compare collection plans with another investigator. Did you prioritize the same sources? Why or why not?',
          pragmatic: 'Template: 1 PIR → 3 collection tasks → 1 analysis step → 1 report. Apply to every investigation from now on.',
        },
        platformTools: ['Agent Chat', 'Investigation Hub'],
        furtherReading: [
          'NATO Open Source Intelligence Handbook',
          'RAND Corporation - Intelligence Analysis: Behavioral and Social Scientific Foundations',
          'Michael Bazzell - OSINT Techniques',
        ],
      },
      {
        id: 'osint_opsec',
        trackId: 'osint_foundations',
        name: 'Operational Security for Investigators',
        icon: '🛡️',
        description: 'Your investigation leaves traces too. Learn to protect yourself: sock puppets, VPNs, browser isolation, and digital footprint minimization.',
        difficulty: 'beginner',
        estimatedTime: '20-30 min',
        xpReward: 100,
        objectives: [
          'Assess your own digital footprint using OSINT techniques on yourself',
          'Understand when to use VPN, Tor, or isolated browsers',
          'Learn the principles of sock puppet account management',
          'Create an operational security checklist for investigations',
        ],
        exercises: [
          {
            id: 'osint_opsec_self',
            title: 'OSINT Yourself',
            type: 'observation',
            instructions: 'Use NEXUS to guide you through an OSINT investigation of YOUR OWN online presence. What can someone find about you from public sources? Ask NEXUS to suggest search techniques and evaluate what you find. This is the best way to understand what investigators can see.',
            hints: [
              'Start with Google dorking your real name and common usernames',
              'Check breach databases (Have I Been Pwned) for your email addresses',
              'Search social media username reuse with tools like Sherlock/Maigret',
            ],
            successCriteria: [
              'Discovered at least 3 things publicly available about yourself',
              'Identified which sources exposed the most information',
              'Created a list of what to reduce or remove',
            ],
          },
          {
            id: 'osint_opsec_checklist',
            title: 'OpSec Checklist Builder',
            type: 'reflection',
            instructions: 'Using what you learned, build a pre-investigation operational security checklist. Ask NEXUS to review it for gaps. Consider: browser, network, accounts, metadata, and physical factors.',
            hints: [
              'Different investigations need different OpSec levels — corporate intel vs nation-state targets',
              'Metadata in screenshots and documents can reveal your identity',
              'Time zone and working hours can reveal your location',
            ],
            successCriteria: [
              'Created an OpSec checklist with at least 8 items',
              'Checklist covers browser, network, identity, and metadata categories',
              'Had NEXUS review and suggest improvements',
            ],
          },
        ],
        keyTakeaways: [
          'If you can find targets with OSINT, targets can find you the same way',
          'OpSec is proportional to risk — not every investigation needs maximum protection',
          'Browser isolation and VPNs are basics, not advanced techniques',
          'Sock puppet maintenance is a discipline, not a one-time setup',
        ],
        teachingAdaptations: {
          experiential: 'OSINT yourself right now. Nothing teaches OpSec faster than seeing your own exposure.',
          visual: 'Map your digital footprint: draw connections between your accounts, emails, usernames, and real identity.',
          analytical: 'Study real cases where investigators were burned: OPSEC failures in law enforcement, journalism, and bug bounty hunting.',
          social: 'Review each other\'s OpSec checklists. Others spot gaps you don\'t see in your own setup.',
          pragmatic: 'Minimum OpSec: VPN + private browsing + no personal accounts during investigation. Build from there.',
        },
        platformTools: ['Agent Chat', 'Investigation Hub'],
      },
    ],
  },

  {
    id: 'passive_recon_mastery',
    name: 'Passive Reconnaissance Mastery',
    icon: '📡',
    description: 'Deep-dive into passive reconnaissance techniques. DNS enumeration, certificate transparency, WHOIS history, technology fingerprinting — all without touching the target.',
    order: 1,
    color: 'purple',
    prerequisiteTrackIds: ['osint_foundations'],
    missions: [
      {
        id: 'pr_dns_deep',
        trackId: 'passive_recon_mastery',
        name: 'DNS Deep Dive',
        icon: '🌐',
        description: 'DNS records reveal infrastructure secrets. Learn to extract subdomains, mail servers, SPF/DKIM/DMARC configs, and hidden services from DNS alone.',
        difficulty: 'intermediate',
        estimatedTime: '25-35 min',
        xpReward: 150,
        objectives: [
          'Enumerate all DNS record types and understand what each reveals',
          'Use certificate transparency logs for subdomain discovery',
          'Analyze SPF, DKIM, and DMARC records for email security posture',
          'Map DNS history to discover old infrastructure',
        ],
        exercises: [
          {
            id: 'pr_dns_enum',
            title: 'Full DNS Enumeration',
            type: 'observation',
            instructions: 'Start the Passive Reconnaissance campaign. Focus exclusively on DNS. Ask NEXUS to guide you through extracting: A, AAAA, MX, NS, TXT (SPF/DKIM/DMARC), CNAME, and SOA records. For each, explain what it tells us about the target\'s infrastructure.',
            hints: [
              'MX records reveal email providers — on-prem Exchange vs Google Workspace vs Microsoft 365',
              'SPF records list every IP authorized to send email for the domain',
              'CNAME records often point to third-party services (CDNs, SaaS)',
              'NS records reveal the DNS hosting provider — sometimes different from web hosting',
            ],
            successCriteria: [
              'Extracted at least 5 different DNS record types',
              'Explained what each record reveals about infrastructure',
              'Identified at least one third-party service from DNS records',
            ],
            suggestedPrompts: [
              'What do TXT records with v=spf1 tell us about this organization\'s email infrastructure?',
              'How can CNAME records reveal third-party SaaS services?',
            ],
          },
          {
            id: 'pr_cert_trans',
            title: 'Certificate Transparency Mining',
            type: 'observation',
            instructions: 'Use crt.sh (via NEXUS guidance) to discover subdomains through certificate transparency logs. Explain why CT logs exist and why they\'re an OSINT goldmine. Compare CT results with DNS brute-forcing results — which finds more?',
            hints: [
              'CT logs are public and legally accessible — no ethical concerns',
              'Wildcard certificates hide subdomains, but specific certs reveal them',
              'Internal-sounding names (dev.*, staging.*, internal.*) are high-value targets',
            ],
            successCriteria: [
              'Discovered subdomains via certificate transparency',
              'Explained why CT logs exist (preventing mis-issued certificates)',
              'Categorized discovered subdomains by likely purpose',
            ],
          },
        ],
        keyTakeaways: [
          'DNS is the most information-rich passive recon source',
          'Certificate transparency provides subdomain data that DNS brute-forcing misses',
          'Email security records (SPF/DKIM/DMARC) reveal infrastructure and maturity level',
          'Historical DNS shows old infrastructure that may still be accessible',
        ],
        teachingAdaptations: {
          experiential: 'Start the Passive Recon campaign and focus on DNS. Extract every record type and discuss findings with NEXUS.',
          visual: 'Draw an infrastructure map from DNS data alone. Connect subdomains → IPs → services → providers.',
          analytical: 'Study RFC 1035 (DNS), RFC 6962 (CT), and RFC 7208 (SPF). Understand the protocol-level reasons these records exist.',
          social: 'Compare subdomain lists from different sources. Which technique found unique results?',
          pragmatic: 'Quick workflow: crt.sh for subdomains → dig for record types → SecurityTrails for history. Takes 5 minutes.',
        },
        platformTools: ['Agent Chat', 'Scanner', 'Investigation Hub'],
      },
    ],
  },

  {
    id: 'people_osint',
    name: 'People & SOCMINT',
    icon: '👤',
    description: 'Social media intelligence and people research. Username correlation, profile analysis, digital footprint mapping, and social graph analysis.',
    order: 2,
    color: 'amber',
    prerequisiteTrackIds: ['osint_foundations'],
    missions: [
      {
        id: 'socmint_username',
        trackId: 'people_osint',
        name: 'Username Intelligence',
        icon: '🔗',
        description: 'Most people reuse usernames across platforms. Learn to pivot from one username to build a complete digital profile across dozens of services.',
        difficulty: 'beginner',
        estimatedTime: '20-25 min',
        xpReward: 100,
        objectives: [
          'Understand username correlation and cross-platform pivoting',
          'Use NEXUS to guide username enumeration techniques',
          'Assess the reliability of username matches (common names vs unique handles)',
          'Build a digital profile from connected accounts',
        ],
        exercises: [
          {
            id: 'socmint_user_pivot',
            title: 'Cross-Platform Pivot',
            type: 'prompt_craft',
            instructions: 'Ask NEXUS to guide you through investigating a fictional username "cyb3rn0va_42" across platforms. What tools check username availability? How do you confirm that matches are the same person and not just coincidental name reuse? Build a methodology.',
            hints: [
              'Tools like Sherlock, Maigret, and WhatsMyName check hundreds of platforms at once',
              'Same username on GitHub + Twitter + Reddit = likely same person',
              'Check profile photos, bio details, and posting patterns to confirm identity',
              'Common usernames (john123) have false positives; unique ones (cyb3rn0va_42) are more reliable',
            ],
            successCriteria: [
              'Described a methodology for username correlation',
              'Identified at least 3 confidence indicators beyond just matching names',
              'Understood false positive risks with common usernames',
            ],
          },
          {
            id: 'socmint_social_graph',
            title: 'Social Graph Mapping',
            type: 'reflection',
            instructions: 'Starting from the Social Engineering Recon campaign, work with NEXUS to map the organizational social graph. Who follows whom? Who interacts with whom? What do shared connections reveal about team structure, projects, and communication patterns?',
            hints: [
              'LinkedIn connections reveal professional networks and former colleagues',
              'Twitter/X interactions reveal personal interests and political views',
              'GitHub contributions reveal technical skills and project involvement',
              'Shared group memberships (Slack, Discord, Meetup) reveal interests',
            ],
            successCriteria: [
              'Mapped connections between at least 3 people in the target organization',
              'Identified relationship types (colleague, friend, vendor, former employer)',
              'Found at least 1 non-obvious connection that reveals organizational information',
            ],
          },
        ],
        keyTakeaways: [
          'Username reuse is the single most common OSINT pivot point',
          'Correlation requires confirmation — matching names alone is not enough',
          'Social graphs reveal organizational structure better than org charts',
          'People reveal more through interactions than through profiles',
        ],
        teachingAdaptations: {
          experiential: 'Start with the Social Engineering Recon campaign. Pivot from one account to build a profile.',
          visual: 'Draw a graph: person nodes, platform nodes, connection edges. See the network emerge.',
          analytical: 'Study social network analysis theory (Granovetter, weak ties). Apply graph theory to OSINT.',
          social: 'Compare what different investigators find from the same starting username. Different perspectives find different connections.',
          pragmatic: 'Quick workflow: username → Sherlock check → confirm with profile comparison → map connections. 10 minutes per target.',
        },
        platformTools: ['Agent Chat', 'Investigation Hub'],
      },
    ],
  },

  {
    id: 'geolocation_osint',
    name: 'Geolocation & Imagery Analysis',
    icon: '📍',
    description: 'Determine location from photos, videos, and metadata. Landmark identification, sun position analysis, street-level features, and satellite imagery interpretation.',
    order: 3,
    color: 'emerald',
    prerequisiteTrackIds: ['osint_foundations'],
    missions: [
      {
        id: 'geo_photo_analysis',
        trackId: 'geolocation_osint',
        name: 'Photo Geolocation Fundamentals',
        icon: '📸',
        description: 'A single photo can reveal a precise location. Learn to read environmental clues: language on signs, vegetation, road markings, architecture, vehicle types, and sun position.',
        difficulty: 'intermediate',
        estimatedTime: '25-35 min',
        xpReward: 150,
        objectives: [
          'Identify at least 5 categories of location clues in photos',
          'Use NEXUS AI to analyze image descriptions for geolocation hints',
          'Understand EXIF metadata extraction and its limitations',
          'Practice narrowing location from continent → country → city → street',
        ],
        exercises: [
          {
            id: 'geo_photo_clues',
            title: 'Reading the Environment',
            type: 'prompt_craft',
            instructions: 'Describe a photo scenario to NEXUS: "A street scene showing a red double-decker bus, a pub with a sign reading \'The Crown\', left-hand traffic, and visible rain." Ask NEXUS to analyze location clues systematically. Then try a harder one with fewer clues.',
            hints: [
              'Language on signs is the fastest way to narrow location',
              'Driving side (left/right) eliminates half the world immediately',
              'Vegetation and climate narrow latitude — palm trees vs evergreens',
              'Road markings, electrical infrastructure, and architecture vary by region',
            ],
            successCriteria: [
              'Identified 5+ clue categories in a photo description',
              'Narrowed location from general region to specific area',
              'Understood which clues are definitive vs suggestive',
            ],
            suggestedPrompts: [
              'Analyze these environmental clues for geolocation: [describe a scene]',
              'What OSINT tools help verify a suspected location from photo clues?',
            ],
          },
          {
            id: 'geo_metadata',
            title: 'EXIF & Metadata Extraction',
            type: 'observation',
            instructions: 'Ask NEXUS to explain what EXIF metadata contains and why it matters. Discuss: when is EXIF stripped (social media uploads), when is it preserved (email attachments, direct shares), and what tools extract it. Build a checklist for metadata analysis.',
            hints: [
              'Most social media platforms strip EXIF data on upload — but not all do',
              'Direct image URLs from messaging apps often preserve metadata',
              'EXIF contains: GPS coordinates, camera model, timestamp, and sometimes lens focal length',
              'Even without GPS, camera model + timestamp can narrow possibilities',
            ],
            successCriteria: [
              'Can explain what EXIF metadata contains',
              'Knows which platforms strip vs preserve metadata',
              'Has a metadata analysis workflow',
            ],
          },
        ],
        keyTakeaways: [
          'Systematic clue analysis beats random guessing every time',
          'Work from broad to narrow: hemisphere → continent → country → city → block',
          'EXIF metadata is gold when available, but never count on it being there',
          'Cross-reference photo clues with Google Maps, Street View, and satellite imagery',
        ],
        teachingAdaptations: {
          experiential: 'Describe real-world photo scenarios to NEXUS and practice geolocation analysis. Start easy (famous landmarks) and progress to subtle clues.',
          visual: 'Create a decision tree: sign language → driving side → vegetation → architecture → specific features.',
          analytical: 'Study the Bellingcat geolocation methodology. Analyze their published case studies for technique patterns.',
          social: 'GeoGuessr-style challenges — describe a scene and race to determine location. Compare reasoning processes.',
          pragmatic: 'Quick method: 1) Language on signs, 2) Driving side, 3) Sun position for hemisphere, 4) Google Lens for landmarks.',
        },
        platformTools: ['Agent Chat', 'Investigation Hub'],
        furtherReading: [
          'Bellingcat - Digital Investigation Toolkit',
          'Nixintel - OSINT and Geolocation Guides',
          'Sector035 - Week in OSINT',
        ],
      },
    ],
  },

  {
    id: 'financial_osint',
    name: 'Financial & Corporate Intelligence',
    icon: '💰',
    description: 'Follow the money. Corporate ownership tracing, beneficial ownership discovery, financial document analysis, sanctions screening, and cryptocurrency tracking.',
    order: 4,
    color: 'orange',
    prerequisiteTrackIds: ['osint_foundations'],
    missions: [
      {
        id: 'fin_corporate_trace',
        trackId: 'financial_osint',
        name: 'Corporate Ownership Tracing',
        icon: '🏢',
        description: 'Companies hide behind layers of shell entities. Learn to trace beneficial ownership through corporate registries, SEC filings, and leaked databases.',
        difficulty: 'intermediate',
        estimatedTime: '30-40 min',
        xpReward: 200,
        objectives: [
          'Navigate corporate registries and SEC EDGAR filings',
          'Trace beneficial ownership through multiple entity layers',
          'Identify red flags for shell companies and money laundering structures',
          'Cross-reference corporate data with sanctions and PEP lists',
        ],
        exercises: [
          {
            id: 'fin_corp_registry',
            title: 'Registry Investigation',
            type: 'prompt_craft',
            instructions: 'Start the Corporate Intelligence Campaign or ask NEXUS to guide you through investigating a fictional company "Meridian Holdings LLC." What corporate registries should you check? What red flags in registration data suggest a shell company?',
            hints: [
              'Registered agent services (CT Corp, CSC) are normal but bulk registrations at same address are suspicious',
              'Directors shared across many companies suggest nominee arrangements',
              'Recently formed entities with immediate large transactions are red flags',
              'Cross-reference with OpenCorporates, Companies House, SEC EDGAR',
            ],
            successCriteria: [
              'Identified relevant corporate registries for the jurisdiction',
              'Listed at least 5 shell company red flags',
              'Demonstrated understanding of beneficial ownership concepts',
            ],
            suggestedPrompts: [
              'What public registries can I check for US LLC ownership information?',
              'What are the indicators that a company is a shell entity used for money laundering?',
            ],
          },
          {
            id: 'fin_sanctions',
            title: 'Sanctions & PEP Screening',
            type: 'observation',
            instructions: 'Ask NEXUS to explain sanctions screening methodology. How do you check if a person or company appears on OFAC SDN, EU sanctions, UN sanctions, or PEP databases? What are the consequences of failing to screen?',
            hints: [
              'OFAC SDN list is freely searchable at sanctionssearch.ofac.treas.gov',
              'PEP (Politically Exposed Persons) have higher corruption risk',
              'Name matching must account for transliteration variants, aliases, and common name variants',
              'Sanctions compliance is a legal obligation for financial institutions',
            ],
            successCriteria: [
              'Understands the major sanctions lists and how to access them',
              'Can explain PEP risk and why it matters',
              'Knows the compliance implications of sanctions violations',
            ],
          },
        ],
        keyTakeaways: [
          'Corporate opacity is often intentional — designed to hide beneficial ownership',
          'Multiple registries and cross-referencing are essential — no single source is complete',
          'Sanctions screening is not optional for financial investigations',
          'Follow the money is the most powerful principle in financial OSINT',
        ],
        teachingAdaptations: {
          experiential: 'Start the Corporate Intelligence campaign and trace ownership. The hands-on investigation teaches more than reading about it.',
          visual: 'Draw an ownership chart: parent → subsidiary → subsidiary. Map the corporate structure visually.',
          analytical: 'Study the Panama Papers and Pandora Papers methodologies. Understand how ICIJ investigators traced shell companies.',
          social: 'Discuss case studies: Wirecard, Enron, BCCI. What OSINT was available before the scandals broke?',
          pragmatic: 'Quick check: OpenCorporates for entity search, OFAC for sanctions, LinkedIn for people, Companies House for UK entities.',
        },
        platformTools: ['Agent Chat', 'Investigation Hub'],
      },
    ],
  },

  {
    id: 'dark_web_osint',
    name: 'Dark Web & Threat Intelligence',
    icon: '🕸️',
    description: 'Monitor the dark web safely. Breach monitoring, ransomware leak tracking, threat actor profiling, and underground marketplace analysis — all from safe OSINT sources.',
    order: 5,
    color: 'gray',
    prerequisiteTrackIds: ['osint_foundations', 'passive_recon_mastery'],
    missions: [
      {
        id: 'dw_breach_monitoring',
        trackId: 'dark_web_osint',
        name: 'Breach & Exposure Monitoring',
        icon: '🔓',
        description: 'Your organization\'s data is probably already on the dark web. Learn to check breach databases, paste sites, and leaked credential repositories safely and legally.',
        difficulty: 'intermediate',
        estimatedTime: '25-35 min',
        xpReward: 150,
        objectives: [
          'Search breach databases for organizational exposure',
          'Assess credential leak impact and timeline',
          'Understand the dark web data lifecycle: breach → marketplace → paste site → public',
          'Build a continuous monitoring plan for your organization',
        ],
        exercises: [
          {
            id: 'dw_breach_check',
            title: 'Breach Database Investigation',
            type: 'observation',
            instructions: 'Start the Dark Web Intelligence campaign. Ask NEXUS to guide you through checking organizational exposure using safe, legal OSINT sources. How do you check if your domain\'s credentials have been leaked without accessing illegal databases?',
            hints: [
              'Have I Been Pwned (HIBP) is the primary free, legal breach checking service',
              'DeHashed and IntelX offer more detail but require accounts',
              'Google dorking for paste sites: site:pastebin.com "targetdomain.com"',
              'Check if leaked passwords match your current password policy — if so, force resets',
            ],
            successCriteria: [
              'Used at least 2 breach checking services',
              'Assessed the severity and recency of any findings',
              'Created an incident response plan for credential leaks',
            ],
          },
          {
            id: 'dw_threat_profile',
            title: 'Threat Actor Profiling',
            type: 'prompt_craft',
            instructions: 'Ask NEXUS to help you build a threat actor profile for a fictional ransomware group "NightShade." What information do you need? What OSINT sources reveal TTPs, victimology, and infrastructure? How do you track their evolution over time?',
            hints: [
              'MITRE ATT&CK framework maps threat actor TTPs systematically',
              'Ransomware leak sites are publicly indexed by researchers — you don\'t need to access them directly',
              'Twitter/X, security blogs, and vendor reports track active groups',
              'Infrastructure analysis: domain registration patterns, hosting providers, payment methods',
            ],
            successCriteria: [
              'Built a structured threat actor profile with TTPs, victimology, and infrastructure',
              'Used MITRE ATT&CK framework for technique mapping',
              'Identified at least 3 OSINT sources for ongoing tracking',
            ],
            suggestedPrompts: [
              'Help me build a threat actor profile template. What sections should it include?',
              'How do researchers safely track ransomware groups using only OSINT?',
            ],
          },
        ],
        keyTakeaways: [
          'Most dark web intelligence is available through safe, legal OSINT sources',
          'You do NOT need to access dark web markets to do dark web intelligence',
          'Breach monitoring should be continuous, not one-time',
          'Threat actor profiling follows the same intelligence cycle as any OSINT investigation',
        ],
        teachingAdaptations: {
          experiential: 'Start the Dark Web Intelligence campaign immediately. Check practice targets for breach exposure.',
          visual: 'Create a data lifecycle diagram: breach event → dark web marketplace → paste site → public knowledge. Map timelines.',
          analytical: 'Study MITRE ATT&CK and Diamond Model frameworks. Understand formal threat intelligence analysis.',
          social: 'Share anonymized findings from breach checks. Discuss: how would you respond as a CISO?',
          pragmatic: 'Set up HIBP notifications for your domain right now. It\'s free and gives you ongoing monitoring.',
        },
        platformTools: ['Agent Chat', 'Investigation Hub', 'Scanner'],
      },
    ],
  },
];

export const ALL_CURRICULUM_TRACKS: AICurriculumTrack[] = [
  ...AI_CURRICULUM_TRACKS,
  ...OSINT_CURRICULUM_TRACKS,
];

export function getTrackById(trackId: string): AICurriculumTrack | undefined {
  return ALL_CURRICULUM_TRACKS.find(t => t.id === trackId);
}

export function getMissionById(missionId: string): AIMission | undefined {
  for (const track of ALL_CURRICULUM_TRACKS) {
    const mission = track.missions.find(m => m.id === missionId);
    if (mission) return mission;
  }
  return undefined;
}

export function getTrackForMission(missionId: string): AICurriculumTrack | undefined {
  return ALL_CURRICULUM_TRACKS.find(t => t.missions.some(m => m.id === missionId));
}

export function getAvailableTracks(completedTrackIds: string[]): AICurriculumTrack[] {
  return ALL_CURRICULUM_TRACKS.filter(track =>
    track.prerequisiteTrackIds.every(prereq => completedTrackIds.includes(prereq))
  );
}

export function getNextMission(completedMissionIds: string[]): AIMission | undefined {
  for (const track of ALL_CURRICULUM_TRACKS) {
    for (const mission of track.missions) {
      if (!completedMissionIds.includes(mission.id)) return mission;
    }
  }
  return undefined;
}

export const CREW_SIZE_GUIDANCE = {
  1: { label: 'Solo Agent', quality: 'Baseline', description: 'Good for simple, focused tasks. Fast and cheap.', tradeoff: 'Limited perspective, no cross-validation.' },
  2: { label: 'Pair', quality: 'Good', description: 'Analyst + Critic or two complementary specialists.', tradeoff: 'Moderate cost, synthesis is straightforward.' },
  3: { label: 'Triad', quality: 'Optimal for most tasks', description: 'Analyst + Critic + Synthesizer. The "golden crew."', tradeoff: 'Best quality/cost ratio for complex analysis.' },
  4: { label: 'Quad', quality: 'High but diminishing', description: 'Add a domain specialist to the triad.', tradeoff: 'Quality gains exist but are smaller per additional agent.' },
  5: { label: 'Squad', quality: 'Marginal gains', description: 'Usually only needed for very broad investigations.', tradeoff: 'Role overlap risk rises. Synthesis becomes harder.' },
  6: { label: 'Full Crew', quality: 'Often worse than 4', description: 'Every specialist runs. Use for benchmarking, not production.', tradeoff: 'High cost, high latency, synthesis overload, frequent redundancy.' },
};
