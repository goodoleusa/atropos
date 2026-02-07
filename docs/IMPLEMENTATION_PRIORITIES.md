# Atropos Implementation Priorities
**Actionable Roadmap: What to Build First**

> This document breaks down the architecture vision into concrete, prioritized tasks for immediate implementation.

---

## 🎯 Prioritization Framework

**Impact Score** = User Value × Business Value × Technical Feasibility

### Scoring:
- **High Priority** (Score 7-9): Build NOW
- **Medium Priority** (Score 4-6): Build next quarter
- **Low Priority** (Score 1-3): Future consideration

---

## 🔥 PHASE 1: IMMEDIATE PRIORITIES (Months 1-3)
**Goal**: Maximize player engagement and retention

### 1.1 Dynamic Campaign Branching ⭐⭐⭐ (Score: 9/10)

**Why**: Dramatically increases replay value and player engagement

**Database Changes Needed:**
```sql
-- Add to existing schema
CREATE TABLE campaign_branches (
  id SERIAL PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  trigger_condition JSONB NOT NULL,
  next_node_id TEXT NOT NULL,
  difficulty_modifier INTEGER,
  narrative_text TEXT
);

CREATE TABLE player_campaign_state (
  id SERIAL PRIMARY KEY,
  session_token TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  current_branch TEXT NOT NULL,
  choices_made JSONB DEFAULT '[]',
  time_remaining INTEGER,
  failed_attempts INTEGER,
  optimal_path_score NUMERIC(5,2)
);
```

**Implementation Tasks:**
- [ ] Create database migrations for branching tables
- [ ] Update Campaign Designer to support branching logic
- [ ] Build branch evaluation engine (checks trigger conditions)
- [ ] Update CampaignPlayer component to handle branches
- [ ] Refactor existing campaigns to have 2-3 branches each
- [ ] Add "choice" node type to campaign builder
- [ ] Test with 3 pilot campaigns

**Files to Modify:**
- `shared/schema.ts` - Add new tables
- `server/storage.ts` - Add branching methods
- `client/src/components/CampaignDesigner.tsx` - Add branch UI
- `client/src/pages/CampaignPlayer.tsx` - Branch navigation logic
- `client/src/config/agentCampaigns.ts` - Refactor campaigns

**Estimated Effort**: 2-3 weeks

**Success Metric**: 50% of players replay at least one campaign

---

### 1.2 Multi-Dimensional Leaderboards ⭐⭐⭐ (Score: 8/10)

**Why**: Creates competition and social proof

**Database Changes:**
```sql
-- Already exists: leaderboardEntries table
-- Need to add:
CREATE TABLE leaderboard_types (
  id SERIAL PRIMARY KEY,
  type_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  metric_calculation TEXT NOT NULL,  -- 'completion_time', 'thoroughness', etc.
  sort_order TEXT DEFAULT 'desc',
  is_active BOOLEAN DEFAULT TRUE
);

-- Add calculated columns to campaignRuns
ALTER TABLE campaign_runs ADD COLUMN completion_time INTEGER;
ALTER TABLE campaign_runs ADD COLUMN thoroughness_score NUMERIC(5,2);
ALTER TABLE campaign_runs ADD COLUMN efficiency_score NUMERIC(5,2);
```

**Implementation Tasks:**
- [ ] Create leaderboard type definitions
- [ ] Add scoring calculations to campaign completion
- [ ] Build leaderboard API endpoints (`/api/leaderboards/:type`)
- [ ] Create Leaderboards page component
- [ ] Add "View Leaderboard" button to campaign completion screen
- [ ] Implement weekly/monthly/all-time filters
- [ ] Add player rank badges

**Files to Modify:**
- `shared/schema.ts` - Add leaderboard types
- `server/routes.ts` - Add leaderboard endpoints
- `server/storage.ts` - Add ranking calculations
- `client/src/pages/Leaderboards.tsx` - Build UI (already exists, enhance)
- `client/src/pages/CampaignPlayer.tsx` - Track metrics

