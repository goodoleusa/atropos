---
title: Atropos Education Management Hub
type: index
cssclass: dashboard
---

# 🎓 Atropos Education Management Vault

> **Your offline education management system for Atropos curriculum and campaign design**

## 🚀 Quick Navigation

### 📚 Curriculum
- [[Experiential-Learning-Framework]] - Core philosophy and structure

### 🎯 Campaigns (23 Total)
**Beginner**:
- [[Passive-Reconnaissance]]
- [[Basic-OSINT-Investigation]]

**Intermediate**:
- [[Shell-Corp-Investigation]]
- [[Active-Reconnaissance]]
- [[Phishing-Analysis]]

**Advanced**:
- [[BGP-Route-Tracing]]
- [[Dark-Web-Intelligence]]
- [[Cryptocurrency-Tracing]]
- [[Threat-Hunting]]

**Expert**:
- [[Incident-Response]]
- [[APT-Attribution]]

### 🛤️ Learning Paths
- [[Financial-Crime-Investigator]] - Corporate + crypto investigation
- [[Threat-Intelligence-Analyst]] - APT tracking + dark web
- [[OSINT-Specialist]] - Multi-discipline OSINT
- [[Security-Researcher]] - Bug bounty + pentesting

### 🏆 Achievements
- [[Achievement-Definitions]] - All 515 achievements
- [[Achievement-Categories]] - Discovery, Speed, Mastery, Social, Special

### 🔧 Tools
- [[OSINT-Tool-Registry]]
- [[Blockchain-Analysis-Tools]]
- [[Corporate-Research-Tools]]

## 📊 Vault Statistics

```dataview
TABLE
  length(file.inlinks) as "Backlinks",
  length(file.outlinks) as "Links",
  file.mtime as "Modified"
FROM "Campaigns"
SORT file.mtime DESC
LIMIT 10
```

## 🎯 Campaign Status

```dataview
TABLE status, difficulty, estimatedTime
FROM "Campaigns"
WHERE type = "campaign"
GROUP BY status
```

## 🔗 Relationship Graph

Open **Excalibrain** (brain icon) to see:
- Campaign prerequisites and progressions
- Learning path connections
- Achievement unlocks
- Tool relationships

## 🛠️ Workflows

### Create New Campaign
1. Go to `Campaigns/` folder
2. Create new note (Templater auto-fills)
3. Answer prompts (difficulty, time, etc.)
4. Fill teaching adaptations for 5 learning styles
5. Set relationships (prerequisite, unlocks, related)
6. Save and sync: `npm run sync:campaigns -- --from-obsidian`

### Edit Learning Path
1. Open path in `Learning-Paths/`
2. Add/remove campaign links: `[[Campaign-Name]]`
3. Update relationships
4. View in Excalibrain to verify flow
5. Sync when ready

### Design Achievement
1. Use Achievement Template
2. Define requirement JSON
3. Set XP/currency rewards
4. Link related achievements
5. Export to app

## 🔄 Sync Commands

```bash
# Export campaigns from Obsidian → App
npm run sync:campaigns -- --from-obsidian

# Export learning paths
npm run sync:paths -- --from-obsidian

# Export achievements
npm run sync:achievements -- --from-obsidian

# Full sync
npm run sync:all
```

## 📝 Templates

Located in `Templates/`:
- **Campaign Template** - Full investigation workflow
- **Learning Path Template** - Career track structure
- **Achievement Template** - Unlock condition + rewards

Use: `Cmd/Ctrl + P` → "Templater: Create new note from template"

## 🎨 Visual Tools

### Excalibrain
- Hexagon (🟡) = Campaign
- Diamond (🟢) = Learning Path
- Star (🟣) = Achievement
- Circle (🔵) = Skill
- Square (🟢) = Tool

### Breadcrumbs
Shows: prerequisite → this → unlocks chain

### Graph View
See all connections between notes

## 📊 Queries & Reports

### Campaigns by Difficulty
````markdown
```dataview
LIST
FROM "Campaigns"
WHERE difficulty = "beginner"
```
````

### Track Completion
````markdown
```dataview
TABLE status, COUNT(rows) as "Count"
FROM "Campaigns"
GROUP BY status
```
````

### Career Path Mapping
````markdown
```dataview
TABLE careerPaths, difficulty
FROM "Campaigns"
FLATTEN careerPaths
WHERE careerPaths
```
````

## 🎯 Current Focus

**Campaign Updates Needed**: 18 of 23  
**Learning Paths Complete**: 4 of 10  
**Achievement Definitions**: 515 ready

---

**Last Sync**: Check git log  
**Vault Version**: 1.0  
**App Compatibility**: Atropos v2.0+

**Workflow**: Edit Here → Sync → Deploy → Teach 🚀
