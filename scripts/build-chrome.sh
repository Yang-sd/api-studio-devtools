#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT_DIR/scripts/lib-extension-build.sh"

OUT_DIR="$ROOT_DIR/chrome-extension"

# Chrome Web Store 上传包和本地开发加载都使用这份输出目录。
build_extension "$ROOT_DIR/src/chrome/manifest.json" "$OUT_DIR"

echo "Chrome extension build created at: $OUT_DIR"
