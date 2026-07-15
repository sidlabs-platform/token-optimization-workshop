# Module 7 — Prompt Compression

**Goal:** say the same thing with fewer input tokens.

Prompt compression has two workshop levers:

1. **Caveman speak:** replace polite, redundant prose with direct imperatives.
2. **Structured input:** replace narrative requirements with fields, bullets, and signatures.

Both keep the SentinelOps intent intact: update incident API behavior without changing
shared contracts or weakening auth.

## Measurements

### 1. caveman-speak
`fixtures/07-prompt-compression/caveman-speak.raw.txt` is a friendly, verbose request.
`caveman-speak.opt.txt` is the same work as terse commands.

This measures input savings only. The agent still receives the task, files, and acceptance
criteria, but does not receive social padding.

### 2. structured-input
`structured-input.raw.txt` explains an API change in natural language.
`structured-input.opt.txt` encodes the same meaning as a compact endpoint spec.

Structure helps tokenizers and humans: stable labels, short values, fewer filler words.

## Run

```powershell
./run.ps1
```

```bash
./run.sh
```

## Measured takeaway

Caveman-style prompts can remove most polite wrapper tokens. Structured specs are smaller
than prose while preserving intent. Expect roughly 75% savings for terse prompts and about
36% fewer tokens for structured input in this demo.
