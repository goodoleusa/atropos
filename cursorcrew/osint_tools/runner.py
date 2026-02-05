"""
Run OSINT tools from Python and return structured raw findings.
Used by the tool-first pipeline so the crew only formats real API data.
"""
import json
import re
from typing import Any

from . import tools as ht


# Match IPv4 in text (simple; avoids private/reserved if needed)
_IPV4_RE = re.compile(r"\b(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\b")
_IPV6_RE = re.compile(r"\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b")


def _parse_ips_from_text(text: str) -> list[str]:
    """Extract unique IPv4 and IPv6 addresses from plain text (e.g. DNS output)."""
    if not text or "Error:" in text[:50]:
        return []
    ips = _IPV4_RE.findall(text) + _IPV6_RE.findall(text)
    return list(dict.fromkeys(ips))


def _parse_geo_line(geo_raw: str) -> dict[str, str]:
    """Parse HackerTarget ipgeo plain text into country, etc."""
    out: dict[str, str] = {}
    for line in (geo_raw or "").splitlines():
        line = line.strip()
        if ":" in line:
            k, _, v = line.partition(":")
            k, v = k.strip(), v.strip()
            if k and v:
                out[k.lower().replace(" ", "_")] = v
    return out


def _parse_asn_line(asn_raw: str) -> dict[str, str]:
    """Parse HackerTarget aslookup plain text (e.g. 'AS15169 | 8.8.8.8 | US | ...')."""
    out: dict[str, str] = {}
    if not asn_raw or "Error:" in asn_raw[:50]:
        return out
    # Common format: "AS15169 | 8.8.8.8 | US | Org Name" or line with "AS" in it
    as_match = re.search(r"\b(AS\d+)\b", asn_raw, re.I)
    if as_match:
        out["asn_number"] = as_match.group(1)
    lines = asn_raw.strip().split("\n")
    if lines:
        parts = [p.strip() for p in lines[0].split("|")]
        if len(parts) >= 3:
            out["country"] = parts[2]
        if len(parts) >= 4:
            out["asn_name"] = parts[3]
    return out


def _add_threat_intel_to_ip(ip_data: dict, ip: str) -> None:
    """Add VirusTotal and AbuseIPDB data to IP data dict if APIs available."""
    import osint_tools.tools as ht
    # VirusTotal
    if hasattr(ht, "virustotal_ip_report"):
        try:
            vt_ip = ht.virustotal_ip_report(ip)
            if vt_ip and not vt_ip.startswith("Error:"):
                ip_data["virustotal_ip_report"] = vt_ip
        except Exception:
            pass
    # AbuseIPDB
    if hasattr(ht, "abuseipdb_check"):
        try:
            abuse_ip = ht.abuseipdb_check(ip)
            if abuse_ip and not abuse_ip.startswith("Error:"):
                ip_data["abuseipdb_report"] = abuse_ip
        except Exception:
            pass


