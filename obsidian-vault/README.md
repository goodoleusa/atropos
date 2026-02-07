---
type: guide
status: canonical
created: 2026-02-07
modified: 2026-02-07
---

# Atropos Education Management Vault

This Obsidian vault is your **offline-first education management system** for Atropos cybersecurity training platform. 

**Purpose**: Design campaigns, manage learning paths, create achievements, and organize curriculum - all syncing bidirectionally with the live app.

## 🎯 Quick Start

### 1. Open in Obsidian

```bash
# Open this folder in Obsidian:
obsidian://open?path=/path/to/atropos/obsidian-vault
```

### 2. Install Required Plugins

**Core Plugins** (Install from Community Plugins):
- ✅ **Breadcrumbs** - Hierarchical navigation (parent/sibling/child)
- ✅ **Excalibrain** - Visual graph of relationships
- ✅ **Dataview** - Query and display metadata
- ✅ **Templater** - Template-based note creation
- ✅ **Obsidian Git** - Version control integration

**Recommended Plugins**:
- **Metadata Menu** - Visual frontmatter editor
- **Linter** - Auto-format on save
- **Kanban** - Project management boards
- **Periodic Notes** - Daily notes for tracking

### 3. Create Your First Campaign

1. Press `Ctrl/Cmd + P` → "Templater: Create new note from template"
2. Choose "Campaign Template"
3. Enter campaign name (e.g., "Social Media OSINT")
4. Templater auto-fills frontmatter
5. Fill in objectives, tools, teaching adaptations
6. Save
7. Run `npm run sync:campaigns` to export to app

## 📁 Vault Structure

```
obsidian-vault/
├── README.md                    # This file
├── METADATA_STANDARDS.md        # Canonical metadata guide
├── Curriculum/                  # Main curriculum documents
│   ├── Curriculum.md           # Root curriculum node
│   ├── Modules/                # Learning modules
│   └── Tracks/                 # Specialization tracks
├── Campaigns/                   # Investigation campaigns
│   ├── Beginner/
│   ├── Intermediate/
│   ├── Advanced/
│   └── Expert/
├── Learning-Paths/              # Career-focused learning paths
│   ├── OSINT Specialist.md
│   ├── Threat Intel Analyst.md
│   ├── Financial Investigator.md
│   └── Security Researcher.md
├── Achievements/                # Achievement definitions
│   ├── Discovery/
│   ├── Speed/
│   ├── Mastery/
│   ├── Social/
│   └── Special/
├── Tools/                       # Tool documentation
│   ├── OSINT/
│   ├── Network/
│   ├── Malware/
│   └── Social/
├── Guides/                      # How-to guides
│   ├── Campaign Building.md
│   ├── Teaching Strategies.md
│   └── Assessment Methods.md
├── Templates/                   # Templater templates
│   ├── Campaign Template.md
│   ├── Learning Path Template.md
│   ├── Achievement Template.md
│   ├── Tool Template.md
│   └── Daily Note Template.md
├── Scripts/                     # Templater user scripts
│   └── helpers.js
└── .obsidian/                   # Obsidian configuration
    ├── plugins/
    │   ├── breadcrumbs/data.json
    │   └── templater-obsidian/data.json
    └── app.json
```

## 🔄 Bidirectional Sync

### Obsidian → App (Your Edits)

**After editing campaigns in Obsidian**:
```bash
cd /path/to/atropos
npm run sync:campaigns
# Creates/updates: client/src/config/obsidianCampaigns.ts

npm run dev
# Test your campaigns in the live app
```

**After editing achievements**:
```bash
npm run sync:achievements
# Creates/updates: server/seed/obsidianAchievements.ts

# Then load into database (TODO: create loader)
```

**After editing learning paths**:
```bash
npm run sync:learning-paths
# Creates/updates: client/src/config/obsidianLearningPaths.ts
```

**Sync everything**:
```bash
npm run sync:from-obsidian
# Syncs all content types at once
```

### App → Obsidian (Import Existing)

**Export app campaigns to Obsidian**:
```bash
npm run sync:to-obsidian
# Reads: client/src/config/agentCampaigns.ts
# Writes: obsidian-vault/Campaigns/*.md

# Now edit in Obsidian!
```

## 🎨 Campaign Builder Workflow

### Step-by-Step Campaign Creation

**1. Create from Template**
```
Ctrl/Cmd + P → "Templater: Create new note from template"
→ Select "Campaign Template"
→ Enter name: "Social Media Investigation"
→ Save in Campaigns/ folder
```

