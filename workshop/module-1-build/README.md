# Module 1 — Build the feature the lean way  ⏱ 45 min

> **You are the new on-call tooling owner for SentinelOps.** Product wants engineers to be
> able to **acknowledge** an incident so everyone knows it's being handled. In this module you
> build the first slice of that feature **with GitHub Copilot** — and you measure how much
> cheaper the *lean* way is than the *naive* way.

**Techniques practised:** context scoping · XML-structured prompts · output control.
**You will touch (app is the starter):**
`shared/src/types/incident.ts`, a new `shared/src/lib/acknowledge.ts`,
`api/src/data/store.ts`, `api/src/routes/incidents.ts`.

**Reference solution:** [`../solutions/`](../solutions) — peek only if stuck.
**Prompt pairs to paste into Copilot:** [`prompts.md`](prompts.md).

---

## Before you start (2 min)
```powershell
# from the repo root, one time for the whole workshop
./scripts/setup.ps1                 # installs bench + app deps, verifies fixtures
node workshop/fixtures/generate.mjs # (re)build the measured fixtures from the real app
```
Open the repo in **GitHub Copilot CLI** (or your IDE Copilot). Keep a terminal handy for `bench/`.

---

## Exercise 1.1 — Feel the waste (baseline)  ⏱ 8 min

**Goal:** see what a careless "just add the endpoint" session drags into context.

1. In Copilot, run the **❌ baseline** prompt from [`prompts.md`](prompts.md#11) — the one that
   says *"explore the whole repository thoroughly, then add an acknowledge endpoint."*
2. Watch what it reads: the entire `shared` and `api` packages, all the tests, seed data.
3. Measure the size of that "read everything" context vs the surgical minimum:
   ```powershell
   ./workshop/module-1-build/measure.ps1
   ```
4. **Record the `context-scoping` line** it prints (raw tokens, ET, $). This is your baseline.

> 💡 The fixture `workshop/fixtures/m1/build-context.raw.txt` *is* a real dump of every file a
> naive session opens — that's why the number is honest.

**Checkpoint:** you should see **~85–90% fewer input tokens** for the scoped context.

---

## Exercise 1.2 — Build the API slice the lean way  ⏱ 22 min

**Goal:** implement `POST /api/incidents/:id/ack` using a **scoped, XML-structured** prompt.

### Step 1 — Scope + structure the prompt
Paste the **✅ optimized** prompt from [`prompts.md`](prompts.md#12). Notice it:
- names the **exact files** to read (no repo crawl),
- uses `<context> / <task> / <constraints>` so the model doesn't wander,
- forbids restating the plan (that's output-control, Exercise 1.3).

### Step 2 — What Copilot should produce
The change is **four edits**. Build them with Copilot, or hand-write and let Copilot review:

1. **`shared/src/types/incident.ts`** — add optional fields:
   ```ts
   acknowledgedBy?: string | null;
   acknowledgedAt?: string | null;
   assignee?: string | null;   // used again in Module 2
   ```
2. **`shared/src/lib/acknowledge.ts`** (new) — a **pure** function:
   `acknowledgeIncident(incident, engineer, now)` that
   - rejects an off-shift engineer (`engineer.active === false`),
   - rejects a `resolved` incident,
   - is **idempotent** (re-ack keeps the first acknowledger, only bumps `updatedAt`),
   - moves an `open` incident to `investigating` on first ack.
   You'll also need `shared/src/types/oncall.ts` for the `OnCallEngineer` type.
3. **`api/src/data/store.ts`** — add `acknowledge(id, engineer, now)` + a tiny engineer roster.
4. **`api/src/routes/incidents.ts`** — add `router.post('/:id/ack', …)` returning
   `200` (ok), `400` (missing engineerId), `404` (unknown engineer / incident),
   `409` (off-shift / resolved).

Remember to export the new modules from `shared/src/index.ts`
(see [`../solutions/patch-notes.md`](../solutions/patch-notes.md) for the exact 4 edits).

### Step 3 — Verify it runs
```powershell
npm --prefix app run typecheck
```
It should pass. (Full tests come in Module 3 — here we just keep the build green.)

**Checkpoint:** endpoint exists, typecheck passes, and you only ever asked Copilot to read
3–4 files, not 30.

---

## Exercise 1.3 — Control the output  ⏱ 10 min

**Goal:** output tokens cost **4× input** in the ET model — cut them without losing signal.

1. Ask Copilot to summarise the change it just made **twice**:
   - once with the **❌ verbose** style prompt, once with the **✅ terse** style prompt
     ([`prompts.md`](prompts.md#13)).
2. Measure the two summaries (this is the second line `measure.ps1` printed):
   the `output-control` scenario compares
   `agent-output.verbose.txt` vs `agent-output.terse.txt` with `--as-output` (4× weight).
3. Note how a **~70% output reduction** becomes an outsized ET win because of the 4× multiplier.

**Checkpoint:** you can explain *why* trimming 254 output tokens saved ~5,000 ET.

---

## Wrap (3 min)
```powershell
node bench/report.mjs      # your Module 1 rows on the scoreboard
```
You built a real API slice while asking the model to read ~1/8 of the code and emit ~1/3 of
the prose. **Same feature, a fraction of the tokens.** Module 2 extends this feature by
*navigating* the codebase efficiently.
