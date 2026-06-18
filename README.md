# API Studio DevTools

API Studio DevTools 是一个浏览器 DevTools 扩展，用来做 API 抓包、重放、Mock、埋点分析和 Cookie 观察。项目采用“共享源码 + 浏览器专用 manifest + 浏览器专用输出目录”的结构，Chrome 和 Firefox 共用同一份业务代码，避免维护两套重复逻辑。

## 功能亮点

- **Network / 网络**：捕获当前页面请求，查看 URL、Method、Status、Headers、Cookie、耗时和响应体。
- **Replay / 重放**：保存请求、分组管理、重命名并从 DevTools 面板重新发送。
- **请求体编辑**：支持 raw JSON/text、`application/x-www-form-urlencoded`、`multipart/form-data` 和文件上传。
- **Mock / 规则模拟**：从真实请求导入 Mock 规则，支持全局开关和分组管理。
- **Beacon / 埋点**：分析上报请求，支持多层 URL 编码、`$` 分隔载荷、嵌套 JSON、数组和重复 key 匹配。
- **Cookies / Cookie**：收集请求 Cookie 和响应 `Set-Cookie`，便于调试登录态和会话问题。
- **Theme / 主题**：支持自动、浅色、深色主题切换，自动模式跟随系统主题。

## 项目结构

```text
.
├── docs/
│   ├── chrome-web-store-listing.md
│   └── privacy-policy.md
├── scripts/
│   ├── build-chrome.sh
│   ├── build-firefox.sh
│   ├── lib-extension-build.sh
│   └── package-chrome.sh
├── src/
│   ├── chrome/
│   │   └── manifest.json
│   ├── firefox/
│   │   └── manifest.json
│   └── shared/
│       ├── _locales/
│       ├── icons/
│       ├── background.js
│       ├── compat.js
│       ├── content.js
│       ├── devtools.html
│       ├── devtools.js
│       ├── devtools-panel.html
│       ├── devtools-panel.css
│       ├── devtools-panel.js
│       └── inject.js
```

## 构建与本地加载

构建输出目录不会作为开发源码维护：

- `chrome-extension/`：Chrome 本地加载目录，也是 Chrome Web Store 上传包生成位置。
- `firefox-extension/`：Firefox 临时加载目录。

### Chrome 浏览器

```bash
bash scripts/build-chrome.sh
```

然后打开 `chrome://extensions`：

1. 开启 **Developer mode / 开发者模式**。
2. 点击 **Load unpacked / 加载已解压的扩展程序**。
3. 选择 `chrome-extension/`。
4. 打开任意网页 DevTools，进入 **API Studio** tab。

### Firefox 浏览器

```bash
bash scripts/build-firefox.sh
```

然后打开 `about:debugging#/runtime/this-firefox`：

1. 点击 **Load Temporary Add-on / 临时载入附加组件**。
2. 选择 `firefox-extension/manifest.json`。
3. 打开任意网页 DevTools，进入 **API Studio** tab。
4. 修改源码后需要重新构建并在 Firefox 里重新加载。

## Chrome Web Store 上传包

生成 Chrome 商店可上传 zip：

```bash
bash scripts/package-chrome.sh
```

输出文件：

```text
chrome-extension/api-studio-devtools-chrome.zip
```

上传 Chrome Web Store 时上传这个 zip 即可。zip 顶层会包含 `manifest.json`、JS/CSS/HTML、icons 和 `_locales`，不会包含 `.git/`、`.idea/`、Firefox manifest 或源码备份文件。

## 本地测试站

本仓库不再内置测试网站。用于手动验证插件 Network、Replay、Mock、Beacon、Cookies 和文件上传能力的测试站在同级目录：

```text
/Users/yangjunhu/Documents/Codex/plugin-test-app
```

该测试站是独立项目，不会进入 Chrome Web Store 上传包。

## Beacon 埋点解析

Beacon 面板会把常见生产上报格式先解析成更容易阅读的 JSON：外层 query/body 会按表单参数解析，字段值会做多层 URL decode，类似 `v=je=0$sc=24-bit$p0=...` 的 `$` 分隔载荷会继续展开，`p0` 这种二次编码 JSON 会还原成对象。URL 字段会保留为字符串，避免把链接里的 query 参数误拆成业务对象。

这里处理的是浏览器上报里常见的“编码/转义”格式，不是 AES/RSA 这类真正加密。如果生产埋点使用了真实加密算法，还需要提供算法和密钥来源，扩展才能进一步解密。

## 权限说明

- `storage`：保存 Mock 规则、命中次数、Replay 历史、分组、主题偏好等本地数据。
- `host_permissions: <all_urls>`：让 DevTools 扩展在当前页面上下文中捕获和模拟不同站点的 API 请求。该权限只用于开发调试，不会修改系统 hosts 文件。
- Firefox `clipboardWrite`：Firefox 对复制能力要求更显式，复制请求信息或 Cookie 信息时会用到。

Chrome Web Store 审核时可以参考 [docs/chrome-web-store-listing.md](docs/chrome-web-store-listing.md) 里的权限说明和审核备注。

## 隐私与数据

扩展默认只在浏览器本地处理数据：Mock 规则、Replay 历史、捕获的请求摘要、Cookie 调试信息和主题偏好都保存在浏览器本地存储中。项目本身不包含后端服务，也不会把这些数据上传到第三方服务器。

隐私政策草稿见 [docs/privacy-policy.md](docs/privacy-policy.md)。真正提交 Chrome Web Store 时，需要把隐私政策发布到可公开访问的 URL，例如 GitHub Pages、官网或其他静态页面。

## 开发约定

- 通用业务代码只改 `src/shared/`。
- Chrome 专用配置只改 `src/chrome/manifest.json`。
- Firefox 专用配置只改 `src/firefox/manifest.json`。
- 不要直接修改 `chrome-extension/` 或 `firefox-extension/`，它们是构建输出目录，已被 Git 忽略。
- 新增浏览器差异时，优先放到 `src/shared/compat.js` 或 manifest，而不是复制一份业务代码。
- 打包前先运行 `bash scripts/package-chrome.sh`，确保 Chrome 上传包和最新源码一致。
