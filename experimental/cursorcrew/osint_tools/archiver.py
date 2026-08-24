"""
Headless archiver for capturing web content during OSINT investigations.
Uses requests + BeautifulSoup for simple HTML capture, or Playwright for JavaScript-heavy sites.
"""
import logging
import os
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


def archive_url(url: str, output_dir: str, investigation_id: str) -> Optional[str]:
    """
    Archive a URL's content to a local file. Returns path to archived file or None on error.
    
    Args:
        url: URL to archive
        output_dir: Base directory for investigations
        investigation_id: Investigation ID for folder structure
    
    Returns:
        Path to archived HTML file, or None if archiving failed
    """
    if not url or not url.strip():
        return None
    
    url = url.strip()
    # Validate URL
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            logger.warning("Invalid URL: %s", url)
            return None
    except Exception as e:
        logger.warning("URL parse error for %s: %s", url, e)
        return None
    
    # Create archive directory
    archive_dir = os.path.join(output_dir, investigation_id, "archived_content")
    os.makedirs(archive_dir, exist_ok=True)
    
    # Generate safe filename from URL
    domain = parsed.netloc.replace(":", "-").replace(".", "-")
    path_part = parsed.path.strip("/").replace("/", "-") or "index"
    if len(path_part) > 100:
        path_part = path_part[:100]
    filename = f"{domain}_{path_part}.html"
    # Remove invalid chars
    filename = "".join(c if c.isalnum() or c in ".-_" else "_" for c in filename)
    filepath = os.path.join(archive_dir, filename)
    
    # Try simple requests first (faster, works for most sites)
    try:
        import requests
        from bs4 import BeautifulSoup
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        r = requests.get(url, headers=headers, timeout=15, allow_redirects=True)
        r.raise_for_status()
        
        # Parse and clean HTML
        soup = BeautifulSoup(r.content, "html.parser")
        
        # Add metadata comment
        meta_comment = soup.new_string(f"\n<!-- Archived from {url} on {r.headers.get('Date', 'unknown')} -->\n")
        if soup.html:
            soup.html.insert(0, meta_comment)
        
        # Write HTML
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"<!-- Archived URL: {url} -->\n")
            f.write(str(soup))
        
        # Compute and store hash, log in chain of custody
        try:
            from .hashing import compute_file_hash
            file_hash = compute_file_hash(filepath)
            if file_hash:
                # Write hash to a companion file
                hash_file = filepath + ".sha256"
                with open(hash_file, "w", encoding="utf-8") as hf:
                    hf.write(f"{file_hash}  {os.path.basename(filepath)}\n")
                
                # Log in chain of custody
                try:
                    from .chain_of_custody import ChainOfCustody
                    # Extract investigation_id from path
                    path_parts = Path(filepath).parts
                    if "10-Investigations" in path_parts:
                        inv_idx = path_parts.index("10-Investigations")
                        if inv_idx + 1 < len(path_parts):
                            inv_id = path_parts[inv_idx + 1]
                            inv_root = os.path.join(*path_parts[:inv_idx + 2])
                            coc_logger = ChainOfCustody(inv_root, inv_id)
                            rel_path = os.path.relpath(filepath, inv_root)
                            coc_logger.log_create(
                                rel_path,
                                file_hash=file_hash,
                                comment=f"URL archived: {url}"
                            )
                except Exception:
                    pass  # Chain of custody optional
        except Exception as e:
            logger.debug("Failed to compute hash for %s: %s", filepath, e)
        
        logger.info("Archived %s to %s", url, filepath)
        return filepath
        
    except ImportError:
        logger.warning("requests or BeautifulSoup not available for archiving")
        return None
    except Exception as e:
        logger.warning("Failed to archive %s with requests: %s", url, e)
        # Fallback: try Playwright if available
        return _archive_with_playwright(url, filepath)


def _archive_with_playwright(url: str, filepath: str) -> Optional[str]:
    """Fallback archiver using Playwright for JavaScript-heavy sites."""
    try:
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until="networkidle", timeout=30000)
            content = page.content()
            browser.close()
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(f"<!-- Archived URL: {url} (Playwright) -->\n")
                f.write(content)
            
            # Compute and store hash, log in chain of custody
            try:
                from .hashing import compute_file_hash
                file_hash = compute_file_hash(filepath)
                if file_hash:
                    hash_file = filepath + ".sha256"
                    with open(hash_file, "w", encoding="utf-8") as hf:
                        hf.write(f"{file_hash}  {os.path.basename(filepath)}\n")
                    
                    # Log in chain of custody
                    try:
                        from .chain_of_custody import ChainOfCustody
                        path_parts = Path(filepath).parts
                        if "10-Investigations" in path_parts:
                            inv_idx = path_parts.index("10-Investigations")
                            if inv_idx + 1 < len(path_parts):
                                inv_id = path_parts[inv_idx + 1]
                                inv_root = os.path.join(*path_parts[:inv_idx + 2])
                                coc_logger = ChainOfCustody(inv_root, inv_id)
                                rel_path = os.path.relpath(filepath, inv_root)
                                coc_logger.log_create(
                                    rel_path,
                                    file_hash=file_hash,
                                    comment=f"URL archived with Playwright: {url}"
                                )
                    except Exception:
                        pass  # Chain of custody optional
            except Exception as e:
                logger.debug("Failed to compute hash for %s: %s", filepath, e)
            
            logger.info("Archived %s with Playwright to %s", url, filepath)
            return filepath
            
    except ImportError:
        logger.debug("Playwright not available")
        return None
    except Exception as e:
        logger.warning("Failed to archive %s with Playwright: %s", url, e)
        return None


def archive_urls_from_findings(raw_findings: dict, output_dir: str, investigation_id: str, max_urls: int = 10) -> list[str]:
    """
    Extract URLs from raw OSINT findings and archive them.
    
    Args:
        raw_findings: Raw OSINT findings dict from gather_raw_osint()
        output_dir: Base directory for investigations
        investigation_id: Investigation ID
        max_urls: Maximum number of URLs to archive
    
    Returns:
        List of archived file paths
    """
    archived = []
    urls_found = set()
    
    # Extract URLs from various fields
    seed = raw_findings.get("seed", "")
    if seed and ("http://" in seed or "https://" in seed):
        urls_found.add(seed)
    
    # Extract from reverse IP (hostnames that might be URLs)
    reverse_ip = raw_findings.get("reverse_ip_raw", "")
    if reverse_ip:
        import re
        # Look for hostnames that could be URLs
        hostnames = re.findall(r"\b([a-z0-9][a-z0-9.-]*\.[a-z]{2,})\b", reverse_ip, re.I)
        for hostname in hostnames[:5]:  # Limit
            urls_found.add(f"https://{hostname}")
    
    # Archive URLs (up to max_urls)
    for url in list(urls_found)[:max_urls]:
        archived_path = archive_url(url, output_dir, investigation_id)
        if archived_path:
            archived.append(archived_path)
    
    return archived
