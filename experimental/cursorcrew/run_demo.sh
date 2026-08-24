#!/usr/bin/env bash
# Run CrewAI demo (reports -> reports/ as topic_YYYY-MM-DD.md).
# Requires: OPENROUTER_API_KEY or OPENAI_API_KEY.
# Optional: WEAVE_ENABLED=1 to enable W&B Weave tracing (off by default; WEAVE_DISABLED=1 to force off).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ -d .venv ]]; then
  source .venv/bin/activate
elif [[ -d venv ]]; then
  source venv/bin/activate
fi

if [[ -z "${OPENROUTER_API_KEY:-}" && -z "${OPENAI_API_KEY:-}" ]]; then
  echo "Error: Set OPENROUTER_API_KEY or OPENAI_API_KEY (e.g. export or in .env)."
  exit 1
fi

# Quieter LiteLLM logs (optional; script also sets LITELLM_LOG if unset)
export LITELLM_LOG="${LITELLM_LOG:-WARNING}"

python crewai_weave_demo.py
