# Atropos - Cybersecurity Training & Investigation Platform

> **Mission-Critical Philosophy**: In cybersecurity, hands-on experience far outweighs traditional degrees. Atropos emphasizes learning by doing, student-driven investigation, and real-world scenario mastery.

A comprehensive security investigation and training platform that combines professional OSINT tools with AI-powered guidance and an innovative experiential learning curriculum.

## 🎯 Core Systems

### 1. **Player Progression & Gamification** ✨ NEW!
- **XP & Leveling**: Earn experience through investigations, level up from 1 to 50+
- **Skill Specializations**: Develop expertise in OSINT, Network Security, Malware Analysis, Social Engineering
- **Achievement System**: 500+ achievements with rarity tiers (common → legendary)
- **Global Leaderboards**: Compete with other investigators, track your ranking
- **Daily Challenges**: Rotating objectives with XP and currency rewards
- **Campaign Analytics**: Track completion rates, times, and difficulty

### 2. **Experiential Learning Curriculum** 🎓 NEW!
- **427-Line Framework**: Structured curriculum emphasizing 80% hands-on, 20% theory
- **6 OSINT Specialization Tracks**:
  - 🌍 **Geolocation & GEOINT**: Photo analysis, satellite imagery, shadow analysis
  - 👥 **SOCMINT**: Social media intelligence, profile correlation, relationship mapping
  - 💰 **Financial Investigation**: Corporate intel, fraud detection, shell company tracing
  - ₿ **Crypto & Blockchain**: Transaction tracing, wallet clustering, DeFi investigation
  - 🎯 **Nation-State Threat Intel**: APT tracking, attribution, campaign monitoring
  - 🕸️ **Dark Web Intelligence**: Underground markets, stolen data, forum analysis

- **5 Learning Style Adaptations**:
  - 🔧 **Experiential**: Hands-on labs, learn by doing
  - 📊 **Visual**: Diagrams, maps, graph visualizations
  - 🔬 **Analytical**: Deep theory, documentation, RFCs
  - 👥 **Social**: Community resources, collaborative learning
  - ⚡ **Pragmatic**: Quick workflows, automation, efficiency

- **Portfolio-Based Assessment**: Demonstrate skills through investigations, not exams
- **Career Path Guidance**: Maps to real security job roles
- **No Degree Required**: Skills and experience over credentials

### 3. **NEXUS AI Agent**
- **Investigation Assistant**: OpenRouter-powered LLM for guided investigations
- **23 Pre-Built Campaigns**: Shell Corp OSINT, BGP Tracing, Passive/Active Recon, Threat Hunting, Malware Triage, Dark Web Intel, Crypto Analysis, and more
- **Campaign Designer**: Visual node editor for creating investigation workflows
- **Adaptive Teaching**: AI adjusts guidance based on your learning style and skill level
- **Multi-Agent Orchestration**: 6 specialized agents (VulnAnalyst, OSINTAnalyst, ThreatIntel, SecretHunter, NetworkRecon, Synthesis)

### 4. **Atropos OSINT Scanner**
- **Rust-Based**: High-performance security scanner with Lua scripting
- **OSINT Reconnaissance**: BBOT, Amass, theHarvester, Subfinder
- **Vulnerability Scanning**: Nuclei, httpx, nmap integration
- **Secret Detection**: Gitleaks, TruffleHog
- **Threat Intelligence**: Shodan, VirusTotal, SecurityTrails APIs
- **Smart Caching**: Build once (2-3 min), reuse forever (~100ms)

### 5. **Investigation Workspace**
- **Report Builder**: Structure findings for bug bounty submissions
- **AI Lab**: Prompt engineering playground with model comparison
- **Custom Terminal**: Command parsing, history, secret discovery
- **Investigation Context**: Shared state across features
- **Visual Campaign Designer**: Create and share investigation workflows

### 6. **Platform Features**
- **Clue & Quest System**: Progressive unlocks and discovery
- **QR C2 Framework**: Educational command & control mechanics
- **Mystical Overlays**: Tarot cards, quantum popups, atmospheric effects
- **Admin Dashboard**: Content management, analytics, player tracking
- **Mobile-Responsive**: 48px+ touch targets, optimized layouts

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/goodoleusa/atropos
cd atropos

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5000`

### Build Atropos Scanner (Optional)

```bash
# Build once and cache (takes 2-3 minutes first time)
npm run build:atropos

