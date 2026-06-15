(function(global) {
  'use strict';

  var runtimeApi = global.browser || global.chrome;

  function lastError() {
    if (!global.chrome || !global.chrome.runtime) return null;
    return global.chrome.runtime.lastError || null;
  }

  function storageGet(keys) {
    return new Promise(function(resolve, reject) {
      if (!runtimeApi || !runtimeApi.storage || !runtimeApi.storage.local) {
        resolve({});
        return;
      }

      try {
        var maybePromise;
        if (runtimeApi === global.browser) {
          maybePromise = runtimeApi.storage.local.get(keys);
        } else {
          maybePromise = runtimeApi.storage.local.get(keys, function(result) {
            var err = lastError();
            if (err) reject(new Error(err.message));
            else resolve(result || {});
          });
        }
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.then(function(result) {
            resolve(result || {});
          }).catch(reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  function storageSet(values) {
    return new Promise(function(resolve, reject) {
      if (!runtimeApi || !runtimeApi.storage || !runtimeApi.storage.local) {
        resolve();
        return;
      }

      try {
        var maybePromise;
        if (runtimeApi === global.browser) {
          maybePromise = runtimeApi.storage.local.set(values);
        } else {
          maybePromise = runtimeApi.storage.local.set(values, function() {
            var err = lastError();
            if (err) reject(new Error(err.message));
            else resolve();
          });
        }
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.then(resolve).catch(reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  function sendMessage(message) {
    return new Promise(function(resolve, reject) {
      if (!runtimeApi || !runtimeApi.runtime || !runtimeApi.runtime.sendMessage) {
        resolve(undefined);
        return;
      }

      try {
        var maybePromise;
        if (runtimeApi === global.browser) {
          maybePromise = runtimeApi.runtime.sendMessage(message);
        } else {
          maybePromise = runtimeApi.runtime.sendMessage(message, function(response) {
            var err = lastError();
            if (err) reject(new Error(err.message));
            else resolve(response);
          });
        }
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.then(resolve).catch(reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  function getURL(path) {
    if (!runtimeApi || !runtimeApi.runtime || !runtimeApi.runtime.getURL) return path;
    return runtimeApi.runtime.getURL(path);
  }

  function addStorageChangedListener(listener) {
    if (!runtimeApi || !runtimeApi.storage || !runtimeApi.storage.onChanged) return;
    runtimeApi.storage.onChanged.addListener(listener);
  }

  function copyText(text) {
    if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
      return global.navigator.clipboard.writeText(text);
    }
    return new Promise(function(resolve, reject) {
      var textarea = global.document && global.document.createElement('textarea');
      if (!textarea || !global.document.body) {
        reject(new Error('当前环境不支持复制'));
        return;
      }
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      global.document.body.appendChild(textarea);
      textarea.select();
      try {
        if (global.document.execCommand('copy')) resolve();
        else reject(new Error('复制命令不可用'));
      } catch (error) {
        reject(error);
      } finally {
        textarea.remove();
      }
    });
  }

  global.ApiStudioCompat = {
    api: runtimeApi,
    storageGet: storageGet,
    storageSet: storageSet,
    sendMessage: sendMessage,
    getURL: getURL,
    addStorageChangedListener: addStorageChangedListener,
    copyText: copyText
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
