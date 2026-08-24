# cursorcrew (unwired)

A standalone CrewAI/Weave OSINT demo. Not imported by `server/`, `client/`,
or `shared/` — nothing in the running app touches this directory.

## Reusable building blocks

`osint_tools/` has a few small, on-theme modules worth polishing into real
Atropos server modules rather than discarding outright:

- `chain_of_custody.py` — tamper-evident, hash-chained audit log for file
  operations (create/modify/rename/move/delete). Directly relevant to the
  platform's evidence-handling story.
- `hashing.py`, `archiver.py` — supporting primitives for the above.

The rest (`crewai_weave_demo.py`, `maltego_export.py`, `pdf_export.py`,
`obsidian_export.py`, `run_demo.*`, `reports/`, `NEWTEMPLATES/`) is demo
scaffolding for this standalone tool, not intended for reuse.

## Before wiring anything in

Check current evidence/audit-trail handling in `server/` first — there's no
existing chain-of-custody feature to slot into today, so this needs a real
integration point (an API route, a storage location) designed, not just a
file copy.
