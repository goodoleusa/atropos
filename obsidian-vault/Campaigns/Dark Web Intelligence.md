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
parent:
  - "[[INDEX|INDEX]]"
child:
  - "[[Check breach databases]]"
sibling: []
prev: []
next:
  - "[[Check breach databases]]"
left_side_friend: []
right_side_friend: []
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
skillsRequired:
  - "Basic OSINT"
  - "Understanding of anonymity networks"
  - "Operational security awareness"
skillsTaught:
  - "Breach database searching"
  - "Paste site monitoring"
  - "Dark web marketplace analysis"
  - "Credential exposure assessment"
  - "Ransomware leak tracking"
learningObjectives:
  - "{\"goal\":\"dark_web_intelligence\",\"weight\":10,\"description\":\"Master dark web investigation techniques\"}"
  - "{\"goal\":\"threat_hunting\",\"weight\":7,\"description\":\"Proactive threat detection from underground sources\"}"
  - "{\"goal\":\"osint_investigation\",\"weight\":5,\"description\":\"Apply OSINT to underground intelligence\"}"
targetFields:
  - "{\"key\":\"org\",\"label\":\"Organization\",\"type\":\"org\",\"required\":true,\"placeholder\":\"MegaCorp\"}"
  - "{\"key\":\"domain\",\"label\":\"Domain (optional)\",\"type\":\"domain\",\"required\":false,\"placeholder\":\"megacorp.com\"}"
dummyTargets: "[object Object]"
industryContext: "Threat intelligence teams, fraud prevention, and security operations centers monitor dark web for early warning of attacks, stolen credentials, and data breaches. Law enforcement uses these techniques for cybercrime investigations."
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
