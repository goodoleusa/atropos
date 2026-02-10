---
id: "shell_corp_osint"
name: "Shell Corp Investigation"
type: "campaign"
difficulty: "intermediate"
tags:
  - "OSINT"
  - "Corporate Intel"
  - "Financial"
icon: "🏢"
color: "amber"
estimatedTime: "45-60 min"
parent:
  - "[[INDEX|INDEX]]"
child:
  - "[[Identify corporate registration details]]"
sibling: []
prev: []
next:
  - "[[Identify corporate registration details]]"
left_side_friend: []
right_side_friend: []
objectives:
  - "Identify corporate registration details"
  - "Map subsidiary relationships"
  - "Find beneficial ownership"
  - "Trace financial connections"
  - "Build personnel dossiers"
tools:
  - "WHOIS"
  - "SEC EDGAR"
  - "OpenCorporates"
  - "LinkedIn OSINT"
  - "Domain analysis"
skillsRequired:
  - "Basic OSINT"
  - "Search engine proficiency"
  - "Corporate structure basics"
skillsTaught:
  - "Corporate registry navigation"
  - "Beneficial ownership analysis"
  - "Entity relationship mapping"
  - "Financial document interpretation"
learningObjectives:
  - "{\"goal\":\"financial_investigation\",\"weight\":10,\"description\":\"Master corporate intelligence and ownership tracing\"}"
  - "{\"goal\":\"osint_investigation\",\"weight\":8,\"description\":\"Apply multi-source OSINT techniques\"}"
  - "{\"goal\":\"socmint\",\"weight\":5,\"description\":\"Profile key personnel via social media\"}"
targetFields:
  - "{\"key\":\"org\",\"label\":\"Organization Name\",\"type\":\"org\",\"required\":true,\"placeholder\":\"Obsidian Holdings LLC\"}"
  - "{\"key\":\"domain\",\"label\":\"Primary Domain\",\"type\":\"domain\",\"required\":false,\"placeholder\":\"obsidian-holdings.com\"}"
dummyTargets: "[object Object]"
industryContext: "Financial crime investigators, fraud analysts, compliance officers, and journalists use these techniques to expose money laundering, corruption, and criminal networks. Skills directly applicable to AML/CFT compliance roles."
clues: []
---

# Shell Corp Investigation

## Overview
Investigate a suspicious shell corporation. Trace ownership, find hidden connections, and expose the network.

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Identify corporate registration details

### Knowledge Graph
- [[Identify corporate registration details]]
- [[Map subsidiary relationships]]
- [[Find beneficial ownership]]
- [[Trace financial connections]]
- [[Build personnel dossiers]]
- [[Tool: WHOIS]]
- [[Tool: SEC EDGAR]]
- [[Tool: OpenCorporates]]
- [[Tool: LinkedIn OSINT]]
- [[Tool: Domain analysis]]


## Starter Prompt
```
I want to investigate a shell corporation called "Obsidian Holdings LLC". 

Help me build a dossier by:
1. Identifying corporate registration patterns
2. Finding beneficial ownership through OSINT techniques
3. Mapping connected entities and subsidiaries
4. Tracing financial relationships
5. Identifying key personnel and their digital footprints

Start with the basics - what sources would you check first for corporate intel?
```
