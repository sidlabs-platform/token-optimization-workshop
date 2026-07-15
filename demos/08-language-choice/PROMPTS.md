# 08-language-choice — validated prompts (baseline vs optimized)

**Task:** Plan a safe SentinelOps deduplication regression fix.

**Technique:** Use concise English instead of redundant multilingual restatement.

**Quality gate (both answers must satisfy this):**
> The plan must keep the serviceId+title+severity fingerprint stable, add or update a regression test, and avoid changing unrelated incident routes.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 08-language-choice -Compare
```
Compare across all six models:
```powershell
./scripts/run-matrix.ps1 -Demo 08-language-choice -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-08-language-choice.md` and confirm the answer satisfies the quality gate.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Please plan a safe fix for the SentinelOps incident deduplication regression. Por favor, planifica una corrección segura para la regresión de deduplicación de incidentes. Veuillez planifier un correctif sûr pour la déduplication des incidents. In other words, inspect ingestIncident.ts, keep serviceId+title+severity stable, add a regression test, and avoid unrelated route changes.
```

### ✅ Optimized (concise English)
```
Plan safe SentinelOps dedupe fix: inspect ingestIncident.ts, keep serviceId+title+severity stable, add regression test, avoid unrelated route edits.
```

**Expected:** Optimized uses fewer input (↑) tokens by removing translated duplication.

> Both prompts produce an answer that satisfies the quality gate; concise English is cheaper here.
