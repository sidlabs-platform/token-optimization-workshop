# scripts/verify-all.ps1 - run every demo's non-interactive (offline) path and ASSERT a
# positive, measured saving for each. Exits non-zero if any demo fails to save tokens.
# Usage:  ./scripts/verify-all.ps1 [-Full]   (-Full also runs app install/test/lint/build + deck)
param([switch]$Full)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $root
$fail = 0
function Section($t) { Write-Host "`n========== $t ==========" -ForegroundColor Cyan }

Section "Harness self-test"
node "$root\bench\selftest.mjs"; if ($LASTEXITCODE -ne 0) { $fail++ }

Section "Reset results"
$csv = "$root\bench\results.csv"
if (Test-Path $csv) { Copy-Item $csv "$csv.bak" -Force; Remove-Item $csv }
if (Test-Path "$root\bench\token-usage.jsonl") { Remove-Item "$root\bench\token-usage.jsonl" }

$demos = @(
  "01-identifying-waste",
  "02-rtk",
  "03-graphify",
  "04-caveman",
  "05-context-engineering",
  "06-challenge",
  "07-prompt-compression",
  "08-language-choice",
  "09-output-control",
  "10-mode-selection",
  "11-custom-agents-skills",
  "12-model-routing",
  "13-agents-file",
  "14-mcp-tools",
  "15-reasoning-depth",
  "16-session-lifecycle",
  "17-subagents",
  "18-instruction-caching",
  "19-usage-limits",
  "20-power-user"
)
foreach ($d in $demos) {
  Section "Demo $d (offline/fixtures)"
  $script = "$root\demos\$d\run.ps1"
  if (-not (Test-Path $script)) { Write-Host "MISSING: $script" -ForegroundColor Red; $fail++; continue }
  $extra = @{}
  if ($d -eq "06-challenge") { $extra = @{ SkipTests = -not $Full } }
  try {
    if ($d -eq "06-challenge" -and -not $Full) { & $script -SkipTests }
    else { & $script }
  } catch { Write-Host "ERROR running ${d}: $_" -ForegroundColor Red; $fail++ }
}

Section "Assert positive savings for every measurement"
if (-not (Test-Path $csv)) { Write-Host "No results.csv produced!" -ForegroundColor Red; exit 1 }
$rows = Import-Csv $csv
$neg = 0
foreach ($r in $rows) {
  $p = [double]$r.pct_saved
  $status = if ($p -gt 0) { "ok " } else { "BAD"; }
  if ($p -le 0) { $neg++ }
  $color = if ($p -gt 0) { "Green" } else { "Red" }
  Write-Host ("  [{0}] {1,-14} {2,-18} raw={3,-8} opt={4,-8} saved={5,5}%" -f $status,$r.demo,$r.scenario,$r.raw_tokens,$r.opt_tokens,$r.pct_saved) -ForegroundColor $color
}
if ($rows.Count -eq 0) { Write-Host "No measurements recorded!" -ForegroundColor Red; $fail++ }
if ($neg -gt 0) { Write-Host "`n$neg measurement(s) did NOT save tokens." -ForegroundColor Red; $fail++ }

Section "Regenerate scoreboard"
node "$root\bench\report.mjs"; if ($LASTEXITCODE -ne 0) { $fail++ }

if ($Full) {
  Section "App: install / typecheck / lint / test / build"
  if (Test-Path "$root\app\package.json") {
    Push-Location "$root\app"
    npm install --no-audit --no-fund; if ($LASTEXITCODE -ne 0) { $fail++ }
    npm run typecheck; if ($LASTEXITCODE -ne 0) { $fail++ }
    npm run lint;      if ($LASTEXITCODE -ne 0) { $fail++ }
    npm test;          if ($LASTEXITCODE -ne 0) { $fail++ }
    npm run build;     if ($LASTEXITCODE -ne 0) { $fail++ }
    Pop-Location
  } else { Write-Host "app/ missing" -ForegroundColor Yellow }

  Section "Deck: PDF export"
  node "$root\deck\build.mjs"; if ($LASTEXITCODE -ne 0) { $fail++ }
}

Section "Summary"
if ($fail -eq 0) {
  Write-Host "ALL CHECKS PASSED - every demo produced a measured, positive saving." -ForegroundColor Green
  Write-Host "See results\RESULTS.md" -ForegroundColor Green
  exit 0
} else {
  Write-Host "$fail check(s) FAILED." -ForegroundColor Red
  exit 1
}
