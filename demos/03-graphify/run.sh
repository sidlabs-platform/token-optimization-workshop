#!/usr/bin/env bash
# demos/03-graphify/run.sh — explain incident-ingestion flow: blind vs budgeted graph query.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/03-graphify"; cmp="$root/bench/compare.mjs"
LIVE="${1:-}"
if command -v graphify >/dev/null 2>&1; then hasG=1; else hasG=0; fi
echo "Graphify live tool: $hasG"
if [ "$LIVE" = "--live" ] && [ "$hasG" = "1" ]; then
  optTmp=$(mktemp)
  ( cd "$root/app" && graphify query "incident ingestion flow" --budget 1500 >"$optTmp" 2>&1 ) || true
  node "$cmp" --demo 03-graphify --scenario "ingestion-flow" --raw-file "$fx/blind.raw.txt" --opt-file "$optTmp"
  rm -f "$optTmp"
else
  node "$cmp" --demo 03-graphify --scenario "ingestion-flow" --raw-file "$fx/blind.raw.txt" --opt-file "$fx/graph.opt.txt"
fi
node "$root/bench/report.mjs"
