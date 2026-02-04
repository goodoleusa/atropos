<%*
const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown";

const org_name = await tp.system.prompt("Organization Name?", "Acme Corp");
const org_type = await tp.system.prompt("Type (Private/Government/NGO/Research)?", "Private");
const country = await tp.system.prompt("Country?", "Unknown");
const threat_level = await tp.system.prompt("Threat Level (Critical/High/Medium/Low)?", "Medium");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "Medium");
const parent = await tp.system.prompt("Parent (if subsidiary)?", "");

const today = tp.date.now("YYYY-MM-DD");

const frontmatter = `---
type: organization
name: "${org_name}"
org_type: ${org_type}
country: ${country}
threat_level: ${threat_level}
confidence: ${confidence}
investigation_id: "${investigation_id}"
parent: ${parent ? '"[[${parent}]]"' : []}
child: []
sibling: []
date_created: "${today}"
tags:
  - organization
  - "${investigation_id}"
title: "Organization - ${org_name}"
---

# Organization - ${org_name}

**Name**: ${org_name}  
**Type**: ${org_type}  
**Country**: ${country}  
**Threat Level**: ${threat_level}  
**Investigation**: [[${investigation_name}]]  
**Created**: ${today}  

---

## Overview

[Brief description of organization]

---

## Related Assets

` + "```dataview\nTABLE type, threat_level\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE parent = \"[[Organization - " + org_name + "]]\"\nSORT type ASC\n```" + `

---

## Notes

[Analytical notes]
`;

tR = frontmatter;
%>