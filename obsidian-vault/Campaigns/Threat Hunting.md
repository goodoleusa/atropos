---
id: "threat_hunting"
name: "Threat Hunting"
type: "campaign"
difficulty: "expert"
tags:
  - "Blue Team"
  - "DFIR"
  - "Detection"
icon: "🎯"
color: "orange"
estimatedTime: "60-90 min"
parent:
  - "[[INDEX|INDEX]]"
child:
  - "[[Formulate hunting hypotheses]]"
sibling: []
prev: []
next:
  - "[[Formulate hunting hypotheses]]"
left_side_friend: []
right_side_friend: []
objectives:
  - "Formulate hunting hypotheses"
  - "Analyze log sources"
  - "Identify IOCs"
  - "Trace lateral movement"
  - "Find persistence mechanisms"
tools:
  - "RITA"
  - "Sigma rules"
  - "YARA"
  - "Splunk/ELK queries"
  - "Velociraptor"
skillsRequired: []
skillsTaught: []
learningObjectives: []
targetFields:
  - "{\"key\":\"org\",\"label\":\"Organization / Environment\",\"type\":\"org\",\"required\":true,\"placeholder\":\"SysAdmin Corp\"}"
  - "{\"key\":\"context\",\"label\":\"Incident Context (optional)\",\"type\":\"text\",\"required\":false,\"placeholder\":\"Unusual outbound traffic at 3 AM\"}"
dummyTargets: "[object Object]"
industryContext: ""
clues: []
---

# Threat Hunting

## Overview
Proactively search for indicators of compromise. Analyze logs, hunt for persistence.

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Formulate hunting hypotheses

### Knowledge Graph
- [[Formulate hunting hypotheses]]
- [[Analyze log sources]]
- [[Identify IOCs]]
- [[Trace lateral movement]]
- [[Find persistence mechanisms]]
- [[Tool: RITA]]
- [[Tool: Sigma rules]]
- [[Tool: YARA]]
- [[Tool: Splunk/ELK queries]]
- [[Tool: Velociraptor]]


## Starter Prompt
```
I'm a threat hunter investigating potential compromise indicators.

Available data sources:
- Windows Event Logs (Security, System, PowerShell)
- Firewall logs
- DNS query logs
- Proxy logs

Suspicious activity reported: Unusual outbound traffic at 3 AM

Help me:
1. Create hunting hypotheses
2. Identify relevant log sources
3. Build detection queries
4. Look for lateral movement indicators
5. Check for persistence mechanisms
6. Timeline the activity

Where should we start the hunt?
```
