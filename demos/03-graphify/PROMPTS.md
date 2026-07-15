# 03-graphify — validated prompts (baseline vs optimized)

**Task:** Explain the incident-ingestion flow end to end (payload -> stored).

**Technique:** Answer from a budgeted Graphify graph summary instead of reading the ~6 source files verbatim.

**Quality gate (both answers must satisfy this):**
> Both answers must describe the sequence validate -> normalize -> dedup (fingerprint on service+title+severity) -> persist, and mention duplicates increment a count.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 03-graphify -Compare
```
Compare across all six models (Opus vs Sol, Sonnet 5 vs Terra, Haiku vs MAI):
```powershell
./scripts/run-matrix.ps1 -Demo 03-graphify -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-03-graphify.md` and confirm the answers still satisfy the
quality gate above — that's the "same quality, fewer tokens" proof.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Explain the incident-ingestion flow in SentinelOps end to end: what happens to an incoming
incident payload from the moment it hits the API until it is stored. Read whatever source
files you need to be sure you have the full picture.
```

### ✅ Optimized (Answer from a budgeted Graphify graph summary instead of reading the ~6 source files verbatim.)
```
A budgeted knowledge-graph query has already been run for this question. Read ONLY this
single file, which contains the graph's answer:
- fixtures/03-graphify/graph.opt.txt

Using just that graph summary, explain the incident-ingestion flow in SentinelOps end to
end. Only read a source file if the graph summary is genuinely insufficient.
```

**Expected:** Optimized uses far fewer input (↑) tokens (reads one small graph note vs many source files).

> Both prompts produce an answer that satisfies the quality gate; the optimized one does it
> with fewer tokens (and therefore fewer AI credits / lower ET / lower $).
