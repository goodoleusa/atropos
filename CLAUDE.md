# Token budget rules

- NEVER read more than 200 lines of a file at once. Use `limit` and `offset` on every Read call.
- Before reading a large file, check its size with `wc -l` first.
- Prefer Grep to find specific sections rather than reading entire files.
- Subagents: same rules apply. Brief agents with the specific lines/sections they need, don't tell them to "read thoroughly."

# Security constraints

- NEVER delete anything under `forensics/` (WORM)
- Don't touch `overlay/`, `chart/`, `dist/`, `reckon-lite/chart/`, historical `.jsonl` and manifest files during sweeps
