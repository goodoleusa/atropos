#!/usr/bin/env python3
"""
OSINT Toolkit Service - Integrated from dev-lu/osint_toolkit
Provides: IOC analysis, newsfeed aggregation, IOC extraction, domain lookup
Runs as a subprocess called by Node.js backend
"""

import json
import sys
import re
import socket
import ssl
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone

try:
    import dns.resolver
    HAS_DNS = True
except ImportError:
    HAS_DNS = False

try:
    import feedparser
    HAS_FEEDPARSER = True
except ImportError:
    HAS_FEEDPARSER = False

try:
    import whois
    HAS_WHOIS = True
except ImportError:
    HAS_WHOIS = False

IOC_TYPES = {
    'IPV4': 'IPv4',
    'IPV6': 'IPv6',
    'MD5': 'MD5',
    'SHA1': 'SHA1',
    'SHA256': 'SHA256',
    'URL': 'URL',
    'DOMAIN': 'Domain',
    'EMAIL': 'Email',
    'CVE': 'CVE',
    'UNKNOWN': 'unknown',
}

IOC_PATTERNS = {
    'IPv4': re.compile(r"^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$"),
    'IPv6': re.compile(r"^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$", re.IGNORECASE),
    'MD5': re.compile(r"^[a-f0-9]{32}$", re.IGNORECASE),
    'SHA1': re.compile(r"^[a-f0-9]{40}$", re.IGNORECASE),
    'SHA256': re.compile(r"^[a-f0-9]{64}$", re.IGNORECASE),
    'URL': re.compile(r"^https?://", re.IGNORECASE),
    'Domain': re.compile(r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$"),
    'Email': re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"),
    'CVE': re.compile(r"^CVE-\d{4}-\d{4,}$", re.IGNORECASE),
}

EXTRACT_PATTERNS = {
    'ipv4': re.compile(r'\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b'),
    'ipv6': re.compile(r'\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b'),
    'domain': re.compile(r'\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|edu|gov|mil|int|io|co|uk|de|fr|ru|cn|jp|br|in|au|ca|info|biz|xyz|me|tv|cc|us|eu)\b'),
    'url': re.compile(r'https?://[^\s<>"\']+'),
    'email': re.compile(r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b'),
    'md5': re.compile(r'\b[a-f0-9]{32}\b', re.IGNORECASE),
    'sha1': re.compile(r'\b[a-f0-9]{40}\b', re.IGNORECASE),
    'sha256': re.compile(r'\b[a-f0-9]{64}\b', re.IGNORECASE),
    'cve': re.compile(r'\bCVE-\d{4}-\d{4,}\b', re.IGNORECASE),
}

DEFAULT_FEEDS = [
    {"name": "The Hacker News", "url": "https://feeds.feedburner.com/TheHackersNews"},
    {"name": "Krebs on Security", "url": "https://krebsonsecurity.com/feed/"},
    {"name": "Dark Reading", "url": "https://www.darkreading.com/rss_simple.asp"},
    {"name": "SecurityWeek", "url": "https://feeds.feedburner.com/securityweek"},
    {"name": "The Record", "url": "https://therecord.media/feed"},
    {"name": "CyberScoop", "url": "https://www.cyberscoop.com/news/threats/feed"},
    {"name": "Helpnet Security", "url": "https://www.helpnetsecurity.com/feed/"},
    {"name": "TechCrunch Security", "url": "https://techcrunch.com/category/security/feed"},
    {"name": "BleepingComputer", "url": "https://www.bleepingcomputer.com/feed/"},
    {"name": "The DFIR Report", "url": "https://thedfirreport.com/feed/atom"},
]


def determine_ioc_type(ioc):
    ioc = ioc.strip()
    for type_name in ['MD5', 'SHA1', 'SHA256', 'IPv4', 'IPv6', 'CVE', 'URL', 'Domain', 'Email']:
        if IOC_PATTERNS[type_name].match(ioc):
            return type_name
    return 'unknown'


def extract_iocs(text):
    results = {}
    for ioc_type, pattern in EXTRACT_PATTERNS.items():
        matches = list(set(pattern.findall(text)))
        if matches:
            results[ioc_type] = matches
    return results


def dns_lookup(target):
    results = {}
    if not HAS_DNS:
        try:
            ips = socket.getaddrinfo(target, None)
            results['A'] = list(set(addr[4][0] for addr in ips if addr[0] == socket.AF_INET))
            results['AAAA'] = list(set(addr[4][0] for addr in ips if addr[0] == socket.AF_INET6))
        except Exception as e:
            results['error'] = str(e)
        return results

    record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'SOA', 'CNAME']
    for rtype in record_types:
        try:
            resolver = dns.resolver.Resolver()
            resolver.timeout = 5
            resolver.lifetime = 5
            answers = resolver.resolve(target, rtype)
            records = []
            for rdata in answers:
                if rtype == 'MX':
                    records.append({"priority": rdata.preference, "exchange": str(rdata.exchange)})
                elif rtype == 'SOA':
                    records.append({
                        "mname": str(rdata.mname),
                        "rname": str(rdata.rname),
                        "serial": rdata.serial,
                    })
                else:
                    records.append(str(rdata))
            if records:
                results[rtype] = records
        except Exception:
            pass
    return results


def whois_lookup(target):
    if not HAS_WHOIS:
        return {"error": "python-whois not installed"}
    try:
        w = whois.whois(target)
        result = {}
        for key in ['domain_name', 'registrar', 'whois_server', 'creation_date',
                     'expiration_date', 'updated_date', 'name_servers', 'status',
                     'emails', 'org', 'address', 'city', 'state', 'country']:
            val = getattr(w, key, None)
            if val is not None:
                if isinstance(val, (list, tuple)):
                    result[key] = [str(v) for v in val]
                elif hasattr(val, 'isoformat'):
                    result[key] = val.isoformat()
                else:
                    result[key] = str(val)
        return result
    except Exception as e:
        return {"error": str(e)}


def http_headers(target):
    url = target if target.startswith('http') else f'https://{target}'
    try:
        req = urllib.request.Request(url, method='HEAD')
        req.add_header('User-Agent', 'OSINT-Toolkit/1.0')
        with urllib.request.urlopen(req, timeout=10) as resp:
            headers = dict(resp.headers)
            security_headers = {}
            for h in ['Strict-Transport-Security', 'Content-Security-Policy', 'X-Frame-Options',
                       'X-Content-Type-Options', 'X-XSS-Protection', 'Referrer-Policy',
                       'Permissions-Policy', 'Access-Control-Allow-Origin']:
                val = resp.headers.get(h)
                security_headers[h] = val if val else "MISSING"
            return {
                "status": resp.status,
                "headers": headers,
                "security_headers": security_headers,
                "url": resp.url,
                "server": resp.headers.get('Server', 'unknown')
            }
    except Exception as e:
        return {"error": str(e)}


def ssl_cert_info(target):
    domain = target.replace('https://', '').replace('http://', '').split('/')[0].split(':')[0]
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
            s.settimeout(10)
            s.connect((domain, 443))
            cert = s.getpeercert()
            return {
                "subject": dict(x[0] for x in cert.get('subject', [])),
                "issuer": dict(x[0] for x in cert.get('issuer', [])),
                "version": cert.get('version'),
                "serialNumber": cert.get('serialNumber'),
                "notBefore": cert.get('notBefore'),
                "notAfter": cert.get('notAfter'),
                "subjectAltName": [x[1] for x in cert.get('subjectAltName', [])],
            }
    except Exception as e:
        return {"error": str(e)}


def cert_transparency(target):
    domain = target.replace('https://', '').replace('http://', '').split('/')[0]
    try:
        url = f'https://crt.sh/?q=%25.{domain}&output=json'
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'OSINT-Toolkit/1.0')
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            subdomains = set()
            certs = []
            for entry in data[:50]:
                name = entry.get('name_value', '')
                for n in name.split('\n'):
                    n = n.strip()
                    if n and '*' not in n:
                        subdomains.add(n)
                certs.append({
                    "id": entry.get('id'),
                    "issuer": entry.get('issuer_name'),
                    "name": entry.get('name_value'),
                    "not_before": entry.get('not_before'),
                    "not_after": entry.get('not_after'),
                })
            return {
                "subdomains": sorted(subdomains)[:100],
                "certificates": certs[:20],
                "total_certs": len(data),
            }
    except Exception as e:
        return {"error": str(e)}


