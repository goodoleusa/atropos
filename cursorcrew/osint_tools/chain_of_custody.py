"""
Chain of Custody logging system for OSINT investigations.
Tracks all file operations (create, modify, rename, move, delete) with cryptographic hashes,
timestamps, and comments. Provides tamper-evident audit trail.
"""
import hashlib
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional


class ChainOfCustody:
    """Chain of custody logger for investigation files."""
    
    def __init__(self, investigation_path: str, investigation_id: str):
        """
        Initialize chain of custody logger.
        
        Args:
            investigation_path: Path to investigation folder
            investigation_id: Investigation ID
        """
        self.investigation_path = investigation_path
        self.investigation_id = investigation_id
        self.log_file = os.path.join(investigation_path, f"{investigation_id}_chain_of_custody.json")
        self.entries = []
        self._load_existing_log()
    
    def _load_existing_log(self) -> None:
        """Load existing chain of custody log if it exists."""
        if os.path.exists(self.log_file):
            try:
                with open(self.log_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.entries = data.get("entries", [])
            except Exception:
                self.entries = []
        else:
            self.entries = []
    
    def _compute_log_hash(self) -> str:
        """Compute hash of all log entries for tamper detection."""
        if not self.entries:
            return ""
        # Hash all entries as JSON
        entries_json = json.dumps(self.entries, sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(entries_json.encode("utf-8")).hexdigest()
    
    def _save_log(self) -> None:
        """Save chain of custody log with integrity hash."""
        log_data = {
            "investigation_id": self.investigation_id,
            "created": self.entries[0]["timestamp"] if self.entries else datetime.utcnow().isoformat() + "Z",
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "total_entries": len(self.entries),
            "integrity_hash": self._compute_log_hash(),
            "entries": self.entries,
        }
        
        with open(self.log_file, "w", encoding="utf-8") as f:
            json.dump(log_data, f, indent=2, ensure_ascii=False)
        
        # Also create human-readable log
        txt_log_file = self.log_file.replace(".json", ".txt")
        self._write_text_log(txt_log_file, log_data)
    
    def _write_text_log(self, txt_path: str, log_data: dict) -> None:
        """Write human-readable text log."""
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write("=" * 80 + "\n")
            f.write(f"CHAIN OF CUSTODY LOG\n")
            f.write(f"Investigation ID: {log_data['investigation_id']}\n")
            f.write(f"Created: {log_data['created']}\n")
            f.write(f"Last Updated: {log_data['last_updated']}\n")
            f.write(f"Total Entries: {log_data['total_entries']}\n")
            f.write(f"Integrity Hash (SHA-256): {log_data['integrity_hash']}\n")
            f.write("=" * 80 + "\n\n")
            
            for i, entry in enumerate(self.entries, 1):
                f.write(f"Entry #{i}\n")
                f.write(f"  Timestamp: {entry['timestamp']}\n")
                f.write(f"  Operation: {entry['operation']}\n")
                f.write(f"  File: {entry.get('file_path', 'N/A')}\n")
                if entry.get('previous_path'):
                    f.write(f"  Previous Path: {entry['previous_path']}\n")
                if entry.get('file_hash'):
                    f.write(f"  File Hash (SHA-256): {entry['file_hash']}\n")
                if entry.get('previous_hash'):
                    f.write(f"  Previous Hash: {entry['previous_hash']}\n")
                if entry.get('file_size'):
                    f.write(f"  File Size: {entry['file_size']} bytes\n")
                if entry.get('comment'):
                    f.write(f"  Comment: {entry['comment']}\n")
                if entry.get('user'):
                    f.write(f"  User: {entry['user']}\n")
                f.write("-" * 80 + "\n\n")
    
    def _add_entry(
        self,
        operation: str,
        file_path: str,
        file_hash: Optional[str] = None,
        previous_path: Optional[str] = None,
        previous_hash: Optional[str] = None,
        comment: Optional[str] = None,
        file_size: Optional[int] = None,
    ) -> None:
        """
        Add entry to chain of custody log.
        
        Args:
            operation: Operation type (create, modify, rename, move, delete, verify)
            file_path: Current file path (relative to investigation folder)
            file_hash: Current file hash (SHA-256)
            previous_path: Previous file path (for rename/move)
            previous_hash: Previous file hash (for modify operations)
            comment: Comment/note about the operation
            file_size: File size in bytes
        """
        entry = {
            "entry_id": len(self.entries) + 1,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "operation": operation,
            "file_path": file_path,
        }
        
        if file_hash:
            entry["file_hash"] = file_hash
        if previous_path:
            entry["previous_path"] = previous_path
        if previous_hash:
            entry["previous_hash"] = previous_hash
        if comment:
            entry["comment"] = comment
        if file_size is not None:
            entry["file_size"] = file_size
        
        # Add user info if available
        try:
            import getpass
            entry["user"] = getpass.getuser()
        except Exception:
            pass
        
        self.entries.append(entry)
        self._save_log()
    
    def log_create(self, file_path: str, file_hash: Optional[str] = None, comment: Optional[str] = None) -> None:
        """Log file creation."""
        file_size = None
        if os.path.exists(os.path.join(self.investigation_path, file_path)):
            file_size = os.path.getsize(os.path.join(self.investigation_path, file_path))
        self._add_entry(
            operation="create",
            file_path=file_path,
            file_hash=file_hash,
            comment=comment or "File created",
            file_size=file_size,
        )
    
    def log_modify(self, file_path: str, file_hash: str, previous_hash: Optional[str] = None, comment: Optional[str] = None) -> None:
        """Log file modification."""
        file_size = None
        full_path = os.path.join(self.investigation_path, file_path)
        if os.path.exists(full_path):
            file_size = os.path.getsize(full_path)
        self._add_entry(
            operation="modify",
            file_path=file_path,
            file_hash=file_hash,
            previous_hash=previous_hash,
            comment=comment or "File modified",
            file_size=file_size,
        )
    
    def log_rename(self, new_path: str, old_path: str, file_hash: Optional[str] = None, comment: Optional[str] = None) -> None:
        """Log file rename."""
        file_size = None
        full_path = os.path.join(self.investigation_path, new_path)
        if os.path.exists(full_path):
            file_size = os.path.getsize(full_path)
        self._add_entry(
            operation="rename",
            file_path=new_path,
            previous_path=old_path,
            file_hash=file_hash,
            comment=comment or f"File renamed from {old_path} to {new_path}",
            file_size=file_size,
        )
    
    def log_move(self, new_path: str, old_path: str, file_hash: Optional[str] = None, comment: Optional[str] = None) -> None:
        """Log file move."""
        file_size = None
        full_path = os.path.join(self.investigation_path, new_path)
        if os.path.exists(full_path):
            file_size = os.path.getsize(full_path)
        self._add_entry(
            operation="move",
            file_path=new_path,
            previous_path=old_path,
            file_hash=file_hash,
            comment=comment or f"File moved from {old_path} to {new_path}",
            file_size=file_size,
        )
    
    def log_delete(self, file_path: str, previous_hash: Optional[str] = None, comment: Optional[str] = None) -> None:
        """Log file deletion."""
        self._add_entry(
            operation="delete",
            file_path=file_path,
            previous_hash=previous_hash,
            comment=comment or "File deleted",
        )
    
    def log_verify(self, file_path: str, file_hash: str, verified: bool, comment: Optional[str] = None) -> None:
        """Log integrity verification."""
        self._add_entry(
            operation="verify",
            file_path=file_path,
            file_hash=file_hash,
            comment=comment or f"Integrity verification: {'PASSED' if verified else 'FAILED'}",
        )
    
    def verify_log_integrity(self) -> dict:
        """
        Verify integrity of chain of custody log itself.
        
        Returns:
            Dict with verification results
        """
        if not os.path.exists(self.log_file):
            return {"valid": False, "error": "Log file not found"}
        
        try:
            with open(self.log_file, "r", encoding="utf-8") as f:
                log_data = json.load(f)
            
            stored_hash = log_data.get("integrity_hash", "")
            computed_hash = self._compute_log_hash()
            
            if stored_hash != computed_hash:
                return {
                    "valid": False,
                    "error": "Log integrity hash mismatch - log may have been tampered with",
                    "stored_hash": stored_hash,
                    "computed_hash": computed_hash,
                }
            
            return {
                "valid": True,
                "total_entries": len(self.entries),
                "integrity_hash": computed_hash,
            }
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def get_file_history(self, file_path: str) -> list[dict]:
        """
        Get complete history for a specific file.
        
        Args:
            file_path: File path (relative to investigation folder)
        
        Returns:
            List of log entries for this file
        """
        history = []
        for entry in self.entries:
            if entry.get("file_path") == file_path or entry.get("previous_path") == file_path:
                history.append(entry)
        return history
    
    def export_log(self, output_path: Optional[str] = None, format: str = "json") -> str:
        """
        Export chain of custody log.
        
        Args:
            output_path: Output file path (default: investigation folder)
            format: Export format (json, txt, csv)
        
        Returns:
            Path to exported file
        """
        if not output_path:
            if format == "json":
                output_path = os.path.join(self.investigation_path, f"{self.investigation_id}_chain_of_custody_export.json")
            elif format == "txt":
                output_path = os.path.join(self.investigation_path, f"{self.investigation_id}_chain_of_custody_export.txt")
            elif format == "csv":
                output_path = os.path.join(self.investigation_path, f"{self.investigation_id}_chain_of_custody_export.csv")
            else:
                output_path = os.path.join(self.investigation_path, f"{self.investigation_id}_chain_of_custody_export.{format}")
        
        if format == "csv":
            import csv
            with open(output_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["Entry ID", "Timestamp", "Operation", "File Path", "Previous Path", "File Hash", "Previous Hash", "File Size", "Comment", "User"])
                for entry in self.entries:
                    writer.writerow([
                        entry.get("entry_id"),
                        entry.get("timestamp"),
                        entry.get("operation"),
                        entry.get("file_path"),
                        entry.get("previous_path", ""),
                        entry.get("file_hash", ""),
                        entry.get("previous_hash", ""),
                        entry.get("file_size", ""),
                        entry.get("comment", ""),
                        entry.get("user", ""),
                    ])
        else:
            # JSON or TXT
            log_data = {
                "investigation_id": self.investigation_id,
                "created": self.entries[0]["timestamp"] if self.entries else datetime.utcnow().isoformat() + "Z",
                "last_updated": datetime.utcnow().isoformat() + "Z",
                "total_entries": len(self.entries),
                "integrity_hash": self._compute_log_hash(),
                "entries": self.entries,
            }
            
            if format == "txt":
                self._write_text_log(output_path, log_data)
            else:
                with open(output_path, "w", encoding="utf-8") as f:
                    json.dump(log_data, f, indent=2, ensure_ascii=False)
        
        return output_path
