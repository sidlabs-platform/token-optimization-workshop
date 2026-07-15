# Token Optimization with GitHub Copilot — Hands-On Workshop

> 👋 **Participant edition.** This repo has everything you need to run the workshop yourself:
> the SentinelOps app, the measurement harness, and step-by-step modules. **Start here:**
> [`SETUP.md`](SETUP.md) → then the guided lab in [`workshop/README.md`](workshop/README.md).
> New to the CLI? Skim [`cheatsheet.md`](cheatsheet.md) first.

A **2-hour, ~80%-live-demo** workshop that teaches engineers how to cut token and cost burn
when working with GitHub Copilot on **real** repositories. Everything is **measured and
reproducible** — no placeholders, no hello-world. Runs on **Windows (primary)**, macOS, and
Linux, with **offline fixtures** so no demo is a live gamble.

> Demo app: **SentinelOps**, a production-grade full-stack TypeScript incident/service-health
> dashboard (React + Vite + Tailwind web, Node/Express + TS API, shared package, 400+ tests).

## Headline metric — Effective Tokens (ET)

```
ET = m × (1.0·I + 0.1·C + 4.0·O)
     m = Haiku 0.25 · Sonnet 1.0 · Opus 5.0
     I = input   C = cached input (~90% off)   O = output (4× weight)
```

Output is 4× input; the model tier multiplies everything. ET turns "tokens" into one
comparable number, and `bench/cost.mjs` converts any delta to dollars from `models.json`.

---

## Quick start (Windows / PowerShell)

```powershell
git clone <this-repo> token-optimization-workshop
cd token-optimization-workshop

# 1. Setup (installs bench + app deps, checks optional tools, verifies fixtures)
./scripts/setup.ps1

# 2. Verify everything works offline (runs every demo, asserts a positive saving)
./scripts/verify-all.ps1

# 3. See the scoreboard
Get-Content results/RESULTS.md
```

### macOS / Linux

```bash
git clone <this-repo> token-optimization-workshop
cd token-optimization-workshop
bash scripts/setup.sh
bash scripts/verify-all.sh
cat results/RESULTS.md
```

`verify-all` runs offline out of the box. Add `-Full` (PowerShell) / `--full` (bash) to also
run the app's install/typecheck/lint/test/build and export the deck to PDF.

## Run the demos LIVE on Copilot (same answer, fewer tokens) — and compare models

Each demo has a **validated baseline vs optimized prompt pair**. Run them through the GitHub
Copilot CLI, which reports **real token usage and AI-credit cost**, to prove the optimized
prompt gives the same-quality answer for far fewer tokens — across **Opus 4.8 vs GPT-5.6 Sol**,
**Sonnet 5 vs GPT-5.6 Terra**, and **Haiku vs MAI**.

```powershell
./scripts/install-tools.ps1                              # RTK + ripgrep + Caveman + Graphify
./scripts/run-prompt.ps1 -Demo 04-caveman -Compare       # baseline vs optimized, one model
./scripts/run-matrix.ps1 -Demo 04-caveman -Variant both  # all six models -> results/MODEL-MATRIX-*.md
```
Full walkthrough: **[DEMO-GUIDE.md](DEMO-GUIDE.md)**. Per-demo prompt sheets: each
`demos/<id>/PROMPTS.md`. Measured example (real Copilot numbers): Graphify optimized cut
**input tokens ~90%** and **AI credits ~81%** for an equivalent answer.

---

## 2-hour agenda (≈120 min of modules + intro/wrap)

| # | Module | Time | What you measure |
|---|---|---|---|
| 0 | Intro + the money slide (deck) | 10 min | GPT-5.5 vs Opus 4.8, ET, $ |
| 1 | [Identifying token waste](demos/01-identifying-waste) | 15 min | baseline ET; the 3 sinks |
| 2 | [Tool output with RTK](demos/02-rtk) | 20 min | −70–95% on verbose tool output |
| 3 | [Large codebases with Graphify](demos/03-graphify) | 20 min | read-everything vs budgeted graph |
| 4 | [Output compression with Caveman](demos/04-caveman) | 20 min | ≈2× fewer output tokens (4× ET) |
| 5 | [Context engineering](demos/05-context-engineering) | 20 min | prose→XML, MCP→gh, caching |
| 6 | [Advanced challenge + scoreboard](demos/06-challenge) | 20 min | stack everything, minimize ET |
| — | Wrap + references | 5 min | `results/RESULTS.md` |

Each module has a `README.md` runbook and a `run.ps1` / `run.sh` that prints a **measured
before/after** with expected on-screen numbers and offline fallbacks.

---

## The 11 playbook levers → 20 measured demos

