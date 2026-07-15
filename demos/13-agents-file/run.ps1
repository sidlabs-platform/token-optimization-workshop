# demos/13-agents-file/run.ps1 — measure bloated AGENTS.md vs landmine-only guidance.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\13-agents-file"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 13-agents-file --scenario "bloated-vs-landmines" `
  --raw-file "$fx\agents.bloated.txt" --opt-file "$fx\agents.landmines.txt"

node "$root\bench\report.mjs"
