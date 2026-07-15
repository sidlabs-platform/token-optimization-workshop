# demos/18-instruction-caching/run.ps1 — compare volatile instruction prefixes with cache-friendly scoped instructions.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\18-instruction-caching"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 18-instruction-caching --scenario "unstable-vs-stable-prefix" `
  --raw-file "$fx\instructions.unstable.txt" --opt-file "$fx\instructions.stable.txt"

node "$root\bench\report.mjs"