def gather_raw_osint(seed: str) -> dict[str, Any]:
    """
    Run HackerTarget lookups from Python. Returns a dict of raw and parsed data
    so the crew can convert it to entity JSON without inventing IPs/ASNs.

    - If seed looks like a domain: DNS lookup, then for each A record IP do geo + AS; WHOIS(domain).
    - If seed looks like an IP: geo, AS, reverse DNS, reverse IP.
    """
    seed = (seed or "").strip()
    if not seed:
        return {"seed": "", "seed_type": "unknown", "error": "Empty seed"}

    # Heuristic: domain has a TLD-like suffix and no digit-only segments that look like IP
    looks_like_domain = bool(
        re.match(r"^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$", seed, re.I)
        and not _IPV4_RE.match(seed)
    )
    looks_like_ip = bool(_IPV4_RE.match(seed) or (seed.count(":") >= 2 and ":" in seed))

    out: dict[str, Any] = {
        "seed": seed,
        "seed_type": "domain" if looks_like_domain else ("ip" if looks_like_ip else "unknown"),
        "dns_raw": "",
        "dns_a_records": [],
        "whois_raw": "",
        "ips": [],
        "ripestat_data": {},
        "virustotal_data": {},
        "abuseipdb_data": {},
    }

    if looks_like_domain:
        # DNS
        dns_raw = ht.hackertarget_dns_lookup(seed)
        out["dns_raw"] = dns_raw
        out["dns_a_records"] = _parse_ips_from_text(dns_raw)
        # WHOIS domain
        out["whois_raw"] = ht.hackertarget_whois(seed)
        # VirusTotal domain report (if key available)
        if hasattr(ht, "virustotal_domain_report"):
            try:
                vt_domain = ht.virustotal_domain_report(seed)
                if vt_domain and not vt_domain.startswith("Error:"):
                    out["virustotal_data"]["domain_report"] = vt_domain
            except Exception:
                pass
        # For each A record IP: geo + AS + RIPEStat + threat intel
        for ip in out["dns_a_records"][:10]:  # cap to avoid rate limit
            geo_raw = ht.hackertarget_ip_geo(ip)
            asn_raw = ht.hackertarget_as_lookup(ip)
            geo = _parse_geo_line(geo_raw)
            asn = _parse_asn_line(asn_raw)
            ip_data = {
                "ip": ip,
                "geo_raw": geo_raw,
                "asn_raw": asn_raw,
                "country": geo.get("country", ""),
                "asn_number": asn.get("asn_number", ""),
                "asn_name": asn.get("asn_name", ""),
            }
            # Add RIPEStat data for IP
            try:
                ripestat_net = ht.ripestat_network_info(ip)
                if ripestat_net and not ripestat_net.startswith("Error:"):
                    ip_data["ripestat_network_info"] = ripestat_net
                ripestat_geo = ht.ripestat_geoloc(ip)
                if ripestat_geo and not ripestat_geo.startswith("Error:"):
                    ip_data["ripestat_geoloc"] = ripestat_geo
            except Exception:
                pass  # RIPEStat optional
            # Add threat intel data
            _add_threat_intel_to_ip(ip_data, ip)
            out["ips"].append(ip_data)
            # Add RIPEStat ASN data if we found an ASN
            if asn.get("asn_number"):
                asn_num = asn["asn_number"].replace("AS", "")
                if asn_num not in out["ripestat_data"]:
                    try:
                        asn_info = ht.ripestat_asn_info(asn["asn_number"])
                        if asn_info and not asn_info.startswith("Error:"):
                            out["ripestat_data"][asn_num] = {
                                "asn_info": asn_info,
                            }
                        prefix_dist = ht.ripestat_prefix_size_distribution(asn["asn_number"])
                        if prefix_dist and not prefix_dist.startswith("Error:"):
                            out["ripestat_data"][asn_num]["prefix_distribution"] = prefix_dist
                    except Exception:
                        pass  # RIPEStat optional

    elif looks_like_ip:
        geo_raw = ht.hackertarget_ip_geo(seed)
        asn_raw = ht.hackertarget_as_lookup(seed)
        geo = _parse_geo_line(geo_raw)
        asn = _parse_asn_line(asn_raw)
        ip_data = {
            "ip": seed,
            "geo_raw": geo_raw,
            "asn_raw": asn_raw,
            "country": geo.get("country", ""),
            "asn_number": asn.get("asn_number", ""),
            "asn_name": asn.get("asn_name", ""),
        }
        # Add RIPEStat data for IP
        try:
            ripestat_net = ht.ripestat_network_info(seed)
            if ripestat_net and not ripestat_net.startswith("Error:"):
                ip_data["ripestat_network_info"] = ripestat_net
            ripestat_geo = ht.ripestat_geoloc(seed)
            if ripestat_geo and not ripestat_geo.startswith("Error:"):
                ip_data["ripestat_geoloc"] = ripestat_geo
            ripestat_routing = ht.ripestat_routing_history(seed)
            if ripestat_routing and not ripestat_routing.startswith("Error:"):
                ip_data["ripestat_routing_history"] = ripestat_routing
        except Exception:
            pass  # RIPEStat optional
        # Add VirusTotal and AbuseIPDB data for IP (if keys available)
        if hasattr(ht, "virustotal_ip_report"):
            try:
                vt_ip = ht.virustotal_ip_report(seed)
                if vt_ip and not vt_ip.startswith("Error:"):
                    ip_data["virustotal_ip_report"] = vt_ip
                    out["virustotal_data"]["ip_report"] = vt_ip
            except Exception:
                pass
        if hasattr(ht, "abuseipdb_check"):
            try:
                abuse_ip = ht.abuseipdb_check(seed)
                if abuse_ip and not abuse_ip.startswith("Error:"):
                    ip_data["abuseipdb_report"] = abuse_ip
                    out["abuseipdb_data"]["ip_report"] = abuse_ip
            except Exception:
                pass
        out["ips"].append(ip_data)
        out["reverse_dns_raw"] = ht.hackertarget_reverse_dns(seed)
        out["reverse_ip_raw"] = ht.hackertarget_reverse_ip(seed)
        out["whois_raw"] = ht.hackertarget_whois(seed)
        # Add RIPEStat ASN data if we found an ASN
        if asn.get("asn_number"):
            asn_num = asn["asn_number"].replace("AS", "")
            if asn_num not in out["ripestat_data"]:
                try:
                    asn_info = ht.ripestat_asn_info(asn["asn_number"])
                    if asn_info and not asn_info.startswith("Error:"):
                        out["ripestat_data"][asn_num] = {
                            "asn_info": asn_info,
                        }
                    prefix_dist = ht.ripestat_prefix_size_distribution(asn["asn_number"])
                    if prefix_dist and not prefix_dist.startswith("Error:"):
                        out["ripestat_data"][asn_num]["prefix_distribution"] = prefix_dist
                except Exception:
                    pass  # RIPEStat optional
    else:
        # Free-form seed: try as domain first, then nothing else
        dns_raw = ht.hackertarget_dns_lookup(seed)
        out["dns_raw"] = dns_raw
        out["dns_a_records"] = _parse_ips_from_text(dns_raw)
        for ip in out["dns_a_records"][:10]:
            geo_raw = ht.hackertarget_ip_geo(ip)
            asn_raw = ht.hackertarget_as_lookup(ip)
            geo = _parse_geo_line(geo_raw)
            asn = _parse_asn_line(asn_raw)
            ip_data = {
                "ip": ip,
                "geo_raw": geo_raw,
                "asn_raw": asn_raw,
                "country": geo.get("country", ""),
                "asn_number": asn.get("asn_number", ""),
                "asn_name": asn.get("asn_name", ""),
            }
            # Add RIPEStat data for IP
            try:
                ripestat_net = ht.ripestat_network_info(ip)
                if ripestat_net and not ripestat_net.startswith("Error:"):
                    ip_data["ripestat_network_info"] = ripestat_net
                ripestat_geo = ht.ripestat_geoloc(ip)
                if ripestat_geo and not ripestat_geo.startswith("Error:"):
                    ip_data["ripestat_geoloc"] = ripestat_geo
            except Exception:
                pass  # RIPEStat optional
            # Add threat intel data
            _add_threat_intel_to_ip(ip_data, ip)
            out["ips"].append(ip_data)
            # Add RIPEStat ASN data if we found an ASN
            if asn.get("asn_number"):
                asn_num = asn["asn_number"].replace("AS", "")
                if asn_num not in out["ripestat_data"]:
                    try:
                        asn_info = ht.ripestat_asn_info(asn["asn_number"])
                        if asn_info and not asn_info.startswith("Error:"):
                            out["ripestat_data"][asn_num] = {
                                "asn_info": asn_info,
                            }
                        prefix_dist = ht.ripestat_prefix_size_distribution(asn["asn_number"])
                        if prefix_dist and not prefix_dist.startswith("Error:"):
                            out["ripestat_data"][asn_num]["prefix_distribution"] = prefix_dist
                    except Exception:
                        pass  # RIPEStat optional
        out["whois_raw"] = ht.hackertarget_whois(seed)

    return out
