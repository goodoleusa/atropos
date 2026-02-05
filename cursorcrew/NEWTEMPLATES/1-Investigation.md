<%*
/**
 * INVESTIGATION SETUP TEMPLATE
 * Uses: Templater JS, Dataview API, Metadata Menu integration
 */

// 1. PROMPT USER FOR INVESTIGATION DETAILS
const investigation_id = await tp.system.prompt("Investigation ID (kebab-case)?", "my-investigation");
if (!investigation_id) { tR = ""; return; }

const investigation_name = await tp.system.prompt("Investigation Name?", "My Investigation");
const severity = await tp.system.prompt("Severity (Critical/High/Medium/Low)?", "High");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "High");
const today = tp.date.now("YYYY-MM-DD hh:mm");

// 2. STORE IN WINDOW FOR CHILD TEMPLATES
window.investigation_id = investigation_id;
window.investigation_name = investigation_name;
window.severity = severity;
window.confidence = confidence;

// 3. BUILD FRONTMATTER (Metadata Menu compatible)
// Use single links (File field) for parent, multi-links (MultiFile) for child/sibling
const frontmatter = `---
type: investigation
investigation_id: "${investigation_id}"
investigation_name: "${investigation_name}"
confidence: ${confidence}
status: active
parent: []
sibling: []
child: []
date_created: "${today}"
severity: ${severity}
urgency: High
tags:
  - investigation
  - osint
  - "${investigation_id}"
title: "${investigation_name}"
aliases:
  - "${investigation_name}"
  - "${investigation_id}"
---

# ${investigation_name}

**Investigation ID**: \`${investigation_id}\`  
**Started**: ${today}  
**Status**: Active  
**Severity**: ${severity}  
**Confidence**: ${confidence}  

---

## Executive Summary

[Write 2–3 sentence overview of the investigation scope, threat, or incident.]

---

## Triage & Classification

| Property           | Value                                                      |
|--------------------|-------------------------------------------------------------|
| Investigation Type | [Data Breach / Infrastructure / Threat Actor / Leak]       |
| Severity           | ${severity}                                                |
| Affected Systems   | [List main assets or scope]                                |
| Primary Contact    | [Your identifier or team]                                  |
| Escalation Status  | [Documented / Escalated / Monitoring]                      |

---

## Key Findings

- **Finding 1**: [Description] — Evidence: [[Entity]] — Severity: High/Medium/Low  
- **Finding 2**: [Description] — Evidence: [[Entity]] — Severity: High/Medium/Low  

---

## Entities Created

` + "```dataview\nTABLE type, confidence, date_created\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type != \"investigation\"\nSORT date_created DESC\n```" + `

---

## Timeline

| Date | Event | Details |
|------|-------|---------|
| ${today} | Investigation started | [[${investigation_name}]] created |
| | | |

---

## Related Investigations

[Link to sibling investigations if applicable]

`;

tR = frontmatter;
%>
