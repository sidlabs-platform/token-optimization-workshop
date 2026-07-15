# demos/16-session-lifecycle/run.ps1 — compare sprawling conversation history with a compact session summary.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\16-session-lifecycle"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 16-session-lifecycle --scenario "sprawl-vs-compact" `
  --raw-file "$fx\history.sprawl.txt" --opt-file "$fx\history.compact.txt"

node "$root\bench\report.mjs"
