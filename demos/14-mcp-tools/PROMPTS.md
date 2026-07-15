# 14-mcp-tools — validated prompts (baseline vs optimized)

**Task:** Configure MCP tools for a SentinelOps production incident investigation.

**Technique:** Tool pruning: load only task-relevant MCP schemas.

**Quality gate (both answers must satisfy this):**
> Both variants must leave production incident DB read-only access and GitHub essentials available,
> while avoiding unnecessary Slack/Jira/staging/admin schema injection.

**Requires tools:** none · **Default model:** `claude-sonnet-4.5`

---

## 1) Run it the easy way

Compare both variants:
```powershell
./scripts/run-prompt.ps1 -Demo 14-mcp-tools -Compare
```
Run the matrix:
```powershell
./scripts/run-matrix.ps1 -Demo 14-mcp-tools -Variant both
```

Review `results/MODEL-MATRIX-14-mcp-tools.md` for quality and token savings.

---

## 2) Or paste the prompts into Copilot yourself

### ❌ Baseline (no optimization)
```
Load every available MCP server and tool schema for this SentinelOps task: Slack, Jira, GitHub,
Notion, billing, five Postgres environments, analytics, feature flags, deployment, identity admin,
customer CRM, and observability. Keep all schemas visible on every step even if the task only asks
about production incident deduplication.
```

### ✅ Optimized (pruned)
```
For this incident task, expose only GitHub file/search plus read-only production incident DB tools.
Disable Slack, Jira, CRM, admin, billing, analytics, and non-prod DB schemas until requested.
```

**Expected:** The optimized catalog preserves needed capabilities while removing schemas that would
be re-injected every turn.
