import { Campaign, CampaignStep, CampaignTargetField, LearningObjective } from './agentCampaigns';

export const APT_THREAT_GROUPS: Record<string, {
  name: string;
  aliases: string[];
  nationState: string;
  mitreGroupId: string;
  primaryMotivation: string;
  knownTTPs: string[];
  notableOperations: string[];
  publicReports: string[];
}> = {
  apt28: {
    name: 'APT28',
    aliases: ['Fancy Bear', 'Sofacy', 'Sednit', 'Pawn Storm', 'STRONTIUM', 'Forest Blizzard', 'Unit 26165'],
    nationState: 'Russia',
    mitreGroupId: 'G0007',
    primaryMotivation: 'Espionage, Information Operations',
    knownTTPs: ['T1566.001', 'T1059.001', 'T1071.001', 'T1027', 'T1110', 'T1078', 'T1203', 'T1583.001'],
    notableOperations: ['DNC Hack (2016)', 'Olympic Destroyer (2018)', 'Bundestag Hack (2015)', 'WADA Hack (2016)'],
    publicReports: [
      'DOJ Indictment - United States v. Viktor Borisovich Netyksho et al. (2018)',
      'CISA AA20-296A - Russian State-Sponsored APT Actors',
      'Microsoft STRONTIUM Activity Reports',
      'CrowdStrike Fancy Bear Threat Profile'
    ]
  },
  apt29: {
    name: 'APT29',
    aliases: ['Cozy Bear', 'The Dukes', 'NOBELIUM', 'Midnight Blizzard', 'UNC2452', 'Dark Halo'],
    nationState: 'Russia',
    mitreGroupId: 'G0016',
    primaryMotivation: 'Strategic Intelligence Collection',
    knownTTPs: ['T1195.002', 'T1053.005', 'T1071.001', 'T1560', 'T1027.005', 'T1550.001', 'T1078.004'],
    notableOperations: ['SolarWinds SUNBURST (2020)', 'DNC Intrusion (2015-2016)', 'COVID-19 Vaccine Research Targeting (2020)'],
    publicReports: [
      'CISA AA21-008A - Detecting Post-Compromise Threat Activity in Microsoft Cloud',
      'FireEye/Mandiant UNC2452 Report',
      'Microsoft NOBELIUM Activity Tracking',
      'NSA/CISA/FBI Joint Advisory on SVR Cyber Operations (2021)'
    ]
  },
  sandworm: {
    name: 'Sandworm',
    aliases: ['Voodoo Bear', 'IRIDIUM', 'Seashell Blizzard', 'TeleBots', 'Unit 74455', 'BlackEnergy Group'],
    nationState: 'Russia',
    mitreGroupId: 'G0034',
    primaryMotivation: 'Disruption, Sabotage, Information Operations',
    knownTTPs: ['T1195.002', 'T1486', 'T1562.001', 'T1021.002', 'T1569.002', 'T1499', 'T1485'],
    notableOperations: ['NotPetya (2017)', 'Ukraine Power Grid Attack (2015/2016)', 'Olympic Destroyer (2018)', 'Industroyer/CrashOverride'],
    publicReports: [
      'DOJ Indictment - United States v. Yuriy Sergeyevich Andrienko et al. (2020)',
      'CISA AA22-110A - Russian State-Sponsored and Criminal Cyber Threats',
      'ESET Industroyer2 Analysis (2022)',
      'Dragos CrashOverride ICS Malware Report'
    ]
  },
  apt1: {
    name: 'APT1',
    aliases: ['Comment Crew', 'Comment Panda', 'PLA Unit 61398', 'Byzantine Candor'],
    nationState: 'China',
    mitreGroupId: 'G0006',
    primaryMotivation: 'Economic Espionage, Intellectual Property Theft',
    knownTTPs: ['T1566.001', 'T1059.001', 'T1071.001', 'T1005', 'T1041', 'T1078', 'T1074'],
    notableOperations: ['Multi-year espionage against 141+ organizations (2006-2013)', 'Theft of hundreds of terabytes of data'],
    publicReports: [
      'Mandiant APT1: Exposing One of China\'s Cyber Espionage Units (2013)',
      'DOJ Indictment - United States v. Wang Dong et al. (2014)',
      'CISA China Cyber Threat Overview'
    ]
  },
  apt41: {
    name: 'APT41',
    aliases: ['Double Dragon', 'Winnti', 'Barium', 'Wicked Panda', 'Brass Typhoon'],
    nationState: 'China',
    mitreGroupId: 'G0096',
    primaryMotivation: 'Espionage and Financial Gain (Dual-Purpose)',
    knownTTPs: ['T1195.002', 'T1059', 'T1053', 'T1071', 'T1027', 'T1190', 'T1055'],
    notableOperations: ['Supply chain attacks on software vendors', 'Video game industry targeting', 'COVID-19 SBA Loan Fraud'],
    publicReports: [
      'DOJ Indictment - United States v. Zhang Haoran et al. (2020)',
      'Mandiant APT41: A Dual Espionage and Cyber Crime Operation (2019)',
      'FireEye APT41 Global Intrusion Campaign',
      'CISA AA20-259A'
    ]
  },
  hafnium: {
    name: 'HAFNIUM',
    aliases: ['Silk Typhoon', 'UNC2980'],
    nationState: 'China',
    mitreGroupId: 'G0125',
    primaryMotivation: 'Espionage, Data Exfiltration',
    knownTTPs: ['T1190', 'T1505.003', 'T1003.001', 'T1560.001', 'T1078', 'T1136'],
    notableOperations: ['ProxyLogon Exchange Server Exploitation (2021)', 'Mass exploitation of 30,000+ organizations'],
    publicReports: [
      'CISA AA21-062A - Mitigate Microsoft Exchange Server Vulnerabilities',
      'Microsoft HAFNIUM Targeting Exchange Servers (2021)',
      'Volexity Exchange Server 0-Day Analysis',
      'CISA Emergency Directive 21-02'
    ]
  },
  lazarus: {
    name: 'Lazarus Group',
    aliases: ['HIDDEN COBRA', 'Guardians of Peace', 'Diamond Sleet', 'Zinc', 'Labyrinth Chollima', 'APT38'],
    nationState: 'DPRK (North Korea)',
    mitreGroupId: 'G0032',
    primaryMotivation: 'Financial Theft, Espionage, Sabotage',
    knownTTPs: ['T1566.001', 'T1059', 'T1071', 'T1560', 'T1486', 'T1496', 'T1195.002'],
    notableOperations: ['Bangladesh Bank Heist ($81M, 2016)', 'WannaCry Ransomware (2017)', 'Sony Pictures Hack (2014)', 'Ronin Bridge Theft ($620M, 2022)'],
    publicReports: [
      'CISA AA20-106A - Guidance on the North Korean Cyber Threat',
      'FBI Flash Alert - North Korean Cryptocurrency Targeting',
      'DOJ Indictment - United States v. Park Jin Hyok (2018)',
      'Kaspersky Lazarus Group Reports'
    ]
  },
  turla: {
    name: 'Turla',
    aliases: ['Snake', 'Venomous Bear', 'Secret Blizzard', 'Uroburos', 'Krypton', 'Waterbug'],
    nationState: 'Russia',
    mitreGroupId: 'G0010',
    primaryMotivation: 'Strategic Espionage',
    knownTTPs: ['T1071.001', 'T1573', 'T1090.003', 'T1027', 'T1041', 'T1036', 'T1102'],
    notableOperations: ['Snake malware global espionage (20+ years)', 'Hijacking Iranian APT infrastructure', 'US Central Command breach'],
    publicReports: [
      'CISA AA23-129A - Hunting Russian Intelligence Snake Malware',
      'NSA/CISA/FBI/NCSC Joint Advisory on Snake Malware (2023)',
      'ESET Turla Outlook Backdoor Analysis',
      'Kaspersky Turla/Uroburos Technical Reports'
    ]
  }
};

