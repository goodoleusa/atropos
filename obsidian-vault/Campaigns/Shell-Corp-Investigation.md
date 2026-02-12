---
id: shell_corp_osint
name: Shell Corp Investigation
type: campaign
status: active
icon: "🏢"
difficulty: intermediate
estimatedTime: "45-60 min"
tags:
  - OSINT
  - Corporate-Intel
  - Financial
color: amber

# Relationships (Breadcrumbs)
prerequisite: [[Passive-Reconnaissance]]
unlocks: [[Cryptocurrency-Tracing]], [[Advanced-Corporate-Intel]]
related: [[Financial-Investigation-Track]]
part-of: [[Financial-Crime-Investigator]]
track: [[Financial-Investigation-Track]]

# Target Configuration
targetFields:
  - key: org
    label: Organization Name
    type: org
    required: true
    placeholder: Obsidian Holdings LLC
  - key: domain
    label: Primary Domain
    type: domain
    required: false
    placeholder: obsidian-holdings.com
dummyTargets:
  org: Obsidian Holdings LLC
  domain: obsidian-holdings.com

# Learning Integration
learningObjectives:
  - goal: financial_investigation
    weight: 10
    description: Master corporate intelligence and ownership tracing
  - goal: osint_investigation
    weight: 8
    description: Apply multi-source OSINT techniques
  - goal: socmint
    weight: 5
    description: Profile key personnel via social media
skillsRequired:
  - Basic OSINT
  - Search engine proficiency
  - Corporate structure basics
skillsTaught:
  - Corporate registry navigation
  - Beneficial ownership analysis
  - Entity relationship mapping
  - Financial document interpretation
learningOutcomes:
  - Navigate international corporate registries
  - Trace beneficial ownership through shell companies
  - Map complex corporate structures
  - Identify red flags in business entities
  - Correlate entities across multiple jurisdictions
industryContext: Financial crime investigators, fraud analysts, compliance officers, and journalists use these techniques to expose money laundering, corruption, and criminal networks. Skills directly applicable to AML/CFT compliance roles.
realWorldExamples:
  - Panama Papers investigation (ICIJ)
  - Danske Bank money laundering scandal
  - Wirecard fraud investigation
  - FinCEN Files leak analysis
careerPaths:
  - Financial Crime Analyst
  - Fraud Investigator
  - AML Compliance Officer
  - Investigative Journalist
  - Corporate Intelligence Analyst
---

# Shell Corp Investigation

## Overview

Investigate a suspicious shell corporation. Trace ownership through multiple jurisdictions, find hidden connections, expose the network of entities. Learn corporate intelligence techniques used by financial crime investigators and journalists to uncover fraud and corruption.

## Objectives

1. Identify corporate registration details and jurisdiction
2. Map subsidiary relationships and ownership structure
3. Find beneficial ownership (who really controls it)
4. Trace financial connections and related entities
5. Build personnel dossiers on key figures

## Tools Required

- WHOIS (domain/IP lookup)
- SEC EDGAR (US corporate filings)
- OpenCorporates (global company registry)
- LinkedIn (personnel research)
- Companies House (UK registry)
- State business registries
- ICIJ Offshore Leaks Database

## Starter Prompt

I want to investigate a shell corporation called "Obsidian Holdings LLC".

Help me build a dossier by:

1. Identifying corporate registration patterns
2. Finding beneficial ownership through OSINT techniques
3. Mapping connected entities and subsidiaries
4. Tracing financial relationships
5. Identifying key personnel and their digital footprints

Start with the basics - what sources would you check first for corporate intel?

## Teaching Adaptations

### 🔧 Experiential Learner

Jump straight into OpenCorporates. Search the target company. Click through ownership chains. Learn registries by exploring them. Make mistakes - chase dead ends - that's how you learn what patterns matter.

### 📊 Visual Learner

Start by drawing an org chart as you discover entities. Use Maltego or similar to visualize ownership graphs. Color-code jurisdictions. Watch relationships emerge visually as you add nodes.

### 🔬 Analytical Learner

Begin with corporate law fundamentals: legal entity types, beneficial ownership definitions, jurisdiction differences. Reference FinCEN guidance on shell companies. Understand the regulatory framework before diving into investigation.

