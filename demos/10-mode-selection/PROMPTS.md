# 10-mode-selection — validated prompts (baseline vs optimized)

**Task:** Add a safe minSeverity filter to SentinelOps incidents.

**Technique:** Choose Ask/Research, Plan, then Agent instead of one vague Agent session.

**Quality gate (both answers must satisfy this):**
> The final implementation plan must identify the severity order, incidents route, tests, and success criteria before code changes begin.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 10-mode-selection -Compare
```
Compare across all six models:
```powershell
./scripts/run-matrix.ps1 -Demo 10-mode-selection -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-10-mode-selection.md` and confirm the answer satisfies the quality gate.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Agent: make the incidents page better. Explore the repo, figure out filtering, inspect API and web code, try an approach, run tests, restart if needed, and keep going until it seems right.
```

### ✅ Optimized (phased)
```
Research: find severity order, incidents route, tests.
Plan: add minSeverity with success criteria.
Agent: implement only that plan; pass targeted tests.
```

**Expected:** Optimized uses fewer input (↑) tokens by preventing vague Agent sprawl.

> Both prompts can reach the same implementation, but the phased version bounds context and retries.
