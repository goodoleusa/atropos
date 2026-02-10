---
id: "iron-key"
codename: "IRON KEY"
type: "mission"
phase: "access"
difficulty: "operative"
handler: "cipher"
parent:
  - "[[Missions Index|Missions Index]]"
child:
  - "[[Scan molten_core for open ports]]"
  - "[[Crack the admin hash (MD5)]]"
  - "[[Load and analyze the exploit]]"
  - "[[Test SQL injection vulnerability]]"
sibling: []
prev: []
next: []
left_side_friend: []
right_side_friend: []
status: "available"
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

## Mission Nodes
- [[Phase: access]]
- [[Handler: cipher]]

### Tactical Objectives
- [[Scan molten_core for open ports]]
- [[Crack the admin hash (MD5)]]
- [[Load and analyze the exploit]]
- [[Test SQL injection vulnerability]]
