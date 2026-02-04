export const BOUNTY_RSS_FEEDS = [
  {
    id: "hackerone-hacktivity",
    name: "HackerOne Hacktivity",
    url: "https://hackerone.com/hacktivity.rss",
    category: "bug_bounty",
    platform: "hackerone",
    icon: "🎯"
  },
  {
    id: "bugcrowd-programs",
    name: "Bugcrowd Programs",
    url: "https://bugcrowd.com/programs.rss",
    category: "bug_bounty",
    platform: "bugcrowd",
    icon: "🐛"
  },
  {
    id: "nvd-cve",
    name: "NVD CVE Feed",
    url: "https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml",
    category: "vulnerability",
    platform: "nvd",
    icon: "🔓"
  },
  {
    id: "us-cert",
    name: "CISA Alerts",
    url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    category: "vulnerability",
    platform: "cisa",
    icon: "🛡️"
  },
  {
    id: "exploit-db",
    name: "Exploit-DB",
    url: "https://www.exploit-db.com/rss.xml",
    category: "vulnerability",
    platform: "exploit-db",
    icon: "💉"
  },
  {
    id: "fbi-cyber",
    name: "FBI Cyber Division",
    url: "https://www.fbi.gov/feeds/fbi-cyber/rss.xml",
    category: "cybercrime",
    platform: "fbi",
    icon: "🔍"
  },
  {
    id: "europol-cybercrime",
    name: "Europol Cybercrime",
    url: "https://www.europol.europa.eu/rss.xml",
    category: "cybercrime",
    platform: "europol",
    icon: "🇪🇺"
  },
  {
    id: "immunefi-web3",
    name: "Immunefi Web3 Bounties",
    url: "https://immunefi.com/bounty/feed",
    category: "bug_bounty",
    platform: "immunefi",
    icon: "⛓️"
  }
];

