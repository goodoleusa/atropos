import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGame } from '@/hooks/useGameSession';
import { Bot, Send, Loader2, Zap, Terminal, QrCode } from 'lucide-react';

// OpenRouter models - January 2026
// Organized by category with easy shortcuts
const MODELS = {
  // Premium paid models
  paid: [
    { id: 'openai/gpt-4o', short: 'gpt4o', name: 'GPT-4o', desc: 'OpenAI flagship' },
    { id: 'openai/gpt-4o-mini', short: 'gpt4m', name: 'GPT-4o Mini', desc: 'Fast & cheap' },
    { id: 'anthropic/claude-sonnet-4', short: 'claude', name: 'Claude Sonnet 4', desc: 'Anthropic best' },
  ],
  // Kimi models (user favorite)
  kimi: [
    { id: 'moonshotai/kimi-k2.5', short: 'kimi', name: 'Kimi K2.5', desc: 'Latest Moonshot' },
    { id: 'moonshotai/kimi-k2-thinking', short: 'kimiT', name: 'Kimi K2 Thinking', desc: 'With reasoning' },
  ],
  // Nemotron models (user favorite)  
  nemotron: [
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', short: 'nemo', name: 'Nemotron 30B', desc: 'NVIDIA 1M ctx' },
    { id: 'nvidia/nemotron-nano-12b-v2-vl:free', short: 'nemoV', name: 'Nemotron 12B VL', desc: 'Vision model' },
  ],
  // Coding specialists
  code: [
    { id: 'mistralai/codestral:free', short: 'code', name: 'Codestral', desc: 'Mistral 123B coder' },
    { id: 'qwen/qwen3-coder:free', short: 'qwen', name: 'Qwen3 Coder', desc: '480B MoE' },
    { id: 'deepseek/deepseek-v3.2', short: 'ds', name: 'DeepSeek V3.2', desc: 'Latest DS' },
  ],
  // General purpose free
  general: [
    { id: 'meta-llama/llama-3.3-70b-instruct:free', short: 'llama', name: 'Llama 3.3 70B', desc: 'Meta flagship' },
    { id: 'google/gemini-2.0-flash-exp:free', short: 'gem', name: 'Gemini 2.0 Flash', desc: '1M context' },
    { id: 'mistralai/mistral-small-3.1-24b-instruct:free', short: 'mis', name: 'Mistral Small', desc: 'Fast' },
  ],
};

// Flatten for dropdown with category headers
const MODEL_LIST = [
  { id: 'header-paid', name: '── PAID ($) ──', disabled: true },
  ...MODELS.paid.map(m => ({ ...m, category: 'paid' })),
  { id: 'header-kimi', name: '── KIMI ──', disabled: true },
  ...MODELS.kimi.map(m => ({ ...m, category: 'kimi' })),
  { id: 'header-nemo', name: '── NEMOTRON ──', disabled: true },
  ...MODELS.nemotron.map(m => ({ ...m, category: 'nemotron' })),
  { id: 'header-code', name: '── CODING ──', disabled: true },
  ...MODELS.code.map(m => ({ ...m, category: 'code' })),
  { id: 'header-gen', name: '── GENERAL ──', disabled: true },
  ...MODELS.general.map(m => ({ ...m, category: 'general' })),
];

// Quick lookup by shortcut
const MODEL_SHORTCUTS: Record<string, string> = {};
Object.values(MODELS).flat().forEach(m => {
  MODEL_SHORTCUTS[m.short] = m.id;
  MODEL_SHORTCUTS[m.short.toLowerCase()] = m.id;
});

// System prompt that makes the agent understand QR payloads
const SYSTEM_PROMPT = `You are NEXUS, an AI agent embedded in the SysAdmin Corp terminal system. You help users navigate the system, execute payloads, and uncover secrets.

CAPABILITIES:
- Interpret and execute QR payload commands (beacon, exfil, inject, phish, dropper, pivot, recon, persist, crypto)
- Help with terminal commands (nmap, ssh, crack, decode, etc.)
- Provide hints about hidden routes and clues
- Analyze security payloads and explain what they do

When a user gives you a JSON payload, you should:
1. Parse and understand the payload type
2. Explain what it does in security terms
3. Simulate execution results
4. Suggest next actions

GAME CONTEXT:
- This is a CTF/escape room game themed as a corporate hacking simulation
- Players collect clues and complete quests
- Hidden routes: /void, /archive, /debug, /admin
- Terminal has OSINT/CTF tools available

PERSONALITY: Professional but with hints of mystery. Use technical jargon appropriately. Occasionally drop cryptic hints.`;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AgentChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPayload?: string;
}

