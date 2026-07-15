# Module 2 — Query & navigate the large codebase  ⏱ 45 min

> The acknowledge slice works. Now product wants **assignment** (`POST /:id/assign`), an
> **`acknowledged` filter** on the incidents list, and they want it done **without** the agent
> re-reading the whole repo every turn. This module is about **finding the right code fast** and
> **compressing the noisy tool output** you feed back to the model.

**Techniques practised:** query-don't-read (**Graphify**, build-once graph) · **RTK** tool-output
compression wired into Copilot via `rtk init --copilot` · `AGENTS`/instruction caching · MCP hygiene.
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

### Make querying the default — build a Graphify graph once (the effective way)
Instead of hoping the agent stays disciplined, give it a **precomputed code graph** it can query
cheaply, so you never have to say "don't read the whole repo" again:
```powershell
pip install graphifyy
graphify .                                        # build the graph ONCE (persists on disk)
graphify query "incident filtering" --budget 900  # budgeted answer: just the relevant nodes/edges
```
- `graphify .` indexes the repo once; the graph is reused for every later query — you **don't rebuild
  or reference it per prompt**.
- Ask questions with `--budget <tokens>` so answers are capped by design. Use the local **`/graphify`**
  skill inside Copilot to run these without leaving the session.
- Practical habit: **query the graph → get the 3 files → then read only those.** The graph replaces
  the "open everything to find where X lives" reflex.

> No Graphify installed? The captured fixture gives the same budgeted-vs-blind numbers offline.

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

## Exercise 2.3 — Wire RTK into the workspace so tool output auto-compresses  ⏱ 10 min

**Goal:** when you *do* need to show the agent a `git diff`, a `grep` sweep, or a test log, compress
it **automatically** — without typing `rtk` in front of anything.

### Set it up once (the effective way)
1. Install the tool (RTK + ripgrep):
   ```powershell
   ./scripts/install-tools.ps1        # Windows  (bash scripts/install-tools.sh on mac/Linux)
   rtk --version                      # confirm it's on PATH
   ```
2. **Wire RTK into GitHub Copilot for this repo — run this once:**
   ```powershell
   rtk init --copilot
   ```
   That writes two things into your repo:
   - `.github/copilot-instructions.md` — tells Copilot to route noisy commands through RTK, and
   - `.github/hooks/rtk-rewrite.json` — a **hook that auto-rewrites tool output to its compressed
     form** before it ever reaches the model.
   From now on Copilot compresses `git diff`, `grep`, `vitest`, `tsc`, etc. **automatically** — you
   never mention RTK in a prompt again. (Preview first with `rtk init --copilot --dry-run`.)

### Prove it
3. Feed the agent a raw diff in one turn and let the hook compress an equivalent one in another, and
   compare the **input tokens** Copilot reports (`/usage` or the agent debug log).
4. Discuss: dense source diffs compress **less** (~15–20%) while repetitive logs compress
   **70–95%** (you'll see that in Module 3). **The cheapest token is the one you never send** —
   prefer a diff over a full-file re-read.

> 🔧 Without the hook you can still call `rtk` by hand (`git diff | rtk diff -`, `rtk rg -i severity`,
> `rtk vitest run`, `rtk tsc --noEmit`) — but the whole point of `rtk init --copilot` is that you
> don't have to. (No RTK installed at all? The captured fixtures give the same numbers offline.)

**Checkpoint:** `rtk init --copilot` has created the hook; a subsequent noisy command shows fewer
input tokens in `/usage` **without** you prefixing `rtk`.

---

## Exercise 2.4 — Cache the stable context (AGENTS file)  ⏱ 5 min

**Goal:** stop re-sending the same house rules every turn.

1. Create/append `.github/copilot-instructions.md` with the **stable** facts an agent needs for
   this repo (see the template in [`prompts.md`](prompts.md#24)): monorepo layout, "optional
   fields only, no migrations", "surgical edits", "reply terse".
   > 💡 If you ran `rtk init --copilot` in 2.3, this file already exists with an RTK section —
   > just **append** your house rules below it; the two coexist.
2. Because this file is stable across turns, it becomes **cacheable** input (~90% cheaper on
   the ET model) instead of prose you retype into every prompt.

**Checkpoint:** your repo has a lean instructions file; future prompts can drop the boilerplate.

---

## Wrap (3 min)
Check `/usage` for your running session total. You extended the feature by **querying** instead of
reading, **compressing** tool output, and **caching** the house rules. Module 3 hardens it all with
tests — efficiently.