# Future builds use cached binary (instant!)
npm run build
```

See [Atropos Build Caching](docs/ATROPOS_BUILD_CACHING.md) for details.

### Database Setup

```bash
# Push schema to PostgreSQL
npm run db:push
```

## 📚 Documentation

### Core Documentation
- **[CURRICULUM.md](docs/CURRICULUM.md)** - Experiential learning framework (427 lines)
- **[ATROPOS_BUILD_CACHING.md](docs/ATROPOS_BUILD_CACHING.md)** - Build optimization guide
- **[CAMPAIGN_LEARNING_TEMPLATE.md](docs/CAMPAIGN_LEARNING_TEMPLATE.md)** - Campaign creation guide
- **[.cursorrules](.cursorrules)** - Project architecture and coding conventions

### Assessment & Analysis
- **[ARCHITECTURAL_ASSESSMENT.md](docs/ARCHITECTURAL_ASSESSMENT.md)** - Architecture review
- **[FINAL_SUMMARY.md](docs/FINAL_SUMMARY.md)** - Complete feature overview
- **[IMPLEMENTATION_COMPLETE.md](docs/IMPLEMENTATION_COMPLETE.md)** - Implementation status

## 🎮 Player Features

### Profile & Progression
Visit `/profile` to see:
- Current level and XP progress
- Skill specializations (OSINT, Network, Malware, Social)
- Achievement gallery (locked/unlocked)
- Daily challenge
- Global ranking
- Comprehensive statistics

### Leaderboards
Visit `/leaderboards` for:
- Global XP rankings (top 100)
- Your position highlighted
- Competition with other investigators
- Real-time updates

### Daily Challenges
- New challenge every day
- XP and currency rewards
- Various types: mini investigations, speed runs, collection challenges, skill tests
- Completion tracking

### Achievements
Unlock achievements by:
- Completing campaigns
- Finding hidden clues
- Reaching XP milestones
- Demonstrating tool mastery
- Social activities

**Rarity Tiers**: Common, Rare, Epic, Legendary

## 🔧 For Developers

### Tech Stack

**Frontend**:
- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- Wouter (routing)
- TanStack Query (data fetching)
- Zustand (learning preferences)

**Backend**:
- Node.js + Express
- TypeScript (ESM)
- PostgreSQL + Drizzle ORM
- OpenRouter AI integration
- Rate limiting + security middleware

**OSINT Scanner**:
- Rust + Cargo
- Lua scripting engine
- Multi-threaded scanning
- JSON output for AI analysis

### Project Structure

```
atropos/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── config/         # Campaigns, learning, messages
│   │   ├── hooks/          # React hooks
│   │   ├── pages/          # Route pages
│   │   │   ├── Profile.tsx         # Player dashboard ✨ NEW
│   │   │   ├── Leaderboards.tsx    # Rankings ✨ NEW
│   │   │   ├── CampaignsHub.tsx    # Campaign library
│   │   │   ├── CampaignPlayer.tsx  # Play campaigns
│   │   │   └── ...
│   │   └── stores/         # Zustand stores
│   └── public/
├── server/                 # Express backend
│   ├── routes/
│   │   ├── gameRoutes.ts           # Game session APIs
│   │   ├── progressionRoutes.ts    # XP, achievements, leaderboards ✨ NEW
│   │   ├── adminRoutes.ts          # Admin management
│   │   ├── contentRoutes.ts        # Content CRUD
│   │   ├── gameplayRoutes.ts       # Gameplay features
│   │   └── ...
│   ├── storage.ts          # Database interface
│   ├── security.ts         # Auth & rate limiting
│   └── index.ts            # Server entry
├── shared/
│   ├── schema.ts           # Drizzle ORM schema (source of truth)
│   └── models/             # Shared types
├── tools/
│   └── atropos/            # Rust OSINT scanner
├── docs/                   # Comprehensive documentation
│   ├── CURRICULUM.md       # Learning framework ✨ NEW
│   ├── ATROPOS_BUILD_CACHING.md ✨ NEW
│   └── ...
└── script/
    ├── build.ts            # Production build
    └── build-atropos-once.sh ✨ NEW
