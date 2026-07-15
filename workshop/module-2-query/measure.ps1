# workshop/module-2-query/measure.ps1
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\workshop\fixtures\m2"
$rtk = "$root\fixtures\02-rtk"
$cmp = "$root\bench\compare.mjs"
$model = if ($env:WS_MODEL) { $env:WS_MODEL } else { 'sonnet-4.6' }

Write-Host "`n=== Module 2 — Query & navigate the large codebase ===" -ForegroundColor Cyan

Write-Host "`n[1/3] Query, don't read: blind multi-file read  vs  budgeted graph answer" -ForegroundColor Yellow
node $cmp --demo w-m2 --scenario "query-vs-read" --model $model `
  --raw-file "$fx\where-filtering.raw.txt" --opt-file "$fx\where-filtering.opt.txt"

Write-Host "`n[2/3] RTK-compress a git diff before feeding it to the agent" -ForegroundColor Yellow
node $cmp --demo w-m2 --scenario "rtk-git-diff" --model $model `
  --raw-file "$rtk\git-diff.raw.txt" --opt-file "$rtk\git-diff.rtk.txt"

Write-Host "`n[3/3] RTK-compress a grep sweep before feeding it to the agent" -ForegroundColor Yellow
node $cmp --demo w-m2 --scenario "rtk-grep" --model $model `
  --raw-file "$rtk\grep.raw.txt" --opt-file "$rtk\grep.rtk.txt"

node "$root\bench\report.mjs" | Out-Null
Write-Host "`nRecorded to bench/results.csv." -ForegroundColor Green
