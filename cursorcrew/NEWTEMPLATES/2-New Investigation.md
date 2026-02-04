<%*
/**
 * 2-New Investigation — code runs FIRST, then frontmatter + body are output.
 * Stores investigation_id / investigation_name in window for child templates (1-New IP, 1-New Domain, etc.)
 */
const investigation_id = await tp.system.prompt("Investigation ID (kebab-case)?", "my-investigation");
if (!investigation_id) { tR = ""; return; }

const investigation_name = await tp.system.prompt("Investigation Name?", "My Investigation");
const severity = await tp.system.prompt("Severity (Critical/High/Medium/Low)?", "High");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "High");

window.investigation_id = investigation_id;
window.investigation_name = investigation_name;
window.severity = severity;
window.confidence = confidence;

const today = tp.date.now("YYYY-MM-DD");

const content = `---
type: investigation
date_created: "${today}"
date_modified: "${today}"
investigation_id: "${investigation_id}"
investigation_name: "${investigation_name}"
severity: ${severity}
confidence: ${confidence}
urgency: High
status: active
parent: []
child: []
sibling: []
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

> *[Write a 2–3 sentence overview of what is being investigated and why]*

---

## Triage & Classification

| Property          | Value |
|-------------------|-------|
| Investigation Type| [Data Breach / Infrastructure / Threat Actor / Leak / Misconfiguration] |
| Severity          | ${severity} |
| Affected Systems  | [List main assets] |
| Primary Contact   | [Your identifier] |
| Escalation Status | [Documented / Escalated / Monitoring] |

---

## Key Findings

| # | Finding | Evidence | Severity | Status |
|---|---------|----------|----------|--------|
| 1 | [Brief description] | e.g. [[Entity 1]] | High/Medium/Low | Confirmed / Suspicious / Disputed |
| 2 | [Brief description] | e.g. [[Entity 2]] | High/Medium/Low | Confirmed / Suspicious / Disputed |

---

## Investigation Timeline

| Date | Event | Source | Status |
|------|-------|--------|--------|
| ${today} | Investigation opened | Manual | Active |
| | | | |

---

## Entities Discovered

### Domains
` + "```dataview\nTABLE type, confidence, date_created\nFROM \"20-Entities\"\nWHERE investigation_id = \"" + investigation_id + "\" AND type = \"domain\"\nSORT date_created DESC\n```" + `

### IPs
` + "```dataview\nTABLE type, ip_address, confidence, date_created\nFROM \"10-Investigations\"\nWHERE investigation_id = \"" + investigation_id + "\" AND type = \"ip_address\"\nSORT date_created DESC\n```" + `

---

## Related Investigations

[Link to sibling investigations if applicable]
`;

tR = content;
%>
