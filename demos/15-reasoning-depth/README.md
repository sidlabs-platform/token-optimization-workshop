# Module 15 — Reasoning-Depth Control

**Goal:** show why trivial SentinelOps tasks should not default to HIGH/MAX reasoning.

This module treats visible reasoning traces and final replies as **output** tokens. Output has the
4x effective-token weight in the workshop model, so verbose deliberation is expensive even when the
final answer is small.

## Scenario: high-vs-medium

`fixtures/15-reasoning-depth/answer.high.txt` is a deliberately over-thought answer to a simple
incident-dashboard question: whether `severity: "high"` should page the on-call service. It includes
long visible scratch work, repeated assumptions, and an oversized final answer.

`fixtures/15-reasoning-depth/answer.medium.txt` answers the same question with brief reasoning and a
short recommendation.

## Run
```powershell
./run.ps1
```
```bash
./run.sh
```

## What to notice

- Use HIGH/MAX only when the task genuinely needs deep search, architecture trade-offs, or hard
  debugging.
- Default to MEDIUM for routine TypeScript edits, endpoint filters, tests, and incident-dashboard
  explanations.
- Decompose one vague HIGH task into 3-5 MEDIUM steps: inspect, plan, edit, test, review.
- Ask for "think briefly" or "concise rationale" when the answer needs justification but not a long
  chain of thought.

## Expected result

The optimized answer should cut output tokens by roughly 50-80% while preserving the operational
answer: high severity pages on-call, critical escalates immediately, and low/medium stay ticket-only.
