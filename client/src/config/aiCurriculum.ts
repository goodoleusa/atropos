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
    id: 'prompt_engineering',
    name: 'Prompt Engineering',
    icon: '✏️',
    description: 'Master the art and science of crafting prompts that get consistent, high-quality results. Go beyond simple questions to build reusable prompt templates.',
    order: 1,
    color: 'amber',
    prerequisiteTrackIds: ['scientific_prompting'],
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
    order: 2,
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
    order: 3,
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
    order: 4,
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
    order: 5,
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
    order: 6,
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

export function getTrackById(trackId: string): AICurriculumTrack | undefined {
  return AI_CURRICULUM_TRACKS.find(t => t.id === trackId);
}

export function getMissionById(missionId: string): AIMission | undefined {
  for (const track of AI_CURRICULUM_TRACKS) {
    const mission = track.missions.find(m => m.id === missionId);
    if (mission) return mission;
  }
  return undefined;
}

export function getTrackForMission(missionId: string): AICurriculumTrack | undefined {
  return AI_CURRICULUM_TRACKS.find(t => t.missions.some(m => m.id === missionId));
}

export function getAvailableTracks(completedTrackIds: string[]): AICurriculumTrack[] {
  return AI_CURRICULUM_TRACKS.filter(track =>
    track.prerequisiteTrackIds.every(prereq => completedTrackIds.includes(prereq))
  );
}

export function getNextMission(completedMissionIds: string[]): AIMission | undefined {
  for (const track of AI_CURRICULUM_TRACKS) {
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