export const CYBERCRIME_REWARD_PROGRAMS = [
  // US Federal Law Enforcement
  {
    id: "rewards-for-justice",
    name: "Rewards for Justice",
    organization: "US Department of State",
    rewards: "Up to $10,000,000",
    url: "https://rewardsforjustice.net/",
    category: "cybercrime",
    icon: "🎯",
    description: "Foreign state-sponsored cyberattacks, ransomware gangs, election interference"
  },
  {
    id: "fbi-most-wanted-cyber",
    name: "FBI Cyber Most Wanted",
    organization: "FBI",
    rewards: "Up to $5,000,000",
    url: "https://www.fbi.gov/wanted/cyber",
    category: "cybercrime",
    icon: "🔍",
    description: "Most wanted cybercriminals and nation-state hackers"
  },
  {
    id: "fbi-cryptoqueen",
    name: "Cryptoqueen Bounty",
    organization: "FBI",
    rewards: "$5,000,000",
    url: "https://www.fbi.gov/wanted/topten",
    category: "crypto_fraud",
    icon: "👸",
    description: "Ruja Ignatova - OneCoin cryptocurrency fraud"
  },
  {
    id: "secret-service-tocrp",
    name: "Transnational Organized Crime",
    organization: "Secret Service + State Dept",
    rewards: "Up to $10,000,000",
    url: "https://www.secretservice.gov/investigations/mostwanted",
    category: "financial_crime",
    icon: "💳",
    description: "Card fraud, money laundering, transnational cybercrime"
  },
  {
    id: "cisa-vulnerabilities",
    name: "CISA Known Exploited Vulnerabilities",
    organization: "CISA",
    rewards: "Recognition + Disclosure",
    url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
    category: "vulnerability",
    icon: "🛡️",
    description: "Report actively exploited vulnerabilities affecting US infrastructure"
  },
  // Treasury & Financial Crime
  {
    id: "treasury-ofac-sanctions",
    name: "OFAC Sanctions Evasion",
    organization: "US Treasury OFAC",
    rewards: "Up to $5,000,000",
    url: "https://ofac.treasury.gov/",
    category: "sanctions",
    icon: "🏦",
    description: "Sanctions evasion, crypto mixing services, financial crime"
  },
  {
    id: "fincen-money-laundering",
    name: "FinCEN Money Laundering Tips",
    organization: "Financial Crimes Enforcement Network",
    rewards: "Whistleblower percentage",
    url: "https://www.fincen.gov/",
    category: "money_laundering",
    icon: "💰",
    description: "Bank Secrecy Act violations, money laundering schemes"
  },
  {
    id: "doj-kleptocapture",
    name: "KleptoCapture Task Force",
    organization: "Department of Justice",
    rewards: "Asset forfeiture share",
    url: "https://www.justice.gov/opa/pr/attorney-general-merrick-b-garland-announces-launch-task-force-kleptocapture",
    category: "sanctions",
    icon: "⚖️",
    description: "Russian oligarch assets, sanctions evasion, kleptocracy"
  },
  {
    id: "sec-whistleblower",
    name: "SEC Whistleblower Program",
    organization: "Securities and Exchange Commission",
    rewards: "10-30% of sanctions over $1M",
    url: "https://www.sec.gov/whistleblower",
    category: "securities_fraud",
    icon: "📈",
    description: "Securities fraud, insider trading, crypto fraud"
  },
  // Crypto-Specific Bounties
  {
    id: "chainalysis-reactor",
    name: "Chainalysis Crime Intel",
    organization: "Chainalysis",
    rewards: "Intelligence sharing",
    url: "https://www.chainalysis.com/",
    category: "crypto_crime",
    icon: "⛓️",
    description: "Crypto tracing, ransomware payments, mixer services"
  },
  {
    id: "immunefi-web3",
    name: "Immunefi Web3 Bounties",
    organization: "Immunefi",
    rewards: "Up to $10,000,000+",
    url: "https://immunefi.com/",
    category: "web3",
    icon: "🔐",
    description: "DeFi protocol bugs, smart contract vulnerabilities"
  },
  {
    id: "elliptic-intel",
    name: "Elliptic Crypto Investigations",
    organization: "Elliptic",
    rewards: "Intelligence bounties",
    url: "https://www.elliptic.co/",
    category: "crypto_crime",
    icon: "🔬",
    description: "Crypto compliance, sanctions screening, dark web markets"
  },
  // International Law Enforcement
  {
    id: "interpol-cyber",
    name: "INTERPOL Cybercrime",
    organization: "INTERPOL",
    rewards: "International cooperation",
    url: "https://www.interpol.int/Crimes/Cybercrime",
    category: "international",
    icon: "🌐",
    description: "Cross-border cybercrime investigations"
  },
  {
    id: "europol-ec3",
    name: "Europol European Cybercrime Centre",
    organization: "Europol EC3",
    rewards: "Coordination support",
    url: "https://www.europol.europa.eu/",
    category: "international",
    icon: "🇪🇺",
    description: "European cybercrime operations, ransomware takedowns"
  },
  {
    id: "ncsc-uk",
    name: "UK NCSC Vulnerability Disclosure",
    organization: "UK National Cyber Security Centre",
    rewards: "Recognition + CVE credit",
    url: "https://www.ncsc.gov.uk/",
    category: "government",
    icon: "🇬🇧",
    description: "UK critical infrastructure vulnerabilities"
  },
  // Ransomware-Specific
  {
    id: "conti-ransomware",
    name: "Conti Ransomware Leaders",
    organization: "Rewards for Justice",
    rewards: "Up to $10,000,000",
    url: "https://rewardsforjustice.net/rewards/conti-ransomware/",
    category: "ransomware",
    icon: "🔒",
    description: "Conti/Ryuk ransomware gang leadership"
  },
  {
    id: "darkside-ransomware",
    name: "DarkSide Ransomware",
    organization: "Rewards for Justice",
    rewards: "Up to $10,000,000",
    url: "https://rewardsforjustice.net/",
    category: "ransomware",
    icon: "⚫",
    description: "DarkSide ransomware (Colonial Pipeline attack)"
  },
  {
    id: "lockbit-ransomware",
    name: "LockBit Ransomware",
    organization: "FBI + International",
    rewards: "Up to $15,000,000",
    url: "https://www.fbi.gov/wanted/cyber",
    category: "ransomware",
    icon: "🔓",
    description: "LockBit ransomware-as-a-service operation"
  },
  // Commerce & Trade
  {
    id: "bis-export-violations",
    name: "BIS Export Violations",
    organization: "Bureau of Industry and Security",
    rewards: "Whistleblower rewards",
    url: "https://www.bis.doc.gov/",
    category: "export_control",
    icon: "📦",
    description: "Export control violations, technology transfer to adversaries"
  }
];

