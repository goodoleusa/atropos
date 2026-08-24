# Local Workflow for Atropos Education Management

Your complete day-to-day workflow for managing Atropos content with the Obsidian vault.

## 🎯 The Setup

```
Your Computer
├── atropos/                    # Main repo (clone this)
│   ├── obsidian-vault/         # Your Obsidian workspace ← WORK HERE
│   │   ├── Campaigns/
│   │   ├── Learning-Paths/
│   │   ├── Templates/
│   │   └── ...
│   ├── client/                 # React app
│   ├── server/                 # Express API
│   ├── script/
│   │   └── sync-obsidian.ts    # Sync tool
│   └── ...
└── (rest of your files)
```

**Key Point**: The vault is **inside the atropos repo** at `obsidian-vault/`. It's tracked by git along with the app code.

---

## 🔄 Your Daily Workflow

### Morning Routine (2 minutes)

**1. Pull Latest Changes**
```bash
cd ~/atropos  # Or wherever you cloned it
git pull origin main
```

**2. Open Obsidian Vault**
```bash
# macOS:
open -a Obsidian obsidian-vault

# Linux:
obsidian obsidian-vault

# Windows:
start obsidian://open?path=%cd%\obsidian-vault

# Or in Obsidian app:
# File → Open vault → Select: ~/atropos/obsidian-vault
```

**3. (Optional) Let Obsidian Git Auto-Pull**
- If you installed Obsidian Git plugin
- It will auto-pull every 5 minutes
- You don't have to manually pull

---

### During the Day (Work Phase)

**Edit in Obsidian** (no terminal needed!):

**Create Campaign**:
```
1. Ctrl/Cmd+P
2. "Templater: Create new note from template"
3. Select: "Campaign Template"
4. Name: "My New Campaign"
5. Fill out:
   - Frontmatter (difficulty, tags, parent/sibling/child)
   - Objectives
   - Tools
   - Teaching adaptations (all 5 styles!)
6. Save (Ctrl/Cmd+S)
```

**Edit Existing**:
```
1. Open campaign note
2. Edit content
3. Update modified: date
4. Save
```

**Visualize Structure**:
```
- Open Excalibrain (left sidebar icon)
- See your campaign in curriculum graph
- Verify parent/child relationships
- Navigate visually
```

**Query Your Content**:
```
- Use Dataview queries in notes
- Find drafts, orphans, incomplete content
- Track statistics
```

**Auto-Commit** (if Obsidian Git installed):
- Commits every 10 minutes automatically
- You don't have to think about git!

---

### Evening Routine (5-10 minutes)

**1. Review Your Changes**
```
In Obsidian:
- Ctrl/Cmd+P → "Obsidian Git: Open source control view"
- See what you changed today
- Or skip if auto-commit handled it
```

**2. Sync to App**
```bash
# In terminal, from atropos directory:
cd ~/atropos

# Sync campaigns to app
npm run sync:campaigns

# Or sync everything:
npm run sync:from-obsidian
```

**Output**:
```
✅ Processed: My New Campaign (intermediate)
✅ Synced 1 campaign to client/src/config/obsidianCampaigns.ts
```

**3. Test in App** (important!)
```bash
npm run dev
# Visit: http://localhost:5000/campaigns
# Find your new campaign
# Play through it
# Verify it works correctly
```

**4. Commit to Git** (if needed)
```bash
# If Obsidian Git didn't auto-commit or you want custom message:
git add obsidian-vault/
git add client/src/config/obsidianCampaigns.ts  # Synced file
git commit -m "content: add My New Campaign with SOCMINT focus"
```

**5. Push to Remote**
```bash
git push origin main
```

**Done!** Your campaign is now:
- ✅ In Obsidian vault (source)
- ✅ In app code (synced)
- ✅ In git history (versioned)
- ✅ On GitHub (backed up)

---

## 🔀 Workflow Variations

### Option A: Obsidian Git Handles Everything (Easiest!)

