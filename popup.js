(function() {
  'use strict';

  var rules = [];
  var editingRule = null;
  var isEditMode = false;

  // DOM 引用
  var $ = function(id) { return document.getElementById(id); };
  var ruleList = $('ruleList');
  var emptyState = $('emptyState');
  var statsText = $('statsText');
  var addRuleBtn = $('addRuleBtn');
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

  // Capture 相关 DOM
  var captureSection = $('captureSection');
  var captureList = $('captureList');
  var clearCaptureBtn = $('clearCaptureBtn');

  // ====== 加载与渲染规则 ======
  async function loadRules() {
    try {
      var resp = await chrome.runtime.sendMessage({ type: 'GET_ALL_RULES' });
      rules = resp.rules || [];
    } catch(e) {
      rules = [];
    }
    renderRules();
  }

  function renderRules() {
    ruleList.innerHTML = '';
    var enabled = rules.filter(function(r) { return r.enabled; }).length;

    if (rules.length === 0) {
      ruleList.appendChild(emptyState);
      statsText.textContent = '共 0 条规则';
      return;
    }

    if (emptyState.parentNode) emptyState.remove();

    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      var item = document.createElement('div');
      item.className = 'rule-item' + (rule.enabled ? '' : ' disabled');
      item.dataset.ruleId = rule.id;

      var methodLabel = rule.method || 'ANY';
      var urlInfo = rule.url ? rule.url.pattern : '';
      item.innerHTML = [
        '<div class="rule-toggle" data-stop-prop="true">',
          '<label class="toggle">',
            '<input type="checkbox" ' + (rule.enabled ? 'checked' : '') + '>',
            '<span class="toggle-slider"></span>',
          '</label>',
        '</div>',
        '<div class="rule-info">',
          '<div class="rule-name">' + escHtml(rule.name || '未命名规则') + '</div>',
          '<div class="rule-meta">',
            '<span class="rule-method ' + methodLabel + '">' + methodLabel + '</span>',
            '<span class="rule-url">' + escHtml(truncateUrl(urlInfo)) + '</span>',
          '</div>',
        '</div>',
        '<div class="rule-actions">',
          '<button class="btn-icon" data-action="edit" data-stop-prop="true" title="编辑">✎</button>',
          '<button class="btn-icon" data-action="delete" data-stop-prop="true" title="删除">🗑</button>',
        '</div>'
      ].join('');

      (function(ruleId) {
        var toggle = item.querySelector('.toggle input');
        toggle.addEventListener('change', async function(e) {
          e.stopPropagation();
          await chrome.runtime.sendMessage({ type: 'TOGGLE_RULE', ruleId: ruleId, enabled: this.checked });
          await loadRules();
        });

        item.addEventListener('click', function(e) {
          if (e.target.closest('[data-stop-prop]')) return;
          openEditModal(ruleId);
        });

        item.querySelector('[data-action="edit"]').addEventListener('click', function(e) {
          e.stopPropagation();
          openEditModal(ruleId);
        });

        item.querySelector('[data-action="delete"]').addEventListener('click', async function(e) {
          e.stopPropagation();
          if (await appConfirm('删除规则', '确定删除规则「' + (rule.name || '未命名') + '」？', '删除')) deleteRule(ruleId);
        });
      })(rule.id);

      ruleList.appendChild(item);
    }

    statsText.textContent = '共 ' + rules.length + ' 条规则，' + enabled + ' 条启用';
  }

  function truncateUrl(url) {
    if (!url) return '(未设置)';
    try {
      var u = new URL(url);
      return u.pathname + u.search;
    } catch(e) {
      return url.length > 35 ? url.substring(0, 35) + '…' : url;
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
          '<div class="app-dialog-header">' +
            '<div class="app-dialog-title">' + escHtml(options.title || '提示') + '</div>' +
            '<button class="app-dialog-close" type="button" aria-label="关闭">×</button>' +
          '</div>' +
          '<div class="app-dialog-body">' + escHtml(options.message || '') + '</div>' +
          '<div class="app-dialog-footer">' +
            (options.type === 'alert' ? '' : '<button class="btn btn-secondary app-dialog-cancel" type="button">取消</button>') +
            '<button class="btn btn-primary app-dialog-ok" type="button">' + escHtml(options.okText || '确定') + '</button>' +
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
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanup(options.type === 'confirm' ? false : null);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          cleanup(true);
        }
      }

      closeBtn.addEventListener('click', function() {
        cleanup(options.type === 'confirm' ? false : null);
      });
      if (cancelBtn) {
        cancelBtn.addEventListener('click', function() { cleanup(false); });
      }
      okBtn.addEventListener('click', function() { cleanup(true); });
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) cleanup(options.type === 'confirm' ? false : null);
      });

      document.body.appendChild(overlay);
      document.addEventListener('keydown', onKeyDown, true);
      setTimeout(function() { okBtn.focus(); }, 0);
    });
  }

  function appConfirm(title, message, okText) {
    return showAppDialog({ type: 'confirm', title: title, message: message, okText: okText || '确定' });
  }

  function appAlert(title, message) {
    return showAppDialog({ type: 'alert', title: title, message: message, okText: '知道了' });
  }

  // ====== 捕获请求显示 ======
  async function loadCapturedRequests() {
    try {
      var result = await new Promise(function(resolve) {
        chrome.storage.local.get('capturedRequests', resolve);
      });
      var list = result.capturedRequests || [];
      renderCapturedRequests(list);
    } catch(e) {
      captureSection.style.display = 'none';
    }
  }

  function renderCapturedRequests(list) {
    if (!list || list.length === 0) {
      captureSection.style.display = 'none';
      return;
    }

    captureSection.style.display = 'block';
    captureList.innerHTML = list.map(function(req) {
      var shortUrl = shortenUrl(req.url);
      var statusClass = 's' + Math.floor(req.status / 100) + 'xx';
      var methodClass = req.method.toUpperCase();
      return [
        '<div class="capture-item" data-id="' + escAttr(req.id || '') + '" data-url="' + escAttr(req.url) + '" data-method="' + escAttr(req.method) + '">',
          '<span class="capture-method ' + methodClass + '">' + req.method + '</span>',
          '<span class="capture-url" title="' + escAttr(req.url) + '">' + escHtml(shortUrl) + '</span>',
          '<span class="capture-status ' + statusClass + '">' + req.status + '</span>',
          '<button class="capture-import-btn">导入</button>',
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
        if (u.search.length > 20) q += '…';
        path += q;
      }
      return path;
    } catch(e) {
      return url.length > 40 ? url.substring(0, 40) + '…' : url;
    }
  }

  // ====== 导入捕获的请求 ======
  captureList.addEventListener('click', function(e) {
    var btn = e.target.closest('.capture-import-btn');
    if (!btn) return;

    var item = btn.closest('.capture-item');
    var id = item.dataset.id;
    var url = item.dataset.url;
    var method = item.dataset.method;

    // Find the full request data from storage
    chrome.storage.local.get('capturedRequests', function(result) {
      var list = result.capturedRequests || [];
      var req = list.find(function(r) { return id ? r.id === id : (r.url === url && r.method === method); });
      if (!req) return;

      importCapturedRequest(req, function() {
        // Remove from storage after import
        list = list.filter(function(r) { return r.id !== req.id; });
        chrome.storage.local.set({ capturedRequests: list }, function() {
          renderCapturedRequests(list);
          loadRules();
        });
      });
    });
  });

  // 清空捕获列表
  clearCaptureBtn.addEventListener('click', function() {
    chrome.storage.local.set({ capturedRequests: [] }, function() {
      captureSection.style.display = 'none';
    });
  });

  function importCapturedRequest(req, callback) {
    var responseBody = req.responseContent || '';
    try { responseBody = JSON.stringify(JSON.parse(responseBody), null, 2); } catch(e) {}

    var headerObj = {};
    var resHeaders = req.resHeaders || {};
    var ct = resHeaders['content-type'] || resHeaders['Content-Type'] || 'application/json';
    headerObj['Content-Type'] = ct;
    ['access-control-allow-origin', 'cache-control'].forEach(function(k) {
      if (resHeaders[k]) headerObj[k] = resHeaders[k];
    });

    var name = methodAndName(req);
    var rule = {
      id: 'rule_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      name: name,
      enabled: true,
      method: req.method,
      url: { pattern: toMockPathPattern(req.url), matchType: 'contains' },
      bodyMatch: { enabled: false, field: '', value: '', matchType: 'contains' },
      response: {
        statusCode: req.status || 200,
        headers: headerObj,
        body: responseBody
      },
      delay: 0,
      createdAt: Date.now(),
      group: '默认分组'
    };

    chrome.runtime.sendMessage({ type: 'SAVE_RULE', rule: rule }, function(resp) {
      if (resp && resp.success && callback) callback();
    });
  }

  function methodAndName(req) {
    try {
      var u = new URL(req.url);
      var parts = u.pathname.split('/').filter(Boolean);
      var last = parts[parts.length - 1] || 'api';
      return req.method + ' ' + last + ' — ' + parts.slice(-2).join('/');
    } catch(e) {
      return req.method + ' ' + req.url.substring(0, 30);
    }
  }

  // ====== 弹窗操作 ======
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
    modalTitle.textContent = '新建规则';
  }

  function openEditModal(ruleId) {
    var rule = rules.find(function(r) { return r.id === ruleId; });
    if (!rule) return;

    isEditMode = true;
    editingRule = rule;
    modalTitle.textContent = '编辑规则';
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
    if (entries.length === 0) {
      addHeaderRow('', '');
    } else {
      entries.forEach(function(kv) { addHeaderRow(kv[0], kv[1]); });
    }

    showModal();
  }

  function showModal() { modalOverlay.classList.add('active'); }
  function hideModal() { modalOverlay.classList.remove('active'); }

  // ====== 表单操作 ======
  headerRows.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-header-btn')) {
      var row = e.target.closest('.header-row');
      if (row) row.remove();
    }
  });

  function addHeaderRow(key, value) {
    var row = document.createElement('div');
    row.className = 'header-row';
    row.innerHTML = [
      '<input type="text" class="form-input form-input-sm" placeholder="Key" value="' + escHtml(key || '') + '">',
      '<input type="text" class="form-input form-input-sm" placeholder="Value" value="' + escHtml(value || '') + '">',
      '<button class="btn-icon btn-icon-sm remove-header-btn">✕</button>'
    ].join('');
    headerRows.appendChild(row);
  }

  addHeaderBtn.addEventListener('click', function() { addHeaderRow('', ''); });

  formatJsonBtn.addEventListener('click', function() {
    try {
      var obj = JSON.parse(responseBody.value);
      responseBody.value = JSON.stringify(obj, null, 2);
    } catch(e) {}
  });

  // ====== 保存规则 ======
  async function saveRule() {
    if (!urlPattern.value.trim()) {
      await appAlert('提示', '请输入 URL 路径');
      urlPattern.focus();
      return;
    }

    var headerObj = {};
    var rows = headerRows.querySelectorAll('.header-row');
    for (var i = 0; i < rows.length; i++) {
      var inputs = rows[i].querySelectorAll('input');
      var key = inputs[0].value.trim();
      var val = inputs[1].value.trim();
      if (key && val) headerObj[key] = val;
    }
    if (Object.keys(headerObj).length === 0) {
      headerObj['Content-Type'] = 'application/json';
    }

    var bodyText = responseBody.value;
    if (bodyText.trim()) {
      try { bodyText = JSON.stringify(JSON.parse(bodyText)); } catch(e) {}
    }

    var rule = {
      id: isEditMode ? editingRule.id : generateId(),
      name: ruleName.value.trim() || '未命名规则',
      enabled: isEditMode ? editingRule.enabled : true,
      method: ruleMethod.value,
      url: { pattern: toMockPathPattern(urlPattern.value), matchType: 'contains' },
      bodyMatch: { enabled: false, field: '', value: '', matchType: 'contains' },
      response: {
        statusCode: parseInt(responseStatus.value) || 200,
        headers: headerObj,
        body: bodyText
      },
      delay: parseInt(responseDelay.value) || 0,
      createdAt: isEditMode ? editingRule.createdAt : Date.now(),
      group: isEditMode ? (editingRule.group || '默认分组') : '默认分组'
    };

    await chrome.runtime.sendMessage({ type: 'SAVE_RULE', rule: rule });
    hideModal();
    await loadRules();
  }

  async function deleteRule(ruleId) {
    await chrome.runtime.sendMessage({ type: 'DELETE_RULE', ruleId: ruleId });
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

  // ====== 事件绑定 ======
  addRuleBtn.addEventListener('click', function() { resetForm(); showModal(); });
  closeModalBtn.addEventListener('click', hideModal);
  cancelModalBtn.addEventListener('click', hideModal);

  modalOverlay.addEventListener('click', function(e) {
    if (e.target === this) hideModal();
  });

  saveRuleBtn.addEventListener('click', saveRule);

  deleteRuleBtn.addEventListener('click', async function() {
    if (editingRule && await appConfirm('删除规则', '确定删除规则「' + editingRule.name + '」？', '删除')) deleteRule(editingRule.id);
  });

  document.addEventListener('keydown', function(e) {
    if (isComposingEvent(e)) return;
    if (e.key === 'Escape') hideModal();
    if (e.key === 'Enter' && modalOverlay.classList.contains('active') && e.target.tagName !== 'TEXTAREA') {
      if (e.target.closest('.modal')) { e.preventDefault(); saveRule(); }
    }
  });

  // ====== 初始化 ======
  loadRules();
  loadCapturedRequests();
})();
