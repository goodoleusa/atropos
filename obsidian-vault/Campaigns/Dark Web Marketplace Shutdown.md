---
id: "dark_web_marketplace_shutdown"
name: "Dark Web Marketplace Shutdown"
type: "campaign"
difficulty: "advanced"
tags:
  - "Dark Web"
  - "Infrastructure Mapping"
  - "Cryptocurrency"
  - "Server Analysis"
icon: "🌐"
color: "purple"
estimatedTime: "90-120 min"
up:
  - "[[INDEX|INDEX]]"
next:
  - "[[Safely investigate dark web infrastructure]]"
objectives:
  - "Safely investigate dark web infrastructure"
  - "Map server hosting and technical details"
  - "Trace cryptocurrency payment flows"
  - "Identify operators through opsec failures"
  - "Create law enforcement intelligence package"
tools:
  - "OnionScan"
  - "Dark Web Search Engines"
  - "Blockchain Explorers"
  - "WHOIS/DNS Tools"
  - "Username OSINT"
skills: []
clues: []
---

# Dark Web Marketplace Shutdown

## Overview
Safely investigate a dark web marketplace selling exploitation material. Map infrastructure and identify operators without accessing illegal content.

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Safely investigate dark web infrastructure

### Knowledge Graph
- [[Safely investigate dark web infrastructure]]
- [[Map server hosting and technical details]]
- [[Trace cryptocurrency payment flows]]
- [[Identify operators through opsec failures]]
- [[Create law enforcement intelligence package]]
- [[Tool: OnionScan]]
- [[Tool: Dark Web Search Engines]]
- [[Tool: Blockchain Explorers]]
- [[Tool: WHOIS/DNS Tools]]
- [[Tool: Username OSINT]]


## Starter Prompt
```
🌐 OPERATION DARK HUNT - DARK WEB MARKETPLACE INVESTIGATION

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

Ready to begin? Start with Phase 1: What technical metadata can we gather safely?
```
