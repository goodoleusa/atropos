---
id: "social_engineering"
name: "Social Engineering Recon"
type: "campaign"
difficulty: "intermediate"
tags:
  - "OSINT"
  - "Social Engineering"
  - "Personnel"
icon: "🎭"
color: "pink"
estimatedTime: "45-60 min"
parent:
  - "[[INDEX|INDEX]]"
child:
  - "[[Map org structure]]"
sibling: []
prev: []
next:
  - "[[Map org structure]]"
left_side_friend: []
right_side_friend: []
objectives:
  - "Map org structure"
  - "Profile key personnel"
  - "Find email patterns"
  - "Gather personal details"
  - "Identify pretexting angles"
tools:
  - "LinkedIn"
  - "Hunter.io"
  - "theHarvester"
  - "Social media OSINT"
  - "Google dorking"
skillsRequired: []
skillsTaught: []
learningObjectives: []
targetFields:
  - "{\"key\":\"org\",\"label\":\"Organization\",\"type\":\"org\",\"required\":true,\"placeholder\":\"TechCorp Industries\"}"
  - "{\"key\":\"domain\",\"label\":\"Primary Domain (optional)\",\"type\":\"domain\",\"required\":false,\"placeholder\":\"techcorp.com\"}"
dummyTargets: "[object Object]"
industryContext: ""
clues: []
---

# Social Engineering Recon

## Overview
Build target profiles for social engineering. OSINT on personnel and organizational structure.

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Map org structure

### Knowledge Graph
- [[Map org structure]]
- [[Profile key personnel]]
- [[Find email patterns]]
- [[Gather personal details]]
- [[Identify pretexting angles]]
- [[Tool: LinkedIn]]
- [[Tool: Hunter.io]]
- [[Tool: theHarvester]]
- [[Tool: Social media OSINT]]
- [[Tool: Google dorking]]


## Starter Prompt
```
I need to build social engineering reconnaissance on organization: TechCorp Industries

Goals:
1. Map organizational structure
2. Identify key personnel (executives, IT, finance)
3. Find email naming conventions
4. Discover personal details (social media, hobbies)
5. Identify third-party relationships
6. Find potential pretexting angles

What OSINT sources should we mine first for personnel intelligence?
```
