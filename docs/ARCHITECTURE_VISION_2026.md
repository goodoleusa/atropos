# Atropos Platform - Architecture Vision 2026
**Strategic Roadmap for Gameplay, Management & Business Evolution**

> *"A platform that seamlessly blends engaging cybersecurity education with professional-grade threat intelligence services, creating a sustainable business while training the next generation of security professionals."*

---

## Executive Summary

This document outlines a comprehensive architectural vision for the Atropos platform, addressing three critical pillars:

1. **Enhanced Gameplay** - Transform learning into an engaging, competitive, and replayable experience
2. **Advanced Game Management** - Empower administrators with powerful content creation and analytics tools
3. **Professional Business Platform** - Build a robust client services infrastructure for threat intelligence and monitoring

**Current State**: Educational CTF platform with OSINT campaigns, hidden clues, achievements, and AI-powered investigation assistant.

**Vision State**: Multi-dimensional security training platform with professional client services, competitive gameplay, community-driven content, and automated threat intelligence operations.

---

## 🎮 PILLAR 1: Enhanced Gameplay

### 1.1 Dynamic Campaign System

#### Current Limitations
- Linear campaign progression
- Limited replayability
- No adaptive difficulty
- Same experience for all skill levels

#### Vision: Adaptive, Branching Investigations

**Multi-Path Campaigns**
```typescript
interface AdaptiveCampaign {
  entryPoints: {
    beginner: string;    // Guided, educational
    intermediate: string; // Semi-structured
    expert: string;      // Open-ended, minimal guidance
  };
  
  branchingLogic: {
    triggers: ActionTrigger[];  // Player actions that change campaign flow
    consequences: OutcomeNode[]; // Different endings based on choices
    timeGates: TimeConstraint[]; // Time-sensitive decisions
  };
  
  proceduralElements: {
    randomizedTargets: boolean;    // Different IPs/domains each run
    shuffledClues: boolean;        // Clues appear in different order
    dynamicRedHerrings: boolean;   // False leads that change
  };
}
```

**Implementation Features:**
- **Skill-Based Entry Points**: Campaigns adapt based on player level and learning style
- **Consequence System**: Choices matter - wrong investigation steps lock out paths
- **Time Pressure Modes**: Optional speed-run variants with time-sensitive clues
- **Procedural Generation**: Target data randomized for replay value (e.g., different shell company names, IPs)

**Database Schema Additions:**
```sql
CREATE TABLE campaign_branches (
  id SERIAL PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  trigger_condition JSONB NOT NULL,  -- {type: 'tool_used', value: 'shodan'}
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
  time_remaining INTEGER,  -- For timed challenges
  failed_attempts INTEGER,
  optimal_path_score NUMERIC(5,2)  -- How efficiently they solved it
);
```

### 1.2 Competitive & Social Features

#### Vision: Transform Solo Play into Community Experience

**Competitive Modes**

```typescript
interface CompetitiveMode {
  mode: 'speed_run' | 'completionist' | 'stealth' | 'efficiency';
  rules: {
    timeLimit?: number;          // Speed run
    requiredClues?: string[];    // Completionist
    toolRestrictions?: string[]; // Stealth (no active scanning)
    minActions?: number;         // Efficiency (solve in fewest steps)
  };
  leaderboard: {
    scope: 'global' | 'weekly' | 'regional';
    metrics: ScoreMetric[];
  };
}
```

**Live Leaderboards with Multiple Dimensions:**
- **Speed**: Fastest completion time
- **Thoroughness**: Most clues discovered (including hidden ones)
- **Efficiency**: Fewest commands/actions to complete
- **Elegance**: Highest quality report generated
- **Streak**: Consecutive daily challenge completions

**Multiplayer Investigations (Async Collaboration)**

```sql
CREATE TABLE team_investigations (
  id SERIAL PRIMARY KEY,
  team_id TEXT UNIQUE NOT NULL,
  campaign_id TEXT NOT NULL,
  member_tokens JSONB NOT NULL,  -- Array of session tokens
  shared_findings JSONB DEFAULT '[]',
  shared_notes TEXT,
  collaboration_mode TEXT CHECK (mode IN ('coop', 'competitive', 'teacher_student')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Real-time shared investigation board
CREATE TABLE investigation_events (
  id SERIAL PRIMARY KEY,
  team_id TEXT NOT NULL,
  actor_session TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- 'clue_found', 'hypothesis', 'tool_run', 'note_added'
  event_data JSONB NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

**Features:**
- **Team Investigations**: 2-4 players collaborate on same case
- **Shared Evidence Board**: Real-time updates as team members find clues
- **Role Specialization**: Players can specialize (OSINT specialist, network analyst, etc.)
- **Mentor Mode**: Experienced players guide beginners through campaigns
- **Versus Mode**: Teams race to solve the same investigation

### 1.3 Advanced Progression System

#### Vision: Multi-Dimensional Character Development

**Skill Trees (RPG-style)**

```typescript
interface SkillTree {
  branches: {
    osint: {
      levels: SkillLevel[];
      unlocks: ['advanced_search_operators', 'api_integrations', 'automation_scripts'];
    };
    network: {
      levels: SkillLevel[];
      unlocks: ['packet_analysis', 'bgp_tracing', 'anomaly_detection'];
    };
    malware: {
      levels: SkillLevel[];
      unlocks: ['static_analysis', 'sandbox_access', 'ioc_extraction'];
    };
    social: {
      levels: SkillLevel[];
      unlocks: ['persona_building', 'social_mapping', 'pretexting_tactics'];
    };
    crypto: {
      levels: SkillLevel[];
      unlocks: ['wallet_clustering', 'mixer_detection', 'attribution'];
    };
  };
}
```

**Progressive Tool Unlocking**
- **Level 1-5**: Basic tools (crt.sh, WHOIS, basic nmap)
- **Level 6-10**: Intermediate tools (Shodan, Censys, advanced queries)
- **Level 11-15**: Advanced tools (Maltego transforms, custom scripts)
- **Level 16-20**: Expert tools (Commercial API access, AI assistance)

**Prestige System**
- Reach level 20 → Reset to level 1 with **prestige star**
- Keep achievements and unlocks
- Access prestige-only campaigns (extremely difficult)
- Prestige-only cosmetics and titles

**Database Schema:**
```sql
CREATE TABLE skill_progression (
  id SERIAL PRIMARY KEY,
  session_token TEXT NOT NULL,
  skill_tree TEXT NOT NULL,  -- 'osint', 'network', etc.
  skill_level INTEGER DEFAULT 0,
  xp_in_skill INTEGER DEFAULT 0,
  unlocked_abilities JSONB DEFAULT '[]',
  specialization_bonuses JSONB DEFAULT '{}'  -- {speed: 1.2, accuracy: 1.1}
);

