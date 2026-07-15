# 06-challenge — validated prompts (baseline vs optimized)

**Task:** Confirm alert deduplication is implemented and its tests pass.

**Technique:** Stack techniques: scope the test run to just alertDedup and pipe through RTK; avoid dumping full logs / extra file reads.

**Quality gate (both answers must satisfy this):**
> Both answers must confirm the alert-dedup tests pass (green).

**Requires tools:** rtk · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 06-challenge -Compare
```
Compare across all six models (Opus vs Sol, Sonnet 5 vs Terra, Haiku vs MAI):
```powershell
./scripts/run-matrix.ps1 -Demo 06-challenge -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-06-challenge.md` and confirm the answers still satisfy the
quality gate above — that's the "same quality, fewer tokens" proof.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
In the app/ directory, run the entire monorepo test suite with `npm test` (all workspaces),
show me the output, and also open and print the alert-dedup test file so I can see the
cases. Then confirm that alert deduplication is implemented and that its tests pass.
```

### ✅ Optimized (Stack techniques)
```
In app/packages/shared, run just the alert-dedup tests through RTK for compact output:
  rtk vitest run alertDedup

Confirm in one or two sentences that alert deduplication is implemented and its tests pass.
Do not print the full logs or read extra files.
```

**Expected:** Optimized uses far fewer input (↑) tokens (targeted rtk vitest vs whole-suite logs + file dump).

> Both prompts produce an answer that satisfies the quality gate; the optimized one does it
> with fewer tokens (and therefore fewer AI credits / lower ET / lower $).