def reverse_dns(ip):
    try:
        hostname = socket.gethostbyaddr(ip)
        return {"hostname": hostname[0], "aliases": hostname[1], "addresses": hostname[2]}
    except Exception as e:
        return {"error": str(e)}


def port_check(target, ports=None):
    if ports is None:
        ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5432, 8080, 8443]
    domain = target.replace('https://', '').replace('http://', '').split('/')[0].split(':')[0]
    try:
        ip = socket.gethostbyname(domain)
    except Exception:
        ip = domain

    open_ports = []
    for port in ports:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            result = s.connect_ex((ip, port))
            if result == 0:
                service = {21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
                           80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 445: 'SMB',
                           993: 'IMAPS', 995: 'POP3S', 3306: 'MySQL', 3389: 'RDP',
                           5432: 'PostgreSQL', 8080: 'HTTP-Alt', 8443: 'HTTPS-Alt'}.get(port, 'unknown')
                open_ports.append({"port": port, "service": service, "state": "open"})
            s.close()
        except Exception:
            pass
    return {"ip": ip, "target": domain, "open_ports": open_ports}


def fetch_newsfeed(max_items=30):
    if not HAS_FEEDPARSER:
        return {"error": "feedparser not installed", "articles": []}

    articles = []
    for feed_info in DEFAULT_FEEDS:
        try:
            feed = feedparser.parse(feed_info["url"])
            for entry in feed.entries[:5]:
                pub_date = ""
                if hasattr(entry, 'published'):
                    pub_date = entry.published
                elif hasattr(entry, 'updated'):
                    pub_date = entry.updated

                summary = ""
                if hasattr(entry, 'summary'):
                    summary = re.sub(r'<[^>]+>', '', entry.summary)[:300]
                elif hasattr(entry, 'description'):
                    summary = re.sub(r'<[^>]+>', '', entry.description)[:300]

                articles.append({
                    "title": entry.get('title', 'Untitled'),
                    "link": entry.get('link', ''),
                    "source": feed_info["name"],
                    "published": pub_date,
                    "summary": summary,
                })
        except Exception:
            pass

    articles.sort(key=lambda x: x.get('published', ''), reverse=True)
    return {"articles": articles[:max_items], "feed_count": len(DEFAULT_FEEDS)}


