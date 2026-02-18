# Atropos - Cybersecurity Training & Investigation Platform

## Overview
Atropos is a professional-grade cybersecurity training and investigation platform that combines:
- **Player Progression System**: XP, levels, skills, achievements, leaderboards, daily challenges
- **Experiential Learning Curriculum**: 427-line framework with 6 OSINT specialization tracks
- **NEXUS Lead Architect**: Multi-agent orchestrator with crew delegation, Mission Bus integration, and automatic context compression
- **Crew Orchestration**: 6 specialist agents (VulnAnalyst, OSINTAnalyst, ThreatIntel, SecretHunter, NetworkRecon, Synthesis) with real-time status tracking
- **Atropos Scanner**: Rust-based OSINT & vulnerability scanner with Lua scripting
- **QR C2 Framework**: Educational command & control system with guided missions, 6 hands-on labs, and multi-target simulation
- **SpiderFoot Integration**: OSINT reconnaissance with streaming scan results and export capabilities

The platform features a molten bronze/industrial aesthetic, emphasizes hands-on learning (experience > degrees), and provides portfolio-based skill assessment for career development in cybersecurity.

## Latest Updates (Feb 2026)

### NEXUS Lead Architect & Crew Orchestration (Feb 18 2026)
- **NEXUS Elevated to Lead Architect**: System prompt dynamically includes Mission Bus findings (up to 8 latest) and crew agent status for bird's-eye platform awareness
- **Crew Status Panel**: `client/src/components/CrewStatusPanel.tsx` — real-time display of 6 specialist agents with status (idle/running/complete/error), findings count, tier-based colors (red/amber/emerald)
- **Mission Bus Integration**: Agent chat injects live mission findings and background tasks into NEXUS context on every message via `useMissionFindings` and `useBackgroundTasks` hooks
- **Memory Compression UI**: Manual compress button, token/message count status bar, compressed state badge, bus findings count badge in `AgentChat.tsx`
- **System Prompt Upgrade**: `buildSystemPrompt` in `client/src/config/agentPrompts.ts` now accepts `missionBus` and `crewStatus` parameters
- **Wiki Docs Updated**: New wiki sections for Crew Orchestration, Mission Bus, and Context & Memory Management on `/wiki` page
- **Key Files**: `client/src/config/agentPrompts.ts`, `client/src/components/AgentChat.tsx`, `client/src/components/CrewStatusPanel.tsx`, `client/src/pages/Wiki.tsx`

### AdminDashboard Modularization (Feb 18 2026)
- **Reduced from 2411 → 385 lines**: Parent file now contains only layout, auth gate, sidebar navigation, and content routing
- **14 extracted panel components** in `client/src/pages/admin/`:
  - 9 standalone panels: `ActivityLogPanel`, `QuickAccessSection`, `SitemapPanel`, `SessionsPanel`, `BehaviorAnalyticsPanel`, `AgentConfigPanel`, `CampaignDesignerPanel`, `ModmailPanel`, `AtroposScannerPanel`
  - 5 bundled in `AdminUtilityPanels.tsx`: `MessagesPanel`, `TerminalPanel`, `ConfigPanel`, `CampaignsPanel`, `GraphPanel`
- **Shared nav config**: `client/src/config/adminNav.ts` exports `NAV_GROUPS`, `NAV_ICONS`, `GROUP_COLORS`, `ACTIVE_COLORS`, `Clue`/`Quest` types
- **Templates manifest updated**: All 21 admin panel files registered in `templates/manifest.json` base files
- **Pre-existing admin panels** (not touched this round): `AgentConfigSection`, `AgentModulesSection`, `CollectiblesSection`, `CurriculumSection`, `EffectsPlaygroundSection`, `FeedbackSection`, `GameplaySection`, `QuestsSection`, `QuickPushSection`

### Admin Authentication System
- **Replit Auth Integration**: OpenID Connect login via Replit (Google, GitHub, email) for admin access
- **Admin Gate**: `/admin` dashboard requires sign-in; unauthenticated users see login screen
- **Backend Protection**: All `/api/admin/*` routes protected with `isAdmin` middleware; curriculum, gameplay, and content write routes also protected
- **ADMIN_USER_IDS**: Optional env var to restrict admin access to specific user IDs (comma-separated). When unset, any authenticated user has admin access
- **User Info**: Sidebar shows logged-in user with logout button
- **Key Files**: `server/adminAuth.ts` (middleware), `server/replit_integrations/auth/` (Replit Auth integration), `client/src/hooks/use-auth.ts` (React hook)

