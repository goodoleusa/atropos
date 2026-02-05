# NEXUS Security Platform

## Agent Coordination

For cross-agent communication between Replit and Cursor:
- **[docs/AGENT_LOG.md](docs/AGENT_LOG.md)** — Message stream between agents (add entries at TOP)
- **[docs/WIKI.md](docs/WIKI.md)** — Architecture reference and decision log
- **[docs/ROADMAP.md](docs/ROADMAP.md)** — Future features and ideas parking lot

## Overview
NEXUS is an AI-powered security investigation platform comprising the **NEXUS Agent** (AI assistant for analysis, reporting, and guidance) and the **Atropos Scanner** (Rust-based OSINT & vulnerability scanner). Atropos collects data, which NEXUS then intelligently analyzes, helps interpret, and aids in report generation and strategic planning. The platform features a unique molten bronze/industrial aesthetic with a custom terminal interface, investigation campaigns, and atmospheric visual effects. Key capabilities include AI-powered investigation workflows, a visual campaign designer, a report builder, and gamified CTF-style security training. The project aims to provide a comprehensive, AI-driven solution for security professionals, enhancing investigation efficiency and offering unique training opportunities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: React Context API (`GameProvider`) for game state, TanStack Query for server state.
- **Styling**: Tailwind CSS v4 (molten bronze palette) and Framer Motion for animations.
- **UI Components**: shadcn/ui built on Radix UI.
- **Key Patterns**: Game state persistence (localStorage, server sync), custom terminal, atmospheric overlays.
- **Theming & Aesthetics**: Vaporwave/cassette futurism with a molten bronze/teal palette. No green elements.
- **Mobile Responsiveness**: Touch-friendly terminal, responsive layouts, 44px+ touch targets, repositioned floating buttons.

### Backend
- **Runtime**: Node.js with Express.
- **Language**: TypeScript with ESM modules.
- **Build**: Vite (client), esbuild (server).
- **API Pattern**: RESTful JSON APIs (`/api/`).
- **Key Patterns**: Storage interface with PostgreSQL implementation, QR code generation, static file serving with SPA fallback.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM.
- **Schema**: `shared/schema.ts`.
- **Migrations**: Drizzle Kit.

