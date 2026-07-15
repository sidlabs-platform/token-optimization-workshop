#!/usr/bin/env bash
# demos/06-challenge/run.sh — Advanced challenge: stack ALL techniques, minimize ET.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/06-challenge"; cmp="$root/bench/compare.mjs"
SKIP="${1:-}"
if [ "$SKIP" != "--skip-tests" ] && [ -f "$root/app/package.json" ]; then
  echo "GATE: running app tests (alert dedup must pass)..."
  ( cd "$root/app" && npm test ) || { echo "GATE FAILED: tests red."; exit 1; }
  echo "GATE PASSED: tests green."
fi
node "$cmp" --demo 06-challenge --scenario "full-session" \
  --raw-file "$fx/naive-session.raw.txt" --opt-file "$fx/optimized-session.opt.txt" --raw-output 3200 --opt-output 900
node "$root/bench/report.mjs"
echo "Winner + scoreboard: results/RESULTS.md"
