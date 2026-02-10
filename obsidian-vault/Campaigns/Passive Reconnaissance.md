---
id: "passive_recon"
name: "Passive Reconnaissance"
type: "campaign"
difficulty: "beginner"
tags:
  - "Recon"
  - "OSINT"
  - "DNS"
icon: "👁️"
color: "purple"
estimatedTime: "20-30 min"
parent:
  - "[[INDEX|INDEX]]"
child:
  - "[[Enumerate DNS records]]"
sibling: []
prev: []
next:
  - "[[Enumerate DNS records]]"
left_side_friend: []
right_side_friend: []
objectives:
  - "Enumerate DNS records"
  - "Analyze certificate transparency"
  - "Find historical snapshots"
  - "Identify email patterns"
  - "Map technology stack"
tools:
  - "SecurityTrails"
  - "crt.sh"
  - "Wayback Machine"
  - "Shodan"
  - "BuiltWith"
skillsRequired:
  - "Basic web browsing"
  - "Understanding of DNS"
skillsTaught:
  - "DNS enumeration"
  - "Certificate transparency analysis"
  - "Historical data mining"
  - "Technology fingerprinting"
  - "Subdomain discovery"
learningObjectives:
  - "{\"goal\":\"osint_investigation\",\"weight\":10,\"description\":\"Master passive reconnaissance techniques\"}"
  - "{\"goal\":\"penetration_testing\",\"weight\":5,\"description\":\"Learn reconnaissance phase of pentesting\"}"
targetFields:
  - "{\"key\":\"domain\",\"label\":\"Domain\",\"type\":\"domain\",\"required\":true,\"placeholder\":\"sysadmincorp.net\"}"
  - "{\"key\":\"org\",\"label\":\"Organization (optional)\",\"type\":\"org\",\"required\":false,\"placeholder\":\"SysAdmin Corp\"}"
dummyTargets: "[object Object]"
industryContext: "Bug bounty hunters and penetration testers always start with passive recon to map attack surface without alerting targets. Essential first phase of any security assessment."
clues: []
---

# Passive Reconnaissance

## Overview
Gather intelligence without touching the target. DNS, certificates, historical data only.

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Enumerate DNS records

### Knowledge Graph
- [[Enumerate DNS records]]
- [[Analyze certificate transparency]]
- [[Find historical snapshots]]
- [[Identify email patterns]]
- [[Map technology stack]]
- [[Tool: SecurityTrails]]
- [[Tool: crt.sh]]
- [[Tool: Wayback Machine]]
- [[Tool: Shodan]]
- [[Tool: BuiltWith]]


## Starter Prompt
```
I need to perform passive reconnaissance on target domain: sysadmincorp.net

Rules: NO active scanning, NO direct connections to target infrastructure.

Help me gather:
1. DNS records (A, MX, TXT, NS, SPF, DMARC)
2. SSL/TLS certificate history and SANs
3. Subdomain enumeration via CT logs
4. Historical WHOIS records
5. Wayback Machine snapshots
6. Email format patterns
7. Technology fingerprinting from public sources

What's our first passive recon step?
```
