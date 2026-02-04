# Plan: Get Real IP/ASN Data (Not Placeholder JSON)

## Problem

The crew returns plausible-looking but **fake** entities (e.g. `192.0.2.1`, `AS12345`, `Packetware LLC`) instead of calling HackerTarget and using real DNS/IP/ASN data. The LLM is generating example-style JSON instead of tool-driven output.

## Root cause

- Task says "use the provided tools" but doesn’t **require** or **structure** tool use.
- Example in the task uses generic IPs/countries, so the model copies that pattern.
- No separation between "call tools and record raw output" and "turn that output into JSON."

## Improvements (in order of impact)

### 1. Tool-first pipeline (recommended)

**Run the APIs from Python before the crew**, then have the crew only format and enrich.

- In `_run_investigation()`:
  - If seed looks like a **domain** (e.g. `packetware.net`): call `hackertarget_dns_lookup(seed)`, parse A/AAAA records, then for each IP call `hackertarget_ip_geo(ip)` and `hackertarget_as_lookup(ip)`; optionally `hackertarget_whois(seed)`.
  - If seed looks like an **IP**: call `hackertarget_ip_geo(seed)`, `hackertarget_as_lookup(seed)`, `hackertarget_reverse_dns(seed)`, `hackertarget_reverse_ip(seed)`.
- Build a **raw_findings** dict (e.g. `{"dns": "...", "ips": [{"ip": "x", "geo": "...", "asn": "..."}], "whois": "..."}`).
- Pass `raw_findings` to the crew. Task: "Convert this raw OSINT data into the required JSON entity list. Do not add or invent IPs, ASNs, or organizations that are not in the raw data. Add confidence and investigation_id."
- Result: **All IPs and ASNs come from real API responses**; the LLM only structures and maps to entity types.

**Files:** `crewai_weave_demo.py` (add a `_gather_raw_osint(seed)` that calls the HackerTarget helpers, then pass result into the crew); optionally a small `osint_tools/runner.py` that runs tools and returns structured raw data.

### 2. Stricter research task (no pipeline change)

If you keep the current "agent has tools" flow:

- **Remove** example IPs/countries from the task (no `1.2.3.4`, `US`, `AS12345`).
- **Require** in the task: "You MUST call the tools first. For a domain seed, call DNS lookup, then for each A record call IP geo and AS lookup. Output JSON only from tool results. Do not use 192.0.2.x, 1.1.1.1, or made-up AS numbers."
- **Add** to `expected_output`: "Every `ip_address` and `asn_number` must appear verbatim in the tool output you received."
- **Two-step task** for the researcher: (1) "Call tools for {seed} and paste the raw tool outputs here." (2) "Convert the pasted tool outputs into the JSON entity array. No invented data."

**Files:** `crewai_weave_demo.py` (research_task description and expected_output only).

### 3. Parse tool output in Python and merge with crew output

- After the crew run, **also** run the same HackerTarget lookups in Python (same as 1).
- Parse DNS for A records, geo and AS for each IP.
- **Merge**: start from entities returned by the crew; for each entity of type `domain`, `ip_address`, `asn`, overwrite or fill with fields from the real tool output (e.g. replace placeholder IPs with A records, add real country/ASN from ip_geo and as_lookup).
- Write the merged entity list to Obsidian.

**Files:** `crewai_weave_demo.py` or `obsidian_export.py`; add a `_merge_real_osint(entities, seed)` that runs tools and enriches entities.

### 4. Better tool descriptions

- In `osint_tools/tools.py`, make each tool’s docstring say: "Returns raw text: use this output as the source for entity fields; do not substitute placeholder values."
- So when the agent reads the tool list, it’s clear the return value is the source of truth.

**Files:** `osint_tools/tools.py` (docstrings only).

---

## Recommended path

- **Do 1 (tool-first pipeline)** so IPs and ASNs are always from real lookups; use the crew to shape and add confidence/organization/person only from tool text.
- **Plus 4** so any remaining tool use by the agent is clearly tied to "use this output, don’t invent."
- Optionally add **3** as a safety net: even if the crew returns placeholders, a post-pass overwrites with real data where we have it.

## Minimal change set (no new pipeline)

If you don’t want to add the tool-first pipeline yet:

- Apply **2** (stricter task, no example IPs/ASNs, two-step "paste tool output then convert").
- Apply **4** (tool docstrings).
- Optionally run **3** (post-merge of real tool data) so at least IP/ASN fields get overwritten with real values from Python-run tools.