**2. Fill Frontmatter**
```yaml
difficulty: intermediate
estimatedTime: "35-45 min"
tags:
  - SOCMINT
  - Social Media
  - Profile Analysis
color: teal

parent: [[SOCMINT Module]]
sibling:
  - [[Phishing Analysis]]
child:
  - [[LinkedIn OSINT]]
  - [[Twitter Investigation]]
```

**3. Define Learning Objectives**
```yaml
learningObjectives:
  - goal: socmint
    weight: 10
    description: "Master social media intelligence gathering"
  - goal: osint_investigation
    weight: 7
    description: "Apply OSINT to social platforms"
skillsRequired:
  - Basic OSINT
  - Understanding of social platforms
skillsTaught:
  - Profile correlation
  - Alias discovery
  - Relationship mapping
  - Timeline analysis
```

**4. Write Content**
- Overview
- Objectives (numbered list)
- Tools required
- Starter prompt for AI
- Teaching adaptations (all 5 learning styles)
- Investigation steps

**5. Visualize in Excalibrain**
- Open Excalibrain sidebar
- See your campaign in context
- Verify parent/child relationships
- Check for orphans

**6. Sync to App**
```bash
npm run sync:campaigns
```

**7. Test in App**
```bash
npm run dev
# Visit /campaigns
# Find your new campaign
# Play through it
```

**8. Iterate**
- Edit in Obsidian based on playtest feedback
- Re-sync
- Test again

## 🧠 Excalibrain Usage

### Visualizing Curriculum Hierarchy

**Open Excalibrain**: 
- Click Excalibrain icon in left sidebar
- Or: Ctrl/Cmd + P → "Excalibrain: Open"

**Navigation**:
- **Zoom**: Mouse wheel or pinch
- **Pan**: Click and drag background
- **Focus**: Click any node to center
- **Expand**: Click node to show children
- **Collapse**: Double-click to hide children

**Visual Indicators**:
- **Parent nodes**: Above current node
- **Sibling nodes**: Same level, to the sides
- **Child nodes**: Below current node
- **Unlinked**: Grayed out
- **Current**: Highlighted

### Use Cases

**1. Curriculum Design**:
- See entire learning path at a glance
- Identify gaps (missing children)
- Find orphans (no parent)
- Balance difficulty progression

**2. Campaign Dependencies**:
- Verify prerequisite chains
- Check difficulty progression
- Find parallel learning opportunities (siblings)

**3. Achievement Trees**:
- Map achievement progressions
- Visualize unlock chains
- Design achievement categories

## 📊 Dataview Queries for Management

### Campaign Dashboard
```dataview
TABLE 
  difficulty as Difficulty,
  estimatedTime as Time,
  status as Status,
  length(child) as "Sub-Steps"
FROM "Campaigns"
WHERE type = "campaign"
SORT difficulty ASC, name ASC
```

### Learning Path Overview
```dataview
TABLE
  category as Category,
  estimatedHours as Hours,
  targetRoles as Roles,
  length(child) as Modules
FROM "Learning-Paths"
WHERE type = "learning-path"
SORT difficulty ASC
```

### Achievement Statistics
```dataview
TABLE
  rarity as Rarity,
  xpReward as XP,
  currencyReward as Credits,
  category as Category
FROM "Achievements"
WHERE type = "achievement"
SORT rarity DESC, xpReward DESC
```

### Campaign Completion Tracker
Create in daily note:
```dataview
TASK
FROM "Campaigns"
WHERE status = "active" AND !completed
```

## 🎯 Campaign Building Best Practices

### 1. Start with Learning Objectives
**Before writing anything**, answer:
- What should students know after this?
- Which skills does this teach?
- What career role needs this?
- What real-world incident inspired this?

### 2. Use Hierarchical Structure
```
Learning Path (parent)
└── Module (parent)
    └── Campaign (parent)
        └── Steps (child, child, child)
```

### 3. Write for All 5 Learning Styles
Every campaign needs teaching adaptations:
- 🔧 Experiential: Hands-on first
- 📊 Visual: Diagrams and maps
- 🔬 Analytical: Theory and docs
- 👥 Social: Community resources
- ⚡ Pragmatic: Quick workflows

**Don't skip any!** Students have different needs.

### 4. Include Real-World Context
Every campaign should reference:
- Actual security incidents
- Professional use cases
- Industry-standard tools
- Career applications

**Example**:
```markdown
industryContext: "Threat intelligence teams use SOCMINT to profile threat actors before attribution. Law enforcement uses these techniques for cybercrime investigations."

realWorldExamples:
  - Bellingcat MH17 investigation (social media evidence)
  - FBI Capitol riot identification (social media analysis)
  - Lazarus Group attribution (social profiles)
```

