# NEXUS Security Platform

## Overview
NEXUS is an AI-powered security investigation platform that integrates the **NEXUS Agent** (AI assistant for analysis, reporting, and guidance) and the **Atropos Scanner** (Rust-based OSINT & vulnerability scanner). The platform aims to enhance security professionals' efficiency through AI-driven workflows, a visual campaign designer, a report builder, and gamified CTF-style security training. It features a unique molten bronze/industrial aesthetic with a custom terminal interface and atmospheric visual effects.

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