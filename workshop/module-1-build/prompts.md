# Module 1 — prompt pairs (paste into Copilot)

Each pair produces the **same result**; the optimized one uses far fewer tokens.
Run `./workshop/module-1-build/measure.ps1` to see the measured delta.

---

## 1.1 — Baseline: feel the waste {#11}

### ❌ Baseline (no optimization)
```
Explore the SentinelOps repository thoroughly. Read through every package (shared, api, web)
— the source, the tests, the config, and the seed data — so you have complete context. Then
add a feature that lets an on-call engineer acknowledge an incident, and tell me everything
you changed and why, file by file.
```
This makes the agent open ~30 files and emit a wall of prose. Measure it, then do 1.2.

---

## 1.2 — Optimized: build the API slice {#12}

### ✅ Optimized (scope + XML structure)
```
<context>
Read ONLY these files:
- app/packages/shared/src/types/incident.ts
- app/packages/api/src/routes/incidents.ts
- app/packages/api/src/data/store.ts
Do not read anything else.
</context>

<task>
Add an "acknowledge incident" capability:
1. Add optional acknowledgedBy?: string|null and acknowledgedAt?: string|null to Incident.
2. Create app/packages/shared/src/lib/acknowledge.ts exporting a PURE function
   acknowledgeIncident(incident, engineer, now) where engineer is an OnCallEngineer
   { id; name; rotation; active }. Rules: reject if !engineer.active
   (reason 'engineer-not-on-shift'); reject if status==='resolved' (reason 'incident-resolved');
   idempotent re-ack keeps the first acknowledger and only updates updatedAt; an 'open'
   incident becomes 'investigating' on first ack. Never mutate the input.
3. Add store.acknowledge(id, engineer, now) to app/packages/api/src/data/store.ts with a small
   in-memory engineer roster.
4. Add POST /:id/ack to the incidents router returning 200 (ok), 400 (missing engineerId),
   404 (unknown engineer or incident), 409 (off-shift or resolved).
Export the new modules from app/packages/shared/src/index.ts.
</task>

<constraints>
- Optional fields only — no data migration; existing seed data and tests must stay valid.
- Keep edits surgical. Do not reformat unrelated code.
- Reply with a <=5 line summary. Do NOT restate file contents or the plan.
</constraints>
```

### Quality gate (both 1.1 and 1.2 answers must satisfy)
> The endpoint POST /api/incidents/:id/ack exists; ack is rejected for off-shift engineers and
> resolved incidents; an open incident transitions to investigating; `npm --prefix app run
> typecheck` passes.

---

## 1.3 — Output control {#13}

### ❌ Verbose
```
Summarize everything you just did. Walk me through each file, restate the code you wrote,
explain every design decision in full, and describe the alternatives you considered.
```

### ✅ Terse (output-controlled)
```
Summarize the change in <=6 lines: bullet the files touched (one line each) and the endpoint
status codes. No code blocks, no restating file contents, no preamble.
```

**Why it matters:** output tokens carry a **4× ET weight**. Cutting ~70% of the summary text
saves multiples of that in Effective Tokens.
