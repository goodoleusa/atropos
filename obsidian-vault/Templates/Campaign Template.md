---
id: "<% tp.file.title.toLowerCase().replace(/\s+/g, '_') %>"
name: "<% tp.file.title %>"
type: campaign
status: draft
created: <% tp.date.now("YYYY-MM-DD") %>
modified: <% tp.date.now("YYYY-MM-DD") %>

# Campaign Metadata
icon: "🎯"
difficulty: intermediate
estimatedTime: "30-45 min"
tags:
  - OSINT
  - Investigation
color: amber

# Relationships (Breadcrumbs - Hierarchical)
parent: 
sibling: 
child: 

# Target Configuration
targetFields:
  - key: domain
    label: Domain
    type: domain
    required: true
    placeholder: example.com
dummyTargets:
  domain: example.com

# Learning Integration
learningObjectives:
  - goal: osint_investigation
    weight: 10
    description: ""
skillsRequired:
  - Basic OSINT
  - Search engine proficiency
skillsTaught:
  - 
  - 
learningOutcomes:
  - 
  - 
industryContext: ""
realWorldExamples:
  - 
  - 
careerPaths:
  - 
  - 
---

# <% tp.file.title %>

## Overview
<!-- Brief description of what this campaign teaches -->

## Objectives
1. 
2. 
3. 

## Tools Required
- 
- 
- 

## Starter Prompt
```
I want to investigate [TARGET].

Help me:
1. 
2. 
3. 

What should be our first step?
```

## Teaching Adaptations

### 🔧 Experiential Learner
<!-- Jump in, try tools, learn by doing -->


### 📊 Visual Learner
<!-- Diagrams, maps, visualizations -->


### 🔬 Analytical Learner
<!-- Theory first, documentation, deep understanding -->


### 👥 Social Learner
<!-- Community resources, collaborative approaches -->


### ⚡ Pragmatic Learner
<!-- Quick workflow, one-liners, automation -->


## Investigation Steps

### Step 1: 
**Goal**: 

**Tools**: 

**Questions**:
- 

**Success Indicators**:
- 

**Red Flags**:
- 

### Step 2:
**Goal**: 

**Tools**: 

**Questions**:
- 

## Expected Findings
<!-- What should investigators discover? -->

## Validation
<!-- How to verify the investigation was successful -->

## Extensions
<!-- Optional: Additional investigations this could lead to -->

---

## Export Configuration

When ready to export to app, this campaign will be converted to:
```typescript
{
  id: '<% tp.file.title.toLowerCase().replace(/\s+/g, '_') %>',
  name: '<% tp.file.title %>',
  // ... populated from frontmatter
}
```

Run: `npm run sync:campaigns -- --from-obsidian`
