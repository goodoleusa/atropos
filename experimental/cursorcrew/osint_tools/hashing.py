"""
Cryptographic hashing utilities for OSINT investigation materials.
Computes SHA-256 hashes for all collected data to ensure integrity and enable verification.
"""
import hashlib
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional


def compute_file_hash(file_path: str, algorithm: str = "sha256") -> Optional[str]:
    """
    Compute cryptographic hash of a file.
    
    Args:
        file_path: Path to file
        algorithm: Hash algorithm (sha256, sha512, md5)
    
    Returns:
        Hexadecimal hash string or None on error
    """
    if not os.path.exists(file_path):
        return None
    
    try:
        hash_obj = hashlib.new(algorithm)
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_obj.update(chunk)
        return hash_obj.hexdigest()
    except Exception:
        return None


def compute_string_hash(content: str, algorithm: str = "sha256") -> str:
    """
    Compute cryptographic hash of a string.
    
    Args:
        content: String content to hash
        algorithm: Hash algorithm (sha256, sha512, md5)
    
    Returns:
        Hexadecimal hash string
    """
    hash_obj = hashlib.new(algorithm)
    hash_obj.update(content.encode("utf-8"))
    return hash_obj.hexdigest()


def create_hash_manifest(
    investigation_path: str,
    investigation_id: str,
    files: list[dict],
) -> str:
    """
    Create a hash manifest file listing all files and their hashes.
    
    Args:
        investigation_path: Path to investigation folder
        investigation_id: Investigation ID
        files: List of dicts with 'path', 'hash', 'type', 'size' keys
    
    Returns:
        Path to manifest file
    """
    manifest_path = os.path.join(investigation_path, f"{investigation_id}_hash_manifest.json")
    
    manifest = {
        "investigation_id": investigation_id,
        "created": datetime.utcnow().isoformat() + "Z",
        "algorithm": "sha256",
        "files": files,
    }
    
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    # Also create a text manifest for easy reading
    txt_manifest_path = os.path.join(investigation_path, f"{investigation_id}_hash_manifest.txt")
    with open(txt_manifest_path, "w", encoding="utf-8") as f:
        f.write(f"Hash Manifest for Investigation: {investigation_id}\n")
        f.write(f"Created: {manifest['created']}\n")
        f.write(f"Algorithm: {manifest['algorithm']}\n")
        f.write(f"Total Files: {len(files)}\n")
        f.write("\n" + "=" * 80 + "\n\n")
        
        for file_info in files:
            f.write(f"File: {file_info.get('path', 'unknown')}\n")
            f.write(f"Type: {file_info.get('type', 'unknown')}\n")
            f.write(f"Size: {file_info.get('size', 0)} bytes\n")
            f.write(f"Hash ({manifest['algorithm']}): {file_info.get('hash', 'unknown')}\n")
            f.write("-" * 80 + "\n")
    
    return manifest_path


