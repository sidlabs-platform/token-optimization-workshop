# demos/03-graphify/run.ps1 — explain incident-ingestion flow: blind vs budgeted graph query.
# Uses live `graphify` if present, else fixtures/03-graphify.
param([switch]$Live)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\03-graphify"
$cmp = "$root\bench\compare.mjs"
$hasGraphify = [bool](Get-Command graphify -ErrorAction SilentlyContinue)
Write-Host "Graphify live tool: $hasGraphify" -ForegroundColor Cyan

if ($Live -and $hasGraphify) {
  $optTmp = New-TemporaryFile
  Push-Location "$root\app"
  graphify query "incident ingestion flow" --budget 1500 > $optTmp 2>&1
  Pop-Location
  node $cmp --demo 03-graphify --scenario "ingestion-flow" --raw-file "$fx\blind.raw.txt" --opt-file $optTmp
  Remove-Item $optTmp -ErrorAction SilentlyContinue
} else {
  node $cmp --demo 03-graphify --scenario "ingestion-flow" --raw-file "$fx\blind.raw.txt" --opt-file "$fx\graph.opt.txt"
}
node "$root\bench\report.mjs"
