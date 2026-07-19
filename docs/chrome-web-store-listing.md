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
在 DevTools 中捕获、重放和 Mock API 请求，并为 Selenium 生成稳定的 CSS/XPath 元素定位。
```

## 详细描述

```text
API Studio DevTools 是一款面向前端开发和测试场景的浏览器 DevTools 扩展。它会在开发者工具中新增 API Studio 面板，帮助你在当前页面内观察接口请求、重放请求、创建本地 Mock 规则，并分析埋点与 Cookie。

主要能力：
- Network：捕获页面请求，查看 URL、Method、Status、Headers、Cookie、耗时和响应体。
- Replay：保存请求并重新发送，支持 raw、x-www-form-urlencoded、multipart/form-data 和文件上传。
- Mock：从真实请求快速生成本地 Mock 规则，支持分组、启停和命中计数。
- Beacon：分析埋点上报请求，支持嵌套字段和重复 key 匹配。
- Cookies：查看请求 Cookie 和响应 Set-Cookie，便于调试登录态与会话问题。
- Locator：在页面中拾取元素，综合属性、class、文本和上下文生成“最优、备选、兜底”三档唯一定位，展示命中依据与稳定性评分；支持重新验证、高亮目标和复制 Python、Java、JavaScript Selenium 代码，并兼容嵌套 iframe 与 Shadow DOM。
- Theme：支持自动、浅色、深色主题切换。

数据处理说明：
扩展默认只在浏览器本地处理和保存调试数据。Mock 规则、Replay 历史、Cookie 调试信息和主题偏好保存在浏览器本地存储中，不会上传到第三方服务器。
```

## 权限用途说明

### `storage`

用于在浏览器本地保存 Mock 规则、Replay 历史、Locator 定位历史、分组、命中计数、主题偏好等开发调试数据。

### `host_permissions: <all_urls>`

用于在 DevTools 调试当前页面时捕获和模拟不同域名下的 API 请求，并在用户主动开启 Locator 拾取后读取被点击元素的稳定定位属性。由于前端开发常常涉及本地服务、测试环境、预发环境和生产域名，扩展需要覆盖这些请求来源。该权限不会修改系统 hosts 文件，也不会把请求数据或元素定位上传到外部服务。

### DevTools 面板

扩展功能主要运行在浏览器 DevTools 面板内，不提供独立 popup 页面。用户打开 DevTools 后，在 API Studio tab 中使用相关能力。

## 审核备注草稿

```text
API Studio DevTools is a developer tool extension. It adds a DevTools panel for inspecting and replaying API requests, creating local mock rules, debugging cookies or analytics beacons, and generating stable CSS/XPath locators for Selenium tests.

The extension requests <all_urls> host permissions because developers need to debug API traffic and explicitly pick DOM elements across local, staging, and production domains from the currently inspected page. Locator mode is activated by the user, does not read input values, and removes its event listeners after picking or cancellation. Request and locator data is processed locally in the browser and is not sent to any external server by this extension.

The extension does not modify system hosts files and does not provide a remote code loading mechanism. All scripts are bundled inside the extension package.
```

## 截图建议

- DevTools 中 API Studio 的 Network 面板。
- Replay 请求编辑器，展示请求体类型切换。
- Mock 规则列表和命中计数。
- Locator 元素高亮与“最优、备选、兜底”定位推荐结果。
- 深色模式界面。

## 提交前检查

- 使用 `bash scripts/package-chrome.sh` 生成上传包。
- 上传 `chrome-extension/api-studio-devtools-chrome.zip`。
- 确认隐私政策 URL 可以公开访问。
- 确认截图中没有真实用户数据、Cookie、Token 或公司内部接口。
- 如果商店要求数据用途声明，按“本地处理，不上传第三方服务器”填写。
- 如果截图来自本地测试站，确认只展示演示数据。
