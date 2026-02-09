---
{
  "id": "shell_corp_osint",
  "name": "Shell Corp Investigation",
  "icon": "🏢",
  "difficulty": "intermediate",
  "estimatedTime": "45-60 min",
  "tags": [
    "OSINT",
    "Corporate Intel",
    "Financial"
  ],
  "color": "amber",
  "targetFields": [
    {
      "key": "org",
      "label": "Organization Name",
      "type": "org",
      "required": true,
      "placeholder": "Obsidian Holdings LLC"
    },
    {
      "key": "domain",
      "label": "Primary Domain",
      "type": "domain",
      "required": false,
      "placeholder": "obsidian-holdings.com"
    }
  ],
  "dummyTargets": {
    "org": "Obsidian Holdings LLC",
    "domain": "obsidian-holdings.com"
  },
  "learningObjectives": [
    {
      "goal": "financial_investigation",
      "weight": 10,
      "description": "Master corporate intelligence and ownership tracing"
    },
    {
      "goal": "osint_investigation",
      "weight": 8,
      "description": "Apply multi-source OSINT techniques"
    },
    {
      "goal": "socmint",
      "weight": 5,
      "description": "Profile key personnel via social media"
    }
  ],
  "skillsRequired": [
    "Basic OSINT",
    "Search engine proficiency",
    "Corporate structure basics"
  ],
  "skillsTaught": [
    "Corporate registry navigation",
    "Beneficial ownership analysis",
    "Entity relationship mapping",
    "Financial document interpretation"
  ],
  "learningOutcomes": [
    "Navigate international corporate registries",
    "Trace beneficial ownership through shell companies",
    "Map complex corporate structures",
    "Identify red flags in business entities",
    "Correlate entities across multiple jurisdictions"
  ],
  "industryContext": "Financial crime investigators, fraud analysts, compliance officers, and journalists use these techniques to expose money laundering, corruption, and criminal networks. Skills directly applicable to AML/CFT compliance roles.",
  "realWorldExamples": [
    "Panama Papers investigation (ICIJ)",
    "Danske Bank money laundering scandal",
    "Wirecard fraud investigation",
    "FinCEN Files leak analysis"
  ],
  "careerPaths": [
    "Financial Crime Analyst",
    "Fraud Investigator",
    "AML Compliance Officer",
    "Investigative Journalist",
    "Corporate Intelligence Analyst"
  ],
  "teachingAdaptations": {
    "experiential": "Jump straight into OpenCorporates. Search the target company. Click through ownership chains. Learn registries by exploring them. Make mistakes - chase dead ends - that's how you learn what patterns matter.",
    "visual": "Start by drawing an org chart as you discover entities. Use Maltego or similar to visualize ownership graphs. Color-code jurisdictions. Watch relationships emerge visually as you add nodes.",
    "analytical": "Begin with corporate law fundamentals: legal entity types, beneficial ownership definitions, jurisdiction differences. Reference FinCEN guidance on shell companies. Understand the regulatory framework before diving into investigation.",
    "social": "Reference famous investigations: Panama Papers methodology, Bellingcat corporate tracing. Join OSINT communities discussing corporate intel techniques. Share your ownership graph discoveries with peers.",
    "pragmatic": "Here's the workflow: OpenCorporates → grab all officers → LinkedIn each officer → find connections → cross-reference with other companies → map it. Done. Script it if you do this regularly."
  }
}
---

# Shell Corp Investigation

## Overview
Investigate a suspicious shell corporation. Trace ownership, find hidden connections, and expose the network.

## Objectives
1. Identify corporate registration details
2. Map subsidiary relationships
3. Find beneficial ownership
4. Trace financial connections
5. Build personnel dossiers

## Tools Required
- WHOIS
- SEC EDGAR
- OpenCorporates
- LinkedIn OSINT
- Domain analysis

## Starter Prompt
```
I want to investigate a shell corporation called "Obsidian Holdings LLC". 

Help me build a dossier by:
1. Identifying corporate registration patterns
2. Finding beneficial ownership through OSINT techniques
3. Mapping connected entities and subsidiaries
4. Tracing financial relationships
5. Identifying key personnel and their digital footprints

Start with the basics - what sources would you check first for corporate intel?
```
