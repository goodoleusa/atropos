# SysAdmin Corp - Interactive Terminal Game

An interactive web-based terminal game with a molten bronze / industrial
cyber-ritual aesthetic. Players navigate a fictional corporate system through
custom terminal commands, collect clues, complete quests, and uncover hidden
routes. The experience blends occult motifs (tarot, zodiac, quantum lore) with a
retro-futuristic corporate hacking narrative.

This repository is a full-stack TypeScript app: React + Vite on the frontend and
Express on the backend, with PostgreSQL via Drizzle ORM.

## Features

- Custom terminal emulator with command parsing and history.
- Clue + quest system with configurable campaigns and messages.
- Atmospheric overlays (Chaos, Glitch text, Quantum field, etc.).
- Agent Chat (OpenRouter-backed) for investigations and guidance.
- Campaign Designer with wikilinks, breadcrumbs, and backlinks.
- Admin dashboard for managing content, sessions, and UX effects.
- Report Builder for structured bug bounty style writeups.
- AI Lab for prompt testing, comparisons, and evaluations.

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
