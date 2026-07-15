# demos/17-subagents/run.ps1 — compare flat parent-context discovery with a subagent digest.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\17-subagents"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 17-subagents --scenario "flat-vs-subagent" `
  --raw-file "$fx\discovery.flat.txt" --opt-file "$fx\discovery.digest.txt"

node "$root\bench\report.mjs"
