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
| W1 | `W1-infra-hygiene` | Auto-mirror, bare-scripts, byte-parity, deploy, debloat | high | **sequential** (seq_after: null — entry point) | armed |
| W2 | `W2-design-system` | Global tokens (DONE), theme toggle | normal | **sequential** (seq_after: W1) | armed |
| W3 | `W3-flowsearch-product` | Svelte components, MerkleForest, auth, homepage fork | critical | **sequential** (seq_after: W2) | armed |
| W4 | `W4-platform-api` | Data tools port, API hierarchy, admin consolidation | normal | **sequential** (seq_after: W3) | armed |
| W5 | `W5-editor-tools` | Edit-this-page, DS builder, seance | normal | **sequential** (seq_after: W4) | armed |
| W6 | `W6-ecosystem-funnel` | Marketplace plugin, reckon.systems, APK, portfolio | normal | **sequential** (seq_after: W5) | armed |
| W7 | `W7-advanced-infra` | Chunkify, braid+weave, beat/heartbeat, parity | low | **sequential** (seq_after: W6) | armed |
| W8 | `W8-specialized-products` | Vigil, MK-Ultra, Atropos | low | **sequential** (seq_after: W7) | armed |

**Non-numbered (outside the chain):** `oh-agent-vps-handoff` — sensitive, operator-go, box-SSH
handoff for the live retrofuture.tech 404 + dead self-hosted-runner outage. See "Active Now".

## Ordering Doctrine (revised 2026-08-26 — numbered waves now sequence strictly)

**Numbered waves (W1..W8) must sequence strictly in wave-number order.** Every `Wn` is now
`ordering: sequential`, `seq_after: W(n-1)` (W1 has `seq_after: null`, the sole entry point).
This replaces the earlier parallel-lane graph (W2/W3/W5 fanning out off W1, W7/W8 floating
free) — that flexibility caused work to spread thin across lanes without any one wave actually
finishing. The chain now runs **W1 → W2 → W3 → W4 → W5 → W6 → W7 → W8**, one at a time: an
agent must not pick up work from `Wn` while `W(n-1)`'s `done_when` oracle is unsatisfied, even
if `Wn` shows `armed`. Each Wn's charter.json carries a `transitions[]` entry recording this
doctrine change and its old `ordering`/`seq_after` values for audit.

**Non-numbered charters are NOT part of this chain.** Ad-hoc discovered-work charters minted
outside the W1-W8 set (e.g. `oh-agent-vps-handoff`, or anything minted later via `append`/`new`
without a `W`-prefixed id) keep their own independent `fire_when`/`done_when` oracles — they are
not gated by wave number and don't block or wait on the W-chain. Use the numbered chain only for
the eight standing workstreams; one-off handoffs and incident-response charters stay outside it.

- **Agents must check the `ordering` and `seq_after` fields on a charter before picking up work
  from it.** A `Wn` charter whose `seq_after` charter is not yet done must not be armed/fired
  even if it is otherwise `armed` — this is a hard gate, not a suggestion.

## Standing Doctrines (never override)
- NEVER delete forensics/ (WORM)
- Don't touch overlay/, chart/, dist/, historical .jsonl during sweeps
- Prefer Svelte over React for new interactive work
- Rekor mechanism details: external link OK, describing handshake NOT OK
- mirror-to-dod.yml stays disabled (forensics/custody/private material)
- Scout persona = default for main, ecosystem-wide
- Mandatory shoot/seance visual verification for UI-touching work
- Respect charter `ordering`/`seq_after`: never pick up a `sequential` charter before its `seq_after` dependency is done
- Agents must write a fresh BLUF + narrative into their signing lane's manifest BEFORE running `revenant_charter_lite.py sign` — the manifest IS the narrative-synthesis source (`sign --lane`'s own help text: "its manifest = the BLUF source for narrative synthesis"), so a stale or missing BLUF at sign time means the charter's narrative silently goes stale too. Never sign against a manifest whose BLUF/narrative predates the actual work just done.

