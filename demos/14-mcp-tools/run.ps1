# demos/14-mcp-tools/run.ps1 — measure MCP schema tax before and after tool pruning.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\14-mcp-tools"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 14-mcp-tools --scenario "188-vs-52-tools" `
  --raw-file "$fx\mcp-188-tools.txt" --opt-file "$fx\mcp-52-tools.txt"

node "$root\bench\report.mjs"
