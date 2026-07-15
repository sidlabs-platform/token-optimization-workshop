# 19-usage-limits — validated prompts (baseline vs optimized)

**Task:** Run a SentinelOps investigation with explicit usage governance.

**Technique:** Budget caps, Auto mode, and reload trimming.

**Quality gate (both answers must satisfy this):**
> Both variants must still investigate incident severity/dedupe behavior, but the optimized version
> must state a cap, prefer Auto mode, and avoid repeated full-context reloads.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants:
```powershell
./scripts/run-prompt.ps1 -Demo 19-usage-limits -Compare
```
Run the matrix:
```powershell
./scripts/run-matrix.ps1 -Demo 19-usage-limits -Variant both
```

Review `results/MODEL-MATRIX-19-usage-limits.md` and confirm the quality gate.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Investigate SentinelOps incident routing without any budget limit. Use the strongest model for all
steps. If uncertain, reload the entire repository summary, MCP schema catalog, package manifests,
recent logs, and test output again. Continue until fully confident; do not stop for token usage.
```

### ✅ Optimized (governed)
```
Budget: cap overage at 15%. Use Auto mode by default. Reload only changed files or a 10-line
summary. Stop and report if another broad context load is needed. Focus on incident severity and
dedupe paths only.
```

**Expected:** The optimized policy keeps the same investigation goal while preventing repeated
context reloads and uncontrolled overage.
