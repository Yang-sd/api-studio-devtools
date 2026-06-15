# Test App / 测试站说明

This directory contains a small Flask app for validating API Studio DevTools.

这个目录下是一个轻量 Flask 测试站，用来验证 API Studio DevTools 的抓包、重放、弱网、埋点和上传能力。

## What it is for / 用途

- Verify page-global throttle behavior on real `fetch` and `XMLHttpRequest` traffic.
- Verify Replay with different request body types, including JSON, form-urlencoded, and multipart uploads.
- Verify beacon reporting capture with nested objects, arrays, and repeated fields.
- Verify cookie capture and request/response inspection.

## Run locally / 本地运行

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

## Main routes / 主要路由

- `GET /` - test page
- `GET /api/tasks` - task list
- `POST /api/tasks` - create task
- `PUT /api/tasks/<id>` - update task
- `DELETE /api/tasks/<id>` - delete task
- `GET /api/network/probe` - weak-network response probe
- `POST /api/network/probe` - weak-network upload probe
- `POST /api/upload-demo` - multipart / file upload demo
- `GET /api/analytics/events` - beacon list
- `POST /api/analytics/events` - beacon create endpoint

## Weak-Network Verification / 弱网验证

1. Reload the extension.
2. Refresh `http://localhost:8080`.
3. Open DevTools → API Studio → Throttle.
4. Enable a profile with `延迟 2000 ms`, `抖动 0 ms`, and `页面全局` enabled.
5. Click `Fetch 延迟验证`.
6. The total time should be close to or above `2000 ms`.

If the status says the extension is injected but page-global throttle is disabled, the extension is working but the selected profile does not affect page fetch/XHR traffic.

如果状态提示“插件已注入，但页面全局未启用”，说明插件本身是生效的，只是当前选中的弱网预设没有作用到页面 fetch/XHR。

## Replay Upload Verification / Replay 上传验证

Use `POST /api/upload-demo` to verify multipart requests.

你可以用 `POST /api/upload-demo` 来验证 multipart 请求。

Suggested steps:

1. Open the test page and use the `文件上传验证台` card.
2. Or open Replay in the extension and set the URL to `http://localhost:8080/api/upload-demo`.
3. Switch the body type to `文件上传 FormData`.
4. Add a text field and select a file.
5. Send the request.
6. The response should include `fields` and `files` so you can confirm the upload actually reached the server.

## Beacon Verification / 埋点验证

The page includes several reporting buttons and a nested payload button for testing complex JSON structures.

页面里提供了多个埋点按钮和一个复杂嵌套上报按钮，用于验证复杂 JSON、数组、字典等结构的上报解析。

## Docker / Docker 运行

```bash
cd test
docker build -t api-studio-test-app .
docker run --rm -p 8080:8080 api-studio-test-app
```

## Notes / 说明

- The page is intentionally simple so you can focus on verifying extension behavior.
- Uploaded files are only used for local testing and are not stored permanently.
- The upload demo returns the content type, parsed fields, and file metadata to make debugging easier.
