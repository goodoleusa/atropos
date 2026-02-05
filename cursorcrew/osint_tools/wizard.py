"""
Interactive wizard for OSINT investigation: menu and step-by-step prompts.
No business logic (no CrewAI, no writer); only I/O and validation.
"""
from __future__ import annotations

import os
import re
import sys
from typing import TypedDict

try:
    from .config import get_obsidian_base_path
except ImportError:
    # Run as script (e.g. python wizard.py from osint_tools/) — add repo root to path
    _root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if _root not in sys.path:
        sys.path.insert(0, _root)
    from osint_tools.config import get_obsidian_base_path


def _slug_from_seed(seed: str) -> str:
    """Turn seed into a safe kebab-case default investigation id (e.g. example.com -> example-com-inv)."""
    s = (seed or "").strip().lower()
    s = re.sub(r"[^\w\s-]", " ", s)
    s = re.sub(r"[\s_]+", "-", s).strip("-")
    s = s[:50] or "investigation"
    return f"{s}-inv" if not s.endswith("-inv") else s


class InvestigationInputs(TypedDict):
    output_format: str
    seed: str
    investigation_id: str
    investigation_name: str
    base_path: str


def run_menu() -> str:
    """
    Show top-level menu. Returns 'investigation' | 'check-keys' | 'exit'.
    """
    print("\n  (1) New OSINT investigation")
    print("  (2) Check API keys")
    print("  (3) Exit")
    while True:
        choice = input("Choice [1-3]: ").strip() or "1"
        if choice == "1":
            return "investigation"
        if choice == "2":
            return "check-keys"
        if choice == "3":
            return "exit"
        print("  Enter 1, 2, or 3.")


def run_investigation_prompts() -> InvestigationInputs | None:
    """
    Step-by-step prompts for a new investigation. Returns a dict with
    output_format, seed, investigation_id, investigation_name, base_path, or None if user aborts.
    """
    # Step 1 – Output format (Obsidian vs Maltego)
    print("\n--- Step 1: Output format ---")
    print("  (1) Obsidian  – entity notes and investigation folder (chain of custody, hashing, PDF export)")
    print("  (2) Maltego   – CSV + GraphML for Maltego import (no Obsidian structure)")
    while True:
        of = input("Choice [1-2]: ").strip() or "1"
        if of == "1":
            output_format = "obsidian"
            break
        if of == "2":
            output_format = "maltego"
            break
        print("  Enter 1 or 2.")

    # Step 2 – Seed
    print("\n--- Step 2: Seed ---")
    while True:
        seed = input("Enter seed (domain, IP, URL, or short description) [e.g. example.com or 8.8.8.8]: ").strip()
        if seed:
            break
        print("  Seed cannot be empty.")
    default_inv_id = _slug_from_seed(seed)
    default_inv_name = f"Investigation: {seed}"

    # Step 3 – Investigation ID
    print("\n--- Step 3: Investigation ID ---")
    inv_id = input(f"Investigation ID (kebab-case, used as folder name) [{default_inv_id}]: ").strip()
    inv_id = inv_id or default_inv_id
    inv_id = re.sub(r"[^\w-]", "-", inv_id).strip("-").lower() or default_inv_id

    # Step 4 – Investigation name
    print("\n--- Step 4: Investigation name ---")
    inv_name = input(f"Investigation display name [{default_inv_name}]: ").strip()
    inv_name = inv_name or default_inv_name

    # Step 5 – Output path
    default_base = get_obsidian_base_path()
    print("\n--- Step 5: Output path ---")
    base_path = input(f"Output base path (Enter = default) [{default_base}]: ").strip()
    base_path = base_path or default_base

    # Step 6 – Confirm
    print("\n--- Confirm ---")
    print(f"  Output:       {output_format}")
    print(f"  Seed:         {seed}")
    print(f"  Inv ID:       {inv_id}")
    print(f"  Inv name:     {inv_name}")
    print(f"  Output path:  {base_path}")
    confirm = input("Run? [Y/n]: ").strip().lower()
    if confirm and confirm != "y" and confirm != "yes":
        return None

    return InvestigationInputs(
        output_format=output_format,
        seed=seed,
        investigation_id=inv_id,
        investigation_name=inv_name,
        base_path=base_path,
    )


if __name__ == "__main__":
    print("Run the full OSINT wizard (menu + crew + Obsidian export) from the project root:")
    print("  cd ..")
    print("  python crewai_weave_demo.py")
    print("\nOr from anywhere: python crewai_weave_demo.py")
