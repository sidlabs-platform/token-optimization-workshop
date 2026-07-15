# Hands-On Workshop — Ship a feature for a fraction of the tokens ⏱ 3h 20m

A cohesive, **hands-on** workshop where you build, extend, test, and **operate the agent on** one
real feature in the SentinelOps app with **GitHub Copilot** — and apply a token-optimization
technique to every task, **measuring the impact** each time with the repo's `bench/` harness.

> This is the guided, build-it-yourself lab. It sits on top of the 20 measured demos in
> [`../demos`](../demos) and reuses the same app, tools, and measurement harness.

## The through-line
You own the **Incident Acknowledgement, On-Call Assignment & Escalation** feature. It grows across
four modules, so everything you learn compounds:

| Module | You do (tasks) | Optimization techniques | Measured |
|---|---|---|---|
| **1 — Build the lean way** (45m) | Add `POST /:id/ack`, ack fields, pure ack logic | Context scoping · XML prompts · output control (**Caveman**) | ~85–90% input, ~70% output |
| **2 — Query & navigate** (45m) | Add assignment + `acknowledged` filter | Query-don't-read (**Graphify**) · **RTK** compression (`rtk init --copilot`) · AGENTS caching · MCP hygiene | ~90% on queries, 15–95% on tool output |
| **3 — Test & harden** (40m) | Unit + API tests, debug, stats challenge | Scoped test-gen · compressed test/tsc output · model routing · session lifecycle | ~90%+ on logs, ET collapse via routing |
| **4 — Optimize the agent loop** (50m) | Add the **escalation policy** (multi-file) | Task breakdown (`/plan`) · context mgmt (`/compact`) · model selection (`/model`) · auto model (`/model auto`) · reasoning depth | ~54–91% across the five levers |

Each module folder has a step-by-step `README.md` and a `prompts.md` with **❌ baseline vs ✅
optimized** prompt pairs. You read the **real** token/credit delta straight from Copilot's **agent
debug logs** (and `/usage` · `/context`) — see **[`MEASURING.md`](MEASURING.md)**. An optional
`measure.ps1`/`measure.sh` fixture check is included as an offline fallback.

## Agenda (200 min)
| Time | Segment |
|---|---|
| 0:00–0:10 | Intro + setup + the ET metric (below) |
| 0:10–0:55 | [Module 1 — Build the feature the lean way](module-1-build/README.md) |
| 0:55–1:40 | [Module 2 — Query & navigate the large codebase](module-2-query/README.md) |
| 1:40–2:20 | [Module 3 — Test & harden efficiently](module-3-test/README.md) |
| 2:20–3:10 | [Module 4 — Advanced agent-loop optimization](module-4-advanced/README.md) |
| 3:10–3:20 | Wrap + `/usage` recap + Q&A |

## Setup (do once, ~5 min)
```powershell
# Windows / PowerShell — from the repo root
./scripts/setup.ps1                     # bench + app deps, verifies fixtures
node workshop/fixtures/generate.mjs     # build measured fixtures from the real app
```
```bash
# macOS / Linux
bash scripts/setup.sh
node workshop/fixtures/generate.mjs
```
### Power tools — install once, then they apply automatically
The three tools that do the heavy lifting are installed by one script and **wired in once** so you
never invoke them per-prompt (fixtures are used automatically if a tool is absent):
```powershell
./scripts/install-tools.ps1      # RTK + ripgrep + Graphify + Caveman  (bash scripts/install-tools.sh)
rtk init --copilot               # Module 2.3 — hook: Copilot auto-compresses tool output
graphify .                       # Module 2.1 — build the code graph once, then query it cheaply
# Caveman: Module 1.3 — /caveman ultra + automatic read-deduplication
```
Each tool is introduced, installed, and used inside the module noted above — no separate "tools"
detour. Full details: [`../SETUP.md`](../SETUP.md).

## The metric — Effective Tokens (ET)
```
ET = m × (1.0·I + 0.1·C + 4.0·O)
     m = Haiku 0.25 · Sonnet 1.0 · Opus 5.0     I=input  C=cached input  O=output
```
- **Output costs 4× input** → be terse & structured (Module 1.3, 3).
- **Cached input is ~90% off** → front-load stable context (Module 2.4).
- **Model tier multiplies everything** → route work to the cheapest capable model (Module 3.3).

## How to see your token usage — read it from Copilot itself
You don't need any external script to see your savings. GitHub Copilot reports the **actual** tokens
and AI credits for every turn:
- **Agent debug logs (preferred):** start the CLI with `copilot --log-level all --log-dir ./copilot-logs`,
  run your ❌ baseline then ✅ optimized prompt (in separate sessions), and read the per-request
  **input / output / cached** token counts from the newest log file.
- **`/usage`** — session tokens + AI credits, any time in-session.
- **`/context`** — how full the context window is (watch it shrink after `/compact`).

Full how-to (with the exact grep/`tail` commands): **[`MEASURING.md`](MEASURING.md)**. Read the
baseline number, read the optimized number, and the **delta is your saving**.

## Optional offline fallback (no live Copilot access)
If you're running without Copilot access, each module also ships a `measure.ps1` / `measure.sh` that
tokenizes the captured baseline vs optimized fixtures with the same tokenizer — a deterministic
classroom number. It's a **fallback**, not the main method.
```powershell
./workshop/scoreboard.ps1        # runs all four modules' fixture measures + prints the board
Get-Content results/RESULTS.md
```

## If you get stuck / fall behind
The complete, working feature lives in [`solutions/`](solutions/README.md). Apply it all at once:
```powershell
./workshop/solutions/apply.ps1   # copies files + patches existing ones
npm --prefix app test            # confirm green (26+ tests incl. the new ack/assign suites)
```
Reset to the starter state with `git checkout -- app/` and delete the added files (see
`solutions/README.md`).

## What "done" looks like
- `POST /api/incidents/:id/ack` and `/:id/assign` work (200/400/404/409 contract).
- `GET /api/incidents?acknowledged=true|false` filters correctly.
- Pure `acknowledgeIncident` / `assignIncident` with full-branch unit tests.
- `npm --prefix app run typecheck` and `npm --prefix app test` both green.
- Your rows on `results/RESULTS.md` show a positive saving for every task.
- **Module 4 (agent-loop):** you can drive Copilot with `/plan`, `/compact`, `/model` (+ `auto`),
  and right-sized reasoning, and each of the five `w-m4` scoreboard rows shows a positive saving.
  (Building the escalation policy itself is optional — the levers are the deliverable.)

## Files in this workshop
```
workshop/
  README.md            this guide
  MEASURING.md         how to read real token usage from Copilot (debug logs · /usage · /context)
  module-1-build/      README + prompts.md + measure.ps1/.sh
  module-2-query/      README + prompts.md + measure.ps1/.sh
  module-3-test/       README + prompts.md + measure.ps1/.sh
  module-4-advanced/   README + prompts.md + measure.ps1/.sh  (task breakdown, /compact, /model, auto, reasoning)
  solutions/           complete reference feature + apply.ps1/.sh + patch-notes.md
  fixtures/            generate.mjs + measured baseline/optimized payloads (m1/m2/m3/m4)
  scoreboard.ps1/.sh   run all measurements + print the board
```
