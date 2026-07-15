# workshop/module-1-build/measure.ps1
# Measures the token impact of the Module 1 optimizations against the real app fixtures.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\workshop\fixtures\m1"
$cmp = "$root\bench\compare.mjs"
$model = if ($env:WS_MODEL) { $env:WS_MODEL } else { 'opus-4.8' }

Write-Host "`n=== Module 1 — Build the feature the lean way ===" -ForegroundColor Cyan

Write-Host "`n[1/2] Context scoping: read-the-whole-repo  vs  scoped 3 files + XML task" -ForegroundColor Yellow
node $cmp --demo w-m1 --scenario "context-scoping" --model $model `
  --raw-file "$fx\build-context.raw.txt" --opt-file "$fx\build-context.opt.txt"

Write-Host "`n[2/2] Output control: verbose narration  vs  terse structured summary (4x ET weight)" -ForegroundColor Yellow
node $cmp --demo w-m1 --scenario "output-control" --as-output --model $model `
  --raw-file "$fx\agent-output.verbose.txt" --opt-file "$fx\agent-output.terse.txt"

node "$root\bench\report.mjs" | Out-Null
Write-Host "`nRecorded to bench/results.csv — see the scoreboard with: node bench/report.mjs" -ForegroundColor Green
