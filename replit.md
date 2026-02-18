# Atropos - Cybersecurity Training & Investigation Platform

## Overview
Atropos is a professional-grade cybersecurity training and investigation platform designed for experiential learning. It combines a player progression system, an extensive experiential learning curriculum with OSINT specialization tracks, and a multi-agent orchestrator (NEXUS Lead Architect). The platform emphasizes hands-on learning, portfolio-based skill assessment, and career development in cybersecurity. Key capabilities include a Rust-based OSINT & vulnerability scanner, an educational command & control framework, and SpiderFoot integration for OSINT reconnaissance. The platform's vision is to provide a comprehensive, engaging, and career-focused environment for aspiring and professional cybersecurity investigators.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Styling**: Tailwind CSS v4 with a molten bronze palette and Framer Motion for animations.
- **UI Components**: shadcn/ui built on Radix UI, adhering to a vaporwave/cassette futurism aesthetic with no green elements.
- **Responsiveness**: Mobile-first design with touch-friendly terminals and responsive layouts.

### Backend
- **Runtime**: Node.js with Express.
- **Language**: TypeScript with ESM modules.
- **API Pattern**: RESTful JSON APIs.

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM.

### Key Features and Design Decisions
- **NEXUS Agent System**: An AI assistant powered by OpenRouter AI for security investigation analysis and guidance. It supports model selection, pre-built investigation campaigns, and integrates with the Atropos Scanner.
- **Multi-Agent Orchestration**: Features 6 specialized security agents (VulnAnalyst, OSINTAnalyst, ThreatIntel, SecretHunter, NetworkRecon, Synthesis) with category-based routing for parallel analysis, orchestrated by NEXUS.
- **Terminal System**: Custom command parsing, history, and secret command discovery for interactive learning.
- **Campaign Designer**: A Twine-inspired visual flow editor for creating investigation campaigns with features like wikilinks and backlinks.
- **Report Builder System**: Assists in structuring bug bounty findings, vulnerability tracking, and export, with AI benchmarking and shared investigation context.
- **AI Lab (Battleground)**: A prompt engineering playground offering live preview, cost tracking, model comparison, and performance evaluations for AI models, including AI Pentesting Challenges.
- **QR C2 Framework**: An educational QR-based command & control system with guided missions, multi-target simulation, and hands-on QR hijacking labs to teach beaconing, tasking, and evasion techniques.
- **SpiderFoot Integration**: OSINT reconnaissance tool providing streaming scan results and export capabilities.
- **Atropos Scanner Integration**: A high-performance Rust-based OSINT and vulnerability scanner. NEXUS initiates scans, processes JSON results, and analyzes findings, supporting custom Lua scripts.
- **Unified Learning Store**: Centralized state management for user learning preferences (style, goals, skill level, pace) to dynamically adapt AI prompt behavior and curriculum delivery.
- **Pedagogy**: Employs Experiential and Project-Based Learning (PBL) structured into Paths > Tracks > Modules > Projects for cybersecurity skill development.
- **Player Progression & Gamification**: Includes XP, leveling, skill specializations, over 500 achievements, global leaderboards, and daily challenges.
- **Experiential Learning Curriculum**: A 427-line framework with 6 OSINT specialization tracks, accommodating 5 learning styles and focusing on portfolio-based skill assessment.
- **Enhanced Campaign System**: Features 23 investigation campaigns of varying difficulty, based on real-world incidents and aligned with industry context.
- **Smart Build System**: Optimizes build times for the Rust scanner with persistent caching.
- **Admin Dashboard**: Modularized admin interface with numerous panels for activity logs, user sessions, agent configuration, campaign design, and scanner management.
- **APT Case Study Campaigns**: 8 documented APT campaigns based on public threat intelligence with real MITRE ATT&CK Mappings and defanged IOCs for educational purposes.
- **Admin Authentication System**: Integrates Replit Auth for OpenID Connect login, securing admin routes and content write operations with optional `ADMIN_USER_IDS` environment variable.
- **Builder-Sitemap Integration & Obsidian Export**: Interactive sitemap panel in the Admin Dashboard with bidirectional sync to the campaign builder. Enhanced Obsidian export for campaign metadata, supporting Templater, Breadcrumbs, Excalibrain, and Dataview.
- **Agent Recommendation System**: NEXUS agents auto-generate recommendations with starter code and target files, accessible via a dashboard with various export formats and repository synchronization.
- **Templates / Starter Kit System**: A modular system allowing users to assemble custom project environments from a base template and 13 feature modules via an interactive setup script.

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