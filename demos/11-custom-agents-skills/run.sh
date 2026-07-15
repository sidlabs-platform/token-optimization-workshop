#!/usr/bin/env bash
# demos/11-custom-agents-skills/run.sh — measure lazy skills against always-on instructions.
set -uo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/11-custom-agents-skills"; cmp="$root/bench/compare.mjs"

node "$cmp" --demo 11-custom-agents-skills --scenario "always-on-vs-lazy" \
  --raw-file "$fx/always-on-vs-lazy.raw.txt" --opt-file "$fx/always-on-vs-lazy.opt.txt"

node "$root/bench/report.mjs"
