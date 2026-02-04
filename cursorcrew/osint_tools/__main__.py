"""Run: python -m osint_tools check-keys   or   python -m osint_tools (shows wizard hint)"""
import sys
from .config import check_keys, NO_KEY_TOOLS


def main():
    if len(sys.argv) > 1 and sys.argv[1].strip().lower() == "check-keys":
        status = check_keys()
        print("API key status (values never shown):")
        for name, value in status.items():
            print(f"  {name}: {value}")
        print("\nTools that work without keys:", ", ".join(NO_KEY_TOOLS))
        return
    # No args: direct to main script for wizard
    print("Run the OSINT wizard with: python crewai_weave_demo.py")
    print("Check API keys: python -m osint_tools check-keys")


if __name__ == "__main__":
    main()
