# Chrome Web Store Listing 草稿

这份文档用于准备 Chrome Web Store 上架资料。提交前请把截图、支持邮箱、隐私政策公开 URL 等信息替换成真实内容。

## 基本信息

- 扩展名称：API Studio - 接口请求模拟器
- 推荐分类：Developer Tools / 开发者工具
- 推荐语言：中文简体，可额外补英文描述
- 支持邮箱：`[填写你的支持邮箱]`
- 隐私政策 URL：`[填写公开可访问的隐私政策页面]`

## 简短描述

```text
在 DevTools 中捕获、重放、Mock 和调试 API 请求，支持弱网模拟、埋点分析、Cookie 调试和深色模式。
```

## 详细描述

```text
API Studio DevTools 是一款面向前端开发和测试场景的浏览器 DevTools 扩展。它会在开发者工具中新增 API Studio 面板，帮助你在当前页面内观察接口请求、重放请求、创建本地 Mock 规则，并模拟弱网环境。

主要能力：
- Network：捕获页面请求，查看 URL、Method、Status、Headers、Cookie、耗时和响应体。
- Replay：保存请求并重新发送，支持 raw、x-www-form-urlencoded、multipart/form-data 和文件上传。
- Mock：从真实请求快速生成本地 Mock 规则，支持分组、启停和命中计数。
- Throttle：模拟延迟、抖动、上传速度和下载速度，用于验证弱网体验。
- Beacon：分析埋点上报请求，支持嵌套字段和重复 key 匹配。
- Cookies：查看请求 Cookie 和响应 Set-Cookie，便于调试登录态与会话问题。
- Theme：支持自动、浅色、深色主题切换。

数据处理说明：
扩展默认只在浏览器本地处理和保存调试数据。Mock 规则、Replay 历史、Cookie 调试信息、弱网预设和主题偏好保存在浏览器本地存储中，不会上传到第三方服务器。
```

## 权限用途说明

### `storage`

用于在浏览器本地保存 Mock 规则、Replay 历史、分组、弱网预设、命中计数、主题偏好等开发调试数据。

### `host_permissions: <all_urls>`

用于在 DevTools 调试当前页面时捕获和模拟不同域名下的 API 请求。由于前端开发常常涉及本地服务、测试环境、预发环境和生产域名，扩展需要覆盖这些请求来源。该权限不会修改系统 hosts 文件，也不会把请求数据上传到外部服务。

### DevTools 面板

扩展功能主要运行在浏览器 DevTools 面板内，不提供独立 popup 页面。用户打开 DevTools 后，在 API Studio tab 中使用相关能力。

## 审核备注草稿

```text
API Studio DevTools is a developer tool extension. It adds a DevTools panel for inspecting and replaying API requests, creating local mock rules, simulating network latency, and debugging cookies or analytics beacons.

The extension requests <all_urls> host permissions because developers need to debug API traffic across local, staging, and production domains from the currently inspected page. Request data is processed locally in the browser and is not sent to any external server by this extension.

The extension does not modify system hosts files and does not provide a remote code loading mechanism. All scripts are bundled inside the extension package.
```

## 截图建议

- DevTools 中 API Studio 的 Network 面板。
- Replay 请求编辑器，展示请求体类型切换。
- Mock 规则列表和命中计数。
- Throttle 弱网预设配置。
- 深色模式界面。

## 提交前检查

- 使用 `bash scripts/package-chrome.sh` 生成上传包。
- 上传 `dist/chrome/api-studio-devtools-chrome.zip`。
- 确认隐私政策 URL 可以公开访问。
- 确认截图中没有真实用户数据、Cookie、Token 或公司内部接口。
- 如果商店要求数据用途声明，按“本地处理，不上传第三方服务器”填写。
