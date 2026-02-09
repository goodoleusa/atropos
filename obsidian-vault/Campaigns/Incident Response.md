---
{
  "id": "incident_response",
  "name": "Incident Response",
  "icon": "🚨",
  "difficulty": "expert",
  "estimatedTime": "60-90 min",
  "tags": [
    "DFIR",
    "Blue Team",
    "Crisis"
  ],
  "color": "red",
  "targetFields": [
    {
      "key": "context",
      "label": "Incident Summary",
      "type": "text",
      "required": true,
      "placeholder": "Ransomware behavior on finance workstations"
    },
    {
      "key": "scope",
      "label": "Affected Scope (optional)",
      "type": "text",
      "required": false,
      "placeholder": "Finance department (10+ hosts)"
    }
  ],
  "dummyTargets": {
    "context": "Ransomware behavior on finance workstations",
    "scope": "Finance department (10+ hosts)"
  }
}
---

# Incident Response

## Overview
Respond to an active security incident. Contain, eradicate, recover.

## Objectives
1. Contain the threat
2. Preserve evidence
3. Assess scope
4. Identify root cause
5. Plan eradication

## Tools Required
- Network isolation
- Memory forensics
- Log analysis
- Backup restoration
- IOC hunting

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
