import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

export const CustomTerminal = () => {
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: 'SysAdmin Corp. Mainframe [Version 4.0.2]' },
    { type: 'system', content: '(c) 2024 SysAdmin Corp. All rights reserved.' },
    { type: 'system', content: 'Connection established via secure shell.' },
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
        newHistory.push({ type: 'output', content: '  help     - Show this menu' });
        newHistory.push({ type: 'output', content: '  whoami   - Display current user context' });
        newHistory.push({ type: 'output', content: '  ls       - List directory contents' });
        newHistory.push({ type: 'output', content: '  clear    - Clear terminal screen' });
        break;
      case 'whoami':
        newHistory.push({ type: 'output', content: 'guest@sysadmin-corp-public-access' });
        break;
      case 'ls':
        newHistory.push({ type: 'output', content: 'index.html  style.css  main.js  _hidden_manifest.json' });
        break;
      case 'cat _hidden_manifest.json':
        newHistory.push({ type: 'output', content: '{"route": "/void", "status": "unstable", "security": "breached"}' });
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
    <div className="w-full h-[600px] bg-black/90 border border-green-900/50 rounded-lg p-4 font-mono text-sm md:text-base shadow-[0_0_20px_rgba(0,255,0,0.1)] relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 left-0 w-full h-8 bg-green-900/20 border-b border-green-900/30 flex items-center px-4 space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        <span className="ml-4 text-xs text-green-500/70">guest@sysadmin-corp:~</span>
      </div>
      
      <ScrollArea className="h-full pt-10 pb-4">
        <div className="space-y-1">
          {history.map((line, i) => (
            <div key={i} className={cn(
              "break-words",
              line.type === 'input' && "text-white font-bold mt-4",
              line.type === 'output' && "text-green-400 pl-4",
              line.type === 'error' && "text-red-500 pl-4",
              line.type === 'system' && "text-blue-400 italic"
            )}>
              {line.type === 'input' ? '> ' : ''}{line.content}
            </div>
          ))}
          <div className="flex items-center text-white font-bold mt-2">
            <span className="mr-2 text-green-500">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none flex-1 text-white font-mono"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            <div className="w-2 h-5 bg-green-500 animate-pulse ml-1"></div>
          </div>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
