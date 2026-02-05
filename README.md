# NEXUS Security Platform

> *"On the surface, a corporate network solutions company. Underneath, a sprawling cybersecurity escape room."*

**NEXUS** is a dual-layer security training platform disguised as a mundane business website. Visitors see "SysAdmin Corp" — a boring enterprise IT company. But scratch beneath the surface and you'll find hidden terminals, encrypted clues, AI-powered investigation campaigns, and a full CTF training ground.

## The Concept

**Layer 1: The Facade**
A pixel-perfect corporate site. Network diagrams, service pages, contact forms. Nothing suspicious here. Move along.

**Layer 2: The Playground**
Hidden commands in the terminal. QR codes that execute C2 payloads. Threat intelligence feeds from real sources. Six specialized AI agents ready to analyze your findings. An investigation campaign system that adapts to your discoveries.

The platform teaches security through *experience* — not lectures. Find the entry points. Collect the clues. Complete the quests. Level up.

---

## Core Systems

### NEXUS Agent
AI-powered investigation assistant with 6 specialized agents:
- **VulnAnalyst** — Vulnerability assessment and prioritization
- **OSINTAnalyst** — Open source intelligence gathering
- **ThreatIntel** — IOC analysis and threat correlation
- **SecretHunter** — Credential and secret detection
- **NetworkRecon** — Infrastructure mapping
- **Synthesis** — Multi-source analysis coordination

### Atropos Scanner
Rust-based OSINT toolkit integrating:
- Recon: BBOT, Amass, theHarvester, Subfinder
- Scanning: Nuclei, httpx, nmap
- Secrets: Gitleaks, TruffleHog
- Intel: Shodan, VirusTotal, SecurityTrails
- Custom: Lua scripting engine

### Threat Intelligence Feeds
Live data from real sources:
- **URLhaus** — Malware URLs
- **ThreatFox** — IOCs (IPs, domains, hashes)
- **MalwareBazaar** — Malware samples
- **CISA KEV** — Known exploited vulnerabilities
- **NVD CVE** — CVE database
- **Ransomware.live** — Active ransomware groups

### Campaign Designer
Visual flow editor for creating investigation scenarios:
- Twine-style wikilinks and branching
- Draft/publish workflow with version control
- Learning goals and skill tracking
- Connect to clues, artifacts, and effects

### QR C2 Framework
Educational command-and-control system:
- Generate QR codes that simulate C2 commands
- 13 real-world attack vector simulations
- 6 hands-on QR hijacking labs
- Challenge modes: Dead Drop, Stego Hunter, QR Inception

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18 + TypeScript, Vite, Tailwind v4, Framer Motion |
| Backend | Express + TypeScript (ESM), REST APIs |
| Database | PostgreSQL via Drizzle ORM |
| AI | OpenRouter (free tier models) |
| Auth | Replit OIDC |

---

## Quick Start

```bash
# Install
npm install

# Dev mode (client + server on :5000)
npm run dev

# Production build
npm run build && npm start

# Push schema changes
npm run db:push
```

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection |
| `OPENROUTER_API_KEY` | AI model access |
| `ISSUER_URL` | Replit Auth (auto-configured) |

---

## Structure

```
client/     → React UI (the facade + the playground)
server/     → Express API, AI agents, threat feeds
shared/     → Drizzle schema, shared types
```

## Key Files

- `server/routes.ts` — API endpoints
- `server/observability.ts` — W&B-style AI tracing
- `shared/schema.ts` — Database models
- `client/src/components/CampaignDesigner.tsx` — Visual campaign editor
- `client/src/pages/admin/EffectsPlaygroundSection.tsx` — Visual effects lab

---

## Philosophy

Security is learned by *doing*, not reading. NEXUS creates a safe sandbox where:

1. **Discovery is rewarded** — Hidden commands, secret pages, encrypted clues
2. **AI assists, not replaces** — Agents help analyze, you make the decisions
3. **Real data, fake targets** — Live threat feeds, simulated infrastructure
4. **Progression matters** — Quests, levels, unlockable content

The corporate facade isn't just aesthetic — it's training for real-world engagements where attackers hide in plain sight.

---

## Documentation

```
docs/
├── AGENT_LOG.md   → Message stream between Replit & Cursor agents
├── WIKI.md        → Architecture reference, API docs, decision log
└── ROADMAP.md     → Future features and ideas parking lot
```

## Contributing

Find a bug? Submit a clue. Break something? That might be the point.

PRs welcome. Just don't patch the intentional vulnerabilities.

---

*Built for security researchers who learn by breaking things.*
