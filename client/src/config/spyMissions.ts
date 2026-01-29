/**
 * SPY MISSIONS - Attack Lifecycle Training Through Immersive Gameplay
 * ====================================================================
 * 
 * Teaches cybersecurity concepts by putting users in the hacker's mindset:
 * - RECON: Intelligence gathering, OSINT, enumeration
 * - ACCESS: Exploitation, credential attacks, initial foothold
 * - PERSIST: Living off the land, privilege escalation, lateral movement
 * - C2: Command & Control beaconing, exfiltration, maintaining access
 */

export type MissionPhase = 'recon' | 'access' | 'persist' | 'c2' | 'exfil';
export type LearningStyle = 'visual' | 'reading' | 'kinesthetic' | 'auditory';
export type DifficultyLevel = 'recruit' | 'operative' | 'specialist' | 'shadow';

export interface MissionBriefing {
  id: string;
  codename: string;
  classification: 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET' | 'EYES ONLY';
  phase: MissionPhase;
  difficulty: DifficultyLevel;
  handler: string;
  briefing: string;
  objectives: MissionObjective[];
  intel: string[];
  terminalCommands: string[];
  successCriteria: string[];
  learningConcepts: string[];
  adaptations: Record<LearningStyle, StyleAdaptation>;
  rewards: MissionReward;
  nextMission?: string;
}

export interface MissionObjective {
  id: string;
  description: string;
  hint: string;
  command?: string;
  validation: string;
  points: number;
}

export interface StyleAdaptation {
  briefingStyle: string;
  hints: string[];
  preferredCommands: string[];
  feedbackFormat: string;
}

export interface MissionReward {
  clueId: string;
  clueName: string;
  xp: number;
  unlock?: string;
}

export interface BeaconConfig {
  id: string;
  callsign: string;
  frequency: number;
  protocol: 'http' | 'dns' | 'icmp' | 'custom';
  encryption: string;
  jitter: number;
  commands: BeaconCommand[];
}

