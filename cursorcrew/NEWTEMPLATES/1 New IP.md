<%*
/**
 * IP ADDRESS ENTITY TEMPLATE
 * Parent: Investigation → Organization
 * Links to: parent Organization, sibling IPs
 */

// Get investigation context (set by 2-New-Investigation)
const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

// Prompt for IP details
const ip_address = await tp.system.prompt("IP Address?", "192.168.1.1");
if (!ip_address) { tR = ""; return; }

const asn = await tp.system.prompt("ASN (e.g., AS12345)?", "");
const country = await tp.system.prompt("Country?", "Unknown");
const threat_level = await tp.system.prompt("Threat Level (Critical/High/Medium/Low)?", "Medium");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "Medium");
const parent_org = await tp.system.prompt("Parent Organization (exact filename)?", "");
const sibling_ips = await tp.system.prompt("Sibling IPs (comma-separated filenames)?", "");

const today = tp.date.now("YYYY-MM-DD");

// Parse sibling list
let siblings = [];
if (sibling_ips.trim()) {
  siblings = sibling_ips.split(",").map(s => `[[${s.trim()}]]`).join("\n  - ");
}

// Build parent link (Metadata Menu File field format)
let parentLink = "";
if (parent_org.trim()) {
  parentLink = `[[${parent_org}]]`;
}

// Build frontmatter
const frontmatter = `---
type: ip_address
ip_address: "${ip_address}"
asn: "${asn}"
country: "${country}"
threat_level: ${threat_level}
confidence: ${confidence}
investigation_id: "${investigation_id}"
parent: ${parentLink ? '"' + parentLink + '"' : []}
child: []
sibling: ${siblings ? "\n  - " + siblings : "[]"}
date_created: "${today}"
tags:
  - ip
  - "${investigation_id}"
  - osint
title: "IP - ${ip_address}"
aliases:
  - "IP ${ip_address}"
---

# IP - ${ip_address}

**IP Address**: \`${ip_address}\`  
**ASN**: ${asn || "Unknown"}  
**Country**: ${country}  
**Threat Level**: ${threat_level}  
**Confidence**: ${confidence}  
**Investigation**: [[${investigation_name}]]  
**Created**: ${today}  

---

## WHOIS Data

[Run WHOIS lookup and paste results, or manual notes]

---

## Shodan / Censys Results

[Paste relevant Shodan or Censys findings]

---

## Services Running

` + "```dataview\nTABLE port, service, confidence, status\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"service\" AND parent = \"[[IP - " + ip_address + "]]\"\nSORT port ASC\n```" + `

---

## Related IPs (Siblings)

` + "```dataview\nTABLE threat_level, asn, country\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"ip_address\" AND sibling = \"[[IP - " + ip_address + "]]\"\n```" + `

---

## Notes

[Analytical notes and observations]
`;

tR = frontmatter;
%>