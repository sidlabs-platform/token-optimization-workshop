#!/usr/bin/env bash
# scripts/verify-all.sh — run every demo's offline path and ASSERT a positive saving.
# Usage: ./scripts/verify-all.sh [--full]
set -uo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
FULL="${1:-}"
fail=0
section() { printf "\n========== %s ==========\n" "$1"; }

section "Harness self-test"
node "$root/bench/selftest.mjs" || fail=$((fail+1))

section "Reset results"
csv="$root/bench/results.csv"
[ -f "$csv" ] && cp "$csv" "$csv.bak" && rm -f "$csv"
rm -f "$root/bench/token-usage.jsonl"

for d in 01-identifying-waste 02-rtk 03-graphify 04-caveman 05-context-engineering 06-challenge \
         07-prompt-compression 08-language-choice 09-output-control 10-mode-selection \
         11-custom-agents-skills 12-model-routing 13-agents-file 14-mcp-tools 15-reasoning-depth \
         16-session-lifecycle 17-subagents 18-instruction-caching 19-usage-limits 20-power-user; do
  section "Demo $d (offline/fixtures)"
  script="$root/demos/$d/run.sh"
  if [ ! -f "$script" ]; then echo "MISSING: $script"; fail=$((fail+1)); continue; fi
  if [ "$d" = "06-challenge" ] && [ "$FULL" != "--full" ]; then bash "$script" --skip-tests || fail=$((fail+1));
  else bash "$script" || fail=$((fail+1)); fi
done

section "Assert positive savings for every measurement"
if [ ! -f "$csv" ]; then echo "No results.csv produced!"; exit 1; fi
neg=$(awk -F, 'NR>1 && $8+0 <= 0 {c++} END{print c+0}' "$csv")
rows=$(awk 'NR>1{c++} END{print c+0}' "$csv")
awk -F, 'NR>1 {printf "  [%s] %-14s %-18s raw=%-8s opt=%-8s saved=%5s%%\n", ($8+0>0?"ok ":"BAD"), $2,$3,$5,$6,$8}' "$csv"
[ "$rows" -eq 0 ] && { echo "No measurements!"; fail=$((fail+1)); }
[ "$neg" -gt 0 ] && { echo "$neg measurement(s) did NOT save tokens."; fail=$((fail+1)); }

section "Regenerate scoreboard"
node "$root/bench/report.mjs" || fail=$((fail+1))

if [ "$FULL" = "--full" ]; then
  section "App: install / typecheck / lint / test / build"
  if [ -f "$root/app/package.json" ]; then
    ( cd "$root/app" && npm install --no-audit --no-fund && npm run typecheck && npm run lint && npm test && npm run build ) || fail=$((fail+1))
  fi
  section "Deck: PDF export"
  node "$root/deck/build.mjs" || fail=$((fail+1))
fi

section "Summary"
if [ "$fail" -eq 0 ]; then echo "ALL CHECKS PASSED — every demo produced a measured, positive saving."; echo "See results/RESULTS.md"; exit 0;
else echo "$fail check(s) FAILED."; exit 1; fi
