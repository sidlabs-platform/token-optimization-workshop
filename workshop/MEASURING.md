# Measuring real token usage in GitHub Copilot

> **In this workshop you read token usage straight from GitHub Copilot itself** — the agent debug
> logs and the built-in `/usage` and `/context` commands report the *actual* input/output tokens and
> AI credits for each turn. You don't need any external script to see your savings; run the ❌ baseline
> and the ✅ optimized prompt and compare the numbers Copilot reports.

## The primary method — agent debug logs

Start the CLI with debug logging turned on and pointed at a folder you can read:

```powershell
# Windows / PowerShell
copilot --log-level all --log-dir .\copilot-logs

# macOS / Linux
copilot --log-level all --log-dir ./copilot-logs
```

- `--log-level` accepts `none · error · warning · info · debug · all`. Use **`debug`** or **`all`**
  to capture per-request model usage.
- `--log-dir` sets where the log is written (default: `~/.copilot/logs/`).

Then, for each exercise:

1. Run the **❌ baseline** prompt, let the turn finish.
2. Run the **✅ optimized** prompt (ideally in a **fresh session** — `/clear` or a new `copilot` run —
   so the counts aren't blended together).
3. Open the newest log file in your log dir and look for the **usage / token** entries emitted after
   each model request (input tokens, output tokens, and cached input). Compare baseline vs optimized.

```powershell
# tail the newest log and pull the usage lines
$log = Get-ChildItem .\copilot-logs\*.log | Sort-Object LastWriteTime | Select-Object -Last 1
Select-String -Path $log.FullName -Pattern 'token|usage|cached|credit' -CaseSensitive:$false | Select-Object -Last 20
```

```bash
log=$(ls -t ./copilot-logs/*.log | head -1)
grep -iE 'token|usage|cached|credit' "$log" | tail -20
```

Record the two numbers (baseline vs optimized) for the exercise. The **delta is your saving** — the
same thing every exercise's checkpoint asks for.

## Quick in-session views

You don't have to leave the session to see where your tokens are going:

- **`/usage`** — session usage metrics and statistics (tokens spent + AI credits this session).
- **`/context`** — how full the context window is, with a visualization. Watch this like a fuel gauge:
  run it before/after a `/compact`, or after a repo-crawl baseline, to *see* the context balloon and
  then shrink.

Say `/usage` right after the baseline turn and again right after the optimized turn; the difference
is the saving.

## Scriptable / non-interactive

For a clean, machine-readable before/after (handy if you want to log a whole batch):

```powershell
copilot -p "<your prompt>" --output-format json --allow-all-tools > run.jsonl
```

`--output-format json` emits JSONL (one object per message) including per-message usage. Do **not**
pass `-s/--silent` when you want the stats — silent mode prints only the final answer.

## What "a saving" looks like

| Exercise lever | Where to look | What drops |
|---|---|---|
| Context scoping / task breakdown / query-don't-read | `/context` + log input tokens | **input** tokens |
| Output control / reasoning depth | log output tokens | **output** tokens (worth 4× on ET) |
| `/compact`, one-session-per-model | `/usage` across turns | re-billed **input** / preserved cache |
| Model routing | `/usage` AI credits | **credits** (cheaper tier) |

## Offline fallback (no live Copilot access)

If you're running the workshop without Copilot access (or want a deterministic classroom number from
the captured fixtures), each module still ships a `measure.ps1` / `measure.sh` that tokenizes the
baseline vs optimized payloads with the same tokenizer. It's an **optional fallback** — the real
lesson is reading your own agent's debug logs / `/usage` on your own runs.
