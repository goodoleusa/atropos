/**
 * Anti-Human Trafficking & Financial Crime Investigation Campaigns
 * OSINT for Good - Ethical Hacking Training
 */

import { Campaign } from './agentCampaigns';

export const ANTI_TRAFFICKING_CAMPAIGNS: Campaign[] = [
  {
    id: 'operation_shadow_network',
    name: 'Operation Shadow Network',
    icon: '',
    description: 'Investigate a trafficking ring using social media to recruit victims. Track their network and follow the money through cryptocurrency.',
    difficulty: 'intermediate',
    estimatedTime: '60-90 min',
    tags: ['Human Trafficking', 'Social Media OSINT', 'Cryptocurrency', 'Network Mapping'],
    color: 'red',
    
    targetFields: [
      { key: 'instagram_handle', label: 'Suspected Recruiter Instagram', type: 'text', required: true, placeholder: '@modeling_agency_2024' },
      { key: 'bitcoin_address', label: 'Bitcoin Payment Address', type: 'text', required: false, placeholder: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' }
    ],
    
    dummyTargets: {
      instagram_handle: '@luxlife_recruiting',
      bitcoin_address: '3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy'
    },
    
    starterPrompt: `🚨 OPERATION SHADOW NETWORK - HUMAN TRAFFICKING INVESTIGATION

CASE BRIEFING:
An NGO has flagged a suspected trafficking recruitment operation on Instagram. The account @luxlife_recruiting poses as a modeling agency offering "overseas opportunities" to young women. Several victims have reported being lured through this account.

Your mission is to map the network and identify payment trails WITHOUT directly engaging suspects.

INVESTIGATION PHASES:

📱 PHASE 1: SOCIAL MEDIA RECONNAISSANCE
Objective: Analyze the recruiter's Instagram account
- Examine follower patterns (bots vs real accounts)
- Identify associated accounts (same operator?)
- Look for red flags: fake followers, stock photos, suspicious comments
- Map connections to other suspicious accounts

Tools to use:
- Instagram OSINT techniques (profile analysis, follower comparison)
- Reverse image search (check if photos are stolen)
- Metadata extraction (if any images available)

⚠️ ETHICAL GUIDELINE: Never contact the suspect or tip them off

📊 PHASE 2: NETWORK MAPPING
Objective: Build a relationship graph
- Identify other recruiters in the network
- Find "customer" accounts (potential exploiters)
- Document the recruitment funnel (how victims are contacted)
- Spot patterns in language, imagery, offers

Questions to investigate:
- How many accounts are in this network?
- What's the recruitment method? (DMs, comments, ads)
- Are there multiple tiers? (recruiter → handler → operator)
- What locations are mentioned? (cities, countries)

💰 PHASE 3: FOLLOW THE MONEY
Objective: Trace financial transactions
- Analyze the Bitcoin address provided: 3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy
- Track transaction history (inflows and outflows)
- Identify exchange cash-outs (where money becomes fiat)
- Look for mixing/tumbling services
- Find other wallets in the same cluster

Tools:
- Blockchain explorers (Blockchain.com, Blockchair.com)
- Wallet clustering analysis
- Transaction graph visualization

🎯 PHASE 4: INTELLIGENCE REPORT
Objective: Create actionable intelligence for law enforcement

Your report should include:
1. Network Map (visual diagram of accounts and relationships)
2. Recruitment Methods (how they target victims)
3. Financial Trail (cryptocurrency flow and cash-out points)
4. Indicators of Compromise (specific usernames, wallets, patterns)
5. Recommended Actions (accounts to subpoena, evidence to preserve)

⚠️ CRITICAL: This is training with fictional data, but the techniques are real.
In a real case, you would:
- Report findings to NCMEC CyberTipline (missingkids.org/gethelpnow/cybertipline)
- Contact FBI Internet Crime Complaint Center (ic3.gov)
- Never take vigilante action
- Preserve evidence properly (screenshots, timestamps, chain of custody)

Let's begin. What would you like to investigate first?`,
    
    objectives: [
      'Map social media recruitment network',
      'Identify red flags in fake modeling agencies',
      'Trace cryptocurrency payments through blockchain',
      'Create law enforcement-ready intelligence report',
      'Understand ethical boundaries in OSINT investigations'
    ],
    
    tools: [
      'Instagram OSINT',
      'Reverse Image Search',
      'Blockchain Explorers',
      'Network Visualization',
      'Report Writing'
    ],
    
    learningObjectives: [
      { goal: 'osint_investigation', weight: 10, description: 'Master social media investigation techniques' },
      { goal: 'crypto_blockchain_investigation', weight: 8, description: 'Learn cryptocurrency tracing for trafficking cases' },
      { goal: 'financial_investigation', weight: 7, description: 'Follow money trails in criminal networks' }
    ],
    
    skillsRequired: ['Basic OSINT', 'Social media platforms', 'Critical thinking'],
    skillsTaught: [
      'Social media forensics',
      'Recruitment pattern recognition',
      'Cryptocurrency tracing',
      'Network mapping',
      'Evidence documentation for law enforcement',
      'Ethical investigation boundaries'
    ],
    
    learningOutcomes: [
      'Identify trafficking recruitment red flags',
      'Map criminal networks using OSINT',
      'Trace crypto payments through blockchain',
      'Create professional intelligence reports',
      'Understand legal and ethical constraints'
    ],
    
    industryContext: 'These techniques are used daily by FBI, Homeland Security Investigations (HSI), NCMEC, and NGOs like Thorn and Polaris Project to combat human trafficking.',
    
    realWorldExamples: [
      'Operation Cross Country (FBI annual operation rescues 100+ victims)',
      'Backpage takedown investigation (cryptocurrency tracing)',
      'Thorn Spotlight tool (social media pattern analysis)',
      'NCMEC CyberTipline reports (500k+ reports annually)'
    ],
    
    careerPaths: [
      'Digital Forensics Investigator',
      'FBI/HSI Special Agent (Cyber Crimes Against Children)',
      'NGO Investigator (Polaris, Thorn, IJM)',
      'Financial Crime Analyst (Anti-Money Laundering)',
      'OSINT Analyst'
    ]
  },

  {
    id: 'dark_web_marketplace_shutdown',
    name: 'Dark Web Marketplace Shutdown',
    icon: '',
    description: 'Safely investigate a dark web marketplace selling exploitation material. Map infrastructure and identify operators without accessing illegal content.',
    difficulty: 'advanced',
    estimatedTime: '90-120 min',
    tags: ['Dark Web', 'Infrastructure Mapping', 'Cryptocurrency', 'Server Analysis'],
    color: 'purple',
    
    targetFields: [
      { key: 'onion_address', label: 'Onion Address (v3)', type: 'text', required: true, placeholder: 'darkmarket...onion' }
    ],
    
    dummyTargets: {
      onion_address: 'abc123def456ghi789jkl.onion'
    },
    
    starterPrompt: `🌐 OPERATION DARK HUNT - DARK WEB MARKETPLACE INVESTIGATION

⚠️ SAFETY FIRST: This is a training scenario. In real investigations:
- Never access illegal marketplaces directly
- Never download illegal content
- Work ONLY with metadata and public information
- Always coordinate with law enforcement

CASE BRIEFING:
Law enforcement has identified a dark web marketplace suspected of selling exploitation material. They need technical intelligence on the infrastructure and operators WITHOUT accessing the site directly.

Your role: Map the technical infrastructure using safe, legal OSINT techniques.

🔍 PHASE 1: INFRASTRUCTURE RECONNAISSANCE (Safe Techniques)

Objective: Gather technical details WITHOUT accessing the site

Methods:
1. Domain/Onion Analysis:
   - Extract server information from public databases
   - Check dark web search engines (Ahmia, DarkSearch) for metadata
   - Analyze Tor network statistics
   
2. Server Fingerprinting:
   - Identify web server software (Apache, nginx)
   - Detect hosting provider patterns
   - Spot cloudflare/proxy services
   - Analyze SSL/TLS certificates (if any)

3. Historical Data:
   - Check if site was previously indexed
   - Look for operator opsec failures (clearnet mentions)
   - Search for related domains
   - Review dark web forum discussions (public archives)

Tools:
- OnionScan (metadata extraction tool)
- Dark web search engines (for public metadata only)
- WHOIS/DNS history tools
- Tor metrics

💰 PHASE 2: CRYPTOCURRENCY ANALYSIS

Objective: Trace payment infrastructure

Investigation steps:
- Identify payment methods (Bitcoin, Monero, etc.)
- Extract wallet addresses from public mentions
- Analyze blockchain transactions
- Find exchange deposit addresses (cash-out points)
- Look for patterns that indicate shared ownership

Questions:
- What cryptocurrencies are accepted?
- Are there mixing services involved?
- Can we cluster wallets to same operator?
- Where do funds ultimately cash out?

🕸️ PHASE 3: OPERATOR IDENTIFICATION (Opsec Failures)

Objective: Find real-world identity through mistakes

Common opsec failures to look for:
- Reused usernames across clearnet/darknet
- Email addresses in registration leaks
- IP address leaks from misconfiguration
- Similar writing style/language patterns
- Timezone patterns in activity
- Cryptocurrency reuse across platforms

Technique: "Breadcrumb Trail"
1. Find username on dark web
2. Search same username on Google
3. Find clearnet accounts
4. Cross-reference with other data
5. Build identity profile

🎯 PHASE 4: ACTIONABLE INTELLIGENCE PACKAGE

Create a law enforcement briefing:

1. Infrastructure Report:
   - Hosting provider
   - Server location (if determined)
   - Technical vulnerabilities
   - Takedown strategies

2. Financial Intelligence:
   - Cryptocurrency wallets
   - Transaction patterns
   - Cash-out mechanisms
   - Estimated revenue

3. Operator Profile:
   - Suspected real identity (if found)
   - Digital footprint
   - Associated accounts
   - Jurisdiction for prosecution

4. Evidence Preservation:
   - Archive all findings
   - Document methodology
   - Preserve chain of custody
   - Note data sources

⚖️ LEGAL & ETHICAL FRAMEWORK

This investigation must follow strict guidelines:
✅ Use only public/legal data sources
✅ Document everything for court admissibility
✅ Coordinate with law enforcement
✅ Protect any potential victim information
❌ Never access illegal content
❌ Never attempt to purchase/download
❌ Never tip off suspects

Real-World Application:
- These techniques were used to take down:
  - Silk Road (2013)
  - AlphaBay (2017)
  - Welcome to Video (2019 - largest child exploitation takedown)
  - Dark Market (2021)

Ready to begin? Start with Phase 1: What technical metadata can we gather safely?`,
    
    objectives: [
      'Safely investigate dark web infrastructure',
      'Map server hosting and technical details',
      'Trace cryptocurrency payment flows',
      'Identify operators through opsec failures',
      'Create law enforcement intelligence package'
    ],
    
    tools: [
      'OnionScan',
      'Dark Web Search Engines',
      'Blockchain Explorers',
      'WHOIS/DNS Tools',
      'Username OSINT'
    ],
    
    learningObjectives: [
      { goal: 'dark_web_intelligence', weight: 10, description: 'Master safe dark web investigation techniques' },
      { goal: 'crypto_blockchain_investigation', weight: 8, description: 'Advanced cryptocurrency tracing' },
      { goal: 'penetration_testing', weight: 6, description: 'Infrastructure analysis and fingerprinting' }
    ]
  },

  {
    id: 'crypto_laundering_trace',
    name: 'Cryptocurrency Laundering Investigation',
    icon: '',
    description: 'Track $500,000 in Bitcoin from ransomware through mixers and exchanges. Learn advanced blockchain forensics used by FBI and Treasury.',
    difficulty: 'advanced',
    estimatedTime: '60-90 min',
    tags: ['Cryptocurrency', 'Money Laundering', 'AML', 'Financial Crime'],
    color: 'yellow',
    
    targetFields: [
      { key: 'wallet_address', label: 'Source Bitcoin Address', type: 'text', required: true, placeholder: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' }
    ],
    
    dummyTargets: {
      wallet_address: '1CounterpartyXXXXXXXXXXXXXXXUWLpVr'
    },
    
    starterPrompt: `💰 OPERATION MONEY TRAIL - CRYPTOCURRENCY LAUNDERING INVESTIGATION

CASE BRIEFING:
A ransomware attack netted criminals $500,000 in Bitcoin. The funds have been linked to human trafficking operations. Your mission: Trace the money to its final cash-out point.

This is the EXACT methodology used by FBI to recover $2.3M from Colonial Pipeline ransomware.

🔗 PHASE 1: INITIAL WALLET ANALYSIS

Target Address: 1CounterpartyXXXXXXXXXXXXXXXUWLpVr

Investigation checklist:
1. Transaction History:
   - How much Bitcoin has this address received?
   - How many transactions (inbound/outbound)?
   - When was it most active?
   - Are there patterns in transaction amounts?

2. Address Labeling:
   - Is this address known/labeled? (exchange, mixer, etc.)
   - Check multiple blockchain explorers
   - Look for public reports mentioning this address

3. First Hops:
   - Where did the initial $500k go?
   - Single address or split across multiple?
   - Transaction timing (all at once or staggered?)

Tools:
- Blockchain.com explorer
- Blockchair.com (advanced search)
- WalletExplorer (address clustering)

🌊 PHASE 2: FOLLOWING THE MIXING TRAIL

Criminals often use "mixers" or "tumblers" to obscure origin.

Mixer Detection:
- Look for:
  ✓ Funds split into many small amounts
  ✓ Rapid transactions through multiple addresses
  ✓ Known mixer addresses (ChipMixer, Wasabi, etc.)
  ✓ Even-amount patterns (0.1 BTC, 0.5 BTC)

Advanced Technique: "Peeling Chain Analysis"
- Mixer sends 90% forward, keeps 10% (fee)
- Follow the larger output recursively
- Eventually reaches unmixed funds

Questions:
- How many hops until funds hit a mixer?
- Can you identify the mixer service?
- How much was lost to fees?
- Where do funds re-emerge?

🏦 PHASE 3: EXCHANGE IDENTIFICATION (The Cash-Out)

Eventually, criminals need to convert Bitcoin to fiat currency.
This requires a cryptocurrency exchange.

Exchange Indicators:
- Large wallets (hot wallets holding millions)
- Known exchange addresses (check WalletExplorer)
- Deposit patterns (many small inputs, few large outputs)
- KYC requirements mean real identity may be accessible

Popular Exchanges to Check:
- Binance
- Coinbase
- Kraken
- LocalBitcoins (peer-to-peer, risky for criminals)

Action Items:
1. Identify which exchange(s) received funds
2. Calculate total amount deposited
3. Document transaction IDs
4. Note timestamps for subpoena timing

💼 PHASE 4: BUILDING THE FINANCIAL INTELLIGENCE REPORT

Create a comprehensive money flow analysis:

1. Transaction Graph:
   - Visual diagram of money flow
   - Label all key addresses
   - Highlight mixer services
   - Mark exchange deposits

2. Timeline:
   - When was ransom paid?
   - How long until mixing started?
   - When did funds hit exchanges?
   - Total time to cash out?

3. Financial Summary:
   - Starting amount: $500,000
   - Mixer fees: $X
   - Exchange deposits: $Y at [Exchange Names]
   - Estimated recovery: $Z

4. Law Enforcement Recommendations:
   - Subpoena targets (exchange names + dates)
   - Account identification (exchange KYC)
   - Asset seizure opportunities
   - International cooperation needed? (if offshore)

🎯 ADVANCED TECHNIQUES

Cross-Chain Analysis:
- Did funds convert to other cryptocurrencies?
- Check: Bitcoin → Monero → Bitcoin (privacy coin bridge)
- Look for atomic swaps or DEX (decentralized exchange) use

Clustering Analysis:
- Group addresses by common ownership
- Look for change addresses (same wallet)
- Co-spending patterns (multiple inputs = same owner)

Real-World Success Stories:
- Colonial Pipeline: FBI recovered $2.3M by tracing Bitcoin
- Silk Road: $1B+ in Bitcoin seized through blockchain analysis
- Twitter hack 2020: Teens caught via blockchain forensics
- Welcome to Video: 337 arrests via cryptocurrency tracing

📊 DELIVERABLE: FINTEL REPORT

Your report will be used to:
1. Identify suspects (via exchange KYC)
2. Seize assets (freeze exchange accounts)
3. Prosecute criminals (blockchain = immutable evidence)
4. Recover victim funds (where possible)

Ready to begin tracing? What's your first investigative step?`,
    
    objectives: [
      'Analyze Bitcoin transaction patterns',
      'Identify cryptocurrency mixers/tumblers',
      'Trace funds to exchange cash-outs',
      'Build financial intelligence report',
      'Learn FBI blockchain forensics methodology'
    ],
    
    tools: [
      'Blockchain Explorers',
      'WalletExplorer',
      'Transaction Graph Tools',
      'Exchange Identification',
      'Clustering Analysis'
    ],
    
    learningObjectives: [
      { goal: 'crypto_blockchain_investigation', weight: 10, description: 'Master advanced blockchain forensics' },
      { goal: 'financial_investigation', weight: 9, description: 'Learn money laundering detection and tracing' }
    ],
    
    realWorldExamples: [
      'Colonial Pipeline ransomware recovery ($2.3M traced by FBI)',
      'Silk Road investigation ($1B+ Bitcoin seized)',
      'Twitter hack 2020 (suspects identified via blockchain)',
      'AlphaBay takedown (cryptocurrency tracing led to arrest)'
    ]
  },

  {
    id: 'victim_geolocation',
    name: 'Victim Identification Protocol',
    icon: '',
    description: 'Use visual geolocation techniques to help identify victim locations from images. Learn methods used by Interpol and FBI.',
    difficulty: 'expert',
    estimatedTime: '120+ min',
    tags: ['Geolocation', 'Image Forensics', 'Victim Identification', 'OSINT'],
    color: 'blue',
    
    starterPrompt: `📍 OPERATION LOCATION FINDER - VICTIM GEOLOCATION INVESTIGATION

⚠️ CONTENT WARNING: This training deals with victim identification techniques.
All imagery is sanitized/anonymized. No illegal content is shown.

CASE BRIEFING:
Law enforcement has recovered images from a trafficking investigation. The victims' identities are unknown. Your mission: Analyze environmental clues to narrow the geographic location and time period.

This is based on REAL Interpol methodology (Project VIC - Victim Identification Project).

🔍 PHASE 1: IMAGE METADATA ANALYSIS

Even if EXIF data is stripped, clues remain:

Visual Metadata to Examine:
1. Architecture & Building Style:
   - Regional construction patterns
   - Roof types (flat, pitched, tile)
   - Window styles
   - Building materials
   
2. Infrastructure:
   - Electrical outlets (different by country)
   - Light switches & fixtures
   - Plumbing fixtures
   - Door handles & hinges

3. Environmental Clues:
   - Flora (plants, trees - native to regions)
   - Weather patterns
   - Sun angle & shadows (hemisphere + season)
   - Terrain & geography

4. Cultural Indicators:
   - Language on signs/products
   - Currency if visible
   - Brand names (regional availability)
   - Clothing styles
   - Religious symbols

🌍 PHASE 2: GEOLOCATION TECHNIQUES

Advanced methods to pinpoint location:

1. Sun Shadow Analysis:
   - Measure shadow angles
   - Calculate sun position
   - Determine latitude & time of day
   - Narrow hemisphere

2. Flora/Fauna Analysis:
   - Identify plant species
   - Check native ranges (Wikipedia, USDA)
   - Cross-reference climate zones
   - Eliminate incompatible regions

3. Architecture Pattern Matching:
   - Compare to known buildings
   - Use Google Street View for reference
   - Search architectural databases
   - Regional construction standards

4. Language/Cultural Clues:
   - Text on packaging
   - Newspapers/magazines
   - Product brands (regional distribution)
   - Alphabet/script identification

🕰️ PHASE 3: TEMPORAL ANALYSIS

When was the image taken?

Time Indicators:
1. Technology:
   - Electronics visible (phones, TVs)
   - Manufacturing date ranges
   - Obsolescence patterns

2. Fashion/Clothing:
   - Clothing styles by era
   - Brands and their active periods
   - Footwear styles

3. Seasonal Clues:
   - Vegetation state (blooming, dormant)
   - Weather conditions
   - Daylight hours
   - Snow/leaves

4. Cultural Events:
   - Holidays decorations
   - Sports team logos (by season)
   - News events (visible newspapers)

🎯 PHASE 4: COLLABORATIVE VERIFICATION

Real investigations use crowdsourcing:

Verification Steps:
1. Generate Hypothesis:
   - "Based on clues, likely: [Country, Region, City]"
   - "Estimated timeframe: [Year range]"
   - "Confidence level: [High/Medium/Low]"

2. Validate with Multiple Sources:
   - Google Street View comparison
   - Historical imagery (Google Earth time-lapse)
   - Local knowledge (forums, Reddit, GeoGuessr community)
   - Cross-reference all indicators

3. Provide Multiple Candidates:
   - Primary location (highest confidence)
   - Alternate locations (if clues conflict)
   - Explain reasoning for each

📋 PHASE 5: INVESTIGATION REPORT

Law enforcement needs actionable intelligence:

Your report should include:

1. Geographic Analysis:
   - Country (confidence %)
   - Region/State (confidence %)
   - City/Area (confidence %)
   - Specific location (if determinable)

2. Temporal Analysis:
   - Year range (e.g., 2018-2020)
   - Season (if determinable)
   - Time of day (from shadows)

3. Supporting Evidence:
   - List all clues identified
   - Show comparison images
   - Document reasoning chain
   - Note any conflicting evidence

4. Investigative Leads:
   - Potential witnesses (if location determined)
   - Local law enforcement contacts
   - Similar cases in area
   - Next investigation steps

🌟 REAL-WORLD IMPACT

Success Stories:
- Interpol Project VIC: 10,000+ victims identified since 2001
- Europol: 1,000+ arrests through victim identification
- FBI: Hundreds of rescues via geolocation analysis

Notable Cases:
- "Vico" case: German police identified location from reflection in victim's eyes
- Thai beach resort: Location identified from unique rock formation
- Amsterdam case: Wallpaper pattern matched to specific IKEA product year

Techniques You're Learning:
✓ Used by FBI, Interpol, Europol
✓ Taught at law enforcement academies
✓ Standard practice in trafficking investigations
✓ Has directly led to victim rescues

🤝 COMMUNITY COLLABORATION

Real investigations use volunteers:

Organizations That Do This:
- Trace Labs (missing persons OSINT CTF)
- European Financial Coalition (victim identification)
- NCMEC analysts
- FBI citizen volunteer programs

You Could Help:
After completing this training, you can volunteer with organizations that use these exact techniques to identify real victims.

⚖️ ETHICAL GUIDELINES

Critical Reminders:
- Never share victim images
- Never discuss case details publicly
- Always work through official channels
- Protect victim privacy above all
- Report findings to appropriate authorities

Ready to begin? Let's analyze an environmental clue...`,
    
    objectives: [
      'Master visual geolocation techniques',
      'Learn image forensics and metadata analysis',
      'Understand temporal analysis methods',
      'Practice collaborative verification',
      'Create law enforcement-ready reports'
    ],
    
    tools: [
      'Google Earth Pro',
      'Google Street View',
      'Sun position calculators',
      'Flora/fauna databases',
      'Architecture references',
      'GeoGuessr techniques'
    ],
    
    learningObjectives: [
      { goal: 'osint_investigation', weight: 10, description: 'Advanced visual geolocation' },
      { goal: 'threat_hunting', weight: 7, description: 'Evidence analysis and pattern recognition' }
    ],
    
    realWorldExamples: [
      'Interpol Project VIC (10,000+ victims identified)',
      'German "Vico" case (location from eye reflection)',
      'Thai resort identification (rock formation)',
      'FBI geolocation leading to rescues'
    ],
    
    careerPaths: [
      'FBI Victim Specialist',
      'Interpol Analyst',
      'NCMEC Analyst',
      'Digital Forensics Investigator',
      'NGO investigator (Thorn, IJM, Polaris)'
    ]
  },

  {
    id: 'shell_company_trafficking',
    name: 'Shell Company Money Laundering',
    icon: '',
    description: 'Trace trafficking proceeds through shell companies and offshore accounts. Learn corporate intelligence techniques used by financial crime investigators.',
    difficulty: 'advanced',
    estimatedTime: '75-90 min',
    tags: ['Money Laundering', 'Corporate Intelligence', 'Financial Crime', 'Offshore'],
    color: 'teal',
    
    targetFields: [
      { key: 'company_name', label: 'Shell Company Name', type: 'org', required: true, placeholder: 'Global Enterprises LLC' }
    ],
    
    dummyTargets: {
      company_name: 'Phoenix Holdings International Ltd'
    },
    
    starterPrompt: `🏢 OPERATION PAPER TRAIL - SHELL COMPANY INVESTIGATION

CASE BRIEFING:
A trafficking network is laundering proceeds through a web of shell companies. Your mission: Trace beneficial ownership and identify the real operators behind the corporate veil.

Techniques used by FinCEN, Panama Papers investigators, and financial crime units globally.

🔍 PHASE 1: CORPORATE REGISTRY RECONNAISSANCE

Target Company: Phoenix Holdings International Ltd

Investigation Steps:

1. Primary Registration Search:
   - OpenCorporates.com (global database)
   - Jurisdiction-specific registries:
     * UK: Companies House
     * US: State corporation databases
     * Offshore: Panama, Cayman, BVI, Delaware
   - Extract: Registration date, directors, registered agent

2. Red Flags to Identify:
   ⚠️ Registered agent = incorporation service (not real owner)
   ⚠️ Directors = paid nominees (common in BVI, Panama)
   ⚠️ Registered address = mail forwarding service
   ⚠️ Recent formation date + high transaction volume
   ⚠️ Multiple layers of corporate ownership

3. Officer Analysis:
   - Google each director's name
   - Check if they're "professional directors" (serve on 100+ companies)
   - Look for same directors across multiple shells
   - Find actual decision-makers (not front men)

🕸️ PHASE 2: OWNERSHIP CHAIN MAPPING

Goal: Find beneficial owner (real person behind the companies)

Tracing Methodology:

1. Direct Ownership:
   Phoenix Holdings International Ltd
   ↓ (owned by)
   [Company B] (check registry)
   ↓ (owned by)
   [Company C] (check registry)
   ↓ (owned by)
   [Person or Dead End]

2. Cross-Reference Sources:
   - ICIJ Offshore Leaks Database (Panama Papers, Paradise Papers)
   - Leaked databases (if publicly available)
   - Court documents (bankruptcy, divorce, lawsuits)
   - Property records (real estate ownership)

3. Network Analysis:
   - Use Maltego to visualize ownership graph
   - Identify clusters (same owners across companies)
   - Spot patterns in naming conventions
   - Find related entities

💰 PHASE 3: FINANCIAL FLOW ANALYSIS

Follow the money through corporate structures:

1. Banking Relationships:
   - Which banks do they use? (from public filings)
   - Wire transfer patterns (if available from leaks)
   - Correspondent banking relationships
   - High-risk jurisdictions (sanctions concerns)

2. Transaction Patterns:
   - Revenue sources (what's the "business"?)
   - Expense patterns (legitimate or suspicious?)
   - Round-number transactions (common in laundering)
   - Circular flows (money moving between shells)

3. Red Flags:
   ⚠️ No apparent business activity (no employees, no products)
   ⚠️ Transactions don't match stated business purpose
   ⚠️ Rapid movement of large sums
   ⚠️ Involvement of high-risk jurisdictions

🌍 PHASE 4: INTERNATIONAL CONNECTIONS

Trafficking networks operate globally:

1. Jurisdiction Analysis:
   - Why these specific countries?
   - Tax havens vs operational bases
   - Secrecy jurisdictions (BVI, Panama, Seychelles)
   - Countries with weak AML enforcement

2. Cross-Border Tracking:
   - Same beneficial owner, different countries?
   - Pattern of incorporation (always BVI, then UK, then US?)
   - Treaty countries (easier law enforcement cooperation)

3. Sanction Screening:
   - Check OFAC SDN list (US sanctions)
   - UN Security Council sanctions
   - EU sanctions list
   - Interpol notices

🎯 PHASE 5: BUILDING THE FINTEL REPORT

Create an intelligence package for financial crimes investigators:

1. Executive Summary:
   - Who: Ultimate beneficial owner(s)
   - What: Network of X shell companies across Y jurisdictions
   - Where: Primary operating countries
   - When: Timeline of formation and activity
   - Why: Suspected money laundering for trafficking proceeds

2. Ownership Diagram:
   - Visual graph showing all entities
   - Label each with jurisdiction and role
   - Highlight the beneficial owner
   - Show money flow (if traceable)

3. Evidence Summary:
   - List all corporate registrations
   - Document sources (screenshots, URLs)
   - Include director/officer details
   - Note any leaked database findings

4. Investigative Recommendations:
   - Subpoena targets (banks, registries)
   - International cooperation needed (MLATs)
   - Asset seizure opportunities
   - Prosecution jurisdiction

📚 REAL-WORLD CASE STUDIES

Learn from actual investigations:

1. Panama Papers (2016):
   - 11.5 million documents leaked
   - Mossack Fonseca law firm
   - 214,000 shell companies exposed
   - Technique: Matched beneficial owners across leaks

2. FinCEN Files (2020):
   - $2 trillion in suspicious transactions
   - Banks failed to stop money laundering
   - Many linked to trafficking networks

3. Danske Bank Scandal (2018):
   - $230 billion laundered through Baltic branches
   - Shell companies from offshore havens
   - Included trafficking proceeds

Tools You're Learning:
✓ Same tools used by ICIJ journalists
✓ Corporate intelligence for financial crimes
✓ Techniques from FinCEN and US Treasury
✓ Methods taught at anti-money laundering academies

⚖️ LEGAL FRAMEWORK

Understanding AML Laws:

1. Bank Secrecy Act (US):
   - Requires reporting of suspicious activity
   - $10k+ cash transactions must be reported
   - Beneficial ownership rules (CDD Rule)

2. EU AML Directives:
   - 5th AML Directive (beneficial ownership registries)
   - Enhanced due diligence requirements
   - PEP (Politically Exposed Person) screening

3. FATF Recommendations:
   - 40 recommendations for AML/CFT
   - Gray list (high-risk jurisdictions)
   - Black list (non-cooperative countries)

Ready to trace the corporate maze? Let's start with the first registry search...`,
    
    objectives: [
      'Navigate international corporate registries',
      'Trace beneficial ownership through shell companies',
      'Identify money laundering red flags',
      'Map complex corporate structures',
      'Create financial intelligence reports'
    ],
    
    tools: [
      'OpenCorporates',
      'ICIJ Offshore Leaks Database',
      'National Corporate Registries',
      'Maltego',
      'Sanction Screening Tools'
    ],
    
    learningObjectives: [
      { goal: 'financial_investigation', weight: 10, description: 'Master corporate intelligence and beneficial ownership tracing' },
      { goal: 'osint_investigation', weight: 8, description: 'Advanced multi-source intelligence gathering' }
    ],
    
    realWorldExamples: [
      'Panama Papers investigation (214,000 shell companies)',
      'FinCEN Files ($2 trillion suspicious transactions)',
      'Danske Bank scandal ($230B laundered)',
      'Human trafficking networks using shell companies'
    ]
  }
];

// Export for use in campaign selection
export default ANTI_TRAFFICKING_CAMPAIGNS;