**Setup** (one time):
```
1. Install Obsidian Git plugin
2. Settings → Obsidian Git:
   - Auto-commit: Every 10 min
   - Auto-push: ON
   - Auto-pull: Every 5 min
```

**Your Workflow**:
```
Morning:  Open Obsidian (auto-pulls changes)
Day:      Edit campaigns (auto-commits every 10 min)
Evening:  npm run sync:from-obsidian (export to app)
          npm run dev (test)
          git add client/src/config/obsidian*.ts
          git commit -m "content: sync campaigns from vault"
          git push
```

**Benefits**: Never think about vault commits, only app commits

### Option B: Manual Git Control (More Control)

**Your Workflow**:
```
Morning:  git pull origin main (in atropos dir)
          Open Obsidian vault
          
Day:      Edit campaigns
          Save in Obsidian
          
Evening:  cd ~/atropos
          git status (see what changed)
          git diff obsidian-vault/ (review changes)
          npm run sync:from-obsidian (export to app)
          npm run dev (test)
          git add -A
          git commit -m "content: add 2 campaigns, update 1 path"
          git push origin main
```

**Benefits**: Full control, custom commit messages, review before commit

### Option C: Separate Vault Repo (Advanced)

**Setup** (if you want vault in separate repo):
```bash
# Move vault to separate location
mv obsidian-vault ~/Documents/atropos-vault

# Create symlink in main repo
ln -s ~/Documents/atropos-vault obsidian-vault

# Or update VAULT_PATH in script/sync-obsidian.ts:
const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || 'obsidian-vault';
```

**Then use**:
```bash
export OBSIDIAN_VAULT_PATH=~/Documents/atropos-vault
npm run sync:campaigns
```

**Benefits**: Vault and app can have separate git histories, separate collaborators

---

## 📍 Where Everything Lives

### On Your Computer

```
~/atropos/                              # Git repo (clone of GitHub)
├── obsidian-vault/                     # ← EDIT HERE in Obsidian
│   ├── Campaigns/
│   │   └── My Campaign.md              # Your source files
│   ├── Learning-Paths/
│   ├── Templates/
│   └── .git/                           # Can be separate git repo
├── client/
│   └── src/config/
│       ├── agentCampaigns.ts           # Original campaigns
│       └── obsidianCampaigns.ts        # ← GENERATED by sync script
├── server/
│   └── seed/
│       └── obsidianAchievements.ts     # ← GENERATED by sync script
└── script/
    └── sync-obsidian.ts                # Sync tool
```

### Sync Flow

```
1. EDIT:   obsidian-vault/Campaigns/My Campaign.md
           ↓
2. SYNC:   npm run sync:campaigns
           ↓
3. GENERATES: client/src/config/obsidianCampaigns.ts
           ↓
4. IMPORT:  In agentCampaigns.ts: import { OBSIDIAN_CAMPAIGNS } from './obsidianCampaigns'
           ↓
5. MERGE:   export const AGENT_CAMPAIGNS = [...EXISTING, ...OBSIDIAN_CAMPAIGNS]
           ↓
6. APP:     npm run dev → Campaign appears at /campaigns
```

---

## 🔄 Complete Git Workflow

### Scenario 1: Solo Work

```bash
# Morning
cd ~/atropos
git pull origin main
open -a Obsidian obsidian-vault

# During day (in Obsidian)
# - Edit campaigns
# - Obsidian Git auto-commits
# - Keep working

# Evening
cd ~/atropos
npm run sync:from-obsidian          # Export vault → app
npm run dev                         # Test
git add -A                          # Stage everything
git commit -m "content: add 3 campaigns from vault"
git push origin main                # Push to GitHub

# Done! Changes backed up on GitHub
```

### Scenario 2: Team Collaboration

**Person A** (Morning):
```bash
git pull origin main                # Get Person B's changes
open -a Obsidian obsidian-vault     # Open vault
# Obsidian Git auto-pulls changes from Person B
```

