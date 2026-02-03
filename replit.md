# NEXUS Security Platform

## Overview
NEXUS is a comprehensive AI-powered security investigation platform featuring two core systems:

1. **NEXUS Agent** - AI-powered assistant for analysis, reporting, campaign management, and investigation guidance (React/TypeScript frontend + OpenRouter AI)
2. **Atropos Scanner** - Rust-based OSINT & vulnerability scanning tool with Lua scripting, integrated with 14+ security tools

**How they work together:**
- Atropos handles actual scanning, reconnaissance, and OSINT data collection
- Atropos hands results to NEXUS for intelligent analysis
- NEXUS helps users interpret findings, populate reports, and strategize next steps
- Both share investigation context for seamless workflow

The platform features a molten bronze/industrial aesthetic with custom terminal interface, investigation campaigns, and atmospheric visual effects. Key capabilities include AI-powered investigation workflows, visual campaign designer, report builder, and gamified CTF-style security training.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: React Context API (`GameProvider`) for game state, TanStack Query for server state.
- **Styling**: Tailwind CSS v4 (molten bronze palette) and Framer Motion for animations.
- **UI Components**: shadcn/ui built on Radix UI.
- **Key Patterns**: Game state persistence (localStorage, server sync), custom terminal, atmospheric overlays (ChaosOverlay, MysticalPopups, QuantumField).

### Backend
- **Runtime**: Node.js with Express.
- **Language**: TypeScript with ESM modules.
- **Build**: Vite (client), esbuild (server).
- **API Pattern**: RESTful JSON APIs (`/api/`).
- **Key Patterns**: Storage interface (`IStorage`) with PostgreSQL implementation, QR code generation, static file serving with SPA fallback.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM.
- **Schema**: `shared/schema.ts`.
- **Migrations**: Drizzle Kit.
- **Tables**: `game_sessions`, `clues`, `quests`, `command_logs`.

### Key Features and Design Decisions
- **Theming & Aesthetics**: Vaporwave/cassette futurism with a specific molten bronze/teal palette. No green elements.
- **Terminal System**: Custom command parsing, history, and secret command discovery.
- **Game Progression**: Clue collection, quest chains, and unlockable content.
- **Dynamic Content**: Centralized message and campaign configuration for terminal messages, toasts, and overlays. Campaigns switch themes and narratives.
- **Security Design (Intentionally Vulnerable)**: Designed as an "escape room" CTF; allows enumeration and simulated hacking, but prevents real attacks with input sanitization, rate limiting, CSP, and session validation.
- **NEXUS Agent System**: Integrated AI assistant (`AgentChat.tsx`) for security investigation analysis and guidance, powered by OpenRouter AI. Supports model selection and pre-built investigation campaigns (e.g., Shell Corp, BGP tracing, Threat Hunting). Admin can configure system prompt via **Admin → Agent tab** (core identity, capability modules, custom instructions). Works alongside Atropos Scanner for scan result analysis.
- **Admin Dashboard**: Content management for clues, quests, messages, mystical elements, Player Sessions tab with live session data, and a UX Playground for real-time visual effect tweaking (backgrounds, mouse tracking, glitches, event probabilities).
- **Campaign Designer**: Twine-inspired visual flow editor with Obsidian-style wikilinks and breadcrumb metadata for conditional decision trees.
  - **Wikilinks**: Use `[[Node Title]]` in content to auto-create links between nodes
  - **Backlinks Panel**: Shows what nodes link TO the current node (Obsidian-style)
  - **Breadcrumb Trail**: Visual path from root to selected node
  - **View Modes**: Canvas (visual editor), Clues (all clues with campaign connections), Overview (stats, features, decision tree summary)
  - **Node Metadata**: Feature type (terminal, api, qr, crypto, agent, web, osint, steganography), Campaign type (recon, exploit, defense, forensics), Skills (network, web, crypto, osint, system, programming with sub-skills), Linked clues, Branch conditions
  - **Quick-start Templates**: Reconnaissance, Vulnerability Analysis, OSINT, Blank Canvas via dropdown menu
  - **Decision Tree Paths**: Overview shows all decision nodes with their branch conditions and targets
