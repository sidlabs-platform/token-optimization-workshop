# Module 20 — Power User Guidance

**Goal:** teach advanced users to send the model signal, not terminal noise.

Raw CLI output is often the largest accidental context source. `npm ls`, test logs, and build
traces can include thousands of lines where only a few failures or package names matter.

## Lever

Power-user patterns:

- think in code and scripts before pasting output,
- prefer CLIs for one-shot facts when MCP schemas are too heavy,
- trim shell output with filters and summaries,
- collapse related tool calls,
- choose context style by model size.

## Measurement

`raw-shell-vs-trimmed` compares:

1. raw: full shell/test output pasted into context.
2. optimized: concise script summary with only failing facts.

## What to observe

The raw fixture includes package tree noise, passing tests, and coverage tables.
The optimized fixture keeps the failing assertion and likely next files.
This demo counts input savings because the shell text is pasted into context.
It rewards users who summarize terminal state before asking the model to reason.

## Run

```powershell
./run.ps1
```

```bash
./run.sh
```

## Measured takeaway

Advanced users save tokens by shaping inputs before the model sees them.

Think in code. Trim shell output. Collapse tool calls. Match context to the model.