def hash_investigation_files(investigation_path: str, investigation_id: str, coc_logger: Optional[ChainOfCustody] = None) -> dict:
    """
    Hash all files in an investigation folder and create manifest.
    
    Args:
        investigation_path: Path to investigation folder
        investigation_id: Investigation ID
        coc_logger: Optional ChainOfCustody logger for tracking operations
    
    Returns:
        Dict with 'manifest_path' and 'files' list
    """
    files_list = []
    
    # Hash investigation markdown file
    for file in os.listdir(investigation_path):
        if file.endswith(".md") and "Investigation" in file:
            file_path = os.path.join(investigation_path, file)
            file_hash = compute_file_hash(file_path)
            if file_hash:
                file_size = os.path.getsize(file_path)
                files_list.append({
                    "path": file,
                    "hash": file_hash,
                    "type": "investigation_report",
                    "size": file_size,
                })
    
    # Hash raw OSINT data files
    for file in os.listdir(investigation_path):
        if file.endswith(".md") and ("raw_osint" in file or "crew_output" in file):
            file_path = os.path.join(investigation_path, file)
            file_hash = compute_file_hash(file_path)
            if file_hash:
                file_size = os.path.getsize(file_path)
                files_list.append({
                    "path": file,
                    "hash": file_hash,
                    "type": "raw_osint_data",
                    "size": file_size,
                })
    
    # Hash entity files
    entity_types = ["domain", "ip", "asn", "organization", "person", "threat_actor", "technique", "vulnerability"]
    for entity_type in entity_types:
        entity_dir = os.path.join(investigation_path, entity_type)
        if not os.path.exists(entity_dir):
            continue
        
        for file in os.listdir(entity_dir):
            if file.endswith(".md"):
                file_path = os.path.join(entity_dir, file)
                file_hash = compute_file_hash(file_path)
                if file_hash:
                    file_size = os.path.getsize(file_path)
                    files_list.append({
                        "path": f"{entity_type}/{file}",
                        "hash": file_hash,
                        "type": f"entity_{entity_type}",
                        "size": file_size,
                    })
    
    # Hash archived content
    archive_dir = os.path.join(investigation_path, "archived_content")
    if os.path.exists(archive_dir):
        for root, dirs, files in os.walk(archive_dir):
            for file in files:
                file_path = os.path.join(root, file)
                file_hash = compute_file_hash(file_path)
                if file_hash:
                    file_size = os.path.getsize(file_path)
                    rel_path = os.path.relpath(file_path, investigation_path)
                    files_list.append({
                        "path": rel_path.replace("\\", "/"),  # Normalize path separators
                        "hash": file_hash,
                        "type": "archived_content",
                        "size": file_size,
                    })
    
    # Hash PDF exports if they exist
    for file in os.listdir(investigation_path):
        if file.endswith(".pdf"):
            file_path = os.path.join(investigation_path, file)
            file_hash = compute_file_hash(file_path)
            if file_hash:
                file_size = os.path.getsize(file_path)
                files_list.append({
                    "path": file,
                    "hash": file_hash,
                    "type": "pdf_export",
                    "size": file_size,
                })
    
    # Hash ZIP exports if they exist
    for file in os.listdir(investigation_path):
        if file.endswith(".zip"):
            file_path = os.path.join(investigation_path, file)
            file_hash = compute_file_hash(file_path)
            if file_hash:
                file_size = os.path.getsize(file_path)
                files_list.append({
                    "path": file,
                    "hash": file_hash,
                    "type": "export_archive",
                    "size": file_size,
                })
    
    # Create manifest
    manifest_path = create_hash_manifest(investigation_path, investigation_id, files_list)
    
    # Log manifest creation in chain of custody
    if coc_logger:
        manifest_hash = compute_file_hash(manifest_path)
        coc_logger.log_create(
            os.path.relpath(manifest_path, investigation_path),
            file_hash=manifest_hash,
            comment="Hash manifest created for all investigation files"
        )
    
    return {
        "manifest_path": manifest_path,
        "files": files_list,
        "total_files": len(files_list),
    }


def verify_file_integrity(file_path: str, expected_hash: str, algorithm: str = "sha256") -> bool:
    """
    Verify file integrity by comparing computed hash with expected hash.
    
    Args:
        file_path: Path to file to verify
        expected_hash: Expected hash value
        algorithm: Hash algorithm
    
    Returns:
        True if hash matches, False otherwise
    """
    computed_hash = compute_file_hash(file_path, algorithm)
    if not computed_hash:
        return False
    return computed_hash.lower() == expected_hash.lower()


def load_hash_manifest(manifest_path: str) -> Optional[dict]:
    """
    Load hash manifest from JSON file.
    
    Args:
        manifest_path: Path to manifest JSON file
    
    Returns:
        Manifest dict or None on error
    """
    if not os.path.exists(manifest_path):
        return None
    
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def verify_investigation_integrity(investigation_path: str, investigation_id: str) -> dict:
    """
    Verify integrity of all files in investigation against manifest.
    
    Args:
        investigation_path: Path to investigation folder
        investigation_id: Investigation ID
    
    Returns:
        Dict with verification results
    """
    manifest_path = os.path.join(investigation_path, f"{investigation_id}_hash_manifest.json")
    manifest = load_hash_manifest(manifest_path)
    
    if not manifest:
        return {
            "valid": False,
            "error": "Manifest not found",
            "verified_files": 0,
            "failed_files": [],
        }
    
    verified = 0
    failed = []
    
    for file_info in manifest.get("files", []):
        file_path = os.path.join(investigation_path, file_info["path"])
        expected_hash = file_info.get("hash")
        
        if not expected_hash:
            failed.append({"path": file_info["path"], "reason": "No hash in manifest"})
            continue
        
        if not os.path.exists(file_path):
            failed.append({"path": file_info["path"], "reason": "File not found"})
            continue
        
        if verify_file_integrity(file_path, expected_hash, manifest.get("algorithm", "sha256")):
            verified += 1
        else:
            failed.append({"path": file_info["path"], "reason": "Hash mismatch"})
    
    return {
        "valid": len(failed) == 0,
        "verified_files": verified,
        "failed_files": failed,
        "total_files": len(manifest.get("files", [])),
    }
