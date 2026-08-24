<%*
/**
 * DOMAIN ENTITY TEMPLATE
 * Parent: Investigation → Organization
 * Links to: Organization (parent), other domains (sibling)
 */

const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const domain_name = await tp.system.prompt("Domain Name (e.g., example.com)?", "example.com");
if (!domain_name) { tR = ""; return; }

const registrar = await tp.system.prompt("Registrar (e.g., GoDaddy)?", "Unknown");
const registration_date = await tp.system.prompt("Registration Date (YYYY-MM-DD)?", "Unknown");
const expiration_date = await tp.system.prompt("Expiration Date (YYYY-MM-DD)?", "Unknown");
const registrant_country = await tp.system.prompt("Registrant Country?", "Unknown");
const threat_level = await tp.system.prompt("Threat Level (Critical/High/Medium/Low)?", "Medium");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "Medium");
const parent_org = await tp.system.prompt("Parent Organization (filename, optional)?", "");
const sibling_domains = await tp.system.prompt("Sibling Domains (comma-separated, optional)?", "");

const today = tp.date.now("YYYY-MM-DD");

let parentLink = "";
if (parent_org.trim()) {
  parentLink = `[[${parent_org}]]`;
}

let siblings = [];
if (sibling_domains.trim()) {
  siblings = sibling_domains.split(",").map(s => `[[${s.trim()}]]`).join("\n  - ");
}

const frontmatter = `---
type: domain
domain_name: "${domain_name}"
registrar: "${registrar}"
registration_date: "${registration_date}"
expiration_date: "${expiration_date}"
registrant_country: "${registrant_country}"
threat_level: ${threat_level}
confidence: ${confidence}
investigation_id: "${investigation_id}"
parent: ${parentLink ? '"' + parentLink + '"' : []}
child: []
sibling: ${siblings ? "\n  - " + siblings : "[]"}
date_created: "${today}"
tags:
  - domain
  - "${investigation_id}"
  - osint
title: "Domain - ${domain_name}"
aliases:
  - "${domain_name}"
---

# Domain - ${domain_name}

**Domain**: \`${domain_name}\`  
**Registrar**: ${registrar}  
**Registered**: ${registration_date}  
**Expires**: ${expiration_date}  
**Registrant Country**: ${registrant_country}  
**Threat Level**: ${threat_level}  
**Confidence**: ${confidence}  
**Investigation**: [[${investigation_name}]]  
**Created**: ${today}  

---

## WHOIS Data

| Property | Value |
|----------|-------|
| Registrant Name | [From WHOIS] |
| Registrant Email | [From WHOIS] |
| Admin Contact | [From WHOIS] |
| Tech Contact | [From WHOIS] |
| Nameservers | [ns1.example.com, ns2.example.com] |

---

## DNS Records

` + "```\nA Record: [IP address]\nMX Record: [mail server]\nTXT Record: [SPF/DKIM/DMARC]\nCNAME: [Aliases]\nNS: [Nameservers]\n```" + `

---

## Certificate Info

| Property | Value |
|----------|-------|
| Issuer | [Let's Encrypt / DigiCert / etc.] |
| Valid From | [Date] |
| Valid Until | [Date] |
| Fingerprint | [SHA256] |
| Alternative Names | [SAN list] |

---

## Related IPs

` + "```dataview\nTABLE ip_address, asn, country, threat_level\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"ip_address\" AND contains(resolve_to, \"[[Domain - " + domain_name + "]]\")\nSORT threat_level DESC\n```" + `

---

## Related Domains (Siblings)

` + "```dataview\nTABLE registrar, threat_level, expiration_date\nFROM \"10-Investigations/" + investigation_id + "\"\nWHERE type = \"domain\" AND sibling = \"[[Domain - " + domain_name + "]]\"\n```" + `

---

## URL Analysis

[Paste results from URLhaus, PhishTank, etc.]

---

## Passive DNS History

[Historical IP resolutions, nameserver changes, etc.]

---

## Notes

[Analytical notes on domain purpose, phishing/malware hosting, C&C activity, etc.]
`;

tR = frontmatter;
%>
