<%*
/**
 * 2-New ASN — code runs FIRST. Prompts then outputs frontmatter + body.
 */
const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const asn_number = await tp.system.prompt("ASN number (e.g. AS12345)?", "AS");
if (!asn_number) { tR = ""; return; }

const asn_name = await tp.system.prompt("ASN name / organization?", "Unknown");
const country = await tp.system.prompt("Country?", "Unknown");
const country_code = await tp.system.prompt("Country code (2-letter)?", "");
const isp = await tp.system.prompt("ISP?", "");
const organization = await tp.system.prompt("Organization?", "");
const now = tp.date.now("YYYY-MM-DD");
const source_tool = await tp.system.prompt("Source tool?", "manual");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "Medium");
const parent_org = await tp.system.prompt("Parent (Investigation or Org filename, optional)?", "");
let parentLink = "";
if (parent_org.trim()) parentLink = `[[${parent_org.trim()}]]`;

const content = `---
type: asn
date_created: "${now}"
date_modified: "${now}"
investigation_id: "${investigation_id}"
source_tool: "${source_tool}"
confidence: ${confidence}
status: active
parent: ${parentLink ? '"' + parentLink + '"' : []}
sibling: []
child: []
asn_number: "${asn_number}"
asn_name: "${asn_name}"
country: "${country}"
country_code: "${country_code}"
isp: "${isp}"
organization: "${organization}"
ip_ranges: []
is_nation_state: false
is_hosting: false
is_cdn_provider: false
is_vpn_provider: false
is_datacenter: false
bgp_hijack_history: false
tags:
  - asn
  - osint
  - ${investigation_id}
title: "ASN ${asn_number}"
aliases:
  - "${asn_number}"
---

# Autonomous System: ${asn_number}

## Quick Facts

| Property | Value |
|----------|-------|
| ASN | ${asn_number} |
| ASN Name | ${asn_name} |
| ISP/Provider | ${isp} |
| Organization | ${organization} |
| Country | ${country} ${country_code ? "(" + country_code + ")" : ""} |
| Discovered | ${now} |
| Confidence | ${confidence} |

## Classification

- **Nation State Infrastructure**: false
- **Hosting Provider**: false
- **CDN Provider**: false
- **VPN Provider**: false
- **Datacenter**: false
- **BGP Hijack History**: false

## IP Space

**IP Ranges**: [Add IP ranges here]

## Relationships

- **Parent**: ${parent_org.trim() ? `[[${parent_org.trim()}]]` : "—"}
- **Peer ASNs**: []

## Investigation Tasks

- [ ] Map IP ranges (WHOIS APNIC, RIPE, ARIN)
- [ ] Identify primary use (hosting, ISP, government)
- [ ] Link to organizations (company registrant)
- [ ] Check historical records (WHOIS history, BGP history)
- [ ] Verify routing information (BGPView, PeeringDB)
- [ ] Check for BGP hijacking incidents
- [ ] Analyze peering relationships (PeeringDB, ASRank)
- [ ] Link to discovered IPs in this range

## Infrastructure in ASN

### Discovered IPs

` + "```dataview\nTABLE ip_address, country, date_created\nFROM \"10-Investigations\"\nWHERE investigation_id = \"" + investigation_id + "\" AND type = \"ip_address\" AND asn = \"" + asn_number + "\"\nSORT date_created DESC\n```" + `

### Related ASNs

` + "```dataview\nTABLE title, country, date_created\nFROM \"20-Entities\"\nWHERE investigation_id = \"" + investigation_id + "\" AND type = \"asn\"\nSORT date_created DESC\n```" + `

---

## Timeline

| Date | Event |
|------|-------|
| ${now} | Discovered via ${source_tool} |

---

## Notes

[Add observations about ASN behavior, abuse indicators, or suspected use]
`;

tR = content;
%>
