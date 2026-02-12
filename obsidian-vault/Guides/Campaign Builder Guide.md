---
type: guide
status: active
created: 2026-02-07
modified: 2026-02-07

parent: [[Guides INDEX]]
sibling:
  - [[Teaching Strategies]]
  - [[Assessment Methods]]
  - [[Corporate-Registry-Guide]]
  - [[Financial-Crime-Career-Guide]]
  - [[Blockchain-Analysis-Guide]]
  - [[Corporate-Registry-Guide]]
  - [[OSINT-Tool-Registry]]
child:
date_created: 2026-44-Mo
date_modified: 2026-19-Mo
---

# Campaign Builder Guide for Obsidian

Complete guide to building investigation campaigns in Obsidian vault with bidirectional sync to Atropos app.

## 🎯 Why Build Campaigns in Obsidian?

### Advantages Over In-App Editor

✅ **Offline-first**: Work anywhere, no internet required  
✅ **Version control**: Git integration, track all changes  
✅ **Visual relationships**: Excalibrain shows campaign hierarchy  
✅ **Powerful queries**: Dataview for campaign management  
✅ **Rich markdown**: Full markdown support, better than web editor  
✅ **Templates**: Consistent structure via Templater  
✅ **Backlinks**: See where campaign is referenced  
✅ **Fast editing**: No web UI lag, native app speed  

### Workflow Benefits

| Task | In-App | In Obsidian |
|------|--------|-------------|
| Create campaign | Click UI, fill forms | Template → Fill → Done |
| View hierarchy | Manual navigation | Excalibrain visual graph |
| Find related | Search, manual | Breadcrumbs automatic |
| Bulk edit | One at a time | Multi-file edit |
| Version history | None | Full git history |
| Offline work | No | Yes |

## 🚀 Quick Start: Your First Campaign

### Step 1: Create from Template (30 seconds)

```
1. Press: Ctrl/Cmd + P
2. Type: "Templater: Create new note from template"
3. Select: "Campaign Template"
4. Enter name: "Instagram OSINT Investigation"
5. Location: Campaigns/Intermediate/
```

Templater auto-generates:

```yaml
---
id: instagram_osint_investigation
name: Instagram OSINT Investigation
type: campaign
status: draft
created: 2026-02-07
modified: 2026-02-07
# ...
---
```

### Step 2: Define Campaign Properties (2 minutes)

```yaml
icon: "📸"
difficulty: intermediate
estimatedTime: "30-40 min"
tags:
  - SOCMINT
  - Social Media
  - Instagram
color: teal
```

### Step 3: Set Hierarchical Relationships (1 minute)

```yaml
parent: [[SOCMINT Module]]
sibling:
  - [[LinkedIn OSINT]]
  - [[Twitter Intelligence]]
child:
  - [[Advanced Instagram OSINT]]
```

**Visualize**: Open Excalibrain to see relationships

### Step 4: Define Learning Integration (3 minutes)

```yaml
learningObjectives:
  - goal: socmint
    weight: 10
    description: "Master Instagram-specific intelligence gathering"
  - goal: osint_investigation
    weight: 6
    description: "Apply OSINT to visual social platforms"
    
skillsRequired:
  - Basic OSINT
  - Understanding of social media
  
skillsTaught:
  - Instagram profile analysis
  - Geolocation from photos
  - Follower network mapping
  - Story/post timeline analysis
  
learningOutcomes:
  - Extract account metadata without following
  - Correlate Instagram accounts with other platforms
  - Analyze posting patterns and behaviors
  - Geolocate images from Instagram posts
  
industryContext: "Private investigators, law enforcement, and fraud analysts use Instagram OSINT for subject profiling, location tracking, and relationship mapping."

realWorldExamples:
  - FBI Capitol riot identifications via Instagram
  - Bellingcat war crime investigations
  - Private investigator subject location tracking

careerPaths:
  - OSINT Analyst
  - Private Investigator
  - Law Enforcement Cyber Unit
  - Social Media Analyst
```

### Step 5: Write Investigation Content (10 minutes)

