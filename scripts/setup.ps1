# scripts/setup.ps1 — Windows setup for the Token Optimization Workshop.
# Installs workspace deps, checks optional tools, and confirms offline fixtures exist.
# Usage:  ./scripts/setup.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Section($t) { Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Ok($t)      { Write-Host "  [ok]  $t" -ForegroundColor Green }
function Warn($t)    { Write-Host "  [--]  $t" -ForegroundColor Yellow }

Section "Prerequisites"
foreach ($c in @("node","npm","git")) {
  if (Get-Command $c -ErrorAction SilentlyContinue) { Ok "$c $(& $c --version 2>$null | Select-Object -First 1)" }
  else { throw "Missing required tool: $c" }
}
foreach ($c in @("python","gh")) {
  if (Get-Command $c -ErrorAction SilentlyContinue) { Ok "$c present" } else { Warn "$c not found (optional)" }
}

Section "Install bench harness"
Push-Location "$root\bench"; npm install --no-audit --no-fund; Pop-Location
Ok "bench dependencies installed"

Section "Install SentinelOps app"
if (Test-Path "$root\app\package.json") {
  Push-Location "$root\app"; npm install --no-audit --no-fund; Pop-Location
  Ok "app dependencies installed"
} else { Warn "app/ not present yet" }

Section "Optional token tools (offline fixtures used if missing)"
$tools = @{
  "rtk"      = "RTK (Rust Token Killer) — tool-output compression. https://github.com/rtk-ai/rtk"
  "graphify" = "Graphify — codebase->knowledge graph. pip install graphifyy"
  "caveman"  = "Caveman Code — agent output compression. npm i -g @juliusbrussee/caveman-code"
}
foreach ($k in $tools.Keys) {
  if (Get-Command $k -ErrorAction SilentlyContinue) { Ok "$k detected — demos will run it LIVE" }
  else { Warn "$k not installed — demos fall back to fixtures/  ($($tools[$k]))" }
}

Section "Verify offline fixtures"
$missing = 0
Get-ChildItem "$root\fixtures" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  $n = (Get-ChildItem $_.FullName -File -ErrorAction SilentlyContinue).Count
  if ($n -gt 0) { Ok "$($_.Name): $n fixture files" } else { Warn "$($_.Name): no fixtures"; $missing++ }
}

Section "Self-test the harness"
Push-Location "$root\bench"; node selftest.mjs; Pop-Location

Write-Host "`nSetup complete. Next: ./scripts/verify-all.ps1" -ForegroundColor Cyan
