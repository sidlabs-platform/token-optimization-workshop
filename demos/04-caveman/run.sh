#!/usr/bin/env bash
# demos/04-caveman/run.sh — measure Caveman output/context compression.
# read-dedup uses Caveman's REAL ReadDeduplicationCache. agent-output = terse vs chatty.
set -uo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/04-caveman"; cmp="$root/bench/compare.mjs"
LIVE="${1:-}"
if command -v caveman >/dev/null 2>&1; then hasCaveman=1; else hasCaveman=0; fi
echo "Caveman live tool detected: $hasCaveman"

if [ "$LIVE" = "--live" ] && [ "$hasCaveman" = "1" ]; then
  echo "Re-capturing read-dedup fixture from the real Caveman engine..."
  node "$root/fixtures/generate.mjs" >/dev/null
fi

node "$cmp" --demo 04-caveman --scenario "read-dedup" \
  --raw-file "$fx/readdedup.off.txt" --opt-file "$fx/readdedup.ultra.txt"
node "$cmp" --demo 04-caveman --scenario "agent-output" \
  --raw-file "$fx/agent-output.off.txt" --opt-file "$fx/agent-output.ultra.txt" --as-output

node "$root/bench/report.mjs"
