"""
OSINT investigation tool with optional wizard. Uses CrewAI + OpenRouter.
Run with no args for guided wizard; use --seed and related flags for non-interactive runs.
"""
import argparse
import os
import sys
from datetime import date

# Load .env before reading OPENROUTER_API_KEY or check_keys
try:
    from dotenv import load_dotenv
    _root = os.path.dirname(os.path.abspath(__file__))
    load_dotenv(os.path.join(_root, ".env"))
except ImportError:
    pass

# Reduce LiteLLM log noise
os.environ.setdefault("LITELLM_LOG", "WARNING")

# Weave optional
_weave_enabled = os.environ.get("WEAVE_ENABLED", "").lower() in ("1", "true", "yes") and os.environ.get("WEAVE_DISABLED", "").lower() not in ("1", "true", "yes") and os.environ.get("WANDB_DISABLED", "").lower() not in ("1", "true", "yes")
if _weave_enabled:
    try:
        import weave
        weave.init(project_name="crewai_osint")
    except Exception as e:
        print(f"weave: disabled ({e})", file=sys.stderr)
        _weave_enabled = False


def _check_keys_and_exit():
    """Print API key status and exit. Does not require OPENROUTER_API_KEY."""
    from osint_tools.config import check_keys, NO_KEY_TOOLS
    status = check_keys()
    print("API key status (values never shown):")
    for name, value in status.items():
        print(f"  {name}: {value}")
    print("\nTools that work without keys:", ", ".join(NO_KEY_TOOLS))
    sys.exit(0)


