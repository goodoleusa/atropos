<%*
/**
 * 2-New Domain — code runs FIRST. Prompts then outputs frontmatter + body.
 */
const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const entity_value = await tp.system.prompt("Domain name (e.g. example.com)?", "example.com");
if (!entity_value) { tR = ""; return; }

const slugified = entity_value.replace(/\./g, "-").toLowerCase();
const now = tp.date.now("YYYY-MM-DD");
const source_tool = await tp.system.prompt("Source tool (whois/dig/shodan/manual)?", "manual");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "Medium");
const parent_org = await tp.system.prompt("Parent Organization (filename, optional)?", "");
let parentLink = "";
if (parent_org.trim()) parentLink = `[[${parent_org.trim()}]]`;

const content = `---
type: domain
date_created: "${now}"
date_modified: "${now}"
investigation_id: "${investigation_id}"
source_tool: "${source_tool}"
confidence: ${confidence}
status: active
parent: ${parentLink ? '"' + parentLink + '"' : []}
sibling: []
child: []
domain_name: "${entity_value}"
registrar: null
nameservers: []
dns_a: []
dns_mx: []
registrant_email: null
registrant_org: null
registration_date: null
expiration_date: null
blocklisted: false
malware_reports: false
phishing_reports: false
tags:
  - domain
  - osint
  - ${slugified}
  - ${investigation_id}
title: "Domain - ${entity_value}"
aliases:
  - "${entity_value}"
---

# Domain: ${entity_value}

## Quick Facts

| Property | Value |
|----------|-------|
| Domain | ${entity_value} |
| Discovered | ${now} |
| Confidence | ${confidence} |
| Source | ${source_tool} |
| Investigation | [[${investigation_name}]] |

---

## Classification

- **Blocklisted**: false
- **Malware Reports**: false
- **Phishing Reports**: false
- **Status**: active

---

## DNS & Technical

### A Records
[Add DNS A records]

### MX Records
[Add MX records]

### Nameservers
[Add nameservers]

---

## Registrant Information

- **Email**: —
- **Organization**: —
- **Registration Date**: —
- **Expiration Date**: —

---

## Relationships

- **Parent Organization**: ${parent_org.trim() ? `[[${parent_org.trim()}]]` : "—"}
- **Hosted On IPs**: []
- **Related Domains**: []

---

## Investigation Tasks

- [ ] Verify registrant organization
- [ ] Check historical DNS records (DNSdumpster, archive.org)
- [ ] Link to hosting IP
- [ ] Verify owner organization
- [ ] Check WHOIS privacy status
- [ ] Look up SSL certificates

---

## Timeline

| Date | Event |
|------|-------|
| ${now} | Discovered via ${source_tool} |

---

## Related Entities

` + "```dataview\nTABLE type, confidence, date_created\nFROM \"20-Entities\"\nWHERE investigation_id = \"" + investigation_id + "\" AND (parent = this.file.link OR contains(string(child), this.file.name) OR contains(string(related), this.file.name))\nSORT date_created DESC\n```" + `

---

## Notes

[Add observations]
`;

tR = content;
%>
