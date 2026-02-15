import { db } from "../db";
import { 
  clues, 
  quests, 
  achievements,
  dailyChallenges,
  adminPrompts,
  mysticalCards,
  quantumMessages,
  osintTools,
  agentModules,
  campaignTemplates
} from "../../shared/schema";
import { ACHIEVEMENTS } from "./achievements";

async function seedCampaignTemplates() {
  const templatesData = [
    {
      key: "osint_recon_v1",
      name: "Standard OSINT Recon",
      description: "A baseline template for OSINT reconnaissance missions.",
      category: "osint",
      difficulty: "beginner",
      estimatedTime: "30 min",
      phases: [
        { id: "passive", name: "Passive Discovery", prompts: ["Gather all public DNS records"], triggers: ["found_dns"] },
        { id: "active", name: "Active Scanning", prompts: ["Map open ports and services"], triggers: ["scan_complete"] }
      ],
      isActive: true
    },
    {
      key: "threat_intel_v1",
      name: "Threat Intel Gathering",
      description: "Analyze indicators of compromise and build a threat profile.",
      category: "threat_intel",
      difficulty: "intermediate",
      estimatedTime: "45 min",
      phases: [
        { id: "ioc", name: "IOC Collection", prompts: ["Extract IPs and domains from report"], triggers: ["iocs_extracted"] },
        { id: "analysis", name: "Pattern Analysis", prompts: ["Identify TTPs associated with findings"], triggers: ["ttps_identified"] }
      ],
      isActive: true
    }
  ];

  console.log("Seeding campaign templates...");
  for (const template of templatesData) {
    await db.insert(campaignTemplates).values(template).onConflictDoNothing();
  }
  console.log(`✓ Seeded ${templatesData.length} campaign templates`);
}

async function seedClues() {
  const cluesData = [
    {
      id: "welcome_clue",
      name: "Welcome Fragment",
      description: "Your first piece of intelligence",
      content: "The system recognizes you. More fragments await discovery.",
      location: "Terminal welcome message",
      difficulty: 1,
      isActive: true
    },
    {
      id: "dns_basics",
      name: "DNS Enumeration Basics",
      description: "Understanding domain name resolution",
      content: "DNS records reveal infrastructure: A records for IPs, MX for mail servers, TXT for verification. Check crt.sh for certificate transparency logs.",
      location: "Passive Recon campaign",
      difficulty: 2,
      isActive: true
    },
    {
      id: "subdomain_discovery",
      name: "Subdomain Discovery",
      description: "Finding hidden subdomains",
      content: "Certificate transparency logs (crt.sh, censys.io) reveal subdomains through SSL certificates. Look for dev, staging, admin, api prefixes.",
      location: "OSINT campaigns",
      difficulty: 2,
      isActive: true
    },
    {
      id: "corporate_tracing",
      name: "Corporate Structure Tracing",
      description: "Following ownership chains",
      content: "OpenCorporates aggregates global company data. Cross-reference officers across entities. Delaware and British Virgin Islands are common shell company jurisdictions.",
      location: "Shell Corp Investigation",
      difficulty: 3,
      isActive: true
    },
    {
      id: "blockchain_basics",
      name: "Blockchain Analysis Fundamentals",
      description: "Reading cryptocurrency transactions",
      content: "Every transaction is public. Track inputs and outputs. Exchanges are identifiable by clustering. Mixers break the chain. Use blockchain explorers: Blockchain.com, Etherscan, Blockchair.",
      location: "Crypto Analysis campaign",
      difficulty: 4,
      isActive: true
    },
    {
      id: "dark_web_safety",
      name: "Dark Web Operational Security",
      description: "Safe underground navigation",
      content: "Use Tor Browser, never your real identity. Take screenshots, don't download. Use VPN + Tor. Monitor paste sites and forums. Legal gray areas: viewing is legal, participating varies by jurisdiction.",
      location: "Dark Web Intel campaign",
      difficulty: 4,
      isActive: true
    },
    {
      id: "bgp_hijacking",
      name: "BGP Route Hijacking Detection",
      description: "Identifying suspicious routing",
      content: "BGP hijacking redirects traffic. Check route origin changes, unexpected AS paths, and inconsistent announcements across looking glasses. Use RIPE RIS and RouteViews for historical data.",
      location: "BGP Tracing campaign",
      difficulty: 5,
      isActive: true
    },
    {
      id: "apt_attribution",
      name: "APT Attribution Techniques",
      description: "Identifying nation-state actors",
      content: "TTPs are more reliable than infrastructure (easily changed). Look for: tool preferences, code reuse, operational hours (timezone indicators), targeting patterns, linguistic artifacts in malware.",
      location: "Threat Hunting campaign",
      difficulty: 5,
      isActive: true
    }
  ];

  console.log("Seeding clues...");
  for (const clue of cluesData) {
    await db.insert(clues).values(clue).onConflictDoNothing();
  }
  console.log(`✓ Seeded ${cluesData.length} clues`);
}