**Person A** (Work):
```
Edit Campaign 1 in Obsidian
Obsidian Git auto-commits locally
```

**Person A** (Evening):
```bash
npm run sync:from-obsidian          # Export to app
npm run dev                         # Test
git add -A
git commit -m "content: Person A - updated Campaign 1"
git push origin main                # Share with team
```

**Person B** (Next day):
```bash
git pull origin main                # Gets Person A's campaign
open -a Obsidian obsidian-vault
# Obsidian Git auto-pulls
# Person B sees Campaign 1 with Person A's updates!
```

### Scenario 3: Working Offline (Plane/Train)

**Before Going Offline**:
```bash
cd ~/atropos
git pull origin main                # Get latest
open -a Obsidian obsidian-vault     # Open vault
```

**While Offline** (no internet):
```
In Obsidian:
- Create 5 new campaigns
- Edit 3 learning paths
- Design 10 achievements
- Visualize in Excalibrain
- Obsidian Git commits locally (no push, but saves)
```

**When Back Online**:
```bash
cd ~/atropos
npm run sync:from-obsidian          # Export to app
npm run dev                         # Test locally
git add -A
git commit -m "content: 5 campaigns created offline"
git push origin main                # Sync to GitHub
```

**Your offline work is now live!**

---

## 📂 Recommended Folder Locations

### Option 1: Vault Inside Repo (Current Setup) ✅ RECOMMENDED

**Location**: `~/atropos/obsidian-vault/`

**Pros**:
- ✅ Single git repo (simple)
- ✅ Sync scripts work immediately
- ✅ Everything in one place
- ✅ Easy backup (one repo)

**Cons**:
- ⚠️ Vault and app share git history
- ⚠️ Large repo if many campaigns

**Best for**: Solo work, small teams, getting started

### Option 2: Vault as Separate Repo

**Location**: `~/Documents/atropos-vault/` (anywhere you want!)

**Setup**:
```bash
# Move vault to preferred location
mv ~/atropos/obsidian-vault ~/Documents/atropos-vault

# Create symlink in repo
cd ~/atropos
ln -s ~/Documents/atropos-vault obsidian-vault

# Or set environment variable
echo 'export ATROPOS_VAULT_PATH=~/Documents/atropos-vault' >> ~/.bashrc
```

**Update sync script** to use environment variable:
```typescript
// In script/sync-obsidian.ts (line 8)
const VAULT_PATH = process.env.ATROPOS_VAULT_PATH || 'obsidian-vault';
```

**Then sync with**:
```bash
ATROPOS_VAULT_PATH=~/Documents/atropos-vault npm run sync:campaigns
```

**Pros**:
- ✅ Vault has separate git history
- ✅ Can have different collaborators
- ✅ Easier to move/backup vault independently

**Cons**:
- ⚠️ Need to set env variable or symlink
- ⚠️ Two repos to manage

**Best for**: Large teams, content-heavy setups, separate content team

### Option 3: Synced Folder (Cloud Backup)

**Location**: `~/Dropbox/atropos-vault/` or `~/Google Drive/atropos-vault/`

**Setup**:
```bash
# Create vault in synced folder
mkdir -p ~/Dropbox/atropos-vault

# Copy vault there
cp -r ~/atropos/obsidian-vault/* ~/Dropbox/atropos-vault/

# Symlink in repo
cd ~/atropos
rm -rf obsidian-vault
ln -s ~/Dropbox/atropos-vault obsidian-vault
```

**Pros**:
- ✅ Automatic cloud backup
- ✅ Access from multiple devices
- ✅ No manual git needed for vault

**Cons**:
- ⚠️ Sync conflicts possible
- ⚠️ Depends on cloud service

**Best for**: Multi-device work, automatic backup needs

---

## ✅ Recommended Setup (What You Have Now)

**Location**: `~/atropos/obsidian-vault/` (inside repo)

### Your Workflow

**📍 WHERE YOU WORK**:
```
1. Open Obsidian app
2. Open vault: ~/atropos/obsidian-vault
3. Edit campaigns, paths, achievements
4. Save (Obsidian Git auto-commits)
```

