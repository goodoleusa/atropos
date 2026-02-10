---
id: "dark_web_intel"
name: "Dark Web Intelligence"
type: "campaign"
difficulty: "advanced"
tags:
  - "Dark Web"
  - "Threat Intel"
  - "Breaches"
icon: "🕸️"
color: "gray"
estimatedTime: "30-45 min"
up:
  - "[[../INDEX|INDEX]]"
next:
  - "[[Check breach databases]]"
objectives:
  - "Check breach databases"
  - "Search paste sites"
  - "Monitor threat actor chatter"
  - "Track ransomware leaks"
  - "Document exposure"
tools:
  - "Have I Been Pwned"
  - "DeHashed"
  - "IntelX"
  - "Recorded Future"
  - "DarkOwl"
skills:
  - "Breach database searching"
  - "Paste site monitoring"
  - "Dark web marketplace analysis"
  - "Credential exposure assessment"
  - "Ransomware leak tracking"
clues: []
---

# Dark Web Intelligence

## Overview
Monitor dark web for leaked credentials, data breaches, and threat actor chatter.

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Check breach databases

### Knowledge Graph
- [[Check breach databases]]
- [[Search paste sites]]
- [[Monitor threat actor chatter]]
- [[Track ransomware leaks]]
- [[Document exposure]]
- [[Tool: Have I Been Pwned]]
- [[Tool: DeHashed]]
- [[Tool: IntelX]]
- [[Tool: Recorded Future]]
- [[Tool: DarkOwl]]


## Starter Prompt
```
I need to check if our organization has exposure on the dark web.

Target organization: MegaCorp (domain: megacorp.com)

Help me investigate:
1. Check for leaked credentials in breach databases
2. Search paste sites for company data
3. Look for mentions in hacker forums
4. Check ransomware leak sites
5. Monitor for insider threats
6. Find exposed documents/data

What safe OSINT methods can we use without accessing actual dark web markets?
```
