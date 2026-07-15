#!/usr/bin/env bash
# demos/08-language-choice/run.sh — measure concise English against redundant multilingual prompting.
set -uo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/08-language-choice"; cmp="$root/bench/compare.mjs"

node "$cmp" --demo 08-language-choice --scenario "english-vs-verbose" \
  --raw-file "$fx/english-vs-verbose.raw.txt" --opt-file "$fx/english-vs-verbose.opt.txt"

node "$root/bench/report.mjs"
