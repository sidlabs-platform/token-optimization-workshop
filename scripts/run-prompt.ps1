# scripts/run-prompt.ps1 - run a demo's baseline/optimized prompt through GitHub Copilot CLI
# and report the REAL token usage Copilot itself reports, so you can show attendees that the
# optimized prompt yields the same-quality answer with fewer tokens.
#
# Usage:
#   ./scripts/run-prompt.ps1 -Demo 01-identifying-waste -Compare        # run both, show delta
#   ./scripts/run-prompt.ps1 -Demo 02-rtk -Variant optimized           # run one variant
#   ./scripts/run-prompt.ps1 -Demo 03-graphify -Compare -DryRun        # no Copilot call; just
#                                                                        # preview prompt tokens
param(
  [Parameter(Mandatory=$true)][string]$Demo,
  [ValidateSet("baseline","optimized")][string]$Variant = "optimized",
  [switch]$Compare,
  [switch]$DryRun,
  [switch]$Record,
  [string]$Model,
  [int]$MaxCredits = 100
)
$ErrorActionPreference = "Continue"
$PSNativeCommandUseErrorActionPreference = $false
$root = (Resolve-Path "$PSScriptRoot\..").Path
$pdir = Join-Path $root "prompts\$Demo"
if (-not (Test-Path $pdir)) { Write-Host "No prompts for demo '$Demo'. See prompts/ for valid ids." -ForegroundColor Red; exit 2 }
$meta = Get-Content (Join-Path $pdir "meta.json") -Raw | ConvertFrom-Json
if (-not $Model) { $Model = $meta.model }

# Make the optional tools discoverable (rtk/rg/caveman/node22) if installed under ~/.local.
$paths = @("$env:USERPROFILE\.local\bin", "$env:USERPROFILE\.local\node22")
foreach ($p in $paths) { if ((Test-Path $p) -and ($env:PATH -notlike "*$p*")) { $env:PATH = "$p;$env:PATH" } }

function Convert-Tok([string]$v) {
  if (-not $v) { return 0 }
  $v = $v.Trim()
  if ($v -match '^([\d.]+)k$') { return [int]([double]$matches[1] * 1000) }
  if ($v -match '^([\d.]+)m$') { return [int]([double]$matches[1] * 1000000) }
  return [int]([double]$v)
}

function Invoke-Variant([string]$var) {
  $promptFile = Join-Path $pdir "$var.txt"
  $prompt = (Get-Content $promptFile -Raw)
  $promptTokens = (node "$root\bench\token-count.mjs" --file $promptFile --json | ConvertFrom-Json).tokens

  if ($DryRun) {
    return [pscustomobject]@{ variant=$var; promptTokens=$promptTokens; up=0; cached=0; written=0; down=0; credits=0; answer="(dry-run: prompt not executed)" }
  }

  Write-Host "`n>>> Running $Demo / $var  (model=$Model)..." -ForegroundColor Cyan
  Push-Location $root
  $raw = copilot -p "$prompt" --allow-all-tools --no-color --model $Model --max-ai-credits $MaxCredits 2>&1 | Out-String
  Pop-Location

  $up=0;$cached=0;$written=0;$down=0;$credits=0
  if ($raw -match 'Tokens\s+\S+\s*([\d.]+[km]?)\s*\(([\d.]+[km]?)\s*cached[^)]*\)[^0-9]*([\d.]+[km]?)') {
    $up=Convert-Tok $matches[1]; $cached=Convert-Tok $matches[2]; $down=Convert-Tok $matches[3]
  } elseif ($raw -match 'Tokens\s+\S+\s*([\d.]+[km]?)[^0-9]+([\d.]+[km]?)') {
    $up=Convert-Tok $matches[1]; $down=Convert-Tok $matches[2]
  }
  if ($raw -match 'AI Credits\s+([\d.]+)') { $credits=[double]$matches[1] }
  # Answer = everything before the footer block.
  $answer = ($raw -split 'Changes\s+\+')[0].Trim()

  return [pscustomobject]@{ variant=$var; promptTokens=$promptTokens; up=$up; cached=$cached; written=$written; down=$down; credits=$credits; answer=$answer }
}

Write-Host "=== $Demo ===" -ForegroundColor Yellow
Write-Host "Task        : $($meta.task)"
Write-Host "Technique   : $($meta.technique)"
Write-Host "Quality gate: $($meta.quality_check)"

$results = @()
if ($Compare) { $results += Invoke-Variant "baseline"; $results += Invoke-Variant "optimized" }
else { $results += Invoke-Variant $Variant }

foreach ($r in $results) {
  Write-Host "`n----- $($r.variant) answer -----" -ForegroundColor Green
  Write-Host $r.answer
  Write-Host ("metrics: promptTokens={0}  in(up)={1} (cached {2})  out(down)={3}  credits={4}" -f $r.promptTokens,$r.up,$r.cached,$r.down,$r.credits) -ForegroundColor DarkGray
}

if ($Compare -and $results.Count -eq 2 -and -not $DryRun) {
  $b=$results[0]; $o=$results[1]
  $upSave = if ($b.up -gt 0) { [math]::Round((($b.up-$o.up)/$b.up)*100,1) } else { 0 }
  $downSave = if ($b.down -gt 0) { [math]::Round((($b.down-$o.down)/$b.down)*100,1) } else { 0 }
  $credSave = if ($b.credits -gt 0) { [math]::Round((($b.credits-$o.credits)/$b.credits)*100,1) } else { 0 }
  Write-Host "`n================ COMPARISON ($Demo) ================" -ForegroundColor Cyan
  Write-Host ("{0,-12} {1,12} {2,12}" -f "metric","baseline","optimized")
  Write-Host ("{0,-12} {1,12} {2,12}" -f "in tokens", $b.up, $o.up)
  Write-Host ("{0,-12} {1,12} {2,12}" -f "out tokens", $b.down, $o.down)
  Write-Host ("{0,-12} {1,12} {2,12}" -f "AI credits", $b.credits, $o.credits)
  Write-Host ("input tokens saved : {0}%" -f $upSave) -ForegroundColor Green
  Write-Host ("output tokens saved: {0}%" -f $downSave) -ForegroundColor Green
  Write-Host ("AI credits saved   : {0}%" -f $credSave) -ForegroundColor Green
  Write-Host "`nQUALITY: compare the two answers above - they should convey the same facts:" -ForegroundColor Yellow
  Write-Host "  $($meta.quality_check)"

  if ($Record) {
    $csv = Join-Path $root "results\prompts-live.csv"
    if (-not (Test-Path $csv)) { "timestamp,demo,model,base_in,opt_in,in_saved_pct,base_out,opt_out,out_saved_pct,base_credits,opt_credits,cred_saved_pct" | Out-File $csv -Encoding utf8 }
    "$(Get-Date -Format o),$Demo,$Model,$($b.up),$($o.up),$upSave,$($b.down),$($o.down),$downSave,$($b.credits),$($o.credits),$credSave" | Out-File $csv -Append -Encoding utf8
    Write-Host "`nRecorded to results/prompts-live.csv" -ForegroundColor DarkGray
  }
}
