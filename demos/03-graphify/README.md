# Module 3 — Navigating Large Codebases with Graphify

**Goal:** answer a whole-codebase question without reading the whole codebase.
Local `/graphify` skill · `pip install graphifyy`

## The task
> "Explain the incident-ingestion flow."

- **Blind:** the agent opens `ingest.ts`, the shared models, the validators, the store,
  the routes… and stuffs them all into context.
- **Graphify:** one budgeted query returns just the relevant nodes/edges.

## Install (optional — offline fixtures used if missing)
```bash
pip install graphifyy
graphify .                                  # build the graph
graphify query "incident ingestion" --budget 1500
graphify explain
```
For a bigger graph, clone a large OSS repo first:
```powershell
./../../scripts/clone-sandbox.ps1           # shallow-clones expressjs into sandbox/
```

## Run the measurement
```powershell
./run.ps1            # offline (fixtures)
./run.ps1 -Live      # live graphify query if installed
```
```bash
./run.sh   # or: ./run.sh --live
```

## Expected result
The budgeted graph answer is a fraction of the "read everything" context — a large,
measured token saving on the *input* side, recorded to `results/RESULTS.md`.
