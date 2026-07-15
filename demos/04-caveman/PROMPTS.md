# 04-caveman — validated prompts (baseline vs optimized)

**Task:** Explain how incident deduplication works in ingestIncident.ts.

**Technique:** Caveman-style: read once (no re-reads = read-dedup) and generate terse output (ultra mode). Output tokens carry the 4x ET weight.

**Quality gate (both answers must satisfy this):**
> Both answers must convey: a fingerprint/key is built from serviceId+title+severity, an existing active duplicate is matched, and duplicates increment duplicateCount instead of inserting a new incident.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 04-caveman -Compare
```
Compare across all six models (Opus vs Sol, Sonnet 5 vs Terra, Haiku vs MAI):
```powershell
./scripts/run-matrix.ps1 -Demo 04-caveman -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-04-caveman.md` and confirm the answers still satisfy the
quality gate above — that's the "same quality, fewer tokens" proof.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Read the file app/packages/api/src/ingestion/ingestIncident.ts. Then read it a second time
to be completely sure you did not miss anything. Now explain, in exhaustive detail, exactly
how incident deduplication works. Begin by restating my question in your own words, give a
friendly introduction, walk through every step with examples, and finish with a summary
paragraph recapping everything you said.
```

### ✅ Optimized (Caveman-style)
```
Read the file app/packages/api/src/ingestion/ingestIncident.ts exactly once. Explain how
incident deduplication works in at most 4 terse bullet points. No preamble, no restating of
the question, no introduction, no concluding summary — just the bullets.
```

**Expected:** Optimized uses fewer input (↑, single read) AND far fewer output (↓, terse) tokens for the same facts.

> Both prompts produce an answer that satisfies the quality gate; the optimized one does it
> with fewer tokens (and therefore fewer AI credits / lower ET / lower $).
