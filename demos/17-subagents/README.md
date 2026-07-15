# Module 17 — Subagents: The Compression Boundary

**Goal:** demonstrate that discovery can happen outside the parent context.

When the coordinator reads every route, test, and shared type directly, all those file bodies land in
the parent transcript and are re-billed on later turns. A subagent can inspect the same files in its
own context and return a compact digest.

## Scenario: flat-vs-subagent

`fixtures/17-subagents/discovery.flat.txt` simulates parent-context discovery across about twenty
SentinelOps files: routes, models, tests, deduplication, severity types, and dashboard helpers.

`fixtures/17-subagents/discovery.digest.txt` is the worker's handoff summary: findings, exact files,
recommended edits, and review checkpoints.

## Run
```powershell
./run.ps1
```
```bash
./run.sh
```

## Handoff pattern

- Coordinator: defines task and acceptance criteria.
- Worker subagent: reads N files in isolation and returns a small digest.
- Coordinator: reasons over the digest and asks for one targeted edit.
- Reviewer subagent: checks the diff, not the whole repo.

## Expected result

The digest should be around an order of magnitude smaller than the flat discovery transcript while
retaining enough information to implement the incident filtering change safely.
