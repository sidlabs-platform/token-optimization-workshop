# Module 1 — Build the feature the lean way  ⏱ 45 min

> **You are the new on-call tooling owner for SentinelOps.** Product wants engineers to be
> able to **acknowledge** an incident so everyone knows it's being handled. In this module you
> build the first slice of that feature **with GitHub Copilot** — and you measure how much
> cheaper the *lean* way is than the *naive* way.

**Techniques practised:** context scoping · XML-structured prompts · output control (+ **Caveman**
ultra mode & read-dedup, wired once).
**You will touch (app is the starter):**
`shared/src/types/incident.ts`, a new `shared/src/lib/acknowledge.ts`,
`api/src/data/store.ts`, `api/src/routes/incidents.ts`.

**Reference solution:** [`../solutions/`](../solutions) — peek only if stuck.
**Prompt pairs to paste into Copilot:** [`prompts.md`](prompts.md).

---

## Before you start (2 min)
```powershell
# from the repo root, one time for the whole workshop
./scripts/setup.ps1                 # installs app deps
```
Open the repo in the **GitHub Copilot CLI** with **debug logging on**, so every turn records its real
token usage:
```powershell
copilot --log-level all --log-dir .\copilot-logs
```
Throughout the module you'll read your savings from these logs and from `/usage` · `/context` — see
[`../MEASURING.md`](../MEASURING.md). (No external script required.)

---

## Exercise 1.1 — Feel the waste (baseline)  ⏱ 8 min

**Goal:** see what a careless "just add the endpoint" session drags into context.

1. In Copilot, run the **❌ baseline** prompt from [`prompts.md`](prompts.md#11) — the one that
   says *"explore the whole repository thoroughly, then add an acknowledge endpoint."*
2. Watch what it reads: the entire `shared` and `api` packages, all the tests, seed data.
3. Read how big that "read everything" context was vs the surgical minimum **from Copilot itself**:
   run `/context` (watch the window balloon on the baseline) and `/usage` after the turn, or read the
   input-token count from your agent debug log (start Copilot with `--log-level all --log-dir
   ./copilot-logs`). See [`../MEASURING.md`](../MEASURING.md).
4. **Record the baseline input tokens** Copilot reports. This is your baseline; the scoped prompt in
   1.2 is what you compare it against.

> 💡 No script needed — the number comes from your own run. (Offline fallback: the fixture
> `workshop/fixtures/m1/build-context.raw.txt` is a real dump of every file a naive session opens, and
> `measure.ps1` tokenizes it for a deterministic classroom number.)

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

## Exercise 1.3 — Control the output (and make it automatic with Caveman)  ⏱ 10 min

**Goal:** output tokens cost **4× input** in the ET model — cut them without losing signal, and make
that the *default* instead of nagging "be terse" every turn.

1. Ask Copilot to summarise the change it just made **twice**:
   - once with the **❌ verbose** style prompt, once with the **✅ terse** style prompt
     ([`prompts.md`](prompts.md#13)).
2. Compare the two summaries **from Copilot's reported output tokens** — read them from `/usage`
   (or the output-token entries in your agent debug log) right after each summary. The verbose vs
   terse gap is almost entirely **output** tokens.
3. Note how a **~70% output reduction** becomes an outsized ET win because output is worth **4×**.

### Make terse the default — Caveman (the effective way)
Rather than repeating "be terse" every prompt, install **Caveman** and let it enforce dense output and
skip re-reads automatically for output-heavy sub-tasks:
```powershell
./scripts/install-tools.ps1   # installs Caveman under Node 22 (its native dep needs an LTS build)
caveman --version
```
- Turn on **ultra** output mode once — `/caveman ultra` (vs `/caveman off`) — and every reply stays
  information-dense for the rest of the session; no per-prompt "be terse".
- Its **read-deduplication cache** returns a file's full content once, then a tiny stub on repeats, so
  an agent that re-opens the same file 3× stops paying 3× — **automatically**, nothing to type.
- Use Caveman for the output-heavy passes (bulk boilerplate, repeated-read refactors); measured
  ≈**85%** fewer output ET and ≈**61%** on read-dedup.

**Checkpoint:** you can explain *why* trimming ~250 output tokens saved multiples of that in Effective
Tokens — and how `/caveman ultra` + read-dedup make that the default without per-prompt effort.
(Offline fallback: `measure.ps1` compares `agent-output.verbose.txt` vs `agent-output.terse.txt`
with `--as-output`.)

---

## Wrap (3 min)
Read your session totals from **`/usage`** (tokens + AI credits). You built a real API slice while
asking the model to read ~1/8 of the code and emit ~1/3 of the prose. **Same feature, a fraction of
the tokens.** Module 2 extends this feature by *navigating* the codebase efficiently.
