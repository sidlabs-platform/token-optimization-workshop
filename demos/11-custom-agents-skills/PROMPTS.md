# 11-custom-agents-skills — validated prompts (baseline vs optimized)

**Task:** Configure guidance for SentinelOps incident API work.

**Technique:** Replace always-on mega instructions with lean persistent routing plus lazy-loaded skills.

**Quality gate (both answers must satisfy this):**
> Guidance must route API incident tasks to the right specialist behavior, preserve deduplication rules, and avoid loading unrelated UI/release instructions every turn.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 11-custom-agents-skills -Compare
```
Compare across all six models:
```powershell
./scripts/run-matrix.ps1 -Demo 11-custom-agents-skills -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-11-custom-agents-skills.md` and confirm the answer satisfies the quality gate.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Always load all SentinelOps rules: API architecture, dashboard UI, incident dedupe, security review, release notes, database migrations, accessibility, chart styling, test strategy, dependency policy, and code review checklist before every turn.
```

### ✅ Optimized (lazy skills)
```
Persistent: route SentinelOps API incident tasks to incident-api skill; preserve serviceId+title+severity dedupe.
Skill desc: incident-api — routes, filters, tests; load on demand.
```

**Expected:** Optimized uses fewer input (↑) tokens by keeping detailed procedures lazy.

> Both prompts preserve the needed behavior; the optimized version does not carry unrelated checklists.
