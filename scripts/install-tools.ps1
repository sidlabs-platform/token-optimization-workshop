# scripts/install-tools.ps1 — install the optional token tools used by the demos on Windows.
# Installs: RTK (binary), ripgrep (for rtk grep), Caveman (under a Node 22 runtime because
# its better-sqlite3 native dep does not build on very new Node). Graphify: pip install graphifyy.
# All installs go under %USERPROFILE%\.local and are added to your User PATH.
$ErrorActionPreference = "Stop"
$bin = "$env:USERPROFILE\.local\bin"
New-Item -ItemType Directory -Force $bin | Out-Null
function AddPath($p) {
  $u = [Environment]::GetEnvironmentVariable("PATH","User")
  if ($u -notlike "*$p*") { [Environment]::SetEnvironmentVariable("PATH","$p;$u","User") }
  $env:PATH = "$p;$env:PATH"
}
AddPath $bin

Write-Host "`n[1/4] RTK (Rust Token Killer)" -ForegroundColor Cyan
if (Get-Command rtk -ErrorAction SilentlyContinue) { Write-Host "  already installed: $(rtk --version)" }
else {
  $zip = "$env:TEMP\rtk.zip"
  Invoke-WebRequest "https://github.com/rtk-ai/rtk/releases/latest/download/rtk-x86_64-pc-windows-msvc.zip" -OutFile $zip -UseBasicParsing
  Expand-Archive $zip -DestinationPath $bin -Force
  Write-Host "  installed: $(& "$bin\rtk.exe" --version)"
}

Write-Host "`n[2/4] ripgrep (rg) — needed for 'rtk grep'/'rtk rg'" -ForegroundColor Cyan
if (Get-Command rg -ErrorAction SilentlyContinue) { Write-Host "  already installed: $(rg --version | Select-Object -First 1)" }
else {
  $zip = "$env:TEMP\rg.zip"
  Invoke-WebRequest "https://github.com/BurntSushi/ripgrep/releases/download/14.1.1/ripgrep-14.1.1-x86_64-pc-windows-msvc.zip" -OutFile $zip -UseBasicParsing
  Expand-Archive $zip -DestinationPath "$env:TEMP\rgx" -Force
  Copy-Item (Get-ChildItem "$env:TEMP\rgx" -Recurse -Filter rg.exe | Select-Object -First 1).FullName "$bin\rg.exe" -Force
  Write-Host "  installed: $(& "$bin\rg.exe" --version | Select-Object -First 1)"
}

Write-Host "`n[3/4] Caveman Code (under Node 22 LTS — better-sqlite3 build)" -ForegroundColor Cyan
if (Get-Command caveman -ErrorAction SilentlyContinue) { Write-Host "  already installed: $(caveman --version)" }
else {
  $nodeDir = "$env:USERPROFILE\.local\node22"
  if (-not (Test-Path "$nodeDir\node.exe")) {
    $zip = "$env:TEMP\node22.zip"
    Invoke-WebRequest "https://nodejs.org/dist/v22.12.0/node-v22.12.0-win-x64.zip" -OutFile $zip -UseBasicParsing
    Expand-Archive $zip -DestinationPath "$env:TEMP\n22" -Force
    $inner = Get-ChildItem "$env:TEMP\n22" -Directory | Select-Object -First 1
    New-Item -ItemType Directory -Force $nodeDir | Out-Null
    Copy-Item "$($inner.FullName)\*" $nodeDir -Recurse -Force
  }
  $prefix = "$env:USERPROFILE\.local\caveman-prefix"
  New-Item -ItemType Directory -Force $prefix | Out-Null
  & "$nodeDir\npm.cmd" install -g --prefix $prefix "@juliusbrussee/caveman-code"
  $cli = "$prefix\node_modules\@juliusbrussee\caveman-code\dist\cli.js"
  Set-Content "$bin\caveman.cmd" "@echo off`r`n`"$nodeDir\node.exe`" `"$cli`" %*`r`n" -Encoding Ascii
  Set-Content "$bin\caveman.ps1" "& `"$nodeDir\node.exe`" `"$cli`" @args" -Encoding Ascii
  Write-Host "  installed: $(& "$bin\caveman.cmd" --version)"
}

Write-Host "`n[4/4] Graphify (optional, Python)" -ForegroundColor Cyan
if (Get-Command graphify -ErrorAction SilentlyContinue) { Write-Host "  already installed" }
elseif (Get-Command pip -ErrorAction SilentlyContinue) { pip install graphifyy; Write-Host "  installed via pip" }
else { Write-Host "  pip not found — skip (demos fall back to fixtures)" -ForegroundColor Yellow }

Write-Host "`nDone. Open a NEW terminal (for PATH) then run: node fixtures/generate.mjs; ./scripts/verify-all.ps1 -Full" -ForegroundColor Green
