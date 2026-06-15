#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/dist/firefox"

mkdir -p "$OUT_DIR/icons"

rm -f "$OUT_DIR"/*.js "$OUT_DIR"/*.html "$OUT_DIR"/*.css "$OUT_DIR"/manifest.json
rm -f "$OUT_DIR/icons"/*
rm -rf "$OUT_DIR"/_locales

cp "$ROOT_DIR"/background.js "$OUT_DIR"/
cp "$ROOT_DIR"/compat.js "$OUT_DIR"/
cp "$ROOT_DIR"/content.js "$OUT_DIR"/
cp "$ROOT_DIR"/devtools.html "$OUT_DIR"/
cp "$ROOT_DIR"/devtools.js "$OUT_DIR"/
cp "$ROOT_DIR"/devtools-panel.html "$OUT_DIR"/
cp "$ROOT_DIR"/devtools-panel.css "$OUT_DIR"/
cp "$ROOT_DIR"/devtools-panel.js "$OUT_DIR"/
cp "$ROOT_DIR"/inject.js "$OUT_DIR"/
cp "$ROOT_DIR"/popup.html "$OUT_DIR"/
cp "$ROOT_DIR"/popup.css "$OUT_DIR"/
cp "$ROOT_DIR"/popup.js "$OUT_DIR"/
cp "$ROOT_DIR"/manifest.firefox.json "$OUT_DIR"/manifest.json
cp "$ROOT_DIR"/icons/* "$OUT_DIR"/icons/
cp -R "$ROOT_DIR"/_locales "$OUT_DIR"/

echo "Firefox extension build created at: $OUT_DIR"
