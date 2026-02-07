---
id: "<% tp.file.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') %>"
name: "<% tp.file.title %>"
type: achievement
category: <% tp.system.prompt("Category (discovery/speed/mastery/social/special)?") %>
rarity: <% tp.system.prompt("Rarity (common/rare/epic/legendary)?") %>
icon: "<% tp.system.prompt("Icon emoji (e.g., 🏆)?") %>"
created: <% tp.date.now("YYYY-MM-DD") %>
modified: <% tp.date.now("YYYY-MM-DD") %>

# Rewards
xpReward: <% tp.system.prompt("XP reward?", "100") %>
currencyReward: <% tp.system.prompt("Currency reward?", "50") %>
unlocks:
  - 

# Requirements
requirementType: <% tp.system.prompt("Type (stat/action/campaign/special)?") %>
condition: {}

# Relationships
related: 
leads-to: 
---

# <% tp.file.title %>

## Description
<!-- What does this achievement recognize? -->

## How to Unlock
<!-- Step-by-step guide -->
1. 
2. 
3. 

## Requirement Details

### Type: 
### Condition:
```json
{
  "stat": "campaignsCompleted",
  "value": 10,
  "comparison": "gte"
}
```

## Why This Matters
<!-- Context on why this achievement is meaningful -->

## Related Achievements
- [[Achievement Name]]
- [[Achievement Name]]

## Tips
<!-- How to unlock this efficiently -->

---
**Export Ready**: Use `npm run sync:achievements -- --from-obsidian`