### 5. Map to Career Outcomes
```yaml
careerPaths:
  - Threat Intelligence Analyst
  - OSINT Specialist
  - Social Media Analyst
  - Private Investigator
```

**Include salary ranges in learning path notes!**

### 6. Test Before Syncing
1. Visualize in Excalibrain (are relationships correct?)
2. Use Breadcrumbs trail (can you navigate?)
3. Run Dataview query (does it appear?)
4. Check frontmatter (valid YAML?)
5. Then sync to app

## 🔗 Relationship Guidelines

### Parent Assignment

**Campaigns**:
- Parent = Module or Learning Path
- Example: `parent: [[OSINT Fundamentals Module]]`

**Modules**:
- Parent = Learning Path or Track
- Example: `parent: [[OSINT Specialist Path]]`

**Learning Paths**:
- Parent = Curriculum (root)
- Example: `parent: [[Curriculum]]`

**Achievements**:
- Parent = Achievement Category
- Example: `parent: [[Discovery Achievements]]`

**Tools**:
- Parent = Tool Category
- Example: `parent: [[OSINT Tools]]`

### Sibling Assignment

**Same difficulty + similar purpose**:
```yaml
# Campaign siblings (both intermediate OSINT):
sibling:
  - [[Active Reconnaissance]]
  - [[Social Engineering Campaign]]
```

**Same module alternatives**:
```yaml
# Tool siblings (both subdomain finders):
sibling:
  - [[Subfinder]]
  - [[Amass]]
```

**Parallel learning paths**:
```yaml
# Path siblings (alternative career tracks):
sibling:
  - [[Financial Investigator Path]]
  - [[Threat Intel Analyst Path]]
```

### Child Assignment

**What this contains**:
```yaml
# Learning path children (modules in the path):
child:
  - [[Module 1: Fundamentals]]
  - [[Module 2: Application]]
  - [[Module 3: Mastery]]
```

**Natural progressions**:
```yaml
# Campaign children (what comes next):
child:
  - [[Advanced Passive Recon]]
  - [[Active Reconnaissance]]
```

**Achievement progressions**:
```yaml
# Achievement children (next tier):
child:
  - [[Master Investigator]]  # Higher tier
```

## 📝 Frontmatter Reference Card

### Minimal Valid Campaign
```yaml
---
id: campaign_slug
name: Campaign Name
type: campaign
status: active
created: 2026-02-07
modified: 2026-02-07
icon: "🎯"
difficulty: intermediate
estimatedTime: "30 min"
tags: [OSINT]
color: amber
parent: [[Module]]
sibling: []
child: []
---
```

### Minimal Valid Learning Path
```yaml
---
id: path_slug
name: Path Name
type: learning-path
status: active
created: 2026-02-07
modified: 2026-02-07
category: Intelligence
difficulty: beginner
estimatedHours: 40
tools: []
targetRoles: []
salaryRange: "$70k-120k"
parent: [[Curriculum]]
sibling: []
child: []
---
```

### Minimal Valid Achievement
```yaml
---
id: achievement_slug
name: Achievement Name
type: achievement
status: active
created: 2026-02-07
modified: 2026-02-07
category: discovery
rarity: common
icon: "🏆"
isHidden: false
sortOrder: 0
requirementType: stat
requirementCondition:
  stat: campaignsCompleted
  value: 1
  comparison: gte
xpReward: 100
currencyReward: 50
unlocks: []
parent: [[Category]]
sibling: []
child: []
---
```

## 🚀 Offline Campaign Building

### Full Offline Workflow

**1. Disconnect from Internet** (optional)
- Obsidian works 100% offline
- Edit campaigns, paths, achievements
- Use Excalibrain and Breadcrumbs
- Version control with Git

**2. Create Content**
- Use Templater for new notes
- Follow METADATA_STANDARDS.md
- Use parent/sibling/child only
- Visualize in Excalibrain

**3. When Ready to Deploy**
- Reconnect to internet
- Sync vault: `npm run sync:from-obsidian`
- Test in app: `npm run dev`
- Commit and push

**Benefits**:
- Work on plane, train, anywhere
- No distractions
- Fast editing (no API calls)
- Full creative control
- Sync when ready

## 🎨 Visual Design with Excalibrain

### Creating Campaign Hierarchy

**Goal**: Design a complete SOCMINT learning module

**1. Create Parent (Module)**
```
File: Curriculum/Modules/SOCMINT Module.md
Frontmatter:
  parent: [[OSINT Specialist Path]]
  child: [campaigns listed below]
```

