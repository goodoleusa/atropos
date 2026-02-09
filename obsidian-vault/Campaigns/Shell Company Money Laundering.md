---
id: shell_company_trafficking
name: Shell Company Money Laundering
difficulty: advanced
tags:
  - Money Laundering
  - Corporate Intelligence
  - Financial Crime
  - Offshore
icon: 🏢
---

# Shell Company Money Laundering

## Overview
Trace trafficking proceeds through shell companies and offshore accounts. Learn corporate intelligence techniques used by financial crime investigators.

## Investigation Mesh (Twine-style)
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Navigate international corporate registries

### Knowledge Graph
- [[Navigate international corporate registries]]
- [[Trace beneficial ownership through shell companies]]
- [[Identify money laundering red flags]]
- [[Map complex corporate structures]]
- [[Create financial intelligence reports]]
- [[Tool: OpenCorporates]]
- [[Tool: ICIJ Offshore Leaks Database]]
- [[Tool: National Corporate Registries]]
- [[Tool: Maltego]]
- [[Tool: Sanction Screening Tools]]

## Starter Prompt
```
🏢 OPERATION PAPER TRAIL - SHELL COMPANY INVESTIGATION

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

Ready to trace the corporate maze? Let's start with the first registry search...
```

## Clues & Discovery
- [[Clue: shell_company_trafficking_source]]
- [[Evidence: shell_company_trafficking_intel]]
