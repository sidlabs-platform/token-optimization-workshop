# 20-power-user — validated prompts (baseline vs optimized)

**Task:** Ask Copilot to diagnose a SentinelOps test failure from shell output.

**Technique:** Trim shell output, summarize with scripts, collapse tool calls, and choose concise
context for the target model.

**Quality gate (both answers must satisfy this):**
> Both variants must identify the failing package/test, the expected vs received severity bucket,
> and the likely file to inspect next.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants:
```powershell
./scripts/run-prompt.ps1 -Demo 20-power-user -Compare
```
Run the matrix:
```powershell
./scripts/run-matrix.ps1 -Demo 20-power-user -Variant both
```

Review `results/MODEL-MATRIX-20-power-user.md` and confirm the quality gate.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Here is the full terminal output from npm ls and npm test. It includes package tree noise, passing
tests, transform timing, coverage tables, retries, warnings, and one failure. Read all of it and
figure out why SentinelOps incident severity routing failed.
```

### ✅ Optimized (trimmed)
```
Diagnose this summarized failure: `app/packages/api` test `routes severity escalates duplicates`
expected bucket `critical`, received `high`. Only relevant changed files: `src/routes/incidents.ts`,
`src/ingestion/ingestIncident.ts`. Next inspect severity normalization.
```

**Expected:** The optimized context contains the same actionable failure with far fewer tokens.
