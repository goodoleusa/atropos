---
id: iron-key
codename: IRON KEY
classification: SECRET
phase: access
difficulty: operative
handler: cipher
---

# Mission: IRON KEY

## Briefing
SECURE TRANSMISSION INITIATED...

╔══════════════════════════════════════════════════════════════════╗
║  PRIORITY: HIGH          CLASSIFICATION: SECRET                 ║
║  FROM: CIPHER (Technical Specialist)                            ║
║  TO: Agent [CLASSIFIED]                                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Your recon was solid. Now it's time to breach the perimeter.   ║
║                                                                  ║
║  INTEL UPDATE: Our analysis of your recon data revealed:        ║
║  - Port 6666 running unknown service (CVE-2024-MOLTEN)          ║
║  - MongoDB on vault.sysadmin.corp lacks authentication          ║
║  - Admin hash found in exposed config: 21232f297a57a5a743894... ║
║                                                                  ║
║  YOUR MISSION: Exploit these vulnerabilities to gain initial    ║
║  access. We need a foothold inside their network.               ║
║                                                                  ║
║  REMEMBER: Once inside, you become the threat actor.            ║
║  Think like an attacker. Move like a ghost.                     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

Stay encrypted. CIPHER.

## Objectives
### Scan molten_core for open ports
- **Hint**: Try: nmap molten_core
- **Points**: 150

### Crack the admin hash (MD5)
- **Hint**: Try: crack then enter the hash
- **Points**: 200

### Load and analyze the exploit
- **Hint**: Try: exploit CVE-VOID-001
- **Points**: 250

### Test SQL injection vulnerability
- **Hint**: Try: inject ' OR 1=1--
- **Points**: 200

## Intel
- The admin password is likely a common word - try dictionary attack
- MongoDB NoAuth is a critical vulnerability - full database access
- CVE-VOID-001 allows authentication bypass
- SQL injection could dump the secrets table

## Success Criteria
- Crack the admin hash
- Successfully exploit one vulnerability
