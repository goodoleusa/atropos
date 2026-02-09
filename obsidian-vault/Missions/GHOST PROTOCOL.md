---
id: ghost-protocol
codename: GHOST PROTOCOL
classification: EYES ONLY
phase: exfil
difficulty: shadow
handler: ghost
---

# Mission: GHOST PROTOCOL

## Briefing
FINAL TRANSMISSION...

╔══════════════════════════════════════════════════════════════════╗
║  PRIORITY: MAXIMUM       CLASSIFICATION: EYES ONLY              ║
║  FROM: GHOST (Senior Handler)                                   ║
║  TO: Agent [CLASSIFIED]                                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Agent, you've done what many couldn't. You're inside.          ║
║  You have persistence. You have C2. Now extract the payload.    ║
║                                                                  ║
║  FINAL OBJECTIVE: The void_access table contains the master     ║
║  encryption keys for the entire SysAdmin Corp infrastructure.   ║
║  Extract them and disappear.                                    ║
║                                                                  ║
║  EXFILTRATION TECHNIQUES:                                       ║
║  - Chunk data into small pieces to avoid DLP detection          ║
║  - Encrypt before sending - never send plaintext                ║
║  - Use steganography if available - hide data in images         ║
║  - Clean up - remove all traces of your presence                ║
║                                                                  ║
║  When complete, type 'beacon kill' to trigger cleanup and       ║
║  self-destruct. Leave no trace.                                 ║
║                                                                  ║
║  It's been an honor working with you, Agent.                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

Disappear. GHOST out.

## Objectives
### Extract the secrets table
- **Hint**: Try: inject ' UNION SELECT * FROM secrets--
- **Points**: 300

### Exfiltrate via C2 channel
- **Hint**: Try: beacon exfil secrets.db
- **Points**: 400

### Clean up traces
- **Hint**: Try: beacon kill
- **Points**: 200

## Intel
- DLP systems trigger on large data transfers - keep chunks small
- Timing matters - exfil during business hours blends better
- Log deletion is often logged - consider log manipulation instead
- Self-destruct should include memory wiping

## Success Criteria
- Extract target data
- Successfully exfiltrate
- Clean up traces
