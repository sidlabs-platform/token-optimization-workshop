# 18-instruction-caching — validated prompts (baseline vs optimized)

**Task:** Structure SentinelOps Copilot instructions for cacheability and lower always-on context.

**Technique:** Move volatile content to the end and split path-specific instructions with `applyTo` so
less instruction text loads per turn.

**Quality gate (both answers must satisfy this):**
> Both instruction sets must preserve SentinelOps TypeScript rules, incident API guidance, test
> expectations, and the warning not to invent a new severity scale.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 18-instruction-caching -Compare
```
Compare across all six models:
```powershell
./scripts/run-matrix.ps1 -Demo 18-instruction-caching -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Put today's date, active ticket IDs, sprint status, reordered notes, API rules, web rules, docs rules,
and every incident-dashboard convention at the top of one always-on Copilot instruction file.
```

### ✅ Optimized (stable cached prefix)
```
Keep `.github/copilot-instructions.md` byte-stable: durable SentinelOps rules first, under 200 lines.
Move dates and ticket IDs to the end. Split heavy API-only guidance into an `applyTo:
app/packages/api/**` instruction file.
```

**Expected:** Optimized uses fewer input (↑) tokens and keeps the reusable prefix stable enough for
the cache discount.
