---
title: "Token Optimization with GitHub Copilot"
css: |
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #e6edf3; background: #0d1117; }
  h1, h2 { color: #58a6ff; }
  h2 { page-break-before: always; border-bottom: 2px solid #30363d; padding-bottom: 6px; }
  h1 { font-size: 2.4em; }
  code, pre { background: #161b22; color: #79c0ff; border-radius: 6px; }
  pre { padding: 12px; font-size: 0.85em; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #30363d; padding: 6px 10px; }
  th { background: #161b22; color: #58a6ff; }
  blockquote { border-left: 4px solid #58a6ff; color: #8b949e; padding-left: 12px; }
  .big { font-size: 1.4em; color: #3fb950; }
pdf_options:
  format: A4
  landscape: true
  margin: 18mm 14mm
---

# Token Optimization with GitHub Copilot
### Cut token & cost burn on real repositories

A 2-hour hands-on workshop · ~80% live demos

**Demo app:** SentinelOps — a full-stack TypeScript incident dashboard
**Headline metric:** Effective Tokens (ET)

> Every saving in this deck is *measured live* by `bench/`, never hardcoded.

## The promise

By the end of two hours you will be able to:

- **Spot** the three token sinks in your own Copilot sessions
- **Measure** every change in tokens, Effective Tokens (ET), and dollars
- **Cut** tool-output tokens by **70–90%** (RTK) and agent output by **~2×** (Caveman)
- **Navigate** large codebases with a budgeted knowledge graph (Graphify)
- **Engineer context** with XML structure, memory files, MCP pruning, `/clear`, `/compact`

Everything runs on **Windows (primary)**, macOS, and Linux — with **offline fixtures** so no demo is a live gamble.

## The 3 token sinks

Where your tokens actually go (GitHub, MindStudio, Tetrate):

| Sink | Symptom | Fix in this workshop |
|---|---|---|
| **Bloated system prompts** | 40-tool MCP server = 10–15 KB schema *every turn* | Prune MCP tools, use `gh` CLI, memory files |
| **Raw tool outputs** | `git diff`, `npm ls`, `tsc`, test logs dumped verbatim | **RTK** compression (Module 2) |
| **Conversation history** | Re-reads, follow-ups, stale context | `/clear`, `/compact`, surgical edits, **Caveman** |

> Rule of thumb: the model re-reads the *entire* context on every single turn. History is not free.

## The money slide — GPT-5.5 vs Claude Opus 4.8

Effective Tokens: **ET = m × (1.0·I + 0.1·C + 4.0·O)**
where m = Haiku 0.25 · Sonnet 1.0 · **Opus 5.0**

Output is **4× more expensive** than input. Cached input is **~90% off**.

| Model | Input $/1M | Output $/1M | Notes |
|---|--:|--:|---|
| Claude Opus 4.8 | $5 | $25 | flat |
| GPT-5.5 | $5 → $10 | $30 → $45 | long-context surcharge ≥200k |
| Claude Sonnet 4.6 | $3 | $15 | route here when you can |
| Claude Haiku 4.5 | $1 | $5 | route here for grunt work |

Live: `node bench/cost.mjs --input 50000 --output 2000 --all`

## Why ET is the headline

- Raw token counts hide the **output tax** (4×) and the **model tier** (Opus 5×).
- ET normalises everything to one comparable number.
- **Same tokens, wrong model = 20× the ET** (Haiku 0.25 vs Opus 5.0).

> Model routing is often the single biggest win: do the thinking on Opus, do the typing on Sonnet/Haiku.

Live: `node bench/et.mjs --input 12000 --output 800 --model opus-4.8`

## The toolkit map

| Layer | Tool | What it compresses |
|---|---|---|
| **Tool output** | **RTK** (Rust Token Killer) | `git diff`, `vitest`, `grep`, `tsc` output −70–90% |
| **Codebase context** | **Graphify** | whole repo → budgeted graph query |
| **Agent output** | **Caveman Code** | 4-layer agent-side compression, read-dedup |
| **Measurement** | **bench/** | tokens · ET · $ · scoreboard |

All three tools have an **offline `fixtures/` fallback** — demos never depend on a live download.

## Module 1 — Identifying token waste

Run a real Copilot task on SentinelOps: *"add a severity filter to the incidents table."*

Capture a **baseline ET**, then expose the waste:

- a **500–1000 line** `git diff main..feature/severity-filter`
- verbose Vitest output (60+ tests)
- `npm ls` dependency dumps, file re-reads
- unused MCP tool schemas on every turn

`demos/01-identifying-waste/run.ps1`

## Module 2 — Optimizing tool output with RTK

A/B every command with `bench/compare.mjs`:

```
rtk git diff      vs  git diff
rtk vitest        vs  vitest
rtk grep / tsc    vs  raw
```

Then wire RTK into Copilot (`rtk init -g`) and re-run the baseline task.

**Expected & validated:** −70–90% on raw tool output.

`demos/02-rtk/run.ps1`

## Module 3 — Navigating large codebases with Graphify

Task: *"explain the incident-ingestion flow."*

- **Blind:** agent reads many files → huge input.
- **Graphify:** one budgeted query → `/graphify query "incident ingestion" --budget 1500`.

Measure the delta between "read everything" and "ask the graph."

`demos/03-graphify/run.ps1`

## Module 4 — Output compression with Caveman

Same task with `/caveman off` vs `/caveman ultra`.

- Capture **fresh output tokens** (remember: 4× ET weight!)
- Target **≈2× fewer** output tokens
- See the three sinks shrink in real time; read-dedup avoids re-reading files

`demos/04-caveman/run.ps1`

## Module 5 — Context engineering best practices

Measured rewrites:

- Bloated prose prompt → **XML** `<context>/<task>/<constraints>` + surgical context
- Add a **memory file**: `.github/copilot-instructions.md`
- **Prune MCP tools** / swap MCP data-fetch → `gh` CLI
- `/clear` every 15–20 msgs · `/compact` · capped thinking budgets · **model routing**

`demos/05-context-engineering/run.ps1`

## Module 6 — Advanced optimization challenge

Real task with a **pass/fail gate**:

> *Implement alert dedup and make the failing tests pass — while minimizing ET.*

Combine **all** techniques. `bench/report.mjs` produces the **live scoreboard** and declares a winner.

`demos/06-challenge/run.ps1` → `results/RESULTS.md`

## Context-hygiene checklist + Copilot-specific wins

**Hygiene:** `/clear` at 15–20 msgs · edit-don't-follow-up · surgical edits · outline-first · `/compact` · cap thinking budget · route models.

**Copilot-specific:**
- Prune unused MCP tools (40-tool server ≈ 10–15 KB schema/turn)
- Replace MCP data-fetch with `gh` CLI / pre-downloaded files
- Front-load stable content for **prompt caching** (~90% off cached input)
- Log state to **SQLite**, not the prompt

## Live scoreboard + references

Run it yourself:
```
node bench/report.mjs   # regenerates results/RESULTS.md
scripts/verify-all.ps1  # runs every demo, asserts a positive saving
```

**References:** GitHub Blog (token efficiency in agentic workflows) · MindStudio (token reduction) · Tetrate (token optimization) · Apex Hours (Claude efficiency manifesto).

> Measure. Optimize. Verify. Repeat.
