# Vendoring notes

This directory is a trimmed, directly-committed copy of
[SpiderFoot](https://github.com/smicallef/spiderfoot) **v4.0**
(no PyPI package exists for the real tool — the `spiderfoot` name on PyPI
is an unrelated placeholder — and it is not a git submodule).

Atropos only ever invokes `sf.py` as a CLI subprocess (see
`server/services/spiderfoot.ts`); the built-in web UI (`-l` flag) and
correlation CLI (`-C` flag) are never started. To keep this vendored copy
small, the following upstream pieces were removed:

- `.github/`, `test/`, `docs/` — CI config, SpiderFoot's own unit tests, and
  its own docs (not used by this repo)
- `Dockerfile*`, `docker-compose*.yml`, `setup.cfg`, `generate-certificate`,
  `sfcli.py`, `.pylintrc`, `.dockerignore` — packaging/container/interactive-
  shell tooling this repo doesn't use
- `spiderfoot/static/`, `spiderfoot/templates/` — assets for the built-in
  web UI, which this integration never serves
- `spiderfoot/dicts/` — large (~11MB) language dictionaries used only by
  `dictwords()`/`dictnames()` in `sflib.py`, consumed by exactly 3 of 233
  modules (`sfp_accounts`, `sfp_binstring`, `sfp_names`); those calls fail
  closed (log + continue) when the files are absent, so those three modules
  lose their dictionary-based matching but the rest of the module catalog is
  unaffected.

Everything else — including the full `modules/` catalog (all 233 modules)
and `correlations/` (required at import time even though `-C` is unused) —
is kept as-is, because the app exposes the *entire* module list to the
frontend for arbitrary selection (`GET /api/spiderfoot/modules`), so a
smaller hand-picked module subset would silently break real, already-shipped
functionality rather than just trim bloat.

Net effect: ~16MB → ~2.8MB, with `sf.py -M`, `sf.py -s <target> -m <module>`,
and the full `spiderfoot.ts` service layer verified working against this
trimmed copy.

To pick up a newer SpiderFoot release, diff a fresh checkout of the new tag
against this directory, re-apply the removals above, and re-run the smoke
check in `scripts/smoke-spiderfoot.ts`.
