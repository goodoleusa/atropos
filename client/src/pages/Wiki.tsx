import { useState } from 'react';
import { Link } from 'wouter';
import { Book, Terminal, Bot, FileText, Settings, Zap, Target, Shield, ChevronRight, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

type WikiSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

export default function Wiki() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const sections: WikiSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Book className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Welcome to SysAdmin Corp</h2>
          <p className="text-stone-300 leading-relaxed">
            SysAdmin Corp is an interactive terminal-based CTF (Capture The Flag) experience that combines 
            escape room puzzles with cybersecurity investigation training. Navigate a fictional corporate 
            system, collect clues, complete quests, and uncover hidden secrets.
          </p>
          
          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Key Features</h3>
            <ul className="space-y-2 text-stone-300">
              <li className="flex items-start gap-2">
                <Terminal className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <span><strong>Custom Terminal:</strong> Interactive command-line interface with hidden commands and secrets</span>
              </li>
              <li className="flex items-start gap-2">
                <Bot className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                <span><strong>NEXUS AI Agent:</strong> AI-powered investigation assistant with multiple models and campaigns</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span><strong>Prompt Studio:</strong> Fine-tune AI behavior with modular capabilities and context compression</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <span><strong>Report Builder:</strong> Generate professional investigation reports with 70% auto-population</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                <span><strong>Quest System:</strong> Progressive challenges that unlock new content and capabilities</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Getting Started</h3>
            <ol className="list-decimal list-inside space-y-2 text-stone-300">
              <li>Start at the <strong>Terminal</strong> - type <code className="bg-stone-800 px-1 rounded">help</code> to see available commands</li>
              <li>Explore the system using commands like <code className="bg-stone-800 px-1 rounded">ls</code>, <code className="bg-stone-800 px-1 rounded">cat</code>, and <code className="bg-stone-800 px-1 rounded">scan</code></li>
              <li>Collect clues and complete quests to progress</li>
              <li>Use the <strong>NEXUS Agent</strong> for AI-assisted investigations</li>
              <li>Export findings to professional reports</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'terminal',
      title: 'Terminal Commands',
      icon: <Terminal className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Terminal Interface</h2>
          <p className="text-stone-300 leading-relaxed">
            The terminal is your primary interface for interacting with SysAdmin Corp's systems. 
            It simulates a Unix-like environment with custom commands for the game.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Basic Commands</h3>
            <div className="grid gap-3">
              {[
                { cmd: 'help', desc: 'Display available commands and their descriptions' },
                { cmd: 'ls [path]', desc: 'List contents of current or specified directory' },
                { cmd: 'cd <path>', desc: 'Change to specified directory' },
                { cmd: 'cat <file>', desc: 'Display contents of a file' },
                { cmd: 'pwd', desc: 'Print current working directory' },
                { cmd: 'clear', desc: 'Clear the terminal screen' },
                { cmd: 'whoami', desc: 'Display current user information' },
              ].map(({ cmd, desc }) => (
                <div key={cmd} className="flex gap-4 text-sm">
                  <code className="bg-stone-800 px-2 py-1 rounded text-teal-400 font-mono min-w-[120px]">{cmd}</code>
                  <span className="text-stone-300">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Investigation Commands</h3>
            <div className="grid gap-3">
              {[
                { cmd: 'scan', desc: 'Scan the current environment for clues and hidden elements' },
                { cmd: 'analyze <target>', desc: 'Perform deep analysis on a specific target' },
                { cmd: 'inventory', desc: 'View collected clues and items' },
                { cmd: 'quests', desc: 'View active and completed quests' },
                { cmd: 'hint', desc: 'Get a hint for the current objective (if available)' },
              ].map(({ cmd, desc }) => (
                <div key={cmd} className="flex gap-4 text-sm">
                  <code className="bg-stone-800 px-2 py-1 rounded text-teal-400 font-mono min-w-[140px]">{cmd}</code>
                  <span className="text-stone-300">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Hidden Commands</h3>
            <p className="text-stone-300 text-sm">
              Some commands are hidden and must be discovered through exploration. 
              Pay attention to clues in files, error messages, and environmental hints. 
              Hidden commands often unlock special content or advance the storyline.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'nexus-agent',
      title: 'NEXUS Agent',
      icon: <Bot className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">NEXUS AI Investigation Agent</h2>
          <p className="text-stone-300 leading-relaxed">
            NEXUS is your AI-powered investigation assistant. It helps analyze targets, 
            suggest attack vectors, interpret findings, and guide your investigation strategy.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Features</h3>
            <ul className="space-y-3 text-stone-300">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Multi-Model Support:</strong> Choose from different AI models (GPT-4, Claude, etc.) 
                  based on your needs and compare their responses
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Investigation Campaigns:</strong> Pre-built investigation flows for OSINT, 
                  BGP tracing, vulnerability assessment, and more
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Context Awareness:</strong> The agent remembers your conversation history 
                  and can reference earlier findings
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Export Integration:</strong> Seamlessly export conversations to 
                  investigation reports
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Investigation Campaigns</h3>
            <div className="grid gap-3">
              {[
                { name: 'OSINT Investigation', desc: 'Open-source intelligence gathering on targets' },
                { name: 'BGP Trace', desc: 'Analyze network routing and infrastructure' },
                { name: 'Vulnerability Assessment', desc: 'Systematic security evaluation' },
                { name: 'Threat Modeling', desc: 'Identify potential attack vectors and risks' },
                { name: 'Custom Investigation', desc: 'Free-form investigation with full AI assistance' },
              ].map(({ name, desc }) => (
                <div key={name} className="bg-stone-800/50 p-3 rounded">
                  <div className="font-medium text-teal-400">{name}</div>
                  <div className="text-sm text-stone-400">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Tips for Effective Use</h3>
            <ul className="list-disc list-inside space-y-1 text-stone-300 text-sm">
              <li>Be specific about your targets and objectives</li>
              <li>Share relevant context from your terminal discoveries</li>
              <li>Ask for tool recommendations and methodology guidance</li>
              <li>Use campaigns to structure complex investigations</li>
              <li>Export important findings to reports for later reference</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'prompt-studio',
      title: 'Prompt Studio',
      icon: <Zap className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Prompt Studio</h2>
          
          <div className="bg-teal-950/30 border border-teal-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-2">What is Prompt Studio?</h3>
            <p className="text-stone-300 leading-relaxed">
              Prompt Studio is your <strong>AI tuning control panel</strong>. It allows you to customize 
              how the NEXUS agent behaves by enabling/disabling capabilities, adjusting response parameters, 
              and optimizing context usage. Think of it as the "settings" for your AI assistant.
            </p>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Purpose & Benefits</h3>
            <ul className="space-y-3 text-stone-300">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-500 mt-1" />
                <div>
                  <strong>Focused Responses:</strong> Enable only the capabilities you need 
                  (e.g., OSINT tools only) to get more relevant, targeted advice
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-500 mt-1" />
                <div>
                  <strong>Token Optimization:</strong> Compress conversation history to fit more 
                  context within model limits, reducing costs and improving coherence
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Target className="w-4 h-4 text-red-500 mt-1" />
                <div>
                  <strong>Task Focus:</strong> Set a specific investigation goal so the AI 
                  prioritizes relevant information and suggestions
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="w-4 h-4 text-purple-500 mt-1" />
                <div>
                  <strong>Response Tuning:</strong> Adjust temperature (creativity) and 
                  max tokens (response length) for different investigation styles
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Capability Modules</h3>
            <p className="text-stone-400 text-sm mb-3">
              Toggle these modules to customize what the AI knows and can help with:
            </p>
            <div className="grid gap-2">
              {[
                { name: 'OSINT Tools', desc: 'Open-source intelligence gathering techniques' },
                { name: 'Network Analysis', desc: 'BGP, DNS, IP tracing capabilities' },
                { name: 'Vulnerability Research', desc: 'CVE lookups, exploit analysis' },
                { name: 'Social Engineering', desc: 'Phishing analysis, pretexting guidance' },
                { name: 'Malware Analysis', desc: 'Static/dynamic analysis techniques' },
                { name: 'Report Writing', desc: 'Professional documentation assistance' },
              ].map(({ name, desc }) => (
                <div key={name} className="flex items-center gap-3 bg-stone-800/50 p-2 rounded">
                  <div className="w-3 h-3 rounded border-2 border-teal-500" />
                  <div>
                    <span className="text-teal-400 font-medium">{name}</span>
                    <span className="text-stone-500 text-sm ml-2">— {desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Context Compression</h3>
            <p className="text-stone-300 text-sm mb-3">
              Long conversations can exceed AI model limits. Context compression intelligently 
              summarizes your conversation history to preserve key information while reducing token usage.
            </p>
            <div className="bg-stone-800/50 p-3 rounded">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-400">Original Context</span>
                <span className="text-amber-400">~8,000 tokens</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Compressed Context</span>
                <span className="text-green-400">~2,000 tokens (75% reduction)</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Model Battleground</h3>
            <p className="text-stone-300 text-sm">
              Compare responses from multiple AI models side-by-side. Send the same prompt to 
              different models and see which provides the best guidance for your specific use case.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'report-builder',
      title: 'Report Builder',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Investigation Reports</h2>
          <p className="text-stone-300 leading-relaxed">
            The Report Builder helps you create professional investigation reports from your 
            NEXUS agent conversations. It automatically extracts key intelligence and pre-fills 
            approximately 70% of the report structure.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Auto-Populated Sections</h3>
            <p className="text-stone-400 text-sm mb-3">
              These sections are automatically filled from your conversation:
            </p>
            <ul className="space-y-2 text-stone-300">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span><strong>Targets Identified:</strong> IPs, domains, organizations mentioned</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span><strong>Endpoints Discovered:</strong> URLs, APIs, services found</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span><strong>Technologies Detected:</strong> Software, frameworks, versions</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span><strong>Commands Run:</strong> Tools and commands executed</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span><strong>Potential Vulnerabilities:</strong> Security issues identified</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span><strong>AI Recommendations:</strong> Suggestions from NEXUS</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Human Input Sections</h3>
            <p className="text-stone-400 text-sm mb-3">
              These sections require your professional judgment:
            </p>
            <ul className="space-y-2 text-stone-300">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span><strong>Executive Summary:</strong> High-level overview for stakeholders</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span><strong>Risk Assessment:</strong> Business impact and severity ratings</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span><strong>Key Takeaways:</strong> Critical findings summary</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span><strong>Strategic Recommendations:</strong> Remediation guidance</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span><strong>Next Steps:</strong> Follow-up investigation actions</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">How to Export</h3>
            <ol className="list-decimal list-inside space-y-2 text-stone-300 text-sm">
              <li>Have a conversation with NEXUS about your investigation</li>
              <li>Click the <strong>Report</strong> button in the chat header</li>
              <li>A markdown file will download with pre-filled intelligence</li>
              <li>Open in any markdown editor and complete the human sections</li>
              <li>Each section includes guiding prompts to help you write</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'admin',
      title: 'Admin Dashboard',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Admin Dashboard</h2>
          <p className="text-stone-300 leading-relaxed">
            The Admin Dashboard provides content management and game configuration tools 
            for administrators. Access it at <code className="bg-stone-800 px-1 rounded">/admin</code>.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Content Management</h3>
            <ul className="space-y-2 text-stone-300">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <span><strong>Clues:</strong> Create, edit, and manage discoverable clues</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <span><strong>Quests:</strong> Define quest chains and objectives</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <span><strong>Messages:</strong> Configure terminal messages and toasts</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <span><strong>Mystical Elements:</strong> Manage tarot, zodiac, and thematic content</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">UX Playground</h3>
            <p className="text-stone-400 text-sm mb-3">
              Real-time visual effect tweaking for the game's atmosphere:
            </p>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li>• Background effects and gradients</li>
              <li>• Mouse tracking particle effects</li>
              <li>• Glitch and chaos overlay intensity</li>
              <li>• Event probabilities and timing</li>
              <li>• Mystical popup frequencies</li>
            </ul>
          </div>

          <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Access Control</h3>
            <p className="text-stone-300 text-sm">
              The admin dashboard requires authentication. Only users with admin privileges 
              can access and modify game content. Unauthorized access attempts are logged.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'game-mechanics',
      title: 'Game Mechanics',
      icon: <Target className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Game Mechanics</h2>
          
          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Clue System</h3>
            <p className="text-stone-300 text-sm mb-3">
              Clues are discoverable pieces of information scattered throughout the game. 
              They can be found by:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-300 text-sm">
              <li>Exploring directories and reading files</li>
              <li>Running scan commands in different locations</li>
              <li>Completing quests and objectives</li>
              <li>Discovering hidden commands</li>
              <li>Interacting with the NEXUS agent</li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Quest Progression</h3>
            <p className="text-stone-300 text-sm mb-3">
              Quests guide your investigation through the corporate mystery:
            </p>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span><strong>Active:</strong> Currently available objectives</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span><strong>Locked:</strong> Require prerequisites to unlock</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span><strong>Completed:</strong> Finished objectives</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Session Persistence</h3>
            <p className="text-stone-300 text-sm">
              Your progress is automatically saved. Game state includes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-300 text-sm mt-2">
              <li>Collected clues and inventory</li>
              <li>Quest progress and completions</li>
              <li>Discovered commands and secrets</li>
              <li>Terminal command history</li>
              <li>NEXUS conversation history</li>
            </ul>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Mystical Elements</h3>
            <p className="text-stone-300 text-sm">
              The game incorporates mystical themes including tarot cards, zodiac signs, 
              and quantum mechanics references. These elements appear through:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-300 text-sm mt-2">
              <li>Atmospheric popups and overlays</li>
              <li>Hidden easter eggs in the terminal</li>
              <li>Thematic clue connections</li>
              <li>Visual effects and animations</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = searchQuery 
    ? sections.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sections;

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r border-amber-900/30 bg-stone-950/50 p-4 flex flex-col">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-stone-400 hover:text-amber-400 mb-4">
                <Home className="w-4 h-4 mr-2" />
                Back to Game
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Book className="w-5 h-5" />
              Wiki
            </h1>
            <p className="text-xs text-stone-500 mt-1">SysAdmin Corp Documentation</p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <Input
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-stone-900/50 border-stone-800 text-stone-300 text-sm"
              data-testid="input-wiki-search"
            />
          </div>

          <ScrollArea className="flex-1">
            <nav className="space-y-1">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  data-testid={`nav-${section.id}`}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-amber-900/30 text-amber-400'
                      : 'text-stone-400 hover:text-amber-300 hover:bg-stone-800/50'
                  }`}
                >
                  {section.icon}
                  {section.title}
                </button>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-3xl">
            {activeContent?.content}
          </div>
        </main>
      </div>
    </div>
  );
}
