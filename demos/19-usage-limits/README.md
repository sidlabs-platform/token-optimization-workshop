# Module 19 — Usage Limits and Overages

**Goal:** make token budgets explicit before an agent session turns into a surprise bill.

Ungoverned sessions often reload context, re-run broad searches, pin expensive models, and continue
after the budget is already blown. Limits do not make agents worse; they force better routing and
context hygiene.

## Lever

Set governance at the start:

- define a per-task overage cap,
- use Auto mode unless a step needs a specific model,
- summarize before reloading context,
- stop and report when the cap is close.

## Measurement

`ungoverned-vs-capped` compares two session policies:

1. raw: verbose log/prompt that ignores budget and reloads context repeatedly.
2. optimized: capped prompt/config that trims reloads and uses model routing.

## What to observe

The raw policy encourages repeated full-context reloads.
The optimized policy defines a cap, scope, reload rule, and stop rule.
This demo measures input saved before overage turns become a habit.
It also shows that governance can be a prompt/config choice, not a tooling rewrite.

## Run

```powershell
./run.ps1
```

```bash
./run.sh
```

## Measured takeaway

A healthy overage ratio is around **10-15%**. Uncontrolled teams drift past **30%+**.

Cap the bill before it caps you.
