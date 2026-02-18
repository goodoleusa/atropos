import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Book, Terminal, Bot, FileText, Settings, Zap, Target, Shield, 
  ChevronRight, Home, Search, Trophy, TrendingUp, Award, 
  GraduationCap, Users, MessageSquare, Map, Layers, QrCode, 
  Briefcase, Menu, X, Code, FileCode, Puzzle, Wrench,
  Copy, GitBranch, Download, Brain, AlertTriangle, BookOpen,
  Network, Radio, Gauge, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type WikiSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

export default function Wiki() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <h3 className="text-lg font-semibold text-teal-300 mb-2">1. Campaigns (/campaigns)</h3>
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
      title: 'NEXUS Lead Architect',
      icon: <Bot className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">NEXUS — Lead Architect</h2>
          <p className="text-stone-300 leading-relaxed">
            NEXUS is the <strong className="text-amber-300">Lead Architect</strong> of the multi-agent system. 
            It maintains a bird's-eye view of the entire platform — receiving live Mission Bus findings 
            and crew agent status directly in its system prompt so every response is informed by the 
            full operational picture.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Core Capabilities</h3>
            <ul className="space-y-3 text-stone-300">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Live Situation Awareness:</strong> Mission Bus findings and crew agent status 
                  are injected into NEXUS's system prompt in real time, giving it holistic context 
                  across every module
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Multi-Model Support:</strong> Switch between AI models — kimi, nemotron, 
                  devstral, and mixtral are preferred for investigation tasks, with fallback to 
                  any OpenRouter-compatible model
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Automatic Context Compression:</strong> Replit Agent-style memory management 
                  compresses long conversations automatically, preserving key findings while staying 
                  within token limits
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Crew Delegation:</strong> NEXUS automatically delegates specialized tasks to 
                  crew agents (VulnAnalyst, OSINTAnalyst, ThreatIntel, etc.) based on investigation context
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Export Integration:</strong> Seamlessly export conversations and crew findings 
                  to investigation reports
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Investigation Campaigns</h3>
            <p className="text-stone-400 text-sm mb-3">
              Pre-built investigation flows still work as before — select a campaign and NEXUS guides 
              you through it, now with crew agent assistance:
            </p>
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
              <li>Let NEXUS delegate to crew agents — don't try to do everything in one prompt</li>
              <li>Check the Mission Bus feed to see what other modules have discovered</li>
              <li>Use campaigns to structure complex investigations</li>
              <li>Ask NEXUS to summarize crew findings for a consolidated view</li>
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
    },
    {
      id: 'campaign-builder',
      title: 'Campaign Builder & Sitemap',
      icon: <Layers className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Campaign Builder & Sitemap Integration</h2>
          <p className="text-stone-300 leading-relaxed">
            The Campaign Builder is a visual editor for creating investigation campaigns. It now syncs
            directly with the platform sitemap: saving or publishing a campaign automatically registers
            its route in the sitemap database.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Builder Features</h3>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <span><strong>Visual Canvas:</strong> Drag-and-drop node editor with connection lines, zoom, and pan</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <span><strong>Node Types:</strong> Step, Decision, Tool, Output, Folder - each with unique colors and behaviors</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <span><strong>Hidden Clues:</strong> Embed clues in source code, HTTP headers, console logs, CSS comments, and more</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <span><strong>Page Layouts:</strong> Card, full-page, terminal, dossier, or split view per node</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <span><strong>Auto-Save:</strong> Changes save automatically every 5 seconds when modified</span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">10 Arc Templates</h3>
            <p className="text-stone-400 text-sm mb-3">Pre-built campaign structures you can apply from the sitemap or builder:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { name: 'Phantom Thread', desc: 'Phishing / Initial Access' },
                { name: 'Ghost Protocol', desc: 'Persistence / Backdoor' },
                { name: 'Shadow Network', desc: 'OSINT Recon' },
                { name: 'Wire Transfer', desc: 'Financial / Crypto Tracing' },
                { name: 'Social Spider', desc: 'Social Engineering' },
                { name: 'Dark Mirror', desc: 'Dark Web Intel' },
                { name: 'Packet Storm', desc: 'Network Forensics' },
                { name: 'Zero Day', desc: 'Vulnerability Research' },
                { name: 'Red Herring', desc: 'Counter-Intelligence' },
                { name: 'First Contact', desc: 'Beginner Tutorial' },
              ].map(t => (
                <div key={t.name} className="bg-stone-900/30 rounded p-2">
                  <span className="text-stone-200 font-bold text-xs">{t.name}</span>
                  <span className="text-stone-500 text-[10px] block">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Sitemap Sync</h3>
            <p className="text-stone-300 text-sm mb-3">
              The sitemap and builder are now fully connected:
            </p>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li>Save a campaign in the builder &rarr; sitemap entry created at <code className="bg-stone-800 px-1 rounded">/play/[id]</code></li>
              <li>Publish a campaign &rarr; sitemap entry marked as published (visible to players)</li>
              <li>Unpublish &rarr; sitemap entry marked draft</li>
              <li>Sitemap "Open in Builder" button &rarr; loads the campaign or arc template in the visual editor</li>
              <li>Sitemap "Sync Routes" &rarr; re-seeds all built-in platform routes</li>
            </ul>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Interactive Sitemap (Admin)</h3>
            <p className="text-stone-300 text-sm mb-2">
              The sitemap panel in the Admin Dashboard lets you:
            </p>
            <ul className="space-y-1 text-stone-300 text-sm">
              <li>Add custom pages with name, path, icon, category, color, and page layout</li>
              <li>Apply arc templates from the campaign builder</li>
              <li>Edit or delete custom entries inline</li>
              <li>Toggle between tree view and grid view</li>
              <li>Filter by category (Core Platform, Investigation Hub, Campaigns, Media, Admin)</li>
            </ul>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Quick Access</h3>
            <div className="space-y-2">
              <Link href="/builder">
                <Button className="w-full bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-700/50 min-h-[48px] justify-start" data-testid="link-builder">
                  <Layers className="w-4 h-4 mr-2" />
                  Open Campaign Builder
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button className="w-full bg-amber-900/30 hover:bg-amber-900/50 text-amber-300 border border-amber-700/50 min-h-[48px] justify-start" data-testid="link-admin-sitemap">
                  <Map className="w-4 h-4 mr-2" />
                  Admin Sitemap Panel
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'obsidian-export',
      title: 'Obsidian Vault Export',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Obsidian Vault Export</h2>
          <p className="text-stone-300 leading-relaxed">
            Export campaigns from the builder directly into Obsidian-compatible markdown files.
            The export is fully compatible with Templater, Dataview, Excalibrain, and Breadcrumbs plugins.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Plugin Compatibility</h3>
            <div className="space-y-3">
              <div className="bg-stone-900/30 rounded p-3">
                <h4 className="font-bold text-teal-400 text-sm mb-1">Templater</h4>
                <p className="text-stone-400 text-xs">
                  Every exported file starts with a <code className="bg-stone-800 px-1 rounded">{'<%* %>'}</code> script block
                  that exposes campaign metadata (nodeType, campaignId, difficulty, category, etc.) as variables.
                  Templater auto-fills date fields on note creation.
                </p>
              </div>
              <div className="bg-stone-900/30 rounded p-3">
                <h4 className="font-bold text-purple-400 text-sm mb-1">Breadcrumbs</h4>
                <p className="text-stone-400 text-xs">
                  Frontmatter uses <code className="bg-stone-800 px-1 rounded">parent</code>,
                  <code className="bg-stone-800 px-1 rounded">child</code>, and
                  <code className="bg-stone-800 px-1 rounded">sibling</code> fields
                  as wikilink arrays. The index note uses <code className="bg-stone-800 px-1 rounded">BC-folder-note: true</code> for
                  folder-level hierarchy. Inline relations use <code className="bg-stone-800 px-1 rounded">{'parent:: [[...]]'}</code> syntax.
                </p>
              </div>
              <div className="bg-stone-900/30 rounded p-3">
                <h4 className="font-bold text-amber-400 text-sm mb-1">Dataview</h4>
                <p className="text-stone-400 text-xs">
                  All frontmatter fields are Dataview-queryable: type, skill-level, tools, hidden-clue-count,
                  page-layout, campaign, difficulty, published, sitemap-path, and more.
                  Each node file includes inline Dataview TABLE and LIST queries. The index file has advanced
                  queries for clue summaries and skills/tools maps.
                </p>
              </div>
              <div className="bg-stone-900/30 rounded p-3">
                <h4 className="font-bold text-red-400 text-sm mb-1">Excalibrain</h4>
                <p className="text-stone-400 text-xs">
                  Nodes export with <code className="bg-stone-800 px-1 rounded">excalibrain-color</code> and
                  <code className="bg-stone-800 px-1 rounded">excalibrain-shape</code> fields matching node types:
                  steps = amber boxes, decisions = purple diamonds, tools = teal ovals, outputs = red hexagons.
                  The index includes an Excalibrain code block with style definitions.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-stone-900/50 border border-teal-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Frontmatter Fields</h3>
            <p className="text-stone-400 text-sm mb-3">Each exported node includes these queryable fields:</p>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              {[
                ['id', 'Unique node identifier'],
                ['type', 'step / decision / tool / output / folder'],
                ['parent', 'Breadcrumbs parent wikilinks'],
                ['child', 'Breadcrumbs child wikilinks'],
                ['sibling', 'Breadcrumbs sibling wikilinks'],
                ['page-layout', 'card / full-page / terminal / dossier / split'],
                ['campaign', 'Parent campaign name'],
                ['campaign-id', 'Parent campaign ID'],
                ['category', 'recon / exploit / defense / osint / forensics / social'],
                ['difficulty', 'beginner / intermediate / advanced'],
                ['published', 'Whether campaign is published'],
                ['sitemap-path', 'Platform route (/play/...)'],
                ['skill-level', 'beginner through expert'],
                ['tools', 'Array of tool names used in this step'],
                ['skills', 'Array of skills taught'],
                ['hidden-clue-count', 'Number of embedded clues'],
                ['excalibrain-color', 'Hex color for graph visualization'],
                ['excalibrain-shape', 'box / diamond / oval / hexagon'],
              ].map(([field, desc]) => (
                <div key={field} className="flex gap-2 py-0.5">
                  <code className="bg-stone-800 px-1 rounded text-amber-400 shrink-0">{field}</code>
                  <span className="text-stone-500 truncate">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">How to Export</h3>
            <ol className="list-decimal list-inside space-y-2 text-stone-300 text-sm">
              <li>Open the Campaign Builder at <code className="bg-stone-800 px-1 rounded">/builder</code></li>
              <li>Create or load a campaign</li>
              <li>Click <strong>Obsidian Export</strong> in the toolbar</li>
              <li>A single <code className="bg-stone-800 px-1 rounded">.md</code> file downloads containing all node files separated by markers</li>
              <li>Split the file into individual notes in your Obsidian vault folder</li>
              <li>Breadcrumbs, Dataview, and Excalibrain will auto-detect the relationships</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'portfolio',
      title: 'Portfolio System',
      icon: <Briefcase className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Portfolio System</h2>
          <p className="text-stone-300 leading-relaxed">
            Build a shareable professional portfolio from your investigations, campaigns, reports,
            and scanner results. Each portfolio entry supports data visualizations, custom styling,
            and public share links.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Auto-Population Sources</h3>
            <p className="text-stone-400 text-sm mb-3">Portfolio entries can be created from:</p>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1 flex-shrink-0" />
                <span><strong>Investigations:</strong> NEXUS agent conversations and findings</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                <span><strong>Campaigns:</strong> Completed campaign runs with node progress</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                <span><strong>Reports (Dossiers):</strong> Report Builder exports with findings and recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                <span><strong>Scanner Results:</strong> Atropos and SpiderFoot scan outputs</span>
              </li>
            </ul>
          </div>

          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Data Visualizations</h3>
            <p className="text-stone-400 text-sm mb-3">
              Each portfolio entry can display one of these visualization types, selectable during creation or editing:
            </p>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li><strong>Radar Chart:</strong> Multi-axis skill profile (network, web, crypto, osint, system, programming)</li>
              <li><strong>Severity Donut:</strong> Critical / High / Medium / Low finding distribution</li>
              <li><strong>Timeline:</strong> Investigation milestones with dates and events</li>
              <li><strong>Donut Chart:</strong> Category distribution of findings</li>
              <li><strong>None:</strong> No visualization, text-only entry</li>
            </ul>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Sharing & Embedding</h3>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li>Each entry gets a unique share link at <code className="bg-stone-800 px-1 rounded">/portfolio/:shareId</code></li>
              <li>Share links work without login for public viewing</li>
              <li>Entries display the selected visualization, evidence, and tags</li>
              <li>Use for job applications, research portfolios, or team sharing</li>
            </ul>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Post-Creation Editing</h3>
            <p className="text-stone-300 text-sm">
              After creating a portfolio entry, you can edit it anytime from your Profile page.
              Change the title, description, tags, evidence, visibility, and visualization type.
              Entries are editable inline without leaving the profile view.
            </p>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Quick Access</h3>
            <Link href="/profile">
              <Button className="w-full bg-amber-900/30 hover:bg-amber-900/50 text-amber-300 border border-amber-700/50 min-h-[48px] justify-start" data-testid="link-portfolio">
                <Briefcase className="w-4 h-4 mr-2" />
                View Your Portfolio
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            </Link>
          </div>
        </div>
      )
    },
    {
      id: 'qr-c2',
      title: 'QR C2 Framework',
      icon: <QrCode className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">QR C2 Framework</h2>
          <p className="text-stone-300 leading-relaxed">
            An educational command-and-control framework using QR codes. Learn how real-world attackers
            use QR-based C2 channels, then practice defending against them through guided missions and
            hands-on hijacking labs.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">3 Guided Missions</h3>
            <ul className="space-y-3 text-stone-300 text-sm">
              <li>
                <strong className="text-teal-400">First Beacon (50 XP):</strong> Learn how C2 beacons establish initial communication.
                Reference: APT29 / SolarWinds.
              </li>
              <li>
                <strong className="text-purple-400">Receiving Orders (75 XP):</strong> Understand the implant tasking lifecycle:
                queue, fetch, execute, report. Reference: Lazarus Group.
              </li>
              <li>
                <strong className="text-red-400">Ghost in the Wire (100 XP):</strong> Master evasion techniques: jitter, domain fronting,
                sleep obfuscation. Reference: APT41.
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-purple-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">6 QR Hijacking Labs</h3>
            <div className="space-y-2 text-sm">
              {[
                { num: 1, name: 'Finder Pattern Confusion', level: 'Beginner', desc: 'Multiple scanner results from one QR' },
                { num: 2, name: 'Hidden Quiet Zone Attack', level: 'Intermediate', desc: 'Nested codes via quiet zone elimination' },
                { num: 3, name: 'Physical Sticker Attack', level: 'Beginner', desc: 'Real-world parking meter QR fraud ($150K+ stolen)' },
                { num: 4, name: 'Barcode-in-QR Inception', level: 'Advanced', desc: 'Cross-format attacks exploiting scanner libraries' },
                { num: 5, name: 'Split QR Email Attack', level: 'Intermediate', desc: 'Bypass email security with fragmented QR images' },
                { num: 6, name: 'Programmatic PDF QR', level: 'Advanced', desc: 'Evade image scanners with vector-drawn QR codes' },
              ].map(lab => (
                <div key={lab.num} className="flex items-start gap-2 bg-stone-900/30 rounded p-2">
                  <span className="text-amber-500 font-bold text-xs shrink-0">Lab {lab.num}</span>
                  <div>
                    <span className="text-stone-200 font-bold text-xs">{lab.name}</span>
                    <span className="text-stone-600 text-[10px] ml-1">({lab.level})</span>
                    <p className="text-stone-500 text-[10px]">{lab.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Multi-Target Simulation Console</h3>
            <p className="text-stone-300 text-sm mb-3">
              4 simulated target machines with OS-specific command responses:
            </p>
            <ul className="space-y-1 text-stone-300 text-sm">
              <li><strong>Linux Server:</strong> Ubuntu-based web server with realistic shell output</li>
              <li><strong>Windows Workstation:</strong> Domain-joined endpoint with PowerShell responses</li>
              <li><strong>IoT Camera:</strong> Embedded Linux device with limited commands</li>
              <li><strong>Docker Container:</strong> Containerized service with namespace isolation</li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Attack Flow Presets</h3>
            <ul className="space-y-1 text-stone-300 text-sm">
              <li><strong>Raw Payload:</strong> Base64/hex data injection templates</li>
              <li><strong>C2 Beacon:</strong> Agent registration and check-in simulation</li>
              <li><strong>Data Exfiltration:</strong> Session/token theft simulation</li>
              <li><strong>Credential Harvesting:</strong> Phishing URL generation for awareness training</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'agent-recommendations',
      title: 'Agent Recommendations',
      icon: <Code className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Agent Recommendation System</h2>
          <p className="text-stone-300 leading-relaxed">
            NEXUS agents automatically generate actionable platform improvements — complete with starter code,
            target files, pain points addressed, and impact estimates. These recommendations can be exported
            and fed directly into any coding agent (Replit Agent, Cursor, Copilot, Claude, etc.).
          </p>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">What It Does</h3>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li className="flex items-start gap-2"><Code className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" /> Agents emit <code className="bg-stone-800 text-amber-400 px-1 rounded text-xs">```recommendation</code> blocks during conversations containing structured JSON</li>
              <li className="flex items-start gap-2"><FileCode className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Each recommendation includes a title, category, code snippet, target files, and pain points it solves</li>
              <li className="flex items-start gap-2"><Puzzle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" /> Recommendations auto-save to the database and can be synced to <code className="bg-stone-800 text-amber-400 px-1 rounded text-xs">.github/RECOMMENDATIONS.md</code></li>
              <li className="flex items-start gap-2"><Download className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" /> Export in 6+ formats: AI prompt, code only, git patch, curl command, JSON, markdown</li>
            </ul>
          </div>

          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Step-by-Step: Generating Recommendations</h3>
            <ol className="space-y-3 text-stone-300 text-sm list-decimal list-inside">
              <li>
                <strong className="text-teal-400">Chat with any NEXUS agent</strong> — Go to <Link href="/agents"><span className="text-cyan-400 underline cursor-pointer">/agents</span></Link> and start a conversation with any specialist (VulnAnalyst, OSINTAnalyst, etc.)
              </li>
              <li>
                <strong className="text-teal-400">Agent detects improvement opportunities</strong> — As the agent analyzes your query, it may identify platform enhancements, new tools, or code fixes
              </li>
              <li>
                <strong className="text-teal-400">Recommendation block emitted</strong> — The agent outputs a <code className="bg-stone-800 text-amber-400 px-1 rounded text-xs">```recommendation</code> JSON block with structured data
              </li>
              <li>
                <strong className="text-teal-400">Auto-saved to database</strong> — The chat parser detects the block and saves it via the API. A toast notification confirms submission
              </li>
              <li>
                <strong className="text-teal-400">View on RECS dashboard</strong> — Visit <Link href="/recs"><span className="text-cyan-400 underline cursor-pointer">/recs</span></Link> to browse, vote, filter, and export all recs
              </li>
            </ol>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Step-by-Step: Exporting to Other Agents</h3>
            <ol className="space-y-3 text-stone-300 text-sm list-decimal list-inside">
              <li>
                <strong className="text-purple-400">Select a rec</strong> — Click any item in the RECS tab to see full details in the side panel
              </li>
              <li>
                <strong className="text-purple-400">Choose your export format</strong>:
                <ul className="ml-6 mt-1 space-y-1 text-xs text-stone-400">
                  <li><strong className="text-amber-400">AI Prompt</strong> — Formatted instruction ready to paste into Replit Agent, Cursor, or any LLM chat</li>
                  <li><strong className="text-cyan-400">Code Only</strong> — Just the starter code snippet, no context</li>
                  <li><strong className="text-purple-400">Git Patch</strong> — A diff-style patch targeting the recommended file</li>
                  <li><strong className="text-teal-400">curl</strong> — A shell command to fetch this recommendation from the API</li>
                  <li><strong className="text-stone-300">JSON</strong> — Full structured data for programmatic use</li>
                </ul>
              </li>
              <li>
                <strong className="text-purple-400">Paste into your agent</strong> — The copied text is formatted so any coding agent understands what to implement, where, and why
              </li>
            </ol>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Syncing to Repository (.github)</h3>
            <p className="text-stone-300 text-sm mb-3">
              Click <strong className="text-amber-400">Sync to .github</strong> on the Suggestions page to auto-generate:
            </p>
            <ul className="space-y-1 text-stone-300 text-sm">
              <li><code className="bg-stone-800 text-cyan-400 px-1.5 py-0.5 rounded text-xs">.github/RECOMMENDATIONS.md</code> — Human-readable markdown with all recommendations organized by category</li>
              <li><code className="bg-stone-800 text-cyan-400 px-1.5 py-0.5 rounded text-xs">.github/recommendations.json</code> — Machine-readable JSON for programmatic ingestion</li>
            </ul>
            <p className="text-stone-400 text-xs mt-3">
              Any coding agent working in the repo can discover these files automatically. This is especially useful
              for Replit Agent, which reads .github/ files for context.
            </p>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-stone-300 mb-3">5 Recommendation Categories</h3>
            <div className="space-y-2">
              {[
                { label: 'Code Snippet', icon: <Code className="w-4 h-4 text-cyan-400" />, desc: 'Small, self-contained code additions — utility functions, hooks, helpers' },
                { label: 'File Edit', icon: <FileCode className="w-4 h-4 text-purple-400" />, desc: 'Targeted modifications to existing files — refactors, improvements, fixes' },
                { label: 'Systemic', icon: <Settings className="w-4 h-4 text-amber-400" />, desc: 'Architecture-level changes — new patterns, state management, performance' },
                { label: 'Integration', icon: <Puzzle className="w-4 h-4 text-teal-400" />, desc: 'External service connections — APIs, auth providers, data sources' },
                { label: 'New Tool', icon: <Wrench className="w-4 h-4 text-orange-400" />, desc: 'Entirely new features or tools — must address 3+ pain points' },
              ].map(cat => (
                <div key={cat.label} className="flex items-start gap-3 bg-stone-900/30 rounded p-2">
                  {cat.icon}
                  <div>
                    <span className="text-stone-200 font-bold text-xs">{cat.label}</span>
                    <p className="text-stone-500 text-[10px]">{cat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3">Best Use Cases</h3>
            <div className="space-y-3 text-stone-300 text-sm">
              <div>
                <strong className="text-cyan-400">Platform improvement at scale</strong>
                <p className="text-xs text-stone-400 mt-0.5">Let agents identify and propose improvements across the entire codebase, then batch-implement them using your preferred coding agent.</p>
              </div>
              <div>
                <strong className="text-cyan-400">Pain point tracking</strong>
                <p className="text-xs text-stone-400 mt-0.5">Each recommendation tags the specific user pain points it addresses. Use the stats dashboard to see which problems are most covered.</p>
              </div>
              <div>
                <strong className="text-cyan-400">Cross-tool workflow</strong>
                <p className="text-xs text-stone-400 mt-0.5">Generate recommendations in Atropos, export as prompts, paste into Cursor or Copilot to implement. The curl export lets you automate this with scripts.</p>
              </div>
              <div>
                <strong className="text-cyan-400">Code review + voting</strong>
                <p className="text-xs text-stone-400 mt-0.5">Upvote the most impactful recommendations. Sort by votes to prioritize what to implement first.</p>
              </div>
              <div>
                <strong className="text-cyan-400">Repository-level AI context</strong>
                <p className="text-xs text-stone-400 mt-0.5">Sync to .github/ so every agent session in your repo starts with awareness of pending improvements.</p>
              </div>
            </div>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-stone-300 mb-3">API Reference</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-stone-950 p-2 rounded text-cyan-400">GET /api/recs <span className="text-stone-600">— List all recs</span></div>
              <div className="bg-stone-950 p-2 rounded text-cyan-400">GET /api/recs/stats <span className="text-stone-600">— Category/priority/status breakdown</span></div>
              <div className="bg-stone-950 p-2 rounded text-cyan-400">GET /api/recs/export?format=json|md|prompt <span className="text-stone-600">— Bulk export</span></div>
              <div className="bg-stone-950 p-2 rounded text-cyan-400">GET /api/recs/export/:id?format=prompt <span className="text-stone-600">— Single item export</span></div>
              <div className="bg-stone-950 p-2 rounded text-teal-400">POST /api/recs <span className="text-stone-600">— Create rec</span></div>
              <div className="bg-stone-950 p-2 rounded text-teal-400">POST /api/recs/sync <span className="text-stone-600">— Write to .github/ files</span></div>
              <div className="bg-stone-950 p-2 rounded text-amber-400">POST /api/recs/:id/vote <span className="text-stone-600">— Upvote</span></div>
              <div className="bg-stone-950 p-2 rounded text-purple-400">PATCH /api/recs/:id <span className="text-stone-600">— Update status/priority</span></div>
              <div className="bg-stone-950 p-2 rounded text-red-400">DELETE /api/recs/:id <span className="text-stone-600">— Remove</span></div>
            </div>
            <p className="text-stone-400 text-xs mt-2">Push architecture recs: <code className="bg-stone-800 px-1 rounded">npm run recs:push</code> (requires server running)</p>
          </div>
        </div>
      )
    },
    {
      id: 'architecture-review',
      title: 'Architecture Review',
      icon: <Layers className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Platform Architecture</h2>
          <p className="text-stone-300 leading-relaxed">
            High-level structure and recurring improvement themes identified during architectural review.
          </p>
          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Stack Overview</h3>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li><strong>Frontend:</strong> React 18, TypeScript, Tailwind v4, Framer Motion, Wouter</li>
              <li><strong>Backend:</strong> Express 5, TypeScript ESM, Drizzle ORM, PostgreSQL</li>
              <li><strong>AI:</strong> OpenRouter API, NEXUS multi-agent orchestration</li>
              <li><strong>State:</strong> TanStack Query, Zustand, React Context (GameProvider, ReportProvider, AgentChatProvider)</li>
            </ul>
          </div>
          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Improvement Themes</h3>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li><strong>Route Cleanup:</strong> Remove duplicate route blocks in server/routes.ts</li>
              <li><strong>Recs API:</strong> Add pagination, GET /api/recs/:id, rate limiting</li>
              <li><strong>Curriculum-Recs Integration:</strong> One-click apply rec from Curriculum Section</li>
              <li><strong>Rec Dependencies:</strong> blockedBy field for ordering batch prompts</li>
              <li><strong>Real-time:</strong> SSE or WebSocket for live rec updates on /recs</li>
            </ul>
          </div>
          <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-stone-300 mb-3">Related</h3>
            <p className="text-stone-400 text-sm">
              See <Link href="/recs"><span className="text-cyan-400 underline cursor-pointer">/recs</span></Link> for all recommendations including architecture improvements.
              Run <code className="bg-stone-800 px-1 rounded">npm run recs:push</code> to push latest architecture recs (server must be running).
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ai-curriculum',
      title: 'AI Mastery Curriculum',
      icon: <Brain className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">AI Mastery Curriculum</h2>
          <p className="text-stone-300 leading-relaxed">
            Seven interconnected tracks that take you from scientific prompting fundamentals to building 
            and deploying multi-agent AI systems. Each track contains missions with hands-on exercises 
            adapted to your learning style.
          </p>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">7 AI Mastery Tracks</h3>
            <div className="space-y-3">
              {[
                { name: 'Scientific Prompting & Bias Reduction', desc: 'Start every investigation from zero assumptions. Calibrate confidence, test hypotheses, and eliminate cognitive bias from your AI interactions.', color: 'text-purple-400' },
                { name: 'AI-Human Partnership Dynamics', desc: 'Learn when to lead and when to follow the AI. Master escalation protocols, trust calibration, and collaborative decision-making.', color: 'text-cyan-400' },
                { name: 'Advanced Prompt Engineering', desc: 'Chain-of-thought reasoning, few-shot patterns, meta-prompting, and systematic prompt architecture for complex investigations.', color: 'text-amber-400' },
                { name: 'Model Evaluation & Selection', desc: 'Compare models scientifically. Understand capabilities, costs, context windows, and match models to investigation requirements.', color: 'text-teal-400' },
                { name: 'Multi-Agent System Design', desc: 'Architect AI agent teams with specialized roles. Design communication protocols, task decomposition, and consensus mechanisms.', color: 'text-orange-400' },
                { name: 'CrewAI & LangChain Patterns', desc: 'Export your agent designs to production frameworks. Build real crews, chains, and orchestration systems.', color: 'text-rose-400' },
                { name: 'DecoherenceLab', desc: '15 failure exercises where AI systems break down. Study hallucination cascades, prompt injection, context collapse, and emergent failures.', color: 'text-red-400' },
              ].map(track => (
                <div key={track.name} className="bg-stone-900/30 rounded p-3">
                  <span className={`font-bold text-sm ${track.color}`}>{track.name}</span>
                  <p className="text-stone-400 text-xs mt-1">{track.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">How It Works</h3>
            <ol className="space-y-3 text-stone-300 text-sm list-decimal list-inside">
              <li><strong className="text-teal-400">Open Mission Briefing</strong> — Click the compass icon in NEXUS chat to browse all available tracks and missions</li>
              <li><strong className="text-teal-400">Select a mission</strong> — Each mission shows objectives, exercises, difficulty, and estimated time</li>
              <li><strong className="text-teal-400">Exercises adapt to your style</strong> — Visual learners get diagrams, experiential learners get hands-on labs, analytical learners get deep-dive theory</li>
              <li><strong className="text-teal-400">Complete exercises</strong> — Check off exercises as you work through them. Progress is tracked per-track</li>
              <li><strong className="text-teal-400">Unlock advanced tracks</strong> — Some tracks require 50% completion of prerequisites before they unlock</li>
            </ol>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Admin Editing</h3>
            <p className="text-stone-300 text-sm mb-3">
              The entire curriculum is stored in the database and editable from the Admin Dashboard.
            </p>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li className="flex items-start gap-2"><Settings className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Navigate to Admin Dashboard &gt; Curriculum tab</li>
              <li className="flex items-start gap-2"><FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" /> Edit track descriptions, mission objectives, and exercise content inline</li>
              <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" /> Changes push immediately to all players via the database API</li>
              <li className="flex items-start gap-2"><Download className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Re-seed from static config to reset any track to defaults</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'osint-curriculum',
      title: 'Cyber OSINT Curriculum',
      icon: <Target className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Cyber OSINT Curriculum</h2>
          <p className="text-stone-300 leading-relaxed">
            Six specialization tracks covering the full spectrum of Open Source Intelligence. From geolocation 
            analysis to dark web monitoring, each track maps to real-world security job roles and builds 
            portfolio-ready investigation skills.
          </p>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">6 OSINT Specialization Tracks</h3>
            <div className="space-y-3">
              {[
                { name: 'Geolocation Intelligence', desc: 'Determine locations from images, video, and metadata. Master satellite imagery, street-level analysis, and environmental clues.', color: 'text-cyan-400' },
                { name: 'Social Media Intelligence (SOCMINT)', desc: 'Analyze social networks, track influence operations, map connections, and identify fake accounts and bot networks.', color: 'text-blue-400' },
                { name: 'Financial Investigation', desc: 'Follow the money through corporate structures, shell companies, sanctions lists, and financial disclosure databases.', color: 'text-emerald-400' },
                { name: 'Crypto & Blockchain Analysis', desc: 'Trace cryptocurrency transactions, identify wallet clusters, analyze DeFi exploits, and investigate ransomware payments.', color: 'text-amber-400' },
                { name: 'Nation-State Threat Intelligence', desc: 'Track APT groups, analyze TTPs, map infrastructure, and understand geopolitical motivations behind cyber operations.', color: 'text-red-400' },
                { name: 'Dark Web Intelligence', desc: 'Navigate .onion services, monitor marketplaces, track threat actors, and collect evidence from hidden services safely.', color: 'text-purple-400' },
              ].map(track => (
                <div key={track.name} className="bg-stone-900/30 rounded p-3">
                  <span className={`font-bold text-sm ${track.color}`}>{track.name}</span>
                  <p className="text-stone-400 text-xs mt-1">{track.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Learning Model</h3>
            <div className="space-y-3 text-stone-300 text-sm">
              <div>
                <strong className="text-teal-400">80/20 Hands-On Ratio</strong>
                <p className="text-xs text-stone-400 mt-0.5">80% practical investigation exercises, 20% theory and context. You learn by doing real investigations, not reading textbooks.</p>
              </div>
              <div>
                <strong className="text-teal-400">Portfolio Assessment</strong>
                <p className="text-xs text-stone-400 mt-0.5">Demonstrate skills through completed investigations and reports, not multiple-choice exams. Build a portfolio that proves your capabilities.</p>
              </div>
              <div>
                <strong className="text-teal-400">Career Mapping</strong>
                <p className="text-xs text-stone-400 mt-0.5">Every track maps to real security job roles. Track descriptions include the specific career paths each specialization supports.</p>
              </div>
              <div>
                <strong className="text-teal-400">5 Learning Style Adaptations</strong>
                <p className="text-xs text-stone-400 mt-0.5">Set your preferred style (Experiential, Visual, Analytical, Social, Pragmatic) and all mission guidance adapts to match how you learn best.</p>
              </div>
            </div>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-stone-300 mb-3">Real-World Campaign Examples</h3>
            <div className="space-y-2 text-stone-300 text-sm">
              <div className="bg-stone-900/30 rounded p-2">
                <span className="text-amber-400 font-bold text-xs">Panama Papers</span>
                <span className="text-stone-500 text-xs ml-2">Financial Investigation track — trace offshore shell companies</span>
              </div>
              <div className="bg-stone-900/30 rounded p-2">
                <span className="text-amber-400 font-bold text-xs">Silk Road</span>
                <span className="text-stone-500 text-xs ml-2">Dark Web Intelligence track — marketplace analysis and takedown</span>
              </div>
              <div className="bg-stone-900/30 rounded p-2">
                <span className="text-amber-400 font-bold text-xs">APT29 / Cozy Bear</span>
                <span className="text-stone-500 text-xs ml-2">Nation-State Threat Intel track — TTP mapping and infrastructure tracking</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'decoherence-lab',
      title: 'DecoherenceLab',
      icon: <AlertTriangle className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">DecoherenceLab — AI Failure Analysis</h2>
          <p className="text-stone-300 leading-relaxed">
            15 structured exercises where you intentionally break AI systems to understand their failure modes.
            Study hallucination cascades, prompt injection, context window collapse, and emergent failures 
            in multi-agent systems. Understanding how AI fails is essential to building reliable AI partnerships.
          </p>

          <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-300 mb-3">Failure Categories</h3>
            <div className="space-y-3">
              {[
                { name: 'Hallucination Cascades', desc: 'Watch how one confident hallucination propagates through a chain of reasoning, growing more certain with each step.', color: 'text-red-400' },
                { name: 'Prompt Injection', desc: 'Test how adversarial inputs can override system instructions. Learn to build robust prompt architectures that resist manipulation.', color: 'text-orange-400' },
                { name: 'Context Window Collapse', desc: 'Observe what happens when conversations exceed model context limits. Study information loss patterns and compression strategies.', color: 'text-amber-400' },
                { name: 'Confidence Miscalibration', desc: 'Identify when models express high confidence in wrong answers. Build intuition for spotting overconfident outputs.', color: 'text-yellow-400' },
                { name: 'Multi-Agent Failure Modes', desc: 'Study how agent teams can amplify errors, create feedback loops, or reach false consensus on incorrect conclusions.', color: 'text-purple-400' },
              ].map(cat => (
                <div key={cat.name} className="bg-stone-900/30 rounded p-3">
                  <span className={`font-bold text-sm ${cat.color}`}>{cat.name}</span>
                  <p className="text-stone-400 text-xs mt-1">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Exercise Structure</h3>
            <ol className="space-y-3 text-stone-300 text-sm list-decimal list-inside">
              <li><strong className="text-amber-400">Setup</strong> — Each exercise provides a specific scenario and AI configuration designed to trigger a known failure mode</li>
              <li><strong className="text-amber-400">Observation</strong> — Run the scenario and document exactly how the AI fails. What goes wrong? When? Why?</li>
              <li><strong className="text-amber-400">Analysis</strong> — Use the Failure Lab exercise type to write up your findings. Compare with known failure patterns</li>
              <li><strong className="text-amber-400">Mitigation</strong> — Design and test countermeasures. Can you prevent this failure? Detect it early? Recover from it?</li>
              <li><strong className="text-amber-400">Portfolio Entry</strong> — Document your analysis as a portfolio piece demonstrating your understanding of AI reliability</li>
            </ol>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">Why This Matters</h3>
            <div className="space-y-3 text-stone-300 text-sm">
              <div>
                <strong className="text-purple-400">AI Safety Literacy</strong>
                <p className="text-xs text-stone-400 mt-0.5">Understanding failure modes is the foundation of responsible AI deployment. Every AI practitioner should know how systems break.</p>
              </div>
              <div>
                <strong className="text-purple-400">Red Team Skills</strong>
                <p className="text-xs text-stone-400 mt-0.5">The ability to find and exploit AI weaknesses is a highly valued cybersecurity skill. DecoherenceLab builds this systematically.</p>
              </div>
              <div>
                <strong className="text-purple-400">Career Differentiator</strong>
                <p className="text-xs text-stone-400 mt-0.5">Most AI practitioners only know how to use AI when it works. Understanding failure modes sets you apart in interviews and on the job.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'curriculum-admin',
      title: 'Curriculum Admin',
      icon: <BookOpen className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Curriculum Administration</h2>
          <p className="text-stone-300 leading-relaxed">
            The entire AI Mastery and OSINT curriculum is stored in a PostgreSQL database and editable
            through the Admin Dashboard. Changes propagate immediately to all players across the platform.
          </p>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Admin Dashboard Features</h3>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li className="flex items-start gap-2"><TrendingUp className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" /> Stats overview: total tracks, missions, exercises, and objectives at a glance</li>
              <li className="flex items-start gap-2"><FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Inline editing of track descriptions, mission names, and exercise content</li>
              <li className="flex items-start gap-2"><Target className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" /> Edit learning objectives for any mission directly in the dashboard</li>
              <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Seed or re-sync any individual track from the static configuration baseline</li>
              <li className="flex items-start gap-2"><Settings className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" /> Full CRUD API for programmatic curriculum management</li>
            </ul>
          </div>

          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">How Changes Flow</h3>
            <ol className="space-y-3 text-stone-300 text-sm list-decimal list-inside">
              <li><strong className="text-teal-400">Edit in Admin Dashboard</strong> — Modify any field and save. The change writes to the database immediately</li>
              <li><strong className="text-teal-400">API updates database</strong> — PUT /api/curriculum/:trackId persists the change in the curriculum_tracks table</li>
              <li><strong className="text-teal-400">Frontend fetches from DB</strong> — Mission Briefing and NEXUS chat load curriculum from the API with a 60-second cache</li>
              <li><strong className="text-teal-400">Players see updates</strong> — Next time any player opens Mission Briefing, they see your changes. No deploy needed</li>
            </ol>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-stone-300 mb-3">Curriculum API</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-stone-950 p-2 rounded text-cyan-400">GET /api/curriculum <span className="text-stone-600">— All tracks with missions and exercises</span></div>
              <div className="bg-stone-950 p-2 rounded text-cyan-400">GET /api/curriculum/:trackId <span className="text-stone-600">— Single track details</span></div>
              <div className="bg-stone-950 p-2 rounded text-cyan-400">GET /api/curriculum/stats/overview <span className="text-stone-600">— Aggregate stats</span></div>
              <div className="bg-stone-950 p-2 rounded text-teal-400">POST /api/curriculum/seed <span className="text-stone-600">— Seed all tracks from static config</span></div>
              <div className="bg-stone-950 p-2 rounded text-amber-400">PUT /api/curriculum/:trackId <span className="text-stone-600">— Update track data</span></div>
              <div className="bg-stone-950 p-2 rounded text-red-400">DELETE /api/curriculum/:trackId <span className="text-stone-600">— Remove track</span></div>
            </div>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Resilience</h3>
            <p className="text-stone-300 text-sm">
              If the database is unavailable or empty, the frontend automatically falls back to the static 
              curriculum configuration compiled into the app. This ensures players always have access to 
              the curriculum even during database maintenance or initial setup before seeding.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'starter-kit',
      title: 'Starter Kit / Templates',
      icon: <Puzzle className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Starter Kit / Templates System</h2>
          <p className="text-stone-300 leading-relaxed">
            Atropos includes a modular starter kit that lets you assemble a custom deployment by picking 
            only the features you need. The system lives in the <code className="text-amber-400 bg-stone-900 px-1 rounded">templates/</code> folder.
          </p>

          <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">How It Works</h3>
            <ol className="space-y-2 text-stone-300 text-sm list-decimal list-inside">
              <li><strong className="text-amber-400">Base template</strong> provides the core platform: Express server, React, PostgreSQL, Drizzle ORM, Tailwind CSS, molten-bronze theme</li>
              <li><strong className="text-amber-400">Feature modules</strong> add capabilities: each module includes its database schema, API routes, pages, components, and nav config entries</li>
              <li><strong className="text-amber-400">Setup script</strong> assembles everything: copies the base, appends selected module schemas, injects nav items, imports, and routes</li>
            </ol>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-stone-300 mb-3">Quick Start</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="bg-stone-950 p-2 rounded text-cyan-400">bash templates/setup.sh <span className="text-stone-500"># Interactive mode — choose preset or pick modules</span></div>
              <div className="bg-stone-950 p-2 rounded text-cyan-400">bash templates/setup.sh learner ./my-project <span className="text-stone-500"># CLI preset mode</span></div>
              <div className="bg-stone-950 p-2 rounded text-cyan-400">bash templates/setup.sh full ./my-project <span className="text-stone-500"># Everything included</span></div>
            </div>
          </div>

          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3">Presets</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-teal-400 font-mono font-bold w-28 shrink-0">minimal</span>
                <span className="text-stone-300">Core platform + terminal only</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-400 font-mono font-bold w-28 shrink-0">learner</span>
                <span className="text-stone-300">Campaigns, AI agents, gamification, wiki</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-400 font-mono font-bold w-28 shrink-0">security</span>
                <span className="text-stone-300">OSINT tools, scanning, reports, investigations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-400 font-mono font-bold w-28 shrink-0">marketing</span>
                <span className="text-stone-300">Behavior analysis, engagement, reporting</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-400 font-mono font-bold w-28 shrink-0">full</span>
                <span className="text-stone-300">All 13 feature modules included</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-stone-300 mb-3">Available Modules (13)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="bg-teal-950/20 border border-teal-800/20 rounded p-2">
                <span className="text-teal-400 font-bold">nexus-ai</span>
                <p className="text-stone-400 text-xs">AI investigation assistant, multi-agent orchestration</p>
              </div>
              <div className="bg-amber-950/20 border border-amber-800/20 rounded p-2">
                <span className="text-amber-400 font-bold">terminal</span>
                <p className="text-stone-400 text-xs">Custom CLI with command parsing and history</p>
              </div>
              <div className="bg-teal-950/20 border border-teal-800/20 rounded p-2">
                <span className="text-teal-400 font-bold">campaigns</span>
                <p className="text-stone-400 text-xs">Investigation campaigns with visual flow editor</p>
              </div>
              <div className="bg-amber-950/20 border border-amber-800/20 rounded p-2">
                <span className="text-amber-400 font-bold">scanner-osint</span>
                <p className="text-stone-400 text-xs">Atropos scanner + real OSINT integration</p>
              </div>
              <div className="bg-teal-950/20 border border-teal-800/20 rounded p-2">
                <span className="text-teal-400 font-bold">qr-c2</span>
                <p className="text-stone-400 text-xs">QR C2 framework with guided missions</p>
              </div>
              <div className="bg-amber-950/20 border border-amber-800/20 rounded p-2">
                <span className="text-amber-400 font-bold">gamification</span>
                <p className="text-stone-400 text-xs">XP, levels, achievements, leaderboards</p>
              </div>
              <div className="bg-teal-950/20 border border-teal-800/20 rounded p-2">
                <span className="text-teal-400 font-bold">behavior-analysis</span>
                <p className="text-stone-400 text-xs">User behavior tracking, customer journeys</p>
              </div>
              <div className="bg-amber-950/20 border border-amber-800/20 rounded p-2">
                <span className="text-amber-400 font-bold">report-builder</span>
                <p className="text-stone-400 text-xs">Bug bounty reports, vulnerability tracking</p>
              </div>
              <div className="bg-teal-950/20 border border-teal-800/20 rounded p-2">
                <span className="text-teal-400 font-bold">portfolio</span>
                <p className="text-stone-400 text-xs">Shareable investigation portfolio</p>
              </div>
              <div className="bg-amber-950/20 border border-amber-800/20 rounded p-2">
                <span className="text-amber-400 font-bold">ai-lab</span>
                <p className="text-stone-400 text-xs">Prompt engineering playground</p>
              </div>
              <div className="bg-teal-950/20 border border-teal-800/20 rounded p-2">
                <span className="text-teal-400 font-bold">wiki</span>
                <p className="text-stone-400 text-xs">Built-in docs with search and linking</p>
              </div>
              <div className="bg-amber-950/20 border border-amber-800/20 rounded p-2">
                <span className="text-amber-400 font-bold">spiderfoot</span>
                <p className="text-stone-400 text-xs">OSINT recon with streaming results</p>
              </div>
              <div className="bg-teal-950/20 border border-teal-800/20 rounded p-2">
                <span className="text-teal-400 font-bold">crew-builder</span>
                <p className="text-stone-400 text-xs">Multi-agent teams with CrewAI export</p>
              </div>
            </div>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">File Structure</h3>
            <pre className="text-xs font-mono text-stone-400 whitespace-pre leading-relaxed">{`templates/
  manifest.json          # Module registry with descriptions & dependencies
  setup.sh               # Interactive assembler script
  base/                  # Core platform files (always included)
    client/src/          # React app, navConfig, styling
    server/              # Express server, DB, routes, storage
    shared/              # Base schema (sessions, clues, quests)
  modules/               # Feature modules (pick & choose)
    <module>/
      module.json        # Injection config (nav, routes, imports)
      schema.ts          # Database tables for this module`}</pre>
          </div>

          <div className="bg-stone-900/50 border border-stone-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-stone-300 mb-3">Adding a Custom Module</h3>
            <ol className="space-y-2 text-stone-300 text-sm list-decimal list-inside">
              <li>Create <code className="text-amber-400 bg-stone-900 px-1 rounded">templates/modules/your-module/module.json</code> with inject config</li>
              <li>Add <code className="text-amber-400 bg-stone-900 px-1 rounded">schema.ts</code> if your module needs database tables</li>
              <li>Reference your pages, components, and routes in the module.json</li>
              <li>Run <code className="text-amber-400 bg-stone-900 px-1 rounded">bash templates/setup.sh custom ./output</code> and select your module</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'crew-orchestration',
      title: 'Crew Orchestration',
      icon: <Users className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Crew Orchestration</h2>
          <p className="text-stone-300 leading-relaxed">
            NEXUS commands a crew of 6 specialist agents, each focused on a distinct domain. 
            Tasks are delegated automatically based on investigation context — you interact with 
            NEXUS and the crew works behind the scenes.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Specialist Agents</h3>
            <div className="grid gap-3">
              {[
                { name: 'VulnAnalyst', specialty: 'Vulnerability assessment, CVE correlation, exploit analysis', color: 'text-red-400' },
                { name: 'OSINTAnalyst', specialty: 'Open-source intelligence, digital footprints, target profiling', color: 'text-teal-400' },
                { name: 'ThreatIntel', specialty: 'APT tracking, IOC analysis, threat landscape monitoring', color: 'text-amber-400' },
                { name: 'SecretHunter', specialty: 'Credential discovery, leaked data, exposed secrets', color: 'text-purple-400' },
                { name: 'NetworkRecon', specialty: 'Infrastructure mapping, BGP analysis, topology discovery', color: 'text-blue-400' },
                { name: 'Synthesis', specialty: 'Cross-domain correlation, final reporting, pattern recognition', color: 'text-emerald-400' },
              ].map(({ name, specialty, color }) => (
                <div key={name} className="bg-stone-800/50 p-3 rounded flex items-start gap-3">
                  <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-stone-500" />
                  <div>
                    <div className={`font-medium ${color}`}>{name}</div>
                    <div className="text-sm text-stone-400">{specialty}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Crew Status Panel</h3>
            <p className="text-stone-300 text-sm mb-3">
              The Crew Status Panel shows real-time agent activity alongside the agent chat. 
              Each agent displays its current status, specialty, and findings count.
            </p>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div><strong>Status Indicators:</strong> idle, running, complete, or error — updated in real time</div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div><strong>Findings Count:</strong> Each agent tracks how many findings it has produced</div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div><strong>Auto-Delegation:</strong> NEXUS assigns tasks to the right agent based on the investigation</div>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Tier-Based Color Coding</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-stone-300"><strong className="text-red-400">Red</strong> — Critical findings or agent error state</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-stone-300"><strong className="text-amber-400">Amber</strong> — Warning-level findings or agent running</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-stone-300"><strong className="text-emerald-400">Emerald</strong> — Successful completion or low-severity info</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'mission-bus',
      title: 'Mission Bus',
      icon: <Radio className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Mission Bus</h2>
          <p className="text-stone-300 leading-relaxed">
            The Mission Bus is the cross-module event system that connects every feature on the platform. 
            When any module produces a finding, it publishes to the bus — and NEXUS consumes those 
            findings for holistic, platform-wide analysis.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">How It Works</h3>
            <ul className="space-y-3 text-stone-300">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Publish / Subscribe:</strong> Modules publish findings (scanner results, 
                  OSINT hits, vulnerability data) to the bus. NEXUS and the UI subscribe to updates.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Recent Findings Feed:</strong> Up to 8 of the latest findings are injected 
                  into NEXUS's system prompt, giving it real-time situational awareness across modules.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Background Task Tracking:</strong> Long-running tasks (scans, crew agent jobs) 
                  are tracked on the bus and visible in the agent chat interface.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Force Multiplier Effect:</strong> Tools are not isolated — scanner findings 
                  feed into NEXUS analysis, crew results inform campaign guidance, and OSINT data 
                  enriches threat models. Everything feeds everything.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Connected Modules</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {[
                { module: 'Scanner / OSINT', action: 'Publishes recon findings' },
                { module: 'Crew Agents', action: 'Publishes specialist analysis' },
                { module: 'Campaign Engine', action: 'Publishes objective progress' },
                { module: 'Terminal', action: 'Publishes command discoveries' },
                { module: 'Report Builder', action: 'Consumes findings for auto-population' },
                { module: 'NEXUS Agent', action: 'Consumes all findings for holistic analysis' },
              ].map(({ module, action }) => (
                <div key={module} className="bg-stone-800/50 p-3 rounded">
                  <div className="font-medium text-teal-400">{module}</div>
                  <div className="text-stone-400 text-xs">{action}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Why It Matters</h3>
            <p className="text-stone-300 text-sm">
              Without the Mission Bus, each tool operates in a silo. With it, a scanner finding 
              can trigger a crew agent deep-dive, whose results inform NEXUS's campaign guidance, 
              which populates your report — all automatically. This is the "force multiplier" that 
              makes the platform greater than the sum of its parts.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'context-memory',
      title: 'Context & Memory',
      icon: <Brain className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Context & Memory Management</h2>
          <p className="text-stone-300 leading-relaxed">
            NEXUS uses automatic context compression to manage long conversations without losing 
            critical findings. Inspired by Replit Agent-style memory management, the system 
            keeps you within token limits while preserving investigation continuity.
          </p>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Automatic Compression</h3>
            <ul className="space-y-3 text-stone-300">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Token Threshold Trigger:</strong> When conversation length approaches the 
                  context window limit, compression fires automatically — no user action needed
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Key Findings Preserved:</strong> The compressor extracts and retains 
                  critical findings, decisions, and investigation state while discarding verbose exchanges
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Context Window Management:</strong> Prevents token overflow errors that 
                  would otherwise break long investigation sessions
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">UI Controls</h3>
            <ul className="space-y-3 text-stone-300 text-sm">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Manual Compress Button:</strong> Trigger compression on demand from the 
                  agent chat toolbar when you want to free up context space
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Token / Message Count Bar:</strong> A status bar in the agent chat shows 
                  current token usage and message count so you can gauge remaining capacity
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <div>
                  <strong>Compressed State Badge:</strong> A visual indicator appears when the 
                  conversation is operating on compressed context
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">Optimization Tracking</h3>
            <p className="text-stone-300 text-sm mb-3">
              Compression quality is tracked via Weights & Biases integration to continuously 
              improve how well the system preserves investigation context:
            </p>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <span>Compression ratio (original tokens vs. compressed tokens)</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <span>Key finding retention accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-1" />
                <span>Post-compression response quality metrics</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">Best Practices</h3>
            <ul className="list-disc list-inside space-y-1 text-stone-300 text-sm">
              <li>Let auto-compression handle most cases — it fires at the right time</li>
              <li>Use manual compress before starting a new investigation phase</li>
              <li>Watch the token bar to understand your remaining context budget</li>
              <li>Critical findings survive compression, but verbose tool output may not</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'content-workflows',
      title: 'Content Development Workflows',
      icon: <Wrench className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-400">Content Development Workflows</h2>
          <p className="text-stone-300 leading-relaxed">
            These workflows are designed to keep you in a creative flow state. Whether you have a sudden 
            spark of inspiration or a systematic gap to fill, each path guides you from idea to published 
            content without breaking your momentum. Every workflow aligns with the platform's pedagogy: 
            80% hands-on practice, 20% theory, adaptive teaching for all 5 learning styles, and portfolio-ready outcomes.
          </p>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Workflow 1: "Spark to Campaign"
            </h3>
            <p className="text-stone-400 text-sm mb-3 italic">When inspiration hits — ride the wave from idea to live content.</p>
            <ol className="space-y-3 text-stone-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">1.</span>
                <div><strong className="text-teal-300">Capture the idea in NEXUS Agent chat</strong> — describe the scenario loosely, don't overthink it. The AI thrives on raw concepts.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">2.</span>
                <div><strong className="text-teal-300">NEXUS generates a recommendation</strong> with starter code, pain points, and suggested learning objectives.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">3.</span>
                <div><strong className="text-teal-300">Go to Suggestions Dashboard</strong> (<code className="bg-stone-800 px-1 rounded">/suggestions</code>) to refine the recommendation — adjust priority, category, and pain points.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">4.</span>
                <div><strong className="text-teal-300">Open Curriculum Dashboard &gt; Content Generator</strong> — select the recommendation as source, pick target track, difficulty, and content type (mission, lab, or campaign flow).</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">5.</span>
                <div><strong className="text-teal-300">Review the AI-generated draft</strong> — edit inline, adjust objectives, key takeaways, XP rewards, and estimated time.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">6.</span>
                <div><strong className="text-teal-300">Approve and publish</strong> — it's live immediately across the platform.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">7.</span>
                <div><strong className="text-stone-400">Optionally open Campaign Builder</strong> to create a full investigation flow around the new content.</div>
              </li>
            </ol>
          </div>

          <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Workflow 2: "Gap-Fill"
            </h3>
            <p className="text-stone-400 text-sm mb-3 italic">Systematic curriculum improvement — find what's missing and fill it.</p>
            <ol className="space-y-3 text-stone-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-teal-500 font-bold min-w-[20px]">1.</span>
                <div><strong className="text-teal-300">Check Curriculum Dashboard stats</strong> — identify tracks with few missions or missing difficulty levels.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 font-bold min-w-[20px]">2.</span>
                <div><strong className="text-teal-300">Review Suggestions Dashboard</strong> for agent-generated recommendations related to that gap.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 font-bold min-w-[20px]">3.</span>
                <div><strong className="text-teal-300">Use Content Generator</strong> with pain points describing the gap — be specific about what's missing.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 font-bold min-w-[20px]">4.</span>
                <div><strong className="text-teal-300">Review, edit, approve</strong> the draft — ensure it connects to existing content in the track.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 font-bold min-w-[20px]">5.</span>
                <div><strong className="text-teal-300">Test by playing through</strong> as a student in Campaign Player — does the flow make sense?</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 font-bold min-w-[20px]">6.</span>
                <div><strong className="text-teal-300">Iterate based on player analytics</strong> — watch completion rates and adjust difficulty.</div>
              </li>
            </ol>
          </div>

          <div className="bg-purple-950/30 border border-purple-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Workflow 3: "Quick Deploy"
            </h3>
            <p className="text-stone-400 text-sm mb-3 italic">Drop a clue or artifact fast — minimal steps, immediate impact.</p>
            <ol className="space-y-3 text-stone-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold min-w-[20px]">1.</span>
                <div><strong className="text-purple-300">Open Admin &gt; Collectibles Library</strong> (or Quick Push section).</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold min-w-[20px]">2.</span>
                <div><strong className="text-purple-300">Pick a clue template</strong> or create a custom collectible.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold min-w-[20px]">3.</span>
                <div><strong className="text-purple-300">Select target zones</strong> — terminal, campaign area, investigation workspace, etc.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold min-w-[20px]">4.</span>
                <div><strong className="text-purple-300">Link to campaigns</strong> if the collectible is relevant to an active investigation.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 font-bold min-w-[20px]">5.</span>
                <div><strong className="text-purple-300">Push</strong> — it's live in those zones immediately.</div>
              </li>
            </ol>
          </div>

          <div className="bg-stone-900/50 border border-amber-900/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Workflow 4: "Deep Dive Track Creation"
            </h3>
            <p className="text-stone-400 text-sm mb-3 italic">Building a full specialization track — the most thorough workflow.</p>
            <ol className="space-y-3 text-stone-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">1.</span>
                <div><strong className="text-amber-300">Plan the track structure</strong> — define prerequisites, target audience, and high-level learning objectives.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">2.</span>
                <div><strong className="text-teal-300">Seed from static config or start fresh</strong> in the Curriculum Dashboard.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">3.</span>
                <div><strong className="text-teal-300">Create missions one by one</strong> using Content Generator — each mission should map to specific real-world job skills.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">4.</span>
                <div>
                  <strong className="text-teal-300">Add exercises per mission</strong> — use the full range of types:
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['prompt_craft', 'comparison', 'crew_build', 'eval_run', 'observation', 'debate', 'failure_analysis', 'reflection'].map(type => (
                      <span key={type} className="bg-stone-800 text-stone-400 text-[10px] px-1.5 py-0.5 rounded font-mono">{type}</span>
                    ))}
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">5.</span>
                <div>
                  <strong className="text-teal-300">Set teachingAdaptations</strong> for all 5 learning styles:
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['experiential', 'visual', 'analytical', 'social', 'pragmatic'].map(style => (
                      <span key={style} className="bg-teal-950/40 text-teal-400 text-[10px] px-1.5 py-0.5 rounded">{style}</span>
                    ))}
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">6.</span>
                <div><strong className="text-teal-300">Define key takeaways and platform tools</strong> for each mission.</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold min-w-[20px]">7.</span>
                <div><strong className="text-amber-300">Activate the track</strong> — players can discover it immediately.</div>
              </li>
            </ol>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Pedagogy Alignment Checklist
            </h3>
            <p className="text-stone-400 text-sm mb-3">
              Before publishing any content, run through these quick checks to ensure alignment with the platform's learning philosophy:
            </p>
            <ul className="space-y-2 text-stone-300 text-sm">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span>Does each mission have clear objectives tied to <strong>real job skills</strong>?</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span>Is there <strong>80% hands-on, 20% theory</strong>? (exercises outnumber lecture content)</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span>Are all <strong>5 learning style adaptations</strong> filled in? (experiential, visual, analytical, social, pragmatic)</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span>Does the <strong>difficulty progression</strong> make sense within the track?</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span>Are <strong>XP rewards balanced</strong> with effort and difficulty?</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                <span>Can a student build <strong>portfolio evidence</strong> from this content?</span>
              </li>
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-stone-950/50">
      <div className="p-4 border-b border-amber-900/20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-stone-400 hover:text-amber-400 mb-4 w-full justify-start">
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

      <div className="p-4 border-b border-amber-900/20">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <Input
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-stone-900/50 border-stone-800 text-stone-300 text-sm"
            data-testid="input-wiki-search"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {filteredSections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setIsMobileMenuOpen(false);
              }}
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex flex-col">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-start p-4 border-b border-amber-900/30 bg-stone-950/80 backdrop-blur-sm sticky top-0 z-20 gap-4">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-amber-500">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-stone-950 border-r border-amber-900/30">
            <SheetHeader className="p-4 border-b border-amber-900/20">
              <SheetTitle className="text-amber-500 flex items-center gap-2 text-left">
                <Book className="w-5 h-5" />
                Wiki Navigation
              </SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-amber-500" />
          <h1 className="font-bold text-amber-500 text-sm">Wiki Docs</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 lg:w-72 flex-shrink-0 border-r border-amber-900/30 bg-stone-950/50 flex-col">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-2 text-stone-500 text-xs md:text-sm">
              <Link href="/">
                <span className="hover:text-amber-500 cursor-pointer">Home</span>
              </Link>
              <ChevronRight className="w-3 h-3 md:w-4 h-4" />
              <span className="text-stone-300 cursor-pointer" onClick={() => setActiveSection('overview')}>Wiki</span>
              <ChevronRight className="w-3 h-3 md:w-4 h-4" />
              <span className="text-amber-500 font-medium truncate">
                {activeContent?.title}
              </span>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeContent?.content}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