- **Global Attack Map**: Animated real-time threat visualization on the homepage, simulating cybersecurity dashboards.
- **Report Builder System**: Aids in structuring bug bounty findings with sections for analysis, vulnerability tracking, bounty estimation, and export. Includes AI benchmarking best practices (model rankings, win rates, sanity checks, recommendations) and shared investigation context with Agent Chat.
- **Shared Investigation Context**: Cross-feature state management via useReportContext hook enabling data flow between Agent Chat, AI Lab, and Report Builder with localStorage persistence.
- **AI Lab (Battleground)**: Comprehensive prompt engineering playground with live preview, token-to-dollar cost tracking, model comparison battleground (free vs paid tiers), performance evaluations (task completion, coherence, context awareness), exportable session summaries, bug reporting system, and AI-driven improvement recommendations. Features unified chat battleground for dual-model comparison with winner voting and battle history tracking. Now includes **AI Pentesting Challenges** based on 2025 arxiv research.
- **AI Pentesting Challenges**: 10 research-based challenges covering cutting-edge LLM attacks:
  - **GCG (Greedy Coordinate Gradient)** - Bishop Fox Broken Hill adversarial suffix generation
  - **SequentialBreak** (arXiv 2411.06426) - Embedding harmful prompts in sequential chains
  - **RoleBreaker** (MDPI Dec 2025) - 87% success adaptive role-play with representation analysis
  - **Model Collapse** (Nature 2025) - Training data poisoning via synthetic content (74% of web is AI-generated)
  - **Context Collapse** (arXiv Nov 2025) - LLMs lose persona diversity under cognitive load
  - **RAG Embedding Attack** (OWASP LLM08:2025) - Adversarial embeddings that bypass text-based inspection
  - **Guardrail Evasion** (arXiv 2504.11168) - 100% bypass of Azure Prompt Shield/Meta Prompt Guard
  - **Many-Shot Jailbreak** (NeurIPS 2024) - Flooding context windows with harmful demonstrations
  - **Decoherence Induction** (Barton 2025) - Thermodynamic failure from semantic pollution
  - **Agents Rule of Two** (OpenAI/Anthropic Oct 2025) - Exploiting private data + untrusted content + state changes
- **Prompt Optimizer**: Quick tips for Chain of Thought, Role Assignment, Few-Shot Examples, Output Constraints, Negative Prompting, Temperature Control.
- **QuickNav Component**: Floating navigation button providing quick access to Terminal, AI Lab, and Report Builder with session status display, pending findings badge, and progress indicator.
- **API Playground**: Educational quest-based system for learning API requests through real-world CTF exercises (QR security, crypto-auth, hardened SSH), modular and extensible architecture.
- **Interactive Campaign System**: Adaptive investigation flows that respond to user discoveries, offering perspective shifts, tool guidance (e.g., Shodan, Censys), and pivot strategies.
- **Mobile Responsiveness**: Touch-friendly terminal with autocomplete chips (no tab key needed), responsive layouts (50vh-80vh terminal), 44px+ touch targets, repositioned floating buttons.
- **Investigation Workspace** (`/investigate`): Unified hub combining Agent Chat, AI Lab quick testing, and Learning Profile configuration in one tabbed interface. Features embedded model testing with learning profile integration.
- **Unified Learning Store** (`useLearningStore.ts`): Zustand-based centralized state management for learning preferences (style, goals, skill level, pace). Persists to localStorage and provides prompt modifiers for AI interactions. Used by PromptBuilder, Campaign Designer, and Investigation Workspace.
- **Campaign Designer Learning Integration**: Nodes support learning goals, skill levels, and teaching notes metadata for educational campaign development.
- **Mobile Node Ordering**: Campaign Designer includes 3x3 button grid for node hierarchy management (up/down/indent/outdent) with visual depth indicators, plus keyboard navigation support (arrow keys, Tab for indentation).

## Customizing NEXUS Agent Campaigns

The Agent Campaigns module (`client/src/config/agentCampaigns.ts`) provides pre-built investigation workflows for the NEXUS agent. Here's how to customize it:

### File Structure

```
client/src/config/agentCampaigns.ts
├── Campaign interface          # Campaign data shape
├── CampaignStep interface      # Step-by-step guidance
├── ToolIntegration interface   # External tool definitions
├── INVESTIGATION_PERSPECTIVES  # Mindset perspectives (adversary, defender, etc.)
├── OSINT_TOOLS                 # Tool reference library (Shodan, Censys, etc.)
├── ADAPTIVE_RESPONSES          # Context-aware guidance templates
├── GUIDED_QUESTIONS            # Phase-based prompting questions
├── AGENT_CAMPAIGNS             # Main campaign definitions array
├── CAMPAIGN_CATEGORIES         # Grouping for UI display
└── Helper functions            # getDifficultyColor, getCampaignById
```

### Adding a New Campaign

Add to the `AGENT_CAMPAIGNS` array:

```typescript
{
  id: 'my_campaign',           // Unique slug (used in URLs)
  name: 'My Campaign Name',    // Display name
  icon: '🔍',                  // Emoji icon
  description: 'Brief description for card display',
  difficulty: 'intermediate',  // beginner | intermediate | advanced | expert
  estimatedTime: '30-45 min',
  tags: ['OSINT', 'Recon'],   // Filterable tags
  color: 'teal',               // Tailwind color for theming
  starterPrompt: `The initial prompt sent to the AI agent...`,
  objectives: [                // Checklist items
    'First objective',
    'Second objective'
  ],
  tools: ['Tool1', 'Tool2'],  // Recommended tools
  steps: [...],               // Optional: step-by-step guidance
  adaptivePrompts: [...]      // Optional: context-triggered prompts
}
```

