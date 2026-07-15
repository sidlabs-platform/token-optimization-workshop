# SETUP.md — Detailed setup & offline fallbacks

Everything here is designed so that **nothing is a live gamble**: every optional tool has a
pre-captured `fixtures/` fallback, and `scripts/verify-all` runs entirely offline.

## Prerequisites

| Tool | Required? | Check |
|---|---|---|
| Node.js ≥ 20 (tested on 26) | **yes** | `node --version` |
| npm ≥ 10 | **yes** | `npm --version` |
| git | **yes** | `git --version` |
| Python 3.9+ | optional (Graphify, deck server) | `python --version` |
| GitHub CLI (`gh`) | optional (Module 5) | `gh --version` |
| GitHub Copilot (CLI + IDE) | for live demos | `copilot --version` |

## 1. Install workshop dependencies

```powershell
# Windows
./scripts/setup.ps1
```
```bash
# macOS / Linux
bash scripts/setup.sh
```

This installs `bench/` and `app/` dependencies, checks for the optional tools, and confirms
the offline fixtures exist. It finishes by running the harness self-test.

## 2. Optional token tools

All three are optional. If missing, the matching demo uses `fixtures/` automatically — but
the shipped fixtures were **captured from the real tools**, so the numbers are authentic
either way.

### One-command install (recommended)
```powershell
./scripts/install-tools.ps1     # Windows: RTK + ripgrep + Caveman(+Node22) + Graphify
```
```bash
bash scripts/install-tools.sh   # macOS/Linux
```
Open a **new terminal** afterwards so the updated PATH is picked up, then re-run
`node fixtures/generate.mjs` to refresh fixtures from the live tools.

### RTK — Rust Token Killer (Module 2)
- Repo: https://github.com/rtk-ai/rtk · Windows binary: `rtk-x86_64-pc-windows-msvc.zip`.
- Needs **ripgrep** (`rg`) on PATH for `rtk grep`/`rtk rg`.
- Wire into Copilot globally: `rtk init -g`
- Real subcommands used by the demo: `rtk diff -`, `rtk vitest run`, `rtk rg`, `rtk tsc`.
- Live run: `demos/02-rtk/run.ps1 -Live`

### Graphify — codebase → knowledge graph (Module 3)
- `pip install graphifyy`
- Build a graph, then `graphify explain "..."` / `graphify path "A" "B"`.
- Bigger graph: `./scripts/clone-sandbox.ps1` shallow-clones a large OSS repo into `sandbox/`.
- Live run: `demos/03-graphify/run.ps1 -Live`

### Caveman Code — agent-side output/read compression (Module 4)
- `npm i -g @juliusbrussee/caveman-code` — **requires Node ≤ 22** (its `better-sqlite3`
  native dep has no prebuild for very new Node). The installer sets up a Node 22 runtime.
- The demo invokes Caveman's **real** `ReadDeduplicationCache` for the read-dedup fixture.
- Toggle in a Copilot session: `/caveman off` … `/caveman ultra`
- Offline benchmark (from a caveman checkout): `npm run bench:offline`

## 3. Verify offline

```powershell
./scripts/verify-all.ps1          # offline; asserts a positive saving for every demo
./scripts/verify-all.ps1 -Full    # also runs app build/tests + deck PDF export
```
```bash
bash scripts/verify-all.sh
bash scripts/verify-all.sh --full
```

## 4. Regenerate fixtures from the real app (optional)

```powershell
node fixtures/generate.mjs
```
This re-captures `git diff`, `vitest`, `grep`, and `tsc` output from the SentinelOps app and
re-produces the compressed versions, so the measured savings stay authentic.

## 5. Build the deck

```powershell
node deck/build.mjs        # exports deck/slides.pdf via md-to-pdf
# present live (served, reveal.js):
cd deck; python -m http.server 8088   # then open http://localhost:8088
```

## Troubleshooting

- **`gpt-tokenizer` missing** → the harness falls back to `chars/4` automatically (still
  produces consistent, comparable numbers). Re-run `npm install` in `bench/` to restore.
- **PowerShell execution policy blocks scripts** → run
  `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` for the session.
- **`md-to-pdf` not found** → `npm i -g md-to-pdf` (uses a bundled headless browser).
- **App tests slow** → `npm test` runs 400+ tests; use `verify-all` without `-Full` to skip.
