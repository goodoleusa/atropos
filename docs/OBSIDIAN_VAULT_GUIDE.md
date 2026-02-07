---
title: Obsidian Vault for Education Management
date: 2026-02-07
version: 1.0
---

# Obsidian Vault for Atropos Education Management

Complete guide to using the Obsidian vault for offline-first campaign building and curriculum management with bidirectional sync.

## 🎯 Overview

### What is This?

An **Obsidian-based education management system** for Atropos that lets you:

✅ **Build campaigns offline** with full Markdown support and templates  
✅ **Visualize curriculum** with Excalibrain graph view  
✅ **Navigate hierarchically** with Breadcrumbs (parent/sibling/child)  
✅ **Query metadata** with Dataview  
✅ **Version control** with Obsidian Git  
✅ **Sync bidirectionally** with live Atropos app  
✅ **Work anywhere** - no internet required for editing  

### Why Obsidian?

**vs. Web-Based Editor**:
- ⚡ Faster editing (native app)
- 🔌 Offline capability
- 📊 Visual relationship graphs (Excalibrain)
- 🔍 Powerful search and queries (Dataview)
- 📝 Rich Markdown support
- 🔄 Git version control
- 🎨 Customizable workspace

**vs. Code Editor**:
- 🧠 Visual knowledge graph
- 🔗 Automatic backlinks
- 📋 Hierarchical navigation (Breadcrumbs)
- 🎯 Metadata management (Metadata Menu)
- 📊 Live queries (Dataview)
- 🎨 WYSIWYG preview

## 🚀 Quick Setup (5 Minutes)

### 1. Initialize Vault

```bash
cd /path/to/atropos
./script/init-obsidian-vault.sh
```

This creates:
- Vault folder structure
- Templates (Campaign, Learning Path, Achievement, Tool)
- Config files for plugins
- Exports existing campaigns from app
- Initializes git repository

### 2. Open in Obsidian

**macOS**:
```bash
open -a Obsidian "$(pwd)/obsidian-vault"
```

**Linux**:
```bash
obsidian "$(pwd)/obsidian-vault"
```

**Windows**:
```bash
start obsidian://open?path=%cd%\obsidian-vault
```

**Or**: Obsidian → Open folder → Select `obsidian-vault/`

### 3. Install Plugins

**Settings → Community Plugins → Browse**

**Required**:
- ✅ **Breadcrumbs** - Hierarchical navigation
- ✅ **Excalibrain** - Visual graph
- ✅ **Dataview** - Metadata queries
- ✅ **Templater** - Template system

**Recommended**:
- **Obsidian Git** - Auto version control
- **Metadata Menu** - Visual frontmatter editor
- **Linter** - Auto-format on save
- **Kanban** - Project boards

**Enable all** in Settings → Community Plugins → Installed

### 4. Configure Templater

Settings → Templater:
- ✅ Templates folder: `Templates`
- ✅ Trigger on file creation: ON
- ✅ Auto jump to cursor: ON
- ✅ Enable folder templates: ON

Folder templates:
- `Campaigns/` → `Templates/Campaign Template.md`
- `Learning-Paths/` → `Templates/Learning Path Template.md`
- `Achievements/` → `Templates/Achievement Template.md`

### 5. Test: Create Your First Campaign

1. **Create**: `Ctrl/Cmd + P` → "Templater: Create new note from template"
2. **Select**: "Campaign Template"
3. **Name**: "Test Campaign"
4. **Verify**: Frontmatter auto-filled with ID, dates, etc.
5. **Edit**: Fill in objectives and tools
6. **Visualize**: Open Excalibrain (see "Test Campaign" node)
7. **Sync**: Run `npm run sync:campaigns` in terminal
8. **Test**: Run `npm run dev`, visit `/campaigns`

**Success**: Your campaign appears in app! 🎉

---

## 📁 Vault Structure Explained

