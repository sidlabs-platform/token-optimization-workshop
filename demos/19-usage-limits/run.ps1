# demos/19-usage-limits/run.ps1 — measure ungoverned sessions vs budget-capped operation.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\19-usage-limits"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 19-usage-limits --scenario "ungoverned-vs-capped" `
  --raw-file "$fx\ungoverned-session.txt" --opt-file "$fx\capped-session.txt"

node "$root\bench\report.mjs"
