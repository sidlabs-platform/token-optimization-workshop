#!/usr/bin/env bash
# scripts/run-prompt.sh — run a demo's baseline/optimized prompt through GitHub Copilot CLI
# and report the real token usage. Usage:
#   ./scripts/run-prompt.sh <demo> [--compare|--variant baseline|--variant optimized] [--model M] [--dry-run]
set -uo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
demo="${1:-}"; shift || true
variant="optimized"; compare=0; dry=0; model=""
while [ $# -gt 0 ]; do case "$1" in
  --compare) compare=1;;
  --variant) variant="$2"; shift;;
  --model) model="$2"; shift;;
  --dry-run) dry=1;;
esac; shift; done
pdir="$root/prompts/$demo"
[ -d "$pdir" ] || { echo "No prompts for demo '$demo'"; exit 2; }
[ -z "$model" ] && model=$(node -e "console.log(require('$pdir/meta.json').model)")
task=$(node -e "console.log(require('$pdir/meta.json').task)")
quality=$(node -e "console.log(require('$pdir/meta.json').quality_check)")
export PATH="$HOME/.local/bin:$PATH"

tok() { # convert 41.7k / 183 -> integer
  local v="$1"; case "$v" in
    *k) echo "$(awk "BEGIN{printf \"%d\", ${v%k}*1000}")";;
    *m) echo "$(awk "BEGIN{printf \"%d\", ${v%m}*1000000}")";;
    *) echo "$(awk "BEGIN{printf \"%d\", ${v:-0}}")";;
  esac
}
run() { # variant -> prints "in out credits"
  local var="$1" prompt raw line up down cred
  prompt="$(cat "$pdir/$var.txt")"
  if [ "$dry" = "1" ]; then echo "0 0 0"; return; fi
  echo ">>> Running $demo / $var (model=$model)..." >&2
  raw="$(cd "$root" && copilot -p "$prompt" --allow-all-tools --no-color --model "$model" --max-ai-credits 100 2>&1)"
  echo "----- $var answer -----" >&2
  echo "$raw" | sed '/^Changes  */,$d' >&2
  line="$(echo "$raw" | grep -m1 'Tokens')"
  up=$(echo "$line" | grep -oE '[0-9.]+[km]?' | sed -n '1p')
  down=$(echo "$line" | grep -oE '[0-9.]+[km]?' | tail -n1)
  cred=$(echo "$raw" | grep -oE 'AI Credits[[:space:]]+[0-9.]+' | grep -oE '[0-9.]+')
  echo "$(tok "$up") $(tok "$down") ${cred:-0}"
}

echo "=== $demo ==="; echo "Task: $task"; echo "Quality gate: $quality"
if [ "$compare" = "1" ]; then
  read bi bo bc < <(run baseline)
  read oi oo oc < <(run optimized)
  echo; echo "================ COMPARISON ($demo) ================"
  printf "%-12s %12s %12s\n" metric baseline optimized
  printf "%-12s %12s %12s\n" "in tokens" "$bi" "$oi"
  printf "%-12s %12s %12s\n" "out tokens" "$bo" "$oo"
  printf "%-12s %12s %12s\n" "AI credits" "$bc" "$oc"
  awk "BEGIN{if($bi>0)printf \"input tokens saved : %.1f%%\n\", (($bi-$oi)/$bi)*100}"
  awk "BEGIN{if($bo>0)printf \"output tokens saved: %.1f%%\n\", (($bo-$oo)/$bo)*100}"
  echo "QUALITY: the two answers above should convey the same facts:"; echo "  $quality"
else
  run "$variant" >/dev/null
fi