```
obsidian-vault/
├── README.md                    # Vault overview
├── METADATA_STANDARDS.md        # Frontmatter rules (READ THIS!)
├── MOC - Education Management.md # Map of Content (start here)
├── tags.md                      # Tag taxonomy
│
├── Curriculum/                  # Main curriculum structure
│   ├── Curriculum.md           # Root (parent: null)
│   ├── Modules/                # Learning modules
│   │   └── OSINT Fundamentals Module.md
│   └── Tracks/                 # Specialization tracks
│       └── OSINT Track.md
│
├── Learning-Paths/              # Career-focused paths
│   ├── OSINT Specialist Path.md     # (parent: Curriculum)
│   ├── Financial Investigator Path.md
│   ├── Threat Intel Analyst Path.md
│   └── Security Researcher Path.md
│
├── Campaigns/                   # Investigation campaigns
│   ├── Beginner/               # (parent: Module, sibling: other campaigns)
│   ├── Intermediate/
│   ├── Advanced/
│   └── Expert/
│
├── Achievements/                # Achievement definitions
│   ├── Discovery/              # (parent: Category)
│   ├── Speed/
│   ├── Mastery/
│   ├── Social/
│   └── Special/
│
├── Tools/                       # Tool documentation
│   ├── OSINT/
│   ├── Network/
│   ├── Malware/
│   └── Social/
│
├── Guides/                      # How-to guides
│   ├── Campaign Builder Guide.md
│   ├── Teaching Strategies.md
│   └── Assessment Methods.md
│
├── Templates/                   # Templater templates
│   ├── Campaign Template.md
│   ├── Learning Path Template.md
│   ├── Achievement Template.md
│   ├── Tool Template.md
│   └── Daily Note Template.md
│
└── Scripts/                     # Templater user scripts
    └── helpers.js              # Custom Templater functions
```

---

## 🔄 Bidirectional Sync Workflow

### Obsidian → App (Export Your Edits)

**Sync Single Type**:
```bash
# After editing campaigns
npm run sync:campaigns

# After editing learning paths
npm run sync:learning-paths

# After editing achievements
npm run sync:achievements
```

**Sync Everything**:
```bash
npm run sync:from-obsidian
```

**Output**:
- Campaigns → `client/src/config/obsidianCampaigns.ts`
- Learning Paths → `client/src/config/obsidianLearningPaths.ts`
- Achievements → `server/seed/obsidianAchievements.ts`

**Integration**:
```typescript
// In client/src/config/agentCampaigns.ts
import { OBSIDIAN_CAMPAIGNS } from './obsidianCampaigns';

// Merge with existing campaigns
export const AGENT_CAMPAIGNS = [
  ...EXISTING_CAMPAIGNS,
  ...OBSIDIAN_CAMPAIGNS
];
```

### App → Obsidian (Import from App)

**Export App Content to Vault**:
```bash
npm run sync:to-obsidian
```

**Reads**:
- `client/src/config/agentCampaigns.ts`

**Writes**:
- `obsidian-vault/Campaigns/*.md` (one file per campaign)

**Use Case**: Initial setup or importing someone else's campaigns

---

## 🎨 Campaign Building Workflow

### 1. Planning Phase (In Excalibrain)

**Open**: Excalibrain sidebar
**View**: Current curriculum structure
**Identify Gap**: "We need a Twitter OSINT campaign"
**Check Hierarchy**: 
```
OSINT Specialist Path
└── SOCMINT Module
    ├── LinkedIn OSINT ← exists
    ├── ??? ← gap here!
    └── Facebook Intel ← exists
```

**Decision**: Create "Twitter Intelligence" campaign as sibling

### 2. Creation Phase (With Templater)

**Create Note**:
```
Ctrl/Cmd + P → "Templater: Create new note from template"
Template: Campaign Template
Name: Twitter Intelligence  
Location: Campaigns/Intermediate/
```

**Auto-Generated**:
```yaml
id: twitter_intelligence
created: 2026-02-07
modified: 2026-02-07
# ... etc
```

### 3. Definition Phase (Fill Frontmatter)

```yaml
difficulty: intermediate
estimatedTime: "35-45 min"
tags:
  - SOCMINT
  - Twitter
  - Social Media
color: teal

parent: [[SOCMINT Module]]
sibling:
  - [[LinkedIn OSINT]]
  - [[Facebook Investigation]]
child: []
```

