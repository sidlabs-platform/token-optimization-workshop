# demos/10-mode-selection/run.ps1 — measure vague Agent exploration against phased mode selection.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\10-mode-selection"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 10-mode-selection --scenario "vague-agent-vs-phased" `
  --raw-file "$fx\vague-agent-vs-phased.raw.txt" --opt-file "$fx\vague-agent-vs-phased.opt.txt"

node "$root\bench\report.mjs"
