#!/usr/bin/env bash
# demos/17-subagents/run.sh — compare flat parent-context discovery with a subagent digest.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/17-subagents"; cmp="$root/bench/compare.mjs"
node "$cmp" --demo 17-subagents --scenario "flat-vs-subagent" \
  --raw-file "$fx/discovery.flat.txt" --opt-file "$fx/discovery.digest.txt"
node "$root/bench/report.mjs"
