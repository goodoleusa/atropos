---
id: phantom-thread
codename: PHANTOM THREAD
classification: TOP SECRET
phase: persist
difficulty: specialist
handler: oracle
---

# Mission: PHANTOM THREAD

## Briefing
ENCRYPTED CHANNEL ESTABLISHED...

╔══════════════════════════════════════════════════════════════════╗
║  PRIORITY: CRITICAL      CLASSIFICATION: TOP SECRET             ║
║  FROM: ORACLE (Intelligence Analyst)                            ║
║  TO: Agent [CLASSIFIED]                                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  I've analyzed the access logs. You're inside, but you're       ║
║  fragile. One reboot and you're locked out. We need to fix that.║
║                                                                  ║
║  SITUATION: You have guest-level access. Not enough.            ║
║  We need persistence and elevated privileges.                   ║
║                                                                  ║
║  YOUR MISSION: Establish persistence mechanisms and escalate    ║
║  to admin-level access. The techniques you'll learn here are    ║
║  called "Living Off the Land" - using built-in tools to avoid   ║
║  detection.                                                     ║
║                                                                  ║
║  KEY CONCEPT: LOTL (Living Off the Land)                        ║
║  Attackers use legitimate system tools to blend in with         ║
║  normal activity. If you use their own tools against them,      ║
║  it's harder to detect.                                         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

Trust the data. ORACLE.

## Objectives
### Read the .secrets file
- **Hint**: Try: cat .secrets
- **Points**: 100

### Examine route configuration
- **Hint**: Try: cat .routes.conf
- **Points**: 150

### Check active network connections
- **Hint**: Try: netstat
- **Points**: 200

### Map the network path to C2
- **Hint**: Try: traceroute molten_core
- **Points**: 150

### Enumerate all users
- **Hint**: Try: enum ssh
- **Points**: 200

## Intel
- LOTL binaries: curl, wget, netcat, powershell, certutil
- Scheduled tasks and cron jobs are common persistence mechanisms
- Look for writable directories in system paths
- Service accounts often have weak credentials

## Success Criteria
- Read sensitive files
- Map network connections
- Identify persistence opportunities
