#!/usr/bin/env bash
# demos/02-rtk/run.sh — measure tool-output compression (RTK) A/B.
# Fixtures in fixtures/02-rtk are REAL `rtk` output. --live re-captures from the live rtk
# binary first, then measures. Offline, it measures the captured fixtures.
set -uo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/02-rtk"; cmp="$root/bench/compare.mjs"
LIVE="${1:-}"
if command -v rtk >/dev/null 2>&1; then hasRtk=1; else hasRtk=0; fi
echo "RTK live tool detected: $hasRtk"

if [ "$LIVE" = "--live" ] && [ "$hasRtk" = "1" ]; then
  echo "Re-capturing fixtures from the live rtk binary..."
  node "$root/fixtures/generate.mjs" >/dev/null
fi

node "$cmp" --demo 02-rtk --scenario "git-diff" --raw-file "$fx/git-diff.raw.txt" --opt-file "$fx/git-diff.rtk.txt"
node "$cmp" --demo 02-rtk --scenario "vitest"   --raw-file "$fx/vitest.raw.txt"   --opt-file "$fx/vitest.rtk.txt"
node "$cmp" --demo 02-rtk --scenario "grep"     --raw-file "$fx/grep.raw.txt"     --opt-file "$fx/grep.rtk.txt"
node "$cmp" --demo 02-rtk --scenario "tsc"      --raw-file "$fx/tsc.raw.txt"      --opt-file "$fx/tsc.rtk.txt"

echo; echo "Regenerating scoreboard..."; node "$root/bench/report.mjs"
