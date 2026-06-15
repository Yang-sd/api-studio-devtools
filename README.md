# API Studio DevTools

API Studio DevTools is a browser DevTools extension for API capture, replay, mock, weak-network simulation, beacon inspection, and cookie analysis.

API Studio DevTools 是一个浏览器 DevTools 扩展，用来做 API 抓包、重放、Mock、弱网模拟、埋点分析和 Cookie 观察。

## Highlights / 功能亮点

- **Network / 网络**: capture requests from the current page and inspect URL, method, status, headers, cookies, timings, and response bodies.
- **Replay / 重放**: save requests, organize them by group, rename them, and resend them from the DevTools panel.
- **Replay body types / 重放请求体类型**: supports raw JSON/text, `application/x-www-form-urlencoded`, and `multipart/form-data` with file upload.
- **Mock / 规则 Mock**: create local mock rules from captured requests and switch them on or off with a master toggle.
- **Throttle / 弱网**: simulate delay, jitter, upload speed, and download speed for replay or page-global fetch/XHR traffic.
- **Beacon / 埋点**: inspect reporting APIs and match nested payload fields, arrays, and repeated keys.
- **Cookies / Cookie**: collect request cookies and response `Set-Cookie` values for debugging auth and session flows.
- **Chrome and Firefox / Chrome 与 Firefox**: includes separate manifests and a Firefox build workflow.

## Quick Start / 快速开始

### Chrome / Chromium

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository folder.
5. Open DevTools and choose the **API Studio** tab.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Build the Firefox bundle:

```bash
./scripts/build-firefox.sh
```

4. Select `dist/firefox/manifest.json`.
5. Open DevTools and choose the **API Studio** tab.
6. After source changes, rebuild and reload the temporary add-on from `dist/firefox/manifest.json` again.

## Testing the Replay editor / 验证 Replay 编辑器

Replay now supports multiple body formats.

Replay 现在支持多种请求体格式。

- Use **原始 / JSON** for plain JSON, XML, or text payloads.
- Use **表单 URL Encoded** for classic form submissions.
- Use **文件上传 FormData** for multipart requests and file uploads.
- When sending `multipart/form-data`, let the browser set the `Content-Type` boundary automatically.

## Test App / 测试站

The `test/` directory contains a small Flask app for validating capture, replay, mock, throttle, beacon, cookies, and multipart upload workflows.

`test/` 目录下是一个轻量 Flask 测试站，用来验证抓包、重放、Mock、弱网、埋点、Cookies 和 multipart 上传流程。

Run locally:

```bash
cd test
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open:

```text
http://localhost:8080
```

Useful test endpoints:

- `GET /api/network/probe` and `POST /api/network/probe` for weak-network verification.
- `POST /api/upload-demo` for multipart / file-upload verification.
- `GET /api/analytics/events` and `POST /api/analytics/events` for beacon testing.

### Weak-Network Verification / 弱网验证

1. Reload the extension, then refresh the test page.
2. In DevTools → API Studio → Throttle, enable a profile with `延迟 2000 ms`, `抖动 0 ms`, and `页面全局` enabled.
3. Click `Fetch 延迟验证` on the test page.
4. The `本次总耗时` value should be close to `2000 ms` or higher.

### Multipart Upload Verification / 上传验证

1. Open the test page at `http://localhost:8080`.
2. Use the `文件上传验证台` card on the page, or send a Replay request to `POST /api/upload-demo`.
3. Pick a file and submit the form.
4. The response should show the uploaded file name and field data.

## Project Structure / 项目结构

```text
.
├── background.js
├── compat.js
├── content.js
├── devtools.html
├── devtools.js
├── devtools-panel.html
├── devtools-panel.css
├── devtools-panel.js
├── inject.js
├── manifest.json
├── manifest.firefox.json
├── popup.html
├── popup.js
├── scripts/
└── test/
```

## Development Notes / 开发说明

- The extension does not modify system hosts files.
- Weak-network simulation is browser-extension-level simulation, not OS-level packet loss.
- Firefox temporary add-ons need to be reloaded after every rebuild.
- Generated files from the test app, such as SQLite databases, logs, PID files, and virtual environments, are ignored by Git.

## English Summary / English Overview

API Studio DevTools helps you inspect real browser traffic, replay requests with different body formats, create local mock rules, validate weak-network behavior, and debug analytics or cookie flows. It is designed for daily frontend development and testing, with a separate Firefox build path and a local Flask test app for verification.
