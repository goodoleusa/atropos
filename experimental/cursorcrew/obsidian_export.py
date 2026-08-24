"""
Write OSINT investigation and entity notes to an Obsidian-style folder structure.
Entity notes match the 2-* template frontmatter/body style for Dataview compatibility.
"""
import os
import re
from datetime import date
from pathlib import Path
from typing import Any, Optional

# 64-char placeholder for SHA-256 hex; replaced iteratively so saved file hash matches.
_FILE_HASH_PLACEHOLDER = "0" * 64


def _compute_final_content_and_hash(content_with_placeholder: str, placeholder: str = _FILE_HASH_PLACEHOLDER) -> tuple[str, str]:
    """
    Compute hash of content that contains a placeholder; replace placeholder with hash
    iteratively so the final content's hash equals the value stored in it.
    Replaces in the original content each time (fixed-point iteration).
    Returns (final_content, final_hash).
    """
    try:
        from osint_tools.hashing import compute_string_hash
    except ImportError:
        return content_with_placeholder, ""
    if placeholder not in content_with_placeholder:
        h = compute_string_hash(content_with_placeholder)
        return content_with_placeholder, h
    prev_hash = None
    content = content_with_placeholder
    for _ in range(10):
        current_hash = compute_string_hash(content)
        if current_hash == prev_hash:
            return content, current_hash
        prev_hash = current_hash
        # Replace in original so the next hash is of content that contains current_hash
        content = content_with_placeholder.replace(placeholder, current_hash, 1)
    return content, compute_string_hash(content)


def _normalize_base_path(path: str) -> str:
    """Fix paths corrupted by escape interpretation (e.g. \\a -> bell on Windows)."""
    if not path or not isinstance(path, str):
        return path
    path = path.replace("\x07", "\\a").replace("\x08", "\\b").replace("\x0c", "\\f")
    path = path.replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")
    try:
        return str(Path(path).resolve())
    except (OSError, RuntimeError):
        return path.strip()


def safe_filename(title: str) -> str:
    """Sanitize for use as filename (no path chars, no colons for Windows)."""
    s = (title or "").strip()
    s = re.sub(r'[<>:"/\\|?*]', "", s)
    return s[:200] or "untitled"


def _slug(s: str) -> str:
    return re.sub(r"[^\w-]", "-", (s or "").strip()).strip("-").lower()[:50] or "unknown"


def _yaml_str(v: Any) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (list, tuple)):
        if not v:
            return "[]"
        return "\n  - " + "\n  - ".join(str(x) for x in v)
    s = str(v).strip()
    if "\n" in s or ":" in s or s in ("true", "false", "null"):
        return f'"{s.replace(chr(34), chr(92)+chr(34))}"'
    return f'"{s}"'


def _render_domain(e: dict, inv_id: str, today: str, file_hash: Optional[str] = None) -> str:
    name = e.get("domain_name") or e.get("name") or "unknown"
    hash_line = f'file_hash: "{file_hash}"\n' if file_hash else ""
    return f"""---
type: domain
date_created: "{today}"
investigation_id: "{inv_id}"
source_tool: "{e.get("source_tool", "osint")}"
confidence: {e.get("confidence", "Medium")}
status: active
parent: []
domain_name: "{name}"
{hash_line}tags:
  - domain
  - osint
  - "{inv_id}"
title: "Domain - {name}"
aliases:
  - "{name}"
---

# Domain: {name}

## Quick Facts

| Property | Value |
|----------|-------|
| Domain | {name} |
| Discovered | {today} |
| Confidence | {e.get("confidence", "Medium")} |

## Notes

[From OSINT crew]
"""


