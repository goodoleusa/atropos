"""
Central API key loader for OSINT tools. All keys read from environment (e.g. .env).
Use get_api_key(service) or check_keys() for CLI; never log or print key values.
"""
import os
from pathlib import Path

# Load .env from project root if python-dotenv is available
try:
    from dotenv import load_dotenv
    _root = Path(__file__).resolve().parent.parent
    load_dotenv(_root / ".env")
except ImportError:
    pass

# Map service name -> env var name (single key) or tuple (multi, e.g. Censys id+secret)
API_KEY_ENV = {
    "openrouter": "OPENROUTER_API_KEY",
    "virustotal": "VIRUSTOTAL_API_KEY",
    "abuseipdb": "ABUSEIPDB_API_KEY",
    "censys": ("CENSYS_API_ID", "CENSYS_API_SECRET"),
    "greynoise": "GREYNOISE_API_KEY",
    "shodan": "SHODAN_API_KEY",
    "ipinfo": "IPINFO_TOKEN",
    "hackertarget": "HACKERTARGET_API_KEY",
}

# Tools that work without any key (no-op or public API)
NO_KEY_TOOLS = ("shodan_internetdb", "urlhaus", "whois", "ipinfo_free", "hackertarget", "ripestat")


def get_api_key(service: str) -> str | tuple[str, str] | None:
    """Get API key(s) for a service. Returns None or empty string if not set."""
    key = API_KEY_ENV.get(service.lower())
    if key is None:
        return None
    if isinstance(key, tuple):
        v1 = (os.environ.get(key[0]) or "").strip()
        v2 = (os.environ.get(key[1]) or "").strip()
        return (v1, v2) if (v1 and v2) else None
    return (os.environ.get(key) or "").strip() or None


def is_key_set(service: str) -> bool:
    """Return True if the service has its key(s) set."""
    k = get_api_key(service)
    if k is None:
        return False
    if isinstance(k, tuple):
        return bool(k[0] and k[1])
    return bool(k)


def check_keys() -> dict[str, str]:
    """
    Return a dict of service -> "set" | "not set" for all configured services.
    Used by --check-keys CLI; never includes key values.
    """
    result = {}
    for name, env_spec in API_KEY_ENV.items():
        if isinstance(env_spec, tuple):
            v1 = (os.environ.get(env_spec[0]) or "").strip()
            v2 = (os.environ.get(env_spec[1]) or "").strip()
            result[name] = "set" if (v1 and v2) else "not set"
        else:
            v = (os.environ.get(env_spec) or "").strip()
            result[name] = "set" if v else "not set"
    return result


def _normalize_path(path: str) -> str:
    """
    Fix paths that were corrupted by escape-sequence interpretation (e.g. in .env
    with double quotes, \\a can become bell chr(7)). On Windows, use forward slashes
    in .env to avoid this, or we repair common cases here.
    """
    if not path or not isinstance(path, str):
        return path
    # Repair bell (\\a) and other common escapes that break Windows paths
    path = path.replace("\x07", "\\a")   # bell
    path = path.replace("\x08", "\\b")   # backspace
    path = path.replace("\x0c", "\\f")   # form feed
    path = path.replace("\n", "\\n")
    path = path.replace("\r", "\\r")
    path = path.replace("\t", "\\t")
    try:
        return str(Path(path).resolve())
    except (OSError, RuntimeError):
        return path.strip()


def get_obsidian_base_path() -> str:
    """Base path for writing investigation folders; default 10-Investigations in repo."""
    path = (os.environ.get("OBSIDIAN_INVESTIGATIONS_PATH") or "").strip()
    if path:
        return _normalize_path(path)
    root = Path(__file__).resolve().parent.parent
    return str(root / "10-Investigations")
