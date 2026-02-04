# SysAdmin Corp - Interactive Terminal Game

## Overview
This project is an interactive web-based terminal game, "SysAdmin Corp," featuring a molten bronze/industrial aesthetic. Players navigate a fictional corporate system through a custom terminal interface, collecting clues, completing quests, and uncovering secrets. The game blends mystical/occult elements (tarot cards, zodiac signs, quantum mechanics) with a retro-futuristic corporate hacking narrative. Key capabilities include a custom terminal emulator, a quest and clue system, QR code generation for session management, hidden routes, and atmospheric visual effects. The business vision is to create an engaging "escape room" style CTF experience, providing market potential in interactive narrative gaming and gamified cybersecurity training.

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
- **NEXUS Agent System**: Integrated AI assistant (`AgentChat.tsx`) for payload execution and game interaction, powered by OpenRouter AI. Supports model selection and pre-built investigation campaigns (e.g., OSINT, BGP tracing). Admin can configure system prompt via **Admin → Agent tab** (core identity, capability modules, custom instructions).
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
- **Atropos OSINT Scanner**: Rust-based security scanning tool integrated via REST API (`/api/atropos`). Supports script execution, scan history, remote Atropos server connections, and AI-assisted analysis prompt generation. Findings auto-integrate with investigation contexts.

## Dual-System Architecture: NEXUS + Atropos

The platform operates as a dual-system security investigation platform:

| System | Purpose | Technology | Load Profile |
|--------|---------|------------|--------------|
| **NEXUS** | AI assistant for analysis, reporting, investigation guidance | OpenRouter LLMs | Light API calls |
| **Atropos** | OSINT scanner, vulnerability detection, tool orchestration | Rust CLI binary | Heavy scanning workloads |

### Atropos Integration Files
- `server/routes/atropos.ts` - REST API endpoints for scanning
- `server/services/atropos.ts` - Binary execution and result parsing
- `tools/atropos/` - Atropos source (Rust/Cargo project)

### Atropos API Endpoints
- `GET /api/atropos/health` - Binary availability check
- `GET /api/atropos/scripts` - List available scan scripts
- `POST /api/atropos/scan` - Execute a scan
- `GET /api/atropos/scans/:sessionToken` - Scan history by session
- `POST /api/atropos/remote/scan` - Proxy to remote Atropos server

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

## Git Branch Strategy

### Current Branches
| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Production-ready code with full Atropos integration | Primary |
| `cursor2` | Active development branch (video/session work) | Active |

### Cursor + Replit Workflow Best Practices
When working across both Cursor and Replit Agent:

1. **Use separate branches** - Work on `cursor-dev` in Cursor, `main` for Replit Agent
2. **Pull before switching** - Always `git pull` before starting work in either tool
3. **Commit frequently** - Small commits = easier conflict resolution
4. **Avoid same-file edits** - Don't edit same files in both tools simultaneously
5. **Sync before Agent requests** - Push Cursor changes before asking Agent to make changes
6. **Use GitHub as source of truth** - Both tools push/pull from the same remote

### Merge Command (when needed)
```bash
git merge main --no-edit
# Resolve conflicts if any
git add . && git commit -m "Merge main"
```

## Recent Changes
- **2025-02-04**: Integrated Atropos OSINT scanner routes and services
- **2025-02-04**: Added homepage video with tumbling tarot card animation
- **2025-02-03**: Fixed React infinite loop in GameProvider (useRef for learningProfile)