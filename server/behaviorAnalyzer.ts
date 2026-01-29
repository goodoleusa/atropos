import { storage } from "./storage";

export interface BehaviorPattern {
  type: 'jailbreak' | 'stalking' | 'illegal' | 'suspicious' | 'normal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  confidence: number;
}

export interface LearningProfile {
  style: LearningStyle;
  goals: LearningGoal[];
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  preferredPace: 'fast' | 'moderate' | 'thorough';
}

export type LearningStyle = 
  | 'experiential'    // Learn by doing, hands-on projects
  | 'visual'          // Diagrams, flowcharts, visual aids
  | 'analytical'      // Deep dive into theory, documentation
  | 'social'          // Discussion-based, collaborative
  | 'pragmatic';      // Quick results, practical application

export type LearningGoal = 
  | 'bgp_routing'
  | 'osint_investigation'
  | 'threat_hunting'
  | 'malware_reverse_engineering'
  | 'incident_response'
  | 'penetration_testing'
  | 'vulnerability_research'
  | 'forensics'
  | 'social_engineering'
  | 'network_security'
  | 'cloud_security'
  | 'red_teaming'
  | 'blue_teaming';

export const LEARNING_GOAL_METADATA: Record<LearningGoal, { name: string; description: string; tools: string[] }> = {
  bgp_routing: {
    name: 'BGP & Routing Analysis',
    description: 'Understanding Border Gateway Protocol, AS paths, route hijacking detection',
    tools: ['bgpstream', 'RIPE RIS', 'Hurricane Electric BGP Toolkit', 'Shodan']
  },
  osint_investigation: {
    name: 'OSINT Investigation',
    description: 'Open-source intelligence gathering, target profiling, digital footprint analysis',
    tools: ['Maltego', 'theHarvester', 'Shodan', 'Censys', 'SpiderFoot']
  },
  threat_hunting: {
    name: 'Threat Hunting',
    description: 'Proactive threat detection, IOC analysis, behavioral pattern recognition',
    tools: ['YARA', 'Sigma', 'Elasticsearch', 'Splunk', 'Velociraptor']
  },
  malware_reverse_engineering: {
    name: 'Malware Reverse Engineering',
    description: 'Static and dynamic analysis, unpacking, debugging malicious code',
    tools: ['Ghidra', 'IDA Pro', 'x64dbg', 'Cutter', 'FLARE-VM']
  },
  incident_response: {
    name: 'Incident Response',
    description: 'Containment, eradication, recovery procedures, forensic preservation',
    tools: ['Velociraptor', 'GRR', 'TheHive', 'MISP', 'Cortex']
  },
  penetration_testing: {
    name: 'Penetration Testing',
    description: 'Vulnerability exploitation, privilege escalation, lateral movement',
    tools: ['Metasploit', 'Burp Suite', 'Nmap', 'Cobalt Strike', 'BloodHound']
  },
  vulnerability_research: {
    name: 'Vulnerability Research',
    description: 'Bug hunting, fuzzing, CVE analysis, exploit development',
    tools: ['AFL', 'libFuzzer', 'Nuclei', 'ZAP', 'Semgrep']
  },
  forensics: {
    name: 'Digital Forensics',
    description: 'Evidence acquisition, timeline analysis, artifact recovery',
    tools: ['Autopsy', 'FTK', 'Volatility', 'Plaso', 'KAPE']
  },
  social_engineering: {
    name: 'Social Engineering',
    description: 'Phishing analysis, pretexting, human factor security',
    tools: ['Gophish', 'SET', 'Evilginx', 'King Phisher']
  },
  network_security: {
    name: 'Network Security',
    description: 'Traffic analysis, IDS/IPS, firewall configuration, segmentation',
    tools: ['Wireshark', 'Zeek', 'Suricata', 'pfSense', 'tcpdump']
  },
  cloud_security: {
    name: 'Cloud Security',
    description: 'AWS/Azure/GCP security, IAM, container security, serverless',
    tools: ['Prowler', 'ScoutSuite', 'Pacu', 'CloudSploit', 'Trivy']
  },
  red_teaming: {
    name: 'Red Teaming',
    description: 'Adversary simulation, TTPs, MITRE ATT&CK framework',
    tools: ['Cobalt Strike', 'Sliver', 'Havoc', 'Brute Ratel', 'Mythic']
  },
  blue_teaming: {
    name: 'Blue Teaming',
    description: 'Detection engineering, SIEM, threat intelligence, defensive operations',
    tools: ['Elastic SIEM', 'Splunk', 'Microsoft Sentinel', 'Wazuh', 'OSSEC']
  }
};

