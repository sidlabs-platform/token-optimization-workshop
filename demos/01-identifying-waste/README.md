# Module 1 — Identifying Token Waste

**Goal:** run a real Copilot task on SentinelOps and expose where the tokens go.

## The task
> "Add a severity filter to the incidents table."

A one-line change — but a naive session drags in enormous context.

## Run the measurement (offline-safe)
```powershell
# Windows
./run.ps1
```
```bash
# macOS / Linux
./run.sh
```

This compares the **baseline context** (what a careless session pulls in) against the
**lean context** (the surgical minimum) and prints measured tokens, ET, and $.

## What to show live in Copilot
1. Open the repo in Copilot and ask it to do the task *without* guidance.
2. Watch it: read the whole `git diff main..feature/severity-filter` (500–1000 lines),
   dump the verbose Vitest output (60+ tests), run `npm ls`, and re-read files.
3. Note the baseline ET from `results/RESULTS.md`.

## The three sinks it reveals
| Sink | Evidence in this demo |
|---|---|
| Bloated system prompt | unused MCP tool schemas on every turn (see Module 5) |
| Raw tool output | 900-line diff + full test log + `npm ls` |
| Conversation history | file re-reads, follow-up churn |

## Expected result
The lean context is dramatically smaller — a clearly positive saving recorded to
`bench/results.csv`. Modules 2–5 then attack each sink with a real tool.
