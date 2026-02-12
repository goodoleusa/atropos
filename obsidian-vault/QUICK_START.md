---
date_created: 2026-15-Mo
date_modified: 2026-54-Tu
---
# Atropos - Quick Start Cheatsheet

## 🚀 Setup (5 minutes)

```bash
npm install
npm run dev
# Visit: http://localhost:5000
```

## 🎯 Key Features

### For Players
- `/profile` - XP, level, achievements, stats
- `/leaderboards` - Global rankings
- `/campaigns` - 23 investigations
- `/terminal` - Custom terminal

### Earn XP
- Complete campaign: +100 XP
- Hidden clue: +50 XP
- Daily challenge: +100-300 XP
- Achievements: varies

### Skill Specializations
- 🎯 OSINT - Investigation & recon
- 🛡️ Network - Infrastructure security
- 🔬 Malware - Analysis & triage
- 👥 Social - SOCMINT & phishing

## 📚 Learning Tracks

### OSINT Specializations (NEW)
1. **Geolocation** - Photo analysis, satellite imagery
2. **SOCMINT** - Social media intelligence
3. **Financial** - Corporate tracing, fraud
4. **Crypto** - Blockchain analysis
5. **Nation-State** - APT tracking
6. **Dark Web** - Underground intel

### Learning Styles
- 🔧 Experiential - Jump in, learn by doing
- 📊 Visual - Diagrams and visualizations
- 🔬 Analytical - Theory-first approach
- 👥 Social - Community learning
- ⚡ Pragmatic - Quick efficient workflows

## 🎓 Career Paths

| Role | Path | Time |
|------|------|------|
| **Threat Intel Analyst** | OSINT → Nation-State → Dark Web | 50-70h |
| **Financial Investigator** | OSINT → Financial → Crypto | 45-60h |
| **OSINT Specialist** | OSINT → SOCMINT → Geolocation | 60-80h |
| **Security Researcher** | OSINT → Network → Pentesting | 40-60h |

## 🔧 Build & Deploy

### Standard Build
```bash
npm run build          # Fast (4.5s)
npm start              # Production
```

### Atropos Scanner
```bash
npm run build:atropos  # Build once (2-3 min)
npm run build          # Future builds use cache (instant)
```

### Database
```bash
npm run db:push        # Create/update tables
```

## 🗂️ Obsidian Vault (NEW)

```bash
# Open vault
open obsidian-vault/

# Create campaign
Use: Templates/Campaign Template.md

# Sync to app
npm run sync:campaigns -- --from-obsidian
```

**Plugins**: Breadcrumbs, Excalibrain, Dataview, Templater

## 📋 API Endpoints (NEW)

### Progression
```
GET    /api/progression/:sessionToken
GET    /api/achievements
GET    /api/leaderboard/:type
GET    /api/challenges/today
POST   /api/challenges/complete
```

### Admin (requires auth)
```
POST   /api/progression/:token/xp
POST   /api/achievements
POST   /api/challenges
```

## 🎮 Commands

### Terminal
- `help` - Show commands
- `scan` - Reconnaissance
- `nexus` - AI agent
- `clues` - View collected
- `quests` - Objectives
- `clear` - Clear screen

### NPM Scripts
- `npm run dev` - Development
- `npm run build` - Production build
- `npm run build:atropos` - Build scanner once
- `npm run db:push` - Update database
- `npm run sync:campaigns` - Sync Obsidian↔App

## 📚 Documentation

**Essential**:
- `docs/CURRICULUM.md` - Learning framework (427 lines)
- `docs/GETTING_STARTED.md` - Onboarding guide
- `COMPLETE_SUMMARY.md` - Everything delivered

**Reference**:
- `docs/CAMPAIGN_LEARNING_TEMPLATE.md` - Campaign template
- `docs/ATROPOS_BUILD_CACHING.md` - Build optimization
- `.cursorrules` - Project conventions

## 🎯 Quick Workflows

### Add New Campaign
1. **In Obsidian**: Use Campaign Template
2. **Fill metadata**: Learning objectives, skills, career paths
3. **Export**: `npm run sync:campaigns -- --from-obsidian`
4. **Deploy**: Commit and push

### Create Achievement
```typescript
POST /api/achievements
{
  achievementId: "master_osint",
  name: "OSINT Master",
  requirements: { type: "stat", condition: { ... } },
  xpReward: 500
}
```

### Create Daily Challenge
```typescript
POST /api/challenges
{
  challengeId: "challenge_2026_02_07",
  title: "Speed Reconnaissance",
  type: "speed_run",
  xpReward: 200
}
```

## 🔍 Environment Variables

```bash
DATABASE_URL=postgresql://...       # Required
OPENROUTER_API_KEY=sk-...          # For AI features
APP_ACCESS_TOKEN=secret             # Admin auth
ENABLE_ATROPOS_BUILD=1              # Build scanner
```

## ⚡ Performance Tips

- **Atropos**: Build once, cache forever
- **Leaderboards**: Cached 30s, auto-refresh
- **Database**: Indexes on sessionToken, achievementId
- **API**: Rate limited, use efficiently

## 🎉 Success Metrics

After curriculum completion:
- ✅ Investigation portfolio built
- ✅ Tools mastered (20+)
- ✅ Reports documented (10+)
- ✅ Career-ready skills
- ✅ No degree required

---

**Philosophy**: Experience > Degrees | Practice > Theory | Skills > Certificates

**Start**: `npm run dev` → Visit `/profile` → Choose learning style → Start campaign 🚀
