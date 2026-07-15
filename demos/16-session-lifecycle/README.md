# Module 16 — Session Lifecycle & Compaction

**Goal:** show why a long mixed-purpose chat becomes expensive input context.

The raw fixture simulates a 40-turn session that keeps re-sending unrelated history: severity filter
planning, dashboard UI copy, CI cleanup, and incident deduplication debugging. By the thirtieth turn,
that old history can dominate the bill.

## Scenario: sprawl-vs-compact

`fixtures/16-session-lifecycle/history.sprawl.txt` is the parent context before a new SentinelOps API
edit. It contains many turns from four unrelated tasks.

`fixtures/16-session-lifecycle/history.compact.txt` is what the next request should carry after
`/clear` plus `/compact`: only the current task summary, decisions, files, and next action.

## Run
```powershell
./run.ps1
```
```bash
./run.sh
```

## Practice

- One task = one session.
- Use `/clear` when switching from API filters to UI polish, CI triage, or docs.
- Use `/compact` proactively around 70% of the context window.
- Keep the compacted summary operational: goal, constraints, files touched, decisions, open risks.

## Expected result

The compact summary should be dramatically smaller than the sprawling transcript while preserving the
state needed to continue the minSeverity filter task.