### v2.2 - Builder-Sitemap Integration & Obsidian Export
- **Interactive Sitemap Panel**: Admin Dashboard sitemap with tree/grid view, category filtering, inline edit/delete, custom page creation with arc template picker
- **Bidirectional Builder-Sitemap Sync**: Campaign save auto-creates sitemap entry at `/play/[id]`; publish/unpublish toggles sitemap `isPublished`; sitemap "Open in Builder" pre-loads campaign or arc template
- **Obsidian Export Overhaul**: Full Templater (`<%* %>` script blocks), Breadcrumbs (`parent`/`child`/`sibling` fields, `BC-folder-note`), Excalibrain (`excalibrain-color`/`excalibrain-shape`), and Dataview (TABLE/LIST queries, clue summaries) compatibility
- **Portfolio Viz Picker**: Radar, severity donut, timeline, donut, or none per entry; post-creation editing of viz type, tags, evidence, visibility
- **Wiki Docs**: New sections for Campaign Builder & Sitemap, Obsidian Vault Export, Portfolio System, QR C2 Framework
- **Storage Methods**: `getSitemapEntryByPath`, `upsertSitemapEntryByPath` for database-backed sitemap sync
- **URL Params**: Builder accepts `?arc=` and `?page=` for pre-loading arc templates and page configurations

### Agent Recommendation System
- **Auto-Generated Recommendations**: NEXUS agents emit `recommendation` JSON blocks during conversations with starter code, target files, pain points
- **Suggestions Dashboard**: `/suggestions` with Recommendations + Reports tabs, category charts, filtering, voting
- **6+ Export Formats**: AI prompt, code only, git patch, curl command, JSON, markdown — for piping into Replit Agent, Cursor, Copilot, Claude
- **Repository Sync**: POST `/api/recommendations/sync` auto-generates `.github/RECOMMENDATIONS.md` and `.github/recommendations.json`
- **API**: Full CRUD at `/api/recommendations` with stats, voting, and export endpoints
- **Wiki Docs**: Step-by-step guide for generating, exporting, and syncing recommendations

### QR C2 Framework & Guided Missions
- **3 Guided C2 Missions**: First Beacon (beaconing), Receiving Orders (tasking), Ghost in the Wire (evasion)
- **4 Simulated Target Machines**: Linux server, Windows workstation, IoT camera, Docker container
- **6 QR-in-QR Hijacking Labs**: Finder pattern confusion, quiet zone attacks, physical sticker attacks, barcode inception, split QR email attacks, programmatic PDF QR
- **C2 Simulation Console**: Multi-target command execution with realistic responses per OS type
- **Mission XP Rewards**: 50-100 XP per mission with clue collection integration
- **Attack Flow Presets**: Raw payload, C2 beacon, data exfiltration, credential harvesting templates

### SpiderFoot Integration
- **Streaming Scan Results**: Real-time OSINT scan output with progress indicators
- **Result Export**: Export SpiderFoot findings for use in investigations
- **Scanner Dashboard Integration**: Unified view with Atropos Scanner results

### Player Progression & Gamification
- **XP & Leveling**: Earn experience through investigations, progress from level 1 to 50+
- **Skill Specializations**: OSINT, Network Security, Malware Analysis, Social Engineering
- **500+ Achievements**: Common, Rare, Epic, Legendary tiers with automatic rewards
- **Global Leaderboards**: Compete with investigators worldwide, real-time rankings
- **Daily Challenges**: Rotating objectives with XP and currency rewards
- **Player Profiles**: Comprehensive dashboard at `/profile` showing stats, achievements, progress

### Experiential Learning Curriculum
- **Mission-Critical Philosophy**: Experience and skills outweigh traditional degrees
- **80/20 Learning Model**: 80% hands-on practice, 20% theory
- **6 OSINT Specialization Tracks**: Geolocation, SOCMINT, Financial Investigation, Crypto/Blockchain, Nation-State Threat Intel, Dark Web Intelligence
- **5 Learning Styles**: Experiential, Visual, Analytical, Social, Pragmatic - AI adapts to your preference
- **Portfolio Assessment**: Demonstrate skills through investigations, not exams
- **Career-Focused**: Every campaign maps to real security job roles

### Enhanced Campaign System
- **23 Investigation Campaigns**: From beginner to expert difficulty
- **Learning Integration**: Each campaign specifies objectives, skills taught, industry context
- **Real-World Examples**: Based on actual incidents (Panama Papers, Silk Road, APT campaigns)
- **Teaching Adaptations**: Different guidance for each learning style
- **Campaign Analytics**: Track completion rates, difficulty, player feedback

