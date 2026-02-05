<%*
/**
 * ASN ENTITY TEMPLATE
 * Parent: Investigation → Organization
 * Links to: Organization (parent), other ASNs (sibling)
 */

const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const asn_number = await tp.system.prompt("ASN Number (e.g., AS12345)?", "AS");
if (!asn_number) { tR = ""; return; }

const asn_name = await tp.system.prompt("ASN Name/Organization?", "Unknown");
const country = await tp.system.prompt("Country?", "Unknown");
const isp_type = await tp.system.prompt("ISP Type (ISP/Hosting/Datacenter/Academic)?", "ISP");
const threat_level = await tp.system.prompt("Threat Level (Critical/High/Medium/Low)?", "Medium");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "Medium");
const parent_org = await tp.system.prompt("Parent Organization (filename, optional)?", "");
const sibling_asns = await tp.system.prompt("Sibling ASNs (comma-separated, optional)?", "");

const today = tp.date.now("YYYY-MM-DD");

let parentLink = "";
if (parent_org.trim()) {
  parentLink = `[[${parent_org}]]`;
}

let siblings = [];
if (sibling_asns.trim()) {
  siblings = sibling_asns.split(",").map(s => `[[${s.trim()}]]`).join("\n  - ");
}

const frontmatter = `---
type: asn
asn_number: "${asn_number}"
asn_name: "${asn_name}"
country: "${country}"
isp_type: ${isp_type}
threat_level: ${threat_level}
confidence: ${confidence}
investigation_id: "${investigation_id}"
parent: ${parentLink ? '"' + parentLink + '"' : []}
child: []
sibling: ${siblings ? "\n  - " + siblings : "[]"}
date_created: "${today}"
tags:
  - asn
  - "${investigation_id}"
  - osint
title: "ASN - ${asn_number}"
aliases:
  - "${asn_number}"
  - "${asn_name}"
---

# ASN - ${asn_number}

**ASN Number**: \`${asn_number}\`  
**Organization**: ${asn_name}  
**Country**: ${country}  
**ISP Type**: ${isp_type}  
**Threat Level**: ${threat_level}  
**Confidence**: ${confidence}  
**Investigation**: [[${investigation_name}]]  
**Created**: ${today}  

---

## Organization Details

| Property | Value |
|----------|-------|
| Legal Name | [Official registered name] |
| Headquarters | [Location] |
| Whois Contact | [Contact info] |
| Abuse Email | [abuse@example.com] |

---

## Network Info

` + "```dataview\nTABLE ip_address, asn, country, threat_level\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"ip_address\" AND asn = \"" + asn_number + "\"\nSORT threat_level DESC\n```" + `

---

## IP Ranges (CIDR)

- [CIDR Range 1]
- [CIDR Range 2]
- [CIDR Range 3]

---

## Related ASNs (Siblings)

` + "```dataview\nTABLE asn_name, country, isp_type\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"asn\" AND sibling = \"[[ASN - " + asn_number + "]]\"\n```" + `

---

## Reputation

- **BGP Hijacking History**: [Yes/No]
- **Known Hosting Malware**: [Yes/No]
- **Spam Reports**: [Count/Yes/No]
- **DDOS Victim/Source**: [Status]

---

## Notes

[Analytical notes on this ASN, phishing campaigns, malware hosting, etc.]
`;

tR = frontmatter;
%>