def _parse_entities_from_crew_output(text: str) -> list[dict]:
    """Extract a JSON array of entities from crew output (e.g. ```json ... ``` or raw JSON)."""
    import json
    import re
    text = (text or "").strip()
    # Try raw parse
    try:
        data = json.loads(text)
        if isinstance(data, list):
            return data
        if isinstance(data, dict) and "entities" in data:
            return data["entities"] if isinstance(data["entities"], list) else []
        if isinstance(data, dict):
            return [data]
    except json.JSONDecodeError:
        pass
    # Try to extract ```json ... ``` block
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        try:
            data = json.loads(match.group(1).strip())
            if isinstance(data, list):
                return data
            if isinstance(data, dict) and "entities" in data:
                return data["entities"] if isinstance(data["entities"], list) else []
        except json.JSONDecodeError:
            pass
    # Look for [...]
    match = re.search(r"\[\s*\{[\s\S]*\}\s*\]", text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return []


def _format_raw_findings_for_crew(raw: dict) -> str:
    """Turn gather_raw_osint() output into a string the crew can read."""
    lines = [
        f"Seed: {raw.get('seed', '')}",
        f"Seed type: {raw.get('seed_type', '')}",
        "",
        "DNS lookup (raw):",
        raw.get("dns_raw") or "(none)",
        "",
        "A records (IPs from DNS): " + ", ".join(raw.get("dns_a_records") or []),
        "",
        "IPs with geo and ASN:",
    ]
    for i, ip_info in enumerate(raw.get("ips") or [], 1):
        lines.append(f"  IP {i}: {ip_info.get('ip', '')} | country: {ip_info.get('country', '')} | ASN: {ip_info.get('asn_number', '')} | ASN name: {ip_info.get('asn_name', '')}")
        lines.append(f"    Geo raw: {ip_info.get('geo_raw', '')[:200]}...")
        lines.append(f"    ASN raw: {ip_info.get('asn_raw', '')[:200]}...")
        if ip_info.get("ripestat_network_info"):
            lines.append(f"    RIPEStat network info: {ip_info.get('ripestat_network_info', '')[:300]}...")
        if ip_info.get("ripestat_geoloc"):
            lines.append(f"    RIPEStat geoloc: {ip_info.get('ripestat_geoloc', '')[:300]}...")
        if ip_info.get("ripestat_routing_history"):
            lines.append(f"    RIPEStat routing history: {ip_info.get('ripestat_routing_history', '')[:300]}...")
        if ip_info.get("virustotal_ip_report"):
            lines.append(f"    VirusTotal IP report: {ip_info.get('virustotal_ip_report', '')[:300]}...")
        if ip_info.get("abuseipdb_report"):
            lines.append(f"    AbuseIPDB report: {ip_info.get('abuseipdb_report', '')[:300]}...")
    lines.extend(["", "WHOIS (raw):", (raw.get("whois_raw") or "(none)")[:1500]])
    if raw.get("virustotal_data", {}).get("domain_report"):
        lines.extend(["", "VirusTotal domain report:", raw["virustotal_data"]["domain_report"][:500]])
    if raw.get("reverse_dns_raw"):
        lines.extend(["", "Reverse DNS:", raw["reverse_dns_raw"][:500]])
    if raw.get("reverse_ip_raw"):
        lines.extend(["", "Reverse IP (hostnames on same IP):", raw["reverse_ip_raw"][:500]])
    # Add RIPEStat ASN data
    if raw.get("ripestat_data"):
        lines.append("")
        lines.append("RIPEStat ASN data:")
        for asn_num, asn_data in raw["ripestat_data"].items():
            lines.append(f"  ASN {asn_num}:")
            if asn_data.get("asn_info"):
                lines.append(f"    ASN info: {asn_data['asn_info'][:300]}...")
            if asn_data.get("prefix_distribution"):
                lines.append(f"    Prefix distribution: {asn_data['prefix_distribution'][:300]}...")
    return "\n".join(lines)


def _entities_from_raw_findings(raw: dict, investigation_id: str) -> list[dict]:
    """Build entity list directly from raw OSINT (no LLM). Guarantees real IPs/ASNs."""
    entities = []
    seed = raw.get("seed") or ""
    seed_type = raw.get("seed_type") or ""

    if seed_type == "domain" or (seed and not raw.get("ips")):
        entities.append({
            "type": "domain",
            "domain_name": seed,
            "confidence": "High",
            "investigation_id": investigation_id,
        })

    seen_asn = set()
    for ip_info in raw.get("ips") or []:
        ip = ip_info.get("ip")
        if not ip:
            continue
        entities.append({
            "type": "ip_address",
            "ip_address": ip,
            "country": ip_info.get("country", ""),
            "confidence": "High",
            "investigation_id": investigation_id,
        })
        asn = ip_info.get("asn_number")
        if asn and asn not in seen_asn:
            seen_asn.add(asn)
            entities.append({
                "type": "asn",
                "asn_number": asn,
                "asn_name": ip_info.get("asn_name", ""),
                "confidence": "High",
                "investigation_id": investigation_id,
            })

    return entities


def _run_investigation(seed: str, investigation_id: str, investigation_name: str, base_path: str) -> str:
    """
    Run OSINT crew (with HackerTarget tools), parse structured output, and write
    investigation + entity notes to Obsidian folder. Returns the investigation root path.
    """
    from osint_tools.config import get_obsidian_base_path, _normalize_path
    import obsidian_export

    base = (base_path and _normalize_path(base_path.strip())) or get_obsidian_base_path()
    entities: list[dict] = []
    summary = f"Investigation seeded with: {seed}"

    # Tool-first pipeline: run HackerTarget from Python so we have real IP/ASN data
    from osint_tools.runner import gather_raw_osint

    raw_findings = gather_raw_osint(seed)
    raw_findings_str = _format_raw_findings_for_crew(raw_findings)
    
    # Archive URLs from findings (headless archiver)
    try:
        from osint_tools.archiver import archive_urls_from_findings
        archived_paths = archive_urls_from_findings(raw_findings, base, investigation_id, max_urls=5)
        if archived_paths:
            summary = (summary or "") + f" Archived {len(archived_paths)} URL(s)."
    except Exception as e:
        import logging
        logging.getLogger(__name__).debug("Archiver not available or failed: %s", e)

    OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", os.environ.get("OPENAI_API_KEY"))
    if OPENROUTER_API_KEY:
        from crewai import Agent, Task, Crew, Process, LLM
        from osint_tools.tools import (
            get_hackertarget_crewai_tools,
            get_ripestat_crewai_tools,
            get_virustotal_crewai_tools,
            get_abuseipdb_crewai_tools,
        )

        llm = LLM(
            model="openrouter/openai/gpt-4o-mini",
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
            temperature=0,
        )

        # Get available tools
        ht_tools = get_hackertarget_crewai_tools()
        ripestat_tools = get_ripestat_crewai_tools()
        infrastructure_tools = ht_tools + ripestat_tools
        vt_tools = get_virustotal_crewai_tools()
        abuseipdb_tools = get_abuseipdb_crewai_tools()
        threat_intel_tools = vt_tools + abuseipdb_tools

        # 1. People & Corporation OSINT Specialist
        people_corp_agent = Agent(
            role="People & Corporation OSINT Specialist",
            goal="Identify individuals and organizations associated with the seed. Find social media profiles, corporate registrations, key personnel, subsidiaries, and business relationships.",
            backstory="Expert in corporate intelligence, public records research, and social media OSINT. Uses open-source databases, corporate registries, LinkedIn, and public profiles to map organizational structures and key personnel.",
            llm=llm,
            tools=[t for t in ht_tools if "WHOIS" in str(t)] if ht_tools else [],
            verbose=True,
            allow_delegation=False,
        )

        # 2. DNS & BGP Infrastructure Analyst
        infrastructure_agent = Agent(
            role="DNS & BGP Infrastructure Analyst",
            goal="Map DNS infrastructure, BGP routing, ASN peering relationships, and network topology. Identify shared infrastructure, hosting providers, and routing anomalies.",
            backstory="Network infrastructure expert specializing in DNS, BGP, and ASN analysis. Understands peering relationships, route hijacking indicators, and how to trace network ownership through BGP data.",
            llm=llm,
            tools=infrastructure_tools,
            verbose=True,
            allow_delegation=False,
        )

        # 3. Dark Web & Threat Intelligence Monitor
        darkweb_agent = Agent(
            role="Dark Web & Threat Intelligence Monitor",
            goal="Search dark web markets, forums, and threat intel sources for mentions of the seed. Identify threat actor discussions, leaked credentials, and malicious infrastructure.",
            backstory="Specialist in dark web research and threat intelligence aggregation. Monitors dark web markets, forums, paste sites, and threat intel feeds for indicators related to the investigation.",
            llm=llm,
            tools=threat_intel_tools,  # VirusTotal, AbuseIPDB if keys available
            verbose=True,
            allow_delegation=False,
        )

        # 4. Malware & Reverse Engineering Analyst
        malware_agent = Agent(
            role="Malware & Reverse Engineering Analyst",
            goal="Analyze malware samples, file hashes, and C2 infrastructure associated with the seed. Identify malware families, techniques (MITRE ATT&CK), and vulnerabilities exploited.",
            backstory="Malware analyst and reverse engineer. Examines samples, C2 infrastructure, and attack patterns to identify malware families, TTPs, and associated threat actors.",
            llm=llm,
            tools=vt_tools,  # VirusTotal if key available (Hybrid Analysis, Shodan to be added)
            verbose=True,
            allow_delegation=False,
        )

        # 5. Threat Intel & Geopolitical Analyst
        threat_intel_agent = Agent(
            role="Threat Intel & Geopolitical Analyst",
            goal="Monitor CVEs, zero-days, and threat intelligence through a geopolitical lens. Attribute attacks to nation-states, assess geopolitical context, and identify APT groups or state-sponsored campaigns.",
            backstory="Threat intelligence analyst with expertise in geopolitical attribution, APT tracking, and nation-state threat assessment. Correlates technical indicators with geopolitical events and known APT TTPs.",
            llm=llm,
            tools=[],
            verbose=True,
            allow_delegation=False,
        )

        # 6. OSINT Synthesis Coordinator
        coordinator_agent = Agent(
            role="OSINT Synthesis Coordinator",
            goal="Aggregate findings from all specialists, deduplicate entities, link relationships (parent/child/sibling), and format into the final JSON entity list for Obsidian export.",
            backstory="Experienced at synthesizing multi-source intelligence and structuring findings for investigation reports.",
            llm=llm,
            tools=[],
            verbose=True,
            allow_delegation=False,
        )

        # Tasks
        people_corp_task = Task(
            description="""For seed {seed}, identify associated people and organizations from the raw OSINT data.

Raw OSINT data:
---
{raw_findings}
---

Extract:
- Organizations from WHOIS data, ASN names, or domain registrations
- People mentioned in WHOIS contacts or organizational data
- Corporate relationships, subsidiaries, or parent companies if evident

Output a JSON array of person and organization entities. Use only data from the raw findings.""",
            expected_output="JSON array of person and organization entities, or empty array if none found.",
            agent=people_corp_agent,
        )

        infrastructure_task = Task(
            description="""Map DNS, BGP, and ASN infrastructure for {seed} using the raw OSINT data.

Raw OSINT data:
---
{raw_findings}
---

Extract:
- Domain entities (from seed if it's a domain)
- IP addresses (from DNS A records or IP seed)
- ASN entities (from ASN lookups and RIPEStat data)
- Include routing history, prefix data, and network information from RIPEStat

Output a JSON array of domain, ip_address, and asn entities. Use only data from the raw findings.""",
            expected_output="JSON array of domain, ip_address, and asn entities.",
            agent=infrastructure_agent,
        )

        darkweb_task = Task(
            description="""Search threat intel sources for {seed} in the raw OSINT data.

Raw OSINT data:
---
{raw_findings}
---

Identify:
- Threat actors or malicious infrastructure indicators
- IPs or domains flagged in threat intelligence
- Malware or phishing associations

Output a JSON array of threat_actor, ip_address (with threat indicators), or domain entities. Use only data from the raw findings.""",
            expected_output="JSON array of threat-related entities, or empty array if none found.",
            agent=darkweb_agent,
        )

        malware_task = Task(
            description="""Analyze malware and C2 infrastructure related to {seed} from the raw OSINT data.

Raw OSINT data:
---
{raw_findings}
---

Identify:
- C2 infrastructure (IPs or domains used for command and control)
- Malware families or attack techniques if mentioned
- Vulnerabilities or CVEs if referenced

Output a JSON array of technique, vulnerability, threat_actor, ip_address (C2), or domain (C2) entities. Use only data from the raw findings.""",
            expected_output="JSON array of malware/C2-related entities, or empty array if none found.",
            agent=malware_agent,
        )

        threat_intel_task = Task(
            description="""Assess CVEs, zero-days, and geopolitical attribution for {seed} from the raw OSINT data.

Raw OSINT data:
---
{raw_findings}
---

Identify:
- Vulnerabilities or CVEs mentioned
- Threat actors with geopolitical context
- MITRE ATT&CK techniques if referenced
- Nation-state or APT attribution if evident

Output a JSON array of vulnerability, threat_actor (with origin_country), or technique entities. Use only data from the raw findings.""",
            expected_output="JSON array of threat intel entities, or empty array if none found.",
            agent=threat_intel_agent,
        )

        synthesis_task = Task(
            description="""Aggregate all findings from the specialists into a single JSON entity array.

Raw OSINT data:
---
{raw_findings}
---

Specialist outputs:
- People & Corp: {people_corp_task.output}
- Infrastructure: {infrastructure_task.output}
- Dark Web: {darkweb_task.output}
- Malware: {malware_task.output}
- Threat Intel: {threat_intel_task.output}

Rules:
- Merge all entities from all specialist outputs into one JSON array
- Deduplicate by type and identifier (e.g., same IP address, same ASN, same domain)
- Add investigation_id: "{investigation_id}" to all entities
- Ensure each entity has a "type" field and appropriate type-specific fields
- Set confidence levels appropriately (High for data from APIs, Medium for inferred)
- If specialist outputs are not valid JSON arrays, extract JSON arrays from them or use empty arrays

Output ONLY a valid JSON array. No markdown, no explanation.""",
            expected_output="A single JSON array of all entity objects, deduplicated and formatted. No other text.",
            agent=coordinator_agent,
        )

        # Create crew with sequential process (each task runs in order, outputs available to later tasks)
        crew = Crew(
            agents=[people_corp_agent, infrastructure_agent, darkweb_agent, malware_agent, threat_intel_agent, coordinator_agent],
            tasks=[people_corp_task, infrastructure_task, darkweb_task, malware_task, threat_intel_task, synthesis_task],
            verbose=True,
            process=Process.sequential,
        )

        # Run crew
        result = crew.kickoff(inputs={
            "seed": seed,
            "raw_findings": raw_findings_str,
            "investigation_id": investigation_id,
        })
        print(result)
        entities = _parse_entities_from_crew_output(str(result))
        for e in entities:
            e["investigation_id"] = investigation_id
        if not entities:
            entities = _entities_from_raw_findings(raw_findings, investigation_id)
        if entities:
            summary = f"Investigation seeded with: {seed}. {len(entities)} entity/entities discovered."
        inv_root_pre = os.path.join(base, "10-Investigations", investigation_id)
        os.makedirs(inv_root_pre, exist_ok=True)
        raw_name = "".join(c if c.isalnum() or c in " -_" else "_" for c in seed).strip().replace(" ", "_") or "report"
        raw_path = os.path.join(inv_root_pre, f"{raw_name}_crew_output_{date.today().isoformat()}.md")
        with open(raw_path, "w", encoding="utf-8") as f:
            f.write(str(result))
        raw_data_path = os.path.join(inv_root_pre, f"{raw_name}_raw_osint_{date.today().isoformat()}.md")
        with open(raw_data_path, "w", encoding="utf-8") as f:
            f.write(raw_findings_str)
        
        # Hash raw data files and log in chain of custody
        try:
            from osint_tools.hashing import compute_file_hash
            raw_data_hash = compute_file_hash(raw_data_path)
            crew_output_hash = compute_file_hash(raw_path)
            if raw_data_hash:
                hash_file = raw_data_path + ".sha256"
                with open(hash_file, "w", encoding="utf-8") as hf:
                    hf.write(f"{raw_data_hash}  {os.path.basename(raw_data_path)}\n")
                # Log in chain of custody
                try:
                    from osint_tools.chain_of_custody import ChainOfCustody
                    coc_logger = ChainOfCustody(inv_root_pre, investigation_id)
                    rel_path = os.path.relpath(raw_data_path, inv_root_pre)
                    coc_logger.log_create(
                        rel_path,
                        file_hash=raw_data_hash,
                        comment="Raw OSINT data collected from APIs"
                    )
                except Exception:
                    pass
            if crew_output_hash:
                hash_file = raw_path + ".sha256"
                with open(hash_file, "w", encoding="utf-8") as hf:
                    hf.write(f"{crew_output_hash}  {os.path.basename(raw_path)}\n")
                # Log in chain of custody
                try:
                    from osint_tools.chain_of_custody import ChainOfCustody
                    coc_logger = ChainOfCustody(inv_root_pre, investigation_id)
                    rel_path = os.path.relpath(raw_path, inv_root_pre)
                    coc_logger.log_create(
                        rel_path,
                        file_hash=crew_output_hash,
                        comment="CrewAI agent output"
                    )
                except Exception:
                    pass
        except Exception:
            pass  # Hashing optional
    else:
        # No LLM: still write entities from raw findings only
        entities = _entities_from_raw_findings(raw_findings, investigation_id)
        if entities:
            summary = f"Investigation seeded with: {seed}. {len(entities)} entity/entities from API (no LLM)."
        inv_root_pre = os.path.join(base, "10-Investigations", investigation_id)
        os.makedirs(inv_root_pre, exist_ok=True)
        raw_name = "".join(c if c.isalnum() or c in " -_" else "_" for c in seed).strip().replace(" ", "_") or "report"
        raw_data_path = os.path.join(inv_root_pre, f"{raw_name}_raw_osint_{date.today().isoformat()}.md")
        with open(raw_data_path, "w", encoding="utf-8") as f:
            f.write(raw_findings_str)

    inv_root = obsidian_export.write_investigation(
        base,
        investigation_id,
        investigation_name,
        entities,
        severity="High",
        confidence="High",
        summary=summary,
    )
    
    # Initialize chain of custody logger
    coc_logger = None
    try:
        from osint_tools.chain_of_custody import ChainOfCustody
        coc_logger = ChainOfCustody(inv_root, investigation_id)
        coc_logger.log_create(
            "investigation_init",
            comment=f"Investigation initialized: {investigation_name} (seed: {seed})"
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).debug("Chain of custody logger initialization failed: %s", e)
    
    # Create hash manifest for all investigation files
    try:
        from osint_tools.hashing import hash_investigation_files
        hash_result = hash_investigation_files(inv_root, investigation_id, coc_logger=coc_logger)
        if hash_result.get("manifest_path"):
            print(f"Hash manifest created: {hash_result['manifest_path']}")
            print(f"  Total files hashed: {hash_result.get('total_files', 0)}")
    except Exception as e:
        import logging
        logging.getLogger(__name__).debug("Hash manifest creation failed: %s", e)
    
    # Log chain of custody completion
    if coc_logger:
        coc_logger.log_create(
            "investigation_complete",
            comment=f"Investigation completed: {len(entities)} entities discovered"
        )
        # Verify log integrity
        integrity_check = coc_logger.verify_log_integrity()
        if integrity_check.get("valid"):
            print(f"Chain of custody log: {coc_logger.log_file}")
            print(f"  Total entries: {integrity_check.get('total_entries', 0)}")
    
    return inv_root


def _export_to_pdf(inv_root: str, investigation_id: str, investigation_name: str, skip_pdf: bool = False) -> None:
    """Export investigation to PDF formats if not skipped."""
    if skip_pdf:
        return
    
    try:
        import pdf_export
        export_results = pdf_export.export_full_investigation(
            inv_root,
            investigation_id,
            investigation_name,
            include_entities=True,
            include_archived=True,
        )
        if export_results.get("report_pdf"):
            print(f"PDF report: {export_results['report_pdf']}")
        if export_results.get("entities_pdf"):
            print(f"PDF entities: {export_results['entities_pdf']}")
        if export_results.get("archived_zip"):
            print(f"Archived materials ZIP: {export_results['archived_zip']}")
    except Exception as e:
        import logging
        logging.getLogger(__name__).debug("PDF export not available or failed: %s", e)


def _parse_args():
    p = argparse.ArgumentParser(
        description="OSINT investigation tool (wizard when run with no args).",
    )
    p.add_argument("--seed", type=str, help="OSINT seed (domain, IP, URL, or description). Required if non-interactive.")
    p.add_argument("--investigation-id", "--inv-id", dest="investigation_id", type=str, help="Investigation ID (kebab-case).")
    p.add_argument("--investigation-name", "--inv-name", dest="investigation_name", type=str, help="Investigation display name.")
    p.add_argument("-o", "--output", type=str, help="Output base path (default: 10-Investigations in repo).")
    p.add_argument("--check-keys", action="store_true", help="Show API key status and exit.")
    p.add_argument("--no-wizard", "--batch", dest="no_wizard", action="store_true", help="Force non-interactive; fail if required args missing.")
    p.add_argument("--export-pdf", action="store_true", help="Export investigation to PDF format.")
    p.add_argument("--no-pdf", action="store_true", help="Skip PDF export (default: PDF export enabled).")
    p.add_argument("--export-only", type=str, metavar="INV_ID", help="Export existing investigation (by ID) to PDF/ZIP without running new investigation.")
    p.add_argument("--export-path", type=str, help="Base path for export (default: investigation folder).")
    p.add_argument("--verify-integrity", type=str, metavar="INV_ID", help="Verify integrity of investigation files using hash manifest.")
    p.add_argument("--view-chain-of-custody", type=str, metavar="INV_ID", help="View chain of custody log for investigation.")
    p.add_argument("--export-chain-of-custody", type=str, metavar="INV_ID", help="Export chain of custody log (format: json, txt, csv).")
    return p.parse_args()


def main():
    args = _parse_args()

    if args.check_keys:
        _check_keys_and_exit()
    
    if args.verify_integrity:
        from osint_tools.config import get_obsidian_base_path, _normalize_path
        from osint_tools.hashing import verify_investigation_integrity
        base = get_obsidian_base_path()
        inv_path = os.path.join(base, "10-Investigations", args.verify_integrity)
        if not os.path.exists(inv_path):
            print(f"Error: Investigation folder not found: {inv_path}", file=sys.stderr)
            sys.exit(1)
        result = verify_investigation_integrity(inv_path, args.verify_integrity)
        if result.get("valid"):
            print(f"✓ Integrity verification passed: {result.get('verified_files')} files verified.")
            sys.exit(0)
        else:
            print(f"✗ Integrity verification failed:")
            print(f"  Verified: {result.get('verified_files')}/{result.get('total_files')}")
            if result.get("failed_files"):
                print("  Failed files:")
                for f in result["failed_files"]:
                    print(f"    - {f.get('path')}: {f.get('reason')}")
            sys.exit(1)
    
    if args.view_chain_of_custody:
        from osint_tools.config import get_obsidian_base_path
        from osint_tools.chain_of_custody import ChainOfCustody
        base = get_obsidian_base_path()
        inv_path = os.path.join(base, "10-Investigations", args.view_chain_of_custody)
        if not os.path.exists(inv_path):
            print(f"Error: Investigation folder not found: {inv_path}", file=sys.stderr)
            sys.exit(1)
        coc_logger = ChainOfCustody(inv_path, args.view_chain_of_custody)
        integrity_check = coc_logger.verify_log_integrity()
        if not integrity_check.get("valid"):
            print(f"⚠ Warning: Chain of custody log integrity check failed: {integrity_check.get('error')}")
        print(f"\nChain of Custody Log for Investigation: {args.view_chain_of_custody}")
        print(f"Total Entries: {len(coc_logger.entries)}")
        print(f"Log Integrity: {'✓ Valid' if integrity_check.get('valid') else '✗ Invalid'}\n")
        for entry in coc_logger.entries[-20:]:  # Show last 20 entries
            print(f"[{entry['timestamp']}] {entry['operation'].upper()}: {entry.get('file_path', 'N/A')}")
            if entry.get('comment'):
                print(f"  Comment: {entry['comment']}")
            print()
        sys.exit(0)
    
    if args.export_chain_of_custody:
        from osint_tools.config import get_obsidian_base_path
        from osint_tools.chain_of_custody import ChainOfCustody
        base = get_obsidian_base_path()
        inv_path = os.path.join(base, "10-Investigations", args.export_chain_of_custody)
        if not os.path.exists(inv_path):
            print(f"Error: Investigation folder not found: {inv_path}", file=sys.stderr)
            sys.exit(1)
        coc_logger = ChainOfCustody(inv_path, args.export_chain_of_custody)
        # Default to JSON, but could parse format from argument if needed
        export_path = coc_logger.export_log(format="json")
        print(f"Chain of custody log exported to: {export_path}")
        sys.exit(0)

    # Non-interactive: require --seed (and optionally other args)
    if args.no_wizard or args.seed is not None:
        if not args.seed or not args.seed.strip():
            print("Error: --seed is required when using --no-wizard or when passing run arguments.", file=sys.stderr)
            sys.exit(1)
        seed = args.seed.strip()
        inv_id = (args.investigation_id or "").strip()
        if not inv_id:
            from osint_tools.wizard import _slug_from_seed
            inv_id = _slug_from_seed(seed)
        inv_name = (args.investigation_name or "").strip() or f"Investigation: {seed}"
        base_path = (args.output or "").strip() or None
        inv_root = _run_investigation(seed, inv_id, inv_name, base_path or "")
        print(f"\nInvestigation folder: {inv_root}")
        print("Open this folder in Obsidian to view entities.")
        _export_to_pdf(inv_root, inv_id, inv_name, skip_pdf=args.no_pdf)
        return

    # Wizard (no args)
    from osint_tools.wizard import run_menu, run_investigation_prompts

    while True:
        choice = run_menu()
        if choice == "exit":
            print("Bye.")
            break
        if choice == "check-keys":
            _check_keys_and_exit()
        if choice == "investigation":
            inputs = run_investigation_prompts()
            if inputs is None:
                print("Cancelled. Back to menu.")
                continue
            inv_root = _run_investigation(
                inputs["seed"],
                inputs["investigation_id"],
                inputs["investigation_name"],
                inputs["base_path"],
            )
            print(f"\nInvestigation folder: {inv_root}")
            print("Open this folder in Obsidian to view entities.")
            _export_to_pdf(inv_root, inputs["investigation_id"], inputs["investigation_name"], skip_pdf=False)
            break


if __name__ == "__main__":
    main()
