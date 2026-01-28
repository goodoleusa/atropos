import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/hooks/useGameSession';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system' | 'clue' | 'ascii' | 'success' | 'warning';
  content: string;
}

const ASCII_LOGO = `
  ███████╗██╗   ██╗███████╗ █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗
  ██╔════╝╚██╗ ██╔╝██╔════╝██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║
  ███████╗ ╚████╔╝ ███████╗███████║██║  ██║██╔████╔██║██║██╔██╗ ██║
  ╚════██║  ╚██╔╝  ╚════██║██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║
  ███████║   ██║   ███████║██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║
  ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝
                    MOLTEN CORE INTERFACE v4.2.0
`;

// Simulated target data for OSINT challenges
const TARGETS = {
  'sysadmin_ceo': { name: 'Marcus Blackwell', email: 'mblackwell@sysadmin.corp', role: 'CEO', phone: '555-0199', location: 'Floor 47' },
  'ghost_user': { name: '[REDACTED]', email: 'ghost@void.null', role: 'Unknown', phone: 'N/A', location: 'The Void' },
  'admin': { name: 'System Administrator', email: 'admin@sysadmin.corp', role: 'Admin', phone: '555-0001', location: 'Server Room B' },
};

// Simulated ports for scanning
const PORT_DATA: Record<string, { port: number; service: string; status: string; vuln?: string }[]> = {
  'localhost': [
    { port: 22, service: 'SSH', status: 'OPEN' },
    { port: 80, service: 'HTTP', status: 'OPEN' },
    { port: 443, service: 'HTTPS', status: 'OPEN' },
    { port: 3306, service: 'MySQL', status: 'FILTERED' },
    { port: 5000, service: 'DevServer', status: 'OPEN' },
    { port: 6666, service: 'UNKNOWN', status: 'OPEN', vuln: 'CVE-2024-MOLTEN' },
  ],
  'molten_core': [
    { port: 666, service: 'HELLGATE', status: 'OPEN', vuln: 'CRITICAL' },
    { port: 1984, service: 'OVERSIGHT', status: 'OPEN' },
    { port: 4444, service: 'BACKDOOR', status: 'OPEN', vuln: 'CVE-VOID-001' },
  ],
  'vault.sysadmin.corp': [
    { port: 22, service: 'SSH', status: 'CLOSED' },
    { port: 443, service: 'HTTPS', status: 'OPEN' },
    { port: 8080, service: 'API', status: 'FILTERED' },
    { port: 27017, service: 'MongoDB', status: 'OPEN', vuln: 'NoAuth' },
  ],
};

// Hash database for cracking
const HASH_DB: Record<string, string> = {
  '5d41402abc4b2a76b9719d911017c592': 'hello',
  '098f6bcd4621d373cade4e832627b4f6': 'test',
  '25d55ad283aa400af464c76d713c07ad': '12345678',
  'd8578edf8458ce06fbc5bb76a58c5ca4': 'qwerty',
  '5f4dcc3b5aa765d61d8327deb882cf99': 'password',
  'e99a18c428cb38d5f260853678922e03': 'abc123',
  '21232f297a57a5a743894a0e4a801fc3': 'admin',
  '0xFE_MOLTEN_BRONZE': 'THE_CORE_AWAKENS',
};

// DNS records
const DNS_RECORDS: Record<string, { type: string; value: string }[]> = {
  'sysadmin.corp': [
    { type: 'A', value: '192.168.1.100' },
    { type: 'MX', value: 'mail.sysadmin.corp' },
    { type: 'TXT', value: 'v=spf1 include:_spf.sysadmin.corp ~all' },
    { type: 'NS', value: 'ns1.molten-dns.com' },
  ],
  'void.null': [
    { type: 'A', value: '0.0.0.0' },
    { type: 'TXT', value: 'THE_VOID_WATCHES' },
    { type: 'CNAME', value: 'nowhere.void.null' },
  ],
};

// Exploit database
const EXPLOITS: Record<string, { name: string; severity: string; desc: string }> = {
  'CVE-2024-MOLTEN': { name: 'Molten Core Overflow', severity: 'CRITICAL', desc: 'Buffer overflow in thermal regulation system' },
  'CVE-VOID-001': { name: 'Void Gateway Bypass', severity: 'HIGH', desc: 'Authentication bypass via null pointer' },
  'NoAuth': { name: 'MongoDB No Authentication', severity: 'CRITICAL', desc: 'Database exposed without auth' },
};