**Verify in Breadcrumbs**: Trail shows: Curriculum → Path → Module → Campaign

### 4. Content Phase (Write Investigation)

**Fill sections**:
- Overview
- Objectives (what to find)
- Tools (what to use)
- Starter prompt (for AI)
- Teaching adaptations (ALL 5 styles!)
- Investigation steps

**Reference other notes**:
- Link to tools: `[[Twint]]`, `[[Twitter Advanced Search]]`
- Link to techniques: `[[Username Enumeration]]`
- Link to related campaigns: `[[Social Media Correlation]]`

### 5. Learning Phase (Add Education Metadata)

```yaml
learningObjectives:
  - goal: socmint
    weight: 10
    description: "Master Twitter intelligence techniques"
    
skillsTaught:
  - Advanced search operators
  - Timeline analysis
  - Bot detection
  - Hashtag tracking
  
learningOutcomes:
  - Extract tweets without API access
  - Build follower relationship maps
  - Identify coordinated behavior
  
industryContext: "Journalists and investigators use Twitter OSINT for source verification, event tracking, and influence campaign detection."

realWorldExamples:
  - Bellingcat investigations using Twitter
  - January 6 Capitol identification
  - Bot network detection research

careerPaths:
  - OSINT Analyst
  - Social Media Intelligence Analyst
  - Investigative Journalist
```

### 6. Teaching Phase (Write Adaptations)

**Critical**: Write for ALL 5 learning styles

```markdown
### 🔧 Experiential Learner
Open Twitter Advanced Search. Try different operators: from:username, near:location, since:2024-01-01. See what returns. Play with combinations. Learn by experimenting with real searches.

### 📊 Visual Learner  
Draw the account's network: target in center, connections radiating out. Use colors for follower types (verified, bots, real people). Create timeline graph of posting frequency. Visualize retweet patterns.

### 🔬 Analytical Learner
Study Twitter's API documentation. Understand rate limits, authentication, data access tiers. Read research papers on bot detection and coordinated inauthentic behavior. Learn technical foundations before investigating.

### 👥 Social Learner
Reference OSINT Framework guides on Twitter. Read Bellingcat Twitter investigations. Join OSINT communities discussing Twitter OSINT. Share techniques and learn from others' methodologies.

### ⚡ Pragmatic Learner
Fast workflow: Twitter Advanced Search → Twint for bulk download → Excel for analysis. One-liner: `twint -u target --json --output data.json`. Parse with Python. Done in 10 minutes.
```

### 7. Validation Phase (Check Quality)

**Use Checklist** from `Campaign Builder Guide.md`:
- [ ] All frontmatter fields
- [ ] All 5 teaching styles
- [ ] Real-world examples
- [ ] Career paths
- [ ] Parent/sibling/child set

**Visualize in Excalibrain**:
- Does it appear in correct place?
- Are relationships accurate?
- Any orphaned connections?

**Query with Dataview**:
```dataview
TABLE parent, sibling, child
FROM [[Twitter Intelligence]]
```

### 8. Sync Phase (Export to App)

```bash
# From atropos directory
npm run sync:campaigns

# Output:
✅ Processed: Twitter Intelligence (intermediate)
✅ Synced 1 campaign to client/src/config/obsidianCampaigns.ts
```

### 9. Testing Phase (Verify in App)

```bash
npm run dev
# Visit: http://localhost:5000/campaigns
# Find: Twitter Intelligence
# Click: Start Investigation
# Test: Walk through with AI agent
```

**Check**:
- Campaign loads correctly
- AI uses your starter prompt
- Teaching adaptation matches your learning style
- Tools are listed
- Objectives clear

### 10. Iteration Phase (Refine)

**Based on testing**:
1. Note improvements needed
2. Edit in Obsidian (faster than web UI)
3. Re-sync: `npm run sync:campaigns`
4. Test again
5. Repeat until perfect

---

## 🧠 Excalibrain for Curriculum Design

### Opening Excalibrain

**Method 1**: Click Excalibrain icon in left sidebar  
**Method 2**: `Ctrl/Cmd + P` → "Excalibrain: Open"  
**Method 3**: Right-click note → "Open in Excalibrain"

