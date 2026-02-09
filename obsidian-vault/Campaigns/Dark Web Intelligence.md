---
{
  "id": "dark_web_intel",
  "name": "Dark Web Intelligence",
  "icon": "🕸️",
  "difficulty": "advanced",
  "estimatedTime": "30-45 min",
  "tags": [
    "Dark Web",
    "Threat Intel",
    "Breaches"
  ],
  "color": "gray",
  "targetFields": [
    {
      "key": "org",
      "label": "Organization",
      "type": "org",
      "required": true,
      "placeholder": "MegaCorp"
    },
    {
      "key": "domain",
      "label": "Domain (optional)",
      "type": "domain",
      "required": false,
      "placeholder": "megacorp.com"
    }
  ],
  "dummyTargets": {
    "org": "MegaCorp",
    "domain": "megacorp.com"
  },
  "learningObjectives": [
    {
      "goal": "dark_web_intelligence",
      "weight": 10,
      "description": "Master dark web investigation techniques"
    },
    {
      "goal": "threat_hunting",
      "weight": 7,
      "description": "Proactive threat detection from underground sources"
    },
    {
      "goal": "osint_investigation",
      "weight": 5,
      "description": "Apply OSINT to underground intelligence"
    }
  ],
  "skillsRequired": [
    "Basic OSINT",
    "Understanding of anonymity networks",
    "Operational security awareness"
  ],
  "skillsTaught": [
    "Breach database searching",
    "Paste site monitoring",
    "Dark web marketplace analysis",
    "Credential exposure assessment",
    "Ransomware leak tracking"
  ],
  "learningOutcomes": [
    "Search breach databases for organizational exposure",
    "Monitor paste sites for leaked data",
    "Track mentions in underground forums",
    "Identify ransomware victim listings",
    "Assess credential compromise risk",
    "Maintain operational security during investigations"
  ],
  "industryContext": "Threat intelligence teams, fraud prevention, and security operations centers monitor dark web for early warning of attacks, stolen credentials, and data breaches. Law enforcement uses these techniques for cybercrime investigations.",
  "realWorldExamples": [
    "Colonial Pipeline ransomware DarkSide leak",
    "JBS Foods ransomware exposure",
    "Silk Road investigation methodology",
    "AlphaBay marketplace takedown",
    "Breach notification research (Have I Been Pwned)"
  ],
  "careerPaths": [
    "Threat Intelligence Analyst",
    "SOC Analyst",
    "Fraud Investigator",
    "Law Enforcement Cyber Unit",
    "CISO"
  ],
  "teachingAdaptations": {
    "experiential": "Start with Have I Been Pwned - search your organization. Then try DeHashed for deeper breach data. Learn the tools by using them on real queries.",
    "visual": "Create a timeline of breaches affecting target. Map which credentials were exposed when. Visualize the exposure surface over time.",
    "analytical": "Study data breach lifecycles, underground market economics, ransomware business models. Understand the dark web ecosystem before investigating it.",
    "social": "Read Brian Krebs reporting on dark web markets. Study Bellingcat techniques for investigating criminal forums. Join OSINT communities discussing threat intel.",
    "pragmatic": "Breach search workflow: HIBP → DeHashed → Intelligence X. Check company domain, executive emails, common passwords. Document exposure in spreadsheet. Done."
  }
}
---

# Dark Web Intelligence

## Overview
Monitor dark web for leaked credentials, data breaches, and threat actor chatter.

## Objectives
1. Check breach databases
2. Search paste sites
3. Monitor threat actor chatter
4. Track ransomware leaks
5. Document exposure

## Tools Required
- Have I Been Pwned
- DeHashed
- IntelX
- Recorded Future
- DarkOwl

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
