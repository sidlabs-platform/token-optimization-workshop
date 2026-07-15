#!/usr/bin/env bash
# demos/16-session-lifecycle/run.sh — compare sprawling conversation history with a compact session summary.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/16-session-lifecycle"; cmp="$root/bench/compare.mjs"
node "$cmp" --demo 16-session-lifecycle --scenario "sprawl-vs-compact" \
  --raw-file "$fx/history.sprawl.txt" --opt-file "$fx/history.compact.txt"
node "$root/bench/report.mjs"
