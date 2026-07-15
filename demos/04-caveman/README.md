# Module 4 — Output Compression with Caveman

**Goal:** shrink what the agent generates and re-reads — the highest-leverage tokens.
Repo: https://github.com/JuliusBrussee/caveman-code · `npm i -g @juliusbrussee/caveman-code`

> Install note: Caveman depends on `better-sqlite3`, which needs a Node version with a
> prebuilt binary. On very new Node it won't build — use **Node 22 LTS**.
> `./scripts/install-tools.ps1` sets this up automatically on Windows.

## Two real measurements

### 1. read-dedup (Caveman's signature feature — runs LIVE)
An agent that re-reads the same file 3× pays 3× the tokens. Caveman's
**`ReadDeduplicationCache`** returns the full content once, then a tiny stub for repeats.
`fixtures/generate.mjs` invokes the **real** Caveman class to produce this fixture.

### 2. agent output: chatty vs ultra
```
/caveman off     # chatty, restating, apologetic prose
/caveman ultra   # terse, information-dense
```
Measured with the **4× output ET weight** (`--as-output`).

## Run
```powershell
./run.ps1            # offline: measures fixtures (read-dedup = real caveman output)
./run.ps1 -Live      # re-captures read-dedup from the live caveman engine, then measures
```
```bash
./run.sh   # or: ./run.sh --live
```

## Offline benchmark (from a caveman checkout)
```bash
npm run bench:offline   # compression-layers / roi / token-savings vitest benches
```

## Measured result (this repo, real caveman)
**read-dedup ≈ 61%** (3 reads → 1 + stubs); **agent-output ≈ 85%** ET (≈6–7× fewer output
tokens). Recorded to `results/RESULTS.md`.
