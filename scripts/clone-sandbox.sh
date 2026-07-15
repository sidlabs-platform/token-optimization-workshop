#!/usr/bin/env bash
# scripts/clone-sandbox.sh — shallow-clone a large public OSS repo for the Graphify module.
set -euo pipefail
repo="${1:-https://github.com/expressjs/express.git}"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
name="$(basename "$repo" .git)"
dest="$root/sandbox/$name"
if [ -d "$dest" ]; then echo "Already cloned: $dest"; exit 0; fi
echo "Shallow-cloning $repo -> $dest"
git clone --depth 1 "$repo" "$dest"
echo "Done. Point Graphify at: $dest"