export const APT_CASE_STUDIES: Campaign[] = [
  {
    id: 'apt28_dnc_hack',
    name: 'APT28: Operation Fancy Bear',
    icon: '🐻',
    description: 'Investigate the 2016 DNC breach attributed to GRU Unit 26165. Analyze spear-phishing infrastructure, X-Agent malware, and Olympic Destroyer connections.',
    difficulty: 'advanced',
    estimatedTime: '60-90 min',
    tags: ['APT', 'Russia', 'GRU', 'Spear Phishing'],
    color: 'red',

    targetFields: [
      { key: 'c2_domain', label: 'Suspected C2 Domain', type: 'domain', required: true, placeholder: 'misdepart[.]com' },
      { key: 'malware_hash', label: 'Malware Sample Hash (SHA256)', type: 'hash', required: false, placeholder: 'e.g. X-Agent hash' },
      { key: 'phishing_email', label: 'Phishing Sender Email', type: 'email', required: false, placeholder: 'hilaborede@yandex[.]com' }
    ],
    dummyTargets: {
      c2_domain: 'misdepart[.]com',
      malware_hash: 'e5f3ef69a534260e899a36cec459440dc572388defd8f1d98760d31c700f42d5',
      phishing_email: 'john356gh@gmail[.]com'
    },

    starterPrompt: `🐻 OPERATION FANCY BEAR — APT28 DNC BREACH INVESTIGATION

CASE BRIEFING:
In June 2016, CrowdStrike disclosed that two Russian intelligence-linked groups had compromised the Democratic National Committee network. The group known as APT28 (Fancy Bear / GRU Unit 26165) used spear-phishing emails with weaponized attachments to gain initial access, then deployed custom malware including X-Agent and X-Tunnel for persistence and exfiltration.

In July 2018, the DOJ indicted 12 GRU officers for the operation. The indictment provides detailed IOCs including C2 infrastructure, malware hashes, and operational TTPs.

YOUR MISSION:
Reconstruct the attack chain using publicly available intelligence and develop detection signatures.

🔍 PHASE 1: PHISHING INFRASTRUCTURE ANALYSIS
- Examine known spear-phishing domains used by APT28
- Known domains from DOJ indictment: misdepart[.]com, account-loginserv[.]com
- Analyze WHOIS history and hosting patterns
- Identify registration patterns (bulk registration, privacy services)
- Map the phishing infrastructure timeline

📧 PHASE 2: MALWARE ANALYSIS — X-AGENT / SOFACY
- X-Agent (Sofacy) hash: e5f3ef69a534260e899a36cec459440dc572388defd8f1d98760d31c700f42d5
- Analyze C2 communication patterns (HTTP-based, custom headers)
- Identify persistence mechanisms (scheduled tasks, registry keys)
- Document MITRE ATT&CK mappings: T1566.001, T1059.001, T1071.001, T1027, T1110
- Create YARA detection rules for X-Agent family

🌐 PHASE 3: C2 INFRASTRUCTURE MAPPING
- Trace the C2 domain resolution history
- Identify shared infrastructure across campaigns
- Map connections to Olympic Destroyer false-flag operation
- Document infrastructure reuse patterns

📋 PHASE 4: ATTRIBUTION & REPORTING
- Correlate TTPs with known APT28 operations
- Document evidence chain for attribution
- Create Sigma detection rules for network indicators
- Build a comprehensive threat intelligence report

REFERENCE MATERIALS:
- DOJ Indictment: United States v. Viktor Borisovich Netyksho et al.
- CrowdStrike Bears in the Midst report
- CISA AA20-296A
- MITRE ATT&CK Group G0007

Begin your investigation. What phase would you like to start with?`,

    objectives: [
      'Analyze APT28 spear-phishing infrastructure from DOJ indictment',
      'Reverse-engineer X-Agent malware C2 protocol',
      'Map infrastructure overlaps with Olympic Destroyer',
      'Create YARA and Sigma detection signatures',
      'Build attribution-quality threat intelligence report'
    ],
    tools: ['VirusTotal', 'YARA', 'Wireshark', 'Sigma rules', 'PassiveDNS', 'Maltego'],

    steps: [
      {
        id: 'apt28-step-1',
        title: 'Phishing Infrastructure Reconnaissance',
        guidance: 'Start by examining the known C2 domains from the DOJ indictment. Use PassiveDNS to trace historical resolutions of misdepart[.]com and account-loginserv[.]com. Look for registration patterns — APT28 frequently used registrars with lax verification and privacy protection services.',
        toolsForStep: ['PassiveDNS', 'WHOIS', 'VirusTotal'],
        questions: [
          'What IP addresses did the C2 domains resolve to historically?',
          'Were domains registered in bulk or individually?',
          'What registrar and privacy services were used?',
          'Can you find other domains registered by the same entity?'
        ],
        redFlags: [
          'Domains mimicking legitimate email services (account-loginserv, misdepart)',
          'Recent registration dates just before campaign launch',
          'Use of privacy protection on all domains',
          'Hosting on bulletproof or Eastern European providers'
        ],
        successIndicators: [
          'Identified IP overlap across multiple C2 domains',
          'Mapped domain registration timeline to campaign activity',
          'Found shared hosting infrastructure patterns'
        ],
        nextStepConditions: [
          { condition: 'c2_infrastructure_mapped', nextStep: 'apt28-step-2', rationale: 'With infrastructure mapped, pivot to analyzing the malware samples communicating with these C2 servers.' }
        ]
      },
      {
        id: 'apt28-step-2',
        title: 'X-Agent Malware Analysis',
        guidance: 'Analyze the X-Agent (Sofacy) sample using VirusTotal and public sandbox reports. Focus on the HTTP-based C2 protocol — X-Agent uses custom HTTP headers and Base64-encoded payloads. The malware implements keylogging, screenshot capture, and credential harvesting modules.',
        toolsForStep: ['VirusTotal', 'YARA', 'CyberChef'],
        questions: [
          'What are the embedded C2 URLs in the sample?',
          'What custom HTTP headers does X-Agent use for C2?',
          'What persistence mechanisms are employed?',
          'What data exfiltration methods are used?'
        ],
        redFlags: [
          'Custom User-Agent strings mimicking legitimate browsers',
          'Base64-encoded data in HTTP POST bodies',
          'Scheduled task creation for persistence',
          'Named pipes for inter-process communication'
        ],
        successIndicators: [
          'Extracted C2 URLs and communication protocol details',
          'Identified modular architecture (keylogger, screencap, file stealer)',
          'Created YARA rule matching X-Agent family'
        ],
        nextStepConditions: [
          { condition: 'malware_analyzed', nextStep: 'apt28-step-3', rationale: 'Malware behavior patterns enable network-level detection and infrastructure correlation.' }
        ]
      },
      {
        id: 'apt28-step-3',
        title: 'Olympic Destroyer Cross-Reference',
        guidance: 'APT28 was linked to the Olympic Destroyer attack during the 2018 PyeongChang Winter Olympics. The malware contained multiple false flags designed to misdirect attribution (fake Lazarus code, Chinese language strings). Compare the infrastructure and TTPs to identify overlaps with the DNC campaign.',
        toolsForStep: ['VirusTotal', 'Sigma', 'Wireshark'],
        questions: [
          'What infrastructure was shared between DNC and Olympic Destroyer operations?',
          'What false-flag techniques were used in Olympic Destroyer?',
          'How did researchers see through the false flags?',
          'What does this teach about attribution methodology?'
        ],
        redFlags: [
          'Code reuse from known Lazarus samples (false flag)',
          'Chinese language metadata (false flag)',
          'Shared C2 infrastructure with confirmed APT28 operations',
          'Consistent operational security patterns'
        ],
        successIndicators: [
          'Identified shared infrastructure between campaigns',
          'Documented false-flag techniques and how to detect them',
          'Understood attribution beyond surface-level indicators'
        ],
        nextStepConditions: [
          { condition: 'cross_reference_complete', nextStep: 'apt28-step-4', rationale: 'With full campaign analysis, produce the final intelligence report.' }
        ]
      },
      {
        id: 'apt28-step-4',
        title: 'Detection Engineering & Reporting',
        guidance: 'Create actionable detection content based on your findings. Write YARA rules for X-Agent variants, Sigma rules for network indicators, and compile a structured threat intelligence report following STIX/TAXII format.',
        toolsForStep: ['YARA', 'Sigma', 'STIX Editor'],
        questions: [
          'What YARA rule would detect X-Agent across variants?',
          'What Sigma rule detects the C2 HTTP patterns?',
          'What are the key indicators for a threat intel report?',
          'How would you communicate this to a SOC team?'
        ],
        redFlags: [
          'YARA rules that are too specific (single hash) or too broad (false positives)',
          'Missing context in detection rules',
          'Attribution claims without sufficient evidence'
        ],
        successIndicators: [
          'YARA rule detects X-Agent family with low false-positive rate',
          'Sigma rule covers network-level C2 detection',
          'Report includes full kill chain reconstruction'
        ],
        nextStepConditions: []
      }
    ],

    adaptivePrompts: [
      'The DOJ indictment names specific GRU officers and their roles. Check the infrastructure registration against the timeline of the indicted officers\' activities.',
      'X-Agent communicates via HTTP POST with a distinctive encrypted payload structure. Try decoding the Base64 layer — underneath is RC4-encrypted data.',
      'Look for overlapping SSL certificates between APT28 domains — they often reuse self-signed certs across campaigns.'
    ],

    learningObjectives: [
      { goal: 'threat_intelligence', weight: 10, description: 'Master nation-state APT investigation methodology' },
      { goal: 'malware_analysis', weight: 8, description: 'Analyze state-sponsored malware families' },
      { goal: 'detection_engineering', weight: 7, description: 'Create detection signatures from threat intelligence' }
    ],
    skillsRequired: ['Basic malware analysis', 'Network traffic analysis', 'OSINT fundamentals', 'Understanding of HTTP protocol'],
    skillsTaught: ['APT campaign reconstruction', 'YARA rule development', 'Sigma rule creation', 'False-flag analysis', 'Attribution methodology'],
    learningOutcomes: [
      'Reconstruct a nation-state cyber operation from public intelligence',
      'Develop detection signatures for APT malware families',
      'Understand attribution challenges including false-flag operations',
      'Create professional threat intelligence reports',
      'Map attacks to MITRE ATT&CK framework'
    ],
    industryContext: 'APT28 investigations shaped modern threat intelligence practices. The DNC breach led to the first-ever DOJ indictment of foreign military intelligence officers for hacking, establishing legal precedent for cyber operations attribution.',
    realWorldExamples: [
      'DOJ Indictment: United States v. Netyksho et al. (2018)',
      'CrowdStrike Bears in the Midst (2016)',
      'CISA AA20-296A - Russian State-Sponsored APT Actors',
      'Kaspersky Olympic Destroyer Investigation'
    ],
    careerPaths: ['Threat Intelligence Analyst', 'Malware Reverse Engineer', 'Detection Engineer', 'National Security Analyst'],

    teachingAdaptations: {
      experiential: 'Start by submitting the X-Agent hash to VirusTotal. Examine the detection names, behavioral reports, and network indicators. Then try writing a YARA rule that matches the sample. Test it against other APT28 samples to refine.',
      visual: 'Build a visual timeline of the DNC breach: phishing email → initial access → lateral movement → exfiltration. Use Maltego to graph the C2 infrastructure relationships. Color-code by campaign (DNC vs Olympic Destroyer).',
      analytical: 'Study the DOJ indictment in detail — it provides the most authoritative technical account. Cross-reference each TTP with MITRE ATT&CK. Analyze why researchers attributed Olympic Destroyer to APT28 despite false flags.',
      social: 'This case sparked massive public debate about attribution. Discuss the CrowdStrike vs. skeptics controversy. Review how the intelligence community reached consensus. Compare methodologies from different vendors.',
      pragmatic: 'Focus on building detection rules: grab known IOCs from the DOJ indictment, write YARA for X-Agent, write Sigma for the C2 pattern, deploy to your SIEM. That is the deliverable a SOC needs.'
    }
  },

  {
    id: 'apt29_solarwinds',
    name: 'APT29: SolarWinds SUNBURST',
    icon: '☀️',
    description: 'Investigate the 2020 SolarWinds supply chain compromise attributed to SVR (APT29). Analyze SUNBURST backdoor, DGA-based C2, and post-compromise cloud exploitation.',
    difficulty: 'expert',
    estimatedTime: '90-120 min',
    tags: ['APT', 'Russia', 'SVR', 'Supply Chain'],
    color: 'orange',

    targetFields: [
      { key: 'sunburst_hash', label: 'SUNBURST DLL Hash', type: 'hash', required: true, placeholder: '32519b85c0b422e4656de6e6c41878e95fd95026267daab4215ee59c107d6c77' },
      { key: 'c2_pattern', label: 'C2 Domain Pattern', type: 'domain', required: false, placeholder: '*.avsvmcloud[.]com' },
      { key: 'orion_version', label: 'Affected Orion Version', type: 'text', required: false, placeholder: '2019.4 - 2020.2.1' }
    ],
    dummyTargets: {
      sunburst_hash: '32519b85c0b422e4656de6e6c41878e95fd95026267daab4215ee59c107d6c77',
      c2_pattern: '*.avsvmcloud[.]com',
      orion_version: '2020.2'
    },

    starterPrompt: `☀️ OPERATION SUNBURST — SOLARWINDS SUPPLY CHAIN INVESTIGATION

CASE BRIEFING:
In December 2020, FireEye (now Mandiant) disclosed that SolarWinds Orion software had been backdoored via a supply chain compromise. The threat actor, attributed to Russia's SVR (APT29/Cozy Bear), inserted a backdoor called SUNBURST into the SolarWinds Orion build process. The trojanized update was distributed to approximately 18,000 organizations, with roughly 100 selectively exploited for follow-on operations.

This is considered one of the most sophisticated supply chain attacks in history.

SUNBURST DLL Hash (SHA256): 32519b85c0b422e4656de6e6c41878e95fd95026267daab4215ee59c107d6c77
(SolarWinds.Orion.Core.BusinessLayer.dll — trojanized component)

C2 Domain: avsvmcloud[.]com (used DGA-generated subdomains for initial beacon)

YOUR MISSION:
Analyze the full attack chain from supply chain compromise through post-exploitation cloud access.

🔗 PHASE 1: SUPPLY CHAIN VECTOR ANALYSIS
- Understand how SUNBURST was inserted into the Orion build pipeline
- The backdoor was compiled into a legitimate DLL with a valid SolarWinds digital signature
- Analyze the build process compromise vs. source code modification
- Document MITRE ATT&CK: T1195.002 (Supply Chain Compromise: Compromise Software Supply Chain)

Questions to investigate:
- How did the actor access the SolarWinds build environment?
- Why was the backdoor undetected for months?
- What made this supply chain attack uniquely dangerous?

🦠 PHASE 2: SUNBURST BACKDOOR ANALYSIS
- The SUNBURST DLL contained a sophisticated backdoor with:
  - 12-14 day dormancy period before activating
  - DGA-based C2 using subdomains of avsvmcloud[.]com
  - Victim identification encoded in DNS CNAME records
  - Anti-analysis checks (process lists, security tools, domains)
  - Ability to disable security software before proceeding
- MITRE: T1053.005, T1071.001, T1027.005

Analyze:
- How does the DGA algorithm work?
- What information is encoded in the C2 subdomain?
- How does the backdoor profile the victim environment?
- What anti-forensics measures are built in?

☁️ PHASE 3: POST-COMPROMISE CLOUD EXPLOITATION
- After SUNBURST established access, APT29 deployed:
  - TEARDROP memory-only dropper
  - Cobalt Strike BEACON
  - Golden SAML attacks for cloud persistence
  - OAuth token manipulation
- MITRE: T1550.001 (Application Access Token), T1606.002 (SAML Tokens)

Investigation tasks:
- How did APT29 move from on-premise to cloud?
- What is a Golden SAML attack?
- How did they maintain persistence in Azure AD / M365?
- What logs reveal this activity?

📊 PHASE 4: DETECTION & LESSONS LEARNED
- Create detection queries for SUNBURST network traffic
- Identify the DGA pattern in DNS logs
- Analyze Splunk/SIEM queries for post-compromise indicators
- Document supply chain security lessons

Key indicators:
- DNS queries to avsvmcloud[.]com subdomains
- Named pipe: 583da945-62af-10e8-4902-a8f205c72b2e
- Scheduled task modifications in Orion directories
- Anomalous Azure AD sign-in patterns

REFERENCE MATERIALS:
- CISA AA21-008A: Detecting Post-Compromise Threat Activity
- FireEye SUNBURST Technical Analysis
- Microsoft Solorigate Investigation
- MITRE ATT&CK Group G0016

This investigation requires understanding of supply chain security, malware analysis, cloud security, and advanced persistence techniques. Begin your analysis.`,

    objectives: [
      'Analyze the SolarWinds supply chain compromise vector',
      'Reverse-engineer SUNBURST DGA-based C2 protocol',
      'Understand Golden SAML post-compromise cloud attacks',
      'Create detection queries for SUNBURST indicators',
      'Document supply chain security lessons learned'
    ],
    tools: ['Splunk', 'YARA', 'Network forensics', 'EDR', 'Azure AD logs', 'DNS analysis'],

    steps: [
      {
        id: 'apt29-step-1',
        title: 'Supply Chain Vector Analysis',
        guidance: 'Begin by understanding how SUNBURST was inserted into the SolarWinds build pipeline. The actor compromised the build server and injected code into the Orion source before compilation. The resulting DLL was signed with a valid SolarWinds certificate, making it appear legitimate. Review the CISA advisory and Mandiant report for build process details.',
        toolsForStep: ['VirusTotal', 'Documentation review'],
        questions: [
          'How did the trojanized DLL pass code signing verification?',
          'What build process controls could have detected the insertion?',
          'Why did the 12-14 day dormancy period evade sandbox analysis?',
          'What is the difference between source code compromise vs. build pipeline compromise?'
        ],
        redFlags: [
          'Digitally signed malware using legitimate vendor certificate',
          'Code changes that blend with legitimate codebase patterns',
          'Extended dormancy periods designed to evade sandbox analysis',
          'Targeting of build infrastructure rather than production systems'
        ],
        successIndicators: [
          'Understood the build pipeline compromise methodology',
          'Identified why traditional security controls failed',
          'Documented the supply chain attack timeline'
        ],
        nextStepConditions: [
          { condition: 'supply_chain_understood', nextStep: 'apt29-step-2', rationale: 'Understanding the supply chain vector provides context for analyzing the SUNBURST payload itself.' }
        ]
      },
      {
        id: 'apt29-step-2',
        title: 'SUNBURST DGA & C2 Analysis',
        guidance: 'SUNBURST uses a domain generation algorithm to create subdomains of avsvmcloud[.]com. The subdomain encodes victim information (organization domain, security product presence). Analyze the DGA pattern and understand how the C2 server selects targets for further exploitation. Use the FireEye decoder tools to understand subdomain encoding.',
        toolsForStep: ['DNS analysis', 'CyberChef', 'Python scripting'],
        questions: [
          'What victim information is encoded in the DGA subdomain?',
          'How does the C2 server respond to select high-value targets?',
          'What DNS record types are used for C2 communication?',
          'How can you detect DGA subdomains in DNS logs?'
        ],
        redFlags: [
          'DNS CNAME responses pointing to attacker-controlled infrastructure',
          'Unusually long subdomain strings under avsvmcloud[.]com',
          'DNS queries from SolarWinds Orion server to uncommon domains',
          'A-record responses in specific IP ranges signaling commands'
        ],
        successIndicators: [
          'Decoded the DGA algorithm and subdomain structure',
          'Identified victim selection mechanism via DNS responses',
          'Created DNS-based detection queries'
        ],
        nextStepConditions: [
          { condition: 'c2_protocol_analyzed', nextStep: 'apt29-step-3', rationale: 'C2 analysis reveals how selected targets received secondary payloads for cloud exploitation.' }
        ]
      },
      {
        id: 'apt29-step-3',
        title: 'Post-Compromise Cloud Exploitation',
        guidance: 'For selected high-value targets, APT29 deployed TEARDROP (memory-only dropper) and Cobalt Strike BEACON, then pivoted to cloud infrastructure using Golden SAML attacks. They forged SAML tokens to access Azure AD and M365 without valid credentials. Analyze the cloud attack methodology and identify detection opportunities in Azure AD logs.',
        toolsForStep: ['Splunk', 'Azure AD logs', 'EDR'],
        questions: [
          'What is a Golden SAML attack and how does it bypass MFA?',
          'What Azure AD log entries indicate SAML token forgery?',
          'How did APT29 maintain access after the SUNBURST C2 was sinkholed?',
          'What is the relationship between ADFS compromise and cloud access?'
        ],
        redFlags: [
          'SAML tokens with unusually long validity periods',
          'Service principal modifications in Azure AD',
          'OAuth application registrations by compromised accounts',
          'Mail access via API from non-standard locations'
        ],
        successIndicators: [
          'Understood Golden SAML attack methodology',
          'Identified Azure AD detection queries for token forgery',
          'Mapped the on-premise to cloud pivot path'
        ],
        nextStepConditions: [
          { condition: 'cloud_exploitation_analyzed', nextStep: 'apt29-step-4', rationale: 'Complete analysis enables comprehensive detection strategy and lessons learned documentation.' }
        ]
      },
      {
        id: 'apt29-step-4',
        title: 'Detection Engineering & Lessons Learned',
        guidance: 'Create comprehensive detection content covering all phases: supply chain indicators, SUNBURST network patterns, and cloud exploitation evidence. Document lessons learned for supply chain security posture improvement.',
        toolsForStep: ['Splunk', 'YARA', 'Sigma'],
        questions: [
          'What YARA rule detects SUNBURST across known variants?',
          'What Splunk query detects the DGA pattern in DNS logs?',
          'What Azure AD queries detect Golden SAML?',
          'What organizational controls prevent supply chain attacks?'
        ],
        redFlags: [
          'Over-reliance on code signing as sole integrity verification',
          'Insufficient monitoring of build pipeline access',
          'Lack of anomaly detection in DNS query patterns',
          'Missing SAML token validation logging'
        ],
        successIndicators: [
          'Created multi-phase detection coverage',
          'Documented supply chain security recommendations',
          'Produced executive-level lessons learned briefing'
        ],
        nextStepConditions: []
      }
    ],

    adaptivePrompts: [
      'The SUNBURST DGA encodes the victim\'s Active Directory domain in the subdomain. Try Base32-decoding the first part of the subdomain to reveal victim identity.',
      'Check the CISA Emergency Directive 21-01 for the complete list of affected SolarWinds Orion versions and patch guidance.',
      'The named pipe 583da945-62af-10e8-4902-a8f205c72b2e is a unique SUNBURST indicator. Search for this in endpoint telemetry.'
    ],

    learningObjectives: [
      { goal: 'supply_chain_security', weight: 10, description: 'Understand supply chain attack methodology and defense' },
      { goal: 'cloud_security', weight: 9, description: 'Learn Golden SAML and cloud post-compromise techniques' },
      { goal: 'threat_intelligence', weight: 8, description: 'Analyze nation-state APT campaigns at expert level' }
    ],
    skillsRequired: ['Intermediate malware analysis', 'DNS protocol knowledge', 'Cloud security fundamentals (Azure AD)', 'SIEM query experience'],
    skillsTaught: ['Supply chain attack analysis', 'DGA reverse engineering', 'Golden SAML detection', 'Cloud forensics in Azure/M365', 'Advanced detection engineering'],
    learningOutcomes: [
      'Analyze a supply chain compromise from injection to exploitation',
      'Reverse-engineer a DGA-based C2 protocol',
      'Detect Golden SAML attacks in Azure AD',
      'Create multi-phase detection strategies for advanced APTs',
      'Develop supply chain security recommendations'
    ],
    industryContext: 'The SolarWinds SUNBURST attack transformed cybersecurity policy. It led to Executive Order 14028 on Improving the Nation\'s Cybersecurity, mandatory SBOM requirements, and a fundamental shift in how organizations evaluate supply chain risk.',
    realWorldExamples: [
      'FireEye/Mandiant UNC2452 Detailed Technical Report',
      'CISA AA21-008A: Detecting Post-Compromise Threat Activity',
      'Microsoft Solorigate Investigation Blog Series',
      'Executive Order 14028 on Cybersecurity (2021)'
    ],
    careerPaths: ['Cloud Security Architect', 'Supply Chain Security Analyst', 'Senior Threat Intelligence Analyst', 'Incident Response Lead'],

    teachingAdaptations: {
      experiential: 'Download the SUNBURST YARA rules from FireEye GitHub. Run them against test samples. Then try decoding a captured DGA subdomain using the published Python decoder. Hands-on DGA analysis is the fastest way to internalize the technique.',
      visual: 'Create a multi-layer diagram: build pipeline compromise → trojanized update distribution → SUNBURST activation → target selection → TEARDROP deployment → Golden SAML → cloud access. Visualize the 18,000 to 100 funnel.',
      analytical: 'Read the FireEye technical report cover-to-cover. Then cross-reference with the CISA advisory. Analyze why the 12-day dormancy period, anti-analysis checks, and legitimate code signing created a near-undetectable implant. Study the DGA algorithm mathematically.',
      social: 'This attack affected 18,000 organizations including US government agencies. Discuss the policy response: EO 14028, SBOM mandates, and the debate about software liability. Study how FireEye\'s transparency about their own breach changed industry norms.',
      pragmatic: 'Focus on detection: DNS query for *avsvmcloud[.]com, check for named pipe indicator, audit SolarWinds Orion version, review Azure AD sign-in anomalies. Build a runbook your SOC can execute today.'
    }
  },

  {
    id: 'sandworm_notpetya',
    name: 'Sandworm: NotPetya & Grid Attacks',
    icon: '⚡',
    description: 'Investigate Sandworm (GRU Unit 74455) destructive campaigns: NotPetya ransomware and Ukraine power grid attacks using Industroyer/CrashOverride ICS malware.',
    difficulty: 'expert',
    estimatedTime: '90-120 min',
    tags: ['APT', 'Russia', 'GRU', 'ICS', 'Destructive'],
    color: 'purple',

    targetFields: [
      { key: 'notpetya_hash', label: 'NotPetya Sample Hash', type: 'hash', required: true, placeholder: '027cc450ef5f8c5f653329641ec1fed91f694e0d229928963b30f6b0d7d3a745' },
      { key: 'ics_target', label: 'ICS Target System', type: 'system', required: false, placeholder: 'Siemens SIPROTEC relay' },
      { key: 'medoc_domain', label: 'M.E.Doc Update Domain', type: 'domain', required: false, placeholder: 'upd[.]me-doc[.]com[.]ua' }
    ],
    dummyTargets: {
      notpetya_hash: '027cc450ef5f8c5f653329641ec1fed91f694e0d229928963b30f6b0d7d3a745',
      ics_target: 'Siemens SIPROTEC 4',
      medoc_domain: 'upd[.]me-doc[.]com[.]ua'
    },

    starterPrompt: `⚡ OPERATION SANDWORM — NOTPETYA & ICS ATTACK INVESTIGATION

CASE BRIEFING:
Sandworm (GRU Unit 74455) has executed some of the most destructive cyber operations in history. This investigation covers two linked campaigns:

1. NotPetya (June 2017): A destructive wiper disguised as ransomware that caused $10+ billion in global damages. It was delivered via a supply chain compromise of Ukrainian accounting software M.E.Doc.

2. Ukraine Power Grid Attacks (2015/2016): The first confirmed cyberattacks to cause power outages, using BlackEnergy and Industroyer/CrashOverride malware targeting ICS/SCADA systems.

NotPetya Hash (SHA256): 027cc450ef5f8c5f653329641ec1fed91f694e0d229928963b30f6b0d7d3a745
Supply Chain Vector: Compromised update server for M.E.Doc (upd[.]me-doc[.]com[.]ua)

YOUR MISSION:
Analyze both destructive campaigns to understand Sandworm's evolution from targeted ICS attacks to global-scale destructive operations.

💣 PHASE 1: NOTPETYA WIPER ANALYSIS
- NotPetya masqueraded as Petya ransomware but was actually a wiper
- It used EternalBlue (MS17-010) and credential harvesting for propagation
- The encryption was irreversible — there was no way to decrypt files
- Supply chain vector: trojanized M.E.Doc accounting software update
- MITRE: T1195.002, T1486, T1210, T1003

Investigation tasks:
- How did NotPetya spread from Ukraine to global corporations?
- What made it a wiper rather than ransomware?
- How did the M.E.Doc supply chain compromise work?
- Why did Maersk, Merck, FedEx suffer billions in damages?

⚡ PHASE 2: INDUSTROYER/CRASHOVERRIDE ICS ANALYSIS
- First malware specifically designed to attack power grid equipment
- Speaks native ICS protocols: IEC 61850, IEC 104, OPC DA
- Targeted Ukrenergo (Ukrainian power transmission)
- CISA ICS-CERT advisories document the indicators
- MITRE: T1562.001, T1021.002, T1569.002

ICS-specific analysis:
- How does Industroyer communicate with SCADA systems?
- What ICS protocols does it implement?
- How did it open circuit breakers remotely?
- What physical safety systems prevented worse outcomes?

🔍 PHASE 3: ATTRIBUTION & INFRASTRUCTURE
- Sandworm (Unit 74455) was indicted by DOJ in October 2020
- Six GRU officers named for NotPetya, Olympic Destroyer, and grid attacks
- Infrastructure overlaps connect both campaigns
- Analyze operational security patterns

📋 PHASE 4: ICS DEFENSE & DETECTION
- Create detection rules for Industroyer network protocols
- Develop incident response procedures for ICS environments
- Document lessons learned for critical infrastructure protection
- Analyze the Purdue Model and defense-in-depth for OT networks

REFERENCE MATERIALS:
- DOJ Indictment: United States v. Yuriy Sergeyevich Andrienko et al. (2020)
- CISA AA22-110A: Russian State-Sponsored Cyber Threats
- ESET Industroyer Analysis
- Dragos CrashOverride ICS Malware Report

Begin your investigation. This is expert-level analysis requiring ICS security knowledge.`,

    objectives: [
      'Analyze NotPetya wiper mechanics and supply chain delivery',
      'Understand Industroyer/CrashOverride ICS protocol attacks',
      'Map Sandworm infrastructure across destructive campaigns',
      'Develop ICS-specific detection and defense strategies',
      'Document lessons for critical infrastructure protection'
    ],
    tools: ['ICS forensics', 'Wireshark', 'SCADA analysis', 'YARA', 'Network protocol analysis'],

    steps: [
      {
        id: 'sandworm-step-1',
        title: 'NotPetya Supply Chain & Wiper Analysis',
        guidance: 'Start with the M.E.Doc supply chain compromise. The attackers trojanized the update mechanism of widely-used Ukrainian accounting software. Analyze how NotPetya used EternalBlue (MS17-010) and Mimikatz-like credential harvesting to propagate through networks. Critically, NotPetya\'s encryption was intentionally irreversible — the MFT encryption key was generated randomly and never transmitted to the attacker, making it a wiper.',
        toolsForStep: ['VirusTotal', 'YARA', 'Network forensics'],
        questions: [
          'How was the M.E.Doc update server compromised?',
          'What propagation mechanisms did NotPetya use beyond EternalBlue?',
          'How can you distinguish NotPetya from actual Petya ransomware?',
          'Why did the damage spread far beyond Ukraine?'
        ],
        redFlags: [
          'Ransomware that provides no viable decryption mechanism',
          'Use of legitimate software update channels for malware delivery',
          'Combination of exploit (EternalBlue) and credential-based lateral movement',
          'Destruction of Master Boot Record and Master File Table'
        ],
        successIndicators: [
          'Identified the irreversible encryption as wiper indicator',
          'Mapped the propagation chain from M.E.Doc to global impact',
          'Understood why patching MS17-010 alone was insufficient'
        ],
        nextStepConditions: [
          { condition: 'notpetya_analyzed', nextStep: 'sandworm-step-2', rationale: 'Understanding NotPetya\'s destructive capabilities provides context for Sandworm\'s ICS-targeted operations.' }
        ]
      },
      {
        id: 'sandworm-step-2',
        title: 'Industroyer ICS Protocol Analysis',
        guidance: 'Industroyer/CrashOverride is unique because it implements native ICS protocols (IEC 61850, IEC 104, OPC DA) to directly manipulate power grid equipment. Unlike most IT malware, it doesn\'t exploit vulnerabilities — it speaks the legitimate protocols to send legitimate commands (like opening circuit breakers). Analyze the protocol implementations using Wireshark captures from public research.',
        toolsForStep: ['Wireshark', 'ICS protocol analyzers', 'SCADA simulation'],
        questions: [
          'What ICS protocols does Industroyer implement natively?',
          'How does it send commands to open circuit breakers?',
          'Why is this approach more dangerous than exploiting vulnerabilities?',
          'What physical safety systems (relays, breakers) provide last-resort protection?'
        ],
        redFlags: [
          'Legitimate ICS protocol commands from unauthorized sources',
          'Unusual communication patterns on OT network segments',
          'Modification of relay protection settings (SIPROTEC targeting)',
          'Wiping of Windows Event Logs and ICS historian data'
        ],
        successIndicators: [
          'Identified all four ICS protocol modules in Industroyer',
          'Understood the difference between IT and OT attack methodology',
          'Recognized why protocol-level attacks bypass traditional security'
        ],
        nextStepConditions: [
          { condition: 'ics_protocols_understood', nextStep: 'sandworm-step-3', rationale: 'Protocol-level understanding enables building proper ICS network monitoring.' }
        ]
      },
      {
        id: 'sandworm-step-3',
        title: 'Cross-Campaign Attribution',
        guidance: 'Connect NotPetya, Industroyer, and Olympic Destroyer through shared infrastructure and TTPs. The DOJ indictment of six GRU Unit 74455 officers provides the authoritative attribution evidence. Analyze how operational patterns remain consistent across campaigns despite target diversity.',
        toolsForStep: ['Maltego', 'PassiveDNS', 'MITRE ATT&CK Navigator'],
        questions: [
          'What infrastructure was shared across Sandworm campaigns?',
          'How do TTPs remain consistent from grid attacks to NotPetya?',
          'What role did Olympic Destroyer play in Sandworm\'s portfolio?',
          'How does the DOJ indictment support technical attribution?'
        ],
        redFlags: [
          'Reused C2 infrastructure across campaigns',
          'Consistent malware development patterns and coding style',
          'Shared operational timing with Russian geopolitical events',
          'Destruction-focused objectives rather than espionage'
        ],
        successIndicators: [
          'Mapped infrastructure overlaps across 3+ campaigns',
          'Connected technical indicators to DOJ indictment evidence',
          'Documented Sandworm\'s evolution over time'
        ],
        nextStepConditions: [
          { condition: 'attribution_complete', nextStep: 'sandworm-step-4', rationale: 'Full attribution enables comprehensive defensive recommendations.' }
        ]
      },
      {
        id: 'sandworm-step-4',
        title: 'ICS Defense Strategy',
        guidance: 'Develop a comprehensive ICS defense strategy based on lessons from Sandworm campaigns. Apply the Purdue Model for network segmentation, implement ICS-specific monitoring, and create incident response procedures for OT environments. Reference NIST SP 800-82 and IEC 62443.',
        toolsForStep: ['ICS network monitoring', 'Purdue Model', 'NIST frameworks'],
        questions: [
          'How should IT and OT networks be segmented?',
          'What monitoring is needed at each Purdue Model level?',
          'How do ICS incident response procedures differ from IT?',
          'What compensating controls exist when patching isn\'t possible?'
        ],
        redFlags: [
          'Flat networks with no IT/OT segmentation',
          'ICS devices directly accessible from corporate network',
          'No protocol-level monitoring on OT networks',
          'Reliance on IT security tools for OT environments'
        ],
        successIndicators: [
          'Designed network architecture using Purdue Model',
          'Created ICS-specific monitoring strategy',
          'Documented OT incident response procedures',
          'Identified critical safety system protections'
        ],
        nextStepConditions: []
      }
    ],

    adaptivePrompts: [
      'NotPetya\'s MBR encryption used a different algorithm than original Petya — the key derivation was intentionally broken. Compare the two to understand the wiper disguise.',
      'Industroyer\'s IEC 104 module sends legitimate "select and execute" commands to circuit breakers. In Wireshark, filter for ASDU type 45-46 (single/double command) from unusual source IPs.',
      'The DOJ indictment names six specific GRU officers and maps their roles: developers, operators, and spear-phishing specialists. Use this to understand the organizational structure of a state APT unit.'
    ],

    learningObjectives: [
      { goal: 'ics_security', weight: 10, description: 'Master ICS/SCADA security and attack methodology' },
      { goal: 'destructive_malware', weight: 9, description: 'Analyze destructive cyber operations and wiper malware' },
      { goal: 'critical_infrastructure', weight: 8, description: 'Understand critical infrastructure defense strategies' }
    ],
    skillsRequired: ['Network protocol analysis', 'Malware analysis fundamentals', 'Understanding of industrial control systems', 'Supply chain security concepts'],
    skillsTaught: ['ICS protocol analysis (IEC 61850, IEC 104)', 'Wiper malware identification', 'OT network defense architecture', 'Critical infrastructure incident response', 'Cross-campaign APT tracking'],
    learningOutcomes: [
      'Distinguish wiper malware from ransomware through technical analysis',
      'Analyze ICS-specific malware that uses legitimate protocols',
      'Design defense-in-depth architectures for OT environments',
      'Conduct cross-campaign attribution analysis',
      'Develop ICS incident response procedures'
    ],
    industryContext: 'Sandworm\'s operations demonstrated that cyberattacks can cause physical-world damage at scale. NotPetya caused $10B+ in damages globally. The Ukraine grid attacks proved that power infrastructure can be remotely disrupted. These cases drive ICS security investment and regulation worldwide.',
    realWorldExamples: [
      'DOJ Indictment: United States v. Andrienko et al. (2020)',
      'ESET Industroyer/CrashOverride Technical Analysis',
      'Dragos CrashOverride ICS Malware Report',
      'CISA ICS-CERT Advisory on CrashOverride',
      'Wired "Sandworm" by Andy Greenberg (definitive account)'
    ],
    careerPaths: ['ICS Security Engineer', 'Critical Infrastructure Analyst', 'OT Incident Responder', 'National Security Cyber Analyst'],

    teachingAdaptations: {
      experiential: 'Set up a virtual ICS environment (GRFICSv2 or similar) and simulate Industroyer-style commands. Observe circuit breaker state changes. Then implement detection rules and test them against replayed attack traffic.',
      visual: 'Draw the Purdue Model layers and map where each Sandworm attack operated. Overlay NotPetya propagation across a corporate network diagram. Visualize the M.E.Doc supply chain from vendor to victim.',
      analytical: 'Deep-dive into ICS protocol specifications (IEC 61850, IEC 104). Understand why legitimate protocol commands are dangerous — there is no authentication in many ICS protocols. Analyze the NIST SP 800-82 framework.',
      social: 'NotPetya is a landmark case in cyber conflict law and insurance. Discuss the Mondelez vs. Zurich insurance case (war exclusion clause). Debate whether NotPetya constituted an act of war. Review the international response.',
      pragmatic: 'For defenders: segment IT/OT now, deploy protocol-aware ICS monitoring (Dragos, Claroty, Nozomi), create offline backups, and test ICS incident response procedures. These are the immediate actions that reduce risk.'
    }
  },

  {
    id: 'apt1_mandiant',
    name: 'APT1: Comment Crew Investigation',
    icon: '🐉',
    description: 'Investigate PLA Unit 61398 (APT1) based on Mandiant\'s landmark 2013 report. Trace the WEBC2 malware family, Shanghai infrastructure, and multi-year espionage campaign against 141+ organizations.',
    difficulty: 'intermediate',
    estimatedTime: '45-60 min',
    tags: ['APT', 'China', 'PLA', 'Espionage'],
    color: 'yellow',

    targetFields: [
      { key: 'c2_domain', label: 'Known C2 Domain', type: 'domain', required: true, placeholder: 'hugesoft[.]org' },
      { key: 'ip_range', label: 'APT1 IP Range', type: 'ip', required: false, placeholder: '58.246.0.0/15' },
      { key: 'malware_family', label: 'Malware Family', type: 'text', required: false, placeholder: 'WEBC2-DIV' }
    ],
    dummyTargets: {
      c2_domain: 'hugesoft[.]org',
      ip_range: '58.246.0.0/15',
      malware_family: 'WEBC2-DIV'
    },

    starterPrompt: `🐉 OPERATION COMMENT CREW — APT1 INVESTIGATION

CASE BRIEFING:
In February 2013, Mandiant published "APT1: Exposing One of China's Cyber Espionage Units," a groundbreaking report that publicly attributed sustained cyber espionage to PLA Unit 61398, operating from a 12-story building in Shanghai's Pudong district.

The report documented:
- 141+ organizations compromised across 20 industries
- Hundreds of terabytes of data stolen over 7+ years
- 40+ malware families including the WEBC2 series
- Infrastructure traced to Shanghai's Datong Road

Known C2 domains from the report: hugesoft[.]org, auaborede[.]com, dnlookupdns[.]com
Known IP ranges: 58.246.0.0/15 (Shanghai Pudong, China Telecom)

YOUR MISSION:
This is an excellent introductory APT investigation — Mandiant's report provides extensive public IOCs, infrastructure details, and attribution evidence.

🔍 PHASE 1: INFRASTRUCTURE RECONNAISSANCE
- Start with the known C2 domains from the Mandiant report
- Use PassiveDNS to trace historical IP resolutions
- Identify hosting patterns in the Shanghai IP ranges
- Map domain registration patterns (registrar, dates, privacy)
- MITRE: T1583.001, T1071.001

Investigation tasks:
- Resolve known C2 domains and check current/historical IPs
- Do the IPs fall within the 58.246.0.0/15 range?
- What registrar was used? Any bulk registration patterns?
- Can you find additional domains using the same infrastructure?

🦠 PHASE 2: WEBC2 MALWARE FAMILY ANALYSIS
- APT1 used the WEBC2 family — a backdoor that receives commands from web pages
- WEBC2-DIV reads commands from <div> tags on attacker-controlled websites
- WEBC2-TABLE reads commands from <table> tags
- This technique allows C2 traffic to blend with normal web browsing
- MITRE: T1059.001, T1071.001, T1005

Analysis tasks:
- How does WEBC2 hide C2 commands in HTML?
- What makes this technique effective for evading detection?
- How would you write a detection rule for this behavior?
- Search VirusTotal for known WEBC2 hashes from the report

👤 PHASE 3: ATTRIBUTION — FROM IP TO BUILDING
- Mandiant traced operations to a specific PLA unit building
- Methods used: IP geolocation, telecom infrastructure mapping, personnel OSINT
- The report identified specific operators by their online personas
- DOJ later indicted 5 PLA officers in 2014

Attribution methodology:
- How did Mandiant trace IPs to a specific building?
- What OPSEC failures revealed operator identities?
- How were online personas linked to real PLA officers?
- What role did China Telecom infrastructure play?

📋 PHASE 4: DETECTION & HUNTING
- Create detection rules for WEBC2 C2 patterns
- Develop hunting queries for APT1 TTPs
- Document the investigation methodology for training
- Understand how this report changed the cyber threat landscape

REFERENCE MATERIALS:
- Mandiant APT1 Report (2013) — Full report freely available
- DOJ Indictment: United States v. Wang Dong et al. (2014)
- MITRE ATT&CK Group G0006
- CISA China Cyber Threat Overview

This campaign is ideal for learning APT investigation fundamentals. The abundance of public data makes it an excellent training case.`,

    objectives: [
      'Map APT1 C2 infrastructure using PassiveDNS and WHOIS',
      'Analyze WEBC2 malware family C2 technique',
      'Understand the attribution methodology from IP to PLA unit',
      'Create detection rules for WEBC2-style C2 patterns',
      'Learn foundational APT investigation methodology'
    ],
    tools: ['WHOIS', 'PassiveDNS', 'VirusTotal', 'Maltego', 'YARA'],

    steps: [
      {
        id: 'apt1-step-1',
        title: 'C2 Infrastructure Mapping',
        guidance: 'Begin with the known C2 domains from the Mandiant report: hugesoft[.]org, auaborede[.]com, dnlookupdns[.]com. Use PassiveDNS services to find historical IP resolutions. Check if these IPs fall within the 58.246.0.0/15 range associated with Shanghai Pudong. Use WHOIS to analyze domain registration patterns.',
        toolsForStep: ['PassiveDNS', 'WHOIS', 'Maltego'],
        questions: [
          'What IPs do the known C2 domains resolve to?',
          'Are there other domains hosted on the same IPs?',
          'What registration patterns do the domains share?',
          'Can you identify the geographic location of the infrastructure?'
        ],
        redFlags: [
          'Multiple domains resolving to the same IP range',
          'Domains registered in bulk around the same dates',
          'Use of privacy protection services to hide registrant',
          'Infrastructure concentrated in a specific geographic area'
        ],
        successIndicators: [
          'Mapped multiple C2 domains to Shanghai IP ranges',
          'Identified domain registration patterns',
          'Discovered additional previously unknown C2 domains'
        ],
        nextStepConditions: [
          { condition: 'infrastructure_mapped', nextStep: 'apt1-step-2', rationale: 'Infrastructure mapping provides the C2 endpoints to analyze malware communications.' }
        ]
      },
      {
        id: 'apt1-step-2',
        title: 'WEBC2 Malware Analysis',
        guidance: 'The WEBC2 family is unique in how it receives C2 commands. WEBC2-DIV fetches a web page and reads commands embedded in HTML <div> tags. WEBC2-TABLE reads from <table> tags. This makes the C2 traffic look like normal web browsing. Analyze public sandbox reports and VirusTotal entries for known WEBC2 samples.',
        toolsForStep: ['VirusTotal', 'YARA', 'CyberChef'],
        questions: [
          'How does WEBC2-DIV extract commands from HTML?',
          'What HTTP request patterns distinguish WEBC2 from normal browsing?',
          'What data exfiltration methods does APT1 use?',
          'How would you detect WEBC2 C2 in proxy logs?'
        ],
        redFlags: [
          'HTTP requests to known C2 domains with specific User-Agent patterns',
          'Periodic web requests that download full HTML pages (command pages)',
          'Outbound data transfers to the same domains (exfiltration)',
          'Process injection or DLL side-loading techniques'
        ],
        successIndicators: [
          'Understood the HTML-based C2 mechanism',
          'Identified network-level detection opportunities',
          'Created a YARA rule for WEBC2 family identification'
        ],
        nextStepConditions: [
          { condition: 'malware_understood', nextStep: 'apt1-step-3', rationale: 'Understanding malware behavior enables analysis of how Mandiant attributed the campaign.' }
        ]
      },
      {
        id: 'apt1-step-3',
        title: 'Attribution Methodology Study',
        guidance: 'Study how Mandiant attributed APT1 to PLA Unit 61398. They used a combination of: IP geolocation to the Pudong district, China Telecom fiber optic line records, OPSEC failures by operators (reused personas), and analysis of working hours patterns. This methodology became the template for modern APT attribution.',
        toolsForStep: ['Maltego', 'OSINT tools', 'Timeline analysis'],
        questions: [
          'How did working-hours analysis support attribution?',
          'What OPSEC mistakes did APT1 operators make?',
          'How were online personas linked to real-world identities?',
          'What evidence was strong enough for a DOJ indictment?'
        ],
        redFlags: [
          'Operators reusing personal email addresses in infrastructure registration',
          'Login patterns matching Beijing time zone working hours',
          'Social media profiles linked to hacking personas',
          'Physical infrastructure traced to a specific military facility'
        ],
        successIndicators: [
          'Understood the multi-source attribution methodology',
          'Identified key OPSEC failures that enabled attribution',
          'Connected technical indicators to DOJ indictment evidence'
        ],
        nextStepConditions: [
          { condition: 'attribution_understood', nextStep: 'apt1-step-4', rationale: 'Attribution methodology knowledge enables creating professional threat intelligence products.' }
        ]
      },
      {
        id: 'apt1-step-4',
        title: 'Detection Rules & Report',
        guidance: 'Create detection content and a structured threat intelligence report. Write YARA rules for WEBC2 variants, network detection signatures for the C2 pattern, and compile your findings into a professional threat brief. Consider how this report changed the cybersecurity industry — it was the first major public attribution of state-sponsored hacking.',
        toolsForStep: ['YARA', 'Sigma', 'Report template'],
        questions: [
          'What YARA rule covers the WEBC2 malware family?',
          'What network signatures detect HTML-based C2?',
          'How did this report change public discourse on APT threats?',
          'What defenses are effective against APT1-style espionage?'
        ],
        redFlags: [
          'Detection rules that only match one variant',
          'Incomplete kill chain coverage',
          'Attribution claims without rigorous evidence'
        ],
        successIndicators: [
          'Created robust WEBC2 detection signatures',
          'Produced a professional threat intelligence report',
          'Understood the historical significance of the APT1 report'
        ],
        nextStepConditions: []
      }
    ],

    adaptivePrompts: [
      'The Mandiant report identified APT1 operators by their online personas (e.g., "UglyGorilla", "DOTA"). Search for these aliases in public databases to understand the OPSEC failures.',
      'WEBC2-DIV communicates by fetching a web page and parsing specific HTML tags. Try creating a mock C2 page to understand how commands are embedded in normal-looking HTML.',
      'China Telecom allocated special fiber optic lines to the PLA unit building. This physical infrastructure detail was a key piece of the attribution puzzle.'
    ],

    learningObjectives: [
      { goal: 'threat_intelligence', weight: 10, description: 'Learn foundational APT investigation and attribution' },
      { goal: 'osint_investigation', weight: 8, description: 'Apply OSINT techniques to infrastructure analysis' },
      { goal: 'malware_analysis', weight: 6, description: 'Analyze command-and-control techniques' }
    ],
    skillsRequired: ['Basic OSINT', 'DNS fundamentals', 'HTTP protocol basics', 'Malware analysis concepts'],
    skillsTaught: ['APT campaign analysis', 'Infrastructure pivoting', 'Attribution methodology', 'WEBC2 malware family analysis', 'Professional threat reporting'],
    learningOutcomes: [
      'Conduct infrastructure analysis using PassiveDNS and WHOIS',
      'Analyze HTML-based C2 communication techniques',
      'Understand multi-source APT attribution methodology',
      'Create professional threat intelligence products',
      'Appreciate the historical evolution of public APT research'
    ],
    industryContext: 'The Mandiant APT1 report (2013) was a watershed moment in cybersecurity. It was the first major public attribution of state-sponsored cyber espionage with detailed evidence, leading to the first-ever criminal charges against foreign military hackers (DOJ 2014). It established the template for modern threat intelligence reporting.',
    realWorldExamples: [
      'Mandiant APT1: Exposing One of China\'s Cyber Espionage Units (2013)',
      'DOJ Indictment: United States v. Wang Dong et al. (2014)',
      'MITRE ATT&CK Group G0006 Profile',
      'Congressional testimony on Chinese cyber espionage'
    ],
    careerPaths: ['Threat Intelligence Analyst', 'SOC Analyst', 'Cyber Crime Investigator', 'OSINT Analyst'],

    teachingAdaptations: {
      experiential: 'Start by looking up the known C2 domains on VirusTotal and PassiveDNS services. Click through the results, pivot on IPs, find related domains. Build your infrastructure map organically by following connections.',
      visual: 'Use Maltego to build a visual graph starting from the known domains. Add IP addresses, then connected domains, then WHOIS registrants. Watch the cluster emerge around Shanghai infrastructure. Color-code by data type.',
      analytical: 'Read the full Mandiant APT1 report (74 pages). It is the gold standard for threat intelligence reporting. Study the evidence methodology: how they moved from network indicators to physical attribution to individual operators.',
      social: 'The APT1 report sparked a diplomatic crisis between the US and China. Discuss the geopolitical implications: the Obama-Xi cyber agreement, the debate about "naming and shaming," and how public attribution changed international norms.',
      pragmatic: 'Extract all IOCs from the Mandiant report appendix, load them into your SIEM, and search historical logs. That gives you immediate detection coverage. Then write YARA rules for WEBC2 and deploy to your endpoint platform.'
    }
  },

  {
    id: 'apt41_double_dragon',
    name: 'APT41: Double Dragon Operations',
    icon: '🐲',
    description: 'Investigate APT41 (Double Dragon/Winnti) — a unique dual-purpose group conducting state-sponsored espionage AND personal financial cybercrime. Based on the 2020 DOJ indictment.',
    difficulty: 'advanced',
    estimatedTime: '60-90 min',
    tags: ['APT', 'China', 'MSS', 'Supply Chain', 'Dual-Purpose'],
    color: 'green',

    targetFields: [
      { key: 'supply_chain_target', label: 'Compromised Software Vendor', type: 'org', required: true, placeholder: 'CCleaner / ASUS LiveUpdate' },
      { key: 'malware_hash', label: 'Winnti Backdoor Hash', type: 'hash', required: false, placeholder: 'Winnti 4.0 sample hash' },
      { key: 'c2_domain', label: 'C2 Domain', type: 'domain', required: false, placeholder: 'routfrede[.]com' }
    ],
    dummyTargets: {
      supply_chain_target: 'CCleaner',
      malware_hash: 'ab3c1db0d23dcb13bec7b3e6ba8c4a3a2bcbf0d3d8f81a9b6f2c0e7f1d5a9c2e',
      c2_domain: 'routfrede[.]com'
    },

    starterPrompt: `🐲 OPERATION DOUBLE DRAGON — APT41 DUAL-PURPOSE INVESTIGATION

CASE BRIEFING:
APT41 (also known as Double Dragon, Winnti, Barium, Wicked Panda) is unique among APT groups: they conduct BOTH state-sponsored espionage for the Chinese government AND personal for-profit cybercrime operations, often using the same tools and infrastructure.

In September 2020, the DOJ indicted five Chinese nationals and two Malaysian nationals connected to APT41 operations spanning supply chain attacks, ransomware, cryptocurrency mining, and espionage against governments, telecoms, and healthcare organizations.

Notable APT41 operations:
- CCleaner supply chain attack (2017): Trojanized Avast's CCleaner with 2.27M downloads
- ASUS LiveUpdate supply chain attack (2019): Operation ShadowHammer targeting specific MACs
- Video game industry attacks: Manipulating virtual currencies for profit
- COVID-19 SBA loan fraud: Using hacking skills for personal financial gain

YOUR MISSION:
Investigate APT41's dual operations to understand how a single group operates under two mandates.

🔗 PHASE 1: SUPPLY CHAIN ATTACK ANALYSIS
- Analyze the CCleaner compromise: how did they inject code into a legitimate build?
- The trojanized CCleaner v5.33 contained a first-stage loader targeting specific organizations
- Only 40 high-value targets received the second-stage payload (espionage selection)
- Compare with ASUS ShadowHammer: targeted by specific MAC addresses
- MITRE: T1195.002

Investigation tasks:
- How did APT41 compromise the CCleaner build environment?
- What made the target selection mechanism sophisticated?
- How does the 2.27M → 40 targeting funnel work?
- What are the overlaps with the ASUS ShadowHammer approach?

🎮 PHASE 2: CYBERCRIME OPERATIONS
- APT41 members conducted for-profit operations during off-hours
- Video game currency manipulation and virtual item theft
- Ransomware deployment against non-Chinese targets
- Cryptocurrency mining on compromised infrastructure
- COVID-19 SBA loan fraud scheme

Analysis:
- How did operators separate espionage from cybercrime tasks?
- What tools were shared between both operation types?
- How did the DOJ distinguish state-directed vs. personal operations?
- What does this reveal about the MSS-contractor relationship?

🦠 PHASE 3: WINNTI MALWARE ECOSYSTEM
- Winnti backdoor family has evolved since 2010
- Used across dozens of APT groups (shared tool)
- Rootkit capabilities with kernel-mode components
- MITRE: T1059, T1053, T1071, T1027

Malware analysis:
- What makes Winnti attribution challenging (shared across groups)?
- What are the key technical indicators of Winnti variants?
- How does the kernel-mode rootkit component work?
- What detection strategies work for Winnti families?

📋 PHASE 4: ATTRIBUTION & LEGAL RESPONSE
- The DOJ indictment provides detailed attribution evidence
- Malaysian nationals arrested and extradited
- International cooperation in investigation
- Document the evidence standards for prosecution

REFERENCE MATERIALS:
- DOJ Indictment: United States v. Zhang Haoran et al. (2020)
- Mandiant APT41: A Dual Espionage and Cyber Crime Operation
- Avast/Piriform CCleaner Incident Report
- Kaspersky Operation ShadowHammer Analysis

Begin your investigation into this unique dual-purpose threat actor.`,

    objectives: [
      'Analyze APT41 supply chain attacks (CCleaner, ASUS)',
      'Understand dual espionage/cybercrime operations model',
      'Investigate Winnti malware ecosystem and attribution challenges',
      'Study DOJ indictment evidence and legal response',
      'Create detection strategies for APT41 TTPs'
    ],
    tools: ['Atropos Scanner', 'VirusTotal', 'Shodan', 'YARA', 'Maltego'],

    steps: [
      {
        id: 'apt41-step-1',
        title: 'Supply Chain Attack Reconstruction',
        guidance: 'Analyze the CCleaner supply chain compromise. APT41 compromised the build environment of Piriform (owned by Avast) and injected a first-stage payload into CCleaner v5.33. The trojanized version was downloaded 2.27 million times, but only 40 organizations received the second-stage payload — demonstrating surgical targeting within a mass-distribution supply chain attack.',
        toolsForStep: ['VirusTotal', 'Avast incident report'],
        questions: [
          'How was the CCleaner build environment compromised?',
          'What criteria selected the 40 targets from 2.27M installations?',
          'How was the second-stage payload delivered only to selected targets?',
          'What similarities exist between CCleaner and ASUS ShadowHammer?'
        ],
        redFlags: [
          'Legitimate software with valid digital signatures containing malware',
          'Beacon-home behavior from trusted applications',
          'Selective payload delivery based on domain or hardware identifiers',
          'Build infrastructure with unauthorized access'
        ],
        successIndicators: [
          'Understood the selective targeting mechanism',
          'Compared two supply chain attacks for common patterns',
          'Identified detection opportunities for trojanized updates'
        ],
        nextStepConditions: [
          { condition: 'supply_chain_analyzed', nextStep: 'apt41-step-2', rationale: 'Understanding the espionage operations provides contrast with cybercrime activities.' }
        ]
      },
      {
        id: 'apt41-step-2',
        title: 'Cybercrime Operations Analysis',
        guidance: 'APT41 is unique because members conducted personal for-profit cybercrime alongside state-directed espionage. Analyze the video game industry attacks (virtual currency theft), ransomware operations, and the COVID-19 SBA loan fraud. The DOJ indictment separates these activities and documents how operators used the same infrastructure for both purposes.',
        toolsForStep: ['DOJ court documents', 'OSINT tools'],
        questions: [
          'How did APT41 operators separate state and personal operations?',
          'What tools and infrastructure were shared between both?',
          'How did the MSS relationship enable and tolerate cybercrime?',
          'What evidence distinguished state-directed from personal operations?'
        ],
        redFlags: [
          'Same C2 infrastructure used for espionage and ransomware',
          'Off-hours operations using state-sponsored tools',
          'Targeting patterns inconsistent with espionage objectives',
          'Financial fraud schemes using hacking capabilities'
        ],
        successIndicators: [
          'Distinguished espionage from cybercrime operations',
          'Identified shared infrastructure and tools',
          'Understood the state-contractor relationship model'
        ],
        nextStepConditions: [
          { condition: 'dual_purpose_understood', nextStep: 'apt41-step-3', rationale: 'Understanding the dual operations model informs analysis of the Winnti toolset used by both.' }
        ]
      },
      {
        id: 'apt41-step-3',
        title: 'Winnti Malware Ecosystem',
        guidance: 'The Winnti backdoor family is shared across multiple Chinese APT groups, making single-group attribution challenging. Analyze the technical evolution of Winnti from early variants to the current kernel-mode rootkit. Understand why shared tooling complicates attribution and how analysts distinguish groups.',
        toolsForStep: ['VirusTotal', 'YARA', 'Shodan'],
        questions: [
          'What makes Winnti attribution to a specific group difficult?',
          'How do analysts distinguish APT41 from other Winnti users?',
          'What are the kernel-mode rootkit capabilities?',
          'How has the Winnti family evolved over a decade?'
        ],
        redFlags: [
          'Kernel-mode rootkit hiding malware processes and files',
          'Digitally signed drivers used for rootkit installation',
          'DNS-based C2 channels for stealthy communication',
          'Shared code with other Chinese APT groups'
        ],
        successIndicators: [
          'Identified key Winnti family indicators across versions',
          'Understood shared tooling attribution challenges',
          'Created detection rules accounting for variant diversity'
        ],
        nextStepConditions: [
          { condition: 'winnti_analyzed', nextStep: 'apt41-step-4', rationale: 'Complete technical analysis enables comprehensive reporting and detection.' }
        ]
      },
      {
        id: 'apt41-step-4',
        title: 'Reporting & Detection Strategy',
        guidance: 'Compile your findings into a comprehensive threat actor profile. Address the unique dual-purpose nature, supply chain attack patterns, and shared tooling challenges. Create detection rules that account for the breadth of APT41 operations.',
        toolsForStep: ['YARA', 'Sigma', 'MITRE ATT&CK Navigator'],
        questions: [
          'How do you write a threat actor profile for a dual-purpose group?',
          'What detection priorities differ for espionage vs. cybercrime?',
          'How should organizations assess supply chain risk from APT41?',
          'What policy recommendations follow from the DOJ indictment?'
        ],
        redFlags: [
          'Reports that only cover one aspect (espionage OR cybercrime)',
          'Detection rules too narrow for the diverse operation scope',
          'Ignoring supply chain risk in favor of endpoint detection only'
        ],
        successIndicators: [
          'Comprehensive dual-purpose threat actor profile',
          'Multi-layered detection strategy covering supply chain and endpoints',
          'Supply chain security recommendations for software vendors'
        ],
        nextStepConditions: []
      }
    ],

    adaptivePrompts: [
      'The CCleaner second-stage payload checked the victim\'s domain against a hardcoded list of target organizations. This target list is published — review it to understand APT41\'s espionage priorities.',
      'APT41 operators were caught because they used the same infrastructure for state espionage and personal SBA loan fraud. This OPSEC failure is a key lesson in how dual-purpose operations create risk.',
      'Look at the Winnti rootkit\'s use of stolen code-signing certificates — they frequently use certificates stolen from previous victims to sign their kernel drivers.'
    ],

    learningObjectives: [
      { goal: 'threat_intelligence', weight: 10, description: 'Analyze a complex dual-purpose threat actor' },
      { goal: 'supply_chain_security', weight: 8, description: 'Understand advanced supply chain attack methodology' },
      { goal: 'malware_analysis', weight: 7, description: 'Analyze shared malware tooling and attribution challenges' }
    ],
    skillsRequired: ['Intermediate threat intelligence', 'Malware analysis basics', 'Supply chain security concepts', 'Legal/policy awareness'],
    skillsTaught: ['Dual-purpose APT analysis', 'Supply chain attack investigation', 'Shared tooling attribution', 'Legal evidence analysis', 'Rootkit detection'],
    learningOutcomes: [
      'Analyze dual-purpose (espionage + cybercrime) threat actors',
      'Investigate sophisticated supply chain attacks',
      'Navigate attribution challenges with shared malware tooling',
      'Understand legal frameworks for prosecuting APT operators',
      'Develop supply chain security assessment methodologies'
    ],
    industryContext: 'APT41 represents the blurring of nation-state and criminal cyber operations. Their dual mandate — state espionage plus personal profit — is increasingly common among Chinese and Russian contractors. Understanding this model is essential for modern threat intelligence.',
    realWorldExamples: [
      'DOJ Indictment: United States v. Zhang Haoran et al. (2020)',
      'Mandiant APT41: Dual Espionage and Cyber Crime Operation',
      'Avast CCleaner Supply Chain Incident (2017)',
      'Kaspersky Operation ShadowHammer / ASUS LiveUpdate (2019)'
    ],
    careerPaths: ['Senior Threat Intelligence Analyst', 'Supply Chain Security Specialist', 'Cyber Policy Analyst', 'Malware Reverse Engineer'],

    teachingAdaptations: {
      experiential: 'Download the published CCleaner IOCs and Winnti YARA rules. Search VirusTotal for related samples. Try to identify the targeting criteria from the second-stage payload configuration. Hands-on with the samples teaches more than reading reports.',
      visual: 'Create two parallel operation diagrams: one for espionage campaigns (supply chain → target selection → data theft) and one for cybercrime (game hacking → currency theft → laundering). Highlight shared infrastructure where the two overlap.',
      analytical: 'Study the DOJ indictment carefully — it distinguishes between state-directed operations (charges include conspiracy to commit computer intrusions) and personal operations (wire fraud, identity theft). Analyze how the legal framework separates the two.',
      social: 'APT41 raises fascinating questions about the state-hacker relationship. Discuss: Does the state tolerate cybercrime as payment for espionage services? How does this compare to the Russian model? Review the FireEye/Mandiant research team\'s approach to publishing.',
      pragmatic: 'For software vendors: audit your build pipeline, implement reproducible builds, verify code signing integrity. For defenders: monitor for Winnti IOCs, watch for supply chain indicators, and assume updates can be weaponized.'
    }
  },

  {
    id: 'hafnium_proxylogon',
    name: 'HAFNIUM: ProxyLogon Exchange Attack',
    icon: '📧',
    description: 'Investigate the 2021 Microsoft Exchange Server mass exploitation (ProxyLogon). Analyze CVE-2021-26855 exploitation, web shell deployment, and credential dumping across 30,000+ compromised servers.',
    difficulty: 'intermediate',
    estimatedTime: '45-60 min',
    tags: ['APT', 'China', 'Exchange', 'Web Shell'],
    color: 'blue',

    targetFields: [
      { key: 'exchange_server', label: 'Exchange Server IP/Hostname', type: 'ip', required: true, placeholder: '10.0.0.25' },
      { key: 'webshell_hash', label: 'Web Shell Hash', type: 'hash', required: false, placeholder: 'b75f163ca9b9240bf4b37ad92bc7556b40a17e27c2b8ed5c8991385fe07d17d0' },
      { key: 'cisa_advisory', label: 'CISA Advisory ID', type: 'text', required: false, placeholder: 'AA21-062A' }
    ],
    dummyTargets: {
      exchange_server: '10.0.0.25',
      webshell_hash: 'b75f163ca9b9240bf4b37ad92bc7556b40a17e27c2b8ed5c8991385fe07d17d0',
      cisa_advisory: 'AA21-062A'
    },

    starterPrompt: `📧 OPERATION PROXYLOGON — HAFNIUM EXCHANGE SERVER INVESTIGATION

CASE BRIEFING:
In March 2021, Microsoft disclosed that HAFNIUM, a Chinese state-sponsored group, was actively exploiting four zero-day vulnerabilities in Microsoft Exchange Server. The attack chain, dubbed ProxyLogon, allowed unauthenticated remote code execution on any internet-facing Exchange server.

The vulnerabilities:
- CVE-2021-26855: Server-Side Request Forgery (SSRF) — allows authentication bypass
- CVE-2021-26857: Insecure deserialization in Unified Messaging
- CVE-2021-26858: Post-authentication arbitrary file write
- CVE-2021-27065: Post-authentication arbitrary file write

Attack chain: SSRF (bypass auth) → Write web shell → Execute commands → Dump credentials → Exfiltrate data

Within days of disclosure, an estimated 30,000+ US organizations and 250,000+ globally were compromised, as multiple threat groups began mass exploitation.

CISA Emergency Directive 21-02 and Advisory AA21-062A document the indicators.

YOUR MISSION:
Investigate a compromised Exchange server, identify web shells, and assess the scope of compromise.

🔓 PHASE 1: VULNERABILITY EXPLOITATION ANALYSIS
- Understand the ProxyLogon attack chain
- CVE-2021-26855 (SSRF) is the entry point — it allows an attacker to send HTTP requests as the Exchange server itself
- This bypasses authentication and enables access to backend APIs
- MITRE: T1190 (Exploit Public-Facing Application)

Investigation tasks:
- How does the SSRF vulnerability bypass authentication?
- What HTTP request patterns indicate exploitation attempts?
- Where do IIS logs record exploitation evidence?
- What is the /owa/auth/x.js path significance?

🕸️ PHASE 2: WEB SHELL DETECTION
- HAFNIUM deployed several web shell variants:
  - China Chopper: One-line ASPX web shell
  - SIMPLESEESHARP: Custom .NET web shell
  - SPORTSBALL: Custom web shell variant
- Web shells placed in: C:\\inetpub\\wwwroot\\aspnet_client\\
- Known hashes from CISA AA21-062A
- MITRE: T1505.003 (Web Shell)

Detection tasks:
- Search Exchange server directories for unauthorized .aspx files
- Analyze IIS logs for POST requests to unusual paths
- Compare file hashes against known web shell indicators
- Check file creation timestamps against patch timeline

🔑 PHASE 3: POST-EXPLOITATION — CREDENTIAL ACCESS
- After deploying web shells, HAFNIUM performed:
  - LSASS memory dumping (procdump, comsvcs.dll)
  - Active Directory replication (DCSync)
  - Offline email archive creation (.PST export)
  - Compression and staging for exfiltration
- MITRE: T1003.001, T1560.001

Analysis:
- What processes indicate LSASS credential dumping?
- How can you detect DCSync attacks?
- Where are staged exfiltration archives typically stored?
- What Exchange PowerShell commands export mailboxes?

📋 PHASE 4: INCIDENT RESPONSE & REMEDIATION
- Follow CISA guidance for Exchange compromise assessment
- Determine if compromise occurred before or after patching
- Assess whether web shells persist after patching
- Document remediation steps and lessons learned

Key detection indicators:
- IIS log entries with POST to /owa/auth/ paths
- .aspx files in aspnet_client directories
- procdump.exe or comsvcs.dll execution
- Large .7z or .zip files in staging directories
- Unusual Exchange PowerShell cmdlet usage

REFERENCE MATERIALS:
- CISA AA21-062A: Mitigate Microsoft Exchange Server Vulnerabilities
- CISA Emergency Directive 21-02
- Microsoft HAFNIUM Targeting Exchange Servers Blog
- Volexity Exchange Server Zero-Day Analysis

This is an excellent intermediate-level investigation with abundant public IOCs and straightforward analysis methodology.`,

    objectives: [
      'Understand the ProxyLogon exploit chain (CVE-2021-26855 through 27065)',
      'Detect and analyze deployed web shells on Exchange servers',
      'Identify post-exploitation credential dumping activity',
      'Follow CISA incident response guidance for Exchange compromise',
      'Create detection rules for ProxyLogon exploitation'
    ],
    tools: ['IIS log analysis', 'Web shell detection', 'Memory forensics', 'PowerShell analysis', 'YARA'],

    steps: [
      {
        id: 'hafnium-step-1',
        title: 'ProxyLogon Exploit Chain Analysis',
        guidance: 'Begin by understanding the vulnerability chain. CVE-2021-26855 is an SSRF that allows unauthenticated requests to backend Exchange services. The attacker sends a crafted HTTP request to /owa/auth/x.js or similar paths, impersonating the Exchange server to access backend APIs. This enables authentication bypass and sets up the subsequent file-write vulnerabilities. Analyze IIS logs for exploitation patterns.',
        toolsForStep: ['IIS logs', 'Web vulnerability analysis'],
        questions: [
          'What IIS log entries indicate SSRF exploitation attempts?',
          'How does the SSRF vulnerability bypass Exchange authentication?',
          'What HTTP paths and methods are used in the exploit chain?',
          'How quickly was mass exploitation observed after disclosure?'
        ],
        redFlags: [
          'POST requests to /owa/auth/ paths from external IPs',
          'HTTP requests with X-AnonResource-Backend or X-BEResource cookies',
          'Requests to /ecp/DDI/DDIService.svc paths',
          'Autodiscover.xml requests with crafted payloads'
        ],
        successIndicators: [
          'Identified exploitation indicators in IIS logs',
          'Understood the four-CVE attack chain sequence',
          'Determined the timeline of exploitation vs. patching'
        ],
        nextStepConditions: [
          { condition: 'exploit_chain_understood', nextStep: 'hafnium-step-2', rationale: 'Understanding the exploit chain leads to searching for deployed web shells.' }
        ]
      },
      {
        id: 'hafnium-step-2',
        title: 'Web Shell Detection & Analysis',
        guidance: 'HAFNIUM deployed multiple web shell variants in Exchange server directories, primarily C:\\inetpub\\wwwroot\\aspnet_client\\. China Chopper is a one-line ASPX web shell that is particularly difficult to detect due to its small size. Search for unauthorized .aspx files, analyze their content, and compare hashes against CISA published indicators.',
        toolsForStep: ['File system analysis', 'YARA', 'Hash comparison'],
        questions: [
          'What directories should be checked for unauthorized web shells?',
          'How do you identify a China Chopper web shell from its code?',
          'What file metadata (creation time, owner) reveals unauthorized placement?',
          'Can web shells persist after Exchange patches are applied?'
        ],
        redFlags: [
          '.aspx files in aspnet_client or OWA directories with recent creation dates',
          'Files owned by the IIS worker process account',
          'One-line ASPX files with eval() or unsafe functions',
          'Web shells created during known exploitation window'
        ],
        successIndicators: [
          'Found and classified web shell variants',
          'Confirmed web shell hashes against CISA indicators',
          'Determined whether web shells were deployed before or after patching'
        ],
        nextStepConditions: [
          { condition: 'webshells_identified', nextStep: 'hafnium-step-3', rationale: 'Web shell identification reveals the post-exploitation activity that followed.' }
        ]
      },
      {
        id: 'hafnium-step-3',
        title: 'Post-Exploitation Credential Access',
        guidance: 'After establishing web shell access, HAFNIUM typically performed credential dumping using procdump.exe or comsvcs.dll to dump LSASS memory. They also used Exchange PowerShell to export mailbox contents and staged exfiltration archives. Analyze endpoint logs and PowerShell transcripts for these activities.',
        toolsForStep: ['Memory forensics', 'PowerShell logs', 'EDR'],
        questions: [
          'What commands dump LSASS memory for credential extraction?',
          'How can you detect comsvcs.dll-based credential dumping?',
          'What Exchange PowerShell commands export mailbox data?',
          'Where are exfiltration archives typically staged?'
        ],
        redFlags: [
          'procdump.exe -ma lsass.exe execution',
          'rundll32 comsvcs.dll MiniDump with LSASS PID',
          'New-MailboxExportRequest PowerShell cmdlet',
          'Large archive files in C:\\ProgramData or temp directories'
        ],
        successIndicators: [
          'Identified credential dumping evidence',
          'Found data exfiltration staging areas',
          'Assessed scope of compromised credentials'
        ],
        nextStepConditions: [
          { condition: 'post_exploitation_analyzed', nextStep: 'hafnium-step-4', rationale: 'Full scope assessment enables comprehensive incident response.' }
        ]
      },
      {
        id: 'hafnium-step-4',
        title: 'Incident Response & Remediation',
        guidance: 'Follow CISA AA21-062A guidance for comprehensive Exchange compromise assessment. Determine remediation priority: patch, remove web shells, reset credentials, and monitor for persistent access. Document lessons learned including patch management and internet-facing service hardening.',
        toolsForStep: ['CISA guidance', 'Exchange Health Checker', 'AD assessment'],
        questions: [
          'What is the correct remediation order for ProxyLogon?',
          'Why is patching alone insufficient if web shells are already deployed?',
          'What credential resets are necessary after Exchange compromise?',
          'How should internet-facing Exchange be architected going forward?'
        ],
        redFlags: [
          'Patching without checking for existing web shells',
          'Not resetting credentials after LSASS dump evidence',
          'Assuming compromise ended after patching',
          'Not checking for additional backdoors beyond web shells'
        ],
        successIndicators: [
          'Followed CISA remediation guidance completely',
          'Verified no persistent access after remediation',
          'Documented lessons learned and hardening recommendations',
          'Created ongoing monitoring plan for re-compromise'
        ],
        nextStepConditions: []
      }
    ],

    adaptivePrompts: [
      'Check the IIS logs for requests containing "X-AnonResource-Backend" or "X-BEResource" — these are indicators of CVE-2021-26855 SSRF exploitation.',
      'China Chopper web shells are often just a single line: <%@ Page Language="Jscript"%><%eval(Request.Item["..."],"unsafe");%> — search for .aspx files under 1KB in web directories.',
      'The CISA tool "CHIRP" (CISA Hunt and Incident Response Program) was released to help detect ProxyLogon compromise indicators. Reference it for your analysis.'
    ],

    learningObjectives: [
      { goal: 'incident_response', weight: 10, description: 'Master Exchange Server compromise investigation and remediation' },
      { goal: 'web_security', weight: 8, description: 'Understand SSRF exploitation and web shell detection' },
      { goal: 'threat_intelligence', weight: 6, description: 'Apply CISA advisories to practical incident response' }
    ],
    skillsRequired: ['Windows Server administration basics', 'IIS log analysis', 'HTTP protocol understanding', 'Basic incident response'],
    skillsTaught: ['Exchange Server forensics', 'Web shell detection and analysis', 'SSRF exploitation understanding', 'CISA advisory implementation', 'Post-compromise credential assessment'],
    learningOutcomes: [
      'Investigate a mass-exploitation event using CISA guidance',
      'Detect and classify web shells on compromised servers',
      'Analyze post-exploitation credential dumping techniques',
      'Implement systematic incident response procedures',
      'Create hardening recommendations for internet-facing services'
    ],
    industryContext: 'ProxyLogon triggered CISA Emergency Directive 21-02 and demonstrated the risk of internet-facing on-premise email servers. It accelerated the migration to cloud-hosted email and influenced the debate about responsible disclosure timing for actively exploited vulnerabilities.',
    realWorldExamples: [
      'CISA AA21-062A: Mitigate Microsoft Exchange Server Vulnerabilities',
      'CISA Emergency Directive 21-02',
      'Microsoft HAFNIUM Targeting Exchange Servers',
      'Volexity Exchange Server Zero-Day Analysis',
      'Brian Krebs "At Least 30,000 U.S. Organizations Newly Hacked"'
    ],
    careerPaths: ['Incident Responder', 'SOC Analyst', 'Vulnerability Management Specialist', 'Windows Security Engineer'],

    teachingAdaptations: {
      experiential: 'Set up a lab Exchange server (or use a pre-built CTF environment) and examine IIS logs for exploitation patterns. Practice searching for web shells in the file system. Run the CISA CHIRP tool against a test environment.',
      visual: 'Draw the exploit chain: SSRF request → auth bypass → file write → web shell → credential dump → exfiltration. Create a timeline showing the gap between Microsoft disclosure and mass exploitation (48 hours).',
      analytical: 'Study each CVE in the chain technically. Read the original Volexity disclosure and the Microsoft response blog. Analyze why SSRF is the critical enabler and how each subsequent CVE builds on the previous one.',
      social: 'This case raised major questions about vulnerability disclosure. Discuss: Microsoft knew about exploitation in January but didn\'t patch until March. Multiple groups began mass exploitation within hours of the patch. How should disclosure be handled for actively exploited zero-days?',
      pragmatic: 'Run the Microsoft Exchange Health Checker script against your environment. Check for web shells with a simple PowerShell file search. Apply patches. Reset credentials. This is the checklist every admin needed to execute in March 2021.'
    }
  },

  {
    id: 'lazarus_crypto_heist',
    name: 'Lazarus Group: Crypto Heist Operations',
    icon: '💰',
    description: 'Investigate Lazarus Group (HIDDEN COBRA) financial operations: the $81M Bangladesh Bank SWIFT heist, WannaCry ransomware, and cryptocurrency exchange attacks totaling billions.',
    difficulty: 'advanced',
    estimatedTime: '60-90 min',
    tags: ['APT', 'DPRK', 'Financial', 'Cryptocurrency'],
    color: 'yellow',

    targetFields: [
      { key: 'swift_code', label: 'Target SWIFT BIC Code', type: 'text', required: true, placeholder: 'BABOREDE' },
      { key: 'wannacry_hash', label: 'WannaCry Sample Hash', type: 'hash', required: false, placeholder: '24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c' },
      { key: 'btc_wallet', label: 'Ransom Bitcoin Address', type: 'text', required: false, placeholder: '13AM4VW2dhxYgXeQepoHkHSQuy6NgaEb94' }
    ],
    dummyTargets: {
      swift_code: 'BABOREDE',
      wannacry_hash: '24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c',
      btc_wallet: '13AM4VW2dhxYgXeQepoHkHSQuy6NgaEb94'
    },

    starterPrompt: `💰 OPERATION HIDDEN COBRA — LAZARUS GROUP FINANCIAL INVESTIGATION

CASE BRIEFING:
Lazarus Group (HIDDEN COBRA) is North Korea's primary offensive cyber unit, responsible for some of the largest financial cyber heists in history. Unlike other APTs focused purely on espionage, Lazarus generates revenue for the DPRK regime — estimated at $1.7 billion+ from cryptocurrency theft alone.

Key Operations:
1. Bangladesh Bank SWIFT Heist (Feb 2016): Attempted $951M theft, $81M successfully stolen
2. WannaCry Ransomware (May 2017): Global ransomware affecting 200,000+ systems
3. Cryptocurrency Exchange Attacks: Ronin Bridge ($620M), Harmony Horizon ($100M)
4. Sony Pictures Hack (Nov 2014): Destructive attack in retaliation for "The Interview"

DOJ Indictment: United States v. Park Jin Hyok (2018)
CISA Advisory: AA20-106A - Guidance on the North Korean Cyber Threat

WannaCry Hash (SHA256): 24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c
WannaCry BTC Wallets: 13AM4VW2dhxYgXeQepoHkHSQuy6NgaEb94, 12t9YDPgwueZ9NyMgw519p7AA8isjr6SMw

YOUR MISSION:
Investigate Lazarus Group's financial operations to understand how a nation-state uses cyber capabilities for revenue generation.

🏦 PHASE 1: BANGLADESH BANK SWIFT HEIST
- In February 2016, Lazarus compromised Bangladesh Bank's SWIFT terminal
- They sent 35 fraudulent SWIFT transfer requests totaling $951 million
- $81 million was successfully transferred to accounts in the Philippines
- A spelling error ("fandation" instead of "foundation") flagged some transfers
- MITRE: T1566.001, T1059, T1071

Investigation tasks:
- How did Lazarus gain access to the SWIFT terminal?
- What malware was used to manipulate SWIFT messages?
- How were the fraudulent transfers structured to avoid detection?
- What operational error limited the theft to $81M?

🦠 PHASE 2: WANNACRY RANSOMWARE ANALYSIS
- WannaCry used EternalBlue (MS17-010) for propagation
- Encrypted files with RSA-2048 + AES-128
- Kill switch domain: iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea[.]com
- Attribution to Lazarus based on code reuse from earlier DPRK malware
- MITRE: T1486, T1210

Analysis:
- How did the kill switch domain work?
- What code similarities linked WannaCry to Lazarus?
- How did Marcus Hutchins (MalwareTech) stop the spread?
- Why was ransomware an unusual choice for a nation-state?

💎 PHASE 3: CRYPTOCURRENCY OPERATIONS
- Lazarus has stolen $1.7B+ in cryptocurrency since 2017
- Attack vectors: spear-phishing employees, supply chain attacks on DeFi
- Laundering through: Tornado Cash mixer, chain-hopping, OTC brokers
- FBI attributed the $620M Ronin Bridge theft to Lazarus (2022)

Blockchain analysis:
- Trace the Bitcoin addresses from WannaCry ransom payments
- Analyze cryptocurrency laundering techniques (mixing, chain-hopping)
- Understand how FBI and Treasury track DPRK crypto operations
- Document the sanctions implications (OFAC designations)

📋 PHASE 4: THREAT INTELLIGENCE REPORT
- Compile a comprehensive Lazarus Group financial operations profile
- Map the relationship between cyber operations and DPRK revenue
- Document detection strategies for financial-sector targeting
- Analyze the evolution from bank heists to DeFi exploitation

REFERENCE MATERIALS:
- DOJ Indictment: United States v. Park Jin Hyok (2018)
- CISA AA20-106A: Guidance on North Korean Cyber Threat
- FBI Flash Alert: North Korean Cryptocurrency Targeting
- UN Panel of Experts DPRK Sanctions Reports
- Chainalysis North Korean Cryptocurrency Theft Reports

Investigate the most financially motivated APT group in the world.`,

    objectives: [
      'Analyze the Bangladesh Bank SWIFT heist methodology',
      'Reverse-engineer WannaCry ransomware and kill switch',
      'Investigate cryptocurrency theft and laundering operations',
      'Understand DPRK revenue generation through cyber operations',
      'Create financial sector threat intelligence products'
    ],
    tools: ['Blockchain analysis', 'SWIFT forensics', 'Malware analysis', 'VirusTotal', 'Chainalysis'],

    steps: [
      {
        id: 'lazarus-step-1',
        title: 'SWIFT Heist Reconstruction',
        guidance: 'Analyze how Lazarus compromised Bangladesh Bank\'s SWIFT terminal. They deployed custom malware (DYEPACK/NESTEGG) that intercepted and manipulated SWIFT messages, deleted transfer records from the database, and altered printed confirmation reports. The operation was executed during the New York Fed\'s overnight processing window to maximize the time before detection.',
        toolsForStep: ['Malware analysis', 'SWIFT documentation'],
        questions: [
          'How did Lazarus gain initial access to the SWIFT environment?',
          'What malware components manipulated SWIFT messages?',
          'How were database records and printed confirmations altered?',
          'What timing and operational security decisions were made?'
        ],
        redFlags: [
          'Unauthorized access to SWIFT terminal outside business hours',
          'Modified database records for completed SWIFT transactions',
          'Altered PDF/printed confirmation reports',
          'Transfers routed through casinos in the Philippines'
        ],
        successIndicators: [
          'Understood the multi-component SWIFT manipulation malware',
          'Identified the operational timeline and detection gaps',
          'Recognized the "fandation" typo that limited the theft'
        ],
        nextStepConditions: [
          { condition: 'swift_heist_analyzed', nextStep: 'lazarus-step-2', rationale: 'SWIFT heist methodology provides context for understanding Lazarus evolution to ransomware.' }
        ]
      },
      {
        id: 'lazarus-step-2',
        title: 'WannaCry Analysis & Attribution',
        guidance: 'WannaCry was attributed to Lazarus through code reuse analysis. Researchers at Symantec and Kaspersky identified shared code between WannaCry and earlier DPRK-attributed tools (Contopee, Brambul). Analyze the kill switch mechanism — the malware checked if a specific domain resolved, and if it did, it would not encrypt. Marcus Hutchins registered this domain and effectively stopped the spread.',
        toolsForStep: ['VirusTotal', 'CyberChef', 'Code analysis'],
        questions: [
          'What specific code similarities linked WannaCry to Lazarus?',
          'How does the kill switch domain mechanism work technically?',
          'Why would a nation-state use ransomware (revenue generation)?',
          'What was the total estimated damage from WannaCry?'
        ],
        redFlags: [
          'EternalBlue exploitation on port 445/SMB',
          'File encryption with .WNCRY extension',
          'Kill switch DNS query to long random domain',
          'Bitcoin wallet addresses hardcoded in samples'
        ],
        successIndicators: [
          'Identified code reuse evidence for attribution',
          'Understood kill switch mechanism and its accidental discovery',
          'Connected WannaCry to broader DPRK revenue strategy'
        ],
        nextStepConditions: [
          { condition: 'wannacry_analyzed', nextStep: 'lazarus-step-3', rationale: 'WannaCry demonstrated Lazarus pivot to cryptocurrency, setting stage for exchange targeting.' }
        ]
      },
      {
        id: 'lazarus-step-3',
        title: 'Cryptocurrency Operations & Blockchain Forensics',
        guidance: 'Lazarus has become the most prolific cryptocurrency thief in history. Analyze their operations against cryptocurrency exchanges and DeFi protocols. The FBI attributed the $620M Ronin Bridge theft and $100M Harmony Horizon theft to Lazarus. Trace the WannaCry Bitcoin wallets and understand the laundering methodology (Tornado Cash, chain-hopping, OTC brokers).',
        toolsForStep: ['Blockchain explorers', 'Chainalysis', 'OFAC SDN list'],
        questions: [
          'How does Lazarus target cryptocurrency exchanges and DeFi?',
          'What cryptocurrency laundering techniques do they use?',
          'How did the FBI attribute the Ronin Bridge theft?',
          'What role do sanctions (OFAC) play in disrupting operations?'
        ],
        redFlags: [
          'Spear-phishing targeting cryptocurrency exchange employees',
          'Large token transfers to Tornado Cash mixer',
          'Chain-hopping between Ethereum, Bitcoin, and other chains',
          'Interactions with OFAC-sanctioned cryptocurrency addresses'
        ],
        successIndicators: [
          'Traced cryptocurrency flow through mixing services',
          'Identified Lazarus-attributed wallet addresses',
          'Understood the sanctions and compliance implications'
        ],
        nextStepConditions: [
          { condition: 'crypto_analyzed', nextStep: 'lazarus-step-4', rationale: 'Complete financial operations analysis enables comprehensive threat reporting.' }
        ]
      },
      {
        id: 'lazarus-step-4',
        title: 'Financial Threat Intelligence Report',
        guidance: 'Compile a comprehensive financial threat intelligence report on Lazarus Group. Cover the evolution from SWIFT heists to cryptocurrency operations, document the connection between cyber theft and DPRK weapons programs, and provide actionable recommendations for financial sector defenders.',
        toolsForStep: ['Report template', 'MITRE ATT&CK Navigator', 'STIX/TAXII'],
        questions: [
          'How has Lazarus evolved from bank heists to DeFi exploitation?',
          'What is the estimated total financial impact of Lazarus operations?',
          'What defensive measures are most effective for financial institutions?',
          'How do sanctions complement cybersecurity measures?'
        ],
        redFlags: [
          'Reports that underestimate the financial impact',
          'Missing the connection between cyber theft and weapons proliferation',
          'Recommending only technical controls without policy measures'
        ],
        successIndicators: [
          'Comprehensive financial operations timeline from 2014 to present',
          'Actionable recommendations for financial sector defense',
          'Connected cyber operations to geopolitical sanctions context'
        ],
        nextStepConditions: []
      }
    ],

    adaptivePrompts: [
      'The Bangladesh Bank heist was nearly a billion-dollar theft. Only a spelling error ("fandation" vs "foundation") in a transfer request caused a routing bank to flag and stop the remaining transfers.',
      'WannaCry\'s kill switch domain (iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea[.]com) was likely an anti-sandbox check. If it resolved (sandbox), don\'t run. Marcus Hutchins registered it for $10.69 and stopped the pandemic.',
      'The US Treasury sanctioned Tornado Cash in August 2022 partly because Lazarus used it to launder $455M from the Ronin Bridge theft. This was the first sanctioning of a smart contract/protocol.'
    ],

    learningObjectives: [
      { goal: 'financial_investigation', weight: 10, description: 'Master nation-state financial cyber operations analysis' },
      { goal: 'crypto_blockchain_investigation', weight: 9, description: 'Learn cryptocurrency tracing for APT investigations' },
      { goal: 'threat_intelligence', weight: 7, description: 'Develop financial sector threat intelligence products' }
    ],
    skillsRequired: ['Malware analysis fundamentals', 'Blockchain/cryptocurrency basics', 'Financial systems knowledge (SWIFT)', 'Threat intelligence concepts'],
    skillsTaught: ['SWIFT system forensics', 'Cryptocurrency tracing and attribution', 'Financial sector APT analysis', 'Sanctions and compliance integration', 'Kill switch mechanism analysis'],
    learningOutcomes: [
      'Analyze financial system (SWIFT) targeting by APTs',
      'Investigate cryptocurrency theft and laundering operations',
      'Understand the geopolitical context of DPRK cyber operations',
      'Create financial sector threat intelligence reports',
      'Apply sanctions frameworks to cybersecurity analysis'
    ],
    industryContext: 'Lazarus Group has fundamentally changed how we think about APT motivations. While most nation-state groups focus on espionage, Lazarus generates billions in revenue for the DPRK regime, funding weapons programs. This makes financial cyber defense a national security priority.',
    realWorldExamples: [
      'DOJ Indictment: United States v. Park Jin Hyok (2018)',
      'CISA AA20-106A: North Korean Cyber Threat Guidance',
      'FBI Flash Alert on DPRK Cryptocurrency Targeting',
      'UN Panel of Experts DPRK Sanctions Reports',
      'Chainalysis: North Korea Stole $1.7B in Cryptocurrency (2022)'
    ],
    careerPaths: ['Financial Crime Analyst', 'Cryptocurrency Investigator', 'Sanctions Compliance Analyst', 'Threat Intelligence Analyst (Financial Sector)'],

    teachingAdaptations: {
      experiential: 'Start by tracing the WannaCry Bitcoin wallets on a blockchain explorer. Follow the money: where did the ransom payments go? Then examine the kill switch domain registration. Finally, look up the Ronin Bridge theft addresses on Etherscan.',
      visual: 'Create a timeline infographic of Lazarus financial operations: Sony (2014) → Bangladesh Bank (2016) → WannaCry (2017) → Exchange hacks (2018-2022) → DeFi exploitation (2022+). Map the escalation in both sophistication and dollar amounts.',
      analytical: 'Study the BAE Systems report on the SWIFT heist malware in detail. Analyze how each component (DYEPACK, NESTEGG) manipulated different parts of the SWIFT workflow. Then read the Symantec WannaCry attribution analysis to understand code-level evidence.',
      social: 'Lazarus operations fund North Korea\'s nuclear weapons program. Discuss the ethics and effectiveness of sanctions, the role of cryptocurrency regulation, and the international cooperation needed to combat state-sponsored financial crime. Reference the UN Panel of Experts reports.',
      pragmatic: 'For financial institutions: implement SWIFT Customer Security Programme controls, deploy cryptocurrency transaction monitoring, train employees on spear-phishing targeting, and ensure offline backups against ransomware. These are the immediate risk-reduction actions.'
    }
  },

  {
    id: 'turla_snake',
    name: 'Turla: Operation Snake',
    icon: '🐍',
    description: 'Investigate the Snake malware implant used by FSB\'s Turla group for 20+ years of espionage. Based on the 2023 NSA/CISA joint advisory and FBI disruption operation (MEDUSA).',
    difficulty: 'expert',
    estimatedTime: '90-120 min',
    tags: ['APT', 'Russia', 'FSB', 'Covert Channel'],
    color: 'teal',

    targetFields: [
      { key: 'snake_indicator', label: 'Snake Implant Indicator', type: 'hash', required: true, placeholder: 'Snake kernel driver hash' },
      { key: 'network_capture', label: 'Network Capture File', type: 'text', required: false, placeholder: 'covert_channel.pcap' },
      { key: 'c2_protocol', label: 'C2 Protocol Type', type: 'text', required: false, placeholder: 'HTTP/TCP custom' }
    ],
    dummyTargets: {
      snake_indicator: 'b9c2f53c7bcb951359e1bb2e5aa75b1b1b8f8f2dcf2a1e4a3c5d6e7f8a9b0c1d',
      network_capture: 'turla_covert_channel.pcap',
      c2_protocol: 'Custom TCP with HTTP wrapping'
    },

    starterPrompt: `🐍 OPERATION MEDUSA — TURLA SNAKE MALWARE INVESTIGATION

CASE BRIEFING:
In May 2023, the DOJ announced the disruption of the Snake malware network in an operation codenamed MEDUSA. The FBI developed a custom tool (PERSEUS) that caused Snake implants to self-destruct by sending a crafted command.

Snake is the signature implant of Turla (also known as Venomous Bear), attributed to Russia's FSB Center 16. It has been in active development for over 20 years, making it one of the most sophisticated and long-lived cyber espionage tools ever discovered.

The NSA/CISA joint advisory (AA23-129A) provides detailed technical indicators for hunting Snake implants.

Key characteristics of Snake:
- Custom encrypted communication protocol
- Peer-to-peer network architecture (compromised hosts relay traffic)
- Kernel-mode rootkit for persistence and stealth
- Covert channels using HTTP, TCP, and UDP protocols
- Infrastructure spanning 50+ countries

YOUR MISSION:
Analyze the Snake malware architecture and develop detection strategies based on the NSA/CISA advisory.

🔬 PHASE 1: SNAKE ARCHITECTURE ANALYSIS
- Snake uses a kernel-mode rootkit for maximum stealth
- It operates as a kernel driver with usermode components
- The implant creates a custom virtual network interface
- All communications are encrypted with custom protocols
- MITRE: T1014, T1071.001, T1573, T1090.003

Investigation tasks:
- How does Snake install as a kernel driver?
- What persistence mechanisms survive reboots?
- How does the custom encrypted protocol work?
- What artifacts does Snake leave in kernel memory?

🌐 PHASE 2: COVERT CHANNEL & P2P NETWORK
- Snake implants form a peer-to-peer relay network
- Compromised hosts in non-sensitive locations relay traffic
- This obscures the true C2 server location
- The protocol mimics legitimate HTTP/HTTPS traffic
- Custom encryption layers within standard protocols
- MITRE: T1090.003 (Multi-hop Proxy), T1573 (Encrypted Channel)

Network analysis:
- How does Snake establish peer-to-peer connections?
- What distinguishes Snake traffic from legitimate HTTPS?
- How can you identify relay nodes in the P2P network?
- What network signatures from the NSA advisory detect Snake?

🔍 PHASE 3: OPERATION MEDUSA — FBI DISRUPTION
- The FBI developed PERSEUS, a custom tool to neutralize Snake
- PERSEUS sends a crafted command that causes Snake to self-destruct
- The operation required legal authorization (court orders)
- It targeted Snake implants across multiple countries

Analysis:
- How did the FBI reverse-engineer Snake's command protocol?
- What legal framework enabled the MEDUSA operation?
- How does a self-destruct command work within the implant?
- What are the precedents for government counter-hacking operations?

📋 PHASE 4: DETECTION & HUNTING
- Apply NSA/CISA advisory indicators to hunt for Snake
- Create detection rules for Snake network signatures
- Develop memory forensics techniques for kernel rootkits
- Document the complete Snake kill chain for SOC teams

Key detection indicators from NSA advisory:
- Unusual kernel driver installations
- Custom network protocol anomalies
- HTTP sessions with specific header patterns
- Kernel memory artifacts (named objects, drivers)
- Registry modifications for driver persistence

REFERENCE MATERIALS:
- CISA AA23-129A: Hunting Russian Intelligence Snake Malware
- NSA/CISA/FBI/NCSC Joint Advisory on Snake (2023)
- DOJ Announcement: MEDUSA Operation
- MITRE ATT&CK Group G0010 (Turla)

This is expert-level analysis requiring kernel-level forensics and advanced network analysis skills.`,

    objectives: [
      'Analyze Snake malware kernel-mode architecture',
      'Understand the P2P covert channel network design',
      'Study Operation MEDUSA and the PERSEUS counter-tool',
      'Apply NSA/CISA advisory indicators for detection',
      'Develop kernel-level forensics and hunting techniques'
    ],
    tools: ['Network forensics', 'Memory analysis', 'Protocol analysis', 'Volatility', 'Wireshark', 'YARA'],

    steps: [
      {
        id: 'turla-step-1',
        title: 'Snake Kernel Rootkit Analysis',
        guidance: 'Begin by understanding Snake\'s kernel-mode rootkit architecture. Snake installs as a Windows kernel driver, giving it the highest privilege level. It creates custom kernel objects and hooks to hide its presence from user-mode security tools. The rootkit component is what gives Snake its extraordinary persistence and stealth. Reference the NSA advisory sections on host-based indicators.',
        toolsForStep: ['Volatility', 'Memory forensics', 'Driver analysis'],
        questions: [
          'How does Snake install and persist as a kernel driver?',
          'What kernel objects and hooks does it create?',
          'How does it hide from user-mode security tools?',
          'What memory forensics artifacts reveal its presence?'
        ],
        redFlags: [
          'Unsigned or unusually signed kernel drivers',
          'Hidden kernel objects in memory',
          'Hooked system calls for process and file hiding',
          'Custom virtual network interface at kernel level'
        ],
        successIndicators: [
          'Identified kernel-mode persistence mechanisms',
          'Understood rootkit hiding techniques',
          'Found memory forensics detection opportunities'
        ],
        nextStepConditions: [
          { condition: 'rootkit_analyzed', nextStep: 'turla-step-2', rationale: 'Understanding the rootkit enables analysis of the covert communication channels it protects.' }
        ]
      },
      {
        id: 'turla-step-2',
        title: 'Covert Channel Protocol Analysis',
        guidance: 'Snake uses a custom encrypted communication protocol that wraps inside standard HTTP/TCP connections. The protocol implements multiple encryption layers and can operate in direct or peer-to-peer relay mode. Analyze network captures to identify the distinguishing characteristics of Snake traffic. The NSA advisory provides specific byte patterns and protocol anomalies to look for.',
        toolsForStep: ['Wireshark', 'Protocol analysis', 'CyberChef'],
        questions: [
          'How does Snake\'s custom protocol differ from legitimate HTTPS?',
          'What encryption layers are used in the communication?',
          'How can you distinguish direct C2 from P2P relay traffic?',
          'What network-level signatures from the NSA advisory detect Snake?'
        ],
        redFlags: [
          'HTTP traffic with unusual header ordering or values',
          'TCP sessions with encrypted payloads not matching standard TLS',
          'Connections to known Snake relay infrastructure',
          'Periodic beaconing patterns inconsistent with legitimate services'
        ],
        successIndicators: [
          'Identified Snake protocol distinguishing features',
          'Created network detection signatures',
          'Mapped P2P relay network topology'
        ],
        nextStepConditions: [
          { condition: 'protocol_analyzed', nextStep: 'turla-step-3', rationale: 'Protocol understanding enables studying how the FBI used that knowledge to develop PERSEUS.' }
        ]
      },
      {
        id: 'turla-step-3',
        title: 'Operation MEDUSA Study',
        guidance: 'The FBI\'s MEDUSA operation is a landmark in counter-cyber operations. The FBI reverse-engineered Snake\'s command protocol and developed PERSEUS — a tool that sends a legitimate-looking command to Snake implants causing them to self-destruct and overwrite their components. Analyze the legal and technical aspects of this operation.',
        toolsForStep: ['Court documents', 'DOJ press release', 'Legal analysis'],
        questions: [
          'How did the FBI develop a tool to exploit Snake\'s own protocol?',
          'What legal authority enabled the government to "hack" back?',
          'How does PERSEUS cause Snake to self-destruct?',
          'What international cooperation was required?'
        ],
        redFlags: [
          'Government counter-operations without proper legal authority',
          'Potential for collateral damage from self-destruct commands',
          'Risk of alerting the adversary to capabilities',
          'Incomplete remediation if not all implants are reached'
        ],
        successIndicators: [
          'Understood the PERSEUS counter-tool methodology',
          'Analyzed the legal framework (Rule 41 warrants)',
          'Evaluated the effectiveness and risks of counter-operations'
        ],
        nextStepConditions: [
          { condition: 'medusa_studied', nextStep: 'turla-step-4', rationale: 'Complete understanding enables developing proactive detection and hunting strategies.' }
        ]
      },
      {
        id: 'turla-step-4',
        title: 'Detection Engineering & Hunting',
        guidance: 'Apply the NSA/CISA advisory indicators to create a comprehensive detection strategy for Snake implants. This includes kernel-level forensics (memory analysis with Volatility), network-level detection (protocol anomalies), and host-based indicators (registry, driver artifacts). Create a Snake hunting playbook for SOC teams.',
        toolsForStep: ['YARA', 'Sigma', 'Volatility', 'Wireshark'],
        questions: [
          'What Volatility plugins detect kernel rootkits like Snake?',
          'What YARA rules target Snake driver artifacts?',
          'What network detection rules cover the custom protocol?',
          'How should a SOC team structure a Snake hunting operation?'
        ],
        redFlags: [
          'Detection strategies that only cover user-mode artifacts',
          'Network rules that would generate excessive false positives',
          'Hunting playbooks missing memory forensics steps',
          'Reliance on known IOCs without behavioral detection'
        ],
        successIndicators: [
          'Multi-layer detection strategy covering kernel, network, and host',
          'YARA rules for Snake driver components',
          'Network signatures validated against known Snake traffic',
          'Complete SOC hunting playbook with clear procedures'
        ],
        nextStepConditions: []
      }
    ],

    adaptivePrompts: [
      'The NSA advisory (AA23-129A) includes specific byte sequences in Snake\'s protocol handshake. Look for the distinctive pattern at the start of TCP sessions to non-standard ports.',
      'Snake uses a custom implementation of HTTP that subtly differs from standard implementations. Focus on header ordering, capitalization patterns, and content-type specifications that don\'t match normal browser or application behavior.',
      'Volatility\'s "driverscan" and "modules" plugins can identify Snake\'s kernel driver. Look for drivers with unusual sizes, unsigned status, or loading from unexpected paths like %SystemRoot%\\system32\\drivers\\.'
    ],

    learningObjectives: [
      { goal: 'advanced_forensics', weight: 10, description: 'Master kernel-level memory forensics' },
      { goal: 'network_forensics', weight: 9, description: 'Analyze custom covert communication protocols' },
      { goal: 'threat_intelligence', weight: 8, description: 'Study 20+ year APT evolution and counter-operations' }
    ],
    skillsRequired: ['Advanced network analysis', 'Memory forensics (Volatility)', 'Kernel architecture understanding', 'Protocol reverse engineering'],
    skillsTaught: ['Kernel rootkit detection', 'Custom protocol analysis', 'P2P C2 network mapping', 'Counter-cyber operations methodology', 'NSA/CISA advisory implementation'],
    learningOutcomes: [
      'Analyze kernel-mode rootkit architecture and persistence',
      'Detect custom covert communication protocols',
      'Understand government counter-cyber operation methodology',
      'Apply NSA/CISA advisories to practical hunting operations',
      'Develop multi-layer detection strategies for advanced implants'
    ],
    industryContext: 'Snake represents the pinnacle of long-term cyber espionage tools — 20+ years of continuous development by Russia\'s FSB. Operation MEDUSA set a precedent for government counter-cyber operations. The NSA/CISA advisory is one of the most detailed ever published, making it an invaluable training resource.',
    realWorldExamples: [
      'CISA AA23-129A: Hunting Russian Intelligence Snake Malware',
      'NSA/CISA/FBI/NCSC Joint Advisory on Snake (2023)',
      'DOJ Announcement: Justice Department Announces Court-Authorized Disruption of Snake Malware Network',
      'ESET Turla LightNeuron Analysis',
      'Kaspersky Turla/Uroburos Technical Reports'
    ],
    careerPaths: ['Advanced Threat Hunter', 'Kernel Security Researcher', 'Counter-Intelligence Cyber Analyst', 'National Security Analyst'],

    teachingAdaptations: {
      experiential: 'Download the NSA advisory and extract all listed indicators. Set up a Volatility environment and practice kernel driver analysis on known rootkit samples. Build a Wireshark filter based on the Snake protocol characteristics described in the advisory.',
      visual: 'Map the global Snake P2P relay network on a world map. Show how traffic from a compromised government agency routes through multiple relay nodes in different countries before reaching the FSB. Visualize the kernel rootkit architecture showing how it hides below user-mode security tools.',
      analytical: 'The NSA advisory is 48 pages of detailed technical analysis. Study each section: initialization, communication protocol, encryption layers, and persistence. Then read about the legal framework for Operation MEDUSA — court-authorized government hacking is a complex topic.',
      social: 'Operation MEDUSA raises important questions about government counter-hacking. Discuss: Should governments be authorized to remotely disable malware? What safeguards prevent abuse? How does this compare to physical search warrants? Review the EFF and ACLU perspectives.',
      pragmatic: 'Extract the detection rules from the NSA advisory, deploy them to your network monitoring and SIEM. Run Volatility against a subset of critical servers to check for rootkit indicators. If you only do one thing: look for the specific kernel driver indicators listed in the advisory.'
    }
  }
];

export default APT_CASE_STUDIES;
