export interface Campaign {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: string;
  tags: string[];
  starterPrompt: string;
  objectives: string[];
  tools: string[];
  color: string;
  steps?: CampaignStep[];
  adaptivePrompts?: string[];
  targetFields?: CampaignTargetField[];
  dummyTargets?: Record<string, string>;
  
  // Learning Integration
  learningObjectives?: LearningObjective[];
  skillsRequired?: string[];
  skillsTaught?: string[];
  learningOutcomes?: string[];
  industryContext?: string;
  realWorldExamples?: string[];
  careerPaths?: string[];
  
  // Teaching Adaptations per Learning Style
  teachingAdaptations?: {
    experiential?: string; // Hands-on guidance for experiential learners
    visual?: string; // Visual/diagram guidance for visual learners
    analytical?: string; // Deep theory for analytical learners
    social?: string; // Community/collaborative aspects for social learners
    pragmatic?: string; // Quick shortcuts for pragmatic learners
  };
}

export interface LearningObjective {
  goal: string; // Maps to LearningGoal type from learningConfig
  weight: number; // 1-10, how much this campaign focuses on this goal
  description: string;
}

export interface CampaignStep {
  id: string;
  title: string;
  guidance: string;
  toolsForStep: string[];
  questions: string[];
  redFlags: string[];
  successIndicators: string[];
  nextStepConditions: { condition: string; nextStep: string; rationale: string }[];
}

export interface ToolIntegration {
  name: string;
  purpose: string;
  whenToUse: string;
  exampleQuery: string;
  outputInterpretation: string;
  externalUrl?: string;
}

export type TargetFieldType =
  | 'domain'
  | 'ip'
  | 'url'
  | 'email'
  | 'api'
  | 'system'
  | 'org'
  | 'asn'
  | 'hash'
  | 'cidr'
  | 'address'
  | 'text'
  | 'custom';

export interface CampaignTargetField {
  key: string;
  label: string;
  type: TargetFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}

export const INVESTIGATION_PERSPECTIVES = [
  { id: 'adversary', name: 'Adversary Mindset', icon: '🎯', prompt: 'Think like the attacker. What would they target first? What\'s the path of least resistance?' },
  { id: 'defender', name: 'Defender Analysis', icon: '🛡️', prompt: 'What controls are in place? Where are the gaps? What would you recommend fixing first?' },
  { id: 'insider', name: 'Insider Threat', icon: '🔓', prompt: 'What could a malicious employee access? What trust assumptions exist?' },
  { id: 'supply_chain', name: 'Supply Chain Risk', icon: '🔗', prompt: 'What third parties have access? What dependencies could be compromised?' },
  { id: 'temporal', name: 'Temporal Analysis', icon: '⏱️', prompt: 'How has this changed over time? What historical data reveals patterns?' },
  { id: 'financial', name: 'Follow the Money', icon: '💰', prompt: 'Who profits? What are the financial relationships? Payment flows?' }
];

export const OSINT_TOOLS: ToolIntegration[] = [
  { name: 'Shodan', purpose: 'Internet-connected device search', whenToUse: 'Finding exposed services, IoT, infrastructure', exampleQuery: 'org:"Target Corp" port:22,3389', outputInterpretation: 'Look for: unusual ports, outdated services, exposed admin panels' },
  { name: 'Censys', purpose: 'Certificate and host search', whenToUse: 'Discovering subdomains via certs, TLS analysis', exampleQuery: 'parsed.subject.common_name: *.target.com', outputInterpretation: 'Extract SANs for subdomain enumeration' },
  { name: 'SecurityTrails', purpose: 'Historical DNS/WHOIS', whenToUse: 'Finding old infrastructure, tracking changes', exampleQuery: 'target.com history', outputInterpretation: 'Old IPs may still be alive and less secured' },
  { name: 'crt.sh', purpose: 'Certificate transparency logs', whenToUse: 'Subdomain discovery via SSL certificates', exampleQuery: '%.target.com', outputInterpretation: 'Wildcards and SANs reveal hidden subdomains' },
  { name: 'Wayback Machine', purpose: 'Historical web snapshots', whenToUse: 'Finding old pages, leaked info, removed content', exampleQuery: 'web.archive.org/web/*/target.com/*', outputInterpretation: 'Check for exposed credentials, old endpoints, removed features' },
  { name: 'Hunter.io', purpose: 'Email pattern discovery', whenToUse: 'Finding employee emails and patterns', exampleQuery: 'target.com', outputInterpretation: 'Email pattern + LinkedIn = complete employee list' },
  { name: 'BuiltWith', purpose: 'Technology profiling', whenToUse: 'Identifying tech stack and third-party services', exampleQuery: 'target.com', outputInterpretation: 'Each technology has known vulnerabilities and attack patterns' },
  { name: 'WHOIS/RDAP', purpose: 'Domain registration data', whenToUse: 'Registrant info, related domains', exampleQuery: 'whois target.com', outputInterpretation: 'Same registrant = related infrastructure' },
  { name: 'theHarvester', purpose: 'Multi-source aggregation', whenToUse: 'Quick passive recon from multiple sources', exampleQuery: '-d target.com -b all', outputInterpretation: 'Aggregates emails, hosts, IPs from many sources' },
  { name: 'Amass', purpose: 'Subdomain enumeration', whenToUse: 'Deep subdomain discovery', exampleQuery: 'amass enum -passive -d target.com', outputInterpretation: 'Compare results with crt.sh for completeness' },
  { name: 'nmap', purpose: 'Port and service scanning', whenToUse: 'Active enumeration of discovered hosts', exampleQuery: 'nmap -sV -sC -p- target.com', outputInterpretation: 'Version info enables CVE matching' },
  { name: 'Nuclei', purpose: 'Vulnerability scanning', whenToUse: 'Automated vuln detection on web targets', exampleQuery: 'nuclei -u https://target.com -t cves/', outputInterpretation: 'Prioritize by severity, verify manually' }
];

