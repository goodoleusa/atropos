---
{
  "id": "threat_hunting",
  "name": "Threat Hunting",
  "icon": "🎯",
  "difficulty": "expert",
  "estimatedTime": "60-90 min",
  "tags": [
    "Blue Team",
    "DFIR",
    "Detection"
  ],
  "color": "orange",
  "targetFields": [
    {
      "key": "org",
      "label": "Organization / Environment",
      "type": "org",
      "required": true,
      "placeholder": "SysAdmin Corp"
    },
    {
      "key": "context",
      "label": "Incident Context (optional)",
      "type": "text",
      "required": false,
      "placeholder": "Unusual outbound traffic at 3 AM"
    }
  ],
  "dummyTargets": {
    "org": "SysAdmin Corp",
    "context": "Unusual outbound traffic at 3 AM"
  }
}
---

# Threat Hunting

## Overview
Proactively search for indicators of compromise. Analyze logs, hunt for persistence.

## Objectives
1. Formulate hunting hypotheses
2. Analyze log sources
3. Identify IOCs
4. Trace lateral movement
5. Find persistence mechanisms

## Tools Required
- RITA
- Sigma rules
- YARA
- Splunk/ELK queries
- Velociraptor

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
