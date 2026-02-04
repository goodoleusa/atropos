<%*
/**
 * VULNERABILITY ENTITY TEMPLATE
 * Parent: Service or Software
 * Links to: Service (parent), Exploits (child), Indicators (child)
 */

const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const cve_id = await tp.system.prompt("CVE ID (e.g., CVE-2021-44228)?", "CVE-XXXX-XXXXX");
if (!cve_id) { tR = ""; return; }

const title = await tp.system.prompt("Vulnerability Title?", "Unknown Vulnerability");
const severity = await tp.system.prompt("Severity (Critical/High/Medium/Low)?", "High");
const cvss_score = await tp.system.prompt("CVSS Score (0-10)?", "7.5");
const published_date = await tp.system.prompt("Published Date (YYYY-MM-DD)?", "Unknown");
const affected_software = await tp.system.prompt("Affected Software (e.g., Log4j)?", "");
const vulnerability_type = await tp.system.prompt("Type (RCE/LFI/XXE/SQLi/SSRF/etc)?", "Unknown");
const parent_service = await tp.system.prompt("Parent Service (filename, optional)?", "");

const today = tp.date.now("YYYY-MM-DD");

let parentLink = "";
if (parent_service.trim()) {
  parentLink = `[[${parent_service}]]`;
}

const frontmatter = `---
type: vulnerability
cve_id: "${cve_id}"
vulnerability_title: "${title}"
severity: ${severity}
cvss_score: ${cvss_score}
published_date: "${published_date}"
affected_software: "${affected_software}"
vulnerability_type: "${vulnerability_type}"
investigation_id: "${investigation_id}"
parent: ${parentLink ? '"' + parentLink + '"' : []}
child: []
sibling: []
date_created: "${today}"
tags:
  - vulnerability
  - cve
  - "${vulnerability_type.toLowerCase()}"
  - "${investigation_id}"
  - osint
title: "Vulnerability - ${cve_id}"
aliases:
  - "${cve_id}"
  - "${title}"
---

# Vulnerability - ${cve_id}

**CVE ID**: [\`${cve_id}\`](https://nvd.nist.gov/vuln/detail/${cve_id})  
**Title**: ${title}  
**Severity**: ${severity} (CVSS: ${cvss_score})  
**Published**: ${published_date}  
**Affected**: ${affected_software}  
**Type**: ${vulnerability_type}  
**Investigation**: [[${investigation_name}]]  
**Created**: ${today}  

---

## Description

[Detailed technical description of the vulnerability, attack vector, impact]

---

## Attack Vector

### Prerequisites
[What attacker needs to exploit this]

### Attack Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Proof of Concept
\`\`\`python
# PoC code or description
\`\`\`

---

## Affected Versions

| Product | Versions | Status |
|---------|----------|--------|
| ${affected_software} | [List versions] | [Vulnerable] |

---

## Known Exploits

` + "```dataview\nTABLE name, exploit_type, reliability\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"exploit\" AND parent = \"[[Vulnerability - " + cve_id + "]]\"\n```" + `

---

## Indicators of Compromise

` + "```dataview\nTABLE indicator_type, indicator_value, confidence\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"indicator\" AND parent = \"[[Vulnerability - " + cve_id + "]]\"\n```" + `

---

## Detection

### Network-Based Detection
[Snort rules, Yara rules, network patterns]

### Host-Based Detection
[Event logs to monitor, file modifications, registry changes]

### Log Signatures
[IDS signatures, SIEM rules]

---

## Mitigation

### Patching
- Latest patch version: [Version number]
- Patch released: [Date]
- Patch status in environment: [Patched/Pending/Not applicable]

### Workarounds (if unpatched)
- [Workaround 1]
- [Workaround 2]

### Detection/Monitoring
- [Detection method 1]
- [Detection method 2]

---

## Real-World Exploitation

### Known Campaigns
- [Campaign 1 with source]
- [Campaign 2 with source]

### Threat Actors Using This CVE
` + "```dataview\nTABLE threat_name, origin_country, date_observed\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"threat_actor\" AND child = \"[[Vulnerability - " + cve_id + "]]\"\n```" + `

### Victims/Targets
[Organizations known to be affected]

---

## Timeline

| Date | Event | Source |
|------|-------|--------|
| ${published_date} | CVE Published | NVD |
| | PoC Released | [Source] |
| | Patch Released | [Vendor] |
| | Exploitation In Wild | [Source] |

---

## References

- [MITRE ATT&CK](https://nvd.nist.gov/vuln/detail/${cve_id})
- [Official Advisory]
- [Public PoC/Blog]

---

## Notes

[Additional analysis, organizational risk assessment, remediation priority, impact assessment]
`;

tR = frontmatter;
%>
