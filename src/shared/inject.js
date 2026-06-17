(function() {
  'use strict';

  const INJECT_VERSION = '2026-06-17-mock-only-v1';
  if (window.__API_STUDIO_MOCK_INJECTED_VERSION__ === INJECT_VERSION) return;
  window.__API_STUDIO_MOCK_INJECTED__ = true;
  window.__API_STUDIO_MOCK_INJECTED_VERSION__ = INJECT_VERSION;

  // inject.js 运行在页面上下文，只通过 postMessage 向 content script 查询本地规则。
  // ====== 消息通信 ======
  let requestIdCounter = 0;
  const pendingRequests = new Map();

  function queryRule(url, method, body) {
    return new Promise((resolve) => {
      const requestId = 'req_' + (++requestIdCounter) + '_' + Date.now();
      pendingRequests.set(requestId, resolve);
      window.postMessage({
        type: '__MOCK_EXT_CHECK__',
        requestId: requestId,
        url: normalizeUrl(url),
        method: method,
        body: body || ''
      }, '*');
      setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          pendingRequests.delete(requestId);
          resolve({ rule: null });
        }
      }, 3000);
    });
  }

  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === '__MOCK_EXT_RESULT__') {
      const resolve = pendingRequests.get(event.data.requestId);
      if (resolve) {
        pendingRequests.delete(event.data.requestId);
        resolve({ rule: event.data.rule || null });
      }
    }
  });

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ====== 拦截 fetch ======
  // 这里不读取扩展存储，避免页面上下文直接依赖浏览器扩展 API。
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function(input, init) {
    let url = '';
    let method = 'GET';
    let bodyText = '';

    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof Request) {
      url = input.url;
      method = input.method || 'GET';
    } else if (input && typeof input === 'object') {
      url = input.url || '';
    }

    if (init) {
      if (init.method) method = init.method.toUpperCase();
      if (init.body) {
        bodyText = (typeof init.body === 'string') ? init.body
          : (init.body instanceof URLSearchParams) ? init.body.toString()
          : (init.body instanceof Blob) ? await init.body.text()
          : '';
      }
    } else if (input instanceof Request) {
      try {
        if (input.body) {
          const cloned = input.clone();
          bodyText = await cloned.text();
        }
      } catch(e) {}
    }

    let result;
    try {
      result = await queryRule(url, method, bodyText);
    } catch (e) {
      return originalFetch.call(window, input, init);
    }
    const rule = result && result.rule;
    if (rule) {
      const response = rule.response || {};
      if (rule.delay > 0) await delay(rule.delay);
      return new Response(response.body || '', {
        status: response.statusCode || 200,
        statusText: 'OK',
        headers: new Headers(response.headers || {'Content-Type': 'application/json'})
      });
    }
    return originalFetch.call(window, input, init);
  };

  // ====== 拦截 XMLHttpRequest ======
  const XHR = XMLHttpRequest;
  const origOpen = XHR.prototype.open;
  const origSend = XHR.prototype.send;
  const origSetRH = XHR.prototype.setRequestHeader;

  XHR.prototype.open = function(method, url, async, user, password) {
    this.__method = (method || 'GET').toUpperCase();
    this.__url = (typeof url === 'string') ? url : String(url || '');
    this.__async = (async !== false);
    this.__headers = {};
    this.__body = null;
    return origOpen.apply(this, arguments);
  };

  XHR.prototype.setRequestHeader = function(name, value) {
    if (this.__headers) this.__headers[name] = value;
    return origSetRH.apply(this, arguments);
  };

  XHR.prototype.send = async function(body) {
    this.__body = body || '';
    let bodyText = '';
    if (typeof body === 'string') bodyText = body;
    else if (body instanceof URLSearchParams) bodyText = body.toString();
    else if (body instanceof Blob || body instanceof ArrayBuffer) bodyText = '';
    else if (body instanceof Document) bodyText = '';
    else if (body !== null && body !== undefined) bodyText = String(body);

    let result;
    try {
      result = await queryRule(this.__url, this.__method, bodyText);
    } catch (e) {
      return origSend.apply(this, arguments);
    }
    const rule = result && result.rule;
    if (rule) {
      const response = rule.response || {};
      if (rule.delay > 0) await delay(rule.delay);

      const statusCode = response.statusCode || 200;
      const responseBody = response.body || '';
      const respHeaders = response.headers || {'Content-Type': 'application/json'};
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
  };
})();
