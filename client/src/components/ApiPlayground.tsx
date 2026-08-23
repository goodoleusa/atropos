import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Play, Copy, Check, Terminal, Book, Target, Zap, 
  Lock, Unlock, Shield, Key, QrCode, Server, 
  ChevronRight, Award, Lightbulb, AlertTriangle,
  Download, Eye, EyeOff, Hash, Clock
} from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  category: string;
  rateLimit?: string;
  exampleBody?: string;
  exampleResponse?: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
}

interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  objectives: string[];
  hints: string[];
  solution?: string;
  xp: number;
}

interface QrExercise {
  id: string;
  title: string;
  concept: string;
  scenario: string;
  steps: string[];
  realWorldExample: string;
  securityImplication: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/api/session',
    description: 'Create or retrieve a game session',
    category: 'Session',
    rateLimit: '30/min',
    exampleBody: JSON.stringify({ sessionToken: 'abc123...', username: 'operator' }, null, 2),
    exampleResponse: JSON.stringify({ id: 1, sessionToken: '...', collectedClues: [], completedQuests: [] }, null, 2),
    params: [
      { name: 'sessionToken', type: 'string', required: true, description: 'Unique session identifier' },
      { name: 'username', type: 'string', required: false, description: 'Display name (default: Guest)' }
    ]
  },
  {
    method: 'GET',
    path: '/api/session/:token',
    description: 'Fetch session by token',
    category: 'Session',
    exampleResponse: JSON.stringify({ id: 1, sessionToken: '...', username: 'operator', collectedClues: ['clue1'] }, null, 2),
    params: [{ name: 'token', type: 'string', required: true, description: 'Session token from URL' }]
  },
  {
    method: 'PATCH',
    path: '/api/session/:token',
    description: 'Update session data',
    category: 'Session',
    rateLimit: '60/min',
    exampleBody: JSON.stringify({ collectedClues: ['clue1', 'clue2'] }, null, 2),
    params: [{ name: 'token', type: 'string', required: true, description: 'Session token' }]
  },
  {
    method: 'GET',
    path: '/api/clues',
    description: 'List all clues',
    category: 'Content',
    exampleResponse: JSON.stringify([{ id: 1, name: 'Fragment Alpha', type: 'hidden' }], null, 2)
  },
  {
    method: 'POST',
    path: '/api/clues',
    description: 'Create a new clue',
    category: 'Content',
    rateLimit: '30/min',
    exampleBody: JSON.stringify({ name: 'New Clue', description: 'A hidden fragment', type: 'secret' }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/behavior/log',
    description: 'Log behavioral event for profiling',
    category: 'Behavior',
    rateLimit: '60/min',
    exampleBody: JSON.stringify({ sessionToken: '...', eventType: 'command', data: { command: 'nmap' } }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/behavior/profile/:token',
    description: 'Get behavioral profile analysis',
    category: 'Behavior',
    params: [{ name: 'token', type: 'string', required: true, description: 'Session token' }]
  },
  {
    method: 'POST',
    path: '/api/qr/export',
    description: 'Generate QR code for session export',
    category: 'QR Payloads',
    rateLimit: '10/min',
    exampleBody: JSON.stringify({ sessionToken: '...', clues: ['c1'], quests: ['q1'] }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/qr/decode',
    description: 'Decode QR payload from base64',
    category: 'QR Payloads',
    exampleBody: JSON.stringify({ encoded: 'eyJ0eXBlIjoic2VjcmV0Ii4uLn0=' }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/agent/execute',
    description: 'Execute AI agent command',
    category: 'Agent',
    rateLimit: '30/min',
    exampleBody: JSON.stringify({ messages: [{ role: 'user', content: 'Analyze target' }], model: 'gpt-4o' }, null, 2)
  },
  {
    method: 'GET',
    path: '/api/agent/schema',
    description: 'Get agent API schema documentation',
    category: 'Agent'
  },
  // Multi-Agent Orchestration Endpoints
  {
    method: 'POST',
    path: '/api/agents/analyze',
    description: 'Route scan results to multiple specialist agents for parallel analysis',
    category: 'Multi-Agent',
    rateLimit: '10/min',
    exampleBody: JSON.stringify({
      scanType: 'vulnerability',
      data: { findings: [{ id: 'CVE-2024-1234', severity: 'high' }] },
      target: 'example.com'
    }, null, 2),
    exampleResponse: JSON.stringify({
      success: true,
      results: [
        { agentId: 'vuln_analyst', analysis: '...', confidence: 0.95 },
        { agentId: 'threat_intel', analysis: '...', confidence: 0.88 }
      ]
    }, null, 2),
    params: [
      { name: 'scanType', type: 'string', required: true, description: 'Type of scan: vulnerability, osint, network, secrets' },
      { name: 'data', type: 'object', required: true, description: 'Scan results to analyze' },
      { name: 'target', type: 'string', required: false, description: 'Target identifier for context' }
    ]
  },
  {
    method: 'GET',
    path: '/api/agents',
    description: 'List all available specialist agents and their capabilities',
    category: 'Multi-Agent',
    rateLimit: '30/min',
    exampleResponse: JSON.stringify({
      agents: [
        { id: 'vuln_analyst', name: 'VulnAnalyst', category: 'vulnerability', capabilities: ['CVE analysis', 'CVSS scoring'] },
        { id: 'osint_analyst', name: 'OSINTAnalyst', category: 'osint', capabilities: ['data correlation', 'pattern detection'] },
        { id: 'threat_intel', name: 'ThreatIntel', category: 'threat', capabilities: ['threat attribution', 'TTPs mapping'] },
        { id: 'secret_hunter', name: 'SecretHunter', category: 'secrets', capabilities: ['credential detection', 'API key analysis'] },
        { id: 'network_recon', name: 'NetworkRecon', category: 'network', capabilities: ['topology mapping', 'service identification'] },
        { id: 'synthesis', name: 'Synthesis', category: 'synthesis', capabilities: ['findings aggregation', 'report generation'] }
      ]
    }, null, 2)
  },
  {
    method: 'POST',
    path: '/api/agents/route',
    description: 'Route data to specific agents by category',
    category: 'Multi-Agent',
    rateLimit: '20/min',
    exampleBody: JSON.stringify({
      category: 'vulnerability',
      payload: { vulnerabilities: [] },
      parallel: true
    }, null, 2),
    params: [
      { name: 'category', type: 'string', required: true, description: 'Agent category: vulnerability, osint, network, secrets, threat' },
      { name: 'payload', type: 'object', required: true, description: 'Data payload to send to agents' },
      { name: 'parallel', type: 'boolean', required: false, description: 'Run matching agents in parallel (default: true)' }
    ]
  },
  {
    method: 'POST',
    path: '/api/agents/synthesize',
    description: 'Synthesize multiple agent results into a unified report',
    category: 'Multi-Agent',
    rateLimit: '10/min',
    exampleBody: JSON.stringify({
      results: [
        { agentId: 'vuln_analyst', analysis: '...' },
        { agentId: 'threat_intel', analysis: '...' }
      ],
      format: 'markdown'
    }, null, 2),
    params: [
      { name: 'results', type: 'array', required: true, description: 'Array of agent analysis results' },
      { name: 'format', type: 'string', required: false, description: 'Output format: markdown, json, html' }
    ]
  },
  {
    method: 'POST',
    path: '/api/agents/export',
    description: 'Export agent configuration for CrewAI or LangChain',
    category: 'Multi-Agent',
    rateLimit: '10/min',
    exampleBody: JSON.stringify({
      format: 'crewai',
      agents: ['vuln_analyst', 'threat_intel']
    }, null, 2),
    params: [
      { name: 'format', type: 'string', required: true, description: 'Export format: crewai, langchain' },
      { name: 'agents', type: 'array', required: false, description: 'Specific agents to export (default: all)' }
    ]
  },
  {
    method: 'GET',
    path: '/api/admin/campaigns',
    description: 'List all investigation campaigns',
    category: 'Admin'
  },
  {
    method: 'POST',
    path: '/api/admin/escalations',
    description: 'Create security escalation report',
    category: 'Admin',
    rateLimit: '10/min'
  }
];

const API_QUESTS: Quest[] = [
  {
    id: 'q1-first-request',
    title: 'First Contact',
    description: 'Make your first API request to establish a session',
    difficulty: 'beginner',
    category: 'Basics',
    objectives: [
      'Send a POST request to /api/session',
      'Include a sessionToken in the body',
      'Receive a valid session response'
    ],
    hints: [
      'Use Content-Type: application/json',
      'Generate a unique token (UUID format works)',
      'Check the response for your session ID'
    ],
    xp: 50
  },
  {
    id: 'q2-rate-limits',
    title: 'Speed Limits',
    description: 'Understand API rate limiting and why it matters',
    difficulty: 'beginner',
    category: 'Security',
    objectives: [
      'Identify which endpoints have rate limits',
      'Trigger a rate limit response (429)',
      'Understand exponential backoff'
    ],
    hints: [
      'Look for "rateLimit" in endpoint docs',
      'Send rapid requests to test limits',
      'Rate limits protect against DoS attacks'
    ],
    xp: 75
  },
  {
    id: 'q3-auth-flow',
    title: 'Token Mastery',
    description: 'Master session token authentication flow',
    difficulty: 'intermediate',
    category: 'Authentication',
    objectives: [
      'Create a session with a custom token',
      'Use the token to fetch session data',
      'Update session via PATCH with the token'
    ],
    hints: [
      'Session tokens are passed in URLs for GET/PATCH',
      'Store your token for reuse across requests',
      'Tokens validate format before processing'
    ],
    xp: 100
  },
  {
    id: 'q4-qr-payload',
    title: 'QR Code Reconnaissance',
    description: 'Learn how QR payloads encode and transfer data',
    difficulty: 'intermediate',
    category: 'QR Security',
    objectives: [
      'Generate a QR export code',
      'Decode the base64 payload',
      'Understand the payload structure'
    ],
    hints: [
      'QR payloads use base64 encoding',
      'Decoded data is JSON with type, data, timestamp',
      'This is similar to how C2 systems use QR for covert comms'
    ],
    xp: 150
  },
  {
    id: 'q5-behavior-analysis',
    title: 'Behavioral Fingerprinting',
    description: 'Explore how APIs track and analyze user behavior',
    difficulty: 'advanced',
    category: 'Behavior',
    objectives: [
      'Log multiple behavioral events',
      'Retrieve your behavioral profile',
      'Identify what patterns are detected'
    ],
    hints: [
      'Event types: command, navigation, timing',
      'Profiles aggregate patterns over time',
      'Used for adaptive difficulty and threat detection'
    ],
    xp: 200
  },
  {
    id: 'q6-pivot-chain',
    title: 'API Pivot Chain',
    description: 'Chain multiple API calls like a real investigation',
    difficulty: 'advanced',
    category: 'Workflows',
    objectives: [
      'Create session → Get clues → Update session with findings',
      'Use response data as input for next request',
      'Build an automated workflow'
    ],
    hints: [
      'Real investigations chain data sources',
      'Extract IDs from responses for next calls',
      'This mirrors OSINT pivot techniques'
    ],
    xp: 250
  },
  {
    id: 'q7-crypto-auth',
    title: 'Cryptographic Identity',
    description: 'Understand hash-based authentication without accounts',
    difficulty: 'expert',
    category: 'Crypto Auth',
    objectives: [
      'Generate a deterministic session token from inputs',
      'Understand HMAC-based token validation',
      'Implement client-side token generation'
    ],
    hints: [
      'SHA-256 hash of (device_id + timestamp + secret)',
      'Server validates hash matches expected pattern',
      'No database needed for authentication'
    ],
    xp: 300
  }
];

const QR_EXERCISES: QrExercise[] = [
  {
    id: 'qr1-basic',
    title: 'QR Payload Anatomy',
    concept: 'Understanding QR code data encoding',
    scenario: 'You intercept a QR code during a security assessment. Decode and analyze its payload.',
    steps: [
      '1. Scan QR code to extract raw data',
      '2. Identify encoding (usually Base64)',
      '3. Decode to reveal JSON payload',
      '4. Analyze structure: type, data, timestamp',
      '5. Validate payload integrity'
    ],
    realWorldExample: 'QuickResponseC2 uses QR codes to send commands between attacker and victim machines, encoding commands as images to evade network detection.',
    securityImplication: 'QR codes can hide malicious URLs, commands, or exfiltration data in plain sight.'
  },
  {
    id: 'qr2-c2',
    title: 'QR-Based Command & Control',
    concept: 'Covert communication via image-based payloads',
    scenario: 'Design a QR-based C2 system where commands are sent as images.',
    steps: [
      '1. Attacker encodes command → QR image',
      '2. QR uploaded to HTTP server',
      '3. Victim polls server for new QR files',
      '4. Victim decodes QR → executes command',
      '5. Result encoded as QR → uploaded back',
      '6. Attacker retrieves and decodes result'
    ],
    realWorldExample: 'This evades IDS/IPS because all traffic appears as normal image downloads/uploads. Tools like QuickResponseC2 implement this workflow.',
    securityImplication: 'Network monitoring must inspect image content, not just metadata.'
  },
  {
    id: 'qr3-nested',
    title: 'Nested QR Inception',
    concept: 'Multi-layer encoding for obfuscation',
    scenario: 'CTF challenge: QR code contains another QR code (QR-ception).',
    steps: [
      '1. Decode outer QR to get base64 string',
      '2. Decode base64 to get image data',
      '3. Save as new image file',
      '4. Scan inner QR to get next layer',
      '5. Repeat until flag is revealed'
    ],
    realWorldExample: 'CTFlearn Challenge #920 uses this technique. Automated Python scripts with pyzbar can solve 100+ layers.',
    securityImplication: 'Layered encoding makes automated detection difficult.'
  },
  {
    id: 'qr4-corruption',
    title: 'QR Error Correction Exploitation',
    concept: 'Reed-Solomon error correction and recovery',
    scenario: 'Partially corrupted QR code needs reconstruction.',
    steps: [
      '1. Identify QR version (determines size)',
      '2. Apply error correction level analysis',
      '3. Use QRAZYBOX tool for manual reconstruction',
      '4. Test different mask patterns',
      '5. Extract data from recovered code'
    ],
    realWorldExample: 'QR codes with Q-level correction can recover 25% corrupted data. Security researchers exploit this to hide data in "damaged" areas.',
    securityImplication: 'Hidden data can be embedded in QR "error" regions.'
  },
  {
    id: 'qr5-injection',
    title: 'QR Payload Injection',
    concept: 'SSTI and injection via QR input',
    scenario: 'QR scanner processes text without sanitization.',
    steps: [
      '1. Generate QR with template injection payload',
      '2. Scanner decodes QR and renders result',
      '3. Payload executes in server context',
      '4. Example Jinja2: {{ config.items() }}',
      '5. Escalate to RCE via import chains'
    ],
    realWorldExample: 'AirOverflow CTF 2024 featured SSTI via QR - the scanner passed decoded text directly to a Jinja2 template.',
    securityImplication: 'Always sanitize QR-decoded input before processing.'
  }
];

const CRYPTO_AUTH_DOCS = `
## Hash-Based Session Authentication (No Accounts)

### Concept
Use cryptographic hashes to validate users without storing credentials.

### How It Works
\`\`\`
Token = SHA256(device_fingerprint + timestamp + shared_secret)
\`\`\`

### Validation Flow
1. Client generates token from device info + current time
2. Server receives token + timestamp
3. Server regenerates expected token using same inputs
4. If hashes match within time window → valid session

### Benefits
- No user database required
- No passwords to breach
- Stateless authentication
- Device-bound sessions

### Implementation Pseudocode
\`\`\`javascript
// Client-side token generation
function generateSessionToken(deviceId, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = \`\${deviceId}:\${timestamp}:\${secret}\`;
  return sha256(payload) + ':' + timestamp;
}

// Server-side validation
function validateToken(token, secret) {
  const [hash, timestamp] = token.split(':');
  const age = Date.now() / 1000 - parseInt(timestamp);
  if (age > 300) return false; // 5 min window
  
  // Regenerate expected hash
  const expected = sha256(\`\${extractDeviceId(request)}:\${timestamp}:\${secret}\`);
  return timingSafeEqual(hash, expected);
}
\`\`\`
`;

const SSH_HARDENING_DOCS = `
## Hardened SSH Range Server Architecture

### Async IP Rotation
\`\`\`python
class AsyncIPRotator:
    def __init__(self, ip_pool: List[str]):
        self.ip_pool = ip_pool
        self.current_index = 0
        self.rotation_interval = 300  # 5 minutes
        
    async def rotate_listener(self):
        while True:
            await asyncio.sleep(self.rotation_interval)
            self.current_index = (self.current_index + 1) % len(self.ip_pool)
            await self.rebind_listener(self.ip_pool[self.current_index])
            
    async def rebind_listener(self, new_ip: str):
        # Gracefully migrate existing connections
        for session in self.active_sessions:
            session.notify_migration(new_ip)
        self.ssh_server.bind(new_ip, self.port)
\`\`\`

### Input Sanitization Layer
\`\`\`python
class SecureInputHandler:
    BLOCKED_PATTERNS = [
        r'\\x00',           # Null bytes
        r'[;&|]',           # Command chaining
        r'\\$\\(',          # Command substitution
        r'\\.\\./\\.\\./', # Path traversal
    ]
    
    def sanitize(self, input: str) -> str:
        for pattern in self.BLOCKED_PATTERNS:
            if re.search(pattern, input):
                raise SecurityViolation(f"Blocked pattern: {pattern}")
        return html.escape(input.strip()[:4096])
\`\`\`

### Session Isolation
\`\`\`python
class IsolatedSession:
    def __init__(self, session_id: str):
        self.container_id = create_ephemeral_container()
        self.namespace = create_network_namespace()
        self.cgroup = create_resource_limits(
            cpu_shares=256,
            memory_limit='512M',
            pids_limit=50
        )
        
    async def execute(self, command: str) -> str:
        # Run in isolated container with timeout
        return await asyncio.wait_for(
            self.container.exec(command),
            timeout=30.0
        )
\`\`\`

### Obfuscation Techniques
- Port knocking sequence before SSH handshake
- TLS wrapping with custom certificate
- Packet timing jitter (±50ms)
- Decoy traffic generation
- Honeypot command responses for known exploit patterns
`;

interface ApiPlaygroundProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiPlayground({ open, onOpenChange }: ApiPlaygroundProps) {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [requestBody, setRequestBody] = useState('');
  const [urlParams, setUrlParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = Array.from(new Set(API_ENDPOINTS.map(e => e.category)));

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copied!', description: 'Code copied to clipboard' });
  };

  const executeRequest = async () => {
    if (!selectedEndpoint) return;
    setLoading(true);
    setResponse(null);

    try {
      let path = selectedEndpoint.path;
      Object.entries(urlParams).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
      });

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (['POST', 'PATCH', 'PUT'].includes(selectedEndpoint.method) && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(path, options);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse(JSON.stringify({ error: String(err) }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const buildCurlCommand = () => {
    if (!selectedEndpoint) return '';
    let path = selectedEndpoint.path;
    Object.entries(urlParams).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value || `:${key}`);
    });
    
    let cmd = `curl -X ${selectedEndpoint.method} "${window.location.origin}${path}"`;
    if (['POST', 'PATCH', 'PUT'].includes(selectedEndpoint.method)) {
      cmd += ` \\\n  -H "Content-Type: application/json"`;
      if (requestBody) {
        cmd += ` \\\n  -d '${requestBody.replace(/\n/g, '')}'`;
      }
    }
    return cmd;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[hsl(var(--card))] border-amber-900/50 text-foreground font-mono w-[95vw] max-w-5xl h-[90vh] flex flex-col p-2 sm:p-4" data-testid="api-playground-dialog">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-amber-500 font-orbitron text-lg sm:text-xl">
            <Terminal className="w-5 h-5" />
            API Playground
            <Badge variant="outline" className="border-teal-600 text-teal-400 text-[10px] ml-2">
              MODULAR
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-card/50 border border-amber-900/30 shrink-0 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="endpoints" className="text-xs data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[36px]">
              <Server className="w-3 h-3 mr-1" /> Endpoints
            </TabsTrigger>
            <TabsTrigger value="quests" className="text-xs data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[36px]">
              <Target className="w-3 h-3 mr-1" /> Quests
            </TabsTrigger>
            <TabsTrigger value="qr" className="text-xs data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[36px]">
              <QrCode className="w-3 h-3 mr-1" /> QR Labs
            </TabsTrigger>
            <TabsTrigger value="crypto" className="text-xs data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[36px]">
              <Key className="w-3 h-3 mr-1" /> Crypto Auth
            </TabsTrigger>
            <TabsTrigger value="ssh" className="text-xs data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400 min-h-[36px]">
              <Shield className="w-3 h-3 mr-1" /> SSH Range
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden mt-2">
            <TabsContent value="endpoints" className="h-full m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                <ScrollArea className="h-[calc(90vh-180px)] pr-2">
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <div key={cat}>
                        <h4 className="text-xs text-amber-600 font-bold mb-2 sticky top-0 bg-[hsl(var(--card))] py-1">{cat}</h4>
                        {API_ENDPOINTS.filter(e => e.category === cat).map(endpoint => (
                          <button
                            key={endpoint.path + endpoint.method}
                            onClick={() => {
                              setSelectedEndpoint(endpoint);
                              setRequestBody(endpoint.exampleBody || '');
                              setUrlParams({});
                            }}
                            className={`w-full text-left p-2 rounded border transition-colors mb-1 ${
                              selectedEndpoint?.path === endpoint.path && selectedEndpoint?.method === endpoint.method
                                ? 'border-amber-600 bg-amber-900/20'
                                : 'border-border hover:border-amber-800/50'
                            }`}
                            data-testid={`endpoint-${endpoint.method}-${endpoint.path.replace(/[/:]/g, '-')}`}
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[10px] ${
                                endpoint.method === 'GET' ? 'bg-teal-900 text-teal-300' :
                                endpoint.method === 'POST' ? 'bg-blue-900 text-blue-300' :
                                endpoint.method === 'PATCH' ? 'bg-orange-900 text-orange-300' :
                                endpoint.method === 'DELETE' ? 'bg-red-900 text-red-300' :
                                'bg-purple-900 text-purple-300'
                              }`}>
                                {endpoint.method}
                              </Badge>
                              <span className="text-xs text-muted-foreground truncate">{endpoint.path}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{endpoint.description}</p>
                            {endpoint.rateLimit && (
                              <Badge variant="outline" className="text-[8px] border-orange-800 text-orange-400 mt-1">
                                <Clock className="w-2 h-2 mr-1" /> {endpoint.rateLimit}
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="space-y-3">
                  {selectedEndpoint ? (
                    <>
                      <div className="p-3 bg-card/50 rounded border border-amber-900/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-amber-900">{selectedEndpoint.method}</Badge>
                            <span className="text-sm text-amber-400">{selectedEndpoint.path}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(buildCurlCommand(), 'curl')}
                            className="text-muted-foreground h-7"
                          >
                            {copiedId === 'curl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span className="ml-1 text-xs">cURL</span>
                          </Button>
                        </div>

                        {selectedEndpoint.params?.map(param => (
                          <div key={param.name} className="mb-2">
                            <label className="text-[10px] text-muted-foreground block mb-1">
                              {param.name} {param.required && <span className="text-red-400">*</span>}
                              <span className="text-muted-foreground ml-2">({param.type})</span>
                            </label>
                            <Input
                              value={urlParams[param.name] || ''}
                              onChange={e => setUrlParams(p => ({ ...p, [param.name]: e.target.value }))}
                              placeholder={param.description}
                              className="h-8 text-xs bg-black/50 border-border"
                            />
                          </div>
                        ))}

                        {['POST', 'PATCH', 'PUT'].includes(selectedEndpoint.method) && (
                          <div className="mb-2">
                            <label className="text-[10px] text-muted-foreground block mb-1">Request Body (JSON)</label>
                            <Textarea
                              value={requestBody}
                              onChange={e => setRequestBody(e.target.value)}
                              className="h-24 text-xs bg-black/50 border-border font-mono"
                              placeholder="{}"
                            />
                          </div>
                        )}

                        <Button
                          onClick={executeRequest}
                          disabled={loading}
                          className="w-full bg-amber-700 hover:bg-amber-600 text-black"
                          data-testid="execute-request"
                        >
                          {loading ? (
                            <span className="animate-pulse">Executing...</span>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" /> Execute Request
                            </>
                          )}
                        </Button>
                      </div>

                      {response && (
                        <div className="p-3 bg-black/50 rounded border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">Response</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(response, 'response')}
                              className="h-6"
                            >
                              {copiedId === 'response' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                          <ScrollArea className="h-32">
                            <pre className="text-[10px] text-teal-400 whitespace-pre-wrap">{response}</pre>
                          </ScrollArea>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Server className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Select an endpoint to test</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quests" className="h-full m-0">
              <ScrollArea className="h-[calc(90vh-180px)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2">
                  {API_QUESTS.map(quest => (
                    <Card key={quest.id} className={`bg-card/30 border-border ${completedQuests.includes(quest.id) ? 'border-teal-600/50' : ''}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span className="text-amber-400">{quest.title}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${
                              quest.difficulty === 'beginner' ? 'border-green-600 text-green-400' :
                              quest.difficulty === 'intermediate' ? 'border-blue-600 text-blue-400' :
                              quest.difficulty === 'advanced' ? 'border-orange-600 text-orange-400' :
                              'border-red-600 text-red-400'
                            }`}>
                              {quest.difficulty}
                            </Badge>
                            <span className="text-xs text-amber-500">{quest.xp} XP</span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        <p className="text-muted-foreground">{quest.description}</p>
                        <div>
                          <h5 className="text-[10px] text-amber-600 font-bold mb-1">Objectives:</h5>
                          <ul className="space-y-1">
                            {quest.objectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <ChevronRight className="w-3 h-3 mt-0.5 text-amber-700" />
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <details className="text-muted-foreground">
                          <summary 
                            className="cursor-pointer text-sm py-2 text-amber-700 hover:text-amber-500 touch-manipulation"
                            onTouchEnd={(e) => e.stopPropagation()}
                          >
                            <Lightbulb className="w-4 h-4 inline mr-2" /> Show Hints
                          </summary>
                          <ul className="mt-2 space-y-2 pl-4">
                            {quest.hints.map((hint, i) => (
                              <li key={i} className="text-xs">• {hint}</li>
                            ))}
                          </ul>
                        </details>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!completedQuests.includes(quest.id)) {
                              setCompletedQuests([...completedQuests, quest.id]);
                              toast({ title: 'Quest Completed!', description: `+${quest.xp} XP earned` });
                            }
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            if (!completedQuests.includes(quest.id)) {
                              setCompletedQuests([...completedQuests, quest.id]);
                              toast({ title: 'Quest Completed!', description: `+${quest.xp} XP earned` });
                            }
                          }}
                          className={`w-full mt-2 min-h-[48px] touch-manipulation ${completedQuests.includes(quest.id) ? 'border-teal-600 text-teal-400' : 'border-amber-800 text-amber-400'}`}
                          data-testid={`complete-quest-${quest.id}`}
                        >
                          {completedQuests.includes(quest.id) ? (
                            <><Check className="w-4 h-4 mr-2" /> Completed</>
                          ) : (
                            <><Award className="w-4 h-4 mr-2" /> Mark Complete</>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="qr" className="h-full m-0">
              <ScrollArea className="h-[calc(90vh-180px)]">
                <div className="space-y-4 pr-2">
                  <div className="p-3 bg-amber-900/20 rounded border border-amber-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-400 font-bold">Educational Purpose Only</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      These exercises teach QR security concepts. Real-world C2 techniques like QuickResponseC2 
                      use similar methods to evade detection. Understanding these helps defenders recognize threats.
                    </p>
                  </div>

                  {QR_EXERCISES.map(exercise => (
                    <Card key={exercise.id} className="bg-card/30 border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-400">{exercise.title}</span>
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">{exercise.concept}</p>
                      </CardHeader>
                      <CardContent className="text-xs space-y-3">
                        <div>
                          <h5 className="text-[10px] text-amber-600 font-bold mb-1">Scenario:</h5>
                          <p className="text-muted-foreground">{exercise.scenario}</p>
                        </div>
                        <div>
                          <h5 className="text-[10px] text-amber-600 font-bold mb-1">Steps:</h5>
                          <ol className="space-y-1 text-muted-foreground">
                            {exercise.steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        <div className="p-2 bg-teal-900/20 rounded border border-teal-800/50">
                          <h5 className="text-[10px] text-teal-400 font-bold mb-1">Real-World Example:</h5>
                          <p className="text-muted-foreground">{exercise.realWorldExample}</p>
                        </div>
                        <div className="p-2 bg-red-900/20 rounded border border-red-800/50">
                          <h5 className="text-[10px] text-red-400 font-bold mb-1">Security Implication:</h5>
                          <p className="text-muted-foreground">{exercise.securityImplication}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="crypto" className="h-full m-0">
              <ScrollArea className="h-[calc(90vh-180px)]">
                <div className="pr-2">
                  <div className="p-3 bg-card/50 rounded border border-amber-900/30 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-400 font-bold">Cryptographic Session Auth</span>
                      </div>
                      <Badge variant="outline" className="border-purple-600 text-purple-400 text-[10px]">
                        PLACEHOLDER MODULE
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Architecture for validating users via hashed session tokens without managing accounts.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(CRYPTO_AUTH_DOCS, 'crypto')}
                      className="border-amber-800 text-amber-400"
                    >
                      {copiedId === 'crypto' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      Copy Docs
                    </Button>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap bg-black/50 p-4 rounded border border-border overflow-x-auto">
                      {CRYPTO_AUTH_DOCS}
                    </pre>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ssh" className="h-full m-0">
              <ScrollArea className="h-[calc(90vh-180px)]">
                <div className="pr-2">
                  <div className="p-3 bg-card/50 rounded border border-amber-900/30 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-400 font-bold">Hardened SSH Cyber Range</span>
                      </div>
                      <Badge variant="outline" className="border-purple-600 text-purple-400 text-[10px]">
                        PLACEHOLDER MODULE
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Pseudocode architecture for a highly secured SSH server with async IP rotation,
                      input sanitization, session isolation, and obfuscation techniques.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(SSH_HARDENING_DOCS, 'ssh')}
                      className="border-amber-800 text-amber-400"
                    >
                      {copiedId === 'ssh' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                      Copy Pseudocode
                    </Button>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap bg-black/50 p-4 rounded border border-border overflow-x-auto">
                      {SSH_HARDENING_DOCS}
                    </pre>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
