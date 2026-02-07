# Obsidian Vault Integration Guide

## 🎯 Purpose

Manage Atropos educational content in Obsidian for:
- ✅ **Visual campaign building** with Excalibrain knowledge graph
- ✅ **Relationship management** with Breadcrumbs (prerequisites, unlocks, related)
- ✅ **Offline editing** with full campaign designer capabilities
- ✅ **Templater automation** for rapid campaign creation
- ✅ **Bidirectional sync** between Obsidian markdown ↔ TypeScript campaigns
- ✅ **Version control** with Obsidian Git plugin

## 🚀 Quick Setup (5 minutes)

### 1. Open Vault in Obsidian
```bash
# In Obsidian: File → Open Vault → Open folder as vault
# Select: /path/to/atropos/obsidian-vault
```

### 2. Install Required Plugins
Settings → Community Plugins → Browse and install:
- ✅ **Breadcrumbs** (relationship hierarchies)
- ✅ **Excalibrain** (visual knowledge graph)
- ✅ **Templater** (campaign templates)
- ✅ **Dataview** (campaign queries)
- ✅ **Obsidian Git** (version control)

All configurations pre-loaded in `.obsidian/` folder!

### 3. Start Creating
- Press `Cmd/Ctrl + N` in Campaigns folder → Auto-fills template
- Or use `Cmd/Ctrl + P` → "Templater: Create new note from template"

## 🎨 Campaign Builder Features

### Templater Integration

**Auto-Fill Campaign ID**:
```markdown
id: <% tp.file.title.toLowerCase().replace(/\s+/g, '_') %>
```

**Prompts for Values**:
- Difficulty (beginner/intermediate/advanced/expert)
- Category (osint, network, malware, social)
- Estimated time
- Icon emoji

**Result**: Complete campaign structure in 30 seconds!

### Breadcrumbs Relationships

**Hierarchical Links**:
```yaml
prerequisite: [[Foundation Campaign]]  # Must complete first
unlocks: [[Advanced Campaign]]         # This enables
part-of: [[Learning Path]]             # Track membership
```

**Cross-References**:
```yaml
related: [[Similar Campaign]]          # See also
see-also: [[Related Concept]]         # Additional context
next: [[Sequential Campaign]]          # Suggested order
```

**Teaching Flow**:
```yaml
builds-on: [[Previous Skills]]         # Knowledge prerequisite
teaches: [[New Skill]]                # What you'll learn
leads-to: [[Next Topic]]              # Where this goes
requires: [[Tool Mastery]]            # Tool prerequisite
```

**View Relationships**:
- Breadcrumb trail appears at top of note
- Shows: Prerequisites ← **Current** → Unlocks
- Click to navigate chain

### Excalibrain Visualization

**Open**: Click brain icon or `Cmd/Ctrl + P` → "Open Excalibrain"

**Node Colors** (pre-configured):
- 🟡 **Hexagon** = Campaign
- 🟢 **Diamond** = Learning Path
- 🟣 **Star** = Achievement
- 🔵 **Circle** = Skill
- 🟢 **Square** = Tool

**Interactions**:
- **Click**: Focus on note
- **Hover**: Preview content (300 chars)
- **Drag**: Rearrange layout
- **Filter**: By relationship type or tag
- **Zoom**: Mouse wheel

**Use Cases**:
- Verify campaign prerequisites form logical chain
- Check for circular dependencies
- Identify orphaned campaigns (no connections)
- Plan learning path flow visually
- Present curriculum to stakeholders

## 📝 Creating Campaigns

### Step-by-Step

1. **New Note in Campaigns Folder**
   - Name: "Advanced Phishing Analysis"
   - Templater prompts appear

2. **Fill Template Prompts**
   ```
   Category? osint
   Difficulty? intermediate
   Estimated time? 35-45 min
   Icon emoji? 🎣
   ```

3. **Complete Sections**
   - Overview: What this campaign teaches
   - Objectives: 3-5 specific goals
   - Tools Required: List with links
   - Starter Prompt: Initial AI guidance
   - Teaching Adaptations: All 5 learning styles
   - Investigation Steps: Detailed workflow