### Key Features and Design Decisions
- **Terminal System**: Custom command parsing, history, and secret command discovery.
- **Game Progression**: Clue collection, quest chains, and unlockable content.
- **Dynamic Content**: Centralized message and campaign configuration for terminal messages, toasts, and overlays. Campaigns switch themes and narratives.
- **Security Design (Intentionally Vulnerable)**: Designed as an "escape room" CTF; allows enumeration and simulated hacking, preventing real attacks with input sanitization, rate limiting, CSP, and session validation.
- **NEXUS Agent System**: AI assistant for security investigation analysis and guidance, powered by OpenRouter AI. Supports model selection and pre-built investigation campaigns. Admin configurable system prompt. Works with Atropos Scanner results.
- **Multi-Agent Orchestration**: 6 specialized security agents (VulnAnalyst, OSINTAnalyst, ThreatIntel, SecretHunter, NetworkRecon, Synthesis) with category-based routing. Supports parallel analysis, W&B experiment tracking, and CrewAI/LangChain export. API: `/api/agents/*`.
- **Mobile Floating Menu**: Consolidated mobile navigation (MobileFloatingMenu.tsx) with proper ARIA accessibility, touch-friendly 48px targets, and keyboard escape handling.
- **Admin Dashboard**: Content management for game elements, player sessions, and a UX Playground for visual effect tweaking.
- **Campaign Designer**: Twine-inspired visual flow editor with wikilinks, backlinks, breadcrumb trail, and multiple view modes. Nodes support feature type, campaign type, skills, linked clues, and branch conditions. Includes quick-start templates.
- **Global Attack Map**: Animated real-time threat visualization on the homepage.
- **Report Builder System**: Aids in structuring bug bounty findings, analysis, vulnerability tracking, bounty estimation, and export. Integrates AI benchmarking and shared investigation context.
- **Shared Investigation Context**: Cross-feature state management via `useReportContext` for data flow between Agent Chat, AI Lab, and Report Builder.
- **AI Lab (Battleground)**: Prompt engineering playground with live preview, cost tracking, model comparison, performance evaluations, and exportable summaries. Features a unified chat battleground for dual-model comparison and AI Pentesting Challenges based on 2025 arxiv research (e.g., GCG, SequentialBreak, RoleBreaker).
- **Prompt Optimizer**: Provides quick tips for prompt engineering techniques.
- **QuickNav Component**: Floating navigation for quick access to Terminal, AI Lab, Report Builder, Campaign Designer, and Bounties with session status and progress indicators.
- **API Playground**: Educational quest-based system for learning API requests through CTF exercises.
- **Interactive Campaign System**: Adaptive investigation flows responding to user discoveries, offering perspective shifts and tool guidance.
- **Investigation Workspace**: Unified hub for Agent Chat, AI Lab quick testing, and Learning Profile configuration.
- **Unified Learning Store**: Zustand-based centralized state for learning preferences (style, goals, skill level, pace), persisting to localStorage and providing prompt modifiers for AI interactions. Integrated with Campaign Designer nodes.
- **Modmail System**: User support ticket system for questions and admin responses. Users submit tickets via ModmailDialog, admins respond via Admin Dashboard Modmail tab. Categories: general, bug, feature, question, help. API: `/api/modmail`, `/api/admin/modmail`.
- **Multiplayer Lobbies**: Anonymous real-time session system for co-op, versus, or race modes. Players join/create lobbies with aliases, max 8 players per lobby, 1-hour expiry. API: `/api/lobbies`.
- **Zodiac Engagement Effects**: 60% chance bonus collectibles/tips when collecting zodiac cards, element-based rewards (Fire, Earth, Air, Water).
- **Mystical Cards Admin**: Full editing capabilities for tarot and zodiac cards in Admin Dashboard CollectiblesSection.
- **QR C2 Framework**: Educational QR-based command & control system with three sections:
  - **Encode**: Generate C2 command QR codes with realistic target machine simulation (Linux Server, Windows Workstation, IoT Camera, Docker Container). Simulates authentic command outputs.
  - **Attack Vectors**: 13 real-world QR ingestion techniques (parking meters, restaurant menus, phishing emails, EV chargers, etc.) with documented cases and lab scenarios.
  - **QR Labs**: 6 hands-on QR-in-QR hijacking exercises based on academic research (finder pattern confusion, quiet zone attacks, physical overlays, barcode inception, split QR, PDF vector drawing).
  - **Challenge Modes**: Dead Drop, Stego Hunter, Temporal Ghost (TPVM), QR Hijacker, Breadcrumb Trail, QR Inception.
- **Design Philosophy**: TPVM-inspired aesthetic - looks normal with brief subliminal disruptions (concept noted for future implementation).
- **Threat Intelligence Feeds**: Live data from URLhaus (malware URLs), ThreatFox (IOCs), MalwareBazaar (samples), CISA KEV (exploited vulns), NVD CVE (database), Ransomware.live (groups). Specialized parsers for JSON and CSV formats.
- **Campaign Version Control**: Draft/publish workflow with version history, changelog tracking, and diff comparison. API: `/api/campaigns/:id/drafts`, `/api/campaigns/:id/versions`.
- **AI Observability**: W&B-style experiment tracking for LLM calls with token counting, cost estimation, latency metrics, and trace logging via `server/observability.ts`.

### Atropos Scanner Integration
- **Capabilities**: OSINT (BBOT, Amass, theHarvester), Vulnerability Scanning (Nuclei, httpx, nmap), Secret Detection (Gitleaks, TruffleHog), Threat Intelligence (Shodan, VirusTotal), Network Analysis (DNSMonster, RITA, Zeek).
- **API Integration**: Can be run via CLI, Web UI, or Node.js proxy endpoints (`/api/atropos/*`).
- **NEXUS ↔ Atropos Handoff**: NEXUS initiates scans, Atropos returns JSON results, NEXUS analyzes findings, suggests next steps, and flags vulnerabilities.
- **Lua Scripting**: Custom scans via Lua scripts.

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