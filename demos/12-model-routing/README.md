# Module 12 — Model Routing

**Goal:** stop paying frontier-model prices for work that cheaper models can do.

SentinelOps tasks are not all equal. A rollout plan for incident deduplication needs deep
reasoning; checking exact field names in `app/packages/api` does not. This demo compares one
workflow that pins Opus for every turn with a routed workflow that uses each model where it fits.

## Lever

Choose the right model per step:

- **Opus:** architecture, risk analysis, ambiguous trade-offs.
- **Sonnet:** TypeScript implementation, tests, refactors.
- **Mini/fast model:** lookups, grep summaries, mechanical handoffs.

## Measurement

`single-vs-mixed` compares prompt-set input tokens:

1. raw: every turn re-explains SentinelOps and pins one frontier model.
2. optimized: concise routing plan with short handoffs between models.

The optimized fixture is shorter because it removes repeated context and assigns work by cost.

## What to observe

The raw file spends tokens on repeated policy and domain reminders.
The optimized file keeps only routing rules and handoff shape.
No generated output savings are counted here; this is an input/context demo.

## Run

```powershell
./run.ps1
```

```bash
./run.sh
```

## Measured takeaway

All-Opus costs about **50 units** for this workflow. Mixed routing lands around **22.8 units**,
roughly **24% lower than all-Sonnet** for the same outcome.

Let the expensive model think. Let the cheaper model type.
