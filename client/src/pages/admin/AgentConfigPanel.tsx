import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Bot, Terminal, Layers, Edit, Save } from "lucide-react";

export function AgentConfigPanel() {
  const [corePrompt, setCorePrompt] = useState('');
  const [enabledModules, setEnabledModules] = useState<string[]>(['payload_exec', 'terminal_cmds', 'osint_recon']);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const MODULES = [
    { id: 'payload_exec', name: 'Payload Execution', desc: 'Parse and execute JSON payloads for CTF tasks' },
    { id: 'terminal_cmds', name: 'Terminal Commands', desc: 'nmap, ssh, crack, decode, ls, cat, find, grep' },
    { id: 'clue_system', name: 'Clue Collection', desc: 'Track clue IDs, locations, unlock conditions' },
    { id: 'crypto_puzzles', name: 'Crypto Puzzles', desc: 'rot13, base64, hex, caesar, vigenere ciphers' },
    { id: 'osint_recon', name: 'OSINT Recon', desc: 'Enumerate routes, clues, session state' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('nexus_agent_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setCorePrompt(config.corePrompt || '');
        setEnabledModules(config.enabledModules || ['payload_exec', 'terminal_cmds', 'osint_recon']);
        setCustomInstructions(config.customInstructions || '');
      } catch {}
    }
  }, []);

  const saveConfig = () => {
    setIsSaving(true);
    const config = { corePrompt, enabledModules, customInstructions };
    localStorage.setItem('nexus_agent_config', JSON.stringify(config));
    setTimeout(() => setIsSaving(false), 500);
  };

  const toggleModule = (moduleId: string) => {
    setEnabledModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-orbitron text-cyan-400 flex items-center gap-2">
          <Bot className="w-5 h-5" /> NEXUS Agent Configuration
        </h3>
        <Button onClick={saveConfig} disabled={isSaving} className="bg-cyan-800 hover:bg-cyan-700 text-white min-h-[48px] touch-manipulation" data-testid="save-agent-config">
          <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saved!' : 'Save Config'}
        </Button>
      </div>

      <Card className="bg-[#0a0500] border-cyan-900/30">
        <CardHeader>
          <CardTitle className="text-cyan-500 text-sm font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Core Identity (Base System Prompt)
          </CardTitle>
          <CardDescription className="text-stone-500">
            This is always included. Override the default NEXUS identity here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={corePrompt}
            onChange={(e) => setCorePrompt(e.target.value)}
            placeholder="NEXUS v2.0 | SysAdmin Corp Terminal Agent&#10;Role: CTF/OSINT assistant, payload interpreter, system navigator&#10;Context: Escape room game with hidden routes, QR mechanics, clue collection"
            className="bg-stone-900 border-cyan-900/50 text-stone-300 font-mono text-sm min-h-[120px]"
            data-testid="core-prompt-input"
          />
          <p className="text-xs text-stone-600 mt-2">Leave empty to use default. This sets the agent's personality and role.</p>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0500] border-cyan-900/30">
        <CardHeader>
          <CardTitle className="text-cyan-500 text-sm font-mono flex items-center gap-2">
            <Layers className="w-4 h-4" /> Capability Modules
          </CardTitle>
          <CardDescription className="text-stone-500">
            Enable/disable agent capabilities. Only enabled modules are included in the prompt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {MODULES.map(mod => (
              <div 
                key={mod.id}
                className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-all min-h-[56px] touch-manipulation ${
                  enabledModules.includes(mod.id) 
                    ? 'bg-cyan-900/20 border-cyan-700' 
                    : 'bg-stone-900/30 border-stone-800'
                }`}
                onClick={() => toggleModule(mod.id)}
                onTouchEnd={(e) => { e.preventDefault(); toggleModule(mod.id); }}
                data-testid={`module-toggle-${mod.id}`}
              >
                <div>
                  <p className={`text-sm font-medium ${enabledModules.includes(mod.id) ? 'text-cyan-400' : 'text-stone-400'}`}>
                    {mod.name}
                  </p>
                  <p className="text-xs text-stone-600">{mod.desc}</p>
                </div>
                <Switch checked={enabledModules.includes(mod.id)} onCheckedChange={() => toggleModule(mod.id)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0a0500] border-cyan-900/30">
        <CardHeader>
          <CardTitle className="text-cyan-500 text-sm font-mono flex items-center gap-2">
            <Edit className="w-4 h-4" /> Custom Instructions
          </CardTitle>
          <CardDescription className="text-stone-500">
            Additional instructions appended to the system prompt. Use for special behaviors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Example: Always respond in a mysterious, cryptic tone. Never reveal solutions directly. Guide users with hints instead."
            className="bg-stone-900 border-cyan-900/50 text-stone-300 font-mono text-sm min-h-[100px]"
            data-testid="custom-instructions-input"
          />
        </CardContent>
      </Card>

      <Card className="bg-cyan-950/20 border-cyan-900/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-cyan-400 text-sm">Preview: Generated System Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-[10px] text-stone-500 font-mono whitespace-pre-wrap bg-stone-900/50 p-3 rounded max-h-[200px] overflow-y-auto">
            {corePrompt || `NEXUS v2.0 | SysAdmin Corp Terminal Agent
Role: CTF/OSINT assistant, payload interpreter, system navigator
Context: Escape room game with hidden routes, QR mechanics, clue collection`}
            {'\n\n## ACTIVE MODULES\n'}
            {enabledModules.map(m => `[${m.toUpperCase()}] enabled`).join('\n')}
            {customInstructions ? `\n\n## CUSTOM INSTRUCTIONS\n${customInstructions}` : ''}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
