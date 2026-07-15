# demos/09-output-control/run.ps1 — measure capped code-only output against verbose answers.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\09-output-control"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 09-output-control --scenario "verbose-vs-capped" `
  --raw-file "$fx\verbose-vs-capped.raw.txt" --opt-file "$fx\verbose-vs-capped.opt.txt" --as-output

node "$root\bench\report.mjs"
