# Module 4 — Advanced agent-loop optimization  ⏱ 50 min (5 exercises = 45 min + 5 min wrap; setup is pre-work)

> **The feature works and it's tested.** Now on-call leads want an **escalation policy**:
> an incident that was *acknowledged more than 15 minutes ago but still isn't resolved* should
> be flagged **`escalated`**, counted in the dashboard as **`escalatedCount`**, and filterable
> via `GET /api/incidents?escalated=true`. That's a **multi-file, multi-step** change — exactly
> the kind of task where *how you drive the agent* matters as much as *what you ask it to do*.
>
> This module is about the **agent loop itself**: breaking work down, keeping the context window
> small, choosing (or auto-selecting) the right model, and dialing reasoning to fit the task. Every
> technique is a real **GitHub Copilot CLI** command, and every one is **measured**.

**Techniques practised:** task breakdown (`/plan`) · context-window management (`/compact`,
`/context`, `/clear`) · model selection (`/model`) · auto model (`/model auto`, `/subagents`) ·
reasoning-depth control.

**You will touch (if you build the feature):** a new `shared/src/lib/escalation.ts`,
`shared/src/types/incident.ts` (`escalated?`), `shared/src/types/filters.ts`,
`shared/src/utils/query.ts`, `api/src/data/store.ts` (read-time escalation + `stats()`),
`api/src/routes/incidents.ts`, `shared/src/types/stats.ts` (`escalatedCount`), and the affected
tests. (The web filter chip is optional in-workshop.)

**Prompt pairs to paste into Copilot:** [`prompts.md`](prompts.md).
**Note:** Module 4 focuses on *how you drive the agent*. Building the escalation feature is
optional — the five measured levers work whether or not you finish the code. If you fall behind on
earlier modules, [`../solutions/apply.ps1`](../solutions) restores the ack/assign baseline so you
can keep going.

---

## Before you start (pre-work — do it during setup, not on the clock)
```powershell
# from the repo root (once for the whole workshop)
./scripts/setup.ps1
```
Open the repo in the **GitHub Copilot CLI with debug logging on** so every turn records its real
token usage:
```powershell
copilot --log-level all --log-dir .\copilot-logs
```
Two commands you'll lean on all module — and the debug log for the exact numbers:
- `/context` — shows how full your context window is (watch this like a fuel gauge).
- `/usage` — shows tokens/credits spent this session.
- **agent debug log** (`./copilot-logs`) — per-request input/output/cached tokens. Full how-to:
  [`../MEASURING.md`](../MEASURING.md).

You read each exercise's saving straight from these — no external script needed.

---

## Exercise 4.1 — Break the task down with `/plan`  ⏱ 11 min

**Goal:** turn one vague, expensive mega-request into a sequence of small, scoped steps — so the
agent never has to hold the whole repo in context at once.

**Why it saves tokens:** a single "do the whole escalation feature, explore everything first"
prompt drags ~30 files into context and keeps them there for every following turn. A plan lets each
step carry **only the 2–3 files it needs**. Same feature, a fraction of the context.