CREATE TABLE prestige_records (
  id SERIAL PRIMARY KEY,
  session_token TEXT NOT NULL,
  prestige_level INTEGER DEFAULT 0,
  total_resets INTEGER DEFAULT 0,
  lifetime_xp BIGINT DEFAULT 0,
  prestige_unlocks JSONB DEFAULT '[]'
);
```

### 1.4 Dynamic Threat Intelligence Feed

#### Vision: Real-World Context for Campaigns

**Live Threat Integration**

```typescript
interface LiveThreatCampaign {
  triggerSource: 'rss_feed' | 'api_alert' | 'admin_created';
  realWorldContext: {
    cve?: string;           // CVE-2024-1234
    threatActor?: string;   // "LockBit", "Lazarus Group"
    attackVector?: string;  // "SQL Injection in Apache"
    newsLink?: string;      // Link to security news
  };
  generatedCampaign: {
    targetInfrastructure: string[];  // Simulated vulnerable systems
    indicatorsOfCompromise: string[]; // IOCs to discover
    investigationGoals: string[];
  };
  ephemeral: {
    expiresAt: Date;        // Available for 7 days
    limitedAttempts: number; // First 100 players only
  };
}
```

**Real-Time Event Campaigns:**
- Monitor **CISA KEV** feed → Generate urgent campaign for new CVE
- **Ransomware leak sites** → Investigate victim infrastructure
- **Threat actor TTPs** → Simulate their techniques in sandbox
- **Dark web marketplace takedowns** → Forensic analysis campaign

**Breaking News Mode:**
- Push notification: *"Breaking: New Apache Log4j vulnerability. Investigate now!"*
- Limited-time campaign (72 hours)
- Global leaderboard for fastest completion
- Extra XP and rare achievement

**Database Schema:**
```sql
CREATE TABLE live_threat_campaigns (
  id SERIAL PRIMARY KEY,
  threat_id TEXT UNIQUE NOT NULL,
  campaign_id TEXT NOT NULL,
  real_world_source TEXT NOT NULL,  -- 'cisa_kev', 'abuse_ch', 'news'
  threat_metadata JSONB NOT NULL,
  difficulty TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  max_attempts INTEGER,
  current_attempts INTEGER DEFAULT 0,
  is_breaking_news BOOLEAN DEFAULT FALSE
);
```

### 1.5 Hidden Layer: Secrets & Easter Eggs

#### Vision: Deeper ARG-style Meta-Game

**Multi-Layered Secret System**

1. **Surface Secrets** (10% of players find)
   - Console logs with hints
   - HTML comments with clues
   - Base64 encoded data in page source

2. **Medium Secrets** (3% of players find)
   - Steganography in campaign images
   - Hidden API endpoints (fuzzing required)
   - Network request patterns that spell messages

3. **Deep Secrets** (0.1% of players find)
   - Cross-campaign clue chains
   - Time-gated reveals (only accessible at specific dates/times)
   - Community collaboration required (no single player can solve)

**The Master Mystery**
- Overarching narrative hidden across all campaigns
- **Meta-achievement**: "The Truth" (requires 100+ hours and community collaboration)
- Unlocks: Secret campaign revealing the "true purpose" of Atropos platform

**Implementation:**
```sql
CREATE TABLE secret_discoveries (
  id SERIAL PRIMARY KEY,
  secret_id TEXT NOT NULL,
  secret_tier TEXT CHECK (tier IN ('surface', 'medium', 'deep', 'master')),
  discovered_by TEXT[],  -- Array of session tokens
  discovery_method TEXT,  -- How they found it
  first_discovered_at TIMESTAMP,
  global_discovery_count INTEGER DEFAULT 0,
  unlocks_campaign TEXT,  -- Hidden campaign unlocked
  required_for_master BOOLEAN DEFAULT FALSE
);

CREATE TABLE community_secrets (
  id SERIAL PRIMARY KEY,
  secret_id TEXT NOT NULL,
  requires_coordination BOOLEAN DEFAULT TRUE,
  contribution_tokens JSONB DEFAULT '{}',  -- {token: contribution_score}
  solution_threshold INTEGER NOT NULL,  -- Number of players needed
  is_solved BOOLEAN DEFAULT FALSE,
  reward JSONB NOT NULL
);
```

### 1.6 Investigation Report System

#### Vision: Professional Portfolio Building

**Structured Report Builder**

```typescript
interface InvestigationReport {
  metadata: {
    investigationId: string;
    campaignId: string;
    startedAt: Date;
    completedAt: Date;
    totalTimeSpent: number;
  };
  
  sections: {
    executiveSummary: string;
    scopeOfWork: string[];
    methodology: {
      toolsUsed: string[];
      techniques: string[];
      informationSources: string[];
    };
    findings: {
      critical: Finding[];
      high: Finding[];
      medium: Finding[];
      low: Finding[];
      informational: Finding[];
    };
    timeline: TimelineEvent[];
    evidenceArtifacts: Artifact[];
    indicatorsOfCompromise: IOC[];
    recommendations: string[];
    conclusion: string;
  };
  
  presentation: {
    format: 'pdf' | 'html' | 'markdown' | 'json';
    includeScreenshots: boolean;
    includeTimeline: boolean;
    includeGraphs: boolean;
  };
  
  quality: {
    completeness: number;    // 0-100
    professionalism: number; // 0-100
    technicalDepth: number;  // 0-100
    aiGeneratedScore: number; // How much was AI vs player
  };
}
```

**Features:**
- **Auto-Export to PDF/HTML**: Professional formatting
- **Portfolio Integration**: Link to personal profile
- **Peer Review**: Community can review and rate reports
- **Quality Scoring**: AI analyzes report quality (helps with learning)
- **Template Library**: Pre-built templates for different report types

**Use Cases:**
- **Job Applications**: "Here's my portfolio of 50 professional investigations"
- **Certifications**: High-quality reports earn verified badges
- **Community Showcase**: Top reports featured on platform
- **Resume Builder**: Auto-generate resume sections from achievements

### 1.7 Seasonal Content & Events

#### Vision: Always Something New

**Quarterly Seasons** (Inspired by Battle Pass)

```typescript
interface Season {
  id: string;
  name: string;  // "Season 1: Operation Ghost Protocol"
  startDate: Date;
  endDate: Date;  // 3 month duration
  
  content: {
    exclusiveCampaigns: string[];  // 5-7 new campaigns
    limitedAchievements: Achievement[];
    seasonalLeaderboards: Leaderboard[];
    communityGoals: CommunityGoal[];  // Platform-wide objectives
  };
  
  rewards: {
    freeTier: SeasonReward[];      // Everyone gets
    premiumTier: SeasonReward[];   // Paid subscription
  };
  