export interface BeaconCommand {
  id: string;
  name: string;
  syntax: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const LEARNING_STYLE_DESCRIPTIONS: Record<LearningStyle, { name: string; icon: string; description: string }> = {
  visual: {
    name: 'Visual Learner',
    icon: '👁️',
    description: 'Prefers diagrams, flowcharts, and visual representations. Mission briefings include ASCII art and network diagrams.'
  },
  reading: {
    name: 'Reading/Writing',
    icon: '📚',
    description: 'Prefers detailed documentation and written explanations. Receives comprehensive technical write-ups.'
  },
  kinesthetic: {
    name: 'Hands-On',
    icon: '🔧',
    description: 'Learns by doing. Minimal explanation, maximum practice. Jump straight into commands.'
  },
  auditory: {
    name: 'Auditory/Verbal',
    icon: '🎧',
    description: 'Prefers conversational explanations. Briefings feel like talking to your handler.'
  }
};

export const MISSION_PHASES: Record<MissionPhase, { name: string; icon: string; color: string; description: string }> = {
  recon: {
    name: 'Reconnaissance',
    icon: '🔍',
    color: 'text-blue-400',
    description: 'Gather intelligence without alerting the target. Map the attack surface.'
  },
  access: {
    name: 'Initial Access',
    icon: '🚪',
    color: 'text-amber-400',
    description: 'Exploit vulnerabilities to gain foothold. Break through defenses.'
  },
  persist: {
    name: 'Persistence & Escalation',
    icon: '🔒',
    color: 'text-purple-400',
    description: 'Establish persistence, escalate privileges, move laterally.'
  },
  c2: {
    name: 'Command & Control',
    icon: '📡',
    color: 'text-red-400',
    description: 'Establish covert communication channel with home base.'
  },
  exfil: {
    name: 'Exfiltration',
    icon: '📤',
    color: 'text-teal-400',
    description: 'Extract valuable data while avoiding detection.'
  }
};

export const HANDLER_PERSONAS = {
  ghost: {
    name: 'GHOST',
    title: 'Senior Handler',
    style: 'cryptic',
    avatar: '👻',
    greeting: 'Agent, the shadows speak of your arrival.',
    signoff: 'Disappear. GHOST out.'
  },
  cipher: {
    name: 'CIPHER',
    title: 'Technical Specialist',
    style: 'technical',
    avatar: '🔐',
    greeting: 'Operative, I have your technical briefing ready.',
    signoff: 'Stay encrypted. CIPHER.'
  },
  oracle: {
    name: 'ORACLE',
    title: 'Intelligence Analyst',
    style: 'analytical',
    avatar: '🔮',
    greeting: 'I\'ve seen the patterns. Listen carefully.',
    signoff: 'Trust the data. ORACLE.'
  },
  phoenix: {
    name: 'PHOENIX',
    title: 'Field Commander',
    style: 'direct',
    avatar: '🔥',
    greeting: 'No time for pleasantries. Here\'s the op.',
    signoff: 'Get it done. PHOENIX out.'
  }
};

export const C2_BEACON_CONFIG: BeaconConfig = {
  id: 'beacon-alpha',
  callsign: 'SHADOW-7',
  frequency: 300,
  protocol: 'http',
  encryption: 'AES-256-GCM',
  jitter: 15,
  commands: [
    { id: 'checkin', name: 'Check In', syntax: 'beacon checkin', description: 'Report status to C2 server', riskLevel: 'low' },
    { id: 'tasking', name: 'Get Tasking', syntax: 'beacon tasking', description: 'Receive next mission objectives', riskLevel: 'low' },
    { id: 'exfil', name: 'Exfiltrate', syntax: 'beacon exfil <file>', description: 'Send data to C2 server', riskLevel: 'high' },
    { id: 'shell', name: 'Shell', syntax: 'beacon shell <cmd>', description: 'Execute command on target', riskLevel: 'critical' },
    { id: 'persist', name: 'Persist', syntax: 'beacon persist', description: 'Install persistence mechanism', riskLevel: 'high' },
    { id: 'sleep', name: 'Sleep', syntax: 'beacon sleep <seconds>', description: 'Adjust beacon interval', riskLevel: 'low' },
    { id: 'kill', name: 'Kill', syntax: 'beacon kill', description: 'Self-destruct and cleanup', riskLevel: 'medium' }
  ]
};

export const SPY_MISSIONS: MissionBriefing[] = [
  // === MISSION 1: RECON - The Shadow Protocol ===
  {
    id: 'shadow-protocol',
    codename: 'SHADOW PROTOCOL',
    classification: 'CONFIDENTIAL',
    phase: 'recon',
    difficulty: 'recruit',
    handler: 'ghost',
    briefing: `INCOMING TRANSMISSION FROM HOME BASE...

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

GHOST out.`,
    objectives: [
      { id: 'dns-recon', description: 'Enumerate DNS records of sysadmin.corp', hint: 'Try: dig sysadmin.corp', command: 'dig', validation: 'sysadmin.corp', points: 100 },
      { id: 'whois-lookup', description: 'Investigate domain registration', hint: 'Try: whois sysadmin.corp', command: 'whois', validation: 'sysadmin.corp', points: 100 },
      { id: 'recon-full', description: 'Run full reconnaissance', hint: 'Try: recon sysadmin.corp', command: 'recon', validation: 'sysadmin.corp', points: 200 },
      { id: 'dir-enum', description: 'Discover hidden directories', hint: 'Try: gobuster sysadmin.corp', command: 'gobuster', validation: 'sysadmin.corp', points: 150 }
    ],
    intel: [
      'SysAdmin Corp registered in 1984 - unusually old for a tech company',
      'Multiple subdomains detected: mail, vault, void',
      'Registrant information partially redacted - suspicious',
      'SSL certificate reveals internal hostnames'
    ],
    terminalCommands: ['dig', 'whois', 'recon', 'gobuster', 'curl', 'shodan'],
    successCriteria: ['Complete 3 of 4 objectives', 'Collect at least 2 clues'],
    learningConcepts: [
      'Passive reconnaissance techniques',
      'DNS enumeration and analysis',
      'OSINT methodology',
      'Attack surface mapping'
    ],
    adaptations: {
      visual: {
        briefingStyle: 'network-diagram',
        hints: ['Check the network diagram above', 'Watch the data flow visualization'],
        preferredCommands: ['recon', 'nmap'],
        feedbackFormat: 'Show ASCII network map of discovered assets'
      },
      reading: {
        briefingStyle: 'detailed-report',
        hints: ['Refer to the technical appendix', 'See documentation section 3.2'],
        preferredCommands: ['dig', 'whois', 'curl'],
        feedbackFormat: 'Detailed technical write-up with command outputs'
      },
      kinesthetic: {
        briefingStyle: 'quick-start',
        hints: ['Just run the command', 'Try it and see what happens'],
        preferredCommands: ['recon', 'gobuster', 'nmap'],
        feedbackFormat: 'Immediate command execution with minimal explanation'
      },
      auditory: {
        briefingStyle: 'conversation',
        hints: ['Let me explain...', 'Think of it like...'],
        preferredCommands: ['help', 'modules', 'recon'],
        feedbackFormat: 'Conversational explanation from your handler'
      }
    },
    rewards: {
      clueId: 'mission-shadow-complete',
      clueName: 'Shadow Protocol Dossier',
      xp: 500,
      unlock: 'access-missions'
    },
    nextMission: 'iron-key'
  },

  // === MISSION 2: ACCESS - The Iron Key ===
  {
    id: 'iron-key',
    codename: 'IRON KEY',
    classification: 'SECRET',
    phase: 'access',
    difficulty: 'operative',
    handler: 'cipher',
    briefing: `SECURE TRANSMISSION INITIATED...

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

Stay encrypted. CIPHER.`,
    objectives: [
      { id: 'port-scan', description: 'Scan molten_core for open ports', hint: 'Try: nmap molten_core', command: 'nmap', validation: 'molten_core', points: 150 },
      { id: 'crack-hash', description: 'Crack the admin hash (MD5)', hint: 'Try: crack then enter the hash', command: 'crack', validation: '21232f297a57a5a743894a0e4a801fc3', points: 200 },
      { id: 'exploit-vuln', description: 'Load and analyze the exploit', hint: 'Try: exploit CVE-VOID-001', command: 'exploit', validation: 'CVE-VOID-001', points: 250 },
      { id: 'sql-inject', description: 'Test SQL injection vulnerability', hint: "Try: inject ' OR 1=1--", command: 'inject', validation: '1=1', points: 200 }
    ],
    intel: [
      'The admin password is likely a common word - try dictionary attack',
      'MongoDB NoAuth is a critical vulnerability - full database access',
      'CVE-VOID-001 allows authentication bypass',
      'SQL injection could dump the secrets table'
    ],
    terminalCommands: ['nmap', 'crack', 'exploit', 'inject', 'ssh', 'enum'],
    successCriteria: ['Crack the admin hash', 'Successfully exploit one vulnerability'],
    learningConcepts: [
      'Common vulnerability exploitation',
      'Password cracking techniques',
      'SQL injection basics',
      'Service enumeration'
    ],
    adaptations: {
      visual: {
        briefingStyle: 'attack-flowchart',
        hints: ['Follow the attack path diagram', 'See the vulnerability chain'],
        preferredCommands: ['nmap', 'exploit'],
        feedbackFormat: 'Show attack success with visual confirmation'
      },
      reading: {
        briefingStyle: 'technical-analysis',
        hints: ['CVE details explain the vulnerability', 'Read the exploit documentation'],
        preferredCommands: ['hashid', 'exploit', 'inject'],
        feedbackFormat: 'Technical breakdown of what the exploit does'
      },
      kinesthetic: {
        briefingStyle: 'try-everything',
        hints: ['Run the exploit', 'See what breaks'],
        preferredCommands: ['crack', 'inject', 'exploit'],
        feedbackFormat: 'Immediate feedback - success or failure'
      },
      auditory: {
        briefingStyle: 'hacker-mentality',
        hints: ['Think like the attacker', 'What would they try first?'],
        preferredCommands: ['enum', 'crack', 'exploit'],
        feedbackFormat: 'Handler explains what just happened'
      }
    },
    rewards: {
      clueId: 'mission-iron-key-complete',
      clueName: 'Initial Access Achieved',
      xp: 750,
      unlock: 'persist-missions'
    },
    nextMission: 'phantom-thread'
  },

  // === MISSION 3: PERSISTENCE - Phantom Thread ===
  {
    id: 'phantom-thread',
    codename: 'PHANTOM THREAD',
    classification: 'TOP SECRET',
    phase: 'persist',
    difficulty: 'specialist',
    handler: 'oracle',
    briefing: `ENCRYPTED CHANNEL ESTABLISHED...

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

Trust the data. ORACLE.`,
    objectives: [
      { id: 'cat-secrets', description: 'Read the .secrets file', hint: 'Try: cat .secrets', command: 'cat', validation: '.secrets', points: 100 },
      { id: 'find-routes', description: 'Examine route configuration', hint: 'Try: cat .routes.conf', command: 'cat', validation: '.routes.conf', points: 150 },
      { id: 'network-conn', description: 'Check active network connections', hint: 'Try: netstat', command: 'netstat', validation: '', points: 200 },
      { id: 'traceroute', description: 'Map the network path to C2', hint: 'Try: traceroute molten_core', command: 'traceroute', validation: 'molten_core', points: 150 },
      { id: 'enum-users', description: 'Enumerate all users', hint: 'Try: enum ssh', command: 'enum', validation: 'ssh', points: 200 }
    ],
    intel: [
      'LOTL binaries: curl, wget, netcat, powershell, certutil',
      'Scheduled tasks and cron jobs are common persistence mechanisms',
      'Look for writable directories in system paths',
      'Service accounts often have weak credentials'
    ],
    terminalCommands: ['cat', 'netstat', 'traceroute', 'enum', 'ls -la', 'whoami'],
    successCriteria: ['Read sensitive files', 'Map network connections', 'Identify persistence opportunities'],
    learningConcepts: [
      'Living Off the Land techniques',
      'Privilege escalation paths',
      'Persistence mechanisms',
      'Lateral movement basics'
    ],
    adaptations: {
      visual: {
        briefingStyle: 'system-diagram',
        hints: ['See the privilege escalation path', 'Network diagram shows lateral options'],
        preferredCommands: ['netstat', 'traceroute'],
        feedbackFormat: 'Show privilege levels and paths visually'
      },
      reading: {
        briefingStyle: 'methodology-guide',
        hints: ['Follow the LOTL playbook', 'Check the enumeration checklist'],
        preferredCommands: ['cat', 'enum', 'ls'],
        feedbackFormat: 'Step-by-step documentation of findings'
      },
      kinesthetic: {
        briefingStyle: 'explore-mode',
        hints: ['Check every file', 'Try every command'],
        preferredCommands: ['ls -la', 'cat', 'enum'],
        feedbackFormat: 'Rapid fire command results'
      },
      auditory: {
        briefingStyle: 'war-story',
        hints: ['Real attackers do this by...', 'Here\'s how APTs operate...'],
        preferredCommands: ['netstat', 'enum', 'cat'],
        feedbackFormat: 'Oracle narrates what\'s happening'
      }
    },
    rewards: {
      clueId: 'mission-phantom-complete',
      clueName: 'Persistence Established',
      xp: 1000,
      unlock: 'c2-missions'
    },
    nextMission: 'dark-beacon'
  },

  // === MISSION 4: C2 - Dark Beacon ===
  {
    id: 'dark-beacon',
    codename: 'DARK BEACON',
    classification: 'EYES ONLY',
    phase: 'c2',
    difficulty: 'shadow',
    handler: 'phoenix',
    briefing: `PRIORITY OVERRIDE - DIRECT LINE TO COMMAND...

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

Get it done. PHOENIX out.`,
    objectives: [
      { id: 'beacon-init', description: 'Initialize the beacon', hint: 'Try: beacon checkin', command: 'beacon', validation: 'checkin', points: 200 },
      { id: 'beacon-task', description: 'Receive tasking from C2', hint: 'Try: beacon tasking', command: 'beacon', validation: 'tasking', points: 250 },
      { id: 'beacon-sleep', description: 'Adjust beacon timing for stealth', hint: 'Try: beacon sleep 600', command: 'beacon', validation: 'sleep', points: 150 },
      { id: 'beacon-exfil', description: 'Exfiltrate test data', hint: 'Try: beacon exfil .secrets', command: 'beacon', validation: 'exfil', points: 300 }
    ],
    intel: [
      'C2 beaconing mimics normal HTTPS traffic to evade detection',
      'Jitter prevents pattern-based detection by security tools',
      'DNS over HTTPS (DoH) is increasingly used for C2',
      'Sleep commands reduce beacon frequency when heat is high'
    ],
    terminalCommands: ['beacon', 'ping', 'curl', 'netstat'],
    successCriteria: ['Successfully beacon to C2', 'Receive and execute tasking', 'Exfiltrate data'],
    learningConcepts: [
      'C2 communication protocols',
      'Beaconing and jitter concepts',
      'Traffic blending techniques',
      'Covert channel establishment'
    ],
    adaptations: {
      visual: {
        briefingStyle: 'c2-architecture',
        hints: ['See the beacon → C2 → tasking flow', 'Watch the traffic pattern'],
        preferredCommands: ['beacon', 'netstat'],
        feedbackFormat: 'Show C2 communication diagram in real-time'
      },
      reading: {
        briefingStyle: 'protocol-spec',
        hints: ['Refer to the beacon protocol documentation', 'Check timing specifications'],
        preferredCommands: ['beacon help', 'beacon tasking'],
        feedbackFormat: 'Detailed protocol exchange logs'
      },
      kinesthetic: {
        briefingStyle: 'operator-mode',
        hints: ['Send the beacon', 'Execute the tasking'],
        preferredCommands: ['beacon checkin', 'beacon exfil'],
        feedbackFormat: 'Immediate operation status'
      },
      auditory: {
        briefingStyle: 'handler-guidance',
        hints: ['Command is receiving your signal', 'Here\'s your next order...'],
        preferredCommands: ['beacon tasking', 'beacon checkin'],
        feedbackFormat: 'Phoenix responds with voice-like text'
      }
    },
    rewards: {
      clueId: 'mission-dark-beacon-complete',
      clueName: 'C2 Channel Established',
      xp: 1500,
      unlock: 'exfil-missions'
    },
    nextMission: 'ghost-protocol'
  },

  // === MISSION 5: EXFIL - Ghost Protocol ===
  {
    id: 'ghost-protocol',
    codename: 'GHOST PROTOCOL',
    classification: 'EYES ONLY',
    phase: 'exfil',
    difficulty: 'shadow',
    handler: 'ghost',
    briefing: `FINAL TRANSMISSION...

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

Disappear. GHOST out.`,
    objectives: [
      { id: 'dump-secrets', description: 'Extract the secrets table', hint: "Try: inject ' UNION SELECT * FROM secrets--", command: 'inject', validation: 'secrets', points: 300 },
      { id: 'exfil-data', description: 'Exfiltrate via C2 channel', hint: 'Try: beacon exfil secrets.db', command: 'beacon', validation: 'exfil', points: 400 },
      { id: 'cleanup', description: 'Clean up traces', hint: 'Try: beacon kill', command: 'beacon', validation: 'kill', points: 200 }
    ],
    intel: [
      'DLP systems trigger on large data transfers - keep chunks small',
      'Timing matters - exfil during business hours blends better',
      'Log deletion is often logged - consider log manipulation instead',
      'Self-destruct should include memory wiping'
    ],
    terminalCommands: ['inject', 'beacon', 'cat', 'encode'],
    successCriteria: ['Extract target data', 'Successfully exfiltrate', 'Clean up traces'],
    learningConcepts: [
      'Data exfiltration techniques',
      'Avoiding DLP detection',
      'Anti-forensics basics',
      'Operational security'
    ],
    adaptations: {
      visual: {
        briefingStyle: 'mission-complete-animation',
        hints: ['Watch the extraction progress', 'See cleanup status'],
        preferredCommands: ['beacon exfil', 'beacon kill'],
        feedbackFormat: 'Visual mission complete screen'
      },
      reading: {
        briefingStyle: 'after-action-report',
        hints: ['Document your methodology', 'Review extraction logs'],
        preferredCommands: ['beacon exfil', 'cat'],
        feedbackFormat: 'Detailed after-action report'
      },
      kinesthetic: {
        briefingStyle: 'execute-now',
        hints: ['Run the extraction', 'Trigger cleanup'],
        preferredCommands: ['inject', 'beacon exfil', 'beacon kill'],
        feedbackFormat: 'Mission success confirmation'
      },
      auditory: {
        briefingStyle: 'final-debrief',
        hints: ['Ghost congratulates you', 'Final mission summary'],
        preferredCommands: ['beacon exfil', 'beacon kill'],
        feedbackFormat: 'Handler delivers final debrief'
      }
    },
    rewards: {
      clueId: 'mission-ghost-protocol-complete',
      clueName: 'Ghost Protocol Complete',
      xp: 2000,
      unlock: 'elite-agent'
    }
  }
];

export const getMissionById = (id: string): MissionBriefing | undefined => {
  return SPY_MISSIONS.find(m => m.id === id);
};

export const getMissionsByPhase = (phase: MissionPhase): MissionBriefing[] => {
  return SPY_MISSIONS.filter(m => m.phase === phase);
};

export const getHandlerInfo = (handlerId: string) => {
  return HANDLER_PERSONAS[handlerId as keyof typeof HANDLER_PERSONAS] || HANDLER_PERSONAS.ghost;
};

export const generateMissionBriefingForStyle = (mission: MissionBriefing, style: LearningStyle): string => {
  const handler = getHandlerInfo(mission.handler);
  const adaptation = mission.adaptations[style];
  
  if (style === 'kinesthetic') {
    return `${handler.avatar} ${handler.name}: Quick brief - ${mission.codename}
    
Target acquired. Here's what you need to do:
${mission.objectives.map(o => `→ ${o.description}`).join('\n')}

Commands to try: ${adaptation.preferredCommands.join(', ')}

Go. ${handler.signoff}`;
  }
  
  if (style === 'auditory') {
    return `${handler.avatar} ${handler.name} speaking...

"${handler.greeting} Let me walk you through this one.

${mission.briefing.split('\n').filter(l => !l.includes('╔') && !l.includes('╚') && !l.includes('║')).join('\n').trim()}

Here's what I need you to do - and I'll explain each step:
${mission.objectives.map(o => `• ${o.description} - ${o.hint.replace('Try: ', 'Just ')}`).join('\n')}

${handler.signoff}"`;
  }
  
  return mission.briefing;
};

export const BEACON_COMMANDS_HELP = `
╔══════════════════════════════════════════════════════════════════╗
║                    BEACON C2 COMMAND REFERENCE                   ║
╠══════════════════════════════════════════════════════════════════╣
║  COMMAND           DESCRIPTION                      RISK LEVEL   ║
╠══════════════════════════════════════════════════════════════════╣
║  beacon checkin    Report status to C2 server       [LOW]        ║
║  beacon tasking    Receive next mission objectives  [LOW]        ║
║  beacon sleep N    Set beacon interval to N seconds [LOW]        ║
║  beacon exfil FILE Send file to C2 server          [HIGH]       ║
║  beacon shell CMD  Execute command on target        [CRITICAL]   ║
║  beacon persist    Install persistence mechanism    [HIGH]       ║
║  beacon kill       Self-destruct and cleanup        [MEDIUM]     ║
╠══════════════════════════════════════════════════════════════════╣
║  CURRENT STATUS                                                  ║
║  Callsign: SHADOW-7                                              ║
║  Frequency: 300s (5 min) ± 15% jitter                           ║
║  Protocol: HTTPS/443                                             ║
║  Encryption: AES-256-GCM                                         ║
╚══════════════════════════════════════════════════════════════════╝
`;