### Steps
1. **❌ Baseline — feel the blast radius.** Paste the mega-prompt from
   [`prompts.md`](prompts.md#41). Watch Copilot crawl the repo. Check `/context` — the window fills
   fast, and that context is re-billed on every subsequent turn.
2. **✅ Optimized — decompose first.** Run Copilot's `/plan` command (or paste the planning prompt
   in [`prompts.md`](prompts.md#41)) to produce a **5-step plan**:
   1. `shared/lib/escalation.ts` — pure `escalateIncident(incident, now, thresholdMs)`
   2. `types/filters.ts` + `utils/query.ts` — add the `escalated?` predicate
   3. `store.ts` + `routes/incidents.ts` — apply at read time + parse `?escalated=true`
   4. `types/stats.ts` + `store.stats()` — add `escalatedCount` (counts read-time-escalated incidents)
   5. web filter chip + affected tests (optional in-workshop)
3. **Execute step 1 only**, giving Copilot *only* the two files that step needs (its type + a pure
   style anchor). Run `/clear` (or start the next step in a fresh turn) before moving to step 2 so
   the previous step's context doesn't linger.
4. **Read the saving from Copilot:** run `/context` right after the ❌ mega-prompt (window balloons
   with ~30 files) and again after loading only step 1's ~2 files — or compare the input-token entries
   in your agent debug log. The per-turn context footprint is **~90% smaller**, and each later step
   carries its *own* small context so the window never balloons. Same feature, a fraction of the
   context *at any given moment*.

> 💡 **Quality angle:** decomposition doesn't just save tokens — scoped steps give the model a
> tighter target, so it wanders less and the diff is cleaner. Cheaper **and** better.

**Checkpoint:** you have a written 5-step plan, `escalation.ts` exists and typechecks, and you can
see the `task-breakdown` saving.

---

## Exercise 4.2 — Manage the context window with `/compact`  ⏱ 9 min

**Goal:** stop paying to re-send stale, unrelated history on every turn.

**Why it saves tokens:** by mid-session your context holds ack bikeshedding, a flaky-CI log, UI copy
debates, and dedup debugging — none of which the escalation *store* step needs. That history is
**input tokens re-billed every turn**. `/compact` replaces it with a short operational summary.

### Steps
1. Imagine you're 18 turns deep (the fixture `history-sprawl.raw.txt` is exactly that mixed
   transcript). Run `/context` — notice how much of the window is old, irrelevant work.
2. **Compact with focus.** Run:
   ```
   /compact focus="escalation store + route step: goal, decisions, files, next action"
   ```
   Copilot summarizes the conversation down to what the *current* step needs. (For a hard topic
   switch, `/clear` and start clean instead — one task = one session.)
3. Compare the sprawling history against a good compacted summary (see
   [`prompts.md`](prompts.md#42) for what a strong summary contains).
4. **Read the saving from Copilot:** run `/context` before and after `/compact` (the window drops),
   and compare `/usage` between the sprawling-history turn and the post-compact turn. The operational
   summary is **~80%+ smaller** than the carried-forward transcript while preserving everything needed
   to continue.

**Rules of thumb (put these on the wall):**
- One task = one session. `/clear` when you switch tasks.
- `/compact` **proactively around 70%** context usage — don't wait for the window to fill.
- A good summary is **operational**: goal · constraints · files touched · decisions · open risks.
  Not "we chatted about X."

**Checkpoint:** you can run `/compact` with a focus string and explain why the summary keeps the
*next action* but drops the CI-log noise.

---

## Exercise 4.3 — Route work to the right model with `/model`  ⏱ 9 min

**Goal:** stop paying frontier-model prices for work a cheaper model does just as well.

**Why it saves — twice over:** in the ET metric the **model tier multiplies everything**
(Haiku ×0.25, Sonnet ×1.0, Opus ×5.0). Pinning Opus for a field-name lookup is 20× the ET of doing
it on Haiku. And an all-Opus session tends to **re-explain the repo every turn**; a routed plan uses
crisp one-line handoffs instead.

> ⚠️ **Route across *sessions*, not mid-session.** Pick one model per session and keep it. Switching
> models inside a live session **throws away the prompt/KV cache** (cached input is ~90% off — the
> biggest single lever), so a mid-session swap usually costs more than the tier saves. The right
> pattern is: **one task/tier = one session** (set it with `/model` at the start, or `/model --repo`
> as the default), and open a *new* session when a different step genuinely needs a different tier —
> handing over a one-line state summary (that's the Module 4.1/4.2 muscle). Only switch in place when
> it's truly unavoidable.

### The routing rule (which session runs on which tier)
| Step | Good tier | Why |
|---|---|---|
| Look up a field name / grep for call sites | **Haiku** (small) | mechanical, no judgement |
| Design the escalation rule + edge cases | **Opus** (flagship) | ambiguous trade-offs |
| Implement `escalateIncident`, wire store/routes | **Sonnet** (mid) | routine TypeScript |
| Write/adjust tests | **Sonnet** (mid) | pattern-following |

### Steps
1. Set the model **once per session** with `/model` (e.g. start a lookup/impl session on
   `/model claude-sonnet-5`; do the ambiguous design work in a **separate** Opus session). Use
   `/model --repo` to pin a sensible default so you're not re-selecting every time. Don't hop tiers
   inside a live session — you'd lose the cache.
2. **❌ Baseline:** the all-Opus workflow that re-explains SentinelOps each turn
   ([`prompts.md`](prompts.md#43)).
   **✅ Optimized:** the routed plan with one-line handoffs (stable rules live in
   `.github/copilot-instructions.md`, not re-pasted — that's the Module 2 caching lever paying off).
3. **Read the saving from Copilot:** the routed workflow spends far fewer **input** tokens (no repeated
   repo re-explanation) — compare `/usage` for the all-Opus baseline session vs the routed sessions.
   Then feel the **tier multiplier** directly: the *same* task run on `/model claude-haiku-4.5` reports
   a fraction of the **AI credits** in `/usage` that `/model claude-opus-4.8` does. Same work, wildly
   different cost — that's the multiplier you control by routing (across sessions, per Exercise note above).

> 💡 **Let the expensive model think. Let the cheaper model type.** One model per session; route by
> starting the right session, not by switching mid-flight.

**Checkpoint:** you can state which tier each of the 5 plan steps should run on **and** why you'd run
the odd-one-out step in a separate session rather than switching in place.

---

## Exercise 4.4 — Let Copilot pick with `/model auto`  ⏱ 7 min

**Goal:** get most of the routing benefit **without** babysitting the model on every turn.

**Why it saves tokens:** manually narrating "use Opus now, switch to Haiku for the lookup, confirm
you switched, repeat this preamble each turn" is itself a pile of input tokens **and** a source of
error. `/model auto` lets Copilot pick a tier per step; `/subagents` lets you set the **default (and
per-agent) sub-agent model** once, so delegated work doesn't all default to the flagship.

### Steps
1. Enable it: `/model auto`. Optionally run `/subagents` to set a lean **default sub-agent model**
   (a mid or small tier) so sub-agents don't all run on the flagship. (`/subagents` configures
   models, not named routing categories — the tier-per-step routing comes from `/model auto`.)
2. **❌ Baseline vs ✅ Optimized** ([`prompts.md`](prompts.md#44)): the hand-micromanaged prompt vs
   the lean "auto is on, just do the work" prompt. Notice the baseline spends tokens *talking about*
   models instead of solving the task.
3. **Read the saving from Copilot:** compare `/usage` (or the input-token entries in your agent debug
   log) between the hand-micromanaged prompt and the lean "auto is on" prompt — dropping the per-turn
   model preamble cuts **~50%+** of that meta-prose, and you still get tier-appropriate execution.

**When to still go manual:** override with `/model` for a step you *know* needs deep reasoning
(the escalation edge-case design) or one you *know* is trivial (a rename). Auto is the default;
manual is the scalpel.

**Checkpoint:** `/model auto` is on, and you can explain when you'd override it.

---

## Exercise 4.5 — Right-size the thinking & reasoning  ⏱ 9 min

**Goal:** match reasoning depth to the task. Deep visible deliberation on a simple question is pure
waste — and, because reasoning traces are **output**, it carries the **4× ET weight**.

**The concrete question for this module:** *should acknowledged-but-unresolved incidents still count
in `openIncidentCount`, or be excluded once escalated?* A real design question — but it needs a
**paragraph**, not a dissertation.

### Steps
1. **❌ Baseline:** ask it with "think through every possible angle exhaustively before answering"
   ([`prompts.md`](prompts.md#45)). Watch the long visible scratch-work.
2. **✅ Optimized:** ask for **brief reasoning + a crisp recommendation** ("think briefly; give the
   rule and one-line justification"). Press **Ctrl+T** to *reveal* the reasoning display so you can
   see how much deliberation is happening. Note: Ctrl+T only toggles the **display** — you control
   the *depth* by how you phrase the ask and which model/effort you pick, not by Ctrl+T.
3. **Read the saving from Copilot:** compare the **output** tokens in `/usage` (or your agent debug
   log) for the exhaustive answer vs the right-sized one. The short answer cuts output **~75%**, and
   because output is worth **4×** on ET that's an outsized win — *with the same operational conclusion*.

**Depth policy (put it on the wall):**
- **Default MEDIUM** for routine edits, filters, tests, dashboard explanations.
- **HIGH/MAX only** for genuine architecture trade-offs, hard debugging, or deep search.
- Decompose one vague HIGH task into 3–5 MEDIUM steps (that's Exercise 4.1 again).
- When you need justification but not a chain of thought, ask for **"concise rationale."**

**Checkpoint:** you can explain why trimming ~270 output tokens is an outsized ET win (output is 4×) —
and that the short answer reached the *same* recommendation.

---

## Wrap (5 min)
Read your Module 4 session total from **`/usage`**. Five levers on the **agent loop itself**:
**break it down · compact the context · route the model · let auto pick · right-size the thinking.**
Stack these on top of Modules 1–3 (scope, structure, compress, cache) and you get **better answers for
a fraction of the tokens** — which is the whole point.
