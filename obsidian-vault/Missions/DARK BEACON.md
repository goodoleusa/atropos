---
id: dark-beacon
codename: DARK BEACON
classification: EYES ONLY
phase: c2
difficulty: shadow
handler: phoenix
---

# Mission: DARK BEACON

## Briefing
PRIORITY OVERRIDE - DIRECT LINE TO COMMAND...

╔══════════════════════════════════════════════════════════════════╗
║  PRIORITY: MAXIMUM       CLASSIFICATION: EYES ONLY              ║
║  FROM: PHOENIX (Field Commander)                                ║
║  TO: Agent [CLASSIFIED]                                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  You're deep behind enemy lines. Now it's time to phone home.   ║
║                                                                  ║
║  C2 (COMMAND & CONTROL) is how attackers maintain communication ║
║  with their implants. Without C2, you're blind and deaf.        ║
║                                                                  ║
║  YOUR MISSION: Establish a covert C2 channel back to home base. ║
║  You need to:                                                   ║
║  1. Understand beaconing - periodic check-ins that avoid        ║
║     detection by blending with normal traffic                   ║
║  2. Implement jitter - randomized timing to avoid pattern       ║
║     detection by security tools                                 ║
║  3. Use encryption - all C2 traffic must be encrypted           ║
║  4. Receive tasking - get your next orders from command         ║
║                                                                  ║
║  CALLSIGN: SHADOW-7                                             ║
║  BEACON FREQUENCY: Every 300 seconds (5 minutes)                ║
║  JITTER: 15% (±45 seconds randomization)                        ║
║  PROTOCOL: HTTPS over port 443 (blends with normal web traffic) ║
║  ENCRYPTION: AES-256-GCM                                        ║
║                                                                  ║
║  Type 'beacon help' to see available C2 commands.               ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

Get it done. PHOENIX out.

## Objectives
### Initialize the beacon
- **Hint**: Try: beacon checkin
- **Points**: 200

### Receive tasking from C2
- **Hint**: Try: beacon tasking
- **Points**: 250

### Adjust beacon timing for stealth
- **Hint**: Try: beacon sleep 600
- **Points**: 150

### Exfiltrate test data
- **Hint**: Try: beacon exfil .secrets
- **Points**: 300

## Intel
- C2 beaconing mimics normal HTTPS traffic to evade detection
- Jitter prevents pattern-based detection by security tools
- DNS over HTTPS (DoH) is increasingly used for C2
- Sleep commands reduce beacon frequency when heat is high

## Success Criteria
- Successfully beacon to C2
- Receive and execute tasking
- Exfiltrate data
