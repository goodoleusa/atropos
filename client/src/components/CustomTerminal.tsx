import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/hooks/useGameSession';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system' | 'clue';
  content: string;
}

export const CustomTerminal = () => {
  const { gameState, collectClue } = useGame();
  
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: 'SysAdmin Corp. MoltenCore [Version 4.0.2]' },
    { type: 'system', content: 'Secure Shell (SSH) Connection Established.' },
    { type: 'output', content: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const newHistory = [...history, { type: 'input', content: cmd } as TerminalLine];

    switch (trimmedCmd) {
      case 'help':
        newHistory.push({ type: 'output', content: 'AVAILABLE COMMANDS:' });
        newHistory.push({ type: 'output', content: '  help       - Show this menu' });
        newHistory.push({ type: 'output', content: '  whoami     - Display current user context' });
        newHistory.push({ type: 'output', content: '  ls         - List directory contents' });
        newHistory.push({ type: 'output', content: '  inventory  - Show collected data fragments' });
        newHistory.push({ type: 'output', content: '  clear      - Clear terminal screen' });
        break;
      case 'whoami':
        newHistory.push({ type: 'output', content: `guest@${gameState.sessionToken.substring(0,8)}` });
        break;
      case 'inventory':
        if (gameState.inventory.length === 0) {
            newHistory.push({ type: 'output', content: 'No data fragments collected.' });
        } else {
            newHistory.push({ type: 'output', content: '--- COLLECTED DATA FRAGMENTS ---' });
            gameState.inventory.forEach(item => {
                newHistory.push({ type: 'clue', content: `[${item.id}] ${item.name}: ${item.content}` });
            });
        }
        break;
      case 'ls':
        newHistory.push({ type: 'output', content: 'index.html  style.css  main.js  _hidden_manifest.json  bronze_key.enc' });
        break;
      case 'cat _hidden_manifest.json':
        newHistory.push({ type: 'output', content: '{"route": "/void", "status": "unstable", "security": "breached"}' });
        collectClue({
            id: 'clue-manifest',
            name: 'Void Manifest',
            description: 'Route to the void.',
            content: '/void is accessible.',
            foundAt: new Date().toISOString()
        });
        break;
      case 'cat bronze_key.enc':
        newHistory.push({ type: 'system', content: 'DECRYPTING...' });
        setTimeout(() => {
            setHistory(h => [...h, { type: 'clue', content: 'KEY FRAGMENT: "0xFE_MOLTEN"' }]);
             collectClue({
                id: 'clue-key',
                name: 'Bronze Key Fragment',
                description: 'A partial cryptographic key.',
                content: '0xFE_MOLTEN',
                foundAt: new Date().toISOString()
            });
        }, 1000);
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      default:
        if (trimmedCmd.startsWith('cat')) {
             newHistory.push({ type: 'error', content: `Access denied: ${trimmedCmd.split(' ')[1] || 'file'} is encrypted or does not exist.` });
        } else if (trimmedCmd !== '') {
            newHistory.push({ type: 'error', content: `Command not found: ${trimmedCmd}` });
        }
    }

    setHistory(newHistory);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  return (
    <div className="w-full h-[600px] bg-[#0f0a05]/95 border border-amber-900/50 rounded-lg p-4 font-mono text-sm md:text-base shadow-[0_0_20px_rgba(184,115,51,0.1)] relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 left-0 w-full h-8 bg-amber-950/40 border-b border-amber-900/30 flex items-center px-4 space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-800/50"></div>
        <div className="w-3 h-3 rounded-full bg-amber-600/50"></div>
        <div className="w-3 h-3 rounded-full bg-stone-600/50"></div>
        <span className="ml-4 text-xs text-amber-700">guest@sysadmin-core:~</span>
      </div>
      
      <ScrollArea className="h-full pt-10 pb-4">
        <div className="space-y-1">
          {history.map((line, i) => (
            <div key={i} className={cn(
              "break-words",
              line.type === 'input' && "text-stone-300 font-bold mt-4",
              line.type === 'output' && "text-amber-600 pl-4",
              line.type === 'error' && "text-red-900/80 pl-4",
              line.type === 'system' && "text-stone-500 italic",
              line.type === 'clue' && "text-amber-400 font-bold pl-4 border-l-2 border-amber-500 ml-4 bg-amber-900/10 p-1"
            )}>
              {line.type === 'input' ? '> ' : ''}{line.content}
            </div>
          ))}
          <div className="flex items-center text-stone-300 font-bold mt-2">
            <span className="mr-2 text-amber-700">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none flex-1 text-amber-500 font-mono placeholder-amber-900/50"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              placeholder="_"
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