### Reading the Graph

**Node Types**:
- **Square**: Current note
- **Circles**: Related notes
- **Colors**: By note type or tag

**Connections**:
- **Up (⬆️)**: Lines to parent notes
- **Same (↔️)**: Lines to sibling notes
- **Down (⬇️)**: Lines to child notes

**Example View**:
```
                Curriculum (root)
                     |
         ┌───────────┼───────────┐
         ↓           ↓           ↓
    OSINT Path  Financial  Threat Intel
         |
    ┌────┼────┐
    ↓    ↓    ↓
  Mod1 Mod2 Mod3
    |
┌───┼───┐
↓   ↓   ↓
C1  C2  C3  ← YOUR CAMPAIGN HERE
```

### Using Excalibrain for Design

**1. Plan New Content**:
- Open parent module
- See existing children
- Identify gaps
- Create new campaign to fill gap

**2. Reorganize Structure**:
- See entire hierarchy
- Drag connections (mentally)
- Update parent fields
- Watch graph update

**3. Find Orphans**:
- Filter for notes with no connections
- Assign proper parents
- Connect to curriculum

**4. Balance Difficulty**:
- Color by difficulty
- See if one path has too many advanced
- Create beginner campaigns to balance

---

## 🔗 Breadcrumbs for Navigation

### Three Relationship Types (ONLY)

**parent** (⬆️):
- What this belongs to
- One level up in hierarchy
- Example: Campaign → Module

**sibling** (↔️):
- Same-level alternatives
- Parallel learning options
- Example: Campaign → Other campaigns in same module

**child** (⬇️):
- What this contains
- One level down
- Example: Module → Campaigns

### In-Note Display

Breadcrumbs shows in note:
```
⬆️ Up: SOCMINT Module
↔️ Same: LinkedIn OSINT, Facebook Intel
⬇️ Down: Step 1, Step 2, Step 3
```

### Trail View

Shows path from root:
```
Curriculum → OSINT Path → SOCMINT Module → Twitter Intel ← YOU
```

### Matrix View

Grid showing all relationships:
```
             | Parent        | Sibling     | Child
-------------|---------------|-------------|--------
Twitter Intel| SOCMINT Module| LinkedIn    | Steps
```

---

## 📊 Dataview Queries for Management

### Campaign Dashboard

Create: `Dashboards/Campaign Status.md`

````markdown
# Campaign Management Dashboard

## 🚧 Draft Campaigns (Work in Progress)
```dataview
TABLE difficulty, estimatedTime, tags, modified
FROM "Campaigns"
WHERE status = "draft"
SORT modified DESC
```

## ✅ Active Campaigns (Published)
```dataview
TABLE difficulty, estimatedTime, parent, length(child) as Steps
FROM "Campaigns"
WHERE status = "active"
SORT difficulty ASC, name ASC
```

## ⚠️ Quality Issues

### Missing Teaching Adaptations
```dataview
LIST
FROM "Campaigns"
WHERE status = "active" AND 
  (!contains(file.content, "### 🔧 Experiential") OR
   !contains(file.content, "### 📊 Visual") OR
   !contains(file.content, "### 🔬 Analytical") OR
   !contains(file.content, "### 👥 Social") OR
   !contains(file.content, "### ⚡ Pragmatic"))
```

### Orphaned Campaigns (No Parent)
```dataview
LIST
FROM "Campaigns"
WHERE !parent OR parent = ""
```

### Missing Learning Objectives
```dataview
LIST
FROM "Campaigns"
WHERE status = "active" AND !learningObjectives
```

## 📊 Statistics

### By Difficulty
```dataview
TABLE length(rows) as Count, round(avg(rows.estimatedTime), 1) as "Avg Time"
FROM "Campaigns"
GROUP BY difficulty
```

### By Parent Module
```dataview
TABLE length(rows) as "Campaign Count"
FROM "Campaigns"
GROUP BY parent
SORT length(rows) DESC
```
````

### Learning Path Progress

Create: `Dashboards/Path Progress.md`

````markdown
# Learning Path Progress

