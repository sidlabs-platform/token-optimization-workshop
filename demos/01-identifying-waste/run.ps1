# demos/01-identifying-waste/run.ps1 — baseline ET vs waste-free context for the same task.
# Shows the three sinks: a 900-line diff, verbose test logs, dependency dumps, re-reads.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\01-waste"
$cmp = "$root\bench\compare.mjs"

# The "baseline" context is what a naive session drags in for a one-line task.
# The "lean" context is the surgical minimum needed to do the same task.
node $cmp --demo 01-waste --scenario "baseline-vs-lean" `
  --raw-file "$fx\baseline-context.raw.txt" --opt-file "$fx\lean-context.opt.txt"

node "$root\bench\report.mjs"
