---
type: guide
status: start-here
created: 2026-02-07
modified: 2026-02-07
cssclass: start-here
---

# 👋 Welcome to Atropos Education Management Vault!

You're in an **Obsidian-based curriculum management system** for the Atropos cybersecurity training platform.

## 🎯 What Can You Do Here?

### ✅ Build Campaigns Offline
- Design investigation campaigns with full Markdown
- Use templates for consistency (Templater)
- Work anywhere - no internet needed
- Sync to app when ready

### ✅ Visualize Curriculum
- See entire learning structure in Excalibrain
- Navigate hierarchically with Breadcrumbs (parent/sibling/child)
- Identify gaps and opportunities visually
- Understand relationships at a glance

### ✅ Manage Learning Paths
- Create career-focused learning paths
- Organize modules and campaigns
- Map to industry job roles
- Track student progression

### ✅ Define Achievements
- Create achievement definitions
- Set unlock requirements
- Design progression systems
- Configure rewards (XP, currency, unlocks)

### ✅ Version Control Everything
- Git integration via Obsidian Git plugin
- Track all changes with commits
- Collaborate with team
- Rollback if needed

### ✅ Query & Analyze
- Use Dataview for powerful queries
- Find orphaned content
- Track completion status
- Generate reports

## 🚀 Quick Start (5 Steps)

### Step 1: Install Plugins (Required)

**Open**: Settings (⚙️) → Community Plugins → Browse

**Install These**:
1. **Breadcrumbs** - Hierarchical navigation ⭐ REQUIRED
2. **Excalibrain** - Visual graph ⭐ REQUIRED
3. **Dataview** - Metadata queries ⭐ REQUIRED
4. **Templater** - Templates ⭐ REQUIRED
5. **Obsidian Git** - Version control (Recommended)
6. **Metadata Menu** - Visual frontmatter editor (Recommended)

**Enable All**: Settings → Community Plugins → Toggle ON

### Step 2: Configure Templater

**Settings → Templater**:
- ✅ Templates folder: `Templates`
- ✅ Trigger on file creation: ON
- ✅ Auto jump to cursor: ON
- ✅ Enable folder templates: ON

**Test**: Create new note in Campaigns/ folder - template should auto-apply!

### Step 3: Open the MOC (Map of Content)

**Click**: [[MOC - Education Management]]

This is your **dashboard**. Bookmark it!

### Step 4: Read Critical Guides

**Must Read** (10 minutes total):
1. [[README]] - Vault overview (5 min)
2. [[METADATA_STANDARDS]] - Frontmatter rules (3 min)
3. [[Campaign Builder Guide]] - How to build (2 min skim)

### Step 5: Create Your First Campaign

**Method A - From Template**:
```
1. Ctrl/Cmd + P
2. "Templater: Create new note from template"
3. Select: "Campaign Template"
4. Name: "My First Campaign"
5. Fill in frontmatter
6. Write content
7. Save
```

**Method B - In Folder** (Auto-template):
```
1. Right-click Campaigns/Beginner/ folder
2. "New note"
3. Name: "My First Campaign"
4. Template auto-applies!
5. Fill and save
```

---

## 📚 Essential Reading Order

### Day 1: Setup & Orientation
1. ✅ This file (START_HERE.md) - You are here!
2. [[README]] - Vault structure and purpose
3. [[METADATA_STANDARDS]] - Frontmatter rules ⭐ CRITICAL

### Day 2: Campaign Building
4. [[Campaign Builder Guide]] - Step-by-step campaign creation
5. [[Curriculum]] - See overall structure
6. [[OSINT Specialist Path]] - Example learning path

### Day 3: Advanced
7. Explore Templates/ folder - See all templates
8. Try Excalibrain - Visualize curriculum
9. Write Dataview queries - Query your content

---

## 🔗 Key Concepts

### Hierarchical Relationships (ONLY THESE!)

**Use ONLY**:
- `parent:` - What this belongs to (⬆️)
- `sibling:` - Same-level alternatives (↔️)
- `child:` - What this contains (⬇️)

**DON'T Use**:
- ❌ prerequisite
- ❌ requires
- ❌ unlocks
- ❌ related
- ❌ leads-to

**Why**: Breadcrumbs and Excalibrain only understand parent/sibling/child

**Example Hierarchy**:
```
Curriculum (parent: null)
└── OSINT Specialist Path (parent: Curriculum)
    └── SOCMINT Module (parent: OSINT Specialist Path)
        └── Twitter Intel Campaign (parent: SOCMINT Module)
            └── Step 1 (parent: Twitter Intel Campaign)
```

### Metadata Standards

**Every Note MUST Have**:
```yaml
---
id: unique_slug
name: Display Name
type: campaign|learning-path|achievement|tool|module
status: draft|active|archived
created: YYYY-MM-DD
modified: YYYY-MM-DD
parent: [[Parent Note]]  # or null
sibling: [[Sibling]]     # or []
child: [[Child]]         # or []
---
```

**Validation**: Check [[METADATA_STANDARDS]] before syncing!

---

## 🔄 Sync to App

### Export Your Edits to Atropos

**After creating/editing campaigns**:
```bash
cd /path/to/atropos  # Main app directory
npm run sync:campaigns
```

**After editing learning paths**:
```bash
npm run sync:learning-paths
```

**After creating achievements**:
```bash
npm run sync:achievements
```

**Export everything**:
```bash
npm run sync:from-obsidian
```

**Test in app**:
```bash
npm run dev
# Visit: http://localhost:5000
```

### Import from App to Vault

