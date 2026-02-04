# SysAdmin Corp - Interactive Terminal Game

An interactive web-based terminal game with a molten bronze / industrial
cyber-ritual aesthetic. Players navigate a fictional corporate system through
custom terminal commands, collect clues, complete quests, and uncover hidden
routes. The experience blends occult motifs (tarot, zodiac, quantum lore) with a
retro-futuristic corporate hacking narrative.

This repository is a full-stack TypeScript app: React + Vite on the frontend and
Express on the backend, with PostgreSQL via Drizzle ORM.

## Features

### Core Platform
- Custom terminal emulator with command parsing and history
- Clue + quest system with configurable campaigns and messages
- Atmospheric overlays (Chaos, Glitch text, Quantum field, etc.)
- Mobile-first responsive design with touch-friendly interactions

### NEXUS AI System
- Agent Chat (OpenRouter-backed) for investigations and guidance
- AI Lab for prompt testing, model comparisons, and evaluations
- Report Builder for structured bug bounty style writeups
- Shared investigation context across all AI features

### Atropos OSINT Scanner
- Rust-based security scanning tool (`/api/atropos`)
- Script execution and scan history tracking
- Remote Atropos server connection support
- AI-assisted analysis prompt generation
- Auto-integration with investigation contexts

### Content Tools
- Campaign Designer with wikilinks, breadcrumbs, and backlinks
- Admin dashboard for managing content, sessions, and UX effects
- API Playground for learning security concepts

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
client/          React app (UI)
server/          Express API + integrations
shared/          Shared schema and models
script/          Build scripts
tools/atropos/   Atropos OSINT scanner (Rust)
```

## Production Deployment: Hetzner Cloud

Use Replit for development, Hetzner for production hosting.

### 1) Provision Hetzner Server

```bash
# Recommended: CX21 (2 vCPU, 4GB RAM) or CX31 for heavier scans
# OS: Ubuntu 22.04 or Debian 12
```

### 2) Install Rust on Hetzner

```bash
# SSH into your Hetzner server
ssh root@your-server-ip

# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version
```

### 3) Install System Dependencies

```bash
# Ubuntu/Debian
apt update && apt install -y \
  build-essential \
  pkg-config \
  libssl-dev \
  libluajit-5.1-dev \
  git \
  postgresql-client

# Optional: for DNS/network tools
apt install -y dnsutils nmap whois
```

### 4) Build Atropos Binary

```bash
# Clone the repo
git clone https://github.com/goodoleusa/atropos.git
cd atropos/tools/atropos

# Build release binary (optimized)
cargo build --release

# Binary is at: target/release/atropos
# Copy to system path
cp target/release/atropos /usr/local/bin/
chmod +x /usr/local/bin/atropos

# Verify
atropos --version
```

### 5) Configure Node.js Backend

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Clone and build the web app
cd /opt
git clone https://github.com/goodoleusa/atropos.git sysadmin-corp
cd sysadmin-corp
npm install
npm run build
```

### 6) Environment Setup

```bash
# Create .env file
cat > .env << 'EOF'
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/sysadmin
OPENROUTER_API_KEY=your_openrouter_key
NODE_ENV=production
EOF
```

### 7) Systemd Service

```bash
cat > /etc/systemd/system/sysadmin-corp.service << 'EOF'
[Unit]
Description=SysAdmin Corp Web App
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/sysadmin-corp
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl enable sysadmin-corp
systemctl start sysadmin-corp
```

### 8) Nginx Reverse Proxy

```bash
apt install -y nginx certbot python3-certbot-nginx

cat > /etc/nginx/sites-available/sysadmin-corp << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/sysadmin-corp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL with Let's Encrypt
certbot --nginx -d your-domain.com
```

### Hetzner Firewall Rules

```
Allow: 22 (SSH), 80 (HTTP), 443 (HTTPS)
Block: All other inbound
```
