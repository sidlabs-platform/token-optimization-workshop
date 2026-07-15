# Module 2 — Query & navigate the large codebase  ⏱ 45 min

> The acknowledge slice works. Now product wants **assignment** (`POST /:id/assign`), an
> **`acknowledged` filter** on the incidents list, and they want it done **without** the agent
> re-reading the whole repo every turn. This module is about **finding the right code fast** and
> **compressing the noisy tool output** you feed back to the model.

**Techniques practised:** query-don't-read (Graphify-style) · RTK tool-output compression ·
`AGENTS`/instruction caching · MCP hygiene.
**You will touch:** `shared/src/types/filters.ts`, `shared/src/utils/query.ts`,
`api/src/routes/incidents.ts`, a new `shared/src/lib/assignment.ts`, and
`.github/copilot-instructions.md`.

**Prompts:** [`prompts.md`](prompts.md).

---

## Exercise 2.1 — Query, don't read  ⏱ 12 min

**Goal:** answer *"where is incident filtering handled, end to end?"* cheaply.

1. **❌ Blind way:** paste the baseline prompt ([`prompts.md`](prompts.md#21)) that tells Copilot
   to *open every file that might touch filtering*. Note how much context it pulls.
2. **✅ Query way:** paste the optimized prompt — ask for a **map with a token budget**:
   > "In ≤12 lines, list the exact file+symbol for each hop of incident filtering
   >  (type → predicate → api parse → store apply → web). Read at most 3 files to confirm."
3. Compare the two runs **from Copilot's own numbers** — check `/context` (the blind read balloons
   the window; the budgeted map barely moves it) and `/usage` (or the input-token entries in your
   agent debug log) after each. A budgeted map is **~90% cheaper** than the blind read and hands you
   exactly the files to edit next. See [`../MEASURING.md`](../MEASURING.md).

> 🔧 **Real tool:** if you installed Graphify (`pip install graphifyy`), try
> `graphify query "incident filtering" --budget 900` for the same effect on any repo.

**Checkpoint:** you can name the 3 files to edit for the `acknowledged` filter *without*
having read the whole app.

---

## Exercise 2.2 — Build assignment + the acknowledged filter  ⏱ 18 min

**Goal:** extend the feature using only the files your query surfaced.

Using the scoped prompt in [`prompts.md`](prompts.md#22), implement:

1. **`shared/src/lib/assignment.ts`** (new) — pure `assignIncident(incident, engineer, now)`:
   reject off-shift / resolved; no-op if already the assignee; **does not** change status.
2. **`shared/src/types/filters.ts`** — add `acknowledged?: boolean` to `IncidentFilters` and
   include it in `hasActiveIncidentFilters`.
3. **`shared/src/utils/query.ts`** — teach `incidentMatchesFilters` about `acknowledged`
   (`Boolean(incident.acknowledgedBy) === filters.acknowledged`).
4. **`api/src/routes/incidents.ts`** — parse `?acknowledged=true|false` on `GET /` and add
   `POST /:id/assign`.
5. Export `assignment` from `shared/src/index.ts`.

Verify the build stays green:
```powershell
npm --prefix app run typecheck
```

**Checkpoint:** `GET /api/incidents?acknowledged=false` and `POST /api/incidents/:id/assign`
both exist; typecheck passes.

---

## Exercise 2.3 — Compress tool output with RTK  ⏱ 10 min

**Goal:** when you *do* need to show the agent a `git diff` or a `grep` sweep, compress it first.

1. Feed the agent a raw diff in one turn and its RTK-compressed form in another, and compare the
   **input tokens** Copilot reports (`/usage` or the agent debug log) for each.
2. Discuss: dense source diffs compress **less** (~15–20%) while repetitive logs compress
   **70–95%** (you'll see that in Module 3). **The cheapest token is the one you never send** —
   prefer a diff over a full-file re-read.

> 🔧 **Real tool:** with RTK on PATH, `rtk git diff` / `rtk grep "acknowledged"` emit the
> compressed form directly. Without it, the captured fixtures give the same numbers.

---

## Exercise 2.4 — Cache the stable context (AGENTS file)  ⏱ 5 min

**Goal:** stop re-sending the same house rules every turn.

1. Create/append `.github/copilot-instructions.md` with the **stable** facts an agent needs for
   this repo (see the template in [`prompts.md`](prompts.md#24)): monorepo layout, "optional
   fields only, no migrations", "surgical edits", "reply terse".
2. Because this file is stable across turns, it becomes **cacheable** input (~90% cheaper on
   the ET model) instead of prose you retype into every prompt.

**Checkpoint:** your repo has a lean instructions file; future prompts can drop the boilerplate.

---

## Wrap (3 min)
Check `/usage` for your running session total. You extended the feature by **querying** instead of
reading, **compressing** tool output, and **caching** the house rules. Module 3 hardens it all with
tests — efficiently.