def ioc_lookup(ioc_value):
    ioc_type = determine_ioc_type(ioc_value)
    result = {
        "ioc": ioc_value,
        "type": ioc_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "lookups": {}
    }

    if ioc_type in ('IPv4', 'IPv6'):
        result["lookups"]["reverse_dns"] = reverse_dns(ioc_value)
        result["lookups"]["port_scan"] = port_check(ioc_value, [22, 80, 443, 8080, 8443])
    elif ioc_type == 'Domain':
        result["lookups"]["dns"] = dns_lookup(ioc_value)
        result["lookups"]["whois"] = whois_lookup(ioc_value)
        result["lookups"]["http_headers"] = http_headers(ioc_value)
        result["lookups"]["ssl_cert"] = ssl_cert_info(ioc_value)
        result["lookups"]["cert_transparency"] = cert_transparency(ioc_value)
    elif ioc_type == 'URL':
        parsed = urllib.parse.urlparse(ioc_value)
        domain = parsed.hostname
        if domain:
            result["lookups"]["dns"] = dns_lookup(domain)
            result["lookups"]["http_headers"] = http_headers(ioc_value)
            result["lookups"]["ssl_cert"] = ssl_cert_info(domain)
    elif ioc_type == 'Email':
        domain = ioc_value.split('@')[1]
        result["lookups"]["domain_dns"] = dns_lookup(domain)
        result["lookups"]["domain_mx"] = dns_lookup(domain)
    elif ioc_type in ('MD5', 'SHA1', 'SHA256'):
        result["lookups"]["note"] = "Hash lookups require API keys (VirusTotal, Hybrid Analysis). Use the API Data tab for hash analysis."
    elif ioc_type == 'CVE':
        try:
            cve_id = ioc_value.upper()
            url = f'https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}'
            req = urllib.request.Request(url)
            req.add_header('User-Agent', 'OSINT-Toolkit/1.0')
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode())
                if data.get('vulnerabilities'):
                    vuln = data['vulnerabilities'][0].get('cve', {})
                    result["lookups"]["nvd"] = {
                        "id": vuln.get('id'),
                        "description": vuln.get('descriptions', [{}])[0].get('value', ''),
                        "published": vuln.get('published'),
                        "lastModified": vuln.get('lastModified'),
                        "metrics": vuln.get('metrics', {}),
                    }
        except Exception as e:
            result["lookups"]["nvd"] = {"error": str(e)}

    return result


