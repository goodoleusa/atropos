# NEXUS Security Platform

## Overview
NEXUS is an AI-powered security investigation platform comprising the NEXUS Agent (AI assistant for analysis, reporting, and investigation guidance) and Atropos Scanner (Rust-based OSINT & vulnerability scanning). The platform integrates these two systems, allowing Atropos to collect data and NEXUS to provide intelligent analysis, reporting, and strategic recommendations. It features a molten bronze/industrial aesthetic with a custom terminal interface, investigation campaigns, and gamified CTF-style security training, aiming to provide AI-powered investigation workflows, a visual campaign designer, and a report builder.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: React Context API (`GameProvider`), TanStack Query.
- **Styling**: Tailwind CSS v4 (molten bronze palette) and Framer Motion.
- **UI Components**: shadcn/ui built on Radix UI.
- **Key Patterns**: Game state persistence, custom terminal, atmospheric overlays.

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

### Key Features and Design Decisions
- **Theming & Aesthetics**: Vaporwave/cassette futurism with a molten bronze/teal palette. No green elements.
- **Terminal System**: Custom command parsing, history, and secret command discovery.
- **Game Progression**: Clue collection, quest chains, and unlockable content.
- **Dynamic Content**: Centralized message and campaign configuration for terminal messages, toasts, and overlays; campaigns switch themes and narratives.
- **Security Design (Intentionally Vulnerable)**: Designed as an "escape room" CTF with simulated hacking capabilities, while preventing real attacks.
- **NEXUS Agent System**: Integrated AI assistant powered by OpenRouter AI for security investigation analysis and guidance, supporting model selection and pre-built campaigns. Admin-configurable system prompt.
- **Admin Dashboard**: Content management for game elements, live session data, and a UX Playground for visual effect tweaking.
- **Campaign Designer**: Twine-inspired visual flow editor with Obsidian-style wikilinks and breadcrumb metadata for conditional decision trees. Includes various view modes and node metadata for features, campaign types, skills, and branch conditions. Supports quick-start templates.
- **Global Attack Map**: Animated real-time threat visualization on the homepage.
- **Report Builder System**: Aids in structuring bug bounty findings with AI benchmarking and shared investigation context.
- **Shared Investigation Context**: Cross-feature state management enabling data flow between Agent Chat, AI Lab, and Report Builder.
- **AI Lab (Battleground)**: Prompt engineering playground with live preview, cost tracking, model comparison, performance evaluations, and AI-driven improvement recommendations. Includes **AI Pentesting Challenges** based on cutting-edge LLM attacks.
- **AI Pentesting Challenges**: 10 research-based challenges covering advanced LLM attacks like GCG, SequentialBreak, RoleBreaker, Model Collapse, Context Collapse, RAG Embedding Attack, Guardrail Evasion, Many-Shot Jailbreak, Decoherence Induction, and Agents Rule of Two.
- **Prompt Optimizer**: Provides quick tips for effective prompt engineering.
- **QuickNav Component**: Floating navigation for quick access to Terminal, AI Lab, and Report Builder.
- **API Playground**: Educational quest-based system for learning API requests through CTF exercises.
- **Interactive Campaign System**: Adaptive investigation flows that respond to user discoveries.
- **Mobile Responsiveness**: Touch-friendly terminal with autocomplete chips, responsive layouts, and touch targets.
- **Investigation Workspace**: Unified hub for Agent Chat, AI Lab quick testing, and Learning Profile configuration.
- **Unified Learning Store**: Centralized state management for learning preferences, used to modify AI interactions.
- **Campaign Designer Learning Integration**: Nodes support learning goals, skill levels, and teaching notes metadata.
- **Mobile Node Ordering**: Campaign Designer includes 3x3 button grid for node hierarchy management and keyboard navigation.

### Atropos Scanner Integration
The Atropos scanner (located at `tools/atropos/`) provides OSINT, vulnerability scanning, secret detection, threat intelligence, and network analysis capabilities. It can be run via CLI, a built-in web UI, or API endpoints. NEXUS integrates with Atropos by spawning scan processes, receiving JSON results, and offering analysis options for summarization, next steps, and vulnerability flagging. The scanner also supports Lua scripting for custom scans.

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