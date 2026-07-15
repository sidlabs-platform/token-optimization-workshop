# scripts/clone-sandbox.ps1 — shallow-clone a large public OSS repo for the Graphify module.
# Usage: ./scripts/clone-sandbox.ps1 [repoUrl]
param([string]$RepoUrl = "https://github.com/expressjs/express.git")
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dest = Join-Path $root "sandbox\$([System.IO.Path]::GetFileNameWithoutExtension($RepoUrl))"
if (Test-Path $dest) { Write-Host "Already cloned: $dest"; exit 0 }
Write-Host "Shallow-cloning $RepoUrl -> $dest" -ForegroundColor Cyan
git clone --depth 1 $RepoUrl $dest
Write-Host "Done. Point Graphify at: $dest" -ForegroundColor Green
