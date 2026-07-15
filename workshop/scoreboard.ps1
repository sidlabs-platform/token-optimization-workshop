# workshop/scoreboard.ps1 — run all module measurements and print the scoreboard.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot\..").Path
& "$PSScriptRoot\module-1-build\measure.ps1"
& "$PSScriptRoot\module-2-query\measure.ps1"
& "$PSScriptRoot\module-3-test\measure.ps1"
& "$PSScriptRoot\module-4-advanced\measure.ps1"
Write-Host "`n================ WORKSHOP SCOREBOARD ================" -ForegroundColor Cyan
node "$root\bench\report.mjs"
Write-Host "`nFull scoreboard file: results/RESULTS.md" -ForegroundColor Green
