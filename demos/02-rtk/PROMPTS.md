# 02-rtk — validated prompts (baseline vs optimized)

**Task:** Report whether the shared tests and api type-check pass, and how many tests ran.

**Technique:** Pipe verbose tool output through RTK (rtk vitest / rtk tsc) so the model ingests a compact summary instead of the full logs.

**Quality gate (both answers must satisfy this):**
> Both answers must report the type-check passes with 0 errors and the shared suite passes (60 tests).

**Requires tools:** rtk · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 02-rtk -Compare
```
Compare across all six models (Opus vs Sol, Sonnet 5 vs Terra, Haiku vs MAI):
```powershell
./scripts/run-matrix.ps1 -Demo 02-rtk -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-02-rtk.md` and confirm the answers still satisfy the
quality gate above — that's the "same quality, fewer tokens" proof.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
In the app/ directory, run the shared package's test suite and the api package's
type-check using the plain commands:
- npx vitest run --reporter verbose   (in app/packages/shared)
- npx tsc --noEmit -p packages/api/tsconfig.json   (in app)

Show me the results and tell me whether everything passes and how many tests ran.
```

### ✅ Optimized (Pipe verbose tool output through RTK (rtk vitest / rtk tsc) so the model ingests a compact summary instead of the full logs.)
```
In the app/ directory, run the shared package's test suite and the api package's
type-check through RTK so the output is compressed:
- (in app/packages/shared)  rtk vitest run
- (in app)                  rtk tsc --noEmit -p packages/api/tsconfig.json

Show me the results and tell me whether everything passes and how many tests ran.
```

**Expected:** Optimized uses far fewer input (↑) tokens because RTK compresses the tool output the model reads.

> Both prompts produce an answer that satisfies the quality gate; the optimized one does it
> with fewer tokens (and therefore fewer AI credits / lower ET / lower $).
