---
type: guide
status: canonical
created: 2026-02-07
modified: 2026-02-07
---

# Metadata Standards for Atropos Obsidian Vault

This document defines the canonical frontmatter structure and metadata standards for all notes in the Atropos education management vault.

## Core Principles

1. **Consistency**: All notes of the same type use identical frontmatter structure
2. **Simplicity**: Use only three hierarchical relationships (parent, sibling, child)
3. **Bidirectionality**: Metadata syncs between Obsidian ↔️ App
4. **Validation**: Frontmatter must be valid YAML and parseable by gray-matter
5. **Breadcrumbs**: Use Breadcrumbs plugin for hierarchical navigation

---

## Hierarchical Relationships (Breadcrumbs)

### Parent (Up)
**Definition**: What this note belongs to or is part of  
**Direction**: ⬆️ Upward in hierarchy  
**Examples**:
- Campaign → Learning Path (campaign's parent is the path it belongs to)
- Module → Track (module's parent is the track)
- Achievement → Achievement Category (achievement's parent is its category)

**Usage**:
```yaml
parent: [[Learning Path Name]]
# or multiple:
parent:
  - [[Parent 1]]
  - [[Parent 2]]
```

### Sibling (Same Level)
**Definition**: Notes at the same hierarchical level  
**Direction**: ↔️ Horizontal relationship  
**Examples**:
- Campaign → Campaign (both are intermediate-level investigations)
- Module → Module (both teach OSINT fundamentals)
- Tool → Tool (both are passive reconnaissance tools)

**Usage**:
```yaml
sibling: [[Sibling Note Name]]
# or multiple:
sibling:
  - [[Sibling 1]]
  - [[Sibling 2]]
```

### Child (Down)
**Definition**: What this note contains or leads to  
**Direction**: ⬇️ Downward in hierarchy  
**Examples**:
- Learning Path → Modules (path contains multiple modules)
- Track → Campaigns (track contains campaigns)
- Campaign → Steps (campaign contains investigation steps)

**Usage**:
```yaml
child: [[Child Note Name]]
# or multiple:
child:
  - [[Child 1]]
  - [[Child 2]]
```

---

## Frontmatter Structure by Note Type

### 1. Campaign Notes

**Location**: `Campaigns/`  
**Template**: `Templates/Campaign Template.md`

**Required Fields**:
```yaml
---
id: campaign_slug              # Unique identifier (lowercase, underscores)
name: Human Readable Name      # Display name
type: campaign                 # Always "campaign"
status: draft|active|archived  # Lifecycle status
created: YYYY-MM-DD           # Creation date
modified: YYYY-MM-DD          # Last modified date

# Campaign Properties
icon: "🎯"                    # Emoji icon
difficulty: beginner|intermediate|advanced|expert
estimatedTime: "30-45 min"   # Time estimate
tags:                        # Array of tags
  - OSINT
  - Investigation
color: amber|teal|purple|red # Theme color

# Hierarchical Relationships (ONLY these three)
parent: [[Learning Path]]    # Which track/path this belongs to
sibling:                     # Same-level campaigns
  - [[Related Campaign 1]]
  - [[Related Campaign 2]]
child:                       # Sub-steps or modules (if any)
  - [[Step 1]]
  - [[Step 2]]

# Learning Integration
learningObjectives:
  - goal: osint_investigation
    weight: 10
    description: "What this teaches"
skillsRequired:
  - Basic OSINT
skillsTaught:
  - New Skill 1
learningOutcomes:
  - Specific ability 1
industryContext: "Professional application"
realWorldExamples:
  - Incident 1
careerPaths:
  - Job Title 1

# Target Configuration
targetFields:
  - key: domain
    label: Domain
    type: domain
    required: true
    placeholder: example.com
dummyTargets:
  domain: example.com
---
```

**Optional Fields**:
- `steps`: Array of investigation steps
- `adaptivePrompts`: AI prompt variations
- `tools`: List of tools used
- `objectives`: Investigation objectives

### 2. Learning Path Notes

**Location**: `Learning-Paths/`  
**Template**: `Templates/Learning Path Template.md`

**Required Fields**:
```yaml
---
id: path_slug
name: Path Name
type: learning-path
status: active|draft|archived
created: YYYY-MM-DD
modified: YYYY-MM-DD

# Path Properties
category: Intelligence|Defense|Offense|Analysis
difficulty: beginner|intermediate|advanced|expert
estimatedHours: 40
tools:
  - Tool 1
  - Tool 2

# Career Mapping
targetRoles:
  - Job Role 1
  - Job Role 2
salaryRange: "$70k-120k"

# Hierarchical Relationships
parent: [[Curriculum]]       # Overall curriculum this belongs to
sibling:                     # Other learning paths at same level
  - [[Path 1]]
  - [[Path 2]]
child:                       # Modules/campaigns in this path
  - [[Module 1]]
  - [[Module 2]]
  - [[Campaign 1]]
  - [[Campaign 2]]
---
```

### 3. Achievement Notes

**Location**: `Achievements/`  
**Template**: `Templates/Achievement Template.md`

**Required Fields**:
```yaml
---
id: achievement_slug
name: Achievement Name
type: achievement
status: active|draft|archived
created: YYYY-MM-DD
modified: YYYY-MM-DD

# Achievement Properties
category: discovery|speed|mastery|social|special
rarity: common|rare|epic|legendary
icon: "🏆"
isHidden: false
sortOrder: 0

# Requirements
requirementType: stat|action|campaign|special
requirementCondition:
  stat: campaignsCompleted
  value: 1
  comparison: gte

# Rewards
xpReward: 100
currencyReward: 50
unlocks:
  - tool:advanced_scanner
  - campaign:expert_investigation

# Hierarchical Relationships
parent: [[Achievement Category]]  # Which category this belongs to
sibling:                         # Related achievements at same level
  - [[Related Achievement]]
child:                           # Sub-achievements or progressions
  - [[Next Tier Achievement]]
---
```

### 4. Tool Notes

**Location**: `Tools/`  
**Template**: Create with `Templates/Tool Template.md`

**Required Fields**:
```yaml
---
id: tool_slug
name: Tool Name
type: tool
status: active|deprecated
created: YYYY-MM-DD
modified: YYYY-MM-DD

# Tool Properties
category: OSINT|Network|Malware|Social
platform: Web|CLI|Desktop|API
requiresAuth: true|false
pricingModel: Free|Freemium|Paid

# Hierarchical Relationships
parent: [[Tool Category]]    # E.g., "OSINT Tools"
sibling:                     # Alternative tools with similar purpose
  - [[Alternative Tool]]
child:                       # Specific features or scripts
  - [[Advanced Feature]]
---
```

### 5. Module Notes

**Location**: `Curriculum/Modules/`

**Required Fields**:
```yaml
---
id: module_slug
name: Module Name
type: module
status: active
created: YYYY-MM-DD
modified: YYYY-MM-DD

# Module Properties
phase: foundation|application|mastery|expert
duration: 10-15 hours
deliverable: "Portfolio item description"

# Hierarchical Relationships
parent: [[Learning Path]]    # Which path this belongs to
sibling:                     # Other modules at same level
  - [[Parallel Module]]
child:                       # Campaigns in this module
  - [[Campaign 1]]
  - [[Campaign 2]]
---
```

---

## Hierarchical Structure Examples

### Example 1: OSINT Learning Path Hierarchy

```
Curriculum (root)
└── parent: null
    child: [OSINT Specialist Path]

OSINT Specialist Path
└── parent: [[Curriculum]]
    sibling: [Financial Investigator Path, Threat Intel Path]
    child: [Module 1.1 OSINT Fundamentals, Module 1.2 SOCMINT]

Module 1.1: OSINT Fundamentals
└── parent: [[OSINT Specialist Path]]
    sibling: [[Module 1.2 SOCMINT]]
    child: [Passive Recon Campaign, Basic OSINT Campaign]

Passive Recon Campaign
└── parent: [[Module 1.1 OSINT Fundamentals]]
    sibling: [[Basic OSINT Campaign]]
    child: [Step 1: DNS, Step 2: Certificates]
```

**Visualization in Excalibrain**:
```
                Curriculum
                    |
                    ↓
        ┌───────────┴───────────┬───────────┐
        ↓                       ↓           ↓
   OSINT Path          Financial Path  Threat Intel
        |                       |           |
        ↓                       ↓           ↓
   Module 1.1             Module 2.1    Module 3.1
        |
        ↓
┌───────┴────────┐
↓                ↓
Passive Recon  Basic OSINT
```

### Example 2: Achievement Category Hierarchy

```
Achievements (root)
└── child: [Discovery Category, Speed Category, Mastery Category]

Discovery Category
└── parent: [[Achievements]]
    sibling: [[Speed Category]], [[Mastery Category]]
    child: [First Steps, Hidden Hunter, Secret Keeper]

First Steps
└── parent: [[Discovery Category]]
    sibling: [[Hidden Hunter]]
    child: [[Advanced Explorer]] (next tier)

Advanced Explorer
└── parent: [[First Steps]] (progression)
    sibling: null
    child: [[Master Explorer]]
```

### Example 3: Campaign Progression

```
Beginner Track
└── child: [Passive Recon, Basic OSINT, Email Intel]

Passive Recon
└── parent: [[Beginner Track]]
    sibling: [[Basic OSINT]], [[Email Intel]] (same level)
    child: [[Active Recon]] (natural progression)

Active Recon
└── parent: [[Passive Recon]] (builds upon)
    sibling: [[Phishing Analysis]] (same level)
    child: [[Network Topology]] (leads to)
```

---

## Metadata Field Standards

### Universal Fields (All Note Types)

**Required**:
```yaml
id: string                   # Unique slug (lowercase, underscores)
name: string                 # Display name
type: campaign|learning-path|achievement|tool|module|guide
status: draft|active|archived|deprecated
created: YYYY-MM-DD         # ISO date
modified: YYYY-MM-DD        # ISO date (auto-updated)
```

**Required Relationships**:
```yaml
parent: string|string[]      # What this belongs to
sibling: string|string[]     # Same-level items
child: string|string[]       # What this contains
```

### Type-Specific Fields

**Campaigns**:
```yaml
icon: string                 # Emoji
difficulty: string           # beginner|intermediate|advanced|expert
estimatedTime: string        # Human-readable duration
tags: string[]               # Categories
color: string                # Theme color
learningObjectives: object[] # Learning integration
targetFields: object[]       # Investigation targets
dummyTargets: object         # Example targets
```

**Learning Paths**:
```yaml
category: string             # Intelligence|Defense|Offense|Analysis
difficulty: string           # Overall difficulty
estimatedHours: number       # Total time investment
tools: string[]              # Core tools taught
targetRoles: string[]        # Career outcomes
salaryRange: string          # Expected compensation
```

**Achievements**:
```yaml
category: string             # discovery|speed|mastery|social|special
rarity: string               # common|rare|epic|legendary
icon: string                 # Emoji
isHidden: boolean            # Hidden until unlocked
sortOrder: number            # Display order
requirementType: string      # stat|action|campaign|special
requirementCondition: object # Unlock conditions
xpReward: number            # XP awarded
currencyReward: number      # Credits awarded
unlocks: string[]           # What unlocking gives access to
```

**Tools**:
```yaml
category: string             # OSINT|Network|Malware|Social
platform: string             # Web|CLI|Desktop|API
requiresAuth: boolean        # Needs API key
pricingModel: string         # Free|Freemium|Paid
apiDocs: string             # Documentation URL
```

---

## Validation Rules

### Field Naming
- Use `camelCase` for field names
- Use `kebab-case` for IDs and slugs
- Use `YYYY-MM-DD` for dates
- Use lowercase for types and statuses

### Relationship Constraints
1. **Parent**: Must exist and be valid note link `[[Note Name]]`
2. **Sibling**: Optional, array of note links
3. **Child**: Optional, array of note links
4. **Circular**: Not allowed (A → B → C → A is invalid)
5. **Self-reference**: Not allowed (note cannot be its own parent/child)

### ID Standards
- Pattern: `[a-z0-9_]+`
- No spaces or special characters
- Must be unique across entire vault
- Must match filename slug

### Tag Standards
- Use existing tags from `tags.md`
- Create new tags sparingly
- Keep tag taxonomy flat (no nested tags in frontmatter)
- Maximum 8 tags per note

---

## Breadcrumbs Navigation

### In-Note Navigation
Breadcrumbs plugin automatically shows:
- **⬆️ Up**: Links to parent notes
- **↔️ Same**: Links to sibling notes
- **⬇️ Down**: Links to child notes

### Trail View
Shows path from root to current note:
```
Curriculum → OSINT Path → Module 1.1 → Passive Recon ← YOU ARE HERE
```

### Matrix View
Shows all relationships in grid format:
```
         | Parent | Sibling  | Child
---------|--------|----------|--------
Current  | Path   | Campaign | Steps
```

### Excalibrain View
Visual graph showing:
- Hierarchical relationships (parent-child)
- Lateral relationships (siblings)
- Backlinks and forward links
- Orphaned notes (no relationships)

---

## Frontmatter Maintenance

### Auto-Update Modified Date
Use Templater:
```yaml
modified: <% tp.date.now("YYYY-MM-DD") %>
```

### Generate ID from Filename
```yaml
id: "<% tp.file.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') %>"
```

### Validate on Save
Recommended Obsidian plugins:
- **Linter**: Auto-format frontmatter on save
- **Metadata Menu**: Visual frontmatter editor
- **Frontmatter Modified Date**: Auto-update modified field

---

## Sync Process

### Obsidian → App

**Campaigns**:
```bash
npm run sync:campaigns
# Reads: obsidian-vault/Campaigns/*.md
# Writes: client/src/config/obsidianCampaigns.ts
```

**Learning Paths**:
```bash
npm run sync:learning-paths
# Reads: obsidian-vault/Learning-Paths/*.md
# Writes: client/src/config/obsidianLearningPaths.ts
```

**Achievements**:
```bash
npm run sync:achievements
# Reads: obsidian-vault/Achievements/*.md
# Writes: server/seed/obsidianAchievements.ts
```

**All**:
```bash
npm run sync:from-obsidian
# Syncs all content types
```

### App → Obsidian

**Export Campaigns to Obsidian**:
```bash
npm run sync:campaigns:export
# Reads: client/src/config/agentCampaigns.ts
# Writes: obsidian-vault/Campaigns/*.md
```

**Export All**:
```bash
npm run sync:to-obsidian
# Exports all content to Obsidian
```

---

## Examples of Correct Frontmatter

### Example 1: Beginner Campaign

```yaml
---
id: passive_recon
name: Passive Reconnaissance
type: campaign
status: active
created: 2026-02-07
modified: 2026-02-07

icon: "👁️"
difficulty: beginner
estimatedTime: "20-30 min"
tags:
  - OSINT
  - Recon
  - DNS
color: purple

parent: [[OSINT Fundamentals Module]]
sibling:
  - [[Basic OSINT Campaign]]
  - [[Email Intelligence]]
child:
  - [[DNS Enumeration]]
  - [[Certificate Analysis]]

learningObjectives:
  - goal: osint_investigation
    weight: 10
    description: "Master passive reconnaissance"
skillsRequired:
  - Basic web browsing
  - Understanding of DNS
skillsTaught:
  - DNS enumeration
  - Certificate transparency
  - Historical data mining
learningOutcomes:
  - Extract DNS records without touching target
  - Mine certificate logs for subdomains
industryContext: "Bug bounty hunters start with passive recon"
realWorldExamples:
  - Bug bounty reconnaissance
  - Red team research
careerPaths:
  - Penetration Tester
  - Security Researcher
---
```

### Example 2: Learning Path

```yaml
---
id: osint_specialist_path
name: OSINT Specialist Path
type: learning-path
status: active
created: 2026-02-07
modified: 2026-02-07

category: Intelligence
difficulty: beginner
estimatedHours: 60
tools:
  - Maltego
  - Google Earth Pro
  - Sherlock
  - Tor Browser

targetRoles:
  - OSINT Analyst
  - Private Investigator
  - Due Diligence Specialist
salaryRange: "$75k-125k"

parent: [[Curriculum]]
sibling:
  - [[Financial Investigator Path]]
  - [[Threat Intel Path]]
child:
  - [[Module 1.1 - OSINT Fundamentals]]
  - [[Module 1.2 - SOCMINT]]
  - [[Module 1.3 - Geolocation]]
  - [[Module 1.4 - Dark Web]]
---
```

### Example 3: Achievement

```yaml
---
id: first_steps
name: First Steps
type: achievement
status: active
created: 2026-02-07
modified: 2026-02-07

category: discovery
rarity: common
icon: "🎯"
isHidden: false
sortOrder: 1

requirementType: stat
requirementCondition:
  stat: campaignsCompleted
  value: 1
  comparison: gte

xpReward: 100
currencyReward: 50
unlocks:
  - campaign:intermediate_investigations

parent: [[Discovery Achievements]]
sibling:
  - [[Hidden Hunter]]
  - [[Secret Keeper]]
child:
  - [[Journeyman Investigator]]
---
```

---

## Common Mistakes to Avoid

### ❌ Wrong: Using custom relationship fields
```yaml
prerequisite: [[Campaign]]
requires: [[Skill]]
unlocks: [[Content]]
related: [[Note]]
```

### ✅ Right: Using standard hierarchy
```yaml
parent: [[Campaign]]
sibling: [[Peer Campaign]]
child: [[Next Campaign]]
```

### ❌ Wrong: Inconsistent field names
```yaml
Learning_Objectives:  # Wrong case
learning-objectives:  # Wrong delimiter
LearningObjectives:   # Wrong case
```

### ✅ Right: camelCase for all fields
```yaml
learningObjectives:   # Correct
skillsRequired:       # Correct
targetFields:         # Correct
```

### ❌ Wrong: Multiple status values
```yaml
status: active, published  # Invalid YAML
```

### ✅ Right: Single status
```yaml
status: active  # Valid
```

### ❌ Wrong: Unquoted special characters
```yaml
icon: 🎯        # May break YAML
name: Don't Do This  # Single quote breaks YAML
```

### ✅ Right: Quoted strings with special chars
```yaml
icon: "🎯"      # Safe
name: "Don't Do This"  # Safe with double quotes
```

---

## Dataview Queries

### Find All Campaigns for a Learning Path
```dataview
TABLE difficulty, estimatedTime, tags
FROM "Campaigns"
WHERE parent = [[OSINT Specialist Path]]
SORT difficulty ASC
```

### Find Achievements by Rarity
```dataview
TABLE category, xpReward, requirementType
FROM "Achievements"
WHERE rarity = "legendary"
SORT sortOrder ASC
```

### Find Child Campaigns
```dataview
TABLE parent, difficulty
FROM "Campaigns"
WHERE contains(this.parent, [[Module 1.1 OSINT Fundamentals]])
```

### Find Orphaned Notes (Missing Relationships)
```dataview
TABLE type, status
FROM ""
WHERE !parent AND !child AND type != null
```

---

## Validation Checklist

Before syncing to app, verify:
- [ ] All required fields present
- [ ] ID matches filename slug
- [ ] Status is valid value
- [ ] Dates in YYYY-MM-DD format
- [ ] Relationships use [[Wiki Links]]
- [ ] Only parent/sibling/child used
- [ ] No circular references
- [ ] No self-references
- [ ] Tags exist in taxonomy
- [ ] Arrays properly formatted
- [ ] Strings with special chars quoted
- [ ] YAML is valid (no syntax errors)

---

## Metadata Editor Workflow

### Using Metadata Menu Plugin

1. **Install Metadata Menu** from Community Plugins
2. **Configure field types**:
   ```json
   {
     "difficulty": {
       "type": "Select",
       "options": ["beginner", "intermediate", "advanced", "expert"]
     },
     "status": {
       "type": "Select",
       "options": ["draft", "active", "archived"]
     },
     "rarity": {
       "type": "Select",
       "options": ["common", "rare", "epic", "legendary"]
     }
   }
   ```
3. **Edit metadata** visually in right sidebar
4. **Auto-validate** on save

### Using Templater

1. Create note from template (Ctrl/Cmd + P → "Templater: Create new note from template")
2. Templater auto-fills:
   - `id` from filename
   - `name` from title
   - `created` with today's date
   - `modified` with today's date
3. Fill in remaining fields
4. Save

---

## Sync Workflow Best Practices

### Daily Workflow

**1. Morning**: Start Obsidian
```bash
# Update vault from app (if others made changes)
cd atropos
npm run sync:to-obsidian
cd obsidian-vault
git pull
```

**2. Work**: Edit in Obsidian
- Create campaigns using Templater
- Edit learning paths
- Design achievements
- Use Excalibrain to visualize
- Use Breadcrumbs for navigation

**3. Evening**: Sync to app
```bash
# Export changes back to app
npm run sync:from-obsidian

# Test in app
npm run dev
# Visit http://localhost:5000/campaigns

# Commit if good
git add client/src/config/obsidian*.ts
git commit -m "content: update campaigns from Obsidian"
git push
```

### Weekly Review

- [ ] Check for orphaned notes (no parent/child)
- [ ] Validate all frontmatter with Linter
- [ ] Review in Excalibrain for broken relationships
- [ ] Update modified dates
- [ ] Sync bidirectionally
- [ ] Test in app

---

## Troubleshooting

### "Sync failed: Invalid YAML"
**Problem**: Frontmatter syntax error  
**Solution**: Use YAML validator, check quotes, indentation

### "Campaign not appearing in app"
**Problem**: Status is "draft" or frontmatter incomplete  
**Solution**: Set status to "active", verify all required fields

### "Breadcrumbs not showing relationships"
**Problem**: Wrong field names or invalid wiki links  
**Solution**: Use only parent/sibling/child, ensure [[links]] exist

### "Circular reference detected"
**Problem**: A → B → C → A loop  
**Solution**: Break the loop, establish clear hierarchy

### "Modified date not updating"
**Problem**: Templater not configured  
**Solution**: Enable Templater, set trigger on file save

---

## Version Control

### Git Integration

Recommended `.gitignore` for vault:
```
.obsidian/workspace*
.obsidian/workspace.json
.trash/
```

**Commit Strategy**:
- Commit after each major content session
- Use descriptive messages: `"content: add 3 new OSINT campaigns"`
- Push before syncing to app

**Branching**:
- Work in `vault-updates` branch
- Merge to main after sync + app testing
- Tag major content releases

---

## Best Practices Summary

1. ✅ **Use only parent/sibling/child** for relationships
2. ✅ **Keep frontmatter consistent** across note types
3. ✅ **Validate before syncing** to app
4. ✅ **Use Templater** for new notes
5. ✅ **Visualize in Excalibrain** to verify hierarchy
6. ✅ **Sync bidirectionally** (vault ↔️ app)
7. ✅ **Version control** vault with git
8. ✅ **Test in app** after sync
9. ✅ **Document changes** in commit messages
10. ✅ **Review weekly** for orphans and errors

---

**Maintained by**: Education Management Team  
**Last Updated**: 2026-02-07  
**Version**: 1.0  
**Status**: Canonical Reference
