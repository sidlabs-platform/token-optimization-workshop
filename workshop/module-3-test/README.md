# Module 3 — Test & harden efficiently  ⏱ 40 min

> The feature is built. Now make it **trustworthy** — with tests generated and debugged the
> token-cheap way. You'll practise TDD-style test generation, **compressing test/typecheck
> output** before feeding it back to the agent, and **routing work to the cheapest capable
> model**. Then a final scoreboard challenge.

**Techniques practised:** scoped test generation · RTK-compressed test/tsc output ·
model routing · session lifecycle (`/clear`, `/compact`).
**You will create:** `shared/src/lib/acknowledge.test.ts`, `shared/src/lib/assignment.test.ts`,
`api/src/routes/incidents.ack.test.ts`.

**Prompts:** [`prompts.md`](prompts.md).

---

## Exercise 3.1 — Generate unit tests for the pure logic  ⏱ 15 min

**Goal:** high-coverage tests for `acknowledgeIncident` / `assignIncident` — **scoped**, not
"read the whole repo and test everything."

1. Paste the scoped test-gen prompt ([`prompts.md`](prompts.md#31)). It names the **one file**
   under test and the exact behaviours to cover (happy path, off-shift, resolved, idempotency,
   no-mutation), and points at an existing test (`healthScore.test.ts`) as the **style anchor**
   so the model doesn't invent a new convention (cheaper + consistent).
2. Create `acknowledge.test.ts` and `assignment.test.ts` next to the source files.
3. Run just those tests:
   ```powershell
   npm --prefix app test
   ```
   (Vitest runs across the workspaces; your new files are picked up automatically.)

**Coverage target:** every branch of both pure functions — off-shift, resolved, idempotent
re-ack, status transition, no-mutation. (See the reference tests for the full matrix.)

**Checkpoint:** the shared package tests pass, including your new files.

---

## Exercise 3.2 — Add API endpoint tests + debug the cheap way  ⏱ 15 min

**Goal:** integration tests for `/ack` and `/assign`, and a **token-cheap debugging loop**.

1. Create `api/src/routes/incidents.ack.test.ts` using the prompt in
   [`prompts.md`](prompts.md#32). Cover: 200 ack + transition, 400 missing engineerId,
   404 unknown engineer, 409 off-shift, 404 missing incident, assign happy path,
   and the `acknowledged=true|false` filter.
2. Run the tests. If one fails, **do not paste the whole verbose log** into Copilot.
   Compress it first and feed only the summary:
   ```powershell
   npm --prefix app test 2>&1 | Tee-Object -Variable log | Out-Null
   # then hand the agent only the failing lines, e.g.:
   $log | Select-String -Pattern "FAIL|Error|expected|Expected|✗" | Select-Object -First 20
   ```
3. Measure how much that compression saves:
   ```powershell
   ./workshop/module-3-test/measure.ps1
   ```
   The `test-output` line shows a **~90%+** cut on verbose Vitest logs; `tsc-output` shows the
   same for typecheck errors. Repetitive logs are the easiest tokens to delete.

> 🔧 **Real tool:** `rtk vitest` / `rtk tsc` emit the compressed form directly.

**Checkpoint:** all API tests green; you debugged from a 20-line summary, not a 700-line dump.

---

## Exercise 3.3 — Route the model + manage the session  ⏱ 7 min

**Goal:** stop paying frontier prices for mechanical work.

1. Re-run one measure with a cheaper model to see the ET multiplier collapse:
   ```powershell
   $env:WS_MODEL='haiku-4.5'; ./workshop/module-3-test/measure.ps1
   ```
   Compare the ET column to `opus-4.8`. **Same tokens, a fraction of the ET.**
2. **Routing rule of thumb:** Opus/GPT-5.x to *plan* the feature; Sonnet to *write* it;
   Haiku/MAI to *generate boilerplate tests and compress logs*.
3. **Session hygiene:** after this long build, `/clear` (or `/compact`) the conversation before
   the next task so you stop re-sending 3 modules of history every turn.

**Checkpoint:** you can state which model you'd use for each of: planning, coding, test-gen.

---

## Exercise 3.4 — Final challenge: minimize ET  ⏱ (stretch)

Stack everything to complete one last task — **add an `acknowledgedRate` to `GET /api/stats`**
(fraction of active incidents that are acknowledged) — for the **lowest ET** you can:

- Query for the 2 files to touch (don't read the repo).
- Scoped XML prompt, cheapest capable model, terse output.
- Compress any test/tsc output before feeding it back.
- Record it and compare on the scoreboard:
```powershell
./workshop/scoreboard.ps1
Get-Content results/RESULTS.md
```

**Winner:** lowest total ET for a correct, tested change. 🏆

---

## Wrap (3 min)
You shipped a **fully tested** acknowledge/assign/filter feature. Across three modules you
consistently spent a **fraction** of the tokens a naive session would — and you *measured*
every bit of it.
