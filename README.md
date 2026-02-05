# NEXUS Security Platform

A comprehensive AI-powered security investigation platform featuring two core systems:

1. **NEXUS Agent** - AI assistant for analysis, reporting, and campaign management
2. **Atropos Scanner** - Rust-based OSINT & vulnerability scanning tool

The platform features a molten bronze/industrial aesthetic with custom terminal interface,
investigation campaigns, visual campaign designer, and atmospheric effects.

## Features

### NEXUS Agent
- AI-powered investigation assistant (OpenRouter LLMs)
- Pre-built security campaigns (Shell Corp, BGP tracing, Threat Hunting)
- Report Builder for structured bug bounty writeups
- AI Lab for prompt engineering and model comparison
- Campaign Designer with wikilinks and conditional decision trees

### Atropos Scanner
- OSINT reconnaissance (BBOT, Amass, theHarvester, Subfinder)
- Vulnerability scanning (Nuclei, httpx, nmap)
- Secret detection (Gitleaks, TruffleHog)
- Threat intelligence (Shodan, VirusTotal, SecurityTrails)
- Lua scripting for custom automation

### Platform
- Custom terminal emulator with command parsing
- Clue + quest system with configurable campaigns
- Atmospheric overlays (Chaos, Glitch, Quantum field)
- Admin dashboard for content and UX management
- Mobile-responsive with 48px+ touch targets

## Architecture

### Frontend

- React + TypeScript (Vite)
- Wouter for routing
- Tailwind CSS v4 + Framer Motion
- shadcn/ui (Radix primitives)
- Zustand for learning preferences

### Backend

- Express + TypeScript (ESM)
- REST JSON APIs under `/api/`
- PostgreSQL via Drizzle ORM

### Data

- Schema: `shared/schema.ts`
- Tables: `game_sessions`, `clues`, `quests`, `command_logs`

## Running locally

### 1) Install dependencies

```
npm install
```

### 2) Start the app (dev)

```
npm run dev
```

The server and client are served from the same port.
Default: `http://localhost:5000`

### 3) Build for production

```
npm run build
npm start
```

## Environment variables

Some features require these environment variables:

- `PORT` (defaults to 5000)
- `DATABASE_URL` (Postgres connection)
- `ISSUER_URL` and related Replit Auth envs when using Replit OIDC

## Replit integration

This repo includes Replit integrations and defaults:

- `.replit` defines Node 20, port 5000, and `npm run dev`
- Replit Auth and OpenRouter integrations under `server/replit_integrations/`
- Vite plugins for Replit dev tooling

If you host on Replit, the app runs on port 5000 and Replit maps it to port 80.

## Cursor + Replit workflow (same repo)

To keep Replit and Cursor in sync, use GitHub as the source of truth:

1. In Replit, connect the project to GitHub and push changes.
2. In Cursor, clone the same repo:

   ```
   git clone https://github.com/goodoleusa/atropos
   cd atropos
   ```

3. Make edits in Cursor, then commit + push:

   ```
   git add .
   git commit -m "Describe change"
   git push -u origin <branch>
   ```

4. In Replit, pull the latest changes.

Tip: use separate branches (e.g., `cursor-experiments` vs `replit-experiments`)
to compare agent results safely.

## Scripts

- `npm run dev` - start server in development (serves client too)
- `npm run dev:client` - start Vite dev server only
- `npm run build` - build client + server for production
- `npm run start` - run production build
- `npm run check` - TypeScript check
- `npm run db:push` - push Drizzle schema to DB

## Repo structure

```
client/     React app (UI)
server/     Express API + integrations
shared/     Shared schema and models
script/     Build scripts
```
