# Module 2 — Optimizing Tool Output with RTK

**Goal:** compress raw tool output (the #1 sink) with **RTK — Rust Token Killer**.
Repo: https://github.com/rtk-ai/rtk

## Install (optional — offline fixtures used if missing)
- **One command:** `./scripts/install-tools.ps1` (Windows) / `bash scripts/install-tools.sh` (mac/Linux)
  installs RTK + ripgrep for you. Or manually:
- Windows: download `rtk-x86_64-pc-windows-msvc.zip` from
  [releases](https://github.com/rtk-ai/rtk/releases), put `rtk.exe` on PATH; also install
  [ripgrep](https://github.com/BurntSushi/ripgrep) (`rg`) for `rtk grep`/`rtk rg`.
- Wire it into Copilot globally: `rtk init -g`
- Verify: `rtk --version`

## Run the A/B measurement
```powershell
./run.ps1            # offline: measures fixtures/02-rtk = REAL captured rtk output
./run.ps1 -Live      # re-captures from the live rtk binary, then measures
```
```bash
./run.sh             # offline
./run.sh --live      # live
```

It measures four commands, raw vs RTK-compressed (real `rtk` subcommands):

| Scenario | Raw command | RTK command |
|---|---|---|
| git-diff | `git diff -U20 main..feature` | `git diff … \| rtk diff -` |
| vitest   | `vitest run --reporter verbose` | `rtk vitest run` |
| grep     | `rg -C3 -i severity` | `rtk rg -i severity` |
| tsc      | `tsc --noEmit --listFiles` | `rtk tsc --noEmit` |

## Then: re-run the baseline task with RTK wired in
After `rtk init -g`, repeat the Module 1 task in Copilot and compare the ET.

## Measured result (this repo, real rtk 0.43+)
**vitest ≈ 99.7%**, **tsc ≈ 99.8%**, **grep ≈ 73%**, **git-diff ≈ 19%** — verbose logs and
type-check output compress hugest; dense source diffs least. Recorded to `results/RESULTS.md`.
