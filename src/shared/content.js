(function() {
  'use strict';

  let ruleCache = [];
  let cacheReady = false;
  let masterEnabled = true;
  const extensionApi = ApiStudioCompat.api || chrome;

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
    method = method.toUpperCase();
    let bestRule = null;
    let bestScore = -1;
    for (const rule of ruleCache) {
      if (!rule.enabled) continue;
      if (rule.method !== 'ANY' && rule.method !== method) continue;
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
  }

  extensionApi.runtime.onMessage.addListener((message) => {
    if (message.type === '__MOCK_REFRESH_RULES__') loadState();
  });

  ApiStudioCompat.addStorageChangedListener((changes) => {
    if (changes.rules) ruleCache = changes.rules.newValue || [];
    if (changes.masterEnabled !== undefined) masterEnabled = changes.masterEnabled.newValue !== false;
  });

  window.addEventListener('message', async function(event) {
    if (event.data && event.data.type === '__MOCK_EXT_CHECK__') {
      const { requestId, url, method, body } = event.data;
      if (!cacheReady) await loadState();
      const matched = masterEnabled ? findRule(url, method, body) : null;
      if (matched) {
        incrementHitCount(matched.id).catch(function(){});
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
            postData: body || '',
            responseContent: mockResponse.body || '',
            imported: false
          };
          ApiStudioCompat.sendMessage({ type: 'RECORD_MOCK', data: mockEntry });
        } catch (e) {}
      }
      window.postMessage({
        type: '__MOCK_EXT_RESULT__',
        requestId: requestId,
        rule: matched ? JSON.parse(JSON.stringify(matched)) : null
      }, '*');
    }
  });

  async function incrementHitCount(ruleId) {
    const result = await ApiStudioCompat.storageGet('ruleHits');
    const hits = result.ruleHits || {};
    hits[ruleId] = (hits[ruleId] || 0) + 1;
    await ApiStudioCompat.storageSet({ ruleHits: hits });
  }

  function injectScript() {
    // Chrome 可以通过 MAIN world 直接注入；Firefox 走 DOM script fallback，保持同一套业务逻辑。
    try {
      if (window.__API_STUDIO_INJECT_FALLBACK_SCHEDULED__) return;
      window.__API_STUDIO_INJECT_FALLBACK_SCHEDULED__ = true;
      const script = document.createElement('script');
      script.src = ApiStudioCompat.getURL('inject.js');
      script.onload = function() { this.remove(); };
      (document.documentElement || document.head || document.body).appendChild(script);
    } catch (e) {
      setTimeout(function() {
        try {
          const script = document.createElement('script');
          script.src = ApiStudioCompat.getURL('inject.js');
          script.onload = function() { this.remove(); };
          document.documentElement.appendChild(script);
        } catch (e2) {}
      }, 50);
    }
  }

  injectScript();
  loadState();
})();