```

### Database Schema

**Core Game Tables**:
- `game_sessions` - Player sessions
- `clues`, `quests` - Collectibles
- `campaign_runs` - Investigation progress

**Progression System** ✨ NEW:
- `player_progression` - XP, levels, skills, stats
- `achievements` - Achievement definitions
- `player_achievements` - Unlock tracking
- `leaderboard_entries` - Rankings
- `daily_challenges` - Challenge definitions
- `challenge_completions` - Completion tracking
- `campaign_stats` - Analytics

**Content & Campaign**:
- `designer_campaigns` - User-created campaigns
- `agent_modules` - Investigation workflows
- `campaign_templates` - Reusable flows

**Intelligence & Tools**:
- `osint_tools` - Tool registry
- `osint_tool_calls` - Execution logs
- `investigation_contexts` - Shared state
- `interaction_logs` - User actions

**Admin & Feedback**:
- `modmail` - Player support tickets
- `behavioral_profiles` - User analytics
- `player_feedback` - Feature feedback

### API Endpoints

**Progression** ✨ NEW:
```
GET    /api/progression/:sessionToken
POST   /api/progression/:sessionToken/xp (admin)
GET    /api/achievements
GET    /api/achievements/player/:sessionToken
POST   /api/achievements/unlock
GET    /api/leaderboard/:type
GET    /api/challenges/today
POST   /api/challenges/complete
GET    /api/campaigns/:campaignId/stats
```

**Game**:
```
POST   /api/session
PATCH  /api/session/:token
GET    /api/clues
GET    /api/quests
POST   /api/campaign-runs
GET    /api/commands/history/:token
```

**Investigation**:
```
POST   /api/osint/analyze
GET    /api/osint/tools
POST   /api/osint/tool-call
GET    /api/investigations/:id
POST   /api/atropos/scan
GET    /api/atropos/results/:scanId
```

**Admin**:
```
GET    /api/sessions (admin)
GET    /api/admin/modmail (admin)
GET    /api/behavior/trends (admin)
POST   /api/admin/prompts/:key (admin)
```

## 🎓 For Educators & Students

### Teaching with Atropos

**University Courses**:
- Integrate as lab component of cybersecurity courses
- Students progress at their own pace
- Track progress via admin dashboard
- Export portfolios for assessment

**Training Programs**:
- Bootcamp-style intensive tracks
- Cohort-based learning
- Instructor-led demonstrations
- Certification preparation

**Self-Study**:
- Complete autonomy over pace and path
- Adaptive difficulty based on skill level
- Weekly challenges for motivation
- Community support

### Learning Paths

**For Threat Intelligence Analysts**:
1. OSINT Fundamentals → Nation-State Threat Intel → Dark Web Intelligence
2. Tools: MITRE ATT&CK, ThreatConnect, Maltego, Recorded Future

**For Financial Investigators**:
1. OSINT Fundamentals → Financial Investigation → Crypto/Blockchain Investigation
2. Tools: OpenCorporates, Chainalysis, ICIJ Database, SEC EDGAR

**For OSINT Specialists**:
1. OSINT Fundamentals → SOCMINT → Geolocation Intelligence → Dark Web
2. Tools: Maltego, Google Earth Pro, Sherlock, Tor Browser

**For Security Researchers**:
1. OSINT Fundamentals → Network Security → Penetration Testing → Vulnerability Research
2. Tools: nmap, Burp Suite, Nuclei, custom scripts

### Campaign Library

**Beginner** (Guided with hints):
- Passive Reconnaissance
- Basic OSINT Investigation
- DNS Enumeration

**Intermediate** (Less guidance):
- Shell Corporation Investigation
- Active Reconnaissance
- Phishing Analysis
- Social Engineering

**Advanced** (Self-directed):
- BGP Route Tracing
- Dark Web Intelligence
- Cryptocurrency Tracing
- Network Topology Mapping
- Threat Hunting

**Expert** (Complex, multi-source):
- Incident Response
- APT Attribution
- Advanced Persistent Threat Analysis

## 🔐 Security Features

### Authentication & Authorization
- Session-based player tracking
- Admin authentication middleware
- Rate limiting on all endpoints (5-60 req/min)
- Input sanitization and validation

### Data Protection
- Zod schema validation
- SQL injection prevention (Drizzle ORM)
- Session token validation
- Behavioral profiling and flagging

### Security Headers
- Content Security Policy
- X-Frame-Options (clickjacking prevention)
- XSS Protection
- Referrer Policy

## 🎨 Design System

### Color Palette
- **Primary**: Molten bronze/gold (`amber-500`, `amber-600`, `orange-500`)
- **Accent**: Retro vaporwave teal (`teal-400`, `teal-500`)
- **Background**: Dark theme (`stone-900`, `stone-950`, `black`)
- **Text**: `stone-100`, `stone-300`

### Visual Effects
- Torch-cut borders with `.torch-border`, `.torch-cut`, `.molten-edge`
- Animated glow effects with breathing shimmer
- Framer Motion for page transitions
- Quantum field and mystical overlays
- Mobile floating menu

## 🚀 Deployment

### Environment Variables

**Required**:
```bash
PORT=5000                    # Server port
DATABASE_URL=postgresql://   # PostgreSQL connection
```

**Optional**:
```bash
OPENROUTER_API_KEY=          # For AI agent features
APP_ACCESS_TOKEN=            # Admin access control
ENABLE_ATROPOS_BUILD=1       # Build Atropos from source
SKIP_ATROPOS_BUILD=1         # Skip Atropos entirely
```

### Production Build

```bash
# Build everything
npm run build

