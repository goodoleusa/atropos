<%*
/**
 * 2-New Person — code runs FIRST. Prompts then outputs frontmatter + body.
 */
const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const person_name = await tp.system.prompt("Person name?", "Unknown");
if (!person_name) { tR = ""; return; }

const role = await tp.system.prompt("Role or title?", "");
const organization = await tp.system.prompt("Organization (optional)?", "");
const now = tp.date.now("YYYY-MM-DD");
const source_tool = await tp.system.prompt("Source tool?", "manual");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "Medium");
const parent_org = await tp.system.prompt("Parent (Organization filename, optional)?", "");
let parentLink = "";
if (parent_org.trim()) parentLink = `[[${parent_org.trim()}]]`;

const content = `---
type: person
date_created: "${now}"
date_modified: "${now}"
investigation_id: "${investigation_id}"
source_tool: "${source_tool}"
confidence: ${confidence}
status: active
parent: ${parentLink ? '"' + parentLink + '"' : []}
child: []
sibling: []
person_name: "${person_name}"
role: "${role || ""}"
organization: "${organization || ""}"
tags:
  - person
  - osint
  - ${investigation_id}
title: "Person - ${person_name}"
aliases:
  - "${person_name}"
---

# Person: ${person_name}

## Quick Facts

| Property | Value |
|----------|-------|
| Name | ${person_name} |
| Role | ${role || "—"} |
| Organization | ${organization || "—"} |
| Discovered | ${now} |
| Confidence | ${confidence} |

## Overview

[Brief description, relevance to investigation]

## Related Entities

\`\`\`dataview
TABLE type, confidence, date_created
FROM "20-Entities"
WHERE investigation_id = "${investigation_id}" AND (parent = this.file.link OR contains(string(related), this.file.name))
SORT date_created DESC
\`\`\`

## Notes

[Analytical notes, links to domains/orgs]
`;

tR = content;
%>
