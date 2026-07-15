# demos/08-language-choice/run.ps1 — measure concise English against redundant multilingual prompting.
$ErrorActionPreference = "Stop"
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$fx = "$root\fixtures\08-language-choice"
$cmp = "$root\bench\compare.mjs"

node $cmp --demo 08-language-choice --scenario "english-vs-verbose" `
  --raw-file "$fx\english-vs-verbose.raw.txt" --opt-file "$fx\english-vs-verbose.opt.txt"

node "$root\bench\report.mjs"
