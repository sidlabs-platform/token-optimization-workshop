# demos/02-rtk/run.ps1 — measure tool-output compression (RTK) A/B.
# The fixtures in fixtures/02-rtk are REAL `rtk` output (captured by fixtures/generate.mjs).
# -Live re-captures them from the live `rtk` binary first, then measures — proving the
# numbers are reproducible from the real tool. Offline, it measures the captured fixtures.
param([switch]$Live)
$ErrorActionPreference = "Continue"
$PSNativeCommandUseErrorActionPreference = $false
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx   = "$root\fixtures\02-rtk"
$cmp  = "$root\bench\compare.mjs"
$hasRtk = [bool](Get-Command rtk -ErrorAction SilentlyContinue)
Write-Host "RTK live tool detected: $hasRtk  (Live switch: $Live)" -ForegroundColor Cyan

if ($Live -and $hasRtk) {
  Write-Host "Re-capturing fixtures from the live rtk binary..." -ForegroundColor Cyan
  node "$root\fixtures\generate.mjs" | Out-Null
}

node $cmp --demo 02-rtk --scenario "git-diff" --raw-file "$fx\git-diff.raw.txt" --opt-file "$fx\git-diff.rtk.txt"
node $cmp --demo 02-rtk --scenario "vitest"   --raw-file "$fx\vitest.raw.txt"   --opt-file "$fx\vitest.rtk.txt"
node $cmp --demo 02-rtk --scenario "grep"     --raw-file "$fx\grep.raw.txt"     --opt-file "$fx\grep.rtk.txt"
node $cmp --demo 02-rtk --scenario "tsc"      --raw-file "$fx\tsc.raw.txt"      --opt-file "$fx\tsc.rtk.txt"

Write-Host "`nRegenerating scoreboard..." -ForegroundColor Cyan
node "$root\bench\report.mjs"
