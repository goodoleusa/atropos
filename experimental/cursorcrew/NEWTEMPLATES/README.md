# Active OSINT templates (export for easy commit)

This folder is a **copy** of the current 1-* and 2-* Templater templates used for the OSINT workflow. Use it to:

- **Stage and commit in one go** — e.g. `git add Huntin/00-TEMPLATES/active-osint-export/` and commit, so you avoid timeouts from staging hundreds of other files.
- **Back up** the refactored templates (code-first, parent/child/sibling, wikilinks).

**Canonical location:** The real templates live in the parent folder (`00-TEMPLATES/`). When you update those, re-copy into this folder to keep the export in sync, or run a small script to refresh.

**Workflow docs:** See `Huntin/000-META/OSINT-Workflow-and-Plugins-Guide.md` and `Lotus-to-Obsidian-Workflow.md`.

## Commit only this folder (to fix timeout)

```bash
git add Huntin/00-TEMPLATES/active-osint-export/
git commit -m "OSINT templates export (1-* and 2-*)"
```

Then commit other changes (lotus_to_obsidian.py, path script, etc.) in separate commits.

## Why this fixes commit timeouts

- Staging **one folder** with ~16 files is fast; staging hundreds of files (e.g. whole repo or many deletes) can make Git or the IDE hang.
- Commit **this folder first**, then in later commits add the rest (path script, Lotus workflow, vault meta docs) so each commit is small and quick.
