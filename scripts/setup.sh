#!/usr/bin/env bash
# scripts/setup.sh — macOS/Linux setup for the Token Optimization Workshop.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

section() { printf "\n=== %s ===\n" "$1"; }
ok()      { printf "  [ok]  %s\n" "$1"; }
warn()    { printf "  [--]  %s\n" "$1"; }

section "Prerequisites"
for c in node npm git; do
  if command -v "$c" >/dev/null 2>&1; then ok "$c $($c --version 2>/dev/null | head -n1)"; else echo "Missing required tool: $c"; exit 1; fi
done
for c in python3 gh; do
  if command -v "$c" >/dev/null 2>&1; then ok "$c present"; else warn "$c not found (optional)"; fi
done

section "Install bench harness"
( cd "$root/bench" && npm install --no-audit --no-fund ); ok "bench dependencies installed"

section "Install SentinelOps app"
if [ -f "$root/app/package.json" ]; then
  ( cd "$root/app" && npm install --no-audit --no-fund ); ok "app dependencies installed"
else warn "app/ not present yet"; fi

section "Optional token tools (offline fixtures used if missing)"
for k in rtk graphify caveman; do
  if command -v "$k" >/dev/null 2>&1; then ok "$k detected — demos will run it LIVE"; else warn "$k not installed — demos fall back to fixtures/"; fi
done

section "Verify offline fixtures"
if [ -d "$root/fixtures" ]; then
  for d in "$root"/fixtures/*/; do
    [ -d "$d" ] || continue
    n=$(find "$d" -maxdepth 1 -type f | wc -l | tr -d ' ')
    if [ "$n" -gt 0 ]; then ok "$(basename "$d"): $n fixture files"; else warn "$(basename "$d"): no fixtures"; fi
  done
fi

section "Self-test the harness"
( cd "$root/bench" && node selftest.mjs )

printf "\nSetup complete. Next: ./scripts/verify-all.sh\n"
