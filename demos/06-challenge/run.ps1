# demos/06-challenge/run.ps1 — Advanced challenge: stack ALL techniques, minimize ET.
# Pass/fail gate: the app's tests must pass (implement alert dedup). Then measure the
# full-session token cost naive vs fully-optimized and crown a winner in RESULTS.md.
param([switch]$SkipTests)
$ErrorActionPreference = "Continue"
$PSNativeCommandUseErrorActionPreference = $false
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\06-challenge"
$cmp = "$root\bench\compare.mjs"

if (-not $SkipTests -and (Test-Path "$root\app\package.json")) {
  Write-Host "GATE: running app tests (alert dedup must pass)..." -ForegroundColor Cyan
  Push-Location "$root\app"
  $testOut = npm test 2>&1
  $code = $LASTEXITCODE
  Pop-Location
  $testOut | Select-Object -Last 8
  if ($code -ne 0) { Write-Host "GATE FAILED: tests are red. Fix them before scoring." -ForegroundColor Red; exit 1 }
  Write-Host "GATE PASSED: tests green." -ForegroundColor Green
}

# Full-session cost: naive (all sinks) vs fully-optimized (RTK+Graphify+Caveman+context eng).
node $cmp --demo 06-challenge --scenario "full-session" `
  --raw-file "$fx\naive-session.raw.txt" --opt-file "$fx\optimized-session.opt.txt" --raw-output 3200 --opt-output 900

node "$root\bench\report.mjs"
Write-Host "`nWinner + scoreboard: results\RESULTS.md" -ForegroundColor Cyan