### Smart Build System
- **Atropos Caching**: Build Rust scanner once (2-3 min), reuse forever (~100ms)
- **npm run build:atropos**: One-time build command
- **Persistent Cache**: Survives dist cleanup, reduces deployment time

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Styling**: Tailwind CSS v4 (molten bronze palette) and Framer Motion for animations.
- **UI Components**: shadcn/ui built on Radix UI.
- **Theming & Aesthetics**: Vaporwave/cassette futurism with a molten bronze/teal palette, no green elements.
- **Mobile Responsiveness**: Touch-friendly terminal, responsive layouts, 44px+ touch targets.

### Backend
- **Runtime**: Node.js with Express.
- **Language**: TypeScript with ESM modules.
- **API Pattern**: RESTful JSON APIs.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM.

### Key Features and Design Decisions
- **NEXUS Agent System**: AI assistant for security investigation analysis and guidance, powered by OpenRouter AI. Supports model selection and pre-built investigation campaigns, integrates with Atropos Scanner results.
- **Multi-Agent Orchestration**: 6 specialized security agents (VulnAnalyst, OSINTAnalyst, ThreatIntel, SecretHunter, NetworkRecon, Synthesis) with category-based routing for parallel analysis.
- **Terminal System**: Custom command parsing, history, and secret command discovery.
- **Campaign Designer**: Twine-inspired visual flow editor for creating investigation campaigns with features like wikilinks, backlinks, and multiple view modes.
- **Report Builder System**: Aids in structuring bug bounty findings, analysis, vulnerability tracking, and export. Integrates AI benchmarking and shared investigation context.
- **AI Lab (Battleground)**: Prompt engineering playground with live preview, cost tracking, model comparison, and performance evaluations. Features a unified chat battleground for dual-model comparison and AI Pentesting Challenges.
- **QR C2 Framework**: Educational QR-based command & control system with guided missions, multi-target simulation console, 6 hands-on QR hijacking labs, attack flow presets, and XP rewards. Teaches beaconing, tasking, evasion techniques with real-world APT case studies.
- **SpiderFoot Integration**: OSINT reconnaissance tool with streaming scan results, real-time progress, and export capabilities for investigation integration.
- **Atropos Scanner Integration**: High-performance Rust-based OSINT and vulnerability scanner. NEXUS initiates scans, Atropos returns JSON results, and NEXUS analyzes findings. Supports custom Lua scripts for extensible scanning logic.
- **Unified Learning Store**: Centralized state for learning preferences (style, goals, skill level, pace) that modifies AI prompt behavior.
- **Pedagogy**: Employs Experiential and Project-Based Learning (PBL) for cybersecurity skills, structured into Paths > Tracks > Modules > Projects.
- **Portfolio System**: Users can showcase investigations, reports, and achievements with shareable content.

### Templates / Starter Kit System
- **Location**: `templates/` folder
- **Manifest**: `templates/manifest.json` — registry of all 13 feature modules with descriptions, dependencies, file listings, schema tables, nav entries
- **Base Template**: `templates/base/` — core Express server, React frontend, PostgreSQL/Drizzle, Tailwind CSS, molten-bronze theme
- **Feature Modules**: `templates/modules/<name>/` — each has `module.json` (injection config) and optional `schema.ts` (DB tables)
- **Setup Script**: `templates/setup.sh` — interactive or CLI-driven assembler
  - Presets: `minimal`, `learner`, `security-analyst`, `marketing`, `full`
  - Custom: pick individual modules by name
  - Usage: `bash templates/setup.sh <preset> <output_dir>` or run interactively
- **13 Modules**: nexus-ai, terminal, campaigns, scanner-osint, qr-c2, gamification, behavior-analysis, report-builder, portfolio, ai-lab, wiki, spiderfoot, crew-builder
- **Module JSON fields**: `inject.schema_tables`, `inject.nav_items`, `inject.routes_import/register`, `inject.app_import/route`, `inject.providers`, `inject.env_keys`
- **How it works**: setup.sh copies base files, appends module schemas to `shared/schema.ts`, injects nav entries into `navConfig.ts`, adds routes/imports to `App.tsx` and `routes.ts` via placeholder comments (`/* MODULE_IMPORTS */`, `/* MODULE_ROUTES */`, etc.)

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
