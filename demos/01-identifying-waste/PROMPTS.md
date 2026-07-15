# 01-identifying-waste — validated prompts (baseline vs optimized)

**Task:** Summarize the incidents feature (endpoints, list filters, incident fields).

**Technique:** Scope the context: name the exact files instead of letting the agent read the whole repo.

**Quality gate (both answers must satisfy this):**
> Both answers must state the filters severity, serviceId, status, search, and mention incident fields (id, serviceId, title, severity, status).

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 01-identifying-waste -Compare
```
Compare across all six models (Opus vs Sol, Sonnet 5 vs Terra, Haiku vs MAI):
```powershell
./scripts/run-matrix.ps1 -Demo 01-identifying-waste -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-01-identifying-waste.md` and confirm the answers still satisfy the
quality gate above — that's the "same quality, fewer tokens" proof.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Explore the SentinelOps repository thoroughly. Read through the codebase across all
packages (shared, api, web) — open the source files, the tests, the config, and the seed
data as needed — so you have full context. Then give me a summary of the incidents feature:
what REST endpoints exist for incidents, what query filters the incidents list endpoint
supports, and what fields an incident record has.
```

### ✅ Optimized (Scope the context)
```
Read ONLY these two files:
- app/packages/api/src/routes/incidents.ts
- app/packages/shared/src/types/incident.ts

Then summarize the incidents feature: the REST endpoints for incidents, the query filters
the incidents list endpoint supports, and the fields an incident record has. Do not read any
other files.
```

**Expected:** Optimized uses far fewer input (↑) tokens for the same correct answer.

> Both prompts produce an answer that satisfies the quality gate; the optimized one does it
> with fewer tokens (and therefore fewer AI credits / lower ET / lower $).