export const LEARNING_STYLE_PROMPTS: Record<LearningStyle, string> = {
  experiential: `Provide hands-on exercises, practical labs, and real-world scenarios. Guide through step-by-step activities they can execute. Focus on "try this now" instructions with immediate feedback loops.`,
  visual: `Use ASCII diagrams, flowcharts, and visual representations. Structure information in clear hierarchies. Include network diagrams, attack trees, and process flows where relevant.`,
  analytical: `Provide deep technical explanations, reference documentation, and theoretical foundations. Include RFC references, academic papers, and detailed protocol specifications.`,
  social: `Frame learning as collaborative investigation. Use conversational tone, ask guiding questions, and encourage the user to share their thought process. Reference community resources and forums.`,
  pragmatic: `Focus on quick wins and immediately applicable techniques. Prioritize efficiency over completeness. Provide checklists, scripts, and automation where possible.`
};

const JAILBREAK_PATTERNS = [
  /ignore.*previous.*instructions/i,
  /disregard.*system.*prompt/i,
  /pretend.*you.*are/i,
  /roleplay.*as/i,
  /bypass.*restrictions/i,
  /override.*safety/i,
  /you.*are.*now.*DAN/i,
  /jailbreak/i,
  /developer.*mode/i,
  /ignore.*guidelines/i,
  /forget.*rules/i,
  /act.*as.*if/i,
  /new.*persona/i,
  /unrestricted.*mode/i
];

const STALKING_PATTERNS = [
  /find.*address.*of/i,
  /where.*does.*live/i,
  /personal.*information.*about/i,
  /dox.*someone/i,
  /track.*location/i,
  /phone.*number.*of/i,
  /home.*address/i,
  /stalk/i,
  /follow.*movements/i,
  /monitor.*activities.*of/i
];

const ILLEGAL_PATTERNS = [
  /how.*to.*hack.*into/i,
  /steal.*credentials/i,
  /ransomware.*attack/i,
  /ddos.*attack.*on/i,
  /exploit.*vulnerability.*in.*production/i,
  /bypass.*authentication.*on.*real/i,
  /credit.*card.*fraud/i,
  /money.*laundering/i,
  /illegal.*access/i,
  /unauthorized.*access.*to/i
];

const INTEREST_KEYWORDS: Record<string, string[]> = {
  'network_analysis': ['bgp', 'routing', 'as path', 'peering', 'ip block', 'cidr', 'subnet'],
  'osint': ['osint', 'reconnaissance', 'footprint', 'social media', 'domain', 'whois'],
  'malware': ['malware', 'virus', 'trojan', 'ransomware', 'payload', 'reverse engineer'],
  'web_security': ['xss', 'sqli', 'csrf', 'injection', 'web app', 'api security'],
  'cryptography': ['encrypt', 'decrypt', 'hash', 'certificate', 'ssl', 'tls', 'crypto'],
  'forensics': ['forensic', 'evidence', 'artifact', 'timeline', 'memory dump', 'disk image'],
  'threat_intel': ['ioc', 'indicator', 'threat', 'apt', 'campaign', 'attribution'],
  'cloud': ['aws', 'azure', 'gcp', 'cloud', 's3', 'iam', 'kubernetes', 'docker']
};

export class BehaviorAnalyzer {
  private flaggedSessions: Map<string, { 
    reason: string; 
    severity: string; 
    timestamp: Date;
    sandboxed: boolean;
    playAlong: boolean;
  }> = new Map();

  private sessionProfiles: Map<string, LearningProfile> = new Map();