## New Additions (2026-08-25 session)

- **W1-infra-hygiene** — debloat: merge `astro-retrofuture`'s duplicate
  homepage drafts. `composed.astro` (manifest-driven, `site.modules.json`,
  backs the `/studio/edit/compose` editor) becomes the one live `/`;
  `index.astro`'s sections (hero carousel, `WhatIsReckon`,
  `CyberSignalConfidence`, curated blog grid) get migrated into new block
  `_types` on the composed renderer, then `index.astro` is deleted outright
  — no parked duplicate file. See `/root/.claude/plans/memoized-churning-bunny.md`
  for the full step-by-step.
- **W4-platform-api** — add `/api/compositions` (list/save/publish) to
  `runtime/mcp-server/server.py`, next to the existing `corpus_sync_endpoint`.
  Replaces a dead-end wire to `report_editor_server.py` (single-tenant,
  hardcoded to `astro-retrofuture`'s own `project.config.json` — wrong
  backend for the corpus-reader's compose page). No Caddyfile change
  needed; `reader.retrofuture.tech` already proxies all of `/api/*` to
  `mcp-server:8080`.
- **W8-specialized-products** — Vigil: full interactive port of
  `revenant-proof-v2/viz/VigilCircle.jsx` onto `retrofuture.tech` as a
  flagship cryptographic-skill showcase. Ported natively to Svelte (site
  has no React integration — matches the "prefer Svelte" standing
  doctrine), re-skinned to the real DS (`revenant-ds.css` /
  `_shared/ds/global-tokens.css`), landing as a dedicated `/vigil` page
  plus one `vigil-teaser` block on the (now-composed) homepage.
- Already shipped this session, not tracked as its own charter item: fixed
  the `reader.retrofuture.tech` Caddy proxy gap for `/write/*` + `/read/*`
  → `mcp-server` (was 405ing; `reckon@d933d8ea37`, confirmed
  `reload-caddy` succeeded on deploy).

## Doneness (census, 2026-08-26)

`revenant_charter_lite.py census` over chart/active: **0 of 8 numbered waves have any sealed
delivery evidence** — all 8 sit at `firing-0-of-N`, despite real, merged, pushed commits landing
this session against several of them (admin-bar.js homepage-route fix, seance A/B compare +
Foundry wiring, the `--no-pr` sync-workflow fix, the `revenant_proof_v2_lite.py mirror` arg fix,
the astro-reckon symlink/`ChainWalk` guard fixes, the flowsearch spawn/peek race lock). The gap
is a process gap, not a work gap: nobody ran `sign`/`seal` against the charter after finishing
the work. `oh-agent-vps-handoff`'s 4th payload item hands that retroactive signing off.

Under the new strict-sequencing doctrine, **W1-infra-hygiene is the only wave currently eligible
to fire** (`seq_after: null`) — everything else is hard-gated behind it now, including W3
(flowsearch), which was previously running in its own parallel lane and is mid-flight. Whoever
picks up `oh-agent-vps-handoff`'s 5th payload item should re-evaluate each Wn with
`revenant_charter_lite.py show --id <Wn>` and `append` any real remaining work before driving
the chain forward one wave at a time.

## Active Now
**`oh-agent-vps-handoff`** (sensitive, operator-go) — live retrofuture.tech 404 + dead
self-hosted-runner outage; needs real box SSH, which Claude does not have this session. See the
charter at `reckon-lite/chart/next/oh-agent-vps-handoff/` for the full payload.
**W1-infra-hygiene** — the sole wave eligible to fire under the new sequencing; everything else
(including W3's flowsearch work, previously ACTIVE in its own lane) now waits on it.
Full prior-session plan at `/root/.claude/plans/memoized-churning-bunny.md` (still relevant to
W1/W5 payload items, now gated behind strict order rather than running in parallel).