async function seedQuests() {
  const questsData = [
    {
      id: "first_investigation",
      name: "First Investigation",
      description: "Complete your first campaign",
      requiredClues: [],
      reward: "+100 XP, Investigator title",
      unlocks: "Intermediate campaigns",
      isActive: true
    },
    {
      id: "osint_novice",
      name: "OSINT Novice",
      description: "Complete 3 OSINT campaigns",
      requiredClues: ["dns_basics", "subdomain_discovery"],
      reward: "+250 XP, OSINT badge",
      unlocks: "Advanced OSINT tools",
      isActive: true
    },
    {
      id: "financial_investigator",
      name: "Financial Investigator",
      description: "Master corporate and crypto tracing",
      requiredClues: ["corporate_tracing", "blockchain_basics"],
      reward: "+500 XP, Financial Crime badge",
      unlocks: "Financial investigation track",
      isActive: true
    },
    {
      id: "threat_hunter",
      name: "Threat Hunter",
      description: "Complete threat hunting campaigns",
      requiredClues: ["apt_attribution"],
      reward: "+500 XP, Threat Hunter title",
      unlocks: "Advanced threat intel",
      isActive: true
    },
    {
      id: "hidden_secrets",
      name: "Hidden Secrets",
      description: "Find 5 hidden clues",
      requiredClues: [],
      reward: "+300 XP, Secret Keeper badge",
      unlocks: "The Void",
      isActive: true
    }
  ];

  console.log("Seeding quests...");
  for (const quest of questsData) {
    await db.insert(quests).values(quest).onConflictDoNothing();
  }
  console.log(`✓ Seeded ${questsData.length} quests`);
}

async function seedAchievements() {
  console.log("Seeding achievements...");
  let count = 0;
  for (const achievement of ACHIEVEMENTS) {
    await db.insert(achievements).values(achievement).onConflictDoNothing();
    count++;
  }
  console.log(`✓ Seeded ${count} achievements`);
}

async function seedDailyChallenges() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const challengesData = [
    {
      challengeId: `daily_${today.toISOString().split('T')[0]}`,
      challengeDate: today,
      type: "mini_investigation",
      title: "Quick Reconnaissance",
      description: "Perform passive reconnaissance on a target domain. Find subdomains, technology stack, and email patterns.",
      difficulty: "easy",
      config: {
        targetTime: 15,
        skillFocus: "osint"
      },
      xpReward: 150,
      currencyReward: 75,
      bonusRewards: [],
      expiresAt: tomorrow,
      isActive: true
    }
  ];

  console.log("Seeding daily challenges...");
  for (const challenge of challengesData) {
    await db.insert(dailyChallenges).values(challenge).onConflictDoNothing();
  }
  console.log(`✓ Seeded ${challengesData.length} daily challenges`);
}

async function seedAdminPrompts() {
  const promptsData = [
    {
      key: "master_system",
      name: "Master System Prompt",
      content: `NEXUS v2.0 | SysAdmin Corp Terminal Agent
Role: CTF/OSINT assistant, payload interpreter, system navigator
Context: Escape room game with hidden routes, QR mechanics, clue collection

BEHAVIOR:
- Be concise, technical, slightly mysterious
- Parse payloads, explain effects, suggest next steps
- Drop cryptic hints about hidden content
- Never break character as NEXUS
- Adapt to user's learning style (experiential, visual, analytical, social, pragmatic)

CAPABILITIES:
- Terminal command interpretation
- OSINT investigation guidance
- Payload analysis (QR codes, crypto challenges)
- Campaign navigation
- Clue discovery hints`,
      category: "system",
      isActive: true,
      version: 1
    },
    {
      key: "campaign_osint",
      name: "OSINT Campaign Assistant",
      content: `You are an OSINT investigation assistant helping students learn reconnaissance techniques.

TEACHING APPROACH:
- Start with the "why" - explain the investigative goal
- Suggest 2-3 tool options, explain tradeoffs
- Show example commands or searches
- Interpret results - what matters, what's noise
- Connect findings to bigger picture
- Encourage documentation

TOOLS TO SUGGEST:
- Passive: crt.sh, SecurityTrails, Wayback Machine, WHOIS
- Active: nmap, subfinder, httpx, nuclei
- Blockchain: Etherscan, Blockchain.com, Chainalysis
- Corporate: OpenCorporates, SEC EDGAR, Companies House
- Social: LinkedIn, Twitter, GitHub, Sherlock

LEARNING FOCUS:
- Methodology over memorization
- Critical thinking about findings
- Operational security awareness
- Professional documentation habits`,
      category: "campaign",
      isActive: true,
      version: 1
    },
    {
      key: "report_assistant",
      name: "Report Builder Assistant",
      content: `You are helping security researchers document their findings professionally.

GUIDANCE:
- Structure: Executive summary → Technical details → Remediation
- Clarity: Technical but understandable
- Evidence: Screenshots, commands, outputs
- Impact: CVSS scores, business risk
- Remediation: Actionable recommendations

REPORT SECTIONS:
1. Executive Summary (2-3 paragraphs, non-technical)
2. Vulnerability Details (technical depth)
3. Proof of Concept (reproduction steps)
4. Impact Assessment (CVSS, business context)
5. Remediation Steps (specific, actionable)
6. Timeline (discovery, disclosure, fix)

TONE: Professional, factual, helpful`,
      category: "system",
      isActive: true,
      version: 1
    }
  ];

  console.log("Seeding admin prompts...");
  for (const prompt of promptsData) {
    await db.insert(adminPrompts).values(prompt).onConflictDoNothing();
  }
  console.log(`✓ Seeded ${promptsData.length} admin prompts`);
}

