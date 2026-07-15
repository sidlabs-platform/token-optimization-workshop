# demos/04-caveman/run.ps1 — measure Caveman output/context compression.
# read-dedup uses Caveman's REAL ReadDeduplicationCache (fixtures/generate.mjs captures it).
# agent-output shows terse (ultra) vs chatty (off) generation — output tokens carry the 4x
# ET weight, so shrinking them is the highest-leverage win.
param([switch]$Live)
$ErrorActionPreference = "Continue"
$PSNativeCommandUseErrorActionPreference = $false
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\04-caveman"
$cmp = "$root\bench\compare.mjs"
$hasCaveman = [bool](Get-Command caveman -ErrorAction SilentlyContinue)
Write-Host "Caveman live tool detected: $hasCaveman  (Live switch: $Live)" -ForegroundColor Cyan

if ($Live -and $hasCaveman) {
  Write-Host "Re-capturing read-dedup fixture from the real Caveman engine..." -ForegroundColor Cyan
  node "$root\fixtures\generate.mjs" | Out-Null
}

# 1) read-dedup: same file read 3x vs Caveman dedup (full once + stubs) — INPUT tokens.
node $cmp --demo 04-caveman --scenario "read-dedup" `
  --raw-file "$fx\readdedup.off.txt" --opt-file "$fx\readdedup.ultra.txt"

# 2) agent output: chatty vs ultra — OUTPUT tokens (4x ET weight).
node $cmp --demo 04-caveman --scenario "agent-output" `
  --raw-file "$fx\agent-output.off.txt" --opt-file "$fx\agent-output.ultra.txt" --as-output

node "$root\bench\report.mjs"
