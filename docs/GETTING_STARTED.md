# Getting Started with Atropos

Welcome to Atropos - a cybersecurity training platform where you learn by doing real investigations.

## 🎯 What is Atropos?

Atropos is a **hands-on cybersecurity training platform** that combines:
- **Gamification**: XP, levels, achievements, leaderboards
- **Real OSINT Tools**: Shodan, WHOIS, DNS analysis, blockchain tracers
- **AI Guidance**: Adaptive teaching based on your learning style
- **Career Focus**: Skills that lead to actual security jobs

**Philosophy**: In cybersecurity, experience matters more than degrees. We teach through practice.

## 🚀 Your First 15 Minutes

### Step 1: Launch the Platform (30 seconds)

```bash
# If already installed:
npm run dev

# Then visit:
http://localhost:5000
```

Your session is created automatically. No signup required!

### Step 2: Choose Your Learning Style (1 minute)

Visit your profile or the terminal will ask:

**Pick one that resonates**:
- 🔧 **Experiential**: "Just let me try things and learn by doing"
- 📊 **Visual**: "Show me diagrams and visualizations"
- 🔬 **Analytical**: "I want to understand the theory first"
- 👥 **Social**: "I learn best from community and discussions"
- ⚡ **Pragmatic**: "Give me the fastest path to results"

The AI will adapt its teaching to match!

### Step 3: Pick Your Goals (2 minutes)

What do you want to learn?

**For Investigation/Intelligence Work**:
- 🌍 Geolocation (find locations from photos)
- 👥 SOCMINT (social media intelligence)
- 💰 Financial Investigation (follow the money)
- 🎯 Threat Intelligence (track APTs)

**For Technical Security**:
- 🔍 OSINT (open-source intelligence)
- 🛡️ Network Security (infrastructure defense)
- 🐛 Penetration Testing (ethical hacking)
- 🔬 Malware Analysis (reverse engineering)

Don't stress - you can change these anytime!

### Step 4: Start Your First Investigation (10 minutes)

**Option A: Guided Campaign** (Recommended for beginners)
```
Visit: /campaigns
Choose: "Passive Reconnaissance" (Beginner, 20-30 min)

You'll learn:
- DNS enumeration
- Subdomain discovery
- Certificate transparency
- Historical data mining
```

**Option B: AI Workspace** (For exploratory learners)
```
Visit: /investigate
Start typing: "I want to investigate a suspicious domain"

NEXUS AI will:
- Ask what you want to learn
- Suggest tools and techniques
- Guide you step-by-step
- Adapt to your pace
```

**Option C: Terminal** (For hands-on learners)
```
Visit: /terminal
Type: help

Commands:
- scan - Start reconnaissance
- nexus - Talk to AI agent
- clues - View what you've found
- quests - See objectives
```

### Step 5: See Your Progress (2 minutes)

Visit `/profile` to see:
- **Level & XP**: How far you've come
- **Skills**: Specializations you're developing
- **Achievements**: What you've unlocked
- **Stats**: Campaigns completed, clues found, playtime
- **Ranking**: Where you stand globally

## 📚 Learning Paths by Career Goal

### Path 1: Bug Bounty Hunter / Security Researcher
**Duration**: Self-paced (typically 40-60 hours)

**Modules**:
1. **Passive Reconnaissance** (Beginner, 20 min)
   - Learn: DNS, subdomains, certificate logs
   - Tools: crt.sh, SecurityTrails, Wayback Machine

2. **Active Reconnaissance** (Intermediate, 30 min)
   - Learn: Port scanning, service detection
   - Tools: nmap, masscan, netcat

3. **Vulnerability Research** (Advanced, 45 min)
   - Learn: Bug hunting, exploit analysis
   - Tools: Burp Suite, Nuclei, custom scripts

**Career outcome**: Entry-level security researcher, bug bounty participant

### Path 2: Threat Intelligence Analyst
**Duration**: Self-paced (typically 50-70 hours)

**Modules**:
1. **OSINT Investigation** (Beginner, 30 min)
   - Learn: Target profiling, digital footprints
   - Tools: Maltego, theHarvester, Shodan

2. **Nation-State Threat Intel** (Advanced, 45 min)
   - Learn: APT tracking, attribution
   - Tools: MITRE ATT&CK, ThreatConnect

3. **Dark Web Intelligence** (Advanced, 45 min)
   - Learn: Underground monitoring, stolen data
   - Tools: Tor, Ahmia, breach databases

**Career outcome**: Threat intelligence analyst, SOC analyst

### Path 3: Financial Crime Investigator
**Duration**: Self-paced (typically 45-60 hours)

**Modules**:
1. **Shell Corporation Investigation** (Intermediate, 45 min)
   - Learn: Corporate structure tracing, beneficial ownership
   - Tools: OpenCorporates, SEC EDGAR, Companies House

