---
{
  "id": "operation_shadow_network",
  "name": "Operation Shadow Network",
  "icon": "🕵️",
  "difficulty": "intermediate",
  "estimatedTime": "60-90 min",
  "tags": [
    "Human Trafficking",
    "Social Media OSINT",
    "Cryptocurrency",
    "Network Mapping"
  ],
  "color": "red",
  "targetFields": [
    {
      "key": "instagram_handle",
      "label": "Suspected Recruiter Instagram",
      "type": "text",
      "required": true,
      "placeholder": "@modeling_agency_2024"
    },
    {
      "key": "bitcoin_address",
      "label": "Bitcoin Payment Address",
      "type": "text",
      "required": false,
      "placeholder": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    }
  ],
  "dummyTargets": {
    "instagram_handle": "@luxlife_recruiting",
    "bitcoin_address": "3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy"
  },
  "learningObjectives": [
    {
      "goal": "osint_investigation",
      "weight": 10,
      "description": "Master social media investigation techniques"
    },
    {
      "goal": "crypto_blockchain_investigation",
      "weight": 8,
      "description": "Learn cryptocurrency tracing for trafficking cases"
    },
    {
      "goal": "financial_investigation",
      "weight": 7,
      "description": "Follow money trails in criminal networks"
    }
  ],
  "skillsRequired": [
    "Basic OSINT",
    "Social media platforms",
    "Critical thinking"
  ],
  "skillsTaught": [
    "Social media forensics",
    "Recruitment pattern recognition",
    "Cryptocurrency tracing",
    "Network mapping",
    "Evidence documentation for law enforcement",
    "Ethical investigation boundaries"
  ],
  "learningOutcomes": [
    "Identify trafficking recruitment red flags",
    "Map criminal networks using OSINT",
    "Trace crypto payments through blockchain",
    "Create professional intelligence reports",
    "Understand legal and ethical constraints"
  ],
  "industryContext": "These techniques are used daily by FBI, Homeland Security Investigations (HSI), NCMEC, and NGOs like Thorn and Polaris Project to combat human trafficking.",
  "realWorldExamples": [
    "Operation Cross Country (FBI annual operation rescues 100+ victims)",
    "Backpage takedown investigation (cryptocurrency tracing)",
    "Thorn Spotlight tool (social media pattern analysis)",
    "NCMEC CyberTipline reports (500k+ reports annually)"
  ],
  "careerPaths": [
    "Digital Forensics Investigator",
    "FBI/HSI Special Agent (Cyber Crimes Against Children)",
    "NGO Investigator (Polaris, Thorn, IJM)",
    "Financial Crime Analyst (Anti-Money Laundering)",
    "OSINT Analyst"
  ]
}
---

# Operation Shadow Network

## Overview
Investigate a trafficking ring using social media to recruit victims. Track their network and follow the money through cryptocurrency.

## Objectives
1. Map social media recruitment network
2. Identify red flags in fake modeling agencies
3. Trace cryptocurrency payments through blockchain
4. Create law enforcement-ready intelligence report
5. Understand ethical boundaries in OSINT investigations

## Tools Required
- Instagram OSINT
- Reverse Image Search
- Blockchain Explorers
- Network Visualization
- Report Writing

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
