# 15-reasoning-depth — validated prompts (baseline vs optimized)

**Task:** Decide whether a high-severity SentinelOps incident should page on-call.

**Technique:** Cap reasoning depth: avoid visible HIGH/MAX scratch work for a routine policy answer;
use MEDIUM with a concise rationale.

**Quality gate (both answers must satisfy this):**
> Both answers must say high severity pages on-call, critical escalates immediately, and low/medium
> remain ticket/Slack-only unless the runbook says otherwise.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants on one model and see the token delta:
```powershell
./scripts/run-prompt.ps1 -Demo 15-reasoning-depth -Compare
```
Compare across all six models:
```powershell
./scripts/run-matrix.ps1 -Demo 15-reasoning-depth -Variant both
```
(macOS/Linux: use the `.sh` equivalents. Add `-DryRun` to preview without calling Copilot.)

Then confirm the answers satisfy the quality gate above.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Use maximum reasoning effort. Show all of your thinking step by step before answering. We are
reviewing SentinelOps escalation policy: if an incident arrives with severity "high", should it page
on-call? Consider every possible interpretation, list assumptions, compare all severities, and do not
skip any reasoning.
```

### ✅ Optimized (reasoning-depth control)
```
Think briefly, then answer concisely: In SentinelOps, should severity "high" page on-call? Mention
how critical, high, medium, and low differ.
```

**Expected:** Optimized uses far fewer output (↓) tokens because it asks for medium-depth reasoning
and a compact answer, not a visible scratchpad.