  theme: {
    narrativeArc: string;  // Overarching story
    visualTheme: string;   // UI customizations
    featuredThreatActor: string;  // APT group or ransomware gang
  };
}
```

**Weekly Events:**
- **Threat Hunter Tuesdays**: New dark web investigation every Tuesday
- **Speed Run Saturdays**: Weekly speed-run challenge with prizes
- **Community Fridays**: Collaborative investigation (entire platform works together)

**Annual Championships:**
- **Atropos CTF** (August): Live 48-hour competition
- **Top 100 Invitational** (December): Year-end championship for best players
- **Prizes**: Cash, swag, job offers from sponsors

**Database Schema:**
```sql
CREATE TABLE seasons (
  id SERIAL PRIMARY KEY,
  season_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  exclusive_campaigns JSONB DEFAULT '[]',
  theme_data JSONB NOT NULL,
  rewards_config JSONB NOT NULL
);

CREATE TABLE seasonal_progress (
  id SERIAL PRIMARY KEY,
  session_token TEXT NOT NULL,
  season_id TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  tier_reached INTEGER DEFAULT 0,
  rewards_claimed JSONB DEFAULT '[]',
  UNIQUE(session_token, season_id)
);
```

---

## 🛠️ PILLAR 2: Advanced Game Management

### 2.1 Content Management System

#### Vision: Empower Non-Technical Content Creators

**Visual Campaign Builder (No-Code)**

```typescript
interface VisualCampaignEditor {
  canvas: {
    nodes: CampaignNode[];  // Drag-and-drop nodes
    connections: NodeConnection[];
    layout: 'tree' | 'graph' | 'flowchart';
  };
  
  nodeTypes: {
    start: StartNode;
    investigation: InvestigationNode;  // Player must find something
    decision: DecisionNode;  // Branch based on choice
    challenge: ChallengeNode;  // Solve a puzzle/challenge
    revelation: RevelationNode;  // Story/clue reveal
    end: EndNode;  // Victory conditions
  };
  
