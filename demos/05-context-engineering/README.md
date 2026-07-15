# Module 5 — Context Engineering Best Practices

**Goal:** measured rewrites that cut context without any external tool.

## Run the measurements
```powershell
./run.ps1
```
```bash
./run.sh
```

Two scenarios:

### 1. Bloated prose prompt → XML-structured surgical prompt
`fixtures/05-context/prompt.prose.txt` → `prompt.xml.txt`
Use `<context>` / `<task>` / `<constraints>` and include only the surgical minimum.

### 2. 40-tool MCP schema (every turn) → on-demand `gh` CLI
`fixtures/05-context/mcp-schemas.raw.txt` (~75 KB of JSON schema) → `mcp-schemas.gh.txt`
A 40-tool MCP server adds ~10–15 KB of schema **per turn**. Prune unused tools, or
replace MCP data-fetch with the `gh` CLI / pre-downloaded files.

## Also demonstrate live in Copilot
- Add a memory file: `.github/copilot-instructions.md` (stable, cached content).
- `/clear` every 15–20 messages; `/compact` to roll up history.
- Edit-don't-follow-up; make surgical edits; outline-first.
- Cap thinking budgets; **route models** (Opus to plan, Sonnet/Haiku to type).
- Front-load stable content for prompt caching (~90% off cached input).
- Log state/logs to SQLite, not the prompt.

## Expected result
Both rewrites show large, measured token savings recorded to `results/RESULTS.md`.