**📤 HOW YOU SYNC TO APP**:
```bash
# In terminal (from ~/atropos directory):
npm run sync:from-obsidian

# This reads:  obsidian-vault/Campaigns/*.md
# This writes: client/src/config/obsidianCampaigns.ts
```

**🧪 HOW YOU TEST**:
```bash
npm run dev
# Visit: http://localhost:5000/campaigns
# Your campaigns appear!
```

**💾 HOW YOU BACKUP**:
```bash
# From ~/atropos directory:
git add -A
git commit -m "content: updated campaigns from vault"
git push origin main

# Now backed up on GitHub!
```

---

## 📅 Daily Workflow Example

### Scenario: Adding a New Campaign

**9:00 AM - Start Work**
```bash
cd ~/atropos
git pull origin main  # Get latest from team/other devices
```

**9:05 AM - Open Obsidian**
```bash
open -a Obsidian obsidian-vault
# Obsidian Git auto-pulls (if installed)
```

**9:10 AM - 10:00 AM - Create Campaign**
```
In Obsidian:
1. Ctrl/Cmd+P → "Templater: Campaign Template"
2. Name: "Instagram OSINT Investigation"
3. Fill frontmatter:
   parent: [[SOCMINT Module]]
   sibling: [[LinkedIn OSINT]], [[Twitter Intel]]
   difficulty: intermediate
   tags: [SOCMINT, Instagram]
   
4. Write objectives, tools, starter prompt
5. Write all 5 teaching adaptations
6. Save
7. Obsidian Git auto-commits (after 10 min)
```

**10:00 AM - Visualize**
```
- Open Excalibrain
- See campaign in curriculum graph
- Verify relationships
- Check for gaps/orphans
```

**10:30 AM - Sync to App**
```bash
# In terminal:
cd ~/atropos
npm run sync:campaigns

Output:
✅ Processed: Instagram OSINT Investigation (intermediate)
✅ Synced 1 campaign to client/src/config/obsidianCampaigns.ts
```

**10:35 AM - Test**
```bash
npm run dev

# In browser:
http://localhost:5000/campaigns
# Find: Instagram OSINT Investigation
# Click: Start Investigation
# Test: Complete investigation with AI agent
# Verify: Works as expected
```

**10:50 AM - Commit & Push**
```bash
# Still in ~/atropos:
git status
# Shows:
#   modified: obsidian-vault/Campaigns/Instagram OSINT Investigation.md
#   modified: client/src/config/obsidianCampaigns.ts

git add -A
git commit -m "content: add Instagram OSINT campaign to SOCMINT module"
git push origin main
```

**Done!** Campaign is now:
- ✅ In your local vault (~/atropos/obsidian-vault/)
- ✅ In app code (~/atropos/client/src/config/)
- ✅ In git history (backed up)
- ✅ On GitHub (shared with team)
- ✅ Live in app (playable)

---

## 🔁 Sync Command Reference

### From Obsidian TO App

```bash
# Run these from ~/atropos directory:

# Sync specific content type:
npm run sync:campaigns          # Campaigns only
npm run sync:achievements       # Achievements only
npm run sync:learning-paths     # Learning paths only

# Sync everything:
npm run sync:from-obsidian      # All content types

# What happens:
# Reads:  obsidian-vault/**/*.md (your edits)
# Parses: Frontmatter + content
# Writes: client/src/config/obsidian*.ts (TypeScript)
# Status: Ready to use in app
```

### From App TO Obsidian

```bash
# Export existing app content to vault:
npm run sync:to-obsidian

# Use case: Initial setup or importing others' work

# What happens:
# Reads:  client/src/config/agentCampaigns.ts
# Writes: obsidian-vault/Campaigns/*.md (one per campaign)
# Status: Ready to edit in Obsidian
```

---

## 📍 File Locations Cheatsheet

### Your Working Files (Edit These!)