export const SECURITY_TOOLS = [
  {
    id: "rita",
    name: "RITA",
    fullName: "Real Intelligence Threat Analytics",
    description: "Detect C2 beaconing, DNS tunneling, and long connections through network traffic analysis",
    url: "https://www.activecountermeasures.com/free-tools/rita/",
    github: "https://github.com/activecm/rita",
    category: "threat_hunting",
    features: [
      "Beacon Detection",
      "DNS Tunneling Detection", 
      "Long Connection Detection",
      "Threat Intel Feed Checking",
      "Severity Scoring (Critical/High/Medium/Low)"
    ],
    difficulty: "intermediate",
    icon: "📡"
  },
  {
    id: "cai",
    name: "CAI",
    fullName: "Cybersecurity AI Framework",
    description: "AI-powered pentesting automation with intelligent agents for security testing",
    url: "https://aliasrobotics.github.io/cai/",
    github: "https://github.com/aliasrobotics/cai",
    category: "pentesting",
    features: [
      "AI-Powered Pentesting",
      "Web Pentester Agent",
      "Prompt Injection Testing",
      "Session Management",
      "Multi-Model Support (OpenAI, Ollama)"
    ],
    difficulty: "advanced",
    icon: "🤖"
  },
  {
    id: "atropos",
    name: "Atropos",
    fullName: "Advanced OSINT & Security Investigation Platform",
    description: "AI-powered security investigation platform combining OSINT tools, behavioral analytics, and report generation",
    url: "https://github.com/goodoleusa/atropos",
    github: "https://github.com/goodoleusa/atropos",
    category: "osint",
    features: [
      "AI-Powered Investigation Campaigns",
      "Multi-Model LLM Support (OpenRouter)",
      "Visual Campaign Designer",
      "Bug Bounty Report Builder",
      "OSINT Tool Integration (Shodan, Censys, etc.)",
      "Real-time Threat Intelligence"
    ],
    difficulty: "intermediate",
    icon: "🔱"
  }
];