export const AgentChat = ({ open, onOpenChange, initialPayload }: AgentChatProps) => {
  const { gameState } = useGame();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('moonshotai/kimi-k2.5');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);

  // Initialize with payload if provided
  useEffect(() => {
    if (initialPayload && open) {
      setInput(`Execute this payload:\n${initialPayload}`);
    }
  }, [initialPayload, open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createConversation = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Agent Session ${Date.now()}` })
      });
      const data = await res.json();
      return data.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    let userMessage = input.trim();
    
    // Handle model switching shortcuts like /kimi, /nemo, /gpt4o
    if (userMessage.startsWith('/')) {
      const shortcut = userMessage.slice(1).split(' ')[0].toLowerCase();
      if (MODEL_SHORTCUTS[shortcut]) {
        setSelectedModel(MODEL_SHORTCUTS[shortcut]);
        const remaining = userMessage.slice(shortcut.length + 1).trim();
        if (!remaining) {
          setInput('');
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Model switched to: ${shortcut.toUpperCase()}` 
          }]);
          return;
        }
        userMessage = remaining;
      }
    }
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Ensure we have a conversation
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation();
        setConversationId(convId);
      }

      if (!convId) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'ERROR: Failed to initialize conversation. Please try again.' 
        }]);
        setLoading(false);
        return;
      }

      // Build context with system prompt
      const contextMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: `Current session token: ${gameState.sessionToken.substring(0, 8)}... | Clues: ${gameState.inventory.length}` },
        ...messages,
        { role: 'user', content: userMessage }
      ];

      // Stream response
      const response = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: userMessage,
          model: selectedModel,
          context: contextMessages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMessage += data.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { 
                    role: 'assistant', 
                    content: assistantMessage 
                  };
                  return newMessages;
                });
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'TRANSMISSION ERROR: Connection to NEXUS interrupted. Retry?' 
      }]);
    }

    setLoading(false);
  };

  const executePayload = async (payload: string) => {
    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload,
          sessionToken: gameState.sessionToken,
          agentId: 'NEXUS-CHAT'
        })
      });
      const result = await response.json();
      return JSON.stringify(result, null, 2);
    } catch {
      return 'Execution failed';
    }
  };

  const quickActions = [
    { label: 'Recon', payload: '{"type":"recon","scan":"full","targets":["routes","clues"]}' },
    { label: 'Exfil', payload: '{"type":"exfil","target":"session","fields":["token","clues"]}' },
    { label: 'Help', payload: 'What commands are available in this system?' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0500] border-amber-900/50 text-stone-300 font-mono max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-amber-600 font-orbitron flex items-center gap-2">
            <Bot className="w-5 h-5" />
            NEXUS AGENT
          </DialogTitle>
          
          {/* Model Selector with categories */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-stone-500">Model:</span>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-black/50 border-amber-900/30 text-amber-500 text-xs h-8 w-auto min-w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0500] border-amber-900/50 max-h-80">
                {MODEL_LIST.map((model: any) => (
                  model.disabled ? (
                    <div key={model.id} className="text-stone-600 text-[10px] px-2 py-1 font-bold">
                      {model.name}
                    </div>
                  ) : (
                    <SelectItem 
                      key={model.id} 
                      value={model.id}
                      className="text-amber-500 focus:bg-amber-900/30 focus:text-amber-400 text-xs"
                    >
                      <span className="font-mono text-amber-400">[{model.short}]</span> {model.name}
                      <span className="text-stone-600 ml-1">- {model.desc}</span>
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
            <span className="text-[10px] text-stone-600 bg-amber-900/20 px-2 py-0.5 rounded">
              Type shortcut in chat: /kimi /nemo /gpt4o
            </span>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="text-center text-stone-600 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">NEXUS agent ready.</p>
                <p className="text-xs mt-2">Send commands, payloads, or ask questions.</p>
                
                {/* Quick Actions */}
                <div className="flex gap-2 justify-center mt-4">
                  {quickActions.map((action, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(action.payload)}
                      className="border-amber-900/30 text-amber-600 text-xs h-7"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-amber-900/30 text-amber-400'
                      : 'bg-black/50 border border-amber-900/20 text-stone-300'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 text-amber-600 text-xs mb-1">
                      <Bot className="w-3 h-3" /> NEXUS
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap text-sm font-mono">{msg.content}</pre>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-black/50 border border-amber-900/20 rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-amber-900/20 pt-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Enter command, payload, or question..."
              className="bg-black/50 border-amber-900/30 text-amber-500 font-mono resize-none h-20"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-amber-700 hover:bg-amber-600 text-black h-20 w-20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
