#!/usr/bin/env bash
# demos/10-mode-selection/run.sh — measure vague Agent exploration against phased mode selection.
set -uo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/10-mode-selection"; cmp="$root/bench/compare.mjs"

node "$cmp" --demo 10-mode-selection --scenario "vague-agent-vs-phased" \
  --raw-file "$fx/vague-agent-vs-phased.raw.txt" --opt-file "$fx/vague-agent-vs-phased.opt.txt"

node "$root/bench/report.mjs"