def domain_recon(target):
    result = {
        "target": target,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    result["dns"] = dns_lookup(target)
    result["whois"] = whois_lookup(target)
    result["http_headers"] = http_headers(target)
    result["ssl_cert"] = ssl_cert_info(target)
    result["cert_transparency"] = cert_transparency(target)
    result["ports"] = port_check(target)
    return result


def defang_ioc(ioc_value):
    result = ioc_value
    result = result.replace('http://', 'hxxp://')
    result = result.replace('https://', 'hxxps://')
    result = result.replace('.', '[.]')
    result = result.replace('@', '[@]')
    return {"original": ioc_value, "defanged": result}


def refang_ioc(ioc_value):
    result = ioc_value
    result = result.replace('hxxp://', 'http://')
    result = result.replace('hxxps://', 'https://')
    result = result.replace('[.]', '.')
    result = result.replace('[@]', '@')
    return {"defanged": ioc_value, "refanged": result}


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: osint_service.py <command> [args...]"}))
        sys.exit(1)

    command = sys.argv[1]

    try:
        if command == "status":
            print(json.dumps({
                "status": "ok",
                "version": "1.0.0",
                "source": "dev-lu/osint_toolkit",
                "modules": {
                    "dns": HAS_DNS,
                    "feedparser": HAS_FEEDPARSER,
                    "whois": HAS_WHOIS,
                },
                "capabilities": [
                    "ioc_lookup", "ioc_extract", "ioc_type_detect",
                    "dns_lookup", "whois_lookup", "http_headers",
                    "ssl_cert", "cert_transparency", "port_scan",
                    "newsfeed", "domain_recon", "defang", "refang"
                ]
            }))

        elif command == "ioc_lookup":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "IOC value required"}))
                sys.exit(1)
            result = ioc_lookup(sys.argv[2])
            print(json.dumps(result, default=str))

        elif command == "ioc_type":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "IOC value required"}))
                sys.exit(1)
            ioc_type = determine_ioc_type(sys.argv[2])
            print(json.dumps({"ioc": sys.argv[2], "type": ioc_type}))

        elif command == "ioc_extract":
            text = sys.stdin.read() if len(sys.argv) < 3 else sys.argv[2]
            result = extract_iocs(text)
            print(json.dumps(result, default=str))

        elif command == "dns":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Target required"}))
                sys.exit(1)
            result = dns_lookup(sys.argv[2])
            print(json.dumps(result, default=str))

        elif command == "whois":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Target required"}))
                sys.exit(1)
            result = whois_lookup(sys.argv[2])
            print(json.dumps(result, default=str))

        elif command == "headers":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Target required"}))
                sys.exit(1)
            result = http_headers(sys.argv[2])
            print(json.dumps(result, default=str))

        elif command == "ssl":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Target required"}))
                sys.exit(1)
            result = ssl_cert_info(sys.argv[2])
            print(json.dumps(result, default=str))

        elif command == "crt":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Target required"}))
                sys.exit(1)
            result = cert_transparency(sys.argv[2])
            print(json.dumps(result, default=str))

        elif command == "ports":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Target required"}))
                sys.exit(1)
            result = port_check(sys.argv[2])
            print(json.dumps(result, default=str))

        elif command == "newsfeed":
            max_items = int(sys.argv[2]) if len(sys.argv) > 2 else 30
            result = fetch_newsfeed(max_items)
            print(json.dumps(result, default=str))

        elif command == "domain_recon":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Target required"}))
                sys.exit(1)
            result = domain_recon(sys.argv[2])
            print(json.dumps(result, default=str))

        elif command == "defang":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "IOC value required"}))
                sys.exit(1)
            result = defang_ioc(sys.argv[2])
            print(json.dumps(result))

        elif command == "refang":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "IOC value required"}))
                sys.exit(1)
            result = refang_ioc(sys.argv[2])
            print(json.dumps(result))

        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
