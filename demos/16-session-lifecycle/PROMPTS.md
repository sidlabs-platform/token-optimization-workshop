# 16-session-lifecycle — validated prompts (baseline vs optimized)

**Task:** Continue the SentinelOps minSeverity filter work after a long assistant session.

**Technique:** Replace re-sent multi-task history with a compact one-task summary using `/clear` and
`/compact`.

**Quality gate (both answers must satisfy this):**
> Both contexts must preserve the current goal, relevant files, severity ordering, and next test to
> run for the minSeverity endpoint change.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 16-session-lifecycle -Compare
```
Compare across all six models:
```powershell
./scripts/run-matrix.ps1 -Demo 16-session-lifecycle -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Continue from the entire 40-turn conversation below. It includes the API minSeverity plan, dashboard
copy edits, a CI cleanup, and an ingest deduplication investigation. Keep all of it in mind before
making the next change.
```

### ✅ Optimized (session lifecycle)
```
/clear
/compact the previous task into this summary only: add `minSeverity` to GET /api/incidents using
app/packages/shared/src/types/severity.ts ordering, app/packages/shared/src/types/filters.ts query
types, and app/packages/api/src/routes/incidents.ts filtering. Next: add route tests for high =>
high+critical while exact `severity` still works.
```

**Expected:** Optimized uses fewer input (↑) tokens by discarding unrelated history and carrying only
state needed for the active task.
