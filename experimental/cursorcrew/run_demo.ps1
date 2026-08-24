# Run CrewAI demo (reports -> reports/ as topic_YYYY-MM-DD.md).
# Requires: OPENROUTER_API_KEY or OPENAI_API_KEY.
# Optional: WEAVE_ENABLED=1 to enable W&B Weave tracing (off by default; set WEAVE_DISABLED=1 to force off).

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (Test-Path .venv\Scripts\Activate.ps1) {
    .\.venv\Scripts\Activate.ps1
} elseif (Test-Path venv\Scripts\Activate.ps1) {
    .\venv\Scripts\Activate.ps1
}

$hasKey = $env:OPENROUTER_API_KEY -or $env:OPENAI_API_KEY
if (-not $hasKey) {
    Write-Error "Set OPENROUTER_API_KEY or OPENAI_API_KEY in the environment (or .env)."
    exit 1
}

# Quieter LiteLLM logs (optional; script also sets LITELLM_LOG if unset)
if (-not $env:LITELLM_LOG) { $env:LITELLM_LOG = "WARNING" }

python crewai_weave_demo.py
