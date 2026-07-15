#!/usr/bin/env bash
# demos/13-agents-file/run.sh — measure bloated AGENTS.md vs landmine-only guidance.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/13-agents-file"; cmp="$root/bench/compare.mjs"

node "$cmp" --demo 13-agents-file --scenario "bloated-vs-landmines" \
  --raw-file "$fx/agents.bloated.txt" --opt-file "$fx/agents.landmines.txt"

node "$root/bench/report.mjs"
