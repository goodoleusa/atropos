"""
CrewAI OSINT tools: free API wrappers (Shodan InternetDB, HackerTarget, WHOIS, etc.).
Each tool is a @tool for use with Agent(tools=[...]). Keys from osint_tools.config.
"""
import json
import logging
import re
from urllib.parse import quote

from .config import get_api_key, is_key_set

logger = logging.getLogger(__name__)
_BASE_HT = "https://api.hackertarget.com"


def _get_ht_key() -> str:
    k = get_api_key("hackertarget")
    return (k or "") if isinstance(k, str) else ""


def _req(url: str, timeout: int = 15) -> str:
    try:
        import requests
        r = requests.get(url, timeout=timeout)
        r.raise_for_status()
        return r.text.strip()
    except Exception as e:
        logger.warning("Request failed %s: %s", url.split("?")[0], e)
        return f"Error: {e}"


def hackertarget_ip_geo(ip_address: str) -> str:
    """Look up IP geolocation (country, lat/lon) using HackerTarget. Free, no key required (50/day). Input: one IPv4 or IPv6 address."""
    ip = (ip_address or "").strip()
    if not ip or not re.match(r"^[\da-f.:]+$", ip, re.I):
        return "Invalid IP address."
    key = _get_ht_key()
    q = f"{_BASE_HT}/ipgeo/?q={quote(ip)}"
    if key:
        q += f"&apikey={quote(key)}"
    return _req(q)


def hackertarget_dns_lookup(domain: str) -> str:
    """Look up DNS records (A, AAAA, MX, NS, etc.) for a domain using HackerTarget. Free, no key required (50/day). Input: domain name (e.g. example.com)."""
    domain = (domain or "").strip().lower()
    if not domain or not re.match(r"^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$", domain):
        return "Invalid domain."
    key = _get_ht_key()
    q = f"{_BASE_HT}/dnslookup/?q={quote(domain)}"
    if key:
        q += f"&apikey={quote(key)}"
    return _req(q)


def hackertarget_reverse_dns(ip_address: str) -> str:
    """Reverse DNS lookup for an IP using HackerTarget. Free, no key required (50/day). Input: one IP address."""
    ip = (ip_address or "").strip()
    if not ip or not re.match(r"^[\da-f.:]+$", ip, re.I):
        return "Invalid IP address."
    key = _get_ht_key()
    q = f"{_BASE_HT}/reversedns/?q={quote(ip)}"
    if key:
        q += f"&apikey={quote(key)}"
    return _req(q)


def hackertarget_reverse_ip(ip_address: str) -> str:
    """Find hostnames sharing an IP (reverse IP / virtual hosts) using HackerTarget. Free, no key required (50/day). Input: one IP address."""
    ip = (ip_address or "").strip()
    if not ip or not re.match(r"^[\da-f.:]+$", ip, re.I):
        return "Invalid IP address."
    key = _get_ht_key()
    q = f"{_BASE_HT}/reverseiplookup/?q={quote(ip)}"
    if key:
        q += f"&apikey={quote(key)}"
    return _req(q)


def hackertarget_as_lookup(target: str) -> str:
    """ASN/autonomous system lookup by IP or AS number using HackerTarget. Free, no key required (50/day). Input: IP address or AS number (e.g. AS15169)."""
    target = (target or "").strip()
    if not target:
        return "Invalid target."
    key = _get_ht_key()
    q = f"{_BASE_HT}/aslookup/?q={quote(target)}"
    if key:
        q += f"&apikey={quote(key)}"
    return _req(q)


def hackertarget_whois(target: str) -> str:
    """WHOIS lookup for a domain or IP using HackerTarget. Free tier may require API key for whois. Input: domain or IP."""
    target = (target or "").strip()
    if not target:
        return "Invalid target."
    key = _get_ht_key()
    q = f"{_BASE_HT}/whois/?q={quote(target)}"
    if key:
        q += f"&apikey={quote(key)}"
    return _req(q)


