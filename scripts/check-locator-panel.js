const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const chromeExecutable = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const css = fs.readFileSync(path.resolve(__dirname, '../src/shared/devtools-panel.css'), 'utf8');

function candidate(rank, rankClass, strategy, score, selector, baseScore, penalty) {
  return `
    <section class="locator-candidate locator-candidate-${rankClass}">
      <div class="locator-candidate-head">
        <span class="locator-rank locator-rank-${rankClass}">${rank}</span>
        <span class="locator-strategy">XPATH · ${strategy}</span>
        <span class="locator-confidence low">低稳定性</span>
        <span class="locator-score">${score} 分</span>
      </div>
      <div class="locator-code-wrap">
        <code class="locator-code">${selector}</code>
        <button class="btn btn-secondary locator-copy-btn" type="button">⧉</button>
      </div>
      <div class="locator-candidate-reason">基础条件重复，通过同一容器内的稳定关联元素消除歧义。</div>
      <div class="locator-candidate-proof">基础条件命中 3 个元素；结合 tr 容器内的唯一关联元素后唯一命中当前选中元素。基础分 ${baseScore} - 组合依赖 ${penalty} = ${score} 分。</div>
    </section>`;
}

function fixture() {
  const selector = "//tr[.//a[@href='/campaign?id=2']]//sup[contains(concat(' ', normalize-space(@class), ' '), ' result-badge ')]";
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${css}</style></head>
    <body><div id="app"><div class="tab-content active" id="tabLocator"><div class="locator-shell">
      <div class="locator-toolbar"><div class="locator-toolbar-left"><button class="btn btn-primary locator-pick-btn">拾取元素</button><span class="locator-status-dot"></span><span class="locator-status">已获取 &lt;sup&gt; 的稳定定位。</span></div><div class="locator-toolbar-right"><button class="btn btn-sm">清空</button></div></div>
      <div class="locator-tools"><div class="locator-search-wrap"><span class="locator-search-icon">⌕</span><input class="form-input locator-search" placeholder="搜索元素、页面或定位"></div><span class="locator-count">1 / 1</span><select class="form-select form-select-sm locator-language"><option>Selenium · Python</option></select></div>
      <div class="locator-note">只生成经过唯一性验证的稳定定位；不会生成 nth-child、绝对数字 XPath 或屏幕坐标。</div>
      <div class="locator-table-scroll"><table class="locator-table"><thead><tr><th class="locator-col-element">元素</th><th class="locator-col-recommended">定位推荐</th><th class="locator-col-context">上下文</th><th class="locator-col-actions">操作</th></tr></thead>
      <tbody><tr><td class="locator-col-element"><div class="locator-element-name">&lt;sup&gt; · 4</div><div class="locator-element-meta">example.test/campaigns</div></td>
      <td class="locator-col-recommended"><div class="locator-candidate-list">
        ${candidate('最优', 0, '精确文本', 35, "//tr[.//a[@href='/campaign?id=2']]//sup[normalize-space(.)='4']", 52, 17)}
        ${candidate('备选', 1, '稳定 Class', 29, selector, 46, 17)}
        ${candidate('兜底', 2, '唯一标签', 1, "//tr[.//a[@href='/campaign?id=2']]//sup", 10, 9)}
      </div></td><td class="locator-col-context"><div class="locator-context-list"><span class="locator-context-badge">顶层页面</span></div></td>
      <td class="locator-col-actions"><div class="locator-row-actions"><button class="btn btn-secondary btn-sm">验证</button><button class="btn btn-secondary btn-sm">复制代码</button><button class="btn btn-secondary btn-sm">删除</button></div></td></tr></tbody></table></div>
    </div></div></div></body></html>`;
}

async function verifyViewport(page, viewport, screenshotPath) {
  await page.setViewportSize(viewport);
  await page.setContent(fixture(), { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('.locator-candidate').count(), 3, 'three ranked candidates should render');
  assert.deepEqual(await page.locator('.locator-rank').allTextContents(), ['最优', '备选', '兜底']);
  const actions = await page.locator('td.locator-col-actions').boundingBox();
  assert.ok(actions && actions.x >= 0 && actions.x + actions.width <= viewport.width + 1, 'sticky actions must remain visible');
  const overlaps = await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('.locator-candidate'));
    return candidates.some((item, index) => {
      const next = candidates[index + 1];
      return next ? item.getBoundingClientRect().bottom > next.getBoundingClientRect().top : false;
    });
  });
  assert.equal(overlaps, false, 'ranked candidates must not overlap');
  await page.screenshot({ path: screenshotPath, fullPage: true });
}

async function run() {
  const browser = await chromium.launch({ executablePath: chromeExecutable, headless: true });
  try {
    const page = await browser.newPage();
    await verifyViewport(page, { width: 1440, height: 900 }, '/tmp/api-studio-locator-wide.png');
    await verifyViewport(page, { width: 700, height: 900 }, '/tmp/api-studio-locator-narrow.png');
  } finally {
    await browser.close();
  }
  console.log('Locator panel checks passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
