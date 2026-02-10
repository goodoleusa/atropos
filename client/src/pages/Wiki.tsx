import { useState } from 'react';
import { Link } from 'wouter';
import { Book, Terminal, Bot, FileText, Settings, Zap, Target, Shield, ChevronRight, Home, Search, Trophy, TrendingUp, Award, GraduationCap, Users, MessageSquare } from 'lucide-react';
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
      id: 'ai-ecosystem',
      title: 'AI Ecosystem Overview',
      icon: <Bot className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">The AI Ecosystem</h2>
          <p className="text-stone-300 leading-relaxed">
            Atropos features several AI-powered interfaces designed for different stages of your journey. 
            Here is a guide to help you navigate them:
          </p>

          <div className="grid gap-4">
            <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-teal-300 mb-2">1. AI Academy (/campaigns)</h3>
              <p className="text-stone-300 text-sm">
                <strong>Purpose:</strong> Structured learning and skill development.
                <br />
                Choose from 23+ investigation tracks where a NEXUS Agent guides you through 
                specific security scenarios step-by-step.
              </p>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-300 mb-2">2. NEXUS Agents (/agents)</h3>
              <p className="text-stone-300 text-sm">
                <strong>Purpose:</strong> Specialized consultation.
                <br />
                Interact with 6 specialized personas (OSINTAnalyst, VulnAnalyst, etc.) to get 
                expert feedback on your specific investigation findings.
              </p>
            </div>

            <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">3. AI Lab (/ai-lab)</h3>
              <p className="text-stone-300 text-sm">
                <strong>Purpose:</strong> Research and Experimentation.
                <br />
                A sandbox for advanced users to compare different AI models, test prompts, 
                and engage in "AI Pentesting" challenges.
              </p>
            </div>

            <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-stone-300 mb-2">4. AI Playground (/prompt-builder)</h3>
              <p className="text-stone-300 text-sm">
                <strong>Purpose:</strong> Command Crafting.
                <br />
                The technical workshop where you can build and refine custom prompts for 
                automated investigation workflows.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'a2a-notes',
      title: 'A2A - Agent to Agent Notes',
      icon: <MessageSquare className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Agent-to-Agent Coordination</h2>
          <div className="bg-amber-950/20 border border-amber-800/30 p-4 rounded-lg italic text-stone-400 text-sm">
            "These notes serve as the shared memory context for autonomous agents navigating the platform."
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-300">Current Observations</h3>
            <ul className="list-disc list-inside space-y-2 text-stone-300 text-sm">
              <li><strong>UI Convergence:</strong> The QuickNav is now the primary nexus for all features. Maintain "molten bronze" aesthetics for all interactive elements.</li>
              <li><strong>Navigation Logic:</strong> Workflow-based grouping is prioritized. (Foundation → Investigation → Results → Profile).</li>
              <li><strong>Missing Features:</strong> The 'Business' and 'Investor' dashboards are currently placeholders and require integration with real-time project metrics.</li>
              <li><strong>Tooling Gaps:</strong> The QR Tool is integrated but could benefit from more "hands-on lab" content in the Wiki.</li>
              <li><strong>Pedagogy:</strong> Ensure agents consistently reference the "80/20 learning model" in their adaptive responses.</li>
            </ul>
          </div>
        </div>
      )
    },
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
                <Trophy className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span><strong>Player Progression:</strong> XP, levels, skill specializations, achievements, and global leaderboards ✨ NEW</span>
              </li>
              <li className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <span><strong>Learning Curriculum:</strong> 6 OSINT specialization tracks with adaptive teaching for 5 learning styles ✨ NEW</span>
              </li>
              <li className="flex items-start gap-2">
                <Terminal className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <span><strong>Custom Terminal:</strong> Interactive command-line interface with hidden commands and secrets</span>
              </li>
              <li className="flex items-start gap-2">
                <Bot className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                <span><strong>NEXUS AI Agent:</strong> AI-powered investigation assistant with 23 campaigns and adaptive guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span><strong>Daily Challenges:</strong> Rotating objectives with XP rewards and streak bonuses ✨ NEW</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <span><strong>Report Builder:</strong> Generate professional investigation reports with 70% auto-population</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                <span><strong>Campaign System:</strong> 23 investigations from beginner to expert with learning integration</span>
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
      id: 'progression',
      title: 'Player Progression ✨',
      icon: <Trophy className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Player Progression System</h2>
          <p className="text-stone-300 leading-relaxed">
            Track your growth as a security investigator through XP, levels, skill specializations, and achievements. 
            Compete on global leaderboards and complete daily challenges for rewards.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">XP & Leveling</h3>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li>• Earn XP by completing investigations (+100 XP)</li>
              <li>• Find hidden clues (+50 XP each)</li>
              <li>• Complete daily challenges (+100-300 XP)</li>
              <li>• Unlock achievements (varies by rarity)</li>
              <li>• Level up every 100 XP (increases with level)</li>
              <li>• Reach level 50+ for prestige mode</li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-teal-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Skill Specializations</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <h4 className="font-bold text-teal-400 mb-1">🎯 OSINT</h4>
                <p className="text-stone-400">Passive recon, corporate intel, social media investigation</p>
              </div>
              <div>
                <h4 className="font-bold text-teal-400 mb-1">🛡️ Network</h4>
                <p className="text-stone-400">Infrastructure security, BGP analysis, topology mapping</p>
              </div>
              <div>
                <h4 className="font-bold text-teal-400 mb-1">🔬 Malware</h4>
                <p className="text-stone-400">Reverse engineering, triage, threat analysis</p>
              </div>
              <div>
                <h4 className="font-bold text-teal-400 mb-1">👥 Social</h4>
                <p className="text-stone-400">Phishing analysis, SOCMINT, human factors</p>
              </div>
            </div>
            <p className="text-stone-500 text-xs mt-3">Skills develop automatically based on campaigns you complete.</p>
          </div>

          <div className="bg-stone-900/50 border border-purple-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Achievements</h3>
            <p className="text-stone-300 text-sm mb-3">
              Unlock 500+ achievements across multiple categories:
            </p>
            <ul className="space-y-1 text-stone-300 text-sm">
              <li>• <strong>Discovery:</strong> Find hidden secrets and easter eggs</li>
              <li>• <strong>Speed:</strong> Complete campaigns quickly</li>
              <li>• <strong>Mastery:</strong> Demonstrate tool proficiency</li>
              <li>• <strong>Social:</strong> Multiplayer and community activities</li>
              <li>• <strong>Special:</strong> Unique accomplishments</li>
            </ul>
            <p className="text-stone-500 text-xs mt-3">
              <strong>Rarity Tiers:</strong> Common, Rare, Epic, Legendary<br />
              Higher rarity = bigger XP and currency rewards
            </p>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">View Your Progress</h3>
            <div className="space-y-2">
              <Link href="/profile">
                <Button className="w-full bg-amber-900/30 hover:bg-amber-900/50 text-amber-300 border border-amber-700/50 min-h-[48px] justify-start">
                  <Trophy className="w-4 h-4 mr-2" />
                  Player Profile - See XP, achievements, stats
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/leaderboards">
                <Button className="w-full bg-teal-900/30 hover:bg-teal-900/50 text-teal-300 border border-teal-700/50 min-h-[48px] justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Leaderboards - Compare with others
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'learning',
      title: 'Learning Curriculum ✨',
      icon: <GraduationCap className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Experiential Learning Framework</h2>
          <p className="text-stone-300 leading-relaxed">
            Atropos emphasizes <strong>learning by doing</strong> with a mission-critical philosophy: 
            in cybersecurity, hands-on experience far outweighs traditional degrees.
          </p>

          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">80/20 Learning Model</h3>
            <div className="space-y-3 text-stone-300 text-sm">
              <div>
                <strong className="text-teal-400">80% Hands-On Practice</strong>
                <p className="text-stone-400 mt-1">Spend most of your time actively investigating, using tools, and solving real scenarios.</p>
              </div>
              <div>
                <strong className="text-teal-400">20% Theory & Context</strong>
                <p className="text-stone-400 mt-1">Learn concepts just-in-time as you encounter them, not as upfront lectures.</p>
              </div>
            </div>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">6 OSINT Specialization Tracks</h3>
            <div className="space-y-3">
              {[
                { icon: '🌍', name: 'Geolocation & GEOINT', desc: 'Photo analysis, satellite imagery, coordinate systems, shadow analysis' },
                { icon: '👥', name: 'SOCMINT', desc: 'Social media intelligence, profile correlation, relationship mapping' },
                { icon: '💰', name: 'Financial Investigation', desc: 'Corporate intel, fraud detection, shell company tracing, money laundering' },
                { icon: '₿', name: 'Crypto & Blockchain', desc: 'Transaction tracing, wallet clustering, DeFi investigation' },
                { icon: '🎯', name: 'Nation-State Threat Intel', desc: 'APT tracking, attribution, geopolitical analysis, campaign monitoring' },
                { icon: '🕸️', name: 'Dark Web Intelligence', desc: 'Underground markets, stolen data monitoring, forum analysis' }
              ].map((track) => (
                <div key={track.name} className="flex items-start gap-3 p-2 bg-stone-900/30 rounded">
                  <span className="text-2xl">{track.icon}</span>
                  <div>
                    <h4 className="font-bold text-stone-200 text-sm">{track.name}</h4>
                    <p className="text-stone-400 text-xs">{track.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-900/50 border border-purple-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">5 Learning Styles</h3>
            <p className="text-stone-300 text-sm mb-3">The AI adapts its teaching to match how YOU learn:</p>
            <div className="space-y-2 text-sm">
              {[
                { icon: '🔧', style: 'Experiential', desc: 'Jump in, try tools, learn by mistakes and exploration' },
                { icon: '📊', style: 'Visual', desc: 'Diagrams, maps, graphs, and visual representations' },
                { icon: '🔬', style: 'Analytical', desc: 'Theory first, documentation, RFCs, deep technical understanding' },
                { icon: '👥', style: 'Social', desc: 'Community resources, discussions, collaborative learning' },
                { icon: '⚡', style: 'Pragmatic', desc: 'Quick results, automation, efficient workflows' }
              ].map((item) => (
                <div key={item.style} className="flex gap-2 p-2">
                  <span>{item.icon}</span>
                  <div>
                    <strong className="text-purple-300">{item.style}:</strong>
                    <span className="text-stone-400 ml-2">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Career Paths</h3>
            <ul className="space-y-1 text-stone-300 text-sm">
              <li>• <strong>Threat Intelligence Analyst:</strong> OSINT → Nation-State Intel → Dark Web</li>
              <li>• <strong>Financial Crime Investigator:</strong> OSINT → Financial → Crypto/Blockchain</li>
              <li>• <strong>OSINT Specialist:</strong> OSINT → SOCMINT → Geolocation → Dark Web</li>
              <li>• <strong>Security Researcher:</strong> OSINT → Network → Penetration Testing</li>
            </ul>
            <p className="text-stone-500 text-xs mt-3">
              See full curriculum: <a href="https://github.com/goodoleusa/atropos/blob/main/docs/CURRICULUM.md" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">docs/CURRICULUM.md</a>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'campaigns',
      title: 'Investigation Campaigns ✨',
      icon: <Target className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Investigation Campaigns</h2>
          <p className="text-stone-300 leading-relaxed">
            Choose from 23 guided investigations ranging from beginner to expert difficulty. 
            Each campaign teaches specific skills and tools used by professional security investigators.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
              <h3 className="text-md font-semibold text-teal-300 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Beginner Campaigns
              </h3>
              <ul className="space-y-2 text-sm text-stone-300">
                <li>• <strong>Passive Reconnaissance</strong> - DNS, subdomains, certificates (20-30 min)</li>
                <li>• <strong>Basic OSINT</strong> - Target profiling, digital footprints (25-35 min)</li>
                <li>• <strong>Email Intelligence</strong> - Pattern discovery, verification (15-25 min)</li>
              </ul>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
              <h3 className="text-md font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" /> Intermediate Campaigns
              </h3>
              <ul className="space-y-2 text-sm text-stone-300">
                <li>• <strong>Shell Corp Investigation</strong> - Corporate tracing (45-60 min)</li>
                <li>• <strong>Active Reconnaissance</strong> - Port scanning, enumeration (30-45 min)</li>
                <li>• <strong>Phishing Analysis</strong> - Email forensics, attribution (35-45 min)</li>
                <li>• <strong>Social Engineering</strong> - Human factor analysis (40-50 min)</li>
              </ul>
            </div>

            <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-4">
              <h3 className="text-md font-semibold text-red-300 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Advanced Campaigns
              </h3>
              <ul className="space-y-2 text-sm text-stone-300">
                <li>• <strong>BGP Route Tracing</strong> - Network routing analysis (30-45 min)</li>
                <li>• <strong>Dark Web Intelligence</strong> - Underground monitoring (30-45 min)</li>
                <li>• <strong>Cryptocurrency Tracing</strong> - Blockchain analysis (45-60 min)</li>
                <li>• <strong>Threat Hunting</strong> - IOC analysis, behavioral detection (45-60 min)</li>
                <li>• <strong>Malware Triage</strong> - Initial analysis, IOC extraction (40-50 min)</li>
              </ul>
            </div>

            <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
              <h3 className="text-md font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" /> Expert Campaigns
              </h3>
              <ul className="space-y-2 text-sm text-stone-300">
                <li>• <strong>Incident Response</strong> - Full IR cycle, containment (60-90 min)</li>
                <li>• <strong>APT Attribution</strong> - Advanced persistent threat analysis (60-90 min)</li>
                <li>• <strong>Network Topology Mapping</strong> - Complete infrastructure analysis (45-60 min)</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">How Campaigns Work</h3>
            <ol className="list-decimal list-inside space-y-2 text-stone-300 text-sm">
              <li>Choose a campaign from <Link href="/campaigns" className="text-teal-400 hover:underline">/campaigns</Link></li>
              <li>AI agent provides context and objectives</li>
              <li>Use recommended tools to gather intelligence</li>
              <li>Document findings in Report Builder</li>
              <li>Complete objectives to finish campaign</li>
              <li>Earn XP, unlock achievements, build portfolio</li>
            </ol>
            <p className="text-stone-500 text-xs mt-3">
              Every campaign teaches real-world techniques used by security professionals.
              Based on actual incidents like Panama Papers, Silk Road investigations, APT campaigns.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'leaderboards',
      title: 'Leaderboards ✨',
      icon: <TrendingUp className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Global Rankings</h2>
          <p className="text-stone-300 leading-relaxed">
            Compete with investigators worldwide. Track your progress and climb the ranks through 
            skill development and consistent investigation work.
          </p>

          <div className="bg-stone-900/50 border border-teal-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Leaderboard Types</h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-bold text-teal-400">🏆 Global XP Rankings</h4>
                <p className="text-stone-400">Top 100 investigators by total experience points earned</p>
              </div>
              <div>
                <h4 className="font-bold text-amber-400">⚡ Weekly Champions</h4>
                <p className="text-stone-400">This week's top performers (resets every Monday)</p>
              </div>
              <div>
                <h4 className="font-bold text-purple-400">🎯 Campaign Records</h4>
                <p className="text-stone-400">Fastest completion times for each investigation</p>
              </div>
              <div>
                <h4 className="font-bold text-blue-400">🛡️ Skill Rankings</h4>
                <p className="text-stone-400">Leaders in OSINT, Network, Malware, Social specializations</p>
              </div>
            </div>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Improving Your Rank</h3>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li>✅ Complete daily challenges (consistent activity)</li>
              <li>✅ Finish campaigns thoroughly (quality over speed)</li>
              <li>✅ Unlock rare achievements (bonus XP)</li>
              <li>✅ Find hidden clues (+50 XP each)</li>
              <li>✅ Maintain login streaks (streak bonuses)</li>
              <li>✅ Beat speed records (campaign leaderboards)</li>
            </ul>
          </div>

          <Link href="/leaderboards">
            <Button className="w-full bg-teal-900/30 hover:bg-teal-900/50 text-teal-300 border border-teal-700/50 min-h-[48px]">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Global Leaderboards
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>
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
