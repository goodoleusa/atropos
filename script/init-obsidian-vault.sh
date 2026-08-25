#!/bin/bash
# Initialize Obsidian Vault with Atropos Content
# This script sets up the vault and imports existing campaigns

set -e

VAULT_PATH="obsidian-vault"

echo "🔮 Initializing Atropos Obsidian Vault..."
echo ""

# Check if vault exists
if [ ! -d "$VAULT_PATH" ]; then
    echo "❌ Vault directory not found at $VAULT_PATH"
    exit 1
fi

echo "✅ Vault directory found"

# Check if Obsidian is installed
if command -v obsidian &> /dev/null; then
    echo "✅ Obsidian installed"
    OBSIDIAN_CMD="obsidian"
elif [ -d "/Applications/Obsidian.app" ]; then
    echo "✅ Obsidian installed (macOS)"
    OBSIDIAN_CMD="open -a Obsidian"
elif [ -f "/usr/bin/obsidian" ]; then
    echo "✅ Obsidian installed (Linux)"
    OBSIDIAN_CMD="obsidian"
else
    echo "⚠️  Obsidian not found - install from https://obsidian.md"
    echo "   Vault will still be initialized, open manually later"
    OBSIDIAN_CMD=""
fi

# Check dependencies
echo ""
echo "📦 Checking dependencies..."

if ! npm list gray-matter &> /dev/null; then
    echo "⚠️  Installing gray-matter..."
    npm install --save-dev gray-matter
fi

echo "✅ Dependencies ready"

# Export existing campaigns to vault
echo ""
echo "📤 Exporting existing campaigns to vault..."

npm run sync:to-obsidian

if [ $? -eq 0 ]; then
    echo "✅ Campaigns exported successfully"
else
    echo "⚠️  Campaign export had warnings (check output)"
fi

# Create index files
echo ""
echo "📝 Creating index files..."

# Create MOC (Map of Content)
cat > "$VAULT_PATH/MOC - Education Management.md" << 'EOF'
---
type: moc
status: canonical
created: 2026-02-07
modified: 2026-02-07

parent: 
sibling: 
child:
  - [[Curriculum]]
  - [[Campaign Builder Guide]]
  - [[METADATA_STANDARDS]]
---

# Atropos Education Management - Map of Content

## 🎯 Purpose
This vault manages all educational content for the Atropos cybersecurity training platform.

## 📚 Core Documentation
- [[README]] - Vault overview and quick start
- [[METADATA_STANDARDS]] - Canonical frontmatter guide
- [[Campaign Builder Guide]] - How to create campaigns

## 🗂️ Content Sections

### [[Curriculum]]
- Root curriculum framework
- Learning paths (child notes)
- Skill progression model

### Campaigns (23 total)
```dataview
TABLE difficulty, estimatedTime, parent
FROM "Campaigns"
WHERE status = "active"
SORT difficulty ASC, name ASC
```

### Learning Paths (4 career tracks)
```dataview
TABLE category, estimatedHours, targetRoles
FROM "Learning-Paths"
SORT difficulty ASC
```

### Achievements (500+ definitions)
```dataview
TABLE rarity, xpReward, category
FROM "Achievements"
WHERE status = "active"
SORT rarity DESC, xpReward DESC
LIMIT 20
```

## 🔄 Sync Status

Last sync FROM app: Run `npm run sync:to-obsidian`
Last sync TO app: Run `npm run sync:from-obsidian`

## 🧠 Quick Actions

- **Create Campaign**: `Ctrl/Cmd+P` → "Templater: Campaign Template"
- **Visualize**: Open Excalibrain
- **Query**: Use Dataview code blocks
- **Navigate**: Use Breadcrumbs trail
- **Sync**: Run npm scripts in terminal

## 📊 Statistics

```dataview
TABLE length(rows) as Count
FROM ""
WHERE type != null
GROUP BY type
SORT Count DESC
```

---

⬇️ **Start Here**: [[Campaign Builder Guide]]
🔄 **Sync Guide**: [[README]]
📋 **Standards**: [[METADATA_STANDARDS]]
EOF

echo "✅ MOC created"

# Create tags index
cat > "$VAULT_PATH/tags.md" << 'EOF'
---
type: index
status: canonical
---

# Tag Taxonomy

## Content Type Tags
- #campaign
- #learning-path
- #achievement
- #tool
- #module
- #guide

## Difficulty Tags
- #beginner
- #intermediate
- #advanced
- #expert

## Domain Tags
- #OSINT
- #Network
- #Malware
- #Social
- #Financial
- #Crypto
- #Geolocation
- #SOCMINT
- #DarkWeb
- #ThreatIntel

## Technique Tags
- #Recon
- #Enumeration
- #Analysis
- #Investigation
- #Scanning
- #Tracing
- #Correlation

---

Use tags sparingly. Rely on parent/child relationships for organization.
EOF

echo "✅ Tag taxonomy created"

# Git init if not already
if [ ! -d "$VAULT_PATH/.git" ]; then
    echo ""
    echo "📦 Initializing git repository..."
    cd "$VAULT_PATH"
    git init
    git add -A
    git commit -m "init: initialize Atropos education management vault"
    cd ..
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Create .gitignore
cat > "$VAULT_PATH/.gitignore" << 'EOF'
# Obsidian workspace (user-specific)
.obsidian/workspace*
.obsidian/workspace.json

# Trash
.trash/

# OS files
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
EOF

echo "✅ .gitignore created"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Obsidian Vault Initialization Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Vault Location: $VAULT_PATH"
echo ""
echo "🔮 Next Steps:"
echo "   1. Open vault in Obsidian:"
if [ -n "$OBSIDIAN_CMD" ]; then
    echo "      $OBSIDIAN_CMD obsidian://open?path=$(pwd)/$VAULT_PATH"
else
    echo "      Obsidian → Open folder → Select: $(pwd)/$VAULT_PATH"
fi
echo ""
echo "   2. Install community plugins:"
echo "      Settings → Community Plugins → Browse"
echo "      - Breadcrumbs"
echo "      - Excalibrain"
echo "      - Dataview"
echo "      - Templater"
echo "      - Obsidian Git"
echo ""
echo "   3. Read the guides:"
echo "      - Open [[README]] for overview"
echo "      - Read [[Campaign Builder Guide]]"
echo "      - Check [[METADATA_STANDARDS]]"
echo ""
echo "   4. Start creating:"
echo "      Ctrl/Cmd+P → 'Templater: Create from template'"
echo ""
echo "   5. Sync back to app:"
echo "      npm run sync:from-obsidian"
echo ""
echo "🎓 Your offline education management system is ready!"
echo ""
