#!/usr/bin/env bash
# demos/09-output-control/run.sh — measure capped code-only output against verbose answers.
set -uo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/09-output-control"; cmp="$root/bench/compare.mjs"

node "$cmp" --demo 09-output-control --scenario "verbose-vs-capped" \
  --raw-file "$fx/verbose-vs-capped.raw.txt" --opt-file "$fx/verbose-vs-capped.opt.txt" --as-output

node "$root/bench/report.mjs"