def hackertarget_http_headers(url_or_host: str) -> str:
    """Fetch HTTP headers for a URL or host using HackerTarget. Free, no key required (50/day). Input: hostname or URL (e.g. https://example.com)."""
    host = (url_or_host or "").strip()
    if not host:
        return "Invalid host or URL."
    key = _get_ht_key()
    q = f"{_BASE_HT}/httpheaders/?q={quote(host)}"
    if key:
        q += f"&apikey={quote(key)}"
    return _req(q)


# Export list for CrewAI Agent(tools=[...])
HACKERTARGET_TOOLS = [
    hackertarget_ip_geo,
    hackertarget_dns_lookup,
    hackertarget_reverse_dns,
    hackertarget_reverse_ip,
    hackertarget_as_lookup,
    hackertarget_whois,
    hackertarget_http_headers,
]


def get_hackertarget_crewai_tools():
    """Return list of CrewAI @tool-wrapped HackerTarget functions for Agent(tools=...)."""
    try:
        from crewai import tool
        return [
            tool("HackerTarget IP Geolocation")(hackertarget_ip_geo),
            tool("HackerTarget DNS Lookup")(hackertarget_dns_lookup),
            tool("HackerTarget Reverse DNS")(hackertarget_reverse_dns),
            tool("HackerTarget Reverse IP")(hackertarget_reverse_ip),
            tool("HackerTarget AS/ASN Lookup")(hackertarget_as_lookup),
            tool("HackerTarget WHOIS")(hackertarget_whois),
            tool("HackerTarget HTTP Headers")(hackertarget_http_headers),
        ]
    except ImportError:
        return []


# RIPEStat API (free, no key required)
_BASE_RIPESTAT = "https://stat.ripe.net/data"


def _req_json(url: str, timeout: int = 15) -> dict:
    """Make JSON request and return parsed dict or error dict."""
    try:
        import requests
        r = requests.get(url, timeout=timeout, headers={"User-Agent": "OSINT-CrewAI-Tool/1.0"})
        r.raise_for_status()
        return r.json()
    except Exception as e:
        logger.warning("RIPEStat request failed %s: %s", url.split("?")[0], e)
        return {"error": str(e), "status": "error"}


def ripestat_routing_history(resource: str, starttime: str = "", endtime: str = "") -> str:
    """Get BGP routing history for IP/prefix/ASN using RIPEStat. Free, no key required. Input: IP address, prefix (CIDR), or ASN (e.g. 8.8.8.8, 8.8.8.0/24, AS15169). Optional: starttime/endtime in YYYY-MM-DD format."""
    resource = (resource or "").strip()
    if not resource:
        return "Error: Invalid resource (IP, prefix, or ASN required)."
    params = {"resource": resource, "sourceapp": "osint-crewai"}
    if starttime:
        params["starttime"] = starttime
    if endtime:
        params["endtime"]    = endtime
    qs = "&".join(f"{k}={quote(str(v))}" for k, v in params.items())
    url = f"{_BASE_RIPESTAT}/routing-history/data.json?{qs}"
    result = _req_json(url)
    if "error" in result:
        return f"Error: {result.get('error', 'Unknown error')}"
    try:
        return json.dumps(result, indent=2)
    except Exception:
        return str(result)


def ripestat_asn_info(asn: str) -> str:
    """Get ASN information and details using RIPEStat. Free, no key required. Input: ASN number (e.g. AS15169 or 15169)."""
    asn = (asn or "").strip().upper().replace("AS", "")
    if not asn or not asn.isdigit():
        return "Error: Invalid ASN (e.g. AS15169 or 15169)."
    url = f"{_BASE_RIPESTAT}/as-overview/data.json?resource=AS{asn}&sourceapp=osint-crewai"
    result = _req_json(url)
    if "error" in result:
        return f"Error: {result.get('error', 'Unknown error')}"
    try:
        return json.dumps(result, indent=2)
    except Exception:
        return str(result)