**Estimated Effort**: 1-2 weeks

**Success Metric**: 30% of players check leaderboards weekly

---

### 1.3 Skill Tree Progression ⭐⭐ (Score: 7/10)

**Why**: Provides clear progression path and specialization

**Database Changes:**
```sql
CREATE TABLE skill_trees (
  id SERIAL PRIMARY KEY,
  tree_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  max_level INTEGER DEFAULT 20
);

CREATE TABLE skill_levels (
  id SERIAL PRIMARY KEY,
  tree_id TEXT NOT NULL REFERENCES skill_trees(tree_id),
  level INTEGER NOT NULL,
  xp_required INTEGER NOT NULL,
  unlocks JSONB DEFAULT '[]',  -- Tools, campaigns, features
  bonuses JSONB DEFAULT '{}'   -- {speed: 1.1, accuracy: 1.05}
);

CREATE TABLE player_skills (
  id SERIAL PRIMARY KEY,
  session_token TEXT NOT NULL,
  tree_id TEXT NOT NULL REFERENCES skill_trees(tree_id),
  current_level INTEGER DEFAULT 0,
  current_xp INTEGER DEFAULT 0,
  unlocked_abilities JSONB DEFAULT '[]',
  UNIQUE(session_token, tree_id)
);
```

**Implementation Tasks:**
- [ ] Define 5 skill trees: OSINT, Network, Malware, Social, Crypto
- [ ] Create skill progression data (levels 1-20 for each)
- [ ] Build skill XP awarding system (campaign completion gives XP in relevant skills)
- [ ] Create Skill Tree UI component (visual tree display)
- [ ] Add skill unlocks to campaign requirements
- [ ] Update player profile to show skill specializations
- [ ] Add skill-based campaign recommendations

**Files to Modify:**
- `shared/schema.ts` - Add skill tables
- `server/storage.ts` - Skill progression methods
- `server/routes/progressionRoutes.ts` - Skill endpoints
- `client/src/pages/Profile.tsx` - Display skills
- `client/src/components/SkillTreeViewer.tsx` - NEW component

**Estimated Effort**: 2-3 weeks

**Success Metric**: 60% of players unlock at least one skill tree level

---

### 1.4 Live Threat Feed Integration ⭐⭐ (Score: 7/10)

**Why**: Real-world relevance, marketing opportunity

**Database Changes:**
```sql
-- Already exists: liveThreatCampaigns table from schema
-- Just need to implement the pipeline
```

**Implementation Tasks:**
- [ ] Set up cron job to fetch CISA KEV feed daily
- [ ] Set up cron job to fetch abuse.ch feeds daily
- [ ] Build threat-to-campaign converter (LLM-powered)
- [ ] Create breaking news notification system
- [ ] Build "Breaking News" section on homepage
- [ ] Add push notifications for mobile
- [ ] Create limited-time campaign UI indicators

**Files to Modify:**
- `server/routes.ts` - Already has `/api/threat-intel/fetch`
- `server/jobs/threatMonitoring.ts` - NEW: Background job
- `server/services/campaignGenerator.ts` - NEW: AI generation
- `client/src/pages/Home.tsx` - Add breaking news banner
- `client/src/components/BreakingNewsBanner.tsx` - NEW

**Estimated Effort**: 2 weeks

**Success Metric**: 1-2 live threat campaigns per week, 40% participation rate

---

## 💼 PHASE 2: BUSINESS FOUNDATION (Months 4-6)
**Goal**: Launch professional services, generate first revenue

### 2.1 Client Portal MVP ⭐⭐⭐ (Score: 9/10)

**Why**: Core business revenue stream

**Database Changes:**
```sql
-- Already defined in schema:
-- clientOrganizations, clientAssets, threatAlerts
-- Just need to implement
```

**Implementation Tasks:**
- [ ] Build authentication for client portal (separate from game)
- [ ] Create client dashboard page
- [ ] Build asset management UI (add/edit/delete domains, IPs, etc.)
- [ ] Create alert feed display
- [ ] Build monthly report generator
- [ ] Implement email notifications for alerts
- [ ] Add SLA tracking dashboard

