# Atropos - Cybersecurity Training & Investigation Platform

## Overview
Atropos is a professional-grade cybersecurity training and investigation platform that combines:
- **Player Progression System**: XP, levels, skills, achievements, leaderboards, daily challenges
- **Experiential Learning Curriculum**: 427-line framework with 6 OSINT specialization tracks
- **NEXUS AI Agent**: Adaptive teaching assistant with 23 investigation campaigns
- **Atropos Scanner**: Rust-based OSINT & vulnerability scanner with Lua scripting

The platform features a molten bronze/industrial aesthetic, emphasizes hands-on learning (experience > degrees), and provides portfolio-based skill assessment for career development in cybersecurity.

## Latest Updates (Feb 2026) ✨

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
- **QR C2 Framework**: Educational QR-based command & control system with sections for encoding, attack vectors, and hands-on labs for QR-in-QR hijacking exercises.
- **Atropos Scanner Integration**: High-performance Rust-based OSINT and vulnerability scanner. NEXUS initiates scans, Atropos returns JSON results, and NEXUS analyzes findings. Supports custom Lua scripts for extensible scanning logic.
- **Unified Learning Store**: Centralized state for learning preferences (style, goals, skill level, pace) that modifies AI prompt behavior.
- **Pedagogy**: Employs Experiential and Project-Based Learning (PBL) for cybersecurity skills, structured into Paths > Tracks > Modules > Projects.

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