2. **Cryptocurrency Tracing** (Advanced, 45 min)
   - Learn: Blockchain analysis, wallet clustering
   - Tools: Chainalysis, Etherscan, blockchain explorers

3. **Financial Investigation** (Advanced, 60 min)
   - Learn: Money laundering detection, sanctions screening
   - Tools: OFAC lists, ICIJ database, corporate registries

**Career outcome**: Financial crime analyst, fraud investigator, AML compliance

### Path 4: OSINT Specialist / Private Investigator
**Duration**: Self-paced (typically 60-80 hours)

**Modules**:
1. **OSINT Fundamentals** (Beginner, 30 min)
2. **SOCMINT** (Intermediate, 45 min) - Social media intelligence
3. **Geolocation** (Intermediate, 40 min) - Photo analysis, satellite imagery
4. **Dark Web** (Advanced, 45 min) - Underground intelligence

**Career outcome**: OSINT analyst, private investigator, due diligence specialist

## 🎮 How Progression Works

### Earning XP

**Investigations**: +100 XP
- Complete any campaign
- Document your findings
- Submit report

**Hidden Clues**: +50 XP
- Find secrets in source code
- Discover easter eggs
- Solve puzzles

**Daily Challenges**: +100-300 XP
- New challenge every day
- Bonus for perfect completion
- Streak rewards

**Achievements**: Varies
- "First Investigation": +100 XP
- "Speed Runner": +250 XP  
- "Master Investigator": +1000 XP

### Leveling Up

```
Level 1-5:   Beginner (100 XP per level)
Level 6-15:  Intermediate (200 XP per level)
Level 16-30: Advanced (300 XP per level)
Level 31+:   Expert (500 XP per level)
```

### Skill Specializations

Develop expertise in 4 domains:
- **OSINT**: Passive recon, corporate intel, social media
- **Network**: Infrastructure, BGP, topology mapping
- **Malware**: Reverse engineering, triage, analysis
- **Social**: Phishing, SOCMINT, human factors

Points earned automatically based on campaign type.

### Unlocks

**Level 5**: Access to intermediate campaigns  
**Level 10**: Advanced OSINT tools unlocked  
**Level 15**: Expert campaigns available  
**Level 20**: Daily challenge hard mode  
**Level 25**: Campaign designer access  
**Level 30**: Instructor/mentor capabilities

## 🏆 Achievement Categories

### Discovery Achievements
- "First Steps": Complete your first campaign
- "Hidden Hunter": Find 10 hidden clues
- "Completionist": Finish all beginner campaigns
- "Secret Keeper": Discover 5 easter eggs

### Speed Achievements
- "Speed Runner": Complete campaign in under 15 minutes
- "Lightning Fast": Sub-10 minute campaign
- "Blitz Mode": Complete 3 campaigns in 1 hour

### Mastery Achievements
- "Tool Master": Use 20 different OSINT tools
- "Script Kiddie": Write your first automation
- "Power User": Master all 4 skill specializations
- "Guru": Reach level 50

### Social Achievements
- "Team Player": Complete multiplayer campaign
- "Mentor": Help another player
- "Community Contributor": Create and share a campaign

### Special Achievements
- "Night Owl": Complete investigation at 3AM
- "Persistent": 30-day login streak
- "Perfectionist": 100% completion on 10 campaigns

## 📊 Using the Leaderboards

### Global Rankings
Visit `/leaderboards` to see:
- **Top 100 Players**: By total XP earned
- **Your Position**: Highlighted in gold
- **Weekly Champions**: This week's top performers
- **Campaign Records**: Fastest completion times

### Improving Your Rank

**Consistent Activity**: Daily logins and challenges  
**Quality Investigations**: Complete campaigns thoroughly  
**Speed Runs**: Beat time records for bonus XP  
**Achievement Hunting**: Unlock rare achievements  
**Community Engagement**: Share campaigns, help others

## 🎯 Daily Challenges

Every day at midnight UTC, a new challenge appears:

**Challenge Types**:
- **Mini Investigation**: 15-minute focused task
- **Speed Run**: Complete campaign under time limit
- **Collection**: Find specific clues across multiple sources
- **Skill Test**: Demonstrate proficiency in a tool

**Rewards**:
- 100-300 XP (difficulty-based)
- 50-100 Credits (in-game currency)
- Streak bonuses for consecutive days

**View Today's Challenge**:
- Visit `/profile` → Daily Challenge tab
- Or check QuickNav (bottom-right menu)

## 🧠 Learning Styles Explained

### How It Works

When you select a learning style, the NEXUS AI adapts its guidance:

**🔧 Experiential Learner**:
```
AI says: "Try this command: nmap -sV target.com"
         "See what happens. Then we'll explain."
```

