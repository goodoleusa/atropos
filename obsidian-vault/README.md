# Atropos Education Management Vault

> **Obsidian vault for managing Atropos curriculum, campaigns, and learning paths offline**

## 🎯 Purpose

Edit and manage Atropos educational content in Obsidian with:
- ✅ **Breadcrumbs** - Hierarchical relationships (prerequisites, leads-to, related)
- ✅ **Excalibrain** - Visual knowledge graph with campaign connections
- ✅ **Templater** - Auto-fill campaign templates with prompts
- ✅ **Dataview** - Query campaigns by difficulty, track, skills
- ✅ **Bidirectional Sync** - Export to app when ready

## 📁 Vault Structure

```
obsidian-vault/
├── Campaigns/              # Investigation campaigns
│   ├── Shell Corp Investigation.md
│   ├── BGP Route Tracing.md
│   ├── Passive Reconnaissance.md
│   └── ... (23 total)
├── Learning-Paths/         # Career-focused tracks
│   ├── Threat Intelligence Analyst.md
│   ├── Financial Crime Investigator.md
│   ├── OSINT Specialist.md
│   └── Security Researcher.md
├── Achievements/           # Achievement definitions
├── Tools/                  # Tool documentation
├── Guides/                 # How-to guides
├── Templates/              # Templater templates
│   ├── Campaign Template.md
│   ├── Learning Path Template.md
│   └── Achievement Template.md
└── Curriculum/             # Core curriculum docs
    └── Experiential Learning Framework.md
```

## 🔧 Setup

### 1. Install Obsidian
Download from: https://obsidian.md

### 2. Open Vault
```
File → Open Vault → Open folder as vault
Select: /path/to/atropos/obsidian-vault
```

### 3. Install Plugins
Settings → Community Plugins → Browse:
- ✅ **Breadcrumbs** (relationship management)
- ✅ **Excalibrain** (visual graph)
- ✅ **Dataview** (queries)
- ✅ **Templater** (templates)
- ✅ **Obsidian Git** (version control)
- ✅ **Kanban** (project tracking)

### 4. Enable Plugins
Settings → Community Plugins → Enable each plugin

## 🎨 Creating Campaigns

### Method 1: Using Template (Recommended)
1. Go to `Campaigns/` folder
2. Click "Create new note"
3. Templater auto-fills the template
4. Fill in prompts:
   - Category? (osint, network, etc.)
   - Difficulty? (beginner, intermediate, advanced, expert)
   - Estimated time?
5. Complete the template sections
6. Save

### Method 2: From Command Palette
1. `Cmd/Ctrl + P` → "Templater: Create new note from template"
2. Choose "Campaign Template"
3. Name your campaign
4. Fill in the template

### Template Sections

**Frontmatter** (YAML):
```yaml
---
id: campaign_slug
difficulty: intermediate
learningObjectives:
  - goal: osint_investigation
    weight: 10
    description: "..."
skillsRequired: [...]
careerPaths: [...]
---
```

**Body**:
- Overview
- Objectives
- Tools Required
- Starter Prompt
- Teaching Adaptations (5 learning styles)
- Investigation Steps
- Expected Findings

## 🔗 Using Breadcrumbs

### Relationship Types

**Hierarchical**:
```markdown
prerequisite: [[Passive Reconnaissance]]
unlocks: [[Advanced Network Analysis]]
part-of: [[OSINT Specialist Track]]
```

**Horizontal**:
```markdown
related: [[Similar Campaign]]
see-also: [[Related Concept]]
next: [[Next Campaign]]
previous: [[Previous Campaign]]
```

**Teaching Flow**:
```markdown
builds-on: [[Foundation Campaign]]
teaches: [[Skill Name]]
leads-to: [[Advanced Campaign]]
requires: [[Prerequisite Skill]]
```

### Viewing Relationships

1. **In Note**: Breadcrumbs trail at top
2. **Graph View**: Visual connections
3. **Excalibrain**: Interactive graph with filtering
4. **Matrix View**: All relationships at once

## 🧠 Using Excalibrain

### Open Excalibrain
- Click brain icon in sidebar, or
- `Cmd/Ctrl + P` → "Open Excalibrain"

### Node Types (Color Coded)
- 🟡 **Yellow (Hexagon)**: Campaigns
- 🟢 **Teal (Diamond)**: Learning Paths
- 🟣 **Purple (Star)**: Achievements
- 🔵 **Blue (Circle)**: Skills
- 🟢 **Green (Square)**: Tools

