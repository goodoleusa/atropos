---
id: passive_recon
name: Passive Reconnaissance
difficulty: beginner
tags:
  - Recon
  - OSINT
  - DNS
icon: 👁️
---

# Passive Reconnaissance

## Overview
Gather intelligence without touching the target. DNS, certificates, historical data only.

## Investigation Mesh (Twine-style)
Use these [[Wikilinks]] to navigate the nodes of this investigation.

### Initial Objective
Enumerate DNS records

### Knowledge Graph
- [[Enumerate DNS records]]
- [[Analyze certificate transparency]]
- [[Find historical snapshots]]
- [[Identify email patterns]]
- [[Map technology stack]]
- [[Tool: SecurityTrails]]
- [[Tool: crt.sh]]
- [[Tool: Wayback Machine]]
- [[Tool: Shodan]]
- [[Tool: BuiltWith]]

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

## Clues & Discovery
- [[Clue: passive_recon_source]]
- [[Evidence: passive_recon_intel]]
