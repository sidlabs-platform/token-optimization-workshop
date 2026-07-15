# 05-context-engineering — validated prompts (baseline vs optimized)

**Task:** Produce a plan (no code) to add a minSeverity filter to the incidents endpoint.

**Technique:** Replace a bloated prose prompt with an XML-structured, scoped prompt (<task>/<context>/<constraints>) that points at the exact files.

**Quality gate (both answers must satisfy this):**
> Both plans must name the severity types file, the incidents route, and the filter types file, and reuse the existing severity ordering.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 05-context-engineering -Compare
```
Compare across all six models (Opus vs Sol, Sonnet 5 vs Terra, Haiku vs MAI):
```powershell
./scripts/run-matrix.ps1 -Demo 05-context-engineering -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then open `results/MODEL-MATRIX-05-context-engineering.md` and confirm the answers still satisfy the
quality gate above — that's the "same quality, fewer tokens" proof.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Hey! So I've been thinking about our SentinelOps dashboard for a while, and you know how we
have this incidents list endpoint that lets you filter incidents? Well, right now you can
filter by an exact severity, but what I'd really love — and I think the on-call folks would
love it too — is to be able to say "show me everything at this severity OR worse". Like a
minimum-severity filter, so if I pick "high" I'd see high and critical, that kind of thing.
Could you take a look around the codebase, figure out how the current filtering is wired up,
and then tell me what you'd change to add a `minSeverity` query parameter to the incidents
endpoint? I don't need you to actually write the code right now, just walk me through which
files you'd touch and what the changes would be. Thanks so much, you're a lifesaver!
```

### ✅ Optimized (Replace a bloated prose prompt with an XML-structured, scoped prompt (<task>/<context>/<constraints>) that points at the exact files.)
```
<task>Plan (do not write code) how to add a `minSeverity` query param to GET /api/incidents
that returns incidents at the given severity or higher.</task>
<context>
Severity order + guards: app/packages/shared/src/types/severity.ts
Incidents route + filtering: app/packages/api/src/routes/incidents.ts
Filter types: app/packages/shared/src/types/filters.ts
</context>
<constraints>
- List the exact files to change and the specific edit in each.
- Reuse the existing severity ordering; do not invent a new scale.
- Keep the existing `severity` (exact match) param working.
</constraints>
```

**Expected:** Optimized uses fewer input (↑) tokens (less prompt bloat + no repo-wide exploration) for an equal-or-better plan.

> Both prompts produce an answer that satisfies the quality gate; the optimized one does it
> with fewer tokens (and therefore fewer AI credits / lower ET / lower $).
