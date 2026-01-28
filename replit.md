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
- **NEXUS Agent System**: Integrated AI assistant (`AgentChat.tsx`) for payload execution and game interaction, powered by OpenRouter AI. Supports model selection and pre-built investigation campaigns (e.g., OSINT, BGP tracing).
- **Admin Dashboard**: Content management for clues, quests, messages, mystical elements, and a UX Playground for real-time visual effect tweaking (backgrounds, mouse tracking, glitches, event probabilities).
- **Global Attack Map**: Animated real-time threat visualization on the homepage, simulating cybersecurity dashboards.
- **Report Builder System**: Aids in structuring bug bounty findings with sections for analysis, vulnerability tracking, bounty estimation, and export.
- **Prompt Builder System**: A 4-step process to optimize AI agent interaction by selecting capabilities, compressing history, defining tasks, and generating prompts.
- **Interactive Campaign System**: Adaptive investigation flows that respond to user discoveries, offering perspective shifts, tool guidance (e.g., Shodan, Censys), and pivot strategies.

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