# With Atropos scanner (first time)
ENABLE_ATROPOS_BUILD=1 npm run build

# Start production server
npm start
```

### Database Migrations

```bash
# Push schema changes
npm run db:push

# Note: Creates 30+ tables including:
# - game_sessions, clues, quests
# - player_progression, achievements, leaderboards
# - campaign_runs, campaign_stats
# - investigation_contexts, osint_tool_calls
# - modmail, behavioral_profiles
```

### Replit Deployment

This project is optimized for Replit:
- `.replit` configures Node 20, port 5000, `npm run dev`
- Replit Auth integration for authentication
- OpenRouter integration for AI features
- Database auto-provisioned via Replit Postgres
- See [replit.md](replit.md) for deployment guide

## 📖 Usage Guide

### For Players

**1. Start Your Journey**:
```bash
# Visit the platform
open http://localhost:5000

# Create session (automatic on first visit)
# Choose your learning style and goals
```

**2. Begin Investigations**:
```
# Launch terminal
/terminal

# Or start guided campaign
/campaigns

# Or jump to AI workspace
/investigate
```

**3. Track Progress**:
```
# View your profile
/profile

# Check leaderboards
/leaderboards

# Complete daily challenge
```

**4. Build Portfolio**:
- Complete investigations
- Document findings in Report Builder
- Export professional reports
- Showcase achievements

### For Instructors

**1. Create Campaigns**:
```typescript
// Use Campaign Designer at /admin
// Or define in client/src/config/agentCampaigns.ts

// Add learning metadata:
learningObjectives: [
  { goal: 'osint_investigation', weight: 10, description: '...' }
],
teachingAdaptations: {
  experiential: 'Hands-on guidance...',
  visual: 'Visual diagrams...',
  // ... for all 5 learning styles
}
```

**2. Monitor Progress**:
```
# Visit admin dashboard
/admin

# View campaign analytics
GET /api/campaigns/:id/stats

# Track player progression
GET /api/sessions
```

**3. Manage Content**:
- Create achievements via admin API
- Design daily challenges
- Configure OSINT tools
- Customize AI agent prompts

## 🧪 Testing

### Run Tests
```bash
# Type checking
npm run check

