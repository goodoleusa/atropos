---
id: "<% tp.file.title.toLowerCase().replace(/\s+/g, '_') %>"
name: "<% tp.file.title %>"
type: learning-path
category: <% tp.system.prompt("Category (osint/network/malware/social)?") %>
difficulty: <% tp.system.prompt("Difficulty (beginner/intermediate/advanced/expert)?") %>
estimatedTime: "<% tp.system.prompt("Estimated time (e.g., 40-60 hours)?") %>"
created: <% tp.date.now("YYYY-MM-DD") %>
modified: <% tp.date.now("YYYY-MM-DD") %>

# Relationships
contains: 
leads-to: 
prerequisite: 
related: 

# Career Focus
targetRoles:
  - 
  - 
salaryRange: "$XX,000 - $XX,000"
---

# <% tp.file.title %>

## Overview
<!-- What does this learning path prepare you for? -->

## Skills Developed
- 
- 
- 

## Tools Mastered
- 
- 
- 

## Modules

### Module 1: 
**Duration**: XX hours  
**Campaigns**: [[Campaign Name]]  
**Skills**: 

### Module 2:
**Duration**: XX hours  
**Campaigns**: [[Campaign Name]]  
**Skills**: 

### Module 3:
**Duration**: XX hours  
**Campaigns**: [[Campaign Name]]  
**Skills**: 

## Learning Outcomes

By completing this path, you will be able to:
- 
- 
- 

## Career Outcomes

### Target Roles
- 
- 

### Skills Employers Want
- 
- 

### Portfolio Projects
- 
- 

## Real-World Application
<!-- How professionals use these skills daily -->


## Recommended Sequence
1. [[Campaign Name]] → 
2. [[Campaign Name]] → 
3. [[Campaign Name]]

## Assessment
<!-- How to verify mastery of this path -->


---
**Export Ready**: Use `npm run sync:paths -- --from-obsidian` to export to app