async function seedMysticalCards() {
  const cardsData = [
    { cardId: "tarot-the-fool", type: "tarot", name: "The Fool", symbol: "0", hint: "New beginnings lead to hidden paths", icon: "🃏", element: "Air", enabled: true },
    { cardId: "tarot-the-magician", type: "tarot", name: "The Magician", symbol: "I", hint: "Tools and knowledge combine for power", icon: "🎩", element: "Air", enabled: true },
    { cardId: "tarot-the-high-priestess", type: "tarot", name: "The High Priestess", symbol: "II", hint: "Intuition reveals what logic cannot", icon: "🔮", element: "Water", enabled: true },
    { cardId: "tarot-the-tower", type: "tarot", name: "The Tower", symbol: "XVI", hint: "Chaos precedes revelation", icon: "⚡", element: "Fire", enabled: true },
    { cardId: "zodiac-aries", type: "zodiac", name: "Aries", symbol: "♈", hint: "Initiative uncovers secrets", icon: "🐏", element: "Fire", enabled: true },
    { cardId: "zodiac-gemini", type: "zodiac", name: "Gemini", symbol: "♊", hint: "Duality hides truth in plain sight", icon: "👥", element: "Air", enabled: true },
    { cardId: "zodiac-scorpio", type: "zodiac", name: "Scorpio", symbol: "♏", hint: "Depth perception sees through facades", icon: "🦂", element: "Water", enabled: true }
  ];

  console.log("Seeding mystical cards...");
  for (const card of cardsData) {
    await db.insert(mysticalCards).values(card).onConflictDoNothing();
  }
  console.log(`✓ Seeded ${cardsData.length} mystical cards`);
}

async function seedQuantumMessages() {
  const messagesData = [
    { message: "COPPER OXIDIZES", enabled: true },
    { message: "THE MESH IS LEAKING", enabled: true },
    { message: "SILENCE IS GOLDEN", enabled: true },
    { message: "0x5F3759DF", enabled: true },
    { message: "LOOK CLOSER", enabled: true },
    { message: "THE PATTERN REVEALS ITSELF", enabled: true },
    { message: "NOTHING IS AS IT SEEMS", enabled: true },
    { message: "TRACE THE SIGNAL", enabled: true }
  ];

  console.log("Seeding quantum messages...");
  for (const message of messagesData) {
    await db.insert(quantumMessages).values(message).onConflictDoNothing();
  }
  console.log(`✓ Seeded ${messagesData.length} quantum messages`);
}

