# Module 9 — Output Control

**Goal:** cap generated output, because output tokens are expensive.

In this workshop, output is measured with the `--as-output` flag. The benchmark's Effective
Token model weights output at 4× input, so a small instruction that prevents rambling can be
the highest ROI rule in an instruction file.

## Measurement

### verbose-vs-capped
`fixtures/09-output-control/verbose-vs-capped.raw.txt` is a chatty model answer: preamble,
explanation, code, notes, and summary.

`verbose-vs-capped.opt.txt` is the same useful payload as code only, with no surrounding
prose.

The SentinelOps example is a tiny severity helper used by incident filtering.

## Run

```powershell
./run.ps1
```

```bash
./run.sh
```

## Measured takeaway

A persistent rule like "code only, no explanation unless asked" can cut generated tokens by
60-80% for implementation tasks. Because output carries 4× ET weight, this is often more
valuable than shaving a few words from the input prompt.