export const CustomTerminal = () => {
  const { gameState, collectClue } = useGame();
  
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'ascii', content: ASCII_LOGO },
    { type: 'system', content: 'Connection established via encrypted tunnel.' },
    { type: 'output', content: 'Type "help" for available commands. Type "modules" for CTF tools.' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDir, setCurrentDir] = useState('/home/guest');
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const [minigameState, setMinigameState] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const addLines = (lines: TerminalLine[]) => {
    setHistory(h => [...h, ...lines]);
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    if (trimmedCmd) {
      setCommandHistory(prev => [...prev, trimmedCmd]);
    }
    
    const newHistory: TerminalLine[] = [{ type: 'input', content: `${currentDir}$ ${trimmedCmd}` }];

    // Handle active minigames
    if (activeMinigame === 'crack') {
      handleCrackGame(trimmedCmd, newHistory);
      setHistory(h => [...h, ...newHistory]);
      setInput('');
      return;
    }

    switch (command) {
      case 'help':
        newHistory.push({ type: 'output', content: '╔════════════════════════════════════════════════════════╗' });
        newHistory.push({ type: 'output', content: '║              SYSADMIN TERMINAL v4.2.0                  ║' });
        newHistory.push({ type: 'output', content: '╠════════════════════════════════════════════════════════╣' });
        newHistory.push({ type: 'output', content: '║  NAVIGATION                                            ║' });
        newHistory.push({ type: 'output', content: '║    help, modules, whoami, ls, cd, cat, pwd, clear      ║' });
        newHistory.push({ type: 'output', content: '║  NETWORK                                               ║' });
        newHistory.push({ type: 'output', content: '║    nmap, netstat, ping, traceroute, dig, whois, curl   ║' });
        newHistory.push({ type: 'output', content: '║  SECURITY                                              ║' });
        newHistory.push({ type: 'output', content: '║    ssh, crack, hashid, exploit, enum, gobuster         ║' });
        newHistory.push({ type: 'output', content: '║  OSINT                                                 ║' });
        newHistory.push({ type: 'output', content: '║    recon, dossier, exif, social, shodan                ║' });
        newHistory.push({ type: 'output', content: '║  CTF                                                   ║' });
        newHistory.push({ type: 'output', content: '║    decode, encode, xor, rot13, hex, binwalk, strings   ║' });
        newHistory.push({ type: 'output', content: '║  SYSTEM                                                ║' });
        newHistory.push({ type: 'output', content: '║    probe, inventory, history, export                   ║' });
        newHistory.push({ type: 'output', content: '╚════════════════════════════════════════════════════════╝' });
        break;

      case 'modules':
        newHistory.push({ type: 'output', content: '┌──────────────────────────────────────────────────────────┐' });
        newHistory.push({ type: 'output', content: '│                    CTF MODULES                           │' });
        newHistory.push({ type: 'output', content: '├──────────────────────────────────────────────────────────┤' });
        newHistory.push({ type: 'success', content: '│  [RECON]     OSINT & Information Gathering              │' });
        newHistory.push({ type: 'output', content: '│    recon <target>  - Run full reconnaissance            │' });
        newHistory.push({ type: 'output', content: '│    dossier <user>  - Build target profile               │' });
        newHistory.push({ type: 'output', content: '│    social <user>   - Social media enumeration           │' });
        newHistory.push({ type: 'success', content: '│  [SCAN]      Network Scanning & Enumeration             │' });
        newHistory.push({ type: 'output', content: '│    nmap <host>     - Port scan target                   │' });
        newHistory.push({ type: 'output', content: '│    gobuster <url>  - Directory bruteforce               │' });
        newHistory.push({ type: 'output', content: '│    enum <service>  - Service enumeration                │' });
        newHistory.push({ type: 'success', content: '│  [EXPLOIT]   Vulnerability Exploitation                 │' });
        newHistory.push({ type: 'output', content: '│    exploit <cve>   - Run exploit module                 │' });
        newHistory.push({ type: 'output', content: '│    crack           - Password cracker (interactive)     │' });
        newHistory.push({ type: 'output', content: '│    inject <param>  - SQL injection test                 │' });
        newHistory.push({ type: 'success', content: '│  [CRYPTO]    Cryptography & Encoding                    │' });
        newHistory.push({ type: 'output', content: '│    decode <b64>    - Base64 decode                      │' });
        newHistory.push({ type: 'output', content: '│    encode <text>   - Base64 encode                      │' });
        newHistory.push({ type: 'output', content: '│    rot13 <text>    - ROT13 cipher                       │' });
        newHistory.push({ type: 'output', content: '│    xor <hex> <key> - XOR decrypt                        │' });
        newHistory.push({ type: 'output', content: '│    hashid <hash>   - Identify hash type                 │' });
        newHistory.push({ type: 'success', content: '│  [FORENSICS] File Analysis                              │' });
        newHistory.push({ type: 'output', content: '│    exif <file>     - Extract metadata                   │' });
        newHistory.push({ type: 'output', content: '│    strings <file>  - Extract strings                    │' });
        newHistory.push({ type: 'output', content: '│    binwalk <file>  - Analyze binary                     │' });
        newHistory.push({ type: 'output', content: '└──────────────────────────────────────────────────────────┘' });
        break;
        
      case 'whoami':
        newHistory.push({ type: 'output', content: `User: ${gameState.username}` });
        newHistory.push({ type: 'output', content: `UID: 1000 (guest)` });
        newHistory.push({ type: 'output', content: `Token: ${gameState.sessionToken.substring(0,16)}...` });
        newHistory.push({ type: 'output', content: `Access Level: GUEST` });
        newHistory.push({ type: 'output', content: `Data Fragments: ${gameState.inventory.length}` });
        newHistory.push({ type: 'output', content: `Current Dir: ${currentDir}` });
        break;

      case 'pwd':
        newHistory.push({ type: 'output', content: currentDir });
        break;

      case 'cd':
        const dir = args[0] || '/home/guest';
        if (dir === '..') {
          const parts = currentDir.split('/').filter(Boolean);
          parts.pop();
          setCurrentDir('/' + parts.join('/') || '/');
        } else if (dir.startsWith('/')) {
          setCurrentDir(dir);
        } else {
          setCurrentDir(`${currentDir}/${dir}`.replace('//', '/'));
        }
        newHistory.push({ type: 'system', content: `Changed to ${dir}` });
        break;
        
      case 'inventory':
        if (gameState.inventory.length === 0) {
          newHistory.push({ type: 'output', content: 'No data fragments collected.' });
          newHistory.push({ type: 'system', content: 'Hint: Explore commands like "cat", "nmap", "recon" to find clues.' });
        } else {
          newHistory.push({ type: 'output', content: '┌───────────────────────────────────────────────────┐' });
          newHistory.push({ type: 'output', content: '│            COLLECTED DATA FRAGMENTS               │' });
          newHistory.push({ type: 'output', content: '├───────────────────────────────────────────────────┤' });
          gameState.inventory.forEach(item => {
            newHistory.push({ type: 'clue', content: `│ [${item.id}]` });
            newHistory.push({ type: 'output', content: `│   Name: ${item.name}` });
            newHistory.push({ type: 'output', content: `│   Data: ${item.content}` });
          });
          newHistory.push({ type: 'output', content: '└───────────────────────────────────────────────────┘' });
        }
        break;
        
      case 'ls':
        const lsArg = args[0] || '';
        if (lsArg === '-la' || lsArg === '-l' || lsArg === '-a') {
          newHistory.push({ type: 'output', content: 'total 48K' });
          newHistory.push({ type: 'output', content: 'drwxr-xr-x  5 root   root   4096 Jan 28 00:00 .' });
          newHistory.push({ type: 'output', content: 'drwxr-xr-x  3 root   root   4096 Jan 28 00:00 ..' });
          newHistory.push({ type: 'output', content: '-rw-------  1 ghost  ghost   512 Jan 28 00:00 .manifest.json' });
          newHistory.push({ type: 'output', content: '-rw-------  1 root   root    256 Jan 28 00:00 .secrets' });
          newHistory.push({ type: 'output', content: '-rw-r--r--  1 root   root   1024 Jan 28 00:00 .routes.conf' });
          newHistory.push({ type: 'output', content: '-rw-r--r--  1 admin  admin   128 Jan 28 00:00 bronze_key.enc' });
          newHistory.push({ type: 'output', content: '-rw-r--r--  1 www    www    2048 Jan 28 00:00 index.html' });
          newHistory.push({ type: 'output', content: '-rwxr-xr-x  1 root   root   4096 Jan 28 00:00 void_gateway' });
          newHistory.push({ type: 'output', content: 'drwx------  2 admin  admin  4096 Jan 28 00:00 admin_logs/' });
          newHistory.push({ type: 'output', content: 'drwxr-xr-x  2 root   root   4096 Jan 28 00:00 public/' });
        } else {
          newHistory.push({ type: 'output', content: 'admin_logs/  bronze_key.enc  index.html  public/  void_gateway' });
        }
        break;

      // NETWORK COMMANDS
      case 'nmap':
        const nmapTarget = args[0];
        if (!nmapTarget) {
          newHistory.push({ type: 'error', content: 'Usage: nmap <target>' });
          newHistory.push({ type: 'output', content: 'Example: nmap localhost, nmap molten_core' });
        } else {
          newHistory.push({ type: 'system', content: `Starting Nmap scan on ${nmapTarget}...` });
          const ports = PORT_DATA[nmapTarget] || PORT_DATA['localhost'];
          newHistory.push({ type: 'output', content: `Nmap scan report for ${nmapTarget}` });
          newHistory.push({ type: 'output', content: 'PORT      STATE      SERVICE' });
          ports.forEach(p => {
            const vulnFlag = p.vuln ? ` [VULN: ${p.vuln}]` : '';
            const statusColor = p.status === 'OPEN' ? 'success' : p.status === 'FILTERED' ? 'warning' : 'output';
            newHistory.push({ type: statusColor as any, content: `${p.port.toString().padEnd(9)} ${p.status.padEnd(10)} ${p.service}${vulnFlag}` });
          });
          if (nmapTarget === 'molten_core') {
            collectClue({
              id: 'nmap-molten',
              name: 'Molten Core Scan',
              description: 'Port scan of the molten core system',
              content: 'Backdoor found on port 4444 - CVE-VOID-001',
              foundAt: new Date().toISOString()
            });
          }
        }
        break;
        
      case 'netstat':
        newHistory.push({ type: 'output', content: 'Active Internet connections:' });
        newHistory.push({ type: 'output', content: 'Proto  Local Address       Foreign Address         State' });
        newHistory.push({ type: 'output', content: 'tcp    0.0.0.0:5000       0.0.0.0:*               LISTEN' });
        newHistory.push({ type: 'output', content: 'tcp    0.0.0.0:8080       192.168.1.???:???       ESTABLISHED' });
        newHistory.push({ type: 'warning', content: 'tcp    0.0.0.0:443        MOLTEN_CORE:6666        ENCRYPTED' });
        newHistory.push({ type: 'warning', content: 'tcp    0.0.0.0:4444       VOID:666                SUSPICIOUS' });
        newHistory.push({ type: 'system', content: 'WARNING: Anomalous connections detected' });
        break;

      case 'ping':
        const pingTarget = args[0];
        if (!pingTarget) {
          newHistory.push({ type: 'error', content: 'Usage: ping <host>' });
        } else {
          newHistory.push({ type: 'output', content: `PING ${pingTarget}:` });
          for (let i = 0; i < 4; i++) {
            const time = Math.floor(Math.random() * 50) + 10;
            newHistory.push({ type: 'output', content: `64 bytes from ${pingTarget}: icmp_seq=${i + 1} ttl=64 time=${time}ms` });
          }
          if (pingTarget === 'void.null') {
            newHistory.push({ type: 'warning', content: 'WARNING: Temporal anomaly detected in ping response' });
          }
        }
        break;

      case 'traceroute':
        const traceTarget = args[0] || 'sysadmin.corp';
        newHistory.push({ type: 'output', content: `traceroute to ${traceTarget}` });
        newHistory.push({ type: 'output', content: ' 1  gateway.local (192.168.1.1)  1.234 ms' });
        newHistory.push({ type: 'output', content: ' 2  isp-router.net (10.0.0.1)  15.678 ms' });
        newHistory.push({ type: 'output', content: ' 3  backbone.tier1.net (172.16.0.1)  25.123 ms' });
        newHistory.push({ type: 'output', content: ' 4  sysadmin-edge.corp (192.168.100.1)  35.456 ms' });
        newHistory.push({ type: 'warning', content: ' 5  * * * [FILTERED]' });
        newHistory.push({ type: 'output', content: ` 6  ${traceTarget} (192.168.100.100)  42.789 ms` });
        break;

      case 'dig':
        const digDomain = args[0] || 'sysadmin.corp';
        const records = DNS_RECORDS[digDomain] || DNS_RECORDS['sysadmin.corp'];
        newHistory.push({ type: 'output', content: `; <<>> DiG <<>> ${digDomain}` });
        newHistory.push({ type: 'output', content: ';; ANSWER SECTION:' });
        records.forEach(r => {
          newHistory.push({ type: 'output', content: `${digDomain}.    3600    IN    ${r.type}    ${r.value}` });
        });
        if (digDomain === 'void.null') {
          collectClue({
            id: 'dig-void',
            name: 'Void DNS Record',
            description: 'Strange DNS entry found',
            content: 'TXT record contains: THE_VOID_WATCHES',
            foundAt: new Date().toISOString()
          });
        }
        break;

      case 'whois':
        const whoisDomain = args[0] || 'sysadmin.corp';
        newHistory.push({ type: 'output', content: `Domain Name: ${whoisDomain.toUpperCase()}` });
        newHistory.push({ type: 'output', content: 'Registrar: MOLTEN REGISTRAR INC.' });
        newHistory.push({ type: 'output', content: 'Creation Date: 1984-01-01T00:00:00Z' });
        newHistory.push({ type: 'output', content: 'Registrant: SYSADMIN CORPORATION' });
        newHistory.push({ type: 'output', content: 'Admin Email: admin@sysadmin.corp' });
        newHistory.push({ type: 'warning', content: 'Note: Registrant details partially redacted' });
        break;

      case 'curl':
        const curlUrl = args[0];
        if (!curlUrl) {
          newHistory.push({ type: 'error', content: 'Usage: curl <url>' });
        } else {
          newHistory.push({ type: 'output', content: `Fetching ${curlUrl}...` });
          if (curlUrl.includes('api') || curlUrl.includes('secret')) {
            newHistory.push({ type: 'output', content: '{"status":"restricted","message":"Access token required"}' });
            newHistory.push({ type: 'clue', content: 'HINT: API endpoints exist. Try /api/whisper' });
          } else {
            newHistory.push({ type: 'output', content: '<!DOCTYPE html><html>...[TRUNCATED]' });
          }
        }
        break;

      // SECURITY COMMANDS
      case 'ssh':
        const host = args[0];
        if (!host) {
          newHistory.push({ type: 'error', content: 'Usage: ssh <host>' });
        } else if (host === 'molten_core' || host === 'MOLTEN_CORE') {
          newHistory.push({ type: 'system', content: 'Attempting connection to MOLTEN_CORE...' });
          newHistory.push({ type: 'system', content: 'Handshake initiated...' });
          newHistory.push({ type: 'error', content: 'CONNECTION REFUSED: Temperature threshold exceeded' });
          newHistory.push({ type: 'warning', content: 'Core temperature: 1,984°C' });
          newHistory.push({ type: 'clue', content: 'HINT: The core only accepts connections from /void' });
        } else if (host === 'vault.sysadmin.corp') {
          newHistory.push({ type: 'system', content: 'Connecting to vault.sysadmin.corp...' });
          newHistory.push({ type: 'warning', content: 'Password authentication required.' });
          newHistory.push({ type: 'clue', content: 'HINT: Try cracking the admin hash first.' });
        } else {
          newHistory.push({ type: 'error', content: `ssh: Could not resolve hostname ${host}` });
        }
        break;

      case 'crack':
        newHistory.push({ type: 'system', content: '╔════════════════════════════════════════╗' });
        newHistory.push({ type: 'system', content: '║     HASH CRACKER v2.0 - INTERACTIVE    ║' });
        newHistory.push({ type: 'system', content: '╚════════════════════════════════════════╝' });
        newHistory.push({ type: 'output', content: 'Enter hash to crack (or "exit" to quit):' });
        setActiveMinigame('crack');
        break;

      case 'hashid':
        const hash = args[0];
        if (!hash) {
          newHistory.push({ type: 'error', content: 'Usage: hashid <hash>' });
        } else if (hash.length === 32) {
          newHistory.push({ type: 'output', content: 'Analyzing hash...' });
          newHistory.push({ type: 'success', content: '[+] MD5' });
          newHistory.push({ type: 'output', content: '[+] MD4' });
          newHistory.push({ type: 'output', content: '[+] Double MD5' });
        } else if (hash.length === 40) {
          newHistory.push({ type: 'success', content: '[+] SHA-1' });
        } else if (hash.length === 64) {
          newHistory.push({ type: 'success', content: '[+] SHA-256' });
        } else {
          newHistory.push({ type: 'warning', content: 'Unknown hash format' });
        }
        break;

      case 'exploit':
        const cve = args[0];
        if (!cve) {
          newHistory.push({ type: 'error', content: 'Usage: exploit <CVE-ID>' });
          newHistory.push({ type: 'output', content: 'Available: CVE-2024-MOLTEN, CVE-VOID-001, NoAuth' });
        } else {
          const exp = EXPLOITS[cve];
          if (exp) {
            newHistory.push({ type: 'system', content: `Loading exploit: ${exp.name}...` });
            newHistory.push({ type: 'warning', content: `Severity: ${exp.severity}` });
            newHistory.push({ type: 'output', content: `Description: ${exp.desc}` });
            newHistory.push({ type: 'success', content: 'Exploit loaded. Target required for execution.' });
            collectClue({
              id: `exploit-${cve}`,
              name: `Exploit: ${exp.name}`,
              description: exp.desc,
              content: `${cve} - ${exp.severity}`,
              foundAt: new Date().toISOString()
            });
          } else {
            newHistory.push({ type: 'error', content: `Exploit ${cve} not found in database` });
          }
        }
        break;

      case 'enum':
        const enumService = args[0];
        if (!enumService) {
          newHistory.push({ type: 'error', content: 'Usage: enum <service>' });
          newHistory.push({ type: 'output', content: 'Services: ssh, http, ftp, smb, mysql' });
        } else {
          newHistory.push({ type: 'system', content: `Enumerating ${enumService}...` });
          newHistory.push({ type: 'output', content: `[*] ${enumService.toUpperCase()} Service Enumeration` });
          newHistory.push({ type: 'output', content: '[+] Banner: SysAdmin Corp Server v4.2' });
          newHistory.push({ type: 'output', content: '[+] Users found: admin, guest, ghost' });
          newHistory.push({ type: 'warning', content: '[!] Default credentials may be in use' });
        }
        break;

      case 'gobuster':
        const gobusterUrl = args[0];
        if (!gobusterUrl) {
          newHistory.push({ type: 'error', content: 'Usage: gobuster <url>' });
        } else {
          newHistory.push({ type: 'system', content: `Gobuster v3.1 - Directory bruteforce on ${gobusterUrl}` });
          newHistory.push({ type: 'success', content: '/admin             (Status: 200)' });
          newHistory.push({ type: 'success', content: '/api               (Status: 403)' });
          newHistory.push({ type: 'success', content: '/terminal          (Status: 200)' });
          newHistory.push({ type: 'success', content: '/void              (Status: 200)' });
          newHistory.push({ type: 'success', content: '/archive           (Status: 200)' });
          newHistory.push({ type: 'success', content: '/debug             (Status: 200)' });
          newHistory.push({ type: 'warning', content: '/.secrets          (Status: 403)' });
          newHistory.push({ type: 'warning', content: '/api/whisper       (Status: 401)' });
          collectClue({
            id: 'gobuster-scan',
            name: 'Directory Enumeration',
            description: 'Found hidden directories',
            content: '/admin, /void, /archive, /debug, /api/whisper',
            foundAt: new Date().toISOString()
          });
        }
        break;

      case 'inject':
        const injectParam = args.join(' ');
        if (!injectParam) {
          newHistory.push({ type: 'error', content: "Usage: inject <payload>" });
          newHistory.push({ type: 'output', content: "Example: inject ' OR 1=1--" });
        } else {
          newHistory.push({ type: 'system', content: `Testing payload: ${injectParam}` });
          if (injectParam.includes('1=1') || injectParam.includes('OR')) {
            newHistory.push({ type: 'success', content: '[+] SQL Injection vulnerability detected!' });
            newHistory.push({ type: 'output', content: 'Database: sysadmin_db' });
            newHistory.push({ type: 'output', content: 'Tables: users, sessions, secrets, void_access' });
            collectClue({
              id: 'sqli-vuln',
              name: 'SQL Injection Found',
              description: 'Database vulnerable to SQL injection',
              content: 'Tables: users, sessions, secrets, void_access',
              foundAt: new Date().toISOString()
            });
          } else {
            newHistory.push({ type: 'warning', content: '[-] Payload did not trigger vulnerability' });
          }
        }
        break;

      // OSINT COMMANDS
      case 'recon':
        const reconTarget = args[0];
        if (!reconTarget) {
          newHistory.push({ type: 'error', content: 'Usage: recon <target>' });
          newHistory.push({ type: 'output', content: 'Targets: sysadmin.corp, void.null' });
        } else {
          newHistory.push({ type: 'system', content: `Running reconnaissance on ${reconTarget}...` });
          newHistory.push({ type: 'output', content: '════════════════════════════════════════' });
          newHistory.push({ type: 'output', content: `Target: ${reconTarget}` });
          newHistory.push({ type: 'output', content: '════════════════════════════════════════' });
          newHistory.push({ type: 'success', content: '[DNS] A Record: 192.168.100.1' });
          newHistory.push({ type: 'success', content: '[WHOIS] Registrant: SYSADMIN CORP' });
          newHistory.push({ type: 'success', content: '[SSL] Certificate: Valid until 2025' });
          newHistory.push({ type: 'warning', content: '[PORTS] 5 open ports detected' });
          newHistory.push({ type: 'warning', content: '[VULN] Potential CVEs found' });
          newHistory.push({ type: 'output', content: '════════════════════════════════════════' });
          collectClue({
            id: `recon-${reconTarget}`,
            name: `Recon: ${reconTarget}`,
            description: 'Full reconnaissance report',
            content: 'DNS, WHOIS, SSL, Ports analyzed',
            foundAt: new Date().toISOString()
          });
        }
        break;

      case 'dossier':
        const dossierUser = args[0];
        if (!dossierUser) {
          newHistory.push({ type: 'error', content: 'Usage: dossier <username>' });
          newHistory.push({ type: 'output', content: 'Known users: sysadmin_ceo, ghost_user, admin' });
        } else {
          const target = TARGETS[dossierUser as keyof typeof TARGETS];
          if (target) {
            newHistory.push({ type: 'system', content: `Building dossier on ${dossierUser}...` });
            newHistory.push({ type: 'output', content: '┌────────────────────────────────────┐' });
            newHistory.push({ type: 'output', content: '│         TARGET DOSSIER             │' });
            newHistory.push({ type: 'output', content: '├────────────────────────────────────┤' });
            newHistory.push({ type: 'output', content: `│ Name:     ${target.name}` });
            newHistory.push({ type: 'output', content: `│ Email:    ${target.email}` });
            newHistory.push({ type: 'output', content: `│ Role:     ${target.role}` });
            newHistory.push({ type: 'output', content: `│ Phone:    ${target.phone}` });
            newHistory.push({ type: 'output', content: `│ Location: ${target.location}` });
            newHistory.push({ type: 'output', content: '└────────────────────────────────────┘' });
            collectClue({
              id: `dossier-${dossierUser}`,
              name: `Dossier: ${target.name}`,
              description: 'Target profile',
              content: `${target.role} at ${target.location}`,
              foundAt: new Date().toISOString()
            });
          } else {
            newHistory.push({ type: 'error', content: `No data found for ${dossierUser}` });
          }
        }
        break;

      case 'social':
        const socialUser = args[0];
        if (!socialUser) {
          newHistory.push({ type: 'error', content: 'Usage: social <username>' });
        } else {
          newHistory.push({ type: 'system', content: `Searching social platforms for ${socialUser}...` });
          newHistory.push({ type: 'success', content: '[+] LinkedIn: Profile found' });
          newHistory.push({ type: 'success', content: '[+] GitHub: 3 repositories' });
          newHistory.push({ type: 'warning', content: '[-] Twitter: Account suspended' });
          newHistory.push({ type: 'output', content: '[*] Instagram: Private account' });
        }
        break;

      case 'shodan':
        const shodanQuery = args.join(' ');
        if (!shodanQuery) {
          newHistory.push({ type: 'error', content: 'Usage: shodan <query>' });
        } else {
          newHistory.push({ type: 'system', content: `Querying Shodan for: ${shodanQuery}` });
          newHistory.push({ type: 'output', content: 'Results: 147 devices found' });
          newHistory.push({ type: 'warning', content: '[!] 23 devices with default credentials' });
          newHistory.push({ type: 'warning', content: '[!] 8 devices running vulnerable software' });
          newHistory.push({ type: 'output', content: 'Top ports: 22, 80, 443, 8080, 3306' });
        }
        break;

      case 'exif':
        const exifFile = args[0];
        if (!exifFile) {
          newHistory.push({ type: 'error', content: 'Usage: exif <file>' });
        } else {
          newHistory.push({ type: 'system', content: `Extracting metadata from ${exifFile}...` });
          newHistory.push({ type: 'output', content: 'Camera: Canon EOS 5D Mark IV' });
          newHistory.push({ type: 'output', content: 'Date: 2024-01-15 14:32:00' });
          newHistory.push({ type: 'success', content: 'GPS: 37.7749° N, 122.4194° W' });
          newHistory.push({ type: 'output', content: 'Software: Adobe Photoshop CC 2024' });
          newHistory.push({ type: 'clue', content: 'HINT: GPS coordinates point to San Francisco' });
        }
        break;

      // CTF/CRYPTO COMMANDS
      case 'decode':
        const encoded = args[0];
        if (!encoded) {
          newHistory.push({ type: 'error', content: 'Usage: decode <base64_string>' });
        } else {
          try {
            const decoded = atob(encoded);
            newHistory.push({ type: 'success', content: `DECODED: ${decoded}` });
          } catch {
            newHistory.push({ type: 'error', content: 'decode: Invalid base64 string' });
          }
        }
        break;

      case 'encode':
        const toEncode = args.join(' ');
        if (!toEncode) {
          newHistory.push({ type: 'error', content: 'Usage: encode <text>' });
        } else {
          const encoded64 = btoa(toEncode);
          newHistory.push({ type: 'success', content: `ENCODED: ${encoded64}` });
        }
        break;

      case 'rot13':
        const rot13Input = args.join(' ');
        if (!rot13Input) {
          newHistory.push({ type: 'error', content: 'Usage: rot13 <text>' });
        } else {
          const rot13 = rot13Input.replace(/[a-zA-Z]/g, (c) => {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
          });
          newHistory.push({ type: 'success', content: `ROT13: ${rot13}` });
        }
        break;

      case 'xor':
        const xorHex = args[0];
        const xorKey = args[1];
        if (!xorHex || !xorKey) {
          newHistory.push({ type: 'error', content: 'Usage: xor <hex_string> <key>' });
        } else {
          newHistory.push({ type: 'system', content: `XOR decrypting with key: ${xorKey}` });
          newHistory.push({ type: 'success', content: 'Result: [DECRYPTED_DATA]' });
        }
        break;

      case 'hex':
        const hexInput = args.join(' ');
        if (!hexInput) {
          newHistory.push({ type: 'error', content: 'Usage: hex <text>' });
        } else {
          const hexResult = hexInput.split('').map(c => c.charCodeAt(0).toString(16)).join(' ');
          newHistory.push({ type: 'success', content: `HEX: ${hexResult}` });
        }
        break;

      case 'strings':
        const stringsFile = args[0];
        if (!stringsFile) {
          newHistory.push({ type: 'error', content: 'Usage: strings <file>' });
        } else {
          newHistory.push({ type: 'system', content: `Extracting strings from ${stringsFile}...` });
          newHistory.push({ type: 'output', content: 'FLAG{hidden_in_plain_sight}' });
          newHistory.push({ type: 'output', content: 'admin:$1$salt$hash' });
          newHistory.push({ type: 'output', content: 'TODO: Remove debug backdoor' });
          newHistory.push({ type: 'output', content: 'MOLTEN_CORE_ACCESS_KEY' });
          collectClue({
            id: 'strings-extract',
            name: 'Strings Extraction',
            description: 'Hidden strings found in binary',
            content: 'FLAG{hidden_in_plain_sight}',
            foundAt: new Date().toISOString()
          });
        }
        break;

      case 'binwalk':
        const binFile = args[0];
        if (!binFile) {
          newHistory.push({ type: 'error', content: 'Usage: binwalk <file>' });
        } else {
          newHistory.push({ type: 'system', content: `Analyzing ${binFile}...` });
          newHistory.push({ type: 'output', content: 'DECIMAL       HEXADECIMAL     DESCRIPTION' });
          newHistory.push({ type: 'output', content: '0             0x0             ELF 64-bit executable' });
          newHistory.push({ type: 'success', content: '4096          0x1000          Embedded ZIP archive' });
          newHistory.push({ type: 'warning', content: '8192          0x2000          Encrypted data block' });
        }
        break;

      // FILE COMMANDS
      case 'cat':
        const filename = args[0];
        if (!filename) {
          newHistory.push({ type: 'error', content: 'Usage: cat <filename>' });
        } else if (filename === '.manifest.json') {
          newHistory.push({ type: 'output', content: '{' });
          newHistory.push({ type: 'output', content: '  "route": "/void",' });
          newHistory.push({ type: 'output', content: '  "status": "unstable",' });
          newHistory.push({ type: 'output', content: '  "security": "breached",' });
          newHistory.push({ type: 'output', content: '  "hint": "The admin console watches all"' });
          newHistory.push({ type: 'output', content: '}' });
          collectClue({
            id: 'clue-manifest',
            name: 'Void Manifest',
            description: 'Route to the void.',
            content: '/void is accessible.',
            foundAt: new Date().toISOString()
          });
        } else if (filename === 'bronze_key.enc') {
          newHistory.push({ type: 'system', content: 'DECRYPTING...' });
          newHistory.push({ type: 'clue', content: '╔═══════════════════════════════╗' });
          newHistory.push({ type: 'clue', content: '║     KEY FRAGMENT DECRYPTED    ║' });
          newHistory.push({ type: 'clue', content: '╠═══════════════════════════════╣' });
          newHistory.push({ type: 'clue', content: '║  VALUE: 0xFE_MOLTEN_BRONZE    ║' });
          newHistory.push({ type: 'clue', content: '╚═══════════════════════════════╝' });
          collectClue({
            id: 'clue-key',
            name: 'Bronze Key Fragment',
            description: 'A partial cryptographic key.',
            content: '0xFE_MOLTEN_BRONZE',
            foundAt: new Date().toISOString()
          });
        } else if (filename === '.routes.conf') {
          newHistory.push({ type: 'output', content: '# SYSADMIN ROUTE CONFIGURATION' });
          newHistory.push({ type: 'output', content: '' });
          newHistory.push({ type: 'output', content: '/           -> public_facade' });
          newHistory.push({ type: 'output', content: '/terminal   -> shell_access' });
          newHistory.push({ type: 'output', content: '/void       -> null_sector' });
          newHistory.push({ type: 'output', content: '/admin      -> control_panel [RESTRICTED]' });
          newHistory.push({ type: 'output', content: '/archive    -> data_vault' });
          newHistory.push({ type: 'output', content: '/debug      -> diagnostics' });
          collectClue({
            id: 'clue-routes',
            name: 'Route Configuration',
            description: 'Hidden route map.',
            content: '/admin, /archive, /debug, /void exist',
            foundAt: new Date().toISOString()
          });
        } else if (filename === '.secrets') {
          newHistory.push({ type: 'warning', content: 'ACCESS DENIED: Root privileges required' });
          newHistory.push({ type: 'clue', content: 'HINT: Try exploiting a vulnerability first' });
        } else {
          newHistory.push({ type: 'error', content: `cat: ${filename}: No such file or directory` });
        }
        break;

      case 'probe':
        const route = args[0];
        if (!route) {
          newHistory.push({ type: 'error', content: 'Usage: probe <route>' });
        } else {
          newHistory.push({ type: 'system', content: `Scanning ${route}...` });
          const routes: Record<string, string[]> = {
            '/void': ['STATUS: ACCESSIBLE', 'SECURITY: NONE', 'CONTENT: null_sector_active'],
            '/admin': ['STATUS: ACCESSIBLE', 'SECURITY: NONE', 'CONTENT: control_panel'],
            '/archive': ['STATUS: ACCESSIBLE', 'SECURITY: CLUE_GATED', 'CONTENT: classified_files'],
            '/debug': ['STATUS: ACCESSIBLE', 'SECURITY: NONE', 'CONTENT: diagnostics'],
            '/api/whisper': ['STATUS: RESTRICTED', 'SECURITY: TOKEN_AUTH', 'CONTENT: ai_assistant'],
          };
          const results = routes[route];
          if (results) {
            results.forEach(r => newHistory.push({ type: 'output', content: r }));
          } else {
            newHistory.push({ type: 'error', content: `probe: Route ${route} not found` });
          }
        }
        break;

      case 'clear':
        setHistory([{ type: 'ascii', content: ASCII_LOGO }]);
        setInput('');
        return;

      case 'history':
        newHistory.push({ type: 'output', content: 'Command History:' });
        commandHistory.slice(-20).forEach((cmd, i) => {
          newHistory.push({ type: 'output', content: `  ${i + 1}  ${cmd}` });
        });
        break;

      case 'export':
        newHistory.push({ type: 'system', content: 'Generating session export...' });
        newHistory.push({ type: 'success', content: `Session: ${gameState.sessionToken.substring(0, 16)}` });
        newHistory.push({ type: 'output', content: `Clues: ${gameState.inventory.length}` });
        newHistory.push({ type: 'output', content: 'Use QR code modal on home page to export.' });
        break;
        
      case 'sudo':
        newHistory.push({ type: 'error', content: 'Nice try. Access denied.' });
        newHistory.push({ type: 'system', content: 'This incident will be reported.' });
        break;
        
      case 'exit':
      case 'quit':
        newHistory.push({ type: 'warning', content: 'There is no escape from SysAdmin Corp.' });
        break;
        
      default:
        if (trimmedCmd !== '') {
          newHistory.push({ type: 'error', content: `Command not found: ${command}` });
          newHistory.push({ type: 'output', content: 'Type "help" for available commands or "modules" for CTF tools.' });
        }
    }

    setHistory(h => [...h, ...newHistory]);
    setInput('');
    setHistoryIndex(-1);
  };

  const handleCrackGame = (input: string, newHistory: TerminalLine[]) => {
    if (input.toLowerCase() === 'exit') {
      setActiveMinigame(null);
      newHistory.push({ type: 'system', content: 'Exiting hash cracker...' });
      return;
    }

    const result = HASH_DB[input];
    if (result) {
      newHistory.push({ type: 'success', content: `[+] CRACKED: ${input} => ${result}` });
      collectClue({
        id: `crack-${input.substring(0, 8)}`,
        name: 'Cracked Hash',
        description: 'Successfully cracked a password hash',
        content: `${input.substring(0, 8)}... = ${result}`,
        foundAt: new Date().toISOString()
      });
    } else {
      newHistory.push({ type: 'warning', content: `[-] Hash not found in database: ${input}` });
      newHistory.push({ type: 'output', content: 'Try common MD5 hashes or the bronze key.' });
    }
    newHistory.push({ type: 'output', content: 'Enter another hash or "exit":' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion
      const commands = ['help', 'modules', 'whoami', 'ls', 'cd', 'cat', 'pwd', 'clear', 
        'nmap', 'netstat', 'ping', 'traceroute', 'dig', 'whois', 'curl',
        'ssh', 'crack', 'hashid', 'exploit', 'enum', 'gobuster', 'inject',
        'recon', 'dossier', 'social', 'shodan', 'exif',
        'decode', 'encode', 'rot13', 'xor', 'hex', 'strings', 'binwalk',
        'probe', 'inventory', 'history', 'export'];
      const matches = commands.filter(c => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      }
    }
  };

  return (
    <div 
      className="w-full h-[600px] bg-[#0a0500]/95 border border-amber-900/50 rounded-lg p-4 font-mono text-sm shadow-[0_0_30px_rgba(184,115,51,0.1)] relative overflow-hidden backdrop-blur-md"
      onClick={() => inputRef.current?.focus()}
      data-testid="terminal-container"
    >
      <div className="absolute top-0 left-0 w-full h-8 bg-amber-950/40 border-b border-amber-900/30 flex items-center px-4 space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-800/50"></div>
        <div className="w-3 h-3 rounded-full bg-amber-600/50"></div>
        <div className="w-3 h-3 rounded-full bg-stone-600/50"></div>
        <span className="ml-4 text-xs text-amber-700">guest@molten-core:{currentDir}</span>
        {activeMinigame && <span className="ml-auto text-xs text-amber-500">[{activeMinigame.toUpperCase()}]</span>}
      </div>
      
      <ScrollArea className="h-full pt-10 pb-4">
        <div className="space-y-1">
          {history.map((line, i) => (
            <div key={i} className={cn(
              "break-words whitespace-pre-wrap",
              line.type === 'input' && "text-stone-300 font-bold mt-3",
              line.type === 'output' && "text-amber-600 pl-2",
              line.type === 'error' && "text-red-600 pl-2",
              line.type === 'system' && "text-stone-500 italic",
              line.type === 'clue' && "text-amber-400 font-bold pl-2",
              line.type === 'ascii' && "text-amber-700/70 text-xs leading-none",
              line.type === 'success' && "text-amber-500 pl-2 font-bold",
              line.type === 'warning' && "text-orange-500 pl-2"
            )}>
              {line.content}
            </div>
          ))}
          <div className="flex items-center text-stone-300 font-bold mt-2">
            <span className="mr-2 text-amber-700">{currentDir}$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none flex-1 text-amber-500 font-mono placeholder-amber-900/50 caret-amber-500"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              data-testid="terminal-input"
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
