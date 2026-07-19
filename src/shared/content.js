(function() {
  'use strict';

  let ruleCache = [];
  let cacheReady = false;
  let masterEnabled = true;
  const extensionApi = ApiStudioCompat.api || chrome;
  const usesManifestMainWorld = typeof chrome !== 'undefined' && typeof browser === 'undefined';
  let domInjectLoaded = false;
  let domInjecting = false;
  let pendingStatePublish = false;
  let locatorActive = false;
  let locatorContinuous = false;
  let locatorSessionId = '';
  let locatorTarget = null;
  let locatorOverlay = null;
  let locatorLabel = null;
  let locatorStyle = null;
  let locatorPreviousCursor = '';
  let locatorVerifyOverlay = null;
  let locatorVerifyTimer = null;

  // content script 负责桥接页面上下文和扩展存储；真正改写 fetch/XHR 的逻辑在 inject.js。

  function isAbsoluteHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || ''));
  }

  function getUrlCandidates(value, options) {
    options = options || {};
    const raw = String(value || '');
    const candidates = [raw];
    try {
      const u = new URL(raw, window.location.href);
      candidates.push(u.href);
      candidates.push(u.origin + u.pathname + u.search);
      if (options.includePath !== false) {
        candidates.push(u.pathname + u.search);
      }
    } catch (e) {}
    return Array.from(new Set(candidates.filter(Boolean)));
  }

  function matchUrl(url, pattern, matchType) {
    const urls = getUrlCandidates(url);
    if (matchType === 'regex') {
      return urls.some(candidate => matchUrlValue(candidate, String(pattern || ''), matchType));
    }
    const patterns = getUrlCandidates(pattern, { includePath: !isAbsoluteHttpUrl(pattern) });
    return urls.some(candidate => patterns.some(target => matchUrlValue(candidate, target, matchType)));
  }

  function matchUrlValue(url, pattern, matchType) {
    switch (matchType) {
      case 'contains': return url.includes(pattern);
      case 'equals': return url === pattern;
      case 'startsWith': return url.startsWith(pattern);
      case 'regex':
        try { return new RegExp(pattern).test(url); }
        catch (e) { return false; }
      default: return url.includes(pattern);
    }
  }

  function getRuleScore(rule) {
    const urlRule = rule.url || {};
    const matchType = urlRule.matchType || 'contains';
    const pattern = String(urlRule.pattern || '');
    const matchTypeScore = {
      equals: 4000,
      startsWith: 3000,
      regex: 2000,
      contains: 1000
    }[matchType] || 1000;
    const methodScore = rule.method && rule.method !== 'ANY' ? 100 : 0;
    return matchTypeScore + methodScore + pattern.length;
  }

  function findRule(url, method, body) {
    method = String(method || 'GET').toUpperCase();
    let bestRule = null;
    let bestScore = -1;
    for (const rule of ruleCache) {
      if (!rule || !rule.enabled || !rule.url) continue;
      const ruleMethod = String(rule.method || 'ANY').toUpperCase();
      if (ruleMethod !== 'ANY' && ruleMethod !== method) continue;
      if (!matchUrl(url, rule.url.pattern, rule.url.matchType)) continue;
      const score = getRuleScore(rule);
      if (score > bestScore) {
        bestRule = rule;
        bestScore = score;
      }
    }
    return bestRule;
  }

  async function loadState() {
    try {
      const result = await ApiStudioCompat.storageGet(['rules', 'masterEnabled']);
      ruleCache = result.rules || [];
      masterEnabled = result.masterEnabled !== false;
      cacheReady = true;
    } catch (e) {
      ruleCache = [];
      masterEnabled = true;
      cacheReady = true;
    }
    syncMockBridge();
  }

  extensionApi.runtime.onMessage.addListener((message, sender, sendResponse) => {
    message = message || {};
    if (message.type === '__MOCK_REFRESH_RULES__') loadState();
    if (message.type === '__API_STUDIO_LOCATOR_START__') {
      startLocatorPicker(message.sessionId, message.continuous);
      if (sendResponse) sendResponse({ success: true, frameUrl: window.location.href });
      return false;
    }
    if (message.type === '__API_STUDIO_LOCATOR_STOP__') {
      stopLocatorPicker();
      if (sendResponse) sendResponse({ success: true });
      return false;
    }
    if (message.type === '__API_STUDIO_LOCATOR_VERIFY__') {
      verifySavedLocator(message);
      if (sendResponse) sendResponse({ accepted: true });
      return false;
    }
  });

  ApiStudioCompat.addStorageChangedListener((changes) => {
    let changed = false;
    if (changes.rules) {
      ruleCache = changes.rules.newValue || [];
      cacheReady = true;
      changed = true;
    }
    if (changes.masterEnabled !== undefined) {
      masterEnabled = changes.masterEnabled.newValue !== false;
      cacheReady = true;
      changed = true;
    }
    if (changed) syncMockBridge();
  });

  window.addEventListener('message', async function(event) {
    if (event.source !== window) return;
    if (event.data && event.data.type === '__MOCK_EXT_READY__') {
      if (!cacheReady) await loadState();
      else syncMockBridge();
      return;
    }
    if (event.data && event.data.type === '__MOCK_EXT_CHECK__') {
      const { requestId, url, method, body } = event.data;
      if (!cacheReady) await loadState();
      const matched = isMockActive() ? findRule(url, method, body) : null;
      if (matched) {
        try {
          var mockResponse = matched.response || {};
          var mockId = 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
          var mockHdrs = mockResponse.headers || {};
          var mockMime = mockHdrs['Content-Type'] || mockHdrs['content-type'] || 'application/json';
          var mockEntry = {
            id: mockId,
            url: url,
            method: method,
            status: mockResponse.statusCode || 200,
            statusText: 'OK',
            time: 0,
            mimeType: mockMime,
            mocked: true,
            headers: {},
            resHeaders: JSON.parse(JSON.stringify(mockHdrs)),
            postData: limitBridgeText(body, 256 * 1024),
            responseContent: limitBridgeText(mockResponse.body, 256 * 1024),
            imported: false
          };
          ApiStudioCompat.sendMessage({ type: 'RECORD_MOCK', data: mockEntry, ruleId: matched.id });
        } catch (e) {}
      }
      window.postMessage({
        type: '__MOCK_EXT_RESULT__',
        requestId: requestId,
        rule: matched ? JSON.parse(JSON.stringify(matched)) : null
      }, '*');
    }
  });

  function limitBridgeText(value, maxChars) {
    const text = String(value || '');
    return text.length > maxChars ? text.slice(0, maxChars) : text;
  }

  // Locator 只在用户主动拾取时安装事件监听，完成或取消后立即释放。
  function startLocatorPicker(sessionId, continuous) {
    stopLocatorPicker();
    locatorActive = true;
    locatorContinuous = !!continuous;
    locatorSessionId = String(sessionId || '');
    locatorPreviousCursor = document.documentElement ? document.documentElement.style.cursor : '';
    ensureLocatorOverlay();
    document.addEventListener('pointermove', onLocatorPointerMove, true);
    document.addEventListener('mousedown', suppressLocatorPointerEvent, true);
    document.addEventListener('mouseup', suppressLocatorPointerEvent, true);
    document.addEventListener('click', onLocatorClick, true);
    document.addEventListener('keydown', onLocatorKeyDown, true);
    window.addEventListener('scroll', refreshLocatorOverlay, true);
    window.addEventListener('resize', refreshLocatorOverlay, true);
    if (document.documentElement) document.documentElement.setAttribute('data-api-studio-locator-active', 'true');
  }

  function stopLocatorPicker() {
    var hadLocatorState = locatorActive || locatorOverlay || locatorLabel || locatorStyle;
    if (locatorActive) {
      document.removeEventListener('pointermove', onLocatorPointerMove, true);
      document.removeEventListener('mousedown', suppressLocatorPointerEvent, true);
      document.removeEventListener('mouseup', suppressLocatorPointerEvent, true);
      document.removeEventListener('click', onLocatorClick, true);
      document.removeEventListener('keydown', onLocatorKeyDown, true);
      window.removeEventListener('scroll', refreshLocatorOverlay, true);
      window.removeEventListener('resize', refreshLocatorOverlay, true);
    }
    locatorActive = false;
    locatorContinuous = false;
    locatorSessionId = '';
    locatorTarget = null;
    if (locatorOverlay) locatorOverlay.remove();
    if (locatorLabel) locatorLabel.remove();
    if (locatorStyle) locatorStyle.remove();
    locatorOverlay = null;
    locatorLabel = null;
    locatorStyle = null;
    if (document.documentElement && hadLocatorState) {
      document.documentElement.removeAttribute('data-api-studio-locator-active');
      document.documentElement.style.cursor = locatorPreviousCursor;
    }
    locatorPreviousCursor = '';
  }

  function ensureLocatorOverlay() {
    if (locatorOverlay && locatorLabel) return;
    var target = document.documentElement || document.body;
    if (!target) return;

    locatorOverlay = document.createElement('div');
    locatorOverlay.setAttribute('data-api-studio-locator-ui', 'overlay');
    locatorOverlay.style.cssText = [
      'all:initial',
      'position:fixed',
      'display:none',
      'pointer-events:none',
      'z-index:2147483646',
      'border:2px solid #4a90d9',
      'background:rgba(74,144,217,.12)',
      'box-sizing:border-box'
    ].join(';');

    locatorLabel = document.createElement('div');
    locatorLabel.setAttribute('data-api-studio-locator-ui', 'label');
    locatorLabel.style.cssText = [
      'all:initial',
      'position:fixed',
      'display:none',
      'max-width:360px',
      'padding:5px 8px',
      'border-radius:4px',
      'background:#1f2937',
      'color:#f9fafb',
      'font:600 12px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'white-space:nowrap',
      'overflow:hidden',
      'text-overflow:ellipsis',
      'pointer-events:none',
      'z-index:2147483647',
      'box-shadow:0 4px 14px rgba(0,0,0,.22)'
    ].join(';');

    locatorStyle = document.createElement('style');
    locatorStyle.setAttribute('data-api-studio-locator-ui', 'style');
    locatorStyle.textContent = 'html[data-api-studio-locator-active],html[data-api-studio-locator-active] *{cursor:crosshair!important;}';

    target.appendChild(locatorStyle);
    target.appendChild(locatorOverlay);
    target.appendChild(locatorLabel);
  }

  function onLocatorPointerMove(event) {
    if (!locatorActive) return;
    var target = locatorPreferredElement(locatorEventElement(event));
    if (!target || isLocatorUi(target) || target === locatorTarget) return;
    locatorTarget = target;
    refreshLocatorOverlay();
  }

  function suppressLocatorPointerEvent(event) {
    if (!locatorActive || isLocatorUi(locatorEventElement(event))) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
  }

  function onLocatorClick(event) {
    if (!locatorActive) return;
    var target = locatorPreferredElement(locatorEventElement(event) || locatorTarget);
    if (!target || isLocatorUi(target)) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();

    var sessionId = locatorSessionId;
    var continuous = locatorContinuous;
    try {
      if (!globalThis.ApiStudioLocatorEngine) throw new Error('LOCATOR_ENGINE_MISSING');
      var result = globalThis.ApiStudioLocatorEngine.inspect(target);
      result.sessionId = sessionId;
      result.continuous = continuous;
      ApiStudioCompat.sendMessage({
        type: '__API_STUDIO_LOCATOR_PICKED__',
        sessionId: sessionId,
        data: result
      }).catch(function() {});
    } catch (error) {
      ApiStudioCompat.sendMessage({
        type: '__API_STUDIO_LOCATOR_ERROR__',
        sessionId: sessionId,
        message: String(error && error.message || error)
      }).catch(function() {});
    }

    if (!continuous) stopLocatorPicker();
  }

  function onLocatorKeyDown(event) {
    if (!locatorActive || event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    var sessionId = locatorSessionId;
    stopLocatorPicker();
    ApiStudioCompat.sendMessage({
      type: '__API_STUDIO_LOCATOR_CANCELLED__',
      sessionId: sessionId
    }).catch(function() {});
  }

  function refreshLocatorOverlay() {
    if (!locatorActive || !locatorTarget) return;
    ensureLocatorOverlay();
    if (!locatorOverlay || !locatorLabel) return;
    var rect;
    try { rect = locatorTarget.getBoundingClientRect(); }
    catch (error) { return; }
    if (!rect || rect.width < 0 || rect.height < 0) return;

    locatorOverlay.style.display = 'block';
    locatorOverlay.style.left = Math.max(0, rect.left) + 'px';
    locatorOverlay.style.top = Math.max(0, rect.top) + 'px';
    locatorOverlay.style.width = Math.max(1, rect.width) + 'px';
    locatorOverlay.style.height = Math.max(1, rect.height) + 'px';

    locatorLabel.textContent = locatorElementPreview(locatorTarget);
    locatorLabel.style.display = 'block';
    locatorLabel.style.left = Math.max(4, Math.min(rect.left, window.innerWidth - 364)) + 'px';
    locatorLabel.style.top = Math.max(4, rect.top >= 32 ? rect.top - 30 : rect.bottom + 6) + 'px';
  }

  function locatorEventElement(event) {
    if (!event) return null;
    if (typeof event.composedPath === 'function') {
      var path = event.composedPath();
      for (var i = 0; i < path.length; i++) {
        if (path[i] && path[i].nodeType === 1) return path[i];
      }
    }
    return event.target && event.target.nodeType === 1 ? event.target : null;
  }

  function isLocatorUi(element) {
    return !!(element && element.getAttribute && element.getAttribute('data-api-studio-locator-ui'));
  }

  function locatorPreferredElement(element) {
    var engine = globalThis.ApiStudioLocatorEngine;
    if (!element || !engine || typeof engine.resolveTarget !== 'function') return element;
    try { return engine.resolveTarget(element) || element; }
    catch (error) { return element; }
  }

  function locatorElementPreview(element) {
    var tag = String(element && (element.localName || element.tagName) || '').toLowerCase();
    var id = safeLocatorAttribute(element, 'id');
    var name = safeLocatorAttribute(element, 'name');
    var type = safeLocatorAttribute(element, 'type');
    var label = safeLocatorAttribute(element, 'aria-label') || safeLocatorAttribute(element, 'placeholder');
    var preview = '<' + tag + (id ? '#' + id : '') + (name ? '[name=' + name + ']' : '') + (type ? '[type=' + type + ']' : '') + '>';
    return label ? preview + '  ' + label.slice(0, 80) : preview;
  }

  function safeLocatorAttribute(element, name) {
    try { return String(element.getAttribute(name) || '').trim().slice(0, 80); }
    catch (error) { return ''; }
  }

  // 每个 frame 都会收到验证消息，只由采集上下文匹配的 frame 回传成功结果。
  function verifySavedLocator(message) {
    var item = message && message.data;
    var requestId = String(message && message.requestId || '');
    if (!requestId || !item || typeof item !== 'object' || !matchesLocatorFrame(item)) return;

    var match = findSavedLocatorElement(item);
    if (!match) return;
    highlightVerifiedLocator(match);
    ApiStudioCompat.sendMessage({
      type: '__API_STUDIO_LOCATOR_VERIFIED__',
      requestId: requestId,
      locatorId: String(item.id || ''),
      success: true
    }).catch(function() {});
  }

  function matchesLocatorFrame(item) {
    var expected = item.frame && typeof item.frame === 'object' ? item.frame : {};
    var expectedChain = Array.isArray(expected.chain) ? expected.chain : [];
    var isTopFrame = false;
    try { isTopFrame = window.top === window; }
    catch (error) { isTopFrame = false; }
    if ((expected.isTopFrame !== false) !== isTopFrame) return false;
    if (isTopFrame) return true;

    var expectedDepth = Number(expected.depth || expectedChain.length || 1);
    if (expectedDepth > 0 && getCurrentFrameDepth() !== expectedDepth) return false;
    var currentExpectedFrame = expectedChain.length ? expectedChain[expectedChain.length - 1] : expected;
    var expectedUrl = String(currentExpectedFrame.url || expected.url || item.pageUrl || '');
    if (expectedUrl && !sameLocatorDocumentUrl(expectedUrl, window.location.href)) return false;
    var expectedName = String(currentExpectedFrame.name || expected.name || '');
    if (expectedName && window.name && expectedName !== window.name) return false;
    return true;
  }

  function getCurrentFrameDepth() {
    var depth = 0;
    var current = window;
    while (current && depth < 8) {
      try {
        if (current === current.top) break;
        current = current.parent;
        depth++;
      } catch (error) {
        depth++;
        break;
      }
    }
    return depth;
  }

  function sameLocatorDocumentUrl(left, right) {
    try {
      var leftUrl = new URL(left);
      var rightUrl = new URL(right);
      return leftUrl.origin === rightUrl.origin && leftUrl.pathname === rightUrl.pathname && leftUrl.search === rightUrl.search;
    } catch (error) {
      return String(left || '').split('#')[0] === String(right || '').split('#')[0];
    }
  }

  function findSavedLocatorElement(item) {
    var shadow = item.shadow && typeof item.shadow === 'object' ? item.shadow : {};
    var hosts = Array.isArray(shadow.hosts) ? shadow.hosts : [];
    if (hosts.length) {
      var root = document;
      for (var i = 0; i < hosts.length; i++) {
        var host = findUniqueLocatorCss(root, hosts[i] && hosts[i].css);
        if (!host || !host.shadowRoot) return null;
        root = host.shadowRoot;
      }
      return findUniqueLocatorCss(root, shadow.localCss || item.css);
    }

    var selector = String(item.recommended || item.css || item.xpath || '');
    var type = item.recommended ? item.recommendedType : (item.css ? 'css' : 'xpath');
    return type === 'xpath' ? findUniqueLocatorXPath(document, selector) : findUniqueLocatorCss(document, selector);
  }

  function findUniqueLocatorCss(root, selector) {
    if (!root || !selector || typeof root.querySelectorAll !== 'function') return null;
    try {
      var matches = root.querySelectorAll(String(selector));
      return matches.length === 1 ? matches[0] : null;
    } catch (error) {
      return null;
    }
  }

  function findUniqueLocatorXPath(doc, selector) {
    if (!doc || !selector || typeof doc.evaluate !== 'function') return null;
    try {
      var result = doc.evaluate(String(selector), doc, null, 7, null);
      return result.snapshotLength === 1 ? result.snapshotItem(0) : null;
    } catch (error) {
      return null;
    }
  }

  function highlightVerifiedLocator(element) {
    clearLocatorVerifyOverlay();
    if (!element || typeof element.getBoundingClientRect !== 'function') return;
    try { element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }); }
    catch (error) {}

    locatorVerifyOverlay = document.createElement('div');
    locatorVerifyOverlay.setAttribute('data-api-studio-locator-ui', 'verified');
    locatorVerifyOverlay.style.cssText = [
      'all:initial',
      'position:fixed',
      'pointer-events:none',
      'z-index:2147483647',
      'border:3px solid #16a34a',
      'background:rgba(22,163,74,.14)',
      'box-shadow:0 0 0 4px rgba(22,163,74,.16)',
      'box-sizing:border-box',
      'transition:opacity .2s ease'
    ].join(';');
    (document.documentElement || document.body).appendChild(locatorVerifyOverlay);

    var positionOverlay = function() {
      if (!locatorVerifyOverlay) return;
      var rect;
      try { rect = element.getBoundingClientRect(); }
      catch (error) { return; }
      locatorVerifyOverlay.style.left = Math.max(0, rect.left) + 'px';
      locatorVerifyOverlay.style.top = Math.max(0, rect.top) + 'px';
      locatorVerifyOverlay.style.width = Math.max(1, rect.width) + 'px';
      locatorVerifyOverlay.style.height = Math.max(1, rect.height) + 'px';
    };
    positionOverlay();
    setTimeout(positionOverlay, 180);
    locatorVerifyTimer = setTimeout(clearLocatorVerifyOverlay, 1500);
  }

  function clearLocatorVerifyOverlay() {
    if (locatorVerifyTimer) clearTimeout(locatorVerifyTimer);
    locatorVerifyTimer = null;
    if (locatorVerifyOverlay) locatorVerifyOverlay.remove();
    locatorVerifyOverlay = null;
  }

  window.addEventListener('pagehide', function() {
    stopLocatorPicker();
    clearLocatorVerifyOverlay();
  });

  function hasEnabledRules() {
    return ruleCache.some(function(rule) {
      return rule && rule.enabled;
    });
  }

  function isMockActive() {
    return masterEnabled && hasEnabledRules();
  }

  function publishMockState() {
    const active = isMockActive();
    window.postMessage({
      type: '__MOCK_EXT_STATE__',
      active: active,
      rules: active ? buildRuleIndex() : []
    }, '*');
  }

  function buildRuleIndex() {
    return ruleCache.filter(function(rule) {
      return rule && rule.enabled && rule.url;
    }).map(function(rule) {
      return {
        method: String(rule.method || 'ANY').toUpperCase(),
        url: {
          pattern: String(rule.url.pattern || ''),
          matchType: rule.url.matchType || 'contains'
        }
      };
    });
  }

  function syncMockBridge() {
    if (usesManifestMainWorld || !isMockActive()) {
      publishMockState();
      return;
    }
    injectScript();
  }

  function injectScript() {
    // Chrome 通过 manifest 的 MAIN world 注入；Firefox 只有需要 Mock 时才走 DOM script fallback。
    if (domInjectLoaded) {
      publishMockState();
      return;
    }
    if (domInjecting) {
      pendingStatePublish = true;
      return;
    }
    domInjecting = true;
    try {
      const target = document.documentElement || document.head || document.body;
      if (!target) {
        domInjecting = false;
        setTimeout(injectScript, 50);
        return;
      }
      const script = document.createElement('script');
      script.src = ApiStudioCompat.getURL('inject.js');
      script.onload = function() {
        domInjectLoaded = true;
        domInjecting = false;
        this.remove();
        publishMockState();
        if (pendingStatePublish) {
          pendingStatePublish = false;
          publishMockState();
        }
      };
      script.onerror = function() {
        domInjecting = false;
        pendingStatePublish = false;
        this.remove();
      };
      target.appendChild(script);
    } catch (e) {
      domInjecting = false;
      setTimeout(function() {
        injectScript();
      }, 50);
    }
  }

  loadState();
})();
