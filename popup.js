(function() {
  'use strict';

  var rules = [];
  var editingRule = null;
  var isEditMode = false;
  var DEFAULT_GROUP = '默认分组';
  var activeLocale = getInitialLocale();

  var I18N = {
    zh: {
      'lang.button': 'EN',
      'lang.title': 'Switch to English',
      'common.clear': '清空',
      'common.cancel': '取消',
      'common.confirm': '确定',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.close': '关闭',
      'common.notice': '提示',
      'common.ok': '知道了',
      'popup.newRule': '+ 新建规则',
      'popup.capturedTitle': '📡 从 F12 Network 捕获',
      'popup.emptyTitle': '暂无规则',
      'popup.emptyHint': '点击上方按钮添加接口模拟规则',
      'popup.statsEmpty': '共 0 条规则，0 条启用',
      'popup.statsShort': '共 0 条规则',
      'popup.stats': '共 {rules} 条规则，{enabled} 条启用',
      'popup.import': '导入',
      'popup.modalNew': '新建规则',
      'popup.modalEdit': '编辑规则',
      'popup.ruleName': '规则名称',
      'popup.ruleNamePlaceholder': '例如：用户信息接口模拟',
      'popup.method': '请求方法',
      'popup.anyMethod': '任意方法',
      'popup.urlPath': 'URL 路径',
      'popup.statusCode': '响应状态码',
      'popup.delay': '响应延迟 (毫秒)',
      'popup.headers': '响应头',
      'popup.addHeader': '+ 添加响应头',
      'popup.body': '响应体',
      'popup.responseBodyPlaceholder': '{"data": "模拟返回数据"}',
      'popup.formatJson': '格式化 JSON',
      'popup.deleteRule': '删除规则',
      'popup.saveRule': '保存规则',
      'popup.unnamedRule': '未命名规则',
      'popup.unnamed': '未命名',
      'popup.notSet': '(未设置)',
      'popup.deleteTitle': '删除规则',
      'popup.deleteConfirm': '确定删除规则「{name}」？',
      'popup.enterUrl': '请输入 URL 路径'
    },
    en: {
      'lang.button': '中文',
      'lang.title': '切换到中文',
      'common.clear': 'Clear',
      'common.cancel': 'Cancel',
      'common.confirm': 'OK',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.close': 'Close',
      'common.notice': 'Notice',
      'common.ok': 'Got it',
      'popup.newRule': '+ New rule',
      'popup.capturedTitle': '📡 Captured from F12 Network',
      'popup.emptyTitle': 'No rules yet',
      'popup.emptyHint': 'Click the button above to add an API mock rule',
      'popup.statsEmpty': '0 rules, 0 enabled',
      'popup.statsShort': '0 rules',
      'popup.stats': '{rules} rules, {enabled} enabled',
      'popup.import': 'Import',
      'popup.modalNew': 'New rule',
      'popup.modalEdit': 'Edit rule',
      'popup.ruleName': 'Rule name',
      'popup.ruleNamePlaceholder': 'e.g. User profile API mock',
      'popup.method': 'Request method',
      'popup.anyMethod': 'Any method',
      'popup.urlPath': 'URL path',
      'popup.statusCode': 'Response status code',
      'popup.delay': 'Response delay (ms)',
      'popup.headers': 'Response headers',
      'popup.addHeader': '+ Add response header',
      'popup.body': 'Response body',
      'popup.responseBodyPlaceholder': '{"data": "mock response"}',
      'popup.formatJson': 'Format JSON',
      'popup.deleteRule': 'Delete rule',
      'popup.saveRule': 'Save rule',
      'popup.unnamedRule': 'Unnamed rule',
      'popup.unnamed': 'Unnamed',
      'popup.notSet': '(Not set)',
      'popup.deleteTitle': 'Delete rule',
      'popup.deleteConfirm': 'Delete rule "{name}"?',
      'popup.enterUrl': 'Please enter a URL path'
    }
  };

  var $ = function(id) { return document.getElementById(id); };
  var ruleList = $('ruleList');
  var emptyState = $('emptyState');
  var statsText = $('statsText');
  var addRuleBtn = $('addRuleBtn');
  var languageToggleBtn = $('languageToggleBtn');
  var modalOverlay = $('modalOverlay');
  var modalTitle = $('modalTitle');
  var closeModalBtn = $('closeModalBtn');
  var cancelModalBtn = $('cancelModalBtn');
  var deleteRuleBtn = $('deleteRuleBtn');
  var saveRuleBtn = $('saveRuleBtn');
  var ruleName = $('ruleName');
  var ruleMethod = $('ruleMethod');
  var urlPattern = $('urlPattern');
  var responseStatus = $('responseStatus');
  var responseDelay = $('responseDelay');
  var headerRows = $('headerRows');
  var addHeaderBtn = $('addHeaderBtn');
  var responseBody = $('responseBody');
  var formatJsonBtn = $('formatJsonBtn');
  var captureSection = $('captureSection');
  var captureList = $('captureList');
  var clearCaptureBtn = $('clearCaptureBtn');

  function getInitialLocale() {
    try {
      var saved = localStorage.getItem('apiStudioLocale');
      if (saved === 'zh' || saved === 'en') return saved;
    } catch (e) {}
    var navLang = (navigator.language || '').toLowerCase();
    return navLang.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  function t(key, params) {
    var dict = I18N[activeLocale] || I18N.zh;
    var fallback = (I18N.zh && I18N.zh[key]) || key;
    var value = dict[key] || fallback;
    params = params || {};
    return String(value).replace(/\{(\w+)\}/g, function(match, name) {
      return params[name] !== undefined ? params[name] : match;
    });
  }

  function setLocale(locale) {
    activeLocale = locale === 'en' ? 'en' : 'zh';
    try { localStorage.setItem('apiStudioLocale', activeLocale); } catch (e) {}
    applyLocale();
    renderRules();
    loadCapturedRequests();
  }

  function applyLocale() {
    document.documentElement.lang = activeLocale === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    if (languageToggleBtn) {
      languageToggleBtn.textContent = t('lang.button');
      languageToggleBtn.title = t('lang.title');
    }
    localizeModalTitle();
    localizeStats();
  }

  function localizeModalTitle() {
    if (!modalTitle) return;
    modalTitle.textContent = isEditMode ? t('popup.modalEdit') : t('popup.modalNew');
  }

  function localizeStats() {
    if (!statsText) return;
    var enabled = rules.filter(function(r) { return r.enabled; }).length;
    statsText.textContent = rules.length === 0 ? t('popup.statsShort') : t('popup.stats', { rules: rules.length, enabled: enabled });
  }

  async function loadRules() {
    try {
      var resp = await ApiStudioCompat.sendMessage({ type: 'GET_ALL_RULES' });
      rules = (resp && resp.rules) || [];
    } catch(e) {
      rules = [];
    }
    renderRules();
  }

  function renderRules() {
    if (!ruleList) return;
    ruleList.innerHTML = '';
    if (rules.length === 0) {
      ruleList.appendChild(emptyState);
      localizeStats();
      return;
    }
    if (emptyState && emptyState.parentNode) emptyState.remove();
    rules.forEach(function(rule) {
      var item = document.createElement('div');
      item.className = 'rule-item' + (rule.enabled ? '' : ' disabled');
      item.dataset.ruleId = rule.id;
      var methodLabel = rule.method || 'ANY';
      var urlInfo = rule.url ? rule.url.pattern : '';
      item.innerHTML = [
        '<div class="rule-toggle" data-stop-prop="true"><label class="toggle"><input type="checkbox" ' + (rule.enabled ? 'checked' : '') + '><span class="toggle-slider"></span></label></div>',
        '<div class="rule-info">',
          '<div class="rule-name">' + escHtml(rule.name || t('popup.unnamedRule')) + '</div>',
          '<div class="rule-meta"><span class="rule-method ' + escAttr(methodLabel) + '">' + escHtml(methodLabel) + '</span><span class="rule-url">' + escHtml(truncateUrl(urlInfo)) + '</span></div>',
        '</div>',
        '<div class="rule-actions">',
          '<button class="btn-icon" data-action="edit" data-stop-prop="true" title="' + escAttr(t('common.edit')) + '">✎</button>',
          '<button class="btn-icon" data-action="delete" data-stop-prop="true" title="' + escAttr(t('common.delete')) + '">🗑</button>',
        '</div>'
      ].join('');

      item.querySelector('.toggle input').addEventListener('change', async function(e) {
        e.stopPropagation();
        await ApiStudioCompat.sendMessage({ type: 'TOGGLE_RULE', ruleId: rule.id, enabled: this.checked });
        await loadRules();
      });
      item.addEventListener('click', function(e) {
        if (e.target.closest('[data-stop-prop]')) return;
        openEditModal(rule.id);
      });
      item.querySelector('[data-action="edit"]').addEventListener('click', function(e) {
        e.stopPropagation();
        openEditModal(rule.id);
      });
      item.querySelector('[data-action="delete"]').addEventListener('click', async function(e) {
        e.stopPropagation();
        if (await appConfirm(t('popup.deleteTitle'), t('popup.deleteConfirm', { name: rule.name || t('popup.unnamed') }), t('common.delete'))) deleteRule(rule.id);
      });
      ruleList.appendChild(item);
    });
    localizeStats();
  }

  function truncateUrl(url) {
    if (!url) return t('popup.notSet');
    try {
      var u = new URL(url);
      return u.pathname + u.search;
    } catch(e) {
      return url.length > 35 ? url.substring(0, 35) + '...' : url;
    }
  }

  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function escAttr(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function isComposingEvent(e) {
    return !!(e && (e.isComposing || e.keyCode === 229 || e.which === 229));
  }

  function showAppDialog(options) {
    options = options || {};
    return new Promise(function(resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'app-dialog-overlay active';
      overlay.innerHTML =
        '<div class="app-dialog" role="dialog" aria-modal="true">' +
          '<div class="app-dialog-header"><div class="app-dialog-title">' + escHtml(options.title || t('common.notice')) + '</div><button class="app-dialog-close" type="button" aria-label="' + escAttr(t('common.close')) + '">×</button></div>' +
          '<div class="app-dialog-body">' + escHtml(options.message || '') + '</div>' +
          '<div class="app-dialog-footer">' +
            (options.type === 'alert' ? '' : '<button class="btn btn-secondary app-dialog-cancel" type="button">' + escHtml(t('common.cancel')) + '</button>') +
            '<button class="btn btn-primary app-dialog-ok" type="button">' + escHtml(options.okText || t('common.confirm')) + '</button>' +
          '</div>' +
        '</div>';
      var done = false;
      var closeBtn = overlay.querySelector('.app-dialog-close');
      var cancelBtn = overlay.querySelector('.app-dialog-cancel');
      var okBtn = overlay.querySelector('.app-dialog-ok');
      function cleanup(value) {
        if (done) return;
        done = true;
        document.removeEventListener('keydown', onKeyDown, true);
        overlay.remove();
        resolve(value);
      }
      function onKeyDown(e) {
        if (isComposingEvent(e)) return;
        if (e.key === 'Escape') { e.preventDefault(); cleanup(options.type === 'confirm' ? false : null); }
        if (e.key === 'Enter') { e.preventDefault(); cleanup(true); }
      }
      closeBtn.addEventListener('click', function() { cleanup(options.type === 'confirm' ? false : null); });
      if (cancelBtn) cancelBtn.addEventListener('click', function() { cleanup(false); });
      okBtn.addEventListener('click', function() { cleanup(true); });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) cleanup(options.type === 'confirm' ? false : null); });
      document.body.appendChild(overlay);
      document.addEventListener('keydown', onKeyDown, true);
      setTimeout(function() { okBtn.focus(); }, 0);
    });
  }

  function appConfirm(title, message, okText) {
    return showAppDialog({ type: 'confirm', title: title, message: message, okText: okText || t('common.confirm') });
  }

  function appAlert(title, message) {
    return showAppDialog({ type: 'alert', title: title, message: message, okText: t('common.ok') });
  }

  async function loadCapturedRequests() {
    try {
      var result = await ApiStudioCompat.storageGet('capturedRequests');
      renderCapturedRequests(result.capturedRequests || []);
    } catch(e) {
      if (captureSection) captureSection.style.display = 'none';
    }
  }

  function renderCapturedRequests(list) {
    if (!captureSection || !captureList) return;
    if (!list || list.length === 0) {
      captureSection.style.display = 'none';
      return;
    }
    captureSection.style.display = 'block';
    captureList.innerHTML = list.map(function(req) {
      var statusClass = 's' + Math.floor((req.status || 0) / 100) + 'xx';
      var methodClass = String(req.method || 'GET').toUpperCase();
      return [
        '<div class="capture-item" data-id="' + escAttr(req.id || '') + '" data-url="' + escAttr(req.url || '') + '" data-method="' + escAttr(req.method || '') + '">',
          '<span class="capture-method ' + escAttr(methodClass) + '">' + escHtml(req.method || 'GET') + '</span>',
          '<span class="capture-url" title="' + escAttr(req.url || '') + '">' + escHtml(shortenUrl(req.url || '')) + '</span>',
          '<span class="capture-status ' + escAttr(statusClass) + '">' + escHtml(String(req.status || 0)) + '</span>',
          '<button class="capture-import-btn">' + escHtml(t('popup.import')) + '</button>',
        '</div>'
      ].join('');
    }).join('');
  }

  function shortenUrl(url) {
    try {
      var u = new URL(url);
      var path = u.pathname;
      if (u.search) {
        var q = u.search.slice(0, 20);
        if (u.search.length > 20) q += '...';
        path += q;
      }
      return path;
    } catch(e) {
      return url.length > 40 ? url.substring(0, 40) + '...' : url;
    }
  }

  if (captureList) {
    captureList.addEventListener('click', function(e) {
      var btn = e.target.closest('.capture-import-btn');
      if (!btn) return;
      var item = btn.closest('.capture-item');
      var id = item.dataset.id;
      var url = item.dataset.url;
      var method = item.dataset.method;
      ApiStudioCompat.storageGet('capturedRequests').then(function(result) {
        var list = result.capturedRequests || [];
        var req = list.find(function(r) { return id ? r.id === id : (r.url === url && r.method === method); });
        if (!req) return;
        importCapturedRequest(req, function() {
          list = list.filter(function(r) { return r.id !== req.id; });
          ApiStudioCompat.storageSet({ capturedRequests: list }).then(function() {
            renderCapturedRequests(list);
            loadRules();
          });
        });
      }).catch(function() {});
    });
  }

  if (clearCaptureBtn) {
    clearCaptureBtn.addEventListener('click', function() {
      ApiStudioCompat.storageSet({ capturedRequests: [] }).then(function() {
        if (captureSection) captureSection.style.display = 'none';
      });
    });
  }

  function importCapturedRequest(req, callback) {
    var responseBodyText = req.responseContent || '';
    try { responseBodyText = JSON.stringify(JSON.parse(responseBodyText), null, 2); } catch(e) {}
    var headerObj = {};
    var resHeaders = req.resHeaders || {};
    headerObj['Content-Type'] = resHeaders['content-type'] || resHeaders['Content-Type'] || 'application/json';
    ['access-control-allow-origin', 'cache-control'].forEach(function(k) {
      if (resHeaders[k]) headerObj[k] = resHeaders[k];
    });
    var rule = {
      id: generateId(),
      name: methodAndName(req),
      enabled: true,
      method: req.method,
      url: { pattern: toMockPathPattern(req.url), matchType: 'contains' },
      bodyMatch: { enabled: false, field: '', value: '', matchType: 'contains' },
      response: { statusCode: req.status || 200, headers: headerObj, body: responseBodyText },
      delay: 0,
      createdAt: Date.now(),
      group: DEFAULT_GROUP
    };
    ApiStudioCompat.sendMessage({ type: 'SAVE_RULE', rule: rule }).then(function(resp) {
      if (resp && resp.success && callback) callback();
    }).catch(function() {});
  }

  function methodAndName(req) {
    try {
      var u = new URL(req.url);
      var parts = u.pathname.split('/').filter(Boolean);
      var last = parts[parts.length - 1] || 'api';
      return req.method + ' ' + last + ' - ' + parts.slice(-2).join('/');
    } catch(e) {
      return req.method + ' ' + String(req.url || '').substring(0, 30);
    }
  }

  function resetForm() {
    ruleName.value = '';
    ruleMethod.value = 'ANY';
    urlPattern.value = '';
    responseStatus.value = '200';
    responseDelay.value = '0';
    responseBody.value = '';
    headerRows.innerHTML = '';
    addHeaderRow('Content-Type', 'application/json');
    editingRule = null;
    isEditMode = false;
    deleteRuleBtn.style.display = 'none';
    localizeModalTitle();
  }

  function openEditModal(ruleId) {
    var rule = rules.find(function(r) { return r.id === ruleId; });
    if (!rule) return;
    isEditMode = true;
    editingRule = rule;
    localizeModalTitle();
    deleteRuleBtn.style.display = 'block';
    ruleName.value = rule.name || '';
    ruleMethod.value = rule.method || 'ANY';
    urlPattern.value = (rule.url && rule.url.pattern) || '';
    responseStatus.value = (rule.response && rule.response.statusCode) || '200';
    responseDelay.value = rule.delay || '0';
    responseBody.value = (rule.response && rule.response.body) || '';
    headerRows.innerHTML = '';
    var headers = (rule.response && rule.response.headers) || { 'Content-Type': 'application/json' };
    var entries = Object.entries(headers);
    if (entries.length === 0) addHeaderRow('', '');
    else entries.forEach(function(kv) { addHeaderRow(kv[0], kv[1]); });
    showModal();
  }

  function showModal() { modalOverlay.classList.add('active'); }
  function hideModal() { modalOverlay.classList.remove('active'); }

  if (headerRows) {
    headerRows.addEventListener('click', function(e) {
      if (e.target.classList.contains('remove-header-btn')) {
        var row = e.target.closest('.header-row');
        if (row) row.remove();
      }
    });
  }

  function addHeaderRow(key, value) {
    var row = document.createElement('div');
    row.className = 'header-row';
    row.innerHTML = [
      '<input type="text" class="form-input form-input-sm" placeholder="Key" value="' + escAttr(key || '') + '">',
      '<input type="text" class="form-input form-input-sm" placeholder="Value" value="' + escAttr(value || '') + '">',
      '<button class="btn-icon btn-icon-sm remove-header-btn" title="' + escAttr(t('common.delete')) + '">✕</button>'
    ].join('');
    headerRows.appendChild(row);
  }

  if (addHeaderBtn) addHeaderBtn.addEventListener('click', function() { addHeaderRow('', ''); });
  if (formatJsonBtn) formatJsonBtn.addEventListener('click', function() {
    try { responseBody.value = JSON.stringify(JSON.parse(responseBody.value), null, 2); } catch(e) {}
  });

  async function saveRule() {
    if (!urlPattern.value.trim()) {
      await appAlert(t('common.notice'), t('popup.enterUrl'));
      urlPattern.focus();
      return;
    }
    var headerObj = {};
    Array.prototype.slice.call(headerRows.querySelectorAll('.header-row')).forEach(function(row) {
      var inputs = row.querySelectorAll('input');
      var key = inputs[0].value.trim();
      var val = inputs[1].value.trim();
      if (key && val) headerObj[key] = val;
    });
    if (Object.keys(headerObj).length === 0) headerObj['Content-Type'] = 'application/json';
    var bodyText = responseBody.value;
    if (bodyText.trim()) { try { bodyText = JSON.stringify(JSON.parse(bodyText)); } catch(e) {} }
    var rule = {
      id: isEditMode ? editingRule.id : generateId(),
      name: ruleName.value.trim() || t('popup.unnamedRule'),
      enabled: isEditMode ? editingRule.enabled : true,
      method: ruleMethod.value,
      url: { pattern: toMockPathPattern(urlPattern.value), matchType: 'contains' },
      bodyMatch: { enabled: false, field: '', value: '', matchType: 'contains' },
      response: { statusCode: parseInt(responseStatus.value, 10) || 200, headers: headerObj, body: bodyText },
      delay: parseInt(responseDelay.value, 10) || 0,
      createdAt: isEditMode ? editingRule.createdAt : Date.now(),
      group: isEditMode ? (editingRule.group || DEFAULT_GROUP) : DEFAULT_GROUP
    };
    await ApiStudioCompat.sendMessage({ type: 'SAVE_RULE', rule: rule });
    hideModal();
    await loadRules();
  }

  async function deleteRule(ruleId) {
    await ApiStudioCompat.sendMessage({ type: 'DELETE_RULE', ruleId: ruleId });
    if (editingRule && editingRule.id === ruleId) hideModal();
    await loadRules();
  }

  function generateId() {
    return 'rule_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }

  function toMockPathPattern(value) {
    var raw = String(value || '').trim();
    if (!/^https?:\/\//i.test(raw)) return raw;
    try {
      var u = new URL(raw);
      return (u.pathname || '/') + (u.search || '');
    } catch(e) {
      return raw;
    }
  }

  if (languageToggleBtn) languageToggleBtn.addEventListener('click', function() {
    setLocale(activeLocale === 'zh' ? 'en' : 'zh');
  });
  if (addRuleBtn) addRuleBtn.addEventListener('click', function() { resetForm(); showModal(); });
  if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', hideModal);
  if (modalOverlay) modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) hideModal(); });
  if (saveRuleBtn) saveRuleBtn.addEventListener('click', saveRule);
  if (deleteRuleBtn) deleteRuleBtn.addEventListener('click', async function() {
    if (editingRule && await appConfirm(t('popup.deleteTitle'), t('popup.deleteConfirm', { name: editingRule.name || t('popup.unnamed') }), t('common.delete'))) deleteRule(editingRule.id);
  });

  document.addEventListener('keydown', function(e) {
    if (isComposingEvent(e)) return;
    if (e.key === 'Escape') hideModal();
    if (e.key === 'Enter' && modalOverlay.classList.contains('active') && e.target.tagName !== 'TEXTAREA') {
      if (e.target.closest('.modal')) { e.preventDefault(); saveRule(); }
    }
  });

  applyLocale();
  loadRules();
  loadCapturedRequests();
})();
