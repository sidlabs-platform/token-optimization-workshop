#!/usr/bin/env bash
# scripts/install-tools.sh — install optional token tools on macOS/Linux.
# RTK via official installer, ripgrep via package manager/cargo, Caveman via npm, Graphify via pip.
set -uo pipefail

echo "[1/4] RTK (Rust Token Killer)"
if command -v rtk >/dev/null 2>&1; then echo "  already installed: $(rtk --version)";
else curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh || echo "  RTK install failed — see https://github.com/rtk-ai/rtk"; fi

echo "[2/4] ripgrep (rg) — needed for 'rtk grep'/'rtk rg'"
if command -v rg >/dev/null 2>&1; then echo "  already installed";
elif command -v brew >/dev/null 2>&1; then brew install ripgrep;
elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update && sudo apt-get install -y ripgrep;
else echo "  install ripgrep manually: https://github.com/BurntSushi/ripgrep"; fi

echo "[3/4] Caveman Code (npm global; requires Node <= 22 for better-sqlite3)"
if command -v caveman >/dev/null 2>&1; then echo "  already installed: $(caveman --version)";
else npm install -g @juliusbrussee/caveman-code || echo "  Caveman install failed — use Node 22 LTS (nvm install 22)"; fi

echo "[4/4] Graphify (Python)"
if command -v graphify >/dev/null 2>&1; then echo "  already installed";
elif command -v pip >/dev/null 2>&1; then pip install graphifyy;
elif command -v pip3 >/dev/null 2>&1; then pip3 install graphifyy;
else echo "  pip not found — skip (demos fall back to fixtures)"; fi

echo "Done. Run: node fixtures/generate.mjs && ./scripts/verify-all.sh --full"
