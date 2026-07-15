# workshop/module-3-test/measure.ps1
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\workshop\fixtures\m3"
$rtk = "$root\fixtures\02-rtk"
$cmp = "$root\bench\compare.mjs"
$model = if ($env:WS_MODEL) { $env:WS_MODEL } else { 'haiku-4.5' }

Write-Host "`n=== Module 3 — Test & harden efficiently ===" -ForegroundColor Cyan

Write-Host "`n[1/2] Compress the vitest run output before feeding it back to the agent" -ForegroundColor Yellow
node $cmp --demo w-m3 --scenario "test-output" --model $model `
  --raw-file "$fx\vitest.raw.txt" --opt-file "$fx\vitest.opt.txt"

Write-Host "`n[2/2] Compress a failing typecheck (tsc) log before debugging with the agent" -ForegroundColor Yellow
node $cmp --demo w-m3 --scenario "tsc-output" --model $model `
  --raw-file "$rtk\tsc.raw.txt" --opt-file "$rtk\tsc.rtk.txt"

node "$root\bench\report.mjs" | Out-Null
Write-Host "`nRecorded to bench/results.csv." -ForegroundColor Green
