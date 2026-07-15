# scripts/run-matrix.ps1 - run one demo prompt (baseline and/or optimized) across MULTIPLE
# models and report the REAL tokens/credits GitHub Copilot reports for each, plus ET and $
# computed from models.json. This shows, per model and per model-pair, how many tokens the
# optimization saves - e.g. Opus 4.8 vs GPT-5.6 Sol, with and without RTK/Graphify/Caveman.
#
# Usage:
#   ./scripts/run-matrix.ps1 -Demo 04-caveman -Variant both          # both variants, all 6 models
#   ./scripts/run-matrix.ps1 -Demo 02-rtk -Variant optimized         # one variant, all 6 models
#   ./scripts/run-matrix.ps1 -Demo 03-graphify -Variant both -Models claude-opus-4.8,gpt-5.6-sol
#   ./scripts/run-matrix.ps1 -Demo 04-caveman -Variant both -DryRun  # no Copilot calls (plan only)
param(
  [Parameter(Mandatory=$true)][string]$Demo,
  [ValidateSet("baseline","optimized","both")][string]$Variant = "both",
  [string[]]$Models,
  [switch]$DryRun,
  [int]$MaxCredits = 100
)
$ErrorActionPreference = "Continue"
$PSNativeCommandUseErrorActionPreference = $false
$root = (Resolve-Path "$PSScriptRoot\..").Path
$pdir = Join-Path $root "prompts\$Demo"
if (-not (Test-Path $pdir)) { Write-Host "No prompts for demo '$Demo'." -ForegroundColor Red; exit 2 }
$meta  = Get-Content (Join-Path $pdir "meta.json") -Raw | ConvertFrom-Json
$cfg   = Get-Content (Join-Path $root "models.json") -Raw | ConvertFrom-Json
if (-not $Models) { $Models = @("claude-opus-4.8","gpt-5.6-sol","claude-sonnet-5","gpt-5.6-terra","claude-haiku-4.5","mai-code-1-flash-picker") }

# discover optional tools
foreach ($p in @("$env:USERPROFILE\.local\bin","$env:USERPROFILE\.local\node22")) { if ((Test-Path $p) -and ($env:PATH -notlike "*$p*")) { $env:PATH = "$p;$env:PATH" } }

function Tok([string]$v) { if(-not $v){return 0}; $v=$v.Trim(); if($v -match '^([\d.]+)k$'){return [int]([double]$matches[1]*1000)}; if($v -match '^([\d.]+)m$'){return [int]([double]$matches[1]*1000000)}; return [int]([double]$v) }
function ModelCfg($id) { return $cfg.models.$id }
function ComputeET($id,$in,$cached,$out) { $m=ModelCfg $id; if(-not $m){return 0}; return [math]::Round($m.etMultiplier * (($in-$cached) + 0.1*$cached + 4.0*$out),0) }
function ComputeUsd($id,$in,$cached,$out) {
  $m=ModelCfg $id; if(-not $m){return 0}
  $inP=$m.price.input; $outP=$m.price.output
  if ($m.longContext -and $in -ge $m.longContext.thresholdTokens) { $inP=$m.longContext.input; $outP=$m.longContext.output }
  $disc = if($m.cachedInputDiscount){$m.cachedInputDiscount}else{0}
  $fresh = $in - $cached
  return [math]::Round(($fresh/1e6)*$inP + ($cached/1e6)*($inP*(1-$disc)) + ($out/1e6)*$outP, 6)
}

function RunCell($var,$model) {
  $prompt = Get-Content (Join-Path $pdir "$var.txt") -Raw
  if ($DryRun) { return [pscustomobject]@{ variant=$var; model=$model; in=0; cached=0; out=0; credits=0; et=0; usd=0; answer="(dry-run)" } }
  Write-Host ("  running {0,-10} on {1}..." -f $var,$model) -ForegroundColor DarkCyan
  Push-Location $root
  $raw = copilot -p "$prompt" --allow-all-tools --no-color --model $model --max-ai-credits $MaxCredits 2>&1 | Out-String
  Pop-Location
  $in=0;$cached=0;$out=0;$credits=0
  if ($raw -match 'Tokens\s+\S+\s*([\d.]+[km]?)\s*\(([\d.]+[km]?)\s*cached[^)]*\)[^0-9]*([\d.]+[km]?)') { $in=Tok $matches[1]; $cached=Tok $matches[2]; $out=Tok $matches[3] }
  elseif ($raw -match 'Tokens\s+\S+\s*([\d.]+[km]?)[^0-9]+([\d.]+[km]?)') { $in=Tok $matches[1]; $out=Tok $matches[2] }
  if ($raw -match 'AI Credits\s+([\d.]+)') { $credits=[double]$matches[1] }
  $answer = ($raw -split 'Changes\s+\+')[0].Trim()
  return [pscustomobject]@{ variant=$var; model=$model; in=$in; cached=$cached; out=$out; credits=$credits; et=(ComputeET $model $in $cached $out); usd=(ComputeUsd $model $in $cached $out); answer=$answer }
}