def ripestat_prefix_size_distribution(asn: str) -> str:
    """Get prefix size distribution for an ASN using RIPEStat. Free, no key required. Input: ASN number (e.g. AS15169 or 15169)."""
    asn = (asn or "").strip().upper().replace("AS", "")
    if not asn or not asn.isdigit():
        return "Error: Invalid ASN (e.g. AS15169 or 15169)."
    url = f"{_BASE_RIPESTAT}/prefix-size-distribution/data.json?resource=AS{asn}&sourceapp=osint-crewai"
    result = _req_json(url)
    if "error" in result:
        return f"Error: {result.get('error', 'Unknown error')}"
    try:
        return json.dumps(result, indent=2)
    except Exception:
        return str(result)


def ripestat_network_info(resource: str) -> str:
    """Get network information for IP/prefix using RIPEStat. Free, no key required. Input: IP address or prefix (CIDR, e.g. 8.8.8.8 or 8.8.8.0/24)."""
    resource = (resource or "").strip()
    if not resource:
        return "Error: Invalid resource (IP or prefix required)."
    url = f"{_BASE_RIPESTAT}/network-info/data.json?resource={quote(resource)}&sourceapp=osint-crewai"
    result = _req_json(url)
    if "error" in result:
        return f"Error: {result.get('error', 'Unknown error')}"
    try:
        return json.dumps(result, indent=2)
    except Exception:
        return str(result)


def ripestat_geoloc(resource: str) -> str:
    """Get geolocation data for IP/prefix using RIPEStat. Free, no key required. Input: IP address or prefix (CIDR)."""
    resource = (resource or "").strip()
    if not resource:
        return "Error: Invalid resource (IP or prefix required)."
    url = f"{_BASE_RIPESTAT}/geoloc/data.json?resource={quote(resource)}&sourceapp=osint-crewai"
    result = _req_json(url)
    if "error" in result:
        return f"Error: {result.get('error', 'Unknown error')}"
    try:
        return json.dumps(result, indent=2)
    except Exception:
        return str(result)


def ripestat_abuse_contacts(resource: str) -> str:
    """Get abuse contacts for IP/prefix/ASN using RIPEStat. Free, no key required. Input: IP address, prefix (CIDR), or ASN."""
    resource = (resource or "").strip()
    if not resource:
        return "Error: Invalid resource (IP, prefix, or ASN required)."
    url = f"{_BASE_RIPESTAT}/abuse-contact-finder/data.json?resource={quote(resource)}&sourceapp=osint-crewai"
    result = _req_json(url)
    if "error" in result:
        return f"Error: {result.get('error', 'Unknown error')}"
    try:
        return json.dumps(result, indent=2)
    except Exception:
        return str(result)


# Export list for CrewAI Agent(tools=[...])
RIPESTAT_TOOLS = [
    ripestat_routing_history,
    ripestat_asn_info,
    ripestat_prefix_size_distribution,
    ripestat_network_info,
    ripestat_geoloc,
    ripestat_abuse_contacts,
]


def get_ripestat_crewai_tools():
    """Return list of CrewAI @tool-wrapped RIPEStat functions for Agent(tools=...)."""
    try:
        from crewai import tool
        return [
            tool("RIPEStat Routing History")(ripestat_routing_history),
            tool("RIPEStat ASN Info")(ripestat_asn_info),
            tool("RIPEStat Prefix Size Distribution")(ripestat_prefix_size_distribution),
            tool("RIPEStat Network Info")(ripestat_network_info),
            tool("RIPEStat Geolocation")(ripestat_geoloc),
            tool("RIPEStat Abuse Contacts")(ripestat_abuse_contacts),
        ]
    except ImportError:
        return []


# VirusTotal API
_BASE_VT = "https://www.virustotal.com/api/v3"


def _get_vt_key() -> str:
    k = get_api_key("virustotal")
    return (k or "") if isinstance(k, str) else ""


def _req_vt(endpoint: str, timeout: int = 15) -> dict:
    """Make VirusTotal API request with API key header."""
    key = _get_vt_key()
    if not key:
        return {"error": "VirusTotal API key not set"}
    try:
        import requests
        url = f"{_BASE_VT}/{endpoint.lstrip('/')}"
        headers = {"x-apikey": key}
        r = requests.get(url, headers=headers, timeout=timeout)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        logger.warning("VirusTotal request failed %s: %s", endpoint, e)
        return {"error": str(e)}


