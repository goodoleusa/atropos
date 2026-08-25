# Mega Charter — All Workstreams

> **Canonical source**: `reckon/chart/active/mega-all-workstreams/`
> Minted via `revenant_charter_lite.py`. This file is the human-readable view.
>
> **No Claude tasks or plan files.** They inject ~10k tokens/turn and blow context.
> Work is tracked by the charter system — agents sign manifests against charters,
> missions form shapes that straddle charters, and the whole thing is a living
> forensic artifact with BLUF narrative that updates as work progresses.

---

## Waves (see Ordering Doctrine below — not strictly W1→W8 in sequence)

| Wave | Charter ID | Focus | Priority | Order | Status |
|------|-----------|-------|----------|-------|--------|
| W1 | `W1-infra-hygiene` | Auto-mirror, bare-scripts, byte-parity, deploy, debloat | high | **sequential** (first, seq_after: null) | armed |
| W2 | `W2-design-system` | Global tokens (DONE), theme toggle | normal | parallel (seq_after: W1) | 2/3 done |
| W3 | `W3-flowsearch-product` | Svelte components, MerkleForest, auth, homepage fork | critical | parallel (seq_after: W1) | **ACTIVE** |
| W4 | `W4-platform-api` | Data tools port, API hierarchy, admin consolidation | normal | **sequential** (seq_after: W3) | armed |
| W5 | `W5-editor-tools` | Edit-this-page, DS builder, seance | normal | parallel (seq_after: W1) | armed |
| W6 | `W6-ecosystem-funnel` | Marketplace plugin, reckon.systems, APK, portfolio | normal | **sequential** (seq_after: W4) | armed |
| W7 | `W7-advanced-infra` | Chunkify, braid+weave, beat/heartbeat, parity | low | parallel (seq_after: null) | armed |
| W8 | `W8-specialized-products` | Vigil, MK-Ultra, Atropos | low | parallel (seq_after: null) | armed |

## Ordering Doctrine
Not every wave gates every other wave. The charter's `ordering` field (`sequential` | `parallel`) plus its `seq_after` field (the charter ID it must wait on, or `null`) make the real dependency graph explicit instead of leaving it implied by wave number:

- **W-numbered sub-charters with an explicit dependency are `sequential`** — they carry a `seq_after` pointing at the charter they must wait on, and must not fire until that charter is done. Example: W4 (`sequential`, `seq_after: W3-flowsearch-product`) cannot start until W3 completes; W6 (`sequential`, `seq_after: W4-platform-api`) waits on W4.
- **Sub-charters without a hard dependency are `parallel`** — they can run concurrently with siblings once their own `seq_after` (if any) is satisfied. W2, W3, and W5 all only depend on W1 and can run at the same time once W1 is done. W7 and W8 have `seq_after: null` and can run any time (lowest priority, no blocking dependency).
- The dependency chain in practice: **W1 → {W2, W3, W5} → W4 → W6**, with W7/W8 floating free in parallel throughout.
- **Agents must check the `ordering` and `seq_after` fields on a charter before picking up work from it.** A charter whose `seq_after` charter is not yet done must not be armed/fired even if it is otherwise `armed` — this is a hard gate, not a suggestion. A `parallel` charter with a satisfied `seq_after` (or `null`) is fair game to pick up alongside any other eligible charter.

## Standing Doctrines (never override)
- NEVER delete forensics/ (WORM)
- Don't touch overlay/, chart/, dist/, historical .jsonl during sweeps
- Prefer Svelte over React for new interactive work
- Rekor mechanism details: external link OK, describing handshake NOT OK
- mirror-to-dod.yml stays disabled (forensics/custody/private material)
- Scout persona = default for main, ecosystem-wide
- Mandatory shoot/seance visual verification for UI-touching work
- Respect charter `ordering`/`seq_after`: never pick up a `sequential` charter before its `seq_after` dependency is done

## Active Now
**W3** — Ingest Claude Design HTML → Svelte flowsearch components