export const LEARNING_PATHS = [
  {
    id: "threat-hunter",
    name: "Threat Hunter Path",
    description: "Learn to detect advanced persistent threats and command-and-control traffic",
    difficulty: "intermediate",
    estimatedTime: "40 hours",
    tools: ["rita", "zeek"],
    objectives: [
      { id: 1, title: "Install RITA and Zeek", completed: false },
      { id: 2, title: "Capture and analyze network traffic", completed: false },
      { id: 3, title: "Identify beaconing behavior", completed: false },
      { id: 4, title: "Detect DNS tunneling", completed: false },
      { id: 5, title: "Integrate threat intelligence feeds", completed: false },
      { id: 6, title: "Generate threat hunting report", completed: false }
    ],
    resources: [
      { title: "RITA v5 Video Series", url: "https://www.activecountermeasures.com/ritav5-the-video-series/" },
      { title: "Threat Hunter Community Discord", url: "https://discord.gg/threathunter" }
    ]
  },
  {
    id: "ai-pentester",
    name: "AI-Powered Pentesting Path",
    description: "Leverage AI agents for automated security testing and vulnerability discovery",
    difficulty: "advanced",
    estimatedTime: "60 hours",
    tools: ["cai", "openai", "ollama"],
    objectives: [
      { id: 1, title: "Set up CAI environment", completed: false },
      { id: 2, title: "Configure AI model (OpenAI/Ollama)", completed: false },
      { id: 3, title: "Run web pentester agent", completed: false },
      { id: 4, title: "Understand prompt injection risks", completed: false },
      { id: 5, title: "Create custom security agents", completed: false },
      { id: 6, title: "Document and report findings", completed: false }
    ],
    resources: [
      { title: "CAI Documentation", url: "https://aliasrobotics.github.io/cai/" },
      { title: "CAI Examples", url: "https://github.com/aliasrobotics/cai/tree/main/examples" }
    ]
  },
  {
    id: "osint-investigator",
    name: "OSINT Investigator Path",
    description: "Master open-source intelligence gathering with AI-powered investigation workflows",
    difficulty: "intermediate",
    estimatedTime: "30 hours",
    tools: ["atropos", "shodan", "censys"],
    objectives: [
      { id: 1, title: "Set up Atropos investigation environment", completed: false },
      { id: 2, title: "Learn passive reconnaissance techniques", completed: false },
      { id: 3, title: "Master DNS and certificate enumeration", completed: false },
      { id: 4, title: "Use AI-powered investigation campaigns", completed: false },
      { id: 5, title: "Build custom investigation workflows", completed: false },
      { id: 6, title: "Generate professional intelligence reports", completed: false }
    ],
    resources: [
      { title: "Atropos Documentation", url: "https://github.com/goodoleusa/atropos" },
      { title: "OSINT Framework", url: "https://osintframework.com/" }
    ]
  },
  {
    id: "bug-bounty-hunter",
    name: "Bug Bounty Hunter Path",
    description: "Complete path from reconnaissance to report submission for profitable bug hunting",
    difficulty: "beginner",
    estimatedTime: "80 hours",
    tools: ["atropos", "cai", "rita"],
    objectives: [
      { id: 1, title: "Understand bug bounty platforms", completed: false },
      { id: 2, title: "Set up reconnaissance toolkit", completed: false },
      { id: 3, title: "Learn common vulnerability types", completed: false },
      { id: 4, title: "Practice on legal targets (labs)", completed: false },
      { id: 5, title: "Write professional vulnerability reports", completed: false },
      { id: 6, title: "Submit first bug bounty report", completed: false }
    ],
    resources: [
      { title: "HackerOne Hacker101", url: "https://www.hacker101.com/" },
      { title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" }
    ]
  }
];

export const DOSSIER_TEMPLATE = `# THREAT INTELLIGENCE DOSSIER

## Executive Summary
**Target:** {{target}}
**Date:** {{date}}
**Severity:** {{severity}}
**Status:** {{status}}

---

## 1. Overview
{{summary}}

---

## 2. Indicators of Compromise (IOCs)

### IP Addresses
{{#each iocs.ips}}
- \`{{this}}\`
{{/each}}

### Domains
{{#each iocs.domains}}
- \`{{this}}\`
{{/each}}

### File Hashes
{{#each iocs.hashes}}
- \`{{this}}\`
{{/each}}

---

## 3. Technical Findings

{{#each findings}}
### Finding {{@index}}: {{this.title}}
**Severity:** {{this.severity}}
**CVSS Score:** {{this.cvss}}

**Description:**
{{this.description}}

**Proof of Concept:**
\`\`\`
{{this.poc}}
\`\`\`

**Remediation:**
{{this.remediation}}

---
{{/each}}

## 4. Attack Chain Analysis

\`\`\`
{{attackChain}}
\`\`\`

---

## 5. Tools Used
{{#each tools}}
- **{{this.name}}**: {{this.purpose}}
{{/each}}

---

## 6. Recommendations

1. {{recommendations.immediate}}
2. {{recommendations.shortTerm}}
3. {{recommendations.longTerm}}

---

## 7. References
{{#each references}}
- [{{this.title}}]({{this.url}})
{{/each}}

---

**Report Generated by:** SysAdmin Corp NEXUS Platform
**Classification:** {{classification}}
**Distribution:** {{distribution}}
`;

export const REPORT_TEMPLATE_BOUNTY = `# Bug Bounty Vulnerability Report

## Summary
| Field | Value |
|-------|-------|
| **Title** | {{title}} |
| **Severity** | {{severity}} |
| **Program** | {{program}} |
| **Asset** | {{asset}} |
| **Weakness** | {{weakness}} |

## Description
{{description}}

## Steps to Reproduce
{{#each steps}}
{{@index}}. {{this}}
{{/each}}

## Proof of Concept
\`\`\`
{{poc}}
\`\`\`

## Impact
{{impact}}

## Suggested Fix
{{suggestedFix}}

## Supporting Materials
{{#each attachments}}
- {{this}}
{{/each}}

---
*Generated with SysAdmin Corp Bug Bounty Report Generator*
`;

export const IOC_TYPES = [
  { id: "ip", name: "IP Address", regex: /^(?:\d{1,3}\.){3}\d{1,3}$/, icon: "🌐" },
  { id: "domain", name: "Domain", regex: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, icon: "🔗" },
  { id: "md5", name: "MD5 Hash", regex: /^[a-fA-F0-9]{32}$/, icon: "🔐" },
  { id: "sha1", name: "SHA1 Hash", regex: /^[a-fA-F0-9]{40}$/, icon: "🔐" },
  { id: "sha256", name: "SHA256 Hash", regex: /^[a-fA-F0-9]{64}$/, icon: "🔐" },
  { id: "url", name: "URL", regex: /^https?:\/\/[^\s]+$/, icon: "🔗" },
  { id: "email", name: "Email", regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, icon: "📧" },
  { id: "cve", name: "CVE ID", regex: /^CVE-\d{4}-\d+$/, icon: "⚠️" }
];
