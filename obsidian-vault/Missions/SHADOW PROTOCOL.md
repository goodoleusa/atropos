---
id: shadow-protocol
codename: SHADOW PROTOCOL
classification: CONFIDENTIAL
phase: recon
difficulty: recruit
handler: ghost
---

# Mission: SHADOW PROTOCOL

## Briefing
INCOMING TRANSMISSION FROM HOME BASE...

╔══════════════════════════════════════════════════════════════════╗
║  PRIORITY: URGENT        CLASSIFICATION: CONFIDENTIAL           ║
║  FROM: GHOST (Senior Handler)                                   ║
║  TO: Agent [CLASSIFIED]                                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Welcome to the Agency, recruit. Your first assignment.         ║
║                                                                  ║
║  TARGET: SysAdmin Corp - A shell corporation we've been         ║
║  tracking. Something's not right in their infrastructure.       ║
║                                                                  ║
║  YOUR MISSION: Conduct passive reconnaissance without           ║
║  alerting their security team. Map their attack surface.        ║
║                                                                  ║
║  RULES OF ENGAGEMENT:                                           ║
║  - NO active scanning yet                                       ║
║  - NO direct connections to target systems                      ║
║  - Gather intel from public sources only                        ║
║                                                                  ║
║  The Agency is watching. Make us proud.                         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

GHOST out.

## Objectives
### Enumerate DNS records of sysadmin.corp
- **Hint**: Try: dig sysadmin.corp
- **Points**: 100

### Investigate domain registration
- **Hint**: Try: whois sysadmin.corp
- **Points**: 100

### Run full reconnaissance
- **Hint**: Try: recon sysadmin.corp
- **Points**: 200

### Discover hidden directories
- **Hint**: Try: gobuster sysadmin.corp
- **Points**: 150

## Intel
- SysAdmin Corp registered in 1984 - unusually old for a tech company
- Multiple subdomains detected: mail, vault, void
- Registrant information partially redacted - suspicious
- SSL certificate reveals internal hostnames

## Success Criteria
- Complete 3 of 4 objectives
- Collect at least 2 clues
