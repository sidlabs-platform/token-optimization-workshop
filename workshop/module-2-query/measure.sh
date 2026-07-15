#!/usr/bin/env bash
# workshop/module-2-query/measure.sh
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/workshop/fixtures/m2"
rtk="$root/fixtures/02-rtk"
cmp="$root/bench/compare.mjs"
model="${WS_MODEL:-sonnet-4.6}"

echo ""
echo "=== Module 2 — Query & navigate the large codebase ==="

echo ""
echo "[1/3] Query, don't read: blind multi-file read  vs  budgeted graph answer"
node "$cmp" --demo w-m2 --scenario "query-vs-read" --model "$model" \
  --raw-file "$fx/where-filtering.raw.txt" --opt-file "$fx/where-filtering.opt.txt"

echo ""
echo "[2/3] RTK-compress a git diff before feeding it to the agent"
node "$cmp" --demo w-m2 --scenario "rtk-git-diff" --model "$model" \
  --raw-file "$rtk/git-diff.raw.txt" --opt-file "$rtk/git-diff.rtk.txt"

echo ""
echo "[3/3] RTK-compress a grep sweep before feeding it to the agent"
node "$cmp" --demo w-m2 --scenario "rtk-grep" --model "$model" \
  --raw-file "$rtk/grep.raw.txt" --opt-file "$rtk/grep.rtk.txt"

node "$root/bench/report.mjs" >/dev/null
echo ""
echo "Recorded to bench/results.csv."
