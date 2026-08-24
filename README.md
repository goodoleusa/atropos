# Atropos

**A gamified OSINT and cybersecurity training platform.** Learn offensive security and open-source intelligence through realistic, AI-guided investigations instead of static courses.

> *"Technology that tracks criminals, rescues victims, and stops the money."*

---

## What it is

Atropos turns security training into an investigation game. Players run real OSINT and recon tooling against simulated targets, guided by an AI agent that adapts to their skill level, while earning XP, achievements, and leaderboard rank for genuine investigative work.

- **23 investigation campaigns** — geolocation, SOCMINT, financial crime, crypto tracing, dark web intel, threat hunting, and more
- **NEXUS AI agent** — an LLM-backed investigation assistant with multi-agent orchestration (recon, OSINT, threat intel, secret hunting, synthesis) and a live "mission bus" that shares findings across tools
- **Atropos Scanner** — a Rust-based OSINT/recon engine (Lua scripting, multi-threaded) wrapping tools like Amass, Subfinder, Nuclei, Gitleaks, and TruffleHog
- **QR C2 lab** — guided missions and hijacking labs teaching real command-and-control tradecraft (beaconing, evasion, exfiltration) mapped to MITRE ATT&CK, with a defender's-eye view alongside the attacker's
- **Progression system** — XP, levels, 500+ achievements, leaderboards, and daily challenges layered on top of every investigation
- **Campaign designer** — a visual node editor for building new investigation flows, with bidirectional sync to an Obsidian vault for offline content authoring

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Framer Motion, TanStack Query |
| Backend | Node.js, Express, TypeScript (ESM) |
| Database | PostgreSQL, Drizzle ORM |
| AI | OpenRouter (multi-model: Claude, GPT-4, Gemini) |
| Scanner | Rust, Cargo, embedded Lua |
| Recon tooling | Amass, Subfinder, theHarvester, BBOT, Nuclei, httpx, nmap, Gitleaks, TruffleHog |

## Quick start

```bash
git clone https://github.com/goodoleusa/atropos.git
cd atropos
npm install

cp .env.example .env        # set DATABASE_URL, OPENROUTER_API_KEY
npm run db:setup            # push schema + seed data
npm run dev                 # http://localhost:5000
```

The Rust scanner is optional and cached after the first build:

```bash
npm run build:atropos        # ~2-3 min once, then reused instantly
```

## Project structure

```
atropos/
├── client/          # React frontend (components, pages, hooks, config)
├── server/          # Express API (routes, storage layer, auth/security)
├── shared/          # Drizzle schema + shared types
├── tools/atropos/   # Rust OSINT scanner
├── templates/       # Modular starter kit — assemble a custom deployment
├── spiderfoot/      # OSINT web analysis modules
└── docs/            # Numbered guides + archive
```

## Modular starter kit

`templates/` contains a feature-module assembler for spinning up a scoped deployment (e.g. just the security scanner, or just the learning/gamification layer) instead of the full platform:

```bash
bash templates/setup.sh              # interactive
bash templates/setup.sh security ./my-project
```

Presets: `minimal`, `learner`, `civic`, `security`, `marketing`, `full`. See `templates/manifest.json` for the full module registry.

## Documentation

- [`01-GETTING_STARTED`](docs/01-GETTING_STARTED.md) — onboarding guide
- [`02-CURRICULUM`](docs/02-CURRICULUM.md) — experiential learning framework
- [`03-SPINOFF_AND_HOSTING_GUIDE`](docs/03-SPINOFF_AND_HOSTING_GUIDE.md) — fork and deploy your own instance
- [`04-CAMPAIGN_LEARNING_TEMPLATE`](docs/04-CAMPAIGN_LEARNING_TEMPLATE.md) — build new campaigns
- [`.cursorrules`](.cursorrules) — architecture and coding conventions

## Blurb ideas

> *Learn to hunt threats the way real analysts do. AI-guided investigations, live recon tooling, and a Rust OSINT scanner — wrapped in XP, levels, and leaderboards.*

> *What if CTF challenges met an RPG progression system and an AI investigation partner?*

> *Stop watching security tutorials. Start running actual investigations. 23 campaigns, a multi-agent AI copilot, and a Rust-powered scanner — built for people who learn by doing.*

> *Gamified OSINT & cybersecurity training — real tools, AI-guided investigations, QR C2 labs, from crypto tracing to dark web intel.*

## License

MIT — see [LICENSE](LICENSE).
