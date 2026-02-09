---
{
  "id": "passive_recon",
  "name": "Passive Reconnaissance",
  "icon": "👁️",
  "difficulty": "beginner",
  "estimatedTime": "20-30 min",
  "tags": [
    "Recon",
    "OSINT",
    "DNS"
  ],
  "color": "purple",
  "targetFields": [
    {
      "key": "domain",
      "label": "Domain",
      "type": "domain",
      "required": true,
      "placeholder": "sysadmincorp.net"
    },
    {
      "key": "org",
      "label": "Organization (optional)",
      "type": "org",
      "required": false,
      "placeholder": "SysAdmin Corp"
    }
  ],
  "dummyTargets": {
    "domain": "sysadmincorp.net",
    "org": "SysAdmin Corp"
  },
  "learningObjectives": [
    {
      "goal": "osint_investigation",
      "weight": 10,
      "description": "Master passive reconnaissance techniques"
    },
    {
      "goal": "penetration_testing",
      "weight": 5,
      "description": "Learn reconnaissance phase of pentesting"
    }
  ],
  "skillsRequired": [
    "Basic web browsing",
    "Understanding of DNS"
  ],
  "skillsTaught": [
    "DNS enumeration",
    "Certificate transparency analysis",
    "Historical data mining",
    "Technology fingerprinting",
    "Subdomain discovery"
  ],
  "learningOutcomes": [
    "Extract DNS records without touching target",
    "Mine certificate transparency logs for subdomains",
    "Use Wayback Machine for intelligence gathering",
    "Identify technology stack passively",
    "Build comprehensive target dossier from public data"
  ],
  "industryContext": "Bug bounty hunters and penetration testers always start with passive recon to map attack surface without alerting targets. Essential first phase of any security assessment.",
  "realWorldExamples": [
    "Bug bounty reconnaissance methodologies",
    "Red team initial access research",
    "Competitive intelligence gathering",
    "Pre-engagement target profiling"
  ],
  "careerPaths": [
    "Bug Bounty Hunter",
    "Penetration Tester",
    "Security Researcher",
    "Red Team Operator"
  ],
  "teachingAdaptations": {
    "experiential": "Start with crt.sh - enter domain, get immediate subdomain results. Then try SecurityTrails. Compare outputs. Learn by doing multiple targets.",
    "visual": "Create a mind map of discovered assets. Draw DNS hierarchy. Map subdomains to IP addresses visually. See relationships emerge.",
    "analytical": "Study how DNS works, certificate issuance process, web archive crawling. Understand the theory behind each passive recon technique before applying.",
    "social": "Read Jason Haddix's Bug Bounty Methodology. Study Nahamsec reconnaissance techniques. Join OSINT Discord communities to see how others recon.",
    "pragmatic": "Single command workflow: crt.sh API → subdomain list → httpx for alive hosts → aquatone for screenshots. Automate the entire passive recon pipeline."
  }
}
---

# Passive Reconnaissance

## Overview
Gather intelligence without touching the target. DNS, certificates, historical data only.

## Objectives
1. Enumerate DNS records
2. Analyze certificate transparency
3. Find historical snapshots
4. Identify email patterns
5. Map technology stack

## Tools Required
- SecurityTrails
- crt.sh
- Wayback Machine
- Shodan
- BuiltWith

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