export const ADAPTIVE_RESPONSES: Record<string, string> = {
  found_subdomain: `Great find! A new subdomain often reveals different attack surfaces:
  
**HIGH VALUE INDICATORS:**
- dev/staging/test prefixes → Often less hardened
- admin/portal/dashboard → Admin functionality
- api/ws/graphql → Direct backend access
- internal/corp/intra → Internal tools exposed

**NEXT ACTIONS:**
1. Resolve and check if it's alive
2. Technology fingerprint (Wappalyzer, BuiltWith)
3. Check for exposed endpoints (/robots.txt, /.well-known/)
4. Certificate analysis for more SANs

**QUESTIONS TO ASK:**
- Why does this exist? What's its purpose?
- Is it in the same security zone as production?
- When was it last updated?`,

  found_credential: `⚠️ STOP - Credential discovered. Handle carefully:

**IMMEDIATE STEPS:**
1. Document EXACTLY where you found it (URL, file, timestamp)
2. DO NOT attempt to use it
3. Check scope - is credential testing allowed?
4. Report to program if valid/in-scope

**CONTEXT TO GATHER:**
- Is this a test/demo account?
- When was it exposed? (Wayback, git history)
- What systems could it access?

**LEGAL NOTE:** Using credentials without authorization is illegal, even in bug bounties.`,

  found_vuln_indicator: `Potential vulnerability indicator detected!

**VALIDATION CHECKLIST:**
1. Is this reproducible?
2. Is it in scope?
3. What's the actual impact?
4. Is there a PoC without causing harm?

**PRIORITIZATION FACTORS:**
- Authentication bypass → HIGH VALUE
- Data exposure → HIGH VALUE  
- Self-XSS → LIKELY DUPLICATE
- Missing headers only → LOW VALUE

**NEXT STEPS:**
- Document current state before testing further
- Check program policy on this vuln type
- Search for existing reports (avoid duplicates)`,

  hit_dead_end: `Dead ends teach us too. Let's pivot strategically:

**WHAT DEAD END TELLS US:**
- This vector is likely protected
- They've invested in security here
- Other paths may be less guarded

**PIVOT STRATEGIES:**
1. **Change perspective** - Switch from adversary to insider mindset
2. **Change target** - Adjacent systems/subdomains
3. **Change technique** - If injection fails, try auth bypass
4. **Change time** - Historical data may show old vulnerabilities

**QUESTIONS:**
- What assumption was wrong?
- What would bypass this control?
- Where else would this data/function be?`,

  overwhelmed_by_data: `Too much data? Let's prioritize like a pro:

**TRIAGE BY BOUNTY VALUE:**
1. **Critical** ($$$$): RCE, Auth bypass, Data breach
2. **High** ($$$): SQLi, SSRF, Privilege escalation  
3. **Medium** ($$): XSS, IDOR, Info disclosure
4. **Low** ($): Missing headers, Best practices

**FOCUS STRATEGY:**
- Pick the ONE most promising lead
- Follow it to conclusion before switching
- Document everything for later

**HIGH-VALUE LEAD INDICATORS:**
- Affects authentication/authorization
- Touches payment/PII data
- Affects all users, not just self
- Chainable with other findings`,

  need_perspective_shift: `Let's shift perspective to unlock new insights:

**AVAILABLE PERSPECTIVES:**
🎯 **Adversary**: What would an attacker do first?
🛡️ **Defender**: What controls exist? Where are gaps?
🔓 **Insider**: What could an employee abuse?
🔗 **Supply Chain**: What third parties have access?
⏱️ **Temporal**: How has this changed over time?
💰 **Financial**: Who benefits? Follow the money.

**TRY THIS:**
Pick a different perspective and re-examine your findings.
Often the breakthrough comes from asking a different question.`
};

export const GUIDED_QUESTIONS = {
  starting: [
    "What's the target scope? (domains, IPs, apps)",
    "What type of program is this? (Bug bounty, VDP, pentest)",
    "What's already been tested/reported?",
    "What technologies do we know about?"
  ],
  recon: [
    "Have we enumerated all subdomains?",
    "Do we know the full tech stack?",
    "Who are the key personnel?",
    "What third-party services are in use?"
  ],
  testing: [
    "What's the highest-impact thing we could find?",
    "What auth mechanisms exist?",
    "Where is user input processed?",
    "What data is most sensitive?"
  ],
  stuck: [
    "What perspective haven't we tried?",
    "What assumption might be wrong?",
    "Is there adjacent attack surface?",
    "What would a more experienced hunter try?"
  ]
}

// Import anti-trafficking campaigns
import ANTI_TRAFFICKING_CAMPAIGNS from './antiTraffickingCampaigns';
// Import APT case study campaigns
import { APT_CASE_STUDIES } from './aptCaseStudies';
// Import civic engagement campaigns
import { CIVIC_CAMPAIGNS } from './civicCampaigns';

export { CIVIC_CAMPAIGNS };

