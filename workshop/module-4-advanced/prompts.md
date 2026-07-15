# Module 4 — prompt pairs (paste into GitHub Copilot)

Each pair reaches the **same result**; the optimized one uses far fewer tokens. The commands shown
(`/plan`, `/compact`, `/context`, `/model`, `/model auto`, `/subagents`, `Ctrl+T`) are real GitHub
Copilot CLI commands — type `/help` in the CLI to see them all.

Run each pair through Copilot and read the real token delta from your **agent debug log** / `/usage`
(see [`MEASURING.md`](../MEASURING.md)).

---

## 4.1 — Task breakdown with `/plan` {#41}

### ❌ Baseline (one expensive mega-request)
```
Explore the whole SentinelOps repo so you have full context, then implement the entire escalation
policy end to end in one go: flag incidents acknowledged more than 15 minutes ago but not resolved
as escalated, add escalatedCount to the dashboard stats, add GET /api/incidents?escalated=true, add
the pure escalation logic, wire the store, the routes, the stats aggregation, the web filter chip,
and update every affected test. Do all of it now.
```
This pins ~30 files in context and keeps re-billing them every turn. Check `/context` after it runs.

### ✅ Optimized (decompose, then scope each step)
First, plan — use the CLI command or this prompt:
```
/plan
Break the escalation policy into the smallest ordered steps. For each step list ONLY the files that
step must read or edit. Do not write code yet.
```
Then execute **step 1 only**, scoping context tightly:
```
<context>
Read ONLY these two files:
- app/packages/shared/src/types/incident.ts
- app/packages/shared/src/lib/alertDedup.ts   (style anchor: pure, immutable, no side effects)
</context>
<task>
Step 1 of the plan ONLY. Create app/packages/shared/src/lib/escalation.ts exporting a PURE function
escalateIncident(incident, now, thresholdMs = 15 * 60_000). Return the incident UNCHANGED unless it
is acknowledged (acknowledgedAt set), not resolved, and it has been overdue longer than the
threshold — in which case return a NEW incident with escalated: true and updatedAt = now. Timestamps
are ISO strings (like createdAt/updatedAt), so compare with
`Date.parse(now) - Date.parse(incident.acknowledgedAt) > thresholdMs`. Never mutate the input.
Add optional `escalated?: boolean` to the Incident type.
</task>
<constraints>
Read only the two files above — no repo crawl. Reply in <=3 lines. Do not start step 2.
</constraints>
```
Run `/clear` (or a fresh turn) before step 2 so step 1's context doesn't linger.
(Escalation builds on the `acknowledgedAt` field you added in Module 1.)

### Quality gate (both answers must satisfy)
> `escalation.ts` exports a pure `escalateIncident`; escalation is derived (read-time), idempotent,
> skips resolved incidents, never mutates input; `npm --prefix app run typecheck` passes.

---

## 4.2 — Context management with `/compact` {#42}

### ❌ Baseline (carry the whole sprawling session forward)
```
Here is everything we've discussed so far this session (ack status codes, the toast copy debate, the
flaky CI log, the dedup debugging). Keeping all of that in mind, now add the escalated flagging in
the store and the ?escalated=true route parsing.
```

### ✅ Optimized (compact to just what this step needs)
```
/compact focus="escalation store + route step: goal, decisions made, files to touch, next action"
```
A strong compacted summary looks like this (operational, not chatty):
```
GOAL: add escalation to the API layer only.
DONE: shared/lib/escalation.ts (pure) + filters.escalated? predicate — merged, typecheck green.
NOW:  (a) api/src/data/store.ts — apply escalateIncident(inc, now) when listing/reading incidents;
      (b) api/src/routes/incidents.ts — parse ?escalated=true|false on GET '/'.
CONSTRAINTS: optional field only, no migration; surgical edits; reply <=3 lines.
OPEN RISK: keep escalation read-time (derived); do NOT persist a mutation into seed data.
```

**Why it matters:** the sprawling history is input tokens re-billed every turn. The compacted
summary keeps the *state to continue* and drops the CI-log noise — ~80%+ smaller.

### Quality gate (both must satisfy)
> The summary preserves the next action (store + route edit), the constraints (optional field, no
> migration, read-time derivation), and the open risk — i.e. you can continue the step from the
> summary alone, without the original transcript.

---

## 4.3 — Model selection with `/model` {#43}

