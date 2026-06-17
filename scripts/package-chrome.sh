#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT_DIR/scripts/lib-extension-build.sh"

OUT_DIR="$ROOT_DIR/chrome-extension"
ARCHIVE_NAME="api-studio-devtools-chrome.zip"

# 每次打包前重新构建，避免上传包里混入过期文件。
bash "$ROOT_DIR/scripts/build-chrome.sh"
package_extension "$OUT_DIR" "$ARCHIVE_NAME"

echo "Chrome Web Store package created at: $OUT_DIR/$ARCHIVE_NAME"
