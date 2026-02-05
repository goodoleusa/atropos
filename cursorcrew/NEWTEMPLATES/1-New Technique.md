<%*
/**
 * TECHNIQUE ENTITY TEMPLATE
 * Parent: Threat Actor or Campaign
 * Links to: Threat Actor (parent), Tools (child), Indicators (child)
 */

const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const technique_name = await tp.system.prompt("Technique Name (e.g., Phishing)?", "Unknown");
if (!technique_name) { tR = ""; return; }

const technique_id = await tp.system.prompt("MITRE ID (e.g., T1566)?", "T0000");
const tactic = await tp.system.prompt("Tactic (Initial Access/Execution/Persistence/Privilege Escalation)?", "Initial Access");
const first_observed = await tp.system.prompt("First Observed (YYYY-MM-DD)?", "Unknown");
const frequency = await tp.system.prompt("Frequency (Rare/Occasional/Common/Frequent)?", "Occasional");
const effectiveness = await tp.system.prompt("Effectiveness Against Defenses (High/Medium/Low)?", "Medium");
const parent_threat = await tp.system.prompt("Parent Threat Actor (filename, optional)?", "");
const sibling_techniques = await tp.system.prompt("Related Techniques (comma-separated, optional)?", "");

const today = tp.date.now("YYYY-MM-DD");

let parentLink = "";
if (parent_threat.trim()) {
  parentLink = `[[${parent_threat}]]`;
}

let siblings = [];
if (sibling_techniques.trim()) {
  siblings = sibling_techniques.split(",").map(s => `[[${s.trim()}]]`).join("\n  - ");
}

const frontmatter = `---
type: technique
technique_name: "${technique_name}"
technique_id: "${technique_id}"
tactic: "${tactic}"
first_observed: "${first_observed}"
frequency: ${frequency}
effectiveness: ${effectiveness}
investigation_id: "${investigation_id}"
parent: ${parentLink ? '"' + parentLink + '"' : []}
child: []
sibling: ${siblings ? "\n  - " + siblings : "[]"}
date_created: "${today}"
tags:
  - technique
  - mitre-att-ck
  - "${investigation_id}"
  - osint
title: "Technique - ${technique_name}"
aliases:
  - "${technique_id}"
  - "${technique_name}"
---

# Technique - ${technique_name}

**Name**: ${technique_name}  
**MITRE ID**: [\`${technique_id}\`](https://attack.mitre.org/techniques/${technique_id})  
**Tactic**: ${tactic}  
**First Observed**: ${first_observed}  
**Frequency**: ${frequency}  
**Effectiveness**: ${effectiveness}  
**Investigation**: [[${investigation_name}]]  
**Created**: ${today}  

---

## Description

[Detailed explanation of how this technique is used, what it accomplishes, prerequisites]

---

## Sub-Techniques (if applicable)

` + "```dataview\nTABLE technique_id, technique_name, frequency, effectiveness\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"technique\" AND parent = \"[[Technique - " + technique_name + "]]\"\nSORT technique_id ASC\n```" + `

---

## Used By (Threat Actors)

` + "```dataview\nTABLE threat_name, origin_country, first_seen\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"threat_actor\" AND child = \"[[Technique - " + technique_name + "]]\"\n```" + `

---

## Tools & Malware Associated

` + "```dataview\nTABLE name, type, purpose\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"tool\" AND parent = \"[[Technique - " + technique_name + "]]\"\n```" + `

---

## Indicators of Compromise

| Indicator Type | Value | Confidence |
|---|---|---|
| File Hash | [MD5/SHA256] | High |
| File Path | [C:\Windows\Temp\...] | High |
| Registry Key | [HKEY_LOCAL_MACHINE\...] | Medium |
| Network Signature | [Yara rule] | Medium |
| Process Name | [process.exe] | Low |

---

## Related Techniques (Siblings)

` + "```dataview\nTABLE tactic, technique_id, frequency\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"technique\" AND sibling = \"[[Technique - " + technique_name + "]]\"\nSORT tactic ASC\n```" + `

---

## Detection Guidance

### Network-Based
[Firewall rules, IDS signatures, DNS filtering]

### Host-Based
[EDR rules, antivirus signatures, file monitoring]

### Log Analysis
[Event IDs to monitor, log sources, parsing rules]

---

## Mitigation

- **Mitigation 1**: [Description of control]
- **Mitigation 2**: [Description of control]
- **Mitigation 3**: [Description of control]

---

## References

- [MITRE ATT&CK](https://attack.mitre.org/techniques/${technique_id})
- [Custom research]
- [Public report URL]

---

## Notes

[Observations from this investigation, specific examples of use, effectiveness against defenses]
`;

tR = frontmatter;
%>
