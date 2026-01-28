import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/hooks/useGameSession';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system' | 'clue' | 'ascii';
  content: string;
}

const ASCII_LOGO = `
  ███████╗██╗   ██╗███████╗ █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗
  ██╔════╝╚██╗ ██╔╝██╔════╝██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║
  ███████╗ ╚████╔╝ ███████╗███████║██║  ██║██╔████╔██║██║██╔██╗ ██║
  ╚════██║  ╚██╔╝  ╚════██║██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║
  ███████║   ██║   ███████║██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║
  ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝
                    MOLTEN CORE INTERFACE v4.0.2
`;

export const CustomTerminal = () => {
  const { gameState, collectClue } = useGame();
  
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'ascii', content: ASCII_LOGO },
    { type: 'system', content: 'Connection established via encrypted tunnel.' },
    { type: 'output', content: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const lowerCmd = trimmedCmd.toLowerCase();
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    setCommandHistory(prev => [...prev, trimmedCmd]);
    
    const newHistory = [...history, { type: 'input', content: trimmedCmd } as TerminalLine];

    switch (command) {
      case 'help':
        newHistory.push({ type: 'output', content: '╔══════════════════════════════════════╗' });
        newHistory.push({ type: 'output', content: '║        AVAILABLE COMMANDS            ║' });
        newHistory.push({ type: 'output', content: '╠══════════════════════════════════════╣' });
        newHistory.push({ type: 'output', content: '║  help       - Show this menu         ║' });
        newHistory.push({ type: 'output', content: '║  whoami     - Display user context   ║' });
        newHistory.push({ type: 'output', content: '║  ls         - List directory         ║' });
        newHistory.push({ type: 'output', content: '║  cat [file] - Read file contents     ║' });
        newHistory.push({ type: 'output', content: '║  inventory  - Show collected data    ║' });
        newHistory.push({ type: 'output', content: '║  netstat    - Show connections       ║' });
        newHistory.push({ type: 'output', content: '║  probe [r]  - Scan route             ║' });
        newHistory.push({ type: 'output', content: '║  decode [b] - Decode base64          ║' });
        newHistory.push({ type: 'output', content: '║  ssh [host] - Connect to host        ║' });
        newHistory.push({ type: 'output', content: '║  clear      - Clear terminal         ║' });
        newHistory.push({ type: 'output', content: '╚══════════════════════════════════════╝' });
        break;
        
      case 'whoami':
        newHistory.push({ type: 'output', content: `user: ${gameState.username}` });
        newHistory.push({ type: 'output', content: `token: ${gameState.sessionToken.substring(0,12)}...` });
        newHistory.push({ type: 'output', content: `access_level: GUEST` });
        newHistory.push({ type: 'output', content: `data_fragments: ${gameState.inventory.length}` });
        break;
        
      case 'inventory':
        if (gameState.inventory.length === 0) {
          newHistory.push({ type: 'output', content: 'No data fragments collected.' });
        } else {
          newHistory.push({ type: 'output', content: '┌─────────────────────────────────────┐' });
          newHistory.push({ type: 'output', content: '│      COLLECTED DATA FRAGMENTS       │' });
          newHistory.push({ type: 'output', content: '├─────────────────────────────────────┤' });
          gameState.inventory.forEach(item => {
            newHistory.push({ type: 'clue', content: `│ [${item.id}] ${item.name}` });
            newHistory.push({ type: 'output', content: `│   → ${item.content}` });
          });
          newHistory.push({ type: 'output', content: '└─────────────────────────────────────┘' });
        }
        break;
        
      case 'ls':
        newHistory.push({ type: 'output', content: 'drwxr-xr-x  2 root root 4096 Jan 28 index.html' });
        newHistory.push({ type: 'output', content: 'drwxr-xr-x  2 root root 4096 Jan 28 style.css' });
        newHistory.push({ type: 'output', content: '-rw-r--r--  1 root root 2048 Jan 28 main.js' });
        newHistory.push({ type: 'output', content: '-rw-------  1 root root  512 Jan 28 .manifest.json' });
        newHistory.push({ type: 'output', content: '-rw-------  1 root root  256 Jan 28 bronze_key.enc' });
        newHistory.push({ type: 'output', content: '-rw-------  1 root root 1024 Jan 28 .routes.conf' });
        break;
        
      case 'netstat':
        newHistory.push({ type: 'output', content: 'Active Internet connections:' });
        newHistory.push({ type: 'output', content: 'Proto  Local Address     Foreign Address      State' });
        newHistory.push({ type: 'output', content: 'tcp    0.0.0.0:5000     0.0.0.0:*            LISTEN' });
        newHistory.push({ type: 'output', content: 'tcp    0.0.0.0:8080     192.168.1.???:???    ESTABLISHED' });
        newHistory.push({ type: 'output', content: 'tcp    0.0.0.0:443      MOLTEN_CORE:6666     ENCRYPTED' });
        newHistory.push({ type: 'system', content: 'WARNING: Anomalous connection detected on port 6666' });
        break;
        
      case 'cat':
        const filename = args[0];
        if (!filename) {
          newHistory.push({ type: 'error', content: 'Usage: cat [filename]' });
        } else if (filename === '.manifest.json' || filename === '_hidden_manifest.json') {
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
          setTimeout(() => {
            setHistory(h => [
              ...h, 
              { type: 'clue', content: '╔═══════════════════════════════╗' },
              { type: 'clue', content: '║     KEY FRAGMENT DECRYPTED    ║' },
              { type: 'clue', content: '╠═══════════════════════════════╣' },
              { type: 'clue', content: '║  VALUE: 0xFE_MOLTEN_BRONZE    ║' },
              { type: 'clue', content: '╚═══════════════════════════════╝' }
            ]);
            collectClue({
              id: 'clue-key',
              name: 'Bronze Key Fragment',
              description: 'A partial cryptographic key.',
              content: '0xFE_MOLTEN_BRONZE',
              foundAt: new Date().toISOString()
            });
          }, 800);
        } else if (filename === '.routes.conf') {
          newHistory.push({ type: 'output', content: '# SYSADMIN ROUTE CONFIGURATION' });
          newHistory.push({ type: 'output', content: '# Last modified: REDACTED' });
          newHistory.push({ type: 'output', content: '' });
          newHistory.push({ type: 'output', content: '/           -> public_facade' });
          newHistory.push({ type: 'output', content: '/terminal   -> shell_access' });
          newHistory.push({ type: 'output', content: '/void       -> null_sector' });
          newHistory.push({ type: 'output', content: '/admin      -> control_panel [RESTRICTED]' });
          newHistory.push({ type: 'output', content: '/archive    -> data_vault [LOCKED]' });
          newHistory.push({ type: 'output', content: '/debug      -> diagnostics [LOCKED]' });
          collectClue({
            id: 'clue-routes',
            name: 'Route Configuration',
            description: 'Hidden route map.',
            content: '/admin, /archive, /debug exist',
            foundAt: new Date().toISOString()
          });
        } else {
          newHistory.push({ type: 'error', content: `cat: ${filename}: Permission denied or file not found` });
        }
        break;
        
      case 'ssh':
        const host = args[0];
        if (!host) {
          newHistory.push({ type: 'error', content: 'Usage: ssh [host]' });
        } else if (host === 'molten_core' || host === 'MOLTEN_CORE') {
          newHistory.push({ type: 'system', content: 'Attempting connection to MOLTEN_CORE...' });
          newHistory.push({ type: 'system', content: 'Handshake initiated...' });
          setTimeout(() => {
            setHistory(h => [
              ...h,
              { type: 'error', content: 'CONNECTION REFUSED: Temperature threshold exceeded' },
              { type: 'system', content: 'Core temperature: 1,984°C' },
              { type: 'clue', content: 'HINT: The core only accepts connections from /void' }
            ]);
          }, 1500);
        } else {
          newHistory.push({ type: 'error', content: `ssh: Could not resolve hostname ${host}` });
        }
        break;
        
      case 'probe':
        const route = args[0];
        if (!route) {
          newHistory.push({ type: 'error', content: 'Usage: probe [route]' });
        } else {
          newHistory.push({ type: 'system', content: `Scanning ${route}...` });
          setTimeout(() => {
            const routes: Record<string, string[]> = {
              '/void': ['STATUS: ACCESSIBLE', 'SECURITY: NONE', 'CONTENT: null_sector_active'],
              '/admin': ['STATUS: ACCESSIBLE', 'SECURITY: FAKE_AUTH', 'CONTENT: control_panel'],
              '/archive': ['STATUS: NOT IMPLEMENTED', 'SECURITY: N/A', 'CONTENT: data_vault_planned'],
              '/debug': ['STATUS: NOT IMPLEMENTED', 'SECURITY: N/A', 'CONTENT: diagnostics_planned'],
            };
            const results = routes[route];
            if (results) {
              results.forEach(r => setHistory(h => [...h, { type: 'output', content: r }]));
            } else {
              setHistory(h => [...h, { type: 'error', content: `probe: Route ${route} not found in scan database` }]);
            }
          }, 1000);
        }
        break;
        
      case 'decode':
        const encoded = args[0];
        if (!encoded) {
          newHistory.push({ type: 'error', content: 'Usage: decode [base64_string]' });
        } else {
          try {
            const decoded = atob(encoded);
            newHistory.push({ type: 'output', content: `DECODED: ${decoded}` });
          } catch {
            newHistory.push({ type: 'error', content: 'decode: Invalid base64 string' });
          }
        }
        break;
        
      case 'clear':
        setHistory([{ type: 'ascii', content: ASCII_LOGO }]);
        setInput('');
        return;
        
      case 'sudo':
        newHistory.push({ type: 'error', content: 'Nice try. Access denied.' });
        newHistory.push({ type: 'system', content: 'This incident will be reported.' });
        break;
        
      case 'exit':
      case 'quit':
        newHistory.push({ type: 'system', content: 'There is no escape.' });
        break;
        
      default:
        if (trimmedCmd !== '') {
          newHistory.push({ type: 'error', content: `Command not found: ${command}` });
          newHistory.push({ type: 'output', content: 'Type "help" for available commands.' });
        }
    }

    setHistory(newHistory);
    setInput('');
    setHistoryIndex(-1);
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
    }
  };

  return (
    <div 
      className="w-full h-[600px] bg-[#0a0500]/95 border border-amber-900/50 rounded-lg p-4 font-mono text-sm md:text-base shadow-[0_0_30px_rgba(184,115,51,0.1)] relative overflow-hidden backdrop-blur-md"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="absolute top-0 left-0 w-full h-8 bg-amber-950/40 border-b border-amber-900/30 flex items-center px-4 space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-800/50"></div>
        <div className="w-3 h-3 rounded-full bg-amber-600/50"></div>
        <div className="w-3 h-3 rounded-full bg-stone-600/50"></div>
        <span className="ml-4 text-xs text-amber-700">guest@molten-core:~</span>
      </div>
      
      <ScrollArea className="h-full pt-10 pb-4">
        <div className="space-y-1">
          {history.map((line, i) => (
            <div key={i} className={cn(
              "break-words whitespace-pre-wrap",
              line.type === 'input' && "text-stone-300 font-bold mt-3",
              line.type === 'output' && "text-amber-600 pl-2",
              line.type === 'error' && "text-red-700 pl-2",
              line.type === 'system' && "text-stone-500 italic",
              line.type === 'clue' && "text-amber-400 font-bold pl-2",
              line.type === 'ascii' && "text-amber-700/70 text-xs leading-none"
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
              className="bg-transparent border-none outline-none flex-1 text-amber-500 font-mono placeholder-amber-900/50 caret-amber-500"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