def _render_ip(e: dict, inv_id: str, today: str, file_hash: Optional[str] = None) -> str:
    ip = e.get("ip_address") or e.get("ip") or "unknown"
    sanitized = ip.replace(".", "-").replace(":", "-")
    routing_history = e.get("routing_history", "")
    bgp_announcements = e.get("bgp_announcements", "")
    geoloc_data = e.get("geoloc_data", "")
    hash_line = f'file_hash: "{file_hash}"\n' if file_hash else ""
    return f"""---
type: ip_address
date_created: "{today}"
investigation_id: "{inv_id}"
source_tool: "{e.get("source_tool", "osint")}"
confidence: {e.get("confidence", "Medium")}
status: active
ip_address: "{ip}"
ip_address_sanitized: "{sanitized}"
asn: "{e.get("asn", "")}"
country: "{e.get("country", "")}"
threat_level: {e.get("threat_level", "Medium")}
{hash_line}tags:
  - ip_address
  - osint
  - "{inv_id}"
title: "IP - {ip}"
aliases:
  - "{ip}"
---

# IP: {ip}

## Quick Facts

| Property | Value |
|----------|-------|
| IP | {ip} |
| ASN | {e.get("asn", "—")} |
| Country | {e.get("country", "—")} |
| Discovered | {today} |

{f"## Routing & BGP Information" if (routing_history or bgp_announcements) else ""}

{f"### Routing History\n{routing_history}\n" if routing_history else ""}
{f"### BGP Announcements\n{bgp_announcements}\n" if bgp_announcements else ""}
{f"### Geolocation Data\n{geoloc_data}\n" if geoloc_data else ""}

## Notes

[From OSINT crew]
"""


def _render_asn(e: dict, inv_id: str, today: str, file_hash: Optional[str] = None) -> str:
    asn = e.get("asn_number") or e.get("asn") or "unknown"
    peering = e.get("peering_relationships", "")
    bgp_routes = e.get("bgp_routes", "")
    routing_history = e.get("routing_history", "")
    prefix_dist = e.get("prefix_distribution", "")
    hash_line = f'file_hash: "{file_hash}"\n' if file_hash else ""
    return f"""---
type: asn
date_created: "{today}"
investigation_id: "{inv_id}"
source_tool: "{e.get("source_tool", "osint")}"
confidence: {e.get("confidence", "Medium")}
status: active
asn_number: "{asn}"
asn_name: "{e.get("asn_name", "")}"
country: "{e.get("country", "")}"
{hash_line}tags:
  - asn
  - osint
  - "{inv_id}"
title: "ASN - {asn}"
aliases:
  - "{asn}"
---

# ASN: {asn}

## Quick Facts

| Property | Value |
|----------|-------|
| ASN | {asn} |
| Name | {e.get("asn_name", "—")} |
| Country | {e.get("country", "—")} |
| Discovered | {today} |

{f"## BGP & Routing Information" if (peering or bgp_routes or routing_history or prefix_dist) else ""}

{f"### Peering Relationships\n{peering}\n" if peering else ""}
{f"### BGP Routes\n{bgp_routes}\n" if bgp_routes else ""}
{f"### Routing History\n{routing_history}\n" if routing_history else ""}
{f"### Prefix Distribution\n{prefix_dist}\n" if prefix_dist else ""}

## Notes

[From OSINT crew]
"""


def _render_organization(e: dict, inv_id: str, today: str, file_hash: Optional[str] = None) -> str:
    name = e.get("org_name") or e.get("name") or "unknown"
    subsidiaries = e.get("subsidiaries", [])
    parent_company = e.get("parent_company", "")
    corporate_reg = e.get("corporate_registration", "")
    key_personnel = e.get("key_personnel", [])
    hash_line = f'file_hash: "{file_hash}"\n' if file_hash else ""
    return f"""---
type: organization
date_created: "{today}"
investigation_id: "{inv_id}"
confidence: {e.get("confidence", "Medium")}
status: active
org_name: "{name}"
org_type: {e.get("org_type", "Private")}
country: "{e.get("country", "")}"
{hash_line}tags:
  - organization
  - osint
  - "{inv_id}"
title: "Organization - {name}"
aliases:
  - "{name}"
---

# Organization: {name}

## Quick Facts

| Property | Value |
|----------|-------|
| Organization | {name} |
| Type | {e.get("org_type", "—")} |
| Country | {e.get("country", "—")} |
| Discovered | {today} |

{f"## Corporate Structure" if (subsidiaries or parent_company or corporate_reg) else ""}

{f"### Parent Company\n{parent_company}\n" if parent_company else ""}
{f"### Subsidiaries\n" + "\\n".join(f"- {s}" for s in subsidiaries) + "\\n" if subsidiaries else ""}
{f"### Corporate Registration\n{corporate_reg}\n" if corporate_reg else ""}

{f"## Key Personnel" if key_personnel else ""}

{f"\\n".join(f"- {p}" for p in key_personnel) + "\\n" if key_personnel else ""}

## Notes

[From OSINT crew]
"""


