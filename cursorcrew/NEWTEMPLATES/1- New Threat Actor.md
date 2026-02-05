<%*
/**
 * THREAT ACTOR ENTITY TEMPLATE
 * Parent: Investigation
 * Links to: Organizations (child), Techniques (child), IPs (child)
 */

const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const threat_name = await tp.system.prompt("Threat Actor Name (e.g., APT28)?", "Unknown");
if (!threat_name) { tR = ""; return; }

const aliases = await tp.system.prompt("Aliases (comma-separated)?", "");
const origin_country = await tp.system.prompt("Origin Country?", "Unknown");
const threat_type = await tp.system.prompt("Type (APT/Cybercriminal/Hacktivist/Insider)?", "APT");
const first_seen = await tp.system.prompt("First Seen (YYYY-MM-DD)?", "Unknown");
const primary_targets = await tp.system.prompt("Primary Targets (comma-separated)?", "");
const motivation = await tp.system.prompt("Motivation (Financial/Political/Military/Espionage)?", "Unknown");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "Medium");

const today = tp.date.now("YYYY-MM-DD");

let aliasArray = [];
if (aliases.trim()) {
  aliasArray = aliases.split(",").map(a => a.trim());
}

const frontmatter = `---
type: threat_actor
threat_name: "${threat_name}"
aliases: ${aliasArray.length > 0 ? '\n  - ' + aliasArray.join('\n  - ') : ''}
origin_country: "${origin_country}"
threat_type: ${threat_type}
first_seen: "${first_seen}"
primary_targets: "${primary_targets}"
motivation: ${motivation}
confidence: ${confidence}
investigation_id: "${investigation_id}"
parent: []
child: []
sibling: []
date_created: "${today}"
tags:
  - threat-actor
  - apt
  - "${investigation_id}"
  - osint
title: "Threat Actor - ${threat_name}"
aliases:
  - "${threat_name}"
${aliasArray.map(a => `  - "${a}"`).join('\n')}
---

# Threat Actor - ${threat_name}

**Name**: ${threat_name}  
${aliasArray.length > 0 ? `**Aliases**: ${aliasArray.join(", ")}\n` : ''}
**Origin Country**: ${origin_country}  
**Type**: ${threat_type}  
**First Seen**: ${first_seen}  
**Primary Targets**: ${primary_targets}  
**Motivation**: ${motivation}  
**Confidence**: ${confidence}  
**Investigation**: [[${investigation_name}]]  
**Created**: ${today}  

---

## Profile

### Background
[Historical overview, founding date, known leadership, organizational structure]

### Capabilities
[Technical sophistication, tooling, malware development, etc.]

### Operational Pattern
[Timing of attacks, campaign frequency, target selection methodology]

---

## TTPs (MITRE ATT&CK)

` + "```dataview\nTABLE technique_id, technique_name, tactic, confidence\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"technique\" AND parent = \"[[Threat Actor - " + threat_name + "]]\"\nGROUP BY tactic\nSORT tactic ASC\n```" + `

---

## Infrastructure

` + "```dataview\nTABLE type, threat_level, country\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE (type = \"ip_address\" OR type = \"domain\") AND parent = \"[[Threat Actor - " + threat_name + "]]\"\nSORT threat_level DESC\n```" + `

---

## Known Organizations/Victims

| Organization | Industry | Date | Status |
|--------------|----------|------|--------|
| [Company 1] | [Sector] | [Date] | [Breached/Targeted] |
| [Company 2] | [Sector] | [Date] | [Breached/Targeted] |

---

## Tools & Malware

- **Malware Family 1**: [Description, hash, C2]
- **Malware Family 2**: [Description, hash, C2]
- **Tools**: [Mimikatz, PSTools, custom tools, etc.]
- **Exploits**: [CVE-XXXX-XXXXX, 0-days, etc.]

---

## Related Threat Actors (Siblings)

` + "```dataview\nTABLE origin_country, threat_type, first_seen\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"threat_actor\" AND sibling = \"[[Threat Actor - " + threat_name + "]]\"\n```" + `

---

## Attribution Confidence

| Indicator | Confidence | Notes |
|-----------|-----------|-------|
| Code similarity | High | Shared malware code |
| Infrastructure overlap | Medium | Shared IPs/domains |
| Targeting pattern | High | Consistent victim profile |
| Timing | Medium | Campaign windows |
| TTP alignment | High | Matches MITRE ATT&CK profile |

---

## Intelligence Sources

- [Public report 1 with URL]
- [Public report 2 with URL]
- [Custom analysis]

---

## Notes

[Additional analytical notes, recent activity, threat timeline, suspected motivations, geopolitical context]
`;

tR = frontmatter;
%>
