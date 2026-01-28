# SysAdmin Corp - Interactive Terminal Game

## Overview

This is an interactive web-based terminal game themed around a fictional "SysAdmin Corp" with a molten bronze/industrial aesthetic. Players explore a mysterious corporate system through a custom terminal interface, collecting clues, completing quests, and uncovering hidden secrets. The application features mystical/occult elements (tarot cards, zodiac signs, quantum mechanics themes) layered over a retro-futuristic corporate hacking narrative.

The game includes:
- A custom terminal emulator with command parsing
- Clue collection and quest progression system
- QR code generation for session export/import
- Hidden routes and secret discoveries
- Atmospheric visual effects (glitches, overlays, animations)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: React Context API via `GameProvider` for game state, TanStack Query for server state
- **Styling**: Tailwind CSS v4 with custom theme variables (molten bronze color palette), Framer Motion for animations
- **UI Components**: shadcn/ui component library with Radix UI primitives

**Key Frontend Patterns**:
- Game state persisted to localStorage with server sync
- Custom terminal component with command history and parsing
- Overlay systems for atmospheric effects (ChaosOverlay, MysticalPopups, QuantumField)
- Path aliases: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Build**: Vite for client, esbuild for server bundling
- **API Pattern**: RESTful JSON APIs under `/api/` prefix

**Key Backend Patterns**:
- Storage interface pattern (`IStorage`) with PostgreSQL implementation
- QR code generation for session portability
- Static file serving with SPA fallback for production

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client/server)
- **Migrations**: Drizzle Kit with `db:push` command

**Database Tables**:
- `game_sessions`: Player progress, collected clues, completed quests
- `clues`: Available clues with descriptions and locations
- `quests`: Achievement definitions with requirements
- `command_logs`: Terminal command history tracking

### Key Routes
- `/` - Home page with game introduction
- `/terminal` - Main terminal interface
- `/admin` - Fake login page (part of game)
- `/void` - Hidden secret area
- `/archive` - Document archive with progression-gated content
- `/debug` - System debug panel with fake metrics

## External Dependencies

### Core Services
- **PostgreSQL Database**: Required, connection via `DATABASE_URL` environment variable
- **QRCode Library**: Server-side QR code generation for session export

### Third-Party Libraries
- **Framer Motion**: Animation library for UI effects
- **Radix UI**: Accessible component primitives (dialogs, tabs, tooltips, etc.)
- **TanStack Query**: Server state management and caching
- **Drizzle ORM**: Type-safe database queries with Zod schema validation
- **date-fns**: Date formatting utilities

### Development Tools
- **Vite**: Development server with HMR
- **Replit Plugins**: Dev banner, cartographer, runtime error overlay (dev only)

## Message & Campaign Configuration

### Editing System Messages
All game messages are centralized in config files for easy modification:

**Message Config**: `client/src/config/messages.ts`
- Terminal messages (welcome, errors, system status)
- Toast notifications (clue acquired, access denied, etc.)
- Chaos overlay subliminal messages
- Mystical card hints (tarot and zodiac)
- UI text and labels
- ASCII art logo

To disable a message, set `enabled: false` or comment it out.

**Campaign System**: `client/src/config/campaigns.ts`
- Switch entire themes on the fly by changing `ACTIVE_CAMPAIGN`
- Available campaigns: 'default', 'halloween', 'ctf_event', 'training'
- Each campaign defines its own messages, toasts, chaos text, and UI labels

### QR Code System
The QR code system allows creating executable payloads that mirror real security tools:

**QR Action Types** (in QRCodeModal):
- `raw` - Raw data injection
- `beacon` - C2 beacon check-in
- `exfil` - Data exfiltration
- `inject` - Code injection
- `phish` - Credential harvest redirect
- `dropper` - Payload/artifact dropper
- `pivot` - Network pivot/redirect
- `recon` - Reconnaissance scan
- `persist` - Persistence mechanism
- `crypto` - Cipher/decryption challenge

**Agent Execution API**:
- `POST /api/agent/execute` - Execute QR payloads via external agents
- `GET /api/agent/schema` - Get schema documentation
- Payloads can be given to AI agents or automated systems to execute elsewhere

### Integrations
- **Replit Auth**: OpenID Connect authentication (Google/GitHub/X/Apple/email)
- **OpenRouter AI**: LLM assistance via user's API key (stored in `OPENROUTER_API_KEY` secret)

## NEXUS Agent System

### AI Chat Agent
The NEXUS agent is an integrated AI assistant for executing payloads and interacting with the game:

**Component**: `client/src/components/AgentChat.tsx`
- Floating button available on Home and Terminal pages
- Streaming responses via SSE (Server-Sent Events)
- Model selector with categorized dropdown

**Available Models** (via OpenRouter):
- **Recommended**: Kimi K2.5 (default), Claude 3.5 Haiku
- **Fast & Capable**: Nemotron Ultra, Nemotron Super, GPT-4o-mini
- **Coding**: DeepSeek V3, Qwen3 235B
- **General Free**: Llama 3.3 70B, DeepSeek R1 0528, Gemini Flash 2.0

**Model Shortcuts**: Type in chat to quickly switch models:
- `/kimi` - Kimi K2.5 (recommended)
- `/nemo` - Nemotron Ultra
- `/gpt4o` - GPT-4o-mini
- `/ds` - DeepSeek V3
- `/claude` - Claude 3.5 Haiku
- `/llama` - Llama 3.3 70B

**API Routes**:
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `POST /api/conversations/:id/messages` - Send message (SSE streaming)

## Global Attack Map

### Live Threat Visualization
The home page features an animated global attack map similar to Kaspersky/cybersecurity firm dashboards:

**Component**: `client/src/components/GlobalAttackMap.tsx`
- Animated attack lines between 15 global cities
- 5 attack types: DDoS, Intrusion, Malware, Phishing, Data Exfil
- Live stats: Threats Blocked, Active Monitors, Response Time, Uptime
- Vaporwave/cassette futurism aesthetic with teal contrast

**City Nodes**: New York, London, Tokyo, Sydney, Moscow, Beijing, Singapore, Dubai, São Paulo, Lagos, Mumbai, Berlin, Los Angeles, Toronto, Seoul

## Visual Design

### Color Palette
The design uses a vaporwave/cassette futurism aesthetic:
- **Primary**: Burnt orange/amber (#d97706, #f97316)
- **Accent**: Teal (#14b8a6) for contrast
- **Background**: Deep warm black with gradient overlays
- **No green elements** - intentionally avoiding Matrix-style aesthetics

### Background Effects
- Diagonal gradient with teal and orange accents
- Radial gradient "glow" spots at corners
- Subtle scanline overlay for retro CRT feel
- Mouse-following lens distortion effect