**Files to Create:**
- `client/src/pages/client-portal/Dashboard.tsx`
- `client/src/pages/client-portal/Assets.tsx`
- `client/src/pages/client-portal/Alerts.tsx`
- `client/src/pages/client-portal/Reports.tsx`
- `server/routes/clientPortal.ts`
- `server/services/alerting.ts`

**Estimated Effort**: 4 weeks

**Success Metric**: Onboard 3 pilot clients at $500-1,000/mo each

---

### 2.2 Automated Credential Monitoring ⭐⭐⭐ (Score: 8/10)

**Why**: High-value, easy to sell, automatable

**Implementation Tasks:**
- [ ] Integrate Have I Been Pwned API
- [ ] Integrate DeHashed API (paid)
- [ ] Set up daily scan job for all client emails
- [ ] Build alert creation pipeline
- [ ] Implement email notification system
- [ ] Create credential leak alert template
- [ ] Add remediation suggestions (password reset, MFA enable)

**Files to Create:**
- `server/jobs/credentialScanning.ts`
- `server/integrations/hibp.ts`
- `server/integrations/dehashed.ts`
- `server/services/alertGeneration.ts`

**Estimated Effort**: 2 weeks

**Success Metric**: 95%+ alert delivery rate, <5% false positives

---

### 2.3 Subscription Management (Stripe) ⭐⭐⭐ (Score: 8/10)

**Why**: Revenue infrastructure

**Database Changes:**
```sql
-- Already defined: subscriptions, invoices, usageTracking
```

**Implementation Tasks:**
- [ ] Set up Stripe account and API keys
- [ ] Create subscription products in Stripe (Free, Student, Pro, Enterprise)
- [ ] Build checkout flow
- [ ] Implement webhook handler for payment events
- [ ] Create subscription management page (upgrade/downgrade/cancel)
- [ ] Build billing history page
- [ ] Implement usage tracking for API limits
- [ ] Add payment failure handling

**Files to Create:**
- `server/integrations/stripe.ts`
- `server/routes/billing.ts`
- `client/src/pages/Billing.tsx`
- `client/src/components/CheckoutFlow.tsx`

**Estimated Effort**: 2-3 weeks

**Success Metric**: 10% free → paid conversion rate

---

## 🎨 PHASE 3: CONTENT & COMMUNITY (Months 7-9)
**Goal**: Scale content production, build community

### 3.1 AI Campaign Generator ⭐⭐⭐ (Score: 9/10)

**Why**: 10x content creation speed

**Implementation Tasks:**
- [ ] Design campaign generation prompt templates
- [ ] Build LLM integration (OpenRouter with Claude Opus)
- [ ] Create target data generator (dummy companies, IPs, etc.)
- [ ] Build validation engine (check campaign logic)
- [ ] Create admin UI for generation
- [ ] Implement batch generation (10 variations at once)
- [ ] Add quality scoring system

**Files to Create:**
- `server/services/aiCampaignGenerator.ts`
- `server/services/targetDataGenerator.ts`
- `server/services/campaignValidator.ts`
- `client/src/pages/admin/CampaignGenerator.tsx`

**Estimated Effort**: 3 weeks

**Success Metric**: Generate 10+ high-quality campaigns per week

---

### 3.2 Visual Campaign Builder Enhancement ⭐⭐ (Score: 7/10)

**Why**: Empowers non-technical content creators

**Implementation Tasks:**
- [ ] Add branch node type to designer
- [ ] Implement drag-and-drop connections
- [ ] Add node property editor panel
- [ ] Create template library (pre-built flows)
- [ ] Add campaign preview/playtest mode
- [ ] Implement auto-layout for nodes
- [ ] Add undo/redo functionality

**Files to Modify:**
- `client/src/components/CampaignDesigner.tsx` - Already exists
- `client/src/components/campaign/CampaignCanvas.tsx`
- `client/src/components/campaign/NodeEditor.tsx`