  aiAssistant: {
    generateCampaign: (prompt: string) => Campaign;
    validateLogic: () => ValidationResult;
    suggestImprovements: () => Suggestion[];
    autoBalance: () => DifficultyReport;
  };
}
```

**Campaign Designer Features:**
- **Visual Flow Editor**: Drag-and-drop campaign building
- **Template Library**: Pre-built campaign structures
- **AI Co-Pilot**: "Create a BGP investigation campaign about..."
- **Playtesting Simulator**: Test campaigns before publishing
- **Difficulty Auto-Balancer**: AI adjusts difficulty based on player feedback
- **Version Control**: Track campaign changes, rollback if needed

**Clue & Collectibles Manager:**
```sql
CREATE TABLE content_library (
  id SERIAL PRIMARY KEY,
  item_type TEXT NOT NULL,  -- 'clue', 'artifact', 'mystical_card', 'achievement'
  item_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  tags JSONB DEFAULT '[]',
  usage_count INTEGER DEFAULT 0,  -- How many campaigns use this
  created_by TEXT,  -- Admin who created it
  is_community_created BOOLEAN DEFAULT FALSE,
  review_status TEXT DEFAULT 'draft',  -- 'draft', 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Community Content Submission:**
- Players can submit campaigns via visual editor
- Community voting system for quality
- Top-rated campaigns get featured
- Creators earn rewards (XP, badges, revenue share?)

### 2.2 Analytics & Intelligence Dashboard

#### Vision: Data-Driven Content Optimization

**Player Analytics Dashboard**

```typescript
interface AdminAnalytics {
  playerMetrics: {
    retention: {
      day1: number;   // % return after 1 day
      day7: number;   // % return after 7 days
      day30: number;  // % return after 30 days
    };
    engagement: {
      avgSessionDuration: number;
      avgCampaignsPerSession: number;
      peakActivityTimes: TimeRange[];
    };
    skill: {
      averageLevelByDay: number[];
      completionRatesByCampaign: Record<string, number>;
      mostFailedCampaigns: CampaignStat[];
    };
  };
  
  campaignMetrics: {
    [campaignId: string]: {
      totalAttempts: number;
      completionRate: number;
      avgCompletionTime: number;
      dropOffPoints: { nodeId: string; dropRate: number }[];
      playerFeedbackScore: number;
      difficultyRating: number;  // AI-calculated from player behavior
    };
  };
  
  economicMetrics: {
    conversionFunnel: {
      visitors: number;
      signups: number;
      activePlayers: number;
      paidSubscribers: number;
    };
    lifetime_value: number;
    churnRate: number;
    revenueByTier: Record<string, number>;
  };
}
```

**Real-Time Monitoring:**
- **Live Player Feed**: See what players are doing right now
- **Campaign Heatmap**: Which campaigns are hot/cold
- **Difficulty Alerts**: Auto-alert if campaign completion rate drops below threshold
- **Behavior Anomalies**: Detect cheating or exploits

**A/B Testing Framework:**
```sql
CREATE TABLE ab_experiments (
  id SERIAL PRIMARY KEY,
  experiment_name TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  variant_a JSONB NOT NULL,  -- Control
  variant_b JSONB NOT NULL,  -- Test
  assignment_rule TEXT NOT NULL,  -- 'random', 'level_based', 'skill_based'
  success_metric TEXT NOT NULL,  -- 'completion_rate', 'time_spent', 'engagement'
  sample_size INTEGER NOT NULL,
  status TEXT DEFAULT 'running',
  results JSONB,
  winner TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);
```

### 2.3 Content Pipeline Automation

#### Vision: AI-Powered Content Generation

**Auto-Campaign Generator**

```typescript
interface CampaignGenerator {
  input: {
    topic: string;  // "Supply chain attack"
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    skills: string[];  // ['osint', 'network']
    length: '15min' | '30min' | '60min' | '2hr';
    realWorldBased?: {
      incidentReport?: string;  // URL to real breach writeup
      threatActor?: string;
      cve?: string;
    };
  };
  
  generation: {
    model: 'gpt-4' | 'claude-opus-4' | 'gemini-2.0';
    systemPrompt: string;  // Detailed campaign design instructions
    iterations: number;    // Refine multiple times
  };
  
  output: {
    campaign: Campaign;
    targetData: TargetInfrastructure;  // Generated dummy data
    clues: Clue[];
    achievements: Achievement[];
    narrative: string;
    estimatedQuality: number;  // AI self-assessment
  };
  
  review: {
    autoValidate: boolean;    // Check for logic errors
    humanReview: boolean;     // Require admin approval
    playtestBot: boolean;     // Simulate player solving it
  };
}
```

**Features:**
- **AI-Generated Campaigns**: Admin provides topic, AI generates full campaign
- **Real-World Incident Mirroring**: Feed in breach report, AI creates training simulation
- **Procedural Target Generation**: Auto-generate dummy companies, IPs, personas
- **Quality Control Pipeline**: AI + Human review before publishing
- **Batch Generation**: Generate 10 variations of same campaign for replay value

**Implementation:**
```typescript
async function generateCampaign(params: CampaignGenerationParams) {
  // 1. LLM generates campaign structure
  const structure = await ai.generate({
    prompt: `Create a ${params.difficulty} cybersecurity investigation campaign about ${params.topic}...`,
    model: 'claude-opus-4'
  });
  
  // 2. Generate supporting assets
  const targets = generateTargetData(structure);
  const clues = generateClues(structure);
  const narrative = generateNarrative(structure);
  
  // 3. Validate logic
  const validation = await validateCampaignLogic(structure);
  if (!validation.valid) {
    throw new Error('Generated campaign has logic errors');
  }
  
  // 4. Run playtest simulation
  const playtestResult = await simulatePlayerSolving(structure);
  if (playtestResult.completion < 0.5) {
    throw new Error('Campaign too difficult or unsolvable');
  }
  
  // 5. Return for review
  return {
    campaign: structure,
    metadata: {
      generatedAt: new Date(),
      quality: playtestResult.quality,
      estimatedDifficulty: playtestResult.difficulty,
      needsHumanReview: true
    }
  };
}
```

### 2.4 User-Generated Content (UGC) Platform

#### Vision: Community-Powered Growth

**Campaign Marketplace**

```typescript
interface CommunityMarketplace {
  content: {
    campaigns: CommunityCampaign[];
    clues: CommunityClue[];
    tools: CommunityTool[];  // Custom OSINT tools/scripts
    reports: ReportTemplate[];
  };
  
  curation: {
    submissionReview: {
      automated: {
        contentFilter: boolean;  // Detect inappropriate content
        qualityCheck: boolean;   // Minimum complexity
        plagiarismDetection: boolean;
      };
      communityVoting: {
        minimumVotes: number;
        approvalThreshold: number;  // % upvotes
      };
      adminApproval: boolean;  // Final gate
    };
  };
  
  rewards: {
    creator: {
      xpBonus: number;
      badgeProgression: CreatorBadge[];
      revenueShare?: number;  // % of premium subscriptions from their content
    };
    players: {
      earlyTester: boolean;   // XP for testing unreleased campaigns
      curator: boolean;       // XP for reviewing submissions
    };
  };
}
```

**Monetization for Creators:**
- **Free Content**: Creators get recognition and XP
- **Premium Content** (Optional): Creators can charge for advanced campaigns
  - 70% to creator, 30% to platform
  - Must meet quality standards
- **Sponsorships**: Companies sponsor campaigns (e.g., "Cloudflare Security Challenge")

### 2.5 Automated Moderation & Safety

#### Vision: Scalable Community Management

**Multi-Layered Moderation**

```typescript
interface ModerationSystem {
  automated: {
    contentFilters: {
      profanityDetection: boolean;
      maliciousCodeDetection: boolean;
      phishingLinkDetection: boolean;
      hateSpeechDetection: boolean;
    };
    behaviorAnalysis: {
      cheatDetection: boolean;      // Impossible completion times
      botDetection: boolean;        // Non-human patterns
      abuseDetection: boolean;      // Harassing other players
    };
    aiModeration: {
      model: 'openai-moderation' | 'perspective-api';
      confidence threshold: number;
      autoActions: ModAction[];  // 'flag', 'warn', 'suspend'
    };
  };
  
  humanReview: {
    flaggedContentQueue: FlaggedItem[];
    moderatorDashboard: ModeratorTools;
    escalationPath: EscalationPolicy[];
  };
  
  playerProtection: {
    reportAbuse: boolean;
    blockUser: boolean;
    privateSessions: boolean;  // Opt out of community features
    ageVerification: boolean;  // For certain content
  };
}
```

**Database Schema:**
```sql
CREATE TABLE moderation_queue (
  id SERIAL PRIMARY KEY,
  item_type TEXT NOT NULL,  -- 'campaign', 'comment', 'report', 'user_behavior'
  item_id TEXT NOT NULL,
  flagged_by TEXT,  -- 'system' or session_token
  reason TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  auto_actions_taken JSONB DEFAULT '[]',
  requires_human_review BOOLEAN DEFAULT TRUE,
  reviewed_by TEXT,
  review_decision TEXT,  -- 'approved', 'rejected', 'ban_user'
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

CREATE TABLE user_reports (
  id SERIAL PRIMARY KEY,
  reporter_session TEXT NOT NULL,
  reported_session TEXT NOT NULL,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB,  -- Screenshots, chat logs, etc.
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 💼 PILLAR 3: Professional Business Platform

### 3.1 Client Services Portal

#### Vision: White-Glove Threat Intelligence Services

**Client Dashboard**

```typescript
interface ClientPortal {
  overview: {
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    activeMonitors: number;
    alertsPast24h: number;
    nextScheduledScan: Date;
  };
  
  assets: {
    domains: MonitoredDomain[];
    ipRanges: MonitoredIPRange[];
    personnel: MonitoredPerson[];  // Executives, key staff
    brands: MonitoredBrand[];      // Company name, products
    infrastructure: MonitoredInfra[];  // Cloud assets, APIs
  };
  
  alerts: {
    critical: Alert[];     // Credential leak, active attack
    high: Alert[];         // Dark web mention, infrastructure exposure
    medium: Alert[];       // Potential phishing, suspicious activity
    low: Alert[];          // General intel, monitoring updates
  };
  
  reports: {
    monthly: Report[];     // Executive summary
    incident: Report[];    // Incident response reports
    custom: Report[];      // Bespoke investigations
  };
  
  communication: {
    assignedAnalyst: Analyst;
    responseTime: SLA;
    contactMethods: ContactMethod[];
  };
}
```

**Service Tiers Database:**
```sql
CREATE TABLE client_organizations (
  id SERIAL PRIMARY KEY,
  client_id TEXT UNIQUE NOT NULL,
  organization_name TEXT NOT NULL,
  service_tier TEXT CHECK (tier IN ('small_business', 'mid_market', 'enterprise', 'government')),
  monthly_fee NUMERIC(10,2) NOT NULL,
  
  -- SLA Configuration
  sla_response_time INTEGER NOT NULL,  -- minutes
  sla_resolution_time INTEGER NOT NULL,  -- hours
  has_dedicated_analyst BOOLEAN DEFAULT FALSE,
  
  -- Monitored Assets
  monitored_assets JSONB NOT NULL,
  alert_preferences JSONB NOT NULL,
  
  -- Subscription
  subscription_status TEXT DEFAULT 'active',
  billing_cycle TEXT DEFAULT 'monthly',
  next_billing_date TIMESTAMP NOT NULL,
  
  -- Contact
  primary_contact_name TEXT NOT NULL,
  primary_contact_email TEXT NOT NULL,
  primary_contact_phone TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE client_assets (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES client_organizations(client_id),
  asset_type TEXT NOT NULL,  -- 'domain', 'ip_range', 'person', 'brand', 'api'
  asset_value TEXT NOT NULL,
  monitoring_enabled BOOLEAN DEFAULT TRUE,
  last_scanned TIMESTAMP,
  findings JSONB DEFAULT '[]',
  risk_score NUMERIC(5,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);
```

### 3.2 Automated Threat Monitoring

#### Vision: 24/7 Vigilance at Scale

**Continuous Monitoring Engine**

```typescript
interface MonitoringEngine {
  scanners: {
    credentialLeaks: {
      sources: ['haveibeenpwned', 'dehashed', 'intelx', 'custom_scraper'];
      frequency: 'hourly' | 'daily' | 'realtime';
      alertThreshold: 'any_match' | 'verified_only';
    };
    
    darkWebMonitoring: {
      forums: string[];  // Monitored forums
      keywords: string[];  // Client-specific keywords
      scanFrequency: 'hourly' | 'daily';
      contextAnalysis: boolean;  // AI determines relevance
    };
    
    infrastructureExposure: {
      tools: ['shodan', 'censys', 'binaryedge'];
      scanFrequency: 'daily' | 'weekly';
      checkFor: ['exposed_services', 'misconfigurations', 'cves'];
    };
    
    brandMonitoring: {
      socialMedia: ['twitter', 'reddit', 'linkedin'];
      newsFeeds: string[];  // RSS feeds
      pasteSites: ['pastebin', 'ghostbin', 'justpaste'];
      scanFrequency: 'realtime' | 'hourly';
    };
    
    domainMonitoring: {
      dns: boolean;           // Monitor DNS changes
      certificates: boolean;  // Certificate transparency
      subdomains: boolean;    // New subdomain enumeration
      typosquatting: boolean; // Similar domain registration
      scanFrequency: 'daily' | 'weekly';
    };
  };
  
  enrichment: {
    aiContextAnalysis: boolean;  // LLM determines threat relevance
    automaticPrioritization: boolean;
    falsePositiveReduction: boolean;
    correlationEngine: boolean;  // Link related findings
  };
  
  alerting: {
    channels: {
      email: boolean;
      sms: boolean;
      webhook: boolean;  // Integrate with client SIEM
      dashboard: boolean;
      phoneCall: boolean;  // Critical only
    };
    routing: {
      p0_critical: ContactMethod[];
      p1_high: ContactMethod[];
      p2_medium: ContactMethod[];
      p3_low: ContactMethod[];
    };
    escalation: {
      noResponseTime: number;  // Minutes before escalation
      escalationChain: Contact[];
    };
  };
}
```

**Alert Pipeline:**
```sql
CREATE TABLE threat_alerts (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES client_organizations(client_id),
  alert_id TEXT UNIQUE NOT NULL,
  
  -- Classification
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  category TEXT NOT NULL,  -- 'credential_leak', 'infrastructure', 'brand', etc.
  
  -- Finding Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,  -- Which scanner found this
  evidence JSONB NOT NULL,  -- Supporting data
  indicators JSONB DEFAULT '[]',  -- IOCs, domains, IPs
  
  -- Context
  ai_analysis TEXT,  -- LLM-generated threat assessment
  confidence_score NUMERIC(5,2) NOT NULL,  -- 0-100 confidence
  false_positive_likelihood NUMERIC(5,2),  -- 0-100
  
  -- Response
  status TEXT DEFAULT 'new',  -- 'new', 'investigating', 'resolved', 'false_positive'
  assigned_analyst TEXT,
  response_notes TEXT,
  remediation_steps JSONB DEFAULT '[]',
  
  -- SLA Tracking
  created_at TIMESTAMP DEFAULT NOW(),
  acknowledged_at TIMESTAMP,
  resolved_at TIMESTAMP,
  sla_breached BOOLEAN DEFAULT FALSE,
  
  -- Client Visibility
  visible_to_client BOOLEAN DEFAULT TRUE,
  client_notified BOOLEAN DEFAULT FALSE,
  client_notification_sent_at TIMESTAMP
);

CREATE TABLE alert_notifications (
  id SERIAL PRIMARY KEY,
  alert_id TEXT NOT NULL REFERENCES threat_alerts(alert_id),
  notification_method TEXT NOT NULL,  -- 'email', 'sms', 'webhook'
  recipient TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'sent',
  error_message TEXT
);
```

**Automation Workflows:**
```typescript
// Example: Credential Leak Detection
async function monitorCredentialLeaks(client: ClientOrganization) {
  const assets = await getMonitoredAssets(client.id, 'email_address');
  
  for (const asset of assets) {
    // Check multiple sources
    const leaks = await Promise.all([
      checkHIBP(asset.value),
      checkDeHashed(asset.value),
      checkIntelX(asset.value),
      scanPasteSites(asset.value)
    ]);
    
    const foundLeaks = leaks.flat().filter(l => l.isNew);
    
    if (foundLeaks.length > 0) {
      // AI analyzes severity
      const analysis = await analyzeThreatSeverity(foundLeaks, client);
      
      // Create alert
      const alert = await createAlert({
        client_id: client.id,
        severity: analysis.severity,
        category: 'credential_leak',
        title: `Credential leak detected for ${asset.value}`,
        description: analysis.description,
        evidence: foundLeaks,
        ai_analysis: analysis.assessment,
        confidence_score: analysis.confidence
      });
      
      // Notify based on severity
      await notifyClient(alert, client.alert_preferences);
      
      // Auto-remediation suggestions
      await generateRemediationPlan(alert);
    }
  }
}
```

### 3.3 Incident Response Service

#### Vision: Rapid Response Retainer

**IR Workflow Management**

```typescript
interface IncidentResponse {
  engagement: {
    triggeredBy: 'alert' | 'client_request' | 'proactive';
    incidentType: string;  // 'ransomware', 'breach', 'phishing', 'apt'
    severity: 'p0' | 'p1' | 'p2';
    sla: {
      responseTime: number;  // minutes
      onSiteRequired: boolean;
      afterHours: boolean;
    };
  };
  
  workflow: {
    phases: {
      detection: { timestamp: Date; findings: Finding[] };
      containment: { actions: Action[]; timestamp: Date };
      eradication: { actions: Action[]; timestamp: Date };
      recovery: { actions: Action[]; timestamp: Date };
      postMortem: { report: Report; lessons: Lesson[] };
    };
  };
  
  team: {
    leadAnalyst: Analyst;
    supportAnalysts: Analyst[];
    externalExperts?: Expert[];  // Bring in specialists if needed
  };
  
  communication: {
    clientUpdates: Update[];  // Regular status updates
    stakeholderBriefings: Briefing[];
    publicStatementsSupport: boolean;  // PR assistance
  };
}
```

**Database Schema:**
```sql
CREATE TABLE incident_cases (
  id SERIAL PRIMARY KEY,
  case_id TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL REFERENCES client_organizations(client_id),
  
  -- Incident Details
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('p0', 'p1', 'p2')),
  description TEXT NOT NULL,
  initial_indicators JSONB NOT NULL,
  
  -- Response
  status TEXT DEFAULT 'active',  -- 'active', 'contained', 'resolved', 'monitoring'
  assigned_team JSONB NOT NULL,  -- Array of analyst IDs
  response_timeline JSONB DEFAULT '[]',  -- Detailed action log
  
  -- SLA
  sla_response_time INTEGER NOT NULL,
  notified_at TIMESTAMP DEFAULT NOW(),
  acknowledged_at TIMESTAMP,
  contained_at TIMESTAMP,
  resolved_at TIMESTAMP,
  sla_met BOOLEAN,
  
  -- Deliverables
  incident_report_url TEXT,
  forensic_artifacts JSONB DEFAULT '[]',
  lessons_learned TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE incident_timeline (
  id SERIAL PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES incident_cases(case_id),
  event_type TEXT NOT NULL,  -- 'detection', 'action_taken', 'finding', 'communication'
  description TEXT NOT NULL,
  performed_by TEXT,
  evidence JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### 3.4 Big Game Bounty Hunting Infrastructure

#### Vision: Passive Intelligence Collection with Massive Upside

**Cross-Investigation Correlation Engine**

```typescript
interface BountyHuntingSystem {
  targetDatabase: {
    targets: BigGameTarget[];  // High-value targets ($1M+ bounties)
    indicators: {
      wallets: CryptoWallet[];
      infrastructure: Infrastructure[];
      handles: Alias[];
      ttps: TTP[];
    };
    sources: {
      fbi: FBIMostWanted[];
      secretService: SSMostWanted[];
      interpol: InterpolNotices[];
      treasury: OFACList[];
    };
  };
  
  passiveCollection: {
    crossReferences: {
      // Automatically check EVERY investigation for matches
      checkWallets: boolean;
      checkIPs: boolean;
      checkDomains: boolean;
      checkUsernames: boolean;
    };
    
    monitoring: {
      darkWebForums: string[];
      blockchainTransactions: string[];  // Monitored addresses
      infrastructureReuse: boolean;
      socialMediaAliases: string[];
    };
  };
  
  attribution: {
    confidenceScoring: {
      singleIndicatorMatch: 20;  // 20% confidence
      multipleIndicatorMatch: 60;  // 60% confidence
      behavioralMatch: 80;  // 80% confidence
      verifiedIdentity: 95;  // 95% confidence
    };
    
    evidenceChain: {
      automaticLogging: boolean;
      chainOfCustody: boolean;
      timestamping: boolean;
      witnessAccounts: boolean;
    };
  };
  
  coordination: {
    lawEnforcement: {
      tiplineSubmission: boolean;
      evidencePackaging: boolean;
      anonymousReporting: boolean;
      rewardClaiming: boolean;
    };
  };
}
```

**Database Schema:**
```sql
CREATE TABLE big_game_targets (
  id SERIAL PRIMARY KEY,
  target_id TEXT UNIQUE NOT NULL,
  real_name TEXT,
  aliases JSONB DEFAULT '[]',
  
  -- Indicators
  known_wallets JSONB DEFAULT '[]',
  known_infrastructure JSONB DEFAULT '[]',
  known_handles JSONB DEFAULT '[]',
  known_ttps JSONB DEFAULT '[]',
  
  -- Bounty Info
  bounty_amount NUMERIC(12,2),
  issuing_agency TEXT NOT NULL,
  bounty_program_url TEXT,
  
  -- Intelligence
  threat_actor_group TEXT,
  active_campaigns JSONB DEFAULT '[]',
  last_known_activity TIMESTAMP,
  
  -- Tracking
  sighting_count INTEGER DEFAULT 0,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  priority_tier TEXT DEFAULT 'monitoring',  -- 'monitoring', 'investigating', 'high_confidence'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE indicator_matches (
  id SERIAL PRIMARY KEY,
  target_id TEXT NOT NULL REFERENCES big_game_targets(target_id),
  indicator_type TEXT NOT NULL,  -- 'wallet', 'ip', 'domain', 'username'
  indicator_value TEXT NOT NULL,
  
  -- Source
  found_in_investigation TEXT,  -- Investigation ID where found
  found_by_session TEXT,  -- Player who found it
  discovery_method TEXT NOT NULL,
  
  -- Analysis
  confidence_score NUMERIC(5,2) NOT NULL,
  false_positive_likelihood NUMERIC(5,2),
  corroborating_evidence JSONB DEFAULT '[]',
  ai_analysis TEXT,
  
  -- Follow-up
  status TEXT DEFAULT 'new',  -- 'new', 'investigating', 'verified', 'false_positive', 'submitted'
  reviewed_by TEXT,
  review_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bounty_submissions (
  id SERIAL PRIMARY KEY,
  submission_id TEXT UNIQUE NOT NULL,
  target_id TEXT NOT NULL REFERENCES big_game_targets(target_id),
  
  -- Evidence Package
  evidence_summary TEXT NOT NULL,
  supporting_documents JSONB NOT NULL,
  chain_of_custody JSONB NOT NULL,
  confidence_assessment NUMERIC(5,2) NOT NULL,
  
  -- Submission
  submitted_to TEXT NOT NULL,  -- 'FBI', 'Secret Service', etc.
  submission_date TIMESTAMP NOT NULL,
  submission_method TEXT NOT NULL,
  reference_number TEXT,
  
  -- Outcome
  status TEXT DEFAULT 'pending',  -- 'pending', 'under_review', 'accepted', 'rejected', 'paid'
  reward_amount NUMERIC(12,2),
  paid_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Automated Matching System:**
```typescript
// Triggered on EVERY investigation action
async function checkBigGameMatches(
  investigationId: string,
  indicator: string,
  type: 'wallet' | 'ip' | 'domain' | 'username'
) {
  // Query big game database
  const matches = await db.bigGameTargets.findMatching(indicator, type);
  
  if (matches.length === 0) return;
  
  // We have a potential match!
  for (const target of matches) {
    // Calculate confidence
    const confidence = await calculateAttributionConfidence(target, indicator);
    
    // Log the match
    const match = await db.indicatorMatches.create({
      target_id: target.target_id,
      indicator_type: type,
      indicator_value: indicator,
      found_in_investigation: investigationId,
      confidence_score: confidence.score,
      ai_analysis: confidence.analysis
    });
    
    // High confidence? Alert senior analysts
    if (confidence.score > 70) {
      await notifyTeam('HIGH_CONFIDENCE_MATCH', {
        target: target.real_name || target.target_id,
        bounty: target.bounty_amount,
        confidence: confidence.score,
        indicator: indicator,
        matchId: match.id
      });
    }
    
    // Update target tracking
    await db.bigGameTargets.update(target.target_id, {
      sighting_count: target.sighting_count + 1,
      last_known_activity: new Date(),
      confidence_score: Math.max(target.confidence_score, confidence.score)
    });
  }
}
```

### 3.5 Revenue & Subscription Management

#### Vision: Seamless Billing & Tiering

**Subscription Platform Integration**

```typescript
interface SubscriptionSystem {
  tiers: {
    educational: {
      free: { features: string[]; limits: Limits };
      student: { price: number; features: string[] };
      professional: { price: number; features: string[]; mentorship: boolean };
      enterprise: { price: number; seats: number; custom: boolean };
    };
    
    clientServices: {
      smallBusiness: { price: number; assets: number; sla: number };
      midMarket: { price: number; assets: number; sla: number };
      enterprise: { price: number; assets: number; sla: number; dedicatedAnalyst: boolean };
      government: { price: number; custom: boolean };
    };
  };
  
  billing: {
    provider: 'stripe' | 'paddle';
    features: {
      subscriptions: boolean;
      usage-based: boolean;  // Pay per investigation hour
      overage: boolean;      // Charge for exceeding limits
      invoicing: boolean;    // For enterprise
    };
  };
  
  metrics: {
    mrr: number;              // Monthly Recurring Revenue
    arr: number;              // Annual Recurring Revenue
    churnRate: number;        // % cancellations
    ltv: number;              // Customer Lifetime Value
    cac: number;              // Customer Acquisition Cost
    conversionRate: number;   // Free → Paid
  };
}
```

**Database Schema:**
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  subscription_id TEXT UNIQUE NOT NULL,
  
  -- Customer
  session_token TEXT,  -- For educational
  client_id TEXT,      -- For business clients
  email TEXT NOT NULL,
  
  -- Plan
  plan_type TEXT NOT NULL,  -- 'educational' or 'client_service'
  tier TEXT NOT NULL,
  monthly_price NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  
  -- Status
  status TEXT DEFAULT 'active',  -- 'active', 'past_due', 'cancelled', 'trial'
  trial_end_date TIMESTAMP,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Payment
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  payment_method TEXT,
  
  -- Usage (for overages)
  usage_limits JSONB NOT NULL,
  current_usage JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_id TEXT UNIQUE NOT NULL,
  subscription_id TEXT NOT NULL REFERENCES subscriptions(subscription_id),
  
  -- Billing
  amount_due NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',  -- 'draft', 'open', 'paid', 'void', 'uncollectible'
  
  -- Line Items
  line_items JSONB NOT NULL,
  
  -- Dates
  invoice_date TIMESTAMP NOT NULL,
  due_date TIMESTAMP NOT NULL,
  paid_date TIMESTAMP,
  
  -- Payment
  stripe_invoice_id TEXT,
  payment_intent_id TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usage_tracking (
  id SERIAL PRIMARY KEY,
  subscription_id TEXT NOT NULL REFERENCES subscriptions(subscription_id),
  metric_type TEXT NOT NULL,  -- 'api_calls', 'investigation_hours', 'ai_tokens'
  metric_value NUMERIC(10,2) NOT NULL,
  billing_period_start TIMESTAMP NOT NULL,
  billing_period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.6 White-Label & Partnership Platform

#### Vision: Scale Through Partnerships

**Reseller Program**

```typescript
interface PartnershipProgram {
  partners: {
    types: {
      mssp: {  // Managed Security Service Provider
        whiteLabel: boolean;
        revenueShare: number;  // % of sales
        customBranding: boolean;
        dedicatedSupport: boolean;
      };
      
      consultant: {  // Security Consultants
        referralCommission: number;  // % per referral
        cobranding: boolean;
        accessToTools: boolean;
      };
      
      university: {  // Academic Institutions
      discountRate: number;  // % discount for students
        bulkLicensing: boolean;
        customCurriculum: boolean;
        researchCollaboration: boolean;
      };
    };
  };
  
  capabilities: {
    whiteLabel: {
      customDomain: boolean;
      customBranding: boolean;
      customReports: boolean;
      hidePlatformBranding: boolean;
    };
    
    apiAccess: {
      fullAPI: boolean;
      embeddedWidgets: boolean;
      webhooks: boolean;
      ssoIntegration: boolean;
    };
  };
}
```

**Database Schema:**
```sql
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  partner_id TEXT UNIQUE NOT NULL,
  organization_name TEXT NOT NULL,
  partner_type TEXT NOT NULL,  -- 'mssp', 'consultant', 'university', 'technology'
  
  -- Terms
  revenue_share_percentage NUMERIC(5,2),
  referral_commission_percentage NUMERIC(5,2),
  discount_rate NUMERIC(5,2),
  
  -- Capabilities
  white_label_enabled BOOLEAN DEFAULT FALSE,
  custom_domain TEXT,
  api_access_level TEXT DEFAULT 'basic',  -- 'basic', 'full', 'enterprise'
  
  -- Contact
  primary_contact TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active',
  contract_start_date TIMESTAMP NOT NULL,
  contract_end_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE partner_referrals (
  id SERIAL PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(partner_id),
  referred_client_id TEXT NOT NULL,
  
  -- Commission
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2),
  commission_status TEXT DEFAULT 'pending',  -- 'pending', 'paid', 'void'
  
  -- Tracking
  referral_date TIMESTAMP DEFAULT NOW(),
  conversion_date TIMESTAMP,
  first_payment_date TIMESTAMP
);
```

---

## 🚀 Implementation Roadmap

### Phase 1: Enhanced Gameplay (Months 1-3)

**Priority Features:**
1. ✅ Dynamic campaign branching (multi-path)
2. ✅ Competitive leaderboards (multiple dimensions)
3. ✅ Live threat feed integration
4. ✅ Advanced progression (skill trees)
5. ✅ Seasonal content system

**Technical Implementation:**
- Campaign branching logic engine
- Real-time leaderboard infrastructure
- RSS/API integration for threat feeds
- XP calculation refactoring for skill trees
- Season management admin panel

**Success Metrics:**
- 50% increase in replay rate
- 30% increase in session duration
- 20% increase in daily active users
- 4.5+ star average campaign rating

### Phase 2: Business Platform Foundation (Months 4-6)

**Priority Features:**
1. ✅ Client portal MVP (dashboard, alerts, reports)
2. ✅ Automated monitoring (credentials, dark web, infrastructure)
3. ✅ Alert pipeline (creation, enrichment, delivery)
4. ✅ Subscription management (Stripe integration)
5. ✅ Admin analytics dashboard

**Technical Implementation:**
- Client organization database schema
- Monitoring job queue (Bull/Agenda)
- Alert enrichment pipeline (AI analysis)
- Stripe subscription webhooks
- Real-time analytics with Metabase/Grafana

**Success Metrics:**
- Onboard 10 pilot clients
- 95%+ alert delivery success rate
- <5% false positive rate
- $10k+ MRR

### Phase 3: Content & Community (Months 7-9)

**Priority Features:**
1. ✅ Visual campaign designer (no-code)
2. ✅ AI campaign generator
3. ✅ Community marketplace
4. ✅ Multiplayer investigations (async)
5. ✅ Report builder & portfolio

**Technical Implementation:**
- React Flow campaign canvas
- LLM integration for campaign generation
- User-generated content moderation pipeline
- WebSocket infrastructure for multiplayer
- PDF report generation (Puppeteer)

**Success Metrics:**
- 50+ community campaigns published
- 20% of campaigns from community
- 30% of players engage with multiplayer
- 80%+ content approval rate

### Phase 4: Intelligence & Scale (Months 10-12)

**Priority Features:**
1. ✅ Big game bounty infrastructure
2. ✅ Advanced incident response workflows
3. ✅ White-label partnerships
4. ✅ Enterprise features (SSO, custom domains)
5. ✅ Annual championship event

**Technical Implementation:**
- Cross-investigation correlation engine
- Incident case management system
- Multi-tenancy architecture
- SAML/OAuth SSO integration
- Live competition infrastructure

**Success Metrics:**
- 1-2 big game leads identified
- 30+ client organizations
- 3-5 partnership deals
- 1,000+ active players
- $50k+ MRR

---

## 📊 Business Impact Projections

### Year 1 (Foundation)
- **Players**: 2,000 registered, 500 active monthly
- **Paying Students**: 100 @ $39/mo = $3,900/mo
- **Client Services**: 10 clients @ $1,500 avg = $15,000/mo
- **Revenue**: ~$225k ARR
- **Team**: 2 FT (founder + analyst), 3 contractors

### Year 2 (Growth)
- **Players**: 10,000 registered, 2,000 active monthly
- **Paying Students**: 500 @ $39/mo = $19,500/mo
- **Professional Tier**: 50 @ $99/mo = $4,950/mo
- **Client Services**: 30 clients @ $2,500 avg = $75,000/mo
- **Enterprise Training**: 5 deals @ $10k = $50k one-time
- **Revenue**: ~$1.2M ARR
- **Team**: 5 FT, 10 research fellows

### Year 3 (Scale)
- **Players**: 50,000 registered, 10,000 active monthly
- **Paying Students**: 2,000 @ $39/mo = $78,000/mo
- **Professional Tier**: 200 @ $99/mo = $19,800/mo
- **Client Services**: 60 clients @ $3,500 avg = $210,000/mo
- **Enterprise Training**: 15 deals @ $15k = $225k one-time
- **Big Game Bounty**: $0-5M (if lucky)
- **Revenue**: ~$3.7M ARR (or $8.7M with bounty hit)
- **Team**: 12 FT, 20 research fellows, 5 contractors

---

## 🎯 Key Success Factors

### 1. Quality Over Quantity
- **Don't**: Rush to add 100 mediocre campaigns
- **Do**: Perfect 20 amazing campaigns with deep replay value

### 2. Community is Everything
- **Don't**: Top-down content creation only
- **Do**: Empower players to create, curate, and share

### 3. Real-World Relevance
- **Don't**: Generic CTF challenges divorced from reality
- **Do**: Mirror actual incidents, use real threat intelligence

### 4. Business Sustainability
- **Don't**: Rely on unpredictable bounty hunting
- **Do**: Build steady client service revenue foundation

### 5. Ethical Boundaries
- **Don't**: Compromise integrity for revenue
- **Do**: Maintain clear ethical guidelines for all work

---

## 📋 Technical Architecture Decisions

### Database: PostgreSQL ✅
- **Why**: Already using Drizzle ORM, excellent JSON support, reliable
- **Scale**: Can handle millions of rows, proven at scale
- **Cost**: Self-hosted or managed (RDS, Supabase)

### Backend: Node.js + Express ✅
- **Why**: Already built, TypeScript throughout
- **Add**: Job queue (BullMQ) for background processing
- **Add**: Caching layer (Redis) for real-time features

### Frontend: React 18 + TypeScript ✅
- **Why**: Already built, modern hooks-based architecture
- **Add**: Zustand for complex state management (already partially integrated)
- **Add**: React Query for server state (already using TanStack Query)

### Real-Time: WebSockets
- **Technology**: Socket.io or Pusher
- **Use Cases**: Multiplayer, live leaderboards, alerts
- **Scale**: Can use Redis adapter for multi-server

### AI/LLM: OpenRouter ✅
- **Why**: Already integrated, multi-model support
- **Models**: Claude (reasoning), GPT-4 (generation), Llama (cost-effective)
- **Cost Control**: Rate limiting, caching, tier-based access

### Monitoring & Analytics:
- **Logs**: Sentry (errors), LogRocket (session replay)
- **Metrics**: Prometheus + Grafana
- **Analytics**: PostHog or Mixpanel (user behavior)
- **Business**: Metabase (admin dashboards)

### Job Processing:
- **Queue**: BullMQ (Redis-backed)
- **Scheduler**: Cron jobs for recurring scans
- **Workers**: Separate processes for heavy computation

---

## 🔒 Security & Compliance

### Data Protection
- **Encryption**: At-rest (database) and in-transit (TLS)
- **Secrets**: Separate secrets management (Vault, AWS Secrets Manager)
- **Access Control**: RBAC for different user types
- **Audit Logs**: Complete trail of all sensitive operations

### Client Data Handling
- **Segmentation**: Each client's data isolated
- **Retention**: Configurable data retention policies
- **Export**: GDPR-compliant data export
- **Deletion**: Right to be forgotten

### Threat Intel Ethics
- **No Vigilantism**: Never directly engage targets
- **Legal Compliance**: Work within legal frameworks
- **Law Enforcement Coordination**: Proper channels for submissions
- **Evidence Integrity**: Maintain chain of custody

---

## 💡 Competitive Advantages

1. **Educational + Professional Hybrid**: Unique combination
2. **AI-Powered Learning**: Adaptive, personalized
3. **Real-World Context**: Not theoretical exercises
4. **Community-Driven**: Player-created content
5. **Gamification Done Right**: Engaging without being gimmicky
6. **Ethical Mission**: Clear values and boundaries
7. **Big Game Upside**: Potential for massive one-time payoffs

---

## 🎓 Conclusion

This architectural vision transforms Atropos from a promising educational platform into a comprehensive cybersecurity ecosystem that:

1. **Engages Players** with dynamic, competitive, replayable gameplay
2. **Empowers Administrators** with AI-assisted content creation and deep analytics
3. **Serves Businesses** with professional-grade threat intelligence and monitoring
4. **Builds Community** through user-generated content and multiplayer features
5. **Creates Sustainability** through diversified revenue streams
6. **Maintains Ethics** through clear boundaries and mission alignment

**The vision is ambitious but achievable** through phased implementation, focusing on core value propositions first, then expanding capabilities systematically.

**Next Steps:**
1. Review and refine this vision with stakeholders
2. Prioritize features for Phase 1
3. Create detailed technical specifications for prioritized features
4. Begin implementation with small, iterative releases
5. Gather user feedback continuously
6. Iterate and improve

---

*"The best way to predict the future is to build it."* - Let's build Atropos into the premier cybersecurity training and intelligence platform.