**📊 Visual Learner**:
```
AI says: "Here's a network diagram showing the target's infrastructure..."
         [Generates ASCII art or describes visual relationships]
```

**🔬 Analytical Learner**:
```
AI says: "First, let's understand how DNS resolution works (RFC 1035)..."
         "The technical foundation is important before we proceed."
```

**👥 Social Learner**:
```
AI says: "This technique is discussed in Bellingcat's OSINT guide..."
         "Join the OSINT Curious community to learn more."
```

**⚡ Pragmatic Learner**:
```
AI says: "Quick workflow: crt.sh → subfinder → httpx. Done."
         "Here's the one-liner to automate it."
```

You can switch styles anytime!

## 🎓 For Students

### Self-Paced Learning
- No deadlines or timelines
- Learn what interests you
- Skip what you already know
- Deep dive into specializations

### Portfolio Building
Every investigation you complete adds to your portfolio:
- Documented findings
- Tool proficiency evidence
- Custom scripts/automation
- Professional reports

**Use your portfolio for**:
- Job applications
- Freelance work
- Skill verification
- Continuing education credits

### Assessment
No traditional exams! Demonstrate competence through:
- **Completed Investigations**: Can you find the intelligence?
- **Methodology**: Did you use appropriate techniques?
- **Documentation**: Can you explain your process?
- **Tool Mastery**: Do you understand the outputs?

## 🏫 For Educators

### Running Atropos in Classes

**University Courses**:
```
1. Assign campaigns as lab exercises
2. Students work at their own pace
3. Track progress via admin dashboard
4. Grade based on investigation portfolios
5. Export student reports for assessment
```

**Bootcamps/Training Programs**:
```
1. Cohort-based learning with shared campaigns
2. Instructor-led demonstrations
3. Student practice and exploration
4. Weekly challenges for motivation
5. Certification based on skill demonstration
```

**Corporate Training**:
```
1. Assign role-specific learning paths
2. Track employee skill development
3. Issue internal certifications
4. Integrate with HR systems
5. Measure training ROI
```

### Managing Students

**Admin Dashboard** (`/admin`):
- View all active sessions
- Track campaign completion rates
- Identify struggling students
- See behavioral patterns
- Review investigation reports

**Analytics Available**:
- Time spent per campaign
- Drop-off points
- Tool usage frequency
- Learning style distribution
- Achievement unlock rates

## 🛠️ Technical Setup for Replit

### First Time Setup

1. **Fork this Repl** or import from GitHub
2. **Set Secrets** (in Replit Secrets):
   ```
   DATABASE_URL=<from Replit Postgres>
   OPENROUTER_API_KEY=<your key>
   APP_ACCESS_TOKEN=<random string for admin>
   ```
3. **Run**:
   ```bash
   npm install
   npm run build:atropos  # Build scanner (optional)
   npm run db:push        # Create tables
   npm run dev            # Start app
   ```

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | No (defaults 5000) | Server port |
| `DATABASE_URL` | Yes | PostgreSQL connection |
| `OPENROUTER_API_KEY` | For AI features | LLM access |
| `APP_ACCESS_TOKEN` | For admin | Admin authentication |
| `ENABLE_ATROPOS_BUILD` | No | Build scanner from source |
| `SKIP_ATROPOS_BUILD` | No | Skip scanner entirely |

### Database Tables

Running `npm run db:push` creates **30+ tables** including:

**Player System**:
- `player_progression` - XP, levels, skills, stats
- `achievements`, `player_achievements` - Unlock system
- `leaderboard_entries` - Rankings
- `daily_challenges`, `challenge_completions`
- `campaign_stats` - Analytics

**Game System**:
- `game_sessions` - Player sessions
- `clues`, `quests` - Collectibles
- `campaign_runs` - Investigation progress

**Content System**:
- `designer_campaigns` - User-created campaigns
- `agent_modules` - Investigation modules
- `shared_clues` - Clue library

**Intelligence System**:
- `osint_tools`, `osint_tool_calls` - Tool tracking
- `investigation_contexts` - Shared state
- `interaction_logs` - User actions

### Performance Optimization

**Atropos Scanner**:
```bash
# Build once on deployment
npm run build:atropos

# Cached for future builds (instant)
# See docs/ATROPOS_BUILD_CACHING.md
```

**Database**:
- Indexes on all foreign keys
- JSONB for flexible metadata
- Denormalized leaderboards for performance

**API**:
- Rate limiting (5-60 req/min per endpoint)
- Zod validation on all inputs
- Prepared statements (SQL injection safe)

## 🎯 Key Pages & Routes

### For Players
- `/` - Homepage with video intro
- `/terminal` - Custom terminal interface
- `/profile` - Your dashboard (XP, achievements, stats) ✨ NEW
- `/leaderboards` - Global rankings ✨ NEW
- `/campaigns` - Campaign library
- `/play/:campaignId` - Play a campaign
- `/investigate` - AI investigation workspace
- `/report` - Report builder
- `/agents` - Multi-agent analysis