### 👥 Social Learner

Reference famous investigations: Panama Papers methodology, Bellingcat corporate tracing. Join OSINT communities discussing corporate intel techniques. Share your ownership graph discoveries with peers.

### ⚡ Pragmatic Learner

Here's the workflow: OpenCorporates → grab all officers → LinkedIn each officer → find connections → cross-reference with other companies → map it. Done. Script it if you do this regularly.

## Investigation Steps

### Step 1: Initial Discovery

**Goal**: Find basic registration information

**Tools**: WHOIS, State business registry

**Questions**:

- Where is this company registered?
- When was it incorporated?
- What is its registered agent?
- What is its business address?

**Success Indicators**:

- Registration state/jurisdiction found
- Formation date identified
- Registered agent known
- Physical address located

**Red Flags**:

- P.O. box address only
- Recently formed
- Registered agent is known for shell companies
- Jurisdiction is tax haven

### Step 2: Ownership Tracing

**Goal**: Identify who owns and controls the entity

**Tools**: OpenCorporates, SEC EDGAR (if public), state filings

**Questions**:

- Who are the officers and directors?
- What other entities do they control?
- Is there a parent company?
- Who is the beneficial owner?

**Success Indicators**:

- Officer names and titles found
- Cross-references to other entities
- Parent company identified
- Beneficial owner determined

**Red Flags**:

- Officers with minimal online presence
- Same officers across many shell companies
- Nominee directors (professional placeholders)
- Offshore parent company

### Step 3: Network Mapping

**Goal**: Map the full corporate network

**Tools**: Maltego, manual mapping, corporate registries

**Questions**:

- What subsidiaries does this company own?
- What companies share officers/addresses?
- Are there circular ownership structures?
- What is the geographic distribution?

**Success Indicators**:

- Network diagram created
- Related entities identified
- Ownership percentages known
- Corporate structure clear

**Red Flags**:

- Complex layered structures (3+ levels)
- Multiple jurisdictions involved
- Circular or opaque ownership
- Shell companies owning shell companies

### Step 4: Personnel Research

**Goal**: Profile key individuals

**Tools**: LinkedIn, Google, social media, news articles

**Questions**:

- Who are the real people behind the entities?
- What are their backgrounds?
- Do they have histories with other companies?
- Any legal issues or red flags?

**Success Indicators**:

- LinkedIn profiles found
- Career history documented
- Professional network mapped
- Digital footprint analyzed

**Red Flags**:

- No online presence
- Inconsistent career histories
- Links to known fraud cases
- Professionally manufactured identities

### Step 5: Financial Relationship Tracing

**Goal**: Follow the money

**Tools**: SEC filings, annual reports, transaction records (if available)

**Questions**:

- Who does business with this company?
- Where does funding come from?
- What are the money flows?
- Any suspicious transactions?

**Success Indicators**:

- Business partners identified
- Funding sources traced
- Transaction patterns analyzed
- Financial relationships mapped

## Expected Findings

- Complete corporate structure diagram
- Beneficial ownership chain
- Network of related entities (5-10+)
- Personnel dossiers (3-5 key figures)
- Red flag indicators
- Jurisdiction analysis
- Professional report documenting findings

## Validation

Investigation successful if you can:

- Draw ownership structure from memory
- Explain who benefits from this structure
- Identify potential legal/regulatory issues
- Document chain of evidence
- Present findings to non-technical audience

## Extensions

- [[Cryptocurrency-Tracing]] - If payments involve crypto
- [[Dark-Web-Intelligence]] - If entity has underground presence
- [[SOCMINT-Deep-Dive]] - Profile all personnel thoroughly
- [[International-Jurisdiction-Analysis]] - Multi-country tracing

---

## Related Notes

- [[Financial-Investigation-Track]]
- [[Corporate-Registry-Guide]]
- [[Beneficial-Ownership-Explained]]
- [[Panama-Papers-Case-Study]]

**Sync Status**: ✅ Synced to app  
**Last Modified**: 2026-02-06  
**Export Command**: `npm run sync:campaigns -- --from-obsidian`
