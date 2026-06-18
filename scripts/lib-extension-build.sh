#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SHARED_DIR="$ROOT_DIR/src/shared"

# 统一清理输出目录，避免旧资源混入新包。
clean_output_dir() {
  local out_dir="$1"
  rm -rf "$out_dir"
  mkdir -p "$out_dir"
}

# 共用源码只维护一份，Chrome / Firefox 包都从这里复制。
copy_shared_files() {
  local out_dir="$1"
  cp "$SHARED_DIR"/background.js "$out_dir"/
  cp "$SHARED_DIR"/compat.js "$out_dir"/
  cp "$SHARED_DIR"/content.js "$out_dir"/
  cp "$SHARED_DIR"/devtools.html "$out_dir"/
  cp "$SHARED_DIR"/devtools.js "$out_dir"/
  cp "$SHARED_DIR"/devtools-panel.html "$out_dir"/
  cp "$SHARED_DIR"/devtools-panel.css "$out_dir"/
  cp "$SHARED_DIR"/devtools-panel.js "$out_dir"/
  cp "$SHARED_DIR"/qr-code.js "$out_dir"/
  cp "$SHARED_DIR"/inject.js "$out_dir"/
}

# 图标和文案也按共享资源复制，便于多浏览器共用同一套视觉资产。
copy_shared_assets() {
  local out_dir="$1"
  cp -R "$SHARED_DIR"/icons "$out_dir"/
  cp -R "$SHARED_DIR"/_locales "$out_dir"/
}

# 浏览器专属 manifest 只在这里切换，避免在业务代码里分叉。
copy_manifest() {
  local manifest_path="$1"
  local out_dir="$2"
  cp "$manifest_path" "$out_dir"/manifest.json
}

build_extension() {
  local manifest_path="$1"
  local out_dir="$2"
  clean_output_dir "$out_dir"
  copy_shared_files "$out_dir"
  copy_shared_assets "$out_dir"
  copy_manifest "$manifest_path" "$out_dir"
}

package_extension() {
  local out_dir="$1"
  local archive_name="$2"
  local archive_path="$out_dir/$archive_name"
  local temp_zip

  temp_zip="$ROOT_DIR/.${archive_name}.$$.zip"
  rm -f "$archive_path"
  rm -f "$temp_zip"
  (cd "$out_dir" && zip -qr "$temp_zip" .)
  mv "$temp_zip" "$archive_path"
}
