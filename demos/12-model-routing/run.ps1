# demos/12-model-routing/run.ps1 — measure single-frontier vs mixed-model routing.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\12-model-routing"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 12-model-routing --scenario "single-vs-mixed" `
  --raw-file "$fx\single-frontier.txt" --opt-file "$fx\mixed-models.txt"

node "$root\bench\report.mjs"
