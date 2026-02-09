---
{
  "id": "active_recon",
  "name": "Active Reconnaissance",
  "icon": "🔍",
  "difficulty": "intermediate",
  "estimatedTime": "30-45 min",
  "tags": [
    "Recon",
    "Scanning",
    "Enumeration"
  ],
  "color": "red",
  "targetFields": [
    {
      "key": "cidr",
      "label": "Network Range",
      "type": "cidr",
      "required": true,
      "placeholder": "10.0.0.0/24"
    }
  ],
  "dummyTargets": {
    "cidr": "10.0.0.0/24"
  }
}
---

# Active Reconnaissance

## Overview
Direct engagement with target systems. Port scanning, service enumeration, vulnerability probing.

## Objectives
1. Discover live hosts
2. Enumerate open ports
3. Identify services and versions
4. Find potential vulnerabilities
5. Document attack surface

## Tools Required
- nmap
- masscan
- netcat
- nikto
- gobuster

## Starter Prompt
```
Time for active reconnaissance on target: 10.0.0.0/24 (simulated lab network)

Help me conduct:
1. Host discovery and OS fingerprinting
2. Port scanning (TCP/UDP top ports)
3. Service version detection
4. Banner grabbing
5. Default credential checks
6. Vulnerability scanning

Start with host discovery - what nmap commands would you recommend and why?
```