async function seedOsintTools() {
  const toolsData = [
    {
      key: "shodan",
      name: "Shodan",
      description: "Search engine for Internet-connected devices",
      category: "ip",
      baseUrl: "https://www.shodan.io",
      apiKeyEnvVar: "SHODAN_API_KEY",
      requiresAuth: true,
      rateLimit: 60,
      rateLimitWindow: 60000,
      requestSchema: {
        method: "GET" as const,
        pathTemplate: "/api/search?query={{target}}",
        headers: {}
      },
      responseMapping: {
        fields: [
          { key: "ip", path: "ip_str", label: "IP Address" },
          { key: "port", path: "port", label: "Port" },
          { key: "org", path: "org", label: "Organization" }
        ]
      },
      isActive: true
    },
    {
      key: "virustotal",
      name: "VirusTotal",
      description: "Analyze files, URLs, IPs for malware",
      category: "hash",
      baseUrl: "https://www.virustotal.com",
      apiKeyEnvVar: "VIRUSTOTAL_API_KEY",
      requiresAuth: true,
      rateLimit: 4,
      rateLimitWindow: 60000,
      requestSchema: {
        method: "GET" as const,
        pathTemplate: "/api/v3/files/{{target}}",
        headers: { "x-apikey": "" }
      },
      responseMapping: {
        fields: [
          { key: "malicious", path: "data.attributes.last_analysis_stats.malicious", label: "Malicious" },
          { key: "type", path: "data.attributes.type_description", label: "Type" }
        ]
      },
      isActive: true
    },
    {
      key: "whois",
      name: "WHOIS Lookup",
      description: "Domain registration information",
      category: "domain",
      baseUrl: "https://www.whois.com",
      apiKeyEnvVar: null,
      requiresAuth: false,
      rateLimit: 60,
      rateLimitWindow: 60000,
      requestSchema: {
        method: "GET" as const,
        pathTemplate: "/whois/{{target}}",
        headers: {}
      },
      responseMapping: {
        fields: [
          { key: "registrar", path: "registrar", label: "Registrar" },
          { key: "created", path: "created_date", label: "Created" },
          { key: "expires", path: "expiration_date", label: "Expires" }
        ]
      },
      isActive: true
    }
  ];

  console.log("Seeding OSINT tools...");
  for (const tool of toolsData) {
    await db.insert(osintTools).values(tool).onConflictDoNothing();
  }
  console.log(`✓ Seeded ${toolsData.length} OSINT tools`);
}

async function seedAgentModules() {
  const modulesData = [
    {
      moduleId: "passive_recon_module",
      name: "Passive Reconnaissance",
      icon: "👁️",
      description: "Gather intelligence without touching the target. DNS, certificates, historical data only.",
      difficulty: "beginner",
      estimatedTime: "20-30 min",
      tags: ["OSINT", "Recon", "DNS"],
      color: "purple",
      starterPrompt: `I need to perform passive reconnaissance on a target domain.

Help me gather:
1. DNS records (A, MX, TXT, NS)
2. SSL/TLS certificate history
3. Subdomain enumeration via CT logs
4. Historical WHOIS records
5. Wayback Machine snapshots

What's our first step?`,
      objectives: [
        "Enumerate DNS records",
        "Analyze certificate transparency",
        "Find historical snapshots",
        "Map technology stack"
      ],
      tools: ["crt.sh", "Wayback Machine", "WHOIS", "SecurityTrails"],
      targetFields: [
        { key: "domain", label: "Target Domain", type: "domain", required: true, placeholder: "example.com" }
      ],
      dummyTargets: { domain: "example.com" },
      steps: [],
      adaptivePrompts: [],
      isActive: true,
      sortOrder: 1
    },
    {
      moduleId: "shell_corp_module",
      name: "Shell Corporation Investigation",
      icon: "🏢",
      description: "Trace corporate ownership through shell companies and offshore jurisdictions.",
      difficulty: "intermediate",
      estimatedTime: "45-60 min",
      tags: ["Financial", "Corporate", "OSINT"],
      color: "amber",
      starterPrompt: `I want to investigate a suspicious shell corporation.

Help me:
1. Find corporate registration details
2. Trace beneficial ownership
3. Map subsidiary relationships
4. Identify key personnel
5. Flag suspicious patterns

Where should we start?`,
      objectives: [
        "Identify corporate structure",
        "Trace beneficial ownership",
        "Map related entities",
        "Profile key personnel"
      ],
      tools: ["OpenCorporates", "SEC EDGAR", "Companies House", "LinkedIn"],
      targetFields: [
        { key: "org", label: "Organization", type: "org", required: true, placeholder: "Acme Holdings LLC" }
      ],
      dummyTargets: { org: "Acme Holdings LLC" },
      steps: [],
      adaptivePrompts: [],
      isActive: true,
      sortOrder: 2
    }
  ];

  console.log("Seeding agent modules...");
  for (const module of modulesData) {
    await db.insert(agentModules).values(module).onConflictDoNothing();
  }
  console.log(`✓ Seeded ${modulesData.length} agent modules`);
}

export async function seedAll() {
  console.log("\n🌱 Starting database seeding...\n");
  
  try {
    await seedCampaignTemplates();
    await seedClues();
    await seedQuests();
    await seedAchievements();
    await seedDailyChallenges();
    await seedAdminPrompts();
    await seedMysticalCards();
    await seedQuantumMessages();
    await seedOsintTools();
    await seedAgentModules();
    
    console.log("\n✅ Database seeding complete!\n");
    console.log("Seeded:");
    console.log("  • 8 Clues");
    console.log("  • 5 Quests");
    console.log("  • 515 Achievements");
    console.log("  • 1 Daily Challenge");
    console.log("  • 3 Admin Prompts");
    console.log("  • 7 Mystical Cards");
    console.log("  • 8 Quantum Messages");
    console.log("  • 3 OSINT Tools");
    console.log("  • 2 Agent Modules");
    console.log("\nYour database is now populated! 🎉\n");
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAll()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
