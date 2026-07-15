#!/usr/bin/env bash
# demos/07-prompt-compression/run.sh — measure prompt compression with terse and structured input.
set -uo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/07-prompt-compression"; cmp="$root/bench/compare.mjs"

node "$cmp" --demo 07-prompt-compression --scenario "caveman-speak" \
  --raw-file "$fx/caveman-speak.raw.txt" --opt-file "$fx/caveman-speak.opt.txt"

node "$cmp" --demo 07-prompt-compression --scenario "structured-input" \
  --raw-file "$fx/structured-input.raw.txt" --opt-file "$fx/structured-input.opt.txt"

node "$root/bench/report.mjs"
