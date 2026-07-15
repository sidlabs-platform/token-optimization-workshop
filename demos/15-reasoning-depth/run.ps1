# demos/15-reasoning-depth/run.ps1 — compare high-effort verbose reasoning with medium concise output.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\15-reasoning-depth"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 15-reasoning-depth --scenario "high-vs-medium" `
  --raw-file "$fx\answer.high.txt" --opt-file "$fx\answer.medium.txt" --as-output

node "$root\bench\report.mjs"
