---
{
  "id": "social_engineering",
  "name": "Social Engineering Recon",
  "icon": "🎭",
  "difficulty": "intermediate",
  "estimatedTime": "45-60 min",
  "tags": [
    "OSINT",
    "Social Engineering",
    "Personnel"
  ],
  "color": "pink",
  "targetFields": [
    {
      "key": "org",
      "label": "Organization",
      "type": "org",
      "required": true,
      "placeholder": "TechCorp Industries"
    },
    {
      "key": "domain",
      "label": "Primary Domain (optional)",
      "type": "domain",
      "required": false,
      "placeholder": "techcorp.com"
    }
  ],
  "dummyTargets": {
    "org": "TechCorp Industries",
    "domain": "techcorp.com"
  }
}
---

# Social Engineering Recon

## Overview
Build target profiles for social engineering. OSINT on personnel and organizational structure.

## Objectives
1. Map org structure
2. Profile key personnel
3. Find email patterns
4. Gather personal details
5. Identify pretexting angles

## Tools Required
- LinkedIn
- Hunter.io
- theHarvester
- Social media OSINT
- Google dorking

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