### Navigation
- **Click node**: Focus on that note
- **Hover**: Preview content
- **Drag**: Rearrange layout
- **Filter**: By tag, relationship type
- **Zoom**: Mouse wheel

### Example View
```
[OSINT Specialist Track]
  ├─ contains → [Passive Recon Campaign]
  │              ├─ leads-to → [Active Recon Campaign]
  │              └─ requires → [Basic OSINT Skill]
  ├─ contains → [SOCMINT Campaign]
  └─ contains → [Geolocation Campaign]
```

## 📊 Dataview Queries

### Campaign Dashboard
```dataview
TABLE difficulty, estimatedTime, tags
FROM "Campaigns"
WHERE type = "campaign"
SORT difficulty ASC, name ASC
```

### By Difficulty
```dataview
LIST
FROM "Campaigns"
WHERE difficulty = "beginner"
SORT name
```

### By Learning Goal
```dataview
TABLE learningObjectives[0].goal as "Primary Goal", difficulty
FROM "Campaigns"
WHERE contains(learningObjectives[0].goal, "osint")
```

### Track Progress
```dataview
TABLE status, difficulty, estimatedTime
FROM "Campaigns"
WHERE status = "draft" OR status = "review"
SORT modified DESC
```

## 🔄 Syncing to App

### Campaign Sync (Obsidian → App)
```bash
# Export campaigns from Obsidian to app
npm run sync:campaigns -- --from-obsidian

# This creates: client/src/config/obsidianCampaigns.ts
# Import in agentCampaigns.ts when ready
```

### Learning Path Sync
```bash
npm run sync:paths -- --from-obsidian
```

### Achievement Sync
```bash
npm run sync:achievements -- --from-obsidian
```

### Full Sync
```bash
npm run sync:all
```

## ✏️ Editing Workflow

### 1. Edit in Obsidian
- Open campaign in Campaigns folder
- Modify content, frontmatter, relationships
- Save (auto-saves)

### 2. Review in Graph
- Open Excalibrain
- Verify relationships
- Check prerequisite chains
- Ensure logical flow

### 3. Test Locally (Optional)
```bash
# Sync to app
npm run sync:campaigns -- --from-obsidian

# Test in dev
npm run dev
# Visit: /campaigns
```

### 4. Export When Ready
```bash
# Sync
npm run sync:campaigns -- --from-obsidian

# Commit
git add client/src/config/obsidianCampaigns.ts
git commit -m "feat: add campaigns from Obsidian vault"

# Import in main config
# Edit: client/src/config/agentCampaigns.ts
# Add: ...OBSIDIAN_CAMPAIGNS to AGENT_CAMPAIGNS array
```

## 🎓 Managing Learning Paths

### Create New Path
1. Use `Templates/Learning Path Template.md`
2. Define target roles and skills
3. Link to campaign modules: `[[Campaign Name]]`
4. Set relationships:
   ```markdown
   contains: [[Module 1 Campaign]], [[Module 2 Campaign]]
   prerequisite: [[Foundation Campaign]]
   leads-to: [[Advanced Path]]
   ```

### Track Student Progress
Use Kanban boards:
```bash
Create: Student Progress.md
Add columns: To Start, In Progress, Completed
Add cards: [[Campaign Name]]
```

## 🏆 Achievement Management

### Design Achievement
1. Use Achievement Template
2. Define requirements in JSON
3. Set rewards (XP, currency, unlocks)
4. Link related achievements
5. Export to app

### Achievement Types

**Stat-Based**:
```json
{
  "type": "stat",
  "condition": {
    "stat": "campaignsCompleted",
    "value": 10,
    "comparison": "gte"
  }
}
```

**Action-Based**:
```json
{
  "type": "action",
  "condition": {
    "action": "complete_campaign",
    "campaignId": "specific_campaign",
    "timeLimit": 900
  }
}
```

**Campaign-Based**:
```json
{
  "type": "campaign",
  "condition": {
    "campaigns": ["campaign1", "campaign2"],
    "requirement": "all"
  }
}
```

## 📱 Working Offline

### Offline Editing
1. Edit campaigns, paths, achievements in Obsidian
2. Use Git plugin to commit locally
3. Sync to app when back online
4. Push changes

### Version Control
Obsidian Git plugin can:
- Auto-commit every X minutes
- Push to remote on schedule
- Pull before editing
- Resolve conflicts

