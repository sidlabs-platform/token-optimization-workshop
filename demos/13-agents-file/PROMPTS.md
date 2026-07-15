# 13-agents-file — validated prompts (baseline vs optimized)

**Task:** Provide repository instructions for agents working on SentinelOps.

**Technique:** AGENTS hygiene: keep only surprising landmines, remove inferable encyclopedia text.

**Quality gate (both answers must satisfy this):**
> Both variants must warn about `uv` instead of `pip`, VPN for deploys, and avoiding auth changes
> without owner approval.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants:
```powershell
./scripts/run-prompt.ps1 -Demo 13-agents-file -Compare
```
Run the matrix:
```powershell
./scripts/run-matrix.ps1 -Demo 13-agents-file -Variant both
```

Review `results/MODEL-MATRIX-13-agents-file.md` and confirm the quality gate still holds.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Read this full AGENTS.md before each task. SentinelOps is a modern TypeScript and Python incident
management repository. The API is in app/packages/api, the web app is in app/packages/web, tests
should pass, code should be clean, variables should be descriptive, and agents should inspect files
before editing. The repo uses Git and package managers. Remember every convention listed here even
when package manifests already show it.
```

### ✅ Optimized (landmines only)
```
AGENTS.md landmines: use `uv`, not `pip`; production deploy commands require VPN; do not touch
auth/SSO without owner approval; preserve incident dedupe fingerprints in API migrations.
Infer everything else from files.
```

**Expected:** The optimized file keeps the warnings that change behavior and removes inferable
background that costs tokens every session.