```
~/atropos/obsidian-vault/
├── Campaigns/
│   └── Your Campaign.md              ← EDIT in Obsidian
├── Learning-Paths/
│   └── Your Path.md                  ← EDIT in Obsidian
└── Achievements/
    └── Your Achievement.md           ← EDIT in Obsidian
```

### Generated Files (Don't Edit Manually!)

```
~/atropos/client/src/config/
├── agentCampaigns.ts                 ← Original campaigns (hand-coded)
├── obsidianCampaigns.ts              ← GENERATED by sync script
└── learningConfig.ts                 ← Learning goals/styles

~/atropos/server/seed/
└── obsidianAchievements.ts           ← GENERATED by sync script
```

**Rule**: 
- ✅ Edit in `obsidian-vault/`
- ❌ Don't edit `obsidian*.ts` files (they get overwritten by sync)
- ✅ Merge in `agentCampaigns.ts`: `[...EXISTING, ...OBSIDIAN_CAMPAIGNS]`

---

## 🛡️ Backup Strategy

### What Gets Backed Up

**Obsidian Vault** (your source):
- ✅ Tracked by git in main repo
- ✅ Pushed to GitHub
- ✅ Full version history
- ✅ Obsidian Git auto-commits

**Generated Files** (app code):
- ✅ Also tracked by git
- ✅ Can regenerate from vault anytime with sync command

**App Database** (player data):
- ⚠️ Separate (PostgreSQL)
- Need database backups separately

### Backup Checklist

**Daily** (Automatic if Obsidian Git enabled):
- Auto-commit every 10 min
- Auto-push to remote

**Weekly** (Manual):
```bash
cd ~/atropos
git log obsidian-vault/ --oneline -10  # Review recent changes
git tag vault-backup-$(date +%Y%m%d)   # Tag backup point
git push origin --tags                 # Push tags
```

**Before Major Changes**:
```bash
# Create backup branch
git checkout -b vault-backup-before-refactor
git push origin vault-backup-before-refactor
git checkout main

# Now safe to make major changes
```

---

## 🤝 Team Collaboration

### Multi-Person Workflow

**Person A** creates campaign:
```
1. git pull origin main
2. Edit in Obsidian: "Campaign A"
3. Obsidian Git commits
4. npm run sync:from-obsidian
5. git add -A && git commit -m "content: Person A - Campaign A"
6. git push origin main
```

**Person B** gets it:
```
1. git pull origin main  # Gets Person A's work
2. Open Obsidian
3. Obsidian Git auto-pulls
4. Sees: "Campaign A" in vault
5. Can edit or create "Campaign B"
```

**Merge Workflow**:
```
If Person A and B edit simultaneously:
1. Person A pushes first: git push origin main
2. Person B pulls: git pull origin main
3. If conflicts: Resolve in vault/*.md files
4. Person B pushes: git push origin main
5. Both sync: npm run sync:from-obsidian
```

---

## 💡 Pro Tips

### Tip 1: Use Obsidian Git Plugin

**Why**: Automatic commits, never lose work

**Setup**:
```
Settings → Obsidian Git
- Auto-commit: 10 min
- Auto-push: ON (if always online)
- Auto-pull: 5 min
- Commit message: "vault: {{date}} {{numFiles}} files"
```

**Benefit**: Work in Obsidian, forget about git!

### Tip 2: Separate Branches for Experiments

```bash
# Try new curriculum structure
git checkout -b vault-experiment
# Edit in Obsidian
# Sync and test
# If good: git checkout main && git merge vault-experiment
# If bad: git checkout main (discard experiment)
```

### Tip 3: Use npm Scripts

**Add to your shell**:
```bash
# In ~/.bashrc or ~/.zshrc:
alias vault-sync='cd ~/atropos && npm run sync:from-obsidian'
alias vault-test='cd ~/atropos && npm run dev'
alias vault-commit='cd ~/atropos && git add -A && git commit -m "content: vault update"'

# Then use:
vault-sync   # Quick sync
vault-test   # Quick test
vault-commit # Quick commit
```