**Estimated Effort**: 2-3 weeks

**Success Metric**: Non-developers create 30% of campaigns

---

### 3.3 Community Marketplace ⭐⭐ (Score: 7/10)

**Why**: User-generated content scales platform

**Database Changes:**
```sql
-- Already have: designerCampaigns with isPublished flag
-- Need to add voting/rating:
CREATE TABLE campaign_ratings (
  id SERIAL PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  session_token TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, session_token)
);
```

**Implementation Tasks:**
- [ ] Create community campaigns page (browse all published)
- [ ] Add rating/review system
- [ ] Implement featured campaigns carousel
- [ ] Build moderation queue for admin
- [ ] Create creator profile pages
- [ ] Add campaign search and filtering
- [ ] Implement "trending" algorithm

**Files to Create:**
- `client/src/pages/CommunityHub.tsx`
- `client/src/pages/CreatorProfile.tsx`
- `client/src/pages/admin/ModerationQueue.tsx`

**Estimated Effort**: 3 weeks

**Success Metric**: 50+ community campaigns published in 6 months

---

## 🎯 PHASE 4: ADVANCED FEATURES (Months 10-12)
**Goal**: Differentiation and scale

### 4.1 Big Game Bounty Infrastructure ⭐⭐ (Score: 7/10)

**Why**: Massive upside, good PR

**Database Changes:**
```sql
-- Already defined: bigGameTargets, indicatorMatches, bountySubmissions
```

**Implementation Tasks:**
- [ ] Seed database with FBI/Secret Service most wanted
- [ ] Build cross-investigation matching system
- [ ] Create admin dashboard for reviewing matches
- [ ] Implement confidence scoring algorithm
- [ ] Build evidence packaging system
- [ ] Create law enforcement coordination workflow

**Files to Create:**
- `server/services/bountyHunting.ts`
- `server/jobs/indicatorCorrelation.ts`
- `client/src/pages/admin/BigGameDashboard.tsx`

**Estimated Effort**: 3-4 weeks

**Success Metric**: 1-2 high-confidence leads in first year

---

### 4.2 Multiplayer Investigations ⭐⭐ (Score: 6/10)

**Why**: Social engagement, viral growth

**Database Changes:**
```sql
-- Already defined: teamInvestigations, investigationEvents
-- Need WebSocket infrastructure
```

**Implementation Tasks:**
- [ ] Set up Socket.io server
- [ ] Build team creation/invitation system
- [ ] Create shared evidence board component
- [ ] Implement real-time updates
- [ ] Add team chat
- [ ] Build role assignment system
- [ ] Create team leaderboards

**Files to Create:**
- `server/websocket.ts`
- `server/services/teamManagement.ts`
- `client/src/pages/TeamInvestigation.tsx`
- `client/src/components/SharedEvidenceBoard.tsx`

**Estimated Effort**: 4 weeks

**Success Metric**: 20% of players try multiplayer

---

## 📊 RESOURCE ALLOCATION

### Development Team
- **1 Full-Stack Developer** (You) - 40 hours/week
- **1 Part-Time UI/UX Designer** (Contractor) - 10 hours/week
- **1 Part-Time Content Creator** (Contractor) - 10 hours/week

### Time Budget Per Phase
- **Phase 1 (Months 1-3)**: Gameplay - 480 hours total
- **Phase 2 (Months 4-6)**: Business - 480 hours total
- **Phase 3 (Months 7-9)**: Community - 480 hours total
- **Phase 4 (Months 10-12)**: Advanced - 480 hours total

### Cost Estimate
- **Development**: Your time (covered)
- **Designer**: $50/hr × 10 hrs/wk × 12 months = $26,000
- **Content Creator**: $40/hr × 10 hrs/wk × 12 months = $20,800
- **Infrastructure**: $200/month × 12 = $2,400
- **APIs/Tools**: $300/month × 12 = $3,600
- **Total Year 1**: ~$53,000

