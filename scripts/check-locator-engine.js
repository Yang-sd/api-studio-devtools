const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

const projectRoot = path.resolve(__dirname, '..');
const chromeExecutable = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function inspect(page, selector) {
  return page.locator(selector).evaluate((element) => globalThis.ApiStudioLocatorEngine.inspect(element));
}

function assertValidAlternatives(result, minimum) {
  assert.ok(Array.isArray(result.alternatives), 'alternatives should be an array');
  assert.ok(result.alternatives.length >= minimum, `expected at least ${minimum} alternatives`);
  assert.equal(result.recommended, result.alternatives[0].selector, 'top candidate must drive recommended');
  assert.equal(result.recommendedType, result.alternatives[0].type, 'top candidate type must drive recommendedType');
  result.alternatives.forEach((candidate) => {
    assert.equal(candidate.unique, true, 'every candidate must be unique');
    assert.equal(candidate.matchCount, 1, 'every candidate must match exactly once');
    assert.ok(!candidate.selector.includes('nth-child'), 'nth-child is forbidden');
    assert.ok(!/^\/html|^\/body/.test(candidate.selector), 'absolute XPath is forbidden');
  });
}

async function run() {
  const browser = await chromium.launch({ executablePath: chromeExecutable, headless: true });
  const page = await browser.newPage();
  await page.setContent(`
    <main>
      <button id="save-button" data-testid="save-order" name="saveOrder">Save</button>
      <section id="badge-case"><sup class="jad-badge-content jad-badge-large">7</sup></section>
      <table>
        <tbody>
          <tr><td><a href="/campaign?id=1">Campaign</a></td><td><sup class="result-badge">4</sup></td></tr>
          <tr><td><a href="/campaign?id=2">Campaign</a></td><td><sup class="result-badge">4</sup></td></tr>
          <tr><td><a href="/campaign?id=3">Campaign</a></td><td><sup class="result-badge">4</sup></td></tr>
        </tbody>
      </table>
      <button id="translated-action"><span class="action-label"><font dir="auto" style="vertical-align: inherit;"><font dir="auto" style="vertical-align: inherit;">Submit</font></font></span></button>
      <div id="shadow-host"></div>
    </main>
  `);
  await page.addScriptTag({ path: path.join(projectRoot, 'src/shared/locator-engine.js') });
  await page.addScriptTag({ path: path.join(projectRoot, 'src/shared/selenium-codegen.js') });

  const dedicatedAttribute = await inspect(page, '[data-testid="save-order"]');
  assertValidAlternatives(dedicatedAttribute, 3);
  assert.equal(dedicatedAttribute.alternatives[0].strategy, 'data-testid');
  assert.equal(dedicatedAttribute.alternatives[0].score, 100);

  const badge = await inspect(page, '#badge-case sup');
  assertValidAlternatives(badge, 3);
  assert.ok(badge.alternatives.some((candidate) => candidate.strategy === 'text'));
  assert.ok(badge.alternatives.some((candidate) => candidate.strategy === 'stable-class'));

  const repeated = await inspect(page, 'tr:nth-child(2) .result-badge');
  assertValidAlternatives(repeated, 3);
  const contextual = repeated.alternatives.find((candidate) => candidate.reasonCode === 'contextual');
  assert.ok(contextual, 'repeated selector should be resolved with a contextual candidate');
  assert.ok(contextual.baseMatchCount >= 3, 'the base selector should expose its repeated match count');
  assert.ok(contextual.anchorSelector.includes("href='/campaign?id=2'"), 'the unique link should be used as context');
  assert.ok(contextual.penalty > 0, 'context dependency should reduce the score');

  const translated = await inspect(page, '#translated-action font font');
  assertValidAlternatives(translated, 1);
  assert.equal(translated.tagName, 'button', 'translated text should resolve to the actionable ancestor');

  const selenium = await page.evaluate((locator) => {
    return globalThis.ApiStudioSeleniumCodegen.generate(locator, 'python');
  }, repeated);
  const escapedRecommended = repeated.recommended.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  assert.ok(selenium.code.includes(escapedRecommended), 'Selenium must use the top-ranked locator');

  const shadow = await page.evaluate(() => {
    const host = document.getElementById('shadow-host');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<button name="shadowSave">Shadow save</button>';
    return globalThis.ApiStudioLocatorEngine.inspect(root.querySelector('button'));
  });
  assertValidAlternatives(shadow, 1);
  assert.ok(shadow.shadow.hosts.length === 1, 'Shadow DOM host chain should be preserved');
  assert.ok(shadow.alternatives.every((candidate) => candidate.type === 'css'), 'global XPath must not be emitted inside Shadow DOM');

  await page.evaluate(() => {
    const outer = document.createElement('iframe');
    outer.id = 'outer-frame';
    outer.srcdoc = '<iframe id="inner-frame" srcdoc="<button name=&quot;frameSave&quot;>Frame save</button>"></iframe>';
    document.body.appendChild(outer);
  });
  await page.waitForFunction(() => document.querySelector('iframe') && document.querySelector('iframe').contentDocument && document.querySelector('iframe').contentDocument.querySelector('iframe'));
  const innerFrame = page.frames().find((frame) => frame.parentFrame() && frame.parentFrame().parentFrame());
  assert.ok(innerFrame, 'nested iframe should be available');
  await innerFrame.addScriptTag({ path: path.join(projectRoot, 'src/shared/locator-engine.js') });
  await innerFrame.addScriptTag({ path: path.join(projectRoot, 'src/shared/selenium-codegen.js') });
  const nestedFrame = await innerFrame.locator('button').evaluate((element) => globalThis.ApiStudioLocatorEngine.inspect(element));
  assertValidAlternatives(nestedFrame, 3);
  assert.equal(nestedFrame.frame.depth, 2, 'nested iframe depth should be preserved');
  assert.equal(nestedFrame.frame.chain.length, 2, 'both iframe locators should be preserved');
  assert.ok(nestedFrame.frame.chain.every((frame) => frame.css || frame.xpath), 'every accessible iframe should have a locator');
  const nestedSelenium = await innerFrame.evaluate((locator) => globalThis.ApiStudioSeleniumCodegen.generate(locator, 'python'), nestedFrame);
  assert.equal((nestedSelenium.code.match(/switch_to\.frame/g) || []).length, 2, 'Selenium should switch through both iframe levels');

  await browser.close();
  console.log('Locator engine checks passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