### ❌ Baseline (pin Opus, re-explain the repo every turn)
```
/model claude-opus-4.8
[turn 1] SentinelOps is a TypeScript monorepo (shared, api, web) with a store, an incidents router,
a stats aggregator and a React dashboard. House rules: optional fields, no migrations, terse. Look
up the exact acknowledgement-time field name and the status enum values.
[turn 2] (repeat the same SentinelOps description) Grep for every place incidents are filtered.
[turn 3] (repeat again) Design the escalation rule and edge cases.
[turn 4] (repeat again) Implement escalateIncident and wire the store and routes.
[turn 5] (repeat again) Write the unit tests and update the API tests.
```

### ✅ Optimized (route per session; stable rules live in copilot-instructions.md, not re-pasted)
```
Routing plan — one model per SESSION (do NOT switch mid-session; that discards the ~90%-off cache).
Group steps by tier so each session keeps one model start-to-finish:
- Session A  /model claude-sonnet-5 : lookup (field = acknowledgedAt; status open|investigating|
             mitigated|resolved), grep the filtering hops (filters.ts, query.ts, routes/incidents.ts),
             implement escalateIncident + store/route wiring, write unit + affected API tests.
- Session B  /model claude-opus-4.8 : the one ambiguous piece — design the escalation rule + edge
             cases (idempotent, skip resolved, clock skew). Hand its conclusion to Session A as one
             line of state.
(Trivial lookups can go to /model claude-haiku-4.5 in their own session if you want the cheapest tier.)
Handoffs between sessions are one line of state each. Repo facts live in .github/copilot-instructions.md
(cached), so no session re-explains the repo.
```
Feel the multiplier: run the same task on `/model claude-haiku-4.5` vs `/model claude-opus-4.8` (in
separate sessions) and compare the **AI credits** in `/usage`.

### Quality gate (both must satisfy)
> Each **session** runs a single model start-to-finish (no mid-session tier hopping, so the cache is
> preserved); the ambiguous design step runs on the flagship while implementation/tests/lookups run on
> the mid/small tier; the feature still typechecks and tests pass; and no session re-explains the repo
> (stable facts live in `.github/copilot-instructions.md`).

---

## 4.4 — Auto model with `/model auto` {#44}

### ❌ Baseline (hand-babysit the tier every turn)
```
Use Claude Opus 4.8 for this next part because it's important. Actually, for the simple field-name
lookup switch down to the Haiku small model to save money, then switch back up to Opus for the
reasoning, but only if it's hard, otherwise use Sonnet. For tests use Sonnet, but escalate to Opus
if a test is tricky, then switch back down for mechanical edits. Before each step tell me which
model you're on and why, and confirm the switch. Repeat this model-selection preamble every turn.
```

### ✅ Optimized (turn on auto once; set a lean sub-agent default once)
```
/model auto
/subagents            (set the DEFAULT sub-agent model to a mid/small tier so delegated work
                       doesn't all run on the flagship)
Just do the work; let auto pick the tier per step. No model preamble, no switch confirmations.
Override with /model only if I flag a step as unusually hard or trivial.
```

**Why it matters:** the baseline spends tokens *talking about* models (and invites mistakes). Auto
delivers tier-appropriate execution with none of the meta-prose — ~50%+ less on that overhead.

### Quality gate (both must satisfy)
> Work is executed on tier-appropriate models without a per-turn model preamble; the participant can
> still override a specific step with `/model` when they know it's unusually hard or trivial.

> ℹ️ `/subagents` configures the **default and per-agent sub-agent models** — it does not invent
> named routing categories. Pair it with `/model auto` for the routing behaviour.

---

## 4.5 — Reasoning depth {#45}

Concrete question: *should acknowledged-but-unresolved incidents still count in `openIncidentCount`,
or be excluded once escalated?*

### ❌ Baseline (over-think a one-paragraph question)
```
Think through every possible angle exhaustively before answering: enumerate all statuses, the
history of the metric, stakeholder expectations, gaming risk, the split-metric alternative, and the
full migration cost across maintainability, testability and backward compatibility — then decide.
```

### ✅ Optimized (right-sized reasoning)
```
Think briefly. In <=6 lines: state the rule for openIncidentCount and one line of justification.
```
(Press **Ctrl+T** to *reveal* the reasoning display so you can see how much deliberation is
happening — it should be short. Ctrl+T only toggles the display; you control the *depth* by how you
phrase the ask ("think briefly" / "concise rationale") and by the model/effort you pick.)

### Quality gate (both answers must reach the same conclusion)
> `openIncidentCount` = incidents where `status !== 'resolved'`; acknowledged and escalated
> incidents still count (both are unresolved work); if a "needs first response" number is wanted,
> add a separate `unacknowledgedIncidentCount` rather than changing the meaning of open.

**Why it matters:** reasoning traces are **output** (4× ET weight). Cutting ~75% of the deliberation
while keeping the same recommendation is an outsized Effective-Token win.
