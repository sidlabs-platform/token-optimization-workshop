# 17-subagents — validated prompts (baseline vs optimized)

**Task:** Discover how to add `minSeverity` to the SentinelOps incidents endpoint.

**Technique:** Use subagents as a compression boundary: worker reads many files, parent receives a
small operational digest.

**Quality gate (both answers must satisfy this):**
> Both outputs must identify the incidents route, severity ordering, filter types, route tests, and
> the need to preserve exact severity filtering.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 17-subagents -Compare
```
Compare across all six models:
```powershell
./scripts/run-matrix.ps1 -Demo 17-subagents -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
In the parent session, read every file that might relate to incidents, severity, deduplication,
routing, filters, tests, and dashboard rendering. Paste all relevant excerpts into the parent context
before deciding how to add `minSeverity`.
```

### ✅ Optimized (subagent boundary)
```
Dispatch a worker subagent to inspect the incident API and tests. Ask it to return only: relevant
files, severity ordering source, current filter behavior, exact edits for `minSeverity`, test cases,
and risks. Parent reasons over that digest instead of raw file bodies.
```

**Expected:** Optimized uses fewer parent input (↑) tokens because the worker's large file reads stay
inside the worker context and only a compact digest crosses back.
