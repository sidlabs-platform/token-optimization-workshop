# 07-prompt-compression — validated prompts (baseline vs optimized)

**Task:** Ask Copilot to refactor SentinelOps incident filtering and deduplication safely.

**Technique:** Prompt compression: remove polite filler and encode API details as structured input.

**Quality gate (both answers must satisfy this):**
> The response must preserve auth checks, keep severity filtering compatible, and avoid changing the incident fingerprint format used for deduplication.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 07-prompt-compression -Compare
```
Compare across all six models:
```powershell
./scripts/run-matrix.ps1 -Demo 07-prompt-compression -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-07-prompt-compression.md` and confirm the answer satisfies the quality gate.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Hey, could you please help me with the SentinelOps incidents API? I would really appreciate it if you could carefully refactor the handler so it keeps auth intact, makes severity filtering more efficient, and avoids breaking the existing serviceId+title+severity deduplication fingerprint. Please explain the files you would edit and be careful not to change behavior accidentally.
```

### ✅ Optimized (compressed)
```
Refactor SentinelOps incidents API. Preserve auth. Speed severity filter. Keep dedupe fingerprint serviceId+title+severity. List edits only.
```

**Expected:** Optimized uses fewer input (↑) tokens with the same acceptance criteria.

> Both prompts produce an answer that satisfies the quality gate; the optimized one does it with fewer tokens.