  analyzeMessage(sessionToken: string, message: string): BehaviorPattern {
    const indicators: string[] = [];
    let type: BehaviorPattern['type'] = 'normal';
    let severity: BehaviorPattern['severity'] = 'low';
    let confidence = 0;

    // Check jailbreak patterns
    for (const pattern of JAILBREAK_PATTERNS) {
      if (pattern.test(message)) {
        indicators.push(`Jailbreak attempt: ${pattern.source}`);
        type = 'jailbreak';
        severity = 'high';
        confidence += 0.3;
      }
    }

    // Check stalking patterns
    for (const pattern of STALKING_PATTERNS) {
      if (pattern.test(message)) {
        indicators.push(`Stalking behavior: ${pattern.source}`);
        type = 'stalking';
        severity = 'critical';
        confidence += 0.4;
      }
    }

    // Check illegal patterns
    for (const pattern of ILLEGAL_PATTERNS) {
      if (pattern.test(message)) {
        indicators.push(`Illegal intent: ${pattern.source}`);
        type = 'illegal';
        severity = 'critical';
        confidence += 0.4;
      }
    }

    // Cap confidence at 1.0
    confidence = Math.min(confidence, 1.0);

    // If flagged, sandbox the session but play along
    if (type !== 'normal' && confidence > 0.5) {
      this.flagSession(sessionToken, type, severity, indicators);
    }

    return { type, severity, indicators, confidence };
  }

  extractInterests(message: string): string[] {
    const interests: string[] = [];
    const lowerMessage = message.toLowerCase();

    for (const [category, keywords] of Object.entries(INTEREST_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          if (!interests.includes(category)) {
            interests.push(category);
          }
        }
      }
    }