def _render_person(e: dict, inv_id: str, today: str, file_hash: Optional[str] = None) -> str:
    name = e.get("person_name") or e.get("name") or "unknown"
    social_profiles = e.get("social_profiles", [])
    email = e.get("email", "")
    linkedin = e.get("linkedin", "")
    corporate_role = e.get("corporate_role", "")
    hash_line = f'file_hash: "{file_hash}"\n' if file_hash else ""
    return f"""---
type: person
date_created: "{today}"
investigation_id: "{inv_id}"
confidence: {e.get("confidence", "Medium")}
status: active
person_name: "{name}"
role: "{e.get("role", "")}"
organization: "{e.get("organization", "")}"
{hash_line}tags:
  - person
  - osint
  - "{inv_id}"
title: "Person - {name}"
aliases:
  - "{name}"
---

# Person: {name}

## Quick Facts

| Property | Value |
|----------|-------|
| Name | {name} |
| Role | {e.get("role", "—")} |
| Organization | {e.get("organization", "—")} |
| Discovered | {today} |

{f"## Contact Information" if (email or linkedin or social_profiles) else ""}

{f"### Email\n{email}\n" if email else ""}
{f"### LinkedIn\n{linkedin}\n" if linkedin else ""}
{f"### Social Profiles\n" + "\\n".join(f"- {p}" for p in social_profiles) + "\\n" if social_profiles else ""}

{f"## Corporate Role\n{corporate_role}\n" if corporate_role else ""}

## Notes

[From OSINT crew]
"""


def _render_threat_actor(e: dict, inv_id: str, today: str, file_hash: Optional[str] = None) -> str:
    name = e.get("threat_name") or e.get("name") or "unknown"
    geopolitical_context = e.get("geopolitical_context", "")
    attribution_confidence = e.get("attribution_confidence", "")
    suspected_nation_state = e.get("suspected_nation_state", "")
    hash_line = f'file_hash: "{file_hash}"\n' if file_hash else ""
    return f"""---
type: threat_actor
date_created: "{today}"
investigation_id: "{inv_id}"
threat_name: "{name}"
origin_country: "{e.get("origin_country", "")}"
threat_type: {e.get("threat_type", "Unknown")}
confidence: {e.get("confidence", "Medium")}
{hash_line}tags:
  - threat-actor
  - osint
  - "{inv_id}"
title: "Threat Actor - {name}"
aliases:
  - "{name}"
---

# Threat Actor: {name}

## Quick Facts

| Property | Value |
|----------|-------|
| Name | {name} |
| Origin | {e.get("origin_country", "—")} |
| Type | {e.get("threat_type", "—")} |
| Discovered | {today} |

{f"## Geopolitical Context" if (geopolitical_context or suspected_nation_state or attribution_confidence) else ""}

{f"### Suspected Nation State\n{suspected_nation_state}\n" if suspected_nation_state else ""}
{f"### Attribution Confidence\n{attribution_confidence}\n" if attribution_confidence else ""}
{f"### Geopolitical Context\n{geopolitical_context}\n" if geopolitical_context else ""}

## Notes

[From OSINT crew]
"""


def _render_technique(e: dict, inv_id: str, today: str, file_hash: Optional[str] = None) -> str:
    name = e.get("technique_name") or e.get("name") or "unknown"
    tid = e.get("technique_id") or e.get("mitre_id") or ""
    hash_line = f'file_hash: "{file_hash}"\n' if file_hash else ""
    return f"""---
type: technique
date_created: "{today}"
investigation_id: "{inv_id}"
technique_name: "{name}"
technique_id: "{tid}"
tactic: "{e.get("tactic", "")}"
{hash_line}tags:
  - technique
  - osint
  - "{inv_id}"
title: "Technique - {name}"
aliases:
  - "{name}"
  - "{tid}"
---

# Technique: {name}

## Quick Facts

| Property | Value |
|----------|-------|
| Name | {name} |
| MITRE ID | {tid or "—"} |
| Tactic | {e.get("tactic", "—")} |
| Discovered | {today} |

## Notes

[From OSINT crew]
"""