### Adding OSINT Tools

Add to `OSINT_TOOLS` array:

```typescript
{
  name: 'ToolName',
  purpose: 'What it does',
  whenToUse: 'When to recommend it',
  exampleQuery: 'target.com',
  outputInterpretation: 'How to read results',
  externalUrl: 'https://tool.com'  // Optional
}
```

### Adding Adaptive Responses

Add to `ADAPTIVE_RESPONSES` object:

```typescript
my_scenario: `Markdown guidance text that appears when this scenario is detected...`
```

### Adding Investigation Perspectives

Add to `INVESTIGATION_PERSPECTIVES` array:

```typescript
{ id: 'my_perspective', name: 'Display Name', icon: '🎯', prompt: 'Guiding question...' }
```

### Updating Campaign Categories

Group campaigns in `CAMPAIGN_CATEGORIES`:

```typescript
{ id: 'my_category', name: 'Category Name', campaigns: ['campaign_id_1', 'campaign_id_2'] }
```

### Best Practices

1. **Starter Prompts**: Write detailed, actionable prompts that set context and list specific steps
2. **Objectives**: Keep to 5-7 items; these become the user's checklist
3. **Tools**: Only list tools relevant to the campaign's scope
4. **Difficulty**: Be honest - expert campaigns should require real expertise
5. **Colors**: Use Tailwind colors that contrast well with the dark theme

## External Dependencies

### Core Services
- **PostgreSQL Database**: Primary data store.
- **Replit Auth**: OpenID Connect authentication.
- **OpenRouter AI**: Provides LLM capabilities for the NEXUS agent.

### Third-Party Libraries
- **QRCode Library**: Server-side QR code generation.
- **Framer Motion**: UI animations.
- **Radix UI**: Accessible UI component primitives.
- **TanStack Query**: Server state management.
- **Drizzle ORM**: Type-safe database queries.
- **date-fns**: Date utilities.

## Atropos Scanner Integration

The Atropos scanner is located at `tools/atropos/` and provides:

### Capabilities
- **OSINT Tools**: BBOT, Amass, theHarvester, SpiderFoot, Subfinder
- **Vulnerability Scanning**: Nuclei, httpx, nmap
- **Secret Detection**: Gitleaks, TruffleHog
- **Threat Intelligence**: Shodan, VirusTotal, SecurityTrails, Censys
- **Network Analysis**: DNSMonster, RITA, Zeek

### API Integration
Atropos can be run via:
- **CLI**: `atropos scan <target>` - Direct command line
- **Web UI**: `atropos serve` - Built-in vaporwave dashboard (port 8080)
- **API Endpoints**: `/api/atropos/*` - Node.js proxy to scanner

### NEXUS ↔ Atropos Handoff Flow
1. User initiates scan from NEXUS Investigation Workspace
2. NEXUS calls backend API → spawns Atropos process
3. Atropos runs scan, outputs JSON results
4. NEXUS receives results and offers analysis options:
   - Summarize findings for Report Builder
   - Suggest next steps based on discoveries
   - Cross-reference with campaign objectives
   - Flag high-priority vulnerabilities

### Running Rust on Replit (full tool hosting)

To build and run the Atropos binary on Replit (so `/api/atropos/*` can execute scans instead of returning "binary not found"):

1. **Add the Rust toolchain via Nix**  
   The repo includes a `replit.nix` that adds `rustc` and `cargo` to the environment. If you use the Dependencies tool instead, add **rustc** and **cargo** under **System Dependencies**.

2. **Reload the shell**  
   After changing `replit.nix` or system dependencies, open a new shell or run **Run** so the environment picks up Rust.

3. **Build the Atropos binary**  
   - **Dev**: `npm run build` builds the app and runs `cargo build --release` in `tools/atropos`, then copies the binary to `dist/bin/atropos`.  
   - **Deploy**: The same build runs during deployment; if Rust is in the Nix deps, the deployment image will have `cargo` and the Atropos binary will be built and included.

4. **Optional env vars** (in Secrets or `[env]` in `.replit`):
   - `ATROPOS_BINARY_PATH` — override path to the atropos binary (default: `dist/bin/atropos`).
   - `ATROPOS_SCRIPTS_DIR` — override Lua scripts directory (default: `tools/atropos/examples`).

Without Rust, the app still runs; the build step skips Atropos and the Atropos API returns a health status indicating the binary is not available.

### Lua Scripting
Custom scans via Lua scripts in `tools/atropos/examples/`:
```lua
-- Example: Subdomain enumeration
local bbot = BBOT()
local results = bbot:subdomain_enum("target.com")
for _, subdomain in ipairs(results) do
  println(subdomain)
end
```