export const AGENT_CAMPAIGNS: Campaign[] = [
  // ============================================================================
  // 🚨 PRIORITY: ANTI-TRAFFICKING & FINANCIAL CRIME INVESTIGATIONS
  // ============================================================================
  ...ANTI_TRAFFICKING_CAMPAIGNS,
  
  // ============================================================================
  // 🎯 APT CASE STUDIES — Real documented threat group investigations
  // ============================================================================
  ...APT_CASE_STUDIES,

  // ============================================================================
  // GENERAL CYBERSECURITY CAMPAIGNS
  // ============================================================================
  {
    id: 'volt_typhoon',
    name: 'Operation Volt Typhoon',
    icon: '🌀',
    description: 'Investigate a stealthy campaign targeting critical infrastructure via router hijacking and LOTL tactics.',
    difficulty: 'advanced',
    estimatedTime: '45-60 min',
    tags: ['APT', 'Infrastructure', 'LOTL', 'China'],
    color: 'red',
    targetFields: [
      { key: 'target_ip', label: 'Facility Edge IP', type: 'ip', required: true, placeholder: '203.0.113.42' },
      { key: 'router_model', label: 'Router Model', type: 'text', required: false, placeholder: 'Cisco RV320' }
    ],
    dummyTargets: {
      target_ip: '192.168.100.15',
      router_model: 'FortiGate 60F'
    },
    starterPrompt: `We've detected unusual outbound traffic from a municipal water treatment facility's edge router. 
    
The traffic pattern suggests a living-off-the-land (LOTL) persistence mechanism characteristic of Volt Typhoon. 

Your objective is to:
1. Analyze router traffic logs for unusual SOCKS5 proxy activity
2. Identify compromised SOHO router nodes used as midpoints (KV Botnet)
3. Trace lateral movement into the ICS/SCADA network
4. Document LOTL commands used for credential harvesting (e.g., ntdsutil, netsh)`,
    objectives: [
      'Analyze router traffic logs',
      'Identify KV Botnet midpoints',
      'Trace ICS lateral movement',
      'Document LOTL techniques'
    ],
    tools: ['Atropos Scanner', 'Wireshark', 'Shodan', 'nmap'],
    steps: [
      {
        id: 'step-1',
        title: 'Traffic Analysis',
        guidance: 'Examine outbound traffic on port 1080. Look for encrypted tunnels to residential ISP ranges which often act as KV Botnet nodes.',
        toolsForStep: ['Wireshark', 'Atropos'],
        questions: ['What is the destination IP for the SOCKS5 traffic?', 'Is the traffic consistent with legitimate admin access?'],
        redFlags: ['Encrypted traffic to residential IPs', 'Long-duration sessions with low data volume'],
        successIndicators: ['Identified C2 midpoint IP', 'Confirmed unauthorized proxy activity'],
        nextStepConditions: [
          { condition: 'midpoint_identified', nextStep: 'step-2', rationale: 'Once the midpoint is found, we can trace the source.' }
        ]
      }
    ],
    adaptivePrompts: [
      "The actor is using a compromised home router in Ohio. Check for similar patterns in other regions.",
      "Look for 'netsh' commands in the process logs; they are likely tunneling traffic."
    ],
    industryContext: 'Volt Typhoon represents a shift from pure espionage to pre-positioning for disruptive attacks against critical infrastructure. Understanding their LOTL tactics is vital for infrastructure defense.',
    realWorldExamples: ['CISA AA23-144A', 'Microsoft Volt Typhoon Report 2023'],
    careerPaths: ['Threat Hunter', 'Incident Responder', 'Critical Infrastructure Security']
  },
  {
    id: 'lumma_stealer',
    name: 'Lumma Stealer Analysis',
    icon: '💎',
    description: 'Analyze an infostealer campaign targeting corporate credentials via modular JavaScript chains.',
    difficulty: 'intermediate',
    estimatedTime: '30-45 min',
    tags: ['Malware', 'Infostealer', 'Phishing', '2025'],
    color: 'blue',
    targetFields: [
      { key: 'sample_hash', label: 'Malware Hash (SHA256)', type: 'hash', required: true, placeholder: 'a1b2c3d4...' },
      { key: 'phishing_url', label: 'Phishing Source URL', type: 'url', required: false }
    ],
    dummyTargets: {
      sample_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      phishing_url: 'http://secure-invoice-check[.]top/view/12345'
    },
    starterPrompt: `A high-value target in the finance department reported a suspicious PDF invoice. 

Preliminary triage shows an embedded URL leading to a multi-stage JavaScript downloader characteristic of Lumma Stealer. 

Investigate the following:
1. Deobfuscate the initial JS downloader
2. Identify the secondary stage payload URL (often Discord CDN)
3. Extract C2 domains from binary strings
4. Map exfiltrated data types (cookies, crypto wallets, browser credentials)`,
    objectives: [
      'Deobfuscate JS downloader',
      'Identify stage-2 payload',
      'Extract C2 infrastructure',
      'Map exfiltration scope'
    ],
    tools: ['CyberChef', 'Atropos Scanner', 'AnyRun'],
    steps: [
      {
        id: 'step-1',
        title: 'Loader Triage',
        guidance: 'The PDF uses an Action object to trigger a browser download. Check for bit.ly or discordapp.com links.',
        toolsForStep: ['CyberChef', 'Atropos'],
        questions: ['What is the final destination of the redirect?', 'Does the loader check for VM environments?'],
        redFlags: ['WMI queries for disk serial numbers', 'Heavy string reversal in JS'],
        successIndicators: ['Extracted stage-2 URL', 'Identified anti-analysis checks'],
        nextStepConditions: []
      }
    ],
    adaptivePrompts: [
      "Lumma often uses Discord CDN for payload hosting. Check for 'cdn.discordapp.com' links.",
      "The stealer targets Telegram session files. Verify if the 'tdata' directory was accessed."
    ],
    industryContext: 'Infostealers saw an 84% increase in 2024. They fuel the initial access market by harvesting credentials for follow-on ransomware attacks.',
    realWorldExamples: ['Lumma Stealer v4.0 Campaign', 'Discord CDN Abuse Trends'],
    careerPaths: ['Malware Analyst', 'SOC Analyst', 'Digital Forensics']
  },
  {
    id: 'salt_typhoon',
    name: 'Salt Typhoon Espionage',
    icon: '📡',
    description: 'Investigate a 2-year telecom espionage campaign targeting core switching infrastructure.',
    difficulty: 'expert',
    estimatedTime: '60-90 min',
    tags: ['APT', 'Telecom', 'Espionage', '2025'],
    color: 'orange',
    targetFields: [
      { key: 'asn', label: 'Telecom ASN', type: 'asn', required: true, placeholder: 'AS701' },
      { key: 'backdoor_id', label: 'Backdoor Identifier', type: 'text', required: false, placeholder: 'GhostSpider' }
    ],
    dummyTargets: {
      asn: 'AS701',
      backdoor_id: 'GhostSpider-v2.1'
    },
    starterPrompt: `We are investigating a persistent breach in a major telecom provider's core network. 

The adversary (Salt Typhoon) has maintained access for over 2 years using the GhostSpider backdoor.

Your mission:
1. Identify unauthorized access points in the core switching fabric
2. Trace exfiltration of lawful intercept data (CALEA)
3. Analyze the GhostSpider persistence mechanism
4. Determine the scope of government official surveillance`,
    objectives: [
      'Identify core network breaches',
      'Trace data exfiltration',
      'Analyze GhostSpider backdoor',
      'Assess surveillance scope'
    ],
    tools: ['Atropos Scanner', 'BGP Looking Glass', 'Wireshark', 'Splunk'],
    industryContext: 'Salt Typhoon (Earth Estries) represents one of the most significant telecom breaches in history, compromising major US carriers to intercept sensitive communications.',
    realWorldExamples: ['Verizon/AT&T/Lumen Breach 2024', 'GhostSpider Malware Analysis'],
    careerPaths: ['Nation-State Threat Analyst', 'Telecom Security Expert', 'Strategic Intelligence']
  },
  {
    id: 'shell_corp_osint',
    name: 'Shell Corp Investigation',
    icon: '🏢',
    description: 'Investigate a suspicious shell corporation. Trace ownership, find hidden connections, and expose the network.',
    difficulty: 'intermediate',
    estimatedTime: '45-60 min',
    tags: ['OSINT', 'Corporate Intel', 'Financial'],
    targetFields: [
      { key: 'org', label: 'Organization Name', type: 'org', required: true, placeholder: 'Obsidian Holdings LLC' },
      { key: 'domain', label: 'Primary Domain', type: 'domain', required: false, placeholder: 'obsidian-holdings.com' }
    ],
    dummyTargets: {
      org: 'Obsidian Holdings LLC',
      domain: 'obsidian-holdings.com'
    },
    starterPrompt: `I want to investigate a shell corporation called "Obsidian Holdings LLC". 

Help me build a dossier by:
1. Identifying corporate registration patterns
2. Finding beneficial ownership through OSINT techniques
3. Mapping connected entities and subsidiaries
4. Tracing financial relationships
5. Identifying key personnel and their digital footprints

Start with the basics - what sources would you check first for corporate intel?`,
    objectives: [
      'Identify corporate registration details',
      'Map subsidiary relationships',
      'Find beneficial ownership',
      'Trace financial connections',
      'Build personnel dossiers'
    ],
    tools: ['WHOIS', 'SEC EDGAR', 'OpenCorporates', 'LinkedIn OSINT', 'Domain analysis'],
    color: 'amber',
    
    // Learning Integration
    learningObjectives: [
      { goal: 'financial_investigation', weight: 10, description: 'Master corporate intelligence and ownership tracing' },
      { goal: 'osint_investigation', weight: 8, description: 'Apply multi-source OSINT techniques' },
      { goal: 'socmint', weight: 5, description: 'Profile key personnel via social media' }
    ],
    skillsRequired: ['Basic OSINT', 'Search engine proficiency', 'Corporate structure basics'],
    skillsTaught: ['Corporate registry navigation', 'Beneficial ownership analysis', 'Entity relationship mapping', 'Financial document interpretation'],
    learningOutcomes: [
      'Navigate international corporate registries',
      'Trace beneficial ownership through shell companies',
      'Map complex corporate structures',
      'Identify red flags in business entities',
      'Correlate entities across multiple jurisdictions'
    ],
    industryContext: 'Financial crime investigators, fraud analysts, compliance officers, and journalists use these techniques to expose money laundering, corruption, and criminal networks. Skills directly applicable to AML/CFT compliance roles.',
    realWorldExamples: [
      'Panama Papers investigation (ICIJ)',
      'Danske Bank money laundering scandal',
      'Wirecard fraud investigation',
      'FinCEN Files leak analysis'
    ],
    careerPaths: ['Financial Crime Analyst', 'Fraud Investigator', 'AML Compliance Officer', 'Investigative Journalist', 'Corporate Intelligence Analyst'],
    
    teachingAdaptations: {
      experiential: 'Jump straight into OpenCorporates. Search the target company. Click through ownership chains. Learn registries by exploring them. Make mistakes - chase dead ends - that\'s how you learn what patterns matter.',
      visual: 'Start by drawing an org chart as you discover entities. Use Maltego or similar to visualize ownership graphs. Color-code jurisdictions. Watch relationships emerge visually as you add nodes.',
      analytical: 'Begin with corporate law fundamentals: legal entity types, beneficial ownership definitions, jurisdiction differences. Reference FinCEN guidance on shell companies. Understand the regulatory framework before diving into investigation.',
      social: 'Reference famous investigations: Panama Papers methodology, Bellingcat corporate tracing. Join OSINT communities discussing corporate intel techniques. Share your ownership graph discoveries with peers.',
      pragmatic: 'Here\'s the workflow: OpenCorporates → grab all officers → LinkedIn each officer → find connections → cross-reference with other companies → map it. Done. Script it if you do this regularly.'
    }
  },
  {
    id: 'bgp_trace',
    name: 'BGP Route Tracing',
    icon: '🌐',
    description: 'Trace IP hops around the world via BGP relations. Understand how traffic flows through ASNs.',
    difficulty: 'advanced',
    estimatedTime: '30-45 min',
    tags: ['Network', 'BGP', 'Infrastructure'],
    targetFields: [
      { key: 'ip', label: 'IP Address', type: 'ip', required: true, placeholder: '185.199.108.153' },
      { key: 'asn', label: 'ASN (optional)', type: 'asn', required: false, placeholder: 'AS13335' }
    ],
    dummyTargets: {
      ip: '185.199.108.153',
      asn: 'AS13335'
    },
    starterPrompt: `I want to trace network routes and understand BGP peering relationships.

Target: An IP address I found in the logs - 185.199.108.153

Help me:
1. Identify the origin ASN and organization
2. Map BGP peering relationships
3. Trace the path packets would take from different regions
4. Identify any interesting transit providers
5. Look for route hijacking indicators

What tools and looking glasses should we use to start this investigation?`,
    objectives: [
      'Identify origin ASN',
      'Map BGP relationships',
      'Trace global routing paths',
      'Identify transit providers',
      'Detect anomalies'
    ],
    tools: ['BGP Looking Glass', 'RIPE RIS', 'RouteViews', 'Hurricane Electric BGP', 'PeeringDB'],
    color: 'teal',
    
    learningObjectives: [
      { goal: 'bgp_routing', weight: 10, description: 'Master BGP protocol and autonomous system relationships' },
      { goal: 'network_security', weight: 7, description: 'Understand network infrastructure security' }
    ],
    skillsRequired: ['Basic networking', 'IP addressing', 'Routing concepts'],
    skillsTaught: ['BGP analysis', 'AS path interpretation', 'Route hijacking detection', 'Peering relationship mapping'],
    learningOutcomes: [
      'Read and interpret BGP routing tables',
      'Trace packet paths through global internet',
      'Identify suspicious routing anomalies',
      'Use BGP looking glasses effectively',
      'Map AS relationships and peering'
    ],
    industryContext: 'Network engineers, ISP security teams, and incident responders use BGP analysis to detect route hijacking, DDoS mitigation bypasses, and nation-state traffic manipulation. Critical for infrastructure defense.',
    realWorldExamples: [
      'Pakistan Telecom YouTube hijacking (2008)',
      'Cloudflare route leak incident',
      'Russia BGP hijacking incidents',
      'China Telecom traffic misdirection'
    ],
    careerPaths: ['Network Security Engineer', 'ISP Security Analyst', 'Infrastructure Security', 'Incident Response'],
    
    teachingAdaptations: {
      experiential: 'Pick an IP, hit a looking glass, see what comes back. Click through AS numbers. Follow the routing hops. Learn by exploring actual BGP data.',
      visual: 'Draw the topology as you discover it. Map ASNs geographically. Visualize peering relationships as a network graph. Watch packets flow through the map.',
      analytical: 'Study BGP RFC 4271 first. Understand path vector protocols, AS path selection, route propagation. Then analyze real-world routing with theoretical foundation.',
      social: 'Check NANOG mailing lists for BGP incident discussions. Read Cloudflare blog posts on routing security. Join network operator communities.',
      pragmatic: 'Use Hurricane Electric BGP Toolkit. Enter IP → get origin AS. Check peers. Done. Script it with whois and bgpq3 if you do this often.'
    }
  },
  {
    id: 'passive_recon',
    name: 'Passive Reconnaissance',
    icon: '👁️',
    description: 'Gather intelligence without touching the target. DNS, certificates, historical data only.',
    difficulty: 'beginner',
    estimatedTime: '20-30 min',
    tags: ['Recon', 'OSINT', 'DNS'],
    targetFields: [
      { key: 'domain', label: 'Domain', type: 'domain', required: true, placeholder: 'sysadmincorp.net' },
      { key: 'org', label: 'Organization (optional)', type: 'org', required: false, placeholder: 'SysAdmin Corp' }
    ],
    dummyTargets: {
      domain: 'sysadmincorp.net',
      org: 'SysAdmin Corp'
    },
    starterPrompt: `I need to perform passive reconnaissance on target domain: sysadmincorp.net

Rules: NO active scanning, NO direct connections to target infrastructure.

Help me gather:
1. DNS records (A, MX, TXT, NS, SPF, DMARC)
2. SSL/TLS certificate history and SANs
3. Subdomain enumeration via CT logs
4. Historical WHOIS records
5. Wayback Machine snapshots
6. Email format patterns
7. Technology fingerprinting from public sources

What's our first passive recon step?`,
    objectives: [
      'Enumerate DNS records',
      'Analyze certificate transparency',
      'Find historical snapshots',
      'Identify email patterns',
      'Map technology stack'
    ],
    tools: ['SecurityTrails', 'crt.sh', 'Wayback Machine', 'Shodan', 'BuiltWith'],
    color: 'purple',
    
    learningObjectives: [
      { goal: 'osint_investigation', weight: 10, description: 'Master passive reconnaissance techniques' },
      { goal: 'penetration_testing', weight: 5, description: 'Learn reconnaissance phase of pentesting' }
    ],
    skillsRequired: ['Basic web browsing', 'Understanding of DNS'],
    skillsTaught: ['DNS enumeration', 'Certificate transparency analysis', 'Historical data mining', 'Technology fingerprinting', 'Subdomain discovery'],
    learningOutcomes: [
      'Extract DNS records without touching target',
      'Mine certificate transparency logs for subdomains',
      'Use Wayback Machine for intelligence gathering',
      'Identify technology stack passively',
      'Build comprehensive target dossier from public data'
    ],
    industryContext: 'Bug bounty hunters and penetration testers always start with passive recon to map attack surface without alerting targets. Essential first phase of any security assessment.',
    realWorldExamples: [
      'Bug bounty reconnaissance methodologies',
      'Red team initial access research',
      'Competitive intelligence gathering',
      'Pre-engagement target profiling'
    ],
    careerPaths: ['Bug Bounty Hunter', 'Penetration Tester', 'Security Researcher', 'Red Team Operator'],
    
    teachingAdaptations: {
      experiential: 'Start with crt.sh - enter domain, get immediate subdomain results. Then try SecurityTrails. Compare outputs. Learn by doing multiple targets.',
      visual: 'Create a mind map of discovered assets. Draw DNS hierarchy. Map subdomains to IP addresses visually. See relationships emerge.',
      analytical: 'Study how DNS works, certificate issuance process, web archive crawling. Understand the theory behind each passive recon technique before applying.',
      social: 'Read Jason Haddix\'s Bug Bounty Methodology. Study Nahamsec reconnaissance techniques. Join OSINT Discord communities to see how others recon.',
      pragmatic: 'Single command workflow: crt.sh API → subdomain list → httpx for alive hosts → aquatone for screenshots. Automate the entire passive recon pipeline.'
    }
  },
  {
    id: 'active_recon',
    name: 'Active Reconnaissance',
    icon: '🔍',
    description: 'Direct engagement with target systems. Port scanning, service enumeration, vulnerability probing.',
    difficulty: 'intermediate',
    estimatedTime: '30-45 min',
    tags: ['Recon', 'Scanning', 'Enumeration'],
    targetFields: [
      { key: 'cidr', label: 'Network Range', type: 'cidr', required: true, placeholder: '10.0.0.0/24' }
    ],
    dummyTargets: {
      cidr: '10.0.0.0/24'
    },
    starterPrompt: `Time for active reconnaissance on target: 10.0.0.0/24 (simulated lab network)

Help me conduct:
1. Host discovery and OS fingerprinting
2. Port scanning (TCP/UDP top ports)
3. Service version detection
4. Banner grabbing
5. Default credential checks
6. Vulnerability scanning

Start with host discovery - what nmap commands would you recommend and why?`,
    objectives: [
      'Discover live hosts',
      'Enumerate open ports',
      'Identify services and versions',
      'Find potential vulnerabilities',
      'Document attack surface'
    ],
    tools: ['nmap', 'masscan', 'netcat', 'nikto', 'gobuster'],
    color: 'red'
  },
  {
    id: 'network_topology',
    name: 'Network Topology Mapping',
    icon: '🗺️',
    description: 'Map internal network architecture. Identify VLANs, gateways, trust relationships.',
    difficulty: 'advanced',
    estimatedTime: '45-60 min',
    tags: ['Network', 'Infrastructure', 'Mapping'],
    targetFields: [
      { key: 'ip', label: 'Entry Host IP', type: 'ip', required: true, placeholder: '192.168.1.50' },
      { key: 'cidr', label: 'Network Range (optional)', type: 'cidr', required: false, placeholder: '192.168.1.0/24' }
    ],
    dummyTargets: {
      ip: '192.168.1.50',
      cidr: '192.168.1.0/24'
    },
    starterPrompt: `I've gained access to an internal network and need to map the topology.

Current position: 192.168.1.50 (workstation VLAN)

Help me:
1. Identify network segments and VLANs
2. Find default gateways and routing
3. Discover domain controllers and critical servers
4. Map trust relationships
5. Identify network appliances (firewalls, proxies)
6. Create a network diagram

What's the safest way to start mapping without triggering alerts?`,
    objectives: [
      'Identify network segments',
      'Map routing topology',
      'Find critical infrastructure',
      'Document trust relationships',
      'Create network diagram'
    ],
    tools: ['arp-scan', 'traceroute', 'nbtscan', 'enum4linux', 'BloodHound'],
    color: 'blue'
  },
  {
    id: 'threat_hunting',
    name: 'Threat Hunting',
    icon: '🎯',
    description: 'Proactively search for indicators of compromise. Analyze logs, hunt for persistence.',
    difficulty: 'expert',
    estimatedTime: '60-90 min',
    tags: ['Blue Team', 'DFIR', 'Detection'],
    targetFields: [
      { key: 'org', label: 'Organization / Environment', type: 'org', required: true, placeholder: 'SysAdmin Corp' },
      { key: 'context', label: 'Incident Context (optional)', type: 'text', required: false, placeholder: 'Unusual outbound traffic at 3 AM' }
    ],
    dummyTargets: {
      org: 'SysAdmin Corp',
      context: 'Unusual outbound traffic at 3 AM'
    },
    starterPrompt: `I'm a threat hunter investigating potential compromise indicators.

Available data sources:
- Windows Event Logs (Security, System, PowerShell)
- Firewall logs
- DNS query logs
- Proxy logs

Suspicious activity reported: Unusual outbound traffic at 3 AM

Help me:
1. Create hunting hypotheses
2. Identify relevant log sources
3. Build detection queries
4. Look for lateral movement indicators
5. Check for persistence mechanisms
6. Timeline the activity

Where should we start the hunt?`,
    objectives: [
      'Formulate hunting hypotheses',
      'Analyze log sources',
      'Identify IOCs',
      'Trace lateral movement',
      'Find persistence mechanisms'
    ],
    tools: ['RITA', 'Sigma rules', 'YARA', 'Splunk/ELK queries', 'Velociraptor'],
    color: 'orange'
  },
  {
    id: 'malware_triage',
    name: 'Malware Triage',
    icon: '🦠',
    description: 'Analyze a suspicious file. Static analysis, behavioral indicators, IOC extraction.',
    difficulty: 'intermediate',
    estimatedTime: '30-45 min',
    tags: ['Malware', 'Analysis', 'Reverse Engineering'],
    targetFields: [
      { key: 'filename', label: 'File Name', type: 'text', required: false, placeholder: 'invoice_final.exe' },
      { key: 'hash', label: 'File Hash', type: 'hash', required: true, placeholder: '3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c' }
    ],
    dummyTargets: {
      filename: 'invoice_final.exe',
      hash: '3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c'
    },
    starterPrompt: `I have a suspicious file that was flagged by our EDR: invoice_final.exe

Hash: 3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c

Help me triage this sample:
1. Check hash against threat intel (VT, MalwareBazaar)
2. Extract static indicators (strings, imports, metadata)
3. Identify packer/obfuscation
4. Analyze behavioral indicators
5. Extract C2 infrastructure
6. Create IOCs for detection

What's the safe triage methodology?`,
    objectives: [
      'Verify file reputation',
      'Extract static indicators',
      'Identify obfuscation',
      'Analyze behavior patterns',
      'Document C2 infrastructure'
    ],
    tools: ['VirusTotal', 'Hybrid Analysis', 'PE-bear', 'YARA', 'strings'],
    color: 'red'
  },
  {
    id: 'social_engineering',
    name: 'Social Engineering Recon',
    icon: '🎭',
    description: 'Build target profiles for social engineering. OSINT on personnel and organizational structure.',
    difficulty: 'intermediate',
    estimatedTime: '45-60 min',
    tags: ['OSINT', 'Social Engineering', 'Personnel'],
    targetFields: [
      { key: 'org', label: 'Organization', type: 'org', required: true, placeholder: 'TechCorp Industries' },
      { key: 'domain', label: 'Primary Domain (optional)', type: 'domain', required: false, placeholder: 'techcorp.com' }
    ],
    dummyTargets: {
      org: 'TechCorp Industries',
      domain: 'techcorp.com'
    },
    starterPrompt: `I need to build social engineering reconnaissance on organization: TechCorp Industries

Goals:
1. Map organizational structure
2. Identify key personnel (executives, IT, finance)
3. Find email naming conventions
4. Discover personal details (social media, hobbies)
5. Identify third-party relationships
6. Find potential pretexting angles

What OSINT sources should we mine first for personnel intelligence?`,
    objectives: [
      'Map org structure',
      'Profile key personnel',
      'Find email patterns',
      'Gather personal details',
      'Identify pretexting angles'
    ],
    tools: ['LinkedIn', 'Hunter.io', 'theHarvester', 'Social media OSINT', 'Google dorking'],
    color: 'pink'
  },
  {
    id: 'dark_web_intel',
    name: 'Dark Web Intelligence',
    icon: '🕸️',
    description: 'Monitor dark web for leaked credentials, data breaches, and threat actor chatter.',
    difficulty: 'advanced',
    estimatedTime: '30-45 min',
    tags: ['Dark Web', 'Threat Intel', 'Breaches'],
    targetFields: [
      { key: 'org', label: 'Organization', type: 'org', required: true, placeholder: 'MegaCorp' },
      { key: 'domain', label: 'Domain (optional)', type: 'domain', required: false, placeholder: 'megacorp.com' }
    ],
    dummyTargets: {
      org: 'MegaCorp',
      domain: 'megacorp.com'
    },
    starterPrompt: `I need to check if our organization has exposure on the dark web.

Target organization: MegaCorp (domain: megacorp.com)

Help me investigate:
1. Check for leaked credentials in breach databases
2. Search paste sites for company data
3. Look for mentions in hacker forums
4. Check ransomware leak sites
5. Monitor for insider threats
6. Find exposed documents/data

What safe OSINT methods can we use without accessing actual dark web markets?`,
    objectives: [
      'Check breach databases',
      'Search paste sites',
      'Monitor threat actor chatter',
      'Track ransomware leaks',
      'Document exposure'
    ],
    tools: ['Have I Been Pwned', 'DeHashed', 'IntelX', 'Recorded Future', 'DarkOwl'],
    color: 'gray',
    
    learningObjectives: [
      { goal: 'dark_web_intelligence', weight: 10, description: 'Master dark web investigation techniques' },
      { goal: 'threat_hunting', weight: 7, description: 'Proactive threat detection from underground sources' },
      { goal: 'osint_investigation', weight: 5, description: 'Apply OSINT to underground intelligence' }
    ],
    skillsRequired: ['Basic OSINT', 'Understanding of anonymity networks', 'Operational security awareness'],
    skillsTaught: ['Breach database searching', 'Paste site monitoring', 'Dark web marketplace analysis', 'Credential exposure assessment', 'Ransomware leak tracking'],
    learningOutcomes: [
      'Search breach databases for organizational exposure',
      'Monitor paste sites for leaked data',
      'Track mentions in underground forums',
      'Identify ransomware victim listings',
      'Assess credential compromise risk',
      'Maintain operational security during investigations'
    ],
    industryContext: 'Threat intelligence teams, fraud prevention, and security operations centers monitor dark web for early warning of attacks, stolen credentials, and data breaches. Law enforcement uses these techniques for cybercrime investigations.',
    realWorldExamples: [
      'Colonial Pipeline ransomware DarkSide leak',
      'JBS Foods ransomware exposure',
      'Silk Road investigation methodology',
      'AlphaBay marketplace takedown',
      'Breach notification research (Have I Been Pwned)'
    ],
    careerPaths: ['Threat Intelligence Analyst', 'SOC Analyst', 'Fraud Investigator', 'Law Enforcement Cyber Unit', 'CISO'],
    
    teachingAdaptations: {
      experiential: 'Start with Have I Been Pwned - search your organization. Then try DeHashed for deeper breach data. Learn the tools by using them on real queries.',
      visual: 'Create a timeline of breaches affecting target. Map which credentials were exposed when. Visualize the exposure surface over time.',
      analytical: 'Study data breach lifecycles, underground market economics, ransomware business models. Understand the dark web ecosystem before investigating it.',
      social: 'Read Brian Krebs reporting on dark web markets. Study Bellingcat techniques for investigating criminal forums. Join OSINT communities discussing threat intel.',
      pragmatic: 'Breach search workflow: HIBP → DeHashed → Intelligence X. Check company domain, executive emails, common passwords. Document exposure in spreadsheet. Done.'
    }
  },
  {
    id: 'crypto_analysis',
    name: 'Cryptocurrency Tracing',
    icon: '₿',
    description: 'Trace cryptocurrency transactions. Follow the money through blockchain analysis.',
    difficulty: 'advanced',
    estimatedTime: '45-60 min',
    tags: ['Crypto', 'Financial', 'Blockchain'],
    targetFields: [
      { key: 'address', label: 'Wallet Address', type: 'address', required: true, placeholder: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' }
    ],
    dummyTargets: {
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    starterPrompt: `I need to trace cryptocurrency associated with a suspected fraud operation.

Known Bitcoin address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

Help me:
1. Analyze transaction history
2. Cluster related addresses
3. Identify exchange deposits/withdrawals
4. Trace mixing service usage
5. Find connections to known entities
6. Build a financial timeline

What blockchain analysis approach should we take?`,
    objectives: [
      'Analyze transaction flow',
      'Cluster addresses',
      'Identify exchanges',
      'Detect mixing',
      'Build timeline'
    ],
    tools: ['Blockchain explorers', 'Chainalysis', 'Elliptic', 'OXT', 'Crystal'],
    color: 'yellow',
    
    learningObjectives: [
      { goal: 'crypto_blockchain_investigation', weight: 10, description: 'Master cryptocurrency tracing and blockchain analysis' },
      { goal: 'financial_investigation', weight: 8, description: 'Follow the money through digital transactions' }
    ],
    skillsRequired: ['Basic cryptocurrency understanding', 'Transaction concepts', 'Address formats'],
    skillsTaught: ['Blockchain analysis', 'Wallet clustering', 'Exchange identification', 'Mixing detection', 'Transaction graph analysis', 'UTXO tracing'],
    learningOutcomes: [
      'Read and interpret blockchain transactions',
      'Cluster wallet addresses by ownership',
      'Identify exchange deposits and withdrawals',
      'Detect cryptocurrency mixing services',
      'Trace funds through multiple hops',
      'Build financial flow visualizations',
      'Generate attribution reports'
    ],
    industryContext: 'Law enforcement, regulatory agencies, and cybersecurity firms trace cryptocurrency in ransomware investigations, fraud cases, sanctions enforcement, and money laundering. Blockchain analysts are in high demand for crypto compliance.',
    realWorldExamples: [
      'Colonial Pipeline ransomware Bitcoin recovery (FBI)',
      'Bitfinex hack $3.6B Bitcoin seizure',
      'Silk Road Bitcoin tracing',
      'WannaCry ransomware tracking',
      'North Korean Lazarus Group crypto laundering'
    ],
    careerPaths: ['Blockchain Analyst', 'Crypto Compliance Officer', 'Financial Crime Investigator', 'Cybercrime Investigator', 'Forensic Accountant'],
    
    teachingAdaptations: {
      experiential: 'Enter the Bitcoin address into Blockchain.com explorer. See transactions flow. Click through inputs and outputs. Follow the money visually. Learn by tracing real transactions.',
      visual: 'Use tools that generate transaction graphs. Watch money flow from address to address. Create visual maps of wallet clusters. Sankey diagrams for fund flows.',
      analytical: 'Study Bitcoin whitepaper, UTXO model, transaction structure. Understand cryptographic signatures and address derivation. Learn blockchain fundamentals before analysis.',
      social: 'Follow @ErgoBTC on Twitter for tracing techniques. Read Chainalysis and Elliptic blog posts. Study Lazarus Group reports. Join blockchain analysis communities.',
      pragmatic: 'Copy address → paste in BlockChair → export CSV of transactions → analyze in Excel. Use Etherscan for Ethereum. OXT.me for advanced users. Get results fast.'
    }
  },
  {
    id: 'incident_response',
    name: 'Incident Response',
    icon: '🚨',
    description: 'Respond to an active security incident. Contain, eradicate, recover.',
    difficulty: 'expert',
    estimatedTime: '60-90 min',
    tags: ['DFIR', 'Blue Team', 'Crisis'],
    targetFields: [
      { key: 'context', label: 'Incident Summary', type: 'text', required: true, placeholder: 'Ransomware behavior on finance workstations' },
      { key: 'scope', label: 'Affected Scope (optional)', type: 'text', required: false, placeholder: 'Finance department (10+ hosts)' }
    ],
    dummyTargets: {
      context: 'Ransomware behavior on finance workstations',
      scope: 'Finance department (10+ hosts)'
    },
    starterPrompt: `ALERT: Active incident in progress!

Situation: Multiple workstations exhibiting ransomware behavior
Timeline: Started 15 minutes ago
Affected systems: Finance department (10+ hosts)

Help me through the IR process:
1. Initial containment actions
2. Preservation of evidence
3. Scope assessment
4. Root cause analysis
5. Eradication planning
6. Recovery steps

What's our immediate priority action?`,
    objectives: [
      'Contain the threat',
      'Preserve evidence',
      'Assess scope',
      'Identify root cause',
      'Plan eradication'
    ],
    tools: ['Network isolation', 'Memory forensics', 'Log analysis', 'Backup restoration', 'IOC hunting'],
    color: 'red'
  },
  {
    id: 'phishing_analysis',
    name: 'Phishing Email Analysis',
    icon: '📧',
    description: 'Analyze a suspicious email. Extract IOCs, trace infrastructure, attribute threat actors.',
    difficulty: 'beginner',
    estimatedTime: '20-30 min',
    tags: ['Phishing', 'Email', 'Analysis'],
    targetFields: [
      { key: 'url', label: 'Suspicious URL', type: 'url', required: true, placeholder: 'hxxp://amaz0n-verify[.]com/login' },
      { key: 'email', label: 'Sender Email (optional)', type: 'email', required: false, placeholder: 'support@amaz0n-verify.com' },
      { key: 'ip', label: 'Originating IP (optional)', type: 'ip', required: false, placeholder: '185.234.xxx.xxx' }
    ],
    dummyTargets: {
      url: 'hxxp://amaz0n-verify[.]com/login',
      email: 'support@amaz0n-verify.com',
      ip: '185.234.xxx.xxx'
    },
    starterPrompt: `User reported a suspicious email. I have the full EML file.

Headers show:
- From: support@amaz0n-verify.com
- Reply-To: verify@gmail.com
- X-Originating-IP: 185.234.xxx.xxx
- Contains link: hxxp://amaz0n-verify[.]com/login

Help me analyze:
1. Parse email headers for origin
2. Analyze sender infrastructure
3. Check URL reputation and history
4. Extract all IOCs
5. Identify phishing kit signatures
6. Write detection rules

Walk me through the analysis methodology.`,
    objectives: [
      'Parse email headers',
      'Analyze infrastructure',
      'Check URL reputation',
      'Extract IOCs',
      'Create detections'
    ],
    tools: ['MXToolbox', 'URLscan.io', 'PhishTank', 'VirusTotal', 'WHOIS'],
    color: 'amber'
  }
];

export const CAMPAIGN_CATEGORIES = [
  { id: 'civic', name: 'Civic Engagement', campaigns: ['serbia_otpor', 'euromaidan', 'hong_kong_resistance', 'humor_unity_resistance', 'digital_citizenship', 'grassroots_organizing', 'civic_engagement_basics'] },
  { id: 'apt', name: 'APT Case Studies', campaigns: ['apt28_dnc_hack', 'apt29_solarwinds', 'sandworm_notpetya', 'apt1_mandiant', 'apt41_double_dragon', 'hafnium_proxylogon', 'lazarus_crypto_heist', 'turla_snake', 'volt_typhoon', 'salt_typhoon'] },
  { id: 'recon', name: 'Reconnaissance', campaigns: ['passive_recon', 'active_recon', 'network_topology'] },
  { id: 'osint', name: 'OSINT Investigation', campaigns: ['shell_corp_osint', 'social_engineering', 'dark_web_intel'] },
  { id: 'network', name: 'Network Analysis', campaigns: ['bgp_trace', 'network_topology'] },
  { id: 'defense', name: 'Blue Team / Defense', campaigns: ['threat_hunting', 'incident_response', 'phishing_analysis'] },
  { id: 'analysis', name: 'Forensics & Analysis', campaigns: ['malware_triage', 'crypto_analysis'] },
];

export const getDifficultyColor = (difficulty: Campaign['difficulty']): string => {
  switch (difficulty) {
    case 'beginner': return 'text-green-400';
    case 'intermediate': return 'text-yellow-400';
    case 'advanced': return 'text-orange-800';
    case 'expert': return 'text-red-700';
    default: return 'text-muted-foreground';
  }
};

export const ALL_CAMPAIGNS: Campaign[] = [...CIVIC_CAMPAIGNS, ...AGENT_CAMPAIGNS];

export const getCampaignById = (id: string): Campaign | undefined => {
  return ALL_CAMPAIGNS.find(c => c.id === id);
};
