#!/usr/bin/env bash
# demos/14-mcp-tools/run.sh — measure MCP schema tax before and after tool pruning.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
fx="$root/fixtures/14-mcp-tools"; cmp="$root/bench/compare.mjs"

node "$cmp" --demo 14-mcp-tools --scenario "188-vs-52-tools" \
  --raw-file "$fx/mcp-188-tools.txt" --opt-file "$fx/mcp-52-tools.txt"

node "$root/bench/report.mjs"