def _render_vulnerability(e: dict, inv_id: str, today: str, file_hash: Optional[str] = None) -> str:
    cve = e.get("cve_id") or e.get("cve") or "unknown"
    title = e.get("vulnerability_title") or e.get("title") or cve
    exploited_by = e.get("exploited_by_threat_actors", [])
    geopolitical_relevance = e.get("geopolitical_relevance", "")
    zero_day_status = e.get("zero_day_status", "")
    hash_line = f'file_hash: "{file_hash}"\n' if file_hash else ""
    return f"""---
type: vulnerability
date_created: "{today}"
investigation_id: "{inv_id}"
cve_id: "{cve}"
vulnerability_title: "{title}"
severity: {e.get("severity", "Unknown")}
{hash_line}tags:
  - vulnerability
  - osint
  - "{inv_id}"
title: "Vulnerability - {cve}"
aliases:
  - "{cve}"
---

# Vulnerability: {cve}

## Quick Facts

| Property | Value |
|----------|-------|
| CVE | {cve} |
| Title | {title} |
| Severity | {e.get("severity", "—")} |
| Discovered | {today} |

{f"## Threat Intelligence" if (exploited_by or geopolitical_relevance or zero_day_status) else ""}

{f"### Exploited By Threat Actors\n" + "\\n".join(f"- {t}" for t in exploited_by) + "\\n" if exploited_by else ""}
{f"### Zero-Day Status\n{zero_day_status}\n" if zero_day_status else ""}
{f"### Geopolitical Relevance\n{geopolitical_relevance}\n" if geopolitical_relevance else ""}

## Notes

[From OSINT crew]
"""


_RENDERERS = {
    "domain": (_render_domain, "domain"),
    "ip_address": (_render_ip, "ip"),
    "ip": (_render_ip, "ip"),
    "asn": (_render_asn, "asn"),
    "organization": (_render_organization, "organization"),
    "person": (_render_person, "person"),
    "threat_actor": (_render_threat_actor, "threat_actor"),
    "technique": (_render_technique, "technique"),
    "vulnerability": (_render_vulnerability, "vulnerability"),
}


