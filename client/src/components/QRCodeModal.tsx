import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from '@/hooks/useGameSession';
import { Download, Copy, Upload, QrCode, RefreshCw } from 'lucide-react';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QRCodeModal = ({ open, onOpenChange }: QRCodeModalProps) => {
  const { gameState, collectClue } = useGame();
  const [code, setCode] = useState('{"type":"secret","data":"HELLO_WORLD"}');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);

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
              Export Session
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-400">
              Import / Decode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-amber-700">Payload Code</label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-black/50 border-amber-900/30 text-amber-500 font-mono h-32 resize-none"
                placeholder='{"type":"secret","data":"your_message"}'
              />
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
