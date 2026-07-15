# workshop/solutions/apply.ps1 — apply the full reference solution into app/.
# Idempotent: safe to run more than once. Use to catch up a table or verify the solution.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$sol = "$PSScriptRoot"
$shared = "$root\app\packages\shared\src"
$api = "$root\app\packages\api\src"
$web = "$root\app\packages\web\src"

Write-Host '== Copying new + replacement files ==' -ForegroundColor Cyan
Copy-Item "$sol\shared\types\oncall.ts"        "$shared\types\oncall.ts" -Force
Copy-Item "$sol\shared\lib\acknowledge.ts"     "$shared\lib\acknowledge.ts" -Force
Copy-Item "$sol\shared\lib\acknowledge.test.ts" "$shared\lib\acknowledge.test.ts" -Force
Copy-Item "$sol\shared\lib\assignment.ts"      "$shared\lib\assignment.ts" -Force
Copy-Item "$sol\shared\lib\assignment.test.ts" "$shared\lib\assignment.test.ts" -Force
Copy-Item "$sol\api\store.ts"                  "$api\data\store.ts" -Force
Copy-Item "$sol\api\incidents.ts"             "$api\routes\incidents.ts" -Force
Copy-Item "$sol\api\incidents.ack.test.ts"    "$api\routes\incidents.ack.test.ts" -Force
Copy-Item "$sol\web\AckButton.tsx"            "$web\components\AckButton.tsx" -Force

function Edit-File($path, $find, $replace) {
  $t = (Get-Content -Raw $path) -replace "`r`n", "`n"
  if ($t.Contains(($replace -replace "`r`n","`n").Trim())) { Write-Host "  (already applied) $([IO.Path]::GetFileName($path))"; return }
  if (-not $t.Contains($find)) { throw "anchor not found in $path" }
  ($t -replace [regex]::Escape($find), $replace) | Set-Content -NoNewline $path
  Write-Host "  patched $([IO.Path]::GetFileName($path))"
}

Write-Host '== Applying surgical edits to existing files ==' -ForegroundColor Cyan

Edit-File "$shared\types\incident.ts" `
  "  fingerprint: string;`n  duplicateCount: number;`n}" `
  "  fingerprint: string;`n  duplicateCount: number;`n  acknowledgedBy?: string | null;`n  acknowledgedAt?: string | null;`n  assignee?: string | null;`n}"

Edit-File "$shared\types\filters.ts" `
  "  status?: IncidentStatus;`n  search?: string;`n}" `
  "  status?: IncidentStatus;`n  search?: string;`n  acknowledged?: boolean;`n}"

Edit-File "$shared\types\filters.ts" `
  "return Boolean(filters.severity || filters.serviceId || filters.status || filters.search?.trim());" `
  "return Boolean(`n    filters.severity ||`n      filters.serviceId ||`n      filters.status ||`n      filters.search?.trim() ||`n      filters.acknowledged !== undefined,`n  );"

Edit-File "$shared\utils\query.ts" `
  "  if (filters.status && incident.status !== filters.status) return false;`n  if (filters.search?.trim()) {" `
  "  if (filters.status && incident.status !== filters.status) return false;`n  if (filters.acknowledged !== undefined) {`n    const isAck = Boolean(incident.acknowledgedBy);`n    if (isAck !== filters.acknowledged) return false;`n  }`n  if (filters.search?.trim()) {"

Edit-File "$shared\index.ts" `
  "export * from './lib/healthScore';" `
  "export * from './lib/healthScore';`nexport * from './types/oncall';`nexport * from './lib/acknowledge';`nexport * from './lib/assignment';"

Write-Host "`n✔ Reference solution applied. Now run:  npm --prefix app test" -ForegroundColor Green