## All Paths Overview
```dataview
TABLE
  difficulty as Level,
  estimatedHours as Hours,
  length(child) as Modules,
  targetRoles[0] as "Primary Role",
  salaryRange as Salary
FROM "Learning-Paths"
WHERE type = "learning-path"
SORT difficulty ASC
```

## Completion Tracking
```dataview
TABLE
  sum(rows.estimatedHours) as "Total Hours",
  length(rows) as "Total Paths"
FROM "Learning-Paths"
GROUP BY category
```
````

### Achievement Analytics

Create: `Dashboards/Achievement Stats.md`

````markdown
# Achievement Statistics

## By Rarity
```dataview
TABLE
  length(rows) as Count,
  sum(rows.xpReward) as "Total XP",
  sum(rows.currencyReward) as "Total Credits",
  round(avg(rows.xpReward), 0) as "Avg XP"
FROM "Achievements"
WHERE type = "achievement"
GROUP BY rarity
SORT rarity DESC
```

## By Category
```dataview
TABLE
  length(rows) as Count,
  max(rows.xpReward) as "Max XP"
FROM "Achievements"
GROUP BY category
```

## Legendary Achievements
```dataview
TABLE xpReward, currencyReward, category, requirementType
FROM "Achievements"
WHERE rarity = "legendary"
SORT xpReward DESC
```
````

---

## 📝 Frontmatter Standards (Critical!)

### Parent/Sibling/Child ONLY

**✅ CORRECT**:
```yaml
parent: [[OSINT Module]]
sibling:
  - [[Campaign A]]
  - [[Campaign B]]
child:
  - [[Step 1]]
```

