# Module 10 — Choose the Right Mode

**Goal:** avoid starting Agent mode before success is clear.

Agent mode is powerful, but it pays for exploration, tool calls, history, retries, and output.
For uncertain work, use a cheaper sequence: Ask or Research to learn, Plan to define success,
then Agent to make the smallest verified change.

## Measurement

### vague-agent-vs-phased
`fixtures/10-mode-selection/vague-agent-vs-phased.raw.txt` simulates a bloated single Agent
session: vague request, broad exploration, restarts, and repeated context.

`vague-agent-vs-phased.opt.txt` splits the same SentinelOps goal into Research, Plan, and
Implement phases with crisp success criteria.

This is an input/context measurement. The optimized version spends fewer tokens before the
agent edits code.

## Run

```powershell
./run.ps1
```

```bash
./run.sh
```

## Measured takeaway

Agent can cost 5-25× more than Ask for the same initial uncertainty. If you cannot state
success in one sentence, do not start Agent. Divide and conquer: research the unknowns, write
the plan, then run Agent on a bounded implementation task.
