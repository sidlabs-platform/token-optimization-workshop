# demos/20-power-user/run.ps1 — measure raw shell dumps vs trimmed tool summaries.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\20-power-user"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 20-power-user --scenario "raw-shell-vs-trimmed" `
  --raw-file "$fx\raw-shell-output.txt" --opt-file "$fx\trimmed-summary.txt"

node "$root\bench\report.mjs"