**❌ WRONG** (Don't use these!):
```yaml
prerequisite: [[Something]]  # NO
requires: [[Something]]       # NO
unlocks: [[Something]]        # NO
related: [[Something]]        # NO
leads-to: [[Something]]       # NO
part-of: [[Something]]        # NO
```

**Why**: Breadcrumbs and Excalibrain only understand parent/sibling/child. Other fields break navigation.

### Required Fields (All Notes)

```yaml
id: note_slug                # Unique identifier
name: Note Name              # Display name
type: campaign|learning-path|achievement|tool|module
status: draft|active|archived
created: YYYY-MM-DD          # ISO date
modified: YYYY-MM-DD         # Auto-update with Templater
parent: [[Parent Note]]      # Or null for root
sibling: []                  # Or list of [[siblings]]
child: []                    # Or list of [[children]]
```

### Type-Specific Fields

**See**: `METADATA_STANDARDS.md` for complete reference

**Validation**: Before syncing, check:
- YAML syntax valid (use validator)
- All required fields present
- parent/sibling/child use [[wiki links]]
- No circular references (A → B → A)

---

## 🎓 Curriculum Management

### Adding a New Learning Path

**1. Create Path Note**:
```
Location: Learning-Paths/Blockchain Analyst Path.md
Template: Learning Path Template
```

**2. Set Metadata**:
```yaml
parent: [[Curriculum]]
sibling:
  - [[Financial Investigator Path]]  # Related path
  - [[Crypto Trader Path]]           # Related path
child:
  - [[Module 1 Blockchain Basics]]
  - [[Module 2 Transaction Analysis]]
  - [[Module 3 DeFi Investigation]]
```

**3. Create Module Notes**:
```
For each module:
  Location: Curriculum/Modules/
  parent: [[Blockchain Analyst Path]]
  sibling: [other modules in same path]
  child: [campaigns that teach these skills]
```

**4. Assign Campaigns**:
```
Existing or new campaigns:
  parent: [[Module Name]]
```

**5. Visualize in Excalibrain**:
- See full path structure
- Verify hierarchy makes sense
- Check for gaps

**6. Sync**:
```bash
npm run sync:learning-paths
npm run sync:campaigns
```

### Reorganizing Content

**Moving Campaign to Different Module**:

**Before**:
```yaml
# In Campaign note
parent: [[Old Module]]
```

**After**:
```yaml
# Change parent field
parent: [[New Module]]

# Update siblings if needed
sibling:
  - [[New Module Sibling 1]]
  - [[New Module Sibling 2]]
```

**Update Module Notes**:
```yaml
# In Old Module - remove from child list
child:
  - [[Campaign A]]
  # - [[Your Campaign]] ← remove this

# In New Module - add to child list
child:
  - [[Campaign X]]
  - [[Your Campaign]] ← add this
```

**Verify**: Check Excalibrain shows new connections

---

## 🛠️ Advanced Features

### Templater User Scripts

**Location**: `Scripts/helpers.js`

**Example**: Auto-generate investigation steps

```javascript
function generateSteps(count) {
  let output = '';
  for (let i = 1; i <= count; i++) {
    output += `
### Step ${i}: [Step Name]

**Goal**: 

**Tools**: 

**Procedure**:
1. 
2. 

**Success Indicators**:
- 

**Red Flags**:
- 

`;
  }
  return output;
}

module.exports = generateSteps;
```

**Usage in Template**:
```markdown
## Investigation Steps

<%* tR += tp.user.generateSteps(5) %>
```

### Dataview Inline Queries

**In Campaign Note**:
```markdown
## Related Campaigns
`= [[SOCMINT Module]].child`

## Tools Used
`= this.tools`

## Prerequisites
`= this.parent.parent.name` 
```

### Metadata Menu for Visual Editing

**Install**: Metadata Menu plugin  
**Configure**: Settings → Metadata Menu

**Field Types**:
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
  "tags": {
    "type": "MultiSelect",
    "options": ["OSINT", "SOCMINT", "Network", "Malware", "Financial", "Crypto"]
  },
  "parent": {
    "type": "Note",
    "folder": "Curriculum/Modules"
  },
  "sibling": {
    "type": "MultiNote",
    "folder": "Campaigns"
  }
}
```

**Usage**: Right sidebar shows visual editor for all fields

---

## 📦 Version Control with Git

### Obsidian Git Plugin Setup

**Settings → Obsidian Git**:
```json
{
  "autoSaveInterval": 10,          // Auto-commit every 10 min
  "autoPullInterval": 5,           // Auto-pull every 5 min
  "commitMessage": "vault: {{date}} {{numFiles}} files",
  "pullBeforePush": true,
  "disablePush": false
}
```

### Manual Git Operations

**Commit**:
```
Ctrl/Cmd + P → "Obsidian Git: Commit all changes"
Message: "content: add Twitter OSINT campaign"
```

**Push**:
```
Ctrl/Cmd + P → "Obsidian Git: Push"
```

**Pull**:
```
Ctrl/Cmd + P → "Obsidian Git: Pull"
```

**View Changes**:
```
Ctrl/Cmd + P → "Obsidian Git: Open diff view"
```

### Collaboration

**Team Workflow**:
1. **Person A**: Creates campaign in Obsidian
2. **Commit + Push**: Via Obsidian Git
3. **Person B**: Pull in Obsidian
4. **Review**: Comment in note or use GitHub
5. **Merge**: Person A incorporates feedback
6. **Sync**: Export to app: `npm run sync:from-obsidian`

---

## 🎯 Best Practices

### 1. Always Use Templates
- Never start from blank note
- Ensures consistent frontmatter
- Auto-fills required fields
- Reduces errors

### 2. Visualize Early and Often
- Open Excalibrain after creating note
- Verify relationships immediately
- Catch errors before they propagate

### 3. Use Breadcrumbs Trail
- Check trail shows correct hierarchy
- Navigate up to parent easily
- Find siblings quickly

### 4. Query Before Syncing
```dataview
LIST
FROM [[Your New Campaign]]
WHERE !parent OR !difficulty OR !learningObjectives
```

If query returns your note, metadata is incomplete!

### 5. Commit Frequently
- After each campaign: commit
- Before syncing: commit
- After testing: commit
- Small commits > big commits

### 6. Test in App Always
- Never assume sync worked
- Always play-test campaign
- Verify teaching adaptations load
- Check objectives display correctly

### 7. Document Decisions
- Use comments in notes
- Daily notes for planning
- Commit messages explain why

### 8. Maintain Metadata Standards
- Read `METADATA_STANDARDS.md` regularly
- Use only approved fields
- Follow naming conventions
- Validate YAML syntax

---

## 🔍 Finding Content

### By Hierarchy (Breadcrumbs)
```
Open any note → Breadcrumbs panel shows:
- Parent (what it belongs to)
- Siblings (alternatives)
- Children (what it contains)
```

### By Property (Dataview)
```dataview
# All intermediate SOCMINT campaigns
TABLE parent, estimatedTime
FROM "Campaigns"
WHERE difficulty = "intermediate" AND contains(tags, "SOCMINT")
```

### By Tag
```dataview
# Everything tagged with Financial
FROM #Financial
```

### By Relation (Graph View)
```
Open note → Local Graph (right sidebar)
See all connected notes
```

### Full-Text Search
```
Ctrl/Cmd + Shift + F → Search all content
```

---

## 💾 Backup Strategy

### Automatic Backups

**Obsidian Git**:
- Auto-commits every 10 minutes
- Auto-pushes to remote
- Full history preserved

**File System**:
- Obsidian has built-in file recovery
- Settings → Files → File recovery

### Manual Backups

**Before major changes**:
```bash
cd obsidian-vault
git tag -a backup-$(date +%Y%m%d) -m "Backup before major refactor"
git push origin --tags
```

**Export entire vault**:
```bash
zip -r vault-backup-$(date +%Y%m%d).zip obsidian-vault/
```

---

## 🆘 Troubleshooting

### Sync Issues

**"Campaign not syncing"**:
1. Check status is "active" (not "draft")
2. Verify frontmatter YAML is valid
3. Run sync with verbose: add console.logs
4. Check file is in Campaigns/ directory

**"Relationships not showing"**:
1. Use only parent/sibling/child
2. Check [[wiki links]] resolve (click them!)
3. Reload Breadcrumbs: Cmd+P → "Breadcrumbs: Refresh"
4. Restart Obsidian

**"YAML parse error"**:
1. Check for unquoted special characters
2. Verify array syntax (proper indentation)
3. Use YAML validator online
4. Check for tabs vs spaces

### Plugin Issues

**Templater not working**:
1. Settings → Templater → Enable
2. Set Templates folder path
3. Enable trigger on file creation
4. Restart Obsidian

**Excalibrain empty**:
1. Enable Excalibrain plugin
2. Check note has parent/sibling/child fields
3. Verify fields use [[wiki links]]
4. Try different layout (settings)

**Breadcrumbs not showing**:
1. Enable Breadcrumbs plugin
2. Check data.json config (parent/sibling/child)
3. Verify relationships in frontmatter
4. Reload Breadcrumbs index

---

## 📚 Learning Resources

### Obsidian
- **Official docs**: help.obsidian.md
- **Community forum**: forum.obsidian.md
- **Plugin docs**: In plugin settings

### Breadcrumbs
- **GitHub**: SkepticMystic/breadcrumbs
- **Docs**: Comprehensive in plugin

### Excalibrain
- **GitHub**: zsviczian/excalibrain
- **Demo**: YouTube tutorials

### Dataview
- **GitHub**: blacksmithgu/obsidian-dataview
- **Query Language**: Full SQL-like syntax

---

## 🎉 Success Metrics

You're successful with the vault when:

✅ Can create campaign in under 10 minutes  
✅ Excalibrain shows clean hierarchy  
✅ Breadcrumbs navigation intuitive  
✅ Sync completes without errors  
✅ Campaigns work in app immediately  
✅ Git commits are automatic  
✅ No orphaned notes  
✅ All metadata validated  

---

## 🚀 Next Steps

1. ✅ Read this guide
2. ✅ Read `METADATA_STANDARDS.md`
3. ✅ Create test campaign from template
4. ✅ Visualize in Excalibrain
5. ✅ Sync to app and test
6. ✅ Iterate based on feedback
7. ✅ Build your first real campaign!

---

**Guide Version**: 1.0  
**Last Updated**: 2026-02-07  
**Vault Path**: `obsidian-vault/`  
**Sync Commands**: `npm run sync:*`  

**Questions?** Check `METADATA_STANDARDS.md` or open issue in repository.