### For Admins
- `/admin` - Admin dashboard
- `/admin?section=collectibles` - Manage clues
- `/admin?section=quests` - Manage quests
- `/admin?section=agentmodules` - Configure campaigns
- `/admin?section=behavior` - User analytics

## 🎓 Learning Resources

### In-Platform
- **Campaign Library**: 23 investigations from beginner to expert
- **AI Assistant**: Ask NEXUS anything, get adaptive guidance
- **Tool Docs**: Every campaign explains tools used
- **Real Examples**: Based on actual security incidents

### External (Recommended)
- **OSINT Framework**: osintframework.com
- **MITRE ATT&CK**: attack.mitre.org
- **Bellingcat**: bellingcat.com (investigation techniques)
- **Cybersecurity & Infrastructure Security Agency (CISA)**: cisa.gov

### Community
- Join OSINT communities on Discord/Reddit
- Follow security researchers on Twitter/Mastodon
- Read writeups on Medium and personal blogs
- Participate in CTFs (Capture The Flag events)

## 🏆 Earning Your First Achievement

### "First Steps" Achievement
**Requirement**: Complete your first campaign  
**Reward**: +100 XP, +50 Credits  
**How to unlock**:
1. Visit `/campaigns`
2. Choose "Passive Reconnaissance" (easiest)
3. Follow NEXUS guidance
4. Complete the investigation
5. Watch the achievement popup! 🎉

### "Speed Learner" Achievement
**Requirement**: Complete beginner campaign in under 15 minutes  
**Reward**: +250 XP, +100 Credits, Rare tier  
**Strategy**:
- Choose Pragmatic learning style (fastest guidance)
- Run passive recon campaign
- Use keyboard shortcuts
- Focus on core objectives only

### "Hidden Hunter" Achievement
**Requirement**: Find 5 hidden clues  
**Reward**: +500 XP, +200 Credits, Epic tier  
**Where to look**:
- Page source code (HTML comments)
- Network requests (HTTP headers)
- Console logs (developer tools)
- CSS files (hidden content)
- Base64 encoded strings

## 💡 Tips for Success

### 1. Start Simple
Don't jump to advanced campaigns. Master the basics first:
- Passive Recon → Active Recon → Specialized investigations

### 2. Use Your Learning Style
The AI adapts to you. Be honest about how you learn best.

### 3. Document Everything
Use the Report Builder. Practice professional documentation.

### 4. Explore Tools
Every tool mastered makes you more valuable as a professional.

### 5. Join Daily Challenges
Consistency beats intensity. 15 minutes daily > 3 hours once a week.

### 6. Build Your Portfolio
Save reports, share investigations, showcase your skills.

### 7. Compete Healthily
Leaderboards motivate but don't obsess. Focus on skill development.

## ❓ FAQ

**Q: Do I need cybersecurity experience?**  
A: No! Start with beginner campaigns. We teach from scratch.

**Q: How long does it take to get job-ready?**  
A: 40-80 hours of focused investigation practice, depending on specialization.

**Q: Are achievements worth anything?**  
A: They demonstrate skill competency. Include in your portfolio.

**Q: Can I create my own campaigns?**  
A: Yes! Use the Campaign Designer at `/admin` (unlock at level 25).

**Q: Is this free?**  
A: Open source (MIT license). Self-hosted = free. Cloud hosting has costs.

**Q: Does this replace a degree?**  
A: No degree needed! Many security pros are self-taught. This builds practical skills employers want.

**Q: How do I prove my skills?**  
A: Export your investigation portfolio. Show completed campaigns, achievements, and reports.

## 🚧 Troubleshooting

**"Cannot connect to database"**:
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Push schema
npm run db:push
```

**"AI agent not responding"**:
```bash
# Check API key is set
echo $OPENROUTER_API_KEY

# Verify in Replit Secrets
```

**"Atropos scanner not found"**:
```bash
# Build and cache it
npm run build:atropos

# Or skip it
SKIP_ATROPOS_BUILD=1 npm run build
```

**"Profile page empty"**:
```bash
# Make sure tables exist
npm run db:push

# Check session token in browser DevTools → localStorage
```

## 🎉 Next Steps

1. ✅ Complete "Passive Reconnaissance" campaign
2. ✅ Unlock your first achievement
3. ✅ Check your ranking on leaderboards
4. ✅ Complete today's daily challenge
5. ✅ Try a different learning style
6. ✅ Explore an OSINT specialization track

**Then**: Pick a career path and start building your portfolio!

---

**Welcome to Atropos. Learn by doing. Build real skills. Launch your security career.** 🚀

For detailed curriculum information, see [docs/CURRICULUM.md](CURRICULUM.md)