**2. Create Children (Campaigns)**
```
File: Campaigns/LinkedIn OSINT.md
Frontmatter:
  parent: [[SOCMINT Module]]
  sibling: [[Twitter Intel]], [[Facebook Investigation]]
  
File: Campaigns/Twitter Intel.md
Frontmatter:
  parent: [[SOCMINT Module]]
  sibling: [[LinkedIn OSINT]], [[Facebook Investigation]]

File: Campaigns/Facebook Investigation.md
Frontmatter:
  parent: [[SOCMINT Module]]
  sibling: [[LinkedIn OSINT]], [[Twitter Intel]]
```

**3. Open in Excalibrain**
You'll see:
```
        OSINT Specialist Path
                |
                ↓
          SOCMINT Module
                |
        ┌───────┼───────┐
        ↓       ↓       ↓
    LinkedIn Twitter Facebook
     (sibling relationships shown)
```

**4. Verify Relationships**
- Can you navigate up to module?
- Can you see all sibling campaigns?
- Does it make logical sense?

**5. Export**
```bash
npm run sync:campaigns
```

## 📊 Using Dataview for Management

### Campaign Status Board

Create: `Guides/Campaign Dashboard.md`
```markdown
# Campaign Management Dashboard

## Draft Campaigns (Work in Progress)
```dataview
LIST
FROM "Campaigns"
WHERE status = "draft"
SORT modified DESC
```

## Active Campaigns (Ready for Students)
```dataview
TABLE difficulty, estimatedTime, tags
FROM "Campaigns"
WHERE status = "active"
SORT difficulty ASC, name ASC
```

## Orphaned Campaigns (No Parent!)
```dataview
LIST
FROM "Campaigns"
WHERE !parent OR parent = ""
```
```

### Learning Path Progress

Create: `Guides/Path Progress.md`
```markdown
# Learning Path Progress

## Paths by Completion
```dataview
TABLE
  length(child) as "Total Campaigns",
  length(filter(child, (c) => contains(c, "✅"))) as "Complete",
  estimatedHours as "Est. Hours"
FROM "Learning-Paths"
SORT estimatedHours ASC
```
```

### Achievement Analytics

Create: `Guides/Achievement Stats.md`
```markdown
# Achievement Statistics

## By Rarity
```dataview
TABLE 
  length(rows) as Count,
  sum(rows.xpReward) as "Total XP",
  sum(rows.currencyReward) as "Total Credits"
FROM "Achievements"
GROUP BY rarity
SORT rarity DESC
```

## By Category
```dataview
TABLE
  length(rows) as Count,
  avg(rows.xpReward) as "Avg XP"
FROM "Achievements"
GROUP BY category
```
```

## 🛠️ Advanced: Custom Templater Scripts

### Auto-Generate Campaign Steps

Create: `Scripts/campaignHelpers.js`
```javascript
function generateSteps(count) {
  let steps = '';
  for (let i = 1; i <= count; i++) {
    steps += `
### Step ${i}: 
**Goal**: 

**Tools**: 

**Questions**:
- 

**Success Indicators**:
- 

**Red Flags**:
- 

`;
  }
  return steps;
}

module.exports = generateSteps;
```

**Usage in template**:
```markdown
## Investigation Steps
<%* tp.user.generateSteps(5) %>
```

### Auto-Link Related Campaigns

Create: `Scripts/linkRelated.js`
```javascript
async function findRelatedCampaigns(currentTags) {
  // Find campaigns with overlapping tags
  const dv = this.app.plugins.plugins.dataview.api;
  const campaigns = dv.pages('"Campaigns"')
    .where(c => c.tags && c.tags.some(t => currentTags.includes(t)))
    .where(c => c.file.path !== tp.file.path);
  
  return campaigns
    .array()
    .slice(0, 5)
    .map(c => `- [[${c.file.name}]]`)
    .join('\n');
}

module.exports = findRelatedCampaigns;
```

## 🎓 Curriculum Management

### Adding a New Learning Path

**1. Create the Path Note**
```bash
Use: Templates/Learning Path Template.md
Name: "Incident Response Path"
Parent: [[Curriculum]]
Sibling: [Other career paths]
```

**2. Create Modules for the Path**
```
Module 1: Foundation
  parent: [[Incident Response Path]]
  child: [Campaign 1, Campaign 2]

Module 2: Application
  parent: [[Incident Response Path]]
  sibling: [[Module 1]]
  child: [Campaign 3, Campaign 4]
```

**3. Assign Existing or Create Campaigns**
```
Each campaign:
  parent: [[Module X]]
  sibling: [Other campaigns in module]
```

**4. Visualize in Excalibrain**
- Open path note
- See full hierarchy
- Check for gaps

**5. Sync**
```bash
npm run sync:learning-paths
npm run sync:campaigns
```

