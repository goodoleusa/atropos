---
id: incident_response
name: Incident Response
difficulty: expert
tags:
  - DFIR
  - Blue Team
  - Crisis
icon: 🚨
---

# Incident Response

## Overview
Respond to an active security incident. Contain, eradicate, recover.

## Investigation Mesh (Twine-style)
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Contain the threat

### Knowledge Graph
- [[Contain the threat]]
- [[Preserve evidence]]
- [[Assess scope]]
- [[Identify root cause]]
- [[Plan eradication]]
- [[Tool: Network isolation]]
- [[Tool: Memory forensics]]
- [[Tool: Log analysis]]
- [[Tool: Backup restoration]]
- [[Tool: IOC hunting]]

## Starter Prompt
```
ALERT: Active incident in progress!

Situation: Multiple workstations exhibiting ransomware behavior
Timeline: Started 15 minutes ago
Affected systems: Finance department (10+ hosts)

Help me through the IR process:
1. Initial containment actions
2. Preservation of evidence
3. Scope assessment
4. Root cause analysis
5. Eradication planning
6. Recovery steps

What's our immediate priority action?
```

## Clues & Discovery
- [[Clue: incident_response_source]]
- [[Evidence: incident_response_intel]]
