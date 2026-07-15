#!/usr/bin/env bash
# demos/05-context-engineering/run.sh — measured context-engineering rewrites.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/05-context"; cmp="$root/bench/compare.mjs"
node "$cmp" --demo 05-context --scenario "prose-to-xml" \
  --raw-file "$fx/prompt.prose.txt" --opt-file "$fx/prompt.xml.txt"
node "$cmp" --demo 05-context --scenario "mcp-to-gh" \
  --raw-file "$fx/mcp-schemas.raw.txt" --opt-file "$fx/mcp-schemas.gh.txt"
node "$root/bench/report.mjs"
