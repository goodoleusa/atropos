---
id: "<% tp.file.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') %>"
name: "<% tp.file.title %>"
type: tool
status: active
created: <% tp.date.now("YYYY-MM-DD") %>
modified: <% tp.date.now("YYYY-MM-DD") %>

# Tool Properties
category: OSINT
platform: Web
requiresAuth: false
pricingModel: Free
apiDocs: ""
officialSite: ""

# Hierarchical Relationships
parent: [[OSINT Tools]]
sibling:
  - 
child:
  - 

# Usage in Curriculum
usedInCampaigns:
  - [[]]
usedInPaths:
  - [[]]
---

# <% tp.file.title %>

## Overview
<!-- What this tool does and why it's useful -->

## When to Use
<!-- Specific scenarios where this tool excels -->

## Getting Started

### Installation
```bash
# Installation commands if applicable
```

### Basic Usage
```bash
# Basic command examples
```

## Key Features
- 
- 
- 

## Output Interpretation
<!-- How to read and analyze the tool's output -->

## Integration with Atropos
<!-- If this tool is integrated into the platform -->

**API Endpoint**: 
**Configuration**: 

## Pro Tips & Tricks
<!-- Advanced usage, shortcuts, automation -->

## Alternatives & Comparisons

| Feature | <%= tp.file.title %> | Alternative 1 | Alternative 2 |
|---------|---------|--------------|--------------|
| Cost    |         |              |              |
| Speed   |         |              |              |
| Depth   |         |              |              |

## Real-World Examples
<!-- How professionals use this tool -->

### Case Study 1:
**Scenario**: 
**Usage**: 
**Outcome**: 

## Related Tools
<!-- Sibling tools with similar purposes -->
- [[]]
- [[]]

## Taught In
<!-- Which campaigns teach this tool? -->
- [[]]
- [[]]

---

## Export to App

This tool metadata syncs to:
- `client/src/config/tools.ts`
- `server/osintTools` table (if integrated)

Run: `npm run sync:tools -- --from-obsidian`
