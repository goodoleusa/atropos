# Spinoff Guide: Create Your Own Civic Engagement (or Security) Learning Platform

This guide walks you through spinning off this branch as a new repository and hosting it for free. Use it for civic engagement, cybersecurity training, or any similar learning platform.

---

## Quick Path: Clone → Replit → Live (5 min)

1. **Fork** this repo on GitHub (or clone it).
2. **Create Repl**: [Replit](https://replit.com) → New Repl → Import from GitHub → select your fork, branch `cursornew-civic-engagement-platform-a0d0`.
3. **Database**: Replit → Tools → Database → Create database.
4. **Secrets**: Lock icon → add `DATABASE_URL` (from Database tab) and `OPENROUTER_API_KEY` (from [OpenRouter](https://openrouter.ai)).
5. **Run**: Click Run. After build, run `npm run db:push` in Shell, then `npm run db:seed`.
6. **Deploy**: Deploy button → Deploy to Replit — get your public URL.

---

## Part 1: Spinning Off as a New Repo

### Step 1: Clone the Repo and Checkout the Branch

```bash
# Clone the original repo
git clone https://github.com/goodoleusa/atropos.git my-civic-platform
cd my-civic-platform

# Checkout the civic engagement branch
git checkout cursornew-civic-engagement-platform-a0d0
```

### Step 2: Create a New GitHub Repo and Push

```bash
# Remove the original remote
git remote remove origin

# Create a new repo on GitHub (via website or gh CLI)
# Then add your new remote:
git remote add origin https://github.com/YOUR_USERNAME/my-civic-platform.git

# Push as main (or keep branch name)
git branch -M main
git push -u origin main
```

**Alternative: Fork + branch** — Fork the repo on GitHub, then create a new repo from the fork and copy the branch contents.

### Step 3: (Optional) Squash to Fresh History

If you want a clean history without parent-repo commits:

```bash
# Create orphan branch (no parent)
git checkout --orphan fresh-start

# Add all files
git add -A
git commit -m "Initial commit: Civic engagement learning platform"

# Replace main
git branch -D main
git branch -m main
git push -u origin main --force
```

---

## Part 2: Customization Checklist

Edit these files to brand and tailor the platform:

### Branding & Identity

| File | What to Edit |
|------|--------------|
| `client/index.html` | `<title>`, `<meta name="description">`, favicon path |
| `client/src/pages/Home.tsx` | Site name (e.g. "NEXUS" → your name), hero text, taglines, selling points |
| `client/src/components/QuickNav.tsx` | Logo text, nav labels |
| `client/public/` | Replace favicon.ico, add your logo, hero video/poster in `videos/` |
| `package.json` | `"name"` field (e.g. `"my-civic-platform"`) |

### Content: Civic Campaigns

| File | What to Edit |
|------|--------------|
| `client/src/config/civicCampaigns.ts` | Add/remove campaigns, edit descriptions, starter prompts, learning objectives |
| `client/src/config/agentCampaigns.ts` | Add/remove security campaigns; set `AGENT_CAMPAIGNS` or `ALL_CAMPAIGNS` to only civic if you want civic-only |
| `client/src/config/CAMPAIGN_CATEGORIES` | Campaign categories and IDs in `agentCampaigns.ts` |

### Content: Arc Templates (Campaign Builder)

| File | What to Edit |
|------|--------------|
| `client/src/components/campaign/ArcTemplates.ts` | `CIVIC_ARC_TEMPLATES` and `ARC_TEMPLATES` — add templates for your flows |

### AI Behavior

| File | What to Edit |
|------|--------------|
| `client/src/config/agentPrompts.ts` | `AGENT_CORE` — agent identity; `CAPABILITY_MODULES` — capabilities; `civic_engagement` module text |
| `client/src/config/learningConfig.ts` | `LEARNING_GOALS`, `LEARNING_STYLES` — add goals or styles |

### Home Page Sections

| File | What to Edit |
|------|--------------|
| `client/src/pages/Home.tsx` | Hero video/poster, paragraph text, CTA buttons, Civic Engagement cards, footer |

### Remove Security Content (Civic-Only Mode)

To focus only on civic engagement:

1. **`client/src/config/agentCampaigns.ts`** — Change:
   ```typescript
   export const ALL_CAMPAIGNS: Campaign[] = [...CIVIC_CAMPAIGNS];  // Remove ...AGENT_CAMPAIGNS
   ```
2. **`client/src/pages/Home.tsx`** — Remove or shrink security-focused sections; keep Civic Engagement section.
3. **`client/src/pages/CampaignsHub.tsx`** — Adjust category filters so only civic appears.

### Design (Colors, Fonts)

| File | What to Edit |
|------|--------------|
| `client/src/index.css` | `--color-*` variables, Tailwind theme |
| `.cursorrules` | Design system notes (for AI/developers) |

---

## Part 3: Environment Variables

Create a `.env` file (never commit it) or set these in your host:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `OPENROUTER_API_KEY` | For AI | [OpenRouter](https://openrouter.ai) key for AI chat |
| `PORT` | No | Server port (default `5000`) |
| `SESSION_SECRET` | Replit Auth | Random string for sessions (Replit) |
| `APP_ACCESS_TOKEN` | No | Optional token for admin API access |
| `ADMIN_USER_IDS` | No | Comma-separated Replit user IDs for admin |

---

## Part 4: Free Hosting Options

### Option A: Replit (Easiest)

1. Go to [Replit](https://replit.com) and sign up.
2. **Import from GitHub**: New Repl → Import from GitHub → paste your repo URL.
3. **Add PostgreSQL**: Tools → Database → Create database.
4. **Secrets**: Secrets (lock icon) → add:
   - `DATABASE_URL` (from Database)
   - `OPENROUTER_API_KEY` (from [OpenRouter](https://openrouter.ai))
5. **Run**: Click Run. Replit detects `.replit` and runs `npm run dev`.
6. **Deploy**: Deploy → Deploy to Replit — you get a public URL.

**Note**: Free tier sleeps after inactivity; paid plans keep it always on.

---

### Option B: Render

1. Sign up at [Render](https://render.com).
2. **PostgreSQL**: New → PostgreSQL; create DB; copy Internal Database URL.
3. **Web Service**: New → Web Service; connect your GitHub repo.
4. **Settings**:
   - **Build command**: `npm install && npm run build`
   - **Start command**: `npm start`
   - **Environment**: Add `DATABASE_URL`, `OPENROUTER_API_KEY`, `NODE_ENV=production`
5. Deploy. Render runs migrations on deploy if you add `npm run db:push` to build.

**Note**: Free web services sleep after ~15 minutes; first request wakes them (slower).

---

### Option C: Railway

1. Sign up at [Railway](https://railway.app).
2. **New project** → Deploy from GitHub repo.
3. **PostgreSQL**: Add PostgreSQL; copy `DATABASE_URL` from Variables.
4. **Variables**: `DATABASE_URL`, `OPENROUTER_API_KEY`, `PORT` (Railway sets this).
5. **Build**: Railway detects `package.json`; use:
   - Build: `npm install && npm run build`
   - Start: `npm start`

**Note**: Railway gives ~$5 free credit per month.

---

### Option D: Fly.io

1. Install [flyctl](https://fly.io/docs/hands-on/install-flyctl/) and sign up.
2. In project: `fly launch` (creates `fly.toml`).
3. **Postgres**: `fly postgres create` → attach to app.
4. **Secrets**: `fly secrets set DATABASE_URL=... OPENROUTER_API_KEY=...`
5. **Deploy**: `fly deploy`

---

## Part 5: Database Setup (All Hosts)

After getting `DATABASE_URL`:

```bash
# Push schema to database
npm run db:push

# (Optional) Seed initial data
npm run db:seed
```

---

## Part 6: Full Setup Flow (Cloning → Live)

```bash
# 1. Clone and checkout
git clone https://github.com/goodoleusa/atropos.git my-platform
cd my-platform
git checkout cursornew-civic-engagement-platform-a0d0

# 2. Create new repo on GitHub, push
git remote set-url origin https://github.com/YOUR_USERNAME/my-platform.git
git push -u origin main

# 3. Install
npm install

# 4. Local dev (needs DATABASE_URL and optionally OPENROUTER_API_KEY)
cp .env.example .env   # edit .env with your values
npm run db:push
npm run db:seed
npm run dev
# → http://localhost:5000

# 5. Deploy to Replit/Render/Railway
# - Connect repo
# - Add DATABASE_URL, OPENROUTER_API_KEY
# - Build: npm install && npm run build
# - Start: npm start
# - Run db:push manually or add to build
```

---

## Part 7: Minimal .env.example

Create `.env.example` in the repo root (safe to commit):

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# For AI features
OPENROUTER_API_KEY=sk-or-v1-xxxx

# Optional
PORT=5000
APP_ACCESS_TOKEN=your-secret-token
NODE_ENV=development
```

---

## Quick Reference: File Map

| Purpose | Location |
|---------|----------|
| Civic campaigns | `client/src/config/civicCampaigns.ts` |
| Security campaigns | `client/src/config/agentCampaigns.ts` |
| AI prompts | `client/src/config/agentPrompts.ts` |
| Learning goals | `client/src/config/learningConfig.ts` |
| Home page | `client/src/pages/Home.tsx` |
| Campaign hub | `client/src/pages/CampaignsHub.tsx` |
| Arc templates | `client/src/components/campaign/ArcTemplates.ts` |
| Branding | `client/index.html`, `QuickNav.tsx`, `public/` |
| DB schema | `shared/schema.ts` |

---

## Troubleshooting

**"DATABASE_URL is required"** — Set `DATABASE_URL` in env or `.env`.

**AI chat not responding** — Add `OPENROUTER_API_KEY`; AI features are disabled without it.

**Build fails (Atropos)** — Use `SKIP_ATROPOS_BUILD=1 npm run build` if Rust/scanner build fails.

**Replit Auth errors** — Replit expects `REPL_ID`, `SESSION_SECRET`. On other hosts, you may need to disable or adapt Replit Auth.

**Port already in use** — Set `PORT=3000` (or another free port).
