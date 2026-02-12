---
id: "operation_shadow_network"
name: "Operation Shadow Network"
type: "campaign"
difficulty: "intermediate"
tags: ["Human Trafficking", "Social Media OSINT", "Cryptocurrency", "Network Mapping"]
icon: "🕵️"
color: "red"
estimatedTime: "60-90 min"
parent:
  - "[[INDEX|INDEX]]"
child:
  - "[[Map social media recruitment network]]"
sibling: []
left_side_friend: []
right_side_friend: []
objectives:
  - "Map social media recruitment network"
  - "Identify red flags in fake modeling agencies"
  - "Trace cryptocurrency payments through blockchain"
  - "Create law enforcement-ready intelligence report"
  - "Understand ethical boundaries in OSINT investigations"
tools:
  - "Instagram OSINT"
  - "Reverse Image Search"
  - "Blockchain Explorers"
  - "Network Visualization"
  - "Report Writing"
skillsRequired:
  - "Basic OSINT"
  - "Social media platforms"
  - "Critical thinking"
skillsTaught:
  - "Social media forensics"
  - "Recruitment pattern recognition"
  - "Cryptocurrency tracing"
  - "Network mapping"
  - "Evidence documentation for law enforcement"
  - "Ethical investigation boundaries"
learningObjectives:
  - "{\"goal\":\"osint_investigation\",\"weight\":10,\"description\":\"Master social media investigation techniques\"}"
  - "{\"goal\":\"crypto_blockchain_investigation\",\"weight\":8,\"description\":\"Learn cryptocurrency tracing for trafficking cases\"}"
  - "{\"goal\":\"financial_investigation\",\"weight\":7,\"description\":\"Follow money trails in criminal networks\"}"
targetFields:
  - "{\"key\":\"instagram_handle\",\"label\":\"Suspected Recruiter Instagram\",\"type\":\"text\",\"required\":true,\"placeholder\":\"@modeling_agency_2024\"}"
  - "{\"key\":\"bitcoin_address\",\"label\":\"Bitcoin Payment Address\",\"type\":\"text\",\"required\":false,\"placeholder\":\"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa\"}"
dummyTargets: "[object Object]"
industryContext: "These techniques are used daily by FBI, Homeland Security Investigations (HSI), NCMEC, and NGOs like Thorn and Polaris Project to combat human trafficking."
clues: []
date_created: 2026-40-Mo
date_modified: 2026-54-Tu
---

# Operation Shadow Network

## Overview
Investigate a trafficking ring using social media to recruit victims. Track their network and follow the money through cryptocurrency.

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Map social media recruitment network

### Knowledge Graph
- [[Map social media recruitment network]]
- [[Identify red flags in fake modeling agencies]]
- [[Trace cryptocurrency payments through blockchain]]
- [[Create law enforcement-ready intelligence report]]
- [[Understand ethical boundaries in OSINT investigations]]
- [[Tool: Instagram OSINT]]
- [[Tool: Reverse Image Search]]
- [[Tool: Blockchain Explorers]]
- [[Tool: Network Visualization]]
- [[Tool: Report Writing]]


## Starter Prompt
```
🚨 OPERATION SHADOW NETWORK - HUMAN TRAFFICKING INVESTIGATION

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

Let's begin. What would you like to investigate first?
```
