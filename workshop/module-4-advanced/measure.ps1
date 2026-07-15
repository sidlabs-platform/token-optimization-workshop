# workshop/module-4-advanced/measure.ps1
# Measures the token impact of the Module 4 (advanced agent-loop) optimizations
# against fixtures generated from the real SentinelOps app.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\workshop\fixtures\m4"
$cmp = "$root\bench\compare.mjs"
$model = if ($env:WS_MODEL) { $env:WS_MODEL } else { 'opus-4.8' }

Write-Host "`n=== Module 4 — Advanced agent-loop optimization ===" -ForegroundColor Cyan

Write-Host "`n[1/5] Task breakdown (/plan): one mega-prompt  vs  decomposed plan + step-1 scoped context" -ForegroundColor Yellow
node $cmp --demo w-m4 --scenario "task-breakdown" --model $model `
  --raw-file "$fx\plan-mega.raw.txt" --opt-file "$fx\plan-decomposed.opt.txt"

Write-Host "`n[2/5] Context management (/compact): sprawling history  vs  compacted operational summary" -ForegroundColor Yellow
node $cmp --demo w-m4 --scenario "compaction" --model $model `
  --raw-file "$fx\history-sprawl.raw.txt" --opt-file "$fx\history-compact.opt.txt"

Write-Host "`n[3/5] Model selection (/model): all-Opus re-explained workflow  vs  routed handoffs" -ForegroundColor Yellow
node $cmp --demo w-m4 --scenario "model-routing" --model $model `
  --raw-file "$fx\route-single.raw.txt" --opt-file "$fx\route-mixed.opt.txt"

Write-Host "`n[4/5] Auto model (/model auto): hand-babysitting the tier  vs  auto + /subagents" -ForegroundColor Yellow
node $cmp --demo w-m4 --scenario "auto-model" --model $model `
  --raw-file "$fx\auto-manual.raw.txt" --opt-file "$fx\auto-managed.opt.txt"

Write-Host "`n[5/5] Reasoning depth: over-thought answer  vs  right-sized reasoning (4x ET output weight)" -ForegroundColor Yellow
node $cmp --demo w-m4 --scenario "reasoning-depth" --as-output --model $model `
  --raw-file "$fx\reason-high.raw.txt" --opt-file "$fx\reason-medium.opt.txt"

node "$root\bench\report.mjs" | Out-Null
Write-Host "`nRecorded to bench/results.csv — see the scoreboard with: node bench/report.mjs" -ForegroundColor Green
Write-Host "Tip: re-run any scenario with `$env:WS_MODEL='haiku-4.5'` (or 'opus-4.8') to watch ET collapse by tier." -ForegroundColor DarkGray
