# Module 8 — Choose the Right Language

**Goal:** keep prompts in concise English when the task and codebase are English.

Tokenizers usually represent common English programming words cheaply. Translating a
prompt, or repeating it in several languages, often adds tokens without adding meaning.

This module does not say English is better for thinking or collaboration. It says that for
an English TypeScript repo, concise English is usually the cheapest prompt encoding.

## Measurement

### english-vs-verbose
`fixtures/08-language-choice/english-vs-verbose.raw.txt` repeats the same SentinelOps task
in English plus translated and paraphrased restatements.

`english-vs-verbose.opt.txt` gives the same instruction once in concise English.

The task is unchanged: inspect the incident ingestion path, keep the deduplication key
stable, and propose a safe fix.

## Run

```powershell
./run.ps1
```

```bash
./run.sh
```

## Measured takeaway

Do not translate prompts to save tokens. If the repository, identifiers, docs, and tests are
English, concise English usually wins. Remove redundant restatements first; ask for another
language only when the human reader needs it.