### Tip 4: Watch Mode (Advanced)

```bash
# Auto-sync on vault changes
npm install --save-dev chokidar-cli

# Add to package.json:
"vault:watch": "chokidar 'obsidian-vault/**/*.md' -c 'npm run sync:from-obsidian'"

# Run:
npm run vault:watch

# Now every save in Obsidian auto-syncs to app!
```

### Tip 5: Pre-Commit Hook

**Validate before commits**:

Create: `.git/hooks/pre-commit`
```bash
#!/bin/bash
# Validate vault metadata before commit

echo "🔍 Validating vault metadata..."

# Check for required fields
for file in obsidian-vault/Campaigns/*.md; do
  if ! grep -q "^parent:" "$file"; then
    echo "❌ Missing 'parent' field in: $file"
    exit 1
  fi
done

echo "✅ Validation passed"
```

```bash
chmod +x .git/hooks/pre-commit
```

---

## ❓ FAQ

**Q: Where is the vault stored?**  
A: `~/atropos/obsidian-vault/` (inside the main repo)

**Q: Can I move it somewhere else?**  
A: Yes! Use symlink or set `ATROPOS_VAULT_PATH` environment variable

**Q: Does sync overwrite my changes?**  
A: No! Sync only reads vault → generates app files. Your vault is source of truth.

**Q: What if I edit both vault and app?**  
A: Choose one as source of truth. Usually: Edit in vault, sync to app. Don't edit generated `obsidianCampaigns.ts` directly.

**Q: Can I work offline?**  
A: Yes! Edit in Obsidian offline. Sync when you're back online.

**Q: How often should I sync?**  
A: After completing campaigns or daily. Sync is fast (~1 second).

**Q: What if sync fails?**  
A: Check console for errors. Usually: invalid YAML or missing required field. Fix in vault, re-sync.

**Q: Can multiple people edit vault?**  
A: Yes! Use git workflow. Obsidian Git handles most conflicts automatically.

---

## 🚨 Important Notes

### The Vault IS the Source of Truth

```
Obsidian Vault → (sync) → App Config → (build) → Live App
     ↑                                                
     └─────────── You edit here ──────────────────────┘
```

**Always**:
- ✅ Edit campaigns in vault
- ✅ Sync to app
- ✅ Test in app
- ✅ Commit vault files

**Never**:
- ❌ Edit `obsidianCampaigns.ts` directly (gets overwritten)
- ❌ Create campaigns in app then manually copy to vault
- ❌ Let vault and app drift (sync regularly!)

### Git Workflow

**Vault files ARE tracked**:
```bash
git add obsidian-vault/              # Vault content
git add client/src/config/obsidian*.ts  # Generated files
git commit -m "content: your changes"
git push origin main
```

**Both vault source AND generated files should be committed!**

---

## 🎯 Your Workflow Summary

### Simple Daily Pattern

```
MORNING:
1. cd ~/atropos
2. git pull origin main
3. open -a Obsidian obsidian-vault

DURING DAY (in Obsidian):
4. Create/edit campaigns
5. Visualize in Excalibrain  
6. Auto-commits every 10 min (Obsidian Git)

EVENING (in terminal):
7. npm run sync:from-obsidian
8. npm run dev (test)
9. git add -A
10. git commit -m "content: today's work"
11. git push origin main

DONE! 🎉
```

**Time Investment**:
- Morning: 2 min (pull + open)
- Evening: 5 min (sync + test + commit)
- Work: As long as you want in Obsidian

**Key Locations**:
- 📂 Work in: `~/atropos/obsidian-vault/`
- 💾 Backup to: GitHub (git push)
- 🔄 Sync from: Vault root (`~/atropos`)
- 🧪 Test at: `http://localhost:5000`

---

**You're all set! Your vault is in the right place and scripts will find it.** 🚀

**Next**: `./script/init-obsidian-vault.sh` to populate with existing campaigns!
