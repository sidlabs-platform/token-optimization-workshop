#!/usr/bin/env bash
# workshop/scoreboard.sh — run all module measurements and print the scoreboard.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/.." && pwd)"
bash "$here/module-1-build/measure.sh"
bash "$here/module-2-query/measure.sh"
bash "$here/module-3-test/measure.sh"
bash "$here/module-4-advanced/measure.sh"
echo ""
echo "================ WORKSHOP SCOREBOARD ================"
node "$root/bench/report.mjs"
echo ""
echo "Full scoreboard file: results/RESULTS.md"
