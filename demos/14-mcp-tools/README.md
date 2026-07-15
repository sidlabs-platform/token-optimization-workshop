# Module 14 — Clean Up Your Tools

**Goal:** reduce the MCP schema tax injected into every agent step.

Tool catalogs are context. If a session exposes every Slack, Jira, GitHub, database, staging,
analytics, and billing tool, the model re-reads those JSON schemas on each turn even when the task
only needs production incident data and GitHub files.

## Lever

Prune tools before the task starts:

- keep production DB read-only tools needed for incident debugging,
- keep GitHub file/search essentials,
- remove duplicate staging/dev database environments,
- remove Slack/Jira/admin tools unless the task needs them.

## Measurement

`188-vs-52-tools` compares two schema catalogs:

1. raw: broad MCP dump with many unrelated tools and environments.
2. optimized: task-scoped essentials.

## What to observe

The raw catalog includes write tools, admin tools, and duplicate environments.
The optimized catalog keeps production incident investigation capabilities.
This demo counts input tokens because schemas are injected before the model acts.

## Run

```powershell
./run.ps1
```

```bash
./run.sh
```

## Measured takeaway

Pruning **188 tools to 52** cuts the catalog by **72%**. At this scale that saves roughly **13k
tokens per task**, or about **650k tokens/day** at 50 tasks.

Every schema re-sends on every agent step.