4. **Set Relationships**
   ```yaml
   prerequisite: [[Basic-Email-Analysis]]
   unlocks: [[Social-Engineering-Campaign]]
   related: [[SOCMINT-Techniques]]
   part-of: [[OSINT-Specialist]]
   ```

5. **Save and Review**
   - Open Excalibrain
   - Verify connections
   - Check breadcrumb trail

6. **Export to App**
   ```bash
   npm run sync:campaigns -- --from-obsidian
   ```

## 🔄 Bidirectional Sync

### Obsidian → App (Primary Workflow)

**What Gets Synced**:
- Campaign metadata (frontmatter)
- Teaching adaptations (5 learning styles)
- Objectives and tools
- Learning outcomes and career paths
- Relationships (as campaign suggestions)

**Command**:
```bash
cd /path/to/atropos
npm run sync:campaigns -- --from-obsidian
```

**Output**: `client/src/config/obsidianCampaigns.ts`

**Integration**:
```typescript
// In client/src/config/agentCampaigns.ts
import { OBSIDIAN_CAMPAIGNS } from './obsidianCampaigns';

export const AGENT_CAMPAIGNS = [
  ...EXISTING_CAMPAIGNS,
  ...OBSIDIAN_CAMPAIGNS  // Add Obsidian campaigns
];
```

### App → Obsidian (Initial Population)

**Extract existing campaigns**:
```bash
npm run sync:campaigns -- --to-obsidian
```

**Manual Process** (recommended):
1. Read campaign from agentCampaigns.ts
2. Create note in Obsidian with Campaign Template
3. Copy data into template
4. Add relationships and Obsidian features

## 🎓 Managing Learning Paths

### Create Path
1. New note in `Learning-Paths/`
2. Use "Learning Path Template"
3. Fill:
   - Target roles and salary
   - Modules (link to campaigns)
   - Skills developed
   - Assessment criteria

### Link Campaigns to Paths
```markdown
## Modules

### Module 1: Corporate Intelligence
**Campaigns**: [[Shell-Corp-Investigation]]

### Module 2: Cryptocurrency
**Campaigns**: [[Cryptocurrency-Tracing]]
```

### Track Contains Relationship
```yaml
# In Learning Path frontmatter:
contains: [[Campaign1]], [[Campaign2]], [[Campaign3]]

# In Campaign frontmatter:
part-of: [[Learning Path]]
```

Excalibrain shows bidirectional containment!

## 🏆 Achievement Design

### Using Template
1. New note in `Achievements/`
2. Templater asks: category, rarity, rewards
3. Define requirement JSON:
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
4. Link related achievements
5. Export: `npm run sync:achievements -- --from-obsidian`

### Requirement Types

**stat**: Check player statistics
```json
{ "stat": "cluesFound", "value": 100, "comparison": "gte" }
```

**action**: Specific action performed
```json
{ "action": "complete_campaign", "campaignId": "shell_corp_osint" }
```

**campaign**: Campaign-based trigger
```json
{ "campaigns": ["camp1", "camp2"], "requirement": "all" }
```

**special**: Custom logic
```json
{ "trigger": "easter_egg_found", "value": "secret_code" }
```

## 💡 Power User Tips

### Dataview Dashboards

**Campaign Health Check**:
````markdown
```dataview
TABLE
  status,
  length(teachingAdaptations) as "Styles Covered",
  length(realWorldExamples) as "Examples"
FROM "Campaigns"
WHERE type = "campaign"
SORT status, name
```
````

**Learning Path Coverage**:
````markdown
```dataview
TABLE
  length(contains) as "Campaigns",
  estimatedTime as "Duration",
  targetRoles[0] as "Primary Role"
FROM "Learning-Paths"
```
````

### Templater Automation

**Create 10 Campaigns Fast**:
- Template handles metadata auto-fill
- You focus on content only
- Relationships auto-suggest from tags
- Export batch to app

### Excalibrain Filtering

**Show only beginner campaigns**:
- Filter by tag: `#beginner`
- See prerequisite chains
- Identify gaps in coverage

