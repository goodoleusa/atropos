---
id: "active_recon"
name: "Active Reconnaissance"
type: "campaign"
difficulty: "intermediate"
tags:
  - "Recon"
  - "Scanning"
  - "Enumeration"
icon: "🔍"
color: "red"
estimatedTime: "30-45 min"
parent:
  - "[[INDEX|INDEX]]"
child:
  - "[[Discover live hosts]]"
sibling: []
prev: []
next:
  - "[[Discover live hosts]]"
left_side_friend: []
right_side_friend: []
objectives:
  - "Discover live hosts"
  - "Enumerate open ports"
  - "Identify services and versions"
  - "Find potential vulnerabilities"
  - "Document attack surface"
tools:
  - "nmap"
  - "masscan"
  - "netcat"
  - "nikto"
  - "gobuster"
skills: []
clues: []
---

# Active Reconnaissance

## Overview
Direct engagement with target systems. Port scanning, service enumeration, vulnerability probing.

## Investigation Mesh
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Discover live hosts

### Knowledge Graph
- [[Discover live hosts]]
- [[Enumerate open ports]]
- [[Identify services and versions]]
- [[Find potential vulnerabilities]]
- [[Document attack surface]]
- [[Tool: nmap]]
- [[Tool: masscan]]
- [[Tool: netcat]]
- [[Tool: nikto]]
- [[Tool: gobuster]]


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
