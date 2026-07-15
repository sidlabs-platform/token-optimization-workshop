# demos/05-context-engineering/run.ps1 — measured context-engineering rewrites.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\05-context"
$cmp = "$root\bench\compare.mjs"

# 1) Bloated prose prompt  ->  XML-structured surgical prompt.
node $cmp --demo 05-context --scenario "prose-to-xml" `
  --raw-file "$fx\prompt.prose.txt" --opt-file "$fx\prompt.xml.txt"

# 2) 40-tool MCP schema loaded every turn  ->  on-demand gh CLI call.
node $cmp --demo 05-context --scenario "mcp-to-gh" `
  --raw-file "$fx\mcp-schemas.raw.txt" --opt-file "$fx\mcp-schemas.gh.txt"

node "$root\bench\report.mjs"
