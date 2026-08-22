# Atropos

**A gamified training and investigation platform for ethical hackers working against human trafficking and financial crime.**

Atropos combines OSINT/security training campaigns, AI investigation agents, and a live scanner/reporting workspace in one full-stack app. It teaches offensive-security and OSINT skills through scenario-based campaigns, then lets trained users run real reconnaissance and reporting workflows on top of the same platform.

---

## What's in here

- **Campaigns** — scenario-driven learning paths (dark-web investigation, crypto tracing, shell-company tracing, victim geolocation, civic-engagement case studies) with progression, gamification, and leaderboards.
- **AI investigation agents** — a CrewAI-based crew (recon, scanner, hunter, responder, reporter) that can be pointed at a target and produces structured findings, wired through a shared "Mission Bus" event system so results from one tool feed the others.
- **OSINT/security tooling** — SpiderFoot integration, a scanner dashboard, behavior analysis, and a report builder for turning findings into client-ready output.
- **Terminal & prompt-builder** — an in-browser terminal and AI prompt/crew builder for constructing and running custom investigation workflows.
- **Modular starter kit** (`templates/`) — assemble a stripped-down deployment (minimal / learner / civic / security / marketing / full) from independent feature modules instead of shipping the whole platform.

## Architecture

```
client/        React + Vite SPA (Radix UI, TanStack Query, Framer Motion)
server/        Express API, session auth, routes per feature area
  crewai/      AI agent crews (recon/scanner/hunter/responder/reporter)
  services/    OSINT, behavior analysis, reporting integrations
shared/        Drizzle ORM schema shared by client & server
spiderfoot/    Vendored OSINT automation engine (Python)
templates/     Modular feature assembler for custom deployments
```

Data layer is Postgres via Drizzle ORM. AI features run through OpenAI-compatible APIs (OpenRouter, Ollama, Groq) so the platform can run on free/local models as well as hosted ones.

## Tech stack

TypeScript, React, Express, PostgreSQL/Drizzle, Vite, Radix UI, CrewAI, SpiderFoot (Python), OpenAI SDK.

## Getting started

```bash
git clone https://github.com/goodoleusa/atropos.git
cd atropos
npm install

cp .env.example .env        # set DATABASE_URL and an OpenRouter/OpenAI-compatible API key

npm run db:push && npm run db:seed
npm run dev                 # http://localhost:5000
```

## Docs

Deeper documentation — architecture decisions, curriculum design, spinoff/self-hosting instructions, and the modular template system — lives in [`docs/`](docs/).

## License

MIT
