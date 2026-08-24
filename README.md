# Atropos

> *"Technology that tracks criminals, rescues victims, and stops the money."*

Gamified OSINT and cybersecurity training. Real tooling, AI-guided investigations, XP and leaderboards — learn offensive security by doing it, not watching it.

## Features

- **23 campaigns** — geolocation, SOCMINT, financial crime, crypto tracing, dark web intel, threat hunting
- **NEXUS AI agent** — multi-agent orchestration (recon, OSINT, threat intel, secret hunting, synthesis) with a live mission bus
- **Atropos Scanner** — Rust OSINT/recon engine (Lua scripting, multi-threaded) wrapping Amass, Subfinder, Nuclei, Gitleaks, TruffleHog
- **QR C2 lab** — command-and-control tradecraft mapped to MITRE ATT&CK, attacker and defender views
- **Progression** — 500+ achievements, daily challenges, leaderboards
- **Campaign designer** — visual node editor with Obsidian vault sync

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Tailwind, Framer Motion, TanStack Query |
| Backend | Node/Express (ESM), PostgreSQL, Drizzle ORM |
| AI | OpenRouter (Claude, GPT-4, Gemini) |
| Scanner | Rust + embedded Lua |
| Recon | Amass, Subfinder, theHarvester, BBOT, Nuclei, httpx, nmap |

## Quick start

```bash
git clone https://github.com/goodoleusa/atropos.git && cd atropos
npm install
cp .env.example .env   # set DATABASE_URL, OPENROUTER_API_KEY
npm run db:setup        # push schema + seed
npm run dev             # http://localhost:5000
```

Optional Rust scanner: `npm run build:atropos` (~3 min first build, cached after).

## Structure

```
client/       React frontend
server/       Express API + auth
shared/       Drizzle schema + types
tools/atropos Rust OSINT scanner
templates/    Modular starter kit
spiderfoot/   OSINT web analysis
docs/         Guides + archive
```

## Starter kit

Assemble a scoped deployment instead of the full platform:

```bash
bash templates/setup.sh                     # interactive
bash templates/setup.sh security ./my-proj  # preset + target
```

Presets: `minimal` · `learner` · `civic` · `security` · `marketing` · `full`

## Docs

- [Getting Started](docs/01-GETTING_STARTED.md)
- [Curriculum](docs/02-CURRICULUM.md)
- [Spinoff & Hosting](docs/03-SPINOFF_AND_HOSTING_GUIDE.md)
- [Campaign Template](docs/04-CAMPAIGN_LEARNING_TEMPLATE.md)

## License

MIT
