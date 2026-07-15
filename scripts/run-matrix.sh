#!/usr/bin/env bash
# scripts/run-matrix.sh — run a demo prompt (baseline and/or optimized) across multiple models
# and write results/MODEL-MATRIX-<demo>.md. Usage:
#   ./scripts/run-matrix.sh <demo> [--variant both|baseline|optimized] [--models "a,b,c"] [--dry-run]
set -uo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
demo="${1:-}"; shift || true
variant="both"; dry=0
models="claude-opus-4.8,gpt-5.6-sol,claude-sonnet-5,gpt-5.6-terra,claude-haiku-4.5,mai-code-1-flash-picker"
while [ $# -gt 0 ]; do case "$1" in
  --variant) variant="$2"; shift;;
  --models) models="$2"; shift;;
  --dry-run) dry=1;;
esac; shift; done
pdir="$root/prompts/$demo"; [ -d "$pdir" ] || { echo "No prompts for demo '$demo'"; exit 2; }
task=$(node -e "console.log(require('$pdir/meta.json').task)")
quality=$(node -e "console.log(require('$pdir/meta.json').quality_check)")
export PATH="$HOME/.local/bin:$PATH"
out="$root/results/MODEL-MATRIX-$demo.md"; mkdir -p "$root/results"

tok() { local v="$1"; case "$v" in *k) awk "BEGIN{printf \"%d\", ${v%k}*1000}";; *m) awk "BEGIN{printf \"%d\", ${v%m}*1000000}";; *) awk "BEGIN{printf \"%d\", ${v:-0}}";; esac; }
variants=$([ "$variant" = both ] && echo "baseline optimized" || echo "$variant")

echo "# Model matrix - $demo" > "$out"
echo -e "\n**Task:** $task\n\n**Quality gate:** $quality\n" >> "$out"
echo "| Variant | Model | In tok | Out tok | AI credits |" >> "$out"
echo "|---|---|--:|--:|--:|" >> "$out"
printf "%-10s %-26s %8s %8s %8s\n" variant model in out credits

IFS=',' read -ra MODELS <<< "$models"
for var in $variants; do
  prompt="$(cat "$pdir/$var.txt")"
  for m in "${MODELS[@]}"; do
    if [ "$dry" = "1" ]; then in=0; down=0; cred=0; else
      echo "  running $var on $m..." >&2
      raw="$(cd "$root" && copilot -p "$prompt" --allow-all-tools --no-color --model "$m" --max-ai-credits 100 2>&1)"
      line="$(echo "$raw" | grep -m1 'Tokens')"
      in=$(tok "$(echo "$line" | grep -oE '[0-9.]+[km]?' | sed -n '1p')")
      down=$(tok "$(echo "$line" | grep -oE '[0-9.]+[km]?' | tail -n1)")
      cred=$(echo "$raw" | grep -oE 'AI Credits[[:space:]]+[0-9.]+' | grep -oE '[0-9.]+')
    fi
    printf "%-10s %-26s %8s %8s %8s\n" "$var" "$m" "$in" "$down" "${cred:-0}"
    echo "| $var | $m | $in | $down | ${cred:-0} |" >> "$out"
  done
done
echo "" >> "$out"
echo "Wrote $out"
echo "Open it to compare model-pairs and confirm answer quality is preserved."
