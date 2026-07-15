#!/usr/bin/env bash
# demos/12-model-routing/run.sh — measure single-frontier vs mixed-model routing.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/12-model-routing"; cmp="$root/bench/compare.mjs"

node "$cmp" --demo 12-model-routing --scenario "single-vs-mixed" \
  --raw-file "$fx/single-frontier.txt" --opt-file "$fx/mixed-models.txt"

node "$root/bench/report.mjs"
