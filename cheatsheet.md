# cheatsheet.md — Token Optimization one-pager

## The 3 token sinks
1. **Bloated system prompts** — 40-tool MCP server ≈ 10–15 KB schema *every turn*.
2. **Raw tool outputs** — `git diff`, `npm ls`, `tsc`, test logs dumped verbatim.
3. **Conversation history** — re-reads, follow-ups, stale context (re-sent every turn).

## Effective Tokens (the metric that matters)
```
ET = m × (1.0·I + 0.1·C + 4.0·O)
m: Haiku 0.25 · Sonnet 1.0 · Opus 5.0
```
- **Output costs 4×** input → be terse, structured.
- **Cached input ~90% off** → front-load stable content.
- **Model tier multiplies everything** → route work to the cheapest capable model.

## Quick wins (highest leverage first)
- [ ] **Route models**: Opus to plan, Sonnet/Haiku to type.
- [ ] **Compress tool output** (RTK): `rtk git diff`, `rtk vitest`, `rtk tsc`, `rtk grep`.
- [ ] **Cut agent output** (Caveman `ultra`): terse, no restating (4× ET weight!).
- [ ] **Query, don't read** (Graphify): `graphify query "..." --budget 1500`.
- [ ] **Prune MCP tools**; replace data-fetch with `gh` CLI / pre-downloaded files.
- [ ] **Memory file**: `.github/copilot-instructions.md` (stable → cacheable).

## Context hygiene
- `/clear` every **15–20 messages**; `/compact` to roll up history.
- **Edit, don't follow-up** — revise the prior message instead of appending.
- **Surgical edits** — change the minimal span, not whole files.
- **Outline-first** — agree the plan before generating code.
- **Cap thinking budgets** — don't pay for unbounded reasoning.
- Log state/logs to **SQLite**, not the prompt.

## Prompt structure (XML)
```xml
<context>only the surgical minimum</context>
<task>one clear objective</task>
<constraints>bullet rules; what NOT to touch</constraints>
```

## Measure everything
```
node bench/token-count.mjs --file <path>
node bench/et.mjs   --input I --output O --model opus-4.8
node bench/cost.mjs --input I --output O --all
node bench/compare.mjs --raw-file A --opt-file B --demo d --scenario s
node bench/report.mjs        # -> results/RESULTS.md
```

## Rules of thumb
- Verbose logs (tests, tsc, npm ls, `grep -C`) compress **70–95%** — measure to confirm.
- Dense source diffs compress less — prefer a **diff over full-file reads**.
- The cheapest token is the one you never send.