# Build test
npm run build
```

### Manual QA Checklist
- [ ] Visit `/profile` - Check XP/level display
- [ ] Visit `/leaderboards` - Verify rankings
- [ ] Complete campaign - Check XP awarded
- [ ] Unlock achievement - Verify notification
- [ ] Daily challenge - Test completion flow
- [ ] Admin endpoints - Verify auth required

## 📊 Analytics & Metrics

### Campaign Analytics
Track for each campaign:
- Total attempts vs completions
- Average completion time
- Fastest completion time
- Drop-off analysis
- Player ratings
- Completion rate percentage

### Player Analytics
Track for each player:
- XP and level progression
- Skill specialization development
- Campaigns completed
- Clues found (including hidden)
- Tool proficiency
- Playtime and streaks

### Behavioral Analytics
- Learning style detection
- Interest profiling
- Skill level assessment
- Pace preferences
- Pain point identification

## 🤝 Contributing

### Adding Campaigns

Use the template in [docs/CAMPAIGN_LEARNING_TEMPLATE.md](docs/CAMPAIGN_LEARNING_TEMPLATE.md):

```typescript
{
  id: 'your_campaign',
  name: 'Campaign Name',
  difficulty: 'intermediate',
  learningObjectives: [
    { goal: 'osint_investigation', weight: 10, description: '...' }
  ],
  skillsRequired: ['Basic OSINT', ...],
  skillsTaught: ['New skill 1', ...],
  learningOutcomes: ['Student will be able to...'],
  industryContext: 'How professionals use this...',
  realWorldExamples: ['Actual incidents...'],
  careerPaths: ['Job roles...'],
  teachingAdaptations: {
    experiential: '...',
    visual: '...',
    analytical: '...',
    social: '...',
    pragmatic: '...'
  }
}
```

### Code Style

- TypeScript strict mode
- Functional React components
- shadcn/ui components
- Mobile-first (48px+ touch targets)
- See [.cursorrules](.cursorrules) for full conventions

## 🎓 Education Use Cases

### Cybersecurity Bootcamps
- Structured learning paths
- Progress tracking
- Portfolio development
- Career preparation

### University Courses
- Lab component integration
- Self-paced modules
- Automated assessment
- Industry-relevant skills

### Professional Training
- Continuing education
- Skill verification
- Tool mastery
- Real-world scenarios

### Self-Directed Learning
- Choose your own path
- Learn at your pace
- Community support
- No prerequisites

## 🏆 Recognition & Certification

### Achievement-Based Credentials
- **OSINT Investigator**: Complete foundation + 3 specialization tracks
- **Financial Crime Analyst**: Financial investigation track mastery
- **Threat Intelligence Analyst**: Nation-state + dark web tracks
- **Master Investigator**: All tracks + expert contributions

### Portfolio Artifacts
- Completed investigation reports
- Tool proficiency demonstrations
- Custom automation scripts
- Published writeups or research

### Industry Recognition
- Skills directly applicable to security roles
- Evidence-based competency demonstration
- Peer-reviewed investigations
- Professional portfolio for job applications

## 🔗 Integrations

### AI/LLM
- **OpenRouter**: Multi-model AI access (Claude, GPT-4, Gemini, etc.)
- **Custom Prompts**: Admin-configurable system prompts
- **Learning Adaptation**: AI adjusts to your learning style

### Security Tools
- **Shodan**: Internet-wide scanning
- **VirusTotal**: File/URL analysis
- **SecurityTrails**: Historical DNS/WHOIS
- **Censys**: Certificate/host search

### Educational
- **MITRE ATT&CK**: Threat framework integration
- **CVE Database**: Vulnerability reference
- **OSINT Framework**: Tool directory

## 📈 Roadmap

### Phase 1: Foundation ✅ COMPLETE
- Player progression system
- Achievement framework
- Leaderboards
- Learning curriculum
- OSINT specializations

### Phase 2: Automation (Next)
- Achievement auto-unlock events
- Automated daily challenge generation
- Campaign recommendation engine
- Progress notifications

### Phase 3: Social (Month 2)
- Friend lists
- Team investigations
- Challenge friends to campaigns
- Share achievements

### Phase 4: Advanced Analytics (Month 3)
- Learning analytics dashboard
- Skill gap analysis
- Personalized learning paths
- Predictive difficulty adjustment

### Phase 5: Expansion (Month 4+)
- Certification program
- University partnerships
- Industry endorsements
- Community campaign marketplace

## 🛠️ Troubleshooting

### Atropos Not Building
```bash
# Check if Rust installed
cargo --version

# If not, install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build and cache
npm run build:atropos
```

### Database Issues
```bash
# Reset database schema
npm run db:push

# Check connection
psql $DATABASE_URL
```

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clean build
rm -rf dist
npm run build
```

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

### Open Source Tools
- **Atropos Scanner**: Based on BSOD's Atropos OSINT framework
- **OSINT Tools**: theHarvester, Amass, Subfinder, BBOT, Nuclei
- **UI Components**: shadcn/ui (Radix UI primitives)

### Inspiration
- **Bellingcat**: Open source investigations and OSINT techniques
- **MITRE ATT&CK**: Threat intelligence framework
- **HackTheBox/TryHackMe**: Gamified cybersecurity learning
- **Khan Academy**: Adaptive learning methodologies

### Community
Built with feedback from security professionals, students, and educators who believe that cybersecurity skills are best learned through hands-on experience and real-world practice.

---

## 🌟 What Makes Atropos Different

Most platforms do ONE thing:
- **CTF platforms**: Gamification without structured education
- **Online courses**: Education without hands-on practice
- **Certification programs**: Testing without real experience

**Atropos does ALL THREE**:
- ✅ **Gamification**: Progression, achievements, leaderboards, daily challenges
- ✅ **Education**: Comprehensive curriculum, learning paths, career guidance
- ✅ **Real Practice**: Actual OSINT tools, real scenarios, portfolio building

**Plus innovation**:
- ✅ **Adaptive Teaching**: 5 learning styles with personalized guidance
- ✅ **Mission-Critical Mindset**: Experience and skills over degrees
- ✅ **Portfolio Assessment**: Prove competence through investigations
- ✅ **Industry Integration**: Real incidents, actual tools, relevant job skills

---

**Built for**: Security professionals, students, educators, and self-learners  
**Philosophy**: Experience > Degrees | Practice > Theory | Skills > Certificates  
**Status**: Production ready, actively maintained  

**Start learning**: `npm run dev` 🚀
