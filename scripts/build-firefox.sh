#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT_DIR/scripts/lib-extension-build.sh"

OUT_DIR="$ROOT_DIR/dist/firefox"

build_extension "$ROOT_DIR/src/firefox/manifest.json" "$OUT_DIR"

echo "Firefox extension build created at: $OUT_DIR"