```markdown
## Overview
Learn to extract intelligence from Instagram without alerting the target.

## Objectives
1. Profile the target account
2. Extract follower/following networks
3. Analyze photo metadata
4. Build timeline of activities
5. Correlate with other platforms

## Tools Required
- [[InstaLoader]]
- [[Osintgram]]
- [[ExifTool]]
- [[Instagram]] (via web browser)

## Starter Prompt
\`\`\`
I want to investigate an Instagram account: @targetuser

Help me:
1. Extract profile information without following
2. Download and analyze posted images
3. Map the account's follower network
4. Find geolocation clues from photos
5. Correlate this account with other platforms

What's the safest OSINT approach that doesn't alert the target?
\`\`\`
```

### Step 6: Write Teaching Adaptations (5 minutes)

**Critical**: Write for ALL 5 learning styles

```markdown
## Teaching Adaptations

### 🔧 Experiential Learner
Open Instagram in incognito mode. Navigate to target profile. Start clicking - view followers, check post locations, save images. Learn Instagram's interface by exploring it. Download InstaLoader and try downloading a public profile. See what data you get.

### 📊 Visual Learner
Draw the account's social graph: target in center, followers around edges, mutual connections highlighted. Create timeline visualization of posting frequency. Map photo locations on Google Maps as you discover them. Watch patterns emerge visually.

### 🔬 Analytical Learner
Study Instagram's API documentation and privacy model. Understand how data is exposed publicly vs private. Read Instagram's terms of service regarding scraping. Learn the technical limitations before investigation. Understand OAuth, rate limits, data retention.

### 👥 Social Learner
Reference Bellingcat's guide to Instagram investigations. Study OSINT Techniques book chapter on social media. Join OSINT Discord communities discussing Instagram OSINT. Share findings and techniques with peers. Learn from community case studies.

### ⚡ Pragmatic Learner
Quick workflow: Osintgram for profile scraping → InstaLoader for photo download → ExifTool for metadata extraction → Spreadsheet for analysis. One-liner: `instaloader --no-pictures --no-video-thumbnails profile targetuser`. Done.
```

### Step 7: Sync to App (30 seconds)

```bash
cd /path/to/atropos
npm run sync:campaigns

# Your campaign is now in:
# client/src/config/obsidianCampaigns.ts

npm run dev
# Visit: http://localhost:5000/campaigns
# Your campaign appears!
```

### Step 8: Test & Iterate

1. Play your campaign in app
2. Note improvements needed
3. Edit in Obsidian
4. Re-sync
5. Test again

---

## 🎨 Advanced Campaign Design

### Multi-Step Campaigns with Child Notes

**Structure**:

```
Instagram OSINT Investigation (parent)
├── Step 1: Profile Analysis (child)
├── Step 2: Network Mapping (child)
├── Step 3: Content Analysis (child)
└── Step 4: Cross-Platform Correlation (child)
```

**Implementation**:

**Main Campaign** (`Instagram OSINT Investigation.md`):

```yaml
child:
  - [[Step 1 Profile Analysis]]
  - [[Step 2 Network Mapping]]
  - [[Step 3 Content Analysis]]
  - [[Step 4 Cross-Platform]]
```

**Each Step** (`Step 1 Profile Analysis.md`):

```yaml
---
parent: [[Instagram OSINT Investigation]]
sibling:
  - [[Step 2 Network Mapping]]
  - [[Step 3 Content Analysis]]
---

# Step 1: Profile Analysis

## Goal
Extract all public information from target profile

## Tools
- Osintgram
- Web browser (incognito)

## Procedure
1. ...
2. ...
```

**Benefit**: Fine-grained control, reusable steps, clear progression

### Branching Campaigns (Decision Trees)

**Scenario**: Campaign adapts based on findings

**Structure**:

```
Phishing Investigation (parent)
├── Path A: Email Header Analysis (child)
├── Path B: Domain Investigation (child)
└── Path C: Malware Analysis (child)
```

**Use conditional** `child` assignments:

```yaml
child:
  - [[Path A Email Headers]] # If email-based phishing
  - [[Path B Domain Investigation]] # If website phishing
  - [[Path C Malware Analysis]] # If attachment phishing
```

In campaign content:

```markdown
## Investigation Branches

Based on phishing type, follow appropriate path:
- **Email phishing**: [[Path A Email Headers]]
- **Website phishing**: [[Path B Domain Investigation]]
- **Attachment phishing**: [[Path C Malware Analysis]]
```

### Campaign Series (Sibling Chains)

**Structure**: Progressive difficulty in same topic

```
Basic Instagram OSINT (beginner)
├── sibling: [[Intermediate Instagram OSINT]]
└── child: [[Intermediate Instagram OSINT]]

Intermediate Instagram OSINT
├── parent: [[Basic Instagram OSINT]]
├── sibling: [[Advanced Instagram OSINT]]
└── child: [[Advanced Instagram OSINT]]

Advanced Instagram OSINT
├── parent: [[Intermediate Instagram OSINT]]
└── sibling: null
```

**Navigation**: Breadcrumbs shows progression trail automatically

---

## 🔗 Relationship Design Patterns

### Pattern 1: Linear Progression

**Use When**: Clear skill building sequence

```
Module A
└── child:
    ├── Campaign 1 (beginner)
    │   └── child: Campaign 2 (intermediate)
    │       └── child: Campaign 3 (advanced)
```

**Example**: Passive Recon → Active Recon → Full Pentest

### Pattern 2: Parallel Specializations

**Use When**: Multiple valid paths at same level

```
OSINT Module
└── child:
    ├── SOCMINT Campaign
    ├── Geolocation Campaign
    ├── Financial OSINT Campaign
    └── Technical OSINT Campaign
    (all siblings to each other)
```

**Example**: Different OSINT specializations, learn in any order

### Pattern 3: Prerequisite Tree

**Use When**: Multiple prerequisites for advanced campaign

```
        Advanced Campaign
             ↑ parent
    ┌────────┼────────┐
    child    child    child
    ↓        ↓        ↓
  Camp A   Camp B   Camp C
  (siblings to each other)
```

**Example**: Advanced Threat Hunting requires: Malware, Network, OSINT basics

### Pattern 4: Modular Building Blocks

**Use When**: Reusable components across campaigns

```
Phishing Campaign
└── child:
    ├── Email Headers Module
    ├── Domain Analysis Module
    └── Link Analysis Module
    (can be reused in other campaigns)
```

---

## 🎓 Teaching Adaptation Guidelines

### Writing for Experiential Learners

**Do**:

- Start with action: "Open the tool..."
- Use command examples
- Encourage exploration
- Allow mistakes

**Don't**:

- Long theory explanations upfront
- Passive reading
- Warn against all errors

**Example**:

```
Try this command: `instaloader profile targetuser`

See what happens. You'll get a folder with data. Explore it. 
What files were created? What data is in them? 

Now try: `instaloader --help`

Learn by experimenting.
```

### Writing for Visual Learners

**Do**:

- Use ASCII diagrams
- Describe visual relationships
- Reference map/graph tools
- Paint mental pictures

**Don't**:

- Walls of text
- Abstract descriptions
- No visual anchors

**Example**:

```
Draw the network as you discover it:

       Target Account
            |
    ┌───────┼───────┐
    ↓       ↓       ↓
Follower1 Follower2 Follower3
    |       |       |
    └───────┼───────┘
         Common
        Follower

This shows: Target has 3 followers, who all follow each other.
Tight-knit group → possible coordinated behavior.
```

### Writing for Analytical Learners

**Do**:

- Explain why before how
- Reference documentation
- Technical deep dives
- Framework context

**Don't**:

- Skip theory
- Just give commands
- Assume understanding

**Example**:

```
Instagram uses a REST API with OAuth 2.0. Public profiles expose 
certain fields without authentication:
- Username, display name, bio
- Public post count
- Profile picture URL
- Verified status

But NOT:
- Follower list (requires auth)
- Story views
- Private posts

Understanding these API limitations shapes our OSINT approach...
```

### Writing for Social Learners

**Do**:

- Reference community resources
- Link to writeups and blogs
- Mention discussions
- Collaborative approaches

**Don't**:

- Isolate the learner
- Ignore community wisdom
- Skip case studies

**Example**:

```
The OSINT community has documented Instagram investigation extensively:

- Bellingcat's guide: [link]
- OSINT Curious episode on SOCMINT
- Reddit r/OSINT discussions
- Twitter #OSINT community tips

Join the Discord and ask: "What Instagram tools do you recommend?"

Learn from others' experiences before reinventing the wheel.
```

### Writing for Pragmatic Learners

**Do**:

- One-liners and scripts
- Automation examples
- Efficiency tips
- Quick wins

**Don't**:

- Long explanations
- Theory dumps
- Slow methods

**Example**:

```
Fast Instagram OSINT workflow:

1. Profile scrape: `osintgram -u targetuser -c info followers following`
2. Photo download: `instaloader --fast-update profile targetuser`
3. Metadata extract: `exiftool -r -csv targetuser/*.jpg > metadata.csv`
4. Analyze in Excel

Total time: 5 minutes.
Automate with bash script if doing multiple accounts.
```

---

## 🧪 Testing Campaigns Before Sync

### 1. Self-Test

**Ask yourself**:

- [ ] Can I complete this investigation with the tools listed?
- [ ] Are objectives clear and achievable?
- [ ] Is the starter prompt helpful?
- [ ] Did I write all 5 teaching adaptations?
- [ ] Are real-world examples relevant?
- [ ] Do career paths make sense?

### 2. Peer Review

Share with another educator:

- Can they follow the campaign?
- Is difficulty rating accurate?
- Are time estimates realistic?
- Teaching adaptations helpful?

### 3. Pilot Test

Before full rollout:

1. Sync to app (test instance)
2. Complete investigation yourself
3. Time yourself
4. Note friction points
5. Revise in Obsidian
6. Re-sync and test again

---

## 📊 Campaign Management Queries

### View All Your Drafts

```dataview
TABLE difficulty, estimatedTime, tags
FROM "Campaigns"
WHERE status = "draft"
SORT modified DESC
```

### Find Campaigns Needing Review

```dataview
LIST
FROM "Campaigns"
WHERE !learningObjectives OR length(learningObjectives) = 0
```

### Campaigns by Difficulty

```dataview
TABLE length(rows) as Count
FROM "Campaigns"
GROUP BY difficulty
SORT difficulty ASC
```

### Most Referenced Campaigns

```dataview
TABLE 
  length(file.inlinks) as "Inbound Links",
  length(child) as "Child Steps"
FROM "Campaigns"
SORT length(file.inlinks) DESC
LIMIT 10
```

---

## 🔄 Sync Workflow

### Daily Routine

**Morning**: Import app changes (if team is working)

```bash
npm run sync:to-obsidian
```

**During Day**: Edit in Obsidian

- Create new campaigns
- Update existing ones
- Reorganize with Excalibrain
- Use Git commits frequently

**Evening**: Export to app

```bash
npm run sync:from-obsidian
npm run dev  # Test
git add . && git commit -m "content: add 2 campaigns"
git push
```

### Conflict Resolution

**If sync fails**:

1. Check frontmatter YAML is valid
2. Ensure status is "active" not "draft"
3. Verify all required fields present
4. Check parent/child links exist
5. Run with verbose flag: `tsx script/sync-obsidian.ts campaigns:from-obsidian --verbose`

**If app and vault diverge**:

1. Decide source of truth (usually Obsidian)
2. Export app to vault: `npm run sync:to-obsidian`
3. Manually merge conflicts
4. Sync back: `npm run sync:from-obsidian`

---

## 🎯 Campaign Quality Checklist

Before marking status as "active":

### Content Quality

- [ ] Clear, actionable objectives
- [ ] Realistic time estimate (test it!)
- [ ] All tools documented
- [ ] Starter prompt is helpful
- [ ] Investigation steps logical
- [ ] Expected findings documented

### Learning Integration

- [ ] Learning objectives map to curriculum
- [ ] Skills required are prerequisites
- [ ] Skills taught are outcomes
- [ ] Learning outcomes specific and measurable
- [ ] Industry context explains relevance
- [ ] Real-world examples are actual incidents
- [ ] Career paths list real job titles

### Teaching Adaptations

- [ ] All 5 styles have unique content
- [ ] Experiential: Hands-on, action-oriented
- [ ] Visual: Describes diagrams/visualizations
- [ ] Analytical: Theory and documentation
- [ ] Social: Community resources
- [ ] Pragmatic: Quick workflows
- [ ] Each is 2-4 sentences minimum

### Metadata Compliance

- [ ] Parent assigned correctly
- [ ] Siblings identified (if any)
- [ ] Child set (if multi-step)
- [ ] ID matches filename slug
- [ ] Tags from approved list
- [ ] Difficulty matches content
- [ ] Status set appropriately

### Technical

- [ ] YAML syntax valid
- [ ] Wiki links resolve
- [ ] No circular references
- [ ] Visualized in Excalibrain
- [ ] Tested in app (after sync)

---

## 💡 Pro Tips

### 1. Use Dataview for Batch Operations

Find all campaigns missing teaching adaptations:

```dataview
LIST
FROM "Campaigns"
WHERE status = "active" AND 
  (!contains(file.content, "### 🔧 Experiential") OR
   !contains(file.content, "### 📊 Visual"))
```

### 2. Template Variations

Create specialized templates:

- `Campaign Template - OSINT.md`
- `Campaign Template - Network.md`
- `Campaign Template - Malware.md`

Each pre-fills common fields for that domain.

### 3. Keyboard Shortcuts

Set in Obsidian Settings → Hotkeys:

- "Create from Campaign Template": `Ctrl+Shift+C`
- "Open in Excalibrain": `Ctrl+Shift+E`
- "Sync to app": External command via script

### 4. Daily Notes for Planning

Template: `Templates/Daily Note Template.md`

```markdown
---
date: <% tp.date.now("YYYY-MM-DD") %>
---

# <%= tp.date.now("dddd, MMMM DD, YYYY") %>

## Content Tasks
- [ ] Create campaign X
- [ ] Review campaign Y
- [ ] Update path Z

## Campaigns in Progress
```dataview
LIST
FROM "Campaigns"
WHERE status = "draft"
```

## Sync Log

-

```

### 5. Version Control Best Practices

**.gitignore**:
```

.obsidian/workspace*
.obsidian/workspace.json
.trash/

```

**Commit messages**:
```

content: add Instagram OSINT campaign
content: update 3 campaigns with teaching adaptations
fix: correct parent relationships in SOCMINT module
refactor: reorganize campaign hierarchy

```

**Branch strategy**:
- `main`: Stable, synced campaigns
- `draft-campaigns`: Work in progress
- `experimental`: Testing new structures

---

## 🆘 Troubleshooting

### "Templater not filling fields"
**Solution**: Check Templater settings → Enable trigger on file creation

### "Breadcrumbs not showing relationships"
**Solution**: Use only parent/sibling/child, ensure [[links]] exist

### "Excalibrain shows broken connections"
**Solution**: Check wiki links point to existing notes

### "Sync failed: invalid YAML"
**Solution**: Validate frontmatter, check quotes on special characters

### "Campaign not in app after sync"
**Solution**: Check status is "active", re-run sync with --verbose

### "Modified date not updating"
**Solution**: Add Templater command: `<% tp.date.now("YYYY-MM-DD") %>`

---

## 📚 Examples & References

### Complete Campaign Example

See: `Campaigns/Examples/Passive Reconnaissance.md` (created from app export)

### Learning Path Example

See: `Learning-Paths/OSINT Specialist Path.md`

### Achievement Example

See: `Achievements/Discovery/First Steps.md`

---

## 🎉 You're Ready!

With this guide, you can:
- ✅ Build campaigns entirely in Obsidian
- ✅ Work offline, sync when ready
- ✅ Visualize with Excalibrain
- ✅ Navigate with Breadcrumbs
- ✅ Query with Dataview
- ✅ Version control with Git
- ✅ Export to app bidirectionally

**Start creating!** Your next campaign begins with `Ctrl/Cmd + P` → "Templater"

---

**Guide Version**: 1.0  
**Last Updated**: 2026-02-07  
**Maintained By**: Education Team  
**Questions**: Open issue in atropos repo