$variants = if ($Variant -eq "both") { @("baseline","optimized") } else { @($Variant) }
Write-Host "=== MODEL MATRIX: $Demo ===" -ForegroundColor Yellow
Write-Host "Task     : $($meta.task)"
Write-Host "Quality  : $($meta.quality_check)"
Write-Host "Models   : $($Models -join ', ')`n"

$rows = @()
foreach ($var in $variants) { foreach ($m in $Models) { $rows += RunCell $var $m } }

# ---- table ----
Write-Host ("`n{0,-10} {1,-26} {2,8} {3,8} {4,8} {5,10} {6,10}" -f "variant","model","in","out","credits","ET","USD") -ForegroundColor Cyan
Write-Host ("-"*84)
foreach ($r in $rows) { Write-Host ("{0,-10} {1,-26} {2,8} {3,8} {4,8} {5,10} {6,10}" -f $r.variant,$r.model,$r.in,$r.out,$r.credits,$r.et,('$'+$r.usd)) }

# ---- markdown report ----
$md = "# Model matrix - $Demo`n`n_$(Get-Date -Format o)_`n`n**Task:** $($meta.task)`n`n**Quality gate:** $($meta.quality_check)`n`n"
$md += "| Variant | Model | In tok | Out tok | AI credits | ET | USD |`n|---|---|--:|--:|--:|--:|--:|`n"
foreach ($r in $rows) { $md += "| $($r.variant) | $($r.model) | $($r.in) | $($r.out) | $($r.credits) | $($r.et) | `$$($r.usd) |`n" }

# ---- pair comparison (Claude vs OpenAI, per tier, per variant) ----
$md += "`n## Model-pair comparison (input tokens)`n`n"
foreach ($var in $variants) {
  $md += "`n### $var`n`n| Tier | Claude | GPT/MAI | Claude in | GPT/MAI in | Delta in (Claude-GPT) |`n|---|---|---|--:|--:|--:|`n"
  foreach ($pair in $cfg.modelPairs) {
    $c = $rows | Where-Object { $_.variant -eq $var -and $_.model -eq $pair.claude } | Select-Object -First 1
    $g = $rows | Where-Object { $_.variant -eq $var -and $_.model -eq $pair.openai } | Select-Object -First 1
    if ($c -and $g) { $md += "| $($pair.tier) | $($pair.claude) | $($pair.openai) | $($c.in) | $($g.in) | $($c.in - $g.in) |`n" }
  }
}
# ---- optimization savings per model (baseline vs optimized) ----
if ($variants.Count -eq 2) {
  $md += "`n## Optimization savings per model (baseline -> optimized)`n`n| Model | Base in | Opt in | In saved % | Base out | Opt out | Out saved % | Base cred | Opt cred |`n|---|--:|--:|--:|--:|--:|--:|--:|--:|`n"
  foreach ($m in $Models) {
    $b = $rows | Where-Object { $_.variant -eq "baseline" -and $_.model -eq $m } | Select-Object -First 1
    $o = $rows | Where-Object { $_.variant -eq "optimized" -and $_.model -eq $m } | Select-Object -First 1
    if ($b -and $o) {
      $inSv = if($b.in -gt 0){[math]::Round((($b.in-$o.in)/$b.in)*100,1)}else{0}
      $outSv = if($b.out -gt 0){[math]::Round((($b.out-$o.out)/$b.out)*100,1)}else{0}
      $md += "| $m | $($b.in) | $($o.in) | $inSv% | $($b.out) | $($o.out) | $outSv% | $($b.credits) | $($o.credits) |`n"
    }
  }
}
# ---- answers for quality inspection ----
$md += "`n## Answers (verify quality is preserved)`n"
foreach ($r in $rows) { $md += "`n### $($r.variant) - $($r.model)`n`n``````n$($r.answer)`n``````n" }

$outDir = Join-Path $root "results"; New-Item -ItemType Directory -Force $outDir | Out-Null
$outFile = Join-Path $outDir "MODEL-MATRIX-$Demo.md"
$md | Out-File $outFile -Encoding utf8
Write-Host "`nWrote $outFile" -ForegroundColor Green
Write-Host "Open it to compare model-pairs and confirm answer quality is preserved." -ForegroundColor Green