def write_investigation(
    base_path: str,
    investigation_id: str,
    investigation_name: str,
    entities: list[dict],
    *,
    severity: str = "High",
    confidence: str = "High",
    summary: str = "",
) -> str:
    """
    Create investigation folder and write investigation note + one note per entity.
    Returns the path to the investigation root folder.
    """
    base_path = _normalize_base_path(base_path)
    today = date.today().isoformat()
    inv_root = os.path.join(base_path, investigation_id)
    subdirs = ["domain", "asn", "organization", "person", "ip", "threat_actor", "technique", "vulnerability"]
    os.makedirs(inv_root, exist_ok=True)
    for d in subdirs:
        os.makedirs(os.path.join(inv_root, d), exist_ok=True)
    
    # Create .obsidianignore file in investigation folder to exclude hash files
    obsidianignore_path = os.path.join(inv_root, ".obsidianignore")
    if not os.path.exists(obsidianignore_path):
        with open(obsidianignore_path, "w", encoding="utf-8") as f:
            f.write("""# Obsidian ignore file - exclude hash files and other non-markdown files from indexing

# Exclude cryptographic hash files
*.sha256
*.md5
*.sha1
*.sha512

# Exclude JSON/TXT chain of custody and manifest files (keep them but don't index)
*_chain_of_custody.json
*_chain_of_custody.txt
*_hash_manifest.json
*_hash_manifest.txt

# Exclude PDF exports (keep them but don't index)
*.pdf

# Exclude ZIP archives
*.zip

# Exclude archived HTML content (keep but don't index)
archived_content/
""")

    # Investigation note
    inv_note = f"""---
type: investigation
date_created: "{today}"
date_modified: "{today}"
investigation_id: "{investigation_id}"
investigation_name: "{investigation_name}"
severity: {severity}
confidence: {confidence}
urgency: High
status: active
parent: []
child: []
sibling: []
file_hash: "{_FILE_HASH_PLACEHOLDER}"
tags:
  - investigation
  - osint
  - "{investigation_id}"
title: "{investigation_name}"
aliases:
  - "{investigation_name}"
  - "{investigation_id}"
---

# {investigation_name}

**Investigation ID**: `{investigation_id}`
**Started**: {today}
**Status**: Active

---

## Executive Summary

{summary or "(No summary)"}

---

## Entities Discovered

{len(entities)} entity/entities written to subfolders.

---

## Timeline

| Date | Event | Status |
|------|-------|--------|
| {today} | Investigation opened | Active |
"""
    # Compute final content and hash so stored hash matches file content
    inv_note, file_hash = _compute_final_content_and_hash(inv_note)
    
    inv_path = os.path.join(inv_root, safe_filename(f"Investigation - {investigation_name}") + ".md")
    with open(inv_path, "w", encoding="utf-8") as f:
        f.write(inv_note)
    
    # Create .sha256 file (but Obsidian will ignore it)
    if file_hash:
        hash_file = inv_path + ".sha256"
        with open(hash_file, "w", encoding="utf-8") as hf:
            hf.write(f"{file_hash}  {os.path.basename(inv_path)}\n")
        
        # Log in chain of custody if logger available
        try:
            from osint_tools.chain_of_custody import ChainOfCustody
            rel_path = os.path.relpath(inv_path, inv_root)
            coc_logger = ChainOfCustody(inv_root, investigation_id)
            coc_logger.log_create(
                rel_path,
                file_hash=file_hash,
                comment=f"Investigation report created: {investigation_name}"
            )
        except Exception:
            pass  # Chain of custody optional

    # Entity notes
    for entity in entities:
        t = (entity.get("type") or "").strip().lower()
        if t not in _RENDERERS:
            continue
        render_fn, subdir = _RENDERERS[t]
        if t == "ip_address" or t == "ip":
            subdir = "ip"
        title = (entity.get("title") or entity.get("domain_name") or entity.get("ip_address") or
                 entity.get("asn_number") or entity.get("asn") or entity.get("org_name") or
                 entity.get("person_name") or entity.get("threat_name") or entity.get("technique_name") or
                 entity.get("cve_id") or entity.get("name") or "unknown")
        if t in ("domain",):
            filename = safe_filename(f"Domain - {title}") + ".md"
        elif t in ("ip_address", "ip"):
            filename = safe_filename(f"IP - {title}") + ".md"
        elif t == "asn":
            filename = safe_filename(f"ASN - {title}") + ".md"
        elif t == "organization":
            filename = safe_filename(f"Organization - {title}") + ".md"
        elif t == "person":
            filename = safe_filename(f"Person - {title}") + ".md"
        elif t == "threat_actor":
            filename = safe_filename(f"Threat Actor - {title}") + ".md"
        elif t == "technique":
            filename = safe_filename(f"Technique - {title}") + ".md"
        elif t == "vulnerability":
            filename = safe_filename(f"Vulnerability - {title}") + ".md"
        else:
            filename = safe_filename(str(title)) + ".md"
        out_path = os.path.join(inv_root, subdir, filename)
        
        # Render with placeholder, then compute final content and hash so stored hash matches file
        content_with_placeholder = render_fn(entity, investigation_id, today, file_hash=_FILE_HASH_PLACEHOLDER)
        content, file_hash = _compute_final_content_and_hash(content_with_placeholder)
        
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        # Create .sha256 file (but Obsidian will ignore it)
        if file_hash:
            hash_file = out_path + ".sha256"
            with open(hash_file, "w", encoding="utf-8") as hf:
                hf.write(f"{file_hash}  {filename}\n")
            
            # Log in chain of custody if logger available
            try:
                from osint_tools.chain_of_custody import ChainOfCustody
                rel_path = os.path.relpath(out_path, inv_root)
                coc_logger = ChainOfCustody(inv_root, investigation_id)
                coc_logger.log_create(
                    rel_path,
                    file_hash=file_hash,
                    comment=f"Entity file created: {t} - {title}"
                )
            except Exception:
                pass  # Chain of custody optional

    return inv_root