**Revenue Target**: $225k ARR by end of Year 1
**ROI**: 4.2x

---

## ✅ DEFINITION OF DONE

Each feature is complete when:
1. ✅ Code is merged to main branch
2. ✅ Unit tests pass (80%+ coverage for critical paths)
3. ✅ Manual QA completed (test plan executed)
4. ✅ Documentation updated (API docs, user guides)
5. ✅ Success metrics are being tracked
6. ✅ No critical bugs in production

---

## 🚨 RISKS & MITIGATION

### Risk 1: Feature Creep
**Mitigation**: Strict prioritization, say no to non-essential features

### Risk 2: Technical Complexity
**Mitigation**: Build MVPs first, iterate based on feedback

### Risk 3: Slow Adoption
**Mitigation**: Focus on user feedback, pivot quickly if needed

### Risk 4: Revenue Miss
**Mitigation**: Multiple revenue streams, adjust pricing based on market

### Risk 5: Content Quality
**Mitigation**: AI generation + human review, community curation

---

## 🎯 IMMEDIATE NEXT ACTIONS (This Week)

1. **Day 1-2**: Set up database migrations for Phase 1
2. **Day 3-4**: Build campaign branching logic engine
3. **Day 5**: Update Campaign Designer UI for branches
4. **Weekend**: Test branching with one pilot campaign

**By End of Week**: Have one campaign with working branches deployed to staging

---

## 📈 WEEKLY SPRINT STRUCTURE

### Monday: Planning
- Review last sprint
- Prioritize tasks for week
- Set weekly goal

### Tuesday-Thursday: Development
- Focus time (no meetings)
- Daily standup (async)
- Ship incremental progress

### Friday: Testing & Deploy
- QA new features
- Deploy to staging
- Document what shipped

### Weekend: Learning & Planning
- Research new tech
- Plan next sprint
- Community engagement

---

## 🎓 LEARNING RESOURCES

### Phase 1 (Gameplay)
- React Flow documentation (visual editor)
- Game design principles (branching narratives)
- PostgreSQL JSONB best practices

### Phase 2 (Business)
- Stripe documentation (subscriptions)
- Background job processing (BullMQ)
- Alert/notification patterns

### Phase 3 (Community)
- LLM prompt engineering (campaign generation)
- Content moderation systems
- Community management best practices

### Phase 4 (Advanced)
- Socket.io documentation (real-time features)
- Threat intelligence platforms
- Law enforcement coordination

---

## 📋 TRACKING & ACCOUNTABILITY

### Tools
- **GitHub Projects**: Task tracking
- **Google Sheets**: Metrics dashboard
- **Notion**: Documentation
- **Discord**: Community feedback

### Metrics Dashboard (Weekly Review)
- Active users (WAU, MAU)
- Engagement (session duration, campaigns completed)
- Revenue (MRR, ARR, churn rate)
- Content (campaigns created, completion rates)
- Business (clients onboarded, alerts sent)

### Monthly Reviews
- Review metrics dashboard
- Assess progress vs. roadmap
- Gather user feedback
- Adjust priorities if needed
- Plan next month

---

## 🏆 SUCCESS CRITERIA BY PHASE

### Phase 1 Success
- [ ] 2,000 registered players
- [ ] 500 monthly active users
- [ ] 40% replay rate
- [ ] 4.5+ star average campaign rating

### Phase 2 Success
- [ ] 3-10 pilot clients
- [ ] $10-20k MRR
- [ ] 100 paying students
- [ ] 95%+ uptime

### Phase 3 Success
- [ ] 10,000 registered players
- [ ] 50+ community campaigns
- [ ] 30% UGC adoption rate
- [ ] $30-50k MRR

### Phase 4 Success
- [ ] 50,000 registered players
- [ ] 30+ client organizations
- [ ] 1,000+ paying students
- [ ] $50-100k MRR

---

**Let's build this systematically, one feature at a time, with clear goals and measurable outcomes.**

🚀 Ready to start? Begin with **1.1 Dynamic Campaign Branching** → See you in production!
