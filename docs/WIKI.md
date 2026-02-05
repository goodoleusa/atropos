# NEXUS Wiki

> Quick reference for architecture, conventions, and decision log.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Components](#key-components)
- [API Reference](#api-reference)
- [Design Decisions](#design-decisions)
- [Changelog](#changelog)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React)                        │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │Terminal │ │ AI Lab   │ │ Campaign │ │ Report Builder │  │
│  │         │ │          │ │ Designer │ │                │  │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └───────┬────────┘  │
│       │           │            │               │            │
│       └───────────┴────────────┴───────────────┘            │
│                          │                                  │
│                    QuickNav + GameProvider                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────┴──────────────────────────────────┐
│                      SERVER (Express)                       │
│  ┌──────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │ Routes   │ │ Agents (6) │ │ Observ.    │ │ Threat     │ │
│  │ /api/*   │ │ Multi-agent│ │ W&B-style  │ │ Intel      │ │
│  └────┬─────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ │
│       │             │              │              │         │
│       └─────────────┴──────────────┴──────────────┘         │
│                          │                                  │
│                    Storage (Drizzle)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  PostgreSQL │
                    └─────────────┘
```

### Layer 1: The Facade
Corporate website aesthetic. Boring enterprise vibes. Nothing to see here.

### Layer 2: The Playground
Hidden terminals, CTF challenges, AI agents, investigation campaigns.

---

## Key Components

### Frontend

| Component | Location | Purpose |
|-----------|----------|---------|
| Terminal | `client/src/components/Terminal.tsx` | Custom command interface with secret commands |
| Campaign Designer | `client/src/components/CampaignDesigner.tsx` | Visual flow editor for investigations |
| QuickNav | `client/src/components/QuickNav.tsx` | Floating navigation hub |
| AI Lab | `client/src/pages/AILab.tsx` | Prompt playground + model comparison |
| Report Builder | `client/src/components/ReportBuilder.tsx` | Bug bounty writeup tool |

### Backend

| Module | Location | Purpose |
|--------|----------|---------|
| Routes | `server/routes.ts` | All REST endpoints |
| Storage | `server/storage.ts` | Database interface (Drizzle) |
| Observability | `server/observability.ts` | W&B-style LLM tracing |
| Agents | `server/routes.ts` (agents section) | 6 specialized security agents |

### Shared

| File | Purpose |
|------|---------|
| `shared/schema.ts` | Drizzle ORM schema + Zod types |

---

## API Reference

### Core Endpoints

```
GET  /api/health              - Health check
POST /api/session             - Create/get session
GET  /api/clues               - List collected clues
POST /api/terminal/command    - Execute terminal command
```

### Campaign Designer

```
GET    /api/designer/campaigns           - List all campaigns
POST   /api/designer/campaigns           - Create campaign
PATCH  /api/designer/campaigns/:id       - Update campaign
DELETE /api/designer/campaigns/:id       - Delete campaign
POST   /api/campaigns/:id/drafts         - Create draft version
GET    /api/campaigns/:id/versions       - Get version history
POST   /api/campaigns/:id/publish        - Publish draft
GET    /api/campaigns/:id/compare        - Diff two versions
```

### AI Agents

```
POST /api/agents/analyze      - Route to specialized agent
GET  /api/agents/models       - List available models
POST /api/chat                - General AI chat
```

### Threat Intelligence

```
GET /api/threat-intel/urlhaus      - Malware URLs
GET /api/threat-intel/threatfox    - IOCs
GET /api/threat-intel/malwarebazaar - Malware samples
GET /api/threat-intel/cisa-kev     - Exploited vulns
GET /api/threat-intel/nvd-cve      - CVE database
GET /api/threat-intel/ransomware   - Ransomware groups
```

---

## Design Decisions

### 2026-02-05: Campaign Version Control
**Decision**: Implement draft/publish workflow with version history  
**Rationale**: Allow iteration on campaigns without affecting live content  
**API**: `/api/campaigns/:id/drafts`, `/api/campaigns/:id/versions`

### 2026-02-05: W&B-Style Observability
**Decision**: Add token counting, cost estimation, latency tracking for LLM calls  
**Rationale**: Debug AI costs and performance without external services  
**Location**: `server/observability.ts`

### 2026-01-30: Multi-Agent Architecture
**Decision**: 6 specialized agents vs single general agent  
**Rationale**: Better accuracy for domain-specific analysis  
**Agents**: VulnAnalyst, OSINTAnalyst, ThreatIntel, SecretHunter, NetworkRecon, Synthesis

### 2026-01-28: Dual-Layer Design
**Decision**: Corporate facade with hidden CTF underneath  
**Rationale**: Teaches security through discovery, not lectures

---

## Changelog

### 2026-02-05
- Added campaign version control (draft/publish workflow)
- Integrated W&B-style observability for AI tracing
- Updated README with dual-layer concept explanation
- Enhanced QuickNav with Campaign Designer + Bounties
- Fixed all 6 threat intelligence feeds

### 2026-01-31
- Added Campaign Designer with wikilinks
- Implemented learning profile system
- Added modmail support ticket system

### 2026-01-30
- Multi-agent orchestration (6 agents)
- QR C2 framework with challenge modes
- Mobile floating menu with accessibility

### 2026-01-28
- Initial platform setup
- Terminal, clue system, quest chains
- AI Lab + Report Builder

---

*See [ROADMAP.md](./ROADMAP.md) for future features and ideas.*