**Setup**:
```
Settings → Obsidian Git
- Vault backup interval: 10 min
- Auto pull: On open
- Auto push: After commit
```

## 🔍 Finding Content

### Quick Switcher
`Cmd/Ctrl + O` → Type campaign name

### Search
`Cmd/Ctrl + Shift + F` → Search all content

### Tags
Click tag to see all notes with that tag:
- `#OSINT`
- `#beginner`
- `#financial`

### Graph View
`Cmd/Ctrl + G` → Visual note connections

## 🎯 Best Practices

### Campaign Design
1. **Start with learning objectives** - What should students learn?
2. **Map to careers** - Which jobs use this skill?
3. **Add real examples** - Actual incidents as context
4. **Write for all 5 styles** - Teaching adaptations matter
5. **Link prerequisites** - Use breadcrumbs for sequencing
6. **Test the flow** - Does it make sense?

### Relationship Management
1. **Use consistent links** - `prerequisite`, `unlocks`, `related`
2. **Create bidirectional** - Link both ways for graph
3. **Track dependencies** - Use Excalibrain to visualize
4. **Document assumptions** - Note why relationships exist

### Quality Control
1. **Check broken links** - Fix before syncing
2. **Validate frontmatter** - Required fields present?
3. **Review teaching adaptations** - All 5 styles covered?
4. **Test in app** - Sync and verify works

## 🚀 Advanced Features

### Dataview Scripts

**Campaign by Career Path**:
````markdown
```dataview
TABLE difficulty, estimatedTime
FROM "Campaigns"
WHERE contains(careerPaths, "Threat Intelligence Analyst")
SORT difficulty ASC
```
````

**Learning Path Coverage**:
````markdown
```dataview
TABLE
  length(contains) as "Campaigns",
  estimatedTime as "Total Time"
FROM "Learning-Paths"
GROUP BY file.name
```
````

### Templater Scripts

**Auto-generate Campaign ID**:
```javascript
<% tp.file.title.toLowerCase().replace(/\s+/g, '_') %>
```

**Insert Current Date**:
```javascript
<% tp.date.now("YYYY-MM-DD HH:mm") %>
```

**Prompt for Values**:
```javascript
<% tp.system.prompt("Difficulty?") %>
```

### Custom Queries

Save in `Scripts/` folder:
```javascript
// Scripts/campaign-stats.js
function getCampaignStats(dv) {
  const campaigns = dv.pages('"Campaigns"');
  return {
    total: campaigns.length,
    byDifficulty: campaigns.groupBy(c => c.difficulty),
    avgTime: campaigns.estimatedTime.average()
  };
}
```

## 📋 Checklists

### Before Syncing to App
- [ ] All frontmatter fields complete
- [ ] No broken internal links
- [ ] Teaching adaptations for all 5 styles
- [ ] Starter prompt clear and actionable
- [ ] Learning objectives mapped to curriculum
- [ ] Career paths specified
- [ ] Real-world examples included

### After Syncing
- [ ] Run `npm run build` to verify
- [ ] Check TypeScript compilation
- [ ] Test campaign in dev environment
- [ ] Verify links work in app
- [ ] Check mobile responsiveness

## 🆘 Troubleshooting

**Breadcrumbs not showing**:
- Check frontmatter has relationship fields
- Refresh breadcrumbs (Cmd+P → "Breadcrumbs: Refresh")

**Excalibrain empty**:
- Verify relationships use correct syntax
- Check plugin settings for link types

**Sync fails**:
- Validate YAML frontmatter syntax
- Check for TypeScript reserved words in IDs
- Ensure required fields present

**App doesn't load campaigns**:
- Check obsidianCampaigns.ts created
- Import in agentCampaigns.ts
- Restart dev server

---

## 📚 Resources

**Obsidian Docs**: https://help.obsidian.md  
**Breadcrumbs**: https://github.com/SkepticMystic/breadcrumbs  
**Excalibrain**: https://github.com/zsviczian/excalibrain  
**Templater**: https://silentvoid13.github.io/Templater/  

**Atropos Docs**:
- `../docs/CURRICULUM.md` - Learning framework
- `../docs/CAMPAIGN_LEARNING_TEMPLATE.md` - Campaign guide
- `../QUICK_START.md` - Platform cheatsheet

---

**Philosophy**: Edit where it's comfortable (Obsidian), deploy where it's needed (App)

**Workflow**: Edit offline → Visualize connections → Export to app → Deploy 🚀