def virustotal_domain_report(domain: str) -> str:
    """Get VirusTotal domain reputation report. Requires VIRUSTOTAL_API_KEY. Input: domain name (e.g. example.com)."""
    domain = (domain or "").strip().lower()
    if not domain or not re.match(r"^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$", domain):
        return "Error: Invalid domain."
    result = _req_vt(f"domains/{quote(domain)}")
    if "error" in result:
        return f"Error: {result.get('error', 'Unknown error')}"
    try:
        return json.dumps(result, indent=2)
    except Exception:
        return str(result)


def virustotal_ip_report(ip_address: str) -> str:
    """Get VirusTotal IP address reputation report. Requires VIRUSTOTAL_API_KEY. Input: IPv4 or IPv6 address."""
    ip = (ip_address or "").strip()
    if not ip or not re.match(r"^[\da-f.:]+$", ip, re.I):
        return "Error: Invalid IP address."
    result = _req_vt(f"ip_addresses/{quote(ip)}")
    if "error" in result:
        return f"Error: {result.get('error', 'Unknown error')}"
    try:
        return json.dumps(result, indent=2)
    except Exception:
        return str(result)


def virustotal_file_hash(hash_value: str) -> str:
    """Get VirusTotal file hash analysis report. Requires VIRUSTOTAL_API_KEY. Input: MD5, SHA1, or SHA256 hash."""
    hash_val = (hash_value or "").strip()
    if not hash_val or len(hash_val) not in (32, 40, 64):
        return "Error: Invalid hash (expected MD5/SHA1/SHA256)."
    result = _req_vt(f"files/{quote(hash_val)}")
    if "error" in result:
        return f"Error: {result.get('error', 'Unknown error')}"
    try:
        return json.dumps(result, indent=2)
    except Exception:
        return str(result)


# AbuseIPDB API
_BASE_ABUSEIPDB = "https://api.abuseipdb.com/api/v2"


def _get_abuseipdb_key() -> str:
    k = get_api_key("abuseipdb")
    return (k or "") if isinstance(k, str) else ""


def abuseipdb_check(ip_address: str, max_age_in_days: int = 90) -> str:
    """Check IP address reputation using AbuseIPDB. Requires ABUSEIPDB_API_KEY. Input: IPv4 address. Optional: max_age_in_days (default 90)."""
    ip = (ip_address or "").strip()
    if not ip or not re.match(r"^[\d.]+$", ip):
        return "Error: Invalid IPv4 address."
    key = _get_abuseipdb_key()
    if not key:
        return "Error: AbuseIPDB API key not set."
    try:
        import requests
        url = f"{_BASE_ABUSEIPDB}/check"
        headers = {"Key": key, "Accept": "application/json"}
        params = {"ipAddress": ip, "maxAgeInDays": max_age_in_days, "verbose": ""}
        r = requests.get(url, headers=headers, params=params, timeout=15)
        r.raise_for_status()
        return json.dumps(r.json(), indent=2)
    except Exception as e:
        logger.warning("AbuseIPDB request failed: %s", e)
        return f"Error: {e}"


# Export lists
VIRUSTOTAL_TOOLS = [
    virustotal_domain_report,
    virustotal_ip_report,
    virustotal_file_hash,
]

ABUSEIPDB_TOOLS = [
    abuseipdb_check,
]


def get_virustotal_crewai_tools():
    """Return list of CrewAI @tool-wrapped VirusTotal functions for Agent(tools=...)."""
    if not is_key_set("virustotal"):
        return []
    try:
        from crewai import tool
        return [
            tool("VirusTotal Domain Report")(virustotal_domain_report),
            tool("VirusTotal IP Report")(virustotal_ip_report),
            tool("VirusTotal File Hash")(virustotal_file_hash),
        ]
    except ImportError:
        return []


def get_abuseipdb_crewai_tools():
    """Return list of CrewAI @tool-wrapped AbuseIPDB functions for Agent(tools=...)."""
    if not is_key_set("abuseipdb"):
        return []
    try:
        from crewai import tool
        return [
            tool("AbuseIPDB IP Check")(abuseipdb_check),
        ]
    except ImportError:
        return []
