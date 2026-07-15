# DEMO-GUIDE.md — How to run the demos (step by step)

This guide shows you how to run each demo **live on GitHub Copilot**, prove that the
optimized prompt gives the **same-quality answer with fewer tokens**, and compare that
across models (**Opus 4.8 vs GPT-5.6 Sol**, **Sonnet 5 vs GPT-5.6 Terra**, **Haiku vs MAI**).

Everything runs through the GitHub Copilot CLI (`copilot -p`), which prints the **real
token usage and AI-credit cost** for every run — so the numbers are Copilot's own, not
estimates.

---

## 0. One-time setup (5 min)

```powershell
# from the repo root
./scripts/setup.ps1          # installs deps, checks tools
./scripts/install-tools.ps1  # installs RTK + ripgrep + Caveman (+Node22) + Graphify
# open a NEW terminal so PATH updates are picked up
copilot --version            # confirm the Copilot CLI is installed & logged in
```
macOS/Linux: use `scripts/setup.sh` and `scripts/install-tools.sh`.

> Not logged in? Run `copilot` once interactively, or `copilot login`.

---

## 1. The two commands you'll use

| Command | What it does |
|---|---|
| `./scripts/run-prompt.ps1 -Demo <id> -Compare` | Runs the **baseline** and **optimized** prompt for a demo on **one** model, prints both answers + token/credit delta. |
| `./scripts/run-matrix.ps1 -Demo <id> -Variant both` | Runs baseline+optimized across **all six models** and writes a full comparison table to `results/MODEL-MATRIX-<id>.md`. |

Demo ids: `01-identifying-waste`, `02-rtk`, `03-graphify`, `04-caveman`,
`05-context-engineering`, `06-challenge`.

Handy flags:
- `-DryRun` — don't call Copilot, just show the plan / prompt token counts (no cost).
- `-Variant baseline` or `-Variant optimized` — run only one side.
- `-Models claude-opus-4.8,gpt-5.6-sol` — restrict to specific models (saves credits).
- `-Model <id>` (run-prompt only) — pick the single model to compare on.

---

## 2. Run one demo, see "same answer, fewer tokens"

Example — Module 4 (Caveman):
```powershell
./scripts/run-prompt.ps1 -Demo 04-caveman -Compare
```
You'll see the **baseline** answer, the **optimized** answer, and a comparison:
```
input tokens saved : 51%
output tokens saved: 87%
AI credits saved   : 28%

QUALITY: compare the two answers above - they should convey the same facts:
  Both answers must convey: fingerprint from serviceId+title+severity, ...
```
Read both answers on screen — they say the same thing. That's the whole point:
**identical quality, far fewer tokens.**

---

## 3. Compare across models (the model matrix)

```powershell
./scripts/run-matrix.ps1 -Demo 04-caveman -Variant both
```
This runs the baseline and optimized prompt on all six models and writes
`results/MODEL-MATRIX-04-caveman.md`, which contains:

1. **Per-cell table** — input tokens, output tokens, AI credits, ET, and $ for every
   (variant × model).
2. **Model-pair comparison** — Opus vs Sol, Sonnet 5 vs Terra, Haiku vs MAI (input tokens).
3. **Optimization savings per model** — baseline → optimized, per model.
4. **The full answers** — so you can eyeball that quality is preserved.

### How to read it (goal of this workshop)
- "How many tokens do I save with Opus **without** optimization vs GPT-5.6 Sol?"
  → **baseline** rows for `claude-opus-4.8` vs `gpt-5.6-sol`.
- "…and **with** RTK / Caveman / Graphify?"
  → **optimized** rows for the same two models.
- "How much does the optimization save **on each model**?"
  → the *Optimization savings per model* table.

> Numbers vary run-to-run because a real agent explores differently each time — that's
> expected. Run it live; the **trend** (optimized ≪ baseline) is always the same.

---

## 4. A real captured example (Module 4, live on this repo)

From `results/MODEL-MATRIX-04-caveman.md` (Copilot's own reported input tokens):

| Model | Baseline in | Optimized in | Saved |
|---|--:|--:|--:|
| Claude Opus 4.8 | 116,000 | 57,100 | ~51% |
| GPT-5.6 Sol | 124,200 | 55,800 | ~55% |
| Claude Sonnet 5 | 117,200 | 57,100 | ~51% |
| GPT-5.6 Terra | 164,600 | 55,700 | ~66% |
| Claude Haiku 4.5 | 64,000 | 41,800 | ~35% |
| MAI-Code-1-Flash | 32,300 | 32,200 | ~0%* |

Output tokens drop even harder (e.g. Opus **1,900 → 251**), and because output carries the
4× ET weight, ET and $ fall the most there. *MAI already emits minimal context, so its
input barely moves — a useful teaching point about per-model overhead.

---

## 5. Per-demo prompt sheets

Each demo has a `PROMPTS.md` with the exact baseline/optimized prompts, the technique, and
the quality gate:

- [Module 1 — Identifying waste](demos/01-identifying-waste/PROMPTS.md) — scope the context
- [Module 2 — RTK](demos/02-rtk/PROMPTS.md) — compress tool output (`rtk vitest`/`tsc`)
- [Module 3 — Graphify](demos/03-graphify/PROMPTS.md) — budgeted graph answer vs reading files
- [Module 4 — Caveman](demos/04-caveman/PROMPTS.md) — read-once + terse output
- [Module 5 — Context engineering](demos/05-context-engineering/PROMPTS.md) — prose → XML
- [Module 6 — Challenge](demos/06-challenge/PROMPTS.md) — stack everything

The prompt text lives in `prompts/<id>/{baseline.txt,optimized.txt,meta.json}` — edit there
and re-run `node scripts/make-prompt-docs.mjs` to refresh the sheets.

---

## 6. Managing AI-credit cost

- A full 6-model × 2-variant matrix is 12 Copilot runs (~a few dozen AI credits).
- To keep it cheap during rehearsal: use `-DryRun`, or `-Models claude-opus-4.8,gpt-5.6-sol`,
  or `-Variant optimized`.
- The `--max-ai-credits` cap defaults to 100 per run.

---

## 7. Tokenizer-level demos (no Copilot, no cost)

The `demos/<id>/run.ps1` scripts measure the **payload** token savings offline with the
`bench/` harness (real captured RTK/Caveman output). Use these when you want a fast,
zero-cost, fully-reproducible before/after — and `run-prompt`/`run-matrix` when you want to
show it **live inside Copilot** with real credit numbers.

```powershell
./scripts/verify-all.ps1   # runs every offline demo and asserts a positive saving
```
