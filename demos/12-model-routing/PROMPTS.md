# 12-model-routing — validated prompts (baseline vs optimized)

**Task:** Plan and implement a SentinelOps incident severity routing change.

**Technique:** Model routing: Opus for planning, Sonnet for TypeScript edits, mini for lookups.

**Quality gate (both answers must satisfy this):**
> Both answers must preserve the incident dashboard domain, mention `app/packages/api`, keep
> severity and deduplication behavior accurate, and avoid delegating risky auth changes.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 12-model-routing -Compare
```
Compare across all six models:
```powershell
./scripts/run-matrix.ps1 -Demo 12-model-routing -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview.)

Then open `results/MODEL-MATRIX-12-model-routing.md` and confirm the answers still satisfy the
quality gate above.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Use claude-opus for every step of this SentinelOps task. Re-read the repo summary before each
turn. Explain the dashboard, API package, incident model, severity enum, deduplication strategy,
MCP tools, testing approach, and rollout concerns before planning, before editing, before checking
field names, and before summarizing. Keep all work on the same frontier model even for simple
lookups.
```

### ✅ Optimized (routed)
```
Route models: Opus drafts the risk plan once; Sonnet implements `app/packages/api` TypeScript and
tests; mini only checks filenames/field names. Handoffs are 3 bullets: goal, touched files, open
risk. Do not restate stable SentinelOps context.
```

**Expected:** Same quality gates, fewer input tokens, and lower effective cost by assigning each
step to the cheapest capable model.
