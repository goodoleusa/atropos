<%*
/**
 * 2-New Threat Actor — code runs FIRST. Prompts then outputs frontmatter + body.
 */
const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const threat_actor_name = await tp.system.prompt("Threat actor name (e.g. APT28)?", "Unknown");
if (!threat_actor_name) { tR = ""; return; }

const country = await tp.system.prompt("Country?", "Unknown");
const motivation = await tp.system.prompt("Motivation (Financial/Political/Espionage)?", "Unknown");
const active_since = await tp.system.prompt("Active since (year or date)?", "");
const now = tp.date.now("YYYY-MM-DD");
const parent_org = await tp.system.prompt("Parent (Investigation or Campaign filename, optional)?", "");
let parentLink = "";
if (parent_org.trim()) parentLink = `[[${parent_org.trim()}]]`;

const content = `---
type: reference
reference_type: threat_actor
date_created: "${now}"
date_modified: "${now}"
investigation_id: "${investigation_id}"
status: active
threat_actor: "${threat_actor_name}"
country: "${country}"
motivation: "${motivation}"
active_since: "${active_since}"
parent: ${parentLink ? '"' + parentLink + '"' : []}
child: []
sibling: []
known_campaigns: []
tags:
  - reference
  - threat-actor
  - ${investigation_id}
title: "Threat Actor - ${threat_actor_name}"
aliases:
  - "${threat_actor_name}"
---

# ${threat_actor_name}

**Aliases**: [Add known aliases]  
**Country**: ${country}  
**Active Since**: ${active_since}  
**Motivation**: ${motivation}  

---

## Profile

[Overview of threat actor, history, notable activities]

---

## Known Campaigns

- [Campaign 1]
- [Campaign 2]
- [Campaign 3]

---

## Tactics & Techniques

[MITRE ATT&CK framework references]

- [[Technique - Name 1]]
- [[Technique - Name 2]]

---

## Infrastructure

- **Favorite ASNs**: [Add ASN numbers]
- **Hosting Providers**: [[Organization - Name 1]]
- **Known Domains**: [[Domain - Name 1]]
- **Known IPs**: [[IP - Address 1]]

---

## Attribution Indicators

[What identifies this actor]

- [Indicator 1]
- [Indicator 2]

---

## Related Threat Actors

[[Threat Actor - Related 1]] | [[Threat Actor - Related 2]]

---

## Intelligence Sources

- [Source 1]
- [Source 2]

---

## Investigation Connections

` + "```dataview\nTABLE type, title, date_created\nFROM \"20-Entities\"\nWHERE investigation_id = \"" + investigation_id + "\"\nSORT date_created DESC\n```" + `

---

## Notes

[Personal observations, confidence level, patterns observed]
`;

tR = content;
%>
