# Module 13 — Manage Your AGENTS File

**Goal:** keep agent instructions useful without turning them into a repo encyclopedia.

An `AGENTS.md` file is injected into many agent sessions. If it repeats facts the agent can infer
from the tree, every turn pays for stale prose: project description, language guesses, obvious test
commands, and restated style rules.

## Lever

Keep only landmines:

- commands that are surprising (`uv`, not `pip`),
- access constraints (deploy requires VPN),
- dangerous areas (`auth` is shared with SSO),
- non-obvious data or migration rules.

Delete anything the agent can read from `package.json`, `pyproject.toml`, imports, or filenames.

## Measurement

`bloated-vs-landmines` compares two AGENTS-style inputs:

1. raw: auto-generated project overview and inferred conventions.
2. optimized: short list of high-impact warnings.

## What to observe

The raw AGENTS file repeats facts visible in manifests and filenames.
The optimized file keeps instructions that prevent costly mistakes.
This is measured as input context because AGENTS guidance is injected up front.

## Run

```powershell
./run.ps1
```

```bash
./run.sh
```

## Measured takeaway

The ETH-Zurich result is a warning: LLM-written AGENTS files cut correctness by about **2%** and
raised token cost by **20-23%**.

Keep landmines. Delete the encyclopedia.
