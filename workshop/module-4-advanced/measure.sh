#!/usr/bin/env bash
# workshop/module-4-advanced/measure.sh
# Measures the token impact of the Module 4 (advanced agent-loop) optimizations
# against fixtures generated from the real SentinelOps app.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"
fx="$root/workshop/fixtures/m4"
cmp="$root/bench/compare.mjs"
model="${WS_MODEL:-opus-4.8}"

echo ""
echo "=== Module 4 — Advanced agent-loop optimization ==="

echo ""
echo "[1/5] Task breakdown (/plan): one mega-prompt  vs  decomposed plan + step-1 scoped context"
node "$cmp" --demo w-m4 --scenario "task-breakdown" --model "$model" \
  --raw-file "$fx/plan-mega.raw.txt" --opt-file "$fx/plan-decomposed.opt.txt"

echo ""
echo "[2/5] Context management (/compact): sprawling history  vs  compacted operational summary"
node "$cmp" --demo w-m4 --scenario "compaction" --model "$model" \
  --raw-file "$fx/history-sprawl.raw.txt" --opt-file "$fx/history-compact.opt.txt"

echo ""
echo "[3/5] Model selection (/model): all-Opus re-explained workflow  vs  routed handoffs"
node "$cmp" --demo w-m4 --scenario "model-routing" --model "$model" \
  --raw-file "$fx/route-single.raw.txt" --opt-file "$fx/route-mixed.opt.txt"

echo ""
echo "[4/5] Auto model (/model auto): hand-babysitting the tier  vs  auto + /subagents"
node "$cmp" --demo w-m4 --scenario "auto-model" --model "$model" \
  --raw-file "$fx/auto-manual.raw.txt" --opt-file "$fx/auto-managed.opt.txt"

echo ""
echo "[5/5] Reasoning depth: over-thought answer  vs  right-sized reasoning (4x ET output weight)"
node "$cmp" --demo w-m4 --scenario "reasoning-depth" --as-output --model "$model" \
  --raw-file "$fx/reason-high.raw.txt" --opt-file "$fx/reason-medium.opt.txt"

node "$root/bench/report.mjs" > /dev/null
echo ""
echo "Recorded to bench/results.csv — see the scoreboard with: node bench/report.mjs"
echo "Tip: re-run any scenario with WS_MODEL=haiku-4.5 (or opus-4.8) to watch ET collapse by tier."
