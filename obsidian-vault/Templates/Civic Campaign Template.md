---
id: "<% tp.file.title.toLowerCase().replace(/\s+/g, '_') %>"
name: "<% tp.file.title %>"
type: civic_campaign
status: draft
created: <% tp.date.now("YYYY-MM-DD") %>
modified: <% tp.date.now("YYYY-MM-DD") %>

# Campaign Metadata
icon: "✊"
difficulty: beginner
estimatedTime: "30-45 min"
tags:
  - Civic Engagement
  - Grassroots
  - Movement History
color: amber

# Target Configuration
targetFields:
  - key: movement_name
    label: Movement or Context
    type: text
    required: false
    placeholder: e.g. Otpor!
dummyTargets:
  movement_name: ""

# Learning Integration
learningObjectives:
  - goal: civic_engagement
    weight: 10
    description: ""
  - goal: grassroots_organizing
    weight: 5
    description: ""
  - goal: movement_history
    weight: 5
    description: ""
skillsRequired:
  - Basic research
  - Critical thinking
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
  - Community Organizer
  - Democracy Advocate
  - 
---

# <% tp.file.title %>

## Overview
<!-- Brief description: digital citizenship, grassroots organizing, movement history, or civic engagement focus -->

## Objectives
1. 
2. 
3. 

## Tools & Resources
- Primary sources
- Documentary analysis
- Academic research
- 

## Starter Prompt
```
I want to learn about [MOVEMENT/CONCEPT].

Help me understand:
1. 
2. 
3. 

What should we explore first?
```

## Teaching Adaptations

### Experiential Learner
<!-- Role-play, hands-on organizing simulation -->


### Visual Learner
<!-- Timelines, power maps, coalition diagrams -->


### Analytical Learner
<!-- Theory: Gene Sharp, Erica Chenoweth, social movement literature -->


### Social Learner
<!-- Discussion, peer exchange, community case studies -->


### Pragmatic Learner
<!-- Step-by-step playbook, checklists, quick reference -->


## Movement / Concept Details

### Key Tactics
- 

### Humor & Unity Elements
- 

### Lessons for Contemporary Organizers
- 

## Validation
<!-- How to verify the learning was successful -->

## Extensions
<!-- Related campaigns or deeper dives -->

---
Export to app: Run `npm run sync:campaigns -- --from-obsidian` when ready.