### Reorganizing Curriculum

**Moving a Campaign to Different Module**:
1. Open campaign in Obsidian
2. Change `parent: [[Old Module]]` to `parent: [[New Module]]`
3. Update siblings if needed
4. Sync: `npm run sync:campaigns`

**Excalibrain updates automatically!**

## 🔍 Finding Content

### By Relationship
```dataview
# Find all children of a path
LIST FROM "Campaigns"
WHERE contains(parent, [[OSINT Specialist Path]])
```

### By Property
```dataview
# Find all legendary achievements
TABLE xpReward, category
FROM "Achievements"
WHERE rarity = "legendary"
```

### By Tag
```dataview
# Find all SOCMINT content
TABLE type, difficulty
FROM #SOCMINT
```

### Orphans (Quality Control)
```dataview
# Find notes with no relationships
LIST
FROM ""
WHERE type != null AND !parent AND !child
```

## 💾 Version Control with Obsidian Git

### Setup

1. Install "Obsidian Git" plugin
2. Configure:
   ```json
   {
     "commitMessage": "vault: {{date}} update",
     "autoSaveInterval": 10,
     "autoPullInterval": 5,
     "dateFormat": "YYYY-MM-DD HH:mm",
     "commitDateFormat": "YYYY-MM-DD HH:mm:ss"
   }
   ```
3. Commits happen automatically every 10 minutes

### Manual Commits

```
Ctrl/Cmd + P → "Obsidian Git: Commit all changes"
→ Enter message: "content: add 3 SOCMINT campaigns"
→ Push
```

### Pull Before Editing

```
Ctrl/Cmd + P → "Obsidian Git: Pull"
```

## 📋 Content Checklist

Before syncing to app, verify:

### Campaign Checklist
- [ ] All required frontmatter fields present
- [ ] ID matches filename slug
- [ ] Parent assigned (module or path)
- [ ] Siblings identified (related campaigns)
- [ ] All 5 teaching adaptations written
- [ ] Learning objectives mapped to curriculum goals
- [ ] Real-world examples included
- [ ] Career paths specified
- [ ] Tools documented
- [ ] Starter prompt clear and actionable
- [ ] No YAML syntax errors

### Learning Path Checklist
- [ ] Modules identified as children
- [ ] Parent is Curriculum
- [ ] Siblings are other career paths
- [ ] Career outcomes documented
- [ ] Salary ranges realistic
- [ ] Tools list complete
- [ ] All phases defined
- [ ] Portfolio requirements clear

### Achievement Checklist
- [ ] Requirement clearly defined
- [ ] Rewards appropriate for difficulty
- [ ] Rarity matches difficulty
- [ ] Parent category assigned
- [ ] Unlock conditions testable
- [ ] Description clear
- [ ] Icon meaningful

## 🎉 Tips for Effective Vault Management

1. **Daily Practice**: Open vault daily, even briefly
2. **Use Templates**: Never start from blank note
3. **Visualize Often**: Check Excalibrain weekly
4. **Query Everything**: Use Dataview to find patterns
5. **Commit Frequently**: Version control is your friend
6. **Sync Regularly**: Don't let vault drift from app
7. **Document Decisions**: Use daily notes
8. **Review Orphans**: Fix unlinked notes weekly
9. **Standard Metadata**: Follow METADATA_STANDARDS.md strictly
10. **Test in App**: Always verify campaigns work after sync

---

## 📚 Documentation References

- **METADATA_STANDARDS.md** - Canonical frontmatter guide (READ FIRST!)
- **Templates/** - All Templater templates
- **Guides/** - How-to guides for common tasks
- **../docs/CURRICULUM.md** - App curriculum (sync source)
- **../docs/CAMPAIGN_LEARNING_TEMPLATE.md** - Campaign design guide

---

## 🆘 Getting Help

### Frontmatter Errors
→ Check METADATA_STANDARDS.md
→ Validate YAML with online validator
→ Use Metadata Menu plugin for visual editing

### Relationship Confusion
→ Draw hierarchy on paper first
→ Use only parent/sibling/child
→ Visualize in Excalibrain

### Sync Issues
→ Check console output for errors
→ Verify frontmatter is valid
→ Ensure status is "active" not "draft"

### Plugin Issues
→ Check Community Plugins are installed
→ Enable in Settings → Community Plugins
→ Restart Obsidian

---

**Vault Purpose**: Offline-first education management for Atropos  
**Sync System**: Bidirectional with live app  
**Relationship Model**: Hierarchical (parent/sibling/child only)  
**Status**: Production Ready  
**Last Updated**: 2026-02-07
