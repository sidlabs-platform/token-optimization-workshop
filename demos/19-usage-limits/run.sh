#!/usr/bin/env bash
# demos/19-usage-limits/run.sh — measure ungoverned sessions vs budget-capped operation.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/19-usage-limits"; cmp="$root/bench/compare.mjs"

node "$cmp" --demo 19-usage-limits --scenario "ungoverned-vs-capped" \
  --raw-file "$fx/ungoverned-session.txt" --opt-file "$fx/capped-session.txt"

node "$root/bench/report.mjs"
