#!/usr/bin/env bash
# workshop/module-3-test/measure.sh
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/workshop/fixtures/m3"
rtk="$root/fixtures/02-rtk"
cmp="$root/bench/compare.mjs"
model="${WS_MODEL:-haiku-4.5}"

echo ""
echo "=== Module 3 — Test & harden efficiently ==="

echo ""
echo "[1/2] Compress the vitest run output before feeding it back to the agent"
node "$cmp" --demo w-m3 --scenario "test-output" --model "$model" \
  --raw-file "$fx/vitest.raw.txt" --opt-file "$fx/vitest.opt.txt"

echo ""
echo "[2/2] Compress a failing typecheck (tsc) log before debugging with the agent"
node "$cmp" --demo w-m3 --scenario "tsc-output" --model "$model" \
  --raw-file "$rtk/tsc.raw.txt" --opt-file "$rtk/tsc.rtk.txt"

node "$root/bench/report.mjs" >/dev/null
echo ""
echo "Recorded to bench/results.csv."