**Get latest app content**:
```bash
npm run sync:to-obsidian
```

**Use case**: Someone else edited campaigns in app, you want them in vault

---

## 🎨 Visual Tools

### Excalibrain

**Open**: Click Excalibrain icon (left sidebar)

**What you see**: Visual graph of ALL relationships
- Parent connections go UP
- Sibling connections go SIDEWAYS
- Child connections go DOWN
- Current note is HIGHLIGHTED

**Use for**:
- Curriculum design
- Gap identification
- Hierarchy verification
- Relationship mapping

### Breadcrumbs

**View**: Breadcrumbs panel (right sidebar)

**Shows**:
- ⬆️ Up: Parent notes
- ↔️ Same: Sibling notes
- ⬇️ Down: Child notes
- 🔗 Trail: Path from root to current

**Use for**:
- Quick navigation
- Understanding context
- Finding related content

### Graph View

**Open**: Click graph icon (left sidebar)

**Shows**: All notes and connections
- Zoom in/out
- Filter by tag
- Group by folder

**Use for**:
- Overall structure overview
- Finding isolated notes
- Community detection

---

## 💡 Pro Tips

### 1. Keyboard Shortcuts
Set in Settings → Hotkeys:
- `Ctrl+Shift+C`: "Create campaign from template"
- `Ctrl+Shift+E`: "Open in Excalibrain"
- `Ctrl+Shift+B`: "Show Breadcrumbs"

### 2. Daily Notes for Planning
Enable Daily Notes plugin:
- Plan content creation
- Track progress
- Log sync operations

### 3. Use Dataview Everywhere
Embed queries in notes to see live data:
```dataview
LIST FROM "Campaigns" WHERE parent = [[This Module]]
```

### 4. Pin Important Notes
Right-click → "Pin" keeps notes accessible in left sidebar

### 5. Use Starred Notes
Star ⭐ frequently accessed notes for quick access

### 6. Templates for Everything
Create templates for:
- Daily planning notes
- Meeting notes
- Review checklists
- Release notes

### 7. Batch Operations
Use Dataview to find multiple notes needing updates:
```dataview
TASK FROM "Campaigns" WHERE !learningObjectives
```

Then edit them all!

---

## 🎓 Workflow Examples

### Workflow 1: Creating New Learning Track

**Goal**: Add "Cloud Security Path"

**Steps**:
1. Create: `Learning-Paths/Cloud Security Path.md` from template
2. Set parent: `[[Curriculum]]`
3. Set siblings: `[[Network Security Path]]`, `[[DevSecOps Path]]`
4. Create modules (3-4) as children
5. Assign/create campaigns for each module
6. Visualize in Excalibrain (verify structure)
7. Sync: `npm run sync:learning-paths` and `npm run sync:campaigns`
8. Test in app

**Time**: 1-2 hours for complete track

### Workflow 2: Updating Existing Campaign

**Goal**: Add teaching adaptations to existing campaign

**Steps**:
1. Open campaign note in Obsidian
2. Find "Teaching Adaptations" section
3. Write content for all 5 learning styles
4. Update `modified: <% tp.date.now("YYYY-MM-DD") %>`
5. Save
6. Sync: `npm run sync:campaigns`
7. Test in app with different learning style settings

**Time**: 10-15 minutes per campaign

### Workflow 3: Reorganizing Curriculum

**Goal**: Move campaigns between modules

**Steps**:
1. Open Excalibrain
2. Identify campaigns to move
3. Update their `parent:` field
4. Update old module's `child:` (remove campaign)
5. Update new module's `child:` (add campaign)
6. Check Excalibrain updates correctly
7. Sync: `npm run sync:campaigns`

**Time**: 5 minutes per campaign

---

## ⚠️ Common Mistakes

### ❌ Using Custom Relationship Fields
```yaml
prerequisite: [[Something]]  # Wrong!
requires: [[Something]]      # Wrong!
unlocks: [[Something]]       # Wrong!
```

### ✅ Use Standard Fields
```yaml
parent: [[Something]]   # Correct
sibling: [[Something]]  # Correct
child: [[Something]]    # Correct
```

### ❌ Forgetting to Set Parent
```yaml
parent:  # Empty! Becomes orphan
```

### ✅ Always Assign Parent
```yaml
parent: [[OSINT Module]]  # Good
```

### ❌ Inconsistent Field Names
```yaml
Learning_Objectives:  # Wrong case
learning-objectives:  # Wrong delimiter
```

### ✅ Use camelCase
```yaml
learningObjectives:   # Correct
```

---

## 🎉 You're All Set!

This vault is your **offline-first education management system**.

**What you can do now**:
1. ✅ Build campaigns with templates
2. ✅ Visualize with Excalibrain
3. ✅ Navigate with Breadcrumbs
4. ✅ Query with Dataview
5. ✅ Version control with Git
6. ✅ Sync bidirectionally with app
7. ✅ Work offline, deploy online

**Start creating**: Open [[Campaign Builder Guide]]

---

## 📞 Getting Help

### Documentation
- [[README]] - Vault overview
- [[METADATA_STANDARDS]] - Canonical reference
- [[Campaign Builder Guide]] - Step-by-step
- [[MOC - Education Management]] - Map of all content

### Issues
- Open issue in atropos GitHub repo
- Tag with `obsidian-vault` label

### Community
- Obsidian forum for plugin questions
- Atropos Discord for content questions

---

**Welcome aboard! Start building amazing cybersecurity training content.** 🚀

**Next Step**: [[Campaign Builder Guide]] →
