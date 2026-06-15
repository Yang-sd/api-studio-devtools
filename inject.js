(function() {
  'use strict';

  const INJECT_VERSION = '2026-06-12-basic-throttle-no-timeout-v4';
  if (window.__API_STUDIO_MOCK_INJECTED_VERSION__ === INJECT_VERSION) return;
  window.__API_STUDIO_MOCK_INJECTED__ = true;
  window.__API_STUDIO_MOCK_INJECTED_VERSION__ = INJECT_VERSION;

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
          resolve({ rule: null, throttle: null });
        }
      }, 3000);
    });
  }

  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === '__MOCK_EXT_RESULT__') {
      const resolve = pendingRequests.get(event.data.requestId);
      if (resolve) {
        pendingRequests.delete(event.data.requestId);
        resolve({
          rule: event.data.rule || null,
          throttle: event.data.throttle || null
        });
      }
    }
  });

  // ====== 处理响应延迟 ======
  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function normalizeUrl(url) {
    try {
      return new URL(String(url || ''), window.location.href).href;
    } catch (e) {
      return String(url || '');
    }
  }

  async function applyThrottleBeforeFetch(profile, body) {
    if (!profile) return;
    const roundTripDelay = Math.max(0, (Number(profile.latency) || 0) + randomJitter(profile.jitterMs));
    let wait = roundTripDelay;
    wait += transferDelayMs(body, profile.uploadKbps);
    if (wait > 0) await delay(wait);
  }

  async function applyThrottleAfterFetch(profile, body) {
    if (!profile) return;
    const wait = transferDelayMs(body, profile.downloadKbps);
    if (wait > 0) await delay(wait);
  }

  function randomJitter(jitterMs) {
    jitterMs = Math.max(0, Number(jitterMs) || 0);
    if (!jitterMs) return 0;
    return Math.round((Math.random() * 2 - 1) * jitterMs);
  }

  function transferDelayMs(payload, kbps) {
    kbps = Number(kbps) || 0;
    if (!kbps || kbps <= 0) return 0;
    const bytes = payloadByteLength(payload);
    if (!bytes) return 0;
    return Math.max(0, Math.round(bytes * 8 / (kbps * 1000) * 1000));
  }

  function payloadByteLength(payload) {
    if (!payload) return 0;
    if (typeof payload === 'string') {
      try { return new TextEncoder().encode(payload).length; } catch (e) { return payload.length; }
    }
    if (payload instanceof Blob) return payload.size || 0;
    if (payload instanceof ArrayBuffer) return payload.byteLength || 0;
    if (payload instanceof URLSearchParams) return payload.toString().length;
    return String(payload).length;
  }

  function clampNumber(value, min, max) {
    if (!isFinite(value)) value = min;
    return Math.min(max, Math.max(min, value));
  }

  function createThrottleFetchError(message) {
    return new TypeError(message || '弱网模拟: 请求失败');
  }

  function dispatchXhrError(xhr, message) {
    try {
      Object.defineProperties(xhr, {
        responseText: { value: '', configurable: true, writable: false },
        response: { value: '', configurable: true, writable: false },
        status: { value: 0, configurable: true, writable: false },
        statusText: { value: message || 'Throttle Error', configurable: true, writable: false },
        readyState: { value: 4, configurable: true, writable: false }
      });
    } catch (e) {}
    if (xhr.onreadystatechange) {
      try { xhr.onreadystatechange.call(xhr); } catch (e) {}
    }
    try {
      xhr.dispatchEvent(new Event('readystatechange'));
      xhr.dispatchEvent(new Event('error'));
      xhr.dispatchEvent(new Event('loadend'));
    } catch (e) {}
  }

  // ====== 拦截 fetch ======
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
    const throttle = result && result.throttle;
    if (rule) {
      const response = rule.response || {};
      try {
        await applyThrottleBeforeFetch(throttle, bodyText);
      } catch (error) {
        throw createThrottleFetchError(error.message);
      }
      if (rule.delay > 0) await delay(rule.delay);
      try {
        await applyThrottleAfterFetch(throttle, response.body || '');
      } catch (error) {
        throw createThrottleFetchError(error.message);
      }
      return new Response(response.body || '', {
        status: response.statusCode || 200,
        statusText: 'OK',
        headers: new Headers(response.headers || {'Content-Type': 'application/json'})
      });
    }
    try {
      await applyThrottleBeforeFetch(throttle, bodyText);
    } catch (error) {}
    const response = await originalFetch.call(window, input, init);
    if (throttle && throttle.downloadKbps) {
      let text;
      try {
        const cloned = response.clone();
        text = await cloned.text();
      } catch (e) {
        return response;
      }
      try {
        await applyThrottleAfterFetch(throttle, text);
      } catch (error) {}
    }
    return response;
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
    const throttle = result && result.throttle;
    if (rule) {
      const response = rule.response || {};
      try {
        await applyThrottleBeforeFetch(throttle, bodyText);
      } catch (error) {
        dispatchXhrError(this, error.message);
        return;
      }
      if (rule.delay > 0) await delay(rule.delay);

      const statusCode = response.statusCode || 200;
      const responseBody = response.body || '';
      const respHeaders = response.headers || {'Content-Type': 'application/json'};
      const xhr = this;
      try {
        await applyThrottleAfterFetch(throttle, responseBody);
      } catch (error) {
        dispatchXhrError(this, error.message);
        return;
      }

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

    try {
      await applyThrottleBeforeFetch(throttle, bodyText);
    } catch (error) {}
    return origSend.apply(this, arguments);
  };
})();