**Show OSINT track**:
- Filter by: `part-of: [[OSINT-Specialist]]`
- Verify progression makes sense
- Check for missing intermediate steps

### Obsidian Git Workflow

**Auto-backup**:
```
Settings → Obsidian Git
- Auto-commit: Every 10 minutes
- Commit message: "vault backup: {{date}}"
- Auto pull: On startup
- Auto push: After commit
```

**Result**: Never lose work, version history preserved

## 🔍 Advanced Queries

### Find Orphaned Campaigns
````markdown
```dataview
LIST
FROM "Campaigns"
WHERE !prerequisite AND !part-of
```
````

### Missing Teaching Adaptations
````markdown
```dataview
TABLE file.name as "Campaign"
FROM "Campaigns"
WHERE !teachingAdaptations.experiential 
   OR !teachingAdaptations.visual
   OR !teachingAdaptations.analytical
   OR !teachingAdaptations.social
   OR !teachingAdaptations.pragmatic
```
````

### Career Path Analysis
````markdown
```dataview
TABLE
  careerPaths,
  COUNT(rows) as "Campaigns"
FROM "Campaigns"
FLATTEN careerPaths
GROUP BY careerPaths
SORT COUNT(rows) DESC
```
````

## 🎯 Workflow: Offline Campaign Design

### Scenario: Working on airplane, no internet

**Before Flight**:
1. Open Obsidian vault
2. Pull latest changes (Obsidian Git)
3. Download any external references

**During Flight**:
1. Create 5 new campaigns using templates
2. Design 2 learning paths
3. Define 20 achievements
4. Set all relationships in frontmatter
5. Verify connections in Excalibrain (offline!)
6. Write teaching adaptations

**After Landing**:
1. Review changes in Git
2. Sync to app: `npm run sync:all`
3. Test in dev: `npm run dev`
4. Push to production

**Time Saved**: 3-5 hours (templating + offline work)

## 📚 Vault Maintenance

### Weekly Tasks
- [ ] Review new campaigns from team
- [ ] Check relationship integrity (Excalibrain)
- [ ] Update modified dates
- [ ] Sync to app and test
- [ ] Push changes to GitHub

### Monthly Tasks
- [ ] Audit all campaigns for completeness
- [ ] Update learning paths with new campaigns
- [ ] Review achievement unlock rates (from app analytics)
- [ ] Refactor relationships as curriculum evolves

## 🛠️ Troubleshooting

**Breadcrumbs not showing**:
- Check frontmatter syntax (valid YAML)
- Ensure relationship fields exist
- Refresh: `Cmd+P` → "Breadcrumbs: Refresh"

**Excalibrain empty**:
- Check plugins enabled
- Verify link syntax: `[[Note-Name]]`
- Reload: Close and reopen Excalibrain

**Sync fails**:
- Validate all frontmatter (yaml-lint)
- Check for TypeScript reserved words in IDs
- Ensure required fields present
- Check file encoding (UTF-8)

**Template not auto-filling**:
- Verify Templater enabled
- Check folder templates configured
- Ensure in correct folder (Campaigns/, Learning-Paths/, etc.)

---

## 🎉 Benefits

### vs Editing TypeScript Directly
- ✅ Visual relationship management (Excalibrain)
- ✅ Faster with templates (30s vs 5 min per campaign)
- ✅ Work offline (airplane, cafe, anywhere)
- ✅ Better organization (folders, tags, search)
- ✅ Easier collaboration (markdown vs code)
- ✅ Version control (Git integration)
- ✅ Preview and edit simultaneously

### vs Other Markdown Editors
- ✅ Bidirectional links (`[[Note]]` syntax)
- ✅ Graph visualization (see connections)
- ✅ Relationship hierarchy (Breadcrumbs)
- ✅ Live queries (Dataview)
- ✅ Template automation (Templater)
- ✅ Plugin ecosystem

---

**Setup Time**: 5 minutes  
**Learning Curve**: 30 minutes  
**Productivity Gain**: 300-500%  
**Recommendation**: ⭐⭐⭐⭐⭐ Essential for curriculum management

**Start Now**: Open `obsidian-vault/` in Obsidian → Create first campaign → Sync to app 🚀
