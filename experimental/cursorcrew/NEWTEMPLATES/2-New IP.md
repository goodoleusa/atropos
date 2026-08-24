<%*
/**
 * 2-New IP — code runs FIRST. Prompts for IP + context, then outputs frontmatter + body.
 * Uses window.investigation_id / investigation_name when set (e.g. from 2-New Investigation).
 */
const investigation_id = window.investigation_id || await tp.system.prompt("Investigation ID?", "unknown");
const investigation_name = window.investigation_name || "Unknown Investigation";

const ip_address = await tp.system.prompt("IP Address?", "192.168.1.1");
if (!ip_address) { tR = ""; return; }

const sanitized_ip = ip_address.replace(/\./g, "-");
const now = tp.date.now("YYYY-MM-DD");
const source_tool = await tp.system.prompt("Source tool (nmap/shodan/censys/manual)?", "manual");
const confidence = await tp.system.prompt("Confidence (High/Medium/Low)?", "Medium");
const threat_level = await tp.system.prompt("Threat Level (Critical/High/Medium/Low)?", "Medium");
const asn = await tp.system.prompt("ASN (e.g. AS12345)?", "");
const country = await tp.system.prompt("Country?", "Unknown");
const country_code = await tp.system.prompt("Country code (2-letter)?", "");
const isp = await tp.system.prompt("ISP?", "");
const hosting_provider = await tp.system.prompt("Hosting provider?", "");
const vpn_provider = await tp.system.prompt("VPN provider (or leave blank)?", "");
const ip_version = ip_address.includes(":") ? "IPv6" : "IPv4";

const parent_org = await tp.system.prompt("Parent (Investigation or Org filename, optional)?", "");
let parentLink = "";
if (parent_org.trim()) parentLink = `[[${parent_org.trim()}]]`;

const content = `---
type: ip_address
date_created: "${now}"
date_modified: "${now}"
investigation_id: "${investigation_id}"
source_tool: "${source_tool}"
confidence: ${confidence}
status: active
parent: ${parentLink ? '"' + parentLink + '"' : []}
sibling: []
child: []
ip_address: "${ip_address}"
ip_address_sanitized: "${sanitized_ip}"
ip_version: ${ip_version}
asn: "${asn || ""}"
country: "${country}"
country_code: "${country_code}"
isp: "${isp}"
hosting_provider: "${hosting_provider}"
vpn_provider: "${vpn_provider}"
threat_level: ${threat_level}
open_ports: []
closed_ports: []
service_fingerprints: []
blocklisted: false
malware_reports: false
is_proxy: false
is_datacenter: false
tags:
  - ip_address
  - osint
  - ${sanitized_ip}
  - ${investigation_id}
title: "IP ${ip_address}"
aliases:
  - "${ip_address}"
  - "${sanitized_ip}"
---

# IP Address: ${ip_address}

**File name**: \`IP ${sanitized_ip}\`  
**Original format**: ${ip_address}  

## Quick Facts

| Property         | Value                                |
| ---------------- | ------------------------------------ |
| IP               | ${ip_address}                        |
| Version          | ${ip_version}                        |
| ASN              | ${asn || "—"}                        |
| Country          | ${country} ${country_code ? "(" + country_code + ")" : ""} |
| ISP              | ${isp || "—"}                        |
| Hosting Provider | ${hosting_provider || "—"}           |
| Discovered       | ${now}                               |
| Confidence       | ${confidence}                        |

## Classification

- **Threat Level**: ${threat_level}
- **Investigation**: [[${investigation_name}]]

## Network Services

### Open Ports
[Add open ports and services]

### Closed Ports
[Add closed ports]

### Service Fingerprints
[Add from Shodan/Censys]

### Reverse DNS
[Add reverse DNS lookup result]

---

## Relationships

- **Parent**: ${parent_org.trim() ? `[[${parent_org.trim()}]]` : "—"}
- **Sibling IPs**: —
- **Related**: —

---

## Investigation Tasks

- [ ] Identify hosting provider (WHOIS, MaxMind)
- [ ] Scan for open ports (Shodan, Censys, Nmap)
- [ ] Reverse DNS lookup
- [ ] Link to domains (certificate transparency, DNS records)
- [ ] Check threat intelligence (VirusTotal, AbuseIPDB)
- [ ] Link to owning organization

---

## Timeline

| Date | Event |
|------|-------|
| ${now} | Discovered via ${source_tool} |

---

## Related Entities

` + "```dataview\nTABLE type, ip_address, confidence, date_created\nFROM \"10-Investigations\"\nWHERE investigation_id = \"" + investigation_id + "\" AND type = \"ip_address\"\nSORT date_created DESC\n```" + `

---

## Notes

[Add observations about IP behavior, hosting patterns, or threat indicators]
`;

tR = content;
%>
