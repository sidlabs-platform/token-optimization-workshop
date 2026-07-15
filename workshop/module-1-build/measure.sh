#!/usr/bin/env bash
# workshop/module-1-build/measure.sh
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/workshop/fixtures/m1"
cmp="$root/bench/compare.mjs"
model="${WS_MODEL:-opus-4.8}"

echo ""
echo "=== Module 1 — Build the feature the lean way ==="

echo ""
echo "[1/2] Context scoping: read-the-whole-repo  vs  scoped 3 files + XML task"
node "$cmp" --demo w-m1 --scenario "context-scoping" --model "$model" \
  --raw-file "$fx/build-context.raw.txt" --opt-file "$fx/build-context.opt.txt"

echo ""
echo "[2/2] Output control: verbose narration  vs  terse structured summary (4x ET weight)"
node "$cmp" --demo w-m1 --scenario "output-control" --as-output --model "$model" \
  --raw-file "$fx/agent-output.verbose.txt" --opt-file "$fx/agent-output.terse.txt"

node "$root/bench/report.mjs" >/dev/null
echo ""
echo "Recorded to bench/results.csv — see the scoreboard with: node bench/report.mjs"
