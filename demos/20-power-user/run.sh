#!/usr/bin/env bash
# demos/20-power-user/run.sh — measure raw shell dumps vs trimmed tool summaries.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/20-power-user"; cmp="$root/bench/compare.mjs"

node "$cmp" --demo 20-power-user --scenario "raw-shell-vs-trimmed" \
  --raw-file "$fx/raw-shell-output.txt" --opt-file "$fx/trimmed-summary.txt"

node "$root/bench/report.mjs"
