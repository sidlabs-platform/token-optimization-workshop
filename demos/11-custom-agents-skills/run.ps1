# demos/11-custom-agents-skills/run.ps1 — measure lazy skills against always-on instructions.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\11-custom-agents-skills"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 11-custom-agents-skills --scenario "always-on-vs-lazy" `
  --raw-file "$fx\always-on-vs-lazy.raw.txt" --opt-file "$fx\always-on-vs-lazy.opt.txt"

node "$root\bench\report.mjs"
