import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGame } from '@/hooks/useGameSession';
import { Download, Copy, Upload, QrCode, RefreshCw, Zap, Bot, Play } from 'lucide-react';

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
  const { gameState, collectClue } = useGame();
  const [code, setCode] = useState(QR_ACTION_PRESETS[0].template);
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);
  const [agentResult, setAgentResult] = useState<string | null>(null);

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
          <TabsList className="bg-amber-950/30 border border-amber-900/30">
            <TabsTrigger value="generate" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400">
              Generate
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400">
              Export
            </TabsTrigger>
            <TabsTrigger value="agent" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400">
              <Bot className="w-3 h-3 mr-1" /> Agent
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400">
              Decode
            </TabsTrigger>
          </TabsList>

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
