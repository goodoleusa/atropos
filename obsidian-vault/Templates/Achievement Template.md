---
id: "<% tp.file.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') %>"
name: "<% tp.file.title %>"
type: achievement
status: active
created: <% tp.date.now("YYYY-MM-DD") %>
modified: <% tp.date.now("YYYY-MM-DD") %>

# Achievement Metadata
category: discovery
rarity: common
icon: "🏆"
isHidden: false
sortOrder: 0

# Requirements
requirementType: stat
requirementCondition:
  stat: campaignsCompleted
  value: 1
  comparison: gte

# Rewards
xpReward: 100
currencyReward: 50
unlocks:
  - 

# Relationships (Breadcrumbs - Hierarchical)
parent: 
sibling: 
child:
---

# <% tp.file.title %>

## Description
<!-- What does this achievement represent? -->

## How to Unlock
<!-- Clear instructions for players -->
1. 
2. 
3. 

## Requirements

**Type**: <%= tp.frontmatter.requirementType %>  
**Condition**: 
- 
- 

## Rewards

When you unlock this achievement, you receive:
- **+<%= tp.frontmatter.xpReward %> XP**
- **+<%= tp.frontmatter.currencyReward %> Credits**
<% if (tp.frontmatter.unlocks && tp.frontmatter.unlocks.length > 0) { %>
- **Unlocks**: 
<% tp.frontmatter.unlocks.forEach(unlock => { %>  - <%= unlock %>
<% }); %>
<% } %>

## Rarity: <%= tp.frontmatter.rarity.toUpperCase() %>

<% if (tp.frontmatter.rarity === 'legendary') { %>
🌟 **LEGENDARY** - Extremely rare! Only the most dedicated investigators earn this.
<% } else if (tp.frontmatter.rarity === 'epic') { %>
💜 **EPIC** - Impressive accomplishment that few achieve.
<% } else if (tp.frontmatter.rarity === 'rare') { %>
💙 **RARE** - Notable achievement requiring skill and dedication.
<% } else { %>
⚪ **COMMON** - Foundational achievement on your journey.
<% } %>

## Tips & Strategy
<!-- How experienced players recommend unlocking this -->

---

## Related Achievements
<!-- Link to similar or progression achievements -->
- [[]]
- [[]]

## Unlocked By
<!-- Which campaigns or actions typically unlock this? -->
- [[]]

---

## Export to App

Run: `npm run sync:achievements -- --from-obsidian`

This will update `server/seed/achievements.ts`