The six core modules above are the guided 2-hour path. On top of them, every lever from the
[token-optimization playbook](https://ashy-dune-0b4215a0f.7.azurestaticapps.net/detailed/index.html#/home)
now has a dedicated, runnable demo that proves the saving with `bench/compare.mjs`:

| # | Lever | Demo module(s) |
|---|---|---|
| 1 | Prompt compression | `demos/07-prompt-compression`, `demos/04-caveman` |
| 2 | Choose the right language | `demos/08-language-choice` |
| 3 | Manage your context | `demos/05-context-engineering`, `demos/16-session-lifecycle`, `demos/03-graphify` |
| 4 | Output control | `demos/09-output-control` |
| 5 | Choose the right mode | `demos/10-mode-selection` |
| 6 | Custom agents · skills · sub-agents | `demos/11-custom-agents-skills`, `demos/17-subagents` |
| 7 | Choose the right model | `demos/12-model-routing` |
| 8 | Manage your AGENTS file | `demos/13-agents-file` |
| 9 | Clean up your tools (MCP) | `demos/14-mcp-tools`, `demos/02-rtk` |
| 10 | Usage limits & overages | `demos/19-usage-limits` |
| 11 | Power user guidance | `demos/20-power-user`, `demos/15-reasoning-depth`, `demos/18-instruction-caching` |

Run any of them the same way: `./demos/<id>/run.ps1` (or `run.sh`). `scripts/verify-all.ps1`
executes **all 20** and asserts each still produces a positive, measured saving.

## Slide deck + talk script

The `deck/` folder builds a full **PowerPoint** covering all current and new demos, with the
**talk script** embedded as per-slide speaker notes (and exported to `deck/TALK-SCRIPT.md`):

```powershell
cd deck
npm install            # pptxgenjs
npm run build:all      # slides.pdf + token-optimization.pptx + TALK-SCRIPT.md
```

- `deck/token-optimization.pptx` — 29 slides: intro, the money slide, the 11-lever map, one
  slide per demo module, and a wrap. Speaker notes on every slide are the talk script.
- `deck/TALK-SCRIPT.md` — the same narration as a readable markdown script.
- `deck/deck-content.mjs` — single source of truth; edit once, rebuild both.


---

## What's in the box

```
README.md            this file — agenda + commands
SETUP.md             detailed setup incl. optional tools + offline fallbacks
DEMO-GUIDE.md        step-by-step: run demos live on Copilot + cross-model comparison
cheatsheet.md        one-page token-optimization cheat sheet
models.json          editable pricing + ET multipliers ($ calculator) + model pairs
bench/               measurement harness (tokens · ET · $ · scoreboard)
app/                 SentinelOps monorepo (the realistic context)
prompts/             validated baseline/optimized prompt pairs per demo
fixtures/            offline raw+optimized payloads (generate.mjs regenerates from app)
demos/               six modules, each with README + PROMPTS.md + run.ps1/run.sh
deck/                slides (reveal.js/PDF) + PowerPoint (.pptx) + talk script
scripts/             setup, install-tools, verify-all, run-prompt, run-matrix, clone-sandbox
results/             RESULTS.md scoreboard + MODEL-MATRIX-*.md (generated)
sandbox/             optional shallow-cloned OSS repo for Graphify
```

## The measurement harness (`bench/`)

```powershell
node bench/token-count.mjs --file app/packages/api/src/routes/incidents.ts
node bench/et.mjs   --input 12000 --output 800 --model opus-4.8
node bench/cost.mjs --input 50000 --output 2000 --all      # compare all models
node bench/compare.mjs --raw-file A --opt-file B --demo d --scenario s   # A/B + record
node bench/report.mjs                                       # regenerate RESULTS.md
```

- Real tokenizer via `gpt-tokenizer` (o200k_base); falls back to chars/4 if unavailable.
- Every `compare` appends to `bench/results.csv` and `bench/token-usage.jsonl`.
- `compare.mjs` **exits non-zero if a scenario fails to save tokens** — used by `verify-all`.

## The three tools (all with offline fallbacks)

| Tool | Install | Demo |
|---|---|---|
| **RTK** (Rust Token Killer) | binary + `rg` on PATH · `rtk init -g` | Module 2 |
| **Graphify** | `pip install graphifyy` | Module 3 |
| **Caveman Code** | `npm i -g @juliusbrussee/caveman-code` (Node ≤ 22) | Module 4 |

**One-command install:** `./scripts/install-tools.ps1` (Windows) / `bash scripts/install-tools.sh`
(mac/Linux) installs RTK + ripgrep + Caveman (+ a Node 22 runtime) + Graphify.

If a tool isn't installed, its demo automatically uses pre-captured `fixtures/` — and those
fixtures were themselves **captured from the real tools**, so the numbers are authentic
either way. See [`SETUP.md`](SETUP.md).

## Reproducibility

Fixtures are generated from the **real** SentinelOps app:

```powershell
node fixtures/generate.mjs   # re-captures git diff, vitest, grep, tsc, etc. and re-compresses
```

Research percentages (MindStudio, Tetrate, Apex Hours, GitHub Blog) are **expectations to
validate** — the numbers in `results/RESULTS.md` are what this repo actually measured.

## References

- GitHub Blog — Improving token efficiency in agentic workflows
- MindStudio — Token reduction strategies for AI agents
- Tetrate — Token optimization
- Apex Hours — The Token Optimizer's Manifesto

## License
MIT
