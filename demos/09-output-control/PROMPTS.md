# 09-output-control — validated prompts (baseline vs optimized)

**Task:** Generate a SentinelOps severity helper for incident filtering.

**Technique:** Output control: require code only, no preamble, no recap.

**Quality gate (both answers must satisfy this):**
> The answer must provide a TypeScript severity ordering helper that returns incidents at the requested severity or worse.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 09-output-control -Compare
```
Compare across all six models:
```powershell
./scripts/run-matrix.ps1 -Demo 09-output-control -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-09-output-control.md` and confirm the answer satisfies the quality gate.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Write a TypeScript helper for SentinelOps severity filtering. Please explain the idea, mention why ordering matters, show the code, describe edge cases, and finish with a summary.
```

### ✅ Optimized (code only)
```
Write the TypeScript helper. Code only. No explanation.
```

**Expected:** Optimized uses fewer output (↓) tokens; output is weighted 4× in ET.

> Both prompts produce an answer that satisfies the quality gate; the optimized one avoids chatty wrapper text.
