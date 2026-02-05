<%*
/**
 * 2-New Organization — code runs FIRST. Prompts then outputs frontmatter + body.
 */
const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const org_name = await tp.system.prompt("Organization name?", "Acme Corp");
if (!org_name) { tR = ""; return; }

const org_type = await tp.system.prompt("Type (Private/Government/NGO/Research)?", "Private");
const country = await tp.system.prompt("Country?", "Unknown");
const country_code = await tp.system.prompt("Country code (2-letter)?", "");
const headquarters = await tp.system.prompt("Headquarters?", "");
const registration_number = await tp.system.prompt("Registration number?", "");
const website = await tp.system.prompt("Website?", "");
const now = tp.date.now("YYYY-MM-DD");
const source_tool = await tp.system.prompt("Source tool?", "manual");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "Medium");
const parent_org = await tp.system.prompt("Parent company (filename, optional)?", "");
let parentLink = "";
if (parent_org.trim()) parentLink = `[[${parent_org.trim()}]]`;

const content = `---
type: organization
date_created: "${now}"
date_modified: "${now}"
investigation_id: "${investigation_id}"
source_tool: "${source_tool}"
confidence: ${confidence}
status: active
parent: ${parentLink ? '"' + parentLink + '"' : []}
child: []
sibling: []
org_name: "${org_name}"
org_type: ${org_type}
country: "${country}"
country_code: "${country_code}"
headquarters: "${headquarters}"
registration_number: "${registration_number}"
website: "${website}"
dba_names: []
subsidiaries: []
known_contacts: []
is_hosting_provider: false
is_government: false
is_nation_state: false
is_malicious: false
is_shell_company: false
tags:
  - organization
  - osint
  - ${investigation_id}
title: "Organization - ${org_name}"
aliases:
  - "${org_name}"
---

# Organization: ${org_name}

## Quick Facts

| Property | Value |
|----------|-------|
| Organization | ${org_name} |
| Type | ${org_type} |
| Country | ${country} ${country_code ? "(" + country_code + ")" : ""} |
| Headquarters | ${headquarters || "—"} |
| Registration Number | ${registration_number || "—"} |
| Website | ${website || "—"} |
| Discovered | ${now} |
| Confidence | ${confidence} |

## Classification

- **Hosting Provider**: false
- **Government Entity**: false
- **Nation State**: false
- **Malicious Entity**: false
- **Shell Company**: false

## Organization Structure

### Aliases & DBA Names
[Add aliases and DBA names]

### Subsidiaries
[Add subsidiary companies]

### Known Contacts
[Add known contacts, board members, officers]

## Relationships

- **Parent Company**: ${parent_org.trim() ? `[[${parent_org.trim()}]]` : "—"}
- **Infrastructure Owned** (Domains/IPs): []
- **Related Organizations**: []

## Investigation Tasks

- [ ] Verify legal structure (SEC, Companies House, corporate databases)
- [ ] Link to domains owned (WHOIS registrant, DNS SOA)
- [ ] Link to IP ranges (WHOIS, BGP analysis)
- [ ] Verify WHOIS registrant accuracy
- [ ] Document ownership chain (parent companies, shareholders)
- [ ] Check government affiliations (OFAC, sanctions lists)
- [ ] Map corporate connections (board members, shared infrastructure)

## Infrastructure Connected

### Domains Owned

` + "```dataview\nTABLE title, date_created, confidence\nFROM \"20-Entities\"\nWHERE investigation_id = \"" + investigation_id + "\" AND type = \"domain\"\nSORT date_created DESC\n```" + `

### IP Ranges

` + "```dataview\nTABLE title, asn, country, date_created\nFROM \"20-Entities\"\nWHERE investigation_id = \"" + investigation_id + "\" AND type = \"ip_address\"\nSORT date_created DESC\n```" + `

### Associated Organizations

` + "```dataview\nTABLE title, org_type, country, date_created\nFROM \"20-Entities\"\nWHERE investigation_id = \"" + investigation_id + "\" AND type = \"organization\"\nSORT date_created DESC\n```" + `

---

## Timeline

| Date | Event |
|------|-------|
| ${now} | Discovered via ${source_tool} |

---

## Notes

[Add observations about organizational behavior, suspected operations, or connections to threats]
`;

tR = content;
%>
