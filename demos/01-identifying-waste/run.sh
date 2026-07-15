#!/usr/bin/env bash
# demos/01-identifying-waste/run.sh — baseline ET vs waste-free context for the same task.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/01-waste"; cmp="$root/bench/compare.mjs"
node "$cmp" --demo 01-waste --scenario "baseline-vs-lean" \
  --raw-file "$fx/baseline-context.raw.txt" --opt-file "$fx/lean-context.opt.txt"
node "$root/bench/report.mjs"
