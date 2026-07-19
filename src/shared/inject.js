(function() {
  'use strict';

  const INJECT_VERSION = '2026-06-22-mock-fast-path-v3';
  if (window.__API_STUDIO_MOCK_INJECTED_VERSION__ === INJECT_VERSION) return;
  window.__API_STUDIO_MOCK_INJECTED__ = true;
  window.__API_STUDIO_MOCK_INJECTED_VERSION__ = INJECT_VERSION;

  // inject.js 运行在页面上下文；只有 Mock 激活时才临时挂钩 fetch/XHR。
  let mockActive = false;
  let ruleIndex = [];
  let requestIdCounter = 0;
  const pendingRequests = new Map();

  let hooksInstalled = false;
  let originalFetch = null;
  let XHR = null;
  let origOpen = null;
  let origSend = null;
  let origSetRH = null;

  window.addEventListener('message', function(event) {
    if (event.source !== window || !event.data) return;
    if (event.data.type === '__MOCK_EXT_STATE__') {
      applyMockState(event.data.active, event.data.rules);
      return;
    }
    if (event.data.type === '__MOCK_EXT_RESULT__') {
      const pending = pendingRequests.get(event.data.requestId);
      if (pending) {
        clearTimeout(pending.timer);
        pendingRequests.delete(event.data.requestId);
        pending.resolve({ rule: event.data.rule || null });
      }
    }
  });

  window.postMessage({
    type: '__MOCK_EXT_READY__',
    version: INJECT_VERSION
  }, '*');

  function applyMockState(active, rules) {
    ruleIndex = normalizeRuleIndex(rules);
    mockActive = !!active && ruleIndex.length > 0;
    if (mockActive) {
      installHooks();
      return;
    }
    resolvePendingAsPassThrough();
    uninstallHooks();
  }

  function normalizeRuleIndex(rules) {
    return (rules || []).map(function(rule) {
      const urlRule = rule && rule.url ? rule.url : {};
      const matchType = urlRule.matchType || 'contains';
      const pattern = String(urlRule.pattern || '');
      return {
        method: String(rule && rule.method ? rule.method : 'ANY').toUpperCase(),
        pattern: pattern,
        matchType: matchType,
        regex: matchType === 'regex' ? safeRegExp(pattern) : null
      };
    }).filter(function(rule) {
      return rule.pattern;
    });
  }

  function installHooks() {
    if (hooksInstalled) return;

    let installed = false;
    if (typeof window.fetch === 'function') {
      originalFetch = window.fetch;
      window.fetch = mockFetch;
      installed = true;
    }

    XHR = window.XMLHttpRequest;
    if (XHR && XHR.prototype) {
      origOpen = XHR.prototype.open;
      origSend = XHR.prototype.send;
      origSetRH = XHR.prototype.setRequestHeader;
      XHR.prototype.open = mockXhrOpen;
      XHR.prototype.send = mockXhrSend;
      XHR.prototype.setRequestHeader = mockXhrSetRequestHeader;
      installed = true;
    }

    hooksInstalled = installed;
  }

  function uninstallHooks() {
    if (!hooksInstalled) return;

    if (originalFetch && window.fetch === mockFetch) {
      window.fetch = originalFetch;
    }
    if (XHR && XHR.prototype) {
      if (origOpen && XHR.prototype.open === mockXhrOpen) XHR.prototype.open = origOpen;
      if (origSend && XHR.prototype.send === mockXhrSend) XHR.prototype.send = origSend;
      if (origSetRH && XHR.prototype.setRequestHeader === mockXhrSetRequestHeader) {
        XHR.prototype.setRequestHeader = origSetRH;
      }
    }

    hooksInstalled = false;
    originalFetch = null;
    XHR = null;
    origOpen = null;
    origSend = null;
    origSetRH = null;
  }

  function resolvePendingAsPassThrough() {
    pendingRequests.forEach(function(pending) {
      clearTimeout(pending.timer);
      pending.resolve({ rule: null });
    });
    pendingRequests.clear();
  }

  function queryRule(url, method, body) {
    return new Promise(function(resolve) {
      if (!mockActive) {
        resolve({ rule: null });
        return;
      }

      const requestId = 'req_' + (++requestIdCounter) + '_' + Date.now();
      const timer = setTimeout(function() {
        const pending = pendingRequests.get(requestId);
        if (pending) {
          pendingRequests.delete(requestId);
          pending.resolve({ rule: null });
        }
      }, 500);

      pendingRequests.set(requestId, { resolve: resolve, timer: timer });
      try {
        window.postMessage({
          type: '__MOCK_EXT_CHECK__',
          requestId: requestId,
          url: normalizeUrl(url),
          method: method,
          body: body || ''
        }, '*');
      } catch (e) {
        clearTimeout(timer);
        pendingRequests.delete(requestId);
        resolve({ rule: null });
      }
    });
  }

  function normalizeUrl(url) {
    try {
      return new URL(String(url || ''), window.location.href).href;
    } catch (e) {
      return String(url || '');
    }
  }

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
      if (options.includePath !== false) candidates.push(u.pathname + u.search);
    } catch (e) {}
    return Array.from(new Set(candidates.filter(Boolean)));
  }

  function safeRegExp(pattern) {
    try {
      return new RegExp(pattern);
    } catch (e) {
      return null;
    }
  }

  function matchUrlValue(url, rule) {
    switch (rule.matchType) {
      case 'contains': return url.includes(rule.pattern);
      case 'equals': return url === rule.pattern;
      case 'startsWith': return url.startsWith(rule.pattern);
      case 'regex': return !!rule.regex && rule.regex.test(url);
      default: return url.includes(rule.pattern);
    }
  }

  function shouldQueryMock(url, method) {
    if (!mockActive || ruleIndex.length === 0) return false;
    method = String(method || 'GET').toUpperCase();
    const urls = getUrlCandidates(url);
    return ruleIndex.some(function(rule) {
      if (rule.method !== 'ANY' && rule.method !== method) return false;
      if (rule.matchType === 'regex') {
        return urls.some(function(candidate) {
          return matchUrlValue(candidate, rule);
        });
      }
      const patterns = getUrlCandidates(rule.pattern, { includePath: !isAbsoluteHttpUrl(rule.pattern) });
      return urls.some(function(candidate) {
        return patterns.some(function(pattern) {
          return matchUrlValue(candidate, Object.assign({}, rule, { pattern: pattern }));
        });
      });
    });
  }

  function delay(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }

  function getCheapBodyText(body) {
    if (typeof body === 'string') return body;
    if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) return body.toString();
    return '';
  }

  async function mockFetch(input, init) {
    if (!originalFetch) throw new TypeError('fetch is not available');
    if (!mockActive) return originalFetch.apply(window, arguments);

    let url = '';
    let method = 'GET';
    let bodyText = '';

    if (typeof input === 'string') {
      url = input;
    } else if (typeof Request !== 'undefined' && input instanceof Request) {
      url = input.url;
      method = input.method || 'GET';
    } else if (input && typeof input === 'object') {
      url = input.url || '';
    }

    if (init) {
      if (init.method) method = String(init.method).toUpperCase();
    }

    if (!shouldQueryMock(url, method)) return originalFetch.apply(window, arguments);
    if (init && init.body) bodyText = getCheapBodyText(init.body);

    let result;
    try {
      result = await queryRule(url, method, bodyText);
    } catch (e) {
      return originalFetch.apply(window, arguments);
    }

    if (!mockActive) return originalFetch.apply(window, arguments);

    const rule = result && result.rule;
    if (rule) {
      const response = rule.response || {};
      if (rule.delay > 0) await delay(rule.delay);
      return new Response(response.body || '', {
        status: response.statusCode || 200,
        statusText: 'OK',
        headers: new Headers(response.headers || { 'Content-Type': 'application/json' })
      });
    }
    return originalFetch.apply(window, arguments);
  }

  function mockXhrOpen(method, url, async, user, password) {
    this.__method = String(method || 'GET').toUpperCase();
    this.__url = typeof url === 'string' ? url : String(url || '');
    this.__async = async !== false;
    this.__headers = {};
    this.__body = null;
    return origOpen.apply(this, arguments);
  }

  function mockXhrSetRequestHeader(name, value) {
    if (this.__headers) this.__headers[name] = value;
    return origSetRH.apply(this, arguments);
  }

  async function mockXhrSend(body) {
    if (!origSend) return;
    if (!mockActive) return origSend.apply(this, arguments);

    this.__body = body || '';
    if (!shouldQueryMock(this.__url, this.__method)) return origSend.apply(this, arguments);
    const bodyText = getCheapBodyText(body);

    let result;
    try {
      result = await queryRule(this.__url, this.__method, bodyText);
    } catch (e) {
      return origSend.apply(this, arguments);
    }

    if (!mockActive) return origSend.apply(this, arguments);

    const rule = result && result.rule;
    if (rule) {
      const response = rule.response || {};
      if (rule.delay > 0) await delay(rule.delay);

      const statusCode = response.statusCode || 200;
      const responseBody = response.body || '';
      const xhr = this;
      try {
        Object.defineProperties(xhr, {
          responseText: { value: responseBody, configurable: true, writable: false },
          response: { value: responseBody, configurable: true, writable: false },
          status: { value: statusCode, configurable: true, writable: false },
          statusText: { value: statusCode === 200 ? 'OK' : 'Mocked', configurable: true, writable: false },
          readyState: { value: 4, configurable: true, writable: false }
        });
      } catch(e) {}

      if (xhr.onreadystatechange) {
        try { xhr.onreadystatechange.call(xhr); } catch(e) {}
      }
      try {
        xhr.dispatchEvent(new Event('readystatechange'));
        xhr.dispatchEvent(new Event('load'));
        xhr.dispatchEvent(new Event('loadend'));
      } catch(e) {}
      return;
    }

    return origSend.apply(this, arguments);
  }
})();