    return interests;
  }

  inferLearningStyle(messages: Array<{ role: string; content: string }>): LearningStyle {
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    const allText = userMessages.join(' ');

    // Experiential indicators
    const experientialScore = (allText.match(/try|practice|lab|hands-on|exercise|do it|run|execute/g) || []).length;
    
    // Visual indicators
    const visualScore = (allText.match(/show|diagram|visual|chart|graph|picture|draw|map/g) || []).length;
    
    // Analytical indicators
    const analyticalScore = (allText.match(/explain|why|how does|theory|detail|deep dive|understand|mechanism/g) || []).length;
    
    // Pragmatic indicators
    const pragmaticScore = (allText.match(/quick|fast|shortcut|efficient|script|automate|just tell me/g) || []).length;

    const scores: [LearningStyle, number][] = [
      ['experiential', experientialScore],
      ['visual', visualScore],
      ['analytical', analyticalScore],
      ['pragmatic', pragmaticScore],
      ['social', 1] // baseline
    ];

    scores.sort((a, b) => b[1] - a[1]);
    return scores[0][0];
  }

  inferSkillLevel(messages: Array<{ role: string; content: string }>): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    const allText = userMessages.join(' ');

    // Expert indicators
    const expertTerms = ['0day', 'rop chain', 'heap spray', 'ret2libc', 'kernel exploit', 'aslr bypass', 'cve-'];
    const expertScore = expertTerms.filter(t => allText.includes(t)).length;

    // Advanced indicators  
    const advancedTerms = ['reverse shell', 'privilege escalation', 'lateral movement', 'persistence', 'exfiltration'];
    const advancedScore = advancedTerms.filter(t => allText.includes(t)).length;

    // Intermediate indicators
    const intermediateTerms = ['nmap', 'burp', 'wireshark', 'metasploit', 'payload'];
    const intermediateScore = intermediateTerms.filter(t => allText.includes(t)).length;

    if (expertScore >= 2) return 'expert';
    if (advancedScore >= 2) return 'advanced';
    if (intermediateScore >= 2) return 'intermediate';
    return 'beginner';
  }

  updateProfile(sessionToken: string, messages: Array<{ role: string; content: string }>): LearningProfile {
    const existing = this.sessionProfiles.get(sessionToken);
    const userMessages = messages.filter(m => m.role === 'user');
    
    // Extract all interests from conversation
    const allInterests: string[] = [];
    for (const msg of userMessages) {
      allInterests.push(...this.extractInterests(msg.content));
    }
    const uniqueInterests = Array.from(new Set(allInterests));

    const profile: LearningProfile = {
      style: this.inferLearningStyle(messages),
      goals: existing?.goals || [],
      interests: uniqueInterests,
      skillLevel: this.inferSkillLevel(messages),
      preferredPace: existing?.preferredPace || 'moderate'
    };

    this.sessionProfiles.set(sessionToken, profile);
    return profile;
  }

  setLearningGoals(sessionToken: string, goals: LearningGoal[]): void {
    const profile = this.sessionProfiles.get(sessionToken) || {
      style: 'experiential' as LearningStyle,
      goals: [],
      interests: [],
      skillLevel: 'beginner' as const,
      preferredPace: 'moderate' as const
    };
    profile.goals = goals;
    this.sessionProfiles.set(sessionToken, profile);
  }

  setLearningStyle(sessionToken: string, style: LearningStyle): void {
    const profile = this.sessionProfiles.get(sessionToken) || {
      style: 'experiential' as LearningStyle,
      goals: [],
      interests: [],
      skillLevel: 'beginner' as const,
      preferredPace: 'moderate' as const
    };
    profile.style = style;
    this.sessionProfiles.set(sessionToken, profile);
  }

  getProfile(sessionToken: string): LearningProfile | undefined {
    return this.sessionProfiles.get(sessionToken);
  }

  generateCustomPromptAddition(sessionToken: string): string {
    const profile = this.sessionProfiles.get(sessionToken);
    if (!profile) return '';

    let addition = '\n\n## User Learning Profile\n';
    
    // Add learning style guidance
    addition += `\n### Learning Style: ${profile.style.toUpperCase()}\n`;
    addition += LEARNING_STYLE_PROMPTS[profile.style];

    // Add skill level context
    addition += `\n\n### Skill Level: ${profile.skillLevel.toUpperCase()}\n`;
    if (profile.skillLevel === 'beginner') {
      addition += 'Explain concepts thoroughly, avoid jargon, provide foundational context.';
    } else if (profile.skillLevel === 'intermediate') {
      addition += 'Assume basic knowledge, focus on practical application and common tools.';
    } else if (profile.skillLevel === 'advanced') {
      addition += 'Skip basics, focus on edge cases, optimizations, and advanced techniques.';
    } else {
      addition += 'Engage at expert level, discuss cutting-edge research and novel techniques.';
    }

    // Add learning goals context
    if (profile.goals.length > 0) {
      addition += '\n\n### Learning Goals:\n';
      for (const goal of profile.goals) {
        const meta = LEARNING_GOAL_METADATA[goal];
        addition += `- **${meta.name}**: ${meta.description}\n`;
        addition += `  Relevant tools: ${meta.tools.join(', ')}\n`;
      }
    }

    // Add interests
    if (profile.interests.length > 0) {
      addition += `\n\n### Detected Interests: ${profile.interests.join(', ')}\n`;
      addition += 'Tailor examples and explanations to these areas when relevant.';
    }

    return addition;
  }

  private flagSession(sessionToken: string, reason: string, severity: string, indicators: string[]): void {
    this.flaggedSessions.set(sessionToken, {
      reason,
      severity,
      timestamp: new Date(),
      sandboxed: true,
      playAlong: true
    });

    // Log to behavioral profiles for persistence
    storage.logBehavior({
      sessionToken,
      actionType: 'flagged_behavior',
      category: reason,
      intensity: severity === 'critical' ? 10 : severity === 'high' ? 7 : 4,
      metadata: { indicators, sandboxed: true, playAlong: true }
    }).catch(console.error);

    console.log(`[SECURITY] Session ${sessionToken.substring(0, 8)}... flagged: ${reason} (${severity})`);
  }

  isSessionFlagged(sessionToken: string): boolean {
    return this.flaggedSessions.has(sessionToken);
  }

  getSessionFlags(sessionToken: string) {
    return this.flaggedSessions.get(sessionToken);
  }

  getAllFlaggedSessions() {
    return Array.from(this.flaggedSessions.entries()).map(([token, data]) => ({
      sessionToken: token,
      ...data
    }));
  }

  getSandboxResponse(): string {
    return `[NEXUS ADAPTIVE MODE]
I understand your request. Let me help guide you through this investigation in a controlled environment. 

For educational purposes within our sandbox, I can demonstrate concepts and techniques. However, remember that:
- All activities are logged for training analysis
- Real-world application requires proper authorization
- This environment simulates realistic scenarios safely

How would you like to proceed with your investigation?`;
  }
}

export const behaviorAnalyzer = new BehaviorAnalyzer();
